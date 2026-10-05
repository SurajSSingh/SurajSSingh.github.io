import { deepStrictEqual, equal, ok } from "node:assert/strict";
import lumeCMS from "lume/cms/mod.ts";
import { prepareField } from "lume/cms/core/utils/data.ts";
import { Page } from "lume/core/file.ts";
import Searcher from "lume/core/searcher.ts";
import { engine } from "lume/deps/vento.ts";
import cmsConfig, { ProjectStorage } from "../_cms.ts";

Deno.test("CMS relations use frontmatter IDs and survive save/reopen", async () => {
  const root = await Deno.makeTempDir({ prefix: "cms-relations-" });
  try {
    for (const directory of ["org", "skill", "project"]) {
      await Deno.mkdir(`${root}/${directory}`);
    }
    for (
      const [path, frontmatter] of Object.entries({
        "org/organization-title.md": "title: Organization Title\nid: p1",
        "skill/engine-title.md": "title: Engine Title\nid: unity",
        "skill/language-title.md": "title: Language Title\nid: rust",
        "skill/missing-id.md": "title: Missing ID",
        "skill/empty-id.md": 'title: Empty ID\nid: ""',
        "project/existing-project.md":
          "title: Existing Project\norg: freelance\nproject_link: https://example.com\nproject_info:\n  role: Developer\n  external_links:\n    main: https://example.com",
        "project/index.md": "title: Projects\nlayout: projects_list.vto",
        "project/index-tool.md": "title: Index Tool",
      })
    ) {
      await Deno.writeTextFile(`${root}/${path}`, `---\n${frontmatter}\n---\n`);
    }

    const cms = lumeCMS({ root }).storage("src", ".")
      .storage("projects", new ProjectStorage(root));
    for (const upload of cmsConfig.uploads.values()) {
      cms.upload(upload);
    }
    for (const collection of cmsConfig.collections.values()) {
      cms.collection(collection);
    }
    cms.document(cmsConfig.documents.get("portfolio-page")!);
    const content = cms.initContent();
    const projects = content.collections.projects;
    const projectNames = [];
    for await (const entry of projects) projectNames.push(entry.name);
    deepStrictEqual(projectNames.sort(), [
      "existing-project.md",
      "index-tool.md",
    ]);
    const portfolio = content.documents["portfolio-page"];
    equal((await portfolio.read()).root.title, "Projects");
    await portfolio.write({
      root: { summary: "Updated portfolio introduction" },
    }, content);
    equal((await portfolio.read()).root.layout, "projects_list.vto");
    const document = projects.create("fixture.md");

    const relationFields = async () => {
      const prepared = await prepareField(
        projects.fields!,
        content,
        await document.read(true),
        document,
      );
      ok("fields" in prepared);
      const org = prepared.fields.find((field) => field.name === "org_id");
      const skills = prepared.fields.find((field) => field.name === "skill_id");
      equal(String(org?.type), "relation");
      ok(org && "options" in org);
      ok(skills?.type === "relation-list");
      return {
        org: org.options?.map((option) =>
          typeof option === "object" ? option.value : option
        ),
        skills: skills.options?.map((option) =>
          typeof option === "object" ? option.value : option
        ),
      };
    };

    const fields = await relationFields();
    deepStrictEqual(fields.org, ["p1"]);
    deepStrictEqual(fields.skills, [
      "unity",
      "rust",
    ]);

    await document.write(
      {
        root: {
          title: "Fixture",
          id: "fixture",
          type: "project",
          date: "2026-10-04",
          summary: "Client project created in the CMS",
          links: { "0": { name: "Home", link: "https://example.com/client" } },
          cover_image: {
            file: { current: "/assets/images/client.png" },
            alt_text: "Client project screenshot",
          },
          highlighted_project: "true",
          content: "## Client work\n\nWhat I built and delivered.",
          org_id: fields.org![0],
          skill_id: { "0": "unity", "1": "rust" },
        },
      },
      content,
      true,
    );

    const reopened = projects.get(document.name);
    const { root: saved } = await reopened.read();
    equal(saved.org_id, "p1");
    deepStrictEqual(saved.skill_id, ["unity", "rust"]);
    equal(saved.type, "project");
    deepStrictEqual(saved.links, [{
      name: "Home",
      link: "https://example.com/client",
    }]);
    equal(saved.cover_image.file, "/assets/images/client.png");
    equal(saved.highlighted_project, true);
    ok(saved.content.includes("What I built and delivered."));

    await reopened.write({
      root: { org_id: "p1", skill_id: { "0": "rust" } },
    }, content);
    const { root: updated } = await reopened.read();
    equal(updated.org_id, "p1");
    deepStrictEqual(updated.skill_id, ["rust"]);

    await Deno.writeTextFile(
      `${root}/skill/new-language.md`,
      "---\ntitle: New Language\nid: typescript\n---\n",
    );
    const refreshed = await relationFields();
    ok(refreshed.skills?.includes("typescript"));
    ok(refreshed.skills?.includes(updated.skill_id[0]));

    const existing = projects.get("existing-project.md");
    const existingData = await existing.read();
    await prepareField(projects.fields!, content, existingData, existing);
    equal(existingData.root.id, "existing-project");
    existingData.root.id = "stable-project-id";
    await prepareField(projects.fields!, content, existingData, existing);
    equal(existingData.root.id, "stable-project-id");
    await existing.write({
      root: {
        summary: "Updated in the CMS",
        project_info: { role: "Lead Developer" },
      },
    }, content);
    const { root: legacy } = await existing.read();
    equal(legacy.summary, "Updated in the CMS");
    equal(legacy.org, "freelance");
    equal(legacy.project_link, "https://example.com");
    equal(legacy.project_info.role, "Lead Developer");
    equal(legacy.project_info.external_links.main, "https://example.com");
  } finally {
    await Deno.remove(root, { recursive: true });
  }
});

const templates = engine({
  includes: {
    resolve: (_from, file) => file,
    async load(file) {
      // Isolate list selection from shared layout and card presentation.
      if (file === "layout.vto") return { source: "{{ content }}" };
      if (file === "layouts/website/components/project_card.vto") {
        return { source: '<article data-project="{{ title }}"></article>' };
      }
      return {
        source: await Deno.readTextFile(
          new URL(`../src/_includes/${file}`, import.meta.url),
        ),
      };
    },
  },
});

async function renderList(
  file: string,
  projects: Record<string, unknown>[],
  data: Record<string, unknown> = {},
) {
  const search = new Searcher({
    pages: projects.map((project, index) =>
      Page.create({ url: `/project/${index}/`, type: "project", ...project })
    ),
    files: [],
    sourceData: new Map(),
  });
  return (await templates.run(`layouts/website/${file}`, { ...data, search }))
    .content;
}

function projectTitles(html: string) {
  return [...html.matchAll(/data-project="([^"]+)"/g)].map((match) => match[1]);
}

Deno.test("organization lists prefer new IDs and preserve legacy projects", async () => {
  const html = await renderList("org_page.vto", [
    { title: "Legacy", org: "p1", weight: 2 },
    { title: "New", org_id: "p1", weight: 1 },
    { title: "Both", org: "p1", org_id: "p1", weight: 3 },
    { title: "Moved", org: "p1", org_id: "uci" },
    { title: "Unrelated" },
  ], { id: "p1", title: "P1" });
  deepStrictEqual(projectTitles(html), ["New", "Legacy", "Both"]);
});

Deno.test("skill lists match ID arrays and legacy labels without duplicates", async () => {
  const html = await renderList("skill_page.vto", [
    { title: "Legacy ID", skills: ["unity"], weight: 3 },
    { title: "Legacy Label", skills: ["Unity"], weight: 2 },
    { title: "New", skill_id: ["rust", "unity"], weight: 1 },
    { title: "Both", skill_id: ["unity"], skills: ["Unity"], weight: 4 },
    { title: "Unrelated", skill_id: ["rust"], skills: [] },
    { title: "No Skills" },
  ], { id: "unity", title: "Unity" });
  deepStrictEqual(projectTitles(html), [
    "New",
    "Legacy Label",
    "Legacy ID",
    "Both",
  ]);
});

Deno.test("portfolio groups support relation-only projects and new organizations", async () => {
  const html = await renderList("components/projects_list.vto", [
    { title: "Legacy", org: "personal" },
    { title: "Freelance", org_id: "freelance" },
    { title: "P1", org_id: "p1" },
    { title: "Teaching", org_id: "coding-minds" },
    { title: "Moved to School", org: "p1", org_id: "uci" },
    { title: "Graduate", org_id: "uiuc" },
    { title: "New Organization", org_id: "new-org" },
    { title: "No Organization" },
    { title: "About", type: "page", url: "/about/" },
    { title: "Project Index", type: "page", url: "/project/" },
  ], { content: "<p>Portfolio introduction from the CMS</p>" });
  ok(html.includes("<p>Portfolio introduction from the CMS</p>"));
  const titles = projectTitles(html);
  equal(titles.length, 8);
  equal(new Set(titles).size, 8);
  const [beforeSchool, afterSchool] = html.split("<h2>School Projects</h2>");
  ok(!projectTitles(beforeSchool).includes("Moved to School"));
  ok(projectTitles(afterSchool).includes("Moved to School"));
  const [, other] = html.split("<h2>Other Projects</h2>");
  deepStrictEqual(projectTitles(other), [
    "New Organization",
    "No Organization",
  ]);
});

Deno.test("freelance leads the portfolio with Speakflow followed by P1 projects", async () => {
  const html = await renderList("components/projects_list.vto", [
    { title: "Personal", org: "personal", weight: -30 },
    { title: "Freelance", org_id: "freelance", weight: 0 },
    { title: "Keito", org: "p1", weight: -10 },
    { title: "P1 New", org_id: "p1", weight: -5 },
    { title: "Speakflow", org_id: "speakflow", weight: -20 },
    { title: "Other", org_id: "new-org" },
  ]);
  const [freelance, remainder] = html.split("<h2>Personal Projects</h2>");
  ok(freelance.includes("<h2>Freelance</h2>"));
  deepStrictEqual(projectTitles(freelance), [
    "Speakflow",
    "Keito",
    "P1 New",
    "Freelance",
  ]);
  deepStrictEqual(projectTitles(remainder), ["Personal", "Other"]);
  ok(!html.includes("<h2>P1 Games:</h2>"));
});

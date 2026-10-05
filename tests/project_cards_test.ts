import { deepStrictEqual, equal, match, ok } from "node:assert/strict";
import { engine } from "lume/deps/vento.ts";

const templates = engine({
  includes: {
    resolve: (_from, file) => file,
    async load(file) {
      return {
        source: await Deno.readTextFile(
          new URL(`../src/_includes/${file}`, import.meta.url),
        ),
      };
    },
  },
});
templates.filters.icon = (name: string, collection: string) =>
  `/icons/${collection}/${name}.svg`;

async function renderCard(
  variant: string,
  data: Record<string, unknown> = {},
) {
  return (await templates.run(
    `layouts/website/components/${variant}.vto`,
    {
      title: "Fixture Project",
      summary: "Fixture summary",
      url: "/project/fixture/",
      assets: "/assets",
      ...data,
    },
  )).content;
}

function imageSources(html: string) {
  return [...html.matchAll(/<img\b[^>]*\bsrc=["']([^"']*)["']/g)].map(
    (match) => match[1],
  );
}

for (const variant of ["project_card", "portfolio_card"]) {
  Deno.test(`${variant} renders CMS-only links and cover without project_info`, async () => {
    const links = [
      { name: "GitHub Repo", link: "https://example.com/repo" },
      { name: "Home", link: "https://example.com/home" },
      { name: "Itch.io", link: "https://example.com/itch" },
      { name: "GitLab Repo", link: "https://example.com/gitlab" },
      { name: "Other", link: "https://example.com/other" },
      { name: "Incomplete", link: "" },
    ];
    const html = await renderCard(variant, {
      links,
      cover_image: {
        file: "/assets/images/current-cover.png",
        alt_text: "Current cover description",
      },
    });
    for (const { name, link } of links.filter((item) => item.link)) {
      ok(html.includes(`href="${link}"`));
      ok(html.includes(name));
    }
    ok(!html.includes("Incomplete"));
    ok(imageSources(html).includes("/assets/images/current-cover.png"));
    match(html, /alt="Current cover description"/);
    ok(!html.includes("Role:"));
    if (variant === "project_card") {
      match(html, /href="https:\/\/example.com\/home"[^>]*>\s*<h3/);
    } else {
      ok(imageSources(html).includes("/icons/simpleicons/github.svg"));
      ok(imageSources(html).includes("/icons/simpleicons/itchdotio.svg"));
      ok(imageSources(html).every(Boolean));
    }
  });

  Deno.test(`${variant} prefers CMS cover and links over stale legacy fields`, async () => {
    const html = await renderCard(variant, {
      links: [{ name: "Other", link: "https://example.com/current" }],
      project_link: "https://example.com/old-project",
      link: "https://example.com/old-link",
      image: "/assets/old-cover.png",
      alt: "Old cover description",
      cover_image: {
        file: "/assets/new-cover.png",
        alt_text: "New cover description",
      },
      project_info: {
        external_links: { main: "https://example.com/old-home" },
      },
    });
    ok(html.includes('href="https://example.com/current"'));
    ok(imageSources(html).includes("/assets/new-cover.png"));
    match(html, /alt="New cover description"/);
    ok(!html.includes("old-cover"));
    ok(!html.includes("old-home"));
    ok(!html.includes("old-project"));
    ok(!html.includes("old-link"));
  });

  Deno.test(`${variant} omits missing images and safely handles optional metadata`, async () => {
    for (const project_info of [undefined, null, {}]) {
      const html = await renderCard(variant, {
        project_info,
        cover_image: { file: "", alt_text: "No image" },
        image: "",
        links: [{ name: "Incomplete" }],
        additional_image: [{ is_award: true, link: "" }],
      });
      ok(!html.includes("<img"));
      ok(!html.includes('href=""'));
      ok(!html.includes("Role:"));
      ok(!html.includes("Awards:"));
      ok(!html.includes("Links:"));
      ok(html.includes("Fixture summary"));
    }
  });

  Deno.test(`${variant} falls back to legacy cover when CMS cover is empty`, async () => {
    const html = await renderCard(variant, {
      cover_image: {},
      image: "/assets/legacy.png",
      alt: "Legacy image description",
    });
    deepStrictEqual(imageSources(html), ["/assets/legacy.png"]);
    match(html, /alt="Legacy image description"/);
  });
}

Deno.test("project_card preserves legacy wrapper, student, divider and learn-more presentation", async () => {
  const html = await renderCard("project_card", {
    start_new_row: true,
    project_link: "https://example.com/project",
    link: "https://example.com/old",
    image: "/assets/legacy.png",
    alt: "Legacy cover",
    student: "Student Name",
    student_page: "https://example.com/student",
  });
  match(html, /class="divider col-12"/);
  match(html, /href="https:\/\/example.com\/project"[^>]*>\s*<h3/);
  match(html, /href="https:\/\/example.com\/student">Student Name<\/a>/);
  match(html, /href="\/project\/fixture\/">Learn More\.\.\.<\/a>/);
  match(html, /<article class="col card no-border project-card">/);
  match(html, /<p class="project-card-more"><a href="\/project\/fixture\/">Learn More\.\.\.<\/a><\/p>\s*<\/article>/);
  deepStrictEqual(imageSources(html), ["/assets/legacy.png"]);
  ok(!html.includes('class="row is-center links"'));

  const unlinked = await renderCard("project_card", {
    student: "Student Name",
  });
  match(unlinked, /<div>\s*<h3/);
  match(unlinked, /<span>Student Name<\/span>/);
  const suppressed = await renderCard("project_card", {
    start_new_row: true,
    ignore_row_div: true,
  });
  ok(!suppressed.includes("divider"));

  const legacyLink = await renderCard("project_card", {
    link: "https://example.com/legacy",
    links: [],
  });
  match(legacyLink, /href="https:\/\/example.com\/legacy"[^>]*>\s*<h3/);
});

Deno.test("portfolio_card uses the home icon for Download Page links", async () => {
  const html = await renderCard("portfolio_card", {
    links: [{ name: "Download Page", link: "https://www.speakflow.com/download" }],
  });
  deepStrictEqual(imageSources(html), ["/icons/simpleicons/homepage.svg"]);
  match(html, /href="https:\/\/www.speakflow.com\/download"/);
  match(html, /<span>Download Page<\/span>/);
});

Deno.test("portfolio_card renders a monochrome globe and Speakflow screenshot", async () => {
  const html = await renderCard("portfolio_card", {
    links: [{ name: "Speakflow", link: "https://www.speakflow.com/" }],
    cover_image: {
      file: "/assets/images/speakflow-desktop-screenshot.png",
      alt_text: "Speakflow desktop app showing script search, folders, and saved scripts",
    },
  });
  deepStrictEqual(imageSources(html), [
    "/assets/images/speakflow-desktop-screenshot.png",
  ]);
  match(html, /<svg[^>]*stroke="currentColor"[^>]*aria-hidden="true"/);
  match(html, /<circle cx="12" cy="12" r="9"/);
  ok(!html.includes("speakflow-logo.svg"));
  match(html, /<span>Speakflow<\/span>/);
});

Deno.test("portfolio_card uses current award fields and preserves award arrangement", async () => {
  const html = await renderCard("portfolio_card", {
    additional_image: [
      { link: "/assets/gallery.png", alt_text: "Gallery", is_award: false },
      { link: "/assets/winner.png", alt_text: "Winner", is_award: true },
      {
        link: "https://example.com/fun.png",
        alt_text: "Most Fun",
        is_award: true,
      },
      { link: "/assets/sound.png", alt_text: "Best Sound", is_award: true },
      { link: "", alt_text: "Incomplete", is_award: true },
    ],
    project_info: {
      role: "Lead Programmer",
      awards: [{ src: "legacy-award.png", alt: "Old Award" }],
    },
  });
  deepStrictEqual(imageSources(html), [
    "/assets/winner.png",
    "https://example.com/fun.png",
    "/assets/sound.png",
  ]);
  match(html, /<figcaption>Winner<\/figcaption>/);
  match(html, /alt="Most Fun"/);
  match(html, /<figcaption>Best Sound<\/figcaption>/);
  match(html, /<p class="text-center">Lead Programmer<\/p>/);
  equal([...html.matchAll(/<figure\b/g)].length, 3);
  match(
    html,
    /<figcaption>Winner<\/figcaption>\s*<\/figure>\s*<div class="row">/,
  );
  ok(!html.includes("legacy-award"));
  ok(!html.includes("Gallery"));
  ok(!html.includes("Incomplete"));
});

Deno.test("portfolio_card preserves legacy awards, captions, overview and icon links", async () => {
  const html = await renderCard("portfolio_card", {
    image: "/assets/legacy-cover.png",
    alt: "Legacy cover",
    links: [],
    additional_image: [{ link: "/assets/gallery.png", is_award: false }],
    project_info: {
      summary: "Legacy overview",
      role: "Legacy Role",
      awards: [
        { src: "awards/winner.png", alt: "Winner", caption: "Winner Caption" },
        { src: "awards/fun.png", alt: "Most Fun" },
        { alt: "Missing source" },
      ],
      external_links: {
        main: "https://example.com/home",
        itch: "https://example.com/itch",
        github: "https://example.com/github",
      },
    },
  });
  deepStrictEqual(imageSources(html), [
    "/assets/legacy-cover.png",
    "/assets/awards/winner.png",
    "/assets/awards/fun.png",
    "/icons/simpleicons/homepage.svg",
    "/icons/simpleicons/itchdotio.svg",
    "/icons/simpleicons/github.svg",
  ]);
  match(html, /<figcaption>Winner Caption<\/figcaption>/);
  match(html, /<figcaption>Most Fun<\/figcaption>/);
  match(html, /<p class="text-center">Legacy overview<\/p>/);
  match(html, /<p class="text-center">Legacy Role<\/p>/);
  match(html, /<span>Homepage<\/span>/);
  match(html, /<span>Itch.io<\/span>/);
  match(html, /<span>GitHub<\/span>/);
  for (const name of ["home", "itch", "github"]) {
    ok(html.includes(`href="https://example.com/${name}"`));
  }
  ok(!html.includes("Missing source"));
});

Deno.test("portfolio_card keeps legacy trailer and demo media priority", async () => {
  for (
    const trailer of [
      "https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ",
      { link: "dQw4w9WgXcQ", width: 480, height: 270 },
    ]
  ) {
    const html = await renderCard("portfolio_card", {
      cover_image: { file: "/assets/cover.png", alt_text: "Cover" },
      project_info: { trailer, demo_gif: "demo.gif" },
    });
    match(html, /<iframe\b/);
    match(html, /src="https:\/\/www.youtube-nocookie.com\/embed\/dQw4w9WgXcQ"/);
    deepStrictEqual(imageSources(html), []);
  }
  const demo = await renderCard("portfolio_card", {
    cover_image: { file: "/assets/cover.png", alt_text: "Cover" },
    data_default: { image_height: 240 },
    project_info: { demo_gif: "demo.gif" },
  });
  deepStrictEqual(imageSources(demo), ["/assets/demo.gif"]);
  match(demo, /alt="Demo of Fixture Project"/);
  match(demo, /height="240"/);
});

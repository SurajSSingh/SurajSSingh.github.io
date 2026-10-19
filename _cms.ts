import lumeCMS from "lume/cms/mod.ts";
import { Fs } from "lume/cms/storage/fs.ts";

// The portfolio index is edited as a document, not as a project.
export class ProjectStorage extends Fs {
  constructor(root: string) {
    super({ root, path: "project/*.md" });
  }

  override async *[Symbol.asyncIterator]() {
    for await (const entry of super[Symbol.asyncIterator]()) {
      if (entry.name !== "index.md") yield entry;
    }
  }
}

const cms = lumeCMS();
cms.storage("projects", new ProjectStorage(`${cms.options.root}/src`));

async function initRelationOptions(
  field: Lume.CMS.Fields["relation"] | Lume.CMS.Fields["relation-list"],
  content: Lume.CMS.Content,
) {
  const collection = content.collections[field.collection];
  const options: { label: string; value: string }[] = [];

  // Collection metadata does not include frontmatter IDs.
  for await (const { name, label } of collection) {
    const { root } = await collection.get(name).read();
    if (typeof root.id === "string" && root.id.trim()) {
      options.push({ label, value: root.id });
    }
  }

  field.options = options.sort((a, b) => a.label.localeCompare(b.label));
}

cms.storage("img", "assets/images");

cms.upload({
  name: "images",
  label: "Image Library",
  description: "Upload covers, screenshots, diagrams, GIFs, and award images.",
  store: "src:assets/images",
  publicPath: "/assets/images",
});

// --- Skills Collection ---
cms.collection({
  name: "skills",
  description: "Skills that can be associated with projects",
  store: "src:skill/*.md",
  documentName: "{title}.md",
  fields: [
    "title: text!",
    {
      name: "id",
      type: "text",
      label: "Unique ID",
      description:
        "Unique identifier for relations (e.g. 'unity', 'typescript')",
      attributes: { required: true },
    },
    {
      name: "type",
      type: "hidden",
      value: "skill",
    },
    {
      name: "layout",
      type: "hidden",
      value: "layouts/website/skill_page.vto",
    },
    "summary: text",
    {
      name: "category",
      type: "select",
      description: "Skill category",
      options: [
        "Language",
        "Framework",
        "Engine",
        "Tool",
        "Platform",
        "Methodology",
        "Soft Skill",
        "Other",
      ],
    },
    {
      name: "icon",
      type: "text",
      description: "Icon identifier (e.g. simpleicons name or skill-icon name)",
      view: "details",
    },
    {
      name: "skills_url",
      type: "url",
      description: "Official website or documentation link",
      view: "details",
    },
    "content: markdown",
  ],
});

// --- Organizations Collection ---
cms.collection({
  name: "organizations",
  description: "Organizations associated with projects",
  store: "src:org/*.md",
  documentName: "{title}.md",
  fields: [
    "title: text!",
    {
      name: "id",
      type: "text",
      label: "Unique ID",
      description: "Unique identifier for relations (e.g. 'p1', 'uci')",
      attributes: { required: true },
    },
    {
      name: "type",
      type: "hidden",
      value: "organization",
    },
    {
      name: "layout",
      type: "hidden",
      value: "layouts/website/org_page.vto",
    },
    "summary: text",
    {
      name: "org_url",
      type: "url",
      description: "Organization website",
    },
    {
      name: "logo",
      type: "file",
      description: "Organization logo",
      view: "details",
    },
    "content: markdown",
  ],
});

// --- Projects Collection ---
cms.collection({
  name: "projects",
  label: "Portfolio Projects",
  description:
    "Edit the overview, project details, case-study sections, and image gallery. Existing Markdown stays in Project Story. Toggle Publishing or Legacy for less frequently used settings.",
  store: "projects",
  documentName: "{title}.md",
  // Editing a title must not silently change an existing project's URL.
  rename: false,
  views: ["details", "media", "case-study"],
  fields: [
    // ── Basics (always visible) ──
    "title: text!",
    {
      name: "summary",
      label: "Short Overview",
      type: "textarea",
      description:
        "A brief introduction used on project cards and at the top of the project page. Existing HTML links are supported.",
      attributes: { rows: 3 },
    },
    {
      name: "id",
      type: "text",
      label: "Unique ID",
      description:
        "Unique identifier for relations (e.g. 'keito', 'eco-defender')",
      attributes: { required: true },
      init(field, _content, data, document) {
        if (data && document) {
          data[field.name] ??= document.name.replace(/\.md$/, "");
        }
      },
    },
    {
      name: "type",
      type: "hidden",
      value: "project",
    },
    {
      name: "date",
      label: "First Created",
      type: "date",
      attributes: { required: true },
      description: "Original publication date, not the project timeline.",
      view: "publishing",
      init(field) {
        field.value = new Date().toISOString().slice(0, 10);
      },
    },
    {
      name: "last_modified",
      type: "current-datetime",
      attributes: { readonly: true },
      view: "publishing",
    },
    {
      name: "links",
      label: "Project Links",
      description:
        "Add and reorder website, demo, download, source, or article links. Choose a suggested label or write your own.",
      type: "object-list",
      fields: [
        {
          name: "name",
          label: "Link Label",
          type: "text",
          attributes: { required: true },
          options: [
            "Home",
            "Live Demo",
            "Download Page",
            "Itch.io",
            "GitHub Repo",
            "GitLab Repo",
            "Netlify",
            "Vercel",
            "Article",
            "Other",
          ],
        },
        "link: url!",
      ],
    },

    // ── Relations (view: details; older fields in legacy) ──
    {
      name: "org_id",
      label: "Organization",
      description:
        "Optional client or organization. Create it in Organizations first; projects without one appear under Other Projects.",
      type: "relation",
      view: "details",
      collection: "organizations",
      init: initRelationOptions,
    },
    {
      name: "org",
      label: "Organization (legacy)",
      description: "Legacy org field — use Organization relation instead",
      type: "text",
      view: "legacy",
      options: [
        "personal",
        "p1",
        "uci",
        "uiuc",
      ],
    },
    {
      name: "skill_id",
      label: "Skills",
      description: "Skills associated with this project",
      type: "relation-list",
      view: "details",
      collection: "skills",
      init: initRelationOptions,
    },
    {
      name: "skills",
      type: "list",
      description: "Skills (legacy free-text list)",
      view: "legacy",
    },
    {
      name: "tech_stack",
      label: "Technology Stack",
      type: "list",
      description:
        "Languages, frameworks, engines, and tools shown in Project Details. Skills above link the project to skill pages.",
      view: "details",
    },
    {
      name: "highlighted_project",
      label: "Feature on Homepage",
      type: "checkbox",
      description:
        "The homepage displays up to five featured projects by sort weight.",
      view: "publishing",
    },

    // ── Images (view: media) ──
    {
      name: "cover_image",
      label: "Cover Image",
      description:
        "Shown on project cards. Gallery images below appear on the project page.",
      type: "object",
      view: "media",
      fields: [
        {
          name: "file",
          type: "file",
          upload: "images",
          attributes: { accept: "image/*" },
        },
        {
          name: "alt_text",
          label: "Cover Description",
          type: "text",
          description:
            "Describe the cover for accessibility. Leave both cover fields empty if no cover is needed.",
        },
      ],
    },
    {
      name: "additional_image",
      label: "Gallery and Award Images",
      description:
        "Add, duplicate, or drag to reorder images. Non-award images form the project page gallery; award images stay on highlighted cards. Captions are optional plain text.",
      type: "object-list",
      view: "media",
      fields: [
        {
          name: "link",
          label: "Image",
          type: "file",
          upload: "images",
          attributes: { required: true, accept: "image/*" },
        },
        "alt_text: text!",
        {
          name: "caption",
          type: "textarea",
          description: "Explain what this screenshot or diagram demonstrates.",
          attributes: { rows: 2 },
        },
        {
          name: "is_award",
          type: "checkbox",
          label: "Is Award?",
          description: "Is this image of an award or honor",
        },
      ],
    },

    // ── Project Details (view: details) ──
    {
      name: "weight",
      type: "number",
      value: 1000,
      description: "Sort weight (lower = higher priority)",
      view: "publishing",
    },
    {
      name: "project_info",
      label: "Project Details",
      description:
        "Optional facts shown on the project page. Role and YouTube trailer also appear on highlighted cards. Leave unknown dates and team size empty.",
      type: "object",
      view: "details",
      fields: [
        {
          name: "role",
          label: "My Role",
          type: "text",
          attributes: { placeholder: "e.g. Lead Developer and Researcher" },
        },
        {
          name: "trailer",
          label: "YouTube Trailer",
          type: "url",
          description:
            "Optional YouTube URL used on highlighted homepage cards.",
        },
        {
          name: "status",
          type: "select",
          description: "Current status of the project",
          options: [
            "In Progress",
            "Completed",
            "On Hold",
            "Archived",
            "Maintained",
          ],
        },
        {
          name: "team_size",
          type: "number",
          description: "Number of people on the team",
          attributes: { min: 1 },
        },
        {
          name: "start_date",
          type: "date",
          label: "Project Start Date",
        },
        {
          name: "end_date",
          type: "date",
          label: "Project End Date",
        },
      ],
    },

    {
      name: "case_study",
      label: "Case Study Sections",
      type: "object-list",
      view: "case-study",
      description:
        "Optional sections displayed after Project Story, in the order you choose. Add only what applies: the problem, your contribution, technical decisions, results, or lessons. Existing projects do not need to be migrated.",
      fields: [
        {
          name: "title",
          label: "Section Heading",
          type: "text",
          attributes: { required: true },
          options: [
            "Overview",
            "Problem",
            "My Contribution",
            "Approach",
            "Results",
            "Lessons Learned",
            "Next Steps",
          ],
        },
        {
          name: "body",
          label: "Section Content",
          type: "markdown",
          attributes: { required: true },
          description:
            "Use paragraphs, lists, links, and images. Use level-three headings for subsections; the section heading above is level two.",
        },
      ],
    },

    // ── Content (always visible) ──
    {
      name: "content",
      label: "Project Story",
      type: "markdown",
      description:
        "The existing free-form Markdown body, displayed before Case Study Sections and the Gallery. Keep using it for the whole story, or gradually move sections into the structured editor above. Avoid repeating the same section in both places.",
    },
  ],
});
cms.document({
  name: "about-page",
  description: "Edit the content of the about page",
  store: "src:about.md",
  fields: [
    // ── Meta ──
    "title: text!",
    "summary: text",

    // ── Page intro ──
    {
      name: "intro",
      type: "textarea",
      label: "Page Intro",
      description: "Short intro line shown at the top of the page",
    },

    // ── Who I am ──
    {
      name: "who_i_am",
      type: "markdown",
      label: "Who I Am",
      description: "Biographical paragraphs for the 'Who I am' section",
    },

    // ── Pronouns ──
    {
      name: "pronouns_intro",
      type: "textarea",
      label: "Pronouns Introduction",
      description: "Introductory sentence before the pronouns list",
    },
    {
      name: "pronouns",
      type: "object-list",
      label: "Pronouns",
      description: "Acceptable pronouns with usage examples",
      fields: [
        {
          name: "pronoun",
          type: "text",
          label: "Pronoun Set",
          description: "e.g. he/him/his",
          attributes: { required: true },
        },
        {
          name: "example",
          type: "textarea",
          label: "Example Sentence",
          description: "Example sentence showing pronoun usage",
        },
      ],
    },

    // ── Interests ──
    {
      name: "interests_intro",
      type: "textarea",
      label: "Interests Introduction",
      description: "Introductory sentence before the interests list",
    },
    {
      name: "interests",
      type: "object-list",
      label: "Interests",
      description: "Interest categories with individual items",
      fields: [
        {
          name: "category",
          type: "text",
          label: "Category Name",
          attributes: { required: true },
        },
        {
          name: "items",
          type: "list",
          label: "Items",
          description: "List of specific interests in this category",
        },
      ],
    },

    // ── What I am Learning ──
    {
      name: "learning_intro",
      type: "textarea",
      label: "Learning Introduction",
      description: "Introductory sentence before the learning list",
    },
    {
      name: "learning",
      type: "object-list",
      label: "What I am Learning",
      description: "Things currently being learned, with optional links",
      fields: [
        {
          name: "label",
          type: "text",
          label: "Label",
          attributes: { required: true },
        },
        {
          name: "url",
          type: "url",
          label: "URL",
          description: "Link to resource (optional)",
        },
      ],
    },

    // ── Recent Work ──
    {
      name: "recent_work_intro",
      type: "textarea",
      label: "Recent Work Introduction",
      description: "Introductory sentence before the recent work list",
    },
    {
      name: "recent_work",
      type: "object-list",
      label: "What I have worked on recently",
      description: "Recent projects/work with optional links",
      fields: [
        {
          name: "label",
          type: "text",
          label: "Label",
          attributes: { required: true },
        },
        {
          name: "url",
          type: "url",
          label: "URL",
          description: "Link to the work (optional)",
        },
      ],
    },

    // ── Personal Projects ──
    {
      name: "personal_projects",
      type: "list",
      label: "Small Scale Personal Projects",
      description:
        "Short bullet descriptions of personal projects (markdown supported)",
    },

    // ── Extra content ──
    {
      name: "content",
      type: "markdown",
      label: "Extra Content",
      description:
        "Any additional markdown content appended after all structured sections",
    },
  ],
});
cms.document(
  "portfolio-page: Edit the content of the portfolio page",
  "src:project/index.md",
  [
    "title: text!",
    "summary: text",
    "content: markdown",
  ],
);
// FIXME: This needs to be improved at some point
//        Current _config.ts has hard-coded values,
//        making it not as portable for others.
cms.document({
  name: "Site Info",
  description: "Information for configuring the site (_config.ts)",
  store: "src:_config.json",
  fields: [
    {
      name: "src",
      type: "text",
      description: "Source directory",
      attributes: {
        required: false,
      },
      init(field) {
        field.value ??= "./src";
      },
    },
    {
      name: "dest",
      type: "text",
      description: "Destination directory",
      value: "./_site",
      attributes: {
        required: false,
      },
    },
    {
      name: "emptyDest",
      type: "checkbox",
      description: "Empty destination folder before build",
      value: true,
      attributes: {
        required: false,
      },
      init(field) {
        field.value ??= true;
      },
    },
    {
      name: "location",
      type: "url",
      description: "Public URL of the site",
      value: "https://example.com",
      attributes: {
        required: false,
      },
    },
  ],
});

export default cms;

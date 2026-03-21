import lumeCMS from "lume/cms/mod.ts";
import { registerResumeCMS } from "./_resume.ts";

const cms = lumeCMS();

cms.storage("img", "assets/images");

cms.upload("images: Manage a all images here.", "src:assets/images");

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
  description: "Here you add, edit or delete projects for the portfolio",
  store: "src:project/*.md",
  documentName: "{title}.md",
  fields: [
    // ── Basics (always visible) ──
    "title: text!",
    "summary: text",
    {
      name: "id",
      type: "text",
      label: "Unique ID",
      description:
        "Unique identifier for relations (e.g. 'keito', 'eco-defender')",
      attributes: { required: true },
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
    },
    {
      name: "last_modified",
      type: "current-datetime",
      attributes: { readonly: true },
    },
    {
      name: "links",
      description: "List of public links (at least one recommended)",
      type: "object-list",
      fields: [
        {
          name: "name",
          type: "select",
          attributes: { required: true },
          options: [
            "Home",
            "Itch.io",
            "GitHub Repo",
            "GitLab Repo",
            "Netlify",
            "Vercel",
            "Other",
          ],
        },
        "link: url!",
      ],
    },

    // ── Relations (always visible) ──
    {
      name: "org_id",
      label: "Organization",
      description: "Organization this project belongs to",
      type: "relation",
      collection: "organizations",
      option: ({ label, flags }) => ({ label, value: flags?.id ?? "" }),
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
      collection: "skills",
      option: ({ label, flags }) => ({ label, value: flags?.id ?? "" }),
    },
    {
      name: "skills",
      type: "list",
      description: "Skills (legacy free-text list)",
      view: "legacy",
    },
    {
      name: "tech_stack",
      type: "list",
      description: "List of technology associated with the project",
    },
    "highlighted_project: checkbox",

    // ── Images (view: media) ──
    {
      name: "cover_image",
      description: "Cover Image of the project",
      type: "object",
      view: "media",
      fields: [
        "file: file",
        "alt_text: text!",
      ],
    },
    {
      name: "additional_image",
      description: "Other images related to the project (gallery)",
      type: "object-list",
      view: "media",
      fields: [
        "link: file",
        "alt_text: text!",
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
      view: "details",
    },
    {
      name: "project_info",
      description: "Additional project information",
      type: "object",
      view: "details",
      fields: [
        "role: text",
        "trailer: url",
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

    // ── Content (always visible) ──
    "content: markdown",
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
  "src:portfolio.yml",
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

// --- Resume Items (registered from _resume.ts) ---
registerResumeCMS(cms);

export default cms;

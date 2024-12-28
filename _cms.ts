import lumeCMS from "lume/cms/mod.ts";

const cms = lumeCMS();

cms.storage("img", "assets/images");

cms.upload("images: Manage a all images here.", "src:assets/images");

cms.collection(
  "projects: Here you add, edit or delete projects for the portfolio",
  "src:project/*.md",
  [
    "title: text!",
    {
      name: "date",
      label: "First Created",
      type: "date",
      attributes: {
        required: true,
      },
    },
    {
      name: "last_modified",
      type: "current-datetime",
      attributes: {
        readonly: true,
      },
    },
    "summary: text",
    {
      "name": "weight",
      "type": "number",
      "value": 1000,
    },
    {
      "name": "org",
      "type": "text",
      options: [
        "personal",
        "p1",
        "uci",
        "uiuc",
      ],
    },
    {
      "name": "links",
      "description": "List of public links",
      "type": "object-list",
      fields: [
        {
          "name": "name",
          "type": "select",
          "attributes": {
            "required": true,
          },
          "options": [
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
    {
      name: "cover_image",
      description: "Cover Image of the project",
      type: "object",
      fields: [
        "link: url!",
        "alt_text: text!",
      ],
    },
    {
      name: "additional_image",
      description: "Other images related to the project",
      type: "object-list",
      fields: [
        "link: url!",
        "alt_text: text!",
        {
          "name": "is_award",
          "type": "checkbox",
          "label": "Is Award?",
          "description": "Is this image of an award or honor",
        },
      ],
    },
    {
      name: "tech_stack",
      type: "list",
      description: "List of technology associated with the project",
    },
    {
      name: "skills",
      type: "list",
      description: "List of skills associated with the project",
    },
    {
      name: "project_info",
      description: "Direct Info of the project",
      type: "object",
      fields: [
        "role: text",
        "trailer: url",
      ],
    },
    "content: markdown",
  ],
);
cms.collection(
  "skills: Here you add, edit or delete skills associated with a project",
  "src:skill/*.md",
  [
    "title: text!",
    "content: markdown",
  ],
);
cms.collection(
  "organizations: Here you add, edit or delete organizations associated with a project",
  "src:org/*.md",
  [
    "title: text!",
    "content: markdown",
  ],
);
cms.document(
  "about-page: Edit the content of the about page",
  "src:about.md",
  [
    "title: text!",
    "summary: text",
    "content: markdown",
  ],
);
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

// Resume Items
cms.document({
  "name": "General Resume Data",
  "description": "Information that is the same across resumes",
  "store": "src/resumes/general_data.yml",
  "fields": [],
});

cms.document({
  "name": "Summaries",
  "description": "List of summaries or career objective",
  "store": "src/resumes/summary.yml",
  "fields": [],
});

cms.collection({
  "name": "Accomplishments",
  "description": "List of accomplishments by organizations",
  "store": "src/resumes/accomplishments/*.yml",
  "fields": [],
});

export default cms;

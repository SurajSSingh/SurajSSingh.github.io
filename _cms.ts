import { Entry } from "lume/core/fs.ts";
import lumeCMS from "lume/cms/mod.ts";

// Constant Data
const RESUME_LAYOUTS_DIR = "/_includes/layouts/resume";
const MONTHS = [
  "",
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

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
        "file: file",
        "alt_text: text!",
      ],
    },
    {
      name: "additional_image",
      description: "Other images related to the project",
      type: "object-list",
      fields: [
        "link: file",
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
    "highlighted_project: checkbox",
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
  name: "general-resume-data",
  description: "Information that is the same across resumes",
  store: "src:resumes/_data/general.yml",
  fields: [
    {
      name: "headline",
      type: "object",
      fields: [
        "name: text!",
        {
          name: "contact",
          type: "object",
          fields: [
            "website: url",
            "github: url",
            "linkedin: url",
            {
              name: "private",
              type: "hidden",
            },
          ],
        },
      ],
    },
    {
      name: "education",
      type: "object-list",
      fields: [
        "org: text!",
        "link: url",
        "abbr: text",
        {
          name: "degrees",
          type: "object-list",
          fields: [
            "name: text!",
            "rank: text!",
            "link: url",
          ],
        },
        {
          name: "start",
          type: "object",
          attributes: {
            required: true,
          },
          fields: [
            "year: number!",
            {
              name: "month",
              type: "select",
              options: Array.from(MONTHS)
                .map((month, index) => ({ label: month, value: index }))
                .filter((item) => item.value > 0),
            },
          ],
        },
        {
          name: "grad",
          label: "Graduation",
          type: "object",
          fields: [
            "year: number!",
            {
              name: "month",
              type: "select",
              options: Array.from(MONTHS)
                .map((month, index) => ({ label: month, value: index }))
                .filter((item) => item.value > 0),
            },
          ],
        },
      ],
    },
    {
      name: "experience",
      type: "object-list",
      fields: [
        "company: text!",
        "link: url",
        {
          name: "roles",
          type: "object-list",
          fields: [
            "title: text!",
            {
              name: "start",
              type: "object",
              attributes: {
                required: true,
              },
              fields: [
                "year: number!",
                {
                  name: "month",
                  type: "select",
                  options: Array.from(MONTHS)
                    .map((month, index) => ({ label: month, value: index }))
                    .filter((item) => item.value > 0),
                },
              ],
            },
            {
              name: "end",
              type: "object",
              fields: [
                "year: number",
                {
                  name: "month",
                  type: "select",
                  options: Array.from(MONTHS)
                    .map((month, index) => ({ label: month, value: index }))
                    .filter((item) => item.value > 0),
                },
              ],
            },
            {
              name: "key",
              type: "hidden",
            },
          ],
        },
      ],
    },
  ],
});

cms.document({
  "name": "resume-summaries",
  "description": "List of summaries or career objective",
  "store": "src:resumes/_data/private_summary.yml",
  "fields": [
    {
      name: "summaries",
      type: "choose-list",
      fields: [
        {
          name: "text",
          label: "Simple Text",
          type: "object",
          fields: [
            "text: text!",
          ],
        },
        {
          name: "markdown",
          label: "Markdown Rendered Text",
          type: "object",
          fields: [
            "text: markdown!",
          ],
        },
        {
          name: "dynamic",
          label: "Dynamic Text Parts",
          type: "object",
          fields: [
            "adjective: text",
            "role: text!",
            {
              name: "experience",
              description: "Years of experience",
              type: "number",
              attributes: {
                min: 0.25,
                step: 0.25,
              },
              value: 1,
            },
            "seeking: text!",
          ],
        },
      ],
    },
  ],
});

cms.document({
  "name": "resume-skills",
  "description": "List of skills",
  "store": "src:resumes/_data/skills.yml",
  "fields": [
    {
      name: "skill",
      type: "object-list",
      fields: [
        {
          name: "name",
          type: "text",
          attributes: {
            required: true,
          },
        },
        {
          name: "category",
          type: "list",
          // TODO: Init options from previous choices
        },
      ],
    },
  ],
});

cms.document({
  "name": "accomplishments",
  "description": "List of accomplishments by organizations",
  "store": "src:resumes/_data/private_accomplishments.yml",
  "fields": [
    {
      name: "[]",
      type: "object-list",
      fields: [
        "key:text!",
        {
          name: "accomplishments",
          type: "choose-list",
          fields: [
            {
              name: "text",
              label: "Simple Text",
              type: "object",
              fields: [
                "text: textarea!",
              ],
              init(field) {
                // ts-ignore
              },
            },
            {
              name: "markdown",
              label: "Markdown Rendered Text",
              type: "object",
              fields: [
                "text: markdown!",
              ],
            },
          ],
        },
      ],
    },
  ],
});

cms.collection({
  "name": "V1 Resumes",
  "description": "List of resumes generated following V1 format",
  "store": "src:resumes/v1/*.md",
  "fields": [
    "title: text!",
    "description: text!",
    {
      name: "layout",
      type: "select",
      init: (field, content) => {
        const possible_layouts = (Array.from(
          content.data
            .site.fs.entries
            .get(RESUME_LAYOUTS_DIR)
            .children.values(),
        ) as unknown as Entry[])
          .filter((c) => c.type === "file" && !c.name.startsWith("resume")).map(
            (c) => {
              return {
                value: c.path,
                label: c.name,
              };
            },
          );
        field.options = possible_layouts;
      },
    },
    {
      name: "style",
      type: "object",
      fields: [
        {
          name: "headlineSize",
          type: "select",
          value: "md",
          options: [
            "xs",
            "sm",
            "md",
            "lg",
            "xl",
          ],
        },
        {
          name: "skillsSize",
          type: "select",
          value: "sm",
          options: [
            "xs",
            "sm",
            "md",
            "lg",
            "xl",
          ],
        },
        "includeGPA:checkbox",
        "includeMonth:checkbox",
      ],
    },
    {
      name: "headlineExtra",
      type: "object",
      fields: [
        {
          name: "contactOrder",
          type: "list",
          value: ["website", "email", "phone"],
          options: [
            "email",
            "phone",
            "website",
            "github",
            "linkedin",
          ],
        },
        {
          name: "emailIndex",
          type: "number",
          attributes: {
            min: 0,
          },
          init(field, { data }) {
            if (field.attributes) {
              field.attributes.max =
                data.site.source.data.get("/resumes").private_contacts.email
                  .length - 1;
            }
          },
        },
        {
          name: "phoneIndex",
          type: "number",
          attributes: {
            min: 0,
          },
          init(field, { data }) {
            if (field.attributes) {
              field.attributes.max =
                data.site.source.data.get("/resumes").private_contacts.phone
                  .length - 1;
            }
          },
        },
      ],
    },
    {
      name: "summaryIndex",
      type: "number",
      attributes: {
        required: true,
        min: -1,
      },
      init(field, { data }) {
        if (field.attributes) {
          field.attributes.max =
            data.site.source.data.get("/resumes").private_summary.summaries
              .length - 1;
        }
      },
    },
    {
      name: "summaryText",
      type: "textarea",
    },
    {
      name: "includedAccomplishmentLists",
      type: "object-list",
      fields: [
        {
          name: "role",
          type: "select",
          attributes: {
            required: true,
          },
          init(field, { data }) {
            field.options = Array.from(
              data.site.source.data.get("/resumes").general.experience,
            ).flatMap((e) => e.roles).map((r) => r.key);
          },
        },
        "alterateRoleName:text",
        "usePresent:checkbox",
        {
          name: "indices",
          type: "list",
          attributes: {},
          // init(field, { data }) {
          //   console.log(data);
          //   // field.options =
          // },
        },
      ],
      // init: (field, content) => {
      //   // const possible_layouts = (Array.from(
      //   //   content.data
      //   //     .site.fs.entries
      //   //     .get(RESUME_LAYOUTS_DIR)
      //   //     .children.values(),
      //   // ) as unknown as Entry[])
      //   //   .filter((c) => c.type === "file" && !c.name.startsWith("resume")).map(
      //   //     (c) => {
      //   //       return {
      //   //         value: c.path,
      //   //         label: c.name,
      //   //       };
      //   //     },
      //   //   );
      //   // field.options = possible_layouts;
      // },
    },
    {
      name: "skillSet",
      type: "object-list",
      fields: [
        "category:text!",
        {
          name: "skills",
          type: "list",
          attributes: {
            required: true,
          },
        },
      ],
    },
    "content:markdown",
  ],
});

export default cms;

import { Entry } from "lume/core/fs.ts";
import lumeCMS from "lume/cms/mod.ts";
import { Field } from "lume/cms/types.ts";

// Constant Data
const V1_RESUME_LAYOUTS_DIR = "/_includes/layouts/resume/v1";
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
            .get(V1_RESUME_LAYOUTS_DIR)
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
            ).flatMap((e) => (e as { roles: { key: string } }).roles).map((r) =>
              r.key
            );
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

type FieldArray = (string | Field)[];

const META_FIELDS: FieldArray = [
  {
    name: "version",
    type: "hidden",
    value: "v2",
    attributes: {
      required: true,
    },
  },
  {
    name: "first_created",
    type: "datetime",
    attributes: {
      readonly: true,
      required: true,
    },
    value: 0,

    init(field) {
      const value = new Date();
      field.value = value;
    },
  },
  {
    name: "last_modified",
    type: "current-datetime",
    attributes: {
      readonly: true,
      required: true,
    },
  },
  {
    name: "dervied_from",
    description:
      "Other resume to derive (i.e., copy) data from (currently needs to be manual)",
    "type": "select",
    init(field, content) {
      const v2 = content.data.site.fs.entries.get("/resumes/v2");
      field.options = v2.children.values().map((x: { name: string }) => x.name)
        .toArray();
    },
  },
] as const;

const JOB_INFO_FIELDS: FieldArray = [
  "role:text!",
  "company:text!",
  {
    name: "links",
    description: "",
    type: "object-list",
    fields: [
      {
        name: "name",
        type: "text",
        options: [
          "Company Website",
          "LinkedIn",
          "Indeed",
          "ZipRecruiter",
          "Glassdoor",
          "Monster",
        ],
      },
      "link:url!",
    ],
  },
  "description:markdown",
] as const;

const STRUCTURE_FIELDS: FieldArray = [
  // Include Cover Letter: checkbox
  "includeCoverLetter:checkbox",
  // Resume Number of Colums: number
  {
    name: "numberOfColumns",
    type: "number",
    attributes: {
      min: 1,
      max: 12,
    },
  },
  // Resume Order: object-list
  //  - Type: select
  //  - Column Span: number
  {
    name: "resumeOrder",
    type: "object-list",
    fields: [
      {
        name: "type",
        description: "What type of block is it",
        type: "select",
        options: [
          "divider",
          "headline",
          "contacts",
          "summary",
          "experience",
          "education",
          "skills",
          "projects",
        ],
      },
      {
        name: "span",
        description: "How many columns does it span",
        type: "number",
      },
    ],
  },
] as const;

const CONTENT_FIELDS: FieldArray = [
  // Cover Letter: object
  //  - Contacts: array of contacts
  //  - Content: markdown
  {
    name: "coverLetter",
    type: "object",
    fields: [
      {
        name: "contacts",
        description: "List of contacts to appear on cover letter",
        type: "list",
        value: ["email", "phone"],
        options: [
          "email",
          "phone",
          "website",
          "linkedin",
          "github",
          "bluesky",
          "mastodon",
          "address",
        ],
      },
      "content:markdown",
    ],
  },
  // Resume: object
  {
    name: "resume",
    type: "object",
    fields: [
      //  - ContactOrder: list
      "emailIndex:number",
      "phoneIndex:number",
      {
        name: "contactOrder",
        description: "List of contacts to appear on cover letter",
        type: "list",
        value: ["website", "email", "phone", "github"],
        options: [
          "email",
          "phone",
          "website",
          "linkedin",
          "github",
          "bluesky",
          "mastodon",
          "address",
        ],
      },
      //  - Summary: markdown
      "summary:markdown!",
      //  - Experience: object-list
      {
        name: "experience",
        type: "object-list",
        //  - Role Key: select
        //  - Alternate Role Name: text
        //  - Is Current: checkbox
        //  - Role Summary: markdown
        //  - Accomplishments: object-list
        //    - Content: markdown
        fields: [
          {
            name: "roleKey",
            type: "select",
            description: "List of roles",
            // TODO: Make it dynamically get
            options: [
              "FSE25",
              "p1Lead",
              "p1Dev",
              "cmaInstructor",
            ],
          },
          "altTitle:text",
          "isCurrent:checkbox",
          "summary:markdown",
          {
            name: "accomplishments",
            description: "Accomplishments in this role",
            type: "object-list",
            fields: [
              "content:markdown!",
            ],
          },
        ],
      },
      //  - Skills Block: object-list
      {
        name: "skills",
        type: "object-list",
        //  - Category Title: text
        //  - Skills: object-list
        //    - text: text!
        //    - url: url
        //    - italics: checkbox
        //    - bold: checkbox
        fields: [
          "category:text",
          {
            name: "skill",
            type: "object-list",
            fields: [
              "text:text!",
              "url:url",
              "italics:checkbox",
              "bold:checkbox",
            ],
          },
        ],
      },
      //  - Highlighted Projects: object-list
      {
        name: "projects",
        type: "object-list",
        //  - Title: text!
        //  - Link: url
        //  - Description: markdown
        //  - Start: date
        //  - End: date
        //  - Current: checkbox
        fields: [
          "title:text!",
          "link:url",
          "description:markdown",
          "start:date",
          "end:date",
          "current:checkbox",
        ],
      },
    ],
  },
] as const;

cms.collection({
  name: "v2-resumes",
  description: "List of resumes generated following V2 format",
  store: "src:resumes/v2/*.yml",
  documentLabel(name) {
    return name.replace(".yml", "");
  },
  fields: [
    {
      name: "layout",
      type: "hidden",
      value: "layouts/resume/v2.pug",
    },
    {
      name: "metadata",
      description: "Meta data about this file",
      type: "object",
      view: "meta",
      /** Test
       *  - Meta: object-list:
       *    - Version: hidden = "v2"
       *    - Creation: readonly datetime => Date.now()
       *    - Modification: readonly current-datetime
       *    - Derived: select
       */
      fields: META_FIELDS,
      // [
      //   {
      //     name: "version",
      //     type: "hidden",
      //     value: "v2",
      //     attributes: {
      //       required: true,
      //     }
      //   },
      //   {
      //     name: "first_created",
      //     type: "datetime",
      //     attributes: {
      //       readonly: true,
      //       required: true,
      //     },
      //     value: 0,

      //     init(field) {
      //       const value = new Date()
      //       field.value = value;
      //     }
      //   },
      //   {
      //     name: "last_modified",
      //     type: "current-datetime",
      //     attributes: {
      //       readonly: true,
      //       required: true,
      //     },
      //   },
      //   {
      //     name: "dervied_from",
      //     description: "Other resume to derive (i.e., copy) data from",
      //     "type": "select",
      //     init(field, content) {
      //       const v2 = content.data.site.fs.entries.get("/resumes/v2");
      //       field.options = v2.children.values().map((x: { name: string }) => x.name).toArray();
      //     }
      //   },
      // ],
    },
    {
      name: "job_info",
      description: "Information about the job",
      type: "object",
      /**
       *  - Job Info: object-list:
       *    - Role Name: text!
       *    - Company Name: text!
       *    - Link(s): object-list:
       *      - Name?: text
       *      - Link: URL
       *    - Description: markdown
       */
      fields: JOB_INFO_FIELDS,
      // [
      //   "role:text!",
      //   "company:text!",
      //   {
      //     name: "links",
      //     description: "",
      //     type: "object-list",
      //     fields: [
      //       {
      //         name: "name",
      //         type: "text",
      //         options: [
      //           "Company Website",
      //           "LinkedIn",
      //           "Indeed",
      //           "ZipRecruiter",
      //           "Glassdoor",
      //           "Monster",
      //         ]
      //       },
      //       "link:url!",
      //     ],
      //   },
      //   "description:markdown",
      // ],
    },
    {
      name: "structure",
      type: "object",
      fields: STRUCTURE_FIELDS,
    },
    {
      name: "content",
      type: "object",
      fields: CONTENT_FIELDS,
    },
    {
      name: "style",
      description:
        "Modify styling of the resume (does not change content or structure)",
      type: "object",
      fields: [
        // TODO
      ],
    },
    {
      name: "application",
      description: "Information about the application process",
      type: "object",
      fields: [
        {
          name: "kind",
          type: "text",
          value: "custom",
          options: [
            "custom",
            "greenhouse",
            "workday",
            "linkedIn easy apply",
            "indeed",
          ],
        },
        {
          name: "commonQuestions",
          type: "list",
          value: ["name", "email", "phone"],
          options: [
            "name",
            "pronouns",
            "email",
            "phone",
            "address",
            "portfolio",
            "github",
            "linkedin",
            "blog",
            "website",
            "experience",
            "education",
            "voluntary self ID",
            "accept terms & conditions",
            "accept privacy policy",
            "additional questions",
            "references",
            "where I heard about job",
          ],
        },
        {
          name: "additionalQuestions",
          type: "object-list",
          fields: [
            "question:textarea!",
            "required:checkbox",
            "answer:textarea!",
            {
              name: "kind",
              type: "text",
              value: "text",
              options: [
                "text",
                "textarea",
                "radio",
                "checkbox",
                "number",
                "select",
                "slider",
              ],
            },
          ],
        },
        "additionalNotes:markdown",
      ],
    },
    {
      /**
       *  - Post Submission
       *    - Submitted: datetime
       *    - Events: object-list
       *      - DateTime: datetime
       *      - Title: text!
       *      - Description: textarea
       *    -
       */
      name: "post_submission",
      type: "object",
      fields: [
        "submission:datetime",
        {
          name: "events",
          type: "object-list",
          fields: [
            "title:text!",
            "datetime:datetime!",
            "description:textarea",
          ],
        },
      ],
    },
  ],
  documentName(data): string {
    // @deno-ts-ignore All fields in data are required and should uniquely describe a file
    return `${
      data.metadata.first_created.replace(/T.+Z/g, "")
    }-${data.job_info.role}-${data.job_info.company}-${
      dateToSimple(data.metadata.first_created)
    }.yml`;
  },
});

// TODO: Move to a separate utils file
function dateToSimple(datetime: string): string {
  const date = new Date(datetime);
  const yearCode = date.getFullYear() - 2000;
  const month = date.getMonth() + 1;
  let monthCode: number | "A" | "B" = month;
  if (month >= 10) {
    monthCode = month === 10 ? "A" : month === 11 ? "B" : 0;
  }
  return `${yearCode}${monthCode}`;
}

export default cms;

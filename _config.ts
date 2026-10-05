import lume from "lume/mod.ts";
import toml from "lume/plugins/toml.ts";
import yaml from "lume/plugins/yaml.ts";
import fff from "lume/plugins/fff.ts";
import inline from "lume/plugins/inline.ts";
import lightningCss from "lume/plugins/lightningcss.ts";
// Fixed version
// import icons from "./plugins/icons.ts";
import icons from "lume/plugins/icons.ts";
import metas from "lume/plugins/metas.ts";
import relations from "lume/plugins/relations.ts";
import date from "lume/plugins/date.ts";
import purgecss from "lume/plugins/purgecss.ts";

const icon_catalogs = [
  {
    id: "skill-icon",
    src: "https://skillicons.dev/icons?i={name}&theme={variant}",
    variants: [
      "dark",
      "light",
    ],
  },
  {
    id: "simpleicons",
    src: "https://cdn.jsdelivr.net/npm/simple-icons@13.20.0/icons/{name}.svg",
  },
];

// console.log(icon_catalogs);
// console.log(merge(defaults.catalogs, icon_catalogs));
const site = lume({
  src: "./src",
  // dest: "./docs",
  location: new URL("https://surajssingh.com"),
})
  .copy("assets", "assets")
  .use(date(
    {
      formats: {
        "CAL_YEAR": "yyyy",
        "LOC_YEAR": "YYYY",
      },
    },
  ))
  .use(toml())
  .use(yaml())
  .use(fff({
    date: "published",
  }))
  .use(icons(
    {
      // TODO: Figure out why this is not working
      catalogs: icon_catalogs,
    },
  ))
  .use(relations({
    foreignKeys: {
      project: "project_id",
      skill: {
        foreignKey: "skill_id",
        relationKey: "skill",
        pluralRelationKey: "skills_rel",
      },
      organization: {
        foreignKey: "org_id",
        relationKey: "organization",
        pluralRelationKey: "organizations",
      },
    },
  }));

// Identify legacy project documents without changing their URLs or frontmatter.
site.preprocess([".md"], (pages) => {
  for (const page of pages) {
    if (
      /^\/project\/[^/]+$/.test(page.src.path) &&
      page.src.path !== "/project/index"
    ) {
      page.data.type = "project";
    }
  }
});

site.use(lightningCss())
  .use(purgecss())
  .use(metas())
  .use(inline({
    copyAttributes: ["title", /^data-/, "fill"],
  }));
export default site;

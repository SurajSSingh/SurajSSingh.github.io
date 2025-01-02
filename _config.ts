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
import pug from "lume/plugins/pug.ts";
import date from "lume/plugins/date.ts";

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
    id: "devicon",
    src:
      "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/{name}/{name}-{variant}",
    variants: [
      "dark",
      "light",
    ],
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
  .use(pug())
  .use(fff({
    date: "published",
  }))
  .use(icons(
    {
      // TODO: Figure out why this is not working
      catalogs: icon_catalogs,
    },
  ))
  .use(inline())
  .use(lightningCss())
  .use(metas())
  .use(relations({
    foreignKeys: {
      project: "project_id",
      skill: "skill_id",
      organization: "org_id",
    },
  }));

if (Deno.env.get("LUME_DRAFTS") != "true") {
  site.ignore((path) => path.match(/^\/resumes/) !== null);
} else {
  // TODO: When drafting, regenerate encrypted resume file for Git
}

export default site;

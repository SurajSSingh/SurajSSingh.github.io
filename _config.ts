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
import unocss from "lume/plugins/unocss.ts";
import purgecss from "lume/plugins/purgecss.ts";
import { presetAttributify, presetWind3, presetWind4 } from "npm:unocss";

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
  .use(inline({
    copyAttributes: ["title", /^data-/, "fill"],
  }))
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
  // Production
  site.ignore((path) => path.match(/^\/resumes/) !== null);
} else {
  // TODO: When drafting, regenerate encrypted resume file for Git
  // Development
  if (Deno.env.get("UNO_STYLE")) {
    site.use(unocss({
      cssFile: false,
      options: {
        presets: [
          presetWind3,
          presetAttributify,
          presetWind4,
        ],
      },
    }))
      .use(purgecss());
  }
}

export default site;

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
import checkUrls from "lume/plugins/check_urls.ts";
import picture from "lume/plugins/picture.ts";
import transformImages from "lume/plugins/transform_images.ts";
import nav from "lume/plugins/nav.ts";
import redirects from "lume/plugins/redirects.ts";
import pagefind from "lume/plugins/pagefind.ts";
import toc from "lume/plugins/toc.ts";
import { create as createImage } from "lume/deps/sharp.ts";

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
  .add("assets/content-tools.css")
  .use(nav())
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

// Apply responsive presets centrally, including images authored in Markdown.
site.process([".html"], async (pages) => {
  const dimensions = new Map<string, { width: number; height: number }>();
  for (const page of pages) {
    for (const image of page.document?.querySelectorAll("#content img") || []) {
      const src = image.getAttribute("src") || "";
      const format = src.match(/^\/assets\/[^?#]+\.(png|jpe?g|webp|avif)$/i)
        ?.[1];
      if (
        !format || image.hasAttribute("inline") ||
        image.hasAttribute("srcset") || image.closest("picture") ||
        image.closest("[transform-images]") || !site.fs.entries.has(src)
      ) continue;

      if (!dimensions.has(src)) {
        const content = await site.getContent(src, true);
        const { width, height } = await createImage(content!).metadata();
        dimensions.set(src, { width: width!, height: height! });
      }
      const { width, height } = dimensions.get(src)!;
      // Match descriptors to actual output widths; Sharp does not upscale.
      const widths = [
        ...new Set([480, 960, 1440].map((size) => Math.min(size, width))),
      ];
      const fallback = format.toLowerCase().replace("jpeg", "jpg");
      image.setAttribute(
        "transform-images",
        `${[...new Set(["webp", fallback])].join(" ")} ${widths.join(" ")}`,
      );
      if (!image.hasAttribute("sizes")) {
        const displayWidth = Number(image.getAttribute("width"));
        image.setAttribute(
          "sizes",
          displayWidth > 0
            ? `${displayWidth}px`
            : image.closest(".card")
            ? "(min-width: 1200px) 600px, (min-width: 600px) 50vw, 100vw"
            : "(min-width: 1200px) 1200px, 100vw",
        );
      }
      if (!image.hasAttribute("width") && !image.hasAttribute("height")) {
        image.setAttribute("width", String(width));
        image.setAttribute("height", String(height));
        image.setAttribute("data-intrinsic-size", "");
      }
    }
  }
});

site.use(toc({ anchor: false }))
  .use(lightningCss())
  .use(purgecss({
    // Preserve markup generated later by Picture and Pagefind's browser UI.
    options: {
      safelist: {
        standard: ["picture", "source", /^pagefind-ui/],
      },
    },
  }))
  .use(picture())
  .use(transformImages())
  .use(redirects({ output: "html" }))
  .use(metas())
  .use(inline({
    copyAttributes: ["title", /^data-/, "fill"],
  }))
  .use(pagefind({
    ui: {
      showImages: false,
      showSubResults: true,
      showEmptyFilters: false,
    },
  }))
  .use(checkUrls({
    external: false,
    anchors: true,
    strict: false,
    throw: false,
    // These same-origin URLs are deployed by the separate Collabuilder repo.
    ignore: [
      "https://surajssingh.com/Collabuilder/",
      "https://surajssingh.com/Collabuilder/images/Level-2.png",
    ],
    output(brokenLinks) {
      if (!brokenLinks.size) {
        console.info("[Check URLs] No broken links found.");
      }
      for (const [url, pages] of brokenLinks) {
        console.warn(
          `[Check URLs] ${url}\n  Referenced by: ${[...pages].join(", ")}`,
        );
      }
    },
  }));
export default site;

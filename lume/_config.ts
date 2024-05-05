import lume from "lume/mod.ts";
import toml from "lume/plugins/toml.ts";
import fff from "lume/plugins/fff.ts";

const site = lume({
    src: "./content",
    dest: "./docs",
    location: new URL("https://surajssingh.com"),
});

site.use(toml());
site.use(fff({
    date: "published",
  }));

export default site;

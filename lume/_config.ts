import lume from "lume/mod.ts";

const site = lume({
    src: "./content",
    dest: "./docs",
    location: new URL("https://surajssingh.com"),
});

export default site;

import lumeCMS from "lume/cms/mod.ts";

const cms = lumeCMS();

cms.storage("img", "assets/images");
cms.collection(
    "projects: Here you add, edit or delete projects for the portfolio",
    "src:project/*.md",
    [        
        "title: text!",
        "summary: text",
        "cover_image: url",
        "cover_image_alt: text",
        "weight: number",
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

export default cms;

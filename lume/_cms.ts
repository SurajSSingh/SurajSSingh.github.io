import lumeCMS from "lume/cms/mod.ts";

const cms = lumeCMS();

cms.storage("my_files", "files");
// TODO: Replace examples with actual items
cms.collection(
    "posts: Here you add, edit or delete the posts of your blog",
    "src:posts/*.md",
    [
        "title: text",
        "content: markdown",
    ],
);

cms.document(
    "landing-page: Edit the content of the landing page",
    "src:index.yml",
    [
        "title: text",
        "subtitle: text",
        "content: markdown",
    ],
);

export default cms;

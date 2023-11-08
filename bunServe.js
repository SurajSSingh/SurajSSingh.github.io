const PUBLIC_DIR = "./docs/";
const PORT = 8080;
import data from "./Blades.toml";
const BASE_URL = data?.url + "/" || "";

Bun.serve({
    port: PORT,
    fetch(req) {
        console.log(req.url)
        const url = new URL(req.url);
        let start = url.pathname.lastIndexOf(BASE_URL);
        start = start >= 0 ? start + BASE_URL.length : 0;
        console.log(start)
        const pathname = PUBLIC_DIR + url.pathname.slice(start);
        console.log("Loading: ", pathname);
        // 
        const file = pathname.endsWith(".html") || pathname.endsWith(".css") || pathname.endsWith(".js") || pathname.endsWith(".png") || pathname.endsWith(".xml")
            ? Bun.file(pathname)
            : Bun.file(pathname + "/index.html");
        if (file.size === 0) {
            throw new Error(`No file found!: ${pathname}`);
        }

        return new Response(file);
    },
});

console.log(`Listening on http://localhost:${PORT}`);
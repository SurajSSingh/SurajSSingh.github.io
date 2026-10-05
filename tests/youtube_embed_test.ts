import { equal, match, ok } from "node:assert/strict";
import { engine } from "lume/deps/vento.ts";

const templates = engine({
  includes: new URL(
    "../src/_includes/layouts/website/components/",
    import.meta.url,
  ).pathname,
});
const videoId = "Y2gcbZS6NvI";

async function render(link: string, data: Record<string, unknown> = {}) {
  return (await templates.run("youtube_embed.vto", { link, ...data })).content;
}

Deno.test("YouTube template normalizes IDs and supported URLs", async () => {
  for (
    const link of [
      videoId,
      "aB0_-cD1eF2",
      `https://www.youtube.com/watch?v=${videoId}`,
      `https://youtube.com/watch?feature=shared&v=${videoId}&t=30#details`,
      `https://m.youtube.com/watch?v=${videoId}`,
      `http://www.youtube.com/watch?v=${videoId}`,
      `https://youtu.be/${videoId}?si=shared&t=30`,
      `https://youtu.be/${videoId}/`,
      `https://www.youtube.com/embed/${videoId}?start=30`,
      `https://www.youtube-nocookie.com/embed/${videoId}`,
      `https://youtube-nocookie.com/embed/${videoId}/`,
      `https://www.youtube.com/shorts/${videoId}?feature=share`,
      `https://youtube.com/shorts/${videoId}/`,
      `  https://www.youtube.com/watch?v=${videoId}  `,
    ]
  ) {
    const html = await render(link);
    const expectedId = link === "aB0_-cD1eF2" ? link : videoId;
    equal(
      html.match(/src="([^"]+)"/)?.[1],
      `https://www.youtube-nocookie.com/embed/${expectedId}`,
      link,
    );
    match(html, /<iframe\s/);
    ok(!html.includes("<a "), link);
  }
});

Deno.test("YouTube template preserves iframe dimensions and title", async () => {
  const html = await render(`https://www.youtube.com/watch?v=${videoId}`, {
    width: 640,
    height: 360,
    title: "Project trailer",
  });
  match(html, /width="640"/);
  match(html, /height="360"/);
  match(html, /title="Project trailer"/);
  match(html, /frameborder="0"/);
  match(html, /referrerpolicy="strict-origin-when-cross-origin"/);
  match(html, /allowfullscreen/);
});

Deno.test("YouTube template omits unspecified dimensions", async () => {
  const html = await render(videoId);
  ok(!html.includes("width="));
  ok(!html.includes("height="));
});

Deno.test("YouTube template renders unsupported inputs as links", async () => {
  for (
    const link of [
      "https://example.com/trailer",
      `https://example.com/youtube.com/watch?v=${videoId}`,
      `https://www.youtube.com.example.com/watch?v=${videoId}`,
      `https://www.youtube.com/playlist?list=${videoId}`,
      "https://www.youtube.com/watch",
      "https://www.youtube.com/watch?v=invalid",
      "https://youtu.be/invalid",
      `https://youtu.be/${videoId}/extra`,
      "https://www.youtube.com/embed/invalid",
      "https://www.youtube.com/shorts/invalid",
      `ftp://www.youtube.com/watch?v=${videoId}`,
      "not a video ID",
      "",
    ]
  ) {
    const html = await render(link, { title: "Project trailer" });
    equal(html.trim(), `<a href="${link}">Project trailer</a>`, link);
    ok(!html.includes("<iframe"), link);
  }
});

Deno.test("YouTube template uses the URL as the fallback link label", async () => {
  const link = "https://example.com/trailer";
  equal((await render(link)).trim(), `<a href="${link}">${link}</a>`);
});

Deno.test("YouTube template escapes fallback link attributes and text", async () => {
  const html = await render('https://example.com/?a="trailer"&b=1', {
    title: 'Trailer <preview> & "demo"',
  });
  equal(
    html.trim(),
    '<a href="https://example.com/?a=&quot;trailer&quot;&amp;b=1">Trailer &lt;preview&gt; &amp; &quot;demo&quot;</a>',
  );
});

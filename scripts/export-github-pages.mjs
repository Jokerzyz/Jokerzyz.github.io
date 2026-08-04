import { cp, mkdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const projectRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);
const clientRoot = path.join(projectRoot, "dist", "client");
const serverEntry = path.join(projectRoot, "dist", "server", "index.js");
const outputRoot = path.join(projectRoot, "dist", "github-pages");
const experienceRoot = path.join(clientRoot, "网站内容", "经历");
const customDomain =
  process.env.GITHUB_PAGES_DOMAIN?.trim() || "zyrondesignz.com";
const publicOrigin = `https://${customDomain}`;

function shouldCopy(source) {
  const relativeExperiencePath = path.relative(experienceRoot, source);
  const isExperienceAsset =
    relativeExperiencePath !== "" &&
    !relativeExperiencePath.startsWith(`..${path.sep}`) &&
    relativeExperiencePath !== "..";

  if (isExperienceAsset && path.basename(source) === "视频.mp4") {
    return false;
  }

  return path.basename(source) !== ".DS_Store";
}

async function renderIndexHtml() {
  const workerUrl = pathToFileURL(serverEntry);
  workerUrl.searchParams.set("github-pages-export", `${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);
  const response = await worker.fetch(
    new Request(`${publicOrigin}/`, {
      headers: { accept: "text/html" },
    }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    {
      waitUntil() {},
      passThroughOnException() {},
    },
  );

  if (!response.ok) {
    throw new Error(`Static HTML render failed with status ${response.status}`);
  }

  return response.text();
}

await rm(outputRoot, { recursive: true, force: true });
await mkdir(outputRoot, { recursive: true });
await cp(clientRoot, outputRoot, { recursive: true, filter: shouldCopy });

const html = await renderIndexHtml();
await Promise.all([
  writeFile(path.join(outputRoot, "index.html"), html, "utf8"),
  writeFile(path.join(outputRoot, "404.html"), html, "utf8"),
  writeFile(path.join(outputRoot, ".nojekyll"), "", "utf8"),
  writeFile(path.join(outputRoot, "CNAME"), `${customDomain}\n`, "utf8"),
]);

console.log(`GitHub Pages export ready: ${outputRoot}`);
console.log(`Public origin: ${publicOrigin}`);

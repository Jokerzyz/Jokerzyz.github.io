import { cp, mkdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const projectRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);
const clientRoot = path.join(projectRoot, "dist", "client");
const serverEntry = path.join(projectRoot, "dist", "server", "index.js");
const outputRoot = path.join(projectRoot, "dist", "oss-site");
const siteContentRoot = path.join(clientRoot, "网站内容");
const customDomain = process.env.PUBLIC_SITE_DOMAIN?.trim() || "zyrondesignz.com";
const publicOrigin = `https://${customDomain}`;
const unusedStaticRoots = new Set([
  ".assetsignore",
  "_headers",
  "file.svg",
  "globe.svg",
  "models",
  "og.png",
  "window.svg",
]);

function shouldCopy(source) {
  const relativeClientPath = path.relative(clientRoot, source);
  const rootSegment = relativeClientPath.split(path.sep)[0];
  if (unusedStaticRoots.has(rootSegment)) return false;

  const relativeSiteContentPath = path.relative(siteContentRoot, source);
  const isSiteContentAsset =
    relativeSiteContentPath === "" ||
    (!relativeSiteContentPath.startsWith(`..${path.sep}`) &&
      relativeSiteContentPath !== "..");

  if (isSiteContentAsset) return false;
  return path.basename(source) !== ".DS_Store";
}

async function renderIndexHtml() {
  const workerUrl = pathToFileURL(serverEntry);
  workerUrl.searchParams.set("oss-static-export", `${Date.now()}`);
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
]);

console.log(`OSS static export ready: ${outputRoot}`);
console.log(`Public origin: ${publicOrigin}`);

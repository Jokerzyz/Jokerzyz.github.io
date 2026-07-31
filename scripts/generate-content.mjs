import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const publicRoot = path.join(projectRoot, "public");
const contentRoot = path.join(publicRoot, "网站内容");
const outputFile = path.join(projectRoot, "app", "content.generated.ts");

const imageExtensions = new Set([".avif", ".gif", ".jpeg", ".jpg", ".png", ".webp"]);
const videoExtensions = new Set([".m4v", ".mov", ".mp4", ".webm"]);
const mediaExtensions = new Set([...imageExtensions, ...videoExtensions]);
const accents = ["#ff1b0a", "#2b65ff", "#d8ff36", "#ff5c8a"];
const surfaces = ["#d9d7d0", "#e9e6dc", "#171717", "#eee8dd"];

async function exists(target) {
  try {
    await fs.access(target);
    return true;
  } catch {
    return false;
  }
}

async function readText(directory, filename, fallback = "") {
  try {
    return (await fs.readFile(path.join(directory, filename), "utf8")).trim() || fallback;
  } catch {
    return fallback;
  }
}

async function readTextAllowEmpty(directory, filename, fallback = "") {
  try {
    return (await fs.readFile(path.join(directory, filename), "utf8")).trim();
  } catch {
    return fallback;
  }
}

async function listDirectories(directory) {
  if (!(await exists(directory))) return [];
  const entries = await fs.readdir(directory, { withFileTypes: true });
  return entries
    .filter((entry) => entry.isDirectory() && !entry.name.startsWith("_") && !entry.name.startsWith("."))
    .map((entry) => entry.name);
}

async function listFiles(directory) {
  if (!(await exists(directory))) return [];
  const entries = await fs.readdir(directory, { withFileTypes: true });
  return entries.filter((entry) => entry.isFile()).map((entry) => entry.name);
}

function naturalCompare(left, right) {
  return left.localeCompare(right, "zh-CN", { numeric: true, sensitivity: "base" });
}

function publicUrl(filePath) {
  const relative = path.relative(publicRoot, filePath);
  return `/${relative.split(path.sep).map(encodeURIComponent).join("/")}`;
}

async function findNamedMedia(directory, stems, extensions = mediaExtensions) {
  const files = await listFiles(directory);
  const loweredStems = stems.map((stem) => stem.toLowerCase());
  const match = files.find((file) => {
    const parsed = path.parse(file);
    return extensions.has(parsed.ext.toLowerCase()) && loweredStems.includes(parsed.name.toLowerCase());
  });
  return match ? publicUrl(path.join(directory, match)) : "";
}

async function readOrder(directory, fallback) {
  const value = Number.parseFloat(await readText(directory, "排序.txt", String(fallback)));
  return Number.isFinite(value) ? value : fallback;
}

async function readProjectVisuals(projectDirectory) {
  const mediaDirectory = path.join(projectDirectory, "内容");
  const files = (await listFiles(mediaDirectory))
    .filter((file) => mediaExtensions.has(path.extname(file).toLowerCase()))
    .sort(naturalCompare);

  return Promise.all(
    files.map(async (file) => {
      const parsed = path.parse(file);
      const extension = parsed.ext.toLowerCase();
      const label = await readText(
        mediaDirectory,
        `${parsed.name}.txt`,
        parsed.name.replace(/^\d+[\s._-]*/, "") || parsed.name,
      );
      const base = {
        kind: videoExtensions.has(extension) ? "video" : "image",
        label,
        src: publicUrl(path.join(mediaDirectory, file)),
      };

      if (base.kind === "video") {
        const poster = await findNamedMedia(
          mediaDirectory,
          [`${parsed.name}-封面`, `${parsed.name}_封面`, `${parsed.name}-poster`],
          imageExtensions,
        );
        return poster ? { ...base, poster } : base;
      }

      return base;
    }),
  );
}

async function readProjects() {
  const root = path.join(contentRoot, "作品");
  const names = await listDirectories(root);
  const projects = await Promise.all(
    names.map(async (name, index) => {
      const directory = path.join(root, name);
      const visuals = await readProjectVisuals(directory);
      const cover =
        (await findNamedMedia(directory, ["封面", "cover"], imageExtensions)) ||
        visuals.find((visual) => visual.kind === "image")?.src ||
        "";

      return {
        order: await readOrder(directory, index + 1),
        title: name,
        category: await readText(directory, "分类.txt", "精选项目"),
        year: await readText(directory, "年份.txt", "2026"),
        client: await readText(directory, "客户.txt", "个人项目"),
        subtitle: await readText(directory, "副标题.txt", "视觉与动态项目"),
        description: await readText(directory, "简介.txt", "请在简介.txt中填写项目介绍。"),
        stack: await readText(directory, "职责.txt", "VISUAL / MOTION / DESIGN"),
        accent: await readText(directory, "主题色.txt", accents[index % accents.length]),
        surface: await readText(directory, "背景色.txt", surfaces[index % surfaces.length]),
        cover,
        visuals,
      };
    }),
  );

  return projects.sort((left, right) => left.order - right.order || naturalCompare(left.title, right.title));
}

async function readExperiences() {
  const root = path.join(contentRoot, "经历");
  const names = await listDirectories(root);
  const experiences = await Promise.all(
    names.map(async (name, index) => {
      const directory = path.join(root, name);
      const mediaKindValue = await readText(directory, "风格.txt", ["edit", "brand", "interactive"][index % 3]);
      const mediaKind = ["edit", "brand", "interactive"].includes(mediaKindValue)
        ? mediaKindValue
        : "interactive";

      return {
        order: await readOrder(directory, Number.parseFloat(name) || index + 1),
        date: name,
        label: await readTextAllowEmpty(directory, "时间线名称.txt", "工作经历"),
        company: await readText(directory, "公司.txt", "公司名称"),
        role: await readText(directory, "职位.txt", "视觉设计"),
        title: await readText(directory, "标题.txt", "这一阶段的经历"),
        copy: await readText(directory, "简介.txt", "请在简介.txt中填写这段经历。"),
        mediaKind,
        mediaLabel: await readText(directory, "视频标题.txt", `${name} 项目影像`),
        video: await findNamedMedia(directory, ["视频", "reel", "showreel"], videoExtensions),
        poster: await findNamedMedia(directory, ["封面", "poster"], imageExtensions),
        image: await findNamedMedia(directory, ["图片", "照片", "image", "photo"], imageExtensions),
      };
    }),
  );

  return experiences.sort((left, right) => left.order - right.order || naturalCompare(left.date, right.date));
}

async function readHome() {
  const directory = path.join(contentRoot, "首页");
  return {
    name: await readText(directory, "姓名.txt", "ZHENYUAN ZHANG"),
    role: await readText(directory, "职位.txt", "视觉设计 / 创意开发"),
    intro: await readText(directory, "简介.txt", "专注品牌视觉、动态影像与互动网页。"),
    edition: await readText(directory, "版本.txt", "PORTFOLIO / 2026"),
    photo: await findNamedMedia(directory, ["照片", "头像", "portrait", "photo"], imageExtensions),
    video: await findNamedMedia(directory, ["首屏视频", "视频", "showreel"], videoExtensions),
    poster: await findNamedMedia(directory, ["视频封面", "封面", "poster"], imageExtensions),
  };
}

async function readContact() {
  const directory = path.join(contentRoot, "联系");
  return {
    email: await readText(directory, "邮箱.txt"),
    wechat: await readText(directory, "微信.txt"),
    xiaohongshu: await readText(directory, "小红书.txt"),
    linkedin: await readText(directory, "领英.txt"),
    note: await readText(directory, "说明.txt", "有合适的项目，欢迎联系"),
  };
}

const generatedContent = {
  home: await readHome(),
  projects: await readProjects(),
  experiences: await readExperiences(),
  contact: await readContact(),
};

const output = `// 此文件由 scripts/generate-content.mjs 自动生成，请编辑 public/网站内容。\nexport const generatedContent = ${JSON.stringify(generatedContent, null, 2)};\n`;
await fs.writeFile(outputFile, output, "utf8");
console.log(`已同步 ${generatedContent.projects.length} 个作品、${generatedContent.experiences.length} 段经历。`);

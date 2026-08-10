import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { readFile } from "node:fs/promises";
import test from "node:test";

const require = createRequire(import.meta.url);
let pageModulePromise;

async function loadPageModule() {
  pageModulePromise ??= (async () => {
    const [typescript, source] = await Promise.all([
      import("typescript"),
      readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    ]);
    const output = typescript.transpileModule(source, {
      compilerOptions: {
        jsx: typescript.JsxEmit.ReactJSX,
        module: typescript.ModuleKind.CommonJS,
        target: typescript.ScriptTarget.ES2022,
      },
      fileName: "page.tsx",
    }).outputText;
    const commonJsModule = { exports: {} };
    const localRequire = (specifier) => {
      if (specifier === "./content.generated") {
        return {
          generatedContent: {
            home: {
              name: "",
              role: "",
              intro: "",
              edition: "",
              photo: "",
              video: "",
              poster: "",
            },
            projects: [],
            experiences: [],
            contact: { email: "", wechat: "" },
          },
        };
      }
      return require(specifier);
    };
    const evaluateCommonJs = new Function(
      "exports",
      "require",
      "module",
      "__filename",
      "__dirname",
      output,
    );
    evaluateCommonJs(
      commonJsModule.exports,
      localRequire,
      commonJsModule,
      "page.tsx",
      ".",
    );
    return commonJsModule.exports;
  })();

  return pageModulePromise;
}

async function render() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request("http://localhost/", {
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
}

test("server-renders the portfolio shell and metadata", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<html[^>]*lang="zh-CN"/i);
  assert.match(html, /<title>ZHENYUAN ZHANG — 中文创意作品集<\/title>/i);
  assert.match(html, /https:\/\/zyrondesignz\.com\/portfolio-og\.png/i);
  assert.doesNotMatch(html, /http:\/\/localhost:3000\/portfolio-og\.png/i);
  assert.match(html, /<nav[^>]*aria-label="主要导航"/i);
  assert.match(html, /href="#home"/i);
  assert.match(html, /href="#work"/i);
  assert.match(html, /href="#about"/i);
  assert.match(html, /href="#contact"/i);
  assert.match(html, /aria-current="page"/i);
  assert.match(html, /role="status"/i);
  assert.doesNotMatch(html, /首页粒子角色\.mp4/i);
  assert.doesNotMatch(html, /粒子测试-电影工作场景\.png/i);
  assert.doesNotMatch(html, /class="particle-portrait-fallback"/i);
  assert.doesNotMatch(html, /alt="电影化工作场景中的创作者静帧"/i);
  assert.match(html, /aria-hidden="true"[^>]*class="side-nav"|class="side-nav"[^>]*aria-hidden="true"/i);
  assert.match(html, /tabindex="-1"/i);
  assert.match(html, /PLAY ONCE \/ CLICK TO REPLAY/i);
  const pageSource = await readFile(
    new URL("../app/page.tsx", import.meta.url),
    "utf8",
  );
  assert.match(pageSource, /PERSONAL DEV TOOL WEBSITE/i);
  assert.match(pageSource, /https:\/\/www\.zyronmatrix\.com\//i);
  assert.match(pageSource, /zhangzhenyuan95@gmail\.com/i);
  assert.match(pageSource, /微信二维码\.jpg/i);
  const generatedContentSource = await readFile(
    new URL("../app/content.generated.ts", import.meta.url),
    "utf8",
  );
  const experienceVideoSources = [
    ...generatedContentSource.matchAll(
      /"video":\s*"([^"]*%E8%A7%86%E9%A2%91[^"]*)"/g,
    ),
  ].filter(([, source]) => source.includes("%E7%BB%8F%E5%8E%86"));
  assert.equal(experienceVideoSources.length, 4);
  assert.ok(
    experienceVideoSources.every(([, source]) =>
      source.includes("%E5%8E%8B%E7%BC%A9"),
    ),
  );
  assert.doesNotMatch(html, /像素调参/i);
  assert.match(html, />WELCOME</i);
  assert.match(html, /PORTFOLIO \/ INITIALIZING/i);
  assert.doesNotMatch(html, /class="intro-particle-canvas"/i);
  assert.doesNotMatch(html, /class="intro-red-panel"/i);
  assert.doesNotMatch(html, /class="intro-matrix-room"/i);
  assert.match(html, /class="intro-title-assembly"/i);
  assert.doesNotMatch(html, /class="intro-exit-columns"/i);
  assert.doesNotMatch(html, /Your site is taking shape|Building your site/i);
});

test("home intro curtain skips particle convergence and keeps its reveal timing", async () => {
  const {
    getParticleMatrixIntroConfig,
    getParticleMatrixPreviewRect,
    particleMatrixIntroDuration,
    particleMatrixIntroTimeline,
    shouldRunParticleMatrixIntro,
  } = await loadPageModule();
  const desktop = getParticleMatrixIntroConfig(false);
  const mobile = getParticleMatrixIntroConfig(true);

  const desktopPreview = getParticleMatrixPreviewRect(1932, 1324);
  const mobilePreview = getParticleMatrixPreviewRect(390, 844);

  assert.equal(particleMatrixIntroDuration, 1780);
  assert.deepEqual(particleMatrixIntroTimeline, {
    welcomeEnd: 600,
    blackoutEnd: 700,
    particleStart: 700,
    gatherStart: 860,
    gatherEnd: 1750,
    contentRevealStart: 620,
    contentAssembleEnd: 2400,
    stableAt: 2700,
    navRevealStart: 800,
    duration: 1780,
  });
  assert.equal(desktop.particleLimit, 2400);
  assert.equal(mobile.particleLimit, 860);
  assert.equal(desktop.sampleWidth, 360);
  assert.equal(mobile.sampleWidth, 240);
  assert.equal(desktop.maxDpr, 1);
  assert.equal(mobile.maxDpr, 1);
  assert.equal(desktop.finalImageScale, 0.4);
  assert.equal(mobile.finalImageScale, 0.34);
  assert.deepEqual(desktopPreview, {
    x: 45,
    y: 16,
    width: 1871,
    height: 963.56,
  });
  assert.equal(mobilePreview.x, 8);
  assert.equal(mobilePreview.y, 8);
  assert.equal(mobilePreview.width, 374);
  assert.ok(Math.abs(mobilePreview.height - 596.304) < 0.001);
  assert.equal(shouldRunParticleMatrixIntro(false, false), false);
  assert.equal(shouldRunParticleMatrixIntro(true, false), false);
  assert.equal(shouldRunParticleMatrixIntro(false, true), false);
});

test("home pixel video plays once, holds its last frame, and replays on demand", async () => {
  const pageSource = await readFile(
    new URL("../app/page.tsx", import.meta.url),
    "utf8",
  );
  const portraitSource = pageSource.slice(
    pageSource.indexOf("function InteractiveParticlePortrait"),
    pageSource.indexOf("function HomeShowreel"),
  );

  assert.match(portraitSource, /src=\{particlePortraitVideoSrc\}/);
  assert.match(portraitSource, /preload="auto"/);
  assert.match(portraitSource, /autoPlay=\{!reducedMotion && !suspended\}/);
  assert.match(portraitSource, /onEnded=\{\(\) => setEnded\(true\)\}/);
  assert.match(portraitSource, /if \(!video \|\| !ended\) return/);
  assert.match(portraitSource, /video\.currentTime\s*=\s*0/);
  assert.match(portraitSource, /data-video-ended=\{ended \? "true" : undefined\}/);
  assert.doesNotMatch(portraitSource, /\bloop\b/);
  assert.doesNotMatch(
    portraitSource,
    /pointermove|pointerleave|VideoTexture|PlaneGeometry|WebGLRenderer|uTrail/,
  );
});

test("media origins rewrite only local site-content URLs", async () => {
  const { resolveMediaUrl } = await loadPageModule();
  const localPath = "/网站内容/作品/封面.jpg";
  const encodedPath =
    "/%e7%bd%91%e7%ab%99%e5%86%85%e5%ae%b9/%E4%BD%9C%E5%93%81/%E5%B0%81%E9%9D%A2.jpg";
  const origin = "https://media.example.com///";

  assert.equal(resolveMediaUrl(localPath, ""), localPath);
  assert.equal(
    resolveMediaUrl(localPath, origin),
    "https://media.example.com/网站内容/作品/封面.jpg",
  );
  assert.equal(
    resolveMediaUrl(encodedPath, origin),
    `https://media.example.com${encodedPath}`,
  );
  assert.equal(
    resolveMediaUrl("/other/封面.jpg", origin),
    "/other/封面.jpg",
  );
  assert.equal(
    resolveMediaUrl("https://cdn.example.com/封面.jpg", origin),
    "https://cdn.example.com/封面.jpg",
  );
  assert.equal(resolveMediaUrl(undefined, origin), undefined);
});

test("media-origin deployment wiring avoids the retired preload", async () => {
  const [layoutSource, workflowSource] = await Promise.all([
    readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
    readFile(
      new URL("../.github/workflows/deploy-pages.yml", import.meta.url),
      "utf8",
    ),
  ]);

  assert.doesNotMatch(layoutSource, /首页粒子角色\.mp4/);
  assert.match(
    workflowSource,
    /NEXT_PUBLIC_MEDIA_ORIGIN:\s*\$\{\{\s*vars\.MEDIA_ORIGIN\s*\|\|\s*''\s*\}\}/,
  );
});

test("global shortcuts filter targets and prevent defaults only when handled", async () => {
  const { handlePortfolioShortcut } = await loadPageModule();
  const calls = { navigate: [], close: 0, change: [] };
  const callbacks = {
    navigate: (section) => calls.navigate.push(section),
    closeProject: () => {
      calls.close += 1;
    },
    changeProject: (direction) => calls.change.push(direction),
  };
  const makeEvent = (key, overrides = {}) => {
    let preventions = 0;
    return {
      event: {
        key,
        defaultPrevented: false,
        metaKey: false,
        ctrlKey: false,
        altKey: false,
        preventDefault: () => {
          preventions += 1;
        },
        ...overrides,
      },
      preventions: () => preventions,
    };
  };

  const interactive = makeEvent("ArrowRight");
  assert.equal(
    handlePortfolioShortcut({
      event: interactive.event,
      interactiveTarget: true,
      detailIndex: null,
      active: "home",
      ...callbacks,
    }),
    false,
  );
  assert.equal(interactive.preventions(), 0);

  const modified = makeEvent("ArrowRight", { ctrlKey: true });
  assert.equal(
    handlePortfolioShortcut({
      event: modified.event,
      interactiveTarget: false,
      detailIndex: null,
      active: "home",
      ...callbacks,
    }),
    false,
  );
  assert.equal(modified.preventions(), 0);

  const boundary = makeEvent("ArrowDown");
  assert.equal(
    handlePortfolioShortcut({
      event: boundary.event,
      interactiveTarget: false,
      detailIndex: null,
      active: "contact",
      ...callbacks,
    }),
    false,
  );
  assert.equal(boundary.preventions(), 0);

  const sectionMove = makeEvent("ArrowRight");
  assert.equal(
    handlePortfolioShortcut({
      event: sectionMove.event,
      interactiveTarget: false,
      detailIndex: null,
      active: "home",
      ...callbacks,
    }),
    true,
  );
  assert.equal(sectionMove.preventions(), 1);
  assert.deepEqual(calls.navigate, ["work"]);

  const projectMove = makeEvent("ArrowLeft");
  assert.equal(
    handlePortfolioShortcut({
      event: projectMove.event,
      interactiveTarget: false,
      detailIndex: 2,
      active: "work",
      ...callbacks,
    }),
    true,
  );
  assert.equal(projectMove.preventions(), 1);
  assert.deepEqual(calls.change, [-1]);

  const close = makeEvent("Escape");
  assert.equal(
    handlePortfolioShortcut({
      event: close.event,
      interactiveTarget: false,
      detailIndex: 2,
      active: "work",
      ...callbacks,
    }),
    true,
  );
  assert.equal(close.preventions(), 1);
  assert.equal(calls.close, 1);
});

test("roving selection follows the item nearest the visual center", async () => {
  const { getNearestRovingIndex } = await loadPageModule();

  assert.equal(
    getNearestRovingIndex(
      [
        { index: 0, center: -40 },
        { index: 1, center: 350 },
        { index: 2, center: 690 },
      ],
      360,
      0,
    ),
    1,
  );
  assert.equal(
    getNearestRovingIndex(
      [
        { index: 1, center: 80 },
        { index: 2, center: 355 },
        { index: 3, center: 720 },
      ],
      360,
      1,
    ),
    2,
  );
  assert.equal(getNearestRovingIndex([], 360, 4), 4);
});

test("reduced-motion changes pause media without forcing playback", async () => {
  const { pauseMediaForReducedMotion } = await loadPageModule();
  let pauses = 0;
  const media = { pause: () => (pauses += 1) };

  assert.equal(pauseMediaForReducedMotion(media, false), false);
  assert.equal(pauses, 0);
  assert.equal(pauseMediaForReducedMotion(media, true), true);
  assert.equal(pauses, 1);
  assert.equal(pauseMediaForReducedMotion(null, true), false);
});

test("disposed animation lifecycles cannot restart scheduled work", async () => {
  const { createAnimationLifecycle } = await loadPageModule();
  const lifecycle = createAnimationLifecycle();
  let scheduled = 0;

  assert.equal(lifecycle.run(() => (scheduled += 1)), true);
  assert.equal(scheduled, 1);
  lifecycle.dispose();
  assert.equal(lifecycle.isActive(), false);
  assert.equal(lifecycle.run(() => (scheduled += 1)), false);
  assert.equal(scheduled, 1);
});

test("ABOUT media load and resize reuse one pending animation frame", async () => {
  const { createSingleFlightAnimationFrame } = await loadPageModule();
  let nextFrame = 0;
  let maxPendingFrames = 0;
  let renders = 0;
  const pendingFrames = new Map();
  const frameLoop = createSingleFlightAnimationFrame(
    (callback) => {
      const frame = (nextFrame += 1);
      pendingFrames.set(frame, callback);
      maxPendingFrames = Math.max(maxPendingFrames, pendingFrames.size);
      return frame;
    },
    (frame) => pendingFrames.delete(frame),
  );
  const render = (time) => {
    renders += 1;
    assert.equal(typeof time, "number");
    frameLoop.schedule(render);
  };
  const onMediaLoad = () => frameLoop.schedule(render);
  const onResize = () => frameLoop.schedule(render);

  assert.equal(frameLoop.schedule(render), true);
  assert.equal(onMediaLoad(), false);
  assert.equal(onResize(), false);
  assert.equal(pendingFrames.size, 1);
  assert.equal(maxPendingFrames, 1);

  const [frame, callback] = pendingFrames.entries().next().value;
  pendingFrames.delete(frame);
  callback(16);
  assert.equal(renders, 1);
  assert.equal(pendingFrames.size, 1);
  assert.equal(maxPendingFrames, 1);

  frameLoop.dispose();
  assert.equal(pendingFrames.size, 0);
  assert.equal(frameLoop.hasPendingFrame(), false);
  assert.equal(onMediaLoad(), false);
});

test("project display titles remain bound to project identity after reorder", async () => {
  const { getProjectDisplayTitle } = await loadPageModule();
  const reorderedProjects = [
    { title: "产品CGI视觉" },
    { title: "Meshy生成式3D" },
    { title: "NFT" },
    { title: "冬奥会产品项目" },
  ];

  assert.deepEqual(reorderedProjects.map(getProjectDisplayTitle), [
    "PRODUCT CGI",
    "MESHY",
    "CUBE",
    "OLYMPIC",
  ]);
  assert.equal(getProjectDisplayTitle({ title: "未知项目" }), "未知项目");
  assert.equal(
    getProjectDisplayTitle({ title: "未知项目", displayTitle: "CUSTOM" }),
    "CUSTOM",
  );
  assert.equal(
    getProjectDisplayTitle({ title: "NFT", displayTitle: "  CUBE ALT  " }),
    "CUBE ALT",
  );
});

test("work preview modes keep cover as the default and allow explicit fitting", async () => {
  const { getPreviewFit, getProjectPreviewMode } = await loadPageModule();

  assert.equal(getProjectPreviewMode({}), "auto");
  assert.equal(getProjectPreviewMode({ previewMode: "invalid" }), "auto");
  assert.equal(getProjectPreviewMode({ previewMode: "contain" }), "contain");
  assert.equal(getProjectPreviewMode({ previewMode: "cover" }), "cover");
  assert.equal(getPreviewFit(undefined), "cover");
  assert.equal(getPreviewFit("auto"), "cover");
  assert.equal(getPreviewFit("auto", 16 / 9), "contain");
  assert.equal(getPreviewFit("auto", 1), "cover");
  assert.equal(getPreviewFit("contain", 1), "contain");
  assert.equal(getPreviewFit("cover", 16 / 9), "cover");
});

test("content sync emits the configured Work labels and fill mode", async () => {
  const [generated, generator] = await Promise.all([
    readFile(new URL("../app/content.generated.ts", import.meta.url), "utf8"),
    readFile(new URL("../scripts/generate-content.mjs", import.meta.url), "utf8"),
  ]);
  const configuredProjects = [
    ["冬奥会产品项目", "OLYMPIC"],
    ["Meshy生成式3D", "MESHY"],
    ["NFT", "NFT"],
    ["AI视觉工作流", "AI Workflow"],
    ["3D:IP 角色", "CHARACTER"],
    ["产品CGI视觉", "PRODUCT CGI"],
  ];

  assert.match(generator, /展示名称\.txt/);
  assert.match(generator, /预览方式\.txt/);
  assert.match(generator, /replace\(\/%3A\/gi, ":"\)/);
  assert.doesNotMatch(generated, /3D%3AIP/);
  assert.match(generated, /3D:IP%20/);
  configuredProjects.forEach(([title, displayTitle]) => {
    assert.match(
      generated,
      new RegExp(
        `"title": "${title}"[\\s\\S]*?"displayTitle": "${displayTitle}"[\\s\\S]*?"previewMode": "cover"`,
      ),
    );
  });
});

test("kinetic work positions wrap at the cycle boundary without a negative pre-slot", async () => {
  const { wrapKineticPosition } = await loadPageModule();
  const cycleHeight = 600;

  assert.equal(wrapKineticPosition(0, cycleHeight), 0);
  assert.equal(wrapKineticPosition(cycleHeight, cycleHeight), 0);
  assert.equal(wrapKineticPosition(-1, cycleHeight), cycleHeight - 1);
  assert.equal(wrapKineticPosition(cycleHeight + 1, cycleHeight), 1);
  assert.equal(wrapKineticPosition(-cycleHeight - 42, cycleHeight), cycleHeight - 42);
  assert.equal(wrapKineticPosition(42, 0), 0);
});

test("about keeps its ZYRON media mask and resolves fallback art by identity", async () => {
  const { getExperienceFallbackImage } = await loadPageModule();
  const reorderedProjects = [
    { title: "AI视觉工作流", cover: "/ai.jpg" },
    { title: "Meshy生成式3D", cover: "/meshy.jpg" },
    { title: "冬奥会产品项目", cover: "/olympic.jpg" },
    { title: "NFT", cover: "/nft.jpg" },
    { title: "3D:IP 角色", cover: "/character.jpg" },
  ];

  assert.equal(
    getExperienceFallbackImage(
      { date: "2019.10-2021.02" },
      reorderedProjects,
    ),
    "/olympic.jpg",
  );
  assert.equal(
    getExperienceFallbackImage({ date: "2019" }, reorderedProjects),
    "/olympic.jpg",
  );
  assert.equal(
    getExperienceFallbackImage(
      { date: "2022.08-2023.03" },
      reorderedProjects,
    ),
    "/character.jpg",
  );
  assert.equal(
    getExperienceFallbackImage({ date: "2023" }, reorderedProjects),
    "/meshy.jpg",
  );
  assert.equal(
    getExperienceFallbackImage({ date: "2025.05-至今" }, reorderedProjects),
    "/ai.jpg",
  );
  assert.equal(
    getExperienceFallbackImage({ date: "2025" }, reorderedProjects),
    "/ai.jpg",
  );
  assert.equal(
    getExperienceFallbackImage({ date: "未知经历" }, reorderedProjects),
    "/ai.jpg",
  );

  const [pageSource, css] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
  ]);
  assert.match(
    pageSource,
    /globalCompositeOperation\s*=\s*"destination-in"/,
  );
  assert.match(
    css,
    /\.about-description p\s*\{[\s\S]*?color:\s*#d8ff36;[\s\S]*?font-style:\s*italic;[\s\S]*?-webkit-line-clamp:\s*2;/,
  );
  assert.match(
    css,
    /\.timeline-rail button::before\s*\{[\s\S]*?height:\s*9px;[\s\S]*?background:\s*var\(--red\);/,
  );
});

test("keeps focus and reduced-motion presentation contracts", async () => {
  const [css, pageSource] = await Promise.all([
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
  ]);

  assert.match(css, /@media \(prefers-reduced-motion: reduce\)/);
  assert.match(css, /\.kinetic-work-list\.is-reduced-motion/);
  assert.match(css, /\.project-nav button[\s\S]*min-height:\s*44px/);
  assert.match(css, /:focus-visible[\s\S]*outline:\s*2px solid/);
  assert.doesNotMatch(css, /\.particle-portrait-fallback/);
  assert.match(
    css,
    /\.pixel-video-media\s*\{[\s\S]*?object-fit:\s*cover;[\s\S]*?opacity:\s*0;/,
  );
  assert.match(
    css,
    /\.pixel-video-stage\[data-video-ready="true"\] \.pixel-video-media\s*\{[\s\S]*?opacity:\s*1;/,
  );
  assert.match(pageSource, /首页像素交互视频\.mp4/);
  assert.match(pageSource, /configuredMediaOrigin/);
  assert.match(pageSource, /resolveMediaUrl\(content\.video\)/);
  assert.match(pageSource, /resolveMediaUrl\(visual\.src\)/);
  assert.match(pageSource, /resolveMediaUrl\(imageSource\)/);
  assert.match(pageSource, /resolveMediaUrl\(experience\.video\)/);
  assert.match(pageSource, /resolveMediaUrl\("\/网站内容\/联系\/微信二维码\.jpg"\)/);
  const portraitSource = pageSource.slice(
    pageSource.indexOf("function InteractiveParticlePortrait"),
    pageSource.indexOf("function HomeShowreel"),
  );
  assert.match(portraitSource, /className="pixel-video-stage"/);
  assert.match(portraitSource, /className="pixel-video-media"/);
  assert.match(portraitSource, /onEnded=\{\(\) => setEnded\(true\)\}/);
  assert.match(portraitSource, /video\.currentTime\s*=\s*0/);
  assert.doesNotMatch(
    portraitSource,
    /pointermove|pointerleave|VideoTexture|PlaneGeometry|WebGLRenderer|uTrail/,
  );
  const aboutMediaSource = pageSource.slice(
    pageSource.indexOf("function MaskedExperienceMedia"),
    pageSource.indexOf("function AboutSection"),
  );
  assert.match(
    aboutMediaSource,
    /const stillImage = experience\.video[\s\S]*?\? undefined/,
  );
  assert.match(
    aboutMediaSource,
    /!hasVideoFrame[\s\S]*?hasPaintedFrameRef\.current[\s\S]*?return;/,
  );
  assert.doesNotMatch(aboutMediaSource, /fillStyle = "#000"/);
  assert.match(aboutMediaSource, /crossOrigin="anonymous"/);
  assert.match(aboutMediaSource, /preload="auto"/);
  assert.doesNotMatch(aboutMediaSource, /poster=\{experience\.poster\}/);
  assert.doesNotMatch(pageSource, /<MaskedExperienceMedia[\s\S]*?key=\{activeStep\.date\}/);
  assert.doesNotMatch(aboutMediaSource, /key=\{experience\.date\}/);
  assert.match(css, /\.about-description-meta\s*\{[\s\S]*?display:\s*grid;/);
  assert.match(css, /\.about-description p\s*\{[\s\S]*?min-height:/);
  assert.match(pageSource, /data-intro-ready/);
  assert.match(pageSource, /const homeTitleSlices = Array\.from\(\{ length: 14 \}/);
  assert.match(pageSource, /const homeRoleSlices = Array\.from\(\{ length: 10 \}/);
  assert.match(pageSource, /homeRoleSlices\.map/);
  assert.match(css, /\.intro-title-role span[\s\S]*translate3d\(0, 88%, 0\) scaleY\(1\.24\)/);
  assert.match(css, /\.intro-title-name span[\s\S]*translate3d\(0, 118%, 0\) scaleY\(1\.42\)/);
  assert.match(css, /\.intro-title-role span[\s\S]*animation-delay:\s*var\(--slice-delay\)/);
  assert.match(css, /\.intro-title-name span[\s\S]*animation-delay:\s*var\(--slice-delay\)/);
  assert.doesNotMatch(css, /\.site-shell\.is-intro-revealing \.intro-title-role span b\s*\{[^}]*animation-delay/);
  assert.doesNotMatch(css, /\.site-shell\.is-intro-revealing \.intro-title-name span b\s*\{[^}]*animation-delay/);
  assert.match(css, /@keyframes intro-role-slice-assemble[\s\S]*100%\s*\{[\s\S]*opacity:\s*1;/);
  assert.match(css, /@keyframes intro-name-slice-assemble[\s\S]*100%\s*\{[\s\S]*opacity:\s*1;/);
  assert.match(css, /@keyframes intro-role-copy-settle[\s\S]*letter-spacing:\s*0;/);
  assert.match(css, /@keyframes intro-name-copy-settle[\s\S]*letter-spacing:\s*-0\.025em;/);
  assert.doesNotMatch(css, /intro-semantic-title-settle/);
  assert.match(css, /\.site-shell\.is-loaded \.intro-title-assembly\s*\{[\s\S]*visibility:\s*visible;/);
  assert.match(
    css,
    /\.site-shell\.is-loaded \.home-title-role,[\s\S]*?\.home-title-name\s*\{[\s\S]*?opacity:\s*0;/,
  );
  assert.match(portraitSource, /preload="auto"/);
  assert.match(css, /\.work-preview\s*\{[\s\S]*?background:\s*#000;/);
  assert.match(css, /\.preview-media\.is-media-ready\s*\{[\s\S]*?opacity:\s*1;/);
  assert.match(pageSource, /onError=\{\(\) => \{[\s\S]*?setImageSource\(firstImage\)/);
  assert.match(pageSource, /--slice-delay/);
  assert.match(pageSource, /collectSamplePoints/);
  assert.match(pageSource, /particle\.targetX\s*\+=\s*\(target\.x - particle\.targetX\) \* targetLerp/);
  assert.match(pageSource, /introSampleInterval\s*=\s*"90"/);
  assert.match(pageSource, /revealContent/);
  assert.doesNotMatch(pageSource, /TextureLoader|粒子测试-电影工作场景\.png/);
  assert.doesNotMatch(css, /intro-red-panel|intro-matrix-room|intro-room-/);
  assert.match(css, /\.intro-particle-canvas\[data-intro-ready="true"\]/);
  assert.match(
    css,
    /\.site-loader\.is-content-revealing\s*\{[\s\S]*?background:\s*transparent;[\s\S]*?pointer-events:\s*none;/,
  );
  assert.match(portraitSource, /autoPlay=\{!reducedMotion && !suspended\}/);
  assert.match(css, /@keyframes intro-name-slice-assemble/);
  assert.match(css, /@keyframes intro-nav-rail-enter/);
  assert.match(css, /@keyframes intro-nav-enter/);
  assert.match(
    css,
    /\.intro-particle-canvas\s*\{[\s\S]*?filter:\s*none;[\s\S]*?will-change:\s*opacity;/,
  );
  assert.doesNotMatch(css, /\.intro-exit-columns/);
  assert.match(
    css,
    /@media \(prefers-reduced-motion: reduce\)[\s\S]*\.particle-matrix-intro[\s\S]*display:\s*none !important/,
  );
  assert.doesNotMatch(css, /\.site-loader\s*>\s*div/);
  assert.doesNotMatch(css, /\.site-loader\s+(?:i|span|b)\s*\{/);
  assert.match(
    css,
    /@keyframes project-media-zoom\s*\{[\s\S]*to\s*\{\s*transform:\s*scale\(1\.1\)/,
  );
  assert.match(css, /\.preview-media-contain[\s\S]*object-fit:\s*contain/);
  assert.match(css, /\.preview-media-cover[\s\S]*object-fit:\s*cover/);
});

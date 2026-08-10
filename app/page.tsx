"use client";
/* eslint-disable @next/next/no-img-element */

import {
  CSSProperties,
  FocusEvent as ReactFocusEvent,
  KeyboardEvent as ReactKeyboardEvent,
  MouseEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import type {
  CanvasTexture,
  Mesh,
  PlaneGeometry,
  ShaderMaterial,
  Texture,
  WebGLRenderer,
} from "three";
import { generatedContent } from "./content.generated";

type SectionName = "home" | "work" | "about" | "contact";
type VisualKind =
  | "corridor"
  | "console"
  | "mobile"
  | "poster"
  | "orbits"
  | "archive"
  | "kinetic"
  | "cards";

type ProjectVisual =
  | {
      kind: VisualKind;
      label: string;
    }
  | {
      kind: "image" | "video";
      label: string;
      src: string;
      poster?: string;
    };

type Project = {
  category: string;
  year: string;
  client: string;
  title: string;
  displayTitle?: string;
  subtitle: string;
  description: string;
  stack: string;
  accent: string;
  surface: string;
  cover?: string;
  previewMode?: PreviewMode;
  visuals: ProjectVisual[];
};

type PreviewMode = "auto" | "contain" | "cover";

type Experience = {
  date: string;
  label: string;
  company: string;
  role: string;
  title: string;
  copy: string;
  mediaKind: "edit" | "brand" | "interactive";
  mediaLabel: string;
  video?: string;
  poster?: string;
  image?: string;
};

type HomeContent = {
  name: string;
  role: string;
  intro: string;
  edition: string;
  photo?: string;
  video?: string;
  poster?: string;
};

const sections: Array<{ id: SectionName; label: string }> = [
  { id: "home", label: "HOME" },
  { id: "work", label: "WORK" },
  { id: "about", label: "ABOUT" },
  { id: "contact", label: "CONTACT" },
];

const defaultProjects: Project[] = [
  {
    category: "互动与数字体验",
    year: "2026",
    client: "个人实验",
    title: "角色系统",
    subtitle: "互动角色与网页叙事",
    description:
      "一组围绕角色、镜头和界面反馈展开的网页实验。项目把视觉设定、运动节奏与前端实现放在同一套系统中，让浏览过程本身成为作品的一部分。",
    stack: "ART DIRECTION / MOTION / REACT / GSAP",
    accent: "#ff1b0a",
    surface: "#d9d7d0",
    visuals: [
      { kind: "corridor", label: "角色世界观 / 视觉气氛" },
      { kind: "console", label: "交互规则 / 镜头控制" },
      { kind: "mobile", label: "移动端 / 响应式体验" },
      { kind: "poster", label: "动态排版 / 项目视觉" },
    ],
  },
  {
    category: "品牌与内容",
    year: "2025",
    client: "科技品牌",
    title: "品牌叙事",
    subtitle: "数字发布与动态视觉",
    description:
      "为新产品建立一套从首屏、内容章节到社交传播的数字叙事。通过克制的色彩、结构化排版和精确的转场，把复杂信息整理成清晰的品牌体验。",
    stack: "BRAND SYSTEM / WEB DESIGN / MOTION",
    accent: "#2b65ff",
    surface: "#e9e6dc",
    visuals: [
      { kind: "orbits", label: "品牌母题 / 视觉语言" },
      { kind: "poster", label: "发布主视觉 / 字体系统" },
      { kind: "console", label: "产品信息 / 交互界面" },
      { kind: "archive", label: "传播物料 / 设计归档" },
    ],
  },
  {
    category: "互动与数字体验",
    year: "2024",
    client: "展览项目",
    title: "空间交互",
    subtitle: "装置、屏幕与现场体验",
    description:
      "一套连接实体空间与数字内容的互动装置。观众的移动会改变屏幕中的图形、声音和叙事顺序，视觉系统同时适配大屏、导览终端与移动页面。",
    stack: "CREATIVE CODING / TOUCHDESIGNER / UI",
    accent: "#d8ff36",
    surface: "#171717",
    visuals: [
      { kind: "kinetic", label: "现场装置 / 动态反馈" },
      { kind: "orbits", label: "感应逻辑 / 空间轨迹" },
      { kind: "mobile", label: "导览终端 / 内容延伸" },
      { kind: "cards", label: "展览内容 / 模块系统" },
    ],
  },
  {
    category: "品牌与内容",
    year: "2024",
    client: "内容平台",
    title: "动态视觉",
    subtitle: "栏目包装与内容模板",
    description:
      "为持续更新的内容平台设计可扩展的动态视觉模板。统一标题、封面、章节和转场规则，让不同主题保持各自性格，同时拥有一致的品牌识别。",
    stack: "MOTION SYSTEM / EDITORIAL / DESIGN",
    accent: "#ff5c8a",
    surface: "#eee8dd",
    visuals: [
      { kind: "poster", label: "栏目标题 / 动态字体" },
      { kind: "cards", label: "内容卡片 / 模板系统" },
      { kind: "archive", label: "封面矩阵 / 视觉归档" },
      { kind: "kinetic", label: "转场逻辑 / 运动测试" },
    ],
  },
];

const defaultAboutSteps: Experience[] = [
  {
    date: "2020",
    label: "独立创作",
    company: "个人与合作项目",
    role: "视觉设计",
    title: "从画面建立叙事",
    copy: "负责视觉概念、平面与影像剪辑，用构图、光线和节奏把项目内容整理成清晰的观看路径。",
    mediaKind: "edit",
    mediaLabel: "剪辑与视觉实验 / 2020",
  },
  {
    date: "2023",
    label: "品牌项目",
    company: "品牌与内容团队",
    role: "动态设计 / 剪辑",
    title: "让品牌系统动起来",
    copy: "把品牌识别扩展到发布片、社交内容和栏目包装，在不同屏幕里保持统一的视觉语气与运动规则。",
    mediaKind: "brand",
    mediaLabel: "品牌动态与发布影像 / 2023",
  },
  {
    date: "2026",
    label: "数字体验",
    company: "互动与数字项目",
    role: "视觉设计 / 创意开发",
    title: "把观看变成参与",
    copy: "将设计、动画、剪辑和前端实现整合到同一流程，用影像与交互完成可感知、可探索的数字体验。",
    mediaKind: "interactive",
    mediaLabel: "数字项目 Showreel / 2026",
  },
];

const generatedProjects = generatedContent.projects as Array<
  Omit<Project, "visuals"> & { order: number; visuals: ProjectVisual[] }
>;
const generatedExperiences = generatedContent.experiences as Array<
  Experience & { order: number }
>;

const defaultVisualSets: ProjectVisual[][] = [
  [
    { kind: "corridor", label: "项目气氛 / 视觉概念" },
    { kind: "console", label: "交互规则 / 信息系统" },
    { kind: "mobile", label: "移动端 / 响应式体验" },
    { kind: "poster", label: "动态排版 / 项目视觉" },
  ],
  [
    { kind: "orbits", label: "品牌母题 / 视觉语言" },
    { kind: "poster", label: "发布主视觉 / 字体系统" },
    { kind: "cards", label: "内容卡片 / 模板系统" },
    { kind: "archive", label: "传播物料 / 设计归档" },
  ],
];

const projects: Project[] = generatedProjects.length
  ? generatedProjects.map((project, index) => ({
      ...project,
      visuals:
        project.visuals.length > 0
          ? project.visuals
          : defaultVisualSets[index % defaultVisualSets.length],
    }))
  : defaultProjects;

const projectDisplayTitlesByTitle: Record<string, string> = {
  "冬奥会产品项目": "OLYMPIC",
  "Meshy生成式3D": "MESHY",
  "3D:IP 角色": "CHARACTER",
  NFT: "CUBE",
  AI视觉工作流: "ZYRON AI",
  产品CGI视觉: "PRODUCT CGI",
  汽车CGI视觉: "AUTO CGI",
  iToken品牌活动: "ITOKEN",
};

export const getProjectDisplayTitle = (
  project: Pick<Project, "title" | "displayTitle">,
) =>
  project.displayTitle?.trim() ||
  projectDisplayTitlesByTitle[project.title] ||
  project.title.toUpperCase();

export function getProjectPreviewMode(
  project: Pick<Project, "previewMode">,
): PreviewMode {
  return project.previewMode === "contain" || project.previewMode === "cover"
    ? project.previewMode
    : "auto";
}

export function getPreviewFit(
  previewMode: PreviewMode | string | undefined,
  aspectRatio?: number | null,
): Exclude<PreviewMode, "auto"> {
  if (previewMode === "contain" || previewMode === "cover") {
    return previewMode;
  }

  // Preserve the established cover treatment until an explicit `auto` image
  // has reported its natural dimensions.
  if (!Number.isFinite(aspectRatio)) return "cover";
  return (aspectRatio as number) >= 1.45 ? "contain" : "cover";
}

export function wrapKineticPosition(position: number, cycleHeight: number) {
  if (!Number.isFinite(position) || !Number.isFinite(cycleHeight) || cycleHeight <= 0) {
    return 0;
  }
  return ((position % cycleHeight) + cycleHeight) % cycleHeight;
}

const experienceFallbackProjectTitlesByDate: Record<string, string> = {
  "2019": "冬奥会产品项目",
  "2019.10-2021.02": "冬奥会产品项目",
  "2021": "NFT",
  "2021.02-2022.08": "NFT",
  "2022.08-2023.03": "3D:IP 角色",
  "2023": "Meshy生成式3D",
  "2023.03-2025.05": "Meshy生成式3D",
  "2025": "AI视觉工作流",
  "2025.05-至今": "AI视觉工作流",
};

export function getExperienceFallbackImage(
  experience: Pick<Experience, "date">,
  availableProjects: ReadonlyArray<Pick<Project, "title" | "cover">>,
) {
  const projectTitle = experienceFallbackProjectTitlesByDate[experience.date];
  return (
    availableProjects.find(
      (project) => project.title === projectTitle && project.cover,
    )?.cover || availableProjects.find((project) => project.cover)?.cover
  );
}

const aboutSteps: Experience[] = generatedExperiences.length
  ? generatedExperiences
  : defaultAboutSteps;

const homeContent: HomeContent = {
  name: generatedContent.home.name || "ZHENYUAN ZHANG",
  role: generatedContent.home.role || "视觉设计 / 创意开发",
  intro: generatedContent.home.intro || "专注品牌视觉、动态影像与互动网页。",
  edition: generatedContent.home.edition || "PORTFOLIO / 2026",
  photo: generatedContent.home.photo,
  video: generatedContent.home.video,
  poster: generatedContent.home.poster,
};

const contactContent = generatedContent.contact;

const curtainColumns = Array.from({ length: 15 }, (_, index) => index);
const homeTitleSlices = Array.from({ length: 14 }, (_, index) => index);
const homeRoleSlices = Array.from({ length: 10 }, (_, index) => index);
const configuredMediaOrigin = (
  process.env.NEXT_PUBLIC_MEDIA_ORIGIN || "https://media.zyrondesignz.com"
).replace(/\/+$/, "");
const siteContentPathPrefixes = [
  "/网站内容/",
  "/%E7%BD%91%E7%AB%99%E5%86%85%E5%AE%B9/",
];

export function resolveMediaUrl(value: string, origin?: string): string;
export function resolveMediaUrl(value: undefined, origin?: string): undefined;
export function resolveMediaUrl(
  value: string | undefined,
  origin?: string,
): string | undefined;
export function resolveMediaUrl(
  value: string | undefined,
  origin = configuredMediaOrigin,
) {
  const normalizedValue = value?.toLowerCase();
  if (
    !value ||
    !siteContentPathPrefixes.some((prefix) =>
      normalizedValue?.startsWith(prefix.toLowerCase()),
    )
  ) {
    return value;
  }
  const normalizedOrigin = origin.replace(/\/+$/, "");
  return normalizedOrigin ? `${normalizedOrigin}${value}` : value;
}

const particlePortraitVideoSrc =
  resolveMediaUrl("/网站内容/首页/互动形象/首页像素交互视频.mp4");

const warmedVideoMedia = new Map<string, HTMLVideoElement>();

export function warmVideoMedia(value?: string) {
  if (!value || typeof document === "undefined") return;
  const source = resolveMediaUrl(value);
  if (!source || warmedVideoMedia.has(source)) return;

  const video = document.createElement("video");
  video.preload = "auto";
  video.muted = true;
  video.playsInline = true;
  video.crossOrigin = "anonymous";
  video.src = source;
  video.addEventListener(
    "loadeddata",
    () => {
      video.pause();
      video.preload = "metadata";
    },
    { once: true },
  );
  video.addEventListener(
    "error",
    () => {
      warmedVideoMedia.delete(source);
    },
    { once: true },
  );
  warmedVideoMedia.set(source, video);
  video.load();
}

type ParticleVisualSettings = {
  imageScale: number;
  positionX: number;
  positionY: number;
  pointSize: number;
  density: number;
  contrast: number;
  brightness: number;
  detailThreshold: number;
  toneSoftness: number;
  glowStrength: number;
  glowRadius: number;
  mouseAreaSize: number;
  displacementStrength: number;
  fadeSpeed: number;
};

export const particleVisualDefaults: ParticleVisualSettings = {
  imageScale: 0.4,
  positionX: 0,
  positionY: 0,
  pointSize: 0.027,
  density: 0.86,
  contrast: 0.9,
  brightness: 0.78,
  detailThreshold: 0.08,
  toneSoftness: 0.72,
  glowStrength: 1.45,
  glowRadius: 2.2,
  mouseAreaSize: 0.26,
  displacementStrength: 2,
  fadeSpeed: 0.03,
};

const particleVisualStorageKey = "zyron-particle-visual-settings-v1";

const particleControlGroups: Array<{
  key: keyof ParticleVisualSettings;
  label: string;
  min: number;
  max: number;
  step: number;
  digits: number;
}> = [
  { key: "imageScale", label: "主体缩放", min: 0.2, max: 1, step: 0.01, digits: 2 },
  { key: "positionX", label: "水平位置", min: -0.4, max: 0.4, step: 0.01, digits: 2 },
  { key: "positionY", label: "垂直位置", min: -0.4, max: 0.4, step: 0.01, digits: 2 },
  { key: "pointSize", label: "像素颗粒尺度", min: 0.008, max: 0.08, step: 0.001, digits: 3 },
  { key: "density", label: "像素细节密度", min: 0.2, max: 1, step: 0.01, digits: 2 },
  { key: "contrast", label: "图像对比度", min: 0.5, max: 3, step: 0.05, digits: 2 },
  { key: "brightness", label: "像素亮度", min: 0.2, max: 2, step: 0.05, digits: 2 },
  { key: "detailThreshold", label: "细节阈值", min: 0, max: 0.65, step: 0.01, digits: 2 },
  { key: "toneSoftness", label: "灰阶过渡", min: 0, max: 1, step: 0.01, digits: 2 },
  { key: "glowStrength", label: "辉光强度", min: 0, max: 3, step: 0.05, digits: 2 },
  { key: "glowRadius", label: "辉光范围", min: 1, max: 4, step: 0.05, digits: 2 },
  { key: "mouseAreaSize", label: "鼠标影响范围", min: 0.08, max: 0.6, step: 0.01, digits: 2 },
  { key: "displacementStrength", label: "拖拽力度", min: 0.2, max: 5, step: 0.1, digits: 1 },
  { key: "fadeSpeed", label: "轨迹消退速度", min: 0.005, max: 0.12, step: 0.005, digits: 3 },
];

function normalizeParticleVisualSettings(value: unknown) {
  if (!value || typeof value !== "object") return particleVisualDefaults;
  const candidate = value as Partial<ParticleVisualSettings>;
  const normalized = { ...particleVisualDefaults };

  particleControlGroups.forEach(({ key, min, max }) => {
    const nextValue = candidate[key];
    if (typeof nextValue === "number" && Number.isFinite(nextValue)) {
      normalized[key] = Math.min(max, Math.max(min, nextValue));
    }
  });
  return normalized;
}

export function getParticlePortraitConfig(
  compact: boolean,
  devicePixelRatio = 1,
) {
  const maxDpr = compact ? 1 : 1.5;
  return {
    geometrySegments: 1,
    // Kept as explicit low-cost geometry evidence for tuning diagnostics.
    columns: 1,
    rows: 1,
    pointCount: 4,
    maxDpr,
    dpr: Math.min(maxDpr, Math.max(1, devicePixelRatio)),
    trailSize: compact ? 192 : 256,
    cursorSmoothing: 0.22,
    cursorLerpStrength: 0.28,
    velocitySmoothing: 0.16,
    speedAlphaMultiplier: 0.24,
    trailVelocityScale: 1.2,
  };
}

export function shouldUseDynamicParticlePortrait(
  reducedMotion: boolean,
  suspended = false,
) {
  return !reducedMotion && !suspended;
}

export type PixelVideoFrameState = {
  active: boolean;
  hidden: boolean;
  contextLost: boolean;
  videoDecoded: boolean;
  mediaReady: boolean;
};

export function canRenderPixelVideoFrame({
  active,
  hidden,
  contextLost,
  videoDecoded,
  mediaReady,
}: PixelVideoFrameState) {
  return active && !hidden && !contextLost && videoDecoded && mediaReady;
}

const pixelVideoVertexShader = `
  uniform float uImageScale;
  uniform vec2 uImageOffset;

  varying vec2 vUv;

  void main() {
    vec3 adjustedPosition = position;
    adjustedPosition.xy *= uImageScale;
    adjustedPosition.xy += vec2(uImageOffset.x * 2.0, -uImageOffset.y * 2.0);
    gl_Position = vec4(adjustedPosition, 1.0);
    vUv = uv;
  }
`;

const pixelVideoFragmentShader = `
  precision highp float;

  uniform sampler2D uVideoTexture;
  uniform sampler2D uTrail;
  uniform vec2 uVideoResolution;
  uniform vec2 uViewportResolution;
  uniform vec2 uCursorVelocity;
  uniform float uDisplacementStrength;
  uniform float uTrailRadius;
  uniform float uPixelSize;
  uniform float uPixelDensity;
  uniform float uPictureContrast;
  uniform float uPictureBrightness;
  uniform float uDetailThreshold;
  uniform float uToneSoftness;
  uniform float uGlowStrength;
  uniform float uGlowRadius;
  uniform float uTime;

  varying vec2 vUv;

  vec2 coverUv(vec2 uv) {
    float videoAspect = uVideoResolution.x / max(uVideoResolution.y, 1.0);
    float viewportAspect =
      uViewportResolution.x / max(uViewportResolution.y, 1.0);
    vec2 covered = uv;
    if (viewportAspect > videoAspect) {
      // A wide viewport crops the top and bottom of the source.
      covered.y = (uv.y - 0.5) * videoAspect / viewportAspect + 0.5;
    } else {
      // A tall viewport crops the left and right of the source.
      covered.x = (uv.x - 0.5) * viewportAspect / videoAspect + 0.5;
    }
    return covered;
  }

  float insideUv(vec2 uv) {
    vec2 lower = step(vec2(0.0), uv);
    vec2 upper = step(uv, vec2(1.0));
    return lower.x * lower.y * upper.x * upper.y;
  }

  void main() {
    vec2 videoUv = coverUv(vUv);
    vec4 trailSample = texture2D(uTrail, vUv);
    float trailMask = clamp(trailSample.r, 0.0, 1.0);
    vec2 velocity = clamp(uCursorVelocity * 8.0, -1.0, 1.0);
    vec2 radial = vUv - 0.5;
    float radialLength = max(length(radial), 0.001);
    radial /= radialLength;
    vec2 dragVector = velocity * 0.84 + radial * 0.16;
    vec2 dragDirection = dragVector / max(length(dragVector), 0.001);
    float directionWeight = min(1.0, length(velocity) + 0.16);
    vec2 aspectCompensation = vec2(
      1.0,
      uViewportResolution.x / max(uViewportResolution.y, 1.0)
    );
    vec2 displacedUv = videoUv
      + dragDirection
        * trailMask
        * uDisplacementStrength
        * uTrailRadius
        * 0.028
        * aspectCompensation
        * directionWeight;
    displacedUv += vec2(
      sin(uTime * 0.7 + vUv.y * 18.0),
      cos(uTime * 0.55 + vUv.x * 16.0)
    ) * trailMask * 0.0018;

    float safeSample = insideUv(displacedUv);
    // Clamp only the texture lookup; the mask keeps out-of-range samples black.
    vec2 safeUv = clamp(displacedUv, vec2(0.0), vec2(1.0));
    float pixelSize = max(uPixelSize, 0.0002);
    vec2 snappedUv = (floor(safeUv / pixelSize) + 0.5) * pixelSize;
    safeUv = mix(safeUv, snappedUv, clamp(uPixelDensity, 0.0, 1.0) * 0.34);
    vec3 videoColor = texture2D(uVideoTexture, clamp(safeUv, 0.0, 1.0)).rgb;
    float luma = dot(videoColor, vec3(0.2126, 0.7152, 0.0722));
    float contrast = mix(1.0, uPictureContrast, 0.82);
    luma = clamp((luma - 0.5) * contrast + 0.5, 0.0, 1.0);
    luma = clamp(luma * uPictureBrightness, 0.0, 1.0);
    float thresholded = smoothstep(
      uDetailThreshold,
      min(1.0, uDetailThreshold + 0.34 + uToneSoftness * 0.26),
      luma
    );
    float shapedLuma = mix(luma, thresholded, uToneSoftness * 0.42);
    vec3 shapedColor = mix(videoColor, vec3(shapedLuma), 0.14);
    float glow = trailMask * uGlowStrength
      * (0.05 + 0.12 * uGlowRadius)
      + smoothstep(0.2, 0.9, shapedLuma) * 0.06 * uGlowStrength;
    shapedColor = shapedColor * (0.72 + shapedLuma * 0.58) + vec3(glow);
    shapedColor *= 0.985 + sin(uTime * 0.9 + vUv.x * 7.0) * 0.015;
    gl_FragColor = vec4(shapedColor * safeSample, safeSample);
  }
`;
function usePrefersReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updatePreference = () => setPrefersReducedMotion(mediaQuery.matches);

    updatePreference();
    mediaQuery.addEventListener("change", updatePreference);
    return () => mediaQuery.removeEventListener("change", updatePreference);
  }, []);

  return prefersReducedMotion;
}

function isInteractiveTarget(target: EventTarget | null) {
  return (
    target instanceof Element &&
    Boolean(
      target.closest(
        'a, button, input, select, textarea, [contenteditable="true"], [role="button"], [role="link"]',
      ),
    )
  );
}

export function pauseMediaForReducedMotion(
  media: Pick<HTMLMediaElement, "pause"> | null,
  reducedMotion: boolean,
) {
  if (!reducedMotion || !media) return false;
  media.pause();
  return true;
}

function useReducedMotionMedia(
  mediaRef: { current: HTMLVideoElement | null },
  reducedMotion: boolean,
) {
  useEffect(() => {
    pauseMediaForReducedMotion(mediaRef.current, reducedMotion);
  }, [mediaRef, reducedMotion]);
}

export function createAnimationLifecycle() {
  let active = true;

  return {
    isActive: () => active,
    run(callback: () => void) {
      if (!active) return false;
      callback();
      return true;
    },
    dispose() {
      active = false;
    },
  };
}

export function createSingleFlightAnimationFrame(
  requestFrame: (callback: (time: number) => void) => number,
  cancelFrame: (frame: number) => void,
) {
  let active = true;
  let pendingFrame: number | null = null;

  return {
    schedule(callback: (time: number) => void) {
      if (!active || pendingFrame !== null) return false;
      pendingFrame = requestFrame((time) => {
        pendingFrame = null;
        if (active) callback(time);
      });
      return true;
    },
    hasPendingFrame: () => pendingFrame !== null,
    dispose() {
      active = false;
      if (pendingFrame !== null) {
        cancelFrame(pendingFrame);
        pendingFrame = null;
      }
    },
  };
}

export function getNearestRovingIndex(
  itemCenters: Array<{ index: number; center: number }>,
  viewportCenter: number,
  fallbackIndex: number,
) {
  let nearestIndex = fallbackIndex;
  let nearestDistance = Number.POSITIVE_INFINITY;

  itemCenters.forEach(({ index, center }) => {
    const distance = Math.abs(center - viewportCenter);
    if (distance < nearestDistance) {
      nearestDistance = distance;
      nearestIndex = index;
    }
  });

  return nearestIndex;
}

type PortfolioShortcutEvent = {
  key: string;
  defaultPrevented: boolean;
  metaKey: boolean;
  ctrlKey: boolean;
  altKey: boolean;
  preventDefault: () => void;
};

export function handlePortfolioShortcut({
  event,
  interactiveTarget,
  detailIndex,
  active,
  navigate,
  closeProject,
  changeProject,
}: {
  event: PortfolioShortcutEvent;
  interactiveTarget: boolean;
  detailIndex: number | null;
  active: SectionName;
  navigate: (section: SectionName) => void;
  closeProject: () => void;
  changeProject: (direction: number) => void;
}) {
  if (
    event.defaultPrevented ||
    event.metaKey ||
    event.ctrlKey ||
    event.altKey ||
    interactiveTarget
  ) {
    return false;
  }

  if (detailIndex !== null) {
    if (event.key === "Escape") {
      event.preventDefault();
      closeProject();
      return true;
    }
    if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
      event.preventDefault();
      changeProject(event.key === "ArrowLeft" ? -1 : 1);
      return true;
    }
    return false;
  }

  const current = sections.findIndex((section) => section.id === active);
  const nextIndex =
    event.key === "ArrowDown" || event.key === "ArrowRight"
      ? current + 1
      : event.key === "ArrowUp" || event.key === "ArrowLeft"
        ? current - 1
        : current;
  if (nextIndex === current || !sections[nextIndex]) return false;

  event.preventDefault();
  navigate(sections[nextIndex].id);
  return true;
}

function ArtCorridor({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`art-corridor ${compact ? "is-compact" : ""}`}>
      <div className="corridor-plane plane-left" />
      <div className="corridor-plane plane-right" />
      <div className="corridor-plane plane-floor" />
      <div className="corridor-glow" />
      <div className="corridor-figure" />
      <div className="corridor-noise" />
    </div>
  );
}

type IntroParticle = {
  startX: number;
  startY: number;
  targetX: number;
  targetY: number;
  sourceX: number;
  sourceY: number;
  angle: number;
  delay: number;
  radius: number;
  intensity: number;
  orbit: number;
};

type IntroSamplePoint = {
  x: number;
  y: number;
  intensity: number;
};

export const particleMatrixIntroTimeline = {
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
} as const;

export const particleMatrixIntroDuration = particleMatrixIntroTimeline.duration;

export function getParticleMatrixIntroConfig(compact: boolean) {
  return {
    particleLimit: compact ? 860 : 2400,
    sampleWidth: compact ? 240 : 360,
    sampleHeight: compact ? 136 : 202,
    maxDpr: 1,
    finalImageScale: compact ? 0.34 : 0.4,
  };
}

export function getParticleMatrixPreviewRect(
  width: number,
  height: number,
) {
  const compact = width <= 820;
  if (compact) {
    return {
      x: 8,
      y: 8,
      width: Math.max(1, width - 16),
      height: Math.max(1, height - 8 - height * 0.284),
    };
  }

  return {
    x: 45,
    y: 16,
    width: Math.max(1, width - 61),
    height: Math.max(1, height - 32 - width * 0.17),
  };
}

export function shouldRunParticleMatrixIntro(
  hidden: boolean,
  reducedMotion: boolean,
) {
  void hidden;
  void reducedMotion;
  return false;
}

function ParticleMatrixIntro({
  hidden,
  reducedMotion,
  revealContent,
}: {
  hidden: boolean;
  reducedMotion: boolean;
  revealContent: boolean;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const shouldRun = shouldRunParticleMatrixIntro(hidden, reducedMotion);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (
      !canvas ||
      !shouldRun ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }
    const context = canvas.getContext("2d");
    if (!context) return;

    let animationFrame = 0;
    let active = true;
    let width = 1;
    let height = 1;
    let dpr = 1;
    let particles: IntroParticle[] = [];
    let sampleCanvas: HTMLCanvasElement | null = null;
    let sampleContext: CanvasRenderingContext2D | null = null;
    let sampleWidth = 1;
    let sampleHeight = 1;
    let sampledLuminance: Float32Array | null = null;
    let videoReady = false;
    let lastSampleAt = -Infinity;
    const startedAt = performance.now();
    const sourceVideo = document.createElement("video");
    let randomSeed = 0x2f6e2b1;

    const clamp01 = (value: number) => Math.max(0, Math.min(1, value));
    const easeInOutCubic = (value: number) =>
      value < 0.5
        ? 4 * value * value * value
        : 1 - Math.pow(-2 * value + 2, 3) / 2;
    const interpolate = (start: number, end: number, progress: number) =>
      start + (end - start) * progress;
    const random = () => {
      randomSeed = (randomSeed * 1664525 + 1013904223) >>> 0;
      return randomSeed / 4294967296;
    };

    const configureSampler = () => {
      const config = getParticleMatrixIntroConfig(width <= 820);
      sampleWidth = config.sampleWidth;
      sampleHeight = config.sampleHeight;
      sampleCanvas = document.createElement("canvas");
      sampleCanvas.width = sampleWidth;
      sampleCanvas.height = sampleHeight;
      sampleContext = sampleCanvas.getContext("2d", {
        willReadFrequently: true,
      });
    };

    const getSampleIntensity = (x: number, y: number) => {
      if (!sampledLuminance) return 0;
      const safeX = Math.max(0, Math.min(sampleWidth - 1, Math.round(x)));
      const safeY = Math.max(0, Math.min(sampleHeight - 1, Math.round(y)));
      return sampledLuminance[safeY * sampleWidth + safeX] ?? 0;
    };

    const collectSamplePoints = () => {
      const candidates: IntroSamplePoint[] = [];
      for (let y = 1; y < sampleHeight - 1; y += 2) {
        for (let x = 1; x < sampleWidth - 1; x += 2) {
          const intensity = getSampleIntensity(x, y);
          if (intensity > 0.12) {
            candidates.push({
              x: x / sampleWidth,
              y: y / sampleHeight,
              intensity,
            });
          }
        }
      }
      return candidates;
    };

    const getTargetPosition = (point: IntroSamplePoint) => {
      const config = getParticleMatrixIntroConfig(width <= 820);
      const preview = getParticleMatrixPreviewRect(width, height);
      const sourceAspect = 16 / 9;
      const portraitWidth = Math.min(
        preview.width * config.finalImageScale,
        preview.height * config.finalImageScale * sourceAspect,
      );
      const portraitHeight = portraitWidth / sourceAspect;
      return {
        x: preview.x + preview.width / 2 + (point.x - 0.5) * portraitWidth,
        y: preview.y + preview.height / 2 + (point.y - 0.5) * portraitHeight,
      };
    };

    const buildParticles = () => {
      if (!sampledLuminance) return;
      const compact = width <= 820;
      const config = getParticleMatrixIntroConfig(compact);
      const candidates = collectSamplePoints();
      if (!candidates.length) return;
      const stride = Math.max(1, Math.ceil(candidates.length / config.particleLimit));
      const selected = candidates
        .filter((_, index) => index % stride === 0)
        .slice(0, config.particleLimit);
      particles = selected.map((point) => ({
        startX: random() * width,
        startY: random() * height,
        targetX: getTargetPosition(point).x,
        targetY: getTargetPosition(point).y,
        sourceX: point.x,
        sourceY: point.y,
        angle: random() * Math.PI * 2,
        delay: random() * 0.18,
        radius: 0.42 + point.intensity * 0.8,
        intensity: point.intensity,
        orbit: 22 + random() * Math.min(width, height) * 0.08,
      }));
      canvas.dataset.particleCount = String(particles.length);
    };

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      width = Math.max(1, rect.width);
      height = Math.max(1, rect.height);
      const config = getParticleMatrixIntroConfig(width <= 820);
      dpr = Math.min(
        config.maxDpr,
        Math.max(1, window.devicePixelRatio || 1),
      );
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      canvas.dataset.particleDpr = String(dpr);
      if (!sampleCanvas) configureSampler();
      if (videoReady) buildParticles();
    };

    const sampleVideoFrame = (force = false) => {
      if (!videoReady || !sampleContext || !sampleCanvas) return;
      const now = performance.now();
      if (!force && now - lastSampleAt < 90) return;
      lastSampleAt = now;
      sampleContext.clearRect(0, 0, sampleWidth, sampleHeight);
      sampleContext.drawImage(sourceVideo, 0, 0, sampleWidth, sampleHeight);
      const imageData = sampleContext.getImageData(
        0,
        0,
        sampleWidth,
        sampleHeight,
      );
      const nextLuminance = new Float32Array(sampleWidth * sampleHeight);
      const luminanceAt = (x: number, y: number) => {
        const safeX = Math.max(0, Math.min(sampleWidth - 1, x));
        const safeY = Math.max(0, Math.min(sampleHeight - 1, y));
        const offset = (safeY * sampleWidth + safeX) * 4;
        return (
          imageData.data[offset] * 0.2126 +
          imageData.data[offset + 1] * 0.7152 +
          imageData.data[offset + 2] * 0.0722
        ) / 255;
      };
      for (let y = 0; y < sampleHeight; y += 1) {
        for (let x = 0; x < sampleWidth; x += 1) {
          const center = luminanceAt(x, y);
          const edge = Math.min(
            1,
            (Math.abs(center - luminanceAt(x - 2, y)) +
              Math.abs(center - luminanceAt(x, y - 2))) *
              3.4,
          );
          const structure = Math.max(
            0,
            Math.pow(center, 0.58) * 0.62 + Math.pow(edge, 0.66) * 0.92 - 0.08,
          );
          nextLuminance[y * sampleWidth + x] = Math.min(1, structure);
        }
      }
      const hadParticles = particles.length > 0;
      sampledLuminance = nextLuminance;
      const frameCandidates = collectSamplePoints();
      if (!hadParticles) {
        buildParticles();
      } else if (frameCandidates.length) {
        const stride = Math.max(
          1,
          Math.ceil(frameCandidates.length / particles.length),
        );
        const targetLerp = 0.26;
        particles.forEach((particle, index) => {
          const point =
            frameCandidates[(index * stride) % frameCandidates.length];
          const target = getTargetPosition(point);
          particle.targetX += (target.x - particle.targetX) * targetLerp;
          particle.targetY += (target.y - particle.targetY) * targetLerp;
          particle.sourceX += (point.x - particle.sourceX) * targetLerp;
          particle.sourceY += (point.y - particle.sourceY) * targetLerp;
          particle.intensity +=
            (point.intensity - particle.intensity) * targetLerp;
        });
      }
      canvas.dataset.introSampleInterval = "90";
    };

    const handleVideoReady = () => {
      if (!sourceVideo.videoWidth || !sourceVideo.videoHeight) return;
      videoReady = true;
      configureSampler();
      sampleVideoFrame(true);
    };

    const handleVideoError = () => {
      videoReady = false;
      canvas.removeAttribute("data-intro-ready");
    };

    const render = (now: number) => {
      if (!active) return;
      animationFrame = 0;
      const elapsedMs = now - startedAt;
      const elapsed = elapsedMs / 1000;
      if (videoReady) sampleVideoFrame();
      canvas.dataset.introPhase =
        elapsedMs < particleMatrixIntroTimeline.welcomeEnd
          ? "welcome"
          : elapsedMs < particleMatrixIntroTimeline.blackoutEnd
            ? "blackout"
            : elapsedMs < particleMatrixIntroTimeline.gatherStart
              ? "particle-drift"
              : elapsedMs < particleMatrixIntroTimeline.gatherEnd
                ? "particle-gather"
                : elapsedMs < particleMatrixIntroTimeline.contentAssembleEnd
                  ? "content-assemble"
                  : "stable";
      context.clearRect(0, 0, width, height);
      if (
        particles.length &&
        elapsedMs >= particleMatrixIntroTimeline.particleStart
      ) {
        const gatherProgress = clamp01(
          (elapsedMs - particleMatrixIntroTimeline.gatherStart) /
            (particleMatrixIntroTimeline.gatherEnd -
              particleMatrixIntroTimeline.gatherStart),
        );
        const easedGather = easeInOutCubic(gatherProgress);
        context.save();
        context.globalCompositeOperation = "lighter";
        context.beginPath();

        for (const particle of particles) {
          const particleProgress = clamp01(
            (elapsedMs / 1000 -
              particleMatrixIntroTimeline.gatherStart / 1000 -
              particle.delay) /
              ((particleMatrixIntroTimeline.gatherEnd -
                particleMatrixIntroTimeline.gatherStart) /
                1000),
          );
          const eased = easeInOutCubic(particleProgress);
          const orbitAngle = particle.angle + elapsed * 1.45;
          const orbit = particle.orbit * Math.pow(1 - eased, 1.35);
          const drift = 1 - eased * 0.68;
          const driftingX =
            particle.startX +
            Math.cos(orbitAngle) * 24 * drift +
            Math.sin(elapsed * 0.7 + particle.angle) * 18 * drift;
          const driftingY =
            particle.startY +
            Math.sin(orbitAngle) * 22 * drift +
            Math.cos(elapsed * 0.62 + particle.angle) * 16 * drift;
          const x =
            interpolate(driftingX, particle.targetX, eased) +
            Math.cos(orbitAngle * 1.7) * orbit;
          const y =
            interpolate(driftingY, particle.targetY, eased) +
            Math.sin(orbitAngle * 1.45) * orbit * 0.62;
          const intensity = Math.max(0.03, particle.intensity);
          const radius =
            (0.34 + intensity * 0.84) *
            (1 + Math.sin(elapsed * 5 + particle.angle) * 0.14);
          context.moveTo(x + radius, y);
          context.arc(x, y, radius, 0, Math.PI * 2);
        }

        context.shadowColor = "rgba(255, 238, 232, 0.7)";
        context.shadowBlur = 2 + easedGather * 8;
        context.fillStyle = `rgba(255, 236, 228, ${0.24 + easedGather * 0.6})`;
        context.fill();
        context.restore();
        if (videoReady) canvas.dataset.introReady = "true";
      }
      if (
        active &&
        !document.hidden &&
        elapsedMs < particleMatrixIntroTimeline.contentAssembleEnd
      ) {
        animationFrame = window.requestAnimationFrame(render);
      }
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        window.cancelAnimationFrame(animationFrame);
        animationFrame = 0;
        sourceVideo.pause();
      } else if (active) {
        void sourceVideo.play().catch(() => undefined);
        if (!animationFrame) animationFrame = window.requestAnimationFrame(render);
      }
    };

    sourceVideo.muted = true;
    sourceVideo.loop = true;
    sourceVideo.playsInline = true;
    sourceVideo.preload = "metadata";
    sourceVideo.crossOrigin = "anonymous";
    sourceVideo.addEventListener("loadeddata", handleVideoReady);
    sourceVideo.addEventListener("canplay", handleVideoReady);
    sourceVideo.addEventListener("error", handleVideoError);
    sourceVideo.src = particlePortraitVideoSrc;
    sourceVideo.load();
    void sourceVideo.play().catch(() => undefined);
    window.addEventListener("resize", resize);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    resize();
    if (!document.hidden) {
      animationFrame = window.requestAnimationFrame(render);
    }

    return () => {
      active = false;
      window.cancelAnimationFrame(animationFrame);
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      sourceVideo.removeEventListener("loadeddata", handleVideoReady);
      sourceVideo.removeEventListener("canplay", handleVideoReady);
      sourceVideo.removeEventListener("error", handleVideoError);
      sourceVideo.pause();
      sourceVideo.removeAttribute("src");
      sourceVideo.load();
      sampleCanvas = null;
      sampleContext = null;
      sampledLuminance = null;
      canvas.removeAttribute("data-intro-phase");
      canvas.removeAttribute("data-intro-ready");
    };
  }, [shouldRun]);

  return (
    <div
      className={`site-loader particle-matrix-intro ${revealContent ? "is-content-revealing" : ""} ${hidden ? "is-hidden" : ""}`}
      role="status"
      aria-live="polite"
      data-intro-state={
        reducedMotion ? "skipped" : hidden ? "complete" : "running"
      }
      style={
        {
          "--intro-duration": `${particleMatrixIntroTimeline.duration}ms`,
        } as CSSProperties
      }
    >
      <div className="intro-welcome" aria-hidden="true">
        <span>WELCOME</span>
        <i />
      </div>
      {shouldRun ? (
        <canvas
          ref={canvasRef}
          className="intro-particle-canvas"
          aria-hidden="true"
          tabIndex={-1}
        />
      ) : null}
      <span className="intro-status-copy">PORTFOLIO / INITIALIZING</span>
    </div>
  );
}

export function LegacyInteractiveParticlePortrait({
  reducedMotion,
  suspended,
}: {
  reducedMotion: boolean;
  suspended: boolean;
}) {
  const stageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const settingsHydratedRef = useRef(false);
  const [settings, setSettings] = useState<ParticleVisualSettings>(
    particleVisualDefaults,
  );
  const settingsRef = useRef(settings);
  const [controlsOpen, setControlsOpen] = useState(false);
  const [copyStatus, setCopyStatus] = useState("复制参数");
  const [compact, setCompact] = useState(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(max-width: 820px)").matches,
  );

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 820px)");
    const updateCompactMode = () => setCompact(mediaQuery.matches);

    mediaQuery.addEventListener("change", updateCompactMode);
    return () => mediaQuery.removeEventListener("change", updateCompactMode);
  }, []);

  useEffect(() => {
    let storedSettings: ParticleVisualSettings | null = null;
    try {
      const stored = window.localStorage.getItem(particleVisualStorageKey);
      if (stored) {
        storedSettings = normalizeParticleVisualSettings(JSON.parse(stored));
      }
    } catch {
      // Invalid or unavailable local storage should not block the portrait.
    }
    const frame = window.requestAnimationFrame(() => {
      if (storedSettings) setSettings(storedSettings);
      settingsHydratedRef.current = true;
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    settingsRef.current = settings;
    if (!settingsHydratedRef.current) return;
    try {
      window.localStorage.setItem(
        particleVisualStorageKey,
        JSON.stringify(settings),
      );
    } catch {
      // The controls still work for the current session without persistence.
    }
  }, [settings]);

  const copySettings = async () => {
    const serialized = JSON.stringify(settings, null, 2);
    try {
      await navigator.clipboard.writeText(serialized);
      setCopyStatus("已复制");
    } catch {
      const textArea = document.createElement("textarea");
      textArea.value = serialized;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      textArea.remove();
      setCopyStatus("已复制");
    }
    window.setTimeout(() => setCopyStatus("复制参数"), 1600);
  };

  useEffect(() => {
    const stage = stageRef.current;
    const canvas = canvasRef.current;
    const lifecycle = createAnimationLifecycle();

    stage?.removeAttribute("data-webgl-ready");

    if (
      reducedMotion ||
      suspended ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
      !stage ||
      !canvas
    ) {
      lifecycle.dispose();
      return;
    }

    let disposeScene = () => {};
    void import("three")
      .then((THREE) => {
        if (!lifecycle.isActive()) return;

        const config = getParticlePortraitConfig(
          compact,
          window.devicePixelRatio || 1,
        );
        const trailCanvas = document.createElement("canvas");
        const trailContext = trailCanvas.getContext("2d");
        const glowCanvas = document.createElement("canvas");
        const glowContext = glowCanvas.getContext("2d");
        if (!trailContext || !glowContext) {
          throw new Error("Pixel trail unavailable");
        }
        trailCanvas.width = config.trailSize;
        trailCanvas.height = config.trailSize;
        glowCanvas.width = 128;
        glowCanvas.height = 128;
        trailContext.fillStyle = "#000";
        trailContext.fillRect(0, 0, config.trailSize, config.trailSize);

        const glowGradient = glowContext.createRadialGradient(
          64,
          64,
          0,
          64,
          64,
          64,
        );
        glowGradient.addColorStop(0, "rgba(255,255,255,0.95)");
        glowGradient.addColorStop(0.38, "rgba(255,255,255,0.6)");
        glowGradient.addColorStop(0.72, "rgba(255,255,255,0.16)");
        glowGradient.addColorStop(1, "rgba(255,255,255,0)");
        glowContext.fillStyle = glowGradient;
        glowContext.fillRect(0, 0, 128, 128);

        let renderer: WebGLRenderer | null = null;
        let geometry: PlaneGeometry | null = null;
        let mesh: Mesh | null = null;
        let material: ShaderMaterial | null = null;
        let videoTexture: Texture | null = null;
        let trailTexture: CanvasTexture | null = null;
        let resizeObserver: ResizeObserver | null = null;
        let animationFrame = 0;
        let videoDecoded = false;
        let hasValidRender = false;
        let contextLost = false;
        let pointerInside = false;

        const sourceVideo = document.createElement("video");
        sourceVideo.muted = true;
        sourceVideo.loop = true;
        sourceVideo.playsInline = true;
        sourceVideo.preload = "metadata";
        sourceVideo.crossOrigin = "anonymous";

        const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
        const scene = new THREE.Scene();
        const cursorTarget = new THREE.Vector2(-10, -10);
        const cursorSmoothed = new THREE.Vector2(-10, -10);
        const cursor = new THREE.Vector2(-10, -10);
        const velocity = new THREE.Vector2();
        const velocitySmoothed = new THREE.Vector2();
        const uniforms = {
          uVideoTexture: { value: null as Texture | null },
          uTrail: { value: null as CanvasTexture | null },
          uVideoResolution: { value: new THREE.Vector2(16, 9) },
          uViewportResolution: { value: new THREE.Vector2(1, 1) },
          uCursorVelocity: { value: velocitySmoothed },
          uDisplacementStrength: { value: 2 },
          uTrailRadius: { value: 0.26 },
          uImageScale: { value: 1 },
          uImageOffset: { value: new THREE.Vector2() },
          uPixelSize: { value: 0.001 },
          uPixelDensity: { value: 0.86 },
          uPictureContrast: { value: 0.9 },
          uPictureBrightness: { value: 0.78 },
          uDetailThreshold: { value: 0.08 },
          uToneSoftness: { value: 0.72 },
          uGlowStrength: { value: 1.45 },
          uGlowRadius: { value: 2.2 },
          uTime: { value: 0 },
        };

        trailTexture = new THREE.CanvasTexture(trailCanvas);
        trailTexture.minFilter = THREE.LinearFilter;
        trailTexture.magFilter = THREE.LinearFilter;
        trailTexture.wrapS = THREE.ClampToEdgeWrapping;
        trailTexture.wrapT = THREE.ClampToEdgeWrapping;
        trailTexture.colorSpace = THREE.NoColorSpace;
        uniforms.uTrail.value = trailTexture;

        const getFrameState = (): PixelVideoFrameState => ({
          active: lifecycle.isActive(),
          hidden: document.hidden,
          contextLost,
          videoDecoded,
          mediaReady: sourceVideo.readyState >= 2,
        });

        const clearReadyState = () => {
          hasValidRender = false;
          stage.removeAttribute("data-webgl-ready");
        };

        const pauseAndClear = () => {
          clearReadyState();
          window.cancelAnimationFrame(animationFrame);
          animationFrame = 0;
          sourceVideo.pause();
        };

        const renderScene = () => {
          if (
            !renderer ||
            !material ||
            !videoTexture ||
            !canRenderPixelVideoFrame(getFrameState())
          ) {
            clearReadyState();
            return false;
          }
          try {
            const context = renderer.getContext();
            if (context.isContextLost()) {
              contextLost = true;
              pauseAndClear();
              return false;
            }
            renderer.render(scene, camera);
            if (context.isContextLost()) {
              contextLost = true;
              pauseAndClear();
              return false;
            }
            hasValidRender = true;
            return true;
          } catch {
            clearReadyState();
            return false;
          }
        };

        const renderAndReveal = () => {
          if (!renderScene() || !hasValidRender) return false;
          if (!canRenderPixelVideoFrame(getFrameState())) {
            clearReadyState();
            return false;
          }
          stage.dataset.webglReady = "true";
          return true;
        };

        const updateUniforms = () => {
          const visualSettings = settingsRef.current;
          uniforms.uDisplacementStrength.value =
            visualSettings.displacementStrength;
          uniforms.uTrailRadius.value = visualSettings.mouseAreaSize;
          // Existing particle controls map to visible pixel-video parameters.
          uniforms.uImageScale.value = 0.8 + visualSettings.imageScale * 0.5;
          uniforms.uImageOffset.value.set(
            visualSettings.positionX * 0.85,
            visualSettings.positionY * 0.85,
          );
          uniforms.uPixelSize.value = Math.max(
            0.00045,
            visualSettings.pointSize * 0.045,
          );
          uniforms.uPixelDensity.value = visualSettings.density;
          uniforms.uPictureContrast.value = visualSettings.contrast;
          uniforms.uPictureBrightness.value = visualSettings.brightness;
          uniforms.uDetailThreshold.value = visualSettings.detailThreshold;
          uniforms.uToneSoftness.value = visualSettings.toneSoftness;
          uniforms.uGlowStrength.value = visualSettings.glowStrength;
          uniforms.uGlowRadius.value = visualSettings.glowRadius;
          uniforms.uCursorVelocity.value.copy(velocitySmoothed);
        };

        const resize = () => {
          if (!renderer || !lifecycle.isActive()) return false;
          const width = Math.max(1, stage.clientWidth);
          const height = Math.max(1, stage.clientHeight);
          renderer.setPixelRatio(config.dpr);
          renderer.setSize(width, height, false);
          uniforms.uViewportResolution.value.set(width, height);
          updateUniforms();
          return renderAndReveal();
        };

        const updateTrail = () => {
          const visualSettings = settingsRef.current;
          if (pointerInside) {
            cursorSmoothed.x +=
              (cursorTarget.x - cursorSmoothed.x) * config.cursorSmoothing;
            cursorSmoothed.y +=
              (cursorTarget.y - cursorSmoothed.y) * config.cursorSmoothing;
            const previousX = cursor.x;
            const previousY = cursor.y;
            cursor.x +=
              (cursorSmoothed.x - cursor.x) * config.cursorLerpStrength;
            cursor.y +=
              (cursorSmoothed.y - cursor.y) * config.cursorLerpStrength;
            velocity.x = (cursor.x - previousX) / config.trailSize;
            velocity.y = -(cursor.y - previousY) / config.trailSize;
          } else {
            velocity.multiplyScalar(0.78);
          }

          velocitySmoothed.x +=
            (velocity.x - velocitySmoothed.x) * config.velocitySmoothing;
          velocitySmoothed.y +=
            (velocity.y - velocitySmoothed.y) * config.velocitySmoothing;
          const speed = cursorTarget.distanceTo(cursor);
          const trailAlpha = Math.min(
            0.45,
            Math.max(0.006, visualSettings.fadeSpeed),
          );

          trailContext.globalCompositeOperation = "source-over";
          trailContext.globalAlpha = trailAlpha;
          trailContext.fillStyle = "#000";
          trailContext.fillRect(0, 0, config.trailSize, config.trailSize);

          if (pointerInside) {
            const glowSize =
              config.trailSize * Math.max(0.08, visualSettings.mouseAreaSize);
            const drawX = cursor.x - glowSize / 2;
            const drawY = cursor.y - glowSize / 2;
            trailContext.globalCompositeOperation = "screen";
            trailContext.globalAlpha = Math.min(
              0.94,
              speed * config.speedAlphaMultiplier + 0.14,
            );
            trailContext.drawImage(
              glowCanvas,
              drawX,
              drawY,
              glowSize,
              glowSize,
            );

            const velocityLength = Math.hypot(
              velocitySmoothed.x,
              velocitySmoothed.y,
            );
            if (velocityLength > 0.0008) {
              const dirX = velocitySmoothed.x / velocityLength;
              const dirY = -velocitySmoothed.y / velocityLength;
              const streakLength = Math.min(
                config.trailSize * 0.45,
                velocityLength *
                  config.trailSize *
                  config.trailVelocityScale *
                  18,
              );
              trailContext.globalAlpha = Math.min(
                0.48,
                trailAlpha + velocityLength * 7,
              );
              trailContext.strokeStyle = "rgba(255,255,255,0.8)";
              trailContext.lineWidth = Math.max(1, glowSize * 0.06);
              trailContext.beginPath();
              trailContext.moveTo(
                cursor.x - dirX * streakLength,
                cursor.y - dirY * streakLength,
              );
              trailContext.lineTo(cursor.x, cursor.y);
              trailContext.stroke();
            }
          }

          trailContext.globalAlpha = 1;
          trailContext.globalCompositeOperation = "source-over";
          trailTexture!.needsUpdate = true;
        };

        const tick = (time: number) => {
          animationFrame = 0;
          if (!canRenderPixelVideoFrame(getFrameState())) {
            clearReadyState();
            return;
          }
          updateTrail();
          updateUniforms();
          uniforms.uTime.value = time / 1000;
          if (renderAndReveal() && canRenderPixelVideoFrame(getFrameState())) {
            animationFrame = window.requestAnimationFrame(tick);
          }
        };

        const getTrailPoint = (event: PointerEvent) => {
          const rect = stage.getBoundingClientRect();
          if (!rect.width || !rect.height) return null;
          return new THREE.Vector2(
            Math.min(
              config.trailSize,
              Math.max(0, ((event.clientX - rect.left) / rect.width) * config.trailSize),
            ),
            Math.min(
              config.trailSize,
              Math.max(0, ((event.clientY - rect.top) / rect.height) * config.trailSize),
            ),
          );
        };

        const handlePointerMove = (event: PointerEvent) => {
          const nextCursor = getTrailPoint(event);
          if (!nextCursor) {
            pointerInside = false;
            return;
          }
          if (!pointerInside) {
            cursorTarget.copy(nextCursor);
            cursorSmoothed.copy(nextCursor);
            cursor.copy(nextCursor);
            velocity.set(0, 0);
            velocitySmoothed.set(0, 0);
          } else {
            cursorTarget.copy(nextCursor);
          }
          pointerInside = true;
        };

        const handlePointerLeave = () => {
          pointerInside = false;
          cursorTarget.copy(cursor);
        };

        const handleVisibilityChange = () => {
          if (document.hidden) {
            pauseAndClear();
            return;
          }
          if (!canRenderPixelVideoFrame(getFrameState())) {
            clearReadyState();
            return;
          }
          void sourceVideo.play().then(() => {
            if (!canRenderPixelVideoFrame(getFrameState())) {
              clearReadyState();
              return;
            }
            if (resize() && !animationFrame) {
              animationFrame = window.requestAnimationFrame(tick);
            }
          }).catch(() => {
            clearReadyState();
          });
        };

        const handleContextLost = (event: Event) => {
          event.preventDefault();
          contextLost = true;
          pauseAndClear();
        };

        const handleContextRestored = () => {
          contextLost = false;
          clearReadyState();
          if (!renderer || !canRenderPixelVideoFrame(getFrameState())) {
            if (document.hidden) sourceVideo.pause();
            return;
          }
          void sourceVideo.play().then(() => {
            if (!canRenderPixelVideoFrame(getFrameState())) {
              clearReadyState();
              return;
            }
            if (resize() && canRenderPixelVideoFrame(getFrameState())) {
              animationFrame = window.requestAnimationFrame(tick);
            }
          }).catch(() => {
            clearReadyState();
          });
        };

        const setupVideoTexture = () => {
          if (
            !lifecycle.isActive() ||
            !sourceVideo.videoWidth ||
            !sourceVideo.videoHeight ||
            material
          ) {
            return;
          }
          try {
            videoDecoded = true;
            videoTexture = new THREE.VideoTexture(sourceVideo);
            videoTexture.colorSpace = THREE.SRGBColorSpace;
            videoTexture.minFilter = THREE.LinearFilter;
            videoTexture.magFilter = THREE.LinearFilter;
            videoTexture.wrapS = THREE.ClampToEdgeWrapping;
            videoTexture.wrapT = THREE.ClampToEdgeWrapping;
            uniforms.uVideoTexture.value = videoTexture;
            uniforms.uVideoResolution.value.set(
              sourceVideo.videoWidth,
              sourceVideo.videoHeight,
            );

            geometry = new THREE.PlaneGeometry(2, 2);
            material = new THREE.ShaderMaterial({
              uniforms,
              vertexShader: pixelVideoVertexShader,
              fragmentShader: pixelVideoFragmentShader,
              transparent: false,
              depthTest: false,
              depthWrite: false,
            });
            mesh = new THREE.Mesh(geometry, material);
            scene.add(mesh);

            renderer = new THREE.WebGLRenderer({
              canvas,
              alpha: false,
              antialias: false,
              preserveDrawingBuffer: false,
              powerPreference: "high-performance",
            });
            renderer.setClearColor(0x000000, 1);
            renderer.outputColorSpace = THREE.SRGBColorSpace;
            canvas.dataset.webglGeometry = "plane-quad";
            canvas.dataset.webglDpr = String(config.dpr);
            resizeObserver = new ResizeObserver(resize);
            resizeObserver.observe(stage);
            if (resize() && canRenderPixelVideoFrame(getFrameState())) {
              animationFrame = window.requestAnimationFrame(tick);
            }
          } catch {
            videoDecoded = false;
            stage.removeAttribute("data-webgl-ready");
          }
        };

        const handleVideoError = () => {
          videoDecoded = false;
          pauseAndClear();
        };

        const pointerEventOptions = { passive: true };
        stage.addEventListener(
          "pointermove",
          handlePointerMove,
          pointerEventOptions,
        );
        stage.addEventListener(
          "pointerleave",
          handlePointerLeave,
          pointerEventOptions,
        );
        document.addEventListener("visibilitychange", handleVisibilityChange);
        canvas.addEventListener("webglcontextlost", handleContextLost, false);
        canvas.addEventListener(
          "webglcontextrestored",
          handleContextRestored,
          false,
        );
        sourceVideo.addEventListener("loadeddata", setupVideoTexture);
        sourceVideo.addEventListener("canplay", setupVideoTexture);
        sourceVideo.addEventListener("error", handleVideoError);
        sourceVideo.src = particlePortraitVideoSrc;
        sourceVideo.load();
        void sourceVideo.play().catch(() => {
          stage.removeAttribute("data-webgl-ready");
        });

        disposeScene = () => {
          window.cancelAnimationFrame(animationFrame);
          stage.removeEventListener(
            "pointermove",
            handlePointerMove,
            pointerEventOptions,
          );
          stage.removeEventListener(
            "pointerleave",
            handlePointerLeave,
            pointerEventOptions,
          );
          document.removeEventListener(
            "visibilitychange",
            handleVisibilityChange,
          );
          canvas.removeEventListener(
            "webglcontextlost",
            handleContextLost,
            false,
          );
          canvas.removeEventListener(
            "webglcontextrestored",
            handleContextRestored,
            false,
          );
          sourceVideo.removeEventListener("loadeddata", setupVideoTexture);
          sourceVideo.removeEventListener("canplay", setupVideoTexture);
          sourceVideo.removeEventListener("error", handleVideoError);
          sourceVideo.pause();
          sourceVideo.removeAttribute("src");
          sourceVideo.load();
          resizeObserver?.disconnect();
          stage.removeAttribute("data-webgl-ready");
          if (mesh) scene.remove(mesh);
          geometry?.dispose();
          material?.dispose();
          videoTexture?.dispose();
          trailTexture?.dispose();
          renderer?.dispose();
          mesh = null;
          geometry = null;
          material = null;
          videoTexture = null;
          trailTexture = null;
          renderer = null;
        };
      })
      .catch(() => stage.removeAttribute("data-webgl-ready"));

    return () => {
      lifecycle.dispose();
      disposeScene();
    };
  }, [compact, reducedMotion, suspended]);

  return (
    <div
      ref={stageRef}
      className="particle-portrait-stage"
      style={
        {
          "--particle-scale": settings.imageScale,
          "--particle-offset-x": `${settings.positionX * 100}%`,
          "--particle-offset-y": `${-settings.positionY * 100}%`,
          "--particle-glow-blur": `${settings.glowRadius * 2.8}px`,
          "--particle-glow-wide": `${settings.glowRadius * 6.5}px`,
          "--particle-glow-opacity": Math.min(
            0.85,
            0.16 + settings.glowStrength * 0.2,
          ),
          "--particle-glow-wide-opacity": Math.min(
            0.45,
            settings.glowStrength * 0.09,
          ),
        } as CSSProperties
      }
    >
      {shouldUseDynamicParticlePortrait(reducedMotion, suspended) ? (
        <canvas
          ref={canvasRef}
          className="particle-portrait-canvas"
          aria-hidden="true"
          tabIndex={-1}
        />
      ) : null}
      <button
        type="button"
        className="particle-controls-toggle"
        aria-expanded={controlsOpen}
        aria-controls="particle-visual-controls"
        onClick={() => setControlsOpen((open) => !open)}
      >
        {controlsOpen ? "关闭调参" : "像素调参"}
      </button>
      {controlsOpen ? (
        <aside
          id="particle-visual-controls"
          className="particle-controls"
          aria-label="像素视频实时调节"
        >
          <div className="particle-controls-heading">
            <strong>PIXEL VIDEO TUNING</strong>
            <span>实时预览 · 自动保存</span>
          </div>
          <div className="particle-controls-fields">
            {particleControlGroups.map((control) => (
              <label key={control.key}>
                <span>{control.label}</span>
                <output>{settings[control.key].toFixed(control.digits)}</output>
                <input
                  type="range"
                  min={control.min}
                  max={control.max}
                  step={control.step}
                  value={settings[control.key]}
                  onChange={(event) =>
                    setSettings((current) => ({
                      ...current,
                      [control.key]: Number(event.target.value),
                    }))
                  }
                />
              </label>
            ))}
          </div>
          <div className="particle-controls-actions">
            <button type="button" onClick={() => setSettings(particleVisualDefaults)}>
              恢复默认
            </button>
            <button type="button" onClick={copySettings}>
              {copyStatus}
            </button>
          </div>
        </aside>
      ) : null}
    </div>
  );
}

function InteractiveParticlePortrait({
  reducedMotion,
  suspended,
  onReady,
  onEnded,
  onError,
}: {
  reducedMotion: boolean;
  suspended: boolean;
  onReady: () => void;
  onEnded: () => void;
  onError: () => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const resumeAfterVisibilityRef = useRef(false);
  const [ready, setReady] = useState(false);
  const [ended, setEnded] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (suspended || reducedMotion) {
      video.pause();
      resumeAfterVisibilityRef.current = false;
      return;
    }

    void video.play().catch(() => undefined);
  }, [reducedMotion, suspended]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        resumeAfterVisibilityRef.current = !video.paused && !video.ended;
        video.pause();
        return;
      }

      if (
        resumeAfterVisibilityRef.current &&
        !suspended &&
        !reducedMotion &&
        !video.ended
      ) {
        resumeAfterVisibilityRef.current = false;
        void video.play().catch(() => undefined);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      resumeAfterVisibilityRef.current = false;
    };
  }, [reducedMotion, suspended]);

  const replay = () => {
    const video = videoRef.current;
    if (!video || !ended) return;

    video.currentTime = 0;
    void video
      .play()
      .then(() => setEnded(false))
      .catch(() => setEnded(true));
  };

  return (
    <button
      type="button"
      className="pixel-video-stage"
      data-video-ready={ready ? "true" : undefined}
      data-video-ended={ended ? "true" : undefined}
      aria-label={
        ended
          ? "像素作品视频已播放完毕，点击从头重播"
          : "像素作品视频正在播放"
      }
      onClick={replay}
    >
      <video
        ref={videoRef}
        className="pixel-video-media"
        src={particlePortraitVideoSrc}
        autoPlay={!reducedMotion && !suspended}
        muted
        playsInline
        preload="auto"
        onLoadedData={() => {
          setReady(true);
          onReady();
        }}
        onPlaying={() => {
          setReady(true);
          setEnded(false);
          onReady();
        }}
        onEnded={() => {
          setEnded(true);
          onEnded();
        }}
        onError={() => {
          setReady(false);
          setEnded(false);
          onError();
        }}
      />
      <span className="pixel-video-replay" aria-hidden="true">
        CLICK TO REPLAY
      </span>
    </button>
  );
}

function HomeShowreel({
  content,
  reducedMotion,
  suspendEffects,
  onMediaReady,
  onMediaEnded,
  onMediaError,
}: {
  content: HomeContent;
  reducedMotion: boolean;
  suspendEffects: boolean;
  onMediaReady: () => void;
  onMediaEnded: () => void;
  onMediaError: () => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hasPersonalMedia = Boolean(content.video || content.photo);
  const isParticleFallback = !content.video && !content.photo;
  useReducedMotionMedia(videoRef, reducedMotion);

  return (
    <div
      className={`home-showreel ${isParticleFallback ? "is-particle-fallback" : ""}`}
      aria-label="项目影像视觉台"
    >
      {content.video ? (
        <video
          ref={videoRef}
          className="home-primary-media"
          src={resolveMediaUrl(content.video)}
          poster={resolveMediaUrl(content.poster)}
          autoPlay={!reducedMotion}
          muted
          loop
          playsInline
          preload="auto"
          onLoadedData={onMediaReady}
          onError={onMediaError}
        />
      ) : content.photo ? (
        <div className="home-portrait-layout">
          <img
            src={resolveMediaUrl(content.photo)}
            alt={`${content.name}个人照片`}
            onLoad={onMediaReady}
            onError={onMediaError}
          />
          <div className="home-portrait-copy">
            <span>PROFILE / INTRO</span>
            <p>{content.intro}</p>
          </div>
        </div>
      ) : (
        <InteractiveParticlePortrait
          reducedMotion={reducedMotion}
          suspended={suspendEffects}
          onReady={onMediaReady}
          onEnded={onMediaEnded}
          onError={onMediaError}
        />
      )}
      <div className="showreel-frame" aria-hidden="true" />
      <div className="showreel-caption">
        <span>
          {hasPersonalMedia
            ? "PERSONAL PROFILE"
            : "PIXEL VIDEO PORTRAIT"}
        </span>
        <b>
          {content.video
            ? "SHOWREEL / LOOP"
            : content.photo
              ? content.role
              : "PLAY ONCE / CLICK TO REPLAY"}
        </b>
      </div>
      <div className="showreel-progress" aria-hidden="true">
        <i />
      </div>
    </div>
  );
}

function VisualScene({
  visual,
  project,
  index,
  reducedMotion,
}: {
  visual: Project["visuals"][number];
  project: Project;
  index: number;
  reducedMotion: boolean;
}) {
  const sceneRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const style = {
    "--accent": project.accent,
    "--surface": project.surface,
  } as CSSProperties;
  useReducedMotionMedia(videoRef, reducedMotion);

  useEffect(() => {
    if (reducedMotion) {
      return;
    }

    const scene = sceneRef.current;
    if (!scene) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setIsVisible(true);
        observer.disconnect();
      },
      { threshold: 0.18 },
    );

    observer.observe(scene);
    return () => observer.disconnect();
  }, [reducedMotion]);

  return (
    <article
      ref={sceneRef}
      className={`visual-scene visual-${visual.kind} ${isVisible || reducedMotion ? "is-visible" : ""}`}
      style={style}
      aria-label={visual.label}
    >
      <div className="scene-content">
        <div className="visual-meta">
          <span>{String(index + 1).padStart(2, "0")}</span>
          <span>{visual.label}</span>
        </div>

        {visual.kind === "image" && (
          <img
            className="project-asset"
            src={resolveMediaUrl(visual.src)}
            alt={visual.label}
            loading={index < 2 ? "eager" : "lazy"}
          />
        )}

        {visual.kind === "video" && (
          <video
            ref={videoRef}
            className="project-asset"
            src={resolveMediaUrl(visual.src)}
            poster={resolveMediaUrl(visual.poster)}
            autoPlay={!reducedMotion}
            muted
            loop
            playsInline
            preload="metadata"
          />
        )}

        {visual.kind === "corridor" && <ArtCorridor />}

        {visual.kind === "console" && (
          <div className="console-layout">
            <div className="console-header">
              <span>INTERACTION PANEL</span>
              <i />
              <i />
              <i />
            </div>
            <div className="console-screen">
              <span>准备好了吗？</span>
              <strong>选择你想进入的画面</strong>
            </div>
            <div className="console-options" aria-hidden="true">
              <span>叙事</span>
              <span>动作</span>
              <span>探索</span>
            </div>
            <div className="console-meter">
              <i />
            </div>
            <div className="console-grid">
              {Array.from({ length: 16 }, (_, cell) => (
                <span key={cell} />
              ))}
            </div>
          </div>
        )}

        {visual.kind === "mobile" && (
          <div className="phone-stage">
            <div className="phone phone-left">
              <div className="phone-island" />
              <span className="phone-kicker">LOADING / 01</span>
              <div className="phone-orb">
                <i />
              </div>
              <strong>移动叙事</strong>
            </div>
            <div className="phone phone-right">
              <div className="phone-island" />
              <span className="phone-kicker">PROJECT / 04</span>
              <div className="phone-card">
                <i />
                <b>{project.title}</b>
              </div>
              <p>为不同屏幕重新组织信息，而不是简单缩小桌面页面。</p>
            </div>
          </div>
        )}

        {visual.kind === "poster" && (
          <div className="poster-layout">
            <p>PROJECT / {project.year}</p>
            <div className="poster-title">
              <span>{project.title.slice(0, 2)}</span>
              <span>{project.title.slice(2) || "系统"}</span>
            </div>
            <div className="poster-stamp">
              <i />
              <span>VISUAL<br />DIRECTION</span>
            </div>
            <div className="poster-lines" />
          </div>
        )}

        {visual.kind === "orbits" && (
          <div className="orbit-layout">
            <div className="orbit orbit-one"><i /></div>
            <div className="orbit orbit-two"><i /></div>
            <div className="orbit orbit-three"><i /></div>
            <div className="orbit-copy">
              <span>VISUAL LANGUAGE</span>
              <strong>{project.title}</strong>
              <p>从一个核心母题向不同媒介扩展。</p>
            </div>
          </div>
        )}

        {visual.kind === "archive" && (
          <div className="archive-layout">
            {Array.from({ length: 8 }, (_, card) => (
              <div className="archive-card" key={card}>
                <span>{String(card + 1).padStart(2, "0")}</span>
                <i />
                <b>{card % 2 === 0 ? project.title : project.client}</b>
              </div>
            ))}
          </div>
        )}

        {visual.kind === "kinetic" && (
          <div className="kinetic-layout">
            <div className="kinetic-word word-a">动</div>
            <div className="kinetic-word word-b">态</div>
            <div className="kinetic-word word-c">场</div>
            <div className="kinetic-axis axis-x" />
            <div className="kinetic-axis axis-y" />
            <div className="kinetic-note">
              <span>INPUT</span>
              <i />
              <span>VISUAL</span>
            </div>
          </div>
        )}

        {visual.kind === "cards" && (
          <div className="cards-layout">
            {["开场", "章节", "互动", "结尾"].map((label, card) => (
              <div className="system-card" key={label}>
                <span>0{card + 1}</span>
                <div className={`system-art art-${card}`} />
                <strong>{label}</strong>
                <p>{project.title}</p>
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="scene-wipe" aria-hidden="true" />
    </article>
  );
}

function SideNav({
  active,
  onNavigate,
  revealed,
}: {
  active: SectionName;
  onNavigate: (section: SectionName) => void;
  revealed: boolean;
}) {
  const handleClick = (
    event: MouseEvent<HTMLAnchorElement>,
    section: SectionName,
  ) => {
    event.preventDefault();
    onNavigate(section);
  };

  return (
    <nav
      className="side-nav"
      aria-label="主要导航"
      aria-hidden={revealed ? undefined : true}
    >
      {sections.map((section, index) => (
        <a
          key={section.id}
          href={`#${section.id}`}
          className={active === section.id ? "is-active" : ""}
          aria-current={active === section.id ? "page" : undefined}
          tabIndex={revealed ? undefined : -1}
          onClick={(event) => handleClick(event, section.id)}
          style={{ "--nav-index": index } as CSSProperties}
        >
          {section.label}
        </a>
      ))}
    </nav>
  );
}

function HomeSection({
  reducedMotion,
  introActive,
  onMediaReady,
  onMediaEnded,
  onMediaError,
}: {
  reducedMotion: boolean;
  introActive: boolean;
  onMediaReady: () => void;
  onMediaEnded: () => void;
  onMediaError: () => void;
}) {
  const isParticleHome = !homeContent.video && !homeContent.photo;
  return (
    <section
      className={`main-section home-section ${isParticleHome ? "is-particle-home" : ""}`}
      aria-label="首页"
    >
      <div className="home-visual">
        <HomeShowreel
          content={homeContent}
          reducedMotion={reducedMotion}
          suspendEffects={introActive}
          onMediaReady={onMediaReady}
          onMediaEnded={onMediaEnded}
          onMediaError={onMediaError}
        />
        <p className="home-edition">{homeContent.edition}</p>
      </div>
      <div className="home-title">
        <div className="intro-title-assembly" aria-hidden="true">
          <div className="intro-title-role">
            {homeRoleSlices.map((slice) => (
              <span
                key={slice}
                style={
                  {
                    "--slice-index": slice,
                    "--slice-count": homeRoleSlices.length,
                    "--slice-left": `${(slice / homeRoleSlices.length) * 100}%`,
                    "--slice-right": `${((homeRoleSlices.length - slice - 1) / homeRoleSlices.length) * 100}%`,
                    "--slice-delay": `${(homeRoleSlices.length - slice - 1) * 18}ms`,
                  } as CSSProperties
                }
              >
                <b>{homeContent.role}</b>
              </span>
            ))}
          </div>
          <div className="intro-title-name">
            {homeTitleSlices.map((slice) => (
              <span
                key={slice}
                style={
                  {
                    "--slice-index": slice,
                    "--slice-count": homeTitleSlices.length,
                    "--slice-left": `${(slice / homeTitleSlices.length) * 100}%`,
                    "--slice-right": `${((homeTitleSlices.length - slice - 1) / homeTitleSlices.length) * 100}%`,
                    "--slice-delay": `${(homeTitleSlices.length - slice - 1) * 22}ms`,
                  } as CSSProperties
                }
              >
                <b>{homeContent.name}</b>
              </span>
            ))}
          </div>
        </div>
        <p className="home-title-role">{homeContent.role}</p>
        <h1 className="home-title-name">{homeContent.name}</h1>
      </div>
    </section>
  );
}

function ProjectPreview({
  project,
  index,
  reducedMotion,
}: {
  project: Project;
  index: number;
  reducedMotion: boolean;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  useReducedMotionMedia(videoRef, reducedMotion);
  const previewMode = getProjectPreviewMode(project);
  const [autoFit, setAutoFit] = useState<Exclude<PreviewMode, "auto">>(() =>
    getPreviewFit(previewMode),
  );
  const [mediaReady, setMediaReady] = useState(false);
  const firstMedia = project.visuals.find(
    (visual) => visual.kind === "image" || visual.kind === "video",
  );
  const firstImage = firstMedia?.kind === "image" ? firstMedia.src : undefined;
  const [imageSource, setImageSource] = useState(project.cover || firstImage);

  const previewClassName = `preview-media preview-media-${
    previewMode === "auto" ? autoFit : previewMode
  }${mediaReady ? " is-media-ready" : ""}`;
  const updateAutoFit = (width: number, height: number) => {
    if (previewMode !== "auto" || width <= 0 || height <= 0) return;
    setAutoFit(getPreviewFit(previewMode, width / height));
  };

  if (imageSource) {
    return (
      <img
        className={previewClassName}
        src={resolveMediaUrl(imageSource)}
        alt=""
        loading="eager"
        decoding="async"
        onLoad={(event) => {
          updateAutoFit(
            event.currentTarget.naturalWidth,
            event.currentTarget.naturalHeight,
          );
          setMediaReady(true);
        }}
        onError={() => {
          setMediaReady(false);
          if (project.cover && firstImage && imageSource !== firstImage) {
            setImageSource(firstImage);
          }
        }}
      />
    );
  }

  if (firstMedia?.kind === "video") {
    return (
      <video
        ref={videoRef}
        className={previewClassName}
        src={resolveMediaUrl(firstMedia.src)}
        poster={resolveMediaUrl(firstMedia.poster)}
        autoPlay={!reducedMotion}
        muted
        loop
        playsInline
        preload="metadata"
        onLoadedMetadata={(event) => {
          updateAutoFit(event.currentTarget.videoWidth, event.currentTarget.videoHeight)
        }}
        onLoadedData={() => setMediaReady(true)}
        onError={() => setMediaReady(false)}
      />
    );
  }

  if (index === 0) return <ArtCorridor compact />;

  return (
    <div className={`preview-art preview-art-${index % 4}`}>
      <span>{project.title}</span>
      <i />
      <b>{String(index + 1).padStart(2, "0")}</b>
    </div>
  );
}

function KineticWorkList({
  active,
  onHover,
  onOpen,
  reducedMotion,
}: {
  active: number;
  onHover: (index: number) => void;
  onOpen: (index: number) => void;
  reducedMotion: boolean;
}) {
  const listRef = useRef<HTMLDivElement>(null);
  const titleRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const keyboardTargetRef = useRef<number | null>(null);
  const initialActiveRef = useRef(active);
  const [ready, setReady] = useState(false);
  const [rovingIndex, setRovingIndex] = useState(active);
  const rovingIndexRef = useRef(active);

  useEffect(() => {
    const list = listRef.current;
    if (!list) return;

    const clearTransforms = () => {
      titleRefs.current.forEach((title) => {
        if (!title) return;
        title.style.removeProperty("height");
        title.style.removeProperty("transform");
      });
    };

    if (reducedMotion) {
      clearTransforms();
      return;
    }

    let frame = 0;
    let currentPosition = 0;
    let lerpedPosition = 0;
    let velocity = 0;
    let targetVelocity = 0;
    let lastInputAt = 0;
    let touchY: number | null = null;
    let isDesktop = window.innerWidth > 820;
    let didMarkReady = false;
    let didSetInitialPosition = false;

    const markReady = () => {
      if (didMarkReady) return;
      didMarkReady = true;
      setReady(true);
    };

    const render = (now: number) => {
      isDesktop = window.innerWidth > 820;
      if (!isDesktop) {
        clearTransforms();
        markReady();
        frame = window.requestAnimationFrame(render);
        return;
      }

      const viewportHeight = list.clientHeight || window.innerHeight;
      const rowHeight = window.innerWidth * 0.09;
      const rowGap = Math.max(6, rowHeight * 0.08);
      const rowStride = rowHeight + rowGap;
      const totalHeight = Math.max(rowStride, rowStride * projects.length);
      const centeredPosition =
        initialActiveRef.current * rowStride - (viewportHeight - rowHeight) / 2;

      if (!didSetInitialPosition) {
        currentPosition = centeredPosition;
        lerpedPosition = centeredPosition;
        didSetInitialPosition = true;
      }

      if (keyboardTargetRef.current !== null) {
        const keyboardTarget = keyboardTargetRef.current;
        currentPosition =
          keyboardTarget * rowStride - (viewportHeight - rowHeight) / 2;
        lerpedPosition = currentPosition;
        keyboardTargetRef.current = null;
      }

      lerpedPosition += (currentPosition - lerpedPosition) * 0.05;
      if (now - lastInputAt > 5) {
        targetVelocity += (0 - targetVelocity) * 0.05;
      }
      velocity += (targetVelocity - velocity) * 0.05;

      const distortion = Math.min(
        Math.abs(velocity) * 0.009 * 2.4,
        2.7,
      );
      const viewportCenter = viewportHeight / 2;
      const warpY = (sourceY: number) => {
        const centeredY = Math.max(
          -viewportCenter,
          Math.min(viewportCenter, sourceY - viewportCenter),
        );

        return (
          sourceY +
          distortion *
            (viewportHeight / Math.PI) *
            Math.sin((centeredY / viewportHeight) * Math.PI)
        );
      };

      const itemCenters: Array<{ index: number; center: number }> = [];
      titleRefs.current.forEach((title, index) => {
        if (!title) return;

        const y = wrapKineticPosition(
          index * rowStride - lerpedPosition,
          totalHeight,
        );

        const warpedTop = warpY(y);
        const warpedBottom = warpY(y + rowHeight);
        const stretch = Math.max(
          1,
          (warpedBottom - warpedTop) / rowHeight,
        );

        title.style.height = `${rowHeight}px`;
        title.style.transform =
          `translate3d(0, ${warpedTop}px, 0) scaleY(${stretch})`;
        itemCenters.push({
          index,
          center: warpedTop + (warpedBottom - warpedTop) / 2,
        });
      });

      const nearestIndex = getNearestRovingIndex(
        itemCenters,
        viewportCenter,
        rovingIndexRef.current,
      );
      if (nearestIndex !== rovingIndexRef.current) {
        const listHadFocus = list.contains(document.activeElement);
        rovingIndexRef.current = nearestIndex;
        setRovingIndex(nearestIndex);
        onHover(nearestIndex);
        if (listHadFocus) {
          titleRefs.current[nearestIndex]?.focus({ preventScroll: true });
        }
      }

      markReady();
      frame = window.requestAnimationFrame(render);
    };

    const addDelta = (delta: number) => {
      if (!isDesktop) return;
      currentPosition += delta * 0.4;
      targetVelocity = delta;
      lastInputAt = performance.now();
    };

    const handleWheel = (event: WheelEvent) => {
      if (
        !isDesktop ||
        event.ctrlKey ||
        Math.abs(event.deltaX) > Math.abs(event.deltaY)
      ) {
        return;
      }
      event.preventDefault();
      addDelta(event.deltaY);
    };

    const handleTouchStart = (event: TouchEvent) => {
      touchY = event.touches[0]?.clientY ?? null;
    };

    const handleTouchMove = (event: TouchEvent) => {
      if (!isDesktop || touchY === null || !event.touches[0]) return;
      event.preventDefault();
      const nextY = event.touches[0].clientY;
      addDelta((touchY - nextY) * 5);
      touchY = nextY;
    };

    const handleResize = () => {
      isDesktop = window.innerWidth > 820;
      if (!isDesktop) clearTransforms();
    };

    window.addEventListener("wheel", handleWheel, { passive: false });
    window.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("touchmove", handleTouchMove, { passive: false });
    window.addEventListener("resize", handleResize);
    frame = window.requestAnimationFrame(render);

    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("wheel", handleWheel);
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("resize", handleResize);
    };
  }, [onHover, reducedMotion]);

  const handleTitleKeyDown = (
    event: ReactKeyboardEvent<HTMLButtonElement>,
    index: number,
  ) => {
    if (
      event.defaultPrevented ||
      event.metaKey ||
      event.ctrlKey ||
      event.altKey
    ) {
      return;
    }

    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      event.stopPropagation();
      onOpen(index);
      return;
    }

    const direction =
      event.key === "ArrowDown" || event.key === "ArrowRight"
        ? 1
        : event.key === "ArrowUp" || event.key === "ArrowLeft"
          ? -1
          : 0;
    if (!direction) return;

    event.preventDefault();
    event.stopPropagation();
    const nextIndex =
      (index + direction + projects.length) % projects.length;
    keyboardTargetRef.current = nextIndex;
    rovingIndexRef.current = nextIndex;
    setRovingIndex(nextIndex);
    onHover(nextIndex);
    window.requestAnimationFrame(() => titleRefs.current[nextIndex]?.focus());
  };

  return (
    <div
      ref={listRef}
      className={`work-list kinetic-work-list ${ready || reducedMotion ? "is-ready" : ""} ${reducedMotion ? "is-reduced-motion" : ""}`}
    >
      {projects.map((project, index) => (
        <button
          ref={(node) => {
            titleRefs.current[index] = node;
          }}
          type="button"
          className={`kinetic-work-title ${active === index ? "is-current" : ""}`}
          key={project.title}
          onMouseEnter={() => onHover(index)}
          onFocus={() => {
            rovingIndexRef.current = index;
            setRovingIndex(index);
            onHover(index);
          }}
          onClick={() => onOpen(index)}
          onKeyDown={(event) => handleTitleKeyDown(event, index)}
          tabIndex={rovingIndex === index ? 0 : -1}
          data-project-index={index}
          aria-label={`${project.title}，查看项目`}
        >
          {getProjectDisplayTitle(project)}
        </button>
      ))}
    </div>
  );
}

function WorkSection({
  onOpenProject,
  reducedMotion,
  initialFocusIndex,
}: {
  onOpenProject: (index: number) => void;
  reducedMotion: boolean;
  initialFocusIndex: number;
}) {
  const [hovered, setHovered] = useState(initialFocusIndex);
  const hoveredProject = projects[hovered] || projects[0];

  useEffect(() => {
    const preloaders = projects
      .map((project) => {
        const firstImage = project.visuals.find(
          (visual) => visual.kind === "image",
        );
        const source = project.cover ||
          (firstImage?.kind === "image" ? firstImage.src : undefined);
        if (!source) return null;

        const image = new Image();
        image.decoding = "async";
        image.src = resolveMediaUrl(source);
        return image;
      })
      .filter((image): image is HTMLImageElement => Boolean(image));

    return () => {
      preloaders.forEach((image) => {
        image.onload = null;
        image.onerror = null;
      });
    };
  }, []);

  return (
    <section className="main-section work-section" aria-label="作品">
      <div className="work-browser">
        <KineticWorkList
          active={hovered}
          onHover={setHovered}
          onOpen={onOpenProject}
          reducedMotion={reducedMotion}
        />
      </div>

      <div
        className="work-preview"
        style={
          {
            "--accent": hoveredProject.accent,
            "--surface": hoveredProject.surface,
          } as CSSProperties
        }
        aria-hidden="true"
      >
        <div className="preview-frame">
          <div className="preview-switch" key={hovered}>
            <ProjectPreview
              project={hoveredProject}
              index={hovered}
              reducedMotion={reducedMotion}
            />
          </div>
        </div>
      </div>

      <div className="work-index">
        <span>滚动浏览</span>
        <i />
        <strong>{String(hovered + 1).padStart(2, "0")}</strong>
      </div>
    </section>
  );
}

function MaskedExperienceMedia({
  experience,
  fallbackImage,
  reducedMotion,
}: {
  experience: Experience;
  fallbackImage?: string;
  reducedMotion: boolean;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const hasPaintedFrameRef = useRef(false);
  const sourceReadyRef = useRef(false);
  const stillImage = experience.video
    ? undefined
    : experience.poster || experience.image || fallbackImage;
  useReducedMotionMedia(videoRef, reducedMotion);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext("2d");
    if (!context) return;
    const drawCanvas = canvas;
    const drawContext = context;
    sourceReadyRef.current = false;

    let startTime = performance.now();
    const lifecycle = createAnimationLifecycle();
    const frameLoop = createSingleFlightAnimationFrame(
      (callback) => window.requestAnimationFrame(callback),
      (frame) => window.cancelAnimationFrame(frame),
    );

    const drawCover = (
      source: CanvasImageSource,
      sourceWidth: number,
      sourceHeight: number,
      width: number,
      height: number,
      time: number,
    ) => {
      if (!sourceWidth || !sourceHeight) return;

      const drift = reducedMotion
        ? 0.5
        : (Math.sin(time * 0.00032) + 1) / 2;
      const zoom = 1.04 + drift * 0.055;
      const scale = Math.max(width / sourceWidth, height / sourceHeight) * zoom;
      const drawWidth = sourceWidth * scale;
      const drawHeight = sourceHeight * scale;
      const travelX = Math.max(0, drawWidth - width);
      const travelY = Math.max(0, drawHeight - height);
      const x = -travelX * (0.28 + drift * 0.38);
      const y = -travelY * (0.35 + (1 - drift) * 0.22);

      drawContext.drawImage(source, x, y, drawWidth, drawHeight);
    };

    function scheduleFrame() {
      lifecycle.run(() => {
        frameLoop.schedule(render);
      });
    }

    function render(now: number) {
      if (!lifecycle.isActive()) return;
      const bounds = drawCanvas.getBoundingClientRect();
      const width = Math.max(1, bounds.width);
      const height = Math.max(1, bounds.height);
      const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
      const targetWidth = Math.round(width * pixelRatio);
      const targetHeight = Math.round(height * pixelRatio);
      const resized =
        drawCanvas.width !== targetWidth || drawCanvas.height !== targetHeight;

      if (resized) {
        drawCanvas.width = targetWidth;
        drawCanvas.height = targetHeight;
        hasPaintedFrameRef.current = false;
      }

      const video = videoRef.current;
      const image = imageRef.current;
      const hasVideoFrame = Boolean(
        sourceReadyRef.current &&
          video &&
          video.readyState >= 2 &&
          video.videoWidth &&
          video.videoHeight,
      );
      const hasImageFrame = Boolean(
        image && image.complete && image.naturalWidth && image.naturalHeight,
      );

      if (
        experience.video &&
        !hasVideoFrame &&
        hasPaintedFrameRef.current &&
        !resized
      ) {
        if (!reducedMotion) scheduleFrame();
        return;
      }

      drawContext.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
      drawContext.clearRect(0, 0, width, height);

      if (hasVideoFrame && video) {
        drawCover(
          video,
          video.videoWidth,
          video.videoHeight,
          width,
          height,
          now - startTime,
        );
      } else if (hasImageFrame && image) {
        drawCover(
          image,
          image.naturalWidth,
          image.naturalHeight,
          width,
          height,
          now - startTime,
        );
      } else {
        const fallbackGradient = drawContext.createLinearGradient(
          0,
          0,
          width,
          height,
        );
        fallbackGradient.addColorStop(0, "#71000f");
        fallbackGradient.addColorStop(0.5, "#f00612");
        fallbackGradient.addColorStop(1, "#ff1b0a");
        drawContext.fillStyle = fallbackGradient;
        drawContext.fillRect(0, 0, width, height);
      }

      drawContext.globalCompositeOperation = "screen";
      const redWash = drawContext.createLinearGradient(0, 0, width, 0);
      redWash.addColorStop(0, "rgba(150, 0, 18, 0.82)");
      redWash.addColorStop(0.52, "rgba(255, 0, 10, 0.7)");
      redWash.addColorStop(1, "rgba(255, 27, 10, 0.9)");
      drawContext.fillStyle = redWash;
      drawContext.fillRect(0, 0, width, height);

      drawContext.globalCompositeOperation = "destination-in";
      const fontSize = height * 1.17;
      drawContext.font = `400 ${fontSize}px "Anton-Regular"`;
      drawContext.textAlign = "center";
      drawContext.textBaseline = "alphabetic";
      const title = "ZYRON";
      const metrics = drawContext.measureText(title);
      const measuredWidth = Math.max(1, metrics.width);
      const ascent = metrics.actualBoundingBoxAscent || fontSize * 0.8;
      const descent = metrics.actualBoundingBoxDescent || fontSize * 0.2;
      const measuredHeight = Math.max(1, ascent + descent);
      const horizontalScale = Math.min(1.12, (width * 0.94) / measuredWidth);
      const verticalScale = Math.min(1, (height * 0.94) / measuredHeight);
      const baselineY = (height + (ascent - descent) * verticalScale) / 2;

      drawContext.save();
      drawContext.translate(width / 2, baselineY);
      drawContext.scale(horizontalScale, verticalScale);
      drawContext.fillStyle = "#fff";
      drawContext.fillText(title, 0, 0);
      drawContext.restore();
      drawContext.globalCompositeOperation = "source-over";
      hasPaintedFrameRef.current = true;

      if (!reducedMotion) {
        scheduleFrame();
      }
    }

    const drawStableFrame = () => {
      if (!lifecycle.isActive()) return;
      if (reducedMotion) {
        render(performance.now());
      } else {
        scheduleFrame();
      }
    };
    const video = videoRef.current;
    const image = imageRef.current;
    const expectedVideoUrl = experience.video
      ? new URL(resolveMediaUrl(experience.video), window.location.href).href
      : undefined;
    const markVideoReady = () => {
      if (
        !video ||
        !expectedVideoUrl ||
        video.currentSrc !== expectedVideoUrl ||
        video.readyState < 2
      ) {
        return;
      }
      sourceReadyRef.current = true;
      drawStableFrame();
    };

    video?.addEventListener("loadeddata", markVideoReady);
    image?.addEventListener("load", drawStableFrame);
    window.addEventListener("resize", drawStableFrame);

    markVideoReady();

    document.fonts
      .load('400 120px "Anton-Regular"')
      .finally(() => {
        if (!lifecycle.isActive()) return;
        startTime = performance.now();
        if (reducedMotion) {
          drawStableFrame();
        } else {
          scheduleFrame();
        }
      });

    if (reducedMotion) {
      drawStableFrame();
    } else {
      scheduleFrame();
    }

    return () => {
      lifecycle.dispose();
      frameLoop.dispose();
      video?.removeEventListener("loadeddata", markVideoReady);
      image?.removeEventListener("load", drawStableFrame);
      window.removeEventListener("resize", drawStableFrame);
    };
  }, [experience, fallbackImage, reducedMotion]);

  return (
    <div className={`about-mask-media experience-${experience.mediaKind}`}>
      <canvas
        ref={canvasRef}
        aria-label={`ZYRON — ${experience.mediaLabel}`}
      />
      {experience.video && (
        <video
          ref={videoRef}
          className="about-mask-source"
          src={resolveMediaUrl(experience.video)}
          crossOrigin="anonymous"
          autoPlay={!reducedMotion}
          muted
          loop
          playsInline
          preload="auto"
        />
      )}
      {stillImage && (
        <img
          ref={imageRef}
          className="about-mask-source"
          src={resolveMediaUrl(stillImage)}
          crossOrigin="anonymous"
          alt=""
        />
      )}
      <span className="about-mask-status">
        {experience.video ? "PLAYING" : "SELECTED"} / {experience.mediaLabel}
      </span>
    </div>
  );
}

function AboutSection({ reducedMotion }: { reducedMotion: boolean }) {
  const [step, setStep] = useState(Math.max(0, aboutSteps.length - 1));
  const activeStep = aboutSteps[step];

  return (
    <section className="main-section about-section" aria-label="经历">
      <div className="about-content">
        <div className="about-collabs">
          <p>PREVIOUS EXPERIENCE:</p>
          <div>
            <span>JINGLE /</span>
            <span>BEIJING 2022 /</span>
            <span>HUOBI /</span>
            <span>QIYU /</span>
            <span>MESHY /</span>
            <span>HTX</span>
          </div>
        </div>

        <MaskedExperienceMedia
          experience={activeStep}
          fallbackImage={getExperienceFallbackImage(activeStep, projects)}
          reducedMotion={reducedMotion}
        />
        <div
          className="about-description"
          id="about-experience-panel"
          aria-live="polite"
        >
          <div className="about-description-meta">
            <span>
              {activeStep.date} / {activeStep.company} / {activeStep.role}
            </span>
            <h2>{activeStep.title}</h2>
          </div>
          <p>{activeStep.copy}</p>
        </div>
      </div>

      <div className="about-timeline">
        <p>- SELECT A CHAPTER -</p>
        <div
          className="timeline-rail"
          style={{ "--timeline-count": aboutSteps.length } as CSSProperties}
        >
          {aboutSteps.map((item, index) => (
            <button
              type="button"
              className={step === index ? "is-active" : ""}
              aria-pressed={step === index}
              aria-controls="about-experience-panel"
              aria-label={`${item.date}，${item.label}`}
              key={item.date}
              onMouseEnter={() => {
                warmVideoMedia(item.video);
                setStep(index);
              }}
              onFocus={() => {
                warmVideoMedia(item.video);
                setStep(index);
              }}
              onClick={() => setStep(index)}
            >
              <b>{item.date}</b>
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

function ContactSection() {
  const [activeContact, setActiveContact] = useState<"wechat" | "mail" | null>(
    null,
  );
  const email = contactContent.email || "zhangzhenyuan95@gmail.com";
  const emailHref = `mailto:${email}`;

  const clearContactIfFocusLeaves = (
    event: ReactFocusEvent<HTMLDivElement>,
  ) => {
    if (
      !event.relatedTarget ||
      !event.currentTarget.contains(event.relatedTarget as Node)
    ) {
      setActiveContact(null);
    }
  };

  return (
    <section className="main-section contact-section" aria-label="联系">
      <div className="contact-wrapper">
        <h2>
          <span>MEET ME</span>
        </h2>
        <div
          className="contact-interaction"
          onBlur={clearContactIfFocusLeaves}
          onMouseLeave={(event) => {
            if (!event.currentTarget.contains(document.activeElement)) {
              setActiveContact(null);
            }
          }}
        >
          <div className="contact-links">
            <button
              type="button"
              className="contact-link contact-link-trigger"
              aria-controls="contact-detail"
              aria-expanded={activeContact === "wechat"}
              onMouseEnter={() => setActiveContact("wechat")}
              onFocus={() => setActiveContact("wechat")}
              onClick={() => setActiveContact("wechat")}
            >
              WECHAT
            </button>
            <a
              href={emailHref}
              aria-label={`Send email to ${email}`}
              aria-controls="contact-detail"
              onMouseEnter={() => setActiveContact("mail")}
              onFocus={() => setActiveContact("mail")}
            >
              MAIL
            </a>
          </div>
          <div
            id="contact-detail"
            className={`contact-detail ${activeContact ? "is-open" : ""}`}
            aria-live="polite"
          >
            <div className="contact-detail-inner">
              {activeContact === "wechat" ? (
                <img
                  className="contact-wechat-card"
                  src={resolveMediaUrl("/网站内容/联系/微信二维码.jpg")}
                  alt="微信二维码"
                  width={888}
                  height={1131}
                  decoding="async"
                />
              ) : activeContact === "mail" ? (
                <p className="contact-email-card">{email}</p>
              ) : null}
            </div>
          </div>
        </div>
        <div className="contact-tool">
          <h3>PERSONAL DEV TOOL WEBSITE</h3>
          <a
            href="https://www.zyronmatrix.com/"
            target="_blank"
            rel="noreferrer"
          >
            ZYRONMATRIX.COM ↗
          </a>
        </div>
      </div>
    </section>
  );
}

function AnimatedCharacterText({
  text,
  charClass,
  className = "",
}: {
  text: string;
  charClass: string;
  className?: string;
}) {
  const characters = Array.from(text);

  return (
    <span className={`animated-character-text ${className}`} aria-label={text}>
      {characters.map((character, index) => (
        <span
          className="project-character-mask"
          aria-hidden="true"
          key={`${character}-${index}`}
          style={
            {
              "--char-index": index,
              "--char-reverse-index": characters.length - index - 1,
              "--char-center-distance": Math.abs(
                index - (characters.length - 1) / 2,
              ),
              "--meta-delay": `${
                680 + Math.abs(index - (characters.length - 1) / 2) * 5
              }ms`,
              "--copy-delay": `${680 + index * 10}ms`,
              "--stack-delay": `${
                980 + Math.abs(index - (characters.length - 1) / 2) * 5
              }ms`,
            } as CSSProperties
          }
        >
          <span className={charClass}>
            {character === " " ? "\u00a0" : character}
          </span>
        </span>
      ))}
    </span>
  );
}

function AnimatedProjectTitle({ text }: { text: string }) {
  const characters = Array.from(text);

  return (
    <span className="project-title-characters" aria-label={text}>
      {characters.map((character, index) => (
        <span
          className="project-title-mask"
          aria-hidden="true"
          key={`${character}-${index}`}
          style={
            {
              "--char-index": index,
              "--char-reverse-index": characters.length - index - 1,
              "--title-shift-delay": `${180 + index * 20}ms`,
              "--title-stretch-delay": `${
                180 + (characters.length - index - 1) * 30
              }ms`,
            } as CSSProperties
          }
        >
          <span className="project-title-shift">
            <span className="project-title-stretch">
              {character === " " ? "\u00a0" : character}
            </span>
          </span>
        </span>
      ))}
    </span>
  );
}

function ProjectDetail({
  index,
  onClose,
  onChange,
  reducedMotion,
}: {
  index: number;
  onClose: () => void;
  onChange: (direction: number) => void;
  reducedMotion: boolean;
}) {
  const detailRef = useRef<HTMLElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const galleryRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLElement>(null);
  const targetScrollRef = useRef(0);
  const scrollFrameRef = useRef<number | null>(null);
  const project = projects[index];
  const displayTitle = getProjectDisplayTitle(project);

  useEffect(() => {
    closeButtonRef.current?.focus({ preventScroll: true });
  }, [index]);

  const animateScroll = useCallback(function scrollStep() {
    const gallery = galleryRef.current;
    if (!gallery) {
      scrollFrameRef.current = null;
      return;
    }

    const distance = targetScrollRef.current - gallery.scrollTop;
    if (Math.abs(distance) < 0.55) {
      gallery.scrollTop = targetScrollRef.current;
      scrollFrameRef.current = null;
      return;
    }

    gallery.scrollTop += distance * 0.14;
    scrollFrameRef.current = window.requestAnimationFrame(scrollStep);
  }, []);

  useEffect(() => {
    const detail = detailRef.current;
    const gallery = galleryRef.current;
    if (!detail || !gallery) return;

    targetScrollRef.current = 0;
    gallery.scrollTop = 0;

    const handleWheel = (event: WheelEvent) => {
      if (
        window.innerWidth <= 820 ||
        Math.abs(event.deltaX) > Math.abs(event.deltaY)
      ) {
        return;
      }

      event.preventDefault();
      const max = Math.max(0, gallery.scrollHeight - gallery.clientHeight);
      const nextScroll = Math.min(
        max,
        Math.max(0, targetScrollRef.current + event.deltaY * 0.92),
      );
      targetScrollRef.current = nextScroll;

      if (reducedMotion) {
        gallery.scrollTop = nextScroll;
        return;
      }

      if (scrollFrameRef.current === null) {
        scrollFrameRef.current = window.requestAnimationFrame(animateScroll);
      }
    };

    detail.addEventListener("wheel", handleWheel, { passive: false });
    return () => {
      detail.removeEventListener("wheel", handleWheel);
      if (scrollFrameRef.current !== null) {
        window.cancelAnimationFrame(scrollFrameRef.current);
        scrollFrameRef.current = null;
      }
    };
  }, [animateScroll, index, reducedMotion]);

  const handleScroll = () => {
    const gallery = galleryRef.current;
    if (!gallery) return;
    const max = gallery.scrollHeight - gallery.clientHeight;
    const progress = max <= 0 ? 0 : gallery.scrollTop / max;
    if (progressRef.current) {
      progressRef.current.textContent = String(
        Math.min(99, Math.round(progress * 99)),
      ).padStart(2, "0");
    }
    if (scrollFrameRef.current === null) {
      targetScrollRef.current = gallery.scrollTop;
    }
  };

  return (
    <section
      ref={detailRef}
      className="project-detail"
      style={
        {
          "--accent": project.accent,
          "--surface": project.surface,
        } as CSSProperties
      }
      aria-label={`${project.title}项目详情`}
      onKeyDown={(event) => {
        if (
          event.key === "Escape" &&
          !event.metaKey &&
          !event.ctrlKey &&
          !event.altKey
        ) {
          event.preventDefault();
          event.stopPropagation();
          onClose();
        }
      }}
    >
      <nav className="project-nav" aria-label="项目导航">
        <div className="project-nav-controls">
          <button ref={closeButtonRef} type="button" onClick={onClose}>CLOSE</button>
          <div className="project-nav-pager">
            <button type="button" onClick={() => onChange(-1)}>PREV</button>
            <button type="button" onClick={() => onChange(1)}>NEXT</button>
          </div>
        </div>
      </nav>

      <div className="project-info">
        <header className="project-header">
          <div className="project-meta-line">
            <AnimatedCharacterText
              text={project.year}
              charClass="project-meta-character"
              className="project-date"
            />
            <AnimatedCharacterText
              text={project.client}
              charClass="project-meta-character"
              className="project-client"
            />
          </div>
          <h1><AnimatedProjectTitle text={displayTitle} /></h1>
        </header>

        <div className="project-copy">
          <p className="project-description">
            <AnimatedCharacterText
              text={project.description}
              charClass="project-copy-character"
            />
          </p>
          <p className="project-stack">
            <AnimatedCharacterText
              text="项目能力："
              charClass="project-stack-character"
              className="project-stack-label"
            />
            <AnimatedCharacterText
              text={project.stack}
              charClass="project-stack-character"
            />
          </p>
        </div>

        <div className="project-scroll-hint">
          <span>滚动查看</span>
          <i />
          <b ref={progressRef}>00</b>
        </div>
      </div>

      <div className="project-gallery" ref={galleryRef} onScroll={handleScroll}>
        {project.visuals.map((visual, visualIndex) => (
          <VisualScene
            visual={visual}
            project={project}
            index={visualIndex}
            reducedMotion={reducedMotion}
            key={`${project.title}-${visual.kind}-${visualIndex}`}
          />
        ))}
        <button
          type="button"
          className="next-project-card"
          onClick={() => onChange(1)}
        >
          <span>下一个项目</span>
          <strong>
            {getProjectDisplayTitle(projects[(index + 1) % projects.length])}
          </strong>
          <i>→</i>
        </button>
      </div>
    </section>
  );
}

export default function Home() {
  const reducedMotion = usePrefersReducedMotion();
  const [active, setActive] = useState<SectionName>("home");
  const [detailIndex, setDetailIndex] = useState<number | null>(null);
  const [transitioning, setTransitioning] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [introRevealing, setIntroRevealing] = useState(false);
  const [navRevealed, setNavRevealed] = useState(false);
  const [introMinimumElapsed, setIntroMinimumElapsed] = useState(false);
  const [introWaitTimedOut, setIntroWaitTimedOut] = useState(false);
  const [homeMediaReady, setHomeMediaReady] = useState(false);
  const [homeMediaFailed, setHomeMediaFailed] = useState(false);
  const [homePlaybackEnded, setHomePlaybackEnded] = useState(false);
  const [restoreProjectIndex, setRestoreProjectIndex] = useState<number | null>(
    null,
  );
  const timeoutsRef = useRef<number[]>([]);
  const pendingTransitionActionRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    const syncViewFromHash = () => {
      const hash = window.location.hash.slice(1);
      const projectMatch = hash.match(/^project-(\d+)$/);

      if (projectMatch) {
        const projectIndex = Number(projectMatch[1]) - 1;
        if (projectIndex >= 0 && projectIndex < projects.length) {
          setDetailIndex(projectIndex);
          return;
        }
      }

      const section = sections.find((item) => item.id === hash);
      if (section) {
        setDetailIndex(null);
        setActive(section.id);
      }
    };

    syncViewFromHash();
    window.addEventListener("hashchange", syncViewFromHash);
    return () => window.removeEventListener("hashchange", syncViewFromHash);
  }, []);

  const clearTimers = useCallback(() => {
    timeoutsRef.current.forEach((timer) => window.clearTimeout(timer));
    timeoutsRef.current = [];
  }, []);

  useEffect(() => {
    const minimumTimer = window.setTimeout(
      () => setIntroMinimumElapsed(true),
      reducedMotion ? 0 : particleMatrixIntroTimeline.contentRevealStart,
    );
    const timeoutTimer = window.setTimeout(
      () => setIntroWaitTimedOut(true),
      reducedMotion ? 0 : 6000,
    );
    return () => {
      window.clearTimeout(minimumTimer);
      window.clearTimeout(timeoutTimer);
    };
  }, [reducedMotion]);

  useEffect(() => {
    const mediaSatisfied =
      active !== "home" ||
      homeMediaReady ||
      homeMediaFailed ||
      introWaitTimedOut;
    if (!reducedMotion && (!introMinimumElapsed || !mediaSatisfied)) return;

    setIntroRevealing(true);
    const navTimer = window.setTimeout(
      () => setNavRevealed(true),
      reducedMotion
        ? 0
        : particleMatrixIntroTimeline.navRevealStart -
            particleMatrixIntroTimeline.contentRevealStart,
    );
    const completeTimer = window.setTimeout(
      () => setLoaded(true),
      reducedMotion
        ? 0
        : particleMatrixIntroDuration -
            particleMatrixIntroTimeline.contentRevealStart,
    );
    return () => {
      window.clearTimeout(navTimer);
      window.clearTimeout(completeTimer);
    };
  }, [
    active,
    homeMediaFailed,
    homeMediaReady,
    introMinimumElapsed,
    introWaitTimedOut,
    reducedMotion,
  ]);

  useEffect(() => {
    if (!homePlaybackEnded) return;
    warmVideoMedia(aboutSteps.at(-1)?.video);
  }, [homePlaybackEnded]);

  useEffect(() => () => clearTimers(), [clearTimers]);

  useEffect(() => {
    if (!reducedMotion) return;
    const timer = window.setTimeout(() => {
      const pendingAction = pendingTransitionActionRef.current;
      pendingTransitionActionRef.current = null;
      clearTimers();
      pendingAction?.();
      setTransitioning(false);
    }, 0);
    return () => window.clearTimeout(timer);
  }, [clearTimers, reducedMotion]);

  const transitionTo = useCallback(
    (action: () => void) => {
      if (transitioning) return;
      clearTimers();
      if (reducedMotion) {
        pendingTransitionActionRef.current = null;
        setTransitioning(false);
        action();
        return;
      }
      pendingTransitionActionRef.current = action;
      setTransitioning(true);
      timeoutsRef.current.push(
        window.setTimeout(() => {
          const pendingAction = pendingTransitionActionRef.current;
          pendingTransitionActionRef.current = null;
          pendingAction?.();
        }, 570),
        window.setTimeout(() => setTransitioning(false), 1140),
      );
    },
    [clearTimers, reducedMotion, transitioning],
  );

  const navigate = (section: SectionName) => {
    if (section === active && detailIndex === null) return;
    transitionTo(() => {
      setDetailIndex(null);
      setActive(section);
      window.history.replaceState(null, "", `#${section}`);
    });
  };

  const openProject = (index: number) => {
    setRestoreProjectIndex(index);
    transitionTo(() => {
      setDetailIndex(index);
      window.history.replaceState(null, "", `#project-${index + 1}`);
    });
  };

  const closeProject = () => {
    if (detailIndex !== null) setRestoreProjectIndex(detailIndex);
    transitionTo(() => {
      setDetailIndex(null);
      setActive("work");
      window.history.replaceState(null, "", "#work");
    });
  };

  const changeProject = (direction: number) => {
    if (detailIndex === null) return;
    transitionTo(() => {
      const next =
        (detailIndex + direction + projects.length) % projects.length;
      setDetailIndex(next);
      window.history.replaceState(null, "", `#project-${next + 1}`);
    });
  };

  let activeContent = (
    <HomeSection
      reducedMotion={reducedMotion}
      introActive={!loaded && !reducedMotion}
      onMediaReady={() => setHomeMediaReady(true)}
      onMediaEnded={() => setHomePlaybackEnded(true)}
      onMediaError={() => setHomeMediaFailed(true)}
    />
  );
  if (active === "work") {
    activeContent = (
      <WorkSection
        onOpenProject={openProject}
        reducedMotion={reducedMotion}
        initialFocusIndex={restoreProjectIndex ?? 0}
      />
    );
  } else if (active === "about") {
    activeContent = <AboutSection reducedMotion={reducedMotion} />;
  } else if (active === "contact") {
    activeContent = <ContactSection />;
  }

  useEffect(() => {
    if (
      detailIndex !== null ||
      active !== "work" ||
      transitioning ||
      restoreProjectIndex === null
    ) {
      return;
    }

    const indexToRestore = restoreProjectIndex;
    const frame = window.requestAnimationFrame(() => {
      const trigger = document.querySelector<HTMLButtonElement>(
        `[data-project-index="${indexToRestore}"]`,
      );
      trigger?.focus({ preventScroll: true });
      setRestoreProjectIndex(null);
    });
    return () => window.cancelAnimationFrame(frame);
  }, [active, detailIndex, restoreProjectIndex, transitioning]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      handlePortfolioShortcut({
        event,
        interactiveTarget: isInteractiveTarget(event.target),
        detailIndex,
        active,
        navigate,
        closeProject,
        changeProject,
      });
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  });

  return (
    <main
      className={`site-shell ${loaded || reducedMotion ? "is-loaded" : ""} ${introRevealing || reducedMotion ? "is-intro-revealing" : ""} ${navRevealed || reducedMotion ? "is-nav-revealed" : ""}`}
    >
      <ParticleMatrixIntro
        hidden={loaded || reducedMotion}
        reducedMotion={reducedMotion}
        revealContent={introRevealing || reducedMotion}
      />

      {detailIndex === null && (
        <SideNav
          active={active}
          onNavigate={navigate}
          revealed={navRevealed || reducedMotion}
        />
      )}

      <div
        className={`section-stage ${detailIndex !== null ? "is-project-detail" : ""}`}
        key={detailIndex ?? active}
      >
        {detailIndex === null ? (
          activeContent
        ) : (
          <ProjectDetail
            index={detailIndex}
            onClose={closeProject}
            onChange={changeProject}
            reducedMotion={reducedMotion}
          />
        )}
      </div>

      <div
        className={`transition-curtain ${transitioning ? "is-active" : ""}`}
        aria-hidden="true"
      >
        {curtainColumns.map((column) => (
          <span key={column} style={{ "--i": column } as CSSProperties} />
        ))}
      </div>
    </main>
  );
}

"use client";
/* eslint-disable @next/next/no-img-element */

import {
  CSSProperties,
  MouseEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
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
  subtitle: string;
  description: string;
  stack: string;
  accent: string;
  surface: string;
  cover?: string;
  visuals: ProjectVisual[];
};

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
  { id: "home", label: "首页" },
  { id: "work", label: "作品" },
  { id: "about", label: "经历" },
  { id: "contact", label: "联系" },
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

function HomeShowreel({ content }: { content: HomeContent }) {
  const hasPersonalMedia = Boolean(content.video || content.photo);

  return (
    <div className="home-showreel" aria-label="项目影像视觉台">
      {content.video ? (
        <video
          className="home-primary-media"
          src={content.video}
          poster={content.poster}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
        />
      ) : content.photo ? (
        <div className="home-portrait-layout">
          <img src={content.photo} alt={`${content.name}个人照片`} />
          <div className="home-portrait-copy">
            <span>PROFILE / INTRO</span>
            <p>{content.intro}</p>
          </div>
        </div>
      ) : (
        <>
          <div className="showreel-shot shot-one">
            <span>01</span>
            <strong>VISUAL</strong>
            <i />
          </div>
          <div className="showreel-shot shot-two">
            <span>02</span>
            <strong>MOTION</strong>
            <i />
          </div>
          <div className="showreel-shot shot-three">
            <span>03</span>
            <strong>DIGITAL</strong>
            <i />
          </div>
        </>
      )}
      <div className="showreel-frame" aria-hidden="true" />
      <div className="showreel-caption">
        <span>{hasPersonalMedia ? "PERSONAL PROFILE" : "SELECTED WORK / 2020—2026"}</span>
        <b>{content.video ? "SHOWREEL / LOOP" : content.photo ? content.role : "无声循环 SHOWREEL 预留位"}</b>
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
}: {
  visual: Project["visuals"][number];
  project: Project;
  index: number;
}) {
  const sceneRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const style = {
    "--accent": project.accent,
    "--surface": project.surface,
  } as CSSProperties;

  useEffect(() => {
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
  }, []);

  return (
    <article
      ref={sceneRef}
      className={`visual-scene visual-${visual.kind} ${isVisible ? "is-visible" : ""}`}
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
            src={visual.src}
            alt={visual.label}
            loading={index < 2 ? "eager" : "lazy"}
          />
        )}

        {visual.kind === "video" && (
          <video
            className="project-asset"
            src={visual.src}
            poster={visual.poster}
            autoPlay
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
            <div className="console-options">
              <button type="button">叙事</button>
              <button type="button">动作</button>
              <button type="button">探索</button>
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
}: {
  active: SectionName;
  onNavigate: (section: SectionName) => void;
}) {
  const handleClick = (
    event: MouseEvent<HTMLAnchorElement>,
    section: SectionName,
  ) => {
    event.preventDefault();
    onNavigate(section);
  };

  return (
    <nav className="side-nav" aria-label="主要导航">
      {sections.map((section) => (
        <a
          key={section.id}
          href={`#${section.id}`}
          className={active === section.id ? "is-active" : ""}
          onClick={(event) => handleClick(event, section.id)}
        >
          {section.label}
        </a>
      ))}
    </nav>
  );
}

function HomeSection() {
  return (
    <section className="main-section home-section" aria-label="首页">
      <div className="home-visual">
        <HomeShowreel content={homeContent} />
        <p className="home-edition">{homeContent.edition}</p>
      </div>
      <div className="home-title">
        <p>{homeContent.role}</p>
        <h1>{homeContent.name}</h1>
      </div>
    </section>
  );
}

function ProjectPreview({ project, index }: { project: Project; index: number }) {
  const firstMedia = project.visuals.find(
    (visual) => visual.kind === "image" || visual.kind === "video",
  );

  if (project.cover) {
    return <img className="preview-media" src={project.cover} alt="" />;
  }

  if (firstMedia?.kind === "image") {
    return <img className="preview-media" src={firstMedia.src} alt="" />;
  }

  if (firstMedia?.kind === "video") {
    return (
      <video
        className="preview-media"
        src={firstMedia.src}
        poster={firstMedia.poster}
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
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

function WorkSection({
  onOpenProject,
}: {
  onOpenProject: (index: number) => void;
}) {
  const [hovered, setHovered] = useState(0);
  const hoveredProject = projects[hovered] || projects[0];

  return (
    <section className="main-section work-section" aria-label="作品">
      <div className="work-browser">
        <div className="work-list-head">
          <span>SELECTED WORK</span>
          <strong>{String(projects.length).padStart(2, "0")} PROJECTS</strong>
        </div>

        <div className="work-list">
          {projects.map((project, index) => (
            <button
              type="button"
              className={`work-title ${hovered === index ? "is-current" : ""}`}
              key={project.title}
              onMouseEnter={() => setHovered(index)}
              onFocus={() => setHovered(index)}
              onClick={() => onOpenProject(index)}
            >
              <i className="work-title-number">
                {String(index + 1).padStart(2, "0")}
              </i>
              <span className="work-title-copy">
                <strong>{project.title}</strong>
                <small>
                  {project.category} / {project.client}
                </small>
              </span>
              <b>VIEW</b>
            </button>
          ))}
        </div>
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
            <ProjectPreview project={hoveredProject} index={hovered} />
          </div>
        </div>
        <div className="work-preview-caption">
          <span>
            {hoveredProject.category} / {hoveredProject.year}
          </span>
          <strong>{hoveredProject.title}</strong>
        </div>
        <p>CLICK TITLE TO VIEW</p>
      </div>

      <div className="work-index">
        <span>滚动浏览</span>
        <i />
        <strong>{String(hovered + 1).padStart(2, "0")}</strong>
      </div>
    </section>
  );
}

function ExperienceMedia({ experience }: { experience: Experience }) {
  return (
    <div
      className={`experience-media experience-${experience.mediaKind}`}
      key={experience.date}
    >
      {experience.video ? (
        <video
          src={experience.video}
          poster={experience.poster}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
        />
      ) : experience.image ? (
        <img
          className="experience-primary-image"
          src={experience.image}
          alt={`${experience.date} ${experience.label}`}
        />
      ) : (
        <div className="experience-reel" aria-hidden="true">
          <div className="reel-shot reel-shot-one">
            <span>{experience.date.slice(0, 4)}</span>
            <strong>{experience.role}</strong>
          </div>
          <div className="reel-shot reel-shot-two">
            <span>SELECTED PROJECT</span>
            <i />
          </div>
          <div className="reel-shot reel-shot-three">
            <b>{experience.label}</b>
            <i />
          </div>
        </div>
      )}
      <div className="experience-media-caption">
        <span>PLAYING</span>
        <p>{experience.mediaLabel}</p>
        <b>16:9 / LOOP</b>
      </div>
      <div className="experience-scanline" aria-hidden="true" />
    </div>
  );
}

function AboutSection() {
  const [step, setStep] = useState(Math.max(0, aboutSteps.length - 1));
  const activeStep = aboutSteps[step];

  return (
    <section className="main-section about-section" aria-label="经历">
      <div className="about-collabs">
        <p>能力方向：</p>
        <span>AI视觉工作流 /</span>
        <span>3D与动态内容 /</span>
        <span>全球品牌传播 /</span>
        <span>创意技术</span>
      </div>

      <div className="about-center">
        <ExperienceMedia experience={activeStep} />
        <div
          className="about-copy"
          key={activeStep.title}
          aria-live="polite"
        >
          <div>
            <span>{activeStep.date} — {activeStep.label}</span>
            <h2>{activeStep.title}</h2>
          </div>
          <div className="experience-copy">
            <p>{activeStep.copy}</p>
            <span>{activeStep.company}</span>
            <b>{activeStep.role}</b>
          </div>
        </div>
      </div>

      <div className="about-timeline">
        <p>切换时间轴查看经历</p>
        <div
          className="timeline-rail"
          style={{ "--timeline-count": aboutSteps.length } as CSSProperties}
        >
          {aboutSteps.map((item, index) => (
            <button
              type="button"
              className={step === index ? "is-active" : ""}
              key={item.date}
              onMouseEnter={() => setStep(index)}
              onFocus={() => setStep(index)}
              onClick={() => setStep(index)}
            >
              <span>{item.label}</span>
              <b>{item.date}</b>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

function ContactSection() {
  const emailHref = contactContent.email
    ? `mailto:${contactContent.email}`
    : "#contact";

  return (
    <section className="main-section contact-section" aria-label="联系">
      <div className="contact-wrapper">
        <p className="contact-kicker">{contactContent.note}</p>
        <h2>
          <span>与我</span>
          <span>聊聊</span>
        </h2>
        <div className="contact-links">
          <a href={emailHref} aria-label="发送邮件">邮箱</a>
          <a
            href={contactContent.xiaohongshu || "#contact"}
            aria-label="小红书"
          >
            小红书
          </a>
          <a
            href={contactContent.linkedin || "#contact"}
            aria-label="领英"
          >
            领英
          </a>
        </div>
      </div>
      <p className="contact-note">
        {contactContent.email || "在网站内容/联系中填写真实联系方式"}
      </p>
    </section>
  );
}

function ProjectDetail({
  index,
  onClose,
  onChange,
}: {
  index: number;
  onClose: () => void;
  onChange: (direction: number) => void;
}) {
  const detailRef = useRef<HTMLElement>(null);
  const galleryRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLElement>(null);
  const targetScrollRef = useRef(0);
  const scrollFrameRef = useRef<number | null>(null);
  const project = projects[index];

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
      targetScrollRef.current = Math.min(
        max,
        Math.max(0, targetScrollRef.current + event.deltaY * 0.92),
      );

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
  }, [animateScroll, index]);

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
    >
      <nav className="project-nav" aria-label="项目导航">
        <div className="project-nav-controls">
          <button type="button" onClick={onClose}>关闭</button>
          <div className="project-nav-pager">
            <button type="button" onClick={() => onChange(-1)}>上一个</button>
            <button type="button" onClick={() => onChange(1)}>下一个</button>
          </div>
        </div>
      </nav>

      <div className="project-info">
        <header className="project-header">
          <div className="project-meta-line">
            <span>{project.year}</span>
            <i aria-hidden="true" />
            <p>{project.client}</p>
          </div>
          <h1>{project.title}</h1>
          <em>{project.subtitle}</em>
        </header>

        <div className="project-copy">
          <p>{project.description}</p>
          <p className="project-stack">
            <span>项目能力：</span>{project.stack}
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
            key={`${project.title}-${visual.kind}-${visualIndex}`}
          />
        ))}
        <button
          type="button"
          className="next-project-card"
          onClick={() => onChange(1)}
        >
          <span>下一个项目</span>
          <strong>{projects[(index + 1) % projects.length].title}</strong>
          <i>→</i>
        </button>
      </div>
    </section>
  );
}

export default function Home() {
  const [active, setActive] = useState<SectionName>("home");
  const [detailIndex, setDetailIndex] = useState<number | null>(null);
  const [transitioning, setTransitioning] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const timeoutsRef = useRef<number[]>([]);

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
    const timer = window.setTimeout(() => setLoaded(true), 850);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => () => clearTimers(), [clearTimers]);

  const transitionTo = useCallback(
    (action: () => void) => {
      if (transitioning) return;
      clearTimers();
      setTransitioning(true);
      timeoutsRef.current.push(
        window.setTimeout(action, 570),
        window.setTimeout(() => setTransitioning(false), 1140),
      );
    },
    [clearTimers, transitioning],
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
    transitionTo(() => {
      setDetailIndex(index);
      window.history.replaceState(null, "", `#project-${index + 1}`);
    });
  };

  const closeProject = () => {
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

  let activeContent = <HomeSection />;
  if (active === "work") {
    activeContent = <WorkSection onOpenProject={openProject} />;
  } else if (active === "about") {
    activeContent = <AboutSection />;
  } else if (active === "contact") {
    activeContent = <ContactSection />;
  }

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (detailIndex !== null) {
        if (event.key === "Escape") closeProject();
        if (event.key === "ArrowLeft") changeProject(-1);
        if (event.key === "ArrowRight") changeProject(1);
        return;
      }

      const current = sections.findIndex((section) => section.id === active);
      if (event.key === "ArrowDown" || event.key === "ArrowRight") {
        navigate(sections[(current + 1) % sections.length].id);
      }
      if (event.key === "ArrowUp" || event.key === "ArrowLeft") {
        navigate(
          sections[(current - 1 + sections.length) % sections.length].id,
        );
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  });

  return (
    <main className={`site-shell ${loaded ? "is-loaded" : ""}`}>
      <div className={`site-loader ${loaded ? "is-hidden" : ""}`}>
        <div>
          <i />
          <span>正在建立画面</span>
        </div>
        <b>PORTFOLIO / 2026</b>
      </div>

      {detailIndex === null && (
        <SideNav active={active} onNavigate={navigate} />
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

"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import {
  Center,
  ContactShadows,
  Environment,
  Loader,
  useGLTF,
} from "@react-three/drei";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  Suspense,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
} from "react";
import * as THREE from "three";

type ProgressRef = {
  current: number;
};

function smoothRange(value: number, start: number, end: number) {
  const normalized = THREE.MathUtils.clamp(
    (value - start) / (end - start),
    0,
    1,
  );
  return normalized * normalized * (3 - 2 * normalized);
}

function Character({
  scrollProgress,
}: {
  scrollProgress: ProgressRef;
}) {
  const group = useRef<THREE.Group>(null);
  const eyeParts = useRef<THREE.Object3D[]>([]);
  const { scene } = useGLTF("/models/character.glb");

  const model = useMemo(() => scene.clone(true), [scene]);

  useEffect(() => {
    const pupils: THREE.Object3D[] = [];

    model.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.castShadow = true;
        child.receiveShadow = true;

        if (Array.isArray(child.material)) {
          child.material.forEach((material) => {
            if ("envMapIntensity" in material) {
              material.envMapIntensity = 0.65;
            }
          });
        } else if (child.material && "envMapIntensity" in child.material) {
          child.material.envMapIntensity = 0.65;
        }
      }

      if (
        child.name.toLowerCase().includes("blackbody") ||
        child.name.toLowerCase().includes("pupil")
      ) {
        pupils.push(child);
      }
    });

    eyeParts.current = pupils;
  }, [model]);

  useFrame((state, delta) => {
    if (!group.current) return;

    const progress = scrollProgress.current;
    const isMobile = state.size.width < 760;
    const resumePhase = smoothRange(progress, 0.12, 0.42);
    const layoutPhase = smoothRange(progress, 0.43, 0.62);
    const worksPhase = smoothRange(progress, 0.68, 0.9);

    const desktopX =
      THREE.MathUtils.lerp(0, -0.18, resumePhase) -
      THREE.MathUtils.lerp(0, 0.77, layoutPhase) +
      THREE.MathUtils.lerp(0, 0.08, worksPhase);
    const targetX = isMobile ? -0.05 : desktopX;
    const targetY = isMobile
      ? 0.28 - layoutPhase * 0.15
      : -0.03 + layoutPhase * 0.03;
    const targetScale = isMobile
      ? THREE.MathUtils.lerp(1.62, 1.3, layoutPhase)
      : THREE.MathUtils.lerp(2.2, 1.72, layoutPhase);
    const targetRotationY =
      THREE.MathUtils.lerp(0, -0.42, resumePhase) +
      THREE.MathUtils.lerp(0, 0.29, layoutPhase) +
      state.pointer.x * 0.035;

    group.current.position.x = THREE.MathUtils.damp(
      group.current.position.x,
      targetX,
      4.2,
      delta,
    );
    group.current.position.y = THREE.MathUtils.damp(
      group.current.position.y,
      targetY,
      4.2,
      delta,
    );
    group.current.rotation.y = THREE.MathUtils.damp(
      group.current.rotation.y,
      targetRotationY,
      4.5,
      delta,
    );
    group.current.rotation.x = THREE.MathUtils.damp(
      group.current.rotation.x,
      -state.pointer.y * 0.018,
      4,
      delta,
    );

    const currentScale = group.current.scale.x;
    const nextScale = THREE.MathUtils.damp(
      currentScale,
      targetScale,
      4,
      delta,
    );
    group.current.scale.setScalar(nextScale);

    eyeParts.current.forEach((eye, index) => {
      const offset = index % 2 === 0 ? 0.008 : -0.008;
      eye.rotation.y = THREE.MathUtils.damp(
        eye.rotation.y,
        state.pointer.x * 0.36 + offset,
        6,
        delta,
      );
      eye.rotation.x = THREE.MathUtils.damp(
        eye.rotation.x,
        -state.pointer.y * 0.24,
        6,
        delta,
      );
    });

    const closeUp = smoothRange(progress, 0.08, 0.32);
    const pullBack = smoothRange(progress, 0.39, 0.61);
    const targetCameraX = isMobile
      ? 0
      : THREE.MathUtils.lerp(0, 0.42, closeUp) -
        THREE.MathUtils.lerp(0, 0.42, pullBack);
    const targetCameraY = THREE.MathUtils.lerp(0.02, 0.1, closeUp);
    const targetCameraZ = isMobile
      ? 3.15
      : THREE.MathUtils.lerp(
          THREE.MathUtils.lerp(2.7, 1.78, closeUp),
          2.9,
          pullBack,
        );

    state.camera.position.x = THREE.MathUtils.damp(
      state.camera.position.x,
      targetCameraX,
      4,
      delta,
    );
    state.camera.position.y = THREE.MathUtils.damp(
      state.camera.position.y,
      targetCameraY,
      4,
      delta,
    );
    state.camera.position.z = THREE.MathUtils.damp(
      state.camera.position.z,
      targetCameraZ,
      4,
      delta,
    );
    state.camera.lookAt(0, 0.04, 0);
  });

  return (
    <group ref={group} scale={2.2}>
      <Center>
        <primitive object={model} />
      </Center>
    </group>
  );
}

function CharacterCanvas({
  scrollProgress,
}: {
  scrollProgress: ProgressRef;
}) {
  return (
    <Canvas
      camera={{ position: [0, 0.02, 2.7], fov: 35, near: 0.01, far: 100 }}
      dpr={[1, 1.5]}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      shadows
    >
      <color attach="background" args={["#d8dfdc"]} />
      <fog attach="fog" args={["#d8dfdc", 4, 9]} />
      <ambientLight intensity={1.35} />
      <directionalLight
        castShadow
        intensity={3.2}
        position={[3.5, 5, 4]}
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />
      <directionalLight intensity={1.8} position={[-3, 1.5, 2]} color="#8bc8ff" />
      <pointLight intensity={1.2} position={[0, -1, 2]} color="#ff8b6b" />
      <Suspense fallback={null}>
        <Character scrollProgress={scrollProgress} />
        <Environment preset="studio" environmentIntensity={0.42} />
      </Suspense>
      <ContactShadows
        position={[0, -0.76, 0]}
        opacity={0.3}
        scale={4}
        blur={2.6}
        far={3}
      />
    </Canvas>
  );
}

const resumeItems = [
  {
    date: "2024 — NOW",
    role: "3D ARTIST / CREATIVE TECHNOLOGIST",
    detail: "将你的当前职位、方向与擅长领域放在这里。",
  },
  {
    date: "2021 — 2024",
    role: "VISUAL DESIGN & MOTION",
    detail: "用一小段话讲清楚你在上一阶段做了什么。",
  },
  {
    date: "EDUCATION",
    role: "YOUR UNIVERSITY / MAJOR",
    detail: "学校、专业、奖项，保持简短但具体。",
  },
];

const works = [
  { index: "01", title: "角色与世界观", color: "coral" },
  { index: "02", title: "品牌视觉系统", color: "blue" },
  { index: "03", title: "互动网页实验", color: "lime" },
];

export default function Home() {
  const rootRef = useRef<HTMLElement>(null);
  const progressLineRef = useRef<HTMLSpanElement>(null);
  const scrollProgress = useRef(0);

  useLayoutEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const context = gsap.context(() => {
      ScrollTrigger.create({
        trigger: rootRef.current,
        start: "top top",
        end: "bottom bottom",
        onUpdate: (self) => {
          scrollProgress.current = self.progress;
          if (progressLineRef.current) {
            progressLineRef.current.style.transform = `scaleX(${self.progress})`;
          }
        },
      });

      gsap.utils.toArray<HTMLElement>(".story-card").forEach((card) => {
        gsap.fromTo(
          card,
          { autoAlpha: 0, y: 70 },
          {
            autoAlpha: 1,
            y: 0,
            ease: "none",
            scrollTrigger: {
              trigger: card,
              start: "top 82%",
              end: "top 52%",
              scrub: 0.6,
            },
          },
        );
      });

      gsap.utils.toArray<HTMLElement>(".timeline-item").forEach((item) => {
        gsap.fromTo(
          item,
          { autoAlpha: 0, x: 38 },
          {
            autoAlpha: 1,
            x: 0,
            ease: "none",
            scrollTrigger: {
              trigger: item,
              start: "top 83%",
              end: "top 62%",
              scrub: 0.45,
            },
          },
        );
      });
    }, rootRef);

    return () => context.revert();
  }, []);

  return (
    <main ref={rootRef} className="portfolio-root">
      <div className="webgl-stage" aria-hidden="true">
        <CharacterCanvas scrollProgress={scrollProgress} />
      </div>

      <div className="grain" aria-hidden="true" />

      <header className="topbar">
        <a className="brand" href="#top" aria-label="返回首页">
          <span className="brand-mark">Z</span>
          <span>INTERACTIVE CV</span>
        </a>
        <nav aria-label="页面章节">
          <a href="#about">简介</a>
          <a href="#resume">经历</a>
          <a href="#works">作品</a>
          <a href="#contact">联系</a>
        </nav>
        <span className="prototype-tag">PROTOTYPE 01</span>
        <span className="scroll-progress" aria-hidden="true">
          <span ref={progressLineRef} />
        </span>
      </header>

      <section id="top" className="story-section hero-section">
        <div className="hero-copy story-card">
          <p className="eyebrow">3D ARTIST · CREATIVE DEVELOPER</p>
          <h1>
            让角色
            <br />
            替你介绍自己
          </h1>
          <div className="hero-meta">
            <span>SCROLL TO EXPLORE</span>
            <span className="mouse-note">
              <i />
              眼睛正在看着你
            </span>
          </div>
        </div>
        <p className="vertical-caption">BLENDER → GLB → WEBGL</p>
      </section>

      <section id="about" className="story-section about-section">
        <article className="story-card glass-note">
          <span className="section-number">01 / ABOUT</span>
          <p className="micro-label">A LIVING PORTRAIT</p>
          <h2>一张会动的简历</h2>
          <p>
            角色不只是装饰。镜头靠近、眼睛注视、内容出现，
            每一次滚动都在替你推进自我介绍。
          </p>
          <div className="capability-row">
            <span>3D MODEL</span>
            <span>POINTER GAZE</span>
            <span>SCROLL CAMERA</span>
          </div>
        </article>
      </section>

      <section id="resume" className="story-section resume-section">
        <div className="resume-column">
          <div className="section-heading story-card">
            <span className="section-number">02 / RÉSUMÉ</span>
            <h2>沿着人物轮廓，读完你的经历。</h2>
          </div>

          <div className="timeline">
            {resumeItems.map((item) => (
              <article className="timeline-item" key={item.date}>
                <span className="timeline-dot" />
                <p>{item.date}</p>
                <h3>{item.role}</h3>
                <span>{item.detail}</span>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="story-section browser-section">
        <article className="browser-window story-card">
          <div className="browser-bar">
            <span className="window-dots">
              <i />
              <i />
              <i />
            </span>
            <span className="browser-address">about-you.world</span>
            <span className="browser-menu">•••</span>
          </div>
          <div className="browser-content">
            <span className="section-number">03 / PROFILE</span>
            <h2>把专业能力变成一个可探索的空间。</h2>
            <p>
              右侧窗口承载真实内容，左侧角色负责情绪和节奏。文字仍然是
              HTML，方便阅读、搜索和后续维护。
            </p>
            <div className="skill-grid">
              <span>
                <b>01</b> MODEL
              </span>
              <span>
                <b>02</b> MOTION
              </span>
              <span>
                <b>03</b> INTERACTION
              </span>
            </div>
          </div>
        </article>
      </section>

      <section id="works" className="story-section works-section">
        <article className="works-window story-card">
          <div className="works-header">
            <div>
              <span className="section-number">04 / SELECTED WORKS</span>
              <h2>作品不必排成普通卡片。</h2>
            </div>
            <p>滚动、悬停或点击，都可以触发角色与镜头的反馈。</p>
          </div>

          <div className="work-list">
            {works.map((work) => (
              <button className="work-row" type="button" key={work.index}>
                <span className={`work-thumb ${work.color}`}>
                  <i />
                </span>
                <span className="work-index">{work.index}</span>
                <strong>{work.title}</strong>
                <span className="work-arrow">↗</span>
              </button>
            ))}
          </div>
        </article>
      </section>

      <section id="contact" className="story-section contact-section">
        <div className="contact-card story-card">
          <span className="section-number">05 / NEXT STEP</span>
          <h2>下一步，把占位内容换成你的故事。</h2>
          <p>
            这版已经使用你的 GLB 模型。后续可以继续加入正式简历、作品、
            表情 Shape Keys、头发细节和手机端轻量模型。
          </p>
          <div className="contact-actions">
            <a className="primary-button" href="#top">
              再看一遍
            </a>
            <span>MODEL LOADED · WEBGL READY</span>
          </div>
        </div>
        <footer>
          <span>INTERACTIVE PORTFOLIO DEMO</span>
          <span>DESIGNED FOR YOUR CHARACTER</span>
        </footer>
      </section>

      <Loader
        dataInterpolation={(progress) => `正在载入角色 ${progress.toFixed(0)}%`}
        containerStyles={{ background: "#111820" }}
        innerStyles={{ width: "220px", background: "rgba(255,255,255,.12)" }}
        barStyles={{ background: "#ff725e", height: "3px" }}
        dataStyles={{
          color: "#f5f1e8",
          fontFamily: "ui-monospace, monospace",
          fontSize: "12px",
          letterSpacing: "0.08em",
        }}
      />
    </main>
  );
}

useGLTF.preload("/models/character.glb");

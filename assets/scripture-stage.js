import * as THREE from "./three.module.min.js";

const ACTS = [
  {
    title: "第一幕 · 创造",
    subtitle: "宇宙、地球与承载上帝形象的人",
    events: [
      ["宇宙被造", "cosmos"],
      ["地球成形", "earth"],
      ["人类受托", "human"],
    ],
  },
  {
    title: "第二幕 · 堕落",
    subtitle: "关系破裂，暴力与洪水进入世界",
    events: [
      ["人类堕落", "fall"],
      ["挪亚方舟", "ark"],
    ],
  },
  {
    title: "第三幕 · 以色列",
    subtitle: "应许进入历史，先知守望上帝的约",
    events: [
      ["亚伯拉罕往迦南", "tent"],
      ["摩西开红海", "sea"],
      ["大卫战胜歌利亚", "david"],
      ["但以理 · 以利亚 · 耶利米", "prophets"],
    ],
  },
  {
    title: "第四幕 · 基督",
    subtitle: "君王亲自来到，经过十字架进入复活",
    events: [
      ["耶稣降生", "birth"],
      ["宣讲天国 · 医治神迹", "miracle"],
      ["被钉十字架", "cross"],
      ["复活升天", "ascend"],
    ],
  },
  {
    title: "第五幕 · 教会",
    subtitle: "圣灵差遣门徒，福音越过疆界",
    events: [
      ["门徒走向万国", "gospel"],
      ["建立教会", "church"],
    ],
  },
  {
    title: "第六幕 · 新创造",
    subtitle: "黑暗终结，得胜的君王使万物更新",
    events: [
      ["末后的争战", "battle"],
      ["基督与祂的子民得胜", "victory"],
      ["新天新地", "newworld"],
    ],
  },
];

const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
const isCompact = matchMedia("(max-width: 760px)").matches;

function waitForHero() {
  const hero = document.querySelector(".hero");
  if (hero) {
    mount(hero);
    return;
  }
  const observer = new MutationObserver(() => {
    const found = document.querySelector(".hero");
    if (found) {
      observer.disconnect();
      mount(found);
    }
  });
  observer.observe(document.body, { childList: true, subtree: true });
}

function mount(hero) {
  if (hero.querySelector(".scripture-stage")) return;
  hero.classList.add("has-scripture-stage");

  const stage = document.createElement("section");
  stage.className = "scripture-stage";
  stage.setAttribute("aria-label", "互动圣经叙事动画");
  stage.innerHTML = `
    <canvas class="scripture-canvas" aria-hidden="true"></canvas>
    <div class="scripture-aura" aria-hidden="true"></div>
    <div class="scripture-copy" aria-live="polite">
      <span class="scripture-kicker">TOUCH THE STORY</span>
      <strong>轻触这本圣经</strong>
      <p>让整本圣经的故事从书页中展开</p>
    </div>
    <button class="scripture-trigger" type="button" aria-label="打开圣经并播放六幕叙事动画">
      <span>打开圣经</span><i aria-hidden="true">↗</i>
    </button>
    <div class="scripture-timeline" aria-hidden="true">
      ${ACTS.map((act, index) => `<i data-act="${index}"><b>${index + 1}</b><span>${act.title.split(" · ")[1]}</span></i>`).join("")}
    </div>
    <button class="scripture-replay" type="button">重新观看</button>
    <p class="scripture-hint">移动指针唤醒书页 · 点击打开</p>
  `;
  hero.append(stage);

  const canvas = stage.querySelector(".scripture-canvas");
  const trigger = stage.querySelector(".scripture-trigger");
  const replay = stage.querySelector(".scripture-replay");
  const copy = stage.querySelector(".scripture-copy");
  const copyTitle = copy.querySelector("strong");
  const copyText = copy.querySelector("p");
  const markers = [...stage.querySelectorAll(".scripture-timeline i")];

  const renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true,
    antialias: !isCompact,
    powerPreference: "high-performance",
  });
  renderer.setPixelRatio(Math.min(devicePixelRatio, isCompact ? 1.2 : 1.55));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.06;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
  camera.position.set(0, 0.35, 8.3);

  scene.add(new THREE.HemisphereLight(0xdbe8df, 0x07100d, 2.2));
  const warmLight = new THREE.PointLight(0xffb26f, 22, 12, 1.6);
  warmLight.position.set(0, 1.2, 3.2);
  scene.add(warmLight);
  const rimLight = new THREE.PointLight(0xe65a3c, 15, 10, 2);
  rimLight.position.set(-3, 0.3, 2);
  scene.add(rimLight);

  const world = new THREE.Group();
  world.position.set(0, -0.55, 0);
  scene.add(world);

  const leather = new THREE.MeshStandardMaterial({
    color: 0x32150f,
    roughness: 0.76,
    metalness: 0.08,
  });
  const leatherEdge = new THREE.MeshStandardMaterial({
    color: 0x6d2d1e,
    roughness: 0.58,
    metalness: 0.1,
  });
  const gold = new THREE.MeshStandardMaterial({
    color: 0xc58c45,
    roughness: 0.26,
    metalness: 0.76,
    emissive: 0x2b1204,
    emissiveIntensity: 0.34,
  });
  const paper = new THREE.MeshStandardMaterial({
    color: 0xe3d3ad,
    roughness: 0.86,
    metalness: 0,
    side: THREE.DoubleSide,
  });

  const closedBook = new THREE.Group();
  const block = new THREE.Mesh(new THREE.BoxGeometry(3.35, 2.28, 0.48, 1, 1, 4), paper);
  block.position.z = -0.02;
  closedBook.add(block);
  const back = new THREE.Mesh(new THREE.BoxGeometry(3.58, 2.48, 0.14), leatherEdge);
  back.position.z = -0.34;
  closedBook.add(back);

  const coverPivot = new THREE.Group();
  coverPivot.position.set(-1.79, 0, 0.32);
  const cover = new THREE.Mesh(new THREE.BoxGeometry(3.58, 2.48, 0.16), leather);
  cover.position.x = 1.79;
  coverPivot.add(cover);
  const border = new THREE.Mesh(new THREE.BoxGeometry(3.22, 2.1, 0.025), gold);
  border.position.set(1.79, 0, 0.1);
  border.scale.set(1, 1, 0.12);
  coverPivot.add(border);
  const inset = new THREE.Mesh(new THREE.BoxGeometry(3.02, 1.9, 0.035), leather);
  inset.position.set(1.79, 0, 0.113);
  coverPivot.add(inset);
  const crossV = new THREE.Mesh(new THREE.BoxGeometry(0.12, 1.14, 0.055), gold);
  crossV.position.set(1.79, 0.08, 0.15);
  const crossH = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.12, 0.055), gold);
  crossH.position.set(1.79, 0.25, 0.15);
  coverPivot.add(crossV, crossH);
  closedBook.add(coverPivot);

  const pageLines = new THREE.Group();
  for (let i = 0; i < 12; i += 1) {
    const line = new THREE.Mesh(new THREE.BoxGeometry(3.25, 0.008, 0.008), gold);
    line.material = gold.clone();
    line.material.opacity = 0.2 + (i % 3) * 0.08;
    line.material.transparent = true;
    line.position.set(0, -1.08 + i * 0.008, 0.02 + i * 0.025);
    pageLines.add(line);
  }
  closedBook.add(pageLines);
  closedBook.rotation.set(-0.08, -0.28, -0.03);
  world.add(closedBook);

  const openedBook = new THREE.Group();
  openedBook.visible = false;
  openedBook.position.y = -0.22;
  openedBook.rotation.x = -0.78;
  world.add(openedBook);

  const makeHalf = (side) => {
    const half = new THREE.Group();
    const coverMesh = new THREE.Mesh(new THREE.BoxGeometry(2.04, 2.36, 0.11), leatherEdge);
    coverMesh.position.z = -0.12;
    half.add(coverMesh);
    for (let i = 0; i < 10; i += 1) {
      const sheet = new THREE.Mesh(new THREE.PlaneGeometry(1.92, 2.2, 8, 5), paper.clone());
      sheet.material.color.offsetHSL(0, 0, (i % 3) * 0.012);
      sheet.position.z = i * 0.012;
      sheet.rotation.y = side * (0.08 + i * 0.004);
      half.add(sheet);
    }
    half.position.x = side * 1.02;
    half.rotation.y = side * -0.06;
    return half;
  };
  const leftPages = makeHalf(-1);
  const rightPages = makeHalf(1);
  openedBook.add(leftPages, rightPages);

  const glowMaterial = new THREE.MeshBasicMaterial({
    color: 0xffdca0,
    transparent: true,
    opacity: 0,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    side: THREE.DoubleSide,
  });
  const pageGlow = new THREE.Mesh(new THREE.CircleGeometry(2.35, 72), glowMaterial);
  pageGlow.position.set(0, 0.05, 0.18);
  pageGlow.scale.y = 0.55;
  openedBook.add(pageGlow);

  const beamMaterial = new THREE.MeshBasicMaterial({
    color: 0xffdba0,
    transparent: true,
    opacity: 0,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    side: THREE.DoubleSide,
  });
  const beam = new THREE.Mesh(new THREE.ConeGeometry(1.25, 4.7, 40, 1, true), beamMaterial);
  beam.position.set(0, 2.0, 0.32);
  beam.rotation.x = Math.PI;
  openedBook.add(beam);

  const particleCount = isCompact ? 180 : 420;
  const particlePositions = new Float32Array(particleCount * 3);
  const particleSpeeds = new Float32Array(particleCount);
  for (let i = 0; i < particleCount; i += 1) {
    const angle = Math.random() * Math.PI * 2;
    const radius = 0.1 + Math.random() * 2.4;
    particlePositions[i * 3] = Math.cos(angle) * radius;
    particlePositions[i * 3 + 1] = Math.random() * 5 - 0.15;
    particlePositions[i * 3 + 2] = Math.sin(angle) * radius * 0.45 + 0.25;
    particleSpeeds[i] = 0.002 + Math.random() * 0.009;
  }
  const particleGeometry = new THREE.BufferGeometry();
  particleGeometry.setAttribute("position", new THREE.BufferAttribute(particlePositions, 3));
  const particles = new THREE.Points(
    particleGeometry,
    new THREE.PointsMaterial({
      color: 0xffd69a,
      size: isCompact ? 0.028 : 0.035,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    }),
  );
  openedBook.add(particles);

  const iconGroup = new THREE.Group();
  iconGroup.position.set(0, 1.25, 0.72);
  openedBook.add(iconGroup);
  const iconSprites = [];

  function drawIcon(ctx, type) {
    ctx.strokeStyle = "#ffe1a8";
    ctx.fillStyle = "#ffe1a8";
    ctx.lineWidth = 8;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    const circle = (x, y, r) => { ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.stroke(); };
    const line = (...p) => { ctx.beginPath(); ctx.moveTo(p[0], p[1]); for (let i = 2; i < p.length; i += 2) ctx.lineTo(p[i], p[i + 1]); ctx.stroke(); };
    if (type === "cosmos") { circle(128, 128, 62); circle(128, 128, 18); line(32, 128, 224, 128); line(128, 32, 128, 224); }
    if (type === "earth") { circle(128, 128, 72); line(67, 105, 98, 82, 123, 91, 142, 76, 181, 96); line(72, 155, 112, 139, 137, 162, 180, 145); }
    if (type === "human") { circle(104, 82, 20); circle(157, 85, 18); line(104, 104, 100, 176, 68, 215); line(100, 139, 60, 142); line(157, 105, 164, 180, 190, 216); line(162, 140, 202, 128); }
    if (type === "fall") { circle(128, 128, 72); line(91, 66, 117, 112, 98, 143, 132, 188, 153, 150, 140, 116, 170, 72); }
    if (type === "ark") { line(48, 150, 208, 150, 181, 190, 80, 190, 48, 150); line(86, 148, 91, 102, 165, 102, 180, 148); ctx.beginPath(); ctx.arc(128, 112, 94, Math.PI, 0); ctx.stroke(); }
    if (type === "tent") { line(49, 188, 128, 72, 207, 188); line(128, 72, 128, 188); line(69, 188, 187, 188); circle(193, 55, 7); }
    if (type === "sea") { line(40, 74, 70, 112, 42, 154, 72, 194); line(216, 74, 186, 112, 214, 154, 184, 194); line(105, 198, 151, 198); }
    if (type === "david") { circle(82, 102, 15); line(82, 118, 80, 183); circle(177, 82, 25); line(177, 107, 178, 200); ctx.beginPath(); ctx.arc(96, 100, 56, -2.3, 0.3); ctx.stroke(); }
    if (type === "prophets") { line(84, 205, 84, 108, 58, 74, 93, 42, 119, 87, 84, 108); line(145, 58, 202, 58, 202, 198, 145, 198, 145, 58); line(158, 87, 188, 87); line(158, 116, 188, 116); }
    if (type === "birth") { line(128, 40, 137, 70, 169, 70, 143, 89, 152, 120, 128, 101, 104, 120, 113, 89, 87, 70, 119, 70, 128, 40); line(70, 205, 128, 151, 186, 205); }
    if (type === "miracle") { circle(128, 128, 25); circle(128, 128, 58); circle(128, 128, 88); }
    if (type === "cross") { line(128, 38, 128, 218); line(70, 96, 186, 96); }
    if (type === "ascend") { line(128, 212, 128, 58); line(86, 99, 128, 57, 170, 99); ctx.beginPath(); ctx.arc(128, 150, 72, 0.2, 2.95); ctx.stroke(); }
    if (type === "gospel") { circle(128, 128, 45); line(37, 128, 72, 128); line(184, 128, 219, 128); line(128, 37, 128, 72); line(128, 184, 128, 219); }
    if (type === "church") { line(48, 208, 48, 112, 128, 58, 208, 112, 208, 208, 48, 208); line(128, 58, 128, 31); line(111, 44, 145, 44); line(105, 208, 105, 149, 151, 149, 151, 208); }
    if (type === "battle") { line(62, 49, 194, 207); line(194, 49, 62, 207); line(51, 50, 82, 59); line(205, 50, 174, 59); }
    if (type === "victory") { line(47, 88, 88, 121, 128, 58, 169, 121, 209, 88, 194, 190, 62, 190, 47, 88); line(78, 154, 178, 154); }
    if (type === "newworld") { circle(128, 128, 81); line(128, 199, 128, 97); line(128, 112, 87, 75); line(128, 137, 174, 91); ctx.beginPath(); ctx.arc(98, 83, 39, 0.3, 2.8); ctx.stroke(); ctx.beginPath(); ctx.arc(159, 95, 44, 0.2, 2.9); ctx.stroke(); }
  }

  function iconTexture(label, type) {
    const c = document.createElement("canvas");
    c.width = 512;
    c.height = 512;
    const ctx = c.getContext("2d");
    const gradient = ctx.createRadialGradient(256, 210, 10, 256, 256, 250);
    gradient.addColorStop(0, "rgba(91,45,28,.96)");
    gradient.addColorStop(0.56, "rgba(19,35,29,.94)");
    gradient.addColorStop(1, "rgba(7,15,13,0)");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 512, 512);
    ctx.save();
    ctx.translate(128, 78);
    drawIcon(ctx, type);
    ctx.restore();
    ctx.fillStyle = "#f3e8cf";
    ctx.textAlign = "center";
    ctx.font = `700 ${label.length > 8 ? 28 : 34}px "Microsoft YaHei", sans-serif`;
    const words = label.split(" · ");
    words.forEach((word, index) => ctx.fillText(word, 256, 392 + index * 42));
    const texture = new THREE.CanvasTexture(c);
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
  }

  ACTS.forEach((act, actIndex) => {
    act.events.forEach(([label, type], eventIndex) => {
      const material = new THREE.SpriteMaterial({
        map: iconTexture(label, type),
        transparent: true,
        opacity: 0,
        depthWrite: false,
      });
      const sprite = new THREE.Sprite(material);
      sprite.scale.set(1.26, 1.26, 1);
      sprite.userData = { actIndex, eventIndex, progress: 0 };
      sprite.visible = false;
      iconGroup.add(sprite);
      iconSprites.push(sprite);
    });
  });

  let phase = "idle";
  let sequenceStart = 0;
  let activeAct = -1;
  let pointerX = 0;
  let pointerY = 0;
  let hover = false;
  let raf = 0;
  let last = performance.now();

  function resize() {
    const rect = stage.getBoundingClientRect();
    renderer.setSize(rect.width, rect.height, false);
    camera.aspect = rect.width / Math.max(rect.height, 1);
    camera.updateProjectionMatrix();
  }
  resize();
  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(stage);

  function setAct(index) {
    if (index === activeAct) return;
    activeAct = index;
    markers.forEach((marker, i) => marker.classList.toggle("is-active", i === index));
    if (index >= 0 && index < ACTS.length) {
      copyTitle.textContent = ACTS[index].title;
      copyText.textContent = ACTS[index].subtitle;
      stage.classList.add("is-narrating");
    }
  }

  function openBook(now) {
    if (phase !== "idle" && phase !== "complete") return;
    if (phase === "complete") reset();
    phase = reduceMotion ? "complete" : "opening";
    sequenceStart = now || performance.now();
    trigger.disabled = true;
    stage.classList.add("is-opening");
    copyTitle.textContent = reduceMotion ? "新天新地 · 万物更新" : "故事正在展开";
    copyText.textContent = reduceMotion ? "从创造到新创造，这是上帝救赎世界的一个故事。" : "请看六幕故事如何彼此承接";
    if (reduceMotion) {
      closedBook.visible = false;
      openedBook.visible = true;
      glowMaterial.opacity = 0.48;
      beamMaterial.opacity = 0.17;
      particles.material.opacity = 0.68;
      finish();
    }
  }

  function reset() {
    phase = "idle";
    activeAct = -1;
    closedBook.visible = true;
    openedBook.visible = false;
    coverPivot.rotation.y = 0;
    stage.classList.remove("is-opening", "is-narrating", "is-complete");
    trigger.disabled = false;
    copyTitle.textContent = "轻触这本圣经";
    copyText.textContent = "让整本圣经的故事从书页中展开";
    markers.forEach(marker => marker.classList.remove("is-active", "is-passed"));
    iconSprites.forEach(sprite => {
      sprite.visible = false;
      sprite.material.opacity = 0;
    });
  }

  function finish() {
    phase = "complete";
    stage.classList.remove("is-opening", "is-narrating");
    stage.classList.add("is-complete");
    copyTitle.textContent = "新天新地 · 万物更新";
    copyText.textContent = "打开的书仍在发光，因为第五幕仍邀请我们忠实参与";
    markers.forEach(marker => marker.classList.add("is-passed"));
  }

  function updateSequence(now) {
    const elapsed = (now - sequenceStart) / 1000;
    if (phase === "opening") {
      const p = Math.min(elapsed / 1.7, 1);
      const eased = 1 - Math.pow(1 - p, 4);
      coverPivot.rotation.y = -Math.PI * 0.92 * eased;
      closedBook.rotation.x = -0.08 - eased * 0.46;
      closedBook.rotation.y = -0.28 + eased * 0.28;
      closedBook.position.y = eased * -0.2;
      if (p >= 1) {
        closedBook.visible = false;
        openedBook.visible = true;
        phase = "sequence";
        sequenceStart = now;
      }
      return;
    }

    if (phase !== "sequence") return;
    const actDuration = isCompact ? 2.25 : 2.8;
    const total = actDuration * ACTS.length;
    const actIndex = Math.min(Math.floor(elapsed / actDuration), ACTS.length - 1);
    const local = elapsed - actIndex * actDuration;
    setAct(actIndex);
    markers.forEach((marker, index) => marker.classList.toggle("is-passed", index < actIndex));

    glowMaterial.opacity = Math.min(0.34, 0.06 + elapsed * 0.06);
    beamMaterial.opacity = Math.min(0.14, elapsed * 0.035);
    particles.material.opacity = Math.min(0.72, elapsed * 0.18);

    const actSprites = iconSprites.filter(sprite => sprite.userData.actIndex === actIndex);
    iconSprites.forEach(sprite => {
      const same = sprite.userData.actIndex === actIndex;
      if (!same && sprite.visible) {
        sprite.material.opacity *= 0.88;
        if (sprite.material.opacity < 0.02) sprite.visible = false;
      }
    });
    actSprites.forEach((sprite, eventIndex) => {
      const start = eventIndex * (actDuration * 0.55 / Math.max(actSprites.length, 1));
      const p = Math.max(0, Math.min((local - start) / 0.72, 1));
      const eased = 1 - Math.pow(1 - p, 3);
      const spread = actSprites.length === 1 ? 0 : eventIndex / (actSprites.length - 1) - 0.5;
      sprite.visible = p > 0;
      sprite.material.opacity = Math.min(1, p * 1.35) * Math.min(1, (actDuration - local) * 1.7);
      sprite.position.set(spread * 3.15, -0.72 + eased * 2.45 + Math.sin(now * 0.0018 + eventIndex) * 0.06, eventIndex * 0.02);
      sprite.scale.setScalar(0.35 + eased * 0.92);
    });

    if (elapsed >= total) {
      iconSprites.forEach(sprite => { sprite.visible = false; });
      glowMaterial.opacity = 0.52;
      beamMaterial.opacity = 0.19;
      particles.material.opacity = 0.86;
      finish();
    }
  }

  function animate(now) {
    const dt = Math.min((now - last) / 16.67, 2);
    last = now;
    const t = now * 0.001;
    if (phase === "idle") {
      world.position.y = -0.55 + Math.sin(t * 1.05) * 0.12;
      world.rotation.y += ((hover ? pointerX * 0.14 : -0.02) - world.rotation.y) * 0.05;
      world.rotation.x += ((hover ? -pointerY * 0.08 : 0) - world.rotation.x) * 0.05;
      warmLight.intensity += ((hover ? 34 : 22) - warmLight.intensity) * 0.06;
    } else {
      world.position.y += (-0.55 - world.position.y) * 0.05;
      world.rotation.x *= 0.94;
      world.rotation.y *= 0.94;
    }

    if (openedBook.visible) {
      openedBook.rotation.z = Math.sin(t * 0.7) * 0.012;
      pageGlow.rotation.z += 0.0025 * dt;
      beam.rotation.y += 0.002 * dt;
      const positions = particles.geometry.attributes.position.array;
      for (let i = 0; i < particleCount; i += 1) {
        positions[i * 3 + 1] += particleSpeeds[i] * dt;
        if (positions[i * 3 + 1] > 5) positions[i * 3 + 1] = -0.1;
      }
      particles.geometry.attributes.position.needsUpdate = true;
      particles.rotation.y = Math.sin(t * 0.22) * 0.18;
      if (phase === "complete") {
        glowMaterial.opacity = 0.46 + Math.sin(t * 1.8) * 0.07;
        warmLight.intensity = 38 + Math.sin(t * 1.4) * 4;
      }
    }

    updateSequence(now);
    renderer.render(scene, camera);
    raf = requestAnimationFrame(animate);
  }

  stage.addEventListener("pointermove", event => {
    const rect = stage.getBoundingClientRect();
    pointerX = (event.clientX - rect.left) / rect.width * 2 - 1;
    pointerY = (event.clientY - rect.top) / rect.height * 2 - 1;
  });
  stage.addEventListener("pointerenter", () => { hover = true; stage.classList.add("is-hovered"); });
  stage.addEventListener("pointerleave", () => { hover = false; stage.classList.remove("is-hovered"); });
  trigger.addEventListener("click", () => openBook(performance.now()));
  replay.addEventListener("click", () => {
    reset();
    requestAnimationFrame(time => openBook(time));
  });
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) cancelAnimationFrame(raf);
    else {
      last = performance.now();
      raf = requestAnimationFrame(animate);
    }
  });
  raf = requestAnimationFrame(animate);
}

waitForHero();

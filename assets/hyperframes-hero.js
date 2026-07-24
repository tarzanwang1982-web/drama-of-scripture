const ACTS = [
  { number: "01", name: "创造", english: "CREATION", time: 4, image: "images/act-1-creation.webp" },
  { number: "02", name: "堕落", english: "FALL", time: 8.5, image: "images/act-2-fall.webp" },
  { number: "03", name: "以色列", english: "ISRAEL", time: 13.5, image: "images/act-3-israel.webp" },
  { number: "04", name: "基督", english: "CHRIST", time: 20, image: "images/act-4-christ.webp" },
  { number: "05", name: "教会", english: "CHURCH", time: 26, image: "images/act-5-church.webp" },
  { number: "06", name: "新创造", english: "NEW CREATION", time: 31, image: "images/act-6-new-creation.webp" },
];

const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;

function formatTime(seconds) {
  const safe = Math.max(0, Number(seconds) || 0);
  return `00:${Math.floor(safe).toString().padStart(2, "0")}`;
}

function waitForHero() {
  const hero = document.querySelector(".hero");
  if (hero) return mount(hero);
  const observer = new MutationObserver(() => {
    const found = document.querySelector(".hero");
    if (!found) return;
    observer.disconnect();
    mount(found);
  });
  observer.observe(document.body, { childList: true, subtree: true });
}

function waitForChapterTabs() {
  const mountIfReady = () => {
    const tablist = document.querySelector(".act-tabs");
    if (!tablist || tablist.parentElement?.querySelector(".chapter-image-gallery")) return false;
    mountChapterGallery(tablist);
    return true;
  };

  if (mountIfReady()) return;
  const observer = new MutationObserver(() => {
    if (!mountIfReady()) return;
    observer.disconnect();
  });
  observer.observe(document.body, { childList: true, subtree: true });
}

function mountChapterGallery(tablist) {
  const tabs = [...tablist.querySelectorAll('[role="tab"]')];
  if (tabs.length !== ACTS.length) return;

  const gallery = document.createElement("div");
  gallery.className = "chapter-image-gallery";
  gallery.setAttribute("aria-label", "六幕章节配图");
  gallery.innerHTML = ACTS.map((act, index) => `
    <button type="button" class="chapter-image-card" data-index="${index}" aria-label="打开第${index + 1}幕：${act.name}">
      <img src="${act.image}" alt="${act.name}主题插图" loading="lazy" />
      <span class="chapter-image-shade"></span>
      <span class="chapter-image-number">${act.number}</span>
      <span class="chapter-image-copy">
        <small>${act.english}</small>
        <strong>${act.name}</strong>
      </span>
      <i aria-hidden="true">↗</i>
    </button>
  `).join("");
  tablist.before(gallery);

  const cards = [...gallery.querySelectorAll(".chapter-image-card")];
  const syncActive = () => {
    const activeIndex = Math.max(0, tabs.findIndex((tab) => tab.getAttribute("aria-selected") === "true"));
    cards.forEach((card, index) => card.classList.toggle("is-active", index === activeIndex));
  };

  cards.forEach((card, index) => {
    card.addEventListener("click", () => {
      tabs[index].click();
      syncActive();
    });
  });

  const selectionObserver = new MutationObserver(syncActive);
  tabs.forEach((tab) => selectionObserver.observe(tab, { attributes: true, attributeFilter: ["aria-selected"] }));
  syncActive();
}

function mount(hero) {
  if (hero.querySelector(".hf-scripture-stage")) return;
  hero.classList.add("has-hyperframes-stage");

  const oldStage = hero.querySelector(".scripture-stage");
  if (oldStage) oldStage.remove();

  const stage = document.createElement("section");
  stage.className = "hf-scripture-stage";
  stage.setAttribute("aria-label", "HyperFrames 圣经六幕互动叙事");
  stage.innerHTML = `
    <div class="hf-stage-frame">
      <div class="hf-stage-chrome" aria-hidden="true">
        <span>HYPERFRAMES / LIVE COMPOSITION</span>
        <i></i>
        <span>POINTER REACTIVE</span>
      </div>
      <hyperframes-player
        class="hf-player"
        src="./hyperframes/scripture-cinematic/index.html"
        width="1280"
        height="720"
        muted
        interactive
        aria-label="点击播放或暂停圣经宏大叙事动画"
      ></hyperframes-player>
      <div class="hf-loading" role="status">
        <span></span>
        <b>正在装载宏大叙事</b>
      </div>
      <button class="hf-launch" type="button">
        <span class="hf-launch-ring"><i>▶</i></span>
        <strong>开启叙事</strong>
        <small>点击圣经 · 六幕展开</small>
      </button>
      <button class="hf-play-toggle" type="button" aria-label="播放动画"><span>▶</span></button>
      <div class="hf-transport">
        <span class="hf-time">00:00</span>
        <input class="hf-scrubber" type="range" min="0" max="38" step="0.01" value="0" aria-label="动画时间轴" />
        <button class="hf-replay" type="button">重新观看</button>
      </div>
    </div>
    <nav class="hf-act-nav" aria-label="六幕动画章节">
      ${ACTS.map((act, index) => `
        <button type="button" data-time="${act.time}" data-act="${index}">
          <span>${act.number}</span><strong>${act.name}</strong>
        </button>
      `).join("")}
    </nav>
    <p class="hf-interaction-hint"><span>移动指针</span>唤醒空间视差　·　<span>点击画面</span>播放 / 暂停　·　<span>拖动时间轴</span>探索六幕</p>
  `;
  hero.append(stage);

  const player = stage.querySelector(".hf-player");
  const loading = stage.querySelector(".hf-loading");
  const launch = stage.querySelector(".hf-launch");
  const playToggle = stage.querySelector(".hf-play-toggle");
  const playGlyph = playToggle.querySelector("span");
  const scrubber = stage.querySelector(".hf-scrubber");
  const timeLabel = stage.querySelector(".hf-time");
  const replay = stage.querySelector(".hf-replay");
  const actButtons = [...stage.querySelectorAll(".hf-act-nav button")];
  let duration = 38;

  const update = (time) => {
    const value = Math.max(0, Math.min(duration, Number(time) || 0));
    scrubber.value = String(value);
    scrubber.style.setProperty("--progress", `${(value / duration) * 100}%`);
    timeLabel.textContent = formatTime(value);

    let active = 0;
    ACTS.forEach((act, index) => {
      if (value >= act.time) active = index;
    });
    actButtons.forEach((button, index) => {
      button.classList.toggle("is-active", index === active && value >= ACTS[0].time);
      button.classList.toggle("is-passed", index < active);
    });
  };

  const setPlaying = (playing) => {
    stage.classList.toggle("is-playing", playing);
    playGlyph.textContent = playing ? "Ⅱ" : "▶";
    playToggle.setAttribute("aria-label", playing ? "暂停动画" : "播放动画");
  };

  player.addEventListener("ready", (event) => {
    duration = event.detail?.duration || 38;
    scrubber.max = String(duration);
    loading.classList.add("is-hidden");
    stage.classList.add("is-ready");
    if (reduceMotion) {
      player.seek(Math.max(0, duration - .25));
      launch.classList.add("is-hidden");
      update(duration);
    } else {
      player.seek(0);
      update(0);
    }
  });

  player.addEventListener("timeupdate", (event) => update(event.detail?.currentTime ?? player.currentTime));
  player.addEventListener("play", () => setPlaying(true));
  player.addEventListener("pause", () => setPlaying(false));
  player.addEventListener("ended", () => {
    setPlaying(false);
    stage.classList.add("is-finished");
  });

  launch.addEventListener("click", (event) => {
    event.stopPropagation();
    launch.classList.add("is-hidden");
    stage.classList.add("is-entered");
    player.play();
  });

  playToggle.addEventListener("click", (event) => {
    event.stopPropagation();
    launch.classList.add("is-hidden");
    player.paused ? player.play() : player.pause();
  });

  scrubber.addEventListener("pointerdown", (event) => event.stopPropagation());
  scrubber.addEventListener("input", (event) => {
    event.stopPropagation();
    launch.classList.add("is-hidden");
    player.seek(Number(scrubber.value));
    update(scrubber.value);
  });

  replay.addEventListener("click", (event) => {
    event.stopPropagation();
    launch.classList.add("is-hidden");
    stage.classList.remove("is-finished");
    player.seek(0);
    player.play();
  });

  actButtons.forEach((button) => {
    button.addEventListener("click", () => {
      launch.classList.add("is-hidden");
      stage.classList.add("is-entered");
      player.seek(Number(button.dataset.time));
      player.play();
    });
  });

  const resetPointer = () => {
    stage.style.setProperty("--px", "0");
    stage.style.setProperty("--py", "0");
    player.iframeElement?.contentWindow?.postMessage({ type: "scripture-live-pointer", x: 0, y: 0 }, "*");
  };

  stage.addEventListener("pointermove", (event) => {
    if (reduceMotion) return;
    const bounds = stage.getBoundingClientRect();
    const x = ((event.clientX - bounds.left) / bounds.width - .5) * 2;
    const y = ((event.clientY - bounds.top) / bounds.height - .5) * 2;
    stage.style.setProperty("--px", x.toFixed(3));
    stage.style.setProperty("--py", y.toFixed(3));
    player.iframeElement?.contentWindow?.postMessage({ type: "scripture-live-pointer", x, y }, "*");
  });
  stage.addEventListener("pointerleave", resetPointer);
}

waitForHero();
waitForChapterTabs();

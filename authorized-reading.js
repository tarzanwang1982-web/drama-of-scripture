const BOOK = {
  title: "《圣经戏剧》授权中文版",
  subtitle: "找寻我们在圣经故事中的角色",
  file: "./the-drama-of-scripture-authorized-cn.pdf",
  cover: "./images/hero-scripture.webp",
};

const ACTS = [
  { number: "01", name: "创造", subtitle: "上帝建立他的国度", file: "./act-1-authorized-cn.pdf", pages: 14, printPage: 15 },
  { number: "02", name: "堕落", subtitle: "国度里的叛逆", file: "./act-2-authorized-cn.pdf", pages: 6, printPage: 29 },
  { number: "03", name: "以色列", subtitle: "君王拣选以色列 · 含幕间", file: "./act-3-authorized-cn.pdf", pages: 92, printPage: 35 },
  { number: "04", name: "基督", subtitle: "王的到来 · 救赎的完成", file: "./act-4-authorized-cn.pdf", pages: 48, printPage: 127 },
  { number: "05", name: "教会", subtitle: "传播王者的消息 · 教会的使命", file: "./act-5-authorized-cn.pdf", pages: 28, printPage: 175 },
  { number: "06", name: "新创造", subtitle: "王的归来 · 国度成就", file: "./act-6-authorized-cn.pdf", pages: 10, printPage: 203 },
];

const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
let currentAct = 0;
let lastTrigger = null;

function pdfUrl(file, page = 1) {
  return `${file}#page=${page}&view=FitH`;
}

function createReader() {
  const modal = document.createElement("div");
  modal.className = "authorized-reader";
  modal.setAttribute("role", "dialog");
  modal.setAttribute("aria-modal", "true");
  modal.setAttribute("aria-labelledby", "authorized-reader-title");
  modal.setAttribute("aria-hidden", "true");
  modal.innerHTML = `
    <div class="authorized-reader__backdrop" data-reader-close></div>
    <section class="authorized-reader__shell">
      <header class="authorized-reader__header">
        <div>
          <span class="authorized-reader__seal">授权原文</span>
          <h2 id="authorized-reader-title">${BOOK.title}</h2>
          <p>${BOOK.subtitle}</p>
        </div>
        <div class="authorized-reader__actions">
          <a class="authorized-reader__external" href="${ACTS[0].file}" target="_blank" rel="noopener">
            全屏阅读本幕
          </a>
          <a class="authorized-reader__download" href="${BOOK.file}" download>
            下载 PDF
          </a>
          <button class="authorized-reader__close" type="button" data-reader-close aria-label="关闭授权原文阅读器">
            <span></span><span></span>
          </button>
        </div>
      </header>
      <div class="authorized-reader__body">
        <aside class="authorized-reader__chapters" aria-label="授权原文章节导航">
          <figure class="authorized-reader__book">
            <img src="${BOOK.cover}" alt="《圣经戏剧》授权中文版封面" />
            <figcaption>六幕分卷阅读 · 完整版 247 页</figcaption>
          </figure>
          <nav>
            ${ACTS.map((act, index) => `
              <button type="button" data-reader-act="${index}">
                <span>${act.number}</span>
                <span><strong>${act.name}</strong><small>${act.subtitle}</small></span>
                <i>第 ${act.printPage} 页</i>
              </button>
            `).join("")}
          </nav>
          <p class="authorized-reader__notice">
            本站呈现的是发布者提供的授权版本。内容版权归原作者及出版方所有，请勿另行转载或再分发。
          </p>
        </aside>
        <main class="authorized-reader__document">
          <div class="authorized-reader__document-bar">
            <div>
              <span>正在阅读</span>
              <strong data-reader-current>第一幕 · 创造</strong>
            </div>
            <span data-reader-page>书内第 15 页</span>
          </div>
          <div class="authorized-reader__frame-wrap">
            <div class="authorized-reader__loading">
              <i></i><span>正在载入授权原文</span>
            </div>
            <iframe
              title="《圣经戏剧》授权原文阅读器"
              data-reader-frame
              loading="lazy"
            ></iframe>
          </div>
          <p class="authorized-reader__mobile-help">
            如果设备无法在页面中显示 PDF，请使用上方“全屏打开”。
          </p>
        </main>
      </div>
    </section>
  `;
  document.body.append(modal);

  const frame = modal.querySelector("[data-reader-frame]");
  const loading = modal.querySelector(".authorized-reader__loading");
  const current = modal.querySelector("[data-reader-current]");
  const page = modal.querySelector("[data-reader-page]");
  const actButtons = [...modal.querySelectorAll("[data-reader-act]")];
  const external = modal.querySelector(".authorized-reader__external");

  const selectAct = (index, forceLoad = false) => {
    const nextIndex = Math.max(0, Math.min(ACTS.length - 1, Number(index) || 0));
    const act = ACTS[nextIndex];
    currentAct = nextIndex;
    current.textContent = `第${["一", "二", "三", "四", "五", "六"][nextIndex]}幕 · ${act.name}`;
    page.textContent = `书内第 ${act.printPage} 页`;
    external.href = pdfUrl(act.file);
    actButtons.forEach((button, buttonIndex) => {
      const selected = buttonIndex === nextIndex;
      button.classList.toggle("is-active", selected);
      button.setAttribute("aria-current", selected ? "page" : "false");
    });
    if (forceLoad || modal.classList.contains("is-open")) {
      loading.classList.remove("is-hidden");
      frame.src = pdfUrl(act.file);
    }
  };

  const open = (index = currentAct, trigger = null) => {
    lastTrigger = trigger || document.activeElement;
    selectAct(index, true);
    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
    document.documentElement.classList.add("reader-is-open");
    requestAnimationFrame(() => modal.querySelector(".authorized-reader__close").focus());
  };

  const close = () => {
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
    document.documentElement.classList.remove("reader-is-open");
    if (lastTrigger instanceof HTMLElement) lastTrigger.focus();
  };

  frame.addEventListener("load", () => loading.classList.add("is-hidden"));
  actButtons.forEach((button) => {
    button.addEventListener("click", () => selectAct(button.dataset.readerAct, true));
  });
  modal.querySelectorAll("[data-reader-close]").forEach((button) => {
    button.addEventListener("click", close);
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && modal.classList.contains("is-open")) close();
  });

  selectAct(0);
  return { open, close, selectAct, modal };
}

function mountReadingEntry(reader) {
  const tryMount = () => {
    const tablist = document.querySelector(".act-tabs");
    if (!tablist) return false;
    const tabs = [...tablist.querySelectorAll('[role="tab"]')];
    if (tabs.length !== ACTS.length) return false;

    if (!document.querySelector(".authorized-reading-entry")) {
      const entry = document.createElement("section");
      entry.className = "authorized-reading-entry";
      entry.innerHTML = `
        <div class="authorized-reading-entry__cover">
          <img src="${BOOK.cover}" alt="" />
        </div>
        <div class="authorized-reading-entry__copy">
          <span>AUTHORIZED EDITION · 授权版本</span>
          <h3>在导读之后，回到作者的完整论述</h3>
          <p>六幕导读帮助你看见结构，授权原文按幕载入，保留作者完整的论证、注释与章节脉络。</p>
        </div>
        <div class="authorized-reading-entry__meta">
          <span data-entry-act>第一幕 · 创造</span>
          <small data-entry-page>从书内第 15 页开始</small>
          <button type="button" data-entry-open>
            <span>阅读本幕原文</span><i aria-hidden="true">↗</i>
          </button>
        </div>
      `;
      tablist.after(entry);

      const entryAct = entry.querySelector("[data-entry-act]");
      const entryPage = entry.querySelector("[data-entry-page]");
      const openButton = entry.querySelector("[data-entry-open]");

      const sync = () => {
        const selectedIndex = tabs.findIndex((tab) => tab.getAttribute("aria-selected") === "true");
        currentAct = selectedIndex < 0 ? 0 : selectedIndex;
        const act = ACTS[currentAct];
        entryAct.textContent = `第${["一", "二", "三", "四", "五", "六"][currentAct]}幕 · ${act.name}`;
        entryPage.textContent = `从书内第 ${act.printPage} 页开始`;
        reader.selectAct(currentAct);
      };

      openButton.addEventListener("click", () => reader.open(currentAct, openButton));
      const observer = new MutationObserver(sync);
      tabs.forEach((tab) => observer.observe(tab, {
        attributes: true,
        attributeFilter: ["aria-selected"],
      }));
      sync();
    }

    if (!document.querySelector(".authorized-reading-dock")) {
      const dock = document.createElement("button");
      dock.type = "button";
      dock.className = "authorized-reading-dock";
      dock.innerHTML = `
        <span><i></i>授权原文</span>
        <strong>打开完整中文版</strong>
      `;
      dock.addEventListener("click", () => reader.open(currentAct, dock));
      document.body.append(dock);
    }
    return true;
  };

  if (tryMount()) return;
  const observer = new MutationObserver(() => {
    if (!tryMount()) return;
    observer.disconnect();
  });
  observer.observe(document.body, { childList: true, subtree: true });
}

function init() {
  const reader = createReader();
  mountReadingEntry(reader);

  if (!reduceMotion) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => entry.target.classList.toggle("is-visible", entry.isIntersecting));
    }, { threshold: 0.18 });
    const waitForEntry = new MutationObserver(() => {
      const entry = document.querySelector(".authorized-reading-entry");
      if (!entry) return;
      waitForEntry.disconnect();
      observer.observe(entry);
    });
    waitForEntry.observe(document.body, { childList: true, subtree: true });
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init, { once: true });
} else {
  init();
}

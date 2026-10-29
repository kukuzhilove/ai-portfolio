(function () {
  const app = document.getElementById("app");
  const LOAD_ERROR =
    "内容没有载入。请通过本地服务器或 GitHub Pages 打开本页，不要直接双击 HTML 文件。";

  function esc(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function safeUrl(value) {
    const raw = String(value ?? "").trim();
    if (!raw || raw.startsWith("//")) return "";
    if (raw.startsWith("#") || raw.startsWith("./") || raw.startsWith("/")) return raw;
    try {
      const url = new URL(raw);
      if (url.protocol === "https:" || url.protocol === "http:" || url.protocol === "mailto:") {
        return url.href;
      }
    } catch (error) {
      return "";
    }
    return "";
  }

  function isExternal(url) {
    return /^(https?:|mailto:)/i.test(url);
  }

  function linkExtra(url, identity) {
    if (!isExternal(url)) return "";
    const rel = identity ? "me noopener noreferrer" : "noopener noreferrer";
    return ` target="_blank" rel="${rel}"`;
  }

  function newTabHint(ui) {
    return `<span class="sr-only">（${esc(ui.newTab)}）</span>`;
  }

  function arrowIcon(direction) {
    const path =
      direction === "down"
        ? "M8 3v10M4 9l4 4 4-4"
        : "M3 8h10M9 4l4 4-4 4";
    return `<svg class="icon" viewBox="0 0 16 16" aria-hidden="true"><path d="${path}" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
  }

  function githubIcon() {
    return '<svg class="icon" viewBox="0 0 16 16" aria-hidden="true"><path fill="currentColor" d="M8 0C3.58 0 0 3.58 0 8a8 8 0 0 0 5.47 7.59c.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82A7.6 7.6 0 0 1 8 4.27c.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8 8 0 0 0 16 8c0-4.42-3.58-8-8-8Z"/></svg>';
  }

  function markIcon() {
    return '<svg class="mark" viewBox="0 0 24 24" aria-hidden="true"><defs><linearGradient id="mark-grad" x1="3" y1="3" x2="21" y2="21" gradientUnits="userSpaceOnUse"><stop stop-color="#c4b2ff"/><stop offset="1" stop-color="#9cf3e6"/></linearGradient></defs><path d="M12 2.2 21.8 12 12 21.8 2.2 12Z" fill="none" stroke="url(#mark-grad)" stroke-width="1.4"/><circle cx="12" cy="12" r="1.7" fill="#f4f0e6"/></svg>';
  }

  function badge(ui, on) {
    if (!on) return "";
    return `<span class="badge">${esc(ui.placeholder)}</span>`;
  }

  function eyebrow(index, label) {
    return `<p class="eyebrow">${index ? `<span class="eyebrow-idx">${esc(index)}</span>` : ""}${
      label ? `<span>${esc(label)}</span>` : ""
    }</p>`;
  }

  function showError(message) {
    document.documentElement.classList.add("js");
    app.innerHTML = `<main class="boot-error"><p>${esc(message)}</p><p><a href="https://github.com/kukuzhilove">GitHub</a></p></main>`;
  }

  function setMeta(attr, key, content) {
    if (!content) return;
    let el = document.head.querySelector(`meta[${attr}="${key}"]`);
    if (!el) {
      el = document.createElement("meta");
      el.setAttribute(attr, key);
      document.head.appendChild(el);
    }
    el.setAttribute("content", content);
  }

  function applyDocument(data) {
    const meta = data.meta || {};
    const profile = data.profile || {};
    if (meta.lang) document.documentElement.lang = meta.lang;
    if (meta.title) document.title = meta.title;
    setMeta("name", "description", meta.description);
    setMeta("property", "og:title", meta.title);
    setMeta("property", "og:description", meta.description);
    setMeta("property", "og:url", safeUrl(meta.siteUrl));
    const image = safeUrl(profile.avatarUrl);
    if (image) setMeta("property", "og:image", image);
    const siteUrl = safeUrl(meta.siteUrl);
    if (siteUrl) {
      let canonical = document.querySelector('link[rel="canonical"]');
      if (!canonical) {
        canonical = document.createElement("link");
        canonical.rel = "canonical";
        document.head.appendChild(canonical);
      }
      canonical.href = siteUrl;
    }

    const personUrl = safeUrl(profile.githubUrl);
    const ld = {
      "@context": "https://schema.org",
      "@type": "ProfilePage",
      name: meta.title || profile.displayName,
      mainEntity: {
        "@type": "Person",
        name: profile.displayName,
      },
    };
    if (siteUrl) ld.url = siteUrl;
    if (personUrl) ld.mainEntity.url = personUrl;
    if (image) ld.mainEntity.image = image;
    let script = document.getElementById("profile-ld");
    if (!script) {
      script = document.createElement("script");
      script.id = "profile-ld";
      script.type = "application/ld+json";
      document.head.appendChild(script);
    }
    script.textContent = JSON.stringify(ld);
  }

  function renderHeader(data) {
    const ui = data.ui || {};
    const profile = data.profile || {};
    const name = profile.displayName || "";
    const nav = Array.isArray(data.nav) ? data.nav : [];
    const github = safeUrl(profile.githubUrl);
    const items = nav
      .map((item) => {
        const href = safeUrl(item.href);
        if (!href || !item.label) return "";
        return `<li><a href="${esc(href)}">${esc(item.label)}</a></li>`;
      })
      .join("");
    const githubLink = github
      ? `<a class="github-link" href="${esc(github)}"${linkExtra(github, true)}>${githubIcon()}<span>${esc(
          ui.github || "GitHub"
        )}</span>${newTabHint(ui)}</a>`
      : "";

    return `<a class="skip" href="#main">${esc(ui.skipToContent || "跳到正文")}</a>
      <div class="progress" id="progress" aria-hidden="true"></div>
      <header class="site-header">
        <div class="header-inner wrap">
          <a class="brand" href="#top">${markIcon()}<span class="brand-name">${esc(name)}</span></a>
          <button class="nav-toggle" type="button" aria-expanded="false" aria-controls="nav-links">${esc(
            ui.menu || "菜单"
          )}</button>
          <nav class="nav" aria-label="${esc(ui.navLabel || "页面章节")}">
            <ul class="nav-links" id="nav-links">${items}</ul>
          </nav>
          ${githubLink}
        </div>
      </header>`;
  }

  function renderHero(data) {
    const hero = data.hero || {};
    const profile = data.profile || {};
    const ui = data.ui || {};
    const name = profile.displayName || "";
    const avatar = safeUrl(profile.avatarUrl);
    const orbitSource = String(hero.orbit || `${hero.eyebrow || ""} · ${name}`).trim();
    const orbit = orbitSource.length < 36 ? `${orbitSource}    ${orbitSource}` : orbitSource;
    const primary = hero.primaryCta || {};
    const secondary = hero.secondaryCta || {};
    const primaryHref = safeUrl(primary.href);
    const secondaryHref = safeUrl(secondary.href);
    const portrait = avatar
      ? `<img src="${esc(avatar)}" alt="${esc(profile.avatarAlt || name)}" width="280" height="280" fetchpriority="high" />
         <span class="monogram" hidden>${esc(profile.monogram || name.slice(0, 1))}</span>`
      : `<span class="monogram">${esc(profile.monogram || name.slice(0, 1))}</span>`;

    const primaryLink = primaryHref
      ? `<a class="btn" href="${esc(primaryHref)}"${linkExtra(primaryHref, true)}>${esc(
          primary.label || "GitHub"
        )}${arrowIcon(primaryHref.startsWith("#") ? "down" : "right")}${
          isExternal(primaryHref) ? newTabHint(ui) : ""
        }</a>`
      : "";
    const secondaryLink = secondaryHref
      ? `<a class="text-link" href="${esc(secondaryHref)}"${linkExtra(secondaryHref)}>${esc(
          secondary.label || ""
        )}${arrowIcon(secondaryHref.startsWith("#") ? "down" : "right")}${
          isExternal(secondaryHref) ? newTabHint(ui) : ""
        }</a>`
      : "";

    return `<section class="hero wrap" id="top">
      <div class="hero-copy">
        ${eyebrow(hero.index, hero.eyebrow)}
        <p class="kicker">${esc(hero.kicker || "")}</p>
        <h1 class="hero-name">${esc(name)}</h1>
        <p class="tagline">${esc(hero.tagline || "")}</p>
        <p class="lead">${esc(hero.lead || "")}</p>
        <div class="actions">${primaryLink}${secondaryLink}</div>
      </div>
      <div class="hero-visual">
        <div class="seal-wrap">
          <svg class="orbit" viewBox="0 0 200 200" aria-hidden="true">
            <defs>
              <path id="orbit-path" d="M100 100 m-86 0 a86 86 0 1 1 172 0 a86 86 0 1 1 -172 0"></path>
            </defs>
            <text>
              <textPath href="#orbit-path" textLength="530" lengthAdjust="spacing">${esc(orbit)}</textPath>
            </text>
          </svg>
          <div class="portrait">${portrait}</div>
          ${hero.seal ? `<span class="stamp">${esc(hero.seal)}</span>` : ""}
        </div>
      </div>
    </section>`;
  }

  function renderAbout(data) {
    const about = data.about;
    if (!about) return "";
    const paragraphs = (Array.isArray(about.paragraphs) ? about.paragraphs : [])
      .map((paragraph) => `<p>${esc(paragraph)}</p>`)
      .join("");
    const facts = (Array.isArray(about.facts) ? about.facts : [])
      .map(
        (fact) =>
          `<div><dt>${esc(fact.label)}</dt><dd>${esc(fact.value)}</dd></div>`
      )
      .join("");
    return `<section class="section wrap reveal" id="about" aria-labelledby="about-title">
      <span class="watermark" aria-hidden="true">${esc(about.index || "")}</span>
      <div class="section-head">
        ${eyebrow(about.index, about.eyebrow)}
        <h2 id="about-title">${esc(about.title || "")}</h2>
      </div>
      <div class="about-grid">
        <div class="prose">${paragraphs}</div>
        ${facts ? `<dl class="facts">${facts}</dl>` : ""}
      </div>
    </section>`;
  }

  function renderTools(data) {
    const tools = data.tools;
    if (!tools) return "";
    const ui = data.ui || {};
    const items = (Array.isArray(tools.items) ? tools.items : [])
      .map((item, index) => {
        const en = item.en ? `<span class="tool-en">${esc(item.en)}</span>` : "";
        return `<li class="tool-card" style="transition-delay:${index * 70}ms">
          <div class="tool-top"><span class="tool-idx">${String(index + 1).padStart(2, "0")}</span>${en}</div>
          <h3>${esc(item.name || "")}</h3>
          <p>${esc(item.description || "")}</p>
          ${badge(ui, item.placeholder === true)}
        </li>`;
      })
      .join("");
    return `<section class="section wrap reveal" id="tools" aria-labelledby="tools-title">
      <span class="watermark" aria-hidden="true">${esc(tools.index || "")}</span>
      <div class="section-head">
        ${eyebrow(tools.index, tools.eyebrow)}
        <h2 id="tools-title">${esc(tools.title || "")}</h2>
        ${tools.intro ? `<p class="intro">${esc(tools.intro)}</p>` : ""}
      </div>
      ${items ? `<ul class="tool-grid">${items}</ul>` : ""}
    </section>`;
  }

  function renderProjects(data) {
    const projects = data.projects;
    if (!projects) return "";
    const ui = data.ui || {};
    const items = (Array.isArray(projects.items) ? projects.items : [])
      .map((item, index) => {
        const href = safeUrl(item.href);
        const tags = (Array.isArray(item.tags) ? item.tags : [])
          .map((tag) => `<li>${esc(tag)}</li>`)
          .join("");
        const link = href
          ? `<a class="project-link" href="${esc(href)}"${linkExtra(href)}>${esc(
              item.linkLabel || "打开"
            )}${arrowIcon()}${isExternal(href) ? newTabHint(ui) : ""}</a>`
          : "";
        return `<li>
          <article class="project">
            <span class="project-index">${String(index + 1).padStart(2, "0")}</span>
            <div class="project-main">
              <div class="project-title-row">
                <h3>${esc(item.title || "")}</h3>
                ${item.status ? `<span class="status">${esc(item.status)}</span>` : ""}
                ${badge(ui, item.placeholder === true)}
              </div>
              ${item.en ? `<p class="project-en">${esc(item.en)}</p>` : ""}
              <p class="project-copy">${esc(item.description || "")}</p>
              ${tags ? `<ul class="tags">${tags}</ul>` : ""}
            </div>
            ${link}
          </article>
        </li>`;
      })
      .join("");
    return `<section class="section wrap reveal" id="projects" aria-labelledby="projects-title">
      <span class="watermark" aria-hidden="true">${esc(projects.index || "")}</span>
      <div class="section-head">
        ${eyebrow(projects.index, projects.eyebrow)}
        <h2 id="projects-title">${esc(projects.title || "")}</h2>
        ${projects.intro ? `<p class="intro">${esc(projects.intro)}</p>` : ""}
      </div>
      ${items ? `<ol class="project-list">${items}</ol>` : ""}
    </section>`;
  }

  function renderContact(data) {
    const contact = data.contact;
    if (!contact) return "";
    const ui = data.ui || {};
    const links = (Array.isArray(contact.links) ? contact.links : [])
      .map((item) => {
        const href = safeUrl(item.href);
        if (!href) return "";
        const identity = /github\.com\/kukuzhilove\/?$/i.test(href);
        return `<li><a href="${esc(href)}"${linkExtra(href, identity)}>
          <span class="contact-label">${esc(item.label || "")}</span>
          ${item.hint ? `<span class="contact-hint">${esc(item.hint)}</span>` : ""}
          ${arrowIcon()}
          ${isExternal(href) ? newTabHint(ui) : ""}
        </a></li>`;
      })
      .join("");
    return `<section class="section wrap reveal" id="contact" aria-labelledby="contact-title">
      <div class="contact-panel">
        ${eyebrow(contact.index, contact.eyebrow)}
        <h2 id="contact-title">${esc(contact.title || "")}</h2>
        ${contact.text ? `<p class="lead">${esc(contact.text)}</p>` : ""}
        ${links ? `<ul class="contact-links">${links}</ul>` : ""}
      </div>
    </section>`;
  }

  function renderFooter(data) {
    const footer = data.footer || {};
    const edge = `${(data.ui && data.ui.edge) || "AI ARCHIVE"} · ${(data.profile && data.profile.displayName) || ""}`;
    return `<footer class="site-footer wrap">
      <p>${esc(footer.left || "")}</p>
      <p>${esc(footer.right || "")}</p>
    </footer>
    <p class="edge-label" aria-hidden="true">${esc(edge)}</p>`;
  }

  function bind(data) {
    const ui = data.ui || {};
    const header = document.querySelector(".site-header");
    const progress = document.getElementById("progress");
    const toggle = document.querySelector(".nav-toggle");
    const links = document.getElementById("nav-links");

    const onScroll = () => {
      const scrolled = window.scrollY;
      const height = document.documentElement.scrollHeight - window.innerHeight;
      const ratio = height > 0 ? Math.min(1, Math.max(0, scrolled / height)) : 0;
      if (progress) progress.style.transform = `scaleX(${ratio})`;
      if (header) header.classList.toggle("is-scrolled", scrolled > 8);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    const setNav = (open) => {
      document.body.classList.toggle("nav-open", open);
      if (!toggle) return;
      toggle.setAttribute("aria-expanded", String(open));
      toggle.textContent = open ? ui.closeMenu || "关闭" : ui.menu || "菜单";
      toggle.setAttribute("aria-label", open ? ui.closeMenu || "关闭菜单" : ui.openMenu || "打开菜单");
    };

    if (toggle) {
      toggle.setAttribute("aria-label", ui.openMenu || "打开菜单");
      toggle.addEventListener("click", () => {
        const open = toggle.getAttribute("aria-expanded") !== "true";
        setNav(open);
        if (open && links) {
          const first = links.querySelector("a");
          if (first) first.focus();
        }
      });
    }

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && document.body.classList.contains("nav-open")) {
        setNav(false);
        if (toggle) toggle.focus();
      }
    });

    if (links) {
      links.addEventListener("click", (event) => {
        if (event.target.closest("a")) setNav(false);
      });
    }

    window.addEventListener("resize", () => {
      if (window.innerWidth > 860) setNav(false);
    });

    const navAnchors = Array.from(document.querySelectorAll(".nav-links a[href^='#']"));
    const sections = navAnchors
      .map((anchor) => document.querySelector(anchor.getAttribute("href")))
      .filter(Boolean);
    if (sections.length && "IntersectionObserver" in window) {
      const spy = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            navAnchors.forEach((anchor) => {
              const current = anchor.getAttribute("href") === `#${entry.target.id}`;
              if (current) anchor.setAttribute("aria-current", "true");
              else anchor.removeAttribute("aria-current");
            });
          });
        },
        { rootMargin: "-45% 0px -45% 0px", threshold: 0 }
      );
      sections.forEach((section) => spy.observe(section));
    }

    const reveals = document.querySelectorAll(".reveal");
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce || !("IntersectionObserver" in window)) {
      reveals.forEach((el) => el.classList.add("is-in"));
    } else {
      const io = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add("is-in");
            io.unobserve(entry.target);
          });
        },
        { threshold: 0.14, rootMargin: "0px 0px -8% 0px" }
      );
      reveals.forEach((el) => io.observe(el));
    }

    const image = document.querySelector(".portrait img");
    const monogram = document.querySelector(".portrait .monogram");
    if (image && monogram) {
      image.addEventListener("error", () => {
        image.remove();
        monogram.hidden = false;
      });
    }
  }

  function render(data) {
    if (!data || !data.profile || !data.profile.displayName) {
      showError("content.json 缺少 profile.displayName。");
      return;
    }
    document.documentElement.classList.add("js");
    applyDocument(data);
    app.innerHTML = `${renderHeader(data)}<main id="main" tabindex="-1">${renderHero(data)}${renderAbout(
      data
    )}${renderTools(data)}${renderProjects(data)}${renderContact(data)}</main>${renderFooter(data)}`;
    bind(data);
  }

  fetch("content.json")
    .then((response) => {
      if (!response.ok) throw new Error(String(response.status));
      return response.json();
    })
    .then(render)
    .catch((error) => {
      console.error(error);
      showError(LOAD_ERROR);
    });
})();

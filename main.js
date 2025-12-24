(function () {
  const CFG = window.SITE_CONFIG || {};

  const $ = (id) => document.getElementById(id);

  const splash = $("splash");
  const app = $("app");
  const bornSince = $("bornSince");
  const contentBlock = $("contentBlock");
  const photoEl = $("photo");
  const quoteEl = $("quote");
  const socialEl = $("social");
  const ytBtn = $("ytToggle");
  const ytMount = $("ytMount");
  const copyrightEl = $("copyright");

  // ---------- Helpers ----------
  function clampNonNeg(n) { return Math.max(0, n); }

  function parseYouTubeId(url) {
    try {
      const u = new URL(url);
      if (u.hostname.includes("youtu.be")) return u.pathname.replace("/", "") || null;
      if (u.hostname.includes("youtube.com")) {
        const v = u.searchParams.get("v");
        if (v) return v;
        // /embed/ID
        const parts = u.pathname.split("/").filter(Boolean);
        const embedIdx = parts.indexOf("embed");
        if (embedIdx >= 0 && parts[embedIdx + 1]) return parts[embedIdx + 1];
      }
    } catch {}
    return null;
  }

  function formatBornSince(ms) {
    const totalMinutes = Math.floor(ms / 60000);
    const days = Math.floor(totalMinutes / (60 * 24));
    const hours = Math.floor((totalMinutes - days * 60 * 24) / 60);
    const minutes = totalMinutes - days * 60 * 24 - hours * 60;
    return `${days} jours ${hours} heures ${minutes} minutes`;
  }

  function createIconLink(href, label, svgPathD) {
    const a = document.createElement("a");
    a.className = "iconLink";
    a.href = href;
    a.target = "_blank";
    a.rel = "noopener noreferrer";
    a.ariaLabel = label;
    a.title = label;

    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("viewBox", "0 0 24 24");
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("d", svgPathD);
    svg.appendChild(path);
    a.appendChild(svg);

    return a;
  }

  // Minimal SVG paths (simple, lisibles)
  const ICONS = {
    facebook: "M13.5 22v-8h2.7l.4-3h-3.1V9.1c0-.9.3-1.5 1.6-1.5H17V5.1c-.4-.1-1.6-.1-3-.1-3 0-5 1.8-5 5V11H6.5v3H9v8h4.5z",
    instagram: "M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5zm10 2H7a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3zm-5 4.2a3.8 3.8 0 1 1 0 7.6 3.8 3.8 0 0 1 0-7.6zM18 6.5a1 1 0 1 1 0 2 1 1 0 0 1 0-2z",
    linkedin: "M6.5 9H4v11h2.5V9zM5.3 4a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3zM20 20h-2.5v-5.6c0-1.3 0-3-1.8-3s-2.1 1.4-2.1 2.9V20H11V9h2.4v1.5h.1c.3-.7 1.3-1.6 2.8-1.6 3 0 3.6 2 3.6 4.5V20z",
    tiktok: "M16.5 2c.2 2 1.6 3.7 3.5 4v2.7c-1.6-.1-2.7-.6-3.5-1.2v7.1c0 3.3-2.7 6-6 6s-6-2.7-6-6 2.7-6 6-6c.4 0 .8 0 1.2.1v3c-.4-.2-.8-.3-1.2-.3-1.7 0-3 1.3-3 3s1.3 3 3 3 3-1.4 3-3V2h2.8z"
  };

  // ---------- Init UI ----------
  // Branding / footer
  const year = CFG.copyrightYear ?? new Date().getFullYear();
  const brand = CFG.brandName ?? "Nadak";
  if (copyrightEl) copyrightEl.textContent = `© ${year} ${brand}`;

  // Social links
  const links = (CFG.socialLinks || {});
  const order = ["facebook", "instagram", "linkedin", "tiktok"];
  order.forEach((key) => {
    const href = (links[key] || "").trim();
    if (!href) return;
    socialEl.appendChild(createIconLink(href, key, ICONS[key]));
  });

  // Photo + text block
  const blockEnabled = CFG.modules?.photoTextBlock?.enabled !== false;
  if (blockEnabled) {
    contentBlock.classList.remove("is-hidden");
    contentBlock.setAttribute("aria-hidden", "false");

    const p = CFG.photo || {};
    photoEl.src = p.src || "./assets/photo.jpg";
    photoEl.alt = p.alt || "";

    // Texte : quoteHtml prioritaire si présent, sinon quoteText
    const quoteHtml = (CFG.quoteHtml || "").trim();
    const quoteText = (CFG.quoteText || "").trim();

    if (quoteHtml) {
      quoteEl.classList.remove("is-plain");
      quoteEl.innerHTML = quoteHtml; // (volontaire) pour <strong>/<em>/<br>
    } else {
      quoteEl.classList.add("is-plain");
      quoteEl.textContent = quoteText;
    }
  }

  // Timer
  const birth = CFG.birthDateISO ? new Date(CFG.birthDateISO) : null;
  function tick() {
    if (!birth || isNaN(birth.getTime())) {
      bornSince.textContent = "Né depuis …";
      return;
    }
    const diff = clampNonNeg(Date.now() - birth.getTime());
    bornSince.textContent = `Né depuis ${formatBornSince(diff)}`;
  }
  tick();
  setInterval(tick, 30_000);

  // ---------- Splash fade ----------
  const minSplash = Number(CFG.splashMinDurationMs ?? 900);
  const start = performance.now();
  window.addEventListener("load", () => {
    const elapsed = performance.now() - start;
    const wait = Math.max(0, minSplash - elapsed);

    setTimeout(() => {
      splash.classList.add("is-fading");
      // montrer l'app juste avant la fin du fade pour éviter flash
      app.classList.remove("is-hidden");
      app.setAttribute("aria-hidden", "false");

      setTimeout(() => {
        splash.remove();
      }, 650);
    }, wait);
  });

  // ---------- YouTube background (play/pause button) ----------
  const ytEnabled = CFG.modules?.youtubeBackground?.enabled !== false;
  const ytId = ytEnabled ? parseYouTubeId(CFG.youtubeUrl || "") : null;

  let ytPlayer = null;
  let ytReady = false;
  let isPlaying = false;
  let apiLoading = false;

  function updateYtButton() {
    if (!ytId) {
      ytBtn.classList.add("is-hidden");
      return;
    }
    ytBtn.classList.remove("is-hidden");
    ytBtn.textContent = isPlaying ? "❚❚" : "▶";
    ytBtn.setAttribute("aria-pressed", String(isPlaying));
    ytBtn.title = isPlaying ? "Pause" : "Lecture";
  }

  function loadYouTubeAPIOnce() {
    return new Promise((resolve, reject) => {
      if (window.YT && window.YT.Player) return resolve();

      if (apiLoading) {
        const t = setInterval(() => {
          if (window.YT && window.YT.Player) { clearInterval(t); resolve(); }
        }, 50);
        setTimeout(() => { clearInterval(t); reject(new Error("YT API timeout")); }, 8000);
        return;
      }

      apiLoading = true;
      const script = document.createElement("script");
      script.src = "https://www.youtube.com/iframe_api";
      script.async = true;
      script.onload = () => {};
      script.onerror = () => reject(new Error("YT API load error"));
      document.head.appendChild(script);

      window.onYouTubeIframeAPIReady = () => resolve();
    });
  }

  async function ensurePlayer() {
    if (!ytId) return null;
    if (ytPlayer) return ytPlayer;

    await loadYouTubeAPIOnce();

    return new Promise((resolve) => {
      ytPlayer = new window.YT.Player(ytMount, {
        width: "1",
        height: "1",
        videoId: ytId,
        playerVars: {
          autoplay: 0,
          controls: 0,
          rel: 0,
          playsinline: 1,
          modestbranding: 1
        },
        events: {
          onReady: () => {
            ytReady = true;
            resolve(ytPlayer);
          },
          onStateChange: (e) => {
            const YTState = window.YT?.PlayerState;
            if (!YTState) return;
            if (e.data === YTState.PLAYING) isPlaying = true;
            if (e.data === YTState.PAUSED || e.data === YTState.ENDED) isPlaying = false;
            updateYtButton();
          }
        }
      });
    });
  }

  async function togglePlay() {
    if (!ytId) return;

    const player = await ensurePlayer();
    if (!player || !ytReady) return;

    // Le clic utilisateur permet de lancer la lecture (autoplay policy)
    if (!isPlaying) {
      player.playVideo();
      isPlaying = true;
    } else {
      player.pauseVideo();
      isPlaying = false;
    }
    updateYtButton();
  }

  if (ytEnabled && ytId) {
    updateYtButton();
    ytBtn.addEventListener("click", togglePlay);
  } else {
    ytBtn.classList.add("is-hidden");
  }
})();

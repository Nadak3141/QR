(() => {
  const cfg = window.SITE_CONFIG || {};

  // Helpers
  const $ = (sel) => document.querySelector(sel);

  function clampInt(n) {
    n = Number(n);
    if (!Number.isFinite(n)) return 0;
    return Math.max(0, Math.floor(n));
  }

  function parseYouTubeId(url) {
    try {
      const u = new URL(url);
      // youtu.be/<id>
      if (u.hostname.includes("youtu.be")) return u.pathname.replace("/", "") || "";
      // youtube.com/watch?v=<id>
      if (u.searchParams.get("v")) return u.searchParams.get("v");
      // youtube.com/embed/<id>
      const parts = u.pathname.split("/").filter(Boolean);
      const embedIndex = parts.indexOf("embed");
      if (embedIndex !== -1 && parts[embedIndex + 1]) return parts[embedIndex + 1];
      // youtube.com/shorts/<id>
      const shortsIndex = parts.indexOf("shorts");
      if (shortsIndex !== -1 && parts[shortsIndex + 1]) return parts[shortsIndex + 1];
      return "";
    } catch {
      return "";
    }
  }

  function setLink(id, href) {
    const el = $(id);
    if (!el) return;
    if (href && typeof href === "string" && href.trim().length > 0) {
      el.href = href.trim();
      el.hidden = false;
    } else {
      el.hidden = true;
    }
  }

  // Splash fade -> app
  const splash = $("#splash");
  const app = $("#app");
  const minSplash = clampInt(cfg.splashMinDurationMs ?? 900);

  function startApp() {
    // Fade out splash and fade in app
    splash?.classList.add("splash--hide");
    app?.classList.remove("app--hidden");
    // Retire le splash du flux après transition
    setTimeout(() => {
      if (splash) splash.style.display = "none";
      if (app) app.style.visibility = "visible";
    }, 950);
  }

  // Timer "né depuis"
  const timerEl = $("#sinceTimer");
  let birthDate = new Date(cfg.birthDateISO || "");
  if (Number.isNaN(birthDate.getTime())) {
    // fallback : maintenant (évite NaN à l’écran)
    birthDate = new Date();
  }

  function formatSince(ms) {
    const totalMinutes = clampInt(ms / 60000);
    const days = clampInt(totalMinutes / (60 * 24));
    const hours = clampInt((totalMinutes % (60 * 24)) / 60);
    const minutes = clampInt(totalMinutes % 60);

    const pad2 = (x) => String(x).padStart(2, "0");
    // Demandé: "XXX jours XXX heures XXX minutes"
    // Je mets heures/minutes sur 2 digits, jours sans limite.
    return `${days} jours ${pad2(hours)} heures ${pad2(minutes)} minutes`;
  }

  function tickTimer() {
    const now = new Date();
    const diff = Math.max(0, now.getTime() - birthDate.getTime());
    if (timerEl) timerEl.textContent = formatSince(diff);
  }

  // Modules (affichage)
  const modQuote = $("#moduleQuote");
  const modPhoto = $("#modulePhoto");
  const modYoutube = $("#moduleYoutube");

  // Quote
  const quoteEnabled = !!cfg.modules?.quote?.enabled;
  if (quoteEnabled && modQuote) {
    $("#quoteText").textContent = String(cfg.quoteText ?? "");
    modQuote.hidden = false;
  } else if (modQuote) {
    modQuote.hidden = true;
  }

  // Photo
  const photoEnabled = !!cfg.modules?.photo?.enabled;
  if (photoEnabled && modPhoto) {
    const img = $("#photoEl");
    if (img) {
      img.alt = String(cfg.modules?.photo?.alt ?? "");
      // chemin imposé: assets/photo.jpg (déjà dans le HTML)
      // rien à faire ici sauf si tu veux changer via config plus tard.
    }
    modPhoto.hidden = false;
  } else if (modPhoto) {
    modPhoto.hidden = true;
  }

  // YouTube
  const ytEnabled = !!cfg.modules?.youtube?.enabled;
  if (ytEnabled && modYoutube) {
    const id = parseYouTubeId(String(cfg.youtubeUrl ?? ""));
    const frame = $("#youtubeFrame");
    if (frame && id) {
      // Paramètres minimalistes + privacy mode
      frame.src = `https://www.youtube-nocookie.com/embed/${encodeURIComponent(id)}?rel=0&modestbranding=1&playsinline=1`;
      modYoutube.hidden = false;
    } else {
      modYoutube.hidden = true;
    }
  } else if (modYoutube) {
    modYoutube.hidden = true;
  }

  // Footer
  const brand = String(cfg.brandName ?? "Nadak");
  const year = clampInt(cfg.copyrightYear ?? 2025) || 2025;
  const c = $("#copyrightText");
  if (c) c.textContent = `© ${year} ${brand}`;

  setLink("#linkFacebook", cfg.socialLinks?.facebook);
  setLink("#linkInstagram", cfg.socialLinks?.instagram);
  setLink("#linkLinkedIn", cfg.socialLinks?.linkedin);
  setLink("#linkTikTok", cfg.socialLinks?.tiktok);

  // Start
  tickTimer();
  setInterval(tickTimer, 1000 * 30); // update toutes les 30s (suffisant pour minutes)

  // Splash timing (pour que le logo se voie un minimum)
  const t0 = Date.now();
  window.addEventListener("load", () => {
    const elapsed = Date.now() - t0;
    const remaining = Math.max(0, minSplash - elapsed);
    setTimeout(startApp, remaining);
  });
})();

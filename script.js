async function loadConfig() {
  const res = await fetch("config.json", { cache: "no-store" });
  if (!res.ok) throw new Error("Impossible de charger config.json");
  return await res.json();
}

function setTheme(theme) {
  if (!theme) return;
  if (theme.backgroundGradient) document.documentElement.style.setProperty("--bg", theme.backgroundGradient);
  if (theme.textColor) document.documentElement.style.setProperty("--text", theme.textColor);
  if (theme.mutedTextColor) document.documentElement.style.setProperty("--muted", theme.mutedTextColor);
}

function parseYouTubeId(url) {
  if (!url) return "";
  try {
    const u = new URL(url);
    // youtube.com/watch?v=
    if (u.hostname.includes("youtube.com")) {
      return u.searchParams.get("v") || "";
    }
    // youtu.be/ID
    if (u.hostname.includes("youtu.be")) {
      return u.pathname.replace("/", "");
    }
    return "";
  } catch {
    // si l'utilisateur colle directement un ID
    return url.trim();
  }
}

function daysSince(dateStr) {
  const d = new Date(dateStr + "T00:00:00");
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

function startClock(el) {
  const tick = () => {
    const now = new Date();
    // Format simple FR
    const pad = (n) => String(n).padStart(2, "0");
    const s = `${pad(now.getDate())}/${pad(now.getMonth() + 1)}/${now.getFullYear()} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
    el.textContent = s;
  };
  tick();
  return setInterval(tick, 1000);
}

function showBlock(id, enabled) {
  const el = document.getElementById(id);
  if (!el) return;
  el.hidden = !enabled;
}

function setupModal() {
  const modal = document.getElementById("modal");
  const modalImg = document.getElementById("modalImg");
  const closeBtn = document.getElementById("modalClose");

  const close = () => {
    modal.hidden = true;
    modal.setAttribute("aria-hidden", "true");
    modalImg.src = "";
  };

  closeBtn.addEventListener("click", close);
  modal.addEventListener("click", (e) => {
    if (e.target === modal) close();
  });
  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !modal.hidden) close();
  });

  return {
    open: (src) => {
      modalImg.src = src;
      modal.hidden = false;
      modal.setAttribute("aria-hidden", "false");
    },
    close
  };
}

function runSplash(logoPath) {
  const splash = document.getElementById("splash");
  const splashLogo = document.getElementById("splashLogo");
  splashLogo.src = logoPath;

  // Petit délai pour être sûr que ça se voit (même en cache)
  setTimeout(() => {
    splash.classList.add("fade-out");
    setTimeout(() => splash.remove(), 700);
  }, 700);
}

(async function init() {
  try {
    const cfg = await loadConfig();

    // Theme
    setTheme(cfg.theme);

    // Logos
    const logoPath = cfg.branding?.logoPath || "assets/logo.svg";
    document.getElementById("headerLogo").src = logoPath;

    // Splash
    runSplash(logoPath);

    // Baseline
    document.getElementById("baseline").textContent = cfg.branding?.baseline || "";

    // Counters
    const birthDate = cfg.branding?.birthDate || "1994-10-18";
    document.getElementById("daysSinceBirth").textContent = String(daysSince(birthDate));
    startClock(document.getElementById("liveClock"));

    // Text block
    const textBlock = cfg.blocks?.textBlock;
    showBlock("textBlock", !!textBlock?.enabled);
    if (textBlock?.enabled) {
      document.getElementById("textContent").textContent = textBlock.text || "";
    }

    // Photo gallery
    const gallery = cfg.blocks?.photoGallery;
    showBlock("photoGallery", !!gallery?.enabled);
    const modal = setupModal();
    if (gallery?.enabled) {
      const grid = document.getElementById("galleryGrid");
      grid.innerHTML = "";
      const imgs = Array.isArray(gallery.images) ? gallery.images.slice(0, 4) : [];
      imgs.forEach((src) => {
        const btn = document.createElement("button");
        const img = document.createElement("img");
        img.src = src;
        img.alt = "Photo";
        btn.appendChild(img);
        btn.addEventListener("click", () => modal.open(src));
        grid.appendChild(btn);
      });
    }

    // YouTube
    const yt = cfg.blocks?.youtube;
    showBlock("youtubeBlock", !!yt?.enabled);
    if (yt?.enabled) {
      const id = parseYouTubeId(yt.url);
      const frame = document.getElementById("youtubeFrame");
      frame.src = id ? `https://www.youtube.com/embed/${id}` : "";
    }

    // GIF
    const gif = cfg.blocks?.gif;
    showBlock("gifBlock", !!gif?.enabled);
    if (gif?.enabled) {
      const gifImg = document.getElementById("gifImg");
      gifImg.src = gif.url || "";
      gifImg.alt = gif.alt || "GIF";
    }

    // Footer
    document.getElementById("footerCopyright").textContent = cfg.footer?.copyright || "© 2025 NADAK";
    document.getElementById("fbLink").href = cfg.social?.facebook || "#";
    document.getElementById("igLink").href = cfg.social?.instagram || "#";
    document.getElementById("ttLink").href = cfg.social?.tiktok || "#";

  } catch (err) {
    console.error(err);
    // Affichage minimal en cas de config cassée
    document.body.innerHTML = `<div style="padding:18px;color:#fff;font-family:system-ui">Erreur de chargement du site (config.json). Ouvre la console.</div>`;
  }
})();

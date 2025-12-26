window.SITE_CONFIG = {
  // Splash
  splashMinDurationMs: 900,

  // Timer "Né depuis"
  birthDateISO: "1994-10-18T12:05:00+01:00",

  // Branding
  brandName: "Nadak",
  copyrightYear: 2025,

  // Modules
  modules: {
    photoTextBlock: { enabled: true },
    youtubeBackground: { enabled: true }
  },

  // Contenu bloc (photo + texte)
  photo: {
    src: "./assets/photo.jpg",
    alt: "Photo"
  },

  // Texte :
  // - soit "quoteText" (texte brut + retours ligne via \n ou template string)
  // - soit "quoteHtml" (HTML minimal: <strong>, <em>, <br>)
  //quoteText: `Je ne perds jamais,
  //soit je gagne,
  //soit j'apprends.`,
  quoteHtml: `<em>« Je ne perds jamais,<br>soit je gagne, soit j'apprends. »</em><br><strong>- Nelson Mandela</strong> `,

  // YouTube (lecture cachée déclenchée par bouton footer)
  youtubeUrl: "https://youtu.be/4zejNFhvAGo?si=zWtSohOVeLqZHExA",

  // Réseaux (mettre "" pour cacher)
  socialLinks: {
    facebook: "https://www.facebook.com/nadroj.ikslawok/?locale=fr_FR",
    instagram: "https://instagram.com/nadak_3141",
    linkedin: "https://www.linkedin.com/in/jordan-arnt-kowalski-9142a630a/",
    tiktok: "https://www.tiktok.com/@nadak_3220?_r=1&_t=ZN-92Thxkr60hC"
  }
};

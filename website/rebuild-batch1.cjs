const fs = require('fs');
const path = require('path');

const pagesDir = path.join(__dirname, 'src', 'pages');
const langDir = path.join(pagesDir, '[lang]');
if (!fs.existsSync(langDir)) fs.mkdirSync(langDir, { recursive: true });

const langs = ['en', 'ar', 'fr', 'es', 'pt'];

const homeData = {
  en: { 
    title: "Abrium - Open Source Claude Companion",
    eyebrow: "Local-First Capture",
    heroTitle: "Never lose a Claude artifact again.",
    heroSub: "Abrium silently saves your generated code, diagrams, and SVGs directly to your browser storage. Fast, private, and open-source.",
    addToChrome: "Add to Chrome",
    viewGithub: "View on GitHub",
    trustLabel1: "No tracking", trustLabel2: "No telemetry", trustLabel3: "Local storage only", trustLabel4: "Open source",
    howLabel: "How it works",
    howTitle: "Three steps to secure your work",
    step1n: "1", step1t: "Install", step1b: "Add Abrium to Chrome.",
    step2n: "2", step2t: "Chat", step2b: "Use Claude as usual.",
    step3n: "3", step3t: "Save", step3b: "Artifacts are automatically captured.",
    trustStrip: "Open source & private",
    getIt: "Get it for Chrome",
    feat1t: "Automatic Capture", feat1b: "Silently extracts and saves artifacts as you browse your claude.ai chats.",
    feat2t: "Visual Gallery", feat2b: "Browse, search, and manage all your generated content with filters.",
    feat3t: "Batch Export", feat3b: "Download individual files or export your entire artifact library as a ZIP.",
    feat4t: "100% Private", feat4b: "Zero tracking. Everything is kept inside your local browser storage."
  },
  ar: { 
    title: "أبريوم - رفيق كلود", eyebrow: "التقاط محلي أولاً", heroTitle: "لن تفقد أي قطعة أثرية من كلود بعد الآن.",
    heroSub: "أبريوم يحفظ بصمت الكود والرسوم البيانية و SVG مباشرة في متصفحك. سريع، خاص ومفتوح المصدر.",
    addToChrome: "أضف إلى كروم", viewGithub: "شاهد على جيت هاب",
    trustLabel1: "بدون تتبع", trustLabel2: "بدون جمع بيانات", trustLabel3: "تخزين محلي فقط", trustLabel4: "مفتوح المصدر",
    howLabel: "كيف يعمل", howTitle: "ثلاث خطوات لتأمين عملك",
    step1n: "1", step1t: "تثبيت", step1b: "أضف أبريوم إلى كروم.",
    step2n: "2", step2t: "محادثة", step2b: "استخدم كلود كالمعتاد.",
    step3n: "3", step3t: "حفظ", step3b: "يتم التقاط القطع الأثرية تلقائيًا.",
    trustStrip: "مفتوح المصدر وخاص", getIt: "احصل عليه لكروم",
    feat1t: "التقاط تلقائي", feat1b: "يستخرج ويحفظ القطع الأثرية بصمت.",
    feat2t: "معرض مرئي", feat2b: "تصفح وابحث وقم بإدارة المحتوى الخاص بك.",
    feat3t: "تصدير دفعي", feat3b: "تصدير بصيغة ZIP.",
    feat4t: "خاص 100%", feat4b: "بدون تتبع."
  },
  fr: { 
    title: "Abrium - Compagnon Claude", eyebrow: "Capture Locale", heroTitle: "Ne perdez plus jamais un artefact Claude.",
    heroSub: "Abrium enregistre silencieusement votre code, vos diagrammes et SVG directement dans le navigateur. Rapide, privé et open-source.",
    addToChrome: "Ajouter à Chrome", viewGithub: "Voir sur GitHub",
    trustLabel1: "Aucun suivi", trustLabel2: "Aucune télémétrie", trustLabel3: "Stockage local", trustLabel4: "Open source",
    howLabel: "Comment ça marche", howTitle: "Trois étapes pour sécuriser votre travail",
    step1n: "1", step1t: "Installer", step1b: "Ajoutez Abrium à Chrome.",
    step2n: "2", step2t: "Discuter", step2b: "Utilisez Claude normalement.",
    step3n: "3", step3t: "Sauvegarder", step3b: "Les artefacts sont capturés automatiquement.",
    trustStrip: "Open source et privé", getIt: "Obtenir pour Chrome",
    feat1t: "Capture Automatique", feat1b: "Extrait et enregistre silencieusement.",
    feat2t: "Galerie Visuelle", feat2b: "Parcourez, recherchez et gérez avec des filtres.",
    feat3t: "Exportation par lots", feat3b: "Téléchargez des fichiers ou exportez en ZIP.",
    feat4t: "100% Privé", feat4b: "Aucun suivi."
  },
  es: { 
    title: "Abrium - Compañero de Claude", eyebrow: "Captura Local", heroTitle: "Nunca más pierdas un artefacto de Claude.",
    heroSub: "Abrium guarda silenciosamente tu código, diagramas y SVG directamente en tu navegador. Rápido, privado y de código abierto.",
    addToChrome: "Añadir a Chrome", viewGithub: "Ver en GitHub",
    trustLabel1: "Sin rastreo", trustLabel2: "Sin telemetría", trustLabel3: "Solo almacenamiento local", trustLabel4: "Código abierto",
    howLabel: "Cómo funciona", howTitle: "Tres pasos para asegurar tu trabajo",
    step1n: "1", step1t: "Instalar", step1b: "Añade Abrium a Chrome.",
    step2n: "2", step2t: "Chatear", step2b: "Usa Claude normalmente.",
    step3n: "3", step3t: "Guardar", step3b: "Los artefactos se capturan automáticamente.",
    trustStrip: "Código abierto y privado", getIt: "Consíguelo para Chrome",
    feat1t: "Captura Automática", feat1b: "Extrae y guarda silenciosamente.",
    feat2t: "Galería Visual", feat2b: "Navega, busca y gestiona con filtros.",
    feat3t: "Exportación por lotes", feat3b: "Descarga archivos o exporta como ZIP.",
    feat4t: "100% Privado", feat4b: "Sin rastreo."
  },
  pt: { 
    title: "Abrium - Companheiro Claude", eyebrow: "Captura Local", heroTitle: "Nunca mais perca um artefato do Claude.",
    heroSub: "Abrium salva silenciosamente seu código, diagramas e SVG diretamente no navegador. Rápido, privado e de código aberto.",
    addToChrome: "Adicionar ao Chrome", viewGithub: "Ver no GitHub",
    trustLabel1: "Sem rastreamento", trustLabel2: "Sem telemetria", trustLabel3: "Apenas armazenamento local", trustLabel4: "Código aberto",
    howLabel: "Como funciona", howTitle: "Três passos para garantir seu trabalho",
    step1n: "1", step1t: "Instalar", step1b: "Adicione o Abrium ao Chrome.",
    step2n: "2", step2t: "Conversar", step2b: "Use o Claude normalmente.",
    step3n: "3", step3t: "Salvar", step3b: "Os artefatos são capturados automaticamente.",
    trustStrip: "Código aberto e privado", getIt: "Obter para Chrome",
    feat1t: "Captura Automática", feat1b: "Extrai e salva silenciosamente.",
    feat2t: "Galeria Visual", feat2b: "Navegue, pesquise e gerencie com filtros.",
    feat3t: "Exportação em lote", feat3b: "Baixe arquivos ou exporte como ZIP.",
    feat4t: "100% Privado", feat4b: "Zero rastreamento."
  }
};

const homeHtml = (t, isLangPath) => `
<div style="max-width:1080px; margin:0 auto; padding-block:120px 0">

  <div style="display:flex; flex-direction:row; gap:64px; align-items:center">
    <div style="flex:1; min-width:0; display:flex; flex-direction:column; gap:20px; max-width:720px">
      <span style="font:500 11.5px/1 ui-monospace,Menlo,monospace; letter-spacing:0.12em; text-transform:uppercase; color:var(--accent-text)">${t.eyebrow}</span>
      <h1 style="margin:0; font-size:48px; font-weight:600; line-height:1.1; letter-spacing:-0.025em; text-wrap:balance">${t.heroTitle}</h1>
      <p style="margin:0; font-size:18px; line-height:1.65; color:var(--text-3); text-wrap:pretty; max-width:48ch">${t.heroSub}</p>
      <div style="display:flex; flex-wrap:wrap; gap:10px; padding-top:4px">
        <a href="${isLangPath ? '/${lang}/download' : '/download'}" style="height:48px; display:flex; align-items:center; gap:9px; padding:0 20px; border-radius:8px; background:var(--accent-solid); color:var(--on-accent); font:600 14.5px/1 inherit; cursor:pointer; text-decoration:none">
          <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v12M7 11l5 5 5-5M4 20h16"></path></svg>
          ${t.addToChrome}
        </a>
        <a href="https://github.com/yourusername/abrium" target="_blank" style="height:48px; display:flex; align-items:center; gap:9px; padding:0 18px; border-radius:8px; border:1px solid var(--border); background:var(--surface); color:var(--text); font:600 14.5px/1 inherit; text-decoration:none">
          <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M9 19c-4.3 1.4-4.3-2.5-6-3m12 5v-3.5c0-1 .1-1.4-.5-2 2.8-.3 5.5-1.4 5.5-6a4.6 4.6 0 0 0-1.3-3.2 4.3 4.3 0 0 0-.1-3.2s-1.1-.3-3.5 1.3a12 12 0 0 0-6.2 0C6.5 2.8 5.4 3.1 5.4 3.1a4.3 4.3 0 0 0-.1 3.2A4.6 4.6 0 0 0 4 9.5c0 4.6 2.7 5.7 5.5 6-.4.4-.5.9-.5 1.6V21"></path></svg>
          ${t.viewGithub}
        </a>
      </div>
      <div style="display:flex; flex-wrap:wrap; align-items:center; gap:8px; padding-top:8px">
        ${ [t.trustLabel1, t.trustLabel2, t.trustLabel3, t.trustLabel4].map(x => `
          <span style="display:flex; align-items:center; gap:6px; font:500 12px/1 inherit; color:var(--text-3)">
            <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="var(--accent)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m20 6-11 11-5-5"></path></svg>
            ${x}
          </span>
        `).join('') }
      </div>
    </div>
  </div>

  <div style="display:grid; grid-template-columns:1fr 1fr; gap:14px; padding-block:120px">
    <div style="border:1px solid var(--border); border-radius:8px; background:var(--surface); padding:22px; display:flex; flex-direction:column; gap:11px">
      <span style="width:36px; height:36px; border-radius:8px; border:1px solid var(--accent); display:flex; align-items:center; justify-content:center; background:var(--tint)">
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="var(--accent)" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
      </span>
      <h3 style="margin:0; font:600 16px/1.3 inherit; letter-spacing:-0.01em">${t.feat1t}</h3>
      <p style="margin:0; font-size:13.5px; line-height:1.65; color:var(--text-3); text-wrap:pretty">${t.feat1b}</p>
    </div>
    
    <div style="border:1px solid var(--border); border-radius:8px; background:var(--surface); padding:22px; display:flex; flex-direction:column; gap:11px">
      <span style="width:36px; height:36px; border-radius:8px; border:1px solid var(--accent); display:flex; align-items:center; justify-content:center; background:var(--tint)">
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="var(--accent)" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M4 22h14a2 2 0 0 0 2-2V7.5L14.5 2H6a2 2 0 0 0-2 2v4"></path></svg>
      </span>
      <h3 style="margin:0; font:600 16px/1.3 inherit; letter-spacing:-0.01em">${t.feat2t}</h3>
      <p style="margin:0; font-size:13.5px; line-height:1.65; color:var(--text-3); text-wrap:pretty">${t.feat2b}</p>
    </div>
    
    <div style="border:1px solid var(--border); border-radius:8px; background:var(--surface); padding:22px; display:flex; flex-direction:column; gap:11px">
      <span style="width:36px; height:36px; border-radius:8px; border:1px solid var(--accent); display:flex; align-items:center; justify-content:center; background:var(--tint)">
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="var(--accent)" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"></path></svg>
      </span>
      <h3 style="margin:0; font:600 16px/1.3 inherit; letter-spacing:-0.01em">${t.feat3t}</h3>
      <p style="margin:0; font-size:13.5px; line-height:1.65; color:var(--text-3); text-wrap:pretty">${t.feat3b}</p>
    </div>
    
    <div style="border:1px solid var(--border); border-radius:8px; background:var(--surface); padding:22px; display:flex; flex-direction:column; gap:11px">
      <span style="width:36px; height:36px; border-radius:8px; border:1px solid var(--accent); display:flex; align-items:center; justify-content:center; background:var(--tint)">
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="var(--accent)" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"></path></svg>
      </span>
      <h3 style="margin:0; font:600 16px/1.3 inherit; letter-spacing:-0.01em">${t.feat4t}</h3>
      <p style="margin:0; font-size:13.5px; line-height:1.65; color:var(--text-3); text-wrap:pretty">${t.feat4b}</p>
    </div>
  </div>

  <div style="border-top:1px solid var(--border); padding-block:120px; display:flex; flex-direction:column; gap:26px">
    <div style="display:flex; flex-direction:column; gap:8px; max-width:600px">
      <span style="font:500 11.5px/1 ui-monospace,Menlo,monospace; letter-spacing:0.12em; text-transform:uppercase; color:var(--accent-text)">${t.howLabel}</span>
      <h2 style="margin:0; font-size:32px; font-weight:600; line-height:1.2; letter-spacing:-0.02em">${t.howTitle}</h2>
    </div>
    <div style="display:grid; grid-template-columns:repeat(3, minmax(0, 1fr)); gap:14px">
      <div style="display:flex; flex-direction:column; gap:10px; padding:20px; border:1px solid var(--border-2); border-radius:8px; background:var(--bg-alt)">
        <span style="width:26px; height:26px; border-radius:999px; border:1px solid var(--accent); display:flex; align-items:center; justify-content:center; font:600 12px/1 ui-monospace,Menlo,monospace; color:var(--accent-text)">${t.step1n}</span>
        <span style="font:600 14.5px/1.35 inherit">${t.step1t}</span>
        <span style="font-size:13px; line-height:1.6; color:var(--text-3)">${t.step1b}</span>
      </div>
      <div style="display:flex; flex-direction:column; gap:10px; padding:20px; border:1px solid var(--border-2); border-radius:8px; background:var(--bg-alt)">
        <span style="width:26px; height:26px; border-radius:999px; border:1px solid var(--accent); display:flex; align-items:center; justify-content:center; font:600 12px/1 ui-monospace,Menlo,monospace; color:var(--accent-text)">${t.step2n}</span>
        <span style="font:600 14.5px/1.35 inherit">${t.step2t}</span>
        <span style="font-size:13px; line-height:1.6; color:var(--text-3)">${t.step2b}</span>
      </div>
      <div style="display:flex; flex-direction:column; gap:10px; padding:20px; border:1px solid var(--border-2); border-radius:8px; background:var(--bg-alt)">
        <span style="width:26px; height:26px; border-radius:999px; border:1px solid var(--accent); display:flex; align-items:center; justify-content:center; font:600 12px/1 ui-monospace,Menlo,monospace; color:var(--accent-text)">${t.step3n}</span>
        <span style="font:600 14.5px/1.35 inherit">${t.step3t}</span>
        <span style="font-size:13px; line-height:1.6; color:var(--text-3)">${t.step3b}</span>
      </div>
    </div>
  </div>

  <div style="border:1px solid var(--border); border-radius:8px; background:var(--bg-alt); padding:18px 22px; margin-bottom:120px; display:flex; flex-wrap:wrap; align-items:center; gap:14px; justify-content:space-between">
    <span style="font:500 13px/1.5 inherit; color:var(--text-2)">${t.trustStrip}</span>
    <a href="${isLangPath ? '/${lang}/download' : '/download'}" style="height:40px; display:flex; align-items:center; gap:8px; padding:0 16px; border-radius:7px; border:1px solid var(--accent); color:var(--accent-text); font:600 13px/1 inherit; cursor:pointer; text-decoration:none">
      ${t.getIt}
      <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="m9 6 6 6-6 6"></path></svg>
    </a>
  </div>
</div>
`;

const featData = {
  en: {
    title: "Features", featuresLabel: "Capabilities", featuresTitle: "Everything you need.", featuresSub: "Browse, filter, and export your artifacts.", screenshot: "Mockup",
    f1Title: "Automatic Capture", f1Body: "Silently extracts and saves artifacts as you browse your claude.ai chats. (5 artifact types)", f1b1: "Runs entirely locally", f1b2: "No extra clicks required"
  },
  ar: {
    title: "الميزات", featuresLabel: "القدرات", featuresTitle: "كل ما تحتاجه.", featuresSub: "تصفح وابحث وقم بإدارة المحتوى الخاص بك.", screenshot: "نموذج",
    f1Title: "التقاط تلقائي", f1Body: "يستخرج ويحفظ القطع الأثرية بصمت.", f1b1: "يعمل محلياً", f1b2: "لا يحتاج لنقرات إضافية"
  },
  fr: {
    title: "Fonctionnalités", featuresLabel: "Capacités", featuresTitle: "Tout ce dont vous avez besoin.", featuresSub: "Parcourez, filtrez et exportez vos artefacts.", screenshot: "Aperçu",
    f1Title: "Capture Automatique", f1Body: "Extrait et enregistre silencieusement.", f1b1: "Fonctionne localement", f1b2: "Aucun clic requis"
  },
  es: {
    title: "Características", featuresLabel: "Capacidades", featuresTitle: "Todo lo que necesitas.", featuresSub: "Navega, filtra y exporta tus artefactos.", screenshot: "Maqueta",
    f1Title: "Captura Automática", f1Body: "Extrae y guarda silenciosamente.", f1b1: "Funciona localmente", f1b2: "Sin clics adicionales"
  },
  pt: {
    title: "Recursos", featuresLabel: "Capacidades", featuresTitle: "Tudo o que você precisa.", featuresSub: "Navegue, filtre e exporte seus artefatos.", screenshot: "Maquete",
    f1Title: "Captura Automática", f1Body: "Extrai e salva silenciosamente.", f1b1: "Funciona localmente", f1b2: "Sem cliques adicionais"
  }
};

const featuresHtml = (t) => `
<div style="max-width:1080px; margin:0 auto; padding-block:120px 120px">
  <div style="display:flex; flex-direction:column; gap:12px; max-width:620px; padding-bottom:40px">
    <span style="font:500 11.5px/1 ui-monospace,Menlo,monospace; letter-spacing:0.12em; text-transform:uppercase; color:var(--accent-text)">${t.featuresLabel}</span>
    <h1 style="margin:0; font-size:40px; font-weight:600; line-height:1.15; letter-spacing:-0.025em">${t.featuresTitle}</h1>
    <p style="margin:0; font-size:18px; line-height:1.65; color:var(--text-3); text-wrap:pretty">${t.featuresSub}</p>
  </div>
  <div style="display:flex; flex-direction:column; gap:0">
    <div style="display:flex; flex-direction:row; gap:64px; align-items:flex-start; padding-block:36px; border-top:1px solid var(--border)">
      <div style="flex:1; min-width:0; display:flex; flex-direction:column; gap:12px; max-width:520px">
        <span style="width:38px; height:38px; border-radius:8px; border:1px solid var(--accent); display:flex; align-items:center; justify-content:center; background:var(--tint)">
          <svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="var(--accent)" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
        </span>
        <h2 style="margin:0; font-size:32px; font-weight:600; line-height:1.25; letter-spacing:-0.02em">${t.f1Title}</h2>
        <p style="margin:0; font-size:14.5px; line-height:1.7; color:var(--text-3); text-wrap:pretty">${t.f1Body}</p>
        <div style="display:flex; flex-direction:column; gap:7px; padding-top:4px">
          ${ [t.f1b1, t.f1b2].map(b => `
            <span style="display:flex; gap:9px; align-items:flex-start; font-size:13.5px; line-height:1.6; color:var(--text-2)">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="var(--accent)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex:none; margin-top:4px"><path d="m20 6-11 11-5-5"></path></svg>
              ${b}
            </span>
          `).join('') }
        </div>
      </div>
      <div style="flex:none; width:380px; max-width:100%; height:240px; border:1px solid var(--border); border-radius:10px; background:var(--surface); box-shadow:var(--shadow); overflow:hidden; display:flex; flex-direction:column">
        <div style="height:30px; display:flex; align-items:center; gap:7px; padding:0 11px; border-bottom:1px solid var(--border-2); background:var(--bg-alt)">
          <span style="width:7px; height:7px; border-radius:999px; background:var(--border)"></span>
          <span style="font:500 10.5px/1 ui-monospace,Menlo,monospace; color:var(--muted); letter-spacing:0.06em">Gallery View</span>
        </div>
        <div style="flex:1; display:flex; align-items:center; justify-content:center; gap:9px; color:var(--muted)">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 5h18v14H3zM3 15l5-4 4 3 3-2 6 4"></path></svg>
          <span style="font:400 12px/1 ui-monospace,Menlo,monospace">380 × 240 · ${t.screenshot}</span>
        </div>
      </div>
    </div>
  </div>
</div>
`;

const privData = {
  en: { title: "Privacy Policy", date: "Last updated: Aug 2026", h1: "Your data is yours.", p: "Abrium operates entirely locally. We do not track, collect, or transmit any of your conversation data." },
  ar: { title: "سياسة الخصوصية", date: "آخر تحديث: أغسطس 2026", h1: "بياناتك لك.", p: "أبريوم يعمل محلياً بالكامل. نحن لا نتتبع أو نجمع أو ننقل أي بيانات محادثة." },
  fr: { title: "Politique de confidentialité", date: "Dernière mise à jour : Août 2026", h1: "Vos données vous appartiennent.", p: "Abrium fonctionne entièrement localement. Nous ne suivons, collectons ou transmettons aucune donnée." },
  es: { title: "Política de Privacidad", date: "Última actualización: Ago 2026", h1: "Tus datos son tuyos.", p: "Abrium opera localmente. No rastreamos, recopilamos ni transmitimos datos de conversación." },
  pt: { title: "Política de Privacidade", date: "Última atualização: Ago 2026", h1: "Seus dados são seus.", p: "O Abrium opera localmente. Não rastreamos, coletamos ou transmitimos dados." }
};

const privacyHtml = (t) => `
<div style="max-width:680px; margin:0 auto; padding-block:120px 120px">
  <div style="display:flex; flex-direction:column; gap:10px; padding-bottom:34px; border-bottom:1px solid var(--border)">
    <h1 style="margin:0; font-size:40px; font-weight:600; line-height:1.15; letter-spacing:-0.025em">${t.title}</h1>
    <span style="font:400 12.5px/1 ui-monospace,Menlo,monospace; color:var(--muted)">${t.date}</span>
  </div>
  <div style="display:flex; flex-direction:column; gap:30px; padding-top:30px">
    <div style="display:flex; flex-direction:column; gap:12px">
      <h2 style="margin:0; font:600 17px/1.35 inherit; letter-spacing:-0.01em">${t.h1}</h2>
      <p style="margin:0; font-size:15px; line-height:1.8; color:var(--text-3); text-wrap:pretty">${t.p}</p>
    </div>
  </div>
</div>
`;

// EN Generates root
fs.writeFileSync(path.join(pagesDir, 'index.astro'), `---
import Layout from '../layouts/Layout.astro';
---
<Layout title="${homeData.en.title}" description="${homeData.en.title}">
  ${homeHtml(homeData.en, false)}
</Layout>`);

fs.writeFileSync(path.join(pagesDir, 'features.astro'), `---
import Layout from '../layouts/Layout.astro';
---
<Layout title="${featData.en.title}" description="${featData.en.title}">
  ${featuresHtml(featData.en)}
</Layout>`);

fs.writeFileSync(path.join(pagesDir, 'privacy.astro'), `---
import Layout from '../layouts/Layout.astro';
---
<Layout title="${privData.en.title}" description="${privData.en.title}">
  ${privacyHtml(privData.en)}
</Layout>`);

// Other langs generate in [lang] dynamically
const buildLoc = (dataObj, htmlFn) => {
  const trans = {};
  for (const l of ['ar', 'fr', 'es', 'pt']) {
    trans[l] = { title: dataObj[l].title, html: htmlFn(dataObj[l], true) };
  }
  return JSON.stringify(trans);
};

const homeLocContent = `---
import Layout from '../../layouts/Layout.astro';
export function getStaticPaths() { return [ { params: { lang: 'ar' } }, { params: { lang: 'fr' } }, { params: { lang: 'es' } }, { params: { lang: 'pt' } } ]; }
const { lang } = Astro.params;
const translations = ${buildLoc(homeData, homeHtml)};
const t = translations[lang];
---
<Layout title={t.title} description={t.title}>
  <div set:html={t.html} />
</Layout>`;
fs.writeFileSync(path.join(langDir, 'index.astro'), homeLocContent);

const featLocContent = `---
import Layout from '../../layouts/Layout.astro';
export function getStaticPaths() { return [ { params: { lang: 'ar' } }, { params: { lang: 'fr' } }, { params: { lang: 'es' } }, { params: { lang: 'pt' } } ]; }
const { lang } = Astro.params;
const translations = ${buildLoc(featData, featuresHtml)};
const t = translations[lang];
---
<Layout title={t.title} description={t.title}>
  <div set:html={t.html} />
</Layout>`;
fs.writeFileSync(path.join(langDir, 'features.astro'), featLocContent);

const privLocContent = `---
import Layout from '../../layouts/Layout.astro';
export function getStaticPaths() { return [ { params: { lang: 'ar' } }, { params: { lang: 'fr' } }, { params: { lang: 'es' } }, { params: { lang: 'pt' } } ]; }
const { lang } = Astro.params;
const translations = ${buildLoc(privData, privacyHtml)};
const t = translations[lang];
---
<Layout title={t.title} description={t.title}>
  <div set:html={t.html} />
</Layout>`;
fs.writeFileSync(path.join(langDir, 'privacy.astro'), privLocContent);

console.log('Batch 1 rebuilt successfully with exact structures.');

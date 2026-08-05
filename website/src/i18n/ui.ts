export const EN = {
  addToChrome: "Add to Chrome", viewGithub: "View on GitHub", getIt: "Get Abrium",
  eyebrow: "Chrome extension · v0.1.0",
  heroTitle: "Never lose a<br class=\"hero-break\" />Claude Artifact again.",
  heroSub: "Abrium quietly catalogs every artifact you generate on claude.ai — code, documents, HTML, SVG — and keeps them searchable on your own machine. No account, no cloud, no tracking.",
  sidePanel: "Side panel", searchPh: "Search the Vault", screenshot: "Screenshot",
  howLabel: "How it works", howTitle: "Three steps, then it disappears into the background.",
  trustStrip: "Free · Open source · Local-only · No tracking",
  featuresLabel: "Features", featuresTitle: "Everything the Vault does.",
  featuresSub: "Five areas of work, all running inside your browser. Nothing leaves the machine you are reading this on.",
  faqLabel: "FAQ", faqTitle: "Questions people ask first.",
  faqMore: "Something not covered here?", contactUs: "Contact",
  dlTitle: "Install Abrium", dlSub: "One click from the Chrome Web Store. Listing is under review — the button below is a placeholder until it goes live.",
  comingSoon: "Coming soon",
  changelogLabel: "Changelog", changelogTitle: "What changed, and when.",
  contactTitle: "Get in touch", contactSub: "Two ways to reach the project. Bug reports are the most useful thing you can send.",
  cookieTitle: "Cookie preferences",
  cookieBody: "This website uses a single cookie to remember your language and theme. It sets nothing else — no analytics, no advertising, no third-party scripts. The extension itself uses no cookies at all and never contacts a server.",
  currentStatus: "Current status", cookieNote: "Your choice is stored locally and can be changed on this page at any time.",
  acceptAll: "Accept all", rejectAll: "Reject all",
  bannerText: "Abrium uses one preference cookie for language and theme. No analytics, ever.",
  nfTitle: "This page isn't in the Vault.", nfBody: "The link may be outdated, or the page moved. Everything else is still where you left it.",
  backHome: "Back to home",
  footerTag: "A local-first catalog for Claude Artifacts. Free and open source.",
  nav: { home: "Home", features: "Features", faq: "FAQ", download: "Download", changelog: "Changelog" },
  footProduct: "Product", footLegal: "Legal",
  footerCopyright: "© 2026 Abrium · Open source & private",
  linkPrivacy: "Privacy", linkTerms: "Terms", linkContact: "Contact", linkCookies: "Cookie preferences", linkSystem: "Design system",
  trust: ["Free forever", "Open source", "Local-only", "No tracking"],
  homeFeatures: [
    { i: "capture", title: "Auto-capture", body: "Every artifact you open in a conversation is saved the moment it renders — including each revision, so earlier versions stay recoverable." },
    { i: "search", title: "Gallery & search", body: "A side panel that lists everything by type, conversation and date. Full-text search reaches into the artifact body, not just the title." },
    { i: "zip", title: "Batch export", body: "Select any number of artifacts and download them as a folder-structured ZIP, with correct file extensions per type." },
    { i: "globe", title: "Five languages, real RTL", body: "English, Arabic, French, Spanish and Portuguese. Arabic mirrors the entire layout — navigation, icons and reading order." }
  ],
  steps: [
    { n: "1", title: "Install and pin", body: "Add Abrium from the Chrome Web Store and pin it to the toolbar. No sign-up screen — there is no account." },
    { n: "2", title: "Work as usual", body: "Keep using claude.ai. When an artifact appears in Code view, Abrium files it away with its title, type and source conversation." },
    { n: "3", title: "Find it later", body: "Open the side panel, search or filter, then preview, copy, pin or export what you need." }
  ],
  featureSections: [
    { i: "capture", title: "Capture", frame: "capture · side panel", body: "Abrium watches the artifact surface of the page and stores each one locally as it appears. Revisions are versioned rather than overwritten, so a rewrite never costs you the earlier draft.", bullets: ["Code, Markdown, HTML, SVG and React artifacts", "Every revision kept as a numbered version", "Works retroactively on conversations you reopen"] },
    { i: "search", title: "Organize", frame: "gallery · filters", body: "The side panel is the home for everything captured. Filter by type, pin the things you return to, and search across titles, conversation names and artifact contents.", bullets: ["Type filters and a pinned collection", "Full-text search across artifact bodies", "Sorted by capture time, newest first"] },
    { i: "zip", title: "Export", frame: "batch selection", body: "Single artifacts download with the correct extension. Multi-select turns the panel into a batch tool with a bottom action bar for ZIP export or bulk pinning.", bullets: ["One-click download or copy to clipboard", "ZIP export with per-type file extensions", "Batch pin and batch delete"] },
    { i: "lock", title: "Privacy", frame: "storage · IndexedDB", body: "Everything lives in your browser's local storage. There is no server to send data to, no analytics SDK, and no network request the extension makes on your behalf.", bullets: ["Local IndexedDB storage only", "No accounts, no telemetry, no ads", "Source code public and auditable"] },
    { i: "globe", title: "Languages", frame: "interface · العربية", body: "The interface ships in five languages. Arabic is a full right-to-left build: the panel, the toolbars, the icons with directional meaning and the reading order all mirror.", bullets: ["EN · AR · FR · ES · PT", "Complete RTL mirroring, not flipped text", "Follows the browser language by default"] }
  ],
  faqs: [
    { q: "Is Abrium free?", a: "Yes — free, with no paid tier and no upsell. The source is public, and the project is supported by voluntary donations only." },
    { q: "Does it read my conversations?", a: "No. Abrium only looks at the artifact panel of the page — the rendered artifact and its title. Message content is never parsed, stored or transmitted." },
    { q: "Why does it need Code view rather than Preview?", a: "Preview mode renders an artifact inside a sandboxed frame that extensions cannot read. Code view exposes the raw source in the page itself, which is what Abrium files away — so an artifact left in Preview may not be captured until you switch." },
    { q: "Is my data ever sent anywhere?", a: "Never. The extension makes no network requests. Everything is written to your browser's local IndexedDB and stays on your device, including when you export a ZIP." },
    { q: "What languages are supported?", a: "English, Arabic, French, Spanish and Portuguese. Arabic runs as a fully mirrored right-to-left interface rather than translated text in a left-to-right layout." },
    { q: "What happens if I uninstall it?", a: "Chrome deletes the local database with the extension. Export anything you want to keep before removing it — a full ZIP export takes a few seconds." }
  ],
  installSteps: [
    { n: "1", title: "Add the extension", body: "Open the Chrome Web Store listing and choose Add to Chrome. No permissions beyond claude.ai are requested." },
    { n: "2", title: "Pin it to the toolbar", body: "Click the puzzle-piece icon and pin Abrium so the popup is one click away." },
    { n: "3", title: "Open a conversation", body: "Visit claude.ai, open any artifact in Code view, and it appears in the Vault immediately." }
  ],
  releases: [
    { version: "v0.1.0", date: "August 2, 2026", tag: "Initial release", items: ["Auto-capture for Code, Markdown, HTML, SVG and React artifacts", "Side panel gallery with type filters, search and pinning", "Artifact detail view with preview, copy and download", "Batch selection with ZIP export", "Five interface languages with full RTL support for Arabic", "Local IndexedDB storage — no network access of any kind"] }
  ],
  contactCards: [
    { i: "github", title: "Report an issue", body: "Bugs, missing captures or feature requests belong on the issue tracker. Include your Chrome version and the artifact type if something failed to capture.", cta: "Open GitHub issues", placeholder: false },
    { i: "patreon", title: "Support the project", body: "Abrium stays free. If it saves you time, a small recurring contribution funds maintenance and the Chrome Web Store listing fee.", cta: "Patreon page", placeholder: false }
  ],
  privacy: {
    title: "Privacy policy", updated: "Last updated · August 2, 2026",
    sections: [
      { h: "The short version", p: ["Abrium does not collect, transmit or sell any data. The extension has no server component. Everything it stores is written to your own browser and never leaves it.", "This website sets one cookie to remember your language and theme choices. Nothing else is tracked."] },
      { h: "What the extension stores", p: ["When you open an artifact on claude.ai in Code view, Abrium saves the artifact's contents, its title, its type, the name of the source conversation and the time of capture. This record is written to IndexedDB inside your browser profile.", "Message text outside the artifact panel is not read. Your account details, email address and conversation history are not accessible to the extension and are never requested."] },
      { h: "What the extension sends", p: ["Nothing. Abrium makes no outbound network requests. There is no analytics SDK, no crash reporter, no advertising identifier and no remote configuration. You can verify this by reading the source or by watching the network panel while the extension runs."] },
      { h: "Website analytics", p: ["abrium.onl serves static pages. There is no analytics script, no tag manager, and no third-party embed. Server access logs are kept by the host for a short retention period for security purposes and contain no identifiers we control or read."] },
      { h: "Cookies", p: ["A single first-party preference cookie stores your selected language and colour theme so the site looks the same on your next visit. You can reject it on the cookie preferences page; the site continues to work, and will simply default to your browser's language."] },
      { h: "Your data, your control", p: ["Because storage is local, deletion is local too. Remove individual artifacts from the side panel, clear the whole vault from the extension settings, or uninstall the extension to delete the database entirely.", "We cannot delete data on your behalf, because we never receive any."] },
      { h: "Changes to this policy", p: ["If this policy changes, the revision date above will change with it and the update will be listed in the public changelog. Material changes will be announced on the repository."] },
      { h: "Contact", p: ["Questions about privacy can be raised as an issue on the public repository, where the answer will be visible to everyone who has the same question."] }
    ]
  },
  terms: {
    title: "Terms of use", updated: "Last updated · August 2, 2026",
    sections: [
      { h: "Acceptance", p: ["By installing the Abrium extension or using abrium.onl, you agree to these terms. If you do not agree, do not install the extension."] },
      { h: "Licence", p: ["Abrium is released as open source software. You may use, study, modify and redistribute it under the terms of the licence file published in the repository. That licence governs the code; these terms govern the hosted website and the distributed build."] },
      { h: "No warranty", p: ["The extension is provided as is, without warranty of any kind, express or implied. It stores data locally in your browser, and local storage can be cleared by the browser, by other software or by you. Keep exports of anything you cannot afford to lose.", "The maintainers are not liable for lost artifacts, lost work or any indirect damages arising from use of the software."] },
      { h: "Acceptable use", p: ["Use Abrium only with content you have the right to store. You are responsible for what you capture and export, and for complying with the terms of any service you capture from, including Anthropic's terms for claude.ai."] },
      { h: "Relationship to Anthropic", p: ["Abrium is an independent project. It is not affiliated with, endorsed by or sponsored by Anthropic. Claude and claude.ai are trademarks of their respective owner and are used here only to describe compatibility."] },
      { h: "Availability", p: ["The website and the Chrome Web Store listing may change or become unavailable at any time. Because the extension runs entirely locally, an outage of either does not affect an installed copy."] },
      { h: "Changes to these terms", p: ["Updated terms take effect when published, with the revision date above changed accordingly. Continued use after publication constitutes acceptance."] }
    ]
  }
};


export const AR = {
  addToChrome: "أضِف إلى كروم", viewGithub: "على GitHub", getIt: "احصل على أبريوم",
  eyebrow: "إضافة كروم · الإصدار 0.1.0",
  heroTitle: "لا تفقد أي Artifact من كلود بعد اليوم.",
  heroSub: "يفهرس أبريوم بهدوء كل Artifact تُنشئه على claude.ai — شيفرة، مستندات، HTML، SVG — ويبقيه قابلاً للبحث على جهازك وحده. بلا حساب، بلا سحابة، بلا تتبّع.",
  sidePanel: "اللوحة الجانبية", searchPh: "ابحث في الخزنة", screenshot: "لقطة شاشة",
  howLabel: "كيف يعمل", howTitle: "ثلاث خطوات، ثم يختفي في الخلفية.",
  trustStrip: "مجاني · مفتوح المصدر · محلي بالكامل · بلا تتبّع",
  featuresLabel: "المزايا", featuresTitle: "كل ما تفعله الخزنة.",
  featuresSub: "خمسة مجالات عمل، كلها داخل متصفحك. لا شيء يغادر الجهاز الذي تقرأ عليه الآن.",
  faqLabel: "الأسئلة الشائعة", faqTitle: "أول ما يسأل عنه الناس.",
  faqMore: "سؤال لم نُجب عنه؟", contactUs: "تواصل معنا",
  dlTitle: "ثبّت أبريوم", dlSub: "نقرة واحدة من متجر كروم. القائمة قيد المراجعة — الزر أدناه مؤقت حتى يصبح متاحاً.",
  comingSoon: "قريباً",
  changelogLabel: "سجل التغييرات", changelogTitle: "ما الذي تغيّر، ومتى.",
  contactTitle: "تواصل معنا", contactSub: "طريقتان للوصول إلى المشروع. تقارير الأخطاء هي أنفع ما يمكنك إرساله.",
  cookieTitle: "تفضيلات الكوكيز",
  cookieBody: "يستخدم هذا الموقع ملف تعريف ارتباط واحداً لتذكّر لغتك ومظهرك. لا شيء غير ذلك — لا تحليلات، لا إعلانات، ولا نصوص من طرف ثالث. أما الإضافة نفسها فلا تستخدم أي كوكيز ولا تتصل بأي خادم.",
  currentStatus: "الحالة الحالية", cookieNote: "يُحفظ اختيارك محلياً ويمكنك تغييره من هذه الصفحة في أي وقت.",
  acceptAll: "قبول الكل", rejectAll: "رفض الكل",
  bannerText: "يستخدم أبريوم ملف تفضيلات واحداً للغة والمظهر. بلا تحليلات، أبداً.",
  nfTitle: "هذه الصفحة ليست في الخزنة.", nfBody: "قد يكون الرابط قديماً أو انتقلت الصفحة. كل ما عداها ما زال في مكانه.",
  backHome: "العودة للرئيسية",
  footerTag: "فهرس محلي لـ Claude Artifacts. مجاني ومفتوح المصدر.",
  nav: { home: "الرئيسية", features: "المزايا", faq: "الأسئلة", download: "التحميل", changelog: "السجل" },
  footProduct: "المنتج", footLegal: "قانوني",
  footerCopyright: "© 2026 Abrium · مفتوح المصدر وخاص",
  linkPrivacy: "الخصوصية", linkTerms: "الشروط", linkContact: "اتصل بنا", linkCookies: "تفضيلات الكوكيز", linkSystem: "نظام التصميم",
  trust: ["مجاني للأبد", "مفتوح المصدر", "محلي بالكامل", "بلا تتبّع"],
  homeFeatures: [
    { i: "capture", title: "التقاط تلقائي", body: "يُحفظ كل Artifact تفتحه في المحادثة لحظة ظهوره — مع كل مراجعة، لتبقى النسخ السابقة قابلة للاسترجاع." },
    { i: "search", title: "معرض وبحث", body: "لوحة جانبية تعرض كل شيء حسب النوع والمحادثة والتاريخ. البحث يصل إلى متن الـ Artifact لا إلى عنوانه فقط." },
    { i: "zip", title: "تصدير جماعي", body: "حدّد أي عدد من Artifacts ونزّلها كملف ZIP منظّم بمجلدات وامتدادات صحيحة لكل نوع." },
    { i: "globe", title: "خمس لغات ودعم RTL", body: "الإنجليزية والعربية والفرنسية والإسبانية والبرتغالية. العربية تعكس التخطيط بالكامل — التنقّل والأيقونات وترتيب القراءة." }
  ],
  steps: [
    { n: "١", title: "ثبّت وثبّت الأيقونة", body: "أضف أبريوم من متجر كروم وثبّته في الشريط. لا شاشة تسجيل — لا يوجد حساب أصلاً." },
    { n: "٢", title: "اعمل كالمعتاد", body: "تابع استخدام claude.ai. حين يظهر Artifact في عرض الشيفرة، يحفظه أبريوم بعنوانه ونوعه ومحادثته." },
    { n: "٣", title: "جده لاحقاً", body: "افتح اللوحة الجانبية، ابحث أو رشّح، ثم عاين أو انسخ أو ثبّت أو صدّر ما تحتاج." }
  ],
  featureSections: [
    { i: "capture", title: "الالتقاط", frame: "الالتقاط · اللوحة", body: "يراقب أبريوم مساحة الـ Artifact في الصفحة ويخزّن كلاً منها محلياً فور ظهوره. المراجعات تُحفظ كنسخ مرقّمة بدل استبدالها، فلا تكلّفك إعادة الكتابة المسوّدة الأولى.", bullets: ["Artifacts من نوع شيفرة وMarkdown وHTML وSVG وReact", "كل مراجعة تُحفظ كنسخة مرقّمة", "يعمل أثرياً على المحادثات التي تعيد فتحها"] },
    { i: "search", title: "التنظيم", frame: "المعرض · المرشّحات", body: "اللوحة الجانبية هي بيت كل ما التُقط. رشّح حسب النوع، ثبّت ما تعود إليه، وابحث في العناوين وأسماء المحادثات ومتون Artifacts.", bullets: ["مرشّحات حسب النوع ومجموعة مثبّتة", "بحث نصي كامل داخل متون Artifacts", "مرتّبة حسب وقت الالتقاط، الأحدث أولاً"] },
    { i: "zip", title: "التصدير", frame: "التحديد الجماعي", body: "الـ Artifact المفرد يُنزَّل بامتداده الصحيح. التحديد المتعدد يحوّل اللوحة إلى أداة جماعية بشريط إجراءات سفلي لتصدير ZIP أو التثبيت الجماعي.", bullets: ["تنزيل بنقرة أو نسخ إلى الحافظة", "تصدير ZIP بامتدادات حسب النوع", "تثبيت وحذف جماعيان"] },
    { i: "lock", title: "الخصوصية", frame: "التخزين · IndexedDB", body: "كل شيء يعيش في تخزين متصفحك المحلي. لا خادم تُرسل إليه البيانات، ولا أدوات تحليل، ولا أي طلب شبكة تجريه الإضافة نيابةً عنك.", bullets: ["تخزين محلي في IndexedDB فقط", "بلا حسابات أو قياسات أو إعلانات", "شيفرة مصدرية علنية قابلة للتدقيق"] },
    { i: "globe", title: "اللغات", frame: "الواجهة · العربية", body: "تتوفر الواجهة بخمس لغات. العربية نسخة كاملة من اليمين إلى اليسار: اللوحة والأشرطة والأيقونات ذات الاتجاه وترتيب القراءة كلها معكوسة.", bullets: ["EN · AR · FR · ES · PT", "عكس كامل للتخطيط لا مجرد قلب للنص", "يتبع لغة المتصفح افتراضياً"] }
  ],
  faqs: [
    { q: "هل أبريوم مجاني؟", a: "نعم — مجاني، بلا خطة مدفوعة ولا ترقيات. الشيفرة علنية والمشروع مدعوم بالتبرعات الطوعية فقط." },
    { q: "هل يقرأ محادثاتي؟", a: "لا. ينظر أبريوم إلى لوحة الـ Artifact وحدها — الـ Artifact المعروض وعنوانه. محتوى الرسائل لا يُحلَّل ولا يُخزَّن ولا يُرسَل." },
    { q: "لماذا يحتاج عرض الشيفرة بدل المعاينة؟", a: "تعرض المعاينة الـ Artifact داخل إطار معزول لا تستطيع الإضافات قراءته. أما عرض الشيفرة فيُظهر المصدر داخل الصفحة نفسها، وهو ما يحفظه أبريوم — لذا قد لا يُلتقط Artifact تُرك في وضع المعاينة حتى تبدّل العرض." },
    { q: "هل تُرسل بياناتي إلى أي مكان؟", a: "أبداً. لا تجري الإضافة أي طلب شبكة. كل شيء يُكتب في IndexedDB المحلي ويبقى على جهازك، حتى عند تصدير ملف ZIP." },
    { q: "ما اللغات المدعومة؟", a: "الإنجليزية والعربية والفرنسية والإسبانية والبرتغالية. العربية واجهة معكوسة بالكامل من اليمين إلى اليسار، لا نص مترجم داخل تخطيط لاتيني." },
    { q: "ماذا يحدث إن أزلت الإضافة؟", a: "يحذف كروم قاعدة البيانات المحلية مع الإضافة. صدّر ما تريد الاحتفاظ به قبل الإزالة — تصدير ZIP كامل يستغرق ثوانٍ." }
  ],
  installSteps: [
    { n: "١", title: "أضف الإضافة", body: "افتح صفحة المتجر واختر «أضف إلى كروم». لا أذونات مطلوبة خارج claude.ai." },
    { n: "٢", title: "ثبّتها في الشريط", body: "اضغط أيقونة القطعة وثبّت أبريوم لتكون النافذة على بُعد نقرة." },
    { n: "٣", title: "افتح محادثة", body: "ادخل claude.ai، افتح أي Artifact في عرض الشيفرة، وسيظهر في الخزنة فوراً." }
  ],
  releases: [
    { version: "v0.1.0", date: "٢ أغسطس ٢٠٢٦", tag: "الإصدار الأول", items: ["التقاط تلقائي لـ Artifacts من نوع شيفرة وMarkdown وHTML وSVG وReact", "معرض في اللوحة الجانبية مع مرشّحات وبحث وتثبيت", "عرض تفصيلي للـ Artifact مع معاينة ونسخ وتنزيل", "تحديد جماعي مع تصدير ZIP", "خمس لغات للواجهة مع دعم كامل للعربية", "تخزين محلي في IndexedDB — بلا أي اتصال بالشبكة"] }
  ],
  contactCards: [
    { i: "github", title: "أبلغ عن مشكلة", body: "الأخطاء والالتقاطات الناقصة وطلبات المزايا مكانها متتبّع المشكلات. أرفق إصدار كروم ونوع الـ Artifact إن فشل الالتقاط.", cta: "افتح صفحة المشكلات", placeholder: false },
    { i: "patreon", title: "ادعم المشروع", body: "سيبقى أبريوم مجانياً. إن وفّر عليك وقتاً، فمساهمة صغيرة متكرّرة تموّل الصيانة ورسوم المتجر.", cta: "صفحة Patreon", placeholder: false }
  ],
  privacy: {
    title: "سياسة الخصوصية", updated: "آخر تحديث · ٢ أغسطس ٢٠٢٦",
    sections: [
      { h: "باختصار", p: ["لا يجمع أبريوم أي بيانات ولا يرسلها ولا يبيعها. لا يوجد للإضافة أي مكوّن خادم. كل ما تخزّنه يُكتب في متصفحك ولا يغادره.", "يضع هذا الموقع ملف تعريف ارتباط واحداً لتذكّر اللغة والمظهر. لا شيء آخر يُتتبَّع."] },
      { h: "ما الذي تخزّنه الإضافة", p: ["حين تفتح Artifact على claude.ai في عرض الشيفرة، يحفظ أبريوم محتواه وعنوانه ونوعه واسم المحادثة المصدر ووقت الالتقاط. يُكتب هذا السجل في IndexedDB داخل ملف متصفحك.", "لا يُقرأ نص الرسائل خارج لوحة الـ Artifact. تفاصيل حسابك وبريدك وسجل محادثاتك غير متاحة للإضافة ولا تُطلب أبداً."] },
      { h: "ما الذي ترسله الإضافة", p: ["لا شيء. لا يجري أبريوم أي طلب شبكة صادر. لا أدوات تحليل، ولا مبلّغ أعطال، ولا معرّف إعلاني، ولا إعدادات عن بُعد. يمكنك التحقق بقراءة المصدر أو بمراقبة لوحة الشبكة أثناء التشغيل."] },
      { h: "تحليلات الموقع", p: ["يقدّم abrium.onl صفحات ثابتة. لا نص تحليلات ولا مدير وسوم ولا تضمين من طرف ثالث. يحتفظ المستضيف بسجلات وصول لفترة قصيرة لأغراض أمنية، ولا تتضمّن معرّفات نتحكّم بها أو نقرأها."] },
      { h: "الكوكيز", p: ["ملف تفضيلات واحد من الطرف الأول يخزّن لغتك ومظهرك ليبدو الموقع كما تركته في زيارتك القادمة. يمكنك رفضه من صفحة التفضيلات؛ سيظل الموقع يعمل معتمداً على لغة المتصفح."] },
      { h: "بياناتك بين يديك", p: ["لأن التخزين محلي، فالحذف محلي أيضاً. احذف Artifacts مفردة من اللوحة، أو امسح الخزنة كلها من الإعدادات، أو أزل الإضافة لحذف قاعدة البيانات بالكامل.", "لا يمكننا حذف بياناتك نيابةً عنك، لأننا لا نستلم منها شيئاً."] },
      { h: "تغييرات السياسة", p: ["إن تغيّرت هذه السياسة، سيتغيّر تاريخ المراجعة أعلاه وسيُدرج التحديث في سجل التغييرات العلني. وتُعلن التغييرات الجوهرية في المستودع."] },
      { h: "التواصل", p: ["أسئلة الخصوصية يمكن طرحها كمشكلة في المستودع العلني، حيث تكون الإجابة ظاهرة لكل من لديه السؤال نفسه."] }
    ]
  },
  terms: {
    title: "شروط الاستخدام", updated: "آخر تحديث · ٢ أغسطس ٢٠٢٦",
    sections: [
      { h: "القبول", p: ["بتثبيت إضافة أبريوم أو استخدام abrium.onl فإنك توافق على هذه الشروط. إن لم توافق فلا تثبّت الإضافة."] },
      { h: "الترخيص", p: ["أبريوم برمجية مفتوحة المصدر. يمكنك استخدامها ودراستها وتعديلها وإعادة توزيعها وفق ملف الترخيص المنشور في المستودع. ذلك الترخيص يحكم الشيفرة، وهذه الشروط تحكم الموقع والنسخة الموزّعة."] },
      { h: "بلا ضمان", p: ["تُقدَّم الإضافة كما هي، بلا ضمان من أي نوع. تخزّن البيانات محلياً في متصفحك، والتخزين المحلي قابل للمسح من المتصفح أو من برمجيات أخرى أو منك. احتفظ بنسخ مصدّرة لما لا تحتمل فقدانه.", "لا يتحمّل القائمون على المشروع مسؤولية فقدان Artifacts أو العمل أو أي أضرار غير مباشرة."] },
      { h: "الاستخدام المقبول", p: ["استخدم أبريوم مع محتوى تملك حق تخزينه. أنت مسؤول عمّا تلتقطه وتصدّره وعن الالتزام بشروط أي خدمة تلتقط منها، بما فيها شروط Anthropic لـ claude.ai."] },
      { h: "العلاقة بـ Anthropic", p: ["أبريوم مشروع مستقل، غير تابع لـ Anthropic ولا معتمد منها ولا برعايتها. Claude وclaude.ai علامتان تجاريتان لمالكهما، وتُذكران هنا لوصف التوافق فقط."] },
      { h: "التوفّر", p: ["قد يتغيّر الموقع أو صفحة المتجر أو يتوقفان في أي وقت. ولأن الإضافة تعمل محلياً بالكامل، فتعطّل أيٍّ منهما لا يؤثر على نسخة مثبّتة."] },
      { h: "تغيير الشروط", p: ["تسري الشروط المحدّثة عند نشرها مع تغيير تاريخ المراجعة أعلاه. ويُعد الاستمرار في الاستخدام بعد النشر قبولاً بها."] }
    ]
  }
};


export const FR = {
  addToChrome: "Ajouter à Chrome", viewGithub: "Voir sur GitHub", getIt: "Obtenir Abrium",
  eyebrow: "Extension Chrome · v0.1.0",
  heroTitle: "Ne perdez plus jamais un Artifact de Claude.",
  heroSub: "Abrium catalogue discrètement chaque artifact généré sur claude.ai — code, documents, HTML, SVG — et les garde consultables sur votre machine. Sans compte, sans cloud, sans suivi.",
  trustStrip: "Gratuit · Open source · 100 % local · Sans suivi",
  nav: { home: "Accueil", features: "Fonctions", faq: "FAQ", download: "Télécharger", changelog: "Journal" },
  trust: ["Gratuit", "Open source", "100 % local", "Sans suivi"],
  acceptAll: "Tout accepter", rejectAll: "Tout refuser",
  footerTag: "Un catalogue local pour les Artifacts de Claude. Gratuit et open source.",
  sidePanel: "Panneau latéral", searchPh: "Rechercher dans le Coffre", screenshot: "Capture d'écran",
  howLabel: "Comment ça marche", howTitle: "Trois étapes, puis il disparaît en arrière-plan.",
  featuresLabel: "Fonctionnalités", featuresTitle: "Tout ce que fait le Coffre.",
  featuresSub: "Cinq espaces de travail, tous exécutés dans votre navigateur. Rien ne quitte la machine sur laquelle vous lisez ceci.",
  faqLabel: "FAQ", faqTitle: "Les questions qu'on pose en premier.",
  faqMore: "Un point non abordé ici ?", contactUs: "Contact",
  dlTitle: "Installer Abrium", dlSub: "En un clic depuis le Chrome Web Store. La fiche est en cours d'examen — le bouton ci-dessous est temporaire jusqu'à la mise en ligne.",
  comingSoon: "Bientôt disponible",
  changelogLabel: "Journal des modifications", changelogTitle: "Ce qui a changé, et quand.",
  contactTitle: "Nous contacter", contactSub: "Deux façons de joindre le projet. Les signalements de bugs sont ce que vous pouvez envoyer de plus utile.",
  cookieTitle: "Préférences de cookies",
  cookieBody: "Ce site utilise un seul cookie pour mémoriser votre langue et votre thème. Rien d'autre n'est défini — ni analyses, ni publicité, ni scripts tiers. L'extension elle-même n'utilise aucun cookie et ne contacte jamais de serveur.",
  currentStatus: "Statut actuel", cookieNote: "Votre choix est stocké localement et peut être modifié sur cette page à tout moment.",
  bannerText: "Abrium utilise un cookie de préférence pour la langue et le thème. Aucune analyse, jamais.",
  nfTitle: "Cette page n'est pas dans le Coffre.", nfBody: "Le lien est peut-être obsolète, ou la page a été déplacée. Tout le reste est toujours là où vous l'avez laissé.",
  backHome: "Retour à l'accueil",
  footProduct: "Produit", footLegal: "Légal",
  footerCopyright: "© 2026 Abrium · Open source et privé",
  linkPrivacy: "Confidentialité", linkTerms: "Conditions", linkContact: "Contact", linkCookies: "Préférences de cookies", linkSystem: "Design system",
  homeFeatures: [
    { i: "capture", title: "Capture automatique", body: "Chaque artifact que vous ouvrez est enregistré dès son rendu — y compris chaque révision, afin que les anciennes versions restent récupérables." },
    { i: "search", title: "Galerie & recherche", body: "Un panneau latéral liste tout par type, conversation et date. La recherche en texte intégral accède au contenu de l'artifact." },
    { i: "zip", title: "Export en lot", body: "Sélectionnez plusieurs artifacts et téléchargez-les sous forme de ZIP structuré par dossiers, avec les bonnes extensions." },
    { i: "globe", title: "Cinq langues, support RTL", body: "Anglais, arabe, français, espagnol et portugais. L'arabe reflète entièrement l'interface — navigation, icônes et sens de lecture." }
  ],
  steps: [
    { n: "1", title: "Installer et épingler", body: "Ajoutez Abrium depuis le Chrome Web Store et épinglez-le. Aucun écran d'inscription — il n'y a pas de compte." },
    { n: "2", title: "Travailler normalement", body: "Continuez d'utiliser claude.ai. Lorsqu'un artifact apparaît en vue Code, Abrium l'enregistre avec son titre et sa source." },
    { n: "3", title: "Le retrouver plus tard", body: "Ouvrez le panneau, cherchez ou filtrez, puis prévisualisez, copiez, épinglez ou exportez ce dont vous avez besoin." }
  ],
  featureSections: [
    { i: "capture", title: "Capture", frame: "capture · panneau", body: "Abrium surveille l'apparition d'artifacts et les stocke localement. Les révisions sont numérotées, donc une réécriture ne vous fait jamais perdre le brouillon précédent.", bullets: ["Code, Markdown, HTML, SVG et React", "Chaque révision est gardée comme version", "Fonctionne rétroactivement sur les conversations réouvertes"] },
    { i: "search", title: "Organisation", frame: "galerie · filtres", body: "Le panneau latéral centralise tout ce qui est capturé. Filtrez par type, épinglez vos favoris et recherchez dans les titres, les conversations et les corps d'artifacts.", bullets: ["Filtres par type et collection épinglée", "Recherche en texte intégral", "Trié par date de capture, le plus récent en premier"] },
    { i: "zip", title: "Export", frame: "sélection par lots", body: "Les artifacts uniques se téléchargent avec leur extension. La sélection multiple permet l'export en ZIP ou l'épinglage en masse.", bullets: ["Téléchargement en un clic ou copie", "Export ZIP avec extensions de fichiers", "Épinglage et suppression en masse"] },
    { i: "lock", title: "Confidentialité", frame: "stockage · IndexedDB", body: "Tout vit dans le stockage local de votre navigateur. Il n'y a pas de serveur, ni de SDK d'analyse, ni de requête réseau effectuée par l'extension.", bullets: ["Stockage local IndexedDB uniquement", "Pas de comptes, pas de télémétrie", "Code source public et auditable"] },
    { i: "globe", title: "Langues", frame: "interface · العربية", body: "L'interface est disponible en cinq langues. L'arabe bénéficie d'une version de droite à gauche complète : panneau, barres, icônes et sens de lecture.", bullets: ["EN · AR · FR · ES · PT", "Symétrie RTL complète", "Suit la langue du navigateur par défaut"] }
  ],
  faqs: [
    { q: "Est-ce gratuit ?", a: "Oui — gratuit, sans niveau payant. Le code source est public, et le projet n'est soutenu que par des dons volontaires." },
    { q: "Abrium lit-il mes conversations ?", a: "Non. Abrium regarde uniquement le panneau de l'artifact. Le contenu de vos messages n'est jamais lu ni stocké." },
    { q: "Pourquoi nécessite-t-il la vue Code ?", a: "Le mode Aperçu utilise une iframe isolée. La vue Code expose la source brute, ce qui permet à Abrium de la sauvegarder." },
    { q: "Mes données sont-elles envoyées quelque part ?", a: "Jamais. L'extension ne fait aucune requête réseau. Tout reste dans votre base IndexedDB locale." },
    { q: "Quelles langues sont prises en charge ?", a: "Anglais, arabe, français, espagnol et portugais. L'arabe s'affiche de droite à gauche." },
    { q: "Que se passe-t-il si je désinstalle l'extension ?", a: "Chrome supprime la base locale. Exportez ce que vous voulez garder avant de désinstaller (un export ZIP prend quelques secondes)." }
  ],
  installSteps: [
    { n: "1", title: "Ajouter l'extension", body: "Ouvrez le Chrome Web Store et cliquez sur Ajouter à Chrome. Aucune autorisation n'est requise en dehors de claude.ai." },
    { n: "2", title: "L'épingler à la barre", body: "Cliquez sur l'icône du puzzle et épinglez Abrium pour y accéder en un clic." },
    { n: "3", title: "Ouvrir une conversation", body: "Allez sur claude.ai, ouvrez un artifact en vue Code, et il apparaît immédiatement dans le Coffre." }
  ],
  releases: [
    { version: "v0.1.0", date: "2 août 2026", tag: "Lancement initial", items: ["Capture automatique pour Code, Markdown, HTML, SVG et React", "Galerie avec filtres, recherche et épingles", "Vue détaillée de l'artifact avec aperçu, copie et téléchargement", "Sélection par lots avec export ZIP", "Cinq langues dont l'arabe en RTL", "Stockage IndexedDB local — aucun accès réseau"] }
  ],
  contactCards: [
    { i: "github", title: "Signaler un problème", body: "Les bugs ou demandes de fonctionnalités doivent être publiés sur GitHub. Indiquez votre version de Chrome.", cta: "Ouvrir un ticket GitHub", placeholder: false },
    { i: "patreon", title: "Soutenir le projet", body: "Abrium reste gratuit. Si cela vous fait gagner du temps, une petite contribution finance sa maintenance.", cta: "Page Patreon", placeholder: false }
  ],
  privacy: {
    title: "Politique de confidentialité", updated: "Dernière mise à jour · 2 août 2026",
    sections: [
      { h: "En bref", p: ["Abrium ne collecte ni ne transmet de données. Il n'y a pas de serveur. Tout est écrit dans votre navigateur.", "Ce site utilise un seul cookie pour mémoriser votre langue et votre thème."] },
      { h: "Ce que l'extension stocke", p: ["Lorsque vous ouvrez un artifact en vue Code, Abrium sauvegarde son contenu, son titre, son type et l'heure de capture.", "Le texte de vos messages n'est pas lu."] },
      { h: "Ce que l'extension envoie", p: ["Rien. Aucune requête réseau, aucune télémétrie."] },
      { h: "Analyses du site web", p: ["abrium.onl sert des pages statiques sans tracker."] },
      { h: "Cookies", p: ["Un seul cookie stocke votre langue/thème de préférence."] },
      { h: "Vos données, votre contrôle", p: ["Supprimez des éléments depuis le panneau latéral ou désinstallez l'extension pour tout effacer."] },
      { h: "Modifications", p: ["Les mises à jour seront indiquées dans le journal des modifications."] },
      { h: "Contact", p: ["Les questions peuvent être posées sur GitHub."] }
    ]
  },
  terms: {
    title: "Conditions d'utilisation", updated: "Dernière mise à jour · 2 août 2026",
    sections: [
      { h: "Acceptation", p: ["En installant Abrium, vous acceptez ces conditions."] },
      { h: "Licence", p: ["Abrium est open source. Vous pouvez l'utiliser sous les termes de sa licence."] },
      { h: "Aucune garantie", p: ["L'extension est fournie telle quelle. Pensez à exporter ce que vous ne voulez pas perdre."] },
      { h: "Utilisation acceptable", p: ["Utilisez Abrium uniquement avec du contenu que vous avez le droit de stocker."] },
      { h: "Relation avec Anthropic", p: ["Abrium est un projet indépendant, non affilié à Anthropic."] },
      { h: "Disponibilité", p: ["Le site ou l'extension peut devenir indisponible à tout moment, bien que l'installation locale continuera à fonctionner."] },
      { h: "Modifications", p: ["Les conditions mises à jour prennent effet lors de leur publication."] }
    ]
  }
};

export const ES = {
  addToChrome: "Añadir a Chrome", viewGithub: "Ver en GitHub", getIt: "Obtener Abrium",
  eyebrow: "Extensión de Chrome · v0.1.0",
  heroTitle: "Nunca vuelvas a perder un Artifact de Claude.",
  heroSub: "Abrium cataloga en silencio cada artifact que generas en claude.ai — código, documentos, HTML, SVG — y los mantiene buscables en tu propio equipo. Sin cuenta, sin nube, sin rastreo.",
  trustStrip: "Gratis · Código abierto · Solo local · Sin rastreo",
  nav: { home: "Inicio", features: "Funciones", faq: "FAQ", download: "Descargar", changelog: "Cambios" },
  trust: ["Gratis", "Código abierto", "Solo local", "Sin rastreo"],
  acceptAll: "Aceptar todo", rejectAll: "Rechazar todo",
  footerTag: "Un catálogo local para los Artifacts de Claude. Gratis y de código abierto.",
  sidePanel: "Panel lateral", searchPh: "Buscar en la Bóveda", screenshot: "Captura de pantalla",
  howLabel: "Cómo funciona", howTitle: "Tres pasos, y luego desaparece en el fondo.",
  featuresLabel: "Características", featuresTitle: "Todo lo que hace la Bóveda.",
  featuresSub: "Cinco áreas de trabajo, todas ejecutándose en tu navegador. Nada sale de la máquina en la que estás.",
  faqLabel: "FAQ", faqTitle: "Las preguntas más frecuentes.",
  faqMore: "¿Algo que no esté aquí?", contactUs: "Contacto",
  dlTitle: "Instalar Abrium", dlSub: "A un clic desde la Chrome Web Store. En revisión: el botón es provisional hasta su publicación.",
  comingSoon: "Próximamente",
  changelogLabel: "Registro de cambios", changelogTitle: "Qué ha cambiado y cuándo.",
  contactTitle: "Contacto", contactSub: "Dos formas de llegar al proyecto. Reportar errores es lo más útil que puedes hacer.",
  cookieTitle: "Preferencias de cookies",
  cookieBody: "Este sitio usa una cookie para recordar tu idioma y tema. Nada más: ni analíticas, ni anuncios. La extensión no usa cookies ni contacta servidores.",
  currentStatus: "Estado actual", cookieNote: "Tu elección se guarda localmente y puedes cambiarla en cualquier momento.",
  bannerText: "Abrium usa una cookie para el idioma y el tema. Nunca usamos analíticas.",
  nfTitle: "Esta página no está en la Bóveda.", nfBody: "El enlace puede estar caducado. Todo lo demás sigue donde lo dejaste.",
  backHome: "Volver al inicio",
  footProduct: "Producto", footLegal: "Legal",
  footerCopyright: "© 2026 Abrium · Código abierto y privado",
  linkPrivacy: "Privacidad", linkTerms: "Términos", linkContact: "Contacto", linkCookies: "Preferencias de cookies", linkSystem: "Design system",
  homeFeatures: [
    { i: "capture", title: "Captura automática", body: "Cada artifact se guarda en el momento en que aparece, incluyendo las revisiones para poder recuperarlas." },
    { i: "search", title: "Galería y búsqueda", body: "Un panel lateral para buscar por tipo, conversación y fecha. La búsqueda examina también el contenido." },
    { i: "zip", title: "Exportación masiva", body: "Selecciona artifacts y descárgalos en un archivo ZIP estructurado con sus extensiones." },
    { i: "globe", title: "Cinco idiomas, soporte RTL", body: "Inglés, árabe, francés, español y portugués. El árabe refleja completamente la interfaz." }
  ],
  steps: [
    { n: "1", title: "Instalar y fijar", body: "Añade Abrium desde la Chrome Web Store y fíjalo. Sin registro ni cuentas." },
    { n: "2", title: "Trabaja con normalidad", body: "Sigue usando claude.ai. Cuando aparece un artifact en modo Código, Abrium lo guarda." },
    { n: "3", title: "Encuéntralo luego", body: "Abre el panel, busca, filtra, copia o exporta lo que necesites." }
  ],
  featureSections: [
    { i: "capture", title: "Captura", frame: "captura · panel lateral", body: "Abrium guarda cada artifact localmente en cuanto aparece. Se mantienen las diferentes versiones.", bullets: ["Código, Markdown, HTML, SVG y React", "Revisiones guardadas como versiones", "Funciona retroactivamente"] },
    { i: "search", title: "Organización", frame: "galería · filtros", body: "El panel lateral organiza todo. Filtra por tipo, ancla favoritos y busca texto.", bullets: ["Filtros por tipo y sección de anclados", "Búsqueda de texto completo", "Ordenado por fecha"] },
    { i: "zip", title: "Exportación", frame: "selección por lotes", body: "Los artifacts se descargan con su extensión. La selección múltiple permite exportar en ZIP.", bullets: ["Descarga con un clic", "Exportación ZIP", "Eliminación y anclado en masa"] },
    { i: "lock", title: "Privacidad", frame: "almacenamiento · IndexedDB", body: "Todo vive en tu navegador. Sin servidores, sin SDK de análisis.", bullets: ["Solo almacenamiento local en IndexedDB", "Sin cuentas ni anuncios", "Código abierto y auditable"] },
    { i: "globe", title: "Idiomas", frame: "interfaz · العربية", body: "La interfaz está en cinco idiomas. El árabe es completamente RTL.", bullets: ["EN · AR · FR · ES · PT", "RTL nativo", "Sigue el idioma de tu navegador"] }
  ],
  faqs: [
    { q: "¿Es gratis?", a: "Sí, es gratuito y sin niveles de pago." },
    { q: "¿Lee mis conversaciones?", a: "No. Solo analiza el panel del artifact." },
    { q: "¿Por qué necesita la vista de Código?", a: "La vista Previa está aislada en un iframe. La vista de Código muestra la fuente que Abrium guarda." },
    { q: "¿Se envían mis datos a algún sitio?", a: "Nunca. Todo se guarda localmente en IndexedDB." },
    { q: "¿Qué idiomas soporta?", a: "Inglés, árabe, francés, español y portugués." },
    { q: "¿Qué pasa si lo desinstalo?", a: "Chrome elimina tu base de datos local. Haz una exportación ZIP primero." }
  ],
  installSteps: [
    { n: "1", title: "Añadir la extensión", body: "Abre la Chrome Web Store y pulsa Añadir a Chrome." },
    { n: "2", title: "Fijar en la barra", body: "Haz clic en el icono del puzle y fija Abrium." },
    { n: "3", title: "Abrir una conversación", body: "Visita claude.ai y abre un artifact en vista Código." }
  ],
  releases: [
    { version: "v0.1.0", date: "2 de agosto de 2026", tag: "Lanzamiento inicial", items: ["Captura automática", "Galería en panel lateral", "Vista detallada", "Selección masiva", "Cinco idiomas con RTL", "Almacenamiento en IndexedDB"] }
  ],
  contactCards: [
    { i: "github", title: "Reportar un problema", body: "Usa el gestor de incidencias en GitHub.", cta: "Abrir incidencias en GitHub", placeholder: false },
    { i: "patreon", title: "Apoyar el proyecto", body: "Abrium es gratis. Una pequeña donación ayuda con su mantenimiento.", cta: "Página de Patreon", placeholder: false }
  ],
  privacy: {
    title: "Política de privacidad", updated: "Última actualización · 2 de agosto de 2026",
    sections: [
      { h: "Versión corta", p: ["Abrium no recopila datos. Este sitio usa una cookie solo para tus preferencias de idioma."] },
      { h: "Qué almacena la extensión", p: ["Cuando abres un artifact, Abrium guarda su contenido, título y fecha. No se leen los mensajes de chat."] },
      { h: "Qué envía la extensión", p: ["Nada. No hay peticiones de red ni telemetría."] },
      { h: "Analíticas", p: ["Este sitio web no tiene scripts de terceros."] },
      { h: "Cookies", p: ["Una única cookie almacena tu idioma preferido."] },
      { h: "Tus datos", p: ["Como todo es local, tú controlas el borrado."] },
      { h: "Cambios en esta política", p: ["Serán publicados en el registro de cambios."] },
      { h: "Contacto", p: ["Las dudas se pueden plantear en GitHub."] }
    ]
  },
  terms: {
    title: "Condiciones de uso", updated: "Última actualización · 2 de agosto de 2026",
    sections: [
      { h: "Aceptación", p: ["Al usar Abrium aceptas estas condiciones."] },
      { h: "Licencia", p: ["Es software de código abierto."] },
      { h: "Sin garantía", p: ["La extensión se ofrece tal cual."] },
      { h: "Uso aceptable", p: ["Úsalo solo con contenido que tengas derecho a almacenar."] },
      { h: "Relación con Anthropic", p: ["Abrium es un proyecto independiente."] },
      { h: "Disponibilidad", p: ["El servicio web podría interrumpirse."] },
      { h: "Cambios en los términos", p: ["Tendrán efecto tras su publicación."] }
    ]
  }
};

export const PT = {
  addToChrome: "Adicionar ao Chrome", viewGithub: "Ver no GitHub", getIt: "Obter o Abrium",
  eyebrow: "Extensão do Chrome · v0.1.0",
  heroTitle: "Nunca mais perca um Artifact do Claude.",
  heroSub: "O Abrium cataloga discretamente cada artifact gerado no claude.ai — código, documentos, HTML, SVG — e mantém tudo pesquisável na sua própria máquina. Sem conta, sem nuvem, sem rastreamento.",
  trustStrip: "Grátis · Código aberto · Apenas local · Sem rastreamento",
  nav: { home: "Início", features: "Recursos", faq: "FAQ", download: "Baixar", changelog: "Mudanças" },
  trust: ["Grátis", "Código aberto", "Apenas local", "Sem rastreamento"],
  acceptAll: "Aceitar tudo", rejectAll: "Recusar tudo",
  footerTag: "Um catálogo local para Artifacts do Claude. Grátis e de código aberto.",
  sidePanel: "Painel lateral", searchPh: "Pesquisar no Cofre", screenshot: "Captura de tela",
  howLabel: "Como funciona", howTitle: "Três passos, depois desaparece no fundo.",
  featuresLabel: "Recursos", featuresTitle: "Tudo o que o Cofre faz.",
  featuresSub: "Cinco áreas de trabalho, todas sendo executadas no seu navegador. Nada sai da máquina em que você está.",
  faqLabel: "FAQ", faqTitle: "Perguntas frequentes.",
  faqMore: "Algo que não está coberto aqui?", contactUs: "Contato",
  dlTitle: "Instalar o Abrium", dlSub: "A um clique da Chrome Web Store. A listagem está em análise — o botão é temporário.",
  comingSoon: "Em breve",
  changelogLabel: "Registro de alterações", changelogTitle: "O que mudou e quando.",
  contactTitle: "Entre em contato", contactSub: "Duas formas de chegar ao projeto. Relatos de bugs são a coisa mais útil que você pode enviar.",
  cookieTitle: "Preferências de cookies",
  cookieBody: "Este site usa um cookie para lembrar o idioma e o tema. Sem análises ou anúncios. A extensão não usa cookies nem contata servidores.",
  currentStatus: "Status atual", cookieNote: "Sua escolha é armazenada localmente e pode ser alterada a qualquer momento.",
  bannerText: "O Abrium usa um cookie de preferência para o idioma e tema. Nenhuma análise.",
  nfTitle: "Esta página não está no Cofre.", nfBody: "O link pode estar desatualizado. Todo o resto continua onde você deixou.",
  backHome: "Voltar ao início",
  footProduct: "Produto", footLegal: "Legal",
  footerCopyright: "© 2026 Abrium · Código aberto e privado",
  linkPrivacy: "Privacidade", linkTerms: "Termos", linkContact: "Contato", linkCookies: "Preferências de cookies", linkSystem: "Design system",
  homeFeatures: [
    { i: "capture", title: "Captura automática", body: "Cada artifact que você abre é salvo no momento em que é renderizado — incluindo revisões." },
    { i: "search", title: "Galeria e busca", body: "Um painel lateral lista tudo por tipo, conversa e data. A pesquisa lê o conteúdo do artifact." },
    { i: "zip", title: "Exportação em lote", body: "Selecione artifacts e baixe um arquivo ZIP estruturado com as extensões corretas." },
    { i: "globe", title: "Cinco idiomas, suporte RTL", body: "Inglês, árabe, francês, espanhol e português. O árabe reflete totalmente a interface." }
  ],
  steps: [
    { n: "1", title: "Instalar e fixar", body: "Adicione o Abrium da Chrome Web Store e fixe-o." },
    { n: "2", title: "Trabalhe normalmente", body: "Continue usando o claude.ai. Quando um artifact aparece em modo Código, o Abrium o guarda." },
    { n: "3", title: "Encontre depois", body: "Abra o painel, pesquise, filtre, copie ou exporte o que precisar." }
  ],
  featureSections: [
    { i: "capture", title: "Captura", frame: "captura · painel", body: "O Abrium armazena cada artifact localmente. As revisões são numeradas.", bullets: ["Código, Markdown, HTML, SVG e React", "Revisões salvas como versões", "Funciona retroativamente"] },
    { i: "search", title: "Organização", frame: "galeria · filtros", body: "O painel lateral organiza tudo. Filtre, fixe e pesquise por textos.", bullets: ["Filtros por tipo e fixados", "Busca em texto completo", "Ordenado por data"] },
    { i: "zip", title: "Exportação", frame: "seleção em lote", body: "Downloads únicos com extensão. Múltiplos arquivos são exportados em ZIP.", bullets: ["Download com um clique", "Exportação ZIP", "Fixação e exclusão em lote"] },
    { i: "lock", title: "Privacidade", frame: "armazenamento · IndexedDB", body: "Tudo fica no seu navegador. Não há servidores.", bullets: ["Armazenamento IndexedDB local", "Sem contas ou anúncios", "Código aberto e auditável"] },
    { i: "globe", title: "Idiomas", frame: "interface · العربية", body: "A interface vem em cinco idiomas. O árabe tem espelhamento completo.", bullets: ["EN · AR · FR · ES · PT", "Espelhamento RTL completo", "Segue o idioma do navegador"] }
  ],
  faqs: [
    { q: "É gratuito?", a: "Sim, gratuito para sempre." },
    { q: "Lê minhas conversas?", a: "Não. Apenas verifica o painel do artifact." },
    { q: "Por que precisa da visualização em Código?", a: "A visualização de Prévia é isolada, enquanto a visualização em Código expõe o conteúdo que o Abrium salva." },
    { q: "Meus dados são enviados para algum lugar?", a: "Nunca. Tudo fica no IndexedDB do seu navegador." },
    { q: "Quais idiomas são suportados?", a: "Inglês, árabe, francês, espanhol e português." },
    { q: "O que acontece se eu desinstalar?", a: "O Chrome apaga o banco de dados. Faça um backup em ZIP antes." }
  ],
  installSteps: [
    { n: "1", title: "Adicionar extensão", body: "Abra a Chrome Web Store e clique em Adicionar ao Chrome." },
    { n: "2", title: "Fixar na barra", body: "Clique no ícone e fixe o Abrium." },
    { n: "3", title: "Abrir conversa", body: "Acesse o claude.ai e abra qualquer artifact no modo de Código." }
  ],
  releases: [
    { version: "v0.1.0", date: "2 de agosto de 2026", tag: "Lançamento inicial", items: ["Captura automática", "Galeria no painel", "Visualização detalhada", "Exportação ZIP em lote", "Cinco idiomas com RTL", "Armazenamento IndexedDB local"] }
  ],
  contactCards: [
    { i: "github", title: "Relatar problema", body: "Bugs e solicitações de recursos pertencem ao GitHub.", cta: "Abrir problemas no GitHub", placeholder: false },
    { i: "patreon", title: "Apoiar projeto", body: "O Abrium é grátis. Doações ajudam na manutenção.", cta: "Página do Patreon", placeholder: false }
  ],
  privacy: {
    title: "Política de privacidade", updated: "Última atualização · 2 de agosto de 2026",
    sections: [
      { h: "Resumo", p: ["O Abrium não coleta dados. Este site usa um cookie para seu idioma preferido."] },
      { h: "O que a extensão armazena", p: ["Ao abrir um artifact, o Abrium guarda seu conteúdo e título. Mensagens do chat não são lidas."] },
      { h: "O que a extensão envia", p: ["Nada. Sem rastreamento."] },
      { h: "Análises do site", p: ["O site não usa ferramentas de rastreamento de terceiros."] },
      { h: "Cookies", p: ["Um único cookie guarda sua configuração de idioma."] },
      { h: "Seus dados", p: ["Exclua localmente ou desinstale a extensão para apagar o banco de dados."] },
      { h: "Alterações", p: ["Atualizações na política serão listadas no registro de alterações."] },
      { h: "Contato", p: ["Dúvidas de privacidade podem ser discutidas no repositório público."] }
    ]
  },
  terms: {
    title: "Termos de uso", updated: "Última atualização · 2 de agosto de 2026",
    sections: [
      { h: "Aceitação", p: ["Ao usar o Abrium, você concorda com estes termos."] },
      { h: "Licença", p: ["O Abrium é de código aberto."] },
      { h: "Sem garantias", p: ["A extensão é fornecida no estado em que se encontra."] },
      { h: "Uso aceitável", p: ["Use o Abrium apenas com conteúdo que você tem o direito de salvar."] },
      { h: "Relação com a Anthropic", p: ["O Abrium é um projeto independente."] },
      { h: "Disponibilidade", p: ["O site pode sofrer alterações a qualquer momento."] },
      { h: "Alterações", p: ["As alterações nos termos terão efeito após publicação."] }
    ]
  }
};


export const EN = {
  addToChrome: "Add to Chrome", viewGithub: "View on GitHub", getIt: "Get Abrium",
  eyebrow: "Chrome extension · v0.1.0",
  heroTitle: "Never lose a Claude Artifact again.",
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
    { i: "patreon", title: "Support the project", body: "Abrium stays free. If it saves you time, a small recurring contribution funds maintenance and the Chrome Web Store listing fee.", cta: "Patreon page", placeholder: true }
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
  heroSub: "يفهرس أبريوم بهدوء كل عنصر تُنشئه على claude.ai — شيفرة، مستندات، HTML، SVG — ويبقيه قابلاً للبحث على جهازك وحده. بلا حساب، بلا سحابة، بلا تتبّع.",
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
  footerTag: "فهرس محلي لعناصر كلود. مجاني ومفتوح المصدر.",
  nav: { home: "الرئيسية", features: "المزايا", faq: "الأسئلة", download: "التحميل", changelog: "السجل" },
  footProduct: "المنتج", footLegal: "قانوني",
  linkPrivacy: "الخصوصية", linkTerms: "الشروط", linkContact: "اتصل بنا", linkCookies: "تفضيلات الكوكيز", linkSystem: "نظام التصميم",
  trust: ["مجاني للأبد", "مفتوح المصدر", "محلي بالكامل", "بلا تتبّع"],
  homeFeatures: [
    { i: "capture", title: "التقاط تلقائي", body: "يُحفظ كل عنصر تفتحه في المحادثة لحظة ظهوره — مع كل مراجعة، لتبقى النسخ السابقة قابلة للاسترجاع." },
    { i: "search", title: "معرض وبحث", body: "لوحة جانبية تعرض كل شيء حسب النوع والمحادثة والتاريخ. البحث يصل إلى متن العنصر لا إلى عنوانه فقط." },
    { i: "zip", title: "تصدير جماعي", body: "حدّد أي عدد من العناصر ونزّلها كملف ZIP منظّم بمجلدات وامتدادات صحيحة لكل نوع." },
    { i: "globe", title: "خمس لغات ودعم RTL", body: "الإنجليزية والعربية والفرنسية والإسبانية والبرتغالية. العربية تعكس التخطيط بالكامل — التنقّل والأيقونات وترتيب القراءة." }
  ],
  steps: [
    { n: "١", title: "ثبّت وثبّت الأيقونة", body: "أضف أبريوم من متجر كروم وثبّته في الشريط. لا شاشة تسجيل — لا يوجد حساب أصلاً." },
    { n: "٢", title: "اعمل كالمعتاد", body: "تابع استخدام claude.ai. حين يظهر عنصر في عرض الشيفرة، يحفظه أبريوم بعنوانه ونوعه ومحادثته." },
    { n: "٣", title: "جده لاحقاً", body: "افتح اللوحة الجانبية، ابحث أو رشّح، ثم عاين أو انسخ أو ثبّت أو صدّر ما تحتاج." }
  ],
  featureSections: [
    { i: "capture", title: "الالتقاط", frame: "الالتقاط · اللوحة", body: "يراقب أبريوم مساحة العناصر في الصفحة ويخزّن كلاً منها محلياً فور ظهوره. المراجعات تُحفظ كنسخ مرقّمة بدل استبدالها، فلا تكلّفك إعادة الكتابة المسوّدة الأولى.", bullets: ["عناصر شيفرة وMarkdown وHTML وSVG وReact", "كل مراجعة تُحفظ كنسخة مرقّمة", "يعمل أثرياً على المحادثات التي تعيد فتحها"] },
    { i: "search", title: "التنظيم", frame: "المعرض · المرشّحات", body: "اللوحة الجانبية هي بيت كل ما التُقط. رشّح حسب النوع، ثبّت ما تعود إليه، وابحث في العناوين وأسماء المحادثات ومتون العناصر.", bullets: ["مرشّحات حسب النوع ومجموعة مثبّتة", "بحث نصي كامل داخل متون العناصر", "مرتّبة حسب وقت الالتقاط، الأحدث أولاً"] },
    { i: "zip", title: "التصدير", frame: "التحديد الجماعي", body: "العنصر المفرد يُنزَّل بامتداده الصحيح. التحديد المتعدد يحوّل اللوحة إلى أداة جماعية بشريط إجراءات سفلي لتصدير ZIP أو التثبيت الجماعي.", bullets: ["تنزيل بنقرة أو نسخ إلى الحافظة", "تصدير ZIP بامتدادات حسب النوع", "تثبيت وحذف جماعيان"] },
    { i: "lock", title: "الخصوصية", frame: "التخزين · IndexedDB", body: "كل شيء يعيش في تخزين متصفحك المحلي. لا خادم تُرسل إليه البيانات، ولا أدوات تحليل، ولا أي طلب شبكة تجريه الإضافة نيابةً عنك.", bullets: ["تخزين محلي في IndexedDB فقط", "بلا حسابات أو قياسات أو إعلانات", "شيفرة مصدرية علنية قابلة للتدقيق"] },
    { i: "globe", title: "اللغات", frame: "الواجهة · العربية", body: "تتوفر الواجهة بخمس لغات. العربية نسخة كاملة من اليمين إلى اليسار: اللوحة والأشرطة والأيقونات ذات الاتجاه وترتيب القراءة كلها معكوسة.", bullets: ["EN · AR · FR · ES · PT", "عكس كامل للتخطيط لا مجرد قلب للنص", "يتبع لغة المتصفح افتراضياً"] }
  ],
  faqs: [
    { q: "هل أبريوم مجاني؟", a: "نعم — مجاني، بلا خطة مدفوعة ولا ترقيات. الشيفرة علنية والمشروع مدعوم بالتبرعات الطوعية فقط." },
    { q: "هل يقرأ محادثاتي؟", a: "لا. ينظر أبريوم إلى لوحة العناصر وحدها — العنصر المعروض وعنوانه. محتوى الرسائل لا يُحلَّل ولا يُخزَّن ولا يُرسَل." },
    { q: "لماذا يحتاج عرض الشيفرة بدل المعاينة؟", a: "تعرض المعاينة العنصر داخل إطار معزول لا تستطيع الإضافات قراءته. أما عرض الشيفرة فيُظهر المصدر داخل الصفحة نفسها، وهو ما يحفظه أبريوم — لذا قد لا يُلتقط عنصر تُرك في وضع المعاينة حتى تبدّل العرض." },
    { q: "هل تُرسل بياناتي إلى أي مكان؟", a: "أبداً. لا تجري الإضافة أي طلب شبكة. كل شيء يُكتب في IndexedDB المحلي ويبقى على جهازك، حتى عند تصدير ملف ZIP." },
    { q: "ما اللغات المدعومة؟", a: "الإنجليزية والعربية والفرنسية والإسبانية والبرتغالية. العربية واجهة معكوسة بالكامل من اليمين إلى اليسار، لا نص مترجم داخل تخطيط لاتيني." },
    { q: "ماذا يحدث إن أزلت الإضافة؟", a: "يحذف كروم قاعدة البيانات المحلية مع الإضافة. صدّر ما تريد الاحتفاظ به قبل الإزالة — تصدير ZIP كامل يستغرق ثوانٍ." }
  ],
  installSteps: [
    { n: "١", title: "أضف الإضافة", body: "افتح صفحة المتجر واختر «أضف إلى كروم». لا أذونات مطلوبة خارج claude.ai." },
    { n: "٢", title: "ثبّتها في الشريط", body: "اضغط أيقونة القطعة وثبّت أبريوم لتكون النافذة على بُعد نقرة." },
    { n: "٣", title: "افتح محادثة", body: "ادخل claude.ai، افتح أي عنصر في عرض الشيفرة، وسيظهر في الخزنة فوراً." }
  ],
  releases: [
    { version: "v0.1.0", date: "٢ أغسطس ٢٠٢٦", tag: "الإصدار الأول", items: ["التقاط تلقائي لعناصر الشيفرة وMarkdown وHTML وSVG وReact", "معرض في اللوحة الجانبية مع مرشّحات وبحث وتثبيت", "عرض تفصيلي للعنصر مع معاينة ونسخ وتنزيل", "تحديد جماعي مع تصدير ZIP", "خمس لغات للواجهة مع دعم كامل للعربية", "تخزين محلي في IndexedDB — بلا أي اتصال بالشبكة"] }
  ],
  contactCards: [
    { i: "github", title: "أبلغ عن مشكلة", body: "الأخطاء والالتقاطات الناقصة وطلبات المزايا مكانها متتبّع المشكلات. أرفق إصدار كروم ونوع العنصر إن فشل الالتقاط.", cta: "افتح صفحة المشكلات", placeholder: false },
    { i: "patreon", title: "ادعم المشروع", body: "سيبقى أبريوم مجانياً. إن وفّر عليك وقتاً، فمساهمة صغيرة متكرّرة تموّل الصيانة ورسوم المتجر.", cta: "صفحة Patreon", placeholder: true }
  ],
  privacy: {
    title: "سياسة الخصوصية", updated: "آخر تحديث · ٢ أغسطس ٢٠٢٦",
    sections: [
      { h: "باختصار", p: ["لا يجمع أبريوم أي بيانات ولا يرسلها ولا يبيعها. لا يوجد للإضافة أي مكوّن خادم. كل ما تخزّنه يُكتب في متصفحك ولا يغادره.", "يضع هذا الموقع ملف تعريف ارتباط واحداً لتذكّر اللغة والمظهر. لا شيء آخر يُتتبَّع."] },
      { h: "ما الذي تخزّنه الإضافة", p: ["حين تفتح عنصراً على claude.ai في عرض الشيفرة، يحفظ أبريوم محتواه وعنوانه ونوعه واسم المحادثة المصدر ووقت الالتقاط. يُكتب هذا السجل في IndexedDB داخل ملف متصفحك.", "لا يُقرأ نص الرسائل خارج لوحة العناصر. تفاصيل حسابك وبريدك وسجل محادثاتك غير متاحة للإضافة ولا تُطلب أبداً."] },
      { h: "ما الذي ترسله الإضافة", p: ["لا شيء. لا يجري أبريوم أي طلب شبكة صادر. لا أدوات تحليل، ولا مبلّغ أعطال، ولا معرّف إعلاني، ولا إعدادات عن بُعد. يمكنك التحقق بقراءة المصدر أو بمراقبة لوحة الشبكة أثناء التشغيل."] },
      { h: "تحليلات الموقع", p: ["يقدّم abrium.onl صفحات ثابتة. لا نص تحليلات ولا مدير وسوم ولا تضمين من طرف ثالث. يحتفظ المستضيف بسجلات وصول لفترة قصيرة لأغراض أمنية، ولا تتضمّن معرّفات نتحكّم بها أو نقرأها."] },
      { h: "الكوكيز", p: ["ملف تفضيلات واحد من الطرف الأول يخزّن لغتك ومظهرك ليبدو الموقع كما تركته في زيارتك القادمة. يمكنك رفضه من صفحة التفضيلات؛ سيظل الموقع يعمل معتمداً على لغة المتصفح."] },
      { h: "بياناتك بين يديك", p: ["لأن التخزين محلي، فالحذف محلي أيضاً. احذف عناصر مفردة من اللوحة، أو امسح الخزنة كلها من الإعدادات، أو أزل الإضافة لحذف قاعدة البيانات بالكامل.", "لا يمكننا حذف بياناتك نيابةً عنك، لأننا لا نستلم منها شيئاً."] },
      { h: "تغييرات السياسة", p: ["إن تغيّرت هذه السياسة، سيتغيّر تاريخ المراجعة أعلاه وسيُدرج التحديث في سجل التغييرات العلني. وتُعلن التغييرات الجوهرية في المستودع."] },
      { h: "التواصل", p: ["أسئلة الخصوصية يمكن طرحها كمشكلة في المستودع العلني، حيث تكون الإجابة ظاهرة لكل من لديه السؤال نفسه."] }
    ]
  },
  terms: {
    title: "شروط الاستخدام", updated: "آخر تحديث · ٢ أغسطس ٢٠٢٦",
    sections: [
      { h: "القبول", p: ["بتثبيت إضافة أبريوم أو استخدام abrium.onl فإنك توافق على هذه الشروط. إن لم توافق فلا تثبّت الإضافة."] },
      { h: "الترخيص", p: ["أبريوم برمجية مفتوحة المصدر. يمكنك استخدامها ودراستها وتعديلها وإعادة توزيعها وفق ملف الترخيص المنشور في المستودع. ذلك الترخيص يحكم الشيفرة، وهذه الشروط تحكم الموقع والنسخة الموزّعة."] },
      { h: "بلا ضمان", p: ["تُقدَّم الإضافة كما هي، بلا ضمان من أي نوع. تخزّن البيانات محلياً في متصفحك، والتخزين المحلي قابل للمسح من المتصفح أو من برمجيات أخرى أو منك. احتفظ بنسخ مصدّرة لما لا تحتمل فقدانه.", "لا يتحمّل القائمون على المشروع مسؤولية فقدان العناصر أو العمل أو أي أضرار غير مباشرة."] },
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
  footerTag: "Un catalogue local pour les Artifacts de Claude. Gratuit et open source."
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
  footerTag: "Un catálogo local para los Artifacts de Claude. Gratis y de código abierto."
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
  footerTag: "Um catálogo local para Artifacts do Claude. Grátis e de código aberto."
};



# Prompt for Antigravity — Website Content Fidelity Fix
Paste this entire file into Antigravity as one prompt. Every file below is
final, already-written code (verified locally: `npm run build` → 46 static
pages, zero errors). Apply each section exactly — create the file at the
exact path shown, replacing it entirely if it already exists.

## Step 0 — Before touching anything: restore any files that may have gone missing

If `npm run dev` currently errors with "Missing pages directory: src/pages"
or "Could not import Layout.astro" / "404.astro not found", it means some
untouched project files (Layout.astro, 404.astro, i18n/utils.ts, styles,
CookieConsent.astro, package.json, astro.config.mjs, etc.) got deleted when
a previous file drop replaced the whole folder instead of merging into it.
Fix first, before anything else:

```
git status
git restore --staged --worktree .
```

This restores every file to the last committed state (nothing here was ever
deleted on purpose — only NEW/CHANGED files are listed in this prompt).
Confirm `npm run dev` runs clean again before proceeding to Step 1.

## Step 1 — Delete these files (confirmed unused in package.json's build/dev/preview scripts — safe)

```
extract.cjs
extract.mjs
extract_en.cjs
extract_scripts.cjs
extract_test.cjs
fix.cjs
fix_utils.cjs
generate-pages.cjs
rebuild-batch1.cjs
test.cjs
test2.cjs
test3.cjs
test_jsdom.cjs
test_puppeteer.cjs
rendered.html
test_template.html
src/pages/[lang]/   (entire old directory — every file inside will be replaced by Step 8 below)
```

Optional cleanup: remove `"cheerio"`, `"jsdom"`, `"puppeteer"` from
`package.json` dependencies (only used by the deleted scripts), then
`npm install` again.

## Step 2 — Shared i18n dictionary (EN/AR complete + FR/ES/PT now fully merged, ES backHome typo fixed)

**File:** `src/i18n/ui.ts` — replace entirely with:

```typescript
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
    { i: "patreon", title: "Soutenir le projet", body: "Abrium reste gratuit. Si cela vous fait gagner du temps, une petite contribution finance sa maintenance.", cta: "Page Patreon", placeholder: true }
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
    { i: "patreon", title: "Apoyar el proyecto", body: "Abrium es gratis. Una pequeña donación ayuda con su mantenimiento.", cta: "Página de Patreon", placeholder: true }
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
    { i: "patreon", title: "Apoiar projeto", body: "O Abrium é grátis. Doações ajudam na manutenção.", cta: "Página do Patreon", placeholder: true }
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


```

## Step 3 — Shared icon path constants

**File:** `src/lib/icons.ts` — replace entirely with:

```typescript
// Single source of truth for icon path data used across website page components.
// lucide-style, 1.6px stroke — matches the extension's icon set and the design reference.
export const ICONS: Record<string, string> = {
  capture: "M12 3a9 9 0 1 0 0 18a9 9 0 0 0 0-18M12 8v8M8 12h8",
  search: "M11 4a7 7 0 1 0 0 14a7 7 0 0 0 0-14M20 20l-4-4",
  zip: "M3 7h18v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2zM3 7l2-4h14l2 4M10 12h4",
  globe: "M12 3a9 9 0 1 0 0 18a9 9 0 0 0 0-18M3 12h18M12 3c2.4 2.6 3.6 5.6 3.6 9S14.4 18.4 12 21M12 3C9.6 5.6 8.4 8.6 8.4 12s1.2 6.4 3.6 9",
  lock: "M6 10h12v10H6zM9 10V7a3 3 0 0 1 6 0v3",
  github: "M9 19c-4.3 1.4-4.3-2.5-6-3m12 5v-3.5c0-1 .1-1.4-.5-2 2.8-.3 5.5-1.4 5.5-6a4.6 4.6 0 0 0-1.3-3.2 4.3 4.3 0 0 0-.1-3.2s-1.1-.3-3.5 1.3a12 12 0 0 0-6.2 0C6.5 2.8 5.4 3.1 5.4 3.1a4.3 4.3 0 0 0-.1 3.2A4.6 4.6 0 0 0 4 9.5c0 4.6 2.7 5.7 5.5 6-.4.4-.5.9-.5 1.6V21",
  patreon: "M4 3v18M14.5 3a5.8 5.8 0 1 1 0 11.6a5.8 5.8 0 0 1 0-11.6",
  chrome: "M12 3a9 9 0 1 0 0 18a9 9 0 0 0 0-18M12 8.4a3.6 3.6 0 1 0 0 7.2a3.6 3.6 0 0 0 0-7.2M20.4 7.6H12M4.3 6 8.4 13.2M10.7 20.9 14.8 13.7",
  clock: "M12 7v5l3 2M12 3a9 9 0 1 0 0 18a9 9 0 0 0 0-18",
  check: "m20 6-11 11-5-5",
  chevronRight: "m9 6 6 6-6 6",
  chevronLeft: "m15 18-6-6 6-6",
};
```

## Step 4 — Shared page components (used by BOTH the English root page and every [lang] localized page — single source of truth)

## Component: Home.astro

**File:** `src/components/pages/Home.astro` — replace entirely with:

```astro
---
import { useTranslations } from '../../i18n/utils';
import { ICONS } from '../../lib/icons';

interface Props {
  lang: string;
}
const { lang } = Astro.props;
const t = useTranslations(lang);
const downloadHref = lang === 'en' ? '/download' : `/${lang}/download`;
const homeFeatureIcons: Record<string, string> = {
  capture: "M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6",
  search: "M4 22h14a2 2 0 0 0 2-2V7.5L14.5 2H6a2 2 0 0 0-2 2v4",
  zip: "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3",
  globe: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10",
};
---
<div style="max-width:1080px; margin:0 auto; padding-block:72px 0">

  <div style="display:flex; flex-direction:row; gap:64px; align-items:center">
    <div style="flex:1; min-width:0; display:flex; flex-direction:column; gap:20px; max-width:720px">
      <span style="font:500 11.5px/1 ui-monospace,Menlo,monospace; letter-spacing:0.12em; text-transform:uppercase; color:var(--accent-text)">{t('eyebrow')}</span>
      <h1 style="margin:0; font-size:48px; font-weight:600; line-height:1.1; letter-spacing:-0.025em; text-wrap:balance">{t('heroTitle')}</h1>
      <p style="margin:0; font-size:18px; line-height:1.65; color:var(--text-3); text-wrap:pretty; max-width:48ch">{t('heroSub')}</p>
      <div style="display:flex; flex-wrap:wrap; gap:10px; padding-top:4px">
        <a href={downloadHref} style="height:48px; display:flex; align-items:center; gap:9px; padding:0 20px; border-radius:8px; background:var(--accent-solid); color:var(--on-accent); font:600 14.5px/1 inherit; cursor:pointer; text-decoration:none">
          <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v12M7 11l5 5 5-5M4 20h16"></path></svg>
          {t('addToChrome')}
        </a>
        <a href="https://github.com/omaelbaz/abrium-extension" target="_blank" rel="noopener" style="height:48px; display:flex; align-items:center; gap:9px; padding:0 18px; border-radius:8px; border:1px solid var(--border); background:var(--surface); color:var(--text); font:600 14.5px/1 inherit; text-decoration:none">
          <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d={ICONS.github}></path></svg>
          {t('viewGithub')}
        </a>
      </div>
      <div style="display:flex; flex-wrap:wrap; align-items:center; gap:8px; padding-top:8px">
        {(t('trust') as string[]).map((item: string) => (
          <span style="display:flex; align-items:center; gap:6px; font:500 12px/1 inherit; color:var(--text-3)">
            <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="var(--accent)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d={ICONS.check}></path></svg>
            {item}
          </span>
        ))}
      </div>
    </div>
  </div>

  <div style="display:grid; grid-template-columns:1fr 1fr; gap:14px; padding-block:72px">
    {(t('homeFeatures') as {i: string, title: string, body: string}[]).map((f) => (
      <div style="border:1px solid var(--border); border-radius:8px; background:var(--surface); padding:22px; display:flex; flex-direction:column; gap:11px">
        <span style="width:36px; height:36px; border-radius:8px; border:1px solid var(--accent); display:flex; align-items:center; justify-content:center; background:var(--tint)">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="var(--accent)" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d={homeFeatureIcons[f.i]}></path></svg>
        </span>
        <h3 style="margin:0; font:600 16px/1.3 inherit; letter-spacing:-0.01em">{f.title}</h3>
        <p style="margin:0; font-size:13.5px; line-height:1.65; color:var(--text-3); text-wrap:pretty">{f.body}</p>
      </div>
    ))}
  </div>

  <div style="border-top:1px solid var(--border); padding-block:72px; display:flex; flex-direction:column; gap:26px">
    <div style="display:flex; flex-direction:column; gap:8px; max-width:600px">
      <span style="font:500 11.5px/1 ui-monospace,Menlo,monospace; letter-spacing:0.12em; text-transform:uppercase; color:var(--accent-text)">{t('howLabel')}</span>
      <h2 style="margin:0; font-size:32px; font-weight:600; line-height:1.2; letter-spacing:-0.02em">{t('howTitle')}</h2>
    </div>
    <div style="display:grid; grid-template-columns:repeat(3, minmax(0, 1fr)); gap:14px">
      {(t('steps') as {n: string, title: string, body: string}[]).map((s) => (
        <div style="display:flex; flex-direction:column; gap:10px; padding:20px; border:1px solid var(--border-2); border-radius:8px; background:var(--bg-alt)">
          <span style="width:26px; height:26px; border-radius:999px; border:1px solid var(--accent); display:flex; align-items:center; justify-content:center; font:600 12px/1 ui-monospace,Menlo,monospace; color:var(--accent-text)">{s.n}</span>
          <span style="font:600 14.5px/1.35 inherit">{s.title}</span>
          <span style="font-size:13px; line-height:1.6; color:var(--text-3)">{s.body}</span>
        </div>
      ))}
    </div>
  </div>

  <div style="border:1px solid var(--border); border-radius:8px; background:var(--bg-alt); padding:18px 22px; margin-bottom:72px; display:flex; flex-wrap:wrap; align-items:center; gap:14px; justify-content:space-between">
    <span style="font:500 13px/1.5 inherit; color:var(--text-2)">{t('trustStrip')}</span>
    <a href={downloadHref} style="height:40px; display:flex; align-items:center; gap:8px; padding:0 16px; border-radius:7px; border:1px solid var(--accent); color:var(--accent-text); font:600 13px/1 inherit; cursor:pointer; text-decoration:none">
      {t('getIt')}
      <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d={ICONS.chevronRight}></path></svg>
    </a>
  </div>
</div>
```

## Component: Features.astro

**File:** `src/components/pages/Features.astro` — replace entirely with:

```astro
---
import { useTranslations } from '../../i18n/utils';
import { ICONS } from '../../lib/icons';

interface Props {
  lang: string;
}
const { lang } = Astro.props;
const t = useTranslations(lang);
const featureSections = t('featureSections') as { i: string; title: string; frame: string; body: string; bullets: string[] }[];
---
<div style="max-width:1080px; margin:0 auto; padding-block:72px 72px">
  <div style="display:flex; flex-direction:column; gap:12px; max-width:620px; padding-bottom:40px">
    <span style="font:500 11.5px/1 ui-monospace,Menlo,monospace; letter-spacing:0.12em; text-transform:uppercase; color:var(--accent-text)">{t('featuresLabel')}</span>
    <h1 style="margin:0; font-size:40px; font-weight:600; line-height:1.15; letter-spacing:-0.025em">{t('featuresTitle')}</h1>
    <p style="margin:0; font-size:16.5px; line-height:1.65; color:var(--text-3); text-wrap:pretty">{t('featuresSub')}</p>
  </div>

  <div style="display:flex; flex-direction:column; gap:0">
    {featureSections.map((f, i: number) => (
      <div style={`display:flex; flex-direction:${i % 2 === 1 ? 'row-reverse' : 'row'}; gap:56px; align-items:flex-start; padding-block:36px; border-top:1px solid var(--border)`}>
        <div style="flex:1; min-width:0; display:flex; flex-direction:column; gap:12px; max-width:520px">
          <span style="width:38px; height:38px; border-radius:8px; border:1px solid var(--accent); display:flex; align-items:center; justify-content:center; background:var(--tint)">
            <svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="var(--accent)" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d={ICONS[f.i]}></path></svg>
          </span>
          <h2 style="margin:0; font-size:27px; font-weight:600; line-height:1.25; letter-spacing:-0.02em">{f.title}</h2>
          <p style="margin:0; font-size:14.5px; line-height:1.7; color:var(--text-3); text-wrap:pretty">{f.body}</p>
          <div style="display:flex; flex-direction:column; gap:7px; padding-top:4px">
            {f.bullets.map((b: string) => (
              <span style="display:flex; gap:9px; align-items:flex-start; font-size:13.5px; line-height:1.6; color:var(--text-2)">
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="var(--accent)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex:none; margin-top:4px"><path d={ICONS.check}></path></svg>
                {b}
              </span>
            ))}
          </div>
        </div>
        <div style="flex:none; width:380px; max-width:100%; height:240px; border:1px solid var(--border); border-radius:10px; background:var(--surface); box-shadow:var(--shadow); overflow:hidden; display:flex; flex-direction:column">
          <div style="height:30px; display:flex; align-items:center; gap:7px; padding:0 11px; border-bottom:1px solid var(--border-2); background:var(--bg-alt)">
            <span style="width:7px; height:7px; border-radius:999px; background:var(--border)"></span>
            <span style="font:500 10.5px/1 ui-monospace,Menlo,monospace; color:var(--muted); letter-spacing:0.06em">{f.frame}</span>
          </div>
          <div style="flex:1; display:flex; align-items:center; justify-content:center; gap:9px; color:var(--muted)">
            <span style="font:400 12px/1 ui-monospace,Menlo,monospace">380 × 240 · {t('screenshot')}</span>
          </div>
        </div>
      </div>
    ))}
  </div>
</div>
```

## Component: Faq.astro

**File:** `src/components/pages/Faq.astro` — replace entirely with:

```astro
---
import { useTranslations } from '../../i18n/utils';
import { ICONS } from '../../lib/icons';

interface Props {
  lang: string;
}
const { lang } = Astro.props;
const t = useTranslations(lang);
const faqs = t('faqs') as { q: string; a: string }[];
---
<div style="max-width:760px; margin:0 auto; padding-block:72px 72px">
  <div style="display:flex; flex-direction:column; gap:12px; padding-bottom:34px">
    <span style="font:500 11.5px/1 ui-monospace,Menlo,monospace; letter-spacing:0.12em; text-transform:uppercase; color:var(--accent-text)">{t('faqLabel')}</span>
    <h1 style="margin:0; font-size:40px; font-weight:600; line-height:1.15; letter-spacing:-0.025em">{t('faqTitle')}</h1>
  </div>
  <div class="abr-faq-list" style="display:flex; flex-direction:column; gap:8px">
    {faqs.map((f, i: number) => (
      <details class="abr-faq-item" style="border:1px solid var(--border); border-radius:8px; background:var(--surface); overflow:hidden" open={i === 0}>
        <summary style="min-height:56px; display:flex; align-items:center; gap:14px; padding:14px 18px; cursor:pointer; list-style:none">
          <span style="flex:1; font:600 15px/1.45 inherit; text-wrap:pretty">{f.q}</span>
          <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="var(--accent)" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="flex:none"><path d={ICONS.chevronRight} transform="rotate(90 12 12)"></path></svg>
        </summary>
        <div style="padding:0 18px 18px; border-top:1px solid var(--border-2); padding-top:14px">
          <p style="margin:0; font-size:14px; line-height:1.75; color:var(--text-3); text-wrap:pretty">{f.a}</p>
        </div>
      </details>
    ))}
  </div>
  <div style="margin-top:32px; border:1px solid var(--border-2); border-radius:8px; background:var(--bg-alt); padding:20px; display:flex; flex-wrap:wrap; align-items:center; gap:12px; justify-content:space-between">
    <span style="font-size:13.5px; color:var(--text-2)">{t('faqMore')}</span>
    <a href={lang === 'en' ? '/contact' : `/${lang}/contact`} style="height:40px; display:flex; align-items:center; padding:0 16px; border-radius:7px; border:1px solid var(--accent); color:var(--accent-text); font:600 13px/1 inherit; text-decoration:none">{t('contactUs')}</a>
  </div>
</div>
<style>
  .abr-faq-item summary::-webkit-details-marker { display:none; }
</style>
```

## Component: Download.astro

**File:** `src/components/pages/Download.astro` — replace entirely with:

```astro
---
import { useTranslations } from '../../i18n/utils';
import { ICONS } from '../../lib/icons';

interface Props {
  lang: string;
}
const { lang } = Astro.props;
const t = useTranslations(lang);
const installSteps = t('installSteps') as { n: string; title: string; body: string }[];
---
<div style="max-width:760px; margin:0 auto; padding-block:72px 72px; display:flex; flex-direction:column; gap:32px">
  <div style="display:flex; flex-direction:column; align-items:center; gap:16px; text-align:center">
    <img src="/assets/abrium-mark.png" alt="Abrium" style="width:72px; height:auto; display:block" />
    <h1 style="margin:0; font-size:40px; font-weight:600; line-height:1.15; letter-spacing:-0.025em">{t('dlTitle')}</h1>
    <p style="margin:0; max-width:44ch; font-size:16.5px; line-height:1.65; color:var(--text-3); text-wrap:pretty">{t('dlSub')}</p>
    <div style="display:flex; flex-direction:column; align-items:center; gap:10px; padding-top:6px">
      <span style="height:52px; display:flex; align-items:center; gap:10px; padding:0 26px; border-radius:8px; background:var(--accent-solid); color:var(--on-accent); font:600 15px/1 inherit; opacity:0.92">
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d={ICONS.chrome}></path></svg>
        {t('addToChrome')}
      </span>
      <span style="display:flex; align-items:center; gap:7px; height:26px; padding:0 10px; border-radius:999px; border:1px dashed var(--accent); font:500 11px/1 ui-monospace,Menlo,monospace; letter-spacing:0.08em; text-transform:uppercase; color:var(--accent-text)">
        <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d={ICONS.clock}></path></svg>
        {t('comingSoon')}
      </span>
    </div>
  </div>

  <div style="display:grid; grid-template-columns:repeat(3,1fr); gap:14px">
    {installSteps.map((s) => (
      <div style="display:flex; flex-direction:column; gap:10px; padding:20px; border:1px solid var(--border-2); border-radius:8px; background:var(--surface)">
        <span style="width:26px; height:26px; border-radius:999px; border:1px solid var(--accent); display:flex; align-items:center; justify-content:center; font:600 12px/1 ui-monospace,Menlo,monospace; color:var(--accent-text)">{s.n}</span>
        <span style="font:600 14.5px/1.35 inherit">{s.title}</span>
        <span style="font-size:13px; line-height:1.6; color:var(--text-3)">{s.body}</span>
      </div>
    ))}
  </div>

  <div style="border:1px solid var(--border); border-radius:10px; background:var(--surface); box-shadow:var(--shadow); overflow:hidden">
    <div style="height:32px; display:flex; align-items:center; gap:8px; padding:0 12px; border-bottom:1px solid var(--border-2); background:var(--bg-alt)">
      <span style="font:500 10.5px/1 ui-monospace,Menlo,monospace; color:var(--muted); letter-spacing:0.06em">{t('sidePanel')} · 380px</span>
    </div>
    <div style="height:280px; display:flex; align-items:center; justify-content:center; gap:9px; color:var(--muted)">
      <span style="font:400 12px/1 ui-monospace,Menlo,monospace">{t('screenshot')}</span>
    </div>
  </div>
</div>
```

## Component: Changelog.astro

**File:** `src/components/pages/Changelog.astro` — replace entirely with:

```astro
---
import { useTranslations } from '../../i18n/utils';

interface Props {
  lang: string;
}
const { lang } = Astro.props;
const t = useTranslations(lang);
const releases = t('releases') as { version: string; date: string; tag: string; items: string[] }[];
---
<div style="max-width:720px; margin:0 auto; padding-block:72px 72px">
  <div style="display:flex; flex-direction:column; gap:12px; padding-bottom:34px">
    <span style="font:500 11.5px/1 ui-monospace,Menlo,monospace; letter-spacing:0.12em; text-transform:uppercase; color:var(--accent-text)">{t('changelogLabel')}</span>
    <h1 style="margin:0; font-size:40px; font-weight:600; line-height:1.15; letter-spacing:-0.025em">{t('changelogTitle')}</h1>
  </div>
  {releases.map((r) => (
    <div style="display:flex; gap:18px; border-inline-start:1px solid var(--border); padding-inline-start:22px; padding-bottom:28px; position:relative">
      <span style="position:absolute; inset-inline-start:-5px; top:6px; width:9px; height:9px; border-radius:999px; background:var(--accent-solid)"></span>
      <div style="flex:1; display:flex; flex-direction:column; gap:12px">
        <div style="display:flex; flex-wrap:wrap; align-items:center; gap:10px">
          <span style="font:600 17px/1 ui-monospace,Menlo,monospace; letter-spacing:-0.01em">{r.version}</span>
          <span style="font:400 12px/1 ui-monospace,Menlo,monospace; color:var(--muted)">{r.date}</span>
          <span style="height:22px; display:flex; align-items:center; padding:0 8px; border-radius:5px; border:1px solid var(--accent); font:500 10.5px/1 ui-monospace,Menlo,monospace; text-transform:uppercase; letter-spacing:0.08em; color:var(--accent-text)">{r.tag}</span>
        </div>
        <div style="display:flex; flex-direction:column; gap:8px">
          {r.items.map((it: string) => (
            <span style="display:flex; gap:10px; align-items:flex-start; font-size:14px; line-height:1.65; color:var(--text-3)">
              <span style="width:5px; height:5px; border-radius:999px; background:var(--muted); flex:none; margin-top:8px"></span>
              {it}
            </span>
          ))}
        </div>
      </div>
    </div>
  ))}
</div>
```

## Component: Prose.astro

**File:** `src/components/pages/Prose.astro` — replace entirely with:

```astro
---
import { useTranslations } from '../../i18n/utils';

interface Props {
  lang: string;
  kind: 'privacy' | 'terms';
}
const { lang, kind } = Astro.props;
const t = useTranslations(lang);
const prose = t(kind) as { title: string; updated: string; sections: { h: string; p: string[] }[] };
---
<div style="max-width:680px; margin:0 auto; padding-block:72px 72px">
  <div style="display:flex; flex-direction:column; gap:10px; padding-bottom:34px; border-bottom:1px solid var(--border)">
    <h1 style="margin:0; font-size:40px; font-weight:600; line-height:1.15; letter-spacing:-0.025em">{prose.title}</h1>
    <span style="font:400 12.5px/1 ui-monospace,Menlo,monospace; color:var(--muted)">{prose.updated}</span>
  </div>
  <div style="display:flex; flex-direction:column; gap:30px; padding-top:30px">
    {prose.sections.map((s) => (
      <div style="display:flex; flex-direction:column; gap:12px">
        <h2 style="margin:0; font:600 17px/1.35 inherit; letter-spacing:-0.01em">{s.h}</h2>
        {s.p.map((para: string) => (
          <p style="margin:0; font-size:15px; line-height:1.8; color:var(--text-3); text-wrap:pretty">{para}</p>
        ))}
      </div>
    ))}
  </div>
</div>
```

## Component: Contact.astro

**File:** `src/components/pages/Contact.astro` — replace entirely with:

```astro
---
import { useTranslations } from '../../i18n/utils';
import { ICONS } from '../../lib/icons';

interface Props {
  lang: string;
}
const { lang } = Astro.props;
const t = useTranslations(lang);
const contactCards = t('contactCards') as { i: string; title: string; body: string; cta: string; placeholder: boolean }[];
---
<div style="max-width:760px; margin:0 auto; padding-block:72px 72px">
  <div style="display:flex; flex-direction:column; gap:12px; padding-bottom:32px">
    <h1 style="margin:0; font-size:40px; font-weight:600; line-height:1.15; letter-spacing:-0.025em">{t('contactTitle')}</h1>
    <p style="margin:0; max-width:52ch; font-size:16.5px; line-height:1.65; color:var(--text-3)">{t('contactSub')}</p>
  </div>
  <div style="display:grid; grid-template-columns:1fr 1fr; gap:14px">
    {contactCards.map((c) => (
      <div style="border:1px solid var(--border); border-radius:8px; background:var(--surface); padding:24px; display:flex; flex-direction:column; gap:12px">
        <div style="display:flex; align-items:center; gap:10px">
          <span style="width:38px; height:38px; border-radius:8px; border:1px solid var(--accent); display:flex; align-items:center; justify-content:center; background:var(--tint)">
            <svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="var(--accent)" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d={ICONS[c.i]}></path></svg>
          </span>
          {c.placeholder && (
            <span style="height:22px; display:flex; align-items:center; padding:0 8px; border-radius:5px; border:1px dashed var(--accent); font:500 10.5px/1 ui-monospace,Menlo,monospace; text-transform:uppercase; letter-spacing:0.08em; color:var(--accent-text)">{t('comingSoon')}</span>
          )}
        </div>
        <h2 style="margin:0; font:600 16px/1.35 inherit">{c.title}</h2>
        <p style="margin:0; font-size:13.5px; line-height:1.65; color:var(--text-3); flex:1">{c.body}</p>
        <a href={c.i === 'github' ? 'https://github.com/omaelbaz/abrium-extension/issues' : 'https://patreon.com/placeholder-abrium'} target="_blank" rel="noopener" style="height:44px; display:flex; align-items:center; justify-content:center; gap:8px; border-radius:7px; border:1px solid var(--border); background:var(--bg-alt); color:var(--text); font:600 13.5px/1 inherit; text-decoration:none">
          {c.cta}
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M15 3h6v6M10 14 21 3M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path></svg>
        </a>
      </div>
    ))}
  </div>
</div>
```

## Component: CookiePreferences.astro

**File:** `src/components/pages/CookiePreferences.astro` — replace entirely with:

```astro
---
import { useTranslations } from '../../i18n/utils';

interface Props {
  lang: string;
}
const { lang } = Astro.props;
const t = useTranslations(lang);
---
<div style="max-width:620px; margin:0 auto; padding-block:72px 72px; display:flex; flex-direction:column; gap:22px">
  <div style="display:flex; flex-direction:column; gap:12px">
    <h1 style="margin:0; font-size:40px; font-weight:600; line-height:1.15; letter-spacing:-0.025em">{t('cookieTitle')}</h1>
    <p style="margin:0; font-size:15px; line-height:1.75; color:var(--text-3); text-wrap:pretty">{t('cookieBody')}</p>
  </div>
  <div style="border:1px solid var(--border); border-radius:8px; background:var(--surface); padding:18px; display:flex; align-items:center; gap:12px">
    <span id="pref-status-dot" style="width:9px; height:9px; border-radius:999px; flex:none; background:var(--border)"></span>
    <div style="flex:1; display:flex; flex-direction:column; gap:3px">
      <span style="font:600 13.5px/1.3 inherit">{t('currentStatus')}</span>
      <span id="pref-status-label" style="font-size:12.5px; color:var(--text-3)"></span>
    </div>
  </div>
  <div style="display:flex; flex-wrap:wrap; gap:10px">
    <button id="pref-accept" style="height:44px; display:flex; align-items:center; padding:0 20px; border-radius:7px; background:var(--accent-solid); color:var(--on-accent); border:none; font:600 13.5px/1 inherit; cursor:pointer">{t('acceptAll')}</button>
    <button id="pref-reject" style="height:44px; display:flex; align-items:center; padding:0 20px; border-radius:7px; border:1px solid var(--border); background:var(--surface); color:var(--text); font:600 13.5px/1 inherit; cursor:pointer">{t('rejectAll')}</button>
  </div>
  <p style="margin:0; font-size:12.5px; line-height:1.7; color:var(--muted)">{t('cookieNote')}</p>
</div>

<script define:vars={{
  labelUnset: lang === 'ar' ? 'لم يُتخذ اختيار بعد — الافتراضي هو الرفض.' : (lang === 'fr' ? 'Aucun choix effectué — refusé par défaut.' : (lang === 'es' ? 'Aún no se ha elegido — rechazado por defecto.' : (lang === 'pt' ? 'Nenhuma escolha feita — rejeitado por padrão.' : 'No choice made yet — defaults to rejected.'))),
  labelAccepted: lang === 'ar' ? 'مقبولة — يُحفظ ملف التفضيلات.' : (lang === 'fr' ? 'Accepté — le cookie de préférence est stocké.' : (lang === 'es' ? 'Aceptado — se guarda la cookie de preferencia.' : (lang === 'pt' ? 'Aceito — o cookie de preferência é armazenado.' : 'Accepted — the preference cookie is stored.'))),
  labelRejected: lang === 'ar' ? 'مرفوضة — لا تُحفظ أي كوكيز.' : (lang === 'fr' ? 'Refusé — aucun cookie stocké.' : (lang === 'es' ? 'Rechazado — no se almacena ninguna cookie.' : (lang === 'pt' ? 'Rejeitado — nenhum cookie armazenado.' : 'Rejected — no cookies are stored.')))
}}>
  document.addEventListener('DOMContentLoaded', () => {
    const dot = document.getElementById('pref-status-dot');
    const label = document.getElementById('pref-status-label');
    const acceptBtn = document.getElementById('pref-accept');
    const rejectBtn = document.getElementById('pref-reject');

    const render = () => {
      const consent = localStorage.getItem('cookie_consent');
      if (consent === 'accepted') {
        dot.style.background = 'var(--accent-solid)';
        label.textContent = labelAccepted;
      } else if (consent === 'rejected') {
        dot.style.background = 'var(--muted)';
        label.textContent = labelRejected;
      } else {
        dot.style.background = 'var(--border)';
        label.textContent = labelUnset;
      }
    };

    const setConsent = (value) => {
      localStorage.setItem('cookie_consent', value);
      render();
      if (value === 'accepted' && window.gtag) {
        window.gtag('consent', 'update', { analytics_storage: 'granted' });
        const script = document.createElement('script');
        script.src = 'https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX';
        script.async = true;
        document.head.appendChild(script);
        script.onload = () => window.gtag('config', 'G-XXXXXXXXXX');
      }
    };

    acceptBtn.addEventListener('click', () => setConsent('accepted'));
    rejectBtn.addEventListener('click', () => setConsent('rejected'));
    render();
  });
</script>
```

## Step 5 — English root pages (rewrite to import Layout + the matching shared component)

## src/pages/index.astro

**File:** `src/pages/index.astro` — replace entirely with:

```astro
---
import Layout from '../layouts/Layout.astro';
import Home from '../components/pages/Home.astro';
import { useTranslations } from '../i18n/utils';

const t = useTranslations('en');
---
<Layout title="Abrium - Open Source Claude Companion" description={t('heroSub') as string}>
  <Home lang="en" />
</Layout>
```

## src/pages/features.astro

**File:** `src/pages/features.astro` — replace entirely with:

```astro
---
import Layout from '../layouts/Layout.astro';
import Features from '../components/pages/Features.astro';
import { useTranslations } from '../i18n/utils';

const t = useTranslations('en');
---
<Layout title={t('featuresTitle') as string} description={t('featuresSub') as string}>
  <Features lang="en" />
</Layout>
```

## src/pages/faq.astro

**File:** `src/pages/faq.astro` — replace entirely with:

```astro
---
import Layout from '../layouts/Layout.astro';
import Faq from '../components/pages/Faq.astro';
import { useTranslations } from '../i18n/utils';

const t = useTranslations('en');
const faqs = t('faqs') as { q: string; a: string }[];
const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": faqs.map((f) => ({
    "@type": "Question",
    "name": f.q,
    "acceptedAnswer": { "@type": "Answer", "text": f.a }
  }))
};
---
<Layout title={t('faqTitle') as string} description={t('faqTitle') as string}>
  <script type="application/ld+json" set:html={JSON.stringify(faqSchema)} slot="head" />
  <Faq lang="en" />
</Layout>
```

## src/pages/download.astro

**File:** `src/pages/download.astro` — replace entirely with:

```astro
---
import Layout from '../layouts/Layout.astro';
import Download from '../components/pages/Download.astro';
import { useTranslations } from '../i18n/utils';

const t = useTranslations('en');
---
<Layout title={t('dlTitle') as string} description={t('dlSub') as string}>
  <Download lang="en" />
</Layout>
```

## src/pages/changelog.astro

**File:** `src/pages/changelog.astro` — replace entirely with:

```astro
---
import Layout from '../layouts/Layout.astro';
import Changelog from '../components/pages/Changelog.astro';
import { useTranslations } from '../i18n/utils';

const t = useTranslations('en');
const releases = t('releases') as { version: string }[];
const changelogSchema = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  "itemListElement": releases.map((r, i: number) => ({
    "@type": "ListItem",
    "position": i + 1,
    "name": `${r.version} - Initial release`
  }))
};
---
<Layout title={t('changelogTitle') as string} description={t('changelogTitle') as string}>
  <script type="application/ld+json" set:html={JSON.stringify(changelogSchema)} slot="head" />
  <Changelog lang="en" />
</Layout>
```

## src/pages/terms.astro

**File:** `src/pages/terms.astro` — replace entirely with:

```astro
---
import Layout from '../layouts/Layout.astro';
import Prose from '../components/pages/Prose.astro';
import { useTranslations } from '../i18n/utils';

const t = useTranslations('en');
const terms = t('terms') as { title: string };
---
<Layout title={terms.title} description={terms.title}>
  <Prose lang="en" kind="terms" />
</Layout>
```

## src/pages/privacy.astro

**File:** `src/pages/privacy.astro` — replace entirely with:

```astro
---
import Layout from '../layouts/Layout.astro';
import Prose from '../components/pages/Prose.astro';
import { useTranslations } from '../i18n/utils';

const t = useTranslations('en');
const privacy = t('privacy') as { title: string };
---
<Layout title={privacy.title} description={privacy.title}>
  <Prose lang="en" kind="privacy" />
</Layout>
```

## src/pages/contact.astro

**File:** `src/pages/contact.astro` — replace entirely with:

```astro
---
import Layout from '../layouts/Layout.astro';
import Contact from '../components/pages/Contact.astro';
import { useTranslations } from '../i18n/utils';

const t = useTranslations('en');
---
<Layout title={t('contactTitle') as string} description={t('contactSub') as string}>
  <Contact lang="en" />
</Layout>
```

## src/pages/cookie-preferences.astro

**File:** `src/pages/cookie-preferences.astro` — replace entirely with:

```astro
---
import Layout from '../layouts/Layout.astro';
import CookiePreferences from '../components/pages/CookiePreferences.astro';
import { useTranslations } from '../i18n/utils';

const t = useTranslations('en');
---
<Layout title={t('cookieTitle') as string} description={t('cookieTitle') as string}>
  <CookiePreferences lang="en" />
</Layout>
```

## Step 6 — Localized [lang] pages (ar/fr/es/pt — recreated after Step 1's deletion, same shared components)

## src/pages/[lang]/index.astro

**File:** `src/pages/[lang]/index.astro` — replace entirely with:

```astro
---
import Layout from '../../layouts/Layout.astro';
import Home from '../../components/pages/Home.astro';
import { useTranslations } from '../../i18n/utils';

export function getStaticPaths() {
  return [{ params: { lang: 'ar' } }, { params: { lang: 'fr' } }, { params: { lang: 'es' } }, { params: { lang: 'pt' } }];
}
const { lang } = Astro.params;
const t = useTranslations(lang as string);
---
<Layout title={t('heroTitle') as string} description={t('heroSub') as string}>
  <Home lang={lang as string} />
</Layout>
```

## src/pages/[lang]/features.astro

**File:** `src/pages/[lang]/features.astro` — replace entirely with:

```astro
---
import Layout from '../../layouts/Layout.astro';
import Features from '../../components/pages/Features.astro';
import { useTranslations } from '../../i18n/utils';

export function getStaticPaths() {
  return [{ params: { lang: 'ar' } }, { params: { lang: 'fr' } }, { params: { lang: 'es' } }, { params: { lang: 'pt' } }];
}
const { lang } = Astro.params;
const t = useTranslations(lang as string);
---
<Layout title={t('featuresTitle') as string} description={t('featuresSub') as string}>
  <Features lang={lang as string} />
</Layout>
```

## src/pages/[lang]/faq.astro

**File:** `src/pages/[lang]/faq.astro` — replace entirely with:

```astro
---
import Layout from '../../layouts/Layout.astro';
import Faq from '../../components/pages/Faq.astro';
import { useTranslations } from '../../i18n/utils';

export function getStaticPaths() {
  return [{ params: { lang: 'ar' } }, { params: { lang: 'fr' } }, { params: { lang: 'es' } }, { params: { lang: 'pt' } }];
}
const { lang } = Astro.params;
const t = useTranslations(lang as string);
const faqs = t('faqs') as { q: string; a: string }[];
const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": faqs.map((f) => ({
    "@type": "Question",
    "name": f.q,
    "acceptedAnswer": { "@type": "Answer", "text": f.a }
  }))
};
---
<Layout title={t('faqTitle') as string} description={t('faqTitle') as string}>
  <script type="application/ld+json" set:html={JSON.stringify(faqSchema)} slot="head" />
  <Faq lang={lang as string} />
</Layout>
```

## src/pages/[lang]/download.astro

**File:** `src/pages/[lang]/download.astro` — replace entirely with:

```astro
---
import Layout from '../../layouts/Layout.astro';
import Download from '../../components/pages/Download.astro';
import { useTranslations } from '../../i18n/utils';

export function getStaticPaths() {
  return [{ params: { lang: 'ar' } }, { params: { lang: 'fr' } }, { params: { lang: 'es' } }, { params: { lang: 'pt' } }];
}
const { lang } = Astro.params;
const t = useTranslations(lang as string);
---
<Layout title={t('dlTitle') as string} description={t('dlSub') as string}>
  <Download lang={lang as string} />
</Layout>
```

## src/pages/[lang]/changelog.astro

**File:** `src/pages/[lang]/changelog.astro` — replace entirely with:

```astro
---
import Layout from '../../layouts/Layout.astro';
import Changelog from '../../components/pages/Changelog.astro';
import { useTranslations } from '../../i18n/utils';

export function getStaticPaths() {
  return [{ params: { lang: 'ar' } }, { params: { lang: 'fr' } }, { params: { lang: 'es' } }, { params: { lang: 'pt' } }];
}
const { lang } = Astro.params;
const t = useTranslations(lang as string);
const releases = t('releases') as { version: string }[];
const changelogSchema = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  "itemListElement": releases.map((r, i: number) => ({
    "@type": "ListItem",
    "position": i + 1,
    "name": `${r.version} - Initial release`
  }))
};
---
<Layout title={t('changelogTitle') as string} description={t('changelogTitle') as string}>
  <script type="application/ld+json" set:html={JSON.stringify(changelogSchema)} slot="head" />
  <Changelog lang={lang as string} />
</Layout>
```

## src/pages/[lang]/terms.astro

**File:** `src/pages/[lang]/terms.astro` — replace entirely with:

```astro
---
import Layout from '../../layouts/Layout.astro';
import Prose from '../../components/pages/Prose.astro';
import { useTranslations } from '../../i18n/utils';

export function getStaticPaths() {
  return [{ params: { lang: 'ar' } }, { params: { lang: 'fr' } }, { params: { lang: 'es' } }, { params: { lang: 'pt' } }];
}
const { lang } = Astro.params;
const t = useTranslations(lang as string);
const terms = t('terms') as { title: string };
---
<Layout title={terms.title} description={terms.title}>
  <Prose lang={lang as string} kind="terms" />
</Layout>
```

## src/pages/[lang]/privacy.astro

**File:** `src/pages/[lang]/privacy.astro` — replace entirely with:

```astro
---
import Layout from '../../layouts/Layout.astro';
import Prose from '../../components/pages/Prose.astro';
import { useTranslations } from '../../i18n/utils';

export function getStaticPaths() {
  return [{ params: { lang: 'ar' } }, { params: { lang: 'fr' } }, { params: { lang: 'es' } }, { params: { lang: 'pt' } }];
}
const { lang } = Astro.params;
const t = useTranslations(lang as string);
const privacy = t('privacy') as { title: string };
---
<Layout title={privacy.title} description={privacy.title}>
  <Prose lang={lang as string} kind="privacy" />
</Layout>
```

## src/pages/[lang]/contact.astro

**File:** `src/pages/[lang]/contact.astro` — replace entirely with:

```astro
---
import Layout from '../../layouts/Layout.astro';
import Contact from '../../components/pages/Contact.astro';
import { useTranslations } from '../../i18n/utils';

export function getStaticPaths() {
  return [{ params: { lang: 'ar' } }, { params: { lang: 'fr' } }, { params: { lang: 'es' } }, { params: { lang: 'pt' } }];
}
const { lang } = Astro.params;
const t = useTranslations(lang as string);
---
<Layout title={t('contactTitle') as string} description={t('contactSub') as string}>
  <Contact lang={lang as string} />
</Layout>
```

## src/pages/[lang]/cookie-preferences.astro

**File:** `src/pages/[lang]/cookie-preferences.astro` — replace entirely with:

```astro
---
import Layout from '../../layouts/Layout.astro';
import CookiePreferences from '../../components/pages/CookiePreferences.astro';
import { useTranslations } from '../../i18n/utils';

export function getStaticPaths() {
  return [{ params: { lang: 'ar' } }, { params: { lang: 'fr' } }, { params: { lang: 'es' } }, { params: { lang: 'pt' } }];
}
const { lang } = Astro.params;
const t = useTranslations(lang as string);
---
<Layout title={t('cookieTitle') as string} description={t('cookieTitle') as string}>
  <CookiePreferences lang={lang as string} />
</Layout>
```

## Step 7 — Verify

```
npm run build
```

Expect: 46 static pages, zero errors. Then diff-check a sample per language
directly in `dist/`:
- `dist/features/index.html` should contain "Everything the Vault does."
- `dist/ar/index.html` should contain "لا تفقد أي Artifact من كلود بعد اليوم."
- `dist/fr/features/index.html` should contain "Tout ce que fait le Coffre."
Report back: build result, and confirmation of these three checks.

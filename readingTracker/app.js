(() => {
  "use strict";

  const APP_CONFIG = window.APP_CONFIG || {
    appName: "أثر القارئ",
    storageKey: "athar-alqari-reading-tracker-v2",
    exportId: "athar-alqari-reading-tracker",
    exportSlug: "athar-alqari",
    featureFlags: { postSessionAds: false }
  };
  const APP_NAME = APP_CONFIG.appName;
  const STORAGE_KEY = APP_CONFIG.storageKey;
  const LEGACY_STORAGE_KEYS = ["midad-reading-tracker-v1"];
  const DB_NAME = "midad-media";
  const DB_VERSION = 1;
  const QUOTES_STORE = "quotes";

  const defaultState = {
    books: [],
    sessions: [],
    readArticles: {},
    unlockedAchievements: {},
    settings: {
      dailyGoalMinutes: 30,
      weeklyGoalSessions: 5,
      reminderMinutes: 15,
      focusMusicTrack: "rain",
      focusMusicVolume: 28
    },
    activeTimer: null
  };

  const articles = {
    habit: {
      tag: "بناء العادة · 5 دقائق",
      title: "لا تبحث عن ساعة فارغة؛ ابدأ بعشر دقائق",
      intro: "عادة القراءة القابلة للاستمرار تبدأ أصغر مما نتخيّل.",
      body: `
        <p>حين نربط القراءة بوقت طويل وهدوء كامل، تصبح البداية صعبة. الأفضل أن نختار حدًا أدنى واضحًا: عشر دقائق بعد القهوة، أو خمس صفحات قبل النوم. الهدف الأول ليس إنهاء الكتاب؛ بل جعل العودة إليه سهلة.</p>
        <h3>اربط القراءة بإشارة موجودة</h3>
        <p>اختر حدثًا يتكرر أصلًا: بعد الإفطار، في المواصلات، أو قبل إطفاء الضوء. ضع الكتاب في المكان نفسه حتى يصبح ظهوره تذكيرًا بصريًا لا يحتاج إلى إرادة جديدة كل يوم.</p>
        <blockquote>اجعل النجاح في البداية هو الحضور، لا عدد الصفحات.</blockquote>
        <h3>توقّف وأنت ما زلت راغبًا</h3>
        <p>من المفيد أحيانًا أن تتوقف عند نهاية وقتك المحدد حتى لو استطعت المتابعة. هذا يترك خيطًا من الفضول يسحبك إلى الجلسة التالية، ويمنع الحماس المؤقت من التحول إلى إرهاق.</p>
        <h3>سجّل الأثر، لا الكمال</h3>
        <p>تتبّع الدقائق والصفحات دون أن تحوّل القراءة إلى سباق. الأرقام هنا مرآة للاستمرار، وليست حكمًا على جودة القارئ. انظر إلى متوسط أسبوع أو شهر بدل الحكم على يوم واحد.</p>
        <h3>خطة عملية لسبعة أيام</h3>
        <p>اختر إشارة ثابتة، وحدًا أدنى من 10 دقائق، وكتابًا ظاهرًا في المكان. بعد كل جلسة اكتب جملة واحدة: ماذا عرفت؟ في نهاية الأسبوع راجع الأيام التي نجحت واسأل ما الذي جعل البداية أسهل.</p>`
    },
    why: {
      tag: "لماذا نقرأ؟ · 4 دقائق",
      title: "ما الذي تفعله القراءة بعقلك؟",
      intro: "القراءة ليست جمع معلومات فحسب؛ إنها تدريب على الانتباه والتخيّل.",
      body: `
        <p>عندما تقرأ نصًا طويلًا، يحتفظ عقلك بتفاصيل سابقة ويصلها بما يأتي بعدها. هذه الحركة البسيطة تمرين على الذاكرة العاملة وعلى متابعة فكرة تتطور ببطء، بعيدًا عن القفز السريع بين المقاطع.</p>
        <h3>مختبر لوجهات النظر</h3>
        <p>تسمح الرواية والسيرة والمقال الجيد بأن ترى العالم مؤقتًا من موقع شخص آخر. لا يعني ذلك الموافقة، بل توسيع قدرتك على فهم الدوافع والسياقات قبل إصدار الحكم.</p>
        <blockquote>الكتاب الجيد لا يقدّم إجابات فقط؛ بل يحسّن الأسئلة التي تستطيع طرحها.</blockquote>
        <h3>لغة أدق، وفكر أوضح</h3>
        <p>كلما اتسعت المفردات، أصبحت الفروق الدقيقة أسهل في الملاحظة والتعبير. والقدرة على تسمية ما نفكر فيه أو نشعر به تساعدنا على التعامل معه بوضوح أكبر.</p>
        <h3>ماذا تقول إحدى الدراسات الطويلة؟</h3>
        <p>تابعت دراسة رصدية 3,635 شخصًا فوق سن الخمسين لمدة تصل إلى 12 عامًا. ارتبطت قراءة الكتب بانخفاض نسبته 20% في خطر الوفاة مقارنة بعدم قراءة الكتب، وبفارق بقاء غير معدّل بلغ 23 شهرًا عند نقطة 80% من البقاء. هذه علاقة إحصائية بعد ضبط عوامل عديدة، وليست دليلًا على أن القراءة وحدها سببت العمر الأطول.</p>
        <blockquote>استخدم الرقم كدافع لطيف، لا كوعد صحي. القراءة لا تستبدل النوم أو الحركة أو الرعاية الطبية.</blockquote>`,
      sources: [
        {
          label: "Bavishi, Slade & Levy (2016), Social Science & Medicine — 3,635 مشاركًا ومتابعة 12 عامًا",
          url: "https://www.sciencedirect.com/science/article/abs/pii/S0277953616303689"
        }
      ]
    },
    remember: {
      tag: "قراءة فعّالة · 5 دقائق",
      title: "كيف تتذكّر ما تقرأ؟",
      intro: "التذكّر يبدأ بالتفاعل مع الفكرة، لا بكثرة التظليل.",
      body: `
        <p>قبل فتح الفصل، اسأل: ما الذي أريد فهمه؟ وجود سؤال صغير يعطي عقلك خطافًا يعلّق عليه المعلومات. وبعد القراءة، أغلق الكتاب وحاول استعادة الفكرة بلغتك قبل الرجوع إلى النص.</p>
        <h3>اكتب أقل، لكن أفضل</h3>
        <p>بدل نسخ فقرات طويلة، احفظ اقتباسًا واحدًا واكتب تحته سبب أهميته لك. التعليق الشخصي يجعل الاقتباس قابلًا للاستخدام لاحقًا، لا مجرد سطر جميل منسي.</p>
        <blockquote>إذا لم تستطع شرح الفكرة بجملة بسيطة، امنحها جولة قراءة أخرى.</blockquote>
        <h3>راجع على مسافات</h3>
        <p>ارجع إلى اقتباساتك بعد يوم، ثم بعد أسبوع. محاولة الاسترجاع على فترات أقوى من إعادة القراءة المتتالية، وتكشف لك ما الذي بقي وما الذي يحتاج إلى توضيح.</p>
        <h3>البيانات وراء النصيحة</h3>
        <p>راجعت دراسة منهجية حديثة 1,818 سجلًا وانتهت إلى 56 دراسة تضم 63 تجربة في تعليم المهن الصحية. أظهرت 43 دراسة فوائد مهمة للممارسة المتباعدة و/أو الاسترجاع مقارنة بمجموعات الضبط. كانت التصاميم متنوعة، لذلك لا يوجد جدول سحري واحد يصلح لكل مادة.</p>
        <h3>جرّب دورة 2–1–7</h3>
        <p>بعد دقيقتين من القراءة، توقّف لحظة واسأل نفسك عن الفكرة. بعد يوم، اكتبها من الذاكرة. وبعد سبعة أيام، اختبر نفسك مرة أخرى قبل فتح الملاحظات.</p>`,
      sources: [
        {
          label: "Trumble et al. (2024) — مراجعة منهجية للممارسة المتباعدة والاسترجاع",
          url: "https://pubmed.ncbi.nlm.nih.gov/37615780/"
        }
      ]
    },
    focus: {
      tag: "تركيز · 3 دقائق",
      title: "طقس صغير لجلسة بلا تشتيت",
      intro: "التركيز أسهل حين تهيّئ له البيئة بدل أن تفاوض نفسك كل دقيقة.",
      body: `
        <p>اختر مكانًا وإشارة بداية ثابتة: كوب ماء، وضع الهاتف خارج مجال اليد، ثم تشغيل المؤقّت. هذه الخطوات القصيرة تخبر عقلك أن نمطًا مختلفًا من الانتباه قد بدأ.</p>
        <h3>حدّد نهاية واضحة</h3>
        <p>جلسة من عشرين دقيقة أسهل نفسيًا من وعد مفتوح بالقراءة. عندما تعرف متى ستتوقف، تقل رغبة العقل في البحث عن مهرب سريع.</p>
        <blockquote>لا تحاول منع كل فكرة مشتتة؛ اكتبها سريعًا ثم عد إلى السطر.</blockquote>
        <h3>اقرأ بسؤال واحد</h3>
        <p>قبل الجلسة، اختر شيئًا واحدًا تبحث عنه: حجة الكاتب، تحوّل شخصية، أو فكرة يمكن تطبيقها. السؤال يعطي انتباهك اتجاهًا دون أن يحوّل الجلسة إلى اختبار.</p>
        <h3>الإشعارات ليست حدثًا محايدًا</h3>
        <p>في دراسة ميدانية بقي بعد التنظيف 247 مشاركًا، ارتبط تقليل مقاطعات الإشعارات بأداء أفضل وإجهاد أقل. نقلت الدراسة متوسطًا مرجعيًا يقارب 65.3 إشعارًا يوميًا؛ العدد ليس ثابتًا لكل شخص، لكنه يوضح مقدار الاحتكاك المحتمل.</p>
        <h3>نصيحة عملية</h3>
        <p>فعّل وضع التركيز في الهاتف، اسمح بالمكالمات التي تهمك، وأخفِ معاينات الإشعارات. وضع الهاتف على الصامت وحده لا يزيل الإشارة البصرية أو عادة التفقّد.</p>`,
      sources: [
        {
          label: "Ohly & Bastin (2023) — مقاطعات الإشعارات والأداء والإجهاد",
          url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC10244611/"
        }
      ]
    },
    sessions: {
      tag: "بياناتك · 6 دقائق",
      title: "هل توجد مدة مثالية لجلسة القراءة؟",
      intro: "الأفضل ليس دائمًا الأطول؛ الأفضل هو ما تستطيع تكراره مع انتباه جيد.",
      body: `
        <p>لا تدعم الأدلة قاعدة عامة تقول إن 25 أو 45 أو 90 دقيقة هي المدة المثالية للجميع ولكل مهمة. صعوبة النص، النوم، الخبرة، والهدف من القراءة تغيّر ما تستطيع الحفاظ عليه.</p>
        <h3>ابدأ من الوسيط، لا من أطول جلسة</h3>
        <p>يعرض تقرير ${APP_NAME} وسيط جلساتك لأنه أقل تأثرًا بجلسة طويلة استثنائية من المتوسط. إذا كان وسيطك 22 دقيقة، جرّب هدفًا بين 20 و25 دقيقة لأسبوعين، ثم راقب الاستمرار والصفحات والملاحظات.</p>
        <h3>هل الاستراحات مفيدة؟</h3>
        <p>وجدت تجربة على اليقظة المستمرة أن الانتباه انخفض مع الوقت، وأن أول استراحة أعادت الحساسية الإدراكية وخفّضت الجهد والضغط المُبلّغ عنه. المهمة المختبرية ليست قراءة كتاب، لذلك نستخدمها سببًا للاختبار الشخصي لا وصفة جامدة.</p>
        <h3>هل وقت اليوم مهم؟</h3>
        <p>في مراجعة منهجية لـ64 دراسة على البالغين الأصغر سنًا، وجدت 29 دراسة دليلًا على أداء أفضل عند توافق وقت المهمة مع النمط الصباحي أو المسائي. لكن أكثر من 80% من الدراسات لم تجد أثرًا رئيسيًا للنمط الزمني وحده. المعنى العملي: اختبر وقتين متكررين في حياتك بدل افتراض أن الصباح أفضل للجميع.</p>
        <blockquote>سجّل جلسات كافية أولًا. خمس جلسات لا تكفي للحكم على أفضل وقت أو مدة.</blockquote>
        <h3>تجربة شخصية لمدة أسبوعين</h3>
        <p>في الأسبوع الأول اقرأ 20–30 دقيقة في وقت ثابت. في الثاني جرّب وقتًا آخر مع كتاب مشابه الصعوبة. قارن الاستمرار، الصفحات لكل ساعة، وقدرتك على تلخيص الفكرة. لا تغيّر الوقت والمدة والكتاب معًا.</p>`,
      sources: [
        {
          label: "Chauhan et al. (2025) — مراجعة منهجية للنمط الزمني والأداء المعرفي",
          url: "https://pubmed.ncbi.nlm.nih.gov/40293205/"
        },
        {
          label: "Helton & Russell (2015) — الاستراحات وانخفاض اليقظة",
          url: "https://pubmed.ncbi.nlm.nih.gov/24557319/"
        }
      ]
    },
    study: {
      tag: "علم التعلّم · 7 دقائق",
      title: "من القراءة إلى التذكّر: اختبر نفسك",
      intro: "الشعور بأن الصفحة مألوفة لا يساوي القدرة على استرجاعها لاحقًا.",
      body: `
        <p>إعادة القراءة قد تجعل النص مألوفًا، لكن الاختبار الحقيقي هو: هل تستطيع شرح الفكرة والكتاب مغلق؟ الاسترجاع النشط يجبر الذاكرة على بناء طريق إلى المعلومة، والممارسة المتباعدة تعيد استخدام هذا الطريق بعد أن يبدأ بالنسيان.</p>
        <h3>ما حجم الدليل؟</h3>
        <p>في مراجعة منهجية لتعليم المهن الصحية، أظهرت 43 من 56 دراسة فوائد مهمة للممارسة المتباعدة و/أو الاسترجاع. وفي مراجعة تحليلية لبحوث صفية شملت أكثر من 3,000 متعلّم و31 حجم أثر، كان الأثر المجمع للممارسة الموزعة متوسطًا لصالحها مقارنة بالممارسة المكثفة (d = 0.54، وفاصل ثقة 95% من 0.31 إلى 0.77).</p>
        <h3>حوّل كل جلسة إلى تعلّم</h3>
        <ol>
          <li>اكتب هدفًا قابلًا للملاحظة: «أشرح ثلاث أفكار» بدل «أدرس الفصل».</li>
          <li>اقرأ جزءًا قصيرًا، ثم أغلق المصدر واكتب ما تتذكره.</li>
          <li>قارن إجابتك بالمصدر وصحّح الفجوات بلون مختلف.</li>
          <li>أعد اختبار الفكرة غدًا، ثم بعد عدة أيام.</li>
        </ol>
        <h3>لا تجعل المؤقّت هو الهدف</h3>
        <p>جلسة 60 دقيقة بلا استرجاع قد تعطيك شعورًا بالإنجاز أكثر من تعلّم قابل للاستدعاء. استخدم الوقت كحاوية، ثم قيّم الناتج: أسئلة أجبت عنها، فكرة شرحتها، أو مسألة حللتها.</p>
        <blockquote>في نهاية كل جلسة: اكتب سؤالين سيختبرانك في المراجعة القادمة.</blockquote>`,
      sources: [
        {
          label: "Trumble et al. (2024) — 56 دراسة و63 تجربة",
          url: "https://pubmed.ncbi.nlm.nih.gov/37615780/"
        },
        {
          label: "Mawson & Kang (2025) — تحليل تلوي للممارسة الموزعة في الصف",
          url: "https://pubmed.ncbi.nlm.nih.gov/40564553/"
        }
      ]
    }
  };

  const FAST_PACE_MESSAGES = [
    "إيقاعك اليوم أسرع من المعتاد؛ احتفظ بما فهمته بجملة قصيرة قبل المتابعة.",
    "تقدّمت بخفّة جميلة. إن كان الفهم واضحًا، فهذا إيقاع مناسب لك اليوم.",
    "كانت الصفحات أسرع هذه المرة؛ خذ لحظة لتثبيت الفكرة الأهم.",
    "قرأت بوتيرة أسرع من سجلك الأخير، دون أن يكون ذلك سباقًا.",
    "إيقاع سريع ولطيف. راجع اقتباسًا واحدًا لتمنح الجلسة أثرًا أطول.",
    "خطوتك اليوم خفيفة. ما دمت حاضرًا مع النص، فالسرعة مجرد ملاحظة.",
    "أنجزت الصفحات بوتيرة أسرع من عادتك؛ سجّل ما تريد تذكّره منها.",
    "جلسة سريعة مقارنة بتاريخك القريب. دع الفهم، لا الرقم، يقود الجلسة التالية."
  ];

  const SLOW_PACE_MESSAGES = [
    "أخذت الصفحات وقتًا أطول اليوم، وربما كان النص يستحق هذا التمهّل.",
    "إيقاعك أهدأ من المعتاد؛ القراءة المتأنية قد تكون علامة انتباه عميق.",
    "منحت كل صفحة مساحة أكبر. لا مشكلة ما دام الوقت خدم فهمك.",
    "كانت الجلسة أبطأ قليلًا؛ بعض الأفكار تحتاج إلى إقامة أطول.",
    "تمهّلت اليوم، وهذا ليس تراجعًا. دوّن ما جعل هذه الصفحات كثيفة.",
    "سرعة القراءة تتغيّر مع صعوبة النص والطاقة. استمع إلى احتياجك اليوم.",
    "أمضيت وقتًا أطول مع كل صفحة؛ قد يكون ذلك أثرًا للتركيز لا للبطء.",
    "إيقاع هادئ مقارنة بتاريخك القريب. المهم أن تخرج بفكرة واضحة."
  ];

  const ACHIEVEMENTS = [
    { id: "first-session", icon: "✦", title: "البداية", description: "احفظ أول جلسة قراءة.", metric: "sessions", target: 1 },
    { id: "sessions-10", icon: "◷", title: "عشر جلسات", description: "أكمل 10 جلسات قراءة.", metric: "sessions", target: 10 },
    { id: "sessions-25", icon: "◷", title: "إيقاع ثابت", description: "أكمل 25 جلسة قراءة.", metric: "sessions", target: 25 },
    { id: "sessions-50", icon: "◉", title: "قارئ مواظب", description: "أكمل 50 جلسة قراءة.", metric: "sessions", target: 50 },
    { id: "sessions-100", icon: "★", title: "مئة أثر", description: "أكمل 100 جلسة قراءة.", metric: "sessions", target: 100 },
    { id: "pages-50", icon: "▤", title: "خمسون صفحة", description: "سجّل قراءة 50 صفحة.", metric: "pages", target: 50 },
    { id: "pages-100", icon: "▤", title: "مئة صفحة", description: "سجّل قراءة 100 صفحة.", metric: "pages", target: 100 },
    { id: "pages-500", icon: "▥", title: "رف كامل", description: "سجّل قراءة 500 صفحة.", metric: "pages", target: 500 },
    { id: "pages-1000", icon: "♛", title: "ألف صفحة", description: "سجّل قراءة 1,000 صفحة.", metric: "pages", target: 1000 },
    { id: "minutes-60", icon: "⌛", title: "ساعة قراءة", description: "اجمع 60 دقيقة قراءة.", metric: "minutes", target: 60 },
    { id: "minutes-600", icon: "⌛", title: "عشر ساعات", description: "اجمع 600 دقيقة قراءة.", metric: "minutes", target: 600 },
    { id: "streak-3", icon: "♨", title: "ثلاثة أيام", description: "حافظ على سلسلة 3 أيام.", metric: "streak", target: 3 },
    { id: "streak-7", icon: "♨", title: "أسبوع قارئ", description: "حافظ على سلسلة 7 أيام.", metric: "streak", target: 7 },
    { id: "streak-30", icon: "☀", title: "شهر من الأثر", description: "حافظ على سلسلة 30 يومًا.", metric: "streak", target: 30 },
    { id: "quote-1", icon: "”", title: "فكرة باقية", description: "احفظ أول اقتباس.", metric: "quotes", target: 1 },
    { id: "quotes-10", icon: "”", title: "دفتر الاقتباسات", description: "احفظ 10 اقتباسات.", metric: "quotes", target: 10 },
    { id: "manual-1", icon: "✎", title: "ذاكرة مكتملة", description: "أضف أول جلسة يدويًا.", metric: "manualSessions", target: 1 },
    { id: "tracked-10", icon: "▶", title: "رفيق المؤقّت", description: "أكمل 10 جلسات بالمؤقّت.", metric: "trackedSessions", target: 10 },
    { id: "book-1", icon: "✓", title: "كتاب مكتمل", description: "أكمل قراءة كتاب واحد.", metric: "completedBooks", target: 1 },
    { id: "books-5", icon: "♜", title: "مكتبة منجزة", description: "أكمل قراءة 5 كتب.", metric: "completedBooks", target: 5 }
  ];

  let state = loadState();
  let quoteCache = [];
  let dbPromise = null;
  let timerInterval = null;
  let deferredInstallPrompt = null;
  let currentBookFilter = "all";
  let pendingFinishWasRunning = false;
  let recordedAudioBlob = null;
  let mediaRecorder = null;
  let recordingStartedAt = null;
  let recordingTimer = null;
  let discardRecordedAudio = false;
  let reportRange = 7;
  let focusAudioContext = null;
  let focusMusicNodes = [];
  let focusMusicMaster = null;
  let focusMusicPlaying = false;
  let capturedImageBlob = null;
  let cameraStream = null;
  let cameraTrack = null;
  let cameraFacingMode = "environment";
  let cameraZoom = 1;
  let pinchStartDistance = 0;
  let pinchStartZoom = 1;
  let cameraPinching = false;
  let pendingSettingsTarget = null;

  const INSTALL_FLAG_KEY = `${STORAGE_KEY}-installed`;

  const $ = (selector, context = document) => context.querySelector(selector);
  const $$ = (selector, context = document) => [...context.querySelectorAll(selector)];

  function loadState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY) || LEGACY_STORAGE_KEYS.map((key) => localStorage.getItem(key)).find(Boolean);
      const stored = JSON.parse(raw);
      if (!stored || typeof stored !== "object") return structuredClone(defaultState);
      const { studySessions: _legacyStudySessions, activeStudy: _legacyActiveStudy, ...storedWithoutStudy } = stored;
      return {
        ...structuredClone(defaultState),
        ...storedWithoutStudy,
        settings: { ...defaultState.settings, ...(stored.settings || {}) },
        books: Array.isArray(stored.books) ? stored.books : [],
        sessions: Array.isArray(stored.sessions) ? stored.sessions : [],
        readArticles: stored.readArticles && typeof stored.readArticles === "object" ? stored.readArticles : {},
        unlockedAchievements: stored.unlockedAchievements && typeof stored.unlockedAchievements === "object" ? stored.unlockedAchievements : {},
        activeTimer: stored.activeTimer || null
      };
    } catch {
      return structuredClone(defaultState);
    }
  }

  function saveState() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  function uid(prefix = "id") {
    return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 9)}`;
  }

  function escapeHTML(value = "") {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function toArabicNumber(value) {
    return new Intl.NumberFormat("ar", { maximumFractionDigits: 0 }).format(value || 0);
  }

  function displayNumber(value) {
    return Number.isFinite(Number(value)) ? toArabicNumber(Number(value)) : "—";
  }

  function formatDate(dateValue, options = {}) {
    const date = new Date(dateValue);
    const hasStyle = "dateStyle" in options || "timeStyle" in options;
    return new Intl.DateTimeFormat("ar", hasStyle ? options : { day: "numeric", month: "short", ...options }).format(date);
  }

  function localDateKey(dateValue = Date.now()) {
    const date = new Date(dateValue);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  function formatDuration(seconds) {
    const safeSeconds = Math.max(0, Math.floor(seconds || 0));
    const hours = Math.floor(safeSeconds / 3600);
    const minutes = Math.floor((safeSeconds % 3600) / 60);
    const secs = safeSeconds % 60;
    return [hours, minutes, secs].map((part) => String(part).padStart(2, "0")).join(":");
  }

  function humanDuration(seconds) {
    if (!Number(seconds)) return "0 دقيقة";
    const minutes = Math.max(1, Math.round((seconds || 0) / 60));
    if (minutes < 60) return `${toArabicNumber(minutes)} دقيقة`;
    const hours = Math.floor(minutes / 60);
    const remainder = minutes % 60;
    return remainder
      ? `${toArabicNumber(hours)} س و${toArabicNumber(remainder)} د`
      : `${toArabicNumber(hours)} ساعة`;
  }

  function fileToDataURL(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  function dataURLToBlob(dataURL) {
    const [meta, base64] = dataURL.split(",");
    const mime = meta.match(/data:(.*?);/)?.[1] || "application/octet-stream";
    const bytes = atob(base64);
    const array = new Uint8Array(bytes.length);
    for (let index = 0; index < bytes.length; index += 1) array[index] = bytes.charCodeAt(index);
    return new Blob([array], { type: mime });
  }

  function blobToDataURL(blob) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  function openDatabase() {
    if (dbPromise) return dbPromise;
    dbPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(QUOTES_STORE)) {
          const store = db.createObjectStore(QUOTES_STORE, { keyPath: "id" });
          store.createIndex("createdAt", "createdAt");
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    return dbPromise;
  }

  async function idbRequest(mode, action) {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(QUOTES_STORE, mode);
      const store = transaction.objectStore(QUOTES_STORE);
      const request = action(store);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async function getAllQuotes() {
    quoteCache = await idbRequest("readonly", (store) => store.getAll());
    quoteCache.sort((a, b) => b.createdAt - a.createdAt);
    return quoteCache;
  }

  async function putQuote(quote) {
    await idbRequest("readwrite", (store) => store.put(quote));
    await getAllQuotes();
  }

  async function deleteQuote(id) {
    await idbRequest("readwrite", (store) => store.delete(id));
    await getAllQuotes();
  }

  async function clearQuotes() {
    await idbRequest("readwrite", (store) => store.clear());
    quoteCache = [];
  }

  function showToast(message, type = "success") {
    const toast = document.createElement("div");
    toast.className = `toast ${type === "error" ? "error" : ""}`;
    toast.textContent = message;
    $("#toastRegion").appendChild(toast);
    window.setTimeout(() => toast.remove(), 3500);
  }

  function openModal(id) {
    const modal = document.getElementById(id);
    if (!modal) return;
    modal.classList.remove("hidden");
    document.body.style.overflow = "hidden";
    window.setTimeout(() => $("input, textarea, select, button", modal)?.focus(), 30);
  }

  function closeModal(id) {
    const modal = document.getElementById(id);
    if (!modal) return;
    modal.classList.add("hidden");
    if (!$$(".modal-backdrop:not(.hidden)").length) document.body.style.overflow = "";
    if (id === "finishSessionModal" && pendingFinishWasRunning && state.activeTimer?.status === "paused") {
      resumeTimer();
    }
    if (id === "quoteModal") stopRecording(true);
  }

  function navigate(page) {
    const targetPage = document.getElementById(`page-${page}`) ? page : "home";
    $$(".page").forEach((element) => element.classList.toggle("active", element.id === `page-${targetPage}`));
    $$("[data-page]").forEach((button) => button.classList.toggle("active", button.dataset.page === targetPage));
    $("#headerMenu")?.classList.add("hidden");
    $("#headerMenuButton")?.setAttribute("aria-expanded", "false");
    history.replaceState(null, "", `#${targetPage}`);
    window.scrollTo({ top: 0, behavior: "smooth" });
    if (targetPage === "home") renderQuotes();
    if (targetPage === "timer") renderSessionsHistory();
    if (targetPage === "reports") {
      renderReports();
      renderAchievements();
    }
    if (targetPage === "articles") renderArticleStates();
    if (targetPage === "settings" && pendingSettingsTarget) {
      const target = document.getElementById(pendingSettingsTarget);
      pendingSettingsTarget = null;
      window.setTimeout(() => target?.scrollIntoView({ behavior: "smooth", block: "center" }), 180);
    }
  }

  function renderDates() {
    const now = new Date();
    try {
      $("#hijriDate").textContent = new Intl.DateTimeFormat("ar-u-ca-islamic", {
        weekday: "long",
        day: "numeric",
        month: "long"
      }).format(now);
    } catch {
      $("#hijriDate").textContent = new Intl.DateTimeFormat("ar", {
        weekday: "long",
        day: "numeric",
        month: "long"
      }).format(now);
    }
    $("#gregorianDate").textContent = new Intl.DateTimeFormat("ar", {
      day: "numeric",
      month: "long",
      year: "numeric"
    }).format(now);
  }

  function applyAppIdentity() {
    document.title = `${APP_NAME} | متتبّع القراءة`;
    document.querySelector('meta[name="description"]')?.setAttribute("content", `${APP_NAME} — ${APP_CONFIG.description}`);
    document.querySelector('meta[name="application-name"]')?.setAttribute("content", APP_NAME);
    document.querySelector('meta[name="apple-mobile-web-app-title"]')?.setAttribute("content", APP_NAME);
    $$('[data-app-name]').forEach((element) => { element.textContent = APP_NAME; });
  }

  function getTodaySeconds() {
    const today = localDateKey();
    return state.sessions
      .filter((session) => localDateKey(session.endedAt) === today)
      .reduce((total, session) => total + Number(session.durationSeconds || 0), 0);
  }

  function calculateStreak() {
    const sessionDays = new Set(state.sessions.map((session) => localDateKey(session.endedAt)));
    if (!sessionDays.size) return 0;
    const cursor = new Date();
    const todayKey = localDateKey(cursor);
    if (!sessionDays.has(todayKey)) cursor.setDate(cursor.getDate() - 1);
    let streak = 0;
    while (sessionDays.has(localDateKey(cursor))) {
      streak += 1;
      cursor.setDate(cursor.getDate() - 1);
    }
    return streak;
  }

  function bookById(id) {
    return state.books.find((book) => book.id === id);
  }

  function bookProgress(book) {
    return Math.min(100, Math.round(((book.currentPage || 0) / Math.max(1, book.totalPages)) * 100));
  }

  function readingSecondsForBook(bookId) {
    return state.sessions
      .filter((session) => session.bookId === bookId)
      .reduce((total, session) => total + Number(session.durationSeconds || 0), 0);
  }

  function renderDashboard() {
    const todayMinutes = Math.round(getTodaySeconds() / 60);
    const dailyGoal = Number(state.settings.dailyGoalMinutes) || 30;
    const goalPercent = Math.min(100, Math.round((todayMinutes / dailyGoal) * 100));
    const activeBooks = state.books.filter((book) => bookProgress(book) < 100);
    const completedBooks = state.books.length - activeBooks.length;
    const streak = calculateStreak();

    $("#todayMinutes").textContent = toArabicNumber(todayMinutes);
    $("#todayGoalCaption").textContent = todayMinutes
      ? goalPercent >= 100
        ? "أكملت هدف اليوم، رائع"
        : `بقي ${toArabicNumber(Math.max(0, dailyGoal - todayMinutes))} دقيقة للهدف`
      : "ابدأ أول جلسة اليوم";
    $("#streakDays").textContent = toArabicNumber(streak);
    $("#streakCaption").textContent = streak ? "حافظ على حضورك اليوم" : "ابدأ السلسلة اليوم";
    $("#activeBooksCount").textContent = toArabicNumber(activeBooks.length);
    $("#completedBooksCaption").textContent = state.books.length
      ? `${toArabicNumber(completedBooks)} كتب مكتملة`
      : "لم تُضف كتبًا بعد";
    $("#quotesCount").textContent = toArabicNumber(quoteCache.length);
    $("#goalPercent").textContent = `${toArabicNumber(goalPercent)}%`;
    $("#goalReadMinutes").textContent = toArabicNumber(todayMinutes);
    $("#goalTargetMinutes").textContent = toArabicNumber(dailyGoal);
    $("#goalRing").style.background = `conic-gradient(var(--gold) ${goalPercent}%, #e8e4da ${goalPercent}%)`;
    $("#goalMotivation").textContent =
      goalPercent >= 100 ? "وصلت إلى هدفك. القراءة الإضافية هدية." : "كل دقيقة تقرّبك من هدفك.";

    const currentBook = getCurrentBook(activeBooks);
    renderCurrentBook(currentBook);
    renderRecentSessions();
  }

  function getCurrentBook(activeBooks) {
    const timerBook = state.activeTimer && bookById(state.activeTimer.bookId);
    if (timerBook) return timerBook;
    const lastSession = [...state.sessions].sort((a, b) => b.endedAt - a.endedAt)[0];
    const lastBook = lastSession && bookById(lastSession.bookId);
    return lastBook || activeBooks[0] || state.books[0] || null;
  }

  function coverMarkup(book, extraClass = "") {
    const image = book.coverData
      ? `<img src="${book.coverData}" alt="غلاف ${escapeHTML(book.title)}">`
      : `<strong>${escapeHTML(book.title)}</strong><small>${escapeHTML(book.author || APP_NAME)}</small>`;
    return `<div class="book-cover ${extraClass}">${image}</div>`;
  }

  function renderCurrentBook(book) {
    const container = $("#currentBookContent");
    if (!book) {
      container.className = "empty-inline";
      container.innerHTML = `
        <div class="empty-illustration">＋</div>
        <div><strong>مكتبتك بانتظار أول كتاب</strong><p>أضف اسم الكتاب وعدد صفحاته لتبدأ قياس تقدّمك.</p></div>
        <button class="button button-secondary" data-action="open-book-modal">إضافة كتاب</button>`;
      return;
    }
    const progress = bookProgress(book);
    container.className = "current-book";
    container.innerHTML = `
      ${coverMarkup(book)}
      <div class="current-book-copy">
        <h3>${escapeHTML(book.title)}</h3>
        <span>${escapeHTML(book.author || "مؤلف غير مضاف")}</span>
        <div class="progress-line"><span style="width:${progress}%"></span></div>
        <div class="progress-meta">
          <span>صفحة ${toArabicNumber(book.currentPage || 0)} من ${toArabicNumber(book.totalPages)}</span>
          <span>${toArabicNumber(progress)}%</span>
        </div>
        <div class="current-book-actions">
          <button class="button button-primary" data-read-book="${book.id}">تابع القراءة</button>
          <button class="button button-ghost" data-book-detail="${book.id}">السجل</button>
          <button class="button button-ghost" data-edit-book="${book.id}">تعديل</button>
        </div>
      </div>`;
  }

  function renderRecentSessions() {
    const container = $("#recentSessions");
    const sessions = [...state.sessions].sort((a, b) => b.endedAt - a.endedAt).slice(0, 5);
    if (!sessions.length) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-symbol">◷</div>
          <strong>لا جلسات محفوظة بعد</strong>
          <p>ستظهر هنا الجلسات التي تنهيها مع مدّتها والصفحات التي قرأتها.</p>
          <button class="button button-secondary" data-page-jump="timer">ابدأ الآن</button>
        </div>`;
      return;
    }
    container.innerHTML = sessions
      .map((session) => {
        const book = bookById(session.bookId);
        const pages =
          Number.isFinite(session.endPage) && Number.isFinite(session.startPage)
            ? Math.max(0, session.endPage - session.startPage)
            : null;
        return `
          <article class="session-row">
            <span class="session-symbol">◷</span>
            <div>
              <strong>${escapeHTML(book?.title || "كتاب محذوف")}${session.manual ? '<span class="manual-badge">أُضيفت يدويًا</span>' : ""}</strong>
              <small>${formatDate(session.endedAt, { weekday: "short" })}</small>
            </div>
            <span class="session-duration">${humanDuration(session.durationSeconds)}</span>
            <span class="session-pages">${pages === null ? "دون صفحات" : `${toArabicNumber(pages)} صفحات`}</span>
          </article>`;
      })
      .join("");
  }

  function renderBookOptions() {
    const options = state.books
      .map((book) => `<option value="${book.id}">${escapeHTML(book.title)}</option>`)
      .join("");
    const selectedTimerBook = state.activeTimer?.bookId || $("#timerBookSelect")?.value || "";
    $("#timerBookSelect").innerHTML = `<option value="">اختر كتابًا</option>${options}`;
    $("#quoteBookInput").innerHTML = `<option value="">بدون كتاب</option>${options}`;
    $("#quoteBookFilter").innerHTML = `<option value="all">كل الكتب</option>${options}`;
    $("#manualBookInput").innerHTML = `<option value="">اختر كتابًا</option>${options}`;
    if (selectedTimerBook && bookById(selectedTimerBook)) $("#timerBookSelect").value = selectedTimerBook;
  }

  function renderBooks() {
    const query = ($("#bookSearch").value || "").trim().toLowerCase();
    const books = state.books.filter((book) => {
      const matchesQuery = `${book.title} ${book.author || ""}`.toLowerCase().includes(query);
      const progress = bookProgress(book);
      const matchesFilter =
        currentBookFilter === "all" ||
        (currentBookFilter === "reading" && progress < 100) ||
        (currentBookFilter === "completed" && progress >= 100);
      return matchesQuery && matchesFilter;
    });
    const container = $("#booksGrid");
    if (!books.length) {
      container.innerHTML = `
        <div class="empty-state panel" style="grid-column:1/-1">
          <div class="empty-symbol">▥</div>
          <strong>${state.books.length ? "لا توجد نتائج مطابقة" : "مكتبتك ما زالت فارغة"}</strong>
          <p>${state.books.length ? "جرّب كلمة أخرى أو غيّر المرشح." : "ابدأ بإضافة اسم كتاب وعدد صفحاته. تستطيع إضافة الغلاف والمؤلف لاحقًا."}</p>
          ${state.books.length ? "" : '<button class="button button-primary" data-action="open-book-modal">إضافة أول كتاب</button>'}
        </div>`;
      return;
    }
    container.innerHTML = books
      .map((book) => {
        const progress = bookProgress(book);
        return `
          <article class="book-card" data-book-detail="${book.id}" tabindex="0" role="button" aria-label="فتح سجل ${escapeHTML(book.title)}">
            <span class="book-status ${progress >= 100 ? "completed" : ""}">${progress >= 100 ? "مكتمل" : "أقرأ الآن"}</span>
            ${coverMarkup(book)}
            <div>
              <h3>${escapeHTML(book.title)}</h3>
              <span class="author">${escapeHTML(book.author || "مؤلف غير مضاف")}</span>
              <div class="book-progress-text">
                <span>صفحة ${toArabicNumber(book.currentPage || 0)} / ${toArabicNumber(book.totalPages)}</span>
                <span>${toArabicNumber(progress)}%</span>
              </div>
              <div class="progress-line"><span style="width:${progress}%"></span></div>
              <small class="author">وقت القراءة: ${humanDuration(readingSecondsForBook(book.id))}</small>
            </div>
            <div class="book-card-actions">
              <button class="button button-secondary" data-read-book="${book.id}">${progress >= 100 ? "اقرأ مجددًا" : "تابع القراءة"}</button>
              <button class="more-button" data-edit-book="${book.id}" aria-label="تعديل ${escapeHTML(book.title)}">✎</button>
            </div>
          </article>`;
      })
      .join("");
  }

  function quoteImageBlob(quote) {
    return quote.imageMedia || (quote.type === "image" ? quote.media : null);
  }

  function quoteAudioBlob(quote) {
    return quote.audioMedia || (quote.type === "audio" ? quote.media : null);
  }

  function quoteMediaMarkup(quote) {
    const imageBlob = quoteImageBlob(quote);
    const audioBlob = quoteAudioBlob(quote);
    const image = imageBlob ? `<img src="${URL.createObjectURL(imageBlob)}" alt="${quote.photoPurpose === "handwritten" ? "اقتباس مكتوب أو مظلّل" : "صورة صفحة من الكتاب"}">` : "";
    const audio = audioBlob ? `<audio class="audio-player" controls preload="metadata" src="${URL.createObjectURL(audioBlob)}"></audio>` : "";
    return `${image}${audio}`;
  }

  async function renderQuotes() {
    const query = ($("#quoteSearch").value || "").trim().toLowerCase();
    const bookFilter = $("#quoteBookFilter").value;
    const quotes = quoteCache.filter((quote) => {
      const matchesBook = bookFilter === "all" || quote.bookId === bookFilter;
      const matchesQuery = `${quote.text || ""} ${quote.comment || ""}`.toLowerCase().includes(query);
      return matchesBook && matchesQuery;
    });
    const container = $("#quotesGrid");
    if (!quotes.length) {
      container.innerHTML = `
        <div class="empty-state panel">
          <div class="empty-symbol">”</div>
          <strong>${quoteCache.length ? "لا توجد نتائج مطابقة" : "مساحة لأفكارك المفضلة"}</strong>
          <p>${quoteCache.length ? "جرّب البحث بعبارة أخرى أو اختر كتابًا مختلفًا." : "احفظ اقتباسًا كنص أو صورة أو تسجيل صوتي، وسيبقى على هذا الجهاز."}</p>
          ${quoteCache.length ? "" : '<button class="button button-primary" id="emptyQuoteButton">إضافة اقتباس</button>'}
        </div>`;
      $("#emptyQuoteButton")?.addEventListener("click", () => openQuoteModal());
      return;
    }
    container.innerHTML = quotes
      .map((quote) => {
        const book = bookById(quote.bookId);
        const bookLine = `${book?.title || "بدون كتاب"}${quote.page ? ` · ص ${toArabicNumber(quote.page)}` : ""}`;
        return `
          <article class="quote-card ${quoteImageBlob(quote) ? "image-quote" : ""}">
            <span class="quote-mark">”</span>
            ${quote.text ? `<p class="quote-body">${escapeHTML(quote.text)}</p>` : ""}
            ${quoteMediaMarkup(quote)}
            ${quote.comment ? `<p class="quote-comment">${escapeHTML(quote.comment)}</p>` : ""}
            <div class="quote-footer"><span>${escapeHTML(bookLine)}</span><button data-delete-quote="${quote.id}" aria-label="حذف الاقتباس">حذف</button></div>
          </article>`;
      })
      .join("");
  }

  function openBookDetail(bookId, highlightSessionId = "") {
    const book = bookById(bookId);
    if (!book) return;
    const sessions = state.sessions
      .filter((session) => session.bookId === bookId)
      .sort((a, b) => Number(b.startedAt) - Number(a.startedAt));
    const totalPages = sessions.reduce((sum, session) => sum + sessionPages(session), 0);
    const content = $("#bookDetailContent");
    content.innerHTML = `
      <header class="book-detail-header">
        ${coverMarkup(book)}
        <div><span class="eyebrow">سجل الكتاب الكامل</span><h2 id="bookDetailTitle">${escapeHTML(book.title)}</h2><p>${escapeHTML(book.author || "مؤلف غير مضاف")}</p><button class="button button-primary" data-read-book="${book.id}">ابدأ جلسة لهذا الكتاب</button></div>
      </header>
      <div class="book-detail-summary">
        <div><small>الجلسات</small><strong>${toArabicNumber(sessions.length)}</strong></div>
        <div><small>الوقت</small><strong>${humanDuration(readingSecondsForBook(book.id))}</strong></div>
        <div><small>الصفحات المسجّلة</small><strong>${toArabicNumber(totalPages)}</strong></div>
      </div>
      <section><div class="section-heading"><div><span class="eyebrow">من الأحدث إلى الأقدم</span><h3>جلسات القراءة</h3></div></div>
        <div class="book-session-history">${sessions.length ? sessions.map((session) => {
          const sessionQuotes = quoteCache.filter((quote) => quote.sessionId === session.id);
          return `<article class="book-session-entry ${session.id === highlightSessionId ? "highlighted" : ""}" id="book-session-${session.id}">
            <div class="section-heading split"><div><strong>${displayNumber(session.startPage)} ← ${displayNumber(session.endPage)}${session.manual ? '<span class="manual-badge">أُضيفت يدويًا</span>' : ""}</strong><small>${formatDate(session.startedAt, { dateStyle: "medium", timeStyle: "short" })}</small></div><span>${humanDuration(session.durationSeconds)}</span></div>
            <p>متوسط الصفحة: <strong>${formatSecondsPerPage(secondsPerPage(session))}</strong>${session.note ? ` · ${escapeHTML(session.note)}` : ""}</p>
            ${sessionQuotes.length ? `<div class="session-quotes-inline"><strong>اقتباسات هذه الجلسة</strong>${sessionQuotes.map((quote) => `<div>${quote.text ? `<p>“${escapeHTML(quote.text)}”</p>` : ""}${quoteMediaMarkup(quote)}${quote.comment ? `<small>${escapeHTML(quote.comment)}</small>` : ""}</div>`).join("")}</div>` : ""}
          </article>`;
        }).join("") : '<div class="empty-state"><strong>لا جلسات لهذا الكتاب بعد</strong><p>ابدأ جلسة أو أضف واحدة يدويًا.</p></div>'}</div>
      </section>`;
    openModal("bookDetailModal");
    if (highlightSessionId) window.setTimeout(() => document.getElementById(`book-session-${highlightSessionId}`)?.scrollIntoView({ block: "center" }), 100);
  }

  function getReportSessions() {
    if (reportRange === "all") return [...state.sessions].sort((a, b) => a.endedAt - b.endedAt);
    const cutoff = new Date();
    cutoff.setHours(0, 0, 0, 0);
    cutoff.setDate(cutoff.getDate() - Number(reportRange) + 1);
    return state.sessions
      .filter((session) => Number(session.endedAt) >= cutoff.getTime())
      .sort((a, b) => a.endedAt - b.endedAt);
  }

  function median(values) {
    if (!values.length) return 0;
    const sorted = [...values].sort((a, b) => a - b);
    const middle = Math.floor(sorted.length / 2);
    return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
  }

  function sessionPages(session) {
    if (!Number.isFinite(session.startPage) || !Number.isFinite(session.endPage)) return 0;
    return Math.max(0, session.endPage - session.startPage);
  }

  function secondsPerPage(session) {
    const pages = sessionPages(session);
    return pages > 0 && Number(session.durationSeconds) > 0 ? Number(session.durationSeconds) / pages : null;
  }

  function formatSecondsPerPage(seconds) {
    if (!Number.isFinite(seconds) || seconds <= 0) return "—";
    const rounded = Math.round(seconds);
    if (rounded < 60) return `${toArabicNumber(rounded)} ث/صفحة`;
    const minutes = Math.floor(rounded / 60);
    const remainder = rounded % 60;
    return `${toArabicNumber(minutes)} د${remainder ? ` و${toArabicNumber(remainder)} ث` : ""}/صفحة`;
  }

  function bookAverageSecondsPerPage(bookId, sessions = state.sessions) {
    const valid = sessions.filter((session) => session.bookId === bookId && secondsPerPage(session));
    const totalPages = valid.reduce((sum, session) => sum + sessionPages(session), 0);
    const totalSeconds = valid.reduce((sum, session) => sum + Number(session.durationSeconds), 0);
    return totalPages ? totalSeconds / totalPages : null;
  }

  function paceAnalysisForSession(session) {
    const current = secondsPerPage(session);
    if (!current) return { type: "neutral", reason: "أضف صفحتي البداية والنهاية لنحسب إيقاع القراءة لكل صفحة." };
    const history = state.sessions
      .filter((item) => item.bookId === session.bookId && item.id !== session.id && secondsPerPage(item))
      .sort((a, b) => Number(b.endedAt) - Number(a.endedAt));
    if (history.length < 5) {
      return { type: "neutral", reason: "سنقارن إيقاعك الشخصي بعد خمس جلسات سابقة صالحة لهذا الكتاب." };
    }
    const windowSize = history.length > 100 ? Math.max(20, Math.ceil(history.length * 0.2)) : Math.min(20, history.length);
    const sample = history.slice(0, windowSize).map(secondsPerPage);
    const average = sample.reduce((sum, value) => sum + value, 0) / sample.length;
    const variance = sample.reduce((sum, value) => sum + (value - average) ** 2, 0) / sample.length;
    const deviation = Math.sqrt(variance);
    if (!deviation) return { type: "neutral", average, deviation, sampleSize: sample.length, reason: "إيقاعك قريب من نمطك المعتاد لهذا الكتاب." };
    if (current < average - deviation) return { type: "fast", average, deviation, sampleSize: sample.length };
    if (current > average + deviation) return { type: "slow", average, deviation, sampleSize: sample.length };
    return { type: "neutral", average, deviation, sampleSize: sample.length, reason: "إيقاعك اليوم ضمن نطاقك الشخصي المعتاد لهذا الكتاب." };
  }

  function deterministicChoice(items, seed) {
    const hash = String(seed).split("").reduce((total, character) => (total * 31 + character.charCodeAt(0)) >>> 0, 7);
    return items[hash % items.length];
  }

  function achievementMetrics() {
    return {
      sessions: state.sessions.length,
      pages: state.sessions.reduce((sum, session) => sum + sessionPages(session), 0),
      minutes: Math.floor(state.sessions.reduce((sum, session) => sum + Number(session.durationSeconds || 0), 0) / 60),
      streak: calculateStreak(),
      quotes: quoteCache.length,
      manualSessions: state.sessions.filter((session) => session.manual).length,
      trackedSessions: state.sessions.filter((session) => !session.manual).length,
      completedBooks: state.books.filter((book) => bookProgress(book) >= 100).length
    };
  }

  function unlockEligibleAchievements() {
    const metrics = achievementMetrics();
    const newlyUnlocked = [];
    ACHIEVEMENTS.forEach((achievement) => {
      if (metrics[achievement.metric] >= achievement.target && !state.unlockedAchievements[achievement.id]) {
        state.unlockedAchievements[achievement.id] = Date.now();
        newlyUnlocked.push(achievement.id);
      }
    });
    if (newlyUnlocked.length) saveState();
    return newlyUnlocked;
  }

  function renderAchievements() {
    const container = $("#achievementsGrid");
    if (!container) return;
    const metrics = achievementMetrics();
    const unlockedCount = ACHIEVEMENTS.filter((achievement) => state.unlockedAchievements[achievement.id]).length;
    $("#achievementProgress").textContent = `${toArabicNumber(unlockedCount)} من ${toArabicNumber(ACHIEVEMENTS.length)}`;
    container.innerHTML = ACHIEVEMENTS.map((achievement) => {
      const unlocked = Boolean(state.unlockedAchievements[achievement.id]);
      const value = Math.min(metrics[achievement.metric], achievement.target);
      return `<article class="achievement-card ${unlocked ? "unlocked" : "locked"}">
        <span class="achievement-icon">${unlocked ? achievement.icon : "◇"}</span>
        <h3>${escapeHTML(achievement.title)}</h3>
        <p>${escapeHTML(achievement.description)}</p>
        <small>${unlocked ? "مفتوح" : `${toArabicNumber(value)} / ${toArabicNumber(achievement.target)}`}</small>
      </article>`;
    }).join("");
  }

  function renderSessionsHistory() {
    const container = $("#sessionsHistory");
    if (!container) return;
    const sessions = [...state.sessions].sort((a, b) => Number(b.endedAt) - Number(a.endedAt));
    if (!sessions.length) {
      container.innerHTML = `<div class="empty-state"><div class="empty-symbol">◷</div><strong>لا جلسات محفوظة بعد</strong><p>ابدأ المؤقّت أو أضف جلسة سابقة يدويًا.</p></div>`;
      return;
    }
    container.innerHTML = sessions.map((session) => {
      const book = bookById(session.bookId);
      const pages = sessionPages(session);
      return `<article class="session-row" data-session-detail="${session.id}" data-book-detail="${session.bookId}">
        <span class="session-symbol">${session.manual ? "✎" : "◷"}</span>
        <div><strong>${escapeHTML(book?.title || "كتاب غير موجود")}${session.manual ? '<span class="manual-badge">أُضيفت يدويًا</span>' : ""}</strong><small>${formatDate(session.startedAt, { dateStyle: "medium", timeStyle: "short" })}</small></div>
        <span class="session-duration">${humanDuration(session.durationSeconds)}</span>
        <span class="session-metric">${displayNumber(session.startPage)} ← ${displayNumber(session.endPage)}</span>
        <span class="session-metric">${pages ? formatSecondsPerPage(secondsPerPage(session)) : "دون معدل"}</span>
      </article>`;
    }).join("");
  }

  function renderPostSessionResult(session, achievementIds = []) {
    $("#sessionResultTitle").textContent = session.manual ? "أثر جلستك · أُضيفت يدويًا" : "أثر جلستك";
    const pages = sessionPages(session);
    const sessionAverage = secondsPerPage(session);
    const bookAverage = bookAverageSecondsPerPage(session.bookId);
    $("#sessionResultStats").innerHTML = `
      <article><small>مدة الجلسة</small><strong>${humanDuration(session.durationSeconds)}</strong></article>
      <article><small>متوسط هذه الجلسة</small><strong>${formatSecondsPerPage(sessionAverage)}</strong></article>
      <article><small>متوسط الكتاب كله</small><strong>${formatSecondsPerPage(bookAverage)}</strong></article>`;
    const pace = paceAnalysisForSession(session);
    const message = pace.type === "fast"
      ? deterministicChoice(FAST_PACE_MESSAGES, session.id)
      : pace.type === "slow"
        ? deterministicChoice(SLOW_PACE_MESSAGES, session.id)
        : pace.reason;
    $("#sessionPaceMessage").innerHTML = `<strong>${pages ? `${toArabicNumber(pages)} صفحات · ` : ""}${pace.type === "fast" ? "أسرع من نمطك القريب" : pace.type === "slow" ? "أهدأ من نمطك القريب" : "إيقاع شخصي متوازن"}</strong><br>${escapeHTML(message || "استمر بما يناسب فهمك وراحتك.")}`;
    const celebration = $("#newAchievementsCelebration");
    if (achievementIds.length) {
      const unlocked = achievementIds.map((id) => ACHIEVEMENTS.find((item) => item.id === id)).filter(Boolean);
      celebration.classList.remove("hidden");
      celebration.innerHTML = `<strong>🎉 إنجاز جديد بعد هذه الجلسة</strong><ul>${unlocked.map((item) => `<li>${escapeHTML(item.icon)} ${escapeHTML(item.title)}</li>`).join("")}</ul>`;
    } else {
      celebration.classList.add("hidden");
      celebration.innerHTML = "";
    }
    openModal("sessionResultModal");
  }

  function timeBucket(dateValue) {
    const hour = new Date(dateValue).getHours();
    if (hour >= 5 && hour < 12) return "morning";
    if (hour >= 12 && hour < 17) return "afternoon";
    if (hour >= 17 && hour < 22) return "evening";
    return "night";
  }

  function lengthBucket(seconds) {
    const minutes = seconds / 60;
    if (minutes < 15) return "short";
    if (minutes < 30) return "medium";
    if (minutes < 60) return "long";
    return "deep";
  }

  function getDailyReportSeries(sessions) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    let dayCount = reportRange === "all" ? 30 : Number(reportRange);
    if (reportRange === "all" && sessions.length) {
      const oldest = new Date(sessions[0].endedAt);
      oldest.setHours(0, 0, 0, 0);
      dayCount = Math.min(90, Math.max(7, Math.round((today - oldest) / 86400000) + 1));
    }
    const totals = new Map();
    sessions.forEach((session) => {
      const key = localDateKey(session.endedAt);
      totals.set(key, (totals.get(key) || 0) + Number(session.durationSeconds || 0));
    });
    return Array.from({ length: dayCount }, (_, index) => {
      const date = new Date(today);
      date.setDate(today.getDate() - (dayCount - index - 1));
      const key = localDateKey(date);
      return {
        key,
        date,
        minutes: Math.round((totals.get(key) || 0) / 60)
      };
    });
  }

  function renderReports() {
    const sessions = getReportSessions();
    const totalSeconds = sessions.reduce((sum, session) => sum + Number(session.durationSeconds || 0), 0);
    const totalMinutes = Math.round(totalSeconds / 60);
    const activeDays = new Set(sessions.map((session) => localDateKey(session.endedAt))).size;
    const durations = sessions.map((session) => Number(session.durationSeconds || 0) / 60);
    const pages = sessions.reduce((sum, session) => sum + sessionPages(session), 0);
    const pagesPerHour = totalSeconds > 0 && pages > 0 ? pages / (totalSeconds / 3600) : null;

    $("#reportTotalTime").textContent = humanDuration(totalSeconds);
    $("#reportSessionCount").textContent = toArabicNumber(sessions.length);
    $("#reportActiveDays").textContent = `${toArabicNumber(activeDays)} أيام نشطة`;
    $("#reportAverageSession").textContent = `${toArabicNumber(sessions.length ? Math.round(totalMinutes / sessions.length) : 0)} دقيقة`;
    $("#reportMedianSession").textContent = `الوسيط: ${toArabicNumber(Math.round(median(durations)))} دقيقة`;
    $("#reportPagesRead").textContent = toArabicNumber(pages);
    $("#reportPagesPerHour").textContent = pagesPerHour ? `${toArabicNumber(Math.round(pagesPerHour))} صفحة/ساعة` : "— صفحة/ساعة";
    $("#reportTimeChange").textContent = buildPeriodComparison(totalSeconds);

    renderDailyChart(sessions);
    renderTimeOfDayChart(sessions);
    renderSessionLengthChart(sessions);
    renderReportInsights(sessions, activeDays, pagesPerHour);
    renderBookReport(sessions);
  }

  function buildPeriodComparison(currentSeconds) {
    if (reportRange === "all" || !state.sessions.length) return currentSeconds ? "من كل الجلسات المسجّلة" : "ابدأ أول جلسة";
    const days = Number(reportRange);
    const currentStart = new Date();
    currentStart.setHours(0, 0, 0, 0);
    currentStart.setDate(currentStart.getDate() - days + 1);
    const previousStart = new Date(currentStart);
    previousStart.setDate(previousStart.getDate() - days);
    const previousSeconds = state.sessions
      .filter((session) => session.endedAt >= previousStart.getTime() && session.endedAt < currentStart.getTime())
      .reduce((sum, session) => sum + Number(session.durationSeconds || 0), 0);
    if (!previousSeconds) return currentSeconds ? "لا توجد فترة سابقة للمقارنة" : "ابدأ أول جلسة";
    const change = Math.round(((currentSeconds - previousSeconds) / previousSeconds) * 100);
    if (change === 0) return "مثل الفترة السابقة";
    return `${change > 0 ? "↑" : "↓"} ${toArabicNumber(Math.abs(change))}% عن الفترة السابقة`;
  }

  function renderDailyChart(sessions) {
    const series = getDailyReportSeries(sessions);
    const maximum = Math.max(1, ...series.map((day) => day.minutes));
    const dateFormatter = new Intl.DateTimeFormat("ar", {
      weekday: series.length <= 7 ? "short" : undefined,
      day: series.length > 7 ? "numeric" : undefined,
      month: series.length > 7 ? "numeric" : undefined
    });
    $("#dailyReadingChart").innerHTML = series
      .map((day) => {
        const height = day.minutes ? Math.max(5, Math.round((day.minutes / maximum) * 165)) : 3;
        return `
          <div class="daily-bar ${day.key === localDateKey() ? "today" : ""}" title="${toArabicNumber(day.minutes)} دقيقة">
            <span class="bar-value">${day.minutes ? toArabicNumber(day.minutes) : ""}</span>
            <span class="bar-fill" style="height:${height}px"></span>
            <span class="bar-label">${dateFormatter.format(day.date)}</span>
          </div>`;
      })
      .join("");
  }

  function renderTimeOfDayChart(sessions) {
    const definitions = [
      ["morning", "الصباح", "5–12"],
      ["afternoon", "الظهر", "12–17"],
      ["evening", "المساء", "17–22"],
      ["night", "الليل", "22–5"]
    ];
    const totals = Object.fromEntries(definitions.map(([key]) => [key, 0]));
    const ratings = Object.fromEntries(definitions.map(([key]) => [key, { sum: 0, count: 0 }]));
    sessions.forEach((session) => {
      const bucket = timeBucket(session.startedAt);
      totals[bucket] += Number(session.durationSeconds || 0);
      if (session.focusRating) {
        ratings[bucket].sum += Number(session.focusRating);
        ratings[bucket].count += 1;
      }
    });
    const maximum = Math.max(1, ...Object.values(totals));
    $("#timeOfDayChart").innerHTML = definitions
      .map(([key, label, range]) => `
        <div class="horizontal-row">
          <span>${label}</span>
          <div class="horizontal-track"><i style="width:${Math.round((totals[key] / maximum) * 100)}%"></i></div>
          <b>${humanDuration(totals[key])}<br>${ratings[key].count ? `تركيز ${(ratings[key].sum / ratings[key].count).toFixed(1)}/5` : range}</b>
        </div>`)
      .join("");
  }

  function renderSessionLengthChart(sessions) {
    const definitions = [
      ["short", "أقل من 15 د", "#b92b31"],
      ["medium", "15–29 د", "#fbc23a"],
      ["long", "30–59 د", "#d99b72"],
      ["deep", "60 د فأكثر", "#e9dfda"]
    ];
    const counts = Object.fromEntries(definitions.map(([key]) => [key, 0]));
    sessions.forEach((session) => {
      counts[lengthBucket(session.durationSeconds)] += 1;
    });
    const total = Math.max(1, sessions.length);
    let cursor = 0;
    const segments = definitions.map(([key, , color]) => {
      const start = cursor;
      cursor += (counts[key] / total) * 100;
      return `${color} ${start}% ${cursor}%`;
    });
    $("#sessionLengthDonut").style.background = sessions.length
      ? `conic-gradient(${segments.join(",")})`
      : "conic-gradient(#e9dfda 0 100%)";
    const dominant = sessions.length
      ? definitions.reduce((best, current) => (counts[current[0]] > counts[best[0]] ? current : best), definitions[0])
      : null;
    $("#dominantSessionLength").textContent = dominant ? dominant[1] : "—";
    $("#sessionLengthLegend").innerHTML = definitions
      .map(([key, label, color]) => `
        <div><i style="background:${color}"></i><span>${label}</span><b>${toArabicNumber(counts[key])} جلسات</b></div>`)
      .join("");
  }

  function renderReportInsights(sessions, activeDays, pagesPerHour) {
    const container = $("#reportInsights");
    if (!sessions.length) {
      container.innerHTML = `
        <div class="empty-state" style="grid-column:1/-1;min-height:160px">
          <div class="empty-symbol">⌁</div>
          <strong>نحتاج إلى بعض الجلسات أولًا</strong>
          <p>بعد ثلاث جلسات سنبدأ بوصف توقيتك ومدتك المعتادة. بعد عشر جلسات تصبح المقارنات أكثر فائدة.</p>
        </div>`;
      return;
    }

    const timeTotals = { morning: 0, afternoon: 0, evening: 0, night: 0 };
    const timeCounts = { morning: 0, afternoon: 0, evening: 0, night: 0 };
    sessions.forEach((session) => {
      const bucket = timeBucket(session.startedAt);
      timeTotals[bucket] += Number(session.durationSeconds || 0);
      timeCounts[bucket] += 1;
    });
    const timeLabels = { morning: "الصباح", afternoon: "الظهر", evening: "المساء", night: "الليل" };
    const leadingTime = Object.keys(timeTotals).sort((a, b) => timeTotals[b] - timeTotals[a])[0];
    const durations = sessions.map((session) => session.durationSeconds / 60);
    const typicalMinutes = Math.round(median(durations));
    const timeRatings = { morning: [], afternoon: [], evening: [], night: [] };
    const lengthRatings = { short: [], medium: [], long: [], deep: [] };
    sessions.forEach((session) => {
      if (!session.focusRating) return;
      timeRatings[timeBucket(session.startedAt)].push(Number(session.focusRating));
      lengthRatings[lengthBucket(session.durationSeconds)].push(Number(session.focusRating));
    });
    const eligibleTimeRatings = Object.entries(timeRatings)
      .filter(([, values]) => values.length >= 2)
      .map(([key, values]) => ({ key, average: values.reduce((sum, value) => sum + value, 0) / values.length, count: values.length }))
      .sort((a, b) => b.average - a.average);
    const bestRatedTime = eligibleTimeRatings.length >= 2 ? eligibleTimeRatings[0] : null;
    const lengthLabels = { short: "أقل من 15 دقيقة", medium: "15–29 دقيقة", long: "30–59 دقيقة", deep: "60 دقيقة فأكثر" };
    const eligibleLengthRatings = Object.entries(lengthRatings)
      .filter(([, values]) => values.length >= 2)
      .map(([key, values]) => ({ key, average: values.reduce((sum, value) => sum + value, 0) / values.length, count: values.length }))
      .sort((a, b) => b.average - a.average);
    const bestRatedLength = eligibleLengthRatings.length >= 2 ? eligibleLengthRatings[0] : null;
    const spanDays = reportRange === "all"
      ? Math.max(1, getDailyReportSeries(sessions).length)
      : Number(reportRange);
    const consistency = Math.round((activeDays / spanDays) * 100);
    const pagesInsight = pagesPerHour
      ? `معدّلك المسجّل ${toArabicNumber(Math.round(pagesPerHour))} صفحة/ساعة. قارنه داخل الكتاب نفسه، لأن صعوبة الكتب تختلف.`
      : "سجّل صفحة البداية والنهاية كي نحسب سرعة تقريبية. السرعة ليست مقياسًا للفهم.";
    const manualCount = sessions.filter((session) => session.manual).length;

    container.innerHTML = `
      <article class="insight-card">
        <span>◷</span>
        <strong>${bestRatedTime ? `أعلى تركيز مُبلّغ في ${timeLabels[bestRatedTime.key]}` : sessions.length >= 3 ? `أكثر وقتك المسجّل في ${timeLabels[leadingTime]}` : "ما زالت عيّنتك صغيرة"}</strong>
        <p>${bestRatedTime ? `متوسط ${bestRatedTime.average.toFixed(1)}/5 عبر ${toArabicNumber(bestRatedTime.count)} جلسات مقيّمة. الارتباط لا يثبت أن الوقت هو السبب.` : sessions.length >= 3 ? `${toArabicNumber(timeCounts[leadingTime])} جلسات و${humanDuration(timeTotals[leadingTime])}. قيّم تركيزك عند الإنهاء لنقارن الجودة.` : "أكمل ثلاث جلسات على الأقل قبل مقارنة أوقات اليوم."}</p>
      </article>
      <article class="insight-card">
        <span>↔</span>
        <strong>${bestRatedLength ? `أفضل تركيز مُبلّغ مع جلسات ${lengthLabels[bestRatedLength.key]}` : `جلستك المعتادة نحو ${toArabicNumber(typicalMinutes)} دقيقة`}</strong>
        <p>${bestRatedLength ? `متوسط ${bestRatedLength.average.toFixed(1)}/5 في ${toArabicNumber(bestRatedLength.count)} جلسات مقيّمة. اختبر النمط نفسه أسبوعًا آخر قبل تغيير عادتك.` : "ابدأ هدفك القادم قريبًا من الوسيط. قيّم التركيز والفهم كي نعرف إن كانت الجلسات الأطول أفضل لك فعلًا."}</p>
      </article>
      <article class="insight-card">
        <span>▤</span>
        <strong>حضور في ${toArabicNumber(consistency)}% من أيام الفترة</strong>
        <p>${pagesInsight}</p>
      </article>
      <article class="insight-card">
        <span>✎</span>
        <strong>${toArabicNumber(manualCount)} جلسات أُضيفت يدويًا</strong>
        <p>الجلسات اليدوية موسومة بوضوح وتدخل في الإجماليات والتحليلات مثل الجلسات المتتبّعة.</p>
      </article>`;
  }

  function renderBookReport(sessions) {
    const grouped = new Map();
    sessions.forEach((session) => {
      if (!grouped.has(session.bookId)) grouped.set(session.bookId, { seconds: 0, sessions: 0, pages: 0 });
      const item = grouped.get(session.bookId);
      item.seconds += Number(session.durationSeconds || 0);
      item.sessions += 1;
      item.pages += sessionPages(session);
    });
    const rows = [...grouped.entries()].sort((a, b) => b[1].seconds - a[1].seconds);
    if (!rows.length) {
      $("#bookReportList").innerHTML = `<div class="empty-state"><strong>لا بيانات كتب في هذه الفترة</strong><p>ستظهر هنا مقارنة الوقت والتقدّم بعد حفظ جلسات القراءة.</p></div>`;
      return;
    }
    const maximum = Math.max(...rows.map(([, data]) => data.seconds), 1);
    $("#bookReportList").innerHTML = rows
      .map(([bookId, data]) => {
        const book = bookById(bookId);
        return `
          <div class="book-report-row">
            <div><strong>${escapeHTML(book?.title || "كتاب محذوف")}</strong><br><small>${toArabicNumber(data.sessions)} جلسات</small></div>
            <div class="book-report-progress"><span style="width:${Math.round((data.seconds / maximum) * 100)}%"></span></div>
            <small>${humanDuration(data.seconds)}</small>
            <small>${toArabicNumber(data.pages)} صفحات</small>
          </div>`;
      })
      .join("");
  }

  function renderSettings() {
    $("#dailyGoalInput").value = state.settings.dailyGoalMinutes;
    $("#weeklyGoalInput").value = state.settings.weeklyGoalSessions;
    $("#reminderIntervalInput").value = state.settings.reminderMinutes;
    $("#timerReminderValue").textContent = `${toArabicNumber(state.settings.reminderMinutes)} دقيقة`;
    const notificationSupported = "Notification" in window;
    const permission = notificationSupported ? Notification.permission : "unsupported";
    $("#enableNotificationsButton").textContent =
      permission === "granted" ? "الإشعارات مفعّلة ✓" : permission === "denied" ? "الإشعارات محظورة" : "تفعيل الإشعارات";
    $("#enableNotificationsButton").disabled = !notificationSupported || permission === "denied";
    renderInstallState();
  }

  const focusMusicLabels = {
    rain: "مطر هادئ",
    ambient: "مدى عميق",
    library: "همس المكتبة"
  };

  function createNoiseBuffer(context, type = "white") {
    const seconds = 5;
    const buffer = context.createBuffer(1, context.sampleRate * seconds, context.sampleRate);
    const channel = buffer.getChannelData(0);
    let previous = 0;
    for (let index = 0; index < channel.length; index += 1) {
      const white = Math.random() * 2 - 1;
      if (type === "brown") {
        previous = (previous + 0.018 * white) / 1.018;
        channel[index] = Math.max(-1, Math.min(1, previous * 3.3));
      } else {
        channel[index] = white * 0.55;
      }
    }
    return buffer;
  }

  function registerMusicNode(node) {
    focusMusicNodes.push(node);
    return node;
  }

  function addNoiseLayer(context, type, filterType, frequency, level) {
    const source = registerMusicNode(context.createBufferSource());
    const filter = registerMusicNode(context.createBiquadFilter());
    const gain = registerMusicNode(context.createGain());
    source.buffer = createNoiseBuffer(context, type);
    source.loop = true;
    filter.type = filterType;
    filter.frequency.value = frequency;
    filter.Q.value = filterType === "bandpass" ? 0.55 : 0.7;
    gain.gain.value = level;
    source.connect(filter).connect(gain).connect(focusMusicMaster);
    source.start();
  }

  function addAmbientTone(context, frequency, level, detune = 0) {
    const oscillator = registerMusicNode(context.createOscillator());
    const gain = registerMusicNode(context.createGain());
    oscillator.type = "sine";
    oscillator.frequency.value = frequency;
    oscillator.detune.value = detune;
    gain.gain.value = level;
    oscillator.connect(gain).connect(focusMusicMaster);
    oscillator.start();
  }

  function destroyFocusMusicGraph() {
    focusMusicNodes.forEach((node) => {
      try {
        if (typeof node.stop === "function") node.stop();
      } catch {
        // A source can already be stopped.
      }
      try {
        node.disconnect();
      } catch {
        // A disconnected node needs no further cleanup.
      }
    });
    focusMusicNodes = [];
    try {
      focusMusicMaster?.disconnect();
    } catch {
      // The gain node may already be disconnected.
    }
    focusMusicMaster = null;
  }

  async function startFocusMusic() {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) {
      showToast("تشغيل أجواء التركيز غير مدعوم في هذا المتصفّح", "error");
      return;
    }
    try {
      if (!focusAudioContext) focusAudioContext = new AudioContextClass();
      if (focusAudioContext.state === "suspended") await focusAudioContext.resume();
      destroyFocusMusicGraph();
      focusMusicMaster = focusAudioContext.createGain();
      const volume = Number(state.settings.focusMusicVolume ?? 28) / 100;
      focusMusicMaster.gain.value = volume * 0.42;
      focusMusicMaster.connect(focusAudioContext.destination);

      const track = state.settings.focusMusicTrack || "rain";
      if (track === "rain") {
        addNoiseLayer(focusAudioContext, "white", "bandpass", 2800, 0.74);
        addNoiseLayer(focusAudioContext, "brown", "lowpass", 420, 0.26);
      } else if (track === "ambient") {
        addAmbientTone(focusAudioContext, 110, 0.19);
        addAmbientTone(focusAudioContext, 164.81, 0.13, -5);
        addAmbientTone(focusAudioContext, 220, 0.08, 4);
        addNoiseLayer(focusAudioContext, "brown", "lowpass", 260, 0.06);
        const lfo = registerMusicNode(focusAudioContext.createOscillator());
        const lfoGain = registerMusicNode(focusAudioContext.createGain());
        lfo.frequency.value = 0.065;
        lfoGain.gain.value = volume ? Math.max(0.004, volume * 0.025) : 0;
        lfo.connect(lfoGain).connect(focusMusicMaster.gain);
        lfo.start();
      } else {
        addNoiseLayer(focusAudioContext, "brown", "lowpass", 780, 0.55);
        addNoiseLayer(focusAudioContext, "white", "bandpass", 1250, 0.07);
        addAmbientTone(focusAudioContext, 73.42, 0.08);
      }
      focusMusicPlaying = true;
      updateFocusMusicUI();
    } catch {
      destroyFocusMusicGraph();
      focusMusicPlaying = false;
      updateFocusMusicUI();
      showToast("تعذّر تشغيل صوت التركيز", "error");
    }
  }

  function stopFocusMusic() {
    destroyFocusMusicGraph();
    focusMusicPlaying = false;
    updateFocusMusicUI();
  }

  function toggleFocusMusic() {
    if (focusMusicPlaying) stopFocusMusic();
    else startFocusMusic();
  }

  function selectFocusMusic(track) {
    if (!focusMusicLabels[track]) return;
    state.settings.focusMusicTrack = track;
    saveState();
    if (focusMusicPlaying) startFocusMusic();
    updateFocusMusicUI();
  }

  function setFocusMusicVolume(value) {
    state.settings.focusMusicVolume = Number(value);
    saveState();
    if (focusMusicMaster && focusAudioContext) {
      focusMusicMaster.gain.setTargetAtTime(
        (Number(value) / 100) * 0.42,
        focusAudioContext.currentTime,
        0.04
      );
    }
    updateFocusMusicUI();
  }

  function updateFocusMusicUI() {
    const track = state.settings.focusMusicTrack || "rain";
    $$("#musicTrackOptions [data-music]").forEach((button) => {
      button.classList.toggle("active", button.dataset.music === track);
    });
    $("#musicVolumeInput").value = state.settings.focusMusicVolume ?? 28;
    $("#focusMusicIcon").textContent = focusMusicPlaying ? "Ⅱ" : "▶";
    $("#focusMusicButtonText").textContent = focusMusicPlaying ? "إيقاف الصوت" : "تشغيل الصوت";
  }

  function updateConnectionStatus(event) {
    const indicator = $("#connectionStatus");
    if (!indicator) return;
    const offline = event?.type === "offline"
      ? true
      : event?.type === "online"
        ? false
        : !navigator.onLine;
    indicator.classList.toggle("degraded", offline);
    indicator.querySelector("b").textContent = offline ? "غير متصل" : "متصل";
    indicator.title = offline
      ? "الاتصال متوقف؛ التطبيق يعمل من الملفات المحفوظة على الجهاز"
      : "متصل بالإنترنت، والبيانات الأساسية محفوظة محليًا";
  }

  function renderAll() {
    renderBookOptions();
    renderDashboard();
    renderBooks();
    renderSettings();
    renderReports();
    renderSessionsHistory();
    renderAchievements();
    renderArticleStates();
    updateFocusMusicUI();
    updateTimerUI();
  }

  function openBookModal(book = null) {
    $("#bookForm").reset();
    $("#editingBookId").value = book?.id || "";
    $("#bookModalTitle").textContent = book ? "تعديل بيانات الكتاب" : "أضف كتابًا إلى مكتبتك";
    $("#bookTitleInput").value = book?.title || "";
    $("#bookPagesInput").value = book?.totalPages || "";
    $("#bookAuthorInput").value = book?.author || "";
    $("#bookCurrentPageInput").value = book?.currentPage || 0;
    $("#bookCategoryInput").value = book?.category || "";
    $("#coverPreview").innerHTML = book?.coverData ? `<img src="${book.coverData}" alt="">` : "▧";
    $("#bookCoverInput").dataset.existingCover = book?.coverData || "";
    openModal("bookModal");
  }

  async function saveBook(event) {
    event.preventDefault();
    const title = $("#bookTitleInput").value.trim();
    const totalPages = Number($("#bookPagesInput").value);
    const currentPage = Number($("#bookCurrentPageInput").value || 0);
    if (!title || !Number.isFinite(totalPages) || totalPages < 1) {
      showToast("اسم الكتاب وعدد الصفحات مطلوبان", "error");
      return;
    }
    if (currentPage > totalPages) {
      showToast("الصفحة الحالية لا يمكن أن تتجاوز عدد الصفحات", "error");
      return;
    }
    const file = $("#bookCoverInput").files[0];
    if (file && file.size > 2 * 1024 * 1024) {
      showToast("صورة الغلاف أكبر من 2MB", "error");
      return;
    }
    const coverData = file ? await fileToDataURL(file) : $("#bookCoverInput").dataset.existingCover || "";
    const id = $("#editingBookId").value;
    const data = {
      id: id || uid("book"),
      title,
      totalPages,
      currentPage,
      author: $("#bookAuthorInput").value.trim(),
      category: $("#bookCategoryInput").value.trim(),
      coverData,
      createdAt: id ? bookById(id)?.createdAt || Date.now() : Date.now(),
      updatedAt: Date.now()
    };
    if (id) state.books = state.books.map((book) => (book.id === id ? data : book));
    else state.books.push(data);
    saveState();
    closeModal("bookModal");
    renderAll();
    showToast(id ? "تم تحديث الكتاب" : "أُضيف الكتاب إلى مكتبتك");
  }

  function selectBookAndRead(bookId) {
    if (state.activeTimer && state.activeTimer.bookId !== bookId && getElapsedSeconds() > 0) {
      showToast("أنهِ الجلسة الحالية قبل اختيار كتاب آخر", "error");
      navigate("timer");
      return;
    }
    $("#timerBookSelect").value = bookId;
    navigate("timer");
    $("#timerBookSelect").focus();
  }

  function getElapsedSeconds() {
    const timer = state.activeTimer;
    if (!timer) return 0;
    const live = timer.status === "running" && timer.startedAt ? Math.floor((Date.now() - timer.startedAt) / 1000) : 0;
    return Math.max(0, Number(timer.elapsedSeconds || 0) + live);
  }

  function startNewTimer() {
    const bookId = $("#timerBookSelect").value;
    if (!bookId || !bookById(bookId)) {
      showToast("اختر كتابًا أولًا", "error");
      $("#timerBookSelect").focus();
      return;
    }
    state.activeTimer = {
      id: uid("session"),
      bookId,
      status: "running",
      startedAt: Date.now(),
      createdAt: Date.now(),
      elapsedSeconds: 0,
      lastReminder: 0,
      startPage: bookById(bookId).currentPage || 0,
      quickNote: $("#sessionQuickNote").value.trim()
    };
    saveState();
    startTimerLoop();
    updateTimerUI();
  }

  function pauseTimer() {
    if (!state.activeTimer || state.activeTimer.status !== "running") return;
    state.activeTimer.elapsedSeconds = getElapsedSeconds();
    state.activeTimer.startedAt = null;
    state.activeTimer.status = "paused";
    state.activeTimer.quickNote = $("#sessionQuickNote").value;
    saveState();
    updateTimerUI();
  }

  function resumeTimer() {
    if (!state.activeTimer || state.activeTimer.status !== "paused") return;
    state.activeTimer.startedAt = Date.now();
    state.activeTimer.status = "running";
    saveState();
    startTimerLoop();
    updateTimerUI();
  }

  function cancelTimer() {
    if (!state.activeTimer) return;
    state.activeTimer = null;
    saveState();
    $("#sessionQuickNote").value = "";
    pendingFinishWasRunning = false;
    stopTimerLoop();
    stopFocusMusic();
    updateTimerUI();
    showToast("أُلغيت الجلسة دون حفظ");
  }

  function prepareFinishSession() {
    if (!state.activeTimer) return;
    pendingFinishWasRunning = state.activeTimer.status === "running";
    if (pendingFinishWasRunning) pauseTimer();
    const book = bookById(state.activeTimer.bookId);
    $("#finishSessionSummary").textContent = `${book?.title || "الكتاب"} · ${humanDuration(getElapsedSeconds())}`;
    $("#sessionEndPageInput").max = book?.totalPages || "";
    $("#sessionEndPageInput").value = book?.currentPage || "";
    $("#sessionNoteInput").value = $("#sessionQuickNote").value || state.activeTimer.quickNote || "";
    $("#sessionFocusRatingInput").value = "";
    $("#sessionUnderstandingInput").value = "";
    openModal("finishSessionModal");
  }

  function finishSession(event) {
    event.preventDefault();
    if (!state.activeTimer) return;
    const timer = state.activeTimer;
    const book = bookById(timer.bookId);
    const durationSeconds = getElapsedSeconds();
    const endPageRaw = $("#sessionEndPageInput").value;
    const endPage = endPageRaw === "" ? null : Number(endPageRaw);
    if (book && endPage !== null && (endPage < 0 || endPage > book.totalPages)) {
      showToast(`أدخل صفحة بين 0 و${book.totalPages}`, "error");
      return;
    }
    if (endPage !== null && endPage < Number(timer.startPage || 0)) {
      showToast("صفحة النهاية لا يمكن أن تسبق صفحة البداية", "error");
      return;
    }
    const session = {
      id: timer.id || uid("session"),
      bookId: timer.bookId,
      startedAt: timer.createdAt || Date.now() - durationSeconds * 1000,
      endedAt: Date.now(),
      durationSeconds,
      startPage: timer.startPage,
      endPage,
      note: $("#sessionNoteInput").value.trim(),
      focusRating: Number($("#sessionFocusRatingInput").value) || null,
      understandingRating: Number($("#sessionUnderstandingInput").value) || null,
      manual: false
    };
    state.sessions.push(session);
    if (book && endPage !== null) {
      book.currentPage = Math.max(book.currentPage || 0, endPage);
      book.updatedAt = Date.now();
    }
    state.activeTimer = null;
    pendingFinishWasRunning = false;
    saveState();
    stopTimerLoop();
    stopFocusMusic();
    $("#sessionQuickNote").value = "";
    closeModal("finishSessionModal");
    renderAll();
    showToast("حُفظت جلسة القراءة");
    const newlyUnlocked = unlockEligibleAchievements();
    renderAchievements();
    renderPostSessionResult(session, newlyUnlocked);
  }

  async function discardFinishedSession() {
    if (!state.activeTimer) return;
    const discardedId = state.activeTimer.id;
    state.activeTimer = null;
    pendingFinishWasRunning = false;
    stopTimerLoop();
    stopFocusMusic();
    $("#sessionQuickNote").value = "";
    const linkedQuotes = quoteCache.filter((quote) => quote.sessionId === discardedId);
    for (const quote of linkedQuotes) await putQuote({ ...quote, sessionId: null });
    saveState();
    closeModal("finishSessionModal");
    renderAll();
    renderQuotes();
    showToast("تم تجاهل الجلسة، وبقيت اقتباساتك محفوظة دون ربط بجلسة");
  }

  function openManualSessionModal() {
    if (!state.books.length) {
      showToast("أضف كتابًا قبل تسجيل جلسة", "error");
      openBookModal();
      return;
    }
    $("#manualSessionForm").reset();
    $("#manualDateInput").value = localDateKey();
    const now = new Date();
    const start = new Date(now.getTime() - 30 * 60 * 1000);
    const timeValue = (date) => `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
    $("#manualStartTimeInput").value = timeValue(start);
    $("#manualEndTimeInput").value = timeValue(now);
    openModal("manualSessionModal");
  }

  function saveManualSession(event) {
    event.preventDefault();
    const book = bookById($("#manualBookInput").value);
    const startPage = Number($("#manualStartPageInput").value);
    const endPage = Number($("#manualEndPageInput").value);
    const date = $("#manualDateInput").value;
    const startTime = $("#manualStartTimeInput").value;
    const endTime = $("#manualEndTimeInput").value;
    if (!book || !date || !startTime || !endTime || !Number.isFinite(startPage) || !Number.isFinite(endPage)) {
      showToast("أكمل الحقول المطلوبة", "error");
      return;
    }
    if (startPage < 0 || endPage < startPage || endPage > book.totalPages) {
      showToast(`تحقق من الصفحات؛ الحد الأعلى ${toArabicNumber(book.totalPages)}`, "error");
      return;
    }
    const startedAt = new Date(`${date}T${startTime}:00`).getTime();
    const endedAt = new Date(`${date}T${endTime}:00`).getTime();
    if (!Number.isFinite(startedAt) || !Number.isFinite(endedAt) || endedAt <= startedAt) {
      showToast("يجب أن يكون وقت النهاية بعد وقت البداية في اليوم نفسه", "error");
      return;
    }
    const session = {
      id: uid("session"),
      bookId: book.id,
      startedAt,
      endedAt,
      durationSeconds: Math.round((endedAt - startedAt) / 1000),
      startPage,
      endPage,
      note: $("#manualSessionNoteInput").value.trim(),
      focusRating: Number($("#manualFocusRatingInput").value) || null,
      understandingRating: null,
      manual: true
    };
    state.sessions.push(session);
    book.currentPage = Math.max(book.currentPage || 0, endPage);
    book.updatedAt = Date.now();
    saveState();
    closeModal("manualSessionModal");
    renderAll();
    const newlyUnlocked = unlockEligibleAchievements();
    renderAchievements();
    renderPostSessionResult(session, newlyUnlocked);
    showToast("حُفظت الجلسة اليدوية");
  }

  function maybeShowPostSessionAd() {
    if (APP_CONFIG.featureFlags?.postSessionAds) window.setTimeout(() => openModal("adModal"), 250);
  }

  function startTimerLoop() {
    stopTimerLoop();
    timerInterval = window.setInterval(() => {
      updateTimerUI();
      maybeSendReminder();
    }, 1000);
  }

  function stopTimerLoop() {
    if (timerInterval) window.clearInterval(timerInterval);
    timerInterval = null;
  }

  function updateTimerUI() {
    const timer = state.activeTimer;
    const elapsed = getElapsedSeconds();
    $("#timerDisplay").textContent = formatDuration(elapsed);
    $("#navLiveDot").classList.toggle("hidden", !timer);
    $("#resetTimerButton").disabled = !timer;
    $("#stopTimerButton").disabled = !timer;
    $("#timerBookSelect").disabled = Boolean(timer);
    const status = $("#sessionStatus");

    if (!timer) {
      $("#startPauseText").textContent = "ابدأ";
      $("#startPauseIcon").textContent = "▶";
      $("#timerMessage").textContent = "وقت هادئ لك وللكتاب.";
      status.className = "session-status";
      status.innerHTML = "<i></i> جاهز للبدء";
      return;
    }
    $("#timerBookSelect").value = timer.bookId;
    if (!$("#sessionQuickNote").value && timer.quickNote) $("#sessionQuickNote").value = timer.quickNote;
    if (timer.status === "running") {
      $("#startPauseText").textContent = "إيقاف مؤقت";
      $("#startPauseIcon").textContent = "Ⅱ";
      $("#timerMessage").textContent = "استمر، أنت تصنع مساحة للأفكار.";
      status.className = "session-status running";
      status.innerHTML = "<i></i> جلسة جارية";
    } else {
      $("#startPauseText").textContent = "متابعة";
      $("#startPauseIcon").textContent = "▶";
      $("#timerMessage").textContent = "المؤقّت متوقف مؤقتًا.";
      status.className = "session-status";
      status.innerHTML = "<i></i> متوقفة مؤقتًا";
    }
  }

  function maybeSendReminder() {
    const timer = state.activeTimer;
    if (!timer || timer.status !== "running") return;
    const intervalSeconds = Number(state.settings.reminderMinutes || 15) * 60;
    const elapsed = getElapsedSeconds();
    const milestone = Math.floor(elapsed / intervalSeconds);
    if (milestone > 0 && milestone > Number(timer.lastReminder || 0)) {
      timer.lastReminder = milestone;
      saveState();
      const message = `أنت تقرأ منذ ${humanDuration(elapsed)}. خذ نفسًا وأكمل حين تكون مستعدًا.`;
      showToast(message);
      if ("Notification" in window && Notification.permission === "granted") {
        new Notification(`${APP_NAME} — وقت القراءة`, {
          body: message,
          icon: "assets/icon.svg",
          tag: `reading-${milestone}`
        });
      }
    }
  }

  async function enableNotifications() {
    if (!("Notification" in window)) {
      showToast("هذا المتصفّح لا يدعم الإشعارات", "error");
      return;
    }
    if (!window.isSecureContext) {
      showToast("تعمل الإشعارات بعد نشر الموقع عبر HTTPS أو تشغيله على localhost", "error");
      return;
    }
    const permission = await Notification.requestPermission();
    renderSettings();
    showToast(permission === "granted" ? "تم تفعيل الإشعارات" : "لم يُسمح بالإشعارات", permission === "granted" ? "success" : "error");
  }

  function openQuoteModal(bookId = "") {
    $("#quoteForm").reset();
    $("#quoteBookInput").value = bookId || state.activeTimer?.bookId || "";
    recordedAudioBlob = null;
    capturedImageBlob = null;
    $("#recordingTime").textContent = "00:00";
    updateQuoteAttachmentUI();
    openModal("quoteModal");
  }

  function updateQuoteAttachmentUI() {
    const selectedImage = capturedImageBlob || $("#quoteImageInput")?.files?.[0] || null;
    const preview = $("#quoteImagePreview");
    if (selectedImage) {
      preview.classList.remove("hidden");
      preview.innerHTML = `<img src="${URL.createObjectURL(selectedImage)}" alt="معاينة الصورة">`;
    } else {
      preview.classList.add("hidden");
      preview.innerHTML = "";
    }
    $("#removeQuoteImageButton").classList.toggle("hidden", !selectedImage);
    const selectedAudio = recordedAudioBlob || $("#quoteAudioInput")?.files?.[0] || null;
    $("#removeQuoteAudioButton").classList.toggle("hidden", !selectedAudio);
  }

  async function saveQuote(event) {
    event.preventDefault();
    const text = $("#quoteTextInput").value.trim();
    const imageMedia = capturedImageBlob || $("#quoteImageInput").files[0] || null;
    const audioMedia = recordedAudioBlob || $("#quoteAudioInput").files[0] || null;
    if (!text && !imageMedia && !audioMedia) {
      showToast("أضف نصًا أو صورة أو صوتًا واحدًا على الأقل", "error");
      return;
    }
    if (imageMedia?.size > 5 * 1024 * 1024) {
      showToast("الصورة أكبر من 5MB", "error");
      return;
    }
    if (audioMedia?.size > 10 * 1024 * 1024) {
      showToast("الملف الصوتي أكبر من 10MB", "error");
      return;
    }
    await putQuote({
      id: uid("quote"),
      type: "rich",
      bookId: $("#quoteBookInput").value,
      sessionId: state.activeTimer?.id || null,
      page: Number($("#quotePageInput").value) || null,
      text,
      comment: $("#quoteCommentInput").value.trim(),
      imageMedia,
      audioMedia,
      photoPurpose: $("#quotePhotoPurpose").value,
      createdAt: Date.now()
    });
    closeModal("quoteModal");
    renderDashboard();
    renderQuotes();
    showToast("حُفظ الاقتباس");
  }

  async function toggleRecording() {
    if (mediaRecorder?.state === "recording") {
      stopRecording(false);
      return;
    }
    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") {
      showToast("التسجيل الصوتي غير مدعوم هنا؛ يمكنك اختيار ملف صوتي", "error");
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const chunks = [];
      discardRecordedAudio = false;
      mediaRecorder = new MediaRecorder(stream);
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size) chunks.push(event.data);
      };
      mediaRecorder.onstop = () => {
        recordedAudioBlob = discardRecordedAudio ? null : new Blob(chunks, { type: mediaRecorder.mimeType || "audio/webm" });
        stream.getTracks().forEach((track) => track.stop());
        updateQuoteAttachmentUI();
        if (!discardRecordedAudio) showToast("تم تسجيل المقطع الصوتي");
      };
      mediaRecorder.start();
      recordingStartedAt = Date.now();
      $("#recordAudioButton").classList.add("recording");
      $("#recordAudioButton").lastChild.textContent = " إيقاف التسجيل";
      recordingTimer = window.setInterval(() => {
        const seconds = Math.floor((Date.now() - recordingStartedAt) / 1000);
        $("#recordingTime").textContent = formatDuration(seconds).slice(3);
      }, 500);
    } catch {
      showToast("تعذّر الوصول إلى الميكروفون", "error");
    }
  }

  function stopRecording(discard = false) {
    if (recordingTimer) window.clearInterval(recordingTimer);
    recordingTimer = null;
    discardRecordedAudio = discard;
    if (mediaRecorder?.state === "recording") mediaRecorder.stop();
    if (discard) recordedAudioBlob = null;
    $("#recordAudioButton")?.classList.remove("recording");
    if ($("#recordAudioButton")) $("#recordAudioButton").lastChild.textContent = " بدء التسجيل";
    updateQuoteAttachmentUI();
  }

  function stopCamera() {
    cameraStream?.getTracks().forEach((track) => track.stop());
    cameraStream = null;
    cameraTrack = null;
    $("#cameraVideo").srcObject = null;
    $("#cameraModal").classList.add("hidden");
    if (!$$('.modal-backdrop:not(.hidden)').length) document.body.style.overflow = "";
  }

  async function openCamera() {
    if (!navigator.mediaDevices?.getUserMedia || !window.isSecureContext) {
      showToast("الكاميرا المباشرة تحتاج HTTPS ومتصفّحًا داعمًا؛ استخدم اختيار الصورة", "error");
      return;
    }
    stopCamera();
    try {
      cameraStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: cameraFacingMode }, width: { ideal: 1920 }, height: { ideal: 1440 } },
        audio: false
      });
      cameraTrack = cameraStream.getVideoTracks()[0];
      $("#cameraVideo").srcObject = cameraStream;
      $("#cameraModal").classList.remove("hidden");
      document.body.style.overflow = "hidden";
      const capabilities = cameraTrack.getCapabilities?.() || {};
      cameraZoom = capabilities.zoom?.min || 1;
      $("#cameraHint").textContent = capabilities.zoom
        ? "قرّب بإصبعين، واضغط على موضع للتركيز"
        : "اضغط على موضع للتركيز؛ التكبير اليدوي غير متاح في هذه الكاميرا";
    } catch {
      stopCamera();
      showToast("تعذّر فتح الكاميرا؛ يمكنك اختيار صورة من الجهاز", "error");
    }
  }

  function touchDistance(touches) {
    return Math.hypot(touches[0].clientX - touches[1].clientX, touches[0].clientY - touches[1].clientY);
  }

  async function applyCameraZoom(nextZoom) {
    const capabilities = cameraTrack?.getCapabilities?.() || {};
    if (!capabilities.zoom) return;
    cameraZoom = Math.min(capabilities.zoom.max, Math.max(capabilities.zoom.min, nextZoom));
    try {
      await cameraTrack.applyConstraints({ advanced: [{ zoom: cameraZoom }] });
    } catch {
      // The browser may advertise zoom but reject a particular intermediate value.
    }
  }

  async function focusCameraAt(clientX, clientY) {
    if (!cameraTrack) return;
    const stage = $("#cameraStage");
    const rect = stage.getBoundingClientRect();
    const x = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
    const y = Math.min(1, Math.max(0, (clientY - rect.top) / rect.height));
    const ring = $("#cameraFocusRing");
    ring.style.left = `${x * 100}%`;
    ring.style.top = `${y * 100}%`;
    ring.classList.remove("hidden");
    window.setTimeout(() => ring.classList.add("hidden"), 650);
    const capabilities = cameraTrack.getCapabilities?.() || {};
    try {
      const constraint = { pointsOfInterest: [{ x, y }] };
      if (capabilities.focusMode?.includes("single-shot")) constraint.focusMode = "single-shot";
      await cameraTrack.applyConstraints({ advanced: [constraint] });
      $("#cameraSupportNote").textContent = "تم إرسال نقطة التركيز إلى الكاميرا.";
    } catch {
      $("#cameraSupportNote").textContent = "أظهرنا نقطة التركيز، لكن هذا المتصفّح يدير التركيز تلقائيًا.";
    }
  }

  function captureCameraPhoto() {
    const video = $("#cameraVideo");
    if (!video.videoWidth) {
      showToast("انتظر لحظة حتى تصبح الكاميرا جاهزة", "error");
      return;
    }
    const canvas = $("#cameraCanvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d").drawImage(video, 0, 0);
    canvas.toBlob((blob) => {
      if (!blob) return;
      capturedImageBlob = blob;
      $("#quoteImageInput").value = "";
      updateQuoteAttachmentUI();
      stopCamera();
      showToast("تم التقاط الصورة");
    }, "image/jpeg", 0.88);
  }

  function toggleArticleRead(key) {
    if (!articles[key]) return;
    state.readArticles[key] = !state.readArticles[key];
    saveState();
    renderArticleStates();
  }

  function renderArticleStates() {
    $$("[data-article-read]").forEach((button) => {
      const read = Boolean(state.readArticles[button.dataset.articleRead]);
      button.classList.toggle("read", read);
      button.setAttribute("aria-pressed", String(read));
      button.innerHTML = `<span>✓</span> ${read ? "تمت القراءة" : "قرأت هذا المقال"}`;
    });
  }

  function openArticle(key) {
    const article = articles[key];
    if (!article) return;
    $("#articleModalContent").innerHTML = `
      <header class="article-hero">
        <span class="article-tag">${escapeHTML(article.tag)}</span>
        <h2 id="articleModalTitle">${escapeHTML(article.title)}</h2>
        <p>${escapeHTML(article.intro)}</p>
        <button class="article-read-toggle ${state.readArticles[key] ? "read" : ""}" type="button" data-article-read="${key}"><span>✓</span> ${state.readArticles[key] ? "تمت القراءة" : "قرأت هذا المقال"}</button>
      </header>
      <div class="article-prose">${article.body}</div>`;
    openModal("articleModal");
  }

  function csvEscape(value) {
    const string = String(value ?? "");
    return `"${string.replaceAll('"', '""')}"`;
  }

  function downloadFile(filename, content, mimeType) {
    const blob = content instanceof Blob ? content : new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = filename;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
  }

  function exportCsv() {
    const headers = ["session_id", "book_title", "author", "entry_type", "started_at", "ended_at", "duration_minutes", "start_page", "end_page", "seconds_per_page", "focus_rating", "understanding_rating", "note"];
    const rows = state.sessions.map((session) => {
      const book = bookById(session.bookId);
      return [
        session.id,
        book?.title || "",
        book?.author || "",
        session.manual ? "manual" : "tracked",
        new Date(session.startedAt).toISOString(),
        new Date(session.endedAt).toISOString(),
        Math.round((session.durationSeconds / 60) * 100) / 100,
        session.startPage ?? "",
        session.endPage ?? "",
        secondsPerPage(session) ? Math.round(secondsPerPage(session) * 100) / 100 : "",
        session.focusRating ?? "",
        session.understandingRating ?? "",
        session.note || ""
      ];
    });
    const csv = "\uFEFF" + [headers, ...rows].map((row) => row.map(csvEscape).join(",")).join("\r\n");
    downloadFile(`${APP_CONFIG.exportSlug}-sessions-${localDateKey()}.csv`, csv, "text/csv;charset=utf-8");
    showToast("تم تحميل سجل الجلسات");
  }

  async function exportJson() {
    const quotes = await Promise.all(
      quoteCache.map(async (quote) => ({
        ...quote,
        media: quote.media ? await blobToDataURL(quote.media) : null,
        imageMedia: quote.imageMedia ? await blobToDataURL(quote.imageMedia) : null,
        audioMedia: quote.audioMedia ? await blobToDataURL(quote.audioMedia) : null
      }))
    );
    const backup = {
      app: APP_CONFIG.exportId,
      version: 2,
      exportedAt: new Date().toISOString(),
      data: {
        ...state,
        quotes
      }
    };
    downloadFile(
      `${APP_CONFIG.exportSlug}-backup-${localDateKey()}.json`,
      JSON.stringify(backup, null, 2),
      "application/json;charset=utf-8"
    );
    showToast("تم تحميل النسخة الكاملة");
  }

  async function importJson(file) {
    try {
      const backup = JSON.parse(await file.text());
      if (![APP_CONFIG.exportId, "midad-reading-tracker"].includes(backup?.app) || !backup?.data) throw new Error("invalid");
      if (!window.confirm("ستستبدل هذه النسخة البيانات الحالية. هل تريد المتابعة؟")) return;
      const imported = backup.data;
      const { studySessions: _legacyStudySessions, activeStudy: _legacyActiveStudy, ...importedWithoutStudy } = imported;
      state = {
        ...structuredClone(defaultState),
        ...importedWithoutStudy,
        settings: { ...defaultState.settings, ...(imported.settings || {}) },
        books: Array.isArray(imported.books) ? imported.books : [],
        sessions: Array.isArray(imported.sessions) ? imported.sessions : [],
        readArticles: imported.readArticles && typeof imported.readArticles === "object" ? imported.readArticles : {},
        unlockedAchievements: imported.unlockedAchievements && typeof imported.unlockedAchievements === "object" ? imported.unlockedAchievements : {},
        activeTimer: null
      };
      await clearQuotes();
      for (const quote of imported.quotes || []) {
        await putQuote({
          ...quote,
          media: typeof quote.media === "string" ? dataURLToBlob(quote.media) : null,
          imageMedia: typeof quote.imageMedia === "string" ? dataURLToBlob(quote.imageMedia) : null,
          audioMedia: typeof quote.audioMedia === "string" ? dataURLToBlob(quote.audioMedia) : null
        });
      }
      saveState();
      renderAll();
      await renderQuotes();
      showToast("تمت استعادة النسخة");
    } catch {
      showToast("ملف النسخة غير صالح", "error");
    } finally {
      $("#importJsonInput").value = "";
    }
  }

  async function clearAllData() {
    localStorage.removeItem(STORAGE_KEY);
    LEGACY_STORAGE_KEYS.forEach((key) => localStorage.removeItem(key));
    await clearQuotes();
    stopTimerLoop();
    stopFocusMusic();
    state = structuredClone(defaultState);
    saveState();
    closeModal("confirmModal");
    renderAll();
    await renderQuotes();
    showToast(`حُذفت بيانات ${APP_NAME} من هذا الجهاز`);
  }

  function isInstalledDisplayMode() {
    return window.matchMedia?.("(display-mode: standalone)").matches || window.navigator.standalone === true;
  }

  function markAppInstalled() {
    localStorage.setItem(INSTALL_FLAG_KEY, "true");
    renderInstallState();
  }

  function renderInstallState() {
    if (isInstalledDisplayMode()) localStorage.setItem(INSTALL_FLAG_KEY, "true");
    const installed = localStorage.getItem(INSTALL_FLAG_KEY) === "true";
    $("#homeInstallCard").classList.toggle("hidden", installed);
    $("#settingsInstallButton").classList.toggle("hidden", installed);
    $("#settingsInstalledConfirmation").classList.toggle("hidden", !installed);
  }

  async function installApp() {
    if (deferredInstallPrompt) {
      deferredInstallPrompt.prompt();
      const choice = await deferredInstallPrompt.userChoice;
      if (choice.outcome === "accepted") markAppInstalled();
      deferredInstallPrompt = null;
      return;
    }
    showToast("للتثبيت: افتح قائمة المتصفّح واختر «تثبيت التطبيق» أو «إضافة إلى الشاشة الرئيسية»");
  }

  function setupEvents() {
    document.addEventListener("click", async (event) => {
      const articleReadButton = event.target.closest("[data-article-read]");
      if (articleReadButton) {
        event.preventDefault();
        event.stopPropagation();
        toggleArticleRead(articleReadButton.dataset.articleRead);
        return;
      }

      const closeButton = event.target.closest("[data-close-modal]");
      if (closeButton) {
        closeModal(closeButton.dataset.closeModal);
        return;
      }

      const pageButton = event.target.closest("[data-page]");
      if (pageButton) {
        event.preventDefault();
        navigate(pageButton.dataset.page);
        return;
      }

      const jumpButton = event.target.closest("[data-page-jump]");
      if (jumpButton) {
        pendingSettingsTarget = jumpButton.dataset.settingsTarget || null;
        navigate(jumpButton.dataset.pageJump);
        return;
      }

      const actionButton = event.target.closest("[data-action]");
      if (actionButton?.dataset.action === "open-book-modal") {
        openBookModal();
        return;
      }

      const readButton = event.target.closest("[data-read-book]");
      if (readButton) {
        closeModal("bookDetailModal");
        selectBookAndRead(readButton.dataset.readBook);
        return;
      }

      const editButton = event.target.closest("[data-edit-book]");
      if (editButton) {
        openBookModal(bookById(editButton.dataset.editBook));
        return;
      }

      const sessionDetail = event.target.closest("[data-session-detail]");
      if (sessionDetail) {
        openBookDetail(sessionDetail.dataset.bookDetail, sessionDetail.dataset.sessionDetail);
        return;
      }

      const bookDetail = event.target.closest("[data-book-detail]");
      if (bookDetail) {
        openBookDetail(bookDetail.dataset.bookDetail);
        return;
      }

      const articleCard = event.target.closest("[data-article]");
      if (articleCard) {
        openArticle(articleCard.dataset.article);
        return;
      }

      const deleteQuoteButton = event.target.closest("[data-delete-quote]");
      if (deleteQuoteButton && window.confirm("حذف هذا الاقتباس؟")) {
        await deleteQuote(deleteQuoteButton.dataset.deleteQuote);
        renderDashboard();
        renderQuotes();
        showToast("حُذف الاقتباس");
      }

      if (!event.target.closest("#headerMenu, #headerMenuButton")) {
        $("#headerMenu").classList.add("hidden");
        $("#headerMenuButton").setAttribute("aria-expanded", "false");
      }
    });

    document.addEventListener("keydown", (event) => {
      if ((event.key === "Enter" || event.key === " ") && event.target.matches(".book-card[data-book-detail]")) {
        event.preventDefault();
        openBookDetail(event.target.dataset.bookDetail);
      }
    });

    $$(".modal-backdrop").forEach((backdrop) => {
      backdrop.addEventListener("click", (event) => {
        if (event.target !== backdrop) return;
        if (["finishSessionModal", "sessionResultModal", "cameraModal"].includes(backdrop.id)) return;
        closeModal(backdrop.id);
      });
    });

    $("#headerMenuButton").addEventListener("click", () => {
      const menu = $("#headerMenu");
      const willOpen = menu.classList.contains("hidden");
      menu.classList.toggle("hidden", !willOpen);
      $("#headerMenuButton").setAttribute("aria-expanded", String(willOpen));
    });
    $("#bookForm").addEventListener("submit", saveBook);
    $("#bookCoverInput").addEventListener("change", async (event) => {
      const file = event.target.files[0];
      if (!file) return;
      if (file.size > 2 * 1024 * 1024) {
        showToast("صورة الغلاف أكبر من 2MB", "error");
        event.target.value = "";
        return;
      }
      const preview = await fileToDataURL(file);
      $("#coverPreview").innerHTML = `<img src="${preview}" alt="">`;
    });
    $("#bookSearch").addEventListener("input", renderBooks);
    $("#bookFilters").addEventListener("click", (event) => {
      const button = event.target.closest("[data-filter]");
      if (!button) return;
      currentBookFilter = button.dataset.filter;
      $$("#bookFilters button").forEach((item) => item.classList.toggle("active", item === button));
      renderBooks();
    });

    $("#quoteSearch").addEventListener("input", renderQuotes);
    $("#quoteBookFilter").addEventListener("change", renderQuotes);
    $("#openQuoteModalButton").addEventListener("click", () => openQuoteModal());
    $("#openSessionQuoteButton").addEventListener("click", () => {
      if (!state.activeTimer) {
        showToast("ابدأ جلسة قراءة أولًا لربط الاقتباس بها", "error");
        return;
      }
      openQuoteModal(state.activeTimer.bookId);
    });
    $("#quoteForm").addEventListener("submit", saveQuote);
    $("#quoteImageInput").addEventListener("change", updateQuoteAttachmentUI);
    $("#quoteAudioInput").addEventListener("change", updateQuoteAttachmentUI);
    $("#removeQuoteImageButton").addEventListener("click", () => {
      capturedImageBlob = null;
      $("#quoteImageInput").value = "";
      updateQuoteAttachmentUI();
    });
    $("#removeQuoteAudioButton").addEventListener("click", () => {
      stopRecording(true);
      recordedAudioBlob = null;
      $("#quoteAudioInput").value = "";
      updateQuoteAttachmentUI();
    });
    $("#recordAudioButton").addEventListener("click", toggleRecording);
    $("#openCameraButton").addEventListener("click", openCamera);
    $("#closeCameraButton").addEventListener("click", stopCamera);
    $("#capturePhotoButton").addEventListener("click", captureCameraPhoto);
    $("#switchCameraButton").addEventListener("click", async () => {
      cameraFacingMode = cameraFacingMode === "environment" ? "user" : "environment";
      await openCamera();
    });
    $("#cameraStage").addEventListener("touchstart", (event) => {
      if (event.touches.length === 2) {
        cameraPinching = true;
        pinchStartDistance = touchDistance(event.touches);
        pinchStartZoom = cameraZoom;
      }
    }, { passive: true });
    $("#cameraStage").addEventListener("touchmove", (event) => {
      if (event.touches.length !== 2 || !pinchStartDistance) return;
      event.preventDefault();
      applyCameraZoom(pinchStartZoom * (touchDistance(event.touches) / pinchStartDistance));
    }, { passive: false });
    $("#cameraStage").addEventListener("touchend", (event) => {
      if (event.touches.length < 2) window.setTimeout(() => { cameraPinching = false; }, 120);
    }, { passive: true });
    $("#cameraStage").addEventListener("pointerup", (event) => {
      if (!cameraPinching) focusCameraAt(event.clientX, event.clientY);
      pinchStartDistance = 0;
    });

    $("#startPauseButton").addEventListener("click", () => {
      if (!state.activeTimer) startNewTimer();
      else if (state.activeTimer.status === "running") pauseTimer();
      else resumeTimer();
    });
    $("#resetTimerButton").addEventListener("click", cancelTimer);
    $("#stopTimerButton").addEventListener("click", prepareFinishSession);
    $("#finishSessionForm").addEventListener("submit", finishSession);
    $("#discardFinishedSessionButton").addEventListener("click", discardFinishedSession);
    $("#openManualSessionButton").addEventListener("click", openManualSessionModal);
    $("#manualSessionForm").addEventListener("submit", saveManualSession);
    $("#closeSessionResultButton").addEventListener("click", () => {
      closeModal("sessionResultModal");
      navigate("home");
      maybeShowPostSessionAd();
    });
    $("#sessionQuickNote").addEventListener("input", () => {
      if (state.activeTimer) {
        state.activeTimer.quickNote = $("#sessionQuickNote").value;
        saveState();
      }
    });

    $("#saveGoalsButton").addEventListener("click", () => {
      const daily = Number($("#dailyGoalInput").value);
      const weekly = Number($("#weeklyGoalInput").value);
      if (daily < 5 || weekly < 1) {
        showToast("تحقق من قيم الأهداف", "error");
        return;
      }
      state.settings.dailyGoalMinutes = daily;
      state.settings.weeklyGoalSessions = weekly;
      saveState();
      renderAll();
      showToast("تم حفظ أهدافك");
    });
    $("#reminderIntervalInput").addEventListener("change", (event) => {
      state.settings.reminderMinutes = Number(event.target.value);
      saveState();
      renderSettings();
      showToast("تم تحديث وقت التذكير");
    });
    $("#enableNotificationsButton").addEventListener("click", enableNotifications);
    $("#notificationButton").addEventListener("click", () => {
      pendingSettingsTarget = null;
      navigate("settings");
    });
    $("#exportQuickButton").addEventListener("click", exportCsv);
    $("#sessionsExportButton").addEventListener("click", exportCsv);
    $("#exportCsvButton").addEventListener("click", exportCsv);
    $("#exportJsonButton").addEventListener("click", exportJson);
    $("#importJsonInput").addEventListener("change", (event) => {
      if (event.target.files[0]) importJson(event.target.files[0]);
    });
    $("#clearDataButton").addEventListener("click", () => openModal("confirmModal"));
    $("#confirmClearDataButton").addEventListener("click", clearAllData);
    $("#homeInstallButton").addEventListener("click", installApp);
    $("#settingsInstallButton").addEventListener("click", installApp);
    $("#reportRange").addEventListener("click", (event) => {
      const button = event.target.closest("[data-range]");
      if (!button) return;
      reportRange = button.dataset.range === "all" ? "all" : Number(button.dataset.range);
      $$("#reportRange button").forEach((item) => item.classList.toggle("active", item === button));
      renderReports();
    });

    $("#musicTrackOptions").addEventListener("click", (event) => {
      const button = event.target.closest("[data-music]");
      if (button) selectFocusMusic(button.dataset.music);
    });
    $("#focusMusicButton").addEventListener("click", toggleFocusMusic);
    $("#musicVolumeInput").addEventListener("input", (event) => setFocusMusicVolume(event.target.value));

    window.addEventListener("hashchange", () => navigate(location.hash.slice(1) || "home"));
    window.addEventListener("beforeinstallprompt", (event) => {
      event.preventDefault();
      deferredInstallPrompt = event;
      renderInstallState();
    });
    window.addEventListener("appinstalled", () => {
      deferredInstallPrompt = null;
      markAppInstalled();
      showToast(`تم تثبيت ${APP_NAME}`);
    });
    window.addEventListener("online", updateConnectionStatus);
    window.addEventListener("offline", updateConnectionStatus);
    document.addEventListener("visibilitychange", () => {
      if (!document.hidden) {
        updateTimerUI();
        renderInstallState();
      }
    });
  }
  async function initialize() {
    applyAppIdentity();
    saveState();
    renderDates();
    setupEvents();
    updateConnectionStatus();
    try {
      await getAllQuotes();
    } catch {
      showToast("تعذّر فتح مساحة الوسائط المحلية", "error");
    }
    unlockEligibleAchievements();
    renderAll();
    navigate(location.hash.slice(1) || "home");
    if (state.activeTimer?.status === "running") startTimerLoop();
    renderInstallState();
    if ("serviceWorker" in navigator && location.protocol !== "file:") {
      navigator.serviceWorker.register("./sw.js").catch(() => {});
    }
  }

  initialize();
})();

export type Lang = "ar" | "en";

export interface Localized {
  ar: string;
  en: string;
}

export interface ProductSpec {
  label: Localized;
  value: Localized;
}

export interface Review {
  id: string;
  name: string;
  governorate: Localized;
  rating: number;
  date: string;
  text: Localized;
  verified: boolean;
}

export interface Product {
  id: string;
  slug: string;
  title: Localized;
  description: Localized;
  price: number;
  compareAt: number;
  badge: Localized | null;
  category: "lighting" | "gadgets" | "exterior" | "interior" | "security";
  image: string;
  gallery: string[];
  specs: ProductSpec[];
  installation: Localized;
  reviews: Review[];
  stock: number;
  soldCount: number;
  rating: number;
}

export interface Bundle {
  id: string;
  name: Localized;
  minQty: number;
  discountPct: number;
  freeDelivery: boolean;
  color: string;
}

export interface ReelVideo {
  id: string;
  videoUrl: string;
  poster: string;
  views: string;
  likes: string;
  title: Localized;
  caption: Localized;
  productIds: string[];
  hook: Localized;
}

const IMG = (id: string) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=900&q=80`;

export const CATEGORIES: { id: Product["category"]; label: Localized }[] = [
  { id: "lighting", label: { ar: "إضاءة ليلية", en: "Night Lighting" } },
  { id: "gadgets", label: { ar: "أجهزة ذكية", en: "Smart Gadgets" } },
  { id: "exterior", label: { ar: "خارج السيارة", en: "Exterior" } },
  { id: "interior", label: { ar: "داخل السيارة", en: "Interior" } },
  { id: "security", label: { ar: "أمن وتتبع", en: "Security & Tracking" } },
];

export const PRODUCTS: Product[] = [
  {
    id: "p1",
    slug: "led-matrix-panel",
    title: {
      ar: "لوح ذكي LED للسيارة - عيون الشيطان",
      en: "Programmable Smart LED Matrix Panel",
    },
    description: {
      ar: "لوح LED مرن قابل للبرمجة يتحكم فيه التطبيق عبر البلوتوث. اكتب أي نص أو ارسم أي أنيميشن واعرضه على زجاج سيارتك. عيون الشيطان، Wanted، You Lose — اللي يشوفك ما ينساك. يعمل بكيبل USB من الشاحن، تركيب لاصق بدون أي تغييرات على أسلاك السيارة ولا يلغي الضمان.",
      en: "A flexible programmable LED matrix controlled from your phone over Bluetooth. Type any text, draw any animation, blast it on your rear glass. Devil Eyes, Wanted, You Lose — nobody forgets you. USB powered from your charger, adhesive mount, zero wire cutting, warranty untouched.",
    },
    price: 18.0,
    compareAt: 25.0,
    badge: { ar: "🔥 452K+ مشاهدة على الريلز", en: "🔥 452K+ Views on Reels" },
    category: "lighting",
    image: IMG("photo-1503376780353-7e6692767b70"),
    gallery: [
      IMG("photo-1503376780353-7e6692767b70"),
      IMG("photo-1492144534655-ae79c964c9d7"),
      IMG("photo-1493238792000-8113da705763"),
    ],
    specs: [
      { label: { ar: "الاتصال", en: "Connectivity" }, value: { ar: "بلوتوث عبر التطبيق (iOS/Android)", en: "Bluetooth app control (iOS/Android)" } },
      { label: { ar: "الطاقة", en: "Power" }, value: { ar: "USB 5V — من شاحن السيارة", en: "USB 5V — from car charger" } },
      { label: { ar: "الألوان", en: "Colors" }, value: { ar: "RGB كامل مع أنيميشن جاهز", en: "Full RGB with preset animations" } },
      { label: { ar: "الحجم", en: "Size" }, value: { ar: "38 × 14 سم — قابل للثني", en: "38 × 14 cm — flexible" } },
      { label: { ar: "التركيب", en: "Mounting" }, value: { ar: "لاصق 3M — بدون تغيير الأسلاك", en: "3M adhesive — no wire cutting" } },
    ],
    installation: {
      ar: "1. نظف الزجاج من الزيوت. 2. اثبت اللوح باللاصق في أعلى الوسط. 3. وصّل كيبل USB للشاحن. 4. حمّل التطبيق واقترن بالبلوتوث. 5. اكتب رسالتك وشغّل. التركيب 5 دقائق، بدون أي تغييرات على كابلات السيارة.",
      en: "1. Clean the glass of grease. 2. Fix the panel with adhesive top-center. 3. Plug the USB cable into your charger. 4. Install the app and pair over Bluetooth. 5. Type your message and go. 5-minute install, no wiring changes.",
    },
    reviews: [
      { id: "r1", name: "Yazan Al-Khateeb", governorate: { ar: "عمّان", en: "Amman" }, rating: 5, date: "2026-10-12", text: { ar: "ركبته على كامري والشباب ما صدّقوا. التطبيق سهل والأنميشن نار.", en: "Put it on my Camry and the guys lost it. App is easy, animations are fire." }, verified: true },
      { id: "r2", name: "Sara Haddad", governorate: { ar: "إربد", en: "Irbid" }, rating: 5, date: "2026-09-30", text: { ar: "التوصيل وصل باليومين والجودة أعلى من الصور.", en: "Arrived in two days, quality better than the photos." }, verified: true },
      { id: "r3", name: "Omar Tobbeh", governorate: { ar: "الزرقاء", en: "Zarqa" }, rating: 4, date: "2026-09-18", text: { ar: "ممتاز بس حبيت أقوى لاصق، غيرته بواحد من سيارة.", en: "Great, just wanted a stronger adhesive — swapped it from another car's." }, verified: true },
    ],
    stock: 42,
    soldCount: 1284,
    rating: 4.8,
  },
  {
    id: "p2",
    slug: "drift-rc-car",
    title: {
      ar: "سيارات الدرفت RC الاحترافية 1:16",
      en: "Pro Drift RC Cars 1:16",
    },
    description: {
      ar: "سيارة ريموت كنترول 1:16 بدفع رباعي وتسارع تناسبي — تعطيها الباور بالتدريج مثل السيارة الحقيقية. إطارات درفت قابلة للتبديل مع إطارات سباق، مصابيح LED أمامية، وتأثير دخان من الخلف. تجي بعلبة الهدايا جاهزة للإهداء.",
      en: "1:16 RC with 4WD and proportional throttle — ease the power on like a real car. Swap between drift and racing tires, LED headlights, rear mist smoke effect. Comes gift-boxed and ready to hand over.",
    },
    price: 22.0,
    compareAt: 30.0,
    badge: { ar: "الأكثر مبيعاً", en: "Best Seller" },
    category: "gadgets",
    image: IMG("photo-1552519507-da3b142c6e3d"),
    gallery: [
      IMG("photo-1552519507-da3b142c6e3d"),
      IMG("photo-1547744152-14d985cb937f"),
      IMG("photo-1580273916550-e323be2ae537"),
    ],
    specs: [
      { label: { ar: "المقياس", en: "Scale" }, value: { ar: "1:16 — طول 24 سم", en: "1:16 — 24 cm length" } },
      { label: { ar: "الدفع", en: "Drivetrain" }, value: { ar: "4WD مع تسارع تناسبي", en: "4WD with proportional throttle" } },
      { label: { ar: "البطارية", en: "Battery" }, value: { ar: "ليثيوم 7.4V — 25 دقيقة عمل", en: "7.4V lithium — 25 min runtime" } },
      { label: { ar: "الإطارات", en: "Tires" }, value: { ar: "درفت + سباق — قابلة للتبديل", en: "Drift + racing — interchangeable" } },
      { label: { ar: "المميزات", en: "Features" }, value: { ar: "مصابيح LED + دخان خلفي", en: "LED headlights + rear mist" } },
    ],
    installation: {
      ar: "1. اشحن البطارية 90 دقيقة أول مرة. 2. حطّ الإطارات اللي تبيها (درفت للانزلاق، سباق للثبات). 3. زوّج الرموت على القناة. 4. ارجع الإطار الخلفي للخلف عند الحاجة لدخان. 5. العب — الصيانة تنظيف بس بعد كل جلسة.",
      en: "1. Charge the battery 90 min first run. 2. Fit the tires you want (drift for slides, racing for grip). 3. Pair the remote on its channel. 4. Refill the rear tank for smoke. 5. Drive — maintenance is a wipe-down after each session.",
    },
    reviews: [
      { id: "r4", name: "Khaled Fawzi", governorate: { ar: "عمّان", en: "Amman" }, rating: 5, date: "2026-10-05", text: { ar: "الدرفت عليها حقيقي، انزلاق نظيف على البلاط.", en: "The drift is real, clean slides on tile." }, verified: true },
      { id: "r5", name: "Nour Awad", governorate: { ar: "العقبة", en: "Aqaba" }, rating: 5, date: "2026-09-22", text: { ar: "هدية أخوي عجبته، الدخان خرافة.", en: "Gift for my brother, he loved it. The smoke is unreal." }, verified: true },
    ],
    stock: 30,
    soldCount: 903,
    rating: 4.9,
  },
  {
    id: "p3",
    slug: "titanium-sunshade-umbrella",
    title: {
      ar: "مظلة السيارة العاكسة للحرارة",
      en: "Reflective Titanium Car Sunshade Umbrella",
    },
    description: {
      ar: "مظلة سيارة بطبقه تيتانيوم عاكسة تخفض حرارة الكابينة 20 درجة مئوية. عشر عصي مقوّاة تتحمل الرياح، حماية UPF 50+ من الأشعة، وتنطوي بعلبة جلد أنيقة. فتح وإغلاق مثل المظلة العادية — ثانيتين وتنتهي.",
      en: "A car sunshade with a titanium reflective layer that drops cabin temp by 20°C. Ten reinforced ribs handle wind, UPF 50+ UV block, folds into a smart leather pouch. Opens like an umbrella — two seconds and done.",
    },
    price: 9.0,
    compareAt: 14.0,
    badge: { ar: "أساسي للصيف", en: "Summer Essential" },
    category: "exterior",
    image: IMG("photo-1449965408869-eaa3f722e40d"),
    gallery: [
      IMG("photo-1449965408869-eaa3f722e40d"),
      IMG("photo-1506521781263-d8422e82f27a"),
      IMG("photo-1552519507-da3b142c6e3d"),
    ],
    specs: [
      { label: { ar: "الحماية", en: "Protection" }, value: { ar: "UPF 50+ — عاكس تيتانيوم", en: "UPF 50+ — titanium reflective" } },
      { label: { ar: "الهياكل", en: "Frame" }, value: { ar: "10 عصي مقوّاة", en: "10 reinforced ribs" } },
      { label: { ar: "خفض الحرارة", en: "Temp Drop" }, value: { ar: "حتى 20° مئوية داخل الكابينة", en: "Up to 20°C inside the cabin" } },
      { label: { ar: "الحجم", en: "Size" }, value: { ar: "يفتح 130 سم — ينطوي 29 سم", en: "Opens to 130 cm — folds to 29 cm" } },
      { label: { ar: "الحفظ", en: "Storage" }, value: { ar: "علبة جلد بحزام", en: "Leather pouch with strap" } },
    ],
    installation: {
      ar: "1. افتح المظلة مثل أي مظلة. 2. ادفعها خلف الزجاج الأمامي وثبّت الأطراف بين الزجاج والهيكل. 3. للمحافظة: اتركها مفتوحة ساعة بعد السيطرة على الحرارة. 4. اطوى وحطّها بالعلبة — مساحة صندوق القفازات.",
      en: "1. Open it like any umbrella. 2. Press it behind the windshield and tuck the edges between glass and dash. 3. For best results leave it up an hour after parking. 4. Fold into the pouch — glovebox sized.",
    },
    reviews: [
      { id: "r6", name: "Lina Barakat", governorate: { ar: "عمّان", en: "Amman" }, rating: 5, date: "2026-08-14", text: { ar: "فرق حقيقي بالحر، السيارة صارت تدخل باردة.", en: "Real difference, the car cools down now." }, verified: true },
      { id: "r7", name: "Tariq Shqeirat", governorate: { ar: "السلط", en: "Salt" }, rating: 4, date: "2026-08-02", text: { ar: "قوية والرياح ما هزّتها، بس أبي أكبر للسيارات الكبيرة.", en: "Sturdy, wind didn't move it — want a bigger one for large cars." }, verified: true },
    ],
    stock: 88,
    soldCount: 2140,
    rating: 4.7,
  },
  {
    id: "p4",
    slug: "led-flame-exhaust",
    title: {
      ar: "ضوء الاكزوزت الأسطواني الناري",
      en: "LED Flame Exhaust Light",
    },
    description: {
      ar: "أضواء إكزوزست أسطوية بتأثير ناري يشتغل مع الفرملة والرجوع للخلف. هوز كربوني بمظهر ألياف الكربون، إضاءة LED حمراء وزرقاء بتأثير الباكنجر، ومشبك تثبيت عام يناسب كل سيارة. بدون أي تغيير على عادم السيارة.",
      en: "Cylindrical exhaust lights with a flame effect that fires on braking and reverse. Carbon-style housing, red/blue LED afterburner glow, universal clamp mount fits every car. Zero modification to the actual exhaust.",
    },
    price: 12.0,
    compareAt: 18.0,
    badge: { ar: "مود ليلي فيروسي", en: "Viral Night Mod" },
    category: "lighting",
    image: IMG("photo-1494905998402-395d579af36f"),
    gallery: [
      IMG("photo-1494905998402-395d579af36f"),
      IMG("photo-1552519507-da3b142c6e3d"),
      IMG("photo-1503376780353-7e6692767b70"),
    ],
    specs: [
      { label: { ar: "التأثير", en: "Effect" }, value: { ar: "نار + باكنجر أحمر/أزرق", en: "Flame + red/blue afterburner" } },
      { label: { ar: "التشغيل", en: "Trigger" }, value: { ar: "مع الفرملة والرجوع للخلف", en: "On brake and reverse" } },
      { label: { ar: "الهيكل", en: "Housing" }, value: { ar: "ستايل ألياف كربون", en: "Carbon-fiber style" } },
      { label: { ar: "التركيب", en: "Mounting" }, value: { ar: "مشبك عام — بدون تغيير العادم", en: "Universal clamp — exhaust untouched" } },
      { label: { ar: "الطاقة", en: "Power" }, value: { ar: "12V من كابل الفرامل", en: "12V from brake lines" } },
    ],
    installation: {
      ar: "1. اثبت المشبك على أنبوب الإكزوزست الخلفي. 2. وصّل الكيبل الأحمر على دائرة الفرملة والأسود على الأرضي. 3. شغّل وضع الفرملة وتأكد من الإضاءة. 4. اضبط زاوية الأسطوانة لتبدو نظيفة. بدون تخريم أو تغيير على العادم.",
      en: "1. Clamp onto the rear exhaust tip. 2. Red wire to the brake circuit, black to ground. 3. Test brake mode lights up. 4. Angle the cylinders to sit flush. No drilling, exhaust untouched.",
    },
    reviews: [
      { id: "r8", name: "Ahmad Rjoob", governorate: { ar: "إربد", en: "Irbid" }, rating: 5, date: "2026-10-01", text: { ar: "يلوح مع الفرملة وناس ماصدّقوا إني ركّبته بعشرين دقيقة.", en: "Glows on braking, people can't believe I installed it in 20 minutes." }, verified: true },
      { id: "r9", name: "Dina Mousa", governorate: { ar: "عمّان", en: "Amman" }, rating: 5, date: "2026-09-11", text: { ar: "بالليل السيارة تطلع جنّة. وصل باليوم.", en: "At night the car looks insane. Next-day delivery." }, verified: true },
    ],
    stock: 55,
    soldCount: 766,
    rating: 4.8,
  },
  {
    id: "p5",
    slug: "cordless-turbo-vacuum",
    title: {
      ar: "المكنسة الكهربائية المتنقلة 2 في 1",
      en: "Cordless High-Suction Turbo Vacuum & Blower",
    },
    description: {
      ar: "مكنسة لاسلكية بمحرك براشلس وشفط قوي تنظّف بها السيارة من الداخل والخارج. فلتر HEPA قابل للغسل، شحن سريع Type-C، ومعشّفت هواء تقلب للمكنسة فيقلّب الغبار من الشقق. كل ملحقاتها بالعلبة.",
      en: "A cordless vacuum with a brushless motor and strong suction that cleans the car inside and out. Washable HEPA filter, Type-C fast charging, and the nozzle flips to blower mode to blast dust out of the crevices. Every attachment in the box.",
    },
    price: 14.0,
    compareAt: 20.0,
    badge: { ar: "طلب عالي", en: "High Demand" },
    category: "interior",
    image: IMG("photo-1558618666-fcd25c85cd64"),
    gallery: [
      IMG("photo-1558618666-fcd25c85cd64"),
      IMG("photo-1585771724684-38269d6639fd"),
      IMG("photo-1449965408869-eaa3f722e40d"),
    ],
    specs: [
      { label: { ar: "المحرك", en: "Motor" }, value: { ar: "براشلس — شفط عالي", en: "Brushless — high suction" } },
      { label: { ar: "الفلتر", en: "Filter" }, value: { ar: "HEPA قابل للغسل", en: "Washable HEPA" } },
      { label: { ar: "الشحن", en: "Charging" }, value: { ar: "Type-C سريع — 3.5 ساعة تشغيل", en: "Type-C fast — 3.5 hrs runtime" } },
      { label: { ar: "الوضع", en: "Modes" }, value: { ar: "شفط + منفاخ هواء", en: "Vacuum + air duster" } },
      { label: { ar: "الوزن", en: "Weight" }, value: { ar: "680 جرام", en: "680 grams" } },
    ],
    installation: {
      ar: "1. اشحن أول مرة لفل كامل. 2. اركّب الفرشاة للمنطقة الجافة أو الفوهة للشقق. 3. لوضع المنفاخ: اقلب الفوهة وشغّل الوضع العالي. 4. اغسل الفلتر كل أسبوعين واتركه يجف تماماً قبل التركيب. 5. خزّن بالعلبة مع كل الملحقات.",
      en: "1. Full charge first run. 2. Fit the brush for dry areas or the crevice tool for gaps. 3. For blower mode: flip the nozzle and hit high. 4. Wash the filter fortnightly, dry fully before refitting. 5. Store in the case with all tools.",
    },
    reviews: [
      { id: "r10", name: "Rami Quneis", governorate: { ar: "الزرقاء", en: "Zarqa" }, rating: 5, date: "2026-09-27", text: { ar: "شفطتها قوية، مسحت الرمل من الزربية بمرّة.", en: "Suction is strong, got the sand out of the mat in one pass." }, verified: true },
      { id: "r11", name: "Hala Zoubi", governorate: { ar: "عمّان", en: "Amman" }, rating: 5, date: "2026-09-05", text: { ar: "خفيفة وبطاريتها تكفي السيارة كاملة.", en: "Lightweight and the battery does the whole car." }, verified: true },
    ],
    stock: 61,
    soldCount: 1450,
    rating: 4.7,
  },
  {
    id: "p6",
    slug: "magnetic-gps-tracker",
    title: {
      ar: "جهاز تتبع GPS المغناطيسي الذكي",
      en: "Magnetic Real-Time GPS Tracker",
    },
    description: {
      ar: "جهاز تتبع GPS بمغناطيس نيوموديوم قوي يلزقه تحت السيارة في ثانية. تتبع مباشر من الجوال، تنبيهات السياج الجغرافي، وبطارية تدوم أسابيع بالوضع الساكن. مثالي لحماية سيارتك أو متابعة أفراد العائلة.",
      en: "A GPS tracker with a strong neodymium magnet that sticks under the car in a second. Live tracking from your phone, geo-fence alerts, and a battery that lasts weeks on standby. Built to guard your car or keep tabs on family.",
    },
    price: 15.0,
    compareAt: 22.0,
    badge: { ar: "اختيار الأمان", en: "Security Pick" },
    category: "security",
    image: IMG("photo-1550751827-4bd374c3f58b"),
    gallery: [
      IMG("photo-1550751827-4bd374c3f58b"),
      IMG("photo-1451187580459-43490279c0fa"),
      IMG("photo-1503376780353-7e6692767b70"),
    ],
    specs: [
      { label: { ar: "التثبيت", en: "Mounting" }, value: { ar: "مغناطيس نيوموديوم خفي", en: "Hidden neodymium magnet" } },
      { label: { ar: "التتبع", en: "Tracking" }, value: { ar: "مباشر عبر التطبيق — لحظي", en: "Live in-app — real time" } },
      { label: { ar: "التنبيهات", en: "Alerts" }, value: { ar: "سياج جغرافي + حركة", en: "Geo-fence + motion alerts" } },
      { label: { ar: "البطارية", en: "Battery" }, value: { ar: "2000mAh — حتى 30 يوم سكون", en: "2000mAh — up to 30 days standby" } },
      { label: { ar: "الشبكة", en: "Network" }, value: { ar: "2G/4G + GPS مزدوج", en: "2G/4G + dual GPS" } },
    ],
    installation: {
      ar: "1. حمّل التطبيق وسجّل حسابك. 2. شغّل الشريحة داخل الجهاز. 3. الزق الجهاز بمكان معدني مخفي تحت السيارة (خلف المصد أو تحت المقعد). 4. اضبط السياج الجغرافي من التطبيق. 5. شارك الموقع مع أفراد العائلة بضغطة.",
      en: "1. Install the app and register. 2. Insert the SIM. 3. Magnet it to hidden metal under the car (behind the bumper or under a seat). 4. Set your geo-fence in the app. 5. Share location with family in one tap.",
    },
    reviews: [
      { id: "r12", name: "Fadi Nazzal", governorate: { ar: "عمّان", en: "Amman" }, rating: 5, date: "2026-10-08", text: { ar: "التطبيق دقيق والتنبيهات توصل فوراً.", en: "App is accurate, alerts arrive instantly." }, verified: true },
      { id: "r13", name: "Sultan Bani Yassin", governorate: { ar: "المفرق", en: "Mafraq" }, rating: 5, date: "2026-08-29", text: { ar: "البطارية صمدت عندي 3 أسابيع بلمعة.", en: "Battery lasted me 3 weeks flat." }, verified: true },
    ],
    stock: 37,
    soldCount: 612,
    rating: 4.9,
  },
  {
    id: "p7",
    slug: "obd2-scanner",
    title: {
      ar: "قطعة فحص كمبيوتر السيارة OBD2",
      en: "Smart OBD2 Bluetooth Diagnostic Scanner",
    },
    description: {
      ar: "قطعة OBD2 صغيرة تركبها بثقب الفحص وتقرا أكواد عطل المحرك وتمسحها بثواني. عرض حي للسرعة والحرارة وحساسات المحرّك على الجوال، مع تقارير قابلة للمشاركة للميكانيكي. توافق كل السيارات من 2008.",
      en: "A tiny OBD2 plug that reads check-engine codes and clears them in seconds. Live RPM, coolant and sensor telemetry on your phone, with shareable reports for your mechanic. Fits every car from 2008.",
    },
    price: 10.0,
    compareAt: 16.0,
    badge: { ar: "لابد منه", en: "Must Have" },
    category: "gadgets",
    image: IMG("photo-1487754180451-c456f719a1fc"),
    gallery: [
      IMG("photo-1487754180451-c456f719a1fc"),
      IMG("photo-1486262715619-67b85e0b08d3"),
      IMG("photo-1552519507-da3b142c6e3d"),
    ],
    specs: [
      { label: { ar: "التوافق", en: "Compatibility" }, value: { ar: "كل السيارات من 2008+", en: "All cars 2008+" } },
      { label: { ar: "القراءة", en: "Reading" }, value: { ar: "أكواد P0xxx + مسح", en: "P0xxx codes + clearing" } },
      { label: { ar: "البيانات", en: "Live Data" }, value: { ar: "RPM، حرارة، حساسات لحظية", en: "RPM, temp, live sensors" } },
      { label: { ar: "الاتصال", en: "Connectivity" }, value: { ar: "بلوتوث — iOS & Android", en: "Bluetooth — iOS & Android" } },
      { label: { ar: "الحجم", en: "Size" }, value: { ar: "5 سم — يبقى مركّب", en: "5 cm — stays plugged in" } },
    ],
    installation: {
      ar: "1. افتح لوحة القيادة أسفل المقعد اليساري ولقى منفذ الفحص. 2. اركّب القطعة. 3. حمّل التطبيق واقترن بالبلوتوث. 4. اقرأ الأكواد وشوف الوصف. 5. للأخطاء المؤقتة: امسح بعد الإصلاح وشغّل السيارة 3 دورات.",
      en: "1. Open the panel under the steering wheel, find the port. 2. Plug the unit in. 3. Install the app and pair Bluetooth. 4. Read codes and descriptions. 5. For transient faults: clear after repair, run 3 drive cycles.",
    },
    reviews: [
      { id: "r14", name: "Basem Al-Tal", governorate: { ar: "إربد", en: "Irbid" }, rating: 5, date: "2026-09-19", text: { ar: "وحّشت الكود قبل ما أروح للميكانيكي ووفّرت كلام.", en: "Found the code before the mechanic, saved me the talk." }, verified: true },
      { id: "r15", name: "Maya Sandouqa", governorate: { ar: "الزرقاء", en: "Zarqa" }, rating: 5, date: "2026-09-02", text: { ar: "بسيط وبتطبيقه كل شي واضح بالعربي.", en: "Simple and the app shows everything clearly." }, verified: true },
    ],
    stock: 74,
    soldCount: 1890,
    rating: 4.8,
  },
  {
    id: "p8",
    slug: "retractable-4in1-charger",
    title: {
      ar: "شاحن السيارة ذو الكوابل القابلة للسحب 4 في 1",
      en: "Retractable 4-in-1 Fast Car Charger",
    },
    description: {
      ar: "شاحن سيارة بكوابل تنسحب لحالها — Type-C ولايتنينج بطول 80 سم، ورأس يدور 180 درجة ليناسب أي مقبس. شحن سريع 30W وأربعة رؤوس بجهاز واحد، وصفر فوضى أسلاك بالكابينة.",
      en: "A car charger with self-retracting cables — Type-C and Lightning at 80 cm, plus a head that swivels 180° to fit any socket. 30W fast charge, four connectors on one device, zero cable clutter in the cabin.",
    },
    price: 11.0,
    compareAt: 17.0,
    badge: { ar: "ترند جديد", en: "New Trend" },
    category: "interior",
    image: IMG("photo-1583863788434-e58a36330cf0"),
    gallery: [
      IMG("photo-1583863788434-e58a36330cf0"),
      IMG("photo-1558618666-fcd25c85cd64"),
      IMG("photo-1487754180451-c456f719a1fc"),
    ],
    specs: [
      { label: { ar: "الطاقة", en: "Power" }, value: { ar: "30W شحن سريع", en: "30W fast charge" } },
      { label: { ar: "الكوابل", en: "Cables" }, value: { ar: "Type-C + Lightning — 80 سم تنسحب", en: "Type-C + Lightning — 80 cm retractable" } },
      { label: { ar: "الأطراف", en: "Heads" }, value: { ar: "4 رؤوس في جهاز واحد", en: "4 connectors, one device" } },
      { label: { ar: "المفصل", en: "Swivel" }, value: { ar: "180 درجة", en: "180 degrees" } },
      { label: { ar: "الحماية", en: "Safety" }, value: { ar: "حماية من الحرارة والفراغ", en: "Overheat + short protection" } },
    ],
    installation: {
      ar: "1. اركّبه في مقبس الـ12V. 2. اسحب الكيبل لين توصل للجهاز. 3. للتخزين: اترك الكيبل يرجع لحاله — بينسحب تلقائياً. 4. ادور الرأس لين يناسب زاوية المقبس. 5. جرّب الشحن السريع بأي جهاز.",
      en: "1. Plug into the 12V socket. 2. Pull the cable to the device. 3. To store: let it go — it retracts itself. 4. Swivel the head to suit the socket angle. 5. Test fast charge on any device.",
    },
    reviews: [
      { id: "r16", name: "Ibrahim Ghweiri", governorate: { ar: "عمّان", en: "Amman" }, rating: 5, date: "2026-10-15", text: { ar: "انتهت فوضى الأسلاك بالكابينة نهائي.", en: "Cabin cable chaos is over for good." }, verified: true },
      { id: "r17", name: "Rania Safi", governorate: { ar: "السلط", en: "Salt" }, rating: 4, date: "2026-09-24", text: { ar: "شحنت جوالي بسرعة، حبيت الدوران.", en: "Charges my phone fast, love the swivel." }, verified: true },
    ],
    stock: 92,
    soldCount: 1675,
    rating: 4.7,
  },
];

export const BUNDLES: Bundle[] = [
  {
    id: "b2",
    name: { ar: "باقة ثنائية — خصم 15% + توصيل مجاني", en: "Duo Pack — 15% OFF + Free Delivery" },
    minQty: 2,
    discountPct: 15,
    freeDelivery: true,
    color: "#00F5D4",
  },
  {
    id: "b3",
    name: { ar: "باقة ثلاثية — خصم 25%", en: "Trio Pack — 25% OFF" },
    minQty: 3,
    discountPct: 25,
    freeDelivery: true,
    color: "#FF2A54",
  },
];

export const REELS: ReelVideo[] = [
  {
    id: "reel1",
    videoUrl: "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    poster: IMG("photo-1503376780353-7e6692767b70"),
    views: "452K",
    likes: "31.2K",
    title: { ar: "عيون الشيطان على الزجاج", en: "Devil Eyes on the Glass" },
    caption: {
      ar: "كل من شاف السيارة وقف يصور. اللوح يبرمج من الجوال ببلوتوث.",
      en: "Every car that saw us stopped to film. The panel programs from your phone over Bluetooth.",
    },
    productIds: ["p1"],
    hook: {
      ar: "«قفزش؟ هاد اللوح بيشتغل من جوالك…»",
      en: "“You flinched? This panel runs from your phone…”",
    },
  },
  {
    id: "reel2",
    videoUrl: "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
    poster: IMG("photo-1494905998402-395d579af36f"),
    views: "289K",
    likes: "19.8K",
    title: { ar: "نار من الإكزوزست بالليل", en: "Flame Out of the Exhaust at Night" },
    caption: {
      ar: "فرملة = شعلة نار. مثبت عام بدون أي تغيير على العادم.",
      en: "Brake = burst of flame. Universal clamp, exhaust untouched.",
    },
    productIds: ["p4"],
    hook: {
      ar: "«فرملة وحدة بس وشوف…»",
      en: "“One brake press and watch…”",
    },
  },
  {
    id: "reel3",
    videoUrl: "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
    poster: IMG("photo-1552519507-da3b142c6e3d"),
    views: "176K",
    likes: "12.4K",
    title: { ar: "درفت بالصالون", en: "Drift Inside the Living Room" },
    caption: {
      ar: "1:16 بدفع رباعي ودخان من الخلف — علبة هدايا جاهزة.",
      en: "1:16, 4WD, rear smoke — gift-boxed and ready.",
    },
    productIds: ["p2"],
    hook: {
      ar: "«هدية بـ22 دينار بتعطش فيهم…»",
      en: "“A 22 dinar gift that out-dances them…”",
    },
  },
  {
    id: "reel4",
    videoUrl: "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4",
    poster: IMG("photo-1506521781263-d8422e82f27a"),
    views: "134K",
    likes: "9.1K",
    title: { ar: "فرق 20 درجة بمظلة وحدة", en: "20 Degrees Cooler, One Umbrella" },
    caption: {
      ar: "حر عمّان الجحيم — والمظلة هالأسبوع بـ9 دينار.",
      en: "Amman's hell heat — the umbrella is 9 dinar this week.",
    },
    productIds: ["p3"],
    hook: {
      ar: "«دخل السيارة بعد ساعتين بالشمس…»",
      en: "“Car sat in the sun two hours — feel it now…”",
    },
  },
  {
    id: "reel5",
    videoUrl: "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4",
    poster: IMG("photo-1550751827-4bd374c3f58b"),
    views: "98K",
    likes: "7.3K",
    title: { ar: "زر جهاز التتبع تحت السيارة", en: "One Magnet, Tracker Under the Car" },
    caption: {
      ar: "مغناطيس قوي وتتبع لحظي من الجوال. حماية سيارتك بثانية.",
      en: "Strong magnet, live phone tracking. Guard your car in a second.",
    },
    productIds: ["p6"],
    hook: {
      ar: "«ركبها تحت السيارة وما عاد خفت…»",
      en: "“Clipped it under the car and stopped worrying…”",
    },
  },
];

export const GOVERNORATES: {
  id: string;
  label: Localized;
  deliveryFee: number;
}[] = [
  { id: "amman", label: { ar: "عمّان", en: "Amman" }, deliveryFee: 2.0 },
  { id: "zarqa", label: { ar: "الزرقاء", en: "Zarqa" }, deliveryFee: 3.0 },
  { id: "irbid", label: { ar: "إربد", en: "Irbid" }, deliveryFee: 3.0 },
  { id: "salt", label: { ar: "السلط", en: "Salt" }, deliveryFee: 3.0 },
  { id: "aqaba", label: { ar: "العقبة", en: "Aqaba" }, deliveryFee: 3.0 },
];

export const FREE_DELIVERY_THRESHOLD = 25.0;
export const WHATSAPP_NUMBER = "";
export const BRAND = {
  name: "GearTech",
  handle: "@geartechjo",
  city: { ar: "عمّان، الأردن", en: "Amman, Jordan" },
};

export const getProductBySlug = (slug: string): Product | undefined =>
  PRODUCTS.find((p) => p.slug === slug);

export const formatJOD = (amount: number): string =>
  `${amount.toFixed(2)} د.أ`;

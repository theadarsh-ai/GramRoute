import { createContext, useContext, useState, useCallback, type ReactNode } from "react";

export type Language = "en" | "hi" | "ta" | "te";

export const languageNames: Record<Language, string> = {
  en: "English",
  hi: "हिन्दी",
  ta: "தமிழ்",
  te: "తెలుగు",
};

type Translations = typeof en;

const en = {
  hero: {
    badge: "AI-Powered Mandi Route Optimizer",
    title: "GramRoute",
    subtitle: "Maximize your farming profits with smart mandi route recommendations. We consider transport costs, spoilage, market fees, and real-time prices.",
    chip50Mandis: "50+ Mandis",
    chipProfitOptimizer: "Profit Optimizer",
    chipRoutePlanner: "Route Planner",
    chipSpoilageAware: "Spoilage Aware",
  },
  form: {
    title: "Find Best Mandi Routes",
    startLocation: "Starting Location",
    startLocationPlaceholder: "Search city or village name...",
    cropType: "Crop Type",
    selectCrop: "Select crop",
    quantity: "Quantity",
    quintals: "quintals",
    maxDistance: "Max Travel Distance",
    km: "km",
    fuelCost: "Fuel Cost (Rs/km)",
    latitude: "Latitude",
    longitude: "Longitude",
    findRoutes: "Find Best Routes",
    findingRoutes: "Finding Best Routes...",
    searching: "Searching...",
    noResults: "No locations found",
    popularCities: "Popular Cities",
    locationSet: "Location set",
    typeToSearch: "Type a city or village name and select from suggestions",
  },
  results: {
    analyzingRoutes: "Analyzing Routes...",
    analyzingSubtitle: "Calculating distances, costs, and spoilage for nearby mandis",
    couldNotFind: "Could not find routes",
    tryAgain: "Try Again",
    noRoutesFound: "No routes found",
    noRoutesDesc: "No mandis found within your specified distance for this crop. Try increasing the maximum travel distance or changing the crop type.",
    adjustSearch: "Adjust Search",
    topRoutes: "Top {count} Routes for {crop}",
    mandisFound: "{count} mandis found nearby",
    newSearch: "New Search",
    routes: "Routes",
    map: "Map",
    bestNetProfit: "Best Net Profit",
    bestRouteDistance: "Best Route Distance",
    stops: "Stops",
    mandi: "mandi",
    mandis: "mandis",
    profitPerQuintal: "Profit/Quintal",
  },
  card: {
    netProfit: "net profit",
    profitEfficiency: "Profit efficiency",
    revenue: "Revenue",
    fuel: "Fuel",
    marketFees: "Market Fees",
    spoilage: "Spoilage",
    hideDetails: "Hide details",
    showDetails: "Show details",
    tipsForYou: "Tips for you",
    stopDetails: "Stop Details",
    kmAway: "{dist} km away",
    sell: "Sell {qty} qtl",
    revenueLabel: "Revenue Rs {amount}",
    marketFeeLabel: "Market fee: Rs {amount}",
    spoilageLabel: "Spoilage: {qty} qtl lost",
    qtl: "/qtl",
  },
  crops: {
    tomato: "Tomato",
    onion: "Onion",
    potato: "Potato",
    cauliflower: "Cauliflower",
    cabbage: "Cabbage",
    brinjal: "Brinjal",
    green_chilli: "Green Chilli",
    lady_finger: "Lady Finger",
    carrot: "Carrot",
    drumstick: "Drumstick",
  },
};

const hi: Translations = {
  hero: {
    badge: "AI-संचालित मंडी मार्ग अनुकूलक",
    title: "GramRoute",
    subtitle: "स्मार्ट मंडी मार्ग सुझावों के साथ अपने खेती के मुनाफे को अधिकतम करें। हम परिवहन लागत, खराबी, बाजार शुल्क और वर्तमान कीमतों पर विचार करते हैं।",
    chip50Mandis: "50+ मंडियाँ",
    chipProfitOptimizer: "मुनाफा अनुकूलक",
    chipRoutePlanner: "मार्ग योजनाकार",
    chipSpoilageAware: "खराबी जागरूक",
  },
  form: {
    title: "सर्वश्रेष्ठ मंडी मार्ग खोजें",
    startLocation: "शुरुआती स्थान",
    startLocationPlaceholder: "शहर या गाँव का नाम खोजें...",
    cropType: "फसल का प्रकार",
    selectCrop: "फसल चुनें",
    quantity: "मात्रा",
    quintals: "क्विंटल",
    maxDistance: "अधिकतम यात्रा दूरी",
    km: "किमी",
    fuelCost: "ईंधन लागत (रु/किमी)",
    latitude: "अक्षांश",
    longitude: "देशांतर",
    findRoutes: "सर्वश्रेष्ठ मार्ग खोजें",
    findingRoutes: "सर्वश्रेष्ठ मार्ग खोज रहे हैं...",
    searching: "खोज रहे हैं...",
    noResults: "कोई स्थान नहीं मिला",
    popularCities: "लोकप्रिय शहर",
    locationSet: "स्थान सेट",
    typeToSearch: "शहर या गाँव का नाम लिखें और सुझावों में से चुनें",
  },
  results: {
    analyzingRoutes: "मार्गों का विश्लेषण...",
    analyzingSubtitle: "नजदीकी मंडियों के लिए दूरी, लागत और खराबी की गणना",
    couldNotFind: "मार्ग नहीं मिल सके",
    tryAgain: "पुनः प्रयास करें",
    noRoutesFound: "कोई मार्ग नहीं मिला",
    noRoutesDesc: "इस फसल के लिए आपकी निर्दिष्ट दूरी में कोई मंडी नहीं मिली। अधिकतम यात्रा दूरी बढ़ाने या फसल बदलने का प्रयास करें।",
    adjustSearch: "खोज समायोजित करें",
    topRoutes: "{crop} के लिए शीर्ष {count} मार्ग",
    mandisFound: "पास में {count} मंडियाँ मिलीं",
    newSearch: "नई खोज",
    routes: "मार्ग",
    map: "नक्शा",
    bestNetProfit: "सर्वश्रेष्ठ शुद्ध लाभ",
    bestRouteDistance: "सर्वश्रेष्ठ मार्ग दूरी",
    stops: "ठहराव",
    mandi: "मंडी",
    mandis: "मंडियाँ",
    profitPerQuintal: "लाभ/क्विंटल",
  },
  card: {
    netProfit: "शुद्ध लाभ",
    profitEfficiency: "लाभ दक्षता",
    revenue: "राजस्व",
    fuel: "ईंधन",
    marketFees: "बाजार शुल्क",
    spoilage: "खराबी",
    hideDetails: "विवरण छुपाएँ",
    showDetails: "विवरण दिखाएँ",
    tipsForYou: "आपके लिए सुझाव",
    stopDetails: "ठहराव विवरण",
    kmAway: "{dist} किमी दूर",
    sell: "{qty} क्विंटल बेचें",
    revenueLabel: "राजस्व रु {amount}",
    marketFeeLabel: "बाजार शुल्क: रु {amount}",
    spoilageLabel: "खराबी: {qty} क्विंटल नुकसान",
    qtl: "/क्विंटल",
  },
  crops: {
    tomato: "टमाटर",
    onion: "प्याज",
    potato: "आलू",
    cauliflower: "फूलगोभी",
    cabbage: "पत्तागोभी",
    brinjal: "बैंगन",
    green_chilli: "हरी मिर्च",
    lady_finger: "भिंडी",
    carrot: "गाजर",
    drumstick: "सहजन",
  },
};

const ta: Translations = {
  hero: {
    badge: "AI-இயங்கும் மண்டி வழி மேம்படுத்தி",
    title: "GramRoute",
    subtitle: "புத்திசாலி மண்டி வழிப் பரிந்துரைகளுடன் உங்கள் விவசாய லாபத்தை அதிகரிக்கவும். போக்குவரத்து செலவு, கெடுதல், சந்தை கட்டணம் மற்றும் தற்போதைய விலைகளை நாங்கள் கருத்தில் கொள்கிறோம்.",
    chip50Mandis: "50+ மண்டிகள்",
    chipProfitOptimizer: "லாப மேம்படுத்தி",
    chipRoutePlanner: "வழி திட்டமிடல்",
    chipSpoilageAware: "கெடுதல் விழிப்புணர்வு",
  },
  form: {
    title: "சிறந்த மண்டி வழிகளைக் கண்டறியுங்கள்",
    startLocation: "தொடக்க இடம்",
    startLocationPlaceholder: "நகரம் அல்லது கிராமத்தின் பெயரைத் தேடுங்கள்...",
    cropType: "பயிர் வகை",
    selectCrop: "பயிரைத் தேர்ந்தெடுக்கவும்",
    quantity: "அளவு",
    quintals: "குவிண்டால்",
    maxDistance: "அதிகபட்ச பயண தூரம்",
    km: "கிமீ",
    fuelCost: "எரிபொருள் செலவு (ரூ/கிமீ)",
    latitude: "அட்சரேகை",
    longitude: "தீர்க்கரேகை",
    findRoutes: "சிறந்த வழிகளைக் கண்டறியுங்கள்",
    findingRoutes: "சிறந்த வழிகளைக் கண்டுபிடிக்கிறது...",
    searching: "தேடுகிறது...",
    noResults: "இடங்கள் கிடைக்கவில்லை",
    popularCities: "பிரபலமான நகரங்கள்",
    locationSet: "இடம் அமைக்கப்பட்டது",
    typeToSearch: "நகரம் அல்லது கிராமத்தின் பெயரை எழுதி பரிந்துரைகளிலிருந்து தேர்ந்தெடுக்கவும்",
  },
  results: {
    analyzingRoutes: "வழிகளை பகுப்பாய்வு செய்கிறது...",
    analyzingSubtitle: "அருகிலுள்ள மண்டிகளுக்கான தூரம், செலவு மற்றும் கெடுதல் கணக்கிடுகிறது",
    couldNotFind: "வழிகளைக் கண்டறிய முடியவில்லை",
    tryAgain: "மீண்டும் முயற்சிக்கவும்",
    noRoutesFound: "வழிகள் இல்லை",
    noRoutesDesc: "இந்த பயிருக்கு உங்கள் குறிப்பிட்ட தூரத்தில் மண்டிகள் இல்லை. அதிகபட்ச பயண தூரத்தை அதிகரிக்கவும் அல்லது பயிர் வகையை மாற்றவும்.",
    adjustSearch: "தேடலை சரிசெய்யவும்",
    topRoutes: "{crop} க்கான சிறந்த {count} வழிகள்",
    mandisFound: "அருகில் {count} மண்டிகள் கண்டறியப்பட்டன",
    newSearch: "புதிய தேடல்",
    routes: "வழிகள்",
    map: "வரைபடம்",
    bestNetProfit: "சிறந்த நிகர லாபம்",
    bestRouteDistance: "சிறந்த வழி தூரம்",
    stops: "நிறுத்தங்கள்",
    mandi: "மண்டி",
    mandis: "மண்டிகள்",
    profitPerQuintal: "லாபம்/குவிண்டால்",
  },
  card: {
    netProfit: "நிகர லாபம்",
    profitEfficiency: "லாப திறன்",
    revenue: "வருவாய்",
    fuel: "எரிபொருள்",
    marketFees: "சந்தை கட்டணம்",
    spoilage: "கெடுதல்",
    hideDetails: "விவரங்களை மறை",
    showDetails: "விவரங்களைக் காட்டு",
    tipsForYou: "உங்களுக்கான குறிப்புகள்",
    stopDetails: "நிறுத்த விவரங்கள்",
    kmAway: "{dist} கிமீ தொலைவில்",
    sell: "{qty} குவிண்டால் விற்கவும்",
    revenueLabel: "வருவாய் ரூ {amount}",
    marketFeeLabel: "சந்தை கட்டணம்: ரூ {amount}",
    spoilageLabel: "கெடுதல்: {qty} குவிண்டால் இழப்பு",
    qtl: "/குவிண்டால்",
  },
  crops: {
    tomato: "தக்காளி",
    onion: "வெங்காயம்",
    potato: "உருளைக்கிழங்கு",
    cauliflower: "காலிஃபிளவர்",
    cabbage: "முட்டைகோஸ்",
    brinjal: "கத்தரிக்காய்",
    green_chilli: "பச்சை மிளகாய்",
    lady_finger: "வெண்டைக்காய்",
    carrot: "கேரட்",
    drumstick: "முருங்கைக்காய்",
  },
};

const te: Translations = {
  hero: {
    badge: "AI-ఆధారిత మండి మార్గం ఆప్టిమైజర్",
    title: "GramRoute",
    subtitle: "తెలివైన మండి మార్గ సూచనలతో మీ వ్యవసాయ లాభాలను గరిష్టం చేయండి. మేము రవాణా ఖర్చులు, పాడవడం, మార్కెట్ ఫీజులు మరియు ప్రస్తుత ధరలను పరిగణిస్తాము.",
    chip50Mandis: "50+ మండీలు",
    chipProfitOptimizer: "లాభం ఆప్టిమైజర్",
    chipRoutePlanner: "మార్గ ప్రణాళిక",
    chipSpoilageAware: "పాడవడం అవగాహన",
  },
  form: {
    title: "ఉత్తమ మండి మార్గాలను కనుగొనండి",
    startLocation: "ప్రారంభ స్థానం",
    startLocationPlaceholder: "నగరం లేదా గ్రామం పేరు వెతకండి...",
    cropType: "పంట రకం",
    selectCrop: "పంటను ఎంచుకోండి",
    quantity: "పరిమాణం",
    quintals: "క్వింటాల్స్",
    maxDistance: "గరిష్ట ప్రయాణ దూరం",
    km: "కిమీ",
    fuelCost: "ఇంధన ఖర్చు (రూ/కిమీ)",
    latitude: "అక్షాంశం",
    longitude: "రేఖాంశం",
    findRoutes: "ఉత్తమ మార్గాలను కనుగొనండి",
    findingRoutes: "ఉత్తమ మార్గాలను కనుగొంటోంది...",
    searching: "వెతుకుతోంది...",
    noResults: "ప్రదేశాలు కనుగొనబడలేదు",
    popularCities: "ప్రముఖ నగరాలు",
    locationSet: "ప్రదేశం సెట్ చేయబడింది",
    typeToSearch: "నగరం లేదా గ్రామం పేరు టైప్ చేసి సూచనల నుండి ఎంచుకోండి",
  },
  results: {
    analyzingRoutes: "మార్గాలను విశ్లేషిస్తోంది...",
    analyzingSubtitle: "సమీపంలోని మండీలకు దూరం, ఖర్చులు మరియు పాడవడం లెక్కిస్తోంది",
    couldNotFind: "మార్గాలు కనుగొనలేకపోయాము",
    tryAgain: "మళ్ళీ ప్రయత్నించండి",
    noRoutesFound: "మార్గాలు కనుగొనబడలేదు",
    noRoutesDesc: "ఈ పంటకు మీ పేర్కొన్న దూరంలో మండీలు కనుగొనబడలేదు. గరిష్ట ప్రయాణ దూరాన్ని పెంచడం లేదా పంట రకాన్ని మార్చడం ప్రయత్నించండి.",
    adjustSearch: "శోధనను సర్దుబాటు చేయండి",
    topRoutes: "{crop} కోసం టాప్ {count} మార్గాలు",
    mandisFound: "సమీపంలో {count} మండీలు కనుగొనబడ్డాయి",
    newSearch: "కొత్త శోధన",
    routes: "మార్గాలు",
    map: "మ్యాప్",
    bestNetProfit: "ఉత్తమ నికర లాభం",
    bestRouteDistance: "ఉత్తమ మార్గ దూరం",
    stops: "ఆగే చోట్లు",
    mandi: "మండి",
    mandis: "మండీలు",
    profitPerQuintal: "లాభం/క్వింటాల్",
  },
  card: {
    netProfit: "నికర లాభం",
    profitEfficiency: "లాభ సామర్థ్యం",
    revenue: "ఆదాయం",
    fuel: "ఇంధనం",
    marketFees: "మార్కెట్ ఫీజులు",
    spoilage: "పాడవడం",
    hideDetails: "వివరాలు దాచు",
    showDetails: "వివరాలు చూపు",
    tipsForYou: "మీ కోసం చిట్కాలు",
    stopDetails: "ఆగే స్థలం వివరాలు",
    kmAway: "{dist} కిమీ దూరంలో",
    sell: "{qty} క్వింటాల్స్ అమ్మండి",
    revenueLabel: "ఆదాయం రూ {amount}",
    marketFeeLabel: "మార్కెట్ ఫీజు: రూ {amount}",
    spoilageLabel: "పాడవడం: {qty} క్వింటాల్స్ నష్టం",
    qtl: "/క్వింటాల్",
  },
  crops: {
    tomato: "టమాటా",
    onion: "ఉల్లిపాయ",
    potato: "బంగాళాదుంప",
    cauliflower: "కాలీఫ్లవర్",
    cabbage: "క్యాబేజీ",
    brinjal: "వంకాయ",
    green_chilli: "పచ్చి మిరపకాయ",
    lady_finger: "బెండకాయ",
    carrot: "క్యారెట్",
    drumstick: "మునగకాయ",
  },
};

const translations: Record<Language, Translations> = { en, hi, ta, te };

interface I18nContextValue {
  lang: Language;
  setLang: (lang: Language) => void;
  t: Translations;
}

const I18nContext = createContext<I18nContextValue>({
  lang: "en",
  setLang: () => {},
  t: en,
});

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Language>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("gramroute-lang");
      if (saved && saved in translations) return saved as Language;
    }
    return "en";
  });

  const setLang = useCallback((newLang: Language) => {
    setLangState(newLang);
    localStorage.setItem("gramroute-lang", newLang);
  }, []);

  return (
    <I18nContext.Provider value={{ lang, setLang, t: translations[lang] }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  return useContext(I18nContext);
}

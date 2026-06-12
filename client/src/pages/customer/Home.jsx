import { useState, useEffect, createContext, useContext } from 'react';
import { Link } from 'react-router-dom';

const LanguageContext = createContext();

const translations = {
  en: {
    nav: { home: 'Home', calc: 'Calculator', services: 'Services', docs: 'Documents', contact: 'Contact', admin: 'Admin', apply: 'Apply Loan' },
    hero: {
      badge: 'Trusted Gold Loan Provider — Nagai',
      title1: 'AS NAGAI',
      title2: 'ADAGU KADAI',
      subtitle: 'Get instant gold loans at the best rates. Safe storage, quick approval, and transparent process — trusted by thousands in Nagai.',
      f1: '⚡ Instant Approval', f2: '🔒 Safe Gold Storage', f3: '💰 Best Interest Rates', f4: '📋 Quick Process',
      btnApply: 'Apply for Loan →', btnCalc: 'Calculate Interest',
      stat1: 'Happy Customers', stat2: 'Experience', stat3: 'Secure'
    },
    interest: {
      title: 'Gold Loan', titleGold: 'Interest Rates',
      subtitle: 'Transparent and competitive rates for all loan amounts',
      tier1: 'Loan Below', tier1Amt: '₹10,000', tier1Rate: '3%', perMonth: 'per month', tier1Desc: '₹3 interest per ₹100 per month',
      tier2: 'Loan ₹10,000 & Above', tier2Amt: '₹10,000+', tier2Rate: '2%', tier2Desc: '₹2 interest per ₹100 per month',
      popular: 'POPULAR'
    },
    calc: {
      title: 'Loan', titleGold: 'Calculator',
      subtitle: 'Instantly calculate your interest and total payable amount',
      amount: 'Loan Amount (₹)', duration: 'Duration (Months)', btnCalc: 'Calculate Interest',
      resRate: 'Interest Rate', resMonthly: 'Monthly Interest', resTotal: 'Total Interest', resPayable: 'Total Payable'
    },
    services: {
      title: 'Our', titleGold: 'Services', subtitle: 'Comprehensive gold loan services tailored for you',
      s1: 'Gold Loan', s1d: 'Get instant loans against your gold jewellery at competitive rates.',
      s2: 'Gold Valuation', s2d: 'Accurate valuation of your gold by experienced professionals.',
      s3: 'Loan Renewal', s3d: 'Easily renew your existing loan with flexible terms.',
      s4: 'Interest Payment', s4d: 'Convenient interest payment options — pay monthly or at closure.',
      s5: 'Gold Release', s5d: 'Quick and hassle-free release of your gold on loan closure.'
    },
    docs: {
      title: 'Documents', titleGold: 'Required', subtitle: 'Minimal documentation for quick loan approval',
      d1: 'Aadhaar Card', d1d: 'Government ID proof',
      d2: 'PAN Card', d2d: 'For KYC verification',
      d3: 'Mobile Number', d3d: 'For OTP & notifications',
      d4: 'Address Proof', d4d: 'Any valid address document'
    },
    contact: {
      title: 'Get In', titleGold: 'Touch', subtitle: 'Contact us today and get your gold loan approved within minutes.',
      l1: 'Location', l1v: 'Nagai, Tamil Nadu',
      l2: 'Working Hours', l2v: 'Mon–Sat: 9 AM – 6 PM',
      l3: 'Quick Approval', l3v: 'Within 30 minutes',
      formTitle: 'Send us a Message',
      fName: 'Your Name', fNameP: 'Enter your full name',
      fMobile: 'Mobile Number', fMobileP: '10-digit mobile number',
      fMsg: 'Message', fMsgP: 'How can we help you?',
      btnSend: 'Send Message →', btnSending: 'Sending...', btnAnother: 'Send Another',
      success: 'Message Sent!', successDesc: "We'll contact you within 24 hours.", err: 'Something went wrong. Please try again.'
    },
    footer: {
      rights: '© {year} AS Nagai Adagu Kadai. All rights reserved.',
      desc: 'Nagai, Tamil Nadu • Trusted Gold Loans'
    }
  },
  ta: {
    nav: { home: 'முகப்பு', calc: 'கால்குலேட்டர்', services: 'சேவைகள்', docs: 'ஆவணங்கள்', contact: 'தொடர்பு', admin: 'நிர்வாகம்', apply: 'கடன் பெற' },
    hero: {
      badge: 'நம்பகமான நகைக்கடன் நிறுவனம் — நாகை',
      title1: 'ஏ.எஸ் நகை',
      title2: 'அடகு கடை',
      subtitle: 'குறைந்த வட்டியில் உடனடி நகைக்கடன். பாதுகாப்பான சேமிப்பு, விரைவான அனுமதி மற்றும் வெளிப்படையான செயல்முறை — நாகையில் ஆயிரக்கணக்கானோரால் நம்பப்படுகிறது.',
      f1: '⚡ உடனடி அனுமதி', f2: '🔒 பாதுகாப்பான சேமிப்பு', f3: '💰 குறைந்த வட்டி', f4: '📋 விரைவான செயல்முறை',
      btnApply: 'கடன் விண்ணப்பிக்க →', btnCalc: 'வட்டி கணக்கிட',
      stat1: 'வாடிக்கையாளர்கள்', stat2: 'வருட அனுபவம்', stat3: 'பாதுகாப்பானது'
    },
    interest: {
      title: 'நகைக்கடன்', titleGold: 'வட்டி விகிதங்கள்',
      subtitle: 'அனைத்து கடன் தொகைகளுக்கும் வெளிப்படையான மற்றும் சிறந்த வட்டி விகிதங்கள்',
      tier1: 'கடன்', tier1Amt: '₹10,000-க்கு கீழ்', tier1Rate: '3%', perMonth: 'மாதம்', tier1Desc: '₹100-க்கு மாதம் ₹3 வட்டி',
      tier2: 'கடன்', tier2Amt: '₹10,000 & அதற்கு மேல்', tier2Rate: '2%', tier2Desc: '₹100-க்கு மாதம் ₹2 வட்டி',
      popular: 'சிறந்தது'
    },
    calc: {
      title: 'நகைக்கடன்', titleGold: 'கால்குலேட்டர்',
      subtitle: 'உங்கள் வட்டி மற்றும் மொத்த தொகையை உடனடியாக கணக்கிடுங்கள்',
      amount: 'கடன் தொகை (₹)', duration: 'கால அளவு (மாதங்கள்)', btnCalc: 'வட்டியை கணக்கிடு',
      resRate: 'வட்டி விகிதம்', resMonthly: 'மாத வட்டி', resTotal: 'மொத்த வட்டி', resPayable: 'மொத்த தொகை'
    },
    services: {
      title: 'எங்கள்', titleGold: 'சேவைகள்', subtitle: 'உங்களுக்காக பிரத்யேகமாக வடிவமைக்கப்பட்ட நகைக்கடன் சேவைகள்',
      s1: 'நகைக்கடன்', s1d: 'உங்கள் தங்க நகைகளுக்கு குறைந்த வட்டியில் உடனடி கடன் பெறுங்கள்.',
      s2: 'நகை மதிப்பீடு', s2d: 'அனுபவம் வாய்ந்த நிபுணர்களால் உங்கள் நகைகளின் துல்லியமான மதிப்பீடு.',
      s3: 'கடன் புதுப்பித்தல்', s3d: 'நெகிழ்வான விதிமுறைகளுடன் உங்கள் தற்போதைய கடனை எளிதாகப் புதுப்பிக்கவும்.',
      s4: 'வட்டி செலுத்துதல்', s4d: 'வசதியான வட்டி செலுத்தும் முறைகள் — மாதந்தோறும் அல்லது முடிவில் செலுத்தலாம்.',
      s5: 'நகை மீட்பு', s5d: 'கடன் முடிந்தவுடன் விரைவாகவும் எளிதாகவும் நகையை மீட்கலாம்.'
    },
    docs: {
      title: 'தேவையான', titleGold: 'ஆவணங்கள்', subtitle: 'விரைவான கடன் அனுமதிக்கு குறைந்தபட்ச ஆவணங்கள்',
      d1: 'ஆதார் அட்டை', d1d: 'அரசு அடையாள அட்டை',
      d2: 'பான் அட்டை', d2d: 'KYC சரிபார்ப்புக்கு',
      d3: 'மொபைல் எண்', d3d: 'OTP மற்றும் அறிவிப்புகளுக்கு',
      d4: 'முகவரி சான்றிதழ்', d4d: 'ஏதேனும் முகவரி சான்றிதழ்'
    },
    contact: {
      title: 'எங்களை', titleGold: 'தொடர்பு கொள்ள', subtitle: 'இன்றே எங்களை தொடர்பு கொண்டு சில நிமிடங்களில் உங்கள் நகைக்கடனை பெறுங்கள்.',
      l1: 'இடம்', l1v: 'நாகை, தமிழ்நாடு',
      l2: 'வேலை நேரம்', l2v: 'திங்கள்–சனி: காலை 9 – மாலை 6',
      l3: 'விரைவான அனுமதி', l3v: '30 நிமிடங்களுக்குள்',
      formTitle: 'எங்களுக்கு செய்தி அனுப்பவும்',
      fName: 'உங்கள் பெயர்', fNameP: 'உங்கள் முழு பெயர்',
      fMobile: 'மொபைல் எண்', fMobileP: '10 இலக்க மொபைல் எண்',
      fMsg: 'செய்தி', fMsgP: 'நாங்கள் உங்களுக்கு எவ்வாறு உதவ முடியும்?',
      btnSend: 'செய்தி அனுப்பவும் →', btnSending: 'அனுப்பப்படுகிறது...', btnAnother: 'மேலும் அனுப்பவும்',
      success: 'செய்தி அனுப்பப்பட்டது!', successDesc: "24 மணி நேரத்திற்குள் உங்களை தொடர்புகொள்வோம்.", err: 'ஏதோ தவறு நடந்துவிட்டது. மீண்டும் முயற்சிக்கவும்.'
    },
    footer: {
      rights: '© {year} ஏ.எஸ் நகை அடகு கடை. அனைத்து உரிமைகளும் பாதுகாக்கப்பட்டவை.',
      desc: 'நாகை, தமிழ்நாடு • நம்பகமான நகைக்கடன்'
    }
  }
};

const NAV_LINKS = [
  { id: 'home', key: 'home' },
  { id: 'calculator-info', key: 'calc' },
  { id: 'services', key: 'services' },
  { id: 'documents', key: 'docs' },
  { id: 'contact', key: 'contact' }
];

function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { lang, setLang, t } = useContext(LanguageContext);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-dark-900/95 backdrop-blur-md shadow-lg shadow-black/20 py-2' : 'bg-transparent py-4'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-12">
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="AS Gold Loan Logo" className="h-10 sm:h-12 object-contain" />
          </div>
          <div className="hidden lg:flex items-center gap-6">
            {NAV_LINKS.map(link => (
              <a key={link.id} href={`#${link.id}`}
                className="text-dark-300 hover:text-gold-400 text-sm font-medium transition-colors duration-200">
                {t('nav')[link.key]}
              </a>
            ))}
          </div>
          <div className="hidden lg:flex items-center gap-4">
            <button 
              onClick={() => setLang(lang === 'en' ? 'ta' : 'en')}
              className="text-dark-300 hover:text-white text-sm font-medium px-3 py-1.5 border border-dark-600 rounded-lg hover:border-gold-500 transition-colors"
            >
              {lang === 'en' ? 'தமிழ்' : 'English'}
            </button>
            <Link to="/admin/login" className="text-dark-400 hover:text-gold-400 text-sm transition-colors">{t('nav').admin}</Link>
            <a href="#contact" className="btn-gold text-sm py-2 px-4">{t('nav').apply}</a>
          </div>
          <div className="lg:hidden flex items-center gap-3">
            <button 
              onClick={() => setLang(lang === 'en' ? 'ta' : 'en')}
              className="text-dark-300 hover:text-white text-xs font-medium px-2 py-1 border border-dark-600 rounded flex-shrink-0"
            >
              {lang === 'en' ? 'தமிழ்' : 'EN'}
            </button>
            <button onClick={() => setMenuOpen(!menuOpen)} className="text-white p-2">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {menuOpen ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />}
              </svg>
            </button>
          </div>
        </div>
        {menuOpen && (
          <div className="lg:hidden bg-dark-800 rounded-xl mt-4 p-4 space-y-3">
            {NAV_LINKS.map(link => (
              <a key={link.id} href={`#${link.id}`} onClick={() => setMenuOpen(false)}
                className="block text-dark-200 hover:text-gold-400 py-1 font-medium">{t('nav')[link.key]}</a>
            ))}
            <div className="pt-2 border-t border-dark-700">
              <Link to="/admin/login" className="block text-dark-400 hover:text-gold-400 py-1">{t('nav').admin}</Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

function Hero() {
  const { t } = useContext(LanguageContext);
  return (
    <section id="home" className="relative min-h-screen flex items-center overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-dark-950 via-dark-900 to-dark-800" />
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-72 h-72 bg-gold-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-gold-600/8 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gold-500/5 rounded-full blur-3xl" />
      </div>

      <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-10">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="absolute gold-gradient"
            style={{ top: `${i * 14}%`, right: `${(i % 3) * 8}%`, width: '40px', height: '160px', borderRadius: '4px', transform: `rotate(${i * 5}deg)`, opacity: 0.5 + i * 0.05 }} />
        ))}
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32">
        <div className="max-w-3xl pt-10">
          <div className="inline-flex items-center gap-2 bg-gold-500/10 border border-gold-500/30 rounded-full px-4 py-2 mb-8">
            <div className="w-2 h-2 bg-gold-400 rounded-full animate-pulse" />
            <span className="text-gold-400 text-sm font-medium">{t('hero').badge}</span>
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black text-white leading-tight mb-4 tracking-tight">
            <span className="gold-text">{t('hero').title1}</span><br />
            <span className="text-white">{t('hero').title2}</span>
          </h1>
          <p className="text-dark-300 text-lg sm:text-xl mb-10 max-w-xl leading-relaxed">
            {t('hero').subtitle}
          </p>

          <div className="flex flex-wrap gap-3 mb-10">
            {[t('hero').f1, t('hero').f2, t('hero').f3, t('hero').f4].map(f => (
              <span key={f} className="bg-dark-700/80 border border-dark-600 text-dark-200 text-sm px-4 py-2 rounded-full">{f}</span>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <a href="#contact" className="btn-gold text-base text-center">{t('hero').btnApply}</a>
            <a href="#calculator" className="btn-outline text-base text-center">{t('hero').btnCalc}</a>
          </div>
        </div>

        <div className="mt-20 grid grid-cols-3 gap-6 max-w-xl">
          {[['1000+', t('hero').stat1], ['10+', t('hero').stat2], ['100%', t('hero').stat3]].map(([val, label]) => (
            <div key={label} className="text-center">
              <div className="text-3xl font-bold gold-text">{val}</div>
              <div className="text-dark-400 text-sm mt-1">{label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function InterestSection() {
  const { t } = useContext(LanguageContext);
  return (
    <section id="calculator-info" className="py-20 bg-dark-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <h2 className="text-4xl font-bold text-white mb-3">{t('interest').title} <span className="gold-text">{t('interest').titleGold}</span></h2>
          <p className="text-dark-400">{t('interest').subtitle}</p>
        </div>
        <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
          <div className="relative card overflow-hidden group hover:border-gold-500/50 transition-colors duration-300">
            <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/10 rounded-full -translate-y-8 translate-x-8" />
            <div className="text-5xl mb-4">💛</div>
            <div className="text-dark-400 text-sm font-medium uppercase tracking-wider mb-2">{t('interest').tier1}</div>
            <div className="text-3xl font-bold text-white mb-1">{t('interest').tier1Amt}</div>
            <div className="text-6xl font-black gold-text my-4">{t('interest').tier1Rate}</div>
            <div className="text-dark-300">{t('interest').perMonth}</div>
            <div className="mt-4 p-3 bg-dark-700 rounded-xl text-sm text-dark-300">
              {t('interest').tier1Desc}
            </div>
          </div>
          <div className="relative card overflow-hidden group hover:border-gold-500/50 transition-colors duration-300 border-gold-500/30">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gold-500/10 rounded-full -translate-y-8 translate-x-8" />
            <div className="absolute top-4 right-4 bg-gold-500 text-dark-900 text-xs font-bold px-3 py-1 rounded-full">{t('interest').popular}</div>
            <div className="text-5xl mb-4">🏆</div>
            <div className="text-dark-400 text-sm font-medium uppercase tracking-wider mb-2">{t('interest').tier2}</div>
            <div className="text-3xl font-bold text-white mb-1">{t('interest').tier2Amt}</div>
            <div className="text-6xl font-black gold-text my-4">{t('interest').tier2Rate}</div>
            <div className="text-dark-300">{t('interest').perMonth}</div>
            <div className="mt-4 p-3 bg-dark-700 rounded-xl text-sm text-dark-300">
              {t('interest').tier2Desc}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Calculator() {
  const { t } = useContext(LanguageContext);
  const [loanAmount, setLoanAmount] = useState('');
  const [months, setMonths] = useState('');
  const [result, setResult] = useState(null);

  const calculate = () => {
    const amount = parseFloat(loanAmount);
    const duration = parseInt(months);
    if (!amount || !duration || amount <= 0 || duration <= 0) return;

    const rate = amount < 10000 ? 3 : 2;
    const monthlyInterest = (amount * rate) / 100;
    const totalInterest = monthlyInterest * duration;
    const totalPayable = amount + totalInterest;

    setResult({ rate, monthlyInterest, totalInterest, totalPayable });
  };

  const fmt = (n) => n.toLocaleString('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 });

  return (
    <section id="calculator" className="py-20 bg-dark-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <h2 className="text-4xl font-bold text-white mb-3">{t('calc').title} <span className="gold-text">{t('calc').titleGold}</span></h2>
          <p className="text-dark-400">{t('calc').subtitle}</p>
        </div>

        <div className="max-w-2xl mx-auto card border-gold-500/20">
          <div className="grid sm:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="label">{t('calc').amount}</label>
              <input type="number" className="input" placeholder="e.g. 25000"
                value={loanAmount} onChange={e => { setLoanAmount(e.target.value); setResult(null); }} />
            </div>
            <div>
              <label className="label">{t('calc').duration}</label>
              <input type="number" className="input" placeholder="e.g. 6"
                value={months} onChange={e => { setMonths(e.target.value); setResult(null); }} />
            </div>
          </div>
          <button onClick={calculate} className="btn-gold w-full text-base">{t('calc').btnCalc}</button>

          {result && (
            <div className="mt-8 grid grid-cols-2 gap-4 animate-fade-in">
              {[
                [t('calc').resRate, `${result.rate}% / ${t('interest').perMonth}`],
                [t('calc').resMonthly, fmt(result.monthlyInterest)],
                [t('calc').resTotal, fmt(result.totalInterest)],
                [t('calc').resPayable, fmt(result.totalPayable)],
              ].map(([label, val], i) => (
                <div key={label} className={`p-4 rounded-xl ${i === 3 ? 'col-span-2 bg-gold-500/10 border border-gold-500/30' : 'bg-dark-700'}`}>
                  <div className="text-dark-400 text-xs mb-1">{label}</div>
                  <div className={`font-bold text-lg ${i === 3 ? 'gold-text text-2xl' : 'text-white'}`}>{val}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function Services() {
  const { t } = useContext(LanguageContext);
  const SERVICES = [
    { icon: '🪙', title: t('services').s1, desc: t('services').s1d },
    { icon: '⚖️', title: t('services').s2, desc: t('services').s2d },
    { icon: '🔄', title: t('services').s3, desc: t('services').s3d },
    { icon: '💳', title: t('services').s4, desc: t('services').s4d },
    { icon: '🔓', title: t('services').s5, desc: t('services').s5d },
  ];

  return (
    <section id="services" className="py-20 bg-dark-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <h2 className="text-4xl font-bold text-white mb-3">{t('services').title} <span className="gold-text">{t('services').titleGold}</span></h2>
          <p className="text-dark-400">{t('services').subtitle}</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {SERVICES.map((s, i) => (
            <div key={s.title} className="card group hover:border-gold-500/40 transition-all duration-300 hover:-translate-y-1 cursor-pointer"
              style={{ animationDelay: `${i * 0.1}s` }}>
              <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">{s.icon}</div>
              <h3 className="text-white font-bold text-lg mb-2">{s.title}</h3>
              <p className="text-dark-400 text-sm leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Documents() {
  const { t } = useContext(LanguageContext);
  return (
    <section id="documents" className="py-20 bg-dark-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <h2 className="text-4xl font-bold text-white mb-3">{t('docs').title} <span className="gold-text">{t('docs').titleGold}</span></h2>
          <p className="text-dark-400">{t('docs').subtitle}</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-4xl mx-auto">
          {[
            { icon: '🪪', doc: t('docs').d1, note: t('docs').d1d },
            { icon: '💳', doc: t('docs').d2, note: t('docs').d2d },
            { icon: '📱', doc: t('docs').d3, note: t('docs').d3d },
            { icon: '🏠', doc: t('docs').d4, note: t('docs').d4d },
          ].map(({ icon, doc, note }) => (
            <div key={doc} className="card text-center group hover:border-gold-500/40 transition-all duration-300 hover:-translate-y-1">
              <div className="text-4xl mb-3 float">{icon}</div>
              <h3 className="text-white font-semibold mb-1">{doc}</h3>
              <p className="text-dark-400 text-xs">{note}</p>
              <div className="mt-3 w-6 h-6 bg-green-500/20 border border-green-500/40 rounded-full flex items-center justify-center mx-auto">
                <span className="text-green-400 text-xs">✓</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ContactSection() {
  const { t } = useContext(LanguageContext);
  const [form, setForm] = useState({ name: '', mobile: '', message: '' });
  const [status, setStatus] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('loading');
    try {
      const { sendContact } = await import('../../services/api');
      await sendContact(form);
      setStatus('success');
      setForm({ name: '', mobile: '', message: '' });
    } catch {
      setStatus('error');
    }
  };

  return (
    <section id="contact" className="py-20 bg-dark-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-4xl font-bold text-white mb-4">{t('contact').title} <span className="gold-text">{t('contact').titleGold}</span></h2>
            <p className="text-dark-400 mb-8">{t('contact').subtitle}</p>
            <div className="space-y-4">
              {[
                { icon: '📍', label: t('contact').l1, val: t('contact').l1v },
                { icon: '🕒', label: t('contact').l2, val: t('contact').l2v },
                { icon: '✅', label: t('contact').l3, val: t('contact').l3v },
              ].map(({ icon, label, val }) => (
                <div key={label} className="flex items-center gap-4 p-4 bg-dark-800 rounded-xl border border-dark-700">
                  <span className="text-2xl">{icon}</span>
                  <div>
                    <div className="text-dark-400 text-xs">{label}</div>
                    <div className="text-white font-medium">{val}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="card border-gold-500/20">
            <h3 className="text-white font-bold text-xl mb-6">{t('contact').formTitle}</h3>
            {status === 'success' ? (
              <div className="text-center py-8">
                <div className="text-5xl mb-4">✅</div>
                <div className="text-green-400 font-semibold text-lg">{t('contact').success}</div>
                <p className="text-dark-400 mt-2">{t('contact').successDesc}</p>
                <button onClick={() => setStatus('')} className="btn-outline mt-4 text-sm px-4 py-2">{t('contact').btnAnother}</button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="label">{t('contact').fName}</label>
                  <input className="input" placeholder={t('contact').fNameP} value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value })} required />
                </div>
                <div>
                  <label className="label">{t('contact').fMobile}</label>
                  <input className="input" placeholder={t('contact').fMobileP} value={form.mobile}
                    onChange={e => setForm({ ...form, mobile: e.target.value })} required />
                </div>
                <div>
                  <label className="label">{t('contact').fMsg}</label>
                  <textarea className="input" rows={4} placeholder={t('contact').fMsgP} value={form.message}
                    onChange={e => setForm({ ...form, message: e.target.value })} required />
                </div>
                {status === 'error' && <p className="text-red-400 text-sm">{t('contact').err}</p>}
                <button type="submit" disabled={status === 'loading'} className="btn-gold w-full">
                  {status === 'loading' ? t('contact').btnSending : t('contact').btnSend}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  const { t } = useContext(LanguageContext);
  return (
    <footer className="bg-dark-950 border-t border-dark-800 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="flex items-center justify-center mb-4">
          <img src="/logo.png" alt="AS Gold Loan Logo" className="h-14 object-contain" />
        </div>
        <p className="text-dark-500 text-sm">{t('footer').rights.replace('{year}', new Date().getFullYear())}</p>
        <p className="text-dark-600 text-xs mt-2">{t('footer').desc}</p>
      </div>
    </footer>
  );
}

export default function CustomerHome() {
  // Try to get saved language from localStorage, default to 'en'
  const [lang, setLang] = useState(() => {
    return localStorage.getItem('asnk_lang') || 'en';
  });

  useEffect(() => {
    localStorage.setItem('asnk_lang', lang);
  }, [lang]);

  const t = (section) => translations[lang][section];

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      <div className="min-h-screen">
        <Navbar />
        <Hero />
        <InterestSection />
        <Calculator />
        <Services />
        <Documents />
        <ContactSection />
        <Footer />
      </div>
    </LanguageContext.Provider>
  );
}

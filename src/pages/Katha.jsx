import { useEffect } from 'react';
import analyticsService from '../services/analyticsService';
import data from '../data/data.json';

const COMING_SOON_CATEGORIES = [
  {
    id: 'divine',
    icon: '🕉️',
    title: 'दिव्य कथाएँ',
    subtitle: 'Divine Stories',
    desc: 'तीर्थंकरों और महान जैन आत्माओं की दिव्य जीवन-कथाएँ — जो मन को परमात्मा की ओर उन्मुख करती हैं।',
  },
  {
    id: 'tirth',
    icon: '⛩️',
    title: 'तीर्थ यात्रा',
    subtitle: 'Pilgrimage Tales',
    desc: 'शत्रुंजय, गिरनार, सम्मेद शिखर — पवित्र तीर्थस्थलों की कहानियाँ और उनका आध्यात्मिक महत्व।',
  },
  {
    id: 'siddhant',
    icon: '📿',
    title: 'सिद्धांत बोध',
    subtitle: 'Jain Philosophy',
    desc: 'अहिंसा, अनेकान्तवाद, अपरिग्रह — जैन दर्शन के मूल सिद्धांतों पर सरल और प्रेरणादायक प्रवचन।',
  },
  {
    id: 'saints',
    icon: '🙏',
    title: 'संत-महात्माओं के जीवन',
    subtitle: 'Lives of Saints',
    desc: 'जैन परम्परा के महान साधु-साध्वियों के त्याग, तपस्या और करुणा की अनुकरणीय जीवन-गाथाएँ।',
  },
];

export default function Katha() {
  useEffect(() => {
    document.title = `कथा | ${data.site.name}`;
    analyticsService.pageView('/katha', 'Katha');
  }, []);

  return (
    <div className="scroll-page" style={{ backgroundImage: "url('/images/katha.jpg')" }}>
      <div className="scroll-page-content">

        <header className="scroll-page-header">
          <p className="scroll-page-eyebrow">जैन कथाएँ</p>
          <h1 className="scroll-page-title katha-coming-title">कथा</h1>
          <p className="scroll-page-sub">Inspiring stories and teachings from the Jain tradition</p>
        </header>

        {/* Coming Soon hero */}
        <div className="katha-coming-hero">
          <span className="katha-coming-badge">✦ शीघ्र आ रहा है ✦</span>
          <p className="katha-coming-lead">
            जैन धर्म की दिव्य कथाओं का एक अनूठा संग्रह तैयार किया जा रहा है।<br />
            <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.88rem', opacity: 0.7 }}>
              A unique collection of divine Jain stories is being curated — coming soon.
            </span>
          </p>
        </div>

        {/* Category preview cards */}
        <div className="katha-coming-grid">
          {COMING_SOON_CATEGORIES.map((cat) => (
            <div key={cat.id} className="katha-coming-card">
              <span className="katha-coming-card-icon" aria-hidden="true">{cat.icon}</span>
              <div className="katha-coming-card-body">
                <h2 className="katha-coming-card-title">{cat.title}</h2>
                <p className="katha-coming-card-subtitle">{cat.subtitle}</p>
                <p className="katha-coming-card-desc">{cat.desc}</p>
              </div>
              <span className="katha-coming-card-pill">Coming Soon</span>
            </div>
          ))}
        </div>

        {/* Footer note */}
        <p className="katha-coming-footer">
          🔔 अधिक जानकारी के लिए हमें Instagram पर फॉलो करें।
        </p>

      </div>
    </div>
  );
}

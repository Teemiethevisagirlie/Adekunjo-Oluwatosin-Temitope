#!/usr/bin/env node
// ============================================================
// TEEMIE THE VISA GIRLIE — Complete Single-File Server
// Pages: Home, Services, About, Blog, Testimonials, FAQ, Contact
// Admin Dashboard: /admin  (password protected, live editing)
// Zero external dependencies — pure Node.js built-ins only
// ============================================================

const http = require('http');
const url  = require('url');
const crypto  = require('crypto');
const fs      = require('fs');
const fspath  = require('path');

const PORT           = process.env.PORT || 3000;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'teemie2026';
const DATA_FILE      = process.env.DATA_FILE || fspath.join(__dirname, 'content.json');

// ── Persistence: load from disk or fall back to defaults ──
function loadContent(defaults) {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const saved = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
      // Deep merge: saved wins, defaults fill missing keys
      return Object.assign({}, defaults, saved);
    }
  } catch(e) { console.warn('Could not load content.json, using defaults:', e.message); }
  return defaults;
}

function saveContent() {
  try { fs.writeFileSync(DATA_FILE, JSON.stringify(CONTENT, null, 2), 'utf8'); }
  catch(e) { console.error('Could not save content.json:', e.message); }
}

const DEFAULT_CONTENT = {
  hero: {
    badge: 'Travel Consultant & Visa Specialist',
    name: 'Teemie',
    tagline: 'The Visa Girlie',
    subtitle: 'Making international travel seamless — from visa applications to hotel reservations. Based in Lagos, going everywhere.',
    cta_primary: 'Book a Consultation',
    cta_secondary: 'Explore Services',
  },
  stats: { years: '3+', clients: '100+', services: '6+', success: '98%' },
  about: {
    title: 'The story behind the visa girlie',
    body: "Hi, I'm <strong>Teemie</strong> — a Travel Consultant and Project Manager with <em>3 years</em> in the travel industry. I've helped hundreds of people plan their travels, relocate through study abroad, reunite families through family relocation, and experience unforgettable vacations across the globe.<br><br>I studied <strong>Accounting</strong> but pivoted when my own study abroad experience didn't go as planned. That personal challenge sparked a mission — to make sure no one else goes through the same. In <em>3 years</em>, I've turned that mission into a thriving consultancy.",
    tiktok: '@Teemiethevisagirlie',
    location: 'Lagos, Nigeria',
  },
  services: [
    { id: 1, emoji: '🛂', name: 'Visa Assistance',         accent: '#b478ff', desc: 'Expert, end-to-end visa application support — from documentation prep to submission. Near-perfect success rate across hundreds of applications.' },
    { id: 2, emoji: '✈️', name: 'Flight Reservation',      accent: '#7de8d0', desc: 'Smart, budget-conscious flight bookings tailored to your schedule. One-way, return, or complex multi-city itineraries — handled seamlessly.' },
    { id: 3, emoji: '🏨', name: 'Hotel Reservation',       accent: '#ffb347', desc: 'Carefully selected accommodations that match your comfort level and budget. From boutique stays to business hotels — I find the best options.' },
    { id: 4, emoji: '🚗', name: 'Airport Transfers',        accent: '#ff6b9d', desc: 'Reliable, punctual airport pick-up and drop-off arrangements. Land stress-free and depart on time — every single time.' },
    { id: 5, emoji: '🎓', name: 'International Admissions', accent: '#7de8d0', desc: 'Comprehensive support for studying abroad — from university applications to student visa processing. Your dream of international education, simplified.' },
    { id: 6, emoji: '💬', name: 'General Consultation',    accent: '#b478ff', desc: "Not sure where to start? Book a one-on-one session and let's map out your entire travel journey together." },
  ],
  testimonials: [
    { id: 1, name: 'Adaeze O.', location: 'Lagos → UK', rating: 5, text: "Teemie made my UK student visa process completely stress-free. She knew exactly what documents I needed and guided me every step. Got my visa in 3 weeks!" },
    { id: 2, name: 'Emeka N.', location: 'Abuja → Canada', rating: 5, text: 'I was overwhelmed by the Canadian PR process. Teemie broke everything down, got my flights and accommodation sorted. Truly a lifesaver!' },
    { id: 3, name: 'Sade A.', location: 'Lagos → Dubai', rating: 5, text: 'Booked a full Dubai vacation package through Teemie — visa, hotel, airport transfer. Flawless execution. Will definitely use her again.' },
    { id: 4, name: 'Chidi M.', location: 'PH → Germany', rating: 5, text: 'My Germany study visa was denied twice before I met Teemie. She identified exactly what was wrong. Third attempt — approved in 2 weeks!' },
    { id: 5, name: 'Funmi B.', location: 'Lagos → USA', rating: 5, text: 'The B1/B2 visa process seemed impossible until Teemie stepped in. Her knowledge is unmatched. My appointment was a breeze.' },
    { id: 6, name: 'Tobi R.', location: 'Ibadan → Australia', rating: 5, text: 'From student visa to university admission support — Teemie handled it all. Professional, responsive, and genuinely cares about her clients.' },
  ],
  blog: [
    { id: 1, tag: 'Visa Tips', date: 'April 2026', title: '7 Documents You Always Need for a UK Visa Application', excerpt: 'Missing even one document can get your UK visa rejected. Here\'s the definitive checklist I give every client before they submit.', read: '5 min read' },
    { id: 2, tag: 'Study Abroad', date: 'March 2026', title: 'How to Get a Canadian Student Permit in 2026', excerpt: 'Canada remains one of the top destinations for Nigerian students. Here\'s the updated step-by-step process for this year.', read: '8 min read' },
    { id: 3, tag: 'Travel Hacks', date: 'February 2026', title: 'Finding Cheap Flights From Lagos: My Proven Strategy', excerpt: 'I\'ve booked hundreds of flights. These are the exact tactics I use to save clients thousands of naira on every booking.', read: '6 min read' },
    { id: 4, tag: 'Visa Tips', date: 'January 2026', title: 'Why Schengen Visa Applications Get Rejected (And How to Fix It)', excerpt: 'Schengen denials are more common than people think. Here are the top 8 reasons — and exactly what to do about each one.', read: '7 min read' },
  ],
  faq: [
    { id: 1, q: 'How do I get started with your services?', a: 'Simply reach out via WhatsApp, email, or the contact form. We\'ll schedule a quick discovery call to understand your needs and I\'ll outline the best path forward.' },
    { id: 2, q: 'How long does a visa application take?', a: 'It depends on the country and visa type. UK visas typically take 3–8 weeks, Schengen 2–4 weeks, and US visas 2–12 weeks depending on appointment availability. I always aim to start your process as early as possible.' },
    { id: 3, q: 'What documents do I need for a visa application?', a: 'This varies by destination, but core requirements usually include a valid passport, bank statements (3–6 months), employment/enrollment letter, travel insurance, accommodation proof, and recent passport photos. I provide a tailored checklist for every client.' },
    { id: 4, q: 'Can you guarantee visa approval?', a: 'No consultant can legally guarantee a visa — embassies and consulates have final authority. However, my 98% success rate comes from thorough preparation, correct documentation, and knowing exactly what each embassy looks for.' },
    { id: 5, q: 'Do you handle visas for countries outside the UK, US, Canada?', a: 'Yes! I handle visa applications for Schengen countries (Europe), Australia, UAE, and many more. Contact me with your destination and I\'ll let you know if I can help.' },
    { id: 6, q: 'How much do your services cost?', a: 'Pricing varies by service and complexity. Visa assistance starts from ₦30,000. Book a free 15-minute discovery call and I\'ll give you a transparent quote upfront — no hidden fees.' },
  ],
  contact: {
    whatsapp: 'https://wa.me/2348101149438',
    tiktok:   'https://tiktok.com/@Teemiethevisagirlie',
    email:    'teemie@visagirlie.com',
    instagram: 'https://instagram.com/teemiethevisagirlie',
  },
  marquee: ['Visa Assistance','Flight Reservations','Hotel Bookings','Airport Transfers','International Admissions','General Consultation','Based in Lagos','@Teemiethevisagirlie'],
  quote: 'Travel is not just moving from one place to another — it\'s about opening doors to new possibilities. I\'m here to make sure yours open smoothly.',
};

// Initialise from disk (or defaults on first run)
let CONTENT = loadContent(DEFAULT_CONTENT);

// ── Enquiry log (in-memory, viewable in admin) ──
const ENQUIRIES = [];
function logEnquiry(data) {
  ENQUIRIES.unshift({ id: Date.now(), ts: new Date().toISOString(), ...data });
  if (ENQUIRIES.length > 200) ENQUIRIES.pop(); // cap at 200
}

// ── Session store for admin auth ──
const sessions = new Map();
function createSession() {
  const id = crypto.randomBytes(24).toString('hex');
  sessions.set(id, { created: Date.now() });
  return id;
}
function validSession(req) {
  const cookie = (req.headers.cookie || '').split(';').find(c => c.trim().startsWith('sid='));
  if (!cookie) return false;
  const sid = cookie.trim().slice(4);
  return sessions.has(sid);
}

// ── Shared CSS variables ──
const CSS_VARS = `
  :root {
    --purple: #b478ff; --teal: #7de8d0; --pink: #ff6b9d; --amber: #ffb347;
    --bg: #0a0a0f; --bg2: #0f0f18; --bg3: #141420;
    --text: #f0ede8; --text-muted: rgba(240,237,232,0.55); --text-faint: rgba(240,237,232,0.25);
    --border: rgba(255,255,255,0.08); --border-hover: rgba(180,120,255,0.35);
  }`;

// ── Shared HTML shell ──
function shell(title, body, activePage='') {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>${title} — Teemie The Visa Girlie</title>
<meta name="description" content="Teemie The Visa Girlie — Travel Consultant & Visa Specialist based in Lagos. Visa applications, flight & hotel bookings, airport transfers, international admissions.">
<meta name="keywords" content="visa consultant Lagos, travel consultant Nigeria, UK visa help, Schengen visa, study abroad Nigeria, Teemie visa girlie">
<meta property="og:title" content="${title} — Teemie The Visa Girlie">
<meta property="og:description" content="Expert travel consulting from Lagos. Visas, flights, hotels, international admissions — all in one place.">
<meta property="og:type" content="website">
<meta name="twitter:card" content="summary">
<meta name="theme-color" content="#b478ff">
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&family=DM+Sans:wght@300;400;500&display=swap" rel="stylesheet">
<style>
${CSS_VARS}
*,*::before,*::after{margin:0;padding:0;box-sizing:border-box;}
html{scroll-behavior:smooth;}
body{font-family:'DM Sans',sans-serif;background:var(--bg);color:var(--text);overflow-x:hidden;cursor:none;}
.cursor{width:12px;height:12px;background:var(--purple);border-radius:50%;position:fixed;top:0;left:0;pointer-events:none;z-index:9999;transform:translate(-50%,-50%);transition:transform .1s,width .3s,height .3s,background .3s;mix-blend-mode:screen;}
.cursor-ring{width:36px;height:36px;border:1px solid rgba(180,120,255,.4);border-radius:50%;position:fixed;top:0;left:0;pointer-events:none;z-index:9998;transform:translate(-50%,-50%);transition:transform .18s,width .3s,height .3s;}
nav{position:fixed;top:0;left:0;right:0;z-index:1000;display:flex;justify-content:space-between;align-items:center;padding:1.2rem 3rem;background:rgba(10,10,15,.85);backdrop-filter:blur(20px);border-bottom:1px solid var(--border);}
.nav-logo{font-family:'Playfair Display',serif;font-size:1.1rem;color:var(--text);text-decoration:none;letter-spacing:.5px;}
.nav-links{display:flex;gap:2rem;list-style:none;align-items:center;}
.nav-links a{font-size:13px;color:var(--text-muted);text-decoration:none;letter-spacing:.5px;transition:color .2s;position:relative;padding-bottom:2px;}
.nav-links a::after{content:'';position:absolute;bottom:-2px;left:0;right:0;height:1px;background:var(--purple);transform:scaleX(0);transition:transform .3s;}
.nav-links a:hover,.nav-links a.active{color:var(--text);}
.nav-links a:hover::after,.nav-links a.active::after{transform:scaleX(1);}
.nav-cta{background:linear-gradient(135deg,var(--purple),var(--teal));color:#0a0a0f!important;font-weight:500!important;padding:8px 20px;border-radius:100px;text-decoration:none;font-size:13px!important;}
.nav-cta::after{display:none!important;}
.nav-cta:hover{opacity:.85;}
.hamburger{display:none;flex-direction:column;gap:5px;cursor:pointer;padding:4px;}
.hamburger span{width:22px;height:2px;background:var(--text);border-radius:2px;transition:.3s;}
@media(max-width:768px){
  nav{padding:1rem 1.5rem;}
  .nav-links{display:none;position:fixed;top:60px;left:0;right:0;background:var(--bg2);flex-direction:column;padding:2rem;gap:1.5rem;border-bottom:1px solid var(--border);}
  .nav-links.open{display:flex;}
  .hamburger{display:flex;}
}
.page-hero{min-height:40vh;display:flex;align-items:flex-end;padding:8rem 3rem 4rem;position:relative;overflow:hidden;}
.page-hero-orb{position:absolute;width:600px;height:600px;background:radial-gradient(circle,rgba(180,120,255,.12) 0%,transparent 65%);top:-100px;right:-150px;pointer-events:none;}
.page-hero-label{font-size:11px;font-weight:500;letter-spacing:3px;text-transform:uppercase;color:var(--purple);margin-bottom:.75rem;}
.page-hero-title{font-family:'Playfair Display',serif;font-size:clamp(2.5rem,6vw,4.5rem);font-weight:700;line-height:1.05;background:linear-gradient(135deg,#fff 0%,#dcc8ff 50%,#9fe8d8 100%);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;}
.section{max-width:1140px;margin:0 auto;padding:6rem 2rem;}
.section-label{display:flex;align-items:center;gap:.5rem;font-size:11px;font-weight:500;letter-spacing:3px;text-transform:uppercase;color:var(--purple);margin-bottom:1rem;}
.section-label::before{content:'';width:24px;height:1px;background:var(--purple);}
.section-title{font-family:'Playfair Display',serif;font-size:clamp(2rem,4vw,3rem);font-weight:700;line-height:1.1;margin-bottom:1rem;}
.section-subtitle{color:var(--text-muted);max-width:600px;line-height:1.8;margin-bottom:3rem;}
.btn-primary{display:inline-flex;align-items:center;gap:8px;background:linear-gradient(135deg,var(--purple),var(--teal));color:#0a0a0f;font-weight:500;padding:14px 32px;border-radius:100px;text-decoration:none;font-size:15px;transition:opacity .2s,transform .2s;border:none;cursor:pointer;}
.btn-primary:hover{opacity:.85;transform:translateY(-1px);}
.btn-outline{display:inline-flex;align-items:center;gap:8px;border:1px solid rgba(180,120,255,.4);color:var(--purple);background:transparent;padding:14px 32px;border-radius:100px;text-decoration:none;font-size:15px;transition:.2s;cursor:pointer;}
.btn-outline:hover{border-color:var(--purple);background:rgba(180,120,255,.08);}
.reveal{opacity:0;transform:translateY(28px);transition:opacity .7s ease,transform .7s ease;}
.reveal.visible{opacity:1;transform:none;}
.reveal-delay-1{transition-delay:.1s;}.reveal-delay-2{transition-delay:.2s;}.reveal-delay-3{transition-delay:.3s;}.reveal-delay-4{transition-delay:.4s;}.reveal-delay-5{transition-delay:.5s;}.reveal-delay-6{transition-delay:.6s;}
footer{border-top:1px solid var(--border);padding:3rem 2rem;text-align:center;display:flex;flex-direction:column;gap:1rem;align-items:center;}
.footer-logo{font-family:'Playfair Display',serif;font-size:1.1rem;color:var(--text);}
.footer-copy{font-size:13px;color:var(--text-faint);}
.footer-links{display:flex;gap:2rem;}
.footer-links a{font-size:13px;color:var(--text-muted);text-decoration:none;transition:color .2s;}
.footer-links a:hover{color:var(--text);}
.whatsapp-float{position:fixed;bottom:2rem;right:2rem;width:56px;height:56px;background:linear-gradient(135deg,var(--purple),var(--teal));border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:1.5rem;text-decoration:none;z-index:900;box-shadow:0 8px 24px rgba(180,120,255,.4);transition:transform .3s;}
.whatsapp-float:hover{transform:scale(1.1);}
</style>
</head>
<body>
<div class="cursor" id="cursor"></div>
<div class="cursor-ring" id="cursorRing"></div>

<nav>
  <a href="/" class="nav-logo">Teemie ✦ The Visa Girlie</a>
  <div class="hamburger" id="hamburger"><span></span><span></span><span></span></div>
  <ul class="nav-links" id="navLinks">
    <li><a href="/" ${activePage==='home'?'class="active"':''}>Home</a></li>
    <li><a href="/services" ${activePage==='services'?'class="active"':''}>Services</a></li>
    <li><a href="/about" ${activePage==='about'?'class="active"':''}>About</a></li>
    <li><a href="/blog" ${activePage==='blog'?'class="active"':''}>Blog</a></li>
    <li><a href="/testimonials" ${activePage==='testimonials'?'class="active"':''}>Reviews</a></li>
    <li><a href="/faq" ${activePage==='faq'?'class="active"':''}>FAQ</a></li>
    <li><a href="/contact" class="nav-cta">Book Now</a></li>
  </ul>
</nav>

${body}

<footer>
  <div class="footer-logo">Teemie ✦ The Visa Girlie</div>
  <div class="footer-copy">© 2026 · Lagos, Nigeria · All rights reserved</div>
  <div class="footer-links">
    <a href="/services">Services</a>
    <a href="/about">About</a>
    <a href="/blog">Blog</a>
    <a href="/testimonials">Reviews</a>
    <a href="/faq">FAQ</a>
    <a href="/contact">Contact</a>
  </div>
</footer>

<a href="${CONTENT.contact.whatsapp}" class="whatsapp-float" title="Chat on WhatsApp">💬</a>

<script>
const cursor=document.getElementById('cursor'),ring=document.getElementById('cursorRing');
let mx=0,my=0,rx=0,ry=0;
document.addEventListener('mousemove',e=>{mx=e.clientX;my=e.clientY;cursor.style.left=mx+'px';cursor.style.top=my+'px';});
function animRing(){rx+=(mx-rx)*.12;ry+=(my-ry)*.12;ring.style.left=rx+'px';ring.style.top=ry+'px';requestAnimationFrame(animRing);}
animRing();
document.querySelectorAll('a,button').forEach(el=>{
  el.addEventListener('mouseenter',()=>{cursor.style.width='20px';cursor.style.height='20px';ring.style.width='52px';ring.style.height='52px';});
  el.addEventListener('mouseleave',()=>{cursor.style.width='12px';cursor.style.height='12px';ring.style.width='36px';ring.style.height='36px';});
});
document.querySelectorAll('.reveal').forEach(el=>{
  new IntersectionObserver(([e])=>{if(e.isIntersecting)el.classList.add('visible');},{threshold:.1}).observe(el);
});
const ham=document.getElementById('hamburger'),nav=document.getElementById('navLinks');
if(ham)ham.addEventListener('click',()=>nav.classList.toggle('open'));
</script>
</body>
</html>`;
}

// ═══════════════════════════════════════════════════════════
// PAGE RENDERERS
// ═══════════════════════════════════════════════════════════

function homePage() {
  const c = CONTENT;
  const servicesHTML = c.services.map((s,i)=>`
    <div class="service-card reveal reveal-delay-${i+1}" style="--ca:${s.accent}">
      <span class="srv-num">0${i+1}</span>
      <span class="srv-emoji">${s.emoji}</span>
      <div class="srv-name">${s.name}</div>
      <div class="srv-desc">${s.desc}</div>
    </div>`).join('');

  const body = `
<style>
.hero{min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:8rem 2rem 5rem;text-align:center;position:relative;overflow:hidden;}
.orb{position:absolute;pointer-events:none;border-radius:50%;}
.orb1{width:700px;height:700px;background:radial-gradient(circle,rgba(180,120,255,.13) 0%,transparent 65%);top:-200px;right:-150px;}
.orb2{width:500px;height:500px;background:radial-gradient(circle,rgba(125,232,208,.1) 0%,transparent 65%);bottom:-100px;left:-100px;}
.orb3{width:300px;height:300px;background:radial-gradient(circle,rgba(255,107,157,.07) 0%,transparent 65%);top:40%;left:20%;}
.particles{position:absolute;inset:0;pointer-events:none;overflow:hidden;}
.particle{position:absolute;border-radius:50%;opacity:0;animation:float-p linear infinite;}
@keyframes float-p{0%{opacity:0;transform:translateY(0) scale(0);}10%{opacity:.6;transform:translateY(-20px) scale(1);}90%{opacity:.2;}100%{opacity:0;transform:translateY(-120px) scale(.5);}}
.badge{display:inline-flex;align-items:center;gap:8px;font-size:11px;font-weight:500;letter-spacing:3px;text-transform:uppercase;color:var(--purple);border:1px solid rgba(180,120,255,.35);padding:7px 18px;border-radius:100px;margin-bottom:2rem;animation:fade-up .8s ease both;}
.badge-dot{width:6px;height:6px;background:var(--teal);border-radius:50%;animation:pulse 2s infinite;}
@keyframes pulse{0%,100%{opacity:1;transform:scale(1);}50%{opacity:.4;transform:scale(.6);}}
@keyframes fade-up{from{opacity:0;transform:translateY(24px);}to{opacity:1;transform:translateY(0);}}
@keyframes shimmer{0%,100%{background-position:0% 50%;}50%{background-position:100% 50%;}}
.hero-name{font-family:'Playfair Display',serif;font-size:clamp(3.5rem,9vw,6.5rem);font-weight:700;line-height:1.0;background:linear-gradient(135deg,#fff 0%,#dcc8ff 40%,#9fe8d8 80%,#fff 100%);background-size:200% 200%;-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;margin-bottom:.3rem;animation:fade-up .8s .15s ease both,shimmer 6s 1s ease-in-out infinite;}
.hero-tagline{font-family:'Playfair Display',serif;font-size:clamp(1.2rem,3vw,1.8rem);color:var(--text-muted);font-style:italic;margin-bottom:2rem;animation:fade-up .8s .3s ease both;}
.hero-subtitle{font-size:clamp(1rem,2vw,1.15rem);color:var(--text-muted);max-width:540px;line-height:1.75;margin-bottom:3rem;animation:fade-up .8s .45s ease both;}
.hero-btns{display:flex;gap:1rem;flex-wrap:wrap;justify-content:center;animation:fade-up .8s .6s ease both;}
.scroll-hint{position:absolute;bottom:2.5rem;left:50%;transform:translateX(-50%);display:flex;flex-direction:column;align-items:center;gap:.5rem;color:var(--text-faint);font-size:11px;letter-spacing:2px;text-transform:uppercase;}
.scroll-line{width:1px;height:40px;background:linear-gradient(to bottom,var(--text-faint),transparent);}
.marquee-wrapper{overflow:hidden;border-top:1px solid var(--border);border-bottom:1px solid var(--border);padding:.9rem 0;}
.marquee-track{display:flex;width:max-content;animation:marquee 28s linear infinite;}
@keyframes marquee{from{transform:translateX(0);}to{transform:translateX(-50%);}}
.marquee-item{display:flex;align-items:center;gap:1rem;padding:0 2rem;font-size:13px;color:var(--text-muted);letter-spacing:.5px;white-space:nowrap;}
.marquee-dot{width:4px;height:4px;border-radius:50%;background:var(--purple);flex-shrink:0;}
.home-services{max-width:1140px;margin:0 auto;padding:6rem 2rem;}
.srv-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(320px,1fr));gap:1.5rem;}
.service-card{background:var(--bg2);border:1px solid var(--border);border-radius:20px;padding:2.5rem;position:relative;overflow:hidden;transition:border-color .3s,transform .3s;}
.service-card::before{content:'';position:absolute;inset:0;background:linear-gradient(135deg,rgba(var(--ca-r,180),var(--ca-g,120),var(--ca-b,255),.06) 0%,transparent 60%);opacity:0;transition:opacity .3s;}
.service-card:hover{border-color:rgba(180,120,255,.35);transform:translateY(-4px);}
.service-card:hover::before{opacity:1;}
.srv-num{position:absolute;top:1.5rem;right:1.5rem;font-size:11px;color:var(--text-faint);letter-spacing:2px;}
.srv-emoji{font-size:2rem;margin-bottom:1rem;display:block;}
.srv-name{font-family:'Playfair Display',serif;font-size:1.25rem;font-weight:600;margin-bottom:.75rem;color:var(--ca);}
.srv-desc{font-size:.9rem;color:var(--text-muted);line-height:1.75;}
.quote-section{max-width:800px;margin:0 auto;padding:5rem 2rem;text-align:center;position:relative;}
.quote-mark{font-family:'Playfair Display',serif;font-size:8rem;color:rgba(180,120,255,.15);line-height:0;position:absolute;top:4rem;left:2rem;}
.quote-text{font-family:'Playfair Display',serif;font-size:clamp(1.3rem,3vw,1.8rem);font-style:italic;color:var(--text);line-height:1.6;margin-bottom:1.5rem;}
.quote-author{font-size:13px;color:var(--purple);letter-spacing:2px;text-transform:uppercase;}
.stats-row{display:flex;gap:3rem;margin-top:2.5rem;flex-wrap:wrap;}
.stat-num{font-family:'Playfair Display',serif;font-size:2.5rem;font-weight:700;background:linear-gradient(135deg,var(--purple),var(--teal));-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;}
.stat-lbl{font-size:12px;color:var(--text-faint);letter-spacing:1px;text-transform:uppercase;margin-top:.25rem;}
</style>

<section class="hero" id="hero">
  <div class="orb orb1"></div>
  <div class="orb orb2"></div>
  <div class="orb orb3"></div>
  <div class="particles" id="particles"></div>

  <div class="badge"><div class="badge-dot"></div>${c.hero.badge}</div>
  <h1 class="hero-name">${c.hero.name}</h1>
  <p class="hero-tagline">${c.hero.tagline}</p>
  <p class="hero-subtitle">${c.hero.subtitle}</p>
  <div class="hero-btns">
    <a href="/contact" class="btn-primary">${c.hero.cta_primary}</a>
    <a href="/services" class="btn-outline">${c.hero.cta_secondary}</a>
  </div>
  <div class="scroll-hint"><span>Scroll</span><div class="scroll-line"></div></div>
</section>

<div class="marquee-wrapper">
  <div class="marquee-track" id="marqueeTrack"></div>
</div>

<div class="home-services">
  <p class="section-label reveal">What I offer</p>
  <h2 class="section-title reveal">Services built for every kind of traveller</h2>
  <p class="section-subtitle reveal">Whether you're moving abroad, studying internationally, or just need a stress-free travel experience.</p>
  <div class="srv-grid">${servicesHTML}</div>
</div>

<div class="quote-section reveal">
  <span class="quote-mark">"</span>
  <p class="quote-text">${c.quote}</p>
  <p class="quote-author">— Teemie, The Visa Girlie</p>
</div>

<div class="section">
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:4rem;align-items:center;">
    <div class="reveal">
      <div style="background:var(--bg2);border:1px solid var(--border);border-radius:24px;padding:3rem;text-align:center;">
        <div style="width:80px;height:80px;background:linear-gradient(135deg,var(--purple),var(--teal));border-radius:50%;display:flex;align-items:center;justify-content:center;font-family:'Playfair Display',serif;font-size:2rem;font-weight:700;color:#0a0a0f;margin:0 auto 1.5rem;">T</div>
        <div style="font-family:'Playfair Display',serif;font-size:1.3rem;font-weight:600;margin-bottom:.5rem;">Teemie</div>
        <div style="font-size:13px;color:var(--text-muted);margin-bottom:1.5rem;">✦ Travel Consultant & Visa Specialist</div>
        <div style="display:flex;flex-wrap:wrap;gap:.5rem;justify-content:center;">
          ${['Visa Expert','Project Manager','TikTok Creator','Lagos, Nigeria'].map(t=>`<span style="font-size:12px;background:rgba(180,120,255,.12);border:1px solid rgba(180,120,255,.25);color:var(--purple);padding:5px 14px;border-radius:100px;">${t}</span>`).join('')}
        </div>
      </div>
    </div>
    <div class="reveal reveal-delay-2">
      <p class="section-label">Who I am</p>
      <h2 class="section-title">The story behind<br>the visa girlie</h2>
      <p style="color:var(--text-muted);line-height:1.8;margin-bottom:1.5rem;">${c.about.body.replace(/<br><br>.*/,'')}</p>
      <div class="stats-row">
        <div><div class="stat-num">${c.stats.years}</div><div class="stat-lbl">Years Experience</div></div>
        <div><div class="stat-num">${c.stats.clients}</div><div class="stat-lbl">Clients Helped</div></div>
        <div><div class="stat-num">${c.stats.success}</div><div class="stat-lbl">Success Rate</div></div>
      </div>
      <div style="margin-top:2rem;"><a href="/about" class="btn-outline">Read My Story</a></div>
    </div>
  </div>
</div>

<script>
const pCont=document.getElementById('particles');
const colors=['#b478ff','#7de8d0','#ff6b9d','#ffb347'];
for(let i=0;i<25;i++){
  const p=document.createElement('div');p.className='particle';
  p.style.left=Math.random()*100+'%';p.style.top=Math.random()*100+'%';
  p.style.background=colors[Math.floor(Math.random()*colors.length)];
  p.style.animationDuration=(8+Math.random()*12)+'s';
  p.style.animationDelay=(Math.random()*10)+'s';
  const sz=1+Math.random()*2.5;p.style.width=p.style.height=sz+'px';
  pCont.appendChild(p);
}
const items=${JSON.stringify(c.marquee)};
const track=document.getElementById('marqueeTrack');
[...items,...items,...items,...items].forEach(text=>{
  const el=document.createElement('div');el.className='marquee-item';
  el.innerHTML='<span class="marquee-dot"></span>'+text;
  track.appendChild(el);
});
</script>`;
  return shell('Home', body, 'home');
}

function servicesPage() {
  const cards = CONTENT.services.map((s,i) => `
    <div class="srv-card reveal reveal-delay-${(i%3)+1}" style="--ca:${s.accent}">
      <div class="srv-card-header">
        <span class="srv-emoji">${s.emoji}</span>
        <span class="srv-num">0${i+1}</span>
      </div>
      <div class="srv-name">${s.name}</div>
      <div class="srv-desc">${s.desc}</div>
      <a href="/contact" class="srv-link">Get Started →</a>
    </div>`).join('');

  const body = `
<style>
.srv-card{background:var(--bg2);border:1px solid var(--border);border-radius:20px;padding:2.5rem;display:flex;flex-direction:column;gap:.75rem;transition:.3s;position:relative;overflow:hidden;}
.srv-card::before{content:'';position:absolute;inset:0;background:linear-gradient(135deg,color-mix(in srgb,var(--ca) 8%,transparent) 0%,transparent 60%);opacity:0;transition:opacity .3s;}
.srv-card:hover{border-color:var(--ca);transform:translateY(-4px);}
.srv-card:hover::before{opacity:1;}
.srv-card-header{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:.5rem;}
.srv-emoji{font-size:2.5rem;}
.srv-num{font-size:11px;color:var(--text-faint);letter-spacing:2px;}
.srv-name{font-family:'Playfair Display',serif;font-size:1.3rem;font-weight:600;color:var(--ca);}
.srv-desc{font-size:.9rem;color:var(--text-muted);line-height:1.75;flex:1;}
.srv-link{font-size:13px;color:var(--ca);text-decoration:none;font-weight:500;letter-spacing:.5px;margin-top:.5rem;transition:gap .2s;}
.srv-link:hover{gap:8px;}
.grid3{display:grid;grid-template-columns:repeat(auto-fit,minmax(320px,1fr));gap:1.5rem;}
.how-step{display:flex;gap:2rem;align-items:flex-start;padding:2rem;background:var(--bg2);border:1px solid var(--border);border-radius:16px;transition:.3s;}
.how-step:hover{border-color:rgba(180,120,255,.3);}
.step-num{font-family:'Playfair Display',serif;font-size:3rem;font-weight:700;color:rgba(180,120,255,.25);flex-shrink:0;line-height:1;}
.step-title{font-size:1rem;font-weight:500;margin-bottom:.5rem;}
.step-desc{font-size:.9rem;color:var(--text-muted);line-height:1.7;}
</style>

<div class="page-hero">
  <div class="page-hero-orb"></div>
  <div>
    <p class="page-hero-label">What I offer</p>
    <h1 class="page-hero-title">Services Built<br>for Every Journey</h1>
  </div>
</div>

<div class="section">
  <p class="section-label reveal">All Services</p>
  <h2 class="section-title reveal">Tailored travel support<br>from start to finish</h2>
  <p class="section-subtitle reveal">Every service is delivered personally by Teemie — no handoffs, no junior staff. Just expert guidance from someone who's been through it herself.</p>
  <div class="grid3">${cards}</div>
</div>

<div class="section" style="border-top:1px solid var(--border);">
  <p class="section-label reveal">The Process</p>
  <h2 class="section-title reveal">How it works</h2>
  <div style="display:flex;flex-direction:column;gap:1rem;margin-top:2rem;">
    ${[
      ['01','Discovery Call','We start with a free 15-minute call to understand your travel goals, timeline, and specific needs.'],
      ['02','Custom Plan','I put together a personalised action plan covering every step of your journey — documents, timelines, and costs.'],
      ['03','Execution','I handle all the heavy lifting: applications, bookings, and coordination — keeping you updated at every stage.'],
      ['04','Departure','You travel with confidence, knowing every detail has been handled. I remain available for any last-minute support.'],
    ].map(([n,t,d])=>`<div class="how-step reveal"><div class="step-num">${n}</div><div><div class="step-title">${t}</div><div class="step-desc">${d}</div></div></div>`).join('')}
  </div>
  <div style="text-align:center;margin-top:4rem;"><a href="/contact" class="btn-primary">Book a Free Discovery Call</a></div>
</div>`;
  return shell('Services', body, 'services');
}

function aboutPage() {
  const c = CONTENT;
  const body = `
<style>
.about-grid{display:grid;grid-template-columns:1fr 1.4fr;gap:4rem;align-items:center;}
@media(max-width:768px){.about-grid{grid-template-columns:1fr;}}
.about-card{background:var(--bg2);border:1px solid var(--border);border-radius:24px;padding:3rem;text-align:center;position:relative;}
.avatar{width:90px;height:90px;background:linear-gradient(135deg,var(--purple),var(--teal));border-radius:50%;display:flex;align-items:center;justify-content:center;font-family:'Playfair Display',serif;font-size:2.2rem;font-weight:700;color:#0a0a0f;margin:0 auto 1.5rem;}
.chips{display:flex;flex-wrap:wrap;gap:.5rem;justify-content:center;margin-top:1rem;}
.chip{font-size:12px;padding:5px 14px;border-radius:100px;border:1px solid;}
.chip-purple{background:rgba(180,120,255,.12);border-color:rgba(180,120,255,.3);color:var(--purple);}
.chip-teal{background:rgba(125,232,208,.08);border-color:rgba(125,232,208,.25);color:var(--teal);}
.chip-pink{background:rgba(255,107,157,.08);border-color:rgba(255,107,157,.25);color:var(--pink);}
.stats-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:1rem;margin-top:3rem;}
.stat-card{background:var(--bg2);border:1px solid var(--border);border-radius:16px;padding:1.5rem;text-align:center;}
.stat-n{font-family:'Playfair Display',serif;font-size:2.5rem;font-weight:700;background:linear-gradient(135deg,var(--purple),var(--teal));-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;}
.stat-l{font-size:11px;color:var(--text-faint);letter-spacing:1px;text-transform:uppercase;margin-top:.25rem;}
@media(max-width:768px){.stats-grid{grid-template-columns:repeat(2,1fr);}}
.timeline{position:relative;padding-left:2rem;}
.timeline::before{content:'';position:absolute;left:0;top:0;bottom:0;width:1px;background:linear-gradient(to bottom,var(--purple),var(--teal),transparent);}
.t-item{position:relative;padding-bottom:2.5rem;}
.t-item::before{content:'';position:absolute;left:-2rem;top:.35rem;width:10px;height:10px;border-radius:50%;background:var(--purple);box-shadow:0 0 12px rgba(180,120,255,.5);}
.t-year{font-size:11px;color:var(--purple);letter-spacing:2px;text-transform:uppercase;margin-bottom:.25rem;}
.t-title{font-weight:500;margin-bottom:.35rem;}
.t-desc{font-size:.9rem;color:var(--text-muted);line-height:1.7;}
</style>

<div class="page-hero">
  <div class="page-hero-orb"></div>
  <div>
    <p class="page-hero-label">Who I am</p>
    <h1 class="page-hero-title">The Visa Girlie<br>Behind the Magic</h1>
  </div>
</div>

<div class="section">
  <div class="about-grid">
    <div class="reveal">
      <div class="about-card">
        <div class="avatar">T</div>
        <div style="font-family:'Playfair Display',serif;font-size:1.4rem;font-weight:600;margin-bottom:.25rem;">Teemie</div>
        <div style="font-size:13px;color:var(--text-muted);margin-bottom:1rem;">✦ Travel Consultant & Visa Specialist</div>
        <div class="chips">
          <span class="chip chip-purple">Visa Expert</span>
          <span class="chip chip-teal">Project Manager</span>
          <span class="chip chip-pink">TikTok Creator</span>
          <span class="chip chip-purple">3 Years Experience</span>
          <span class="chip chip-teal">Lagos, Nigeria</span>
        </div>
        <div style="margin-top:2rem;padding:1.25rem;background:rgba(180,120,255,.07);border:1px solid rgba(180,120,255,.2);border-radius:14px;display:flex;gap:1rem;align-items:center;text-align:left;">
          <span style="font-size:1.5rem;">✈️</span>
          <div>
            <div style="font-size:.9rem;font-weight:500;">${c.about.tiktok}</div>
            <div style="font-size:12px;color:var(--text-muted);">TikTok · Travel Consultant</div>
          </div>
        </div>
      </div>
    </div>
    <div class="reveal reveal-delay-2">
      <p class="section-label">My Story</p>
      <h2 class="section-title">${c.about.title}</h2>
      <div style="color:var(--text-muted);line-height:1.85;display:flex;flex-direction:column;gap:1rem;">${c.about.body.split('<br><br>').map(p=>`<p>${p}</p>`).join('')}</div>
    </div>
  </div>

  <div class="stats-grid" style="margin-top:5rem;">
    ${[['Years Experience',c.stats.years],['Clients Helped',c.stats.clients],['Services Offered',c.stats.services],['Success Rate',c.stats.success]].map(([l,n])=>`
    <div class="stat-card reveal"><div class="stat-n">${n}</div><div class="stat-l">${l}</div></div>`).join('')}
  </div>
</div>

<div class="section" style="border-top:1px solid var(--border);">
  <p class="section-label reveal">My Journey</p>
  <h2 class="section-title reveal">How I got here</h2>
  <div class="timeline" style="margin-top:3rem;max-width:600px;">
    ${[
      ['2021','The Pivot','After my own study abroad experience did not go as planned, I decided to channel that frustration into purpose. I began learning everything about visas, travel documentation, and international admissions.'],
      ['2022','First Clients','Word of mouth spread quickly. Within months I was helping friends, family, and strangers navigate UK, Schengen, and US visa applications — with a growing success rate.'],
      ['2023','Going Full-Time','I left my corporate accounting path to become a full-time travel consultant. I expanded into flight bookings, hotel reservations, and airport transfers.'],
      ['2024','TikTok & Growth','Launched @Teemiethevisagirlie on TikTok, sharing visa tips and travel hacks. The community grew fast, bringing clients from across Nigeria and the diaspora.'],
      ['2026','Today','Over 100 clients helped, a 98% visa success rate, and a mission to make international travel accessible and stress-free for everyone. This is just the beginning.'],
    ].map(([y,t,d])=>`<div class="t-item reveal"><div class="t-year">${y}</div><div class="t-title">${t}</div><div class="t-desc">${d}</div></div>`).join('')}
  </div>
  <div style="margin-top:4rem;"><a href="/contact" class="btn-primary">Work With Me</a></div>
</div>`;
  return shell('About', body, 'about');
}

function testimonialsPage() {
  const cards = CONTENT.testimonials.map((t,i) => `
    <div class="t-card reveal reveal-delay-${(i%3)+1}">
      <div class="stars">${'★'.repeat(t.rating)}</div>
      <p class="t-text">"${t.text}"</p>
      <div class="t-meta">
        <div class="t-avatar">${t.name[0]}</div>
        <div>
          <div class="t-name">${t.name}</div>
          <div class="t-loc">✈️ ${t.location}</div>
        </div>
      </div>
    </div>`).join('');

  const body = `
<style>
.t-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:1.5rem;}
.t-card{background:var(--bg2);border:1px solid var(--border);border-radius:20px;padding:2rem;display:flex;flex-direction:column;gap:1rem;transition:.3s;}
.t-card:hover{border-color:rgba(180,120,255,.3);transform:translateY(-3px);}
.stars{color:var(--amber);font-size:1rem;letter-spacing:2px;}
.t-text{font-family:'Playfair Display',serif;font-style:italic;font-size:1rem;line-height:1.7;color:var(--text);flex:1;}
.t-meta{display:flex;gap:1rem;align-items:center;margin-top:.5rem;}
.t-avatar{width:44px;height:44px;border-radius:50%;background:linear-gradient(135deg,var(--purple),var(--teal));display:flex;align-items:center;justify-content:center;font-weight:700;font-size:1.1rem;color:#0a0a0f;flex-shrink:0;}
.t-name{font-weight:500;font-size:.9rem;}
.t-loc{font-size:12px;color:var(--text-muted);}
.trust-bar{display:flex;gap:3rem;justify-content:center;flex-wrap:wrap;padding:4rem 2rem;border-top:1px solid var(--border);border-bottom:1px solid var(--border);}
.trust-item{text-align:center;}
.trust-n{font-family:'Playfair Display',serif;font-size:3rem;font-weight:700;background:linear-gradient(135deg,var(--purple),var(--teal));-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;}
.trust-l{font-size:12px;color:var(--text-faint);letter-spacing:1px;text-transform:uppercase;margin-top:.25rem;}
</style>

<div class="page-hero">
  <div class="page-hero-orb"></div>
  <div>
    <p class="page-hero-label">Client Reviews</p>
    <h1 class="page-hero-title">Real Stories,<br>Real Results</h1>
  </div>
</div>

<div class="trust-bar">
  ${[['100+','Clients Served'],['98%','Visa Success Rate'],['3+','Years Experience'],['6+','Services']].map(([n,l])=>`<div class="trust-item reveal"><div class="trust-n">${n}</div><div class="trust-l">${l}</div></div>`).join('')}
</div>

<div class="section">
  <p class="section-label reveal">Testimonials</p>
  <h2 class="section-title reveal">What clients say</h2>
  <div class="t-grid" style="margin-top:3rem;">${cards}</div>
  <div style="text-align:center;margin-top:5rem;">
    <p style="color:var(--text-muted);margin-bottom:2rem;">Ready to join hundreds of happy travellers?</p>
    <a href="/contact" class="btn-primary">Start Your Journey</a>
  </div>
</div>`;
  return shell('Testimonials', body, 'testimonials');
}

function blogPage() {
  const posts = CONTENT.blog.map((p,i) => `
    <article class="post-card reveal reveal-delay-${(i%2)+1}">
      <div class="post-tag">${p.tag}</div>
      <h3 class="post-title">${p.title}</h3>
      <p class="post-excerpt">${p.excerpt}</p>
      <div class="post-footer">
        <span class="post-date">${p.date}</span>
        <span class="post-read">${p.read}</span>
      </div>
    </article>`).join('');

  const body = `
<style>
.post-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:1.5rem;}
.post-card{background:var(--bg2);border:1px solid var(--border);border-radius:20px;padding:2rem;display:flex;flex-direction:column;gap:.75rem;transition:.3s;cursor:pointer;}
.post-card:hover{border-color:rgba(180,120,255,.35);transform:translateY(-3px);}
.post-tag{display:inline-block;font-size:11px;font-weight:500;letter-spacing:2px;text-transform:uppercase;color:var(--purple);background:rgba(180,120,255,.12);border:1px solid rgba(180,120,255,.25);padding:4px 14px;border-radius:100px;}
.post-title{font-family:'Playfair Display',serif;font-size:1.2rem;font-weight:600;line-height:1.35;color:var(--text);}
.post-excerpt{font-size:.9rem;color:var(--text-muted);line-height:1.75;flex:1;}
.post-footer{display:flex;justify-content:space-between;align-items:center;margin-top:.5rem;}
.post-date{font-size:12px;color:var(--text-faint);}
.post-read{font-size:12px;color:var(--teal);}
</style>

<div class="page-hero">
  <div class="page-hero-orb"></div>
  <div>
    <p class="page-hero-label">Travel Knowledge</p>
    <h1 class="page-hero-title">Tips, Guides<br>& Travel Truths</h1>
  </div>
</div>

<div class="section">
  <p class="section-label reveal">Latest Posts</p>
  <h2 class="section-title reveal">The Visa Girlie Blog</h2>
  <p class="section-subtitle reveal">Real advice from someone who's seen it all — visa rejections, last-minute bookings, and everything in between.</p>
  <div class="post-grid">${posts}</div>
  <div style="text-align:center;margin-top:5rem;">
    <p style="color:var(--text-muted);margin-bottom:2rem;">Have a specific travel question? Let's talk.</p>
    <a href="/contact" class="btn-primary">Get Personal Advice</a>
  </div>
</div>`;
  return shell('Blog', body, 'blog');
}

function faqPage() {
  const items = CONTENT.faq.map((f,i) => `
    <div class="faq-item reveal" onclick="this.classList.toggle('open')">
      <div class="faq-q">
        <span>${f.q}</span>
        <span class="faq-icon">+</span>
      </div>
      <div class="faq-a">${f.a}</div>
    </div>`).join('');

  const body = `
<style>
.faq-item{background:var(--bg2);border:1px solid var(--border);border-radius:16px;overflow:hidden;transition:.3s;cursor:pointer;}
.faq-item:hover{border-color:rgba(180,120,255,.3);}
.faq-item.open{border-color:rgba(180,120,255,.4);}
.faq-q{display:flex;justify-content:space-between;align-items:center;gap:1rem;padding:1.5rem 2rem;font-size:1rem;font-weight:500;}
.faq-icon{font-size:1.5rem;color:var(--purple);flex-shrink:0;transition:transform .3s;line-height:1;}
.faq-item.open .faq-icon{transform:rotate(45deg);}
.faq-a{font-size:.9rem;color:var(--text-muted);line-height:1.75;max-height:0;overflow:hidden;transition:max-height .4s ease,padding .3s;}
.faq-item.open .faq-a{max-height:300px;padding:0 2rem 1.5rem;}
.faq-list{display:flex;flex-direction:column;gap:1rem;max-width:760px;margin:0 auto;}
</style>

<div class="page-hero">
  <div class="page-hero-orb"></div>
  <div>
    <p class="page-hero-label">Got Questions?</p>
    <h1 class="page-hero-title">Frequently<br>Asked Questions</h1>
  </div>
</div>

<div class="section">
  <p class="section-label reveal" style="justify-content:center;">FAQ</p>
  <h2 class="section-title reveal" style="text-align:center;margin-bottom:3rem;">Everything you need to know</h2>
  <div class="faq-list">${items}</div>
  <div style="text-align:center;margin-top:5rem;padding:3rem;background:var(--bg2);border:1px solid var(--border);border-radius:24px;max-width:600px;margin:5rem auto 0;">
    <p style="font-family:'Playfair Display',serif;font-size:1.5rem;margin-bottom:1rem;">Still have questions?</p>
    <p style="color:var(--text-muted);margin-bottom:2rem;">Every journey is unique. Reach out and let's figure out exactly what you need.</p>
    <a href="/contact" class="btn-primary">Get in Touch</a>
  </div>
</div>`;
  return shell('FAQ', body, 'faq');
}

function contactPage() {
  const c = CONTENT.contact;
  const channels = [
    { icon:'💬', label:'WhatsApp', href: c.whatsapp, desc:'Fastest response — usually within the hour' },
    { icon:'🎵', label:'TikTok', href: c.tiktok, desc:'@Teemiethevisagirlie — DMs open' },
    { icon:'✉️', label:'Email', href:`mailto:${c.email}`, desc: c.email },
    { icon:'📸', label:'Instagram', href: c.instagram, desc:'Follow for travel tips and updates' },
  ];

  const body = `
<style>
.contact-grid{display:grid;grid-template-columns:1fr 1fr;gap:4rem;align-items:start;}
@media(max-width:768px){.contact-grid{grid-template-columns:1fr;}}
.channel-grid{display:grid;grid-template-columns:1fr 1fr;gap:1rem;}
.ch-btn{display:flex;align-items:center;gap:1rem;padding:1.25rem 1.5rem;background:var(--bg2);border:1px solid var(--border);border-radius:16px;text-decoration:none;transition:.3s;color:var(--text);}
.ch-btn:hover{border-color:rgba(180,120,255,.4);transform:translateY(-2px);}
.ch-icon{font-size:1.6rem;width:44px;text-align:center;}
.ch-label{font-size:.9rem;font-weight:500;}
.ch-desc{font-size:12px;color:var(--text-muted);margin-top:.15rem;}
.form-group{display:flex;flex-direction:column;gap:.5rem;}
label{font-size:13px;color:var(--text-muted);letter-spacing:.5px;}
input,textarea,select{background:var(--bg2);border:1px solid var(--border);border-radius:12px;padding:12px 16px;color:var(--text);font-family:'DM Sans',sans-serif;font-size:.9rem;outline:none;transition:border-color .2s;width:100%;}
input:focus,textarea:focus,select:focus{border-color:rgba(180,120,255,.5);}
textarea{min-height:140px;resize:vertical;}
select option{background:var(--bg2);}
</style>

<div class="page-hero">
  <div class="page-hero-orb"></div>
  <div>
    <p class="page-hero-label">Let's Connect</p>
    <h1 class="page-hero-title">Ready to Start<br>Your Journey?</h1>
  </div>
</div>

<div class="section">
  <div class="contact-grid">
    <div class="reveal">
      <p class="section-label">Reach Out</p>
      <h2 class="section-title">Get in touch</h2>
      <p style="color:var(--text-muted);line-height:1.8;margin-bottom:2rem;">Whether you need visa assistance, a hotel, a flight, or just don't know where to start — I'm here to help. Pick the channel that works best for you.</p>
      <div class="channel-grid">
        ${channels.map(ch=>`<a href="${ch.href}" target="_blank" class="ch-btn"><span class="ch-icon">${ch.icon}</span><div><div class="ch-label">${ch.label}</div><div class="ch-desc">${ch.desc}</div></div></a>`).join('')}
      </div>
      <div style="margin-top:2.5rem;padding:1.5rem;background:rgba(180,120,255,.05);border:1px solid rgba(180,120,255,.2);border-radius:16px;">
        <p style="font-size:.9rem;color:var(--text-muted);line-height:1.7;">⚡ <strong style="color:var(--text);">Quick responses</strong> — I typically reply within a few hours on WhatsApp. For detailed enquiries, email is best.</p>
      </div>
    </div>

    <div class="reveal reveal-delay-2">
      <div style="background:var(--bg2);border:1px solid var(--border);border-radius:24px;padding:2.5rem;">
        <h3 style="font-family:'Playfair Display',serif;font-size:1.4rem;margin-bottom:.5rem;">Send a message</h3>
        <p style="font-size:.9rem;color:var(--text-muted);margin-bottom:2rem;">Fill in the form and I'll get back to you promptly.</p>
        <form id="contactForm" style="display:flex;flex-direction:column;gap:1.25rem;" onsubmit="handleSubmit(event)">
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem;">
            <div class="form-group"><label>First Name</label><input type="text" placeholder="Ada" required></div>
            <div class="form-group"><label>Last Name</label><input type="text" placeholder="Obi" required></div>
          </div>
          <div class="form-group"><label>Email</label><input type="email" placeholder="you@example.com" required></div>
          <div class="form-group"><label>Service Needed</label>
            <select>
              <option value="">Select a service</option>
              ${CONTENT.services.map(s=>`<option>${s.name}</option>`).join('')}
              <option>Not sure yet</option>
            </select>
          </div>
          <div class="form-group"><label>Message</label><textarea placeholder="Tell me about your travel plans, destination, timeline..."></textarea></div>
          <button type="submit" class="btn-primary" style="width:100%;justify-content:center;">Send Message ✉️</button>
        </form>
        <div id="formSuccess" style="display:none;text-align:center;padding:2rem;">
          <div style="font-size:3rem;margin-bottom:1rem;">✅</div>
          <h4 style="font-family:'Playfair Display',serif;font-size:1.3rem;margin-bottom:.5rem;">Message sent!</h4>
          <p style="color:var(--text-muted);font-size:.9rem;">I'll get back to you as soon as possible. Talk soon! 🌍</p>
        </div>
      </div>
    </div>
  </div>
</div>

<script>
async function handleSubmit(e){
  e.preventDefault();
  const form=e.target;
  const btn=form.querySelector('button[type=submit]');
  btn.textContent='Sending...';btn.disabled=true;
  try{
    const data={
      name:(form.querySelector('input[type=text]').value+' '+(form.querySelectorAll('input[type=text]')[1]?.value||'')).trim(),
      email:form.querySelector('input[type=email]').value,
      service:form.querySelector('select').value||'Not specified',
      message:form.querySelector('textarea').value
    };
    await fetch('/enquiry',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)});
  }catch(err){console.warn('Enquiry log failed',err);}
  document.getElementById('contactForm').style.display='none';
  document.getElementById('formSuccess').style.display='block';
}
</script>`;
  return shell('Contact', body, 'contact');
}

// ═══════════════════════════════════════════════════════════
// ADMIN DASHBOARD
// ═══════════════════════════════════════════════════════════

function adminLoginPage(error='') {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>Admin Login — Teemie</title>
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,600;1,400&family=DM+Sans:wght@300;400;500&display=swap" rel="stylesheet">
<style>
${CSS_VARS}
*{margin:0;padding:0;box-sizing:border-box;}
body{font-family:'DM Sans',sans-serif;background:var(--bg);color:var(--text);min-height:100vh;display:flex;align-items:center;justify-content:center;}
.card{background:var(--bg2);border:1px solid var(--border);border-radius:24px;padding:3rem;width:100%;max-width:400px;}
h1{font-family:'Playfair Display',serif;font-size:1.8rem;margin-bottom:.5rem;}
p{color:var(--text-muted);font-size:.9rem;margin-bottom:2rem;}
label{display:block;font-size:13px;color:var(--text-muted);margin-bottom:.5rem;}
input{width:100%;background:var(--bg3);border:1px solid var(--border);border-radius:12px;padding:12px 16px;color:var(--text);font-family:'DM Sans',sans-serif;font-size:.9rem;outline:none;margin-bottom:1.5rem;}
input:focus{border-color:rgba(180,120,255,.5);}
button{width:100%;background:linear-gradient(135deg,var(--purple),var(--teal));color:#0a0a0f;font-weight:500;padding:13px;border-radius:100px;border:none;font-size:15px;cursor:pointer;}
.error{color:var(--pink);font-size:13px;margin-bottom:1rem;}
</style>
</head>
<body>
<div class="card">
  <h1>Admin</h1>
  <p>Access the Teemie website dashboard</p>
  ${error ? `<p class="error">⚠️ ${error}</p>` : ''}
  <form method="POST" action="/admin/login">
    <label>Password</label>
    <input type="password" name="password" placeholder="Enter admin password" autofocus>
    <button type="submit">Sign In →</button>
  </form>
</div>
</body></html>`;
}

function adminDashboard() {
  const c = CONTENT;
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>Admin Dashboard — Teemie</title>
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,600&family=DM+Sans:wght@300;400;500&display=swap" rel="stylesheet">
<style>
${CSS_VARS}
*{margin:0;padding:0;box-sizing:border-box;}
body{font-family:'DM Sans',sans-serif;background:var(--bg);color:var(--text);min-height:100vh;}
.admin-layout{display:flex;min-height:100vh;}
.sidebar{width:240px;background:var(--bg2);border-right:1px solid var(--border);padding:2rem 0;display:flex;flex-direction:column;position:fixed;top:0;left:0;bottom:0;z-index:100;}
.sidebar-logo{font-family:'Playfair Display',serif;font-size:1rem;padding:0 1.5rem 2rem;border-bottom:1px solid var(--border);color:var(--text);}
.sidebar-logo span{display:block;font-size:11px;color:var(--text-faint);letter-spacing:1px;font-family:'DM Sans',sans-serif;font-style:normal;margin-top:.25rem;}
.nav-section{padding:.75rem 1.5rem .25rem;font-size:11px;color:var(--text-faint);letter-spacing:2px;text-transform:uppercase;}
.sidebar-nav{list-style:none;padding:.5rem 0;}
.sidebar-nav li a{display:flex;align-items:center;gap:.75rem;padding:.6rem 1.5rem;font-size:13.5px;color:var(--text-muted);text-decoration:none;transition:.2s;cursor:pointer;}
.sidebar-nav li a:hover,.sidebar-nav li a.active{color:var(--text);background:rgba(180,120,255,.1);}
.sidebar-nav li a .icon{font-size:1rem;width:20px;text-align:center;}
.sidebar-footer{margin-top:auto;padding:1.5rem;}
.sidebar-footer a{font-size:13px;color:var(--text-faint);text-decoration:none;display:flex;align-items:center;gap:.5rem;}
.sidebar-footer a:hover{color:var(--text);}
.main{margin-left:240px;flex:1;}
.topbar{background:var(--bg2);border-bottom:1px solid var(--border);padding:1rem 2.5rem;display:flex;justify-content:space-between;align-items:center;position:sticky;top:0;z-index:50;}
.topbar-title{font-size:1rem;font-weight:500;}
.topbar-right{display:flex;gap:1rem;align-items:center;}
.badge-live{font-size:11px;background:rgba(125,232,208,.12);border:1px solid rgba(125,232,208,.3);color:var(--teal);padding:4px 12px;border-radius:100px;}
.content{padding:2.5rem;}
.panel{display:none;}
.panel.active{display:block;}
.card{background:var(--bg2);border:1px solid var(--border);border-radius:20px;padding:2rem;margin-bottom:1.5rem;}
.card-title{font-family:'Playfair Display',serif;font-size:1.1rem;margin-bottom:1.5rem;padding-bottom:1rem;border-bottom:1px solid var(--border);}
.form-row{display:grid;grid-template-columns:1fr 1fr;gap:1rem;margin-bottom:1rem;}
.form-group{display:flex;flex-direction:column;gap:.4rem;margin-bottom:1rem;}
label{font-size:12px;color:var(--text-muted);letter-spacing:.5px;}
input[type=text],input[type=url],input[type=email],textarea,select{background:var(--bg3);border:1px solid var(--border);border-radius:10px;padding:10px 14px;color:var(--text);font-family:'DM Sans',sans-serif;font-size:.875rem;outline:none;width:100%;transition:border-color .2s;}
input:focus,textarea:focus,select:focus{border-color:rgba(180,120,255,.5);}
textarea{resize:vertical;min-height:100px;}
.btn{display:inline-flex;align-items:center;gap:.5rem;padding:10px 22px;border-radius:100px;border:none;cursor:pointer;font-family:'DM Sans',sans-serif;font-size:13.5px;font-weight:500;transition:.2s;}
.btn-save{background:linear-gradient(135deg,var(--purple),var(--teal));color:#0a0a0f;}
.btn-save:hover{opacity:.85;}
.btn-danger{background:rgba(255,107,157,.15);border:1px solid rgba(255,107,157,.3);color:var(--pink);}
.btn-danger:hover{background:rgba(255,107,157,.25);}
.btn-add{background:rgba(180,120,255,.12);border:1px solid rgba(180,120,255,.3);color:var(--purple);}
.btn-add:hover{background:rgba(180,120,255,.2);}
.list-item{background:var(--bg3);border:1px solid var(--border);border-radius:14px;padding:1.25rem 1.5rem;margin-bottom:.75rem;display:flex;gap:1rem;align-items:flex-start;}
.list-item-body{flex:1;display:flex;flex-direction:column;gap:.5rem;}
.list-item-actions{display:flex;gap:.5rem;flex-shrink:0;}
.toast{position:fixed;top:2rem;right:2rem;background:var(--bg2);border:1px solid rgba(125,232,208,.4);color:var(--teal);padding:1rem 1.5rem;border-radius:14px;font-size:.9rem;z-index:9999;transform:translateY(-10px);opacity:0;transition:.3s;pointer-events:none;}
.toast.show{transform:translateY(0);opacity:1;}
.overview-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:1rem;margin-bottom:2rem;}
.stat-tile{background:var(--bg2);border:1px solid var(--border);border-radius:16px;padding:1.5rem;}
.stat-tile-n{font-family:'Playfair Display',serif;font-size:2.2rem;font-weight:700;background:linear-gradient(135deg,var(--purple),var(--teal));-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;}
.stat-tile-l{font-size:11px;color:var(--text-faint);letter-spacing:1px;text-transform:uppercase;margin-top:.25rem;}
.page-links{display:grid;grid-template-columns:repeat(3,1fr);gap:1rem;}
.page-link{background:var(--bg2);border:1px solid var(--border);border-radius:16px;padding:1.25rem;text-decoration:none;color:var(--text);display:flex;align-items:center;gap:.75rem;transition:.2s;}
.page-link:hover{border-color:rgba(180,120,255,.35);}
.page-link-icon{font-size:1.3rem;}
</style>
</head>
<body>
<div id="toast" class="toast">✓ Changes saved successfully</div>
<div class="admin-layout">
<aside class="sidebar">
  <div class="sidebar-logo">Admin Panel<span>Teemie · The Visa Girlie</span></div>
  <p class="nav-section">Content</p>
  <ul class="sidebar-nav">
    <li><a onclick="show('overview')" class="active" id="nav-overview"><span class="icon">🏠</span>Overview</a></li>
    <li><a onclick="show('hero')" id="nav-hero"><span class="icon">✨</span>Hero Section</a></li>
    <li><a onclick="show('services')" id="nav-services"><span class="icon">⚙️</span>Services</a></li>
    <li><a onclick="show('about')" id="nav-about"><span class="icon">👤</span>About</a></li>
    <li><a onclick="show('testimonials')" id="nav-testimonials"><span class="icon">⭐</span>Testimonials</a></li>
    <li><a onclick="show('blog')" id="nav-blog"><span class="icon">📝</span>Blog Posts</a></li>
    <li><a onclick="show('faq')" id="nav-faq"><span class="icon">❓</span>FAQ</a></li>
    <li><a onclick="show('contact')" id="nav-contact"><span class="icon">📬</span>Contact Info</a></li>
    <li><a onclick="show('misc')" id="nav-misc"><span class="icon">🔧</span>Misc / Quote</a></li>
    <li><a onclick="show('enquiries')" id="nav-enquiries"><span class="icon">📥</span>Enquiries</a></li>
  </ul>
  <div class="sidebar-footer">
    <a href="/" target="_blank">↗ View Website</a>
  </div>
</aside>

<div class="main">
<div class="topbar">
  <div class="topbar-title" id="topbarTitle">Overview</div>
  <div class="topbar-right">
    <span class="badge-live">● Live Site</span>
    <a href="/admin/logout" style="font-size:13px;color:var(--text-muted);text-decoration:none;">Sign Out</a>
  </div>
</div>

<div class="content">

<!-- OVERVIEW -->
<div class="panel active" id="panel-overview">
  <div class="overview-grid">
    <div class="stat-tile"><div class="stat-tile-n" id="ov-years"></div><div class="stat-tile-l">Years Experience</div></div>
    <div class="stat-tile"><div class="stat-tile-n" id="ov-clients"></div><div class="stat-tile-l">Clients Helped</div></div>
    <div class="stat-tile"><div class="stat-tile-n" id="ov-services"></div><div class="stat-tile-l">Services Listed</div></div>
    <div class="stat-tile"><div class="stat-tile-n" id="ov-reviews"></div><div class="stat-tile-l">Testimonials</div></div>
  </div>
  <div class="card">
    <div class="card-title">Quick Navigation — All Pages</div>
    <div class="page-links">
      ${[['🏠','Home','/'],['⚙️','Services','/services'],['👤','About','/about'],['📝','Blog','/blog'],['⭐','Reviews','/testimonials'],['❓','FAQ','/faq'],['📬','Contact','/contact']].map(([i,l,h])=>`<a href="${h}" target="_blank" class="page-link"><span class="page-link-icon">${i}</span>${l} ↗</a>`).join('')}
    </div>
  </div>
  <div class="card" style="background:rgba(180,120,255,.05);border-color:rgba(180,120,255,.2);">
    <div style="font-size:.9rem;color:var(--text-muted);line-height:1.7;">
      <strong style="color:var(--purple);">✦ Admin Guide</strong><br>
      Use the sidebar to navigate sections. All changes save instantly and are reflected live on the website. 
      The site runs entirely in-memory — restart the server to reset to defaults.
    </div>
  </div>
</div>

<!-- HERO -->
<div class="panel" id="panel-hero">
  <div class="card">
    <div class="card-title">Hero Section</div>
    <div class="form-group"><label>Badge Text</label><input type="text" id="h-badge"></div>
    <div class="form-row">
      <div class="form-group"><label>Name</label><input type="text" id="h-name"></div>
      <div class="form-group"><label>Tagline (italic)</label><input type="text" id="h-tagline"></div>
    </div>
    <div class="form-group"><label>Subtitle</label><textarea id="h-subtitle" style="min-height:80px;"></textarea></div>
    <div class="form-row">
      <div class="form-group"><label>Primary CTA Button</label><input type="text" id="h-cta1"></div>
      <div class="form-group"><label>Secondary CTA Button</label><input type="text" id="h-cta2"></div>
    </div>
    <button class="btn btn-save" onclick="saveHero()">Save Hero</button>
  </div>
</div>

<!-- SERVICES -->
<div class="panel" id="panel-services">
  <div class="card">
    <div class="card-title">Services</div>
    <div id="servicesList"></div>
    <button class="btn btn-add" onclick="addService()">+ Add Service</button>
  </div>
</div>

<!-- ABOUT -->
<div class="panel" id="panel-about">
  <div class="card">
    <div class="card-title">About Page</div>
    <div class="form-group"><label>Section Title</label><input type="text" id="a-title"></div>
    <div class="form-group"><label>Body Text (HTML allowed)</label><textarea id="a-body" style="min-height:160px;"></textarea></div>
    <div class="form-row">
      <div class="form-group"><label>TikTok Handle</label><input type="text" id="a-tiktok"></div>
      <div class="form-group"><label>Location</label><input type="text" id="a-location"></div>
    </div>
    <div class="card-title" style="margin-top:1rem;">Stats</div>
    <div class="form-row">
      <div class="form-group"><label>Years Experience</label><input type="text" id="st-years"></div>
      <div class="form-group"><label>Clients Helped</label><input type="text" id="st-clients"></div>
    </div>
    <div class="form-row">
      <div class="form-group"><label>Services</label><input type="text" id="st-services"></div>
      <div class="form-group"><label>Success Rate</label><input type="text" id="st-success"></div>
    </div>
    <button class="btn btn-save" onclick="saveAbout()">Save About</button>
  </div>
</div>

<!-- TESTIMONIALS -->
<div class="panel" id="panel-testimonials">
  <div class="card">
    <div class="card-title">Testimonials</div>
    <div id="testimonialsList"></div>
    <button class="btn btn-add" onclick="addTestimonial()">+ Add Testimonial</button>
  </div>
</div>

<!-- BLOG -->
<div class="panel" id="panel-blog">
  <div class="card">
    <div class="card-title">Blog Posts</div>
    <div id="blogList"></div>
    <button class="btn btn-add" onclick="addPost()">+ Add Post</button>
  </div>
</div>

<!-- FAQ -->
<div class="panel" id="panel-faq">
  <div class="card">
    <div class="card-title">FAQ</div>
    <div id="faqList"></div>
    <button class="btn btn-add" onclick="addFaq()">+ Add FAQ Item</button>
  </div>
</div>

<!-- CONTACT -->
<div class="panel" id="panel-contact">
  <div class="card">
    <div class="card-title">Contact Information</div>
    <div class="form-group"><label>WhatsApp URL</label><input type="url" id="c-wa"></div>
    <div class="form-group"><label>TikTok URL</label><input type="url" id="c-tt"></div>
    <div class="form-group"><label>Email</label><input type="email" id="c-em"></div>
    <div class="form-group"><label>Instagram URL</label><input type="url" id="c-ig"></div>
    <button class="btn btn-save" onclick="saveContact()">Save Contact</button>
  </div>
</div>

<!-- MISC -->
<div class="panel" id="panel-misc">
  <div class="card">
    <div class="card-title">Quote</div>
    <div class="form-group"><label>Quote Text</label><textarea id="m-quote" style="min-height:80px;"></textarea></div>
    <button class="btn btn-save" onclick="saveMisc()">Save Quote</button>
  </div>
  <div class="card">
    <div class="card-title">Marquee Items</div>
    <div id="marqueeList"></div>
    <button class="btn btn-add" onclick="addMarquee()">+ Add Item</button>
    <button class="btn btn-save" style="margin-left:.75rem;" onclick="saveMarquee()">Save Marquee</button>
  </div>
</div>

<!-- ENQUIRIES -->
<div class="panel" id="panel-enquiries">
  <div class="card">
    <div class="card-title">Contact Form Enquiries <span id="enq-count" style="font-family:'DM Sans',sans-serif;font-size:.8rem;color:var(--text-faint);font-weight:400;margin-left:.5rem;"></span></div>
    <div id="enquiriesList"><p style="color:var(--text-faint);font-size:.9rem;">No enquiries yet.</p></div>
  </div>
</div>

</div><!-- content -->
</div><!-- main -->
</div><!-- layout -->

<script>
const DATA = ${JSON.stringify(c)};

function toast(msg='Changes saved!'){
  const t=document.getElementById('toast');t.textContent='✓ '+msg;t.classList.add('show');
  setTimeout(()=>t.classList.remove('show'),2500);
}

function show(panel){
  document.querySelectorAll('.panel').forEach(p=>p.classList.remove('active'));
  document.querySelectorAll('.sidebar-nav a').forEach(a=>a.classList.remove('active'));
  document.getElementById('panel-'+panel).classList.add('active');
  document.getElementById('nav-'+panel).classList.add('active');
  document.getElementById('topbarTitle').textContent={
    overview:'Overview',hero:'Hero Section',services:'Services',
    about:'About Page',testimonials:'Testimonials',blog:'Blog Posts',
    faq:'FAQ',contact:'Contact Info',misc:'Misc / Quote',enquiries:'Enquiries'
  }[panel]||panel;
}

async function api(endpoint,data){
  const r=await fetch(endpoint,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)});
  return r.json();
}

// Overview
function loadOverview(){
  document.getElementById('ov-years').textContent=DATA.stats.years;
  document.getElementById('ov-clients').textContent=DATA.stats.clients;
  document.getElementById('ov-services').textContent=DATA.services.length;
  document.getElementById('ov-reviews').textContent=DATA.testimonials.length;
}

// Hero
function loadHero(){
  const h=DATA.hero;
  document.getElementById('h-badge').value=h.badge;
  document.getElementById('h-name').value=h.name;
  document.getElementById('h-tagline').value=h.tagline;
  document.getElementById('h-subtitle').value=h.subtitle;
  document.getElementById('h-cta1').value=h.cta_primary;
  document.getElementById('h-cta2').value=h.cta_secondary;
}
async function saveHero(){
  await api('/admin/save/hero',{badge:document.getElementById('h-badge').value,name:document.getElementById('h-name').value,tagline:document.getElementById('h-tagline').value,subtitle:document.getElementById('h-subtitle').value,cta_primary:document.getElementById('h-cta1').value,cta_secondary:document.getElementById('h-cta2').value});
  toast('Hero saved!');
}

// About
function loadAbout(){
  document.getElementById('a-title').value=DATA.about.title;
  document.getElementById('a-body').value=DATA.about.body;
  document.getElementById('a-tiktok').value=DATA.about.tiktok;
  document.getElementById('a-location').value=DATA.about.location;
  document.getElementById('st-years').value=DATA.stats.years;
  document.getElementById('st-clients').value=DATA.stats.clients;
  document.getElementById('st-services').value=DATA.stats.services;
  document.getElementById('st-success').value=DATA.stats.success;
}
async function saveAbout(){
  await api('/admin/save/about',{about:{title:document.getElementById('a-title').value,body:document.getElementById('a-body').value,tiktok:document.getElementById('a-tiktok').value,location:document.getElementById('a-location').value},stats:{years:document.getElementById('st-years').value,clients:document.getElementById('st-clients').value,services:document.getElementById('st-services').value,success:document.getElementById('st-success').value}});
  toast('About saved!');
}

// Services
function loadServices(){
  const el=document.getElementById('servicesList');
  el.innerHTML=DATA.services.map((s,i)=>'<div class="list-item" id="svc-'+i+'"><div class="list-item-body"><div style="display:grid;grid-template-columns:60px 1fr 1fr;gap:.75rem;align-items:center;margin-bottom:.5rem;"><input type="text" value="'+s.emoji.replace(/"/g,'&quot;')+'" placeholder="Emoji" id="se-'+i+'"><input type="text" value="'+s.name.replace(/"/g,'&quot;')+'" placeholder="Name" id="sn-'+i+'"><input type="text" value="'+s.accent+'" placeholder="#color" id="sa-'+i+'"></div><textarea id="sd-'+i+'" style="min-height:70px;">'+s.desc+'</textarea></div><div class="list-item-actions"><button class="btn btn-save" onclick="saveService('+i+')">Save</button><button class="btn btn-danger" onclick="deleteService('+i+')">✕</button></div></div>').join('');
}
async function saveService(i){
  DATA.services[i]={...DATA.services[i],emoji:document.getElementById('se-'+i).value,name:document.getElementById('sn-'+i).value,accent:document.getElementById('sa-'+i).value,desc:document.getElementById('sd-'+i).value};
  await api('/admin/save/services',DATA.services);toast('Service saved!');
}
async function deleteService(i){
  if(!confirm('Delete this service?'))return;
  DATA.services.splice(i,1);await api('/admin/save/services',DATA.services);loadServices();toast('Service deleted');
}
function addService(){
  DATA.services.push({id:Date.now(),emoji:'✈️',name:'New Service',accent:'#b478ff',desc:'Service description here.'});
  loadServices();document.getElementById('servicesList').lastElementChild.scrollIntoView({behavior:'smooth'});
}

// Testimonials
function loadTestimonials(){
  const el=document.getElementById('testimonialsList');
  el.innerHTML=DATA.testimonials.map((t,i)=>'<div class="list-item" id="tm-'+i+'"><div class="list-item-body"><div style="display:grid;grid-template-columns:1fr 1fr 60px;gap:.75rem;margin-bottom:.5rem;"><input type="text" value="'+t.name.replace(/"/g,'&quot;')+'" placeholder="Name" id="tmn-'+i+'"><input type="text" value="'+t.location.replace(/"/g,'&quot;')+'" placeholder="Lagos - UK" id="tml-'+i+'"><input type="text" value="'+t.rating+'" placeholder="5" id="tmr-'+i+'"></div><textarea id="tmt-'+i+'" style="min-height:80px;">'+t.text+'</textarea></div><div class="list-item-actions"><button class="btn btn-save" onclick="saveTestimonial('+i+')">Save</button><button class="btn btn-danger" onclick="deleteTestimonial('+i+')">&#x2715;</button></div></div>').join('');
}
async function saveTestimonial(i){
  DATA.testimonials[i]={...DATA.testimonials[i],name:document.getElementById('tmn-'+i).value,location:document.getElementById('tml-'+i).value,rating:+document.getElementById('tmr-'+i).value,text:document.getElementById('tmt-'+i).value};
  await api('/admin/save/testimonials',DATA.testimonials);toast('Testimonial saved!');
}
async function deleteTestimonial(i){
  if(!confirm('Delete?'))return;
  DATA.testimonials.splice(i,1);await api('/admin/save/testimonials',DATA.testimonials);loadTestimonials();toast('Deleted');
}
function addTestimonial(){DATA.testimonials.push({id:Date.now(),name:'Client Name',location:'Lagos → Destination',rating:5,text:'Add review text here.'});loadTestimonials();}

// Blog
function loadBlog(){
  const el=document.getElementById('blogList');
  el.innerHTML=DATA.blog.map((p,i)=>'<div class="list-item"><div class="list-item-body"><div style="display:grid;grid-template-columns:1fr 1fr 100px;gap:.75rem;margin-bottom:.5rem;"><input type="text" value="'+p.title.replace(/"/g,'&quot;')+'" placeholder="Title" id="bt-'+i+'"><input type="text" value="'+p.tag.replace(/"/g,'&quot;')+'" placeholder="Tag" id="btag-'+i+'"><input type="text" value="'+p.date.replace(/"/g,'&quot;')+'" placeholder="Date" id="bd-'+i+'"></div><div style="display:grid;grid-template-columns:1fr 100px;gap:.75rem;"><textarea id="be-'+i+'" style="min-height:60px;">'+p.excerpt+'</textarea><input type="text" value="'+p.read.replace(/"/g,'&quot;')+'" placeholder="5 min read" id="br-'+i+'"></div></div><div class="list-item-actions"><button class="btn btn-save" onclick="savePost('+i+')">Save</button><button class="btn btn-danger" onclick="deletePost('+i+')">&#x2715;</button></div></div>').join('');
}
async function savePost(i){
  DATA.blog[i]={...DATA.blog[i],title:document.getElementById('bt-'+i).value,tag:document.getElementById('btag-'+i).value,date:document.getElementById('bd-'+i).value,excerpt:document.getElementById('be-'+i).value,read:document.getElementById('br-'+i).value};
  await api('/admin/save/blog',DATA.blog);toast('Post saved!');
}
async function deletePost(i){
  if(!confirm('Delete?'))return;DATA.blog.splice(i,1);await api('/admin/save/blog',DATA.blog);loadBlog();toast('Deleted');
}
function addPost(){DATA.blog.unshift({id:Date.now(),tag:'Travel Tips',date:'May 2026',title:'New Blog Post',excerpt:'Post excerpt here.',read:'5 min read'});loadBlog();}

// FAQ
function loadFaq(){
  const el=document.getElementById('faqList');
  el.innerHTML=DATA.faq.map((f,i)=>'<div class="list-item"><div class="list-item-body"><input type="text" value="'+f.q.replace(/"/g,'&quot;')+'" placeholder="Question" id="fq-'+i+'" style="margin-bottom:.5rem;"><textarea id="fa-'+i+'" style="min-height:80px;">'+f.a+'</textarea></div><div class="list-item-actions"><button class="btn btn-save" onclick="saveFaq('+i+')">Save</button><button class="btn btn-danger" onclick="deleteFaq('+i+')">&#x2715;</button></div></div>').join('');
}
async function saveFaq(i){
  DATA.faq[i]={...DATA.faq[i],q:document.getElementById('fq-'+i).value,a:document.getElementById('fa-'+i).value};
  await api('/admin/save/faq',DATA.faq);toast('FAQ saved!');
}
async function deleteFaq(i){if(!confirm('Delete?'))return;DATA.faq.splice(i,1);await api('/admin/save/faq',DATA.faq);loadFaq();toast('Deleted');}
function addFaq(){DATA.faq.push({id:Date.now(),q:'New question?',a:'Answer here.'});loadFaq();}

// Contact
function loadContact(){
  document.getElementById('c-wa').value=DATA.contact.whatsapp||'';
  document.getElementById('c-tt').value=DATA.contact.tiktok||'';
  document.getElementById('c-em').value=DATA.contact.email||'';
  document.getElementById('c-ig').value=DATA.contact.instagram||'';
}
async function saveContact(){
  await api('/admin/save/contact',{whatsapp:document.getElementById('c-wa').value,tiktok:document.getElementById('c-tt').value,email:document.getElementById('c-em').value,instagram:document.getElementById('c-ig').value});
  toast('Contact saved!');
}

// Misc
function loadMisc(){
  document.getElementById('m-quote').value=DATA.quote;
  const ml=document.getElementById('marqueeList');
  ml.innerHTML=DATA.marquee.map((item,i)=>'<div style="display:flex;gap:.5rem;margin-bottom:.5rem;"><input type="text" value="'+item.replace(/"/g,'&quot;')+'" id="mq-'+i+'" style="flex:1;"><button class="btn btn-danger" onclick="deleteMarquee('+i+')" style="padding:8px 14px;">&#x2715;</button></div>').join('');
}
async function saveMisc(){
  await api('/admin/save/misc',{quote:document.getElementById('m-quote').value});toast('Quote saved!');
}
async function saveMarquee(){
  const items=DATA.marquee.map((_,i)=>document.getElementById('mq-'+i)?.value).filter(Boolean);
  await api('/admin/save/marquee',items);toast('Marquee saved!');
}
function deleteMarquee(i){DATA.marquee.splice(i,1);loadMisc();}
function addMarquee(){DATA.marquee.push('New item');loadMisc();}

// Enquiries
async function loadEnquiries(){
  try{
    const r=await fetch('/admin/enquiries');const d=await r.json();
    const el=document.getElementById('enquiriesList');
    document.getElementById('enq-count').textContent='('+d.length+' total)';
    if(!d.length){el.innerHTML='<p style="color:var(--text-faint);font-size:.9rem;">No enquiries yet. They appear here when visitors submit the contact form.</p>';return;}
    el.innerHTML=d.map(e=>'<div class="list-item" style="flex-direction:column;gap:.5rem;"><div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:.5rem;"><div><strong>'+e.name+'</strong> <span style="color:var(--text-faint);font-size:12px;">'+e.email+'</span></div><div style="display:flex;gap:.75rem;align-items:center;"><span style="background:rgba(180,120,255,.12);border:1px solid rgba(180,120,255,.2);color:var(--purple);font-size:11px;padding:3px 10px;border-radius:100px;">'+e.service+'</span><span style="font-size:11px;color:var(--text-faint);">'+new Date(e.ts).toLocaleDateString('en-NG',{day:'numeric',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'})+'</span></div></div><p style="font-size:.875rem;color:var(--text-muted);line-height:1.6;padding:.75rem;background:var(--bg3);border-radius:10px;">'+e.message+'</p></div>').join('');
  }catch(err){console.error(err);}
}

// Init
loadOverview();loadHero();loadAbout();loadServices();loadTestimonials();loadBlog();loadFaq();loadContact();loadMisc();loadEnquiries();
</script>
</body></html>`;
}

// ═══════════════════════════════════════════════════════════
// HTTP SERVER ROUTER
// ═══════════════════════════════════════════════════════════

function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try { resolve(JSON.parse(body)); }
      catch { try { resolve(Object.fromEntries(new URLSearchParams(body))); } catch { resolve({}); } }
    });
    req.on('error', reject);
  });
}

function respond(res, status, body, type='text/html; charset=utf-8') {
  res.writeHead(status, { 'Content-Type': type });
  res.end(body);
}

function respondJSON(res, data, status=200) {
  res.writeHead(status, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(data));
}

const server = http.createServer(async (req, res) => {
  const parsed = url.parse(req.url, true);
  const path = parsed.pathname;
  const method = req.method;

  // ── Public pages ──
  if (method === 'GET') {
    if (path === '/')             return respond(res, 200, homePage());
    if (path === '/services')     return respond(res, 200, servicesPage());
    if (path === '/about')        return respond(res, 200, aboutPage());
    if (path === '/testimonials') return respond(res, 200, testimonialsPage());
    if (path === '/blog')         return respond(res, 200, blogPage());
    if (path === '/faq')          return respond(res, 200, faqPage());
    if (path === '/contact')      return respond(res, 200, contactPage());

    // ── Admin routes ──
    if (path === '/admin' || path === '/admin/') {
      if (!validSession(req)) return respond(res, 200, adminLoginPage());
      return respond(res, 200, adminDashboard());
    }
    if (path === '/admin/enquiries') {
      if (!validSession(req)) return respondJSON(res, { error: 'Unauthorized' }, 401);
      return respondJSON(res, ENQUIRIES);
    }
    if (path === '/admin/content') {
      if (!validSession(req)) return respondJSON(res, { error: 'Unauthorized' }, 401);
      return respondJSON(res, CONTENT);
    }
    if (path === '/admin/logout') {
      const cookie = (req.headers.cookie || '').split(';').find(c => c.trim().startsWith('sid='));
      if (cookie) sessions.delete(cookie.trim().slice(4));
      res.writeHead(302, { 'Location': '/admin', 'Set-Cookie': 'sid=; Max-Age=0; Path=/' });
      return res.end();
    }
  }

  if (method === 'POST') {
    // Public contact form submission
    if (path === '/enquiry') {
      const body = await parseBody(req);
      logEnquiry({
        name: (body.name || 'Anonymous').slice(0, 100),
        email: (body.email || '').slice(0, 200),
        service: (body.service || 'Not specified').slice(0, 100),
        message: (body.message || '').slice(0, 2000),
      });
      return respondJSON(res, { ok: true });
    }

    // Admin login
    if (path === '/admin/login') {
      const body = await parseBody(req);
      if (body.password === ADMIN_PASSWORD) {
        const sid = createSession();
        res.writeHead(302, { 'Location': '/admin', 'Set-Cookie': `sid=${sid}; Path=/; HttpOnly; Max-Age=86400` });
        return res.end();
      }
      return respond(res, 200, adminLoginPage('Incorrect password. Try again.'));
    }

    // Admin save APIs — require auth
    if (path.startsWith('/admin/save/')) {
      if (!validSession(req)) return respondJSON(res, { error: 'Unauthorized' }, 401);
      const section = path.split('/')[3];
      const data = await parseBody(req);

      if (section === 'hero')         CONTENT.hero = data;
      if (section === 'about')        { CONTENT.about = data.about; CONTENT.stats = data.stats; }
      if (section === 'services')     CONTENT.services = data;
      if (section === 'testimonials') CONTENT.testimonials = data;
      if (section === 'blog')         CONTENT.blog = data;
      if (section === 'faq')          CONTENT.faq = data;
      if (section === 'contact')      CONTENT.contact = data;
      if (section === 'misc')         CONTENT.quote = data.quote;
      if (section === 'marquee')      CONTENT.marquee = data;

      saveContent(); // persist to disk
      return respondJSON(res, { ok: true });
    }
  }

  // 404
  respond(res, 404, shell('404', `
    <div style="min-height:80vh;display:flex;align-items:center;justify-content:center;flex-direction:column;gap:1.5rem;text-align:center;padding:2rem;">
      <div style="font-family:'Playfair Display',serif;font-size:8rem;font-weight:700;color:rgba(180,120,255,.2);">404</div>
      <h1 style="font-family:'Playfair Display',serif;font-size:2rem;">Page not found</h1>
      <p style="color:var(--text-muted);">This page doesn't exist — yet. Let's get you back on track.</p>
      <a href="/" class="btn-primary">Back to Home</a>
    </div>`));
});

server.listen(PORT, () => {
  console.log(`\n✦ Teemie The Visa Girlie — Server running`);
  console.log(`  Local:   http://localhost:${PORT}`);
  console.log(`  Admin:   http://localhost:${PORT}/admin`);
  console.log(`  Password: ${ADMIN_PASSWORD}\n`);
});

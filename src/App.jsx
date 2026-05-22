import { useState, useEffect, useRef } from "react";
import profileImg from './profile.png';
import { supabase } from './supabase';

const ADMIN_PASS = "syntaxia_dev";
const CUSTOMER_PASS = "syntaxia_reviews"; // ← change this to your preferred customer password

const CATS = [
  { id: "all", label: "All" },
  { id: "lua", label: "Roblox / Lua" },
  { id: "haxe", label: "Haxe" },
  { id: "render", label: "Renders" },
  { id: "sfx", label: "SFX" },
];

const SKILLS = [
  { icon: "🎮", name: "Roblox / Lua", desc: "Game scripting, UI systems, datastores, events" },
  { icon: "⚙️", name: "Haxe", desc: "Cross-platform game dev & tooling" },
  { icon: "🎨", name: "Render Art", desc: "3D renders, compositing & visual design" },
  { icon: "🔊", name: "SFX Design", desc: "Sound effects, ambience & audio design" },
];

const PRICING = [
  {
    name: "Simple Script",
    price: "$2+",
    per: "/ commission",
    color: "#5865f2",
    features: ["Examples:", "Combat Move", "Quality Of Life System", "Easy System"],
    cta: "Commision",
  },
  {
    name: "Standard",
    price: "$15+",
    per: "/ commission",
    color: "#a855f7",
    highlight: true,
    features: ["Examples:", "A Framework with a few systems", "A Character System", "Weapon System"],
    cta: "Most Popular!",
  },
  {
    name: "Full Game / System",
    price: "$45+",
    per: "/ commission",
    color: "#22c55e",
    features: ["Examples:", "A Full Game", "Big Systems", "Custom Systems, Customizable"],
    cta: "Commision",
  },
];

const C = {
  bg: "#0d0e11",
  surface: "#16171b",
  card: "#1e1f24",
  card2: "#25262c",
  border: "#2e2f36",
  text: "#f0f1f3",
  muted: "#8b8d97",
  dim: "#4e505a",
  white: "#ffffff",
  blurple: "#5865f2",
};

const getContribImages = (linkUrl, customImg, customIcon, type) => {
  let finalBg = customImg || "";
  let finalIcon = customIcon || "";

  const isDiscord = type === "discord" || linkUrl?.includes("discord.gg") || linkUrl?.includes("discord.com");
  const isRoblox = type === "roblox" || linkUrl?.includes("roblox.com/games");

  if (isDiscord) {
    if (!finalBg) finalBg = "linear-gradient(135deg, #2f3136 0%, #202225 100%)";
    if (!finalIcon) finalIcon = "https://cdn.prod.website-files.com/6257adef93867e50d84d30e2/636e0a6a49cf127bf92de1e2_icon_clyde_blurple_RGB.png";
  } else if (isRoblox) {
    const match = linkUrl?.match(/games\/(\d+)/);
    const placeId = match ? match[1] : null;
    if (placeId) {
      if (!finalIcon) finalIcon = `https://images.rbxcdn.com/headshots/v1/place/${placeId}/150x150.png`;
      if (!finalBg) finalBg = `https://assetgame.roblox.com/Game/Tools/ThumbnailAsset.ashx?aid=${placeId}&fmt=png&wd=420&ht=230`;
    } else {
      if (!finalBg) finalBg = "linear-gradient(135deg, #00A2FF 0%, #061926 100%)";
      if (!finalIcon) finalIcon = "🎮";
    }
  }

  if (!finalBg) finalBg = C.card2;
  return { bg: finalBg, icon: finalIcon };
};

const injectStyles = () => {
  if (document.getElementById("syn-styles")) return;
  const s = document.createElement("style");
  s.id = "syn-styles";
  s.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=Space+Mono:ital,wght@0,400;0,700;1,400&family=DM+Sans:wght@300;400;500&display=swap');
    * { box-sizing: border-box; margin: 0; padding: 0; }
    html { scroll-behavior: smooth; }
    body { background: ${C.bg}; font-family: 'DM Sans', sans-serif; color: ${C.text}; }
    ::-webkit-scrollbar { width: 6px; }
    ::-webkit-scrollbar-track { background: ${C.surface}; }
    ::-webkit-scrollbar-thumb { background: ${C.border}; border-radius: 3px; }
    input, textarea, select { font-family: inherit; }

    .nav-link {
      background: none; border: none; cursor: pointer;
      padding: 6px 12px; border-radius: 6px;
      font-family: 'DM Sans', sans-serif; font-size: 13px;
      color: ${C.muted}; transition: color 0.15s, background 0.15s;
      text-transform: capitalize;
    }
    .nav-link:hover { color: ${C.white}; background: ${C.card}; }
    .nav-link.active { color: ${C.white}; font-weight: 500; }

    .admin-btn {
      margin-left: 8px; border-radius: 6px; cursor: pointer;
      font-size: 12px; font-family: 'Space Mono', monospace;
      transition: all 0.15s; padding: 5px 12px;
    }
    .admin-btn:hover { opacity: 0.8; transform: scale(1.03); }

    .skill-card {
      background: ${C.card}; border: 1px solid ${C.border};
      border-radius: 12px; padding: 1.5rem;
      transition: border-color 0.2s, transform 0.2s, box-shadow 0.2s;
    }
    .skill-card:hover {
      border-color: ${C.blurple};
      transform: translateY(-4px);
      box-shadow: 0 8px 32px rgba(88,101,242,0.12);
    }

    .work-card {
      background: ${C.card}; border: 1px solid ${C.border};
      border-radius: 12px; overflow: hidden; cursor: pointer;
      transition: transform 0.15s, border-color 0.15s, box-shadow 0.15s;
    }
    .work-card:hover {
      transform: translateY(-4px);
      border-color: ${C.dim};
      box-shadow: 0 12px 40px rgba(0,0,0,0.3);
    }

    .contrib-card {
      background: ${C.card}; border: 1px solid ${C.border};
      border-radius: 12px; overflow: hidden; position: relative;
      display: flex; flex-direction: column;
      transition: transform 0.2s, border-color 0.2s, box-shadow 0.2s;
    }
    .contrib-card:hover {
      transform: translateY(-4px); border-color: ${C.dim};
      box-shadow: 0 12px 36px rgba(0,0,0,0.4);
    }
    .contrib-open-btn {
      background: #248046; color: #ffffff; border: none;
      padding: 10px 16px; border-radius: 4px; font-weight: 500;
      font-size: 14px; font-family: 'DM Sans', sans-serif;
      cursor: pointer; transition: background 0.15s;
      text-align: center; text-decoration: none; width: 100%; display: block;
    }
    .contrib-open-btn:hover { background: #1a6535; }

    .filter-btn {
      border-radius: 6px; cursor: pointer; font-size: 12px;
      font-family: 'Space Mono', monospace; transition: all 0.15s;
      padding: 6px 14px; border: 1px solid ${C.border};
    }
    .filter-btn:hover { border-color: ${C.muted}; color: ${C.text}; }

    .cta-btn {
      border: none; padding: 10px 24px; border-radius: 8px; cursor: pointer;
      font-weight: 600; font-size: 14px; font-family: 'DM Sans', sans-serif;
      transition: all 0.18s;
    }
    .cta-btn:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(0,0,0,0.3); opacity: 0.9; }

    .pricing-card {
      background: ${C.card}; border: 1px solid ${C.border};
      border-radius: 16px; padding: 2rem;
      transition: transform 0.2s, box-shadow 0.2s, border-color 0.2s;
      position: relative; overflow: hidden;
    }
    .pricing-card:hover { transform: translateY(-6px); box-shadow: 0 16px 48px rgba(0,0,0,0.35); }
    .pricing-card.highlight { border-color: ${C.blurple}; box-shadow: 0 0 0 1px ${C.blurple}44; }
    .pricing-card.highlight:hover { box-shadow: 0 16px 48px rgba(88,101,242,0.25); }

    .contact-link {
      display: flex; align-items: center; gap: 12px;
      padding: 14px 18px; border-radius: 10px;
      border: 1px solid ${C.border}; background: ${C.card};
      color: ${C.muted}; text-decoration: none; font-size: 14px;
      transition: all 0.18s;
    }
    .contact-link:hover {
      border-color: ${C.blurple}; color: ${C.white};
      background: ${C.card2}; transform: translateX(4px);
    }

    .del-btn:hover { background: #ef444433 !important; }
    .add-work-btn { transition: all 0.15s; }
    .add-work-btn:hover { transform: scale(1.03); opacity: 0.9; }

    /* ── Review carousel ───────────────────────────────── */
    .rev-arrow {
      width: 42px; height: 42px; border-radius: 50%;
      border: 1px solid ${C.border}; background: ${C.card};
      color: ${C.muted}; display: flex; align-items: center; justify-content: center;
      cursor: pointer; flex-shrink: 0; font-size: 20px;
      transition: background 0.15s, border-color 0.15s, color 0.15s;
    }
    .rev-arrow:hover { background: ${C.card2}; border-color: ${C.muted}; color: ${C.white}; }
    .rev-arrow:disabled { opacity: 0.3; cursor: default; }

    .rev-card {
      background: ${C.card}; border: 1px solid ${C.border};
      border-radius: 14px; padding: 1.5rem;
      animation: slideIn 0.25s ease;
    }
    @keyframes slideIn { from { opacity: 0; transform: translateX(16px); } to { opacity: 1; transform: translateX(0); } }

    .star-btn-pick {
      background: none; border: none; cursor: pointer; font-size: 26px;
      padding: 0; transition: transform 0.1s; line-height: 1;
    }
    .star-btn-pick:hover { transform: scale(1.25); }

    .rev-dot { width: 6px; height: 6px; border-radius: 50%; background: ${C.border}; transition: background 0.2s; }
    .rev-dot.active { background: ${C.blurple}; }

    .customer-login-btn {
      background: none; border: 1px solid ${C.border}; color: ${C.muted};
      padding: 7px 14px; border-radius: 8px; cursor: pointer;
      font-size: 12px; font-family: 'Space Mono', monospace;
      display: flex; align-items: center; gap: 6px;
      transition: all 0.15s;
    }
    .customer-login-btn:hover { border-color: ${C.muted}; color: ${C.white}; }
    .customer-login-btn.logged-in { border-color: #22c55e44; color: #22c55e; background: #22c55e11; }

    @keyframes fadeInUp {
      from { opacity: 0; transform: translateY(24px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .fade-in { animation: fadeInUp 0.5s ease forwards; }
  `;
  document.head.appendChild(s);
};

// ── Helpers ──────────────────────────────────────────────────────────────────
const renderStars = (rating, size = 16) =>
  Array.from({ length: 5 }, (_, i) => (
    <span key={i} style={{ color: i < rating ? "#f59e0b" : C.border, fontSize: size }}>★</span>
  ));

const avgRating = (reviews) => {
  if (!reviews.length) return 0;
  return (reviews.reduce((a, r) => a + r.rating, 0) / reviews.length).toFixed(1);
};

const formatDate = (ts) =>
  new Date(ts).toLocaleDateString("en-GB", { month: "short", year: "numeric" });

// ── Main component ────────────────────────────────────────────────────────────
export default function Portfolio() {
  const [works, setWorks] = useState([]);
  const [contribs, setContribs] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [filter, setFilter] = useState("all");
  const [isAdmin, setIsAdmin] = useState(false);
  const [isCustomer, setIsCustomer] = useState(false);
  const [modal, setModal] = useState(null);
  const [activeWork, setActiveWork] = useState(null);
  const [delId, setDelId] = useState(null);
  const [delType, setDelType] = useState("work");
  const [pw, setPw] = useState("");
  const [pwErr, setPwErr] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [revIdx, setRevIdx] = useState(0);

  const [form, setForm] = useState({ title: "", category: "lua", desc: "", imageUrl: "", videoUrl: "", tags: "" });
  const [contribForm, setContribForm] = useState({ title: "", type: "discord", desc: "", linkUrl: "", imageUrl: "", iconUrl: "" });
  const [revForm, setRevForm] = useState({ name: "", discordUser: "", rating: 0, review: "" });
  const [discordPreview, setDiscordPreview] = useState(null);
  const [fetchingDiscord, setFetchingDiscord] = useState(false);

  const [activeSection, setActiveSection] = useState("home");
  const [scrolled, setScrolled] = useState(false);

  const discordTimeout = useRef(null);

  useEffect(() => {
    injectStyles();
    loadData();

    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handleScroll, { passive: true });

    const sections = ["home", "about", "skills", "works", "contributions", "reviews", "pricing", "contact"];
    const obs = new IntersectionObserver(
      (entries) => { entries.forEach(e => { if (e.isIntersecting) setActiveSection(e.target.id); }); },
      { threshold: 0.4 }
    );
    sections.forEach(id => { const el = document.getElementById(id); if (el) obs.observe(el); });

    return () => { window.removeEventListener("scroll", handleScroll); obs.disconnect(); };
  }, []);

  // ── Load from Supabase ──────────────────────────────────────────────────
  const loadData = async () => {
    try {
      const [{ data: worksData }, { data: contribsData }, { data: reviewsData }] = await Promise.all([
        supabase.from("works").select("*").order("created_at", { ascending: false }),
        supabase.from("contribs").select("*").order("created_at", { ascending: false }),
        supabase.from("reviews").select("*").order("created_at", { ascending: false }),
      ]);
      if (worksData) setWorks(worksData);
      if (contribsData) setContribs(contribsData);
      if (reviewsData) setReviews(reviewsData);
    } catch (e) {
      console.error("Failed to load data:", e);
    }
    setLoading(false);
  };

  // ── Auth ────────────────────────────────────────────────────────────────
  const handleLogin = () => {
    if (pw === ADMIN_PASS) { setIsAdmin(true); setModal(null); setPw(""); setPwErr(false); }
    else { setPwErr(true); }
  };

  const handleCustomerLogin = () => {
    if (pw === CUSTOMER_PASS) { setIsCustomer(true); setModal(null); setPw(""); setPwErr(false); }
    else { setPwErr(true); }
  };

  const handleFileUpload = (e, callback) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => callback(event.target.result);
      reader.readAsDataURL(file);
    }
  };

  // ── Discord username lookup (Lanyard / public API) ──────────────────────
  const lookupDiscord = async (username) => {
    if (!username.trim()) { setDiscordPreview(null); return; }
    setFetchingDiscord(true);
    try {
      // Try Wumpus API (no auth needed, username search)
      const res = await fetch(`https://discord.com/api/v9/users/@me`, { method: "GET" });
      // Fallback: use a public lookup via open.discord.de or similar
      // Since direct user search requires auth, we use the invite preview trick via a proxy
      // We'll just store the username and skip avatar auto-fetch unless they provide a user ID
      // Using an unofficial proxy that returns user info from username
      const proxyRes = await fetch(`https://api.lanyard.rest/v1/users/search?q=${encodeURIComponent(username)}`);
      if (proxyRes.ok) {
        const data = await proxyRes.json();
        if (data?.data?.length > 0) {
          const u = data.data[0];
          setDiscordPreview({
            avatar: u.discord_user?.avatar
              ? `https://cdn.discordapp.com/avatars/${u.discord_user.id}/${u.discord_user.avatar}.png?size=128`
              : null,
            displayName: u.discord_user?.username || username,
          });
        } else {
          setDiscordPreview({ avatar: null, displayName: username });
        }
      } else {
        setDiscordPreview({ avatar: null, displayName: username });
      }
    } catch {
      setDiscordPreview({ avatar: null, displayName: username });
    }
    setFetchingDiscord(false);
  };

  const onDiscordChange = (val) => {
    setRevForm(f => ({ ...f, discordUser: val }));
    setDiscordPreview(null);
    clearTimeout(discordTimeout.current);
    if (val.trim().length > 1) {
      discordTimeout.current = setTimeout(() => lookupDiscord(val), 800);
    }
  };

  // ── Add Work ────────────────────────────────────────────────────────────
  const handleAdd = async () => {
    if (!form.title.trim()) return;
    setSaving(true);
    const work = {
      title: form.title.trim(),
      category: form.category,
      desc: form.desc.trim(),
      image_url: form.imageUrl.trim(),
      video_url: form.videoUrl.trim(),
      tags: form.tags.split(",").map(t => t.trim()).filter(Boolean),
      date: new Date().toLocaleDateString("en-GB", { month: "short", year: "numeric" }),
    };
    const { data, error } = await supabase.from("works").insert([work]).select().single();
    if (!error && data) setWorks(prev => [data, ...prev]);
    setForm({ title: "", category: "lua", desc: "", imageUrl: "", videoUrl: "", tags: "" });
    setModal(null);
    setSaving(false);
  };

  // ── Add Contribution ────────────────────────────────────────────────────
  const handleAddContrib = async () => {
    if (!contribForm.title.trim() || !contribForm.linkUrl.trim()) return;
    setSaving(true);

    let finalImg = contribForm.imageUrl.trim();
    let finalIcon = contribForm.iconUrl.trim();
    let memberCount = null;

    if (contribForm.type === "discord" && (!finalImg || !finalIcon)) {
      const match = contribForm.linkUrl.match(/(?:discord\.gg|discord\.com\/invite)\/([a-zA-Z0-9-]+)/);
      if (match) {
        try {
          const res = await fetch(`https://discord.com/api/v9/invites/${match[1]}?with_counts=true`);
          const data = await res.json();
          if (data.guild) {
            memberCount = data.approximate_member_count;
            if (!finalIcon && data.guild.icon) finalIcon = `https://cdn.discordapp.com/icons/${data.guild.id}/${data.guild.icon}.png?size=256`;
            if (!finalImg && data.guild.splash) finalImg = `https://cdn.discordapp.com/splashes/${data.guild.id}/${data.guild.splash}.png?size=512`;
          }
        } catch (e) { console.warn("Discord fetch failed", e); }
      }
    }

    const contrib = {
      title: contribForm.title.trim(),
      type: contribForm.type,
      desc: contribForm.desc.trim(),
      link_url: contribForm.linkUrl.trim(),
      image_url: finalImg,
      icon_url: finalIcon,
      member_count: memberCount,
    };

    const { data, error } = await supabase.from("contribs").insert([contrib]).select().single();
    if (!error && data) setContribs(prev => [data, ...prev]);
    setContribForm({ title: "", type: "discord", desc: "", linkUrl: "", imageUrl: "", iconUrl: "" });
    setModal(null);
    setSaving(false);
  };

  // ── Add Review ──────────────────────────────────────────────────────────
  const handleAddReview = async () => {
    if (!revForm.name.trim() || revForm.rating < 1 || !revForm.review.trim()) return;
    setSaving(true);

    const review = {
      name: revForm.name.trim(),
      discord_username: revForm.discordUser.trim() || null,
      discord_avatar: discordPreview?.avatar || null,
      rating: revForm.rating,
      review: revForm.review.trim(),
    };

    const { data, error } = await supabase.from("reviews").insert([review]).select().single();
    if (!error && data) {
      setReviews(prev => [data, ...prev]);
      setRevIdx(0);
    }
    setRevForm({ name: "", discordUser: "", rating: 0, review: "" });
    setDiscordPreview(null);
    setModal(null);
    setSaving(false);
  };

  // ── Delete ──────────────────────────────────────────────────────────────
  const handleDeleteItem = async () => {
    const id = delId;
    const type = delType;
    setModal(null);
    setDelId(null);

    if (type === "work") {
      setWorks(prev => prev.filter(w => w.id !== id));
      await supabase.from("works").delete().eq("id", id);
    } else if (type === "contrib") {
      setContribs(prev => prev.filter(c => c.id !== id));
      await supabase.from("contribs").delete().eq("id", id);
    } else if (type === "review") {
      setReviews(prev => prev.filter(r => r.id !== id));
      if (revIdx >= reviews.length - 1) setRevIdx(Math.max(0, reviews.length - 2));
      await supabase.from("reviews").delete().eq("id", id);
    }
  };

  const filtered = filter === "all" ? works : works.filter(w => w.category === filter);
  const navLinks = ["home", "about", "skills", "works", "contributions", "reviews", "pricing", "contact"];
  const scrollTo = (id) => { document.getElementById(id)?.scrollIntoView({ behavior: "smooth" }); };

  // ── Current review ──────────────────────────────────────────────────────
  const curReview = reviews[revIdx] || null;
  const avg = avgRating(reviews);

  return (
    <div style={{ minHeight: "100vh", background: C.bg }}>

      {/* NAV */}
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
        background: scrolled ? C.surface + "f0" : "transparent",
        backdropFilter: scrolled ? "blur(16px)" : "none",
        borderBottom: scrolled ? `1px solid ${C.border}` : "1px solid transparent",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 2rem", height: scrolled ? 48 : 60, transition: "all 0.3s ease",
      }}>
        <span style={{ fontFamily: "'Space Mono', monospace", fontWeight: 700, fontSize: scrolled ? 13 : 15, color: C.white, letterSpacing: 1, transition: "font-size 0.3s" }}>
          SYNTAXIA<span style={{ color: C.blurple }}>.</span>DEV
        </span>
        <div style={{ display: "flex", gap: 2, alignItems: "center" }}>
          {navLinks.map(id => (
            <button key={id} className={`nav-link${activeSection === id ? " active" : ""}`} onClick={() => scrollTo(id)}>{id}</button>
          ))}
        </div>
      </nav>

      {/* HERO */}
      <section id="home" style={{ minHeight: "100vh", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", textAlign: "center", padding: "4rem 2rem", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, zIndex: 0, backgroundImage: `linear-gradient(${C.border}33 1px, transparent 1px), linear-gradient(90deg, ${C.border}33 1px, transparent 1px)`, backgroundSize: "40px 40px" }} />
        <div style={{ position: "absolute", inset: 0, zIndex: 0, background: `radial-gradient(ellipse at 50% 60%, ${C.blurple}18 0%, transparent 65%)` }} />
        <div style={{ position: "relative", zIndex: 1 }} className="fade-in">
          <div style={{ width: 100, height: 100, borderRadius: "50%", background: C.card2, border: `2px solid ${C.border}`, margin: "0 auto 1.5rem", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 36, overflow: "hidden", boxShadow: `0 0 0 6px ${C.bg}, 0 0 0 7px ${C.border}` }}>
            <img src={profileImg} alt="Profile" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          </div>
          <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 11, color: C.blurple, letterSpacing: 4, marginBottom: 12, textTransform: "uppercase" }}>syntaxia_dev</div>
          <h1 style={{ fontFamily: "'Space Mono', monospace", fontWeight: 700, fontSize: "clamp(2.2rem, 5vw, 3.5rem)", color: C.white, lineHeight: 1.1, marginBottom: "1rem", letterSpacing: -1 }}>Syntaxia</h1>
          <p style={{ fontSize: 16, color: C.muted, maxWidth: 420, lineHeight: 1.7, marginBottom: "2rem" }}>Roblox Lua & Haxe developer · Render artist · SFX designer</p>
          <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap", marginBottom: "2.5rem" }}>
            {["Roblox / Lua", "Haxe", "Renders", "SFX"].map(tag => (
              <span key={tag} style={{ padding: "5px 14px", borderRadius: 20, border: `1px solid ${C.border}`, background: C.card, fontSize: 12, color: C.muted, fontFamily: "'Space Mono', monospace" }}>{tag}</span>
            ))}
          </div>
          <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
            <button className="cta-btn" onClick={() => scrollTo("works")} style={{ background: C.white, color: C.bg }}>View Works</button>
            <button className="cta-btn" onClick={() => scrollTo("contact")} style={{ background: "none", color: C.muted, border: `1px solid ${C.border}` }}>Contact Me</button>
          </div>
        </div>
      </section>

      {/* ABOUT */}
      <section id="about" style={{ padding: "6rem 2rem", maxWidth: 720, margin: "0 auto" }}>
        <Label>About</Label>
        <h2 style={{ fontFamily: "'Space Mono', monospace", fontSize: "clamp(1.4rem, 3vw, 2rem)", color: C.white, marginBottom: "1.5rem", fontWeight: 700 }}>Hey, Im Syntaxia/Syn 👋</h2>
        <p style={{ fontSize: 15, color: C.muted, lineHeight: 1.9, marginBottom: "1.2rem" }}>Im a roblox <strong style={{ color: C.text }}>Luau</strong> developer as well as a <strong style={{ color: C.text }}>Haxe</strong> programmer, <strong style={{ color: C.text }}>render artist</strong> and <strong style={{ color: C.text }}>SFX designer</strong>. I can code almost anything, starting from simple scripts to complex game systems.</p>
        <p style={{ fontSize: 15, color: C.muted, lineHeight: 1.9, marginBottom: "1.2rem" }}>I've contributed to <strong style={{ color: C.text }}>UBA</strong> (10M+ visits). I'm always working on something new - whether it's a game, a visual piece, or a SFX I make for fun.</p>
        <p style={{ fontSize: 15, color: C.muted, lineHeight: 1.9 }}>Feel free to browse my works below!</p>
      </section>

      {/* SKILLS */}
      <section id="skills" style={{ padding: "6rem 2rem", maxWidth: 900, margin: "0 auto" }}>
        <Label>Skills</Label>
        <h2 style={{ fontFamily: "'Space Mono', monospace", fontSize: "clamp(1.4rem, 3vw, 2rem)", color: C.white, marginBottom: "2rem", fontWeight: 700 }}>What I do</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16 }}>
          {SKILLS.map(s => (
            <div key={s.name} className="skill-card">
              <div style={{ fontSize: 28, marginBottom: 12 }}>{s.icon}</div>
              <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 13, color: C.white, fontWeight: 700, marginBottom: 8 }}>{s.name}</div>
              <div style={{ fontSize: 13, color: C.muted, lineHeight: 1.6 }}>{s.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* WORKS */}
      <section id="works" style={{ padding: "6rem 2rem", maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: 16, marginBottom: "2rem" }}>
          <div>
            <Label>Portfolio</Label>
            <h2 style={{ fontFamily: "'Space Mono', monospace", fontSize: "clamp(1.4rem, 3vw, 2rem)", color: C.white, fontWeight: 700 }}>Works</h2>
          </div>
          {isAdmin && (
            <button className="add-work-btn" onClick={() => setModal("add")} style={{ background: C.blurple, color: "#fff", border: "none", padding: "9px 18px", borderRadius: 8, cursor: "pointer", fontWeight: 600, fontSize: 14, display: "flex", alignItems: "center", gap: 6 }}>+ Add Work</button>
          )}
        </div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: "2rem" }}>
          {CATS.map(c => (
            <button key={c.id} className="filter-btn" onClick={() => setFilter(c.id)} style={{ background: filter === c.id ? C.white : C.card, color: filter === c.id ? C.bg : C.muted, borderColor: filter === c.id ? C.white : C.border }}>{c.label}</button>
          ))}
        </div>
        {loading ? (
          <div style={{ textAlign: "center", color: C.muted, padding: "4rem", fontFamily: "'Space Mono', monospace", fontSize: 13 }}>Loading...</div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "5rem 2rem", border: `1px dashed ${C.border}`, borderRadius: 12, color: C.dim }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>📭</div>
            <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 13 }}>{isAdmin ? "No works yet - click '+ Add Work' to get started!" : "Nothing here yet. Check back soon."}</div>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 20 }}>
            {filtered.map(work => (
              <WorkCard key={work.id} work={work} isAdmin={isAdmin}
                onClick={() => { setActiveWork(work); setModal("view_work"); }}
                onDelete={(e) => { e.stopPropagation(); setDelId(work.id); setDelType("work"); setModal("del"); }}
              />
            ))}
          </div>
        )}
      </section>

      {/* CONTRIBUTIONS */}
      <section id="contributions" style={{ padding: "6rem 2rem", maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: 16, marginBottom: "2rem" }}>
          <div>
            <Label>Experience</Label>
            <h2 style={{ fontFamily: "'Space Mono', monospace", fontSize: "clamp(1.4rem, 3vw, 2rem)", color: C.white, fontWeight: 700 }}>Contributions</h2>
          </div>
          {isAdmin && (
            <button className="add-work-btn" onClick={() => setModal("add_contrib")} style={{ background: "#22c55e", color: "#fff", border: "none", padding: "9px 18px", borderRadius: 8, cursor: "pointer", fontWeight: 600, fontSize: 14, display: "flex", alignItems: "center", gap: 6 }}>+ Add Contribution</button>
          )}
        </div>
        {contribs.length === 0 ? (
          <div style={{ textAlign: "center", padding: "4rem 2rem", border: `1px dashed ${C.border}`, borderRadius: 12, color: C.dim }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>🤝</div>
            <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 13 }}>No contributions added yet.</div>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 20 }}>
            {contribs.map((item) => {
              const media = getContribImages(item.link_url, item.image_url, item.icon_url, item.type);
              const bgIsImage = media.bg.startsWith("http") || media.bg.startsWith("data:");
              const iconIsImage = media.icon.startsWith("http") || media.icon.startsWith("data:");
              const safeLinkUrl = item.link_url?.match(/^https?:\/\//) ? item.link_url : `https://${item.link_url || ""}`;
              return (
                <div key={item.id} className="contrib-card" style={{ height: "100%" }}>
                  <div style={{ height: 105, background: bgIsImage ? `url(${media.bg}) center/cover no-repeat` : media.bg, backgroundColor: C.card2, position: "relative" }}>
                    {isAdmin && (
                      <button className="del-btn" onClick={() => { setDelId(item.id); setDelType("contrib"); setModal("del"); }} style={{ position: "absolute", top: 8, right: 8, background: "#ef4444cc", color: "#fff", border: "none", borderRadius: 6, width: 26, height: 26, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 10 }}>🗑</button>
                    )}
                    <span style={{ position: "absolute", top: 8, left: 8, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)", color: "#fff", padding: "3px 8px", borderRadius: 4, fontSize: 10, fontFamily: "'Space Mono', monospace", fontWeight: 600 }}>
                      {item.type === "roblox" ? "🎮 ROBLOX" : "💬 DISCORD"}
                    </span>
                  </div>
                  <div style={{ padding: "0 16px 16px", position: "relative", display: "flex", flexDirection: "column", flexGrow: 1 }}>
                    <div style={{ position: "absolute", top: "-30px", left: "16px", width: 60, height: 60, borderRadius: item.type === "discord" ? "16px" : "8px", background: C.surface, border: `3px solid ${C.card}`, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", fontSize: "24px" }}>
                      {iconIsImage ? <img src={media.icon} style={{ width: "100%", height: "100%", objectFit: "cover" }} alt="icon" /> : <span>{media.icon || "🎮"}</span>}
                    </div>
                    <div style={{ marginTop: "42px", marginBottom: "1.2rem", flexGrow: 1 }}>
                      <h4 style={{ fontFamily: "'Space Mono', monospace", fontSize: 15, color: C.white, fontWeight: 700, margin: "0 0 2px 0" }}>{item.title}</h4>
                      {item.type === "discord" && item.member_count && (
                        <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "8px" }}>
                          <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#22c55e" }}></span>
                          <span style={{ fontSize: 12, color: C.muted, fontFamily: "'Space Mono', monospace" }}>{item.member_count.toLocaleString()} members</span>
                        </div>
                      )}
                      <p style={{ fontSize: 13, color: C.muted, lineHeight: 1.4, margin: 0 }}>{item.desc || "Active partner project"}</p>
                    </div>
                    <a href={safeLinkUrl} target="_blank" rel="noreferrer" className="contrib-open-btn">Join</a>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* ── REVIEWS ─────────────────────────────────────────────────────── */}
      <section id="reviews" style={{ padding: "6rem 2rem", maxWidth: 720, margin: "0 auto" }}>
        {/* Header row */}
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: 16, marginBottom: "2rem" }}>
          <div>
            <Label>Testimonials</Label>
            <h2 style={{ fontFamily: "'Space Mono', monospace", fontSize: "clamp(1.4rem, 3vw, 2rem)", color: C.white, fontWeight: 700 }}>Client reviews</h2>
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            {isCustomer ? (
              <button
                className="customer-login-btn logged-in"
                onClick={() => setModal("add_review")}
              >
                ✦ Leave a review
              </button>
            ) : (
              <button
                className="customer-login-btn"
                onClick={() => { setPw(""); setPwErr(false); setModal("customer_login"); }}
              >
                🔒 Customer login
              </button>
            )}
            {isAdmin && reviews.length > 0 && (
              <button onClick={() => { setDelId(curReview?.id); setDelType("review"); setModal("del"); }} style={{ background: "#ef444411", color: "#ef4444", border: "1px solid #ef444433", padding: "7px 12px", borderRadius: 8, cursor: "pointer", fontSize: 12 }}>🗑 Delete</button>
            )}
          </div>
        </div>

        {reviews.length === 0 ? (
          <div style={{ textAlign: "center", padding: "5rem 2rem", border: `1px dashed ${C.border}`, borderRadius: 12, color: C.dim }}>
            <div style={{ fontSize: 36, marginBottom: 12 }}>⭐</div>
            <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 13 }}>No reviews yet. Be the first!</div>
          </div>
        ) : (
          <>
            {/* Carousel row */}
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <button
                className="rev-arrow"
                onClick={() => setRevIdx(i => Math.max(0, i - 1))}
                disabled={revIdx === 0}
                aria-label="Previous review"
              >◀</button>

              {curReview && (
                <div key={curReview.id} className="rev-card" style={{ flex: 1 }}>
                  {/* Reviewer info */}
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
                    <div style={{ width: 46, height: 46, borderRadius: "50%", background: C.card2, border: `1px solid ${C.border}`, overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      {curReview.discord_avatar
                        ? <img src={curReview.discord_avatar} alt="avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        : <span style={{ fontSize: 20, color: C.dim }}>👤</span>}
                    </div>
                    <div>
                      <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 14, color: C.white, fontWeight: 700 }}>{curReview.name}</div>
                      {curReview.discord_username && (
                        <div style={{ fontSize: 12, color: C.muted, marginTop: 2, display: "flex", alignItems: "center", gap: 4 }}>
                          <span style={{ fontSize: 11 }}>💬</span> {curReview.discord_username}
                        </div>
                      )}
                    </div>
                    <div style={{ marginLeft: "auto" }}>
                      {renderStars(curReview.rating, 18)}
                    </div>
                  </div>

                  {/* Review text */}
                  <p style={{ fontSize: 14, color: C.muted, lineHeight: 1.7, marginBottom: 12 }}>"{curReview.review}"</p>
                  <div style={{ fontSize: 11, color: C.dim, fontFamily: "'Space Mono', monospace" }}>{formatDate(curReview.created_at)}</div>
                </div>
              )}

              <button
                className="rev-arrow"
                onClick={() => setRevIdx(i => Math.min(reviews.length - 1, i + 1))}
                disabled={revIdx === reviews.length - 1}
                aria-label="Next review"
              >▶</button>
            </div>

            {/* Center rating + dots */}
            <div style={{ textAlign: "center", marginTop: "1.5rem" }}>
              <div style={{ display: "flex", justifyContent: "center", gap: 2, marginBottom: 6 }}>
                {renderStars(Math.round(avg), 22)}
              </div>
              <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 12, color: C.muted }}>
                {avg} / 5 · {reviews.length} {reviews.length === 1 ? "review" : "reviews"}
              </div>
              <div style={{ display: "flex", justifyContent: "center", gap: 6, marginTop: 14 }}>
                {reviews.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setRevIdx(i)}
                    className={`rev-dot${i === revIdx ? " active" : ""}`}
                    style={{ border: "none", cursor: "pointer", padding: 0 }}
                    aria-label={`Go to review ${i + 1}`}
                  />
                ))}
              </div>
            </div>
          </>
        )}
      </section>

      {/* PRICING */}
      <section id="pricing" style={{ padding: "6rem 2rem", maxWidth: 1000, margin: "0 auto" }}>
        <Label>Pricing</Label>
        <h2 style={{ fontFamily: "'Space Mono', monospace", fontSize: "clamp(1.4rem, 3vw, 2rem)", color: C.white, marginBottom: "0.5rem", fontWeight: 700 }}>Commission Rates</h2>
        <p style={{ color: C.muted, fontSize: 14, marginBottom: "2.5rem" }}>All prices are starting points - final price depends on complexity. Negotiable. I only take DevEx rates or USD through PayPal.</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 20 }}>
          {PRICING.map(p => (
            <div key={p.name} className={`pricing-card${p.highlight ? " highlight" : ""}`}>
              {p.highlight && <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg, ${C.blurple}, #a855f7)`, borderRadius: "16px 16px 0 0" }} />}
              <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 11, color: p.color, letterSpacing: 3, textTransform: "uppercase", marginBottom: 12 }}>{p.name}</div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginBottom: 4 }}>
                <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 32, fontWeight: 700, color: C.white }}>{p.price}</span>
                <span style={{ color: C.muted, fontSize: 13 }}>{p.per}</span>
              </div>
              <div style={{ height: 1, background: C.border, margin: "1.2rem 0" }} />
              <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 10, marginBottom: "1.5rem" }}>
                {p.features.map(f => (
                  <li key={f} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13, color: C.muted }}>
                    <span style={{ color: p.color, fontSize: 14 }}>✓</span> {f}
                  </li>
                ))}
              </ul>
              <button className="cta-btn" onClick={() => scrollTo("contact")} style={{ width: "100%", background: p.highlight ? C.blurple : C.card2, color: p.highlight ? "#fff" : C.muted, border: p.highlight ? "none" : `1px solid ${C.border}` }}>{p.cta}</button>
            </div>
          ))}
        </div>
      </section>

      {/* CONTACT */}
      <section id="contact" style={{ padding: "6rem 2rem", maxWidth: 600, margin: "0 auto" }}>
        <Label>Contact</Label>
        <h2 style={{ fontFamily: "'Space Mono', monospace", fontSize: "clamp(1.4rem, 3vw, 2rem)", color: C.white, marginBottom: "0.5rem", fontWeight: 700 }}>Get in touch</h2>
        <p style={{ color: C.muted, fontSize: 14, marginBottom: "2rem", lineHeight: 1.7 }}>Want to work together or have a question? Reach out on any of these platforms.</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {[
            { icon: "💬", label: "Discord", value: "syntaxia_dev", href: "#" },
            { icon: "📧", label: "Email", value: "syntaxia.rbxm@gmail.com", href: "mailto:syntaxia.rbxm@gmail.com" },
          ].map(c => (
            <a key={c.label} href={c.href} className="contact-link">
              <span style={{ fontSize: 20, minWidth: 24, textAlign: "center" }}>{c.icon}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 11, color: C.dim, fontFamily: "'Space Mono', monospace" }}>{c.label}</div>
                <div style={{ fontSize: 14, color: C.muted }}>{c.value}</div>
              </div>
              <span style={{ color: C.dim, fontSize: 16 }}>→</span>
            </a>
          ))}
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ borderTop: `1px solid ${C.border}`, padding: "2rem", textAlign: "center", color: C.dim, fontSize: 12, fontFamily: "'Space Mono', monospace" }}>
        Well ts the end of the website tsk tsk
      </footer>

      {/* ── MODALS ───────────────────────────────────────────────────────── */}

      {/* ADMIN LOGIN */}
      {modal === "login" && (
        <Modal onClose={() => { setModal(null); setPw(""); setPwErr(false); }}>
          <h3 style={{ fontFamily: "'Space Mono', monospace", color: C.white, fontSize: 16, marginBottom: 20 }}>Admin Login</h3>
          <input type="password" placeholder="Password" value={pw} onChange={e => { setPw(e.target.value); setPwErr(false); }} onKeyDown={e => e.key === "Enter" && handleLogin()} style={inputStyle(pwErr)} autoFocus />
          {pwErr && <div style={{ color: "#f87171", fontSize: 12, marginTop: 6, fontFamily: "'Space Mono', monospace" }}>Wrong password</div>}
          <button onClick={handleLogin} style={{ ...btnStyle(C.white, C.bg), marginTop: 16, width: "100%" }}>Login</button>
        </Modal>
      )}

      {/* CUSTOMER LOGIN */}
      {modal === "customer_login" && (
        <Modal onClose={() => { setModal(null); setPw(""); setPwErr(false); }}>
          <h3 style={{ fontFamily: "'Space Mono', monospace", color: C.white, fontSize: 16, marginBottom: 6 }}>Customer login</h3>
          <p style={{ fontSize: 13, color: C.muted, marginBottom: 18 }}>Only verified customers can leave reviews. Enter the password you received after your commission.</p>
          <input type="password" placeholder="Customer password" value={pw} onChange={e => { setPw(e.target.value); setPwErr(false); }} onKeyDown={e => e.key === "Enter" && handleCustomerLogin()} style={inputStyle(pwErr)} autoFocus />
          {pwErr && <div style={{ color: "#f87171", fontSize: 12, marginTop: 6, fontFamily: "'Space Mono', monospace" }}>Wrong password</div>}
          <button onClick={handleCustomerLogin} style={{ ...btnStyle(C.blurple, "#fff"), marginTop: 16, width: "100%" }}>Login</button>
        </Modal>
      )}

      {/* ADD REVIEW MODAL */}
      {modal === "add_review" && (
        <Modal onClose={() => setModal(null)} wide>
          <h3 style={{ fontFamily: "'Space Mono', monospace", color: C.white, fontSize: 16, marginBottom: 6 }}>Leave a review</h3>
          <p style={{ fontSize: 12, color: C.muted, marginBottom: 18 }}>Share your experience with Syntaxia's work.</p>

          {/* Star picker */}
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 11, color: C.dim, fontFamily: "'Space Mono', monospace", marginBottom: 8 }}>Rating *</div>
            <div style={{ display: "flex", gap: 4 }}>
              {[1, 2, 3, 4, 5].map(n => (
                <button key={n} className="star-btn-pick" onClick={() => setRevForm(f => ({ ...f, rating: n }))} aria-label={`${n} star`}>
                  <span style={{ color: n <= revForm.rating ? "#f59e0b" : C.border }}>★</span>
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <input placeholder="Your name *" value={revForm.name} onChange={e => setRevForm(f => ({ ...f, name: e.target.value }))} style={inputStyle()} />

            {/* Discord username with live preview */}
            <div>
              <input
                placeholder="Discord username (optional)"
                value={revForm.discordUser}
                onChange={e => onDiscordChange(e.target.value)}
                style={inputStyle()}
              />
              {fetchingDiscord && <div style={{ fontSize: 11, color: C.muted, marginTop: 5, fontFamily: "'Space Mono', monospace" }}>Looking up profile...</div>}
              {discordPreview && !fetchingDiscord && (
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 8, padding: "8px 12px", background: C.card2, borderRadius: 8, border: `1px solid ${C.border}` }}>
                  <div style={{ width: 32, height: 32, borderRadius: "50%", overflow: "hidden", background: C.surface, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    {discordPreview.avatar
                      ? <img src={discordPreview.avatar} alt="avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      : <span style={{ fontSize: 16 }}>👤</span>}
                  </div>
                  <div style={{ fontSize: 13, color: C.text }}>{discordPreview.displayName}</div>
                  <div style={{ fontSize: 11, color: "#22c55e", marginLeft: "auto" }}>✓ found</div>
                </div>
              )}
            </div>

            <textarea
              placeholder="Your review... *"
              rows={4}
              value={revForm.review}
              onChange={e => setRevForm(f => ({ ...f, review: e.target.value }))}
              style={{ ...inputStyle(), resize: "vertical" }}
            />

            <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
              <button
                onClick={handleAddReview}
                disabled={saving || revForm.rating < 1 || !revForm.name.trim() || !revForm.review.trim()}
                style={{ ...btnStyle(C.blurple, "#fff"), flex: 1, opacity: (saving || revForm.rating < 1 || !revForm.name.trim() || !revForm.review.trim()) ? 0.5 : 1 }}
              >
                {saving ? "Submitting..." : "Submit review"}
              </button>
              <button onClick={() => setModal(null)} style={{ ...btnStyle(C.card2, C.muted), flex: 1 }}>Cancel</button>
            </div>
          </div>
        </Modal>
      )}

      {/* ADD WORK MODAL */}
      {modal === "add" && (
        <Modal onClose={() => setModal(null)} wide>
          <h3 style={{ fontFamily: "'Space Mono', monospace", color: C.white, fontSize: 16, marginBottom: 20 }}>Add Work</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <input placeholder="Title *" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} style={inputStyle()} />
            <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} style={inputStyle()}>
              {CATS.filter(c => c.id !== "all").map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
            </select>
            <textarea placeholder="Description" rows={3} value={form.desc} onChange={e => setForm(f => ({ ...f, desc: e.target.value }))} style={{ ...inputStyle(), resize: "vertical" }} />
            <div style={{ display: "flex", gap: 10 }}>
              <input placeholder="Image URL (optional)" value={form.imageUrl} onChange={e => setForm(f => ({ ...f, imageUrl: e.target.value }))} style={{ ...inputStyle(), flex: 1 }} />
              <input type="file" accept="image/*" id="work-img-upload" style={{ display: "none" }} onChange={(e) => handleFileUpload(e, (url) => setForm(f => ({ ...f, imageUrl: url })))} />
              <label htmlFor="work-img-upload" style={{ ...btnStyle(C.card2, C.muted), display: "flex", alignItems: "center", cursor: "pointer", border: `1px solid ${C.border}` }}>Upload PC</label>
            </div>
            <input placeholder="🎬 YouTube URL (optional)" value={form.videoUrl} onChange={e => setForm(f => ({ ...f, videoUrl: e.target.value }))} style={inputStyle()} />
            <input placeholder="Tags (comma separated, e.g. Roblox, Tycoon)" value={form.tags} onChange={e => setForm(f => ({ ...f, tags: e.target.value }))} style={inputStyle()} />
            <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
              <button onClick={handleAdd} disabled={saving} style={{ ...btnStyle(C.blurple, "#fff"), flex: 1, opacity: saving ? 0.6 : 1 }}>{saving ? "Saving..." : "Add Work"}</button>
              <button onClick={() => setModal(null)} style={{ ...btnStyle(C.card2, C.muted), flex: 1 }}>Cancel</button>
            </div>
          </div>
        </Modal>
      )}

      {/* ADD CONTRIBUTION MODAL */}
      {modal === "add_contrib" && (
        <Modal onClose={() => setModal(null)} wide>
          <h3 style={{ fontFamily: "'Space Mono', monospace", color: C.white, fontSize: 16, marginBottom: 20 }}>Add Contribution</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <input placeholder="Title / Project Name *" value={contribForm.title} onChange={e => setContribForm(f => ({ ...f, title: e.target.value }))} style={inputStyle()} />
            <select value={contribForm.type} onChange={e => setContribForm(f => ({ ...f, type: e.target.value }))} style={inputStyle()}>
              <option value="discord">Discord Server</option>
              <option value="roblox">Roblox Game</option>
            </select>
            <textarea placeholder="Description" rows={2} value={contribForm.desc} onChange={e => setContribForm(f => ({ ...f, desc: e.target.value }))} style={{ ...inputStyle(), resize: "vertical" }} />
            <input placeholder="Link URL *" value={contribForm.linkUrl} onChange={e => setContribForm(f => ({ ...f, linkUrl: e.target.value }))} style={inputStyle()} />
            <div style={{ display: "flex", gap: 10 }}>
              <input placeholder="Custom Background URL (auto if blank)" value={contribForm.imageUrl} onChange={e => setContribForm(f => ({ ...f, imageUrl: e.target.value }))} style={{ ...inputStyle(), flex: 1 }} />
              <input type="file" accept="image/*" id="contrib-bg-upload" style={{ display: "none" }} onChange={(e) => handleFileUpload(e, (url) => setContribForm(f => ({ ...f, imageUrl: url })))} />
              <label htmlFor="contrib-bg-upload" style={{ ...btnStyle(C.card2, C.muted), display: "flex", alignItems: "center", cursor: "pointer", border: `1px solid ${C.border}` }}>Upload PC</label>
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <input placeholder="Custom Avatar URL (auto if blank)" value={contribForm.iconUrl} onChange={e => setContribForm(f => ({ ...f, iconUrl: e.target.value }))} style={{ ...inputStyle(), flex: 1 }} />
              <input type="file" accept="image/*" id="contrib-icon-upload" style={{ display: "none" }} onChange={(e) => handleFileUpload(e, (url) => setContribForm(f => ({ ...f, iconUrl: url })))} />
              <label htmlFor="contrib-icon-upload" style={{ ...btnStyle(C.card2, C.muted), display: "flex", alignItems: "center", cursor: "pointer", border: `1px solid ${C.border}` }}>Upload PC</label>
            </div>
            <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
              <button onClick={handleAddContrib} disabled={saving} style={{ ...btnStyle("#22c55e", "#fff"), flex: 1, opacity: saving ? 0.6 : 1 }}>{saving ? "Saving..." : "Add Contribution"}</button>
              <button onClick={() => setModal(null)} style={{ ...btnStyle(C.card2, C.muted), flex: 1 }}>Cancel</button>
            </div>
          </div>
        </Modal>
      )}

      {/* VIEW WORK MODAL */}
      {modal === "view_work" && activeWork && (
        <Modal onClose={() => { setModal(null); setActiveWork(null); }} wide>
          {activeWork.image_url && <img src={activeWork.image_url} alt={activeWork.title} style={{ width: "100%", maxHeight: "300px", objectFit: "cover", borderRadius: 8, marginBottom: 16 }} />}
          {activeWork.video_url && (
            <div style={{ marginBottom: 16, borderRadius: 8, overflow: "hidden", aspectRatio: "16/9" }}>
              <iframe src={`https://www.youtube.com/embed/${new URL(activeWork.video_url).searchParams.get("v") || activeWork.video_url.split("youtu.be/")[1]}`} style={{ width: "100%", height: "100%", border: "none" }} allowFullScreen />
            </div>
          )}
          <h3 style={{ fontFamily: "'Space Mono', monospace", color: C.white, fontSize: 20, marginBottom: 10 }}>{activeWork.title}</h3>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 16 }}>
            <span style={{ fontSize: 12, color: C.blurple, background: C.blurple + "22", padding: "4px 12px", borderRadius: 20, fontFamily: "'Space Mono', monospace", fontWeight: 600 }}>{CATS.find(c => c.id === activeWork.category)?.label || activeWork.category}</span>
            {(activeWork.tags || []).map(t => (<span key={t} style={{ fontSize: 12, color: C.dim, background: C.card2, padding: "4px 12px", borderRadius: 20, fontFamily: "'Space Mono', monospace" }}>{t}</span>))}
          </div>
          {activeWork.desc && <p style={{ color: C.muted, fontSize: 14, lineHeight: 1.6, marginBottom: 24, whiteSpace: "pre-wrap" }}>{activeWork.desc}</p>}
          <button onClick={() => { setModal(null); setActiveWork(null); }} style={{ ...btnStyle(C.card2, C.white), width: "100%", border: `1px solid ${C.border}` }}>Close</button>
        </Modal>
      )}

      {/* DELETE MODAL */}
      {modal === "del" && (
        <Modal onClose={() => { setModal(null); setDelId(null); }}>
          <h3 style={{ fontFamily: "'Space Mono', monospace", color: C.white, fontSize: 15, marginBottom: 12 }}>Delete Item?</h3>
          <p style={{ color: C.muted, fontSize: 13, marginBottom: 20 }}>This can't be undone.</p>
          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={handleDeleteItem} style={{ ...btnStyle("#ef4444", "#fff"), flex: 1 }}>Delete</button>
            <button onClick={() => { setModal(null); setDelId(null); }} style={{ ...btnStyle(C.card2, C.muted), flex: 1 }}>Cancel</button>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function WorkCard({ work, isAdmin, onClick, onDelete }) {
  const catColor = { lua: "#5865f2", haxe: "#f97316", render: "#22c55e", sfx: "#a855f7" };
  const color = catColor[work.category] || C.muted;
  return (
    <div className="work-card" onClick={onClick}>
      <div style={{ height: 160, background: C.card2, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", position: "relative" }}>
        {work.image_url ? (
          <img src={work.image_url} alt={work.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        ) : (
          <div style={{ fontSize: 40, opacity: 0.3 }}>{{ lua: "🎮", haxe: "⚙️", render: "🎨", sfx: "🔊" }[work.category] || "📁"}</div>
        )}
        <span style={{ position: "absolute", top: 10, left: 10, background: color + "22", color, border: `1px solid ${color}44`, padding: "3px 10px", borderRadius: 20, fontSize: 11, fontFamily: "'Space Mono', monospace" }}>
          {["all","lua","haxe","render","sfx"].find(c => c === work.category) ? {lua:"Roblox / Lua",haxe:"Haxe",render:"Renders",sfx:"SFX"}[work.category] : work.category}
        </span>
        {isAdmin && (
          <button className="del-btn" onClick={onDelete} style={{ position: "absolute", top: 8, right: 8, background: "#ef444422", color: "#ef4444", border: "1px solid #ef444444", borderRadius: 6, width: 28, height: 28, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>🗑</button>
        )}
      </div>
      <div style={{ padding: "1rem 1.2rem" }}>
        <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 14, color: C.white, fontWeight: 700, marginBottom: 6 }}>{work.title}</div>
        {work.desc && <div style={{ fontSize: 13, color: C.muted, lineHeight: 1.6, marginBottom: 10, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{work.desc}</div>}
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {(work.tags || []).map(t => (<span key={t} style={{ fontSize: 11, color: C.dim, background: C.card2, padding: "2px 8px", borderRadius: 4, fontFamily: "'Space Mono', monospace" }}>{t}</span>))}
          {work.date && <span style={{ fontSize: 11, color: C.dim, marginLeft: "auto", fontFamily: "'Space Mono', monospace" }}>{work.date}</span>}
        </div>
      </div>
    </div>
  );
}

function Label({ children }) {
  return <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, color: C.blurple, letterSpacing: 3, textTransform: "uppercase", marginBottom: 8 }}>{children}</div>;
}

function Modal({ children, onClose, wide }) {
  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 999, background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }}>
      <div onClick={e => e.stopPropagation()} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, padding: "1.8rem", width: "100%", maxWidth: wide ? 460 : 340, maxHeight: "90vh", overflowY: "auto" }}>
        {children}
      </div>
    </div>
  );
}

function inputStyle(err) {
  return { width: "100%", background: C.card2, border: `1px solid ${err ? "#ef4444" : C.border}`, borderRadius: 8, padding: "10px 12px", color: C.text, fontSize: 14, outline: "none" };
}

function btnStyle(bg, color) {
  return { background: bg, color, border: "none", padding: "10px 18px", borderRadius: 8, cursor: "pointer", fontWeight: 600, fontSize: 14, fontFamily: "'DM Sans', sans-serif" };
}
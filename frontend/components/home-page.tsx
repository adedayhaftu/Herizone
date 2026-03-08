'use client';

import { translations } from '@/lib/i18n';
import { useAppStore, type View } from '@/lib/store';
import {
  ArrowRight,
  BookOpen,
  Heart,
  MessageSquare,
  Shield,
  Sparkles,
  Stethoscope,
  Users,
} from 'lucide-react';
import Link from 'next/link';

// ── Brand palette ─────────────────────────────────────────────────────────────
const C1 = '#CAA69B'; // warm rose-tan
const C2 = '#CB978E'; // deep blush
const C3 = '#D4B9B2'; // soft blush-pink

const stats = [
  { value: '12,400', suffix: '+', label: 'Mothers\nConnected' },
  { value: '340', suffix: '+', label: 'Expert\nAnswers' },
  { value: '98', suffix: '+', label: 'Curated\nArticles' },
  { value: '24/7', suffix: '', label: 'AI\nSupport' },
];

export function HomePage() {
  const { setView, setChatOpen, language } = useAppStore();
  const T = translations[language].home;

  const features = [
    {
      icon: Users,
      title: T.feature_community_title,
      description: T.feature_community_desc,
      view: 'feed' as const,
      cta: T.feature_community_cta,
    },
    {
      icon: BookOpen,
      title: T.feature_learn_title,
      description: T.feature_learn_desc,
      view: 'learn' as const,
      cta: T.feature_learn_cta,
    },
    {
      icon: MessageSquare,
      title: T.feature_experts_title,
      description: T.feature_experts_desc,
      view: 'experts' as const,
      cta: T.feature_experts_cta,
    },
    {
      icon: Sparkles,
      title: T.feature_ai_title,
      description: T.feature_ai_desc,
      action: 'chat' as const,
      cta: T.feature_ai_cta,
    },
  ];

  return (
    <main className="flex-1 font-sans">

      {/* ── HERO ─────────────────────────────────────────────────────── */}
      <section
        className="relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #f9ede9 0%, #f5e6e2 50%, #eeddd9 100%)' }}
      >
        {/* decorative blobs */}
        <div
          aria-hidden
          className="pointer-events-none absolute -right-24 -top-24 h-[480px] w-[480px] rounded-full opacity-20"
          style={{ background: C2 }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-16 left-1/3 h-64 w-64 rounded-full opacity-10"
          style={{ background: C1 }}
        />

        <div className="mx-auto grid max-w-7xl grid-cols-1 items-center lg:grid-cols-2">

          {/* Left — stacked pill photo frames (inspired by reference) */}
          <div className="relative flex items-center justify-center py-20 lg:py-0 lg:min-h-[720px]">

            {/* large blush oval behind everything */}
            <div
              aria-hidden
              className="absolute left-1/2 top-1/2 h-[480px] w-[340px] -translate-x-1/2 -translate-y-1/2 rounded-[60%_40%_50%_50%/55%_45%_55%_45%] opacity-40"
              style={{ background: `radial-gradient(ellipse, ${C3} 0%, transparent 80%)` }}
            />

            {/* ── Photo card 1 — top-left (slightly rotated) ── */}
            <div
              className="absolute left-[10%] top-[5%] z-10 overflow-hidden shadow-xl"
              style={{
                width: 210,
                height: 285,
                borderRadius: '50% 50% 50% 50% / 40% 40% 60% 60%',
                border: `4px solid white`,
                transform: 'rotate(-6deg)',
                boxShadow: '0 16px 40px rgba(203,151,142,0.25)',
              }}
            >
              <img
                src="/hero-1.png"
                alt="Pregnant mother in yellow hijab holding ultrasound"
                className="h-full w-full object-cover object-top"
              />
              {/* label chip on card 1 */}
              <div
                className="absolute bottom-4 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full px-3 py-1 text-[10px] font-semibold text-white shadow"
                style={{ background: C2, opacity: 0.92 }}
              >
                Pregnancy Journey
              </div>
            </div>

            {/* ── Photo card 2 — center-right (upright, slightly larger) ── */}
            <div
              className="relative z-20 overflow-hidden shadow-2xl"
              style={{
                width: 230,
                height: 310,
                borderRadius: '50% 50% 50% 50% / 40% 40% 60% 60%',
                border: `4px solid white`,
                marginLeft: 60,
                marginTop: 40,
                boxShadow: '0 20px 50px rgba(203,151,142,0.30)',
              }}
            >
              <img
                src="/hero-2.png"
                alt="Mother holding smiling newborn"
                className="h-full w-full object-cover object-top"
              />
              {/* label chip on card 2 */}
              <div
                className="absolute bottom-4 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full px-3 py-1 text-[10px] font-semibold text-white shadow"
                style={{ background: C1, opacity: 0.92 }}
              >
                New Motherhood
              </div>
            </div>

            {/* ── Photo card 3 — bottom-left (small, rotated other way) ── */}
            <div
              className="absolute bottom-[6%] left-[8%] z-10 overflow-hidden shadow-lg"
              style={{
                width: 175,
                height: 235,
                borderRadius: '50% 50% 50% 50% / 40% 40% 60% 60%',
                border: `4px solid white`,
                transform: 'rotate(5deg)',
                boxShadow: '0 12px 30px rgba(212,185,178,0.35)',
              }}
            >
              <img
                src="/hero-3.png"
                alt="Mother cradling newborn baby"
                className="h-full w-full object-cover object-top"
              />
              {/* label chip on card 3 */}
              <div
                className="absolute bottom-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full px-2.5 py-0.5 text-[9px] font-semibold text-white shadow"
                style={{ background: C2, opacity: 0.88 }}
              >
                Community
              </div>
            </div>

            {/* floating members badge */}
            <div
              className="absolute right-[4%] top-[18%] z-30 flex items-center gap-2.5 rounded-2xl border border-white/70 bg-white/85 px-3.5 py-2.5 shadow-lg backdrop-blur-sm"
            >
              <div className="flex -space-x-1.5">
                {[
                  'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=28&h=28&fit=crop&crop=faces',
                  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=28&h=28&fit=crop&crop=faces',
                  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=28&h=28&fit=crop&crop=faces',
                ].map((src, i) => (
                  <img key={i} src={src} alt="" className="h-6 w-6 rounded-full border-2 border-white object-cover" crossOrigin="anonymous" />
                ))}
              </div>
              <div>
                <p className="text-xs font-bold text-gray-800">12,400+</p>
                <p className="text-[10px] text-gray-400">active moms</p>
              </div>
            </div>

            {/* floating AI chip */}
            <div
              className="absolute bottom-[22%] right-[3%] z-30 flex items-center gap-1.5 rounded-full border border-white/70 bg-white/85 px-3 py-1.5 shadow-md backdrop-blur-sm"
            >
              <Sparkles className="h-3 w-3" style={{ color: C2 }} />
              <span className="text-[11px] font-medium text-gray-700">AI Support 24/7</span>
            </div>
          </div>

          {/* Right — copy */}
          <div className="flex flex-col justify-center px-8 py-16 sm:px-12 lg:py-24 lg:pl-14 xl:pl-20">
            {/* eyebrow */}
            <div className="mb-5 flex items-center gap-2">
              <span className="h-2 w-2 rounded-full" style={{ background: C2 }} />
              <span className="text-xs font-bold uppercase tracking-widest" style={{ color: C2 }}>
                {T.eyebrow}
              </span>
            </div>

            {/* headline */}
            <h1 className="text-balance text-[2.8rem] font-extrabold leading-[1.08] tracking-tight text-gray-800 sm:text-5xl lg:text-[3.4rem]">
              {T.headline1}
              <br />
              {T.headline2}{' '}
              <span className="relative inline-block">
                <span className="relative z-10" style={{ color: C2 }}>
                  {T.headline3}
                </span>
                <svg
                  aria-hidden="true"
                  className="absolute -bottom-1 left-0 w-full"
                  viewBox="0 0 200 8"
                  fill="none"
                  preserveAspectRatio="none"
                >
                  <path d="M1 5.5 C 40 1, 100 1, 199 5.5" stroke={C3} strokeWidth="4" strokeLinecap="round" />
                </svg>
              </span>
              <br />
              {T.headline4}
            </h1>

            <p className="mt-6 max-w-md text-base leading-relaxed text-gray-500">
              {T.subtitle}
            </p>

            {/* CTAs */}
            <div className="mt-9 flex flex-wrap gap-3">
              <button
                onClick={() => setView('feed')}
                className="flex items-center gap-2 rounded-full px-7 py-3.5 text-sm font-semibold text-white shadow-md transition-all hover:brightness-105 active:scale-95"
                style={{ background: C2 }}
              >
                {T.cta_community}
                <ArrowRight className="h-4 w-4" />
              </button>
              <button
                onClick={() => setView('learn')}
                className="flex items-center gap-2 rounded-full border px-7 py-3.5 text-sm font-semibold transition-all hover:bg-white/60"
                style={{ borderColor: C1, color: C2 }}
              >
                <BookOpen className="h-4 w-4" />
                {T.cta_browse}
              </button>
            </div>

            {/* trust badges */}
            <div className="mt-10 flex flex-wrap gap-5">
              {[
                { icon: Shield, text: T.badge_anonymous },
                { icon: Heart, text: T.badge_safe },
                { icon: Sparkles, text: T.badge_expert },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-1.5 text-sm text-gray-400">
                  <Icon className="h-3.5 w-3.5 shrink-0" style={{ color: C1 }} />
                  {text}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── PARTNER GIFTING (Husbands) ─────────────────────────────────────── */}
      <section
        className="relative overflow-hidden px-4 py-16 sm:px-6 lg:px-10"
        style={{ background: 'linear-gradient(135deg, #fdf5f3 0%, #f7ece7 60%, #f1e2dc 100%)' }}
      >
        <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full opacity-20" style={{ background: C2 }} />
        <div className="pointer-events-none absolute -left-16 bottom-0 h-52 w-52 rounded-full opacity-20" style={{ background: C3 }} />

        <div className="mx-auto grid max-w-6xl items-center gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-4">
            <p className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-white shadow-md" style={{ background: `linear-gradient(135deg, ${C3}, ${C2})` }}>
              Partners welcome
            </p>
            <h2 className="text-3xl font-bold leading-tight text-gray-800 sm:text-4xl">
              Husbands can gift care packages to the women they love
            </h2>
            <p className="text-base leading-relaxed text-gray-600 max-w-2xl">
              Choose a plan, pay securely with M-Pesa, and unlock the right support — from chat check-ins to audio or video sessions with trusted experts.
            </p>

            <div className="grid gap-3 sm:grid-cols-2">
              {["Secure M-Pesa checkout for partners", "Options for chat, audio, or video appointments", "Expert-guided support plus AI help 24/7", "Keeps your family’s care history in one place"].map((item) => (
                <div key={item} className="flex items-start gap-2 rounded-2xl border bg-white/80 px-3.5 py-3 shadow-sm" style={{ borderColor: `${C3}60` }}>
                  <span className="mt-1 h-2 w-2 rounded-full" style={{ background: C2 }} />
                  <p className="text-sm text-gray-700">{item}</p>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap gap-3 pt-2">
              <Link
                href="/pricing"
                className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold text-white shadow-lg transition-all hover:brightness-105"
                style={{ background: `linear-gradient(135deg, ${C2}, ${C1})` }}
              >
                View packages
                <ArrowRight className="h-4 w-4" />
              </Link>
              <button
                onClick={() => setView('experts')}
                className="inline-flex items-center gap-2 rounded-full border px-6 py-3 text-sm font-semibold transition-all hover:bg-white/70"
                style={{ borderColor: `${C3}90`, color: '#7a6360' }}
              >
                Meet our experts
              </button>
            </div>
          </div>

          <div className="relative">
            <div
              className="rounded-3xl border bg-white/85 p-6 shadow-xl backdrop-blur-sm"
              style={{ borderColor: `${C3}70`, boxShadow: '0 20px 50px rgba(203,151,142,0.18)' }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Sample package</p>
                  <h3 className="text-2xl font-bold text-gray-800">Peace of mind</h3>
                </div>
                <span className="rounded-full px-3 py-1 text-xs font-semibold text-white" style={{ background: C2 }}>
                  Gift-ready
                </span>
              </div>
              <ul className="mt-4 space-y-2 text-sm text-gray-700">
                <li className="flex items-center gap-2"><Heart className="h-4 w-4" style={{ color: C2 }} /> 2 x chat sessions with verified experts</li>
                <li className="flex items-center gap-2"><MessageSquare className="h-4 w-4" style={{ color: C2 }} /> 1 x audio or video consult (choose together)</li>
                <li className="flex items-center gap-2"><Shield className="h-4 w-4" style={{ color: C2 }} /> Priority support + AI coach, 24/7</li>
                <li className="flex items-center gap-2"><Stethoscope className="h-4 w-4" style={{ color: C2 }} /> Personalized care notes shared with your partner</li>
              </ul>

              <div className="mt-6 flex flex-col gap-2 rounded-2xl border px-4 py-3" style={{ borderColor: `${C3}80`, background: `${C3}15` }}>
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-gray-700">M-Pesa ready</p>
                  <span className="text-xs font-medium text-gray-500">Secure STK push</span>
                </div>
                <p className="text-xs text-gray-500">Set a budget together — we’ll apply the 5% platform fee automatically and send your partner the confirmation.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS BAR ────────────────────────────────────────────────── */}
      {/* <section
        className="border-y px-4 py-16 sm:px-6 lg:px-8"
        style={{ borderColor: '#ecddd9', background: '#fdf6f4' }}
      >
        <div className="mx-auto max-w-5xl">
          <div className="grid grid-cols-2 gap-y-8 sm:grid-cols-4 sm:divide-x sm:gap-y-0" style={{ '--tw-divide-color': '#ecddd9' } as React.CSSProperties}>
            {stats.map(({ value, suffix, label }) => (
              <div key={label} className="flex flex-col items-center px-4 py-3">
                <span className="text-5xl font-black leading-none tracking-tight sm:text-6xl" style={{ color: C3 }}>
                  {value}
                  <span className="text-3xl font-bold" style={{ color: C2 }}>{suffix}</span>
                </span>
                <span className="mt-2 whitespace-pre-line text-center text-xs leading-relaxed text-gray-400">
                  {label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section> */}

      {/* ── THE HERIZONE EXPERIENCE ───────────────────────────────────── */}
      <section className="px-4 py-28 sm:px-6 lg:px-8" style={{ background: '#fff' }}>
        <div className="mx-auto max-w-6xl">
          {/* section header */}
          <div className="mb-20 grid gap-8 lg:grid-cols-2 lg:items-end">
            <div>
              <h2 className="text-4xl font-black leading-tight tracking-tight text-gray-800 sm:text-5xl">
                {T.experience_title}
                <br />
                <span className="font-light italic" style={{ color: C1 }}>
                  {T.experience_subtitle}
                </span>
              </h2>
            </div>
            <div className="lg:pb-2">
              <p className="text-sm leading-relaxed text-gray-400">
                {T.experience_desc1}
              </p>
              <p className="mt-3 text-sm leading-relaxed text-gray-400">
                {T.experience_desc2}
              </p>
            </div>
          </div>

          {/* feature cards */}
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature, idx) => {
              const Icon = feature.icon;
              const isHighlighted = idx === 0;
              const handleClick = () => {
                if ('view' in feature && feature.view) setView(feature.view as View);
                else setChatOpen(true);
              };

              return (
                <button
                  key={feature.title}
                  onClick={handleClick}
                  className="group flex flex-col gap-4 rounded-2xl p-6 text-left transition-all duration-200 hover:-translate-y-1 hover:shadow-lg"
                  style={
                    isHighlighted
                      ? { background: `linear-gradient(145deg, ${C3}, ${C2})`, color: 'white' }
                      : { background: '#fdf6f4', border: `1px solid #ecddd9` }
                  }
                >
                  <div
                    className="flex h-11 w-11 items-center justify-center rounded-xl"
                    style={
                      isHighlighted
                        ? { background: 'rgba(255,255,255,0.25)' }
                        : { background: '#fff', border: `1px solid ${C3}` }
                    }
                  >
                    <Icon className="h-5 w-5" style={{ color: isHighlighted ? 'white' : C2 }} strokeWidth={1.5} />
                  </div>

                  <div className="flex-1">
                    <h3 className="text-sm font-bold" style={{ color: isHighlighted ? 'white' : C2 }}>
                      {feature.title}
                    </h3>
                    <p className="mt-2 text-xs leading-relaxed" style={{ color: isHighlighted ? 'rgba(255,255,255,0.8)' : '#999' }}>
                      {feature.description}
                    </p>
                  </div>

                  <div className="flex items-center gap-1 text-xs font-semibold" style={{ color: isHighlighted ? 'white' : C2 }}>
                    {feature.cta}
                    <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ───────────────────────────────────────────────── */}
      {/* <section
        className="relative overflow-hidden px-4 py-20 sm:px-6 lg:px-8"
        style={{ background: `linear-gradient(135deg, ${C2} 0%, ${C1} 100%)` }}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-10"
          style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '28px 28px' }}
        />
        <div className="relative mx-auto flex max-w-5xl flex-col items-center gap-8 text-center lg:flex-row lg:items-center lg:justify-between lg:text-left">
          <div>
            <h2 className="text-balance text-2xl font-bold text-white sm:text-3xl">
              Start your journey with Herizone today
            </h2>
            <p className="mt-3 max-w-lg text-sm leading-relaxed text-white/75">
              Join a community that truly understands what you&apos;re going through. No judgment, only support.
            </p>
          </div>
          <div className="flex shrink-0 flex-col gap-3 sm:flex-row">
            <button
              onClick={() => setView('feed')}
              className="flex items-center gap-2 rounded-full bg-white px-7 py-3.5 text-sm font-semibold shadow-md transition-all hover:shadow-lg"
              style={{ color: C2 }}
            >
              <Users className="h-4 w-4" />
              Explore Community
            </button>
            <button
              onClick={() => setChatOpen(true)}
              className="flex items-center gap-2 rounded-full border border-white/40 px-7 py-3.5 text-sm font-semibold text-white transition-all hover:bg-white/15"
            >
              <Sparkles className="h-4 w-4" />
              Try AI Support
            </button>
          </div>
        </div>
      </section> */}

      {/* ── JOIN AS EXPERT BANNER ─────────────────────────────────── */}
      <section
        className="relative overflow-hidden px-4 py-20 sm:px-6 lg:px-8"
        style={{ background: 'linear-gradient(135deg, #f9ede9 0%, #f0e8f5 50%, #e8f4f0 100%)' }}
      >
        {/* Decorative blobs */}
        <div aria-hidden className="pointer-events-none absolute -left-20 -top-20 h-72 w-72 rounded-full opacity-20" style={{ background: C2 }} />
        <div aria-hidden className="pointer-events-none absolute -bottom-16 right-10 h-56 w-56 rounded-full opacity-15" style={{ background: C1 }} />

        <div className="relative mx-auto max-w-5xl">
          <div className="rounded-3xl border border-white/80 bg-white/60 backdrop-blur-sm shadow-xl px-8 py-12 sm:px-12 lg:flex lg:items-center lg:justify-between lg:gap-12">
            {/* Left */}
            <div className="flex-1">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#ecddd9] bg-white px-3.5 py-1.5 text-xs font-semibold" style={{ color: C2 }}>
                <Stethoscope className="h-3.5 w-3.5" />
                {T.expert_banner_tag}
              </div>
              <h2 className="text-3xl font-extrabold leading-tight tracking-tight text-gray-800 sm:text-4xl">
                {T.expert_banner_title1}
                <br />
                <span style={{ color: C2 }}>{T.expert_banner_title2}</span>
              </h2>
              <p className="mt-4 max-w-md text-sm leading-relaxed text-gray-500">
                {T.expert_banner_desc}
              </p>
              <div className="mt-6 flex flex-wrap gap-4">
                {[
                  { icon: BookOpen, text: T.expert_publish },
                  { icon: MessageSquare, text: T.expert_answer },
                  { icon: Shield, text: T.expert_badge },
                ].map(({ icon: Icon, text }) => (
                  <div key={text} className="flex items-center gap-1.5 text-sm text-gray-500">
                    <Icon className="h-4 w-4 shrink-0" style={{ color: C1 }} />
                    {text}
                  </div>
                ))}
              </div>
            </div>

            {/* Right */}
            <div className="mt-8 flex shrink-0 flex-col items-center gap-4 lg:mt-0 lg:items-start">
              <a
                href="/join-as-expert"
                className="flex items-center gap-2 rounded-full px-8 py-4 text-sm font-semibold text-white shadow-lg transition-all hover:brightness-105 active:scale-95"
                style={{ background: `linear-gradient(135deg, ${C2}, ${C1})` }}
              >
                <Stethoscope className="h-4 w-4" />
                {T.expert_banner_cta}
                <ArrowRight className="h-4 w-4" />
              </a>
              <p className="text-xs text-gray-400 text-center lg:text-left">
                {T.expert_banner_review}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── PREMIUM PRICING SECTION ─────────────────────────────────── */}
      <section className="relative overflow-hidden px-4 py-24 sm:px-6 lg:px-8 bg-gradient-to-b from-white to-pink-50/30">
        <div className="relative mx-auto max-w-6xl">
          {/* Header */}
          <div className="text-center mb-16">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold" style={{ color: C2, borderColor: C3 }}>
              <Sparkles className="h-4 w-4" />
              {T.pricing_tag}
            </div>
            <h2 className="text-4xl font-extrabold tracking-tight text-gray-800 sm:text-5xl mb-4">
              {T.pricing_title1} <span style={{ color: C2 }}>{T.pricing_title2}</span>
            </h2>
            <p className="text-lg text-gray-500 max-w-2xl mx-auto">
              {T.pricing_desc}
            </p>
          </div>

          {/* Pricing Cards */}
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Free Plan */}
            <div className="rounded-3xl border-2 border-gray-200 bg-white p-8 shadow-lg hover:shadow-xl transition-shadow">
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-gray-800 mb-2">{T.plan_free_name}</h3>
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-extrabold text-gray-800">{T.plan_free_price}</span>
                  <span className="text-gray-500">{T.plan_free_forever}</span>
                </div>
              </div>
              
              <ul className="space-y-4 mb-8">
                <li className="flex items-start gap-3">
                  <Heart className="h-5 w-5 shrink-0 mt-0.5" style={{ color: C2 }} />
                  <div>
                    <span className="font-medium text-gray-800">{T.plan_free_f1}</span>
                    <p className="text-sm text-gray-500">{T.plan_free_f1_sub}</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <Heart className="h-5 w-5 shrink-0 mt-0.5" style={{ color: C2 }} />
                  <span className="font-medium text-gray-800">{T.plan_free_f2}</span>
                </li>
                <li className="flex items-start gap-3">
                  <Heart className="h-5 w-5 shrink-0 mt-0.5" style={{ color: C2 }} />
                  <span className="font-medium text-gray-800">{T.plan_free_f3}</span>
                </li>
                <li className="flex items-start gap-3 opacity-50">
                  <div className="h-5 w-5 rounded-full border-2 border-gray-300 shrink-0 mt-0.5" />
                  <span className="font-medium text-gray-500 line-through">{T.plan_free_f4_locked}</span>
                </li>
              </ul>

              <a
                href="/auth"
                className="block w-full rounded-full border-2 px-6 py-3.5 text-center font-semibold text-gray-800 transition-all hover:bg-gray-50"
                style={{ borderColor: C3 }}
              >
                {T.plan_free_cta}
              </a>
            </div>

            {/* Premium Plan */}
            <div className="rounded-3xl border-4 p-8 shadow-2xl relative overflow-hidden" style={{ borderColor: C2, background: 'linear-gradient(135deg, #fff5f3 0%, #ffefef 100%)' }}>
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <div className="rounded-full px-4 py-1 text-xs font-bold text-white shadow-lg" style={{ background: `linear-gradient(135deg, ${C2}, ${C1})` }}>
                  {T.plan_premium_popular}
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-2xl font-bold mb-2" style={{ color: C2 }}>{T.plan_premium_name}</h3>
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-extrabold" style={{ color: C2 }}>99 ETB</span>
                  <span className="text-gray-500">/month</span>
                </div>
              </div>

              <ul className="space-y-4 mb-8">
                <li className="flex items-start gap-3">
                  <div className="h-5 w-5 rounded-full flex items-center justify-center shrink-0 mt-0.5" style={{ background: `linear-gradient(135deg, ${C2}, ${C1})` }}>
                    <Heart className="h-3 w-3 text-white" />
                  </div>
                  <div>
                    <span className="font-bold text-gray-800">{T.plan_premium_f1}</span>
                    <p className="text-sm text-gray-600">{T.plan_premium_f1_sub}</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="h-5 w-5 rounded-full flex items-center justify-center shrink-0 mt-0.5" style={{ background: `linear-gradient(135deg, ${C2}, ${C1})` }}>
                    <MessageSquare className="h-3 w-3 text-white" />
                  </div>
                  <div>
                    <span className="font-bold text-gray-800">{T.plan_premium_f2}</span>
                    <p className="text-sm text-gray-600">{T.plan_premium_f2_sub}</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="h-5 w-5 rounded-full flex items-center justify-center shrink-0 mt-0.5" style={{ background: `linear-gradient(135deg, ${C2}, ${C1})` }}>
                    <Sparkles className="h-3 w-3 text-white" />
                  </div>
                  <span className="font-bold text-gray-800">{T.plan_premium_f3}</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="h-5 w-5 rounded-full flex items-center justify-center shrink-0 mt-0.5" style={{ background: `linear-gradient(135deg, ${C2}, ${C1})` }}>
                    <Shield className="h-3 w-3 text-white" />
                  </div>
                  <span className="font-bold text-gray-800">{T.plan_premium_f4}</span>
                </li>
              </ul>

              <a
                href="/pricing"
                className="block w-full rounded-full px-6 py-3.5 text-center font-bold text-white shadow-lg transition-all hover:brightness-105 active:scale-95"
                style={{ background: `linear-gradient(135deg, ${C2}, ${C1})` }}
              >
                {T.plan_premium_cta}
              </a>
            </div>
          </div>

          {/* Trust badges */}
          <div className="mt-16 text-center">
            <p className="text-sm text-gray-400 mb-4">{T.trust_label}</p>
            <div className="flex flex-wrap justify-center gap-8 text-gray-400">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                <span className="text-sm">{T.trust_members}</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                <span className="text-sm">{T.trust_experts}</span>
              </div>
              <div className="flex items-center gap-2">
                <Heart className="h-4 w-4" />
                <span className="text-sm">{T.trust_satisfaction}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

    </main>
  );
}

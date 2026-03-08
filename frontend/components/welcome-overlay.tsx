"use client";

import { Button } from '@/components/ui/button';
import { useAppStore } from '@/lib/store';
import { ArrowRight, ShieldCheck, Sparkles, Video } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

const C1 = '#CAA69B';
const C2 = '#CB978E';
const C3 = '#D4B9B2';

export function WelcomeOverlay() {
  const { showWelcome, hydrateWelcome, dismissWelcome, setView } = useAppStore();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    hydrateWelcome();
  }, [hydrateWelcome]);

  useEffect(() => {
    setVisible(showWelcome);
  }, [showWelcome]);

  if (!visible) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex h-screen w-screen flex-col overflow-hidden"
      style={{
        background: `radial-gradient(circle at 20% 20%, ${C3}33 0, transparent 35%), radial-gradient(circle at 80% 80%, ${C2}30 0, transparent 40%), linear-gradient(135deg, #fdf8f6, #f7efeb)`
      }}
    >
      <div className="absolute inset-0 backdrop-blur-[2px]" />
      <div className="relative grid h-full w-full items-center gap-10 px-6 py-8 md:grid-cols-2 lg:px-14 lg:py-12">
        <div className="space-y-5 max-w-2xl">
          <p className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-white shadow" style={{ background: `linear-gradient(135deg, ${C3}, ${C2})` }}>
            Welcome to Herizone
          </p>
          <h1 className="text-4xl font-bold leading-tight text-gray-900 sm:text-5xl">
            A safe space for mothers — and partners who support them
          </h1>
          <p className="text-lg leading-relaxed text-gray-700 max-w-2xl">
            Browse experts, book chat/audio/video sessions, and pay securely with M-Pesa. Husbands and loved ones can gift care packages to the women they cherish.
          </p>

          <div className="grid gap-3 sm:grid-cols-2">
            {["Expert chat, audio, or video", "Secure M-Pesa checkout", "AI support 24/7", "Partner-friendly gifting"]
              .map((item) => (
                <div key={item} className="flex items-start gap-2 rounded-2xl border bg-white/85 px-3.5 py-3 shadow-sm" style={{ borderColor: `${C3}60` }}>
                  <span className="mt-1 h-2 w-2 rounded-full" style={{ background: C2 }} />
                  <p className="text-sm text-gray-700">{item}</p>
                </div>
              ))}
          </div>

          <div className="flex flex-wrap gap-3 pt-2">
            <Button
              onClick={() => { dismissWelcome(); setView('experts'); }}
              className="gap-2 text-white shadow-lg"
              style={{ background: `linear-gradient(135deg, ${C2}, ${C1})` }}
            >
              Explore experts
              <ArrowRight className="h-4 w-4" />
            </Button>
            <Link
              href="/pricing"
              className="inline-flex items-center gap-2 rounded-full border px-5 py-2.5 text-sm font-semibold transition-all hover:bg-white/70"
              style={{ borderColor: `${C3}90`, color: '#7a6360' }}
              onClick={() => dismissWelcome()}
            >
              View packages
            </Link>
            <Button
              variant="outline"
              className="gap-2"
              style={{ borderColor: `${C3}80` }}
              onClick={() => dismissWelcome()}
            >
              Continue to app
            </Button>
          </div>
        </div>

        <div className="relative">
          <div
            className="rounded-3xl border bg-white/90 p-6 shadow-2xl backdrop-blur-sm"
            style={{ borderColor: `${C3}70`, boxShadow: '0 25px 60px rgba(203,151,142,0.20)' }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Example session</p>
                <h3 className="text-2xl font-bold text-gray-800">Calm & Confident</h3>
              </div>
              <span className="rounded-full px-3 py-1 text-xs font-semibold text-white" style={{ background: C2 }}>
                Gift-ready
              </span>
            </div>
            <ul className="mt-5 space-y-3 text-sm text-gray-700">
              <li className="flex items-center gap-2"><Sparkles className="h-4 w-4" style={{ color: C2 }} /> AI check-in before your call</li>
              <li className="flex items-center gap-2"><Video className="h-4 w-4" style={{ color: C2 }} /> 30-min video or audio with a verified expert</li>
              <li className="flex items-center gap-2"><ShieldCheck className="h-4 w-4" style={{ color: C2 }} /> Confidential notes for your partner</li>
            </ul>

            <div className="mt-6 flex flex-col gap-2 rounded-2xl border px-4 py-3" style={{ borderColor: `${C3}80`, background: `${C3}15` }}>
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-gray-700">M-Pesa ready</p>
                <span className="text-xs font-medium text-gray-500">Secure STK push</span>
              </div>
              <p className="text-xs text-gray-500">We add a 5% platform fee automatically and share a receipt with the gifting partner.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

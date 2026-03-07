'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAppStore } from '@/lib/store';
import {
  AlertTriangle,
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  Clock,
  Loader2,
  Send,
  Stethoscope,
  XCircle,
} from 'lucide-react';
import { useEffect, useState } from 'react';

const C2 = '#CB978E';
const C1 = '#CAA69B';

export default function JoinAsExpertPage() {
  const { currentUser, isAuthenticated, myExpertApplication, fetchMyApplication, applyAsExpert } = useAppStore();

  const [form, setForm] = useState({ bio: '', credentials: '', specialty: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (isAuthenticated) fetchMyApplication();
  }, [isAuthenticated, fetchMyApplication]);

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <div className="rounded-full bg-amber-100 p-5 mb-4">
          <Stethoscope className="h-10 w-10 text-amber-500" />
        </div>
        <h2 className="text-lg font-semibold text-gray-800">Sign in to Apply</h2>
        <p className="mt-2 text-sm text-gray-500">Please log in to submit your expert application.</p>
        <a href="/" className="mt-5 flex items-center gap-1.5 text-sm font-medium" style={{ color: C2 }}>
          <ArrowLeft className="h-4 w-4" /> Back to Home
        </a>
      </div>
    );
  }

  if (currentUser?.isExpert) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <div className="rounded-full bg-green-100 p-5 mb-4">
          <CheckCircle2 className="h-10 w-10 text-green-600" />
        </div>
        <h2 className="text-lg font-semibold text-gray-800">You're already a verified expert!</h2>
        <p className="mt-2 text-sm text-gray-500">Head to My Articles to start writing.</p>
        <a href="/expert-articles" className="mt-5 flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold text-white shadow" style={{ background: C2 }}>
          <BookOpen className="h-4 w-4" /> Go to My Articles
        </a>
      </div>
    );
  }

  // Has existing application
  if (myExpertApplication && !submitted) {
    const app = myExpertApplication;
    const statusMap = {
      pending: { icon: Clock, color: 'text-yellow-600 bg-yellow-50', label: "Your application is under review. We'll notify you within 48 hours." },
      approved: { icon: CheckCircle2, color: 'text-green-600 bg-green-50', label: 'Congratulations! Your application was approved.' },
      rejected: { icon: XCircle, color: 'text-red-600 bg-red-50', label: app.reviewNote ?? 'Your application was not approved at this time.' },
    };
    const cfg = statusMap[app.status];
    const Icon = cfg.icon;
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <div className={`rounded-full p-5 mb-4 ${cfg.color}`}>
          <Icon className="h-10 w-10" />
        </div>
        <h2 className="text-lg font-semibold text-gray-800 capitalize">{app.status === 'pending' ? 'Application Submitted' : `Application ${app.status}`}</h2>
        <p className="mt-2 max-w-sm text-sm text-gray-500">{cfg.label}</p>
        <a href="/" className="mt-5 flex items-center gap-1.5 text-sm font-medium" style={{ color: C2 }}>
          <ArrowLeft className="h-4 w-4" /> Back to Home
        </a>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.bio.trim() || !form.credentials.trim() || !form.specialty.trim()) {
      setError('All fields are required.'); return;
    }
    setError('');
    setSaving(true);
    try {
      await applyAsExpert(form);
      setSubmitted(true);
    } catch (err: any) {
      setError(err?.message ?? 'Failed to submit. Please try again.');
    } finally { setSaving(false); }
  };

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <div className="rounded-full bg-green-100 p-5 mb-4">
          <CheckCircle2 className="h-10 w-10 text-green-600" />
        </div>
        <h2 className="text-lg font-semibold text-gray-800">Application Submitted!</h2>
        <p className="mt-2 max-w-sm text-sm text-gray-500">
          Thank you! Our team will review your application within 48 hours and you'll be notified.
        </p>
        <a href="/" className="mt-5 flex items-center gap-1.5 text-sm font-medium" style={{ color: C2 }}>
          <ArrowLeft className="h-4 w-4" /> Back to Home
        </a>
      </div>
    );
  }

  return (
    <main className="min-h-screen" style={{ background: 'linear-gradient(135deg, #f9ede9 0%, #f0e8f5 60%, #e8f4f0 100%)' }}>
      <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
        {/* Back link */}
        <a href="/" className="mb-8 flex items-center gap-1.5 text-sm font-medium" style={{ color: C2 }}>
          <ArrowLeft className="h-4 w-4" /> Back to Home
        </a>

        {/* Card */}
        <div className="rounded-3xl border border-white/80 bg-white/70 backdrop-blur-sm shadow-xl p-8 sm:p-10">
          <div className="flex items-center gap-3 mb-6">
            <div className="rounded-2xl p-3" style={{ background: `${C2}20` }}>
              <Stethoscope className="h-6 w-6" style={{ color: C2 }} />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-gray-800">Join as Expert</h1>
              <p className="text-sm text-gray-500">Share your expertise with thousands of mothers</p>
            </div>
          </div>

          {error && (
            <div className="mb-5 flex items-center gap-2 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
              <AlertTriangle className="h-4 w-4 shrink-0" />{error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-gray-500">Your Specialty</label>
              <Input
                placeholder="e.g. Obstetrics & Gynecology, Pediatrics, Lactation Consulting…"
                value={form.specialty}
                onChange={(e) => setForm((f) => ({ ...f, specialty: e.target.value }))}
                className="h-11"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-gray-500">Credentials & Qualifications</label>
              <textarea
                rows={3}
                placeholder="List your medical degrees, certifications, years of experience, institution affiliations…"
                value={form.credentials}
                onChange={(e) => setForm((f) => ({ ...f, credentials: e.target.value }))}
                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#CB978E]/40 resize-none"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-gray-500">Professional Bio</label>
              <textarea
                rows={4}
                placeholder="Tell us about yourself and why you want to contribute to Herizone…"
                value={form.bio}
                onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))}
                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#CB978E]/40 resize-none"
              />
            </div>

            <div className="rounded-xl bg-blue-50 border border-blue-100 p-4 text-xs text-blue-700 space-y-1">
              <p className="font-medium">What happens next?</p>
              <p>Our team will review your application within 48 hours. Once approved, you'll be able to write articles and answer Q&A questions.</p>
            </div>

            <Button type="submit" disabled={saving} className="w-full h-12 rounded-full gap-2 text-sm font-semibold" style={{ background: `linear-gradient(135deg, ${C2}, ${C1})` }}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              Submit Application
            </Button>
          </form>
        </div>
      </div>
    </main>
  );
}

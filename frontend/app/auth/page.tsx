'use client';

import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { translations } from '@/lib/i18n';
import { useAppStore } from '@/lib/store';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

type Mode = 'login' | 'register';

export default function AuthPage() {
  const router = useRouter();
  const { login, register, isAuthenticated, authLoading, language } = useAppStore();
  const T = translations[language].auth;

  const [mode, setMode] = useState<Mode>('login');
  const [error, setError] = useState('');

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    if (isAuthenticated) router.replace('/');
  }, [isAuthenticated, router]);

  const reset = () => {
    setError('');
    setName('');
    setPassword('');
    setConfirmPassword('');
  };

  const switchMode = (m: Mode) => {
    reset();
    setMode(m);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (mode === 'register') {
      if (password !== confirmPassword) { setError('Passwords do not match'); return; }
      if (password.length < 6) { setError('Password must be at least 6 characters'); return; }
      try {
        await register({ name: name.trim() || undefined, email, password });
        router.replace('/');
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Registration failed');
      }
    } else {
      try {
        await login(email, password);
        router.replace('/');
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Invalid email or password');
      }
    }
  };

  /* ─ underline-only input class ─ */
  const inputCls =
    'border-0 border-b border-white/30 rounded-none bg-transparent px-0 pb-2 ' +
    'text-white placeholder:text-white/35 ' +
    'focus-visible:border-white/80 focus-visible:ring-0 focus-visible:ring-offset-0';

  return (
    /* full-page photo — locked to viewport */
    <div className="relative h-screen w-screen overflow-hidden">
      {/* background image via CSS — guaranteed to fill 100vh/100vw */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: "url('/image copy 9.png')",
          backgroundSize: 'cover',
          backgroundPosition: 'center 30%',
          backgroundRepeat: 'no-repeat',
        }}
      />

      {/* subtle dark scrim */}
      <div className="absolute inset-0 bg-black/20" />

      {/* ── Right-side glass panel — full height, ~42% width ──────── */}
      <div
        className="absolute right-0 top-0 z-10 flex h-full w-full flex-col justify-center overflow-y-auto lg:w-[44%]"
        style={{
          background: 'rgba(255, 255, 255, 0.10)',
          backdropFilter: 'blur(28px)',
          WebkitBackdropFilter: 'blur(28px)',
          borderLeft: '1px solid rgba(255, 255, 255, 0.18)',
          boxShadow: '-12px 0 60px rgba(0,0,0,0.25)',
        }}
      >
        {/* inner content padded generously */}
        <div className="mx-auto w-full max-w-lg space-y-8 px-10 py-12 lg:px-14">

          {/* Heading */}
          <div className="space-y-1.5">
            <h1 className="text-4xl font-semibold tracking-tight text-white">
              {mode === 'login' ? T.login_title : T.register_title}
            </h1>
            <p className="text-base text-white/55">
              {mode === 'login' ? T.login_subtitle : T.register_subtitle}
            </p>
          </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">

              {/* Name – register only */}
              {mode === 'register' && (
                <div className="space-y-1">
                  <Label htmlFor="name" className="text-sm font-medium text-white/75">
                    {T.name_label}
                  </Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder={T.name_placeholder}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    autoComplete="name"
                    className={inputCls}
                  />
                </div>
              )}

              {/* Email */}
              <div className="space-y-1">
                <Label htmlFor="email" className="text-sm font-medium text-white/75">
                  {T.email_label}
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder={T.email_placeholder}
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  className={inputCls}
                />
              </div>

              {/* Password */}
              <div className="space-y-1">
                <Label htmlFor="password" className="text-sm font-medium text-white/75">
                  {T.password_label}
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
                  className={inputCls}
                />
              </div>

              {/* Confirm – register only */}
              {mode === 'register' && (
                <div className="space-y-1">
                  <Label htmlFor="confirm" className="text-sm font-medium text-white/75">
                    {T.confirm_password_label}
                  </Label>
                  <Input
                    id="confirm"
                    type="password"
                    placeholder="••••••••"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    autoComplete="new-password"
                    className={inputCls}
                  />
                </div>
              )}

              {/* Remember me / Forgot – login only */}
              {mode === 'login' && (
                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="remember"
                      className="border-white/35 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                    />
                    <label
                      htmlFor="remember"
                      className="text-sm text-white/60 cursor-pointer select-none"
                    >
                      {language === 'am' ? 'አስታውሰኝ' : 'Remember me'}
                    </label>
                  </div>
                  <button
                    type="button"
                    className="text-sm text-white/60 hover:text-white transition-colors"
                  >
                    {language === 'am' ? 'የይለፍ ቃልዎን ረሱ?' : 'Forgot your password?'}
                  </button>
                </div>
              )}

              {/* Error */}
              {error && (
                <p className="rounded-lg border border-rose-400/30 bg-rose-500/15 px-3 py-2 text-sm text-rose-200">
                  {error}
                </p>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={authLoading}
                className="mt-1 flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-semibold text-white shadow-lg shadow-primary/30 transition-all hover:brightness-110 disabled:opacity-60"
              >
                {authLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {mode === 'login' ? T.signing_in : T.creating}
                  </>
                ) : mode === 'login' ? (
                  T.sign_in
                ) : (
                  T.create_account
                )}
              </button>
            </form>

            {/* Toggle mode */}
            <p className="text-center text-sm text-white/45">
              {mode === 'login' ? (
                <>
                  {T.no_account}{' '}
                  <button
                    type="button"
                    onClick={() => switchMode('register')}
                    className="font-semibold text-white hover:text-primary transition-colors"
                  >
                    {T.sign_up}
                  </button>
                </>
              ) : (
                <>
                  {T.have_account}{' '}
                  <button
                    type="button"
                    onClick={() => switchMode('login')}
                    className="font-semibold text-white hover:text-primary transition-colors"
                  >
                    {T.sign_in_link}
                  </button>
                </>
              )}
            </p>
          </div>
        </div>
    </div>
  );
}


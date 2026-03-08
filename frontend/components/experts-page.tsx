'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { translations } from '@/lib/i18n';
import { useAppStore, type Expert, type ExpertTopic } from '@/lib/store';
import { formatDistanceToNow } from 'date-fns';
import {
    BadgeCheck,
    BriefcaseBusiness,
    CheckCircle2,
    ChevronLeft,
    Clock,
    Crown,
    DollarSign,
    MessageSquare,
    Plus,
    Search,
    Send,
    Stethoscope,
    User,
    X,
} from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

// ─── Brand palette (matches home page) ───────────────────────────────────────
const C1 = '#CAA69B';
const C2 = '#CB978E';
const C3 = '#D4B9B2';
// Bold CTA — deeper rose for interactive buttons
const CTA = 'linear-gradient(135deg, #c4706a, #a85550)';

// ─── Config ───────────────────────────────────────────────────────────────────
// TOPICS and TOPIC_LABELS are built inside ExpertsPage to be language-reactive.
// TOPIC_COLORS is static and kept at module level.

const TOPIC_COLORS: Record<ExpertTopic, string> = {
  medical: 'bg-blue-50 text-blue-700 border-blue-200',
  mental_health: 'bg-purple-50 text-purple-700 border-purple-200',
  nutrition: 'bg-green-50 text-green-700 border-green-200',
  parenting: 'bg-orange-50 text-orange-700 border-orange-200',
  special_needs: 'bg-pink-50 text-pink-700 border-pink-200',
};

const TOPIC_LABELS: Record<ExpertTopic, string> = {
  medical: '🩺 Medical',
  mental_health: '🧠 Mental Health',
  nutrition: '🥗 Nutrition',
  parenting: '👶 Parenting',
  special_needs: '🤝 Special Needs',
};

function buildTopicLabels(T: { cat_medical: string; cat_mental: string; cat_nutrition: string; cat_parenting: string; cat_special: string }): Record<ExpertTopic, string> {
  return {
    medical: T.cat_medical,
    mental_health: T.cat_mental,
    nutrition: T.cat_nutrition,
    parenting: T.cat_parenting,
    special_needs: T.cat_special,
  };
}

function ExpertCard({ expert }: { expert: Expert }) {
  const { language } = useAppStore();
  const T = translations[language].experts;
  const initials = expert.name
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <Link href={`/profile/${expert.id}`} className="block h-full transition-transform hover:scale-[1.02]">
      <div className="group rounded-2xl border border-white/60 bg-white/70 backdrop-blur-sm p-5 flex flex-col gap-4 hover:shadow-xl hover:bg-white/90 hover:border-[#CB978E]/40 transition-all duration-200 h-full">
        <div className="flex items-start gap-4">
          <div className="relative shrink-0">
          <Avatar className="h-14 w-14">
            <AvatarImage src={expert.avatar} alt={expert.name} />
            <AvatarFallback
              className="text-sm font-bold text-white"
              style={{ background: `linear-gradient(135deg, ${C3}, ${C2})` }}
            >
              {initials}
            </AvatarFallback>
          </Avatar>
          <span
            className="absolute -bottom-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full shadow-sm"
            style={{ background: C2 }}
            title="Verified Expert"
          >
            <BadgeCheck className="h-3.5 w-3.5 text-white" />
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-foreground leading-tight">{expert.name}</p>
          <div className="flex items-center gap-1.5 mt-1">
            <Stethoscope className="h-3.5 w-3.5 shrink-0" style={{ color: C2 }} />
            <span className="text-xs text-muted-foreground truncate">{expert.specialty}</span>
          </div>
          <div className="flex items-center gap-1.5 mt-0.5">
            <BriefcaseBusiness className="h-3.5 w-3.5 shrink-0" style={{ color: C1 }} />
            <span className="text-xs text-muted-foreground">
              {expert.yearsOfExperience} {T.yrs_exp}
            </span>
          </div>
        </div>
      </div>

      {expert.bio && (
        <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">{expert.bio}</p>
      )}

      <div className="flex items-center justify-between gap-3 pt-3 border-t border-border">
        <div className="flex items-center gap-1 text-sm font-bold" style={{ color: C2 }}>
          <DollarSign className="h-4 w-4" />
          {expert.priceMin === expert.priceMax
            ? `${expert.priceMin} ETB/session`
            : `${expert.priceMin}–${expert.priceMax} ETB/session`}
        </div>
        <span
          className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium text-white"
          style={{ background: `linear-gradient(135deg, ${C3}, ${C2})` }}
        >
          <BadgeCheck className="h-3 w-3" />
          {T.verified}
        </span>
      </div>
    </div></Link>
  );
}

// ─── Question Detail ──────────────────────────────────────────────────────────

function QuestionDetail({ questionId, onBack }: { questionId: string; onBack: () => void }) {
  const { questions, answers, selectQuestion, answerQuestion, currentUser, language } = useAppStore();
  const T = translations[language].experts;
  const topicLabels = buildTopicLabels(T);
  const question = questions.find((q) => q.id === questionId);
  const questionAnswers = answers[questionId] ?? [];
  const [answerText, setAnswerText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const q = questions.find((x) => x.id === questionId);
    if (q) selectQuestion(q);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [questionId]);

  const handleAnswer = async () => {
    if (!answerText.trim()) return;
    setSubmitting(true);
    setError('');
    try {
      await answerQuestion(questionId, answerText.trim());
      setAnswerText('');
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to submit answer.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!question) return null;

  return (
    <div className="flex flex-col gap-6">
        <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors w-fit"
      >
        <ChevronLeft className="h-4 w-4" />
        {T.back_to_questions}
      </button>      {/* Question card */}
      <div className="rounded-2xl border border-white/60 bg-white/80 backdrop-blur-sm p-6 shadow-sm" style={{ borderColor: `${C3}80` }}>
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              {!question.isAnonymous && (
                <AvatarImage src={question.avatar} alt={question.author} />
              )}
              <AvatarFallback className="bg-muted text-muted-foreground text-xs">
                {question.isAnonymous ? (
                  <User className="h-4 w-4" />
                ) : (
                  question.author.slice(0, 2).toUpperCase()
                )}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium text-foreground text-sm">
                {question.isAnonymous ? 'Anonymous' : question.author}
              </p>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {formatDistanceToNow(question.timestamp, { addSuffix: true })}
              </p>
            </div>
          </div>
          <Badge variant="outline" className={`shrink-0 text-xs ${TOPIC_COLORS[question.topic]}`}>
            {topicLabels[question.topic]}
          </Badge>
        </div>
        <p className="text-base leading-relaxed text-foreground">{question.question}</p>
        <div className="mt-4 flex items-center gap-1.5 text-xs text-muted-foreground border-t border-border pt-4">
          <MessageSquare className="h-3.5 w-3.5" />
          {questionAnswers.length} {T.expert_answers.toLowerCase()} ({questionAnswers.length === 1 ? T.answer : T.answers})
        </div>
      </div>

      {/* Expert answer form */}
      {currentUser?.isExpert && (
        <div
          className="rounded-2xl border border-white/60 bg-white/80 backdrop-blur-sm p-5 shadow-sm"
          style={{ borderColor: `${C2}40` }}
        >
          <p className="text-sm font-semibold mb-3 flex items-center gap-2" style={{ color: C2 }}>
            <BadgeCheck className="h-4 w-4" />
            {T.submit_answer_title}
          </p>
          <Textarea
            placeholder={T.answer_placeholder}
            value={answerText}
            onChange={(e) => setAnswerText(e.target.value)}
            className="min-h-30 resize-none text-sm mb-3"
            maxLength={3000}
          />
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">{answerText.length}/3000</span>
            <div className="flex items-center gap-3">
              {error && <p className="text-xs text-destructive">{error}</p>}
              <Button
                onClick={handleAnswer}
                disabled={!answerText.trim() || submitting}
                className="gap-2 text-white"
                style={{ background: CTA }}
              >
                <Send className="h-3.5 w-3.5" />
                {submitting ? T.submitting : T.post_answer}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Answers list */}
      <div>
        <h3 className="mb-4 text-sm font-semibold text-foreground">
          {T.expert_answers} ({questionAnswers.length})
        </h3>
        {questionAnswers.length === 0 ? (
          <div className="py-12 text-center rounded-2xl border border-dashed border-border bg-muted/20">
            <MessageSquare className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">{T.no_answers}</p>
            {currentUser?.isExpert && (
              <p className="text-xs text-muted-foreground mt-1">{T.be_first_answer}</p>
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {questionAnswers.map((answer) => (
              <div
                key={answer.id}
                className="rounded-2xl border border-white/60 bg-white/80 backdrop-blur-sm p-5 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-start gap-3 mb-3">
                  <div className="relative shrink-0">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={answer.expertAvatar} alt={answer.expert} />
                      <AvatarFallback
                        className="text-xs font-semibold text-white"
                        style={{ background: `linear-gradient(135deg, ${C3}, ${C2})` }}
                      >
                        {answer.expert.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span
                      className="absolute -bottom-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full"
                      style={{ background: C2 }}
                    >
                      <CheckCircle2 className="h-2.5 w-2.5 text-white" />
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-semibold text-foreground">{answer.expert}</p>
                      <span
                        className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium text-white"
                        style={{ background: `linear-gradient(135deg, ${C3}, ${C2})` }}
                      >
                        <BadgeCheck className="h-2.5 w-2.5" />
                        {T.verified_expert}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatDistanceToNow(answer.timestamp, { addSuffix: true })}
                    </p>
                  </div>
                </div>
                <p className="text-sm leading-relaxed text-foreground/90">{answer.content}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Ask Question Dialog ──────────────────────────────────────────────────────

function AskQuestionDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const { addQuestion, isAuthenticated, language } = useAppStore();
  const T = translations[language].experts;
  const TOPICS: { value: ExpertTopic | 'all'; label: string; emoji: string }[] = [
    { value: 'all', label: T.cat_all, emoji: '🌸' },
    { value: 'medical', label: T.cat_medical, emoji: '🩺' },
    { value: 'mental_health', label: T.cat_mental, emoji: '🧠' },
    { value: 'nutrition', label: T.cat_nutrition, emoji: '🥗' },
    { value: 'parenting', label: T.cat_parenting, emoji: '👶' },
    { value: 'special_needs', label: T.cat_special, emoji: '🤝' },
  ];
  const [questionText, setQuestionText] = useState('');
  const [topic, setTopic] = useState<ExpertTopic>('medical');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!questionText.trim()) return;
    setSubmitting(true);
    setError('');
    try {
      await addQuestion({ question: questionText.trim(), topic });
      setQuestionText('');
      setTopic('medical');
      onOpenChange(false);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to submit question.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span
              className="flex h-8 w-8 items-center justify-center rounded-full text-white"
              style={{ background: `linear-gradient(135deg, ${C3}, ${C2})` }}
            >
              <MessageSquare className="h-4 w-4" />
            </span>
            {T.ask_dialog_title}
          </DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4 pt-2">
          <div
            className="rounded-xl p-3 text-xs text-muted-foreground leading-relaxed border"
            style={{ borderColor: `${C3}80`, background: `${C3}15` }}
          >
            💡 {T.ask_hint}
          </div>

          <div>
            <Label className="text-sm font-medium mb-1.5 block">{T.ask_question_label}</Label>
            <Textarea
              placeholder={T.ask_question_placeholder}
              value={questionText}
              onChange={(e) => setQuestionText(e.target.value)}
              className="min-h-30 resize-none text-sm"
              maxLength={1000}
            />
            <p className="text-xs text-muted-foreground text-right mt-1">{questionText.length}/1000</p>
          </div>

          <div>
            <Label htmlFor="topic-select" className="text-sm font-medium mb-1.5 block">{T.topic_label}</Label>
            <Select value={topic} onValueChange={(v) => setTopic(v as ExpertTopic)}>
              <SelectTrigger id="topic-select" className="h-9 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TOPICS.filter((t) => t.value !== 'all').map((t) => (
                  <SelectItem key={t.value} value={t.value}>
                    {t.emoji} {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {error && <p className="text-xs text-destructive">{error}</p>}

          <div className="flex justify-end gap-2 pt-1">
            <Button variant="outline" onClick={() => onOpenChange(false)}>{T.cancel}</Button>
            <Button
              onClick={handleSubmit}
              disabled={!questionText.trim() || submitting || !isAuthenticated}
              className="gap-2 text-white"
              style={{ background: CTA }}
            >
              <Send className="h-3.5 w-3.5" />
              {submitting ? T.submitting : T.submit_question}
            </Button>
          </div>
          {!isAuthenticated && (
            <p className="text-xs text-center text-muted-foreground -mt-2">
              {T.need_sign_in}
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export function ExpertsPage() {
  const {
    expertFilter, expertSearch, setExpertFilter, setExpertSearch,
    getFilteredQuestions, experts, expertsLoading, fetchExperts,
    questionsLoading, fetchQuestions, questions, currentUser, isAuthenticated,
    language,
  } = useAppStore();
  const T = translations[language].experts;

  const TOPICS: { value: ExpertTopic | 'all'; label: string; emoji: string }[] = [
    { value: 'all', label: T.cat_all, emoji: '🌸' },
    { value: 'medical', label: T.cat_medical, emoji: '🩺' },
    { value: 'mental_health', label: T.cat_mental, emoji: '🧠' },
    { value: 'nutrition', label: T.cat_nutrition, emoji: '🥗' },
    { value: 'parenting', label: T.cat_parenting, emoji: '👶' },
    { value: 'special_needs', label: T.cat_special, emoji: '🤝' },
  ];
  const topicLabels = buildTopicLabels(T);

  const [askOpen, setAskOpen] = useState(false);
  const [selectedQuestionId, setSelectedQuestionId] = useState<string | null>(null);
  
  const isPremium = currentUser?.isPremium ?? false;

  useEffect(() => {
    fetchExperts();
    fetchQuestions();
  }, [fetchExperts, fetchQuestions]);

  const filteredQuestions = getFilteredQuestions();

  if (selectedQuestionId) {
    return (
      <main className="min-h-screen w-full" style={{ background: 'linear-gradient(135deg, #f9ede9 0%, #f5e6e2 50%, #eeddd9 100%)' }}>
        {/* Background bubbles */}
        <div aria-hidden className="pointer-events-none fixed -right-24 -top-24 h-96 w-96 rounded-full opacity-20" style={{ background: C2 }} />
        <div aria-hidden className="pointer-events-none fixed -bottom-20 -left-20 h-80 w-80 rounded-full opacity-15" style={{ background: C3 }} />
        <div aria-hidden className="pointer-events-none fixed left-1/3 top-1/3 h-64 w-64 rounded-full opacity-10" style={{ background: C1 }} />
        <div className="relative z-10 mx-auto max-w-4xl px-4 py-8 sm:px-6">
          <QuestionDetail questionId={selectedQuestionId} onBack={() => setSelectedQuestionId(null)} />
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen w-full overflow-x-hidden" style={{ background: 'linear-gradient(135deg, #f9ede9 0%, #f5e6e2 50%, #eeddd9 100%)' }}>

      {/* ── Background bubbles (same as home page) ────────────────────── */}
      <div aria-hidden className="pointer-events-none fixed -right-24 -top-24 h-120 w-120 rounded-full opacity-20" style={{ background: C2 }} />
      <div aria-hidden className="pointer-events-none fixed -bottom-16 left-1/3 h-64 w-64 rounded-full opacity-10" style={{ background: C1 }} />
      <div aria-hidden className="pointer-events-none fixed -bottom-20 -left-20 h-80 w-80 rounded-full opacity-15" style={{ background: C3 }} />
      <div aria-hidden className="pointer-events-none fixed right-1/4 top-1/2 h-48 w-48 rounded-full opacity-10" style={{ background: `radial-gradient(circle, ${C3}, transparent)` }} />

      <div className="relative z-10 w-full px-4 py-6 sm:px-6">

        {/* ── Page Header ─────────────────────────────────────────────── */}
        <div className="mb-6 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div
              className="flex h-10 w-10 items-center justify-center rounded-2xl shrink-0"
              style={{ background: CTA }}
            >
              <MessageSquare className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground leading-tight">{T.title}</h1>
              <p className="text-xs text-muted-foreground">
                {isPremium && questions.length > 0 ? `${questions.length} ${T.questions_title} · ${experts.length} ${T.verified.toLowerCase()} ${T.our_experts.toLowerCase()}` : T.subtitle}
              </p>
            </div>
          </div>
          {isPremium && (
            <Button
              onClick={() => setAskOpen(true)}
              className="gap-2 text-white shrink-0"
              style={{ background: CTA }}
            >
              <Plus className="h-4 w-4" />
              {T.ask_btn}
            </Button>
          )}
        </div>

        {/* ── Premium Gate for Non-Premium Users ─────────────────────── */}
        {!isPremium && (
          <div className="max-w-3xl mx-auto my-16">
            <div className="rounded-3xl border-4 p-8 sm:p-12 text-center shadow-2xl relative overflow-hidden" style={{ borderColor: C2, background: 'linear-gradient(135deg, #fff5f3 0%, #ffefef 100%)' }}>
              {/* Decorative elements */}
              <div aria-hidden className="absolute -top-10 -right-10 h-40 w-40 rounded-full opacity-20" style={{ background: C1 }} />
              <div aria-hidden className="absolute -bottom-10 -left-10 h-32 w-32 rounded-full opacity-15" style={{ background: C2 }} />
              
              <div className="relative z-10">
                <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full" style={{ background: `linear-gradient(135deg, ${C2}, ${C1})` }}>
                  <Crown className="h-10 w-10 text-white" />
                </div>
                
                <h2 className="text-3xl font-extrabold mb-4 text-gray-800">
                  {T.premium_gate_title}
                </h2>
                
                <p className="text-lg text-gray-600 mb-6 max-w-xl mx-auto">
                  {T.premium_gate_desc}
                </p>

                <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 mb-6 max-w-lg mx-auto">
                  <p className="text-sm font-semibold mb-3" style={{ color: C2 }}>{T.premium_benefits}</p>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 shrink-0" style={{ color: C2 }} />
                      {T.benefit_unlimited}
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 shrink-0" style={{ color: C2 }} />
                      {T.benefit_ai}
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 shrink-0" style={{ color: C2 }} />
                      {T.benefit_priority}
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 shrink-0" style={{ color: C2 }} />
                      {T.benefit_adfree}
                    </li>
                  </ul>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
                  <a
                    href="/pricing"
                    className="inline-flex items-center gap-2 rounded-full px-8 py-4 text-base font-bold text-white shadow-lg transition-all hover:brightness-105 active:scale-95"
                    style={{ background: `linear-gradient(135deg, ${C2}, ${C1})` }}
                  >
                    <Crown className="h-5 w-5" />
                    {T.upgrade_cta}
                  </a>
                  <p className="text-sm text-gray-500">
                    {T.only_99} <span className="font-bold" style={{ color: C2 }}>{T.upgrade_price}</span>
                  </p>
                </div>

                {!isAuthenticated && (
                  <p className="mt-6 text-xs text-gray-400">
                    {T.no_account_prompt} <a href="/auth" className="font-semibold underline" style={{ color: C2 }}>{T.sign_up_free}</a>
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── Experts horizontal scroll (Premium Only) ────────────────────────────────── */}
        {isPremium && (
          <section className="mb-10">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold text-foreground">{T.our_experts}</h2>
                <p className="text-xs text-muted-foreground mt-0.5">{T.scroll_hint}</p>
              </div>
              <Link
                href="/join-as-expert"
                className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold text-white transition-all hover:brightness-105 shadow-sm"
                style={{ background: CTA }}
              >
                <Stethoscope className="h-3.5 w-3.5" />
                {T.join_as_expert}
              </Link>
            </div>

          {expertsLoading ? (
            <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="rounded-2xl border border-border bg-white/70 backdrop-blur-sm p-5 animate-pulse shrink-0 w-64">
                  <div className="flex gap-3 mb-3">
                    <div className="h-14 w-14 rounded-full bg-muted shrink-0" />
                    <div className="flex-1 space-y-2 pt-1">
                      <div className="h-3 bg-muted rounded w-3/4" />
                      <div className="h-3 bg-muted rounded w-1/2" />
                    </div>
                  </div>
                  <div className="h-3 bg-muted rounded w-full mb-1.5" />
                  <div className="h-3 bg-muted rounded w-2/3" />
                </div>
              ))}
            </div>
          ) : experts.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border py-10 text-center bg-white/40 backdrop-blur-sm">
              <Stethoscope className="h-8 w-8 mx-auto mb-2" style={{ color: C2 }} />
              <p className="text-sm text-muted-foreground">No verified experts yet.</p>
              <Link href="/join-as-expert" className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium" style={{ color: C2 }}>
                Be the first to apply <BadgeCheck className="h-3.5 w-3.5" />
              </Link>
            </div>
          ) : (
            <div
              className="flex gap-4 overflow-x-auto pb-3 scrollbar-hide"
              style={{ scrollSnapType: 'x mandatory' }}
            >
              {experts.map((expert, i) => (
                <div
                  key={expert.id}
                  className="shrink-0 w-72"
                  style={{
                    scrollSnapAlign: 'start',
                    animation: `fadeSlideIn 0.4s ease both`,
                    animationDelay: `${i * 80}ms`,
                  }}
                >
                  <ExpertCard expert={expert} />
                </div>
              ))}
            </div>
          )}
        </section>
        )}

        {isPremium && <Separator className="mb-8 opacity-30" />}

        {/* ── Questions section (Premium Only) ────────────────────────────────────────── */}
        {isPremium && (
        <section>
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-lg font-semibold text-foreground">{T.questions}</h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                {filteredQuestions.length} {T.questions_title}
                {expertFilter !== 'all' ? ` in ${topicLabels[expertFilter as ExpertTopic]}` : ''}
              </p>
            </div>
            {currentUser?.isExpert && (
              <span
                className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold text-white shadow-sm"
                style={{ background: CTA }}
              >
                <BadgeCheck className="h-3.5 w-3.5" />
                {T.you_can_answer}
              </span>
            )}
          </div>

          {/* Search */}
          <div className="mb-4 relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder={T.search_placeholder}
              value={expertSearch}
              onChange={(e) => setExpertSearch(e.target.value)}
              className="pl-9 h-10 text-sm bg-white/70 backdrop-blur-sm border-white/60 focus:bg-white"
            />
            {expertSearch && (
              <button
                onClick={() => setExpertSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                aria-label="Clear search"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Topic pills */}
          <div className="mb-5 flex flex-wrap gap-2">
            {TOPICS.map((t) => (
              <button
                key={t.value}
                onClick={() => setExpertFilter(t.value)}
                className="rounded-full border px-3.5 py-1.5 text-xs font-medium transition-all hover:shadow-sm"
                style={
                  expertFilter === t.value
                    ? { background: CTA, color: 'white', borderColor: 'transparent', boxShadow: '0 2px 8px rgba(160,80,70,0.4)' }
                    : { background: 'rgba(255,255,255,0.6)', color: 'var(--muted-foreground)', borderColor: 'rgba(255,255,255,0.8)' }
                }
              >
                {t.emoji} {t.label}
              </button>
            ))}
          </div>

          {/* Questions list */}
          {questionsLoading ? (
            <div className="flex flex-col gap-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="rounded-2xl border border-white/50 bg-white/60 backdrop-blur-sm p-5 animate-pulse">
                  <div className="flex gap-3 mb-3">
                    <div className="h-8 w-8 rounded-full bg-muted shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3 bg-muted rounded w-1/4" />
                      <div className="h-3 bg-muted rounded w-3/4" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-3 bg-muted rounded w-full" />
                    <div className="h-3 bg-muted rounded w-2/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredQuestions.length === 0 ? (
            <div className="py-16 text-center rounded-2xl border border-dashed border-border bg-white/40 backdrop-blur-sm">
              <MessageSquare className="h-10 w-10 mx-auto mb-3" style={{ color: C2 }} />
              <p className="text-sm font-semibold text-foreground">{T.no_questions}</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {expertSearch ? T.no_questions_search : T.no_questions_empty}
              </p>
              {isAuthenticated && (
                <Button
                  onClick={() => setAskOpen(true)}
                  className="mt-4 gap-1.5 text-white"
                  style={{ background: CTA }}
                >
                  <Plus className="h-4 w-4" />
                  {T.ask_btn}
                </Button>
              )}
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {filteredQuestions.map((q, i) => (
                <article
                  key={q.id}
                  className="group cursor-pointer rounded-2xl border border-white/60 bg-white/70 backdrop-blur-sm p-5 transition-all hover:shadow-lg hover:bg-white/90 hover:border-[#CB978E]/30"
                  style={{ animation: `fadeSlideIn 0.35s ease both`, animationDelay: `${i * 50}ms` }}
                  onClick={() => setSelectedQuestionId(q.id)}
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && setSelectedQuestionId(q.id)}
                  role="button"
                  aria-label={`View question: ${q.question.slice(0, 60)}`}
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-2.5">
                      <Avatar className="h-8 w-8 shrink-0">
                        {!q.isAnonymous && <AvatarImage src={q.avatar} alt={q.author} />}
                        <AvatarFallback className="bg-muted text-xs text-muted-foreground">
                          {q.isAnonymous ? <User className="h-3.5 w-3.5" /> : q.author.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-xs font-medium text-foreground">{q.isAnonymous ? 'Anonymous' : q.author}</p>
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatDistanceToNow(q.timestamp, { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline" className={`shrink-0 text-xs ${TOPIC_COLORS[q.topic]}`}>
                      {topicLabels[q.topic]}
                    </Badge>
                  </div>

                  <p className="text-sm leading-relaxed text-foreground/90 line-clamp-2">{q.question}</p>

                  <div className="mt-3 flex items-center justify-between">
                    {q.answerCount > 0 ? (
                      <span className="flex items-center gap-1.5 text-xs font-medium" style={{ color: C2 }}>
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        {q.answerCount} {q.answerCount === 1 ? T.answer : T.answers}
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Clock className="h-3.5 w-3.5" />
                        {T.awaiting_response}
                      </span>
                    )}
                    {currentUser?.isExpert && q.answerCount === 0 && (
                      <span className="text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: C2 }}>
                        {T.answer_this}
                      </span>
                    )}
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
        )}

      </div>

      {/* ── CSS for animations ────────────────────────────────────────── */}
      <style>{`
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      <AskQuestionDialog open={askOpen} onOpenChange={setAskOpen} />
    </main>
  );
}

'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { useAppStore, type Article, type ArticleCategory } from '@/lib/store';
import {
  Baby,
  Bookmark,
  BookmarkCheck,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Clock,
  HeartPulse,
  LayoutGrid,
  Salad,
  Search,
  Tag,
  X,
} from 'lucide-react';
import { useEffect, useState, type ComponentType } from 'react';

// ── Brand palette (matches home page) ────────────────────────────────────────
const C1 = '#CAA69B';
const C2 = '#CB978E';
const C3 = '#D4B9B2';
// Bold CTA — deeper rose for buttons that need to stand out
const CTA = 'linear-gradient(135deg, #c4706a, #a85550)';

// ── Constants ─────────────────────────────────────────────────────────────────

const CATEGORIES: { value: ArticleCategory | 'all'; label: string; Icon: ComponentType<{ className?: string }> }[] = [
  { value: 'all',        label: 'All Articles', Icon: LayoutGrid },
  { value: 'pregnancy',  label: 'Pregnancy',    Icon: HeartPulse },
  { value: 'parenting',  label: 'Parenting',    Icon: Baby },
  { value: 'health',     label: 'Health',       Icon: BookOpen },
  { value: 'nutrition',  label: 'Nutrition',    Icon: Salad },
];

const CATEGORY_META: Record<ArticleCategory, { color: string; bg: string; border: string; accent: string }> = {
  pregnancy: { color: 'text-pink-700',   bg: 'bg-pink-50',   border: 'border-pink-200',   accent: '#f9a8d4' },
  parenting: { color: 'text-purple-700', bg: 'bg-purple-50', border: 'border-purple-200', accent: '#c4b5fd' },
  health:    { color: 'text-teal-700',   bg: 'bg-teal-50',   border: 'border-teal-200',   accent: '#5eead4' },
  nutrition: { color: 'text-green-700',  bg: 'bg-green-50',  border: 'border-green-200',  accent: '#86efac' },
};

// ── Skeleton ──────────────────────────────────────────────────────────────────

function ArticleCardSkeleton() {
  return (
    <div className="rounded-2xl border border-white/50 bg-white/60 backdrop-blur-sm p-5 animate-pulse">
      <div className="h-4 w-20 rounded-full bg-muted/60 mb-3" />
      <div className="h-4 w-full rounded bg-muted/60 mb-2" />
      <div className="h-4 w-3/4 rounded bg-muted/60 mb-4" />
      <div className="h-3 w-full rounded bg-muted/60 mb-1.5" />
      <div className="h-3 w-5/6 rounded bg-muted/60 mb-6" />
      <div className="flex justify-between">
        <div className="h-3 w-24 rounded bg-muted/60" />
        <div className="h-3 w-12 rounded bg-muted/60" />
      </div>
    </div>
  );
}

// ── ArticleDetail ─────────────────────────────────────────────────────────────

function ArticleDetail({ article, onBack }: { article: Article; onBack: () => void }) {
  const { currentUser, toggleBookmark } = useAppStore();
  const isBookmarked = currentUser?.bookmarks.includes(article.id) ?? false;
  const meta = CATEGORY_META[article.category];

  return (
    <main
      className="min-h-screen w-full"
      style={{ background: 'linear-gradient(135deg, #f9ede9 0%, #f5e6e2 50%, #eeddd9 100%)' }}
    >
      {/* Background blobs */}
      <div aria-hidden className="pointer-events-none fixed -right-24 -top-24 h-120 w-120 rounded-full opacity-20" style={{ background: C2 }} />
      <div aria-hidden className="pointer-events-none fixed -bottom-16 left-1/3 h-64 w-64 rounded-full opacity-10" style={{ background: C1 }} />
      <div aria-hidden className="pointer-events-none fixed -bottom-20 -left-20 h-80 w-80 rounded-full opacity-15" style={{ background: C3 }} />

      <div className="relative z-10 mx-auto max-w-3xl px-4 py-8 sm:px-6">
        <button
          onClick={onBack}
          className="mb-6 flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors group"
        >
          <ChevronLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
          Back to library
        </button>

        <div className="rounded-3xl border border-white/60 bg-white/80 backdrop-blur-sm p-6 sm:p-8 shadow-xl">
          {/* Colored top stripe */}
          <div className="absolute inset-x-0 top-0 h-1.5 rounded-t-3xl" style={{ background: meta.accent }} />

          {/* Top bar */}
          <div className="flex items-start justify-between gap-4 mb-5">
            <Badge
              variant="outline"
              className={`text-xs font-semibold ${meta.color} ${meta.bg} ${meta.border}`}
            >
              {article.category.charAt(0).toUpperCase() + article.category.slice(1)}
            </Badge>
            <button
              onClick={() => toggleBookmark(article.id)}
              className={`flex items-center gap-1.5 text-sm transition-colors shrink-0 ${
                isBookmarked ? 'text-primary' : 'text-muted-foreground hover:text-primary'
              }`}
              aria-label={isBookmarked ? 'Remove bookmark' : 'Bookmark article'}
            >
              {isBookmarked ? (
                <BookmarkCheck className="h-4 w-4" fill="currentColor" />
              ) : (
                <Bookmark className="h-4 w-4" />
              )}
              <span className="hidden sm:inline">{isBookmarked ? 'Saved' : 'Save'}</span>
            </button>
          </div>

          <h1 className="text-xl font-bold text-foreground leading-snug sm:text-2xl">
            {article.title}
          </h1>

          <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
            <span className="font-semibold text-foreground/80">{article.author}</span>
            <span>&middot;</span>
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {article.readTime} min read
            </span>
          </div>

          <Separator className="my-5 opacity-30" />

          <div className="prose prose-sm max-w-none text-foreground/90 leading-relaxed whitespace-pre-wrap">
            {article.content || article.excerpt}
          </div>

          {article.tags.length > 0 && (
            <div className="mt-8 flex flex-wrap gap-2">
              {article.tags.map((tag) => (
                <span
                  key={tag}
                  className={`flex items-center gap-1 rounded-full border px-3 py-1 text-xs ${meta.color} ${meta.bg} ${meta.border}`}
                >
                  <Tag className="h-3 w-3" />
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

// ── LearnPage ─────────────────────────────────────────────────────────────────

export function LearnPage() {
  const {
    articleFilter,
    articleSearch,
    setArticleFilter,
    setArticleSearch,
    getFilteredArticles,
    fetchArticles,
    articlesLoading,
    articles,
    currentUser,
    toggleBookmark,
  } = useAppStore();

  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [showBookmarks, setShowBookmarks] = useState(false);

  useEffect(() => {
    fetchArticles();
  }, [fetchArticles]);

  const filteredArticles = getFilteredArticles();
  const displayArticles = showBookmarks
    ? filteredArticles.filter((a) => currentUser?.bookmarks.includes(a.id))
    : filteredArticles;

  const featured = articles[0] ?? null;

  if (selectedArticle) {
    return <ArticleDetail article={selectedArticle} onBack={() => setSelectedArticle(null)} />;
  }

  return (
    <main
      className="min-h-screen w-full overflow-x-hidden"
      style={{ background: 'linear-gradient(135deg, #f9ede9 0%, #f5e6e2 50%, #eeddd9 100%)' }}
    >
      {/* ── Background blobs (same as home page) ────────────────────── */}
      <div aria-hidden className="pointer-events-none fixed -right-24 -top-24 h-120 w-120 rounded-full opacity-20" style={{ background: C2 }} />
      <div aria-hidden className="pointer-events-none fixed -bottom-16 left-1/3 h-64 w-64 rounded-full opacity-10" style={{ background: C1 }} />
      <div aria-hidden className="pointer-events-none fixed -bottom-20 -left-20 h-80 w-80 rounded-full opacity-15" style={{ background: C3 }} />
      <div aria-hidden className="pointer-events-none fixed right-1/4 top-1/2 h-48 w-48 rounded-full opacity-10" style={{ background: `radial-gradient(circle, ${C3}, transparent)` }} />

      <div className="relative z-10 w-full px-4 py-6 sm:px-6">

        {/* ── Page Header ──────────────────────────────────────────────── */}
        <div className="mb-6 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div
              className="flex h-10 w-10 items-center justify-center rounded-2xl shrink-0"
              style={{ background: CTA }}
            >
              <BookOpen className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground leading-tight">Learn & Grow</h1>
              <p className="text-xs text-muted-foreground">
                {articles.length > 0 ? `${articles.length} expert-written articles` : 'Evidence-based articles'}
              </p>
            </div>
          </div>

          {/* Featured quick-link */}
          {featured && !articlesLoading && (
            <button
              onClick={() => setSelectedArticle(featured)}
              className="hidden sm:flex items-center gap-2 rounded-2xl border border-white/60 bg-white/60 backdrop-blur-sm px-4 py-2.5 text-left transition-all hover:bg-white/90 hover:shadow-md max-w-xs"
            >
              <span
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-white text-xs font-bold"
                style={{ background: CTA }}
              >
                ✦
              </span>
              <div className="min-w-0">
                <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: C2 }}>Featured</p>
                <p className="text-xs font-medium text-foreground truncate">{featured.title}</p>
              </div>
              <ChevronRight className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
            </button>
          )}
        </div>

        {/* ── Controls row ─────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row gap-3 mb-5">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search articles or tags…"
              value={articleSearch}
              onChange={(e) => setArticleSearch(e.target.value)}
              className="pl-9 h-10 text-sm bg-white/70 backdrop-blur-sm border-white/60 focus:bg-white"
            />
            {articleSearch && (
              <button
                onClick={() => setArticleSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                aria-label="Clear search"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          <Button
            variant="outline"
            onClick={() => setShowBookmarks(!showBookmarks)}
            className={`flex items-center gap-1.5 shrink-0 h-10 px-4 text-sm font-medium border transition-all ${
              showBookmarks
                ? 'border-transparent text-white'
                : 'bg-white/70 backdrop-blur-sm border-white/60 text-muted-foreground hover:text-foreground hover:bg-white'
            }`}
            style={showBookmarks ? { background: CTA } : {}}
            aria-pressed={showBookmarks}
          >
            {showBookmarks ? (
              <BookmarkCheck className="h-4 w-4" fill="currentColor" />
            ) : (
              <Bookmark className="h-4 w-4" />
            )}
            Saved ({currentUser?.bookmarks.length ?? 0})
          </Button>
        </div>

        {/* ── Category pills ────────────────────────────────────────────── */}
        <div className="mb-7 flex flex-wrap gap-2.5">
          {CATEGORIES.map((cat) => {
            const active = articleFilter === cat.value;
            return (
              <button
                key={cat.value}
                onClick={() => setArticleFilter(cat.value)}
                className="flex items-center gap-2 rounded-2xl border px-4 py-2.5 text-sm font-semibold transition-all hover:shadow-md"
                style={
                  active
                    ? { background: CTA, color: 'white', borderColor: 'transparent', boxShadow: '0 3px 10px rgba(160,80,70,0.4)' }
                    : { background: 'rgba(255,255,255,0.7)', color: 'var(--foreground)', borderColor: 'rgba(255,255,255,0.9)' }
                }
              >
                <cat.Icon className="h-4 w-4 shrink-0" />
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* ── Articles grid ─────────────────────────────────────────────── */}
        {articlesLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <ArticleCardSkeleton key={i} />
            ))}
          </div>
        ) : displayArticles.length === 0 ? (
          <div className="py-20 text-center rounded-3xl border border-white/50 bg-white/40 backdrop-blur-sm">
            <BookOpen className="mx-auto h-12 w-12 opacity-30" style={{ color: C2 }} />
            <p className="mt-4 text-sm font-semibold text-foreground">No articles found</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {showBookmarks ? 'Save articles to find them here.' : 'Try adjusting your search or filter.'}
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {displayArticles.map((article, i) => {
              const isBookmarked = currentUser?.bookmarks.includes(article.id) ?? false;
              const meta = CATEGORY_META[article.category];
              return (
                <article
                  key={article.id}
                  className="group relative flex flex-col rounded-2xl border border-white/60 bg-white/70 backdrop-blur-sm p-5 transition-all hover:shadow-xl hover:bg-white/90 hover:border-[#CB978E]/30 cursor-pointer overflow-hidden"
                  style={{ animation: 'fadeSlideIn 0.35s ease both', animationDelay: `${i * 50}ms` }}
                  onClick={() => setSelectedArticle(article)}
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && setSelectedArticle(article)}
                  role="button"
                  aria-label={`Read article: ${article.title}`}
                >
                  {/* Colored top stripe on hover */}
                  <div
                    className="absolute inset-x-0 top-0 h-1 rounded-t-2xl opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{ background: meta.accent }}
                  />

                  <div className="flex items-start justify-between gap-2 mb-3">
                    <Badge
                      variant="outline"
                      className={`text-xs shrink-0 font-semibold ${meta.color} ${meta.bg} ${meta.border}`}
                    >
                      {article.category.charAt(0).toUpperCase() + article.category.slice(1)}
                    </Badge>
                    <button
                      onClick={(e) => { e.stopPropagation(); toggleBookmark(article.id); }}
                      className={`shrink-0 transition-colors ${isBookmarked ? 'text-primary' : 'text-muted-foreground hover:text-primary'}`}
                      aria-label={isBookmarked ? 'Remove bookmark' : 'Bookmark article'}
                    >
                      {isBookmarked ? (
                        <BookmarkCheck className="h-4 w-4" fill="currentColor" />
                      ) : (
                        <Bookmark className="h-4 w-4" />
                      )}
                    </button>
                  </div>

                  <h2 className="text-sm font-semibold text-foreground leading-snug line-clamp-2 flex-1 mb-2">
                    {article.title}
                  </h2>
                  <p className="text-xs leading-relaxed text-muted-foreground line-clamp-3 flex-1">
                    {article.excerpt}
                  </p>

                  {article.tags.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1">
                      {article.tags.slice(0, 2).map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex items-center gap-0.5 rounded-full bg-white/60 border border-white/80 px-2 py-0.5 text-[10px] text-muted-foreground"
                        >
                          <Tag className="h-2.5 w-2.5" />
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground border-t border-white/50 pt-3">
                    <span className="font-medium text-foreground/70 truncate pr-2">{article.author}</span>
                    <span className="flex items-center gap-1 shrink-0">
                      <Clock className="h-3 w-3" />
                      {article.readTime} min
                    </span>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Animation keyframes ───────────────────────────────────────── */}
      <style>{`
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </main>
  );
}

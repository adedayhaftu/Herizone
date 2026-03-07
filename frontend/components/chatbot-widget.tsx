'use client';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useAppStore } from '@/lib/store';
import { cn } from '@/lib/utils';
import { CheckCircle2, Heart, Minimize2, Send, Sparkles, ThumbsDown, ThumbsUp, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeSanitize from 'rehype-sanitize';

// ── Brand palette (matches learn / experts / home pages) ──────────────────────
const C2  = '#CB978E';
const C3  = '#D4B9B2';
const CTA = 'linear-gradient(135deg, #c4706a, #a85550)';

const QUICK_PROMPTS = [
  "How do I manage morning sickness?",
  "When should I worry about my baby's crying?",
  'Tips for breastfeeding difficulties',
  'Signs of postpartum depression',
  'Safe exercises during pregnancy',
  'Baby sleep schedules by age',
];

export function ChatbotWidget() {
  const router = useRouter();
  const { chatOpen, chatMessages, chatLoading, setChatOpen, sendChatMessage, sendFeedback, isAuthenticated } = useAppStore();
  const [inputValue, setInputValue] = useState('');
  const [minimized, setMinimized] = useState(false);
  const [feedbackGiven, setFeedbackGiven] = useState<Record<string, boolean>>({});
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (chatOpen && !minimized) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, chatOpen, minimized]);

  useEffect(() => {
    if (chatOpen && !minimized) {
      textareaRef.current?.focus();
    }
  }, [chatOpen, minimized]);

  const handleSend = () => {
    const content = inputValue.trim();
    if (!content || chatLoading) return;
    if (!isAuthenticated) { setShowLoginPrompt(true); return; }
    sendChatMessage(content);
    setInputValue('');
  };

  const handleQuickPrompt = (prompt: string) => {
    if (!isAuthenticated) { setShowLoginPrompt(true); return; }
    sendChatMessage(prompt);
  };

  const handleFeedback = async (messageId: string, isHelpful: boolean) => {
    await sendFeedback(messageId, isHelpful);
    setFeedbackGiven({ ...feedbackGiven, [messageId]: true });
  };

  /* ── FAB (chat closed) ───────────────────────────────────────────────── */
  if (!chatOpen) {
    return (
      <button
        onClick={() => setChatOpen(true)}
        className="fixed bottom-8 right-8 z-50 flex h-16 w-16 items-center justify-center rounded-full text-white shadow-2xl transition-all duration-300 hover:scale-110 hover:brightness-110 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-offset-2 animate-pulse"
        style={{ background: CTA, boxShadow: '0 8px 30px rgba(164,80,70,0.45)', ['--tw-ring-color' as string]: C2 }}
        aria-label="Open AI support chat"
      >
        <Sparkles className="h-7 w-7" />
      </button>
    );
  }

  /* ── Widget (chat open) ──────────────────────────────────────────────── */
  return (
    <div
      className={cn(
        'fixed bottom-8 right-8 z-50 flex flex-col rounded-3xl shadow-2xl backdrop-blur-sm transition-all duration-300',
        minimized ? 'h-16 w-96' : 'h-175 w-120'
      )}
      style={{
        background: 'linear-gradient(135deg, #fdf5f3 0%, #f9ede9 60%, #f4e6e1 100%)',
        border: `2px solid ${C3}`,
      }}
      role="dialog"
      aria-label="Bloom AI Support Chat"
    >
      {/* ── Header ───────────────────────────────────────────────────────── */}
      <div
        className="flex items-center justify-between gap-3 rounded-t-3xl px-6 py-4 shadow-sm"
        style={{ background: CTA }}
      >
        <div className="flex items-center gap-3">
          <div className="relative flex h-11 w-11 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm ring-2 ring-white/30">
            <Heart className="h-6 w-6 text-white" fill="currentColor" />
            <div className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-green-400 ring-2 ring-white" />
          </div>
          <div>
            <p className="text-base font-bold text-white leading-none flex items-center gap-2">
              Bloom AI
              <CheckCircle2 className="h-4 w-4" />
            </p>
            <p className="mt-1 text-sm text-white/90 font-medium">
              {chatLoading ? 'Thinking…' : 'Always here to help ✨'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setMinimized(!minimized)}
            className="rounded-xl p-2 text-white/80 transition-all hover:bg-white/20 hover:text-white"
            aria-label={minimized ? 'Expand chat' : 'Minimize chat'}
          >
            <Minimize2 className="h-4 w-4" />
          </button>
          <button
            onClick={() => setChatOpen(false)}
            className="rounded-xl p-2 text-white/80 transition-all hover:bg-white/20 hover:text-white"
            aria-label="Close chat"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {!minimized && (
        <>
          {/* ── Disclaimer ─────────────────────────────────────────────── */}
          <div
            className="border-b px-5 py-3"
            style={{ borderColor: `${C3}80`, background: `${C3}20` }}
          >
            <p className="text-xs text-muted-foreground leading-relaxed font-medium">
              💡 General information only — not medical advice. Always consult your healthcare provider.
            </p>
          </div>

          {/* ── Messages ───────────────────────────────────────────────── */}
          <div className="flex-1 overflow-y-auto px-5 py-5 space-y-5 scroll-smooth">
            {chatMessages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  'flex gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300',
                  message.isAi ? '' : 'flex-row-reverse'
                )}
              >
                {message.isAi && (
                  <Avatar className="h-9 w-9 shrink-0 mt-1" style={{ ['--tw-ring-color' as string]: C3 }}>
                    <AvatarFallback className="text-white" style={{ background: `linear-gradient(135deg, ${C3}, ${C2})` }}>
                      <Heart className="h-4 w-4" fill="currentColor" />
                    </AvatarFallback>
                  </Avatar>
                )}
                <div className="flex flex-col gap-2 max-w-[85%]">
                  <div
                    className={cn(
                      'rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm',
                      message.isAi
                        ? 'rounded-tl-sm text-foreground'
                        : 'rounded-tr-sm text-white'
                    )}
                    style={
                      message.isAi
                        ? { background: 'rgba(255,255,255,0.85)', border: `1px solid ${C3}60` }
                        : { background: CTA, boxShadow: '0 3px 12px rgba(160,80,70,0.3)' }
                    }
                  >
                    {message.isAi ? (
                      <div className="prose prose-sm max-w-none [&>p]:my-1 [&>ul]:my-1 [&>ol]:my-1 [&>li]:my-0 [&>h1]:mt-2 [&>h2]:mt-2 [&>h3]:mt-2">
                        <ReactMarkdown rehypePlugins={[rehypeSanitize]}>
                          {message.content}
                        </ReactMarkdown>
                      </div>
                    ) : (
                      message.content
                    )}
                  </div>

                  {/* Confidence & Feedback */}
                  {message.isAi && message.id !== 'msg-welcome' && (
                    <div className="flex items-center gap-3 px-2">
                      {message.confidence !== undefined && (
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <div className="flex gap-0.5">
                            {[...Array(3)].map((_, i) => (
                              <div
                                key={i}
                                className="h-1.5 w-1.5 rounded-full"
                                style={{
                                  background: i < Math.floor((message.confidence || 0) / 33)
                                    ? '#22c55e'
                                    : '#d1d5db',
                                }}
                              />
                            ))}
                          </div>
                          <span className="font-medium">{message.confidence}%</span>
                        </div>
                      )}
                      {message.sourceCount !== undefined && message.sourceCount > 0 && (
                        <div className="text-xs text-muted-foreground font-medium">
                          📚 {message.sourceCount} {message.sourceCount === 1 ? 'source' : 'sources'}
                        </div>
                      )}
                      {!feedbackGiven[message.id] && (
                        <div className="flex items-center gap-1 ml-auto">
                          <button
                            onClick={() => handleFeedback(message.id, true)}
                            className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-green-100 hover:text-green-600"
                            aria-label="Helpful"
                          >
                            <ThumbsUp className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => handleFeedback(message.id, false)}
                            className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-red-100 hover:text-red-600"
                            aria-label="Not helpful"
                          >
                            <ThumbsDown className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      )}
                      {feedbackGiven[message.id] && (
                        <div className="text-xs text-green-600 font-medium ml-auto">
                          Thanks for your feedback! 💚
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {chatLoading && (
              <div className="flex gap-3 animate-in fade-in slide-in-from-bottom-2">
                <Avatar className="h-9 w-9 shrink-0 mt-1">
                  <AvatarFallback className="text-white" style={{ background: `linear-gradient(135deg, ${C3}, ${C2})` }}>
                    <Heart className="h-4 w-4" fill="currentColor" />
                  </AvatarFallback>
                </Avatar>
                <div
                  className="flex items-center gap-1.5 rounded-2xl rounded-tl-sm px-5 py-4 shadow-sm"
                  style={{ background: 'rgba(255,255,255,0.85)', border: `1px solid ${C3}60` }}
                >
                  <span className="h-2 w-2 rounded-full animate-bounce [animation-delay:0ms]" style={{ background: C2 }} />
                  <span className="h-2 w-2 rounded-full animate-bounce [animation-delay:150ms]" style={{ background: C2 }} />
                  <span className="h-2 w-2 rounded-full animate-bounce [animation-delay:300ms]" style={{ background: '#CAA69B' }} />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* ── Quick prompts (greeting-only state) ────────────────────── */}
          {chatMessages.length === 1 && (
            <div
              className="border-t px-5 py-4"
              style={{ borderColor: `${C3}80`, background: `${C3}15` }}
            >
              <p className="mb-3 text-xs font-bold uppercase tracking-wide" style={{ color: C2 }}>
                ✨ Popular questions
              </p>
              <div className="grid grid-cols-2 gap-2">
                {QUICK_PROMPTS.map((prompt) => (
                  <button
                    key={prompt}
                    onClick={() => handleQuickPrompt(prompt)}
                    className="rounded-xl border bg-white/80 px-3 py-2.5 text-left text-xs font-medium text-foreground transition-all hover:bg-white hover:shadow-md disabled:opacity-50"
                    style={{ borderColor: `${C3}90` }}
                    disabled={chatLoading}
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ── Login prompt ───────────────────────────────────────────── */}
          {showLoginPrompt && (
            <div
              className="mx-4 mb-3 rounded-xl border p-3 text-center"
              style={{ borderColor: `${C3}80`, background: `${C3}20` }}
            >
              <p className="text-sm font-medium text-foreground">Please sign in to use Bloom chat.</p>
              <div className="mt-2 flex items-center justify-center gap-2">
                <Button
                  onClick={() => router.push('/auth')}
                  className="rounded-lg px-3 py-1.5 text-sm text-white"
                  style={{ background: CTA }}
                >
                  Log in / Sign up
                </Button>
                <Button variant="ghost" onClick={() => setShowLoginPrompt(false)} className="rounded-lg px-3 py-1.5 text-sm">
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {/* ── Input bar ──────────────────────────────────────────────── */}
          <div
            className="border-t p-4 rounded-b-3xl"
            style={{ borderColor: `${C3}80`, background: 'rgba(255,255,255,0.6)' }}
          >
            <div className="flex items-end gap-3">
              <Textarea
                ref={textareaRef}
                placeholder="Ask anything about pregnancy, parenting, or health…"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                className="min-h-12 max-h-32 resize-none rounded-xl border-2 text-sm leading-relaxed focus:ring-2"
                style={{ borderColor: C3, ['--tw-ring-color' as string]: `${C2}40` }}
                disabled={chatLoading}
                rows={1}
              />
              <Button
                size="icon"
                onClick={handleSend}
                disabled={!inputValue.trim() || chatLoading}
                className="h-12 w-12 shrink-0 rounded-xl text-white shadow-lg transition-all duration-200 hover:brightness-110"
                style={{ background: CTA, boxShadow: '0 4px 14px rgba(160,80,70,0.4)' }}
                aria-label="Send message"
              >
                <Send className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}



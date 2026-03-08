'use client';

import { Footer } from '@/components/footer';
import { Navbar } from '@/components/navbar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { useAppStore } from '@/lib/store';
import { ArrowLeft, Circle, Image as ImageIcon, RefreshCw, Send, UserRound } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useMemo, useRef, useState } from 'react';

const DEFAULT_WS_URL = process.env.NEXT_PUBLIC_CHAT_WS_URL || 'ws://localhost:4000/ws/chat';

function ChatPageInner() {
  const router = useRouter();
  const params = useSearchParams();
  const expertId = params.get('expertId');
  const expertName = params.get('expertName') || 'Expert';
  const { isAuthenticated, currentUser } = useAppStore();

  const [wsUrl] = useState(DEFAULT_WS_URL);
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [status, setStatus] = useState<'connecting' | 'open' | 'closed'>('connecting');
  const [messages, setMessages] = useState<{ from: 'me' | 'peer' | 'system'; text?: string; image?: string | null; at: number }[]>([]);
  const [input, setInput] = useState('');
  const [connectKey, setConnectKey] = useState(0);
  const [uploadingImage, setUploadingImage] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const title = useMemo(() => (expertId ? `Chat with ${expertName}` : 'Chat'), [expertId, expertName]);
  const senderName = currentUser?.name || 'Me';
  const MAX_IMAGE_SIZE = 2 * 1024 * 1024; // 2MB
  const initials = expertName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  // Brand palette (matches experts/profile)
  const C2 = '#CB978E';
  const C3 = '#D4B9B2';
  const CTA = 'linear-gradient(135deg, #c4706a, #a85550)';

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth');
      return;
    }

    const ws = new WebSocket(wsUrl);
    setSocket(ws);
    setStatus('connecting');

    ws.onopen = () => {
      setStatus('open');
      if (expertId) {
        ws.send(JSON.stringify({ type: 'join', expertId }));
      }
    };

    ws.onmessage = (event) => {
      let payload: any = event.data;
      try {
        payload = JSON.parse(event.data);
      } catch {
        payload = { type: 'message', text: event.data };
      }

      if (payload.type === 'system') return; // keep status badge only, no log spam

      if (payload.type === 'message') {
        setMessages((m) => [
          ...m,
          {
            from: 'peer',
            text: payload.text,
            image: payload.image,
            at: payload.at ?? Date.now(),
          },
        ]);
        return;
      }
    };

    ws.onclose = () => {
      setStatus('closed');
    };

    ws.onerror = () => setStatus('closed');

    return () => {
      ws.close();
    };
  }, [wsUrl, expertId, isAuthenticated, router, connectKey]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const send = () => {
    const text = input.trim();
    if (!text || status !== 'open' || !socket) return;
    const payload = { type: 'message', text, from: senderName, expertId };
    socket.send(JSON.stringify(payload));
    setMessages((m) => [...m, { from: 'me', text, at: Date.now() }]);
    setInput('');
  };

  const handlePickImage = () => fileInputRef.current?.click();

  const sendImage = async (file: File) => {
    if (!socket || status !== 'open') {
      setMessages((m) => [...m, { from: 'system', text: 'You are offline — reconnect to send files.', at: Date.now() }]);
      return;
    }

    if (file.size > MAX_IMAGE_SIZE) {
      setMessages((m) => [...m, { from: 'system', text: 'Image too large (max 2MB).', at: Date.now() }]);
      return;
    }

    setUploadingImage(true);
    const toDataUrl = (f: File) =>
      new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(f);
      });

    try {
      const image = await toDataUrl(file);
      const payload = { type: 'message', image, text: file.name, from: senderName, expertId };
      socket.send(JSON.stringify(payload));
      setMessages((m) => [...m, { from: 'me', text: file.name, image, at: Date.now() }]);
    } finally {
      setUploadingImage(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />
      <div className="relative isolate overflow-hidden bg-linear-to-b from-[#fdf5f3] via-white to-white dark:from-slate-950 dark:via-slate-900 dark:to-slate-900">
        <div className="absolute inset-0 bg-linear-to-br from-white/60 via-transparent to-[#f7e6df]/60 pointer-events-none" />

        <div className="container mx-auto max-w-5xl px-4 pb-14 pt-8 relative">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" className="gap-2" onClick={() => router.back()}>
                <ArrowLeft className="h-4 w-4" /> Back
              </Button>
              <div className="flex items-center gap-2">
                <CardTitle className="text-lg font-semibold">{title}</CardTitle>
                <Badge
                  variant="outline"
                  className="gap-1 text-xs border"
                  style={{ borderColor: `${C3}80`, background: `${C3}30` }}
                >
                  <Circle className={`h-2 w-2 ${status === 'open' ? 'text-green-500' : 'text-muted-foreground'}`} />
                  {status}
                </Badge>
              </div>
            </div>
            {status === 'closed' && (
              <Button
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={() => setConnectKey((k) => k + 1)}
                style={{ borderColor: `${C3}80` }}
              >
                <RefreshCw className="h-4 w-4" /> Reconnect
              </Button>
            )}
          </div>

          <Card className="mt-6 border border-white/60 bg-white/85 dark:bg-slate-900/85 backdrop-blur shadow-xl">
            <CardHeader className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-3">
                <div
                  className="flex h-12 w-12 items-center justify-center rounded-full text-white font-semibold shadow"
                  style={{ background: `linear-gradient(135deg, ${C3}, ${C2})` }}
                >
                  {expertId ? initials : <UserRound className="h-5 w-5" />}
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Live chat</p>
                  <h2 className="text-xl font-semibold text-foreground">{expertName}</h2>
                  {expertId && (
                    <p className="text-xs text-muted-foreground">Room: {expertId.slice(0, 8)}…</p>
                  )}
                </div>
              </div>
              <Button
                size="sm"
                className="text-white gap-2"
                style={{ background: CTA, boxShadow: '0 8px 24px rgba(164,80,70,0.25)' }}
                onClick={() => router.push(`/profile/${expertId}`)}
              >
                View profile
              </Button>
            </CardHeader>
            <Separator />
            <CardContent className="flex h-[70vh] flex-col gap-0 p-0">
              <div className="flex-1 overflow-y-auto space-y-3 px-4 py-4">
                {messages.map((m) => (
                  <div
                    key={`${m.at}-${m.text ?? m.image ?? 'msg'}`}
                    className={`flex ${m.from === 'me' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[70%] rounded-2xl px-4 py-2 text-sm shadow-sm ${
                        m.from === 'me'
                          ? 'text-white'
                          : m.from === 'system'
                            ? 'bg-muted text-muted-foreground'
                            : 'bg-secondary text-secondary-foreground'
                      }`}
                      style={
                        m.from === 'me'
                          ? { background: CTA }
                          : m.from === 'system'
                            ? { }
                            : { background: `${C3}30`, border: `1px solid ${C3}60` }
                      }
                    >
                      {m.text}
                      {m.image && (
                        <img
                          src={m.image}
                          alt={m.text || 'attachment'}
                          className="mt-2 max-h-64 w-auto rounded-lg border"
                          style={{ borderColor: `${C3}80` }}
                        />
                      )}
                    </div>
                  </div>
                ))}
                <div ref={scrollRef} />
              </div>
              <Separator />
              <div className="flex items-center gap-3 p-4" style={{ background: `${C3}10` }}>
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Type a message..."
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      send();
                    }
                  }}
                  className="bg-white/80"
                />
                <div className="flex items-center gap-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      sendImage(file);
                      e.target.value = '';
                    }}
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handlePickImage}
                    disabled={status !== 'open' || uploadingImage}
                    title="Send image"
                    style={{ borderColor: `${C3}80` }}
                  >
                    <ImageIcon className="h-4 w-4" />
                  </Button>
                  <Button
                    onClick={send}
                    disabled={status !== 'open' || !input.trim()}
                    className="gap-2 text-white"
                    style={{ background: CTA, boxShadow: '0 6px 16px rgba(164,80,70,0.25)' }}
                  >
                    <Send className="h-4 w-4" /> Send
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default function ChatPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center text-sm text-muted-foreground">Loading chat…</div>}>
      <ChatPageInner />
    </Suspense>
  );
}

'use client';

import { ChatbotWidget } from '@/components/chatbot-widget';
import { Footer } from '@/components/footer';
import { Navbar } from '@/components/navbar';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { PublicUserProfile, usersApi } from '@/lib/api';
import { useAppStore } from '@/lib/store';
import { ArrowLeft, Loader2, MapPin, MessageCircle, Sparkles, Star, Verified } from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function PublicProfilePage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const { toast } = useToast();
  const { setChatOpen } = useAppStore();

  const [profile, setProfile] = useState<PublicUserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProfile() {
      try {
        setLoading(true);
        const { user } = await usersApi.getProfile(id);
        setProfile(user);
      } catch (err) {
        console.error(err);
        setError('Failed to load profile');
        toast({
          title: 'Error',
          description: 'Could not load user profile.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      fetchProfile();
    }
  }, [id, toast]);

  if (loading) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="container mx-auto p-4 text-center">
        <h1 className="text-2xl font-bold text-red-500">Profile not found</h1>
        <Button asChild variant="link" className="mt-4">
          <Link href="/">Back to Home</Link>
        </Button>
      </div>
    );
  }

  const initials = profile.name
    ? profile.name.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase()
    : 'U';

  // Brand palette (matches Experts page)
  const C2 = '#CB978E';
  const C3 = '#D4B9B2';
  const CTA = 'linear-gradient(135deg, #c4706a, #a85550)';

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />
      <div className="relative isolate overflow-hidden bg-linear-to-b from-[#fdf5f3] via-white to-white dark:from-slate-950 dark:via-slate-900 dark:to-slate-900">
  <div className="absolute inset-0 bg-linear-to-br from-white/60 via-transparent to-[#f7e6df]/60 pointer-events-none" />
        <div className="container mx-auto px-4 pb-16 pt-10 max-w-5xl relative">
          <div className="mb-6 flex items-center justify-between gap-3">
            <Button variant="ghost" asChild size="sm" className="gap-2">
              <Link href="/experts">
                <ArrowLeft className="h-4 w-4" /> Back to Experts
              </Link>
            </Button>
            {profile.isExpert && (
              <div className="flex items-center gap-2">
                <Button
                  variant="default"
                  size="sm"
                  className="gap-2 text-white shadow-lg"
                  style={{ background: CTA, boxShadow: '0 8px 24px rgba(164,80,70,0.3)' }}
                  onClick={() => router.push(`/chat?expertId=${profile.id}&expertName=${encodeURIComponent(profile.name || 'Expert')}`)}
                >
                  <MessageCircle className="h-4 w-4" /> Message
                </Button>
              </div>
            )}
          </div>

          <Card className="border border-white/60 bg-white/80 dark:bg-slate-900/80 backdrop-blur shadow-xl">
            <CardContent className="p-6 md:p-8">
              <div className="flex flex-col md:flex-row gap-6 md:gap-8">
                <div className="flex flex-col items-center text-center md:items-start md:text-left">
                  <div className="relative">
                    <Avatar className="h-28 w-28 ring-4 ring-white/80 dark:ring-slate-800 shadow-lg">
                      <AvatarImage src={profile.profilePicture || undefined} />
                      <AvatarFallback className="text-lg font-bold" style={{ background: `linear-gradient(135deg, ${C3}, ${C2})`, color: 'white' }}>{initials}</AvatarFallback>
                    </Avatar>
                    {profile.isExpert && (
                      <span
                        className="absolute -bottom-2 -right-2 inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold text-white shadow-md"
                        style={{ background: `linear-gradient(135deg, ${C3}, ${C2})` }}
                      >
                        <Verified className="h-3.5 w-3.5" /> Verified Expert
                      </span>
                    )}
                  </div>
                  <div className="mt-4 space-y-1">
                    <div className="flex items-center justify-center md:justify-start gap-2">
                      <h1 className="text-2xl md:text-3xl font-bold text-foreground">{profile.name}</h1>
                      {profile.isExpert && (
                        <Badge
                          variant="secondary"
                          className="gap-1 text-xs border"
                          style={{ borderColor: `${C3}80`, background: `${C3}30` }}
                        >
                          <Sparkles className="h-3 w-3" /> Expert
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground flex items-center gap-2 justify-center md:justify-start">
                      <MapPin className="h-4 w-4" /> {profile.specialty || 'General practice'}
                    </p>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground justify-center md:justify-start">
                      <span className="flex items-center gap-1">
                        <Star className="h-4 w-4 text-amber-500" /> {profile.yearsOfExperience} yrs experience
                      </span>
                      <Separator orientation="vertical" className="h-4" />
                      <span>{profile.availableHours || 'Contact for availability'}</span>
                    </div>
                  </div>
                </div>

                <div className="grid flex-1 gap-3 md:grid-cols-3">
                  <Card className="text-white shadow-md border-none" style={{ background: CTA }}>
                    <CardContent className="p-4 space-y-1">
                      <p className="text-xs opacity-80">Rate</p>
                      <p className="text-2xl font-bold">
                        {profile.priceMin === profile.priceMax
                          ? `${profile.priceMin} ETB/session`
                          : `${profile.priceMin}–${profile.priceMax} ETB/session`}
                      </p>
                      <p className="text-xs opacity-80">Sliding scale available on request</p>
                    </CardContent>
                  </Card>
                  <Card className="border-dashed" style={{ borderColor: `${C3}80` }}>
                    <CardContent className="p-4 space-y-1">
                      <p className="text-xs text-muted-foreground">Articles</p>
                      <p className="text-2xl font-bold">{profile._count.articles}</p>
                      <p className="text-xs text-muted-foreground">Published insights</p>
                    </CardContent>
                  </Card>
                  <Card className="border-dashed" style={{ borderColor: `${C3}80` }}>
                    <CardContent className="p-4 space-y-1">
                      <p className="text-xs text-muted-foreground">Answers</p>
                      <p className="text-2xl font-bold">{profile._count.answers}</p>
                      <p className="text-xs text-muted-foreground">Community support</p>
                    </CardContent>
                  </Card>
                </div>
              </div>

              <Separator className="my-6" />

              <div className="grid gap-6 md:grid-cols-2">
                <Card className="border" style={{ borderColor: `${C3}80` }}>
                  <CardHeader>
                    <CardTitle>About</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="whitespace-pre-wrap text-muted-foreground leading-relaxed">
                      {profile.bio || 'No bio provided.'}
                    </p>
                  </CardContent>
                </Card>

                <Card className="border" style={{ borderColor: `${C3}80` }}>
                  <CardHeader>
                    <CardTitle>Availability</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground leading-relaxed">
                      {profile.availableHours || 'Please reach out to schedule a session.'}
                    </p>
                  </CardContent>
                </Card>
              </div>

              <Card className="border-dashed mt-6" style={{ borderColor: `${C3}80` }}>
                <CardHeader>
                  <CardTitle>Recent activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-foreground">{profile._count.posts}</div>
                      <div className="text-xs text-muted-foreground">Posts</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-foreground">{profile._count.articles}</div>
                      <div className="text-xs text-muted-foreground">Articles</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-foreground">{profile._count.answers}</div>
                      <div className="text-xs text-muted-foreground">Answers</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-foreground">{new Date(profile.createdAt).toLocaleDateString()}</div>
                      <div className="text-xs text-muted-foreground">Joined</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </div>
      </div>
      <Footer />
      <ChatbotWidget />
    </div>
  );
}

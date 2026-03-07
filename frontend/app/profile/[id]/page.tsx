'use client';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { PublicUserProfile, usersApi } from '@/lib/api';
import { ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function PublicProfilePage() {
  const params = useParams();
  const id = params.id as string;
  const { toast } = useToast();
  
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
    return <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin" /></div>;
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

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Button variant="ghost" className="mb-6" asChild>
            <Link href="/experts"><ArrowLeft className="mr-2 h-4 w-4" /> Back to Experts</Link>
        </Button>

        <div className="grid gap-6 md:grid-cols-3">
            {/* Left Column: Basic Info */}
            <Card className="md:col-span-1 border-border bg-card">
                <CardContent className="pt-6 flex flex-col items-center text-center">
                    <Avatar className="h-24 w-24 mb-4">
                        <AvatarImage src={profile.profilePicture || undefined} />
                        <AvatarFallback>{initials}</AvatarFallback>
                    </Avatar>
                    <h1 className="text-xl font-bold text-foreground">{profile.name}</h1>
                    {profile.isExpert && <Badge className="mt-2" variant="secondary">Expert</Badge>}
                    
                    <div className="mt-6 w-full space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Joined</span>
                            <span className="text-foreground">{new Date(profile.createdAt).toLocaleDateString()}</span>
                        </div>
                        {profile.isExpert && (
                            <>
                             <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Experience</span>
                                <span className="text-foreground">{profile.yearsOfExperience} years</span>
                             </div>
                             <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Rate</span>
                                <span className="text-foreground">${profile.priceMin} - ${profile.priceMax}/hr</span>
                             </div>
                            </>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Right Column: Details */}
            <div className="md:col-span-2 space-y-6">
                <Card className="border-border bg-card">
                    <CardHeader>
                        <CardTitle>About</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="whitespace-pre-wrap text-muted-foreground">{profile.bio || 'No bio provided.'}</p>
                    </CardContent>
                </Card>

                {profile.isExpert && (
                    <>
                        <Card className="border-border bg-card">
                            <CardHeader>
                                <CardTitle>Specialty</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-muted-foreground">{profile.specialty || 'General'}</p>
                            </CardContent>
                        </Card>

                        <Card className="border-border bg-card">
                            <CardHeader>
                                <CardTitle>Available Hours</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="whitespace-pre-wrap text-muted-foreground">{profile.availableHours || 'Contact for availability.'}</p>
                            </CardContent>
                        </Card>
                    </>
                )}
                
                <Card className="border-border bg-card">
                    <CardHeader>
                        <CardTitle>Activity</CardTitle>
                    </CardHeader>
                    <CardContent>
                         <div className="grid grid-cols-3 gap-4 text-center">
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
                         </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    </div>
  );
}

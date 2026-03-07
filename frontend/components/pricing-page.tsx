'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useAppStore } from '@/lib/store';
import { Check, Crown, Heart, MessageCircle, Sparkles, Star, Users } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function PricingPage() {
  const router = useRouter();
  const user = useAppStore((state) => state.currentUser);
  const isAuthenticated = useAppStore((state) => state.isAuthenticated);

  const handleGetStarted = (plan: 'free' | 'premium') => {
    if (!isAuthenticated) {
      router.push('/auth');
      return;
    }

    if (plan === 'premium') {
      // TODO: Integrate payment gateway (Stripe/PayPal)
      alert('Payment integration coming soon! For now, contact admin to upgrade your account.');
    } else {
      router.push('/');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 via-purple-50 to-white dark:from-gray-900 dark:via-purple-950 dark:to-gray-900">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16 text-center">
        <Badge className="mb-4 bg-gradient-to-r from-pink-500 to-purple-500 text-white border-0">
          <Sparkles className="mr-1 h-3 w-3" />
          Premium Membership
        </Badge>
        <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
          Choose Your Journey
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-12">
          Get the support you need during pregnancy and motherhood. Start free or unlock premium features for unlimited access.
        </p>
      </div>

      {/* Pricing Cards */}
      <div className="container mx-auto px-4 pb-16">
        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Free Plan */}
          <Card className="relative border-2 hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-2 mb-2">
                <Heart className="h-6 w-6 text-pink-500" />
                <CardTitle className="text-2xl">Freemium</CardTitle>
              </div>
              <CardDescription className="text-lg">Perfect for getting started</CardDescription>
              <div className="mt-4">
                <span className="text-4xl font-bold">Free</span>
                <span className="text-muted-foreground ml-2">forever</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium">10 AI Chat Questions Daily</p>
                    <p className="text-sm text-muted-foreground">Get instant answers about pregnancy and childcare</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium">Browse Articles & Resources</p>
                    <p className="text-sm text-muted-foreground">Access our knowledge base</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium">Community Forums</p>
                    <p className="text-sm text-muted-foreground">Connect with other mothers</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium">Book Expert Consultations</p>
                    <p className="text-sm text-muted-foreground">Schedule paid sessions with specialists</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 opacity-50">
                  <div className="h-5 w-5 rounded-full border-2 border-gray-300 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium line-through">Ask Expert Questions</p>
                    <p className="text-sm text-muted-foreground">Premium feature</p>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                className="w-full" 
                variant="outline"
                onClick={() => handleGetStarted('free')}
              >
                {isAuthenticated && !user?.isPremium ? 'Current Plan' : 'Get Started Free'}
              </Button>
            </CardFooter>
          </Card>

          {/* Premium Plan */}
          <Card className="relative border-4 border-gradient-to-r from-pink-500 to-purple-500 hover:shadow-2xl transition-shadow">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2">
              <Badge className="bg-gradient-to-r from-pink-500 to-purple-500 text-white border-0 px-4 py-1">
                <Crown className="mr-1 h-4 w-4" />
                Most Popular
              </Badge>
            </div>
            <CardHeader className="bg-gradient-to-br from-pink-50 to-purple-50 dark:from-pink-950/20 dark:to-purple-950/20">
              <div className="flex items-center gap-2 mb-2">
                <Crown className="h-6 w-6 text-purple-600" />
                <CardTitle className="text-2xl bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                  Premium
                </CardTitle>
              </div>
              <CardDescription className="text-lg">Complete support for your journey</CardDescription>
              <div className="mt-4">
                <span className="text-4xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                  499 ETB
                </span>
                <span className="text-muted-foreground ml-2">/month</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              <p className="text-sm font-semibold text-purple-600 flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                Everything in Free, plus:
              </p>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="h-5 w-5 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="h-3 w-3 text-white" />
                  </div>
                  <div>
                    <p className="font-medium flex items-center gap-2">
                      Unlimited AI Chat Questions
                      <Badge variant="secondary" className="text-xs">Unlimited</Badge>
                    </p>
                    <p className="text-sm text-muted-foreground">Ask as many questions as you need, anytime</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="h-5 w-5 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="h-3 w-3 text-white" />
                  </div>
                  <div>
                    <p className="font-medium flex items-center gap-2">
                      Ask Expert Questions Directly
                      <Badge variant="secondary" className="text-xs">New</Badge>
                    </p>
                    <p className="text-sm text-muted-foreground">Post questions for our verified experts</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="h-5 w-5 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="h-3 w-3 text-white" />
                  </div>
                  <div>
                    <p className="font-medium">Priority Support</p>
                    <p className="text-sm text-muted-foreground">Get help faster when you need it</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="h-5 w-5 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="h-3 w-3 text-white" />
                  </div>
                  <div>
                    <p className="font-medium">Exclusive Content</p>
                    <p className="text-sm text-muted-foreground">Access premium articles and resources</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="h-5 w-5 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="h-3 w-3 text-white" />
                  </div>
                  <div>
                    <p className="font-medium">Ad-Free Experience</p>
                    <p className="text-sm text-muted-foreground">Enjoy uninterrupted browsing</p>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                className="w-full bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white"
                onClick={() => handleGetStarted('premium')}
              >
                {isAuthenticated && user?.isPremium ? (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    Current Plan
                  </>
                ) : (
                  <>
                    <Crown className="mr-2 h-4 w-4" />
                    Upgrade to Premium
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>

      {/* Features Comparison */}
      <div className="container mx-auto px-4 py-16 bg-white dark:bg-gray-900">
        <h2 className="text-3xl font-bold text-center mb-12">Why Go Premium?</h2>
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <div className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full flex items-center justify-center">
              <MessageCircle className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold">Unlimited Support</h3>
            <p className="text-muted-foreground">
              No limits on AI questions. Get instant answers whenever you need them, day or night.
            </p>
          </div>
          <div className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full flex items-center justify-center">
              <Users className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold">Expert Access</h3>
            <p className="text-muted-foreground">
              Ask questions directly to verified healthcare professionals and get personalized advice.
            </p>
          </div>
          <div className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full flex items-center justify-center">
              <Star className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold">Premium Content</h3>
            <p className="text-muted-foreground">
              Access exclusive articles, guides, and resources curated by experts.
            </p>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">Frequently Asked Questions</h2>
        <div className="max-w-3xl mx-auto space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Can I cancel my premium subscription anytime?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Yes! You can cancel your premium subscription at any time. You'll continue to have access to premium features until the end of your billing period.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">What payment methods do you accept?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                We accept all major credit cards, debit cards, and digital payment methods through our secure payment gateway.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Can I still book expert consultations with the free plan?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Yes! All users can book paid consultations with our experts. Premium members get the additional benefit of asking questions directly to experts in the Q&A section.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">What happens to my 10 daily AI questions?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Your free daily limit of 10 AI chat questions resets every 24 hours at midnight. With premium, you get unlimited questions with no daily limits.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* CTA Section */}
      <div className="container mx-auto px-4 py-16">
        <Card className="bg-gradient-to-r from-pink-500 to-purple-500 text-white border-0">
          <CardContent className="text-center py-12">
            <Crown className="mx-auto h-16 w-16 mb-6" />
            <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
            <p className="text-lg mb-8 opacity-90 max-w-2xl mx-auto">
              Join thousands of mothers getting the support they need. Start free or upgrade to premium for unlimited access.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                variant="secondary"
                className="bg-white text-purple-600 hover:bg-gray-100"
                onClick={() => handleGetStarted('free')}
              >
                Start Free
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                className="border-2 border-white text-white hover:bg-white/20"
                onClick={() => handleGetStarted('premium')}
              >
                <Crown className="mr-2 h-5 w-5" />
                Go Premium
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

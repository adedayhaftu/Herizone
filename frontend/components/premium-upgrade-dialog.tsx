'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Check, Crown, Infinity, MessageSquare, Sparkles, Stethoscope } from 'lucide-react';

const C2 = '#CB978E';
const C1 = '#CAA69B';

interface PremiumUpgradeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  feature?: 'ai-chat' | 'expert-questions';
}

export function PremiumUpgradeDialog({ open, onOpenChange, feature }: PremiumUpgradeDialogProps) {
  const featureMessages = {
    'ai-chat': {
      title: 'Unlimited AI Chat Access',
      description: 'You\'ve reached your daily AI question limit. Upgrade to Premium for unlimited AI assistance!',
      icon: MessageSquare,
    },
    'expert-questions': {
      title: 'Ask Real Experts',
      description: 'Get personalized answers from verified healthcare professionals. Available exclusively for Premium members!',
      icon: Stethoscope,
    },
  };

  const currentFeature = feature ? featureMessages[feature] : {
    title: 'Upgrade to Premium',
    description: 'Unlock all premium features and get the most out of Herizone!',
    icon: Crown,
  };

  const FeatureIcon = currentFeature.icon;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] border-none bg-gradient-to-br from-white via-purple-50/30 to-pink-50/30">
        <DialogHeader>
          <div className="flex items-center justify-center mb-4">
            <div
              className="rounded-full p-4 shadow-lg"
              style={{ background: `linear-gradient(135deg, ${C2}, ${C1})` }}
            >
              <Crown className="h-8 w-8 text-white" />
            </div>
          </div>
          <DialogTitle className="text-center text-2xl font-bold">
            {currentFeature.title}
          </DialogTitle>
          <DialogDescription className="text-center text-muted-foreground">
            {currentFeature.description}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 my-6">
          <div className="rounded-2xl border-2 p-6 space-y-4" style={{ borderColor: C2, background: 'white' }}>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-foreground">Premium Membership</h3>
                <p className="text-sm text-muted-foreground mt-1">Everything you need for your journey</p>
              </div>
              <Badge className="text-white px-3 py-1" style={{ background: `linear-gradient(135deg, ${C2}, ${C1})` }}>
                <Sparkles className="h-3.5 w-3.5 mr-1" />
                Popular
              </Badge>
            </div>

            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-bold" style={{ color: C2 }}>$9.99</span>
              <span className="text-muted-foreground">/month</span>
            </div>

            <div className="space-y-3 pt-2">
              <div className="flex items-start gap-2">
                <div className="rounded-full p-0.5 mt-0.5" style={{ background: C2 }}>
                  <Check className="h-3.5 w-3.5 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground flex items-center gap-2">
                    Unlimited AI Chat
                    <Infinity className="h-4 w-4" style={{ color: C2 }} />
                  </p>
                  <p className="text-xs text-muted-foreground">Ask Bloom as many questions as you need, 24/7</p>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <div className="rounded-full p-0.5 mt-0.5" style={{ background: C2 }}>
                  <Check className="h-3.5 w-3.5 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">Ask Real Experts</p>
                  <p className="text-xs text-muted-foreground">Get personalized answers from verified professionals</p>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <div className="rounded-full p-0.5 mt-0.5" style={{ background: C2 }}>
                  <Check className="h-3.5 w-3.5 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">Priority Support</p>
                  <p className="text-xs text-muted-foreground">Get faster responses from our community</p>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <div className="rounded-full p-0.5 mt-0.5" style={{ background: C2 }}>
                  <Check className="h-3.5 w-3.5 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">Expert Consultations</p>
                  <p className="text-xs text-muted-foreground">Book 1-on-1 sessions with specialists</p>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <div className="rounded-full p-0.5 mt-0.5" style={{ background: C2 }}>
                  <Check className="h-3.5 w-3.5 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">Exclusive Content</p>
                  <p className="text-xs text-muted-foreground">Access premium articles and resources</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <Button
            className="w-full text-white font-semibold h-11 rounded-full shadow-lg hover:shadow-xl transition-all"
            style={{ background: `linear-gradient(135deg, ${C2}, ${C1})` }}
            onClick={() => {
              // TODO: Implement payment flow
              alert('Payment integration coming soon!');
            }}
          >
            <Crown className="h-4 w-4 mr-2" />
            Upgrade to Premium
          </Button>
          <Button
            variant="ghost"
            className="w-full"
            onClick={() => onOpenChange(false)}
          >
            Maybe Later
          </Button>
        </div>

        <p className="text-xs text-center text-muted-foreground mt-2">
          Cancel anytime • 30-day money-back guarantee
        </p>
      </DialogContent>
    </Dialog>
  );
}

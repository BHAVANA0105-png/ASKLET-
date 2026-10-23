import React, { useState } from 'react';
import { 
  X, 
  Check, 
  Sparkles, 
  Crown,
  AlertTriangle,
  Receipt,
  RotateCcw,
  CheckCircle2,
  Info
} from 'lucide-react';
import { SubscriptionPlan, SubscriptionStatus } from '../types';

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  subscription: SubscriptionStatus;
  onSuccess: (sub: SubscriptionStatus) => void;
  onCancelSubscription: () => void;
}

export const SubscriptionModal: React.FC<SubscriptionModalProps> = ({
  isOpen,
  onClose,
  subscription,
  onSuccess,
  onCancelSubscription,
}) => {
  const [selectedPlanId, setSelectedPlanId] = useState<'free' | 'monthly' | 'yearly'>('monthly');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successReceipt, setSuccessReceipt] = useState<any | null>(null);

  if (!isOpen) return null;

  const plans: SubscriptionPlan[] = [
    {
      id: 'free',
      name: 'Free Plan',
      price: 0,
      formattedPrice: '₹0',
      currency: 'INR',
      period: 'Free forever',
      badge: 'Basic Features',
      features: [
        'Explain any College Topic Simply',
        'Make High-Yield Short Notes',
        'Take Standard Practice Quizzes',
        'Audio Text-to-Speech playback',
        'Local Study Notebook storage'
      ]
    },
    {
      id: 'monthly',
      name: 'Premium Monthly',
      price: 499,
      formattedPrice: '₹499',
      usdEquivalent: '$5.80',
      currency: 'INR',
      period: '/month',
      popular: true,
      badge: 'Most Popular',
      features: [
        'All Basic Free Features Included',
        'Personalized AI Study Plan Generator',
        'Advanced Collegiate Scenario Quizzes',
        'Exam Readiness & Subject Mastery Analytics',
        'Unlimited AI Explanations & Follow-ups',
        'Cancel Anytime with 1 Click'
      ]
    },
    {
      id: 'yearly',
      name: 'Premium Yearly',
      price: 4999,
      formattedPrice: '₹4999',
      usdEquivalent: '$58.00',
      currency: 'INR',
      period: '/year',
      badge: 'Best Value',
      savings: 'Save ₹989 (17% OFF)',
      features: [
        'Everything in Premium Monthly',
        'Full 12-Month Academic Year Access',
        'Custom Multi-Course Exam Countdown',
        'Deep Theoretical Scenario Case Studies',
        'Comprehensive Subject Mastery Analytics'
      ]
    }
  ];

  const currentPlan = plans.find(p => p.id === selectedPlanId) || plans[1];
  const isCurrentPlanActive = subscription.isSubscribed && subscription.planId === selectedPlanId;

  const handleUpgrade = async () => {
    setErrorMsg(null);
    setLoading(true);

    try {
      const res = await fetch('/api/subscription/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planId: selectedPlanId,
          cardholderName: 'College Student',
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Upgrade failed.');
      }

      setSuccessReceipt(data.receipt);
      onSuccess(data.subscription);
    } catch (err: any) {
      setErrorMsg(err.message || 'Upgrade failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!window.confirm('Do you want to switch back to the Free Plan? You can upgrade anytime.')) {
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/subscription/cancel', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        onCancelSubscription();
        onClose();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative w-full max-w-2xl bg-[#242424] rounded-3xl shadow-2xl border border-[#333333] overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="relative bg-[#181818] border-b border-[#333333] text-white p-6">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-[#242424] border border-[#333333] hover:bg-[#2f2f2f] text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-full bg-white text-black text-xs font-bold uppercase tracking-wider flex items-center gap-1 shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-black" /> Asklet Pricing
            </span>
            <span className="text-xs text-[#A3A3A3] font-medium">Simple &amp; Transparent</span>
          </div>

          <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white">
            Choose Your Study Plan
          </h2>
          <p className="text-xs sm:text-sm text-[#A3A3A3] mt-1 max-w-lg">
            Free basic tools for everyday questions, or Premium for personalized exam roadmaps, advanced scenario quizzes, and analytics.
          </p>
        </div>

        {/* SUCCESS CONFIRMATION MODAL STATE */}
        {successReceipt ? (
          <div className="p-6 sm:p-8 space-y-6 text-center">
            <div className="w-16 h-16 rounded-3xl bg-white text-black mx-auto flex items-center justify-center font-bold">
              <CheckCircle2 className="w-8 h-8 text-black" />
            </div>

            <div className="space-y-1">
              <span className="text-xs font-bold text-[#A3A3A3] uppercase tracking-wider">Account Upgraded</span>
              <h3 className="text-2xl font-extrabold text-white">Upgraded to Premium Successfully!</h3>
              <p className="text-xs sm:text-sm text-[#A3A3A3]">
                You now have full access to Personalized Study Plans, Advanced Scenario Quizzes, and Progress Tracking.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#181818] border border-[#333333] text-left text-xs space-y-2 max-w-md mx-auto">
              <div className="flex justify-between text-[#A3A3A3]">
                <span>Plan:</span>
                <span className="font-bold text-white">{successReceipt.plan}</span>
              </div>
              <div className="flex justify-between text-[#A3A3A3]">
                <span>Amount:</span>
                <span className="font-bold text-white">{successReceipt.amountCharged}</span>
              </div>
              <div className="flex justify-between text-[#A3A3A3]">
                <span>Transaction Ref:</span>
                <span className="font-mono text-white">{successReceipt.transactionId}</span>
              </div>
              <div className="pt-2 border-t border-[#333333] text-[11px] text-[#A3A3A3] font-medium">
                {successReceipt.gatewayNotice}
              </div>
            </div>

            <button
              onClick={() => {
                setSuccessReceipt(null);
                onClose();
              }}
              className="w-full sm:w-auto px-8 py-3 bg-white hover:bg-[#eaeaea] text-black font-bold text-sm rounded-xl transition-all shadow-md cursor-pointer"
            >
              Start Studying with Premium &rarr;
            </button>
          </div>
        ) : (
          <div className="p-6 space-y-6">

            {/* Honest Payment Gateway Disclosure */}
            <div className="p-3.5 rounded-2xl bg-[#181818] border border-[#333333] flex items-start gap-3 text-xs text-white leading-relaxed">
              <Info className="w-4 h-4 text-[#A3A3A3] shrink-0 mt-0.5" />
              <div>
                <strong className="font-bold">Payment Gateway Notice:</strong> A live merchant payment gateway (e.g., Razorpay or Stripe) is not integrated into this sandbox environment. Clicking <strong>Upgrade to Premium</strong> unlocks full Premium features in preview mode without real bank or card deductions.
              </div>
            </div>

            {/* Plans Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {plans.map((p) => {
                const isSelected = selectedPlanId === p.id;
                const isCurrentActive = (p.id === 'free' && !subscription.isSubscribed) || (subscription.isSubscribed && subscription.planId === p.id);

                return (
                  <div
                    key={p.id}
                    onClick={() => setSelectedPlanId(p.id)}
                    className={`relative p-4 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between ${
                      isSelected
                        ? 'border-white bg-[#181818] shadow-md'
                        : 'border-[#333333] hover:border-[#666666] bg-[#242424]'
                    }`}
                  >
                    {p.badge && (
                      <span className="absolute -top-2.5 right-3 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white text-black">
                        {p.badge}
                      </span>
                    )}

                    <div className="space-y-1">
                      <div className="font-bold text-white text-sm flex items-center gap-1.5">
                        {p.id !== 'free' && <Crown className="w-3.5 h-3.5 text-white" />}
                        <span>{p.name}</span>
                      </div>

                      <div className="pt-1 flex items-baseline gap-1">
                        <span className="text-xl font-extrabold text-white">{p.formattedPrice}</span>
                        <span className="text-xs text-[#A3A3A3]">{p.period}</span>
                      </div>

                      {p.usdEquivalent && (
                        <div className="text-[11px] font-semibold text-[#A3A3A3]">
                          ({p.usdEquivalent})
                        </div>
                      )}

                      {p.savings && (
                        <div className="text-[10px] font-bold text-white">
                          {p.savings}
                        </div>
                      )}
                    </div>

                    <div className="mt-3 pt-3 border-t border-[#333333] space-y-1.5 text-[11px] text-[#A3A3A3]">
                      {p.features.slice(0, 3).map((f, i) => (
                        <div key={i} className="flex items-start gap-1.5">
                          <Check className="w-3.5 h-3.5 text-white shrink-0 mt-0.5" />
                          <span className="leading-tight text-white">{f}</span>
                        </div>
                      ))}
                    </div>

                    {isCurrentActive && (
                      <div className="mt-3 text-center py-1 bg-[#181818] text-white border border-white rounded-lg text-[10px] font-bold">
                        Current Active Plan
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Selected Plan Details */}
            <div className="p-4 rounded-2xl bg-[#181818] border border-[#333333] space-y-2">
              <h4 className="text-xs font-bold text-[#A3A3A3] uppercase tracking-wider">
                {currentPlan.name} Includes:
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-white">
                {currentPlan.features.map((feat, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-white shrink-0" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-[#181818] border border-[#444444] text-white text-xs">
                {errorMsg}
              </div>
            )}

            {/* Main Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
              {subscription.isSubscribed ? (
                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={loading}
                  className="text-xs font-semibold text-[#A3A3A3] hover:text-white p-2 order-2 sm:order-1 cursor-pointer"
                >
                  Switch back to Free Plan
                </button>
              ) : (
                <span className="text-xs text-[#A3A3A3] order-2 sm:order-1">
                  Free tier is always available.
                </span>
              )}

              {/* UPGRADED TO PREMIUM BUTTON / UPGRADE BUTTON */}
              {isCurrentPlanActive ? (
                <button
                  type="button"
                  disabled
                  className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#181818] border border-white text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 order-1 sm:order-2 shadow-xs"
                >
                  <Check className="w-4 h-4" />
                  <span>Upgraded to Premium ✓</span>
                </button>
              ) : selectedPlanId === 'free' ? (
                <button
                  type="button"
                  onClick={handleUpgrade}
                  disabled={loading}
                  className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#181818] border border-[#333333] hover:bg-[#2f2f2f] text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 order-1 sm:order-2 transition-colors cursor-pointer"
                >
                  <span>Select Free Plan</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleUpgrade}
                  disabled={loading}
                  className="w-full sm:w-auto px-6 py-3 rounded-xl bg-white hover:bg-[#eaeaea] text-black font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 order-1 sm:order-2 transition-all shadow-md cursor-pointer"
                >
                  {loading ? (
                    <>
                      <RotateCcw className="w-4 h-4 animate-spin" />
                      <span>Activating...</span>
                    </>
                  ) : (
                    <>
                      <Crown className="w-4 h-4" />
                      <span>Upgrade to Premium ({currentPlan.formattedPrice}{currentPlan.period})</span>
                    </>
                  )}
                </button>
              )}
            </div>

          </div>
        )}
      </div>
    </div>
  );
};

'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { Crown, Check, Zap } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface Plan {
  id: string;
  tier: string;
  name: string;
  price: number;
  creditsPerDay: number;
  features: string[];
  popular?: boolean;
}

export default function MembershipPage() {
  const [plans, setPlans] = useState<Plan[]>([]);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const response = await fetch('/api/membership/plans');
        if (response.ok) {
          const data = await response.json();
          setPlans(data.plans || []);
        }
      } catch { /* ignore */ }
    };
    fetchPlans();
  }, []);

  const handleSubscribe = (plan: Plan) => {
    if (plan.price === 0) {
      toast.success('您已在使用免费版');
      return;
    }
    toast.success(`正在跳转到${plan.name}支付页面...`);
  };

  return (
    <div className="min-h-screen">
      <Navbar />

      <main className="pt-24 pb-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-amber-500/10 border border-amber-500/20 rounded-full mb-4">
              <Crown size={14} className="text-amber-400" />
              <span className="text-sm text-amber-400 font-medium">会员方案</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-display font-bold text-white mb-4">
              选择适合您的方案
            </h1>
            <p className="text-gray-400 max-w-xl mx-auto">
              从免费版到企业版，满足不同规模的新媒体创作需求
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {plans.map((plan) => (
              <Card
                key={plan.id}
                variant={plan.popular ? 'gradient' : 'glass'}
                padding="lg"
                className={`relative ${plan.popular ? 'border-teal-500/30 shadow-neon' : ''}`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge variant="teal" size="md">
                      <Zap size={10} className="mr-1" />最受欢迎
                    </Badge>
                  </div>
                )}

                <div className="text-center mb-6">
                  <h3 className="text-lg font-display font-semibold text-white mb-2">{plan.name}</h3>
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-3xl font-display font-bold text-white">
                      {plan.price === 0 ? '免费' : `¥${plan.price}`}
                    </span>
                    {plan.price > 0 && <span className="text-sm text-gray-500">/月</span>}
                  </div>
                  {plan.creditsPerDay > 0 && (
                    <p className="text-xs text-gray-500 mt-1">
                      每日 {plan.creditsPerDay} 次生成额度
                    </p>
                  )}
                  {plan.creditsPerDay === -1 && (
                    <p className="text-xs text-teal-400 mt-1">无限生成额度</p>
                  )}
                </div>

                <ul className="space-y-2.5 mb-6">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-sm text-gray-400">
                      <Check size={14} className="text-teal-400 flex-shrink-0 mt-0.5" />
                      {feature}
                    </li>
                  ))}
                </ul>

                <Button
                  variant={plan.popular ? 'primary' : 'outline'}
                  size="md"
                  className="w-full"
                  onClick={() => handleSubscribe(plan)}
                >
                  {plan.price === 0 ? '当前方案' : '立即订阅'}
                </Button>
              </Card>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

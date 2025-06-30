import React, { useState, useEffect } from 'react';
import { Crown, Heart, CheckCircle } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';
import { STRIPE_PRODUCTS } from '../stripe-config';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

interface UserSubscriptionDisplayProps {
  user: any;
}

const UserSubscriptionDisplay: React.FC<UserSubscriptionDisplayProps> = ({ user }) => {
  const [subscription, setSubscription] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchUserData();
    }
  }, [user]);

  const fetchUserData = async () => {
    try {
      // Fetch subscription data
      const { data: subData, error: subError } = await supabase
        .from('stripe_user_subscriptions')
        .select('*')
        .maybeSingle();

      if (subError) {
        console.error('Error fetching subscription:', subError);
      } else {
        setSubscription(subData);
      }

      // Fetch order history
      const { data: orderData, error: orderError } = await supabase
        .from('stripe_user_orders')
        .select('*')
        .order('order_date', { ascending: false })
        .limit(5);

      if (orderError) {
        console.error('Error fetching orders:', orderError);
      } else {
        setOrders(orderData || []);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getProductName = (priceId: string) => {
    const product = STRIPE_PRODUCTS.find(p => p.priceId === priceId);
    return product?.name || 'Unknown Product';
  };

  const formatDate = (timestamp: number | string) => {
    const date = typeof timestamp === 'number' ? new Date(timestamp * 1000) : new Date(timestamp);
    return date.toLocaleDateString();
  };

  const formatAmount = (amount: number, currency: string = 'usd') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount / 100);
  };

  if (loading) {
    return (
      <div className="bg-neutral-800/40 rounded-xl p-4 border border-neutral-700/30">
        <div className="animate-pulse">
          <div className="h-4 bg-neutral-700 rounded w-1/3 mb-2"></div>
          <div className="h-3 bg-neutral-700 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  // Show supporter status if user has made any donations
  const hasDonated = orders.length > 0;
  const totalDonated = orders.reduce((sum, order) => sum + (order.amount_total || 0), 0);

  if (!hasDonated && !subscription) {
    return null; // Don't show anything if user hasn't supported yet
  }

  return (
    <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-xl p-4 border border-purple-500/20">
      <div className="flex items-center space-x-3 mb-3">
        <Heart className="w-5 h-5 text-red-400" />
        <div>
          <h3 className="text-white font-semibold">FactYou! Supporter</h3>
          <p className="text-gray-300 text-sm">Thank you for supporting independent fact-checking!</p>
        </div>
      </div>

      {/* Subscription Status */}
      {subscription && subscription.subscription_status !== 'not_started' && (
        <div className="mb-4 p-3 bg-green-500/10 rounded-lg border border-green-500/20">
          <div className="flex items-center space-x-2 mb-2">
            <Crown className="w-4 h-4 text-yellow-400" />
            <span className="text-green-300 font-medium">Active Subscription</span>
          </div>
          <div className="text-sm text-gray-300 space-y-1">
            <p>Plan: {getProductName(subscription.price_id)}</p>
            {subscription.current_period_end && (
              <p>Next billing: {formatDate(subscription.current_period_end)}</p>
            )}
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-3 h-3 text-green-400" />
              <span className="text-xs text-green-400">
                Status: {subscription.subscription_status.replace('_', ' ')}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Donation History */}
      {hasDonated && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-gray-300 text-sm">Total Contributed:</span>
            <span className="text-white font-semibold">
              {formatAmount(totalDonated)}
            </span>
          </div>
          
          {orders.length > 0 && (
            <div className="text-xs text-gray-400">
              <p>Recent donations:</p>
              <div className="mt-1 space-y-1">
                {orders.slice(0, 3).map((order, index) => (
                  <div key={index} className="flex justify-between">
                    <span>{formatDate(order.order_date)}</span>
                    <span>{formatAmount(order.amount_total, order.currency)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Supporter Badge */}
      <div className="mt-3 pt-3 border-t border-purple-500/20">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
          <span className="text-purple-300 text-xs font-medium">
            Independent Fact-Checking Supporter
          </span>
        </div>
      </div>
    </div>
  );
};

export default UserSubscriptionDisplay;
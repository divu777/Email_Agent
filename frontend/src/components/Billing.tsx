"use client";
import React, { useEffect, useState, useCallback } from "react";
import {
  ArrowLeft,
  CheckCircle,
  XCircle,
  Clock,
  Zap,
  AlertCircle,
} from "lucide-react";
import axios from "axios";
import { config } from "../config";
import { useRazorpay } from "react-razorpay";

type SubscriptionStatus = "PENDING" | "SUCCESS" | "FAILED" | "CANCELLED";

type Subscription = {
  id: string;
  planId: string;
  subscriptionId: string;
  status: SubscriptionStatus | string;
  startDate?: string | null;
  endDate?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

interface BillingProps {
  onBack?: () => void;
}

const PLAN_CONFIG = {
  id: "plan_Ra6svVScRdCwYW",
  type: "monthly",
  name: "Pro Plan",
  price: 10,
  currency: "₹",
  description:
    "Unlimited AI replies, priority support, and early access to new features.",
  features: [
    { icon: "⚡", text: "Unlimited AI replies" },
    { icon: "🚀", text: "Priority support" },
    { icon: "✨", text: "Early access to features" },
    { icon: "🛡️", text: "Cancel anytime" },
  ],
};

const formatDate = (d?: string | Date | null): string => {
  if (!d) return "-";
  const date = typeof d === "string" ? new Date(d) : d;
  return date.toLocaleDateString();
};

const StatusBadge: React.FC<{ status?: string | null }> = ({ status }) => {
  if (!status)
    return (
      <span className="text-xs px-3 py-1.5 rounded-full bg-gray-100 text-gray-600 font-medium">
        Unknown
      </span>
    );

  const normalized = status.toUpperCase();
  const statusConfig: Record<
    string,
    { bg: string; text: string; icon: React.ReactNode }
  > = {
    SUCCESS: {
      bg: "bg-blue-50",
      text: "text-blue-700",
      icon: <CheckCircle size={12} />,
    },
    ACTIVE: {
      bg: "bg-blue-50",
      text: "text-blue-700",
      icon: <CheckCircle size={12} />,
    },
    PENDING: {
      bg: "bg-amber-50",
      text: "text-amber-700",
      icon: <Clock size={12} />,
    },
    CANCELLED: {
      bg: "bg-red-50",
      text: "text-red-700",
      icon: <XCircle size={12} />,
    },
    FAILED: {
      bg: "bg-red-50",
      text: "text-red-700",
      icon: <XCircle size={12} />,
    },
  };

  const config = statusConfig[normalized] || {
    bg: "bg-gray-100",
    text: "text-gray-700",
    icon: null,
  };

  return (
    <span
      className={`text-xs px-3 py-1.5 rounded-full ${config.bg} ${config.text} flex items-center gap-1.5 w-fit font-medium`}
    >
      {config.icon}
      {normalized}
    </span>
  );
};

const Billing: React.FC<BillingProps> = ({ onBack }) => {
  const {Razorpay} = useRazorpay()
  const [loading, setLoading] = useState(true);
  const [sub, setSub] = useState<Subscription | null>(null);
  const [active, setActive] = useState(false);
  const [working, setWorking] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStatus = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
       const res = await axios.get(`${config.BACKEND_URL}/api/v1/billing/status`, {
        withCredentials: true,
      });

      if(res.data.active===false){
        setSub(null)
        setActive(false)
        return
      }
      setActive(true);
      setSub({
        ...res.data.data
      });
    } catch (err) {
      console.error("Billing: fetchStatus error", err);
      setError("Could not fetch subscription status.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

 

   const handleSubscribe = async () => {
    try {
      setWorking(true);
      setError(null);

      const res = await axios.post(
        `${config.BACKEND_URL}/api/v1/billing/subscribe/create`,
        { planId: "plan_Ra6svVScRdCwYW", planType: "monthly" }, 
        { withCredentials: true }
      );

      if (!res.data?.success) {
        setError("Failed to create subscription. Try again.");
        return;
      }

      const { keyId, subscriptionId } = res.data.data // accommodate both shapes

      if (!subscriptionId || !keyId) {
        setError("Invalid response from server. Missing subscription details.");
        return;
      }

      // Open Razorpay checkout with subscription_id
      const options: any = {
        key: 'rzp_live_RZIfsSwCFc2WJd',
        subscription_id: subscriptionId,
        name: "Vektor",
        description: "Pro Plan subscription",
        theme: { color: "#3b82f6" },
        handler: async (response: any) => {
          try {
            setVerifying(true);
            const verifyRes = await axios.post(
              `${config.BACKEND_URL}/api/v1/billing/payment/verify`,
              {
                razorpaySubscriptionId: response.razorpay_subscription_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
              },
              { withCredentials: true }
            );

            if (verifyRes.data?.success) {
              // refresh status
              await fetchStatus();
            } else {
              setError("Payment verification failed. Check logs.");
            }
          } catch (err: any) {
            console.error("verify error", err);
            setError("Verification failed. Check server logs.");
          } finally {
            setVerifying(false);
          }
        },
        modal: {
          ondismiss: async function () {
            // user dismissed checkout
            // optionally fetch status to ensure DB synced with webhook
            console.log("herr")
            await axios.post(`${config.BACKEND_URL}/api/v1/billing/payment/abandoned`,{
              subscriptionId
            },{
              withCredentials:true
            })
            fetchStatus();
          },
        },
      };

      // open Razorpay. Razorpay script must be loaded on page (you can include script tag in index.html)
      const rzp = new Razorpay(options);
      rzp.open();
    } catch (err: any) {
      console.error("handleSubscribe error", err);
      setError("Unable to start subscription. Try again later.");
    } finally {
      setWorking(false);
    }
  };

const handleCancel = useCallback(async () => {
  if (!sub?.subscriptionId) {
    setError("No subscription found to cancel.");
    return;
  }
  if (!window.confirm("Cancel your subscription?")) return;

  try {
    setWorking(true);
    const res = await axios.post(
      `${config.BACKEND_URL}/api/v1/billing/cancel`,
      {},
      { withCredentials: true }
    );

    if (res.data?.success) {
      setActive(false);
      setSub(null);
    } else {
      setError(res.data?.message || "Cancellation failed.");
    }
  } catch (err) {
    console.error("cancel error", err);
    setError("Failed to cancel subscription.");
  } finally {
    setWorking(false);
  }
}, [sub?.subscriptionId]);


  if (loading)
    return (
      <div className="flex items-center justify-center h-screen w-full">
        <div className="text-sm text-gray-500 animate-pulse">
          Loading subscription...
        </div>
      </div>
    );

  return (
    <div className="w-full min-h-screen bg-white py-12 px-4 overflow-y-auto">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
          >
            <ArrowLeft size={20} className="text-gray-700" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Billing & Subscription</h1>
            <p className="text-sm text-gray-600 mt-1">
              Manage your plan and payment details.
            </p>
          </div>
        </div>

        {/* Active or Inactive Plan */}
        {!active ? (
          <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm hover:shadow-md transition-shadow duration-200">
            <div className="flex flex-col md:flex-row justify-between gap-8">
              <div className="flex-1">
                <h2 className="text-2xl font-bold flex items-center gap-3 mb-4 text-gray-900">
                  <div className="p-2.5 bg-blue-100 rounded-lg">
                    <Zap className="text-blue-500" size={24} />
                  </div>
                  {PLAN_CONFIG.name}
                </h2>
                <p className="text-gray-600 mb-8 leading-relaxed">
                  {PLAN_CONFIG.description}
                </p>
                <ul className="space-y-3 mb-8">
                  {PLAN_CONFIG.features.map((f, i) => (
                    <li key={i} className="flex items-center gap-3">
                      <span className="text-lg">{f.icon}</span>
                      <span className="text-gray-700 font-medium">{f.text}</span>
                    </li>
                  ))}
                </ul>
                <button
                  onClick={handleSubscribe}
                  disabled={working || verifying}
                  className={`px-8 py-3 rounded-lg font-semibold transition-all duration-200 ${
                    working || verifying
                      ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                      : "bg-blue-500 text-white hover:bg-blue-600 shadow-md hover:shadow-lg active:scale-95"
                  }`}
                >
                  {working
                    ? "Starting..."
                    : verifying
                    ? "Verifying..."
                    : "Subscribe Now"}
                </button>
              </div>
              <div className="flex flex-col justify-center items-center md:items-end space-y-2 md:border-l md:border-gray-200 md:pl-8">
                <div className="text-5xl font-bold text-blue-500">
                  {PLAN_CONFIG.currency}{PLAN_CONFIG.price}
                </div>
                <p className="text-gray-600 font-medium">per month</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm space-y-6">
            <div className="flex items-start justify-between flex-wrap gap-4">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-100 rounded-full">
                  <CheckCircle className="text-blue-500" size={24} />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    Subscription Active
                  </h2>
                  <p className="text-sm text-blue-600 font-medium mt-1">
                    You're all set for {PLAN_CONFIG.name}
                  </p>
                </div>
              </div>
              <StatusBadge status={sub?.status} />
            </div>

            <div className="h-px bg-gray-200"></div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="rounded-xl border border-gray-200 p-5 bg-gray-50 hover:bg-gray-100 transition-colors duration-200">
                <p className="text-xs font-semibold text-gray-600 uppercase mb-2">Plan</p>
                <p className="font-bold text-gray-900 text-lg">{PLAN_CONFIG.name}</p>
                <p className="text-sm text-blue-600 font-semibold mt-2">
                  {PLAN_CONFIG.currency}{PLAN_CONFIG.price} / month
                </p>
              </div>
              <div className="rounded-xl border border-gray-200 p-5 bg-gray-50 hover:bg-gray-100 transition-colors duration-200">
                <p className="text-xs font-semibold text-gray-600 uppercase mb-2">
                  Next Billing Date
                </p>
                <p className="font-bold text-gray-900 text-lg">{formatDate(sub?.endDate)}</p>
                <p className="text-sm text-blue-600 font-semibold mt-2">
                  Auto-renewal enabled
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <button
                onClick={handleCancel}
                disabled={working}
                className={`flex-1 px-6 py-3 rounded-lg font-semibold transition-all duration-200 ${
                  working
                    ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                    : "bg-red-500 text-white hover:bg-red-600 shadow-md hover:shadow-lg active:scale-95"
                }`}
              >
                {working ? "Processing..." : "Cancel Subscription"}
              </button>
              <button
                onClick={fetchStatus}
                className="flex-1 px-6 py-3 rounded-lg font-semibold border-2 border-gray-300 text-gray-900 hover:bg-gray-50 transition-all duration-200 active:scale-95"
              >
                Refresh
              </button>
            </div>
          </div>
        )}

        {/* Subscription Details */}
        {sub && (
          <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Subscription Details</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {[
                { label: "Subscription ID", value: sub.subscriptionId },
                { label: "Plan ID", value: sub.planId },
                { label: "Status", value: sub.status },
                { label: "Created", value: formatDate(sub.createdAt) },
                { label: "Start Date", value: formatDate(sub.startDate) },
                { label: "End Date", value: formatDate(sub.endDate) },
              ].map(({ label, value }) => (
                <div
                  key={label}
                  className="rounded-lg border border-gray-200 bg-gray-50 p-4 hover:bg-gray-100 transition-colors duration-200"
                >
                  <p className="text-xs font-semibold text-gray-600 uppercase mb-2">{label}</p>
                  <p className="font-medium text-gray-900 break-all">{value}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="rounded-xl border-2 border-red-300 bg-red-50 text-red-700 p-5 flex gap-4 items-start shadow-sm">
            <AlertCircle size={20} className="flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold mb-1">Error</p>
              <p className="text-sm">{error}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Billing;





/**
 * 
 *
 */
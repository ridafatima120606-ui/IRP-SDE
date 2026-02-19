'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { loyaltyService } from '@/services/phase11Service';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AlertCircle, Check, Copy, Share2, Users } from 'lucide-react';

export default function ReferralProgram() {
  const { isAuthenticated } = useAuth();
  const [token, setToken] = useState<string | null>(null);
  const [referralCode, setReferralCode] = useState('');
  const [copied, setCopied] = useState(false);
  const [referralInput, setReferralInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (isAuthenticated) {
      const storedToken = localStorage.getItem('authToken');
      setToken(storedToken);
    }
  }, [isAuthenticated]);

  const handleGenerateCode = async () => {
    if (!token) return;

    setLoading(true);
    try {
      const result = await loyaltyService.generateReferralCode(token);
      setReferralCode(result.referralCode);
      setSuccess('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate code');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(referralCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleUseCode = async () => {
    if (!token || !referralInput) return;

    setLoading(true);
    try {
      const result = await loyaltyService.useReferralCode(referralInput, token);
      setSuccess(result.message);
      setReferralInput('');
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to apply code');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Referral Program</h2>

      {/* Error Alert */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Success Alert */}
      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex gap-3">
          <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
          <p className="text-green-800">{success}</p>
        </div>
      )}

      {/* Your Referral Code */}
      <Card className="p-6 bg-blue-50 border-blue-200">
        <div className="space-y-4">
          <h3 className="font-semibold flex items-center gap-2">
            <Share2 className="w-5 h-5" />
            Your Referral Code
          </h3>

          {!referralCode ? (
            <Button
              onClick={handleGenerateCode}
              disabled={loading}
              className="w-full"
            >
              {loading ? 'Generating...' : 'Generate My Code'}
            </Button>
          ) : (
            <div className="space-y-3">
              <div className="bg-white border-2 border-blue-300 rounded-lg p-4">
                <p className="text-xs text-gray-600 mb-2">Share this code:</p>
                <div className="flex items-center gap-2">
                  <code className="font-mono text-lg font-bold text-blue-600 flex-1">
                    {referralCode}
                  </code>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCopyCode}
                  >
                    {copied ? (
                      <>
                        <Check className="w-4 h-4" />
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                      </>
                    )}
                  </Button>
                </div>
              </div>

              <div className="text-sm text-blue-700 bg-white p-3 rounded">
                <p className="font-semibold mb-1">Share with friends:</p>
                <div className="flex gap-2 mt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      window.open(
                        `mailto:?subject=Join us&body=Use my referral code: ${referralCode}`,
                        '_blank'
                      );
                    }}
                  >
                    Email
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      window.open(
                        `https://www.facebook.com/sharer/sharer.php?u=${window.location.origin}/auth/register?ref=${referralCode}`,
                        '_blank'
                      );
                    }}
                  >
                    Facebook
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      window.open(
                        `https://twitter.com/intent/tweet?text=Join us using my code: ${referralCode}`,
                        '_blank'
                      );
                    }}
                  >
                    Twitter
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Use Referral Code */}
      <Card className="p-6">
        <h3 className="font-semibold mb-4">Have a Referral Code?</h3>
        <div className="space-y-3">
          <p className="text-sm text-gray-600">
            Enter a friend's referral code to earn 50 bonus points!
          </p>
          <div className="flex gap-2">
            <Input
              placeholder="Enter referral code (e.g., REF-ABCD12-XYZ789)"
              value={referralInput}
              onChange={(e) => setReferralInput(e.target.value.toUpperCase())}
            />
            <Button
              onClick={handleUseCode}
              disabled={!referralInput || loading}
            >
              {loading ? 'Applying...' : 'Apply'}
            </Button>
          </div>
        </div>
      </Card>

      {/* How It Works */}
      <Card className="p-6 bg-green-50 border-green-200">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <Users className="w-5 h-5" />
          How It Works
        </h3>
        <div className="space-y-3 text-sm">
          <div className="flex gap-3">
            <div className="flex-shrink-0 w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center font-bold">
              1
            </div>
            <div>
              <p className="font-semibold">Share your code</p>
              <p className="text-gray-700">Send your referral code to friends</p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="flex-shrink-0 w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center font-bold">
              2
            </div>
            <div>
              <p className="font-semibold">Friend signs up</p>
              <p className="text-gray-700">They enter your code during registration</p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="flex-shrink-0 w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center font-bold">
              3
            </div>
            <div>
              <p className="font-semibold">Both earn rewards</p>
              <p className="text-gray-700">You both get 50 bonus points!</p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

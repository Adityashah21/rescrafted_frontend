import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { ShieldCheck, Mail, ArrowRight, RotateCcw } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import Button from '../components/common/Button';
import Input from '../components/common/Input';

const VerifyOtpPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { verifyEmail, resendOtp } = useAuth();

  const queryParams = new URLSearchParams(location.search);
  const emailParam = queryParams.get('email') || '';

  const [email, setEmail] = useState(emailParam);
  const [otp, setOtp] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState('');
  const [countdown, setCountdown] = useState(30);
  const [canResend, setCanResend] = useState(false);

  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    } else {
      setCanResend(true);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleVerify = async (e) => {
    e.preventDefault();
    if (otp.length !== 6) {
      setServerError('Please enter the complete 6-digit verification code.');
      return;
    }

    try {
      setIsSubmitting(true);
      setServerError('');
      await verifyEmail({ email, otp });
      navigate('/', { replace: true });
    } catch (error) {
      setServerError(error.message || 'Invalid or expired verification code.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResend = async () => {
    if (!canResend || !email) return;
    try {
      setCanResend(false);
      setCountdown(45);
      await resendOtp(email);
    } catch (error) {
      setServerError(error.message || 'Failed to send new code.');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      <div className="w-full max-w-md bg-white rounded-3xl border border-sand-200 p-8 sm:p-10 shadow-soft text-center">
        <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center mx-auto mb-4 shadow-soft">
          <ShieldCheck className="w-7 h-7" />
        </div>

        <h1 className="text-2xl font-black text-forest-950 font-sans">
          Verify Your Email
        </h1>

        <p className="text-xs text-charcoal-muted mt-2 leading-relaxed">
          We sent a 6-digit confirmation code to{' '}
          <strong className="text-forest-900">{email || 'your email'}</strong>. Enter it below to
          activate your account.
        </p>

        {serverError && (
          <div className="my-5 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-900 text-xs font-medium text-left">
            {serverError}
          </div>
        )}

        <form onSubmit={handleVerify} className="flex flex-col gap-5 mt-6 text-left">
          {!emailParam && (
            <Input
              label="Email Address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@domain.com"
              icon={Mail}
              required
            />
          )}

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-charcoal">
              6-Digit Verification Code
            </label>
            <input
              type="text"
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
              placeholder="••••••"
              className="w-full text-center tracking-[12px] text-2xl font-black rounded-2xl border border-sand-300 py-3.5 focus:outline-none focus:border-forest-600 focus:ring-2 focus:ring-forest-100 bg-sand-50/50"
              autoFocus
              required
            />
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            isLoading={isSubmitting}
            className="w-full mt-2"
          >
            Verify & Continue
          </Button>
        </form>

        <div className="mt-6 pt-5 border-t border-sand-100 flex items-center justify-between text-xs text-charcoal-muted">
          <span>Didn't receive the code?</span>
          <button
            type="button"
            onClick={handleResend}
            disabled={!canResend}
            className={`font-bold flex items-center gap-1 transition-colors ${
              canResend
                ? 'text-forest-800 hover:text-forest-950 hover:underline'
                : 'text-charcoal-light cursor-not-allowed'
            }`}
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{canResend ? 'Resend Code' : `Resend in ${countdown}s`}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default VerifyOtpPage;

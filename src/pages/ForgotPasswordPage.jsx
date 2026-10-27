import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';
import authService from '../services/authService';
import Button from '../components/common/Button';
import Input from '../components/common/Input';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      setErrorMessage('');
      await authService.forgotPassword({ email });
      setIsSuccess(true);
    } catch (error) {
      setErrorMessage(error.message || 'Failed to dispatch reset instructions.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      <div className="w-full max-w-md bg-white rounded-3xl border border-sand-200 p-8 sm:p-10 shadow-soft">
        <Link
          to="/login"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-charcoal-light hover:text-forest-800 transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Sign In</span>
        </Link>

        {isSuccess ? (
          <div className="flex flex-col items-center text-center py-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center mb-4 shadow-soft">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <h2 className="text-xl font-bold text-forest-950">Check Your Inbox</h2>
            <p className="text-xs text-charcoal-muted mt-2 leading-relaxed">
              If an account is associated with <strong>{email}</strong>, we have sent instructions to
              reset your password. In local development, check the server console for the link.
            </p>
            <Link to="/login" className="w-full mt-6">
              <Button variant="primary" size="md" className="w-full">
                Return to Login
              </Button>
            </Link>
          </div>
        ) : (
          <div>
            <h1 className="text-2xl font-black text-forest-950 font-sans mb-1.5">
              Reset Your Password
            </h1>
            <p className="text-xs text-charcoal-muted mb-6 leading-relaxed">
              Enter the email address linked to your ResCrafted account, and we'll send you a secure
              reset link.
            </p>

            {errorMessage && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-900 text-xs font-medium">
                {errorMessage}
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <Input
                label="Registered Email Address"
                type="email"
                placeholder="you@domain.com"
                icon={Mail}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />

              <Button
                type="submit"
                variant="primary"
                size="lg"
                isLoading={isSubmitting}
                className="w-full mt-2"
              >
                Send Reset Link
              </Button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default ForgotPasswordPage;

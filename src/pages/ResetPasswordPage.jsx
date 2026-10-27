import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Lock, Eye, EyeOff, CheckCircle } from 'lucide-react';
import authService from '../services/authService';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import { useToast } from '../contexts/ToastContext';

const ResetPasswordPage = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const hasMinLength = password.length >= 8;
  const hasLetter = /[a-zA-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }
    if (!hasMinLength || !hasLetter || !hasNumber) {
      setErrorMessage('Password must be at least 8 characters with letters and numbers.');
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMessage('');
      await authService.resetPassword(token, password);
      toast.success('Your password has been successfully reset.');
      navigate('/', { replace: true });
    } catch (error) {
      setErrorMessage(error.message || 'Password reset link is invalid or has expired.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      <div className="w-full max-w-md bg-white rounded-3xl border border-sand-200 p-8 sm:p-10 shadow-soft">
        <h1 className="text-2xl font-black text-forest-950 font-sans mb-1.5">
          Set New Password
        </h1>
        <p className="text-xs text-charcoal-muted mb-6 leading-relaxed">
          Create a strong password with at least 8 characters, combining letters and numbers.
        </p>

        {errorMessage && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-900 text-xs font-medium">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="relative">
            <Input
              label="New Password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Min 8 characters"
              icon={Lock}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-[34px] text-charcoal-light hover:text-charcoal p-0.5 rounded transition-colors"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          <div className="flex items-center gap-3 text-[11px] text-charcoal-light px-1">
            <span className={hasMinLength ? 'text-emerald-700 font-semibold' : ''}>
              {hasMinLength ? '✓' : '•'} 8+ Chars
            </span>
            <span className={hasLetter ? 'text-emerald-700 font-semibold' : ''}>
              {hasLetter ? '✓' : '•'} Letters
            </span>
            <span className={hasNumber ? 'text-emerald-700 font-semibold' : ''}>
              {hasNumber ? '✓' : '•'} Numbers
            </span>
          </div>

          <Input
            label="Confirm New Password"
            type={showPassword ? 'text' : 'password'}
            placeholder="Re-enter your new password"
            icon={Lock}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />

          <Button
            type="submit"
            variant="primary"
            size="lg"
            isLoading={isSubmitting}
            className="w-full mt-2"
          >
            Update Password
          </Button>
        </form>
      </div>
    </div>
  );
};

export default ResetPasswordPage;

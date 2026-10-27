import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail, Lock, Eye, EyeOff, Leaf, ArrowRight } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import Button from '../components/common/Button';
import Input from '../components/common/Input';

const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Get redirect url from query params if available
  const queryParams = new URLSearchParams(location.search);
  const redirectUrl = queryParams.get('redirect') || '/';

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (values) => {
    try {
      setServerError('');
      await login(values);
      navigate(redirectUrl, { replace: true });
    } catch (error) {
      setServerError(error.message || 'Invalid email or password.');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center py-10 px-4">
      <div className="w-full max-w-md bg-white rounded-3xl border border-sand-200 p-8 sm:p-10 shadow-soft">
        {/* Header */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-forest-800 text-accentLime flex items-center justify-center mb-4 shadow-soft">
            <Leaf className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-black text-forest-950 font-sans">
            Welcome to ResCrafted
          </h1>
          <p className="text-xs text-charcoal-muted mt-1.5">
            Sign in to manage your circular purchases and wishlist
          </p>
        </div>

        {/* Server Error Alert */}
        {serverError && (
          <div className="mb-6 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-900 text-xs font-medium">
            {serverError}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <Input
            label="Email Address"
            type="email"
            placeholder="you@domain.com"
            icon={Mail}
            error={errors.email?.message}
            required
            {...register('email')}
          />

          <div className="relative">
            <Input
              label="Password"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              icon={Lock}
              error={errors.password?.message}
              required
              {...register('password')}
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

          <div className="flex items-center justify-between text-xs pt-1">
            <label className="flex items-center gap-2 cursor-pointer text-charcoal-muted select-none">
              <input
                type="checkbox"
                className="w-4 h-4 rounded border-sand-300 text-forest-800 focus:ring-forest-600"
              />
              <span>Remember me</span>
            </label>

            <Link
              to="/forgot-password"
              className="font-semibold text-forest-800 hover:text-forest-600 hover:underline"
            >
              Forgot password?
            </Link>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            isLoading={isSubmitting}
            className="w-full mt-2"
          >
            Sign In
          </Button>
        </form>

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-sand-100 text-center text-xs text-charcoal-muted">
          Don't have an account?{' '}
          <Link
            to="/register"
            className="font-bold text-forest-800 hover:text-forest-950 hover:underline inline-flex items-center gap-1"
          >
            <span>Create Account</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

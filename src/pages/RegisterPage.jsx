import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail, Lock, User, Phone, Eye, EyeOff, Leaf, Store, ShoppingBag } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import Button from '../components/common/Button';
import Input from '../components/common/Input';

const registerSchema = z
  .object({
    name: z.string().trim().min(2, 'Name must be at least 2 characters'),
    email: z.string().trim().email('Please enter a valid email address'),
    phone: z.string().trim().optional(),
    role: z.enum(['customer', 'seller']).default('customer'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[a-zA-Z]/, 'Must contain at least one letter')
      .regex(/[0-9]/, 'Must contain at least one number'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

const RegisterPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState('');
  const [selectedRole, setSelectedRole] = useState('customer');
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      role: 'customer',
      password: '',
      confirmPassword: '',
    },
  });

  const currentPassword = watch('password', '');
  const hasMinLength = currentPassword.length >= 8;
  const hasLetter = /[a-zA-Z]/.test(currentPassword);
  const hasNumber = /[0-9]/.test(currentPassword);

  const handleRoleChange = (role) => {
    setSelectedRole(role);
    setValue('role', role);
  };

  const onSubmit = async (values) => {
    try {
      setServerError('');
      const { confirmPassword, ...registerPayload } = values;
      await registerUser(registerPayload);
      // Direct login and redirect to home
      navigate('/', { replace: true });
    } catch (error) {
      setServerError(error.message || 'Registration failed.');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center py-10 px-4">
      <div className="w-full max-w-lg bg-white rounded-3xl border border-sand-200 p-8 sm:p-10 shadow-soft">
        {/* Header */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-forest-800 text-accentLime flex items-center justify-center mb-4 shadow-soft">
            <Leaf className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-black text-forest-950 font-sans">
            Create Your Account
          </h1>
          <p className="text-xs text-charcoal-muted mt-1.5">
            Join the community dedicated to giving waste a second life
          </p>
        </div>

        {/* Role Toggle Selector */}
        <div className="grid grid-cols-2 gap-3 p-1.5 bg-sand-100 rounded-2xl mb-6">
          <button
            type="button"
            onClick={() => handleRoleChange('customer')}
            className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition-all ${
              selectedRole === 'customer'
                ? 'bg-white text-forest-950 shadow-soft'
                : 'text-charcoal-muted hover:text-charcoal'
            }`}
          >
            <ShoppingBag className="w-4 h-4 text-forest-700" />
            <span>I want to Shop</span>
          </button>

          <button
            type="button"
            onClick={() => handleRoleChange('seller')}
            className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition-all ${
              selectedRole === 'seller'
                ? 'bg-white text-forest-950 shadow-soft'
                : 'text-charcoal-muted hover:text-charcoal'
            }`}
          >
            <Store className="w-4 h-4 text-forest-700" />
            <span>I am an Artisan / Seller</span>
          </button>
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
            label="Full Name"
            placeholder="e.g. Maya Sharma"
            icon={User}
            error={errors.name?.message}
            required
            {...register('name')}
          />

          <Input
            label="Email Address"
            type="email"
            placeholder="maya@example.com"
            icon={Mail}
            error={errors.email?.message}
            required
            {...register('email')}
          />

          <Input
            label="Phone Number (Optional)"
            type="tel"
            placeholder="+91 98765 43210"
            icon={Phone}
            error={errors.phone?.message}
            {...register('phone')}
          />

          <div className="relative">
            <Input
              label="Password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Min 8 characters"
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

          {/* Password Validation Hints */}
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
            label="Confirm Password"
            type={showPassword ? 'text' : 'password'}
            placeholder="Re-enter your password"
            icon={Lock}
            error={errors.confirmPassword?.message}
            required
            {...register('confirmPassword')}
          />

          <Button
            type="submit"
            variant="primary"
            size="lg"
            isLoading={isSubmitting}
            className="w-full mt-3"
          >
            {selectedRole === 'seller' ? 'Apply as Seller & Create Account' : 'Create Customer Account'}
          </Button>
        </form>

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-sand-100 text-center text-xs text-charcoal-muted">
          Already have an account?{' '}
          <Link
            to="/login"
            className="font-bold text-forest-800 hover:text-forest-950 hover:underline"
          >
            Sign In here
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;

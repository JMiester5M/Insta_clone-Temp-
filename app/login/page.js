'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isLockedOut, setIsLockedOut] = useState(false);
  const [remainingTime, setRemainingTime] = useState(0);
  const { login } = useAuth();
  const router = useRouter();

  // Check lockout status on mount and set up interval
  useEffect(() => {
    checkLockoutStatus();
    const interval = setInterval(() => {
      checkLockoutStatus();
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const checkLockoutStatus = () => {
    const lockoutData = localStorage.getItem('loginLockout');
    if (!lockoutData) {
      setIsLockedOut(false);
      setRemainingTime(0);
      return;
    }

    const { unlockTime } = JSON.parse(lockoutData);
    const now = Date.now();
    
    if (now < unlockTime) {
      setIsLockedOut(true);
      setRemainingTime(Math.ceil((unlockTime - now) / 1000));
    } else {
      // Lockout expired, clear it
      localStorage.removeItem('loginLockout');
      setIsLockedOut(false);
      setRemainingTime(0);
    }
  };

  const getFailedAttempts = () => {
    const attemptsData = localStorage.getItem('loginAttempts');
    return attemptsData ? JSON.parse(attemptsData) : { count: 0 };
  };

  const incrementFailedAttempts = () => {
    const attempts = getFailedAttempts();
    attempts.count += 1;
    localStorage.setItem('loginAttempts', JSON.stringify(attempts));

    // Check if we need to lock out the user
    if (attempts.count % 3 === 0) {
      const lockoutCycles = Math.floor(attempts.count / 3);
      const lockoutMinutes = 5 * lockoutCycles; // 5 min, 10 min, 15 min, etc.
      const unlockTime = Date.now() + (lockoutMinutes * 60 * 1000);
      

          {isLockedOut && (
            <div className="bg-orange-50 border border-orange-200 text-orange-800 px-4 py-3 rounded-lg mb-4">
              <p className="font-medium">Account Temporarily Locked</p>
              <p className="text-sm">Time remaining: {formatTime(remainingTime)}</p>
            </div>
          )}
      localStorage.setItem('loginLockout', JSON.stringify({ unlockTime }));
      setIsLockedOut(true);
      setRemainingTime(lockoutMinutes * 60);
      
      return lockoutMinutes;
    }
    
    return null;
  };

  const resetFailedAttempts = () => {
    localStorage.removeItem('loginAttempts');
    localStorage.removeItem('loginLockout');
    setIsLockedOut(false);
    setRemainingTime(0);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (isLockedOut) {
      setError(`Account locked. Please try again in ${formatTime(remainingTime)}`);
      return;
    }
    
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      resetFailedAttempts(); // Clear failed attempts on successful login
      router.push('/');
    } catch (err) {
      // Handle specific Firebase authentication errors
      let errorMessage = 'Failed to log in';
      if (err.code === 'auth/user-not-found') {
        errorMessage = 'No account found with this email. Please sign up first.';
      } else if (err.code === 'auth/wrong-password') {
        errorMessage = 'Invalid email or password. Please try again.';
      } else if (err.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address format.';
      } else if (err.code === 'auth/too-many-requests') {
        errorMessage = 'Too many failed login attempts. Please try again later.';
      } else if (err.code === 'auth/user-disabled') {
        errorMessage = 'This account has been disabled.';
      } else if (err.message) {
        errorMessage = err.message;
      }
      // Increment failed attempts and check for lockout
      const lockoutMinutes = incrementFailedAttempts();
      if (lockoutMinutes) {
        errorMessage = `Too many failed attempts. Account locked for ${lockoutMinutes} minute${lockoutMinutes > 1 ? 's' : ''}.`;
      } else {
        const attempts = getFailedAttempts();
        const remaining = 3 - (attempts.count % 3);
        errorMessage += ` (${remaining} attempt${remaining > 1 ? 's' : ''} remaining before lockout)`;
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2 text-center">
            Welcome Back
          </h1>
          <p className="text-gray-600 text-center mb-6">
            Sign in to your account
          </p>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                placeholder="you@example.com"
              />
            </div>

            <div className="mb-6">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading || isLockedOut}
              className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors mb-4"
            >
              {isLockedOut ? `Locked (${formatTime(remainingTime)})` : loading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>

          <p className="text-center text-gray-600">
            Don't have an account?{' '}
            <Link href="/signup" className="text-blue-600 hover:text-blue-800 font-medium">
              Sign Up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

import type React from 'react';

import { useState } from 'react';
// import Link from "next/link"
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../ui/card';
import { Input } from '../../ui/input';
import { Button } from '../../ui/button';
import { Link } from 'react-router';
import { Label } from '../../ui/label';

export const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle forgot password logic here
    console.log('Password reset request for:', email);
    setIsSubmitted(true);
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-slate-950 to-pink-900/20"></div>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fillRule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fillOpacity%3D%220.02%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%221%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')]"></div>

        <div className="relative w-full max-w-md">
          <Card className="bg-slate-900/80 backdrop-blur border-slate-800 shadow-2xl">
            <CardHeader className="text-center pb-6">
              <div className="flex justify-center mb-4">
                <div className="h-16 w-16 rounded-full bg-green-500/20 flex items-center justify-center">
                  <CheckCircle className="h-8 w-8 text-green-400" />
                </div>
              </div>

              <CardTitle className="text-2xl text-white">Check Your Email</CardTitle>
              <CardDescription className="text-slate-400">
                We've sent a password reset link to <br />
                <span className="text-white font-medium">{email}</span>
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              <div className="text-center space-y-4">
                <p className="text-sm text-slate-400">
                  Didn't receive the email? Check your spam folder or try again.
                </p>

                <Button
                  onClick={() => setIsSubmitted(false)}
                  variant="outline"
                  className="w-full bg-slate-800 border-slate-700 text-white hover:bg-slate-700"
                >
                  Try Different Email
                </Button>

                <Link
                  to="/login"
                  className="inline-block text-purple-400 hover:text-purple-300 text-sm transition-colors"
                >
                  Back to Sign In
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-slate-950 to-pink-900/20"></div>
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fillRule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fillOpacity%3D%220.02%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%221%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')]"></div>

      <div className="relative w-full max-w-md">
        {/* Back to Login */}
        <Link
          to="/login"
          className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-8 group"
        >
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
          Back to Sign In
        </Link>

        <Card className="bg-slate-900/80 backdrop-blur border-slate-800 shadow-2xl">
          <CardHeader className="text-center pb-6">
            {/* Logo */}
            <div className="flex items-center justify-center space-x-2 mb-4">
              <div className="h-10 w-10 rounded bg-gradient-to-br from-purple-500 to-pink-500"></div>
              <span className="text-2xl font-bold text-white">CineContext</span>
            </div>

            <CardTitle className="text-2xl text-white">Reset Password</CardTitle>
            <CardDescription className="text-slate-400">
              Enter your email address and we'll send you a link to reset your password
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email Field */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-slate-300">
                  Email
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="pl-10 bg-slate-800 border-slate-700 text-white placeholder:text-slate-400 focus:border-purple-500 focus:ring-purple-500"
                    required
                  />
                </div>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-medium py-2.5 transition-all duration-200 transform hover:scale-[1.02]"
              >
                Send Reset Link
              </Button>
            </form>

            {/* Back to Login */}
            <div className="text-center">
              <span className="text-slate-400">Remember your password? </span>
              <Link
                to="/login"
                className="text-purple-400 hover:text-purple-300 font-medium transition-colors"
              >
                Sign in
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

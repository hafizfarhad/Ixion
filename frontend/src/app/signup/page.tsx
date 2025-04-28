'use client';
import SignupForm from '@/components/SignupForm';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function SignupPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#1c1c1c]">
      {/* Header */}
      <Header />

      {/* Main content */}
      <main className="flex grow items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-white">Create an Account</h1>
            <p className="text-gray-400 mt-2">Sign up to get started with Ixion</p>
          </div>

          {/* Card with signup form */}
          <div className="auth-card">
            <SignupForm />
          </div>

          {/* Login option */}
          <div className="text-center mt-6">
            <p className="text-sm text-gray-400">
              Already have an account?{' '}
              <Link href="/login" className="text-purple-400 hover:text-purple-300">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
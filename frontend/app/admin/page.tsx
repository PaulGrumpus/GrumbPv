'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Button from '@/components/button';
import Input from '@/components/Input';
import { adminLogin } from '@/utils/adminFunctions';
import { useAdmin } from '@/context/adminContext';
import SmallLoading from '@/components/smallLoading';

const AdminLoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { adminInfo, setAdminInfo, isLoading } = useAdmin();

  useEffect(() => {
    if (!isLoading && adminInfo) {
      router.push('/admin/dashboard');
    }
  }, [adminInfo, isLoading, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await adminLogin(email, password);

    if (result.success && result.data) {
      setAdminInfo(result.data);
      router.push('/admin/dashboard');
    } else {
      setError(result.error || 'Login failed');
    }

    setLoading(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-[#2F3DF6]/10 to-[#7E3FF2]/10">
        <SmallLoading />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-[#2F3DF6]/10 to-[#7E3FF2]/10 px-4">
      <div className="w-full max-w-md">
        <div className="linear-border rounded-xl p-0.5">
          <div className="linear-border__inner rounded-[0.6875rem] bg-white p-8">
            <div className="flex flex-col items-center mb-8">
              <Image
                src="/Grmps/logo1.svg"
                alt="Logo"
                width={60}
                height={60}
                className="mb-4"
              />
              <h1 className="text-title font-bold text-black">Admin Panel</h1>
              <p className="text-normal text-gray-500 mt-2">Sign in to access the admin dashboard</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-small font-medium text-black mb-2">
                  Email Address
                </label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@example.com"
                  required
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-small font-medium text-black mb-2">
                  Password
                </label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                />
              </div>

              {error && (
                <div className="text-red-500 text-small text-center bg-red-50 p-3 rounded-lg">
                  {error}
                </div>
              )}

              <Button
                onClick={() => {}}
                padding="px-6 py-3 w-full"
                variant={loading ? 'disable' : 'primary'}
              >
                {loading ? <SmallLoading /> : 'Sign In'}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLoginPage;

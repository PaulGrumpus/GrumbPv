'use client';

import { useAdmin } from '@/context/adminContext';
import { useWallet } from '@/context/walletContext';
import Image from 'next/image';
import { EscrowBackendConfig } from '@/config/config';
import Button from '../button';
import { resetPassword } from '@/utils/functions';
import { useEffect, useState } from 'react';
import { getAdminSystemSettings } from '@/utils/adminFunctions';

const AdminSettingsSection = () => {
  const { adminInfo } = useAdmin();
  const { address, chainId, isConnected, isConnecting, error, connect, disconnect } = useWallet();
  const [resetPasswordAlert, setResetPasswordAlert] = useState(''); 
  const [arbiterAddress, setArbiterAddress] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const handleResetPassword = async () => {
    const response = await resetPassword(adminInfo?.email || '');
    if(response.success) {
      setResetPasswordAlert("A password reset email has been sent to your email address.");
    } else {
      setResetPasswordAlert(response.error || "Something went wrong!");
    }
  }
  const handleWalletConnect = async () => {
    await connect(adminInfo?.email);
  };

  useEffect(() => {
    const loadSettings = async () => {
      const result = await getAdminSystemSettings();
      if(result.success && result.data) {
        setArbiterAddress(result.data.arbiter_address);
      }
    };
    loadSettings();
  }, []);

  useEffect(() => {
    if(address?.toLowerCase() !== arbiterAddress?.toLowerCase()) {
      setErrorMessage('Connected wallet is not the arbiter wallet. Please connect to the correct wallet.');
    } else {
      setErrorMessage(null);
    }
  }, [address, arbiterAddress]);

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Admin Profile */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h2 className="text-large font-bold text-black mb-6">Admin Profile</h2>
        
        <div className="flex flex-col items-start gap-6 mb-6 sm:flex-row sm:items-center">
          <div className="w-20 h-20 rounded-full bg-linear-to-r from-[#2F3DF6] to-[#7E3FF2] flex items-center justify-center text-white font-bold text-display">
            {adminInfo?.display_name?.charAt(0).toUpperCase() || 'A'}
          </div>
          <div>
            <h3 className="text-subtitle font-bold text-black">
              {adminInfo?.display_name || 'Admin'}
            </h3>
            <p className="text-normal text-gray-500">{adminInfo?.email}</p>
            <span className="inline-block mt-2 text-tiny px-3 py-1 rounded-full bg-purple-100 text-purple-700 font-medium">
              {adminInfo?.role?.toUpperCase()}
            </span>
          </div>          
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-small text-gray-500 mb-1">User ID</p>
            <p className="text-normal text-black font-mono text-sm truncate">{adminInfo?.id}</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-small text-gray-500 mb-1">Role</p>
            <p className="text-normal text-black capitalize">{adminInfo?.role}</p>
          </div>
        </div>
      </div>

      {/* System Information */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h2 className="text-large font-bold text-black mb-6">System Information</h2>
        
        <div className="space-y-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:justify-between sm:items-center p-4 bg-gray-50 rounded-lg">
            <span className="text-normal text-gray-600">API Base URL</span>
            <span className="text-small text-black font-mono break-all">{EscrowBackendConfig.baseURL}</span>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:justify-between sm:items-center p-4 bg-gray-50 rounded-lg">
            <span className="text-normal text-gray-600">Admin Panel Version</span>
            <span className="text-small text-black font-mono">1.0.0</span>
          </div>
        </div>
      </div>

      {/* Quick Links */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h2 className="text-large font-bold text-black mb-6">Quick Links</h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <a
            href="/api-docs"
            target="_blank"
            rel="noopener noreferrer"
            className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <p className="text-normal font-medium text-black">API Documentation</p>
            <p className="text-small text-gray-500">View Swagger docs</p>
          </a>
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <p className="text-normal font-medium text-black">Main Platform</p>
            <p className="text-small text-gray-500">Visit the main site</p>
          </a>
        </div>
      </div>

      {/* Admin Wallet */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h2 className="text-large font-bold text-black mb-2">Admin Wallet</h2>
        <p className="text-small text-gray-500 mb-4">
          Connect the arbiter wallet to resolve disputes from the admin panel.
        </p>

        <div className="space-y-3">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="text-small text-gray-500">Status</p>
              <p className="text-normal text-black font-medium">
                {isConnected ? 'Connected' : 'Not connected'}
              </p>
            </div>
            {isConnected ? (
              <Button
                variant="primary"
                padding="px-4 py-2"
                borderRadius="rounded-full"
                onClick={disconnect}
              >
                Disconnect
              </Button>
            ) : (
              <Button
                variant={isConnecting ? 'disable' : 'primary'}
                padding="px-4 py-2"
                borderRadius="rounded-full"
                onClick={isConnecting ? undefined : handleWalletConnect}
              >
                {isConnecting ? 'Connecting...' : 'Connect Wallet'}
              </Button>
            )}
          </div>

          {isConnected && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-small text-gray-500 mb-1">Wallet Address</p>
                {address?.toLowerCase() === arbiterAddress?.toLowerCase() ? (
                  <p className="text-small text-green-500 font-mono break-all">{address}</p>
                ) : (
                  <p className="text-small text-red-500 font-mono break-all">{address}</p>
                )}
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-small text-gray-500 mb-1">Chain ID</p>
                <p className="text-normal text-black">{chainId || 'N/A'}</p>
              </div>
            </div>
          )}

          {error && <p className="text-small text-red-600">{error}</p>}
          {errorMessage && <p className="text-small text-red-600">{errorMessage}</p>}
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className='flex flex-col gap-2 flex-left'>
          <div className='flex-left w-full'>
            <Button 
              variant='primary' 
              padding='px-4 py-2' 
              borderRadius='rounded-full' 
              wrapperClassName='relative w-full sm:w-auto sm:self-end'
              onClick={handleResetPassword}
            >
              Reset Password
            </Button>
          </div>
          {resetPasswordAlert && <p className="text-normal font-regular text-green-500">{resetPasswordAlert}</p>}
        </div>
      </div>
    </div>
  );
};

export default AdminSettingsSection;

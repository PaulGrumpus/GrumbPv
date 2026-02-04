'use client';

import { useAdmin } from '@/context/adminContext';
import Image from 'next/image';
import { EscrowBackendConfig } from '@/config/config';

const AdminSettingsSection = () => {
  const { adminInfo } = useAdmin();

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Admin Profile */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h2 className="text-large font-bold text-black mb-6">Admin Profile</h2>
        
        <div className="flex items-center gap-6 mb-6">
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

        <div className="grid grid-cols-2 gap-4">
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
          <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
            <span className="text-normal text-gray-600">API Base URL</span>
            <span className="text-small text-black font-mono">{EscrowBackendConfig.baseURL}</span>
          </div>
          <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
            <span className="text-normal text-gray-600">Admin Panel Version</span>
            <span className="text-small text-black font-mono">1.0.0</span>
          </div>
        </div>
      </div>

      {/* Quick Links */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h2 className="text-large font-bold text-black mb-6">Quick Links</h2>
        
        <div className="grid grid-cols-2 gap-4">
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
    </div>
  );
};

export default AdminSettingsSection;

'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { useAdmin } from '@/context/adminContext';
import Loading from '@/components/loading';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminUsersSection from '@/components/admin/AdminUsersSection';
import AdminGigsSection from '@/components/admin/AdminGigsSection';
import AdminJobsSection from '@/components/admin/AdminJobsSection';
import AdminConversationsSection from '@/components/admin/AdminConversationsSection';
import AdminSettingsSection from '@/components/admin/AdminSettingsSection';
import AdminSettingsParamSection from '@/components/admin/AdminSettingsParamSection';
import AdminOverview from '@/components/admin/AdminOverview';

type SectionSlug =
  | 'overview'
  | 'users'
  | 'jobs'
  | 'gigs'
  | 'conversations'
  | 'admin-settings'
  | 'system-settings';

const SECTION_CONFIG: Record<SectionSlug, { label: string; render: () => React.ReactNode }> = {
  overview: {
    label: 'Overview',
    render: () => <AdminOverview />,
  },
  users: {
    label: 'Users',
    render: () => <AdminUsersSection />,
  },
  jobs: {
    label: 'Jobs',
    render: () => <AdminJobsSection />,
  },
  gigs: {
    label: 'Gigs',
    render: () => <AdminGigsSection />,
  },
  conversations: {
    label: 'Conversations',
    render: () => <AdminConversationsSection />,
  },
  'admin-settings': {
    label: 'Admin Settings',
    render: () => <AdminSettingsSection />,
  },
  'system-settings': {
    label: 'System Settings',
    render: () => <AdminSettingsParamSection />,
  },
};

const DEFAULT_SECTION: SectionSlug = 'overview';

const AdminDashboardContent = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { adminInfo, isLoading, logout } = useAdmin();
  const [loading, setLoading] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const querySlug = (searchParams.get('view') ?? DEFAULT_SECTION) as SectionSlug;
  const normalizedSlug = (Object.keys(SECTION_CONFIG) as SectionSlug[]).includes(querySlug)
    ? querySlug
    : DEFAULT_SECTION;
  const activeSection = SECTION_CONFIG[normalizedSlug];

  useEffect(() => {
    if (!isLoading) {
      if (!adminInfo) {
        router.push('/admin');
      } else {
        setLoading(false);
      }
    }
  }, [adminInfo, isLoading, router]);

  const handleSectionChange = (section: SectionSlug) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('view', section);
    router.replace(`/admin/dashboard?${params.toString()}`, { scroll: false });
    setMobileSidebarOpen(false);
  };

  const handleLogout = () => {
    logout();
    router.push('/admin');
  };

  if (loading || isLoading) {
    return <Loading />;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      {mobileSidebarOpen && (
        <button
          type="button"
          aria-label="Close sidebar overlay"
          className="fixed inset-0 z-30 bg-black/40 md:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}
      {/* Sidebar - Left side */}
      <div
        className={`w-[85%] max-w-xs md:w-64 bg-white border-l md:border-l-0 md:border-b-0 md:border-r border-gray-200 flex flex-col fixed right-0 top-0 bottom-0 z-40 transform transition-transform duration-300 md:left-0 md:right-auto md:translate-x-0 ${mobileSidebarOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        {/* Logo */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Image src="/Grmps/grmps.jpg" alt="Logo" width={40} height={40} className="rounded-full object-cover" />
              <span className="text-large font-bold text-black">Admin Panel</span>
            </div>
            <button
              type="button"
              aria-label="Close sidebar"
              onClick={() => setMobileSidebarOpen(false)}
              className="text-2xl font-medium text-black md:hidden"
            >
              ×
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 overflow-y-auto">
          <AdminSidebar
            activeSection={normalizedSlug}
            onSectionChange={handleSectionChange}
          />
        </nav>

        {/* Admin Info & Logout */}
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center gap-3 mb-4 p-2 bg-gray-50 rounded-lg">
            <div className="w-10 h-10 rounded-full bg-linear-to-r from-[#2F3DF6] to-[#7E3FF2] flex items-center justify-center text-white font-bold">
              {adminInfo?.display_name?.charAt(0).toUpperCase() || 'A'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-small font-medium text-black truncate">
                {adminInfo?.display_name || 'Admin'}
              </p>
              <p className="text-tiny text-gray-500 truncate">{adminInfo?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
            <span className="text-normal font-medium">Logout</span>
          </button>
        </div>
      </div>

      {/* Main Content - Right side */}
      <div className="flex-1 md:ml-64">
        <div className="p-4 sm:p-6 md:p-8">
          <div className="mb-6 flex items-center justify-between md:hidden">
            <div className="flex items-center gap-3">
              <Image src="/Grmps/grmps.jpg" alt="Logo" width={32} height={32} className="rounded-full object-cover" />
              <span className="text-normal font-semibold text-black">Admin Panel</span>
            </div>
            <button
              type="button"
              aria-label="Open sidebar"
              onClick={() => setMobileSidebarOpen(true)}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 bg-white shadow-sm"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-black"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
          <div className="mb-8">
            <h1 className="text-display font-bold text-black">{activeSection.label}</h1>
          </div>
          {activeSection.render()}
        </div>
      </div>
    </div>
  );
};

const AdminDashboardPage = () => (
  <Suspense fallback={<Loading />}>
    <AdminDashboardContent />
  </Suspense>
);

export default AdminDashboardPage;

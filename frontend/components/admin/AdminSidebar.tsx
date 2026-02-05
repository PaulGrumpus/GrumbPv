'use client';

import Image from 'next/image';

type SectionSlug =
  | 'overview'
  | 'users'
  | 'jobs'
  | 'gigs'
  | 'conversations'
  | 'system-settings'
  | 'admin-settings';

interface AdminSidebarProps {
  activeSection: SectionSlug;
  onSectionChange: (section: SectionSlug) => void;
}

const sidebarItems: { slug: SectionSlug; label: string; icon: string }[] = [
  { slug: 'overview', label: 'Overview', icon: '/Grmps/pie-chart-alt.svg' },
  { slug: 'users', label: 'Users', icon: '/Grmps/face-smile.svg' },
  { slug: 'jobs', label: 'Jobs', icon: '/Grmps/layer.svg' },
  { slug: 'gigs', label: 'Gigs', icon: '/Grmps/star.svg' },
  { slug: 'conversations', label: 'Conversations', icon: '/Grmps/chat.svg' },
  { slug: 'system-settings', label: 'System Settings', icon: '/Grmps/setting.svg' },
  { slug: 'admin-settings', label: 'Admin Settings', icon: '/Grmps/setting.svg' },
];

const AdminSidebar = ({ activeSection, onSectionChange }: AdminSidebarProps) => {
  return (
    <ul className="space-y-1">
      {sidebarItems.map((item) => {
        const isActive = activeSection === item.slug;

        return (
          <li key={item.slug}>
            <button
              onClick={() => onSectionChange(item.slug)}
              className={`cursor-pointer w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                isActive
                  ? 'bg-linear-to-r from-[#2F3DF6]/10 to-[#7E3FF2]/10 text-[#7E3FF2] font-medium'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Image
                src={item.icon}
                alt={item.label}
                width={20}
                height={20}
                className={isActive ? 'opacity-100' : 'opacity-60'}
              />
              <span className="text-normal">{item.label}</span>
            </button>
          </li>
        );
      })}
    </ul>
  );
};

export default AdminSidebar;

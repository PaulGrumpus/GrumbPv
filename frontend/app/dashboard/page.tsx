'use client'

import Sidebar from "@/components/sidebar";
import DashboardOverview from "@/components/dashboard/dashboardOverview";
import MyGigsSection from "@/components/dashboard/myGigsSection";
import MyBidsSection from "@/components/dashboard/myBidsSection";
import CreateGigSection from "@/components/dashboard/createGigSection";
import MyJobsSection from "@/components/dashboard/myJobsSection";
import CreateJobSection from "@/components/dashboard/createJobSection";
import { Suspense, useMemo, type ReactNode } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CONFIG } from "@/config/config";

type SectionSlug = "dashboard" | "my-gigs" | "create-gig" | "my-bids" | "my-jobs" | "create-job";

const SECTION_CONFIG: Record<SectionSlug, { label: string; render: () => ReactNode }> = {
    "dashboard": {
        label: "Dashboard",
        render: () => <DashboardOverview />,
    },
    "my-gigs": {
        label: "My Gigs",
        render: () => <MyGigsSection />,
    },
    "create-gig": {
        label: "Create Gig",
        render: () => <CreateGigSection />,
    },
    "my-bids": {
        label: "My Bids",
        render: () => <MyBidsSection />,
    },
    "my-jobs": {
        label: "My Jobs",
        render: () => <MyJobsSection />,
    },
    "create-job": {
        label: "Create Job",
        render: () => <CreateJobSection />,
    },
};

const LABEL_TO_SLUG: Record<string, SectionSlug> = {
    Dashboard: "dashboard",
    "My Gigs": "my-gigs",
    Gigs: "my-gigs",
    "Create Gig": "create-gig",
    "My Bids": "my-bids",
    "My Jobs": "my-jobs",
    Jobs: "my-jobs",
    "Create Job": "create-job",
};

const SLUG_TO_SIDEBAR_LABEL: Record<SectionSlug, string> = {
    "dashboard": "Dashboard",
    "my-gigs": "Gigs",
    "create-gig": "Create Gig",
    "my-bids": "My Bids",
    "my-jobs": "Jobs",
    "create-job": "Create Job",
};

const DEFAULT_SECTION: SectionSlug = "dashboard";

const userRole:string = CONFIG.userRole;

const DashboardPageContent = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const querySlug = (searchParams.get("view") ?? DEFAULT_SECTION) as SectionSlug;
    const normalizedSlug = (Object.keys(SECTION_CONFIG) as SectionSlug[]).includes(querySlug)
        ? querySlug
        : DEFAULT_SECTION;
    const activeSection = SECTION_CONFIG[normalizedSlug];
    const selectedSidebarLabel = SLUG_TO_SIDEBAR_LABEL[normalizedSlug] ?? activeSection.label;

    const freelancerSidebarItems = useMemo(() => ([
        {
            icon: "/Grmps/pie-chart-alt.svg",
            label: "Dashboard",
            count: 0,
        },
        {
            icon: "/Grmps/layer.svg",
            label: "My Gigs",
            count: 0,
            subItems: [
                { label: "Gigs" },
                { label: "Create Gig" },
            ],
        },
        {
            icon: "/Grmps/star.svg",
            label: "My Bids",
            count: 24,
        },
    ]), []);

    const clientSidebarItems = useMemo(() => ([
        {
            icon: "/Grmps/pie-chart-alt.svg",
            label: "Dashboard",
            count: 0,
        },
        {
            icon: "/Grmps/layer.svg",
            label: "My Jobs",
            count: 0,
            subItems: [
                { label: "Jobs" },
                { label: "Create Job" },
            ],
        },
    ]), []);

    const handleSectionChange = (label: string) => {
        const slug = LABEL_TO_SLUG[label] ?? DEFAULT_SECTION;
        const params = new URLSearchParams(searchParams.toString());
        params.set("view", slug);
        router.replace(`/dashboard?${params.toString()}`, { scroll: false });
    };

    return (
        <div className="flex gap-20">
            <Sidebar
                sidebarItems={userRole === "freelancer" ? freelancerSidebarItems : clientSidebarItems}
                selectedLabel={selectedSidebarLabel}
                onSelect={(item) => handleSectionChange(item.label)}
            />
            <div className="flex-1">
                {activeSection.render()}
            </div>
        </div>
    );
};

const DashboardPage = () => (
    <Suspense fallback={<div className="w-full py-10 text-center">Loading dashboard...</div>}>
        <DashboardPageContent />
    </Suspense>
);

export default DashboardPage
'use client'

import Sidebar from "@/components/sidebar";
import DashboardOverview from "@/components/dashboard/dashboardOverview";
import MyGigsSection from "@/components/dashboard/myGigsSection";
import MyBidsSection from "@/components/dashboard/myBidsSection";
import CreateGigSection from "@/components/dashboard/createGigSection";
import { useMemo, type ReactNode } from "react";
import { useRouter, useSearchParams } from "next/navigation";

type SectionSlug = "dashboard" | "my-gigs" | "create-gig" | "my-bids";

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
};

const LABEL_TO_SLUG: Record<string, SectionSlug> = {
    Dashboard: "dashboard",
    "My Gigs": "my-gigs",
    Gigs: "my-gigs",
    "Create Gig": "create-gig",
    "My Bids": "my-bids",
};

const SLUG_TO_SIDEBAR_LABEL: Record<SectionSlug, string> = {
    "dashboard": "Dashboard",
    "my-gigs": "Gigs",
    "create-gig": "Create Gig",
    "my-bids": "My Bids",
};

const DEFAULT_SECTION: SectionSlug = "dashboard";

const DashboardPage = () => {
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

    const handleSectionChange = (label: string) => {
        const slug = LABEL_TO_SLUG[label] ?? DEFAULT_SECTION;
        const params = new URLSearchParams(searchParams.toString());
        params.set("view", slug);
        router.replace(`/dashboard?${params.toString()}`, { scroll: false });
    };

    return (
        <div className="flex gap-20">
            <Sidebar
                sidebarItems={freelancerSidebarItems}
                selectedLabel={selectedSidebarLabel}
                onSelect={(item) => handleSectionChange(item.label)}
            />
            <div className="flex-1">
                {activeSection.render()}
            </div>
        </div>
    );
};

export default DashboardPage
'use client'

import Sidebar from "@/components/sidebar";
import DashboardOverview from "@/components/dashboard/dashboardOverview";
import MyGigsSection from "@/components/dashboard/myGigsSection";
import MyBidsSection from "@/components/dashboard/myBidsSection";
import CreateGigSection from "@/components/dashboard/createGigSection";
import { useMemo, useState } from "react";

const DashboardPage = () => {
    const [activeSection, setActiveSection] = useState("Dashboard");

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

    const renderActiveSection = () => {
        switch (activeSection) {
            case "My Gigs":
            case "Gigs":
                return <MyGigsSection />;
            case "Create Gig":
                return <CreateGigSection />;
            case "My Bids":
                return <MyBidsSection />;
            default:
                return <DashboardOverview />;
        }
    };

    return (
        <div className="flex gap-20">
            <Sidebar
                sidebarItems={freelancerSidebarItems}
                selectedLabel={activeSection}
                onSelect={(item) => setActiveSection(item.label)}
            />
            <div className="flex-1">
                {renderActiveSection()}
            </div>
        </div>
    );
};

export default DashboardPage
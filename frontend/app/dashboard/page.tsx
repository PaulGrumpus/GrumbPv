import DashboardPosts from "@/components/dashboardPosts";

const DashboardPage = () => {
    return (
        <div className="pt-34 pb-8.75 px-16 bg-white">
            <div className="container mx-auto">
                <h1 className="text-display font-bold text-black">Dashboard</h1>
                <DashboardPosts />
            </div>
        </div>
    )
}

export default DashboardPage
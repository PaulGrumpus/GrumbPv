import type { ReactNode } from 'react';

const DashboardLayout = ({ children }: { children: ReactNode }) => {
    return (
        <div className="lg:pt-34 pt-22 pb-8.75 lg:px-16 px-4 bg-white">
            <div className="container mx-auto">
                {children}
            </div>
        </div>
    )
}

export default DashboardLayout
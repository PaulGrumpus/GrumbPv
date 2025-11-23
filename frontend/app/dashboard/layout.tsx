import type { ReactNode } from 'react';

const DashboardLayout = ({ children }: { children: ReactNode }) => {
    return (
        <div className="pt-34 pb-8.75 px-16 bg-white">
            <div className="container mx-auto">
                {children}
            </div>
        </div>
    )
}

export default DashboardLayout
import type { ReactNode } from 'react';

const ChatLayout = ({ children }: { children: ReactNode }) => {
    return (
        <div className="bg-white">
            {children}
        </div>
    )
}

export default ChatLayout
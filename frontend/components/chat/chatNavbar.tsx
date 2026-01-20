import Button from "../button";
import Image from "next/image";

interface ChatNavbarProps {
    onBack: () => void;
}

const ChatNavbar = ({ onBack }: ChatNavbarProps) => {
    return (
        <div className="py-4 px-4 lg:px-16 mt-16">
            <div className="container mx-auto">
                <div className="flex justify-between items-center">
                    <h1 
                    onClick={onBack}
                    className="text-title font-bold text-black min-h-10 text-center flex items-center justify-center">
                        Chats
                    </h1>
                    {/* <div className="flex items-center gap-2">
                        <Button padding="p-2">
                            <Image 
                                src="/Grmps/search.svg" 
                                alt="Search" 
                                width={24} 
                                height={24} 
                                className="h-full w-full object-cover"
                            />
                        </Button>
                        <Button padding="p-2">
                            <Image 
                                src="/Grmps/three-dots.svg" 
                                alt="Three Dots" 
                                width={24} 
                                height={24} 
                                className="h-full w-full object-cover"
                            />
                        </Button>
                    </div> */}
                </div>
            </div>
        </div>
    );
};

export default ChatNavbar;
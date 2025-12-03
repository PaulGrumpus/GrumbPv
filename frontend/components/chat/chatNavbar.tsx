import Button from "../button";
import Image from "next/image";

const ChatNavbar = () => {
    return (
        <div className="py-4 px-16">
            <div className="container mx-auto">
                <div className="flex justify-between items-center">
                    <h1 className="text-title font-bold text-black">Chat</h1>
                    <div className="flex items-center gap-2">
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
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ChatNavbar;
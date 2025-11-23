'use client';
import { useEffect, useRef, useState, forwardRef } from "react";

import { useRouter } from "next/navigation";
import Button from "./Button";
import Image from "next/image";
import Link from "next/link";
import { ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/20/solid";

const username = "John Doe";
const userPhoto = "/Grmps/grmps.jpg";
const chatIcon = "/Grmps/chat.svg";
const bellIcon = "/Grmps/bell.svg";

const menuItems = [
    {
        icon: "/Grmps/help-circle.svg",
        label: "Profile",
        href: "/profile"
    },
    {
        icon: "/Grmps/setting.svg",
        label: "Dashboard",
        href: "/dashboard"
    },
    {
        icon: "/Grmps/setting.svg",
        label: "Settings",
        href: "/settings"
    },
]

const userRole = "freelancer";

const Navbar = () => {
    const router = useRouter();
    const [loggedIn] = useState(true);
    const [dropdownMenuOpen, setDropdownMenuOpen] = useState(false);
    const [notifications] = useState(0);
    const [messages] = useState(2);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const menuToggleRef = useRef<HTMLDivElement>(null);

    const handleDropdownMenuOpen = () => {
        setDropdownMenuOpen(!dropdownMenuOpen);
    }

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (!dropdownMenuOpen) return;

            const target = event.target as Node;
            const clickedInsideMenu = dropdownRef.current?.contains(target);
            const clickedToggle = menuToggleRef.current?.contains(target);

            if (!clickedInsideMenu && !clickedToggle) {
                setDropdownMenuOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [dropdownMenuOpen]);
    return (
        <div className="fixed top-0 left-0 right-0 z-50 bg-white px-16 py-[15.5px] shadow-xl">
            <div className="container mx-auto"> 
                <div className="flex items-center justify-between">
                    <div 
                        className="flex gap-0.75 items-center cursor-pointer"
                        onClick={() => router.push('/')}
                    >
                        <div className="w-8.75 h-8.75 overflow-hidden rounded-full">
                            <Image
                                src="/Grmps/grmps.jpg"
                                alt="Logo"
                                width={40}
                                height={40}
                                className="h-full w-full rounded-full object-cover"
                            />
                        </div>
                        <p className="text-logo font-poppins font-bold text-black">Grumpus</p>
                    </div>
                    {userRole === "freelancer" ? (  
                        <div className="flex gap-8 text-normal font-regular text-black">    
                            <Link className="hover:text-purple" href="/jobs">Featured Jobs</Link>
                            <Link className="hover:text-purple" href="/gigs">Gigs</Link>
                            <Link className="hover:text-purple" href="/dashboard?view=create-gig">Post Gig</Link>
                        </div>
                    ) : (
                        <div className="flex gap-8 text-normal font-regular text-black">    
                            <Link className="hover:text-purple" href="/jobs">Featured Jobs</Link>
                            <Link className="hover:text-purple" href="/gigs">Gigs</Link>
                            <Link className="hover:text-purple" href="/dashboard?view=create-post">Post Job</Link>
                        </div>
                    )}
                    {loggedIn ? ( 
                    <div 
                        className="flex items-center gap-4"
                        onClick={handleDropdownMenuOpen}
                        ref={menuToggleRef}
                    >
                            <div className="relative w-6 h-6">
                                <Image 
                                    src={chatIcon} 
                                    alt="Chat Icon" 
                                    width={24} 
                                    height={24} 
                                    className="h-full w-full object-cover"
                                />
                                {messages >= 1 && (
                                    <span 
                                        className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-fuchsia-500 ring-1 ring-white" />
                                )}
                            </div>
                            <div className="relative w-6 h-6">
                                <Image 
                                    src={bellIcon} 
                                    alt="Bell Icon" 
                                    width={24} 
                                    height={24} 
                                    className="h-full w-full object-cover"
                                />
                                {notifications >= 1 && (
                                    <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-fuchsia-500 ring-1 ring-white" />
                                )}
                            </div>
                            <div 
                                className="flex items-center gap-2"
                                onClick={handleDropdownMenuOpen}
                            >
                                <div className="w-9 h-9 overflow-hidden rounded-full">
                                    <Image 
                                        src={userPhoto} 
                                        alt="User Photo" 
                                        width={36} 
                                        height={36} 
                                        className="h-full w-full rounded-full object-cover"
                                    />
                                </div>
                                <p className="text-normal font-regular text-black">{username}</p>
                                {dropdownMenuOpen ? (
                                    <ChevronUpIcon className="w-5 h-5 text-black" />
                                ) : (
                                    <ChevronDownIcon className="w-5 h-5 text-black" />
                                )}
                            </div>
                        </div>
                    ) : (
                        <Button>
                            <p>Login</p>
                        </Button>
                    )}
                </div>
                {dropdownMenuOpen && <DropdownMenu ref={dropdownRef} />}
            </div>
        </div>
    )
}

const DropdownMenu = forwardRef<HTMLDivElement>((_, ref) => {
    return (
        <div
            ref={ref}
            className="absolute top-13.5 right-17 bg-white shadow-md border-2 border-[#8F99AF66] rounded-lg py-3 z-50 w-47.5"
        >
            <ul className="w-full">
                {menuItems.map((item) => (
                    <li className="text-black hover:text-purple hover:bg-[#2F3DF633] w-full" key={item.label}>
                        <Link  href={item.href}>
                            <div className="flex items-center gap-3 p-2">
                                <div className="w-6 h-6">
                                    <Image 
                                        src={item.icon} 
                                        alt={item.label} 
                                        width={24} 
                                        height={24} 
                                        className="h-full w-full object-cover"
                                    />
                                </div>
                                <p className="text-normal font-regular">{item.label}</p>
                            </div>
                        </Link>
                    </li>
                ))}
            </ul>
        </div>
    );
});

DropdownMenu.displayName = "DropdownMenu";

export default Navbar;
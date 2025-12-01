'use client';
import { useEffect, useRef, useState, forwardRef, useContext } from "react";

import { useRouter } from "next/navigation";
import Button from "./button";
import Image from "next/image";
import Link from "next/link";
import { ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/20/solid";
import { CONFIG, EscrowBackendConfig } from "@/config/config";
import LoginSignupModal from "./loginSignupModal";
import { UserInfoCtx } from "@/context/userContext";
import { toast } from "react-toastify";
import { LoadingCtx } from "@/context/loadingContext";


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
        icon: "/Grmps/pie-chart-alt.svg",
        label: "Dashboard",
        href: "/dashboard"
    },
    {
        icon: "/Grmps/setting.svg",
        label: "Settings",
        href: "/settings"
    },
]

const Navbar = () => {
    const router = useRouter();
    const { userInfo } = useContext(UserInfoCtx);
    const [userRole, setUserRole] = useState("client");
    const [loggedIn, setLoggedIn] = useState(false);
    const [dropdownMenuOpen, setDropdownMenuOpen] = useState(false);
    const [notifications] = useState(0);
    const [messages] = useState(2);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const menuToggleRef = useRef<HTMLDivElement>(null);
    const [loginSignupModalOpen, setLoginSignupModalOpen] = useState(false);
    const [username, setUsername] = useState("");

    useEffect(() => {
        if(userInfo.id) {
            setUserRole(userInfo.role);
            if(userInfo.display_name) {
                setUsername(userInfo.display_name);
            } else if(userInfo.email) {
                setUsername(userInfo.email);
            } else if(userInfo.address) {
                setUsername(userInfo.address.slice(0, 4) + "..." + userInfo.address.slice(-4));
            }
            setLoggedIn(true);
        } else {
            setUserRole('client');
            setLoggedIn(false);
        }
    }, [userInfo]);

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
        <div>
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
                                <Link className="hover:text-purple" href="/dashboard?view=create-job">Post Job</Link>
                            </div>
                        )}
                        {loggedIn ? ( 
                            <div 
                                className="relative flex items-center gap-4"
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
                                    className="flex items-center gap-2 cursor-pointer select-none"
                                    onClick={handleDropdownMenuOpen}
                                >
                                    {
                                        userInfo.image_id && <div className="w-9 h-9 overflow-hidden rounded-full">
                                            <Image 
                                                src={EscrowBackendConfig.uploadedImagesURL + userInfo.image_id} 
                                                alt="User Photo" 
                                                width={36} 
                                                height={36} 
                                                className="h-full w-full rounded-full object-cover"
                                            />
                                        </div>
                                    }
                                    <p className="text-normal font-regular text-black">{username}</p>
                                    {dropdownMenuOpen ? (
                                        <ChevronUpIcon className="w-5 h-5 text-black" />
                                    ) : (
                                        <ChevronDownIcon className="w-5 h-5 text-black" />
                                    )}
                                </div>
                                {dropdownMenuOpen && <DropdownMenu ref={dropdownRef} />}
                            </div>
                        ) : (
                            <Button
                                padding="px-6 py-2"
                                onClick={() => setLoginSignupModalOpen(true)}
                            >
                                <p>Login</p>
                            </Button>
                        )}
                    </div>
                </div>
            </div>
            <LoginSignupModal
                isOpen={loginSignupModalOpen} 
                setIsOpen={setLoginSignupModalOpen} 
                signedUp={userInfo.id ? true : false}
            />
        </div>
    )
}

const DropdownMenu = forwardRef<HTMLDivElement>((_, ref) => {
    const { setUserInfo } = useContext(UserInfoCtx);
    const router = useRouter();
    const { setLoadingState } = useContext(LoadingCtx);
    
    const handleLogOut = () => {
        setLoadingState("pending");
        window.localStorage.removeItem('token');
        toast.success("Logged out successfully", {
            position: "top-right",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
        });
        setUserInfo({
            id: '',
            address: '',
            chain: '',
            email: '',
            role: '',
            display_name: '',
            bio: '',
            country_code: '',
            is_verified: false,
            image_id: '',
            created_at: '',
            updated_at: ''
        });
        setLoadingState("pending");
        router.push('/');
    }
    return (
        <div
            ref={ref}
            className="absolute right-0 w-47.5 rounded-lg border-2 border-[#8F99AF66] bg-white py-3 shadow-md z-50"
            style={{ top: "calc(100% + 12px)" }}
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
                <li className="text-black hover:text-purple hover:bg-[#2F3DF633] w-full" key="logout">
                    <div className="flex items-center gap-3 p-2 cursor-pointer" onClick={handleLogOut}>
                        <div className="w-6 h-6">
                            <Image 
                                src="/Grmps/logout.svg" 
                                alt="Logout" 
                                width={24} 
                                height={24} 
                                className="h-full w-full object-cover"
                            />
                        </div>
                        <p className="text-normal font-regular">Logout</p>
                    </div>
                </li>
            </ul>
        </div>
    );
});

DropdownMenu.displayName = "DropdownMenu";

export default Navbar;
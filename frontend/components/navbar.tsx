'use client';
import { useEffect, useRef, useState, forwardRef, useContext } from "react";

import { useRouter, usePathname } from "next/navigation";
import Button from "./button";
import Image from "next/image";
import Link from "next/link";
import { ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/20/solid";
import { CONFIG, EscrowBackendConfig } from "@/config/config";
import LoginSignupModal from "./loginSignupModal";
import { UserInfoCtx } from "@/context/userContext";
import { toast } from "react-toastify";
import { UserLoadingCtx } from "@/context/userLoadingContext";
import { NotificationCtx } from "@/context/notificationContext";
import { Notification, NotificationEntity, NotificationType } from "@/types/notification";
import { formatHourMinute, markAllNotificationsAsRead, updateNotification } from "@/utils/functions";
import { NotificationLoadingCtx } from "@/context/notificationLoadingContext";
import { DashboardLoadingCtx } from "@/context/dashboardLoadingContext";
import { useDashboard } from "@/context/dashboardContext";
import { DashboardNotification } from "@/types/dashboard";

const chatIcon = "/Grmps/chat.svg";
const bellIcon = "/Grmps/bell.svg";
const defaultProfileImage ="default.jpg";
const logoImage = "/Grmps/grmps.jpg"; // Change this path to your custom logo

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
    const { userInfo, setUserInfo } = useContext(UserInfoCtx);
    const { notifications } = useContext(NotificationCtx);
    const [userRole, setUserRole] = useState("client");
    const [loggedIn, setLoggedIn] = useState(false);
    const [dropdownMenuOpen, setDropdownMenuOpen] = useState(false);
    const [notificationDropdownOpen, setNotificationDropdownOpen] = useState(false);
    const [messages] = useState(2);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const menuToggleRef = useRef<HTMLDivElement>(null);
    const notificationDropdownRef = useRef<HTMLDivElement>(null);
    const notificationToggleRef = useRef<HTMLDivElement>(null);
    const [loginSignupModalOpen, setLoginSignupModalOpen] = useState(false);
    const [username, setUsername] = useState("");

    const [notificationCount, setNotificationCount] = useState(0);
    const [messageCount, setMessageCount] = useState(0);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    // const { notificationLoadingState } = useContext(NotificationLoadingCtx);
    const { dashboardLoadingState } = useContext(DashboardLoadingCtx);
    const { notificationsInfo, conversationsInfo } = useDashboard();
    const [ isMobile, setIsMobile ] = useState(true);
    const { setuserLoadingState } = useContext(UserLoadingCtx);
    const pathname = usePathname();

    const mobileMenuItems = 
    userRole === "freelancer" ? [
        { label: "Featured Jobs", href: "/jobs" },
        { label: "Gigs", href: "/gigs" },
        { label: "Post Gig", href: "/dashboard?view=create-gig" },
    ] : [
        { label: "Featured Gigs", href: "/gigs" },
        { label: "Jobs", href: "/jobs" },
        { label: "Post Job", href: "/dashboard?view=create-job" },
    ];

    useEffect(() => {
        setIsMobile(window.innerWidth < 768);

        if(userInfo.id) {
            setUserRole(userInfo.role);
            if(userInfo.display_name) {
                setUsername(userInfo.display_name);
            } else if(userInfo.email) {
                setUsername(userInfo.email);
            } else if(userInfo.address) {
                setUsername(userInfo.address.slice(0, 4) + "..." + userInfo.address.slice(-4));
            }
            // setNotificationCount(notifications.filter((notification) => !notification.read_at).length);
            setNotificationCount(notificationsInfo.filter(n => !n.read_at).length);
            setLoggedIn(true);            
        } else {
            setUserRole('client');
            setLoggedIn(false);
        }
    }, [userInfo]);

    useEffect(() => {
        setNotificationCount(
            notificationsInfo.filter(n => !n.read_at).length
        );
    }, [notificationsInfo]);

    useEffect(() => {
        if (!userInfo.id) {
            setMessageCount(0);
            return;
        }

        // Count unread messages based on message receipts
        // A message is unread if:
        // 1. It's not sent by the current user
        // 2. The message doesn't have a 'read' receipt for the current user
        const unreadCount = conversationsInfo.reduce((count, conversation) => {
            if (!conversation.messages || conversation.messages.length === 0) {
                return count;
            }

            const unreadInConversation = conversation.messages.filter((message) => {
                // Skip messages sent by current user
                if (message.sender_id === userInfo.id) {
                    return false;
                }

                // Get receipts (handle both 'receipts' and 'messageReceipt' for compatibility)
                const receipts = (message as any).receipts || (message as any).messageReceipt || [];

                // Check if message has receipts
                if (!receipts || receipts.length === 0) {
                    // No receipts means not read
                    return true;
                }

                // Check if there's a 'read' receipt for the current user
                const hasReadReceipt = receipts.some(
                    (receipt: any) => receipt.user_id === userInfo.id && receipt.state === 'read'
                );

                // If no 'read' receipt found, message is unread
                return !hasReadReceipt;
            }).length;

            return count + unreadInConversation;
        }, 0);

        setMessageCount(unreadCount);
    }, [conversationsInfo, userInfo.id]);

    const handleDropdownMenuOpen = () => {
        setDropdownMenuOpen((prev) => !prev);
        setNotificationDropdownOpen(false);
    }

    const handleNotificationClick = () => {
        setNotificationDropdownOpen((prev) => !prev);
        setDropdownMenuOpen(false);
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as Node;

            if (dropdownMenuOpen) {
                const clickedInsideMenu = dropdownRef.current?.contains(target);
                const clickedToggle = menuToggleRef.current?.contains(target);

                if (!clickedInsideMenu && !clickedToggle) {
                    setDropdownMenuOpen(false);
                }
            }

            if (notificationDropdownOpen) {
                const clickedInsideMenu = notificationDropdownRef.current?.contains(target);
                const clickedToggle = notificationToggleRef.current?.contains(target);

                if (!clickedInsideMenu && !clickedToggle) {
                    setNotificationDropdownOpen(false);
                }
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [dropdownMenuOpen, notificationDropdownOpen]);
    
    const placeholderLinks = userRole === "freelancer"
        ? ["Jobs", "Gigs", "Post Gig"]
        : ["Jobs", "Gigs", "Post Job"];

    // const showPlaceholder = loggedIn && notificationLoadingState !== "success";

    const showPlaceholder = loggedIn && dashboardLoadingState !== "success";

    const handleLogOut = () => {
        setuserLoadingState("pending");
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
            finished_job_num: 0,
            total_fund: 0,
            fund_cycle: 0,
            fund_num: 0,
            image_id: '',
            created_at: '',
            updated_at: ''
        });
        setuserLoadingState("pending");        
        router.push('/');
    }

    return (
        <div>
            {!isMobile && (
                <div className="fixed top-0 left-0 right-0 z-50 bg-white px-16 py-[15.5px] shadow-xl">
                    <div className="container mx-auto"> 
                        <div className="flex items-center justify-between">
                            { !showPlaceholder && (
                                <>
                                    <div 
                                        className="flex gap-0.75 items-center cursor-pointer"
                                        onClick={() => router.push('/')}
                                    >
                                        <div className="w-8.75 h-8.75 overflow-hidden rounded-full">
                                            <Image
                                                src={logoImage}
                                                alt="Logo"
                                                width={40}
                                                height={40}
                                                className="h-full w-full rounded-full object-cover"
                                            />
                                        </div>
                                        <p className="text-logo font-poppins font-bold text-black">GrumBuild</p>
                                    </div>
                                    {userRole === "freelancer" ? (  
                                        <div className="flex gap-8 text-normal font-regular text-black">    
                                            <Link className="hover:text-purple uppercase" href="/jobs">Featured Jobs</Link>
                                            <Link className="hover:text-purple uppercase" href="/gigs">Gigs</Link>
                                            <Link className="hover:text-purple uppercase" href="/dashboard?view=create-gig">Post Gig</Link>
                                        </div>
                                    ) : (
                                        <div className="flex gap-8 text-normal font-regular text-black">    
                                            <Link className="hover:text-purple uppercase" href="/jobs">Featured Jobs</Link>
                                            <Link className="hover:text-purple uppercase" href="/gigs">Gigs</Link>
                                            <Link className="hover:text-purple uppercase" href="/dashboard?view=create-job">Post Job</Link>
                                        </div>
                                    )}
                                    {loggedIn ? ( 
                                        <div 
                                            className="relative flex items-center gap-4"
                                            ref={menuToggleRef}
                                        >
                                            <div className="relative w-6 h-6 cursor-pointer hover:scale-110 transition-all duration-300" onClick={() => router.push("/chat")}>
                                                <Image 
                                                    src={chatIcon} 
                                                    alt="Chat Icon" 
                                                    width={24} 
                                                    height={24} 
                                                    className="h-full w-full object-cover"
                                                />
                                                {pathname !== "/chat" && messageCount >= 1 && (
                                                    <span 
                                                        className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-fuchsia-500 ring-1 ring-white" />
                                                )}
                                            </div>
                                            <div className="relative" ref={notificationToggleRef}>
                                                <div
                                                    className="relative w-6 h-6 cursor-pointer hover:scale-110 transition-all duration-300"
                                                    onClick={handleNotificationClick}
                                                >
                                                    <Image
                                                        src={bellIcon}
                                                        alt="Bell Icon"
                                                        width={24}
                                                        height={24}
                                                        className="h-full w-full object-cover"
                                                    />
                                                    {notificationCount >= 1 && (
                                                        <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-fuchsia-500 ring-1 ring-white" />
                                                    )}
                                                </div>
                                                {notificationDropdownOpen && (
                                                    <NotificationDropdownMenu
                                                        ref={notificationDropdownRef}
                                                        notifications={notificationsInfo}
                                                    />
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
                                            onClick={() => {
                                                router.push("/");
                                                setLoginSignupModalOpen(true)
                                            }}
                                        >
                                            <p>Login</p>
                                        </Button>
                                    )}
                                </>
                            )}
                            { showPlaceholder && (
                                <>
                                    <div className="flex items-center gap-0.75">
                                        <div className="w-8.75 h-8.75 overflow-hidden rounded-full to-black shadow-xl animate-pulse flex items-center justify-center text-xs font-semibold uppercase tracking-wide text-white">
                                            <Image
                                                src={logoImage}
                                                alt="Logo"
                                                width={40}
                                                height={40}
                                                className="h-full w-full rounded-full object-cover"
                                            />
                                        </div>
                                        <div
                                            className="h-11 w-28 animate-pulse flex items-center justify-left text-xl font-semibold uppercase tracking-wide text-gray-400"
                                        >
                                            GrumBuild
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        {placeholderLinks.map((label) => (
                                            <div
                                                key={`placeholder-${label}`}
                                                className="h-11 w-28 rounded-2xl border border-white/30 bg-linear-to-br from-white via-slate-100 to-slate-200 shadow-lg animate-pulse flex items-center justify-center text-xs font-semibold uppercase tracking-wide text-gray-400"
                                            >
                                                {label}
                                            </div>
                                        ))}
                                    </div>
                                    {loggedIn ? (
                                        <div className="flex items-center gap-2">
                                            {
                                                userInfo.image_id && <div className="w-9 h-9 overflow-hidden rounded-full to-black shadow-xl animate-pulse flex items-center justify-center text-xs font-semibold uppercase tracking-wide text-white">
                                                    <Image 
                                                        src={EscrowBackendConfig.uploadedImagesURL + userInfo.image_id} 
                                                        alt="User Photo" 
                                                        width={36} 
                                                        height={36} 
                                                        className="h-full w-full rounded-full object-cover"
                                                    />
                                                </div>
                                            }
                                            <p className="h-11 rounded-2xl from-white via-slate-100 to-slate-200 animate-pulse flex items-center justify-center text-xs font-semibold uppercase tracking-wide text-gray-400">{username}</p>
                                        </div>
                                    ) : (
                                        <div className="h-11 w-28 rounded-2xl bg-linear-to-br from-[#2F3DF6] via-[#7E3FF2] to-black shadow-xl animate-pulse flex items-center justify-center text-xs font-semibold uppercase tracking-wide text-white">
                                            Login
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Mobile footer nav */}
            {isMobile && (
                <div className="fixed top-0 left-0 right-0 z-50 border-t border-[#d6d6d6] bg-white px-4 py-3 shadow-xl lg:hidden">
                    <div className="flex items-center justify-between">
                        {loggedIn ? (
                            <>
                                <button
                                    className="flex items-center gap-2 cursor-pointer"
                                    onClick={() => router.push("/profile")}
                                >
                                    <div className="w-8 h-8 overflow-hidden rounded-full">
                                        <Image
                                            src={userInfo.image_id ? EscrowBackendConfig.uploadedImagesURL + userInfo.image_id : EscrowBackendConfig.uploadedImagesURL + defaultProfileImage}
                                            alt="User Photo"
                                            width={32}
                                            height={32}
                                            className="h-full w-full object-cover"
                                        />
                                    </div>
                                    {userInfo.display_name ? (
                                        <p className="text-normal font-regular text-black">{userInfo.display_name}</p>
                                    ) : (
                                        <p className="text-normal font-regular text-black"></p>
                                    )}
                                </button>
                                <div className="flex items-center">
                                    <button
                                        type="button"
                                        onClick={() => router.push("/chat")}
                                        className="relative focus:outline-none mr-3"
                                    >
                                        <div className="w-6 h-6">
                                            <Image src={chatIcon} alt="Chat Icon" width={24} height={24} className="h-6 w-6" />
                                        </div>
                                        {pathname !== "/chat" && messageCount >= 1 && (
                                            <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-fuchsia-500 ring-1 ring-white" />
                                        )}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleNotificationClick}
                                        className="relative focus:outline-none mr-1"
                                    >
                                        <div>
                                            <Image src={bellIcon} alt="Bell Icon" width={24} height={24} className="h-6 w-6" />
                                        </div>
                                        {notificationCount >= 1 && (
                                            <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-fuchsia-500 ring-1 ring-white" />
                                        )}
                                        {notificationDropdownOpen && (
                                            <NotificationDropdownMenu
                                                ref={notificationDropdownRef}
                                                notifications={notificationsInfo}
                                            />
                                        )}
                                    </button>
                                    <button
                                        type="button"
                                        className="focus:outline-none"
                                        onClick={() => setMobileMenuOpen((prev) => !prev)}
                                    >
                                        <div className="w-6 h-6">
                                            <Image src="/Grmps/pink-three-dots.svg" alt="pink three dots" width={24} height={24} className="h-full w-full object-cover" />
                                        </div>
                                    </button>
                                </div>
                            </>
                        ) : (
                            <>
                                <div
                                    className="flex items-center gap-2 cursor-pointer"
                                    onClick={() => router.push("/")}
                                >
                                    <div className="w-8 h-8 overflow-hidden rounded-full">
                                        <Image
                                            src={logoImage}
                                            alt="Logo"
                                            width={32}
                                            height={32}
                                            className="h-full w-full object-cover"
                                        />
                                    </div>
                                    <p className="text-logo font-poppins font-bold text-black">GrumBuild</p>
                                </div>
                                <Button
                                    padding="px-5 py-2"
                                    onClick={() => {
                                        router.push("/");
                                        setLoginSignupModalOpen(true);
                                    }}
                                >
                                    <p>Login</p>
                                </Button>
                            </>
                        )}
                    </div>
                </div>
            )}

            {isMobile && mobileMenuOpen && (
                <div className="fixed inset-0 z-50 flex">
                    {/* Overlay */}
                    <div
                        className="absolute inset-0 transparent"
                        onClick={() => setMobileMenuOpen(false)}
                    />

                    {/* Drawer */}
                    <div className="relative h-full w-full max-w-[90%] bg-black/40 backdrop-blur-xl shadow-2xl transform transition-transform duration-300 translate-x-0">
                    
                    {/* Header */}
                    <div className="flex items-center justify-between bg-white py-3 px-5">
                        <div className="flex items-center gap-2">
                            <div
                                className="flex items-center gap-2 cursor-pointer"
                                onClick={() => router.push('/')}
                            >
                                <div className="w-9 h-9 overflow-hidden rounded-full">
                                    <Image
                                        src={logoImage}
                                        alt="Logo"
                                        width={36}
                                        height={36}
                                        className="h-full w-full object-cover"
                                    />
                                </div>
                                <p className="text-logo font-poppins font-bold text-black">GrumBuild</p>
                            </div>
                        </div>

                        <button
                            onClick={() => setMobileMenuOpen(false)}
                            className="text-2xl font-medium text-black"
                        >
                        ×
                        </button>
                    </div>

                    {/* Menu */}
                    <div className="mt-12 flex flex-col gap-4 px-6 py-6">
                        {mobileMenuItems.map((item) => (
                        <Link
                            key={item.label}
                            href={item.href}
                            onClick={() => setMobileMenuOpen(false)}
                            className="w-full rounded-xl py-3 text-center text-sm font-medium text-black transition hover:bg-[#F4F5FA]"
                        >
                            {item.label}
                        </Link>
                        ))}

                        {/* Login Button */}
                        {!loggedIn ? (
                            <button
                                onClick={() => {
                                    router.push("/");
                                    setLoginSignupModalOpen(true);
                                    setMobileMenuOpen(false);
                                }}
                                className="mt-4 w-full rounded-xl bg-linear-to-r from-[#5B5BFF] to-[#7E3FF2] py-3 text-center text-sm font-semibold text-white shadow-lg transition hover:opacity-90"
                            >
                                Login
                            </button>
                        ) : (
                            <button
                                onClick={handleLogOut}
                                className="mt-4 w-full rounded-xl bg-linear-to-r from-[#5B5BFF] to-[#7E3FF2] py-3 text-center text-sm font-semibold text-white shadow-lg transition hover:opacity-90"
                            >
                                Logout
                            </button>
                        )}
                    </div>
                    </div>
                </div>
            )}
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
    const { setuserLoadingState } = useContext(UserLoadingCtx);
    
    const handleLogOut = () => {
        setuserLoadingState("pending");
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
            updated_at: '',
            finished_job_num: 0,
            total_fund: 0,
            fund_cycle: 0,
            fund_num: 0,
        });
        setuserLoadingState("pending");        
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

type NotificationDropdownMenuProps = {
    notifications: DashboardNotification[];
};

const NotificationDropdownMenu = forwardRef<HTMLDivElement, NotificationDropdownMenuProps>(({ notifications }, ref) => {
    // const { setNotifications } = useContext(NotificationCtx);
    const { setNotificationsInfo } = useDashboard();
    // const [unreadNotifications, setUnreadNotifications] = useState<Notification[]>([]);
    const [unreadNotifications, setUnreadNotifications] = useState<DashboardNotification[]>([]);
    const { userInfo } = useContext(UserInfoCtx);
    const router = useRouter();
    const formatDate = (value?: Date | string) => {
        if (!value) return null;
        const parsedDate = typeof value === "string" ? new Date(value) : value;
        if (!parsedDate || Number.isNaN(parsedDate.getTime())) return null;
        return parsedDate.toLocaleString();
    };

    const blockExplorerUrl = (CONFIG.blockExplorerUrls ?? "https://testnet.bscscan.com").replace(/\/$/, "");

    useEffect(() => {
        const unread = notifications
            .filter(n => !n.read_at)
            .slice() // clone BEFORE sort
            .sort((a, b) => {
                const aTime = a.created_at ? new Date(a.created_at).getTime() : 0;
                const bTime = b.created_at ? new Date(b.created_at).getTime() : 0;
                return bTime - aTime;
            });
    
        setUnreadNotifications(unread);
    }, [notifications]);

    const handleMarkAsRead = async (notificationId: string) => {
        const notification = notifications.find(n => n.id === notificationId);
        
        if (notification && notification.entity_type === NotificationEntity.milestone) {
            if(notification.type === NotificationType.milestoneEscrowDeployed) {
                const entityId = notification.entity_id?.trim();
                const isMilestoneEscrowNotification =
                    notification.entity_type === NotificationEntity.milestone &&
                    notification.type === NotificationType.milestoneEscrowDeployed &&
                    Boolean(entityId);
                const milestoneEscrowScanUrl = isMilestoneEscrowNotification
                    ? `${blockExplorerUrl}/address/${entityId}`
                    : undefined;
                if (milestoneEscrowScanUrl) {
                    if (typeof window !== "undefined") {
                        window.open(milestoneEscrowScanUrl, "_blank", "noopener,noreferrer");
                    }
                } else {
                    router.push(`/dashboard?view=dashboard`);
                }
            }
            else{
                router.push(`/dashboard?view=dashboard`);
            }
        }   
        if (notification && notification.entity_type === NotificationEntity.chainTx) {
            if(notification.type === NotificationType.withdrawFunds) {
                const entityId = notification.entity_id?.trim();
                const isChainTxWithdrawFundsNotification =
                    notification.entity_type === NotificationEntity.chainTx &&
                    notification.type === NotificationType.withdrawFunds &&
                    Boolean(entityId);
                const chainTxWithdrawFundsScanUrl = isChainTxWithdrawFundsNotification
                    ? `${blockExplorerUrl}/tx/${entityId}`
                    : undefined;
                if (chainTxWithdrawFundsScanUrl) {
                    if (typeof window !== "undefined") {
                        window.open(chainTxWithdrawFundsScanUrl, "_blank", "noopener,noreferrer");
                    }
                } else {
                    router.push(`/dashboard?view=dashboard`);
                }
            }
            else{
                router.push(`/dashboard?view=dashboard`);
            }
        }   
        if (notification && notification.entity_type === NotificationEntity.job) {
            router.push(`/dashboard?view=my-jobs`);
        }   
        if (notification && notification.entity_type === NotificationEntity.gig) {
            router.push(`/dashboard?view=my-gigs`);
        }   
        if (notification && notification.entity_type === NotificationEntity.bid) {
            if(userInfo.role === "freelancer") {
                router.push(`/dashboard?view=my-bids`);
            } else {
                router.push(`/dashboard?view=my-jobs`);
            }
        }  
        if (notification && notification.entity_type === NotificationEntity.conversation) {
            router.push(`/chat?conversation_id=${notification.entity_id}`);
        } 
        if (notification && notification.entity_type === NotificationEntity.jobApplicationDoc) {
            router.push(`/reference?jobApplicationId=${notification.entity_id}`);
        }   
        setNotificationsInfo(prev =>
            prev.map(n =>
                n.id === notificationId
                    ? { ...n, read_at: new Date().toISOString() }
                    : n
            )
        );
    
        try {
            await updateNotification(notificationId, new Date());
        } catch (err) {
            console.error("Unable to mark notification as read", err);
        }
    };

    const handleMarkAllAsRead = async () => {
        // setNotifications(notifications.map((notification) => ({ ...notification, read_at: new Date().toISOString() })));
        setNotificationsInfo(notifications.map((notification) => ({ ...notification, read_at: new Date().toISOString() })))
        await markAllNotificationsAsRead(userInfo.id);
    }

    return (
        <div
            ref={ref}
            className="absolute right-0 mt-2 w-72 rounded-lg border border-[#8F99AF66] bg-white shadow-md z-50 transition-all duration-200"
        >
            <div className="border-b px-4 py-2 text-xs font-semibold uppercase tracking-widest text-gray-500 text-left flex justify-between">
                <p className="text-left">Notifications</p>
                {unreadNotifications.length > 0 && (
                    <div>
                        <Image 
                            src="/Grmps/received.svg" 
                            alt="Mark all as read" 
                            width={24} 
                            height={24} 
                            className="h-full w-full object-cover"
                            onClick={handleMarkAllAsRead}
                        />
                    </div>
                )}
            </div>
            <ul className="max-h-72 overflow-y-auto decorate-scrollbar notification-scrollbar">
                {unreadNotifications.length === 0 && (
                    <li className="px-4 py-3 text-sm text-gray-500 text-left">You're all caught up!</li>
                )}
                {unreadNotifications.map((notification) => {
                    const entityId = notification.entity_id?.trim();
                    const isMilestoneEscrowNotification =
                        notification.entity_type === NotificationEntity.milestone &&
                        notification.type === NotificationType.milestoneEscrowDeployed &&
                        Boolean(entityId);
                    const isChainTxWithdrawFundsNotification =
                        notification.entity_type === NotificationEntity.chainTx &&
                        notification.type === NotificationType.withdrawFunds &&
                        Boolean(entityId);
                    const milestoneEscrowScanUrl = isMilestoneEscrowNotification
                        ? `${blockExplorerUrl}/address/${entityId}`
                        : undefined;
                    const chainTxWithdrawFundsScanUrl = isChainTxWithdrawFundsNotification
                        ? `${blockExplorerUrl}/tx/${entityId}`
                        : undefined;
                    return (
                        <li
                            key={`${notification.id}-${notification.created_at ?? ""}-${notification.read_at ?? ""}`}
                            onClick={() => handleMarkAsRead(notification.id)}
                            className="cursor-pointer border-b last:border-b-0 px-4 py-3 hover:bg-[#2F3DF633]"
                        >
                            <div className="flex justify-between">
                                <div className="w-full max-w-[80%]">
                                    <p className="text-sm font-semibold text-gray-800 text-left">{notification.title}</p>
                                    <p className="text-xs text-gray-600 text-left">{notification.body}</p>
                                    {milestoneEscrowScanUrl && (
                                        <div className="mt-1 flex flex-col gap-1">
                                            <a
                                                // href={milestoneEscrowScanUrl}
                                                target="_blank"
                                                rel="noreferrer noopener"
                                                className="text-[11px] font-semibold text-blue-600 hover:underline"
                                            >
                                                View escrow on BscScan
                                            </a>
                                            <p className="text-[10px] text-gray-500 truncate">{entityId}</p>
                                        </div>
                                    )}
                                    {chainTxWithdrawFundsScanUrl && (
                                        <div className="mt-1 flex flex-col gap-1">
                                            <a
                                                href={chainTxWithdrawFundsScanUrl}
                                                target="_blank"
                                                rel="noreferrer noopener"
                                                className="text-[11px] font-semibold text-blue-600 hover:underline"
                                            >
                                                View transaction on BscScan
                                            </a>
                                            <p className="text-[10px] text-gray-500 truncate">{entityId}</p>
                                        </div>
                                    )}
                                    {/* {formattedDate && (
                                        <p className="mt-1 text-[11px] text-gray-400">{formattedDate}</p>
                                    )} */}
                                </div>
                                <div>
                                    <p className="text-xs text-gray-600 text-left">{formatHourMinute(notification.created_at ?? "")}</p>
                                </div>
                            </div>
                        </li>
                    );
                })}
            </ul>
        </div>
    );
});

NotificationDropdownMenu.displayName = "NotificationDropdownMenu";

export default Navbar;
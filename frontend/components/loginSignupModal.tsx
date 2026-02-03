'use client'

import Button from "./button";
import ModalTemplate from "./modalTemplate";
import Link from "next/link";
import Image from "next/image";
import { useContext, useEffect, useState } from "react";
import { CONFIG } from "@/config/config";
import { toast } from "react-toastify";
import { createUserWithAddress, createUserWithEmail, loginWithAddress, loginWithEmail, resetPassword } from "@/utils/functions";
import { UserInfoCtx } from "@/context/userContext";
import { useRouter } from "next/navigation";
import { UserLoadingCtx } from "@/context/userLoadingContext";
import Input from "./Input";

interface LoginSignupModalProps {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
    signedUp: boolean;
}

type WalletAction = "login" | "register";

type WalletFeedback = {
    message: string;
    tone: "success" | "error" | "info";
};

type MetaMaskProvider = {
    isMetaMask?: boolean;
    request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
    on?: (event: string, handler: (...args: unknown[]) => void) => void;
    removeListener?: (event: string, handler: (...args: unknown[]) => void) => void;
};

declare global {
    interface Window {
        ethereum?: MetaMaskProvider;
    }
}

const normalizeChainId = (value?: string | null) => {
    if (!value) {
        return null;
    }
    const trimmed = value.trim();
    if (!trimmed) {
        return null;
    }
    if (trimmed.startsWith("0x")) {
        return `0x${trimmed.slice(2).toLowerCase()}`;
    }
    const parsed = Number(trimmed);
    if (Number.isFinite(parsed)) {
        return `0x${parsed.toString(16)}`;
    }
    return trimmed.toLowerCase();
};

const nativeCurrencyDecimals = (() => {
    return Number(CONFIG.nativeCurrency?.decimals);
})();

const TARGET_CHAIN_ID = normalizeChainId(CONFIG.chainId);

const NETWORK_PARAMS = {
    chainId: TARGET_CHAIN_ID,
    chainName: CONFIG.chainName,
    nativeCurrency: {
        name: CONFIG.nativeCurrency?.name,
        symbol: CONFIG.nativeCurrency?.symbol,
        decimals: nativeCurrencyDecimals,
    },
    rpcUrls: CONFIG.rpcUrls,
    blockExplorerUrls: CONFIG.blockExplorerUrls,
} as const;

const getEthereumProvider = () => (typeof window === "undefined" ? undefined : window.ethereum);

const isSameChain = (current?: string | null, target?: string | null) =>
    current?.toLowerCase() === target?.toLowerCase();

const shortenAddress = (address: string) => {
    if (!address) {
        return "";
    }
    return address.length > 10 ? `${address.slice(0, 6)}...${address.slice(-4)}` : address;
};

const getWalletErrorMessage = (error: unknown) => {
    if (!error) {
        return "Unexpected wallet error.";
    }
    if (typeof error === "string") {
        return error;
    }
    if (typeof error === "object") {
        const { code, message, data } = error as { code?: number; message?: string; data?: { message?: string } };
        if (code === 4001) {
            return "MetaMask connection request was rejected.";
        }
        if (code === 4902) {
            return "The requested chain is not available in MetaMask.";
        }
        if (typeof data?.message === "string") {
            return data.message;
        }
        if (message) {
            return message;
        }
    }
    return "Failed to connect wallet via MetaMask.";
};

const switchOrAddTargetChain = async (provider: MetaMaskProvider) => {
    try {
        await provider.request({
            method: "wallet_switchEthereumChain",
            params: [{ chainId: NETWORK_PARAMS.chainId }],
        });
    } catch (error) {
        const typedError = error as { code?: number };
        if (typedError?.code === 4902) {
            await provider.request({
                method: "wallet_addEthereumChain",
                params: [NETWORK_PARAMS],
            });
            return;
        }
        throw error;
    }
};

const LoginSignupModal = ({ isOpen, setIsOpen, signedUp = true }: LoginSignupModalProps) => {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const showEyeIcon = "/Grmps/show.svg";
    const [isRegistered, setIsRegistered] = useState(signedUp);
    const [registerProcessing, setRegisterProcessing] = useState(false);
    const [registeredUserRole, setRegisteredUserRole] = useState<"client" | "freelancer">("client");
    const [rememberMe, setRememberMe] = useState(false);
    const [termsAndPolicy, setTermsAndPolicy] = useState(false);
    const [walletAddress, setWalletAddress] = useState<string | null>(null);
    const [walletChainId, setWalletChainId] = useState<string | null>(null);
    const [walletFeedback, setWalletFeedback] = useState<WalletFeedback | null>(null);
    const [isWalletConnecting, setIsWalletConnecting] = useState(false);
    const [isMetaMaskAvailable, setIsMetaMaskAvailable] = useState(true);
    const { setUserInfo } = useContext(UserInfoCtx);
    const { setuserLoadingState } = useContext(UserLoadingCtx);
    const [error, setError] = useState("");
    const [isForgotPassword, setIsForgotPassword] = useState(false);
    const [forgotPasswordEmail, setForgotPasswordEmail] = useState("");
    const [forgotPasswordAlert, setForgotPasswordAlert] = useState("");
    const [forgotPasswordError, setForgotPasswordError] = useState("");

    useEffect(() => {
        if (typeof window === "undefined") {
            return;
        }

        const provider = window.ethereum;

        if (!provider) {
            setIsMetaMaskAvailable(false);
            setWalletFeedback({
                message: "MetaMask is not detected. Install the extension to continue.",
                tone: "error",
            });
            return;
        }

        setIsMetaMaskAvailable(true);
        let isMounted = true;

        const syncInitialWalletState = async () => {
            try {
                const [accounts, chainId] = await Promise.all([
                    provider.request({ method: "eth_accounts" }) as Promise<string[]>,
                    provider.request({ method: "eth_chainId" }) as Promise<string>,
                ]);

                if (!isMounted) {
                    return;
                }

                if (accounts && accounts.length > 0) {
                    setWalletAddress(accounts[0]);
                    setWalletFeedback({
                        message: "Wallet session restored from MetaMask.",
                        tone: "info",
                    });
                }

                if (chainId) {
                    setWalletChainId(chainId);
                }
            } catch (error) {
                console.error("Failed to synchronize wallet session", error);
            }
        };

        const handleAccountsChanged = (accountsUpdate: unknown) => {
            if (!isMounted) {
                return;
            }

            const nextAccounts = Array.isArray(accountsUpdate) ? (accountsUpdate as string[]) : [];

            if (nextAccounts.length === 0) {
                setWalletAddress(null);
                setWalletFeedback({
                    message: "Wallet disconnected.",
                    tone: "info",
                });
                return;
            }

            setWalletAddress(nextAccounts[0]);
            setWalletFeedback({
                message: "Wallet account updated.",
                tone: "info",
            });
        };

        const handleChainChanged = (chainIdUpdate: unknown) => {
            if (!isMounted) {
                return;
            }

            if (typeof chainIdUpdate !== "string") {
                return;
            }

            setWalletChainId(chainIdUpdate);
            if (!isSameChain(chainIdUpdate, NETWORK_PARAMS.chainId)) {
                setWalletFeedback({
                    message: `Switch to ${NETWORK_PARAMS.chainName} (${NETWORK_PARAMS.chainId}) to continue.`,
                    tone: "error",
                });
                toast.error(`Switch to ${NETWORK_PARAMS.chainName} (${NETWORK_PARAMS.chainId}) to continue.`,
                    {
                        position: "top-right",
                        autoClose: 5000,
                        hideProgressBar: false,
                        closeOnClick: true,
                        pauseOnHover: true,
                    }
                )
            } else {
                setWalletFeedback({
                    message: `Connected to ${NETWORK_PARAMS.chainName}.`,
                    tone: "info",
                });
                toast.success(`Connected to ${NETWORK_PARAMS.chainName}.`,
                    {
                        position: "top-right",
                        autoClose: 5000,
                        hideProgressBar: false,
                        closeOnClick: true,
                        pauseOnHover: true,
                    }
                )
            }
        };

        syncInitialWalletState();

        provider.on?.("accountsChanged", handleAccountsChanged);
        provider.on?.("chainChanged", handleChainChanged);

        return () => {
            isMounted = false;
            provider.removeListener?.("accountsChanged", handleAccountsChanged);
            provider.removeListener?.("chainChanged", handleChainChanged);
        };
    }, []);

    const handleForgotPassword = () => {
        
        setIsForgotPassword(true);
    }

    const handleResetPassword = async () => {
        setForgotPasswordError("");
        setForgotPasswordAlert("");
        if(!forgotPasswordEmail){
            setForgotPasswordError("Email is required");
            return;
        }
        const response = await resetPassword(forgotPasswordEmail);
        if(!response.success) {
            setForgotPasswordError("Invalid email");
            return;
        }
        setForgotPasswordAlert("A password reset email has been sent to your email address.");
    }

    const handleClose = () => {
        setError("");
        setIsForgotPassword(false);
        setForgotPasswordEmail("");
        setForgotPasswordAlert("");
        setForgotPasswordError("");
        setIsOpen(false);
        setEmail("");
        setPassword("");
        setShowPassword(false);
        setIsRegistered(signedUp);
        setRememberMe(false);
        setTermsAndPolicy(false);
    };

    const connectMetaMaskWallet = async (action: WalletAction) => {
        const provider = getEthereumProvider();

        if (!provider?.isMetaMask) {
            setIsMetaMaskAvailable(false);
            setWalletFeedback({
                message: "MetaMask is required. Install the extension to continue.",
                tone: "error",
            });
            toast.error("MetaMask is required. Install the extension to continue.",
                {
                    position: "top-right",
                    autoClose: 5000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                }
            )
            return null;
        }

        setIsMetaMaskAvailable(true);
        setIsWalletConnecting(true);
        setWalletFeedback({
            message: `Confirm the ${action} request in MetaMask...`,
            tone: "info",
        });

        try {
            const currentChainId = (await provider.request({ method: "eth_chainId" })) as string;
            if (!isSameChain(currentChainId, NETWORK_PARAMS.chainId)) {
                switchOrAddTargetChain(provider);
                // throw new Error("Chain not supported. Please switch to the supported chain.");
            }

            const accounts = (await provider.request({
                method: "eth_requestAccounts",
            })) as string[];
                        

            if (!accounts || accounts.length === 0) {
                throw new Error("No wallet accounts returned by MetaMask.");
            }

            const latestChainId = (await provider.request({ method: "eth_chainId" })) as string;

            setWalletAddress(accounts[0]);
            setWalletChainId(latestChainId);
            setWalletFeedback({
                message: `Connected ${shortenAddress(accounts[0])} on ${NETWORK_PARAMS.chainName}.`,
                tone: "success",
            });

            toast.success(`Connected ${shortenAddress(accounts[0])} on ${NETWORK_PARAMS.chainName}.`,
                {
                    position: "top-right",
                    autoClose: 5000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                }
            )

            return { address: accounts[0], chainId: latestChainId };
        } catch (error) {
            setWalletFeedback({
                message: getWalletErrorMessage(error),
                tone: "error",
            });
            toast.error(getWalletErrorMessage(error),
                {
                    position: "top-right",
                    autoClose: 5000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                }
            )
            return null;
        } finally {
            setIsWalletConnecting(false);
        }
    };

    const handleLoginWithMetamask = async () => {
        const connection = await connectMetaMaskWallet("login");
        if(!connection) {
            return null
        }
        const response = await loginWithAddress(connection?.address || '');
        if(!response.success) {
            toast.error(response.error, {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
            });
        } else {
            toast.success("Logged in successfully", {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
            });

            setUserInfo({
                id: response.data?.id || '',
                address: response.data?.address || '',
                chain: response.data?.chain || '',
                email: response.data?.email || '',
                password: response.data?.password || '',
                role: response.data?.role || '',
                display_name: response.data?.display_name || '',
                bio: response.data?.bio || '',
                country_code: response.data?.country_code || '',
                is_verified: response.data?.is_verified || false,
                image_id: response.data?.image_id || '',
                created_at: response.data?.created_at || '',
                updated_at: response.data?.updated_at || '',
                finished_job_num: response.data?.finished_job_num || 0,
                total_fund: response.data?.total_fund || 0,
                fund_cycle: response.data?.fund_cycle || 0,
                fund_num: response.data?.fund_num || 0,
            });
        }
        setIsOpen(false);
        router.push("/dashboard");
        setuserLoadingState("pending");
    };

    const handleRegisterWithMetamask = async () => {
        const connection = await connectMetaMaskWallet("register");
        if (connection) {
            setRegisterProcessing(true);
        }
    };

    const handleMetaMaskAuthClick = () => {
        if (isWalletConnecting) {
            return;
        }       

        if (!isMetaMaskAvailable && !getEthereumProvider()) {
            setWalletFeedback({
                message: "MetaMask is not detected. Install the extension to continue.",
                tone: "error",
            });
            toast.error("MetaMask is not detected. Install the extension to continue.",
                {
                    position: "top-right",
                    autoClose: 5000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                }
            )
            return;
        }        

        if (isRegistered) {
            handleLoginWithMetamask();
        } else {
            handleRegisterWithMetamask();
        }
    };

    const handleLogin = async () => {
        if(!email || !password){
            setError("Email and password are required");
            return;
        }
        const response = await loginWithEmail(email, password);
        if(!response.success) {
            toast.error(response.error, {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
            });
        } else {
            toast.success("Logged in successfully", {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
            });
        }
        
        setIsOpen(false);
        setEmail("");
        setPassword("");
        setShowPassword(false);
        setRememberMe(false);
        setTermsAndPolicy(false);
        router.push("/dashboard");
        setuserLoadingState("pending");
    }

    const handleRegister = () => {
        if(!email || !password){
            setError("Email and password are required");
            return;
        }
        if(!termsAndPolicy){
            setError("You must agree to the terms and policy");
            return;
        }
        // async () => {}
        setRegisterProcessing(true);
    }

    const handleRegisterAsClient = () => {
        setRegisteredUserRole("client");
    }

    const handleRegisterAsFreelancer = () => {
        setRegisteredUserRole("freelancer");
    }

    const handleCreateAccount = async () => {
        if(walletAddress && !email && !password){
            const response = await createUserWithAddress(walletAddress || '', registeredUserRole);
            if(!response.success) {
                toast.error(response.error, {
                    position: "top-right",
                    autoClose: 5000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                });
            } else {
                toast.success("Account created successfully", {
                    position: "top-right",
                    autoClose: 5000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                });
    
                setUserInfo({
                    id: response.data?.id || '',
                    address: response.data?.address || '',
                    chain: response.data?.chain || '',
                    email: response.data?.email || '',
                    password: response.data?.password || '',
                    role: response.data?.role || '',
                    display_name: response.data?.display_name || '',
                    bio: response.data?.bio || '',
                    country_code: response.data?.country_code || '',
                    is_verified: response.data?.is_verified || false,
                    image_id: response.data?.image_id || '',
                    created_at: response.data?.created_at || '',
                    updated_at: response.data?.updated_at || '',
                    finished_job_num: response.data?.finished_job_num || 0,
                    total_fund: response.data?.total_fund || 0,
                    fund_cycle: response.data?.fund_cycle || 0,
                    fund_num: response.data?.fund_num || 0,
                });
            }
        }
        if(email && password){
            const response = await createUserWithEmail(email, password, registeredUserRole);
            if(!response.success) {
                toast.error(response.error, {
                    position: "top-right",
                    autoClose: 5000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                });
            } else {
                toast.success("Account created successfully", {
                    position: "top-right",
                    autoClose: 5000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                });
                setUserInfo({
                    id: response.data?.id || '',
                    address: response.data?.address || '',
                    chain: response.data?.chain || '',
                    email: response.data?.email || '',
                    password: response.data?.password || '',
                    role: response.data?.role || '',
                    display_name: response.data?.display_name || '',
                    bio: response.data?.bio || '',
                    country_code: response.data?.country_code || '',
                    is_verified: response.data?.is_verified || false,
                    image_id: response.data?.image_id || '',
                    created_at: response.data?.created_at || '',
                    updated_at: response.data?.updated_at || '',
                    finished_job_num: response.data?.finished_job_num || 0,
                    total_fund: response.data?.total_fund || 0,
                    fund_cycle: response.data?.fund_cycle || 0,
                    fund_num: response.data?.fund_num || 0,
                });
            }
        }
        
        setRegisterProcessing(false);
        setIsOpen(false);
        router.push("/dashboard");
        setuserLoadingState("pending");
        setEmail("");
        setPassword("");
        setShowPassword(false);
        setRememberMe(false);
        setTermsAndPolicy(false);
    }

    const metaMaskButtonLabel = isWalletConnecting
        ? "Connecting to MetaMask..."
        : isRegistered
            ? "Login with MetaMask"
            : "Register with MetaMask";

    return (
        <ModalTemplate
            isOpen={isOpen}
            onClose={handleClose}
            onAction={() => {}}
            className={`${!registerProcessing ? "p-0 lg:pt-8 lg:pb-25 lg:px-16" : "p-0 lg:px-9 lg:py-12"}`}
            customButton={true}
            widthClassName={`${!registerProcessing ? "w-full lg:w-150" : "w-full lg:w-210.75"}`}
            dismissible={!registerProcessing}
            linearBorder={false}
            closeXIcon={false}
            loginModal={true}
            children={
                <div>
                    {isForgotPassword ? (
                        <div className="flex flex-col gap-5 mt-15">
                            <p className="text-normal font-regular font-inter text-black">Forgot password?</p>
                            <Input 
                                type="email" 
                                placeholder="Enter your email" 
                                value={forgotPasswordEmail} 
                                onChange={(e) => setForgotPasswordEmail(e.target.value)} 
                                wrapperClassName="w-full"
                            />
                            {forgotPasswordError && (
                                <div className="text-small font-regular text-red-500 text-left">
                                    {forgotPasswordError}
                                </div>
                            )}
                            {forgotPasswordAlert && (
                                <div className="text-small font-regular text-green-500 text-left">
                                    {forgotPasswordAlert}
                                </div>
                            )}
                            <div className="flex justify-end">
                                <Button variant="primary" padding="px-4 py-2" onClick={handleResetPassword}>Reset password</Button>
                            </div>
                        </div>
                    ) 
                    : registerProcessing ? (
                        <div className="flex flex-col gap-8">
                            <h1 className="text-center text-[2.375rem] leading-[2.85rem] font-regular text-black font-inter">Join as a client or freelancer</h1>
                            <div className="flex gap-6 px-3 py-15.25">
                                <div className="relative">
                                    <Button 
                                        variant="secondary"
                                        borderRadius="rounded-xl"
                                        borderInnerRadius="rounded-[0.6875rem]"
                                        padding="px-21.5 py-12.5"
                                    >
                                        <p 
                                            className={`
                                                text-normal font-bold font-inter text-center
                                                ${registeredUserRole === "client" ? "text-[#7E3FF2]" : "text-black"}
                                            `}
                                            onClick={() => {
                                                handleRegisterAsClient();
                                            }}
                                        >
                                            Create account as a Client
                                        </p>
                                    </Button>
                                    {registeredUserRole === 'client' ? 
                                        <div className="absolute top-3.25 right-3.5">
                                            <Image
                                                src="/Grmps/checkedRole.svg"
                                                alt="checked"
                                                width={24}
                                                height={24}
                                            />
                                        </div>
                                    : 
                                        <div className="absolute top-3.25 right-3.5">
                                            <Image
                                                src="/Grmps/unCheckedRole.svg"
                                                alt="unChecked"
                                                width={24}
                                                height={24}
                                            />
                                        </div>
                                    }
                                </div>
                                <div className="relative">
                                    <Button 
                                        variant="secondary"
                                        borderRadius="rounded-xl"
                                        borderInnerRadius="rounded-[0.6875rem]"
                                        padding="px-21.5 py-12.5"
                                        onClick={() => {
                                            handleRegisterAsFreelancer();
                                        }}
                                    >
                                        <p 
                                            className={`
                                                text-normal font-bold font-intertext-center
                                                ${registeredUserRole === "freelancer" ? "text-[#7E3FF2]" : "text-black"}
                                            `}
                                        >
                                            Create account as a Freelancer
                                        </p>
                                    </Button>
                                    {registeredUserRole === 'freelancer' ? 
                                        <div className="absolute top-3.25 right-3.5">
                                            <Image
                                                src="/Grmps/checkedRole.svg"
                                                alt="checked"
                                                width={24}
                                                height={24}
                                            />
                                        </div>
                                    : 
                                        <div className="absolute top-3.25 right-3.5">
                                            <Image
                                                src="/Grmps/unCheckedRole.svg"
                                                alt="unChecked"
                                                width={24}
                                                height={24}
                                            />
                                        </div>
                                    }
                                </div>
                            </div>
                            <div className="flex items-center justify-center">
                                <Button
                                    variant="primary"
                                    padding="px-45 py-2.5"
                                    onClick={() => {
                                        handleCreateAccount();
                                    }}
                                >
                                    <p className="text-normal font-bold font-inter text-white text-center">Create account</p>
                                </Button>
                            </div>
                        </div>
                    ) : 
                    <div className="lg:block relative min-h-screen lg:min-h-auto">
                        <div className="pt-16 lg:pt-0 flex flex-col gap-4 lg:mt-12">
                            <h1 className="text-center text-[1.5625rem] leading-7.5 font-medium">{isRegistered ? "Login" : "Register"}</h1>
                            <div className="flex gap-3.5 justify-center">
                                <p className="text-normal font-regular">{isRegistered ? "Don't have an account yet?" : "Have an account?"}</p>
                                <p 
                                    className="text-normal font-regular text-[#7E3FF2] font-inter cursor-pointer"
                                    onClick={() => {
                                        setIsRegistered((prev) => !prev);
                                    }}
                                > 
                                    {isRegistered ? "Register an account in" : "Sign in"} 
                                </p>
                            </div>
                            <div className="px-4 lg:px-0">
                                <Button
                                    padding="px-4 py-2"
                                    variant="secondary"
                                    borderRadius="rounded-3xl"
                                    borderInnerRadius="rounded-[1.4375rem]"
                                    onClick={handleMetaMaskAuthClick}
                                >
                                    <div className="flex items-center justify-center gap-2.5">
                                        <div className="w-8 h-8 flex items-center justify-center">
                                            <Image
                                                src="/Grmps/metamask.png"
                                                alt="metamask"
                                                width={24}
                                                height={24}
                                            />
                                        </div>
                                        <p className="text-normal font-bold text-black font-inter">
                                            {metaMaskButtonLabel}
                                        </p>
                                    </div>
                                </Button>
                            </div>
                            <div className="flex items-center justify-center gap-2.5">
                                <div className="w-32.5 border border-[#DDD6FE]"></div>
                                <p className="text-[0.8125rem] font-regular leading-[0.975rem] text-[#7E3FF2]">OR</p>
                                <div className="w-32.5 border border-[#DDD6FE]"></div>
                            </div>
                            <div className="px-4 lg:px-0">
                                <p className='text-normal font-bold font-inter text-black text-left pb-2'>Email</p>
                                <div className='flex items-center border border-[#8F99AF] rounded-[2.375rem] p-3 gap-3'>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className='flex-1 bg-transparent text-normal font-regular text-black text-left focus:outline-none'
                                        placeholder='Enter your email'
                                    />
                                </div>
                            </div>
                            <div className="px-4 lg:px-0">
                                <p className='text-normal font-bold font-inter text-black text-left pb-2'>Password</p>
                                <div className='flex items-center border border-[#8F99AF] rounded-[2.375rem] p-3 gap-3'>
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className='flex-1 bg-transparent text-normal font-regular text-black text-left focus:outline-none'
                                        placeholder='Enter your password'
                                    />
                                    <button
                                        type='button'
                                        onClick={() => setShowPassword((prev) => !prev)}
                                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                                        className='text-black'
                                    >
                                        {showPassword ? (
                                            <svg width='20' height='20' viewBox='0 0 24 24' fill='none'>
                                                <path
                                                    d='M1.5 12C3.1 7.2 7.35 4 12.045 4C16.74 4 21 7.2 22.5 12C21 16.8 16.74 20 12.045 20C7.35 20 3.1 16.8 1.5 12Z'
                                                    stroke='currentColor'
                                                    strokeWidth='1.5'
                                                    strokeLinecap='round'
                                                    strokeLinejoin='round'
                                                />
                                                <circle
                                                    cx='12.05'
                                                    cy='12'
                                                    r='2.5'
                                                    stroke='currentColor'
                                                    strokeWidth='1.5'
                                                />
                                                <path
                                                    d='M3 3L21 21'
                                                    stroke='currentColor'
                                                    strokeWidth='1.5'
                                                    strokeLinecap='round'
                                                    strokeLinejoin='round'
                                                />
                                            </svg>
                                        ) : (
                                            <div
                                                className='w-6 h-6'
                                            >
                                                <Image 
                                                    src={showEyeIcon} 
                                                    alt='show eye icon' 
                                                    width={24} 
                                                    height={24} 
                                                />
                                            </div>
                                        )}
                                    </button>
                                </div>
                            </div>
                            {isRegistered ? 
                                <div className="flex items-center justify-start gap-2.5 p-2.5 px-4 lg:px-0">
                                    <input type="checkbox" id="remember" name="remember" className="w-4 h-4 text-gray-300"
                                        checked={rememberMe}
                                        onChange={(e) => setRememberMe(e.target.checked)}
                                    />
                                    <label htmlFor="remember" className="text-normal font-regular font-inter text-black">Remember me</label>
                                </div>
                            :
                                <div className="flex items-center justify-start gap-2.5 p-2.5 px-4 lg:px-0">
                                    <input type="checkbox" id="termsAndPolicy" name="termsAndPolicy" className="w-4 h-4 text-gray-300"
                                        checked={termsAndPolicy}
                                        onChange={(e) => setTermsAndPolicy(e.target.checked)}
                                    />
                                    <label htmlFor="termsAndPolicy" className="text-normal font-regular font-inter text-black">
                                        <span>I agree to the </span>
                                        <Link href="/terms-of-service" className="text-[#7E3FF2]">Terms of Service</Link>
                                        <span> and </span>
                                        <Link href="/privacy-policy" className="text-[#7E3FF2]">Privacy Policy</Link>
                                        <span>.</span>
                                    </label>
                                </div>
                            }
                            {isRegistered && (
                                <p 
                                    className="text-normal font-regular font-inter text-[#7E3FF2] text-center cursor-pointer"
                                    onClick={handleForgotPassword}
                                >Forgot the password?</p>
                            )}
                            {error && (
                                <div className="text-small font-regular text-red-500 text-left">
                                    {error}
                                </div>
                            )}
                            <div className="lg:block hidden">
                                <Button
                                    onClick={() => {
                                        if (isRegistered) {
                                            handleLogin();
                                        } else {
                                            handleRegister();
                                        }
                                    }}
                                    padding="px-4 py-2 w-full"
                                >
                                    <p className="text-normal font-bold font-inter text-white text-center">{isRegistered ? "Login" : "Register"}</p>
                                </Button>
                            </div>
                        </div>
                        <div className="lg:hidden absolute bottom-16 px-4 w-full lg:px-0 lg:w-auto">
                            <Button
                                onClick={() => {
                                    if (isRegistered) {
                                        handleLogin();
                                    } else {
                                        handleRegister();
                                    }
                                }}
                                padding="px-4 py-2 w-full"
                            >
                                <p className="text-normal font-bold font-inter text-white text-center">{isRegistered ? "Login" : "Register"}</p>
                            </Button>
                        </div>
                    </div>
                    }
                </div>
            }
        />
    );
};

export default LoginSignupModal;
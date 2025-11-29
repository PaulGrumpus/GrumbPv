'use client';

import Button from '@/components/button'
import Image from 'next/image'
import { useState, useEffect, useRef } from 'react';
import { ChevronDownIcon, ChevronUpIcon, XMarkIcon } from "@heroicons/react/20/solid";
import { LoadingCtx } from '@/context/loadingContext';
import { useContext } from 'react';
import Loading from '@/components/loading';
import { UserInfoCtx } from '@/context/userContext';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { User } from '@/types/user';
import { updateUser } from '@/utils/functions';
import { EscrowBackendConfig } from '@/config/config';

type FormState = {
    userName: string;
    userEmail: string;
    userBio: string;
    userPhoto: string;
    selectedLanguage: string;
};

const ProfilePage = () => {
    const [userBio, setUserBio] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [selectedLanguage, setSelectedLanguage] = useState("");
    const [userName, setUserName] = useState("Alisa Wilson");
    const [userPhoto, setUserPhoto] = useState("/Grmps/profile-image.jpg");
    const [userWaletAddress, setUserWaletAddress] = useState<string | null>(null);
    const [userEmail, setUserEmail] = useState("");
    const userEmailImage = "/Grmps/envelope.svg";
    const [userRole, setUserRole] = useState("client");
    const charCount = 300;
    const showEyeIcon = "/Grmps/show.svg";
    const languages = ["English", "Spanish", "French", "German", "Italian", "Portuguese", "Russian", "Turkish"];
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [error, setError] = useState("");
    const [errorNewPassword, setErrorNewPassword] = useState(false);
    const [dropdownMenuOpen, setDropdownMenuOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement | null>(null);
    const [checkError, setCheckError] = useState(false);
    const [uploadedFileName, setUploadedFileName] = useState("");
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    const initialFormState = useRef<FormState>({
        userName: "",
        userEmail: "",
        userBio: "",
        userPhoto: "",
        selectedLanguage: "",
    });  
    const { userInfo, setUserInfo } = useContext(UserInfoCtx);
    const { loadingState, setLoadingState } = useContext(LoadingCtx);
    const [loading, setLoading] = useState("pending");
    const router = useRouter();

    useEffect(() => {
        if (!selectedFile) {
            setPreviewUrl(null);
            return;
        }

        const objectUrl = URL.createObjectURL(selectedFile);
        setPreviewUrl(objectUrl);

        return () => {
            URL.revokeObjectURL(objectUrl);
        };
    }, [selectedFile]);


    const handleUploadFile = () => {
        const fileInput = document.createElement("input");
        fileInput.type = "file";
        fileInput.accept = "image/*";
        fileInput.onchange = () => {
            const file = fileInput.files?.[0];
            if (!file) {
                return;
            }
            setSelectedFile(file);
            setUploadedFileName(file.name);

            toast.success(`Selected ${file.name}`, {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
            });
        };
        fileInput.click();
    }

    const removeUploadedFile = () => {
        setSelectedFile(null);
        setUploadedFileName("");
        setPreviewUrl(null);
        toast.success("Uploaded file removed", {
            position: "top-right",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
        });
    }

    const handleSave = async () => {
        if (error || errorNewPassword) {
            setCheckError(true);
            return;
        }

        setCheckError(false);
        initialFormState.current = {
            userName,
            userEmail,
            userBio,
            userPhoto,
            selectedLanguage,
        };

        setNewPassword("");
        setConfirmPassword("");
        setUploadedFileName("");
        setPreviewUrl(null);
        setSelectedFile(null);

        const user: User = {
            address: userInfo?.address || "",
            chain: userInfo?.chain || "",
            id: userInfo?.id || "",
            display_name: userName,
            email: userEmail,
            password: newPassword,
            bio: userBio,
            role: userRole || "",
            image_id: userInfo?.image_id,
            is_verified: userInfo?.is_verified || false,
            created_at: userInfo?.created_at || "",
            updated_at: userInfo?.updated_at || "",
        };

        const response = await updateUser(user, selectedFile);
        if (response.success) {
            toast.success("Profile updated successfully", {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
            });

            setUserInfo({
                ...userInfo,
                image_id: response.data?.image_id || "",
                updated_at: response.data?.updated_at || "",
                created_at: response.data?.created_at || "",
                address: response.data?.address || "",
                chain: response.data?.chain || "",
                email: response.data?.email || "",
                password: response.data?.password || "",
                role: response.data?.role || "",
                display_name: response.data?.display_name || "",
                bio: response.data?.bio || "",
            });
        }
        else {
            toast.error(response.error, {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
            });
        }
    };

    const handleCopy = async (str: string) => {
        try {
            if (navigator?.clipboard?.writeText) {
                await navigator.clipboard.writeText(str);
            } else {
                const textArea = document.createElement("textarea");
                textArea.value = str;
                textArea.setAttribute("readonly", "");
                textArea.style.position = "absolute";
                textArea.style.left = "-9999px";
                document.body.appendChild(textArea);
                textArea.select();
                document.execCommand("copy");
                document.body.removeChild(textArea);
            }
            toast.success(
                "Copied wallet address to clipboard",
                {
                    position: "top-right",
                    autoClose: 5000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                }
            );
        } catch (error) {
            toast.error(
                "Failed to copy ipfs url",
                {
                    position: "top-right",
                    autoClose: 5000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                }
            );
        }
    }

    const resetForm = () => {
        const { userName: initialUserName, userEmail: initialUserEmail, userBio: initialBio, selectedLanguage: initialLanguage } = initialFormState.current;

        setUserName(initialUserName);
        setUserBio(initialBio);
        setUserEmail(initialUserEmail);
        setNewPassword("");
        setConfirmPassword("");
        setSelectedLanguage(initialLanguage);
        setShowNewPassword(false);
        setShowConfirmPassword(false);
        setDropdownMenuOpen(false);
        setError("");
        setErrorNewPassword(false);
        setCheckError(false);
    };

    useEffect(() => {
        if (newPassword !== confirmPassword) {
            setErrorNewPassword(true);
            setError("New password and confirm password should be same!");
        } else {
            setErrorNewPassword(false);
            setError("");
        }
    }, [newPassword, confirmPassword]);    

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                dropdownMenuOpen &&
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target as Node)
            ) {
                setDropdownMenuOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [dropdownMenuOpen]);

    useEffect(() => {
        if(loadingState === "success") {
            if(userInfo.id === "") {
                router.push("/");
                return;
            }
            if (userInfo && userInfo.id) {
                initialFormState.current = {                
                    userName: userInfo.display_name || "",
                    userEmail: userInfo.email || "",
                    userBio: userInfo.bio || "",
                    userPhoto: userInfo.image_id ? EscrowBackendConfig.uploadedImagesURL + userInfo.image_id : "",
                    selectedLanguage,
                };
                console.log("test-initialFormState", initialFormState.current);
                console.log("test-userInfo", userInfo);
                setUserBio(userInfo.bio || "")
                setSelectedLanguage("")
                setUserName(userInfo.display_name || "")
                setUserPhoto(userInfo.image_id ? EscrowBackendConfig.uploadedImagesURL + userInfo.image_id : "")
                setUserRole(userInfo.role || "")
                setUserEmail(userInfo.email || "")
                setUserWaletAddress(userInfo.address || "")
                setLoading("success");
            }
        } else if (loadingState === "failure") {
            router.push("/");
        }
    }, [userInfo, loadingState, router])

    if (loading === "pending") {
        return <Loading />;
    }

    if (loading === "success") {
        return (
            <div className='pt-34 pb-8.75 px-16 bg-white'>
                <div className='container mx-auto'>
                    <h1 className='text-display font-bold text-black'>Profile</h1>
                    <div className='flex flex-col items-center'>
                        <div className='min-w-140 pt-10.25 gap-6 flex flex-col pb-10.25'>
                            <p className='text-normal font-regular text-black text-left pb-2'>Photo</p>
                            {!uploadedFileName && userPhoto && (
                                <div className='flex items-center gap-6 flex-col justify-center'>
                                    <div
                                        className='w-25 h-25 rounded-full overflow-hidden'
                                    >
                                        <Image 
                                            src={userPhoto} 
                                            alt='User Photo' 
                                            width={100} 
                                            height={100} 
                                            className='h-full w-full rounded-full object-cover'
                                        />
                                    </div>
                                    <Button variant='secondary' padding='px-5 py-2' onClick={handleUploadFile}
                                    >Change Photo</Button>
                                </div>
                            )}
                            {uploadedFileName ? (
                                <div className='flex items-center gap-6 flex-col justify-center'>
                                    <div className="w-25 h-25 relative">
                                        {previewUrl ? (
                                            <img
                                                src={previewUrl}
                                                alt="uploaded preview"
                                                className="w-full h-full rounded-full object-cover"
                                            />                                            
                                        ) : (
                                            <p className="text-normal font-regular text-black text-left">No image uploaded</p>
                                        )}
                                        <XMarkIcon className="w-6 h-6 absolute text-black cursor-pointer top-[-10px] right-[-15px]" onClick={removeUploadedFile}/>
                                    </div>
                                    <p className="text-tiny font-regular text-[#7E3FF2] text-left">The uploaded image should be less than 20MB</p>
                                    <Button variant='secondary' padding='px-5 py-2' onClick={handleUploadFile}>Change Photo</Button>
                                </div>
                            ) : (
                                !userPhoto && (
                                    <div className='flex items-center justify-center'>
                                        <Button variant='secondary' padding='px-5 py-2' onClick={handleUploadFile}>Upload Photo</Button>
                                    </div>
                                )
                            )}
                            <div>
                                <p className='text-normal font-regular text-black text-left pb-2'>Username</p>
                                <input
                                    value={userName}
                                    onChange={(e) => setUserName(e.target.value)}
                                    className='w-full border border-[#8F99AF] rounded-lg p-3 flex-1 bg-transparent text-normal font-regular text-black text-left focus:outline-none'
                                    placeholder='Username'
                                />
                            </div>
                            <div>
                                <p className='text-normal font-regular text-black text-left pb-2'>Wallet Address</p>
                                {userWaletAddress ? (
                                    <div className='flex justify-between items-center border p-3 border-[#8F99AF] rounded-lg'>
                                        <p className='text-normal font-regular text-black text-left'>{userWaletAddress}</p>
                                        <Button variant='secondary' padding='p-2' onClick={() => handleCopy(userWaletAddress)}>Copy</Button>
                                    </div>
                                ) : (
                                    <Button padding='p-2'>Connect Wallet</Button>
                                )}
                            </div>
                            <div>
                                <p className='text-normal font-regular text-black text-left pb-2'>Email</p>
                                <div className='flex gap-3 items-center border p-3 border-[#8F99AF] rounded-lg'>
                                    <div
                                        className='w-6 h-6 rounded-full overflow-hidden'
                                    >
                                        <Image 
                                            src={userEmailImage} 
                                            alt='envelope' 
                                            width={24} 
                                            height={24} 
                                            className='h-full w-full rounded-full object-cover'
                                        />
                                    </div>
                                    <input
                                        value={userEmail || ""}
                                        onChange={(e) => setUserEmail(e.target.value)}
                                        className='flex-1 bg-transparent text-normal font-regular text-black text-left focus:outline-none'
                                        placeholder='Email'
                                    />
                                </div>
                            </div>
                            <div>
                                <p className='text-normal font-regular text-black text-left pb-2'>Role</p>
                                <p className='text-normal font-regular text-black text-left p-3 border border-[#8F99AF] rounded-lg'>{userRole}</p>
                            </div>
                            <div className='w-140'>
                                <p className='text-normal font-regular text-black text-left pb-2'>About</p>
                                <div className='flex flex-col'>
                                    <textarea className='text-normal font-regular text-black text-left p-3 border border-[#8F99AF] rounded-lg max-w-full min-h-45 resize-none mb-2' value={userBio} onChange={(e) => setUserBio(e.target.value)} />
                                    <div className='flex justify-flex-end'>
                                        <p className='text-normal font-regular text-gray-400 text-left'>{charCount - userBio.length} characters left</p>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <p className='text-normal font-regular text-black text-left pb-2'>Password</p>
                                <div 
                                    className={`flex items-center border border-[#8F99AF] rounded-lg p-3 gap-3 mt-4 ${errorNewPassword ? 'border-red-500' : ''}`}
                                >
                                    <input
                                        type={showNewPassword ? 'text' : 'password'}
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        className='flex-1 bg-transparent text-normal font-regular text-black text-left focus:outline-none'
                                        placeholder='New password'
                                    />
                                    <button
                                        type='button'
                                        onClick={() => setShowNewPassword((prev) => !prev)}
                                        aria-label={showNewPassword ? 'Hide new password' : 'Show new password'}
                                        className='text-black'
                                    >
                                        {showNewPassword ? (
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
                                <div className={`flex items-center border border-[#8F99AF] rounded-lg p-3 gap-3 mt-4 ${errorNewPassword ? 'border-red-500' : ''}`}>
                                    <input
                                        type={showConfirmPassword ? 'text' : 'password'}
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className='flex-1 bg-transparent text-normal font-regular text-black text-left focus:outline-none'
                                        placeholder='Confirm password'   
                                    />
                                    <button
                                        type='button'
                                        onClick={() => setShowConfirmPassword((prev) => !prev)}
                                        aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                                        className='text-black'
                                    >
                                        {showConfirmPassword ? (
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
                            <div className='flex flex-col gap-2'>
                                <p className='text-normal font-regular text-black text-left'>Language</p>
                                <div ref={dropdownRef} className={`relative max-w-140 ${dropdownMenuOpen ? 'border-blue-500' : ''}`}>
                                    <select
                                        value={selectedLanguage}
                                        onChange={(e) => {
                                            setSelectedLanguage(e.target.value);
                                            setDropdownMenuOpen(false);
                                        }}
                                        className='w-full appearance-none rounded-lg border border-[#8F99AF] bg-white p-3 text-normal font-regular text-black focus:outline-none focus:border-blue-500'
                                        onClick={(event) => {
                                            event.stopPropagation();
                                            setDropdownMenuOpen((prev: boolean) => !prev);
                                        }}
                                    >
                                        <option value='' disabled>
                                            Select one ...
                                        </option>
                                        {languages.map((language) => (
                                            <option key={language} value={language} className='text-normal font-regular text-black bg-white py-2 px-3'>
                                                {language}
                                            </option>
                                        ))}
                                    </select>
                                    {dropdownMenuOpen ? (
                                        <ChevronUpIcon className="w-5 h-5 text-black absolute right-3 top-1/2 -translate-y-1/2" />
                                    ) : (
                                        <ChevronDownIcon className="w-5 h-5 text-black absolute right-3 top-1/2 -translate-y-1/2" />
                                    )}
                                </div>
                            </div>
                            {error && checkError && <p className='text-normal font-regular text-red-500 text-left'>{error}</p>}
                        </div>
                        <div className='flex justify-center gap-2.5'>
                            <Button 
                                variant='secondary' 
                                padding='px-8.75 py-3'
                                onClick={resetForm}
                            >   
                                Cancel
                            </Button>
                            <Button 
                                variant='primary' 
                                padding='px-10.5 py-3.25'
                                onClick={() => handleSave()}
                            >
                                Save
                            </Button>
    
                        </div>
                    </div>
                </div>
            </div>
        );
    } else {
        return <Loading />;
    }
}

export default ProfilePage 
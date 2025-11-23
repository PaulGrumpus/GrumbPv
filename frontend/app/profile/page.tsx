'use client';

import Button from '@/components/Button'
import Image from 'next/image'
import { useState, useEffect, useRef } from 'react';
import { ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/20/solid";

type FormState = {
    userBio: string;
    selectedLanguage: string;
};

const ProfilePage = () => {
    const [userBio, setUserBio] = useState("");
    const [password, setPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [selectedLanguage, setSelectedLanguage] = useState("");
    const userName = "Alisa Wilson";
    const userPhoto = "/Grmps/profile-image.jpg";
    const userWaletAddress = "0x1234567890abcdef1234567890abcdef12345678";
    const userEmail = "alisa@gmail.com";
    const userEmailImage = "/Grmps/envelope.svg";
    const userRole = "Freelancer";
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
    const initialFormState = useRef<FormState>({
        userBio: "",
        selectedLanguage: "",
    });

    const handleSave = () => {
        if (error || errorNewPassword) {
            setCheckError(true);
            return;
        }

        setCheckError(false);
        initialFormState.current = {
            userBio,
            selectedLanguage,
        };

        setPassword("");
        setNewPassword("");
        setConfirmPassword("");

        console.log("Data:", {
            userBio,
            password,
            newPassword,
            confirmPassword,
            selectedLanguage,
        });
    };

    const resetForm = () => {
        const { userBio: initialBio, selectedLanguage: initialLanguage } = initialFormState.current;

        setUserBio(initialBio);
        setPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setSelectedLanguage(initialLanguage);
        setShowPassword(false);
        setShowNewPassword(false);
        setShowConfirmPassword(false);
        setDropdownMenuOpen(false);
        setError("");
        setErrorNewPassword(false);
        setCheckError(false);
    };

    useEffect(() => {
        if (password !== "" && newPassword !== "" && password === newPassword) {
            setError("Current Password and New Password should not be same!");
        } else {
            setError("");
        }
    }, [password, newPassword]);

    useEffect(() => {
        if (newPassword !== confirmPassword) {
            setErrorNewPassword(true);
        } else {
            setErrorNewPassword(false);
        }
    }, [newPassword, confirmPassword]);    

    useEffect(() => {
        initialFormState.current = {
            userBio,
            selectedLanguage,
        };
    }, []);

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
    
    return (
        <div className='pt-34 pb-8.75 px-16 bg-white'>
            <div className='container mx-auto'>
                <h1 className='text-display font-bold text-black'>Profile</h1>
                <div className='flex flex-col items-center'>
                    <div className='min-w-140 pt-10.25 gap-6 flex flex-col pb-10.25'>
                        <p className='text-normal font-regular text-black text-left pb-2'>Photo</p>
                        {userPhoto ? (
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
                                <Button variant='secondary' padding='px-5 py-2'>Change Photo</Button>
                            </div>
                        ) : (
                            <Button>Upload Photo</Button>
                        )}
                        <div>
                            <p className='text-normal font-regular text-black text-left pb-2'>Username</p>
                            <p className='text-normal font-regular text-black text-left p-3 border border-[#8F99AF] rounded-lg'>{userName}</p>
                        </div>
                        <div>
                            <p className='text-normal font-regular text-black text-left pb-2'>Wallet Address</p>
                            {userWaletAddress ? (
                                <div className='flex justify-between items-center border p-3 border-[#8F99AF] rounded-lg'>
                                    <p className='text-normal font-regular text-black text-left'>{userWaletAddress}</p>
                                    <Button variant='secondary' padding='p-2'>Copy</Button>
                                </div>
                            ) : (
                                <Button padding='p-2'>Connect Wallet</Button>
                            )}
                        </div>
                        <div>
                            <p className='text-normal font-regular text-black text-left pb-2'>Email</p>
                            {userEmail ? (
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
                                    <p className='text-normal font-regular text-black text-left'>{userEmail}</p>
                                </div>
                            ) : (
                                <p className='text-normal font-regular text-gray-400 text-left p-3 border border-[#8F99AF] rounded-lg'>No email found</p>
                            )}
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
                            <div className='flex items-center border border-[#8F99AF] rounded-lg p-3 gap-3'>
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className='flex-1 bg-transparent text-normal font-regular text-black text-left focus:outline-none'
                                    placeholder='Current Password'
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
}

export default ProfilePage 
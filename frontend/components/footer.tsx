'use client';

import Image from "next/image";
import Button from "./button";
import Input from "./Input";
import { useState } from "react";
import Textarea from "./textarea";
import { EscrowBackend } from "../service/axios";

const Footer = () => {

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [inquiry, setInquiry] = useState("");

    const footerLinks = [
        {
            title: "Column One",
            items: [
                {
                    title: "Link One",
                    href: "/link-one"
                },
                {
                    title: "Link Two",
                    href: "/link-two"
                },
                {
                    title: "Link Three",
                    href: "/link-three"
                },
                {
                    title: "Link Four",
                    href: "/link-four"
                },
                {
                    title: "Link Five",
                    href: "/link-five"
                }
            ]
        },
        {
            title: "Column Tow",
            items: [
                {
                    title: "Link Six",
                    href: "/link-six"
                },
                {
                    title: "Link Seven",
                    href: "/link-seven"
                },
                {
                    title: "Link Eight",
                    href: "/link-eight"
                },
                {
                    title: "Link Nine",
                    href: "/link-nine"
                },
                {
                    title: "Link Ten",
                    href: "/link-ten"
                }
            ]
        },
        {
            title: "Column Three",
            items: [
                {
                    title: "Link Eleven",
                    href: "/link-eleven"
                },
                {
                    title: "Link Twelve",
                    href: "/link-twelve"
                },
                {
                    title: "Link Thirteen",
                    href: "/link-thirteen"
                },
                {
                    title: "Link Fourteen",
                    href: "/link-fourteen"
                },
                {
                    title: "Link Fifteen",
                    href: "/link-fifteen"
                }
            ]
        },
    ]

    const footerUnderlinedLinks = [
        {
            title: "Privacy Policy",
            href: "/privacy-policy"
        },
        {
            title: "Terms of Service",
            href: "/terms-of-service"
        },
        {
            title: "Cookie Settings",
            href: "/cookie-settings"
        }
    ]

    const footerSocialIcons = [
        {
            alt: "Twitter",
            src: "/Grmps/xlog.svg",
            href: "https://x.com/PaulGrumpus"
        },
        {
            alt: "Instagram",
            src: "/Grmps/insta.svg",
            href: "https://www.instagram.com/paulgrumpus?igsh=OTg3ajRmaGFuZDNr"
        },
        {
            alt: "TikTok",
            src: "/Grmps/tik.svg",
            href: "https://www.tiktok.com/@paulgrumpus?_t=ZS-8vgQJ2UeX1l&_r=1"
        },
        {
            alt: "Github",
            src: "/Grmps/github.svg",
            href: "https://github.com/PaulGrumpus"
        },
        {
            alt: "LinkedIn",
            src: "/Grmps/link.png",
            href: "/"
        }
    ]

    const [success, setSuccess] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        // Validate fields
        if (!name.trim() || !email.trim() || !inquiry.trim()) {
            setError("Please fill in all fields");
            return;
        }

        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setError("Please enter a valid email address");
            return;
        }

        setError("");
        setLoading(true);

        try {
            await EscrowBackend.post('/contact', {
                name: name.trim(),
                email: email.trim(),
                inquiry: inquiry.trim(),
            });

            // Clear form on success
            setName("");
            setEmail("");
            setInquiry("");
            setSuccess(true);
            
            // Clear success message after 5 seconds
            setTimeout(() => {
                setSuccess(false);
            }, 5000);
        } catch (err: any) {
            const errorMessage = err?.response?.data?.message || err?.message || "Failed to submit contact form. Please try again.";
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    }
    return (
        <footer className="from-bg-light-bule-to-bg-purple text-black py-20 px-16 bg-white">
            <div className="container mx-auto">
                <div className="flex flex-col justify-center gap-12 md:gap-16 lg:flex-row lg:items-start lg:justify-between pb-12 lg:pb-20">
                    <div className="flex flex-col gap-12 max-w-[640px] lg:flex-row md:items-start">
                        <div className="flex items-center gap-1">
                            <div className="w-8.75 h-8.75 overflow-hidden rounded-full">
                                <Image
                                    src="/Grmps/grmps.jpg"
                                    alt="Logo"
                                    width={40}
                                    height={40}
                                    className="h-full w-full rounded-full object-cover"
                                />
                            </div>
                            <p className="text-logo font-poppins font-bold">GrumBuild</p>
                        </div>
                        <div className="flex flex-col gap-4 md:gap-6">
                            {footerSocialIcons.map((icon) => (
                                <a href={icon.href} className="text-small font-roboto font-regular" key={icon.alt}>
                                    <div className="flex items-center gap-3">
                                        <Image src={icon.src} alt={icon.alt} width={24} height={24} />
                                        <p className="text-small font-roboto font-regular">{icon.alt}</p>
                                    </div>
                                </a>
                            ))}
                        </div>
                    </div>
                    <div className="w-full max-w-sm">
                        <p className="text-large font-roboto font-medium pb-4">Get in touch</p>
                        <div className="flex flex-col gap-4">
                            <div className="flex flex-col gap-1">
                                {/* <p className='text-normal font-medium text-left'>Name</p> */}
                                <Input
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    type="text"
                                    placeholder="Name"
                                    wrapperClassName="w-full"
                                />
                            </div>
                            <div className="flex flex-col gap-1">
                                {/* <p className='text-normal font-medium text-left'>Email</p> */}
                                <Input
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    type="email"
                                    placeholder="Email"
                                    wrapperClassName="w-full"
                                />
                            </div>
                            <div className="flex flex-col gap-1">
                                {/* <p className='text-normal font-medium text-left pb-2'>What is your enquiry</p> */}
                                <div className='flex flex-col'>
                                    <Textarea
                                        value={inquiry}
                                        onChange={(e) => {
                                            const value = e.target.value;
                                            // if (value.length <= charCount) {
                                            // }
                                            setInquiry(value);
                                        }}
                                        placeholder="What is your enquiry"
                                        wrapperClassName="w-full min-h-45"
                                    />
                                </div>
                            </div>
                            <Button
                                onClick={loading ? undefined : handleSubmit}
                                padding="w-full px-4 py-3"
                                variant={loading ? 'disable' : 'primary'}
                            >
                                {loading ? "Submitting..." : "Submit"}
                            </Button>
                        </div>
                        {error && (
                            <p className="text-small font-roboto font-regular mt-2 pb-6 text-red-600">{error}</p>
                        )}
                        {success && (
                            <p className="text-small font-roboto font-regular mt-2 pb-6 text-green-600">Thank you for your enquiry. We will get back to you soon.</p>
                        )}
                        {/* <p className="text-normal font-roboto font-regular pb-6">Join our newsletter to stay up to date on features and releases.</p>
                        <div className="flex flex-col gap-4 lg:flex-row">
                            <Input
                                type="email"
                                placeholder="Enter your email"
                                wrapperClassName="w-full"
                            />
                            <div className="w-full lg:w-[25%]">
                                <Button
                                    onClick={() => {}}
                                    padding="w-full px-4 py-3"
                                >
                                    Subscribe
                                </Button>
                            </div>
                        </div>
                        <p className="text-small font-roboto font-regular pt-4">
                            By subscribing you agree to our <a href="/privacy-policy" className="text-small font-roboto font-regular underline">Privacy Policy</a> and consent to receive updates.
                        </p> */}
                    </div>
                </div>
                <div className="border-t border-t-black pt-4 pb-4"></div>
                <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-center">
                    {/* <div className="flex gap-3 order-1 lg:order-3 justify-start lg:justify-end">
                        {footerSocialIcons.map((icon) => (
                            <a href={icon.href} className="text-small font-roboto font-regular" key={icon.alt}>
                                <Image src={icon.src} alt={icon.alt} width={24} height={24} />
                            </a>
                        ))}
                    </div> */}
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:gap-6 order-2 lg:order-1">
                        <p className="text-small font-roboto font-regular order-2 lg:order-1 text-left">© 2025 Grumpus. All rights reserved.</p>
                        <div className="flex flex-col flex-wrap gap-4 lg:gap-6 lg:flex-row order-1 lg:order-2 text-left">
                            {footerUnderlinedLinks.map((link) => (
                                <a href={link.href} className="text-small font-roboto font-regular underline self-start" key={link.title}>{link.title}</a>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
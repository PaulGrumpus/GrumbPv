'use client';

import Image from "next/image";
import Button from "./button";
import Input from "./Input";

const Footer = () => {

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
            alt: "Facebook",
            src: "/Grmps/Facebook.svg",
            href: "/facebook"
        },
        {
            alt: "Twitter",
            src: "/Grmps/X.svg",
            href: "/twitter"
        },
        {
            alt: "Instagram",
            src: "/Grmps/Instagram.svg",
            href: "/instagram"
        },
        {
            alt: "LinkedIn",
            src: "/Grmps/LinkedIn.svg",
            href: "/linkedin"
        },
        {
            alt: "YouTube",
            src: "/Grmps/Youtube.svg",
            href: "/youtube"
        }
    ]
    return (
        <footer className="from-bg-light-bule-to-bg-purple text-black py-20 px-16 bg-white">
            <div className="container mx-auto">
                <div className="flex flex-col justify-center gap-12 md:gap-16 lg:flex-row lg:items-start lg:justify-between pb-12 lg:pb-20">
                    <div className="flex flex-col gap-6 max-w-[640px] lg:flex-row md:items-start">
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9">
                                <Image src="/Grmps/logo2.svg" alt="Logo" width={35} height={35} />
                            </div>
                            <p className="text-logo font-poppins font-bold">Grumpus</p>
                        </div>
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                            {footerLinks.map((column, index) => (
                                <div key={index}>
                                    <p className="text-base font-roboto font-medium pb-4">{column.title}</p>
                                    <ul className="list-none w-full space-y-2">
                                        {column.items.map((item) => (
                                            <li key={item.title}>
                                                <a href={item.href} className="text-small font-roboto font-regular">{item.title}</a>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="w-full max-w-sm">
                        <p className="text-normal font-roboto font-medium pb-4">Subscribe</p>
                        <p className="text-normal font-roboto font-regular pb-6">Join our newsletter to stay up to date on features and releases.</p>
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
                        </p>
                    </div>
                </div>
                <div className="border-t border-t-black pt-4 pb-4"></div>
                <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex gap-3 order-1 lg:order-3 justify-start lg:justify-end">
                        {footerSocialIcons.map((icon) => (
                            <a href={icon.href} className="text-small font-roboto font-regular" key={icon.alt}>
                                <Image src={icon.src} alt={icon.alt} width={24} height={24} />
                            </a>
                        ))}
                    </div>
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
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
                <div className="flex items-center justify-between pb-20">
                    <div className="flex gap-10">
                        <div className="flex max-h-10.25 items-center">
                            <div className="w-8.95 h-8.95 pr-1">
                                <Image src="/Grmps/logo2.svg" alt="Logo" width={35} height={35} />
                            </div>
                            <p className="text-logo font-poppins font-bold pr-1.75">Grumpus</p>
                        </div>
                        <div className="flex gap-10">
                            {footerLinks.map((column, index) => (
                                <div key={index} className="w-35.25">
                                    <p className="text-base font-roboto font-medium pb-4">{column.title}</p>
                                    <ul className="list-none w-full">
                                        {column.items.map((item) => (
                                            <li key={item.title} className="h-9.25 flex items-center">
                                                <a href={item.href} className="text-small font-roboto font-regular">{item.title}</a>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="w-125">
                        <p className="text-normal font-roboto font-medium pb-4">Subscribe</p>
                        <p className="text-normal font-roboto font-regular pb-6">Join our newsletter to stay up to date on features and releases.</p>
                        <div className="flex gap-4">
                            <Input
                                type="email"
                                placeholder="Enter your email"
                                wrapperClassName="w-91.25"
                            />
                            <Button
                                onClick={() => {}}
                            >
                                Subscribe
                            </Button>
                        </div>
                        <p className="text-small font-roboto font-regular pt-4">By subscribing you agree to with our <a href="/privacy-policy" className="text-small font-roboto font-regular">Privacy Policy</a> and provide consent to receive updates from our company.</p>
                    </div>
                </div>
                <div className="border-t border-t-black pt-4 pb-4"></div>
                <div className="flex justify-between">
                    <div className="flex">
                        <p className="text-small font-roboto font-regular pr-6">© 2025 Grumpus. All rights reserved.</p>
                        <div className="flex gap-6">
                            {footerUnderlinedLinks.map((link) => (
                                <a href={link.href} className="text-small font-roboto font-regular underline" key={link.title}>{link.title}</a>
                            ))}
                        </div>
                    </div>
                    <div className="flex gap-3.5">
                        {footerSocialIcons.map((icon) => (
                            <a href={icon.href} className="text-small font-roboto font-regular" key={icon.alt}>
                                <Image src={icon.src} alt={icon.alt} width={24} height={24} />
                            </a>
                        ))}
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
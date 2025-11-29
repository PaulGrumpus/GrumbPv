"use client";

import { useRef, useState, useEffect } from "react";
import SectionPlaceholder from "./sectionPlaceholder";
import { ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/20/solid";
import Button from "../button";
import Image from "next/image";
import { toast } from "react-toastify";

const uploadImage = "/Grmps/upload.svg";

const CreateGigSection = () => {
    const [title, setTitle] = useState("");
    const dropdownRef = useRef<HTMLDivElement | null>(null);
    const [dropdownMenuOpen, setDropdownMenuOpen] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState("");
    const categories = ["Category 1", "Category 2", "Category 3"];
    const [description, setDescription] = useState("");
    const [link, setLink] = useState("");

    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [uploadedFileName, setUploadedFileName] = useState<string>("");
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    const handleUploadFile = () => {
        const fileInput = document.createElement("input");
        fileInput.type = "file";
        fileInput.accept = "*/*";
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

    return (
        <div>
            <SectionPlaceholder
                title="Create Gig"
                description="Set up a new gig to showcase your services to clients."
            /> 
            <div className="linear-border rounded-lg p-0.25 linear-border--dark-hover">
                <div className="linear-border__inner rounded-[0.4375rem] bg-white p-8">
                    <div className='flex flex-col gap-6'>
                        <div>
                            <p className='text-normal font-regular text-black text-left pb-2'>Title</p>
                            <input
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className='w-full bg-transparent text-normal font-regular text-black text-left focus:outline-none border border-[#8F99AF] rounded-lg p-3'
                                placeholder='Title'
                            />
                        </div>
                        <div className='flex flex-col gap-2'>
                            <p className='text-normal font-regular text-black text-left'>Category</p>
                            <div ref={dropdownRef} className={`relative w-full ${dropdownMenuOpen ? 'border-blue-500' : ''}`}>
                                <select
                                    value={selectedCategory}
                                    onChange={(e) => {
                                        setSelectedCategory(e.target.value);
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
                                    {categories.map((category) => (
                                        <option key={category} value={category} className='text-normal font-regular text-black bg-white py-2 px-3'>
                                            {category}
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
                        <div className='w-full'>
                            <p className='text-normal font-regular text-black text-left pb-2'>Description</p>
                            <div className='flex flex-col'>
                                <textarea className='text-normal font-regular text-black text-left p-3 border border-[#8F99AF] rounded-lg max-w-full min-h-33.5 resize-none' value={description} onChange={(e) => setDescription(e.target.value)} />
                            </div>
                        </div>
                        <div>
                            <p className='text-normal font-regular text-black text-left pb-2'>Link</p>
                            <input
                                value={link}
                                onChange={(e) => setLink(e.target.value)}
                                className='w-full bg-transparent text-normal font-regular text-black text-left focus:outline-none border border-[#8F99AF] rounded-lg p-3'
                                placeholder='Link'
                            />
                        </div>
                        <div >
                            {uploadedFileName ? (
                                <div className="">
                                    <div className="w-full h-100">
                                        {previewUrl ? (
                                            <img
                                                src={previewUrl}
                                                alt="uploaded preview"
                                                className="w-full h-full rounded-lg object-cover"
                                            />
                                        ) : (
                                            <p className="text-normal font-regular text-black text-left">No image uploaded</p>
                                        )}
                                    </div>
                                    <p 
                                        className=" pt-4 text-normal font-regular text-[#2F3DF6] underline cursor-pointer"
                                        onClick={removeUploadedFile}
                                    >
                                        {uploadedFileName}
                                    </p>
                                </div>
                            ) : (
                                <div className='w-40'>
                                    <Button
                                        variant="secondary"
                                        padding="p-3"
                                        onClick={() => handleUploadFile()}
                                    >
                                        <div className="flex items-center gap-2">
                                            <div>
                                                <Image
                                                    src={uploadImage}
                                                    alt="upload"
                                                    width={24}
                                                    height={24}
                                                />
                                            </div>
                                            <p className="text-normal font-regular">Upload Image</p>
                                        </div>
                                    </Button>
                                </div>
                            )}
                        </div>
                        <div className='w-30'>
                            <Button
                                padding='px-10.75 py-3'
                            >
                                <p className='text-normal font-regular'>Post</p>
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
export default CreateGigSection;

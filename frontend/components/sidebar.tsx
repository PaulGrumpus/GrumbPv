'use client'

import Image from "next/image";
import { useState } from "react";

interface SidebarItem {
    icon?: string;
    label: string;
    click?: () => void;
    count?: number;
    subItems?: SidebarItem[];
}

interface SidebarProps {
    sidebarItems: SidebarItem[];
    selectedLabel?: string | null;
    onSelect?: (item: SidebarItem) => void;
}

const itemContainsLabel = (item: SidebarItem, label: string | null): boolean => {
    if (!label) {
        return false;
    }

    if (item.label === label) {
        return true;
    }

    return item.subItems?.some((child) => itemContainsLabel(child, label)) ?? false;
};

const Sidebar = ({ sidebarItems, selectedLabel, onSelect }: SidebarProps) => {
    const [internalSelectedLabel, setInternalSelectedLabel] = useState<string | null>(selectedLabel ?? null);
    const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});

    const isControlled = selectedLabel !== undefined;
    const activeLabel = isControlled ? selectedLabel : internalSelectedLabel;

    const handleClick = (item: SidebarItem) => {
        item.click?.();
        if (onSelect) {
            onSelect(item);
        }

        if (!isControlled) {
            setInternalSelectedLabel(item.label);
        }
    };

    const toggleExpand = (label: string) => {
        setExpandedSections((prev) => ({
            ...prev,
            [label]: !prev[label],
        }));
    };

    const renderItems = (items: SidebarItem[], level = 0) =>
        items.map((item) => {
            const hasChildren = Boolean(item.subItems && item.subItems.length);
            const hasActiveDescendant = hasChildren
                ? item.subItems!.some((child) => itemContainsLabel(child, activeLabel ?? null))
                : false;
            const isExpanded = hasChildren ? expandedSections[item.label] ?? hasActiveDescendant : false;
            const isActive = activeLabel === item.label;

            return (
                <li key={item.label}>
                    <div
                        onClick={() => handleClick(item)}
                        className={`flex items-center gap-3 p-2 rounded-md hover:bg-[#2F3DF611] cursor-pointer ${
                            isActive ? "bg-[#2F3DF633]" : ""
                        }`}
                        style={level ? { paddingLeft: `${level * 16}px` } : undefined}
                    >
                        <div className="flex items-center gap-3 flex-1">
                            {item.icon ? (
                                <Image src={item.icon} alt={item.label} width={24} height={24} />
                            ) : (
                                <span className="w-6 h-6" />
                            )}
                            <div className="flex justify-between items-center w-full">
                                <p className="text-normal font-regular text-black">{item.label}</p>
                                {typeof item.count === "number" && item.count !== 0 && (
                                    <p className="text-small font-regular text-black border border-black rounded-[12.5rem] px-1.5">
                                        {item.count}
                                    </p>
                                )}
                            </div>
                        </div>
                        {hasChildren && (
                            <button
                                type="button"
                                aria-label={isExpanded ? "Collapse section" : "Expand section"}
                                onClick={(event) => {
                                    event.stopPropagation();
                                    toggleExpand(item.label);
                                }}
                                className="text-black"
                            >
                                <svg
                                    viewBox="0 0 16 16"
                                    xmlns="http://www.w3.org/2000/svg"
                                    className={`h-3 w-3 transition-transform ${isExpanded ? "rotate-90" : ""}`}
                                >
                                    <path
                                        d="M5 3.5L10.5 8L5 12.5"
                                        stroke="currentColor"
                                        strokeWidth="1.6"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />
                                </svg>
                            </button>
                        )}
                    </div>
                    {hasChildren && isExpanded && (
                        <ul className="mt-1">
                            {renderItems(item.subItems!, level + 1)}
                        </ul>
                    )}
                </li>
            );
        });

    return (
        <div className="px-4 py-6 min-w-58.5">
            <ul>{renderItems(sidebarItems)}</ul>
        </div>
    )
}

export default Sidebar;
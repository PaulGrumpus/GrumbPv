'use client';

import {
    useCallback,
    useEffect,
    useId,
    type MouseEvent,
    type ReactNode,
} from 'react';
import Button from './button';
import { XMarkIcon } from '@heroicons/react/20/solid';

interface ModalTemplateProps {
    isOpen: boolean;
    title?: string;
    subtitle?: string;
    children: ReactNode;
    actionLabel?: string;
    onAction: () => void;
    onClose?: () => void;
    dismissible?: boolean;
    className?: string;
    widthClassName?: string;
    actionSlot?: ReactNode;
    customButton?: boolean;
    linearBorder?: boolean;
    closeXIcon?: boolean;
}

const ModalTemplate = ({
    isOpen,
    title,
    subtitle,
    children,
    actionLabel,
    onAction,
    onClose,
    dismissible = true,
    className = '',
    widthClassName = 'w-300',
    customButton = false,
    linearBorder = true,
    closeXIcon = true,
}: ModalTemplateProps) => {
    const dialogTitleId = useId();
    const subtitleId = `${dialogTitleId}-subtitle`;
    const canDismiss = Boolean(onClose) && dismissible;

    useEffect(() => {
        if (!isOpen) {
            return;
        }

        const { style } = document.body;
        const previousOverflow = style.overflow;
        style.overflow = 'hidden';

        return () => {
            style.overflow = previousOverflow;
        };
    }, [isOpen]);

    const handleKeyClose = useCallback(
        (event: KeyboardEvent) => {
            if (!canDismiss) {
                return;
            }

            if (event.key === 'Escape') {
                onClose?.();
            }
        },
        [canDismiss, onClose]
    );

    useEffect(() => {
        if (!isOpen || !canDismiss) {
            return;
        }

        window.addEventListener('keydown', handleKeyClose);
        return () => {
            window.removeEventListener('keydown', handleKeyClose);
        };
    }, [isOpen, canDismiss, handleKeyClose]);

  if (!isOpen) {
    return null;
  }

    const handleOverlayClick = (event: MouseEvent<HTMLDivElement>) => {
        if (!canDismiss) {
            return;
        }

        if (event.target === event.currentTarget) {
            onClose?.();
        }
    };

    return (
        <div
            className="fixed inset-0 z-50 overflow-y-auto bg-white/40 backdrop-blur-sm"
            onClick={handleOverlayClick}
        >
            <div className="flex min-h-full items-center justify-center px-4 py-8 md:px-8 md:py-16">
                <div className={`${linearBorder ? 'linear-border rounded-lg p-0.25' : ''} ${widthClassName}`}>
                    <section
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby={dialogTitleId}
                        aria-describedby={subtitle ? subtitleId : undefined}
                        className={`${linearBorder ? 'linear-border__inner rounded-[0.4375rem]' : ''} rounded-3xl bg-white text-black shadow-[0_30px_80px_rgba(0,0,0,0.15)] ${className}`}
                    >
                        {title ? (
                            <div className="flex flex-col gap-6">
                                <div className="flex items-start justify-between gap-6">
                                    <h2 id={dialogTitleId} className="text-display font-bold">
                                        {title}
                                    </h2>
                                    {canDismiss ? (
                                    <button
                                        type="button"
                                        aria-label="Close modal"
                                        onClick={onClose}
                                        className="text-gray-500 transition-colors hover:text-gray-700 cursor-pointer p-2"
                                    >
                                        <XMarkIcon className="w-10 h-10" />
                                    </button>
                                ) : null}
                                </div>
                                {subtitle ? (
                                    <p
                                        id={subtitleId}
                                        className="mt-1 text-light-large text-gray-500"
                                    >
                                        {subtitle}
                                    </p>
                                ) : null}                            
                            </div>
                        ) :
                            closeXIcon ? (
                                <div className="flex items-center justify-end">
                                    <button
                                        type="button"
                                        aria-label="Close modal"
                                        onClick={onClose}
                                        className="text-gray-500 transition-colors hover:text-gray-700 cursor-pointer"
                                    >
                                        <XMarkIcon className="w-6 h-6" />
                                    </button>
                                </div> 
                            ) : null
                        }
                        

                        {children}

                        {customButton ? (
                            null
                        ) : (
                            <div className="flex items-center justify-end gap-3 px-6 pb-6">
                                <Button onClick={onAction} padding="px-6 py-2">
                                    {actionLabel}
                                </Button>
                            </div>
                        )}
                    </section>
                </div>
            </div>
        </div>
    );
};

export default ModalTemplate;



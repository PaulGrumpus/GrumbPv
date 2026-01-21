'use client';

import {
    createContext,
    ReactNode,
    useContext,
    useState,
    useCallback,
} from "react";

type MilestoneDeliveryState = Map<string, number>;
// Status values:
// 0: initial/not started
// 1: delivering (user clicked confirm, delivery in progress)
// 2: delivered (delivery completed successfully)

interface MilestoneDeliveryContextType {
    deliveryState: MilestoneDeliveryState;
    setMilestoneDelivering: (milestoneId: string) => void; // Set to 1 (delivering)
    setMilestoneDelivered: (milestoneId: string) => void; // Set to 2 (delivered)
    isMilestoneDelivering: (milestoneId: string) => boolean; // Check if status is 1
    isMilestoneDelivered: (milestoneId: string) => boolean; // Check if status is 2
    resetMilestoneDelivery: (milestoneId: string) => void; // Reset to 0
    getMilestoneStatus: (milestoneId: string) => number; // Get current status (0, 1, or 2)
}

const defaultProvider: MilestoneDeliveryContextType = {
    deliveryState: new Map(),
    setMilestoneDelivering: () => {},
    setMilestoneDelivered: () => {},
    isMilestoneDelivering: () => false,
    isMilestoneDelivered: () => false,
    resetMilestoneDelivery: () => {},
    getMilestoneStatus: () => 0,
};

export const MilestoneDeliveryCtx =
    createContext<MilestoneDeliveryContextType>(defaultProvider);

type Props = {
    children: ReactNode;
};

export const MilestoneDeliveryProvider = ({ children }: Props) => {
    const [deliveryState, setDeliveryState] = useState<MilestoneDeliveryState>(new Map());

    const setMilestoneDelivering = useCallback((milestoneId: string) => {
        setDeliveryState((prev) => {
            const next = new Map(prev);
            next.set(milestoneId, 1); // Set to delivering (1)
            return next;
        });
    }, []);

    const setMilestoneDelivered = useCallback((milestoneId: string) => {
        setDeliveryState((prev) => {
            const next = new Map(prev);
            next.set(milestoneId, 2); // Set to delivered (2)
            return next;
        });
    }, []);

    const isMilestoneDelivering = useCallback((milestoneId: string) => {
        return deliveryState.get(milestoneId) === 1;
    }, [deliveryState]);

    const isMilestoneDelivered = useCallback((milestoneId: string) => {
        return deliveryState.get(milestoneId) === 2;
    }, [deliveryState]);

    const resetMilestoneDelivery = useCallback((milestoneId: string) => {
        setDeliveryState((prev) => {
            const next = new Map(prev);
            next.set(milestoneId, 0); // Reset to initial (0)
            return next;
        });
    }, []);

    const getMilestoneStatus = useCallback((milestoneId: string) => {
        return deliveryState.get(milestoneId) ?? 0; // Default to 0 if not set
    }, [deliveryState]);

    return (
        <MilestoneDeliveryCtx.Provider
            value={{
                deliveryState,
                setMilestoneDelivering,
                setMilestoneDelivered,
                isMilestoneDelivering,
                isMilestoneDelivered,
                resetMilestoneDelivery,
                getMilestoneStatus,
            }}
        >
            {children}
        </MilestoneDeliveryCtx.Provider>
    );
};

export const useMilestoneDelivery = () => useContext(MilestoneDeliveryCtx);


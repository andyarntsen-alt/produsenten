import { createContext, useContext } from 'react';

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ConfirmOptions {
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    type?: 'danger' | 'warning' | 'info';
}

export interface ToastContextType {
    showToast: (message: string, type?: ToastType, duration?: number) => void;
    showConfirm: (options: ConfirmOptions) => Promise<boolean>;
}

export const ToastContext = createContext<ToastContextType | null>(null);

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
};

export type { ToastType, ConfirmOptions };

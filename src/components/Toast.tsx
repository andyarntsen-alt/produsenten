import React, { useState, useCallback, useEffect } from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { ToastContext, type ToastType, type ConfirmOptions, type ToastContextType } from './ToastContext';

interface Toast {
    id: string;
    message: string;
    type: ToastType;
    duration?: number;
}

const ToastIcon: React.FC<{ type: ToastType }> = ({ type }) => {
    switch (type) {
        case 'success':
            return <CheckCircle className="text-green-500" size={20} />;
        case 'error':
            return <AlertCircle className="text-red-500" size={20} />;
        case 'warning':
            return <AlertTriangle className="text-yellow-500" size={20} />;
        case 'info':
        default:
            return <Info className="text-blue-500" size={20} />;
    }
};

const ToastItem: React.FC<{ toast: Toast; onClose: () => void }> = ({ toast, onClose }) => {
    useEffect(() => {
        if (toast.duration) {
            const timer = setTimeout(onClose, toast.duration);
            return () => clearTimeout(timer);
        }
    }, [toast.duration, onClose]);

    const bgColor = {
        success: 'bg-green-50 border-green-200',
        error: 'bg-red-50 border-red-200',
        warning: 'bg-yellow-50 border-yellow-200',
        info: 'bg-blue-50 border-blue-200'
    }[toast.type];

    return (
        <div className={`${bgColor} border rounded-xl p-4 shadow-lg flex items-start gap-3 animate-slide-in min-w-[300px] max-w-md`}>
            <ToastIcon type={toast.type} />
            <p className="flex-1 text-sm text-gray-700">{toast.message}</p>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                <X size={16} />
            </button>
        </div>
    );
};

interface ConfirmDialogProps {
    options: ConfirmOptions;
    onConfirm: () => void;
    onCancel: () => void;
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({ options, onConfirm, onCancel }) => {
    const buttonColor = {
        danger: 'bg-red-600 hover:bg-red-700',
        warning: 'bg-yellow-600 hover:bg-yellow-700',
        info: 'bg-blue-600 hover:bg-blue-700'
    }[options.type || 'info'];

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
            <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden">
                <div className="p-6">
                    <h3 className="text-xl font-serif italic text-brand-text mb-2">{options.title}</h3>
                    <p className="text-gray-600 text-sm">{options.message}</p>
                </div>
                <div className="flex gap-3 p-4 bg-gray-50 border-t border-gray-100">
                    <button
                        onClick={onCancel}
                        className="flex-1 py-3 px-4 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-100 text-sm font-medium transition-colors"
                    >
                        {options.cancelText || 'Avbryt'}
                    </button>
                    <button
                        onClick={onConfirm}
                        className={`flex-1 py-3 px-4 rounded-xl text-white text-sm font-medium transition-colors ${buttonColor}`}
                    >
                        {options.confirmText || 'Bekreft'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [toasts, setToasts] = useState<Toast[]>([]);
    const [confirmState, setConfirmState] = useState<{
        options: ConfirmOptions;
        resolve: (value: boolean) => void;
    } | null>(null);

    const showToast = useCallback((message: string, type: ToastType = 'info', duration: number = 4000) => {
        const id = Date.now().toString();
        setToasts(prev => [...prev, { id, message, type, duration }]);
    }, []);

    const removeToast = useCallback((id: string) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    const showConfirm = useCallback((options: ConfirmOptions): Promise<boolean> => {
        return new Promise(resolve => {
            setConfirmState({ options, resolve });
        });
    }, []);

    const handleConfirm = () => {
        confirmState?.resolve(true);
        setConfirmState(null);
    };

    const handleCancel = () => {
        confirmState?.resolve(false);
        setConfirmState(null);
    };

    const contextValue: ToastContextType = { showToast, showConfirm };

    return (
        <ToastContext.Provider value={contextValue}>
            {children}

            {/* Toast Container */}
            <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2">
                {toasts.map(toast => (
                    <ToastItem
                        key={toast.id}
                        toast={toast}
                        onClose={() => removeToast(toast.id)}
                    />
                ))}
            </div>

            {/* Confirm Dialog */}
            {confirmState && (
                <ConfirmDialog
                    options={confirmState.options}
                    onConfirm={handleConfirm}
                    onCancel={handleCancel}
                />
            )}
        </ToastContext.Provider>
    );
};

export default ToastProvider;

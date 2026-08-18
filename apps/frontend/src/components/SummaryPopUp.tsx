import React, { useEffect } from 'react';
import { AlertCircle, Flame, Zap, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface RequestListPopupProps {
    open: boolean;
    onClose: () => void;
    title: string;
    requests: { id: number; text: string }[];
}

export default function RequestListPopup({ open, onClose, title, requests }: RequestListPopupProps) {
    const navigate = useNavigate();

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            const popup = document.getElementById('request-list-popup');
            if (popup && !popup.contains(e.target as Node)) onClose();
        };
        if (open) document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [open, onClose]);

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
            <div
                id="request-list-popup"
                className="bg-white rounded-xl shadow-lg w-full max-w-md pointer-events-auto relative"
            >
                <div className="bg-[#F2A057] h-10 rounded-t-xl relative">
                    <button
                        onClick={onClose}
                        className="absolute top-2 right-3 text-gray-600 hover:text-black text-2xl font-bold leading-none focus:outline-none z-10"
                        aria-label="Close"
                    >
                        &times;
                    </button>
                </div>

                <div className="px-6 py-4 text-left">
                    <h2 className="text-center text-2xl font-semibold text-black mb-4">{title}</h2>

                    {/* Scrollable list wrapper */}
                    <div className="max-h-[60vh] overflow-y-auto pr-1 custom-scrollbar">
                        <ul className="pt-2 pl-5 space-y-3 text-left w-full">
                            {requests.map((req) => {
                                const urgency = req.text.match(/\((.*?)\)$/)?.[1] || '';
                                const icon = {
                                    Emergency: <AlertCircle className="w-6 h-6 text-red-600" />,
                                    High: <Flame className="w-6 h-6 text-orange-500" />,
                                    Medium: <Zap className="w-6 h-6 text-yellow-400" />,
                                    Low: <CheckCircle className="w-6 h-6 text-green-500" />,
                                }[urgency] ?? null;

                                const textColor = {
                                    Emergency: 'text-red-600 decoration-red-600',
                                    High: 'text-orange-500 decoration-orange-500',
                                    Medium: 'text-yellow-500 decoration-yellow-500',
                                    Low: 'text-green-600 decoration-green-600',
                                }[urgency] ?? 'text-black';

                                return (
                                    <li
                                        key={req.id}
                                        className="flex gap-2 px-3 py-2 rounded cursor-pointer w-full items-center"
                                        onClick={() => {
                                            onClose();
                                            navigate('/services/servicerequests', { state: { requestId: req.id } });
                                        }}
                                    >
                                        {icon}
                                        <span
                                            className={`font-medium hover:underline hover:underline-offset-4 ${textColor}`}
                                        >
                                            {req.text.replace(/\s\((.*?)\)$/, '')}
                                        </span>
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}

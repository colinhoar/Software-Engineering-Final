import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';
import CloseIcon from '@mui/icons-material/Close';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';

interface Props {
    open: boolean;
    onClose: () => void;
}

export default function ChangePasswordModal({ open, onClose }: Props) {
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [hasPassword, setHasPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    // Add state for password visibility
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    useEffect(() => {
        if (open) {
            const fetchPasswordStatus = async () => {
                try {
                    const token = localStorage.getItem('accessToken');
                    const res = await axios.get('/api/auth/has-password', {
                        headers: { Authorization: `Bearer ${token}` },
                    });
                    setHasPassword(res.data.hasPassword);
                } catch (err) {
                    console.error('Error checking password status:', err);
                    setHasPassword(false);
                } finally {
                    setIsLoading(false);
                }
            };
            fetchPasswordStatus();
        } else {
            setIsLoading(true);
        }
    }, [open]);

    const handleSubmit = async () => {
        if (newPassword !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (newPassword.length < 6) {
            setError('Password must be at least 6 characters long');
            return;
        }

        if (hasPassword && currentPassword === newPassword) {
            setError('New password cannot be the same as the current password');
            return;
        }

        try {
            const token = localStorage.getItem('accessToken');
            const res = await axios.post(
                '/api/auth/password',
                {
                    ...(hasPassword && { currentPassword }),
                    newPassword,
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                }
            );

            if (res.status === 200) {
                setSuccess('Password updated successfully!');
                setError('');
                setCurrentPassword('');
                setNewPassword('');
                setConfirmPassword('');
                setTimeout(() => {
                    setSuccess('');
                    onClose();
                }, 1500);
            } else {
                setError(res.data?.error || 'Failed to update password');
            }
        } catch (err: unknown) {
            console.error('Password update error:', err);
            if (axios.isAxiosError(err) && err.response) {
                setError(err.response.data?.error || 'Failed to update password');
            } else {
                setError('Failed to update password');
            }
        }
    };

    if (typeof window === 'undefined') return null;

    return createPortal(
        <AnimatePresence>
            {open && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="fixed inset-0 z-40 backdrop-blur-sm bg-white/30"
                        onClick={onClose}
                    />

                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.3 }}
                        className="fixed z-50 top-1/2 left-1/2 w-[90vw] max-w-md -translate-x-1/2 -translate-y-1/2
                       rounded-lg bg-[#D9F0FF] border border-[#c8ddee] shadow-sm p-8"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-[#044CA4]">
                                {hasPassword ? 'Change Password' : 'Set Password'}
                            </h2>
                            <button onClick={onClose}>
                                <CloseIcon className="text-gray-500 hover:text-black" />
                            </button>
                        </div>

                        {isLoading ? (
                            <div className="text-center text-gray-500">
                                Checking password status...
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {success && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -5 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -5 }}
                                        transition={{ duration: 0.3 }}
                                        className="text-center text-sm text-green-700 bg-green-100 border border-green-300 rounded-md py-2 px-3"
                                    >
                                        {success}
                                    </motion.div>
                                )}

                                {hasPassword && (
                                    <div className="relative">
                                        <input
                                            type={showCurrentPassword ? 'text' : 'password'}
                                            placeholder="Current password"
                                            className="w-full p-2 border border-gray-300 rounded bg-white text-sm"
                                            value={currentPassword}
                                            onChange={(e) => setCurrentPassword(e.target.value)}
                                        />
                                        <span
                                            className="password-toggle-icon absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer"
                                            onClick={() =>
                                                setShowCurrentPassword(!showCurrentPassword)
                                            }
                                        >
                                            <FontAwesomeIcon
                                                icon={showCurrentPassword ? faEyeSlash : faEye}
                                                className="text-gray-500"
                                            />
                                        </span>
                                    </div>
                                )}
                                <div className="relative">
                                    <input
                                        type={showNewPassword ? 'text' : 'password'}
                                        placeholder="New password (min 6 characters)"
                                        className="w-full p-2 border border-gray-300 rounded bg-white text-sm"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                    />
                                    <span
                                        className="password-toggle-icon absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer"
                                        onClick={() => setShowNewPassword(!showNewPassword)}
                                    >
                                        <FontAwesomeIcon
                                            icon={showNewPassword ? faEyeSlash : faEye}
                                            className="text-gray-500"
                                        />
                                    </span>
                                </div>
                                <div className="relative">
                                    <input
                                        type={showConfirmPassword ? 'text' : 'password'}
                                        placeholder="Confirm new password"
                                        className="w-full p-2 border border-gray-300 rounded bg-white text-sm"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                    />
                                    <span
                                        className="password-toggle-icon absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    >
                                        <FontAwesomeIcon
                                            icon={showConfirmPassword ? faEyeSlash : faEye}
                                            className="text-gray-500"
                                        />
                                    </span>
                                </div>
                                {error && <div className="text-red-500 text-sm">{error}</div>}
                            </div>
                        )}

                        <div className="flex justify-end pt-6">
                            <button
                                onClick={handleSubmit}
                                disabled={isLoading}
                                className="buttonLook text-white px-5 py-2 rounded-md text-sm font-medium "
                            >
                                {hasPassword ? 'Update Password' : 'Set Password'}
                            </button>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>,
        document.body
    );
}

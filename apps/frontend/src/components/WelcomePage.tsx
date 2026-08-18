import '../styles.css';
import { Link, useLocation } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useState } from 'react';
import Disclaimer from '../components/Disclaimer';

interface WelcomePopupProps {
    //Determines whether modal is open or not
    open: boolean;
    //Function that closes the modal
    onClose: () => void;
}

const draw = {
    hidden: { pathLength: 0, opacity: 0 },
    visible: (i: number) => {
        const delay = 1 + i * 0.5;
        return {
            pathLength: 1,
            opacity: 1,
            transition: {
                pathLength: { delay, type: 'spring', duration: 1.5, bounce: 0 },
                opacity: { delay, duration: 0.01 },
            },
        };
    },
};

export default function WelcomePage(props: WelcomePopupProps) {
    const [moved, setMoved] = useState(false);

    const handleClick: React.MouseEventHandler<HTMLDivElement> = (e) => {
        props.onClose();
        setMoved(true);
    };

    const handleChildClick: React.MouseEventHandler<HTMLDivElement> = (e) => {
        e.stopPropagation();
        props.onClose();
    };

    const handleChildButton: React.MouseEventHandler<HTMLButtonElement> = (e) => {
        e.stopPropagation();
        props.onClose();
    };

    return (
        <div
            className={`${'modal'} ${props.open ? 'welcome-display-block' : 'welcome-display-none'}`}
        >
            <motion.div
                tabIndex={0}
                onClick={handleClick}
                animate={{ y: moved ? -2500 : 0 }}
                transition={{ duration: 1.25 }}
            >
                <div className="absolute min-h-screen bg-[url('/assets/brighamwomenshospitalpicture.webp')] bg-cover bg-center w-full z-16 h-dvh">
                    <div className="absolute inset-0 bg-[#265AAD] opacity-75 z-11"></div>

                    <div className="relative flex flex-col items-center h-screen justify-center -translate-y-20 text-center space-y-6 z-17">
                        <motion.div
                            initial={{ opacity: 0, scale: 0 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{
                                duration: 0.4,
                                scale: { type: 'spring', visualDuration: 0.4, bounce: 0.5 },
                                delay: 0.3,
                            }}
                        >
                            <h1 className="welcomeTitle text-5xl sm:text-6xl md:text-7xl lg:text-8xl">
                                Welcome
                            </h1>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, scale: 0 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{
                                duration: 0.4,
                                scale: { type: 'spring', visualDuration: 0.4, bounce: 0.5 },
                                delay: 0.4,
                            }}
                        >
                            <h1 className="welcomeSubtitle text-xl sm:text-2xl md:text-3xl lg:text-4xl text-nowrap">
                                {' '}
                                To Brigham and Women’s Hospital
                            </h1>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, scale: 0 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{
                                duration: 0.4,
                                scale: { type: 'spring', visualDuration: 0.4, bounce: 0.5 },
                                delay: 0.6,
                            }}
                        >
                            <Link to="/about">
                                <button
                                    type="button"
                                    onClick={handleChildButton}
                                    className="welcomeButton text-base sm:text-base md:text-lg lg:text-xl"
                                >
                                    About Us
                                </button>
                            </Link>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, scale: 0 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{
                                duration: 0.4,
                                scale: { type: 'spring', visualDuration: 0.4, bounce: 0.5 },
                                delay: 0.5,
                            }}
                        >
                            <h1 className="welcomeAnyKey text-base sm:text-lg md:text-xl lg:text-2xl text-nowrap">
                                {' '}
                                Click Anywhere to Enter
                            </h1>
                        </motion.div>
                    </div>

                    <div
                        onClick={handleChildClick}
                        className="absolute flex items-center justify-center z-12 right-16 bottom-12 transform z-20"
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{
                                duration: 0.4,
                                scale: { type: 'spring', visualDuration: 0.4, bounce: 0.5 },
                                delay: 0.7,
                            }}
                        >
                            <Link to="/login">
                                <img
                                    src="/assets/loginicon.png"
                                    alt="Login Icon Button"
                                    className="login-icon-button"
                                />
                            </Link>
                        </motion.div>
                    </div>

                    <div className="absolute flex items-center justify-center z-12 left-1/2 top-16/17 transform -translate-x-1/2 -translate-y-1/2 animate-bounce">
                        <img
                            src="/assets/uparrow.png"
                            alt="Welcome Up Arrow"
                            className="welcome-up-arrow"
                        />
                    </div>

                    <div>
                        <motion.svg
                            width="600"
                            height="600"
                            viewBox="0 0 600 600"
                            initial="hidden"
                            animate="visible"
                            className="absolute top-6 right-6 z-12 w-2/5 h-auto"
                        >
                            <motion.line
                                x1="600"
                                y1="0"
                                x2="100"
                                y2="0"
                                stroke="#ffffff"
                                variants={draw}
                                custom={0}
                                strokeWidth={10}
                            />
                            <motion.line
                                x1="600"
                                y1="0"
                                x2="600"
                                y2="325"
                                stroke="#ffffff"
                                variants={draw}
                                custom={0}
                                strokeWidth={10}
                            />
                        </motion.svg>
                        <motion.svg
                            width="600"
                            height="600"
                            viewBox="0 0 600 600"
                            initial="hidden"
                            animate="visible"
                            className="absolute bottom-6 left-6 z-12 w-2/5 h-auto"
                        >
                            <motion.line
                                x1="0"
                                y1="600"
                                x2="500"
                                y2="600"
                                stroke="#ffffff"
                                variants={draw}
                                custom={0}
                                strokeWidth={10}
                            />
                            <motion.line
                                x1="0"
                                y1="600"
                                x2="0"
                                y2="275"
                                stroke="#ffffff"
                                variants={draw}
                                custom={0}
                                strokeWidth={10}
                            />
                        </motion.svg>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}

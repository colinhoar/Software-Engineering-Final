import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';

// literally the same as login but its sign up

export function SignupForm() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [fullName, setFullName] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);
    const navigate = useNavigate();

    useEffect(() => {
        const handleResize = () => {
            setWindowWidth(window.innerWidth);
        };

        window.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Basic validation
        if (!email || !password) {
            setErrorMessage("Please fill in all fields");
            return;
        }

        if (password.length < 6) {
            setErrorMessage("Password must be at least 6 characters long");
            return;
        }

        try {
            const response = await fetch("/api/auth/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ email, password, fullName })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Registration failed");
            }
            // Redirect to login after successful signup
            if (data.success) {
                navigate("/login?newUser=true");
            } else {
                throw new Error("Registration failed: Invalid response format");
            }
        } catch (error: Error | unknown) {
            let errorMsg = "Something went wrong during registration";
            if (error instanceof Error) {
                errorMsg = error.message;
            }

            setErrorMessage(errorMsg);
        }
    };

    // Using a higher breakpoint that ensures buttons won't wrap
    // Based on testing, this should be around 900px to accommodate both buttons side by side
    const breakpoint = 900;
    const showImage = windowWidth >= breakpoint;

    return (
        <div className={`grid ${showImage ? 'grid-cols-2' : 'grid-cols-1'} w-full min-h-screen bg-gradient-to-b from-blue-100 to-white`}>
            <div className="flex h-full flex-col justify-center items-center z-10">
                <div className="absolute left bottom-1/8 w-20 h-30 bg-gradient-to-br from-blue-300 to-transparent rounded-full blur-3xl z-0"></div>
                <div className="absolute bottom-1/3 right-1/4 w-96 h-86 bg-gradient-to-tl from-blue-400 to-transparent rounded-full blur-3xl z-0"></div>
                <div className="absolute bottom-3/5 right-8/11 w-36 h-56 bg-gradient-to-tl from-blue-300 to-transparent rounded-full blur-3xl z-0"></div>

                <form onSubmit={handleSubmit} className="space-y-4 mx-auto w-100 z-10">
                    <div className="relative mx-auto">
                        <img
                            className="h-22 w-96 object-contain ..."
                            src="/assets/logo2.png"
                            alt="login logo"
                        />
                    </div>
                    <h2 className="relative font-bold titleFont text-2xl mt-4 mb-4 text-center">
                        Create an Account
                    </h2>

                    <div>
                        <label htmlFor="email" className="headerFont block font-bold">
                            Email
                        </label>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="textFont text-sm w-full p-2 border bg-white rounded"
                            placeholder="email"
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="password" className="headerFont block font-bold">
                            Password
                        </label>
                        <div className="relative">
                            <input
                                id="password"
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="textFont text-sm w-full p-2 border bg-white rounded"
                                required
                            />
                            <span
                                className="password-toggle-icon absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                <FontAwesomeIcon
                                    icon={showPassword ? faEyeSlash : faEye}
                                    className="text-gray-500"
                                />
                            </span>
                        </div>
                    </div>
                    <div>
                        <label htmlFor="fullName" className="headerFont relative block font-bold">
                            Full Name
                        </label>
                        <input
                            id="fullName"
                            type="text"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            className="textFont text-sm w-full p-2 border bg-white rounded"
                            placeholder="Full Name"
                            required
                        />
                    </div>

                    {errorMessage && <div className="text-red-500 text-sm">{errorMessage}</div>}
                    <div className="pb-1"></div>
                    <button
                        type="submit"
                        className="headerFont text-medium w-full p-2 border bg-buttonblue text-white rounded cursor-pointer hover:bg-sky-700 hover:transform-[scale(1.05)] drop-shadow-lg rounded-xl"
                    >
                        Sign Up
                    </button>
                </form>
                <div className="textFont mt-4 text-sm text-center w-full">
                    Already have an account?{' '}
                    <Link to="/login" className="text-blue-500 hover:underline">
                        Log in
                    </Link>
                </div>
            </div>

            {showImage && (
                <div className="relative flex h-full flex-col resize z-10">
                    <div className="ml-auto mr-auto relative w-full h-dvh">
                        <img
                            src="/assets/newLogo.jpg"
                            alt="Hospital building"
                            className="w-full h-full object-cover"
                        />

                        {/* Framer Motion Animated Text */}
                        <div className="absolute inset-0 bg-black/30"></div>
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 1 }}
                            className="absolute inset-0 flex flex-col items-center justify-center text-center text-white drop-shadow-lg"
                        >
                            <motion.h1
                                className="titleFont text-4xl font-bold"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2, duration: 0.8 }}
                            >
                                Welcome to Brigham & Women's
                            </motion.h1>

                            <motion.svg
                                width="200"
                                height="20"
                                viewBox="0 0 200 20"
                                className="mx-auto my-2"
                            >
                                <motion.line
                                    x1="100"
                                    y1="10"
                                    x2="0"
                                    y2="10"
                                    stroke="white"
                                    strokeWidth="2"
                                    initial={{ pathLength: 0 }}
                                    animate={{ pathLength: 1 }}
                                    transition={{ duration: 1, delay: 1 }}
                                />
                                <motion.line
                                    x1="100"
                                    y1="10"
                                    x2="200"
                                    y2="10"
                                    stroke="white"
                                    strokeWidth="2"
                                    initial={{ pathLength: 0 }}
                                    animate={{ pathLength: 1 }}
                                    transition={{ duration: 1, delay: 1 }}
                                />
                            </motion.svg>

                            <motion.p
                                className="text-xl mt-2 font-medium"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 1.5, duration: 0.8 }}
                            >
                                Find your way!
                            </motion.p>
                        </motion.div>
                    </div>
                </div>
            )}
        </div>
    );
}
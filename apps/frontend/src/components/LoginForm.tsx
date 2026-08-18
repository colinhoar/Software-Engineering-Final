import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from './auth_context.tsx';
import { motion } from 'framer-motion';
import google from './assets/google.png';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';

export default function LoginForm() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);
    const navigate = useNavigate();
    const { login } = useAuth();

    useEffect(() => {
        // Check for token in URL after Google OAuth callback
        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get('token');
        const email = urlParams.get('email');
        const name = urlParams.get('name');
        const isAdmin = urlParams.get('isAdmin') === 'true';

        if (token && email) {
            // Store the token and email in localStorage
            localStorage.setItem('accessToken', token);
            localStorage.setItem('email', email);
            localStorage.setItem('isLoggedIn', 'true');
            localStorage.setItem('isAdmin', isAdmin ? 'true' : 'false');
            if (name){
                localStorage.setItem('name', name);
            } else{
                localStorage.setItem('name', 'User');
            }

            // Update auth context and navigate
            login(token, email, isAdmin);
            navigate('/services');
        }
    }, [navigate, login]);

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

        try {
            // Make the actual login request
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Login failed');
            }

            const data = await response.json();

            // Store login info
            localStorage.setItem('accessToken', data.token);
            localStorage.setItem('email', data.email);
            localStorage.setItem('isLoggedIn', 'true');
            localStorage.setItem('isAdmin', data.isAdmin ? 'true' : 'false');
            if (data.name){
                localStorage.setItem('name', data.name);
            } else {
                localStorage.setItem('name', 'User');
            }

            // Update auth context
            login(data.token, data.email, data.isAdmin);
            navigate('/services');
        } catch (error) {
            setErrorMessage(error instanceof Error ? error.message : 'Login failed');
        }
    };

    {
        /*this can be changed later on this is just a way Im testing stuff this isnt going to be the actual login page this is just like a mockup before
    we make the figma where I will make the real login page for*/
    }

    // Using a higher breakpoint that ensures buttons won't wrap
    // Based on testing, this should be around 900px to accommodate both buttons side by side
    const breakpoint = 900;
    const showImage = windowWidth >= breakpoint;

    return (
        <div className={`grid ${showImage ? 'grid-cols-2' : 'grid-cols-1'} w-full min-h-screen bg-gradient-to-b from-blue-100 to-white`}>
            <div className="flex h-full flex-col justify-center items-center z-10 px-4 md:px-8 w-full max-w-full">
                <div className=" absolute left bottom-1/8 w-20 h-30 bg-gradient-to-br from-blue-300 to-transparent rounded-full blur-3xl z-0"></div>
                <div className="absolute bottom-1/3 right-1/4 w-96 h-86 bg-gradient-to-tl from-blue-400 to-transparent rounded-full blur-3xl z-0"></div>
                <div className="absolute bottom-3/5 right-8/11 w-36 h-56 bg-gradient-to-tl from-blue-300 to-transparent rounded-full blur-3xl z-0"></div>

                <form onSubmit={handleSubmit} className="space-y-4 mx-auto w-full max-w-md z-10 relative">
                    <div className="flex justify-center w-full">
                        <img
                            className="h-22 w-auto object-contain"
                            src="/assets/logo2.png"
                            alt="login logo"
                        />
                    </div>
                    <h2 className="titleFont relative font-bold text-2xl mt-4 mb-4 text-center">
                        Log in to Account
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
                            className="textFont text-sm w-full p-2 border bg-white rounded relative"
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
                                className="textFont text-sm w-full p-2 border bg-white rounded relative"
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

                    {errorMessage && <div className="text-red-500 text-sm">{errorMessage}</div>}
                    <div className="pb-1"></div>
                    <button
                        type="submit"
                        className=" buttonLook w-full p-2 border  text-white rounded cursor-pointer drop-shadow-lg rounded-xl"
                    >
                        Login
                    </button>
                    {/* Button for redirecting to sign up */}
                    <div className=" textFont mt-2 ml-25 text-sm ">
                        Don't have an account?{' '}
                        <Link to="/signup" className="textFont text-blue-500 hover:underline">
                            Sign up
                        </Link>
                    </div>
                </form>
                <div className="relative flex py-5 items-center max-w-md mx-auto w-full">
                    <div className="flex-grow border-t border-gray-400"></div>
                    <span className="textFont flex-shrink mx-4 text-black text-sm">
                        Or continue with
                    </span>
                    <div className="flex-grow border-t border-gray-400"></div>
                </div>
                <div className="flex flex-wrap text-sm font-medium mx-auto gap-x-3 gap-y-2 max-w-md w-full justify-center">
                    {/* Button for continue login with google */}
                    <button
                        type="button"
                        onClick={() => window.location.href = (window.location.toString().includes('localhost'))? 'http://localhost:3001/api/auth/google' : 'https://d3fzhzja0ah2rq.cloudfront.net/api/auth/google'}
                        className="flex-shrink-0 flex items-center justify-center cursor-pointer gap-x-2 px-2 py-2 border rounded-lg bg-white hover:bg-gray-50 duration-150 active:bg-gray-100"
                    >
                        <img src="/assets/google.png" alt="Google logo" className="w-7 h-7" />
                        <span className="textFont whitespace-nowrap">Continue with Google</span>
                    </button>
                    {/* Button for continue login with GitHub */}
                    {/* Because of this link this wont work on local host so dont worry about that rn if someone is checking back on this */}
                    <button
                        type="button"
                        onClick={() => window.location.href = (window.location.toString().includes('localhost'))? 'http://localhost:3001/api/auth/github' : 'https://d3fzhzja0ah2rq.cloudfront.net/api/auth/github'}
                        className="flex-shrink-0 flex items-center justify-center cursor-pointer gap-x-2 px-2 py-2 border rounded-lg bg-white hover:bg-gray-50 duration-150 active:bg-gray-100"
                    >
                        <svg className="w-7 h-7" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 .5C5.73.5.5 5.73.5 12c0 5.08 3.29 9.39 7.84 10.92.57.1.78-.25.78-.55 0-.27-.01-1.17-.02-2.12-3.19.69-3.87-1.54-3.87-1.54-.52-1.31-1.26-1.66-1.26-1.66-1.03-.7.08-.69.08-.69 1.14.08 1.74 1.17 1.74 1.17 1.01 1.73 2.65 1.23 3.3.94.1-.73.4-1.23.72-1.51-2.55-.29-5.23-1.28-5.23-5.72 0-1.26.45-2.29 1.17-3.1-.12-.29-.51-1.47.11-3.07 0 0 .96-.31 3.15 1.18a10.9 10.9 0 0 1 2.87-.39c.98 0 1.97.13 2.87.39 2.18-1.5 3.14-1.18 3.14-1.18.63 1.6.24 2.78.12 3.07.73.81 1.16 1.84 1.16 3.1 0 4.45-2.69 5.42-5.25 5.7.42.37.77 1.1.77 2.22 0 1.6-.01 2.89-.01 3.29 0 .31.21.66.79.55A10.5 10.5 0 0 0 23.5 12C23.5 5.73 18.27.5 12 .5z" />
                        </svg>
                        <span className="textFont whitespace-nowrap">Continue with GitHub</span>
                    </button>
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
import React from 'react';
import { motion } from 'framer-motion';

const technologies = {
    core: [
        {
            img: '/assets/library-icons/postgresql.png',
            role: 'PostgreSQL',
            url: 'https://www.postgresql.org/',
        },
        {
            img: '/assets/library-icons/express.png',
            role: 'Express.js',
            url: 'https://expressjs.com/',
        },
        { img: '/assets/library-icons/react.png', role: 'React', url: 'https://reactjs.org/' },
        { img: '/assets/library-icons/nodejs.png', role: 'Node.js', url: 'https://nodejs.org/' },
        {
            img: '/assets/library-icons/typescript.png',
            role: 'TypeScript',
            url: 'https://www.typescriptlang.org/',
        },
    ],
    frontend: [
        { img: '/assets/library-icons/react.png', role: 'React', url: 'https://reactjs.org/' },
        {
            img: '/assets/library-icons/tailwind.png',
            role: 'Tailwind CSS',
            url: 'https://tailwindcss.com/',
        },
        {
            img: '/assets/library-icons/shadcn.png',
            role: 'shadcn/ui',
            url: 'https://ui.shadcn.com/',
        },
        {
            img: '/assets/library-icons/radix.png',
            role: 'Radix UI',
            url: 'https://www.radix-ui.com/',
        },
        {
            img: '/assets/library-icons/framermotion.png',
            role: 'Framer Motion',
            url: 'https://www.framer.com/motion/',
        },
    ],
    backend: [
        {
            img: '/assets/library-icons/express.png',
            role: 'Express.js',
            url: 'https://expressjs.com/',
        },
        { img: '/assets/library-icons/prisma.png', role: 'Prisma', url: 'https://www.prisma.io/' },
        { img: '/assets/library-icons/jwt.png', role: 'JWT', url: 'https://jwt.io/' },
        { img: '/assets/library-icons/fusejs.png', role: 'Fuse.js', url: 'https://fusejs.io/' },
        {
            img: '/assets/library-icons/postgresql.png',
            role: 'PostgreSQL',
            url: 'https://www.postgresql.org/',
        },
    ],
    devTools: [
        { img: '/assets/library-icons/git.png', role: 'Git', url: 'https://git-scm.com/' },
        { img: '/assets/library-icons/github.png', role: 'GitHub', url: 'https://github.com/' },
        {
            img: '/assets/library-icons/webstorm.png',
            role: 'WebStorm',
            url: 'https://www.jetbrains.com/webstorm/',
        },
        {
            img: '/assets/library-icons/jira.png',
            role: 'Jira',
            url: 'https://www.atlassian.com/software/jira',
        },
        { img: '/assets/library-icons/discord.png', role: 'Discord', url: 'https://discord.com/' },
        { img: '/assets/library-icons/figma.png', role: 'Figma', url: 'https://www.figma.com/' },
    ],
};

const hoverVariants = {
    hover: {
        y: -10,
        rotate: 5,
        scale: 1.05,
        transition: {
            type: 'spring',
            stiffness: 400,
            damping: 10,
        },
    },
};

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.3,
            delayChildren: 0.2,
        },
    },
};

const titleVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.5,
            ease: 'easeOut',
        },
    },
};

const iconContainerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
            delayChildren: 0.2,
        },
    },
};

const iconVariants = {
    hidden: {
        opacity: 0,
        scale: 0.5,
        y: 20,
    },
    visible: {
        opacity: 1,
        scale: 1,
        y: 0,
        transition: {
            type: 'spring',
            stiffness: 200,
            damping: 15,
        },
    },
};

const Credits = () => {
    return (
        <div className="p-8 bg-[url('/Service_Icons/ServicesPageBackground.png')] bg-cover bg-center min-h-screen">
            <motion.div
                className="relative flex flex-col items-center justify-center min-h-screen"
                initial="hidden"
                animate="visible"
                variants={containerVariants}
            >
                <div className="w-full">
                    <motion.h1
                        className="titleFont text-5xl text-[#385DA6] font-extrabold mb-16 text-center"
                        variants={titleVariants}
                    >
                        Tools Used
                    </motion.h1>

                    <div className="max-w-7xl mx-auto px-8 space-y-16">
                        {/* Core Technologies Section */}
                        <motion.div
                            className="space-y-6"
                            initial="hidden"
                            animate="visible"
                            variants={containerVariants}
                        >
                            <motion.h2
                                className="titleFont text-3xl text-[#385DA6] text-center"
                                variants={titleVariants}
                            >
                                PERN Stack (Core Technologies)
                            </motion.h2>
                            <motion.div
                                className="flex flex-wrap justify-center items-center gap-12"
                                variants={iconContainerVariants}
                            >
                                {technologies.core.map((tech, index) => (
                                    <motion.a
                                        key={index}
                                        href={tech.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex flex-col items-center group"
                                        variants={iconVariants}
                                    >
                                        <motion.div
                                            className="relative w-28 h-28 flex items-center justify-center [filter:drop-shadow(0_10px_8px_rgb(0_0_0_/_0.25))]"
                                            variants={hoverVariants}
                                            whileHover="hover"
                                        >
                                            <img
                                                src={tech.img}
                                                alt={tech.role}
                                                className="object-contain w-24 h-24"
                                            />
                                        </motion.div>
                                        <span className="mt-3 text-center text-base text-gray-800 font-helvetica">
                                            {tech.role}
                                        </span>
                                    </motion.a>
                                ))}
                            </motion.div>
                        </motion.div>

                        {/* Frontend Section */}
                        <motion.div
                            className="space-y-6"
                            initial="hidden"
                            animate="visible"
                            variants={containerVariants}
                            transition={{ delay: 1.5 }}
                        >
                            <motion.h2
                                className="titleFont text-3xl text-[#385DA6] text-center"
                                variants={titleVariants}
                            >
                                Frontend Development
                            </motion.h2>
                            <motion.div
                                className="flex flex-wrap justify-center items-center gap-12"
                                variants={iconContainerVariants}
                            >
                                {technologies.frontend.map((tech, index) => (
                                    <motion.a
                                        key={index}
                                        href={tech.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex flex-col items-center group"
                                        variants={iconVariants}
                                    >
                                        <motion.div
                                            className={`relative w-28 h-28 flex items-center justify-center 
                                            ${tech.role === 'React' ? '[filter:drop-shadow(0_5px_4px_rgb(0_0_0_/_0.17))]' : '[filter:drop-shadow(0_10px_8px_rgb(0_0_0_/_0.25))]'}`}
                                            variants={hoverVariants}
                                            whileHover="hover"
                                        >
                                            <img
                                                src={tech.img}
                                                alt={tech.role}
                                                className="object-contain w-24 h-24"
                                            />
                                        </motion.div>
                                        <span className="mt-3 text-center text-base text-gray-800 font-helvetica">
                                            {tech.role}
                                        </span>
                                    </motion.a>
                                ))}
                            </motion.div>
                        </motion.div>

                        {/* Backend Section */}
                        <motion.div
                            className="space-y-6"
                            initial="hidden"
                            animate="visible"
                            variants={containerVariants}
                            transition={{ delay: 3.0 }}
                        >
                            <motion.h2
                                className="titleFont text-3xl text-[#385DA6] text-center"
                                variants={titleVariants}
                            >
                                Backend & API Services
                            </motion.h2>
                            <motion.div
                                className="flex flex-wrap justify-center items-center gap-12"
                                variants={iconContainerVariants}
                            >
                                {technologies.backend.map((tech, index) => (
                                    <motion.a
                                        key={index}
                                        href={tech.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex flex-col items-center group"
                                        variants={iconVariants}
                                    >
                                        <motion.div
                                            className="relative w-28 h-28 flex items-center justify-center [filter:drop-shadow(0_10px_8px_rgb(0_0_0_/_0.25))]"
                                            variants={hoverVariants}
                                            whileHover="hover"
                                        >
                                            <img
                                                src={tech.img}
                                                alt={tech.role}
                                                className="object-contain w-24 h-24"
                                            />
                                        </motion.div>
                                        <span className="mt-3 text-center text-base text-gray-800 font-helvetica">
                                            {tech.role}
                                        </span>
                                    </motion.a>
                                ))}
                            </motion.div>
                        </motion.div>

                        {/* Development Tools Section */}
                        <motion.div
                            className="space-y-6"
                            initial="hidden"
                            animate="visible"
                            variants={containerVariants}
                            transition={{ delay: 4.5 }}
                        >
                            <motion.h2
                                className="titleFont text-3xl text-[#385DA6] text-center"
                                variants={titleVariants}
                            >
                                Development & Collaboration Tools
                            </motion.h2>
                            <motion.div
                                className="flex flex-wrap justify-center items-center gap-12"
                                variants={iconContainerVariants}
                            >
                                {technologies.devTools.map((tech, index) => (
                                    <motion.a
                                        key={index}
                                        href={tech.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex flex-col items-center group"
                                        variants={iconVariants}
                                    >
                                        <motion.div
                                            className="relative w-28 h-28 flex items-center justify-center [filter:drop-shadow(0_10px_8px_rgb(0_0_0_/_0.25))]"
                                            variants={hoverVariants}
                                            whileHover="hover"
                                        >
                                            <img
                                                src={tech.img}
                                                alt={tech.role}
                                                className="object-contain w-24 h-24"
                                            />
                                        </motion.div>
                                        <span className="mt-3 text-center text-base text-gray-800 font-helvetica">
                                            {tech.role}
                                        </span>
                                    </motion.a>
                                ))}
                            </motion.div>
                        </motion.div>
                    </div>

                    <motion.p
                        className="text-base text-[#385DA6] textFont mt-20 mb-8 px-4 text-center"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1.5 }}
                    >
                        We would like to thank all the open-source communities and developers who
                        made this project possible
                    </motion.p>
                </div>
            </motion.div>
        </div>
    );
};

export default Credits;

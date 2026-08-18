import React from 'react';
import { motion } from 'framer-motion';
import Header from '../components/header.tsx';

import matthew from '/assets/teamphotos/matthew.jpg';
import aliza from '/assets/teamphotos/aliza.jpg';
import aditya from '/assets/teamphotos/aditya.jpg';
import colin from '/assets/teamphotos/colin.jpg';
import chris from '/assets/teamphotos/chris.jpg';
import ryan from '/assets/teamphotos/ryan.jpg';
import cole from '/assets/teamphotos/cole.jpg';
import jared from '/assets/teamphotos/jared.png';
import mohammed from '/assets/teamphotos/mohammed.jpg';
import catherine from '/assets/teamphotos/catherine.png';
import wilson from '/assets/teamphotos/wwong.jpg';
import phong from '/assets/teamphotos/phong.jpeg';

const team = [
    { img: aditya, name: 'Aditya Manoj Krishna', role: 'Lead Software Engineer', quote: "The audacity to take ID2050 and Soft Eng" },
    { img: cole, name: 'Cole Golding', role: 'Assistant Lead', quote: "In this house we Live Laugh Love" },
    { img: chris, name: 'Christopher Yon', role: 'Back End Lead', quote: "It was a real left-ball kind of a day" },
    { img: colin, name: 'Colin Hoar', role: 'Front End Lead', quote: "Good mornang" },
    { img: catherine, name: 'Catherine Foley', role: 'Product Owner', quote: "That’s so much money, that’s two gum balls right there" },
    { img: aliza, name: 'Aliza Khalil', role: 'Project Manager', quote: "What ethnicity is your rice cooker" },
    { img: jared, name: 'Jared LaPlante', role: 'Documentation Analyst', quote: "I love deadlines. I like the whooshing sound they make as they fly by. -Douglas Adams" },
    { img: mohammed, name: 'Mohammed Musawwir', role: 'Front End', quote: "Very happy!" },
    { img: matthew, name: 'Matthew Winchell', role: 'Scrum Master', quote: "What's your favorite structure?" },
    { img: ryan, name: 'Ryan Zhang', role: 'Front End', quote: "Go play pokemon" },
    { img: phong, name: 'Phong Cao', role: 'Team Coach', quote: "all you guys did really good job" },
    { img: wilson, name: 'Prof. Wong', role: 'Professor', quote: "A good teacher can teach students. A great teacher " +
            "teaches students how to learn." },
];

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

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            duration: 0.5,
        },
    },
};

const cardVariants = {
    hidden: {
        opacity: 0,
        scale: 0.8,
        x: -20,
    },
    visible: (index: number) => ({
        opacity: 1,
        scale: 1,
        x: 0,
        transition: {
            type: 'spring',
            stiffness: 200,
            damping: 15,
            delay: 0.5 + index * 0.1, // Start after header animation + staggered delay
        },
    }),
};

const hoverVariants = {
    hover: {
        y: -5,
        scale: 1.05,
        transition: {
            type: 'spring',
            stiffness: 400,
            damping: 10,
        },
    },
};

const About: React.FC = () => {
    return (
        <div className="p-8 bg-[url('/Service_Icons/ServicesPageBackground.png')] bg-cover bg-center min-h-screen">
            <motion.h1
                className="titleFont flex justify-center text-[#385DA6] text-4xl font-bold mt-6"
                initial="hidden"
                animate="visible"
                variants={titleVariants}
            >
                About Our Team
            </motion.h1>

            <motion.div
                className="headerFont flex justify-center items-start p-4 mt-4 mb-6"
                initial="hidden"
                animate="visible"
                variants={containerVariants}
            >
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-10">
                    {team.map((member, index) => (
                        <motion.div
                            key={index}
                            className="flex flex-col items-center"
                            custom={index}
                            initial="hidden"
                            animate="visible"
                            variants={cardVariants}
                            whileHover="hover"
                        >
                            <motion.div
                                className="relative group w-40 h-40 overflow-hidden rounded-md shadow-md"
                                variants={hoverVariants}
                            >
                                <img
                                    src={member.img}
                                    alt={member.name}
                                    className="object-cover w-full h-full"
                                />
                                <div className="absolute inset-0 bg-blue-400 bg-opacity-80 flex flex-col items-center justify-center opacity-0 group-hover:opacity-87 transition-opacity duration-300">
                                    <span className="text-white text-center text-base font-semibold px-2 opacity-100">
                                        {member.name}
                                    </span>
                                    {member.quote && (
                                        <>
                                            <svg className="w-8 h-8 my-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 310 310">
                                                <path d="M79 142.16c-6.02 0-11.42.28-16.25.81 7.1-29.03 22.95-44.36 45.88-56.04 5.33-2.71 7.63-9.1 5.23-14.57l-6.04-13.77c-2.59-5.91-9.62-8.44-15.38-5.53-22.1 11.11-37.39 23.92-48.76 40.63C28.42 116.11 21 145.6 21 183.83v16.52c0 31.95.11 57.81 58 57.81 58 0 58-25.97 58-58s.38-58-58-58zm152 0c-6.02 0-11.42.28-16.25.81 7.1-29.03 22.95-44.36 45.88-56.04 5.33-2.71 7.63-9.1 5.23-14.57l-6.04-13.77c-2.59-5.91-9.62-8.44-15.38-5.53-22.1 11.11-37.39 23.92-48.76 40.63C180.42 116.11 173 145.6 173 183.83v16.52c0 31.95.11 57.81 58 57.81 58 0 58-25.97 58-58s.38-58-58-58z" fill="#FFF"/>
                                            </svg>
                                            <span className={`text-white text-center ${member.name === 'Jared LaPlante' ? 'text-sm' : 'text-sm'} px-2 italic opacity-100`}>
                                                {member.quote}
                                            </span>
                                        </>
                                    )}
                                </div>
                            </motion.div>
                            <span className="mt-2 text-center text-sm text-[#020659]  headerFont ">
                                {member.role}
                            </span>
                        </motion.div>
                    ))}
                </div>
            </motion.div>

            <motion.div
                className="flex justify-center text-[#385DA6] textFont text-sm mb-8 px-4 text-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 2.5 }}
            >
                The Brigham & Women's Hospital maps and data used in this application are
                copyrighted and provided for the sole use of educational purposes. We would also like to thank Mass General Brigham Women's Hospital and their
                representative Andrew Shin.
            </motion.div>
        </div>
    );
};

export default About;

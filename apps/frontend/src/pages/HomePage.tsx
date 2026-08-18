import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import ServicesCard from '../components/ServicesCard.tsx';
import { useAuth } from '../components/auth_context.tsx';
import Popup from '../components/Popup.tsx';
import WelcomePage from '../components/WelcomePage';
import Disclaimer from '../components/Disclaimer';
import UnauthorizedAccess from "../components/UnauthorizedAccess.tsx";
import { useLocation } from 'react-router-dom';
interface LocationStateUnauthorized {
    unauthorized?: boolean;
}
import { motion } from "framer-motion";
import { AnimatePresence } from "framer-motion";
import HomePageSearch from "../components/HomePageSearch.tsx";


const zoomInImages = {
    hidden: {
        opacity: 0,
        scale: 0.5
    },
    visible: {
        opacity: 1,
        scale: 1,
        transition: {
            duration: 0.8,
            ease: "linear"
        }
    }
};

const fadeInFromLeft = {
    hidden: {
        opacity: 0,
        x: -50
    },
    visible: {
        opacity: 1,
        x: 0,
        transition: {
            duration: 0.8,
            ease: "easeOut"
        }
    }
};

const fadeInFromRight = {
    hidden: {
        opacity: 0,
        x: 50
    },
    visible: {
        opacity: 1,
        x: 0,
        transition: {
            duration: 0.8,
            ease: "easeOut"
        }
    }
};


const HomePage = () => {
    const { isAdmin } = useAuth();
    const location = useLocation();
    const { isLoggedIn } = useAuth();
    const navigate = useNavigate();

    const handleClick = () => {
        navigate('/navigation');
    };
    const [showProp, setShowProp] = useState<boolean>(false);
    const [showWelcomeProp, setShowWelcomeProp] = useState<boolean>(false);
    const [showUnauthorizedModal, setShowUnauthorizedModal] = useState<boolean>(false);
    useEffect(() => {
        const state = location.state as LocationStateUnauthorized | null;
        if (state && state.unauthorized) {
            setShowUnauthorizedModal(true);
            window.history.replaceState({}, document.title, window.location.pathname + window.location.search);
        }
    }, [location.state]);

    useEffect(() => {
        const hasSeenPopup = sessionStorage.getItem('hasSeenPopup');
        if (!hasSeenPopup) {
            setShowProp(true);
        }
    }, []);

    function toggleProp() {
        setShowProp(false);
        sessionStorage.setItem('hasSeenPopup', 'true');
    }
    useEffect(() => {
        const hasSeenWelcomePopup = sessionStorage.getItem('hasSeenWelcomePopup');
        if (!hasSeenWelcomePopup) {
            setShowWelcomeProp(true);
        }
    }, []);

    function toggleWelcomeProp() {
        setShowWelcomeProp(false);
        sessionStorage.setItem('hasSeenWelcomePopup', 'true');
    }

    const [showDisclaimerProp, setShowDisclaimerProp] = useState<boolean>(false);

    useEffect(() => {
        const hasSeenDisclaimerPopup = sessionStorage.getItem('hasSeenDisclaimerPopup');
        if (!hasSeenDisclaimerPopup) {
            const toRef = setTimeout(() => {
                setShowDisclaimerProp(true);
            }, 2700);

            return () => clearTimeout(toRef);
        }
    }, []);

    function toggleDisclaimerProp() {
        setShowDisclaimerProp(false);
        sessionStorage.setItem('hasSeenDisclaimerPopup', 'true');
    }

    //For the text cycle animation
    const strings = ['Find your way',
        'Request a service',
        'Make an appointment',
    ];
    const [index, setIndex] = useState(0);

    const total = strings.length;
    useEffect(() => {
        const interval = setInterval(() => {
            setIndex((current) => (current + 1) % total);
        }, 7000);
        return () => clearInterval(interval);
    }, [total]);

    return (
        <>
            <UnauthorizedAccess open={showUnauthorizedModal} onClose={() => setShowUnauthorizedModal(false)} />
            <div style={{ position: 'absolute', zIndex: 21 }}>
                <WelcomePage open={showWelcomeProp} onClose={toggleWelcomeProp}></WelcomePage>
            </div>
            <div style={{ position: 'absolute', zIndex: 40 }}>
                <Disclaimer
                    open={showDisclaimerProp}
                    onClose={toggleDisclaimerProp}
                    message={
                        'This website is a term project exercise for WPI CS 3733 Software Engineering (Prof. Wong) and is not to be confused with the actual Brigham & Women’s Hospital website.'
                    }
                ></Disclaimer>
            </div>
            <div style={{ position: 'absolute', zIndex: 20 }}>
                <Popup open={showProp} onClose={toggleProp}></Popup>
            </div>

            {/*Hero page*/}
            <div className="inset-0 overflow-x-hidden">
                <div className="relative w-full h-screen">
                    <div className="text-[#D9F0FF] font-bold">
                        <img
                            className="absolute brightness-70 w-full h-full object-cover"
                            src="/assets/homePageImage.png"
                            alt="home"
                        />
                        <div className="absolute -top-20 w-full h-full flex items-center justify-center z-10">
                            <div className="w-full max-w-screen-xl px-4 mx-auto text-center">
                                <p className="md:text-2xl sm:text-xl">Brigham and Women's Hospital</p>
                                {/*Animation for text cycle*/}

                                <AnimatePresence mode="wait">
                                    <motion.h1
                                        key={`words_${index}`}
                                        initial={{ opacity: 0, y: 30 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -30 }}
                                        transition={{ duration: 0.8 }}
                                        className="text-[#F2CD88] sm:text-4xl md:text-5xl titleFont font-bold py-5"
                                    >
                                        {strings[index]}
                                    </motion.h1>
                                </AnimatePresence>
                                <p className="md:text-2xl sm:text-xl">Dedicated to helping our patients and their families stay safe and healthy.</p>
                                <div className="w-full max-w-lg mx-auto mt-5">
                                        <HomePageSearch/>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
                <div className="bg-white">
                    {/*Statistics/achievements of the hospital*/}

                    <div className="grid grid-cols-3 py-[5%] bg-gradient-to-r from-[#D9F0FF] via-[#DFE9F2] to-[#D9F0FF]">
                        <motion.div
                            variants={zoomInImages}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true }}>
                            <div className="text-center md:text-4xl sm:text-2xl font-bold">#1
                            <div className="md:text-2xl sm:text-xl font-medium">ranked hospital in Massachusetts</div>
                        </div>
                        </motion.div>
                        <motion.div
                            variants={zoomInImages}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true }}>

                        <div className="text-center md:text-4xl sm:text-2xl font-bold">1,200+
                            <div className="md:text-2xl sm:text-xl font-medium">doctors throughout New England</div>
                        </div>
                        </motion.div>
                        <motion.div
                            variants={zoomInImages}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true }}>
                        <div className="text-center md:text-4xl sm:text-2xl font-bold">2.5M
                            <div className="md:text-2xl sm:text-xl font-medium">patients treated annually</div>
                        </div>
                        </motion.div>


                    </div>
                    <div className="w-full py-[3%] flex items-start justify-center">
                        <div className=" text-center grid md:grid-cols-2 items-start">
                            <div className="flex flex-col justify-center text-left ml-[5%] w-[80%] space-y-8">
                                <motion.div
                                    variants={fadeInFromLeft}
                                    initial="hidden"
                                    whileInView="visible"
                                    viewport={{ once: true, amount: 0.25}}>
                                    <div className="border border-[#B0C4DE] rounded-lg shadow-lg pt-2 px-6 pb-6">
                                        <div className="flex justify-between items-center space-x-4">
                                            <h1 className="md:text-4xl sm:text-2xl font-bold py-2 text-[#020659] whitespace-nowrap">
                                                Our Vision
                                            </h1>
                                            <img
                                                className="w-16 h-16 self-center"
                                                src="/assets/vision.png"
                                                alt="vision"
                                            />
                                        </div>
                                        <p className="text-[#385DA6]">
                                            Everything we do is for a healthier world. Our vision guides us to achieve what we strive to accomplish, and we are devoted to delivering the most advanced, expert care and researching and creating new innovations. Using cutting-edge technologies, our state-of-the-art facilities allow us to prioritize patient-centered care. We specialize in many different areas, including cardiology, neurology, oncology, and orthopedic surgery. We are also at the forefront in medical research, with contributions to numerous areas such as genomics, immunology, stem cell research, and regenerative medicine. Our discoveries and innovations help improve our understanding, prevention and treatment of diseases.
                                        </p>
                                    </div>

                                </motion.div>
                                <motion.div
                                    variants={fadeInFromLeft}
                                    initial="hidden"
                                    whileInView="visible"
                                    viewport={{ once: true, amount: 0.25}}>
                                    <div className="border border-[#B0C4DE] rounded-lg shadow-lg pt-2 px-6 pb-6 bg-[#DFE9F2]">
                                        <div className="flex justify-between items-center space-x-4">
                                            <h1 className="md:text-4xl sm:text-3xl font-bold py-2 text-[#020659] whitespace-nowrap">
                                                Our Mission
                                            </h1>
                                            <img
                                                className="w-15 self-center"
                                                src="/assets/mission2.png"
                                                alt="mission"
                                            />
                                        </div>
                                        <p className="text-[#385DA6]">
                                            At Brigham and Women's hospital, we are dedicated towards preserving and restoring health through expert care, innovative research, and education. To accomplish this mission, we focus on five key priorities for our patients and their families: enhancing health outcomes, ensuring timely access to care, delivering exceptional service experiences, maintaining the highest standards of quality and safety, and providing care at the lowest possible cost.
                                        </p>
                                    </div>

                                </motion.div>
                                <motion.div
                                    variants={fadeInFromLeft}
                                    initial="hidden"
                                    whileInView="visible"
                                    viewport={{ once: true, amount:0.25}}>
                                    <div className="border border-[#B0C4DE] rounded-lg shadow-lg pt-2 px-6 pb-6 bg-[#D9F0FF]">
                                        <div className="flex justify-between items-center space-x-4">
                                            <h1 className="md:text-4xl sm:text-2xl font-bold py-2 text-[#020659] whitespace-nowrap">
                                                Our Values
                                            </h1>
                                            <img
                                                className="w-15 h-15 self-center"
                                                src="/assets/ourvalues.png"
                                                alt="vision"
                                            />

                                        </div>
                                        <p className="text-[#385DA6] mr-5">
                                            We care.
                                            We're stronger together.
                                            We create breakthroughs.
                                            We pursue excellence.
                                            Our foundation relies on two pillars of success: an environment that attracts, supports and elevates the best staff; and financial strength.
                                        </p>
                                    </div>
                                </motion.div>
                            </div>
                            <motion.div
                                variants={fadeInFromRight}
                                initial="hidden"
                                whileInView="visible"
                                viewport={{ once: true, amount: 0.25 }}>
                                <div className="flex flex-col items-center">
                                    <img
                                        className="mx-auto rounded-4xl shadow-lg -ml-[3%]"
                                        src="/assets/doctor2.png"
                                        alt="doctor"
                                    />
                                </div>
                                <img
                                    className="mt-10 w-[90%]"
                                    src="/assets/values.png"
                                    alt="value"
                                />

                            </motion.div>
                        </div>
                    </div>
                <div className="pb-[5%] px-4">
                    <div
                        className=" items-center bg-[#D9F0FF] grid md:grid-cols-2 rounded-lg shadow-xl p-8">
                        <motion.div
                            variants={zoomInImages}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true, amount: 0.25 }}>
                            <img
                                className=" mx-auto rounded-xl shadow-lg"
                                src="/assets/navigation.png"
                                alt="navigation"
                            />
                        </motion.div>
                        <motion.div
                            variants={fadeInFromRight}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true }}>
                            <div className="flex flex-col justify-center text-center space-y-5">
                                <h1 className="md:text-4xl sm:text-2xl font-bold py-2 text-[#020659]">Navigate
                                    through the hospital</h1>
                                <button
                                    className="buttonLook mx-auto justify-center headerFont text-white font-lg py-2 px-8 rounded-lg transition-colors cursor-pointer"
                                    onClick={handleClick}
                                >
                                    Directions
                                </button>

                            </div>
                        </motion.div>
                    </div>
                </div>
                <div>
                    {isLoggedIn &&(
                    <h1 className="text-center md:text-4xl sm:text-2xl font-bold pb-3 text-[#020659]">Our Services</h1>
                    )}
                </div>
                    {isLoggedIn &&(
                        <div className="px-4 pb-[5%]">

                            <div
                            className="h-100 items-center bg-[#D9F0FF] grid rounded-lg shadow-xl overflow-hidden">
                            <div className="overflow-hidden w-full]">
                                <ul className="scroll flex w-max gap-[20px]">
                                    <li>
                                        <div className="LanguageButton">
                                            <Link to ="/services/languagerequest">
                                                <ServicesCard image={"/Service_Icons/language.png"} name={"Language Interpreter"} description={"Request a language interpreter to be sent to a particular location in the hospital (English, Spanish, etc.)"}></ServicesCard>
                                            </Link>
                                        </div>
                                    </li>
                                    <li>
                                        <div className="transportButton">
                                            <Link to ="/services/patienttransportationrequest">
                                                <ServicesCard image={"/Service_Icons/transport.png"} name={"External Patient Transportation"} description={"Request a patient to be transported between MGB locations (Ambulance, Helicopter, etc.)"}></ServicesCard>
                                            </Link>
                                        </div>
                                    </li>
                                    <li>
                                        <div className="MaintenanceButton">
                                            <Link to ="/services/facilitymaintenancerequest">
                                                <ServicesCard image={"/Service_Icons/Maintenance.png"} name={"Facility Maintenance"} description={"Request facility maintenance in a particular location in the hospital (Elevator, Plumbing Issues, etc.)"}></ServicesCard>
                                            </Link>
                                        </div>
                                    </li>
                                    <li>
                                        <div className="sanitationButton">
                                            <Link to ="/services/sanitationrequest">
                                                <ServicesCard image={"/Service_Icons/sanitation.png"} name={"Sanitation"} description={"Request sanitation for a particular location in the hospital (Waste Management, Cleaning, etc.)"}></ServicesCard>
                                            </Link>
                                        </div>
                                    </li>
                                    <li>
                                        <div className="SecurityButton">
                                            <Link to="/services/security-request">
                                                <ServicesCard image={"/Service_Icons/security.png"} name={"Security"} description={"Request security services for your location (Emergency response, Escort services, etc.)"}></ServicesCard>
                                            </Link>
                                        </div>
                                    </li>
                                    <li>
                                        <div className="serviceButton">
                                            <Link to ="/services/servicerequests">
                                                <ServicesCard image={"/Service_Icons/profile.png"} name={"List of Service Requests"} description={"View service requests made by all hospital employees, ability to filter, search, and edit service status"}></ServicesCard>
                                            </Link>
                                        </div>
                                    </li>
                                    {isAdmin && (
                                        <li>
                                            <div className="AccessibilityButton"> {/*temp fix */}
                                                <Link to ="/services/employee">
                                                    <ServicesCard image={"/Service_Icons/Accessibility.png"} name={"List of Employees"} description={"View and edit a list of all hospital employees (Change roles, Make admin etc.)"}></ServicesCard>
                                                </Link>
                                            </div>
                                        </li>
                                    )}
                                    {isAdmin && (
                                        <li>
                                            <div className="MedDelivButton">
                                                <Link to ="/services/summary">
                                                    <ServicesCard
                                                        image={"/Service_Icons/dashboard.png"} name={"Summary Page"} description={"View graphs, charts, and statistics regarding all submitted service requests (Pie chart, Bar graph, etc.)"}></ServicesCard>
                                                </Link>
                                            </div>
                                        </li>
                                    )}
                                    {isAdmin && (
                                        <div className="mapEditingButton">
                                            <Link to ="/services/mapediting">
                                                <ServicesCard image={"/Service_Icons/mapEditing.png"} name={"Map Editing"} description={"Add, remove, and edit nodes on the interior building and parking lot maps of the included MGB locations"}></ServicesCard>
                                            </Link>
                                        </div>
                                    )}
                                    {isAdmin && (
                                        <li>
                                            <div className="backupButton">
                                                <Link to ="/services/importexport">
                                                    <ServicesCard image={"/Service_Icons/Database.svg"} name={"Import/Export Data"} description={"Import and export department CSV files (Department ID, Name, Services, Floor, Location, Building, Telephone)"}></ServicesCard>
                                                </Link>
                                            </div>
                                        </li>
                                    )}
                                    <li>
                                        <div className="LanguageButton">
                                            <Link to ="/services/languagerequest">
                                                <ServicesCard image={"/Service_Icons/language.png"} name={"Language Interpreter"} description={"Request a language interpreter to be sent to a particular location in the hospital (English, Spanish, etc.)"}></ServicesCard>
                                            </Link>
                                        </div>
                                    </li>
                                    <li>
                                        <div className="transportButton">
                                            <Link to ="/services/patienttransportationrequest">
                                                <ServicesCard image={"/Service_Icons/transport.png"} name={"External Patient Transportation"} description={"Request a patient to be transported between MGB locations (Ambulance, Helicopter, etc.)"}></ServicesCard>
                                            </Link>
                                        </div>
                                    </li>
                                    <li>
                                        <div className="MaintenanceButton">
                                            <Link to ="/services/facilitymaintenancerequest">
                                                <ServicesCard image={"/Service_Icons/Maintenance.png"} name={"Facility Maintenance"} description={"Request facility maintenance in a particular location in the hospital (Elevator, Plumbing Issues, etc.)"}></ServicesCard>
                                            </Link>
                                        </div>
                                    </li>
                                    <li>
                                        <div className="sanitationButton">
                                            <Link to ="/services/sanitationrequest">
                                                <ServicesCard image={"/Service_Icons/sanitation.png"} name={"Sanitation"} description={"Request sanitation for a particular location in the hospital (Waste Management, Cleaning, etc.)"}></ServicesCard>
                                            </Link>
                                        </div>
                                    </li>
                                    <li>
                                        <div className="SecurityButton">
                                            <Link to="/services/security-request">
                                                <ServicesCard image={"/Service_Icons/security.png"} name={"Security"} description={"Request security services for your location (Emergency response, Escort services, etc.)"}></ServicesCard>
                                            </Link>
                                        </div>
                                    </li>
                                    <li>
                                        <div className="serviceButton">
                                            <Link to ="/services/servicerequests">
                                                <ServicesCard image={"/Service_Icons/profile.png"} name={"List of Service Requests"} description={"View service requests made by all hospital employees, ability to filter, search, and edit service status"}></ServicesCard>
                                            </Link>
                                        </div>
                                    </li>
                                    {isAdmin && (
                                        <li>
                                            <div className="AccessibilityButton"> {/*temp fix */}
                                                <Link to ="/services/employee">
                                                    <ServicesCard image={"/Service_Icons/Accessibility.png"} name={"List of Employees"} description={"View and edit a list of all hospital employees (Change roles, Make admin etc.)"}></ServicesCard>
                                                </Link>
                                            </div>
                                        </li>
                                    )}
                                    {isAdmin && (
                                        <li>
                                            <div className="MedDelivButton">
                                                <Link to ="/services/summary">
                                                    <ServicesCard
                                                        image={"/Service_Icons/dashboard.png"} name={"Summary Page"} description={"View graphs, charts, and statistics regarding all submitted service requests (Pie chart, Bar graph, etc.)"}></ServicesCard>
                                                </Link>
                                            </div>
                                        </li>
                                    )}
                                    {isAdmin && (
                                        <div className="mapEditingButton">
                                            <Link to ="/services/mapediting">
                                                <ServicesCard image={"/Service_Icons/mapEditing.png"} name={"Map Editing"} description={"Add, remove, and edit nodes on the interior building and parking lot maps of the included MGB locations"}></ServicesCard>
                                            </Link>
                                        </div>
                                    )}
                                    {isAdmin && (
                                        <li>
                                            <div className="backupButton">
                                                <Link to ="/services/importexport">
                                                    <ServicesCard image={"/Service_Icons/Database.svg"} name={"Import/Export Data"} description={"Import and export department CSV files (Department ID, Name, Services, Floor, Location, Building, Telephone)"}></ServicesCard>
                                                </Link>
                                            </div>
                                        </li>
                                    )}
                                </ul>

                            </div>
                            </div>
                        </div>

                    )}



            </div>
        </div>
        </>
    );
}


export default HomePage;

import { motion } from 'framer-motion';
import { useState } from 'react';

interface ServicesCardProps{
    // image that will be displayed on the card
    image: string;
    // name of the service
    name: string;
    // description
    description: string;
}

const WATER_COLOR: string = "#044ca4";

const box = {
    width: 300,
    height: 300,
    backgroundColor: WATER_COLOR,
}

export default function ServicesCard(props: ServicesCardProps){
    const [hovered, setHovered] = useState(false);

    const onHover = () => {
        setHovered(true);
    }

    const onUnhover = () => {
        setHovered(false);
    }
    const WATER_TRANSITION_SPEED = 0.2;
    return (
        <motion.div
            whileHover={{
                scale: 1.05,
                transition: { duration: 0.1 },
            }}
            whileTap={{ scale: 0.9 }}
            onHoverStart={onHover}
            onHoverEnd={onUnhover}
        >
            <div className="flex flex-col justify-center items-center max-w-sm rounded-[1rem] overflow-hidden bg-[#DFE9F2] shadow-lg w-3xs h-[20rem] m-4">
                <div className="relative w-full">
                    <div className="absolute flex flex-col items-center justify-center">
                        <motion.div
                            tabIndex={0}
                            animate={{ y: hovered ? -70 : 0 }}
                            transition={{ duration: WATER_TRANSITION_SPEED }}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" className="w-full translate-y-16">
                                <path fill={WATER_COLOR} fill-opacity="1" d="M0,224L48,218.7C96,213,192,203,288,186.7C384,171,480,149,576,170.7C672,192,768,256,864,240C960,224,1056,128,1152,122.7C1248,117,1344,203,1392,245.3L1440,288L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
                            </svg>
                        </motion.div>

                        <motion.div
                            tabIndex={0}
                            animate={{ y: hovered ? -70 : 0 }}
                            transition={{ duration: WATER_TRANSITION_SPEED }}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" className="w-full translate-y-1">
                                <path fill={WATER_COLOR} fill-opacity="0.5" d="M0,192L48,165.3C96,139,192,85,288,96C384,107,480,181,576,197.3C672,213,768,171,864,138.7C960,107,1056,85,1152,106.7C1248,128,1344,192,1392,224L1440,256L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
                            </svg>
                        </motion.div>

                        <motion.div
                            style={box}
                            tabIndex={0}
                            animate={{ y: hovered ? -70 : 0 }}
                            transition={{ duration: WATER_TRANSITION_SPEED }}
                            className="w-full"
                        />

                        <div className="-translate-y-50">
                            <motion.div
                                tabIndex={0}
                                style={{ transformOrigin: 'center' }}
                                initial={{opacity: 0}}
                                animate={{
                                    opacity: hovered ? 0.99999 : 0,
                                    rotateZ: hovered ? 0 : 90
                                }} // For some reason opacity 1 turns the text invisible, so I have to use a value very close to 1 instead
                                transition={{ duration: WATER_TRANSITION_SPEED }}
                            >
                                <img className="max-h-[30px]" src={"/Service_Icons/ServicesArrow.png"} alt="Service Arrow"/>
                            </motion.div>
                        </div>
                    </div>
                </div>

                <img className="max-h-[90px] -translate-y-14.5" src={props.image} alt="Service Image"/>

                <motion.div
                    tabIndex={0}
                    animate={{ color: hovered ? "#DFE9F2" : "#000000" }}
                    transition={{ duration: WATER_TRANSITION_SPEED }}
                >
                    <h1 className={`font-semibold text-center -translate-y-8 headerFont`}>{props.name}</h1>
                </motion.div>

                <motion.div
                    tabIndex={0}
                    initial={{opacity: 0}}
                    animate={{ opacity: hovered ? 0.99999 : 0 }} // For some reason opacity 1 turns the text invisible, so I have to use a value very close to 1 instead
                    transition={{ duration: WATER_TRANSITION_SPEED }}
                >
                    <h2 className="text-center text-[#DFE9F2] textFont text-sm">{props.description}</h2>
                </motion.div>
            </div>
        </motion.div>
    )
}
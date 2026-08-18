import React, { useEffect, useState } from 'react';

interface HelpPopupProps {
    open: boolean;
    onClose: () => void;
}

// Define a type for the content of each step
interface StepContent {
    stepInstructions: string[];
    stepImages: string[];
}

// Define a type for the tab content, which holds content for each tab
interface TabContent {
    [key: string]: StepContent;
}

export default function NodeEditingHelpPopup({ open, onClose }: HelpPopupProps) {
    const [activeTab, setActiveTab] = useState('Adding Nodes');
    const [switchImg, setSwitchImg] = useState(false);

    const handleMouseOver = () => {
        setSwitchImg(true);
    };

    const handleMouseLeave = () => {
        setSwitchImg(false);
    };

    // Step-specific instructions for each tab, typed properly
    const tabContent: TabContent = {
        'Adding Nodes': {
            stepInstructions: [
                "Step 1: Add new nodes by clicking the 'Add' button and selecting a new node location on the map.",
                "Step 2: Input a new node name, change node coordinates if necessary, and press the 'Confirm Add' button.",
                "Step 3: Click on other nodes on the map to create edges to connect to this node, and press the 'Confirm Edges' button.",
            ],
            stepImages: [
                "../assets/instructions/AddNodesOne.png",
                "../assets/instructions/AddNodesTwo.png",
                "../assets/instructions/AddNodesThree.png",
            ],
        },

        'Editing Nodes': {
            stepInstructions: [
                "Step 1: Edit nodes by clicking the 'Edit' button and selecting a node to change the name, location and/or edges of.",
                "Step 2: Enter a new name, and drag or type in new coordinates to change the location of the selected node. Click 'Confirm Edit' or 'Edit Edges' to continue.",
                "Step 3: To edit edges, click on other nodes on the map to create edges to connect to this node, and press the 'Confirm Edges' button.",
            ],
            stepImages: [
                "../assets/instructions/EditNodesOne.png",
                "../assets/instructions/EditNodesTwo.png",
                "../assets/instructions/EditNodesThree.png",
            ],
        },

        'Removing Nodes': {
            stepInstructions: [
                "Step 1: Remove existing nodes by clicking the 'Remove' button.",
                'Step 2: Select an existing node on the map to delete.',
                "Step 3: Confirm the node removal by pressing the 'Confirm Remove' button.",
            ],
            stepImages: [
                '/assets/instructions/RemoveNodesOne.png',
                '/assets/instructions/RemoveNodesTwo.png',
                '/assets/instructions/RemoveNodesThree.png',
            ],
        },

        'Zoom and Pan': {
            stepInstructions: [
                'Step 1: Press the +/- buttons on the side of the Map Editing card to zoom in and out.',
                'Step 2: Drag the map to pan to different positions (hover to preview).',
                "Step 3: Reset the zoom and pan by clicking the 'Reset Map' button.",
            ],
            stepImages: [
                '/assets/instructions/ZoomPanOne.png',
                '/assets/instructions/ZoomPanTwo.png',
                '/assets/instructions/ZoomPanThree.png',
            ],
        },
    };

    // Close popup when clicking outside
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            const popup = document.getElementById('node-editing-popup');
            if (popup && !popup.contains(e.target as Node)) {
                onClose();
            }
        };

        if (open) document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [open, onClose]);

    if (!open) return null;

    const { stepInstructions, stepImages } = tabContent[activeTab];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 backdrop-blur-sm">
            <div
                id="node-editing-popup"
                className="bg-white rounded-xl shadow-lg w-[80%] lg:w-[70%] max-w-4xl pointer-events-auto relative"
            >
                {/* Top blue bar */}
                <div className="bg-[#003A96] h-[60px] w-full rounded-t-xl flex justify-between items-center px-6">
                    <h2 className="text-white text-2xl font-bold text-center w-full titleFont">
                        Map Editing Instructions
                    </h2>
                    <button
                        onClick={onClose}
                        className="absolute text-white text-3xl font-bold leading-none focus:outline-none right-7 hover:cursor-pointer"
                        aria-label="Close"
                    >
                        &times;
                    </button>
                </div>

                {/* Main content */}
                <div className="px-8 py-6 text-center">
                    {' '}
                    {/* Centered Content */}
                    {/* Tabs */}
                    <div className="flex justify-center mt-4 mb-6">
                        {['Adding Nodes', 'Editing Nodes', 'Removing Nodes', 'Zoom and Pan'].map(
                            (tab) => (
                                <button
                                    key={tab}
                                    className={`px-6 py-3 text-lg font-semibold ${activeTab === tab ? 'bg-[#003A96] text-[#F2CD88]' : 'bg-[#003A96] text-white'} mx-2 buttonLook flex-1 text-center text-1xl shadow-md rounded-sm p-1 headerFont`}
                                    onClick={() => setActiveTab(tab)}
                                >
                                    {tab}
                                </button>
                            )
                        )}
                    </div>
                    <div className="headerFont text-2xl">
                        {activeTab === 'Adding Nodes'
                            ? 'Adding Nodes Instructions'
                            : activeTab === 'Editing Nodes'
                              ? 'Editing Nodes Instructions'
                              : activeTab === 'Removing Nodes'
                                ? 'Removing Nodes Instructions'
                                : activeTab === 'Zoom and Pan'
                                  ? 'Zoom and Pan Instructions'
                                  : null}
                    </div>
                    {/* Tab Content */}
                    <div className="tab-content mt-4 flex justify-center">
                        {/* Step content */}
                        <div className="grid grid-cols-3 gap-8">
                            {stepInstructions.map((instruction, index) => (
                                <div key={index} className="text-center">
                                    <div className="text-xl font-semibold mb-2 headerFont">
                                        Step #{index + 1}
                                    </div>
                                    {/* Step number */}
                                    <div className="bg-gray-300 w-full h-52 mx-auto mb-4">
                                        {index === 1 && activeTab === 'Zoom and Pan' ? (
                                            <div
                                                onMouseOver={handleMouseOver}
                                                onMouseLeave={handleMouseLeave}
                                            >
                                                {switchImg ? (
                                                    <video
                                                        autoPlay
                                                        loop
                                                        muted
                                                        playsInline
                                                        className={'w-full h-full object-cover'}
                                                    >
                                                        <source
                                                            src={
                                                                '/assets/instructions/ZoomPanTwo.mp4'
                                                            }
                                                            type={'video/mp4'}
                                                        />
                                                    </video>
                                                ) : (
                                                    <img
                                                        src={stepImages[index]}
                                                        alt={`Step ${index + 1}`}
                                                        className="w-full h-full object-cover"
                                                    />
                                                )}
                                            </div>
                                        ) : (
                                            // <img src={switchImg} alt={`Step ${index + 1}`}
                                            //      className="w-full h-full object-cover" onMouseOver={handleMouseOver}
                                            //      onMouseLeave={handleMouseLeave}/>
                                            <img
                                                src={stepImages[index]}
                                                alt={`Step ${index + 1}`}
                                                className="w-full h-full object-cover"
                                            />
                                        )}
                                        {/* image for the step */}
                                        {/*<img src={stepImages[index]} alt={`Step ${index + 1}`} className="w-full h-full object-cover" />*/}
                                    </div>
                                    <p className="text-sm text-gray-600 mb-4">
                                        {/*instructions for the step */}
                                        {instruction}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

import { useLocalStorage } from '@uidotdev/usehooks'

interface PopupProps {
    //Determines whether modal is open or not
    open: boolean;
    //Function that closes the modal
    onClose: () => void;
}
{

}

export default function Popup(props: PopupProps) {
    const [selectedLocation, setSelectedLocation] = useLocalStorage('selectedLocation', "chestnut_hill")
    const handleLocationSelect = (location: string) => {
        // Store the selected location in localStorage
        setSelectedLocation(location)
        // Close the modal
        props.onClose();
    };

    return (
        //Renders the modal and checks if it is open to display or not
        <div className={`${'modal'} ${props.open ? 'display-block' : 'display-none'}`}>
            <div className="modal-mainLocation">
                {/*blue bar*/}
                <div className="absolute w-full h-12 bg-[#044CA4] rounded-t-lg">
                    <h1 className="text-2xl titleFont text-white dark:text-white text-center m-2">
                        Choose your location
                    </h1>
                </div>

                <div className="modal-head h-10 mt-8" />
                <div className="modal-body">
                    {/* Buttons for choosing location*/}
                    <div className="flex flex-wrap justify-center gap-8">
                        <div className="flex flex-col items-center gap-2">
                            <button
                                type="button"
                                className="cursor-pointer"
                                onClick={() => handleLocationSelect('faulkner-belkin')}
                            >
                                {/* Makes it so image is rounded and has hover for user interaction*/}
                                <div className="relative max-w-xs overflow-hidden bg-cover bg-no-repeat">
                                    <img
                                        className="rounded-full w-50 h-50"
                                        src="/assets/faulkner.png"
                                        alt="faulkner-belkin"
                                    />
                                    <div className="absolute bottom-0 left-0 right-0 top-0 rounded-full overflow-hidden bg-blue-400 bg-fixed opacity-0 transition duration-300 ease-in-out hover:opacity-60"></div>
                                </div>
                            </button>
                            <button
                                type="button"
                                className="btn cursor-pointer relative text-[#044CA4] headerFont"
                                onClick={() => handleLocationSelect('faulkner-belkin')}
                            >
                                Faulkner/Belkin
                            </button>
                        </div>

                        <div className="flex flex-col items-center gap-2">
                            <button
                                type="button"
                                className="cursor-pointer"
                                onClick={() => handleLocationSelect('main_campus')}
                            >
                                {/* Makes it so image is rounded and has hover for user interaction*/}
                                <div className="relative max-w-xs overflow-hidden bg-cover bg-no-repeat">
                                    <img
                                        className="rounded-full w-50 h-50"
                                        src="/assets/main_campus.jpg"
                                        alt="main campus"
                                    />
                                    <div className="absolute bottom-0 left-0 right-0 top-0 rounded-full overflow-hidden bg-blue-400 bg-fixed opacity-0 transition duration-300 ease-in-out hover:opacity-60"></div>
                                </div>
                            </button>
                            <button
                                type="button"
                                className="btn cursor-pointer relative text-[#044CA4] headerFont"
                                onClick={() => handleLocationSelect('main_campus')}
                            >
                                Main Campus
                            </button>
                        </div>

                        <div className="flex flex-col items-center gap-2">
                            <button
                                type="button"
                                className="cursor-pointer relative"
                                onClick={() => handleLocationSelect('patriot_place')}
                            >
                                {/* Makes it so image is rounded and has hover for user interaction*/}
                                <div className="relative max-w-xs overflow-hidden bg-cover bg-no-repeat">
                                    <img
                                        className="rounded-full w-50 h-50"
                                        src="/assets/patriot_place.jpg"
                                        alt="patriot place"
                                    />
                                    <div className="absolute bottom-0 left-0 right-0 top-0 rounded-full overflow-hidden bg-blue-400 bg-fixed opacity-0 transition duration-300 ease-in-out hover:opacity-60"></div>
                                </div>
                            </button>
                            <button
                                type="button"
                                className="btn cursor-pointer relative text-[#044CA4] headerFont"
                                onClick={() => handleLocationSelect('patriot_place')}
                            >
                                Patriot Place
                            </button>
                        </div>

                        {/* This image is rounded and has hover for user interaction, but can also close since it's Chestnut Hill*/}
                        <div className="flex flex-col items-center gap-2">
                            <button
                                type="button"
                                className="cursor-pointer"
                                onClick={() => handleLocationSelect('chestnut_hill')}
                            >
                                <div className="relative max-w-xs overflow-hidden bg-cover bg-no-repeat">
                                    <img
                                        className="rounded-full w-50 h-50"
                                        src="/assets/chestnut-hill.jpg"
                                        alt="chestnut hill"
                                    />
                                    <div className="absolute bottom-0 left-0 right-0 top-0 rounded-full overflow-hidden bg-blue-400 bg-fixed opacity-0 transition duration-300 ease-in-out hover:opacity-60"></div>
                                </div>
                            </button>
                            <button
                                type="button"
                                className="btn cursor-pointer relative text-[#044CA4] headerFont"
                                onClick={() => handleLocationSelect('chestnut_hill')}
                            >
                                Chestnut Hill
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

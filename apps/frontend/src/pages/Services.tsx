import { Link } from 'react-router-dom';
import ServicesCard from '../components/ServicesCard.tsx';
import {useAuth} from "../components/auth_context.tsx";


const Services = () => {
    const { isAdmin } = useAuth();
    let greeting = '';
    const today = new Date()
    const curHr = today.getHours()
    if (curHr < 12) {
        greeting = "Good Morning "
    } else if (curHr < 17) {
        greeting = "Good Afternoon "
    } else {
        greeting = "Good Evening "
    }
    return (
        <div className= "flex flex-row justify-between">
            <div className = "p-2 bg-[url('/Service_Icons/ServicesPageBackground.png')] bg-cover bg-center">
                <div className="relative flex flex-col items-center">
                    <h1 className=" text-left text-[#385DA6] text-4xl font-bold titleFont ml-5 mt-4">
                        {greeting + localStorage.getItem('name')}!
                    </h1>
                    <div className="flex justify-center items-center mt-6 ">
                        <div className="bg-[#DFE9F2]/80 rounded-[2rem] gap-10 flex flex-wrap flex-row basis-9/10 justify-center items-center min-w-[400px] shadow-2xl">
                            <div className="LanguageButton">
                                <Link to ="/services/languagerequest">
                                    <ServicesCard image={"/Service_Icons/language.png"} name={"Language Interpreter"} description={"Request a language interpreter to be sent to a particular location in the hospital (English, Spanish, etc.)"}></ServicesCard>
                                </Link>
                            </div>

                            <div className="transportButton">
                                <Link to ="/services/patienttransportationrequest">
                                    <ServicesCard image={"/Service_Icons/transport.png"} name={"External Patient Transportation"} description={"Request a patient to be transported between MGB locations (Ambulance, Helicopter, etc.)"}></ServicesCard>
                                </Link>
                            </div>

                            <div className="MaintenanceButton">
                                <Link to ="/services/facilitymaintenancerequest">
                                    <ServicesCard image={"/Service_Icons/Maintenance.png"} name={"Facility Maintenance"} description={"Request facility maintenance in a particular location in the hospital (Elevator, Plumbing Issues, etc.)"}></ServicesCard>
                                </Link>
                            </div>

                            <div className="sanitationButton">
                                <Link to ="/services/sanitationrequest">
                                    <ServicesCard image={"/Service_Icons/sanitation.png"} name={"Sanitation"} description={"Request sanitation for a particular location in the hospital (Waste Management, Cleaning, etc.)"}></ServicesCard>
                                </Link>
                            </div>

                            <div className="SecurityButton">
                                <Link to="/services/security-request">
                                    <ServicesCard image={"/Service_Icons/security.png"} name={"Security"} description={"Request security services for your location (Emergency response, Escort services, etc.)"}></ServicesCard>
                                </Link>
                            </div>

                            <div className="serviceButton">
                                <Link to ="/services/servicerequests">
                                    <ServicesCard image={"/Service_Icons/profile.png"} name={"List of Service Requests"} description={"View service requests made by all hospital employees, ability to filter, search, and edit service status"}></ServicesCard>
                                </Link>
                            </div>

                            {isAdmin && (
                                <div className="AccessibilityButton"> {/*temp fix */}
                                    <Link to ="/services/employee">
                                        <ServicesCard image={"/Service_Icons/Accessibility.png"} name={"List of Employees"} description={"View and edit a list of all hospital employees (Change roles, Make admin etc.)"}></ServicesCard>
                                    </Link>
                                </div>
                            )}

                            {isAdmin && (
                                <div className="MedDelivButton">
                                    <Link to ="/services/summary">
                                        <ServicesCard
                                            image={"/Service_Icons/dashboard.png"} name={"Summary Page"} description={"View graphs, charts, and statistics regarding all submitted service requests (Pie chart, Bar graph, etc.)"}></ServicesCard>
                                    </Link>
                                </div>
                            )}

                            {isAdmin && (
                                <div className="mapEditingButton">
                                    <Link to ="/services/mapediting">
                                        <ServicesCard image={"/Service_Icons/mapEditing.png"} name={"Map Editing"} description={"Add, remove, and edit nodes on the interior building and parking lot maps of the included MGB locations"}></ServicesCard>
                                    </Link>
                                </div>
                            )}

                            {isAdmin && (
                                <div className="backupButton">
                                    <Link to ="/services/importexport">
                                        <ServicesCard image={"/Service_Icons/Database.svg"} name={"Import/Export Data"} description={"Import and export department CSV files (Department ID, Name, Services, Floor, Location, Building, Telephone)"}></ServicesCard>
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>

    );

};

export default Services;
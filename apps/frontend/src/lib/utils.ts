import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { Prisma } from "../../../../packages/database/.prisma/client"
import { API_ROUTES } from 'common/src/constants.ts';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}
export const playTTS = async (text: string, audioRef: React.RefObject<HTMLAudioElement | null>, callback?: () => void) => {
    if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
    }
    try {
        const response = await fetch('/api/tts',{method: "POST", headers: {"Content-Type":"application/json"}, body: JSON.stringify({text: text})})
        const myBlob = await response.blob();
        const mp3 = new Blob([myBlob], {type: 'audio/mpeg'})
        const url = window.URL.createObjectURL(mp3)
        const audio = new Audio()
        audio.src = url;
        audioRef.current = audio;
        audio.load()
        audio.playbackRate = 1.2
        await audio.play()
        if (callback){
            audio.addEventListener('ended', callback)
        }

    } catch (e) {
        console.log('Error playing TTS: ', e)
    }
}
export const fetchDepartments = async (retries: number, delay: number, filterByLocalStorage: boolean, setDepartments: (depts: Prisma.DepartmentGetPayload<{ include: { building: true } }>[]) => void) => {
    let location = '';
    // adds location from localstorage to query if present so departments can be filtered by location
    const currLocationJSON = localStorage.getItem('selectedLocation')
    if (currLocationJSON && filterByLocalStorage) {
        location = '?location=' + JSON.parse(currLocationJSON);
    }
    // construct url. adds filter unless filter is blank
    const url = '/api/directory' + location;
    try {
        const response = await fetch(url);
        const departments = await response.json();
        // check for no departments in database
        if (JSON.stringify(departments) === '[]') {
            setDepartments([
                {
                    departmentID: -1,
                    name: 'None found',
                    services: 'None found',
                    location: 'None found',
                    buildingID: -1,
                    floor: "-1",
                    building: {
                        name: 'None found',
                        id: 0,
                    },
                    phone: 'None found',
                },
            ]);
        } else {
            setDepartments(departments);
        }
    } catch (error) {
        if (retries > 0) {
            console.warn(`Request failed. Retrying in ${delay}ms... (${retries} retries left)`);
            await new Promise((res) => setTimeout(res, delay));
            await fetchDepartments(retries - 1, delay, filterByLocalStorage, setDepartments);
        } else {
            console.error('Max retries reached.');
            console.error('Error fetching data:', error);
            // make it obvious that there was a problem getting departments on frontend
            setDepartments([
                {
                    departmentID: -1,
                    name: 'Error fetching',
                    services: 'Error fetching',
                    location: 'Error fetching',
                    buildingID: -1,
                    floor: "-1",
                    building: {
                        name: 'Error fetching',
                        id: 0,
                    },
                    phone: 'Error fetching',
                },
            ]);
        }
    }
};


export const fetchEmployees = async (retries: number, delay: number, setEmployee: (emp: Prisma.EmployeeGetPayload<{ include: {connectedUser: false} }>[]) => void) => {
    try {
        const response = await fetch(API_ROUTES.EMPLOYEE);
        const employee = await response.json();
        console.log("This is the employee data " + employee)
        // check for no departments in database
        if (JSON.stringify(employee) === '[]') {
            setEmployee([
                {
                    id: -1,
                    name: 'None found',
                    role: 'None found',
                    birthday: 'None found',
                    pronouns: 'None found',
                    profileColor: 'None found'
                }
            ]);
        } else {
            setEmployee(employee);
        }
    } catch (error) {
        if (retries > 0) {
            console.warn(`Request failed. Retrying in ${delay}ms... (${retries} retries left)`);
            await new Promise((res) => setTimeout(res, delay));
            await fetchEmployees(retries - 1, delay, setEmployee);
        } else {
            console.error('Max retries reached.');
            console.error('Error fetching data:', error);
            // make it obvious that there was a problem getting departments on frontend
            setEmployee([
                {
                    id: -1,
                    name: 'Error fetching',
                    role: "Error fetching",
                    birthday: 'Error fetching',
                    pronouns: 'Error fetching',
                },
            ]);
        }
    }
};
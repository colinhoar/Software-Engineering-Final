import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import { Mic } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { fetchDepartments, fetchEmployees, playTTS } from '../lib/utils.ts';
import { useNavigate } from 'react-router-dom';
import { Prisma } from '../../../../packages/database';
import Fuse from 'fuse.js';
import { useSessionStorage } from '@uidotdev/usehooks';
import * as chrono from 'chrono-node';

interface SpeechRecognitionWidgetProps {
    showFull: boolean;
}

interface BasicFormValues {
    requesterName: string;
    assignedEmployeeID: number | null;
    requestedService: string;
    locationRequiringService: string;
    urgencyLevel: string;
    status: string;
    description: string;
}

interface FacilityFormValues {
    date: string;
}

interface TransportationFormValues {
    date: string;
    destination: string;
    mobilitylevel: string;
}

const SpeechRecognitionWidget = (props: SpeechRecognitionWidgetProps) => {
    const navigate = useNavigate();
    const [prompt, setPrompt] = useState('');
    const [fillStep, setFillStep] = useState('getAssignedEmployee');
    const [response, setResponse] = useState({ text: '', shouldStartListening: false });
    const [enableMic, setEnableMic] = useSessionStorage('handMic', false)
    useEffect(() => {
        if (enableMic){
            setResponse({ text: 'How can I help?', shouldStartListening: true });
            setTimeout(() => setEnableMic(false), 3000);
        }
    }, [enableMic]);
    const { transcript, listening, resetTranscript, browserSupportsSpeechRecognition } =
        useSpeechRecognition();
    const facilityWords =
        /\b(facility|broke|maintenance|doesn't work|isn't working|does not work|fix|fixing|broken)\b/i;
    const sanitationWords = /\b(clean|mess|spill|dirty|sanitation|janitor|sanitize)\b/i;
    const transportationWords = /\b(transportation|transport|ambulance|helicopter)\b/i;
    const languageWords =
        /\b(spanish|french|language|translator|understand|interpret|interpreter)\b/i;
    const serviceListWords = /\b(list|service requests|tasks|assign|assigned|requests)\b/i;
    const securityWords = /\b(security|police|danger|safe)\b/i;
    const greetingWords = /\b(hi|hello|what's up|hey)\b/i;
    const goodbyeWords = /\b(bye|goodbye|stop|cancel|go away)\b/i;
    const importExportWords = /\b(back up|back it up|backup|export|import)\b/i;
    const nodeEditWords =
        /\b(edit the map|change the map|edit nodes|map editing|edit the pathfinding)\b/i;
    const pathfindingWords = /\b(map|lost|find|where|locate|guide|pathfinding|path finding)\b/i;
    const cancelWords = /\b(cancel|stop|quit)\b/i
    const voiceNavWords = /\b(?:take me to|navigate me to|help me find|lead me to)\b\s*(\S.*)?/i;
    const affirmative = /\b(yes|yeah|yup)\b/i;
    const negative = /\b(no|nope|nah)\b/i;
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const [departments, setDepartments] = useState<
        Prisma.DepartmentGetPayload<{ include: { building: true } }>[]
    >([
        {
            departmentID: -1,
            name: 'No departments',
            services: 'Nothing selected',
            location: 'Nothing selected',
            buildingID: -1,
            building: {
                name: '',
                id: 0,
            },
            floor: '-1',
            phone: 'Nothing selected',
        },
    ]);
    const [voiceDepartment, setVoiceDepartment] = useState<
        Prisma.DepartmentGetPayload<{
            include: { building: true };
        }>
    >();
    const [voiceSession, setVoiceSession] = useSessionStorage<
        Prisma.DepartmentGetPayload<{ include: { building: true } }>
    >('voiceDepartment', {
        name: '',
        floor: '0',
        departmentID: -1,
        buildingID: 0,
        location: '',
        phone: '',
        services: '',
        building: {
            name: '',
            id: 0,
        },
    });
    const [formValues, setFormValues] = useState<BasicFormValues>({
        requesterName: window.localStorage.getItem('name')!,
        assignedEmployeeID: null,
        requestedService: '',
        locationRequiringService: '',
        urgencyLevel: '',
        status: '',
        description: '',
    });

    const [formValuesSession, setFormValuesSession] = useSessionStorage<BasicFormValues>(
        'voiceFormValues',
        {
            requesterName: window.localStorage.getItem('name')!,
            assignedEmployeeID: null,
            requestedService: '',
            locationRequiringService: '',
            urgencyLevel: '',
            status: '',
            description: '',
        }
    );

    const [facilityValues, setFacilityValues] = useState<FacilityFormValues>({
        date:''
    });

    const [transportationValues, setTransportationValues] = useState<TransportationFormValues>({
        destination: '',
        mobilitylevel: '',
        date:''
    });

    const [transportationValuesSession, setTransportationValuesSession] = useSessionStorage<TransportationFormValues>(
        'transportationFormValues',
        {
        destination: '',
        mobilitylevel: '',
        date:'invalid'
    });

    const [facilityValuesSession, setFacilityValuesSession] = useSessionStorage<FacilityFormValues>(
        'facilityFormValues',
        {
            date: 'invalid'
        }
    );

    const [voiceServiceConfirmation, setVoiceServiceConfirmation] = useSessionStorage(
        'voiceServiceConfirmation',
        false
    );
    const [voiceServiceSubmit, setVoiceServiceSubmit] = useSessionStorage(
        'voiceServiceSubmit',
        false
    );

    useEffect(() => {
        fetchDepartments(10, 1000, true, setDepartments);
    }, []);
    useEffect(() => {
        fetchEmployees(10, 1000, setEmployee);
    }, []);

    const [employee, setEmployee] = useState<
        Prisma.EmployeeGetPayload<{ include: { connectedUser: false } }>[]
    >([
        {
            id: -1,
            name: 'Loading...',
            role: 'Loading...',
            birthday: 'Loading...',
            pronouns: 'Loading...',
            profileColor: 'Loading...'
        },
    ]);

    const employeeSearch = new Fuse(employee, {
        keys: ['name'],
        threshold: 0.4,
        includeMatches: true,
    });

    const departmentSearch = new Fuse(departments, {
        keys: ['name', 'services', 'location'],
        threshold: 0.4,
        includeMatches: true,
    });

    const urgencySearch = new Fuse(
        [
            { name: 'High/Urgent', displayName: 'High' },
            { name: 'Emergency', displayName: 'Emergency' },
            { name: 'Medium', displayName: 'Medium' },
            { name: 'Low', displayName: 'Low' },
        ],
        {
            keys: ['name', 'displayName'],
            threshold: 0.4,
            includeMatches: true,
        }
    );

    const statusSearch = new Fuse(
        [{ name: 'Unassigned' }, { name: 'Assigned' }, { name: 'Working' }, { name: 'Done' }],
        {
            keys: ['name'],
            threshold: 0.4,
            includeMatches: true,
        }
    );

    const sanitationSearch = new Fuse(
        [
            { name: 'Waste Management' },
            { name: 'Room Cleaning' },
            { name: 'OR Cleaning' },
            { name: 'Waiting Area Cleaning' },
            { name: 'Hallway Cleaning' },
            { name: 'Disposal' },
            { name: 'Disinfection' },
            { name: 'Laundry and Lining' },
        ],
        {
            keys: ['name'],
            threshold: 0.4,
            includeMatches: true,
        }
    );

    const languageSearch = new Fuse(
        [
            { name: 'English' },
            { name: 'Spanish' },
            { name: 'Hindi' },
            { name: 'Persian/Farsi' },
            { name: 'Chinese' },
            { name: 'Arabic' },
            { name: 'German' },
            { name: 'Russian' },
            { name: 'Italian' },
            { name: 'Hebrew' },
            { name: 'Portuguese' },
            { name: 'Filipino' },
            { name: 'Korean' },
            { name: 'Vietnamese' },
            { name: 'Slavic, Non-Polish' },
            { name: 'Greek' },
            { name: 'Polish' },
            { name: 'Japanese' },
            { name: 'Romanian' },
            { name: 'Turkish' },
            { name: 'Armenian' },
            { name: 'Ukranian' },
            { name: 'Dutch' },
            { name: 'Thai' },
            { name: 'Scandinavian' },
            { name: 'Burmese and Southeast Asian' },
            { name: 'Swahili and Sub-Saharan African' },
            { name: 'Indonesian' },
            { name: 'Danish' },
            { name: 'Himalayan' },
            { name: 'Lithuanian' },
            { name: 'Navajo' },
            { name: 'Native American' },
            { name: 'Hamitic and Near East Arabic' },
            { name: 'Polynesian' },
            { name: 'Other' },
        ],
        {
            keys: ['name'],
            threshold: 0.4,
            includeMatches: true,
        }
    );

    const securitySearch = new Fuse(
        [
            { name: 'Physical Security' },
            { name: 'Access Control' },
            { name: 'Surveillance' },
            { name: 'Emergency Response' },
            { name: 'Security Escort' },
        ],
        {
            keys: ['name'],
            threshold: 0.4,
            includeMatches: true,
        }
    );

    const transportationModeSearch = new Fuse([{ name: 'Helicopter' }, { name: 'Ambulance' }], {
        keys: ['name'],
        threshold: 0.4,
        includeMatches: true,
    });

    const transportationMobilitySearch = new Fuse(
        [
            { name: 'Ambulatory' },
            { name: 'Wheelchair' },
            { name: 'Stretcher' },
            { name: 'Requires Life Support' },
        ],
        {
            keys: ['name'],
            threshold: 0.4,
            includeMatches: true,
        }
    );

    const transportationDestinationSearch = new Fuse(
        [
            { name: 'Chestnut Hill' },
            { name: '20 Patriot Place' },
            { name: '22 Patriot Place' },
            { name: 'Faulkner Hospital' },
            { name: 'Belkin House' },
            { name: 'Main Campus' },
        ],
        {
            keys: ['name'],
            threshold: 0.4,
            includeMatches: true,
        }
    );

    const facilitySearch = new Fuse(
        [
            { name: 'Electrical' },
            { name: 'Plumbing' },
            { name: 'Equipment' },
            { name: 'HVAC' },
            { name: 'IT' },
            { name: 'Safety' },
            { name: 'Construction' },
        ],
        {
            keys: ['name'],
            threshold: 0.4,
            includeMatches: true,
        }
    );

    useEffect(() => {
        // read out the response each time it's set
        if (response.shouldStartListening) {
            playTTS(response.text, audioRef, SpeechRecognition.startListening);
        } else {
            playTTS(response.text, audioRef);
        }
    }, [response]);
    useEffect(() => {
        if (!listening && transcript !== '') {
         if (cancelWords.test(transcript)){
                setResponse({
                    text: `Ok, cancelled.`,
                    shouldStartListening: false,
                });
                setPrompt('')
                setFillStep('getAssignedEmployee')
             // clear all form state
             setFormValuesSession({
                 requesterName: 'invalid',
                 assignedEmployeeID: null,
                 requestedService: '',
                 locationRequiringService: '',
                 urgencyLevel: '',
                 status: '',
                 description: '',
             })
             setTransportationValuesSession({
                 date: 'invalid',
                 destination: '',
                 mobilitylevel: ''
             })
             setFacilityValuesSession({
                 date: 'invalid'
             })
            } else
            if (prompt !== '') {
                if (prompt.includes('filling')) {
                    switch (prompt) {
                        case 'fillingSanitation':
                            switch (fillStep) {
                                case 'getAssignedEmployee':
                                    const matchedEmployees = employeeSearch.search(transcript)[0];
                                    if (matchedEmployees) {
                                        if (matchedEmployees.item) {
                                            const employee = matchedEmployees.item;
                                            if (employee) {
                                                setResponse({
                                                    text: `${employee.name}. Is that correct?`,
                                                    shouldStartListening: true,
                                                });
                                                setFormValues({
                                                    ...formValues,
                                                    assignedEmployeeID: employee.id,
                                                });
                                                setFillStep('confirmAssignedEmployee');
                                            }
                                        }
                                    } else if (transcript.toLowerCase().includes('unassigned')) {
                                        setResponse({
                                            text: `Unassigned. Is that correct?`,
                                            shouldStartListening: true,
                                        });
                                        setFormValues({ ...formValues, assignedEmployeeID: null });
                                        setFillStep('confirmAssignedEmployee');
                                    } else {
                                        setResponse({
                                            text: `Sorry, I didn't quite catch that. Who would you like to assign this to?`,
                                            shouldStartListening: true,
                                        });
                                    }
                                    break;
                                case 'confirmAssignedEmployee':
                                    if (affirmative.test(transcript)) {
                                        setFormValuesSession(formValues);
                                        setResponse({
                                            text: 'How urgent is this request? You can say: \"Low\", \"Medium\", \"High\", or \"Emergency\".',
                                            shouldStartListening: true,
                                        });
                                        setFillStep('getUrgency');
                                    } else if (negative.test(transcript)) {
                                        setFillStep('getAssignedEmployee');
                                        setResponse({
                                            text: "Who would you like to assign this to?",
                                            shouldStartListening: true,
                                        });
                                    }
                                    break;
                                case 'getUrgency':
                                    const matchedUrgencies = urgencySearch.search(transcript)[0];
                                    if (matchedUrgencies) {
                                        if (matchedUrgencies.item) {
                                            const urgency = matchedUrgencies.item;
                                            if (urgency) {
                                                setResponse({
                                                    text: `${urgency.displayName}. Is that correct?`,
                                                    shouldStartListening: true,
                                                });
                                                setFormValues({
                                                    ...formValues,
                                                    urgencyLevel: urgency.name,
                                                });
                                                setFillStep('confirmUrgency');
                                            }
                                        }
                                    } else {
                                        setResponse({
                                            text: `Sorry, I didn't quite catch that. How urgent is this request?`,
                                            shouldStartListening: true,
                                        });
                                    }
                                    break;
                                case 'confirmUrgency':
                                    if (affirmative.test(transcript)) {
                                        setFormValuesSession(formValues);
                                        setResponse({
                                            text: 'What should the initial status of this request be? You can say: \"Unassigned\", \"Assigned\", \"Working\", or \"Done\".',
                                            shouldStartListening: true,
                                        });
                                        setFillStep('getStatus');
                                    } else if (negative.test(transcript)) {
                                        setFillStep('getUrgency');
                                        setResponse({
                                            text: "How urgent is this request?",
                                            shouldStartListening: true,
                                        });
                                    }
                                    break;
                                case 'getStatus':
                                    const matchedStatuses = statusSearch.search(transcript)[0];
                                    if (matchedStatuses) {
                                        if (matchedStatuses.item) {
                                            const status = matchedStatuses.item;
                                            if (status) {
                                                setResponse({
                                                    text: `${status.name}. Is that correct?`,
                                                    shouldStartListening: true,
                                                });
                                                setFormValues({
                                                    ...formValues,
                                                    status: status.name,
                                                });
                                                setFillStep('confirmStatus');
                                            }
                                        }
                                    } else {
                                        setResponse({
                                            text: `Sorry, I didn't quite catch that. What should the initial status of this request be?`,
                                            shouldStartListening: true,
                                        });
                                    }
                                    break;
                                case 'confirmStatus':
                                    if (affirmative.test(transcript)) {
                                        setFormValuesSession(formValues);
                                        setResponse({
                                            text: 'Which department are you requesting this service to?',
                                            shouldStartListening: true,
                                        });
                                        setFillStep('getLocation');
                                    } else if (negative.test(transcript)) {
                                        setFillStep('getStatus');
                                        setResponse({
                                            text: "What should the initial status of this request be?",
                                            shouldStartListening: true,
                                        });
                                    }
                                    break;
                                case 'getLocation':
                                    const matchedDepartments =
                                        departmentSearch.search(transcript)[0];
                                    if (matchedDepartments) {
                                        if (matchedDepartments.item) {
                                            const department = matchedDepartments.item;
                                            if (department) {
                                                setResponse({
                                                    text: `${department.name}. Is that correct?`,
                                                    shouldStartListening: true,
                                                });
                                                setFormValues({
                                                    ...formValues,
                                                    locationRequiringService:
                                                        department.name +
                                                        ' at ' +
                                                        department.building.name,
                                                });
                                                setFillStep('confirmLocation');
                                            }
                                        }
                                    } else {
                                        setResponse({
                                            text: `Sorry, I didn't quite catch that. Which department are you requesting this service to?`,
                                            shouldStartListening: true,
                                        });
                                    }
                                    break;
                                case 'confirmLocation':
                                    if (affirmative.test(transcript)) {
                                        setFormValuesSession(formValues);
                                        setResponse({
                                            text: 'What service are you requesting? These include: \"Waste Management\", \"Room Cleaning\", \"Disposal\", \"Disinfection\", and more.',
                                            shouldStartListening: true,
                                        });
                                        setFillStep('getRequestedService');
                                    } else if (negative.test(transcript)) {
                                        setFillStep('getLocation');
                                        setResponse({
                                            text: "Which department are you requesting this service to?",
                                            shouldStartListening: true,
                                        });
                                    }
                                    break;
                                case 'getRequestedService':
                                    const matchedSanitation =
                                        sanitationSearch.search(transcript)[0];
                                    if (matchedSanitation) {
                                        if (matchedSanitation.item) {
                                            const sanitation = matchedSanitation.item;
                                            if (sanitation) {
                                                setResponse({
                                                    text: `${sanitation.name}. Is that correct?`,
                                                    shouldStartListening: true,
                                                });
                                                setFormValues({
                                                    ...formValues,
                                                    requestedService: sanitation.name,
                                                });
                                                setFillStep('confirmRequestedService');
                                            }
                                        }
                                    } else {
                                        setResponse({
                                            text: `Sorry, I didn't quite catch that. What service are you requesting?`,
                                            shouldStartListening: true,
                                        });
                                    }
                                    break;
                                case 'confirmRequestedService':
                                    if (affirmative.test(transcript)) {
                                        setFormValuesSession(formValues);
                                        setResponse({
                                            text: 'Alright. Final step. Please describe the details of your request',
                                            shouldStartListening: true,
                                        });
                                        setFillStep('getDescription');
                                    } else if (negative.test(transcript)) {
                                        setFillStep('getRequestedService');
                                        setResponse({
                                            text: "What service are you requesting?",
                                            shouldStartListening: true,
                                        });
                                    }
                                    break;
                                case 'getDescription':
                                    setResponse({
                                        text: `Your description has been recorded! If you're ready to confirm and submit, say yes. If you need to change your description, say no.`,
                                        shouldStartListening: true,
                                    });
                                    setFormValues({
                                        ...formValues,
                                        description: transcript,
                                    });
                                    setFormValuesSession({
                                        ...formValues,
                                        description: transcript,
                                    });
                                    setFillStep('confirmDescription');
                                    break;
                                case 'confirmDescription':
                                    if (affirmative.test(transcript)) {
                                        setResponse({
                                            text: 'Alright. Please review your request. Say yes if you want to submit, or no if you need to edit it.',
                                            shouldStartListening: true,
                                        });
                                        setFillStep('showConfirmation');
                                        setVoiceServiceConfirmation(true);
                                    } else if (negative.test(transcript)) {
                                        setFillStep('getDescription');
                                        setResponse({
                                            text: "Please describe the details of your request.",
                                            shouldStartListening: true,
                                        });
                                    }
                                    break;
                                case 'showConfirmation':
                                    if (affirmative.test(transcript)) {
                                        setVoiceServiceSubmit(true);
                                        setResponse({
                                            text: 'All set! Your request has been submitted!',
                                            shouldStartListening: false,
                                        });
                                        setPrompt('');
                                        setFillStep('getAssignedEmployee');
                                    } else if (negative.test(transcript)) {
                                        setResponse({
                                            text: "Alright, I'll let you edit your request.",
                                            shouldStartListening: false,
                                        });
                                        setVoiceServiceConfirmation(false);
                                    }
                                    break;
                            }
                            break;
                        case 'fillingLanguage':
                            switch (fillStep) {
                                case 'getAssignedEmployee':
                                    const matchedEmployees = employeeSearch.search(transcript)[0];
                                    if (matchedEmployees) {
                                        if (matchedEmployees.item) {
                                            const employee = matchedEmployees.item;
                                            if (employee) {
                                                setResponse({
                                                    text: `${employee.name}. Is that correct?`,
                                                    shouldStartListening: true,
                                                });
                                                setFormValues({
                                                    ...formValues,
                                                    assignedEmployeeID: employee.id,
                                                });
                                                setFillStep('confirmAssignedEmployee');
                                            }
                                        }
                                    } else if (transcript.toLowerCase().includes('unassigned')) {
                                        setResponse({
                                            text: `Unassigned. Is that correct?`,
                                            shouldStartListening: true,
                                        });
                                        setFormValues({ ...formValues, assignedEmployeeID: null });
                                        setFillStep('confirmAssignedEmployee');
                                    } else {
                                        setResponse({
                                            text: `Sorry, I didn't quite catch that. Who would you like to assign this to?`,
                                            shouldStartListening: true,
                                        });
                                    }
                                    break;
                                case 'confirmAssignedEmployee':
                                    if (affirmative.test(transcript)) {
                                        setFormValuesSession(formValues);
                                        setResponse({
                                            text: 'How urgent is this request? You can say: \"Low\", \"Medium\", \"High\", or \"Emergency\".',
                                            shouldStartListening: true,
                                        });
                                        setFillStep('getUrgency');
                                    } else if (negative.test(transcript)) {
                                        setFillStep('getAssignedEmployee');
                                        setResponse({
                                            text: "Who would you like to assign this to?",
                                            shouldStartListening: true,
                                        });
                                    }
                                    break;
                                case 'getUrgency':
                                    const matchedUrgencies = urgencySearch.search(transcript)[0];
                                    if (matchedUrgencies) {
                                        if (matchedUrgencies.item) {
                                            const urgency = matchedUrgencies.item;
                                            if (urgency) {
                                                setResponse({
                                                    text: `${urgency.displayName}. Is that correct?`,
                                                    shouldStartListening: true,
                                                });
                                                setFormValues({
                                                    ...formValues,
                                                    urgencyLevel: urgency.name,
                                                });
                                                setFillStep('confirmUrgency');
                                            }
                                        }
                                    } else {
                                        setResponse({
                                            text: `Sorry, I didn't quite catch that. How urgent is this request?`,
                                            shouldStartListening: true,
                                        });
                                    }
                                    break;
                                case 'confirmUrgency':
                                    if (affirmative.test(transcript)) {
                                        setFormValuesSession(formValues);
                                        setResponse({
                                            text: 'What should the initial status of this request be? You can say: \"Unassigned\", \"Assigned\", \"Working\", or \"Done\".',
                                            shouldStartListening: true,
                                        });
                                        setFillStep('getStatus');
                                    } else if (negative.test(transcript)) {
                                        setFillStep('getUrgency');
                                        setResponse({
                                            text: "How urgent is this request?",
                                            shouldStartListening: true,
                                        });
                                    }
                                    break;
                                case 'getStatus':
                                    const matchedStatuses = statusSearch.search(transcript)[0];
                                    if (matchedStatuses) {
                                        if (matchedStatuses.item) {
                                            const status = matchedStatuses.item;
                                            if (status) {
                                                setResponse({
                                                    text: `${status.name}. Is that correct?`,
                                                    shouldStartListening: true,
                                                });
                                                setFormValues({
                                                    ...formValues,
                                                    status: status.name,
                                                });
                                                setFillStep('confirmStatus');
                                            }
                                        }
                                    } else {
                                        setResponse({
                                            text: `Sorry, I didn't quite catch that. What should the initial status of this request be?`,
                                            shouldStartListening: true,
                                        });
                                    }
                                    break;
                                case 'confirmStatus':
                                    if (affirmative.test(transcript)) {
                                        setFormValuesSession(formValues);
                                        setResponse({
                                            text: 'Which department are you requesting this service to?',
                                            shouldStartListening: true,
                                        });
                                        setFillStep('getLocation');
                                    } else if (negative.test(transcript)) {
                                        setFillStep('getStatus');
                                        setResponse({
                                            text: "What should the initial status of this request be?",
                                            shouldStartListening: true,
                                        });
                                    }
                                    break;
                                case 'getLocation':
                                    const matchedDepartments =
                                        departmentSearch.search(transcript)[0];
                                    if (matchedDepartments) {
                                        if (matchedDepartments.item) {
                                            const department = matchedDepartments.item;
                                            if (department) {
                                                setResponse({
                                                    text: `${department.name}. Is that correct?`,
                                                    shouldStartListening: true,
                                                });
                                                setFormValues({
                                                    ...formValues,
                                                    locationRequiringService:
                                                        department.name +
                                                        ' at ' +
                                                        department.building.name,
                                                });
                                                setFillStep('confirmLocation');
                                            }
                                        }
                                    } else {
                                        setResponse({
                                            text: `Sorry, I didn't quite catch that. Which department are you requesting this service to?`,
                                            shouldStartListening: true,
                                        });
                                    }
                                    break;
                                case 'confirmLocation':
                                    if (affirmative.test(transcript)) {
                                        setFormValuesSession(formValues);
                                        setResponse({
                                            text: 'What language do you need a translator for?',
                                            shouldStartListening: true,
                                        });
                                        setFillStep('getRequestedService');
                                    } else if (negative.test(transcript)) {
                                        setFillStep('getLocation');
                                        setResponse({
                                            text: "Which department are you requesting this service to?",
                                            shouldStartListening: true,
                                        });
                                    }
                                    break;
                                case 'getRequestedService':
                                    const matchedLanguage = languageSearch.search(transcript)[0];
                                    if (matchedLanguage) {
                                        if (matchedLanguage.item) {
                                            const language = matchedLanguage.item;
                                            if (language) {
                                                setResponse({
                                                    text: `${language.name}. Is that correct?`,
                                                    shouldStartListening: true,
                                                });
                                                setFormValues({
                                                    ...formValues,
                                                    requestedService: language.name,
                                                });
                                                setFillStep('confirmRequestedService');
                                            }
                                        }
                                    } else {
                                        setResponse({
                                            text: `Sorry, I didn't quite catch that. What language do you need a translator for?`,
                                            shouldStartListening: true,
                                        });
                                    }
                                    break;
                                case 'confirmRequestedService':
                                    if (affirmative.test(transcript)) {
                                        setFormValuesSession(formValues);
                                        setResponse({
                                            text: 'Alright. Final step. Please describe the details of your request',
                                            shouldStartListening: true,
                                        });
                                        setFillStep('getDescription');
                                    } else if (negative.test(transcript)) {
                                        setFillStep('getRequestedService');
                                        setResponse({
                                            text: "What language do you need a translator for?",
                                            shouldStartListening: true,
                                        });
                                    }
                                    break;
                                case 'getDescription':
                                    setResponse({
                                        text: `Your description has been recorded! If you're ready to confirm and submit, say yes. If you need to change your description, say no.`,
                                        shouldStartListening: true,
                                    });
                                    setFormValues({
                                        ...formValues,
                                        description: transcript,
                                    });
                                    setFormValuesSession({
                                        ...formValues,
                                        description: transcript,
                                    });
                                    setFillStep('confirmDescription');
                                    break;
                                case 'confirmDescription':
                                    if (affirmative.test(transcript)) {
                                        setResponse({
                                            text: 'Alright. Please review your request. Say yes if you want to submit, or no if you need to edit it.',
                                            shouldStartListening: true,
                                        });
                                        setFillStep('showConfirmation');
                                        setVoiceServiceConfirmation(true);
                                    } else if (negative.test(transcript)) {
                                        setFillStep('getDescription');
                                        setResponse({
                                            text: "Please describe the details of your request.",
                                            shouldStartListening: true,
                                        });
                                    }
                                    break;
                                case 'showConfirmation':
                                    if (affirmative.test(transcript)) {
                                        setVoiceServiceSubmit(true);
                                        setResponse({
                                            text: 'All set! Your request has been submitted!',
                                            shouldStartListening: false,
                                        });
                                        setPrompt('');
                                        setFillStep('getAssignedEmployee');
                                    } else if (negative.test(transcript)) {
                                        setResponse({
                                            text: "Alright, I'll let you edit your request.",
                                            shouldStartListening: false,
                                        });
                                        setVoiceServiceConfirmation(false);
                                    }
                                    break;
                            }
                            break;
                        case 'fillingSecurity':
                            switch (fillStep) {
                                case 'getAssignedEmployee':
                                    const matchedEmployees = employeeSearch.search(transcript)[0];
                                    if (matchedEmployees) {
                                        if (matchedEmployees.item) {
                                            const employee = matchedEmployees.item;
                                            if (employee) {
                                                setResponse({
                                                    text: `${employee.name}. Is that correct?`,
                                                    shouldStartListening: true,
                                                });
                                                setFormValues({
                                                    ...formValues,
                                                    assignedEmployeeID: employee.id,
                                                });
                                                setFillStep('confirmAssignedEmployee');
                                            }
                                        }
                                    } else if (transcript.toLowerCase().includes('unassigned')) {
                                        setResponse({
                                            text: `Unassigned. Is that correct?`,
                                            shouldStartListening: true,
                                        });
                                        setFormValues({ ...formValues, assignedEmployeeID: null });
                                        setFillStep('confirmAssignedEmployee');
                                    } else {
                                        setResponse({
                                            text: `Sorry, I didn't quite catch that. Who would you like to assign this to?`,
                                            shouldStartListening: true,
                                        });
                                    }
                                    break;
                                case 'confirmAssignedEmployee':
                                    if (affirmative.test(transcript)) {
                                        setFormValuesSession(formValues);
                                        setResponse({
                                            text: 'How urgent is this request? You can say: \"Low\", \"Medium\", \"High\", or \"Emergency\".',
                                            shouldStartListening: true,
                                        });
                                        setFillStep('getUrgency');
                                    } else if (negative.test(transcript)) {
                                        setFillStep('getAssignedEmployee');
                                        setResponse({
                                            text: "Who would you like to assign this to?",
                                            shouldStartListening: true,
                                        });
                                    }
                                    break;
                                case 'getUrgency':
                                    const matchedUrgencies = urgencySearch.search(transcript)[0];
                                    if (matchedUrgencies) {
                                        if (matchedUrgencies.item) {
                                            const urgency = matchedUrgencies.item;
                                            if (urgency) {
                                                setResponse({
                                                    text: `${urgency.displayName}. Is that correct?`,
                                                    shouldStartListening: true,
                                                });
                                                setFormValues({
                                                    ...formValues,
                                                    urgencyLevel: urgency.name,
                                                });
                                                setFillStep('confirmUrgency');
                                            }
                                        }
                                    } else {
                                        setResponse({
                                            text: `Sorry, I didn't quite catch that. How urgent is this request?`,
                                            shouldStartListening: true,
                                        });
                                    }
                                    break;
                                case 'confirmUrgency':
                                    if (affirmative.test(transcript)) {
                                        setFormValuesSession(formValues);
                                        setResponse({
                                            text: 'What should the initial status of this request be? You can say: \"Unassigned\", \"Assigned\", \"Working\", or \"Done\".',
                                            shouldStartListening: true,
                                        });
                                        setFillStep('getStatus');
                                    } else if (negative.test(transcript)) {
                                        setFillStep('getUrgency');
                                        setResponse({
                                            text: "How urgent is this request?",
                                            shouldStartListening: true,
                                        });
                                    }
                                    break;
                                case 'getStatus':
                                    const matchedStatuses = statusSearch.search(transcript)[0];
                                    if (matchedStatuses) {
                                        if (matchedStatuses.item) {
                                            const status = matchedStatuses.item;
                                            if (status) {
                                                setResponse({
                                                    text: `${status.name}. Is that correct?`,
                                                    shouldStartListening: true,
                                                });
                                                setFormValues({
                                                    ...formValues,
                                                    status: status.name,
                                                });
                                                setFillStep('confirmStatus');
                                            }
                                        }
                                    } else {
                                        setResponse({
                                            text: `Sorry, I didn't quite catch that. What should the initial status of this request be?`,
                                            shouldStartListening: true,
                                        });
                                    }
                                    break;
                                case 'confirmStatus':
                                    if (affirmative.test(transcript)) {
                                        setFormValuesSession(formValues);
                                        setResponse({
                                            text: 'Which department are you requesting this service to?',
                                            shouldStartListening: true,
                                        });
                                        setFillStep('getLocation');
                                    } else if (negative.test(transcript)) {
                                        setFillStep('getStatus');
                                        setResponse({
                                            text: "What should the initial status of this request be?",
                                            shouldStartListening: true,
                                        });
                                    }
                                    break;
                                case 'getLocation':
                                    const matchedDepartments =
                                        departmentSearch.search(transcript)[0];
                                    if (matchedDepartments) {
                                        if (matchedDepartments.item) {
                                            const department = matchedDepartments.item;
                                            if (department) {
                                                setResponse({
                                                    text: `${department.name}. Is that correct?`,
                                                    shouldStartListening: true,
                                                });
                                                setFormValues({
                                                    ...formValues,
                                                    locationRequiringService:
                                                        department.name +
                                                        ' at ' +
                                                        department.building.name,
                                                });
                                                setFillStep('confirmLocation');
                                            }
                                        }
                                    } else {
                                        setResponse({
                                            text: `Sorry, I didn't quite catch that. Which department are you requesting this service to?`,
                                            shouldStartListening: true,
                                        });
                                    }
                                    break;
                                case 'confirmLocation':
                                    if (affirmative.test(transcript)) {
                                        setFormValuesSession(formValues);
                                        setResponse({
                                            text: 'What type of security are you requesting? You can say \"Physical Security\", \"Access Control\", \"Surveillance\", \"Emergency Response\", or \"Security Escort\"',
                                            shouldStartListening: true,
                                        });
                                        setFillStep('getRequestedService');
                                    } else if (negative.test(transcript)) {
                                        setFillStep('getLocation');
                                        setResponse({
                                            text: "Which department are you requesting this service to?",
                                            shouldStartListening: true,
                                        });
                                    }
                                    break;
                                case 'getRequestedService':
                                    const matchedSecurity = securitySearch.search(transcript)[0];
                                    if (matchedSecurity) {
                                        if (matchedSecurity.item) {
                                            const security = matchedSecurity.item;
                                            if (security) {
                                                setResponse({
                                                    text: `${security.name}. Is that correct?`,
                                                    shouldStartListening: true,
                                                });
                                                setFormValues({
                                                    ...formValues,
                                                    requestedService: security.name,
                                                });
                                                setFillStep('confirmRequestedService');
                                            }
                                        }
                                    } else {
                                        setResponse({
                                            text: `Sorry, I didn't quite catch that. What type of security are you requesting?`,
                                            shouldStartListening: true,
                                        });
                                    }
                                    break;
                                case 'confirmRequestedService':
                                    if (affirmative.test(transcript)) {
                                        setFormValuesSession(formValues);
                                        setResponse({
                                            text: 'Alright. Final step. Please describe the details of your request',
                                            shouldStartListening: true,
                                        });
                                        setFillStep('getDescription');
                                    } else if (negative.test(transcript)) {
                                        setFillStep('getRequestedService');
                                        setResponse({
                                            text: "What type of security are you requesting?",
                                            shouldStartListening: true,
                                        });
                                    }
                                    break;
                                case 'getDescription':
                                    setResponse({
                                        text: `Your description has been recorded! If you're ready to confirm and submit, say yes. If you need to change your description, say no.`,
                                        shouldStartListening: true,
                                    });
                                    setFormValues({
                                        ...formValues,
                                        description: transcript,
                                    });
                                    setFormValuesSession({
                                        ...formValues,
                                        description: transcript,
                                    });
                                    setFillStep('confirmDescription');
                                    break;
                                case 'confirmDescription':
                                    if (affirmative.test(transcript)) {
                                        setResponse({
                                            text: 'Alright. Please review your request. Say yes if you want to submit, or no if you need to edit it.',
                                            shouldStartListening: true,
                                        });
                                        setFillStep('showConfirmation');
                                        setVoiceServiceConfirmation(true);
                                    } else if (negative.test(transcript)) {
                                        setFillStep('getDescription');
                                        setResponse({
                                            text: "Please describe the details of your request.",
                                            shouldStartListening: true,
                                        });
                                    }
                                    break;
                                case 'showConfirmation':
                                    if (affirmative.test(transcript)) {
                                        setVoiceServiceSubmit(true);
                                        setResponse({
                                            text: 'All set! Your request has been submitted!',
                                            shouldStartListening: false,
                                        });
                                        setPrompt('');
                                        setFillStep('getAssignedEmployee');
                                    } else if (negative.test(transcript)) {
                                        setResponse({
                                            text: "Alright, I'll let you edit your request.",
                                            shouldStartListening: false,
                                        });
                                        setVoiceServiceConfirmation(false);
                                    }
                                    break;
                            }
                            break;
                        case 'fillingFacility':
                            switch (fillStep) {
                                case 'getAssignedEmployee':
                                    const matchedEmployees = employeeSearch.search(transcript)[0];
                                    if (matchedEmployees) {
                                        if (matchedEmployees.item) {
                                            const employee = matchedEmployees.item;
                                            if (employee) {
                                                setResponse({
                                                    text: `${employee.name}. Is that correct?`,
                                                    shouldStartListening: true,
                                                });
                                                setFormValues({
                                                    ...formValues,
                                                    assignedEmployeeID: employee.id,
                                                });
                                                setFillStep('confirmAssignedEmployee');
                                            }
                                        }
                                    } else if (transcript.toLowerCase().includes('unassigned')) {
                                        setResponse({
                                            text: `Unassigned. Is that correct?`,
                                            shouldStartListening: true,
                                        });
                                        setFormValues({ ...formValues, assignedEmployeeID: null });
                                        setFillStep('confirmAssignedEmployee');
                                    } else {
                                        setResponse({
                                            text: `Sorry, I didn't quite catch that. Who would you like to assign this to?`,
                                            shouldStartListening: true,
                                        });
                                    }
                                    break;
                                case 'confirmAssignedEmployee':
                                    if (affirmative.test(transcript)) {
                                        setFormValuesSession(formValues);
                                        setResponse({
                                            text: 'How urgent is this request? You can say: \"Low\", \"Medium\", \"High\", or \"Emergency\".',
                                            shouldStartListening: true,
                                        });
                                        setFillStep('getUrgency');
                                    } else if (negative.test(transcript)) {
                                        setFillStep('getAssignedEmployee');
                                        setResponse({
                                            text: "Who would you like to assign this to?",
                                            shouldStartListening: true,
                                        });
                                    }
                                    break;
                                case 'getUrgency':
                                    const matchedUrgencies = urgencySearch.search(transcript)[0];
                                    if (matchedUrgencies) {
                                        if (matchedUrgencies.item) {
                                            const urgency = matchedUrgencies.item;
                                            if (urgency) {
                                                setResponse({
                                                    text: `${urgency.displayName}. Is that correct?`,
                                                    shouldStartListening: true,
                                                });
                                                setFormValues({
                                                    ...formValues,
                                                    urgencyLevel: urgency.name,
                                                });
                                                setFillStep('confirmUrgency');
                                            }
                                        }
                                    } else {
                                        setResponse({
                                            text: `Sorry, I didn't quite catch that. How urgent is this request?`,
                                            shouldStartListening: true,
                                        });
                                    }
                                    break;
                                case 'confirmUrgency':
                                    if (affirmative.test(transcript)) {
                                        setFormValuesSession(formValues);
                                        setResponse({
                                            text: 'What should the initial status of this request be? You can say: \"Unassigned\", \"Assigned\", \"Working\", or \"Done\".',
                                            shouldStartListening: true,
                                        });
                                        setFillStep('getStatus');
                                    } else if (negative.test(transcript)) {
                                        setFillStep('getUrgency');
                                        setResponse({
                                            text: "How urgent is this request?",
                                            shouldStartListening: true,
                                        });
                                    }
                                    break;
                                case 'getStatus':
                                    const matchedStatuses = statusSearch.search(transcript)[0];
                                    if (matchedStatuses) {
                                        if (matchedStatuses.item) {
                                            const status = matchedStatuses.item;
                                            if (status) {
                                                setResponse({
                                                    text: `${status.name}. Is that correct?`,
                                                    shouldStartListening: true,
                                                });
                                                setFormValues({
                                                    ...formValues,
                                                    status: status.name,
                                                });
                                                setFillStep('confirmStatus');
                                            }
                                        }
                                    } else {
                                        setResponse({
                                            text: `Sorry, I didn't quite catch that. What should the initial status of this request be?`,
                                            shouldStartListening: true,
                                        });
                                    }
                                    break;
                                case 'confirmStatus':
                                    if (affirmative.test(transcript)) {
                                        setFormValuesSession(formValues);
                                        setResponse({
                                            text: 'Which department are you requesting this service to?',
                                            shouldStartListening: true,
                                        });
                                        setFillStep('getLocation');
                                    } else if (negative.test(transcript)) {
                                        setFillStep('getStatus');
                                        setResponse({
                                            text: "What should the initial status of this request be?",
                                            shouldStartListening: true,
                                        });
                                    }
                                    break;
                                case 'getLocation':
                                    const matchedDepartments =
                                        departmentSearch.search(transcript)[0];
                                    if (matchedDepartments) {
                                        if (matchedDepartments.item) {
                                            const department = matchedDepartments.item;
                                            if (department) {
                                                setResponse({
                                                    text: `${department.name}. Is that correct?`,
                                                    shouldStartListening: true,
                                                });
                                                setFormValues({
                                                    ...formValues,
                                                    locationRequiringService:
                                                        department.name +
                                                        ' at ' +
                                                        department.building.name,
                                                });
                                                setFillStep('confirmLocation');
                                            }
                                        }
                                    } else {
                                        setResponse({
                                            text: `Sorry, I didn't quite catch that. Which department are you requesting this service to?`,
                                            shouldStartListening: true,
                                        });
                                    }
                                    break;
                                case 'confirmLocation':
                                    if (affirmative.test(transcript)) {
                                        setFormValuesSession(formValues);
                                        setResponse({
                                            text: 'What type of maintenance are you requesting? You can say "Electrical", "Plumbing", "Equipment", "HVAC", "I.T.", "Safety", or "Construction"',
                                            shouldStartListening: true,
                                        });
                                        setFillStep('getRequestedService');
                                    } else if (negative.test(transcript)) {
                                        setFillStep('getLocation');
                                        setResponse({
                                            text: "Which department are you requesting this service to?",
                                            shouldStartListening: true,
                                        });
                                    }
                                    break;
                                case 'getRequestedService':
                                    const matchedMaintenance = facilitySearch.search(transcript)[0];
                                    if (matchedMaintenance) {
                                        if (matchedMaintenance.item) {
                                            const maintenance = matchedMaintenance.item;
                                            if (maintenance) {
                                                setResponse({
                                                    text: `${maintenance.name==='IT'? "I.T." : maintenance.name}. Is that correct?`,
                                                    shouldStartListening: true,
                                                });
                                                setFormValues({
                                                    ...formValues,
                                                    requestedService: maintenance.name,
                                                });
                                                setFillStep('confirmRequestedService');
                                            }
                                        }
                                    } else {
                                        setResponse({
                                            text: `Sorry, I didn't quite catch that. What type of maintenance are you requesting?`,
                                            shouldStartListening: true,
                                        });
                                    }
                                    break;
                                case 'confirmRequestedService':
                                    if (affirmative.test(transcript)) {
                                        setFormValuesSession(formValues);
                                        setResponse({
                                            text: 'When do you need this maintenance done by?',
                                            shouldStartListening: true,
                                        });
                                        setFillStep('getDate');
                                    } else if (negative.test(transcript)) {
                                        setFillStep('getRequestedService');
                                        setResponse({
                                            text: "What type of maintenance are you requesting?",
                                            shouldStartListening: true,
                                        });
                                    }
                                    break;
                                case 'getDate':
                                    const maintenanceDate = chrono.parseDate(transcript);
                                    if (maintenanceDate) {
                                        setResponse({
                                            text: `${maintenanceDate.toLocaleDateString(undefined, {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric',
                                            })}. Is that correct?`,
                                            shouldStartListening: true,
                                        });
                                        setFacilityValues({
                                            date: maintenanceDate.toLocaleDateString('en-US'),
                                        });
                                        setFillStep('confirmDate');
                                    } else {
                                        setResponse({
                                            text: `Sorry, I didn't quite catch that. When do you need this maintenance done by?`,
                                            shouldStartListening: true,
                                        });
                                    }
                                    break;
                                case 'confirmDate':
                                    if (affirmative.test(transcript)) {
                                        setFacilityValuesSession(facilityValues);
                                        setResponse({
                                            text: 'Alright. Final step. Please describe the details of your request',
                                            shouldStartListening: true,
                                        });
                                        setFillStep('getDescription');
                                    } else if (negative.test(transcript)) {
                                        setFillStep('getDate');
                                        setResponse({
                                            text: "When do you need this maintenance done by?",
                                            shouldStartListening: true,
                                        });
                                    }
                                    break;
                                case 'getDescription':
                                    setResponse({
                                        text: `Your description has been recorded! If you're ready to confirm and submit, say yes. If you need to change your description, say no.`,
                                        shouldStartListening: true,
                                    });
                                    setFormValues({
                                        ...formValues,
                                        description: transcript,
                                    });
                                    setFormValuesSession({
                                        ...formValues,
                                        description: transcript,
                                    });
                                    setFillStep('confirmDescription');
                                    break;
                                case 'confirmDescription':
                                    if (affirmative.test(transcript)) {
                                        setResponse({
                                            text: 'Alright. Please review your request. Say yes if you want to submit, or no if you need to edit it.',
                                            shouldStartListening: true,
                                        });
                                        setFillStep('showConfirmation');
                                        setVoiceServiceConfirmation(true);
                                    } else if (negative.test(transcript)) {
                                        setFillStep('getDescription');
                                        setResponse({
                                            text: "Please describe the details of your request.",
                                            shouldStartListening: true,
                                        });
                                    }
                                    break;
                                case 'showConfirmation':
                                    if (affirmative.test(transcript)) {
                                        setVoiceServiceSubmit(true);
                                        setResponse({
                                            text: 'All set! Your request has been submitted!',
                                            shouldStartListening: false,
                                        });
                                        setPrompt('');
                                        setFillStep('getAssignedEmployee');
                                    } else if (negative.test(transcript)) {
                                        setResponse({
                                            text: "Alright, I'll let you edit your request.",
                                            shouldStartListening: false,
                                        });
                                        setVoiceServiceConfirmation(false);
                                    }
                                    break;
                            }
                            break;
                        case 'fillingTransportation':
                            switch (fillStep) {
                                case 'getAssignedEmployee':
                                    const matchedEmployees = employeeSearch.search(transcript)[0];
                                    if (matchedEmployees) {
                                        if (matchedEmployees.item) {
                                            const employee = matchedEmployees.item;
                                            if (employee) {
                                                setResponse({
                                                    text: `${employee.name}. Is that correct?`,
                                                    shouldStartListening: true,
                                                });
                                                setFormValues({
                                                    ...formValues,
                                                    assignedEmployeeID: employee.id,
                                                });
                                                setFillStep('confirmAssignedEmployee');
                                            }
                                        }
                                    } else if (transcript.toLowerCase().includes('unassigned')) {
                                        setResponse({
                                            text: `Unassigned. Is that correct?`,
                                            shouldStartListening: true,
                                        });
                                        setFormValues({ ...formValues, assignedEmployeeID: null });
                                        setFillStep('confirmAssignedEmployee');
                                    } else {
                                        setResponse({
                                            text: `Sorry, I didn't quite catch that. Who would you like to assign this to?`,
                                            shouldStartListening: true,
                                        });
                                    }
                                    break;
                                case 'confirmAssignedEmployee':
                                    if (affirmative.test(transcript)) {
                                        setFormValuesSession(formValues);
                                        setResponse({
                                            text: 'How urgent is this request? You can say: \"Low\", \"Medium\", \"High\", or \"Emergency\".',
                                            shouldStartListening: true,
                                        });
                                        setFillStep('getUrgency');
                                    } else if (negative.test(transcript)) {
                                        setFillStep('getAssignedEmployee');
                                        setResponse({
                                            text: "Who would you like to assign this to?",
                                            shouldStartListening: true,
                                        });
                                    }
                                    break;
                                case 'getUrgency':
                                    const matchedUrgencies = urgencySearch.search(transcript)[0];
                                    if (matchedUrgencies) {
                                        if (matchedUrgencies.item) {
                                            const urgency = matchedUrgencies.item;
                                            if (urgency) {
                                                setResponse({
                                                    text: `${urgency.displayName}. Is that correct?`,
                                                    shouldStartListening: true,
                                                });
                                                setFormValues({
                                                    ...formValues,
                                                    urgencyLevel: urgency.name,
                                                });
                                                setFillStep('confirmUrgency');
                                            }
                                        }
                                    } else {
                                        setResponse({
                                            text: `Sorry, I didn't quite catch that. How urgent is this request?`,
                                            shouldStartListening: true,
                                        });
                                    }
                                    break;
                                case 'confirmUrgency':
                                    if (affirmative.test(transcript)) {
                                        setFormValuesSession(formValues);
                                        setResponse({
                                            text: 'What should the initial status of this request be? You can say: \"Unassigned\", \"Assigned\", \"Working\", or \"Done\".',
                                            shouldStartListening: true,
                                        });
                                        setFillStep('getStatus');
                                    } else if (negative.test(transcript)) {
                                        setFillStep('getUrgency');
                                        setResponse({
                                            text: "How urgent is this request?",
                                            shouldStartListening: true,
                                        });
                                    }
                                    break;
                                case 'getStatus':
                                    const matchedStatuses = statusSearch.search(transcript)[0];
                                    if (matchedStatuses) {
                                        if (matchedStatuses.item) {
                                            const status = matchedStatuses.item;
                                            if (status) {
                                                setResponse({
                                                    text: `${status.name}. Is that correct?`,
                                                    shouldStartListening: true,
                                                });
                                                setFormValues({
                                                    ...formValues,
                                                    status: status.name,
                                                });
                                                setFillStep('confirmStatus');
                                            }
                                        }
                                    } else {
                                        setResponse({
                                            text: `Sorry, I didn't quite catch that. What should the initial status of this request be?`,
                                            shouldStartListening: true,
                                        });
                                    }
                                    break;
                                case 'confirmStatus':
                                    if (affirmative.test(transcript)) {
                                        setFormValuesSession(formValues);
                                        setResponse({
                                            text: 'Which department are you requesting this service to?',
                                            shouldStartListening: true,
                                        });
                                        setFillStep('getLocation');
                                    } else if (negative.test(transcript)) {
                                        setFillStep('getStatus');
                                        setResponse({
                                            text: "What should the initial status of this request be?",
                                            shouldStartListening: true,
                                        });
                                    }
                                    break;
                                case 'getLocation':
                                    const matchedDepartments =
                                        departmentSearch.search(transcript)[0];
                                    if (matchedDepartments) {
                                        if (matchedDepartments.item) {
                                            const department = matchedDepartments.item;
                                            if (department) {
                                                setResponse({
                                                    text: `${department.name}. Is that correct?`,
                                                    shouldStartListening: true,
                                                });
                                                setFormValues({
                                                    ...formValues,
                                                    locationRequiringService:
                                                        department.name +
                                                        ' at ' +
                                                        department.building.name,
                                                });
                                                setFillStep('confirmLocation');
                                            }
                                        }
                                    } else {
                                        setResponse({
                                            text: `Sorry, I didn't quite catch that. Which department are you requesting this service to?`,
                                            shouldStartListening: true,
                                        });
                                    }
                                    break;
                                case 'confirmLocation':
                                    if (affirmative.test(transcript)) {
                                        setFormValuesSession(formValues);
                                        setResponse({
                                            text: 'Which hospital location is the patient being transported to?',
                                            shouldStartListening: true,
                                        });
                                        setFillStep('getDestination');
                                    } else if (negative.test(transcript)) {
                                        setFillStep('getLocation');
                                        setResponse({
                                            text: "Which department are you requesting this service to?",
                                            shouldStartListening: true,
                                        });
                                    }
                                    break;
                                case 'getDestination':
                                    const matchedDestination = transportationDestinationSearch.search(transcript)[0];
                                    if (matchedDestination) {
                                        if (matchedDestination.item) {
                                            const destination = matchedDestination.item;
                                            if (destination) {
                                                setResponse({
                                                    text: `${destination.name}. Is that correct?`,
                                                    shouldStartListening: true,
                                                });
                                                setTransportationValues({
                                                    ...transportationValues,
                                                    destination: destination.name,
                                                });
                                                setFillStep('confirmDestination');
                                            }
                                        }
                                    } else {
                                        setResponse({
                                            text: `Sorry, I didn't quite catch that. Which hospital location is the patient being transported to?`,
                                            shouldStartListening: true,
                                        });
                                    }
                                    break;
                                case 'confirmDestination':
                                    if (affirmative.test(transcript)) {
                                        setTransportationValuesSession(transportationValues);
                                        setResponse({
                                            text: "What is the date of patient transport?",
                                            shouldStartListening: true,
                                        });
                                        setFillStep('getDate');
                                    } else if (negative.test(transcript)) {
                                        setFillStep('getDestination');
                                        setResponse({
                                            text: "Which hospital location is the patient being transported to?",
                                            shouldStartListening: true,
                                        });
                                    }
                                    break;
                                case 'getDate':
                                    const transportDate = chrono.parseDate(transcript);
                                    if (transportDate) {
                                        setResponse({
                                            text: `${transportDate.toLocaleDateString(undefined, {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric',
                                            })}. Is that correct?`,
                                            shouldStartListening: true,
                                        });
                                        setTransportationValues({
                                            ...transportationValues,
                                            date: transportDate.toLocaleDateString('en-US'),
                                        });
                                        setFillStep('confirmDate');
                                    } else {
                                        setResponse({
                                            text: `Sorry, I didn't quite catch that. What is the date of patient transport?`,
                                            shouldStartListening: true,
                                        });
                                    }
                                    break;
                                case 'confirmDate':
                                    if (affirmative.test(transcript)) {
                                        setTransportationValuesSession(transportationValues);
                                        setResponse({
                                            text: 'What mode of transportation are you requesting? You can say "Ambulance" or "Helicopter".',
                                            shouldStartListening: true,
                                        });
                                        setFillStep('getRequestedService');
                                    } else if (negative.test(transcript)) {
                                        setFillStep('getDate');
                                        setResponse({
                                            text: "What is the date of patient transport?",
                                            shouldStartListening: true,
                                        });
                                    }
                                    break;
                                case 'getRequestedService':
                                    const matchedTransportation = transportationModeSearch.search(transcript)[0];
                                    if (matchedTransportation) {
                                        if (matchedTransportation.item) {
                                            const transportation = matchedTransportation.item;
                                            if (transportation) {
                                                setResponse({
                                                    text: `${transportation.name}. Is that correct?`,
                                                    shouldStartListening: true,
                                                });
                                                setFormValues({
                                                    ...formValues,
                                                    requestedService: transportation.name,
                                                });
                                                setFillStep('confirmRequestedService');
                                            }
                                        }
                                    } else {
                                        setResponse({
                                            text: `Sorry, I didn't quite catch that. What mode of transportation are you requesting?`,
                                            shouldStartListening: true,
                                        });
                                    }
                                    break;
                                case 'confirmRequestedService':
                                    if (affirmative.test(transcript)) {
                                        setFormValuesSession(formValues);
                                        setResponse({
                                            text: "What is the patient's mobility level? You can say: \"Ambulatory\", \"Wheelchair\", \"Stretcher\", or \"Requires Life Support\".",
                                            shouldStartListening: true,
                                        });
                                        setFillStep('getMobility');
                                    } else if (negative.test(transcript)) {
                                        setFillStep('getRequestedService');
                                        setResponse({
                                            text: "What mode of transportation are you requesting?",
                                            shouldStartListening: true,
                                        });
                                    }
                                    break;
                                case 'getMobility':
                                    const matchedMobility = transportationMobilitySearch.search(transcript)[0];
                                    if (matchedMobility) {
                                        if (matchedMobility.item) {
                                            const mobility = matchedMobility.item;
                                            if (mobility) {
                                                setResponse({
                                                    text: `${mobility.name}. Is that correct?`,
                                                    shouldStartListening: true,
                                                });
                                                setTransportationValues({
                                                    ...transportationValues,
                                                    mobilitylevel: mobility.name,
                                                });
                                                setFillStep('confirmMobility');
                                            }
                                        }
                                    } else {
                                        setResponse({
                                            text: `Sorry, I didn't quite catch that. What is the patient's mobility level?`,
                                            shouldStartListening: true,
                                        });
                                    }
                                    break;
                                case 'confirmMobility':
                                    if (affirmative.test(transcript)) {
                                        setTransportationValuesSession(transportationValues);
                                        setResponse({
                                            text: "Please describe any additional details about the patient.",
                                            shouldStartListening: true,
                                        });
                                        setFillStep('getDescription');
                                    } else if (negative.test(transcript)) {
                                        setFillStep('getMobility');
                                        setResponse({
                                            text: "What is the patient's mobility level?",
                                            shouldStartListening: true,
                                        });
                                    }
                                    break;
                                case 'getDescription':
                                    setResponse({
                                        text: `Your description has been recorded! If you're ready to confirm and submit, say yes. If you need to change your description, say no.`,
                                        shouldStartListening: true,
                                    });
                                    setFormValues({
                                        ...formValues,
                                        description: transcript,
                                    });
                                    setFormValuesSession({
                                        ...formValues,
                                        description: transcript,
                                    });
                                    setFillStep('confirmDescription');
                                    break;
                                case 'confirmDescription':
                                    if (affirmative.test(transcript)) {
                                        setResponse({
                                            text: 'Please review your request. Say yes if you want to submit, or no if you need to edit it.',
                                            shouldStartListening: true,
                                        });
                                        setFillStep('showConfirmation');
                                        setVoiceServiceConfirmation(true);
                                    } else if (negative.test(transcript)) {
                                        setFillStep('getDescription');
                                        setResponse({
                                            text: "Please describe the details of your request.",
                                            shouldStartListening: true,
                                        });
                                    }
                                    break;
                                case 'showConfirmation':
                                    if (affirmative.test(transcript)) {
                                        setVoiceServiceSubmit(true);
                                        setResponse({
                                            text: 'All set! Your request has been submitted!',
                                            shouldStartListening: false,
                                        });
                                        setPrompt('');
                                        setFillStep('getAssignedEmployee');
                                    } else if (negative.test(transcript)) {
                                        setResponse({
                                            text: "Alright, I'll let you edit your request.",
                                            shouldStartListening: false,
                                        });
                                        setVoiceServiceConfirmation(false);
                                    }
                                    break;
                            }
                            break;
                    }
                } else if (affirmative.test(transcript)) {
                    // simple site navigation cases
                    switch (prompt) {
                        case 'fillFacility':
                            setPrompt('fillingFacility');
                            setResponse({
                                text: 'Who do you want to assign this to? You can also say "unassigned."',
                                shouldStartListening: true,
                            });
                            break;
                        case 'fillSanitation':
                            setPrompt('fillingSanitation');
                            setResponse({
                                text: 'Who do you want to assign this to? You can also say "unassigned."',
                                shouldStartListening: true,
                            });
                            break;
                        case 'fillTransportation':
                            setPrompt('fillingTransportation');
                            setResponse({
                                text: 'Who do you want to assign this to? You can also say "unassigned."',
                                shouldStartListening: true,
                            });
                            break;
                        case 'fillLanguage':
                            setPrompt('fillingLanguage');
                            setResponse({
                                text: 'Who do you want to assign this to? You can also say "unassigned."',
                                shouldStartListening: true,
                            });
                            break;
                        case 'fillSecurity':
                            setPrompt('fillingSecurity');
                            setResponse({
                                text: 'Who do you want to assign this to? You can also say "unassigned."',
                                shouldStartListening: true,
                            });
                            break;
                        case 'facility':
                            setResponse({
                                text: 'Taking you there now! Do you want me to help you fill it out?',
                                shouldStartListening: true,
                            });
                            setPrompt('fillFacility');
                            navigate('/services/facilitymaintenancerequest');
                            break;
                        case 'sanitation':
                            setResponse({
                                text: 'Taking you there now! Do you want me to help you fill it out?',
                                shouldStartListening: true,
                            });
                            setPrompt('fillSanitation');
                            navigate('/services/sanitationrequest');
                            break;
                        case 'transportation':
                            setResponse({
                                text: 'Taking you there now! Do you want me to help you fill it out?',
                                shouldStartListening: true,
                            });
                            setPrompt('fillTransportation');
                            navigate('/services/patienttransportationrequest');
                            break;
                        case 'language':
                            setResponse({
                                text: 'Taking you there now! Do you want me to help you fill it out?',
                                shouldStartListening: true,
                            });
                            setPrompt('fillLanguage');
                            navigate('/services/languagerequest');
                            break;
                        case 'servicelist':
                            setResponse({
                                text: 'Taking you there now!',
                                shouldStartListening: false,
                            });
                            navigate('/services/servicerequests');
                            setPrompt('');
                            break;
                        case 'importexport':
                            setResponse({
                                text: 'Taking you there now!',
                                shouldStartListening: false,
                            });
                            navigate('/services/importexport');
                            setPrompt('');
                            break;
                        case 'pathfinding':
                            setResponse({
                                text: 'Taking you there now!',
                                shouldStartListening: false,
                            });
                            navigate('/navigation');
                            setPrompt('');
                            break;
                        case 'nodeediting':
                            setResponse({
                                text: 'Taking you there now!',
                                shouldStartListening: false,
                            });
                            navigate('/services/mapediting');
                            setPrompt('');
                            break;
                        case 'security':
                            setResponse({
                                text: 'Taking you there now! Do you want me to help you fill it out?',
                                shouldStartListening: true,
                            });
                            setPrompt('fillSecurity');
                            navigate('/services/security-request');
                            break;
                        case 'voiceNav':
                            setResponse({
                                text: 'Taking you there now!',
                                shouldStartListening: false,
                            });
                            setVoiceSession(voiceDepartment);
                            navigate('/navigation');
                            setPrompt('');
                            break;
                    }
                } else if (negative.test(transcript)) {
                    setResponse({ text: "Ok, I won't.", shouldStartListening: false });
                    setPrompt('');
                }
            } else {
                if (facilityWords.test(transcript)) {
                    setResponse({
                        text: 'Should I take you to the facility maintenance form?',
                        shouldStartListening: true,
                    });
                    setPrompt('facility');
                } else if (sanitationWords.test(transcript)) {
                    setResponse({
                        text: 'Should I take you to the sanitation form?',
                        shouldStartListening: true,
                    });
                    setPrompt('sanitation');
                } else if (transportationWords.test(transcript)) {
                    setResponse({
                        text: 'Should I take you to the patient transportation form?',
                        shouldStartListening: true,
                    });
                    setPrompt('transportation');
                } else if (languageWords.test(transcript)) {
                    setResponse({
                        text: 'Should I take you to the language interpreter form?',
                        shouldStartListening: true,
                    });
                    setPrompt('language');
                } else if (serviceListWords.test(transcript)) {
                    setResponse({
                        text: 'Should I take you to the list of service requests?',
                        shouldStartListening: true,
                    });
                    setPrompt('servicelist');
                } else if (importExportWords.test(transcript)) {
                    setResponse({
                        text: 'Should I take you to the directory backup page?',
                        shouldStartListening: true,
                    });
                    setPrompt('importexport');
                } else if (greetingWords.test(transcript)) {
                    setResponse({ text: 'Hi there! How can I help?', shouldStartListening: true });
                } else if (goodbyeWords.test(transcript)) {
                    setResponse({
                        text: "Alright, let me know if there's anything I can help with.",
                        shouldStartListening: false,
                    });
                } else if (nodeEditWords.test(transcript)) {
                    setResponse({
                        text: 'Should I take you to the map editor?',
                        shouldStartListening: true,
                    });
                    setPrompt('nodeediting');
                } else if (pathfindingWords.test(transcript)) {
                    setResponse({
                        text: 'Should I take you to navigation?',
                        shouldStartListening: true,
                    });
                    setPrompt('pathfinding');
                } else if (securityWords.test(transcript)) {
                    setResponse({
                        text: 'Should I take you to the security request form?',
                        shouldStartListening: true,
                    });
                    setPrompt('security');
                } else if (voiceNavWords.test(transcript)) {
                    const location = voiceNavWords.exec(transcript);
                    if (location) {
                        const destination = location[1];
                        const matches = departmentSearch.search(
                            destination.replace('department', '').replace('the', '')
                        )[0];
                        if (matches) {
                            if (matches.item) {
                                const department = matches.item;
                                if (department) {
                                    setResponse({
                                        text: `Should I navigate you to ${department.name}?`,
                                        shouldStartListening: true,
                                    });
                                    setVoiceDepartment(department);
                                    setPrompt('voiceNav');
                                }
                            }
                        } else {
                            setResponse({
                                text: `Sorry, I couldn't find that department. You can try selecting a different hospital location or manually searching for it. Do you want me to take you to navigation?`,
                                shouldStartListening: true,
                            });
                            setPrompt('pathfinding');
                        }
                    }
                } else {
                    setResponse({
                        text: "Sorry, I didn't understand. Try rephrasing your request.",
                        shouldStartListening: false,
                    });
                }
            }
        }
    }, [listening]);
    if (!browserSupportsSpeechRecognition) {
        return (
            <span>
                <Mic
                    className={
                        '!bg-[#044ca4] rounded-full size-7 p-1 relative inline-flex hover:cursor-pointer stroke-red-500'
                    }
                    onClick={() =>
                        playTTS("Sorry, this browser doesn't support speech recognition.", audioRef)
                    }
                />
            </span>
        );
    }

    return (
        <div>
            {props.showFull && <p>Microphone: {listening ? 'listening' : 'not listening'}</p>}

            <span className={'relative flex size-7'}>
                {listening && (
                    <span className="absolute inline-flex h-full w-full mic-pulse rounded-full bg-white opacity-50"></span>
                )}

                <Mic
                    className={
                        (listening ? 'stroke-[#F2CD88]' : 'stroke-white') +
                        ' !bg-[#044ca4] rounded-full size-7 p-1 relative inline-flex hover:cursor-pointer hover:stroke-[#F2CD88]'
                    }
                    onClick={
                        listening
                            ? SpeechRecognition.stopListening
                            : SpeechRecognition.startListening
                    }
                />
            </span>
            {props.showFull && (
                <>
                    <button className={'button'} onClick={resetTranscript}>
                        Reset
                    </button>
                    <p>You: {transcript}</p>
                    <p>Assistant: {response}</p>
                </>
            )}
        </div>
    );
};
export default SpeechRecognitionWidget;

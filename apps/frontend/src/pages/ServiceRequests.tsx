import { useLocation } from 'react-router-dom';
import Fuse from 'fuse.js';
import '../styles.css';
import axios from 'axios';
import { API_ROUTES } from 'common/src/constants.ts';
import {fetchEmployees} from '../lib/utils.ts';
import { Filter } from 'lucide-react';
import { Prisma } from '../../../../packages/database';
import ServiceReqInfoPopup from '../components/ServiceReqInfoPopup.tsx';
import React, { useEffect, useState, useRef } from 'react';

type SR = Prisma.ServiceRequestsGetPayload<{
    include: { PatientTransportationRequest: true; FacilityMaintenanceRequest: true }
}>

const ITEMS_PER_PAGE = 15

export default function ServiceRequests() {
    const [rows, setRows] = useState<SR[]>([])
    const [values, setValues] = useState<{ [key: string]: string }>({ search: '', filterOption: 'urgencyHighToLow' })
    const [activeFilter, setActiveFilter] = useState<string | null>(null)
    const [filterInput, setFilterInput] = useState('')
    const [currentPage, setCurrentPage] = useState(1)
    const [infoHover, setInfoHover] = useState(-1)
    const [showMoreInfo, setShowMoreInfo] = useState(false)
    const [selectedRequest, setSelectedRequest] = useState<SR>({
        requestID: 0,
        requesterName: '',
        assignedEmployeeID: null,
        status: '',
        description: '',
        locationRequiringService: '',
        urgencyLevel: '',
        serviceCategory: '',
        requestedService: '',
        PatientTransportationRequest: { serviceRequestID: 0, date: '', patientMobilityLevel: '', destination: '' },
        FacilityMaintenanceRequest: { serviceRequestID: 0, date: '' },
    })

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
    useEffect(() => {
        fetchEmployees(10, 1000, setEmployee);
    }, []);

    const location = useLocation();
    const { requestId } = location.state || {};

    useEffect(() => {
        const saved = localStorage.getItem('selectedLocation');
        if (saved) {
            let parsed: string;
            try {
                parsed = JSON.parse(saved);
            } catch {
                parsed = saved;
            }

            const LOCATION_MAP: Record<string, string> = {
                'faulkner-belkin': 'Faulkner Hospital',
                'patriot_place': 'Patriot Place',
                'chestnut_hill': 'Chestnut Hill',
                'main_campus': 'Main Campus',
            };

            const normalized = LOCATION_MAP[parsed] || parsed;
            setValues(prev => ({
                ...prev,
                locationRequiringService: normalized
            }));
            setCurrentPage(1);
        }
    }, []);



    useEffect(() => {
        fetchData(5, 500);
    }, []);

    useEffect(() => {
        if (requestId) {
            setValues(v => ({ ...v, search: String(requestId) }));
            setCurrentPage(1);
            window.history.replaceState({}, '') // clear state once used so it does not reappear on reload
        }
    }, [requestId]);




    const fuse = React.useMemo(() => {
        return new Fuse(rows, {
            keys: [
                'requesterName',
                'serviceCategory',
                'requestedService',
                'urgencyLevel',
                'status',
                'locationRequiringService',
                'description',
            ],
            getFn: (obj, path) => {
                const val = Fuse.config.getFn(obj, path);
                return path === 'requestID' ? String(val) : val;
            },
            threshold: 0.4,
        });
    }, [rows]);

    const filterRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        function handleClickOutside(evt: MouseEvent) {
            if (
                activeFilter &&
                filterRef.current &&
                !filterRef.current.contains(evt.target as Node)
            ) {
                setActiveFilter(null)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [activeFilter])

    useEffect(() => { fetchData(5, 500) }, [])
    const fetchData = async (retries: number, delay: number) => {
        try {
            const res = await fetch('/api/servicerequests')
            const data: SR[] = await res.json()
            setRows(data.sort((a, b) => a.requestID - b.requestID))
        } catch {
            if (retries > 0) setTimeout(() => fetchData(retries - 1, delay), delay)
            else console.error('Error fetching service requests')
        }
    }

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setValues(v => ({ ...v, search: e.target.value }))
        setCurrentPage(1)
    }

    const applyFilter = (field: string, v: string) => {
        setValues(vals => ({ ...vals, [field]: v }))
        setActiveFilter(null)
        setFilterInput('')
        setCurrentPage(1)
    }

    const clearFilter = (field: string) => {
        setValues(vals => { const c = { ...vals }; delete c[field]; return c })
        setActiveFilter(null)
        setFilterInput('')
        setCurrentPage(1)
    }

    const uniqueValues = (field: keyof SR) =>
        Array.from(new Set(rows.map(r => String(r[field] ?? '')))).sort()

    const isNumeric = (s: string) => /^\d+$/.test(s)

    const searchResults = values.search
        ? isNumeric(values.search)
            ? rows.filter(r => r.requestID === Number(values.search))
            : fuse.search(values.search).map(r => r.item)
        : rows


    const filtered = searchResults
        .filter(r =>
            Object.entries(values)
                .filter(([k]) => k !== 'search' && k !== 'filterOption')
                .every(([k, v]) => {
                    if (k === 'assignedEmployee') {
                        const isUnassigned = r.assignedEmployeeID === null;
                        if (v.toLowerCase() === 'unassigned') return isUnassigned;
                        if (isUnassigned) return false;
                        const name = employee.find(e => e.id === r.assignedEmployeeID)?.name ?? '';
                        return name.toLowerCase().includes(v.toLowerCase());
                    }

                    const fieldValue = String(r[k as keyof SR] ?? '').trim().toLowerCase();
                    const filterValue = v.trim().toLowerCase();

                    if (['locationRequiringService', 'description', 'requestedService', 'requesterName'].includes(k)) {
                        return fieldValue.includes(filterValue);
                    }

                    return fieldValue === filterValue;
                })
        )

        .sort((a, b) => {
            if (values.filterOption !== 'urgencyHighToLow') return 0
            const order: Record<string, number> = { Emergency: 4, 'High/Urgent': 3, Medium: 2, Low: 1 }
            return (order[b.urgencyLevel] || 0) - (order[a.urgencyLevel] || 0)
        })


    const paginated = filtered.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    )


    const handleAssignedEmployeeChange = async (requestID: number, newAssignedEmployee: number) => {
        //need to send the new status change to the back end
        try {
            //send in the id and its respective newAssignedEmployee

            //build JSON
            const data = JSON.stringify({
                requestID: requestID,
                newAssignedEmployee: newAssignedEmployee,
            });

            const res = await axios.post(API_ROUTES.SERVICEREQUESTS, data, {
                headers: {
                    'content-Type': 'application/json',
                },
            });

            if (res.status === 200) {
                console.log(res.data);
            }
        } catch (error) {
            console.log('Error Changing Assigned Employee:', error);
        }
    };

    const renderPageButtons = () => {
        const base = 'px-3 py-1 rounded-full border border-[#385DA6] text-sm transition-all duration-200'
        const act = 'bg-[#385DA6] text-white font-semibold'
        const inact = 'text-[#385DA6] hover:bg-gray-200'
        const total = Math.ceil(filtered.length / ITEMS_PER_PAGE)
        const pages = []

        pages.push(
            <button key={1} onClick={() => setCurrentPage(1)} className={`${base} ${currentPage === 1 ? act : inact}`}>1</button>
        )
        if (currentPage > 3) pages.push(<span key="ld" className="px-2">…</span>)
        for (let i = Math.max(2, currentPage - 1); i <= Math.min(total - 1, currentPage + 1); i++) {
            pages.push(
                <button key={i} onClick={() => setCurrentPage(i)} className={`${base} ${currentPage === i ? act : inact}`}>{i}</button>
            )
        }
        if (currentPage < total - 2) pages.push(<span key="rd" className="px-2">…</span>)
        if (total > 1) {
            pages.push(
                <button key={total} onClick={() => setCurrentPage(total)} className={`${base} ${currentPage === total ? act : inact}`}>{total}</button>
            )
        }

        return pages
    }

    return (
        <div className="p-2 min-h-[80vh] bg-[url('/Service_Icons/ServicesPageBackground.png')] bg-cover bg-center">
            <ServiceReqInfoPopup
                open={showMoreInfo}
                onClose={() => setShowMoreInfo(false)}
                serviceRequest={selectedRequest}
            />
            <div className="px-4 py-8 max-w-8xl mx-auto">
                <h2 className="mt-4 titleFont text-center text-4xl font-bold text-[#385DA6]">
                    Service Requests
                </h2>
                <div className="titleFont my-4 flex flex-wrap items-center justify-between gap-4">
                    <input
                        id="search"
                        type="search"
                        name="search"
                        className="bg-white headerFont font-xl border border-gray-300 rounded px-4 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#385DA6] w-full md:max-w-md"
                        value={values.search}
                        onChange={handleSearch}
                        placeholder="Search Requests..."
                    />
                    <button
                        onClick={() => {
                            setValues({ search: '' });
                            setCurrentPage(1);
                        }}
                        className="px-4 py-2 buttonLook text-white rounded shadow-sm  "
                    >
                        Clear All Filters
                    </button>
                </div>
                <div className="overflow-x-auto rounded-lg shadow border border-gray-200">
                    <table className="min-w-full bg-white">
                        <thead className="bg-gray-100 text-xs uppercase text-gray-500">
                        <tr>
                            <th className="px-6 py-3">ID</th>
                            {([
                                { key: 'requesterName', label: 'Requester Name', type: 'text' },
                                { key: 'assignedEmployee', label: 'Assigned Employee', type: 'text' },
                                { key: 'serviceCategory', label: 'Type', type: 'select' },
                                { key: 'requestedService', label: 'Requested Service', type: 'text' },
                                { key: 'urgencyLevel', label: 'Urgency Level', type: 'select' },
                                { key: 'status', label: 'Status', type: 'select' },
                                { key: 'locationRequiringService', label: 'Location', type: 'text' },
                                { key: 'description', label: 'Description', type: 'text' },
                            ] as const).map(col => (
                                <th key={col.key} className="px-6 py-3 relative text-center">
                                    <div className="inline-flex items-center space-x-1">
                                        <span>{col.label}</span>
                                        <button
                                            onClick={() =>
                                                setActiveFilter(activeFilter === col.key ? null : col.key)
                                            }
                                            className="px-1"
                                        >
                                            <Filter className="h-4 w-4 cursor-pointer" />
                                        </button>
                                    </div>
                                    {activeFilter === col.key && (
                                        <div ref={filterRef} className="absolute z-10 mt-2 w-56 p-2 bg-white rounded shadow-lg">
                                            {col.type === 'text' && (
                                                <>
                                                    {col.key === 'assignedEmployee' ? (
                                                        <>
                                                            <input
                                                                type="text"
                                                                list="employee-list"
                                                                value={filterInput}
                                                                onChange={e => setFilterInput(e.target.value)}
                                                                placeholder="Search employee..."
                                                                className="w-full mb-2 border rounded px-2 py-1"
                                                            />
                                                            <datalist id="employee-list">
                                                                {employee.map(emp => (
                                                                    <option key={emp.id} value={emp.name} />
                                                                ))}
                                                            </datalist>
                                                        </>
                                                    ) : (
                                                        <input
                                                            type="text"
                                                            value={filterInput}
                                                            onChange={e => setFilterInput(e.target.value)}
                                                            placeholder="Contains..."
                                                            className="w-full mb-2 border rounded px-2 py-1"
                                                        />
                                                    )}
                                                    <button
                                                        onClick={() => applyFilter(col.key, filterInput)}
                                                        className="block w-full text-left px-2 py-1 hover:bg-gray-100"
                                                    >
                                                        Apply
                                                    </button>
                                                </>
                                            )}

                                            {col.type === 'select' &&
                                                uniqueValues(col.key as keyof SR).map(opt => (
                                                    <button
                                                        key={opt}
                                                        onClick={() => applyFilter(col.key, opt)}
                                                        className="block w-full text-left px-2 py-1 hover:bg-gray-100"
                                                    >
                                                        {opt}
                                                    </button>
                                                ))}
                                            <button
                                                onClick={() => clearFilter(col.key)}
                                                className="block w-full text-left px-2 py-1 text-gray-500 hover:bg-gray-100"
                                            >
                                                Clear Filter
                                            </button>
                                        </div>
                                    )}
                                </th>
                            ))}
                            <th className="px-6 py-3">All Info</th>
                        </tr>
                        </thead>
                        <tbody className="text-center text-sm text-gray-700">
                        {paginated.map((r, i) => (
                            <tr key={r.requestID} className={i % 2 ? 'bg-gray-100 hover:bg-gray-200' : 'bg-white hover:bg-gray-200'}>
                                <td className="px-6 py-4">{r.requestID}</td>
                                <td className="px-6 py-4">{r.requesterName}</td>
                                <td className="px-6 py-4">
                                    <select
                                        name="assignedEmployeeID"
                                        className="border border-gray-300 rounded px-2 py-1 text-sm"
                                        value={r.assignedEmployeeID ?? ''}
                                        onChange={(e) => {
                                            const newAssignedEmployee = parseInt(e.target.value);
                                            const updated = rows.map((req) =>
                                                req.requestID === r.requestID
                                                    ? { ...req, assignedEmployeeID: newAssignedEmployee}
                                                    : req
                                            );
                                            setRows(updated);
                                            handleAssignedEmployeeChange(r.requestID, newAssignedEmployee);
                                        }}
                                    >
                                        <option value="">Unassigned</option>
                                        {employee.map((emp) => (
                                            <option key={emp.id}
                                                    value={emp.id}>
                                                {emp.name}
                                            </option>
                                        ))}
                                    </select>
                                </td>
                                <td className="px-6 py-4">{r.serviceCategory}</td>
                                <td className="px-6 py-4">{r.requestedService}</td>
                                <td className="px-6 py-4">{r.urgencyLevel}</td>
                                <td className="px-6 py-4">
                                    <select
                                        value={r.status}
                                        onChange={e => {
                                            const newStatus = e.target.value;
                                            setRows(prev =>
                                                prev.map(req =>
                                                    req.requestID === r.requestID ? { ...req, status: newStatus } : req
                                                )
                                            );
                                            axios.post(
                                                API_ROUTES.SERVICEREQUESTS,
                                                JSON.stringify({ requestID: r.requestID, newStatus: newStatus }),
                                                { headers: { 'Content-Type': 'application/json' } }
                                            );
                                        }}
                                        className="border border-gray-300 rounded px-2 py-1 text-sm"
                                    >
                                        <option>Unassigned</option>
                                        <option>Assigned</option>
                                        <option>Working</option>
                                        <option>Done</option>
                                    </select>

                                </td>
                                <td className="px-6 py-4">{r.locationRequiringService}</td>
                                <td className="px-6 py-4">{r.description}</td>
                                <td className="px-6 py-4">
                                    <img
                                        src={infoHover === i ? '/assets/info-filled.svg' : '/assets/info.svg'}
                                        className="mx-auto h-6 w-6 cursor-pointer"
                                        onClick={() => {
                                            setSelectedRequest(r)
                                            setShowMoreInfo(true)
                                        }}
                                        onMouseEnter={() => setInfoHover(i)}
                                        onMouseLeave={() => setInfoHover(-1)}
                                    />
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
                <div className="flex justify-center mt-6 space-x-2">{renderPageButtons()}</div>
            </div>
        </div>
    )
}
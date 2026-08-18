import React, { useEffect, useState, useCallback } from 'react';
import { AlertCircle, Flame, Zap, CheckCircle } from 'lucide-react';
import RequestListPopup from '../components/SummaryPopUp';
import { useNavigate } from 'react-router-dom';
import {
    PieChart,
    Pie,
    Sector,
    Cell,
    Tooltip,
    Legend,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
} from 'recharts';
import axios from 'axios';

const COLORS = ['#8854d0', '#4b7bec', '#20bf6b', '#fd9644'];
const HEADER_COLOR = '#F2A057';

type UrgencyLevel = 'Emergency' | 'High' | 'Medium' | 'Low' | 'High/Urgent';

interface ServiceRequest {
    requestID: number;
    requesterName: string;
    status: string;
    description: string;
    locationRequiringService: string;
    urgencyLevel: UrgencyLevel;
    serviceCategory: string;
    requestedService: string;
}

interface ActiveShapeCore {
    cx: number;
    cy: number;
    innerRadius: number;
    outerRadius: number;
    startAngle: number;
    endAngle: number;
    fill: string;
}

const RenderActiveShape = (props: unknown) => {
    const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } =
        props as ActiveShapeCore;
    return (
        <Sector
            cx={cx}
            cy={cy}
            innerRadius={innerRadius}
            outerRadius={outerRadius + 10}
            startAngle={startAngle}
            endAngle={endAngle}
            fill={fill}
        />
    );
};

interface RequestItem {
    id: number;
    text: string;
}

interface RequestListPopupProps {
    open: boolean;
    onClose: () => void;
    title: string;
    requests: RequestItem[];
}

export default function SummaryPage() {
    const navigate = useNavigate();

    const handleViewServiceRequest = (requestId: number) => {
        navigate('/services/servicerequests', { state: { requestId } });
    };

    const [requests, setRequests] = useState<ServiceRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeIndex, setActiveIndex] = useState<number | null>(null);
    const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
    const [showAllRecent, setShowAllRecent] = useState(false);
    const [showAllPriority, setShowAllPriority] = useState(false);

    const [showPopup, setShowPopup] = useState(false);
    const [popupRequests, setPopupRequests] = useState<RequestItem[]>([]);
    const [popupTitle, setPopupTitle] = useState('');

    const fetchRequests = useCallback(() => {
        setLoading(true);
        axios
            .get<ServiceRequest[]>('/api/servicerequests')
            .then(r => {
                const normalized = r.data.map(item => ({
                    ...item,
                    urgencyLevel:
                        item.urgencyLevel === 'High/Urgent'
                            ? 'High'
                            : item.urgencyLevel,
                }));
                setRequests(normalized);
            })
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => {
        fetchRequests();
    }, [fetchRequests]);

    if (loading) return <div className="p-8 text-center">Loading…</div>;

    const recent = [...requests].sort(
        (a, b) => b.requestID - a.requestID,
    );
    const URGENCY_ORDER: Record<string, number> = {
        Emergency: 3,
        High: 2,
        Medium: 1,
        Low: 0,
    };

    const urgencyIcons: Record<string, React.ReactElement> = {
        Emergency: (
            <AlertCircle className="w-10 h-10 text-red-600" />
        ),
        High: <Flame className="w-10 h-10 text-orange-500" />,
        Medium: <Zap className="w-10 h-10 text-yellow-400" />,
        Low: <CheckCircle className="w-10 h-10 text-green-500" />,
    };

    const urgencySmallIcons: Record<string, React.ReactElement> = {
        Emergency: (
            <AlertCircle className="w-6 h-6 text-red-600" />
        ),
        High: <Flame className="w-6 h-6 text-orange-500" />,
        Medium: <Zap className="w-6 h-6 text-yellow-400" />,
        Low: <CheckCircle className="w-6 h-6 text-green-500" />,
    };

    const priority = [...requests].sort((a, b) => {
        const urgencyDiff =
            URGENCY_ORDER[b.urgencyLevel] -
            URGENCY_ORDER[a.urgencyLevel];
        if (urgencyDiff !== 0) return urgencyDiff;
        return a.requestID - b.requestID;
    });

    const displayedRecent = showAllRecent
        ? recent
        : recent.slice(0, 5);
    const displayedPriority = showAllPriority
        ? priority
        : priority.slice(0, 3);

    const statusCounts = Object.entries(
        requests.reduce<Record<string, number>>((acc, r) => {
            acc[r.status] = (acc[r.status] || 0) + 1;
            return acc;
        }, {}),
    ).map(([name, value]) => ({ name, value }));

    const urgencyMap = [
        { label: 'Low', key: 'Low' },
        { label: 'Medium', key: 'Medium' },
        { label: 'High', key: 'High' },
        { label: 'Emergency', key: 'Emergency' },
    ];
    const urgencyCounts = urgencyMap.map(({ label, key }) => ({
        name: label,
        count: requests.filter(r => r.urgencyLevel === key).length,
    }));

    const doneCount = requests.filter(
        r => r.status === 'Done',
    ).length;
    const totalCount = requests.length;
    const pctDone = totalCount
        ? Math.round((doneCount / totalCount) * 100)
        : 0;
    const pctRem = 100 - pctDone;

    const CardHeader = ({ title }: { title: string }) => (
        <div
            className="w-full text-black text-xl font-semibold text-center py-3"
            style={{ backgroundColor: HEADER_COLOR }}
        >
            {title}
        </div>
    );

    return (
        <div
            className="w-full min-h-screen bg-cover bg-center"
            style={{
                backgroundImage:
                    "url('/Service_Icons/ServicesPageBackground.png')",
            }}
        >
            <div className="p-8 max-w-6xl mx-auto space-y-8">
                <div className="flex items-center justify-between">
                    <h1 className="text-3xl font-bold text-[#385DA6] titleFont">
                        Service Requests Summary
                    </h1>
                    <button
                        onClick={fetchRequests}
                        className="buttonLook text-white px-4 py-2 rounded headerFont"
                    >
                        Refresh
                    </button>
                </div>
                <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div
                        className="bg-white rounded-lg shadow overflow-hidden cursor-pointer headerFont"
                        onDoubleClick={() => {
                            setPopupTitle('All Recent Requests');
                            setPopupRequests(
                                recent.map((r, i) => ({
                                    id: r.requestID,
                                    text: `#${i + 1} — ${r.requesterName} requested ${r.requestedService}`,
                                })),
                            );
                            setShowPopup(true);
                        }}
                    >
                        <CardHeader
                            title={`Most Recent Requests (${showAllRecent ? 'all' : '5'})`}
                        />
                        <div
                            className={`h-50 ${
                                showAllRecent
                                    ? 'overflow-y-auto'
                                    : 'overflow-hidden'
                            } scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100 pr-2`}
                        >
                            <ul className="pt-4 pl-5 list-disc space-y-1 text-left">
                                {displayedRecent.map((r, i) => (
                                    <li
                                        key={r.requestID}
                                        className="flex justify-between items-center px-2 py-1"
                                    >
                                        <span
                                            onClick={e => {
                                                e.stopPropagation();
                                                handleViewServiceRequest(
                                                    r.requestID,
                                                );
                                            }}
                                            className="text-black hover:text-blue-700 cursor-pointer"
                                        >
                                            #{i + 1} — {r.requesterName}{' '}
                                            requested{' '}
                                            <em>{r.requestedService}</em>
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    <div
                        className="bg-white rounded-lg shadow overflow-hidden cursor-pointer headerFont"
                        onDoubleClick={() => {
                            setPopupTitle('All Priority Requests');
                            setPopupRequests(
                                priority.map((r, i) => ({
                                    id: r.requestID,
                                    text: `#${i + 1} — ${r.requesterName} requested ${r.requestedService} (${r.urgencyLevel})`,
                                })),
                            );
                            setShowPopup(true);
                        }}
                    >
                        <CardHeader
                            title={`Priority Requests (${showAllPriority ? 'all' : '1'})`}
                        />
                        <div className="h-50 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100 pr-2">
                            <ul
                                className={`w-full ${
                                    showAllPriority
                                        ? 'pt-2 pl-5 space-y-2 text-left text-base'
                                        : 'pt-4 space-y-3'
                                }`}
                            >
                                {displayedPriority.map((r, i) => {
                                    const icon =
                                        urgencySmallIcons[r.urgencyLevel];
                                    return (
                                        <li
                                            key={r.requestID}
                                            className="flex items-center gap-2 px-3 py-2 rounded"
                                        >
                                            {icon}
                                            <span
                                                onClick={() =>
                                                    handleViewServiceRequest(
                                                        r.requestID,
                                                    )
                                                }
                                                className={`font-medium cursor-pointer hover:underline hover:underline-offset-4 ${
                                                    r.urgencyLevel ===
                                                    'Emergency'
                                                        ? 'text-red-600 decoration-red-600'
                                                        : r.urgencyLevel ===
                                                        'High'
                                                            ? 'text-orange-500 decoration-orange-500'
                                                            : r.urgencyLevel ===
                                                            'Medium'
                                                                ? 'text-yellow-500 decoration-yellow-500'
                                                                : 'text-green-600 decoration-green-600'
                                                }`}
                                            >
                                                #{i + 1} — {r.requesterName}{' '}
                                                requested{' '}
                                                <em>
                                                    {r.requestedService}
                                                </em>
                                            </span>
                                        </li>
                                    );
                                })}
                            </ul>
                        </div>
                    </div>
                </section>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
                    <div className="bg-white rounded-lg shadow overflow-hidden h-80 headerFont">
                        <CardHeader title="Status Overview" />
                        <div className="mt-4 flex justify-center pb-12">
                            {selectedStatus ? (
                                <div className="flex flex-col items-center justify-start w-full">
                                    <h3 className="text-lg font-semibold mb-2 text-center headerFont">
                                        Requests with status: {selectedStatus}
                                    </h3>
                                    <ul className="h-40 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100 list-disc pl-6 pr-2 space-y-1 w-full mb-4">
                                        {requests
                                            .filter(
                                                r =>
                                                    r.status ===
                                                    selectedStatus,
                                            )
                                            .map(r => (
                                                <li key={r.requestID}>
                                                    #{r.requestID} —{' '}
                                                    <strong>
                                                        {r.requesterName}
                                                    </strong>{' '}
                                                    —{' '}
                                                    <em>
                                                        {r.requestedService}
                                                    </em>
                                                </li>
                                            ))}
                                    </ul>
                                    <div className="flex justify-center -mt-2">
                                        <button
                                            onClick={() =>
                                                setSelectedStatus(null)
                                            }
                                            className="bg-[#385DA6] text-white px-4 py-2 rounded hover:opacity-90"
                                        >
                                            Back to Chart
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <PieChart
                                    width={260}
                                    height={220}
                                    style={{ overflow: 'visible' }}
                                >
                                    <Pie
                                        data={statusCounts}
                                        dataKey="value"
                                        nameKey="name"
                                        cx="50%"
                                        cy="50%"
                                        outerRadius={80}
                                        activeIndex={
                                            activeIndex ?? undefined
                                        }
                                        activeShape={RenderActiveShape}
                                        onMouseEnter={(_, idx) =>
                                            setActiveIndex(idx)
                                        }
                                        onMouseLeave={() =>
                                            setActiveIndex(null)
                                        }
                                        onClick={data =>
                                            setSelectedStatus(
                                                (data as {
                                                    name: string;
                                                }).name,
                                            )
                                        }
                                    >
                                        {statusCounts.map((_, i) => (
                                            <Cell
                                                key={i}
                                                fill={
                                                    COLORS[
                                                    i % COLORS.length
                                                        ]
                                                }
                                            />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        wrapperStyle={{
                                            pointerEvents: 'none',
                                        }}
                                    />
                                    <Legend
                                        verticalAlign="bottom"
                                        align="center"
                                        wrapperStyle={{ marginTop: 48 }}
                                    />
                                </PieChart>
                            )}
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow overflow-hidden headerFont">
                        <CardHeader title="Overall Completion" />
                        <div className="mt-8 flex flex-col justify-center w-full space-y-4 px-6 pb-6">
                            <div className="flex items-center justify-center">
                                <span className="w-24 text-left">
                                    Completed
                                </span>
                                <div className="flex-1 bg-gray-200 h-4 rounded overflow-hidden relative mx-4">
                                    <div
                                        className="absolute top-0 left-0 h-4 bg-green-500"
                                        style={{
                                            width: `${pctDone}%`,
                                        }}
                                    />
                                </div>
                                <span className="w-12 text-right">
                                    {pctDone}%
                                </span>
                            </div>
                            <div className="flex items-center justify-center">
                                <span className="w-24 text-left">
                                    Remaining
                                </span>
                                <div className="flex-1 bg-gray-200 h-4 rounded overflow-hidden relative mx-4">
                                    <div
                                        className="absolute top-0 left-0 h-4 bg-orange-500"
                                        style={{
                                            width: `${pctRem}%`,
                                        }}
                                    />
                                </div>
                                <span className="w-12 text-right">
                                    {pctRem}%
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow overflow-hidden headerFont">
                        <CardHeader title="Urgency Breakdown" />
                        <div
                            className="mt-8 flex justify-center items-center w-full h-full px-6 pb-6"
                            style={{ transform: 'translateX(-25px)' }}
                        >
                            <BarChart
                                width={300}
                                height={240}
                                data={urgencyCounts}
                                margin={{ bottom: 40 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis
                                    dataKey="name"
                                    interval={0}
                                    height={60}
                                    tick={({ x, y, payload }) => (
                                        <text
                                            x={x}
                                            y={y + 10}
                                            textAnchor="end"
                                            transform={`rotate(-30, ${x}, ${
                                                y + 10
                                            })`}
                                            style={{ fontSize: 12 }}
                                        >
                                            {payload.value}
                                        </text>
                                    )}
                                />
                                <YAxis allowDecimals={false} />
                                <Tooltip />
                                <Bar dataKey="count">
                                    {urgencyCounts.map((_, i) => (
                                        <Cell
                                            key={i}
                                            fill={
                                                COLORS[i % COLORS.length]
                                            }
                                        />
                                    ))}
                                </Bar>
                            </BarChart>
                        </div>
                    </div>
                </div>
            </div>
            <RequestListPopup
                open={showPopup}
                onClose={() => setShowPopup(false)}
                title={popupTitle}
                requests={popupRequests}
            />
        </div>
    );
}

import React, { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import EmployeeList, { Employee } from '../components/EmployeeList.tsx';
import { useAuth } from '../components/auth_context';
import { API_ROUTES } from 'common/src/constants.ts';
import Fuse from 'fuse.js';

const ITEMS_PER_PAGE = 15;

const EmployeeTable: React.FC = () => {
    const [EmployeeRow, setEmployeeRow] = useState<Employee[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [search, setSearch] = useState('');
    const { isAdmin, email: currentUserEmail } = useAuth();

    useEffect(() => {
        fetchEmployees();
    }, []);

    const fetchEmployees = async () => {
        try {
            const res = await axios.get('/api/employee');
            setEmployeeRow(res.data);
        } catch {
            setEmployeeRow([]);
        }
    };

    const fuse = useMemo(() => new Fuse(EmployeeRow, {
        keys: ['name', 'email', 'role'],
        threshold: 0.3,
    }), [EmployeeRow]);

    const filteredAllRows = search
        ? fuse.search(search).map(result => result.item)
        : EmployeeRow;

    const totalPages = Math.ceil(filteredAllRows.length / ITEMS_PER_PAGE);
    const paginatedRows = filteredAllRows.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    const renderPageButtons = () => {
        const pageButtons = [];
        const maxDisplayed = 3;
        const shouldShowLeftDots = currentPage > maxDisplayed;
        const shouldShowRightDots = currentPage < totalPages - maxDisplayed + 1;

        const baseButton =
            'px-3 py-1 rounded-full border border-[#385DA6] text-sm transition-all duration-200';
        const activeButton = 'bg-[#385DA6] text-white font-semibold';
        const inactiveButton = 'bg--[#385DA6] text-[#385DA6] hover:bg-gray-200';

        pageButtons.push(
            <button
                key={1}
                onClick={() => setCurrentPage(1)}
                className={`${baseButton} ${currentPage === 1 ? activeButton : inactiveButton}`}
            >
                1
            </button>
        );

        if (shouldShowLeftDots) {
            pageButtons.push(
                <span key="left-dots" className="flex items-end pb-1 text-gray-400 font-semibold">
                    …
                </span>
            );
        }

        const startPage = Math.max(2, currentPage - 1);
        const endPage = Math.min(totalPages - 1, currentPage + 1);

        for (let i = startPage; i <= endPage; i++) {
            pageButtons.push(
                <button
                    key={i}
                    onClick={() => setCurrentPage(i)}
                    className={`${baseButton} ${currentPage === i ? activeButton : inactiveButton}`}
                >
                    {i}
                </button>
            );
        }

        if (shouldShowRightDots) {
            pageButtons.push(
                <span key="right-dots" className="flex items-end pb-1 text-gray-400 font-semibold">
                    …
                </span>
            );
        }

        if (totalPages > 1) {
            pageButtons.push(
                <button
                    key={totalPages}
                    onClick={() => setCurrentPage(totalPages)}
                    className={`${baseButton} ${currentPage === totalPages ? activeButton : inactiveButton}`}
                >
                    {totalPages}
                </button>
            );
        }
        return pageButtons;
    };


    const handleToggleAdmin = async (id: number, newAdmin: boolean, targetEmail: string) => {
        try {
            const data = {
                id,
                newAdmin,
                currentUserEmail,
            };

            const res = await axios.post(API_ROUTES.EMPLOYEE, data, {
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (res.status === 200) {
                fetchEmployees();
            }
        } catch (error) {
            alert('You cannot change your own admin status.');
        }
    };

    const handleChangeRole = async (id: number, newRole: string, targetEmail: string) => {
        try {
            const data = {
                id,
                newRole,
                currentUserEmail,
            };

            const res = await axios.post(API_ROUTES.EMPLOYEE_ROLE, data, {
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (res.status === 200) {
                fetchEmployees();
            }
        } catch (error) {
            alert('Failed to update role.');
        }
    };

    return (
        <div className="p-2 min-h-[80vh] bg-[url('/Service_Icons/ServicesPageBackground.png')] bg-cover bg-center">
            <div className="ServiceRequests-3 px-4 py-8 max-w-8xl mx-auto">
                <h2 className="mt-4 titleFont text-center text-4xl font-bold text-[#385DA6]">
                    Employees
                </h2>
                <div className="titleFont my-4 flex flex-wrap items-center justify-between gap-4">
                    <input
                        id="search"
                        type="search"
                        name="search"
                        className="bg-white headerFont font-xl border border-gray-300 rounded px-4 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#385DA6] w-full md:max-w-md"
                        value={search}
                        onChange={e => {
                            setSearch(e.target.value);
                            setCurrentPage(1);
                        }}
                        placeholder="Search Employees..."
                    />
                </div>
                <EmployeeList
                    employees={paginatedRows}
                    isAdmin={!!isAdmin}
                    onToggleAdmin={handleToggleAdmin}
                    onChangeRole={handleChangeRole}
                    showEmpty={filteredAllRows.length === 0}
                    currentUserEmail={currentUserEmail}
                />
                <div className="flex justify-center mt-6 space-x-2">{renderPageButtons()}</div>
            </div>
        </div>
    );
};

export default EmployeeTable;

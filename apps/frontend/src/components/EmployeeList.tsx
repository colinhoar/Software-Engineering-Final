import React from 'react';

export type Employee = {
    id: number;
    name: string;
    email: string;
    role: string;
    isAdmin: boolean;
};

interface Props {  // actually made an interface coz I CANNOT be caught lacking after my lecture on using type any (im just adding comments coz I need this to look professional)
    employees: Employee[];
    isAdmin: boolean;
    onToggleAdmin: (employeeId: number, newAdmin: boolean, targetEmail: string) => void;
    onChangeRole: (employeeId: number, newRole: string, targetEmail: string) => void;
    showEmpty?: boolean;
    currentUserEmail: string | null;
}

const ROLE_LIST = [ 
    "Doctor",
    "Nurse",
    "Technician",
    "Receptionist",
    "Head of Department",
    "Other",
    "Neurosurgeon",
    "Pediatrician",
    "General Physician",
    "Cleaning Staff",
    "Pharmacy Technician",
];

const EmployeeList: React.FC<Props> = ({ // instead of making a call in this I just pass a props from employeetable coz thats better imp
                                           employees,
                                           isAdmin,
                                           onToggleAdmin,
                                           onChangeRole,
                                           showEmpty,
                                           currentUserEmail,
                                       }) => (
    <div className="overflow-x-auto rounded-lg shadow border border-gray-200">
        <table className="min-w-full border border-gray-300 rounded-md shadow-md bg-white">
            <thead className="textFont bg-gray-100 text-xs uppercase tracking-wider text-gray-500">
            <tr> {/*pls suggest more fieds the table looks kinda empty*/}
                <th className="px-6 py-3">Name</th>
                <th className="px-6 py-3">Email</th>
                <th className="px-6 py-3">Hospital Role</th>
                <th className="px-6 py-3">Admin</th>
            </tr>
            </thead>
            <tbody className="text-center text-sm text-gray-700">
            {showEmpty ? (
                <tr>
                    <td colSpan={4} className="px-6 py-4 text-gray-400 font-semibold">
                        No employees found.
                    </td>
                </tr>
            ) : (
                employees.map((emp, idx) => (
                    <tr
                        key={emp.id}
                        className={
                            idx % 2
                                ? 'bg-gray-100 hover:bg-gray-200'
                                : 'bg-white hover:bg-gray-200'
                        }
                    >
                        <td className="px-6 py-4">{emp.name}</td>
                        <td className="px-6 py-4">{emp.email}</td>
                        <td className="px-6 py-4">
                            {isAdmin ? (
                                <select
                                    value={emp.role || ""}
                                    onChange={e => onChangeRole(emp.id, e.target.value, emp.email)}
                                    className="border border-gray-300 rounded px-2 py-1 text-sm"
                                    disabled={emp.email === currentUserEmail}
                                >
                                    {ROLE_LIST.map(role => (
                                        <option key={role} value={role}>{role}</option> // idk why key is in red but if it aint broke..... XD im tweakin
                                    ))}
                                </select>
                            ) : (
                                emp.role
                            )}
                        </td>
                        <td className="px-6 py-4">
                            {isAdmin ? (
                                <select
                                    value={emp.isAdmin ? "Yes" : "No"}
                                    onChange={e => onToggleAdmin(emp.id, e.target.value === "Yes", emp.email)}
                                    className="border border-gray-300 rounded px-2 py-1 text-sm"
                                    disabled={emp.email === currentUserEmail}
                                >
                                    <option value="No">No</option>
                                    <option value="Yes">Yes</option>
                                </select>
                            ) : (
                                emp.isAdmin ? "Yes" : "No"
                            )}
                        </td>
                    </tr>
                ))
            )}
            </tbody>
        </table>
    </div>
);

export default EmployeeList;

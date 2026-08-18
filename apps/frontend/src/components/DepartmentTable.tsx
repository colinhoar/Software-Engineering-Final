import { useState, useEffect } from 'react';
import { fetchDepartments } from '../lib/utils.ts';
import { Prisma } from '../../../../packages/database/.prisma/client';

const DepartmentTable = () => {
    // values for departments dropdown
    const [departments, setDepartments] = useState<
        Prisma.DepartmentGetPayload<{ include: { building: true } }>[]
    >([
        {
            departmentID: -1,
            name: 'Loading...',
            services: 'Loading...',
            location: 'Loading...',
            buildingID: -1,
            building: {
                name: '',
                id: 0,
            },
            floor: "-1",
            phone: 'Loading...',
        },
    ]);

    useEffect(() => {
        fetchDepartments(10, 1000, false, setDepartments);
    }, []);

    return (
        <div className="flex justify-center bg-white-50 p-6">
            <div className="w-full max-w-5xl">
                <h1 className="titleFont flex flex-col mx-auto  text-center mb-5  titleFont text-center text-4xl font-bold text-[#385DA6]">
                    Departments Table
                </h1>
                <div className="overflow-x-auto rounded-lg shadow border border-gray-200 ">
                    <table className="min-w-full text-sm text-left text-gray-700">
                        <thead className="textFont bg-gray-100 text-xs uppercase tracking-wider text-gray-500">
                            <tr>
                                <th className="px-6 py-3">ID</th>
                                <th className="px-6 py-3">Name</th>
                                <th className="px-6 py-3">Services</th>
                                <th className="px-6 py-3">Floor</th>
                                <th className="px-6 py-3">Location</th>
                                <th className="px-6 py-3">Building</th>
                                <th className="px-6 py-3">Telephone</th>
                            </tr>
                        </thead>
                        <tbody className="textFont divide-y divide-gray-200 bg-white">
                            {departments.map((department, index) => (
                                <tr
                                    key={index}
                                    className={
                                        index % 2
                                            ? 'bg-gray-100  hover:bg-gray-200'
                                            : 'bg-white  hover:bg-gray-200'
                                    }
                                >
                                    <td className="px-6 py-4">{department.departmentID}</td>
                                    <td className="px-6 py-4">{department.name}</td>
                                    <td className="px-6 py-4">{department.services}</td>
                                    <td className="px-6 py-4">{department.floor}</td>
                                    <td className="px-6 py-4">{department.location}</td>
                                    <td className="px-6 py-4">{department.building.name}</td>
                                    <td className="px-6 py-4">{department.phone}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default DepartmentTable;

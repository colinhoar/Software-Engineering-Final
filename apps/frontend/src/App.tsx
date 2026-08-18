import React from 'react';
import { createBrowserRouter, RouterProvider, Outlet } from 'react-router-dom';

import Services from './pages/Services.tsx';
import Header from './components/header.tsx';
import Login from './pages/Login.tsx';
import HomePage from './pages/HomePage.tsx';
import NodeEditing from './pages/NodeEditing.tsx';
import SanitationRequest from './pages/Sanitation_Request.tsx';
import LanguageRequest from './pages/Language_Interpeter_Request.tsx';
import FacilityMaintenanceRequest from './pages/Facility_Maintenance_Request.tsx';
import PatientTransportationRequest from './pages/Patient_Transportation_Request.tsx';
import About from './pages/About.tsx';
import { AuthProvider } from './components/auth_context.tsx';
import ProtectedRoute from './components/protected_route.tsx';
import Signup from './pages/signup.tsx';
import ImportExport from './pages/ImportExport.tsx';
import Footer from './components/footer.tsx';
import MapPage from './pages/MapPage.tsx';
import ServiceRequests from './pages/ServiceRequests.tsx';
import Credits from './pages/Credits.tsx';
import manageAccounts from './pages/Manage_Account.tsx';
import '@fontsource-variable/newsreader';
import '@fontsource/noto-sans';
import '@fontsource/slabo-13px';
import Manage_Account from './pages/Manage_Account.tsx';
import AdminProtectedRoute from './components/AdminProtectedRoute.tsx';
import SecurityRequest from './pages/Security_Request.tsx';
import EmployeeTable from "./pages/EmployeeTable.tsx";
import SummaryPage from './pages/SummaryPage.tsx';
import { HandTrackingProvider } from './components/HandTrackingProvider';

const Layout = () => (
    <AuthProvider>
        <HandTrackingProvider>
            <main className={'h-screen flex flex-col justify-between'}>
                <Header />
                <section className={'flex-grow'}>
                    <div id={"myID"} className={"display-none"}></div>
                    <Outlet />
                </section>
                <Footer />
            </main>
        </HandTrackingProvider>
    </AuthProvider>
);

function App() {
    const router = createBrowserRouter([
        {
            path: '/',
            errorElement: (
                <div className="flex items-center justify-center min-h-screen">
                    <div className="text-center">
                        <h1 className="text-2xl font-bold mb-4">Oops! Something went wrong</h1>
                        <p className="text-gray-600">
                            Please try refreshing the page or contact support if the problem
                            persists.
                        </p>
                    </div>
                </div>
            ),
            element: <Layout />,
            children: [
                { path: '/', element: <HomePage /> },
                { path: '/signup', element: <Signup /> },
                { path: '/login', element: <Login /> },
                { path: '/navigation', element: <MapPage /> },
                {
                    path: '/services/sanitationrequest',
                    element: (
                        <ProtectedRoute>
                            <SanitationRequest />
                        </ProtectedRoute>
                    ),
                },
                {
                    path: '/services/languagerequest',
                    element: (
                        <ProtectedRoute>
                            <LanguageRequest />
                        </ProtectedRoute>
                    ),
                },
                {
                    path: '/services/facilitymaintenancerequest',
                    element: (
                        <ProtectedRoute>
                            <FacilityMaintenanceRequest />
                        </ProtectedRoute>
                    ),
                },
                {
                    path: '/services/patienttransportationrequest',
                    element: (
                        <ProtectedRoute>
                            <PatientTransportationRequest />
                        </ProtectedRoute>
                    ),
                },
                {
                    path: '/services/security-request',
                    element: (
                        <ProtectedRoute>
                            <SecurityRequest />
                        </ProtectedRoute>
                    ),
                },
                {
                    path: '/services',
                    element: (
                        <ProtectedRoute>
                            <Services />
                        </ProtectedRoute>
                    ),
                },
                {
                    path: '/services/importexport',
                    element: (
                        <ProtectedRoute>
                            <ImportExport />
                        </ProtectedRoute>
                    ),
                },
                {
                    path: '/services/summary',
                    element: (
                        <AdminProtectedRoute>
                            <SummaryPage />
                        </AdminProtectedRoute>
                    ),
                },
                {
                    path: '/services/servicerequests',
                    element: (
                        <ProtectedRoute>
                            <ServiceRequests />
                        </ProtectedRoute>
                    ),
                },
                {
                    path: '/services/mapediting',
                    element: (
                        <AdminProtectedRoute>
                            <NodeEditing />
                        </AdminProtectedRoute>
                    ),
                },
                {
                    path: '/manageAccounts',
                    element: (
                        <ProtectedRoute>
                            <Manage_Account />
                        </ProtectedRoute>
                    ),
                },
                { path: '/about', element: <About /> },
                { path: '/credits', element: <Credits /> },
                {
                    path: '/services/employee',
                    element: (
                        <AdminProtectedRoute>
                            <EmployeeTable />
                        </AdminProtectedRoute>
                    ),
                },
            ],
        },
    ]);

    return <RouterProvider router={router} />;
}

export default App;

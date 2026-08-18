import '../styles.css';
import { UploadCSVForm } from '../components/UploadCSVForm.tsx';
import { DownloadCSV } from '../components/DownloadCSV.tsx';
import DepartmentTable from '../components/DepartmentTable.tsx';

const ImportExport = () => {
    return (
        <main
            id="importexport"
            className="p-2 min-h-[80vh]  bg-[url('/Service_Icons/ServicesPageBackground.png')] bg-cover bg-center  "
        >
            <h2 className="titleFont flex flex-col mx-auto  text-center mb-5 mt-5 titleFont text-center text-4xl font-bold text-[#385DA6]">
                Import and Export Departments
            </h2>

            <UploadCSVForm />

            <DownloadCSV />
            <div>
                <br />

                <hr className="my-6 w-3/4 mx-auto border-t-4 border-[#385DA6]" />
            </div>
            <DepartmentTable />
        </main>
    );
};

export default ImportExport;

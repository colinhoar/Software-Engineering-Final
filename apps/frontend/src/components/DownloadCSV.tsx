import { API_ROUTES } from 'common/src/constants.ts';

export function DownloadCSV() {
    return (
        <div className={'flex justify-center'}>
            <button
                className={'headerFont exportImportButton buttonLook mt-5 hover:cursor-pointer'}
                onClick={() => (window.location.href = API_ROUTES.IMPORTEXPORT)}
            >
                Download
            </button>
        </div>
    );
}

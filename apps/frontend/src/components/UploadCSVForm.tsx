import { ChangeEvent, useState } from 'react';
import { API_ROUTES } from 'common/src/constants.ts';
import { ThankYouPopup } from './ThankYouPopup.tsx';

export function UploadCSVForm() {
    const [file, setFile] = useState<File>();
    const [showThankYou, setShowThankYou] = useState(false);
    const [uploadError, setUploadError] = useState(false);
    const [uploadErrorText, setUploadErrorText] = useState<string>(
        'An error occurred. The backend may not be ready.'
    );
    const [selectFile, setSelectFile] = useState(false);

    const handleSubmit = (event: { preventDefault: () => void }) => {
        event.preventDefault();
        if (file) {
            const formData = new FormData();
            formData.append('myCSV', file);
            fetch(API_ROUTES.IMPORTEXPORT, {
                method: 'POST',
                body: formData,
            }).then(async (r) => {
                if (r.status != 200) {
                    setSelectFile(false);
                    const errorText = await new Response(r.body).text();
                    if (errorText) {
                        setUploadErrorText(errorText);
                    }
                    setUploadError(true);
                } else {
                    setSelectFile(false);
                    setUploadError(false);
                    setShowThankYou(true);
                }
            });
        } else {
            setUploadError(false);
            setSelectFile(true);
            //alert('Please select a file!');
        }
    };
    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setFile(e.target.files[0]);
        }
    };

    return (
        <div>
            <form onSubmit={handleSubmit} className={'text-center'}>
                <input
                    type="file"
                    name="myCSV"
                    accept={'text/csv'}
                    className={
                        'headerFont bg-white file:p-2 border-2 rounded-2xl hover:bg-gray-200'
                    }
                    onChange={handleFileChange}
                />
                {selectFile && (
                    <p className={'text-red-500 text-md mt-2 textFont'}>Please select a file!</p>
                )}

                {uploadError && (
                    <p className={'text-red-500 text-md mt-2  textFont'}>{uploadErrorText}</p>
                )}
                <div className={'flex justify-center   '}>
                    <input
                        type="submit"
                        className={
                            'headerFont exportImportButton buttonLook  mt-5 hover:cursor-pointer  focus:outline-none focus:ring-2 focus:ring-[#385DA6]   '
                        }
                        value="Upload"
                    />
                </div>
            </form>
            <ThankYouPopup
                open={showThankYou}
                onClose={() => {
                    setShowThankYou(false);
                    location.reload();
                }}
                noRedirect={true}
                text={'CSV uploaded successfully!'}
                title={'Upload Successful'}
            />
        </div>
    );
}

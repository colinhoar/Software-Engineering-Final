import { useRef } from 'react';
import { toast, Toaster } from 'sonner';
import '../styles.css';

interface DisclaimerPopupProps {
    open: boolean;
    message: string;
    onClose: () => void;
}

export default function Disclaimer(props: DisclaimerPopupProps) {
    const shown = useRef(false);

    if (props.open && !shown.current) {
        shown.current = true;

        toast('Disclaimer', {
            description: props.message,
            duration: 5000,
            onAutoClose: props.onClose,
            onDismiss: props.onClose,
        });
    }

    return (
        <div>
            <Toaster
                position="top-center"
                className={"flex items-center justify-center"}
                toastOptions={{
                   className: "@xs:!w-full sm:!w-[59vw]",
                    style: {
                        backgroundColor: '#DFE9F2',
                        color: 'red',
                        fontSize: '0.670rem',
                        textAlign: 'left',
                        fontStyle: 'Noto Sans Variable',
                    },
                    closeButton: true,
                }}
            />
        </div>
    );
}

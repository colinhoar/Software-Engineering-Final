import React from 'react';

// An interface that defines the props the component accepts
interface ButtonProps {
    onClick: () => void;
    children: React.ReactNode;
    variant: 'primary' | 'secondary';
    disabled: boolean;
}

// ExampleButton component definition
const ExampleButton = ({ onClick, children, variant, disabled }: ButtonProps) => {
    return (
        <button
            className={`flex-1 ${variant == 'primary' ? ' bg-blue-600 hover:bg-blue-400 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-800'} font-semibold py-2 px-4 rounded border border-gray-400`}
            onClick={onClick}
            disabled={disabled}
        >
            {children}
        </button>
    );
};

// Export the component so it can be used in other files
export default ExampleButton;

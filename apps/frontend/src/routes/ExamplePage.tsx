import React from 'react';
import ExampleComponent from '../components/ExampleComponent.tsx';

const ExamplePage = () => {
    return (
        <div className="p-10">
            <h1 className="font-bold text-xl pb-4">Example Page</h1>
            <ExampleComponent></ExampleComponent>
        </div>
    );
};

export default ExamplePage;

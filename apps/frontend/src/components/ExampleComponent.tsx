import { useEffect, useState } from 'react';
import axios from 'axios';
import { API_ROUTES } from 'common/src/constants.ts';
import ExampleButton from './ExampleButton.tsx';
import Header from "../components/header.tsx";

// Component definition
const ExampleComponent = () => {
    // React useState hook — read more here: https://react.dev/reference/react/useState
    const [score, setScore] = useState(0);
    const [loading, setLoading] = useState(true);

    // React useEffect hook — read more here: https://react.dev/reference/react/useEffect
    // This will run on page load
    useEffect(() => {
        fetchScore();
    }, []);

    // Fetches the current score from the backend and updates the corresponding useStates
    async function fetchScore() {
        try {
            // Send a GET request to the backend at API_ROUTES.SCORE
            const res = await axios.get(API_ROUTES.SCORE);

            // HTTP 200 = OK (the request was successful)
            if (res.status === 200) {
                setLoading(false);

                // res.data holds a JSON object with a property called score
                // This object is created in the backend route (score.ts)
                // It's a good idea to define the property keys in a common constants file
                // To avoid potential runtime errors due to typos or missing properties
                // You can then use bracket notation to access these properties dynamically
                // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Property_accessors#bracket_notation
                setScore(res.data.score);
            }
            // HTTP 204 = No data (sent by the backend when the DB is empty)
            else if (res.status === 204) {
                // Set loading to false and use default value of score
                setLoading(false);
            }
        } catch (error) {
            console.log('Error fetching score, retrying:', error);

            // Retry the request after a short delay
            // During development, if the frontend loads before the backend, the request will fail
            setTimeout(() => fetchScore(), 1500);
        }
    }

    // Sends a post request to update the score
    async function submitScore() {
        try {
            // Build data JSON
            const data = JSON.stringify({
                time: new Date(),
                score: score,
            });

            const res = await axios.post(API_ROUTES.SCORE, data, {
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            // This will output in your browser console
            if (res.status == 200) {
                console.log('Added score');
            }
        } catch (error) {
            console.log('Error submitting score:', error);
        }
    }

    return (

        <div className="bg-gray-100 rounded-lg shadow-md p-6 w-64">
            <div className="text-2xl font-bold mb-4 text-center py-2 rounded">
                {loading ? 'Connecting...' : `Score: ${score}`}
            </div>
            <div className="flex flex-row gap-2">
                <ExampleButton
                    onClick={() => setScore(score - 1)}
                    variant="secondary"
                    disabled={loading}
                >
                    -
                </ExampleButton>
                <ExampleButton
                    onClick={() => setScore(score + 1)}
                    variant="secondary"
                    disabled={loading}
                >
                    +
                </ExampleButton>
                <ExampleButton onClick={() => submitScore()} variant="primary" disabled={loading}>
                    Submit
                </ExampleButton>
            </div>
        </div>

    );
};

export default ExampleComponent;
import React from 'react';

interface AdminSettingsProps {
    algorithm: string;
    setAlgorithm: (algo: string) => void;
    open: boolean;
    setOpen: (open: boolean) => void;
}

const AdminSettings: React.FC<AdminSettingsProps> = ({ algorithm, setAlgorithm, open, setOpen }) => {
    return (
        <div className={`fixed top-16 right-4 bg-white shadow-lg rounded-lg p-4 z-50 transition-all duration-300 ${open ? 'translate-x-0' : 'translate-x-full'}`}
             style={{ maxWidth: '300px' }}>
            <div className="flex justify-between items-center mb-4">
                <h3 className="headerFont font-bold text-lg">Admin Settings</h3>
                <button
                    onClick={() => setOpen(false)}
                    className="text-gray-500 hover:text-gray-700 text-xl"
                >
                    ✕
                </button>
            </div>

            <div className="mb-4">
                <label className="block textFont text-sm font-medium text-gray-700 mb-2">
                    Pathfinding Algorithm
                </label>
                <select
                    value={algorithm}
                    onChange={(e) => setAlgorithm(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded textFont"
                >
                    <option value="dijkstra">Dijkstra's Algorithm</option>
                    <option value="dfs">Depth-First Search (DFS)</option>
                </select>
                <p className="mt-2 textFont text-xs text-gray-600">
                    Dijkstra finds the shortest path. DFS explores deeply first.
                </p>
            </div>
        </div>
    );
};

export default AdminSettings;

import React from 'react';
import { Loader } from 'lucide-react'; // Or your custom SVG/CSS spinner

const AppLoader: React.FC = () => (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white">
        <Loader className="animate-spin text-green-600" size={48} />
        <p className="mt-4 text-gray-600">Loading application...</p>
    </div>
);

export default AppLoader;
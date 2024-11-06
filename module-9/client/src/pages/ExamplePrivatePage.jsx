import { useState, useEffect } from 'react';
import { getPrivateData } from '../api/privateAPI';
import { useAuth } from '../context/AuthContext';

const ExamplePrivatePage = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { user } = useAuth();

    useEffect(() => {
        const fetchPrivateData = async () => {
            try {
                const result = await getPrivateData();
                setData(result);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchPrivateData();
    }, []);

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-6">Private Page</h1>
            <div className="bg-white shadow rounded-lg p-6">
                <h2 className="text-xl font-semibold mb-4">Welcome {user.name}!</h2>
                <div className="mb-4">
                    <h3 className="font-medium mb-2">Private Data:</h3>
                    <pre className="bg-gray-100 p-4 rounded">
                        {JSON.stringify(data, null, 2)}
                    </pre>
                </div>
            </div>
        </div>
    );
};

export default ExamplePrivatePage;
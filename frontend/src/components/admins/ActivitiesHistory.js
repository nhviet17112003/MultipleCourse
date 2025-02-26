import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function ActivitiesHistory() {
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const token = localStorage.getItem('authToken');

    useEffect(() => {
        axios.get('http://localhost:3000/api/admin-activity/', {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
            .then(res => {
                setActivities(res.data);
                setLoading(false);
            })
            .catch(err => {
                setError(err.message);
                setLoading(false);
            });
    }, [token]);

    if (loading) return <h1 className="text-center text-xl font-bold mt-10">Loading...</h1>;
    if (error) return <h1 className="text-center text-red-500 text-xl font-bold mt-10">Error: {error}</h1>;

    return (
        <div className="max-w-4xl mx-auto p-6 bg-white shadow-lg rounded-lg mt-10">
            <h1 className="text-2xl font-semibold text-gray-800 mb-4">Activities History</h1>
            <div className="overflow-x-auto">
                <table className="w-full border border-gray-300 rounded-lg">
                    <thead>
                        <tr className="bg-gray-200">
                            <th className="py-2 px-4 text-left">Activity</th>
                            <th className="py-2 px-4 text-left">Time</th>
                        </tr>
                    </thead>
                    <tbody>
                        {activities.map(activity => (
                            <tr key={activity._id} className="border-t border-gray-300">
                                <td className="py-2 px-4">{activity.description}</td>
                                <td className="py-2 px-4">{new Date(activity.entry_date).toLocaleDateString()}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

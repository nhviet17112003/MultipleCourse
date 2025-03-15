import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Space, Table } from 'antd';

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
    //columns
    const columns = [
        {
          title: 'Activity',
          dataIndex: 'activity',
          key: 'activity',
          render: (activity) => <a>{activity}</a>,
        },
        {
          title: 'Time',
          dataIndex: 'time',
          key: 'time',
          render: (time) => <a>{time}</a>,
        },
     
    
      ];
      const data = activities.map((activity, index) => ({
        key: index,
        activity: activity.description,
        time: new Date(activity.entry_date).toLocaleDateString()
      }))
      

    return (
        <div className="container mx-auto p-6 max-h-screen">
            <h1 className="text-3xl font-bold text-center mb-6">Activities History</h1>
            <div className="overflow-x-auto">
                <Table columns={columns} dataSource={data} />
                {/* <table className="min-w-full bg-white shadow-md rounded-lg overflow-hidden">
                    <thead className='bg-teal-600 text-white'>
                        <tr className="">
                            <th className="border border-gray-300 px-4 py-2 text-left">Activity</th>
                            <th className="border border-gray-300 px-4 py-2 text-left">Time</th>
                        </tr>
                    </thead>
                    <tbody>
                        {activities.map(activity => (
                            <tr key={activity._id} className="border-t border-gray-300">
                                <td className="border border-gray-300 px-4 py-2">{activity.description}</td>
                                <td className="border border-gray-300 px-4 py-2">{new Date(activity.entry_date).toLocaleDateString()}</td>
                            </tr>
                        ))}
                    </tbody>
                </table> */}
            </div>
        </div>
    );
}

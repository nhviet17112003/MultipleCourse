import { Table } from "antd";
import React, { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const StatisticForAdmin = () => {
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [revenueToday, setRevenueToday] = useState(0);
  const [revenueYear, setRevenueYear] = useState(0);
  const [monthlyRevenue, setMonthlyRevenue] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async (url, setState) => {
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      setState(data);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    fetchData("http://localhost:3000/api/orders/revenue", (data) =>
      setTotalRevenue(data.totalRevenue)
    );
    fetchData("http://localhost:3000/api/orders/revenue-day", (data) =>
      setRevenueToday(data.totalRevenueToday)
    );
    fetchData("http://localhost:3000/api/orders/revenue-year", (data) =>
      setRevenueYear(data.totalRevenueThisYear)
    );
    fetchData("http://localhost:3000/api/orders/revenue-each-month", setMonthlyRevenue);
    fetchData("http://localhost:3000/api/orders/all-orders", setOrders);

    setLoading(false);
  }, []);
  console.log(orders);

  if (loading) {
    return <p className="text-center text-gray-600">Loading data...</p>;
  }

  const columns = [
    {
      title: "Buyer",
      dataIndex: "buyer",
      key: "buyer",
    },
    {
      title: "Amount",
      dataIndex: "amount",
      key: "amount",
    },
    {
      title: "Order",
      dataIndex: "order",
      key: "order",
    },
  ];

  const data = orders.map((order) => ({
    key: order._id,
    buyer: order.user?.fullname || "Anonymous",
    amount: order.total_price + " VND",
    order: new Date(order.order_date).toLocaleDateString(),
  }));

  return (
    <div className="container mx-auto p-6 max-h-screen">
      <h1 className="text-3xl font-bold text-center mb-6">Revenue Statistics</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
        <div className="bg-white p-6 shadow rounded-lg text-center">
          <h2 className="text-xl font-semibold text-gray-700">Total revenue</h2>
          <p className="text-2xl text-teal-600">{totalRevenue} VND</p>
        </div>
        <div className="bg-white p-6 shadow rounded-lg text-center">
          <h2 className="text-xl font-semibold text-gray-700">Today's Revenue</h2>
          <p className="text-2xl text-teal-600">{revenueToday} VND</p>
        </div>
        <div className="bg-white p-6 shadow rounded-lg text-center">
          <h2 className="text-xl font-semibold text-gray-700">Revenue this year</h2>
          <p className="text-2xl text-teal-600">{revenueYear} VND</p>
        </div>
      </div>

      <h2 className="text-2xl font-semibold text-gray-700 mt-8">Monthly Revenue</h2>
      <div className="mt-4 bg-white p-6 shadow rounded-lg">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={monthlyRevenue}>
            <XAxis dataKey="month" stroke="#8884d8" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="revenue" fill="#82ca9d" barSize={50} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <h2 className="text-3xl font-bold text-center mb-6 mt-8">Order List</h2>
      <div className="overflow-x-auto">
        <Table columns={columns} dataSource={data} />
        {/* <table className="min-w-full bg-white shadow-md rounded-lg overflow-hidden">
          <thead className="bg-teal-600 text-white">
            <tr>
            
              <th className="border border-gray-300 px-4 py-2">Buyer</th>
              <th className="border border-gray-300 px-4 py-2">Amount</th>
              <th className="border border-gray-300 px-4 py-2">Order</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order._id} className="border-b text-center">
              
                <td className="border border-gray-300 px-4 py-2">{order.user?.fullname || "Anonymous"}</td>
                <td className="border border-gray-300 px-4 py-2">{order.total_price} VND</td>
                <td className="border border-gray-300 px-4 py-2">{new Date(order.order_date).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table> */}
      </div>
    </div>
  );
};

export default StatisticForAdmin;
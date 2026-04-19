import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

const AnalyticsDashboard = ({ lands }) => {
    // 1. Data Processing
    // Status Distribution (Verified vs Pending)
    const statusData = [
        { name: 'Verified', value: lands.filter(l => l.verified).length },
        { name: 'Pending', value: lands.filter(l => !l.verified).length },
    ];

    // Price by Village
    const villageData = lands.reduce((acc, land) => {
        const existing = acc.find(item => item.name === land.village);
        if (existing) {
            existing.value += land.price;
            existing.count += 1;
        } else {
            acc.push({ name: land.village, value: land.price, count: 1 });
        }
        return acc;
    }, []);

    // Average Price Calculation for Village Chart
    const chartData = villageData.map(v => ({
        name: v.name,
        avgPrice: Math.round(v.value / v.count)
    }));

    const COLORS = ['#10B981', '#F59E0B']; // Green, Amber

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in">
            {/* Pie Chart: Status Distribution */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                <h3 className="text-lg font-bold mb-4 text-gray-800 dark:text-gray-200">Land Status Distribution</h3>
                <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={statusData}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                fill="#8884d8"
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {statusData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Bar Chart: Average Price by Village */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                <h3 className="text-lg font-bold mb-4 text-gray-800 dark:text-gray-200">Avg Land Value by Village</h3>
                <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip formatter={(value) => `₹${value.toLocaleString()}`} />
                            <Legend />
                            <Bar dataKey="avgPrice" name="Avg Price (₹)" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="col-span-1 lg:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-100 dark:border-blue-800">
                    <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">Total Lands</p>
                    <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">{lands.length}</p>
                </div>
                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-100 dark:border-green-800">
                    <p className="text-sm text-green-600 dark:text-green-400 font-medium">Total Value</p>
                    <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                        ₹{(lands.reduce((sum, l) => sum + l.price, 0) / 10000000).toFixed(2)} Cr
                    </p>
                </div>
                <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg border border-purple-100 dark:border-purple-800">
                    <p className="text-sm text-purple-600 dark:text-purple-400 font-medium">Avg Area</p>
                    <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                        {Math.round(lands.reduce((sum, l) => sum + l.area, 0) / (lands.length || 1))} sq.ft
                    </p>
                </div>
            </div>
        </div>
    );
};

export default AnalyticsDashboard;

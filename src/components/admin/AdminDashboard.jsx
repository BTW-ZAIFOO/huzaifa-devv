import React, { useState } from 'react';

const AdminDashboard = ({ users, onBlockUser, onReportUser, onViewUserChat }) => {
    const [filter, setFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');

    const totalUsers = users.filter(user => user.role !== 'admin').length;
    const onlineUsers = users.filter(user => user.status === 'online' && user.role !== 'admin').length;
    const blockedUsers = users.filter(user => user.status === 'blocked').length;
    const bannedUsers = users.filter(user => user.status === 'banned').length;
    const reportedUsers = users.filter(user => user.isReported).length;
    const flaggedUsers = users.filter(user => user.flaggedWords && user.flaggedWords.length > 0).length;

    const filteredUsers = users.filter(user => {

        if (user.role === 'admin') return false;
        if (filter === 'online' && user.status !== 'online') return false;
        if (filter === 'offline' && user.status !== 'offline') return false;
        if (filter === 'blocked' && user.status !== 'blocked') return false;
        if (filter === 'banned' && user.status !== 'banned') return false;
        if (filter === 'reported' && !user.isReported) return false;
        if (filter === 'flagged' && (!user.flaggedWords || user.flaggedWords.length === 0)) return false;
        if (searchTerm && !user.name.toLowerCase().includes(searchTerm.toLowerCase())) return false;

        return true;
    });

    return (
        <div className="flex-1 p-6 bg-gray-50">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-800 mb-2">Admin Dashboard</h1>
                <p className="text-gray-600">Manage users, moderate content, and monitor chat activities</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                <StatCard
                    title="Total Users"
                    value={totalUsers}
                    icon="fa-users"
                    color="blue"
                    onClick={() => setFilter('all')}
                    active={filter === 'all'}
                />
                <StatCard
                    title="Online Users"
                    value={onlineUsers}
                    icon="fa-circle"
                    color="green"
                    onClick={() => setFilter('online')}
                    active={filter === 'online'}
                />
                <StatCard
                    title="Blocked Users"
                    value={blockedUsers}
                    icon="fa-ban"
                    color="red"
                    onClick={() => setFilter('blocked')}
                    active={filter === 'blocked'}
                />
                <StatCard
                    title="Banned Users"
                    value={bannedUsers}
                    icon="fa-user-slash"
                    color="gray"
                    onClick={() => setFilter('banned')}
                    active={filter === 'banned'}
                />
                <StatCard
                    title="Reported Users"
                    value={reportedUsers}
                    icon="fa-flag"
                    color="yellow"
                    onClick={() => setFilter('reported')}
                    active={filter === 'reported'}
                />
                <StatCard
                    title="Flagged Content"
                    value={flaggedUsers}
                    icon="fa-exclamation-triangle"
                    color="orange"
                    onClick={() => setFilter('flagged')}
                    active={filter === 'flagged'}
                />
            </div>
            <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold text-gray-800">User Management</h2>
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search users..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                        />
                        <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Activity</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Flags</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredUsers.length > 0 ? (
                                filteredUsers.map((user) => (
                                    <tr key={user.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="flex-shrink-0 h-10 w-10 relative">
                                                    <img
                                                        className="h-10 w-10 rounded-full object-cover border border-gray-200"
                                                        src={user.avatar}
                                                        alt={user.name}
                                                    />
                                                    <span className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white ${user.status === 'online' ? 'bg-green-500' :
                                                        user.status === 'blocked' ? 'bg-red-500' :
                                                            user.status === 'banned' ? 'bg-black' : 'bg-gray-400'
                                                        }`}></span>
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-gray-900">{user.name}</div>
                                                    <div className="text-xs text-gray-500">{user.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${user.status === 'online' ? 'bg-green-100 text-green-800' :
                                                user.status === 'offline' ? 'bg-gray-100 text-gray-800' :
                                                    user.status === 'blocked' ? 'bg-red-100 text-red-800' :
                                                        'bg-black text-white'
                                                }`}>
                                                {user.status === 'online' ? 'Online' :
                                                    user.status === 'offline' ? 'Offline' :
                                                        user.status === 'blocked' ? 'Blocked' : 'Banned'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">{user.lastActivity || 'No activity'}</div>
                                            <div className="text-xs text-gray-500">{user.lastActivityTime || ''}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {user.flaggedWords && user.flaggedWords.length > 0 ? (
                                                <span className="bg-red-100 text-red-800 text-xs px-2.5 py-0.5 rounded-full">
                                                    {user.flaggedWords.length} flagged terms
                                                </span>
                                            ) : (
                                                <span className="text-gray-500 text-xs">No flags</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                            <button
                                                onClick={() => onViewUserChat(user)}
                                                className="text-blue-600 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 p-1 rounded"
                                                title="View Chat"
                                            >
                                                <i className="fas fa-comments"></i>
                                            </button>
                                            <button
                                                onClick={() => onBlockUser(user.id, 'block')}
                                                className={`${user.status === 'blocked' ? 'text-green-600 hover:text-green-900 bg-green-50 hover:bg-green-100' : 'text-red-600 hover:text-red-900 bg-red-50 hover:bg-red-100'} p-1 rounded`}
                                                title={user.status === 'blocked' ? 'Unblock User' : 'Block User'}
                                            >
                                                <i className={`fas ${user.status === 'blocked' ? 'fa-unlock' : 'fa-ban'}`}></i>
                                            </button>
                                            <button
                                                onClick={() => onBlockUser(user.id, 'ban')}
                                                className={`${user.status === 'banned' ? 'text-green-600 hover:text-green-900 bg-green-50 hover:bg-green-100' : 'text-gray-700 hover:text-black bg-gray-50 hover:bg-gray-100'} p-1 rounded`}
                                                title={user.status === 'banned' ? 'Unban User' : 'Ban User'}
                                            >
                                                <i className={`fas ${user.status === 'banned' ? 'fa-user-check' : 'fa-user-slash'}`}></i>
                                            </button>
                                            <button
                                                onClick={() => onReportUser(user.id)}
                                                className={`${user.isReported ? 'text-purple-600 hover:text-purple-900 bg-purple-50 hover:bg-purple-100' : 'text-yellow-600 hover:text-yellow-900 bg-yellow-50 hover:bg-yellow-100'} p-1 rounded`}
                                                title={user.isReported ? 'Remove Report' : 'Report User'}
                                            >
                                                <i className={`fas ${user.isReported ? 'fa-flag-checkered' : 'fa-flag'}`}></i>
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                                        No users found matching the current filter
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

const StatCard = ({ title, value, icon, color, onClick, active }) => {
    const colorClasses = {
        blue: {
            bg: active ? 'bg-blue-600' : 'bg-white hover:bg-blue-50',
            icon: active ? 'bg-blue-700' : 'bg-blue-100',
            text: active ? 'text-white' : 'text-blue-600',
            value: active ? 'text-white' : 'text-gray-800',
            border: active ? '' : 'border border-blue-200'
        },
        green: {
            bg: active ? 'bg-green-600' : 'bg-white hover:bg-green-50',
            icon: active ? 'bg-green-700' : 'bg-green-100',
            text: active ? 'text-white' : 'text-green-600',
            value: active ? 'text-white' : 'text-gray-800',
            border: active ? '' : 'border border-green-200'
        },
        red: {
            bg: active ? 'bg-red-600' : 'bg-white hover:bg-red-50',
            icon: active ? 'bg-red-700' : 'bg-red-100',
            text: active ? 'text-white' : 'text-red-600',
            value: active ? 'text-white' : 'text-gray-800',
            border: active ? '' : 'border border-red-200'
        },
        yellow: {
            bg: active ? 'bg-yellow-600' : 'bg-white hover:bg-yellow-50',
            icon: active ? 'bg-yellow-700' : 'bg-yellow-100',
            text: active ? 'text-white' : 'text-yellow-600',
            value: active ? 'text-white' : 'text-gray-800',
            border: active ? '' : 'border border-yellow-200'
        },
        orange: {
            bg: active ? 'bg-orange-600' : 'bg-white hover:bg-orange-50',
            icon: active ? 'bg-orange-700' : 'bg-orange-100',
            text: active ? 'text-white' : 'text-orange-600',
            value: active ? 'text-white' : 'text-gray-800',
            border: active ? '' : 'border border-orange-200'
        },
        gray: {
            bg: active ? 'bg-gray-600' : 'bg-white hover:bg-gray-50',
            icon: active ? 'bg-gray-700' : 'bg-gray-100',
            text: active ? 'text-white' : 'text-gray-600',
            value: active ? 'text-white' : 'text-gray-800',
            border: active ? '' : 'border border-gray-200'
        }
    };

    const classes = colorClasses[color] || colorClasses.blue;

    return (
        <button
            onClick={onClick}
            className={`${classes.bg} ${classes.border} p-6 rounded-lg shadow-sm transition-all duration-200 hover:shadow flex items-center justify-between`}
        >
            <div>
                <div className={`text-sm font-medium mb-1 ${classes.text}`}>{title}</div>
                <div className={`text-2xl font-bold ${classes.value}`}>{value}</div>
            </div>
            <div className={`w-12 h-12 rounded-lg ${classes.icon} flex items-center justify-center ${classes.text}`}>
                <i className={`fas ${icon} text-lg`}></i>
            </div>
        </button>
    );
};

export default AdminDashboard;

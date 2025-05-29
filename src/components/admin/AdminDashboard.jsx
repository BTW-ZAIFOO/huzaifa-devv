import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { getAvatarByRole } from '../../utils/avatarUtils';

const AdminDashboard = ({ users, onBlockUser, onReportUser, onViewUserChat, onBanUser, flaggedUsers = {} }) => {
    const [filter, setFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('name');
    const [sortDirection, setSortDirection] = useState('asc');
    const getUserCount = (condition) => users ? users.filter(condition).length : 0;
    const totalUsers = getUserCount(user => user.role !== 'admin');
    const onlineUsers = getUserCount(user => user.status === 'online' && user.role !== 'admin');
    const blockedUsers = getUserCount(user => user.status === 'blocked');
    const bannedUsers = getUserCount(user => user.status === 'banned');
    const reportedUsers = getUserCount(user => user.isReported);
    const flaggedContent = getUserCount(user => (user.flaggedWords && user.flaggedWords.length > 0) || flaggedUsers[user._id || user.id]);

    if (!users || users.length === 0) {
        return (
            <div className="flex-1 p-6 bg-gray-50 flex flex-col items-center justify-center">
                <div className="bg-white rounded-lg p-8 shadow text-center max-w-md">
                    <div className="text-5xl text-gray-300 mb-4">
                        <i className="fas fa-users-slash"></i>
                    </div>
                    <h2 className="text-xl font-bold text-gray-700 mb-2">No Users Found</h2>
                    <p className="text-gray-500 mb-4">
                        There are currently no users in the system or the user data could not be loaded.
                    </p>
                </div>
            </div>
        );
    }

    let filteredUsers = [...users].filter(user => {
        if (user.role === 'admin') return false;

        const filterConditions = {
            'online': user.status === 'online',
            'offline': user.status === 'offline',
            'blocked': user.status === 'blocked',
            'banned': user.status === 'banned',
            'reported': user.isReported,
            'flagged': (user.flaggedWords && user.flaggedWords.length > 0) || flaggedUsers[user._id || user.id],
            'all': true
        };

        if (!filterConditions[filter]) return false;

        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            return (
                (user.name && user.name.toLowerCase().includes(term)) ||
                (user.email && user.email.toLowerCase().includes(term))
            );
        }

        return true;
    });

    filteredUsers.sort((a, b) => {
        let compareA, compareB;

        switch (sortBy) {
            case 'name':
                compareA = a.name || '';
                compareB = b.name || '';
                break;
            case 'status':
                compareA = a.status || '';
                compareB = b.status || '';
                break;
            case 'activity':
                compareA = a.lastActivityTime || '';
                compareB = b.lastActivityTime || '';
                break;
            case 'flags':
                const aFlags = (a.flaggedWords?.length || 0) + (flaggedUsers[a._id || a.id]?.length || 0);
                const bFlags = (b.flaggedWords?.length || 0) + (flaggedUsers[b._id || b.id]?.length || 0);
                compareA = aFlags;
                compareB = bFlags;
                break;
            default:
                compareA = a.name || '';
                compareB = b.name || '';
        }

        return sortDirection === 'asc' ? (compareA > compareB ? 1 : -1) : (compareA < compareB ? 1 : -1);
    });

    const handleSortClick = (column) => {
        if (sortBy === column) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(column);
            setSortDirection('asc');
        }
    };

    const handleBanUserClick = (userId) => {
        onBanUser(userId, "Banned by admin via dashboard");
    };

    const handleReportUserClick = (userId) => {
        const user = users.find(u => u._id === userId || u.id === userId);
        if (!user) {
            toast.error("User not found");
            return;
        }

        if (user.isReported) {
            if (window.confirm(`Remove report from ${user.name}?`)) {
                onReportUser(userId);
            }
        } else {
            const reason = prompt("Please provide a detailed reason for reporting this user:");
            if (reason && reason.trim() !== "") {
                onReportUser(userId, reason.trim());
                toast.success(`Report submitted for ${user.name} with reason: "${reason}"`, {
                    autoClose: 5000
                });
            } else {
                toast.error("Report cancelled: A reason is required");
            }
        }
    };

    return (
        <>
            <div className="flex-1 p-6 bg-gray-50 h-full overflow-auto">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-gray-800 mb-2">Admin Dashboard</h1>
                    <p className="text-gray-600">Manage users, moderate content, and monitor chat activities</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                    {[
                        {
                            title: "Total Users",
                            value: totalUsers,
                            icon: "fa-users",
                            color: "blue",
                            filterName: "all"
                        },
                        {
                            title: "Online Users",
                            value: onlineUsers,
                            icon: "fa-circle",
                            color: "green",
                            filterName: "online"
                        },
                        {
                            title: "Blocked Users",
                            value: blockedUsers,
                            icon: "fa-ban",
                            color: "red",
                            filterName: "blocked"
                        },
                        {
                            title: "Banned Users",
                            value: bannedUsers,
                            icon: "fa-user-slash",
                            color: "gray",
                            filterName: "banned"
                        },
                        {
                            title: "Reported Users",
                            value: reportedUsers,
                            icon: "fa-flag",
                            color: "yellow",
                            filterName: "reported"
                        },
                        {
                            title: "Flagged Content",
                            value: flaggedContent,
                            icon: "fa-exclamation-triangle",
                            color: "orange",
                            filterName: "flagged"
                        }
                    ].map((stat) => (
                        <StatCard
                            key={stat.title}
                            title={stat.title}
                            value={stat.value}
                            icon={stat.icon}
                            color={stat.color}
                            onClick={() => setFilter(stat.filterName)}
                            active={filter === stat.filterName}
                        />
                    ))}
                </div>
                <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
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
                                    {['name', 'status', 'activity', 'flags'].map((column) => (
                                        <th
                                            key={column}
                                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                                            onClick={() => handleSortClick(column)}
                                        >
                                            {column === 'name' ? 'User' :
                                                column === 'activity' ? 'Last Activity' :
                                                    column.charAt(0).toUpperCase() + column.slice(1)}
                                            {sortBy === column && (
                                                <i className={`fas fa-sort-${sortDirection === 'asc' ? 'up' : 'down'} ml-1`}></i>
                                            )}
                                        </th>
                                    ))}
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredUsers.length > 0 ? (
                                    filteredUsers.map((user) => {
                                        const userId = user._id || user.id;
                                        const userFlaggedWords = [
                                            ...(user.flaggedWords || []),
                                            ...(flaggedUsers[userId] || [])
                                        ];

                                        const avatar = getAvatarByRole(user);
                                        const getBorderStyle = () => {
                                            if (user.isReported) return "border-l-4 border-yellow-500 ";
                                            if (user.status === 'banned') return "border-l-4 border-black ";
                                            if (user.status === 'blocked') return "border-l-4 border-red-500 ";
                                            if (userFlaggedWords.length > 0) return "bg-red-50 ";
                                            return "";
                                        };

                                        const getStatusStyle = () => {
                                            const styles = {
                                                'online': 'bg-green-100 text-green-800',
                                                'offline': 'bg-gray-100 text-gray-800',
                                                'blocked': 'bg-red-100 text-red-800',
                                                'banned': 'bg-black text-white'
                                            };
                                            return styles[user.status] || styles.offline;
                                        };

                                        return (
                                            <tr key={userId} className={`hover:bg-gray-50 ${getBorderStyle()}`}>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <div className="flex-shrink-0 h-10 w-10 relative">
                                                            {avatar.imageUrl ? (
                                                                <img
                                                                    className="h-10 w-10 rounded-full object-cover border border-gray-200"
                                                                    src={avatar.imageUrl}
                                                                    alt={user.name}
                                                                />
                                                            ) : (
                                                                <div
                                                                    className="h-10 w-10 rounded-full border border-gray-200 flex items-center justify-center text-white text-sm"
                                                                    style={{ backgroundColor: avatar.color }}
                                                                >
                                                                    {avatar.initials}
                                                                </div>
                                                            )}
                                                            <span className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white ${user.status === 'online' ? 'bg-green-500' :
                                                                user.status === 'blocked' ? 'bg-red-500' :
                                                                    user.status === 'banned' ? 'bg-black' : 'bg-gray-400'
                                                                }`}></span>
                                                        </div>
                                                        <div className="ml-4">
                                                            <div className="text-sm font-medium text-gray-900 flex items-center">
                                                                {user.name}
                                                                {user.reportedBy && (
                                                                    <span className="ml-2 bg-yellow-100 text-yellow-800 text-xs px-1.5 py-0.5 rounded-full inline-flex items-center">
                                                                        <i className="fas fa-flag text-xs mr-1"></i> Reported
                                                                    </span>
                                                                )}
                                                                {user.bannedBy && (
                                                                    <span className="ml-2 bg-black text-white text-xs px-1.5 py-0.5 rounded-full inline-flex items-center">
                                                                        <i className="fas fa-gavel text-xs mr-1"></i> Banned
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <div className="text-xs text-gray-500">{user.email}</div>
                                                            {user.notifications && user.notifications.length > 0 && (
                                                                <div className="mt-1">
                                                                    <span className="text-xs bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded-full">
                                                                        {user.notifications.length} notifications
                                                                    </span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusStyle()}`}>
                                                        {user.status === 'online' ? 'Online' :
                                                            user.status === 'offline' ? 'Offline' :
                                                                user.status === 'blocked' ? 'Blocked' : 'Banned'}
                                                    </span>
                                                    {(user.blockedBy || user.bannedBy) && (
                                                        <div className="text-xs text-gray-500 mt-1">
                                                            by {user.blockedBy || user.bannedBy}
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-900">{user.lastActivity || 'No activity'}</div>
                                                    <div className="text-xs text-gray-500">{user.lastActivityTime || ''}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    {userFlaggedWords.length > 0 ? (
                                                        <div>
                                                            <span className="bg-red-100 text-red-800 text-xs px-2.5 py-0.5 rounded-full">
                                                                {userFlaggedWords.length} flagged terms
                                                            </span>
                                                            <div className="mt-1 text-xs text-gray-600">
                                                                {userFlaggedWords.slice(0, 3).map((word, idx) => (
                                                                    <span key={idx} className="bg-red-50 text-red-700 px-1 py-0.5 rounded mr-1">
                                                                        {word}
                                                                    </span>
                                                                ))}
                                                                {userFlaggedWords.length > 3 && (
                                                                    <span className="text-xs text-gray-500">+{userFlaggedWords.length - 3} more</span>
                                                                )}
                                                            </div>
                                                        </div>
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
                                                        onClick={() => onBlockUser(userId, 'block')}
                                                        className={`${user.status === 'blocked' ? 'text-green-600 hover:text-green-900 bg-green-50 hover:bg-green-100' : 'text-red-600 hover:text-red-900 bg-red-50 hover:bg-red-100'} p-1 rounded`}
                                                        title={user.status === 'blocked' ? 'Unblock User' : 'Block User'}
                                                    >
                                                        <i className={`fas ${user.status === 'blocked' ? 'fa-unlock' : 'fa-ban'}`}></i>
                                                    </button>
                                                    <button
                                                        onClick={() => handleBanUserClick(userId)}
                                                        className={`${user.status === 'banned' ? 'text-green-600 hover:text-green-900 bg-green-50 hover:bg-green-100' : 'text-gray-700 hover:text-black bg-gray-50 hover:bg-gray-100'} p-1 rounded`}
                                                        title={user.status === 'banned' ? 'Unban User' : 'Ban User'}
                                                    >
                                                        <i className={`fas ${user.status === 'banned' ? 'fa-user-check' : 'fa-user-slash'}`}></i>
                                                    </button>
                                                    <button
                                                        onClick={() => handleReportUserClick(userId)}
                                                        className={`${user.isReported ? 'text-purple-600 hover:text-purple-900 bg-purple-50 hover:bg-purple-100' : 'text-yellow-600 hover:text-yellow-900 bg-yellow-50 hover:bg-yellow-100'} p-1 rounded`}
                                                        title={user.isReported ? `Remove report: "${user.reportReason || 'No reason provided'}"` : 'Report User'}
                                                    >
                                                        <i className={`fas ${user.isReported ? 'fa-flag-checkered' : 'fa-flag'}`}></i>
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-10 text-center text-gray-500">
                                            <div className="flex flex-col items-center">
                                                <i className="fas fa-search text-3xl text-gray-300 mb-2"></i>
                                                <span>No users found matching the current filter</span>
                                                {filter !== 'all' && (
                                                    <button
                                                        onClick={() => setFilter('all')}
                                                        className="mt-2 text-sm text-blue-600 hover:text-blue-800"
                                                    >
                                                        Clear filters
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {filteredUsers.length > 0 && filteredUsers.length > 10 && (
                        <div className="flex justify-between items-center mt-4">
                            <div className="text-sm text-gray-500">
                                Showing {filteredUsers.length} of {totalUsers} users
                            </div>
                            <div className="space-x-1">
                                <button className="px-3 py-1 bg-white border border-gray-300 rounded text-gray-700 hover:bg-gray-50">
                                    <i className="fas fa-chevron-left"></i>
                                </button>
                                <button className="px-3 py-1.5 bg-blue-50 border border-blue-200 rounded text-blue-700">1</button>
                                <button className="px-3 py-1 bg-white border border-gray-300 rounded text-gray-700 hover:bg-gray-50">
                                    <i className="fas fa-chevron-right"></i>
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
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

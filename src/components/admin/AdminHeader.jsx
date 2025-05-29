import React from 'react';
import { Link } from 'react-router-dom';
import { getAvatarByRole } from '../../utils/avatarUtils';

const AdminHeader = ({ user, onLogout }) => {
    const avatar = getAvatarByRole(user);

    return (
        <header className="bg-purple-900 text-white shadow-md py-4 px-6 flex justify-between items-center">
            <Link to="/admin" className="text-xl font-bold flex items-center">
                <i className="fas fa-shield-alt mr-2"></i> Admin Dashboard
            </Link>

            <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                    {avatar.imageUrl ? (
                        <img
                            src={avatar.imageUrl}
                            alt={user?.name}
                            className="w-8 h-8 rounded-full"
                        />
                    ) : (
                        <div
                            className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm"
                            style={{ backgroundColor: avatar.color }}
                        >
                            {avatar.initials}
                        </div>
                    )}
                    <span>{user?.name || "Admin"}</span>
                </div>

                {onLogout && (
                    <button
                        onClick={onLogout}
                        className="bg-purple-800 hover:bg-purple-700 px-3 py-1 rounded text-sm"
                    >
                        <i className="fas fa-sign-out-alt mr-1"></i> Logout
                    </button>
                )}
            </div>
        </header>
    );
};

export default AdminHeader;

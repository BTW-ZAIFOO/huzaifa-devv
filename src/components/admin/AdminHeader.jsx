import React from 'react';
import { Link } from 'react-router-dom';
import { getAvatarByRole } from '../../utils/avatarUtils';

// AdminHeader component displays the header for the admin dashboard.
// It shows the dashboard title, user avatar, user name, and a logout button.
const AdminHeader = ({ user, onLogout }) => {

    // Get avatar details (image, initials, color) based on the user's role.
    const avatar = getAvatarByRole(user);

    return (

        // Header container with styling for background, text, and layout.
        <header className="bg-purple-900 text-white shadow-md py-4 px-6 flex justify-between items-center">

            {/* Link to the admin dashboard home */}
            <Link to="/admin" className="text-xl font-bold flex items-center">
                <i className="fas fa-shield-alt mr-2"></i> Admin Dashboard
            </Link>

            {/* User info and logout button section */}
            <div className="flex items-center gap-4">

                {/* User avatar and name */}
                <div className="flex items-center gap-2">

                    {/* If avatar has an image, display it; otherwise, show initials with background color */}
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

                    {/* Display the user's name or "Admin" as fallback */}
                    <span>{user?.name || "Admin"}</span>
                </div>

                {/* Show logout button if onLogout handler is provided */}
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

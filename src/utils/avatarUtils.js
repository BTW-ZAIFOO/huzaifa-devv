/**
 * Generates a consistent avatar URL for a user based on their ID and name
 */
export const generateAvatar = (user) => {
    if (!user) return "https://api.dicebear.com/7.x/avataaars/svg?seed=fallback";
    if (user?.avatar) return user.avatar;

    const userId = user?._id || user?.id || Math.floor(Math.random() * 1000);
    const userName = user?.name || "User";
    const seed = `${userName.replace(/\s+/g, '')}-${userId}`;

    // Use avatar APIs directly instead of through functions
    const avatarTypes = [
        `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`,
        `https://api.dicebear.com/7.x/bottts/svg?seed=${seed}`,
        `https://api.dicebear.com/7.x/adventurer/svg?seed=${seed}`,
        `https://api.dicebear.com/7.x/micah/svg?seed=${seed}`,
        `https://api.dicebear.com/7.x/personas/svg?seed=${seed}`,
    ];

    // Get a stable avatar type for the user based on user ID
    const avatarTypeIndex = parseInt(userId.toString().slice(-1)) % avatarTypes.length;
    return avatarTypes[avatarTypeIndex];
};

/**
 * Generates an avatar URL specifically for admin users
 */
export const generateAdminAvatar = (user) => {
    if (!user) return "https://api.dicebear.com/7.x/bottts/svg?seed=admin&backgroundColor=purple";
    if (user?.avatar) return user.avatar;

    const userId = user?._id || user?.id || Math.floor(Math.random() * 1000);
    const userName = user?.name || "Admin";
    const adminSeed = `admin-${userName.replace(/\s+/g, '')}-${userId}`;

    // Use admin-specific avatar
    return `https://api.dicebear.com/7.x/bottts/svg?seed=${adminSeed}&backgroundColor=purple`;
};

/**
 * Returns an appropriate avatar based on user role
 */
export const getAvatarByRole = (user) => {
    if (!user) return "https://api.dicebear.com/7.x/avataaars/svg?seed=fallback";

    return user.role === "admin"
        ? generateAdminAvatar(user)
        : generateAvatar(user);
};

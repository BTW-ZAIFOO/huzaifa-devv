// Helper to prepare user data for avatar generation
const prepareUserData = (user, defaultName) => {

    // Use _id or id if available, otherwise generate a random id
    const userId = user?._id || user?.id || Math.floor(Math.random() * 1000);

    // Use user's name or a default name
    const userName = user?.name || defaultName;
    return { userId, userName };
};

// Predefined color palette for avatars
const colorPalette = [
    "#4f46e5", "#7c3aed", "#c026d3", "#db2777", "#e11d48",
    "#ea580c", "#d97706", "#65a30d", "#16a34a", "#0d9488",
    "#0891b2", "#0284c7", "#2563eb", "#4338ca", "#6d28d9"
];

// Get initials from a user's name for avatar display
export const getUserInitials = (name) => {
    if (!name) return '?';

    // Split name by whitespace
    const nameParts = name.split(/\s+/);
    if (nameParts.length === 1) {

        // Single word name: use first letter
        return nameParts[0].charAt(0).toUpperCase();
    }

    // Multiple words: use first letter of first and last word
    return (nameParts[0].charAt(0) + nameParts[nameParts.length - 1].charAt(0)).toUpperCase();
};

// Generate a color for the avatar based on user id or name
export const getAvatarColor = (id, name) => {
    if (!id && !name) return colorPalette[0];

    // Use id as string if available, otherwise use name
    const stringToHash = id?.toString() || name;
    let hash = 0;

    // Simple hash function to distribute colors
    for (let i = 0; i < stringToHash.length; i++) {
        hash = stringToHash.charCodeAt(i) + ((hash << 5) - hash);
    }

    hash = Math.abs(hash);

    // Pick color from palette based on hash
    return colorPalette[hash % colorPalette.length];
};

// Generate avatar data for a user (color and initials or image)
export const generateAvatar = (user) => {
    if (!user) return { color: colorPalette[0], initials: '?' };
    if (user?.avatar) return { imageUrl: user.avatar };

    // Prepare user id and name
    const { userId, userName } = prepareUserData(user, "User");

    return {
        color: getAvatarColor(userId, userName),
        initials: getUserInitials(userName)
    };
};

// Generate avatar for admin users (fixed color)
export const generateAdminAvatar = (user) => {
    if (!user) return { color: "#9333ea", initials: 'A' };
    if (user?.avatar) return { imageUrl: user.avatar };

    // Only use name for initials, color is fixed for admins
    const { userName } = prepareUserData(user, "Admin");

    return {
        color: "#9333ea",
        initials: getUserInitials(userName)
    };
};

// Get avatar data based on user role (admin or regular user)
export const getAvatarByRole = (user) => {
    if (!user) return { color: colorPalette[0], initials: '?' };
    return user.role === "admin" ? generateAdminAvatar(user) : generateAvatar(user);
};

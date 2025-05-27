const prepareUserData = (user, defaultName) => {
    const userId = user?._id || user?.id || Math.floor(Math.random() * 1000);
    const userName = user?.name || defaultName;
    return { userId, userName };
};

export const generateAvatar = (user) => {
    if (!user) return "https://api.dicebear.com/7.x/avataaars/svg?seed=fallback";
    if (user?.avatar) return user.avatar;

    const { userId, userName } = prepareUserData(user, "User");
    const seed = `${userName.replace(/\s+/g, '')}-${userId}`;

    const avatarTypes = [
        `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`,
        `https://api.dicebear.com/7.x/bottts/svg?seed=${seed}`,
        `https://api.dicebear.com/7.x/adventurer/svg?seed=${seed}`,
        `https://api.dicebear.com/7.x/micah/svg?seed=${seed}`,
        `https://api.dicebear.com/7.x/personas/svg?seed=${seed}`,
    ];

    return avatarTypes[parseInt(userId.toString().slice(-1)) % avatarTypes.length];
};

export const generateAdminAvatar = (user) => {
    if (!user) return "https://api.dicebear.com/7.x/bottts/svg?seed=admin&backgroundColor=purple";
    if (user?.avatar) return user.avatar;

    const { userId, userName } = prepareUserData(user, "Admin");
    const adminSeed = `admin-${userName.replace(/\s+/g, '')}-${userId}`;

    return `https://api.dicebear.com/7.x/bottts/svg?seed=${adminSeed}&backgroundColor=purple`;
};

export const getAvatarByRole = (user) => {
    if (!user) return "https://api.dicebear.com/7.x/avataaars/svg?seed=fallback";
    return user.role === "admin" ? generateAdminAvatar(user) : generateAvatar(user);
};

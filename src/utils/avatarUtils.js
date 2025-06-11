export const getAvatarByRole = (user) => {
  if (!user) return generateDefaultAvatar();

  if (user.role === "admin") {
    return generateAdminAvatar(user);
  }

  return generateAvatar(user);
};

export const generateAdminAvatar = (user) => {
  return {
    color: "#8b5cf6",
    initials: user?.name ? user.name.charAt(0).toUpperCase() : "A",
    imageUrl: user?.avatar || null,
    fallbackUrl: `https://ui-avatars.com/api/?name=Admin&background=8b5cf6&color=fff`,
  };
};

export const generateAvatar = (user) => {
  if (!user) return generateDefaultAvatar();

  const colorHash = simpleHashFromString(user.name || "User");
  const colors = [
    "#4f46e5",
    "#2563eb",
    "#0891b2",
    "#0d9488",
    "#059669",
    "#65a30d",
    "#ca8a04",
    "#ea580c",
    "#dc2626",
    "#db2777",
    "#7c3aed",
    "#6d28d9",
  ];

  const color = colors[colorHash % colors.length];

  return {
    color: color,
    initials: user.name ? user.name.charAt(0).toUpperCase() : "U",
    imageUrl: user.avatar || null,
    fallbackUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(
      user.name || "User"
    )}&background=${color.substring(1)}&color=fff`,
  };
};

const generateDefaultAvatar = () => {
  return {
    color: "#6b7280",
    initials: "?",
    imageUrl: null,
    fallbackUrl: `https://ui-avatars.com/api/?name=User&background=6b7280&color=fff`,
  };
};

const simpleHashFromString = (str) => {
  if (!str) return 0;

  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
};

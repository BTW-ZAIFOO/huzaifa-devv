// (Removed duplicate generateAvatar implementation)

/**
 * Get avatar based on user role
 * @param {Object} user - User object with role property
 * @returns {Object} Avatar data
 */
export const getAvatarByRole = (user) => {
  if (!user) return generateDefaultAvatar();

  if (user.role === "admin") {
    return generateAdminAvatar(user);
  }

  return generateAvatar(user);
};

/**
 * Generate admin avatar
 * @param {Object} user - Admin user object
 * @returns {Object} Avatar data
 */
export const generateAdminAvatar = (user) => {
  return {
    color: "#8b5cf6", // violet for admins
    initials: user?.name ? user.name.charAt(0).toUpperCase() : "A",
    imageUrl: user?.avatar || null,
    fallbackUrl: `https://ui-avatars.com/api/?name=Admin&background=8b5cf6&color=fff`,
  };
};

/**
 * Generate user avatar with color based on name
 * @param {Object} user - User object
 * @returns {Object} Avatar data
 */
export const generateAvatar = (user) => {
  if (!user) return generateDefaultAvatar();

  const colorHash = simpleHashFromString(user.name || "User");
  const colors = [
    "#4f46e5", // indigo
    "#2563eb", // blue
    "#0891b2", // cyan
    "#0d9488", // teal
    "#059669", // emerald
    "#65a30d", // lime
    "#ca8a04", // yellow
    "#ea580c", // orange
    "#dc2626", // red
    "#db2777", // pink
    "#7c3aed", // violet
    "#6d28d9", // purple
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

/**
 * Generate default avatar for null users
 * @returns {Object} Default avatar data
 */
const generateDefaultAvatar = () => {
  return {
    color: "#6b7280", // gray
    initials: "?",
    imageUrl: null,
    fallbackUrl: `https://ui-avatars.com/api/?name=User&background=6b7280&color=fff`,
  };
};

/**
 * Simple string hash function
 * @param {string} str - String to hash
 * @returns {number} Hash code
 */
const simpleHashFromString = (str) => {
  if (!str) return 0;

  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0; // Convert to 32bit integer
  }
  return Math.abs(hash);
};

export const generateAdminAvatar = (user) => {
  return {
    color: "#8b5cf6",
    initials: user?.name ? user.name.charAt(0).toUpperCase() : "A",
    imageUrl: null,
    fallbackUrl: null,
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

  const initials = user.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .substring(0, 2)
    : "?";

  return {
    color,
    initials,
    imageUrl: null,
    fallbackUrl: null,
  };
};

export const generateDefaultAvatar = () => {
  return {
    color: "#9ca3af",
    initials: "?",
    imageUrl: null,
    fallbackUrl: null,
  };
};

export const simpleHashFromString = (str) => {
  let hash = 0;
  if (!str || str.length === 0) return hash;

  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }

  return Math.abs(hash);
};

export const getAvatarByRole = (user) => {
  if (!user) {
    return {
      color: "#6b7280",
      initials: "?",
      imageUrl: null,
    };
  }

  const initials = user.name ? user.name.charAt(0).toUpperCase() : "?";

  if (user.avatar && typeof user.avatar === "string") {
    return {
      color: getRoleColor(user.role),
      initials,
      imageUrl: user.avatar,
    };
  }

  return {
    color: getRoleColor(user.role),
    initials,
    imageUrl: null,
  };
};

const getRoleColor = (role) => {
  switch (role) {
    case "admin":
      return "#dc2626";
    case "moderator":
      return "#ea580c";
    case "premium":
      return "#7c3aed";
    case "user":
    default:
      return "#2563eb";
  }
};

export const generateAvatarUrl = (name, role) => {
  const colors = {
    admin: "dc2626",
    moderator: "ea580c",
    premium: "7c3aed",
    user: "2563eb",
  };

  const color = colors[role] || colors.user;
  const initials = name ? name.charAt(0).toUpperCase() : "?";

  return `https://ui-avatars.com/api/?name=${initials}&background=${color}&color=fff&size=128`;
};

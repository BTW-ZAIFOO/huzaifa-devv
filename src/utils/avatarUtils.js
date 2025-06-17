export const getAvatarUrl = (user) => {
  if (!user || !user.avatar) return null;
  let imageUrl = user.avatar;

  if (imageUrl.startsWith("data:")) {
    return imageUrl;
  }

  if (imageUrl.startsWith("http")) {
    return imageUrl;
  }

  if (
    imageUrl.startsWith("uploads/avatars/") ||
    imageUrl.startsWith("/uploads/avatars/")
  ) {
    imageUrl = imageUrl.replace(/^\/?uploads/, "uploads");
    return `http://localhost:4000/${imageUrl}`;
  }

  if (imageUrl.startsWith("/uploads/")) {
    return `http://localhost:4000${imageUrl}`;
  }
  if (imageUrl.startsWith("/public/uploads/")) {
    return `http://localhost:4000${imageUrl}`;
  }
  if (imageUrl.startsWith("/avatars/")) {
    return `http://localhost:4000/uploads${imageUrl}`;
  }
  if (imageUrl.startsWith("/public/")) {
    return `http://localhost:4000${imageUrl}`;
  }

  if (!imageUrl.includes("/")) {
    return `http://localhost:4000/uploads/avatars/${imageUrl}`;
  }

  return (
    imageUrl ||
    "https://ui-avatars.com/api/?name=User&background=9ca3af&color=fff"
  );
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
    imageUrl: user.avatar || null,
    fallbackUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(
      user.name || "User"
    )}&background=${color.substring(1)}&color=fff`,
  };
};

export const generateDefaultAvatar = () => {
  return {
    color: "#9ca3af",
    initials: "?",
    imageUrl: null,
    fallbackUrl:
      "https://ui-avatars.com/api/?name=User&background=9ca3af&color=fff",
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
  if (!user) return generateDefaultAvatar();
  if (user.role === "admin") return generateAdminAvatar(user);
  return generateAvatar(user);
};

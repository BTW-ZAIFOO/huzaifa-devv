const prepareUserData = (user, defaultName) => {
  const userId = user?._id || user?.id || Math.floor(Math.random() * 1000);
  const userName = user?.name || defaultName;
  return { userId, userName };
};

const colorPalette = [
  "#4f46e5",
  "#7c3aed",
  "#c026d3",
  "#db2777",
  "#e11d48",
  "#ea580c",
  "#d97706",
  "#65a30d",
  "#16a34a",
  "#0d9488",
  "#0891b2",
  "#0284c7",
  "#2563eb",
  "#4338ca",
  "#6d28d9",
];

export const getUserInitials = (name) => {
  if (!name) return "?";

  const nameParts = name.split(/\s+/);
  if (nameParts.length === 1) {
    return nameParts[0].charAt(0).toUpperCase();
  }
  return (
    nameParts[0].charAt(0) + nameParts[nameParts.length - 1].charAt(0)
  ).toUpperCase();
};

export const getAvatarColor = (id, name) => {
  if (!id && !name) return colorPalette[0];

  const stringToHash = id?.toString() || name;
  let hash = 0;

  for (let i = 0; i < stringToHash.length; i++) {
    hash = stringToHash.charCodeAt(i) + ((hash << 5) - hash);
  }

  hash = Math.abs(hash);

  return colorPalette[hash % colorPalette.length];
};

export const generateAvatar = (user) => {
  if (!user) return { color: colorPalette[0], initials: "?" };

  const { userId, userName } = prepareUserData(user, "User");

  return {
    color: getAvatarColor(userId, userName),
    initials: getUserInitials(userName),
  };
};

export const generateAdminAvatar = (user) => {
  if (!user) return { color: "#9333ea", initials: "A" };
  const { userName } = prepareUserData(user, "Admin");

  return {
    color: "#9333ea",
    initials: getUserInitials(userName),
  };
};

export const getAvatarByRole = (user) => {
  if (!user) return { color: colorPalette[0], initials: "?" };
  return user.role === "admin"
    ? generateAdminAvatar(user)
    : generateAvatar(user);
};

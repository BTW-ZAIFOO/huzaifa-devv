export const INAPPROPRIATE_WORDS = [
  // English Abusive Words
  "fuck",
  "fucker",
  "fucking",
  "shit",
  "bullshit",
  "piss",
  "pissed",
  "bitch",
  "ass",
  "asshole",
  "dick",
  "cock",
  "prick",
  "crap",
  "bastard",
  "motherfucker",
  "mf",
  "wtf",
  "damn",
  "goddamn",
  "cunt",
  "pussy",
  "slut",
  "whore",
  "twat",
  "skank",
  "dildo",
  "cum",
  "fap",
  "jerkoff",
  "jackoff",
  "porn",
  "boobs",
  "tits",
  "tit",
  "ahegao",
  "milf",
  "idiot",
  "moron",
  "retard",
  "retarded",
  "dumb",
  "stupid",
  "loser",
  "clown",
  "fatass",
  "ugly",
  "cringe",
  "soyboy",
  "simp",
  "kill",
  "die",
  "suicide",
  "murder",
  "rape",
  "stab",
  "shoot",
  "abuse",
  "hang",
  "beat",
  "n*gger",
  "n*gga",
  "ch*nk",
  "sp*c",
  "k*ke",
  "f*g",
  "tr*nny",
  "dyke",
  "cripple",
  "midget",
  "fuk",
  "phuck",
  "shiit",
  "azzhole",
  "beetch",
  "d1ck",
  "c0ck",
  "pussee",
  "b!tch",
  "a$$",

  // URDU Abusive Words
  "chutiya",
  "gandu",
  "gaand",
  "bhenchod",
  "madarchod",
  "teri maa ki",
  "harami",
  "randi",
  "lulli",
  "lund",
  "kutti",
  "kutte",
  "kanjar",
  "chod",
  "chuda",
  "rakhail",
  "behen ke lode",
  "makhlooq",
  "raand",
  "bakchod",
  "bhosdike",
  "tatti",
  "tatti kha",
  "jhant",
  "jhantoo",
  "gaand mara",
  "jhaant",
  "maderchod",
  "kamina",
  "kameeni",
  "bhosri",
  "bhosri ke",
  "bhen ke takkay",
  "teri maa",
  "teri bahan",
  "maa chod",
  "maa ki chut",
  "behan ka loda",
  "lode ka bacha",
  "bhen ka bhosda",
  "teri maa ka",
  "maa ki aankh",
  "teri behan ki chut",
  "teri behan ka loda",
];

const inappropriateWords = [
  "spam",
  "abuse",
  "hate",
  "violence",
  "inappropriate",
  "offensive",
  "harassment",
  "bullying",
  "threat",
];

const createWordRegex = (word) => new RegExp(`\\b${word}\\b`, "i");
export const containsInappropriateContent = (text, additionalWords = []) => {
  if (!text || typeof text !== "string") return false;

  const wordsToCheck = [...INAPPROPRIATE_WORDS, ...additionalWords];
  const textLower = text.toLowerCase();

  return wordsToCheck.some((word) => createWordRegex(word).test(textLower));
};

export const extractInappropriateWords = (text, additionalWords = []) => {
  if (!text || typeof text !== "string") return [];

  const wordsToCheck = [...INAPPROPRIATE_WORDS, ...additionalWords];
  const textLower = text.toLowerCase();
  const words = textLower.split(/\s+/);

  return wordsToCheck.filter((word) =>
    words.some((w) => w.includes(word.toLowerCase()))
  );
};

export const highlightInappropriateContent = (text, additionalWords = []) => {
  if (!text || typeof text !== "string") return "";

  const wordsToCheck = [...INAPPROPRIATE_WORDS, ...additionalWords];
  let highlighted = text;
  wordsToCheck.forEach((word) => {
    const regex = new RegExp(`\\b${word}\\b`, "gi");
    highlighted = highlighted.replace(
      regex,
      (match) =>
        `<span class="bg-red-100 text-red-800 rounded px-1">${match}</span>`
    );
  });

  return highlighted;
};

export const logDeletedMessage = (
  message,
  admin,
  reason = "Content moderation"
) => {
  const logData = {
    messageId: message._id,
    content: message.content,
    sender: message.sender?.name || "Unknown",
    senderId: message.sender?._id || "Unknown",
    timestamp: message.createdAt,
    deletedAt: new Date(),
    deletedBy: admin.name,
    adminId: admin._id,
    reason,
  };

  const previousLogs = JSON.parse(
    localStorage.getItem("deletedMessages") || "[]"
  );
  localStorage.setItem(
    "deletedMessages",
    JSON.stringify([logData, ...previousLogs])
  );

  return logData;
};

export const getUserModerationHistory = (userId) => {
  const deletedMessages = JSON.parse(
    localStorage.getItem("deletedMessages") || "[]"
  );
  return deletedMessages.filter((log) => log.senderId === userId);
};

export const updateUserInArray = (users, updatedUser) => {
  if (!users || !Array.isArray(users)) return users;

  return users.map((user) => {
    if (user._id === updatedUser.userId) {
      return {
        ...user,
        name: updatedUser.name || user.name,
        bio: updatedUser.bio !== undefined ? updatedUser.bio : user.bio,
        location:
          updatedUser.location !== undefined
            ? updatedUser.location
            : user.location,
        interests:
          updatedUser.interests !== undefined
            ? updatedUser.interests
            : user.interests,
        avatar:
          typeof updatedUser.avatar === "string" && updatedUser.avatar
            ? updatedUser.avatar
            : user.avatar,
        updatedAt: updatedUser.updatedAt || new Date(),
      };
    }
    return user;
  });
};

export const logProfileUpdate = (userId, userName, changes) => {
  const logData = {
    userId,
    userName,
    changes,
    timestamp: new Date(),
  };

  const previousLogs = JSON.parse(
    localStorage.getItem("profileUpdates") || "[]"
  );

  localStorage.setItem(
    "profileUpdates",
    JSON.stringify([logData, ...previousLogs])
  );

  return logData;
};

export const formatInterests = (interests) => {
  if (!interests) return [];
  if (Array.isArray(interests)) return interests;
  if (typeof interests === "string") {
    return interests
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }
  return [];
};

export const sanitizeMessage = (message) => {
  if (!message || typeof message !== "string") return "";

  return message
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/\s+/g, " ")
    .trim();
};

export const validateMessageLength = (message, maxLength = 500) => {
  if (!message) return { isValid: false, error: "Message cannot be empty" };
  if (message.length > maxLength) {
    return {
      isValid: false,
      error: `Message too long. Maximum ${maxLength} characters allowed.`,
    };
  }
  return { isValid: true, error: null };
};

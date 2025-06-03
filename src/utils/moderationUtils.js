// List of inappropriate words in English and Urdu, including common variations and misspellings.
// This array is used for content moderation checks.
export const INAPPROPRIATE_WORDS = [
    // English Abusive Words
    "fuck", "fucker", "fucking", "shit", "bullshit", "piss", "pissed",
    "bitch", "ass", "asshole", "dick", "cock", "prick", "crap", "bastard",
    "motherfucker", "mf", "wtf", "damn", "goddamn",
    "cunt", "pussy", "slut", "whore", "twat", "skank", "dildo", "cum", "fap",
    "jerkoff", "jackoff", "porn", "boobs", "tits", "tit", "ahegao", "milf",
    "idiot", "moron", "retard", "retarded", "dumb", "stupid", "loser", "clown",
    "fatass", "ugly", "cringe", "soyboy", "simp",
    "kill", "die", "suicide", "murder", "rape", "stab", "shoot", "abuse", "hang", "beat",
    "n*gger", "n*gga", "ch*nk", "sp*c", "k*ke", "f*g", "tr*nny", "dyke", "cripple", "midget",
    "fuk", "phuck", "shiit", "azzhole", "beetch", "d1ck", "c0ck", "pussee", "b!tch", "a$$",

    // URDU Abusive Words
    "chutiya", "gandu", "gaand", "bhenchod", "madarchod", "teri maa ki", "harami", "randi",
    "lulli", "lund", "kutti", "kutte", "kanjar", "chod", "chuda", "rakhail", "behen ke lode",
    "makhlooq", "raand", "bakchod", "bhosdike", "tatti", "tatti kha", "jhant", "jhantoo",
    "gaand mara", "jhaant", "maderchod", "kamina", "kameeni", "bhosri", "bhosri ke", "bhen ke takkay",
    "teri maa", "teri bahan", "maa chod", "maa ki chut", "behan ka loda", "lode ka bacha",
    "bhen ka bhosda", "teri maa ka", "maa ki aankh", "teri behan ki chut", "teri behan ka loda"
];

// Helper function to create a case-insensitive regex for a whole word match.
// Used to accurately detect inappropriate words in text.
const createWordRegex = (word) => new RegExp(`\\b${word}\\b`, 'i');

// Checks if the given text contains any inappropriate content.
// Optionally accepts additional words to check against.
// Returns true if any inappropriate word is found, false otherwise.
export const containsInappropriateContent = (text, additionalWords = []) => {
    if (!text || typeof text !== 'string') return false;

    // Combine default and additional inappropriate words.
    const wordsToCheck = [...INAPPROPRIATE_WORDS, ...additionalWords];
    const textLower = text.toLowerCase();

    // Check if any inappropriate word exists in the text.
    return wordsToCheck.some(word => createWordRegex(word).test(textLower));
};

// Highlights inappropriate words in the text by wrapping them in a styled span.
// Returns the modified HTML string with highlights.
export const highlightInappropriateContent = (text, additionalWords = []) => {
    if (!text || typeof text !== 'string') return '';

    // Combine default and additional inappropriate words.
    const wordsToCheck = [...INAPPROPRIATE_WORDS, ...additionalWords];
    let highlighted = text;

    // Replace each inappropriate word with a highlighted span.
    wordsToCheck.forEach(word => {
        const regex = new RegExp(`\\b${word}\\b`, 'gi');
        highlighted = highlighted.replace(regex, match =>
            `<span class="bg-red-100 text-red-800 rounded px-1">${match}</span>`
        );
    });

    return highlighted;
};

// Extracts and returns a list of inappropriate words found in the text.
// Optionally accepts additional words to check against.
export const extractInappropriateWords = (text, additionalWords = []) => {
    if (!text || typeof text !== 'string') return [];

    // Combine default and additional inappropriate words.
    const wordsToCheck = [...INAPPROPRIATE_WORDS, ...additionalWords];
    const textLower = text.toLowerCase();

    // Return all inappropriate words present in the text.
    return wordsToCheck.filter(word => createWordRegex(word).test(textLower));
};

// Logs a deleted message to localStorage for moderation history.
// Stores details such as message content, sender, admin, and reason for deletion.
// Returns the log data object.
export const logDeletedMessage = (message, admin, reason = "Content moderation") => {
    const logData = {
        messageId: message._id,
        content: message.content,
        sender: message.sender?.name || "Unknown",
        senderId: message.sender?._id || "Unknown",
        timestamp: message.createdAt,
        deletedAt: new Date(),
        deletedBy: admin.name,
        adminId: admin._id,
        reason
    };

    // Retrieve previous logs from localStorage and prepend the new log.
    const previousLogs = JSON.parse(localStorage.getItem('deletedMessages') || '[]');
    localStorage.setItem('deletedMessages', JSON.stringify([logData, ...previousLogs]));

    return logData;
};

// Retrieves the moderation history for a specific user by userId.
// Returns an array of deleted message logs for that user.
export const getUserModerationHistory = (userId) => {
    const deletedMessages = JSON.parse(localStorage.getItem('deletedMessages') || '[]');
    return deletedMessages.filter(log => log.senderId === userId);
};

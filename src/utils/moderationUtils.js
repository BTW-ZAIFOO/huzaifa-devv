export const INAPPROPRIATE_WORDS = [
    "shit", "fuck", "damn", "bitch", "asshole", "cunt", "dick", "pussy",
    "idiot", "stupid", "dumb", "retard", "moron", "bastard", "whore",
    "slut", "hate", "kill", "murder", "suicide", "die", "attack",
    "racist", "nigger", "chink", "spic", "kike", "fag", "nigga"
];

export const containsInappropriateContent = (text, additionalWords = []) => {
    if (!text || typeof text !== 'string') return false;

    const wordsToCheck = [...INAPPROPRIATE_WORDS, ...additionalWords];
    const textLower = text.toLowerCase();

    return wordsToCheck.some(word => {
        const regex = new RegExp(`\\b${word}\\b`, 'i');
        return regex.test(textLower);
    });
};

export const highlightInappropriateContent = (text, additionalWords = []) => {
    if (!text || typeof text !== 'string') return '';

    const wordsToHighlight = [...INAPPROPRIATE_WORDS, ...additionalWords];
    let highlighted = text;

    wordsToHighlight.forEach(word => {
        const regex = new RegExp(`\\b${word}\\b`, 'gi');
        highlighted = highlighted.replace(regex, match =>
            `<span class="bg-red-100 text-red-800 rounded px-1">${match}</span>`
        );
    });

    return highlighted;
};

export const extractInappropriateWords = (text, additionalWords = []) => {
    if (!text || typeof text !== 'string') return [];

    const wordsToCheck = [...INAPPROPRIATE_WORDS, ...additionalWords];
    const textLower = text.toLowerCase();

    return wordsToCheck.filter(word => {
        const regex = new RegExp(`\\b${word}\\b`, 'i');
        return regex.test(textLower);
    });
};

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

    const previousLogs = JSON.parse(localStorage.getItem('deletedMessages') || '[]');
    localStorage.setItem('deletedMessages', JSON.stringify([logData, ...previousLogs]));

    return logData;
};


export const getUserModerationHistory = (userId) => {
    const deletedMessages = JSON.parse(localStorage.getItem('deletedMessages') || '[]');
    return deletedMessages.filter(log => log.senderId === userId);
};

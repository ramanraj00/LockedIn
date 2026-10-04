const usermodel = require("../models/users");

/**
 * Generates a unique username from an email address.
 * Takes the part before '@', removes special chars, and appends a number if needed.
 * @param {string} email - User's email address
 * @returns {Promise<string>} A unique username
 */
const generateUniqueUsername = async (email) => {
    let baseUsername = email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '');
    let username = baseUsername;
    let isUnique = false;
    let counter = 1;

    while (!isUnique) {
        const existingUser = await usermodel.findOne({ username });
        if (existingUser) {
            username = `${baseUsername}${counter}`;
            counter++;
        } else {
            isUnique = true;
        }
    }
    return username;
};

module.exports = generateUniqueUsername;

const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['admin', 'staff'], default: 'staff' },
    name: { type: String, required: true },
    branch: { type: String, required: true, default: 'Main' }
});

module.exports = mongoose.model('User', userSchema);

const mongoose = require('mongoose');

const AttemptSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    assignmentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Assignment',
        required: true
    },
    query: {
        type: String,
        required: true
    },
    isCorrect: {
        type: Boolean,
        required: true
    }
}, { timestamps: true });

module.exports = mongoose.model('Attempt', AttemptSchema);

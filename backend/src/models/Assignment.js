const mongoose = require('mongoose');

const tableStructureSchema = new mongoose.Schema({
    tableName: { type: String, required: true },
    schemaDescription: { type: String, required: true },
    sampleData: { type: Array, required: true } // Array of rows
});

const assignmentSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    difficulty: {
        type: String,
        enum: ['Easy', 'Medium', 'Hard'],
        default: 'Medium'
    },
    description: {
        type: String,
        required: true
    },
    expectedTables: [tableStructureSchema],
    expectedQuery: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Assignment', assignmentSchema);

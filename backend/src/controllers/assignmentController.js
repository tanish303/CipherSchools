const Assignment = require('../models/Assignment');

// Get all assignments
const getAssignments = async (req, res) => {
    try {
        const assignments = await Assignment.find({}, 'title difficulty description');
        res.json(assignments);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching assignments', error: error.message });
    }
};

// Get a single assignment with tables
const getAssignmentById = async (req, res) => {
    try {
        const assignment = await Assignment.findById(req.params.id);
        if (!assignment) return res.status(404).json({ message: 'Assignment not found' });
        res.json(assignment);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching assignment', error: error.message });
    }
};

module.exports = {
    getAssignments,
    getAssignmentById
};

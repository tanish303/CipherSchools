const express = require('express');
const router = express.Router();

const { getAssignments, getAssignmentById } = require('../controllers/assignmentController');
const { executeQuery, getAttempts } = require('../controllers/queryController');
const { getHint } = require('../controllers/hintController');

const { signup, login } = require('../controllers/authController');

router.post('/signup', signup);
router.post('/login', login);

router.get('/assignments', getAssignments);
router.get('/assignments/:id', getAssignmentById);
router.post('/execute', executeQuery);
router.get('/attempts/:assignmentId/:userId', getAttempts);
router.post('/hints', getHint);

module.exports = router;

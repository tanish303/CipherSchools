const pgdb = require('../config/pgdb');

const Assignment = require('../models/Assignment');
const Attempt = require('../models/Attempt');

const executeQuery = async (req, res) => {
    const { query, assignmentId, userId } = req.body;

    if (!query) {
        return res.status(400).json({ error: 'SQL query is required' });
    }

    // --- SECURITY: Query Validation & Sanitization ---
    const upperQuery = query.toUpperCase().trim();
    if (!upperQuery.startsWith('SELECT')) {
        return res.status(400).json({ error: 'Security Error: Only SELECT queries are permitted.' });
    }

    const forbiddenKeywords = ['DROP', 'DELETE', 'UPDATE', 'INSERT', 'ALTER', 'TRUNCATE', 'GRANT', 'REVOKE'];
    for (const keyword of forbiddenKeywords) {
        // Basic naive check for destructive keywords
        const regex = new RegExp(`\\b${keyword}\\b`, 'i');
        if (regex.test(query)) {
            return res.status(400).json({ error: `Security Error: Query contains unauthorized keyword: ${keyword}.` });
        }
    }
    // --------------------------------------------------

    try {
        // Run user query
        const result = await pgdb.query(query);
        let isCorrect = undefined;

        // If assignmentId is provided, check correctness
        if (assignmentId) {
            const assignment = await Assignment.findById(assignmentId);
            if (assignment && assignment.expectedQuery) {
                try {
                    const expectedResult = await pgdb.query(assignment.expectedQuery);

                    // Simple comparison: check if rows match
                    if (result.rows.length === expectedResult.rows.length) {
                        isCorrect = JSON.stringify(result.rows) === JSON.stringify(expectedResult.rows);
                    } else {
                        isCorrect = false;
                    }
                } catch (expectedErr) {
                    console.error("Error executing expectedQuery:", expectedErr);
                }
            }
        }

        let saveAttemptStatus = "Not attempted";
        let capturedAttemptError = null;

        console.log("DEBUG: RECEIVED PAYLOAD:", { query, assignmentId, userId });
        console.log("DEBUG: EVALUATED CORRECTNESS:", isCorrect);

        // Save Attempt (if a real user is logged in and assignmentId exists)
        if (userId && userId !== 'guest' && assignmentId && isCorrect !== undefined) {
            try {
                const att = await Attempt.create({
                    userId,
                    assignmentId,
                    query: query.trim(),
                    isCorrect
                });
                saveAttemptStatus = "Success: " + att._id;
            } catch (err) {
                console.error("Failed to log attempt:", err);
                saveAttemptStatus = "Failed";
                capturedAttemptError = err.message;
            }
        } else {
            saveAttemptStatus = "Skipped - Condition False: " + JSON.stringify({ userId, isCorrect });
        }

        res.json({
            success: true,
            columns: result.fields.map(f => f.name),
            rows: result.rows,
            rowCount: result.rowCount,
            isCorrect: isCorrect,
            debugAttempt: { saveAttemptStatus, capturedAttemptError, userId, isCorrect }
        });
    } catch (error) {
        // Run Attempt logger even if SQL fails!
        if (userId && userId !== 'guest' && assignmentId) {
            try {
                await Attempt.create({
                    userId,
                    assignmentId,
                    query: query.trim(),
                    isCorrect: false
                });
            } catch (err) {
                console.error("Failed to log failed attempt:", err);
            }
        }

        res.status(400).json({
            success: false,
            error: error.message
        });
    }
};

const getAttempts = async (req, res) => {
    const { assignmentId, userId } = req.params;
    try {
        const attempts = await Attempt.find({ assignmentId, userId }).sort({ createdAt: -1 }).limit(10);
        res.json(attempts);
    } catch (error) {
        console.error("Failed to fetch attempts:", error);
        res.status(500).json({ error: 'Failed to fetch query history' });
    }
};

module.exports = {
    executeQuery,
    getAttempts
};

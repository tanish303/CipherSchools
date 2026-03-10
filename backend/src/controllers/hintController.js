const { GoogleGenAI } = require('@google/genai');
const Assignment = require('../models/Assignment');

const getHint = async (req, res) => {
    try {
        const { assignmentId, userQuery } = req.body;

        if (!userQuery) {
            return res.status(400).json({ error: 'User query is required.' });
        }

        const assignment = await Assignment.findById(assignmentId);
        if (!assignment) {
            return res.status(404).json({ error: 'Assignment not found.' });
        }

        // Initialize Gemini API
        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

        // Construct prompt
        const prompt = `
      You are an expert SQL teacher helping a student.
      Assignment Goal: ${assignment.description}
      Schemas: ${JSON.stringify(assignment.expectedTables, null, 2)}
      
      The student has attempted this SQL query so far:
      \`\`\`sql
      ${userQuery}
      \`\`\`
      
      Review their query against the goal. Provide a helpful, constructive hint to guide them in the right direction. 
      IMPORTANT: DO NOT provide the fully correct SQL solution. Only point out syntax errors, missing clauses, logic errors, or structural issues they should look into, acting as a supportive tutor. Keep your response concise (3-4 sentences max).
    `;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });

        res.json({ hint: response.text });
    } catch (error) {
        console.error('LLM Error:', error);
        res.status(500).json({ error: 'Error generating hint from LLM.' });
    }
};

module.exports = {
    getHint
};

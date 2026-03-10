const User = require('../models/User');

exports.signup = async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ error: 'Username and password are required' });
        }

        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ error: 'Username already taken' });
        }

        const user = new User({ username, password });
        await user.save();

        res.status(201).json({
            message: 'User created successfully',
            userId: user._id,
            username: user.username
        });
    } catch (error) {
        console.error("Signup error:", error);
        res.status(500).json({ error: 'Server error during signup' });
    }
};

exports.login = async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ error: 'Username and password are required' });
        }

        const user = await User.findOne({ username });
        if (!user || user.password !== password) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // For simplicity, we just return user details to simulate a logged-in session
        res.json({
            message: 'Login successful',
            userId: user._id,
            username: user.username
        });
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ error: 'Server error during login' });
    }
};

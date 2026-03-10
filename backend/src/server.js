require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectMongoDB = require('./config/db');

const app = express();

app.use(cors());
app.use(express.json());

// API Request Trace Debugger
app.use((req, res, next) => {
    console.log(`[HTTP TRACE] ${req.method} ${req.url}`, req.body || '');
    next();
});

// Routes
app.use('/api', require('./routes/api'));

app.get('/', (req, res) => {
    res.send('CipherSQLStudio API is running...');
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, async () => {
    console.log(`Server running on port ${PORT}`);
    // Await connections if env vars are present (or let them connect asynchronously)
    if (process.env.MONGO_URI) {
        await connectMongoDB();
    } else {
        console.log("No MONGO_URI provided in .env yet.");
    }
});

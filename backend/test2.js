const { spawn } = require('child_process');
const http = require('http');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const User = require('./models/users');
const DaySession = require('./models/daysession');
const TimerSession = require('./models/studysession');

const PORT = 3005; 
process.env.PORT = PORT;

const server = spawn('node', ['index.js'], { env: process.env });

server.stdout.on('data', data => console.log(data.toString().trim()));
server.stderr.on('data', data => console.error(data.toString().trim()));

const makeRequest = (method, path, token, body = null) => {
    return new Promise((resolve, reject) => {
        const start = process.hrtime();
        const options = {
            hostname: 'localhost',
            port: PORT,
            path: path,
            method: method,
            headers: { 'Content-Type': 'application/json' }
        };
        if (token) options.headers['Authorization'] = `Bearer ${token}`;

        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                const diff = process.hrtime(start);
                const latency = (diff[0] * 1000 + diff[1] / 1e6).toFixed(2);
                try {
                    resolve({ status: res.statusCode, data: JSON.parse(data), latency });
                } catch {
                    resolve({ status: res.statusCode, data, latency });
                }
            });
        });
        req.on('error', reject);
        if (body) req.write(JSON.stringify(body));
        req.end();
    });
};

const delay = ms => new Promise(res => setTimeout(res, ms));

async function runTests() {
    await delay(3000); 
    await mongoose.connect(process.env.MONGODB_URI);
    
    // Create test user and data
    const user = await User.create({ name: "Phase2 Tester", email: "phase2@lockedin.com", password: "mock", username: "phase2user99" });
    const token = jwt.sign({ id: user._id.toString() }, process.env.JWT_SECRET, { expiresIn: '1h' });

    // Seed 100 dummy sessions
    const bulkOps = [];
    for(let i=0; i<100; i++) {
        let d = new Date(); d.setDate(d.getDate() - i);
        bulkOps.push({ insertOne: { document: { userId: user._id, title: "Test", date: d, totalDaytime: 3600 } }});
    }
    await DaySession.bulkWrite(bulkOps);

    console.log("\n=== PHASE 2 PERFORMANCE TEST ===");
    
    // Test 1: Heatmap (Aggregation)
    console.log("Testing /api/dashboard/heatmap (Aggregation)...");
    const heatmapRes = await makeRequest('GET', '/api/dashboard/heatmap', token);
    console.log(`Heatmap Status: ${heatmapRes.status}, Latency: ${heatmapRes.latency}ms`);

    // Test 2: Leaderboard (First Fetch - Miss)
    console.log("Testing /api/leaderboard (Cache Miss)...");
    const lead1 = await makeRequest('GET', '/api/leaderboard', token);
    console.log(`Leaderboard (Miss) Status: ${lead1.status}, Latency: ${lead1.latency}ms`);

    // Test 3: Leaderboard (Second Fetch - Hit)
    console.log("Testing /api/leaderboard (Cache Hit)...");
    const lead2 = await makeRequest('GET', '/api/leaderboard', token);
    console.log(`Leaderboard (Hit) Status: ${lead2.status}, Latency: ${lead2.latency}ms`);

    // Test 4: Leaderboard Pagination
    console.log("Testing /api/leaderboard?page=1&limit=2 (Pagination)...");
    const leadPaginated = await makeRequest('GET', '/api/leaderboard?page=1&limit=2', token);
    console.log(`Paginated Items: ${leadPaginated.data.length}, Latency: ${leadPaginated.latency}ms`);

    // Cleanup
    await User.deleteOne({ _id: user._id });
    await DaySession.deleteMany({ userId: user._id });
    await mongoose.connection.close();
    server.kill('SIGINT');
}

runTests().catch(e => {
    console.error(e);
    server.kill('SIGKILL');
});

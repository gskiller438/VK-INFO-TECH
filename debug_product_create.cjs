const http = require('http');

const data = JSON.stringify({
    name: "Debug Product",
    price: 100,
    stock: 10,
    branch: "Main",
    createdBy: "DebugScript"
});

const options = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/products',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
    }
};

const req = http.request(options, (res) => {
    let body = '';
    res.on('data', (chunk) => body += chunk);
    res.on('end', () => {
        console.log("Response:", body);
    });
});

req.on('error', (e) => console.error(e));
req.write(data);
req.end();

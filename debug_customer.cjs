const http = require('http');

const data = JSON.stringify({
    name: "Debug Customer",
    phone: "9999999999",
    address: "Debug Address",
    email: "debug@test.com",
    gstin: "",
    customerType: "Retail",
    status: "Active",
    branch: "Main",
    createdBy: "DebugScript"
});

const options = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/customers',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
    }
};

console.log("Sending request to http://localhost:5000/api/customers...");

const req = http.request(options, (res) => {
    console.log(`STATUS: ${res.statusCode}`);

    let body = '';
    res.on('data', (chunk) => {
        body += chunk;
    });

    res.on('end', () => {
        console.log('BODY:', body);
    });
});

req.on('error', (e) => {
    console.error(`problem with request: ${e.message}`);
});

req.write(data);
req.end();

const http = require('http');

const options = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/products',
    method: 'GET',
};

console.log("Fetching products to check IDs...");

const req = http.request(options, (res) => {
    let body = '';
    res.on('data', (chunk) => {
        body += chunk;
    });

    res.on('end', () => {
        try {
            const products = JSON.parse(body);
            console.log("--- Existing Product IDs ---");
            if (Array.isArray(products)) {
                products.forEach(p => console.log(`${p.name}: ${p.id}`));
            } else {
                console.log("Response is not an array:", products);
            }
            console.log("----------------------------");
        } catch (e) {
            console.error("Failed to parse response:", e);
        }
    });
});

req.on('error', (e) => {
    console.error(`problem with request: ${e.message}`);
});

req.end();

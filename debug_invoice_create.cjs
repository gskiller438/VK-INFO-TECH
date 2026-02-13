const http = require('http');

async function request(path, method, data) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'localhost',
            port: 5000,
            path: '/api' + path,
            method: method,
            headers: { 'Content-Type': 'application/json' }
        };

        const req = http.request(options, (res) => {
            let body = '';
            res.on('data', chunk => body += chunk);
            res.on('end', () => resolve({ status: res.statusCode, body: body }));
        });

        req.on('error', reject);
        if (data) req.write(JSON.stringify(data));
        req.end();
    });
}

async function run() {
    try {
        console.log("1. Creating Test Product...");
        const productRes = await request('/products', 'POST', {
            name: "Debug Item " + Date.now(),
            price: 100,
            stock: 50,
            branch: "Main"
        });
        const product = JSON.parse(productRes.body);
        console.log("Product Created:", product.id || productRes.body);

        console.log("2. Creating Test Customer...");
        const customerRes = await request('/customers', 'POST', {
            name: "Debug User",
            phone: "9999999999",
            branch: "Main"
        });
        const customer = JSON.parse(customerRes.body);
        console.log("Customer Created:", customer.id || customerRes.body);

        console.log("3. Creating Invoice...");
        const invoiceData = {
            invoiceNumber: "INV-DEBUG-" + Date.now(),
            customerId: customer.id,
            customerName: customer.name,
            customerPhone: customer.phone,
            date: "2026-02-13",
            amount: 100,
            products: [{
                name: product.name,
                quantity: 1,
                price: 100,
                amount: 100
            }],
            branch: "Main",
            createdBy: "DebugScript"
        };

        const invoiceRes = await request('/invoices', 'POST', invoiceData);
        console.log("Invoice Status:", invoiceRes.status);
        console.log("Invoice Response:", invoiceRes.body);

    } catch (e) {
        console.error("Error:", e);
    }
}

run();

const https = require('https');
const utils = require('./utils.js');

exports.predictImage =  async function predictImage(host, path, inputs) {
    return new Promise((resolve, reject) => {
        var result = null;
        const options = {
            hostname: host,
            port: 443,
            path: '/v2/models/traffic/infer',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
        };
        // Define the JSON data you want to post
        const postData = JSON.stringify(inputs); 
        // Create the HTTP request
        const req = https.request(options, (res) => {
            console.log(`statusCode: ${res.statusCode}`);
            let data = '';
            res.on('data', (chunk) => {
                data += chunk;
            });
        res.on('end', () => {
                console.log(JSON.parse(data).explanation);
                result = JSON.parse(data);
                console.log('model name:', result.model_name);
                utils.writeFile(data);
                resolve(result);
        });     
        });
        // Handle errors
        req.on('error', error => {
            console.error('Error:', error);
            reject(error);
        });
        // Write the JSON data to the request body
        req.write(postData);
        req.end();
    });
}

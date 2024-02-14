const fs = require('fs');

exports.writeFile = function writeFile(input) {
    try {
       fs.writeFileSync('./result.json', input);
    } catch (err) {
        console.log(err);
    }
}
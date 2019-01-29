const jwt = require('jsonwebtoken');
const fs = require('fs');

const privateKey = fs.readFileSync(__dirname + '/rsa/private.key', 'utf8');

// quickly see what this file exports
module.exports = {
    JWT,
};

// implementation details
function JWT(req, res, next) {
    const { username } = req.body;

    const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

    const payload = {
        username,
        ip
    };

    const signOptions = {
        expiresIn: "12h",
        algorithm: "RS256"
    };

    req.token = jwt.sign(payload, privateKey, signOptions);

    next();
}

const jwt = require('jsonwebtoken');
const fs = require('fs');

const publicKey = fs.readFileSync(__dirname + '/rsa/public.key', 'utf8');

// quickly see what this file exports
module.exports = {
    authenticate
};

// implementation details
function authenticate(req, res, next) {
    const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

    const verifyOptions = {
        expiresIn: "12h",
        algorithm: ["RS256"]
    };

    if (req.cookies.token) {
        console.log(req.cookies.token);
        jwt.verify(req.cookies.token, publicKey, verifyOptions, function (err, decoded) {
            if (err) {
                console.log('Failed to authenticate token.');
                return res.status(403).json({ error: 'Failed to authenticate token.' });
            } else if (decoded && decoded.ip !== ip) {
                console.log('User is attempting to use token from a different computer.');
                return res.status(403).json({ error: 'Failed to authenticate token.' });
            } else {
                console.log('Token decoded: ', decoded);
                req.decoded = decoded;
            }
        });
    } else {
        console.log('No cookie found.');
        return res.status(403).send({
            error: 'No token provided.'
        });
    }

    next();
}


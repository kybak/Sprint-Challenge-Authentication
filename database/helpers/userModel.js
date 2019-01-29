const db = require('../dbConfig.js');

module.exports = {
    get: function (id) {
        let query = db('users as u');

        if (id) {
            return query
                .where('id', id)
                .first();
        }

        return query.select('username');
    },
    insert: function (user) {
        return db('users')
            .insert(user)
            .then(([id]) => this.get(id));
    },
    login: function (username) {
        let query = db('users as u');

        return query
            .where('username', username)
            .first();
    }
};

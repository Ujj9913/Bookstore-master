const { body, header, validationResult } = require('express-validator');

module.exports = {
    BindUrl: function () {

        app.get('/login', async (req, res) => {
            res.render('login', { pageTitle: 'Login', user: null });
        })
        app.get('/signup', async (req, res) => {
            res.render('signup', { pageTitle: 'Signup', user: null });
        })
        app.get('/profile', async (req, res) => {
            res.render('profile', { pageTitle: 'Profile', user: null });
        })
        app.get('/editProfile', async (req, res) => {
            res.render('editProfile', { pageTitle: 'Profile', user: null });
        })


    }
}
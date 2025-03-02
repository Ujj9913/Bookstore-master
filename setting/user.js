const { body, header, validationResult } = require('express-validator');

module.exports = {
    BindUrl: function () {

        app.get('/login',async(req,res)=>{
            res.render('login', { pageTitle: 'Login', user: null });
        })
        app.get('/signup',async(req,res)=>{
            res.render('signup', { pageTitle: 'Signup', user: null });
        })
    }}
const { body, header, validationResult } = require('express-validator');

module.exports = {
    BindUrl: function () {

        app.get('/',async(req,res)=>{
            res.render('home', { pageTitle: 'Home', user: null });
        })
       
    }}
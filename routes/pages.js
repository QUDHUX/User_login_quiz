const express = require('express');
const router = express.Router();
const authController = require('../controller/auth')
router.get('/', (req, res)=>{
    res.render('index');
})
router.get('/register', (req, res)=>{
    res.render('register', {
        message: req.message
    });
});
router.get('/login', (req, res)=>{
    res.render('login', {
    message: req.message
    });

});
router.get('/profile', authController.isLoggedIn,(req, res)=>{
    if(req.user){
        res.render('profile', {
            user:req.user,
            gender:req.user.gender.value
        });
        
    }else{
        res.redirect('/login')
    }
});

router.get('/quiz', authController.isLoggedIn,(req, res)=>{
    if(req.user){
        res.render('quiz', {
            user:req.user,

        });
    }else{
        res.redirect('/login')
    }
});

module.exports = router;
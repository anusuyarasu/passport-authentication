var express = require('express');
var router = express.Router()
var fs = require('fs');
// var randompictures = require('random-picture');
var ImageGenerator = require('random-image-creator');
//image upload
var multer  = require('multer')
// var upload = multer({ dest: 'public/uploads/' })

const upload = require("../uploads/storage");
const Image = require("../models/images");

var userid;
var image;

var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

var User = require('../models/user');

router.get('/register',function(re,res){
    res.render('register');
});

router.get('/login',function(re,res){
    res.render('login');
});

router.get('/profile',ensureAuthenticated,function(req,res){
     console.log("userid",userid)
    Image.findOne({userid:userid}, (err, images)=>{
        if(err){
            if(err) throw err;
            // res.redirect('/users/profile')
        }else{ 
            image=images.image;
            console.log('images',image)
            res.render('profile',{
                url : "http://localhost:3000/static/uploads/"+image
            });
        } 
    });
   
    
});


router.get('/uploads',ensureAuthenticated,function(re,res){
    res.render('uploads');
});

function ensureAuthenticated(req,res,next){
    if(req.isAuthenticated()){
        return next();
    }
    else{
        res.redirect('/users/login');
    }
}

router.post('/register',function(req,res){
    let name = req.body.name;
    let username = req.body.username;
    let email = req.body.email;
    let password1 = req.body.password1;
    let password2 = req.body.password2;
    
    //validation
    req.checkBody('name','Name is required').notEmpty();
    req.checkBody('username','UserName is required').notEmpty();
    req.checkBody('email','email is required').notEmpty();
    req.checkBody('email','email is not valid').isEmail();
    req.checkBody('password1','Password is required').notEmpty();
    req.checkBody('password2','Password is not match').equals(req.body.password1);

    var errors = req.validationErrors();

    if(errors){
        res.render('register',{
            errors : errors           
        })
    }
    else{
        var newUser= new User({
             name : name,
             email: email,
             password : password1,
             username : username
        })

        User.createUser(newUser, function(err, user){
            if(err) throw err;
            console.log(user);
        })
        let image = new Image();
        randompictures().then(result=>{
            console.log(result.url)
            image.image = result.url;
            // image.userid =userid;
                //save the image
                image.save(()=>{
                    if(err){
                        console.log(err);
                    }else{
                        //render the view again 
                    }
                });
        })
      
                

        req.flash('success_msg', 'You are registered and can now login');
      
        res.redirect('login')

    }
})
passport.use(new LocalStrategy(
    function(username, password, done) {
        User.getUserByUsername(username,function(err,user){
            userid=user._id;
            if(err) throw err;
            if(!user){
                return done(null, false , {message: 'Unknown User'});
            }

            User.comparePassword(password,user.password, function(err, isMatch){
                if(err) throw err;
                if(isMatch){
                    return done(null, user);
                }
                else{
                    return done(null,false, {message: 'Invalid password'});
                }
            })
        })
    }
));

passport.serializeUser(function(user, done) {
    done(null, user.id);
});
  
passport.deserializeUser(function(id, done) {
    User.getUserById(id, function(err, user) {
        done(err, user);
    });
});
  
router.post('/login',passport.authenticate('local', {successRedirect:'/', failureRedirect:'/users/login',failureFlash: true}),
  function(req, res) {
    // console.log("login")
   
    res.redirect('/users/profile')
});

router.get('/logout' , function(req,res){
    req.logout();

    req.flash('success_msg', 'You are logged out');

    res.redirect('/users/login');   
})

router.post('/profile',function(req,res,next){
    console.log("Profile")
    console.log(userid)
    upload(req, res, function (err) {
        console.log(req.file)
        if(req.file == null || req.file == undefined || req.file == ""){
            //redirect to the same url            
            res.redirect("/users/profile");
            
        }else{
            
            if (err) {
                res.render('profile',{
                    errors : err         
                })
                req.flash('error_msg', 'Image not Uploaded');
                // console.log(err);
            }
            else{
                console.log(req.file);
                let image = new Image();
                image.image = req.file.filename;
                image.userid =userid;
                //save the image
                image.save(()=>{
                    if(err){
                        console.log(err);
                    }else{
                        //render the view again 
                        req.flash('success_msg', 'Image Uploaded');

                        res.redirect("/users/profile");
        
                    }
                });
            }
        }
    }); 
})




module.exports = router;
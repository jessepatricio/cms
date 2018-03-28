const express = require('express');
const router = express.Router();
const Post = require('../../models/Post');
const Category = require('../../models/Category');
const User = require('../../models/User');
const bcrypt = require('bcryptjs');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;


router.all('/*', (req, res, next)=>{

    req.app.locals.layout = 'home';
    next();
});

router.get('/', (req, res)=>{
    //res.send('Test root: it works');
    //req.session.author = 'Jesse Patricio'; 
    // if (req.session.author){
    //     console.log(`Author: ${req.session.author}`);
    // }

    const perPage = 10;
    const page = req.query.page || 1;

    Post.find({})
        .populate('user')
        .skip((perPage * page) - perPage)
        .limit(perPage)
        .then(posts=>{
        
            Post.count().then(postCount=>{
                Category.find({}).then(categories=>{
                    res.render('home/index', {
                        posts: posts, 
                        categories: categories,
                        current: parseInt(page),
                        pages: Math.ceil(postCount / perPage)
                    });
                });
            });
        });

       
  

    //res.render('home/index');

});

router.get('/about', (req, res)=>{

    res.render('home/about');

});

router.get('/login', (req, res)=>{
   
    res.render('home/login');

});

//app login
passport.use(new LocalStrategy({usernameField: 'email'},(email, password, done)=>{

    User.findOne({email: email}).then(user=>{
        
        if(!user) return done(null, false, {message: 'No user found!'});

        bcrypt.compare(password, user.password, (err, matched)=>{
            if (err) throw err;
            if (matched) {
                return done(null, user);
            } else {
                return done(null, false, { message: 'Incorrect password.' });
            }
        });

    });

}));

passport.serializeUser((user, done)=>{
    done(null, user.id);
});

passport.deserializeUser((id, done)=>{
    User.findById(id, (err, user)=>{
        done(err, user);
    });
});

router.post('/login', (req, res, next)=>{
   
    passport.authenticate('local', {
        
        successRedirect: '/admin',
        failureRedirect: '/login',
        failureFlash: true

    })(req, res, next);
});

router.get('/logout', (req, res)=>{

    req.logOut();
    res.redirect('/login');

});


router.get('/register', (req, res)=>{
   
    res.render('home/register');

}); 

router.post('/register', (req, res)=>{
   
  

    let errors = [];
    
    if (!req.body.firstname) {
        errors.push({message: 'please enter your firstname'});
    }

    if (!req.body.lastname) {
        errors.push({message: 'please add a lastname'});
    }

    if (!req.body.email) {
        errors.push({message: 'please add an email'});
    }

    if (!req.body.password) {
        errors.push({message: 'please add a password'});
    }

    if (!req.body.passwordConfirm) {
        errors.push({message: 'please confirm your password'});
    }

    if (req.body.password !== req.body.passwordConfirm) {
        errors.push({message: 'Password fields don\'t match'});
    }

    if(errors.length > 0) {
       
        res.render('home/register', {
            errors: errors,
            firstname: req.body.firstname,
            lastname: req.body.lastname,
            email: req.body.email
            
        });

    } else {
        
        User.findOne({email: req.body.email}).then(user=>{
           
            if(user) {
                req.flash('info_message', 'That email existed, please login.');
                res.redirect('/login');
            } else {
                //res.send('data was good');
                const newUser = new User({
                    firstname: req.body.firstname,
                    lastname: req.body.lastname,
                    email: req.body.email,
                    password: req.body.password
                });

                bcrypt.genSalt(10, (err, salt)=>{
                    bcrypt.hash(newUser.password, salt, (err, hash)=>{
                        //console.log(hash);
                        newUser.password = hash;
                        newUser.save().then(savedUser=>{
                            req.flash('success_message', 'You are now registered, please login.');
                            res.redirect('/login');
                        });
                    })
                });
            }
        });
   }
}); 

router.get('/posts/:slug', (req, res)=>{
   
    Post.findOne({slug: req.params.slug})
        .populate({path: 'comments', match: {approveComment: true}, populate: {path: 'user', model: 'users'}})
        .populate('user')
        .then(post => {
           
            Category.find({}).then(categories=>{

                res.render('home/post', {post: post, categories: categories});

            })
            
        });
    

});


module.exports = router;
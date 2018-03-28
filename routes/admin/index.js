const express = require('express');
const router = express.Router();
const faker = require('faker');

const Post = require('../../models/Post');
const Category = require('../../models/Category');
const Comment = require('../../models/Comment');

const { userAuthenticated } = require('../../helpers/authentication');

router.all('/*', (req, res, next)=>{
    req.app.locals.layout = 'admin';
    next();
});

router.get('/', (req, res)=>{

    const promises = [

        Post.count().exec(),
        Category.count().exec(),
        Comment.count().exec()

    ];
    
    Promise.all(promises).then(([postCount, categoryCount, commentCount])=>{

        res.render('admin/index', {
            postCount: postCount,
            categoryCount: categoryCount,
            commentCount: commentCount
        });

    });

    // Post.count().then(postCount=>{
    //     res.render('admin/index', {postCount: postCount});
    // });
     
   
});

router.post('/generate-fake-posts', (req, res)=>{

    if(req.user === undefined) {
        req.flash('info_message', 'You need to login to generate records.');
        res.redirect('/login');
    } else {
        
        console.log('Creating ' + req.body.amount + ' dummy records.');
        for(let i = 0; i < req.body.amount; i++) {

            let post = new Post();
            
            post.title = faker.name.title();
            post.status = 'public';
            post.allowComments = faker.random.boolean();
            post.body = faker.lorem.sentence();
            post.user = req.user.id;
            post.save((err)=>{if (err) throw err;});
            
        }

        console.log(`Done.`);
        res.redirect('/admin/posts');
    }
});

router.get('/dashboard', (req, res)=>{
   res.render('admin/dashboard');
});

module.exports = router;
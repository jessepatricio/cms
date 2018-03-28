const express = require('express');
const router = express.Router();
const Post = require('../../models/Post');
const Category = require('../../models/Category');
const { isEmpty, uploadDir } = require('../../helpers/upload-helper');
const fs = require('fs');
const { userAuthenticated } = require('../../helpers/authentication');


router.all('/*', (req, res, next)=>{
    req.app.locals.layout = 'admin';
    next();
});

router.get('/', (req, res)=>{
    Post.find({})
        .populate('category')
        .populate('user')
        .then(posts=>{
        res.render('admin/posts', {posts: posts});
    });
});

router.get('/my-posts', (req, res)=>{

    if(isEmpty(req.user)) {
        res.redirect('/login');
    } else {

        Post.find({user: req.user.id})
            .populate('category')
            .populate('user')
            .then(posts=>{
                res.render('admin/posts/my-posts', {posts: posts});
        });
    }
});

router.get('/create', (req, res)=>{
    Category.find({}).then(categories=>{
        res.render('admin/posts/create', {categories: categories});
    });
    
});

router.get('/edit/:id', (req, res)=>{
    Post.findOne({_id: req.params.id}).then(post=>{
        Category.find({}).then(categories=>{
            res.render('admin/posts/edit', {post: post, categories: categories});
        });
    });
});

router.put('/edit/:id', (req, res)=>{
    //console.log(req.params.id);
    Post.findOne({_id: req.params.id}).then(post=>{

        if (!isEmpty(req.files)) {

            let file = req.files.file;
            filename = Date.now()+ '-' + file.name;
            post.file = filename;
            
            let dirUploads = './public/uploads/';
    
            file.mv(dirUploads + filename, (err)=>{
                if(err) throw err;
            });
    
            //console.log(filename);
        }

        let allowComments = (req.body.allowComments === 'on') ? true : false;

        post.user = req.user.id;
        post.title = req.body.title;
        post.status = req.body.status
        post.allowComments = allowComments;
        post.body = req.body.body;
        post.category = req.body.category;

        post.save().then(updatedPost=>{
            req.flash('success_message', 'Post was successfully updated!');
            res.redirect('/admin/posts/my-posts');
        }).catch(error =>{
            console.log('could not save edited post! [' + error + ']');
        });

    }).catch(error =>{
        console.log('could not find id: ' + req.params.id);
    });
});

router.delete('/:id', (req, res)=>{
    
    //remove record only
    // Post.remove({_id: req.params.id})
    //  .then(result => {
    //      res.redirect('/admin/posts');
    //  });

    //remove record and file
    Post.findOne({_id: req.params.id})
        .populate('comments')
        .then(post => {

            fs.unlink(uploadDir + post.file, (err)=>{

                //console.log(post.comments);

                if(!post.comments.length < 1) {
                    post.comments.forEach(comment=>{
                        comment.remove();
                    });
                }

                post.remove().then(postsRemoved=>{
                    req.flash('success_message', 'Post was successfully deleted!');
                    res.redirect('/admin/posts/my-posts');
                });
                
            });
        
            
        });



});

router.post('/create', (req, res)=>{
    
    let errors = [];

    if(!req.body.title) {
        errors.push({message: 'please add a title'});
    }

    if(!req.body.body) {
        errors.push({message: 'please add a description'});
    }

    if(errors.length > 0) {
        res.render('admin/posts/create', {
            errors: errors
        });
    } else {

        let filename = '';

        if (!isEmpty(req.files)) {

            let file = req.files.file;
            filename = Date.now()+ '-' + file.name;
            let dirUploads = './public/uploads/';

            file.mv(dirUploads + filename, (err)=>{
                if(err) throw err;
            });

            //console.log(filename);
        }
        //handling boolean field in form
        let allowComments = (req.body.allowComments === 'on') ? true : false;
        //using model object
        const newPost = new Post({
            user: req.user.id,
            title: req.body.title,
            status: req.body.status,
            allowComments: allowComments,
            body: req.body.body,
            category: req.body.category,
            file: filename
        })
        //saving post object to mongo db
        newPost.save().then(savedPost=>{
            req.flash('success_message', `Post ${savedPost.title} was created successfully!`);
            res.redirect('/admin/posts');
        }).catch(error =>{
            console.log(error, 'could not save post!');
        });
    }

});

module.exports = router;
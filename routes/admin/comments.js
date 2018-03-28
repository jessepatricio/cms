const express = require('express');
const router = express.Router();
const Post = require('../../models/Post');
const Comment = require('../../models/Comment');

router.all('/*', (req, res, next)=>{
    req.app.locals.layout = 'admin';
    next();
});

router.get('/', (req, res)=>{

    Comment.find({})
        .populate('user')
        .then(comments=>{
        res.render('admin/comments', {comments: comments});
    });
    

});

router.delete('/:id', (req, res)=>{
    
    //remove record only
    Comment.remove({_id: req.params.id})
     .then(deletedItem => {
         
        Post.findOneAndUpdate({comments: req.params.id}, {
            $pull: {comments: req.params.id}}, (err, data)=>{
                if (err) console.log(err);
                res.redirect('/admin/comments');
        });
         
         
     });

});

router.post('/', (req, res)=>{

    //res.send('it works');

    Post.findOne({_id: req.body.id}).then(post=>{
        
        //console.log(post);
        const newComment = new Comment({
            user: req.user.id,
            body: req.body.body
        });

        //console.log(newComment);

        post.comments.push(newComment);
        
        post.save().then(savedPost=>{
            newComment.save().then(savedComment=>{

                req.flash('success_message', 'Your comment will be reviewed in a moment.')
                res.redirect(`/posts/${post.slug}`);
            });
        });

    });   
});


router.post('/approve-comment', (req, res)=>{

    Comment.findByIdAndUpdate(req.body.id, 
        {$set: {approveComment: req.body.approveComment}}, (err, result)=>{
            if(err) return err;
            res.send(result);s
    });
   // console.log(req.body.approveComment);

});


module.exports = router;
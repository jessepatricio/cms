const express = require('express');
const app = express();
const path = require('path');
const exphbs = require('express-handlebars');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const upload = require('express-fileupload');
const session = require('express-session');
const flash = require('connect-flash');
const { mongoDbURL } = require('./config/database');
const passport = require('passport');


mongoose.Promise = global.Promise;

mongoose.connect(mongoDbURL).then((db)=>{
    console.log('MONGO connected');
}).catch(error=> console.log(`ERROR CONNECTING TO MONGODB: ` + error));

//using static
app.use(express.static(path.join(__dirname, 'public')));

//use helpers function
const {select, formatDate, paginate} = require('./helpers/handlebars-helpers');

//set view engine
app.engine('handlebars', exphbs({defaultLayout: 'home', helpers: {
    select: select, 
    formatDate: formatDate,
    paginate: paginate

}}));
app.set('view engine', 'handlebars');

//upload middleware
app.use(upload());

//body parser
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

//method override
app.use(methodOverride('_method'));

//load routes
const main = require('./routes/home/index');
const admin = require('./routes/admin/index');
const posts = require('./routes/admin/posts');
const categories = require('./routes/admin/categories');
const comments = require('./routes/admin/comments');



//session
app.use(session({
    secret: 'jesse1974',
    resave: true,
    saveUninitialized: true
}));

app.use(flash());

//passport

app.use(passport.initialize());
app.use(passport.session());

//local variables using middleware
app.use((req, res, next)=>{
    res.locals.user = req.user || null;
    res.locals.success_message = req.flash('success_message');
    res.locals.error_message = req.flash('error_message');
    res.locals.info_message = req.flash('info_message');
    res.locals.error = req.flash('error');
    next();
});

//use routes
app.use('/', main);
app.use('/admin', admin);
app.use('/admin/posts', posts);
app.use('/admin/categories', categories);
app.use('/admin/comments', comments)

const port = process.env.PORT || 4500;

app.listen(port, ()=>{
    console.log(`Listening on port ${port}`);
});

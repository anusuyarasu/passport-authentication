var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var exphs = require('express-handlebars');
var expressValidators = require('express-validator');
var flash = require('connect-flash');
var session = require('express-session');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var mongo =require('mongodb');
var mongoose =require('mongoose');
mongoose.connect('mongodb://localhost/loginapp')


var routes = require('./routes/index');
var users = require('./routes/users');


var app =express();

app.set('views', path.join(__dirname, 'views'));
app.engine('handlebars',exphs({defaultLayout: 'layout'}));
app.set('view engine', 'handlebars');

app.use(express.static(path.join(__dirname,'public')));
app.use('/static', express.static('public'))
// app.use('/imggetter',express.static(express. path.join(__dirname,'uploads')));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(session({
    secret : 'secret',
    saveUninitialized : true,
    resave: true
}));

app.use(passport.initialize());
app.use(passport.session());

app.use(expressValidators({
    errorFormatter: function(param, msg ,value){
        var namespace = param.split('.')
        ,root = namespace.shift()
        , formParam = root;

     while(namespace.length){
        formParam += '[' + namespace.shift() + ']';
     }
     return {
        param : formParam,
        msg   : msg,
        value : value
     };
    }
}));

app.use(flash());

app.use(function(req,res,next){
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');
    res.locals.user = req.user || null;
    next();
});

app.use('/', routes);
app.use('/users', users);


app.set('port', (process.env.PORT || 3000));

app.listen(app.get('port'), function(){
    console.log('Server started on port ' + app.get('port'));
})
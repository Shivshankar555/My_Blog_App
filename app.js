const express = require('express'),
      mongoose = require('mongoose'),
      path = require('path'),
      passport = require('passport'),
      methodOverride = require("method-override"),
      flash = require("connect-flash"),
      session = require('express-session'),
      bodyParser = require("body-parser"),
      LocalStrategy = require('passport-local'),
      User = require("./models/user"),
      Blog = require("./models/blog")






const blogRoutes = require("./routes/blog");


let app = express();


app.set('view engine', 'ejs');


// connecting databse 
mongoose.connect('mongodb://localhost/my_blog', 
{useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
useUnifiedTopology: true
});


//  session configration
const sessionConfig = {
     secret: 'whatever you want',
     resave: false,
     saveUninitialized: true,
     cookie: {
        httpOnly: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    } 
};

app.use(session(sessionConfig));
app.use(flash());

// to use public directory
app.use(express.static(path.join(__dirname, 'public')));

// passport configration
app.use(passport.initialize());
app.use(passport.session());

app.use(methodOverride("_method"));

passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// create application/json parser
const jsonParser = bodyParser.json()
 
// create application/x-www-form-urlencoded parser
const urlencodedParser = bodyParser.urlencoded({ extended: false })

app.use((req, res, next) =>{
    res.locals.currentUser = req.user;
    next();
})

app.get("/",(req,res)=>{
    res.render('home',{ messages : req.flash('success')});
})

// course page
app.get("/course",(req,res)=>{
    if(!req.isAuthenticated()){
        req.flash("error","You must be signed In.");
        return res.redirect('/login');
    }
    res.render('courses');
})
//  dashboard page
app.get("/dashboard",(req,res)=>{
    if(!req.isAuthenticated()){
        req.flash("error","you must be logged In.");
        return res.redirect("/login");
    }
    res.render('dashboard');
})

// show page
app.get("/show",(req,res)=>{
    if(!req.isAuthenticated()){
        req.flash("error","you must be logged In.");
        return res.redirect("/login");
    }
    
    res.render('show');
})

// handle the signup request
app.get("/signup",(req,res)=>{
    res.render("signup",{messages : req.flash('error')});
})


app.post("/signup",urlencodedParser, async(req,res)=>{

    
    try {
        const { email, username, password } = req.body;
        const user = new User({ email, username });
        const registeredUser = await User.register(user, password);
        req.login(registeredUser, err => {
            if (err) return next(err);
            req.flash('success', 'successfully registered!');
            res.redirect('/');
        })
    } catch (e) {
        req.flash('error', e.message);
        res.redirect('/signup');
    }
    
});

// login route
app.get("/login",(req,res)=>{
    res.render("login",{messages : req.flash('error')});
})

app.post("/login",urlencodedParser,passport.authenticate('local',{failureFlash:true, failureRedirect:"/login"}),(req,res)=>{
    req.flash("success","welcome back!");
    res.redirect("/");
})

// logout route
app.get("/logout",(req,res)=>{
    req.logout();
    req.flash("success","user logged out!");
    res.redirect("/");
})


//  Using blogRoutes
app.use(blogRoutes);


// listening to localhost...
app.listen(4000,()=>{
    console.log('server is running...');
})
// DEPENDENCIES --------------------------------------
import mongoose from 'mongoose';
import express from 'express';
import { Blog } from './modules/blog.mjs';

// For salting
import crypto from 'crypto';
// For auth
import passport from 'passport';
import session from 'express-session';
// For salting passwords
import pbkdf2 from 'pbkdf2';
import passHTTP from 'passport-http';
const Strategy = passHTTP.BasicStrategy;

// APP VARIABLES -------------------------------------
const app = express();
const PORT = 3000;

// CONFIG ---------------------------------------------

// Use public directory
app.use(express.static('public'));

// Use json parser
app.use(express.json());
app.use(express.urlencoded({
    extended: true
}));

// Automatically finds and uses PugJS
app.set('view engine', 'pug');

// Attempt to connect to mongo through mongoose
mongoose
    .connect("mongodb+srv://sliterd:badpassword1@cluster0.4g78m.mongodb.net/?retryWrites=true&w=majority")
    .then( (res, rej) => { console.log("Connected") })
    .catch((err) => { 
        console.log(err);
        process.exit(1); 
    });


// Create Mongoose Schema
const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    salt: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    }
});

// Make a model of the User schema
const User = mongoose.model('User', UserSchema);

// Passport --------------------------------------------------------------------------------------------

// Write session info of current user to DB
passport.serializeUser( function(user, done) {
    done(null, user);
});
// Erase session info?
passport.deserializeUser( function(obj, done) {
    done(null, obj);
});

app.use(session( {secret: 'keyboard cat', resave: false, saveUninitialized: false}));
app.use(passport.session());
// VALIDATION --------------------------------------------------------------------

app.use(passport.initialize());

// Check if provided password is same as password hash stored in DB
const validPassword = function(password, salt, hash) {
    let key = pbkdf2.pbkdf2Sync(password, salt, 1, 32, 'sha512');
    
    if ( key.toString('hex') != hash ) {
        return false;
    } else {
        return true;
    }
}

// Validate User function (checking valid auth)
passport.use(new Strategy(
    function(username, password, done) {
        User.findOne({ username: username }, 
            function(err, user) {
            // Can't connect to DB? We're done
            if(err) {
                return done(err);
            }
            // User doesn't exist? We're done
            if(!user) {
                console.log("No user found.");
                return done(null, false);
            }
            // Got this far? Check the password
            if(!validPassword(password, user.salt, user.password)) {
                console.log("Wrong Password");
                return done(null, false);
            }
            // Otherwise let them in and store the user in req
            return done(null, user)
        });
    }
));

// Alias for passport authenticate method
const checkAuth = passport.authenticate('basic', { session: false })


// ROUTES ---------------------------------------------

// API route to get JSON array of Blog Posts
app.get('/api/entries/', async (req, res) => {
    const results = await Blog.find({});
    res.json(results);   
});

// Render view of all blog posts using Pug
app.get('/web/entries', checkAuth, async (req, res) => {
    const results = await Blog.find({});
    // Grab username from req.user
    const username = req.user.username;
    // Render a template, 'allentries'
    res.render('allentries', {
        // Set allentries to the array returned from DB
        allentries: results,
        // Pass username to view
        username: username
    });
});

app.get('/', async (req, res) => {
    const results = await Blog.find({});
    res.render('allentriespublic', {
        allentries: results
    });
})
// Render newentry form for making new Blog Posts
// Require checkAuth to load page
app.get('/web/newentry', checkAuth, (req, res) => {
    res.render('newentry');
});

// Handle post request to /web/newentry
app.post('/web/newentry', async (req, res) => {
    console.log(req.body);
    if (req.body.title == "" || req.body.author == "" || req.body.body == "") {
        console.log("Cannot save empty entry...");
        res.status(500).send("Entries must have Title, Author, and Content...");
    } else {
        // Save body data to model
        const post = new Blog(req.body);
        // try to save to DB
        post.save();
        // Upon successful save, redirect to entries
        res.redirect('/web/entries');
    }
});

app.delete('/web/delete/:title/:author', async (req, res) => {
    console.log("Delete request recieved...")
    let data = req.params;
    console.log(data)
    Blog.deleteOne(data, (err) => {
        if ( err ) {
            console.log(err);
        } else {
            console.log("Item deleted!");
        }
    });
    res.redirect('back');
})

// SERVER ----------------------------------------------
app.listen(PORT, () => {
    console.log("Listening on Port 3000....");
});
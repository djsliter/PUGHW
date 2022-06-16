// DEPENDENCIES --------------------------------------
import mongoose from 'mongoose';
import express from 'express';
import { Blog } from './modules/blog.mjs';

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
async function connect() {
    await mongoose.connect(
        'mongodb+srv://sliterd:badpassword1@cluster0.4g78m.mongodb.net/?retryWrites=true&w=majority'
        );
}
// Catch error if connection to DB fails
connect().catch( (err) => {
    console.log(err);
    process.exit(1);
})

// ROUTES ---------------------------------------------

// API route to get JSON array of Blog Posts
app.get('/api/entries/', async (req, res) => {
    const results = await Blog.find({});
    res.json(results);   
});

// Render view of all blog posts using Pug
app.get('/web/entries', async (req, res) => {
    const results = await Blog.find({});
    // Render a template, 'allentries'
    res.render('allentries', {
        // Set allentries to the array returned from DB
        allentries: results
    });
});
// Render newentry form for making new Blog Posts
app.get('/web/newentry', (req, res) => {
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
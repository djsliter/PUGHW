import mongoose from "mongoose";

// Grabs the Schema class from mongoose library
const { Schema } = mongoose;

// defines the schema for a blog entry
const BlogSchema = new Schema( {
    title: {
        type: String,
        required: true
    },
    author: String,
    body: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    },
    comments: [
        {
            body: String,
            date: {
                type: Date,
                default: Date.now
            }
        }
    ],
    hidden: Boolean,
    meta: {
        votes: Number,
        favs: Number
    }
});

export const Blog = mongoose.model('Blog', BlogSchema);
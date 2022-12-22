const mongoose=require("mongoose");

const blogSchema = mongoose.Schema({
  image:[],
  imageLink:String,
  title: String,
  content: String,
  addDate: String,
  author_id: String,
  author:String
});
const Blog = mongoose.model("Blog", blogSchema);

module.exports = Blog;
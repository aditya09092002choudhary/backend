const mongoose=require('mongoose');

const newsSchema= mongoose.Schema({
    title:String,
    pubDate:String,
    image_url:String,
    description:String,
    link:String
});

const News = mongoose.model("News",newsSchema);

module.exports = News;
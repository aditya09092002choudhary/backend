
const express = require('express')
const app = express()
const cors = require('cors')
const mongoose = require('mongoose')
const User = require('./models/user.model')
const Blog = require('./models/blog.model')
const News = require('./models/news.model')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const passport = require('passport')
const dotenv = require("dotenv");
dotenv.config();

app.use(cors())
app.options('*', cors())
app.use(express.urlencoded({extended:true}))
app.use(express.json())
app.use(passport.initialize());
const PORT = process.env.PORT||1337;
const date = new Date();
const uri = process.env.ATLAS_URI
const addDate = `${date.getDate()}/${
  date.getMonth() + 1
}/${date.getFullYear()}`;
require('./passport');


// mongoose.connect('mongodb://localhost:27017/daily1DB');
mongoose.connect("mongodb+srv://adityachoudhary1980:Aditya88@cluster0.9ikok.mongodb.net/dailyDB?retryWrites=true&w=majority");

app.get("/", (req, res) => {
	// res.send("Live");
	Blog.find({}, (err, foundBlogs) => {
	  if (err) {
		console.log(err);
	  } else {
		res.send(foundBlogs);
	  }
	});
  });

  app.post("/compose",(req, res) => {
	//   console.log(req.body);
	  const name=req.body.fName+" "+req.body.lName;
      const blog = new Blog({
	  image:req.body.image,
	  imageLink:req.body.imageLink,
      title: req.body.title,
      content: req.body.content,
      addDate: addDate,
      author_id: req.body.username,
	  author:name
    });
    if (blog.title.trim().length !== 0 && blog.content.trim().length !== 0) {
      blog.save((err) => {
        if (err) {
          console.log(err);
        } else {
          console.log("Saved");
          res.send("Saved");
        }
      });
    }
  });

  // ----------------------------------- Posts Route -----------

app.get("/posts/:id", (req, res) => {
	const requiredId = req.params.id;
	Blog.findOne({ _id: requiredId }, (err, foundBlog) => {
	  if (err) {
		console.log(err);
	  } else {
		res.send(foundBlog);
		
	  }
	});
  });
  
  app.get("/remove/:id", (req, res) => {
	const requiredId = req.params.id;
	  Blog.deleteOne({ _id: requiredId }, (err) => {
		if (err) {
		  console.log(err);
		} else {
		  console.log("Successfully Deleted!!");
		}
		res.send("Success");
	  });
  });

app.post('/register',(req,res)=>{
	const user = new User({
		fName:req.body.fName,
		lName:req.body.lName,
		username:req.body.username,
		password:bcrypt.hashSync(req.body.password,10)
	})
	user.save().then(user=>{
		res.send({
			success:true,
			message:"User created successfully",
			user:{
				id:user._id,
				username:user.username
			}
		})	
	}).catch(err=>{
		res.send({
			success:false,
			message:"Something went wrong",
			error:err
		})
	})
})

app.post('/login',(req,res)=>{
	User.findOne({username:req.body.username}).then(user=>{
		if(!user){
			return res.status(401).send({
				success:false,
				message:"Could not find the user. "
			})
		}
		if(user.role!==req.body.role){
			return res.status(401).send({
				success:false,
				message:"Could not find the user. Check your role "
			})
		}
		if(!bcrypt.compareSync(req.body.password,user.password)){
			return res.status(401).send({
				success:false,
				message:"Incorrect password"
			})
		}
		const  payload ={
			username:user.username,
			id:user._id
		}
		const token = jwt.sign(payload,"Random String",{expiresIn:"1d"})

		return res.status(200).send({
			success:true,
			message:"Logged in successfully",
			token: "Bearer "+token
		})
	})
})

app.post("/uPassword",(req,res)=>{
	User.findOne({username:req.body.auth.username}).then(user=>{
		if(!user){
			return res.status(401).send({
				success:false,
				message:"Could not find the user."
			})
		}
		if(user.role!==req.body.auth.role){
			return res.status(401).send({
				success:false,
				message:"Could not find the user. Check your role."
			})
		}
		if(!bcrypt.compareSync(req.body.auth.password,user.password)){
			return res.status(401).send({
				success:false,
				message:"Incorrect password"
			})
		}
		User.updateOne({username:req.body.auth.username},{$set:{password:bcrypt.hashSync(req.body.newPassword,10)}},(err)=>{
			if(err){
				return res.status(401).send({
					success:false,
					message:"Internal error, Please try again later."
				})
			}else{
				return res.status(200).send({
					success:true,
					message:"Password is successfully updated."
				})
			}
		})
	})
})

app.post("/updatePassword",(req,res)=>{
	// console.log(req.body.username,req.body.password.newPass);
	User.updateOne({username:req.body.username},{$set:{password:bcrypt.hashSync(req.body.password.newPass,10)}},(err)=>{
		if(err){
			return res.status(401).send({
				success:false,
				message:"Internal error, Please try again later."
			})
		}else{
			return res.status(200).send({
				success:true,
				message:"Password is successfully updated."
			})
		}
	})
})

app.get("/protected",passport.authenticate('jwt',{session:false}),(req,res)=>{
	res.status(200).send({
		success:true,
		user:{
			id:req.user._id,
			username:req.user.username,
			fName:req.user.fName,
			lName:req.user.lName,
			role:req.user.role
		}
	})
})


app.get("/edit/:id", (req, res) => {
	const rid = req.params.id;
	Blog.findOne({ _id: rid }, (err, foundBlog) => {
	  if (err) {
		console.log(err);
	  } else {
		res.send(foundBlog);
	  }
	});
  });
  app.post("/edit/:id", (req, res) => {
	const rid = req.params.id;
	const rtitle = req.body.data.title;
	const rcontent = req.body.data.content;
	let rimage= req.body.image;
	const rimageLink=req.body.imageLink;
	// console.log(req.body.data.title);
	if(rimageLink!=""){
		rimage=[];
	}
	Blog.updateOne(
	  { _id: rid },
	  { $set: { title: rtitle, content: rcontent,image:rimage,imageLink:rimageLink } },
	  (err) => {
		if (err) {
		  console.log(err);
		  res.send("Failure");
		} else {
		//   console.log("Updated Successfully");
		  res.send("Success");
		  // res.redirect("/");
		}
	  }
	);
  });

  app.get('/author/:id',(req,res)=>{
	  User.findById(req.params.id,(err,foundUser)=>{
		  if(err){
			  res.send("User not found !");
		  }else{
			  res.send(foundUser.fName+" "+foundUser.lName);
			//   console.log(foundUser.fName+" "+foundUser.lName);
		  }
	  })
  })

//------------------------  News -------------------

app.get("/all/news",(req,res)=>{
	News.find({},(err,foundNews)=>{
		if(err){
			console.log(err);
		}else{
			res.send(foundNews);
		}
	})
})

app.post("/all/news",(req,res)=>{
	const news= new News(req.body);
	news.save((err)=>{
		if(err){
			console.log(err);
			res.send("News not saved, try again!");
		}else{
			console.log("News is saved Successfully !");
			res.send("News is saved successfully, reload the page for updates.");
		}
	})
})

app.post("/delete/news",(req,res)=>{
	News.deleteOne({_id:req.body.id},(err)=>{
		if(err){
			console.log("News is not able to delete, try again.");
			res.send("News is not able to delete, try again.");
		}else{
			console.log("News is deleted.");
			res.send("News is deleted successfully, reload the page for updates.");
		}
	})
})

//----------------------------- Update user role ---------------------

app.post('/role',(req,res)=>{
	console.log(req.body);
	User.findOne({username:req.body.username}).then(user=>{
		if(!user){
			return res.status(401).send({
				success:false,
				message:"Could not find the user. "
			})
		}
		if(user.role!==req.body.role){
			return res.status(401).send({
				success:false,
				message:"Wrong Credentials, try again."
			})
		}
		User.updateOne({username:req.body.username},{$set:{role:req.body.newrole}},(err)=>{
			if(err){
				return res.status(401).send({
					success:false,
					message:"Internal error, Please try again later."
				})
			}else{
				return res.status(200).send({
					success:true,
					message:"Role is updated successfully."
				})
			}
		})
	})
})

app.listen(PORT, () => {
	console.log(`Server started on ${PORT}`)
})
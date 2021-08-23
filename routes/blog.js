const express = require("express");
const router = express.Router();
const Blog = require("../models/blog");
bodyParser = require("body-parser");



// create application/x-www-form-urlencoded parser
const urlencodedParser = bodyParser.urlencoded({ extended: false });


// INDEX --> show all the blogs in the list
router.get("/blogs",(req,res)=>{
    // get all the blogs from the DB
    Blog.find({},(err,blogs)=>{
        if(err){
            console.log(err);
        }else{
             res.render("blog/index",{blogs:blogs});
        }
    });
});


// CREATE --> add new blog to the list
router.post("/blogs",urlencodedParser,isLoggedIn,(req,res)=>{
    // get data from FORM and add to the DB
    const name = req.body.name;
    const image = req.body.image;
    const description = req.body.description;
    const author = {
        id: req.user._id,
        username: req.user.username
    }
    const newBlog = {
        name: name,
        image: image,
        description: description,
        author:author
    };
    // create new blog and save to DB
    Blog.create(newBlog,(err,blog)=>{
        if(err){
            console.log(err);
        }else{
        // redirect again to home page
            res.redirect("/blogs");
        }
    });
   
   
});

// NEW --> show form to add new blog to the existing list.
router.get("/new/blogs",isLoggedIn,(req,res)=>{
    res.render("blog/new");
});

// SHOW --> show more info about the selected blog
router.get("/blogs/:id",(req,res)=>{

    Blog.findById(req.params.id,(err,foundBlog)=>{
        if(err){
            console.log(err);
        }else{
            // console.log(foundBlog);
            // render show template with the foundBlog
            res.render("blog/show",{blog:foundBlog});
        }
    });
    
});

// EDIT EXISTING BLOG ROUTE
router.get("/blogs/:id/edit",urlencodedParser,checkOwnership,(req,res)=>{
    Blog.findById(req.params.id,(err,foundBlog)=>{
       res.render("blog/edit",{blog:foundBlog});
      });

});

// UPDATE EXISTING blog ROUTE
router.put("/blogs/:id",urlencodedParser,checkOwnership,(req,res)=>{
    Blog.findByIdAndUpdate(
        req.params,
        req.body.blog,
        (err,updatedblog)=>{
    if(err){
        res.redirect("/blogs")
    }else{
        res.redirect("/blogs/"+ req.params.id);
    }
   });
});

// deleting a particular blog

router.delete("/blogs/:id",urlencodedParser,checkOwnership,(req,res)=>{
    Blog.findByIdAndDelete(req.params.id,(err)=>{
        if(err){
            res.redirect("/blogs");
        }else{
            res.redirect("/blogs");
        }
    });
});

function checkOwnership(req, res, next) {
    if(req.isAuthenticated()){
        Blog.findById(req.params.id,(err, foundBlog)=>{
              if(err){
                  req.flash("error","Blog not found.");
                  res.redirect("back");
              }  else {
                  // does user own the campground?
                  console.log(foundBlog);
                  console.log(foundBlog.author);
               if(foundBlog.author.id.equals(req.user._id)) {
                   next();
               } else {
                   req.flash("error","permission denied!");
                   res.redirect("back");
               }
              }
           });
       } else {
           req.flash("error","please login first!");
           res.redirect("back");
       }
     }
   



function isLoggedIn(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
    req.flash("error","Please login first!");
    res.redirect("/login");
}


module.exports = router;
var mongoose = require("mongoose");
const Schema = mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose');

// Schema--> creating a structure
var blogSchema = new mongoose.Schema({
    name:String,
    image:String,
    description:String,
    author: {
      id: {
         type: mongoose.Schema.Types.ObjectId,
         ref: "User"
      },
      username: String
   }

});

blogSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("Blog",blogSchema)
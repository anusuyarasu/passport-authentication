
let mongoose = require("mongoose");

//create the Schema
let imagesSchema = mongoose.Schema({
    image : {
        type : String,
        required: true
    },
    userid :{
        type: String
    }

});

let Image= module.exports= mongoose.model("Image", imagesSchema);
const mongoose = require('mongoose');

//add roles
//Note:
// Add city,province,country and postal code
const merchantSchema = mongoose.Schema({
    firstname:{
        type: String, require: true

    },
    lastname:{
        type: String, require: true
    },
    companyname: {
        type: String
    },
    merchantid:{
        type:String, require:true,unique:true
    },
    phone: {
        type: String, require: true
    },
    role: {
        type: String, require:true
    },
    email: {
        type: String, require: true, unique:true
    },
    password: {
        type: String, require: true
    },
    address:{
        type: String, 

    },
    city:{
        type: String, 

    },
    province:{
        type: String, 

    },
    postalcode:{
        type: String, 

    },
    profile:{
        type:String
    }
})

// userSchema.post('save', (doc, next) => {
//     console.log('user Added', doc)
//     next()
// });


const Merchant = mongoose.model('merchant', merchantSchema);
module.exports = Merchant;
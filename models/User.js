const mongoose = require('mongoose');

//add roles
const userSchema = mongoose.Schema({
    firstname:{
        type: String, require: true

    },
    lastname:{
        type: String, require: true

    },
    phone: {
        type: String
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
    isActive:{
        type: String, require:true
    },
    confirmationCode:{
        type:String, require:true
    }
})

// userSchema.post('save', (doc, next) => {
//     console.log('user Added', doc)
//     next()
// });


const User = mongoose.model('user', userSchema);
module.exports = User;
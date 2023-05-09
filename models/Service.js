const mongoose = require('mongoose');


const  serviceSchema= mongoose.Schema({
    merchantid:{
        type:String
    },
    title:{
        type:String
    },
    description:{
        type:String
    },
    price:{
        type:Number
    },
    duration:{
        type:Number
    }
})

// userSchema.post('save', (doc, next) => {
//     console.log('user Added', doc)
//     next()
// });


const Service = mongoose.model('service', serviceSchema);
module.exports = Service;
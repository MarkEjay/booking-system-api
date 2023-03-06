const mongoose = require('mongoose');


const requestSchema = mongoose.Schema({
    userid:{
        type:String
    },
    merchantid:{
        type:String
    },
    created:{
        type:Date
    },
    appointment:{
        type:Date
    },
    description:{
        type:String
    },
    status:{
        type:String
    }

})

// userSchema.post('save', (doc, next) => {
//     console.log('user Added', doc)
//     next()
// });


const Requests = mongoose.model('request', requestSchema);
module.exports = Requests;
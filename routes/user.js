const express = require('express')
//const { findOne } = require('../models/User')
const router = express.Router()
const User = require('../models/User')
//const Task = require('../models/Task')
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { config } = require('dotenv');
const verifyToken = require('../middleware/auth')
const Requests = require('../models/Request')
const Merchant = require('../models/Merchant')
var nodemailer = require('nodemailer');


var transport = nodemailer.createTransport({
    host: "sandbox.smtp.mailtrap.io",
    port: 2525,
    auth: {
      user: "0174822c626521",
      pass: "0a9e6dd18d4083"
    }
  });

 
  
  

router.get('/' , async (req, res) => {
    //console.log(verifyToken)
    try {
        const user = await User.find({})
        res.status(200).json({ user })
    }
    catch (err) {
        res.status(404).send('error: ' + err.message)
    }
})

router.get('/home', verifyToken, async (req,res) => {
    //console.log(verifyToken)
    res.send("Auth correct")
})


router.get('/get-user/:id', (req, res) => {
    User.findById(req.params.id).then(user => {
        if (user) {
            res.status(200).json(user);
        }
        else {
            res.status(404).json({ message: "User not found" })
        }
    })
})
// router.get('/view-task/:id', (req,res) =>{
//     Task.find({ user_id: req.params.id }).then((task) => {
//         return res.status(201).json({
//             task:task
//         });
//       });

// })

// router.post('/add-task/:id',(req,res)=>{
//    // const {name,created_date,due_date,user_id}=req.body
//     try{
//         const task = Task.create({
//             name:req.body.name,
//             created_date: new Date().toISOString(),
//             due_date:req.body.due_date,
//             user_id: req.params.id
//         })
//         res.status(200).send('task created')

//     }
//     catch(err){
//         res.status(404).send('error adding task')
//     }
// })



router.post('/signup',  (req, res) => {
    //const { firstname, lastname,phone, email, password } = req.body;
    //console.log("hi")

    const characters = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let code = '';
    for (let i = 0; i < 25; i++) {
        code += characters[Math.floor(Math.random() * characters.length )];
    }
    try {

        User.findOne({
            email: req.body.email.toLowerCase()
        }).exec((err, user) => {
            if (err) {
                res.status(500).send({ message: err });
                return;
            }

            if (user) {
                res.status(400).send({ message: "Failed! Email is already in use!" });
                return;
            }
            else {
                console.log("doesnt exist")
                const user = User.create({ firstname:req.body.firstname, 
                    lastname:req.body.lastname, 
                    phone:req.body.phone,
                    role:req.body.role,
                    email:req.body.email.toLowerCase(), 
                    password: bcrypt.hashSync(req.body.password,8),
                    isActive:"false",
                    confirmationCode:code
                }
                    )
                
                res.status(200).send({message: 'user created'})
            }

        });
        /*User.findOne({ email }).exec(usr => {
           if (usr) {
               console.log("this exists")
               res.status(200).send('this email exists')
               ret
           } else {
               console.log("doesnt exist")
               User.create({ firstname, lastname, email, password })
               res.status(200).send('user created')
           }
       })*/

    }
    catch (err) {
        return res.status(404).send('Error: Cant Signup');
    }

})

router.post('/login', (req, res) => {
    //const { email, password } = req.body;
    try {
        User.findOne({
            email: req.body.email.toLowerCase()
        }).exec((err, user) => {
            if (err) {
                res.status(500).send({ message: err });
                return;
            }
            if(!user){
                return res.status(404).send({ message: "User Not found." });
            }

            var passwordValid = bcrypt.compareSync(req.body.password, user.password);

            if(!passwordValid){
                return res.status(401).send({
                    accessToken:null,
                    message:"Invalid Credentials!"
                });
            } 
            // if(user.isActive == 'false'){
            //     return res.status(401).send({
            //         message: "Pending Account. Please Verify Your Email!",
            //       });
            // }
            var token = jwt.sign({id: user.id}, process.env.token,{
                expiresIn: 86400//24hrs
            })

            // var mailOptions = {
            //     from: '"Example Team" <from@example.com>',
            //     to: user.email,
            //     subject: 'Activate Your Account',
            //     text: 'Hey there, it’s our first message sent with Nodemailer ',
            //     html: `<b>Hey ${user.firstname}! </b><br> You just created an account with Neon<br /> Click the link to activate your account`,
                
            //   };

            // transport.sendMail(mailOptions, (error, info) => {
            //     if (error) {
            //       return console.log(error);
            //     }
            //     console.log('Message sent: %s', info.messageId);
            //   });
            

            res.status(200).send({
                id: user._id,
                firstname:user.firstname,
                lastname:user.lastname,
                phone:user.phone,
                role:user.role,
                email: user.email.toLowerCase(),
                accessToken: token
              });
        })
    }
    
    catch (err) {
    return res.status(404).send('Error: Cant Login')
}
})

router.put('/edit-merchant/:id', (req,res,next)=>{
    User.findById(req.params.id).then(user=>{
        if(user){
            console.log(user)

            user.email=req.body.email;
            user.save()
            res.status(200).json({user});

        }
        else{
            res.status(404).json({message: "user not updated"})
        }
    })
})

router.post('/add-request', (req,res)=>{
    Merchant.findOne({
        merchantid: req.body.merchantid
    }).exec((err, merc) => {
        if (err) {
            res.status(500).send({ message: err });
            return;
        }

        if (!merc) {
            res.status(400).send({ message: "Failed! MerchantId doesnt exist" });
            return;
        }

        else{
            console.log("doesnt exist")
            const request = Requests.create({ userid:req.body.userid, 
                useremail:req.body.useremail,
                merchantid:req.body.merchantid, 
                created: new Date().toISOString(), 
                appointment:req.body.appointment,
                description:req.body.description, 
                status:"pending", 
            })
            console.log(merc.email)
            // var mailOptions = {
            //     from: '"Example Team" <from@example.com>',
            //     to: merc.email,
            //     subject: 'New Request',
            //     text: 'Hey there, it’s our first message sent with Nodemailer ',
            //     html: `<b>Hey ${merc.firstname}! </b><br> You just received a new request on Neon<br />`,
                
            //   };

            // transport.sendMail(mailOptions, (error, info) => {
            //     if (error) {
            //       return console.log(error);
            //     }
            //     console.log('Message sent: %s', info.messageId);
            //   });
            res.status(200).send('request sent')
        }
    })
})

router.get('/view-request/:id', (req,res) =>{
    Requests.find({ userid: req.params.id }).then((request) => {
        return res.status(201).json({
            request:request
        });
      });

})


// router.get('/view-request',verifyToken, (req,res) =>{
//     Requests.find({ userid: req.userId }).then((request) => {
//         return res.status(201).json({
//             request:request
//         });
//       });

// })


module.exports = router;  
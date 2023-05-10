const express = require('express')
//const { findOne } = require('../models/User')
const router = express.Router()
//const User = require('../models/User')
//const Task = require('../models/Task')
const Merchant = require('../models/Merchant')
const Requests = require('../models/Request')
const Service = require('../models/Service')
const User = require('../models/User')

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { config } = require('dotenv');
//const verifyToken = require('../middleware/auth')
var nodemailer = require('nodemailer');


var transport = nodemailer.createTransport({
    host: "sandbox.smtp.mailtrap.io",
    port: 2525,
    auth: {
      user: "0174822c626521",
      pass: "0a9e6dd18d4083"
    }
  });


//add verifyToken
router.get('/home', async (req,res) => {
    //console.log(verifyToken)
    res.send("merchant home")
})


router.get('/', async (req, res) => {
    try {
        const merchant = await Merchant.find({})
        res.status(200).json({ merchant })
    }
    catch (err) {
        res.status(404).send('error: ' + err.message)
    }
})

router.post('/signup',  (req, res) => {
  //  const { firstname, lastname, email, password } = req.body;
    //console.log("hi")

    try {

        Merchant.findOne({
            email: req.body.email
        }).exec((err, merchant) => {
            if (err) {
                res.status(500).send({ message: err });
                return;
            }

            if (merchant) {
                res.status(400).send({ message: "Failed! Email is already in use!" });
                return;
            }
            else {
                Merchant.findOne({
                    merchantid: req.body.merchantid
                }).exec((err, merc) => {
                    if (err) {
                        res.status(500).send({ message: err });
                        return;
                    }
        
                    if (merc) {
                        res.status(400).send({ message: "Failed! MerchantId is already in use!" });
                        return;
                    }
                    else{
                        console.log("doesnt exist")
                        const merchant = Merchant.create({ firstname:req.body.firstname, 
                            lastname:req.body.lastname, 
                            companyname:req.body.companyname, 
                            merchantid:req.body.merchantid,
                            phone:req.body.phone, 
                            role:req.body.role,
                            email:req.body.email, 
                            password: bcrypt.hashSync(req.body.password,8)})
                        
                        res.status(200).send({message:'merchant created'})
                    }
                })
                // console.log("doesnt exist")
                // const merchant = Merchant.create({ firstname:req.body.firstname, 
                //     lastname:req.body.lastname, 
                //     companyname:req.body.companyname, 
                //     merchantid:req.body.merchantid,
                //     phone:req.body.phone, 
                //     email:req.body.email, 
                //     password: bcrypt.hashSync(req.body.password,8)})
                
                // res.status(200).send('merchant created')
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
   // const { email, password } = req.body;
    try {
        Merchant.findOne({
            email: req.body.email
        }).exec((err, merchant) => {
            if (err) {
                res.status(500).send({ message: err });
                return;
            }
            if(!merchant){
                return res.status(404).send({ message: "Merchant Not found." });
            }

            var passwordValid = bcrypt.compareSync(req.body.password, merchant.password);

            if(!passwordValid){
                return res.status(401).send({
                    accessToken:null,
                    message:"Invalid Credentials!"
                });
            } 
            var token = jwt.sign({id: merchant.id}, process.env.token,{
                expiresIn: 86400//24hrs
            })

            console.log(token)
            res.status(200).send({
                id: merchant._id,
                firstname:merchant.firstname,
                lastname:merchant.lastname,
                companyname:merchant.companyname, 
                merchantid:merchant.merchantid,
                phone:merchant.phone, 
                role:merchant.role,
                email: merchant.email,
                accessToken: token
              });
        })
    }
    
    catch (err) {
    return res.status(404).send('Error: Cant Login')
}
})

router.get('/view-request/:id', (req,res) =>{
    Requests.find({ merchantid: req.params.id }).then((request) => {
        return res.status(201).json({
            request:request
        });
      });

})

router.delete('/delete-request/:id', (req,res,next)=>{
    // console.log(req.params.id)

    // Requests.findById(req.params.id).then(rst=>{
    //     User.findById(rst.userid).then(usr=>{
    //         // console.log(usr)
    //         var mailOptions = {
    //             from: '"Example Team" <from@example.com>',
    //             to: usr.email,
    //             subject: 'Request Declined',
    //             text: 'Hey there, it’s our first message sent with Nodemailer ',
    //             html: `<b>Hey! </b><br> Your Request has been declined <br />`,
                
    //           };

    //         transport.sendMail(mailOptions, (error, info) => {
    //             if (error) {
    //               return console.log(error);
    //             }
    //             console.log('Message sent: %s', info.messageId);
    //           });
    //     })
    //     })
    Requests.findByIdAndDelete(req.params.id).then(request=>{
        if(request){

            res.status(200).json(request);
            
            
        }
        else{
            res.status(404).json({ message: "Request not found" })
        }
    })
})

router.put('/edit-request/:id', (req,res,next)=>{
    Requests.findById(req.params.id).then(request=>{
        if(request){
            console.log(request)

            request.status=req.body.status;
            request.save()
            res.status(200).json(request);

        }
        else{
            res.status(404).json({message: "Request not found"})
        }
    })
})


// let merchant add services to their page for customers to see
router.post('/add-service', (req,res)=>{
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
            const service = Service.create({ 
                merchantid:req.body.merchantid, 
                title:req.body.title, 
                description:req.body.description,
                price:req.body.price,
                duration:req.body.duration           
            })
            res.status(200).send('service sent')
        }
    })
})

router.get('/view-service/:id', (req,res) =>{
    //console.log("hello")
    Service.find({ merchantid: req.params.id }).then((service) => {
        return res.status(201).json({
            service:service
        });
      });

})
router.delete('/delete-service/:id', (req,res,next)=>{
    Service.findByIdAndDelete(req.params.id).then(service=>{
        if(service){
            res.status(200).json(service);
        }
        else{
            res.status(404).json({ message: "Service not found" })
        }
    })
})
module.exports = router;  
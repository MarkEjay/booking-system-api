const express = require('express')
//const { findOne } = require('../models/User')
const router = express.Router()
//const User = require('../models/User')
//const Task = require('../models/Task')
const Merchant = require('../models/Merchant')
const Requests = require('../models/Request')

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { config } = require('dotenv');
//const verifyToken = require('../middleware/auth')

//add verifyToken
router.get('/home', async (req,res) => {
    //console.log(verifyToken)
    res.send("merchant home")
})


router.post('/signup',  (req, res) => {
  //  const { firstname, lastname, email, password } = req.body;
    console.log("hi")

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
                        
                        res.status(200).send('merchant created')
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
            request.status=req.body.status;
            request.save()
            res.status(200).json(request);

        }
        else{
            res.status(404).json({message: "Request not found"})
        }
    })
})

module.exports = router;  
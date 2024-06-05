const express = require('express')
//const { findOne } = require('../models/User')
const router = express.Router()
//const User = require('../models/User')
//const Task = require('../models/Task')
const Merchant = require('../models/Merchant')
const Requests = require('../models/Request')
const Service = require('../models/Service')
const User = require('../models/User')
const cloudinary = require('cloudinary').v2;

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
router.get('/home', async (req, res) => {
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
// const upload=(a)=>{
//     profileurl=""
//     cloudinary.uploader.upload(a, {folder:"profile"}).then(result=>{
//         // console.log(result.secure_url)
//         this.profileurl = result.secure_url
//         // console.log(profileurl)
//     })
//     .catch(
//         result=>{
//             console.log(result)
//         }
//     )
//     console.log(this.profileurl)
//     return profileurl
// }
router.post('/signup', async(req, res) => {
    //  const { firstname, lastname, email, password } = req.body;
    //console.log("hi")
    // let val;
    // async function uploadProfileToCloudinary() {
    //     try {
    //         const result = await cloudinary.uploader.upload(req.body.profile, { folder: "profile" });
    //         // console.log(result.secure_url);
    //         val=result.secure_url
    //         console.log(val)

    //     } catch (error) {
    //         console.log(error);
    //     }
    // }
    
    // uploadProfileToCloudinary();
    try {
    const cloudinaryResult = await cloudinary.uploader.upload(req.body.profile, { folder: "profile" });
    const profileUrl = cloudinaryResult.secure_url;

    
        // profileurl="";

        // profileurl = ""
        

        Merchant.findOne({
            email: req.body.email.toLowerCase()
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
                    merchantid: req.body.merchantid.toLowerCase()
                }).exec((err, merc) => {
                    if (err) {
                        res.status(500).send({ message: err });
                        return;
                    }

                    if (merc) {
                        res.status(400).send({ message: "Failed! MerchantId is already in use!" });
                        return;
                    }
                    else {
                        console.log("doesnt exist")


                        const merchant = Merchant.create({
                            firstname: req.body.firstname,
                            lastname: req.body.lastname,
                            companyname: req.body.companyname,
                            merchantid: req.body.merchantid.toLowerCase(),
                            phone: req.body.phone,
                            role: req.body.role,
                            email: req.body.email.toLowerCase(),
                            profile: profileUrl,
                            password: bcrypt.hashSync(req.body.password, 8)
                        })
                        // console.log(profileurl)
                        res.status(200).send({ message: 'merchant created' })
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
            email: req.body.email.toLowerCase()
        }).exec((err, merchant) => {
            if (err) {
                res.status(500).send({ message: err });
                return;
            }
            if (!merchant) {
                return res.status(404).send({ message: "Merchant Not found." });
            }

            var passwordValid = bcrypt.compareSync(req.body.password, merchant.password);

            if (!passwordValid) {
                return res.status(401).send({
                    accessToken: null,
                    message: "Invalid Credentials!"
                });
            }
            var token = jwt.sign({ id: merchant.id }, process.env.token, {
                expiresIn: 86400//24hrs
            })

            console.log(token)
            res.status(200).send({
                id: merchant._id,
                firstname: merchant.firstname,
                lastname: merchant.lastname,
                companyname: merchant.companyname,
                merchantid: merchant.merchantid,
                phone: merchant.phone,
                role: merchant.role,
                email: merchant.email.toLowerCase(),
                accessToken: token
            });
        })
    }

    catch (err) {
        return res.status(404).send('Error: Cant Login')
    }
})

router.get('/get-merchant/:id', (req, res) => {
    Merchant.findById(req.params.id).then(mer => {
        if (mer) {
            res.status(200).json(mer);
        }
        else {
            res.status(404).json({ message: "Merchant not found" })
        }
    })
})


router.put('/edit-merchant/:id', (req, res, next) => {
    Merchant.findById(req.params.id).then(mer => {
        if (mer) {
            console.log(mer)

            mer.email = req.body.email;
            mer.address = req.body.address;
            mer.city = req.body.city;
            mer.province = req.body.province;
            mer.postalcode = req.body.postalcode

            mer.save()
            res.status(200).json({ mer });

        }
        else {
            res.status(404).json({ message: "Merchant not updated" })
        }
    })
})


router.get('/view-request/:id', (req, res) => {
    Requests.find({ merchantid: req.params.id }).then((request) => {
        return res.status(201).json({
            request: request
        });
    });

})

router.delete('/delete-request/:id', (req, res, next) => {
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
    Requests.findByIdAndDelete(req.params.id).then(request => {
        if (request) {

            res.status(200).json(request);


        }
        else {
            res.status(404).json({ message: "Request not found" })
        }
    })
})

router.put('/edit-request/:id', (req, res, next) => {
    Requests.findById(req.params.id).then(request => {
        if (request) {
            console.log(request)

            request.status = req.body.status;
            request.save()
            res.status(200).json(request);

        }
        else {
            res.status(404).json({ message: "Request not found" })
        }
    })
})


// let merchant add services to their page for customers to see
router.post('/add-service', async (req, res) => {
    try {
        const cloudinaryResult = await cloudinary.uploader.upload(req.body.profile, { folder: "profile" });
        const profileUrl = cloudinaryResult.secure_url;
        // console.log(profileUrl)
    Merchant.findOne({
        merchantid: req.body.merchantid
    }).exec(async(err, merc) => {
        if (err) {
            res.status(500).send({ message: err });
            return;
        }

        if (!merc) {
            res.status(400).send({ message: "Failed! MerchantId doesnt exist" });
            return;
        }
        else {
            console.log("doesnt exist")
            const service = await Service.create({
                merchantid: req.body.merchantid,
                title: req.body.title,
                description: req.body.description,
                price: req.body.price,
                duration: req.body.duration,
                profile:profileUrl
            })
            res.status(200).send('service sent')
        }
    })}
    catch (err) {
        return res.status(404).send('Error: Cant Add Service');
    }
})

router.get('/view-service/:id', (req, res) => {
    //console.log("hello")
    Service.find({ merchantid: req.params.id }).then((service) => {
        return res.status(201).json({
            service: service
        });
    });

})

router.put('/edit-service/:id', (req, res, next) => {
    Service.findById(req.params.id).then(service => {
        if (service) {
            console.log(service)
            service.merchantid = req.body.merchantid,
                service.title = req.body.title,
                service.description = req.body.description,
                service.price = req.body.price,
                service.duration = req.body.duration
            service.save()
            res.status(200).json(service);
        }
        else {
            res.status(404).json({ message: "Service not found" })
        }
    })
})
router.delete('/delete-service/:id', (req, res, next) => {
    Service.findByIdAndDelete(req.params.id).then(service => {
        if (service) {
            res.status(200).json(service);
        }
        else {
            res.status(404).json({ message: "Service not found" })
        }
    })
})


// const upload=()=>{
//     cloudinary.uploader.upload("./assets/dog.jpeg", {folder:"profile"}).then(result=>{
//         console.log(result)
//     })
//     .catch(
//         result=>{
//             console.log(result)
//         }
//     )
// }


module.exports = router;  
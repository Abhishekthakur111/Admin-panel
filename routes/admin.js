var express = require('express');
var router = express.Router();
const admincontroller = require('../controller/admincontroller/admin');
const authcontroller = require('../controller/authcontroller/auth'); 
const cms = require('../controller/admincontroller/cms');
const contactus = require('../controller/admincontroller/contactus');
const category = require('../controller/admincontroller/category');
const service = require('../controller/admincontroller/service');
const booking = require('../controller/admincontroller/booking');


/* GET home page. */
router.get('/dashboard',admincontroller.dashboard);
router.get('/login', admincontroller.login);

router.post('/createuser', authcontroller.createuser);
router.post('/loginpost', admincontroller.loginpost);
router.get('/profile', admincontroller.profile);
router.post('/editprofile', admincontroller.edit_profile);
router.get('/password', admincontroller.password);
router.post('/updatepassword', admincontroller.updatepassword);
router.get('/logout', admincontroller.logout);
router.post('/status', admincontroller.user_status);
router.get('/view/:_id', admincontroller.view);
router.delete('/delete/:_id',admincontroller.user_delete);

// router for user
router.get('/userlist', admincontroller.user_list);
router.get('/provider',admincontroller.provider);
router.get('/worker', admincontroller.worker);

// router for cms
router.post('/create',cms.create);
router.get('/privacy', cms.privacy);
router.post('/privacy', cms.privacyupdate);
router.get('/aboutus',cms.aboutus);
router.post('/aboutus',cms.aboutusupdate);
router.get('/term',cms.term);
router.post('/term',cms.termupdate);

//route for contactus
router.post('/createcontact',contactus.createcontact);
router.get('/getcontact',contactus.contact);
router.get('/viewcontact/:_id', contactus.contactview);
router.delete('/deletecontact/:_id',contactus.contactdelete);

// router for category
router.post('/createcategory',category.createcategory);
router.get('/categorylist', category.categorylist);
router.get('/categoryview/:_id',category.categoryview);
router.post('/catstatus',category.cat_status);
router.delete('/catdelete/:_id', category.cat_delete);
router.get('/addcategory', category.addcategory);

router.get('/map', admincontroller.map);

// router for service
router.post('/createservice', service.createservice);
router.get('/servicelist',service.getservice);
router.post('/serstatus',service.service_status);
router.delete('/servicedelete/:_id', service.service_delete);
router.get('/serviceview/:_id',service.serviceview)
router.get('/addservice',service.serviceadd);

//router for booking
router.post('/booking',booking.createBooking);
router.get('/bookinglist',booking.bookinglist);
router.get('/bookingview/:_id',booking.bookingView);
router.post('/bookingstatus',booking.bookingstatus);
router.post('/bookingdelete/:_id', booking.booking_delete);






module.exports = router;

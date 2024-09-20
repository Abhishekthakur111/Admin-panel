const helper = require('../../helper/helper');
const Booking = require('../../models/booking');  
const { Validator } = require('node-input-validator');
const User = require('../../models/user'); 
const Services = require('../../models/servicelist');  

module.exports = {
    createBooking: async (req, res) => {
        try {
            const validator = new Validator(req.body, {
                user_id: 'required|string',
                service_id: 'required|string',
              
            });

            const isValid = await validator.check();
            if (!isValid) {
                return helper.error(res, 'Invalid data', validator.errors);
            }

            const userId = req.body.user_id.trim();
            const serviceId = req.body.service_id.trim();

            
            const userExists = await User.exists({ _id: userId });
            const serviceExists = await Services.exists({ _id: serviceId });

            if (!userExists) {
                return helper.error(res, 'User not found');
            }
            
            if (!serviceExists) {
                return helper.error(res, 'Service not found');
            }
            const newBooking = await Booking.create({
                user_id: userId,
                service_id: serviceId,
                amount: req.body.amount,
                no_of_booking: req.body.no_of_booking || 1,  
                description: req.body.description || '', 
                location: req.body.location,
                booking_code: req.body.booking_code,  
            });

            return helper.success(res, 'Booking Created Successfully', { data: newBooking });

        } catch (error) {
            console.error('Error creating booking:', error);
            return helper.error(res, 'Internal server error');
        }
    },
    bookinglist:async(req,res)=>{
        try {
            if(!req.session.admin) return res.redirect('/login');
            const data = await Booking.find()
            .populate('user_id')
            .populate('service_id') 
            .exec();
            
            res.render('booking/bookinglist.ejs',{
                session:req.session.admin,
                title:"Bookings",
                data
            });
        } catch (error) {
            console.error('Error booking:', error);
            return helper.error(res, 'Internal server error');
        }
    },
    bookingView : async (req, res) => {
    try {
        if(!req.session.admin) return res.redirect('/login');
        const data = await Booking.findById(req.params._id)
           .populate("user_id")
           .populate('service_id')
           .exec();

      res.render('booking/bookingview.ejs',{
        session:req.session.admin,
        title:'Details',
        data
      })
    } catch (error) {
        console.error("Error retrieving booking:", error);
        return helper.error(res, "Internal server error");
    }
    },
    bookingstatus: async (req, res) => {
    try {
        const { _id } = req.body;
        if (!_id) {
            return res.status(400).json({ success: false, message: "Missing _id" });
        }
        const userDoc = await Booking.findById(_id);
        if (!userDoc) {
            return res.status(404).json({ success: false, message: " not found" });
        }
    
        const updatedUser = await Booking.findByIdAndUpdate(
            _id,
            { $set: { status: req.body.status } },
            { new: true } 
        );
        res.json({ 
            success: true, 
            data: updatedUser });
    } catch (error) {
        console.error("Error updating status:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
    },
    booking_delete: async (req, res) => {
    try {
        const catId = req.params._id;
        if (!catId) {
            return res.status(400).json({ success: false, message: " ID is required" });
        }
        const catDoc = await Booking.findById(catId);
        if (!catDoc) {
            return res.status(404).json({ success: false, message: " not found" });
        }
        await Booking.findByIdAndDelete(catId);

        res.json({ success: true, message: " deleted successfully" });
    } catch (error) {
        console.error("Error deleting cat:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
    }, 
};

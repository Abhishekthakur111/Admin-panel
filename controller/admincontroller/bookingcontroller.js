const helper = require('../../helper/helper');
const Booking = require('../../models/booking');  
const { Validator } = require('node-input-validator');
const User = require('../../models/user'); 
const Services = require('../../models/servicelist');  

module.exports = {
    bookinglist:async(req,res)=>{
        try {
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
        
        const data = await Booking.findById(req.params._id)
           .populate("user_id")
           .populate('service_id')
           .exec();

      res.render('booking/bookingview.ejs',{
        session:req.session.admin,
        title:'Booking Detail',
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
        const userDoc = await Booking.findById(_id);
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
        const catDoc = await Booking.findById(catId);
        await Booking.findByIdAndDelete(catId);
        res.json({ success: true, message: " deleted successfully" });
    } catch (error) {
        console.error("Error deleting cat:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
    }, 
};

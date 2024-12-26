const contactus = require('../../models/contactus');

module.exports = {
    contact:async(req,res)=>{
        try {
          
            const data = await contactus.find({});
            res.render('contact/contactget',{
                session:req.session.admin,
                data,
                title:"Contact Us",
            })
        } catch (error) {
            console.log(error,'error');
        }
    },
    contactview:async(req,res)=>{
        try {
           const data = await contactus.findOne({_id:req.params._id});
            res.render('contact/contactview',{
                session:req.session.admin,
                data,
                title:"Contact Detail"
            })

        } catch (error) {
            console.log(error,'error');
        }
    },
    contactdelete: async (req, res) => {
        try {
            const contact = await contactus.findByIdAndDelete(req.params._id);
            res.status(200).json({ message: 'Deleted successfully', contact });
        } catch (error) {
            console.error('Error deleting contact:', error);
            res.status(500).json({ message: 'Internal Server Error' });
        }
    }
}
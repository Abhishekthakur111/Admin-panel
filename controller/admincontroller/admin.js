const user = require("../../models/user");
const bcrypt = require('bcrypt');
const helper = require('../../helper/helper');

module.exports = {
    dashboard: async (req, res) => {
        try {
            if (!req.session.admin) return res.redirect('/login');
    
            const data = await user.countDocuments({ role: '1' });
            const provider = await user.countDocuments({ role: '2' });
            const worker = await user.countDocuments({ role: '3' });
            const usersByMonth = await user.aggregate([
                { $match: { role: '1' } },
                {
                    $group: {
                        _id: { $month: "$createdAt" },
                        count: { $sum: 1 }
                    }
                },
                { $sort: { _id: 1 } }
            ]);
            const chartData = Array(12).fill(0);
            usersByMonth.forEach(item => {
                chartData[item._id - 1] = item.count;
            });
            const latestUser = await user.findOne({ role: '1' }).sort({ updatedAt: -1 });
            const calculateTimeDifference = (updatedAt) => {
                const now = new Date();
                const updatedTime = new Date(updatedAt);
                const diffMs = now - updatedTime;
    
                const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
                const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
                const diffMonths = Math.floor(diffDays / 30); 
    
                if (diffMonths > 0) {
                    return `${diffMonths} month(s) ago`;
                } else if (diffDays > 0) {
                    return `${diffDays} day(s) ago`;
                } else if (diffHours > 0) {
                    return `${diffHours} hour(s) ago`;
                } else if (diffMinutes > 0) {
                    return `${diffMinutes} minute(s) ago`;
                } else {
                    return 'Just now';
                }
            };    
            const updatedTimeText = latestUser ? calculateTimeDifference(latestUser.updatedAt) : 'No updates available'
            res.render('dashboard', {
                session: req.session.admin,
                title: 'Dashboard',
                data,
                provider,
                worker,
                chartData,
                updatedTimeText 
            });
        } catch (error) {
            console.error(error, 'Error in dashboard');
            return res.status(500).json({ message: "Internal server error" });
        }
    },
    login: async (req, res) => {
        try {
            res.render('login');
        } catch (error) {
            console.log(error, 'error');
            return res.status(500).json({ message: "Internal server error" });
        }
    },
    loginpost: async (req, res) => {
        try {
            const {  password } = req.body;

            const find_user = await user.findOne({ email: req.body.email, role:'0'
               
             });
            if (!find_user) {
                req.flash("error", "  Error in login  ");
            }
            const storedHash = find_user.password;
            const is_password = await bcrypt.compare(password, storedHash);
            if (is_password) {
                if (find_user.role == 0) {
                    req.session.admin = find_user;
                
                    req.flash("success", " login succesfully ");
                    return res.redirect('/dashboard');
                    
                } else {
                    req.flash("error", "Access denied");
                    return res.redirect('/login'); 
                }

            }
        }
        catch (error) {
            console.error('Error during login:', error);

            return res.status(500).json({ message: "Internal server error" });
        }
    },
    profile: async (req, res) => {
        try {
          const userId = req.session.admin._id;
          const profile = await user.findById(userId).select('name email phone_no image address'); 
    
         res.render('admin/profile.ejs',{
            session:req.session.admin,
            profile,
            title:'profile',
         })
        } catch (error) {
          console.error("Error fetching profile:", error);
          return res.status(500).json({ message: "An error occurred while fetching profile" });
        }
    },
    edit_profile: async (req, res) => {
        try {
            if (!req.session.admin) return res.redirect("/login");
            let updateData = { ...req.body }; 
            if (req.files && req.files.image) {
                let folder = "admin";
                let imagePath = await helper.fileUpload(req.files.image, folder);
                updateData.image = imagePath; 
            };           
            await user.findByIdAndUpdate(req.session.admin._id, updateData, { new: true }); 
            const updatedUser = await user.findById(req.session.admin._id);
            req.session.admin = updatedUser;
    
            req.flash("success", "Profile updated successfully");
            res.redirect("/profile");
        } catch (error) {
            console.error("Error updating profile:", error);
            return res.status(500).json({ message: "Internal server error" });
        }
    },
    password: async(req,res)=>{
        try {
            if (!req.session.admin) return res.redirect("/login");
            res.render('admin/password.ejs',{
                session: req.session.admin,
                title: "Change Password",
            })
        } catch (error) {
            console.error("Error", error);
            return res.status(500).json({ message: "Internal server error" });
        }
    }, 
    updatepassword: async (req, res) => {
            const { oldPassword, newPassword, confirmPassword } = req.body;
    
            try {
                if (!req.session.admin) return res.redirect("/login");
    
               
                if (!oldPassword || !newPassword || !confirmPassword) {
                    return res.status(400).json({ message: 'All fields are required' });
                }
                if (newPassword !== confirmPassword) {
                    return res.status(400).json({ message: 'New password and confirm password do not match' });
                }
                const currentUser = await user.findById(req.session.admin._id);
                if (!currentUser) {
                    return res.status(404).json({ message: 'User not found' });
                }
                const isMatch = await bcrypt.compare(oldPassword, currentUser.password);
                if (!isMatch) {
                    return res.status(400).json({ message: 'Old password is incorrect' });
                }
                const hashedPassword = await bcrypt.hash(newPassword, 10);
                currentUser.password = hashedPassword;
                await currentUser.save();
                req.session.admin.password = hashedPassword;
                req.flash("success", "Password updated successfully");
                res.redirect('/login');
            } catch (error) {
                console.error('Error updating password:', error);
                res.status(500).json({ message: 'Internal server error' });
            }
    },
    logout:async(req,res)=>{
            try {
                req.session.destroy();
                res.redirect('/login')
            } catch (error) {
                return helper.error(res, error);
            }
    },
    user_list: async (req, res) => {  
            try {
              if (!req.session.admin) return res.redirect("/login");
              const data = await user.find({
                  role: "1",
                raw: true,
              });
              res.render("admin/userlist", {
                title: "Users",
                data,
                session: req.session.admin,
              });
            } catch (error) {
              console.error("Error fetching user list:", error);
              res.status(500).json({ message: "Internal server error" });
            }
    },
    user_status: async (req, res) => {
            try {
                const { _id } = req.body;
                if (!_id) {
                    return res.status(400).json({ success: false, message: "Missing _id" });
                }
                const userDoc = await user.findById(_id);
                if (!userDoc) {
                    return res.status(404).json({ success: false, message: "User not found" });
                }
               
                const updatedUser = await user.findByIdAndUpdate(
                    _id,
                    { $set: { status: req.body.status} },
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
    view: async (req, res) => {
        try {
            if (!req.session.admin) return res.redirect("/login");

            const userId = req.params._id; 
            if (!userId) {
                return res.status(400).json({ message: "User ID is required" });
            }
            const userDoc = await user.findOne({ _id: userId, role: [ '1', '2', '3'] });
            if (!userDoc) {
                return res.status(404).json({ message: "User not found or does not have the required role" });
            }
            
            res.render("admin/view.ejs", {
                session: req.session.admin,
                view: userDoc,
                title:'Details'
            });
        } catch (error) {
            console.error("Error fetching user view:", error);
            res.status(500).json({ message: "Internal server error" });
        }
    },
    user_delete: async (req, res) => {
        try {
            const userId = req.params._id;
            if (!userId) {
                return res.status(400).json({ success: false, message: "User ID is required" });
            }
            const userDoc = await user.findById(userId);
            if (!userDoc) {
                return res.status(404).json({ success: false, message: "User not found" });
            }
            await user.findByIdAndDelete(userId);
    
            res.json({ success: true, message: "User deleted successfully" });
        } catch (error) {
            console.error("Error deleting user:", error);
            res.status(500).json({ success: false, message: "Internal server error" });
        }
    },     
    provider:async(req,res)=>{
        try {
            if(!req.session.admin) return res.redirect('/login');
            const data = await user.find({
                role: '2',
                raw: true,
            });
            res.render('admin/provider',{
                session:req.session.admin,
                data,
                title:'Providers',
            })
        } catch (error) {
            console.error("Error ", error);
            res.status(500).json({ success: false, message: "Internal server error" });
        }
    },
    worker:async(req,res)=>{
        try {
            if(!req.session.admin) return res.redirect('/login');
            const data = await user.find({
                role: '3',
                raw: true,
            });
            res.render('admin/worker',{
                data,
                session:req.session.admin,
                title: 'Workers'
            })
        } catch (error) {
            console.error("Error ", error);
            res.status(500).json({ success: false, message: "Internal server error" });
        }
    },
    map:async(req,res)=>{
        try {
            if(!req.session.admin) return res.redirect('/login');
            res.render('map/leafmap',{
                session:req.session.admin,
                title:"Map"
            })
        } catch (error) {
            console.error("Error ", error);
            res.status(500).json({ success: false, message: "Internal server error" });
        }
    },
}
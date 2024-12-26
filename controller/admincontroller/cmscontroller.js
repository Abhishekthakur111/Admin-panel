
const cms = require('../../models/cms');

module.exports = {
  privacy: async (req, res) => {
    try { 
      const data = await cms.findOne({ role: '1' });
      res.render('cms/privacypolicy', {
        session: req.session.admin,
        data,
        title: "Privacy Policy",
      });
    } catch (error) {
      console.log(error, 'error');
      return res.status(500).json('Internal server error');
    }
  },
  privacyupdate: async (req, res) => {
    try {
      const { content } = req.body;
      const result = await cms.updateOne(
        { role: '1' },
        { content: content }
      );
      req.flash('success', 'Privacy Policy updated successfully');
      res.redirect('back');
    } catch (error) {
      console.log(error, 'error');
      return res.status(500).json('Internal server error');
    }
  },
  aboutus: async (req, res) => {
    try {
      const data = await cms.findOne({ role: '2' });
      res.render('cms/about', {
        session: req.session.admin,
        data,
        title: "About Us"
      });
    } catch (error) {
      console.log(error, 'error');
      return res.status(500).json('Internal server error');
    }
  },
  aboutusupdate: async (req, res) => {
    try {
      const { content } = req.body;
      const result = await cms.updateOne(
        { role: '2' },
        { content: content }
      );
      req.flash('success', 'About us updated successfully');
      res.redirect('back');
    } catch (error) {
      console.log(error, 'error');
      return res.status(500).json('Internal server error');
    }
  },
  term: async (req, res) => {
    try {
      const data = await cms.findOne({ role: '3' });
      res.render('cms/terms', {
        session: req.session.admin,
        data,
        title: "Terms&Conditions",
      });
    } catch (error) {
      console.log(error, 'error');
      return res.status(500).json('Internal server error');
    }
  }, 
  termupdate: async (req, res) => {
    try {
      const { content } = req.body;
      const result = await cms.updateOne(
        { role: '3' },
        { content: content }
      );
      req.flash('success', 'Terms&Conditions updated successfully');
      res.redirect('back');
    } catch (error) {
      console.log(error, 'error');
      return res.status(500).json('Internal server error');
    }
  }
}

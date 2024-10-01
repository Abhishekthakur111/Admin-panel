
const cms = require('../../models/cms');

module.exports = {

  create: async (req, res) => {
    try {
      const data = await cms.create({
        ...req.body
      });
      res.status(200).json(data);
    } catch (error) {
      console.log(error, 'error');
      return res.status(500).json('Internal server error');
    }
  },
  privacy: async (req, res) => {
    try {
      if (!req.session.admin) return res.redirect('/login');
      const data = await cms.findOne({ role: '1' });
      if (!data) {
        return res.status(404).render('error', { message: 'Privacy policy not found' });
      }
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

      if (result.modifiedCount === 0) {
        return res.status(404).redirect('/cms/privacy'); 
      }
      req.flash('success', 'Privacy Policy updated successfully');
      res.redirect('back');
    } catch (error) {
      console.log(error, 'error');
      return res.status(500).json('Internal server error');
    }
  },
  aboutus: async (req, res) => {
    try {
      if (!req.session.admin) return res.redirect('/login');
      const data = await cms.findOne({ role: '2' });
      if (!data) {
        return res.status(404).render('error', { message: 'About us content not found' });
      }
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

      if (result.modifiedCount === 0) {
        return res.status(404).redirect('/cms/aboutus');
      }
      req.flash('success', 'About us updated successfully');
      res.redirect('back');
    } catch (error) {
      console.log(error, 'error');
      return res.status(500).json('Internal server error');
    }
  },
  term: async (req, res) => {
    try {
      if (!req.session.admin) return res.redirect('/login');
      const data = await cms.findOne({ role: '3' });
      if (!data) {
        return res.status(404).render('error', { message: 'Terms & Conditions not found' });
      }
      res.render('cms/terms', {
        session: req.session.admin,
        data,
        title: "Terms & Conditions",
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

      if (result.modifiedCount === 0) {
        return res.status(404).redirect('/cms/term');
      }
      req.flash('success', 'Terms&Conditions updated successfully');
      res.redirect('back');
    } catch (error) {
      console.log(error, 'error');
      return res.status(500).json('Internal server error');
    }
  }
}

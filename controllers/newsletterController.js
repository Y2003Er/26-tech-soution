const SubscriberModel = require('../models/subscriberModel');

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const NewsletterController = {

  // POST /newsletter/subscribe
  async subscribe(req, res) {
    try {
      const email = (req.body.email || '').trim().toLowerCase();

      if (!email || !EMAIL_REGEX.test(email)) {
        return res.status(400).json({ success: false, message: 'Weka email sahihi.' });
      }

      const result = await SubscriberModel.create(email);

      if (!result.inserted) {
        return res.json({ success: true, message: 'Tayari umejisajili hapo awali. Asante!' });
      }

      return res.json({ success: true, message: 'Umejisajili! Tutakutumia taarifa za software mpya.' });
    } catch (err) {
      console.error('subscribe error:', err);
      return res.status(500).json({ success: false, message: 'Hitilafu ya seva, jaribu tena baadaye.' });
    }
  },
};

module.exports = NewsletterController;
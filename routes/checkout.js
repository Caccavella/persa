'use strict'

module.exports = function() {
  var router = require('express').Router(),
  config = require('../config'),
  stripe = require('stripe')(config.stripeSecret);
    
  router.post('/create-checkout', async (req, res) => {
    console.log('body', req.body);
    try {
      let imageUrl = config.frontEndUrl + '/IntelLogo.png'
      let lineItemTemplate = {
        price_data: {
          currency: "usd",
          product_data: {
            name: "Intelligence Type Assessment",
            images: [imageUrl]
          },
          unit_amount: 1500,
        },
        quantity: 1,
      };
      let purchases = req.body.purchases;
      let checkoutData = {
        customer_email: req.body.email,
        payment_method_types: ["card"],
        line_items: [],
        mode: "payment",
        allow_promotion_codes: true,
        cancel_url: config.frontEndUrl + "/#/dashboard",
      }
      checkoutData.success_url = config.backendUrl + '/users/success/{CHECKOUT_SESSION_ID}/' + req.body.email;
      if(purchases) {
        if(purchases.includes('Intelligence')) {
          checkoutData.line_items.push(lineItemTemplate);
        } else if(purchases.includes('CulturAbilities')) {
          lineItemTemplate.name == 'CulturAbilities';
          checkoutData.line_items.push(lineItemTemplate);
        } else if(purchases.includes('TemperAbilities')) {
          lineItemTemplate.name == 'TemperAbilities';
          checkoutData.line_items.push(lineItemTemplate);
        } else if(purchases.includes('NeurAbilities')) {
          lineItemTemplate.name == 'NeurAbilities';
          checkoutData.line_items.push(lineItemTemplate);
        }
      }
      console.log('checkout', checkoutData);
      const session = await stripe.checkout.sessions.create(checkoutData)
      res.json({id: session.id});
    } catch {
      res.send({success: false, message: 'WTF'})
    }
  })


  return router
}
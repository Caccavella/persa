const { util } = require('client-sessions');

module.exports = function(db) {
  'use strict'
  var utils = require('./utils');
  var theseRoutes = require('express').Router();
  var sendInBlueClient = require('sib-api-v3-sdk');
  var defaultClient = sendInBlueClient.ApiClient.instance;
  var apiKey = defaultClient.authentications['api-key'];
  var config = require('../config')
  apiKey.apiKey = process.env.sendApi;
  const bcrypt = require('bcrypt');
  // Uncomment the following line to set a prefix for the API key, e.g. "Token" (defaults to null)
  // apiKey.apiKeyPrefix = 'Token';

  // Configure API key authorization: partner-key
  // var partnerKey = defaultClient.authentications['partner-key'];
  // partnerKey.apiKey = production.env.sendApi;
  // Uncomment the following line to set a prefix for the API key, e.g. "Token" (defaults to null)
  // partnerKey.apiKeyPrefix = 'Token';

  var apiInstance = new sendInBlueClient.TransactionalEmailsApi();

  theseRoutes.post('/saveUser', function(req, res) {
    if(!req.body) {
      res.send('No Body data')
    } else {
      // var ip = req.headers['x-forwarded-for'] || 
      // req.connection.remoteAddress || 
      // req.socket.remoteAddress ||
      // (req.connection.socket ? req.connection.socket.remoteAddress : null);
      // console.log(ip);
      var user = {
        userId: '',
        email: req.body.email,
        firstName: req.body.firstName,
        createdDate: Date.now()
      } 
      if(req.body.name) {
        user.name = req.body.name;
      } else {
        user.name = req.body.firstName + " " + req.body.lastName
      }
      if(req.body.password) {
        bcrypt.hash(req.body.password, config.saltRounds, function(err, hash) {
          if(err) {
            console.log(err);
          } else {
            user.password = hash
          }
        });
      } else {
        console.log('Password was not sent');
      }
      db.collection('users').doc(user.email).get().then(doc => {
        if(!doc || !doc.exists) {
          db.collection('users').doc(user.email).set(user).then(ref => {
            res.send({success: true})
          })
        } else {
          res.send({success: false, message: 'User already exists'})
        }
      })
    }
  })

  theseRoutes.post('/findUser', function(req, res) {
    if(!req.body.email) {
      res.status(400).send('Missing Params')
    } else {
      db.collection('users').doc(req.body.email).get().then(doc => {
        if(doc && doc.exists) {
          let dataPoints = doc.data();
          req.session.user = dataPoints;
          res.send({success: true, user: dataPoints}) 
        } else {
          res.send({success: false, message: 'Email not found'})
        }        
      })
    }
  })

  

  theseRoutes.post('/signIn', utils.requireLogin, function(req, res) {
    if(!req.body.user) {
      res.status(400).send('missing parameters')
    } else {
      db.collection('users').doc(req.body.user.email).get().then(doc => {
        if(doc && doc.exists) {
          let dataPoints = doc.data();
          if(dataPoints.password) {
            bcrypt.compare(req.body.user.password, dataPoints.password).then(function(result) {
              if(result === true) {
                req.session.user = dataPoints;
                console.log('thisuser', req.session);
                res.send({success: true, user: dataPoints}) 
              } else {
                res.send({success: false, message: 'Incorrect Password'})
              }
            })
          } else {
            res.send({success: false, message: 'No user password on file, please log in using Google Sign in if you have signed it with Google previously.'})
          }
        } else {
          res.send({success: false, message: 'Email not found.'})
        }
      })
    }
  })
  
  theseRoutes.post('/currentUser', utils.requireLogin, function(req, res) {
    console.log('session', req.session);
    if(req.session.user) {
      console.log('test', req.session.user);
      db.collection('users').doc(req.session.user.email).get().then(doc => {
        if(doc && doc.exists) {
          let dataPoints = doc.data();        
          req.session.user = dataPoints;
          res.send({success: true, user: dataPoints})         
        } else {
          res.send({success: false})
        }      
      })    
    } else {
      res.send({success: false})
    }
  })


  theseRoutes.post('/logout', function(req, res) {
    req.session.reset();
    res.send({success: true})
  })

  theseRoutes.post('/resetPassword', function(req, res) {
    if(!req.body.user) {
      res.status(400).send('missing parameters')
    } else {
      db.collection('users').doc(req.body.user.email).get().then(doc => {
        if(doc && doc.exists) {
          let dataPoints = doc.data();
          // Send email
          let clientName =  dataPoints.firstName;
          let clientEmail =  dataPoints.email;

          let resetId = utils.createPasswordResetId();

          db.collection('users').doc(req.body.user.email).update({resetId: resetId}).then(result => {

            
            let resetLink = config.baseUrl + '/#/reset/' + resetId;
            let emailMessage = "Hello, please <a href=" + resetLink + ">click here</a> or paste this url into your browser to reset your Personabilities account password. "+ resetLink + "</p><p>If you have any further questions please contact us at: support@personabilities.com. </p> <p>Thank you, </p><p><img src='https://i.ibb.co/5B3nrn1/Person-Abilities.png' alt='Personabilities' width='250' height='50' border='0' /></p>";
            
            var sendSmtpEmail = new sendInBlueClient.SendSmtpEmail()
            // console.log("email", clientEmail);
            sendSmtpEmail = {
              sender: {
                name: "Personabilities",
                email: "no-reply@personabilities.com"
              },
              to: [{
                email: clientEmail,
                name: clientName
              }],
              htmlContent: emailMessage,
              subject: "Personabilities Password Reset"
            };
            
            // Send Email
            apiInstance.sendTransacEmail(sendSmtpEmail).then(function(sendData) {
              console.log('API called successfully. Returned sendData: ' + sendData);
              res.send({success: true})
            }, function(error) {
              console.error("emailSendError", error);
              res.send({success: false, message: 'An error occurred when attempted to send this email.'})
            });
          }).catch(err => {
            res.send({success: false, message: 'Something went wrong resetting your password, please try again.'})
          })
        } else {
          res.send({success: false, message: 'No user exists with that information.'})
        }
      })
    }
  })

  theseRoutes.post('/verifyNewPassword', function(req, res) {
    if(!req.body.token) {
      res.send('No token')
    } else {
      db.collection('users').where('resetId', "==", req.body.token).get().then(snapshot => {
        if(!snapshot || snapshot.empty) {
          res.send("Token didn't match")
        } else {
          let results = [];
          snapshot.docs.forEach(document => {
            if(document.exists) {
              results.push(document.data())
            }
            // console.log(results[0]);
            let userEmail = results[0].email;
            let password = req.body.password;
            bcrypt.hash(password, config.saltRounds, function(err, hash) {
              if(err) {
                console.log(err);
              } else {
                password = hash;
                db.collection('users').doc(userEmail).update({resetId: '', password: password}).then(result => {
                  if(result) {
                    res.send({success: true, message: 'Password has been reset.'})
                  } else {
                    res.send({success: false, message: 'Something went wrong, please try again.'})
                  }
                }).catch(err => {
                  res.status(500).send(err)
                })
              }
            });
          })
        }
      })
    }
  })


  theseRoutes.get('/success/:id/:email', function(req, res) {
    if(!req.params.id) {
      console.log('No id');
      res.send({success: false, message: 'No id'})
    } else if(!req.params.email) {
      console.log('No email');
      res.send({success: false, message: 'No email'})
    } else {
      console.log('Recording');
      db.collection('users').doc(req.params.email).update({intelResultPaid: true}).then(result => {
        let url = 'https://app.personabilities.com/#/success/intelligence/' + req.params.id;
        console.log('Result', url);
        res.redirect(url);
        // if(result) {
        //   res.redirect('https://app.personabilities.com/#/success/intelligence/' + req.params.id);
        // } else {
        //   res.send({success: false, message: 'Something went wrong, please try again.'})
        // }
      })          
    }
  })

  theseRoutes.post('/userEmail', function(req, res) {
    if(!req.body) {
      res.send('No Body data')
    } else {
      let userEmail = req.body.user;
      if(req.body.userEmail) {
        userEmail = req.body.userEmail;
      }
      // console.log(userEmail);
      db.collection("users").doc(userEmail).get().then(doc => {
        if(doc && doc.exists)  {   
          let result = doc.data();      
          res.send({result: result});
        } else {
          res.send({results: false})
        }
      }).catch(err => {
        res.status(500).send(err)
      })
    }
  })

  theseRoutes.post('/allResponses', function(req, res) {
    db.collection("results").orderBy('resultsId').limit(2000).offset(req.body.skip).get().then(snapshot => {
      if(!snapshot) {
        res.send('Snapshot missing')
      } else if(snapshot.empty) {
        res.send({results: false})
      } else {
        // console.log('reached here', snapshot.docs);
        let results = [];
        snapshot.forEach(document => {
          if(document.exists) {
            let data = document.data();
            results.push({userEmail: data.userEmail, userName: data.userName, result: data.result})
          }
        })
        res.send({results: results})
      }
    }).catch(err => {
      res.status(500).send(err)
    })
  })
  
  // theseRoutes.post('/modify', function(req, res) {
  //   console.log('Hello');
  //   db.collection("users").get().then(snapshot => {
  //     snapshot.forEach(doc => {
  //       doc.ref.update({freeIntel: true})
  //     })
  //   })
    // .then(snapshot => {
    //   if(!snapshot) {
    //     res.send('Snapshot missing')
    //   } else if(snapshot.empty) {
    //     res.send({results: false})
    //   } else {
    //     // console.log('reached here', snapshot.docs);
    //     // let results = [];
    //     snapshot.forEach(document => {
    //       if(document.exists) {
    //         let data = document.data();
    //         // results.push(data.userEmail);
    //         db.collection('users').get(data.userEmail).update({freeIntel: true});
    //       } else {
    //         console.log("Doesn't exist");
    //       }
    //     })
    //     console.log('Yes');
    //     // res.send(results)
    //   }
    // }).catch(err => {
    //   res.status(500).send(err)
    // })
  // })

  theseRoutes.post('/userResults', function(req, res) {
    if(!req.body) {
      res.send('No Body data');
    } else {
      let resultsId = req.body.resultsId;
      db.collection("results").doc(resultsId).get().then(doc => {
        if(doc && doc.exists) {
          let response = doc.data();
          res.send({results: response});
        } else {
          res.send({results: false})
        }
      }).catch(err => {
        res.status(500).send(err)
      })
    }
  })

  return theseRoutes;
}
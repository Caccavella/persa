var fs = require('fs')
var path = require('path')
var config = require('../config')
var utils = require('./utils')
const { createPasswordResetId } = require('./utils');

module.exports = function(db) {

  'use strict'

  var theseRoutes = require('express').Router();
  var reference = require('../referenceTables/referenceTable');
  var cultureReference = require('../referenceTables/cultureTable');
  var temperamentTable = require('../referenceTables/temperamentTable');
  var intTable = require('../referenceTables/intelligenceTable')
  var neuroTable = require('../referenceTables/neuroTable')
  var utils = require('./utils');
  var sendInBlueClient = require('sib-api-v3-sdk');
  var defaultClient = sendInBlueClient.ApiClient.instance;


  // apiKey.apiKey = process.env.sendApi;
  // Uncomment the following line to set a prefix for the API key, e.g. "Token" (defaults to null)
  // apiKey.apiKeyPrefix = 'Token';

  // Configure API key authorization: partner-key
  // var partnerKey = defaultClient.authentications['partner-key'];
  // partnerKey.apiKey = production.env.sendApi;
  // partnerKey.apiKey = config.sendApi;
  // Uncomment the following line to set a prefix for the API key, e.g. "Token" (defaults to null)
  // partnerKey.apiKeyPrefix = 'Token';


 // SendSmtpEmail | Values to send a transactional email

  theseRoutes.post('/testIntel', function(req, res) {    
    let data = reference.find(el => {
      let testname = req.body.type;
      return testname == el.name;
    })
    console.log('hit');

    // Add unique string (randomized)
    // let resultsId = utils.createResultsId();
    // let response = {
    //   responseData: mappedValues,
    //   userEmail: emailAddress,
    //   userName: req.body.user.firstName,
    //   result: data,
    //   date: new Date(),
    //   resultsId: resultsId
    // }
    // console.log(response);
    console.log(data.name);
    // data.userName = 'Anthony'
    alterPdf(data).then(response => {
      if(response) {
        console.log(response);
        res.status(200).send({completed: true});
      }
    })    
  })
  
  // Solution requires paid service.

  // async function test(data) {
  //   try {
  //     let routeToFile = '../src/assets/pdfs/' + data.name + ' Report.pdf';
  //     await PDFNet.initialize();
  //     const doc = await PDFNet.PDFDoc.createFromFilePath(path.resolve(__dirname, routeToFile));
  //     doc.initSecurityHandler();
  //     const replacer = await PDFNet.ContentReplacer.create();
  //     const page = await doc.getPage(2);
  //     await replacer.addString('[full name]', 'Anthony');
  //     await replacer.process(page);
  //     await doc.save('newFile.pdf', PDFNet.SDFDoc.SaveOptions.e_remove_unused);
  //     console.log('complete');
  //   } catch (err) {
  //     console.log(err);
  //   }
  // }

  // Culture

  theseRoutes.post('/parseCulture', async (req, res, next) => {
    if(!req.body || !req.body.user) {
      res.send('No body data was sent.')
    } else {
      let strongScore = 0,
        strongArray = [1,5,9,13,17,21,25,29,33,37,41,45],
        humaneScore = 0,
        humaneArray = [2,6,10,14,18,22,26,30,34,38,42,46],
        synergisticScore = 0,
        synergisticArray = [3,7,11,15,19,23,27,31,35,39,43,47],
        autonomousScore = 0,
        autonomousArray = [4,8,12,16,20,24,28,32,36,40,44,48],
        warmScore = 0,
        warmArray = [49,52,55,58,61,64,67,70],
        professionalScore = 0,
        professionalArray = [50,53,56,59,62,65,68,71],
        refinedScore = 0,
        refinedArray = [51,54,57,60,63,66,69,72],
        preciseScore = 0,
        preciseArray = [73,75,77,79,81,83],
        flexibleScore = 0,
        flexibleArray = [74,76,78,30,82,84];
        
      let firstOutput = '';
      let secondOutput = '';
      let thirdOutput = 'Flexible';

      let mappedValues = req.body.questions.questions;      
      mappedValues.map(el => {
        let questNum = el.questionId;
        // console.log('res', questNum, el.response);
        if(strongArray.includes(questNum*1)) {
          strongScore += el.response*1;
        } else if(humaneArray.includes(questNum*1)) {
          humaneScore += el.response*1;
        } else if(synergisticArray.includes(questNum*1)) {
          synergisticScore += el.response*1;
        } else if(autonomousArray.includes(questNum*1)) {
          autonomousScore += el.response*1;
        } else if(warmArray.includes(questNum*1)) {
          warmScore += el.response*1;
        } else if(professionalArray.includes(questNum*1)) {
          professionalScore += el.response*1;
        } else if(refinedArray.includes(questNum*1)) {
          refinedScore += el.response*1;
        } else if(preciseArray.includes(questNum*1)) {
          preciseScore += el.response*1;
        } else if(flexibleArray.includes(questNum*1)) {
          flexibleScore += el.response*1;
        }
      })

      // Get Max of Primary

      // let tie = false;
      // let first, second, third;
      // third = first = second;
      let sortArr = [
        { type: 'Strong', score: strongScore}, 
        { type: 'Humane', score: humaneScore},
        { type: 'Synergistic', score: synergisticScore}, 
        { type: 'Autonomous', score: autonomousScore}
      ];

      // Get the max of the scores, make sure it's not equal to any others
      
      sortArr.sort((a,b) => {
        return b.score - a.score;
      });
      // console.log(sortArr);
      if(sortArr[0].score > sortArr[1].score) {
        firstOutput = sortArr[0].type;
      } else if(sortArr[1].score > sortArr[2].score) {
        if(sortArr[0].type == 'Synergistic') {
          firstOutput = 'Synergistic'
        } else if(sortArr[0].type == 'Autonomous') {
          firstOutput = sortArr[1].type;
        } else if(sortArr[1].type == 'Autonomous') {
          firstOutput = sortArr[0].type;
        } else if((sortArr[0].type == 'Strong' && sortArr[1].type == 'Humane') || (sortArr[1].type == 'Strong' && sortArr[0].type == 'Humane')) {
            firstOutput = 'Humane';
        } else {
          firstOutput = sortArr[0].type;
        }
      } else if(sortArr[2].score > sortArr[3].score) {
        if(sortArr[0].type == 'Synergistic' || sortArr[1].type == 'Synergistic' || sortArr[2].type == 'Synergistic') {
          firstOutput = 'Synergistic';
        } else if(sortArr[0].type == 'Autonomous' || sortArr[1].type == 'Autonomous' || sortArr[2].type == 'Autonomous') {
          if(sortArr[0].type == 'Autonomous') {
            if((sortArr[1].type == 'Strong' && sortArr[2].type == 'Humane') || (sortArr[2].type == 'Strong' && sortArr[1].type == 'Humane')) {
              firstOutput = 'Humane';
            } else {              
              firstOutput = sortArr[1].type;
            }
          } else if(sortArr[1].type == 'Autonomous') {
            if((sortArr[0].type == 'Strong' && sortArr[2].type == 'Humane') || (sortArr[2].type == 'Strong' && sortArr[0].type == 'Humane')) {
              firstOutput = 'Humane';
            } else {
              firstOutput = sortArr[0].type;
            }
          } else if(sortArr[2].type == 'Autonomous') {
            if((sortArr[0].type == 'Strong' && sortArr[1].type == 'Humane') || (sortArr[1].type == 'Strong' && sortArr[0].type == 'Humane')) {
              firstOutput = 'Humane';
            } else {
              firstOutput = sortArr[0].type;
            }
          } else {
            firstOutput = sortArr[0].type;
          }
        }
      } else {
        firstOutput = sortArr[0].type;
      }      

      // Get Max of Secondary

      if(warmScore >= professionalScore && warmScore >= refinedScore) {
        secondOutput = 'Warm'
      } else if(refinedScore >= professionalScore) {
        secondOutput = 'Refined';
      } else {
        secondOutput = 'Professional'
      }
      
      // Compute Precise/Flex

      if(preciseScore >= flexibleScore) {
        thirdOutput = 'Precise';
      }

      // Get Result From Reference

      let result = cultureReference.find(el => {
        return (el.primary == firstOutput && el.secondary == secondOutput)
      })
      // console.log('res', result, firstOutput, secondOutput);
      // Update Id, update user and results collections, then send result
      let resultsId = utils.createResultsId();
      let emailAddress = req.body.user.email;
      let response = {
        responseData: mappedValues,
        userEmail: emailAddress,
        userName: req.body.user.firstName,
        result: result,
        date: new Date(),
        resultsId: resultsId
      }
      console.log(response.result);
      // if(req.body.user.name) {
      //   result.userName = req.body.user.name;
      // } else {
      //   result.userName = req.body.user.firstName + " " + req.body.user.lastName;                
      // }
      // db.collection('results').insert(response)
      // db.collection('users').findOneAndUpdate({email: req.body.user.email}, {$set: {cultureResultsId: resultsId}}, function(err, result) {
      //   if(err) {
      //     console.log("something went wrong");
      //     res.status(500).send(err)
      //   } else {
      //     res.send(response)
      //   }
      // })
      db.collection('results').doc(resultsId).set(response).then(ref => {
        db.collection('users').doc(req.body.user.email).update({cultureResultsId: resultsId}).then(result => {
          res.send(response);
        }).catch(err3 => {
          res.send(response);            
        })
      }).catch(err => {
        console.log("Error: ",err);          
        res.status(403).send('User not authorized')
      })
    }
  })

  // Temperament

  theseRoutes.post('/parseTemperament', async (req, res, next) => {
    if(!req.body || !req.body.user) {
      res.send('No body data was sent.')
    } else {
      let igniteScore = 0,
        igniteArray = [1,5,9,13,17,21,25,29],
        sustainerScore = 0,
        sustainerArray = [2,6,10,14,18,22,26,30],
        animatorScore = 0,
        animatorArray = [3,7,11,15,19,23,27,31],
        respecterScore = 0,
        respecterArray = [4,8,12,16,20,24,28,32],
        adaptiveScore = 0,
        adaptiveArray = [33,36,39,42,45,48],
        insiderScore = 0,
        insiderArray = [34,37,40,43,46,49],
        freeScore = 0,
        freeArray = [35,38,41,44,47,50],
        relaxedScore = 0,
        relaxedArray = [51,53,55,57,59,61],
        intenseScore = 0,
        intenseArray = [52,54,56,58,60,62];
        
      let firstOutput = '';
      let secondOutput = '';
      let thirdOutput = 'Intense';
  
      let mappedValues = req.body.questions.questions;      
      mappedValues.map(el => {
        let questNum = el.questionId;
        // console.log('res', questNum, el.response);
        if(igniteArray.includes(questNum*1)) {
          igniteScore += el.response*1;
        } else if(sustainerArray.includes(questNum*1)) {
          sustainerScore += el.response*1;
        } else if(animatorArray.includes(questNum*1)) {
          animatorScore += el.response*1;
        } else if(respecterArray.includes(questNum*1)) {
          respecterScore += el.response*1;
        } else if(adaptiveArray.includes(questNum*1)) {
          adaptiveScore += el.response*1;
        } else if(insiderArray.includes(questNum*1)) {
          insiderScore += el.response*1;
        } else if(freeArray.includes(questNum*1)) {
          freeScore += el.response*1;
        } else if(relaxedArray.includes(questNum*1)) {
          relaxedScore += el.response*1;
        } else if(intenseArray.includes(questNum*1)) {
          intenseScore += el.response*1;
        }
      })
  
      // Get Max of Primary
  
      // let tie = false;
      // let first, second, third;
      // third = first = second;
      let sortArr = [
        { type: 'Igniter', score: igniteScore}, 
        { type: 'Sustainer', score: sustainerScore},
        { type: 'Animator', score: animatorScore}, 
        { type: 'Respecter', score: respecterScore}
      ];
  
      // Get the max of the scores, make sure it's not equal to any others
      
      sortArr.sort((a,b) => {
        return b.score - a.score;
      });
      // console.log(sortArr);
      if(sortArr[0].score > sortArr[1].score) {
        firstOutput = sortArr[0].type;
      } else if(sortArr[1].score > sortArr[2].score) {
        if(sortArr[0].type == 'Animator') {
          firstOutput = 'Animator'
        } else if(sortArr[0].type == 'Respecter') {
          firstOutput = sortArr[1].type;
        } else if(sortArr[1].type == 'Respecter') {
          firstOutput = sortArr[0].type;
        } else if((sortArr[0].type == 'Igniter' && sortArr[1].type == 'Sustainer') || (sortArr[1].type == 'Igniter' && sortArr[0].type == 'Sustainer')) {
            firstOutput = 'Sustainer';
        } else {
          firstOutput = sortArr[0].type;
        }
      } else if(sortArr[2].score > sortArr[3].score) {
          if(sortArr[0].type == 'Animator' || sortArr[1].type == 'Animator' || sortArr[2].type == 'Animator') {
            firstOutput = 'Animator';
          } else if(sortArr[0].type == 'Respecter' || sortArr[1].type == 'Respecter' || sortArr[2].type == 'Respecter') {
            if(sortArr[0].type == 'Respecter') {
              if((sortArr[1].type == 'Igniter' && sortArr[2].type == 'Sustainer') || (sortArr[2].type == 'Igniter' && sortArr[1].type == 'Sustainer')) {
                firstOutput = 'Sustainer';
              } else {              
                firstOutput = sortArr[1].type;
              }
            } else if(sortArr[1].type == 'Respecter') {
              if((sortArr[0].type == 'Igniter' && sortArr[2].type == 'Sustainer') || (sortArr[2].type == 'Igniter' && sortArr[0].type == 'Sustainer')) {
                firstOutput = 'Sustainer';
              } else {
                firstOutput = sortArr[0].type;
              }
            } else if(sortArr[2].type == 'Respecter') {
              if((sortArr[0].type == 'Igniter' && sortArr[1].type == 'Sustainer') || (sortArr[1].type == 'Igniter' && sortArr[0].type == 'Sustainer')) {
                firstOutput = 'Sustainer';
              } else {
                firstOutput = sortArr[0].type;
              }
            } else {
              firstOutput = sortArr[0].type;
            }
          }
      } else {
        firstOutput = sortArr[0].type;
      }      
  
      // Get Max of Secondary
  
      if(adaptiveScore > insiderScore && adaptiveScore >= freeScore) {
        secondOutput = 'Adaptive'
      } else if(freeScore > insiderScore) {
        secondOutput = 'Free';
      } else {
        secondOutput = 'Insider'
      }
      
      // Compute Relaxed/Flex
  
      if(relaxedScore >= intenseScore) {
        thirdOutput = 'Relaxed';
      }
  
      // Get Result From Reference
  
        let result = temperamentTable.find(el => {
          return (el.primary == firstOutput && el.secondary == secondOutput)
        })
        console.log('res', result, firstOutput, secondOutput);
        // Update Id, update user and results collections, then send result
        let resultsId = utils.createResultsId();
        let emailAddress = req.body.user.email;
        let response = {
          responseData: mappedValues,
          userEmail: emailAddress,
          userName: req.body.user.firstName,
          result: result,
          date: new Date(),
          resultsId: resultsId
        }
        console.log(response.result);
        // if(req.body.user.name) {
        //   result.userName = req.body.user.name;
        // } else {
        //   result.userName = req.body.user.firstName + " " + req.body.user.lastName;                
        // }
        db.collection('results').doc(resultsId).set(response).then(ref => {
          db.collection('users').doc(req.body.user.email).update({temperamentResultsId: resultsId}).then(result => {
            res.send(response);
          }).catch(err3 => {
            res.send(response);            
          })
        }).catch(err => {
          console.log("Error: ",err);          
          res.status(403).send('User not authorized')
        })  
        // db.collection('results').insert(response)
        // db.collection('users').findOneAndUpdate({email: req.body.user.email}, {$set: {temperamentResultsId: resultsId}}, function(err, result) {
        //   if(err) {
        //     console.log("something went wrong");
        //     res.status(500).send(err)
        //   } else {
        //     res.send(response)
        //   }
        // })
        // res.send(response)   
    }
  })

  // Neuro

  theseRoutes.post('/parseNeuro', async (req, res, next) => {
    if(!req.body || !req.body.user) {
      res.send('No body data was sent.')
    } else {
      let discernersScore = 0,
        discernersArray = [1,5,9,13,17,21,25,29,33,37,41,45],
        idealistScore = 0,
        idealistArray = [2,6,10,14,18,22,26,30,34,38,42,46],
        analyzersScore = 0,
        analyzersArray = [3,7,11,15,19,23,27,31,35,39,43,47],
        realistScore = 0,
        realistArray = [4,8,12,16,20,24,28,32,36,40,44,48],
        neutralScore = 0,
        neutralArray = [49,52,55,58,61,64],
        majorScore = 0,
        majorArray = [50,53,56,59,62,65],
        minorScore = 0,
        minorArray = [51,54,57,60,63,66],
        immaterialScore = 0,
        immaterialArray = [67,69,71,73,75],
        materialScore = 0,
        materialArray = [68,70,72,74,76];
        
      let firstOutput = '';
      let secondOutput = '';
      let thirdOutput = 'Material';
  
      let mappedValues = req.body.questions.questions;      
      mappedValues.map(el => {
        let questNum = el.questionId;
        // console.log('res', questNum, el.response);
        if(discernersArray.includes(questNum*1)) {
          discernersScore += el.response*1;
        } else if(idealistArray.includes(questNum*1)) {
          idealistScore += el.response*1;
        } else if(analyzersArray.includes(questNum*1)) {
          analyzersScore += el.response*1;
        } else if(realistArray.includes(questNum*1)) {
          realistScore += el.response*1;
        } else if(neutralArray.includes(questNum*1)) {
          neutralScore += el.response*1;
        } else if(majorArray.includes(questNum*1)) {
          majorScore += el.response*1;
        } else if(minorArray.includes(questNum*1)) {
          minorScore += el.response*1;
        } else if(immaterialArray.includes(questNum*1)) {
          immaterialScore += el.response*1;
        } else if(materialArray.includes(questNum*1)) {
          materialScore += el.response*1;
        }
      })
  
      // Get Max of Primary
  
      // let tie = false;
      // let first, second, third;
      // third = first = second;
      let sortArr = [
        { type: 'Discerners', score: discernersScore}, 
        { type: 'Idealists', score: idealistScore},
        { type: 'Analyzers', score: analyzersScore}, 
        { type: 'Realists', score: realistScore}
      ];
  
      // Get the max of the scores, make sure it's not equal to any others
      
      sortArr.sort((a,b) => {
        return b.score - a.score;
      });
      // console.log(sortArr);
      if(sortArr[0].score > sortArr[1].score) {
        firstOutput = sortArr[0].type;
      } else if(sortArr[1].score > sortArr[2].score) {
        if(sortArr[0].type == 'Analyzers') {
          firstOutput = 'Analyzers'
        } else if(sortArr[0].type == 'Realists') {
          firstOutput = sortArr[1].type;
        } else if(sortArr[1].type == 'Realists') {
          firstOutput = sortArr[0].type;
        } else if((sortArr[0].type == 'Discerners' && sortArr[1].type == 'Idealists') || (sortArr[1].type == 'Discerners' && sortArr[0].type == 'Idealists')) {
            firstOutput = 'Idealists';
        } else {
          firstOutput = sortArr[0].type;
        }
      } else if(sortArr[2].score > sortArr[3].score) {
          if(sortArr[0].type == 'Analyzers' || sortArr[1].type == 'Analyzers' || sortArr[2].type == 'Analyzers') {
            firstOutput = 'Analyzers';
          } else if(sortArr[0].type == 'Realists' || sortArr[1].type == 'Realists' || sortArr[2].type == 'Realists') {
            if(sortArr[0].type == 'Realists') {
              if((sortArr[1].type == 'Discerners' && sortArr[2].type == 'Idealists') || (sortArr[2].type == 'Discerners' && sortArr[1].type == 'Idealists')) {
                firstOutput = 'Idealists';
              } else {              
                firstOutput = sortArr[1].type;
              }
            } else if(sortArr[1].type == 'Realists') {
              if((sortArr[0].type == 'Discerners' && sortArr[2].type == 'Idealists') || (sortArr[2].type == 'Discerners' && sortArr[0].type == 'Idealists')) {
                firstOutput = 'Idealists';
              } else {
                firstOutput = sortArr[0].type;
              }
            } else if(sortArr[2].type == 'Realists') {
              if((sortArr[0].type == 'Discerners' && sortArr[1].type == 'Idealists') || (sortArr[1].type == 'Discerners' && sortArr[0].type == 'Idealists')) {
                firstOutput = 'Idealists';
              } else {
                firstOutput = sortArr[0].type;
              }
            } else {
              firstOutput = sortArr[0].type;
            }
          }
      } else {
        firstOutput = sortArr[0].type;
      }
  
      // Get Max of Secondary
  
      if(neutralScore >= majorScore && neutralScore >= minorScore) {
        secondOutput = 'Neutral'
      } else if(minorScore >= majorScore) {
        secondOutput = 'Minor';
      } else {
        secondOutput = 'Major'
      }
      
      // Compute Relaxed/Flex
  
      if(immaterialScore >= materialScore) {
        thirdOutput = 'Immaterial';
      }

      // Get Result From Reference
      
      let result = neuroTable.find(el => {
        return (el.primary == firstOutput && el.secondary == secondOutput)
      })
      let resultsId = utils.createResultsId();
      let emailAddress = req.body.user.email;
      let response = {
        responseData: mappedValues,
        userEmail: emailAddress,
        userName: req.body.user.firstName,
        result: result,
        date: new Date(),
        resultsId: resultsId
      }
      console.log(response.result);
      // if(req.body.user.name) {
      //   result.userName = req.body.user.name;
      // } else {
      //   result.userName = req.body.user.firstName + " " + req.body.user.lastName;                
      // }
      db.collection('results').doc(resultsId).set(response).then(ref => {
        db.collection('users').doc(req.body.user.email).update({neuroResultsId: resultsId}).then(result => {
          res.send(response);
        }).catch(err3 => {
          res.send(response);            
        })
      }).catch(err => {
        console.log("Error: ",err);          
        res.status(403).send('User not authorized')
      })
      // db.collection('results').insert(response)
      // db.collection('users').findOneAndUpdate({email: req.body.user.email}, {$set: {neuroResultsId: resultsId}}, function(err, result) {
      //   if(err) {
      //     console.log("something went wrong");
      //     res.status(500).send(err)
      //   } else {
      //     res.send(response)
      //   }
      // })
      // Update Id, update user and results collections, then send result
      // res.send({result: result})        
    }
  })

  // Intelligence

  theseRoutes.post('/parseIntel', async (req, res, next) => {
    // console.log("Prod Env Key", process.env.sendApi);
    
    if(!req.body || !req.body.user) {
      res.send('No body data was sent.')
    } else {
      let emailAddress = req.body.user.email;
      // db.collection('users').where('email', '==', emailAddress).get().then(doc => {
      //   if(!doc.empty) {
          let mappedValues = req.body.questions.questions;
          let scoreList = [
            {name: 'chairman', score: 0, subtype: ''},
            {name: 'commander', score: 0, subtype: ''},
            {name: 'visionary', score: 0, subtype: ''},
            {name: 'entrepreneur', score: 0, subtype: ''},
            {name: 'guru', score: 0, subtype: ''},
            {name: 'producer', score: 0, subtype: ''},
            {name: 'champion', score: 0, subtype: ''},
            {name: 'agent', score: 0, subtype: ''},
            {name: 'designer', score: 0, subtype: ''},
            {name: 'architect', score: 0, subtype: ''},
            {name: 'mastermind', score: 0, subtype: ''},
            {name: 'discoverer', score: 0, subtype: ''},
            {name: 'iconoclast', score: 0, subtype: ''},
            {name: 'radical', score: 0, subtype: ''},
            {name: 'defender', score: 0, subtype: ''},
            {name: 'promoter', score: 0, subtype: ''},
            {name: 'diplomat', score: 0, subtype: ''},
            {name: 'negotiator', score: 0, subtype: ''},
            {name: 'confidant', score: 0, subtype: ''},
            {name: 'firebrand', score: 0, subtype: ''},
            {name: 'administrator', score: 0, subtype: ''},
            {name: 'maestro', score: 0, subtype: ''},
            {name: 'analyst', score: 0, subtype: ''},
            {name: 'fieldMarshal', score: 0, subtype: ''}
          ];
          let cS = [];
          for (let index = 0; index < 24; index++) {
            cS.push([0,0,0,0]);
          };
          let lowest = null;
          let subtypes = ['A', 'B', 'C', 'D'];
          // console.log('yest', mappedValues);
          mappedValues.map((el, ind) => {
            if(el.questionId < 67) {
              let q = "q" + (el.questionId);
              console.log(q);
              let diff;
              let res = el.response;
              // console.log(res);
              // chairman
              diff = Math.abs((res*1) - intTable.chairmanA.scores[q].av);
              cS[0][0] += (diff * intTable.chairmanA.scores[q].aw);
              diff = Math.abs((res*1) - intTable.chairmanB.scores[q].av);
              cS[0][1] += (diff * intTable.chairmanB.scores[q].aw);
              diff = Math.abs((res*1) - intTable.chairmanC.scores[q].av);
              cS[0][2] += (diff * intTable.chairmanC.scores[q].aw);
              diff = Math.abs((res*1) - intTable.chairmanD.scores[q].av);
              cS[0][3] += (diff * intTable.chairmanD.scores[q].aw);
              // console.log(cS[0]);
              // console.log(cS);
              // Check for which index is lowest & save as subtype.                              
              // commander
              diff = Math.abs((res*1) - intTable.commanderA.scores[q].av);
              // Might need to be rounded down or some such to avoid float issues.
              cS[1][0] += (diff * intTable.commanderA.scores[q].aw);
              diff = Math.abs((res*1) - intTable.commanderB.scores[q].av);
              cS[1][1] += (diff * intTable.commanderB.scores[q].aw);
              diff = Math.abs((res*1) - intTable.commanderC.scores[q].av);
              cS[1][2] += (diff * intTable.commanderC.scores[q].aw);
              diff = Math.abs((res*1) - intTable.commanderD.scores[q].av);
              cS[1][3] += (diff * intTable.commanderD.scores[q].aw);                  
              // visionary
              diff = Math.abs((res*1) - intTable.visionaryA.scores[q].av);
              // Might need to be rounded down or some such to avoid float issues.
              cS[2][0] += (diff * intTable.visionaryA.scores[q].aw);
              diff = Math.abs((res*1) - intTable.visionaryB.scores[q].av);
              cS[2][1] += (diff * intTable.visionaryB.scores[q].aw);
              diff = Math.abs((res*1) - intTable.visionaryC.scores[q].av);
              cS[2][2] += (diff * intTable.visionaryC.scores[q].aw);
              diff = Math.abs((res*1) - intTable.visionaryD.scores[q].av);
              cS[2][3] += (diff * intTable.visionaryD.scores[q].aw);                  
              // entrepreneur
              diff = Math.abs((res*1) - intTable.entrepreneurA.scores[q].av);
              // Might need to be rounded down or some such to avoid float issues.
              cS[3][0] += (diff * intTable.entrepreneurA.scores[q].aw);
              diff = Math.abs((res*1) - intTable.entrepreneurB.scores[q].av);
              cS[3][1] += (diff * intTable.entrepreneurB.scores[q].aw);
              diff = Math.abs((res*1) - intTable.entrepreneurC.scores[q].av);
              cS[3][2] += (diff * intTable.entrepreneurC.scores[q].aw);
              diff = Math.abs((res*1) - intTable.entrepreneurD.scores[q].av);
              cS[3][3] += (diff * intTable.entrepreneurD.scores[q].aw);                  
              // guru
              diff = Math.abs((res*1) - intTable.guruA.scores[q].av);
              // Might need to be rounded down or some such to avoid float issues.
              cS[4][0] += (diff * intTable.guruA.scores[q].aw);
              diff = Math.abs((res*1) - intTable.guruB.scores[q].av);
              cS[4][1] += (diff * intTable.guruB.scores[q].aw);
              diff = Math.abs((res*1) - intTable.guruC.scores[q].av);
              cS[4][2] += (diff * intTable.guruC.scores[q].aw);
              diff = Math.abs((res*1) - intTable.guruD.scores[q].av);
              cS[4][3] += (diff * intTable.guruD.scores[q].aw);                  
              // producer
              diff = Math.abs((res*1) - intTable.producerA.scores[q].av);
              // Might need to be rounded down or some such to avoid float issues.
              cS[5][0] += (diff * intTable.producerA.scores[q].aw);
              diff = Math.abs((res*1) - intTable.producerB.scores[q].av);
              cS[5][1] += (diff * intTable.producerB.scores[q].aw);
              diff = Math.abs((res*1) - intTable.producerC.scores[q].av);
              cS[5][2] += (diff * intTable.producerC.scores[q].aw);
              diff = Math.abs((res*1) - intTable.producerD.scores[q].av);
              cS[5][3] += (diff * intTable.producerD.scores[q].aw);                  
              // champion
              diff = Math.abs((res*1) - intTable.championA.scores[q].av);
              // Might need to be rounded down or some such to avoid float issues.
              cS[6][0] += (diff * intTable.championA.scores[q].aw);
              diff = Math.abs((res*1) - intTable.championB.scores[q].av);
              cS[6][1] += (diff * intTable.championB.scores[q].aw);
              diff = Math.abs((res*1) - intTable.championC.scores[q].av);
              cS[6][2] += (diff * intTable.championC.scores[q].aw);
              diff = Math.abs((res*1) - intTable.championD.scores[q].av);
              cS[6][3] += (diff * intTable.championD.scores[q].aw);                  
              // agent
              diff = Math.abs((res*1) - intTable.agentA.scores[q].av);
              // Might need to be rounded down or some such to avoid float issues.
              cS[7][0] += (diff * intTable.agentA.scores[q].aw);
              diff = Math.abs((res*1) - intTable.agentB.scores[q].av);
              cS[7][1] += (diff * intTable.agentB.scores[q].aw);
              diff = Math.abs((res*1) - intTable.agentC.scores[q].av);
              cS[7][2] += (diff * intTable.agentC.scores[q].aw);
              diff = Math.abs((res*1) - intTable.agentD.scores[q].av);
              cS[7][3] += (diff * intTable.agentD.scores[q].aw);                  
              // designer
              diff = Math.abs((res*1) - intTable.designerA.scores[q].av);
              // Might need to be rounded down or some such to avoid float issues.
              cS[8][0] += (diff * intTable.designerA.scores[q].aw);
              diff = Math.abs((res*1) - intTable.designerB.scores[q].av);
              cS[8][1] += (diff * intTable.designerB.scores[q].aw);
              diff = Math.abs((res*1) - intTable.designerC.scores[q].av);
              cS[8][2] += (diff * intTable.designerC.scores[q].aw);
              diff = Math.abs((res*1) - intTable.designerD.scores[q].av);
              cS[8][3] += (diff * intTable.designerD.scores[q].aw);                  
              // architect
              diff = Math.abs((res*1) - intTable.architectA.scores[q].av);
              // Might need to be rounded down or some such to avoid float issues.
              cS[9][0] += (diff * intTable.architectA.scores[q].aw);
              diff = Math.abs((res*1) - intTable.architectB.scores[q].av);
              cS[9][1] += (diff * intTable.architectB.scores[q].aw);
              diff = Math.abs((res*1) - intTable.architectC.scores[q].av);
              cS[9][2] += (diff * intTable.architectC.scores[q].aw);
              diff = Math.abs((res*1) - intTable.architectD.scores[q].av);
              cS[9][3] += (diff * intTable.architectD.scores[q].aw);                  
              // mastermind
              diff = Math.abs((res*1) - intTable.mastermindA.scores[q].av);
              // Might need to be rounded down or some such to avoid float issues.
              cS[10][0] += (diff * intTable.mastermindA.scores[q].aw);
              diff = Math.abs((res*1) - intTable.mastermindB.scores[q].av);
              cS[10][1] += (diff * intTable.mastermindB.scores[q].aw);
              diff = Math.abs((res*1) - intTable.mastermindC.scores[q].av);
              cS[10][2] += (diff * intTable.mastermindC.scores[q].aw);
              diff = Math.abs((res*1) - intTable.mastermindD.scores[q].av);
              cS[10][3] += (diff * intTable.mastermindD.scores[q].aw);                  
              // discoverer
              diff = Math.abs((res*1) - intTable.discovererA.scores[q].av);
              // Might need to be rounded down or some such to avoid float issues.
              cS[11][0] += (diff * intTable.discovererA.scores[q].aw);
              diff = Math.abs((res*1) - intTable.discovererB.scores[q].av);
              cS[11][1] += (diff * intTable.discovererB.scores[q].aw);
              diff = Math.abs((res*1) - intTable.discovererC.scores[q].av);
              cS[11][2] += (diff * intTable.discovererC.scores[q].aw);
              diff = Math.abs((res*1) - intTable.discovererD.scores[q].av);
              cS[11][3] += (diff * intTable.discovererD.scores[q].aw);                  
              // iconoclast
              diff = Math.abs((res*1) - intTable.iconoclastA.scores[q].av);
              // Might need to be rounded down or some such to avoid float issues.
              cS[12][0] += (diff * intTable.iconoclastA.scores[q].aw);
              diff = Math.abs((res*1) - intTable.iconoclastB.scores[q].av);
              cS[12][1] += (diff * intTable.iconoclastB.scores[q].aw);
              diff = Math.abs((res*1) - intTable.iconoclastC.scores[q].av);
              cS[12][2] += (diff * intTable.iconoclastC.scores[q].aw);
              diff = Math.abs((res*1) - intTable.iconoclastD.scores[q].av);
              cS[12][3] += (diff * intTable.iconoclastD.scores[q].aw);                  
              // radical
              diff = Math.abs((res*1) - intTable.radicalA.scores[q].av);
              // Might need to be rounded down or some such to avoid float issues.
              cS[13][0] += (diff * intTable.radicalA.scores[q].aw);
              diff = Math.abs((res*1) - intTable.radicalB.scores[q].av);
              cS[13][1] += (diff * intTable.radicalB.scores[q].aw);
              diff = Math.abs((res*1) - intTable.radicalC.scores[q].av);
              cS[13][2] += (diff * intTable.radicalC.scores[q].aw);
              diff = Math.abs((res*1) - intTable.radicalD.scores[q].av);
              cS[13][3] += (diff * intTable.radicalD.scores[q].aw);                  
              // defender
              diff = Math.abs((res*1) - intTable.defenderA.scores[q].av);
              // Might need to be rounded down or some such to avoid float issues.
              cS[14][0] += (diff * intTable.defenderA.scores[q].aw);
              diff = Math.abs((res*1) - intTable.defenderB.scores[q].av);
              cS[14][1] += (diff * intTable.defenderB.scores[q].aw);
              diff = Math.abs((res*1) - intTable.defenderC.scores[q].av);
              cS[14][2] += (diff * intTable.defenderC.scores[q].aw);
              diff = Math.abs((res*1) - intTable.defenderD.scores[q].av);
              cS[14][3] += (diff * intTable.defenderD.scores[q].aw);                  
              // promoter
              diff = Math.abs((res*1) - intTable.promoterA.scores[q].av);
              // Might need to be rounded down or some such to avoid float issues.
              cS[15][0] += (diff * intTable.promoterA.scores[q].aw);
              diff = Math.abs((res*1) - intTable.promoterB.scores[q].av);
              cS[15][1] += (diff * intTable.promoterB.scores[q].aw);
              diff = Math.abs((res*1) - intTable.promoterC.scores[q].av);
              cS[15][2] += (diff * intTable.promoterC.scores[q].aw);
              diff = Math.abs((res*1) - intTable.promoterD.scores[q].av);
              cS[15][3] += (diff * intTable.promoterD.scores[q].aw);                  
              // diplomat
              diff = Math.abs((res*1) - intTable.diplomatA.scores[q].av);
              // Might need to be rounded down or some such to avoid float issues.
              cS[16][0] += (diff * intTable.diplomatA.scores[q].aw);
              diff = Math.abs((res*1) - intTable.diplomatB.scores[q].av);
              cS[16][1] += (diff * intTable.diplomatB.scores[q].aw);
              diff = Math.abs((res*1) - intTable.diplomatC.scores[q].av);
              cS[16][2] += (diff * intTable.diplomatC.scores[q].aw);
              diff = Math.abs((res*1) - intTable.diplomatD.scores[q].av);
              cS[16][3] += (diff * intTable.diplomatD.scores[q].aw);                  
              // negotiator
              diff = Math.abs((res*1) - intTable.negotiatorA.scores[q].av);
              // Might need to be rounded down or some such to avoid float issues.
              cS[17][0] += (diff * intTable.negotiatorA.scores[q].aw);
              diff = Math.abs((res*1) - intTable.negotiatorB.scores[q].av);
              cS[17][1] += (diff * intTable.negotiatorB.scores[q].aw);
              diff = Math.abs((res*1) - intTable.negotiatorC.scores[q].av);
              cS[17][2] += (diff * intTable.negotiatorC.scores[q].aw);
              diff = Math.abs((res*1) - intTable.negotiatorD.scores[q].av);
              cS[17][3] += (diff * intTable.negotiatorD.scores[q].aw);                  
              // confidant
              diff = Math.abs((res*1) - intTable.confidantA.scores[q].av);
              // Might need to be rounded down or some such to avoid float issues.
              cS[18][0] += (diff * intTable.confidantA.scores[q].aw);
              diff = Math.abs((res*1) - intTable.confidantB.scores[q].av);
              cS[18][1] += (diff * intTable.confidantB.scores[q].aw);
              diff = Math.abs((res*1) - intTable.confidantC.scores[q].av);
              cS[18][2] += (diff * intTable.confidantC.scores[q].aw);
              diff = Math.abs((res*1) - intTable.confidantD.scores[q].av);
              cS[18][3] += (diff * intTable.confidantD.scores[q].aw);                  
              // firebrand
              diff = Math.abs((res*1) - intTable.firebrandA.scores[q].av);
              // Might need to be rounded down or some such to avoid float issues.
              cS[19][0] += (diff * intTable.firebrandA.scores[q].aw);
              diff = Math.abs((res*1) - intTable.firebrandB.scores[q].av);
              cS[19][1] += (diff * intTable.firebrandB.scores[q].aw);
              diff = Math.abs((res*1) - intTable.firebrandC.scores[q].av);
              cS[19][2] += (diff * intTable.firebrandC.scores[q].aw);
              diff = Math.abs((res*1) - intTable.firebrandD.scores[q].av);
              cS[19][3] += (diff * intTable.firebrandD.scores[q].aw);                  
              // administrator
              diff = Math.abs((res*1) - intTable.administratorA.scores[q].av);
              // Might need to be rounded down or some such to avoid float issues.
              cS[20][0] += (diff * intTable.administratorA.scores[q].aw);
              diff = Math.abs((res*1) - intTable.administratorB.scores[q].av);
              cS[20][1] += (diff * intTable.administratorB.scores[q].aw);
              diff = Math.abs((res*1) - intTable.administratorC.scores[q].av);
              cS[20][2] += (diff * intTable.administratorC.scores[q].aw);
              diff = Math.abs((res*1) - intTable.administratorD.scores[q].av);
              cS[20][3] += (diff * intTable.administratorD.scores[q].aw);                  
              // maestro
              diff = Math.abs((res*1) - intTable.maestroA.scores[q].av);
              // Might need to be rounded down or some such to avoid float issues.
              cS[21][0] += (diff * intTable.maestroA.scores[q].aw);
              diff = Math.abs((res*1) - intTable.maestroB.scores[q].av);
              cS[21][1] += (diff * intTable.maestroB.scores[q].aw);
              diff = Math.abs((res*1) - intTable.maestroC.scores[q].av);
              cS[21][2] += (diff * intTable.maestroC.scores[q].aw);
              diff = Math.abs((res*1) - intTable.maestroD.scores[q].av);
              cS[21][3] += (diff * intTable.maestroD.scores[q].aw);                  
              // analyst
              diff = Math.abs((res*1) - intTable.analystA.scores[q].av);
              // Might need to be rounded down or some such to avoid float issues.
              cS[22][0] += (diff * intTable.analystA.scores[q].aw);
              diff = Math.abs((res*1) - intTable.analystB.scores[q].av);
              cS[22][1] += (diff * intTable.analystB.scores[q].aw);
              diff = Math.abs((res*1) - intTable.analystC.scores[q].av);
              cS[22][2] += (diff * intTable.analystC.scores[q].aw);
              diff = Math.abs((res*1) - intTable.analystD.scores[q].av);
              cS[22][3] += (diff * intTable.analystD.scores[q].aw);                  
              // fieldMarshal
              diff = Math.abs((res*1) - intTable.fieldMarshalA.scores[q].av);
              // Might need to be rounded down or some such to avoid float issues.
              cS[23][0] += (diff * intTable.fieldMarshalA.scores[q].aw);
              diff = Math.abs((res*1) - intTable.fieldMarshalB.scores[q].av);
              cS[23][1] += (diff * intTable.fieldMarshalB.scores[q].aw);
              diff = Math.abs((res*1) - intTable.fieldMarshalC.scores[q].av);
              cS[23][2] += (diff * intTable.fieldMarshalC.scores[q].aw);
              diff = Math.abs((res*1) - intTable.fieldMarshalD.scores[q].av);
              cS[23][3] += (diff * intTable.fieldMarshalD.scores[q].aw);    
            }
          })

          cS.map((el, ind) => {
            el.map((le, ind2) => {
              if(ind2 > 0) {
                if(le < lowest.score) {
                  lowest = { score: le, subtype: subtypes[ind2] };
                }
              } else {
                lowest = { score: le, subtype: subtypes[ind2] };
              }
              // console.log(lowest, ind);        
              scoreList[ind].score = lowest.score;
              scoreList[ind].subtype = lowest.subtype;
              // console.log(scoreList[ind])
            })
          })
          scoreList.sort((a,b) => {
            return a.score - b.score;
          })
          console.log(scoreList);
          let leastScore = scoreList[scoreList.length-1].score;
          let confidence = 74;
          if(leastScore < 75) {
            confidence = 96;
          } else if(leastScore < 101) {
            confidence = 86;
          } else if(leastScore < 126) {
            confidence = 76;
          }

          let data = reference.find(el => {
            let name = el.name.toLowerCase();
            return scoreList[0].name == name;
          })
          
          let resultsId = utils.createResultsId();
          let response = {
            responseData: mappedValues,
            userEmail: emailAddress,
            result: data,
            confidence,
            date: new Date(),
            resultsId: resultsId
          }
          // db.collection('results').doc(resultsId).set(response).then(ref => {
          //   db.collection('users').doc(req.body.user.email).update({intelResultsId: resultsId, intelResultPaid: true}).then(result => {
          //     let id = utils.createPasswordResetId();
          //     let url = config.backendUrl + '/users/success/' + id + '/' + req.body.user.email;
          //     // res.send(response);
          //     res.redirect(url);
          //   }).catch(err3 => {
          //     res.send(response);            
          //   })
          //   }).catch(err => {
          //       console.log("Error: ",err);
              
          //       res.status(403).send('User not authorized')
          //     })
          db.collection('results').doc(resultsId).set(response).then(ref => {
            db.collection('users').doc(req.body.user.email).update({intelResultsId: resultsId}).then(result => {
              res.send(response);
            }).catch(err3 => {
              res.send(response);            
            })
          }).catch(err => {
            console.log("Error: ",err);          
            res.status(403).send('User not authorized')
          })
          // db.collection('results').insert(response)
          // db.collection('users').findOneAndUpdate({email: req.body.user.email}, {$set: {intelResultsId: resultsId, intelResultPaid: true}}, function(err, result) {
          //   if(err) {
          //     console.log("something went wrong");
          //     res.status(500).send(err)
          //   } else {
          //     let id = utils.createPasswordResetId();
          //     let url = config.backendUrl + '/users/success/' + id + '/' + req.body.user.email;
          //     // res.send(response);
          //     res.redirect(url);
          //   }
          // })
          //   } else {
          //     res.status(404).send('User Not Found')
          //   }
          // })
          // alterPdf(data).then(pdfRes => {
          //   console.log('res', pdfRes);
          //   if(pdfRes && pdfRes.completed && pdfRes.success) {
              
          //     // Add unique string (randomized)
          //     // console.log('res', response);
              
          //     let clientEmail = data.userEmail;
              
          //     let clientName = data.userName || 'Tester';
              
          //     let emailMessage = "Hello " + clientName + ",<p>We at Personabilities are excited to offer you your Intelligence Results Report. </p><p> Below you will find the attached pdf which contains the full report with your personalized type information, including an explanation of your unique abilities and attributes, as well as how you fit into the overall Intelligence model.</p><p>If you have any questions about the model or would like to learn more, please visit <a href='www.personabilities.com'>personabilities.com</a>.</p> <p>Thank you and enjoy your report, </p><p><img src='https://i.ibb.co/5B3nrn1/Person-Abilities.png' alt='The Personabilities Team' width='250' height='50' border='0' /></p>";
              
          //     var apiKey = defaultClient.authentications['api-key'];
          //       apiKey.apiKey = config.sendApi;
          //       // console.log('key', apiKey.apiKey);
          //       var apiInstance = new sendInBlueClient.TransactionalEmailsApi();
          //       var sendSmtpEmail = new sendInBlueClient.SendSmtpEmail();
          //       // console.log("email", clientEmail);
          //       let absUrl = config.baseUrl + "/pdfs/" + data.name + " Report.pdf";
          //       sendSmtpEmail = {
          //         sender: {
          //           name: "Personabilities",
          //           email: "no-reply@personabilities.com"
          //         },
          //         to: [{
          //           // email: clientEmail,
          //           email: 'anthony.caccavella@gmail.com',
          //           name: clientName
          //         }],
          //         htmlContent: emailMessage,
          //         subject: "Your Personabilities Results",
          //         // Get file name and use as part of url.
          //         attachment: [{url: pdfRes.url, name: 'Intelligence Report.pdf'}]
          //       };
                
          //       data.clientName = clientName;
          //       // Send Email
          //       apiInstance.sendTransacEmail(sendSmtpEmail).then(function(sendData) {
          //         console.log('API called successfully. Returned sendData: ' + sendData);            
          //       }, function(error) {
          //         console.error("emailSendError occurred", error);
          //       });
          //       res.send(response);

          //       // Update user info with whether an email with the results has been previously sent.
          //       // db.collection('users').doc(req.body.user.email).update({intelResultsSent: true}).then(result => {
          //       //   res.send({success: true, response});
          //       // })

          //     } else {
          //       console.log('nope');
          //     }
          //   })
        }
      })
        
  // theseRoutes.post('/sendResults', function(req, res) {
    
  //   if(!req.body || !req.body.user) {
  //     res.send('No body data was sent.')
  //   } else {
  //     let resultId = req.body.user.intelResultsId;
  //     // if(req.body.type == 'neuroResult') {
  //     //   resultId = req.body.user.neuroResult;
  //     // } else if(req.body.type == 'temperResult') {
  //     //   resultId = req.body.user.temperResult;
  //     // } else if(req.body.type == 'cultureResult') {
  //     //   resultId = req.body.user.cultureResult;
  //     // }

  //     db.collection('results').doc(resultId).get().then(doc => {
  //       if(doc && doc.exists) {
  //         let data = doc.data();
  //         let dataRes = data.result;
  //         // console.log('this is dataRes', dataRes);
  //         alterPdf(dataRes).then(pdfRes => {
  //           console.log('res', pdfRes);
  //           if(pdfRes && pdfRes.completed && pdfRes.success) {
  //             // Timeout to allow Google to process the storage file upload.
  //             let timeout = 10000;
  //             setTimeout(() => {
                
                
  //               let clientEmail = data.userEmail;
                
  //               let clientName = data.userName || 'Tester';
                
  //               let emailMessage = "Hello " + clientName + ",<p>We at Personabilities are excited to offer you your Intelligence Type Results Report. </p><p> Below you will find the attached pdf which contains the full report with your personalized type information, including an explanation of your unique abilities and attributes, as well as how you fit into the overall Intelligence Type Model.</p><p>If you have any questions about the model or would like to learn more, please visit <a href='www.personabilities.com'>personabilities.com</a>.</p> <p>Thank you and enjoy your report, </p><p><img src='https://i.ibb.co/5B3nrn1/Person-Abilities.png' alt='The Personabilities Team' width='250' height='50' border='0' /></p>";
                
  //               var apiKey = defaultClient.authentications['api-key'];
  //               apiKey.apiKey = config.sendApi;
  //               // console.log('key', apiKey.apiKey);
  //               var apiInstance = new sendInBlueClient.TransactionalEmailsApi();
  //               var sendSmtpEmail = new sendInBlueClient.SendSmtpEmail();
  //               // console.log("email", clientEmail);
  //               // let absUrl = config.baseUrl + "/pdfs/" + data.name + " Report.pdf";
  //               sendSmtpEmail = {
  //                 sender: {
  //                   name: "Personabilities",
  //                   email: "no-reply@personabilities.com"
  //                 },
  //                 to: [{
  //                   email: clientEmail,
  //                   name: clientName
  //                 }],
  //                 htmlContent: emailMessage,
  //                 subject: "Your Personabilities Results",
  //                 // Get file name and use as part of url.
  //                 attachment: [{url: pdfRes.url, name: 'Personabilities Report.pdf'}]
  //               };
                
  //               data.clientName = clientName;
  //               // Send Email
  //               apiInstance.sendTransacEmail(sendSmtpEmail).then(function(sendData) {
  //                 console.log('API called successfully. Returned sendData: ' + sendData);            
  //               }, function(error) {
  //                 console.error("emailSendError occurred", error);
  //               });
  //               // Update user info with whether an email with the results has been previously sent.
  //               db.collection('users').doc(req.body.user.email).update({intelResultsSent: true}).then(response => {
  //                 res.send({success: true, response: response});
  //               }).catch(err => {
  //                 console.log(err);
  //                 res.send({success: false, response: response, err: err});
  //               })                
  //               // res.send(response);
  //             }, timeout);
  //             } else {
  //               console.log('nope');
  //               res.send({success: false, error: 'Failed to generate pdf properly.', pdfRes})
  //             }
  //           }).catch(err => {
  //             console.log('Error happened');
  //             res.send({success: false, error: err})
  //           })
  //         } else {
  //           console.log('nope');
  //           res.send({success: false, error: 'ResultId may have been saved in prior testing, please verify.'})
  //         }
  //       })
  //     }
  //   })

  return theseRoutes;
}
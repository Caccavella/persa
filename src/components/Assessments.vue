<template>
  <div class="survey-container">
    <div class="loading" v-if="loading && !showMessage">Processing Assessment, please wait...</div>
    <div class="survey-header" v-if="!showMessage && !loading">
      <h1 style="text-transform: capitalize;">{{type}} Assessment</h1>
      <p>
        The Personabilities assessment contains questions that deal with your intelligence 'type', working style, and personal interests. Please answer each question as honestly and accurately as possible. On questions scored from 0-7 '0' = completely disagree and '7' = completely agree.
      </p>
      <p>
        You'll have the ability to purchase your full results after taking the assessment.
      </p>
      <span class="required">* Required</span> <el-button @click="randomize()" v-if="loggedUser && loggedUser.admin">Randomize Answers</el-button>
    </div>
    <!-- eslint-disable -->
    <div class="survey-items" v-if="!showMessage && !loading && currentQuestions && currentQuestions.length && !question.hidden" v-for="question in currentQuestions" :key="question.questionId">
      <div class="question-container" v-if="question && !question.hidden">
        <span class="survey-question">
          <span>Q{{question.questionId}}</span>&nbsp;
          <span>{{question.text}}</span>
          <span class="required" v-if="question.required">*</span>
        </span>
        <span class="survey-response">
          <div class="survey-column" v-if="question.type == 'input' || question.type == 'scale'">
            <div class="survey-input" v-if="question.type == 'input'">
              <el-input v-if="question.questionId == 'prelim2'" type="email" placeholder="Your Answer" v-model="question.response" :disabled="question.disabled"></el-input>
              <el-input v-else type="text" placeholder="Your Answer" v-model="question.response" :disabled="question.disabled"></el-input>
            </div>
            <div class="survey-scale" v-if="question.type == 'scale'" v-for="option in radioOptions" :key="option">
              <!-- <label>{{option}}</label> -->
              <el-radio v-model="question.response"  :label="option" ></el-radio>
            </div>
          </div>
          <div class="survey-row" v-if="question.type == 'vert-scale'">
            <div class="survey-vert-scale" v-if="question.type == 'vert-scale'" v-for="option in question.answerOptions" :key="option">
              <!-- <input type="radio" :key="option" :id="option" v-model="question.response" :valu/e="option"> -->
              <el-radio v-model="question.response"  :label="option" ></el-radio>
              <!-- <label :for="option">{{option}}</label> -->
            </div>
          </div>
          <div class="survey-row" v-if="question.type == 'word-select'">
            <div class="survey-vert-scale multi-select-checkboxes">
              <el-checkbox-group v-model="question.response" :min="0" :max="10">
                <el-checkbox v-for="option in question.answerOptions" :label="option" :key="option">{{option}}</el-checkbox>
              </el-checkbox-group>
            </div>
          </div>        
        </span>
      </div>
    </div>
    <div class="navigation-controls" v-if="!showMessage">
      <el-button v-if="currentSection != 1" @click="currentSection-=1">Back</el-button>
      <div v-else></div>
      <el-button v-if="currentSection < maxSection" @click="currentSection+=1">Next</el-button>
      <div v-else></div>
    </div>
    <div class="progress-float">
      <el-progress :text-inside="true" :show-text="true" :stroke-width="20" status="success" :percentage="percentage"></el-progress>
    </div>
    <el-button type="primary" class="submit-button" :disabled="allRequired" v-if="!showMessage && !loading && (currentSection == maxSection)" @click.$once="submitResponses()">Submit</el-button>
  <span class="required" v-if="allRequired && currentSection == maxSection">Question {{unanswered}} still in need of an answer.</span>
    <div class="result-container" v-if="showMessage">
      <div class="result-header">{{type[0].toUpperCase() + type.substring(1)}} Type Assessment Summary:</div>
      <div class="result-message">
        You are &nbsp; <div class="ad" v-if="vowels.includes(result[0])">an</div><div class="ad" v-else>&nbsp;a</div> &nbsp;<div class="result">{{result}}!</div>
      </div>
      <div class="result-message">
        <span v-html="resultText"></span>
      </div>
      <!-- <div class="return-container" v-if="type == 'intelligence'">
        <el-input v-model="email" placeholder="Email"></el-input>
        <el-input v-model="password" type="password" placeholder="Password"></el-input>
        <el-button type="primary" @click="viewReport()">Create User & View Full Result</el-button>
      </div> -->
      <div class="return-container">
        <el-button type="warning" @click="navTo('/dashboard')">Return to Dashboard</el-button>
      </div>
    </div>
    <el-backtop></el-backtop>
  </div>
</template>

<script>
import axios from 'axios';
import config from '../../config';
import intelligence from '../assessments/intelligence';
import temperament from '../assessments/temperament';
import culture from '../assessments/culture';
import neuro from '../assessments/neuro';
import {EventService} from '../main'
import { loadStripe } from '@stripe/stripe-js';
const stripePromise = loadStripe(config.stripePub);

export default {
  name: 'Assessments',
  props: [],
  data() {
    return {
      radioOptions: [0,1,2,3,4,5,6,7],
      survey: {},
      id: '',
      showMessage: false,
      result: '',
      resultText: '',
      resultPercentage: '',
      resultShared: '',
      vowels: ["a", "e", "i", "o", "u", "A", "E", "I", "O", "U"],
      unanswered: '',
      completed: false,
      loading: false,
      flagFree: false,
      currentSection: 1,
      maxSection: 999,
    }
  },
  computed: {
    allRequired() {
      let vm = this;
      if(vm.survey && vm.survey.questions) {
        return vm.survey.questions.some(el => {
          if((el.required && el.response === '') || (el.type == 'word-select' && el.required && !el.response.length)) {
            if(vm.type == 'intelligence') {
              vm.unanswered = el.questionId-1;
            } else {
              vm.unanswered = el.questionId;
            }
            return true
          }
          return false;
        })
      } else {
        return false
      }
    },
    loggedUser() {
      return this.$store.state.loggedUser;
    },
    currentQuestions() {
      let vm = this;
      return vm.survey.questions.filter(el => el.sectionId == vm.currentSection);
    },
    percentage() {
      let vm = this;
      let totals = vm.survey.questions.filter(el => el.response !== "" && el.required);
      console.log(totals.length, vm.survey.questions.filter(le => le.required).length, (totals.length/vm.survey.questions.filter(le => le.required).length)*100);
      return ((totals.length/vm.survey.questions.filter(le => le.required).length)*100).toFixed(0)*1;
    },
    // validatedEmail() {
    //   let vm = this;
    //   var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    //   // console.log('',re.test(vm.survey.questions[1].response));
    //   return re.test(vm.survey.questions[1].response);
    // }
  },
  created() {
    this.scrollTop();
    this.type = this.$route.params.type;
    if(this.type == 'intelligence') {
      // console.log(this.type, intelligence);
      this.survey = intelligence;
    } else if(this.type == 'culture') {
      this.survey = culture;
    } else if(this.type == 'temperament') {
      this.survey = temperament;
    } else if(this.type == 'neuro') {
      this.survey = neuro;
    }  
    this.maxSection = this.survey?.questions?.[this.survey?.questions?.length-1]?.sectionId;
    console.log(this.survey, this.maxSection);
    // console.log('651354534', this.user);
    // this.checkForPrevious();
    // this.scrambleAnswers();
  },
  methods: {
    scrollTop() {
      window.scrollTo(0, 0);
    },
    scrambleAnswers() {
      let vm = this;
      vm.survey.questions.map(el => {
        if(Number.isInteger(el.questionId)) {
          el.response = Math.floor(Math.Random() * 7);
        }
      })
    },
    navTo(route) {
      this.$router.push(route);
    },
    checkForPrevious() {
      let vm = this;
      let url = config.backendUrl + "/users/userEmail";
      if(vm.loggedUser) {
        let searchEmail = vm.loggedUser.email;
        axios.post(url, {user: searchEmail}).then(response => {
          if(response.data.result.intelResultsId) {            
            console.log("Yep", response);
            let newUrl = '/dashboard'
            if(response.data.result.intelResultPaid) {
              newUrl = "/success/intelligence/" + response.data.result.intelResultsId;
            }
            this.$router.push(newUrl);
          } else {
            if(response.data.result.freeIntel) {
              vm.flagFree = true;
            }
            console.log("None", response);
          }
        })
      }
    },
    submitResponses() {
      let vm = this;
      vm.loading = true;
      if(!vm.completed) {
        vm.completed = true;
        // console.log(vm.survey.questions[0]);
        // console.log(vm.user);        
        let url = config.baseUrl;
        if(vm.type == 'intelligence') url = url += "/algorithm/parseIntel";
        else if(vm.type == 'culture') url = url += "/algorithm/parseCulture";
        else if(vm.type == 'temperament') url = url += "/algorithm/parseTemperament";
        else if(vm.type == 'neuro') url = url += "/algorithm/parseNeuro";
        axios.post(url, {questions: vm.survey, user: vm.loggedUser}).then(response => {
          console.log(response.data);
          if(response && response.data) {
            console.log('res', response);            
            let result = response.data.result;
            vm.result = result.name;
            vm.resultShared = result.shared;
            let resultText = result.text.replace("[FIRST NAME]", '');
            resultText = resultText.split('. ');
            resultText[9] += '.<br><br>';
            if(resultText[20]) resultText[20] += '.<br><br>';
            vm.resultText = resultText.join('. ').replace(/<br><br>\./g, '<br><br>');
            // vm.resultImage = result.image;
            vm.resultPercentage = result.percent*1;
            vm.showMessage = true;
            vm.loading = false;
            vm.$store.commit('updateNewResultFlag', true);
          } else {
            console.log("an Error has occurred.");
            vm.loading = false;
          }
        })
      }
    },
    viewReport() {
      let url = 'https://www.personabilities.com/result/' + this.result.toLowerCase();
      window.location = url;    
    },
    randomize() {
      let vm = this;
      let maximum = 68;
      if(this.type == 'temperament') {
        maximum = 62;
      } else if(this.type == 'neuro') {
        maximum = 76;
      } else if(this.type == 'culture') {
        maximum = 84;
      }
      for (let index = 0; index < maximum; index++) {        
        vm.survey.questions[index].response = Math.floor(Math.random() * 7)
      }
    },
    async checkout() {
      let vm = this;
      if(!vm.flagFree) {
        var stripe = await stripePromise;
        let url = config.backendUrl + '/checkout/create-checkout';
        let loggedUser = {email: 'test'};
        let checkoutData = {
          purchases: ['Intelligence']
        }
        if(vm.loggedUser) {
          checkoutData.email = vm.loggedUser.email || loggedUser.email;
        } 
        console.log(checkoutData);
        const response = await fetch(url, { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(checkoutData)});
        const session = await response.json();
        // When the customer clicks on the button, redirect them to Checkout.
        const result = await stripe.redirectToCheckout({
          sessionId: session.id,
        });
        if (result.error) {
          // If `redirectToCheckout` fails due to a browser or network
          // error, display the localized error message to your customer
          // using `result.error.message`.
        }
      } else {
        let randomizer = ['A', 'C', 'G', 'I', 'K', 'H', 'J', 'L', 'Z', 'X', '1', '3', '5', '7', '9'];
        let sessionId = '';        
        for (let index = 0; index < 9; index++) {
          sessionId += randomizer[Math.floor(Math.random() * randomizer.length)];
        }
        this.$router.push('/success/intelligence/' + sessionId);
      }
    }
  }
}
</script>

<style scoped>

.survey-container {
  margin-top: 79px;
  display: flex;
  font-size: 18px;
  flex-direction: column;
  align-items: center;
  position: relative;
  width: 100vw;
  /* background-color: rgba(60, 171, 147, 0.267); */
  background-color: rgb(232, 238, 249);
}

.survey-header {
  width: 50%;
  max-width: 500px;
  margin-bottom: 20px;
}

.survey-items {
  width: 500px;
  border: 1px solid lightgrey;
  box-shadow: 0px 1px 2px rgba(255, 255, 255, .3);
  background: white;
  border-radius: 15px;
  padding: 20px 30px;
  margin: 10px;
}

.required {
  color: red;
  margin-left: 3px;
}

.survey-response {
  display: flex;
  flex-direction: row;
  position: relative;
}
.survey-column {
  display: flex;
  flex-direction: row;
  position: relative;
  width: 100%;
}
.survey-row {
  display: flex;
  flex-direction: column;
  position: relative;
}

.survey-input {
  margin-top: 10px;
  width: 100%;
  position: relative;
}

.survey-input input {
  border: none;
  border-bottom: 1px solid lightgrey;
  /* width: 150%; */
  background: transparent;
  position: static;
}

.survey-input input:focus {
  border: none;
  border-bottom: 2px solid teal;
  width: 150%;
  margin-bottom: -1px;
  outline: none;
}


.survey-scale {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  width: 100%;
  margin-top: 10px;
}

.survey-vert-scale {
  display: flex;
  flex-direction: row;
  width: 100%;
  margin-top: 10px;
}
.multi-select-checkboxes {
  margin-left: 40px;
}

.survey-vert-scale input{
  margin: 3px;
}

.survey-scale label {
  transform: translateX(15%);
}
.survey-scale:last-child label {
  transform: translateX(8%);
}

.submit-button {
  margin-bottom: 20px;
  margin-top: 10px;
  font-size: 19px;
}

.result-container {
  min-height: 80.5vh;
  width: 80%;
  margin-top: 120px;
  display: flex;
  flex-direction: column;
}

.result-header {
  font-weight: 700;
  font-size: 25px;
  margin-bottom: 10px;  
}

.result-message {
  display: flex;
  flex-direction: row;
  margin-top: 10px;
  margin-bottom: 10px;
}

.result-text-header {
  margin-top: 10px;
  margin-bottom: 20px;
  font-size: 22px;
}

.result {
  font-weight: 600;
  margin-left: 5px;
  margin-right: 5px;
}

.email-message {
  margin-top: 30px;
  text-align: center;
  font-size: 25px;
}


.ad {
  margin-left: 5px;
}

a {
  border-bottom: 1px solid blue;
  cursor: pointer;
}

.el-checkbox-group .el-checkbox {
  min-width: 120px;
}

.return-container {
  width: 100%;
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

.navigation-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 10px;
  margin-bottom: 100px;
  width: 25%;
}

.progress-float {
  position: sticky;
  transform: translateY(-50px);
  bottom: 0;
  left: 0;
  width: 200px;
}

.el-progress-bar__outer {
  background-color: blue;
}

@media(max-width: 820px) {
  .survey-container {
    position: relative;
    padding: 10px;
    width: calc(100vw - 20px)
  }
  .survey-header {
    width: calc(100% - 30px);
    margin: 10px;
  }
  .survey-header h1 {
    font-size: 20px;
  }
  .survey-header p {
    font-size: 16px;
  }
  .survey-items {
    width: calc(100% - 20px);
    padding: 10px;
    margin: 10px 0px;
  }
  .required {
    font-size: 16px;
  }
  .result-container {
    margin-top: 20px;
  }
}

</style>

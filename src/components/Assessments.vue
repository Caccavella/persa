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
      <span class="required">* Required</span>
    </div>
    <!-- eslint-disable -->
    <div class="survey-items" v-if="!showMessage && !loading && survey.questions && survey.questions.length " v-for="question in survey.questions" :key="question.questionId">
      <div class="question-container" v-if="question && !question.hidden">
        <span class="survey-question">
          <span v-if="typeof question.questionId == 'number' && type == 'intelligence'">Q{{question.questionId-1}}</span>&nbsp;
          <span v-if="typeof question.questionId == 'number' && (type == 'culture' || type == 'temperament' || type == 'neuro')">Q{{question.questionId}}</span>&nbsp;
          <span>{{question.text}}</span>
          <span class="required" v-if="question.required">*</span>
        </span>
        <span class="survey-response">
          <div class="survey-column" v-if="question.type == 'input' || question.type == 'scale'">
            <div class="survey-input" v-if="question.type == 'input'">
              <input v-if="question.questionId == 'prelim2'" type="email" placeholder="Your Answer" v-model="question.response" :disabled="question.disabled">
              <input v-else type="text" placeholder="Your Answer" v-model="question.response" :disabled="question.disabled">
            </div>
            <div class="survey-scale" v-if="question.type == 'scale'" v-for="option in radioOptions" :key="option">
              <label>{{option}}</label>
              <input type="radio" :key="option" :id="option" v-model="question.response"  :value="option" >
            </div>
          </div>
          <div class="survey-row" v-if="question.type == 'vert-scale'">
            <div class="survey-vert-scale" v-if="question.type == 'vert-scale'" v-for="option in question.answerOptions" :key="option">
              <input type="radio" :key="option" :id="option" v-model="question.response" :value="option">
              <label :for="option">{{option}}</label>
            </div>
          </div>
          <div class="survey-row" v-if="question.type == 'word-select'">
            <div class="survey-vert-scale" v-for="option in question.answerOptions" :key="option">
              <input type="checkbox" v-model="question.response" name="word" :key="option" :id="option" :value="option" :disabled="question.response.length >= 10 && !question.response.includes(option)">
              <label :for="option">{{option}}</label>
            </div>
          </div>        
        </span>
      </div>
    </div>
    <button class="submit-button" :disabled="allRequired" v-if="!showMessage && !loading" @click.$once="submitResponses()">Submit</button>
  <span class="required" v-if="allRequired">Question {{unanswered}} still in need of an answer.</span>
  <!-- <span class="required" v-if="!validatedEmail">Please enter a valid email address where required.</span> -->
    <div class="result-container" v-if="showMessage && type == 'intelligence'">
      <div class="result-header">Official Personabilities Assessment Summary:</div>
      <!-- <div>Type: {{result}}</div> -->
      <div class="result-message">
        You are &nbsp; <div class="ad" v-if="vowels.includes(result[0])">an</div><div class="ad" v-else>&nbsp;a</div> &nbsp;<div class="result">{{result}}!</div> <span v-if="resultPercentage*1 < 10">Only a small percentage of the world shares your Intelligence Type. </span><span v-if="resultPercentage*1 >= 10">Roughly {{resultPercentage}}% of the world shares your Intelligence Type. </span>
      </div>
      <div class="result-message">
        <span >{{resultShared}}</span>
      </div>
      <div class="result-text-segment">Your test results will outline the intricacies and depth of your personality and can be found in the full report. <a @click="checkout()">Click here</a> to dig deep into your own personality and purchase your full report.</div>
      <br>
      <br>
      <div class="result-blurb" v-html="resultText"></div>
      <div class="" style="margin-top: 25px;">
        Our nine-page report will go into detail about these strengths and others. <a @click="checkout()"> Click here</a> to purchase your detailed report so you can realize your full potential.
        <!-- <p> -->
          Included in the Standard Report are your:
          <br>
          <br>
        <!-- </p> -->
        <!-- <ul>
          <li> -->
            Personabilities Skills 
          <br>
          <!-- </li>
          <li>             -->
            Representative Fields of Study
          <br>
          <!-- </li>
          <li>             -->
            In-depth Discussion of Potential Careers & Professional Choices
          <br>
          <!-- </li>
          <li>             -->
            Personal Strengths & Weaknesses
          <br>
          <!-- </li>
          <li> -->
            Intelligence Tribe, Role, and Mode 
          <br>
          <!-- </li> -->
        <!-- </ul> -->
        <p>
          Hungry for more? Pass on your next impulse buy on Amazon and get your personalized, detailed report today for just $15 instead!
        </p>

        <span style="display: flex; width: 100%; justify-content: center;">Want more info about your result? Purchase your full report <a style="margin-left: 5px;" @click="checkout()"> here</a>
        </span>
        </div>

      <!-- <div class="generic-message">Learn More</div> -->
      
      <!-- <div class="result-text-header">Intelligence Model</div>
      <div class="generic-message">
        You are one of 24 different Types that are divided into four groups called Tribes. Each of the Types within your Tribe have similar abilities. Within your Tribe, you also have a Role that describes your particular skill set and what you do best within a team or group dynamic. Only a small percentage of people share your Type. We want you to find out more about your Intelligence Type so you can realize your full potential. Knowing more about your Intelligence Type will change your course of study, professional career, and life path. You will know what jobs are best suited for you. We strongly encourage you to take advantage of the information in this assessment so that you will Know Your Road to Find Your Home.
      </div>
      <div class="email-message">
        You will receive an email shortly with your full results and more information about what your type means to you.
      </div> -->
    </div>
    <div class="result-container" v-if="showMessage && (type == 'culture' || type == 'temperament' || type == 'neuro')">
      <div class="result-header">Official Personabilities Assessment Summary:</div>
      <div class="result-message">
        You are &nbsp; <div class="ad" v-if="vowels.includes(result[0])">an</div><div class="ad" v-else>&nbsp;a</div> &nbsp;<div class="result">{{result}}!</div>
      </div>
      <div class="result-message">
        <span >{{resultText}}</span>
      </div>
    </div>
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
      firstName: '',
      vowels: ["a", "e", "i", "o", "u", "A", "E", "I", "O", "U"],
      unanswered: '',
      completed: false,
      loading: false,
      flagFree: false
    }
  },
  computed: {
    allRequired() {
      let vm = this;
      if(vm.survey && vm.survey.questions) {
        return vm.survey.questions.some(el => {
          if(el.required && el.response === '') {
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
    }
    // validatedEmail() {
    //   let vm = this;
    //   var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    //   // console.log('',re.test(vm.survey.questions[1].response));
    //   return re.test(vm.survey.questions[1].response);
    // }
  },
  created() {
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
    try {
      this.user = JSON.parse(localStorage.getItem('user'));
    } catch(err) {
      console.log(err);
    }
    if(this.loggedUser && this.survey && this.survey.questions && this.type == 'intelligence') {
      this.survey.questions[0].response = this.user.name;
      this.survey.questions[1].response = this.loggedUser.email;
    } else {
      console.log("No user");
    }
    // console.log('651354534', this.user);
    // this.checkForPrevious();
    // this.scrambleAnswers();
  },
  methods: {
    scrambleAnswers() {
      let vm = this;
      vm.survey.questions.map(el => {
        if(Number.isInteger(el.questionId)) {
          el.response = Math.floor(Math.Random() * 7);
        }
      })
    },
    checkForPrevious() {
      let vm = this;
      let url = config.backendUrl + "/users/userEmail";
      if(vm.user) {
        let searchEmail = vm.user.email;
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
        let firstName = vm.survey.questions[0].response;
        vm.firstName = firstName;
        if(vm.user) {
          firstName = vm.user.firstName;
          vm.firstName = firstName;
        } else {
          vm.user = {
            email: vm.survey.questions[1].response,
            firstName: vm.survey.questions[0].response
          }
        }
        let url = config.baseUrl;
        if(vm.type == 'intelligence') url = url += "/algorithm/parseIntel";
        else if(vm.type == 'culture') url = url += "/algorithm/parseCulture";
        else if(vm.type == 'temperament') url = url += "/algorithm/parseTemperament";
        else if(vm.type == 'neuro') url = url += "/algorithm/parseNeuro";
        axios.post(url, {questions: vm.survey, user: vm.user, name: firstName, level: vm.level}).then(response => {
          console.log(response.data);
          if(response && response.data) {
            console.log('res', response);            
            let result = response.data.result;
            vm.result = result.name;
            vm.resultShared = result.shared;
            vm.resultText = result.text.replace("[FIRST NAME]", firstName);
            // vm.resultImage = result.image;
            vm.resultPercentage = result.percent*1;
            vm.showMessage = true;
            vm.loading = false;
          } else {
            console.log("an Error has occurred.");
            vm.loading = false;
          }
        })
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
  position: relative;
}

.survey-input input {
  border: none;
  border-bottom: 1px solid lightgrey;
  width: 150%;
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
  margin-top: 10px;
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
  margin: 5px 20px;
  padding: 10px 30px;
  color: white;
  background: #3CAB93;
  border: none;
  border-radius: 15px;
  cursor: pointer;
  margin-bottom: 30px;
  font-size: 19px;
}

.result-container {
  height: 90.5vh;
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

@media(max-width: 820px) {
  .survey-container {
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
}

</style>

<template>
  <div class="modal-shade" @click="closeModal()">
    <div class='result-detail-container' @click.stop>
      <div class="close-button" @click="closeModal()">&#10005;</div>
      <div class="results-header">
        <h1>{{resultInfo.name}}</h1>
        <h3>{{resultInfo.result}}</h3>
      </div>
      <div class="results-body">
        <p>
          {{resultData.shared}}          
        </p>
        <p>
          {{resultData.text}}
        </p>
      </div>
      <div class="success" v-if="successMessage != ''">
        {{successMessage}}
      </div>
      <div class="purchase-report-container">
        <!-- <button v-if="!currentUser.intelResultPaid" @click="checkout()">Purchase Report</button> -->
        <button v-if="currentUser.intelResultPaid" @click="viewReport()">View Report</button>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import {EventService} from '../main'
import config from '../../config';
// axios.defaults.baseURL = '//localhost:5000/'
import { loadStripe } from '@stripe/stripe-js';
const stripePromise = loadStripe(config.stripePub);

export default {
  name: 'resultDetail',
  props: ["selectedResult"],
  data() {
    return {
      resultInfo: {},
      resultData: {},
      successMessage: ""
    }
  },
  created() {
    if(this.selectedResult) {
      this.resultInfo = this.selectedResult;
      this.resultData = this.resultInfo.data.results.result;
    }     
  },
  computed: {
    currentUser() {
      return this.$store.state.loggedUser;
    }
  },
  methods: {
    closeModal() {
      // console.log('shjould emit');
      EventService.$emit('closeModal', 'test');
    },
    async checkout() {
      let vm = this;
      if(!vm.flagFree) {
        var stripe = await stripePromise;
        let url = config.backendUrl + '/checkout/create-checkout'
        let currentUser = {email: 'test'};
        let checkoutData = {
          purchases: ['Intelligence']
        }
        if(vm.currentUser) {
          checkoutData.email = vm.currentUser.email || currentUser.email;
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
    },
    viewReport() {
      this.$router.push('/report/' + this.resultInfo.result);
    },
    resendResults() {
      let vm = this;
      vm.successMessage = 'Processing assessment result and preparing report...'
      if(vm.currentUser && vm.currentUser.intelResultPaid) {
        let url = config.backendUrl + '/algorithm/sendResults';
        axios.post(url, {user: vm.currentUser}).then(response => {
          if(response && response.data.success) {
            vm.successMessage = 'Your report has been sent, please check your inbox.'
          } else {
            vm.successMessage = 'Your report could not be sent at this time, please wait a few minutes and try again.'
          }
        })
      }
    }
  }
}
</script>

<style scoped>

.modal-shade {
  position: absolute;
  background: rgba(0,0,0,.55);
  display:  flex;
  align-content: center;
  justify-content: center;
  height: 100vh;
  width: 100vw;
}

.result-detail-container {
  height: 500px;
  width: 600px;
  padding: 20px;
  margin-top: 100px;
  background: white;
  position: relative;
}

.close-button {
  position: absolute;
  top: 10px;
  right: 20px;
  cursor: pointer;
}

h1 {
  text-transform: capitalize;
}

.purchase-report-container {
  display: flex;
  justify-content: center;
}

.purchase-report-container button {
  margin-top: 20px;
  background: white;
  border: 2px solid teal;
  border-radius: 6px;
  color: teal;
  padding: 7px 15px;
  font-weight: 600;
  cursor: pointer;
}

.purchase-report-container button:hover {
  background: rgb(235, 235, 235);
}

.success {
  display: flex;
  justify-content: center;
  font-size: 18px;
}

</style>
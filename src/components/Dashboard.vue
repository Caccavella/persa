<template>
  <div class='dashboard-container'>
    <div class="chart-container" v-if="currentUser.role && currentUser.role == 'Manager' && view == 'company'">
      <company></company>
    </div>
     <div v-else class="dashboard-assessment-breakdown" v-for="assessment in assessmentsList" :key="assessment.resultsId">
       <div class="report-column">
         <div class="report-name">
           {{assessment.name}}
         </div>
         <div class="report-logo" >
           <img :src="require('../assets/general/' + assessment.logo)" alt="logo">
         </div>
         <div class="result-container">
           <span>Your Result:</span>
           <span v-if="assessment.result">{{assessment.result}}</span>
           <span v-else>Not Taken</span>
         </div>
         <div class="result-summary">
           <span v-if="assessment.result">
             {{assessment.resultBlurb}}
            </span>
            <span v-else>
              We'll give you more information when you complete this assessment!
            </span>
         </div>
         <div class="purchase-footer">
          <span class="purchase-report" v-if="assessment.available && assessment.result" @click="openDetailModal(assessment.name)">
            Click Here to 
            <span>See more.</span>
          </span>
          <span class="purchase-report" v-if="assessment.available && !assessment.result" @click="navTo(assessment.destination)">
            Click Here to 
            <span>Take Assessment</span>
          </span>
          <span class="purchase-report" v-if="!assessment.available">
            <span>Coming Soon!</span>
          </span>
         </div>
       </div>
     </div>
     <result-detail v-if="detailModalActive" :selectedResult="selectedResult"></result-detail>
  </div>
</template>

<script>
import axios from 'axios';
axios.defaults.baseURL = '//localhost:5000/'
import config from '../../config'
import ResultDetail from './ResultDetail.vue';
import Company from './Company.vue';
import {EventService} from '../main'

export default {
  components: { ResultDetail, Company },
  name: 'Dashboard',
  data() {
    return {
      assessmentsList: {
        intelligence: {
          resultsId: '1',
          name: 'intelligence',
          logo: 'IA.png',
          result: '',
          resultBlurb: '',
          available: true,
          destination: '/assessments/intelligence'
        },
        culture: {
          resultsId: '2',
          name: 'culture',
          logo: 'CA.png',
          result: '',
          resultBlurb: '',
          available: true,
          destination: '/assessments/culture'
        },
        temperament: {
          resultsId: '3',
          name: 'temperament',
          logo: 'TA.png',
          result: '',
          resultBlurb: '',
          available: true,
          destination: '/assessments/temperament'
        },
        neuro: {
          resultsId: '4',
          name: 'neuro',
          logo: 'NA.png',
          result: '',
          resultBlurb: '',
          available: true,
          destination: '/assessments/neuro'
        },
      },
      detailModalActive: false,
      selectedResult: {},
      view: 'company'
    }
  },
  computed: {
    currentUser() {
      // console.log('dashuser', this.$store.state.loggedUser);
      return this.$store.state.loggedUser;
    }
  },
  created() {
    this.getResult();
    EventService.$on('newUser', this.getResult);
    EventService.$on('closeModal', this.closeDetailModal);
  },
  methods: {
    getLogo(location) {
      let locationString = "../assets/" + location;
      return locationString;
    },
    getResult() {
      let vm = this;
      let url = config.backendUrl + '/users/userResults';
      if(vm.currentUser.name && vm.currentUser.intelResultsId) {
        axios.post(url, {resultsId: vm.currentUser.intelResultsId}).then(response => {
          if(response.data && response.data.results) {
            vm.assessmentsList.intelligence.resultsId = response.data.results.resultsId;
            vm.assessmentsList.intelligence.result = response.data.results.result.name;
            vm.assessmentsList.intelligence.resultBlurb = this.getBlurb(response.data.results.result.text,'.', 2);
            vm.assessmentsList.intelligence.data = response.data;
          }
        })
      } else {
        console.log('Reached, but not registering.');
      }
      
      if(vm.currentUser.name && vm.currentUser.cultureResultsId) {
        axios.post(url, {resultsId: vm.currentUser.cultureResultsId}).then(response => {
          if(response.data && response.data.results) {
            vm.assessmentsList.culture.resultsId = response.data.results.resultsId;
            vm.assessmentsList.culture.result = response.data.results.result.name;
            vm.assessmentsList.culture.resultBlurb = this.getBlurb(response.data.results.result.text,'.', 2);
            vm.assessmentsList.culture.data = response.data;
          }
        })
      } else {
        console.log('Reached, but not registering.');
      }
    },
    getBlurb(val, pattern, position) {
      var i = -1;
      while(position-- && i++ < val.length) {
        i = val.indexOf(pattern, i);
        if(i < 0) break;
      }
      let string = val.substring(0, i+1);
      return string;
    },
    navTo(location) {
      this.$router.push(location);
    },
    openDetailModal(assessment) {
      this.detailModalActive = true;
      this.selectedResult = this.assessmentsList[assessment];
    },
    closeDetailModal() {
      this.detailModalActive = false;
      // console.log('Should close', this.detailModalActive);
      this.selectedResult = {};
    }
  }
}
</script>
<style scoped>

.dashboard-container {
  margin-top: 79px;
  display: flex;
  flex-direction: row;
  justify-content: center;
  background: teal;
}

.dashboard-assessment-breakdown {
  display: flex;
  flex-direction: row;
}

.report-column {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  border: 3px solid grey;
  max-width: 300px;
  min-height: 80vh;
  background: white;
  margin-top: 10px;
  margin-bottom: 10px;
  font-size: 18px;
}

.report-column div {
  min-height: 120px;
}

.report-name {
  text-transform: capitalize;
  margin: 20px 0;
  font-size: 30px;
}

.report-logo img {
  max-width: 80px;
  margin-bottom: 30px;
}

.result-container {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.result-container span {
  margin: 10px;
}

.result-summary {
  margin-bottom: 30px;
  max-width: 75%;
  min-height: 145px !important;
}

.purchase-footer {
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
}

.purchase-report {
  margin-bottom: 20px;
  width: 100px;
  font-size: 16px;
  text-align: center;
  border: 3px solid teal;
  border-radius: 10px;
  padding: 10px 20px;
  cursor: pointer;
}

@media (max-width: 600px) {
  .dashboard-container {
    display: flex;
    flex-direction: column;
  }
  .dashboard-assessment-breakdown {
    width: 100vw;
  }
  .report-column {
    width: 100vw;
    max-width: 100vw;
  }
}

</style>
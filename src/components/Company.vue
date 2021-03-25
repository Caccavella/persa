<template>
  <div class="card-container">
    <md-card>
      <md-card-header>
        <div class="md-title">Recent Assessments Completed</div>
      </md-card-header>
    </md-card>
    <div class="card">
      <div class="title">Recent Assessments Completed</div>
      <div class="data-table">
        <span>Assessment</span>
        <span>User Name</span>
        <span>Result Name</span>
        <span>User Id</span>
        <span>Result Id</span>
      </div>
      <div class="data-table" v-for="user in companyData.recentUsers" :key="user.userId">
        <span>{{user.resultType}}</span>
        <span>{{user.userName}}</span>
        <span>{{user.resultName}}</span>
        <span>{{user.userId}}</span>
        <span>{{user.resultId}}</span>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios'
import config from '../../config';

export default ({
  name: "Company",
  data() {
    return {
      companyData: {
        recentUsers: [
          {
            userId: 'U2304925705',
            userName: 'Anthony Caccavella',
            resultId: 'RU1209415',
            resultName: 'Adventurer',
            resultType: 'Intelligence'
          },
          {
            userId: 'U2304925703',
            userName: 'Anthony Caccavella',
            resultId: 'RU1209415',
            resultName: 'Adventurer',
            resultType: 'Intelligence'
          },
          {
            userId: 'U2304925701',
            userName: 'Anthony Caccavella',
            resultId: 'RU1209415',
            resultName: 'Adventurer',
            resultType: 'Intelligence'
          },
        ],
        moreData: ''
      }
    }
  },
  computed:{
    currentUser() {
      return this.$store.state.loggedUser;
    }
  },
  created() {
    this.getCompanyOverviewData();
  },
  methods: {
    getCompanyOverviewData() {
      let vm = this;
      let url = config.backendUrl + '/companyDataOverview' + vm.currentUser.companyId;
      axios.get(url).then(response => {
        if(response) {
          vm.companyData = response;
        }
      }).catch(err => {
        console.log("Something went wrong", err);
      })
    }
  }
})
</script>

<style scoped>

.card-container {
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-content: flex-start;
  align-items: flex-start;
  width: 100%;
  min-height: 82.6vh;
}

.card {
  background: whitesmoke;
  padding: 10px;
  margin: 10px;
  border-radius: 5px;
  box-shadow: 0px 4px 8px rgba(0, 0, 0, .25);
}
.card .title {
  font-size: 20px;
  font-weight: 500;
  text-align: center;
  margin-bottom: 10px;
}

.data-table {
  display: flex;
  flex-direction: row;
  border-bottom: 1px solid rgba(128, 128, 128, .5);
}

.data-table span {
  margin: 5px;
  min-width: 120px;
}


</style>
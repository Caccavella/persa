<template>
  <div class="card-container">
    <el-card width="500" class="top-card">
      <div slot="header">Recent Assessments Completed</div>
      <el-table :data="companyData.recentUsers" stripe>
        <el-table-column prop="resultType" label="Assessment" width="100"></el-table-column>
        <el-table-column prop="userName" label="User Name" width="180"></el-table-column>
        <el-table-column prop="resultName" label="Result Name" width="120"></el-table-column>
        <el-table-column prop="userId" label="User Id" width="120"></el-table-column>
        <el-table-column prop="resultId" label="Result Id" width="120"></el-table-column>
        <div class="empty" slot="empty">
          <p>No users have taken a recent assessment.</p>
          <p><el-button @click="navTo('/inviteUsers')">Invite User to Assessment</el-button></p>
        </div>
      </el-table>
    </el-card>   
    <el-card class="top-card">

    </el-card> 
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
    // this.getCompanyOverviewData();
  },
  methods: {
    getCompanyOverviewData() {
      let vm = this;
      let url = config.backendUrl + '/companyDataOverview/' + vm.currentUser.companyId;
      axios.get(url).then(response => {
        if(response) {
          vm.companyData = response;
        }
      }).catch(err => {
        console.log("Something went wrong", err);
      })
    },
    navTo(route) {
      this.$router.push(route);
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

.top-card {
  margin: 20px;
}


</style>
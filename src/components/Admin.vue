<template>
  <div class="admin-container">
    <el-card class="admin-card">
      <h3>Download User Responses</h3>
      <el-input v-model="userEmail" placeholder="User Email" label="User Email"></el-input>
      <el-select v-model="type">
        <el-option v-for="option in typeOptions" :key="option.value"
        :label="option.label" :value="option.value">
        </el-option>
      </el-select>
      <span v-if="message.length">{{message}}</span>
      <el-button @click="searchResponseAndDownload()">Download</el-button>
    </el-card>
  </div>
</template>

<script>
import axios from 'axios'
import config from '../../config'

export default {
  name: 'Admin',
  data() {
    return {
      userEmail: 'ace4257@aol.com',
      type: 'intelligence',
      typeOptions: [
        {label: 'Intelligence', value: 'intelligence'},
        {label: 'Temperament', value: 'temperament'},
        {label: 'Culture', value: 'culture'},
        {label: 'Neuro', value: 'neuro'}
      ],
      message: ''
    }
  },
  computed: {
    currentUser() {
      return this.$store.state.loggedUser;
    }
  },
  created() {
    setTimeout(() => {
      this.checkForAdmin();
    }, 10000);
  },
  methods: {
    checkForAdmin() {
      if(!this.currentUser.admin) this.$route.push('/dashboard')
    },
    searchResponseAndDownload() {
      let vm = this;
      let url = config.baseUrl + '/users/getUserResponse'
      axios.post(url, {email: vm.userEmail, type: vm.type}).then(response => {
        let res = response.data;
        if(res.success) {
          // console.log(res);
          if(res.csv) {
            var MIME_TYPE = 'text/csv';
            var blob = new Blob([res.csv], {type: MIME_TYPE});
            var csvURL = window.URL.createObjectURL(blob);
            var tempLink = document.createElement('a');
            document.body.append(tempLink);
            tempLink.href = csvURL;
            tempLink.setAttribute('download', 'UserResponse.csv');
            tempLink.click();
            document.body.removeChild(tempLink);
          } else {
            vm.message = "CSV was not created successfully."
          }
        } else {
          vm.message = res.message;
          console.log(res);
        }
      })
    }
  }
}
</script>

<style scoped>

.admin-container {
  height: 80.5vh;
  margin-top: 100px;
}

.admin-card{
  width: 50%;
}

</style>
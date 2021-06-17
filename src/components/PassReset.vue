<template>
  <div class="password-reset-container">
    <el-card class="password-box" status-icon header="Reset Password" v-if="!message">
      <span>
        <el-form :model="ruleForm" :rules="rules" ref="ruleForm">
          <el-form-item label="Enter Password" prop="password">
            <el-input type="password" v-model="ruleForm.password"></el-input>
          </el-form-item>
          <el-form-item label="Confirm Password" prop="confirmPassword">
            <el-input type="password" v-model="ruleForm.confirmPassword"></el-input>
          </el-form-item>
        </el-form>
      </span>
      <span class="button-container">
        <el-button type="primary" @click.once="resetPassword()">Set New Password</el-button>
        <el-button style="margin-left:0px;" type="warning" @click.once="navTo('/login')">Back to Login</el-button>
      </span>
    </el-card>
    <div class="response-message">
      {{message}}
    </div>
  </div>
</template>

<script>
import axios from 'axios'
import config from '../../config'

export default {
  name: 'PasswordReset',  
  data() {
    var validateMatch = (rule, value, callback) => {
      if (value === '') {
        callback(new Error('Please enter the password again'));
      } else if (value !== this.ruleForm.password) {
        callback(new Error('Passwords do not match.'));
      } else {
        callback();
      }
    };
    return {
      ruleForm: {
        password: '',
        confirmPassword: '',
      },
      message: '',
      rules: {
        password: [
          {required: true, message: "Please input new password."}
        ],
        confirmPassword: [
          {validator: validateMatch, trigger: 'blur'}
        ]
      }
    }
  },
  mounted() {
    // this.checkToken();
    console.log('This is a test');
  },
  methods: {
    navTo(route){
      this.$router.push(route)
    },
    resetPassword() {
      let vm = this;
      let token = vm.$route.params.token;
      console.log("initialized");
      this.$refs['ruleForm'].validate((valid) => {
        if(valid) {
          let url = config.backendUrl + "/users/verifyNewPassword";
          axios.post(url, {token: token, password: vm.ruleForm.password}).then(response => {
            if(response.success) {
              vm.message = response.message;
              vm.$router.push('/login')
            } else {
              vm.message = response.message;
            }
          })          
        } else {
          return false;
        }
      })
    }
  }
}
</script>

<style scoped>

.password-reset-container {
  margin-top: 8vh;
  min-height: calc(100vh - 168px);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background: rgba(0, 128, 128, .75);
}

.password-box {
  min-height: 300px;
  width: 300px;
  display: flex;
  flex-direction: column;
  padding: 0px 30px;
  background: white;
}

.confirm-button {
  padding: 12px 10px;
  font-size: 16px;
  font-weight: 600;
  border: none;
  background: #01a2a2;
  color: white;
  cursor: pointer;
  border-radius: 5px;
}

.button-container {
  display: flex;
  flex-direction: column;
}

.button-container button {
  margin-bottom: 10px;
}

</style>

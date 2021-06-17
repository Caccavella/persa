<template>
  <header>
    <div class="header-int">
      <div class="logo-display">
        <span style="cursor:pointer;" @click="navExt('')"><img src="../assets/general/logomark.jpg" alt=""></span>
      </div>
      <div class="menu-display">
        <span v-if="(!GoogleAuth || (GoogleAuth && !GoogleAuth.isSignedIn.le)) && !signedIn" @click="logIn()">Log In</span>
        <span v-else @click="logOut()">Log Out</span>
        <span v-if="loggedUser && loggedUser.email" @click="navTo('/dashboard')">Dashboard</span>
        <div class="spoofing" v-if="loggedUser">
          <el-button v-if="loggedUser && loggedUser.admin" type="primary" @click="navTo('/admin')">Admin</el-button>
          <input type="text" v-if="loggedUser && loggedUser.admin" v-model="spoofer" v-on:keydown.enter="spoofUser()">
          <button v-if="loggedUser.admin && spoofer" @click="spoofUser">Spoof</button>
          <button v-if="spoofing" @click="stopSpoofing()">Stop Spoofing</button>
        </div>
      </div>
      <div class="menu" v-if="menuOpen">
        <span v-if="(!GoogleAuth || (GoogleAuth && !GoogleAuth.isSignedIn.le)) && !signedIn" @click="logIn()">Log In</span>
        <span v-else @click="logOut()">Log Out</span>
        <span @click="navTo('/dashboard')">Dashboard</span>
      </div>
    </div>
  </header>
</template>

<script>
import {EventService} from '../main'
import axios from 'axios'
import config from '../../config';
var gapi;

export default {
  name: 'Navbar',
  data() {
    return {
      showModal: false,
      GoogleAuth: null,
      profile: null,
      nonTerm: true,
      reroute: false,
      menuOpen: false,
      loginStep: 1,
      currentUser: {
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        confirmPassword: ''
      },
      params: {},      
      errorMessage: '',
      forgotPassword: false,
      passwordReset: false,
      assessmentsOpen: false,
      passwordMessage: '',
      gapi: false,
      spoofing: false,
      spoofer: "",
    }
  },
  computed: {
    checkRoute() {
      this.$route.path;
      // console.log('path', this.$route.name);
      return this.$route.name;
    },
    loggedUser() {
      return this.$store.state.loggedUser;
    },
    signedIn() {
      return this.$store.state.signedIn;
    },
    priorUser() {
      return this.$store.state.priorUser;
    }
  },
  mounted() {
    EventService.$on('login', this.checkLoggedIn)
  },
  methods: {
    checkLoggedIn() {
      this.menuOpen = false;
      if(this.loggedUser || this.signedIn) {
        this.navTo('/assessments/intelligence');
      } else {
        this.reroute = true;
        this.logIn();
      }
    },
    spoofUser() {
      let vm = this;
      if(vm.loggedUser.email == 'ace4257@aol.com') {
        let url = config.baseUrl + '/users/findUser'
        // vm.priorUser = vm.loggedUser;
        this.$store.commit('updatePriorUser', vm.loggedUser);
        axios.post(url, {email: vm.spoofer}).then(response => {
          console.log('res', response);
          vm.spoofing = true;
          // vm.loggedUser = response.user;
          this.$store.commit('updateLoggedUser', response.data.user);
          EventService.$emit('newUser')
        })
      }
    },
    stopSpoofing() {
      let vm = this;
      vm.spoofing = false;
      this.$store.commit('updateLoggedUser', vm.priorUser);
      EventService.$emit('newUser')
      // vm.loggedUser = vm.priorUser;
    },
    getUser() {
      let vm = this;
      let signedUser = JSON.parse(localStorage.getItem('user'));
      if(signedUser && signedUser.email && vm.checkRoute != 'Success') {
        vm.currentUser = signedUser;
        vm.signedIn = true;
        vm.$store.commit('updateSignInStatus', true);
        vm.$store.commit('updateLoggedUser', signedUser);
        EventService.$emit('newUser')
        vm.$router.push('/dashboard')
      } else if(vm.checkRoute != 'Success') {
        vm.$router.push('/login')
      } else {
        vm.currentUser = signedUser;
        vm.signedIn = true;
        vm.$store.commit('updateSignInStatus', true);
        vm.$store.commit('updateLoggedUser', signedUser);
        EventService.$emit('newUser')
      }
    },
    clickRef() {
      let test = this.$refs.googleClick;
      test.click();
    },
    signUp() {
      let vm = this;
      if(vm.currentUser && vm.currentUser.firstName && vm.currentUser.lastName && vm.currentUser.email && vm.currentUser.password && vm.currentUser.confirmPassword && (vm.currentUser.password == vm.currentUser.confirmPassword)) {
        // Axios call to backend.
        
      let url = config.baseUrl + '/users/saveUser'
      axios.post(url, vm.currentUser).then(response => {
        let res = response.data
        if(res.success) {
          vm.closeModal();
        } else {
          console.log(res);
          vm.errorMessage = res.message;
        }
      })
      } else if(vm.currentUser && vm.currentUser.firstName && vm.currentUser.lastName && vm.currentUser.email && vm.currentUser.password && vm.currentUser.confirmPassword && (vm.currentUser.password != vm.currentUser.confirmPassword)) {
        vm.errorMessage = 'Passwords must match';
      } else {
        vm.errorMessage = 'All data must be entered';
      }
    },
    logInEmPass() {
      // Axios call to backend.
      let vm = this;
      if(vm.currentUser && vm.currentUser.email && vm.currentUser.password) {
        let url = config.baseUrl + '/users/signIn'
        axios.post(url, {user: vm.currentUser}).then(response => {
          console.log(response);
          if(response.data.success) {
            console.log('yep');
            let nonpass = vm.currentUser.password;
            vm.currentUser = response.data.user;
            vm.currentUser.password = nonpass
            vm.signedIn = true;
            localStorage.setItem('user', JSON.stringify(response.data.user));
            vm.closeModal();
          } else {
            vm.errorMessage = response.data.message;
          }
        })
      } else if(vm.currentUser && vm.currentUser.email && !vm.currentUser.password) {
        vm.errorMessage = 'Please enter a password'
      } else if(vm.currentUser && !vm.currentUser.email && vm.currentUser.password) {
        vm.errorMessage = 'Please enter an email'
      } else {
        vm.errorMessage = 'Enter data to continue'
      }
    },
    closeModal() {
      this.showModal = false;
      this.loginStep = 1,
      this.errorMessage = '';
      this.forgotPassword = false;
      this.menuOpen = false;
    },
    toggleMenu() {
      this.menuOpen = !this.menuOpen;      
    },
    init() {
      let vm = this;
      if(gapi) {
        gapi.load('auth2', function() {
          gapi.auth2.init({client_id: process.env.clientId}).then(instance => {
            vm.GoogleAuth = instance;
          })
        });
      }
    },
    logIn() {
      this.$router.push('/login');
    },
    logOut() {
      this.menuOpen = false;
      let vm = this;
      if(gapi) {
        var auth2 = gapi.auth2.getAuthInstance();
        auth2.signOut().then(() => {
          console.log('User signed out');
          vm.profile = null;
        })
      }
      this.$store.commit('updateSignInStatus', false);
      this.$store.commit('updateLoggedUser', {});
      let url = config.baseUrl + '/users/logout';
      axios.post(url).then(response => response)
      localStorage.removeItem('user');
      vm.$router.push('/login')    
    },
    testApp() {
      let url = config.backendUrl + "/users/modify";
        axios.post(url).then(response => {
          console.log(response);
          
        }).catch(err => {
          console.log(err);
          
        })
    },
    onSignIn(googleUser) {
      
      let vm = this;
      vm.profile = googleUser.getBasicProfile();
      console.log("reached", vm.profile);
      let newProfile = {
        email: vm.profile.getEmail(),
        name: vm.profile.getName(),
        firstName: vm.profile.getGivenName(),
      }
      vm.currentUser = newProfile;
      // console.log("reached2", newProfile);
      axios.post(config.baseUrl + '/users/userEmail', {userEmail: newProfile.email}).then(user => {
        if(user.data.user) {
          console.log(user.data.user);
          vm.currentUser = user.data.user;          
          vm.$store.commit('updateLoggedUser', user.data.user);
          localStorage.setItem('user', JSON.stringify(user.data.user))
          vm.showModal = false;
        } else {
          localStorage.setItem('user', JSON.stringify(vm.currentUser));
          vm.signedIn = true;
          if(vm.profile) {
            let url = config.baseUrl + "/users/saveUser";
            axios.post(url, newProfile).then(() => {
              // console.log(response);
              
            }).catch(err => {
              console.log(err);
              
            })
          vm.showModal = false;
          }          
        }
      })
      if(vm.reroute) {
        vm.reroute = false;
        vm.navTo('/assessments/intelligence');
      }
      
      // console.log('ID: ' + profile.getId()); // Do not send to your backend! Use an ID token instead.
      // console.log('Name: ' + profile.getName());
      // console.log('Image URL: ' + profile.getImageUrl());
      // console.log('Email: ' + profile.getEmail()); // This is null if the 'email' scope is not present.
    },
    checkEmail(address) {
      let approved = ['erasmo@personabilities.com', 'anthony.caccavella@gmail.com']
      if(approved.includes(address)) {
        return true;
      } else {
        return false;
      }
    },
    navTo(route) {
      this.showModal = false;
      this.menuOpen = false;
      this.$router.push(route)
    },
    navExt(route) {
      let url = 'https://www.personabilities.com/' + route;
      window.location = url;
    },
  }
}

</script>

<style scoped>
  header {
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    /* height: 90px; */
    position: fixed;
    top: 0;
    z-index: 99999;
    background: #dddddd;
    /* box-shadow: 0px 2px 4px rgba(1,1,1, .25); */
  }
    .logo-display {
    display: flex;
    flex-direction: column;
    margin: 10px 30px;  
  }

  .logo-display img {
    width: 50px;
    transform: translate(12px, 4px);
    transition-timing-function: ease-in-out;
    transition: .2s;
  }

  .logo-display img:hover {
    opacity: .65;
    transition-timing-function: ease-in-out;
    transition: .2s;
  }

  .header-int {
    color: #222222;
    font-family: sans-serif;
    font-weight: 100;
    font-size: 16px;
    line-height: 28px;
    width: 100%;
    margin-left: 10%;
    margin-right: 10%;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .dropdown-menu {
    position: absolute;
    top: 59px;
    left: 65px;
    display: flex;
    flex-direction: column;
    background: #dddddd;
    padding: 0;
    min-width: 160px;
  }

  .dropdown-menu span {
    border-top: 1px solid #bbbbbb;
    padding: 3px 20px;
    transition: .2s;
    transition-timing-function: ease-in-out;
    margin: 0 !important;
  }

  .dropdown-menu span:hover {
    background: #bbbbbb;
    transition: .2s;
    transition-timing-function: ease-in-out;
  }

  .test-button {
    padding: 8px 20px;
    color: white;
    background: #3cab93;
    border-radius: 7px;
    transition: .2s;
    transition-timing-function: ease-in-out;
  }

  .test-button:hover {
    transform: scale(.95);
    transition: .2s;
    transition-timing-function: ease-in-out;
  }

  .menu-display {
    display: flex;
    justify-content: space-around;
    align-items: center;
    transform: translateY(2px);
  }

  .menu-display span {
    cursor: pointer;
    margin: 0px 20px;
    min-width: 80px;
  }

  @media (max-width: 500px) {
    .menu-display {
      margin-left: 0;
      min-width: 0px;
    }
    .spoofing {
      display: none;
    }
  }

</style>
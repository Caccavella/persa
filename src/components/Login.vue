<template>
  <div class="home-view">
    <div class="modal-shader">
      <div class="modal-body" v-if="!signedIn && loginStep != 2">
        <h4 v-if="!forgotPassword" >Sign In</h4>
        <h4 v-if="forgotPassword" >Reset Password</h4>
        <div class="signin">
          <div class="notice" v-if="forgotPassword && !passwordReset">We'll send an email to this address for you to reset your password.</div>
          <div class="notice" v-if="forgotPassword && passwordReset">{{passwordMessage}}</div>
          <span class="input-field" v-if="!passwordReset">
            <div class="input-icon"></div>
            <input type="email" placeholder="email" v-model="currentUser.email">
          </span>
          <span class="input-field" v-if="!forgotPassword">
            <div class="input-icon"></div>
            <input type="password" placeholder="password" @keydown.enter="logInEmPass()" v-model="currentUser.password">
          </span>
          <div class="error-container" v-if="errorMessage">{{errorMessage}}</div>
          <div class="button-container">
            <button class="login-button" @click="loginStep = 2" v-if="!forgotPassword" >Sign Up</button>
            <button class="login-button" v-if="!forgotPassword" @click="logInEmPass()">Log In</button>
            <span class="forgot-link return" v-if="forgotPassword && !passwordReset" @click="forgotPassword = false">Cancel</span>
            <button class="login-button" v-if="forgotPassword && !passwordReset" @click="resetPassword()">Send Password Reset</button>
            <button class="login-button" v-if="forgotPassword && passwordReset" @click="passwordReset = false">Return To Login</button>
          </div>
          <div class="social-login-container">
            <i class="social-login">
              <span class="social-separator">- or -</span>
              <!-- <GoogleLogin :params="params" :onSuccess="onSignIn" ><img src="../assets/general/google-logo.svg">Sign in with Google</GoogleLogin>  -->
            </i>
          </div>
        </div>
        <div class="forgot-link" v-if="!forgotPassword" @click="forgotPassword = true">Forgot Your Password?</div>
        <div class="signin-footer" v-if="!forgotPassword" >
          By logging in you agree to the <router-link to="/terms" target="_blank">Terms of Service</router-link> and <router-link to="/privacy" target="_blank">Privacy Policy</router-link>
        </div>
      </div>
      <div class="modal-body taller" @click.stop v-if="loginStep === 2">        
        <h4>Register Here</h4>
        <!-- <div class="social-login-container">
          <i class="social-login" @click="clickRef()">G</i>
        </div> -->
        <div class="signin">
          <span class="input-field">
            <div class="input-icon"></div>
            <input type="text" placeholder="firstname" v-model="currentUser.firstName">
          </span>
          <span class="input-field">
            <div class="input-icon"></div>
            <input type="text" placeholder="lastname" v-model="currentUser.lastName">
          </span>
          <span class="input-field">
            <div class="input-icon"></div>
            <input type="email" placeholder="email" v-model="currentUser.email">
          </span>
          <span class="input-field">
            <div class="input-icon"></div>
            <input type="password" placeholder="password" v-model="currentUser.password">
          </span>
          <span class="input-field">
            <div class="input-icon"></div>
            <input type="password" placeholder="confirm password" v-model="currentUser.confirmPassword">
          </span>
          <div class="error-container" v-if="errorMessage">{{errorMessage}}</div>
          <div class="button-container">
            <!-- <button class="login-button">Sign Up</button> -->
            <span class="forgot-link return" @click="loginStep = 1">Log In</span>
            <button class="login-button" @click="signUp()">Submit</button>
          </div>
        </div>       
        <!-- <div ref="googleClick" style="display: none;" id="google-signin-button"></div> -->
        <div class="signin-footer">
          By signing up you agree to the <a href="https://www.personabilities.com/terms-of-use" target="_blank">Terms of Service</a> and <a href="https://www.personabilities.com/privacy-policy" target="_blank">Privacy Policy</a>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios'
import config from '../../config';
import {EventService} from '../main'
import { loadStripe } from '@stripe/stripe-js';
// import GoogleLogin from 'vue-google-login';
const stripePromise = loadStripe(config.stripePub);

export default {
  name: 'Login',
  // components: {GoogleLogin},
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
      passwordMessage: ''
    }
  },
  mounted() {
    if(this.signedIn) this.$router.push('/dashboard')
    this.params = {client_id: config.clientId}
    window.addEventListener("google-loaded", this.init);
    // if(gapi) {
    //   gapi.signin2.render('google-signin-button', {
    //     onsuccess: this.$onSignIn
    //   })
    // }
    // EventService.$on('login', this.checkLoggedIn)
  },
  computed: {
    checkRoute() {
      this.$route.path;
      return this.$route.name;
    },
    signedIn() {
      return this.$store.state.signedIn;
    }
  },
  methods: {
    setCookie() {
      document.cookie = "session=NewTest";
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
        console.log(config.baseUrl);
        let url = config.baseUrl + '/users/signIn'
        axios.post(url, {user: vm.currentUser}).then(response => {
          console.log(response);
          if(response.data.success) {
            console.log('yep');
            let nonpass = vm.currentUser.password;
            vm.currentUser = response.data.user;
            vm.currentUser.password = nonpass
            vm.$store.commit('updateSignInStatus', true);
            vm.$store.commit('updateLoggedUser', response.data.user);
            EventService.$emit('newUser')
            localStorage.setItem('user', JSON.stringify(response.data.user));
            vm.checkLoggedIn();
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
      // let vm = this;
      // if(gapi) {
      //   gapi.load('auth2', function() {
      //     gapi.auth2.init({client_id: process.env.clientId}).then(instance => {
      //       vm.GoogleAuth = instance;
      //     })
      //   });
      // }
    },
    logIn() {
      this.showModal = true;
    },
    logOut() {
      this.menuOpen = false;
      let vm = this;
      // if(gapi) {
      //   var auth2 = gapi.auth2.getAuthInstance();
      //   auth2.signOut().then(()=> {
      //     console.log('User signed out');
      //     vm.profile = null;
      //   })
      // }
      if(vm.signedIn) {
        this.$store.commit('updateSignInStatus', false);
        this.$store.commit('updateLoggedUser', {});
        localStorage.removeItem('user');
      }
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
        if(user.data.result) {
          console.log('logUser', user.data.result);
          vm.currentUser = user.data.result;
          localStorage.setItem('user', JSON.stringify(user.data.result))
          this.$store.commit('updateSignInStatus', true);
          this.$store.commit('updateLoggedUser', user.data.result);
          if(vm.reroute) {
            vm.reroute = false;
            vm.navTo('/intelligence/free');
          } else {
            vm.navTo('/dashboard')
          }
        } else {
          localStorage.setItem('user', JSON.stringify(vm.currentUser));
          this.$store.commit('updateSignInStatus', true);
          this.$store.commit('updateLoggedUser', vm.currentUser);
          this.checkLoggedIn()
          if(vm.profile) {
            let url = config.baseUrl + "/users/saveUser";
            axios.post(url, newProfile).then(() => {
              // console.log(response);
              if(vm.reroute) {
                vm.reroute = false;
                vm.navTo('/intelligence/free');
              } else {
                vm.navTo('/dashboard')
              }
              
            }).catch(err => {
              console.log(err);
            })
          vm.showModal = false;
          }          
        }
      })
    },
    onFailure() {
      console.log("Failed");      
    },
    checkLoggedIn() {
      this.menuOpen = false;
      if(this.profile || this.signedIn) {
        this.navTo('/dashboard');
      } else {
        this.reroute = true;
        this.logIn();
      }
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
    resetPassword() {
      let vm = this;
      let url = config.baseUrl + '/users/resetPassword'
      axios.post(url, {user: vm.currentUser}).then(response => {
        if(response.success) {
          vm.passwordReset = true;
          vm.passwordMessage = 'An email has been sent to the entered email address to reset your password.'
          setTimeout(() => {
            vm.passwordReset = false;
            vm.passwordMessage = '';
          }, 5000);
        }
        vm.$router.push('/login')
      })
    },
    async checkout() {
      let vm = this;
      var stripe = await stripePromise;
      let url = config.backendUrl + '/checkout/create-checkout'
      // let currentUser = {email: 'anthony.caccavella@gmail.com'};
      let checkoutData = {
        purchases: ['Intelligence']
      }
      if(vm.currentUser && vm.currentUser.email) {
        checkoutData.email = vm.currentUser.email;
      } else {
        checkoutData.email = 'anthony.caccavella@gmail.com'
      }
      console.log(url);
      const response = await fetch(url, { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(checkoutData)});
      const session = await response.json();
      console.log('seshId', session);
      // When the customer clicks on the button, redirect them to Checkout.
      const result = await stripe.redirectToCheckout({
        sessionId: session.id,
      });
      if (result.error) {
        // If `redirectToCheckout` fails due to a browser or network
        // error, display the localized error message to your customer
        // using `result.error.message`.
      }
    }
  }
}
</script>

<style scoped>

  @font-face {
    font-family: 'Lin';
    src: url('../../public/LinBiolinum_R.otf');
  }

  body {
    margin: 0;
  }

  #Index {
    font-family:'Lin', 'Gill Sans MT', Calibri, 'Trebuchet MS', sans-serif;
    /* width: 100vw;
    height: 100vh; */
    /* margin: 0;
    padding: 0; */
  }

  #google-signin-button {
    margin-bottom: 10px;
    z-index: 999;
  }

  .hamburger-display {
    display: none;
    flex-direction: column;
    margin-right: 40px;
    cursor: pointer;
  }

  .hamburger-display span {
    width: 25px;
    height: 2px;
    background: black;
    margin-top: 10px;
  }

  .modal-shader {
    position: sticky;
    top: 0;    
    background: rgba(0, 128, 128, .75);
    background-size: cover;
    background-repeat: no-repeat;
    display: flex;
    z-index: 90;
    height: 100vh;
    width: 100%;
  }

  .modal-shader::after {
    position: sticky;
    top: 0;
    z-index: 95;
    height: 100vh;
    width: 100%;
    background: rgba(1,1,1, .25)
  }

  .modal-body {
    z-index: 91;
    width: 400px;
    min-height: 350px;
    position: relative;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-content: center;
    align-items: center;
    background: rgba(1,1,1, .55);
    border-radius: 2px;
    color: white;
    margin: auto;
  }

  .taller {
    min-height: 400px;
  }

  .modal-body h4 {
    position: absolute;
    top: -20px;
    left: 20px;
    font-size: 28px;
  }

  .notice {
    margin-bottom: 10px;
  }

  .error-container {
    text-align: center;
    color: red;
    font-weight: 600;
  }

  .signin {
    display: flex;
    flex-direction: column;
    width: calc(90% + 5px);
  }
  .input-field {
    margin-bottom: 10px;
    display: flex;
  }

  .input-field .input-icon {
    background-color: #FFC312;
    height: 32px;    
    transform: translateX(1px);
    width: 40px;
    border-top-left-radius: 3px;
    border-bottom-left-radius: 3px;
  }

  .input-field input::placeholder {
    transform: translateX(10px);
  }

  .input-field input {
    width: 90%;
    height: 28px;
    border: none;
    border-bottom: 2px solid transparent;
    outline: none;
    border-top-right-radius: 3px;
    border-bottom-right-radius: 3px;
  }
  .input-field input:focus {
    border-bottom: 2px solid lightblue;
  }

  .social-login-container {
    display: flex;
    width: 100%;
    justify-content: center;
    text-align: center;
  }

  .social-separator {
    padding-bottom: 10px;
  }

  .social-login {
    width: 100%; 
  }

  #google-signin-btn-0 {
    border: none;
  }

  .signin .button-container {
    width: 100%;
    display: flex;
    justify-content: space-between;
    margin-top: 20px;
  }

  .signin button {
    height: 33px;
    background: #FFC312;
    border: none;
    cursor: pointer;
    min-width: 100px;
    border-radius: 4px;
    font-size: 17px;
  }


  .social-login img {
    height: 30px;
  }

  .social-login button {
    background: white;
    border: none;
    cursor: pointer;
    width: 100%;
    border-radius: 4px;
    font-size: 13px;
    height: unset;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
  }

  .forgot-link {
    color: steelblue;
    cursor: pointer;
    margin-top: 20px;
  }
  .return  {
    margin-top: 5px;
    margin-left: 5px;
  }

  .signin-footer {
    position: absolute;
    bottom: 0;
    margin: 20px;
    text-align: center;
  }
  .signin-footer a {
    color: steelblue;
  }

  header {
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
    height: 90px;
    position: fixed;
    top: 0;
    z-index: 99999;
    /* border-bottom: 1px solid lightgrey; */
    box-shadow: 0px 2px 4px rgba(1,1,1, .25);
  }

  .background-white {
    background: white;
  }

  .shifted-right {
    margin-left: 40px;
  }

  #logo1 {
    color: #591C03;
  }

  #logo2 {
    color: #18E2AD;
  }

  .menu-display {
    margin: 20px 40px;
    display: flex;
    justify-content: space-around;
    width: 45%;
  }

  .menu-display span {
    cursor: pointer;
  }

  .social-media {
    padding: 10px;
    margin-right: 20px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .social-media img {
    height: 25px;
    margin: 10px;
    float: right;
  }

  .menu {
    position: absolute;
    display: flex;
    flex-direction: column;
    margin-top: 122px;
    right: 0;
    background: white;
    border: 1px solid lightgrey;
    border-radius: 9px;
    padding: 10px;
  }
  .menu span {
    margin: 5px;
  }

  .abcRioButton {
    display: none;
  }

  #checkout {
    border: none;
    cursor: pointer;
    background: transparent;
  }

  #checkout img {
    margin-right: 10px;
  }


  @media(max-width: 1800px) {

    .product-title {
      margin-left: 1vw;
    }

  }

  @media(max-width: 1500px) {

    .menu-display {
      width: 55%;
    }

  }

  @media(max-width: 1080px) {
    .product-description {
      font-size: 13px;
    }
    .product-blurb {
      font-size: 12px;
    }
    .menu-display {
      display: none;
    }
    .hamburger-display {
      display: flex;    
    }
  }

  @media(max-width: 820px) {

    #Index {
      width: 100%;
      font-size: 15px;
    }

    header {
      max-width: 100%;
    }

    .logo-display {
      width: 200px;
    }
    .logo-display img {
      width: 200px;
    }

    .modal-body {
      width: 100%;
    }

    .social-media {
      padding: 0px;
      margin: 0px;
    }
    .social-media img {
      margin: 5px;
    }

    .media-images {
      margin-right: 10px;
    }
    
    .copyright {
      text-align: center;
      width: 250px;
      margin-right: 30px;
    }
  }

</style>

<template class="app">
  <div>
    <navbar></navbar>
    <router-view />
    <AppFooter></AppFooter>
  </div>
</template>

<script>
import Navbar from './components/Navbar.vue';
import AppFooter from './components/Footer.vue';
import { EventService } from './main';
export default {
  name: 'App',
  components: {Navbar, AppFooter},
  created() {
    this.getUser();
  },
  computed: {
    checkRoute() {
      console.log(this.$route.path);
      return this.$route.path;
    }
  },
  methods: {
    getUser() {
      let vm = this;
      let signedUser = JSON.parse(localStorage.getItem('user'));
      if(signedUser && signedUser.email && !vm.checkRoute.includes('reset')) {
        console.log('hitting here');
        vm.currentUser = signedUser;
        vm.signedIn = true;
        vm.$store.commit('updateSignInStatus', true);
        vm.$store.commit('updateLoggedUser', signedUser);
        EventService.$emit('newUser')
        vm.$router.push('/dashboard')
      } else if(!vm.checkRoute.includes('reset') && !vm.checkRoute.includes('login') ) {
        console.log('Redirecting when I dont want it');
        vm.$router.push('/login')
      } else {

      }
    },
  }
}
</script>

<style>
body {
  margin: 0;
  font-family: Lin,Gill Sans MT,Calibri,Trebuchet MS,sans-serif;
}
</style>
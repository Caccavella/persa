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
  methods: {
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
  }
}
</script>

<style>
body {
  margin: 0;
  font-family: Lin,Gill Sans MT,Calibri,Trebuchet MS,sans-serif;
}
</style>
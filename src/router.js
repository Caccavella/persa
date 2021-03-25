import Vue from 'vue'
import Router from 'vue-router'

import Login from './components/Login'
import Assessments from './components/Assessments'
// import Results from './components/Results'
// import Admin from './components/Admin'
// import Success from './components/Success'
// import PassReset from './components/PassReset'
import Dashboard from './components/Dashboard'

Vue.use(Router);

export default new Router({ 
  routes: [    
    // {
    //   path: '/success/:type/:id?',
    //   name: 'Success',
    //   component: Success
    // },
    {
      path: '/assessments/:type',
      name: 'Assessments',
      component: Assessments
    },
    // {
    //   path: '/admin',
    //   name: 'Admin',
    //   component: Admin
    // },
    // {
    //   path: '/reset/:token',
    //   name: 'Reset',
    //   component: PassReset
    // },
    // {
    //   path: '/results/:resultsId',
    //   name: 'Results',
    //   component: Results
    // },
    {
      path: '/dashboard',
      name: 'Dashboard',
      component: Dashboard
    },
    {
      path: '/login',
      name: 'Login',
      component: Login,
    },
    {
      path: '/',
      redirect: '/login'
    },
    {
      path: '/*',
      redirect: '/login'
    }
  ]
})
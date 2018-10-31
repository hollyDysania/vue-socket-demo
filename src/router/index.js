import Vue from 'vue'
import Router from 'vue-router'
import SocketDemo from '@/components/socket-demo'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'SocketDemo',
      component: SocketDemo
    }
  ]
})

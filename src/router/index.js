import Vue from 'vue'
import VueRouter from 'vue-router'
import Login from '../components/Login.vue'
import '../assets/css/global.css'
import Home from '../components/Home.vue'
import Welcome from '../components/Welcome'
import Users from '../components/user/Users.vue'
import Router from 'vue-router';   //为了解决重复点击router-link报错
import Rights from '../components/power/Rights.vue'
import Roles from '../components/power/Roles.vue'
import Order from '../components/order/order.vue'
import Cate from '../components/goods/Cate.vue'
import Params from '../components/goods/Params.vue'
import GoodList from '../components/goods/List.vue'
import Add from '../components/goods/add.vue'
import Report from '../components/report/Report.vue'

// 为了解决重复点击报错
const originalPush = Router.prototype.push
Router.prototype.push = function push(location) {
  return originalPush.call(this, location).catch(err => err)
}

Vue.use(VueRouter)


var router= new VueRouter({
  routes:[
    {path:'/',redirect:'/login'},
    {path:'/login',component:Login},
    {path:'/home',component:Home,redirect:'/welcome',
     children:[
      {path:'/welcome',component:Welcome},
      {path:'/users',component:Users},
      {path:'/rights',component:Rights},
      {path:'/roles',component:Roles},
      {path:'/orders',component:Order},
      {path:'/categories',component:Cate},
      {path:'/params',component:Params},
      {path:'/goods',component:GoodList},
      {path:'/goods/add',component:Add},
      {path:'/orders',component:Order},
      {path:'/reports',component:Report}
    ]}
  ]
})

// 导航守卫前置
router.beforeEach((to,from,next)=>{
  if(to.path==='/login') return next();
  var tokenstring=window.sessionStorage.getItem("token");
  if(!tokenstring) return next('/login');
  return next()
})

export default router
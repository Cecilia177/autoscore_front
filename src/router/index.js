import Vue from 'vue'
import VueRouter from 'vue-router'
import Login from '../components/Login'
import Home from '../components/Home'
import Welcome from '../components/Welcome'
import Exams from '../components/exam/Exams'
import Questions from '../components/exam/Questions'
import Students from '../components/student/Students'
import Answers from '../components/student/Answers'

Vue.use(VueRouter)

const routes = [
  { path: '/', redirect: '/login' },
  { path: '/login', component: Login },
  { path: '/home',
    component: Home,
    redirect: '/welcome',
    children: [
      { path: '/welcome', component: Welcome }, { path: '/exams', component: Exams }, { path: '/questions', component: Questions },
      { path: '/students', component: Students }, { path: '/answers', component: Answers }
    ] }
]

const router = new VueRouter({
  routes
})

// 挂载路由导航守卫
router.beforeEach((to, from, next) => {
  // to 将要访问的路径，from 从哪个路径跳转而来
  // next 函数，next()放行，next('/login')强制跳转
  if (to.path === '/login') return next()
  const tokenStr = window.sessionStorage.getItem('token')
  if (!tokenStr) return next('/login')
  next()
})

export default router

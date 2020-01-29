<template>
  <el-container class="home-container">
<!--    t头部-->
    <el-header>
      <div>
        <span>AutoScoring</span>
      </div>
      <el-button type="info" @click="logout">退出</el-button>
    </el-header>
    <el-container>
<!--      侧边栏-->
      <el-aside width="200px">
        <el-menu background-color="#2b4b6b" text-color="#fff" active-text-color="#ffd04b" :router="true" :default-active="$route.path">
<!--          考试管理模块-->
          <el-submenu index="1">
<!--            一级菜单模板-->
            <template slot="title">
              <i class="el-icon-location"></i>
              <span>考试管理</span>
            </template>
<!--            二级菜单-->
            <el-menu-item index="/exams">
              <template slot="title">
                <i class="el-icon-location"></i>
                <span>考试设置</span>
              </template>
            </el-menu-item>
            <el-menu-item index="/questions">
              <template slot="title">
                <i class="el-icon-location"></i>
                <span>试题设置</span>
              </template>
            </el-menu-item>
          </el-submenu>
          <!--        学生管理模块           -->
          <el-submenu index="2">
            <!--            一级菜单模板-->
            <template slot="title">
              <i class="el-icon-location"></i>
              <span>学生管理</span>
            </template>
            <!--            二级菜单-->
            <el-menu-item index="/students">
              <template slot="title">
                <i class="el-icon-location"></i>
                <span>学生名单导入</span>
              </template>
            </el-menu-item>
            <el-menu-item index="/answers">
              <template slot="title">
                <i class="el-icon-location"></i>
                <span>学生试卷导入</span>
              </template>
            </el-menu-item>
          </el-submenu>
          <!--        成绩管理模块           -->
          <el-submenu index="3">
            <!--            一级菜单模板-->
            <template slot="title">
              <i class="el-icon-location"></i>
              <span>成绩管理</span>
            </template>
            <!--            二级菜单-->
            <el-menu-item :index="'/exam' + exam.id" v-for="exam in examlist" :key="exam.id">
              <template slot="title">
                <i class="el-icon-location"></i>
                <span>{{exam.exam_name}}</span>
              </template>
            </el-menu-item>
          </el-submenu>
        </el-menu>
      </el-aside>
<!--      右侧内容主体-->
      <el-main>
<!--        路由占位符-->
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
export default {
  name: `Home`,
  created () {
    this.getExamList()
  },
  data() {
    return {
      // 考试列表数据
      examlist: []
    }
  },
  methods: {
    logout() {
      window.sessionStorage.clear()
      this.$router.push('/login')
    },
    // 获取所有考试列表
    async getExamList() {
      const res = await this.$http.get('exams')
      this.examlist = res.data
      console.log(this.examlist)
    }
  }
}
</script>

<style lang="less" scoped>
  .home-container {
    height: 100%;
  }
  .el-header {
    background-color: #333744 ;
    display: flex;
    justify-content: space-between;
    align-items: center;
    color: #ffffff;
    font-size: 25px;
    > div {
      display: flex;
      align-items: center;
    }
  }
  .el-aside {
    background-color: #2b4b6b;
    .el-menu {
      border-right: none;
    }
  }
  .el-main {
    background-color: #eeeeee;
  }
</style>

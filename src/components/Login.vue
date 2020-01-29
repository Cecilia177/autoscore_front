<template>
    <div class="login_container">
      <div class="login_box">
<!--        头像-->
        <div class="avatar_box">
          <img src="../assets/avatar.jpg">
        </div>
<!--        登录表单-->
        <el-form ref="loginFormRef" :model="loginForm" :rules="loginFormRules" label-width="0px" class="login_form">
<!--          用户名-->
          <el-form-item prop="username">
            <el-input v-model="loginForm.username" prefix-icon="el-icon-user-solid"></el-input>
          </el-form-item>
<!--        密码-->
          <el-form-item>
            <el-input v-model="loginForm.password" prefix-icon="el-icon-lock" type="password"></el-input>
          </el-form-item>
<!--        按钮-->
          <el-form-item class="btns">
            <el-button type="primary" @click="login">登录</el-button>
            <el-button type="info" @click="resetLoginForm">重置</el-button>
          </el-form-item>
        </el-form>
      </div>
    </div>
</template>

<script>
export default {
  name: 'Login',
  data () {
    return {
      // 登录表单数据对象
      loginForm: {
        username: 'admin',
        password: '123456'
      },
      // 表单验证规则对象
      loginFormRules: {
        username: [
          { required: true,
            message: '请输入用户名',
            trigger: 'blur'
          }
        ],
        password: []
      }
    }
  },
  methods: {
    // 重置登录表单
    resetLoginForm () {
      console.log(this)
      this.$refs.loginFormRef.resetFields()
    },
    login () {
      // 登录表单预校验
      this.$refs.loginFormRef.validate(async valid => {
        console.log('valid or not:' + valid)
        if (!valid) return
        const res = await this.$http.post(
          'login/', this.loginForm)
        console.log(res)
        if (res.status !== 200) return this.$message.error('登录失败')
        this.$message.success('登陆成功')
        window.sessionStorage.setItem('token', res.data.token)
        this.$router.push('/home')
      })
    }
  }
}
</script>

<style lang="less" scoped>
.login_container{
  background-color: #2b4b6b;
  height: 100%;
}
  .login_box{
    width: 450px;
    height: 300px;
    background-color: #ffffff;
    border-radius: 3px;
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);

    .avatar_box{
      height: 130px;
      width: 130px;
      border: 1px solid #eee;
      border-radius: 50%;
      padding: 10px;
      box-shadow: 0 0 10px #dddddd;
      position: absolute;
      left: 50%;
      transform: translate(-50%, -35%);
      background-color: #ffffff;
      img{
        width: 100%;
        height: 100%;
        border-radius: 100%;
      }
    }
  }

  .btns {
    display: flex;
    justify-content: flex-end;
  }

  .login_form{
    position: absolute;
    bottom: 0;
    width: 100%;
    padding: 0 20px;
    box-sizing: border-box;
  }
</style>

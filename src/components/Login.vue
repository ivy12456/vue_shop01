<template>
<div class="login_container">
   <div class="login_box">
       <!-- 头像区域 -->
       <div class="avatar_box">
           <img src="../assets/logo.png" alt="">
       </div>
       <!-- 表单区域 -->
       <el-form ref="loginformRef" :model="loginform" :rules="loginformRules" label-width="0px" class="login_form">
            <!-- 用户 -->
            <el-form-item prop="username">
            <el-input v-model="loginform.username" prefix-icon="iconfont icon-user"></el-input>
            </el-form-item>
            <!-- 密码 -->
            <el-form-item prop="password">
            <el-input v-model="loginform.password" show-password prefix-icon="iconfont icon-3702mima" type="password"></el-input>
            </el-form-item>
            <!-- 按钮区域 -->
            <el-form-item label-width="80px" class="btns">
            <el-button type="primary" @click="login">登录</el-button>
            <el-button type="info" @click="resetloginform">重置</el-button>
            </el-form-item>
       </el-form>
       
   </div>
</div>
</template>

<script>
export default {
   data(){
       return {
           loginform:{
               username:'admin',
               password:'123456',
           },
           loginformRules:{
               username:[
                   { required: true, message: '请输入用户名称', trigger: 'blur' },
                   { min: 3, max: 10, message: '长度在 3 到 10 个字符', trigger: 'blur' }
               ],
               password:[
                   { required: true, message: '请输入用户名称', trigger: 'blur' },
                   { min: 6, max: 15, message: '长度在 6 到 15 个字符', trigger: 'blur' }
               ]
           }
       }
   },
   methods:{
       resetloginform(){
          this.$refs.loginformRef.resetFields();
       },
       login(){
           this.$refs.loginformRef.validate(async valid=>{
              if(!valid) return;
              const {data:res}=await this.$http.post("login",this.loginform);
              if(res.meta.status!=200) return this.$message.error("登录失败");
              this.$message.success("登录成功");
              window.sessionStorage.setItem("token",res.data.token);
              this.$router.push("/home")
           });
       }
   }
}
</script>

<style lang="less" scoped>
  .login_container{
      background-color: #2b4b6b;
      height:100%;
  }
  .login_box{
    width:450px;
    height:300px;
    border-radius:3px;
    background-color: #fff;
    position:absolute;
    top:50%;
    left:50%;
    transform: translate(-50%,-50%);
  }
  .avatar_box{
      width: 130px;
      height:130px;
      border:1px solid #eee;
      border-radius:50%;
      padding:10px;
      box-shadow:0 0 10px #ddd;
      position:absolute;
      left:50%;
      transform: translate(-50%,-50%);
      background-color: #fff;
      img{
          width: 100%;
          height:100%;
          border-radius:50%;
          background-color: #eee;
      }
  }
  .btns{
      display: flex;
      justify-content: flex-end;
  }
  .login_form{
      position:absolute;
      bottom: 0;
      padding:0 20px;
      width: 100%;
      box-sizing: border-box;
  }
</style>
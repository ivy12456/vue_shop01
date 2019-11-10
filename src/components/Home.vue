<template>
    <el-container class='home-container'>
      <el-header>
        <div>
          <img src="../assets/heima.png" alt="">
          <span>电商后台管理系统</span>
        </div>
        <el-button type='info' @click='logout'>退出</el-button>
      </el-header>
      <el-container>
        <el-aside :width="iscollapse ? '64px':'200px'">
          <div class="toggle-button" @click="toggleCollapse">|||</div>
            <el-menu background-color="#333744" text-color="#fff" active-text-color="#409EFF" unique-opened :collapse="iscollapse" :collapse-transition="false" router :default-active="activepath">
              <!-- 一级菜单 -->
              <el-submenu :index="item.id+''" v-for="item in menulist" :key="item.id">
                <template slot="title">
                  <!-- 图标 -->
                  <i :class="iconobj[item.id]"></i>
                  <!-- 文本 -->
                  <span>{{item.authName}}</span>
                </template>

                <!-- 二级菜单 -->
                <el-menu-item :index="'/'+subItem.path" v-for="subItem in item.children" :key="subItem.id" >
                  <!-- @click="saveNavState('/'+subItem.path)" -->
                  <template slot="title">
                  <!-- 图标 -->
                  <i class="el-icon-menu"></i>
                  <!-- 文本 -->
                  <span>{{subItem.authName}}</span>
                </template>
                </el-menu-item>
              </el-submenu>
            </el-menu>
        </el-aside>
        <el-main>
          <router-view></router-view>
        </el-main>
      </el-container>
    </el-container>
</template>

<script>
export default {
  data(){
    return {
      menulist:[],
      iconobj:{
        '125':'iconfont icon-user',
        '103':'iconfont icon-tijikongjian',
        '101':'iconfont icon-shangpin',
        '102':'iconfont icon-danju',
        '145':'iconfont icon-baobiao'
      },
      iscollapse:false,
      activepath:'',
    }
  },
  created(){
    this.getMenulist();
    this.activepath=location.hash.slice(1)
    // this.activepath=window.sessionStorage.getItem('activepath');
  },
  watch:{
    $route(to,from){
      this.activepath=to.path
    }
  },
  methods:{
      logout(){
        window.sessionStorage.clear();
        this.$router.push('/login')
      },
      async getMenulist(){
        const {data:res}=await this.$http.get("menus")
        if(res.meta.status!=200){
          return this.$message.error(res.meta.msg)
        }
        this.menulist=res.data
        // console.log(res)
      },
      toggleCollapse(){
        this.iscollapse=!this.iscollapse;
      },
      // saveNavState(activepath){
      //   window.sessionStorage.activepath=activepath;
      //   this.activepath=activepath;
      // }
  }
}
</script>

<style lang="less" scoped>
  .el-header{
    background-color: #373d41;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-left:0;
    div{
      color:#fff;
      display:flex;
      align-items: center;
      span{
        padding-left:15px;
        font-size:20px;
      }
    }
  }
  .el-aside{
    background-color: #333744;
    .el-menu{
      border-right:0
    }
  }
  .el-main{
    background-color: #EAEDF1;
  }
  .home-container{
    height:100%
  }
  .iconfont{
    margin-right:10px
  }
  .toggle-button{
    background-color: #4b5064;
    color:#fff;
    letter-spacing:0.2em;
    font-size:10px;
    line-height: 24px;
    text-align:center;
    cursor:pointer
  }
</style>
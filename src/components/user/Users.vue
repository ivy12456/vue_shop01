<template>
    <div>
        <el-breadcrumb>
           <el-breadcrumb-item :to="{ path: '/welcome' }">首页</el-breadcrumb-item>
           <el-breadcrumb-item>用户管理</el-breadcrumb-item>
           <el-breadcrumb-item>用户列表</el-breadcrumb-item>
        </el-breadcrumb>
        <el-card>
            <el-row :gutter="20">
                <el-col :span="9">
                    <el-input placeholder="请输入内容" v-model="queryInfo.query" clearable @clear="getUserlist">
                    <el-button slot="append" icon="el-icon-search" @click="getUserlist"></el-button>
                    </el-input>
                </el-col>
                <el-col :span="3">
                    <el-button type="primary">添加用户</el-button>
                </el-col>
            </el-row>
            <el-table :data="userlist" border stripe>
                <el-table-column type="index"></el-table-column>
                <el-table-column prop="username" label="姓名"></el-table-column>
                <el-table-column prop="email" label="邮箱"></el-table-column>
                <el-table-column prop="mobile" label="电话"></el-table-column>
                <el-table-column prop="role_name" label="角色"></el-table-column>
                <el-table-column label="状态">
                    <template slot-scope="info">
                        <el-switch v-model="info.row.mg_state" @change="userStateChanged(info.row)">
                        </el-switch>
                    </template>
                </el-table-column>
                <el-table-column label="操作" width="180px">
                    <template slot-scope="info">
                        <el-button type="primary" icon="el-icon-edit" size="mini"></el-button>
                        <el-button type="primary" icon="el-icon-delete" size="mini"></el-button>
                        <el-tooltip effect="dark" content="分配角色" placement="top" :enterable="false">
                            <el-button type="primary" icon="el-icon-setting" size="mini"></el-button>
                        </el-tooltip>
                    </template>
                </el-table-column>
            </el-table>
            <el-pagination @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
            :current-page="queryInfo.pagenum"
            :page-sizes="[1, 2, 5, 10]"
            :page-size="queryInfo.pagesize"
            layout="total, sizes, prev, pager, next, jumper"
            :total="total">
            </el-pagination>
         </el-card>
    </div>
</template>

<script>
export default {
   data(){
       return {
           queryInfo:{
               query:'',
               pagenum:1,
               pagesize:2
           },
           userlist:[],
           total:0
       }
   },
   created(){
       this.getUserlist()
   },
   methods:{
       async getUserlist(){
        const {data:res}=await this.$http.get('users',{ params:this.queryInfo})
        if(res.meta.status!=200) return this.$message.error('获取用户列表失败')
        this.userlist=res.data.users;
        this.total=res.data.total;
        // console.log(res)
       },
       handleSizeChange(newsize){
        //  console.log(newsize)
        this.queryInfo.pagesize=newsize;
        this.getUserlist()
       },
       handleCurrentChange(newpage){
        //  console.log(newpage)
        this.queryInfo.pagenum=newpage;
        this.getUserlist()
       },
       async userStateChanged(row){
         const {data:res}=await this.$http.put(`users/${row.id}/state/${row.mg_state}`)
         if(res.meta.status!=200) {
            row.mg_state=!row.mg_state
            return this.$message.error('用户状态更新失败')
         }
         this.$message.success('用户状态更新成功')
       }
   }
}
</script>

<style lang="less" scoped>

</style>
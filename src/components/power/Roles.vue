<template>
    <div>
        <!-- 面包屑导航 -->
        <el-breadcrumb>
           <el-breadcrumb-item :to="{ path: '/welcome' }">首页</el-breadcrumb-item>
           <el-breadcrumb-item>权限管理</el-breadcrumb-item>
           <el-breadcrumb-item>角色列表</el-breadcrumb-item>
        </el-breadcrumb>
        <el-card>
            <!-- 添加角色区域 -->
            <el-row>
                <el-col>
                    <el-button type="primary">添加角色</el-button>
                </el-col>
            </el-row>
            <!-- 角色列表区域 -->
            <el-table :data="rolelist" border stripe>
                <!-- 展开列 -->
                <el-table-column type="expand">
                    <template slot-scope="scope">
                        <el-row :class="['bdbottom',i1==0? 'bdtop':'','vcenter']" v-for="(item1, i1) in scope.row.children" :key="item1.id"> 
                            <!-- 一级权限 -->
                            <el-col :span="5">
                                <el-tag type="primary" closable @close="removeRightsById(scope.row,item1.id)">{{item1.authName}}</el-tag>
                                <i class="el-icon-caret-right"></i>
                            </el-col>
                            <!-- 二级和三级权限 -->
                            <el-col :span="19">
                                <el-row :class="[i2==0 ? '':'bdtop','vcenter']" v-for="(item2,i2) in item1.children" :key="item2.id">
                                    <el-col :span="6">
                                        <el-tag type="success" closable @close="removeRightsById(scope.row,item2.id)">{{item2.authName}}</el-tag>
                                        <i class="el-icon-caret-right"></i>
                                    </el-col>
                                    <el-col :span="18">
                                        <el-tag type="warning" v-for="(item3,i3) in item2.children" :key="item3.id" closable @close="removeRightsById(scope.row,item3.id)">{{item3.authName}}</el-tag>
                                    </el-col>
                                </el-row>
                            </el-col>
                        </el-row>
                    </template>
                </el-table-column>
                <!-- 索引列 -->
                <el-table-column type="index"></el-table-column>
                <el-table-column prop="roleName" label="角色名称"></el-table-column>
                <el-table-column prop="roleDesc" label="角色描述"></el-table-column>
                <el-table-column label="操作" width="300px">
                    <template slot-scope="scope" >
                        <el-button size="mini" type="primary" icon="el-icon-edit">编辑</el-button>
                        <el-button size="mini" type="danger" icon="el-icon-delete">删除</el-button>
                        <el-button size="mini" type="warning" icon="el-icon-setting" @click="getrightslist(scope.row)">分配权限</el-button>
                    </template>
                </el-table-column>
            </el-table>
        </el-card>
        <!-- 分配权限对话框 -->
        <el-dialog title="提示" :visible.sync="rightdialogVisible" width="50%" @closed="setRightDialogclosed">
            <!-- 树形控件 -->
            <el-tree :data="rightslist" :props="treeProps" show-checkbox default-expand-all node-key="id" :default-checked-keys="defaultKeys" ref="treeRef"></el-tree>
            <span slot="footer" class="dialog-footer">
                <el-button @click="rightdialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="allotRights">确 定</el-button>
            </span>
        </el-dialog>
    </div>
</template>

<script>
export default {
  data(){
      return {
          rolelist:[],
          rightdialogVisible:false,
          rightslist:[],
          treeProps:{
            label:'authName',
            children:'children'
          },
          defaultKeys:[],
          roleId:'',
      }
  },
  created(){
      this.getRolelist()
  },
  methods:{
      async getRolelist(){
        const {data:res}=await this.$http.get("roles")
        if(res.meta.status!=200) return this.$message.error('获取角色列表失败')
        this.rolelist=res.data
      },
      async removeRightsById(role,rightid){
        const confirmResult=await this.$confirm('此操作将永久删除该文件, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).catch(err=>err)
        if(confirmResult!='confirm'){
            return this.$message.info('已经取消删除')
        }
        // console.log('确认删除')
        const {data:res}=await this.$http.delete(`roles/${role.id}/rights/${rightid}`)
        if(res.meta.status!=200) return this.$message.error('删除权限失败')
        role.children=res.data
      },
      async getrightslist(role){
        this.roleId = role.id;
        const {data:res}=await this.$http.get('rights/tree')
        if(res.meta.status!=200) return this.$message.error('获取权限信息失败')
        this.rightslist=res.data
        // console.log(res)
        // 递归获取三级节点的id
        this.getLeafKeys(role,this.defaultKeys)
        this.rightdialogVisible=true
      },
      getLeafKeys(node,arr){
        if(!node.children){
            return arr.push(node.id)
        }
        node.children.forEach(item => {
            this.getLeafKeys(item,arr)
        });
      },
      setRightDialogclosed(){
        //   监听分配权限对话框的关闭事件
        this.defaultKeys=[];
      },
      async allotRights(){
        // 当用户在树形对话框中点击确定时，将所有选中的进行更新
        const keys = [
        ...this.$refs.treeRef.getCheckedKeys(),
        ...this.$refs.treeRef.getHalfCheckedKeys()
        ]
        const idStr=keys.join(',')
        const {data:res}=await this.$http.post(`roles/${this.roleId}/rights`,{
            rids:idStr
        })
        if(res.meta.status!=200) return this.$message.error('分配权限失败')
        this.$message.success("分配权限成功")
        this.getRolelist();
        this.rightdialogVisible=false;
      }
  }
}
</script>

<style lang="less" scoped>
   .el-tag{
       margin :7px
   }
   .bdtop{
       border-top:1px solid #eee
   }
   .bdbottom{
       border-bottom:1px solid #eee
   }
   .vcenter{
       display: flex;
       align-items: center;
   }
</style>
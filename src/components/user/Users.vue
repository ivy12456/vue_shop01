<template>
  <div>
    <!-- 面包屑导航 -->
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
          <el-button type="primary" @click="addDialogVisible=true">添加用户</el-button>
        </el-col>
      </el-row>
      <el-table :data="userlist" border stripe>
        <el-table-column type="index" :index="index"></el-table-column>
        <el-table-column prop="username" label="姓名"></el-table-column>
        <el-table-column prop="email" label="邮箱"></el-table-column>
        <el-table-column prop="mobile" label="电话"></el-table-column>
        <el-table-column prop="role_name" label="角色"></el-table-column>
        <el-table-column label="状态">
          <template slot-scope="info">
            <el-switch v-model="info.row.mg_state" @change="userStateChanged(info.row)"></el-switch>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180px">
          <template slot-scope="info">
            <el-button
              type="primary"
              icon="el-icon-edit"
              size="mini"
              @click="showEditDialog(info.row.id)"
            ></el-button>
            <el-button
              type="primary"
              icon="el-icon-delete"
              size="mini"
              @click="removeUserById(info.row.id)"
            ></el-button>
            <el-tooltip effect="dark" content="分配角色" placement="top" :enterable="false">
              <el-button
                type="primary"
                icon="el-icon-setting"
                size="mini"
                @click="setRole(info.row)"
              ></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[1, 2, 5, 10]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      ></el-pagination>
    </el-card>
    <!-- 添加用户对话框 -->
    <el-dialog title="添加用户" :visible.sync="addDialogVisible" width="50%" @close="addDialogclosed">
      <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="70px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="addForm.username"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="addForm.password"></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="addForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机" prop="mobile">
          <el-input v-model="addForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addUser">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 修改用户对话框 -->
    <el-dialog title="修改用户" :visible.sync="editDialogVisible" width="50%" @close="editDialogclosed">
      <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="70px">
        <el-form-item label="用户名">
          <el-input v-model="editForm.username" disabled></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="editForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机" prop="mobile">
          <el-input v-model="editForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editUserinfo">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 分配角色的对话框 -->
    <el-dialog title="提示" :visible.sync="setRoleDialogVisible" width="50%" @closed='setRoleDialogclosed'>
      <div>
        <p>当前的用户:{{userInfo.username}}</p>
        <p>当前的角色:{{userInfo.role_name}}</p>
        <p>分配新角色:
            <el-select v-model="selectRoleId" placeholder="请选择">
            <el-option v-for="item in rolelist" :key="item.id" :label="item.roleName" :value="item.id"
            ></el-option>
            </el-select>
        </p>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="setRoleDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="saveRoleInfo">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    var checkEmail = (rule, value, cb) => {
      const regEmail = /^\w+@\w+(\.\w+)+$/;
      if (regEmail.test(value)) {
        return cb();
      }
      cb(new Error("请输入合法的邮箱"));
    };
    var checkMobile = (rule, value, cb) => {
      const regMobile = /^1[34578]\d{9}$/;
      if (regMobile.test(value)) {
        return cb();
      }
      cb(new Error("请输入合法的手机号"));
    };
    return {
      queryInfo: {
        query: "",
        pagenum: 1,
        pagesize: 2
      },
      userlist: [],
      total: 0,
      addDialogVisible: false,
      editDialogVisible: false,
      addForm: {
        username: "",
        password: "",
        email: "",
        mobile: ""
      },
      addFormRules: {
        username: [
          { required: "true", message: "请输入用户名称", trigger: "blur" },
          {
            min: 3,
            max: 10,
            message: "用户名在3~10个字符之间",
            trigger: "blur"
          }
        ],
        password: [
          { required: "true", message: "请输入用户密码", trigger: "blur" },
          {
            min: 6,
            max: 15,
            message: "用户名在6~15个字符之间",
            trigger: "blur"
          }
        ],
        email: [
          { required: "true", message: "请输入邮箱", trigger: "blur" },
          {
            validator: checkEmail,
            message: "邮箱格式不正确，请重新输入",
            trigger: "blur"
          }
        ],
        mobile: [
          { required: "true", message: "请输入手机号", trigger: "blur" },
          {
            validator: checkMobile,
            message: "手机号码格式不正确，请重新输入",
            trigger: "blur"
          }
        ]
      },
      editForm: {},
      editFormRules: {
        email: [
          { required: true, message: "请输入邮箱", trigger: "blur" },
          {
            validator: checkEmail,
            message: "邮箱格式不正确，请重新输入",
            trigger: "blur"
          }
        ],
        mobile: [
          { required: true, message: "请输入手机号码", trigger: "blur" },
          {
            validator: checkMobile,
            message: "手机号码格式不正确，请重新输入",
            trigger: "blur"
          }
        ]
      },
      // 控制分配角色对话框的显示与隐藏
      setRoleDialogVisible: false,
      // 需要被分配角色的用户
      userInfo: {},
      rolelist: [],
      selectRoleId:'',
    };
  },
  created() {
    this.getUserlist();
  },
  methods: {
    async getUserlist() {
      const { data: res } = await this.$http.get("users", {
        params: this.queryInfo
      });
      if (res.meta.status != 200)
        return this.$message.error("获取用户列表失败");
      this.userlist = res.data.users;
      this.total = res.data.total;
      // console.log(res)
    },
    handleSizeChange(newsize) {
      //  console.log(newsize)
      this.queryInfo.pagesize = newsize;
      this.getUserlist();
    },
    handleCurrentChange(newpage) {
      //  console.log(newpage)
      this.queryInfo.pagenum = newpage;
      this.getUserlist();
    },
    async userStateChanged(row) {
      const { data: res } = await this.$http.put(
        `users/${row.id}/state/${row.mg_state}`
      );
      if (res.meta.status != 200) {
        row.mg_state = !row.mg_state;
        return this.$message.error("用户状态更新失败");
      }
      this.$message.success("用户状态更新成功");
    },
    addDialogclosed() {
      this.$refs.addFormRef.resetFields();
    },
    addUser() {
      this.$refs.addFormRef.validate(async valid => {
        //    console.log(valid)
        if (!valid) return;
        const { data: res } = await this.$http.post("users", this.addForm);
        if (res.meta.status != 201) this.$message.error("添加用户失败");
        this.$message.success("添加用户成功");
        this.addDialogVisible = false;
        this.getUserlist();
      });
    },
    async showEditDialog(id) {
      const { data: res } = await this.$http.get("users/" + id);
      if (res.meta.status != 200)
        return this.$message.error("查询用户信息失败");
      this.editForm = res.data;
      this.editDialogVisible = true;
    },
    editDialogclosed() {
      this.$refs.editFormRef.resetFields();
    },
    editUserinfo() {
      this.$refs.editFormRef.validate(async valid => {
        //    console.log(valid)
        if (!valid) return;
        const { data: res } = await this.$http.put(
          "users/" + this.editForm.id,
          {
            email: this.editForm.email,
            mobile: this.editForm.mobile
          }
        );
        if (res.meta.status != 200)
          return this.$message.error("修改用户信息失败");
        this.editDialogVisible = false;
        this.getUserlist();
        this.$message.success("修改用户信息成功");
      });
    },
    async removeUserById(id) {
      const confirmResult = await this.$confirm(
        "此操作将永久删除该用户, 是否继续?",
        "提示",
        {
          confirmButtonText: "确定删除",
          cancelButtonText: "取消",
          type: "warning"
        }
      ).catch(err => err);
      if (confirmResult !== "confirm") return this.$message.info("已取消删除");
      //    console.log('确定删除')
      const { data: res } = await this.$http.delete("users/" + id);
      if (res.meta.status !== 200) return this.$message.error("删除用户失败");
      this.$message.success("删除用户成功");
      this.getUserlist();
    },
    async setRole(userInfo) {
      this.userInfo = userInfo;
      // 展示对话框之前获取所有的角色列表
      const { data: res } = await this.$http.get("roles");
      if (res.meta.status != 200)
        return this.$message.error("请求角色列表失败");
      this.rolelist = res.data;
      this.setRoleDialogVisible = true;
    },
    async saveRoleInfo(){
        if(!this.selectRoleId)return this.$message.error('请选择要分配的角色')
        const {data:res}=await this.$http.put(`users/${this.userInfo.id}/role`,{
            rid:this.selectRoleId
        })
        if(res.meta.status!=200) return this.$message.error('更新角色失败')
        this.$message.success('更新角色成功')
        this.getUserlist()
        this.setRoleDialogVisible=false
    },
    setRoleDialogclosed(){
        this.selectRoleId=''
        this.userInfo={}
    }
  },
  computed:{
    index(){
      return (this.queryInfo.pagenum-1)*this.queryInfo.pagesize+1
    },
  }
};
</script>

<style lang="less" scoped>
</style>
<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb>
      <el-breadcrumb-item :to="{ path: '/welcome' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>参数列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片区域 -->
    <el-card>
      <el-alert title="注意：只允许为第三级分类设置相关参数！" type="warning" show-icon :closable="false"></el-alert>
      <el-row class="cat_opt">
        <el-col>
          <span>选择商品分类：</span>
          <el-cascader
            v-model="selectCateKeys"
            :options="catelist"
            :props="{expandTrigger: 'hover',value:'cat_id',label:'cat_name',children:'children'}"
            @change="selectCateChange"
            clearable
          ></el-cascader>
        </el-col>
      </el-row>
      <el-tabs v-model="activeName" @tab-click="handleTabClick">
        <!-- 添加动态参数 -->
        <el-tab-pane label="动态参数" name="many">
          <el-button
            type="primary"
            size="mini"
            :disabled="isBtnDisabled"
            @click="addDialogVisible=true"
          >动态参数</el-button>
          <!-- 动态参数表格 -->
          <el-table :data="manyTableData" stripe border>
            <!-- 展开行 -->
            <el-table-column type="expand">
              <template slot-scope="scope">
                <el-tag v-for="(item,i) in scope.row.attr_vals" :key="i" closable @close="tagClose(i,scope.row)">{{item}}</el-tag>
                <!-- 动态编辑标签 -->
                <el-input
                  class="input-new-tag"
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)"
                ></el-input>
                <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ New Tag</el-button>
              </template>
            </el-table-column>
            <el-table-column type="index"></el-table-column>
            <el-table-column label="参数名称" prop="attr_name"></el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button
                  type="primary"
                  size="mini"
                  icon="el-icon-edit"
                  @click="showEditDialog(scope.row.attr_id)"
                >编辑</el-button>
                <el-button
                  type="danger"
                  size="mini"
                  icon="el-icon-delete"
                  @click="removeParams(scope.row.attr_id)"
                >删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <!-- 添加静态属性 -->
        <el-tab-pane label="静态属性" name="only">
          <el-button
            type="primary"
            size="mini"
            :disabled="isBtnDisabled"
            @click="addDialogVisible=true"
          >静态属性</el-button>
          <!-- 静态属性表格 -->
          <el-table :data="onlyTableData" stripe border>
            <!-- 展开行 -->
            <el-table-column type="expand">
              <template slot-scope="scope">
                <el-tag v-for="(item,i) in scope.row.attr_vals" :key="i" closable @close="tagClose(i,scope.row)">{{item}}</el-tag>
                <!-- 动态编辑标签 -->
                <el-input
                  class="input-new-tag"
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)"
                ></el-input>
                <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ New Tag</el-button>
              </template>
            </el-table-column>
            <el-table-column type="index"></el-table-column>
            <el-table-column label="属性名称" prop="attr_name"></el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button
                  type="primary"
                  size="mini"
                  icon="el-icon-edit"
                  @click="showEditDialog(scope.row.attr_id)"
                >编辑</el-button>
                <el-button
                  type="danger"
                  size="mini"
                  icon="el-icon-delete"
                  @click="removeParams(scope.row.attr_id)"
                >删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>
    <!-- 添加动态参数或静态属性的对话框 -->
    <el-dialog
      :title="'添加'+titleText"
      :visible.sync="addDialogVisible"
      width="50%"
      @closed="addDialogClosed"
    >
      <!-- 添加数据的表单 -->
      <el-form ref="addformRef" :model="addform" :rules="addformRules" label-width="100px">
        <el-form-item :label="titleText" prop="attr_name">
          <el-input v-model="addform.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addParams">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 修改对话框 -->
    <el-dialog
      :title="'修改'+titleText"
      :visible.sync="editDialogVisible"
      width="50%"
      @closed="editDialogClosed"
    >
      <!-- 修改数据的表单 -->
      <el-form ref="editformRef" :model="editform" :rules="editformRules" label-width="100px">
        <el-form-item :label="titleText" prop="attr_name">
          <el-input v-model="editform.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editParams">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 商品分类列表
      catelist: [],
      // 级联选中的项
      selectCateKeys: [],
      activeName: "many",
      // 动态参数的数据
      manyTableData: [],
      // 静态属性的数据
      onlyTableData: [],
      addDialogVisible: false,
      // 添加参数或属性的表单
      addform: {
        attr_name: ""
      },
      addformRules: {
        attr_name: [
          { required: true, message: "请输入添加的参数名称", trigger: "blur" }
        ]
      },
      // 修改对话框的显示与隐藏
      editDialogVisible: false,
      // 修改表单
      editform: {},
      // 修改表单的验证规则
      editformRules: {
        attr_name: [
          { required: true, message: "请输入添加的参数名称", trigger: "blur" }
        ]
      },
      

    };
  },
  created() {
    this.getCatelist();
  },
  methods: {
    async getCatelist() {
      const { data: res } = await this.$http.get("categories");
      if (res.meta.status != 200)
        return this.$message.error("查询商品分类失败");
      this.catelist = res.data;
      // console.log(res.data)
    },
    // 选择商品分类触发
    selectCateChange() {
      this.getParamsData();
    },
    // 动态参数与静态参数tab栏切换触发
    handleTabClick() {
      this.getParamsData();
      // console.log(this.activeName)
    },
    // 获取参数列表
    async getParamsData() {
      // 如果选中的不是三级分类
      if (this.selectCateKeys.length != 3) {
        this.selectCateKeys = [];
        this.manyTableData=[];
        this.onlyTableData=[];
        return;
      }
      // 如果选中的是三级分类，获取参数列表
      const { data: res } = await this.$http.get(
        `categories/${this.cateId}/attributes`,
        {
          params: { sel: this.activeName }
        }
      );
      if (res.meta.status != 200)
        return this.$message.error("获取参数列表失败");
      // console.log(res.data)
      res.data.forEach(item => {
        item.attr_vals = item.attr_vals ? item.attr_vals.split(" ") : [];
        // 控制文本框与按钮的切换
        item.inputVisible=false;
        // 文本框的内容
        item.inputValue='';
      });
      if (this.activeName == "many") {
        this.manyTableData = res.data;
      } else {
        this.onlyTableData = res.data;
      }
    },
    
    // 监听添加的对话框关闭事件
    addDialogClosed() {
      this.$refs.addformRef.resetFields();
    },
    // 点击确定按钮，触发的事件
    addParams() {
      this.$refs.addformRef.validate(async valid => {
        if (!valid) return;
        const { data: res } = await this.$http.post(
          `categories/${this.cateId}/attributes`,
          {
            attr_name: this.addform.attr_name,
            attr_sel: this.activeName
          }
        );
        console.log(res.data);
        if (res.meta.status != 201) return this.$message.error("添加参数失败");
        this.$message.success("添加参数成功");
        this.addDialogVisible = false;
        this.getParamsData();
      });
    },
    // 修改对话框关闭时触发
    editDialogClosed() {
      this.$refs.editformRef.resetFields();
    },
    // 修改对话框点击确定
    editParams() {
      this.$refs.editformRef.validate(async valid => {
        if (!valid) return;
        const { data: res } = await this.$http.put(
          `categories/${this.cateId}/attributes/${this.editform.attr_id}`,
          {
            attr_name: this.editform.attr_name,
            attr_sel: this.activeName
          }
        );
        if (res.meta.status != 200) return this.$message.error("修改参数失败");
        this.$message.success("修改参数成功");
        this.editform = res.data;
        this.getParamsData();
        this.editDialogVisible = false;
      });
    },
    // 点击编辑按钮触发
    async showEditDialog(attr_id) {
      const { data: res } = await this.$http.get(
        `categories/${this.cateId}/attributes/${attr_id}`,
        {
          params: {
            attr_sel: this.activeName
          }
        }
      );
      if (res.meta.status != 200) return this.$message.error("获取参数失败");
      this.editform = res.data;
      this.editDialogVisible = true;
    },
    // 点击删除参数的按钮
    async removeParams(attr_id) {
      const confirmResult = await this.$confirm(
        "此操作将永久删除该参数, 是否继续?",
        "提示",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }
      ).catch(err => err);
      if (confirmResult != "confirm") return this.$message.info("已取消删除");
      const { data: res } = await this.$http.delete(
        `categories/${this.cateId}/attributes/${attr_id}`
      );
      if (res.meta.status != 200) return this.$message.error("删除参数失败");
      this.$message.success("删除参数成功");
      this.getParamsData();
    },
    // 文本框失去焦点或者按下enter键触发
    async handleInputConfirm(row){
      if(row.inputValue.trim().length==0){
        row.inputValue='';
        row.inputVisible=false;
        return 
      }
      // 如果没有被return的话，说明输入文本框的内容合法，将其添加进vals数组里
      row.attr_vals.push(row.inputValue.trim())
      row.inputValue='';
      row.inputVisible=false;
      // 发起请求，保存本次修改
      this.saveAttrVals(row)
    },
    // 保存对attr_vals的修改之后的请求结果
    async saveAttrVals(row){
      const {data:res}=await this.$http.put(`categories/${this.cateId}/attributes/${row.attr_id}`,{
        attr_name:row.attr_name,
        attr_sel:row.attr_sel,
        attr_vals:row.attr_vals.join(' ')
      })
      if(res.meta.status!=200) return this.$message.error('修改参数项失败')
      this.$message.success('修改参数项成功')
    },
    // 点击按钮，切换文本框
    showInput(row){
      row.inputVisible=true
      // $$nextTick作用是，当页面元素被重新渲染之后，会调用里面的回调函数
      this.$nextTick(_ => {
        this.$refs.saveTagInput.$refs.input.focus();
      });
    },
    // tag标签点删除时触发
    async tagClose(i,row){
      row.attr_vals.splice(i,1)
      this.saveAttrVals(row)
    },
  },
  computed: {
    isBtnDisabled() {
      if (this.selectCateKeys.length != 3) {
        return true;
      }
      return false;
    },
    cateId() {
      if (this.selectCateKeys.length == 3) {
        return this.selectCateKeys[2];
      }
      return null;
    },
    titleText() {
      if (this.activeName == "many") {
        return "动态参数";
      } else {
        return "静态属性";
      }
    }
  }
};
</script>

<style lang="less" scoped>
.cat_opt {
  margin: 10px 0;
}
.el-tag {
  margin: 10px;
}
.input-new-tag{
  width: 120px;
}
</style>
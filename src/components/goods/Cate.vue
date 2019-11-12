<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb>
      <el-breadcrumb-item :to="{ path: '/welcome' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区域 -->
    <el-card>
      <el-row>
        <el-col>
          <el-button type="primary" @click='showAddCateDialog'>添加分类</el-button>
        </el-col>
      </el-row>
      <!-- 表格区域 -->
      <tree-table
        class="treeTable"
        :data="catelist"
        :columns="columns"
        show-index
        index-text="#"
        border
        :show-row-hove="false"
        :selection-type="false"
        :expand-type="false"
      >
        <template slot="isok" slot-scope="scope">
          <i class="el-icon-success" v-if="scope.row.cat_deleted==false" style="color:lightgreen;"></i>
          <i class="el-icon-error" v-else style="color:red;"></i>
        </template>
        <template slot="order" slot-scope="scope">
          <el-tag size="mini" v-if="scope.row.cat_level==0">一级</el-tag>
          <el-tag size="mini" type="success" v-else-if="scope.row.cate_level==1">二级</el-tag>
          <el-tag size="mini" type="warning" v-else>三级</el-tag>
        </template>
        <template slot="opt" slot-scope="scope">
          <el-button type="primary" icon="el-icon-edit" size="mini">编辑</el-button>
          <el-button type="danger" icon="el-icon-delete" size="mini">删除</el-button>
        </template>
      </tree-table>
      <!-- 分页区域 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[3, 5, 10, 15]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      ></el-pagination>
    </el-card>
    <!-- 添加分类对话框 -->
    <el-dialog title="提示" :visible.sync="addCateVisible" width="50%" @closed='addCateDialogVisibleClose'>
      <!-- 添加分类的表单 -->
      <el-form :model="addCateForm" :rules="addCateFormRules" ref="addCateFormRef" label-width="100px">
        <el-form-item label="分类名称" prop="cat_name">
            <el-input v-model="addCateForm.cat_name"></el-input>
        </el-form-item>
        <el-form-item label="父级分类" prop="cat_name" >
            <el-cascader v-model="selectParentKeys" :options="ParentCatelist" :props="{expandTrigger: 'hover',value:'cat_id',label:'cat_name',children:'children',checkStrictly:true}" @change="parentCateChange" clearable></el-cascader>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
            <el-button @click="addCateVisible = false">取 消</el-button>
            <el-button type="primary" @click="addCate">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      queryInfo: {
        type: 3,
        pagenum: 1,
        pagesize: 5
      },
      catelist: [],
      total: 0,
      columns: [
        {
          label: "分类名称",
          prop: "cat_name"
        },
        {
          label: "是否有效",
          type: "template",
          template: "isok"
        },
        {
          label: "排序",
          type: "template",
          template: "order"
        },
        {
          label: "操作",
          type: "template",
          template: "opt"
        }
      ],
      addCateVisible:false,
      addCateForm:{
        cat_name:'',
        cat_pid:0,
        cat_level:0,
      },
      addCateFormRules:{
        cat_name:[
          {required:true,message:'请输入分类名称',trigger:'blur'},
        ]
      },
      ParentCatelist:[],
      selectParentKeys:[],

    };
  },
  created() {
    this.getCatelist();
  },
  methods: {
    async getCatelist() {
      const { data: res } = await this.$http.get("categories", {
        params: this.queryInfo
      });
      if (res.meta.status != 200)
        return this.$message.error("获取商品分类失败");
      this.catelist = res.data.result;
      this.total = res.data.total;
    //   console.log(res.data);
    },
    // 切换分页pagesize变化
    handleSizeChange(newsize) {
      this.queryInfo.pagesize = newsize;
      this.getCatelist();
    },
    handleCurrentChange(newpage) {
      this.queryInfo.pagenum = newpage;
      this.getCatelist();
    },
    showAddCateDialog(){
      this.getParentCatelist()
      this.addCateVisible=true;
    },
    // 获取父级分类的列表
    async getParentCatelist(){
        const {data:res}=await this.$http.get('categories',{
            params:{
                type:2
            }
        })
        // console.log(res.data)
        this.ParentCatelist=res.data
    },
    // 添加分类时，选择分类项
    parentCateChange(){
        if(this.selectParentKeys.length>0){
            this.addCateForm.cat_pid=this.selectParentKeys[this.selectParentKeys.length-1]
            this.addCateForm.cat_level=this.selectParentKeys.length
        }else{
            this.addCateForm.cat_pid=0
            this.addCateForm.cat_level=0
        }
    },
    // 添加分类对话框关闭时
    addCateDialogVisibleClose(){
        this.$refs.addCateFormRef.resetFields()
        this.selectParentKeys=[];
        this.addCateForm.cat_pid=0;
        this.addCateForm.cat_level=0;
    },
    // 添加分类
    addCate(){
      this.$refs.addCateFormRef.validate(async valid=>{
        if(!valid) return 
        const {data:res}=await this.$http.post('categories',this.addCateForm)
        console.log(res)
        if(res.meta.status!=201) return this.$message.error('添加分类失败')
        this.$message.success('添加分类成功')
        this.getCatelist()
        this.addCateVisible = false
      })
      dfffffffffff
    }

  }
};
</script>

<style lang="less" scoped>
.treeTable {
  margin-top: 15px;
}

.el-cascader{
    width:100%;
}

.el-scrollbar__wrap{
  height:300px!important
}

</style>
<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/welcome' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>添加商品</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片区域 -->
    <el-card>
      <!-- 警示语 -->
      <el-alert title="消息提示的文案" type="info" center show-icon :closable="false"></el-alert>

      <!-- 步骤条 -->
      <el-steps :space="200" :active="activeIndex-0" finish-status="success" align-center>
        <el-step title="基本信息"></el-step>
        <el-step title="商品参数"></el-step>
        <el-step title="商品属性"></el-step>
        <el-step title="商品图片"></el-step>
        <el-step title="商品内容"></el-step>
        <el-step title="完成"></el-step>
      </el-steps>

      <!-- tab栏 -->
      <el-form
        :model="addForm"
        :rules="addFormRules"
        ref="addFormRef"
        label-width="100px"
        label-position="top"
      >
        <el-tabs
          v-model="activeIndex"
          tab-position="left"
          :before-leave="beforeLeaveTab"
          @tab-click="tabClick"
        >
          <el-tab-pane label="基本信息" name="0">
            <el-form-item label="商品名称" prop="goods_name">
              <el-input v-model="addForm.goods_name"></el-input>
            </el-form-item>
            <el-form-item label="商品价格" prop="goods_price">
              <el-input v-model="addForm.goods_price" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品重量" prop="goods_weight">
              <el-input v-model="addForm.goods_weight" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品数量" prop="goods_number">
              <el-input v-model="addForm.goods_number" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品分类" prop="goods_cat">
              <el-cascader
                v-model="addForm.goods_cat"
                :options="catelist"
                :props="{ expandTrigger: 'hover',label:'cat_name',value:'cat_id',children:'children' }"
                @change="handleChange"
              ></el-cascader>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品参数" name="1">
            <el-form-item :label="item.attr_name" v-for="item in ManyTableData" :key="item.attr_id">
              <el-checkbox-group v-model="item.attr_vals">
                <el-checkbox :label="cb" v-for="(cb,i) in item.attr_vals" :key="i" border></el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品属性" name="2">
            <el-form-item :label="item.attr_name" v-for="item in OnlyTableData" :key="item.id">
              <el-input v-model="item.attr_vals"></el-input>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品图片" name="3">
            <el-upload
              :action="uploadURL"
              :on-preview="handlePreview"
              :on-remove="handleRemove"
              list-type="picture"
              :headers="headerObj"
              :on-success="handleSuccess"
            >
              <el-button size="small" type="primary">点击上传</el-button>
            </el-upload>
          </el-tab-pane>
          <el-tab-pane label="商品内容" name="4">
            <!-- 富文本编辑器 -->
            <quill-editor v-model="addForm.goods_introduce"></quill-editor>
            <!-- 添加商品的按钮 -->
            <el-button type="primary" class="btnAdd" @click="Add">添加商品</el-button>
          </el-tab-pane>
        </el-tabs>
      </el-form>
    </el-card>

    <!-- 图片预览框 -->
    <el-dialog title="图片预览" :visible.sync="previewVisible" width="50%">
      <img :src="previewPath" alt="" class='previewImg'>
    </el-dialog>
  </div>
</template>

<script>
import _ from "lodash"
export default {
  data() {
    return {
      // 步骤条的激活项
      activeIndex: "0",
      //添加商品数据对象
      addForm: {
        goods_name: "",
        goods_price: 0,
        goods_weight: 0,
        goods_number: 0,
        // 商品所属的分类数组
        goods_cat: [],
        // 上传图片成功后，存放路径的对象数组
        pics: [],
        // 商品的详情描述
        goods_introduce:'',
        attrs:[],
      },
      //添加商品数据的验证规则
      addFormRules: {
        goods_name: [
          { required: true, message: "请输入商品名称", trigger: "blur" }
        ],
        goods_price: [
          { required: true, message: "请输入商品价格", trigger: "blur" }
        ],
        goods_weight: [
          { required: true, message: "请输入商品重量", trigger: "blur" }
        ],
        goods_number: [
          { required: true, message: "请输入商品数量", trigger: "blur" }
        ],
        goods_cat: [
          { required: true, message: "请选择商品分类", trigger: "blur" }
        ]
      },
      // 商品分类列表数据
      catelist: [],
      // 动态参数列表数据
      ManyTableData: [],
      //   静态属性列表数据
      OnlyTableData: [],
      //   请求头对象
      headerObj: {
        Authorization: window.sessionStorage.getItem("token")
      },
      //   图片预览框的图片存放路径
      previewPath: "",
      uploadURL:"http://localhost:8888/api/private/v1/upload",
      //   图片预览框显示与隐藏
      previewVisible: false
    };
  },
  created() {
    this.getCatelist();
  },
  methods: {
    async getCatelist() {
      const { data: res } = await this.$http.get("categories");
      if (res.meta.status != 200) return this.$message.error("商品分类数据获取失败");
      this.catelist = res.data;
    },
    // 级联选择器选中项会触发这个函数
    handleChange() {
      if (this.addForm.goods_cat.length != 3) {
        this.addForm.goods_cat = [];
      }
    },
    beforeLeaveTab(activeName, oldActiveName) {
      if (oldActiveName == "0" && this.addForm.goods_cat.length != 3) {
        this.$message.error("请选择商品分类");
        return false;
      }
    },
    async tabClick() {
      // 当点击动态参数时
      if (this.activeIndex == "1") {
        const { data: res } = await this.$http.get(
          `categories/${this.cateId}/attributes`,
          {
            params: {
              sel: "many"
            }
          }
        );
        if (res.meta.status != 200)
          return this.$message.error("请求动态参数失败");
        res.data.forEach(item => {
          item.attr_vals =
            item.attr_vals.length == 0 ? [] : item.attr_vals.split(" ");
        });
        this.ManyTableData = res.data;
        // console.log(res.data)
      } else if (this.activeIndex == "2") {
        const { data: res } = await this.$http.get(
          `categories/${this.cateId}/attributes`,
          {
            params: {
              sel: "only"
            }
          }
        );
        if (res.meta.status != 200)
          return this.$message.error("获取静态数据失败");
        this.OnlyTableData = res.data;
      }
    },
    // 处理预览图片效果
    handlePreview(file) {
        // console.log(file)
      this.previewPath = file.response.data.url;
      this.previewVisible = true;
    },
    // 处理移除图片效果
    handleRemove(file) {
      const filepath = file.response.data.tmp_path;
      const i = this.addForm.pics.findIndex(x => {
        x.pic == filepath;
      });
      this.addForm.pics.splice(i, 1);
      // console.log(this.addForm)
    },
    // 图片上传成功时的钩子
    handleSuccess(response) {
      const picInfo = { pic: response.data.tmp_path };
      this.addForm.pics.push(picInfo);
      //    console.log(this.addForm)
    },
    Add(){
        this.$refs.addFormRef.validate(async valid=>{
            if(!valid) return this.$message.error('请填写必要的表单项！')
            // 执行添加的业务逻辑
            const form=_.cloneDeep(this.addForm)
            form.goods_cat=form.goods_cat.join(',')
            // 处理动态参数和静态属性
            this.ManyTableData.forEach(item=>{
                const newInfo={attr_id:item.attr_id,attr_value:item.attr_vals.join(' ')}
                this.addForm.attrs.push(newInfo)
            })
            this.OnlyTableData.forEach(item=>{
                const newInfo={attr_id:item.attr_id,attr_value:item.attr_vals}
                this.addForm.attrs.push(newInfo)
            })
            form.attrs=this.addForm.attrs
            console.log(form)

            // 发起请求添加商品，注意商品名称是唯一的
            const {data:res}=await this.$http.post('goods',form)
            if(res.meta.status!=201) {
                return this.$message.error('添加商品失败')
            }
            this.$message.success('添加商品成功')
            this.$router.push('/goods')
        })
    },
  },
  computed: {
    cateId() {
      if (this.addForm.goods_cat.length == 3) {
        return this.addForm.goods_cat[2];
      }
    }
  }
};
</script>

<style lang="less" scoped>
.previewImg{
    width: 100%
}

.btnAdd{
    margin-top:15px
}
</style>
<template>
<div>
    <!-- 面包屑导航 -->
    <el-breadcrumb>
      <el-breadcrumb-item :to="{ path: '/welcome' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片区域 -->
    <el-card>
        <el-row>
            <el-col :span="8">
                <el-input placeholder="请输入内容">
                    <el-button slot="append" icon="el-icon-search"></el-button>
                </el-input>
            </el-col>
        </el-row>

        <!-- 订单列表数据 -->
        <el-table :data='orderlist' border stripe>
           <el-table-column type="index"></el-table-column>
           <el-table-column label="订单编号" prop="order_number"></el-table-column>
           <el-table-column label="订单价格" prop="order_price"></el-table-column>
           <el-table-column label="是否付款" prop="pay_status"></el-table-column>
           <el-table-column label="是否发货" prop="is_send"></el-table-column>
           <el-table-column label="下单时间" prop="create_time"></el-table-column>
           <el-table-column label="操作">
               <template slot-scope="scope">
                   <el-button size="mini" type="primary" icon="el-icon-edit"></el-button>
                   <el-button size="mini" type="success" icon="el-icon-location"></el-button>
               </template>
           </el-table-column>
        </el-table>
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
          pagesize:10,
        },
        // 总数据个数
        total:0,
        // 订单列表数据
        orderlist:[],
      }
    
  },
  created(){
    this.getOrderList()
  },
  methods:{
    async getOrderList(){
        const {data:res}=await this.$http('orders',{
            params:this.queryInfo
        })
        if(res.meta.status!=200){
            return this.$message.error('获取订单列表失败')
        }
        this.total=res.data.total
        this.orderlist=res.data.goods
    },
  },
}
</script>

<style lang="less" scoped>

</style>
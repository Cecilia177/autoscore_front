<template>
  <div>
    <!--      面包屑导航区-->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>考试管理</el-breadcrumb-item>
      <el-breadcrumb-item>考试设置</el-breadcrumb-item>
    </el-breadcrumb>
    <!--卡片视图-->
    <el-card class="box-card">
      <!--        搜索与添加-->
      <el-row :gutter="20">
        <el-col :span="8">
          <el-input placeholder="请输入查询的考试名称" v-model="search"
            ><el-button slot="append" icon="el-icon-search" @click="getSearchResults()"></el-button>
          </el-input>
        </el-col>
        <el-col :span="3">
          <el-button type="primary" @click="addDialogVisible = true"
            >添加考试</el-button
          >
        </el-col>
      </el-row>
      <!--        考试列表-->
      <el-table :data="examlist" border stripe>
        <el-table-column type="index"></el-table-column>
        <el-table-column label="考试名称" prop="exam_name"></el-table-column>
        <el-table-column label="考试时间" prop="exam_time"></el-table-column>
        <el-table-column label="操作">
          <template slot-scope="scope">
            <!--            修改考试按钮-->
            <el-button
              type="primary"
              icon="el-icon-edit"
              size="mini"
              @click="showEditDialog(scope.row.id)"
            ></el-button>
            <!--            删除考试按钮-->
            <el-button
              type="danger"
              icon="el-icon-delete"
              size="mini"
              @click="removeExamById(scope.row.id)"
            ></el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!--      添加考试对话框-->
    <el-dialog
      title="添加一次考试"
      :visible.sync="addDialogVisible"
      width="60%"
      @close="addDialogClosed"
    >
      <el-form
        :model="addForm"
        :rules="addFormRules"
        ref="addFormRef"
        label-width="100px"
      >
        <el-form-item label="考试名称" prop="exam_name">
          <el-input v-model="addForm.exam_name"></el-input>
        </el-form-item>
        <el-form-item label="考试时间" required>
          <el-col :span="11">
            <el-form-item prop="exam_time">
              <el-date-picker
                type="date"
                placeholder="选择日期"
                v-model="addForm.exam_time"
                style="width: 100%;"
              ></el-date-picker>
            </el-form-item>
          </el-col>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addExam">确 定</el-button>
      </span>
    </el-dialog>
    <!--    修改考试对话框-->
    <el-dialog
      title="修改考试"
      :visible.sync="editDialogVisible"
      width="60%"
      @close="editDialogClosed"
    >
      <el-form
        :model="editForm"
        :rules="editFormRules"
        ref="editFormRef"
        label-width="100px"
      >
        <el-form-item label="考试名称" prop="exam_name">
          <el-input v-model="editForm.exam_name"></el-input>
        </el-form-item>
        <el-form-item label="考试时间" required>
          <el-col :span="11">
            <el-form-item prop="exam_time">
              <el-date-picker
                type="date"
                placeholder="选择日期"
                v-model="editForm.exam_time"
                style="width: 100%;"
              ></el-date-picker>
            </el-form-item>
          </el-col>
        </el-form-item>
      </el-form>
<!--      确定、取消按钮-->
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editExam">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'exams',
  created() {
    this.getExamList()
  },
  data() {
    return {
      examlist: [],
      total: 0,
      // 控制添加考试对话框的显示与隐藏
      addDialogVisible: false,
      // 当前页面
      currentPage: 1,
      // 搜索字段
      search: '',
      // 添加用户表单数据
      addForm: {
        exam_name: '',
        exam_time: ''
      },
      // 添加用户表单验证规则
      addFormRules: {
        exam_name: [
          { required: true, message: '请输入考试名称', trigger: 'blur' }
        ],
        exam_time: [
          { required: true, message: '请输入考试时间', trigger: 'blur' }
        ]
      },
      // 控制修改考试对话框的显示与隐藏
      editDialogVisible: false,
      // 查询用户信息保存
      editForm: {
        exam_name: '',
        exam_time: ''
      },
      // 修改表单验证规则对象
      editFormRules: {
        exam_name: [
          { required: true, message: '请输入考试名称', trigger: 'blur' }
        ],
        exam_time: [
          { required: true, message: '请输入考试时间', trigger: 'blur' }
        ]
      }
    }
  },
  methods: {
    // 获取所有考试列表
    async getExamList() {
      const res = await this.$http.get('exams/?search=' + this.search)
      if (res.status !== 200) return this.$message.error('获取考试列表失败！')
      this.examlist = res.data
      this.total = res.data.length
      console.log(this.total)
    },
    // 获取搜索结果
    getSearchResults() {
      this.currentPage = 1
      this.getExamList()
    },
    // 监听添加考试的对话框关闭事件
    addDialogClosed() {
      this.$refs.addFormRef.resetFields()
    },
    // 新增考试点击确定
    addExam() {
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) return
        const res = await this.$http.post('exams/', this.addForm)
        if (res.status !== 201) this.$message.error('添加考试失败')
        this.$message.success('添加考试成功')
        // 隐藏添加考试对话框
        this.addDialogVisible = false
        // 重新获取考试列表数据
        this.getExamList()
      })
    },
    // 编辑考试对话框显示
    async showEditDialog(examId) {
      console.log(examId)
      const res = await this.$http.get('exams/' + examId)
      if (res.status !== 200) return this.$message.error('查询考试信息失败')
      this.editForm = res.data
      console.log(this.editForm)
      this.editDialogVisible = true
    },
    // 监听修改考试的对话框关闭事件
    editDialogClosed() {
      this.$refs.editFormRef.resetFields()
    },
    // 修改考试点击确定
    editExam() {
      this.$refs.editFormRef.validate(async valid => {
        if (!valid) return
        const res = await this.$http.put('exams/' + this.editForm.id + '/', {
          exam_name: this.editForm.exam_name,
          exam_time: this.editForm.exam_time
        })
        if (res.status !== 200) this.$message.error('修改考试失败')
        this.$message.success('修改考试成功')
        // 隐藏添加考试对话框
        this.editDialogVisible = false
        // 重新获取考试列表数据
        this.getExamList()
      })
    },
    // 删除考试
    async removeExamById(examId) {
      // 弹框询问是否删除
      console.log(examId)
      const confirmResult = await this.$confirm('是否永久删除该考试?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      // 确定删除返回值为字符串"confirm", 取消删除则返回值为字符串"cancel"
      console.log(confirmResult)
      if (confirmResult !== 'confirm') {
        return this.$message.info('放弃删除')
      }
      const res = await this.$http.delete('exams/' + examId + '/')
      if (res.status !== 204) {
        return this.$message.error('删除失败')
      }
      this.$message.success('删除考试成功')
      this.getExamList()
    }
  }
}
</script>

<style lang="less" scoped></style>

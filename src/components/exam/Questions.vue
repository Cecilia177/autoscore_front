<template>
  <div>
    <!--      面包屑导航区-->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>考试管理</el-breadcrumb-item>
      <el-breadcrumb-item>试题设置</el-breadcrumb-item>
    </el-breadcrumb>
    <!--卡片视图-->
    <el-card class="box-card">
      <!--        搜索与添加-->
      <el-row :gutter="20">
        <el-col :span="8">
          <el-select v-model="filter_name" placeholder="按所属考试进行筛选" clearable @change="filterByExam()">
            <el-option
              v-for="item in examOptions"
              :key="item.id"
              :label="item.exam_name"
              :value="item.id"
            >
            </el-option>
          </el-select>
        </el-col>
        <el-col :span="3">
          <el-button type="primary" @click="addDialogVisible = true"
            >添加试题</el-button
          >
        </el-col>
      </el-row>
      <!--        试题列表-->
      <el-table :data="questionlist" border stripe>
        <el-table-column type="index"></el-table-column>
        <el-table-column label="题号" prop="question_no"></el-table-column>
        <el-table-column label="题型" prop="question_type"></el-table-column>
        <el-table-column label="满分" prop="full_score"></el-table-column>
        <el-table-column label="所属考试" prop="exam"></el-table-column>
        <el-table-column label="语言" prop="language"></el-table-column>
        <el-table-column label="参考答案" prop="refs"></el-table-column>
        <el-table-column label="操作">
          <template slot-scope="scope">
            <!--            修改试题按钮-->
            <el-button
              type="primary"
              icon="el-icon-edit"
              size="mini"
              @click="showEditDialog(scope.row.id)"
            ></el-button>
            <!--            删除试题按钮-->
            <el-button
              type="danger"
              icon="el-icon-delete"
              size="mini"
              @click="removeQuestionById(scope.row.id)"
            ></el-button>
          </template>
        </el-table-column>
      </el-table>
      <!--        分页-->
      <el-pagination
        @current-change="handleCurrentChange"
        :current-page.sync="currentPage"
        :page-size="5"
        layout="total, prev, pager, next, jumper"
        :total="total"
      >
      </el-pagination>
    </el-card>
    <!--      添加试题对话框-->
    <el-dialog
      title="添加试题"
      :visible.sync="addDialogVisible"
      width="60%"
    >
      <el-form
        :model="addForm"
        :rules="addFormRules"
        ref="addFormRef"
        label-width="100px"
      >
        <!--        填写题号-->
        <el-form-item label="题号" prop="question_no">
          <el-input v-model="addForm.question_no"></el-input>
        </el-form-item>
        <!--        试题类型-->
        <el-form-item label="题型" prop="question_type">
          <el-select v-model="addForm.question_type" placeholder="请选择">
            <el-option
              v-for="item in quesType"
              :key="item.label"
              :label="item.label"
              :value="item.value"
            >
            </el-option>
          </el-select>
        </el-form-item>
        <!--        所属考试选择框-->
        <el-form-item label="所属考试" prop="exam">
          <el-select v-model="addForm.exam" placeholder="请选择">
            <el-option
              v-for="item in examOptions"
              :key="item.id"
              :label="item.exam_name"
              :value="item.id"
            >
            </el-option>
          </el-select>
        </el-form-item>
        <!--        填写满分值-->
        <el-form-item label="分值" prop="full_score">
          <el-input v-model="addForm.full_score"></el-input>
        </el-form-item>
        <!--        语种类别选择框-->
        <el-form-item label="语言" prop="language">
          <el-radio v-model="addForm.language" label="1">英文</el-radio>
          <el-radio v-model="addForm.language" label="2">中文</el-radio>
        </el-form-item>
        <!--      参考答案-->
        <el-form-item label="参考答案" prop="refs">
          <el-input
            type="textarea"
            autosize
            placeholder="多个答案用“/”隔开"
            v-model="addForm.refs">
          </el-input>
        </el-form-item>
      </el-form>
<!--      确定/取消按钮-->
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addQuestion">确 定</el-button>
      </span>
    </el-dialog>
    <!--    修改试题对话框-->
    <el-dialog
      title="修改试题"
      :visible.sync="editDialogVisible"
      width="60%"
    >
      <el-form
        :model="editForm"
        :rules="editFormRules"
        ref="editFormRef"
        label-width="100px"
      >
        <!--        填写题号-->
        <el-form-item label="题号" prop="question_no">
          <el-input v-model="editForm.question_no"></el-input>
        </el-form-item>
        <!--        试题类型-->
        <el-form-item label="题型" prop="question_type">
          <el-select v-model="editForm.question_type" placeholder="请选择">
            <el-option
              v-for="item in quesType"
              :key="item.label"
              :label="item.label"
              :value="item.value"
            >
            </el-option>
          </el-select>
        </el-form-item>
        <!--        所属考试选择框-->
        <el-form-item label="所属考试" prop="exam">
          <el-select v-model="editForm.exam" placeholder="请选择">
            <el-option
              v-for="item in examOptions"
              :key="item.id"
              :label="item.exam_name"
              :value="item.id"
            >
            </el-option>
          </el-select>
        </el-form-item>
        <!--        填写满分值-->
        <el-form-item label="分值" prop="full_score">
          <el-input v-model="editForm.full_score"></el-input>
        </el-form-item>
        <!--        语种类别选择框-->
        <el-form-item label="语言" prop="language">
          <el-radio v-model="editForm.language" label="1">英文</el-radio>
          <el-radio v-model="editForm.language" label="2">中文</el-radio>
        </el-form-item>
        <!--      参考答案-->
        <el-form-item label="参考答案" prop="refs">
          <el-input
            type="textarea"
            autosize
            placeholder="多个答案用“/”隔开"
            v-model="editForm.refs">
          </el-input>
        </el-form-item>
      </el-form>
      <!--      确定、取消按钮-->
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editQuestion">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'Questions',
  created() {
    this.getExamList()
    this.getQuestionList()
  },
  data() {
    return {
      questionlist: [],
      filter_name: '',
      question_types: {
        1: '填空题',
        2: '改错题',
        3: '翻译题',
        4: '简答题'
      },
      language_types: {
        1: '英文',
        2: '中文'
      },
      total: 0,
      // 过滤字段
      filterForm: {
        question_type: '',
        exam: ''
      },
      // 当前页码
      currentPage: 1,
      // 控制添加考试对话框的显示与隐藏
      addDialogVisible: false,
      // 添加试题表单数据
      addForm: {
        question_no: '',
        question_type: '',
        full_score: '',
        exam: '',
        language: '',
        refs: ''
      },
      // 添加试题表单验证规则
      addFormRules: {
        question_no: [
          { required: true, message: '请输入题号', trigger: 'blur' }
        ],
        question_type: [
          { required: true, message: '请选择题型', trigger: 'blur' }
        ],
        exam: [
          { required: true, message: '请选择所属考试', trigger: 'blur' }
        ],
        full_score: [
          { required: true, message: '请输入满分值', trigger: 'blur' }
        ],
        language: [
          { required: true, message: '请选择语言', trigger: 'blur' }
        ],
        refs: [{ required: true, message: '请输入参考答案', trigger: 'blur' }]
      },
      // 控制修改考试对话框的显示与隐藏
      editDialogVisible: false,
      // 试题列表选择
      quesType: [
        { value: 1, label: '填空题' },
        { value: 2, label: '改错题' },
        { value: 3, label: '翻译题' },
        { value: 4, label: '简答题' }
      ],
      // 语种列表选择
      langType: [
        { value: 1, label: '英文' },
        { value: 2, label: '中文' }
      ],
      // 考试列表选择
      examOptions: [],
      // 查询用户信息保存
      editForm: {
        question_no: '',
        question_type: '',
        full_score: '',
        exam: '',
        language: '',
        refs: ''
      },
      // 修改试题表单验证规则对象
      editFormRules: {
        question_no: [
          { required: true, message: '请输入题号', trigger: 'blur' }
        ],
        question_type: [
          { required: true, message: '请选择题型', trigger: 'blur' }
        ],
        exam: [
          { required: true, message: '请选择所属考试', trigger: 'blur' }
        ],
        full_score: [
          { required: true, message: '请输入满分值', trigger: 'blur' }
        ],
        language: [
          { required: true, message: '请选择语言', trigger: 'blur' }
        ],
        refs: [{ required: true, message: '请输入参考答案', trigger: 'blur' }]
      }
    }
  },
  methods: {
    // 获取试题列表
    async getQuestionList() {
      const res = await this.$http.get('questions/?page=' + this.currentPage + '&exam=' + this.filter_name)
      if (res.status !== 200) return this.$message.error('获取试题列表失败！')
      this.total = res.data['count']
      var transData = res.data['results']
      for (var i = 0; i < transData.length; i++) {
        transData[i]['question_type'] = this.question_types[transData[i]['question_type']]
        transData[i]['language'] = this.language_types[transData[i]['language']]
        if (transData[i]['exam']) transData[i]['exam'] = transData[i]['exam'].exam_name
      }
      this.questionlist = transData
    },
    // 获取所有考试列表
    async getExamList() {
      var res = await this.$http.get('exams')
      this.examOptions = res.data
      // console.log(this.examOptions)
    },
    // 监听页码变动事件
    handleCurrentChange(newPage) {
      console.log(newPage)
      this.currentPage = newPage
      this.getQuestionList()
    },
    // 显示增加试题对话框
    // showAddDialog() {
    //   this.addDialogVisible = true
    //   this.getExamList()
    // },
    // 监听添加试题的对话框关闭事件
    // addDialogClosed() {
    //   this.$refs.addFormRef.resetFields()
    // },
    // 按所属考试名进行筛选
    filterByExam() {
      this.currentPage = 1
      console.log('chosen:' + this.filter_name)
      this.getQuestionList()
    },
    // 点击确定新增问题
    addQuestion() {
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) return
        console.log('addform:' + this.addForm)
        const res = await this.$http.post('questions/', this.addForm)
        if (res.status !== 201) this.$message.error('添加问题失败')
        this.$message.success('添加问题成功')
        // 隐藏添加考试对话框
        this.addDialogVisible = false
        // 重新获取问题列表数据
        this.getQuestionList()
      })
    },
    // 编辑试题对话框显示
    async showEditDialog(questionId) {
      // console.log(questionId)
      // this.getExamList()
      const res = await this.$http.get('questions/' + questionId)
      if (res.status !== 200) return this.$message.error('查询试题信息失败')
      this.editForm = res.data
      this.editForm['language'] = '' + this.editForm['language']
      console.log('editForm:' + this.editForm['language'])
      this.editDialogVisible = true
    },
    // 监听修改考试的对话框关闭事件
    // editDialogClosed() {
    //   this.$refs.editFormRef.resetFields()
    // },
    // 修改试题点击确定
    editQuestion() {
      this.$refs.editFormRef.validate(async valid => {
        if (!valid) return
        const res = await this.$http.put('questions/' + this.editForm.id + '/', this.editForm)
        if (res.status !== 200) this.$message.error('修改试题失败')
        this.$message.success('修改试题成功')
        // 隐藏添加考试对话框
        this.editDialogVisible = false
        // 重新获取考试列表数据
        this.getQuestionList()
      })
    },
    // 删除考试
    async removeQuestionById(questionId) {
      // 弹框询问是否删除
      console.log(questionId)
      const confirmResult = await this.$confirm('是否永久删除该试题?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      // 确定删除返回值为字符串"confirm", 取消删除则返回值为字符串"cancel"
      console.log(confirmResult)
      if (confirmResult !== 'confirm') {
        return this.$message.info('放弃删除')
      }
      const res = await this.$http.delete('questions/' + questionId + '/')
      if (res.status !== 204) {
        return this.$message.error('删除失败')
      }
      this.$message.success('删除试题成功')
      this.getQuestionList()
    }
  }
}
</script>

<style lang="less" scoped></style>

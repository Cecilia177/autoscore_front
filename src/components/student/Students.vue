<template>
  <div>
    <!--      面包屑导航区-->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>学生管理</el-breadcrumb-item>
      <el-breadcrumb-item>学生名单管理</el-breadcrumb-item>
    </el-breadcrumb>
    <!--卡片视图-->
    <el-card class="box-card">
      <!--        搜索与添加-->
      <el-row :gutter="20">
        <el-col :span="8">
          <el-input placeholder="输入学号或姓名" v-model="search"
            ><el-button
              slot="append"
              icon="el-icon-search"
              @click="getSearchResults()"
            ></el-button>
          </el-input>
        </el-col>
        <el-col :span="5">
          <el-button
            type="primary"
            @click="uploadDialogVisible=true"
          >上传学生名单</el-button>
        </el-col>
      </el-row>
      <!--        学生列表-->
      <el-table :data="studentlist" border stripe>
        <el-table-column type="index"></el-table-column>
        <el-table-column label="考号" prop="student_sn"></el-table-column>
        <el-table-column label="姓名" prop="student_name"></el-table-column>
        <el-table-column label="参加考试" prop="exam"></el-table-column>
        <el-table-column label="操作">
          <template slot-scope="scope">
            <!--            修改学生信息按钮-->
            <el-button
              type="primary"
              icon="el-icon-edit"
              size="mini"
              @click="showEditDialog(scope.row.id)"
            ></el-button>
            <!--            删除学生信息按钮-->
            <el-button
              type="danger"
              icon="el-icon-delete"
              size="mini"
              @click="removeStudentById(scope.row.id)"
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
    <!--      编辑学生信息对话框-->
    <el-dialog
      title="修改学生信息"
      :visible.sync="editDialogVisible"
      width="60%"
    >
      <el-form
        :model="editForm"
        :rules="editFormRules"
        ref="editFormRef"
        label-width="100px"
      >
        <!--        修改学号-->
        <el-form-item label="学号" prop="student_sn">
          <el-input v-model="editForm.student_sn"></el-input>
        </el-form-item>
        <!--        修改姓名-->
        <el-form-item label="姓名" prop="student_name">
          <el-input v-model="editForm.student_name"></el-input>
        </el-form-item>
        <!--        所属考试选择框-->
        <el-form-item label="参加考试" prop="exam">
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
      </el-form>
      <!--      确定/取消按钮-->
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editStudent">确 定</el-button>
      </span>
    </el-dialog>
<!--上传文件对话框-->
    <el-dialog
      title="上传学生信息"
      :visible.sync="uploadDialogVisible"
      width="60%"
    >
      <el-form
        :model="uploadForm"
        :rules="uploadFormRules"
        ref="uploadFormRef"
        label-width="100px"
      >
        <!--        所属考试选择框-->
        <el-form-item label="选择考试" prop="exam">
          <el-select v-model="uploadForm.exam" placeholder="请选择">
            <el-option
              v-for="item in examOptions"
              :key="item.id"
              :label="item.exam_name"
              :value="item.id"
            >
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="名单文件">
          <el-upload
            class="upload-demo"
            action=""
            :on-change="handleChange"
            :on-exceed="handleExceed"
            :on-remove="handleRemove"
            :file-list="fileListUpload"
            :limit="limitUpload"
            accept="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
            :auto-upload="false"
          >
            <el-button>从本地选择</el-button>
          </el-upload>
        </el-form-item>
        <el-form-item>
          <el-button type="success" @click="uploadFiles()">确认上传</el-button>
        </el-form-item>

      </el-form>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'Students',
  created() {
    this.getExamList()
    this.getStudentList()
  },
  data() {
    return {
      studentlist: [],
      // 考试列表选择
      examOptions: [],
      // 学生总数
      total: 0,
      // 记录当前页数
      currentPage: 1,
      // 搜索字段
      search: '',
      // 上传文件对话框可见性
      uploadDialogVisible: false,
      // 每次上传文件数
      limitUpload: 1,
      // 文件
      fileTemp: null,
      fileListUpload: [],
      // 从上传文件中读取的学生信息数据
      uploadData: [],
      // 修改信息对话框
      editDialogVisible: false,
      // 修改学生信息表单
      editForm: {
        student_sn: '',
        student_name: '',
        exam: ''
      },
      // 修改学生信息表单验证规则对象
      editFormRules: {
        student_sn: [
          { required: true, message: '请输入学号', trigger: 'blur' }
        ],
        student_name: [
          { required: true, message: '请输入姓名', trigger: 'blur' }
        ],
        exam: [{ required: true, message: '请选择参加考试', trigger: 'blur' }]
      },
      uploadForm: {
        student_sn: '',
        student_name: '',
        exam: ''
      },
      uploadFormRules: {
        student_sn: [
          { required: true, message: '请输入学号', trigger: 'blur' }
        ],
        student_name: [
          { required: true, message: '请输入姓名', trigger: 'blur' }
        ],
        exam: [{ required: true, message: '请选择参加考试', trigger: 'blur' }]
      }
    }
  },
  methods: {
    // 获取所有考试列表
    async getExamList() {
      var res = await this.$http.get('exams')
      this.examOptions = res.data
      // console.log(this.examOptions)
    },
    // 获取学生列表
    async getStudentList() {
      const res = await this.$http.get(
        'students/?page=' + this.currentPage + '&search=' + this.search
      )
      if (res.status !== 200) return this.$message.error('获取试题列表失败！')
      this.total = res.data['count']
      var transData = res.data['results']
      for (var i = 0; i < transData.length; i++) {
        if (transData[i]['exam']) transData[i]['exam'] = transData[i]['exam'].exam_name
      }
      this.studentlist = transData
    },
    // 获取搜索结果
    getSearchResults() {
      this.currentPage = 1
      this.getStudentList()
    },
    // 监听页码变动时间
    handleCurrentChange(newPage) {
      console.log(newPage)
      this.currentPage = newPage
      this.getStudentList()
    },
    // 选择文件后上传
    handleChange(file, fileList) {
      this.fileTemp = file.raw
      if (this.fileTemp) {
        if (
          this.fileTemp.type ===
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
          this.fileTemp.type === 'application/vnd.ms-excel'
        ) {
          this.importFile(this.fileTemp)
        } else {
          this.$message({
            type: 'warning',
            message: '附件格式错误，请删除后重新上传！'
          })
        }
      } else {
        this.$message({
          type: 'warning',
          message: '请上传附件！'
        })
      }
    },
    // 文件上传
    importFile(obj) {
      // 通过DOM取文件数据
      let _this = this
      this.file = event.currentTarget.files[0]
      var f = this.file
      var reader = new FileReader()
      FileReader.prototype.readAsBinaryString = function(f) {
        var binary = ''
        var wb // 读取完成的数据
        var originalData
        var reader = new FileReader()
        reader.onload = function(e) {
          var bytes = new Uint8Array(reader.result)
          var length = bytes.byteLength
          for (var i = 0; i < length; i++) {
            binary += String.fromCharCode(bytes[i])
          }
          var XLSX = require('xlsx')
          wb = XLSX.read(binary, {
            type: 'binary'
          })
          originalData = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]])
          console.log('原始数据如下')
          console.log(originalData)
          let arr = []
          originalData.map(v => {
            let item = {}
            item.student_name = v['姓名']
            item.student_sn = v['学号']
            item.exam = _this.uploadForm['exam']
            arr.push(item)
          })
          _this.uploadData = arr
          return arr
        }
        reader.readAsArrayBuffer(f)
      }
      reader.readAsBinaryString(f)
    },
    async uploadFiles() {
      console.log(this.uploadData)
      var i = 0
      for (; i < this.uploadData.length; i++) {
        const res = await this.$http.post('students/', this.uploadData[i])
        if (res.status !== 201) this.$message.error('添加学生信息失败')
      }
      if (i === this.uploadData.length) {
        this.$message.success('上传成功')
        this.uploadDialogVisible = false
        this.getStudentList()
        this.fileListUpload = []
      }
    },
    handleRemove(file, fileList) {
      this.fileTemp = null
    },
    handleExceed(files, fileList) {
      this.$message.warning(`一次只能选择一个文件`)
    },
    // 编辑学生信息对话框显示
    async showEditDialog(studentId) {
      console.log('studentid:' + studentId)
      console.log(this.studentlist[studentId])
      const res = await this.$http.get('students/' + studentId)
      if (res.status !== 200) return this.$message.error('查询学生信息失败')
      this.editForm = res.data
      this.editDialogVisible = true
    },
    // 修改学生点击确定
    editStudent() {
      this.$refs.editFormRef.validate(async valid => {
        if (!valid) return
        const res = await this.$http.put(
          'students/' + this.editForm.id + '/',
          this.editForm
        )
        if (res.status !== 200) this.$message.error('修改学生信息失败')
        this.$message.success('修改学生信息成功')
        // 隐藏对话框
        this.editDialogVisible = false
        // 重新获取考试列表数据
        this.getStudentList()
      })
    },
    // 删除学生
    async removeStudentById(studentId) {
      // 弹框询问是否删除
      console.log(studentId)
      const confirmResult = await this.$confirm('是否永久删除此学生?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      // 确定删除返回值为字符串"confirm", 取消删除则返回值为字符串"cancel"
      console.log(confirmResult)
      if (confirmResult !== 'confirm') {
        return this.$message.info('放弃删除')
      }
      const res = await this.$http.delete('students/' + studentId + '/')
      if (res.status !== 204) {
        return this.$message.error('删除失败')
      }
      this.$message.success('删除学生成功')
      this.getStudentList()
    }
  }
}
</script>

<style lang="less" scoped></style>

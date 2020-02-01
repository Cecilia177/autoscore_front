<template>
    <div>
      <!--      面包屑导航区-->
      <el-breadcrumb separator-class="el-icon-arrow-right">
        <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item>学生管理</el-breadcrumb-item>
        <el-breadcrumb-item>学生作答管理</el-breadcrumb-item>
      </el-breadcrumb>
      <!--卡片视图-->
      <el-card class="box-card">
        <!--      上传按钮-->
        <el-button
          type="primary"
          @click="showUploadDialog()"
        >上传作答文本</el-button>
        <!--        学生列表-->
        <el-table :data="answerList" border stripe>
          <el-table-column type="index"></el-table-column>
          <el-table-column label="考号" prop="student_sn"></el-table-column>
          <el-table-column label="姓名" prop="student_name"></el-table-column>
          <el-table-column label="参加考试" prop="exam_name"></el-table-column>
          <el-table-column label="题号" prop="question_no"></el-table-column>
          <el-table-column label="回答" prop="text"></el-table-column>
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

      <!--上传文件对话框-->
      <el-dialog
        title="上传学生作答"
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
          <el-form-item label="作答文件">
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
  name: 'Answers',
  created () {
    this.getAnswerList()
  },
  data() {
    return {
      // 考试选择列表
      examOptions: [],
      // 回答列表
      answerList: [],
      // 当前页面
      currentPage: 1,
      // 作答记录总数
      total: 0,
      // 上传文件文本框
      uploadDialogVisible: false,
      // 一次上传最大文件数
      limitUpload: 1,
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
      },
      fileListUpload: [],
      // 原始文件中的数据
      origianlData: [],
      uploadData: []
    }
  },
  methods: {
    // 获取所有作答列表
    async getAnswerList() {
      const res = await this.$http.get('answers/?page=' + this.currentPage)
      if (res.status !== 200) this.$message.error('获取作答列表错误')
      this.total = res.data['count']
      var transData = res.data['results']
      for (var i = 0; i < transData.length; i++) {
        transData[i]['question_no'] = transData[i]['question'].question_no
        transData[i]['student_sn'] = transData[i]['student'].student_sn
        transData[i]['student_name'] = transData[i]['student'].student_name
        transData[i]['exam_name'] = transData[i]['student'].exam.exam_name
      }
      this.answerList = transData
    },
    // 获取所有考试列表
    async getExamList() {
      const res = await this.$http.get('exams')
      this.examOptions = res.data
    },
    showUploadDialog() {
      this.uploadDialogVisible = true
      this.getExamList()
    },
    handleCurrentChange(newPage) {
      this.currentPage = newPage
      this.getAnswerList()
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
    // 读取本地xlxs文件
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
            item.student_sn = v['学号']
            item.question_no = v['题号']
            item.text = v['作答']
            arr.push(item)
          })
          _this.origianlData = arr
          return arr
        }
        reader.readAsArrayBuffer(f)
      }
      reader.readAsBinaryString(f)
    },
    // 点击确认上传后，将本地数据传至服务器
    async uploadFiles() {
      console.log(this.origianlData)
      // 校验数据合法性
      var i = 0
      var finalData = []
      for (; i < this.origianlData.length; i++) {
        var oldData = this.origianlData[i]
        let item = {}
        const stu = await this.$http.get('students/?exam=' + this.uploadForm['exam'] + '&student_sn=' + oldData['student_sn'])
        if (stu.data['count'] === 0) {
          this.$message.error('数据错误：学生' + oldData['student_sn'] + '未参加此次考试')
          return
        } else item.student = stu.data['results'][0].id
        const ques = await this.$http.get('questions/?exam=' + this.uploadForm['exam'] + '&question_no=' + oldData['question_no'])
        if (ques.data['count'] === 0) {
          this.$message.error('数据错误：该场考试中不存在题号' + oldData['question_no'])
          return
        } else item.question = ques.data['results'][0].id
        item.text = this.origianlData[i].text
        finalData.push(item)
      }
      this.uploadData = finalData
      this.$message.success('数据校验成功')
      // 校验通过后上传
      i = 0
      for (; i < this.uploadData.length; i++) {
        const res = await this.$http.post('answers/', this.uploadData[i])
        if (res.status !== 201) this.$message.error('添加学生作答失败')
      }
      if (i === this.uploadData.length) {
        this.$message.success('上传成功')
        this.uploadDialogVisible = false
        this.getAnswerList()
        this.fileListUpload = []
      }
    },
    beforeUpload(file) {
      this.fileList = [file]
      console.log('选择了文件beforeUpload')
      // 读取数据
      this.read(file)
      return false
    },
    read(f) {
      let rd = new FileReader()
      rd.onload = e => {
        // this.readAsArrayBuffer函数内，会回调this.onload函数。在这里处理结果
        let cont = rd.reading({ encode: 'GBK' })
        console.log(cont)
        let formerData = this.textData
        this.textData = formerData + '\n' + cont
      }
      rd.readAsBinaryString(f)
    },
    handleRemove(file, fileList) {
      this.fileTemp = null
    },
    handleExceed(files, fileList) {
      this.$message.warning(`一次只能选择一个文件`)
    }
  }
}
</script>

<style lang="less" scoped>

</style>

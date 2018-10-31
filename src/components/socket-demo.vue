<template>
 <div class="container" style="margin-top: 30px;">
    <el-row>
      <div :span="12">
        <div class="panel panel-info">
          <div class="panel-heading">
            <h4 class="text-center">Online-Demo</h4>
            <el-row>
                <el-col :span="12">
                    <el-button v-if="left" type="primary" @click="joinRoom('left')">进入左群组</el-button>
                    <el-button v-else type="danger" @click="leave('left')" plain >离开左群组</el-button>
                </el-col>
                <el-col :span="12">
                    <el-button v-if="right" type="success" @click="joinRoom('right')">进入右群组</el-button>
                    <el-button v-else type="danger" plain @click="leave('right')" >离开右群组</el-button>
                </el-col>
            </el-row>
          </div>
          <div class="panel-body" ref="body">
            <div v-for="(msg, index) in list" :key="index" class="message" @click="privateChat(msg)">
              <p style="color: #ccc;">
              <span class="user" :style="{color: msg.color}">{{msg.user}}</span>
              {{msg.createAt}}
              </p>
              <p class="content" :style="{backgroundColor: msg.color}">{{msg.content}}</p>
            </div>
          </div>
          <div class="panel-footer">
            <el-input type="text" @keyup.native.enter="send" class="form-control" id="input" v-model="msg"></el-input>
            <el-button  @click="send"  type="primary" plain>发送</el-button>
          </div>
        </div>
      </div>
    </el-row>
  </div>
</template>

<script>
import Vue from 'vue'
export default {
  name: 'SocketDemo',
  data() {
    return {
      msg: '',
      list: [],
      left: true,
      right: true
    }
  },
  created() {
    // 与server建立链接
    this.socket = io('http://localhost:4000')
    // 监听message
    this.socket.on('message', this.message)
    // 监听进入房间
    this.socket.on('joined', this.joined)
    // 监听离开房间
    this.socket.on('leaved', this.leaved)
    this.userName()
  },
  methods: {
    userName() {
      this.$prompt('请输入聊天昵称', '提示', {
        confirmButtonText: '确定',
        closeOnClickModal: false
      }).then(({ value }) => {
        this.$message({
          type: 'success',
          message: value + '欢迎加入聊天室'
        })
        this.msg = value
        this.send()
      })
    },
    message(res) {
      console.log(res)
      this.list.push(res)
      this.$nextTick(() => {
        this.$refs.body.scrollTop = this.$refs.body.scrollHeight - 550
      })
      console.log(res)
    },
    // 向后台发送
    send() {
      if (!this.msg) {
        this.$message({
          showClose: true,
          message: '请输入内容',
          type: 'warning'
        })
        return
      }
      this.socket.emit('message', this.msg)
      this.msg = ''
    },
    // 私聊
    privateChat(msg) {
      // 输入框内显示@要私聊的用户名
      this.msg = `@${msg.user}`
    },
    // 加入房间
    joinRoom(room) {
      this.socket.emit('join', room)
    },
    // 已加入
    joined(room) {
      console.log(room, 111)
      this[room] = false
    },
    // 离开房间
    leave(room) {
      this.socket.emit('leave', room)
    },
    // 已离开
    leaved(room) {
      this[room] = true
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style>
p {
  margin: 0px;
}
.container {
  height: 100%;
  padding: 0 20%;
}
.message {
  margin: 5px;
}
.panel-heading,
.panel-footer {
  text-align: center;
}
.user {
  color: #00a1f4;
  cursor: pointer;
}
.panel-body {
  height: 550px;
  width: 100%;
  overflow-y: auto;
}
.content {
  display: inline-block;
  padding: 6px 10px;
  background-color: #00a1f4;
  border-radius: 8px;
  color: #fff;
}
</style>

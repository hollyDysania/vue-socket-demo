const express = require('express');
const app = express();
// 设置静态文件夹，会默认找当前目录下的index.html文件当做访问的页面
app.use(express.static(__dirname));

// WebSocket是依赖HTTP协议进行握手的
const server = require('http').createServer(app);
const io = require('socket.io')(server);

// -----------------------------随机色-------------------------------
let userColor = ['#00a1f4', '#0cc', '#f44336', '#795548', '#e91e63', '#00bcd4', '#009688', '#4caf50', '#8bc34a', '#ffc107', '#607d8b', '#ff9800', '#ff5722']
// 乱序排列方法，方便把数组打乱
function shuffle(arr) {
  let len = arr.length,
    random;
  while (0 !== len) {
    // 右移位运算符向下取整
    random = (Math.random() * len--) | 0;
    // 解构赋值实现变量互换
    [arr[len], arr[random]] = [arr[random], arr[len]]
  }
  return arr
}
// 保存对应的socket,记录对方的socket实例
let socketObj = {}
let mySocket = {}
// 监听与客户端的连接事件
io.on('connection', socket => {
  console.log('服务端连接成功');
  let color
  let username
  let rooms = []
  mySocket[socket.id] = socket
  // ------------------------------- 聊天相关 --------------------------
  socket.on('message', msg => {
    if (username) {
      // 正则判断是否为私聊
      let private = msg.match(/@([^ ]+) (.+)/)
      // 私聊
      if (private) {
        console.log('私聊')
        // 用户名
        let toUser = private[1]
        // 内容
        let content = private[2]
        // 从socketObj中获取私聊用户的socket
        console.log(socketObj)
        let toSocket = socketObj[toUser]
        if (toSocket) {
          // 向私聊用户发消息
          toSocket.send({
            user: username + '悄悄对你说',
            content,
            color,
            createAt: new Date().toLocaleString()
          })
        }
      } else { // 公聊
        // 房间内
        if (rooms.length) {
          console.log('房间内')
          let socketJson = {}
          rooms.forEach(room => {
            // 取得进入房间内所对应的所有sockets的hash值，它便是拿到的socket.id
            let roomSockets = io.sockets.adapter.rooms[room].sockets
            Object.keys(roomSockets).forEach(socketId => {
              console.log('socketId', socketId)
              // 进行一个去重，在socketJson中只有对应唯一的socketId
              if (!socketJson[socketId]) {
                socketJson[socketId] = 1
              }
            })
          })
          // 遍历socketJson，在mySocket里找到对应的id，然后发送消息
          Object.keys(socketJson).forEach(socketId => {
            mySocket[socketId].emit('message', {
              user: username,
              color,
              content: msg,
              createAt: new Date().toLocaleString()
            })
          })
        }
        else {
          console.log('所有人')
          // 向所有用户发消息
          io.emit('message', {
            user: username,
            content: msg,
            color,
            createAt: new Date().toLocaleString()
          })
        }
      }
    } else { //用户名不存在
      // 第一次进入输入的内容作为用户名
      console.log(msg, '第一次')
      // 把socketObj对象上对应的用户名赋值为一个socket
      username = msg
      socketObj[username] = socket
      color = shuffle(userColor)[0]
      socket.broadcast.emit('message', {
        user: '系统提示',
        content: `${username}加入了聊天！`,
        createAt: new Date().toLocaleString()
      })
    }
    // 监听服务的发送的message事件
  })
  // ------------------------------- 房间相关 --------------------------
  // 加入
  socket.on('join', room => {
    // 判断是否已进入 没有让其进入
    if (username && rooms.indexOf(room) === -1) {
      console.log(`有人进入${room}`)
      socket.join(room)
      rooms.push(room)
      // 发送给前端已进入
      socket.emit('joined', room)
      // 通知自己
      socket.send({
        user: '系统提示',
        content: `你已加入${room}群组`,
        createAt: new Date().toDateString()
      })
    }
  })
  // 离开
  socket.on('leave', room => {
    console.log(`有人离开${room}`)
    let index = rooms.indexOf(room)
    // 判断是否已进入 没有让其进入
    if (index !== -1) {
      socket.leave(room)
      rooms.splice(index, 1)
      // 发送给前端已进入
      socket.emit('leaved', room)
      // 通知自己
      socket.send({
        user: '系统提示',
        content: `你已离开${room}群组`,
        createAt: new Date().toDateString()
      })
    }
  })
})
server.listen(4000);

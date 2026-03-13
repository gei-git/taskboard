package handler

import (
	"log"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
)

// upgrader：WebSocket 升级器（把普通 HTTP 请求升级成 WebSocket 长连接）
var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool { return true }, // 允许前端连接
}

// clients：全局 map，用来保存当前所有在线的 WebSocket 连接。
var clients = make(map[*websocket.Conn]bool) // 所有在线客户端

func HandleWebSocket(c *gin.Context) {
	conn, err := upgrader.Upgrade(c.Writer, c.Request, nil)
	if err != nil {
		log.Println("WebSocket 升级失败:", err)
		return
	}

	clients[conn] = true
	log.Println("新客户端连接成功")

	defer func() {
		delete(clients, conn)
		conn.Close()
	}()

	for {
		_, msg, err := conn.ReadMessage()
		if err != nil {
			break
		}
		// 广播给所有客户端（实时同步任务变化）
		for client := range clients {
			client.WriteMessage(websocket.TextMessage, msg)
		}
	}
}

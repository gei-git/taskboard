package handler

import (
	"log"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool { return true },
}

var clients = make(map[*websocket.Conn]bool)

func HandleWebSocket(c *gin.Context) {
	conn, err := upgrader.Upgrade(c.Writer, c.Request, nil)
	if err != nil {
		log.Println("WebSocket 升级失败:", err)
		return
	}

	clients[conn] = true
	log.Println("✅ 新客户端连接成功")

	defer func() {
		delete(clients, conn)
		conn.Close()
	}()

	for {
		// 读取前端发来的消息
		_, msg, err := conn.ReadMessage()
		if err != nil {
			break
		}

		// 关键修复：广播给**所有其他客户端**（包括自己）
		for client := range clients {
			if err := client.WriteMessage(websocket.TextMessage, msg); err != nil {
				client.Close()
				delete(clients, client)
			}
		}
	}
}

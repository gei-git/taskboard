package handler

import (
	"encoding/json"
	"log"
	"net/http"

	"github.com/gei-git/taskboard/internal/models"
	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool { return true },
}

var clients = make(map[*websocket.Conn]bool)

func HandleWebSocketWithDB(c *gin.Context, taskHandler *TaskHandler) {
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
		_, msg, err := conn.ReadMessage()
		if err != nil {
			break
		}

		// 解析任务列表并保存到数据库
		var tasks []models.Task
		json.Unmarshal(msg, &tasks)
		for _, t := range tasks {
			taskHandler.SaveTask(t)
		}

		// 广播给所有客户端
		for client := range clients {
			client.WriteMessage(websocket.TextMessage, msg)
		}
	}
}

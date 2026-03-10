package main

import (
	"log"

	"github.com/gei-git/taskboard/internal/config"
	"github.com/gin-gonic/gin"
)

func main() {
	cfg := config.LoadConfig()

	r := gin.Default()

	r.GET("/ping", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"message": "pong",
		})
	})

	log.Printf("🚀 TaskBoard Backend started on http://localhost:%s", cfg.Server.Port)
	r.Run(":" + cfg.Server.Port)
}

package main

import (
	"log"

	"github.com/gei-git/taskboard/internal/config"
	"github.com/gei-git/taskboard/internal/handler"
	"github.com/gei-git/taskboard/internal/models"
	"github.com/gin-gonic/gin"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

func main() {
	cfg := config.LoadConfig()

	// === 数据库连接 ===
	dsn := "host=" + cfg.DB.Host +
		" user=" + cfg.DB.User +
		" password=" + cfg.DB.Password +
		" dbname=" + cfg.DB.DBName +
		" port=" + cfg.DB.Port +
		" sslmode=disable TimeZone=Asia/Shanghai"

	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatalf("数据库连接失败: %v", err)
	}

	err = db.AutoMigrate(&models.User{})
	if err != nil {
		log.Fatalf("数据库迁移失败: %v", err)
	}

	log.Println("✅ Database connected and migrated successfully!")

	AuthHandler := handler.NewAuthHandler(db)

	r := gin.Default()

	r.GET("/ping", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"message": "pong",
		})
	})

	r.POST("/register", AuthHandler.Register)

	log.Printf("🚀 TaskBoard Backend started on http://localhost:%s", cfg.Server.Port)
	r.Run(":" + cfg.Server.Port)
}

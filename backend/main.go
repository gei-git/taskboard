package main

import (
	"log"

	"github.com/gei-git/taskboard/internal/config"
	"github.com/gei-git/taskboard/internal/handler"
	"github.com/gei-git/taskboard/internal/middleware"
	"github.com/gei-git/taskboard/internal/models"
	"github.com/gin-contrib/cors"
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

	err = db.AutoMigrate(&models.User{}, &models.Task{})
	if err != nil {
		log.Fatalf("数据库迁移失败: %v", err)
	}

	log.Println("✅ Database connected and migrated successfully!")

	AuthHandler := handler.NewAuthHandler(db)
	taskHandler := handler.NewTaskHandler(db)

	r := gin.Default()

	// ====================== CORS 配置（关键修复）=====================
	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:3000"}, // 前端地址
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
		MaxAge:           12 * 3600, // 12 小时缓存预检结果
	}))

	// 任务路由（受 JWT 保护）
	task := r.Group("/tasks")
	task.Use(middleware.JWTAuth()) // ← 需登录才能操作任务
	{
		task.GET("", taskHandler.GetAllTasks)
		task.POST("", taskHandler.CreateTask)
		task.PUT("/:id", taskHandler.UpdateTask)
		task.DELETE("/:id", taskHandler.DeleteTask)
	}

	r.GET("/ping", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"message": "pong",
		})
	})

	auth := r.Group("/auth")
	{
		auth.POST("/register", AuthHandler.Register)
		auth.POST("/login", AuthHandler.Login)
	}

	// 受保护的仪表盘路由
	// === 受保护的仪表盘路由 ===
	dashboard := r.Group("/dashboard")
	dashboard.Use(middleware.JWTAuth()) // ← 使用修复后的中间件
	{
		dashboard.GET("/profile", func(c *gin.Context) {
			c.JSON(200, gin.H{
				"message": "欢迎来到仪表盘！这是受保护的接口",
				"status":  "authenticated",
			})
		})
	}

	// WebSocket 路由（实时同步 + 数据库持久化）
	r.GET("/ws", func(c *gin.Context) {
		handler.HandleWebSocketWithDB(c, taskHandler)
	})

	log.Printf("🚀 TaskBoard Backend started on http://localhost:%s", cfg.Server.Port)
	r.Run(":" + cfg.Server.Port)
}

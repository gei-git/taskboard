package handler

import (
	"net/http"

	"github.com/gei-git/taskboard/internal/models"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type TaskHandler struct {
	DB *gorm.DB
}

func NewTaskHandler(db *gorm.DB) *TaskHandler {
	return &TaskHandler{DB: db}
}

// LoadTasks 加载所有任务（登录后调用）
func (h *TaskHandler) LoadTasks(c *gin.Context) {
	var tasks []models.Task
	h.DB.Order("order asc").Find(&tasks)
	c.JSON(http.StatusOK, tasks)
}

// SaveTask 更新或创建任务
func (h *TaskHandler) SaveTask(task models.Task) error {
	return h.DB.Save(&task).Error
}

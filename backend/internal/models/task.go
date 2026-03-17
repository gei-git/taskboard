package models

import "time"

type Task struct {
	ID        uint   `gorm:"primaryKey"`
	Title     string `gorm:"size:200;not null"`
	Status    string `gorm:"size:20;not null"` // todo / inprogress / done
	Order     int    `gorm:"default:0"`
	CreatedAt time.Time
	UpdatedAt time.Time
}

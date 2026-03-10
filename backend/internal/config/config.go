package config

import (
	"os"

	"github.com/joho/godotenv"
)

type Config struct {
	Server struct {
		Port string
	}
	DB struct {
		Host     string
		Port     string
		User     string
		Password string
		DBName   string
	}
	Redis struct {
		Host string
		Port string
	}
	JWT struct {
		Secret string
	}
}

func LoadConfig() *Config {
	_ = godotenv.Load()

	cfg := &Config{}

	cfg.Server.Port = getEnv("SERVER_PORT", "8080")
	cfg.DB.Host = getEnv("DB_HOST", "localhost")
	cfg.DB.Port = getEnv("DB_PORT", "5432")
	cfg.DB.User = getEnv("DB_USER", "taskboard")
	cfg.DB.Password = getEnv("DB_PASSWORD", "taskboard123")
	cfg.DB.DBName = getEnv("DB_NAME", "taskboard")
	cfg.Redis.Host = getEnv("REDIS_HOST", "localhost")
	cfg.Redis.Port = getEnv("REDIS_PORT", "6379")
	cfg.JWT.Secret = getEnv("JWT_SECRET", "super-secret-key-change-in-prod")

	return cfg
}

func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}

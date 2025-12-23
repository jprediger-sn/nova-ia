package services

import (
	"context"
	"fmt"
	"os"
	"sync"

	"github.com/jackc/pgx/v5/pgxpool"
)

var (
	dbPool *pgxpool.Pool
	dbOnce sync.Once
)

func GetDB() (*pgxpool.Pool, error) {
	var err error
	dbOnce.Do(func() {
		dbURL := os.Getenv("DATABASE_URL")
		if dbURL == "" {
			err = fmt.Errorf("DATABASE_URL not set")
			return
		}
		dbPool, err = pgxpool.New(context.Background(), dbURL)
	})
	return dbPool, err
}

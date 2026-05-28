CREATE DATABASE IF NOT EXISTS blog DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE blog;
CREATE TABLE IF NOT EXISTS articles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    content TEXT,
    summary VARCHAR(500),
    tags TEXT,
    category VARCHAR(50),
    views INT DEFAULT 0,
    status VARCHAR(20) DEFAULT 'published',
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP NULL
) DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
INSERT INTO articles (title, content, summary, tags, category) VALUES ('第一篇文章', '这是从 MySQL 读出来的数据', '测试摘要', '["MySQL", "教程"]', '技术');


CREATE TABLE  IF NOT EXISTS user(
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(500) NOT NULL,
    password VARCHAR(100) NOT NULL,
    nickname VARCHAR(50),
    bio TEXt,
    avatar VARCHAR(500),
    role VARCHAR(20) DEFAULT 'user',
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)

CREATE TABLE IF NOT EXISTS favorites(
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL,
    article_id INT NOT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_fav (username,article_id)
)
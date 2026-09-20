const statements = [
  `CREATE TABLE IF NOT EXISTS chat_sessions (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            title VARCHAR(200) NOT NULL DEFAULT '新对话',
            createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            KEY idx_user (user_id)
        ) DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,
  `CREATE TABLE IF NOT EXISTS chat_messages (
            id INT AUTO_INCREMENT PRIMARY KEY,
            session_id INT NOT NULL,
            user_id INT NOT NULL,
            role VARCHAR(20) NOT NULL,
            content TEXT NOT NULL,
            sources JSON NULL,
            createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            KEY idx_session (session_id),
            KEY idx_user (user_id)
        ) DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,
  `CREATE TABLE IF NOT EXISTS memories (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            category VARCHAR(50) NOT NULL,
            content TEXT NOT null,
            weight DECIMAL(3,2) DEFAULT 0.50,
            status VARCHAR(20) DEFAULT 'active',
            source_message_id INT NULL,
            createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            KEY idx_user (user_id)
    ) DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,
  `CREATE TABLE IF NOT EXISTS memory_revisions(
        id INT AUTO_INCREMENT PRIMARY KEY,
        memory_id INT NOT NULL,
        old_content TEXT,
        new_content TEXT,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,
  `CREATE TABLE IF NOT EXISTS memory_reviews (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        period VARCHAR(20) NOT NULL,
        content MEDIUMTEXT,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY uk_user_period (user_id, period)
    ) DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,
  `CREATE TABLE IF NOT EXISTS interviews (
        id INT AUTO_INCREMENT PRIMARY KEY,
        company VARCHAR(100) NOT NULL,
        company_public VARCHAR(100) NOT NULL,
        position VARCHAR(100) NOT NULL,
        channel VARCHAR(50),
        result VARCHAR(20) DEFAULT 'ongoing',
        interview_date DATE NULL,
        tags TEXT,
        questions MEDIUMTEXT,
        content MEDIUMTEXT,
        views INT DEFAULT 0,
        status VARCHAR(20) DEFAULT 'published',
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        KEY idx_date (interview_date),
        KEY idx_status (status)
    ) DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,
]

// 自动建表（幂等：只在表不存在时创建，不影响已有数据）
async function initSchema(db) {
  for (const sql of statements) {
    try {
      await db.promise().query(sql)
    } catch (err) {
      console.error('初始化数据表失败:', err.message)
    }
  }
}

module.exports = { statements, initSchema }

require('dotenv').config()
const mysql = require('mysql2/promise')

const schema = String.raw`
-- AKUN & PROGRES PEMAIN

CREATE TABLE users (
  id INT NOT NULL AUTO_INCREMENT,
  uid VARCHAR(128) NOT NULL,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255),
  provider VARCHAR(20) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE (uid),
  UNIQUE (email)
);

CREATE TABLE stages (
  id INT NOT NULL AUTO_INCREMENT,
  title VARCHAR(100) NOT NULL,
  subtitle VARCHAR(150),
  color VARCHAR(9),
  PRIMARY KEY (id)
);

CREATE TABLE user_progress (
  user_id INT NOT NULL,
  hearts INT NOT NULL DEFAULT 3,
  xp INT NOT NULL DEFAULT 0,
  streak3 BOOLEAN NOT NULL DEFAULT FALSE,
  position_stage_id INT NOT NULL DEFAULT 1,
  position_step VARCHAR(10) NOT NULL DEFAULT 'materi',
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (position_stage_id) REFERENCES stages(id)
);

-- KONTEN BELAJAR

CREATE TABLE materi (
  id INT NOT NULL AUTO_INCREMENT,
  stage_id INT NOT NULL,
  order_no INT NOT NULL,
  title VARCHAR(150) NOT NULL,
  body TEXT NOT NULL,
  code TEXT,
  tip TEXT,
  PRIMARY KEY (id),
  UNIQUE (stage_id, order_no),
  FOREIGN KEY (stage_id) REFERENCES stages(id) ON DELETE CASCADE
);

CREATE TABLE materi_summary (
  id INT NOT NULL AUTO_INCREMENT,
  materi_id INT NOT NULL,
  order_no INT NOT NULL,
  content VARCHAR(500) NOT NULL,
  PRIMARY KEY (id),
  FOREIGN KEY (materi_id) REFERENCES materi(id) ON DELETE CASCADE
);

CREATE TABLE memory_sims (
  id INT NOT NULL AUTO_INCREMENT,
  materi_id INT NOT NULL,
  title VARCHAR(150) NOT NULL,
  PRIMARY KEY (id),
  UNIQUE (materi_id),
  FOREIGN KEY (materi_id) REFERENCES materi(id) ON DELETE CASCADE
);

CREATE TABLE sim_steps (
  id INT NOT NULL AUTO_INCREMENT,
  sim_id INT NOT NULL,
  step_no INT NOT NULL,
  code_line INT,
  description TEXT NOT NULL,
  output TEXT,
  PRIMARY KEY (id),
  FOREIGN KEY (sim_id) REFERENCES memory_sims(id) ON DELETE CASCADE
);

CREATE TABLE sim_boxes (
  id INT NOT NULL AUTO_INCREMENT,
  step_id INT NOT NULL,
  name VARCHAR(50) NOT NULL,
  value VARCHAR(100),
  prev_value VARCHAR(100),
  data_type VARCHAR(30),
  is_updated BOOLEAN NOT NULL DEFAULT FALSE,
  PRIMARY KEY (id),
  FOREIGN KEY (step_id) REFERENCES sim_steps(id) ON DELETE CASCADE
);

CREATE TABLE levels (
  id INT NOT NULL AUTO_INCREMENT,
  code VARCHAR(10) NOT NULL,
  label VARCHAR(20) NOT NULL,
  bg_color VARCHAR(9),
  PRIMARY KEY (id),
  UNIQUE (code)
);

CREATE TABLE concepts (
  id INT NOT NULL AUTO_INCREMENT,
  stage_id INT NOT NULL,
  name VARCHAR(100) NOT NULL,
  PRIMARY KEY (id),
  UNIQUE (stage_id, name),
  FOREIGN KEY (stage_id) REFERENCES stages(id) ON DELETE CASCADE
);

CREATE TABLE questions (
  id INT NOT NULL AUTO_INCREMENT,
  code VARCHAR(10) NOT NULL,
  stage_id INT NOT NULL,
  level_id INT NOT NULL,
  concept_id INT NOT NULL,
  type VARCHAR(10) NOT NULL,
  prompt TEXT NOT NULL,
  code_snippet TEXT,
  hint TEXT,
  explanation TEXT,
  PRIMARY KEY (id),
  UNIQUE (code),
  FOREIGN KEY (stage_id) REFERENCES stages(id) ON DELETE CASCADE,
  FOREIGN KEY (level_id) REFERENCES levels(id),
  FOREIGN KEY (concept_id) REFERENCES concepts(id)
);

CREATE TABLE question_options (
  id INT NOT NULL AUTO_INCREMENT,
  question_id INT NOT NULL,
  option_no INT NOT NULL,
  text VARCHAR(500) NOT NULL,
  is_correct BOOLEAN NOT NULL DEFAULT FALSE,
  PRIMARY KEY (id),
  UNIQUE (question_id, option_no),
  FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE
);

CREATE TABLE question_pieces (
  id INT NOT NULL AUTO_INCREMENT,
  question_id INT NOT NULL,
  piece_no INT NOT NULL,
  text VARCHAR(300) NOT NULL,
  PRIMARY KEY (id),
  UNIQUE (question_id, piece_no),
  FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE
);

CREATE TABLE question_slots (
  id INT NOT NULL AUTO_INCREMENT,
  question_id INT NOT NULL,
  slot_no INT NOT NULL,
  label VARCHAR(300) NOT NULL,
  correct_piece_id INT NOT NULL,
  PRIMARY KEY (id),
  UNIQUE (question_id, slot_no),
  FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE,
  FOREIGN KEY (correct_piece_id) REFERENCES question_pieces(id)
);

-- HASIL BELAJAR PEMAIN

CREATE TABLE stage_completions (
  user_id INT NOT NULL,
  stage_id INT NOT NULL,
  best_score INT NOT NULL,
  perfect BOOLEAN NOT NULL DEFAULT FALSE,
  completed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, stage_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (stage_id) REFERENCES stages(id)
);

CREATE TABLE user_weak_concepts (
  user_id INT NOT NULL,
  concept_id INT NOT NULL,
  PRIMARY KEY (user_id, concept_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (concept_id) REFERENCES concepts(id) ON DELETE CASCADE
);

CREATE TABLE quiz_history (
  id INT NOT NULL AUTO_INCREMENT,
  user_id INT NOT NULL,
  stage_id INT,
  title VARCHAR(150) NOT NULL,
  score INT,
  xp_earned INT NOT NULL DEFAULT 0,
  is_game_over BOOLEAN NOT NULL DEFAULT FALSE,
  played_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (stage_id) REFERENCES stages(id) ON DELETE SET NULL
);

CREATE TABLE badges (
  id INT NOT NULL AUTO_INCREMENT,
  code VARCHAR(20) NOT NULL,
  title VARCHAR(100) NOT NULL,
  description VARCHAR(255),
  icon VARCHAR(40),
  color VARCHAR(9),
  PRIMARY KEY (id),
  UNIQUE (code)
);

CREATE TABLE user_badges (
  user_id INT NOT NULL,
  badge_id INT NOT NULL,
  unlocked_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, badge_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (badge_id) REFERENCES badges(id) ON DELETE CASCADE
);
`

async function createTables() {
    let connection

    try {
        const dbName = process.env.DB_NAME || 'otakatik'

        if (!/^[a-zA-Z0-9_]+$/.test(dbName)) {
            throw new Error('Nama database tidak valid.')
        }

        connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            port: Number(process.env.DB_PORT || 3306),
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
        })

        await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\``)

        await connection.changeUser({ database: dbName })

        // Hilangkan komentar SQL dan pisahkan setiap statement.
        const statements = schema
            .replace(/^\s*--.*$/gm, '')
            .split(';')
            .map((sql) => sql.trim())
            .filter((sql) => /^CREATE\s+TABLE\b/i.test(sql))
            .map((sql) => sql.replace(/^CREATE\s+TABLE\b/i, 'CREATE TABLE IF NOT EXISTS'))

        for (const sql of statements) {
            const match = sql.match(/CREATE\s+TABLE\s+IF\s+NOT\s+EXISTS\s+(\w+)/i)

            await connection.query(sql)
            console.log(`✓ Tabel ${match[1]} siap`)
        }

        console.log(`\nSelesai! ${statements.length} tabel diproses di database ${dbName}.`)
    } catch (error) {
        console.error('\nGagal membuat tabel:', error.message)
        process.exitCode = 1
    } finally {
        if (connection) {
            await connection.end()
        }
    }
}

createTables()

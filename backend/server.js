require('dotenv').config()
const http = require('http')
const { URL } = require('url')
const mysql = require('mysql2/promise')

const PORT = Number(process.env.API_PORT || 3001)
const DB_NAME = process.env.DB_NAME || 'otakatik'

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
})

function sendJson(res, status, data) {
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  })
  res.end(JSON.stringify(data))
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let raw = ''
    req.on('data', (chunk) => {
      raw += chunk
    })
    req.on('end', () => {
      if (!raw) return resolve({})
      try {
        resolve(JSON.parse(raw))
      } catch (e) {
        reject(new Error('Format JSON tidak valid'))
      }
    })
    req.on('error', reject)
  })
}

async function ensureUser(email, name, uid, provider = 'mysql', password = null) {
  const cleanEmail = String(email || '').trim().toLowerCase()
  const cleanName = String(name || cleanEmail.split('@')[0] || 'Teman').trim()
  const cleanUid = uid || `mysql_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`

  const [existing] = await pool.query(`SELECT * FROM users WHERE email = ?`, [cleanEmail])
  if (existing.length > 0) {
    return existing[0]
  }

  const [res] = await pool.query(
    `INSERT INTO users (uid, name, email, password_hash, provider) VALUES (?, ?, ?, ?, ?)`,
    [cleanUid, cleanName, cleanEmail, password, provider]
  )
  const userId = res.insertId

  await pool.query(
    `INSERT IGNORE INTO user_progress (user_id, hearts, xp, streak3, position_stage_id, position_step)
     VALUES (?, 3, 0, FALSE, 1, 'materi')`,
    [userId]
  )

  const [[created]] = await pool.query(`SELECT * FROM users WHERE id = ?`, [userId])
  return created
}

async function getProgressByUserId(userId) {
  const [[prog]] = await pool.query(`SELECT * FROM user_progress WHERE user_id = ?`, [userId])
  const [compRows] = await pool.query(`SELECT * FROM stage_completions WHERE user_id = ?`, [userId])
  const [weakRows] = await pool.query(
    `SELECT c.name FROM user_weak_concepts uw JOIN concepts c ON c.id = uw.concept_id WHERE uw.user_id = ?`,
    [userId]
  )
  const [histRows] = await pool.query(
    `SELECT id, title, score, xp_earned, is_game_over, UNIX_TIMESTAMP(played_at) * 1000 AS at_ms
     FROM quiz_history WHERE user_id = ? ORDER BY played_at DESC LIMIT 30`,
    [userId]
  )

  if (!prog) return null

  const completed = {}
  for (const row of compRows) {
    completed[row.stage_id] = {
      score: row.best_score,
      perfect: !!row.perfect,
      tiers: { mudah: true },
    }
  }

  return {
    hearts: prog.hearts,
    xp: prog.xp,
    streak3: !!prog.streak3,
    position: {
      stageId: prog.position_stage_id || 1,
      step: prog.position_step || 'materi',
    },
    completed,
    weak: weakRows.map((r) => r.name),
    history: histRows.map((h) => ({
      id: String(h.id),
      title: h.title,
      score: h.score,
      xp: h.xp_earned,
      over: !!h.is_game_over,
      at: Number(h.at_ms) || Date.now(),
    })),
  }
}

const server = http.createServer(async (req, res) => {
  if (req.method === 'OPTIONS') {
    return sendJson(res, 200, { ok: true })
  }

  const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`)
  const pathname = parsedUrl.pathname

  try {
    // 1. Cek kesehatan koneksi database
    if (req.method === 'GET' && pathname === '/api/health') {
      const [[row]] = await pool.query(`SELECT COUNT(*) AS totalUsers FROM users`)
      return sendJson(res, 200, { ok: true, database: DB_NAME, totalUsers: row.totalUsers })
    }

    // 2. Register akun baru ke MySQL
    if (req.method === 'POST' && pathname === '/api/auth/register') {
      const { name, email, password } = await readBody(req)
      const cleanEmail = String(email || '').trim().toLowerCase()
      if (!cleanEmail) return sendJson(res, 400, { error: 'Email wajib diisi.' })

      const [existing] = await pool.query(`SELECT id FROM users WHERE email = ?`, [cleanEmail])
      if (existing.length > 0) {
        return sendJson(res, 409, { error: 'Email ini sudah terdaftar di database. Silakan masuk.' })
      }

      const userRow = await ensureUser(cleanEmail, name, `mysql_${Date.now()}`, 'mysql', password || '')
      return sendJson(res, 201, {
        user: {
          id: userRow.id,
          uid: userRow.uid,
          name: userRow.name,
          email: userRow.email,
          provider: 'mysql',
        },
      })
    }

    // 3. Login akun dari MySQL
    if (req.method === 'POST' && pathname === '/api/auth/login') {
      const { email, password, name, provider } = await readBody(req)
      const cleanEmail = String(email || '').trim().toLowerCase()
      if (!cleanEmail) return sendJson(res, 400, { error: 'Email wajib diisi.' })

      const [rows] = await pool.query(`SELECT * FROM users WHERE email = ?`, [cleanEmail])
      if (rows.length > 0) {
        const u = rows[0]
        if (provider !== 'google' && u.password_hash && password && u.password_hash !== password) {
          return sendJson(res, 401, { error: 'Kata sandi yang kamu masukkan kurang tepat.' })
        }
        return sendJson(res, 200, {
          user: {
            id: u.id,
            uid: u.uid,
            name: u.name,
            email: u.email,
            provider: 'mysql',
          },
        })
      }

      // Bila login pertama kali di mode demo/Google, otomatis daftarkan ke MySQL
      const created = await ensureUser(cleanEmail, name, `mysql_${Date.now()}`, provider || 'mysql', password || '')
      return sendJson(res, 200, {
        user: {
          id: created.id,
          uid: created.uid,
          name: created.name,
          email: created.email,
          provider: 'mysql',
        },
      })
    }

    // 4. Ambil progres pemain dari MySQL
    if (req.method === 'GET' && pathname === '/api/progress') {
      const email = String(parsedUrl.searchParams.get('email') || '').trim().toLowerCase()
      if (!email) return sendJson(res, 400, { error: 'Parameter email diperlukan.' })

      const [rows] = await pool.query(`SELECT id FROM users WHERE email = ?`, [email])
      if (rows.length === 0) return sendJson(res, 404, { progress: null })

      const progress = await getProgressByUserId(rows[0].id)
      return sendJson(res, 200, { progress })
    }

    // 5. Simpan / sinkronkan progres pemain ke MySQL
    if (req.method === 'POST' && pathname === '/api/progress') {
      const { user, state } = await readBody(req)
      if (!user || !user.email || !state) {
        return sendJson(res, 400, { error: 'Data user dan state diperlukan.' })
      }

      const userRow = await ensureUser(user.email, user.name, user.uid, user.provider || 'mysql')
      const userId = userRow.id
      const stageId = Math.max(1, Math.min(3, Number(state.position?.stageId || 1)))
      const step = state.position?.step === 'quiz' ? 'quiz' : 'materi'

      await pool.query(
        `INSERT INTO user_progress (user_id, hearts, xp, streak3, position_stage_id, position_step, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
         ON DUPLICATE KEY UPDATE
           hearts = VALUES(hearts),
           xp = GREATEST(xp, VALUES(xp)),
           streak3 = (streak3 OR VALUES(streak3)),
           position_stage_id = VALUES(position_stage_id),
           position_step = VALUES(position_step),
           updated_at = CURRENT_TIMESTAMP`,
        [userId, Number(state.hearts ?? 3), Number(state.xp ?? 0), !!state.streak3, stageId, step]
      )

      // Simpan stage_completions
      const completed = state.completed || {}
      for (const [stIdStr, info] of Object.entries(completed)) {
        const stId = Number(stIdStr)
        if (stId >= 1 && stId <= 3 && info) {
          await pool.query(
            `INSERT INTO stage_completions (user_id, stage_id, best_score, perfect)
             VALUES (?, ?, ?, ?)
             ON DUPLICATE KEY UPDATE
               best_score = GREATEST(best_score, VALUES(best_score)),
               perfect = (perfect OR VALUES(perfect))`,
            [userId, stId, Number(info.score || 0), !!info.perfect]
          )
        }
      }

      // Simpan user_weak_concepts
      if (Array.isArray(state.weak)) {
        await pool.query(`DELETE FROM user_weak_concepts WHERE user_id = ?`, [userId])
        for (const conceptName of state.weak) {
          const [cRows] = await pool.query(`SELECT id FROM concepts WHERE name = ? LIMIT 1`, [conceptName])
          if (cRows.length > 0) {
            await pool.query(
              `INSERT IGNORE INTO user_weak_concepts (user_id, concept_id) VALUES (?, ?)`,
              [userId, cRows[0].id]
            )
          }
        }
      }

      // Simpan riwayat kuis terbaru bila belum tercatat
      if (Array.isArray(state.history) && state.history.length > 0) {
        const latest = state.history[0]
        const [[existingHist]] = await pool.query(
          `SELECT COUNT(*) AS cnt FROM quiz_history WHERE user_id = ?`,
          [userId]
        )
        if (existingHist.cnt < state.history.length && latest && latest.title) {
          await pool.query(
            `INSERT INTO quiz_history (user_id, stage_id, title, score, xp_earned, is_game_over)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [
              userId,
              stageId,
              latest.title,
              latest.score ?? null,
              Number(latest.xp || 0),
              !!latest.over,
            ]
          )
        }
      }

      // Simpan lencana (user_badges) yang terbuka
      const badgeChecks = {
        streak3: !!state.streak3,
        stage1: !!completed[1],
        perfect: Object.values(completed).some((c) => c && c.perfect),
        level5: Math.floor(Number(state.xp || 0) / 100) + 1 >= 5,
        tipe: (completed[2]?.score || 0) >= 80,
        ifelse: (completed[3]?.score || 0) >= 80,
      }
      for (const [code, unlocked] of Object.entries(badgeChecks)) {
        if (unlocked) {
          const [bRows] = await pool.query(`SELECT id FROM badges WHERE code = ?`, [code])
          if (bRows.length > 0) {
            await pool.query(
              `INSERT IGNORE INTO user_badges (user_id, badge_id) VALUES (?, ?)`,
              [userId, bRows[0].id]
            )
          }
        }
      }

      return sendJson(res, 200, { ok: true })
    }

    // 6. Ambil daftar Peringkat (Leaderboard) langsung dari MySQL
    if (req.method === 'GET' && pathname === '/api/leaderboard') {
      const [rows] = await pool.query(
        `SELECT u.id, u.name, u.email, COALESCE(up.xp, 0) AS xp
         FROM users u
         LEFT JOIN user_progress up ON up.user_id = u.id
         ORDER BY xp DESC, u.id ASC
         LIMIT 25`
      )
      return sendJson(res, 200, { leaderboard: rows })
    }

    return sendJson(res, 404, { error: 'Endpoint tidak ditemukan' })
  } catch (err) {
    console.error('API Error:', err.message)
    return sendJson(res, 500, { error: err.message || 'Terjadi kesalahan pada server' })
  }
})

server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server API MySQL OtakAtik berjalan di http://0.0.0.0:${PORT}`)
})

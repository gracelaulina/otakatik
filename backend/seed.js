require('dotenv').config()
const fs = require('fs')
const path = require('path')
const vm = require('vm')
const mysql = require('mysql2/promise')

// Muat data langsung dari src/data/content.js (konversi ES module export ke CommonJS)
function loadFrontendContent() {
  const filePath = path.join(__dirname, '..', 'src', 'data', 'content.js')
  const raw = fs.readFileSync(filePath, 'utf8')
  const transformed = raw
    .replace(/export\s+const\s+LEVELS\s*=/g, 'exports.LEVELS =')
    .replace(/export\s+const\s+STAGES\s*=/g, 'exports.STAGES =')
    .replace(/export\s+const\s+flattenStage\s*=/g, 'exports.flattenStage =')
  const sandbox = { exports: {} }
  vm.runInNewContext(transformed, sandbox)
  return sandbox.exports
}

const BADGES_SEED = [
  { code: 'streak3', title: 'Beruntun 3x', desc: 'Jawaban beruntun 3 kali', icon: 'star', color: '#FDE0A5' },
  { code: 'stage1', title: 'Stage 1 Tuntas', desc: 'Menyelesaikan Stage 1', icon: 'ribbon', color: '#FCDDF0' },
  { code: 'perfect', title: 'Tanpa Salah', desc: 'Menyelesaikan stage tanpa salah', icon: 'shield-checkmark', color: '#E4DCFC' },
  { code: 'level5', title: 'Level 5', desc: 'Mencapai Level 5', icon: 'rocket', color: '#DCEEFF' },
  { code: 'tipe', title: 'Master Tipe Data', desc: 'Skor 80+ di Stage 2', icon: 'cube', color: '#DFF7EA' },
  { code: 'ifelse', title: 'Master If-Else', desc: 'Skor 80+ di Stage 3', icon: 'git-branch', color: '#FFE3E6' },
]

const DEMO_USERS = [
  { uid: 'seed_grace', name: 'Grace', email: 'grace@otakatik.id', xp: 340, stageId: 3 },
  { uid: 'seed_ayu', name: 'Ayu', email: 'ayu@otakatik.id', xp: 280, stageId: 3 },
  { uid: 'seed_dhea', name: 'Dhea', email: 'dhea@otakatik.id', xp: 210, stageId: 2 },
  { uid: 'seed_faris', name: 'Faris', email: 'faris@otakatik.id', xp: 150, stageId: 2 },
  { uid: 'seed_nadia', name: 'Nadia', email: 'nadia@otakatik.id', xp: 90, stageId: 1 },
]

async function seedDatabase() {
  const { LEVELS, STAGES } = loadFrontendContent()
  const dbName = process.env.DB_NAME || 'otakatik'

  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: dbName,
  })

  try {
    console.log(`Mulai mengisi data awal (seed) ke database "${dbName}"...`)

    // 1. Levels
    const levelMap = {}
    for (const lv of LEVELS) {
      await conn.query(
        `INSERT INTO levels (code, label, bg_color) VALUES (?, ?, ?)
         ON DUPLICATE KEY UPDATE label = VALUES(label), bg_color = VALUES(bg_color)`,
        [lv.key, lv.label, lv.bg]
      )
      const [rows] = await conn.query(`SELECT id FROM levels WHERE code = ?`, [lv.key])
      levelMap[lv.key] = rows[0].id
    }
    console.log(`✓ ${LEVELS.length} tingkat kesulitan (levels) terisi`)

    // 2. Badges
    for (const b of BADGES_SEED) {
      await conn.query(
        `INSERT INTO badges (code, title, description, icon, color) VALUES (?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE title = VALUES(title), description = VALUES(description), icon = VALUES(icon), color = VALUES(color)`,
        [b.code, b.title, b.desc, b.icon, b.color]
      )
    }
    console.log(`✓ ${BADGES_SEED.length} lencana (badges) terisi`)

    // 3. Stages, Materi, Memory Sims, Concepts, Questions
    let materiCount = 0
    let questionCount = 0

    for (const st of STAGES) {
      await conn.query(
        `INSERT INTO stages (id, title, subtitle, color) VALUES (?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE title = VALUES(title), subtitle = VALUES(subtitle), color = VALUES(color)`,
        [st.id, st.title, st.subtitle, st.color]
      )

      // Materi per stage
      for (let i = 0; i < st.materi.length; i++) {
        const m = st.materi[i]
        const orderNo = i + 1
        await conn.query(
          `INSERT INTO materi (stage_id, order_no, title, body, code, tip)
           VALUES (?, ?, ?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE title = VALUES(title), body = VALUES(body), code = VALUES(code), tip = VALUES(tip)`,
          [st.id, orderNo, m.title, m.body, m.code || null, m.tip || null]
        )
        const [[materiRow]] = await conn.query(
          `SELECT id FROM materi WHERE stage_id = ? AND order_no = ?`,
          [st.id, orderNo]
        )
        const materiId = materiRow.id
        materiCount++

        // Ringkasan materi (summary)
        if (Array.isArray(m.summary)) {
          await conn.query(`DELETE FROM materi_summary WHERE materi_id = ?`, [materiId])
          for (let sIdx = 0; sIdx < m.summary.length; sIdx++) {
            await conn.query(
              `INSERT INTO materi_summary (materi_id, order_no, content) VALUES (?, ?, ?)`,
              [materiId, sIdx + 1, m.summary[sIdx]]
            )
          }
        }

        // Simulasi memori (memory_sims, sim_steps, sim_boxes)
        if (m.sim) {
          await conn.query(
            `INSERT INTO memory_sims (materi_id, title) VALUES (?, ?)
             ON DUPLICATE KEY UPDATE title = VALUES(title)`,
            [materiId, m.sim.title]
          )
          const [[simRow]] = await conn.query(
            `SELECT id FROM memory_sims WHERE materi_id = ?`,
            [materiId]
          )
          const simId = simRow.id
          await conn.query(`DELETE FROM sim_steps WHERE sim_id = ?`, [simId])

          for (let stepIdx = 0; stepIdx < (m.sim.steps || []).length; stepIdx++) {
            const step = m.sim.steps[stepIdx]
            const [stepRes] = await conn.query(
              `INSERT INTO sim_steps (sim_id, step_no, code_line, description, output)
               VALUES (?, ?, ?, ?, ?)`,
              [simId, stepIdx + 1, step.line ?? null, step.desc, step.output || null]
            )
            const stepId = stepRes.insertId
            for (const box of step.boxes || []) {
              await conn.query(
                `INSERT INTO sim_boxes (step_id, name, value, prev_value, data_type, is_updated)
                 VALUES (?, ?, ?, ?, ?, ?)`,
                [
                  stepId,
                  box.name,
                  box.value ?? null,
                  box.prevValue ?? null,
                  box.type ?? null,
                  !!box.updated,
                ]
              )
            }
          }
        }
      }

      // Questions per level in stage
      for (const lvKey of Object.keys(st.questions || {})) {
        const levelId = levelMap[lvKey]
        for (const q of st.questions[lvKey]) {
          // Pastikan concept ada
          await conn.query(
            `INSERT INTO concepts (stage_id, name) VALUES (?, ?)
             ON DUPLICATE KEY UPDATE name = VALUES(name)`,
            [st.id, q.concept]
          )
          const [[conceptRow]] = await conn.query(
            `SELECT id FROM concepts WHERE stage_id = ? AND name = ?`,
            [st.id, q.concept]
          )

          await conn.query(
            `INSERT INTO questions (code, stage_id, level_id, concept_id, type, prompt, code_snippet, hint, explanation)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
             ON DUPLICATE KEY UPDATE
               stage_id = VALUES(stage_id),
               level_id = VALUES(level_id),
               concept_id = VALUES(concept_id),
               type = VALUES(type),
               prompt = VALUES(prompt),
               code_snippet = VALUES(code_snippet),
               hint = VALUES(hint),
               explanation = VALUES(explanation)`,
            [
              q.id,
              st.id,
              levelId,
              conceptRow.id,
              q.type,
              q.prompt,
              q.code || null,
              q.hint || null,
              q.explanation || null,
            ]
          )
          const [[qRow]] = await conn.query(`SELECT id FROM questions WHERE code = ?`, [q.id])
          const questionId = qRow.id
          questionCount++

          if (q.type === 'choice' && Array.isArray(q.options)) {
            await conn.query(`DELETE FROM question_options WHERE question_id = ?`, [questionId])
            for (let optIdx = 0; optIdx < q.options.length; optIdx++) {
              await conn.query(
                `INSERT INTO question_options (question_id, option_no, text, is_correct)
                 VALUES (?, ?, ?, ?)`,
                [questionId, optIdx, q.options[optIdx], optIdx === q.answer]
              )
            }
          } else if (q.type === 'match' && Array.isArray(q.pieces)) {
            await conn.query(`DELETE FROM question_slots WHERE question_id = ?`, [questionId])
            await conn.query(`DELETE FROM question_pieces WHERE question_id = ?`, [questionId])

            const pieceIdByNo = {}
            for (let pIdx = 0; pIdx < q.pieces.length; pIdx++) {
              const [pRes] = await conn.query(
                `INSERT INTO question_pieces (question_id, piece_no, text) VALUES (?, ?, ?)`,
                [questionId, pIdx, q.pieces[pIdx]]
              )
              pieceIdByNo[pIdx] = pRes.insertId
            }

            for (let sIdx = 0; sIdx < (q.slots || []).length; sIdx++) {
              const correctPieceIdx = q.answer[sIdx]
              await conn.query(
                `INSERT INTO question_slots (question_id, slot_no, label, correct_piece_id)
                 VALUES (?, ?, ?, ?)`,
                [questionId, sIdx, q.slots[sIdx], pieceIdByNo[correctPieceIdx]]
              )
            }
          }
        }
      }
    }
    console.log(`✓ ${STAGES.length} stage, ${materiCount} materi + simulasi, dan ${questionCount} soal kuis terisi`)

    // 4. Demo Users untuk Leaderboard Kelas
    for (const u of DEMO_USERS) {
      await conn.query(
        `INSERT INTO users (uid, name, email, password_hash, provider)
         VALUES (?, ?, ?, ?, 'seed')
         ON DUPLICATE KEY UPDATE name = VALUES(name)`,
        [u.uid, u.name, u.email, 'otakatik123']
      )
      const [[userRow]] = await conn.query(`SELECT id FROM users WHERE email = ?`, [u.email])
      await conn.query(
        `INSERT INTO user_progress (user_id, hearts, xp, streak3, position_stage_id, position_step)
         VALUES (?, 3, ?, TRUE, ?, 'materi')
         ON DUPLICATE KEY UPDATE xp = GREATEST(xp, VALUES(xp))`,
        [userRow.id, u.xp, u.stageId]
      )
    }
    console.log(`✓ ${DEMO_USERS.length} akun siswa awal untuk Peringkat (Leaderboard) terisi`)
    console.log('\nSelesai! Seluruh 19 tabel MySQL kini sudah memiliki data lengkap.')
  } finally {
    await conn.end()
  }
}

seedDatabase().catch((err) => {
  console.error('Gagal melakukan seed database:', err)
  process.exitCode = 1
})

import express from 'express';
import { db } from './db.js';
import { requireAuth } from './auth.js';
import { mirrorResponseToSheet } from './sheets.js';

const router = express.Router();

// 설문 목록 (공개된 것만)
router.get('/', requireAuth, (req, res) => {
  const rows = db.prepare(`
    SELECT s.id, s.title, s.description, s.closes_at, s.created_at,
           u.name AS author_name,
           (SELECT COUNT(*) FROM responses WHERE survey_id = s.id) AS response_count,
           EXISTS(SELECT 1 FROM responses WHERE survey_id = s.id AND user_id = ?) AS has_responded
    FROM surveys s JOIN users u ON u.id = s.author_id
    WHERE s.is_public = 1
    ORDER BY s.created_at DESC
  `).all(req.user.id);
  res.json({ surveys: rows });
});

// 설문 상세 (질문 + 옵션)
router.get('/:id', requireAuth, (req, res) => {
  const id = Number(req.params.id);
  const survey = db.prepare(`
    SELECT s.*, u.name AS author_name
    FROM surveys s JOIN users u ON u.id = s.author_id
    WHERE s.id = ?
  `).get(id);
  if (!survey) return res.status(404).json({ error: 'not_found' });
  if (!survey.is_public && survey.author_id !== req.user.id) {
    return res.status(403).json({ error: 'forbidden' });
  }

  const questions = db.prepare(`
    SELECT id, ord, type, body, is_required FROM questions WHERE survey_id = ? ORDER BY ord
  `).all(id);

  const optionsByQ = {};
  if (questions.length) {
    const qIds = questions.map(q => q.id);
    const placeholders = qIds.map(() => '?').join(',');
    const opts = db.prepare(
      `SELECT id, question_id, ord, label FROM question_options WHERE question_id IN (${placeholders}) ORDER BY question_id, ord`
    ).all(...qIds);
    opts.forEach(o => {
      (optionsByQ[o.question_id] ||= []).push({ id: o.id, ord: o.ord, label: o.label });
    });
  }

  const hasResponded = !!db.prepare(
    'SELECT 1 FROM responses WHERE survey_id = ? AND user_id = ?'
  ).get(id, req.user.id);

  res.json({
    survey: { id: survey.id, title: survey.title, description: survey.description,
              author_name: survey.author_name, closes_at: survey.closes_at,
              is_author: survey.author_id === req.user.id },
    questions: questions.map(q => ({ ...q, options: optionsByQ[q.id] || [] })),
    has_responded: hasResponded,
  });
});

// 응답 제출
router.post('/:id/responses', requireAuth, (req, res) => {
  const surveyId = Number(req.params.id);
  const { answers } = req.body || {};
  if (!Array.isArray(answers)) return res.status(400).json({ error: 'answers_array_required' });

  const survey = db.prepare('SELECT * FROM surveys WHERE id = ?').get(surveyId);
  if (!survey) return res.status(404).json({ error: 'not_found' });
  if (!survey.is_public) return res.status(403).json({ error: 'forbidden' });
  if (survey.closes_at && new Date(survey.closes_at) < new Date()) {
    return res.status(410).json({ error: 'closed' });
  }

  // 기존 응답 체크
  const existing = db.prepare('SELECT id FROM responses WHERE survey_id = ? AND user_id = ?').get(surveyId, req.user.id);
  if (existing) return res.status(409).json({ error: 'already_responded' });

  // 질문 + 옵션 로드
  const questions = db.prepare('SELECT * FROM questions WHERE survey_id = ?').all(surveyId);
  const qById = Object.fromEntries(questions.map(q => [q.id, q]));
  const validOptions = {};
  questions.forEach(q => {
    const opts = db.prepare('SELECT id FROM question_options WHERE question_id = ?').all(q.id);
    validOptions[q.id] = new Set(opts.map(o => o.id));
  });

  // 타입별 검증
  const answersByQ = {};
  for (const a of answers) {
    const q = qById[a.question_id];
    if (!q) return res.status(422).json({ error: 'unknown_question', question_id: a.question_id });
    answersByQ[q.id] = a;

    if (q.type === 'single') {
      if (!Array.isArray(a.selected_option_ids) || a.selected_option_ids.length !== 1) {
        return res.status(422).json({ error: 'single_requires_one_option', question_id: q.id });
      }
      if (!validOptions[q.id].has(a.selected_option_ids[0])) {
        return res.status(422).json({ error: 'invalid_option', question_id: q.id });
      }
    } else if (q.type === 'multi') {
      if (!Array.isArray(a.selected_option_ids) || a.selected_option_ids.length < 1) {
        return res.status(422).json({ error: 'multi_requires_options', question_id: q.id });
      }
      if (a.selected_option_ids.some(id => !validOptions[q.id].has(id))) {
        return res.status(422).json({ error: 'invalid_option', question_id: q.id });
      }
    } else if (q.type === 'scale5') {
      if (!Number.isInteger(a.numeric_value) || a.numeric_value < 1 || a.numeric_value > 5) {
        return res.status(422).json({ error: 'scale_out_of_range', question_id: q.id });
      }
    } else if (q.type === 'short_text') {
      if (typeof a.text_value !== 'string' || a.text_value.length > 200) {
        return res.status(422).json({ error: 'short_text_invalid', question_id: q.id });
      }
    } else if (q.type === 'long_text') {
      if (typeof a.text_value !== 'string' || a.text_value.length > 5000) {
        return res.status(422).json({ error: 'long_text_invalid', question_id: q.id });
      }
    }
  }
  // 필수 질문 누락 체크
  for (const q of questions) {
    if (!q.is_required) continue;
    const a = answersByQ[q.id];
    if (!a) return res.status(422).json({ error: 'required_missing', question_id: q.id });
    const empty =
      (q.type === 'single' || q.type === 'multi') ? !a.selected_option_ids?.length
      : (q.type === 'scale5') ? a.numeric_value == null
      : !a.text_value?.trim();
    if (empty) return res.status(422).json({ error: 'required_missing', question_id: q.id });
  }

  // 트랜잭션
  const insertResponse = db.prepare('INSERT INTO responses (survey_id, user_id) VALUES (?, ?)');
  const insertAnswer = db.prepare(`
    INSERT INTO answers (response_id, question_id, selected_option_ids, numeric_value, text_value)
    VALUES (?, ?, ?, ?, ?)
  `);
  db.exec('BEGIN');
  try {
    const result = insertResponse.run(surveyId, req.user.id);
    const responseId = result.lastInsertRowid;
    for (const a of answers) {
      const q = qById[a.question_id];
      insertAnswer.run(
        responseId,
        q.id,
        (q.type === 'single' || q.type === 'multi') ? JSON.stringify(a.selected_option_ids) : null,
        q.type === 'scale5' ? a.numeric_value : null,
        (q.type === 'short_text' || q.type === 'long_text') ? a.text_value : null,
      );
    }
    db.exec('COMMIT');
    res.status(201).json({ response_id: Number(responseId) });

    // 시트 미러링 — fire-and-forget. 실패해도 응답엔 영향 없음.
    mirrorResponseToSheet(Number(responseId))
      .catch(err => console.error(`[sheet-mirror] response ${responseId} failed:`, err.message));
  } catch (err) {
    db.exec('ROLLBACK');
    if (String(err.message).includes('UNIQUE')) return res.status(409).json({ error: 'already_responded' });
    console.error(err);
    res.status(500).json({ error: 'internal' });
  }
});

// 내 응답 조회
router.get('/:id/my-response', requireAuth, (req, res) => {
  const surveyId = Number(req.params.id);
  const response = db.prepare('SELECT * FROM responses WHERE survey_id = ? AND user_id = ?').get(surveyId, req.user.id);
  if (!response) return res.status(404).json({ error: 'not_found' });
  const answers = db.prepare('SELECT * FROM answers WHERE response_id = ?').all(response.id);
  res.json({
    response_id: response.id,
    submitted_at: response.submitted_at,
    answers: answers.map(a => ({
      question_id: a.question_id,
      selected_option_ids: a.selected_option_ids ? JSON.parse(a.selected_option_ids) : null,
      numeric_value: a.numeric_value,
      text_value: a.text_value,
    })),
  });
});

// 통계 — 작성자 또는 공개설문은 누구나 (MVP는 단순)
router.get('/:id/statistics', requireAuth, (req, res) => {
  const surveyId = Number(req.params.id);
  const survey = db.prepare('SELECT * FROM surveys WHERE id = ?').get(surveyId);
  if (!survey) return res.status(404).json({ error: 'not_found' });

  const totalResponses = db.prepare('SELECT COUNT(*) AS c FROM responses WHERE survey_id = ?').get(surveyId).c;
  const questions = db.prepare('SELECT * FROM questions WHERE survey_id = ? ORDER BY ord').all(surveyId);

  const result = { survey_id: surveyId, total_responses: totalResponses, generated_at: new Date().toISOString(), questions: [] };

  for (const q of questions) {
    const block = { id: q.id, ord: q.ord, type: q.type, body: q.body };

    if (q.type === 'single' || q.type === 'multi') {
      const options = db.prepare('SELECT id, label, ord FROM question_options WHERE question_id = ? ORDER BY ord').all(q.id);
      const allAns = db.prepare('SELECT selected_option_ids FROM answers WHERE question_id = ?').all(q.id);
      const counts = new Map(options.map(o => [o.id, 0]));
      let respondents = 0;
      let totalPicks = 0;
      for (const a of allAns) {
        if (!a.selected_option_ids) continue;
        respondents++;
        const ids = JSON.parse(a.selected_option_ids);
        totalPicks += ids.length;
        for (const id of ids) if (counts.has(id)) counts.set(id, counts.get(id) + 1);
      }
      block.answered = respondents;
      block.options = options.map(o => ({
        id: o.id, label: o.label,
        count: counts.get(o.id),
        ratio: respondents ? +(counts.get(o.id) / respondents).toFixed(4) : 0,
      }));
      if (q.type === 'multi') block.avg_picked = respondents ? +(totalPicks / respondents).toFixed(2) : 0;

    } else if (q.type === 'scale5') {
      const rows = db.prepare('SELECT numeric_value AS v FROM answers WHERE question_id = ? AND numeric_value IS NOT NULL').all(q.id);
      const n = rows.length;
      const dist = { 1:0, 2:0, 3:0, 4:0, 5:0 };
      let sum = 0;
      rows.forEach(r => { dist[r.v]++; sum += r.v; });
      const mean = n ? sum / n : 0;
      const variance = n ? rows.reduce((acc, r) => acc + (r.v - mean) ** 2, 0) / Math.max(1, n - 1) : 0;
      // 중앙값
      const sorted = rows.map(r => r.v).sort((a, b) => a - b);
      const median = n ? (n % 2 ? sorted[(n-1)/2] : (sorted[n/2 - 1] + sorted[n/2]) / 2) : 0;
      block.answered = n;
      block.mean = +mean.toFixed(2);
      block.median = +median.toFixed(2);
      block.stddev = +Math.sqrt(variance).toFixed(2);
      block.distribution = dist;

    } else if (q.type === 'short_text') {
      const rows = db.prepare(
        `SELECT TRIM(LOWER(text_value)) AS norm FROM answers WHERE question_id = ? AND text_value IS NOT NULL AND TRIM(text_value) <> ''`
      ).all(q.id);
      const freq = new Map();
      rows.forEach(r => freq.set(r.norm, (freq.get(r.norm) || 0) + 1));
      const top = [...freq.entries()].sort((a, b) => b[1] - a[1]).slice(0, 20).map(([value, count]) => ({ value, count }));
      block.answered = rows.length;
      block.unique = freq.size;
      block.top = top;

    } else if (q.type === 'long_text') {
      const rows = db.prepare(
        `SELECT text_value FROM answers WHERE question_id = ? AND text_value IS NOT NULL AND TRIM(text_value) <> ''`
      ).all(q.id);
      const lens = rows.map(r => r.text_value.length);
      block.answered = rows.length;
      block.avg_len = lens.length ? +(lens.reduce((a, b) => a + b, 0) / lens.length).toFixed(1) : 0;
      block.samples = rows.slice(0, 5).map(r => r.text_value);
    }

    result.questions.push(block);
  }

  res.json(result);
});

export default router;

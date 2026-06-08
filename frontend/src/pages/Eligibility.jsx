import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api.js';
import './eligibility.css';

export default function Eligibility() {
  const [departments, setDepartments] = useState([]);
  const [groupedDepts, setGroupedDepts] = useState({});
  const [isManualDept, setIsManualDept] = useState(false);
  const [deptHint, setDeptHint] = useState('소속 학과를 선택하세요.');

  // Form Inputs
  const [selectedDept, setSelectedDept] = useState('');
  const [manualDeptName, setManualDeptName] = useState('');
  const [semester, setSemester] = useState('');
  const [gpa, setGpa] = useState('');
  const [gradCredits, setGradCredits] = useState('');
  const [earnedCredits, setEarnedCredits] = useState('');

  // Validation Result
  const [formError, setFormError] = useState('');
  const [result, setResult] = useState(null);

  const resultRef = useRef(null);

  useEffect(() => {
    api.departments()
      .then((list) => {
        if (!Array.isArray(list) || list.length === 0) {
          enableManualDept('학과 목록을 불러오지 못했습니다. 학과명을 직접 입력하세요.');
          return;
        }
        setDepartments(list);
        
        // Group by gyeyeol
        const groups = {};
        list.forEach((d) => {
          const g = d.gyeyeol || '기타';
          if (!groups[g]) groups[g] = [];
          groups[g].push(d);
        });
        setGroupedDepts(groups);
        setDeptHint('소속 학과를 선택하세요. 목록에 없으면 행정실에 문의하세요.');
      })
      .catch(() => {
        enableManualDept('학과 목록을 불러오지 못했습니다. 학과명을 직접 입력하세요.');
      });
  }, []);

  const enableManualDept = (reason) => {
    setIsManualDept(true);
    setDeptHint(reason);
  };

  const getDeptName = () => {
    return isManualDept ? manualDeptName.trim() : selectedDept.trim();
  };

  const requiredCredits = (semVal, gradVal) => {
    const Y = gradVal / 4;
    switch (semVal) {
      case 4: return Y * 2;            // 2학년 2학기 완료
      case 5: return Y * 2 + Y / 2;    // 3학년 1학기 완료
      case 6: return Y * 3;            // 3학년 2학기 완료
      case 7: return Y * 3 + Y / 2;    // 4학년 1학기 완료
      default: return NaN;
    }
  };

  const handleCheck = () => {
    setFormError('');
    setResult(null);

    const dept = getDeptName();
    const semVal = parseInt(semester, 10);
    const gpaVal = parseFloat(gpa);
    const gradVal = parseFloat(gradCredits);
    const earnedVal = parseFloat(earnedCredits);

    const missing = [];
    if (!dept) missing.push('학과');
    if (!semester) missing.push('현재 이수 학기');
    if (isNaN(gpaVal)) missing.push('전체 평점평균');
    if (isNaN(gradVal)) missing.push('졸업 이수학점');
    if (isNaN(earnedVal)) missing.push('누적 취득학점');

    if (missing.length > 0) {
      setFormError(`다음 항목을 입력하세요: ${missing.join(', ')}`);
      return;
    }

    if (gpaVal < 0 || gpaVal > 4.5) {
      setFormError('전체 평점평균은 0 ~ 4.5 사이여야 합니다.');
      return;
    }

    if (gradVal <= 0 || earnedVal < 0) {
      setFormError('학점 값을 올바르게 입력하세요.');
      return;
    }

    const checks = [];
    const semLabelMap = {
      4: '4학기(2학년 2학기)',
      5: '5학기(3학년 1학기)',
      6: '6학기(3학년 2학기)',
      7: '7학기(4학년 1학기)'
    };

    // 1) Semester check
    const semOk = semVal >= 4 && semVal <= 7;
    checks.push({
      ok: semOk,
      title: '신청 가능 학기 (4~7학기 이내)',
      detail: `현재 ${semLabelMap[semVal] || semVal + '학기'} · 기준 4~7학기`,
      reason: semOk ? '' : '신청은 4~7학기 재학생만 가능합니다.'
    });

    // 2) GPA check (3.0 or higher)
    const gpaOk = gpaVal >= 3.0;
    checks.push({
      ok: gpaOk,
      title: '전체 평점평균 3.0 이상',
      detail: `입력값 ${gpaVal.toFixed(2)} / 4.5 · 기준 3.00 이상`,
      reason: gpaOk ? '' : '평점평균이 3.0 미만입니다. (학생지원시스템 e-onestop에서 정확한 평점을 확인하세요.)'
    });

    // 3) Earned credits check
    const req = requiredCredits(semVal, gradVal);
    const creditOk = earnedVal >= req;
    const reqRounded = Math.round(req * 10) / 10;
    checks.push({
      ok: creditOk,
      title: '해당 학기 요구 누적학점 충족',
      detail: `취득 ${earnedVal}학점 · 요구 누적 약 ${reqRounded}학점 (졸업학점 ${gradVal} 기준)`,
      reason: creditOk ? '' : `현재 학기 기준 누적 취득학점이 약 ${reqRounded}학점에 미달합니다. (${reqRounded - earnedVal > 0 ? '약 ' + (Math.round((reqRounded - earnedVal) * 10) / 10) + '학점 부족' : ''})`
    });

    const allOk = checks.every(c => c.ok);
    const failCount = checks.filter(c => !c.ok).length;

    setResult({
      allOk,
      failCount,
      checks,
      dept
    });

    setTimeout(() => {
      if (resultRef.current) {
        resultRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  };

  return (
    <div className="eligibility-container">
      <header>
        <img src="/logos/pnu-signature.jpg" alt="부산대학교" onError={(e) => { e.target.style.display = 'none'; }} />
        <div className="brand">
          <div className="kicker">PNU · 학·석사 연계과정</div>
          <div className="org">부산대학교 · 학칙 제69조 기반 자가 확인</div>
        </div>
      </header>

      <h1>연계과정 신청 자격 자가 확인</h1>
      <p className="lead">학·석사 연계과정 신청 가능 여부를 미리 확인해 보세요. 모든 계산은 이 브라우저 안에서만 이루어지며, 입력값은 서버로 전송·저장되지 않습니다.</p>
      <span className="privacy">🔒 개인정보 미수집 · 클라이언트 사이드 계산</span>

      {/* Form Input Card */}
      <div className="card" id="formCard">
        <h2><span className="step-no">✓</span> 신청 요건 입력</h2>
        <p className="sub">아래 5개 항목을 입력하면 학칙 요건과 대조하여 즉시 판정합니다.</p>

        <div className="field">
          <label htmlFor="dept">① 학과<span className="req">*</span></label>
          {!isManualDept ? (
            <select
              id="dept"
              value={selectedDept}
              onChange={(e) => {
                if (e.target.value === 'MANUAL') {
                  enableManualDept();
                } else {
                  setSelectedDept(e.target.value);
                }
              }}
            >
              <option value="">불러오는 중…</option>
              {Object.keys(groupedDepts).map((gyeyeol) => (
                <optgroup key={gyeyeol} label={gyeyeol}>
                  {groupedDepts[gyeyeol].map((d) => (
                    <option key={d.name} value={d.name}>{d.name}</option>
                  ))}
                </optgroup>
              ))}
              <option value="MANUAL">✏️ 학과 직접 입력하기</option>
            </select>
          ) : (
            <div className="dept-fallback" id="deptFallbackBox">
              <input
                type="text"
                id="deptText"
                placeholder="학과명을 직접 입력하세요 (예: 전자공학과)"
                value={manualDeptName}
                onChange={(e) => setManualDeptName(e.target.value)}
              />
            </div>
          )}
          <div className="hint" id="deptHint">{deptHint}</div>
        </div>

        <div className="row">
          <div className="field">
            <label htmlFor="sem">② 현재 이수 학기<span className="req">*</span></label>
            <select id="sem" value={semester} onChange={(e) => setSemester(e.target.value)}>
              <option value="">선택</option>
              <option value="4">4학기 (2학년 2학기)</option>
              <option value="5">5학기 (3학년 1학기)</option>
              <option value="6">6학기 (3학년 2학기)</option>
              <option value="7">7학기 (4학년 1학기)</option>
            </select>
            <div className="hint">신청 가능 구간은 4~7학기입니다.</div>
          </div>

          <div className="field">
            <label htmlFor="gpa">⑤ 전체 평점평균<span className="req">*</span></label>
            <input
              type="number"
              id="gpa"
              min="0"
              max="4.5"
              step="0.01"
              placeholder="예: 3.42"
              value={gpa}
              onChange={(e) => setGpa(e.target.value)}
            />
            <div className="hint">4.5 만점 기준. <a href="https://e-onestop.pusan.ac.kr" target="_blank" rel="noopener noreferrer">학생지원시스템(e-onestop)</a>에서 확인하세요.</div>
          </div>
        </div>

        <div className="field">
          <label htmlFor="grad">④ 졸업(수료) 이수학점<span className="req">*</span></label>
          <input
            type="number"
            id="grad"
            min="0"
            step="1"
            placeholder="예: 130"
            value={gradCredits}
            onChange={(e) => setGradCredits(e.target.value)}
          />
          <div className="hint">학과별로 다릅니다. 소속 <b>단과대학</b> 또는 <a href="https://e-onestop.pusan.ac.kr" target="_blank" rel="noopener noreferrer">학생지원시스템(e-onestop)</a>에서 본인 학과의 졸업 요구학점을 확인해 입력하세요.</div>
        </div>

        <div className="field">
          <label htmlFor="earned">③ 누적 취득학점<span className="req">*</span></label>
          <input
            type="number"
            id="earned"
            min="0"
            step="1"
            placeholder="예: 95"
            value={earnedCredits}
            onChange={(e) => setEarnedCredits(e.target.value)}
          />
          <div className="hint">지금까지 실제로 취득한 총 학점.</div>
        </div>

        <button className="btn" id="checkBtn" onClick={handleCheck}>자격 확인하기</button>
        {formError && <div className="err" id="formErr" style={{ display: 'block' }}>{formError}</div>}
      </div>

      {/* Result Card */}
      {result && (
        <div id="result" className="result-box" ref={resultRef}>
          <div className={`verdict ${result.allOk ? 'pass' : 'fail'}`} id="verdict">
            <div className="vtag" id="verdictTag">{result.allOk ? 'Eligible' : 'Not eligible'}</div>
            <div className="vtitle" id="verdictTitle">
              {result.allOk ? '신청 가능 (요건 충족)' : '신청 불가 (요건 미충족)'}
            </div>
            <div className="vmsg" id="verdictMsg">
              {result.allOk
                ? '입력하신 값 기준으로 학칙 제69조 일반 요건을 모두 충족합니다. 최종 신청은 학과/대학원 행정실 확인 후 진행하세요.'
                : `${result.failCount}개 항목이 기준에 미달합니다. 아래 미충족 사유를 확인하세요.`}
            </div>
          </div>
          <div className="card">
            <h2>항목별 충족 여부</h2>
            <p className="sub" id="resultDept">학과: {result.dept}</p>
            <ul className="checklist" id="checklist">
              {result.checks.map((c, idx) => (
                <li key={idx} className="check">
                  <span className={`ico ${c.ok ? 'ok' : 'no'}`}>{c.ok ? '✓' : '✕'}</span>
                  <div>
                    <div className="ctitle">{c.title}</div>
                    <div className="cdetail">
                      <span dangerouslySetInnerHTML={{ __html: c.detail }} />
                      {!c.ok && <div className="reason">⚠ {c.reason}</div>}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Information Guides */}
      <div className="notice">
        <b>안내</b> · 본 확인 결과는 부산대학교 학칙 제69조의 일반 요건을 바탕으로 한 <b>참고용 자가 진단</b>입니다.
        정확한 학과별 졸업 요구학점·세부 기준은 학과/대학원마다 다를 수 있으며, 본 페이지는 정확한 학과별 졸업학점 데이터를 보유하지 않아 <b>전적으로 사용자가 입력한 값에 근거</b>합니다.
        최종 신청 자격은 반드시 소속 학과 및 대학원 행정실에 확인하시기 바랍니다.
      </div>

      <div className="assump">
        <h3>적용한 학점 기준 가정</h3>
        학년 수료학점 = <code>졸업학점 ÷ 4</code> 으로 가정합니다.<br />
        학년별 <b>1학기</b> 종료 시점의 누적 기준 = 직전 학년까지의 수료학점 + (학년 수료학점 ÷ 2)<br />
        학년별 <b>2학기</b> 종료 시점의 누적 기준 = 해당 학년까지의 누적 수료학점<br />
        예) 졸업학점 G에서 <code>6학기(3학년 2학기)</code> 요구 누적 = <code>(G/4)×3 = 3G/4</code>,
        <code>5학기(3학년 1학기)</code> 요구 누적 = <code>(G/4)×2 + (G/4)/2 = 5G/8</code>.
        실제 학사 운영상의 학점 배분과 다를 수 있어 보수적 참고치로만 사용하세요.
      </div>

      <footer>
        <Link to="/admission">← 연계과정 안내로 돌아가기</Link>
      </footer>
    </div>
  );
}

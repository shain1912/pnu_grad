import React, { useState } from 'react';
import { Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const DATA = [
  {
    id: 1, field: '바이오·신약', color: '#10b981', bp: '#d1fae5', bd: '#065f46', key: 's1', icon: '🧬',
    majors: [
      { name: 'AI-바이오 융합전공', dept: '자연과학대학', major: '미생물학과', tag: 'AI × 바이오', icon: '🦠' },
      { name: 'AX신약융합전공', dept: '약학대학', major: '약학과 · 제약학과', tag: 'AI × 신약개발', icon: '💊' },
    ]
  },
  {
    id: 2, field: '푸드테크AX', color: '#f59e0b', bp: '#fef3c7', bd: '#92400e', key: 's2', icon: '🌾',
    majors: [
      { name: '에그테크 AX 융합전공', dept: '생명자원과학대학', major: '바이오산업기계공학과', tag: 'AI × 농업식품기술', icon: '🌱' },
    ]
  },
  {
    id: 3, field: '인문·사회·문화', color: '#8b5cf6', bp: '#ede9fe', bd: '#4c1d95', key: 's3', icon: '📚',
    majors: [
      { name: 'AX인문융합전공', dept: '인문대학', major: '-', tag: 'AI × 인문학', icon: '📖' },
      { name: 'AX·소셜 데이터 분석 융합전공', dept: '사회과학대학', major: '정치외교학과', tag: 'AI × 사회데이터', icon: '📊' },
    ]
  },
  {
    id: 4, field: '경영·경통', color: '#2563eb', bp: '#dbeafe', bd: '#1e3a8a', key: 's4', icon: '💼',
    majors: [
      { name: 'AX 전략경영 융합전공', dept: '경영대학', major: '경영학과', tag: 'AI × 전략경영', icon: '📈' },
      { name: '해양산업·금융 융합전공', dept: '경제통상대학', major: '경제학부', tag: 'AI × 해양금융', icon: '⚓' },
    ]
  },
  {
    id: 5, field: '제조AI', color: '#f97316', bp: '#ffedd5', bd: '#7c2d12', key: 's5', icon: '🏭',
    majors: [
      { name: '피지컬AI 빅데이터합성융합전공', dept: '학부대학 첨단융합학부', major: '광메카트로닉스공학전공', tag: 'AI × 피지컬·빅데이터', icon: '🤖' },
      { name: '제조AI 융합전공 (기계)', dept: '공과대학', major: '기계공학부', tag: 'AI × 기계제조', icon: '⚙️' },
      { name: '제조AI 융합전공 (산업)', dept: '공과대학', major: '산업공학과', tag: 'AI × 산업공학', icon: '🔩' },
    ]
  },
  {
    id: 6, field: '항만물류AI', color: '#0ea5e9', bp: '#e0f2fe', bd: '#0c4a6e', key: 's6', icon: '⚓',
    majors: [
      { name: '해양물류AI 융합전공', dept: '공과대학', major: '산업공학과', tag: 'AI × 항만물류', icon: '🚢' },
    ]
  },
  {
    id: 7, field: 'AX융합계산과학 & 디지털트윈', color: '#6366f1', bp: '#e0e7ff', bd: '#312e81', key: 's7', icon: '💻',
    majors: [
      { name: 'AI 반도체 소자 공정 융합전공', dept: '학부대학 첨단융합학부', major: '나노소자집단제조전공', tag: 'AI × 반도체', icon: '🔬' },
      { name: 'AI·수리데이터과학 융합전공', dept: '자연과학대학', major: '수학과', tag: 'AI × 수리과학', icon: '📐' },
      { name: 'AI융합계산과학', dept: '학부대학 첨단융합학부', major: '광메카트로닉스공학전공', tag: 'AI × 계산과학', icon: '🖥️' },
      { name: '디지털트윈 융합전공', dept: '공과대학', major: '항공우주공학과', tag: 'AI × 디지털트윈', icon: '🛩️' },
    ]
  },
  {
    id: 8, field: '스마트시티·해양도시·기후환경·관광', color: '#14b8a6', bp: '#ccfbf1', bd: '#134e4a', key: 's8', icon: '🌍',
    majors: [
      { name: 'AI·지구환경 융합전공', dept: '자연과학대학', major: '대기환경과학과', tag: 'AI × 기목환경', icon: '🌤' },
      { name: 'Lifecare AX 융합전공', dept: '생활과학대학', major: '실내환경디자인학과', tag: 'AI × 생활환경', icon: '🏠' },
    ]
  },
  {
    id: 9, field: '조선해양', color: '#64748b', bp: '#f1f5f9', bd: '#1e293b', key: 's9', icon: '⛵',
    majors: [
      { name: '조선해양 AX 융합전공', dept: '공과대학', major: '조선해양공학과', tag: 'AI × 조선해양', icon: '🛳' },
    ]
  },
];

export default function AXMajors() {
  const [activeFilter, setActiveFilter] = useState('all'); // 'all' or key ('s1', 's2'...)

  const handleFilterChange = (key) => {
    setActiveFilter(key);
  };

  const filteredData = activeFilter === 'all' 
    ? DATA 
    : DATA.filter(item => item.key === activeFilter);

  // Bar Chart Config
  const barChartData = {
    labels: DATA.map(d => d.field.length > 10 ? d.field.slice(0, 10) + '…' : d.field),
    datasets: [{
      label: '융합전공 수',
      data: DATA.map(d => d.majors.length),
      backgroundColor: DATA.map(d => d.color + 'cc'),
      borderColor: DATA.map(d => d.color),
      borderWidth: 1.5,
      borderRadius: 6,
      borderSkipped: false,
    }]
  };

  const barChartOptions = {
    indexAxis: 'y',
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: { callbacks: { label: c => ` ${c.raw}개 전공` } }
    },
    scales: {
      x: {
        ticks: { stepSize: 1, callback: v => v + '개' },
        grid: { color: '#f1f5f9' }
      },
      y: { grid: { display: false }, ticks: { font: { size: 11 } } }
    }
  };

  // Doughnut Chart Config
  const doughnutChartData = {
    labels: DATA.map(d => d.field),
    datasets: [{
      data: DATA.map(d => d.majors.length),
      backgroundColor: DATA.map(d => d.color),
      borderColor: 'white',
      borderWidth: 2,
      hoverOffset: 6,
    }]
  };

  const doughnutChartOptions = {
    cutout: '55%',
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: { font: { size: 10 }, padding: 8, boxWidth: 12 }
      },
      tooltip: {
        callbacks: {
          label: c => ` ${c.label}: ${c.raw}개`
        }
      }
    }
  };

  // Generate numbers sequentially for the table view
  let seqNum = 1;

  return (
    <div style={{ backgroundColor: '#f0f4f8', color: '#1e293b', fontFamily: '"Apple SD Gothic Neo", sans-serif', padding: '20px' }}>
      <style>{`
        .ax-header {
          background: linear-gradient(135deg, #0f172a 0%, #1e3a6e 50%, #0c4a6e 100%);
          color: white; padding: 48px 24px; text-align: center; border-radius: 12px; margin-bottom: 20px;
          position: relative; overflow: hidden;
        }
        .ax-header::before {
          content: ''; position: absolute; inset: 0;
          background: radial-gradient(ellipse 60% 80% at 50% 120%, rgba(99,102,241,0.3) 0%, transparent 60%);
        }
        .ax-badge {
          display: inline-block; background: rgba(255,255,255,0.12);
          border: 1px solid rgba(255,255,255,0.25);
          border-radius: 20px; padding: 5px 16px;
          font-size: 11px; font-weight: 600; letter-spacing: 0.5px;
          margin-bottom: 12px; color: rgba(255,255,255,0.9);
        }
        .ax-header h1 { font-size: 1.85rem; font-weight: 900; margin: 0 0 8px 0; }
        .ax-header h1 span { color: #fbbf24; }
        .ax-header p { font-size: 0.9rem; color: rgba(255,255,255,0.7); margin: 0 0 24px 0; }
        
        .stats-grid { display: flex; justify-content: center; gap: 16px; flex-wrap: wrap; }
        .stat-card {
          background: rgba(255,255,255,0.10); border: 1px solid rgba(255,255,255,0.18);
          border-radius: 12px; padding: 12px 24px; min-width: 120px; text-align: center;
        }
        .stat-card .n { font-size: 1.8rem; font-weight: 900; color: #fbbf24; }
        .stat-card .l { font-size: 11px; color: rgba(255,255,255,0.6); margin-top: 2px; }

        .filter-bar {
          background: white; border: 1px solid #e2e8f0; border-radius: 8px;
          padding: 12px 20px; margin-bottom: 20px;
          display: flex; gap: 8px; align-items: center; overflow-x: auto;
        }
        .filter-label { font-size: 12px; color: #64748b; font-weight: 600; white-space: nowrap; }
        .filter-btn {
          border: none; border-radius: 6px; padding: 6px 12px;
          font-size: 11px; font-weight: 700; cursor: pointer;
          transition: all 0.2s; white-space: nowrap; background: #f1f5f9; color: #64748b;
        }
        .filter-btn:hover { opacity: 0.9; }
        .filter-btn.active { background: #1e3a6e !important; color: white !important; }

        .charts-card {
          background: white; border: 1px solid #e2e8f0; border-radius: 12px;
          padding: 24px; margin-bottom: 20px;
        }
        .charts-card h3 { font-size: 1.05rem; font-weight: 800; margin: 0 0 4px 0; }
        .charts-card p { font-size: 0.8rem; color: #64748b; margin: 0 0 20px 0; }
        .charts-row { display: grid; grid-template-columns: 3fr 2fr; gap: 24px; }
        @media (max-width: 900px) { .charts-row { grid-template-columns: 1fr; } }
        .chart-box { position: relative; height: 280px; }

        .section-block { margin-bottom: 30px; }
        .sec-header { display: flex; align-items: center; gap: 12px; margin-bottom: 14px; }
        .sec-num {
          width: 32px; height: 32px; border-radius: 8px;
          display: flex; align-items: center; justify-content: center;
          font-size: 13px; font-weight: 900; color: white;
        }
        .sec-name { font-size: 1.1rem; font-weight: 800; }
        .sec-count {
          margin-left: auto; font-size: 11px; font-weight: 700;
          border-radius: 12px; padding: 2px 10px;
        }

        .cards-grid {
          display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 14px;
        }
        .major-card {
          background: white; border-radius: 12px; border: 1px solid #e2e8f0;
          padding: 18px 20px; position: relative; overflow: hidden;
          transition: all 0.2s;
        }
        .major-card:hover {
          box-shadow: 0 6px 20px rgba(0,0,0,0.08); transform: translateY(-2px);
        }
        .major-card .left-border {
          position: absolute; left: 0; top: 0; bottom: 0; width: 4px; border-radius: 12px 0 0 12px;
        }
        .major-icon { font-size: 1.3rem; margin-bottom: 8px; }
        .major-name { font-size: 0.9rem; font-weight: 800; line-height: 1.4; margin-bottom: 10px; color: #1e293b; }
        .dept-row { display: flex; align-items: center; gap: 6px; font-size: 0.78rem; color: #64748b; margin-bottom: 4px; }
        .tag-badge { font-size: 0.7rem; font-weight: 700; padding: 2px 8px; border-radius: 4px; margin-top: 10px; display: inline-block; }

        .table-card {
          background: white; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; margin-top: 20px;
        }
        .table-head { padding: 18px 20px; border-bottom: 1px solid #e2e8f0; }
        .table-head h3 { font-size: 1.05rem; font-weight: 800; margin: 0; }
        .table-head p { font-size: 0.8rem; color: #64748b; margin: 2px 0 0 0; }
        
        table { width: 100%; border-collapse: collapse; font-size: 0.82rem; }
        th {
          background: #f8fafc; padding: 10px 14px; text-align: left;
          font-size: 0.72rem; font-weight: 700; color: #64748b; border-bottom: 1px solid #e2e8f0;
          white-space: nowrap; text-transform: uppercase;
        }
        td { padding: 10px 14px; border-bottom: 1px solid #f1f5f9; vertical-align: middle; }
        tr:last-child td { border-bottom: none; }
        tr:hover td { background: #fafbfd; }
        .td-num { font-weight: 800; text-align: center; width: 45px; }
        .td-field { width: 150px; }
        .field-badge { display: inline-block; border-radius: 4px; padding: 2px 8px; font-size: 0.7rem; font-weight: 700; }
        .td-name { font-weight: 700; color: #1e293b; }
        .td-dept { color: #64748b; font-size: 0.8rem; }
      `}</style>

      {/* Header */}
      <div className="ax-header">
        <div className="ax-badge">부산대학교 AI대학</div>
        <h1><span>AX융합학부</span> AX융합전공 목록</h1>
        <p>산업·기술·인문·환경 전 영역을 아우르는 AI 기반 융합전공 체계</p>
        
        <div className="stats-grid">
          <div className="stat-card">
            <div className="n">9</div>
            <div className="l">융합 분야</div>
          </div>
          <div className="stat-card">
            <div className="n">18</div>
            <div className="l">AX 융합전공</div>
          </div>
          <div className="stat-card">
            <div className="n">11</div>
            <div className="l">참여 단과대학</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="filter-bar">
        <span className="filter-label">분야 필터</span>
        <button 
          className={`filter-btn ${activeFilter === 'all' ? 'active' : ''}`}
          onClick={() => handleFilterChange('all')}
        >
          전체 분야
        </button>
        {DATA.map(item => (
          <button
            key={item.key}
            className={`filter-btn ${activeFilter === item.key ? 'active' : ''}`}
            style={{
              backgroundColor: activeFilter === item.key ? undefined : item.bp,
              color: activeFilter === item.key ? undefined : item.bd,
            }}
            onClick={() => handleFilterChange(item.key)}
          >
            {item.icon} {item.field}
          </button>
        ))}
      </div>

      {/* Charts Area (Only show when 'all' is selected) */}
      {activeFilter === 'all' && (
        <div className="charts-card">
          <h3>융합전공 분야별 분포</h3>
          <p>9개 분야에 걸친 18개 AX 융합전공의 구성 현황</p>
          <div className="charts-row">
            <div className="chart-box">
              <Bar data={barChartData} options={barChartOptions} />
            </div>
            <div className="chart-box">
              <Doughnut data={doughnutChartData} options={doughnutChartOptions} />
            </div>
          </div>
        </div>
      )}

      {/* Major Cards by Category */}
      {filteredData.map(sec => (
        <div key={sec.key} className="section-block">
          <div className="sec-header">
            <div className="sec-num" style={{ backgroundColor: sec.color }}>{sec.id}</div>
            <div className="sec-name">{sec.icon} {sec.field}</div>
            <span 
              className="sec-count" 
              style={{ backgroundColor: sec.bp, color: sec.bd }}
            >
              {sec.majors.length}개 전공
            </span>
          </div>

          <div className="cards-grid">
            {sec.majors.map((m, idx) => (
              <div 
                key={idx} 
                className="major-card" 
                style={{ borderColor: sec.bp }}
              >
                <div className="left-border" style={{ backgroundColor: sec.color }} />
                <div className="major-icon">{m.icon}</div>
                <div className="major-name">{m.name}</div>
                <div className="dept-row">
                  <span>🏛️</span>
                  <span><strong>{m.dept}</strong></span>
                </div>
                <div className="dept-row">
                  <span>📌</span>
                  <span>{m.major}</span>
                </div>
                <div>
                  <span className="tag-badge" style={{ backgroundColor: sec.bp, color: sec.bd }}>{m.tag}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Table List View (Only show when 'all' is selected) */}
      {activeFilter === 'all' && (
        <div className="table-card">
          <div className="table-head">
            <h3>📋 AX융합전공 전체 목록 (표 형식)</h3>
            <p>9개 분야 · 18개 AX 융합전공 · 참여 단과대학 및 주관학과 일람</p>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table>
              <thead>
                <tr>
                  <th style={{ textAlign: 'center' }}>연번</th>
                  <th>분야</th>
                  <th>융합전공명</th>
                  <th>단과대학</th>
                  <th>주관학과</th>
                </tr>
              </thead>
              <tbody>
                {DATA.map(sec => (
                  sec.majors.map((m, idx) => (
                    <tr key={`${sec.key}-${idx}`}>
                      <td className="td-num" style={{ color: sec.color }}>{seqNum++}</td>
                      <td className="td-field">
                        <span className="field-badge" style={{ backgroundColor: sec.bp, color: sec.bd }}>{sec.field}</span>
                      </td>
                      <td className="td-name">{m.name}</td>
                      <td className="td-dept">{m.dept}</td>
                      <td className="td-dept">{m.major}</td>
                    </tr>
                  ))
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

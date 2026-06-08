import React, { useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const YEARS = [2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025];

const UNIS = [
  { name: '부산대학교', alias: '부산대', color: '#2563eb' },
  { name: '서울대학교', alias: '서울대', color: '#dc2626' },
  { name: '한국과학기술원', alias: 'KAIST', color: '#7c3aed' },
  { name: '연세대학교', alias: '연세대', color: '#059669' },
  { name: '고려대학교', alias: '고려대', color: '#d97706' },
  { name: '성균관대학교', alias: '성균관대', color: '#0891b2' },
  { name: '한양대학교', alias: '한양대', color: '#be185d' },
  { name: '경북대학교', alias: '경북대', color: '#65a30d' },
];

const FACULTY = {
  '부산대학교': [1303, 1320, 1337, 1353, 1370, 1375, 1413, 1425, 1446, 1442],
  '서울대학교': [2107, 2136, 2165, 2194, 2223, 2256, 2278, 2308, 2344, 2369],
  '한국과학기술원': [558, 575, 593, 610, 627, 646, 666, 670, 700, 716],
  '연세대학교': [1597, 1620, 1644, 1668, 1691, 1729, 1731, 1746, 1786, 1820],
  '고려대학교': [1372, 1396, 1420, 1444, 1468, 1504, 1511, 1525, 1556, 1601],
  '성균관대학교': [1454, 1464, 1474, 1483, 1493, 1496, 1525, 1520, 1529, 1543],
  '한양대학교': [1142, 1142, 1142, 1142, 1142, 1143, 1138, 1150, 1142, 1141],
  '경북대학교': [1290, 1305, 1320, 1336, 1351, 1360, 1392, 1397, 1410, 1428],
};

const GRAD = {
  '부산대학교': [6943, 6621, 6405, 6180, 5944, 6032, 6077, 5929, 6084, 6124],
  '서울대학교': [13819, 13653, 13322, 12935, 12954, 13448, 14056, 14242, 14464, 14761],
  '한국과학기술원': [7070, 7043, 7092, 7230, 7325, 7611, 7868, 8144, 8557, 8910],
  '연세대학교': [9600, 9689, 9663, 9742, 9865, 10405, 10581, 10718, 10860, 10759],
  '고려대학교': [8074, 7654, 7431, 7275, 7492, 8243, 8581, 8587, 8660, 8840],
  '성균관대학교': [6326, 5931, 6052, 6305, 6943, 7621, 7658, 7578, 8015, 8255],
  '한양대학교': [7188, 6898, 6609, 6490, 6728, 7666, 8020, 8217, 8373, 8522],
  '경북대학교': [5303, 4966, 4658, 4349, 4314, 4473, 4603, 4664, 4778, 4767],
};

const RATIO = {};
UNIS.forEach(u => {
  RATIO[u.name] = FACULTY[u.name].map((f, i) => +(GRAD[u.name][i] / f).toFixed(2));
});

const isEstimated = (uni, yi) => {
  if (uni === '한양대학교') return yi <= 5;
  return yi <= 4;
};

function hexToRgba(hex, alpha) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

export default function Faculty() {
  // Toggle states for each university (true means visible)
  const [visibleUnis, setVisibleUnis] = useState(
    UNIS.reduce((acc, u) => ({ ...acc, [u.name]: true }), {})
  );
  const [tableType, setTableType] = useState('faculty'); // 'faculty', 'grad', 'ratio'

  const toggleUni = (name) => {
    setVisibleUnis(prev => ({ ...prev, [name]: !prev[name] }));
  };

  const toggleAll = () => {
    const anyVisible = Object.values(visibleUnis).some(v => v);
    setVisibleUnis(
      UNIS.reduce((acc, u) => ({ ...acc, [u.name]: !anyVisible }), {})
    );
  };

  const makeChartData = (dataObj) => {
    return {
      labels: YEARS.map(y => y + '년'),
      datasets: UNIS.map(u => ({
        label: u.alias,
        data: dataObj[u.name],
        borderColor: u.color,
        backgroundColor: hexToRgba(u.color, 0.08),
        borderWidth: 2.5,
        pointRadius: 4,
        pointHoverRadius: 6,
        tension: 0.3,
        segment: {
          borderDash: ctx => isEstimated(u.name, ctx.p0DataIndex) ? [5, 4] : undefined,
          borderColor: ctx => isEstimated(u.name, ctx.p0DataIndex) ? hexToRgba(u.color, 0.5) : u.color,
        },
        pointBackgroundColor: dataObj[u.name].map((_, i) => isEstimated(u.name, i) ? hexToRgba(u.color, 0.35) : u.color),
        pointBorderColor: dataObj[u.name].map((_, i) => isEstimated(u.name, i) ? hexToRgba(u.color, 0.35) : u.color),
        hidden: !visibleUnis[u.name],
      }))
    };
  };

  const getChartOptions = (yLabel, yMin) => ({
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: 'index', intersect: false },
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: ctx => {
            const u = UNIS[ctx.datasetIndex];
            const est = isEstimated(u.name, ctx.dataIndex);
            const suffix = est ? ' (추정)' : '';
            return ` ${ctx.dataset.label}: ${ctx.parsed.y.toLocaleString()}${suffix}`;
          }
        }
      }
    },
    scales: {
      x: { grid: { color: 'rgba(0,0,0,0.05)' }, ticks: { font: { size: 11 } } },
      y: {
        min: yMin,
        grid: { color: 'rgba(0,0,0,0.05)' },
        title: { display: true, text: yLabel, font: { size: 11 } },
        ticks: { font: { size: 11 } }
      }
    }
  });

  const renderTable = () => {
    const dataMap = { faculty: FACULTY, grad: GRAD, ratio: RATIO };
    const activeData = dataMap[tableType];
    const fmt = tableType === 'ratio' ? v => v.toFixed(2) : v => v.toLocaleString();

    return (
      <table>
        <thead>
          <tr>
            <th>연도</th>
            {UNIS.map(u => (
              <th 
                key={u.name} 
                className={u.name === '부산대학교' ? 'highlight' : ''} 
                style={{ borderTop: `3px solid ${u.color}` }}
              >
                {u.alias}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {YEARS.map((yr, yi) => {
            const isEstRow = yi <= 4;
            return (
              <tr key={yr}>
                <td>
                  <strong>{yr}</strong>
                  {isEstRow && <><br /><small style={{ color: '#a0aec0', fontSize: '0.7rem' }}>추정</small></>}
                </td>
                {UNIS.map(u => {
                  const est = tableType === 'faculty' ? isEstimated(u.name, yi) : false;
                  const cls = (est ? 'estimated ' : '') + (u.name === '부산대학교' ? 'pnu' : '');
                  return (
                    <td key={u.name} className={cls}>
                      {fmt(activeData[u.name][yi])}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    );
  };

  return (
    <div style={{ padding: '20px', fontFamily: '"Apple SD Gothic Neo", sans-serif', color: '#2d3748', backgroundColor: '#f5f7fa', borderRadius: '12px' }}>
      {/* Locally-scoped styled tags */}
      <style>{`
        .fac-header {
          text-align: center; margin-bottom: 24px; padding: 24px 20px;
          background: linear-gradient(135deg, #1a365d 0%, #2b6cb0 100%);
          border-radius: 12px; color: white;
        }
        .fac-header h1 { font-size: 1.6rem; font-weight: 700; margin: 0 0 6px 0; }
        .fac-header p { font-size: 0.85rem; opacity: 0.85; margin: 0; }
        
        .fac-notice {
          background: #fff3cd; border-left: 4px solid #ffc107;
          padding: 12px 16px; border-radius: 6px; font-size: 0.82rem;
          color: #856404; margin-bottom: 20px; line-height: 1.7;
        }
        .scope-badge {
          display: inline-block; background: #2b6cb0; color: white;
          padding: 2px 10px; border-radius: 12px; font-size: 0.8rem;
          font-weight: 700; margin-left: 4px;
        }
        
        .fac-controls {
          background: white; border-radius: 10px; padding: 16px 20px;
          margin-bottom: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.05);
        }
        .fac-controls h3 { font-size: 0.9rem; color: #718096; margin: 0 0 12px 0; font-weight: 600; }
        .btn-group { display: flex; flex-wrap: wrap; gap: 8px; }
        
        .btn-toggle {
          display: flex; align-items: center; gap: 6px;
          padding: 6px 14px; border-radius: 20px; border: 2px solid;
          cursor: pointer; font-size: 0.83rem; font-weight: 600;
          transition: all 0.2s; background: white;
        }
        .btn-toggle.active { color: white !important; }
        .btn-toggle .dot { width: 8px; height: 8px; border-radius: 50%; background: white; }
        .btn-toggle:not(.active) .dot { background: currentColor; }

        .btn-all {
          padding: 6px 16px; border-radius: 20px; border: 2px solid #718096;
          background: #718096; color: white; cursor: pointer;
          font-size: 0.83rem; font-weight: 600; transition: all 0.2s;
        }
        .btn-all:hover { opacity: 0.9; }

        .charts-container {
          display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;
        }
        @media (max-width: 900px) { .charts-container { grid-template-columns: 1fr; } }
        
        .chart-card {
          background: white; border-radius: 12px; padding: 20px;
          box-shadow: 0 2px 12px rgba(0,0,0,0.05);
        }
        .chart-title { font-size: 1rem; font-weight: 700; color: #1a365d; margin-bottom: 4px; }
        .chart-subtitle { font-size: 0.78rem; color: #718096; margin-bottom: 16px; }
        .chart-wrap { position: relative; height: 360px; }

        .legend-note {
          display: flex; align-items: center; gap: 16px;
          font-size: 0.78rem; color: #718096; margin-top: 8px;
        }
        .legend-item { display: flex; align-items: center; gap: 6px; }
        .line-solid { width: 24px; height: 3px; background: #666; }
        .line-dashed {
          width: 24px; height: 3px;
          background: repeating-linear-gradient(to right, #666 0, #666 4px, transparent 4px, transparent 8px);
        }

        .data-table-wrap {
          background: white; border-radius: 12px; padding: 20px;
          box-shadow: 0 2px 12px rgba(0,0,0,0.05); margin-bottom: 20px; overflow-x: auto;
        }
        .table-title { font-size: 0.95rem; font-weight: 700; color: #1a365d; margin-bottom: 14px; }
        .tab-buttons { display: flex; gap: 8px; margin-bottom: 14px; }
        
        .tab-btn {
          padding: 6px 14px; border-radius: 16px; border: 2px solid #2b6cb0;
          cursor: pointer; font-size: 0.82rem; font-weight: 600;
          transition: all 0.2s; background: white; color: #2b6cb0;
        }
        .tab-btn.active { background: #2b6cb0; color: white; }

        table { border-collapse: collapse; width: 100%; font-size: 0.82rem; }
        th {
          background: #1a365d; color: white; padding: 8px 12px;
          text-align: center; white-space: nowrap; font-weight: 600;
        }
        th.highlight { background: #2b6cb0; }
        td {
          padding: 8px 12px; text-align: center;
          border-bottom: 1px solid #e2e8f0; white-space: nowrap;
        }
        tr:hover td { background: #ebf8ff; }
        td.estimated { color: #a0aec0; font-style: italic; }
        td.pnu { background: #ebf8ff; font-weight: 600; color: #2b6cb0; }
        tr:nth-child(even) td { background: #f7fafc; }
        tr:nth-child(even):hover td { background: #ebf8ff; }
        .fac-footer { text-align: center; font-size: 0.78rem; color: #a0aec0; padding: 10px; }
      `}</style>

      {/* Header Section */}
      <div className="fac-header">
        <h1>전임교원 1인당 대학원생 수 비교 — 주요 8개 대학 (2016~2025)</h1>
        <p>출처: 대학알리미 공시정보 | 대학원 재적학생 현황 (4-마) | 교원 강의담당비율 학교별 상세 (8-다)</p>
      </div>

      {/* Notice Alert */}
      <div className="fac-notice">
        ⚠️ <strong>데이터 안내:</strong> 전임교원 수는 2021~2025년 대학알리미 실제 공시 데이터, <em>2016~2020년은 2021~2025년 추세 기반 선형 추정값</em>입니다 (표에서 이탤릭체 표시). 한양대학교 전임교원은 2021년 공시 미수록으로 2022~2025년 추세 사용.<br />
        📌 <strong>대학원 재학생 범위:</strong> <span class="scope-badge">일반대학원 + 전문대학원</span> 재적학생(재학생+휴학생) 합계 기준. <u>특수대학원 제외.</u> 대학원 재학생 수는 전 기간 실제 데이터.
      </div>

      {/* University Selection Toggle */}
      <div className="fac-controls">
        <h3>대학 선택 / 해제</h3>
        <div className="btn-group">
          <button className="btn-all" onClick={toggleAll}>전체 선택/해제</button>
          {UNIS.map(u => {
            const isVisible = visibleUnis[u.name];
            return (
              <button 
                key={u.name}
                className={`btn-toggle ${isVisible ? 'active' : ''}`}
                style={{
                  borderColor: u.color,
                  backgroundColor: isVisible ? u.color : 'white',
                  color: isVisible ? 'white' : u.color
                }}
                onClick={() => toggleUni(u.name)}
              >
                <span className="dot"></span>
                {u.alias}
              </button>
            );
          })}
        </div>
      </div>

      {/* Charts Grid */}
      <div className="charts-container">
        <div className="chart-card">
          <div className="chart-title">📊 전임교원 수 변화 (2016~2025)</div>
          <div className="chart-subtitle">단위: 명 | 점선·연한색: 추정값 구간 (2016~2020)</div>
          <div className="chart-wrap">
            <Line 
              data={makeChartData(FACULTY)} 
              options={getChartOptions('전임교원 수 (명)', 400)} 
            />
          </div>
          <div className="legend-note">
            <div className="legend-item"><div className="line-solid"></div> 실제 데이터 (2021~2025)</div>
            <div className="legend-item"><div className="line-dashed"></div> 추정 데이터 (2016~2020)</div>
          </div>
        </div>

        <div className="chart-card">
          <div className="chart-title">📈 전임교원 1인당 대학원 재학생 수 (2016~2025)</div>
          <div className="chart-subtitle">단위: 명/교원 | 일반대학원 + 전문대학원 재학생 합계 기준</div>
          <div className="chart-wrap">
            <Line 
              data={makeChartData(RATIO)} 
              options={getChartOptions('전임교원 1인당 대학원생 (명)', 3)} 
            />
          </div>
          <div className="legend-note">
            <div className="legend-item"><div className="line-solid"></div> 실제 데이터</div>
            <div className="legend-item"><div className="line-dashed"></div> 추정 포함 구간</div>
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="data-table-wrap">
        <div className="table-title">📋 연도별 상세 데이터</div>
        <div className="tab-buttons">
          <button 
            className={`tab-btn ${tableType === 'faculty' ? 'active' : ''}`}
            onClick={() => setTableType('faculty')}
          >
            전임교원 수
          </button>
          <button 
            className={`tab-btn ${tableType === 'grad' ? 'active' : ''}`}
            onClick={() => setTableType('grad')}
          >
            대학원 재학생 수
          </button>
          <button 
            className={`tab-btn ${tableType === 'ratio' ? 'active' : ''}`}
            onClick={() => setTableType('ratio')}
          >
            전임교원 1인당 대학원생
          </button>
        </div>
        
        {renderTable()}
      </div>

      <div className="fac-footer">
        생성일: 2026-04-28 | 대학원 재학생(일반+전문대학원): 대학알리미 4-마. 재적학생현황 | 전임교원: 대학알리미 8-다. 교원강의담당비율 학교별 (2021~2025 실측, 2016~2020 선형추정)
      </div>
    </div>
  );
}

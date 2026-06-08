import React, { useState, useEffect } from 'react';
import { Bar } from 'react-chartjs-2';
import { D } from '../lib/uglink_data';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const { years, rows } = D;

// Distinct color generator based on text
function colorMap(arr) {
  const map = {};
  const palette = [
    '#4e79a7', '#f28e2b', '#e15759', '#76b7b2', '#59a14f',
    '#edc948', '#b07aa1', '#ff9da7', '#9c755f', '#bab0ac',
    '#583e72', '#a56184', '#e28f83', '#a7d129', '#3e64ff',
    '#6807f9', '#07f9a2', '#f90768', '#f9bc07', '#0768f9'
  ];
  arr.forEach((val, i) => {
    map[val] = palette[i % palette.length];
  });
  return map;
}

export default function UGLinkDashboard() {
  const [activePage, setActivePage] = useState(1); // 1 or 2
  
  // Page 1 States
  const [p1Metric, setP1Metric] = useState('prog'); // 'prog', 'src', 'dst'
  
  // Page 2 States
  const colleges = [...new Set(rows.map(r => r.sd))].sort();
  const [p2College, setP2College] = useState('공과대학');
  const [p2Dept, setP2Dept] = useState('__ALL__');
  
  const deptsInCollege = [...new Set(rows.filter(r => r.sd === p2College).map(r => r.sc))].sort();

  // Reset department when college changes
  useEffect(() => {
    setP2Dept('__ALL__');
  }, [p2College]);

  // Page 1 Data Calculation
  const totalApplicants = rows.length;
  const programCounts = {
    '학.석사연계과정': rows.filter(r => r.g === '학.석사연계과정').length,
    '학.석박사통합 연계과정': rows.filter(r => r.g === '학.석박사통합 연계과정').length,
  };
  const currentYearApplicants = rows.filter(r => r.y === 2026).length;

  const renderPage1KPIs = () => {
    return (
      <div className="kpi-row">
        <div className="kpi">
          <div className="num">{totalApplicants.toLocaleString()}</div>
          <div className="lbl">누적 총 신청자 수 (명)</div>
        </div>
        <div className="kpi">
          <div className="num">{programCounts['학.석사연계과정'].toLocaleString()}</div>
          <div className="lbl">학·석사연계과정 (명)</div>
        </div>
        <div className="kpi">
          <div className="num">{programCounts['학.석박사통합 연계과정'].toLocaleString()}</div>
          <div className="lbl">학·석박사통합연계과정 (명)</div>
        </div>
        <div className="kpi">
          <div className="num">{currentYearApplicants.toLocaleString()}</div>
          <div className="lbl">당해연도(2026) 신청자 수 (명)</div>
        </div>
      </div>
    );
  };

  const getPage1ChartDataAndOptions = () => {
    let datasets = [];
    let title = '';

    if (p1Metric === 'prog') {
      title = '프로그램별 연도별 신청 추이';
      const programs = [...new Set(rows.map(r => r.g))].sort();
      const cm = colorMap(programs);
      datasets = programs.map(p => ({
        label: p,
        data: years.map(y => rows.filter(r => r.y === y && r.g === p).length),
        backgroundColor: cm[p],
        stack: 'stack1'
      }));
    } else if (p1Metric === 'src') {
      title = '소속 대학별 연도별 신청 추이';
      const srcColleges = [...new Set(rows.map(r => r.sd))].sort();
      const cm = colorMap(srcColleges);
      datasets = srcColleges.map(c => ({
        label: c,
        data: years.map(y => rows.filter(r => r.y === y && r.sd === c).length),
        backgroundColor: cm[c],
        stack: 'stack1'
      }));
    } else {
      title = '진학 대학별 연도별 신청 추이';
      const dstColleges = [...new Set(rows.map(r => r.td))].sort();
      const cm = colorMap(dstColleges);
      datasets = dstColleges.map(c => ({
        label: c,
        data: years.map(y => rows.filter(r => r.y === y && r.td === c).length),
        backgroundColor: cm[c],
        stack: 'stack1'
      }));
    }

    const data = {
      labels: years.map(y => y + '년'),
      datasets
    };

    const options = {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: { stacked: true },
        y: { stacked: true, title: { display: true, text: '신청자 수 (명)' } }
      },
      plugins: {
        legend: {
          position: 'right',
          labels: { boxWidth: 12, font: { size: 10 } }
        }
      }
    };

    return { data, options, title };
  };

  // Page 2 Data Calculation
  const getPage2Charts = () => {
    const isAll = p2Dept === '__ALL__';
    let dataX = {}, dataY = {}, titleX = '', titleY = '';

    if (isAll) {
      titleX = `[${p2College}] 학부 학과별 신청자 수`;
      const srcRows = rows.filter(r => r.sd === p2College);
      const depts = [...new Set(srcRows.map(r => r.sc))].sort();
      const cmX = colorMap(depts);
      const datasetsX = depts.map(d => ({
        label: d,
        data: years.map(y => srcRows.filter(r => r.y === y && r.sc === d).length),
        backgroundColor: cmX[d],
        stack: 's'
      }));
      dataX = { labels: years.map(y => y + '년'), datasets: datasetsX };

      titleY = `[${p2College}] 대학원 허가학과별 신청자 수`;
      const dstRows = rows.filter(r => r.td === p2College);
      const hkDepts = [...new Set(dstRows.map(r => r.tc))].sort();
      const cmY = colorMap(hkDepts);
      const datasetsY = hkDepts.map(d => ({
        label: d,
        data: years.map(y => dstRows.filter(r => r.y === y && r.tc === d).length),
        backgroundColor: cmY[d],
        stack: 's'
      }));
      dataY = { labels: years.map(y => y + '년'), datasets: datasetsY };

    } else {
      titleX = `[${p2College}] ${p2Dept} 신청자 수`;
      const srcRows = rows.filter(r => r.sd === p2College && r.sc === p2Dept);
      dataX = {
        labels: years.map(y => y + '년'),
        datasets: [{
          label: p2Dept,
          data: years.map(y => srcRows.filter(r => r.y === y).length),
          backgroundColor: '#4e79a7',
          borderRadius: 4
        }]
      };

      titleY = `[${p2College}] ${p2Dept} → 대학원 허가학과별 진학 분포`;
      const hkDepts = [...new Set(srcRows.map(r => r.tc))].sort();
      const cmY = colorMap(hkDepts);
      const datasetsY = hkDepts.map(d => ({
        label: d,
        data: years.map(y => srcRows.filter(r => r.y === y && r.tc === d).length),
        backgroundColor: cmY[d],
        stack: 's'
      }));
      dataY = { labels: years.map(y => y + '년'), datasets: datasetsY };
    }

    const options = {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: { stacked: !isAll ? false : true },
        y: { stacked: true, title: { display: true, text: '신청자 수 (명)' } }
      },
      plugins: {
        legend: {
          display: !isAll && p2Dept !== '__ALL__' ? false : true,
          position: 'right',
          labels: { boxWidth: 11, font: { size: 10 } }
        }
      }
    };

    return { dataX, dataY, titleX, titleY, options };
  };

  const p1 = getPage1ChartDataAndOptions();
  const p2 = getPage2Charts();

  return (
    <div style={{ padding: '20px', backgroundColor: '#f0f2f5', fontFamily: '"Apple SD Gothic Neo", sans-serif', color: '#333' }}>
      {/* Local Scoped Styles */}
      <style>{`
        .tab-bar { display: flex; background: #1a1a2e; padding: 0 20px; border-radius: 8px 8px 0 0; }
        .tab-btn {
          padding: 14px 28px; color: #aaa; cursor: pointer; border: none; background: none;
          border-bottom: 3px solid transparent; font-size: 14px; font-weight: 600; transition: .2s;
        }
        .tab-btn.active { color: #fff; border-bottom-color: #4e79a7; }
        
        .dashboard-content {
          background: #fff; border-radius: 0 0 8px 8px; padding: 20px; box-shadow: 0 4px 12px rgba(0,0,0,0.05);
        }
        
        .ctrl-row {
          display: flex; align-items: center; gap: 16px; background: #fafafa;
          border-radius: 10px; padding: 14px 20px; margin-bottom: 18px;
          border: 1px solid #eee;
        }
        .ctrl-row label { font-weight: 600; color: #555; white-space: nowrap; }
        .ctrl-select {
          padding: 8px 12px; border: 1px solid #ccc; border-radius: 6px;
          font-size: 13px; background: white; cursor: pointer; min-width: 180px; outline: none;
        }

        .kpi-row { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px; margin-bottom: 18px; }
        .kpi {
          background: #fbfbfc; border-radius: 10px; padding: 18px; text-align: center;
          border: 1px solid #eef0f4; box-shadow: 0 2px 6px rgba(0,0,0,0.02);
        }
        .kpi .num { font-size: 28px; font-weight: 700; color: #4e79a7; }
        .kpi .lbl { font-size: 11px; color: #888; margin-top: 6px; }

        .card { background: white; border-radius: 10px; padding: 20px; border: 1px solid #eee; margin-bottom: 16px; }
        .card h3 { font-size: 13px; font-weight: 700; color: #444; margin: 0 0 14px 0; border-left: 4px solid #4e79a7; padding-left: 8px; }
        
        .chart-wrap-lg { position: relative; height: 400px; width: 100%; }
        .two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
        @media (max-width: 900px) { .two-col { grid-template-columns: 1fr; } }
      `}</style>

      {/* Brand Header */}
      <div style={{ background: 'linear-gradient(135deg, #111827 0%, #1f2937 100%)', color: 'white', padding: '16px 20px', borderRadius: '8px', marginBottom: '16px' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>학석사 연계과정 지원현황 데이터룸</h2>
        <p style={{ fontSize: '0.8rem', opacity: 0.8, margin: '4px 0 0 0' }}>부산대학교 AI 거점대학육성사업단 / 연계 지원 데이터 아카이브 (2016~2026)</p>
      </div>

      {/* Tabs */}
      <div className="tab-bar">
        <button className={`tab-btn ${activePage === 1 ? 'active' : ''}`} onClick={() => setActivePage(1)}>
          📊 페이지 1 · 전체 추이
        </button>
        <button className={`tab-btn ${activePage === 2 ? 'active' : ''}`} onClick={() => setActivePage(2)}>
          🔍 페이지 2 · 대학·학과별 분석
        </button>
      </div>

      <div className="dashboard-content">
        {/* PAGE 1 */}
        {activePage === 1 && (
          <div>
            <div className="ctrl-row">
              <label>구분 선택</label>
              <select className="ctrl-select" value={p1Metric} onChange={(e) => setP1Metric(e.target.value)}>
                <option value="prog">프로그램 기준</option>
                <option value="src">소속 대학 기준</option>
                <option value="dst">진학 대학 기준</option>
              </select>
            </div>
            
            {renderPage1KPIs()}

            <div className="card">
              <h3>{p1.title}</h3>
              <div className="chart-wrap-lg">
                <Bar data={p1.data} options={p1.options} />
              </div>
            </div>
          </div>
        )}

        {/* PAGE 2 */}
        {activePage === 2 && (
          <div>
            <div className="ctrl-row">
              <label>대학 구분</label>
              <select 
                className="ctrl-select" 
                value={p2College} 
                onChange={(e) => setP2College(e.target.value)}
              >
                {colleges.map(col => <option key={col} value={col}>{col}</option>)}
              </select>
              
              <label style={{ marginLeft: '16px' }}>학과 구분</label>
              <select 
                className="ctrl-select" 
                value={p2Dept} 
                onChange={(e) => setP2Dept(e.target.value)}
              >
                <option value="__ALL__">전체 학과</option>
                {deptsInCollege.map(dept => <option key={dept} value={dept}>{dept}</option>)}
              </select>
            </div>

            <div className="two-col">
              <div className="card">
                <h3>{p2.titleX}</h3>
                <div className="chart-wrap-lg">
                  <Bar data={p2.dataX} options={p2.options} />
                </div>
              </div>
              <div className="card">
                <h3>{p2.titleY}</h3>
                <div className="chart-wrap-lg">
                  <Bar data={p2.dataY} options={p2.options} />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

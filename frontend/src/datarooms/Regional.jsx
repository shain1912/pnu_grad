import React, { useEffect, useState, useRef } from 'react';

// Common Data from source HTML
const YEARS = [2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025];

const COLORS = {
  '동남권': { line: '#e74c3c', marker: '#c0392b', width: 3.5 },
  '수도권': { line: '#2563b0', marker: '#1a4a8a', width: 2 },
  '대경권': { line: '#27ae60', marker: '#1d8348', width: 2 },
  '호남권': { line: '#8e44ad', marker: '#6c3483', width: 2 },
  '중부권': { line: '#e67e22', marker: '#ca6f1e', width: 2 },
  '전북특별자치도': { line: '#16a085', marker: '#0e6655', width: 2 },
  '강원특별자치도': { line: '#2980b9', marker: '#1a5276', width: 2 },
  '제주특별자치도': { line: '#7f8c8d', marker: '#616a6b', width: 2 }
};

const populationData = {
  '수도권': [25390486, 25519439, 25713241, 25892678, 26043325, 26081700, 26124421, 26225829, 26307956, 26307956],
  '동남권': [7946150, 7919288, 7895744, 7863593, 7817495, 7751019, 7687105, 7658184, 7628394, 7628394],
  '대경권': [5513922, 5575873, 5625939, 5654967, 5651092, 5646691, 5674458, 5714410, 5741820, 5741820],
  '호남권': [3297574, 3288491, 3280444, 3277273, 3266380, 3253386, 3240403, 3233758, 3222509, 3222509],
  '중부권': [5143171, 5130099, 5117314, 5098094, 5055457, 5023225, 4987225, 4969068, 4948334, 4948334],
  '전북특별자치도': [1833168, 1826174, 1818157, 1807423, 1802766, 1787053, 1774248, 1768491, 1758836, 1758836],
  '강원특별자치도': [1521751, 1521386, 1520391, 1520127, 1521763, 1521890, 1528037, 1528014, 1522881, 1522881],
  '제주특별자치도': [623332, 641757, 658282, 665048, 670858, 673107, 676375, 676767, 674817, 674817]
};

const nominalGRDPData = {
  '수도권': [927344768, 993249280, 1046478910, 1066163549, 1091322357, 1175232554, 1229066121, 1265405067, 1352044474, 1352044474],
  '동남권': [281717044, 284052590, 287377956, 293005563, 280687323, 304502318, 325648052, 345054410, 366264372, 366264372],
  '대경권': [225432684, 243459166, 251471850, 254575718, 259303899, 280659380, 292459812, 299408839, 316135871, 316135871],
  '호남권': [115806770, 119279266, 121754368, 124241285, 126902031, 141078859, 145391888, 150216709, 158807582, 158807582],
  '중부권': [169766605, 174449698, 176157314, 176294449, 174670729, 185250747, 191738695, 199771364, 209222713, 209222713],
  '전북특별자치도': [50102714, 52196096, 53437977, 55083789, 56361767, 59431746, 61285279, 63751865, 66792381, 66792381],
  '강원특별자치도': [44677444, 47451175, 49092745, 51349811, 51573015, 55267031, 57723494, 62160748, 64615611, 64615611],
  '제주특별자치도': [20020100, 21672308, 22040507, 22267086, 21668785, 22757094, 24282333, 26094554, 26928491, 26928491]
};

const realGRDPData = {
  '수도권': [964210953, 1007014534, 1051644331, 1081824471, 1091322357, 1145176667, 1182906101, 1199985778, 1229223788, 1229223788],
  '동남권': [292160361, 291174128, 294185678, 297675949, 280687323, 290129385, 298740577, 309015078, 318544080, 318544080],
  '대경권': [228958648, 242850956, 251028550, 258008582, 259303899, 272871064, 281133482, 281725892, 283035719, 283035719],
  '호남권': [120512911, 122750304, 124366008, 127260659, 126902031, 132379850, 132226102, 134587766, 138684005, 138684005],
  '중부권': [174877479, 175685440, 176654729, 178807128, 174670729, 180539670, 182682525, 185527169, 185980811, 185980811],
  '전북특별자치도': [52777144, 54489564, 55221867, 56458982, 56361767, 58223882, 58988748, 58395707, 59321350, 59321350],
  '강원특별자치도': [47177264, 49581920, 50631403, 52507151, 51573015, 54326451, 55031064, 56387533, 56169890, 56169890],
  '제주특별자치도': [21100823, 22564140, 22777044, 22951902, 21668785, 22346390, 23364427, 24143175, 24229274, 24229274]
};

const ugEnrollment = {
  '수도권': [785950, 784033, 786432, 780610, 776371, 781573, 770693, 778789, 780961, 789836],
  '동남권': [313108, 305233, 298915, 288946, 283053, 274711, 261752, 252489, 245874, 242857],
  '대경권': [230572, 223626, 217860, 210897, 208079, 202207, 195386, 188229, 185881, 187328],
  '중부권': [401876, 393553, 389323, 379678, 373340, 365143, 357911, 347441, 343089, 342091],
  '호남권': [136392, 133433, 132107, 128537, 127047, 123679, 120053, 113685, 110662, 107465],
  '전북특별자치도': [92180, 89230, 87245, 85044, 84798, 83015, 79230, 74444, 72457, 71101],
  '강원특별자치도': [106774, 103770, 100605, 98275, 96007, 92973, 89386, 86457, 84193, 83738],
  '제주특별자치도': [17955, 17741, 17546, 16471, 15663, 14953, 14288, 13840, 13508, 13204]
};
const UG_TOTAL = YEARS.map((_, i) => Object.values(ugEnrollment).reduce((s, v) => s + v[i], 0));

const gradEnrollment = {
  '수도권': [186371, 182912, 181548, 180418, 182245, 187434, 192575, 196676, 200754, 205014],
  '동남권': [34327, 33821, 33276, 32672, 32248, 32795, 32943, 32575, 32922, 33351],
  '대경권': [26240, 25429, 24424, 23738, 23705, 24044, 24144, 23971, 24237, 25511],
  '호남권': [17539, 16889, 16388, 15527, 15495, 15771, 15839, 16165, 16665, 16847],
  '중부권': [47458, 46779, 46887, 46568, 46846, 47545, 48271, 47500, 47971, 50647],
  '전북특별자치도': [10330, 10126, 9853, 10074, 9940, 9733, 9908, 9375, 9098, 9371],
  '강원특별자치도': [7437, 7258, 7063, 7682, 7617, 7642, 7839, 7980, 8359, 8733],
  '제주특별자치도': [3066, 3101, 2793, 2561, 2499, 2451, 2388, 2354, 2319, 2300]
};
const GRAD_TOTAL = YEARS.map((_, i) => Object.values(gradEnrollment).reduce((s, v) => s + v[i], 0));

// Common Utility functions
function getRegions(sel) {
  if (sel === '5극') return ['동남권', '수도권', '대경권', '중부권', '호남권'];
  if (sel === '3특') return ['동남권', '전북특별자치도', '강원특별자치도', '제주특별자치도'];
  if (sel === '전체') return ['동남권', '수도권', '대경권', '중부권', '호남권', '전북특별자치도', '강원특별자치도', '제주특별자치도'];
  return ['동남권', sel];
}

function metricLabelShort(metric, kind) {
  const k = kind === 'ug' ? '학부' : '대학원';
  const m = {
    population: `인구기준 ${k} 재적학생수 비교`,
    nominalGRDP: `명목 GRDP 기준 ${k} 재적학생수 비교`,
    realGRDP: `실질 GRDP 기준 ${k} 재적학생수 비교`,
    absolute: `절대 ${k} 재적학생수 비교`,
    share: `전국 대비 ${k} 학생 수 비중 비교`
  };
  return m[metric] || '';
}

function metricUnit(metric) {
  if (metric === 'population') return '명 / 인구 1,000명';
  if (metric === 'nominalGRDP') return '명 / 명목 GRDP 10억원';
  if (metric === 'realGRDP') return '명 / 실질 GRDP 10억원';
  if (metric === 'absolute') return '명';
  if (metric === 'share') return '% (전국 대비)';
  return '';
}

function calcVal(enroll, total, metric, region, idx) {
  const e = enroll[region][idx];
  if (metric === 'absolute') return e;
  if (metric === 'share') return e / total[idx] * 100;
  if (metric === 'population') return e / populationData[region][idx] * 1000;
  if (metric === 'nominalGRDP') return e * 1000 / nominalGRDPData[region][idx];
  if (metric === 'realGRDP') return e * 1000 / realGRDPData[region][idx];
  return 0;
}

function fmtVal(v, metric) {
  if (v === null || v === undefined) return '-';
  if (metric === 'absolute') return Math.round(v).toLocaleString('ko-KR');
  if (metric === 'share') return v.toFixed(2) + '%';
  if (metric === 'population') return v.toFixed(3);
  return v.toFixed(4);
}

// React Custom hook to load Plotly.js CDN
function usePlotly() {
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    if (window.Plotly) {
      setLoaded(true);
      return;
    }
    const script = document.createElement('script');
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/plotly.js/2.26.0/plotly.min.js";
    script.async = true;
    script.onload = () => setLoaded(true);
    document.head.appendChild(script);
  }, []);
  return loaded;
}

export default function Regional() {
  const plotlyLoaded = usePlotly();
  const trendChartRef = useRef(null);
  const barChartRef = useRef(null);

  // States
  const [pageTab, setPageTab] = useState('ug'); // 'ug' or 'grad'
  const [metric, setMetric] = useState('population');
  const [regionSel, setRegionSel] = useState('5극');
  const [startYear, setStartYear] = useState(2016);
  const [endYear, setEndYear] = useState(2025);
  const [innerTab, setInnerTab] = useState('trend'); // 'trend', 'bar', 'table'
  const [barYear, setBarYear] = useState(2025);

  const activeEnrollment = pageTab === 'ug' ? ugEnrollment : gradEnrollment;
  const activeTotal = pageTab === 'ug' ? UG_TOTAL : GRAD_TOTAL;
  const regions = getRegions(regionSel);

  // Derived Indices
  const idxs = YEARS.map((y, i) => (y >= startYear && y <= endYear ? i : -1)).filter(i => i >= 0);

  // Sync Year selection
  const handleStartYearChange = (e) => {
    const val = parseInt(e.target.value);
    setStartYear(val);
    if (val > endYear) {
      setEndYear(val);
    }
  };

  const handleEndYearChange = (e) => {
    const val = parseInt(e.target.value);
    setEndYear(val);
    if (val < startYear) {
      setStartYear(val);
    }
  };

  // Re-render chart on configuration changes
  useEffect(() => {
    if (!plotlyLoaded || !window.Plotly) return;

    if (innerTab === 'trend' && trendChartRef.current) {
      const yrs = idxs.map(i => YEARS[i]);
      const traces = regions.map(r => {
        const c = COLORS[r];
        const isDN = r === '동남권';
        return {
          x: yrs,
          y: idxs.map(i => calcVal(activeEnrollment, activeTotal, metric, r, i)),
          name: r + (isDN ? ' ★' : ''),
          mode: 'lines+markers',
          line: { color: c.line, width: isDN ? 3.5 : 2, shape: 'spline' },
          marker: {
            color: c.marker,
            size: isDN ? 11 : 7,
            symbol: isDN ? 'star' : 'circle',
            line: { color: 'white', width: isDN ? 1.5 : 1 }
          },
          hovertemplate: `<b>${r}${isDN ? ' ★' : ''}</b><br>%{x}년: ${
            metric === 'share' ? '%{y:.2f}%' : metric === 'absolute' ? '%{y:,.0f}명' : '%{y:.4f}'
          }<extra></extra>`
        };
      });

      const tickFmt = metric === 'share' ? '.2f' : metric === 'absolute' ? ',.0f' : metric === 'population' ? '.3f' : '.4f';

      window.Plotly.react(trendChartRef.current, traces, {
        xaxis: {
          tickmode: 'array',
          tickvals: yrs,
          ticktext: yrs.map(y => y + '년'),
          gridcolor: '#eef1f8',
          linecolor: '#ccd0dc',
          tickfont: { size: 12 }
        },
        yaxis: {
          title: { text: metricUnit(metric), font: { size: 12 } },
          gridcolor: '#eef1f8',
          linecolor: '#ccd0dc',
          tickformat: tickFmt,
          rangemode: 'tozero'
        },
        legend: {
          orientation: 'h',
          y: -0.28,
          x: 0.5,
          xanchor: 'center',
          font: { size: 12 },
          bgcolor: 'rgba(255,255,255,0.8)',
          bordercolor: '#dde4f0',
          borderwidth: 1
        },
        plot_bgcolor: '#fbfcff',
        paper_bgcolor: 'rgba(0,0,0,0)',
        margin: { t: 20, r: 30, b: 90, l: 80 },
        hovermode: 'x unified',
        hoverlabel: { bgcolor: 'white', bordercolor: '#c5d0e6', font: { size: 12 } },
        font: { family: 'Noto Sans KR, sans-serif' }
      }, {
        responsive: true,
        displayModeBar: true,
        modeBarButtonsToRemove: ['select2d', 'lasso2d'],
        displaylogo: false
      });
    }

    if (innerTab === 'bar' && barChartRef.current) {
      const idx = YEARS.indexOf(barYear);
      const vals = regions.map(r => calcVal(activeEnrollment, activeTotal, metric, r, idx));
      const colors = regions.map(r => COLORS[r]?.line || '#888');
      const isDNs = regions.map(r => r === '동남권');

      window.Plotly.react(barChartRef.current, [{
        x: regions.map((r, i) => r + (isDNs[i] ? ' ★' : '')),
        y: vals,
        type: 'bar',
        marker: {
          color: colors,
          opacity: 0.85,
          line: {
            color: isDNs.map(d => (d ? '#7b241c' : 'rgba(0,0,0,0.1)')),
            width: isDNs.map(d => (d ? 2 : 0.5))
          }
        },
        text: vals.map(v => fmtVal(v, metric)),
        textposition: 'outside',
        hovertemplate: `<b>%{x}</b><br>${barYear}년: %{text}<extra></extra>`
      }], {
        xaxis: { tickangle: -15, tickfont: { size: 12 } },
        yaxis: { title: { text: metricUnit(metric) }, gridcolor: '#eef0f6', rangemode: 'tozero' },
        plot_bgcolor: '#fbfcff',
        paper_bgcolor: 'rgba(0,0,0,0)',
        margin: { t: 30, r: 20, b: 80, l: 80 },
        bargap: 0.35,
        font: { family: 'Noto Sans KR, sans-serif' }
      }, {
        responsive: true,
        displayModeBar: false
      });
    }
  }, [plotlyLoaded, pageTab, metric, regionSel, startYear, endYear, innerTab, barYear]);

  // Handle resizing on window resize
  useEffect(() => {
    const handleResize = () => {
      if (!window.Plotly) return;
      if (innerTab === 'trend' && trendChartRef.current) {
        window.Plotly.Plots.resize(trendChartRef.current);
      }
      if (innerTab === 'bar' && barChartRef.current) {
        window.Plotly.Plots.resize(barChartRef.current);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [innerTab]);

  // Info Bar Data Calculation
  const lastIdx = innerTab === 'bar' ? [YEARS.indexOf(barYear)] : idxs;
  const targetYearIdx = lastIdx[lastIdx.length - 1];
  const firstYearIdx = lastIdx[0];

  const targetYear = YEARS[targetYearIdx];
  const firstYear = YEARS[firstYearIdx];

  const dnV = calcVal(activeEnrollment, activeTotal, metric, '동남권', targetYearIdx);
  const dnF = calcVal(activeEnrollment, activeTotal, metric, '동남권', firstYearIdx);
  const chg = dnF !== 0 ? ((dnV - dnF) / dnF * 100).toFixed(1) : '0.0';
  const isChgPositive = parseFloat(chg) >= 0;

  const otherRegions = regions.filter(r => r !== '동남권')
    .map(r => ({ r, v: calcVal(activeEnrollment, activeTotal, metric, r, targetYearIdx) }))
    .sort((a, b) => b.v - a.v);

  const topRegion = otherRegions[0] || { r: 'N/A', v: 1 };
  const topRatio = topRegion.v !== 0 ? (dnV / topRegion.v * 100).toFixed(1) : '0.0';

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto', color: '#2c3e50' }}>
      {/* CSS Styles locally scoped via React */}
      <style>{`
        .regional-container {
          font-family: 'Noto Sans KR', 'Apple SD Gothic Neo', sans-serif;
        }
        .header-section {
          background: linear-gradient(90deg, #1a3a6b 0%, #2563b0 60%, #1d78c8 100%);
          color: white; padding: 20px 24px; border-radius: 12px;
          margin-bottom: 20px; box-shadow: 0 4px 12px rgba(30,70,160,0.15);
        }
        .header-section h1 { font-size: 1.45rem; font-weight: 700; margin: 0; }
        .header-section p { font-size: 0.83rem; opacity: 0.85; margin: 4px 0 0 0; }
        
        .page-tabs {
          display: flex; border-bottom: 2px solid #dde4f0; margin-bottom: 20px;
        }
        .page-tab-btn {
          padding: 12px 20px; font-size: 0.95rem; font-weight: 700;
          color: #7a8eae; background: none; border: none; cursor: pointer;
          border-bottom: 3px solid transparent; transition: all 0.2s;
          margin-bottom: -2px; display: flex; align-items: center; gap: 8px;
        }
        .page-tab-btn:hover { color: #2563b0; }
        .page-tab-btn.ug.active { color: #1a3a6b; border-bottom-color: #2563b0; }
        .page-tab-btn.grad.active { color: #7b241c; border-bottom-color: #e74c3c; }
        .page-tab-btn .badge {
          font-size: 0.7rem; padding: 2px 6px; border-radius: 10px; font-weight: 600;
        }
        .page-tab-btn.ug .badge { background: #dbeafe; color: #1e40af; }
        .page-tab-btn.grad .badge { background: #fee2e2; color: #9b1c1c; }

        .controls-wrapper {
          background: white; border-radius: 12px; border: 1px solid #dde4f0;
          padding: 16px 20px; box-shadow: 0 2px 6px rgba(0,0,0,0.02); margin-bottom: 20px;
        }
        .controls-row {
          display: flex; flex-wrap: wrap; gap: 18px; align-items: flex-end;
        }
        .control-group { display: flex; flex-direction: column; gap: 6px; }
        .control-group label {
          font-size: 0.76rem; font-weight: 600; color: #5570a0;
          text-transform: uppercase; letter-spacing: 0.4px;
        }
        .control-select {
          padding: 8px 12px; border: 1.5px solid #c5d0e6;
          border-radius: 8px; background: white; font-size: 0.9rem; color: #2c3e50;
          cursor: pointer; min-width: 160px; outline: none; transition: border-color 0.2s;
        }
        .control-select:focus { border-color: #2563b0; }
        
        .info-bar { display: flex; gap: 14px; flex-wrap: wrap; margin-bottom: 20px; }
        .info-card {
          background: white; border-radius: 12px; box-shadow: 0 2px 12px rgba(30,60,140,0.06);
          padding: 14px 18px; flex: 1; min-width: 160px; border-top: 4px solid #e74c3c;
          border-left: 1px solid #eef0f6; border-right: 1px solid #eef0f6; border-bottom: 1px solid #eef0f6;
        }
        .info-card.blue { border-top-color: #2563b0; }
        .info-card.green { border-top-color: #27ae60; }
        .info-card.orange { border-top-color: #e67e22; }
        .info-card label { font-size: 0.73rem; font-weight: 600; color: #7a8eae; }
        .info-card .value { font-size: 1.35rem; font-weight: 700; color: #1a3a6b; margin-top: 4px; }
        .info-card .sub { font-size: 0.76rem; color: #aab; margin-top: 2px; }

        .chart-card {
          background: white; border-radius: 16px; border: 1px solid #dde4f0;
          box-shadow: 0 4px 20px rgba(30,60,140,0.05);
          padding: 24px 24px 18px; margin-bottom: 20px;
        }
        .inner-tab-bar {
          display: flex; gap: 4px; margin-bottom: 18px; border-bottom: 2px solid #dde4f0;
        }
        .inner-tab-btn {
          padding: 8px 16px; font-size: 0.88rem; font-weight: 600; color: #7a8eae;
          background: none; border: none; cursor: pointer;
          border-bottom: 3px solid transparent; transition: all 0.2s; margin-bottom: -2px;
        }
        .inner-tab-btn:hover { color: #2563b0; }
        .inner-tab-btn.active { color: #1a3a6b; border-bottom-color: #2563b0; }
        
        .chart-title { font-size: 1rem; font-weight: 700; color: #1a3a6b; margin-bottom: 4px; }
        .chart-subtitle { font-size: 0.8rem; color: #7a8eae; margin-bottom: 16px; }

        table { width: 100%; border-collapse: collapse; font-size: 0.86rem; margin-top: 14px; }
        th {
          background: #2563b0; color: white; padding: 10px;
          text-align: center; font-weight: 600; white-space: nowrap;
        }
        td { padding: 9px 10px; text-align: right; border-bottom: 1px solid #eef0f6; white-space: nowrap; }
        td:first-child { text-align: left; font-weight: 600; color: #1a3a6b; }
        tr.dn-row td { background: #fff5f5; }
        tr.dn-row td:first-child { color: #c0392b; }
        tr:nth-child(even) td { background: #f8faff; }
        tr.dn-row:nth-child(even) td { background: #fff0f0; }
        .neg { color: #c0392b; font-weight: 700; }
        .pos { color: #27ae60; font-weight: 700; }
        
        .note {
          background: #fff8e8; border-left: 4px solid #f39c12;
          padding: 10px 16px; border-radius: 0 8px 8px 0;
          font-size: 0.8rem; color: #8a6d0a; margin-top: 16px; line-height: 1.5;
        }
        .dongnam-badge {
          display: inline-block; background: #e74c3c; color: white;
          font-size: 0.68rem; font-weight: 700; padding: 2px 7px;
          border-radius: 10px; margin-left: 6px;
        }
      `}</style>

      <div className="regional-container">
        {/* Header */}
        <div className="header-section">
          <h1>🎓 동남권 학부·대학원 재적학생수 통합 비교</h1>
          <p>동남권을 기준으로 대학(학부) 및 대학원 재적학생수를 인구·GRDP·비중 기준으로 타 지역과 비교 (2016–2025)</p>
        </div>

        {/* Page Tabs */}
        <div className="page-tabs">
          <button 
            className={`page-tab-btn ug ${pageTab === 'ug' ? 'active' : ''}`}
            onClick={() => setPageTab('ug')}
          >
            🏫 학부(대학) 재적학생수 비교 <span className="badge">UG</span>
          </button>
          <button 
            className={`page-tab-btn grad ${pageTab === 'grad' ? 'active' : ''}`}
            onClick={() => setPageTab('grad')}
          >
            🎓 대학원 재적학생수 비교 <span className="badge">GRAD</span>
          </button>
        </div>

        {/* Controls */}
        <div className="controls-wrapper">
          <div className="controls-row">
            <div className="control-group">
              <label>📊 지표 기준</label>
              <select 
                className="control-select" 
                value={metric} 
                onChange={(e) => setMetric(e.target.value)}
              >
                <option value="population">인구기준 (인구 1,000명당 학생 수)</option>
                <option value="nominalGRDP">명목 GRDP 기준 (10억원당 학생 수)</option>
                <option value="realGRDP">실질 GRDP 기준 (10억원당 학생 수)</option>
                <option value="absolute">절대 재적학생수 (명)</option>
                <option value="share">학생 수 비중 (% / 전국)</option>
              </select>
            </div>
            
            <div className="control-group">
              <label>🗺 비교 지역 <span className="dongnam-badge">동남권 고정</span></label>
              <select 
                className="control-select" 
                value={regionSel} 
                onChange={(e) => setRegionSel(e.target.value)}
              >
                <option value="5극">5극 (수도권·동남권·대경권·중부권·호남권)</option>
                <option value="3특">3특 (동남권·전북·강원·제주)</option>
                <option value="전체">전체 권역</option>
                <option value="수도권">동남권 vs 수도권</option>
                <option value="대경권">동남권 vs 대경권</option>
                <option value="중부권">동남권 vs 중부권</option>
                <option value="호남권">동남권 vs 호남권</option>
                <option value="전북특별자치도">동남권 vs 전북특별자치도</option>
                <option value="강원특별자치도">동남권 vs 강원특별자치도</option>
                <option value="제주특별자치도">동남권 vs 제주특별자치도</option>
              </select>
            </div>

            {innerTab !== 'bar' && (
              <div className="control-group">
                <label>📅 비교 기간</label>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <select className="control-select" style={{ minWidth: '90px' }} value={startYear} onChange={handleStartYearChange}>
                    {YEARS.map(y => <option key={y} value={y}>{y}년</option>)}
                  </select>
                  <span style={{ color: '#7a8eae' }}>~</span>
                  <select className="control-select" style={{ minWidth: '90px' }} value={endYear} onChange={handleEndYearChange}>
                    {YEARS.map(y => <option key={y} value={y}>{y}년</option>)}
                  </select>
                </div>
              </div>
            )}

            {innerTab === 'bar' && (
              <div className="control-group">
                <label>📅 비교 연도</label>
                <select className="control-select" style={{ minWidth: '100px' }} value={barYear} onChange={(e) => setBarYear(parseInt(e.target.value))}>
                  {YEARS.map(y => <option key={y} value={y}>{y}년</option>)}
                </select>
              </div>
            )}
          </div>
        </div>

        {/* Info Bar */}
        <div className="info-bar">
          <div className="info-card">
            <label>동남권 ({targetYear}년)</label>
            <div className="value">{fmtVal(dnV, metric)}</div>
            <div className="sub">{metricUnit(metric)}</div>
          </div>
          <div className="info-card blue">
            <label>동남권 변화율 ({firstYear}→{targetYear})</label>
            <div className="value" style={{ color: isChgPositive ? '#27ae60' : '#e74c3c' }}>
              {isChgPositive ? '+' : ''}{chg}%
            </div>
            <div className="sub">기간 내 증감률</div>
          </div>
          {otherRegions.length > 0 && (
            <>
              <div className="info-card green">
                <label>비교 지역 최고 ({targetYear}년)</label>
                <div className="value" style={{ fontSize: '1.05rem' }}>{topRegion.r}</div>
                <div className="sub">{fmtVal(topRegion.v, metric)}</div>
              </div>
              <div className="info-card orange">
                <label>동남권 / 최고 비율</label>
                <div className="value">{topRatio}%</div>
                <div className="sub">vs {topRegion.r}</div>
              </div>
            </>
          )}
        </div>

        {/* Chart Card */}
        <div className="chart-card">
          <div className="inner-tab-bar">
            <button className={`inner-tab-btn ${innerTab === 'trend' ? 'active' : ''}`} onClick={() => setInnerTab('trend')}>📈 추이 비교</button>
            <button className={`inner-tab-btn ${innerTab === 'bar' ? 'active' : ''}`} onClick={() => setInnerTab('bar')}>📊 연도별 막대</button>
            <button className={`inner-tab-btn ${innerTab === 'table' ? 'active' : ''}`} onClick={() => setInnerTab('table')}>📋 데이터 표</button>
          </div>

          {!plotlyLoaded && <div style={{ height: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>차트 라이브러리 로딩 중...</div>}

          {plotlyLoaded && (
            <>
              {innerTab === 'trend' && (
                <div>
                  <div className="chart-title">{metricLabelShort(metric, pageTab)}</div>
                  <div className="chart-subtitle">{startYear}–{endYear}년 추이 | {metricUnit(metric)}</div>
                  <div ref={trendChartRef} style={{ width: '100%', height: '500px' }}></div>
                </div>
              )}

              {innerTab === 'bar' && (
                <div>
                  <div className="chart-title">{barYear}년 {metricLabelShort(metric, pageTab)}</div>
                  <div className="chart-subtitle">비교 연도를 선택하여 지역별 수치 비교</div>
                  <div ref={barChartRef} style={{ width: '100%', height: '400px' }}></div>
                </div>
              )}

              {innerTab === 'table' && (
                <div>
                  <div className="chart-title">{metricLabelShort(metric, pageTab)}</div>
                  <div className="chart-subtitle">단위: {metricUnit(metric)}</div>
                  <div style={{ overflowX: 'auto' }}>
                    <table>
                      <thead>
                        <tr>
                          <th>권역</th>
                          {idxs.map(i => <th key={YEARS[i]}>{YEARS[i]}년</th>)}
                          <th>변화량</th>
                          <th>변화율</th>
                        </tr>
                      </thead>
                      <tbody>
                        {regions.map(r => {
                          const isDN = r === '동남권';
                          const vals = idxs.map(i => calcVal(activeEnrollment, activeTotal, metric, r, i));
                          const diff = vals[vals.length - 1] - vals[0];
                          const pct = vals[0] !== 0 ? (diff / vals[0] * 100).toFixed(1) : '0.0';
                          const isNeg = parseFloat(pct) < 0;

                          return (
                            <tr key={r} className={isDN ? 'dn-row' : ''}>
                              <td>{r}{isDN ? ' ★' : ''}</td>
                              {vals.map((v, i) => <td key={i}>{fmtVal(v, metric)}</td>)}
                              <td className={isNeg ? 'neg' : 'pos'}>{fmtVal(diff, metric)}</td>
                              <td className={isNeg ? 'neg' : 'pos'}>
                                {parseFloat(pct) > 0 ? '+' : ''}{pct}%
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          )}

          <div className="note">
            ※ 출처: 한국교육개발원 교육기본통계 / 지역별 GRDP 및 인구 통계 (각 연도)<br />
            ※ 수도권=서울·인천·경기 / 동남권=부산·울산·경남 / 대경권=대구·경북 / 중부권=대전·세종·충남·충북 / 호남권=광주·전남<br />
            ※ 2025년 인구 및 GRDP 자료는 2024년 수치를 적용 (미확정) | ★ = 동남권
          </div>
        </div>
      </div>
    </div>
  );
}

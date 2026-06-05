/**
 * Charts for the "AX 목표 현황" section.
 * Uses Chart.js (window.Chart, vendored UMD). No-op if Chart.js or the
 * canvases are absent, so the page still works without it.
 */
export function initCharts() {
  const Chart = window.Chart;
  if (!Chart) return;

  const CYAN = '#39e0ff';
  const VIOLET = '#7b5cff';
  const INK = '#aab6d6';
  const GRID = 'rgba(155, 190, 255, 0.12)';

  Chart.defaults.color = INK;
  Chart.defaults.font.family = "'Inter', system-ui, sans-serif";

  // --- Line: 행정 효율화 만족도 (추진 전 → 2027) ---
  const lineEl = document.getElementById('chart-line');
  if (lineEl) {
    new Chart(lineEl, {
      type: 'line',
      data: {
        labels: ['추진 전', '2025', '2026', '2027'],
        datasets: [{
          label: '행정 만족도 (점)',
          data: [70, 75, 80, 90],
          borderColor: CYAN,
          backgroundColor: 'rgba(57, 224, 255, 0.16)',
          borderWidth: 3,
          fill: true,
          tension: 0.35,
          pointBackgroundColor: '#eaffff',
          pointBorderColor: CYAN,
          pointRadius: 5,
          pointHoverRadius: 7,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          y: { min: 60, max: 100, grid: { color: GRID }, ticks: { stepSize: 10 } },
          x: { grid: { color: GRID } },
        },
      },
    });
  }

  // --- Radar: 4대 전략 + AI 인프라, 현재 vs 2027 목표 ---
  const radarEl = document.getElementById('chart-radar');
  if (radarEl) {
    new Chart(radarEl, {
      type: 'radar',
      data: {
        labels: ['AI 철학', '융합 연구', '증강 교육', '적응 행정', 'AI 인프라'],
        datasets: [
          {
            label: '현재 달성 (2026.3 기준)',
            data: [85, 70, 65, 72, 75],
            borderColor: CYAN,
            backgroundColor: 'rgba(57, 224, 255, 0.22)',
            borderWidth: 2,
            pointBackgroundColor: CYAN,
          },
          {
            label: '2027 목표',
            data: [100, 100, 100, 100, 100],
            borderColor: VIOLET,
            backgroundColor: 'rgba(123, 92, 255, 0.14)',
            borderWidth: 2,
            borderDash: [5, 4],
            pointBackgroundColor: VIOLET,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { position: 'bottom', labels: { boxWidth: 12, padding: 16 } } },
        scales: {
          r: {
            min: 0,
            max: 100,
            grid: { color: GRID },
            angleLines: { color: GRID },
            pointLabels: { font: { size: 12 } },
            ticks: { display: false, stepSize: 25 },
          },
        },
      },
    });
  }
}

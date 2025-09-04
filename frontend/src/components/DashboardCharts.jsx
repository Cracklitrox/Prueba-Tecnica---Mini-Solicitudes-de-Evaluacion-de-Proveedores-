import React from 'react';
import * as d3 from 'd3';

const CHART_COLORS = [
  '#4CAF50',
  '#FFC107',
  '#F44336',
  '#2196F3',
  '#9E9E9E',
];

// --- Gráfico de Torta (Pie Chart) ---
const PieChart = ({ data }) => {
  const width = 280, height = 280, margin = 20;
  const radius = Math.min(width, height) / 2 - margin;

  const pie = d3.pie().value(d => d.value).sort(null);
  const arc = d3.arc().innerRadius(radius * 0.6).outerRadius(radius);
  const outerArc = d3.arc().innerRadius(radius * 0.9).outerRadius(radius * 0.9);

  const colorScale = d3.scaleOrdinal()
      .domain(['pending', 'in_review', 'approved', 'rejected', 'Bajo', 'Medio', 'Alto'])
      .range(['#2196F3', '#FFC107', '#4CAF50', '#F44336', '#4CAF50', '#FFC107', '#F44336']);

  const pieData = pie(data);

  return (
    <div style={{ padding: '1rem', border: '1px solid #333', borderRadius: '8px', backgroundColor: '#2a2a2a' }}>
      <h4 style={{ textAlign: 'center', marginBottom: '1.5rem', color: '#fff' }}>Solicitudes por Estado</h4>
      <svg width={width} height={height} style={{ overflow: 'visible' }}>
        <g transform={`translate(${width / 2},${height / 2})`}>
          {pieData.map((d, i) => (
            <React.Fragment key={i}>
              {}
              <path
                d={arc(d)}
                fill={colorScale(d.data.label)}
                className="pie-slice"
              >
                 <animate attributeName="d" from="M0,0L0,0A0,0 0 0,1 0,0Z" to={arc(d)} dur="0.7s" fill="freeze" />
              </path>
              {}
              <text
                transform={`translate(${outerArc.centroid(d)})`}
                dy=".35em"
                textAnchor="middle"
                fill="white"
                style={{ fontSize: '0.8rem', opacity: 0 }}
              >
                {}
                <animate attributeName="opacity" from="0" to="1" begin="0.8s" dur="0.5s" fill="freeze" />
                {d.data.label} ({d.data.value})
              </text>
            </React.Fragment>
          ))}
        </g>
      </svg>
    </div>
  );
};

// --- Gráfico de Barras (Bar Chart) ---
const BarChart = ({ data }) => {
    const width = 380, height = 280, margin = { top: 20, right: 20, bottom: 40, left: 50 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const x = d3.scaleBand().range([0, innerWidth]).padding(0.3).domain(data.map(d => d.label));
    const y = d3.scaleLinear().range([innerHeight, 0]).domain([0, d3.max(data, d => d.value) + 1 || 5]);

    const colorScale = d3.scaleOrdinal()
      .domain(['Bajo', 'Medio', 'Alto'])
      .range(['#4CAF50', '#FFC107', '#F44336']);

    return (
        <div style={{ padding: '1rem', border: '1px solid #333', borderRadius: '8px', backgroundColor: '#2a2a2a' }}>
            <h4 style={{ textAlign: 'center', marginBottom: '1.5rem', color: '#fff' }}>Solicitudes por Nivel de Riesgo</h4>
            <svg width={width} height={height}>
                <g transform={`translate(${margin.left},${margin.top})`}>
                    {}
                    <g transform={`translate(0,${innerHeight})`}>
                        {x.domain().map(d => (
                            <g key={d} transform={`translate(${x(d) + x.bandwidth() / 2}, 0)`}>
                                <text dy="1em" textAnchor="middle" fill="white" fontSize="0.9rem">{d}</text>
                            </g>
                        ))}
                    </g>
                    {}
                    <g>
                        {y.ticks(5).map(d => (
                            <g key={d} transform={`translate(0, ${y(d)})`}>
                                <line x2={innerWidth} stroke="rgba(255,255,255,0.1)" />
                                <text x="-8" dy="0.32em" textAnchor="end" fill="white" fontSize="0.8rem">{d}</text>
                            </g>
                        ))}
                    </g>
                    {}
                    {data.map((d, i) => (
                        <rect
                            key={d.label}
                            x={x(d.label)}
                            y={innerHeight}
                            width={x.bandwidth()}
                            height={0}
                            fill={colorScale(d.label)}
                            className="bar-rect"
                        >
                            <animate
                                attributeName="y"
                                from={innerHeight}
                                to={y(d.value)}
                                dur="0.6s"
                                begin={`${i * 0.1}s`}
                                fill="freeze"
                            />
                            <animate
                                attributeName="height"
                                from="0"
                                to={innerHeight - y(d.value)}
                                dur="0.6s"
                                begin={`${i * 0.1}s`}
                                fill="freeze"
                            />
                        </rect>
                    ))}
                </g>
            </svg>
        </div>
    );
};


export const DashboardCharts = ({ requests }) => {
  const statusCounts = requests.reduce((acc, req) => {
    acc[req.status] = (acc[req.status] || 0) + 1;
    return acc;
  }, {});
  const pieChartData = Object.entries(statusCounts).map(([label, value]) => ({ label, value }));

  const riskLevels = { 'Bajo': 0, 'Medio': 0, 'Alto': 0 };
  requests.forEach(req => {
    if (req.risk_score <= 39) riskLevels['Bajo']++;
    else if (req.risk_score <= 69) riskLevels['Medio']++;
    else riskLevels['Alto']++;
  });
  const barChartData = Object.entries(riskLevels).map(([label, value]) => ({ label, value }));

  return (
    <div className="charts-container" style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem', justifyContent: 'center', padding: '2rem', backgroundColor: '#242424', borderRadius: '8px', marginBottom: '2rem' }}>
      <PieChart data={pieChartData} />
      <BarChart data={barChartData} />
    </div>
  );
};
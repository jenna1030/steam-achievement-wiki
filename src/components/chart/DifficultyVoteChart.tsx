import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'
import type { DifficultyVote as DifficultyVoteData } from '../../types/checklist'

const colors = ['#0f7a5f', '#d59b2d', '#d76b3f', '#8f3f71']

interface DifficultyVoteChartProps {
  vote?: DifficultyVoteData
}

export function DifficultyVoteChart({ vote }: DifficultyVoteChartProps) {
  const data = [
    { name: '쉬움', value: vote?.easy ?? 0 },
    { name: '보통', value: vote?.normal ?? 0 },
    { name: '어려움', value: vote?.hard ?? 0 },
    { name: '매우 어려움', value: vote?.veryHard ?? 0 },
  ]
  const total = data.reduce((sum, item) => sum + item.value, 0)

  return (
    <section className="chart-panel">
      <div className="section-heading">
        <p className="eyebrow">Vote Chart</p>
        <h2>난이도 투표 분포</h2>
      </div>
      {total > 0 ? (
        <div className="chart-box compact-chart">
          <ResponsiveContainer height={240} width="100%">
            <PieChart>
              <Pie data={data} dataKey="value" innerRadius={54} outerRadius={86} paddingAngle={2}>
                {data.map((entry, index) => (
                  <Cell fill={colors[index]} key={entry.name} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="empty-state">
          <p className="muted">아직 투표 데이터가 없습니다.</p>
        </div>
      )}
    </section>
  )
}

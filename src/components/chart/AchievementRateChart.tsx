import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { Achievement } from '../../types/achievement'

interface AchievementRateChartProps {
  achievements: Achievement[]
}

export function AchievementRateChart({
  achievements,
}: AchievementRateChartProps) {
  const data = achievements
    .slice()
    .sort((a, b) => b.globalRate - a.globalRate)
    .slice(0, 6)
    .map((achievement) => ({
      name: achievement.title.length > 12 ? `${achievement.title.slice(0, 12)}...` : achievement.title,
      rate: achievement.globalRate,
    }))

  return (
    <section className="chart-panel">
      <div className="section-heading">
        <p className="eyebrow">Rate Chart</p>
        <h2>달성률 상위 도전과제</h2>
      </div>
      <div className="chart-box">
        <ResponsiveContainer height={260} width="100%">
          <BarChart data={data}>
            <CartesianGrid stroke="#ded2c1" strokeDasharray="3 3" />
            <XAxis dataKey="name" tick={{ fontSize: 12 }} />
            <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
            <Tooltip />
            <Bar dataKey="rate" fill="#c9140b" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  )
}

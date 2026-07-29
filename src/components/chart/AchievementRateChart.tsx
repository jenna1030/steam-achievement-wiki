import { Link, useNavigate } from 'react-router-dom'
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
import type { Game } from '../../types/game'

interface AchievementRateChartProps {
  achievements: Achievement[]
  games: Game[]
}

interface ChartAchievement {
  achievement: Achievement
  gameTitle: string
  label: string
  rate: number
}

function getChartData(
  achievements: Achievement[],
  games: Game[],
  direction: 'high' | 'low',
) {
  const gamesById = new Map(games.map((game) => [game.id, game.title]))

  return achievements
    .slice()
    .sort((a, b) =>
      direction === 'high'
        ? b.globalRate - a.globalRate
        : a.globalRate - b.globalRate,
    )
    .slice(0, 6)
    .map((achievement): ChartAchievement => {
      const gameTitle = gamesById.get(achievement.gameId) ?? '게임 정보 없음'
      const title =
        achievement.title.length > 10
          ? `${achievement.title.slice(0, 10)}...`
          : achievement.title

      return {
        achievement,
        gameTitle,
        label: `${title} / ${gameTitle}`,
        rate: achievement.globalRate,
      }
    })
}

function RateChartBlock({
  data,
  title,
}: {
  data: ChartAchievement[]
  title: string
}) {
  const navigate = useNavigate()

  return (
    <div className="rate-chart-block">
      <h3>{title}</h3>
      <div className="chart-box">
        <ResponsiveContainer height={260} width="100%">
          <BarChart data={data}>
            <CartesianGrid stroke="#ded2c1" strokeDasharray="3 3" />
            <XAxis dataKey="label" tick={{ fontSize: 11 }} />
            <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
            <Tooltip
              formatter={(value) => [`${value}%`, '달성률']}
              labelFormatter={(_, payload) => {
                const item = payload[0]?.payload as ChartAchievement | undefined

                return item
                  ? `${item.achievement.title} / ${item.gameTitle}`
                  : ''
              }}
            />
            <Bar
              dataKey="rate"
              fill="#c9140b"
              radius={[6, 6, 0, 0]}
              cursor="pointer"
              onClick={(barData: unknown) => {
                const item = (barData as { payload?: ChartAchievement }).payload

                if (item) {
                  navigate(`/achievements/${item.achievement.id}`, {
                    state: { achievement: item.achievement },
                  })
                }
              }}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="rate-rank-list">
        {data.map((item) => (
          <Link
            key={item.achievement.id}
            state={{ achievement: item.achievement }}
            to={`/achievements/${item.achievement.id}`}
          >
            <span>{item.achievement.title}</span>
            <small>{item.gameTitle}</small>
            <strong>{item.rate}%</strong>
          </Link>
        ))}
      </div>
    </div>
  )
}

export function AchievementRateChart({
  achievements,
  games,
}: AchievementRateChartProps) {
  const highRateData = getChartData(achievements, games, 'high')
  const lowRateData = getChartData(achievements, games, 'low')

  return (
    <section className="chart-panel">
      <div className="section-heading">
        <p className="eyebrow">Rate Chart</p>
        <h2>도전과제 달성률 순위</h2>
      </div>
      <div className="rate-chart-grid">
        <RateChartBlock data={highRateData} title="달성률 상위 도전과제" />
        <RateChartBlock data={lowRateData} title="달성률 하위 도전과제" />
      </div>
    </section>
  )
}

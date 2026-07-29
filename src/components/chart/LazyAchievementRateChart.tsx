import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import type { Achievement } from '../../types/achievement'
import type { Game } from '../../types/game'

const AchievementRateChart = lazy(() =>
  import('./AchievementRateChart').then((module) => ({
    default: module.AchievementRateChart,
  })),
)

interface LazyAchievementRateChartProps {
  achievements: Achievement[]
  games: Game[]
}

export function LazyAchievementRateChart({
  achievements,
  games,
}: LazyAchievementRateChartProps) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const [shouldLoad, setShouldLoad] = useState(false)

  useEffect(() => {
    const target = containerRef.current

    if (!target || !('IntersectionObserver' in window)) {
      setShouldLoad(true)
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0].isIntersecting) {
          return
        }

        setShouldLoad(true)
        observer.disconnect()
      },
      { rootMargin: '320px' },
    )

    observer.observe(target)

    return () => observer.disconnect()
  }, [])

  return (
    <div className="lazy-chart-container" ref={containerRef}>
      {shouldLoad ? (
        <Suspense
          fallback={
            <p className="chart-loading-placeholder" role="status">
              달성률 차트를 불러오는 중입니다.
            </p>
          }
        >
          <AchievementRateChart
            achievements={achievements}
            games={games}
          />
        </Suspense>
      ) : (
        <p className="chart-loading-placeholder">
          화면에 가까워지면 달성률 차트를 불러옵니다.
        </p>
      )}
    </div>
  )
}

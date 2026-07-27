import { useState } from 'react'
import { Link } from 'react-router-dom'
import type { AchievementGuide, SpoilerLevel } from '../../types/guide'

const spoilerOptions: Array<{
  level: SpoilerLevel
  label: string
  helper: string
}> = [
  {
    level: 'hint',
    label: '힌트만 보기',
    helper: '핵심 단서만 가볍게 확인합니다.',
  },
  {
    level: 'detail',
    label: '자세한 공략 보기',
    helper: '진행 위치와 조건을 확인합니다.',
  },
  {
    level: 'spoiler',
    label: '스포일러 포함',
    helper: '정확한 조건과 결과까지 확인합니다.',
  },
]

interface SpoilerGuideTabsProps {
  guide: AchievementGuide
  onDelete?: () => void
}

export function SpoilerGuideTabs({ guide, onDelete }: SpoilerGuideTabsProps) {
  const [selectedLevel, setSelectedLevel] = useState<SpoilerLevel>('hint')
  const selectedOption = spoilerOptions.find(
    (option) => option.level === selectedLevel,
  )

  return (
    <article className="guide-card">
      <div className="guide-header">
        <div>
          <p>{guide.author}</p>
          <h3>{guide.title}</h3>
        </div>
        <dl>
          <div>
            <dt>난이도</dt>
            <dd>{guide.difficulty}</dd>
          </div>
          <div>
            <dt>예상 시간</dt>
            <dd>{guide.estimatedMinutes}분</dd>
          </div>
        </dl>
      </div>
      {guide.source === 'user' && (
        <div className="guide-actions">
          <Link className="text-link" to={`/guides/new?guideId=${guide.id}`}>
            수정
          </Link>
          <button className="secondary-button" type="button" onClick={onDelete}>
            삭제
          </button>
        </div>
      )}

      <div className="spoiler-tab-list" role="tablist" aria-label="공략 공개 단계">
        {spoilerOptions.map((option) => (
          <button
            className={
              option.level === selectedLevel
                ? 'spoiler-tab is-active'
                : 'spoiler-tab'
            }
            key={option.level}
            type="button"
            role="tab"
            aria-selected={option.level === selectedLevel}
            onClick={() => setSelectedLevel(option.level)}
          >
            {option.label}
          </button>
        ))}
      </div>

      <section className="spoiler-panel" role="tabpanel">
        <p className="eyebrow">{selectedOption?.label}</p>
        <p className="muted">{selectedOption?.helper}</p>
        <strong>{guide[selectedLevel]}</strong>
      </section>

      <section className="guide-detail-grid" aria-label="공략 부가 정보">
        <div>
          <h4>달성 조건</h4>
          <ul>
            {guide.conditions.map((condition) => (
              <li key={condition}>{condition}</li>
            ))}
          </ul>
        </div>
        <div>
          <h4>준비물</h4>
          <ul>
            {guide.supplies.map((supply) => (
              <li key={supply}>{supply}</li>
            ))}
          </ul>
        </div>
        <div>
          <h4>진행 순서</h4>
          <ol>
            {guide.recommendedOrder.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
        </div>
        <div>
          <h4>주의사항</h4>
          <ul>
            {guide.warnings.map((warning) => (
              <li key={warning}>{warning}</li>
            ))}
          </ul>
        </div>
      </section>
    </article>
  )
}

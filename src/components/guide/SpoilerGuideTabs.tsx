import { useState, type KeyboardEvent } from 'react'
import { Link } from 'react-router-dom'
import { useAuthStore } from '../../stores/authStore'
import {
  useGuideFeedbackStore,
  type GuideReaction,
} from '../../stores/guideFeedbackStore'
import type { AchievementGuide, SpoilerLevel } from '../../types/guide'
import { getGuideFeedbackKey } from '../../utils/guideFeedback'

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
  collapsible?: boolean
  onDelete?: () => void
}

export function SpoilerGuideTabs({
  guide,
  collapsible = false,
  onDelete,
}: SpoilerGuideTabsProps) {
  const actorSteamId = useAuthStore((state) => state.user?.steamId ?? null)
  const reactions = useGuideFeedbackStore((state) => state.reactions)
  const reports = useGuideFeedbackStore((state) => state.reports)
  const toggleReaction = useGuideFeedbackStore(
    (state) => state.toggleReaction,
  )
  const reportGuide = useGuideFeedbackStore((state) => state.reportGuide)
  const visibleSpoilerOptions = spoilerOptions.filter(
    (option) =>
      guide[option.level].trim().length > 0 &&
      (option.level !== 'spoiler' || guide.hasSpoiler),
  )
  const initialLevel = visibleSpoilerOptions[0]?.level ?? 'hint'
  const [selectedLevel, setSelectedLevel] =
    useState<SpoilerLevel>(initialLevel)
  const [isExpanded, setIsExpanded] = useState(!collapsible)
  const activeLevel = visibleSpoilerOptions.some(
    (option) => option.level === selectedLevel,
  )
    ? selectedLevel
    : initialLevel
  const selectedOption = visibleSpoilerOptions.find(
    (option) => option.level === activeLevel,
  )
  const guideTags = guide.tags.length > 0 ? guide.tags : ['태그 없음']
  const guideNotices = [
    guide.dlcRequirement === 'required' ? 'DLC 필요' : null,
    guide.dlcRequirement === 'not-required' ? '본편만으로 가능' : null,
    guide.multiplayerRequirement === 'required'
      ? '멀티플레이 필요'
      : null,
    guide.multiplayerRequirement === 'not-required'
      ? '싱글 플레이 가능'
      : null,
    guide.isMissable ? '놓치기 쉬움' : null,
    guide.requiresSecondRun ? '2회차 필요' : null,
  ].filter((notice): notice is string => Boolean(notice))
  const feedbackKey = getGuideFeedbackKey(guide.id, actorSteamId)
  const selectedReaction = reactions[feedbackKey]
  const isReported = reports.includes(feedbackKey)
  const isOwnGuide =
    guide.source !== 'example' && guide.ownerSteamId === actorSteamId
  const likeCount = guide.likeCount + (selectedReaction === 'like' ? 1 : 0)
  const dislikeCount =
    guide.dislikeCount + (selectedReaction === 'dislike' ? 1 : 0)
  const panelId = `guide-${guide.id}-panel`
  const contentId = `guide-${guide.id}-content`
  const selectedTabId = `guide-${guide.id}-${activeLevel}-tab`

  const handleTabKeyDown = (
    event: KeyboardEvent<HTMLButtonElement>,
    currentIndex: number,
  ) => {
    const lastIndex = visibleSpoilerOptions.length - 1
    let nextIndex: number | null = null

    if (event.key === 'ArrowRight') {
      nextIndex = currentIndex === lastIndex ? 0 : currentIndex + 1
    } else if (event.key === 'ArrowLeft') {
      nextIndex = currentIndex === 0 ? lastIndex : currentIndex - 1
    } else if (event.key === 'Home') {
      nextIndex = 0
    } else if (event.key === 'End') {
      nextIndex = lastIndex
    }

    if (nextIndex === null) {
      return
    }

    event.preventDefault()
    const nextOption = visibleSpoilerOptions[nextIndex]

    setSelectedLevel(nextOption.level)
    document
      .getElementById(`guide-${guide.id}-${nextOption.level}-tab`)
      ?.focus()
  }

  const handleReaction = (reaction: GuideReaction) => {
    if (!isOwnGuide) {
      toggleReaction(guide.id, actorSteamId, reaction)
    }
  }

  return (
    <article className={`guide-card${isExpanded ? ' is-expanded' : ''}`}>
      <div className="guide-header">
        <div>
          <div className="guide-author-row">
            <p>{guide.author}</p>
            {guide.source === 'example' && (
              <span className="guide-source-badge">예시 공략</span>
            )}
          </div>
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

      <div className="guide-labels">
        <div className="tag-row">
          {guideTags.map((tag) => (
            <span key={tag}>{tag}</span>
          ))}
        </div>
        {guideNotices.length > 0 && (
          <div className="notice-row">
            {guideNotices.map((notice) => (
              <span key={notice}>{notice}</span>
            ))}
          </div>
        )}
      </div>

      <div className="guide-toolbar">
        <div className="guide-feedback-actions" aria-label="공략 평가">
          <button
            aria-pressed={selectedReaction === 'like'}
            className={selectedReaction === 'like' ? 'is-selected' : ''}
            disabled={isOwnGuide}
            title={isOwnGuide ? '내 공략은 평가할 수 없습니다.' : undefined}
            type="button"
            onClick={() => handleReaction('like')}
          >
            좋아요 {likeCount}
          </button>
          <button
            aria-pressed={selectedReaction === 'dislike'}
            className={selectedReaction === 'dislike' ? 'is-selected' : ''}
            disabled={isOwnGuide}
            title={isOwnGuide ? '내 공략은 평가할 수 없습니다.' : undefined}
            type="button"
            onClick={() => handleReaction('dislike')}
          >
            싫어요 {dislikeCount}
          </button>
          <button
            className="guide-report-button"
            disabled={isOwnGuide || isReported}
            type="button"
            onClick={() => reportGuide(guide.id, actorSteamId)}
          >
            {isReported ? '신고됨' : '신고'}
          </button>
        </div>

        <div className="guide-management-actions">
          {onDelete && (
            <>
              <Link
                className="text-link"
                to={`/guides/new?guideId=${guide.id}`}
              >
                수정
              </Link>
              <button
                className="secondary-button"
                type="button"
                onClick={onDelete}
              >
                삭제
              </button>
            </>
          )}
          {collapsible && (
            <button
              aria-controls={contentId}
              aria-expanded={isExpanded}
              className="guide-toggle-button"
              type="button"
              onClick={() => setIsExpanded((expanded) => !expanded)}
            >
              {isExpanded ? '공략 접기' : '공략 펼쳐보기'}
            </button>
          )}
        </div>
      </div>

      {isExpanded && (
        <div className="guide-expanded-content" id={contentId}>
          {visibleSpoilerOptions.length > 0 ? (
            <>
              <div
                className="spoiler-tab-list"
                role="tablist"
                aria-label="공략 공개 단계"
              >
                {visibleSpoilerOptions.map((option, index) => (
                  <button
                    className={
                      option.level === activeLevel
                        ? 'spoiler-tab is-active'
                        : 'spoiler-tab'
                    }
                    key={option.level}
                    id={`guide-${guide.id}-${option.level}-tab`}
                    type="button"
                    role="tab"
                    aria-controls={panelId}
                    aria-selected={option.level === activeLevel}
                    tabIndex={option.level === activeLevel ? 0 : -1}
                    onClick={() => setSelectedLevel(option.level)}
                    onKeyDown={(event) => handleTabKeyDown(event, index)}
                  >
                    {option.label}
                  </button>
                ))}
              </div>

              <section
                aria-labelledby={selectedTabId}
                className="spoiler-panel"
                id={panelId}
                role="tabpanel"
                tabIndex={0}
              >
                <p className="eyebrow">{selectedOption?.label}</p>
                <p className="muted">{selectedOption?.helper}</p>
                <strong>{guide[activeLevel]}</strong>
              </section>
            </>
          ) : (
            <p className="guide-content-empty">등록된 공략 내용이 없습니다.</p>
          )}

          {activeLevel !== 'hint' && (
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
          )}
        </div>
      )}
    </article>
  )
}

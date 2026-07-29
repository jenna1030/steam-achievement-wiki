import { useState } from 'react'
import { Link } from 'react-router-dom'
import { getExampleGuidesForAchievement } from '../data/exampleGuides'
import { useChecklistStore } from '../stores/checklistStore'
import { useAuthStore } from '../stores/authStore'
import { useGuideFeedbackStore } from '../stores/guideFeedbackStore'
import { useGuideStore } from '../stores/guideStore'
import type { ChecklistStatus } from '../types/checklist'
import type { SpoilerLevel } from '../types/guide'
import {
  getAchievementPath,
  getGameIdFromAchievementId,
} from '../utils/achievementIdentity'
import { isGuideOwnedBy } from '../utils/guideOwnership'
import {
  getEffectiveGuideLikeCount,
  selectMostLikedGuide,
} from '../utils/guideRanking'

const statusOptions: Array<{ value: ChecklistStatus; label: string }> = [
  { value: 'saved', label: '저장됨' },
  { value: 'in-progress', label: '진행 중' },
  { value: 'done', label: '완료' },
]

export function ChecklistPage() {
  const [expandedGuide, setExpandedGuide] = useState<{
    achievementId: string
    level: Extract<SpoilerLevel, 'hint' | 'detail'>
  } | null>(null)
  const items = useChecklistStore((state) => state.items)
  const user = useAuthStore((state) => state.user)
  const userGuides = useGuideStore((state) => state.userGuides)
  const guideReactions = useGuideFeedbackStore((state) => state.reactions)
  const updateStatus = useChecklistStore((state) => state.updateStatus)
  const updateMemo = useChecklistStore((state) => state.updateMemo)
  const toggleChecklist = useChecklistStore((state) => state.toggleChecklist)
  const doneCount = items.filter((item) => item.status === 'done').length
  const progressCount = items.filter((item) => item.status === 'in-progress').length

  return (
    <main className="page">
      <section className="page-header">
        <p className="eyebrow">Checklist</p>
        <h1>내 도전과제 체크리스트</h1>
        <p className="muted">
          저장한 Steam 도전과제의 진행 상태와 메모를 브라우저에 보관합니다.
        </p>
      </section>

      <section className="info-grid">
        <article>
          <strong>{items.length}</strong>
          <span>저장한 도전과제</span>
        </article>
        <article>
          <strong>{progressCount}</strong>
          <span>진행 중</span>
        </article>
        <article>
          <strong>{doneCount}</strong>
          <span>완료</span>
        </article>
      </section>

      {items.length > 0 ? (
        <section className="achievement-list">
          {items.map((item) => {
            const gameId =
              item.gameId ?? getGameIdFromAchievementId(item.achievementId)
            const ownedGuides = userGuides.filter(
              (targetGuide) =>
                targetGuide.achievementId === item.achievementId &&
                isGuideOwnedBy(targetGuide, user?.steamId),
            )
            const candidateGuides = [
              ...ownedGuides,
              ...getExampleGuidesForAchievement(item.achievementId),
            ]
            const guide = selectMostLikedGuide(
              candidateGuides,
              guideReactions,
              user?.steamId ?? null,
            )
            const guideLikeCount = guide
              ? getEffectiveGuideLikeCount(
                  guide,
                  guideReactions,
                  user?.steamId ?? null,
                )
              : 0
            const selectedGuideLevel =
              expandedGuide?.achievementId === item.achievementId
                ? expandedGuide.level
                : null
            const toggleGuidePreview = (
              level: Extract<SpoilerLevel, 'hint' | 'detail'>,
            ) => {
              setExpandedGuide((current) =>
                current?.achievementId === item.achievementId &&
                current.level === level
                  ? null
                  : { achievementId: item.achievementId, level },
              )
            }

            return (
              <article className="checklist-card" key={item.achievementId}>
                <div className="checklist-main-column">
                  <div className="checklist-achievement-summary">
                    {item.iconUrl && (
                      <img
                        src={item.iconUrl}
                        alt=""
                        className="achievement-icon"
                      />
                    )}
                    <div>
                      <p>
                        {gameId ? `Steam App #${gameId}` : 'Steam 도전과제'}
                      </p>
                      <h3>{item.title ?? `도전과제 #${item.achievementId}`}</h3>
                      <p className="muted">
                        {item.description ??
                          '상세 페이지를 열면 최신 Steam 정보를 다시 불러옵니다.'}
                      </p>
                      {item.tags && (
                        <div className="tag-row">
                          {item.tags.map((tag) => (
                            <span key={tag}>{tag}</span>
                          ))}
                        </div>
                      )}
                      {item.notices && item.notices.length > 0 && (
                        <div className="notice-row">
                          {item.notices.map((notice) => (
                            <span key={notice}>{notice}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="checklist-guide-actions">
                    <button
                      className={
                        selectedGuideLevel === 'hint'
                          ? 'secondary-button is-selected'
                          : 'secondary-button'
                      }
                      disabled={!guide}
                      title={guide ? undefined : '등록된 공략이 없습니다.'}
                      type="button"
                      onClick={() => toggleGuidePreview('hint')}
                    >
                      힌트 보기
                    </button>
                    <button
                      className={
                        selectedGuideLevel === 'detail'
                          ? 'secondary-button is-selected'
                          : 'secondary-button'
                      }
                      disabled={!guide}
                      title={guide ? undefined : '등록된 공략이 없습니다.'}
                      type="button"
                      onClick={() => toggleGuidePreview('detail')}
                    >
                      자세한 공략 보기
                    </button>
                    {!guide && (
                      <Link
                        className="text-link"
                        to={`/guides/new?achievementId=${encodeURIComponent(
                          item.achievementId,
                        )}`}
                      >
                        공략 작성
                      </Link>
                    )}
                  </div>
                  {guide && selectedGuideLevel && (
                    <section className="checklist-guide-preview">
                      <span className="checklist-guide-attribution">
                        좋아요 최다 · {guide.author} · 좋아요 {guideLikeCount}
                      </span>
                      <p className="eyebrow">
                        {selectedGuideLevel === 'hint'
                          ? '힌트'
                          : '자세한 공략'}
                      </p>
                      <strong>{guide[selectedGuideLevel]}</strong>
                    </section>
                  )}
                </div>
                <div className="checklist-controls">
                  <label>
                    진행 상태
                    <select
                      value={item.status}
                      onChange={(event) =>
                        updateStatus(
                          item.achievementId,
                          event.target.value as ChecklistStatus,
                        )
                      }
                    >
                      {statusOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    메모
                    <input
                      value={item.memo}
                      placeholder="진행 메모를 남겨보세요"
                      onChange={(event) =>
                        updateMemo(item.achievementId, event.target.value)
                      }
                    />
                  </label>
                </div>
                <footer className="checklist-card-footer">
                  <span className="disabled-link">최근 변경 {item.updatedAt}</span>
                  <div>
                    <Link
                      className="text-link"
                      to={getAchievementPath(item.achievementId)}
                    >
                      전체 상세 보기
                    </Link>
                    <button
                      className="danger-button"
                      type="button"
                      onClick={() => toggleChecklist(item.achievementId)}
                    >
                      체크리스트에서 제거
                    </button>
                  </div>
                </footer>
              </article>
            )
          })}
        </section>
      ) : (
        <section className="empty-state">
          <h2>저장한 도전과제가 없습니다.</h2>
          <p className="muted">
            도전과제 상세 페이지에서 체크리스트에 추가할 수 있습니다.
          </p>
          <Link className="button-link" to="/games">
            게임 보러가기
          </Link>
        </section>
      )}
    </main>
  )
}

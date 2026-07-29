import { Link } from 'react-router-dom'
import { useChecklistStore } from '../stores/checklistStore'
import type { ChecklistStatus } from '../types/checklist'
import {
  getAchievementPath,
  getGameIdFromAchievementId,
} from '../utils/achievementIdentity'

const statusOptions: Array<{ value: ChecklistStatus; label: string }> = [
  { value: 'saved', label: '저장됨' },
  { value: 'in-progress', label: '진행 중' },
  { value: 'done', label: '완료' },
]

export function ChecklistPage() {
  const items = useChecklistStore((state) => state.items)
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

            return (
              <article className="checklist-card" key={item.achievementId}>
                <div className="checklist-achievement-summary">
                  {item.iconUrl && (
                    <img src={item.iconUrl} alt="" className="achievement-icon" />
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
                <div className="card-actions">
                  <span className="disabled-link">최근 변경 {item.updatedAt}</span>
                  <button
                    className="secondary-button"
                    type="button"
                    onClick={() => toggleChecklist(item.achievementId)}
                  >
                    제거
                  </button>
                  <Link
                    className="text-link"
                    to={getAchievementPath(item.achievementId)}
                  >
                    상세 보기
                  </Link>
                </div>
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

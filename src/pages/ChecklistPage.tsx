import { Link } from 'react-router-dom'
import { achievements } from '../mocks/achievements'
import { useChecklistStore } from '../stores/checklistStore'
import type { ChecklistStatus } from '../types/checklist'

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
          저장한 도전과제의 진행 상태를 관리하는 페이지입니다.
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
            const achievement = achievements.find(
              (target) => target.id === item.achievementId,
            )

            return (
              <article className="checklist-card" key={item.achievementId}>
                <div>
                  <p>{achievement?.tags.join(', ') ?? '사용자 저장 항목'}</p>
                  <h3>{achievement?.title ?? '알 수 없는 도전과제'}</h3>
                  <p className="muted">
                    {achievement?.description ??
                      'Steam API로 가져온 항목은 상세 설명이 제한될 수 있습니다.'}
                  </p>
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
                  {achievement && (
                    <Link
                      className="text-link"
                      to={`/achievements/${achievement.id}`}
                    >
                      상세 보기
                    </Link>
                  )}
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

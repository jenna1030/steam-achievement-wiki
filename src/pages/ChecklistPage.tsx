import { checklistItems } from '../mocks/checklist'
import { achievements } from '../mocks/achievements'

export function ChecklistPage() {
  return (
    <main className="page">
      <section className="page-header">
        <p className="eyebrow">Checklist</p>
        <h1>내 도전과제 체크리스트</h1>
        <p className="muted">
          저장한 도전과제의 진행 상태를 관리하는 페이지입니다.
        </p>
      </section>

      <section className="achievement-list">
        {checklistItems.map((item) => {
          const achievement = achievements.find(
            (target) => target.id === item.achievementId,
          )

          return (
            <article className="achievement-card" key={item.achievementId}>
              <div>
                <p>{item.status}</p>
                <h3>{achievement?.title ?? '알 수 없는 도전과제'}</h3>
                <p className="muted">{item.memo}</p>
              </div>
              <dl>
                <div>
                  <dt>최근 변경</dt>
                  <dd>{item.updatedAt}</dd>
                </div>
              </dl>
              <button type="button">완료 체크</button>
            </article>
          )
        })}
      </section>
    </main>
  )
}

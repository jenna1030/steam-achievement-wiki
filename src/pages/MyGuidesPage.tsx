import { Link } from 'react-router-dom'
import { LoadingState } from '../components/common/LoadingState'
import { useAuthStore } from '../stores/authStore'
import { useGuideStore } from '../stores/guideStore'
import {
  getAchievementPath,
  getGameIdFromAchievementId,
} from '../utils/achievementIdentity'
import { getGuidesForOwner } from '../utils/guideOwnership'

export function MyGuidesPage() {
  const user = useAuthStore((state) => state.user)
  const authStatus = useAuthStore((state) => state.status)
  const userGuides = useGuideStore((state) =>
    getGuidesForOwner(state.userGuides, user?.steamId),
  )

  if (authStatus !== 'ready') {
    return (
      <main className="page">
        <LoadingState message="Steam 로그인 상태를 확인하는 중입니다." />
      </main>
    )
  }

  if (!user) {
    return (
      <main className="page">
        <section className="empty-state">
          <h1>로그인이 필요합니다.</h1>
          <p className="muted">
            Steam 계정으로 로그인하면 계정별로 저장된 공략을 확인할 수 있습니다.
          </p>
          <Link className="button-link" to="/login">
            로그인하러 가기
          </Link>
        </section>
      </main>
    )
  }

  return (
    <main className="page">
      <section className="page-header">
        <p className="eyebrow">My Guides</p>
        <h1>내가 작성한 공략</h1>
        <p className="muted">
          현재 브라우저에 저장한 공략을 확인하고 이어서 수정할 수 있습니다.
        </p>
        <Link className="text-link" to="/mypage">
          마이페이지로 돌아가기
        </Link>
      </section>

      {userGuides.length > 0 ? (
        <section className="my-guide-list" aria-label="내가 작성한 공략 목록">
          {userGuides.map((guide) => {
            const gameId = getGameIdFromAchievementId(guide.achievementId)

            return (
              <article className="my-guide-card" key={guide.id}>
                <div>
                  <p className="eyebrow">
                    {gameId ? `Steam App #${gameId}` : 'Achievement Guide'}
                  </p>
                  <h2>{guide.title}</h2>
                  <p className="muted">{guide.hint}</p>
                  <span>최근 수정 {guide.updatedAt}</span>
                </div>
                <div className="my-guide-actions">
                  <Link
                    className="text-link"
                    to={getAchievementPath(guide.achievementId)}
                  >
                    공략 보기
                  </Link>
                  <Link
                    className="button-link"
                    to={`/guides/new?guideId=${guide.id}`}
                  >
                    수정하기
                  </Link>
                </div>
              </article>
            )
          })}
        </section>
      ) : (
        <section className="empty-state">
          <h2>아직 작성한 공략이 없습니다.</h2>
          <p className="muted">
            Steam 앱과 도전과제를 선택해 첫 공략을 작성해보세요.
          </p>
          <Link className="button-link" to="/guides/new">
            공략 작성하기
          </Link>
        </section>
      )}
    </main>
  )
}

import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ErrorState } from '../components/common/ErrorState'
import { LoadingState } from '../components/common/LoadingState'
import { useGameDetailQuery } from '../hooks/useGameDetailQuery'
import { useSteamAchievementOverviewQuery } from '../hooks/useSteamPlayerAchievementsQuery'
import { useSteamLibraryQuery } from '../hooks/useSteamLibraryQuery'
import { useSteamProfileQuery } from '../hooks/useSteamProfileQuery'
import type {
  SteamOwnedGame,
  SteamPlayerAchievementProgress,
} from '../apis/steamApi'
import { useAuthStore } from '../stores/authStore'
import { useGuideStore } from '../stores/guideStore'

const PAGE_SIZE = 20
type LibrarySortOption = 'playtime-desc' | 'recent-desc' | 'name-asc'

const sortLabels: Record<LibrarySortOption, string> = {
  'playtime-desc': '플레이 시간 많은 순',
  'recent-desc': '최근 2주 플레이 많은 순',
  'name-asc': '이름순',
}

function formatPlaytime(minutes: number) {
  if (minutes < 60) {
    return `${minutes}분`
  }

  return `${Math.round(minutes / 60)}시간`
}

function LibrarySkeleton() {
  return (
    <section className="steam-game-grid" aria-label="라이브러리 로딩 중">
      {Array.from({ length: 6 }).map((_, index) => (
        <article className="steam-game-card skeleton-card" key={index}>
          <div className="skeleton-image" />
          <div className="skeleton-line skeleton-line-short" />
          <div className="skeleton-line" />
        </article>
      ))}
    </section>
  )
}

function getSteamIconUrl(game: SteamOwnedGame) {
  if (!game.img_icon_url) {
    return ''
  }

  return `https://media.steampowered.com/steamcommunity/public/images/apps/${game.appid}/${game.img_icon_url}.jpg`
}

function LibraryGameCard({
  game,
  progress,
}: {
  game: SteamOwnedGame
  progress?: SteamPlayerAchievementProgress
}) {
  const { data: gameDetail } = useGameDetailQuery(game.appid)
  const [failedImageUrl, setFailedImageUrl] = useState('')
  const imageUrl = gameDetail?.image || getSteamIconUrl(game)
  const canShowImage = imageUrl && failedImageUrl !== imageUrl

  return (
    <article
      className={`steam-game-card${progress?.isPerfect ? ' is-perfect' : ''}`}
    >
      <Link to={`/games/${game.appid}`}>
        {canShowImage ? (
          <img
            src={imageUrl}
            alt={`${game.name} 대표 이미지`}
            decoding="async"
            loading="lazy"
            onError={() => setFailedImageUrl(imageUrl)}
          />
        ) : (
          <div
            className="library-game-image-placeholder"
            role="img"
            aria-label={`${game.name} 이미지 없음`}
          >
            <span>{game.name.trim().charAt(0).toUpperCase() || '?'}</span>
          </div>
        )}
        <div>
          <p>플레이 시간 {formatPlaytime(game.playtime_forever)}</p>
          <h3>{game.name}</h3>
          {progress?.supported && progress.totalCount > 0 && (
            <div className="library-achievement-progress">
              <span>
                도전과제 {progress.achievedCount} / {progress.totalCount}
              </span>
              {progress.isPerfect && (
                <strong className="perfect-game-badge">100% 완료</strong>
              )}
            </div>
          )}
        </div>
      </Link>
    </article>
  )
}

function sortLibraryGames(
  games: SteamOwnedGame[],
  sortOption: LibrarySortOption,
) {
  return games.slice().sort((a, b) => {
    if (sortOption === 'name-asc') {
      return a.name.localeCompare(b.name)
    }

    if (sortOption === 'recent-desc') {
      return (b.playtime_2weeks ?? 0) - (a.playtime_2weeks ?? 0)
    }

    return b.playtime_forever - a.playtime_forever
  })
}

export function MyPage() {
  const navigate = useNavigate()
  const user = useAuthStore((state) => state.user)
  const authStatus = useAuthStore((state) => state.status)
  const logout = useAuthStore((state) => state.logout)
  const guideCount = useGuideStore((state) => state.userGuides.length)
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)
  const [sortOption, setSortOption] =
    useState<LibrarySortOption>('playtime-desc')
  const loadMoreRef = useRef<HTMLDivElement | null>(null)
  const {
    data: library,
    isError,
    isLoading,
  } = useSteamLibraryQuery(user?.steamId)
  const { data: profile } = useSteamProfileQuery(user?.steamId)
  const {
    data: achievementOverview,
    hasNextPage: hasMoreAchievementPages,
    isError: isAchievementOverviewError,
    isFetchingNextPage: isAchievementOverviewFetching,
    isLoading: isAchievementOverviewLoading,
  } = useSteamAchievementOverviewQuery(user?.steamId)
  const achievementProgress = useMemo(
    () =>
      achievementOverview?.pages.flatMap((page) => page.games) ?? [],
    [achievementOverview?.pages],
  )
  const achievementProgressByAppId = useMemo(
    () =>
      new Map(
        achievementProgress.map((progress) => [progress.appid, progress]),
      ),
    [achievementProgress],
  )
  const achievedCount = achievementProgress.reduce(
    (total, progress) => total + progress.achievedCount,
    0,
  )
  const perfectGameCount = achievementProgress.filter(
    (progress) => progress.isPerfect,
  ).length
  const isAchievementOverviewComplete =
    !isAchievementOverviewLoading &&
    !isAchievementOverviewError &&
    hasMoreAchievementPages === false
  const sortedGames = useMemo(
    () => sortLibraryGames(library?.games ?? [], sortOption),
    [library?.games, sortOption],
  )
  const visibleGames = useMemo(
    () => sortedGames.slice(0, visibleCount),
    [sortedGames, visibleCount],
  )
  const hasMoreGames = Boolean(
    library && visibleGames.length < sortedGames.length,
  )

  useEffect(() => {
    setVisibleCount(PAGE_SIZE)
  }, [sortOption, user?.steamId])

  useEffect(() => {
    if (!hasMoreGames) {
      return
    }

    const target = loadMoreRef.current

    if (!target) {
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0].isIntersecting) {
          return
        }

        setVisibleCount((count) => count + PAGE_SIZE)
      },
      { rootMargin: '240px' },
    )

    observer.observe(target)

    return () => observer.disconnect()
  }, [hasMoreGames, visibleGames.length])

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
            Steam 계정으로 로그인하면 공개 라이브러리를 확인할 수 있습니다.
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
      <section className="profile-panel">
        <div className="steam-profile-identity">
          {profile?.avatarFull && (
            <img
              className="steam-profile-avatar"
              src={profile.avatarFull}
              alt={`${profile.personName} Steam 프로필 이미지`}
            />
          )}
          <div>
            <p className="eyebrow">My Steam Library</p>
            <h1>마이페이지</h1>
            {profile?.personName && (
              <strong className="steam-profile-name">
                {profile.personName}
              </strong>
            )}
            <p className="muted">SteamID: {user.steamId}</p>
            {profile?.profileUrl && (
              <a
                className="text-link steam-profile-link"
                href={profile.profileUrl}
                target="_blank"
                rel="noreferrer"
              >
                Steam 프로필 보기
              </a>
            )}
          </div>
        </div>
        <button
          className="secondary-button"
          type="button"
          onClick={() => {
            void logout().then(() => navigate('/login'))
          }}
        >
          로그아웃
        </button>
      </section>

      {isLoading && (
        <>
          <LoadingState message="Steam 라이브러리를 불러오는 중입니다." />
          <LibrarySkeleton />
        </>
      )}
      {isError && (
        <ErrorState
          message="Steam 프로필의 게임 세부 정보가 비공개이면 라이브러리를 가져오지 못할 수 있습니다."
          title="라이브러리를 불러오지 못했습니다."
        />
      )}
      {library && (
        <>
          <section className="info-grid">
            <article>
              <strong>{library.gameCount}</strong>
              <span>공개 라이브러리 게임</span>
            </article>
            <article>
              <strong>{guideCount}</strong>
              <span>내가 작성한 공략</span>
            </article>
            <article>
              <strong>
                {isAchievementOverviewError
                  ? '확인 불가'
                  : `${achievedCount.toLocaleString()}${
                      isAchievementOverviewComplete ? '' : '+'
                    }`}
              </strong>
              <span>
                달성 도전과제
                {!isAchievementOverviewComplete &&
                  !isAchievementOverviewError &&
                  ' (집계 중)'}
              </span>
            </article>
            <article>
              <strong>
                {isAchievementOverviewError
                  ? '확인 불가'
                  : `${perfectGameCount}${
                      isAchievementOverviewComplete ? '' : '+'
                    }`}
              </strong>
              <span>도전과제 100% 완료 게임</span>
            </article>
            <article>
              <strong>
                {formatPlaytime(
                  library.games.reduce(
                    (total, game) => total + game.playtime_forever,
                    0,
                  ),
                )}
              </strong>
              <span>전체 플레이 시간</span>
            </article>
          </section>

          {library.games.length > 0 ? (
            <>
              <div className="library-list-heading">
                <div>
                  <p className="eyebrow">Library</p>
                  <h2>내 Steam 게임</h2>
                </div>
                <div className="library-list-controls">
                  <span>
                    {visibleGames.length} / {library.games.length}개 표시
                  </span>
                  <label>
                    정렬 기준
                    <select
                      value={sortOption}
                      onChange={(event) =>
                        setSortOption(event.target.value as LibrarySortOption)
                      }
                    >
                      {Object.entries(sortLabels).map(([value, label]) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
              </div>
              <section className="steam-game-grid">
                {visibleGames.map((game) => (
                  <LibraryGameCard
                    game={game}
                    key={game.appid}
                    progress={achievementProgressByAppId.get(game.appid)}
                  />
                ))}
              </section>
              {isAchievementOverviewFetching && (
                <p className="library-achievement-status" role="status">
                  Steam 도전과제 달성 현황을 순차적으로 집계하고 있습니다.
                </p>
              )}
              {hasMoreGames && (
                <div
                  className="library-scroll-sentinel"
                  ref={loadMoreRef}
                  aria-label="라이브러리 더 불러오기"
                >
                  <LibrarySkeleton />
                </div>
              )}
            </>
          ) : (
            <section className="empty-state">
              <h2>표시할 라이브러리가 없습니다.</h2>
              <p className="muted">
                Steam 프로필 공개 범위에서 게임 세부 정보 공개 여부를 확인해
                주세요.
              </p>
            </section>
          )}
        </>
      )}
    </main>
  )
}

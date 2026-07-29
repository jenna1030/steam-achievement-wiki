import { useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import type { Achievement, AchievementId } from '../../types/achievement'
import type { AchievementGuide, GuideFormValues } from '../../types/guide'

export interface GuideGameOption {
  id: number
  title: string
}

interface GuideFormProps {
  achievements: Achievement[]
  defaultAchievementId: AchievementId
  defaultGuide?: AchievementGuide
  gameOptions: GuideGameOption[]
  gameSearchQuery: string
  isGameSearchError: boolean
  isGameSearchLoading: boolean
  selectedGameId: number
  onGameSearchChange: (query: string) => void
  onGameChange: (gameId: number) => void
  onSubmit: (values: GuideFormValues) => void
}

function joinLines(lines: string[]) {
  return lines.join('\n')
}

export function GuideForm({
  achievements,
  defaultAchievementId,
  defaultGuide,
  gameOptions,
  gameSearchQuery,
  isGameSearchError,
  isGameSearchLoading,
  selectedGameId,
  onGameSearchChange,
  onGameChange,
  onSubmit,
}: GuideFormProps) {
  const [achievementSearchQuery, setAchievementSearchQuery] = useState('')
  const {
    formState: { errors },
    handleSubmit,
    register,
    setValue,
    watch,
  } = useForm<GuideFormValues>({
    mode: 'onBlur',
    defaultValues: {
      achievementId: defaultGuide?.achievementId ?? defaultAchievementId,
      title: defaultGuide?.title ?? '',
      hint: defaultGuide?.hint ?? '',
      detail: defaultGuide?.detail ?? '',
      hasSpoiler: defaultGuide?.hasSpoiler ?? false,
      spoiler: defaultGuide?.spoiler ?? '',
      difficulty: defaultGuide?.difficulty ?? '보통',
      estimatedMinutes: defaultGuide?.estimatedMinutes ?? 30,
      conditionsText: defaultGuide ? joinLines(defaultGuide.conditions) : '',
      suppliesText: defaultGuide ? joinLines(defaultGuide.supplies) : '',
      warningsText: defaultGuide ? joinLines(defaultGuide.warnings) : '',
      recommendedOrderText: defaultGuide
        ? joinLines(defaultGuide.recommendedOrder)
        : '',
      tagsText: defaultGuide ? defaultGuide.tags.join(', ') : '',
      dlcRequirement: defaultGuide?.dlcRequirement ?? 'unknown',
      multiplayerRequirement:
        defaultGuide?.multiplayerRequirement ?? 'unknown',
      isMissable: defaultGuide?.isMissable ?? false,
      requiresSecondRun: defaultGuide?.requiresSecondRun ?? false,
    },
  })
  const hasSpoiler = watch('hasSpoiler')
  const selectedAchievementId = watch('achievementId')
  const filteredAchievements = useMemo(() => {
    const normalizedQuery = achievementSearchQuery.trim().toLowerCase()

    if (!normalizedQuery) {
      return achievements
    }

    return achievements.filter(
      (achievement) =>
        achievement.title.toLowerCase().includes(normalizedQuery) ||
        achievement.description.toLowerCase().includes(normalizedQuery),
    )
  }, [achievementSearchQuery, achievements])
  const selectedGame = gameOptions.find((game) => game.id === selectedGameId)
  const selectedAchievement = achievements.find(
    (achievement) => achievement.id === selectedAchievementId,
  )

  useEffect(() => {
    if (
      achievements.length > 0 &&
      !achievements.some(
        (achievement) => achievement.id === selectedAchievementId,
      )
    ) {
      setValue('achievementId', achievements[0].id)
    }
  }, [achievements, selectedAchievementId, setValue])

  const handleFormSubmit = (values: GuideFormValues) => {
    onSubmit({
      ...values,
      spoiler: values.hasSpoiler ? values.spoiler : '',
    })
  }

  return (
    <form className="editor-form" onSubmit={handleSubmit(handleFormSubmit)}>
      <section className="selection-panel" aria-label="공략 대상 선택">
        <div className="section-heading">
          <p className="eyebrow">Target</p>
          <h2>공략할 도전과제 선택</h2>
          <p className="muted">
            Steam 앱을 먼저 고른 뒤, 해당 게임의 도전과제를 검색해서
            선택합니다.
          </p>
        </div>
        <div className="form-grid">
          <label>
            Steam 앱 검색
            <input
              type="search"
              value={gameSearchQuery}
              placeholder="예: Hollow Knight 또는 367520"
              onChange={(event) => onGameSearchChange(event.target.value)}
            />
            <span className="form-note" role="status">
              {gameSearchQuery.trim().length < 2
                ? '게임명 또는 appid를 두 글자 이상 입력하면 Steam 앱을 검색합니다.'
                : isGameSearchLoading
                  ? 'Steam 앱을 검색하는 중입니다.'
                  : isGameSearchError
                    ? '검색하지 못했습니다. API 서버 실행 상태를 확인해주세요.'
                    : `${gameOptions.length}개 앱을 선택할 수 있습니다.`}
            </span>
          </label>
          <label>
            Steam 앱 선택
            <select
              value={selectedGameId}
              onChange={(event) => onGameChange(Number(event.target.value))}
            >
              {gameOptions.map((game) => (
                <option key={game.id} value={game.id}>
                  {game.title} #{game.id}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div className="form-grid">
          <label>
            도전과제 검색
            <input
              type="search"
              value={achievementSearchQuery}
              placeholder="도전과제 이름이나 설명 검색"
              onChange={(event) =>
                setAchievementSearchQuery(event.target.value)
              }
            />
          </label>
          <label>
            도전과제 선택
            <select {...register('achievementId')}>
              {filteredAchievements.map((achievement) => (
                <option key={achievement.id} value={achievement.id}>
                  {achievement.title}
                </option>
              ))}
            </select>
          </label>
        </div>
        <p className="form-note">
          선택됨: {selectedGame?.title ?? '게임 없음'} /{' '}
          {selectedAchievement?.title ?? '도전과제 없음'}
        </p>
      </section>
      <label>
        공략 제목
        <input
          aria-invalid={Boolean(errors.title)}
          type="text"
          placeholder="공략 제목을 입력하세요"
          {...register('title', { required: '공략 제목을 입력해주세요.' })}
        />
        {errors.title && (
          <span className="field-error">{errors.title.message}</span>
        )}
      </label>
      <label>
        힌트
        <textarea
          aria-invalid={Boolean(errors.hint)}
          placeholder="스포일러가 적은 힌트를 작성하세요"
          {...register('hint', { required: '힌트를 입력해주세요.' })}
        />
        {errors.hint && (
          <span className="field-error">{errors.hint.message}</span>
        )}
      </label>
      <label>
        자세한 공략
        <textarea
          aria-invalid={Boolean(errors.detail)}
          placeholder="구체적인 진행 방법을 작성하세요"
          {...register('detail', { required: '자세한 공략을 입력해주세요.' })}
        />
        {errors.detail && (
          <span className="field-error">{errors.detail.message}</span>
        )}
      </label>
      <label className="checkbox-label form-checkbox">
        <input type="checkbox" {...register('hasSpoiler')} />
        스포일러 포함 공략 작성
      </label>
      {hasSpoiler && (
        <label>
          스포일러 포함 공략
          <textarea
            aria-invalid={Boolean(errors.spoiler)}
            placeholder="결말이나 조건을 포함해 작성하세요"
            {...register('spoiler', {
              validate: (value, values) =>
                !values.hasSpoiler ||
                value.trim().length > 0 ||
                '스포일러 포함 공략을 입력해주세요.',
            })}
          />
          {errors.spoiler && (
            <span className="field-error">{errors.spoiler.message}</span>
          )}
        </label>
      )}
      {!hasSpoiler && (
        <p className="form-note">
          스포일러가 없는 공략은 힌트와 자세한 공략만 저장됩니다.
        </p>
      )}
      <div className="form-grid">
        <label>
          체감 난이도
          <select {...register('difficulty')}>
            <option value="쉬움">쉬움</option>
            <option value="보통">보통</option>
            <option value="어려움">어려움</option>
            <option value="매우 어려움">매우 어려움</option>
          </select>
        </label>
        <label>
          예상 소요 시간
          <input
            aria-invalid={Boolean(errors.estimatedMinutes)}
            min={1}
            type="number"
            {...register('estimatedMinutes', {
              min: {
                value: 1,
                message: '예상 소요 시간은 1분 이상이어야 합니다.',
              },
              required: '예상 소요 시간을 입력해주세요.',
              valueAsNumber: true,
            })}
          />
          {errors.estimatedMinutes && (
            <span className="field-error">
              {errors.estimatedMinutes.message}
            </span>
          )}
        </label>
      </div>
      <label>
        공략 태그
        <input
          type="text"
          placeholder="예: 보스, 놓치기 쉬움, 수집"
          {...register('tagsText')}
        />
        <span className="form-note">
          쉼표로 구분하면 도전과제 모아보기 카드에도 반영됩니다.
        </span>
      </label>
      <section className="selection-panel" aria-label="필요 조건과 주의 표시">
        <div className="section-heading">
          <p className="eyebrow">Requirements</p>
          <h2>필요 조건과 주의 표시</h2>
          <p className="muted">
            Steam API가 제공하지 않는 조건을 공략 작성자가 보완합니다.
          </p>
        </div>
        <div className="form-grid">
          <label>
            DLC 조건
            <select {...register('dlcRequirement')}>
              <option value="unknown">확인되지 않음</option>
              <option value="not-required">본편만으로 가능</option>
              <option value="required">DLC 필요</option>
            </select>
          </label>
          <label>
            플레이 조건
            <select {...register('multiplayerRequirement')}>
              <option value="unknown">확인되지 않음</option>
              <option value="not-required">싱글 플레이 가능</option>
              <option value="required">멀티플레이 필요</option>
            </select>
          </label>
        </div>
        <div className="requirement-checks">
          <label className="checkbox-label">
            <input type="checkbox" {...register('isMissable')} />
            놓치기 쉬움
          </label>
          <label className="checkbox-label">
            <input type="checkbox" {...register('requiresSecondRun')} />
            2회차 필요
          </label>
        </div>
      </section>
      <label>
        달성 조건
        <textarea
          aria-invalid={Boolean(errors.conditionsText)}
          placeholder="한 줄에 하나씩 작성하세요"
          {...register('conditionsText', {
            required: '달성 조건을 입력해주세요.',
          })}
        />
        {errors.conditionsText && (
          <span className="field-error">{errors.conditionsText.message}</span>
        )}
      </label>
      <label>
        필요한 준비물
        <textarea
          aria-invalid={Boolean(errors.suppliesText)}
          placeholder="한 줄에 하나씩 작성하세요"
          {...register('suppliesText', {
            required: '필요한 준비물을 입력해주세요.',
          })}
        />
        {errors.suppliesText && (
          <span className="field-error">{errors.suppliesText.message}</span>
        )}
      </label>
      <label>
        주의할 점
        <textarea
          aria-invalid={Boolean(errors.warningsText)}
          placeholder="한 줄에 하나씩 작성하세요"
          {...register('warningsText', {
            required: '주의할 점을 입력해주세요.',
          })}
        />
        {errors.warningsText && (
          <span className="field-error">{errors.warningsText.message}</span>
        )}
      </label>
      <label>
        추천 진행 순서
        <textarea
          aria-invalid={Boolean(errors.recommendedOrderText)}
          placeholder="한 줄에 하나씩 작성하세요"
          {...register('recommendedOrderText', {
            required: '추천 진행 순서를 입력해주세요.',
          })}
        />
        {errors.recommendedOrderText && (
          <span className="field-error">
            {errors.recommendedOrderText.message}
          </span>
        )}
      </label>
      <button type="submit">
        {defaultGuide ? '공략 수정하기' : '공략 저장하기'}
      </button>
    </form>
  )
}

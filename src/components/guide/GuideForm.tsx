import { useForm } from 'react-hook-form'
import type { AchievementGuide, GuideFormValues } from '../../types/guide'

interface GuideFormProps {
  defaultAchievementId: number
  defaultGuide?: AchievementGuide
  onSubmit: (values: GuideFormValues) => void
}

function joinLines(lines: string[]) {
  return lines.join('\n')
}

export function GuideForm({
  defaultAchievementId,
  defaultGuide,
  onSubmit,
}: GuideFormProps) {
  const { handleSubmit, register, watch } = useForm<GuideFormValues>({
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
    },
  })
  const hasSpoiler = watch('hasSpoiler')
  const handleFormSubmit = (values: GuideFormValues) => {
    onSubmit({
      ...values,
      spoiler: values.hasSpoiler ? values.spoiler : '',
    })
  }

  return (
    <form className="editor-form" onSubmit={handleSubmit(handleFormSubmit)}>
      <label>
        도전과제 ID
        <input type="number" {...register('achievementId', { valueAsNumber: true })} />
      </label>
      <label>
        공략 제목
        <input
          type="text"
          placeholder="공략 제목을 입력하세요"
          {...register('title', { required: true })}
        />
      </label>
      <label>
        힌트
        <textarea
          placeholder="스포일러가 적은 힌트를 작성하세요"
          {...register('hint', { required: true })}
        />
      </label>
      <label>
        자세한 공략
        <textarea
          placeholder="구체적인 진행 방법을 작성하세요"
          {...register('detail', { required: true })}
        />
      </label>
      <label className="checkbox-label form-checkbox">
        <input type="checkbox" {...register('hasSpoiler')} />
        스포일러 포함 공략 작성
      </label>
      {hasSpoiler && (
        <label>
          스포일러 포함 공략
          <textarea
            placeholder="결말이나 조건을 포함해 작성하세요"
            {...register('spoiler')}
          />
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
            min={1}
            type="number"
            {...register('estimatedMinutes', { valueAsNumber: true })}
          />
        </label>
      </div>
      <label>
        달성 조건
        <textarea
          placeholder="한 줄에 하나씩 작성하세요"
          {...register('conditionsText')}
        />
      </label>
      <label>
        필요한 준비물
        <textarea
          placeholder="한 줄에 하나씩 작성하세요"
          {...register('suppliesText')}
        />
      </label>
      <label>
        주의할 점
        <textarea
          placeholder="한 줄에 하나씩 작성하세요"
          {...register('warningsText')}
        />
      </label>
      <label>
        추천 진행 순서
        <textarea
          placeholder="한 줄에 하나씩 작성하세요"
          {...register('recommendedOrderText')}
        />
      </label>
      <button type="submit">
        {defaultGuide ? '공략 수정하기' : '공략 저장하기'}
      </button>
    </form>
  )
}

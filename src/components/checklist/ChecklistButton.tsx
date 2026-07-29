import { useChecklistStore } from '../../stores/checklistStore'
import type { Achievement } from '../../types/achievement'

interface ChecklistButtonProps {
  achievement: Achievement
}

export function ChecklistButton({ achievement }: ChecklistButtonProps) {
  const items = useChecklistStore((state) => state.items)
  const toggleChecklist = useChecklistStore((state) => state.toggleChecklist)
  const isSaved = items.some(
    (item) =>
      item.achievementId === achievement.id ||
      item.achievementId === String(achievement.legacyId ?? ''),
  )

  return (
    <button
      className={isSaved ? 'secondary-button is-selected' : 'secondary-button'}
      type="button"
      onClick={() => toggleChecklist(achievement)}
    >
      {isSaved ? '체크리스트에서 제거' : '체크리스트에 추가'}
    </button>
  )
}

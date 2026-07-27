import { useChecklistStore } from '../../stores/checklistStore'

interface ChecklistButtonProps {
  achievementId: number
}

export function ChecklistButton({ achievementId }: ChecklistButtonProps) {
  const items = useChecklistStore((state) => state.items)
  const toggleChecklist = useChecklistStore((state) => state.toggleChecklist)
  const isSaved = items.some((item) => item.achievementId === achievementId)

  return (
    <button
      className={isSaved ? 'secondary-button is-selected' : 'secondary-button'}
      type="button"
      onClick={() => toggleChecklist(achievementId)}
    >
      {isSaved ? '체크리스트에서 제거' : '체크리스트에 추가'}
    </button>
  )
}

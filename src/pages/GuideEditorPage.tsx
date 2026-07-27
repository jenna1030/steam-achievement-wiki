export function GuideEditorPage() {
  return (
    <main className="page">
      <section className="page-header">
        <p className="eyebrow">Guide Editor</p>
        <h1>공략 작성</h1>
        <p className="muted">
          힌트, 자세한 공략, 스포일러 포함 공략을 단계별로 작성하는
          페이지입니다.
        </p>
      </section>

      <form className="editor-form">
        <label>
          공략 제목
          <input type="text" placeholder="공략 제목을 입력하세요" />
        </label>
        <label>
          힌트
          <textarea placeholder="스포일러가 적은 힌트를 작성하세요" />
        </label>
        <label>
          자세한 공략
          <textarea placeholder="구체적인 진행 방법을 작성하세요" />
        </label>
        <label>
          스포일러 포함 공략
          <textarea placeholder="결말이나 조건을 포함해 작성하세요" />
        </label>
        <button type="button">임시 저장</button>
      </form>
    </main>
  )
}

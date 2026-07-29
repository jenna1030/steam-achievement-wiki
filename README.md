# Steam Achievement Wiki

BCSD 프론트엔드 트랙 개인 프로젝트입니다. Steam의 공식 게임·도전과제
데이터와 사용자가 작성한 공략 메타데이터를 결합해, 도전과제 탐색부터 공략,
난이도 투표, 체크리스트까지 한 흐름으로 관리합니다.

## 구현 기능

- Steam Store 게임 검색, 장르/도전과제 유무 필터, 무한 스크롤
- 게임 상세 정보와 Steam 공식 도전과제·전체 달성률 조회
- 도전과제 아이콘, 숨김 여부, 정렬, 태그 필터
- 힌트/상세/스포일러 단계별 공략 작성·수정·삭제
- 공략 기반 태그, DLC·멀티플레이·놓치기 쉬움·2회차 조건 표시
- 난이도 투표 변경 및 취소
- 이름·설명·아이콘 스냅샷을 보관하는 체크리스트
- Steam OpenID 로그인과 공개 라이브러리 조회
- 관심 게임, 최근 검색어, 공략, 투표, 체크리스트 브라우저 저장

## 데이터 경계

| 데이터 | 출처 | 관리 방식 |
| --- | --- | --- |
| 게임·도전과제·달성률 | Steam API | TanStack Query 캐시 |
| 로그인 상태 | Steam OpenID | 서버 검증 후 서명된 HttpOnly 쿠키 |
| 관심 게임·공략·투표·체크리스트 | 사용자 브라우저 | Zustand + localStorage |

Steam API Key는 브라우저에 노출하지 않습니다. 로컬 Node 프록시와 Vercel
Functions가 같은 서버 요청 처리기를 사용합니다.
`VITE_` 접두사가 붙은 Steam API Key는 만들거나 참조하지 않습니다.

## 로컬 실행

`.env.example`을 참고해 루트에 `.env`를 만듭니다.

```env
STEAM_API_KEY=발급받은_키
SESSION_SECRET=충분히_긴_임의의_문자열
CLIENT_BASE_URL=http://localhost:5173
SERVER_BASE_URL=http://localhost:3001
STEAM_PROXY_PORT=3001
```

```bash
npm install
```

터미널 1:

```bash
npm run dev:api
```

터미널 2:

```bash
npm run dev
```

Steam 로그인은 두 서버가 모두 실행 중이어야 합니다.

## 품질 검사

```bash
npm run check
```

`check`는 린트와 TypeScript/Vite 프로덕션 빌드를 차례로 실행합니다. GitHub
Actions도 pull request와 `main` push에서 같은 명령을 실행합니다.

## 배포

Vite 정적 앱과 `/api` Vercel Functions를 함께 배포할 수 있도록 구성되어
있습니다. 환경변수와 Steam OpenID callback URL 설정은
[배포 가이드](docs/deployment.md)를 따릅니다.

## 현재 MVP의 한계

- 공략·투표·체크리스트는 계정 서버가 아닌 현재 브라우저에만 저장됩니다.
- 댓글, 공략 신뢰도, 계정 간 동기화는 후속 백엔드 범위입니다.
- Steam 프로필 또는 게임 세부 정보가 비공개면 라이브러리를 조회할 수 없습니다.
- Steam API가 제공하지 않는 DLC·플랫폼 조건은 공략 작성자가 보완합니다.

발표 흐름과 기술 선택 근거는
[발표 가이드](docs/presentation-guide.md)에 정리했습니다.

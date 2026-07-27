# Steam Achievement Wiki

BCSD 프론트엔드 트랙 개인 프로젝트입니다. Steam 게임의 도전과제를 검색하고, 공략과 체크리스트를 함께 관리하는 위키형 웹 앱을 목표로 구현했습니다.

## 주요 기능

- 게임 검색, 장르 필터, 관심 게임 등록
- 게임별 도전과제 목록, 태그 필터, 정렬
- 도전과제 상세 정보와 스포일러 단계별 공략
- 사용자 공략 작성, 수정, 삭제
- 도전과제 체크리스트, 진행 상태, 메모 저장
- 난이도 투표와 달성률 차트
- 쉬운 도전과제 추천
- Steam 공개 API 일부 연동

## Steam API 연동 범위

Steam API Key가 필요한 요청은 브라우저에서 직접 호출하지 않고, 로컬 백엔드 프록시를 통해 호출합니다.

- `ISteamUserStats/GetGlobalAchievementPercentagesForApp/v0002`
  - 게임별 글로벌 도전과제 달성률 조회
- `ISteamUserStats/GetSchemaForGame/v2`
  - 도전과제 내부 이름, 표시 이름, 설명, 아이콘, 숨김 여부 조회
  - `STEAM_API_KEY`가 필요하므로 `server/steamProxy.js`에서만 호출합니다.

프론트엔드는 `/api/steam/achievements?appid=...`만 호출합니다. 실제 `.env` 파일은 `.gitignore`에 포함되어 있어 커밋하지 않습니다.

## 실행 방법

`.env`에 Steam Web API Key를 넣습니다.

```env
STEAM_API_KEY=발급받은_키
```

의존성을 설치합니다.

```bash
npm install
```

터미널 1에서 백엔드 프록시를 실행합니다.

```bash
npm run dev:api
```

터미널 2에서 Vite 개발 서버를 실행합니다.

```bash
npm run dev
```

개발 서버 실행 후 Vite가 출력하는 로컬 주소로 접속합니다.

## 검증 명령어

```bash
npm run lint
npm run build
```

## 기술 스택

- React
- TypeScript
- Vite
- React Router
- TanStack Query
- Zustand
- Recharts

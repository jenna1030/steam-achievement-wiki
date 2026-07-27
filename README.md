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

현재 프론트엔드에서 직접 연결하는 API는 API Key 없이 호출 가능한 공개 API만 사용합니다.

- `ISteamUserStats/GetGlobalAchievementPercentagesForApp/v0002`
  - 게임별 글로벌 도전과제 달성률 조회
  - 호출 실패 시 기존 mock 도전과제 데이터를 유지합니다.
- Steam 앱 목록 API
  - 현재 공식 권장 API인 `IStoreService/GetAppList/v1`은 API Key가 필요합니다.
  - 브라우저에서 직접 호출하면 키가 Network 탭에 노출될 수 있어 1차 구현에서는 제외했습니다.
  - 추후 백엔드 프록시를 추가하면 검색 후보 조회 기능으로 확장할 예정입니다.

Steam API Key가 필요한 기능은 브라우저에 키가 노출될 수 있으므로 이번 1차 구현에서는 제외했습니다. 실제 `.env` 파일은 `.gitignore`에 포함되어 있어 커밋하지 않습니다.

## 실행 방법

```bash
npm install
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

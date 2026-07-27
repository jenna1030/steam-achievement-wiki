# Commit Workflow

이 문서는 개인 프로젝트 기획서의 1차 구현 기능을 기준으로, 프론트엔드 작업을 어떤 단위로 진행하고 커밋할지 정리한 기록이다.
커밋은 너무 잘게 나누기보다, 실행 가능한 기능 묶음이 완성될 때마다 진행한다.

## 기준 문서

- `이지현_개인프로젝트 기획서.md`
- 주제: Steam 도전과제 공략 위키 및 체크리스트 서비스
- 1차 구현 목표: 게임 검색, 게임 상세, 도전과제 목록/상세, 공략 작성/수정/삭제, 스포일러 단계별 보기, 체크리스트, 태그 필터, 난이도 투표

## 기본 원칙

- 한 커밋은 하나의 의미 있는 작업 묶음을 담는다.
- 빌드 또는 화면 확인이 가능한 상태에서 커밋한다.
- API Key, `.env`, 개인 설정 파일은 커밋하지 않는다.
- 실제 Steam API 연동이 불안정하거나 CORS/API Key 문제가 있으면 mock data를 먼저 사용한다.
- 기능 구현 전에는 라우팅, 타입, mock data, 공통 UI 구조를 먼저 잡는다.
- 과제 요구사항 확인을 위해 TanStack Query 사용 흔적이 명확히 보이도록 구성한다.

## 예상 커밋 단위

### 1. Project Dependencies and Environment Setup

이미 진행한 초기 설정 커밋이다.

포함 내용:

- Vite + React + TypeScript 프로젝트 생성
- React Router, TanStack Query, styled-components, Zustand, Recharts, React Hook Form 설치
- `.env` Git 제외 설정
- `.env.example` 추가

확인 항목:

- `npm run build`
- `npm run lint`

### 2. Define MVP Data Model and Mock Data

기획서의 핵심 도메인을 TypeScript 타입과 mock data로 먼저 고정한다.

포함 내용:

- 게임 타입 정의
- 도전과제 타입 정의
- 공략 타입 정의
- 체크리스트 상태 타입 정의
- 난이도 투표 타입 정의
- 시연용 게임/도전과제/mock 공략 데이터 작성

예상 파일:

- `src/types/game.ts`
- `src/types/achievement.ts`
- `src/types/guide.ts`
- `src/mocks/games.ts`
- `src/mocks/achievements.ts`
- `src/mocks/guides.ts`

확인 항목:

- 타입 오류 없음
- mock data만으로 화면 구성 가능

### 3. Build App Layout and Routing

서비스의 기본 화면 구조와 페이지 이동을 만든다.

포함 내용:

- React Router 설정
- 공통 레이아웃 구성
- 헤더/내비게이션 구성
- 메인 페이지
- 게임 검색 페이지
- 게임 상세 페이지
- 도전과제 상세 페이지
- 공략 작성 페이지
- 마이페이지 또는 체크리스트 페이지 placeholder

예상 파일:

- `src/main.tsx`
- `src/App.tsx`
- `src/pages/HomePage.tsx`
- `src/pages/GameSearchPage.tsx`
- `src/pages/GameDetailPage.tsx`
- `src/pages/AchievementDetailPage.tsx`
- `src/pages/GuideEditorPage.tsx`
- `src/components/layout/AppLayout.tsx`

확인 항목:

- 각 URL로 이동 가능
- 새로고침 시 앱이 깨지지 않음
- 기본 Vite 화면 제거

### 4. Implement Game Search and Game Cards

게임 검색과 게임 카드 UI를 만든다.

포함 내용:

- 게임명 검색
- 인기 게임 목록 표시
- 도전과제가 있는 게임 표시
- 장르/태그 등 기본 필터 UI
- 관심 게임 등록 버튼 UI
- 최근 검색 게임 UI는 local state 또는 Zustand로 간단히 처리

예상 파일:

- `src/components/game/GameCard.tsx`
- `src/components/search/GameSearchForm.tsx`
- `src/pages/GameSearchPage.tsx`
- `src/stores/libraryStore.ts`

확인 항목:

- 검색어에 따라 mock 게임 목록 필터링
- 관심 게임 버튼 동작
- 모바일/데스크톱에서 카드가 깨지지 않음

### 5. Implement Game Detail and Achievement List

게임 상세 페이지와 도전과제 목록을 만든다.

포함 내용:

- 게임 제목, 대표 이미지, 설명, 출시일, 장르, 개발사/배급사 표시
- Steam 상점 바로가기 링크
- 도전과제 목록 표시
- 달성률 높은 순/낮은 순 정렬
- 이름순 정렬
- 난이도순 정렬
- 태그 필터
- 숨겨진 도전과제 표시 UI

예상 파일:

- `src/components/achievement/AchievementCard.tsx`
- `src/components/achievement/AchievementFilterBar.tsx`
- `src/pages/GameDetailPage.tsx`
- `src/utils/achievementFilters.ts`

확인 항목:

- 게임 상세에서 도전과제 목록으로 자연스럽게 연결
- 정렬과 필터가 동시에 동작
- 도전과제 상세 페이지로 이동 가능

### 6. Add TanStack Query Data Layer

과제 요구사항을 만족하도록 데이터 조회 흐름에 TanStack Query를 적용한다.
초기에는 mock fetch 함수에 Query를 붙이고, 이후 Steam API 연동이 가능하면 내부 구현만 교체한다.

포함 내용:

- QueryClientProvider 설정
- 게임 목록 query
- 게임 상세 query
- 도전과제 목록 query
- 도전과제 상세 query
- 로딩 상태와 에러 상태 UI
- 스켈레톤 또는 로딩 표시

예상 파일:

- `src/apis/mockApi.ts`
- `src/hooks/useGamesQuery.ts`
- `src/hooks/useGameDetailQuery.ts`
- `src/hooks/useAchievementsQuery.ts`
- `src/components/common/LoadingState.tsx`
- `src/components/common/ErrorState.tsx`

확인 항목:

- React Query Devtools 없이도 코드에서 Query 사용 확인 가능
- 로딩/에러 상태가 화면에 표시됨
- mock data가 비동기 API처럼 동작

### 7. Implement Achievement Detail and Spoiler Guide View

도전과제 상세 페이지와 스포일러 단계별 공략 보기를 구현한다.

포함 내용:

- 도전과제 이름, 설명, 아이콘, 전체 유저 달성률 표시
- 체감 난이도 표시
- 예상 소요 시간 표시
- 관련 태그 표시
- DLC/멀티플레이/플랫폼/버그 주의사항 표시
- 힌트만 보기
- 자세한 공략 보기
- 스포일러 포함 공략 보기

예상 파일:

- `src/pages/AchievementDetailPage.tsx`
- `src/components/guide/SpoilerGuideTabs.tsx`
- `src/components/guide/GuideCard.tsx`
- `src/components/achievement/AchievementMetaPanel.tsx`

확인 항목:

- 스포일러 단계 전환 가능
- 공략 내용이 단계별로 다르게 표시됨
- 태그와 주의사항이 눈에 잘 들어옴

### 8. Implement Guide Create, Edit, and Delete Flow

사용자가 도전과제 공략을 작성하고 수정/삭제할 수 있는 흐름을 만든다.
초기 구현은 서버 없이 Zustand 또는 localStorage 기반으로 처리한다.

포함 내용:

- React Hook Form 적용
- 공략 제목 입력
- 힌트 입력
- 자세한 공략 입력
- 스포일러 포함 공략 입력
- 난이도 선택
- 예상 소요 시간 입력
- 조건/DLC/플랫폼/버그 주의 입력
- 공략 수정
- 공략 삭제

예상 파일:

- `src/pages/GuideEditorPage.tsx`
- `src/components/guide/GuideForm.tsx`
- `src/stores/guideStore.ts`

확인 항목:

- 새 공략 작성 후 상세 페이지에서 확인 가능
- 기존 공략 수정 가능
- 삭제 후 목록에서 제거됨
- 새로고침 유지가 필요하면 localStorage 사용

### 9. Implement Checklist and Difficulty Voting

사용자가 도전하고 싶은 도전과제를 저장하고, 난이도 투표를 할 수 있게 만든다.

포함 내용:

- 체크리스트 추가/제거
- 진행 중/완료 상태 변경
- 놓치기 쉬움/2회차 필요 표시
- 난이도 투표 UI
- 쉬움/보통/어려움/매우 어려움 선택
- 난이도 투표 결과 표시

예상 파일:

- `src/stores/checklistStore.ts`
- `src/stores/voteStore.ts`
- `src/components/checklist/ChecklistButton.tsx`
- `src/components/checklist/ChecklistPanel.tsx`
- `src/components/vote/DifficultyVote.tsx`

확인 항목:

- 도전과제를 체크리스트에 추가 가능
- 완료 상태 변경 가능
- 난이도 투표 결과가 화면에 반영됨

### 10. Add Charts and Recommendation Section

기획서의 시각화와 쉬운 도전과제 추천 흐름을 최소 구현한다.

포함 내용:

- Recharts로 달성률 차트 표시
- 난이도 투표 결과 차트 표시
- 쉬운 도전과제 추천 목록
- 추천 기준: 달성률 높음, 쉬움 투표 비율 높음, 짧은 예상 소요 시간, DLC/멀티플레이 불필요

예상 파일:

- `src/components/chart/AchievementRateChart.tsx`
- `src/components/chart/DifficultyVoteChart.tsx`
- `src/components/recommendation/EasyAchievementList.tsx`
- `src/utils/recommendAchievements.ts`

확인 항목:

- 차트가 빈 화면 없이 렌더링됨
- 추천 목록이 mock data 기준으로 계산됨

### 11. Polish UI and Responsive Layout

과제 제출 전에 UI 완성도를 높인다.

포함 내용:

- 전체 색상/타이포그래피 정리
- 카드 간격 정리
- 버튼/입력/셀렉트/배지 스타일 통일
- 모바일 반응형 확인
- 빈 목록 상태 UI
- 에러 상태 UI
- README 실행 방법 갱신

확인 항목:

- `npm run build`
- `npm run lint`
- 메인/검색/상세/작성/체크리스트 흐름 직접 클릭 확인

### 12. Optional Steam API Integration

API Key 없이 가능한 범위부터 연결한다.
Steam API Key가 필요한 기능은 프론트엔드에 직접 노출하지 않는 방향을 우선 고려한다.

포함 내용:

- 공개 API로 가능한 도전과제 달성률 조회 테스트
- CORS 문제가 있으면 mock data 유지
- `.env.example`에 필요한 키 이름 안내
- 실제 `.env`는 커밋하지 않음
- Steam 라이브러리 연동은 2차 확장으로 분리

확인 항목:

- API 실패 시 mock data fallback 가능
- API Key가 Git에 올라가지 않음
- 브라우저 Network 탭에 노출되는 정보 확인

## 추천 진행 순서

1. 기본 Vite 화면 제거
2. mock data와 타입 정의
3. 라우팅과 페이지 틀 구성
4. 게임 검색/상세 구현
5. 도전과제 목록/상세 구현
6. TanStack Query 적용
7. 공략 작성/수정/삭제 구현
8. 체크리스트와 난이도 투표 구현
9. 차트와 쉬운 도전과제 추천 구현
10. UI 다듬기
11. 가능하면 Steam API 일부 연결

## 커밋 메시지 예시

```txt
Define MVP mock data and types
Build app layout and routes
Implement game search page
Implement game detail achievements
Add TanStack Query data layer
Implement achievement guide view
Add guide editor flow
Add checklist and difficulty voting
Add charts and recommendations
Polish responsive UI
Integrate Steam achievement API fallback
```

## 이번 프로젝트에서 우선 피할 것

- 처음부터 모든 Steam API를 완벽히 연결하려고 하기
- API Key를 프론트엔드에 직접 넣고 배포하기
- 로그인/회원가입을 먼저 구현하기
- 백엔드 없이 복잡한 권한 기능을 구현하려고 하기
- UI 없이 데이터 구조만 오래 붙잡기

## 현재 상태 메모

현재 프로젝트는 초기 Vite React TypeScript scaffold와 필수 패키지 설치까지만 완료된 상태다.
브라우저에서 기본 Vite 화면이 보이는 것이 정상이며, 다음 작업은 기본 화면을 기획서 기반 서비스 화면으로 교체하는 것이다.

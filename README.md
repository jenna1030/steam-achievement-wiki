# Steam Achievement Wiki

Steam 게임의 도전과제를 검색하고, 부족한 달성 조건을 사용자 공략으로
보완하며, 체크리스트와 내 Steam 기록까지 한 흐름으로 관리하는 웹
애플리케이션입니다.

BCSD 프론트엔드 트랙 개인 프로젝트로 제작했습니다.

[배포 사이트](https://steam-achievement-wiki.vercel.app/) ·
[CI](https://github.com/jenna1030/steam-achievement-wiki/actions/workflows/ci.yml)

![CI](https://github.com/jenna1030/steam-achievement-wiki/actions/workflows/ci.yml/badge.svg)

## 프로젝트 목표

Steam은 도전과제의 이름, 설명, 아이콘, 전체 달성률을 제공하지만 실제 공략,
DLC·멀티플레이 필요 여부, 놓치기 쉬운 조건까지 모두 알려 주지는 않습니다.
이 프로젝트는 Steam에서 가져온 기본 정보와 사용자가 작성한 공략 데이터를
분리해서 관리하고, 검색에서 실행 계획까지 연결합니다.

```text
Steam Store 검색·Steam Web API
  게임 / 도전과제 / 아이콘 / 전체 달성률 / 개인 달성 기록
                              +
브라우저에 저장하는 사용자 데이터
  공략 / 태그 / 난이도 투표 / 체크리스트 / 관심 게임
                              =
도전과제 공략 위키 + 개인 플래너
```

## 주요 기능

### 게임과 도전과제 탐색

- Steam Store 검색 결과를 25개씩 불러오는 게임 검색과 더보기
- 게임명, 장르·태그, 도전과제 개수 범위 필터
- `appid` 기반 게임 상세 정보와 Steam 상점 링크
- 도전과제 아이콘, 설명, 숨김 여부, 전체 달성률 조회
- 달성률·이름 정렬과 공략 태그 기반 필터
- 관심 게임과 최근 검색어의 브라우저 저장
- 최초 조회와 더보기 구간의 스켈레톤 UI

### 공략 위키

- 게임과 도전과제를 검색해 공략 작성·수정·삭제
- 힌트, 자세한 공략, 스포일러 단계별 공개
- 난이도, 예상 시간 범위, 태그, 준비물, 주의사항 입력
- DLC·멀티플레이 조건을 `알 수 없음 / 필요 / 불필요`로 구분하고 2회차 조건 표시
- 한 도전과제의 여러 공략을 좋아요 수 기준으로 정렬
- 좋아요, 싫어요, 신고와 공략 접기·펼치기
- 실제 사용자 데이터와 구분되는 발표용 예시 공략

### 개인 기록

- 도전과제 저장, 진행 중, 완료 상태와 메모를 관리하는 체크리스트
- 가장 좋아요가 많은 공략을 체크리스트에서 우선 안내
- 난이도 투표와 다른 항목으로 재투표
- Steam OpenID 로그인과 공개 프로필·라이브러리 조회
- 플레이 시간·최근 2주·이름 기준 라이브러리 정렬
- 게임별 개인 도전과제 진행률과 100% 완료 배지
- 전체 라이브러리 도전과제 달성 기록 자동 집계
- SteamID별 로컬 공략 분리와 내가 작성한 공략 모아보기

### 품질과 사용자 경험

- 모바일·분할 화면을 고려한 반응형 레이아웃
- 라우트와 차트 지연 로딩
- 전역 Error Boundary와 API별 로딩·오류 상태
- 본문 바로가기, 폼 레이블, 키보드 조작, ARIA 상태 안내
- localStorage 버전 관리, 런타임 스키마 검증, 이전 데이터 마이그레이션
- Steam 요청 타임아웃과 라우트별 메모리 기반 레이트 리밋

## 기술 스택

| 영역 | 기술 | 사용 목적 |
| --- | --- | --- |
| UI | React 19, TypeScript | 컴포넌트 기반 UI와 strict 타입 검사 |
| 빌드 | Vite 8 | 개발 서버, 코드 분할, 프로덕션 빌드 |
| 라우팅 | React Router 7 | SPA 라우팅과 동적 상세 경로 |
| 서버 상태 | TanStack Query 5 | 캐시, 로딩·오류, 무한 쿼리 |
| 클라이언트 상태 | Zustand 5 | 공략, 투표, 체크리스트, 관심 게임 |
| 폼 | React Hook Form 7 | 공략 입력과 검증 |
| 차트 | Recharts 3 | 전체 달성률과 난이도 투표 시각화 |
| API 계층 | Fetch, Node.js, Vercel Functions | Steam 프록시와 OpenID 세션 |
| 품질 | Oxlint, Vitest, TypeScript | 린트, 자동 테스트, strict 빌드 |
| 배포 | GitHub Actions, Vercel | CI와 `main` 자동 배포 |

Tailwind, Styled Components 같은 별도 스타일 라이브러리는 사용하지 않습니다.
남색·붉은색·아이보리색 디자인 토큰과 역할별 CSS 파일로 스타일 책임을
통일했습니다.

## 데이터와 보안 경계

| 데이터 | 출처·저장 위치 | 관리 방식 |
| --- | --- | --- |
| 게임·도전과제·달성률 | Steam Store / Steam Web API | TanStack Query 캐시 |
| 로그인 상태 | 서명된 HttpOnly 쿠키 | 서버에서 OpenID 응답 검증 |
| 공략·투표·체크리스트 | 현재 브라우저 localStorage | Zustand + 스키마 검증 |
| 관심 게임·최근 검색어 | 현재 브라우저 localStorage | Zustand + 스키마 검증 |

`STEAM_API_KEY`는 로컬 Node 프록시와 Vercel Functions에서만 사용하며 브라우저
번들에 포함하지 않습니다. `VITE_STEAM_API_KEY`처럼 클라이언트에 노출되는
환경변수는 만들지 않습니다.

## 프로젝트 구조

```text
.
├─ api/                 # Vercel Functions 진입점
├─ server/              # 로컬 Node API와 공용 Steam 요청 처리기
├─ src/
│  ├─ apis/             # 브라우저 API 호출 함수
│  ├─ components/       # 화면 역할별 React 컴포넌트
│  ├─ data/             # 명시적으로 구분한 예시 공략
│  ├─ hooks/            # TanStack Query 훅
│  ├─ pages/            # 라우트 페이지
│  ├─ stores/           # Zustand 로컬 상태
│  ├─ styles/           # 토큰·레이아웃·컴포넌트·반응형 CSS
│  ├─ types/            # 도메인 타입
│  └─ utils/            # 식별자·검증·추천·정렬 순수 로직
├─ .env.example
├─ vercel.json
└─ vite.config.ts
```

## 현재 범위와 한계

- 공략·평가·투표·체크리스트는 현재 브라우저에만 저장되며 다른 기기와
  동기화되지 않습니다.
- `ownerSteamId`는 같은 브라우저 안에서 계정을 분리하기 위한 값이며 서버 권한
  검증이나 데이터베이스를 대신하지 않습니다.
- 예시 공략은 발표용 읽기 전용 데이터이며 사용자 작성 공략과 배지로 구분합니다.
- Steam 프로필 또는 게임 세부 정보가 비공개면 라이브러리와 개인 달성 기록을
  조회할 수 없습니다.
- 댓글과 계정 간 커뮤니티 데이터 동기화는 영속 백엔드가 필요한 후속 범위입니다.
- 레이트 리밋은 Vercel 인스턴스 메모리 기반의 소규모 시연용 안전장치입니다.

발표 이후 지속 운영하지 않는 프론트엔드 프로젝트이므로 데이터베이스, 분산 레이트
리밋, 운영 로그는 의도적으로 범위에서 제외했습니다.

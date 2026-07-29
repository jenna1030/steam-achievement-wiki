# Vercel 배포 가이드

이 프로젝트는 `dist`의 Vite SPA와 루트 `api` 디렉터리의 Vercel Functions를
한 프로젝트로 배포한다. React Router 새로고침은 `vercel.json`의 SPA rewrite로
처리한다.

## 1. 배포 전 검사

```bash
npm ci
npm run check
```

`.env`가 Git에 포함되지 않았는지 확인한다.

```bash
git status --ignored --short .env
```

정상이라면 `!! .env`로 표시된다.

## 2. GitHub와 Vercel 연결

1. GitHub의 `jenna1030/steam-achievement-wiki` 저장소를 Vercel에서 Import한다.
2. Framework Preset은 Vite, Build Command는 `npm run build`, Output Directory는
   `dist`를 사용한다.
3. Production Branch는 `main`으로 설정한다.

Vercel은 루트 `api` 디렉터리의 JavaScript 파일을 Node.js Functions로
배포한다. SPA deep link는 공식 Vite 배포 안내와 동일하게 `index.html`로
rewrite한다.

- [Vite on Vercel](https://vercel.com/docs/frameworks/frontend/vite)
- [Vercel Node.js Functions](https://vercel.com/docs/functions/runtimes/node-js)

## 3. 환경변수

Production과 필요한 Preview 환경에 다음 값을 등록한다.

| 이름 | 예시 | 설명 |
| --- | --- | --- |
| `STEAM_API_KEY` | 비공개 값 | Steam Web API 서버 요청 |
| `SESSION_SECRET` | 32바이트 이상의 임의 값 | 로그인 쿠키 HMAC 서명 |
| `CLIENT_BASE_URL` | `https://프로젝트.vercel.app` | 로그인 후 돌아갈 프론트 주소 |
| `SERVER_BASE_URL` | `https://프로젝트.vercel.app` | Steam OpenID realm/callback 기준 주소 |

`STEAM_API_KEY`와 `SESSION_SECRET`은 Vercel에서 Sensitive로 등록한다. 환경변수
변경은 기존 배포에 자동 적용되지 않으므로 변경 후 재배포해야 한다.

- [Vercel 환경변수](https://vercel.com/docs/environment-variables)

Preview URL은 배포마다 달라진다. Steam 로그인까지 Preview에서 검증하려면 해당
Preview 주소를 `CLIENT_BASE_URL`, `SERVER_BASE_URL`에 함께 설정해야 한다.
발표용 Production URL을 기준으로 시연한다면 Production에만 고정 주소를 두는
편이 단순하다.

## 4. 배포 후 점검

1. `/`, `/games`, `/checklist`를 직접 열고 새로고침한다.
2. `/api/steam/game?appid=1145350`가 JSON을 반환하는지 확인한다.
3. `/api/auth/session`이 로그아웃 상태에서 `401`을 반환하는지 확인한다.
4. Steam 로그인 후 callback이 같은 배포 도메인으로 돌아오는지 확인한다.
5. 마이페이지에서 공개 라이브러리를 조회한다.
6. 브라우저 개발자 도구에서 `STEAM_API_KEY`가 요청 URL이나 번들에 없는지
   확인한다.
7. 같은 Steam API 경로를 짧은 시간에 반복 호출해 `429`와 `Retry-After`가
   반환되는지 확인한다.
8. `npm audit`의 React Router RSC 권고와 수정 버전 게시 여부를 다시 확인한다.

현재 레이트 리밋은 IP·라우트별 1분 창을 사용하는 인스턴스 메모리 기반
안전장치다. Vercel 인스턴스 전체에 공통으로 적용해야 하는 운영 규모에서는
Upstash Redis나 Vercel WAF처럼 공유 상태를 사용하는 방식으로 교체한다.

## 5. Git 배포 흐름

기능 브랜치에서 pull request를 만들면 GitHub Actions와 Vercel Preview로
검증하고, `main` 병합 후 Production 배포를 확인한다.

```text
feature branch
  -> pull request
  -> GitHub Actions: lint + Vitest + strict build
  -> Vercel Preview
  -> main merge
  -> Vercel Production
```

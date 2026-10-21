# 포트스퀘어 (PORT-SQUARE) | 부산항 항만종사자 종합 광장 & 8대 직군별 전용 커뮤니티 플랫폼

부산항(북항·신항·감천항·다대포항) 50,000여 항만 종사자들이 직군별로 깊이 있게 소통하면서도 전 직군이 하나로 어우러질 수 있도록 설계된 **이중 허브(Dual-Hub) 웹/모바일 PWA 커뮤니티 플랫폼**입니다.

---

## 1. 핵심 아키텍처: Dual-Hub (종합 광장 + 8대 직군 전용 라운지)

- **Hub A. 부산항 종합 광장 (`OPEN_SQUARE`)**
  - 전 직군 통합 자유 수다, 실시간 부두·게이트·강풍 경보 브리핑, 직군 간 역지사지 소통 브릿지(`CROSS_CRAFT_BRIDGE`), 안전 아차사고 신문고(`SAFETY_NEAR_MISS`).
- **Hub B. 8대 직군별 전용 길드 라운지 (`GUILD_LOUNGES`)**
  1. `G1_CRANE_EQUIP`: 크레인(QC/STS/RTGC/RMGC)·리치스태커·하역장비 기사 라운지
  2. `G2_YT_TRUCKER`: 구내 야드트랙터(YT) & 외부 컨테이너 트레일러(추레라) 기사 라운지
  3. `G3_STEVEDORE_LASHING`: 항운노조·본선 하역·라싱/고박·신호수·CFS·냉동 현장반 라운지
  4. `G4_MARINE_PILOT_TUG`: 도선사·예선(Tug)·강선·급유선·통선·선박수리·해운대리점 라운지
  5. `G5_INSPECT_CUSTOMS_SEC`: 공인 검수사·검량사·세관·검역·부산항보안공사·안전관리자 라운지
  6. `G6_TERMINAL_TOC_PLANNER`: 터미널 운영사(TOC)·선사·포워더·선석/본선/야드 플래너 라운지
  7. `G7_PORT_ENGINEER`: 항만 기계/전기 정비·냉동컨테이너(Reefer) 수리·자동화/IT 엔지니어 라운지
  8. `G8_ACADEMY_NEWBIE`: 한국항만연수원 교육생·자격증 준비생·신규 입직자 멘토링 라운지
- **실시간 부두 펄스 (`LIVE_PORT_PULSE`)**
  - 타이핑 없는 **3-Tap 현장 상황 제보** 및 **무전 워키토키 음성(PTT STT)** 브리핑, 부산항 11개 주요 터미널 게이트 턴타임·장치율·풍속 전광판, `BUSAN-HAK-PORT-INFO` 실시간 모선 스케줄 연동.
- **역지사지 직군 브릿지 & 영지식 익명 보호 (`CROSS_CRAFT_HARMONY`)**
  - Salted SHA-256 단방향 익명 토큰, 첨부 사진 EXIF(GPS·기기 시리얼) 100% 세탁, AI 에티켓 문장 순화기, 8대 직군 동수 교차 배심원단(`Cross-Guild Jury`) 자정 시스템.
- **교대근무 시차 동기화 항만 라이프 (`PORT_LIFE_WELFARE`)**
  - 야간조 퇴근(새벽 04~08시) 맞춤 국밥/해장국집 지도(대형 트레일러 주차 가능 필터), 24시 무료 샤워실/수면실, 안전장비 상생 중고장터·공동구매, 평일 오프 동호회(바다낚시·항만 궁도회·풋살·카풀·일일 대타 배차).

---

## 2. 1+7 에이전트 오케스트레이션 편제 (`.agents/` & `AGENTS.md`)

| 역할 코드 | 담당 페르소나 | 핵심 도메인 책무 |
| :--- | :--- | :--- |
| **`port-square-orchestrator`** | **장보고** 총괄 디렉터 | 이중 허브 SSOT 통제 · 직군 균형 중재 · 5대 품질 게이트 Veto 권한 |
| **`guild-taxonomy-architect`** | **윤태호** 직군·권역 수석 | 종합 광장 ↔ 8대 직군 라운지 3차원 라우팅 및 공간별 자동 전환 멀티 배지 |
| **`realtime-port-pulse-lead`** | **박성민 & 강민수** 펄스 수석 | 3-Tap 무타이핑 제보 · 무전 음성 STT · 11개 부두 게이트 턴타임 & 선석 API 연동 |
| **`cross-craft-harmony-guardian`** | **서지훈** 익명·화합 수석 | 영지식 익명 보장 · 사진 EXIF 세탁 · 역지사지 브릿지 · 8대 직군 교차 배심원단 |
| **`port-life-welfare-curator`** | **김나연** 항만라이프 수석 | 주야 교대근무 시차 동기화 · 새벽 식당/샤워실 지도 · 안전장비 장터 · 동호회 |
| **`field-community-ux-director`** | **한서연** 현장 UX 디렉터 | 엄지 1-Swipe 전환 · 야간 캐빈 OLED 다크모드 · 48px+ 장갑 모드 · 카톡 1탭 공유 |
| **`stitch-design-curator`** | **강하늘** 비주얼 디자인 수석 | Google Stitch(`stitch.withgoogle.com`) 3-Layer Vibe 설계 · `DESIGN.md` 토큰 관리 |
| **`community-infra-mcp-lead`** | **최준혁** 인프라·MCP 수석 | 50,000명 실시간 메시징 · 선창/해상 오프라인 큐 · Aside CLI MCP & CI/CD 배포 |

---

## 3. 로컬 실행 및 빌드

```bash
npm install
npm run dev
# 프로덕션 빌드
npm run build
```

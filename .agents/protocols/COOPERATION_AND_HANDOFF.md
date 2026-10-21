# 포트스퀘어(PORT-SQUARE) 1+6 에이전트 협업 및 핸드오프 프로토콜 (COOPERATION_AND_HANDOFF.md)

---

## 1. 개요 및 핵심 협업 원칙

본 문서는 부산항 항만종사자 통합·직군별 커뮤니티 플랫폼(**포트스퀘어 / PORT-SQUARE**)의 설계, 개발, 운영에 참여하는 **총괄 디렉터(`port-square-orchestrator`)와 6대 도메인 서브에이전트** 간의 유기적 협력 체계, 4단계 엔드투엔드 파이프라인, 표준 TypeScript 데이터 인터페이스 계약(Interface Contracts), 그리고 직군·도메인 간 충돌 중재 매트릭스를 규정한다.

### 핵심 3대 운영 원칙
1. **무결점 핸드오프 (Zero-Defect Handoff)**: 선행 단계의 인터페이스 계약(Contract)과 품질 기준이 100% 충족되지 않으면 후행 단계로 작업을 이관할 수 없다.
2. **이중 허브 & 8대 직군 스키마 단일성 (Dual-Hub & Guild SSOT)**: 종합 커뮤니티(부산항 광장)와 8대 직군 전용 라운지, 3대 권역(북항·신항·감천항) 10대 터미널 채널은 반드시 단일 공통 스키마(`types/community.ts`)를 통해서만 교환된다.
3. **익명 보호 및 현장 안전 최우선 중재 (Privacy & Safety Precedence)**: 에이전트 간 요구사항 충돌 시 '영지식 익명 보호 > 실시간 현장 안전 경보 > 직군 간 중립성 > 3-Tap 현장 UX > 부가 편의 기능' 순의 우선순위 매트릭스에 절대 복종한다.

---

## 2. 4단계 엔드투엔드 협업 파이프라인 (The 4-Phase Pipeline)

```
┌────────────────────────────────────────────────────────────────────────┐
│ Phase 1: 이중 허브(종합+8직군) & 익명 토큰 스키마 고정                 │
│ 주관: guild-taxonomy-architect + cross-craft-harmony-guardian          │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ [Handoff Gate 1 통과]
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│ Phase 2: 3대 핵심 도메인 엔진 병렬 구현 (Pulse · Harmony · PortLife)   │
│ 주관: realtime-port-pulse-lead + cross-craft-harmony-guardian +        │
│       port-life-welfare-curator                                        │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ [Handoff Gate 2 통과]
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│ Phase 3: 항만 현장 적응형 UX 조립 (1-Swipe · OLED Dark · 48px Gloved) │
│ 주관: field-community-ux-director                                      │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ [Handoff Gate 3 통과]
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│ Phase 4: 실시간 메시징 · EXIF 세탁 · Aside CLI MCP 검증 및 배포        │
│ 주관: community-infra-mcp-lead + port-square-orchestrator              │
└────────────────────────────────────────────────────────────────────────┘
```

### Phase 1: 이중 허브(종합+8직군) & 익명 토큰 스키마 고정
- **주관 에이전트**: `guild-taxonomy-architect` (리드) + `cross-craft-harmony-guardian` (영지식 익명 분리 검증)
- **핵심 목표**:
  - 종합 커뮤니티(7대 광장 보드)와 8대 직군별 전용 라운지(`G1_CRANE_EQUIP` ~ `G8_ACADEMY_NEWBIE`), 3대 권역 10대 터미널 필터의 라우팅 및 RBAC 매트릭스 확정.
  - 직장/직군 인증 데이터와 게시글 작성자 식별자를 분리하는 `BlindIdentityToken` 및 공간별 자동 전환 멀티 배지(`PublicBadge` vs `GuildInternalBadge`) 스키마 확정.
- **핸드오프 통과 조건**:
  - 공통 타입 정의 컴파일 에러 0건 및 장보고 총괄 디렉터의 Gate 1, Gate 2 사전 승인.

### Phase 2: 3대 핵심 도메인 엔진 병렬 구현
- **주관 에이전트**:
  - `realtime-port-pulse-lead`: 게이트 턴타임/대기줄, 야드 혼잡, 강풍(15m/s+) 작업중지 3-Tap 제보 엔진 및 `BUSAN-HAK-PORT-INFO` 실시간 선석 스케줄 연동.
  - `cross-craft-harmony-guardian`: 직군 간 갈등 완충 '역지사지 브릿지', AI 에티켓 문장 변환기, 8대 직군 교차 배심원단, 안전 아차사고(Near-Miss) 신문고.
  - `port-life-welfare-curator`: 주야 교대근무표(2교대/3조2교대/4조3교대) 동기화 피드, 북항·신항·감천항 새벽 영업 식당/샤워실/주차장 지도, 안전장비 중고장터 및 동호회 보드.
- **핸드오프 통과 조건**:
  - 3명 이상 현장 추천 시 실시간 상단 경보 배너 자동 승격 로직 검증, 교대 시간대별 피드 큐레이션 정상 작동 확인.

### Phase 3: 항만 현장 적응형 UX 조립
- **주관 에이전트**: `field-community-ux-director` (리드)
- **협력 에이전트**: `realtime-port-pulse-lead` (3-Tap 제보 바), `guild-taxonomy-architect` (8대 직군 시뮬레이터)
- **핵심 목표**:
  - 상단 엄지 1-Swipe로 `[부산항 종합 광장] ↔ [내 직군 전용 라운지] ↔ [실시간 부두 펄스] ↔ [항만 라이프/장터]` 150ms 이내 전환.
  - 야간 크레인 캐빈/트럭 유리 반사를 막는 `Port Night OLED 다크모드` 및 주간 직사광선 고대비 모드, 전 버튼 `48px+` 장갑 모드 적용.
  - 카카오톡 단톡방 1탭 브리핑/인기글 공유 카드 렌더러 결합.

### Phase 4: 실시간 메시징 · EXIF 세탁 · Aside CLI MCP 검증 및 배포
- **주관 에이전트**: `community-infra-mcp-lead` (리드) + `port-square-orchestrator` (최종 승인)
- **핵심 목표**:
  - 클라이언트 이미지 업로드 시 EXIF(GPS, 단말기 정보) 100% 제거 파이프라인 검증.
  - 본선 선창(Hold) 및 해상 음영지역 오프라인 작성 큐(`IndexedDB` / `localStorage`) 동기화 검증.
  - Aside CLI MCP 헬스체크 및 GitHub Actions / Vercel 무결점 배포.

---

## 3. 에이전트 간 표준 인터페이스 계약 (Interface Contracts - TypeScript)

### 3.1 8대 항만 직군 및 3대 권역·터미널 코드 (`PortGuildCode` & `PortTerminalId`)
`guild-taxonomy-architect`가 정의하고 전 에이전트가 공통으로 참조한다.

```typescript
export type PortGuildCode =
  | 'G1_CRANE_EQUIP'          // 크레인(QC/STS/RTGC/RMGC)·리치스태커·하역장비 기사
  | 'G2_YT_TRUCKER'           // 야드트랙터(YT) 및 외부 컨테이너 트레일러(추레라) 기사
  | 'G3_STEVEDORE_LASHING'    // 항운노조·본선·라싱/고박·신호수·CFS·냉동 현장반
  | 'G4_MARINE_PILOT_TUG'     // 도선사·예선·강선·급유선·통선·선박수리·해운대리점
  | 'G5_INSPECT_CUSTOMS_SEC'  // 검수사·검량사·세관·검역·항만보안(청원경찰/특수경비)·안전관리
  | 'G6_TERMINAL_TOC_PLANNER' // 터미널 운영사(TOC)·선사·포워더·선석/본선/야드 플래너
  | 'G7_PORT_ENGINEER'        // 항만 기술·기계/전기 정비·냉동(Reefer) 수리·자동화/IT 엔지니어
  | 'G8_ACADEMY_NEWBIE';      // 한국항만연수원 교육생·자격증 준비생·신규 입직자

export type PortZoneCode = 'NORTH_PORT' | 'NEW_PORT' | 'GAMCHEON_DADAEPO' | 'ALL_BUSAN_PORT';

export type PortTerminalId =
  | 'PNC' | 'PNIT' | 'HJNC' | 'HPNT' | 'BNCT' | 'BCT' | 'DGT' // 신항 7대 터미널
  | 'BPT_SHINSUNDAE' | 'BPT_GAMMAN' | 'HBCT' | 'JASUNGDAE' | 'INTL_PAX' // 북항 권역
  | 'GAMCHEON_CENTRAL' | 'GAMCHEON_HANJIN' | 'DADAEPO'; // 감천·다대포 권역
```

### 3.2 영지식 익명 프로필 및 멀티 배지 계약 (`WorkerAnonymousIdentity`)
`cross-craft-harmony-guardian`과 `guild-taxonomy-architect`가 공동 발행한다.

```typescript
export interface WorkerAnonymousIdentity {
  blindTokenHash: string;         // Salted SHA-256 단방향 익명 해시 (실명/출입증 역추적 불가)
  nickname: string;               // 커뮤니티 활동 닉네임 (예: "신항야간갈매기")
  verifiedGuild: PortGuildCode;   // 인증된 소속 직군
  primaryZone: PortZoneCode;      // 주 활동 권역 (북항/신항/감천항)
  primaryTerminal?: PortTerminalId; // 주 출입 터미널 (선택 노출)
  verificationMethod: 'PORT_PASS_OCR' | 'LICENSE_CERT' | 'ALLCON_E_SYNC' | 'UNION_CODE' | 'PEER_VOUCH_3';
  publicSquareBadge: string;      // 종합 광장 노출 배지 (예: "신항 · 크레인기사")
  guildInternalBadge: string;     // 직군 전용 라운지 내부 노출 배지 (예: "14년차 · QC/STS 안벽")
  shiftPattern: 'DAY_NIGHT_2SHIFT' | '3TEAM_2SHIFT' | '4TEAM_3SHIFT' | 'DAY_FULL' | 'FLEX_DISPATCH';
  mannerWaveTemp: number;         // 매너 파도 온도 (기본 36.5°C, 범위 0 ~ 99.9°C)
}
```

### 3.3 이중 허브 게시글 및 직군 간 브릿지 계약 (`CommunityPost`)
`guild-taxonomy-architect`와 `cross-craft-harmony-guardian`이 관리한다.

```typescript
export type HubScope =
  | 'OPEN_SQUARE'         // 부산항 종합 커뮤니티 (전 직군 열람·작성)
  | 'GUILD_EXCLUSIVE'     // 직군별 전용 라운지 (인증된 해당 직군만 작성·열람)
  | 'GUILD_OPEN_QNA'      // 직군 라운지 내 타 직군 질문 허용 탭
  | 'CROSS_CRAFT_BRIDGE'; // 직군 간 역지사지 소통·협업 제안 보드

export interface CommunityPost {
  postId: string;
  hubScope: HubScope;
  targetGuild?: PortGuildCode;        // GUILD_EXCLUSIVE 또는 CROSS_CRAFT_BRIDGE 대상 직군
  fromGuild: PortGuildCode;           // 작성자 직군
  zone: PortZoneCode;
  terminalId?: PortTerminalId;
  category:
    | 'FREE_TALK'          // 자유 수다 / 교대조 이야기
    | 'LIVE_PORT_PULSE'    // 실시간 부두·게이트·기상 제보
    | 'CROSS_CRAFT_ASK'    // 타 직군에게 부탁/질문해요 (역지사지 브릿지)
    | 'SAFETY_NEAR_MISS'   // 항만 아차사고·안전 신문고
    | 'TECH_KNOWHOW'       // 직군별 장비·작업 노하우
    | 'NIGHT_FOOD_REST'    // 야간조 식당·휴게소·샤워실 꿀팁
    | 'GEAR_MARKET'        // 안전화·무전기·방한복 장터/나눔
    | 'CLUB_MEETUP';       // 낚시·축구·궁도·카풀 모임
  authorIdentity: WorkerAnonymousIdentity;
  title: string;
  content: string;
  aiEtiquettePolished?: boolean;      // AI 에티켓 도우미로 순화된 직군 소통글 여부
  exifStrippedMediaUrls: string[];    // EXIF 메타데이터가 100% 제거된 이미지/영상 URL
  upvotes: number;
  guildReactionBreakdown: Partial<Record<PortGuildCode, number>>; // 직군별 공감 분포 (예: 크레인 12, YT 19, 본선 8)
  commentCount: number;
  createdAt: string;
}
```

### 3.4 실시간 현장 펄스 제보 계약 (`PortPulseReport`)
`realtime-port-pulse-lead`가 생산하고 전 채널 상단 전광판 및 `field-community-ux-director`가 소비한다.

```typescript
export interface PortPulseReport {
  pulseId: string;
  terminalId: PortTerminalId;
  berthNo?: string;                   // 예: "HJNC 2선석", "PNC 5선석"
  vesselName?: string;                // BUSAN-HAK-PORT-INFO 연동 선명 (예: "HMM ALGECIRAS")
  pulseType:
    | 'GATE_TURN_TIME'                // 게이트 반출입 대기시간 (분)
    | 'YARD_BLOCK_JAM'                // 야드 특정 블록 상하차 정체
    | 'HIGH_WIND_HOLD'                // 강풍(15m/s+)/안개 본선 작업 일시중지
    | 'EQUIP_MAINTENANCE'             // 크레인/장비 고장·점검 지연
    | 'WORK_RESUMED_CLEAR';           // 대기 해제 및 작업 정상 재개
  severity: 'NORMAL' | 'CAUTION' | 'CONGESTED' | 'SUSPENDED';
  estimatedWaitMinutes?: number;      // 트레일러/YT 체감 대기 시간(분)
  windSpeedMps?: number;              // 현장 체감/관측 풍속 (m/s)
  inputMethod: '3TAP_CHIP' | 'VOICE_PTT_STT' | 'TEXT';
  shortBriefing: string;              // 예: "신항 PNC 게이트 반입줄 용원교차로까지 대기 약 45분"
  reporterGuild: PortGuildCode;
  confirmationsCount: number;         // 현장 동료 '맞아요(실제상황)' 검증 횟수
  isPromotedToBanner: boolean;        // 3인 이상 검증 시 상단 경보 배너 승격 여부
  reportedAt: string;
  expiresAt: string;                  // 자동 만료 시각 (기본 90분)
}
```

---

## 4. 에이전트 간 충돌 중재 매트릭스 (Conflict Resolution Priority Matrix)

| 갈등 시나리오 | 충돌 에이전트 | 상충 내용 | 판정 및 강제 실행 조치 | 최종 판결 |
| :--- | :--- | :--- | :--- | :--- |
| **직군 라운지 폐쇄성 vs 타 직군 소통 요구** | `guild-taxonomy-architect`<br>vs<br>`cross-craft-harmony-guardian` | 크레인 라운지에 트레일러 기사가 직접 들어와 항의 글을 쓰려 하는 경우 | **공간 분리 + 브릿지 우회**: 직군 전용 라운지(`GUILD_EXCLUSIVE`)는 타 직군 쓰기를 원천 차단하여 직군 안전지대를 보호하되, 타 직군에 대한 건의·질문은 종합 광장의 **'역지사지 직군 브릿지(`CROSS_CRAFT_BRIDGE`)'**에서 양방향 태그 호출로 연결함. | 장보고 총괄 |
| **빠른 현장 사진 제보 vs 제보자 신원 노출 위험** | `realtime-port-pulse-lead`<br>vs<br>`community-infra-mcp-lead` | 사고/위험 현장 사진을 원본 그대로 즉시 올리면 GPS 좌표와 기기 시리얼로 제보자가 특정될 위험 | **익명 보안 최우선**: 클라이언트 Web Worker에서 150ms 이내에 EXIF 전체 삭제 및 차량 번호판/얼굴 블러 처리를 거친 뒤 업로드하도록 강제함. | 최준혁 수석 |
| **실시간 제보 신속성 vs 허위 혼잡 제보 방지** | `realtime-port-pulse-lead`<br>vs<br>`cross-craft-harmony-guardian` | 3-Tap 제보로 누구나 게이트 마비 경보를 올릴 경우 허위 제보로 혼란 발생 우려 | **단계적 신뢰도 승격**: 1인 제보 시에는 '현장 제보 접수(검증 중)'로 피드에 표시하고, 동일 권역 종사자 3인 이상이 `[맞아요]`를 누르거나 `BUSAN-HAK-PORT-INFO`/체인포털 지표와 일치할 때 전광판 공식 경보 배너로 승격함. | 박성민·강민수 |
| **직군 간 감정적 설전 vs 표현의 자유** | `cross-craft-harmony-guardian`<br>vs<br>`field-community-ux-director` | 특정 직군 전체를 싸잡아 비난하는 글이 실시간 인기글에 오르는 현상 | **AI 에티켓 + 8대 직군 교차 배심원**: 작성 단계에서 AI 에티켓 도우미가 직군 비하 단어를 감지해 순화 문장을 제안하며, 신고 누적 시 8대 직군에서 각 1명씩 무작위 추출된 '교차 배심원단' 찬성 시 자동 블라인드 처리함. | 서지훈 수석 |

---

## 5. 단계별 핸드오프 체크리스트

- [ ] **Gate 1 (이중 허브 & 8대 직군 분리)**: 종합 커뮤니티(부산항 광장)와 8대 직군 전용 라운지가 상단 스위처 및 직군 시뮬레이터를 통해 즉시 전환되며 권한 격리가 완벽한가?
- [ ] **Gate 2 (영지식 익명성 & EXIF 제거)**: 게시글/댓글 객체에 실명·연락처·사번이 전혀 포함되지 않으며, 이미지 업로드 시 EXIF 메타데이터가 100% 제거되는가?
- [ ] **Gate 3 (현장 3-Tap 제보 & 48px 장갑 모드)**: 터미널 선택 → 상황 칩 선택 → 등록의 3-Tap으로 실시간 현장 제보가 완료되며, 모든 터치 타깃이 48px 이상인가?
- [ ] **Gate 4 (직군 화합 브릿지 & 교대근무 라이프)**: 직군별 공감 분포 표시, 역지사지 브릿지 게시판, 주야 교대근무 시간대별 맞춤 피드 및 새벽 식당/장터 기능이 정상 작동하는가?
- [ ] **Gate 5 (오프라인 복원력 & 무중단 배포)**: 오프라인 큐(`localStorage`/`IndexedDB`), TypeScript 에러 0건, Aside CLI MCP 헬스체크가 모두 정상인가?

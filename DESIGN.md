# DESIGN.md — 포트스퀘어 (PORT-SQUARE) Maritime-Cockpit Design System
*(Google Stitch `DESIGN.md` Open Standard Specification — Curated by `stitch-design-curator` 강하늘 & `field-community-ux-director` 한서연)*

---

## 1. Design System Overview & Dual Vibe Identity

- **System Name**: **Port-Square Maritime-Cockpit Design System v1.0**
- **Target Domain**: 부산항 50,000여 항만 종사자 종합 광장(Open Square) 및 8대 직군 전용 라운지(Guild Lounges) 웹/모바일 PWA
- **Core Vibe Philosophy**:
  1. **Night-Pier Cockpit Vibe (Default Dark Mode)**: 야간조 안벽 겐트리크레인(40m 상공 유리 캐빈) 및 야드트랙터/트레일러 운전석 전면 유리에 스마트폰 화면 빛이 반사되어 시야를 방해하지 않도록 설계된 `#090D16` 기반 저반사·고시인성 다크 인터페이스.
  2. **Daylight Apron High-Contrast Vibe (Sunlight Mode)**: 주간 부두 에이프런 및 야드의 강한 직사광선 아래에서도 한눈에 읽히는 고대비 라이트 인터페이스.
  3. **Gloved-Hand Ergonomics (48px+ Tactile Rule)**: 목장갑·가죽장갑을 착용한 본선/라싱 작업자와 정차 중인 장비 기사가 오터치 없이 조작할 수 있는 48px~54px 대형 터치 타깃.

---

## 2. Semantic Color Tokens

### 2.1 Surface & Background Tokens
- `--bg-cockpit-primary`: `#090D16` (Port Night OLED Deep Navy-Black)
- `--bg-cockpit-elevated`: `#0F172A` (`slate-900` — Card & Panel Surface)
- `--bg-cockpit- sunken`: `#020617` (`slate-950` — Input & Metric Sub-box)
- `--border-subtle`: `#1E293B` (`slate-800`)

### 2.2 8 Occupational Guild Accent Tokens
- **`G1_CRANE_EQUIP` (크레인·장비기사)**: Sky Cyan (`#38BDF8` / `bg-sky-500/15` / `text-sky-300`)
- **`G2_YT_TRUCKER` (YT·트레일러기사)**: Safety Amber (`#F59E0B` / `bg-amber-500/15` / `text-amber-300`)
- **`G3_STEVEDORE_LASHING` (항운노조·본선·라싱)**: Signal Emerald (`#10B981` / `bg-emerald-500/15` / `text-emerald-300`)
- **`G4_MARINE_PILOT_TUG` (도선·예선·해운선박)**: Deep Marine Indigo (`#6366F1` / `bg-indigo-500/15` / `text-indigo-300`)
- **`G5_INSPECT_CUSTOMS_SEC` (검수·세관·항만보안)**: Beacon Pink (`#EC4899` / `bg-pink-500/15` / `text-pink-300`)
- **`G6_TERMINAL_TOC_PLANNER` (터미널·선사·플래너)**: Control Purple (`#A855F7` / `bg-purple-500/15` / `text-purple-300`)
- **`G7_PORT_ENGINEER` (항만정비·냉동·IT)**: Tech Teal (`#14B8A6` / `bg-teal-500/15` / `text-teal-300`)
- **`G8_ACADEMY_NEWBIE` (항만연수원·신입)**: Sprout Lime (`#84CC16` / `bg-lime-500/15` / `text-lime-300`)

### 2.3 Live Port Pulse Status Tokens
- `NORMAL` (원활 · 턴타임 25분 이하): `#10B981` (Emerald)
- `CAUTION` / `WIND_STANDBY` (강풍 14m/s+ · 야드 대기): `#F59E0B` (Amber)
- `CONGESTED` / `SUSPENDED` (게이트 정체 35분+ · 작업중지): `#F43F5E` (Rose)

---

## 3. Typography & Numeric Discipline

- **Primary Sans Font**: `Pretendard`, `-apple-system`, `BlinkMacSystemFont`, `"Noto Sans KR"`, `sans-serif`
- **Monospace / Telemetry Font**: `ui-monospace`, `SFMono-Regular`, `Menlo`, `monospace`
- **Tabular Numerals Rule (`tabular-nums`)**:
  - 터미널 게이트 대기시간(`44분`), 야드 장치율(`86%`), 안벽 풍속(`14.8m/s`), 매너 파도 온도(`41.2°C`), 직군 접속자 수(`1,490명`) 등 모든 수치 데이터에는 반드시 `font-variant-numeric: tabular-nums`를 적용하여 실시간 수치 갱신 시 레이아웃 흔들림을 방지한다.

---

## 4. Google Stitch 3-Layer Component Anatomy Specs

1. **Multi-Persona Guild Simulator Bar (`Header Layer`)**
   - 상단 스티키 바에 8개 직군 칩을 수평 배치하고, 우측에 현재 선택된 직군의 `[종합광장 배지]`와 `[직군라운지 내부 배지]`를 실시간 비교 표시한다.
2. **3-Tap Zero-Typing Port Pulse Console (`LivePortPulseView`)**
   - `Step 1 (11개 부두 칩)` → `Step 2 (4대 현장 상황 대형 칩)` → `Step 3 (즉시 발신 CTA & 무전 음성 PTT 버튼)`을 수직 흐름으로 배치하여 타이핑 없이 3초 내 제보를 완수한다.
3. **Cross-Craft Empathy & AI Etiquette Card (`CrossCraftHarmonyView`)**
   - 거친 현장 원문 입력창과 `AI 에티켓 문장 순화 미리보기` 패널을 대비시키고, 하단에 8대 직군 동수 교차 배심원단(`Cross-Guild Jury`) 실시간 찬반 배지를 배치한다.

export type PortGuildCode =
  | 'G1_CRANE_EQUIP'          // 크레인(QC/STS/RTGC/RMGC)·리치스태커·하역장비 기사
  | 'G2_YT_TRUCKER'           // 야드트랙터(YT) 및 외부 컨테이너 트레일러(추레라) 기사
  | 'G3_STEVEDORE_LASHING'    // 항운노조·본선·라싱/고박·신호수·CFS·냉동 현장반
  | 'G4_MARINE_PILOT_TUG'     // 도선사·예선·강선·급유선·통선·선박수리·해운대리점
  | 'G5_INSPECT_CUSTOMS_SEC'  // 검수사·검량사·세관·검역·항만보안(청원경찰/특수경비)·안전관리
  | 'G6_TERMINAL_TOC_PLANNER' // 터미널 운영사(TOC)·선사·포워더·선석/본선/야드 플래너
  | 'G7_PORT_ENGINEER'        // 항만 기술·기계/전기 정비·냉동(Reefer) 수리·자동화/IT 엔지니어
  | 'G8_ACADEMY_NEWBIE';      // 한국항만연수원 교육생·자격증 준비생·신규 입직자

export type PortZoneCode = 'ALL_BUSAN_PORT' | 'NEW_PORT' | 'NORTH_PORT' | 'GAMCHEON_DADAEPO';

export type PortTerminalId =
  | 'PNC'
  | 'PNIT'
  | 'HJNC'
  | 'HPNT'
  | 'BNCT'
  | 'BCT'
  | 'DGT'
  | 'BPT_SHINSUNDAE'
  | 'BPT_GAMMAN'
  | 'HBCT'
  | 'JASUNGDAE'
  | 'INTL_PAX'
  | 'GAMCHEON_CENTRAL'
  | 'DADAEPO';

export type HubScope =
  | 'OPEN_SQUARE'         // 부산항 종합 커뮤니티 (전 직군 열람·작성)
  | 'GUILD_EXCLUSIVE'     // 8대 직군별 전용 라운지 (해당 직군 전용 / 타 직군 Q&A 옵션)
  | 'CROSS_CRAFT_BRIDGE'; // 직군 간 역지사지 소통·협업 브릿지

export type OpenSquareBoardType =
  | 'ALL_SQUARE'
  | 'FREE_TALK'
  | 'LIVE_PORT_PULSE'
  | 'CROSS_CRAFT_ASK'
  | 'SAFETY_NEAR_MISS'
  | 'NIGHT_FOOD_REST'
  | 'GEAR_MARKET'
  | 'CLUB_MEETUP';

export type VerificationMethod =
  | 'PORT_PASS_OCR'
  | 'LICENSE_CERT'
  | 'ALLCON_E_SYNC'
  | 'UNION_CODE'
  | 'PEER_VOUCH_3';

export type ShiftPatternType =
  | 'DAY_NIGHT_2SHIFT'
  | '3TEAM_2SHIFT'
  | '4TEAM_3SHIFT'
  | 'DAY_FULL'
  | 'FLEX_DISPATCH';

export interface GuildMetaInfo {
  code: PortGuildCode;
  shortName: string;
  fullName: string;
  subRoles: string[];
  memberCount: number;
  activeNowCount: number;
  accentColor: string;
  badgeBgClass: string;
  badgeTextClass: string;
  borderClass: string;
  hotKeywords: string[];
  exclusiveNotice: string;
}

export interface TerminalMetaInfo {
  id: PortTerminalId;
  name: string;
  shortLabel: string;
  zone: Exclude<PortZoneCode, 'ALL_BUSAN_PORT'>;
  berthCount: number;
  gateTurnTimeMinutes: number;
  yardOccupancyPercent: number;
  windSpeedMps: number;
  operationStatus: 'NORMAL' | 'GATE_BUSY' | 'YARD_DELAY' | 'WIND_STANDBY';
  activeVesselSummary: string;
}

export interface WorkerAnonymousIdentity {
  blindTokenHash: string;
  nickname: string;
  verifiedGuild: PortGuildCode;
  primaryZone: Exclude<PortZoneCode, 'ALL_BUSAN_PORT'>;
  primaryTerminal: PortTerminalId;
  verificationMethod: VerificationMethod;
  publicSquareBadge: string;  // 종합 광장 노출 배지 (예: "신항 · 크레인기사")
  guildInternalBadge: string; // 직군 전용 라운지 내부 노출 배지 (예: "14년차 · QC/STS 안벽")
  shiftPattern: ShiftPatternType;
  mannerWaveTemp: number;     // 매너 파도 온도 (기본 36.5°C)
}

export interface PostComment {
  commentId: string;
  authorIdentity: WorkerAnonymousIdentity;
  content: string;
  createdAt: string;
  upvotes: number;
  isVoiceStt?: boolean;
}

export interface CommunityPost {
  postId: string;
  hubScope: HubScope;
  targetGuild?: PortGuildCode; // GUILD_EXCLUSIVE 일 때 소속 직군 라운지, CROSS_CRAFT_BRIDGE 일 때 상대 직군
  allowCrossGuildQna?: boolean; // 직군 전용 라운지 글 중 타 직군 댓글 질문 허용 여부
  fromGuild: PortGuildCode;
  zone: PortZoneCode;
  terminalId?: PortTerminalId;
  category: Exclude<OpenSquareBoardType, 'ALL_SQUARE'> | 'TECH_KNOWHOW' | 'PAY_WELFARE_TALK';
  authorIdentity: WorkerAnonymousIdentity;
  title: string;
  content: string;
  aiEtiquettePolished?: boolean;
  originalRoughText?: string;
  exifStrippedMedia?: {
    label: string;
    strippedTagsCount: number;
    sanitizedHash: string;
  }[];
  upvotes: number;
  guildReactionBreakdown: Partial<Record<PortGuildCode, number>>;
  comments: PostComment[];
  createdAt: string;
  isPinned?: boolean;
  juryStatus?: 'CLEAN' | 'UNDER_JURY_REVIEW' | 'MEDIATED';
}

export interface PortPulseReport {
  pulseId: string;
  terminalId: PortTerminalId;
  berthNo: string;
  vesselName?: string;
  pulseType:
    | 'GATE_TURN_TIME'
    | 'YARD_BLOCK_JAM'
    | 'HIGH_WIND_HOLD'
    | 'EQUIP_MAINTENANCE'
    | 'WORK_RESUMED_CLEAR';
  severity: 'NORMAL' | 'CAUTION' | 'CONGESTED' | 'SUSPENDED';
  estimatedWaitMinutes?: number;
  windSpeedMps?: number;
  inputMethod: '3TAP_CHIP' | 'VOICE_PTT_STT' | 'TEXT';
  shortBriefing: string;
  reporterGuild: PortGuildCode;
  reporterBadge: string;
  confirmationsCount: number;
  isPromotedToBanner: boolean;
  reportedAt: string;
}

export interface VesselScheduleItem {
  vesselName: string;
  voyage: string;
  terminalId: PortTerminalId;
  berth: string;
  eta: string;
  etd: string;
  status: 'WORKING' | 'BERTHING_SOON' | 'DEPARTED' | 'WIND_HOLD';
  gangSummary: string;
}

export interface PortLocalSpot {
  spotId: string;
  name: string;
  category: 'DAWN_RESTAURANT' | 'TRUCK_SHOWER_REST' | 'UREA_FUEL_STATION' | 'SHUTTLE_STOP';
  zone: Exclude<PortZoneCode, 'ALL_BUSAN_PORT'>;
  nearTerminal: PortTerminalId;
  openHours: string;
  trailerParkingAvailable: boolean;
  signatureMenuOrService: string;
  priceRange: string;
  recommendCount: number;
  workerReviewSnippet: string;
}

export interface PortGearMarketItem {
  itemId: string;
  title: string;
  category: 'SAFETY_BOOTS' | 'RADIO_COMM' | 'WINTER_RAIN_GEAR' | 'FLASHLIGHT_TOOL' | 'GROUP_BUY';
  priceKrw: number;
  isFreeShare?: boolean;
  isGroupBuy?: boolean;
  groupBuyParticipants?: string;
  sellerGuild: PortGuildCode;
  sellerBadge: string;
  tradeSpot: string;
  status: 'OPEN' | 'RESERVED' | 'COMPLETED';
  createdAt: string;
}

export interface PortClubMeetup {
  clubId: string;
  title: string;
  hobbyCategory: 'SEA_FISHING' | 'FUTSAL_SOCCER' | 'ARCHERY_HIKING' | 'CARPOOL_COMMUTE' | 'SPARE_DISPATCH';
  targetShiftOff: string;
  meetingPlace: string;
  meetingDateText: string;
  currentMembers: number;
  maxMembers: number;
  hostBadge: string;
  ParticipatingGuilds: PortGuildCode[];
}

export interface CrossCraftJuryCase {
  caseId: string;
  topicTitle: string;
  involvedGuildA: PortGuildCode;
  involvedGuildB: PortGuildCode;
  terminalId: PortTerminalId;
  originalComplaint: string;
  aiConstructiveProposal: string;
  juryVotesByGuild: Record<PortGuildCode, 'AGREE_PROPOSAL' | 'NEED_MORE_CHECK' | 'PENDING'>;
  status: 'VOTING_ACTIVE' | 'CONSENSUS_REACHED';
}

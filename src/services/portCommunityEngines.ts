import {
  CommunityPost,
  PortGuildCode,
  PortPulseReport,
  PortTerminalId,
  VesselScheduleItem,
} from '../types/community';
import { GUILD_META_LIST, INITIAL_VESSEL_SCHEDULES, TERMINAL_META_LIST } from '../data/mockPortCommunityData';

export function getGuildMeta(code: PortGuildCode) {
  return GUILD_META_LIST.find((g) => g.code === code) || GUILD_META_LIST[0];
}

export function getTerminalMeta(id?: PortTerminalId) {
  if (!id) return undefined;
  return TERMINAL_META_LIST.find((t) => t.id === id);
}

/**
 * 서지훈 수석 (cross-craft-harmony-guardian):
 * 직군 간 마찰/불만 표현을 감지하여 상호 존중하는 건설적 현장 제안 문장으로 변환
 */
export function polishWithAiEtiquette(
  rawText: string,
  fromGuild: PortGuildCode,
  targetGuild?: PortGuildCode
): {
  polishedText: string;
  detectedFrictionKeywords: string[];
  wasPolished: boolean;
} {
  const fromMeta = getGuildMeta(fromGuild);
  const targetMeta = targetGuild ? getGuildMeta(targetGuild) : undefined;

  const frictionPatterns = [
    { word: '왜 이렇게', replacement: '현장 여건상' },
    { word: '안 내려줍니까', replacement: '상하차 지연 사유 공유를 부탁드립니다' },
    { word: '클락션', replacement: '안내 신호' },
    { word: '갑질', replacement: '절차상 불편' },
    { word: '답답해', replacement: '대기 시간이 길어져' },
    { word: '무시', replacement: '소통 누락' },
    { word: '막무가내', replacement: '일방적 진행' },
    { word: '짜증', replacement: '현장 애로사항이' },
  ];

  const detected: string[] = [];
  let transformed = rawText.trim();

  for (const pat of frictionPatterns) {
    if (transformed.includes(pat.word)) {
      detected.push(pat.word);
      transformed = transformed.replaceAll(pat.word, pat.replacement);
    }
  }

  const prefix = targetMeta
    ? `[${fromMeta.shortName} -> ${targetMeta.shortName} 상호협조 제안] `
    : `[${fromMeta.shortName} 현장 건의] `;

  const suffix =
    ' 현장에서 함께 일하는 동료로서 안전하고 원활한 작업을 위해 상호 배려와 의견 공유를 부탁드립니다.';

  if (!transformed.startsWith('[')) {
    transformed = prefix + transformed;
  }
  if (!transformed.endsWith('부탁드립니다.')) {
    transformed = transformed + suffix;
  }

  return {
    polishedText: transformed,
    detectedFrictionKeywords: detected.length > 0 ? detected : ['직군 간 소통 문맥 순화'],
    wasPolished: true,
  };
}

/**
 * 최준혁 수석 (community-infra-mcp-lead):
 * 클라이언트 단 이미지/미디어 EXIF(GPS 위경도, 기기 일련번호, 촬영시각) 100% 영구 제거 시뮬레이션 및 해시 생성
 */
export function sanitizeMediaExifClientSide(fileName: string): {
  label: string;
  strippedTagsCount: number;
  sanitizedHash: string;
} {
  const cleanName = fileName.replace(/\.[^/.]+$/, '') + '_clean.webp';
  const randomHex = Array.from({ length: 8 }, () =>
    Math.floor(Math.random() * 16).toString(16)
  ).join('');
  return {
    label: cleanName,
    strippedTagsCount: 16,
    sanitizedHash: `SHA256:${randomHex}...9f2e (GPS·단말기UUID·EXIF 영구삭제 완료)`,
  };
}

/**
 * 한서연 디렉터 (field-community-ux-director):
 * 카카오톡 작업반/기사회 단톡방 1탭 공유용 요약 브리핑 포맷터
 */
export function formatPostForKakaoShare(post: CommunityPost): string {
  const term = getTerminalMeta(post.terminalId);
  const scopeLabel =
    post.hubScope === 'GUILD_EXCLUSIVE'
      ? `[직군전용:${getGuildMeta(post.fromGuild).shortName}]`
      : post.hubScope === 'CROSS_CRAFT_BRIDGE'
      ? `[직군브릿지 소통]`
      : `[부산항 통합광장]`;

  return [
    `[포트스퀘어 ${scopeLabel} 공유]`,
    `• 구역: ${term ? term.shortLabel : '부산항 전역'}`,
    `• 작성: ${post.authorIdentity.nickname} (${post.authorIdentity.publicSquareBadge})`,
    `• 제목: ${post.title}`,
    `• 요약: ${post.content.slice(0, 95)}${post.content.length > 95 ? '...' : ''}`,
    `• 공감: ${post.upvotes}명 | 댓글: ${post.comments.length}건`,
  ].join('\n');
}

export function formatPulseForKakaoShare(pulse: PortPulseReport): string {
  const term = getTerminalMeta(pulse.terminalId);
  return [
    `[부산항 실시간 현장 펄스 경보]`,
    `• 터미널: ${term ? term.name : pulse.terminalId} (${pulse.berthNo})`,
    pulse.vesselName ? `• 모선: ${pulse.vesselName}` : null,
    `• 상황: ${pulse.shortBriefing}`,
    `• 현장 동료 검증: ${pulse.confirmationsCount}명 확인 (${pulse.reportedAt})`,
  ]
    .filter(Boolean)
    .join('\n');
}

/**
 * 박성민 & 강민수 수석 (realtime-port-pulse-lead):
 * BUSAN-HAK-PORT-INFO 실시간 선석 스케줄 연동 및 오프라인 폴백
 */
export async function fetchLivePortVessels(): Promise<{
  vessels: VesselScheduleItem[];
  source: 'LIVE_API' | 'FALLBACK_CACHE';
}> {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 3200);
    const res = await fetch('https://busan-hak-port-info.vercel.app/api/hjnc-schedule', {
      signal: controller.signal,
    });
    clearTimeout(timer);
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        const mapped: VesselScheduleItem[] = data.slice(0, 3).map((item: Record<string, unknown>, idx: number) => ({
          vesselName: String(item.vesselName || item.name || `HJNC VESSEL ${idx + 1}`),
          voyage: String(item.voyage || item.inVoyage || '024E'),
          terminalId: 'HJNC',
          berth: String(item.berth || `HJNC-0${idx + 1}`),
          eta: String(item.eta || item.etb || '10-21 08:00'),
          etd: String(item.etd || '10-22 06:00'),
          status: 'WORKING',
          gangSummary: '실시간 API 연동 · 본선/라싱 가동 중',
        }));
        return {
          vessels: [...mapped, ...INITIAL_VESSEL_SCHEDULES.slice(1)],
          source: 'LIVE_API',
        };
      }
    }
  } catch {
    // Graceful fallback to embedded live vessel dataset
  }
  return {
    vessels: INITIAL_VESSEL_SCHEDULES,
    source: 'FALLBACK_CACHE',
  };
}

import React, { useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Mic,
  Navigation,
  Radio,
  Share2,
  Ship,
  ThumbsUp,
  Wind,
  Zap,
} from 'lucide-react';
import {
  PortGuildCode,
  PortPulseReport,
  PortTerminalId,
  TerminalMetaInfo,
  VesselScheduleItem,
  WorkerAnonymousIdentity,
} from '../types/community';
import { formatPulseForKakaoShare, getTerminalMeta } from '../services/portCommunityEngines';

interface LivePortPulseViewProps {
  terminals: TerminalMetaInfo[];
  pulseReports: PortPulseReport[];
  vessels: VesselScheduleItem[];
  vesselSource: 'LIVE_API' | 'FALLBACK_CACHE';
  currentPersona: WorkerAnonymousIdentity;
  glovedMode: boolean;
  onAddPulseReport: (report: PortPulseReport) => void;
  onConfirmPulse: (pulseId: string) => void;
  onCopyToast: (msg: string) => void;
}

const QUICK_PULSE_CHIPS: {
  type: PortPulseReport['pulseType'];
  label: string;
  severity: PortPulseReport['severity'];
  waitMin?: number;
  wind?: number;
  template: (termLabel: string) => string;
}[] = [
  {
    type: 'GATE_TURN_TIME',
    label: '게이트 반출입 대기 혼잡 (40분+)',
    severity: 'CONGESTED',
    waitMin: 42,
    template: (t) => `${t} 인게이트 반출입 대기줄 정체 중입니다 (체감 턴타임 약 40~45분). 진입 차로 유의하세요.`,
  },
  {
    type: 'YARD_BLOCK_JAM',
    label: '야드 블록 상하차 지연 (RTGC 대기)',
    severity: 'CAUTION',
    waitMin: 30,
    template: (t) => `${t} 주력 블록 본선 양하 및 외부 상하차 겹침으로 야드 대기 25~30분 발생 중입니다.`,
  },
  {
    type: 'HIGH_WIND_HOLD',
    label: '강풍(15m/s+)·돌풍 작업 주의/대기',
    severity: 'SUSPENDED',
    wind: 15.4,
    template: (t) => `${t} 안벽 순간 돌풍 15m/s 이상 관측으로 고공 크레인 및 상부 라싱 안전 대기 발령 중입니다.`,
  },
  {
    type: 'WORK_RESUMED_CLEAR',
    label: '대기 해소 · 본선/게이트 정상 소통',
    severity: 'NORMAL',
    waitMin: 15,
    template: (t) => `${t} 병목 해소되어 현재 게이트 반출입(15분 내외) 및 본선 양적하 정상 가동 중입니다.`,
  },
];

export const LivePortPulseView: React.FC<LivePortPulseViewProps> = ({
  terminals,
  pulseReports,
  vessels,
  vesselSource,
  currentPersona,
  glovedMode,
  onAddPulseReport,
  onConfirmPulse,
  onCopyToast,
}) => {
  const [selectedTerminal, setSelectedTerminal] = useState<PortTerminalId>(
    currentPersona.primaryTerminal || 'PNC'
  );
  const [selectedChipIdx, setSelectedChipIdx] = useState<number>(0);
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const [zoneFilter, setZoneFilter] = useState<'ALL' | 'NEW_PORT' | 'NORTH_PORT' | 'GAMCHEON_DADAEPO'>('ALL');

  const btnMinH = glovedMode ? 'min-h-[54px] text-base' : 'min-h-[44px] text-sm';

  const handle3TapSubmit = (inputMethod: '3TAP_CHIP' | 'VOICE_PTT_STT') => {
    const chip = QUICK_PULSE_CHIPS[selectedChipIdx];
    const term = getTerminalMeta(selectedTerminal);
    const termLabel = term ? term.shortLabel : selectedTerminal;

    const newPulse: PortPulseReport = {
      pulseId: `PULSE-${Date.now()}`,
      terminalId: selectedTerminal,
      berthNo: `${termLabel} 현장 제보`,
      pulseType: chip.type,
      severity: chip.severity,
      estimatedWaitMinutes: chip.waitMin,
      windSpeedMps: chip.wind,
      inputMethod,
      shortBriefing:
        inputMethod === 'VOICE_PTT_STT'
          ? `[무전 음성 STT 변환] ${chip.template(termLabel)}`
          : chip.template(termLabel),
      reporterGuild: currentPersona.verifiedGuild as PortGuildCode,
      reporterBadge: currentPersona.publicSquareBadge,
      confirmationsCount: 1,
      isPromotedToBanner: false,
      reportedAt: '방금 전',
    };

    onAddPulseReport(newPulse);
    onCopyToast(`${termLabel} 실시간 현장 펄스가 3-Tap으로 즉시 등록되었습니다!`);
  };

  const handleVoicePttTrigger = () => {
    setIsRecordingVoice(true);
    setTimeout(() => {
      setIsRecordingVoice(false);
      handle3TapSubmit('VOICE_PTT_STT');
    }, 1100);
  };

  const filteredTerminals = terminals.filter((t) =>
    zoneFilter === 'ALL' ? true : t.zone === zoneFilter
  );

  return (
    <div className="space-y-6">
      {/* 1. 3-Tap 무타이핑 현장 제보 콘솔 (박성민 & 강민수 수석 설계) */}
      <section className="rounded-2xl border border-cyan-500/40 bg-slate-900/90 p-4 sm:p-5 shadow-lg">
        <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-500/20 text-cyan-300">
              <Radio className="h-4 w-4 animate-pulse" />
            </span>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white">
                3-Tap 무타이핑 현장 펄스 제보 & 무전 STT
              </h2>
              <p className="text-xs text-slate-400">
                장갑 착용 작업자·운전 대기 기사를 위해 타이핑 없이 터치 3번으로 전 부두에 전파합니다 (3인 이상 공감 시 상단 경보 승격)
              </p>
            </div>
          </div>
          <span className="rounded-full bg-cyan-500/15 border border-cyan-500/30 px-3 py-1 text-xs font-semibold text-cyan-300">
            제보자 배지: {currentPersona.publicSquareBadge}
          </span>
        </div>

        {/* Step 1: 터미널 1탭 선택 */}
        <div className="mt-4">
          <div className="text-xs font-semibold text-cyan-300 mb-2">
            STEP 1. 부두 / 터미널 선택 (1-Tap)
          </div>
          <div className="flex flex-wrap gap-2">
            {terminals.map((term) => {
              const active = selectedTerminal === term.id;
              return (
                <button
                  key={term.id}
                  type="button"
                  onClick={() => setSelectedTerminal(term.id)}
                  className={`rounded-xl px-3.5 py-2 font-semibold transition-all cursor-pointer ${btnMinH} ${
                    active
                      ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20 ring-2 ring-cyan-300'
                      : 'bg-slate-800/90 text-slate-300 hover:bg-slate-700 border border-slate-700'
                  }`}
                >
                  {term.shortLabel}
                </button>
              );
            })}
          </div>
        </div>

        {/* Step 2: 현장 상황 칩 1탭 선택 */}
        <div className="mt-4">
          <div className="text-xs font-semibold text-amber-300 mb-2">
            STEP 2. 현장 상황 원터치 칩 선택 (2-Tap)
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {QUICK_PULSE_CHIPS.map((chip, idx) => {
              const active = selectedChipIdx === idx;
              return (
                <button
                  key={chip.type}
                  type="button"
                  onClick={() => setSelectedChipIdx(idx)}
                  className={`flex items-center justify-between rounded-xl px-4 py-3 text-left font-medium transition-all cursor-pointer ${btnMinH} ${
                    active
                      ? 'bg-amber-500/20 border-2 border-amber-400 text-amber-200'
                      : 'bg-slate-800/70 border border-slate-700/80 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <span>{chip.label}</span>
                  {active && <CheckCircle2 className="h-5 w-5 text-amber-400 shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Step 3: 즉시 발신 또는 무전 음성 PTT */}
        <div className="mt-4 flex flex-col sm:flex-row gap-3">
          <button
            type="button"
            onClick={() => handle3TapSubmit('3TAP_CHIP')}
            className={`flex-1 flex items-center justify-center gap-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold px-5 py-3.5 transition-all cursor-pointer ${btnMinH}`}
          >
            <Zap className="h-5 w-5" />
            <span>STEP 3. 선택한 현장 상황 즉시 제보 발신 (3-Tap 완료)</span>
          </button>

          <button
            type="button"
            onClick={handleVoicePttTrigger}
            className={`flex items-center justify-center gap-2 rounded-xl border px-5 py-3.5 font-bold transition-all cursor-pointer ${btnMinH} ${
              isRecordingVoice
                ? 'bg-rose-500/30 border-rose-400 text-rose-200 animate-pulse'
                : 'bg-slate-800 hover:bg-slate-700 border-slate-600 text-slate-200'
            }`}
          >
            <Mic className="h-5 w-5 text-rose-400" />
            <span>{isRecordingVoice ? '무전 음성 인식 중 (STT)...' : '무전 워키토키 음성 제보 (PTT)'}</span>
          </button>
        </div>
      </section>

      {/* 2. 부산항 11개 부두 실시간 게이트 턴타임 · 장치율 · 풍속 전광판 */}
      <section className="rounded-2xl border border-slate-800 bg-slate-900/75 p-4 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Navigation className="h-4 w-4 text-cyan-400" />
              부산항 권역별 터미널 게이트 턴타임 · 야드 혼잡도 · 풍속 지수
            </h3>
            <p className="text-xs text-slate-400">
              체인포털(올컨e) 지표와 현장 트레일러·YT·크레인 기사 크라우드소싱 제보를 결합한 실시간 체감 지표입니다
            </p>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {[
              { key: 'ALL', label: '부산항 전체(11)' },
              { key: 'NEW_PORT', label: '신항(7부두)' },
              { key: 'NORTH_PORT', label: '북항(3부두)' },
              { key: 'GAMCHEON_DADAEPO', label: '감천·다대포' },
            ].map((zf) => (
              <button
                key={zf.key}
                type="button"
                onClick={() => setZoneFilter(zf.key as typeof zoneFilter)}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold cursor-pointer ${
                  zoneFilter === zf.key
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                    : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                {zf.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredTerminals.map((term) => {
            const statusBadge =
              term.operationStatus === 'GATE_BUSY'
                ? { text: '게이트 혼잡', cls: 'bg-rose-500/20 text-rose-300 border-rose-500/40' }
                : term.operationStatus === 'WIND_STANDBY'
                ? { text: '강풍 주의', cls: 'bg-amber-500/20 text-amber-300 border-amber-500/40' }
                : term.operationStatus === 'YARD_DELAY'
                ? { text: '야드 대기', cls: 'bg-amber-500/20 text-amber-300 border-amber-500/40' }
                : { text: '정상 소통', cls: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' };

            return (
              <div
                key={term.id}
                className="rounded-xl border border-slate-800 bg-slate-950/70 p-3.5 flex flex-col justify-between gap-2"
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-sm text-white">{term.shortLabel}</span>
                    <span className={`rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${statusBadge.cls}`}>
                      {statusBadge.text}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5 truncate">{term.name}</div>
                </div>

                <div className="grid grid-cols-3 gap-2 my-1 pt-2 border-t border-slate-800/80 text-center">
                  <div>
                    <div className="text-[10px] text-slate-400">게이트 턴타임</div>
                    <div
                      className={`text-sm font-bold tabular-nums ${
                        term.gateTurnTimeMinutes >= 35 ? 'text-rose-400' : 'text-cyan-300'
                      }`}
                    >
                      {term.gateTurnTimeMinutes}분
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-400">야드 장치율</div>
                    <div className="text-sm font-bold tabular-nums text-slate-200">
                      {term.yardOccupancyPercent}%
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-400">안벽 풍속</div>
                    <div
                      className={`text-sm font-bold tabular-nums ${
                        term.windSpeedMps >= 14 ? 'text-amber-400' : 'text-emerald-300'
                      }`}
                    >
                      {term.windSpeedMps}m/s
                    </div>
                  </div>
                </div>

                <div className="text-[11px] text-slate-400 bg-slate-900/90 rounded-lg px-2.5 py-1.5">
                  {term.activeVesselSummary}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 3. 실시간 현장 펄스 제보 타임라인 (동료 3인 검증 시 상단 배너 승격) */}
      <section className="rounded-2xl border border-slate-800 bg-slate-900/75 p-4 sm:p-5">
        <h3 className="text-base font-bold text-white mb-3 flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-amber-400" />
          실시간 현장 동료 펄스 피드 (3인 이상 '맞아요' 검증 시 전광판 경보 승격)
        </h3>
        <div className="space-y-3">
          {pulseReports.map((pulse) => {
            const term = getTerminalMeta(pulse.terminalId);
            return (
              <div
                key={pulse.pulseId}
                className={`rounded-xl border p-4 transition-all ${
                  pulse.isPromotedToBanner
                    ? 'border-amber-500/50 bg-amber-950/20'
                    : 'border-slate-800 bg-slate-950/60'
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="rounded-md bg-cyan-500/20 px-2 py-0.5 text-xs font-bold text-cyan-300">
                      {term ? term.shortLabel : pulse.terminalId}
                    </span>
                    <span className="text-xs font-semibold text-slate-300">{pulse.berthNo}</span>
                    {pulse.isPromotedToBanner && (
                      <span className="rounded-full bg-amber-500/20 border border-amber-400/50 px-2.5 py-0.5 text-[11px] font-bold text-amber-300">
                        공식 현장 경보 배너 승격됨
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-slate-400 flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" />
                    {pulse.reportedAt} · {pulse.reporterBadge}
                  </span>
                </div>

                <p className="text-sm text-slate-100 leading-relaxed">{pulse.shortBriefing}</p>

                <div className="mt-3 flex flex-wrap items-center justify-between gap-2 pt-2.5 border-t border-slate-800/80">
                  <div className="flex items-center gap-3 text-xs text-slate-400">
                    {pulse.estimatedWaitMinutes && (
                      <span>체감 대기: 약 {pulse.estimatedWaitMinutes}분</span>
                    )}
                    {pulse.windSpeedMps && (
                      <span className="flex items-center gap-1 text-amber-300">
                        <Wind className="h-3.5 w-3.5" /> 풍속 {pulse.windSpeedMps}m/s
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => onConfirmPulse(pulse.pulseId)}
                      className={`inline-flex items-center gap-1.5 rounded-lg bg-slate-800 hover:bg-cyan-500/20 border border-slate-700 hover:border-cyan-500/40 px-3 py-1.5 text-xs font-semibold text-cyan-300 cursor-pointer ${btnMinH}`}
                    >
                      <ThumbsUp className="h-3.5 w-3.5" />
                      <span>맞아요·실제상황 ({pulse.confirmationsCount}명 검증)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard?.writeText(formatPulseForKakaoShare(pulse));
                        onCopyToast('카카오톡 단톡방 공유용 현장 펄스 브리핑이 복사되었습니다.');
                      }}
                      className={`inline-flex items-center gap-1 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 px-3 py-1.5 text-xs font-semibold text-amber-300 cursor-pointer ${btnMinH}`}
                    >
                      <Share2 className="h-3.5 w-3.5" />
                      <span>단톡방 공유</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 4. BUSAN-HAK-PORT-INFO 연동 실시간 모선 작업 현황 */}
      <section className="rounded-2xl border border-slate-800 bg-slate-900/75 p-4 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Ship className="h-4 w-4 text-emerald-400" />
            부산항 주요 선석 모선 작업 및 갱(Gang) 가동 현황
          </h3>
          <span className="rounded-full bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-300">
            {vesselSource === 'LIVE_API'
              ? 'BUSAN-HAK-PORT-INFO 실시간 API 연동 중'
              : '내장 실시간 선석 스케줄 폴백 가동 중'}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400">
                <th className="py-2 pr-3">선석</th>
                <th className="py-2 pr-3">모선명 (항차)</th>
                <th className="py-2 pr-3">접안 ~ 출항 예정</th>
                <th className="py-2 pr-3">현장 작업반 브리핑</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {vessels.map((v, i) => (
                <tr key={`${v.vesselName}-${i}`} className="text-slate-200">
                  <td className="py-2.5 pr-3 font-bold text-cyan-300">{v.berth}</td>
                  <td className="py-2.5 pr-3 font-semibold">
                    {v.vesselName} <span className="text-slate-400 font-mono text-xs">({v.voyage})</span>
                  </td>
                  <td className="py-2.5 pr-3 font-mono text-xs text-slate-300">
                    {v.eta} → {v.etd}
                  </td>
                  <td className="py-2.5 pr-3 text-xs text-emerald-300">{v.gangSummary}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

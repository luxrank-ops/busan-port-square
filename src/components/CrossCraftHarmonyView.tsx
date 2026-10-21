import React, { useState } from 'react';
import {
  CheckCircle2,
  FileCheck,
  Handshake,
  Lock,
  Scale,
  Send,
  ShieldCheck,
  Sparkles,
  Users,
} from 'lucide-react';
import {
  CommunityPost,
  CrossCraftJuryCase,
  PortGuildCode,
  WorkerAnonymousIdentity,
} from '../types/community';
import { GUILD_META_LIST } from '../data/mockPortCommunityData';
import {
  getGuildMeta,
  polishWithAiEtiquette,
  sanitizeMediaExifClientSide,
} from '../services/portCommunityEngines';

interface CrossCraftHarmonyViewProps {
  currentPersona: WorkerAnonymousIdentity;
  juryCases: CrossCraftJuryCase[];
  glovedMode: boolean;
  onVoteJury: (
    caseId: string,
    guild: PortGuildCode,
    vote: 'AGREE_PROPOSAL' | 'NEED_MORE_CHECK'
  ) => void;
  onCreateBridgePost: (post: CommunityPost) => void;
  onCopyToast: (msg: string) => void;
}

export const CrossCraftHarmonyView: React.FC<CrossCraftHarmonyViewProps> = ({
  currentPersona,
  juryCases,
  glovedMode,
  onVoteJury,
  onCreateBridgePost,
  onCopyToast,
}) => {
  const [targetGuild, setTargetGuild] = useState<PortGuildCode>('G1_CRANE_EQUIP');
  const [bridgeTitle, setBridgeTitle] = useState('');
  const [rawContent, setRawContent] = useState(
    '야드 3블록 상하차할 때 왜 이렇게 안 내려줍니까 줄이 다 밀려서 답답해 죽겠습니다 클락션만 울리지 말고 순번 표시 좀 해주세요'
  );
  const [polishedPreview, setPolishedPreview] = useState<string | null>(null);
  const [detectedKeywords, setDetectedKeywords] = useState<string[]>([]);
  const [exifSampleName, setExifSampleName] = useState('신항_안벽_안전위험_제보사진_IMG4092.jpg');
  const [sanitizedResult, setSanitizedResult] = useState<{
    label: string;
    strippedTagsCount: number;
    sanitizedHash: string;
  } | null>(() => sanitizeMediaExifClientSide('신항_안벽_안전위험_제보사진_IMG4092.jpg'));

  const btnMinH = glovedMode ? 'min-h-[52px] text-base' : 'min-h-[42px] text-sm';

  const handleRunAiPolish = () => {
    const res = polishWithAiEtiquette(rawContent, currentPersona.verifiedGuild, targetGuild);
    setPolishedPreview(res.polishedText);
    setDetectedKeywords(res.detectedFrictionKeywords);
  };

  const handleSubmitBridgePost = (e: React.FormEvent) => {
    e.preventDefault();
    const finalBody =
      polishedPreview ||
      polishWithAiEtiquette(rawContent, currentPersona.verifiedGuild, targetGuild).polishedText;

    const targetMeta = getGuildMeta(targetGuild);
    const fromMeta = getGuildMeta(currentPersona.verifiedGuild);

    const newPost: CommunityPost = {
      postId: `POST-BRIDGE-${Date.now()}`,
      hubScope: 'CROSS_CRAFT_BRIDGE',
      targetGuild,
      fromGuild: currentPersona.verifiedGuild,
      zone: currentPersona.primaryZone,
      terminalId: currentPersona.primaryTerminal,
      category: 'CROSS_CRAFT_ASK',
      authorIdentity: currentPersona,
      title:
        bridgeTitle.trim() ||
        `[역지사지 브릿지] ${fromMeta.shortName} -> ${targetMeta.shortName} 현장 상호협조 제안`,
      content: finalBody,
      aiEtiquettePolished: true,
      originalRoughText: rawContent,
      exifStrippedMedia: sanitizedResult ? [sanitizedResult] : undefined,
      upvotes: 1,
      guildReactionBreakdown: {
        [currentPersona.verifiedGuild]: 1,
      },
      comments: [],
      createdAt: '방금 전',
      juryStatus: 'CLEAN',
    };

    onCreateBridgePost(newPost);
    setBridgeTitle('');
    onCopyToast('역지사지 직군 브릿지 제안글이 종합 광장에 게시되었습니다!');
  };

  return (
    <div className="space-y-6">
      {/* 1. 영지식(Zero-Knowledge) 익명 보장 및 멀티 배지 증명 패널 */}
      <section className="rounded-2xl border border-emerald-500/40 bg-slate-900/90 p-4 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-300">
              <ShieldCheck className="h-5 w-5" />
            </span>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white">
                영지식(Zero-Knowledge) 익명 신원 보호 & EXIF 세탁 엔진
              </h2>
              <p className="text-xs text-slate-400">
                항만출입증·자격증·올컨e 인증 DB와 커뮤니티 작성자 DB를 물리적·암호학적으로 분리하여 운영진조차 작성자를 역추적할 수 없습니다
              </p>
            </div>
          </div>
          <span className="rounded-full bg-emerald-500/15 border border-emerald-500/40 px-3 py-1 text-xs font-bold text-emerald-300">
            매너 파도 온도 {currentPersona.mannerWaveTemp.toFixed(1)}°C
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4">
          <div className="rounded-xl border border-slate-800 bg-slate-950/80 p-3.5">
            <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
              <Lock className="h-3.5 w-3.5 text-emerald-400" /> 단방향 블라인드 토큰 (역추적 불가)
            </div>
            <div className="mt-1 font-mono text-xs text-emerald-300 font-semibold break-all">
              {currentPersona.blindTokenHash}
            </div>
            <div className="mt-1 text-[11px] text-slate-400">
              인증 방식: {currentPersona.verificationMethod} (개인정보 즉시 파기)
            </div>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-950/80 p-3.5">
            <div className="text-[11px] text-slate-400">공간 맥락별 자동 전환 멀티 배지</div>
            <div className="mt-1.5 flex flex-col gap-1 text-xs">
              <div>
                <span className="text-slate-400">종합 광장 표기: </span>
                <span className="font-bold text-cyan-300">[{currentPersona.publicSquareBadge}]</span>
              </div>
              <div>
                <span className="text-slate-400">직군 라운지 표기: </span>
                <span className="font-bold text-amber-300">[{currentPersona.guildInternalBadge}]</span>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-950/80 p-3.5">
            <div className="text-[11px] text-slate-400 flex items-center justify-between">
              <span>첨부 사진 EXIF 메타데이터 자동 세탁</span>
              <FileCheck className="h-3.5 w-3.5 text-cyan-400" />
            </div>
            <div className="mt-1.5 flex items-center gap-2">
              <input
                type="text"
                value={exifSampleName}
                onChange={(e) => setExifSampleName(e.target.value)}
                className="w-full rounded-lg bg-slate-900 border border-slate-700 px-2.5 py-1 text-xs text-slate-200"
              />
              <button
                type="button"
                onClick={() => {
                  const res = sanitizeMediaExifClientSide(exifSampleName);
                  setSanitizedResult(res);
                  onCopyToast(`GPS 좌표·단말기 시리얼 등 ${res.strippedTagsCount}개 EXIF 태그가 제거되었습니다.`);
                }}
                className="shrink-0 rounded-lg bg-cyan-500/20 border border-cyan-500/40 px-2.5 py-1 text-xs font-semibold text-cyan-300 cursor-pointer"
              >
                세탁 검증
              </button>
            </div>
            {sanitizedResult && (
              <div className="mt-1 text-[10px] font-mono text-emerald-300 truncate">
                {sanitizedResult.sanitizedHash}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 2. 직군 간 역지사지 브릿지 & AI 에티켓 문장 순화기 */}
      <section className="rounded-2xl border border-purple-500/40 bg-slate-900/90 p-4 sm:p-5">
        <div className="flex items-center gap-2 mb-3">
          <Handshake className="h-5 w-5 text-purple-400" />
          <div>
            <h3 className="text-base font-bold text-white">
              역지사지 직군 브릿지 & AI 에티켓 리라이터 (Cross-Craft Harmony Bridge)
            </h3>
            <p className="text-xs text-slate-400">
              현장에서 답답했던 타 직군과의 고충을 적으시면 AI 에티켓 도우미가 감정싸움 없는 건설적 협조 제안문으로 다듬어 해당 직군에 전달합니다
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmitBridgePost} className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                발신 직군 (현재 선택된 페르소나)
              </label>
              <div className="rounded-xl bg-slate-950 border border-slate-800 px-3.5 py-2.5 text-xs font-bold text-cyan-300">
                {getGuildMeta(currentPersona.verifiedGuild).fullName}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                소통·협조를 요청할 대상 직군 선택
              </label>
              <select
                value={targetGuild}
                onChange={(e) => setTargetGuild(e.target.value as PortGuildCode)}
                className="w-full rounded-xl bg-slate-950 border border-slate-700 px-3.5 py-2.5 text-xs font-bold text-amber-300"
              >
                {GUILD_META_LIST.map((g) => (
                  <option key={g.code} value={g.code} className="bg-slate-900 text-slate-100">
                    {g.shortName} ({g.fullName})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              건의 제목 (선택 입력)
            </label>
            <input
              type="text"
              value={bridgeTitle}
              onChange={(e) => setBridgeTitle(e.target.value)}
              placeholder="예: 우천 시 야드 정지선 및 샤시 정렬 기준점 공유 제안"
              className="w-full rounded-xl bg-slate-950 border border-slate-700 px-3.5 py-2 text-sm text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              현장 거친 원문 입력 (감정 표현이 섞여 있어도 괜찮습니다)
            </label>
            <textarea
              rows={2}
              value={rawContent}
              onChange={(e) => setRawContent(e.target.value)}
              className="w-full rounded-xl bg-slate-950 border border-slate-700 p-3 text-sm text-slate-200"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleRunAiPolish}
              className={`inline-flex items-center gap-2 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 border border-purple-400/50 px-4 py-2.5 font-bold text-purple-200 cursor-pointer ${btnMinH}`}
            >
              <Sparkles className="h-4 w-4 text-purple-300" />
              <span>AI 에티켓 문장 순화 변환 미리보기</span>
            </button>

            <button
              type="submit"
              className={`inline-flex items-center gap-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 px-5 py-2.5 font-bold text-slate-950 cursor-pointer ${btnMinH}`}
            >
              <Send className="h-4 w-4" />
              <span>역지사지 브릿지 안건으로 종합 광장에 게시</span>
            </button>
          </div>

          {polishedPreview && (
            <div className="rounded-xl border border-purple-500/40 bg-purple-950/20 p-3.5 space-y-1.5">
              <div className="flex items-center justify-between text-xs font-bold text-purple-300">
                <span>AI 에티켓 리라이터 변환 결과</span>
                <span>순화 키워드: {detectedKeywords.join(', ')}</span>
              </div>
              <p className="text-sm text-slate-100 leading-relaxed">{polishedPreview}</p>
            </div>
          )}
        </form>
      </section>

      {/* 3. 8대 직군 동수 교차 배심원단 (Cross-Guild Jury) 자정 시스템 */}
      <section className="rounded-2xl border border-slate-800 bg-slate-900/75 p-4 sm:p-5">
        <div className="flex items-center gap-2 mb-3">
          <Scale className="h-5 w-5 text-amber-400" />
          <div>
            <h3 className="text-base font-bold text-white">
              8대 직군 동수 교차 배심원단 (Cross-Guild Jury) 중재 안건
            </h3>
            <p className="text-xs text-slate-400">
              단일 직군의 편파 여론몰이를 방지하기 위해 8개 직군에서 각 1표씩 동수로 참여하여 현장 개선안을 의결합니다
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {juryCases.map((jCase) => {
            const guildA = getGuildMeta(jCase.involvedGuildA);
            const guildB = getGuildMeta(jCase.involvedGuildB);
            const agreeCount = Object.values(jCase.juryVotesByGuild).filter(
              (v) => v === 'AGREE_PROPOSAL'
            ).length;

            return (
              <div
                key={jCase.caseId}
                className="rounded-xl border border-slate-800 bg-slate-950/80 p-4 space-y-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="rounded-md bg-amber-500/20 px-2.5 py-0.5 text-xs font-bold text-amber-300">
                      {guildA.shortName} ↔ {guildB.shortName}
                    </span>
                    <h4 className="font-bold text-sm sm:text-base text-white">
                      {jCase.topicTitle}
                    </h4>
                  </div>
                  <span className="rounded-full bg-emerald-500/20 border border-emerald-500/40 px-3 py-0.5 text-xs font-bold text-emerald-300">
                    8대 직군 중 {agreeCount}/8 직군 찬성 합의
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div className="rounded-lg bg-rose-950/25 border border-rose-500/30 p-3">
                    <div className="font-bold text-rose-300 mb-1">기존 현장 마찰 원문</div>
                    <p className="text-slate-300">{jCase.originalComplaint}</p>
                  </div>
                  <div className="rounded-lg bg-emerald-950/25 border border-emerald-500/30 p-3">
                    <div className="font-bold text-emerald-300 mb-1">AI & 교차 배심원 중재 합의안</div>
                    <p className="text-slate-100">{jCase.aiConstructiveProposal}</p>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap gap-1.5">
                    {GUILD_META_LIST.map((g) => {
                      const vote = jCase.juryVotesByGuild[g.code];
                      return (
                        <span
                          key={g.code}
                          className={`rounded-md px-2 py-0.5 text-[11px] font-semibold border ${
                            vote === 'AGREE_PROPOSAL'
                              ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
                              : 'bg-slate-800 border-slate-700 text-slate-400'
                          }`}
                        >
                          {g.shortName}: {vote === 'AGREE_PROPOSAL' ? '찬성' : '검토중'}
                        </span>
                      );
                    })}
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      onVoteJury(jCase.caseId, currentPersona.verifiedGuild, 'AGREE_PROPOSAL');
                      onCopyToast(
                        `${getGuildMeta(currentPersona.verifiedGuild).shortName} 대표 배심원 찬성표가 반영되었습니다.`
                      );
                    }}
                    className={`inline-flex items-center gap-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 px-3 py-1.5 text-xs font-bold text-emerald-300 cursor-pointer ${btnMinH}`}
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    <span>내 직군({getGuildMeta(currentPersona.verifiedGuild).shortName}) 배심원 찬성 투표</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};

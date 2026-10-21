import React, { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  Anchor,
  Building2,
  CheckCircle2,
  Compass,
  Eye,
  Flame,
  Hand,
  Handshake,
  Layers,
  Lock,
  MessageSquare,
  Mic,
  Moon,
  PlusCircle,
  Radio,
  Send,
  Share2,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Sun,
  ThumbsUp,
  Unlock,
  Users,
  Wifi,
} from 'lucide-react';
import {
  CommunityPost,
  CrossCraftJuryCase,
  PortClubMeetup,
  PortGearMarketItem,
  PortGuildCode,
  PortLocalSpot,
  PortPulseReport,
  PortZoneCode,
  VesselScheduleItem,
} from './types/community';
import {
  GUILD_META_LIST,
  INITIAL_CLUB_MEETUPS,
  INITIAL_COMMUNITY_POSTS,
  INITIAL_GEAR_MARKET,
  INITIAL_JURY_CASES,
  INITIAL_LOCAL_SPOTS,
  INITIAL_PULSE_REPORTS,
  INITIAL_VESSEL_SCHEDULES,
  SIMULATOR_PERSONAS,
  TERMINAL_META_LIST,
} from './data/mockPortCommunityData';
import {
  fetchLivePortVessels,
  formatPostForKakaoShare,
  getGuildMeta,
  getTerminalMeta,
  sanitizeMediaExifClientSide,
} from './services/portCommunityEngines';
import { LivePortPulseView } from './components/LivePortPulseView';
import { CrossCraftHarmonyView } from './components/CrossCraftHarmonyView';
import { PortLifeWelfareView } from './components/PortLifeWelfareView';

type MainTabKey =
  | 'OPEN_SQUARE'
  | 'GUILD_LOUNGES'
  | 'LIVE_PORT_PULSE'
  | 'CROSS_CRAFT_HARMONY'
  | 'PORT_LIFE_WELFARE';

const STORAGE_KEYS = {
  POSTS: 'port_square_posts_v1',
  PULSES: 'port_square_pulses_v1',
  GEAR: 'port_square_gear_v1',
  CLUBS: 'port_square_clubs_v1',
  JURY: 'port_square_jury_v1',
};

export function App() {
  // 1. 현재 시뮬레이션 중인 직군 페르소나 (8대 직군 1-Tap 전환)
  const [myGuild, setMyGuild] = useState<PortGuildCode>('G1_CRANE_EQUIP');
  const currentPersona = SIMULATOR_PERSONAS[myGuild];

  // 2. 메인 탭 (종합 광장 / 8대 직군 전용 라운지 / 실시간 펄스 / 직군 화합 브릿지 / 항만 라이프)
  const [activeTab, setActiveTab] = useState<MainTabKey>('OPEN_SQUARE');

  // 3. 직군 전용 라운지 탭에서 현재 열람 중인 라운지 직군
  const [selectedLoungeGuild, setSelectedLoungeGuild] = useState<PortGuildCode>('G1_CRANE_EQUIP');

  // 4. 현장 적응형 UX 상태 (OLED 다크 vs 주간 고대비, 48px 장갑 모드)
  const [highContrastDayMode, setHighContrastDayMode] = useState(false);
  const [glovedMode, setGlovedMode] = useState(true);

  // 5. 종합 광장 로컬 권역 및 카테고리 필터
  const [zoneFilter, setZoneFilter] = useState<PortZoneCode>('ALL_BUSAN_PORT');
  const [squareCategoryFilter, setSquareCategoryFilter] = useState<
    'ALL' | 'FREE_TALK' | 'CROSS_CRAFT_ASK' | 'SAFETY_NEAR_MISS'
  >('ALL');

  // 6. 영속 상태 (오프라인 복원력 localStorage 연동)
  const [posts, setPosts] = useState<CommunityPost[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.POSTS);
      return saved ? JSON.parse(saved) : INITIAL_COMMUNITY_POSTS;
    } catch {
      return INITIAL_COMMUNITY_POSTS;
    }
  });

  const [pulseReports, setPulseReports] = useState<PortPulseReport[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PULSES);
      return saved ? JSON.parse(saved) : INITIAL_PULSE_REPORTS;
    } catch {
      return INITIAL_PULSE_REPORTS;
    }
  });

  const [gearItems, setGearItems] = useState<PortGearMarketItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.GEAR);
      return saved ? JSON.parse(saved) : INITIAL_GEAR_MARKET;
    } catch {
      return INITIAL_GEAR_MARKET;
    }
  });

  const [clubMeetups, setClubMeetups] = useState<PortClubMeetup[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CLUBS);
      return saved ? JSON.parse(saved) : INITIAL_CLUB_MEETUPS;
    } catch {
      return INITIAL_CLUB_MEETUPS;
    }
  });

  const [juryCases, setJuryCases] = useState<CrossCraftJuryCase[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.JURY);
      return saved ? JSON.parse(saved) : INITIAL_JURY_CASES;
    } catch {
      return INITIAL_JURY_CASES;
    }
  });

  const [localSpots] = useState<PortLocalSpot[]>(INITIAL_LOCAL_SPOTS);
  const [vessels, setVessels] = useState<VesselScheduleItem[]>(INITIAL_VESSEL_SCHEDULES);
  const [vesselSource, setVesselSource] = useState<'LIVE_API' | 'FALLBACK_CACHE'>('FALLBACK_CACHE');

  // 7. 새 글 작성 모달/폼 상태
  const [showComposer, setShowComposer] = useState(false);
  const [newPostTitle, setNewPostTitle] = useState('');
  const [newPostContent, setNewPostContent] = useState('');
  const [newPostAllowCrossQna, setNewPostAllowCrossQna] = useState(true);
  const [attachCleanPhoto, setAttachCleanPhoto] = useState(true);

  // 8. 댓글 입력 상태
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});

  // 9. 토스트 알림 메시지
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => {
      setToastMsg((prev) => (prev === msg ? null : prev));
    }, 3200);
  };

  // 내 직군 시뮬레이터 변경 시 직군 라운지도 자동 동기화
  const handleSwitchPersonaGuild = (guild: PortGuildCode) => {
    setMyGuild(guild);
    setSelectedLoungeGuild(guild);
    const meta = getGuildMeta(guild);
    triggerToast(
      `페르소나 전환: [${meta.shortName}] — 종합 광장 배지(${SIMULATOR_PERSONAS[guild].publicSquareBadge}) / 직군 라운지 배지(${SIMULATOR_PERSONAS[guild].guildInternalBadge})`
    );
  };

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.POSTS, JSON.stringify(posts));
    } catch {
      // ignore storage quota errors
    }
  }, [posts]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.PULSES, JSON.stringify(pulseReports));
    } catch {
      // ignore
    }
  }, [pulseReports]);

  useEffect(() => {
    fetchLivePortVessels().then((res) => {
      setVessels(res.vessels);
      setVesselSource(res.source);
    });
  }, []);

  // 종합 광장 게시글 필터링 (OPEN_SQUARE + CROSS_CRAFT_BRIDGE)
  const openSquarePosts = useMemo(() => {
    return posts.filter((p) => {
      const isSquare = p.hubScope === 'OPEN_SQUARE' || p.hubScope === 'CROSS_CRAFT_BRIDGE';
      if (!isSquare) return false;
      if (zoneFilter !== 'ALL_BUSAN_PORT' && p.zone !== 'ALL_BUSAN_PORT' && p.zone !== zoneFilter) {
        return false;
      }
      if (squareCategoryFilter !== 'ALL' && p.category !== squareCategoryFilter) {
        return false;
      }
      return true;
    });
  }, [posts, zoneFilter, squareCategoryFilter]);

  // 8대 직군 전용 라운지 게시글 필터링 (GUILD_EXCLUSIVE)
  const guildLoungePosts = useMemo(() => {
    return posts.filter(
      (p) => p.hubScope === 'GUILD_EXCLUSIVE' && p.targetGuild === selectedLoungeGuild
    );
  }, [posts, selectedLoungeGuild]);

  // 상단 고정 공식 현장 경보 배너 (동료 3인 이상 검증된 펄스)
  const promotedPulses = useMemo(
    () => pulseReports.filter((r) => r.isPromotedToBanner).slice(0, 2),
    [pulseReports]
  );

  const handleUpvotePost = (postId: string) => {
    setPosts((prev) =>
      prev.map((p) => {
        if (p.postId !== postId) return p;
        const prevCount = p.guildReactionBreakdown[myGuild] || 0;
        return {
          ...p,
          upvotes: p.upvotes + 1,
          guildReactionBreakdown: {
            ...p.guildReactionBreakdown,
            [myGuild]: prevCount + 1,
          },
        };
      })
    );
  };

  const handleAddComment = (postId: string, isVoice = false) => {
    const raw = commentInputs[postId]?.trim();
    const content = isVoice
      ? `[무전 음성 STT 댓글] 현장 상황 공감합니다! 오늘 교대까지 모두 안전작업 하십시오!`
      : raw;
    if (!content) return;

    setPosts((prev) =>
      prev.map((p) => {
        if (p.postId !== postId) return p;
        return {
          ...p,
          comments: [
            ...p.comments,
            {
              commentId: `CMT-${Date.now()}`,
              authorIdentity: currentPersona,
              content,
              createdAt: '방금 전',
              upvotes: 1,
              isVoiceStt: isVoice,
            },
          ],
        };
      })
    );
    setCommentInputs((prev) => ({ ...prev, [postId]: '' }));
    triggerToast(isVoice ? '무전 음성(STT) 댓글이 등록되었습니다.' : '댓글이 등록되었습니다.');
  };

  const handleCreateNewPost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostTitle.trim() || !newPostContent.trim()) return;

    const isGuildExclusive = activeTab === 'GUILD_LOUNGES';
    const targetGuild = isGuildExclusive ? selectedLoungeGuild : undefined;

    const newPost: CommunityPost = {
      postId: `POST-${Date.now()}`,
      hubScope: isGuildExclusive ? 'GUILD_EXCLUSIVE' : 'OPEN_SQUARE',
      targetGuild,
      allowCrossGuildQna: isGuildExclusive ? newPostAllowCrossQna : true,
      fromGuild: myGuild,
      zone: currentPersona.primaryZone,
      terminalId: currentPersona.primaryTerminal,
      category: isGuildExclusive ? 'TECH_KNOWHOW' : 'FREE_TALK',
      authorIdentity: currentPersona,
      title: newPostTitle.trim(),
      content: newPostContent.trim(),
      exifStrippedMedia: attachCleanPhoto
        ? [sanitizeMediaExifClientSide('현장제보_인증샷_IMG.jpg')]
        : undefined,
      upvotes: 1,
      guildReactionBreakdown: {
        [myGuild]: 1,
      },
      comments: [],
      createdAt: '방금 전',
      juryStatus: 'CLEAN',
    };

    setPosts((prev) => [newPost, ...prev]);
    setNewPostTitle('');
    setNewPostContent('');
    setShowComposer(false);
    triggerToast(
      isGuildExclusive
        ? `[${getGuildMeta(selectedLoungeGuild).shortName} 전용 라운지]에 새 글이 등록되었습니다!`
        : '[부산항 종합 광장]에 새 글이 등록되었습니다!'
    );
  };

  const handleConfirmPulse = (pulseId: string) => {
    setPulseReports((prev) =>
      prev.map((r) => {
        if (r.pulseId !== pulseId) return r;
        const nextCount = r.confirmationsCount + 1;
        return {
          ...r,
          confirmationsCount: nextCount,
          isPromotedToBanner: nextCount >= 3 ? true : r.isPromotedToBanner,
        };
      })
    );
    triggerToast('현장 동료 검증(+1)이 반영되었습니다. (3인 이상 검증 시 상단 경보 배너 승격)');
  };

  const handleVoteJury = (
    caseId: string,
    guild: PortGuildCode,
    vote: 'AGREE_PROPOSAL' | 'NEED_MORE_CHECK'
  ) => {
    setJuryCases((prev) =>
      prev.map((c) => {
        if (c.caseId !== caseId) return c;
        return {
          ...c,
          juryVotesByGuild: {
            ...c.juryVotesByGuild,
            [guild]: vote,
          },
        };
      })
    );
  };

  const handleJoinClub = (clubId: string) => {
    setClubMeetups((prev) =>
      prev.map((club) => {
        if (club.clubId !== clubId) return club;
        if (club.currentMembers >= club.maxMembers) return club;
        return {
          ...club,
          currentMembers: club.currentMembers + 1,
        };
      })
    );
    triggerToast('평일 오프 동호회/모임에 1탭 참여 신청이 완료되었습니다!');
  };

  const selectedLoungeMeta = getGuildMeta(selectedLoungeGuild);
  const isMyVerifiedLounge = selectedLoungeGuild === myGuild;
  const btnMinH = glovedMode ? 'min-h-[50px]' : 'min-h-[40px]';

  return (
    <div
      className={`min-h-screen transition-colors ${
        highContrastDayMode
          ? 'bg-slate-100 text-slate-950'
          : 'bg-[#090D16] text-slate-100'
      }`}
    >
      {/* 토스트 알림 배너 */}
      {toastMsg && (
        <div className="fixed bottom-5 right-5 z-50 max-w-md rounded-2xl border border-cyan-400 bg-slate-950/95 px-4 py-3 text-xs sm:text-sm font-bold text-cyan-200 shadow-2xl flex items-center gap-2.5">
          <CheckCircle2 className="h-5 w-5 text-cyan-400 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* 최상단 1+6 오케스트레이션 상태 & 8대 직군 멀티 페르소나 시뮬레이터 바 */}
      <header className="sticky top-0 z-40 border-b border-slate-800/90 bg-[#090D16]/95 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-3 sm:px-6 py-2.5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            {/* 로고 및 타이틀 */}
            <div className="flex items-center gap-2.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 text-slate-950 font-black shadow-md shadow-cyan-500/20">
                <Anchor className="h-6 w-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-base sm:text-lg font-extrabold tracking-tight text-white">
                    포트스퀘어 <span className="text-cyan-400 font-mono text-sm">PORT-SQUARE</span>
                  </h1>
                  <span className="hidden sm:inline-flex items-center gap-1 rounded-full bg-emerald-500/15 border border-emerald-500/40 px-2.5 py-0.5 text-[11px] font-bold text-emerald-300">
                    <Wifi className="h-3 w-3" /> 오프라인 큐 & 영지식 익명 보호 ON
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">
                  부산항 5만 항만 종사자 종합 광장 & 8대 직군별 전용 커뮤니티 플랫폼 (1+6 에이전트 오케스트레이션)
                </p>
              </div>
            </div>

            {/* 우측 현장 UX 컨트롤러 (장갑 48px 모드 / 주간 고대비 vs 야간 캐빈 OLED 모드) */}
            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => {
                  setGlovedMode(!glovedMode);
                  triggerToast(
                    !glovedMode
                      ? '48px+ 장갑 & 운전 대기 모드가 활성화되었습니다.'
                      : '표준 컴팩트 터치 모드로 전환되었습니다.'
                  );
                }}
                className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-bold cursor-pointer transition-all ${
                  glovedMode
                    ? 'bg-amber-500/20 border-amber-400 text-amber-300'
                    : 'bg-slate-800 border-slate-700 text-slate-300'
                }`}
              >
                <Hand className="h-3.5 w-3.5" />
                <span>48px 장갑모드 {glovedMode ? 'ON' : 'OFF'}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setHighContrastDayMode(!highContrastDayMode);
                  triggerToast(
                    !highContrastDayMode
                      ? '주간 직사광선 초고대비 모드로 전환되었습니다.'
                      : '야간 크레인 캐빈·트럭 유리 반사 방지 OLED 다크모드로 전환되었습니다.'
                  );
                }}
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 px-3 py-1.5 text-xs font-bold text-cyan-300 cursor-pointer"
              >
                {highContrastDayMode ? (
                  <>
                    <Moon className="h-3.5 w-3.5" />
                    <span>야간 캐빈 OLED 모드</span>
                  </>
                ) : (
                  <>
                    <Sun className="h-3.5 w-3.5" />
                    <span>주간 고대비 모드</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* 8대 직군 멀티 페르소나 시뮬레이터 (클릭 한 번으로 내 소속 직군 및 배지 전환) */}
          <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex flex-col gap-1.5">
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-1.5 text-slate-300 font-semibold">
                <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
                <span>내 직군 인증 시뮬레이터 (클릭 시 직군 라운지 권한 및 멀티 배지 즉시 전환):</span>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="rounded-md bg-cyan-500/15 border border-cyan-500/30 px-2 py-0.5 text-[11px] font-bold text-cyan-300">
                  종합광장 배지: [{currentPersona.publicSquareBadge}]
                </span>
                <span className="rounded-md bg-amber-500/15 border border-amber-500/30 px-2 py-0.5 text-[11px] font-bold text-amber-300">
                  직군라운지 배지: [{currentPersona.guildInternalBadge}]
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
              {GUILD_META_LIST.map((g) => {
                const isSelected = myGuild === g.code;
                return (
                  <button
                    key={g.code}
                    type="button"
                    onClick={() => handleSwitchPersonaGuild(g.code)}
                    className={`shrink-0 rounded-xl px-3 py-1.5 text-xs font-bold transition-all cursor-pointer border ${
                      isSelected
                        ? 'bg-cyan-500 text-slate-950 border-cyan-300 shadow-sm shadow-cyan-500/30'
                        : 'bg-slate-900/90 text-slate-300 border-slate-800 hover:border-slate-600'
                    }`}
                  >
                    {g.shortName}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 메인 Dual-Hub 5대 네비게이션 탭바 */}
          <nav className="mt-2 grid grid-cols-2 sm:grid-cols-5 gap-1.5 pt-1">
            {[
              {
                key: 'OPEN_SQUARE',
                label: 'Hub A. 부산항 종합 광장',
                sub: '전 직군 통합 소통',
                icon: Layers,
              },
              {
                key: 'GUILD_LOUNGES',
                label: 'Hub B. 8대 직군 전용 라운지',
                sub: `${getGuildMeta(selectedLoungeGuild).shortName} 길드`,
                icon: Lock,
              },
              {
                key: 'LIVE_PORT_PULSE',
                label: '실시간 부두 펄스 (3-Tap)',
                sub: '게이트·야드·강풍 제보',
                icon: Radio,
              },
              {
                key: 'CROSS_CRAFT_HARMONY',
                label: '역지사지 직군 브릿지',
                sub: 'AI 에티켓 & 8직군 배심원',
                icon: Handshake,
              },
              {
                key: 'PORT_LIFE_WELFARE',
                label: '교대라이프·식당·장터',
                sub: '새벽국밥·안전화·동호회',
                icon: Compass,
              },
            ].map((tab) => {
              const Icon = tab.icon;
              const active = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveTab(tab.key as MainTabKey)}
                  className={`flex items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-left transition-all cursor-pointer border ${btnMinH} ${
                    active
                      ? 'bg-gradient-to-r from-cyan-500/25 to-blue-500/20 border-cyan-400 text-white shadow-md'
                      : 'bg-slate-900/70 border-slate-800/90 text-slate-400 hover:bg-slate-800/80 hover:text-slate-200'
                  }`}
                >
                  <Icon className={`h-4 w-4 shrink-0 ${active ? 'text-cyan-300' : 'text-slate-400'}`} />
                  <div className="min-w-0">
                    <div className="text-xs sm:text-sm font-bold truncate">{tab.label}</div>
                    <div className="text-[10px] text-slate-400 truncate">{tab.sub}</div>
                  </div>
                </button>
              );
            })}
          </nav>
        </div>
      </header>

      {/* 메인 본문 영역 */}
      <main className="mx-auto max-w-7xl px-3 sm:px-6 py-5 space-y-6">
        {/* 상단 실시간 공식 현장 경보 배너 (어느 탭에서든 즉시 확인 가능) */}
        {promotedPulses.length > 0 && (
          <div className="rounded-2xl border border-amber-500/50 bg-gradient-to-r from-amber-950/40 via-slate-900/90 to-slate-900/90 p-3.5 sm:p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs font-extrabold text-amber-300">
                <AlertTriangle className="h-4 w-4 animate-bounce" />
                <span>부산항 실시간 현장 경보 (현장 동료 3인 이상 검증 완료)</span>
              </div>
              {promotedPulses.map((p) => (
                <div key={p.pulseId} className="text-xs sm:text-sm text-slate-100">
                  <span className="font-bold text-cyan-300 mr-1.5">[{p.berthNo}]</span>
                  <span>{p.shortBriefing}</span>
                  <span className="ml-2 text-amber-300 font-semibold">
                    (동료 {p.confirmationsCount}명 확인)
                  </span>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setActiveTab('LIVE_PORT_PULSE')}
              className="shrink-0 rounded-xl bg-amber-500 hover:bg-amber-400 px-4 py-2 text-xs font-extrabold text-slate-950 cursor-pointer"
            >
              3-Tap 현장 제보 / 전 부두 턴타임 보기 →
            </button>
          </div>
        )}

        {/* 새 글 작성 모달 / 드로어 (종합 광장 & 직군 전용 라운지 겸용) */}
        {showComposer && (
          <section className="rounded-2xl border-2 border-cyan-400 bg-slate-900 p-4 sm:p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-white">
                  {activeTab === 'GUILD_LOUNGES'
                    ? `[${selectedLoungeMeta.shortName} 전용 라운지] 익명 글쓰기`
                    : '[부산항 종합 광장] 전 직군 통합 글쓰기'}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  작성 시 적용되는 자동 배지:{' '}
                  <span className="font-bold text-cyan-300">
                    [
                    {activeTab === 'GUILD_LOUNGES'
                      ? currentPersona.guildInternalBadge
                      : currentPersona.publicSquareBadge}
                    ]
                  </span>
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowComposer(false)}
                className="rounded-lg bg-slate-800 px-3 py-1 text-xs font-bold text-slate-300 cursor-pointer"
              >
                닫기
              </button>
            </div>

            <form onSubmit={handleCreateNewPost} className="space-y-3">
              <input
                type="text"
                required
                value={newPostTitle}
                onChange={(e) => setNewPostTitle(e.target.value)}
                placeholder="제목을 입력하세요 (예: 신항 야간조 오늘 물량 및 안벽 작업 분위기 공유)"
                className="w-full rounded-xl bg-slate-950 border border-slate-700 px-3.5 py-2.5 text-sm text-white"
              />
              <textarea
                rows={3}
                required
                value={newPostContent}
                onChange={(e) => setNewPostContent(e.target.value)}
                placeholder="현장 동료들과 나누고 싶은 이야기, 장비 노하우, 안전 제보를 자유롭게 남겨주세요."
                className="w-full rounded-xl bg-slate-950 border border-slate-700 p-3.5 text-sm text-white"
              />

              <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300">
                  <label className="inline-flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={attachCleanPhoto}
                      onChange={(e) => setAttachCleanPhoto(e.target.checked)}
                    />
                    <span>현장 사진 EXIF(GPS·기기정보) 자동 삭제 첨부</span>
                  </label>

                  {activeTab === 'GUILD_LOUNGES' && (
                    <label className="inline-flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={newPostAllowCrossQna}
                        onChange={(e) => setNewPostAllowCrossQna(e.target.checked)}
                      />
                      <span>타 직군 동료의 댓글 질문(Q&A) 허용</span>
                    </label>
                  )}
                </div>

                <button
                  type="submit"
                  className="inline-flex items-center gap-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 px-5 py-2.5 text-sm font-extrabold text-slate-950 cursor-pointer"
                >
                  <Send className="h-4 w-4" />
                  <span>익명 보장 등록하기</span>
                </button>
              </div>
            </form>
          </section>
        )}

        {/* TAB 1: Hub A. 부산항 종합 커뮤니티 (OPEN_SQUARE) */}
        {activeTab === 'OPEN_SQUARE' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* 좌측 8컬럼: 종합 광장 통합 피드 */}
            <div className="lg:col-span-8 space-y-4">
              <div className="rounded-2xl border border-slate-800 bg-slate-900/85 p-4 flex flex-col gap-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <h2 className="text-base sm:text-lg font-extrabold text-white flex items-center gap-2">
                      <Layers className="h-5 w-5 text-cyan-400" />
                      부산항 종합 광장 (Port Open Square)
                    </h2>
                    <p className="text-xs text-slate-400">
                      크레인·YT·트레일러·본선/라싱·도선/예선·검수/보안·플래너·엔지니어 8대 직군이 함께 소통하는 열린 광장입니다
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowComposer(true)}
                    className={`inline-flex items-center gap-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 px-4 py-2 text-xs sm:text-sm font-extrabold text-slate-950 cursor-pointer ${btnMinH}`}
                  >
                    <PlusCircle className="h-4 w-4" />
                    <span>종합 광장 글쓰기</span>
                  </button>
                </div>

                {/* 권역 필터 & 게시판 카테고리 필터 */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800">
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      { code: 'ALL_BUSAN_PORT', label: '부산항 전역' },
                      { code: 'NEW_PORT', label: '신항 권역(7부두)' },
                      { code: 'NORTH_PORT', label: '북항 권역(신선대·감만)' },
                      { code: 'GAMCHEON_DADAEPO', label: '감천·다대포항' },
                    ].map((z) => (
                      <button
                        key={z.code}
                        type="button"
                        onClick={() => setZoneFilter(z.code as PortZoneCode)}
                        className={`rounded-lg px-2.5 py-1 text-xs font-bold cursor-pointer ${
                          zoneFilter === z.code
                            ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                            : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        {z.label}
                      </button>
                    ))}
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {[
                      { key: 'ALL', label: '전체 글' },
                      { key: 'CROSS_CRAFT_ASK', label: '역지사지 직군 브릿지' },
                      { key: 'SAFETY_NEAR_MISS', label: '안전 아차사고 신문고' },
                      { key: 'FREE_TALK', label: '자유·교대조 수다' },
                    ].map((cat) => (
                      <button
                        key={cat.key}
                        type="button"
                        onClick={() =>
                          setSquareCategoryFilter(cat.key as typeof squareCategoryFilter)
                        }
                        className={`rounded-lg px-2.5 py-1 text-xs font-bold cursor-pointer ${
                          squareCategoryFilter === cat.key
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                            : 'bg-slate-800/70 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        {cat.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* 종합 광장 게시글 카드 리스트 */}
              <div className="space-y-4">
                {openSquarePosts.map((post) => {
                  const fromGuildMeta = getGuildMeta(post.fromGuild);
                  const targetGuildMeta = post.targetGuild
                    ? getGuildMeta(post.targetGuild)
                    : undefined;
                  const termMeta = getTerminalMeta(post.terminalId);

                  return (
                    <article
                      key={post.postId}
                      className={`rounded-2xl border p-4 sm:p-5 transition-all ${
                        post.hubScope === 'CROSS_CRAFT_BRIDGE'
                          ? 'border-purple-500/40 bg-slate-900/90'
                          : post.category === 'SAFETY_NEAR_MISS'
                          ? 'border-emerald-500/40 bg-slate-900/90'
                          : 'border-slate-800 bg-slate-900/75'
                      }`}
                    >
                      {/* 상단 메타 배지 */}
                      <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          {post.hubScope === 'CROSS_CRAFT_BRIDGE' && targetGuildMeta ? (
                            <span className="rounded-md bg-purple-500/20 border border-purple-400/40 px-2.5 py-0.5 text-xs font-extrabold text-purple-300">
                              직군 브릿지: {fromGuildMeta.shortName} → {targetGuildMeta.shortName}
                            </span>
                          ) : post.category === 'SAFETY_NEAR_MISS' ? (
                            <span className="rounded-md bg-emerald-500/20 border border-emerald-400/40 px-2.5 py-0.5 text-xs font-extrabold text-emerald-300">
                              안전 아차사고 신문고 (EXIF 완벽세탁)
                            </span>
                          ) : (
                            <span className="rounded-md bg-cyan-500/15 border border-cyan-500/30 px-2.5 py-0.5 text-xs font-bold text-cyan-300">
                              부산항 통합 광장
                            </span>
                          )}

                          {termMeta && (
                            <span className="rounded bg-slate-800 px-2 py-0.5 text-xs font-semibold text-slate-300">
                              {termMeta.shortLabel}
                            </span>
                          )}

                          <span
                            className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${fromGuildMeta.badgeBgClass} ${fromGuildMeta.badgeTextClass}`}
                          >
                            {post.authorIdentity.nickname} · [{post.authorIdentity.publicSquareBadge}]
                          </span>
                        </div>

                        <span className="text-xs text-slate-400">{post.createdAt}</span>
                      </div>

                      <h3 className="text-base sm:text-lg font-bold text-white leading-snug">
                        {post.title}
                      </h3>

                      <p className="mt-2 text-sm text-slate-200 leading-relaxed whitespace-pre-line">
                        {post.content}
                      </p>

                      {post.aiEtiquettePolished && (
                        <div className="mt-2.5 rounded-lg bg-purple-950/30 border border-purple-500/30 px-3 py-1.5 text-xs text-purple-300 flex items-center gap-1.5">
                          <Sparkles className="h-3.5 w-3.5 shrink-0" />
                          <span>
                            AI 에티켓 도우미를 통해 직군 간 상호 존중 문장으로 순화된 소통 게시글입니다.
                          </span>
                        </div>
                      )}

                      {post.exifStrippedMedia && post.exifStrippedMedia.length > 0 && (
                        <div className="mt-2.5 rounded-lg bg-emerald-950/30 border border-emerald-500/30 px-3 py-2 text-xs text-emerald-300 flex flex-wrap items-center justify-between gap-2">
                          <span className="font-semibold">
                            첨부 미디어: {post.exifStrippedMedia[0].label}
                          </span>
                          <span className="font-mono text-[11px]">
                            {post.exifStrippedMedia[0].sanitizedHash}
                          </span>
                        </div>
                      )}

                      {/* 직군별 공감 분포 바 (어떤 직군들이 이 글에 공감했는지 투명하게 표시) */}
                      <div className="mt-3 pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="text-[11px] text-slate-400 mr-1">직군별 공감 분포:</span>
                          {Object.entries(post.guildReactionBreakdown).map(([gCode, cnt]) => {
                            const gMeta = getGuildMeta(gCode as PortGuildCode);
                            return (
                              <span
                                key={gCode}
                                className={`rounded-md px-2 py-0.5 text-[11px] font-semibold ${gMeta.badgeBgClass} ${gMeta.badgeTextClass}`}
                              >
                                {gMeta.shortName} {cnt}
                              </span>
                            );
                          })}
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleUpvotePost(post.postId)}
                            className={`inline-flex items-center gap-1.5 rounded-xl bg-slate-800 hover:bg-cyan-500/20 border border-slate-700 px-3 py-1.5 text-xs font-bold text-cyan-300 cursor-pointer ${btnMinH}`}
                          >
                            <ThumbsUp className="h-3.5 w-3.5" />
                            <span>내 직군 공감 ({post.upvotes})</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              navigator.clipboard?.writeText(formatPostForKakaoShare(post));
                              triggerToast('카카오톡 단톡방 공유용 요약 카드가 클립보드에 복사되었습니다.');
                            }}
                            className={`inline-flex items-center gap-1 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 px-3 py-1.5 text-xs font-bold text-amber-300 cursor-pointer ${btnMinH}`}
                          >
                            <Share2 className="h-3.5 w-3.5" />
                            <span>카톡 공유</span>
                          </button>
                        </div>
                      </div>

                      {/* 댓글 목록 및 음성/텍스트 댓글 작성 */}
                      <div className="mt-3 pt-3 border-t border-slate-800/60 space-y-2.5">
                        {post.comments.map((cmt) => (
                          <div
                            key={cmt.commentId}
                            className="rounded-xl bg-slate-950/80 border border-slate-800/80 px-3.5 py-2.5 text-xs"
                          >
                            <div className="flex items-center justify-between text-slate-400 mb-1">
                              <span className="font-bold text-cyan-300">
                                {cmt.authorIdentity.nickname} [{cmt.authorIdentity.publicSquareBadge}]
                              </span>
                              <span>{cmt.createdAt}</span>
                            </div>
                            <p className="text-slate-200 leading-relaxed">{cmt.content}</p>
                          </div>
                        ))}

                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={commentInputs[post.postId] || ''}
                            onChange={(e) =>
                              setCommentInputs((prev) => ({
                                ...prev,
                                [post.postId]: e.target.value,
                              }))
                            }
                            placeholder={`[${currentPersona.publicSquareBadge}] 배지로 따뜻한 동료 댓글 남기기...`}
                            className="flex-1 rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-xs text-white"
                          />
                          <button
                            type="button"
                            onClick={() => handleAddComment(post.postId, false)}
                            className="rounded-xl bg-cyan-500 hover:bg-cyan-400 px-3.5 py-2 text-xs font-bold text-slate-950 cursor-pointer"
                          >
                            등록
                          </button>
                          <button
                            type="button"
                            onClick={() => handleAddComment(post.postId, true)}
                            title="무전 음성(STT) 원터치 응원 댓글"
                            className="rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 px-3 py-2 text-xs font-bold text-rose-300 flex items-center gap-1 cursor-pointer"
                          >
                            <Mic className="h-3.5 w-3.5" />
                            <span className="hidden sm:inline">무전댓글</span>
                          </button>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>

            {/* 우측 4컬럼: 8대 직군 전용 라운지 바로가기 & 실시간 항만 브리핑 사이드바 */}
            <aside className="lg:col-span-4 space-y-4">
              <div className="rounded-2xl border border-slate-800 bg-slate-900/85 p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-amber-400" />
                    8대 직군별 전용 라운지 (Hub B)
                  </h3>
                  <span className="text-[11px] text-cyan-300 font-semibold">직군별 독립 공간</span>
                </div>

                <div className="space-y-2">
                  {GUILD_META_LIST.map((g) => {
                    const isMine = g.code === myGuild;
                    return (
                      <button
                        key={g.code}
                        type="button"
                        onClick={() => {
                          setSelectedLoungeGuild(g.code);
                          setActiveTab('GUILD_LOUNGES');
                        }}
                        className={`w-full rounded-xl border p-3 text-left transition-all cursor-pointer flex items-center justify-between gap-2 ${
                          isMine
                            ? 'border-cyan-400/60 bg-cyan-950/25'
                            : 'border-slate-800 bg-slate-950/60 hover:border-slate-700'
                        }`}
                      >
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className={`text-xs font-extrabold ${g.badgeTextClass}`}>
                              {g.shortName}
                            </span>
                            {isMine && (
                              <span className="rounded bg-cyan-500 px-1.5 py-0.2 text-[10px] font-black text-slate-950">
                                내 직군 인증됨
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-400 truncate mt-0.5">
                            {g.subRoles.slice(0, 2).join(' · ')}
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <div className="text-xs font-bold text-slate-200 tabular-nums">
                            {g.memberCount.toLocaleString()}명
                          </div>
                          <div className="text-[10px] text-emerald-400 tabular-nums">
                            현재 {g.activeNowCount}명 접속
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 주요 터미널 게이트 요약 위젯 */}
              <div className="rounded-2xl border border-slate-800 bg-slate-900/85 p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                    <Flame className="h-4 w-4 text-rose-400" />
                    실시간 주요 터미널 게이트 턴타임
                  </h3>
                  <button
                    type="button"
                    onClick={() => setActiveTab('LIVE_PORT_PULSE')}
                    className="text-[11px] font-bold text-cyan-300 cursor-pointer"
                  >
                    전체보기 →
                  </button>
                </div>

                <div className="space-y-2">
                  {TERMINAL_META_LIST.slice(0, 5).map((t) => (
                    <div
                      key={t.id}
                      className="rounded-xl bg-slate-950/80 border border-slate-800/80 px-3 py-2 flex items-center justify-between text-xs"
                    >
                      <div>
                        <span className="font-bold text-white">{t.shortLabel}</span>
                        <span className="ml-2 text-[11px] text-slate-400">
                          풍속 {t.windSpeedMps}m/s
                        </span>
                      </div>
                      <span
                        className={`font-bold tabular-nums ${
                          t.gateTurnTimeMinutes >= 35 ? 'text-rose-400' : 'text-emerald-300'
                        }`}
                      >
                        대기 {t.gateTurnTimeMinutes}분
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </aside>
          </div>
        )}

        {/* TAB 2: Hub B. 8대 직군별 전용 커뮤니티 라운지 (GUILD_LOUNGES) */}
        {activeTab === 'GUILD_LOUNGES' && (
          <div className="space-y-5">
            {/* 상단 8대 직군 라운지 선택 그리드 */}
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
              {GUILD_META_LIST.map((g) => {
                const active = selectedLoungeGuild === g.code;
                const isMine = g.code === myGuild;
                return (
                  <button
                    key={g.code}
                    type="button"
                    onClick={() => setSelectedLoungeGuild(g.code)}
                    className={`rounded-xl border p-2.5 text-left transition-all cursor-pointer flex flex-col justify-between ${
                      active
                        ? 'border-cyan-400 bg-cyan-950/35 shadow-md'
                        : 'border-slate-800 bg-slate-900/75 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1">
                      <span className={`text-xs font-extrabold truncate ${g.badgeTextClass}`}>
                        {g.shortName}
                      </span>
                      {isMine ? (
                        <Unlock className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                      ) : (
                        <Lock className="h-3.5 w-3.5 text-slate-500 shrink-0" />
                      )}
                    </div>
                    <div className="mt-1.5 text-[10px] text-slate-400 tabular-nums">
                      {g.memberCount.toLocaleString()}명 · <span className="text-emerald-400">{g.activeNowCount}명 ON</span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* 선택된 직군 전용 라운지 헤더 배너 */}
            <section
              className={`rounded-2xl border p-5 ${selectedLoungeMeta.borderClass} bg-slate-900/90`}
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="space-y-2 max-w-3xl">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`rounded-full px-3 py-0.5 text-xs font-extrabold ${selectedLoungeMeta.badgeBgClass} ${selectedLoungeMeta.badgeTextClass}`}
                    >
                      직군 전용 길드 라운지
                    </span>
                    {isMyVerifiedLounge ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 px-3 py-0.5 text-xs font-bold text-emerald-300">
                        <ShieldCheck className="h-3.5 w-3.5" /> 내 소속 직군 인증 완료 (전체 열람·작성 권한)
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/20 border border-amber-500/40 px-3 py-0.5 text-xs font-bold text-amber-300">
                        <Lock className="h-3.5 w-3.5" /> 타 직군 보호 구역 (열린 Q&A 열람 가능 · 전용글 작성 제한)
                      </span>
                    )}
                  </div>

                  <h2 className="text-lg sm:text-xl font-extrabold text-white">
                    {selectedLoungeMeta.fullName}
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-300">
                    {selectedLoungeMeta.exclusiveNotice}
                  </p>

                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {selectedLoungeMeta.subRoles.map((sr) => (
                      <span
                        key={sr}
                        className="rounded-lg bg-slate-950/90 border border-slate-800 px-2.5 py-1 text-xs text-slate-300"
                      >
                        • {sr}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col sm:items-end gap-2">
                  {isMyVerifiedLounge ? (
                    <button
                      type="button"
                      onClick={() => setShowComposer(true)}
                      className={`inline-flex items-center gap-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 px-4 py-2.5 text-xs sm:text-sm font-extrabold text-slate-950 cursor-pointer ${btnMinH}`}
                    >
                      <PlusCircle className="h-4 w-4" />
                      <span>{selectedLoungeMeta.shortName} 전용 라운지 글쓰기</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleSwitchPersonaGuild(selectedLoungeGuild)}
                      className={`inline-flex items-center gap-2 rounded-xl bg-amber-500 hover:bg-amber-400 px-4 py-2.5 text-xs sm:text-sm font-extrabold text-slate-950 cursor-pointer ${btnMinH}`}
                    >
                      <Sparkles className="h-4 w-4" />
                      <span>시뮬레이터: [{selectedLoungeMeta.shortName}] 페르소나로 즉시 체험하기</span>
                    </button>
                  )}
                  <div className="text-[11px] text-slate-400">
                    라운지 내부 표기 배지:{' '}
                    <span className="font-bold text-amber-300">
                      [{SIMULATOR_PERSONAS[selectedLoungeGuild].guildInternalBadge}]
                    </span>
                  </div>
                </div>
              </div>
            </section>

            {/* 직군 전용 라운지 게시글 리스트 */}
            <div className="space-y-4">
              {guildLoungePosts.map((post) => {
                const isLockedForOtherGuild = !isMyVerifiedLounge && !post.allowCrossGuildQna;

                return (
                  <article
                    key={post.postId}
                    className="rounded-2xl border border-slate-800 bg-slate-900/85 p-4 sm:p-5"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={`rounded-md px-2.5 py-0.5 text-xs font-extrabold ${selectedLoungeMeta.badgeBgClass} ${selectedLoungeMeta.badgeTextClass}`}
                        >
                          {selectedLoungeMeta.shortName} 전용
                        </span>
                        {/* 직군 전용 라운지 내부에서는 세부 경력/장비 배지(guildInternalBadge)가 표시됨! */}
                        <span className="rounded-full bg-amber-500/15 border border-amber-500/30 px-2.5 py-0.5 text-xs font-bold text-amber-300">
                          {post.authorIdentity.nickname} · [{post.authorIdentity.guildInternalBadge}]
                        </span>
                        {post.allowCrossGuildQna ? (
                          <span className="rounded bg-slate-800 px-2 py-0.5 text-[11px] text-cyan-300">
                            타 직군 Q&A 열람 허용
                          </span>
                        ) : (
                          <span className="rounded bg-rose-500/15 px-2 py-0.5 text-[11px] text-rose-300 font-semibold">
                            동일 직군만 열람 가능 (대외비)
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-slate-400">{post.createdAt}</span>
                    </div>

                    <h3 className="text-base sm:text-lg font-bold text-white">{post.title}</h3>

                    {isLockedForOtherGuild ? (
                      <div className="mt-3 rounded-xl border border-amber-500/30 bg-slate-950/90 p-4 flex flex-wrap items-center justify-between gap-3">
                        <div className="flex items-center gap-2.5 text-xs sm:text-sm text-slate-300">
                          <ShieldAlert className="h-5 w-5 text-amber-400 shrink-0" />
                          <span>
                            이 게시글은 <strong>{selectedLoungeMeta.shortName}</strong> 직군 전용 보호 글입니다. 상단 시뮬레이터 또는 버튼을 눌러 해당 직군 인증 상태로 열람하세요.
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleSwitchPersonaGuild(selectedLoungeGuild)}
                          className="rounded-lg bg-amber-500 px-3.5 py-1.5 text-xs font-extrabold text-slate-950 cursor-pointer"
                        >
                          [{selectedLoungeMeta.shortName}] 인증 모드로 전환하여 본문 보기
                        </button>
                      </div>
                    ) : (
                      <>
                        <p className="mt-2 text-sm text-slate-200 leading-relaxed">{post.content}</p>
                        <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                          <button
                            type="button"
                            onClick={() => handleUpvotePost(post.postId)}
                            className="inline-flex items-center gap-1.5 rounded-xl bg-slate-800 hover:bg-cyan-500/20 border border-slate-700 px-3 py-1.5 text-xs font-bold text-cyan-300 cursor-pointer"
                          >
                            <ThumbsUp className="h-3.5 w-3.5" />
                            <span>동종 직군 공감 ({post.upvotes})</span>
                          </button>
                          <span className="text-xs text-slate-400 flex items-center gap-1">
                            <MessageSquare className="h-3.5 w-3.5" /> 댓글 {post.comments.length}건
                          </span>
                        </div>
                      </>
                    )}
                  </article>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 3: 실시간 부두·게이트·선석 펄스 (LIVE_PORT_PULSE) */}
        {activeTab === 'LIVE_PORT_PULSE' && (
          <LivePortPulseView
            terminals={TERMINAL_META_LIST}
            pulseReports={pulseReports}
            vessels={vessels}
            vesselSource={vesselSource}
            currentPersona={currentPersona}
            glovedMode={glovedMode}
            onAddPulseReport={(newReport) => setPulseReports((prev) => [newReport, ...prev])}
            onConfirmPulse={handleConfirmPulse}
            onCopyToast={triggerToast}
          />
        )}

        {/* TAB 4: 직군 간 역지사지 브릿지 & 8직군 교차 배심원단 (CROSS_CRAFT_HARMONY) */}
        {activeTab === 'CROSS_CRAFT_HARMONY' && (
          <CrossCraftHarmonyView
            currentPersona={currentPersona}
            juryCases={juryCases}
            glovedMode={glovedMode}
            onVoteJury={handleVoteJury}
            onCreateBridgePost={(newBridgePost) => {
              setPosts((prev) => [newBridgePost, ...prev]);
              setActiveTab('OPEN_SQUARE');
            }}
            onCopyToast={triggerToast}
          />
        )}

        {/* TAB 5: 교대근무 라이프 · 새벽식당 · 상생장터 · 동호회 (PORT_LIFE_WELFARE) */}
        {activeTab === 'PORT_LIFE_WELFARE' && (
          <PortLifeWelfareView
            currentPersona={currentPersona}
            localSpots={localSpots}
            gearItems={gearItems}
            clubMeetups={clubMeetups}
            glovedMode={glovedMode}
            onAddGearItem={(item) => setGearItems((prev) => [item, ...prev])}
            onJoinClub={handleJoinClub}
            onCopyToast={triggerToast}
          />
        )}
      </main>
    </div>
  );
}
export default App;

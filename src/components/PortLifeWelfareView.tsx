import React, { useState } from 'react';
import {
  Calendar,
  Car,
  Coffee,
  Compass,
  Moon,
  PlusCircle,
  ShoppingBag,
  Sun,
  Truck,
  Users,
  Utensils,
} from 'lucide-react';
import {
  PortClubMeetup,
  PortGearMarketItem,
  PortLocalSpot,
  WorkerAnonymousIdentity,
} from '../types/community';

interface PortLifeWelfareViewProps {
  currentPersona: WorkerAnonymousIdentity;
  localSpots: PortLocalSpot[];
  gearItems: PortGearMarketItem[];
  clubMeetups: PortClubMeetup[];
  glovedMode: boolean;
  onAddGearItem: (item: PortGearMarketItem) => void;
  onJoinClub: (clubId: string) => void;
  onCopyToast: (msg: string) => void;
}

export const PortLifeWelfareView: React.FC<PortLifeWelfareViewProps> = ({
  currentPersona,
  localSpots,
  gearItems,
  clubMeetups,
  glovedMode,
  onAddGearItem,
  onJoinClub,
  onCopyToast,
}) => {
  const [shiftMode, setShiftMode] = useState<'NIGHT_OFF_DAWN' | 'DAY_WORK' | 'OFF_HOLIDAY'>(
    'NIGHT_OFF_DAWN'
  );
  const [trailerParkingOnly, setTrailerParkingOnly] = useState(false);
  const [newGearTitle, setNewGearTitle] = useState('');
  const [newGearPrice, setNewGearPrice] = useState('45000');
  const [newGearSpot, setNewGearSpot] = useState('신항 한진(HJNC) 연락소 앞 직거래');

  const btnMinH = glovedMode ? 'min-h-[52px] text-base' : 'min-h-[42px] text-sm';

  const filteredSpots = localSpots.filter((s) =>
    trailerParkingOnly ? s.trailerParkingAvailable : true
  );

  const handleCreateGear = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGearTitle.trim()) return;
    const item: PortGearMarketItem = {
      itemId: `GEAR-${Date.now()}`,
      title: newGearTitle.trim(),
      category: 'SAFETY_BOOTS',
      priceKrw: Number(newGearPrice) || 0,
      isFreeShare: Number(newGearPrice) === 0,
      sellerGuild: currentPersona.verifiedGuild,
      sellerBadge: currentPersona.publicSquareBadge,
      tradeSpot: newGearSpot,
      status: 'OPEN',
      createdAt: '방금 전',
    };
    onAddGearItem(item);
    setNewGearTitle('');
    onCopyToast('항만 상생 장터에 물품이 등록되었습니다!');
  };

  return (
    <div className="space-y-6">
      {/* 1. 교대근무 시차 동기화(Shift-Synced) 라이프 배너 */}
      <section className="rounded-2xl border border-amber-500/40 bg-slate-900/90 p-4 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/20 text-amber-300">
              {shiftMode === 'NIGHT_OFF_DAWN' ? (
                <Moon className="h-5 w-5" />
              ) : (
                <Sun className="h-5 w-5" />
              )}
            </span>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white">
                교대근무 시차 동기화 큐레이션 (Shift-Synced Port Life)
              </h2>
              <p className="text-xs text-slate-400">
                현재 근무 형태({currentPersona.shiftPattern})에 맞춰 새벽 퇴근 식당·수면모드·평일 비번 동호회를 자동 편성합니다
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {[
              { key: 'NIGHT_OFF_DAWN', label: '야간조 퇴근 (새벽 04~08시 모드)' },
              { key: 'DAY_WORK', label: '주간조 가동 (08~19시 모드)' },
              { key: 'OFF_HOLIDAY', label: '평일 교대 비번 (취미·번개 모드)' },
            ].map((m) => (
              <button
                key={m.key}
                type="button"
                onClick={() => setShiftMode(m.key as typeof shiftMode)}
                className={`rounded-xl px-3 py-1.5 text-xs font-bold cursor-pointer ${
                  shiftMode === m.key
                    ? 'bg-amber-500 text-slate-950'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-3 rounded-xl bg-slate-950/80 border border-slate-800 p-3.5 text-xs sm:text-sm text-amber-200 flex items-center justify-between flex-wrap gap-2">
          {shiftMode === 'NIGHT_OFF_DAWN' && (
            <span>
              야간조 밤샘 작업 수고 많으셨습니다! 지금 시간(새벽 05:00~08:00) 따뜻한 국밥·해장국 첫 솥 여는 식당과 무료 온수 샤워실 정보를 최우선 표시합니다. (낮 10~17시 푸시 알림 자동 무음 보장)
            </span>
          )}
          {shiftMode === 'DAY_WORK' && (
            <span>
              주간조 안전 작업 시간입니다! 부두 구내식당 특식 메뉴와 퇴근길 카풀 매칭, 작업장비 직거래 장터를 표시합니다.
            </span>
          )}
          {shiftMode === 'OFF_HOLIDAY' && (
            <span>
              기다리던 평일 교대 비번일입니다! 오늘 출조하는 가덕도 선상낚시, 부산항 궁도회 합동 습사, 풋살 번개 모임을 확인하세요.
            </span>
          )}
        </div>
      </section>

      {/* 2. 부산항 3대 권역 로컬 생활 지도 (새벽 식당 · 추레라 주차 · 무료 샤워실) */}
      <section className="rounded-2xl border border-slate-800 bg-slate-900/75 p-4 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Utensils className="h-4 w-4 text-amber-400" />
              부산항 3대 권역(신항·북항·감천항) 새벽 영업 식당 · 휴게소 · 샤워실 지도
            </h3>
            <p className="text-xs text-slate-400">
              현장 항만인들이 직접 검증한 새벽 4시 오픈 국밥집과 대형 트레일러 주차 가능 명소입니다
            </p>
          </div>

          <button
            type="button"
            onClick={() => setTrailerParkingOnly(!trailerParkingOnly)}
            className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold border cursor-pointer ${
              trailerParkingOnly
                ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200'
                : 'bg-slate-800 border-slate-700 text-slate-300'
            }`}
          >
            <Truck className="h-4 w-4" />
            <span>대형 트레일러(추레라) 주차 가능만 보기 {trailerParkingOnly ? 'ON' : 'OFF'}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {filteredSpots.map((spot) => (
            <div
              key={spot.spotId}
              className="rounded-xl border border-slate-800 bg-slate-950/80 p-4 flex flex-col justify-between gap-2"
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  <span className="font-bold text-sm sm:text-base text-white">{spot.name}</span>
                  <span className="rounded-full bg-amber-500/15 border border-amber-500/30 px-2.5 py-0.5 text-[11px] font-bold text-amber-300">
                    추천 {spot.recommendCount}
                  </span>
                </div>

                <div className="flex flex-wrap gap-2 mt-1.5 text-[11px]">
                  <span className="rounded bg-slate-800 px-2 py-0.5 text-cyan-300 font-semibold">
                    인접: {spot.nearTerminal}
                  </span>
                  <span className="rounded bg-slate-800 px-2 py-0.5 text-slate-300">
                    영업: {spot.openHours}
                  </span>
                  {spot.trailerParkingAvailable && (
                    <span className="rounded bg-emerald-500/20 px-2 py-0.5 text-emerald-300 font-semibold">
                      트레일러 대형주차 가능
                    </span>
                  )}
                </div>

                <div className="mt-2 text-xs font-semibold text-amber-200">
                  대표 메뉴/혜택: {spot.signatureMenuOrService} ({spot.priceRange})
                </div>
                <p className="mt-1 text-xs text-slate-400 leading-relaxed">
                  "{spot.workerReviewSnippet}"
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. 항만 안전장비·작업복 상생 중고장터 & 공동구매 */}
      <section className="rounded-2xl border border-slate-800 bg-slate-900/75 p-4 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <ShoppingBag className="h-4 w-4 text-emerald-400" />
              항만인 안전장비 상생 장터 & 공동구매 (Port Gear Market)
            </h3>
            <p className="text-xs text-slate-400">
              안전화, 방폭 랜턴, 모토로라 무전기, 방한복, 연수원 교재를 부두 연락소·게이트 앞에서 수수료 없이 직거래/나눔합니다
            </p>
          </div>
        </div>

        <form onSubmit={handleCreateGear} className="mb-4 grid grid-cols-1 sm:grid-cols-4 gap-2.5">
          <input
            type="text"
            value={newGearTitle}
            onChange={(e) => setNewGearTitle(e.target.value)}
            placeholder="물품명 입력 (예: K2 6인치 안전화 275mm 미사용)"
            className="sm:col-span-2 rounded-xl bg-slate-950 border border-slate-700 px-3.5 py-2 text-xs sm:text-sm text-white"
          />
          <input
            type="number"
            value={newGearPrice}
            onChange={(e) => setNewGearPrice(e.target.value)}
            placeholder="가격 (0원이면 무료나눔)"
            className="rounded-xl bg-slate-950 border border-slate-700 px-3.5 py-2 text-xs sm:text-sm text-white"
          />
          <button
            type="submit"
            className={`inline-flex items-center justify-center gap-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-4 py-2 cursor-pointer ${btnMinH}`}
          >
            <PlusCircle className="h-4 w-4" />
            <span>장터 즉시 등록</span>
          </button>
        </form>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {gearItems.map((item) => (
            <div
              key={item.itemId}
              className="rounded-xl border border-slate-800 bg-slate-950/80 p-3.5 flex items-center justify-between gap-3"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  {item.isFreeShare ? (
                    <span className="rounded bg-pink-500/20 px-2 py-0.5 text-[11px] font-bold text-pink-300">
                      동료 무료나눔
                    </span>
                  ) : item.isGroupBuy ? (
                    <span className="rounded bg-purple-500/20 px-2 py-0.5 text-[11px] font-bold text-purple-300">
                      공동구매 ({item.groupBuyParticipants})
                    </span>
                  ) : (
                    <span className="rounded bg-emerald-500/20 px-2 py-0.5 text-[11px] font-bold text-emerald-300">
                      부두 직거래
                    </span>
                  )}
                  <span className="text-xs text-slate-400">{item.sellerBadge}</span>
                </div>
                <div className="font-bold text-sm text-white">{item.title}</div>
                <div className="text-[11px] text-slate-400">거래장소: {item.tradeSpot}</div>
              </div>

              <div className="text-right shrink-0">
                <div className="text-sm font-bold text-amber-300 tabular-nums">
                  {item.isFreeShare ? '무료나눔' : `${item.priceKrw.toLocaleString()}원`}
                </div>
                <button
                  type="button"
                  onClick={() =>
                    onCopyToast(`'${item.title}' 판매자(${item.sellerBadge})에게 익명 무전 채팅을 연결했습니다.`)
                  }
                  className="mt-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-600 px-3 py-1 text-xs font-semibold text-cyan-300 cursor-pointer"
                >
                  익명 채팅
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. 평일 교대 오프 동호회(낚시·궁도·풋살) & 출퇴근 카풀 · 일일 대타 보드 */}
      <section className="rounded-2xl border border-slate-800 bg-slate-900/75 p-4 sm:p-5">
        <div className="flex items-center justify-between gap-2 mb-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Compass className="h-4 w-4 text-cyan-400" />
              평일 오프 항만 동호회(바다낚시·궁도·풋살) & 카풀 · 스페어 배차
            </h3>
            <p className="text-xs text-slate-400">
              교대근무자끼리 평일 비번 날을 맞춰 함께 즐기는 취미 모임과 출퇴근 카풀/일일 대타 구인 보드입니다
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {clubMeetups.map((club) => (
            <div
              key={club.clubId}
              className="rounded-xl border border-slate-800 bg-slate-950/80 p-4 flex flex-col justify-between gap-3"
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  <span className="rounded-md bg-cyan-500/15 px-2.5 py-0.5 text-[11px] font-bold text-cyan-300">
                    {club.targetShiftOff}
                  </span>
                  <span className="text-xs font-mono text-slate-400">
                    참여 {club.currentMembers} / {club.maxMembers}명
                  </span>
                </div>
                <h4 className="font-bold text-sm sm:text-base text-white mt-1.5">{club.title}</h4>
                <div className="text-xs text-slate-400 mt-1">
                  일시: {club.meetingDateText} | 집결: {club.meetingPlace}
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
                <span className="text-xs text-slate-400">개설: {club.hostBadge}</span>
                <button
                  type="button"
                  onClick={() => onJoinClub(club.clubId)}
                  className={`inline-flex items-center gap-1.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 px-3.5 py-1.5 text-xs font-bold text-cyan-300 cursor-pointer ${btnMinH}`}
                >
                  <Users className="h-3.5 w-3.5" />
                  <span>1탭 모임 참여 신청</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

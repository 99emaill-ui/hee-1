import React, { useState, useEffect } from 'react';
import { Room, TimetableSlot, Candidate, GeneralConfig } from '../types';
import { parseMinutes, formatMinutes } from '../utils/timeUtils';
import {
  Activity,
  Play,
  RotateCcw,
  Clock,
  MapPin,
  CheckCircle,
  AlertCircle,
  Coffee,
  Users,
} from 'lucide-react';

interface LiveSimulatorViewProps {
  slots: TimetableSlot[];
  rooms: Room[];
  candidates: Candidate[];
  config: GeneralConfig;
  overallStartTime: string;
  overallEndTime: string;
}

export const LiveSimulatorView: React.FC<LiveSimulatorViewProps> = ({
  slots,
  rooms,
  candidates,
  config,
  overallStartTime,
  overallEndTime,
}) => {
  const [selectedDay, setSelectedDay] = useState<1 | 2>(1);

  // Filter slots for the selected day
  const daySlots = slots.filter((s) => s.day === selectedDay);

  // Compute Day Start & Day End
  const { dayStartM, dayEndM, dayStartTimeStr, dayEndTimeStr } = React.useMemo(() => {
    if (daySlots.length === 0) {
      return {
        dayStartM: parseMinutes('09:00'),
        dayEndM: parseMinutes('18:00'),
        dayStartTimeStr: '09:00',
        dayEndTimeStr: '18:00',
      };
    }
    let minM = 24 * 60;
    let maxM = 0;
    daySlots.forEach((s) => {
      const sStart = parseMinutes(s.prepStartTime || s.evalStartTime);
      const sEnd = parseMinutes(s.videoEndTime || s.gradeEndTime || s.evalEndTime);
      if (sStart < minM) minM = sStart;
      if (sEnd > maxM) maxM = sEnd;
    });
    return {
      dayStartM: minM,
      dayEndM: maxM,
      dayStartTimeStr: formatMinutes(minM),
      dayEndTimeStr: formatMinutes(maxM),
    };
  }, [daySlots]);

  // Current simulation clock in minutes
  const [currentMinutes, setCurrentMinutes] = useState<number>(dayStartM);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  // When day changes, reset time to that day's start
  useEffect(() => {
    setCurrentMinutes(dayStartM);
    setIsPlaying(false);
  }, [selectedDay, dayStartM]);

  // Play animation timer
  useEffect(() => {
    let interval: any;
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentMinutes((prev) => {
          if (prev >= dayEndM) {
            setIsPlaying(false);
            return dayStartM;
          }
          return prev + 1; // 1 minute per tick
        });
      }, 500); // 500ms per simulated minute
    }
    return () => clearInterval(interval);
  }, [isPlaying, dayStartM, dayEndM]);

  const currentTimeStr = formatMinutes(currentMinutes);

  const handleSetRealTime = () => {
    const now = new Date();
    const hours = now.getHours();
    const mins = now.getMinutes();
    const total = hours * 60 + mins;
    setCurrentMinutes(Math.min(Math.max(total, dayStartM), dayEndM));
    setIsPlaying(false);
  };

  // Check lunch (only on day 1 if relevant)
  const isLunch = (() => {
    if (selectedDay !== 1) return false;
    if (!config.hasLunch || config.lunchDurationMinutes <= 0) return false;
    const lStart = parseMinutes(config.lunchStartTime);
    const lEnd = lStart + config.lunchDurationMinutes;
    return currentMinutes >= lStart && currentMinutes < lEnd;
  })();

  // Figure out who is doing what right now:
  // 1. In evaluation rooms
  const roomStatus = rooms.map((room) => {
    const activeSlot = daySlots.find((s) => {
      if (s.roomId !== room.id) return false;
      const evalS = parseMinutes(s.evalStartTime);
      const evalE = parseMinutes(s.evalEndTime);
      return currentMinutes >= evalS && currentMinutes < evalE;
    });

    const gradingSlot = daySlots.find((s) => {
      if (s.roomId !== room.id) return false;
      const evalE = parseMinutes(s.evalEndTime);
      const gradeE = parseMinutes(s.gradeEndTime);
      return currentMinutes >= evalE && currentMinutes < gradeE;
    });

    return {
      room,
      activeSlot,
      gradingSlot,
    };
  });

  // 2. Who is preparing in the prep room?
  const preparingSlots = daySlots.filter((s) => {
    if (!s.prepStartTime || !s.prepEndTime) return false;
    const pS = parseMinutes(s.prepStartTime);
    const pE = parseMinutes(s.prepEndTime);
    return currentMinutes >= pS && currentMinutes < pE;
  });

  // 3. Who is watching videos in 456 room?
  const videoWatchingSlots = daySlots.filter((s) => {
    if (!s.videoStartTime || !s.videoEndTime) return false;
    const vS = parseMinutes(s.videoStartTime);
    const vE = parseMinutes(s.videoEndTime);
    return currentMinutes >= vS && currentMinutes < vE;
  });

  // 3-B. Who is in 역량평가 대기 right now (IB 전용 10분 대기)?
  const transitWaitingSlots = daySlots.filter((s) => {
    if (!s.transitStartTime || !s.transitEndTime) return false;
    const tS = parseMinutes(s.transitStartTime);
    const tE = parseMinutes(s.transitEndTime);
    return currentMinutes >= tS && currentMinutes < tE;
  });

  // 4. Who is busy right now?
  const busyCandidateIds = new Set<string>();
  roomStatus.forEach((rs) => {
    if (rs.activeSlot) {
      rs.activeSlot.candidateIds.forEach((id) => busyCandidateIds.add(id));
    }
  });
  preparingSlots.forEach((ps) => {
    ps.candidateIds.forEach((id) => busyCandidateIds.add(id));
  });
  transitWaitingSlots.forEach((ts) => {
    ts.candidateIds.forEach((id) => busyCandidateIds.add(id));
  });
  videoWatchingSlots.forEach((vs) => {
    vs.candidateIds.forEach((id) => busyCandidateIds.add(id));
  });

  // Common slots
  const activeCommonSlot = daySlots.find((s) => {
    if (s.exerciseType !== 'COMMON_ALL') return false;
    const sStart = parseMinutes(s.evalStartTime);
    const sEnd = parseMinutes(s.evalEndTime);
    return currentMinutes >= sStart && currentMinutes < sEnd;
  });

  const waitingCandidates = candidates.filter((c) => !busyCandidateIds.has(c.id));

  return (
    <div className="space-y-6">
      {/* Simulator Control Header */}
      <div className="bg-slate-900 text-white rounded-xl p-5 shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-red-500/20 text-red-400 flex items-center justify-center">
              <Activity className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">
                실시간 운영 상황실 (Live AC Control Room)
              </h3>
              <p className="text-xs text-slate-400">
                시간 슬라이더를 조작하여 특정 시각의 평가실, 준비실, 대기실 상황을 실시간으로 확인합니다.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Day selector */}
            <div className="flex items-center bg-slate-800 p-0.5 rounded-lg border border-slate-700 text-xs font-bold mr-1">
              <button
                type="button"
                onClick={() => setSelectedDay(1)}
                className={`px-3 py-1 rounded-md transition-colors ${
                  selectedDay === 1
                    ? 'bg-red-600 text-white shadow-2xs'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                1일차 (PT 10:00 / RP 14:30)
              </button>
              <button
                type="button"
                onClick={() => setSelectedDay(2)}
                className={`px-3 py-1 rounded-md transition-colors ${
                  selectedDay === 2
                    ? 'bg-red-600 text-white shadow-2xs'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                2일차 (IB 09:30)
              </button>
            </div>

            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors ${
                isPlaying
                  ? 'bg-amber-500 hover:bg-amber-600 text-slate-950'
                  : 'bg-red-600 hover:bg-red-700 text-white'
              }`}
            >
              <Play className={`w-3.5 h-3.5 ${isPlaying ? 'fill-slate-950' : ''}`} />
              <span>{isPlaying ? '일시 정지' : '시뮬레이션 재생'}</span>
            </button>

            <button
              onClick={handleSetRealTime}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium border border-slate-700"
            >
              현재 시각 반영
            </button>

            <button
              onClick={() => setCurrentMinutes(dayStartM)}
              className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-lg"
              title="시작 시각으로 리셋"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Time Slider */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-slate-400">
              {selectedDay}일차 시작: {dayStartTimeStr}
            </span>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">기준 시각:</span>
              <span className="text-2xl font-black font-mono text-amber-400">
                {currentTimeStr}
              </span>
            </div>
            <span className="text-xs font-mono text-slate-400">
              {selectedDay}일차 종료: {dayEndTimeStr}
            </span>
          </div>

          <input
            type="range"
            min={dayStartM}
            max={dayEndM}
            value={currentMinutes}
            onChange={(e) => {
              setCurrentMinutes(Number(e.target.value));
              setIsPlaying(false);
            }}
            className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-red-500"
          />
        </div>
      </div>

      {/* Lunch alert if active */}
      {isLunch && (
        <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-center justify-between text-amber-800">
          <div className="flex items-center gap-2">
            <Coffee className="w-5 h-5 text-amber-600" />
            <span className="font-bold text-sm">현재 중식 및 공식 휴식 시간입니다.</span>
          </div>
          <span className="text-xs">
            {config.lunchStartTime}부터 {config.lunchDurationMinutes}분간 평가 일시정지
          </span>
        </div>
      )}

      {/* Common bulk session alert */}
      {activeCommonSlot && (
        <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-indigo-600 text-white font-bold text-xs">
                공통 과제 진행 중
              </span>
              <span className="font-bold text-slate-900 text-sm">
                {activeCommonSlot.exerciseName}
              </span>
            </div>
            <span className="text-xs font-mono font-bold text-indigo-700">
              {activeCommonSlot.evalStartTime} ~ {activeCommonSlot.evalEndTime}
            </span>
          </div>
          <div className="mt-2 text-xs text-slate-600">
            장소: <strong>{activeCommonSlot.roomName}</strong> (피평가자 전원{' '}
            {activeCommonSlot.candidateNames.length}명 참여 중)
          </div>
        </div>
      )}

      {/* Real-time Status Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Rooms status */}
        {roomStatus.map(({ room, activeSlot, gradingSlot }) => (
          <div
            key={room.id}
            className={`border rounded-xl p-4 shadow-2xs transition-all ${
              activeSlot
                ? 'border-red-400 bg-red-50/40 ring-1 ring-red-300'
                : gradingSlot
                ? 'border-amber-400 bg-amber-50/30'
                : 'border-slate-200 bg-white'
            }`}
          >
            <div className="flex items-center justify-between pb-2 border-b border-slate-200 mb-3">
              <h4 className="font-bold text-slate-900 text-sm">{room.name}</h4>
              {activeSlot ? (
                <span className="flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 bg-red-600 text-white rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping"></span>
                  본평가 진행 중
                </span>
              ) : gradingSlot ? (
                <span className="text-[11px] font-bold px-2 py-0.5 bg-amber-100 text-amber-800 rounded-full border border-amber-300">
                  평정 및 채점 중
                </span>
              ) : (
                <span className="text-[11px] font-medium px-2 py-0.5 bg-slate-100 text-slate-500 rounded-full">
                  대기 / 비어있음
                </span>
              )}
            </div>

            {activeSlot ? (
              <div className="space-y-2">
                <div className="text-xs text-slate-500">
                  진행 과목: <strong className="text-red-800">{activeSlot.exerciseName}</strong>
                </div>
                <div className="p-2.5 bg-white border border-red-200 rounded-lg">
                  <div className="text-xs font-semibold text-slate-500">입실 수험생:</div>
                  <div className="text-sm font-black text-slate-900 mt-0.5">
                    [{activeSlot.candidateCodes.join(', ')}]{' '}
                    {activeSlot.candidateNames.join(', ')}
                  </div>
                </div>
                <div className="text-[11px] text-slate-500 flex justify-between">
                  <span>종료 예정: {activeSlot.evalEndTime}</span>
                  <span className="text-red-700 font-bold">
                    잔여:{' '}
                    {Math.max(
                      0,
                      parseMinutes(activeSlot.evalEndTime) - currentMinutes
                    )}
                    분
                  </span>
                </div>
              </div>
            ) : gradingSlot ? (
              <div className="space-y-2 text-xs">
                <div className="text-slate-600">
                  이전 차수: <strong>제{gradingSlot.round}차</strong>
                </div>
                <div className="p-2 bg-amber-50 rounded text-amber-800 font-medium">
                  평가위원 평정표 작성 및 시스템 입력 중 (마감: {gradingSlot.gradeEndTime})
                </div>
              </div>
            ) : (
              <div className="text-xs text-slate-400 py-3 text-center">
                현재 진행 중인 세션이 없습니다.
              </div>
            )}
          </div>
        ))}

        {/* Preparation Room Status */}
        <div
          className={`border rounded-xl p-4 shadow-2xs transition-all ${
            preparingSlots.length > 0
              ? 'border-amber-400 bg-amber-50/30 ring-1 ring-amber-300'
              : 'border-slate-200 bg-white'
          }`}
        >
          <div className="flex items-center justify-between pb-2 border-b border-slate-200 mb-3">
            <h4 className="font-bold text-slate-900 text-sm">
              {config.prepRoomName || '제1준비실'}
            </h4>
            {preparingSlots.length > 0 ? (
              <span className="text-[11px] font-bold px-2 py-0.5 bg-amber-600 text-white rounded-full">
                과제 검토 및 준비 중 ({preparingSlots.length}명)
              </span>
            ) : (
              <span className="text-[11px] font-medium px-2 py-0.5 bg-slate-100 text-slate-500 rounded-full">
                비어있음
              </span>
            )}
          </div>

          {preparingSlots.length > 0 ? (
            <div className="space-y-2">
              {preparingSlots.map((ps) => (
                <div
                  key={ps.id}
                  className="p-2.5 bg-white border border-amber-200 rounded-lg text-xs"
                >
                  <div className="font-bold text-slate-900 flex items-center justify-between">
                    <span>[{ps.candidateCodes.join(', ')}] {ps.candidateNames.join(', ')}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-100 text-red-800 font-extrabold">
                      {ps.prepRoomName || '검토실'}
                    </span>
                  </div>
                  <div className="text-[11px] text-amber-800 mt-1">
                    과목: <strong>{ps.exerciseName}</strong> (과제검토 진행 중)
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">
                    검토시간: {ps.prepStartTime} ~ {ps.prepEndTime} ➔{' '}
                    {ps.exerciseCode === 'IB'
                      ? '10분 역량평가 대기 후 실습실 입실'
                      : '검토 직후 본 실습실 입실 (대기 없음)'}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-xs text-slate-400 py-3 text-center">
              준비 중인 수험생이 없습니다.
            </div>
          )}
        </div>

        {/* IB Transit / Waiting Status (역량평가 대기석) */}
        <div
          className={`border rounded-xl p-4 shadow-2xs transition-all ${
            transitWaitingSlots.length > 0
              ? 'border-amber-500 bg-amber-50/50 ring-1 ring-amber-300'
              : 'border-slate-200 bg-white'
          }`}
        >
          <div className="flex items-center justify-between pb-2 border-b border-slate-200 mb-3">
            <h4 className="font-bold text-slate-900 text-sm">
              역량평가 대기석 (455실 앞)
            </h4>
            {transitWaitingSlots.length > 0 ? (
              <span className="text-[11px] font-bold px-2 py-0.5 bg-amber-600 text-white rounded-full">
                역량평가 대기 중 ({transitWaitingSlots.length}명)
              </span>
            ) : (
              <span className="text-[11px] font-medium px-2 py-0.5 bg-slate-100 text-slate-500 rounded-full">
                대기 인원 없음
              </span>
            )}
          </div>

          {transitWaitingSlots.length > 0 ? (
            <div className="space-y-2">
              {transitWaitingSlots.map((ts) => (
                <div
                  key={ts.id}
                  className="p-2.5 bg-white border border-amber-300 rounded-lg text-xs"
                >
                  <div className="font-bold text-slate-900 flex items-center justify-between">
                    <span>[{ts.candidateCodes.join(', ')}] {ts.candidateNames.join(', ')}</span>
                    <span className="text-[10px] text-amber-700 font-bold font-mono">
                      {ts.transitStartTime} ~ {ts.transitEndTime} (10분)
                    </span>
                  </div>
                  <div className="text-[11px] text-amber-900 mt-1 font-semibold">
                    {ts.exerciseName} 본 실습 입실 대기 중 (10분 후 실습실 입실)
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-xs text-slate-400 py-3 text-center">
              현재 역량평가 대기 중인 교육생이 없습니다.
            </div>
          )}
        </div>

        {/* 456 Room (Video Watching Status) */}
        <div
          className={`border rounded-xl p-4 shadow-2xs transition-all ${
            videoWatchingSlots.length > 0
              ? 'border-purple-400 bg-purple-50/40 ring-1 ring-purple-300'
              : 'border-slate-200 bg-white'
          }`}
        >
          <div className="flex items-center justify-between pb-2 border-b border-slate-200 mb-3">
            <h4 className="font-bold text-slate-900 text-sm">
              {config.videoRoomName || '456강의실 (실습영상 시청실)'}
            </h4>
            {videoWatchingSlots.length > 0 ? (
              <span className="text-[11px] font-bold px-2 py-0.5 bg-purple-600 text-white rounded-full">
                실습영상 시청 중 ({videoWatchingSlots.length}명)
              </span>
            ) : (
              <span className="text-[11px] font-medium px-2 py-0.5 bg-slate-100 text-slate-500 rounded-full">
                비어있음
              </span>
            )}
          </div>

          {videoWatchingSlots.length > 0 ? (
            <div className="space-y-2">
              {videoWatchingSlots.map((vs) => (
                <div
                  key={vs.id}
                  className="p-2.5 bg-white border border-purple-200 rounded-lg text-xs"
                >
                  <div className="font-bold text-purple-950 flex items-center justify-between">
                    <span>[{vs.candidateCodes.join(', ')}] {vs.candidateNames.join(', ')}</span>
                    <span className="text-[10px] text-purple-600 font-semibold font-mono">
                      {vs.videoStartTime} ~ {vs.videoEndTime}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-600 mt-1">
                    {vs.exerciseName} 실습 녹화영상 시청 및 자가 피드백 중
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-xs text-slate-400 py-3 text-center">
              현재 영상 시청 중인 교육생이 없습니다.
            </div>
          )}
        </div>

        {/* Waiting Room Status */}
        <div className="border border-slate-200 bg-white rounded-xl p-4 shadow-2xs">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200 mb-3">
            <h4 className="font-bold text-slate-900 text-sm">
              {config.waitingRoomName || '수험생 대기실'}
            </h4>
            <span className="text-[11px] font-bold px-2 py-0.5 bg-purple-100 text-purple-800 rounded-full">
              대기 인원: {waitingCandidates.length}명
            </span>
          </div>

          <div className="flex flex-wrap gap-1.5 max-h-40 overflow-y-auto">
            {waitingCandidates.length === 0 ? (
              <div className="text-xs text-slate-400 py-2">대기실 비어있음</div>
            ) : (
              waitingCandidates.map((c) => (
                <span
                  key={c.id}
                  className="text-xs px-2 py-1 bg-slate-100 rounded text-slate-700 font-medium"
                >
                  [{c.code}] {c.name}
                </span>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

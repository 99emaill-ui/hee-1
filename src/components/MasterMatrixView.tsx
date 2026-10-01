import React, { useState } from 'react';
import { Room, TimetableSlot, GeneralConfig } from '../types';
import { Clock, MapPin, Coffee, Users, Layers, Filter } from 'lucide-react';

interface MasterMatrixViewProps {
  slots: TimetableSlot[];
  rooms: Room[];
  config: GeneralConfig;
}

export const MasterMatrixView: React.FC<MasterMatrixViewProps> = ({
  slots,
  rooms,
  config,
}) => {
  const [selectedRoomId, setSelectedRoomId] = useState<string>('ALL');
  const [selectedDay, setSelectedDay] = useState<'ALL' | 1 | 2>('ALL');

  const filteredSlots = slots.filter((s) => {
    const matchesRoom = selectedRoomId === 'ALL' || s.roomId === selectedRoomId || s.roomId === 'room-common';
    const matchesDay = selectedDay === 'ALL' || s.day === selectedDay;
    return matchesRoom && matchesDay;
  });

  const getBadgeColor = (color: string) => {
    switch (color) {
      case 'red':
      case 'blue':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'rose':
        return 'bg-rose-100 text-rose-800 border-rose-200';
      case 'indigo':
        return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'emerald':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'amber':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'purple':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header and Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 no-print">
        <div>
          <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
            <Layers className="w-4 h-4 text-red-600" />
            종합 로테이션 타임테이블 (Master Rotation Matrix)
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            1일차(오전 PT 10:00 / 오후 RP 14:30) 및 2일차(오전 IB 09:30) 4명 연속 순환실습 마스터 시간표입니다.
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Day Filter */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs font-bold">
            <button
              onClick={() => setSelectedDay('ALL')}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                selectedDay === 'ALL'
                  ? 'bg-red-600 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              전체 (1·2일차)
            </button>
            <button
              onClick={() => setSelectedDay(1)}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                selectedDay === 1
                  ? 'bg-red-600 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              1일차 (PT·RP)
            </button>
            <button
              onClick={() => setSelectedDay(2)}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                selectedDay === 2
                  ? 'bg-red-600 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              2일차 (IB)
            </button>
          </div>

          {/* Room Filter */}
          <div className="flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedRoomId}
              onChange={(e) => setSelectedRoomId(e.target.value)}
              className="text-xs font-medium border border-slate-300 rounded-lg px-2.5 py-1.5 bg-white focus:ring-1 focus:ring-red-500 focus:outline-hidden"
            >
              <option value="ALL">전체 평가실</option>
              {rooms.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Main Rotation Matrix Table */}
      <div className="overflow-x-auto border border-slate-200 rounded-xl bg-white shadow-2xs">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200 uppercase tracking-wider">
            <tr>
              <th className="p-3 w-24 text-center">일차 / 구분</th>
              <th className="p-3 w-14 text-center">순번</th>
              <th className="p-3 w-36">과제검토 (분산 검토실)</th>
              <th className="p-3 w-32 text-amber-800 bg-amber-50/50">과제숙지 대기</th>
              <th className="p-3 w-40 text-red-900 bg-red-50/50">역량평가 실습 (455실)</th>
              <th className="p-3 w-40 text-purple-900 bg-purple-50/50">실습영상 시청 (456실)</th>
              <th className="p-3 w-28">평가과목</th>
              <th className="p-3">수험생 (피평가자)</th>
              <th className="p-3 w-32">평가위원</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {filteredSlots.length === 0 ? (
              <tr>
                <td colSpan={9} className="p-8 text-center text-slate-400">
                  표시할 일정이 없습니다. 평가 과목을 활성화하거나 평가실을 확인해 주세요.
                </td>
              </tr>
            ) : (
              filteredSlots.map((s, idx) => {
                const room = rooms.find((r) => r.id === s.roomId);
                const badgeColor = getBadgeColor(s.exerciseColor);

                // Show section divider when exercise changes or day changes
                const prevSlot = filteredSlots[idx - 1];
                const isNewSession = !prevSlot || prevSlot.exerciseCode !== s.exerciseCode || prevSlot.day !== s.day;

                return (
                  <React.Fragment key={s.id}>
                    {isNewSession && (
                      <tr className="bg-slate-800 text-white font-bold no-print">
                        <td colSpan={9} className="px-4 py-2 text-xs">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="px-2 py-0.5 rounded bg-red-600 text-white text-[11px] font-black">
                                {s.day}일차 ({s.date || ''}) {s.sessionPeriod || ''}
                              </span>
                              <span className="text-amber-300 font-extrabold text-sm">
                                {s.exerciseName}
                              </span>
                              <span className="text-slate-300 text-xs font-normal">
                                (1번 실습 시작: {s.evalStartTime} / 4명 연속 실시, 실습종료 10분후 다음실습)
                              </span>
                            </div>
                            <span className="text-[11px] text-slate-400">
                              과제검토 {s.prepStartTime ? '30~50분' : '-'} ➔ 대기 10분 ➔ 실습 ➔ 456실 영상시청
                            </span>
                          </div>
                        </td>
                      </tr>
                    )}
                    <tr className="hover:bg-slate-50 transition-colors">
                      {/* Day & Period badge */}
                      <td className="p-3 text-center">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[11px] font-black ${
                            s.day === 1
                              ? s.sessionPeriod === '오전'
                                ? 'bg-red-50 text-red-700 border border-red-200'
                                : 'bg-rose-50 text-rose-700 border border-rose-200'
                              : 'bg-amber-50 text-amber-800 border border-amber-200'
                          }`}
                        >
                          {s.day}일차 {s.sessionPeriod}
                        </span>
                      </td>

                      {/* Round */}
                      <td className="p-3 text-center font-bold text-slate-700">
                        {s.round}회
                      </td>

                      {/* Preparation info */}
                      <td className="p-3">
                        {s.prepStartTime && s.prepEndTime ? (
                          <div className="p-2 bg-amber-50/70 border border-amber-200 rounded-lg">
                            <div className="font-bold text-slate-900 text-xs flex items-center gap-1 font-mono">
                              <Clock className="w-3 h-3 text-amber-600" />
                              <span>
                                {s.prepStartTime} ~ {s.prepEndTime}
                              </span>
                            </div>
                            <div className="text-[11px] font-extrabold text-red-800 mt-1 flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-red-600 shrink-0" />
                              <span>{s.prepRoomName || config.prepRoomName || '검토실'}</span>
                            </div>
                          </div>
                        ) : (
                          <span className="text-slate-400 text-[11px]">- (사전준비 없음)</span>
                        )}
                      </td>

                      {/* 10 mins Transit / Waiting */}
                      <td className="p-3 bg-amber-50/20">
                        {s.transitStartTime && s.transitEndTime ? (
                          <div className="text-xs">
                            <div className="font-mono font-bold text-amber-900">
                              {s.transitStartTime} ~ {s.transitEndTime}
                            </div>
                            <span className="inline-block mt-0.5 text-[10px] font-semibold text-amber-700 bg-amber-100/80 px-1.5 py-0.5 rounded">
                              이동·대기 10분
                            </span>
                          </div>
                        ) : (
                          <span className="text-slate-400 text-xs">-</span>
                        )}
                      </td>

                      {/* Evaluation in 455강의실 */}
                      <td className="p-3 bg-red-50/20">
                        <div className="font-black text-sm text-red-950 font-mono">
                          {s.evalStartTime} ~ {s.evalEndTime}
                        </div>
                        <div className="text-[11px] font-bold text-emerald-700 mt-0.5 flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-emerald-600 shrink-0" />
                          <span>{s.roomName}</span>
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                          평정/정리: ~{s.gradeEndTime}
                        </div>
                      </td>

                      {/* Video Watching in 456강의실 */}
                      <td className="p-3 bg-purple-50/20">
                        {s.videoStartTime && s.videoEndTime ? (
                          <div className="p-2 bg-purple-50/80 border border-purple-200 rounded-lg">
                            <div className="font-mono font-bold text-purple-950 text-xs flex items-center gap-1">
                              <Clock className="w-3 h-3 text-purple-600" />
                              <span>
                                {s.videoStartTime} ~ {s.videoEndTime}
                              </span>
                            </div>
                            <div className="text-[11px] font-bold text-purple-800 mt-0.5 flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-purple-600 shrink-0" />
                              <span>{s.videoRoomName || '456강의실'}</span>
                            </div>
                          </div>
                        ) : (
                          <span className="text-slate-400 text-xs">-</span>
                        )}
                      </td>

                      {/* Exercise */}
                      <td className="p-3">
                        <span
                          className={`inline-block px-2.5 py-1 rounded-md text-[11px] font-extrabold border ${badgeColor}`}
                        >
                          {s.exerciseCode}
                        </span>
                        <div className="text-slate-700 font-medium text-[11px] mt-0.5">
                          {s.exerciseName.split(' ')[0]}
                        </div>
                      </td>

                      {/* Candidate */}
                      <td className="p-3">
                        <div className="flex flex-wrap gap-1.5 items-center">
                          {s.candidateCodes.map((code, cIdx) => (
                            <div
                              key={cIdx}
                              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg shadow-2xs"
                            >
                              <span className="font-mono font-bold text-red-700 text-xs">
                                [{code}]
                              </span>
                              <span className="font-black text-slate-900 text-xs">
                                {s.candidateNames[cIdx]}
                              </span>
                            </div>
                          ))}
                        </div>
                      </td>

                      {/* Assessors */}
                      <td className="p-3 text-xs text-slate-600">
                        <div className="font-medium text-slate-800">{room?.assessors || '평가위원'}</div>
                        {room?.roleplayer && (
                          <div className="text-[10px] text-emerald-700 mt-0.5">
                            연기자: {room.roleplayer}
                          </div>
                        )}
                      </td>
                    </tr>
                  </React.Fragment>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

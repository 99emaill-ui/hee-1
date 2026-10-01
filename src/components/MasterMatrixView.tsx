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

  const filteredSlots = selectedRoomId === 'ALL'
    ? slots
    : slots.filter((s) => s.roomId === selectedRoomId || s.roomId === 'room-common');

  // Group slots by round or sequence
  const commonSlots = filteredSlots.filter((s) => s.exerciseType === 'COMMON_ALL');
  const groupSlots = filteredSlots.filter((s) => s.exerciseType === 'GROUP');
  const individualSlots = filteredSlots.filter((s) => s.exerciseType === 'INDIVIDUAL');

  const getBadgeColor = (color: string) => {
    switch (color) {
      case 'red':
      case 'blue':
        return 'bg-red-100 text-red-800 border-red-200';
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
            평가실별 입실 시간, 사전 준비 시간 및 채점 시간이 일목요연하게 정리된 마스터 배치표입니다.
          </p>
        </div>

        {/* Room Filter */}
        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-xs font-semibold text-slate-600">평가실 필터:</span>
          <select
            value={selectedRoomId}
            onChange={(e) => setSelectedRoomId(e.target.value)}
            className="text-xs font-medium border border-slate-300 rounded-lg px-2.5 py-1.5 bg-white focus:ring-1 focus:ring-red-500 focus:outline-hidden"
          >
            <option value="ALL">전체 평가실 보기</option>
            {rooms.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Common Bulk Exercises (e.g. IB) */}
      {commonSlots.length > 0 && (
        <div className="bg-indigo-50/50 border border-indigo-200 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-600"></span>
            <h4 className="text-xs font-bold text-indigo-950 uppercase tracking-wider">
              일괄 동시 진행 과목 (서류함기법 / 기획과제 작성)
            </h4>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {commonSlots.map((s) => (
              <div
                key={s.id}
                className="bg-white border border-indigo-200 rounded-lg p-3.5 shadow-2xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                      {s.exerciseCode} {s.exerciseName}
                    </span>
                    <span className="text-xs font-bold text-slate-900 font-mono">
                      {s.evalStartTime} ~ {s.evalEndTime}
                    </span>
                  </div>
                  <div className="mt-2 text-xs text-slate-600 flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>장소: {s.roomName}</span>
                  </div>
                </div>
                <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span>대상: 전원 동시 참여 ({s.candidateNames.length}명)</span>
                  <span className="text-[11px] text-indigo-600 font-medium">
                    채점 및 정리: ~{s.gradeEndTime}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Lunch Indicator Banner */}
      {config.hasLunch && (
        <div className="px-4 py-2.5 bg-amber-50/70 border border-amber-200 rounded-xl flex items-center justify-between text-xs text-amber-900">
          <div className="flex items-center gap-2">
            <Coffee className="w-4 h-4 text-amber-600" />
            <span className="font-bold">중식 및 휴식 시간:</span>
            <span>
              {config.lunchStartTime} ~{' '}
              {(() => {
                const [h, m] = config.lunchStartTime.split(':').map(Number);
                const total = h * 60 + m + config.lunchDurationMinutes;
                const eh = Math.floor(total / 60) % 24;
                const em = total % 60;
                return `${String(eh).padStart(2, '0')}:${String(em).padStart(2, '0')}`;
              })()}
              ({config.lunchDurationMinutes}분간 진행)
            </span>
          </div>
          <span className="text-[11px] text-amber-700 font-medium hidden sm:inline">
            모든 평가실 및 준비실 세션 일시 중단
          </span>
        </div>
      )}

      {/* Main Rotation Matrix Table */}
      <div className="overflow-x-auto border border-slate-200 rounded-xl bg-white shadow-2xs">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200 uppercase tracking-wider">
            <tr>
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
                <td colSpan={8} className="p-8 text-center text-slate-400">
                  표시할 일정이 없습니다. 평가 과목을 활성화하거나 평가실을 확인해 주세요.
                </td>
              </tr>
            ) : (
              filteredSlots.map((s) => {
                const room = rooms.find((r) => r.id === s.roomId);
                const badgeColor = getBadgeColor(s.exerciseColor);

                return (
                  <tr key={s.id} className="hover:bg-slate-50 transition-colors">
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
                        채점마감: ~{s.gradeEndTime}
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
                        {s.candidateCodes.map((code, idx) => (
                          <div
                            key={idx}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg shadow-2xs"
                          >
                            <span className="font-mono font-bold text-red-700 text-xs">
                              [{code}]
                            </span>
                            <span className="font-black text-slate-900 text-xs">
                              {s.candidateNames[idx]}
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
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

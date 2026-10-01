import React, { useState } from 'react';
import { Room, TimetableSlot, Candidate } from '../types';
import { ClipboardList, DoorOpen, CheckSquare, Printer } from 'lucide-react';

interface AssessorSheetViewProps {
  rooms: Room[];
  slots: TimetableSlot[];
  candidates: Candidate[];
}

export const AssessorSheetView: React.FC<AssessorSheetViewProps> = ({
  rooms,
  slots,
  candidates,
}) => {
  const [selectedRoomId, setSelectedRoomId] = useState<string>(rooms[0]?.id || '');
  const [selectedDay, setSelectedDay] = useState<'ALL' | 1 | 2>('ALL');

  const activeRoom = rooms.find((r) => r.id === selectedRoomId) || rooms[0];
  const roomSlots = slots.filter((s) => {
    const matchesRoom = s.roomId === activeRoom?.id;
    const matchesDay = selectedDay === 'ALL' || s.day === selectedDay;
    return matchesRoom && matchesDay;
  });

  return (
    <div className="space-y-6">
      {/* Header and selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 no-print">
        <div>
          <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
            <ClipboardList className="w-4 h-4 text-emerald-600" />
            평가실별 진행표 (평가위원 배포용)
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            각 평가실 책상에 비치하여 평가위원이 차수별 수험생 정보 및 채점 진행 상황을 체크하는 양식입니다.
          </p>
        </div>

        {/* Room Tab & Day Filter Selector */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Day Filter */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs font-bold">
            <button
              onClick={() => setSelectedDay('ALL')}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                selectedDay === 'ALL'
                  ? 'bg-emerald-600 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              전체
            </button>
            <button
              onClick={() => setSelectedDay(1)}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                selectedDay === 1
                  ? 'bg-emerald-600 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              1일차 (PT·RP)
            </button>
            <button
              onClick={() => setSelectedDay(2)}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                selectedDay === 2
                  ? 'bg-emerald-600 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              2일차 (IB)
            </button>
          </div>

          {rooms.map((room) => (
            <button
              key={room.id}
              onClick={() => setSelectedRoomId(room.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                selectedRoomId === room.id
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              {room.name}
            </button>
          ))}
        </div>
      </div>

      {activeRoom && (
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-4">
          {/* Room Profile Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 gap-3">
            <div>
              <span className="text-xs font-semibold px-2 py-0.5 bg-emerald-50 text-emerald-800 rounded border border-emerald-200">
                평가실 전용 시트
              </span>
              <h4 className="text-lg font-bold text-slate-900 mt-1">{activeRoom.name}</h4>
              <p className="text-xs text-slate-500 mt-0.5">
                평가위원: <strong className="text-slate-800">{activeRoom.assessors || '미지정'}</strong>
                {activeRoom.roleplayer && (
                  <>
                    {' '}| 롤플레이어: <strong className="text-emerald-700">{activeRoom.roleplayer}</strong>
                  </>
                )}
              </p>
            </div>
            <div className="text-right text-xs text-slate-500 hidden sm:block">
              <div>총 배정 세션: <strong className="text-slate-800">{roomSlots.length}회</strong></div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto border border-slate-200 rounded-lg">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                <tr>
                  <th className="p-3 w-14 text-center">차수</th>
                  <th className="p-3 w-36">평가 시간</th>
                  <th className="p-3 w-28">채점 마감</th>
                  <th className="p-3 w-28 text-center">수험번호</th>
                  <th className="p-3 w-32">피평가자 성명</th>
                  <th className="p-3">소속 / 직급</th>
                  <th className="p-3 w-28 text-center">평가 진행</th>
                  <th className="p-3 w-28 text-center">평정표 제출</th>
                  <th className="p-3 w-36">특이사항 메모</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {roomSlots.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="p-6 text-center text-slate-400">
                      해당 평가실에 배정된 개별 평가 일정이 없습니다.
                    </td>
                  </tr>
                ) : (
                  roomSlots.map((s, idx) => {
                    const prevSlot = roomSlots[idx - 1];
                    const isNewSession = !prevSlot || prevSlot.exerciseCode !== s.exerciseCode || prevSlot.day !== s.day;
                    const candCodes = s.candidateCodes.join(', ');
                    const candNames = s.candidateNames.join(', ');
                    const candDepts = s.candidateIds
                      .map((id) => candidates.find((c) => c.id === id)?.department || '-')
                      .join(', ');

                    return (
                      <React.Fragment key={s.id}>
                        {isNewSession && (
                          <tr className="bg-slate-800 text-white font-bold">
                            <td colSpan={9} className="px-4 py-2 text-xs">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <span className="px-2 py-0.5 rounded bg-emerald-600 text-white text-[11px] font-black">
                                    {s.day}일차 {s.sessionPeriod}
                                  </span>
                                  <span className="text-amber-300 font-extrabold text-xs">
                                    {s.exerciseName}
                                  </span>
                                </div>
                                <span className="text-[11px] text-slate-300">
                                  1번 실습: {s.evalStartTime} 시작 / 4명 연속 실시 (실습종료 10분후 다음실습)
                                </span>
                              </div>
                            </td>
                          </tr>
                        )}
                        <tr className="hover:bg-slate-50">
                          <td className="p-3 text-center font-bold text-slate-700">
                            {s.round}차
                          </td>
                          <td className="p-3 font-mono font-bold text-slate-900 text-xs">
                            {s.evalStartTime} ~ {s.evalEndTime}
                          </td>
                          <td className="p-3 font-mono text-slate-500 text-xs">
                            ~ {s.gradeEndTime}
                          </td>
                          <td className="p-3 text-center">
                            <span className="font-mono font-black text-red-700 bg-red-50 px-2 py-0.5 rounded border border-red-200">
                              {candCodes}
                            </span>
                          </td>
                          <td className="p-3 font-bold text-slate-900">
                            {candNames}
                          </td>
                          <td className="p-3 text-slate-600">
                            {candDepts}
                          </td>
                          <td className="p-3 text-center">
                            <input
                              type="checkbox"
                              className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500 cursor-pointer"
                            />
                          </td>
                          <td className="p-3 text-center">
                            <input
                              type="checkbox"
                              className="w-4 h-4 text-red-600 rounded border-slate-300 focus:ring-red-500 cursor-pointer"
                            />
                          </td>
                          <td className="p-3">
                            <div className="h-6 border-b border-dotted border-slate-300"></div>
                          </td>
                        </tr>
                      </React.Fragment>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          <div className="pt-2 flex justify-between items-center text-[11px] text-slate-400">
            <span>※ 평정표 작성이 완료되면 운영본부(상황실)로 즉시 제출해 주시기 바랍니다.</span>
            <span>평가위원 서명: ________________ (인)</span>
          </div>
        </div>
      )}
    </div>
  );
};

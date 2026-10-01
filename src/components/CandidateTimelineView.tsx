import React, { useState } from 'react';
import { CandidateSchedule, Candidate } from '../types';
import { User, Clock, MapPin, CheckCircle, Printer, Filter } from 'lucide-react';

interface CandidateTimelineViewProps {
  schedules: CandidateSchedule[];
  candidates: Candidate[];
}

export const CandidateTimelineView: React.FC<CandidateTimelineViewProps> = ({
  schedules,
  candidates,
}) => {
  const [selectedCandidateId, setSelectedCandidateId] = useState<string>('ALL');

  const filteredSchedules = selectedCandidateId === 'ALL'
    ? schedules
    : schedules.filter((cs) => cs.candidate.id === selectedCandidateId);

  const getActivityBadge = (type: string) => {
    switch (type) {
      case 'PREP':
        return 'bg-red-100 text-red-900 border-red-300 font-bold';
      case 'TRANSIT':
        return 'bg-amber-100 text-amber-900 border-amber-300 font-bold';
      case 'EVAL':
        return 'bg-emerald-100 text-emerald-950 border-emerald-300 font-black';
      case 'VIDEO':
        return 'bg-purple-100 text-purple-950 border-purple-300 font-extrabold';
      case 'LUNCH':
        return 'bg-slate-100 text-slate-700 border-slate-300 font-medium';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 no-print">
        <div>
          <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
            <User className="w-4 h-4 text-purple-600" />
            피평가자(수험생)별 개인 동선표
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            수험생 1인당 하루 전체 이동 동선(대기실 → 준비실 → 평가실 → 중식)을 안내용 수험표 형태로 제공합니다.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-xs font-semibold text-slate-600">수험생 선택:</span>
          <select
            value={selectedCandidateId}
            onChange={(e) => setSelectedCandidateId(e.target.value)}
            className="text-xs font-medium border border-slate-300 rounded-lg px-2.5 py-1.5 bg-white focus:ring-1 focus:ring-red-500 focus:outline-hidden"
          >
            <option value="ALL">전체 수험생 보기 ({schedules.length}명)</option>
            {candidates.map((c) => (
              <option key={c.id} value={c.id}>
                [{c.code}] {c.name} {c.department ? `(${c.department})` : ''}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Grid of Candidate Schedules */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredSchedules.map(({ candidate, items }) => (
          <div
            key={candidate.id}
            className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs print-break-inside-avoid"
          >
            {/* Candidate Header */}
            <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-3">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-black px-2 py-0.5 bg-purple-100 text-purple-800 rounded border border-purple-200">
                  {candidate.code}
                </span>
                <span className="text-base font-bold text-slate-900">{candidate.name}</span>
                {candidate.department && (
                  <span className="text-xs text-slate-500">({candidate.department})</span>
                )}
              </div>
              <span className="text-[11px] text-slate-400 font-medium">수험생 동선표</span>
            </div>

            {/* Timeline Steps */}
            <div className="space-y-2.5">
              {items.length === 0 ? (
                <div className="text-xs text-slate-400 p-4 text-center">
                  배정된 일정이 없습니다.
                </div>
              ) : (
                items.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-lg border border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                  >
                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="font-mono text-xs font-bold text-slate-900">
                        {item.timeStr}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded border uppercase ${getActivityBadge(
                          item.type
                        )}`}
                      >
                        {item.type === 'PREP'
                          ? '과제검토'
                          : item.type === 'TRANSIT'
                          ? '이동·대기'
                          : item.type === 'EVAL'
                          ? '본실습'
                          : item.type === 'VIDEO'
                          ? '영상시청'
                          : item.type === 'LUNCH'
                          ? '중식'
                          : '진행'}
                      </span>
                      <span className="text-xs font-semibold text-slate-800">
                        {item.exerciseName}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 text-[11px] text-slate-500">
                      <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                      <span className="font-medium">{item.location}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

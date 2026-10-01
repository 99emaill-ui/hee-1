import React from 'react';
import {
  Users,
  DoorOpen,
  BookOpen,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Layers,
} from 'lucide-react';
import { GeneratedScheduleResult } from '../types';
import { parseMinutes, formatMinutes } from '../utils/timeUtils';

interface SummaryBarProps {
  schedule: GeneratedScheduleResult;
  candidateCount: number;
  roomCount: number;
  activeExerciseCount: number;
}

export const SummaryBar: React.FC<SummaryBarProps> = ({
  schedule,
  candidateCount,
  roomCount,
  activeExerciseCount,
}) => {
  const isMultiDay = schedule.overallEndTime.includes('1일차') || schedule.overallEndTime.includes('/');
  const startM = parseMinutes(schedule.overallStartTime);
  const endM = parseMinutes(schedule.overallEndTime);
  const diffM = Math.max(0, endM - startM);
  const hours = Math.floor(diffM / 60);
  const mins = diffM % 60;

  return (
    <div className="space-y-3">
      {/* Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-red-50 text-red-600 flex items-center justify-center shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-slate-500 block">피평가자 인원</span>
            <span className="text-lg font-black text-slate-900">{candidateCount}명</span>
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <DoorOpen className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-slate-500 block">운영 평가실</span>
            <span className="text-lg font-black text-slate-900">{roomCount}개실</span>
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-slate-500 block">평가 과목 수</span>
            <span className="text-lg font-black text-slate-900">{activeExerciseCount}개 과목</span>
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-slate-500 block">총 로테이션 차수</span>
            <span className="text-lg font-black text-slate-900">{schedule.totalRounds || 1}차수</span>
          </div>
        </div>

        <div className="col-span-2 sm:col-span-1 bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-slate-500 block">예상 운영 시간</span>
            <div className="text-xs font-black text-slate-900 leading-tight">
              {schedule.overallEndTime.includes('/') ? (
                <div className="space-y-0.5">
                  <span className="text-red-700 font-bold block">{schedule.overallEndTime}</span>
                </div>
              ) : (
                <span>{schedule.overallStartTime} ~ {schedule.overallEndTime}</span>
              )}
            </div>
            <span className="text-[10px] text-slate-500 font-medium">
              {isMultiDay ? '1일차(PT·RP) / 2일차(IB) 연계' : `총 ${hours}시간 ${mins > 0 ? `${mins}분` : ''}`}
            </span>
          </div>
        </div>
      </div>

      {/* Conflict / Integrity Indicator */}
      {schedule.conflicts.length > 0 ? (
        <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-800 flex items-start gap-2.5 animate-in fade-in">
          <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
          <div>
            <strong className="font-bold text-red-900">
              일정 충돌 {schedule.conflicts.length}건 감지됨:
            </strong>
            <ul className="mt-1 list-disc list-inside space-y-0.5 text-red-700">
              {schedule.conflicts.slice(0, 3).map((c, i) => (
                <li key={i}>{c.description}</li>
              ))}
              {schedule.conflicts.length > 3 && (
                <li>외 {schedule.conflicts.length - 3}건의 충돌이 더 있습니다.</li>
              )}
            </ul>
          </div>
        </div>
      ) : (
        <div className="px-4 py-2 bg-emerald-50/80 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span className="font-semibold">
              동선 검증 완료: 피평가자 중복 배정이나 동선 충돌 없이 무결하게 설계되었습니다.
            </span>
          </div>
          <span className="text-[11px] font-mono font-medium text-emerald-600 hidden sm:inline">
            Zero Overlap Guaranteed
          </span>
        </div>
      )}
    </div>
  );
};

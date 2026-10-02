import React, { useState } from 'react';
import { CandidateSchedule, Candidate, GeneralConfig } from '../types';
import {
  User,
  Clock,
  MapPin,
  Printer,
  Filter,
  Edit3,
  Calendar,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet,
  Award,
  Layers,
  Sparkles,
} from 'lucide-react';

interface CandidateTimelineViewProps {
  schedules: CandidateSchedule[];
  candidates: Candidate[];
  config?: GeneralConfig;
  onUpdateCandidate?: (candidateId: string, field: keyof Candidate, value: string) => void;
}

export const CandidateTimelineView: React.FC<CandidateTimelineViewProps> = ({
  schedules,
  candidates,
  config,
  onUpdateCandidate,
}) => {
  const [selectedCandidateId, setSelectedCandidateId] = useState<string>('ALL');
  const [viewMode, setViewMode] = useState<'TABLE' | 'CARD'>('TABLE');
  const [isEditMode, setIsEditMode] = useState<boolean>(false);

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

  const handlePrintIndividual = (candId: string) => {
    const prevId = selectedCandidateId;
    setSelectedCandidateId(candId);
    setTimeout(() => {
      window.print();
      setSelectedCandidateId(prevId);
    }, 150);
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Actions (Hidden during Print) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 no-print">
        <div>
          <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
            <User className="w-5 h-5 text-red-600" />
            수험생(피평가자) 개인별 타임테이블 (Personal AC Timetable)
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            수험생 1인당 1일차(오전 PT 20분 실습 · 오후 RP 30분 실습) 및 2일차(오전 IB 20분 실습) 전체 이동 동선 및 수험 시간표를 제공합니다.
          </p>
        </div>

        {/* View Mode & Candidate Filter */}
        <div className="flex flex-wrap items-center gap-2">
          {/* View Mode Switcher */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs font-bold">
            <button
              type="button"
              onClick={() => setViewMode('TABLE')}
              className={`px-3 py-1.5 rounded-md transition-colors flex items-center gap-1 ${
                viewMode === 'TABLE'
                  ? 'bg-red-600 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>표(Table) 형식</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('CARD')}
              className={`px-3 py-1.5 rounded-md transition-colors flex items-center gap-1 ${
                viewMode === 'CARD'
                  ? 'bg-red-600 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>카드(Card) 형식</span>
            </button>
          </div>

          {/* Quick Edit Mode Toggle */}
          <button
            type="button"
            onClick={() => setIsEditMode(!isEditMode)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 border transition-colors ${
              isEditMode
                ? 'bg-amber-100 border-amber-300 text-amber-900'
                : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
            }`}
          >
            <Edit3 className="w-3.5 h-3.5 text-amber-600" />
            <span>{isEditMode ? '편집 완료' : '성명 직접 수정'}</span>
          </button>

          {/* Candidate Filter */}
          <div className="flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedCandidateId}
              onChange={(e) => setSelectedCandidateId(e.target.value)}
              className="text-xs font-bold border border-slate-300 rounded-lg px-2.5 py-1.5 bg-white focus:ring-1 focus:ring-red-500 focus:outline-hidden"
            >
              <option value="ALL">전체 수험생 ({schedules.length}명 모두 보기)</option>
              {candidates.map((c) => (
                <option key={c.id} value={c.id}>
                  [{c.code}] {c.name} {c.department ? `(${c.department})` : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Print All */}
          <button
            type="button"
            onClick={() => window.print()}
            className="flex items-center gap-1 px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-bold transition-colors shadow-2xs"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>수험표 인쇄</span>
          </button>
        </div>
      </div>

      {/* Quick Candidate Name Edit Bar (Visible when isEditMode is true or anytime user wants) */}
      {isEditMode && onUpdateCandidate && (
        <div className="p-3.5 bg-amber-50/90 border border-amber-200 rounded-xl space-y-2 no-print animate-in fade-in duration-150">
          <div className="flex items-center justify-between">
            <span className="font-extrabold text-amber-950 text-xs flex items-center gap-1.5">
              <Edit3 className="w-4 h-4 text-amber-700" />
              수험생(피평가자) 성명 및 소속 즉시 변경
            </span>
            <span className="text-[11px] text-amber-800">
              이름을 수정하면 종합시간표 및 모든 수험표에 실시간으로 즉시 반영됩니다.
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 pt-1">
            {candidates.map((cand, idx) => (
              <div
                key={cand.id}
                className="bg-white p-2 rounded-lg border border-amber-300 shadow-2xs space-y-1"
              >
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-mono font-black text-red-700 bg-red-50 px-1.5 py-0.5 rounded border border-red-200">
                    {cand.code}
                  </span>
                  <span className="text-slate-400 font-semibold">{idx + 1}번 교육생</span>
                </div>
                <div className="space-y-1">
                  <input
                    type="text"
                    value={cand.name}
                    onChange={(e) => onUpdateCandidate(cand.id, 'name', e.target.value)}
                    placeholder="성명"
                    className="w-full text-xs font-bold text-slate-900 border border-slate-300 rounded px-2 py-1 focus:ring-1 focus:ring-red-500 bg-white"
                  />
                  <input
                    type="text"
                    value={cand.department || ''}
                    onChange={(e) => onUpdateCandidate(cand.id, 'department', e.target.value)}
                    placeholder="소속부서 / 직급"
                    className="w-full text-[11px] text-slate-600 border border-slate-200 rounded px-2 py-0.5 bg-white"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Content: Personal Timetables List */}
      <div className="space-y-8">
        {filteredSchedules.map(({ candidate, items }, cIdx) => {
          const candidatePrepRoom =
            candidate.prepRoom ||
            (config?.candidatePrepRooms && config.candidatePrepRooms[cIdx + 1]) ||
            '지정 과제검토실';

          return (
            <div
              key={candidate.id}
              className="bg-white border-2 border-slate-200 rounded-2xl shadow-xs overflow-hidden print-page-break print:border-none print:shadow-none"
            >
              {/* Official Examination Slip Header */}
              <div className="bg-slate-900 text-white p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded bg-red-600 text-white text-xs font-black">
                      {config?.cohort ? `제${config.cohort}기` : '역량평가'}
                    </span>
                    <span className="text-xs font-medium text-slate-300">
                      개인별 수험 타임테이블 (Admission & Examination Schedule)
                    </span>
                  </div>
                  <h4 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
                    <span>{config?.title || '2026년도 4급 보직후보자 역량평가 실습표'}</span>
                  </h4>
                </div>

                <div className="flex items-center gap-2 no-print self-end md:self-center">
                  <button
                    type="button"
                    onClick={() => handlePrintIndividual(candidate.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-900 rounded-lg text-xs font-bold transition-colors shadow-xs"
                    title="이 수험생의 타임테이블만 A4로 단독 인쇄"
                  >
                    <Printer className="w-3.5 h-3.5 text-red-600" />
                    <span>이 수험표만 인쇄</span>
                  </button>
                </div>
              </div>

              {/* Candidate Info Profile Card */}
              <div className="bg-slate-50 border-b border-slate-200 p-4 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 text-xs">
                <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                  <span className="text-[11px] font-semibold text-slate-500 block">수험번호</span>
                  {isEditMode && onUpdateCandidate ? (
                    <input
                      type="text"
                      value={candidate.code}
                      onChange={(e) => onUpdateCandidate(candidate.id, 'code', e.target.value)}
                      className="w-full font-mono text-sm font-black text-red-700 border border-slate-300 rounded px-1.5 py-0.5 bg-white"
                    />
                  ) : (
                    <span className="font-mono text-base font-black text-red-700 block">
                      {candidate.code}
                    </span>
                  )}
                </div>

                <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                  <span className="text-[11px] font-semibold text-slate-500 block">피평가자 성명</span>
                  {isEditMode && onUpdateCandidate ? (
                    <input
                      type="text"
                      value={candidate.name}
                      onChange={(e) => onUpdateCandidate(candidate.id, 'name', e.target.value)}
                      className="w-full text-sm font-black text-slate-900 border border-slate-300 rounded px-1.5 py-0.5 bg-white"
                    />
                  ) : (
                    <span className="text-base font-black text-slate-900 block">
                      {candidate.name}
                    </span>
                  )}
                </div>

                <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                  <span className="text-[11px] font-semibold text-slate-500 block">소속 / 직급</span>
                  {isEditMode && onUpdateCandidate ? (
                    <input
                      type="text"
                      value={candidate.department || ''}
                      onChange={(e) => onUpdateCandidate(candidate.id, 'department', e.target.value)}
                      placeholder="부서 입력"
                      className="w-full text-xs font-semibold text-slate-700 border border-slate-300 rounded px-1.5 py-0.5 bg-white"
                    />
                  ) : (
                    <span className="text-sm font-semibold text-slate-700 block truncate">
                      {candidate.department || '보직후보자'}
                    </span>
                  )}
                </div>

                <div className="p-2.5 bg-white rounded-lg border border-amber-200 bg-amber-50/40">
                  <span className="text-[11px] font-bold text-amber-800 block">지정 과제검토실</span>
                  <span className="text-xs font-black text-amber-900 block truncate mt-0.5">
                    {candidatePrepRoom}
                  </span>
                </div>

                <div className="p-2.5 bg-white rounded-lg border border-red-200 bg-red-50/30">
                  <span className="text-[11px] font-bold text-red-800 block">본 평가실습실</span>
                  <span className="text-xs font-black text-red-950 block truncate mt-0.5">
                    {config?.evalRoomName || '455강의실'}
                  </span>
                </div>

                <div className="p-2.5 bg-white rounded-lg border border-purple-200 bg-purple-50/30">
                  <span className="text-[11px] font-bold text-purple-800 block">실습영상 시청실</span>
                  <span className="text-xs font-black text-purple-950 block truncate mt-0.5">
                    {config?.videoRoomName || '456강의실'}
                  </span>
                </div>
              </div>

              {/* View Format 1: Official Table Format */}
              {viewMode === 'TABLE' ? (
                <div className="p-5 space-y-6">
                  {[1, 2].map((dayNum) => {
                    const dayItems = items.filter((it) => it.day === dayNum);
                    if (dayItems.length === 0) return null;
                    const dayDate = dayItems[0]?.date || (dayNum === 1 ? config?.startDate : config?.endDate);

                    return (
                      <div key={dayNum} className="space-y-2">
                        {/* Day Banner */}
                        <div className="flex items-center justify-between bg-slate-100 px-3.5 py-2 rounded-lg border border-slate-200">
                          <span className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-red-600 inline-block"></span>
                            {dayNum}일차 실습 시간표 {dayDate ? `(${dayDate})` : ''}
                          </span>
                          <span className="text-xs font-bold text-red-700 bg-red-50 border border-red-200 px-2 py-0.5 rounded">
                            {dayNum === 1
                              ? '오전 PT(개별발표 20분) + 오후 RP(역할수행 30분)'
                              : '오전 IB(서류함기법 20분 실습)'}
                          </span>
                        </div>

                        {/* Timetable Table */}
                        <div className="overflow-x-auto border border-slate-200 rounded-lg">
                          <table className="w-full text-left text-xs">
                            <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                              <tr>
                                <th className="p-2.5 w-16 text-center">구분</th>
                                <th className="p-2.5 w-36">시간대 (시작~종료)</th>
                                <th className="p-2.5 w-24 text-center">단계/소요시간</th>
                                <th className="p-2.5 w-48">배정 장소 (강의실)</th>
                                <th className="p-2.5">활동 내용 및 수험생 행동요령</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                              {dayItems.map((item, idx) => (
                                <tr
                                  key={idx}
                                  className={`hover:bg-slate-50/70 ${
                                    item.type === 'EVAL'
                                      ? 'bg-red-50/20'
                                      : item.type === 'VIDEO'
                                      ? 'bg-purple-50/20'
                                      : item.type === 'PREP'
                                      ? 'bg-amber-50/15'
                                      : ''
                                  }`}
                                >
                                  {/* Activity Category Badge */}
                                  <td className="p-2.5 text-center">
                                    <span
                                      className={`inline-block text-[11px] px-2 py-0.5 rounded border uppercase ${getActivityBadge(
                                        item.type
                                      )}`}
                                    >
                                      {item.type === 'PREP'
                                        ? '과제검토'
                                        : item.type === 'TRANSIT'
                                        ? '이동·대기'
                                        : item.type === 'EVAL'
                                        ? '본 실습'
                                        : item.type === 'VIDEO'
                                        ? '영상시청'
                                        : item.type === 'LUNCH'
                                        ? '중식'
                                        : '진행'}
                                    </span>
                                  </td>

                                  {/* Time Range */}
                                  <td className="p-2.5 font-mono font-bold text-slate-900 text-xs">
                                    {item.timeStr}
                                  </td>

                                  {/* Duration */}
                                  <td className="p-2.5 text-center font-bold text-slate-600">
                                    {item.type === 'PREP'
                                      ? item.exerciseCode === 'IB'
                                        ? '50분 검토'
                                        : '30분 검토'
                                      : item.type === 'TRANSIT'
                                      ? '10분 대기'
                                      : item.type === 'EVAL'
                                      ? item.exerciseCode === 'PT'
                                        ? '20분 실습'
                                        : item.exerciseCode === 'RP'
                                        ? '30분 실습'
                                        : '20분 실습'
                                      : item.type === 'VIDEO'
                                      ? '40분 시청'
                                      : item.type === 'LUNCH'
                                      ? '60분 휴식'
                                      : '-'}
                                  </td>

                                  {/* Location */}
                                  <td className="p-2.5 font-bold text-slate-800 flex items-center gap-1">
                                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                    <span>{item.location}</span>
                                  </td>

                                  {/* Description & Action guideline */}
                                  <td className="p-2.5 text-slate-700">
                                    <div className="font-semibold text-slate-900">
                                      {item.exerciseName}
                                      {item.type === 'EVAL' && (
                                        <span className="ml-1.5 text-red-600 font-extrabold text-[11px]">
                                          ★ 본 실습실 입실 및 평가위원 평가
                                        </span>
                                      )}
                                    </div>
                                    <div className="text-[11px] text-slate-500 mt-0.5">
                                      {item.type === 'PREP' &&
                                        '지정된 검토실에서 과제문서 검토 및 발표/역할수행 메모 작성'}
                                      {item.type === 'TRANSIT' &&
                                        '진행요원 안내에 따라 실습실(455실) 앞 이동 및 10분간 대기'}
                                      {item.type === 'EVAL' &&
                                        `${item.exerciseName} 본 실습 실시 (수석평가위원 2인 평정)`}
                                      {item.type === 'VIDEO' &&
                                        '실습영상 시청실(456실)로 즉시 이동하여 녹화 영상 시청 및 자가 점검'}
                                      {item.type === 'LUNCH' &&
                                        '식당 및 휴게실 이동 (중식 및 공식 휴식)'}
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    );
                  })}

                  {/* Exam Guidelines Box */}
                  <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1.5 text-slate-700 print-break-inside-avoid">
                    <div className="font-bold text-slate-900 flex items-center gap-1.5 text-xs">
                      <AlertCircle className="w-4 h-4 text-red-600" />
                      <span>수험생 필수 행동요령 및 유의사항</span>
                    </div>
                    <ul className="list-disc list-inside space-y-0.5 text-[11px] text-slate-600 pl-1">
                      <li>수험생은 본인의 과제검토 시작 시각 <strong>10분 전까지</strong> 지정된 과제검토실에 입실을 완료해 주시기 바랍니다.</li>
                      <li>과제검토 종료 안내음이 울리면 즉시 필기를 멈추고, 시험 진행요원의 안내에 따라 본 실습실로 이동하여 <strong>10분간 대기 후 실습</strong>에 임합니다.</li>
                      <li>평가실습(PT 20분, RP 30분, <strong>IB 20분</strong>)이 종료된 후에는 진행요원의 안내에 따라 <strong>실습영상 시청실(456실 등)</strong>로 이동하여 녹화 영상을 시청합니다.</li>
                      <li>모든 평가가 종료될 때까지 휴대전화 등 전자기기 사용 및 타 수험생과의 과제 내용 공유는 엄격히 금지됩니다.</li>
                    </ul>
                  </div>
                </div>
              ) : (
                /* View Format 2: Timeline Cards Format */
                <div className="p-5 space-y-5">
                  {[1, 2].map((dayNum) => {
                    const dayItems = items.filter((it) => it.day === dayNum);
                    if (dayItems.length === 0) return null;
                    const dayDate = dayItems[0]?.date || (dayNum === 1 ? config?.startDate : config?.endDate);

                    return (
                      <div key={dayNum} className="space-y-2.5">
                        <div className="flex items-center justify-between px-3 py-1.5 bg-slate-100 rounded-lg border border-slate-200">
                          <span className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-red-600 inline-block"></span>
                            {dayNum}일차 {dayDate ? `(${dayDate})` : ''}
                          </span>
                          <span className="text-[11px] font-bold text-red-700">
                            {dayNum === 1 ? '오전 PT(발표 20분) + 오후 RP(역할 30분)' : '오전 IB(서류함 20분 실습)'}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                          {dayItems.map((item, idx) => (
                            <div
                              key={idx}
                              className={`p-3 rounded-xl border flex flex-col justify-between gap-2 transition-all ${
                                item.type === 'EVAL'
                                  ? 'border-emerald-300 bg-emerald-50/30 ring-1 ring-emerald-200'
                                  : item.type === 'VIDEO'
                                  ? 'border-purple-300 bg-purple-50/30'
                                  : item.type === 'PREP'
                                  ? 'border-red-200 bg-red-50/20'
                                  : 'border-slate-200 bg-white'
                              }`}
                            >
                              <div className="flex items-center justify-between">
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
                                    ? '본 실습'
                                    : item.type === 'VIDEO'
                                    ? '영상시청'
                                    : item.type === 'LUNCH'
                                    ? '중식'
                                    : '진행'}
                                </span>
                                <span className="font-mono text-xs font-bold text-slate-900">
                                  {item.timeStr}
                                </span>
                              </div>

                              <div>
                                <span className="font-bold text-sm text-slate-900 block">
                                  {item.exerciseName}
                                </span>
                                <span className="text-[11px] text-slate-500 mt-0.5 block">
                                  {item.activity}
                                </span>
                              </div>

                              <div className="flex items-center gap-1 text-[11px] font-medium text-slate-600 pt-1 border-t border-slate-100">
                                <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                <span>{item.location}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

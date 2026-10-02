import React, { useState } from 'react';
import {
  Settings,
  BookOpen,
  DoorOpen,
  Users,
  Plus,
  Trash2,
  Clock,
  Coffee,
  MapPin,
  ChevronDown,
  ChevronUp,
  UserPlus,
  Check,
  Sparkles,
  Layers,
  Edit3,
} from 'lucide-react';
import { GeneralConfig, Exercise, Room, Candidate, ExerciseType } from '../types';
import { CLASSROOM_PRESETS, COHORT_CANDIDATE_SAMPLES, ClassroomPreset } from '../utils/presets';

interface ConfigPanelProps {
  config: GeneralConfig;
  onChangeConfig: (newConfig: GeneralConfig) => void;
  exercises: Exercise[];
  onChangeExercises: (exercises: Exercise[]) => void;
  rooms: Room[];
  onChangeRooms: (rooms: Room[]) => void;
  candidates: Candidate[];
  onChangeCandidates: (candidates: Candidate[]) => void;
  onOpenCandidateModal: () => void;
}

export const ConfigPanel: React.FC<ConfigPanelProps> = ({
  config,
  onChangeConfig,
  exercises,
  onChangeExercises,
  rooms,
  onChangeRooms,
  candidates,
  onChangeCandidates,
  onOpenCandidateModal,
}) => {
  const [activeTab, setActiveTab] = useState<'GENERAL' | 'EXERCISES' | 'ROOMS' | 'CANDIDATES'>('GENERAL');
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Cohort Selection Handler
  const handleSelectCohort = (cohortNum: number) => {
    const rawBase = config.baseTitle || config.title.replace(/\s*\([^)]*기\)\s*$/, '').trim() || '2026년도 4급 보직후보자 역량평가 실습표';
    const cohortName = `제${cohortNum}기`;
    const newTitle = `${rawBase} (${cohortName})`;
    onChangeConfig({
      ...config,
      cohort: cohortNum,
      cohortName,
      baseTitle: rawBase,
      title: newTitle,
    });
  };

  // Cohort Candidates Quick Load
  const handleApplyCohortCandidates = (cohortNum: number) => {
    const sample = COHORT_CANDIDATE_SAMPLES[cohortNum];
    if (sample) {
      const updated = sample.map((cand, idx) => ({
        ...cand,
        prepRoom: config.candidatePrepRooms[idx + 1] || cand.prepRoom,
      }));
      onChangeCandidates(updated);
    }
  };

  // Classroom Preset Handler
  const handleApplyClassroomPreset = (preset: ClassroomPreset) => {
    onChangeConfig({
      ...config,
      evalRoomName: preset.evalRoomName,
      videoRoomName: preset.videoRoomName,
      candidatePrepRooms: { ...preset.prepRooms },
    });
    onChangeRooms(preset.rooms);
  };

  // Direct Classroom Name Updates
  const handleUpdateEvalRoom = (name: string) => {
    const updatedRooms = [...rooms];
    if (updatedRooms[0]) {
      updatedRooms[0] = { ...updatedRooms[0], name };
    }
    const updatedPrep = { ...config.candidatePrepRooms };
    updatedPrep[1] = `${name.split(' ')[0]} (1번 검토실 ➔ 본실습실 전환)`;
    onChangeConfig({
      ...config,
      evalRoomName: name,
      candidatePrepRooms: updatedPrep,
    });
    onChangeRooms(updatedRooms);
  };

  const handleUpdateVideoRoom = (name: string) => {
    const updatedRooms = [...rooms];
    if (updatedRooms[1]) {
      updatedRooms[1] = { ...updatedRooms[1], name };
    }
    onChangeConfig({
      ...config,
      videoRoomName: name,
    });
    onChangeRooms(updatedRooms);
  };

  const handleUpdatePrepRoom = (candidateNum: number, roomName: string) => {
    const updatedPrep = {
      ...config.candidatePrepRooms,
      [candidateNum]: roomName,
    };
    const updatedRooms = [...rooms];
    if (candidateNum === 1 && updatedRooms[0]) {
      updatedRooms[0] = { ...updatedRooms[0], name: roomName.split(' ')[0] };
    } else if (candidateNum >= 2 && updatedRooms[candidateNum]) {
      updatedRooms[candidateNum] = { ...updatedRooms[candidateNum], name: roomName };
    }
    onChangeConfig({
      ...config,
      candidatePrepRooms: updatedPrep,
    });
    onChangeRooms(updatedRooms);
  };

  // Exercise handlers
  const handleToggleExercise = (id: string) => {
    onChangeExercises(
      exercises.map((e) => (e.id === id ? { ...e, enabled: !e.enabled } : e))
    );
  };

  const handleUpdateExercise = (id: string, field: keyof Exercise, value: any) => {
    onChangeExercises(
      exercises.map((e) => (e.id === id ? { ...e, [field]: value } : e))
    );
  };

  const handleAddExercise = () => {
    const newEx: Exercise = {
      id: `ex-${Date.now()}`,
      code: 'NEW',
      name: '새 과목',
      type: 'INDIVIDUAL',
      prepMinutes: 20,
      evalMinutes: 20,
      gradeMinutes: 10,
      color: 'red',
      enabled: true,
    };
    onChangeExercises([...exercises, newEx]);
  };

  const handleDeleteExercise = (id: string) => {
    if (exercises.length <= 1) {
      alert('최소 1개 이상의 과목이 필요합니다.');
      return;
    }
    onChangeExercises(exercises.filter((e) => e.id !== id));
  };

  // Room handlers
  const handleAddRoom = () => {
    const nextIdx = rooms.length + 1;
    const newRoom: Room = {
      id: `room-${Date.now()}`,
      name: `제${nextIdx}평가실`,
      assessors: `평가위원 ${nextIdx}A, 평가위원 ${nextIdx}B`,
      roleplayer: '',
    };
    onChangeRooms([...rooms, newRoom]);
  };

  const handleUpdateRoom = (id: string, field: keyof Room, value: string) => {
    onChangeRooms(
      rooms.map((r) => (r.id === id ? { ...r, [field]: value } : r))
    );
  };

  const handleDeleteRoom = (id: string) => {
    if (rooms.length <= 1) {
      alert('최소 1개 이상의 평가실이 필요합니다.');
      return;
    }
    onChangeRooms(rooms.filter((r) => r.id !== id));
  };

  // Candidate handlers
  const handleAddCandidate = () => {
    const nextNum = candidates.length + 1;
    const code = String(nextNum).padStart(2, '0');
    const newCand: Candidate = {
      id: `cand-${Date.now()}`,
      code,
      name: `수험생 ${nextNum}`,
      department: '',
    };
    onChangeCandidates([...candidates, newCand]);
  };

  const handleUpdateCandidate = (id: string, field: keyof Candidate, value: string) => {
    onChangeCandidates(
      candidates.map((c) => (c.id === id ? { ...c, [field]: value } : c))
    );
  };

  const handleDeleteCandidate = (id: string) => {
    if (candidates.length <= 1) {
      alert('최소 1명 이상의 피평가자가 필요합니다.');
      return;
    }
    onChangeCandidates(candidates.filter((c) => c.id !== id));
  };

  return (
    <div className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden no-print">
      {/* Panel Top bar */}
      <div className="flex items-center justify-between px-5 py-3.5 bg-slate-50 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <Settings className="w-5 h-5 text-slate-700" />
          <h2 className="font-bold text-slate-800 text-sm md:text-base">
            역량평가 운영 기본 조건 설정
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-1 text-xs text-slate-500 mr-2">
            <span>설정 변경 시 타임테이블이 실시간으로 자동 재계산됩니다.</span>
          </div>
          <button
            type="button"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 px-2.5 py-1 rounded-md hover:bg-slate-100 transition-colors"
          >
            {isCollapsed ? (
              <>
                <span>펼치기</span>
                <ChevronDown className="w-3.5 h-3.5" />
              </>
            ) : (
              <>
                <span>접기</span>
                <ChevronUp className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </div>
      </div>

      {!isCollapsed && (
        <>
          {/* Navigation Tabs */}
          <div className="flex border-b border-slate-200 bg-slate-50/50 px-4 pt-2 overflow-x-auto">
            <button
              onClick={() => setActiveTab('GENERAL')}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-colors whitespace-nowrap ${
                activeTab === 'GENERAL'
                  ? 'border-red-600 text-red-700 bg-white rounded-t-lg shadow-xs'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              <Clock className="w-4 h-4 text-red-500" />
              1. 기본 정보 및 시간
            </button>

            <button
              onClick={() => setActiveTab('EXERCISES')}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-colors whitespace-nowrap ${
                activeTab === 'EXERCISES'
                  ? 'border-red-600 text-red-700 bg-white rounded-t-lg shadow-xs'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              <BookOpen className="w-4 h-4 text-emerald-500" />
              2. 평가 과목 설정 ({exercises.filter((e) => e.enabled).length}개 활성)
            </button>

            <button
              onClick={() => setActiveTab('ROOMS')}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-colors whitespace-nowrap ${
                activeTab === 'ROOMS'
                  ? 'border-red-600 text-red-700 bg-white rounded-t-lg shadow-xs'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              <DoorOpen className="w-4 h-4 text-amber-500" />
              3. 평가실 & 위원 ({rooms.length}개실)
            </button>

            <button
              onClick={() => setActiveTab('CANDIDATES')}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-colors whitespace-nowrap ${
                activeTab === 'CANDIDATES'
                  ? 'border-red-600 text-red-700 bg-white rounded-t-lg shadow-xs'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              <Users className="w-4 h-4 text-purple-500" />
              4. 피평가자 관리 ({candidates.length}명)
            </button>
          </div>

          {/* Tab Contents */}
          <div className="p-5">
            {/* TAB 1: GENERAL */}
            {activeTab === 'GENERAL' && (
              <div className="space-y-4">
                {/* Course Name and Cohort Selection */}
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
                    {/* Course Title */}
                    <div className="md:col-span-6">
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-xs font-semibold text-slate-700">
                          과정명 (역량평가 워크숍명)
                        </label>
                        <span className="text-[11px] text-slate-400">
                          기수 선택 시 타이틀 자동 반영
                        </span>
                      </div>
                      <input
                        type="text"
                        value={config.title}
                        onChange={(e) => onChangeConfig({ ...config, title: e.target.value })}
                        className="w-full text-sm font-bold border border-slate-300 rounded-lg px-3 py-2 bg-white focus:ring-2 focus:ring-red-500 focus:outline-hidden"
                        placeholder="예: 2026년도 4급 보직후보자 역량평가 실습표 (제1기)"
                      />
                    </div>

                    {/* Cohort Selector */}
                    <div className="md:col-span-3">
                      <label className="block text-xs font-bold text-red-700 mb-1 flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                        기수 선택 (Cohort)
                      </label>
                      <select
                        value={config.cohort || 1}
                        onChange={(e) => handleSelectCohort(Number(e.target.value))}
                        className="w-full text-sm font-black border-2 border-red-300 bg-white rounded-lg px-3 py-2 text-red-900 focus:ring-2 focus:ring-red-500 focus:outline-hidden cursor-pointer"
                      >
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 15, 20].map((num) => (
                          <option key={num} value={num}>
                            제{num}기 ({num}기차 운영)
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Quick Cohort Buttons */}
                    <div className="md:col-span-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[11px] font-semibold text-slate-500">
                          빠른 기수 전환
                        </span>
                        <button
                          type="button"
                          onClick={() => handleApplyCohortCandidates(Number(config.cohort) || 1)}
                          className="text-[10px] font-bold text-red-600 hover:text-red-700 underline"
                          title="선택된 기수에 맞는 추천 피평가자 명단을 자동으로 채웁니다"
                        >
                          해당 기수 명단적용
                        </button>
                      </div>
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((cNum) => (
                          <button
                            key={cNum}
                            type="button"
                            onClick={() => handleSelectCohort(cNum)}
                            className={`flex-1 py-1.5 text-xs font-bold rounded-md border transition-colors ${
                              Number(config.cohort) === cNum
                                ? 'bg-red-600 text-white border-red-600 shadow-2xs'
                                : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                            }`}
                          >
                            {cNum}기
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Dates */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 border-t border-slate-200">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        운영 시작일자 (1일차)
                      </label>
                      <input
                        type="date"
                        value={config.startDate}
                        onChange={(e) =>
                          onChangeConfig({
                            ...config,
                            startDate: e.target.value,
                            endDate: config.endDate < e.target.value ? e.target.value : config.endDate,
                          })
                        }
                        className="w-full text-xs font-medium border border-slate-300 rounded-lg px-3 py-1.5 bg-white focus:ring-2 focus:ring-red-500 focus:outline-hidden"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        운영 끝 일자 (2일차 종료일)
                      </label>
                      <input
                        type="date"
                        value={config.endDate}
                        min={config.startDate}
                        onChange={(e) => onChangeConfig({ ...config, endDate: e.target.value })}
                        className="w-full text-xs font-medium border border-slate-300 rounded-lg px-3 py-1.5 bg-white focus:ring-2 focus:ring-red-500 focus:outline-hidden"
                      />
                    </div>
                  </div>
                </div>

                {/* 5 Classroom Configuration Card (기수별 강의실 변경 지원) */}
                <div className="p-4 bg-red-50/80 border border-red-200 rounded-xl space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <DoorOpen className="w-5 h-5 text-red-700" />
                      <div>
                        <span className="font-extrabold text-red-950 text-sm block">
                          기수별 운영 강의실 명칭 설정 (매 기수별 강의실 변경 가능)
                        </span>
                        <span className="text-[11px] text-red-800">
                          기수별로 배정된 강의실 이름을 아래에서 직접 수정하거나 추천 프리셋을 원클릭 선택하세요.
                        </span>
                      </div>
                    </div>

                    {/* Quick Classroom Presets */}
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="text-[11px] font-semibold text-slate-600 hidden md:inline">
                        강의실 프리셋:
                      </span>
                      {CLASSROOM_PRESETS.map((cp) => (
                        <button
                          key={cp.id}
                          type="button"
                          onClick={() => handleApplyClassroomPreset(cp)}
                          className="px-2 py-1 text-[11px] font-bold bg-white hover:bg-red-100 text-red-900 border border-red-200 rounded-md transition-colors shadow-2xs"
                          title={cp.description}
                        >
                          {cp.locationGroup}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Editable 5 Classroom Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5 pt-1">
                    {/* Room 1: Main Eval Room */}
                    <div className="p-2.5 bg-white rounded-lg border-2 border-red-300 shadow-2xs space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-red-100 text-red-800">
                          본 실습실 (메인)
                        </span>
                        <span className="text-[10px] text-emerald-700 font-extrabold">
                          1번 검토 ➔ 실습전환
                        </span>
                      </div>
                      <input
                        type="text"
                        value={config.evalRoomName}
                        onChange={(e) => handleUpdateEvalRoom(e.target.value)}
                        className="w-full text-xs font-bold text-red-950 border border-slate-300 rounded px-2 py-1 focus:ring-1 focus:ring-red-500 bg-white"
                        placeholder="예: 455강의실"
                      />
                      <span className="text-[10px] text-slate-500 block leading-tight">
                        평가위원 2인 / 롤플레이어 1인
                      </span>
                    </div>

                    {/* Room 2: Video Watch Room */}
                    <div className="p-2.5 bg-white rounded-lg border-2 border-purple-300 shadow-2xs space-y-1 bg-purple-50/20">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-purple-100 text-purple-800">
                          실습영상 시청실
                        </span>
                        <span className="text-[10px] text-purple-700 font-bold">
                          전원 이동
                        </span>
                      </div>
                      <input
                        type="text"
                        value={config.videoRoomName}
                        onChange={(e) => handleUpdateVideoRoom(e.target.value)}
                        className="w-full text-xs font-bold text-purple-950 border border-slate-300 rounded px-2 py-1 focus:ring-1 focus:ring-purple-500 bg-white"
                        placeholder="예: 456강의실"
                      />
                      <span className="text-[10px] text-slate-500 block leading-tight">
                        실습 종료 교육생 영상 시청
                      </span>
                    </div>

                    {/* Room 3: Candidate 2 Prep Room */}
                    <div className="p-2.5 bg-white rounded-lg border border-slate-300 shadow-2xs space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700">
                          2번 검토실
                        </span>
                        <span className="text-[10px] text-slate-500 font-medium">
                          2번 교육생 전용
                        </span>
                      </div>
                      <input
                        type="text"
                        value={config.candidatePrepRooms[2] || ''}
                        onChange={(e) => handleUpdatePrepRoom(2, e.target.value)}
                        className="w-full text-xs font-bold text-slate-900 border border-slate-300 rounded px-2 py-1 focus:ring-1 focus:ring-red-500 bg-white"
                        placeholder="예: 457강의실"
                      />
                      <span className="text-[10px] text-slate-500 block leading-tight">
                        과제숙지 후 본실습실 이동
                      </span>
                    </div>

                    {/* Room 4: Candidate 3 Prep Room */}
                    <div className="p-2.5 bg-white rounded-lg border border-slate-300 shadow-2xs space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700">
                          3번 검토실
                        </span>
                        <span className="text-[10px] text-slate-500 font-medium">
                          3번 교육생 전용
                        </span>
                      </div>
                      <input
                        type="text"
                        value={config.candidatePrepRooms[3] || ''}
                        onChange={(e) => handleUpdatePrepRoom(3, e.target.value)}
                        className="w-full text-xs font-bold text-slate-900 border border-slate-300 rounded px-2 py-1 focus:ring-1 focus:ring-red-500 bg-white"
                        placeholder="예: 458강의실"
                      />
                      <span className="text-[10px] text-slate-500 block leading-tight">
                        과제숙지 후 본실습실 이동
                      </span>
                    </div>

                    {/* Room 5: Candidate 4 Prep Room */}
                    <div className="p-2.5 bg-white rounded-lg border border-slate-300 shadow-2xs space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700">
                          4번 검토실
                        </span>
                        <span className="text-[10px] text-slate-500 font-medium">
                          4번 교육생 전용
                        </span>
                      </div>
                      <input
                        type="text"
                        value={config.candidatePrepRooms[4] || ''}
                        onChange={(e) => handleUpdatePrepRoom(4, e.target.value)}
                        className="w-full text-xs font-bold text-slate-900 border border-slate-300 rounded px-2 py-1 focus:ring-1 focus:ring-red-500 bg-white"
                        placeholder="예: 459강의실"
                      />
                      <span className="text-[10px] text-slate-500 block leading-tight">
                        과제숙지 후 본실습실 이동
                      </span>
                    </div>
                  </div>
                </div>

                {/* 1일차 / 2일차 실습 시작시간 설정 - 핵심 운영 설정 */}
                <div className="p-4 bg-amber-50/70 border border-amber-300 rounded-xl space-y-3">
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-amber-700" />
                    <div>
                      <span className="font-extrabold text-slate-900 text-sm block">
                        1일차 / 2일차 평가과목별 1번 교육생 실습 시작시간 설정
                      </span>
                      <span className="text-xs text-amber-900">
                        각 세션별 1번 실습 시작시간을 기준으로 과제검토 시간 및 4명 연속 실습(실습종료 10분후 다음실습)이 자동 연동됩니다.
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                    {/* 1일차 오전 PT */}
                    <div className="bg-white p-3 rounded-lg border border-red-200 shadow-2xs space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-red-700 bg-red-50 px-2 py-0.5 rounded border border-red-200">
                          1일차 오전
                        </span>
                        <span className="text-[11px] font-bold text-slate-700">PT 실습 (4명)</span>
                      </div>
                      <div className="flex items-center justify-between pt-1">
                        <span className="text-xs font-semibold text-slate-600">실습 시작:</span>
                        <input
                          type="time"
                          value={config.day1PtStartTime || '10:00'}
                          onChange={(e) =>
                            onChangeConfig({
                              ...config,
                              day1PtStartTime: e.target.value,
                              evalStartTime: e.target.value,
                            })
                          }
                          className="text-sm font-black text-red-900 border border-slate-300 rounded-md px-2 py-1 focus:ring-2 focus:ring-red-500 font-mono"
                        />
                      </div>
                      <span className="text-[10px] text-slate-400 block">
                        검토 30분 ➔ 대기 10분 ➔ 실습 20분
                      </span>
                    </div>

                    {/* 1일차 오후 RP */}
                    <div className="bg-white p-3 rounded-lg border border-rose-200 shadow-2xs space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                          1일차 오후
                        </span>
                        <span className="text-[11px] font-bold text-slate-700">RP 실습 (4명)</span>
                      </div>
                      <div className="flex items-center justify-between pt-1">
                        <span className="text-xs font-semibold text-slate-600">실습 시작:</span>
                        <input
                          type="time"
                          value={config.day1RpStartTime || '14:30'}
                          onChange={(e) =>
                            onChangeConfig({
                              ...config,
                              day1RpStartTime: e.target.value,
                            })
                          }
                          className="text-sm font-black text-rose-900 border border-slate-300 rounded-md px-2 py-1 focus:ring-2 focus:ring-rose-500 font-mono"
                        />
                      </div>
                      <span className="text-[10px] text-slate-400 block">
                        검토 30분 ➔ 대기 10분 ➔ 실습 30분
                      </span>
                    </div>

                    {/* 2일차 오전 IB */}
                    <div className="bg-white p-3 rounded-lg border border-amber-200 shadow-2xs space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                          2일차 오전
                        </span>
                        <span className="text-[11px] font-bold text-slate-700">IB 실습 (4명)</span>
                      </div>
                      <div className="flex items-center justify-between pt-1">
                        <span className="text-xs font-semibold text-slate-600">실습 시작:</span>
                        <input
                          type="time"
                          value={config.day2IbStartTime || '09:30'}
                          onChange={(e) =>
                            onChangeConfig({
                              ...config,
                              day2IbStartTime: e.target.value,
                            })
                          }
                          className="text-sm font-black text-amber-900 border border-slate-300 rounded-md px-2 py-1 focus:ring-2 focus:ring-amber-500 font-mono"
                        />
                      </div>
                      <span className="text-[10px] text-slate-400 block">
                        검토 50분 ➔ 대기 10분 ➔ 실습 20분
                      </span>
                    </div>
                  </div>

                  <div className="text-[11px] text-slate-600 bg-white/70 p-2.5 rounded-md border border-amber-200 space-y-1">
                    <div>
                      💡 <strong>1일차 진행:</strong> 오전 <strong>{config.day1PtStartTime || '10:00'}</strong> PT 실습 시작(4명 연속), 오후 <strong>{config.day1RpStartTime || '14:30'}</strong> RP 실습 시작(4명 연속)
                    </div>
                    <div>
                      💡 <strong>2일차 진행:</strong> 오전 <strong>{config.day2IbStartTime || '09:30'}</strong> IB 실습 시작(4명 연속) ➔ 모든 과목은 <strong>앞 교육생 실습 종료 10분 후 다음 실습 시작</strong>됩니다.
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-2 border-t border-slate-100">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-amber-600" />
                      과제숙지 후 실습실 이동·대기
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="5"
                        max="30"
                        step="5"
                        value={config.transitMinutes}
                        onChange={(e) =>
                          onChangeConfig({
                            ...config,
                            transitMinutes: Math.max(0, Number(e.target.value) || 0),
                          })
                        }
                        className="w-20 text-sm font-black text-amber-900 border border-slate-300 rounded-lg px-2.5 py-1.5 focus:ring-2 focus:ring-red-500 focus:outline-hidden text-center"
                      />
                      <span className="text-xs font-bold text-slate-700">분 대기</span>
                    </div>
                    <span className="text-[11px] text-slate-400 mt-1 block">
                      과제검토 종료 후 실습실 이동 및 대기 (10분)
                    </span>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-red-600" />
                      실습 종료 후 다음 실습 간격
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="0"
                        max="30"
                        step="5"
                        value={typeof config.interCandidateBreakMinutes === 'number' ? config.interCandidateBreakMinutes : 10}
                        onChange={(e) =>
                          onChangeConfig({
                            ...config,
                            interCandidateBreakMinutes: Math.max(0, Number(e.target.value) || 0),
                          })
                        }
                        className="w-20 text-sm font-black text-red-900 border border-slate-300 rounded-lg px-2.5 py-1.5 focus:ring-2 focus:ring-red-500 focus:outline-hidden text-center"
                      />
                      <span className="text-xs font-bold text-slate-700">분 후 시작</span>
                    </div>
                    <span className="text-[11px] text-slate-400 mt-1 block">
                      실습 종료 10분 후 다음 교육생 실습 시작
                    </span>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                      <DoorOpen className="w-3.5 h-3.5 text-purple-600" />
                      456강의실 영상 시청 시간
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="10"
                        max="120"
                        step="10"
                        value={config.videoWatchMinutes || 40}
                        onChange={(e) =>
                          onChangeConfig({
                            ...config,
                            videoWatchMinutes: Math.max(10, Number(e.target.value) || 40),
                          })
                        }
                        className="w-20 text-sm font-black text-purple-900 border border-slate-300 rounded-lg px-2.5 py-1.5 focus:ring-2 focus:ring-purple-500 focus:outline-hidden text-center"
                      />
                      <span className="text-xs font-bold text-slate-700">분간 시청</span>
                    </div>
                    <span className="text-[11px] text-slate-400 mt-1 block">
                      평가 종료 후 456실 이동하여 영상 시청
                    </span>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      교육생 인원 빠른 설정
                    </label>
                    <div className="flex items-center gap-2 mt-1">
                      <button
                        type="button"
                        onClick={() => {
                          const cands: Candidate[] = [
                            { id: 'c-1', code: '01', name: '김보직 (1번)', department: '기획예산처', prepRoom: '455강의실' },
                            { id: 'c-2', code: '02', name: '이역량 (2번)', department: '운영지원과', prepRoom: '457강의실' },
                            { id: 'c-3', code: '03', name: '박실습 (3번)', department: '정책개발실', prepRoom: '458강의실' },
                            { id: 'c-4', code: '04', name: '최후보 (4번)', department: '인재경영처', prepRoom: '459강의실' },
                          ];
                          onChangeCandidates(cands);
                        }}
                        className={`flex-1 py-2 text-xs font-bold rounded-lg border transition-colors ${
                          candidates.length === 4
                            ? 'bg-red-600 text-white border-red-600 shadow-xs'
                            : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                        }`}
                      >
                        4명 구성 (권장 5실)
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const cands: Candidate[] = [
                            { id: 'c-1', code: '01', name: '김보직 (1번)', department: '기획예산처', prepRoom: '455강의실' },
                            { id: 'c-2', code: '02', name: '이역량 (2번)', department: '운영지원과', prepRoom: '457강의실' },
                            { id: 'c-3', code: '03', name: '박실습 (3번)', department: '정책개발실', prepRoom: '458강의실' },
                          ];
                          onChangeCandidates(cands);
                        }}
                        className={`flex-1 py-2 text-xs font-bold rounded-lg border transition-colors ${
                          candidates.length === 3
                            ? 'bg-red-600 text-white border-red-600 shadow-xs'
                            : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                        }`}
                      >
                        3명 구성
                      </button>
                    </div>
                  </div>
                </div>

                {/* Lunch Break Setting */}
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="hasLunchCheck"
                        checked={config.hasLunch}
                        onChange={(e) => onChangeConfig({ ...config, hasLunch: e.target.checked })}
                        className="w-4 h-4 text-red-600 rounded border-slate-300 focus:ring-red-500 cursor-pointer"
                      />
                      <label htmlFor="hasLunchCheck" className="text-xs font-bold text-slate-800 flex items-center gap-1.5 cursor-pointer">
                        <Coffee className="w-4 h-4 text-amber-600" />
                        점심시간(중식) 운영 및 세션 자동 일시 정지
                      </label>
                    </div>

                    {config.hasLunch && (
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs text-slate-600">시작:</span>
                          <input
                            type="time"
                            value={config.lunchStartTime}
                            onChange={(e) =>
                              onChangeConfig({ ...config, lunchStartTime: e.target.value })
                            }
                            className="text-xs font-medium border border-slate-300 rounded-md px-2 py-1 bg-white"
                          />
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs text-slate-600">소요:</span>
                          <input
                            type="number"
                            min="30"
                            max="120"
                            step="10"
                            value={config.lunchDurationMinutes}
                            onChange={(e) =>
                              onChangeConfig({
                                ...config,
                                lunchDurationMinutes: Number(e.target.value) || 60,
                              })
                            }
                            className="w-16 text-xs font-medium border border-slate-300 rounded-md px-2 py-1 bg-white"
                          />
                          <span className="text-xs text-slate-600">분</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: EXERCISES */}
            {activeTab === 'EXERCISES' && (
              <div className="space-y-4">
                <div className="p-3 bg-emerald-50/80 border border-emerald-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                  <div className="space-y-0.5">
                    <span className="font-extrabold text-emerald-900 block">
                      📌 4급 보직후보자 과목별 공식 소요시간 기준 (최신 개정)
                    </span>
                    <span className="text-emerald-800">
                      <strong>PT</strong>: 과제검토 30분 / 평가실습 <strong>20분</strong> |{' '}
                      <strong>RP</strong>: 과제검토 30분 / 평가실습 <strong>30분</strong> |{' '}
                      <strong>IB</strong>: 과제검토 50분 / 평가실습 <strong>20분</strong>
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const updated = exercises.map((e) => {
                        if (e.code === 'PT' || e.name.includes('발표') || e.name.includes('PT')) {
                          return { ...e, prepMinutes: 30, evalMinutes: 20, day: 1, sessionPeriod: 'AM' as const, customEvalStartTime: '10:00', enabled: true };
                        }
                        if (e.code === 'RP' || e.name.includes('역할') || e.name.includes('RP')) {
                          return { ...e, prepMinutes: 30, evalMinutes: 30, day: 1, sessionPeriod: 'PM' as const, customEvalStartTime: '14:30', enabled: true };
                        }
                        if (e.code === 'IB' || e.name.includes('서류함') || e.name.includes('IB')) {
                          return { ...e, prepMinutes: 50, evalMinutes: 20, day: 2, sessionPeriod: 'AM' as const, customEvalStartTime: '09:30', enabled: true };
                        }
                        return e;
                      });
                      onChangeExercises(updated);
                    }}
                    className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-md shadow-2xs whitespace-nowrap self-start sm:self-auto"
                  >
                    1일차(PT·RP) / 2일차(IB) 공식 기준 일괄 적용
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <p className="text-xs text-slate-500">
                    역량평가 과목별 일차(1일차/2일차), 준비시간, 평가시간, 채점시간을 개별 설정합니다.
                  </p>
                  <button
                    type="button"
                    onClick={handleAddExercise}
                    className="flex items-center gap-1 px-3 py-1.5 bg-red-50 text-red-700 hover:bg-red-100 rounded-lg text-xs font-semibold transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    과목 추가
                  </button>
                </div>

                <div className="grid grid-cols-1 gap-3">
                  {exercises.map((ex) => (
                    <div
                      key={ex.id}
                      className={`p-4 rounded-xl border transition-all ${
                        ex.enabled
                          ? 'border-slate-300 bg-white shadow-xs'
                          : 'border-slate-200 bg-slate-50/70 opacity-60'
                      }`}
                    >
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={ex.enabled}
                            onChange={() => handleToggleExercise(ex.id)}
                            className="w-4 h-4 text-red-600 rounded border-slate-300 focus:ring-red-500 cursor-pointer"
                          />
                          <input
                            type="text"
                            value={ex.code}
                            onChange={(e) => handleUpdateExercise(ex.id, 'code', e.target.value)}
                            className="w-16 text-xs font-bold text-center border border-slate-300 rounded-md px-2 py-1.5 uppercase font-mono"
                            placeholder="코드"
                          />
                          <input
                            type="text"
                            value={ex.name}
                            onChange={(e) => handleUpdateExercise(ex.id, 'name', e.target.value)}
                            className="w-48 sm:w-64 text-sm font-semibold border border-slate-300 rounded-md px-3 py-1.5"
                            placeholder="과목명"
                          />
                        </div>

                        {/* Day and Period selector */}
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-slate-500 font-medium">일차/시간:</span>
                          <select
                            value={ex.day || 1}
                            onChange={(e) => handleUpdateExercise(ex.id, 'day', Number(e.target.value))}
                            className="text-xs font-bold border border-slate-300 rounded-md px-2 py-1.5 bg-slate-50 text-slate-800"
                          >
                            <option value={1}>1일차</option>
                            <option value={2}>2일차</option>
                          </select>
                          <select
                            value={ex.sessionPeriod || 'AM'}
                            onChange={(e) => handleUpdateExercise(ex.id, 'sessionPeriod', e.target.value)}
                            className="text-xs font-bold border border-slate-300 rounded-md px-2 py-1.5 bg-slate-50 text-slate-800"
                          >
                            <option value="AM">오전</option>
                            <option value="PM">오후</option>
                          </select>
                        </div>

                        {/* Exercise Type */}
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-slate-500 font-medium">유형:</span>
                          <select
                            value={ex.type}
                            onChange={(e) =>
                              handleUpdateExercise(ex.id, 'type', e.target.value as ExerciseType)
                            }
                            className="text-xs font-semibold border border-slate-300 rounded-md px-2.5 py-1.5 bg-slate-50"
                          >
                            <option value="INDIVIDUAL">개별 순환실습 (1:1 / 1:다)</option>
                            <option value="COMMON_ALL">일괄 동시진행 (IB 서류함 등)</option>
                            <option value="GROUP">집단토론 (GD 조별 진행)</option>
                          </select>
                        </div>

                        {/* Duration settings */}
                        <div className="flex flex-wrap items-center gap-3">
                          <div className="flex items-center gap-1">
                            <span className="text-xs text-amber-700 font-medium">준비:</span>
                            <input
                              type="number"
                              min="0"
                              max="180"
                              step="5"
                              value={ex.prepMinutes}
                              onChange={(e) =>
                                handleUpdateExercise(ex.id, 'prepMinutes', Number(e.target.value) || 0)
                              }
                              className="w-14 text-xs font-medium border border-slate-300 rounded-md px-1.5 py-1 text-center"
                            />
                            <span className="text-xs text-slate-500">분</span>
                          </div>

                          <div className="flex items-center gap-1">
                            <span className="text-xs text-red-700 font-medium">평가:</span>
                            <input
                              type="number"
                              min="5"
                              max="240"
                              step="5"
                              value={ex.evalMinutes}
                              onChange={(e) =>
                                handleUpdateExercise(ex.id, 'evalMinutes', Number(e.target.value) || 5)
                              }
                              className="w-14 text-xs font-medium border border-slate-300 rounded-md px-1.5 py-1 text-center font-bold text-red-900"
                            />
                            <span className="text-xs text-slate-500">분</span>
                          </div>

                          <div className="flex items-center gap-1">
                            <span className="text-xs text-slate-600 font-medium">채점:</span>
                            <input
                              type="number"
                              min="0"
                              max="60"
                              step="5"
                              value={ex.gradeMinutes}
                              onChange={(e) =>
                                handleUpdateExercise(ex.id, 'gradeMinutes', Number(e.target.value) || 0)
                              }
                              className="w-14 text-xs font-medium border border-slate-300 rounded-md px-1.5 py-1 text-center"
                            />
                            <span className="text-xs text-slate-500">분</span>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleDeleteExercise(ex.id)}
                            className="p-1.5 text-slate-400 hover:text-red-600 rounded-md hover:bg-red-50 transition-colors"
                            title="과목 삭제"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 3: ROOMS */}
            {activeTab === 'ROOMS' && (
              <div className="space-y-4">
                {/* Classroom preset bar */}
                <div className="p-3 bg-amber-50/80 border border-amber-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div>
                    <span className="font-extrabold text-amber-900 block flex items-center gap-1.5">
                      <DoorOpen className="w-4 h-4 text-amber-700" />
                      기수별 추천 강의실 일괄 배정
                    </span>
                    <span className="text-amber-800 text-[11px]">
                      층별 / 건물별 운영 강의실 5개실을 원클릭으로 일괄 전환할 수 있습니다.
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {CLASSROOM_PRESETS.map((cp) => (
                      <button
                        key={cp.id}
                        type="button"
                        onClick={() => handleApplyClassroomPreset(cp)}
                        className="px-2.5 py-1 bg-white hover:bg-amber-100 text-amber-950 font-bold border border-amber-300 rounded-md shadow-2xs transition-colors"
                      >
                        {cp.name}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <p className="text-xs text-slate-500">
                    평가실별 명칭과 배정된 평가위원(심사위원), 롤플레이어(연기자)를 직접 지정·변경합니다.
                  </p>
                  <button
                    type="button"
                    onClick={handleAddRoom}
                    className="flex items-center gap-1 px-3 py-1.5 bg-amber-50 text-amber-800 hover:bg-amber-100 rounded-lg text-xs font-semibold transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    평가실 추가
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {rooms.map((room, idx) => {
                    const isMainEval = idx === 0;
                    const isVideo = idx === 1;

                    return (
                      <div
                        key={room.id}
                        className={`p-4 rounded-xl border bg-white shadow-xs space-y-3 ${
                          isMainEval
                            ? 'border-red-300 ring-1 ring-red-200'
                            : isVideo
                            ? 'border-purple-300 ring-1 ring-purple-200'
                            : 'border-slate-200'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span
                              className={`text-xs font-bold px-2 py-0.5 rounded ${
                                isMainEval
                                  ? 'bg-red-100 text-red-800'
                                  : isVideo
                                  ? 'bg-purple-100 text-purple-800'
                                  : 'bg-amber-100 text-amber-800'
                              }`}
                            >
                              {isMainEval
                                ? '메인 실습실'
                                : isVideo
                                ? '영상시청실'
                                : `${idx + 1}번 검토실`}
                            </span>
                            <span className="text-[11px] text-slate-400 font-mono">
                              Room {idx + 1}
                            </span>
                          </div>
                          {!isMainEval && !isVideo && (
                            <button
                              type="button"
                              onClick={() => handleDeleteRoom(room.id)}
                              className="p-1 text-slate-400 hover:text-red-600 rounded-md hover:bg-red-50"
                              title="평가실 삭제"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-slate-600 mb-1">
                            강의실 / 평가실 명칭
                          </label>
                          <input
                            type="text"
                            value={room.name}
                            onChange={(e) => {
                              const newName = e.target.value;
                              handleUpdateRoom(room.id, 'name', newName);
                              if (isMainEval) handleUpdateEvalRoom(newName);
                              if (isVideo) handleUpdateVideoRoom(newName);
                              if (idx >= 2) handleUpdatePrepRoom(idx, newName);
                            }}
                            className="w-full text-xs font-bold border border-slate-300 rounded-md px-2.5 py-1.5 focus:ring-1 focus:ring-red-500 focus:outline-hidden"
                            placeholder="예: 455강의실"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-slate-600 mb-1">
                            평가위원 / 진행요원 명단
                          </label>
                          <input
                            type="text"
                            value={room.assessors}
                            onChange={(e) => handleUpdateRoom(room.id, 'assessors', e.target.value)}
                            className="w-full text-xs border border-slate-300 rounded-md px-2.5 py-1.5 focus:ring-1 focus:ring-red-500 focus:outline-hidden"
                            placeholder="예: 김수석 위원, 이전문 위원"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-slate-600 mb-1">
                            롤플레이어 / 진행 비고
                          </label>
                          <input
                            type="text"
                            value={room.roleplayer || ''}
                            onChange={(e) => handleUpdateRoom(room.id, 'roleplayer', e.target.value)}
                            className="w-full text-xs border border-slate-300 rounded-md px-2.5 py-1.5 focus:ring-1 focus:ring-red-500 focus:outline-hidden"
                            placeholder="예: 최연기 주무관 (역할수행 연기)"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TAB 4: CANDIDATES */}
            {activeTab === 'CANDIDATES' && (
              <div className="space-y-4">
                {/* Cohort Candidates Quick Load Banner */}
                <div className="p-3 bg-purple-50/80 border border-purple-200 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
                  <div>
                    <span className="font-extrabold text-purple-950 block flex items-center gap-1.5">
                      <Users className="w-4 h-4 text-purple-700" />
                      기수별 추천 피평가자(수험생) 명단 불러오기
                    </span>
                    <span className="text-purple-800 text-[11px]">
                      매 기수별로 변경되는 피평가자 명단을 원클릭으로 즉시 세팅합니다.
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {[1, 2, 3, 4, 5].map((cNum) => (
                      <button
                        key={cNum}
                        type="button"
                        onClick={() => {
                          handleSelectCohort(cNum);
                          handleApplyCohortCandidates(cNum);
                        }}
                        className={`px-2.5 py-1 text-xs font-bold rounded-md border transition-colors ${
                          Number(config.cohort) === cNum
                            ? 'bg-purple-600 text-white border-purple-600 shadow-2xs'
                            : 'bg-white hover:bg-purple-100 text-purple-900 border-purple-200'
                        }`}
                      >
                        {cNum}기 명단 ({cNum === 1 ? '김보직' : cNum === 2 ? '정기획' : cNum === 3 ? '송전략' : cNum === 4 ? '유미래' : '권전문'} 외)
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <p className="text-xs text-slate-500">
                      총 <strong className="text-red-700 font-bold">{candidates.length}명</strong>의 피평가자가 등록되어 있습니다. 성명, 수험번호, 소속 및 검토실을 직접 수정할 수 있습니다.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={onOpenCandidateModal}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 text-purple-700 hover:bg-purple-100 rounded-lg text-xs font-semibold transition-colors"
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      명단 일괄 붙여넣기
                    </button>
                    <button
                      type="button"
                      onClick={handleAddCandidate}
                      className="flex items-center gap-1 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      1명 추가
                    </button>
                  </div>
                </div>

                <div className="max-h-80 overflow-y-auto border border-slate-200 rounded-lg">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-100 text-slate-700 font-semibold sticky top-0 border-b border-slate-200">
                      <tr>
                        <th className="p-2.5 w-14 text-center">연번</th>
                        <th className="p-2.5 w-24">수험번호</th>
                        <th className="p-2.5 w-44">피평가자 성명</th>
                        <th className="p-2.5">소속 / 직급</th>
                        <th className="p-2.5 w-48">지정 과제검토실</th>
                        <th className="p-2.5 w-12 text-center">삭제</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {candidates.map((cand, idx) => (
                        <tr key={cand.id} className="hover:bg-slate-50">
                          <td className="p-2 text-center font-mono text-slate-400">
                            {idx + 1}
                          </td>
                          <td className="p-2">
                            <input
                              type="text"
                              value={cand.code}
                              onChange={(e) =>
                                handleUpdateCandidate(cand.id, 'code', e.target.value)
                              }
                              className="w-full font-mono font-bold text-center border border-slate-200 rounded px-2 py-1 bg-white"
                            />
                          </td>
                          <td className="p-2">
                            <input
                              type="text"
                              value={cand.name}
                              onChange={(e) =>
                                handleUpdateCandidate(cand.id, 'name', e.target.value)
                              }
                              className="w-full font-bold text-slate-900 border border-slate-200 rounded px-2 py-1 bg-white focus:border-red-500"
                              placeholder="성명 입력"
                            />
                          </td>
                          <td className="p-2">
                            <input
                              type="text"
                              value={cand.department || ''}
                              onChange={(e) =>
                                handleUpdateCandidate(cand.id, 'department', e.target.value)
                              }
                              placeholder="부서/직급 입력"
                              className="w-full border border-slate-200 rounded px-2 py-1 bg-white"
                            />
                          </td>
                          <td className="p-2">
                            <input
                              type="text"
                              value={cand.prepRoom || config.candidatePrepRooms[idx + 1] || ''}
                              onChange={(e) =>
                                handleUpdateCandidate(cand.id, 'prepRoom', e.target.value)
                              }
                              placeholder="검토실 지정"
                              className="w-full text-xs font-semibold text-red-900 border border-slate-200 rounded px-2 py-1 bg-red-50/30"
                            />
                          </td>
                          <td className="p-2 text-center">
                            <button
                              type="button"
                              onClick={() => handleDeleteCandidate(cand.id)}
                              className="p-1 text-slate-300 hover:text-red-600 rounded transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

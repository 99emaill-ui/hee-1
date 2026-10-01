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
} from 'lucide-react';
import { GeneralConfig, Exercise, Room, Candidate, ExerciseType } from '../types';

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
                {/* 5 Classroom Rule Banner */}
                <div className="p-3.5 bg-red-50/80 border border-red-200 rounded-xl text-xs space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-red-900 flex items-center gap-1.5 text-sm">
                      <DoorOpen className="w-4 h-4 text-red-700" />
                      5개 강의실 운영 룰 (4인 개별 분산 검토 + 455실 실습 + 456실 영상 시청)
                    </span>
                    <span className="px-2 py-0.5 bg-red-600 text-white rounded font-mono font-bold text-[11px]">
                      5개실 분산 운영
                    </span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-slate-700 pt-1">
                    <div className="p-2 bg-white rounded-lg border border-red-200 col-span-2 sm:col-span-1">
                      <strong className="text-red-900 block font-bold">455강의실</strong>
                      <span className="text-[11px] text-slate-600 block">1번 교육생 검토실</span>
                      <span className="text-[10px] text-emerald-700 font-extrabold block mt-0.5">
                        ➔ 이후 본 실습실 전환!
                      </span>
                    </div>
                    <div className="p-2 bg-white rounded-lg border border-purple-200 col-span-2 sm:col-span-1 bg-purple-50/40">
                      <strong className="text-purple-900 block font-bold">456강의실</strong>
                      <span className="text-[11px] text-purple-700 font-bold block">실습영상 시청실</span>
                      <span className="text-[10px] text-slate-500 block mt-0.5">실습 종료 후 전원 이동</span>
                    </div>
                    <div className="p-2 bg-white rounded-lg border border-slate-200">
                      <strong className="text-red-900 block font-bold">457강의실</strong>
                      <span className="text-[11px] text-slate-600 block">2번 교육생 검토실</span>
                      <span className="text-[10px] text-slate-500 block mt-0.5">시차 후 455실 입실</span>
                    </div>
                    <div className="p-2 bg-white rounded-lg border border-slate-200">
                      <strong className="text-red-900 block font-bold">458강의실</strong>
                      <span className="text-[11px] text-slate-600 block">3번 교육생 검토실</span>
                      <span className="text-[10px] text-slate-500 block mt-0.5">시차 후 455실 입실</span>
                    </div>
                    <div className="p-2 bg-white rounded-lg border border-slate-200">
                      <strong className="text-red-900 block font-bold">459강의실</strong>
                      <span className="text-[11px] text-slate-600 block">4번 교육생 검토실</span>
                      <span className="text-[10px] text-slate-500 block mt-0.5">시차 후 455실 입실</span>
                    </div>
                  </div>
                </div>

                {/* Course Name and Dates */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="lg:col-span-2">
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      과정명 (역량평가 워크숍명)
                    </label>
                    <input
                      type="text"
                      value={config.title}
                      onChange={(e) => onChangeConfig({ ...config, title: e.target.value })}
                      className="w-full text-sm font-bold border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:outline-hidden"
                      placeholder="예: 2026년도 4급 보직후보자 역량평가 실습표"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      운영 시작일자
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
                      className="w-full text-sm font-medium border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      운영 끝 일자 (종료일)
                    </label>
                    <input
                      type="date"
                      value={config.endDate}
                      min={config.startDate}
                      onChange={(e) => onChangeConfig({ ...config, endDate: e.target.value })}
                      className="w-full text-sm font-medium border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:outline-hidden"
                    />
                  </div>
                </div>

                {/* 455 Base Time Setting - Core user requirement */}
                <div className="p-4 bg-amber-50/70 border border-amber-300 rounded-xl space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <Clock className="w-5 h-5 text-amber-700" />
                      <div>
                        <span className="font-extrabold text-slate-900 text-sm block">
                          455강의실 실습 시작 기준시간 설정 (과제검토 시간 자동 역산)
                        </span>
                        <span className="text-xs text-amber-900">
                          1번 교육생의 455실 실습 시작시간을 입력하면, 10분 전 과제검토 종료 및 과제검토 시작시간이 자동 계산됩니다.
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border border-amber-300 shadow-2xs">
                      <span className="text-xs font-bold text-slate-700 whitespace-nowrap">
                        455실 실습 시작:
                      </span>
                      <input
                        type="time"
                        value={config.evalStartTime || '10:00'}
                        onChange={(e) =>
                          onChangeConfig({
                            ...config,
                            evalStartTime: e.target.value,
                            useEvalStartTimeAsBase: true,
                          })
                        }
                        className="text-sm font-black text-red-900 border border-slate-300 rounded-md px-2.5 py-1 focus:ring-2 focus:ring-red-500"
                      />
                    </div>
                  </div>

                  <div className="text-[11px] text-slate-600 bg-white/70 p-2 rounded-md border border-amber-200">
                    💡 <strong>순차 진행 예시:</strong> 1번 실습 시작 <strong>{config.evalStartTime || '10:00'}</strong> 설정 시 ➔
                    1번 과제검토는 <strong>{(() => {
                      const [h, m] = (config.evalStartTime || '10:00').split(':').map(Number);
                      const total = h * 60 + m - (config.transitMinutes || 10) - (exercises[0]?.prepMinutes || 30);
                      const rh = Math.floor(total / 60) % 24;
                      const rm = total % 60;
                      return `${String(rh).padStart(2, '0')}:${String(rm).padStart(2, '0')}`;
                    })()}</strong> ~ <strong>{(() => {
                      const [h, m] = (config.evalStartTime || '10:00').split(':').map(Number);
                      const total = h * 60 + m - (config.transitMinutes || 10);
                      const rh = Math.floor(total / 60) % 24;
                      const rm = total % 60;
                      return `${String(rh).padStart(2, '0')}:${String(rm).padStart(2, '0')}`;
                    })()}</strong> (10분 대기 후 10:00 실습 시작),
                    1번 실습 종료(10:20) <strong>10분 후인 10:30에 2번 실습이 시작</strong>되며, 이에 맞춰 2번의 과제검토(09:50~10:20)도 자동 세팅됩니다.
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
                      <strong>IB</strong>: 과제검토 50분 / 평가실습 <strong>50분</strong>
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const updated = exercises.map((e) => {
                        if (e.code === 'PT' || e.name.includes('발표') || e.name.includes('PT')) {
                          return { ...e, prepMinutes: 30, evalMinutes: 20, enabled: true };
                        }
                        if (e.code === 'RP' || e.name.includes('역할') || e.name.includes('RP')) {
                          return { ...e, prepMinutes: 30, evalMinutes: 30, enabled: true };
                        }
                        if (e.code === 'IB' || e.name.includes('서류함') || e.name.includes('IB')) {
                          return { ...e, prepMinutes: 50, evalMinutes: 50, enabled: true };
                        }
                        return e;
                      });
                      onChangeExercises(updated);
                    }}
                    className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-md shadow-2xs whitespace-nowrap self-start sm:self-auto"
                  >
                    최신 공식 소요시간 일괄 적용
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <p className="text-xs text-slate-500">
                    역량평가 과목별 준비시간, 평가시간, 채점시간을 개별 설정합니다.
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
                <div className="flex items-center justify-between">
                  <p className="text-xs text-slate-500">
                    평가실별 명칭과 배정된 평가위원(심사위원), 롤플레이어(연기자)를 지정합니다.
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
                  {rooms.map((room, idx) => (
                    <div
                      key={room.id}
                      className="p-4 rounded-xl border border-slate-200 bg-white shadow-xs space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold px-2 py-0.5 bg-amber-100 text-amber-800 rounded">
                          Room {idx + 1}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleDeleteRoom(room.id)}
                          className="p-1 text-slate-400 hover:text-red-600 rounded-md hover:bg-red-50"
                          title="평가실 삭제"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1">
                          평가실 명칭
                        </label>
                        <input
                          type="text"
                          value={room.name}
                          onChange={(e) => handleUpdateRoom(room.id, 'name', e.target.value)}
                          className="w-full text-xs font-bold border border-slate-300 rounded-md px-2.5 py-1.5 focus:ring-1 focus:ring-red-500 focus:outline-hidden"
                          placeholder="예: 제1평가실"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1">
                          평가위원 명단
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
                          롤플레이어 / 연기자 (선택)
                        </label>
                        <input
                          type="text"
                          value={room.roleplayer || ''}
                          onChange={(e) => handleUpdateRoom(room.id, 'roleplayer', e.target.value)}
                          className="w-full text-xs border border-slate-300 rounded-md px-2.5 py-1.5 focus:ring-1 focus:ring-red-500 focus:outline-hidden"
                          placeholder="예: 최연기 주무관"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 4: CANDIDATES */}
            {activeTab === 'CANDIDATES' && (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <p className="text-xs text-slate-500">
                      총 <strong className="text-red-700 font-bold">{candidates.length}명</strong>의 피평가자가 등록되어 있습니다.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={onOpenCandidateModal}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 text-purple-700 hover:bg-purple-100 rounded-lg text-xs font-semibold transition-colors"
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      명단 일괄 붙여넣기 / 자동 생성
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

                <div className="max-h-72 overflow-y-auto border border-slate-200 rounded-lg">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-100 text-slate-700 font-semibold sticky top-0 border-b border-slate-200">
                      <tr>
                        <th className="p-2.5 w-16 text-center">연번</th>
                        <th className="p-2.5 w-24">수험번호</th>
                        <th className="p-2.5">피평가자 성명</th>
                        <th className="p-2.5">소속 / 직급</th>
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
                              className="w-full font-semibold border border-slate-200 rounded px-2 py-1 bg-white"
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

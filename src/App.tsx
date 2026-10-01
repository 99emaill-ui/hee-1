/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { PRESETS, PresetConfig } from './utils/presets';
import { GeneralConfig, Exercise, Room, Candidate } from './types';
import { generateSchedule } from './utils/scheduler';
import { Header } from './components/Header';
import { ConfigPanel } from './components/ConfigPanel';
import { SummaryBar } from './components/SummaryBar';
import { MasterMatrixView } from './components/MasterMatrixView';
import { CandidateTimelineView } from './components/CandidateTimelineView';
import { AssessorSheetView } from './components/AssessorSheetView';
import { LiveSimulatorView } from './components/LiveSimulatorView';
import { CandidateModal } from './components/CandidateModal';
import {
  Layers,
  User,
  ClipboardList,
  Activity,
  FileSpreadsheet,
  Printer,
  FileCode,
  Sparkles,
} from 'lucide-react';
import { exportToExcel, exportToCsv, exportToStandaloneHtml } from './utils/exportUtils';

export default function App() {
  // Initialize with the standard public promotion preset
  const defaultPreset = PRESETS[0];

  const [config, setConfig] = useState<GeneralConfig>(defaultPreset.config);
  const [exercises, setExercises] = useState<Exercise[]>(defaultPreset.exercises);
  const [rooms, setRooms] = useState<Room[]>(defaultPreset.rooms);
  const [candidates, setCandidates] = useState<Candidate[]>(defaultPreset.candidates);

  // Tab state for the output views
  const [viewTab, setViewTab] = useState<'MASTER' | 'CANDIDATE' | 'ASSESSOR' | 'LIVE'>('MASTER');

  // Candidate bulk modal
  const [isCandidateModalOpen, setIsCandidateModalOpen] = useState(false);

  // Automatically recalculate schedule whenever inputs change
  const scheduleResult = useMemo(() => {
    return generateSchedule(config, exercises, rooms, candidates);
  }, [config, exercises, rooms, candidates]);

  // Handle Preset selection
  const handleSelectPreset = (preset: PresetConfig) => {
    const today = new Date().toISOString().split('T')[0];
    setConfig({
      ...preset.config,
      startDate: preset.config.startDate || today,
      endDate: preset.config.endDate || today,
    });
    setExercises(preset.exercises);
    setRooms(preset.rooms);
    setCandidates(preset.candidates);
  };

  const handleReset = () => {
    if (confirm('현재 입력된 설정을 초기화하고 기본 템플릿으로 되돌리시겠습니까?')) {
      handleSelectPreset(PRESETS[0]);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-16">
      {/* Top Header */}
      <Header
        config={config}
        schedule={scheduleResult}
        rooms={rooms}
        candidates={candidates}
        exercises={exercises}
        onSelectPreset={handleSelectPreset}
        onReset={handleReset}
      />

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">
        {/* Top: Configuration Panel */}
        <ConfigPanel
          config={config}
          onChangeConfig={setConfig}
          exercises={exercises}
          onChangeExercises={setExercises}
          rooms={rooms}
          onChangeRooms={setRooms}
          candidates={candidates}
          onChangeCandidates={setCandidates}
          onOpenCandidateModal={() => setIsCandidateModalOpen(true)}
        />

        {/* Middle: Metrics and Integrity Status Bar */}
        <SummaryBar
          schedule={scheduleResult}
          candidateCount={candidates.length}
          roomCount={rooms.length}
          activeExerciseCount={exercises.filter((e) => e.enabled).length}
        />

        {/* Printable Title Header (Only visible in Print / PDF mode) */}
        <div className="hidden print:block border-b-2 border-slate-900 pb-4 mb-4">
          <span className="text-xs font-bold text-slate-500 uppercase">
            역량평가 운영 공식 타임테이블
          </span>
          <h1 className="text-2xl font-black text-slate-900 mt-1">{config.title}</h1>
          <div className="text-xs text-slate-600 mt-1 flex flex-wrap gap-4">
            <span>일자: <strong>{config.startDate === config.endDate ? config.startDate : `${config.startDate} ~ ${config.endDate}`}</strong></span>
            <span>운영시간: <strong>{config.startTime} ~ {scheduleResult.overallEndTime}</strong></span>
            <span>실습실: <strong>455강의실</strong></span>
            <span>영상시청실: <strong>456강의실</strong></span>
            <span>과제검토실: <strong>455실(1번), 457실(2번), 458실(3번), 459실(4번)</strong></span>
          </div>
        </div>

        {/* View Selection Tabs & Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 pb-2 gap-3 no-print">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setViewTab('MASTER')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                viewTab === 'MASTER'
                  ? 'bg-red-600 text-white shadow-sm shadow-red-200'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>1. 종합 로테이션 순서표</span>
            </button>

            <button
              onClick={() => setViewTab('CANDIDATE')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                viewTab === 'CANDIDATE'
                  ? 'bg-red-600 text-white shadow-sm shadow-red-200'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              <User className="w-4 h-4" />
              <span>2. 피평가자별 개인 동선표</span>
            </button>

            <button
              onClick={() => setViewTab('ASSESSOR')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                viewTab === 'ASSESSOR'
                  ? 'bg-red-600 text-white shadow-sm shadow-red-200'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              <ClipboardList className="w-4 h-4" />
              <span>3. 평가실 / 위원 진행표</span>
            </button>

            <button
              onClick={() => setViewTab('LIVE')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                viewTab === 'LIVE'
                  ? 'bg-slate-900 text-amber-400 shadow-sm shadow-slate-300'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              <Activity className="w-4 h-4" />
              <span>4. 실시간 운영 상황실</span>
            </button>
          </div>

          {/* Quick print and download shortcuts */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => exportToExcel(config, scheduleResult, rooms, candidates, exercises)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100 rounded-lg text-xs font-bold transition-colors"
              title="엑셀 다운로드"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
              <span>Excel</span>
            </button>

            <button
              onClick={() => exportToStandaloneHtml(config, scheduleResult, rooms, candidates, exercises)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-800 border border-red-200 hover:bg-red-100 rounded-lg text-xs font-bold transition-colors"
              title="단독 실행 가능한 단일 HTML 파일로 저장"
            >
              <FileCode className="w-3.5 h-3.5 text-red-600" />
              <span>HTML 저장</span>
            </button>

            <button
              onClick={() => window.print()}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 rounded-lg text-xs font-bold transition-colors"
              title="인쇄 미리보기 및 PDF 저장"
            >
              <Printer className="w-3.5 h-3.5 text-slate-600" />
              <span>인쇄</span>
            </button>
          </div>
        </div>

        {/* Active View Container */}
        <div>
          {viewTab === 'MASTER' && (
            <MasterMatrixView
              slots={scheduleResult.slots}
              rooms={rooms}
              config={config}
            />
          )}

          {viewTab === 'CANDIDATE' && (
            <CandidateTimelineView
              schedules={scheduleResult.candidateSchedules}
              candidates={candidates}
            />
          )}

          {viewTab === 'ASSESSOR' && (
            <AssessorSheetView
              rooms={rooms}
              slots={scheduleResult.slots}
              candidates={candidates}
            />
          )}

          {viewTab === 'LIVE' && (
            <LiveSimulatorView
              slots={scheduleResult.slots}
              rooms={rooms}
              candidates={candidates}
              config={config}
              overallStartTime={scheduleResult.overallStartTime}
              overallEndTime={scheduleResult.overallEndTime}
            />
          )}
        </div>
      </main>

      {/* Candidate Bulk Modal */}
      <CandidateModal
        isOpen={isCandidateModalOpen}
        onClose={() => setIsCandidateModalOpen(false)}
        onImport={(newCands) => {
          setCandidates(newCands);
        }}
        currentCount={candidates.length}
      />
    </div>
  );
}

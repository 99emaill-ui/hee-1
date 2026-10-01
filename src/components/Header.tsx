import React, { useState } from 'react';
import {
  FileSpreadsheet,
  Printer,
  Download,
  FileCode,
  RotateCcw,
  Sparkles,
  ChevronDown,
  Calendar,
  Layers,
} from 'lucide-react';
import { PRESETS, PresetConfig } from '../utils/presets';
import { GeneralConfig, Exercise, Room, Candidate, GeneratedScheduleResult } from '../types';
import { exportToExcel, exportToCsv, exportToStandaloneHtml } from '../utils/exportUtils';

interface HeaderProps {
  config: GeneralConfig;
  schedule: GeneratedScheduleResult;
  rooms: Room[];
  candidates: Candidate[];
  exercises: Exercise[];
  onSelectPreset: (preset: PresetConfig) => void;
  onReset: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  config,
  schedule,
  rooms,
  candidates,
  exercises,
  onSelectPreset,
  onReset,
}) => {
  const [showPresetDropdown, setShowPresetDropdown] = useState(false);
  const [showExportDropdown, setShowExportDropdown] = useState(false);

  const handlePrint = () => {
    window.print();
  };

  const handleExcelExport = () => {
    exportToExcel(config, schedule, rooms, candidates, exercises);
    setShowExportDropdown(false);
  };

  const handleCsvExport = () => {
    exportToCsv(config, schedule);
    setShowExportDropdown(false);
  };

  const handleHtmlExport = () => {
    exportToStandaloneHtml(config, schedule, rooms, candidates, exercises);
    setShowExportDropdown(false);
  };

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between py-3.5 gap-3">
          {/* Logo & Title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-red-700 via-rose-600 to-amber-500 flex items-center justify-center text-white shadow-sm shadow-red-200">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg md:text-xl font-bold text-slate-900 tracking-tight">
                  역량평가 실습 순서표 자동 생성기
                </h1>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-red-50 text-red-700 border border-red-200">
                  K-AC Scheduler Pro
                </span>
              </div>
              <p className="text-xs text-slate-500">
                공공기관·기업 평가센터(Assessment Center) 로테이션 타임테이블 자동 최적화
              </p>
            </div>
          </div>

          {/* Action Bar */}
          <div className="flex items-center flex-wrap gap-2">
            {/* Preset Selector */}
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setShowPresetDropdown(!showPresetDropdown);
                  setShowExportDropdown(false);
                }}
                className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold border border-slate-300 transition-colors shadow-2xs"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>운영 템플릿 불러오기</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
              </button>

              {showPresetDropdown && (
                <div className="absolute right-0 mt-1.5 w-80 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in duration-100">
                  <div className="px-3 py-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    추천 역량평가 표준 프리셋
                  </div>
                  {PRESETS.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => {
                        onSelectPreset(p);
                        setShowPresetDropdown(false);
                      }}
                      className="w-full text-left px-3 py-2.5 hover:bg-red-50 transition-colors border-b border-slate-100 last:border-b-0"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-slate-800">{p.name}</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-medium">
                          {p.category}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">
                        {p.description}
                      </p>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Export Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setShowExportDropdown(!showExportDropdown);
                  setShowPresetDropdown(false);
                }}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold transition-colors shadow-xs"
              >
                <Download className="w-3.5 h-3.5" />
                <span>내보내기 / 저장</span>
                <ChevronDown className="w-3.5 h-3.5" />
              </button>

              {showExportDropdown && (
                <div className="absolute right-0 mt-1.5 w-60 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-50 animate-in fade-in duration-100">
                  <button
                    onClick={handleExcelExport}
                    className="w-full text-left px-3.5 py-2 hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 text-xs font-semibold flex items-center gap-2.5"
                  >
                    <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                    <div>
                      <div>엑셀 다운로드 (.xlsx)</div>
                      <span className="text-[10px] text-slate-400 font-normal">
                        종합표, 피평가자동선표 다중시트 포함
                      </span>
                    </div>
                  </button>

                  <button
                    onClick={handleHtmlExport}
                    className="w-full text-left px-3.5 py-2 hover:bg-red-50 text-slate-700 hover:text-red-800 text-xs font-semibold flex items-center gap-2.5"
                  >
                    <FileCode className="w-4 h-4 text-red-600" />
                    <div>
                      <div>단일 HTML 파일 다운로드 (.html)</div>
                      <span className="text-[10px] text-slate-400 font-normal">
                        단독 실행 가능한 완성형 웹페이지
                      </span>
                    </div>
                  </button>

                  <button
                    onClick={handleCsvExport}
                    className="w-full text-left px-3.5 py-2 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-2.5 border-t border-slate-100"
                  >
                    <Download className="w-4 h-4 text-slate-500" />
                    <div>
                      <div>CSV 다운로드 (.csv)</div>
                      <span className="text-[10px] text-slate-400 font-normal">
                        범용 스프레드시트 호환
                      </span>
                    </div>
                  </button>
                </div>
              )}
            </div>

            {/* Print Button */}
            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold border border-slate-300 transition-colors shadow-2xs"
              title="A4 최적화 인쇄 / PDF 저장"
            >
              <Printer className="w-3.5 h-3.5 text-slate-600" />
              <span>인쇄 / PDF</span>
            </button>

            {/* Reset Button */}
            <button
              type="button"
              onClick={onReset}
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
              title="기본값으로 초기화"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

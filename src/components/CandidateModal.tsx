import React, { useState } from 'react';
import { X, ClipboardPaste, UserPlus } from 'lucide-react';
import { Candidate } from '../types';

interface CandidateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (candidates: Candidate[]) => void;
  currentCount: number;
}

export const CandidateModal: React.FC<CandidateModalProps> = ({
  isOpen,
  onClose,
  onImport,
  currentCount,
}) => {
  const [pasteText, setPasteText] = useState('');
  const [prefix, setPrefix] = useState('');
  const [startNumber, setStartNumber] = useState(1);

  if (!isOpen) return null;

  const handleParseAndApply = () => {
    const lines = pasteText
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l.length > 0);

    if (lines.length === 0) return;

    const newCandidates: Candidate[] = lines.map((line, idx) => {
      // Split by tab, comma, or multiple spaces
      const parts = line.split(/[\t,]| {2,}/).map((p) => p.trim()).filter(Boolean);
      let code = '';
      let name = '';
      let department = '';

      if (parts.length >= 3) {
        code = parts[0];
        name = parts[1];
        department = parts[2];
      } else if (parts.length === 2) {
        // could be "홍길동 인사팀" or "01 홍길동"
        if (/^[A-Za-z0-9-]+$/.test(parts[0])) {
          code = parts[0];
          name = parts[1];
        } else {
          name = parts[0];
          department = parts[1];
        }
      } else {
        name = parts[0];
      }

      if (!code) {
        const numStr = String(startNumber + idx).padStart(2, '0');
        code = prefix ? `${prefix}-${numStr}` : numStr;
      }

      return {
        id: `cand-${Date.now()}-${idx}`,
        code,
        name: name || `수험생 ${idx + 1}`,
        department: department || '',
      };
    });

    onImport(newCandidates);
    onClose();
  };

  const handleQuickGenerate = (count: number) => {
    const list: Candidate[] = [];
    for (let i = 1; i <= count; i++) {
      const code = prefix ? `${prefix}-${String(i).padStart(2, '0')}` : String(i).padStart(2, '0');
      list.push({
        id: `cand-gen-${Date.now()}-${i}`,
        code,
        name: `응시자 ${i}`,
        department: `소속부서 ${Math.ceil(i / 2)}`,
      });
    }
    onImport(list);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-red-600" />
            <h3 className="font-bold text-slate-800 text-lg">피평가자(수험생) 일괄 등록</h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-md hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Quick presets */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-2">
              빠른 인원 생성 (기본 명단 일괄 자동 배정)
            </label>
            <div className="flex flex-wrap gap-2">
              {[4, 6, 8, 10, 12, 16].map((cnt) => (
                <button
                  key={cnt}
                  type="button"
                  onClick={() => handleQuickGenerate(cnt)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                    currentCount === cnt
                      ? 'bg-red-50 border-red-400 text-red-700'
                      : 'border-slate-200 hover:bg-slate-100 text-slate-700'
                  }`}
                >
                  {cnt}명 생성
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                수험번호 접두사 (선택)
              </label>
              <input
                type="text"
                placeholder="예: A or C"
                value={prefix}
                onChange={(e) => setPrefix(e.target.value)}
                className="w-full text-sm border border-slate-300 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-red-500 focus:outline-hidden"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                시작 번호
              </label>
              <input
                type="number"
                min="1"
                value={startNumber}
                onChange={(e) => setStartNumber(Number(e.target.value) || 1)}
                className="w-full text-sm border border-slate-300 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-red-500 focus:outline-hidden"
              />
            </div>
          </div>

          {/* Paste area */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1 flex items-center justify-between">
              <span>엑셀 / 텍스트 명단 붙여넣기</span>
              <span className="text-slate-400 font-normal">한 줄에 1명씩</span>
            </label>
            <textarea
              rows={6}
              value={pasteText}
              onChange={(e) => setPasteText(e.target.value)}
              placeholder="예시 1 (이름만 입력):&#10;홍길동&#10;이순신&#10;강감찬&#10;&#10;예시 2 (번호, 이름, 소속):&#10;01	김민준	기획팀&#10;02	이서연	인사팀"
              className="w-full font-mono text-xs border border-slate-300 rounded-lg p-3 focus:ring-2 focus:ring-red-500 focus:outline-hidden bg-slate-50"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              엑셀에서 복사(Ctrl+C)하여 그대로 붙여넣으면 번호, 이름, 소속이 자동으로 분리 인식됩니다.
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 px-6 py-4 bg-slate-50 border-t border-slate-200">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
          >
            취소
          </button>
          <button
            type="button"
            onClick={handleParseAndApply}
            disabled={!pasteText.trim()}
            className="px-5 py-2 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
          >
            <ClipboardPaste className="w-4 h-4" />
            명단 적용하기
          </button>
        </div>
      </div>
    </div>
  );
};

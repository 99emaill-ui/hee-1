import * as XLSX from 'xlsx';
import {
  GeneralConfig,
  Exercise,
  Room,
  Candidate,
  GeneratedScheduleResult,
} from '../types';

export function exportToExcel(
  config: GeneralConfig,
  schedule: GeneratedScheduleResult,
  rooms: Room[],
  candidates: Candidate[],
  exercises: Exercise[]
) {
  const wb = XLSX.utils.book_new();

  const dateStr = config.startDate === config.endDate
    ? config.startDate
    : `${config.startDate} ~ ${config.endDate}`;

  // 1. 종합 배치표 시트
  const masterData: (string | number)[][] = [
    ['역량평가 종합 로테이션 타임테이블'],
    ['과정명', config.title],
    ['운영일자', dateStr, '1일차 PT시작', config.day1PtStartTime || '10:00', '1일차 RP시작', config.day1RpStartTime || '14:30', '2일차 IB시작', config.day2IbStartTime || '09:30'],
    ['실습실', '455강의실 (역량평가 본 실습실)', '영상시청실', '456강의실 (실습영상 시청)'],
    ['검토실', '455실(1번), 457실(2번), 458실(3번), 459실(4번) (실습종료 10분후 다음실습)'],
    [],
    ['일차/구분', '순번', '과제검토 (시간 및 검토실)', '역량평가 대기 (10분)', '역량평가 실습 (455실)', '실습영상 시청 (456실)', '과목', '수험번호', '피평가자 성명', '소속/직급', '평가위원'],
  ];

  schedule.slots.forEach((s) => {
    const room = rooms.find((r) => r.id === s.roomId);
    const prepStr = s.prepStartTime ? `[${s.prepRoomName || '검토실'}] ${s.prepStartTime}~${s.prepEndTime}` : '-';
    const transitStr = s.transitStartTime ? `${s.transitStartTime}~${s.transitEndTime} (10분)` : '- (대기 없음)';
    const evalStr = `${s.evalStartTime} ~ ${s.evalEndTime}`;
    const videoStr = s.videoStartTime ? `[456실] ${s.videoStartTime}~${s.videoEndTime}` : '-';

    const candNames = s.candidateNames.join(', ');
    const candCodes = s.candidateCodes.join(', ');
    const candDepts = s.candidateIds
      .map((id) => candidates.find((c) => c.id === id)?.department || '-')
      .join(', ');

    masterData.push([
      `${s.day}일차 ${s.sessionPeriod}`,
      `${s.round}회`,
      prepStr,
      transitStr,
      evalStr,
      videoStr,
      s.exerciseName,
      candCodes,
      candNames,
      candDepts,
      room?.assessors || '평가위원',
    ]);
  });

  const wsMaster = XLSX.utils.aoa_to_sheet(masterData);
  XLSX.utils.book_append_sheet(wb, wsMaster, '종합순서표');

  // 2. 피평가자별 개인 동선표 시트
  const candidateData: (string | number)[][] = [
    ['수험생(피평가자)별 개인 타임테이블'],
    ['과정명', config.title],
    ['운영일자', dateStr],
    [],
    ['수험번호', '성명', '소속/직급', '시간', '구분', '장소', '내용/활동'],
  ];

  schedule.candidateSchedules.forEach((cs) => {
    cs.items.forEach((item) => {
      candidateData.push([
        cs.candidate.code,
        cs.candidate.name,
        cs.candidate.department || '-',
        item.timeStr,
        item.type === 'PREP' ? '과제검토' : item.type === 'TRANSIT' ? '역량평가 대기' : item.type === 'EVAL' ? '본실습' : item.type === 'VIDEO' ? '영상시청' : item.type === 'LUNCH' ? '중식' : '진행',
        item.location,
        `${item.exerciseName} (${item.activity})`,
      ]);
    });
  });

  const wsCandidates = XLSX.utils.aoa_to_sheet(candidateData);
  XLSX.utils.book_append_sheet(wb, wsCandidates, '피평가자별동선');

  // 3. 평가위원 및 강의실 정보 시트
  const roomData: (string | number)[][] = [
    ['5개 강의실 및 평가위원 배정 현황'],
    [],
    ['강의실명', '운영 역할', '평가위원/진행요원', '비고'],
    ['455강의실', '1번 교육생 과제검토실 ➔ 과제검토 후 역량평가 본 실습실 전환', '수석평가위원 2인, 롤플레이어 1인', 'PT(20분)/RP(20분)/IB(20분) 실습 및 평정'],
    ['456강의실', '실습영상 시청실 (모든 교육생 실습 종료 후 이동)', '진행요원 (영상 지원)', '실습 녹화영상 시청 및 자가 피드백'],
    ['457강의실', '2번 교육생 전용 과제검토실', '진행요원', '시차 과제검토 10분 후 455실로 이동'],
    ['458강의실', '3번 교육생 전용 과제검토실', '진행요원', '시차 과제검토 10분 후 455실로 이동'],
    ['459강의실', '4번 교육생 전용 과제검토실', '진행요원', '시차 과제검토 10분 후 455실로 이동'],
  ];

  const wsRooms = XLSX.utils.aoa_to_sheet(roomData);
  XLSX.utils.book_append_sheet(wb, wsRooms, '5개강의실배정');

  // 파일 다운로드
  const safeDate = dateStr.replace(/[^0-9-]/g, '_');
  const fileName = `${config.title.replace(/[^a-zA-Z0-9가-힣_-]/g, '_')}_${safeDate}.xlsx`;
  XLSX.writeFile(wb, fileName);
}

export function exportToCsv(
  config: GeneralConfig,
  schedule: GeneratedScheduleResult
) {
  const dateStr = config.startDate === config.endDate ? config.startDate : `${config.startDate}~${config.endDate}`;
  let csvContent = '\uFEFF'; // UTF-8 BOM for Excel compatibility in Korea
  csvContent += '일차/구분,순번,과제검토,역량평가대기(10분),역량평가실습(455실),실습영상시청(456실),과목,실습실,수험번호,피평가자명\n';

  schedule.slots.forEach((s) => {
    const prepStr = s.prepStartTime ? `[${s.prepRoomName || '검토실'}] ${s.prepStartTime}~${s.prepEndTime}` : '-';
    const transitStr = s.transitStartTime ? `${s.transitStartTime}~${s.transitEndTime}` : '-';
    const videoStr = s.videoStartTime ? `[456실] ${s.videoStartTime}~${s.videoEndTime}` : '-';
    csvContent += `"${s.day}일차 ${s.sessionPeriod}",${s.round}회,"${prepStr}","${transitStr}","${s.evalStartTime}~${s.evalEndTime}","${videoStr}","${s.exerciseName}","${s.roomName}","${s.candidateCodes.join(', ')}","${s.candidateNames.join(', ')}"\n`;
  });

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${config.title.replace(/[^a-zA-Z0-9가-힣_-]/g, '_')}_${dateStr}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Generates an all-in-one standalone HTML file containing embedded styles,
 * interactive table rendering, print styles, and full data.
 */
export function exportToStandaloneHtml(
  config: GeneralConfig,
  schedule: GeneratedScheduleResult,
  rooms: Room[],
  candidates: Candidate[],
  exercises: Exercise[]
) {
  const dateStr = config.startDate === config.endDate ? config.startDate : `${config.startDate} ~ ${config.endDate}`;
  const htmlContent = `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${config.title} - 역량평가 실습 순서표</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/web/static/pretendard.css">
  <style>
    body { font-family: "Pretendard", -apple-system, sans-serif; }
    @media print {
      .no-print { display: none !important; }
      body { background: white; font-size: 10pt; }
      table { border-collapse: collapse; }
      th, td { border: 1px solid #cbd5e1; }
      .page-break { page-break-before: always; }
    }
  </style>
</head>
<body class="bg-slate-100 text-slate-800 p-4 md:p-8">
  <div class="max-w-6xl mx-auto bg-white rounded-xl shadow p-6 md:p-8">
    <!-- Header -->
    <div class="border-b border-slate-200 pb-6 mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <div>
        <span class="inline-block px-2.5 py-1 text-xs font-semibold bg-red-100 text-red-800 rounded-md mb-2">역량평가 운영 순서표</span>
        <h1 class="text-2xl md:text-3xl font-bold text-slate-900">${config.title}</h1>
        <p class="text-sm text-slate-500 mt-1">
          운영일자: <strong>${dateStr}</strong> | 운영시간: <strong>${config.startTime} ~ ${schedule.overallEndTime}</strong>
        </p>
      </div>
      <div class="no-print flex gap-2">
        <button onclick="window.print()" class="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg text-sm shadow">인쇄 / PDF 저장</button>
      </div>
    </div>

    <!-- 5 Classroom Rules -->
    <div class="grid grid-cols-2 md:grid-cols-5 gap-2.5 mb-6 text-xs">
      <div class="p-2.5 bg-red-50 border border-red-200 rounded-lg">
        <span class="text-red-700 block font-bold">455강의실</span>
        <strong class="text-slate-900 block mt-0.5">1번 검토실 ➔ 본 실습실 전환</strong>
      </div>
      <div class="p-2.5 bg-purple-50 border border-purple-200 rounded-lg">
        <span class="text-purple-700 block font-bold">456강의실</span>
        <strong class="text-slate-900 block mt-0.5">실습영상 시청실 (전원 이동)</strong>
      </div>
      <div class="p-2.5 bg-slate-50 border border-slate-200 rounded-lg">
        <span class="text-slate-600 block font-bold">457강의실</span>
        <strong class="text-slate-900 block mt-0.5">2번 교육생 전용 검토실</strong>
      </div>
      <div class="p-2.5 bg-slate-50 border border-slate-200 rounded-lg">
        <span class="text-slate-600 block font-bold">458강의실</span>
        <strong class="text-slate-900 block mt-0.5">3번 교육생 전용 검토실</strong>
      </div>
      <div class="p-2.5 bg-slate-50 border border-slate-200 rounded-lg">
        <span class="text-slate-600 block font-bold">459강의실</span>
        <strong class="text-slate-900 block mt-0.5">4번 교육생 전용 검토실</strong>
      </div>
    </div>

    <!-- Master Timetable -->
    <div class="mb-10">
      <h2 class="text-lg font-bold text-slate-900 mb-3 flex items-center gap-2">
        <span class="w-2 h-5 bg-red-600 rounded-full inline-block"></span>
        1. 종합 로테이션 타임테이블
      </h2>
      <div class="overflow-x-auto border border-slate-200 rounded-lg">
        <table class="w-full text-left text-sm">
          <thead class="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
            <tr>
              <th class="p-3">일차/구분</th>
              <th class="p-3">순번</th>
              <th class="p-3">과제검토 (분산 강의실)</th>
              <th class="p-3">역량평가 대기 (IB 10분)</th>
              <th class="p-3">역량평가 실습 (455실)</th>
              <th class="p-3">실습영상 시청 (456실)</th>
              <th class="p-3">과목</th>
              <th class="p-3">수험번호</th>
              <th class="p-3">피평가자</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-200">
            ${schedule.slots
              .map((s) => {
                return `
                <tr class="hover:bg-slate-50">
                  <td class="p-3 font-bold text-red-700 text-xs">${s.day}일차 ${s.sessionPeriod}</td>
                  <td class="p-3 font-semibold text-slate-700">${s.round}회</td>
                  <td class="p-3">
                    <span class="font-bold text-red-800">[${s.prepRoomName || '검토실'}]</span>
                    <div class="font-mono text-slate-700 text-xs">${s.prepStartTime} ~ ${s.prepEndTime}</div>
                  </td>
                  <td class="p-3 text-amber-800 font-mono text-xs font-bold">
                    ${s.transitStartTime && s.transitEndTime ? `${s.transitStartTime} ~ ${s.transitEndTime} (10분)` : '- (대기 없음)'}
                  </td>
                  <td class="p-3">
                    <div class="font-bold text-emerald-800">${s.evalStartTime} ~ ${s.evalEndTime}</div>
                    <div class="text-[11px] text-slate-500">${s.roomName}</div>
                  </td>
                  <td class="p-3">
                    ${s.videoStartTime && s.videoEndTime ? `
                      <div class="font-bold text-purple-800">${s.videoStartTime} ~ ${s.videoEndTime}</div>
                      <div class="text-[11px] text-purple-600 font-medium">${s.videoRoomName || '456강의실'}</div>
                    ` : `
                      <div class="text-xs text-slate-400 font-medium">- (시청 없음)</div>
                    `}
                  </td>
                  <td class="p-3 font-medium text-slate-800">${s.exerciseName}</td>
                  <td class="p-3 font-mono font-bold text-red-700">${s.candidateCodes.join(', ')}</td>
                  <td class="p-3 font-semibold text-slate-900">${s.candidateNames.join(', ')}</td>
                </tr>
              `;
              })
              .join('')}
          </tbody>
        </table>
      </div>
    </div>

    <!-- Candidate Personal Timetable -->
    <div class="page-break mb-10">
      <h2 class="text-lg font-bold text-slate-900 mb-3 flex items-center gap-2">
        <span class="w-2 h-5 bg-emerald-600 rounded-full inline-block"></span>
        2. 교육생(피평가자)별 개인 동선표
      </h2>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        ${schedule.candidateSchedules
          .map((cs) => {
            return `
            <div class="border border-slate-200 rounded-lg p-4 bg-slate-50">
              <div class="flex justify-between items-center border-b border-slate-200 pb-2 mb-3">
                <span class="font-bold text-slate-800 text-base">[${cs.candidate.code}] ${cs.candidate.name}</span>
                <span class="text-xs text-slate-500">${cs.candidate.department || '보직후보자'}</span>
              </div>
              <div class="space-y-2 text-xs">
                ${cs.items
                  .map(
                    (it) => `
                  <div class="flex items-center justify-between p-2 rounded bg-white border border-slate-100">
                    <span class="font-mono font-medium text-slate-600">${it.timeStr}</span>
                    <span class="font-bold text-slate-800">${it.activity}</span>
                    <span class="text-red-700 font-semibold">${it.location}</span>
                  </div>
                `
                  )
                  .join('')}
              </div>
            </div>
          `;
          })
          .join('')}
      </div>
    </div>

    <!-- Footer -->
    <div class="border-t border-slate-200 pt-4 text-center text-xs text-slate-400">
      역량평가 실습 순서표 자동 생성기 | ${config.title}
    </div>
  </div>
</body>
</html>`;

  const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  const safeDate = dateStr.replace(/[^0-9-]/g, '_');
  a.download = `${config.title.replace(/[^a-zA-Z0-9가-힣_-]/g, '_')}_${safeDate}.html`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

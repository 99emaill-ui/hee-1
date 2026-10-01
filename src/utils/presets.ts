import { GeneralConfig, Exercise, Room, Candidate } from '../types';

export interface PresetConfig {
  id: string;
  name: string;
  category: string;
  description: string;
  config: GeneralConfig;
  exercises: Exercise[];
  rooms: Room[];
  candidates: Candidate[];
}

const d1 = new Date();
const d2 = new Date();
d2.setDate(d1.getDate() + 1);
const todayStr = d1.toISOString().split('T')[0];
const tomorrowStr = d2.toISOString().split('T')[0];

export const PRESETS: PresetConfig[] = [
  {
    id: 'grade4-4candidates-5rooms',
    name: '2026년도 4급 보직후보자 역량평가 실습표 (1일차 PT·RP / 2일차 IB)',
    category: '4급 4인 전용 (5실)',
    description: '1일차: 오전 10:00 PT실습 ➔ 오후 14:30 RP실습 / 2일차: 오전 09:30 IB실습 (각 과목 4명 연속 실시, 실습종료 10분후 다음실습 시작)',
    config: {
      title: '2026년도 4급 보직후보자 역량평가 실습표 (제1기)',
      baseTitle: '2026년도 4급 보직후보자 역량평가 실습표',
      cohort: 1,
      cohortName: '제1기',
      startDate: todayStr,
      endDate: tomorrowStr,
      startTime: '09:20', // 1일차 1번 교육생 첫 과제검토 시작
      evalStartTime: '10:00', // 1일차 PT 실습 시작 기준
      day1PtStartTime: '10:00', // 1일차 오전 PT 1번 실습 시작
      day1RpStartTime: '14:30', // 1일차 오후 RP 1번 실습 시작
      day2IbStartTime: '09:30', // 2일차 오전 IB 1번 실습 시작
      useEvalStartTimeAsBase: true,
      evalRoomName: '455강의실 (역량평가 실습실)',
      videoRoomName: '456강의실 (실습영상 시청실)',
      videoWatchMinutes: 40,
      prepRoomName: '지정 과제검토 강의실',
      waitingRoomName: '교육생 대기실',
      hasLunch: true,
      lunchStartTime: '12:30',
      lunchDurationMinutes: 60,
      transitMinutes: 10, // 과제숙지 후 10분 뒤 실습실 입실
      interCandidateBreakMinutes: 10, // 교육생 실습 종료 10분 후 다음 교육생 실습 시작
      candidatePrepRooms: {
        1: '455강의실 (1번 검토실 ➔ 이후 실습실 전환)',
        2: '457강의실 (2번 검토실)',
        3: '458강의실 (3번 검토실)',
        4: '459강의실 (4번 검토실)',
      },
    },
    exercises: [
      {
        id: 'ex-pt',
        code: 'PT',
        name: '개별발표 (PT / Oral Presentation)',
        type: 'INDIVIDUAL',
        day: 1,
        sessionPeriod: 'AM',
        customEvalStartTime: '10:00',
        prepMinutes: 30, // PT 과제검토 30분
        evalMinutes: 20, // PT 평가실습 20분
        gradeMinutes: 10,
        color: 'red',
        enabled: true,
      },
      {
        id: 'ex-rp',
        code: 'RP',
        name: '1:1 역할수행 (RP / Role-Play)',
        type: 'INDIVIDUAL',
        day: 1,
        sessionPeriod: 'PM',
        customEvalStartTime: '14:30',
        prepMinutes: 30, // RP 과제검토 30분
        evalMinutes: 30, // RP 평가실습 30분
        gradeMinutes: 10,
        color: 'rose',
        enabled: true,
      },
      {
        id: 'ex-ib',
        code: 'IB',
        name: '서류함기법 (IB / In-Basket)',
        type: 'INDIVIDUAL',
        day: 2,
        sessionPeriod: 'AM',
        customEvalStartTime: '09:30',
        prepMinutes: 50, // IB 과제검토 50분
        evalMinutes: 50, // IB 평가실습 50분
        gradeMinutes: 10,
        color: 'amber',
        enabled: true,
      },
    ],
    rooms: [
      {
        id: 'room-455',
        name: '455강의실 (역량평가 실습실)',
        assessors: '수석평가위원 2인',
        roleplayer: '전문 롤플레이어 1인',
        note: '1번 교육생 과제검토실로 선사용 후 역량평가 본 실습실로 전환',
      },
      {
        id: 'room-456',
        name: '456강의실 (실습영상 시청실)',
        assessors: '진행요원 (영상 모니터링 지원)',
        note: '평가실습이 종료된 모든 교육생이 이동하여 자신의 실습영상 시청 및 피드백',
      },
      {
        id: 'room-457',
        name: '457강의실 (2번 검토실)',
        assessors: '진행요원',
        note: '2번 교육생 전용 과제검토실',
      },
      {
        id: 'room-458',
        name: '458강의실 (3번 검토실)',
        assessors: '진행요원',
        note: '3번 교육생 전용 과제검토실',
      },
      {
        id: 'room-459',
        name: '459강의실 (4번 검토실)',
        assessors: '진행요원',
        note: '4번 교육생 전용 과제검토실',
      },
    ],
    candidates: [
      { id: 'c-1', code: '01', name: '김보직 (1번)', department: '기획예산처', prepRoom: '455강의실' },
      { id: 'c-2', code: '02', name: '이역량 (2번)', department: '운영지원과', prepRoom: '457강의실' },
      { id: 'c-3', code: '03', name: '박실습 (3번)', department: '정책개발실', prepRoom: '458강의실' },
      { id: 'c-4', code: '04', name: '최후보 (4번)', department: '인재경영처', prepRoom: '459강의실' },
    ],
  },
  {
    id: 'grade4-3candidates',
    name: '2026년도 4급 보직후보자 역량평가 실습표 (3인 집중형)',
    category: '4급 3인 전용',
    description: '1일차: 오전 10:00 PT / 오후 14:30 RP, 2일차: 오전 09:30 IB (3인 연속 실시)',
    config: {
      title: '2026년도 4급 보직후보자 역량평가 실습표 (3인)',
      startDate: todayStr,
      endDate: tomorrowStr,
      startTime: '09:20',
      evalStartTime: '10:00',
      day1PtStartTime: '10:00',
      day1RpStartTime: '14:30',
      day2IbStartTime: '09:30',
      useEvalStartTimeAsBase: true,
      evalRoomName: '455강의실 (역량평가 실습실)',
      videoRoomName: '456강의실 (실습영상 시청실)',
      videoWatchMinutes: 40,
      prepRoomName: '지정 과제검토 강의실',
      waitingRoomName: '교육생 대기실',
      hasLunch: true,
      lunchStartTime: '12:30',
      lunchDurationMinutes: 60,
      transitMinutes: 10,
      interCandidateBreakMinutes: 10,
      candidatePrepRooms: {
        1: '455강의실 (1번 검토실 ➔ 실습실 전환)',
        2: '457강의실 (2번 검토실)',
        3: '458강의실 (3번 검토실)',
      },
    },
    exercises: [
      {
        id: 'ex-pt',
        code: 'PT',
        name: '개별발표 (PT)',
        type: 'INDIVIDUAL',
        day: 1,
        sessionPeriod: 'AM',
        customEvalStartTime: '10:00',
        prepMinutes: 30,
        evalMinutes: 20,
        gradeMinutes: 10,
        color: 'red',
        enabled: true,
      },
      {
        id: 'ex-rp',
        code: 'RP',
        name: '1:1 역할수행 (RP)',
        type: 'INDIVIDUAL',
        day: 1,
        sessionPeriod: 'PM',
        customEvalStartTime: '14:30',
        prepMinutes: 30,
        evalMinutes: 30,
        gradeMinutes: 10,
        color: 'rose',
        enabled: true,
      },
      {
        id: 'ex-ib',
        code: 'IB',
        name: '서류함기법 (IB)',
        type: 'INDIVIDUAL',
        day: 2,
        sessionPeriod: 'AM',
        customEvalStartTime: '09:30',
        prepMinutes: 50,
        evalMinutes: 50,
        gradeMinutes: 10,
        color: 'amber',
        enabled: true,
      },
    ],
    rooms: [
      {
        id: 'room-455',
        name: '455강의실 (역량평가 실습실)',
        assessors: '수석평가위원 2인',
        roleplayer: '전문 롤플레이어 1인',
      },
      {
        id: 'room-456',
        name: '456강의실 (실습영상 시청실)',
        assessors: '진행요원',
      },
      {
        id: 'room-457',
        name: '457강의실 (2번 검토실)',
        assessors: '진행요원',
      },
      {
        id: 'room-458',
        name: '458강의실 (3번 검토실)',
        assessors: '진행요원',
      },
    ],
    candidates: [
      { id: 'c-1', code: '01', name: '김보직 (1번)', department: '기획예산처', prepRoom: '455강의실' },
      { id: 'c-2', code: '02', name: '이역량 (2번)', department: '운영지원과', prepRoom: '457강의실' },
      { id: 'c-3', code: '03', name: '박실습 (3번)', department: '정책개발실', prepRoom: '458강의실' },
    ],
  },
];

export interface ClassroomPreset {
  id: string;
  name: string;
  locationGroup: string;
  description: string;
  evalRoomName: string;
  videoRoomName: string;
  prepRooms: Record<number, string>;
  rooms: Room[];
}

export const CLASSROOM_PRESETS: ClassroomPreset[] = [
  {
    id: 'preset-455',
    name: '455~459호 (본관 4층)',
    locationGroup: '본관 4층',
    description: '본 실습실 455실, 영상시청실 456실, 검토실 455/457/458/459실',
    evalRoomName: '455강의실 (역량평가 실습실)',
    videoRoomName: '456강의실 (실습영상 시청실)',
    prepRooms: {
      1: '455강의실 (1번 검토실 ➔ 본실습실 전환)',
      2: '457강의실 (2번 검토실)',
      3: '458강의실 (3번 검토실)',
      4: '459강의실 (4번 검토실)',
    },
    rooms: [
      { id: 'room-455', name: '455강의실 (역량평가 실습실)', assessors: '수석평가위원 2인', roleplayer: '전문 롤플레이어 1인', note: '1번 교육생 검토실 선사용 후 본 실습실 전환' },
      { id: 'room-456', name: '456강의실 (실습영상 시청실)', assessors: '진행요원 (영상 모니터링 지원)', note: '실습 종료 후 전원 이동 영상 시청' },
      { id: 'room-457', name: '457강의실 (2번 검토실)', assessors: '진행요원', note: '2번 교육생 전용 과제검토실' },
      { id: 'room-458', name: '458강의실 (3번 검토실)', assessors: '진행요원', note: '3번 교육생 전용 과제검토실' },
      { id: 'room-459', name: '459강의실 (4번 검토실)', assessors: '진행요원', note: '4번 교육생 전용 과제검토실' },
    ],
  },
  {
    id: 'preset-501',
    name: '501~505호 (신관 5층)',
    locationGroup: '신관 5층',
    description: '본 실습실 501실, 영상시청실 502실, 검토실 501/503/504/505실',
    evalRoomName: '501강의실 (역량평가 실습실)',
    videoRoomName: '502강의실 (실습영상 시청실)',
    prepRooms: {
      1: '501강의실 (1번 검토실 ➔ 본실습실 전환)',
      2: '503강의실 (2번 검토실)',
      3: '504강의실 (3번 검토실)',
      4: '505강의실 (4번 검토실)',
    },
    rooms: [
      { id: 'room-455', name: '501강의실 (역량평가 실습실)', assessors: '수석평가위원 2인', roleplayer: '전문 롤플레이어 1인', note: '1번 교육생 검토실 선사용 후 본 실습실 전환' },
      { id: 'room-456', name: '502강의실 (실습영상 시청실)', assessors: '진행요원 (영상 모니터링 지원)', note: '실습 종료 후 전원 이동 영상 시청' },
      { id: 'room-457', name: '503강의실 (2번 검토실)', assessors: '진행요원', note: '2번 교육생 전용 과제검토실' },
      { id: 'room-458', name: '504강의실 (3번 검토실)', assessors: '진행요원', note: '3번 교육생 전용 과제검토실' },
      { id: 'room-459', name: '505강의실 (4번 검토실)', assessors: '진행요원', note: '4번 교육생 전용 과제검토실' },
    ],
  },
  {
    id: 'preset-301',
    name: '301~305호 (본관 3층)',
    locationGroup: '본관 3층',
    description: '본 실습실 301실, 영상시청실 302실, 검토실 301/303/304/305실',
    evalRoomName: '301강의실 (역량평가 실습실)',
    videoRoomName: '302강의실 (실습영상 시청실)',
    prepRooms: {
      1: '301강의실 (1번 검토실 ➔ 본실습실 전환)',
      2: '303강의실 (2번 검토실)',
      3: '304강의실 (3번 검토실)',
      4: '305강의실 (4번 검토실)',
    },
    rooms: [
      { id: 'room-455', name: '301강의실 (역량평가 실습실)', assessors: '수석평가위원 2인', roleplayer: '전문 롤플레이어 1인', note: '1번 교육생 검토실 선사용 후 본 실습실 전환' },
      { id: 'room-456', name: '302강의실 (실습영상 시청실)', assessors: '진행요원 (영상 모니터링 지원)', note: '실습 종료 후 전원 이동 영상 시청' },
      { id: 'room-457', name: '303강의실 (2번 검토실)', assessors: '진행요원', note: '2번 교육생 전용 과제검토실' },
      { id: 'room-458', name: '304강의실 (3번 검토실)', assessors: '진행요원', note: '3번 교육생 전용 과제검토실' },
      { id: 'room-459', name: '305강의실 (4번 검토실)', assessors: '진행요원', note: '4번 교육생 전용 과제검토실' },
    ],
  },
  {
    id: 'preset-ac',
    name: 'A동 1~5실 (역량평가센터)',
    locationGroup: '평가센터 A동',
    description: '본 실습실 A1실, 영상시청실 A2실, 검토실 A1/A3/A4/A5실',
    evalRoomName: '평가센터 A1실 (역량평가 실습실)',
    videoRoomName: '평가센터 A2실 (실습영상 시청실)',
    prepRooms: {
      1: '평가센터 A1실 (1번 검토실 ➔ 본실습실 전환)',
      2: '평가센터 A3실 (2번 검토실)',
      3: '평가센터 A4실 (3번 검토실)',
      4: '평가센터 A5실 (4번 검토실)',
    },
    rooms: [
      { id: 'room-455', name: '평가센터 A1실 (역량평가 실습실)', assessors: '수석평가위원 2인', roleplayer: '전문 롤플레이어 1인', note: '1번 교육생 검토실 선사용 후 본 실습실 전환' },
      { id: 'room-456', name: '평가센터 A2실 (실습영상 시청실)', assessors: '진행요원 (영상 모니터링 지원)', note: '실습 종료 후 전원 이동 영상 시청' },
      { id: 'room-457', name: '평가센터 A3실 (2번 검토실)', assessors: '진행요원', note: '2번 교육생 전용 과제검토실' },
      { id: 'room-458', name: '평가센터 A4실 (3번 검토실)', assessors: '진행요원', note: '3번 교육생 전용 과제검토실' },
      { id: 'room-459', name: '평가센터 A5실 (4번 검토실)', assessors: '진행요원', note: '4번 교육생 전용 과제검토실' },
    ],
  },
];

export const COHORT_CANDIDATE_SAMPLES: Record<number, Candidate[]> = {
  1: [
    { id: 'c-1-1', code: '01', name: '김보직 (1번)', department: '기획예산처' },
    { id: 'c-1-2', code: '02', name: '이역량 (2번)', department: '운영지원과' },
    { id: 'c-1-3', code: '03', name: '박실습 (3번)', department: '정책개발실' },
    { id: 'c-1-4', code: '04', name: '최후보 (4번)', department: '인재경영처' },
  ],
  2: [
    { id: 'c-2-1', code: '01', name: '정기획 (1번)', department: '전략기획실' },
    { id: 'c-2-2', code: '02', name: '강인재 (2번)', department: '인사혁신과' },
    { id: 'c-2-3', code: '03', name: '윤정책 (3번)', department: '공공안전처' },
    { id: 'c-2-4', code: '04', name: '조운영 (4번)', department: '재무관리과' },
  ],
  3: [
    { id: 'c-3-1', code: '01', name: '송전략 (1번)', department: '디지털혁신처' },
    { id: 'c-3-2', code: '02', name: '오혁신 (2번)', department: '감사총괄과' },
    { id: 'c-3-3', code: '03', name: '한행정 (3번)', department: '총무인사팀' },
    { id: 'c-3-4', code: '04', name: '배성과 (4번)', department: '대외협력실' },
  ],
  4: [
    { id: 'c-4-1', code: '01', name: '유미래 (1번)', department: '미래성장본부' },
    { id: 'c-4-2', code: '02', name: '신가치 (2번)', department: '가치경영실' },
    { id: 'c-4-3', code: '03', name: '임창의 (3번)', department: '연구기획과' },
    { id: 'c-4-4', code: '04', name: '문소통 (4번)', department: '홍보소통처' },
  ],
  5: [
    { id: 'c-5-1', code: '01', name: '권전문 (1번)', department: '전문인재원' },
    { id: 'c-5-2', code: '02', name: '황신뢰 (2번)', department: '윤리경영실' },
    { id: 'c-5-3', code: '03', name: '안도전 (3번)', department: '사업개발팀' },
    { id: 'c-5-4', code: '04', name: '백상생 (4번)', department: '동반성장처' },
  ],
};

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

const today = new Date().toISOString().split('T')[0];

export const PRESETS: PresetConfig[] = [
  {
    id: 'grade4-4candidates-5rooms',
    name: '2026년도 4급 보직후보자 역량평가 실습표 (4인 5개 강의실 표준)',
    category: '4급 4인 전용 (5실)',
    description: '455실(1번 검토/실습실), 457실(2번), 458실(3번), 459실(4번 검토) 분산 검토 + 456실 실습영상 시청실 (PT: 30분/20분, IB: 50분/50분, RP: 30분/30분)',
    config: {
      title: '2026년도 4급 보직후보자 역량평가 실습표',
      startDate: today,
      endDate: today,
      startTime: '09:20', // 1번 교육생 과제검토 시작
      evalStartTime: '10:00', // 455실습실 1번 실습 시작 기준 (10:00 실습 시작 시 09:50 검토 종료)
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
        prepMinutes: 30, // PT 과제검토 30분
        evalMinutes: 20, // PT 평가실습 20분
        gradeMinutes: 10,
        color: 'red',
        enabled: true,
      },
      {
        id: 'ex-ib',
        code: 'IB',
        name: '서류함기법 (IB / In-Basket)',
        type: 'INDIVIDUAL',
        prepMinutes: 50, // IB 과제검토 50분
        evalMinutes: 50, // IB 평가실습 50분 (요청사항: IB만 평가실습 시간 50분)
        gradeMinutes: 10,
        color: 'indigo',
        enabled: true,
      },
      {
        id: 'ex-rp',
        code: 'RP',
        name: '1:1 역할수행 (RP / Role-Play)',
        type: 'INDIVIDUAL',
        prepMinutes: 30, // RP 과제검토 30분
        evalMinutes: 30, // RP 평가실습 30분 (요청사항: RP도 평가실습 시간 30분)
        gradeMinutes: 10,
        color: 'emerald',
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
    description: '455실(1번 검토/실습), 457실(2번 검토), 458실(3번 검토) + 456실(실습영상 시청)',
    config: {
      title: '2026년도 4급 보직후보자 역량평가 실습표 (3인)',
      startDate: today,
      endDate: today,
      startTime: '09:20',
      evalStartTime: '10:00',
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
        prepMinutes: 30,
        evalMinutes: 20,
        gradeMinutes: 10,
        color: 'red',
        enabled: true,
      },
      {
        id: 'ex-ib',
        code: 'IB',
        name: '서류함기법 (IB)',
        type: 'INDIVIDUAL',
        prepMinutes: 50,
        evalMinutes: 50,
        gradeMinutes: 10,
        color: 'indigo',
        enabled: true,
      },
      {
        id: 'ex-rp',
        code: 'RP',
        name: '1:1 역할수행 (RP)',
        type: 'INDIVIDUAL',
        prepMinutes: 30,
        evalMinutes: 30,
        gradeMinutes: 10,
        color: 'emerald',
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

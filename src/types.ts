export type ExerciseType = 'INDIVIDUAL' | 'COMMON_ALL' | 'GROUP';

export interface Exercise {
  id: string;
  code: string; // e.g. 'OP', 'RP', 'IB', 'GD', 'BEI'
  name: string; // e.g. '개별발표 (OP)', '1:1 역할수행 (RP)'
  type: ExerciseType;
  prepMinutes: number; // 과제검토/준비시간 (분)
  evalMinutes: number; // 본 평가/실습시간 (분)
  gradeMinutes: number; // 평정 및 채점/정리시간 (분)
  color: string; // Tailwind color theme identifier
  enabled: boolean;
  day?: number; // 1 (1일차) or 2 (2일차)
  sessionPeriod?: 'AM' | 'PM'; // '오전' | '오후'
  customEvalStartTime?: string; // e.g. "10:00", "14:30", "09:30"
  groupSize?: number; // 집단과목(GD)일 때 1개 조 인원 (예: 4~6명)
}

export interface Room {
  id: string;
  name: string; // e.g. '제1평가실 (A실)'
  assessors: string; // e.g. '김평가, 이전문'
  roleplayer?: string; // 롤플레이어/연기자 명
  note?: string;
}

export interface Candidate {
  id: string;
  code: string; // 수험번호 e.g. '01', '02'
  name: string; // 성명
  department?: string; // 소속/직급
  groupIndex?: number; // 조 번호 (1조, 2조)
  prepRoom?: string; // 지정 과제검토실 (예: 455강의실, 457강의실, 458강의실)
  note?: string;
}

export interface GeneralConfig {
  title: string; // 과정명
  startDate: string; // 운영 시작일자 YYYY-MM-DD
  endDate: string; // 운영 종료일자 YYYY-MM-DD
  startTime: string; // 전체 시작시간 "09:00"
  evalStartTime: string; // 455강의실 1번 교육생 실습 시작 기준시간 "10:00"
  day1PtStartTime?: string; // 1일차 오전 PT 시작시간 (기본 "10:00")
  day1RpStartTime?: string; // 1일차 오후 RP 시작시간 (기본 "14:30")
  day2IbStartTime?: string; // 2일차 오전 IB 시작시간 (기본 "09:30")
  useEvalStartTimeAsBase: boolean; // 455실습실 시간 기준 역산 모드 활성화 여부
  evalRoomName: string; // 메인 역량평가 실습실 (예: 455강의실)
  videoRoomName: string; // 실습영상 시청실 (예: 456강의실)
  videoWatchMinutes: number; // 실습영상 시청 소요시간 (기본 40분)
  prepRoomName: string; // 기본 준비실 명칭
  waitingRoomName: string; // 대기실 명칭
  hasLunch: boolean;
  lunchStartTime: string; // "12:00"
  lunchDurationMinutes: number; // 60
  transitMinutes: number; // 과제숙지 후 실습실 이동/대기 시간 (기본 10분)
  interCandidateBreakMinutes: number; // 교육생 평가실습 종료 후 다음 교육생 실습 시작까지 간격 (기본 10분)
  candidatePrepRooms: Record<number, string>; // 교육생 번호별 과제검토실
}

export interface TimetableSlot {
  id: string;
  day: number; // 1 (1일차) or 2 (2일차)
  date?: string; // YYYY-MM-DD
  sessionPeriod?: string; // '오전' | '오후'
  exerciseId: string;
  exerciseCode: string;
  exerciseName: string;
  exerciseColor: string;
  exerciseType: ExerciseType;
  round: number; // 1차수, 2차수
  roomId: string;
  roomName: string;
  candidateIds: string[];
  candidateCodes: string[];
  candidateNames: string[];
  // 시간 계산 결과 (HH:mm)
  prepStartTime?: string;
  prepEndTime?: string;
  prepRoomName?: string;
  transitStartTime?: string;
  transitEndTime?: string;
  evalStartTime: string;
  evalEndTime: string;
  gradeEndTime: string;
  videoStartTime?: string;
  videoEndTime?: string;
  videoRoomName?: string;
}

export interface CandidateTimelineItem {
  day: number; // 1일차 or 2일차
  date?: string; // YYYY-MM-DD
  timeStr: string; // "09:00 ~ 09:30"
  location: string; // "455강의실", "456강의실", "457강의실", "458강의실", "459강의실"
  activity: string; // "과제검토", "과제숙지 후 이동/대기", "역량평가 실습", "실습영상 시청"
  exerciseName: string;
  exerciseCode: string;
  color: string;
  type: 'PREP' | 'TRANSIT' | 'EVAL' | 'VIDEO' | 'WAIT' | 'LUNCH' | 'DONE';
}

export interface CandidateSchedule {
  candidate: Candidate;
  items: CandidateTimelineItem[];
}

export interface ScheduleConflict {
  candidateId: string;
  candidateName: string;
  timeRange: string;
  description: string;
}

export interface GeneratedScheduleResult {
  slots: TimetableSlot[];
  candidateSchedules: CandidateSchedule[];
  totalRounds: number;
  overallStartTime: string;
  overallEndTime: string;
  conflicts: ScheduleConflict[];
}

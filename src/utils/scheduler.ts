import {
  GeneralConfig,
  Exercise,
  Room,
  Candidate,
  TimetableSlot,
  CandidateSchedule,
  CandidateTimelineItem,
  ScheduleConflict,
  GeneratedScheduleResult,
} from '../types';
import {
  parseMinutes,
  formatMinutes,
  addMinutesToTime,
  isTimeOverlapping,
} from './timeUtils';

export function generateSchedule(
  config: GeneralConfig,
  exercises: Exercise[],
  rooms: Room[],
  candidates: Candidate[]
): GeneratedScheduleResult {
  const activeExercises = exercises.filter((e) => e.enabled);
  const slots: TimetableSlot[] = [];
  const conflicts: ScheduleConflict[] = [];

  if (activeExercises.length === 0 || candidates.length === 0) {
    return {
      slots: [],
      candidateSchedules: [],
      totalRounds: 0,
      overallStartTime: config.startTime || '09:00',
      overallEndTime: config.startTime || '09:00',
      conflicts: [],
    };
  }

  // Get classroom mapping for candidates (1->455, 2->457, 3->458, 4->459)
  const getPrepRoomForCandidate = (cand: Candidate, index: number): string => {
    if (cand.prepRoom) return cand.prepRoom;
    const num = index + 1;
    if (config.candidatePrepRooms && config.candidatePrepRooms[num]) {
      return config.candidatePrepRooms[num];
    }
    if (num === 1) return '455강의실 (1번 검토실 ➔ 실습실 전환)';
    if (num === 2) return '457강의실 (2번 검토실)';
    if (num === 3) return '458강의실 (3번 검토실)';
    if (num === 4) return '459강의실 (4번 검토실)';
    return `${455 + num}강의실 (${num}번 검토실)`;
  };

  const evalRoom = rooms.find((r) => r.id === 'room-455') || rooms[0] || {
    id: 'room-455',
    name: config.evalRoomName || '455강의실 (역량평가 실습실)',
    assessors: '수석평가위원 2인',
  };

  const videoRoomName = config.videoRoomName || '456강의실 (실습영상 시청실)';
  const videoWatchMins = config.videoWatchMinutes || 40;
  const transitMins = typeof config.transitMinutes === 'number' ? config.transitMinutes : 10;

  // Base evaluation start time for 1st candidate
  // If useEvalStartTimeAsBase is true, use evalStartTime (e.g. "10:00")
  // Otherwise use startTime + prepMinutes + transitMinutes
  let currentEvalClock = config.evalStartTime || '10:00';
  if (!config.useEvalStartTimeAsBase && config.startTime) {
    // If user prefers specifying prep start:
    const firstEx = activeExercises[0];
    const prepM = firstEx ? firstEx.prepMinutes : 30;
    currentEvalClock = addMinutesToTime(config.startTime, prepM + transitMins);
  }

  // Helper for lunch break
  const handleLunch = (timeStr: string, durationNeeded: number): string => {
    if (!config.hasLunch || config.lunchDurationMinutes <= 0) return timeStr;
    const currentM = parseMinutes(timeStr);
    const lunchStartM = parseMinutes(config.lunchStartTime);
    const lunchEndM = lunchStartM + config.lunchDurationMinutes;

    if (currentM >= lunchStartM && currentM < lunchEndM) {
      return formatMinutes(lunchEndM);
    }
    if (currentM < lunchStartM && currentM + durationNeeded > lunchStartM) {
      return formatMinutes(lunchEndM);
    }
    return timeStr;
  };

  let roundCounter = 1;
  let earliestPrepStartM = 24 * 60;

  // Process each active exercise (Day 1: PT AM 10:00, RP PM 14:30 / Day 2: IB AM 09:30)
  for (let exIdx = 0; exIdx < activeExercises.length; exIdx++) {
    const ex = activeExercises[exIdx];
    const prepMinutes = ex.prepMinutes; // e.g. PT: 30, IB: 50, RP: 30
    const evalMinutes = ex.evalMinutes; // e.g. PT: 20, IB: 50, RP: 30
    const gradeMinutes = ex.gradeMinutes; // e.g. 10

    // Determine Day, Session Period, and Base Evaluation Start Time
    let exDay = ex.day || 1;
    let sessionPeriod = ex.sessionPeriod || (parseMinutes(ex.customEvalStartTime || '10:00') >= 12 * 60 ? 'PM' : 'AM');
    let baseEvalStart = ex.customEvalStartTime;

    if (ex.code === 'PT') {
      exDay = 1;
      sessionPeriod = 'AM';
      baseEvalStart = config.day1PtStartTime || ex.customEvalStartTime || '10:00';
    } else if (ex.code === 'RP') {
      exDay = 1;
      sessionPeriod = 'PM';
      baseEvalStart = config.day1RpStartTime || ex.customEvalStartTime || '14:30';
    } else if (ex.code === 'IB') {
      exDay = 2;
      sessionPeriod = 'AM';
      baseEvalStart = config.day2IbStartTime || ex.customEvalStartTime || '09:30';
    } else if (!baseEvalStart) {
      baseEvalStart = currentEvalClock;
    }

    // Determine Date for this slot
    let slotDate = config.startDate;
    if (exDay === 2) {
      if (config.endDate && config.endDate !== config.startDate) {
        slotDate = config.endDate;
      } else {
        try {
          const d = new Date(config.startDate);
          d.setDate(d.getDate() + 1);
          slotDate = d.toISOString().split('T')[0];
        } catch {
          slotDate = config.startDate;
        }
      }
    }

    // Break between candidates (10 minutes after previous candidate's eval finishes, the next candidate's eval begins)
    const breakAfterEval = typeof config.interCandidateBreakMinutes === 'number'
      ? config.interCandidateBreakMinutes
      : 10;

    let runningCandEvalStartM = parseMinutes(baseEvalStart);

    // Calculate slots for each candidate sequentially
    candidates.forEach((cand, cIdx) => {
      // If lunch break intervenes before start (only on Day 1 if relevant)
      if (exDay === 1 && config.hasLunch && config.lunchDurationMinutes > 0) {
        const lunchStartM = parseMinutes(config.lunchStartTime);
        const lunchEndM = lunchStartM + config.lunchDurationMinutes;
        if (runningCandEvalStartM >= lunchStartM && runningCandEvalStartM < lunchEndM) {
          runningCandEvalStartM = lunchEndM;
        }
      }

      const evalStartM = runningCandEvalStartM;
      const evalEndM = evalStartM + evalMinutes;
      const gradeEndM = evalEndM + gradeMinutes;

      // Preparation time calculation:
      // Preparation MUST end exactly transitMins (10m) before evalStartM!
      const transitEndM = evalStartM;
      const transitStartM = transitEndM - transitMins;
      const prepEndM = transitStartM;
      const prepStartM = prepEndM - prepMinutes;

      if (exDay === 1 && prepStartM < earliestPrepStartM) {
        earliestPrepStartM = prepStartM;
      }

      // Video watching: immediately after this candidate's eval finishes in 455실
      const videoStartM = evalEndM;
      const videoEndM = videoStartM + videoWatchMins;

      const prepRoom = getPrepRoomForCandidate(cand, cIdx);

      slots.push({
        id: `slot-${ex.id}-${cand.id}`,
        day: exDay,
        date: slotDate,
        sessionPeriod: sessionPeriod === 'AM' ? '오전' : '오후',
        exerciseId: ex.id,
        exerciseCode: ex.code,
        exerciseName: ex.name,
        exerciseColor: ex.color,
        exerciseType: 'INDIVIDUAL',
        round: roundCounter++,
        roomId: evalRoom.id,
        roomName: evalRoom.name,
        candidateIds: [cand.id],
        candidateCodes: [cand.code],
        candidateNames: [cand.name],
        prepStartTime: formatMinutes(prepStartM),
        prepEndTime: formatMinutes(prepEndM),
        prepRoomName: prepRoom,
        transitStartTime: formatMinutes(transitStartM),
        transitEndTime: formatMinutes(transitEndM),
        evalStartTime: formatMinutes(evalStartM),
        evalEndTime: formatMinutes(evalEndM),
        gradeEndTime: formatMinutes(gradeEndM),
        videoStartTime: formatMinutes(videoStartM),
        videoEndTime: formatMinutes(videoEndM),
        videoRoomName,
      });

      // Next candidate's evaluation starts 10 minutes after current candidate's evaluation ends
      runningCandEvalStartM = evalEndM + breakAfterEval;
    });

    // Advance session clock
    const lastSlot = slots[slots.length - 1];
    if (lastSlot) {
      const finishM = parseMinutes(lastSlot.evalEndTime);
      currentEvalClock = formatMinutes(finishM + 20);
    }
  }

  // Generate Candidate Schedules
  const candidateSchedules: CandidateSchedule[] = candidates.map((cand, cIdx) => {
    const candSlots = slots.filter((s) => s.candidateIds.includes(cand.id));
    const items: CandidateTimelineItem[] = [];

    candSlots.forEach((s) => {
      // 1. Preparation in assigned room (455, 457, 458, 459)
      if (s.prepStartTime && s.prepEndTime) {
        items.push({
          day: s.day,
          date: s.date,
          timeStr: `${s.prepStartTime} ~ ${s.prepEndTime}`,
          location: s.prepRoomName || getPrepRoomForCandidate(cand, cIdx),
          activity: `과제검토 (${s.exerciseCode} ${s.exerciseName.split(' ')[0]})`,
          exerciseName: s.exerciseName,
          exerciseCode: s.exerciseCode,
          color: s.exerciseColor,
          type: 'PREP',
        });
      }

      // 2. 10-minute movement / waiting buffer
      if (s.transitStartTime && s.transitEndTime) {
        items.push({
          day: s.day,
          date: s.date,
          timeStr: `${s.transitStartTime} ~ ${s.transitEndTime}`,
          location: `${s.prepRoomName?.split(' ')[0] || '검토실'} ➔ 455실 이동`,
          activity: `과제숙지 후 대기 및 455실습실 입실 (10분)`,
          exerciseName: s.exerciseName,
          exerciseCode: s.exerciseCode,
          color: 'amber',
          type: 'TRANSIT',
        });
      }

      // 3. Evaluation in 455강의실
      items.push({
        day: s.day,
        date: s.date,
        timeStr: `${s.evalStartTime} ~ ${s.evalEndTime}`,
        location: config.evalRoomName || '455강의실 (역량평가 실습실)',
        activity: `역량평가 본 실습 (${s.exerciseCode} 평가)`,
        exerciseName: s.exerciseName,
        exerciseCode: s.exerciseCode,
        color: s.exerciseColor,
        type: 'EVAL',
      });

      // 4. Video Watching in 456강의실
      if (s.videoStartTime && s.videoEndTime) {
        items.push({
          day: s.day,
          date: s.date,
          timeStr: `${s.videoStartTime} ~ ${s.videoEndTime}`,
          location: videoRoomName,
          activity: `456강의실 이동 ➔ 실습영상 시청 및 피드백`,
          exerciseName: s.exerciseName,
          exerciseCode: s.exerciseCode,
          color: 'purple',
          type: 'VIDEO',
        });
      }
    });

    // Lunch break item (Day 1)
    if (config.hasLunch && config.lunchDurationMinutes > 0) {
      const lunchEnd = addMinutesToTime(config.lunchStartTime, config.lunchDurationMinutes);
      items.push({
        day: 1,
        date: config.startDate,
        timeStr: `${config.lunchStartTime} ~ ${lunchEnd}`,
        location: '식당 / 휴게실',
        activity: '중식 및 휴식 (점심시간)',
        exerciseName: '점심시간',
        exerciseCode: 'LUNCH',
        color: 'slate',
        type: 'LUNCH',
      });
    }

    // Sort chronologically by Day and Time
    items.sort((a, b) => {
      if (a.day !== b.day) return a.day - b.day;
      const aStart = a.timeStr.split(' ~ ')[0];
      const bStart = b.timeStr.split(' ~ ')[0];
      return parseMinutes(aStart) - parseMinutes(bStart);
    });

    // Conflict detection (strictly within same day)
    for (let i = 0; i < items.length; i++) {
      for (let j = i + 1; j < items.length; j++) {
        const itemA = items[i];
        const itemB = items[j];
        if (itemA.day !== itemB.day) continue;
        if (itemA.type === 'LUNCH' || itemB.type === 'LUNCH') continue;

        const [sA, eA] = itemA.timeStr.split(' ~ ');
        const [sB, eB] = itemB.timeStr.split(' ~ ');

        if (isTimeOverlapping(sA, eA, sB, eB)) {
          conflicts.push({
            candidateId: cand.id,
            candidateName: cand.name,
            timeRange: `${itemA.day}일차 ${sA}~${eA} / ${sB}~${eB}`,
            description: `${itemA.day}일차: ${cand.name}(${cand.code}) 교육생의 일정이 중복됩니다.`,
          });
        }
      }
    }

    return {
      candidate: cand,
      items,
    };
  });

  // Calculate day 1 and day 2 end times
  let day1EndM = 0;
  let day2EndM = 0;
  slots.forEach((s) => {
    const endM = parseMinutes(s.videoEndTime || s.evalEndTime);
    if (s.day === 1 && endM > day1EndM) day1EndM = endM;
    if (s.day === 2 && endM > day2EndM) day2EndM = endM;
  });

  const day1StartStr = earliestPrepStartM < 24 * 60 ? formatMinutes(earliestPrepStartM) : (config.startTime || '09:20');
  const finalEndTimeStr = day2EndM > 0
    ? `1일차 ${formatMinutes(day1EndM)} / 2일차 ${formatMinutes(day2EndM)}`
    : formatMinutes(day1EndM);

  return {
    slots,
    candidateSchedules,
    totalRounds: slots.length,
    overallStartTime: day1StartStr,
    overallEndTime: finalEndTimeStr,
    conflicts,
  };
}

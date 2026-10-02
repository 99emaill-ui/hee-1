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

  const evalRoomName = config.evalRoomName || rooms[0]?.name || '455강의실 (역량평가 실습실)';
  const videoRoomName = config.videoRoomName || rooms[1]?.name || '456강의실 (실습영상 시청실)';

  // Get classroom mapping for candidates (1->main room, 2->prep 2, 3->prep 3, 4->prep 4)
  const getPrepRoomForCandidate = (cand: Candidate, index: number, isPrepDuringEval = false): string => {
    if (cand.prepRoom) return cand.prepRoom;
    const num = index + 1;
    if (config.candidatePrepRooms && config.candidatePrepRooms[num]) {
      if (num === 1 && isPrepDuringEval) {
        return config.candidatePrepRooms[2] || '457강의실 (1번 검토실)';
      }
      return config.candidatePrepRooms[num];
    }
    const evalShort = evalRoomName.split(' ')[0];
    if (num === 1) {
      if (isPrepDuringEval) {
        return `457강의실 (${num}번 검토실)`;
      }
      return `${evalShort} (1번 검토실 ➔ 본실습실 전환)`;
    }
    if (rooms[num]) return `${rooms[num].name.split(' ')[0]} (${num}번 검토실)`;
    return `제${num}검토실`;
  };

  const evalRoom = rooms[0] || {
    id: 'room-455',
    name: evalRoomName,
    assessors: '수석평가위원 2인',
  };

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

    // Determine candidate evaluation order for this exercise:
    // PT: 1, 2, 3 (4: 1, 2, 3, 4) -> offset = 0
    // RP: 2, 3, 1 (4: 2, 3, 4, 1) -> offset = 1
    // IB: 3, 1, 2 (4: 3, 4, 1, 2) -> offset = 2
    let offset = 0;
    if (ex.code === 'PT') {
      offset = 0;
    } else if (ex.code === 'RP') {
      offset = 1;
    } else if (ex.code === 'IB') {
      offset = 2;
    } else {
      offset = exIdx % candidates.length;
    }

    const N = candidates.length;
    const orderedCandidates: { cand: Candidate; origIdx: number }[] = [];
    for (let k = 0; k < N; k++) {
      const candIdx = (offset + k) % N;
      orderedCandidates.push({ cand: candidates[candIdx], origIdx: candIdx });
    }

    // Step 1: Pre-calculate all candidate evaluation timings in rotation order
    interface TimingInfo {
      cand: Candidate;
      origIdx: number;
      orderRank: number; // 1, 2, 3, 4
      currentTransitMins: number;
      evalStartM: number;
      evalEndM: number;
      gradeEndM: number;
      transitStartM: number;
      transitEndM: number;
      prepStartM: number;
      prepEndM: number;
    }

    const sessionTimings: TimingInfo[] = [];

    orderedCandidates.forEach(({ cand, origIdx }, k) => {
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

      // IB만 평가실습 전에 대기시간 10분 주고 PT, RP는 대기시간 삭제 (0분)
      const currentTransitMins = ex.code === 'IB'
        ? (typeof config.transitMinutes === 'number' ? config.transitMinutes : 10)
        : 0;

      const transitEndM = evalStartM;
      const transitStartM = transitEndM - currentTransitMins;
      const prepEndM = transitStartM;
      const prepStartM = prepEndM - prepMinutes;

      if (exDay === 1 && prepStartM < earliestPrepStartM) {
        earliestPrepStartM = prepStartM;
      }

      sessionTimings.push({
        cand,
        origIdx,
        orderRank: k + 1,
        currentTransitMins,
        evalStartM,
        evalEndM,
        gradeEndM,
        transitStartM,
        transitEndM,
        prepStartM,
        prepEndM,
      });

      // Next candidate's evaluation starts 10 minutes after current candidate's evaluation ends
      runningCandEvalStartM = evalEndM + breakAfterEval;
    });

    // Session last candidate's evaluation end time (e.g. 3번 or 4번 피평가자의 실습종료 시간)
    const sessionLastTiming = sessionTimings[sessionTimings.length - 1];
    const sessionLastEvalEndM = sessionLastTiming ? sessionLastTiming.evalEndM : runningCandEvalStartM;

    // Step 2: Push slots with video watching: starts 10 minutes after candidate's evaluation ends,
    // and continues until the session's last candidate's evaluation ends
    // [운영 규칙]
    // 1. 3명일 때: 마지막 사람(3번째 실습자)은 실습 종료 즉시 세션이 마감되므로 영상시청 시간 삭제 (없음)
    // 2. 4명일 때: 3번째 실습자는 4번째 실습자가 평가 중이므로 영상시청 시간(20분) 유지, 마지막인 4번째 실습자만 영상시청 삭제
    sessionTimings.forEach((timing) => {
      const isLastCandidateInSession = timing.orderRank === sessionTimings.length;

      let videoStartStr: string | undefined = undefined;
      let videoEndStr: string | undefined = undefined;

      if (!isLastCandidateInSession) {
        const candidateVideoStartM = timing.evalEndM + 10; // 평가실습 10분 후 시작
        const candidateVideoEndM = sessionLastEvalEndM; // 마지막(3번/4번) 실습종료 시간까지

        if (candidateVideoStartM < candidateVideoEndM) {
          videoStartStr = formatMinutes(candidateVideoStartM);
          videoEndStr = formatMinutes(candidateVideoEndM);
        }
      }

      // Check if prep happens during another candidate's evaluation in 455실
      const isPrepDuringEval = timing.orderRank > 1;
      const prepRoom = getPrepRoomForCandidate(timing.cand, timing.origIdx, isPrepDuringEval);

      slots.push({
        id: `slot-${ex.id}-${timing.cand.id}`,
        day: exDay,
        date: slotDate,
        sessionPeriod: sessionPeriod === 'AM' ? '오전' : '오후',
        exerciseId: ex.id,
        exerciseCode: ex.code,
        exerciseName: ex.name,
        exerciseColor: ex.color,
        exerciseType: 'INDIVIDUAL',
        round: timing.orderRank,
        roomId: evalRoom.id,
        roomName: evalRoom.name,
        candidateIds: [timing.cand.id],
        candidateCodes: [timing.cand.code],
        candidateNames: [timing.cand.name],
        prepStartTime: formatMinutes(timing.prepStartM),
        prepEndTime: formatMinutes(timing.prepEndM),
        prepRoomName: prepRoom,
        transitStartTime: timing.currentTransitMins > 0 ? formatMinutes(timing.transitStartM) : undefined,
        transitEndTime: timing.currentTransitMins > 0 ? formatMinutes(timing.transitEndM) : undefined,
        evalStartTime: formatMinutes(timing.evalStartM),
        evalEndTime: formatMinutes(timing.evalEndM),
        gradeEndTime: formatMinutes(timing.gradeEndM),
        videoStartTime: videoStartStr,
        videoEndTime: videoEndStr,
        videoRoomName,
      });
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

      // 2. 역량평가 대기 (IB만 10분, PT/RP는 대기시간 삭제)
      if (s.transitStartTime && s.transitEndTime && s.transitStartTime !== s.transitEndTime) {
        items.push({
          day: s.day,
          date: s.date,
          timeStr: `${s.transitStartTime} ~ ${s.transitEndTime}`,
          location: `${evalRoomName.split(' ')[0]} 입실 전 대기석`,
          activity: `역량평가 대기 (10분)`,
          exerciseName: s.exerciseName,
          exerciseCode: s.exerciseCode,
          color: 'amber',
          type: 'TRANSIT',
        });
      }

      // 3. Evaluation in evalRoomName
      items.push({
        day: s.day,
        date: s.date,
        timeStr: `${s.evalStartTime} ~ ${s.evalEndTime}`,
        location: evalRoomName,
        activity: `역량평가 본 실습 (${s.exerciseCode} 평가)`,
        exerciseName: s.exerciseName,
        exerciseCode: s.exerciseCode,
        color: s.exerciseColor,
        type: 'EVAL',
      });

      // 4. Video Watching in videoRoomName (starts 10m after eval until last candidate finishes)
      if (s.videoStartTime && s.videoEndTime) {
        items.push({
          day: s.day,
          date: s.date,
          timeStr: `${s.videoStartTime} ~ ${s.videoEndTime}`,
          location: videoRoomName,
          activity: `${videoRoomName.split(' ')[0]} 이동 ➔ 실습영상 시청 및 피드백 (마지막 실습 종료까지)`,
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

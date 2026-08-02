/** Index가 cold start 알람을 처리했으면 Bridge boot flush 스킵 */
let coldStartAlarmHandled = false;

export function markColdStartAlarmHandled(): void {
  coldStartAlarmHandled = true;
}

export function wasColdStartAlarmHandled(): boolean {
  return coldStartAlarmHandled;
}

/** 테스트·핫리로드용 */
export function resetColdStartAlarmHandled(): void {
  coldStartAlarmHandled = false;
}

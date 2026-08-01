export function notifDebug(event: string, payload?: Record<string, unknown>) {
  if (payload) {
    console.log(`[yakmuk:notif] ${event}`, payload);
  } else {
    console.log(`[yakmuk:notif] ${event}`);
  }
}

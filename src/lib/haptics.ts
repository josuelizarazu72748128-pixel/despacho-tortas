export function tapFeedback(ms = 10) {
  if (typeof navigator === "undefined") return;
  if (!("vibrate" in navigator)) return;
  try {
    navigator.vibrate(ms);
  } catch {
    // el dispositivo no soporta vibración: se ignora
  }
}

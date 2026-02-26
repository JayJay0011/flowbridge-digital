export const playNotification = () => {
  if (typeof window === "undefined") return;
  try {
    const AudioContextRef =
      window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextRef) return;
    const context = new AudioContextRef();
    const oscillator = context.createOscillator();
    const gainNode = context.createGain();

    oscillator.type = "sine";
    oscillator.frequency.value = 880;
    gainNode.gain.value = 0.05;

    oscillator.connect(gainNode);
    gainNode.connect(context.destination);

    oscillator.start();
    oscillator.stop(context.currentTime + 0.12);

    oscillator.onended = () => {
      context.close();
    };
  } catch {
    // Ignore audio errors (autoplay restrictions, no audio device, etc.)
  }
};

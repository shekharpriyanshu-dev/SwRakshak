// Web Audio API based pleasant medical chime synthesizer for Medicine Alarms
class MedicalAudioAlert {
  private ctx: AudioContext | null = null;

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    try {
      if (!this.ctx || this.ctx.state === 'closed') {
        const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        this.ctx = new AudioCtx();
      }
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
      return this.ctx;
    } catch (e) {
      console.warn('AudioContext not supported or blocked by browser', e);
      return null;
    }
  }

  // Plays a pleasant 3-tone chime for medicine reminder (Notes: E5 -> G#5 -> B5)
  public playMedicineChime() {
    const ctx = this.getContext();
    if (!ctx) return;

    const notes = [659.25, 830.61, 987.77, 1318.51]; // E5, G#5, B5, E6
    const startTime = ctx.currentTime;

    notes.forEach((freq, index) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, startTime + index * 0.16);

      // Envelope: smooth attack and gentle decay
      gain.gain.setValueAtTime(0.001, startTime + index * 0.16);
      gain.gain.exponentialRampToValueAtTime(0.25, startTime + index * 0.16 + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + index * 0.16 + 0.45);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startTime + index * 0.16);
      osc.stop(startTime + index * 0.16 + 0.5);
    });
  }

  // Plays a gentle single confirmation ping (Note: A5)
  public playCheckPing() {
    const ctx = this.getContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(880, ctx.currentTime); // A5

    gain.gain.setValueAtTime(0.001, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.18, ctx.currentTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.28);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.3);
  }
}

export const medicalAudioAlert = new MedicalAudioAlert();

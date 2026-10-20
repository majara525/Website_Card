// Approximate indicators only. Raw microphone samples never leave this module.
export class SleepSensor {
  constructor(onSample) {
    this.onSample = onSample;
    this.source = null;
    this.lastRms = 0;
    this.recent = [];
    this.lastSnore = 0;
  }

  async start(preferMicrophone = true) {
    if (preferMicrophone && navigator.mediaDevices?.getUserMedia) {
      try {
        this.stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: false, noiseSuppression: false }, video: false });
        this.context = new AudioContext();
        this.input = this.context.createMediaStreamSource(this.stream);
        this.analyser = this.context.createAnalyser();
        this.analyser.fftSize = 2048;
        this.input.connect(this.analyser);
        this.wave = new Float32Array(this.analyser.fftSize);
        this.spectrum = new Uint8Array(this.analyser.frequencyBinCount);
        this.source = "microphone";
        this.timer = setInterval(() => this.sampleAudio(), 2000);
        return this.source;
      } catch (error) {
        this.stop();
      }
    }
    if ("DeviceMotionEvent" in window) {
      if (typeof DeviceMotionEvent.requestPermission === "function") {
        const permission = await DeviceMotionEvent.requestPermission();
        if (permission !== "granted") throw new Error("motion-denied");
      }
      this.source = "motion";
      this.motionListener = event => {
        const a = event.accelerationIncludingGravity || event.acceleration;
        if (!a) return;
        const magnitude = Math.hypot(a.x || 0, a.y || 0, a.z || 0);
        const movement = Math.abs(magnitude - (this.lastMagnitude ?? magnitude));
        this.lastMagnitude = magnitude;
        this.recent.push(movement);
        if (this.recent.length > 100) this.recent.shift();
      };
      window.addEventListener("devicemotion", this.motionListener);
      const available = await new Promise(resolve => {
        const timeout = setTimeout(() => { window.removeEventListener("devicemotion", once); resolve(false); }, 2500);
        const once = () => { clearTimeout(timeout); resolve(true); };
        window.addEventListener("devicemotion", once, { once: true });
      });
      if (!available) { this.stop(); throw new Error("no-motion-events"); }
      this.timer = setInterval(() => {
        const movement = this.recent.length ? this.recent.reduce((a, b) => a + b, 0) / this.recent.length : 0;
        this.recent = [];
        this.onSample({ at: Date.now(), movement, snore: false, source: "motion" });
      }, 10000);
      return this.source;
    }
    throw new Error("no-sensor");
  }

  sampleAudio() {
    if (!this.analyser) return;
    this.analyser.getFloatTimeDomainData(this.wave);
    this.analyser.getByteFrequencyData(this.spectrum);
    const rms = Math.sqrt(this.wave.reduce((sum, value) => sum + value * value, 0) / this.wave.length);
    const movement = Math.max(0, rms - this.lastRms) + Math.max(0, rms - 0.12);
    this.lastRms = rms;
    const hzPerBin = this.context.sampleRate / this.analyser.fftSize;
    let low = 0, high = 0;
    for (let i = 1; i < this.spectrum.length; i++) {
      const hz = i * hzPerBin;
      if (hz >= 60 && hz <= 500) low += this.spectrum[i];
      if (hz > 500 && hz <= 1800) high += this.spectrum[i];
    }
    // Low frequency dominance plus sustained volume is a coarse snore candidate.
    const snore = rms > 0.025 && low > high * 0.55 && Date.now() - this.lastSnore > 12000;
    if (snore) this.lastSnore = Date.now();
    this.onSample({ at: Date.now(), movement, level: rms, snore, source: "microphone" });
  }

  stop() {
    clearInterval(this.timer);
    if (this.motionListener) window.removeEventListener("devicemotion", this.motionListener);
    this.stream?.getTracks().forEach(track => track.stop());
    this.input?.disconnect();
    this.context?.close();
    this.source = null;
  }
}

export class AmbientSound {
  constructor() { this.playing = false; }

  async play(type, volume) {
    this.stop();
    if (type === "off") return;
    this.context = new AudioContext();
    const length = this.context.sampleRate * 4;
    const buffer = this.context.createBuffer(1, length, this.context.sampleRate);
    const data = buffer.getChannelData(0);
    let brown = 0;
    for (let i = 0; i < length; i++) {
      const white = Math.random() * 2 - 1;
      brown = (brown + 0.02 * white) / 1.02;
      data[i] = type === "brown" || type === "waves" ? brown * 3.5 : white * 0.25;
    }
    this.source = this.context.createBufferSource();
    this.source.buffer = buffer;
    this.source.loop = true;
    this.gain = this.context.createGain();
    this.filter = this.context.createBiquadFilter();
    this.filter.type = "lowpass";
    this.filter.frequency.value = type === "rain" ? 2600 : type === "waves" ? 450 : 15000;
    this.source.connect(this.filter).connect(this.gain).connect(this.context.destination);
    this.setVolume(volume);
    if (type === "waves") {
      this.oscillator = this.context.createOscillator();
      this.modGain = this.context.createGain();
      this.oscillator.frequency.value = 0.12;
      this.modGain.gain.value = 0.14;
      this.oscillator.connect(this.modGain).connect(this.gain.gain);
      this.oscillator.start();
    }
    this.source.start();
    this.playing = true;
  }

  setVolume(value) { if (this.gain) this.gain.gain.value = Math.max(0, Math.min(1, value / 100)) * 0.45; }
  stop() {
    try { this.source?.stop(); this.oscillator?.stop(); } catch (_) { /* already stopped */ }
    this.context?.close();
    this.playing = false;
    this.source = null;
  }
}

export class AlarmSound {
  async start() {
    this.stop();
    this.context = new AudioContext();
    this.oscillator = this.context.createOscillator();
    this.gain = this.context.createGain();
    this.oscillator.type = "sine";
    this.oscillator.frequency.value = 620;
    this.gain.gain.value = 0;
    this.oscillator.connect(this.gain).connect(this.context.destination);
    this.oscillator.start();
    let on = false;
    this.timer = setInterval(() => {
      on = !on;
      this.gain.gain.setTargetAtTime(on ? 0.2 : 0, this.context.currentTime, 0.03);
    }, 450);
  }
  stop() {
    clearInterval(this.timer);
    try { this.oscillator?.stop(); } catch (_) { /* already stopped */ }
    this.context?.close();
    this.oscillator = null;
  }
}

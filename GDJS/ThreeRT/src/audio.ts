// Howler.js, as used by GDJS's sound manager (howler-sound-manager), on ThreeRT's sound (`audio` of
// @threert/gameplay): the app decodes, mixes and plays the files of the game. Sounds are played "in the player's head"
// (no position). Volume and rate are applied when a sound starts; a change while it plays restarts nothing.
import { audio } from '@threert/gameplay';
import { getFileInfo } from './manifest';

let nextSoundId = 1;
let globalVolume = 1;
let globalMute = false;

type PlayingSound = { id: number; key: string; startedAt: number; volume: number; rate: number; loop: boolean };

const now = () => (typeof performance !== 'undefined' ? performance.now() : Date.now());

class Howl {
  private _src: string;
  private _assetPath: string | null;
  private _volume: number;
  private _rate: number;
  private _loop: boolean;
  private _muted = false;
  private _sounds = new Map<number, PlayingSound>();
  private _listeners: Record<string, Array<{ fn: Function; once: boolean; id?: number }>> = {};
  private _duration: number;

  constructor(options: any = {}) {
    const src = Array.isArray(options.src) ? options.src[0] : options.src;
    this._src = String(src || '');
    const info = getFileInfo(this._src);
    this._assetPath = info && info.assetPath ? info.assetPath : null;
    this._duration = info && (info as any).duration ? (info as any).duration : 0;
    this._volume = options.volume !== undefined ? options.volume : 1;
    this._rate = options.rate !== undefined ? options.rate : 1;
    this._loop = !!options.loop;
    if (options.onload) this.on('load', options.onload);
    if (options.onloaderror) this.on('loaderror', options.onloaderror);
    if (options.onend) this.on('end', options.onend);
    if (options.onplay) this.on('play', options.onplay);
    Promise.resolve().then(() => {
      if (this._assetPath) {
        audio.preload([this._assetPath]);
        this._emit('load');
      } else {
        this._emit('loaderror', undefined, 'Sound file unknown or not supported: ' + this._src);
      }
    });
  }

  private _emit(event: string, id?: number, message?: any) {
    const listeners = this._listeners[event];
    if (!listeners) return;
    this._listeners[event] = listeners.filter((listener) => !listener.once);
    for (const listener of listeners) {
      if (listener.id === undefined || listener.id === id) listener.fn(id, message);
    }
  }

  private _gain(sound: PlayingSound) {
    return globalMute || this._muted ? 0 : Math.max(0, Math.min(4, sound.volume * globalVolume));
  }

  private _start(sound: PlayingSound) {
    if (!this._assetPath) return;
    sound.startedAt = now();
    audio.play(this._assetPath, {
      key: sound.key,
      gain: this._gain(sound),
      pitch: Math.max(0.25, Math.min(4, sound.rate)),
      loop: sound.loop,
    });
  }

  play(id?: number) {
    const existing = id !== undefined ? this._sounds.get(id) : undefined;
    if (existing) {
      this._start(existing);
      this._emit('play', existing.id);
      return existing.id;
    }
    const sound: PlayingSound = {
      id: nextSoundId++,
      key: 'gdjs-sound-' + nextSoundId,
      startedAt: 0,
      volume: this._volume,
      rate: this._rate,
      loop: this._loop,
    };
    this._sounds.set(sound.id, sound);
    this._start(sound);
    const id2 = sound.id;
    Promise.resolve().then(() => this._emit('play', id2));
    return sound.id;
  }
  private _forEach(id: number | undefined, fn: (sound: PlayingSound) => void) {
    if (id === undefined) this._sounds.forEach(fn);
    else {
      const sound = this._sounds.get(id);
      if (sound) fn(sound);
    }
  }
  stop(id?: number) {
    this._forEach(id, (sound) => {
      audio.stop(sound.key);
      this._sounds.delete(sound.id);
      this._emit('stop', sound.id);
    });
    return this;
  }
  pause(id?: number) {
    this._forEach(id, (sound) => {
      audio.stop(sound.key);
      this._emit('pause', sound.id);
    });
    return this;
  }
  playing(id?: number) {
    let isPlaying = false;
    this._forEach(id, (sound) => {
      if (sound.loop || !this._duration || now() - sound.startedAt < this._duration * 1000) isPlaying = true;
    });
    return isPlaying;
  }
  volume(volume?: number, id?: number): any {
    if (volume === undefined) {
      const sound = id !== undefined ? this._sounds.get(id) : undefined;
      return sound ? sound.volume : this._volume;
    }
    if (id === undefined) this._volume = volume;
    this._forEach(id, (sound) => (sound.volume = volume));
    return this;
  }
  rate(rate?: number, id?: number): any {
    if (rate === undefined) {
      const sound = id !== undefined ? this._sounds.get(id) : undefined;
      return sound ? sound.rate : this._rate;
    }
    if (id === undefined) this._rate = rate;
    this._forEach(id, (sound) => (sound.rate = rate));
    return this;
  }
  loop(loop?: boolean, id?: number): any {
    if (loop === undefined) {
      const sound = id !== undefined ? this._sounds.get(id) : undefined;
      return sound ? sound.loop : this._loop;
    }
    if (id === undefined) this._loop = loop;
    this._forEach(id, (sound) => (sound.loop = loop));
    return this;
  }
  mute(muted?: boolean, id?: number): any {
    if (muted === undefined) return this._muted;
    this._muted = muted;
    if (muted) this._forEach(id, (sound) => audio.stop(sound.key));
    return this;
  }
  seek(seek?: number, id?: number): any {
    if (seek === undefined) {
      const sound = id !== undefined ? this._sounds.get(id) : undefined;
      return sound ? (now() - sound.startedAt) / 1000 : 0;
    }
    return this;
  }
  fade(from: number, to: number, duration: number, id?: number) {
    this.volume(to, id);
    if (to === 0) this._forEach(id, (sound) => audio.stop(sound.key, duration / 1000));
    Promise.resolve().then(() => this._emit('fade', id));
    return this;
  }
  pos() {
    return this;
  }
  stereo() {
    return this;
  }
  orientation() {
    return this;
  }
  pannerAttr() {
    return this;
  }
  duration() {
    return this._duration;
  }
  state() {
    return this._assetPath ? 'loaded' : 'unloaded';
  }
  load() {
    return this;
  }
  unload() {
    this.stop();
  }
  on(event: string, fn: Function, id?: number) {
    (this._listeners[event] = this._listeners[event] || []).push({ fn, once: false, id });
    return this;
  }
  once(event: string, fn: Function, id?: number) {
    (this._listeners[event] = this._listeners[event] || []).push({ fn, once: true, id });
    return this;
  }
  off(event?: string, fn?: Function) {
    if (!event) this._listeners = {};
    else if (!fn) delete this._listeners[event];
    else if (this._listeners[event]) this._listeners[event] = this._listeners[event].filter((l) => l.fn !== fn);
    return this;
  }
}

const Howler = {
  ctx: null,
  usingWebAudio: false,
  noAudio: false,
  autoUnlock: false,
  html5PoolSize: 10,
  volume(volume?: number): any {
    if (volume === undefined) return globalVolume;
    globalVolume = volume;
    return Howler;
  },
  mute(muted: boolean) {
    globalMute = muted;
    if (muted) audio.stop();
    return Howler;
  },
  stop() {
    audio.stop();
    return Howler;
  },
  unload() {
    audio.stop();
    return Howler;
  },
  codecs: (extension: string) => ['ogg', 'mp3', 'wav', 'flac', 'oga'].includes(String(extension).toLowerCase()),
  pos() {
    return Howler;
  },
  orientation() {
    return Howler;
  },
};

export const installAudio = () => {
  const g = globalThis as any;
  g.Howl = Howl;
  g.Howler = Howler;
};

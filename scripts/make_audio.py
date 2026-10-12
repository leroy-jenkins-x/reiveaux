"""Reproduce the story's original, non-silent MP3 effects (Python + FFmpeg)."""
import math
import random
import struct
import subprocess
import tempfile
import wave
from pathlib import Path

RATE = 44100
ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / 'assets' / 'audio'
OUTPUT.mkdir(parents=True, exist_ok=True)

def write(name, duration, sample):
    values = [sample(i / RATE) for i in range(round(duration * RATE))]
    peak = max(abs(v) for v in values)
    assert peak > .01
    values = [v / peak * .88 for v in values]
    assert math.sqrt(sum(v*v for v in values) / len(values)) > .04
    with tempfile.TemporaryDirectory() as temp:
        wav = Path(temp) / (name + '.wav')
        with wave.open(str(wav), 'wb') as stream:
            stream.setnchannels(1); stream.setsampwidth(2); stream.setframerate(RATE)
            stream.writeframes(b''.join(struct.pack('<h', round(v * 32767)) for v in values))
        subprocess.run(['ffmpeg','-hide_banner','-loglevel','error','-y','-i',str(wav),'-codec:a','libmp3lame','-b:a','96k',str(OUTPUT / (name + '.mp3'))], check=True)
    print(name, 'peak=.88', 'seconds='+str(duration))

def bell(t, frequency):
    if t < 0: return 0
    attack = min(1, t / .009)
    return attack * (math.sin(math.tau * frequency * t) * math.exp(-t * 4)
                     + .28 * math.sin(math.tau * frequency * 2.76 * t) * math.exp(-t * 8)
                     + .12 * math.sin(math.tau * frequency * 5.4 * t) * math.exp(-t * 12))

write('chime', 1.15, lambda t: bell(t, 659.25) + .8 * bell(t-.10, 987.77) + .5 * bell(t-.21, 1318.51))
rng = random.Random(47)
write('dice', .36, lambda t: min(1,t/.004) * (math.sin(math.tau*(145*t-105*t*t)) * math.exp(-t*22) + rng.uniform(-1,1)*.55*math.exp(-t*35)))
notes = [261.63,329.63,392,523.25,659.25,783.99,1046.5,1318.5]
def transformation(t):
    value = sum(.6 * bell(t-i*.29, frequency) for i,frequency in enumerate(notes))
    if t > 2.6: value += .8 * bell(t-2.6,523.25) + .7*bell(t-2.6,659.25) + .6*bell(t-2.6,783.99)
    value += math.sin(math.tau * (180*t+85*t*t)) * math.sin(min(t/3.8,1)*math.pi) * .16
    return value
write('transformation', 3.9, transformation)

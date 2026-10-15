"""Word-level transcription with faster-whisper. Usage: transcribe.py <audio> <out.json> [hint words...]
Decodes with ffmpeg (faster-whisper's own PyAV decoder breaks on recent PyAV), prints sentence segments,
writes {duration, segments:[{start,end,text,words:[{w,s,e,p}]}]}. Hint words (names, jargon) go in the
initial prompt so they are spelled right. Set HF_HOME to a writable dir; the 'small' model is ~480 MB."""
import json, subprocess, sys
import numpy as np
from faster_whisper import WhisperModel
src, out, hints = sys.argv[1], sys.argv[2], sys.argv[3:]
pcm = subprocess.run(['ffmpeg', '-v', 'error', '-i', src, '-ac', '1', '-ar', '16000', '-f', 's16le', '-'], capture_output=True, check=True).stdout
audio = np.frombuffer(pcm, np.int16).astype(np.float32) / 32768
model = WhisperModel('small', device='cpu', compute_type='int8')
segs, info = model.transcribe(audio, word_timestamps=True, initial_prompt=('Names: ' + ', '.join(hints) + '.') if hints else None)
data = dict(language=info.language, duration=round(len(audio) / 16000, 3), segments=[])
for s in segs:
    print(f'[{s.start:6.2f}-{s.end:6.2f}] {s.text.strip()}')
    data['segments'].append(dict(start=s.start, end=s.end, text=s.text.strip(),
                                 words=[dict(w=w.word.strip(), s=round(w.start, 3), e=round(w.end, 3), p=round(w.probability, 2)) for w in s.words]))
json.dump(data, open(out, 'w'), indent=1)
print(f"{data['language']}  {data['duration']} s  -> {out}")

---
name: narrated-motion-video
description: Turn a voice recording (narration, story, essay, explainer) into a finished motion-design video whose visuals are timed to the spoken words, in any of the 15 mg-styles-15 styles (collage, cel line-boil, HUD, Bauhaus, pixel, synthwave, 3D, etc.), in 16:9 and/or 9:16, with a ducked music/SFX bed, YouTube-ready loudness and captions. Use when the user gives an audio file and wants a video made to match it, asks to "animate my narration/voiceover/story", or wants a storyboard keyed to a recording. Also covers making a short un-narrated style film from one of the style prompts.
---

# Narrated motion video

Pipeline: **recording → word-timed transcript → concept + shot list keyed to words → assets → storyboard of real rendered frames → approval → animate → mix → render → verify → deliver.**
The picture is code (a web page that draws any time `t`), rendered frame by frame in headless Chromium by the
[mg-styles-15](https://github.com/Vincentwei1021/mg-styles-15) toolkit, which also gives the 15 style prompts and the `mgaudio` sound library.
Nothing here is specific to one style or story: the style prompt sets the look, the recording sets the timing.

Scripts are in `scripts/`, templates in `templates/`. `$K` below means this skill's directory.

> For episodes of a recurring explainer **series** (shared look, cast, section cards and music across videos), use the **explainer-series** skill, which builds on this one.

## 0. Setup (once per session, about 3 min)

```bash
$K/scripts/setup.sh <scratch>/work      # clones mg-styles-15 -> work/mg, makes work/venv, writes work/r.sh
```
- Render with `work/r.sh demos/<slug> [--stills 1.2,3.4] [--page vertical.html] [--out demos/<slug>/out/x.mp4]`.
  r.sh runs from inside `mg/`, so **`--out` is relative to `mg/`** (`demos/...`, never `mg/demos/...`, or the final encode fails after the whole render).
- There is no GPU: r.sh sets SwiftShader flags. Expect ~0.1 s/frame for simple SVG, ~0.7–1 s/frame for heavy Canvas collage; a 60 s film at 30 fps takes ~30–40 min.
- Copy shared textures from `mg/assets/textures` (paper, grain, dust, washi; free-licensed). Font files are NOT in the repo; download OFL fonts from `https://cdn.jsdelivr.net/gh/google/fonts@main/ofl/<family>/<File>.ttf` into `demos/<slug>/fonts/`.

## 1. Intake (ask only what you can't default)

Get or decide, briefly:
- **The recording** (any format ffmpeg reads). Without one, make a 10 s style film straight from a prompt (see "No narration" below).
- **Style**: one of `mg/prompts/*.md`. If unsure, suggest one that suits the story's tone and say why. Cheap styles in this container: Bauhaus, flat vector, line art, collage, cel line-boil, HUD (Canvas 2D, no GPU). The 3D render style needs Blender.
- **Aspect**: 16:9, 9:16 (Shorts/Reels/TikTok), or both. Both means two layouts, not a crop (see step 7).
- **Image source and rights.** Decide this before fetching anything:
  - Drawn-in-code art (no rights issue) or free-licensed photos (Wikimedia Commons, CC0/CC BY; record author and licence).
  - Copyrighted franchise art (comic covers, film stills) is fine for private use. If the user wants to post it (YouTube etc.), say plainly that it risks Content ID claims, demonetisation or strikes, and offer: (a) keep it as is, (b) a more transformative collage with credits, (c) fully original art. Respect their choice and don't re-litigate it.
  - Prefer **Fandom wikis** for franchise art: full-resolution originals via the MediaWiki API (`fetch_images.py wiki`). Wikipedia images are small fair-use thumbnails (~250 px), and `en.wikipedia.org` often returns 429 from cloud IPs (`fetch_images.py wikipedia` works around it).

## 2. Transcribe

```bash
HF_HOME=<scratch>/hf work/venv/bin/python $K/scripts/transcribe.py narration.mp3 transcript.json "Name1" "Name2" ...
python3 $K/scripts/words.py transcript.json            # every word with its start time; low-confidence words flagged
```
Pass proper nouns as hints. **Show the user the transcript** and fix misheard words in the JSON before building on it.

## 3. Concept and shot list (the part that makes it good)

- For long explainers (5+ min): find the script's own structure (cold open, setup, numbered points, recap, next-video tease) and give each section a recurring device: a numbered "reason" card, a colour, a music chapter. Store every word's times in `cues.json` (`words: {word: [t1, t2, ...]}`) and look words up per scene (`wt(word, sceneStart)`), since the same word recurs.

- Find the script's **spine**: one image or metaphor that can carry the whole piece and return at the end (e.g. "every villain is a broken mirror" became a mirror that cracks on "broken", shows a villain in each shard, and closes the film as a shattered title card).
- One shot per sentence or idea; scene changes on sentence boundaries.
- Pick **hit words**: nouns and verbs that can become a visual event (a crack on "broken", a coin flip on "coin", a rip on "scarred", a line drawn on "line"). Aim for 1–3 per sentence. Short on-screen keywords in the style's typography (ransom notes, HUD labels, hand-lettering) echo the voice without becoming full subtitles.
- Read the style prompt's **Signature features** and map each one to a moment.
- Handle sensitive beats (deaths, violence) with an established visual metaphor, and offer the user a choice of tone.
- If the narration ends abruptly, propose a short title or hold card (1–2 s) and ask whether to keep it.
- Write `cues.json` (`templates/index.html` documents the shape): `{fps, step, duration, scenes:[{id,t}], w:{word: start_seconds}}`. **Picture and sound both read this one file.**

## 4. Assets

- `fetch_images.py` (wiki / wikipedia / commons). Writes `meta.json` with sources for the credits.
- Crops: `crops.py --grid img out.jpg` to estimate positions, then `crops.py dir boxes.json sheet.jpg`. **Look at the sheet** and fix the boxes; first guesses usually miss faces.
- Treatment follows the style. For collage: halftone, white scissor edge or torn-paper rim (PIL); images that already have alpha are ready-made cut-outs. Plain backgrounds can be keyed out with OpenCV (Lab distance from the background, morphological open to strip thin lines and text, keep the largest component, `cv2.inpaint` leftover marks). GrabCut also works. `rembg` needs a model download that is usually blocked.
- Busy covers don't need cutting out: torn panels and shapes clipped from them (shards, windows, frames) work in most collage styles.

## 5. Build the page

Start from `templates/index.html`. Follow the chosen style prompt's **Suggested technical route**, **Rules** and **Signature features**. Key rules:
- Every frame is a pure function of `t`; use seeded randomness; quantise time to the style's rate (`C.step`: 12 for collage/stop-motion; 24 fps "on 2s" for cel, switching to 1s for fast action and 3s for holds; full fps for smooth styles).
- Key events to words: `on(Wd.x)`, `lift(Wd.x)` (slap: scale up, overshoot, settle), `prog(Wd.x, dur)`. A hit should land on the word's start, or one step before it.
- **Fonts must exist locally.** A missing font makes `document.fonts.load` reject and the render hangs at `__ready`. It does not fall back.
- In this container, Canvas 2D is more reliable than WebGL/Three.js. Hand-project simple 3D, such as wireframes, in 2D.
- Hybrid styles work: e.g. flat-vector shapes that move smoothly with elastic pops, plus ink outlines and cel FX redrawn on 2s (line boil). Pick the base style for structure and the second for texture, and state the split up front.
- Code-drawn characters can carry a story if each has one signature trait (a hairstyle, a mark, a colour) and a flat geometric body; draw a `person()` helper with pose and face options and reuse it everywhere.

## 6. Storyboard and approval (always before the long render)

```bash
work/r.sh demos/<slug> --stills 0.8,1.7,4.6,...      # 1–2 stills per shot, at the hit words
work/venv/bin/python $K/scripts/storyboard.py panels.tsv storyboard.png 3 fonts/<font>.ttf
```
`panels.tsv`: `still<TAB>"3 · 7.58 s on 'code'"<TAB>"narration line"<TAB>visual note`. Review your own sheet first: overlaps, clipped text, empty frames, unreadable elements. Fix those, then send it with a shot table and the 1–3 open decisions. **Wait for approval.**

## 7. Second aspect ratio

Make a separate `vertical.html` (1080×1920) with the same helpers, cues and audio, re-laid out per scene (stack where 16:9 sits side by side; split scenes top/bottom). Keep key content inside the Shorts/Reels safe area: x 60–960, y 180–1560. Never edit a page a running render has loaded; write the variant to its own file. Render with `--page vertical.html --out demos/<slug>/out/video_vertical.mp4`. Two renders can run in parallel.

## 8. Sound

1. Copy `templates/bed.py`, pick the recipe matching the prompt's `Sound:` line (or the subject: e.g. `guofeng` pentatonic for an East-Asian-flavoured world), and place SFX at word times. Export the bed at about −20 LUFS.
   - **Longer than ~2 minutes: render in chapters.** One process for a 9-minute bed was OOM-killed at ~14 GB (every track and bus is a full-length buffer). Make the bed script take `<t0> <t1> <out>` (size the recipe to `t1 - t0 + 0.6`, only place SFX inside the window), then run `$K/scripts/bed_chapters.sh <venv python> bed.py out/bed.wav <duration> <boundaries...>`. Put boundaries on section changes; each chapter becomes its own music cue, which suits explainers with numbered sections.
2. `$K/scripts/mix.sh narration.mp3 out/bed.wav out/audio.wav <duration>`: voice cleanup, sidechain ducking of the bed under the voice, two-pass loudnorm to **−14 LUFS**, then an oversampled limiter that keeps the true peak under −1 dBTP.
3. The renderer muxes `demos/<slug>/out/audio.wav` automatically.
- The repo's `samples/index.json` lists instrument sets that are missing or partial on disk (piano, kalimba, harp, dantranh...), which raise `LibsndfileError` mid-render. The template counts an instrument as available only when every indexed file exists, so recipes use their synth fallbacks.
- With no narration, export the bed itself at `lufs=-14, tp=-2.3` (AAC adds ~0.8 dB of peak), then mux with `-t <duration>`.

## 9. Render, monitor, verify

- **Long videos: render a pilot first.** `--from 0 --to <s> --out demos/<slug>/out/pilot_video.mp4` renders one section; mux its audio slice with `ffmpeg -i pilot_video.mp4 -i out/audio.wav -map 0:v -map 1:a -c:v copy -c:a aac -t <s>`. Get approval on pacing and sound before the multi-hour full render. Flat/line styles render at ~0.5 s/frame, so about 2 h for 9 minutes at 30 fps.
- Launch the render with Bash `run_in_background` and a long timeout; you'll be notified when it finishes. `$K/scripts/progress.sh` shows frames done, since the r.sh log is buffered until the end.
- `$K/scripts/check.sh video.mp4 sync.jpg <hit-word times...>` checks specs, loudness, held-frame stepping, and frames either side of each hit. **Look at the sync sheet.**

## 10. Deliver

- Chat file limit is 30 MB: send `share_copy.sh` previews and say they are previews.
- Put full-quality masters in the user's project under `exports/`. Don't commit large media or third-party art: add `exports/` to `.git/info/exclude`, which keeps the tree clean without pushing anything.
- Captions: `make_srt.py transcript.json out.srt <duration>`.
- For YouTube: title options, a description crediting each artwork source (from `meta.json`), upload settings, and the rights caveat if franchise art was used.

## No narration (a 10 s style film from a prompt)

Same pipeline without steps 2 and 8.2: invent a topic, send the whole style prompt's brief to yourself, write `cues.json` beats on the music grid, show a storyboard of real stills, then render. The original films in `mg/videos/` show the quality bar for each style.

## Honest reporting

After each render, report specs (duration, resolution, fps, LUFS, peak), which hits you checked, and the top 2–4 weaknesses. One pass rarely matches the originals, which went through two review rounds with `mg/rubric.md`; offer a review round.

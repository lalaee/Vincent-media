---
name: explainer-series
description: Produce episodes of a narrated YouTube explainer series (e.g. "Why it sucks to be X", "Every time Y happened", lore and franchise breakdowns, history or science explainers) as hand-made-looking motion graphics in a flat-vector + frame-by-frame line-boil hybrid, with code-drawn characters and no copyrighted art. Keeps a series "bible" (palette, fonts, characters, section cards, music) so every episode looks like the same show, and turns each new voice-over into a storyboard, pilot and full render. Use when the user sends narration for a series episode, wants to start a new series in this format, or asks for "another one like the Avatar video". Builds on the narrated-motion-video skill.
---

# Explainer series

One **series** = a bible that never changes between episodes. One **episode** = a voice-over + a scene plan + a scenes file.
The engine (ink brush, flat shapes, characters, cards, FX, section cards, wipes) and a library of explainer scene patterns
are shared, so an episode is mostly *deciding* what to show and when, not re-building the look.

`$N` = the narrated-motion-video skill dir (setup, transcription, mixing, checks, storyboard, delivery scripts).
`$K` = this skill's dir. `examples/avatar-seven-havens/` is a complete worked episode: bible, name fixes, plan and 42 scenes.

## The format (what made video 1 work)

- **Look:** flat colour shapes that move smoothly with elastic pops (30 fps), plus ink outlines, hand-lettering and cel FX (bursts, lightning, smoke, spirit wisps) redrawn every ~2.5 frames, so lines "boil". Paper grain on top, and a flat colour-block wipe into each scene.
- **Characters:** flat geometric people with one signature trait each (hairstyle, forehead mark, outfit colour) defined once in the bible and reused by name. No franchise artwork, so there is no rights risk on YouTube.
- **Structure:** cold open (the hook and the stakes) > title card > optional spoiler warning > "set the scene" (timeline, map, what changed) > **numbered section cards** ("REASON 1…N") with 2–4 scenes each > recap checklist > tease of the next episode. Ending on the next episode's topic chains the series.
- **Timing:** every visual beat is keyed to a spoken word, with something changing every 3–4 s. Scenes start on sentence boundaries.
- **Sound:** your voice on top, the series' music recipe underneath (one cue per chapter), SFX on hit words, a swish on every wipe, a hit and chime on every section card; mastered to −14 LUFS.

## Start a new series (once)

1. Copy `$K/templates/series.json` to `series/<name>/series.json` in the user's repo, and agree on:
   - **palette:** the keys `paper ink light grey red accent accent2 highlight glow night sand skin ok`, plus any subject colours (e.g. the four elements);
   - **section label** ("REASON", "RULE", "MYTH", "PART") and the card colours;
   - **characters:** `{name: {skin, top, hair: bun|bob|bald|tail|white|helmet, mark, face}}`;
   - **music:** `recipe` + `args` (`guofeng` for East-Asian worlds, `darksynth`/`synthwave` for sci-fi, `lofi` for essays, `ambient`, `explainer`, ...);
   - **fonts:** OFL files from `https://cdn.jsdelivr.net/gh/google/fonts@main/ofl/<family>/<File>.ttf` into `series/<name>/fonts/` (`hand` = brush/marker, `label` = rounded sans).
2. Start `series/<name>/fixes.json` for names Whisper mishears (`{"Cora": "Korra"}`). Grow it every episode.
3. Make a 1-scene test episode and show the user a still of the cast and a section card before episode 1.

## Each episode

```bash
$N/scripts/setup.sh <scratch>/work                        # once per session: toolkit, venv, r.sh
$K/scripts/new_episode.sh work/mg <slug> series/<name>/series.json series/<name>/fonts
cd work/mg/demos/<slug> && cp <recording> narration.mp3
HF_HOME=<scratch>/hf ../../../venv/bin/python $N/scripts/transcribe.py narration.mp3 transcript.json <names...>
python3 $K/scripts/fix_names.py transcript.json series/<name>/fixes.json     # then show the user the transcript
python3 $N/scripts/words.py transcript.json                                   # every word with its time
#   write plan.json + scenes.js (below)
python3 $K/scripts/build_cues.py transcript.json plan.json cues.json
../../../r.sh demos/<slug> --stills <1-2 times per scene>                     # storyboard frames
../../../venv/bin/python $N/scripts/storyboard.py panels.tsv storyboard.png 4 fonts/<label>.ttf
#   approval  ->  sound
$N/scripts/bed_chapters.sh ../../../venv/bin/python episode_bed.py out/bed.wav <duration> <chapters...>
$N/scripts/mix.sh narration.mp3 out/bed.wav out/audio.wav <duration>
#   pilot (first ~90-110 s)  ->  approval  ->  full render
../../../r.sh demos/<slug> --from 0 --to <s> --out demos/<slug>/out/pilot_video.mp4
../../../r.sh demos/<slug>                                                     # run_in_background, long timeout
$N/scripts/check.sh out/video.mp4 out/sync.jpg <hit times...>
```

### plan.json

```json
{ "fps": 30, "tail": 0.8,
  "scenes": [["open", 0], ["title", "today@25"], ["sec1", 107.2], ["pastlives", "past@108"], ...],
  "sections": {"1": "YOUR LAST LIFE IS THE VILLAIN", ...},
  "chapters": [0, 41.6, 107.2, ...],
  "sfx": [{"word": "prison", "after": 8, "kind": "impact:metal", "gain": -6}, ...] }
```
- **scenes:** ids must match keys in `scenes.js`. A start can be seconds or `"word@after"` (first time the word is spoken after that time, minus a 0.3 s lead). Number the section cards `sec1..secN`; they render from `sections` automatically.
- **chapters:** music chapters (≤ ~70 s each), on section boundaries. Bed memory is bounded per chapter.
- **sfx:** kinds are listed in `templates/episode_bed.py`. Scene wipes and section cards get their SFX automatically.

### scenes.js

Start from `templates/scenes_starter.js` (and read `examples/avatar-seven-havens/scenes.js`). Use **patterns** for the recurring beats (one line each, all word-triggered):

| pattern | for |
|---|---|
| `titleCard` | kicker, big title, sub-tag, icon row |
| `warning` | spoiler / content warning |
| `timeline` | eras, then a "+N YEARS" gap to NOW |
| `crossedOut` | things that no longer exist, X'd out on their words |
| `bars` | smaller / poorer / scarier comparisons; optional "They hide." end beat |
| `walledMap` | settlements or places on a map, one highlighted |
| `rule` | allowed vs forbidden, with a verdict stamp |
| `versus` | split screen, two characters, two captions |
| `twoDoors` | a dilemma |
| `roster` | mentors / allies vs an empty, crossed-out roster |
| `posterPair` | NEEDED vs WANTED, any contradiction |
| `checklist` | the recap |
| `nextTease` | cast fades out; the next-episode button |

Draw the rest as **custom scenes** with the engine vocabulary: `person(cx, cy, s, {char, arms, face, flip})`, `shape`, `ink`, `hand`, `label`, `card`, `burst`, `cross`, `star`, `wisp`, `ringWall`, `scaled(..., pop(t))`. Time comes from `E.T` and `E.S0`, the boil index from `E.B` (never bare `T`/`S0`/`B`). Put series-specific glyphs (e.g. element icons) at the top of scenes.js and reuse them in patterns via `draw` callbacks.

**Planning guidance**
- Read the transcript for its spine and structure first: hook, stakes, setup, numbered points, recap, tease. Name the section cards after each point in a short, punchy phrase.
- About one scene per 10–15 s, with a beat every 3–4 s keyed to nouns and verbs ("prison" → bars slam, "cataclysm" → burst, "lightning" → bolt).
- Prefer showing over captioning: a few hand-lettered keywords per scene, never full subtitles (captions go in the `.srt`).
- Sensitive beats (deaths, violence) use established symbols: fading figures, broken links, a light going out.
- Long scenes (> 12 s) need several word-keyed beats, or split them.

## Review gates (always)

1. **Transcript:** names fixed.
2. **Storyboard:** about 30 frames across the whole episode. Look at your own sheet first: overlaps, tiny figures, text on heads, missing glyphs (Fredoka has no arrows, so write `>`).
3. **Pilot:** the first section rendered with the full mix; the user checks pacing, music level and characters.
4. **Full render.** Report specs, hits checked, and 2–4 honest weaknesses.

## Practical numbers

- Render: ~0.45 s/frame at 1080p30, so a 9-minute episode takes ~2 h. Run pilot and full renders in the background; check `$N/scripts/progress.sh`.
- Bed: ~1 min per 50 s chapter. One process for a whole 9-minute bed was OOM-killed at ~14 GB; always use chapters.
- Mix: −14 LUFS; the limiter leaves room for AAC so the video stays under −1 dBTP.
- Deliver: 16:9 master to `exports/` (git-ignored via `.git/info/exclude`), a share copy under 30 MB, `.srt` captions, and YouTube notes (title options, description, chapters from the section cards' start times, which YouTube shows as chapters).

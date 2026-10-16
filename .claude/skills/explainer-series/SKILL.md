---
name: explainer-series
description: Produce episodes of a narrated YouTube explainer series (e.g. "Why it sucks to be X", "Every time Y happened", lore and franchise breakdowns, history or science explainers) as hand-made-looking motion graphics in a flat-vector + frame-by-frame line-boil hybrid, with code-drawn characters and no copyrighted art. Keeps a series "bible" (palette, fonts, characters, section cards, music) so every episode looks like the same show, and turns each new voice-over into a storyboard, pilot and full render. Use when the user sends narration for a series episode, wants to start a new series in this format, or asks for "another one like the Avatar video" or a Ladeeda Worlds episode (the user's YouTube channel; its profile and upload-notes template live here). Also makes each episode's social pack (Instagram/TikTok carousels in 4:5 and 9:16, a music-only bed, captions) and publishes everything to the posts repo. Builds on the narrated-motion-video skill.
---

# Explainer series

One **series** = a bible that never changes between episodes. One **episode** = a voice-over + a scene plan + a scenes file.
The engine (ink brush, flat shapes, characters, cards, FX, section cards, wipes) and a library of explainer scene patterns
are shared, so an episode is mostly *deciding* what to show and when, not re-building the look.

`$N` = the narrated-motion-video skill dir (setup, transcription, mixing, checks, storyboard, delivery scripts).
`$K` = this skill's dir. `examples/avatar-seven-havens/` is a complete worked episode: bible, name fixes, plan (original voice; `plan_charlotte.json` is the same plan retimed to the second narrator) and 42 scenes.
`examples/green-lantern-sample/` shows starting a *new* series: a bible (masked heroes, a glowing-construct look, darksynth) and 5 sample scenes (cast line-up, a construct drawing itself, an oath card, a section card, versus). Render a sample like this for the user before episode 1 of any new series.

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
   - **characters:** `{name: {skin, top, hair: bun|bob|bald|tail|white|helmet, hairC, mark, mask, face}}`. One signature trait each; `mask` gives a domino mask. Keep suit colours distinct from the backgrounds they will stand on (green on green vanishes).
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
python3 $K/scripts/check_cues.py cues.json scenes.js                          # every cue word spoken in its scene?
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
- Something must be on screen within ~0.5 s of every scene start (a title, dim figures that light up when named). Never leave a scene empty until its first cue word.

## Re-voicing an episode (new narrator, new take)

The visuals key off words, so a new recording of the same script only needs its times moved:
```bash
transcribe.py new.mp3 transcript_new.json <names...> && fix_names.py transcript_new.json series/<name>/fixes.json
python3 $K/scripts/retime.py transcript_old.json transcript_new.json plan.json plan_new.json   # aligns word by word
python3 $K/scripts/build_cues.py transcript_new.json plan_new.json cues.json
python3 $K/scripts/check_cues.py cues.json scenes.js      # MUST be clean
```
A new voice gets names transcribed differently ("Aang" > "Ang", "Toph" > "Tof"). A cue word that is never spoken silently never fires: the character or highlight just doesn't appear. `check_cues.py` lists them; add each to `fixes.json` and rebuild.
Then check sync stills on a handful of hit words, rebuild the bed on the new chapters, and render a pilot. `build_cues.py` also indexes spelled-out numbers as digits ("two hundred and twenty five" -> `225`), so number triggers survive however the narrator reads them.

## Review gates (always)

1. **Transcript:** names fixed, and `check_cues.py` clean.
2. **Storyboard:** about 30 frames across the whole episode. Look at your own sheet first: overlaps, tiny figures, text on heads, missing glyphs (Fredoka has no arrows, so write `>`).
3. **Pilot:** the first section rendered with the full mix; the user checks pacing, music level and characters.
4. **Full render.** Run `$N/scripts/review.py` (levels 1+2, with `--cues cues.json --scenes scenes.js`), look at every sheet, fix and patch before sending. Report specs, hits checked, and 2–4 honest weaknesses.
5. **Social pack:** both carousel sheets checked, captions backed by the script, then publish.
6. **Notes after delivery:** fix only the named seconds with `$N/scripts/patch.sh` (narrated-motion-video section 11), never a full re-render.

## Social pack (every episode, after the final review)

Every finished episode also gets a carousel, a music-only bed and a publish to the posts repo (`lalaee/ladeeda-posts`: `Long form/`, `Short form/`, `Carousels/`, `Channel art/`).

```bash
# 1. carousel: cover + setting + one slide per numbered section + call to action (~10 slides)
$K/scripts/new_carousel.sh work/mg <slug>-carousel <episode>/series.json <episode>/fonts 10
#    write scenes.js (s1..sN, set N) from templates/carousel_starter.js; full example: examples/avatar-seven-havens/carousel.js
$K/scripts/render_carousel.sh work <slug>-carousel          # out/instagram-4x5/01.png.., out/tiktok-9x16/.., sheet per size
# 2. music bed for the posts: the episode's music, no voice, no SFX (full length + 60 s from the title card)
$K/scripts/social_bed.sh work/mg/demos/<slug> work/venv/bin/python <out dir>
# 3. publish (clone the posts repo first; videos and audio go through Git LFS)
$K/scripts/publish.sh <posts repo> long <folder> master.mp4 share.mp4 captions.srt <slug>-youtube.md <out dir>/*.m4a
$K/scripts/publish.sh <posts repo> carousel <folder> out/instagram-4x5 out/tiktok-9x16 caption.md
#    then add a row for each new folder to the posts repo README and push
```

**Carousel rules**
- Sizes: 1080×1350 (Instagram/Facebook) and 1080×1920 (TikTok photo mode, Stories). Same scenes file; the illustration zone grows a little on 9:16 (capped at 1.15× so art stays within ~860 px of width).
- **Every claim must be backed by the episode script.** Where the script hedges (`[CHECK]`, "may", "might"), the slide hedges too. Short captions: 2 lines of ~42 characters.
- Slide 1 is the cover in the series opener ("Why it sucks to be…"); the last slide is the episode's dilemma plus "Full video on YouTube: Ladeeda Worlds"; every slide carries the channel name, `n/N` and `swipe >` (except the last).
- Use the episode's own characters and colours so the posts match the video.
- **Review:** look at both contact sheets (`out/sheet-*.jpg`) for overlaps, text touching figures and cut-off art before publishing. The first cut of the Avatar carousel had five such problems.
- Write `caption.md` next to the slides: Instagram caption, TikTok caption, hashtags (channel tag always), alt text for slide 1, and the music bed to use. Example: `examples/avatar-seven-havens/carousel-caption.md`.

**Music bed:** `social_bed.sh` re-renders the bed with `MUSIC_ONLY=1` (the bed script skips every SFX), then masters it to about −16 LUFS with peaks below −1 dBTP. Give the user the music-only files, not the narrated mix: narration would talk over the post.

**Channel art** (once, or on a rebrand): `examples/ladeeda-channel-art/scenes.js` draws the profile picture (800×800, art inside the centre circle) and the banner (2560×1440; title, tagline and key art inside the 1546×423 safe area, extra doorways for desktop and TV). Render with a page per size, as for carousels, and check the safe-area crop before sending.

## Practical numbers

- Render: ~0.45 s/frame at 1080p30, so a 9-minute episode takes ~2 h. Run pilot and full renders in the background; check `$N/scripts/progress.sh`.
- Bed: ~1 min per 50 s chapter. One process for a whole 9-minute bed was OOM-killed at ~14 GB; always use chapters.
- Mix: −14 LUFS; the limiter leaves room for AAC so the video stays under −1 dBTP.
- Deliver: 16:9 master to `exports/` (git-ignored via `.git/info/exclude`), a share copy under 30 MB, `.srt` captions, and YouTube notes.

## Channel: Ladeeda Worlds

The user's episodes are released on the YouTube channel **Ladeeda Worlds**; its profile is `channel/ladeeda-worlds.json` (tagline, second-person voice, formats with their title patterns and playlists, description footer, hashtags, pinned-comment style). Every series in this skill is one of its formats ("Why It Sucks To Be…" uses `REASON` cards, "How You Would Die In…" uses `WAY` cards, plus full stories). When writing a new episode or series, keep the voice: second person, ~10 minutes, original code-drawn art, ending on the next episode's tease.

**YouTube notes:** fill `templates/youtube_notes.md` from the channel profile and the episode: titles in the series pattern, a second-person description opener, chapters from the final video's scene starts (0:00 first), the channel footer, hashtags, tags, a pinned-comment dilemma, playlist, end-screen placement and the rights line. Write it to `<slug>-youtube.md` and send it with the video. `examples/avatar-seven-havens/youtube.md` is a finished example.

**Channel look and trailer:** `channel/ladeeda-worlds.series.json` is the channel's own bible (dark night base, gold `highlight`, purple `glow`, a gold-hoodie `you` character, darksynth bed); start new series from it so the channel looks consistent. `examples/ladeeda-trailer/` is the 83 s channel trailer (Backrooms, deadly planet, worst year in history, the pitch, the three formats, 'pick a door' end card). For straight-edged rooms, doors and frames, use its `poly()` helper (fill with `line: 0`, then straight 2-point `ink` edges): `shape()` outlines are splines, so a 4-point rectangle comes out oval.

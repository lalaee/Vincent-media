---
name: youtube-thumbnail
description: Make a YouTube thumbnail (1280x720), plus matching TikTok (1080x1920) and Instagram (1080x1350) covers, in the Ladeeda Worlds house style - a detailed cel-shaded portrait of the episode's main character matched to the character's real design (fetched from its Fandom wiki), on white, with a two-word caption and a hand-drawn arrow. Use when asked for a thumbnail, cover image, TikTok/Instagram/Reels cover or "the portrait thumbnail" for an episode.
---

# YouTube thumbnail (detailed portrait style)

The house style the user chose:
- A **detailed, cel-shaded bust** of the episode's main character, with flat colour, one shadow tone and 6–9 px dark ink lines.
- The character has a strong expression that sells the title. For "Why It Sucks To Be…" that means crying, a bruise and a bandage.
- A **plain white** background.
- A **two-word caption** on the right in black, lower case: one light word above and a bold word or phrase below, e.g. "worst / **job ever**". The font is Fredoka 400/700.
- A **hand-drawn curved arrow** from the caption to the character.

Finished example: Pavi for *Why It Sucks To Be the Avatar in Seven Havens*, in `examples/pavi-seven-havens/`, published to `ladeeda-posts/Long form/<episode>/thumbnails/thumbnail-d-portrait.png`.

`$T` = this skill's folder. `$K` = `explainer-series`. Work happens inside the mg harness (`r.sh`).

## 1. Get the real design first (never draw from memory)

The user checks the likeness against the show, and the first attempt failed because it was made up: black hair, a bun and a blue tunic, when the real Pavi has none of those.

```bash
mkdir ref-<name> && python3 -I $T/scripts/get_wiki_ref.py <wiki>.fandom.com "<Page title>" ref-<name> --max 6
```

- This writes `infobox.txt` (eyes, hair, nation, age…) and downloads the infobox image plus other images from the page.
- **Look at the images**, then write down the design as a short spec before you draw. Pavi's spec, for example:
  - dark-purple messy wavy hair flaring out at the sides;
  - side-swept spiky bangs and a cowlick;
  - a long low ponytail over her shoulder with a tie;
  - a yellow headband on the crown;
  - big green eyes and brown skin;
  - a yellow-green shawl with a white flower/leaf brooch and a green gem, and a salmon top.
- Fact-check the **caption** too: it must be true to the wiki page, not just the script. Reuse the episode's `factcheck/report.md` (explainer-series `wiki_check.py`) if it exists.
- Anything else in the picture (a background place, a prop, a creature, a second character) is drawn from its wiki reference too. Get it with `get_wiki_ref.py` or explainer-series `wiki_check.py --images 4`; never invent it.
- Note any spelling the wiki gives (e.g. **Ellora**) and flag it if the episode spells it differently.
- If the page title is unknown, search with `api.php?action=query&list=search&srsearch=<name> <show>`.

**Rights:** a faithful drawing of a franchise character is fan art. That's lower risk than screenshots, but not zero. Say so once to the user. Never use screenshots or the wiki images themselves in the thumbnail.

## 2. Start the project

```bash
$T/scripts/new_thumb.sh work/mg <slug>-thumb <episode demo dir>     # 1280x720 page, one scene "d", portrait.js + scenes.js templates
```

## 3. Draw the portrait (`portrait.js`)

Start from `templates/portrait_template.js`: Pavi, fully built. Keep its structure and change the shapes and palette to match the spec.
- `portrait(x, cx, cy, s)` draws in a local space: the head centre is at (430, 330), the cowlick tip near y 72, the chin near 528, the shoulders near 575, and the clothes run down to y 900 so they bleed off the frame.
- The helpers are `path` / `fill` / `stroke` / `clipTo` / `dot`. Shadows are drawn with `clipTo(shape, …)`.
- **Layer order:**
  1. back hair
  2. top and neck
  3. clothes
  4. brooch
  5. ponytail
  6. ears
  7. face with cel shadow, blush and bruise
  8. bangs
  9. **headband on top of the bangs**
  10. side locks and cowlick
  11. bandage
  12. brows
  13. eyes
  14. tears
  15. nose and mouth

**What the user corrected:**
- **Likeness beats invention.** The palette, hair shape, accessories and eye colour must come from the reference.
- **The hair silhouette must flare.** Use spiky, wavy locks flaring out at the sides, built from `Q` curves; a smooth outline reads as a helmet.
- **The headband must show.** Draw it after the bangs, up on the crown.
- **Tears:** a thin trail that widens down the cheek and ends in a round bead, plus a separate falling drop with a pointed top and round bottom, each with a small white shine. Thick tubes ending in arrow shapes looked wrong.
- **The arrowhead must be built from the curve's end tangent** (control point → tip, ±0.5 rad, 30 px). Use `arrow()` in `templates/scenes_template.js`. A hand-placed head didn't meet the line.
- **Crop a bit below the shoulders.** Too much clothing wastes the frame. Use `portrait(x, 400, 332, 1.17)` with the head top near y 30, the face filling about half the height, and the caption at x ≥ 770.
- **Accessories inside the crop.** If the crop cuts an accessory, move or scale it up into view; Pavi's brooch went to 0.7×, sitting just under the neckline. Don't leave half a shape on the edge.

## 4. Render and check (every iteration)

```bash
r.sh demos/<slug>-thumb --stills 0.5                                   # -> out/stills/t00.50.png
python3 $T/scripts/compare.py out/stills/t00.50.png check.jpg --ref ref-<name>/<infobox image> [--zoom x0,y0,x1,y1]
```

Look at `check.jpg` every time:
- the drawing next to the real character: hair colour and shape, accessories, eyes, clothes;
- the **168×94 phone view** in its corner: is the face clear and the caption readable?

Use `--zoom` on details such as tears, eyes and the arrow joint. `compare.py` fails unless the image is 1280×720 and under 2 MB. Keep the bottom-right corner clear, because the timestamp covers it.

Fix the problems, re-render, and only then send the image to the user. Expect a few rounds of small notes: likeness → details → crop.

## 5. Deliver

- Send the PNG, plus the side-by-side when likeness is the question.
- After approval, publish it: `$K/scripts/publish.sh <posts repo> long "<episode folder>/thumbnails" thumbnail-d-portrait.png`.
- Copy the final `portrait.js` and `scenes.js` into `examples/<character>-<show>/` in this skill.
- Optional: 2–3 concept variants for YouTube "Test & Compare". See scenes `a`–`c` in `$K/examples/avatar-seven-havens/thumbnail/scenes.js` (wanted poster, hero→villain, two elements = prison).

## 6. TikTok and Instagram covers (same portrait, vertical layout)

Once the YouTube thumbnail is approved, make the vertical versions from the **same `portrait.js`**. Don't redraw anything.

`new_thumb.sh` already made `tt.html` (1080×1920) and `ig.html` (1080×1350), both pointing at `scenes_social.js` (template: `templates/scenes_social_template.js`).
- The layout stacks: the caption on top (centred, "worst" light and "job ever" bold), the portrait below, and the curved arrow running from the caption down to her head. The body bleeds off the bottom.
- Per-format numbers live in one `L` object:
  - 9:16: caption at y 420 and 580 (124 and 172 px); portrait at (520, 1130) × 1.7.
  - 4:5: caption at y 130 and 270 (104 and 150 px); portrait at (520, 740) × 1.5.
- **TikTok safe zones:**
  - Caption and face must sit inside the centre 1080×1440 (y 240–1680), because the profile grid crops covers to 3:4.
  - Keep the face and caption out of the bottom 320 px (caption and UI) and the right 150 px (buttons). Hair or clothes under the UI is fine.
- **Instagram:** a 4:5 feed post. The profile grid shows the centre 3:4, so keep the caption and face away from the side edges. For a Reels cover, use the 9:16 file.

```bash
r.sh demos/<slug>-thumb --page tt.html --stills 0.5 && cp out/stills/t00.50.png thumbnail-tiktok-9x16.png
r.sh demos/<slug>-thumb --page ig.html --stills 0.5 && cp out/stills/t00.50.png thumbnail-instagram-4x5.png
python3 $T/scripts/compare.py thumbnail-tiktok-9x16.png tt-check.jpg --format tiktok        # red = grid crop, blue = app UI
python3 $T/scripts/compare.py thumbnail-instagram-4x5.png ig-check.jpg --format instagram
```

Look at both check sheets: the face and caption go inside the red box and out of the blue boxes, and the small copy must still read. Publish both next to the YouTube thumbnail (`<episode folder>/thumbnails`).

## Specs

1280×720 PNG, under 2 MB, 16:9. It must be readable at 168×94. Use lower-case two-word captions only: no long titles, and don't repeat the video title.

TikTok cover 1080×1920 PNG; Instagram post 1080×1350 PNG (4:5). Both use the same portrait and caption as the YouTube thumbnail.

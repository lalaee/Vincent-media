#!/bin/bash
# One-time setup for a fresh cloud session. Usage: setup.sh <workdir>
# Clones the mg-styles-15 toolkit (renderer, audio lib, style prompts), installs Node + Python deps,
# and writes r.sh, a render wrapper that knows where Chromium lives and how to render without a GPU.
set -e
WORK=${1:?usage: setup.sh <workdir>}; mkdir -p "$WORK"; cd "$WORK"
# Our fork first (lalaee/mg-styles-15); the original (Vincentwei1021) only if the fork can't be reached. Override with MG_REPO=<url>.
if [ ! -d mg ]; then
  for U in ${MG_REPO:-https://github.com/lalaee/mg-styles-15} https://github.com/Vincentwei1021/mg-styles-15; do
    GIT_TERMINAL_PROMPT=0 git clone --depth 1 "$U" mg 2>/dev/null && { echo "toolkit: $U"; break; }; rm -rf mg
  done
  [ -d mg ] || { echo "could not clone mg-styles-15"; exit 1; }
fi
(cd mg && npm install --no-audit --no-fund >/dev/null 2>&1)
[ -d venv ] || python3 -m venv venv
# requirements.txt pins fail on Python 3.13: install the audio deps unpinned instead
venv/bin/pip install -q numpy scipy soundfile numba pedalboard pyloudnorm matplotlib pillow opencv-python-headless faster-whisper
cat > r.sh <<'R'
#!/bin/bash
# Render wrapper. Runs from inside mg/, so demo and --out paths are relative to mg/ (e.g. demos/x/out/v.mp4).
export MG_GPU_ARGS="--no-sandbox --use-angle=swiftshader --enable-unsafe-swiftshader"   # no GPU in cloud containers
export MG_CHROME=$(ls -d /opt/pw-browsers/chromium-*/chrome-linux*/chrome 2>/dev/null | head -1)
cd "$(dirname "$0")/mg" && node harness/render.mjs "$@" 2>&1 | grep -v "^\s*at "
R
chmod +x r.sh
echo "ready: $WORK/mg (toolkit), $WORK/venv (python), $WORK/r.sh (renderer)"

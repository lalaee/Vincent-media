#!/bin/bash
# Put finished files into the posts repo (e.g. lalaee/ladeeda-posts) and push. Videos/audio go through Git LFS (masters exceed 100 MB).
# Usage: publish.sh <posts repo dir> <long|short|carousel|art> <folder name> <file or dir>...
#   long -> "Long form/<folder>", short -> "Short form/<folder>", carousel -> "Carousels/<folder>", art -> "Channel art"
# Then update the repo README's index table by hand (one row per folder). Never force-push; on rejection it rebases its own commit.
set -e
R=$(cd "$1" && pwd); KIND=$2; NAME=$3; shift 3
case $KIND in long) DEST="Long form/$NAME";; short) DEST="Short form/$NAME";; carousel) DEST="Carousels/$NAME";; art) DEST="Channel art";; *) echo "kind?"; exit 1;; esac
cd "$R"; git lfs install --local >/dev/null; git lfs track "*.mp4" "*.m4a" "*.wav" >/dev/null
mkdir -p "$DEST"; for f in "$@"; do cp -r "$f" "$DEST/"; done
git add -A; git commit -qm "Add $KIND: $NAME" || { echo "nothing to commit"; exit 0; }
git fetch -q origin main; git rebase -q FETCH_HEAD; git push -q origin HEAD:main
echo "pushed -> $DEST ($(git rev-parse --short HEAD))"

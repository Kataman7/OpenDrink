#!/usr/bin/env bash

set -euo pipefail

MAIN_BRANCH="${1:-main}"
CURRENT_BRANCH="$(git branch --show-current)"
REPO_ROOT="$(git rev-parse --show-toplevel)"
SCRIPT_NAME="$(basename "$0")"

if [[ "$CURRENT_BRANCH" != "prod" ]]; then
  echo "This script must be run from the prod branch. Current branch: $CURRENT_BRANCH"
  exit 1
fi

if [[ -n "$(git status --porcelain)" ]]; then
  echo "Working tree is not clean. Commit or stash your changes first."
  exit 1
fi

TMP_DIR="$(mktemp -d)"
WORKTREE_DIR="$TMP_DIR/main-worktree"

cleanup() {
  if [[ -d "$WORKTREE_DIR/.git" ]]; then
    git worktree remove "$WORKTREE_DIR" --force >/dev/null 2>&1 || true
  fi
  rm -rf "$TMP_DIR"
}
trap cleanup EXIT

echo "Preparing temporary worktree for branch: $MAIN_BRANCH"
git fetch origin "$MAIN_BRANCH":"$MAIN_BRANCH" >/dev/null 2>&1 || true
git worktree add "$WORKTREE_DIR" "$MAIN_BRANCH"

echo "Building dist from $MAIN_BRANCH"
npm --prefix "$WORKTREE_DIR" ci
npm --prefix "$WORKTREE_DIR" run build

if [[ ! -d "$WORKTREE_DIR/dist" ]]; then
  echo "Build completed but dist/ was not found."
  exit 1
fi

echo "Cleaning prod branch working tree"
find "$REPO_ROOT" -mindepth 1 -maxdepth 1 \
  ! -name ".git" \
  ! -name "$SCRIPT_NAME" \
  -exec rm -rf {} +

echo "Copying dist content into prod root"
cp -R "$WORKTREE_DIR/dist/." "$REPO_ROOT/"
touch "$REPO_ROOT/.nojekyll"

echo "Done. Review and commit:"
echo "  git add -A"
echo "  git commit -m 'Deploy site from $MAIN_BRANCH dist'"
echo "  git push origin prod"

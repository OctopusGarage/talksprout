#!/usr/bin/env python3
"""Create deterministic lightweight/full skills and host-specific plugin archives."""
from pathlib import Path
from zipfile import ZipFile, ZipInfo, ZIP_DEFLATED
import argparse
import json
import os
import re

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "skills" / "talksprout"
PACKAGE_NAMES = json.loads((ROOT / "distribution" / "config.json").read_text())["packages"]
TARGET = ROOT / "public" / "downloads" / PACKAGE_NAMES["skill"]
PLUGIN_TARGET = ROOT / "public" / "downloads" / PACKAGE_NAMES["plugin"]
CLAUDE_TARGET = ROOT / "public" / "downloads" / PACKAGE_NAMES["claudePlugin"]

def package(target=TARGET, plugin=False, claude=False, full=False):
    target = Path(target)
    target.parent.mkdir(parents=True, exist_ok=True)
    config = json.loads((ROOT / "distribution" / "config.json").read_text())
    identity = json.loads((ROOT / "distribution" / "identity.json").read_text())
    revision = os.environ.get("AI_SOURCE_REVISION") or os.environ.get("GITHUB_SHA", "local")
    if revision != "local" and not re.fullmatch(r"[a-f0-9]{40}", revision):
        raise ValueError("Invalid source revision")
    files = []
    if plugin:
        files.extend([
            (".claude-plugin/plugin.json" if claude else "plugin.json", ROOT / "distribution" / "plugins" / "talksprout" / ("claude-plugin.json" if claude else "plugin.json")),
            ("LICENSE", SOURCE / "LICENSE"),
            ("README.md", ROOT / "distribution" / "plugins" / "talksprout" / "README.md"),
            ("assets/icon.png", ROOT / config["icon"]),
        ])
    for path in sorted(SOURCE.rglob("*")):
        if "__pycache__" in path.parts or path.suffix == ".pyc":
            continue
        if path.is_symlink():
            raise ValueError("Skill package must not contain symlinks")
        if path.is_file():
            relative = path.relative_to(SOURCE).as_posix()
            if relative not in {"SKILL.md", "LICENSE", "agents/openai.yaml", "assets/icon.png"}:
                raise ValueError(f"Unexpected consumer package file: {relative}")
            prefix = "skills/talksprout/" if plugin else "talksprout/"
            files.append((prefix + path.relative_to(SOURCE).as_posix(), ROOT / "distribution/full/talksprout/SKILL.md" if full and relative == "SKILL.md" else path))
    with ZipFile(target, "w", compression=ZIP_DEFLATED, compresslevel=9) as archive:
        for name, path in sorted(files):
            if path.is_symlink():
                raise ValueError("Skill package must not contain symlinks")
            if not path.is_file():
                raise ValueError(f"Missing package asset: {path}")
            entry = ZipInfo(name, (1980, 1, 1, 0, 0, 0))
            entry.compress_type = ZIP_DEFLATED
            entry.external_attr = 0o100644 << 16
            data = path.read_bytes()
            archive.writestr(entry, data)
        release_path = ("skills/talksprout/" if plugin else "talksprout/") + "references/release.md"
        entry = ZipInfo(release_path, (1980, 1, 1, 0, 0, 0))
        entry.compress_type = ZIP_DEFLATED
        entry.external_attr = 0o100644 << 16
        mode = "This full edition contains its learning content in SKILL.md. No remote retrieval is required. Replace the package to update content." if full else "This revision identifies the installed bootstrap artifact, not a pinned learning-content version. This lightweight package reads the latest remote entry and learning documents. Keep selected instructions during an active learning conversation; fetch the remote entry again for a new session."
        release = f"# TalkSprout release\n\nVersion: {config['version']}\n\nContent version: {identity['contentVersion']}\n\nGuidance version: {identity['guidanceVersion']}\n\nSource revision: {revision}\n\n{mode}\n"
        archive.writestr(entry, release.encode())
    print(f"Packaged {target.name} ({target.stat().st_size} bytes); {'self-contained content' if full else 'remote content bootstrap'}.")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--output", type=Path)
    parser.add_argument("--format", choices=["skill", "plugin", "claude", "full", "all"])
    args = parser.parse_args()
    kind = args.format or ("skill" if args.output else "all")
    if kind == "all" and args.output:
        parser.error("--output requires --format skill or plugin")
    if kind == "all":
        for retired in {"talksprout-plugin.zip", "talksprout-chatgpt-plugin.zip"} - set(PACKAGE_NAMES.values()):
            (ROOT / "public" / "downloads" / retired).unlink(missing_ok=True)
    if kind in ("skill", "all"):
        package(args.output or TARGET)
    if kind in ("plugin", "all"):
        package(args.output or PLUGIN_TARGET, plugin=True)
    if kind in ("claude", "all"):
        package(args.output or CLAUDE_TARGET, plugin=True, claude=True)
    if kind in ("full", "all"):
        package(args.output or ROOT / "public/downloads" / PACKAGE_NAMES["fullSkill"], full=True)
        if not args.output:
            (ROOT / "public/downloads" / PACKAGE_NAMES["fullSkillText"]).write_bytes((ROOT / "distribution/full/talksprout/SKILL.md").read_bytes())

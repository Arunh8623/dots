# -*- coding: utf-8 -*-
"""
run_manim.py - Renders a Manim scene file.
Usage: python run_manim.py <scene_file> <output_name> <media_dir> [quality_flag]
Quality flags: l=480p, m=720p, h=1080p  (Manim v0.19 single-letter form)
"""
import sys, os, subprocess

if sys.platform == "win32":
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')

def run_manim(scene_file, output_name, media_dir, quality='m'):
    if not os.path.exists(scene_file):
        print(f"ERROR: Scene file not found: {scene_file}", file=sys.stderr)
        sys.exit(1)

    # Manim v0.19 accepts: -q l / -q m / -q h / -q p / -q k
    # Do NOT use word form ("medium") — it's rejected by v0.19
    cmd = [
        sys.executable, "-m", "manim", "render",
        scene_file, "MathVisualization",
        "--format=mp4",
        "-q", quality,
        "--output_file", output_name,
        "--media_dir", media_dir,
        "--disable_caching",
        "--flush_cache",
    ]

    labels = { 'l': '480p (Fast)', 'm': '720p (Normal)', 'h': '1080p (HD)' }
    print(f"[run_manim] Quality: {quality} = {labels.get(quality, quality)} | Running manim...")
    sys.stdout.flush()

    result = subprocess.run(cmd, cwd=media_dir, capture_output=False, text=True)

    if result.returncode != 0:
        print(f"[run_manim] ERROR: Manim exited with code {result.returncode}", file=sys.stderr)
        sys.stderr.flush()
        sys.exit(result.returncode)

    print(f"[run_manim] SUCCESS: {output_name}")
    sys.stdout.flush()
    sys.exit(0)

if __name__ == "__main__":
    if len(sys.argv) < 4:
        print("Usage: python run_manim.py <scene_file> <output_name> <media_dir> [quality]")
        sys.exit(1)
    quality = sys.argv[4] if len(sys.argv) > 4 else 'm'
    run_manim(sys.argv[1], sys.argv[2], sys.argv[3], quality)
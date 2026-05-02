# -*- coding: utf-8 -*-
"""
Mixes a randomly chosen background music track into a Manim-rendered video.
Supports multiple music files in the assets folder.
Usage: python add_music.py <input_video> <output_video> <assets_dir>
"""
import sys
import os
import subprocess
import shutil
import random

if sys.platform == "win32":
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')

def get_video_duration(video_path):
    """Get video duration in seconds using ffprobe."""
    try:
        result = subprocess.run([
            'ffprobe', '-v', 'error',
            '-show_entries', 'format=duration',
            '-of', 'default=noprint_wrappers=1:nokey=1',
            video_path
        ], capture_output=True, text=True, timeout=15)
        duration = float(result.stdout.strip())
        print(f"[add_music] Video duration: {duration:.2f}s")
        return duration
    except Exception as e:
        print(f"[add_music] Could not get duration: {e}")
        return None

def has_audio_stream(video_path):
    """Check if video has an audio stream."""
    try:
        result = subprocess.run([
            'ffprobe', '-v', 'error', '-select_streams', 'a',
            '-show_entries', 'stream=codec_type',
            '-of', 'csv=p=0', video_path
        ], capture_output=True, text=True, timeout=15)
        return bool(result.stdout.strip())
    except Exception:
        return False

def pick_random_music(assets_dir):
    """Pick a random music file from the assets directory."""
    # Supported formats
    extensions = ('.mp3', '.wav', '.ogg', '.flac', '.aac', '.m4a')
    
    if not os.path.exists(assets_dir):
        print(f"[add_music] Assets dir not found: {assets_dir}")
        return None
    
    music_files = [
        os.path.join(assets_dir, f)
        for f in os.listdir(assets_dir)
        if f.lower().endswith(extensions) and os.path.getsize(os.path.join(assets_dir, f)) > 1000
    ]
    
    if not music_files:
        print(f"[add_music] No music files found in: {assets_dir}")
        return None
    
    chosen = random.choice(music_files)
    print(f"[add_music] Randomly chose: {os.path.basename(chosen)} (from {len(music_files)} tracks)")
    return chosen

def add_music(input_video, output_video, assets_dir):
    print(f"[add_music] Input:      {input_video}")
    print(f"[add_music] Output:     {output_video}")
    print(f"[add_music] Assets dir: {assets_dir}")

    if not os.path.exists(input_video):
        print(f"[add_music] ERROR: input video not found", file=sys.stderr)
        sys.exit(1)

    # Pick random music
    music_path = pick_random_music(assets_dir)
    if not music_path:
        print(f"[add_music] No music available - copying video as-is")
        shutil.copy2(input_video, output_video)
        return

    video_duration = get_video_duration(input_video)
    video_has_audio = has_audio_stream(input_video)
    print(f"[add_music] Video has audio: {video_has_audio}")

    # Build the audio filter:
    # - Loop music to fit video length exactly
    # - Fade music in over 1s and out over 2s
    # - Keep music at low volume so it's ambient not distracting
    if video_duration:
        fade_out_start = max(0, video_duration - 2.0)
        audio_filter = (
            f'[1:a]volume=0.15,'
            f'afade=t=in:st=0:d=1,'
            f'afade=t=out:st={fade_out_start:.2f}:d=2.0[music]'
        )
    else:
        audio_filter = '[1:a]volume=0.15[music]'

    if video_has_audio:
        # Mix video audio + music
        filter_complex = (
            f'[0:a]volume=1.0[va];'
            f'{audio_filter};'
            f'[va][music]amix=inputs=2:duration=first[outa]'
        )
        map_args = ['-map', '0:v', '-map', '[outa]']
    else:
        # No audio in video - just attach music
        filter_complex = audio_filter
        map_args = ['-map', '0:v', '-map', '[music]']

    cmd = [
        'ffmpeg', '-y',
        '-i', input_video,
        '-stream_loop', '-1',   # loop music so it covers any video length
        '-i', music_path,
        '-filter_complex', filter_complex,
        *map_args,
        '-c:v', 'copy',
        '-c:a', 'aac',
        '-b:a', '192k',
        '-shortest',            # cut at video end
        output_video
    ]

    print(f"[add_music] Running FFmpeg mix...")
    result = subprocess.run(cmd, capture_output=True, text=True, timeout=300)

    if result.returncode == 0 and os.path.exists(output_video) and os.path.getsize(output_video) > 1000:
        size_mb = os.path.getsize(output_video) / 1024 / 1024
        print(f"[add_music] Success: {output_video} ({size_mb:.2f} MB)")
        return

    # Fallback: re-encode video + music (slower but more compatible)
    print(f"[add_music] First attempt failed. Error: {result.stderr[-300:]}")
    print(f"[add_music] Trying fallback with video re-encode...")

    cmd_fallback = [
        'ffmpeg', '-y',
        '-i', input_video,
        '-stream_loop', '-1',
        '-i', music_path,
        '-map', '0:v',
        '-map', '1:a',
        '-c:v', 'libx264', '-preset', 'fast', '-crf', '22',
        '-c:a', 'aac', '-b:a', '192k',
        '-af', f'volume=0.15',
        '-shortest',
        output_video
    ]
    result2 = subprocess.run(cmd_fallback, capture_output=True, text=True, timeout=300)

    if result2.returncode == 0 and os.path.exists(output_video) and os.path.getsize(output_video) > 1000:
        size_mb = os.path.getsize(output_video) / 1024 / 1024
        print(f"[add_music] Fallback success: {output_video} ({size_mb:.2f} MB)")
        return

    # Last resort: copy without music
    print(f"[add_music] All FFmpeg attempts failed. Copying without music.")
    print(f"[add_music] Error was: {result2.stderr[-200:]}", file=sys.stderr)
    shutil.copy2(input_video, output_video)
    print(f"[add_music] Copied raw: {output_video}")


if __name__ == '__main__':
    if len(sys.argv) < 4:
        print("Usage: python add_music.py <input_video> <output_video> <assets_dir>")
        sys.exit(1)
    add_music(sys.argv[1], sys.argv[2], sys.argv[3])
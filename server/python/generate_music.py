# -*- coding: utf-8 -*-
"""
Generates ambient background music for dots using FFmpeg.
Run once: python generate_music.py
"""
import os
import sys
import subprocess
import struct
import math
import wave

def generate_with_ffmpeg(output_path):
    """Use FFmpeg to generate ambient tones directly - most reliable method."""
    print("Trying FFmpeg tone generation...")
    
    # Generate a 120-second ambient drone using FFmpeg's sine generator
    # Multiple sine waves mixed together for a rich ambient sound
    cmd = [
        'ffmpeg', '-y',
        '-f', 'lavfi',
        # Mix 4 sine waves at different frequencies for ambient feel
        '-i', 'sine=frequency=55:duration=120',
        '-f', 'lavfi',
        '-i', 'sine=frequency=110:duration=120',
        '-f', 'lavfi', 
        '-i', 'sine=frequency=165:duration=120',
        '-f', 'lavfi',
        '-i', 'sine=frequency=220:duration=120',
        # Mix all 4, each at low volume
        '-filter_complex',
        '[0]volume=0.3[a];[1]volume=0.2[b];[2]volume=0.15[c];[3]volume=0.1[d];[a][b][c][d]amix=inputs=4:duration=longest,volume=0.4',
        '-ar', '44100',
        '-ac', '2',
        '-b:a', '192k',
        output_path
    ]
    
    result = subprocess.run(cmd, capture_output=True, text=True)
    if result.returncode == 0 and os.path.exists(output_path) and os.path.getsize(output_path) > 1000:
        print(f"FFmpeg music generated: {output_path} ({os.path.getsize(output_path)//1024} KB)")
        return True
    else:
        print(f"FFmpeg failed: {result.stderr[-300:] if result.stderr else 'unknown error'}")
        return False

def generate_with_python(output_path):
    """Pure Python WAV generation as fallback."""
    print("Generating WAV with Python...")
    
    sample_rate = 44100
    duration = 120
    num_samples = sample_rate * duration
    
    frequencies = [
        (55.0,   0.25),
        (110.0,  0.20),
        (165.0,  0.12),
        (220.0,  0.08),
        (261.63, 0.06),
    ]
    
    # Build stereo frames (2 channels)
    all_frames = []
    fade = sample_rate * 3  # 3 sec fade
    
    for i in range(num_samples):
        t = i / sample_rate
        breath = 0.6 + 0.4 * math.sin(2 * math.pi * 0.03 * t)
        val = sum(
            amp * math.sin(2 * math.pi * freq * t)
            for freq, amp in frequencies
        )
        val *= breath * 0.3
        
        # fade in / out
        if i < fade:
            val *= i / fade
        elif i > num_samples - fade:
            val *= (num_samples - i) / fade
        
        s = max(-32767, min(32767, int(val * 32767)))
        # stereo: same sample for both L and R
        all_frames.append(struct.pack('<hh', s, s))
    
    wav_path = output_path.replace('.mp3', '.wav')
    with wave.open(wav_path, 'wb') as wf:
        wf.setnchannels(2)      # STEREO
        wf.setsampwidth(2)
        wf.setframerate(sample_rate)
        wf.writeframes(b''.join(all_frames))
    
    size = os.path.getsize(wav_path)
    print(f"WAV written: {wav_path} ({size//1024} KB)")
    
    if size < 1000:
        print("ERROR: WAV file too small, something went wrong")
        return False
    
    # Try to convert to MP3
    ret = subprocess.run(
        ['ffmpeg', '-y', '-i', wav_path, '-q:a', '2', output_path],
        capture_output=True
    )
    if ret.returncode == 0 and os.path.exists(output_path) and os.path.getsize(output_path) > 1000:
        os.remove(wav_path)
        print(f"Converted to MP3: {output_path}")
    else:
        # Keep as WAV renamed to .mp3
        import shutil
        shutil.move(wav_path, output_path)
        print(f"Saved as WAV (renamed .mp3): {output_path}")
    
    return True

if __name__ == '__main__':
    script_dir = os.path.dirname(os.path.abspath(__file__))
    assets_dir = os.path.join(script_dir, 'assets')
    os.makedirs(assets_dir, exist_ok=True)
    out = os.path.join(assets_dir, 'bg_music.mp3')
    
    # Delete old broken file if exists
    if os.path.exists(out):
        os.remove(out)
        print(f"Deleted old music file.")
    
    # Try FFmpeg first (best quality), fallback to Python
    success = generate_with_ffmpeg(out)
    if not success:
        success = generate_with_python(out)
    
    if success:
        size = os.path.getsize(out)
        print(f"\nDone! {out} ({size//1024} KB)")
        print("Now start your server: npm run dev")
    else:
        print("\nERROR: Could not generate music file.")
        sys.exit(1)
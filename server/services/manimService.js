const { spawn, execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const { fixManimCode } = require('./geminiService');

const TEMP_DIR    = path.join(__dirname, '../temp');
const VIDEOS_DIR  = path.join(__dirname, '../videos');
const ASSETS_DIR  = path.join(__dirname, '../python/assets');  // folder with music files
const RUN_MANIM   = path.join(__dirname, '../python/run_manim.py');
const ADD_MUSIC   = path.join(__dirname, '../python/add_music.py');

[TEMP_DIR, VIDEOS_DIR].forEach(dir => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

// ── Find correct Python (skip MSYS2) ─────────────────────────────────────────
function findPythonWithManim() {
  if (process.env.PYTHON_PATH) return process.env.PYTHON_PATH;

  const windowsPaths = [
    `C:\\Users\\${process.env.USERNAME}\\AppData\\Local\\Programs\\Python\\Python312\\python.exe`,
    `C:\\Users\\${process.env.USERNAME}\\AppData\\Local\\Programs\\Python\\Python311\\python.exe`,
    `C:\\Users\\${process.env.USERNAME}\\AppData\\Local\\Programs\\Python\\Python310\\python.exe`,
    `C:\\Users\\${process.env.USERNAME}\\AppData\\Local\\Programs\\Python\\Python39\\python.exe`,
    'C:\\Python312\\python.exe', 'C:\\Python311\\python.exe',
    'C:\\Python310\\python.exe', 'C:\\Python39\\python.exe',
  ];

  for (const p of windowsPaths) {
    if (!fs.existsSync(p)) continue;
    try {
      const r = execSync(`"${p}" -c "import manim; print('ok')"`, {
        encoding: 'utf8', timeout: 10000,
        env: { ...process.env, PYTHONIOENCODING: 'utf-8' }
      });
      if (r.includes('ok')) { console.log(`Python found: ${p}`); return p; }
    } catch (_) {}
  }

  // Fallback: try 'python' but skip if MSYS2
  try {
    const which = execSync('where python', { encoding: 'utf8', timeout: 5000 });
    const lines = which.trim().split('\n').map(l => l.trim());
    for (const line of lines) {
      if (line.toLowerCase().includes('msys') || line.toLowerCase().includes('mingw')) continue;
      try {
        const r = execSync(`"${line}" -c "import manim; print('ok')"`, {
          encoding: 'utf8', timeout: 10000,
          env: { ...process.env, PYTHONIOENCODING: 'utf-8' }
        });
        if (r.includes('ok')) { console.log(`Python found: ${line}`); return line; }
      } catch (_) {}
    }
  } catch (_) {}

  console.warn('Could not find Python with Manim. Set PYTHON_PATH in server/.env');
  return 'python';
}

let PYTHON_EXE = null;
function getPython() {
  if (!PYTHON_EXE) PYTHON_EXE = findPythonWithManim();
  return PYTHON_EXE;
}

// ── Spawn a python script ─────────────────────────────────────────────────────
function runPython(scriptPath, args = []) {
  return new Promise((resolve, reject) => {
    const pyExe = getPython();
    const proc = spawn(pyExe, [scriptPath, ...args], {
      shell: true,
      stdio: ['ignore', 'pipe', 'pipe'],
      env: { ...process.env, PYTHONIOENCODING: 'utf-8', PYTHONUTF8: '1' }
    });

    let stdout = '', stderr = '';
    proc.stdout.on('data', d => { stdout += d; process.stdout.write(`  [py] ${d}`); });
    proc.stderr.on('data', d => { stderr += d; process.stderr.write(`  [py:err] ${d}`); });
    proc.on('close', code => {
      if (code === 0) resolve({ stdout, stderr });
      else reject(new Error(`exit ${code}\n${stderr}\n${stdout}`));
    });
    proc.on('error', e => reject(new Error(`spawn failed: ${e.message}`)));
  });
}

// ── Find the FINAL merged video for THIS specific job only ────────────────────
function findFinalVideo(tempDir, jobId) {
  // Manim creates: tempDir/videos/scene_<jobId>/720p30/<outputName>.mp4
  // We MUST only look inside the folder named after this jobId's scene file.
  const videosRoot = path.join(tempDir, 'videos');
  if (!fs.existsSync(videosRoot)) {
    console.log(`videos dir not found: ${videosRoot}`);
    return null;
  }

  const candidates = [];

  // Only walk folders whose name contains this jobId
  let topFolders;
  try { topFolders = fs.readdirSync(videosRoot); } catch (_) { return null; }

  for (const folder of topFolders) {
    // Must match this job's scene file name
    if (!folder.includes(jobId)) continue;

    const jobFolder = path.join(videosRoot, folder);
    console.log(`Searching job folder: ${jobFolder}`);

    function walk(dir) {
      let entries;
      try { entries = fs.readdirSync(dir); } catch (_) { return; }
      for (const entry of entries) {
        const full = path.join(dir, entry);
        let stat;
        try { stat = fs.statSync(full); } catch (_) { continue; }

        if (stat.isDirectory()) {
          if (entry === 'partial_movie_files') continue; // skip chunks
          walk(full);
        } else if (entry.endsWith('.mp4') && !full.includes('partial_movie_files')) {
          candidates.push({ path: full, size: stat.size });
          console.log(`  MP4 found: ${full} (${(stat.size / 1024).toFixed(0)} KB)`);
        }
      }
    }

    walk(jobFolder);
  }

  if (candidates.length === 0) {
    console.log(`No MP4 found for jobId: ${jobId}`);
    return null;
  }

  // Pick the largest (final merged video >> any stray file)
  candidates.sort((a, b) => b.size - a.size);
  const best = candidates[0];
  console.log(`Selected: ${best.path} (${(best.size / 1024 / 1024).toFixed(2)} MB)`);
  return best.path;
}

// ── Render the Manim scene ────────────────────────────────────────────────────
async function renderManimCode(manimCode, jobId) {
  const sceneFile  = path.join(TEMP_DIR, `scene_${jobId}.py`);
  const outputName = `math_${jobId}`;

  fs.writeFileSync(sceneFile, manimCode, 'utf8');
  console.log(`Scene file: ${sceneFile}`);

  let renderError = null;
  try {
    await runPython(RUN_MANIM, [sceneFile, outputName, TEMP_DIR]);
  } catch (err) {
    renderError = err;
    console.log('run_manim.py errored — checking if video was produced anyway...');
  }

  // jobId here is e.g. "abc123_a1" — scene folder will be named "scene_abc123_a1"
  const finalVideo = findFinalVideo(TEMP_DIR, jobId);

  if (finalVideo) {
    if (renderError) console.log(`Video found despite script error — using it.`);
    return finalVideo;
  }

  throw renderError || new Error('Manim ran but produced no output MP4.');
}

// ── Add background music ──────────────────────────────────────────────────────
async function addBackgroundMusic(renderedVideo, jobId) {
  const finalPath = path.join(VIDEOS_DIR, `final_${jobId}.mp4`);
  try {
    // Pass the whole assets directory — add_music.py picks a random track
    await runPython(ADD_MUSIC, [renderedVideo, finalPath, ASSETS_DIR]);
  } catch (_) {
    // add_music.py copies the file on all failures, so check either way
  }
  if (fs.existsSync(finalPath)) {
    console.log(`Final video: ${finalPath}`);
    return finalPath;
  }
  // Ultimate fallback: direct copy
  fs.copyFileSync(renderedVideo, finalPath);
  console.log(`Final video (direct copy): ${finalPath}`);
  return finalPath;
}

// ── Main pipeline ─────────────────────────────────────────────────────────────
async function generateVideo(manimCode, originalPrompt, onProgress) {
  const jobId = uuidv4().replace(/-/g, '').substring(0, 12);
  let currentCode = manimCode;

  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      console.log(`\nRender attempt ${attempt}/3 [job: ${jobId}]`);
      onProgress?.('rendering', `Running Manim renderer (attempt ${attempt})...`);

      const renderedPath = await renderManimCode(currentCode, `${jobId}_a${attempt}`);

      onProgress?.('music', 'Adding background music...');
      const finalPath = await addBackgroundMusic(renderedPath, jobId);

      // Cleanup .py scene files
      try {
        fs.readdirSync(TEMP_DIR)
          .filter(f => f.includes(jobId) && f.endsWith('.py'))
          .forEach(f => fs.unlinkSync(path.join(TEMP_DIR, f)));
      } catch (_) {}

      return { success: true, videoPath: finalPath, videoUrl: `/videos/final_${jobId}.mp4`, jobId };

    } catch (err) {
      console.error(`Attempt ${attempt} failed:`, err.message.substring(0, 300));
      if (attempt < 3) {
        onProgress?.('fixing', `Auto-fixing code (attempt ${attempt + 1})...`);
        try { currentCode = await fixManimCode(currentCode, err.message); }
        catch (fe) { console.error('Fix failed:', fe.message); }
      } else {
        throw new Error(`Failed after 3 attempts. Last: ${err.message.substring(0, 400)}`);
      }
    }
  }
}

module.exports = { generateVideo };
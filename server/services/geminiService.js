const axios = require('axios');
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

const MODELS_TO_TRY = [
  'gemini-3-flash-preview',
  'gemini-2.0-flash',
  'gemini-1.5-flash',
];

// ─── Core Gemini caller ───────────────────────────────────────────────────────
async function callGemini(prompt, systemInstruction = '') {
  let lastError = null;

  for (const model of MODELS_TO_TRY) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${process.env.GEMINI_API_KEY}`;
      const requestBody = {
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.4, maxOutputTokens: 8192 }
      };
      if (systemInstruction) {
        requestBody.system_instruction = { parts: [{ text: systemInstruction }] };
      }

      console.log(`Trying Gemini model: ${model}`);
      const response = await axios.post(url, requestBody, {
        headers: { 'Content-Type': 'application/json' },
        timeout: 120000
      });

      const content = response.data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!content) throw new Error('Empty response from Gemini');
      console.log(`Gemini responded: ${model}`);
      return content;

    } catch (err) {
      const status = err.response?.status;
      const detail = err.response?.data?.error?.message || err.message;
      console.error(`Gemini ${model} failed (${status}): ${detail}`);
      lastError = new Error(`Gemini ${model} failed (${status}): ${detail}`);

      if (status === 429) {
        const waitMatch = detail.match(/retry in (\d+)/);
        const waitSec = waitMatch ? parseInt(waitMatch[1]) + 5 : 65;
        console.log(`Rate limited. Waiting ${waitSec}s...`);
        await new Promise(r => setTimeout(r, waitSec * 1000));
        try {
          const resp2 = await axios.post(url, requestBody, { headers: { 'Content-Type': 'application/json' }, timeout: 120000 });
          const c2 = resp2.data.candidates?.[0]?.content?.parts?.[0]?.text;
          if (c2) return c2;
        } catch (e2) { console.error(`Retry failed: ${e2.message}`); }
      }
      if (status !== 404 && status !== 400) throw lastError;
    }
  }
  throw lastError || new Error('All Gemini models failed');
}

// ─── Python syntax validator ──────────────────────────────────────────────────
function validatePythonSyntax(code) {
  const tmpFile = path.join(os.tmpdir(), `manim_val_${Date.now()}.py`);
  try {
    fs.writeFileSync(tmpFile, code, 'utf8');
    execSync(`python -c "import ast; ast.parse(open(r'${tmpFile}').read())"`, {
      timeout: 10000,
      env: { ...process.env, PYTHONIOENCODING: 'utf-8' }
    });
    return { valid: true };
  } catch (err) {
    return { valid: false, error: err.stderr?.toString() || err.message };
  } finally {
    try { fs.unlinkSync(tmpFile); } catch (_) {}
  }
}

// ─── Clean Gemini response to pure Python ─────────────────────────────────────
function cleanCode(raw) {
  let code = raw.replace(/```python\n?/gi, '').replace(/```\n?/g, '').trim();
  const start = code.indexOf('from manim import');
  if (start > 0) code = code.substring(start);
  return code;
}

// ─── 1. Engineer the prompt ───────────────────────────────────────────────────
async function engineerPrompt(userPrompt) {
  const system = `You are a world-class mathematics educator combining the depth of 
3Blue1Brown, rigor of Terence Tao, and intuition of Richard Feynman.`;

  const prompt = `
A student asked: "${userPrompt}"

Write a concise VISUAL EXPLANATION BRIEF covering:
1. Core concept in one sentence
2. Best physical/visual intuition 
3. Step-by-step animation journey: what moves, transforms, appears
4. 2-3 key "aha" moments
5. 1-2 concrete numerical examples to animate

Be specific about colors, movements. Keep it focused and under 300 words.
`;
  return await callGemini(prompt, system);
}

// ─── 2. Generate Manim code ───────────────────────────────────────────────────
async function generateManimCode(engineeredPrompt, originalQuestion, audienceContext = '') {
  const system = `You are an expert Manim Community Edition v0.18+ programmer. 
You write COMPLETE, SYNTACTICALLY PERFECT Python that runs without errors.`;

  const prompt = `
Write complete Manim Community Edition Python code for this visualization.

QUESTION: "${originalQuestion}"
${audienceContext ? `AUDIENCE: ${audienceContext}` : ''}

BRIEF: ${engineeredPrompt}

===== STRICT RULES (breaking any = broken code) =====

RULE 1 - RATE FUNCTIONS: Only use these: linear, smooth, rush_into, rush_from, there_and_back
  BANNED (don't exist): ease_in_out_sine, ease_in_sine, ease_out_sine, easeInOutSine

RULE 2 - ANIMATIONS: Use Create() NOT ShowCreation()
  Safe list: Write, Create, FadeIn, FadeOut, Transform, ReplacementTransform,
  GrowFromCenter, DrawBorderThenFill, Indicate, Flash, LaggedStart, AnimationGroup

RULE 3 - COLORS: Only Manim constants: WHITE, BLACK, RED, GREEN, BLUE, YELLOW, 
  ORANGE, PURPLE, PINK, TEAL, GOLD, GREY, MAROON
  Color variants: BLUE_A through BLUE_E, GREEN_A through GREEN_E, etc.
  BANNED: hex colors like "#FF0000"

RULE 4 - SYNTAX: 
  Every self.play( MUST have matching closing )
  Count parentheses before finishing each self.play() call
  Never leave unclosed brackets or strings

RULE 5 - COMPLETENESS:
  Code must be 100% complete, never truncated
  Maximum 20 self.play() calls to stay within token limit

RULE 6 - STRUCTURE:
  from manim import *
  class MathVisualization(Scene):
      def construct(self):
          # all code here

OUTPUT: Return ONLY Python code. Zero markdown. Zero backticks. Zero explanations.
First line must be: from manim import *
`;

  let code = cleanCode(await callGemini(prompt, system));

  const validation = validatePythonSyntax(code);
  if (!validation.valid) {
    console.log('Pre-render syntax check failed, fixing now...');
    code = await fixSyntaxError(code, validation.error);
  } else {
    console.log('Pre-render syntax check: PASSED');
  }

  return code;
}

// ─── 3. Fix syntax errors (before render) ────────────────────────────────────
async function fixSyntaxError(brokenCode, errorMessage) {
  const prompt = `
Fix this Manim Python code that has syntax errors.

ERROR: ${errorMessage.substring(0, 300)}

RULES:
- Fix ALL unclosed parentheses, brackets, quotes
- Replace ease_in_out_sine -> smooth
- Replace ShowCreation -> Create
- Code must be 100% complete
- Return ONLY Python. Start with: from manim import *
- Class name: MathVisualization

BROKEN CODE:
${brokenCode}
`;
  let fixed = cleanCode(await callGemini(prompt));
  const v = validatePythonSyntax(fixed);
  if (!v.valid) return generateSimpleFallback();
  return fixed;
}

// ─── 4. Fix runtime errors (after failed render) ─────────────────────────────
async function fixManimCode(brokenCode, errorMessage) {
  const keyErrors = errorMessage.split('\n')
    .filter(l => /Error|error|NameError|AttributeError|TypeError/.test(l))
    .slice(0, 4).join('\n');

  const prompt = `
Fix this Manim code with a runtime error.

ERROR: ${keyErrors || errorMessage.substring(0, 400)}

FIXES TO APPLY:
- ease_in_out_sine -> smooth
- ease_in_sine -> rush_into
- ease_out_sine -> rush_from
- ShowCreation -> Create
- Fix any NameError with valid Manim equivalent

RETURN ONLY Python code starting with: from manim import *
Class name must be: MathVisualization

CODE TO FIX:
${brokenCode}
`;
  let fixed = cleanCode(await callGemini(prompt));
  const v = validatePythonSyntax(fixed);
  if (!v.valid) return generateSimpleFallback();
  return fixed;
}

// ─── 5. Generate study notes ──────────────────────────────────────────────────
async function generateNotes(originalQuestion, engineeredPrompt) {
  const prompt = `
Based on this math question, generate concise study notes.

QUESTION: "${originalQuestion}"
CONTEXT: ${engineeredPrompt.substring(0, 600)}

Return a JSON object ONLY (no markdown, no backticks) with this exact structure:
{
  "summary": "2-3 sentence plain English summary of the core concept",
  "keyPoints": ["point 1", "point 2", "point 3", "point 4"],
  "formula": "the main formula in LaTeX notation (just the math, no dollar signs)",
  "intuition": "one sentence capturing the deepest intuition",
  "difficulty": "Beginner|Intermediate|Advanced",
  "topic": "e.g. Calculus, Linear Algebra, Geometry, etc."
}
`;
  try {
    const raw = await callGemini(prompt);
    const clean = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    return JSON.parse(clean);
  } catch (err) {
    console.error('Notes generation failed:', err.message);
    return {
      summary: originalQuestion,
      keyPoints: ['Watch the visualization carefully', 'Pause and replay key moments'],
      formula: '',
      intuition: 'Mathematics is best understood visually.',
      difficulty: 'Intermediate',
      topic: 'Mathematics'
    };
  }
}

// ─── 6. Fallback animation (guaranteed to work) ───────────────────────────────
function generateSimpleFallback() {
  console.log('Using guaranteed fallback animation...');
  return `from manim import *

class MathVisualization(Scene):
    def construct(self):
        title = Text("Mathematical Visualization", color=BLUE).scale(0.8)
        self.play(Write(title))
        self.wait(1)
        self.play(title.animate.to_edge(UP))
        self.wait(0.5)

        number_line = NumberLine(x_range=[-5, 5, 1], length=10, include_numbers=True, color=WHITE)
        self.play(Create(number_line))
        self.wait(1)

        dot = Dot(color=YELLOW).move_to(number_line.n2p(-3))
        label = MathTex(r"x = -3", color=YELLOW).next_to(dot, UP)
        self.play(GrowFromCenter(dot), Write(label))
        self.wait(1)

        new_label = MathTex(r"x = 2", color=GREEN).next_to(number_line.n2p(2), UP)
        self.play(dot.animate.move_to(number_line.n2p(2)), Transform(label, new_label), run_time=2, rate_func=smooth)
        self.wait(1)

        formula = MathTex(r"f(x) = x^2", color=GOLD).scale(1.2)
        formula.next_to(number_line, DOWN, buff=0.8)
        self.play(Write(formula))
        self.wait(2)
        self.play(FadeOut(*self.mobjects))
        self.wait(0.5)
`;
}

// ─── Exports ──────────────────────────────────────────────────────────────────
module.exports = { engineerPrompt, generateManimCode, fixManimCode, generateNotes };
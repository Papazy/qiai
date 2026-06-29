export function parseModelJSON(raw) {
  if (!raw || typeof raw !== 'string') throw new Error('Empty model response');

  let content = raw.replace(/^﻿/, '').trim();
  content = content.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/, '').trim();

  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error(`No JSON object found in response: ${content.slice(0, 120)}`);
  content = jsonMatch[0];

  try {
    return JSON.parse(content);
  } catch (firstErr) {
    try {
      const fixed = content
        .replace(/(['"])?([a-zA-Z_][a-zA-Z0-9_]*)(['"])?\s*:/g, '"$2":')
        .replace(/:\s*'([^']*)'/g, ': "$1"');
      return JSON.parse(fixed);
    } catch {
      throw new Error(`JSON parse failed: ${firstErr.message} — content: ${content.slice(0, 120)}`);
    }
  }
}

export function modelErrorFallback(model, error) {
  const msg = error?.message || String(error);
  console.error(`[qiai] Error (${model}): ${msg}`);
  return {
    steps: [{
      command: "echo 'Error occurred'",
      description: `${model}: ${msg}`.slice(0, 60),
      danger_level: 1
    }]
  };
}

import { readFile, writeFile } from 'node:fs/promises';

const prompt = await readFile(new globalThis.URL('../prompts', import.meta.url), 'utf8');
const sections = [
  ['character', /## Prompt 11/u, /Add snippets for:/u, /Use clear prefixes/u],
  ['scene', /## Prompt 12/u, /Include:/u, /Prefixes should begin/u],
  ['manuscript', /## Prompt 13/u, /Include:/u, /Use practical Markdown/u],
  ['worldbuilding', /## Prompt 14/u, /Include snippets for:/u, /Use a consistent structure/u],
  ['lore', /## Prompt 15/u, /Include:/u, /Each snippet should make/u],
  ['timeline', /## Prompt 16/u, /Include:/u, /Support uncertain dates/u],
  ['relationships', /## Prompt 17/u, /Include:/u, /Use a consistent directional/u],
  ['poetry', /## Prompt 18/u, /Include:/u, /Preserve the existing/u],
  ['revision', /## Prompt 19/u, /Include:/u, /These snippets should help/u],
  ['plot', /## Prompt 20/u, /Include:/u, /Keep structures concise/u],
  ['research', /## Prompt 21/u, /Include:/u, /Clearly distinguish/u],
  ['publishing', /## Prompt 22/u, /Include:/u, /Keep the snippets format/u],
  ['ai', /## Prompt 23/u, /Include:/u, /Use clear prefixes beginning/u],
  ['symbolism', /## Prompt 24/u, /Include:/u, /Each snippet should allow/u],
  ['mythic', /## Prompt 25/u, /Include:/u, /Use fictional-world framing/u],
  ['author-workflow', /## Prompt 26/u, /Include:/u, /Prefixes should be short/u],
];
const legacy = new Map([
  ['AI Emotion', 'aie'], ['AI Line', 'ai'], ['AI Note', 'ain'], ['AI Question', 'aiq'],
  ['AI Suggest', 'ais'], ['AI Thought', 'aith'], ['AI Warning', 'aiw'], ['User Line', 'user'],
  ['AI Story Prompt: Tone Enforcement', 'aistyle'], ['AI Story Prompt: Scene Generation', 'aiscene'],
  ['AI Story Prompt: Lore Expansion', 'ailore'], ['AI Conversation Archive', 'ailog'],
  ['AI Log: Single Exchange', 'aiexchange'], ['Ancient Judgment', 'judgment'],
  ['Canticle Block', 'canticle'], ['Chanted Meter', 'chant'], ['Elemental Contrast', 'element'],
  ['Poem Block', 'poem'], ['Prophecy Block', 'prophecy'], ['Prophetic Decree', 'decree'],
  ['Knowledge Link: Standard Entity', 'klink'], ['Knowledge Link: Relational Tie', 'krel'],
  ['Knowledge Link: Prophetic Reference', 'kprophecy'], ['Daily Writing Session', 'writingday'],
  ['Creative Spark', 'spark'], ['Final Author Command', 'mastercommand'],
]);
const prefixMap = new Map([
  ['AI Brainstorm', 'aibrain'], ['AI Rewrite', 'airewrite'], ['AI Expand', 'aiexpand'],
  ['AI Condense', 'aicondense'], ['AI Summarize', 'aisummary'], ['AI Critique', 'aicritique'],
  ['AI Continue', 'aicontinue'], ['AI Dialogue', 'aidialogue'], ['AI Description', 'aidescribe'],
  ['AI Character Analysis', 'aichar'], ['AI Scene Analysis', 'aiscenecheck'],
  ['AI Lore Analysis', 'ailorecheck'], ['AI Timeline Analysis', 'aitimeline'],
  ['AI Continuity Check', 'aicontinuity'], ['AI Canon Check', 'aicanon'], ['AI Voice Match', 'aivoice'],
  ['AI Tone Match', 'aitone'], ['AI Symbolism Analysis', 'aisymbol'], ['AI Theme Analysis', 'aitheme'],
  ['AI Foreshadowing', 'aiforeshadow'], ['AI Payoff', 'aipayoff'], ['AI Alternative', 'aialternative'],
  ['AI Research Question', 'airesearch'], ['AI Outline', 'aioutline'], ['AI Chapter Plan', 'aichapter'],
  ['AI Scene Plan', 'aisceneplan'],
]);
const stopWords = /^(?:Include|Use|Support|Create|Do|These|The|Preserve|Keep|Each|Clearly|Avoid|Every|Prefixes|Add|Build|This|For|End|Description|Name|Type|Status|Notes|History|Relationships|Required|Subject|Desired outcome|Image|Emotion|Possible Story Use)$/u;
const snippets = [];
for (const [category, heading, start, stop] of sections) {
  const headingIndex = prompt.search(heading);
  if (headingIndex < 0) continue;
  const nextPrompt = prompt.indexOf('## Prompt ', headingIndex + 10);
  const sectionText = prompt.slice(headingIndex, nextPrompt < 0 ? prompt.length : nextPrompt);
  const startIndex = sectionText.search(start);
  const stopIndex = sectionText.search(stop);
  const block = sectionText.slice(startIndex + sectionText.match(start)[0].length, stopIndex < 0 ? sectionText.length : stopIndex);
  for (const line of block.split(/\r?\n/u).map((value) => value.trim())) {
    if (!line || line.startsWith('-') || line.includes(':') || stopWords.test(line)) continue;
    if (!/^[A-Z][A-Za-z0-9/&' -]+$/u.test(line)) continue;
    const name = line.replace(/\s+$/u, '');
    if (!snippets.some((snippet) => snippet.name === name)) snippets.push({ name, category });
  }
}
for (const [name, prefix] of legacy) if (!snippets.some((snippet) => snippet.name === name)) snippets.push({ name, category: name.startsWith('AI') || name === 'User Line' ? 'ai' : 'writing', prefix });
for (const snippet of snippets) {
  if (!snippet.prefix) {
    const root = snippet.category === 'ai' ? 'ai' : snippet.category === 'author-workflow' ? 'author' : snippet.category.slice(0, 4);
    const slug = snippet.name.toLocaleLowerCase().replace(/[^a-z0-9]+/gu, ' ').trim().split(/\s+/u).slice(0, 3).join('');
    snippet.prefix = `${root}${slug}`;
  }
  if (prefixMap.has(snippet.name)) snippet.prefix = prefixMap.get(snippet.name);
  snippet.language = snippet.category === 'ai' ? 'ais' : 'uriel';
  snippet.body = template(snippet.name, snippet.category);
  snippet.description = `Create a ${snippet.name.toLocaleLowerCase()} template.`;
}
const seen = new Set();
for (const snippet of snippets) {
  if (seen.has(`${snippet.language}:${snippet.prefix}`)) snippet.prefix = `${snippet.prefix}${snippets.indexOf(snippet) + 1}`;
  seen.add(`${snippet.language}:${snippet.prefix}`);
}
const toJson = (language) => Object.fromEntries(snippets.filter((snippet) => snippet.language === language).map((snippet) => [snippet.name, { prefix: snippet.prefix, body: snippet.body, description: snippet.description }]));
await writeFile(new globalThis.URL('../snippets/catalog-uriel.code-snippets', import.meta.url), `${JSON.stringify(toJson('uriel'), null, 2)}\n`);
await writeFile(new globalThis.URL('../snippets/catalog-ais.code-snippets', import.meta.url), `${JSON.stringify(toJson('ais'), null, 2)}\n`);
globalThis.console.log(`Generated ${snippets.length} catalog snippets.`);

function template(name, category) {
  if (category === 'ai') return [`${name.toUpperCase()}:`, 'Context: ${1:context}', 'Task: ${2:task}', 'Constraints: ${3:constraints}', 'Output: ${4:output}', '$0'];
  if (category === 'scene') return [`## ${name}: \${1:title}`, 'Objective: ${2:objective}', 'Conflict: ${3:conflict}', 'Stakes: ${4:stakes}', '$0'];
  if (category === 'character') return [`## ${name}: \${1:name}`, 'Role: ${2:role}', 'Goals: ${3:goals}', 'Conflict: ${4:conflict}', 'Arc: ${5:arc}', '$0'];
  if (category === 'worldbuilding' || category === 'lore') return [`## ${name}: \${1:name}`, 'Type: ${2:type}', 'Description: ${3:description}', 'History: ${4:history}', 'Relationships: ${5:relationships}', 'Status: ${6:status}', 'Notes: ${7:notes}', '$0'];
  if (category === 'timeline') return [`## ${name}`, 'DATE: ${1:date or era}', 'BEFORE: ${2:prior event}', 'AFTER: ${3:next event}', 'STATUS: ${4:status}', '$0'];
  return [`## ${name}`, '${1:notes}', '$0'];
}

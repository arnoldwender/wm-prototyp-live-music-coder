import type { EngineType, EngineBlock, Connection } from '../../types/engine';

/** Generate readable code from blocks and connections.
 * Each block's .code property is used as-is.
 * Connections are appended as .connect() calls.
 * The generated code should be valid for the target engine. */
export function generateCode(
  blocks: EngineBlock[],
  connections: Connection[],
  engine: EngineType,
): string {
  if (blocks.length === 0) return '';

  switch (engine) {
    case 'strudel': return generateStrudel(blocks);
    case 'tonejs': return generateToneJs(blocks, connections);
    case 'webaudio': return generateWebAudio(blocks, connections);
    case 'midi': return generateMidi(blocks);
  }
}

function generateStrudel(blocks: EngineBlock[]): string {
  /* Strudel: return block code directly (pattern expression) */
  return blocks.map(b => b.code).join('\n');
}

function generateToneJs(blocks: EngineBlock[], connections: Connection[]): string {
  const lines: string[] = [];

  /* Block declarations */
  for (const block of blocks) {
    lines.push(block.code);
  }

  /* Connection statements */
  if (connections.length > 0) {
    lines.push('');
    for (const conn of connections) {
      const srcBlock = blocks.find(b => b.id === conn.sourceBlockId);
      const tgtBlock = blocks.find(b => b.id === conn.targetBlockId);
      if (srcBlock && tgtBlock) {
        /* Extract variable name from code */
        const srcVar = extractVarName(srcBlock.code);
        const tgtVar = extractVarName(tgtBlock.code);
        if (srcVar && tgtVar) {
          lines.push(`${srcVar}.connect(${tgtVar})`);
        }
      }
    }
  }

  return lines.join('\n');
}

function generateWebAudio(blocks: EngineBlock[], connections: Connection[]): string {
  const lines: string[] = [];

  /* Block declarations */
  for (const block of blocks) {
    lines.push(block.code);
  }

  /* Connection statements */
  if (connections.length > 0) {
    lines.push('');
    for (const conn of connections) {
      const srcBlock = blocks.find(b => b.id === conn.sourceBlockId);
      const tgtBlock = blocks.find(b => b.id === conn.targetBlockId);
      if (srcBlock && tgtBlock) {
        const srcVar = extractVarName(srcBlock.code);
        const tgtVar = extractVarName(tgtBlock.code);
        if (srcVar && tgtVar) {
          lines.push(`${srcVar}.connect(${tgtVar})`);
        }
      }
    }
  }

  return lines.join('\n');
}

function generateMidi(blocks: EngineBlock[]): string {
  return blocks.map(b => b.code).join('\n');
}

/** Extract variable name from a declaration like "const foo = ..." */
function extractVarName(code: string): string | null {
  const match = code.match(/(?:const|let|var)\s+(\w+)/);
  return match ? match[1] : null;
}

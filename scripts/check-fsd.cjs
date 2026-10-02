const fs = require('node:fs');
const path = require('node:path');

const root = process.env.FSD_PROJECT_ROOT || process.cwd();
const layerRank = { shared: 1, entities: 2, features: 3, widgets: 4, pages: 5, app: 6 };
const errors = [];

function visit(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) visit(full);
    else if (/\.(js|jsx)$/.test(entry.name)) inspect(full);
  }
}

function inspect(file) {
  const source = fs.readFileSync(file, 'utf8');
  const sourceRel = path.relative(path.join(root, 'src'), file).replaceAll('\\', '/');
  const [sourceLayer, sourceSlice] = sourceRel.split('/');
  const imports = /(?:from\s*|import\s*\(|import\s*)['"](\.{1,2}\/[^'"]+)['"]/g;
  for (const match of source.matchAll(imports)) {
    const spec = match[1];
    const targetBase = path.resolve(path.dirname(file), spec);
    const candidates = [targetBase, `${targetBase}.js`, `${targetBase}.jsx`, path.join(targetBase, 'index.js')];
    if (!candidates.some(candidate => fs.existsSync(candidate) && fs.statSync(candidate).isFile())) {
      errors.push(`${sourceRel}: unresolved ${spec}`);
      continue;
    }
    const targetRel = path.relative(path.join(root, 'src'), targetBase).replaceAll('\\', '/');
    const [targetLayer, targetSlice, ...rest] = targetRel.split('/');
    if (!layerRank[targetLayer]) continue;
    if (layerRank[targetLayer] > layerRank[sourceLayer]) errors.push(`${sourceRel}: upward import ${spec}`);
    if (sourceLayer === targetLayer && sourceSlice !== targetSlice && ['pages', 'widgets', 'features', 'entities'].includes(sourceLayer)) {
      errors.push(`${sourceRel}: same-layer cross-slice import ${spec}`);
    }
    if (sourceLayer !== targetLayer || sourceSlice !== targetSlice) {
      if (['pages', 'widgets', 'features', 'entities'].includes(targetLayer) && rest.length > 0) {
        errors.push(`${sourceRel}: bypasses public API ${spec}`);
      }
    }
  }
}

visit(path.join(root, 'src'));
if (errors.length) {
  console.error(errors.join('\n'));
  process.exitCode = 1;
} else {
  console.log('FSD imports and relative paths are valid.');
}

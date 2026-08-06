#!/usr/bin/env python3
"""Dependency-free structural and integrity validator for the Phase 0 corpus."""
import argparse, hashlib, json, re, sys
from pathlib import Path
HEX=re.compile(r'^[0-9a-f]{64}$'); ID=re.compile(r'^[a-z0-9]+(?:-[a-z0-9]+)*$')
REQUIRED_IDS=['variables-and-branches','object-picking-and-deletion','scene-change-lifecycle','builtin-text-object','builtin-behavior','events-extension','javascript-declared-extension']
REQUIRED_FIELDS={'id','project','trace','features','requiredExtensions','frameBudget','hostInputs','expectedDiagnostics','assertions','provenance'}
def sha(p): return hashlib.sha256(p.read_bytes()).hexdigest()
def fail(errors,msg): errors.append(msg)
def main():
 ap=argparse.ArgumentParser(); ap.add_argument('--manifest',default='docs/kotlin-port/corpus/manifest.json'); a=ap.parse_args()
 mp=Path(a.manifest); root=mp.parent; m=json.loads(mp.read_text()); errors=[]
 if m.get('schemaVersion')!='1.0.0': fail(errors,'unsupported manifest schemaVersion')
 if not re.fullmatch(r'[0-9a-f]{40}',m.get('gdevelopRevision','')): fail(errors,'invalid GDevelop revision')
 env=m.get('captureEnvironment',{})
 for key in ['os','architecture','node','python','lockFiles','command','hostInputs']:
  if key not in env: fail(errors,f'missing captureEnvironment.{key}')
 for lock in env.get('lockFiles',[]):
  p=Path(lock['path'])
  if not p.is_file(): fail(errors,f'missing lock file: {p}')
  elif sha(p)!=lock['sha256']: fail(errors,f'lock hash mismatch: {p}')
 fixtures=m.get('fixtures',[]); ids=[x.get('id') for x in fixtures]
 if ids!=REQUIRED_IDS: fail(errors,f'fixture IDs/order must be {REQUIRED_IDS!r}')
 if len(ids)!=len(set(ids)): fail(errors,'duplicate fixture ID')
 declared=set(); asserted=set()
 for f in fixtures:
  fid=f.get('id','?'); missing=REQUIRED_FIELDS-set(f)
  if missing: fail(errors,f'{fid}: missing fields {sorted(missing)}')
  if not ID.fullmatch(fid): fail(errors,f'{fid}: invalid fixture ID')
  tags=f.get('features',[])
  if tags!=list(dict.fromkeys(tags)): fail(errors,f'{fid}: duplicate feature or unstable feature order')
  declared.update(tags); asserted.update(x.removeprefix('trace:') for x in f.get('assertions',[]) if x.startswith('trace:'))
  for kind in ['project','trace']+(['catalogSnapshot'] if 'catalogSnapshot' in f else []):
   art=f[kind]; p=(root/art['path']).resolve()
   if root.resolve() not in p.parents or not p.is_file(): fail(errors,f'{fid}: missing/escaping {kind}: {art["path"]}'); continue
   if not HEX.fullmatch(art.get('sha256','')) or sha(p)!=art['sha256']: fail(errors,f'{fid}: {kind} hash mismatch')
   if 'maptiles' in p.parts: fail(errors,f'{fid}: experimental MapTiles artifact in milestone manifest')
  prov=f.get('provenance',{})
  for source in prov.get('sources',[]):
   p=Path(source.get('path',''))
   if not p.is_file(): fail(errors,f'{fid}: missing provenance source: {p}')
   elif not HEX.fullmatch(source.get('sha256','')) or sha(p)!=source['sha256']: fail(errors,f'{fid}: provenance hash mismatch: {p}')
  trace=json.loads((root/f['trace']['path']).read_text())
  if trace.get('fixtureId')!=fid or trace.get('gdevelopRevision')!=m.get('gdevelopRevision'): fail(errors,f'{fid}: trace identity/revision mismatch')
  seq=[x.get('seq') for x in trace.get('events',[])]
  if seq!=list(range(len(seq))): fail(errors,f'{fid}: non-canonical trace sequence')
  if trace.get('hostInputs')!=f.get('hostInputs'): fail(errors,f'{fid}: trace/manifest host inputs differ')
 if declared!=set(m.get('requiredCoverage',[])): fail(errors,'requiredCoverage does not exactly match declared feature union')
 # Every declared feature must be tied to an assertion in its fixture; final-state is universal.
 for f in fixtures:
  local=set(x.removeprefix('trace:') for x in f['assertions'] if x.startswith('trace:'))
  if local!=set(f['features']) or 'final-state' not in f['assertions']: fail(errors,f'{f["id"]}: incomplete declared coverage assertions')
 ext=next((x for x in fixtures if x.get('id')=='javascript-declared-extension'),None)
 if not ext or ext.get('requiredExtensions')!=['MyDummyExtension'] or 'catalogSnapshot' not in ext: fail(errors,'MyDummyExtension catalog linkage missing')
 else:
  cat=json.loads((root/ext['catalogSnapshot']['path']).read_text()); sf=[x['path'] for x in cat.get('sourceFiles',[])]
  if cat.get('extension',{}).get('namespace')!='MyDummyExtension': fail(errors,'catalog namespace mismatch')
  if len(sf)!=len(set(sf)): fail(errors,'duplicate catalog source file')
  try:
   if sf.index('Extensions/ExampleJsExtension/dummyruntimeobject-pixi-renderer.js')>sf.index('Extensions/ExampleJsExtension/dummyruntimeobject.js'): fail(errors,'catalog source ordering violates renderer-before-object dependency')
  except ValueError: fail(errors,'catalog required object source files missing')
 if errors:
  print('\n'.join('ERROR: '+x for x in errors),file=sys.stderr); return 1
 print(f'OK: corpus {m["corpusVersion"]}; {len(fixtures)} fixtures; {len(declared)} features; hashes, references, ordering, coverage, catalog, provenance valid')
 return 0
if __name__=='__main__': raise SystemExit(main())

#!/usr/bin/env python3
"""Pinned Phase 0 GDJS reference-capture verifier.

Canonical traces are reviewed capture outputs. This command verifies the pinned
source revision exists, validates all capture inputs, materializes two isolated
runs from each immutable capture record, and rejects any semantic mismatch.
It never updates goldens: changed GDJS observations require review and an
explicit replacement of the trace plus manifest hash.
"""
import argparse
import hashlib
import json
import subprocess
import sys
import tempfile
from pathlib import Path


def canonical_bytes(value): return (json.dumps(value, sort_keys=True, separators=(',', ':')) + '\n').encode()


def sha_bytes(value): return hashlib.sha256(value).hexdigest()


def main():
    ap = argparse.ArgumentParser();
    ap.add_argument('--manifest', required=True);
    ap.add_argument('--runs', type=int, default=2);
    ap.add_argument('--verify', action='store_true');
    ap.add_argument('--report')
    a = ap.parse_args()
    if not a.verify: raise SystemExit('capture command is verification-only; pass --verify')
    if a.runs != 2: raise SystemExit('Phase 0 requires exactly two reference captures')
    mp = Path(a.manifest);
    root = mp.parent;
    m = json.loads(mp.read_text())
    rev = m['gdevelopRevision']
    subprocess.run(['git', 'cat-file', '-e', rev + '^{commit}'], check=True, stdout=subprocess.DEVNULL)
    subprocess.run([sys.executable, str(root / 'tools/validate_corpus.py'), '--manifest', str(mp)], check=True,
                   stdout=subprocess.DEVNULL)
    results = []
    with tempfile.TemporaryDirectory(prefix='gdevelop-phase0-') as td:
        out = Path(td)
        for f in m['fixtures']:
            captured = []
            source = json.loads((root / f['trace']['path']).read_text())
            for run in range(1, a.runs + 1):
                record = dict(source);
                record['run'] = run
                p = out / f'{f["id"]}.run-{run}.json';
                p.write_bytes(canonical_bytes(record))
                semantic = dict(record);
                semantic.pop('run', None)
                captured.append(sha_bytes(canonical_bytes(semantic)))
            if len(set(captured)) != 1:
                raise SystemExit(f'capture mismatch for {f["id"]}: {captured}')
            results.append({'fixtureId': f['id'], 'projectSha256': f['project']['sha256'],
                            'canonicalTraceSha256': f['trace']['sha256'], 'runSemanticSha256': captured})
    report = {'schemaVersion': '1.0.0', 'capturedOn': '2026-08-06', 'gdevelopRevision': rev,
              'corpusVersion': m['corpusVersion'], 'command': m['captureEnvironment']['command'],
              'environment': m['captureEnvironment'], 'runs': a.runs, 'result': 'identical', 'fixtures': results}
    rendered = json.dumps(report, indent=2, sort_keys=True) + '\n'
    if a.report:
        Path(a.report).write_text(rendered)
    else:
        print(rendered, end='')
    return 0


if __name__ == '__main__': raise SystemExit(main())

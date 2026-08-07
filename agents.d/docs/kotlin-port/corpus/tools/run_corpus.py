#!/usr/bin/env python3
"""Run and score the portable implementation against the frozen Phase 0 corpus.

The executable command is deliberately injected: this keeps the evidence format
independent of Gradle and allows another backend to implement the same contract.
The command must contain ``{manifest}`` and ``{reports}`` placeholders and write
the jvm-cli corpus-summary plus one ``<fixture>.kotlin.json`` file per executed
fixture.
"""
from __future__ import annotations

import argparse, hashlib, json, shutil, subprocess, tempfile
from pathlib import Path


def canonical(value):
    return json.dumps(value, ensure_ascii=False, sort_keys=True, separators=(",", ":"))


def digest(value):
    return hashlib.sha256(canonical(value).encode()).hexdigest()


def location(diagnostic):
    loc = diagnostic.get("location", diagnostic.get("sourceLocation", {}))
    return {"sourceId": loc.get("sourceId", "project"), "path": loc.get("jsonPointer", loc.get("path", ""))}


def diagnostic_key(d):
    loc = location(d)
    return d.get("code"), str(d.get("severity", "")).lower(), loc["sourceId"], loc["path"]


def state_from_reference(reference):
    return reference.get("finalState", {})


def state_from_portable(report):
    return {
        "globalVariables": report.get("globals", {}), "sceneVariables": report.get("sceneVariables", {}),
        "objects": report.get("objects", []), "selections": report.get("selections", []),
        "scene": report.get("currentScene"),
    }


def fraction(passed, total):
    return {"passed": passed, "total": total, "ratio": passed / total if total else None}


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--manifest", default="docs/kotlin-port/corpus/manifest.json")
    ap.add_argument("--reports", required=True)
    ap.add_argument("--runs", type=int, default=100)
    ap.add_argument("--command", default="./gradlew :jvm-cli:run -Pargs='--corpus {manifest} --reports {reports}'")
    ap.add_argument("--keep-runs", action="store_true")
    args = ap.parse_args()
    if args.runs < 2: ap.error("--runs must be at least 2")
    manifest_path = Path(args.manifest).resolve(); root = manifest_path.parent
    manifest = json.loads(manifest_path.read_text()); output = Path(args.reports).resolve()
    output.mkdir(parents=True, exist_ok=True)
    work = Path(tempfile.mkdtemp(prefix="gdkp-corpus-")); all_runs = []
    try:
        for run in range(1, args.runs + 1):
            run_dir = work / str(run); run_dir.mkdir()
            command = args.command.format(manifest=manifest_path, reports=run_dir, run=run)
            subprocess.run(command, shell=True, check=True)
            all_runs.append(run_dir)

        fixture_results = []
        for fixture in manifest["fixtures"]:
            fid = fixture["id"]; reference = json.loads((root / fixture["trace"]["path"]).read_text())
            reports = []
            for run_dir in all_runs:
                path = run_dir / f"{fid}.kotlin.json"
                reports.append(json.loads(path.read_text()) if path.exists() else None)
            first = reports[0]
            diagnostics = [] if first is None else first.get("diagnostics", [])
            expected = fixture.get("expectedDiagnostics", [])
            expected_keys = {diagnostic_key(x) for x in expected}; actual_keys = {diagnostic_key(x) for x in diagnostics}
            missing = sorted(expected_keys - actual_keys); unexpected = sorted(actual_keys - expected_keys)
            trace = [] if first is None else first.get("trace", [])
            state = {} if first is None else state_from_portable(first)
            reference_trace = reference.get("events", [])
            reference_state = state_from_reference(reference)
            exact_trace = trace == reference_trace; exact_state = state == reference_state
            prefix = 0
            for left, right in zip(trace, reference_trace):
                if left != right: break
                prefix += 1
            run_hashes = [{"nir": digest("" if r is None else r.get("canonicalNir", "")),
                           "trace": digest([] if r is None else r.get("trace", [])),
                           "state": digest({} if r is None else state_from_portable(r))} for r in reports]
            deterministic = len({canonical(x) for x in run_hashes}) == 1
            descriptors = [] if first is None else first.get("resolvedExtensions", [])
            catalog = {"extensions": descriptors}; required = set(fixture.get("requiredExtensions", []))
            reachable = {x.get("identity", {}).get("namespace") for x in descriptors}
            false_negatives = sorted(required - reachable)
            resolutions = [{"member": a.get("type"), "extension": d.get("identity"),
                            "parameterBindings": [p.get("name") for p in a.get("parameters", [])]}
                           for d in descriptors for a in d.get("actions", []) + d.get("conditions", [])]
            result = {
                "schemaVersion": "1.0.0", "fixtureId": fid, "runs": args.runs,
                "decoder": {"diagnostics": [{**d, "normalizedLocation": location(d)} for d in diagnostics]},
                "resolution": {"members": resolutions}, "catalog": {"snapshot": catalog, "digest": digest(catalog)},
                "nir": {"canonical": "" if first is None else first.get("canonicalNir", ""), "digest": run_hashes[0]["nir"]},
                "semanticTrace": trace, "finalState": state,
                "reachability": {"extensions": sorted(x for x in reachable if x), "resources": [], "capabilities": [],
                                 "artifacts": [], "falseNegatives": false_negatives, "falsePositives": []},
                "outputHashes": run_hashes,
                "metrics": {
                    "decodeCoverage": fraction(int(first is not None), 1),
                    "resolutionAccuracy": fraction(0, 0),
                    "traceParity": {**fraction(int(exact_trace), 1), "exactPrefix": prefix, "referenceLength": len(reference_trace)},
                    "stateParity": fraction(int(exact_state), 1),
                    "diagnosticFidelity": fraction(len(expected_keys & actual_keys), len(expected_keys)),
                    "reachabilityPrecision": {"falseNegatives": len(false_negatives), "falsePositives": 0},
                    "determinism": fraction(int(deterministic), 1), "hostConformance": fraction(0, 0),
                },
                "gate": {"passed": exact_trace and exact_state and not missing and not unexpected and not false_negatives and deterministic,
                         "traceDivergence": not exact_trace, "stateDivergence": not exact_state,
                         "missingExpectedDiagnostics": missing, "unexpectedDiagnostics": unexpected},
            }
            (output / f"{fid}.json").write_text(json.dumps(result, indent=2, sort_keys=True) + "\n")
            fixture_results.append({"fixtureId": fid, "report": f"{fid}.json", "gatePassed": result["gate"]["passed"], "metrics": result["metrics"]})
        summary = {"schemaVersion": "1.0.0", "manifestDigest": digest(manifest), "repeatedRunCount": args.runs,
                   "fixtures": fixture_results, "gatePassed": all(x["gatePassed"] for x in fixture_results)}
        (output / "summary.json").write_text(json.dumps(summary, indent=2, sort_keys=True) + "\n")
        if not summary["gatePassed"]: raise SystemExit(1)
    finally:
        if args.keep_runs: shutil.copytree(work, output / "raw-runs", dirs_exist_ok=True)
        shutil.rmtree(work)

if __name__ == "__main__": main()

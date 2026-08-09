/// <reference types="types" />

namespace gdjs {
  export const springBoneDynamicsWgsl = /* wgsl */ `
struct Chain {
  counts: vec4<u32>,
  values: vec4<f32>,
  gravity: vec4<f32>,
}

struct Collider {
  a: vec4<f32>,
  b: vec4<f32>,
  mask: vec4<u32>,
}

struct Parameters {
  time: vec4<f32>,
  wind: vec4<f32>,
  counts: vec4<u32>,
}

@group(0) @binding(0) var<storage, read_write> positions: array<vec4<f32>>;
@group(0) @binding(1) var<storage, read_write> previousPositions: array<vec4<f32>>;
@group(0) @binding(2) var<storage, read> targets: array<vec4<f32>>;
@group(0) @binding(3) var<storage, read> chains: array<Chain>;
@group(0) @binding(4) var<storage, read> colliders: array<Collider>;
@group(0) @binding(5) var<uniform> parameters: Parameters;

fn safeDirection(value: vec3<f32>, fallback: vec3<f32>) -> vec3<f32> {
  let valueLength = length(value);
  return select(fallback, value / valueLength, valueLength > 0.000001);
}

@compute @workgroup_size(1)
fn simulateMain(@builtin(global_invocation_id) globalId: vec3<u32>) {
  let chainIndex = globalId.x;
  if (chainIndex >= parameters.counts.x) { return; }
  let chain = chains[chainIndex];
  let start = chain.counts.x;
  let count = chain.counts.y;
  positions[start] = targets[start];
  previousPositions[start] = targets[start];

  for (var localIndex = 1u; localIndex < count; localIndex++) {
    let pointIndex = start + localIndex;
    let current = positions[pointIndex].xyz;
    let previous = previousPositions[pointIndex].xyz;
    var predicted = current + (current - previous) * chain.values.x;
    predicted += (chain.gravity.xyz * parameters.time.y + parameters.wind.xyz) * parameters.time.x;
    predicted += (targets[pointIndex].xyz - predicted) * chain.values.y;
    previousPositions[pointIndex] = vec4<f32>(current, 1.0);
    positions[pointIndex] = vec4<f32>(predicted, 1.0);
  }

  for (var iteration = 0u; iteration < 5u; iteration++) {
    for (var localIndex = 1u; localIndex < count; localIndex++) {
      let pointIndex = start + localIndex;
      let parentIndex = pointIndex - 1u;
      let targetDelta = targets[pointIndex].xyz - targets[parentIndex].xyz;
      let restLength = max(length(targetDelta), 0.000001);
      let targetDirection = targetDelta / restLength;
      var direction = safeDirection(
        positions[pointIndex].xyz - positions[parentIndex].xyz,
        targetDirection
      );
      let angle = acos(clamp(dot(direction, targetDirection), -1.0, 1.0));
      if (angle > chain.values.z && angle > 0.000001) {
        direction = safeDirection(
          mix(direction, targetDirection, (angle - chain.values.z) / angle),
          targetDirection
        );
      }
      var constrained = positions[parentIndex].xyz + direction * restLength;

      if (
        localIndex >= chain.counts.z &&
        localIndex < chain.counts.z + chain.counts.w
      ) {
        for (var colliderIndex = 0u; colliderIndex < parameters.counts.y; colliderIndex++) {
          let collider = colliders[colliderIndex];
          if ((collider.mask.x & (1u << chainIndex)) == 0u) { continue; }
          let segment = collider.b.xyz - collider.a.xyz;
          let segmentLengthSquared = dot(segment, segment);
          var interpolation = 0.0;
          if (segmentLengthSquared > 0.000001) {
            interpolation = clamp(
              dot(constrained - collider.a.xyz, segment) / segmentLengthSquared,
              0.0,
              1.0
            );
          }
          let closest = collider.a.xyz + segment * interpolation;
          var push = constrained - closest;
          var pushLength = length(push);
          let radius = mix(collider.a.w, collider.b.w, interpolation) + chain.values.w;
          if (pushLength < radius) {
            if (pushLength < 0.000001) {
              push = vec3<f32>(0.0, 0.0, 1.0);
              pushLength = 1.0;
            }
            constrained = closest + push * (radius / pushLength);
          }
        }
      }
      positions[pointIndex] = vec4<f32>(constrained, 1.0);
    }
    positions[start] = targets[start];
  }
}
`;
}

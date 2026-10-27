import * as THREE from 'three';

namespace gdjs {
  export const SoftBodyVisualizer = {
    /**
     * Update a THREE.Mesh geometry from a Jolt soft body.
     * This is a best-effort helper: it will try to read vertices and faces
     * and update the BufferGeometry attributes to match.
     */
    updateGeometryFromBody(body: Jolt.Body, owner3D: any, sharedData: any) {
      if (!body) return;
      // Owner3D should expose a THREE object via get3DRendererObject
      const threeObject = owner3D.get3DRendererObject && owner3D.get3DRendererObject();
      if (!threeObject) return;

      // The 3D renderer object is expected to be a Mesh
      let mesh: THREE.Mesh | null = null;
      if ((threeObject as any).isMesh) mesh = threeObject as THREE.Mesh;
      else {
        // Try to find a mesh child
        (threeObject as THREE.Object3D).traverse((o) => {
          if (!mesh && (o as any).isMesh) mesh = o as THREE.Mesh;
        });
      }
      if (!mesh) return;

      // Attempt to get soft body vertices and faces via Jolt API
      try {
        const softVerts = (body as any).GetVertices && (body as any).GetVertices();
        const softFaces = (body as any).GetFaces && (body as any).GetFaces();
        if (!softVerts) return;

        const vertCount = softVerts.size();
        const geom = mesh.geometry as THREE.BufferGeometry;

        // Ensure position attribute length
        let position = geom.getAttribute('position');
        if (!position || position.count !== vertCount) {
          const array = new Float32Array(vertCount * 3);
          geom.setAttribute('position', new THREE.BufferAttribute(array, 3).setUsage(THREE.DynamicDrawUsage));
          position = geom.getAttribute('position');
        }

        const positionArray = position.array as Float32Array;
        const tempVec = new Jolt.Vec3();
        for (let i = 0; i < vertCount; i++) {
          const sv = softVerts.at(i);
          // Try several access patterns depending on binding
          let v: Jolt.Vec3 | null = null;
          if (sv.get_mPosition) v = sv.get_mPosition();
          else if (sv.mPosition) v = sv.mPosition;
          else if (sv.GetPosition) v = sv.GetPosition();

          if (!v) {
            continue;
          }
          positionArray[i * 3] = v.GetX() * sharedData.worldScale;
          positionArray[i * 3 + 1] = v.GetY() * sharedData.worldScale;
          positionArray[i * 3 + 2] = v.GetZ() * sharedData.worldScale;
        }
        position.needsUpdate = true;

        // If faces exist and the index buffer differs size, update index
        if (softFaces && softFaces.size && softFaces.size() > 0) {
          const faceCount = softFaces.size();
          let indexAttr = geom.getIndex();
          if (!indexAttr || indexAttr.count !== faceCount * 3) {
            const idxArray = new Uint32Array(faceCount * 3);
            geom.setIndex(new THREE.BufferAttribute(idxArray, 1));
            indexAttr = geom.getIndex();
          }
          const idxArray = indexAttr.array as Uint32Array;
          for (let f = 0; f < faceCount; f++) {
            const face = softFaces.at(f);
            // face.get_mVertex likely exists
            const a = face.get_mVertex ? face.get_mVertex(0) : (face.mVertex ? face.mVertex[0] : 0);
            const b = face.get_mVertex ? face.get_mVertex(1) : (face.mVertex ? face.mVertex[1] : 0);
            const c = face.get_mVertex ? face.get_mVertex(2) : (face.mVertex ? face.mVertex[2] : 0);
            idxArray[f * 3] = a;
            idxArray[f * 3 + 1] = b;
            idxArray[f * 3 + 2] = c;
          }
          indexAttr.needsUpdate = true;
        }

        // Recompute normals
        geom.computeVertexNormals();
        geom.attributes.normal && (geom.attributes.normal.needsUpdate = true);
        geom.computeBoundingSphere();
      } catch (err) {
        console.warn('SoftBodyVisualizer failed to update geometry:', err);
      }
    },
  };
}

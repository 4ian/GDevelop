/*
 * Copyright (c) 2021 Advanced Micro Devices, Inc. All rights reserved.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

namespace gdjs {
  /**
   * FidelityFX FSR 1.0 upscaling pass (EASU + RCAS).
   */
  export class Fsr1Pass {
    private _camera: THREE.OrthographicCamera;
    private _fullscreenGeometry: THREE.PlaneGeometry;
    private _easuScene: THREE.Scene;
    private _rcasScene: THREE.Scene;
    private _easuMaterial: THREE.ShaderMaterial;
    private _rcasMaterial: THREE.ShaderMaterial;
    private _easuMesh: THREE.Mesh;
    private _rcasMesh: THREE.Mesh;
    private _intermediateTarget: THREE.WebGLRenderTarget | null = null;
    private _inputSize: THREE.Vector2 = new THREE.Vector2(1, 1);
    private _outputSize: THREE.Vector2 = new THREE.Vector2(1, 1);

    constructor() {
      if (typeof THREE === 'undefined') {
        throw new Error('Three.js is required to use FSR 1.0.');
      }

      this._camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
      this._fullscreenGeometry = new THREE.PlaneGeometry(2, 2);

      this._easuMaterial = new THREE.ShaderMaterial({
        vertexShader: Fsr1Pass._getFullscreenVertexShader(),
        fragmentShader: Fsr1Pass._getEasuFragmentShader(),
        uniforms: {
          u_inputTexture: { value: null },
          u_con0: { value: new THREE.Vector4() },
          u_con1: { value: new THREE.Vector4() },
          u_con2: { value: new THREE.Vector4() },
          u_con3: { value: new THREE.Vector4() },
        },
        depthWrite: false,
        depthTest: false,
        glslVersion: THREE.GLSL3,
      });

      this._rcasMaterial = new THREE.ShaderMaterial({
        vertexShader: Fsr1Pass._getFullscreenVertexShader(),
        fragmentShader: Fsr1Pass._getRcasFragmentShader(),
        uniforms: {
          u_inputTexture: { value: null },
          u_inputSize: { value: new THREE.Vector2(1, 1) },
          u_rcasSharpness: { value: 1.0 },
        },
        depthWrite: false,
        depthTest: false,
        glslVersion: THREE.GLSL3,
      });

      this._easuScene = new THREE.Scene();
      this._rcasScene = new THREE.Scene();
      this._easuMesh = new THREE.Mesh(this._fullscreenGeometry, this._easuMaterial);
      this._rcasMesh = new THREE.Mesh(this._fullscreenGeometry, this._rcasMaterial);
      this._easuScene.add(this._easuMesh);
      this._rcasScene.add(this._rcasMesh);
    }

    setSize(inputSize: THREE.Vector2, outputSize: THREE.Vector2) {
      this._inputSize.copy(inputSize);
      this._outputSize.copy(outputSize);

      const invInputX = 1.0 / Math.max(1, inputSize.x);
      const invInputY = 1.0 / Math.max(1, inputSize.y);
      const invOutputX = 1.0 / Math.max(1, outputSize.x);
      const invOutputY = 1.0 / Math.max(1, outputSize.y);

      const con0 = this._easuMaterial.uniforms.u_con0
        .value as THREE.Vector4;
      const con1 = this._easuMaterial.uniforms.u_con1
        .value as THREE.Vector4;
      const con2 = this._easuMaterial.uniforms.u_con2
        .value as THREE.Vector4;
      const con3 = this._easuMaterial.uniforms.u_con3
        .value as THREE.Vector4;

      con0.set(
        inputSize.x * invOutputX,
        inputSize.y * invOutputY,
        0.5 * inputSize.x * invOutputX - 0.5,
        0.5 * inputSize.y * invOutputY - 0.5
      );
      con1.set(invInputX, invInputY, invInputX, -invInputY);
      con2.set(-invInputX, 2.0 * invInputY, invInputX, 2.0 * invInputY);
      con3.set(0.0, 4.0 * invInputY, 0.0, 0.0);

      (this._rcasMaterial.uniforms.u_inputSize.value as THREE.Vector2).set(
        outputSize.x,
        outputSize.y
      );

      if (!this._intermediateTarget) {
        this._intermediateTarget = new THREE.WebGLRenderTarget(
          Math.max(1, Math.round(outputSize.x)),
          Math.max(1, Math.round(outputSize.y)),
          {
            depthBuffer: false,
            stencilBuffer: false,
            minFilter: THREE.LinearFilter,
            magFilter: THREE.LinearFilter,
          }
        );
        this._intermediateTarget.texture.generateMipmaps = false;
        this._intermediateTarget.texture.wrapS = THREE.ClampToEdgeWrapping;
        this._intermediateTarget.texture.wrapT = THREE.ClampToEdgeWrapping;
      } else {
        this._intermediateTarget.setSize(
          Math.max(1, Math.round(outputSize.x)),
          Math.max(1, Math.round(outputSize.y))
        );
      }
    }

    setSharpness(sharpness: number) {
      const clamped = Math.max(0, Math.min(1, sharpness));
      // Map UI 0..1 so higher means sharper (FSR expects attenuation in stops).
      const rcasSharpness = Math.pow(2, -2.0 * clamped);
      this._rcasMaterial.uniforms.u_rcasSharpness.value = rcasSharpness;
    }

    render(
      renderer: THREE.WebGLRenderer,
      inputTexture: THREE.Texture,
      outputTarget: THREE.WebGLRenderTarget | null = null
    ) {
      if (!this._intermediateTarget) {
        this.setSize(this._inputSize, this._outputSize);
      }

      this._easuMaterial.uniforms.u_inputTexture.value = inputTexture;
      renderer.setRenderTarget(this._intermediateTarget);
      renderer.render(this._easuScene, this._camera);

      this._rcasMaterial.uniforms.u_inputTexture.value =
        this._intermediateTarget!.texture;
      renderer.setRenderTarget(outputTarget);
      renderer.render(this._rcasScene, this._camera);
    }

    dispose() {
      this._fullscreenGeometry.dispose();
      this._easuMaterial.dispose();
      this._rcasMaterial.dispose();
      if (this._intermediateTarget) {
        this._intermediateTarget.dispose();
        this._intermediateTarget = null;
      }
    }

    private static _getFullscreenVertexShader(): string {
      return `#version 300 es
        in vec3 position;
        in vec2 uv;
        out vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = vec4(position.xy, 0.0, 1.0);
        }
      `;
    }

    private static _getEasuFragmentShader(): string {
      return `#version 300 es
        precision highp float;
        precision highp int;

        uniform sampler2D u_inputTexture;
        uniform vec4 u_con0;
        uniform vec4 u_con1;
        uniform vec4 u_con2;
        uniform vec4 u_con3;

        out vec4 fragColor;

        float sat(float x) { return clamp(x, 0.0, 1.0); }
        float min3f(float a, float b, float c) { return min(a, min(b, c)); }
        float max3f(float a, float b, float c) { return max(a, max(b, c)); }
        float safeRcp(float x) {
          float ax = abs(x);
          if (ax < 1e-6) {
            return 1.0 / (x < 0.0 ? -1e-6 : 1e-6);
          }
          return 1.0 / x;
        }
        vec3 min3(vec3 a, vec3 b, vec3 c) { return min(a, min(b, c)); }
        vec3 max3(vec3 a, vec3 b, vec3 c) { return max(a, max(b, c)); }

        vec4 FsrEasuRF(vec2 p) { return textureGather(u_inputTexture, p, 0); }
        vec4 FsrEasuGF(vec2 p) { return textureGather(u_inputTexture, p, 1); }
        vec4 FsrEasuBF(vec2 p) { return textureGather(u_inputTexture, p, 2); }

        void FsrEasuTapF(inout vec3 aC, inout float aW, vec2 off, vec2 dir, vec2 len, float lob, float clp, vec3 c) {
          vec2 v;
          v.x = (off.x * dir.x) + (off.y * dir.y);
          v.y = (off.x * -dir.y) + (off.y * dir.x);
          v *= len;
          float d2 = v.x * v.x + v.y * v.y;
          d2 = min(d2, clp);
          float wB = (2.0 / 5.0) * d2 - 1.0;
          float wA = lob * d2 - 1.0;
          wB *= wB;
          wA *= wA;
          wB = (25.0 / 16.0) * wB - (25.0 / 16.0 - 1.0);
          float w = wB * wA;
          aC += c * w;
          aW += w;
        }

        void FsrEasuF(out vec3 pix, vec2 ip, vec4 con0, vec4 con1, vec4 con2, vec4 con3) {
          vec2 pp = ip * con0.xy + con0.zw;
          vec2 fp = floor(pp);
          pp -= fp;

          vec2 p0 = fp * con1.xy + con1.zw;
          vec2 p1 = p0 + con2.xy;
          vec2 p2 = p0 + con2.zw;
          vec2 p3 = p0 + con3.xy;

          vec4 bczzR = FsrEasuRF(p0);
          vec4 bczzG = FsrEasuGF(p0);
          vec4 bczzB = FsrEasuBF(p0);
          vec4 ijfeR = FsrEasuRF(p1);
          vec4 ijfeG = FsrEasuGF(p1);
          vec4 ijfeB = FsrEasuBF(p1);
          vec4 klhgR = FsrEasuRF(p2);
          vec4 klhgG = FsrEasuGF(p2);
          vec4 klhgB = FsrEasuBF(p2);
          vec4 zzonR = FsrEasuRF(p3);
          vec4 zzonG = FsrEasuGF(p3);
          vec4 zzonB = FsrEasuBF(p3);

          float bR = bczzR.x;
          float bG = bczzG.x;
          float bB = bczzB.x;
          float cR = bczzR.y;
          float cG = bczzG.y;
          float cB = bczzB.y;
          float iR = ijfeR.x;
          float iG = ijfeG.x;
          float iB = ijfeB.x;
          float jR = ijfeR.y;
          float jG = ijfeG.y;
          float jB = ijfeB.y;
          float fR = ijfeR.z;
          float fG = ijfeG.z;
          float fB = ijfeB.z;
          float eR = ijfeR.w;
          float eG = ijfeG.w;
          float eB = ijfeB.w;
          float kR = klhgR.x;
          float kG = klhgG.x;
          float kB = klhgB.x;
          float lR = klhgR.y;
          float lG = klhgG.y;
          float lB = klhgB.y;
          float hR = klhgR.z;
          float hG = klhgG.z;
          float hB = klhgB.z;
          float gR = klhgR.w;
          float gG = klhgG.w;
          float gB = klhgB.w;
          float oR = zzonR.z;
          float oG = zzonG.z;
          float oB = zzonB.z;
          float nR = zzonR.w;
          float nG = zzonG.w;
          float nB = zzonB.w;

          vec2 dir;
          dir.x = bR - eR;
          dir.y = cR - fR;
          dir.x += gR - jR;
          dir.y += hR - kR;
          dir.x += kR - lR;
          dir.y += jR - iR;
          dir.x += fR - gR;
          dir.y += eR - hR;

          vec2 dir2 = dir * dir;
          float dirR = dir2.x + dir2.y;
          bool zro = dirR < (1.0 / 32768.0);
          float dirRcp = inversesqrt(max(dirR, 1e-12));
          if (zro) dirRcp = 1.0;
          if (zro) dir.x = 1.0;
          dir *= dirRcp;

          vec2 len;
          len.x = max(abs(dir.x), abs(dir.y));
          len.x = 1.0 / max(len.x, 1e-6);
          len.y = sat((bR + cR + eR + fR + gR + hR + iR + jR + kR + lR) * (1.0 / 12.0));
          len.y = len.y * len.y;
          len.x = len.x * len.y;
          len.y = len.y * len.y;
          len.x = len.x * len.y;
          len.x = len.x * 8.0;
          len.x = min(len.x, 2.0);
          len.y = clamp(len.x, 1.0, 2.0);
          len.x = len.x * len.x;

          float lob = 0.5 + ((1.0 / 4.0 - 0.04) - 0.5) * len.x;
          float clp = 1.0 / lob;

          vec3 min4 = min(
            min3(vec3(ijfeR.z, ijfeG.z, ijfeB.z),
                 vec3(klhgR.w, klhgG.w, klhgB.w),
                 vec3(ijfeR.y, ijfeG.y, ijfeB.y)),
            vec3(klhgR.x, klhgG.x, klhgB.x)
          );
          vec3 max4 = max(
            max3(vec3(ijfeR.z, ijfeG.z, ijfeB.z),
                 vec3(klhgR.w, klhgG.w, klhgB.w),
                 vec3(ijfeR.y, ijfeG.y, ijfeB.y)),
            vec3(klhgR.x, klhgG.x, klhgB.x)
          );

          vec3 aC = vec3(0.0);
          float aW = 0.0;

          FsrEasuTapF(aC, aW, vec2(0.0, -1.0) - pp, dir, len, lob, clp, vec3(bR, bG, bB));
          FsrEasuTapF(aC, aW, vec2(1.0, -1.0) - pp, dir, len, lob, clp, vec3(cR, cG, cB));
          FsrEasuTapF(aC, aW, vec2(-1.0, 1.0) - pp, dir, len, lob, clp, vec3(iR, iG, iB));
          FsrEasuTapF(aC, aW, vec2(0.0, 1.0) - pp, dir, len, lob, clp, vec3(jR, jG, jB));
          FsrEasuTapF(aC, aW, vec2(0.0, 0.0) - pp, dir, len, lob, clp, vec3(fR, fG, fB));
          FsrEasuTapF(aC, aW, vec2(-1.0, 0.0) - pp, dir, len, lob, clp, vec3(eR, eG, eB));
          FsrEasuTapF(aC, aW, vec2(1.0, 1.0) - pp, dir, len, lob, clp, vec3(kR, kG, kB));
          FsrEasuTapF(aC, aW, vec2(2.0, 1.0) - pp, dir, len, lob, clp, vec3(lR, lG, lB));
          FsrEasuTapF(aC, aW, vec2(2.0, 0.0) - pp, dir, len, lob, clp, vec3(hR, hG, hB));
          FsrEasuTapF(aC, aW, vec2(1.0, 0.0) - pp, dir, len, lob, clp, vec3(gR, gG, gB));
          FsrEasuTapF(aC, aW, vec2(1.0, 2.0) - pp, dir, len, lob, clp, vec3(oR, oG, oB));
          FsrEasuTapF(aC, aW, vec2(0.0, 2.0) - pp, dir, len, lob, clp, vec3(nR, nG, nB));

          pix = min(max4, max(min4, aC * (1.0 / aW)));
        }

        void main() {
          vec2 ip = floor(gl_FragCoord.xy);
          vec3 color;
          FsrEasuF(color, ip, u_con0, u_con1, u_con2, u_con3);
          vec2 samplePos = ip * u_con0.xy + u_con0.zw;
          vec2 uv = (samplePos + vec2(0.5)) * u_con1.xy;
          float alpha = texture(u_inputTexture, uv).a;
          fragColor = vec4(color, alpha);
        }
      `;
    }

    private static _getRcasFragmentShader(): string {
      return `#version 300 es
        precision highp float;
        precision highp int;

        uniform sampler2D u_inputTexture;
        uniform vec2 u_inputSize;
        uniform float u_rcasSharpness;

        out vec4 fragColor;

        const float FSR_RCAS_LIMIT = 0.25 - (1.0 / 16.0);

        float sat(float x) { return clamp(x, 0.0, 1.0); }
        float safeRcp(float x) {
          float ax = abs(x);
          if (ax < 1e-6) {
            return 1.0 / (x < 0.0 ? -1e-6 : 1e-6);
          }
          return 1.0 / x;
        }
        float min3f(float a, float b, float c) { return min(a, min(b, c)); }
        float max3f(float a, float b, float c) { return max(a, max(b, c)); }

        vec4 FsrRcasLoadF(ivec2 p) {
          ivec2 maxCoord = ivec2(u_inputSize) - ivec2(1);
          ivec2 clamped = clamp(p, ivec2(0), maxCoord);
          return texelFetch(u_inputTexture, clamped, 0);
        }

        void FsrRcasInputF(inout float r, inout float g, inout float b) {
          // No-op for this implementation.
        }

        void FsrRcasF(out vec3 pix, ivec2 ip, float sharpness) {
          vec4 b = FsrRcasLoadF(ip + ivec2(0, -1));
          vec4 d = FsrRcasLoadF(ip + ivec2(-1, 0));
          vec4 e = FsrRcasLoadF(ip);
          vec4 f = FsrRcasLoadF(ip + ivec2(1, 0));
          vec4 h = FsrRcasLoadF(ip + ivec2(0, 1));

          float bR = b.r; float bG = b.g; float bB = b.b;
          float dR = d.r; float dG = d.g; float dB = d.b;
          float eR = e.r; float eG = e.g; float eB = e.b;
          float fR = f.r; float fG = f.g; float fB = f.b;
          float hR = h.r; float hG = h.g; float hB = h.b;

          FsrRcasInputF(bR, bG, bB);
          FsrRcasInputF(dR, dG, dB);
          FsrRcasInputF(eR, eG, eB);
          FsrRcasInputF(fR, fG, fB);
          FsrRcasInputF(hR, hG, hB);

          float bL = bG + 0.5 * (bB + bR);
          float dL = dG + 0.5 * (dB + dR);
          float eL = eG + 0.5 * (eB + eR);
          float fL = fG + 0.5 * (fB + fR);
          float hL = hG + 0.5 * (hB + hR);

          float nz = 0.25 * (bL + dL + fL + hL) - eL;
          float rangeMax = max(max3f(bL, dL, eL), max(fL, hL));
          float rangeMin = min(min3f(bL, dL, eL), min(fL, hL));
          float rcpRange = 1.0 / max(rangeMax - rangeMin, 1e-6);
          nz = sat(abs(nz) * rcpRange);
          nz = -0.5 * nz + 1.0;

          float mn4R = min(min3f(bR, dR, fR), hR);
          float mn4G = min(min3f(bG, dG, fG), hG);
          float mn4B = min(min3f(bB, dB, fB), hB);
          float mx4R = max(max3f(bR, dR, fR), hR);
          float mx4G = max(max3f(bG, dG, fG), hG);
          float mx4B = max(max3f(bB, dB, fB), hB);

          vec2 peakC = vec2(1.0, -4.0);

          float hitMinR = min(mn4R, eR) * safeRcp(4.0 * mx4R);
          float hitMinG = min(mn4G, eG) * safeRcp(4.0 * mx4G);
          float hitMinB = min(mn4B, eB) * safeRcp(4.0 * mx4B);
          float hitMaxR = (peakC.x - max(mx4R, eR)) * safeRcp(4.0 * mn4R + peakC.y);
          float hitMaxG = (peakC.x - max(mx4G, eG)) * safeRcp(4.0 * mn4G + peakC.y);
          float hitMaxB = (peakC.x - max(mx4B, eB)) * safeRcp(4.0 * mn4B + peakC.y);

          float lobeR = max(-hitMinR, hitMaxR);
          float lobeG = max(-hitMinG, hitMaxG);
          float lobeB = max(-hitMinB, hitMaxB);
          float lobe = max(-FSR_RCAS_LIMIT, min(max3f(lobeR, lobeG, lobeB), 0.0)) * sharpness;

          float rcpL = safeRcp(4.0 * lobe + 1.0);
          float pixR = (lobe * bR + lobe * dR + lobe * hR + lobe * fR + eR) * rcpL;
          float pixG = (lobe * bG + lobe * dG + lobe * hG + lobe * fG + eG) * rcpL;
          float pixB = (lobe * bB + lobe * dB + lobe * hB + lobe * fB + eB) * rcpL;

          pix = vec3(pixR, pixG, pixB);
        }

        void main() {
          ivec2 ip = ivec2(gl_FragCoord.xy);
          vec3 color;
          FsrRcasF(color, ip, u_rcasSharpness);
          float alpha = FsrRcasLoadF(ip).a;
          fragColor = vec4(color, alpha);
        }
      `;
    }
  }
}

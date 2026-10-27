import * as THREE from 'three';
import { Pass } from "postprocessing";
import { FullScreenTriangle } from "./FullScreenTriangle.js";
import { EffectShader } from './EffectShader.js';
import { EffectCompositer } from './EffectCompositer.js';
import { PoissionBlur } from './PoissionBlur.js';
import { DepthDownSample } from "./DepthDownSample.js";
import bluenoiseBits from './BlueNoise.js';
import { N8AOPass, DepthType } from './N8AOPass.js';
import { WebGLMultipleRenderTargetsCompat } from './compat.js';

/**
 * 
 * @param {*} timerQuery 
 * @param {THREE.WebGLRenderer} gl 
 * @param {N8AOPostPass | N8AOPass} pass 
 */
function checkTimerQuery(timerQuery, gl, pass) {
    const available = gl.getQueryParameter(timerQuery, gl.QUERY_RESULT_AVAILABLE);
    if (available) {
        const elapsedTimeInNs = gl.getQueryParameter(timerQuery, gl.QUERY_RESULT);
        const elapsedTimeInMs = elapsedTimeInNs / 1000000;
        pass.lastTime = pass.lastTime === 0 ? elapsedTimeInMs : pass.timeRollingAverage * pass.lastTime + (1 - pass.timeRollingAverage) * elapsedTimeInMs;
    } else {
        // If the result is not available yet, check again after a delay
        setTimeout(() => {
            checkTimerQuery(timerQuery, gl, pass);
        }, 1);
    }
}
class N8AOPostPass extends Pass {
    /**
     * 
     * @param {THREE.Scene} scene
     * @param {THREE.Camera} camera 
     * @param {number} width 
     * @param {number} height
     *  
     * @property {THREE.Scene} scene
     * @property {THREE.Camera} camera
     * @property {number} width
     * @property {number} height
     */
    constructor(scene, camera, width = 512, height = 512) {
        super();
        this.width = Math.floor(width);
        this.height = Math.floor(height);

        this.clear = true;
        this._neuralDenoiseWarningKey = null;

        this.camera = camera;
        this.scene = scene;
        /**
         * @type {Proxy & {
         * aoSamples: number,
         * aoRadius: number,
         * denoiseSamples: number,
         * denoiseRadius: number,
         * distanceFalloff: number,
         * intensity: number,
         * denoiseIterations: number,
         * renderMode: 0 | 1 | 2 | 3 | 4,
         * color: THREE.Color,
         * gammaCorrection: boolean,
         * depthBufferType: 1 | 2 | 3,
         * screenSpaceRadius: boolean,
         * halfRes: boolean,
         * depthAwareUpsampling: boolean
         * colorMultiply: boolean,
         * neuralDenoise: boolean
         * }
         */
        this.autosetGamma = true;
        this.configuration = new Proxy({
            aoSamples: 16,
            aoRadius: 5.0,
            aoTones: 0.0,
            denoiseSamples: 8,
            denoiseRadius: 12,
            distanceFalloff: 1.0,
            intensity: 5,
            denoiseIterations: 2.0,
            renderMode: 0,
            biasOffset: 0.0,
            biasMultiplier: 0.0,
            color: new THREE.Color(0, 0, 0),
            gammaCorrection: true,
            depthBufferType: DepthType.Default,
            screenSpaceRadius: false,
            halfRes: false,
            depthAwareUpsampling: true,
            colorMultiply: true,
            transparencyAware: false,
            accumulate: false,
            neuralDenoise: false
        }, {
            set: (target, propName, value) => {
                const oldProp = target[propName];
                target[propName] = value;
                if (value.equals) {
                    if (!value.equals(oldProp)) {
                        this.firstFrame();
                    }
                } else {
                    if (oldProp !== value) {
                        this.firstFrame();
                    }
                }
                if (propName === 'aoSamples' && oldProp !== value) {
                    this.configureAOPass(this.configuration.depthBufferType, this.camera.isOrthographicCamera);
                }
                if (propName === 'denoiseSamples' && oldProp !== value) {
                    this.configureDenoisePass(this.configuration.depthBufferType, this.camera.isOrthographicCamera);
                }
                if (propName === 'neuralDenoise' && oldProp !== value) {
                    const reconfigureAO = value && (target.aoSamples !== 16 || target.halfRes);
                    const disableHalfRes = value && target.halfRes;
                    if (value) {
                        target.aoSamples = 16;
                        if (![4, 8, 16].includes(target.denoiseSamples)) {
                            target.denoiseSamples = 8;
                        }
                        target.denoiseRadius = 12;
                        target.denoiseIterations = 2;
                        target.halfRes = false;
                    }
                    if (reconfigureAO) {
                        this.configureAOPass(this.configuration.depthBufferType, this.camera.isOrthographicCamera);
                    }
                    if (disableHalfRes) {
                        this.configureHalfResTargets();
                        this.configureEffectCompositer(this.configuration.depthBufferType, this.camera.isOrthographicCamera);
                        this.setSize(this.width, this.height);
                    }
                    this.configureDenoisePass(this.configuration.depthBufferType, this.camera.isOrthographicCamera);
                }
                if (propName === "halfRes" && oldProp !== value) {
                    this.configureAOPass(this.configuration.depthBufferType, this.camera.isOrthographicCamera);
                    this.configureHalfResTargets();
                    this.configureEffectCompositer(this.configuration.depthBufferType, this.camera.isOrthographicCamera);
                    this.setSize(this.width, this.height);
                }
                if (propName === "depthAwareUpsampling" && oldProp !== value) {
                    this.configureEffectCompositer(this.configuration.depthBufferType, this.camera.isOrthographicCamera);
                }
                if (propName === 'gammaCorrection') {
                    this.autosetGamma = false;
                }
                if (propName === "transparencyAware" && oldProp !== value) {
                    this.autoDetectTransparency = false;
                    this.configureTransparencyTarget();
                }
                return true;
            }
        });
        /** @type {THREE.Vector3[]} */
        this.samples = [];
        /** @type {THREE.Vector2[]} */
        this.samplesDenoise = [];
        this.autoDetectTransparency = true;
        this.frames = 0;
        this.lastViewMatrix = new THREE.Matrix4();
        this.lastProjectionMatrix = new THREE.Matrix4();
        this.configureEffectCompositer(this.configuration.depthBufferType);
        this.configureSampleDependentPasses();
        this.configureHalfResTargets();
        this.detectTransparency();
        this.configureTransparencyTarget();

        //   this.effectCompisterQuad = new FullScreenTriangle(new THREE.ShaderMaterial(EffectCompositer));
        this.copyQuad = new FullScreenTriangle(new THREE.ShaderMaterial({
            uniforms: {
                tDiffuse: {
                    value: null
                }
            },
            depthWrite: false,
            vertexShader: `
            varying vec2 vUv;
            void main() {
                vUv = uv;
                gl_Position = vec4(position, 1);
            }
            `,
            fragmentShader: `
            uniform sampler2D tDiffuse;
            varying vec2 vUv;
            void main() {
                gl_FragColor = texture2D(tDiffuse, vUv);
            }
            `
        }))
        this.writeTargetInternal = new THREE.WebGLRenderTarget(this.width, this.height, {
            minFilter: THREE.LinearFilter,
            magFilter: THREE.LinearFilter,
            depthBuffer: false,
            format: THREE.RGBAFormat
        });
        this.readTargetInternal = new THREE.WebGLRenderTarget(this.width, this.height, {
            minFilter: THREE.LinearFilter,
            magFilter: THREE.LinearFilter,
            depthBuffer: false,
            format: THREE.RGBAFormat
        });
        this.outputTargetInternal = new THREE.WebGLRenderTarget(this.width, this.height, {
            minFilter: THREE.LinearFilter,
            magFilter: THREE.LinearFilter,
            depthBuffer: false
        });
        this.accumulationRenderTarget = new THREE.WebGLRenderTarget(this.width, this.height, {
            minFilter: THREE.LinearFilter,
            magFilter: THREE.LinearFilter,
            depthBuffer: false,
            format: THREE.RGBAFormat,
            type: THREE.HalfFloatType,
            stencilBuffer: false,
            depthBuffer: false,
            alpha: true
        });
        this.accumulationQuad = new FullScreenTriangle(new THREE.ShaderMaterial({
            uniforms: {
                frame: { value: 0 },
                tDiffuse: { value: null }
            },
            transparent: true,
            opacity: 1,
            vertexShader: `
             varying vec2 vUv;
             void main() {
                 vUv = uv;
                 gl_Position = vec4(position, 1);
             }`,
            fragmentShader: `
             uniform sampler2D tDiffuse;
             uniform float frame;
                varying vec2 vUv;
                void main() {
                    vec4 color = texture2D(tDiffuse, vUv);
                    gl_FragColor = vec4(color.rgb, 1.0 / (frame + 1.0));
                }
                `
        }));


        /** @type {THREE.DataTexture} */
        this.bluenoise = //bluenoise;
            new THREE.DataTexture(
                bluenoiseBits,
                128,
                128
            );
        this.bluenoise.colorSpace = THREE.NoColorSpace;
        this.bluenoise.wrapS = THREE.RepeatWrapping;
        this.bluenoise.wrapT = THREE.RepeatWrapping;
        this.bluenoise.minFilter = THREE.NearestFilter;
        this.bluenoise.magFilter = THREE.NearestFilter;
        this.bluenoise.needsUpdate = true;
        this.lastTime = 0;
        this.timeRollingAverage = 0.99;
        this.needsDepthTexture = true;
        this.needsSwap = true;
        this._r = new THREE.Vector2();
        this._c = new THREE.Color();



    }
    configureHalfResTargets() {
        this.firstFrame();

        if (this.configuration.halfRes) {
            this.depthDownsampleTarget = new WebGLMultipleRenderTargetsCompat(
                Math.floor(this.width / 2),
                Math.floor(this.height / 2),
                2
            );

            if (THREE.REVISION <= 161) {
                this.depthDownsampleTarget.textures = this.depthDownsampleTarget.texture;
            }

            this.depthDownsampleTarget.textures[0].format = THREE.RedFormat;
            this.depthDownsampleTarget.textures[0].type = THREE.FloatType;
            this.depthDownsampleTarget.textures[0].minFilter = THREE.NearestFilter;
            this.depthDownsampleTarget.textures[0].magFilter = THREE.NearestFilter;
            this.depthDownsampleTarget.textures[0].depthBuffer = false;
            this.depthDownsampleTarget.textures[1].format = THREE.RGBAFormat;
            this.depthDownsampleTarget.textures[1].type = THREE.HalfFloatType;
            this.depthDownsampleTarget.textures[1].minFilter = THREE.NearestFilter;
            this.depthDownsampleTarget.textures[1].magFilter = THREE.NearestFilter;
            this.depthDownsampleTarget.textures[1].depthBuffer = false;


            this.depthDownsampleQuad = new FullScreenTriangle(new THREE.ShaderMaterial(DepthDownSample));
        } else {
            if (this.depthDownsampleTarget) {
                this.depthDownsampleTarget.dispose();
                this.depthDownsampleTarget = null;
            }
            if (this.depthDownsampleQuad) {
                this.depthDownsampleQuad.dispose();
                this.depthDownsampleQuad = null;
            }
        }
    }
    detectTransparency() {
        if (this.autoDetectTransparency) {
            let isTransparency = false;
            this.scene.traverse((obj) => {
                if (obj.material && obj.material.transparent) {
                    isTransparency = true;
                }
            });
            if (isTransparency) {
                this.configuration.transparencyAware = true;
            }
        }
    }
    configureTransparencyTarget() {
        if (this.configuration.transparencyAware) {
            this.transparencyRenderTargetDWFalse = new THREE.WebGLRenderTarget(this.width, this.height, {
                minFilter: THREE.LinearFilter,
                magFilter: THREE.NearestFilter,
                type: THREE.HalfFloatType,
                format: THREE.RGBAFormat
            });
            this.transparencyRenderTargetDWTrue = new THREE.WebGLRenderTarget(this.width, this.height, {
                minFilter: THREE.LinearFilter,
                magFilter: THREE.NearestFilter,
                type: THREE.HalfFloatType,
                format: THREE.RGBAFormat
            });
            this.transparencyRenderTargetDWTrue.depthTexture = new THREE.DepthTexture(this.width, this.height, THREE.UnsignedIntType);
            this.depthCopyPass = new FullScreenTriangle(new THREE.ShaderMaterial({
                uniforms: {
                    depthTexture: { value: this.depthTexture },
                    reverseDepthBuffer: { value: this.configuration.depthBufferType === DepthType.Reverse },
                },
                vertexShader: /* glsl */ `
            varying vec2 vUv;
            void main() {
                vUv = uv;
                gl_Position = vec4(position, 1);
            }`,
                fragmentShader: /* glsl */ `
            uniform sampler2D depthTexture;
            uniform bool reverseDepthBuffer;
            varying vec2 vUv;
            void main() {
                if (reverseDepthBuffer) {
               float d = 1.0 - texture2D(depthTexture, vUv).r;
           
               d += 0.00001;
               gl_FragDepth = 1.0 - d;
            } else {
                float d = texture2D(depthTexture, vUv).r;
                d += 0.00001;
                gl_FragDepth = d;
            }
               gl_FragColor = vec4(0.0, 0.0, 0.0, 0.0);
            }
            `,

            }));
        } else {
            if (this.transparencyRenderTargetDWFalse) {
                this.transparencyRenderTargetDWFalse.dispose();
                this.transparencyRenderTargetDWFalse = null;
            }
            if (this.transparencyRenderTargetDWTrue) {
                this.transparencyRenderTargetDWTrue.dispose();
                this.transparencyRenderTargetDWTrue = null;
            }
            if (this.depthCopyPass) {
                this.depthCopyPass.dispose();
                this.depthCopyPass = null;
            }
        }
    }
    renderTransparency(renderer) {
        const oldBackground = this.scene.background;
        const oldClearColor = renderer.getClearColor(new THREE.Color());
        const oldClearAlpha = renderer.getClearAlpha();
        const oldVisibility = new Map();
        const oldAutoClearDepth = renderer.autoClearDepth;
        this.scene.traverse((obj) => {
            oldVisibility.set(obj, obj.visible);
        });

        // Override the state
        this.scene.background = null;
        renderer.autoClearDepth = false;
        renderer.setClearColor(new THREE.Color(0, 0, 0), 0);

        this.depthCopyPass.material.uniforms.depthTexture.value = this.depthTexture;
        this.depthCopyPass.material.uniforms.reverseDepthBuffer.value = this.configuration.depthBufferType === DepthType.Reverse;
        // Render out transparent objects WITHOUT depth write
        renderer.setRenderTarget(this.transparencyRenderTargetDWFalse);
        this.scene.traverse((obj) => {
            if (obj.material) {
                obj.visible = oldVisibility.get(obj) && ((obj.material.transparent && !obj.material.depthWrite && !obj.userData.treatAsOpaque) || !!obj.userData.cannotReceiveAO);
            }
        });
        renderer.clear(true, true, true);
        this.depthCopyPass.render(renderer);
        renderer.render(this.scene, this.camera);

        // Render out transparent objects WITH depth write

        renderer.setRenderTarget(this.transparencyRenderTargetDWTrue);
        this.scene.traverse((obj) => {
            if (obj.material) {
                obj.visible = oldVisibility.get(obj) && obj.material.transparent && obj.material.depthWrite && !obj.userData.treatAsOpaque;
            }
        });
        renderer.clear(true, true, true);
        this.depthCopyPass.render(renderer);
        renderer.render(this.scene, this.camera);

        // Restore
        this.scene.traverse((obj) => {
            obj.visible = oldVisibility.get(obj);
        });
        renderer.setClearColor(oldClearColor, oldClearAlpha);
        this.scene.background = oldBackground;
        renderer.autoClearDepth = oldAutoClearDepth;
    }
    configureSampleDependentPasses() {
        this.configureAOPass(this.configuration.depthBufferType, this.camera.isOrthographicCamera);
        this.configureDenoisePass(this.configuration.depthBufferType, this.camera.isOrthographicCamera);
    }
    configureAOPass(depthBufferType = DepthType.Default, ortho = false) {
        this.firstFrame();
        this.samples = this.generateHemisphereSamples(this.configuration.aoSamples);
        const e = {...EffectShader };
        e.fragmentShader = e.fragmentShader.replace("16", this.configuration.aoSamples).replace("16.0", this.configuration.aoSamples + ".0");
        if (depthBufferType === DepthType.Log) {
            e.fragmentShader = "#define LOGDEPTH\n" + e.fragmentShader;
        } else if (depthBufferType === DepthType.Reverse) {
            e.fragmentShader = "#define REVERSEDEPTH\n" + e.fragmentShader;
        }
        if (ortho) {
            e.fragmentShader = "#define ORTHO\n" + e.fragmentShader;
        }
        if (this.configuration.halfRes) {
            e.fragmentShader = "#define HALFRES\n" + e.fragmentShader;
        }
        if (this.effectShaderQuad) {
            this.effectShaderQuad.material.dispose();
            this.effectShaderQuad.material = new THREE.ShaderMaterial(e);
        } else {
            this.effectShaderQuad = new FullScreenTriangle(new THREE.ShaderMaterial(e));
        }
    }
    configureDenoisePass(depthBufferType = DepthType.Default, ortho = false) {
        this.firstFrame();
        this.samplesDenoise = this.generateDenoiseSamples(this.configuration.denoiseSamples, 11);
        const p = {...PoissionBlur };
        p.fragmentShader = p.fragmentShader.replace(
            "__N8AO_DENOISE_SAMPLES__",
            this.configuration.denoiseSamples
        );
        if (depthBufferType === DepthType.Log) {
            p.fragmentShader = "#define LOGDEPTH\n" + p.fragmentShader;
        } else if (depthBufferType === DepthType.Reverse) {
            p.fragmentShader = "#define REVERSEDEPTH\n" + p.fragmentShader;
        }
        if (ortho) {
            p.fragmentShader = "#define ORTHO\n" + p.fragmentShader;
        }
        if (this.standardDenoiseMaterial) {
            this.standardDenoiseMaterial.dispose();
        }
        if (this.neuralDenoiseMaterial) {
            this.neuralDenoiseMaterial.dispose();
        }
        this.standardDenoiseMaterial = new THREE.ShaderMaterial(p);
        this.neuralDenoiseMaterial = this.configuration.neuralDenoise
            && [4, 8, 16].includes(this.configuration.denoiseSamples)
            ? new THREE.ShaderMaterial({
                ...p,
                glslVersion: THREE.GLSL3,
                fragmentShader: "#define NEURAL_DENOISE\n"
                    + "layout(location = 0) out highp vec4 neuralFragColor;\n"
                    + "#define gl_FragColor neuralFragColor\n"
                    + p.fragmentShader
            })
            : null;
        if (this.poissonBlurQuad) {
            this.poissonBlurQuad.material = this.standardDenoiseMaterial;
        } else {
            this.poissonBlurQuad = new FullScreenTriangle(this.standardDenoiseMaterial);
        }
    }
    shouldUseNeuralDenoise() {
        if (!this.configuration.neuralDenoise) {
            this._neuralDenoiseWarningKey = null;
            return false;
        }

        const incompatibilities = [];
        if (this.configuration.aoSamples !== 16) {
            incompatibilities.push(`aoSamples is ${this.configuration.aoSamples} (expected 16)`);
        }
        if (![4, 8, 16].includes(this.configuration.denoiseSamples)) {
            incompatibilities.push(`denoiseSamples is ${this.configuration.denoiseSamples} (expected 4, 8, or 16)`);
        }
        if (this.configuration.denoiseRadius !== 12) {
            incompatibilities.push(`denoiseRadius is ${this.configuration.denoiseRadius} (expected 12)`);
        }
        if (this.configuration.denoiseIterations !== 2) {
            incompatibilities.push(`denoiseIterations is ${this.configuration.denoiseIterations} (expected 2)`);
        }
        if (this.configuration.halfRes) {
            incompatibilities.push('halfRes is enabled (expected full resolution)');
        }

        if (incompatibilities.length > 0) {
            const warningKey = incompatibilities.join('; ');
            if (warningKey !== this._neuralDenoiseWarningKey) {
                console.warn(
                    `[N8AO] neuralDenoise is enabled but cannot run: ${warningKey}. `
                    + 'Neural denoising has been disabled; standard denoising will be used.'
                );
                this._neuralDenoiseWarningKey = warningKey;
            }
            return false;
        }

        this._neuralDenoiseWarningKey = null;
        return this.neuralDenoiseMaterial !== null;
    }
    configureEffectCompositer(depthBufferType = DepthType.Default, ortho = false) {
            this.firstFrame();

            const e = {...EffectCompositer };
            if (depthBufferType === DepthType.Log) {
                e.fragmentShader = "#define LOGDEPTH\n" + e.fragmentShader;
            } else if (depthBufferType === DepthType.Reverse) {
                e.fragmentShader = "#define REVERSEDEPTH\n" + e.fragmentShader;
            }
            if (ortho) {
                e.fragmentShader = "#define ORTHO\n" + e.fragmentShader;
            }
            if (this.configuration.halfRes && this.configuration.depthAwareUpsampling) {
                e.fragmentShader = "#define HALFRES\n" + e.fragmentShader;
            }
            if (this.effectCompositerQuad) {
                this.effectCompositerQuad.material.dispose();
                this.effectCompositerQuad.material = new THREE.ShaderMaterial(e);
            } else {
                this.effectCompositerQuad = new FullScreenTriangle(new THREE.ShaderMaterial(e));
            }
        }
        /**
         * 
         * @param {Number} n 
         * @returns {THREE.Vector3[]}
         */
    generateHemisphereSamples(n) {
            const points = [];
            for (let k = 0; k < n; k++) {
                const theta = 2.399963 * k;
                const r = (Math.sqrt(k + 0.5) / Math.sqrt(n));
                const x = r * Math.cos(theta);
                const y = r * Math.sin(theta);
                // Project to hemisphere
                const z = Math.sqrt(1 - (x * x + y * y));
                points.push(new THREE.Vector3(x, y, z));

            }
            return points;
        }
        /**
         * 
         * @param {number} numSamples 
         * @param {number} numRings 
         * @returns {THREE.Vector2[]}
         */
    generateDenoiseSamples(numSamples, numRings) {
        const angleStep = 2 * Math.PI * numRings / numSamples;
        const invNumSamples = 1.0 / numSamples;
        const radiusStep = invNumSamples;
        const samples = [];
        let radius = invNumSamples;
        let angle = 0;
        for (let i = 0; i < numSamples; i++) {
            samples.push(new THREE.Vector2(Math.cos(angle), Math.sin(angle)).multiplyScalar(Math.pow(radius, 0.75)));
            radius += radiusStep;
            angle += angleStep;
        }
        return samples;
    }
    setSize(width, height) {
        this.firstFrame();
        this.width = Math.floor(width);
        this.height = Math.floor(height);
        const internalWidth = this.configuration.halfRes ? Math.floor(this.width / 2) : this.width;
        const internalHeight = this.configuration.halfRes ? Math.floor(this.height / 2) : this.height;
        this.writeTargetInternal.setSize(internalWidth, internalHeight);
        this.readTargetInternal.setSize(internalWidth, internalHeight);
        this.accumulationRenderTarget.setSize(internalWidth, internalHeight);
        if (this.configuration.halfRes) {
            this.depthDownsampleTarget.setSize(internalWidth, internalHeight);
        }
        if (this.configuration.transparencyAware) {
            this.transparencyRenderTargetDWFalse.setSize(this.width, this.height);
            this.transparencyRenderTargetDWTrue.setSize(this.width, this.height);
        }
        this.outputTargetInternal.setSize(this.width, this.height);
    }
    setDepthTexture(depthTexture) {
        this.depthTexture = depthTexture;
    }
    firstFrame() {
        this.needsFrame = true;
    }
    render(renderer, inputBuffer, outputBuffer) {
            const xrEnabled = renderer.xr.enabled;
            renderer.xr.enabled = false;

            // Copy inputBuffer to outputBuffer
            //renderer.setRenderTarget(outputBuffer);
            //  this.copyQuad.material.uniforms.tDiffuse.value = inputBuffer.texture;
            //   this.copyQuad.render(renderer);

            const rendererUsesReverseDepth = renderer.capabilities.reversedDepthBuffer === true
                || renderer.capabilities.reverseDepthBuffer === true;
            const rendererDepthType = rendererUsesReverseDepth
                ? DepthType.Reverse
                : renderer.capabilities.logarithmicDepthBuffer
                    ? DepthType.Log
                    : DepthType.Default;
            if (this.configuration.depthBufferType !== rendererDepthType) {
                this.configuration.depthBufferType = rendererDepthType;
                this.configureAOPass(this.configuration.depthBufferType, this.camera.isOrthographicCamera);
                this.configureDenoisePass(this.configuration.depthBufferType, this.camera.isOrthographicCamera);
                this.configureEffectCompositer(this.configuration.depthBufferType, this.camera.isOrthographicCamera);
            }
            this.detectTransparency();
            if (inputBuffer.texture.type !== this.outputTargetInternal.texture.type ||
                inputBuffer.texture.format !== this.outputTargetInternal.texture.format
            ) {
                this.outputTargetInternal.texture.type = inputBuffer.texture.type;
                this.outputTargetInternal.texture.format = inputBuffer.texture.format;
                this.outputTargetInternal.texture.needsUpdate = true;
            }
            this.camera.updateMatrixWorld();
            if (this.lastViewMatrix.equals(this.camera.matrixWorldInverse) && this.lastProjectionMatrix.equals(this.camera.projectionMatrix) && this.configuration.accumulate && !this.needsFrame) {
                this.frame++;
            } else {
                if (this.configuration.accumulate) {
                    renderer.setRenderTarget(this.accumulationRenderTarget);
                    renderer.clear(true, true, true);
                }
                this.frame = 0;
                this.needsFrame = false;
            }
            this.lastViewMatrix.copy(this.camera.matrixWorldInverse);
            this.lastProjectionMatrix.copy(this.camera.projectionMatrix);
            let gl;
            let ext;
            let timerQuery;
            if (this.debugMode) {
                gl = renderer.getContext();
                ext = gl.getExtension('EXT_disjoint_timer_query_webgl2');
                if (ext === null) {
                    console.error("EXT_disjoint_timer_query_webgl2 not available, disabling debug mode.");
                    this.debugMode = false;
                }
            }
            if (this.debugMode) {
                timerQuery = gl.createQuery();
                gl.beginQuery(ext.TIME_ELAPSED_EXT, timerQuery);
            }
            if (this.configuration.transparencyAware) {
                this.renderTransparency(renderer);
            }
            this._r.set(this.width, this.height);
            let trueRadius = this.configuration.aoRadius;
            if (this.configuration.halfRes && this.configuration.screenSpaceRadius) {
                trueRadius *= 0.5;
            }
            if (this.frame < 1024 / this.configuration.aoSamples) {
                if (this.configuration.halfRes) {

                    renderer.setRenderTarget(this.depthDownsampleTarget);
                    this.depthDownsampleQuad.material.uniforms.sceneDepth.value = this.depthTexture;
                    this.depthDownsampleQuad.material.uniforms.resolution.value = this._r;
                    this.depthDownsampleQuad.material.uniforms["near"].value = this.camera.near;
                    this.depthDownsampleQuad.material.uniforms["far"].value = this.camera.far;
                    this.depthDownsampleQuad.material.uniforms["projectionMatrixInv"].value = this.camera.projectionMatrixInverse;
                    this.depthDownsampleQuad.material.uniforms["viewMatrixInv"].value = this.camera.matrixWorld;
                    this.depthDownsampleQuad.material.uniforms["logDepth"].value = this.configuration.depthBufferType === DepthType.Log;
                    this.depthDownsampleQuad.material.uniforms["ortho"].value = this.camera.isOrthographicCamera;
                    this.depthDownsampleQuad.render(renderer);
                }
                this.effectShaderQuad.material.uniforms["sceneDiffuse"].value = inputBuffer.texture;
                this.effectShaderQuad.material.uniforms["sceneDepth"].value = this.configuration.halfRes ? this.depthDownsampleTarget.textures[0] : this.depthTexture;
                this.effectShaderQuad.material.uniforms["sceneNormal"].value = this.configuration.halfRes ? this.depthDownsampleTarget.textures[1] : null;
                this.effectShaderQuad.material.uniforms["projMat"].value = this.camera.projectionMatrix;
                this.effectShaderQuad.material.uniforms["viewMat"].value = this.camera.matrixWorldInverse;
                this.effectShaderQuad.material.uniforms["projViewMat"].value = this.camera.projectionMatrix.clone().multiply(this.camera.matrixWorldInverse.clone());
                this.effectShaderQuad.material.uniforms["projectionMatrixInv"].value = this.camera.projectionMatrixInverse;
                this.effectShaderQuad.material.uniforms["viewMatrixInv"].value = this.camera.matrixWorld;
                this.effectShaderQuad.material.uniforms["cameraPos"].value = this.camera.getWorldPosition(new THREE.Vector3());
                this.effectShaderQuad.material.uniforms['biasAdjustment'].value = new THREE.Vector2(this.configuration.biasOffset, this.configuration.biasMultiplier);
                this.effectShaderQuad.material.uniforms['resolution'].value = (this.configuration.halfRes ? this._r.clone().multiplyScalar(1 / 2).floor() : this._r);
                this.effectShaderQuad.material.uniforms['time'].value = performance.now() / 1000;
                this.effectShaderQuad.material.uniforms['samples'].value = this.samples;
                this.effectShaderQuad.material.uniforms['bluenoise'].value = this.bluenoise;
                this.effectShaderQuad.material.uniforms['radius'].value = trueRadius;
                this.effectShaderQuad.material.uniforms['distanceFalloff'].value = this.configuration.distanceFalloff;
                this.effectShaderQuad.material.uniforms["near"].value = this.camera.near;
                this.effectShaderQuad.material.uniforms["far"].value = this.camera.far;
                this.effectShaderQuad.material.uniforms["ortho"].value = this.camera.isOrthographicCamera;
                this.effectShaderQuad.material.uniforms["screenSpaceRadius"].value = this.configuration.screenSpaceRadius;
                this.effectShaderQuad.material.uniforms["frame"].value = this.frame;
                // Start the AO
                renderer.setRenderTarget(this.writeTargetInternal);
                this.effectShaderQuad.render(renderer);
                // End the AO
                // Start the blur
                const useNeuralDenoise = this.shouldUseNeuralDenoise();
                for (let i = 0; i < this.configuration.denoiseIterations; i++) {
                    [this.writeTargetInternal, this.readTargetInternal] = [this.readTargetInternal, this.writeTargetInternal];
                    this.poissonBlurQuad.material = useNeuralDenoise && i === 1
                        ? this.neuralDenoiseMaterial
                        : this.standardDenoiseMaterial;
                    this.poissonBlurQuad.material.uniforms["tDiffuse"].value = this.readTargetInternal.texture;
                    this.poissonBlurQuad.material.uniforms["sceneDepth"].value = this.configuration.halfRes ? this.depthDownsampleTarget.textures[0] : this.depthTexture;
                    this.poissonBlurQuad.material.uniforms["projMat"].value = this.camera.projectionMatrix;
                    this.poissonBlurQuad.material.uniforms["viewMat"].value = this.camera.matrixWorldInverse;
                    this.poissonBlurQuad.material.uniforms["projectionMatrixInv"].value = this.camera.projectionMatrixInverse;
                    this.poissonBlurQuad.material.uniforms["viewMatrixInv"].value = this.camera.matrixWorld;
                    this.poissonBlurQuad.material.uniforms["cameraPos"].value = this.camera.getWorldPosition(new THREE.Vector3());
                    this.poissonBlurQuad.material.uniforms['resolution'].value = (this.configuration.halfRes ? this._r.clone().multiplyScalar(1 / 2).floor() : this._r);
                    this.poissonBlurQuad.material.uniforms['time'].value = performance.now() / 1000;
                    this.poissonBlurQuad.material.uniforms['blueNoise'].value = this.bluenoise;
                    this.poissonBlurQuad.material.uniforms['radius'].value = this.configuration.denoiseRadius * (
                        this.configuration.halfRes ? 1 / 2 : 1
                    );
                    this.poissonBlurQuad.material.uniforms['worldRadius'].value = trueRadius;
                    this.poissonBlurQuad.material.uniforms['distanceFalloff'].value = this.configuration.distanceFalloff;
                    this.poissonBlurQuad.material.uniforms['index'].value = i;
                    this.poissonBlurQuad.material.uniforms['poissonDisk'].value = this.samplesDenoise;
                    this.poissonBlurQuad.material.uniforms["near"].value = this.camera.near;
                    this.poissonBlurQuad.material.uniforms["far"].value = this.camera.far;
                    this.poissonBlurQuad.material.uniforms["screenSpaceRadius"].value = this.configuration.screenSpaceRadius;
                    renderer.setRenderTarget(this.writeTargetInternal);
                    this.poissonBlurQuad.render(renderer);

                }
                renderer.setRenderTarget(this.accumulationRenderTarget);
                const oldAutoClear = renderer.autoClear;
                renderer.autoClear = false;
                this.accumulationQuad.material.uniforms["tDiffuse"].value = this.writeTargetInternal.texture;
                this.accumulationQuad.material.uniforms["frame"].value = this.frame;
                this.accumulationQuad.render(renderer);
                renderer.autoClear = oldAutoClear;
            }
            // Now, we have the blurred AO in writeTargetInternal
            // End the blur
            // Start the composition
            if (this.configuration.transparencyAware) {
                this.effectCompositerQuad.material.uniforms["transparencyDWFalse"].value = this.transparencyRenderTargetDWFalse.texture;
                this.effectCompositerQuad.material.uniforms["transparencyDWTrue"].value = this.transparencyRenderTargetDWTrue.texture;
                this.effectCompositerQuad.material.uniforms["transparencyDWTrueDepth"].value = this.transparencyRenderTargetDWTrue.depthTexture;
                this.effectCompositerQuad.material.uniforms["transparencyAware"].value = true;
            }
            this.effectCompositerQuad.material.uniforms["sceneDiffuse"].value = inputBuffer.texture;
            this.effectCompositerQuad.material.uniforms["sceneDepth"].value = this.depthTexture;
            this.effectCompositerQuad.material.uniforms["aoTones"].value = this.configuration.aoTones;
            this.effectCompositerQuad.material.uniforms["near"].value = this.camera.near;
            this.effectCompositerQuad.material.uniforms["far"].value = this.camera.far;
            this.effectCompositerQuad.material.uniforms["projectionMatrixInv"].value = this.camera.projectionMatrixInverse;
            this.effectCompositerQuad.material.uniforms["ortho"].value = this.camera.isOrthographicCamera;
            this.effectCompositerQuad.material.uniforms["downsampledDepth"].value = this.configuration.halfRes ? this.depthDownsampleTarget.textures[0] : this.depthTexture;
            this.effectCompositerQuad.material.uniforms["resolution"].value = this._r;
            this.effectCompositerQuad.material.uniforms["blueNoise"].value = this.bluenoise;
            this.effectCompositerQuad.material.uniforms["intensity"].value = this.configuration.intensity;
            this.effectCompositerQuad.material.uniforms["renderMode"].value = this.configuration.renderMode;
            this.effectCompositerQuad.material.uniforms["screenSpaceRadius"].value = this.configuration.screenSpaceRadius;
            this.effectCompositerQuad.material.uniforms['radius'].value = trueRadius;
            this.effectCompositerQuad.material.uniforms['distanceFalloff'].value = this.configuration.distanceFalloff;
            this.effectCompositerQuad.material.uniforms["gammaCorrection"].value = this.autosetGamma ?
                this.renderToScreen :
                this.configuration.gammaCorrection;
            this.effectCompositerQuad.material.uniforms["tDiffuse"].value = this.accumulationRenderTarget.texture;
            this.effectCompositerQuad.material.uniforms["color"].value =
                this._c.copy(
                    this.configuration.color
                ).convertSRGBToLinear();
            this.effectCompositerQuad.material.uniforms["colorMultiply"].value = this.configuration.colorMultiply;
            this.effectCompositerQuad.material.uniforms["fog"].value = !!this.scene.fog;
            if (this.scene.fog) {
                if (
                    this.scene.fog.isFog
                ) {
                    this.effectCompositerQuad.material.uniforms["fogExp"].value = false;
                    this.effectCompositerQuad.material.uniforms["fogNear"].value = this.scene.fog.near;
                    this.effectCompositerQuad.material.uniforms["fogFar"].value = this.scene.fog.far;
                } else if (
                    this.scene.fog.isFogExp2
                ) {
                    this.effectCompositerQuad.material.uniforms["fogExp"].value = true;
                    this.effectCompositerQuad.material.uniforms["fogDensity"].value = this.scene.fog.density;
                } else {
                    console.error(`Unsupported fog type ${this.scene.fog.constructor.name} in SSAOPass.`);
                }


            }
            renderer.setRenderTarget(
                /* this.renderToScreen ? null :
                 outputBuffer*/
                this.outputTargetInternal
            );
            this.effectCompositerQuad.render(renderer);
            renderer.setRenderTarget(
                this.renderToScreen ? null :
                outputBuffer
            );
            this.copyQuad.material.uniforms["tDiffuse"].value = this.outputTargetInternal.texture;
            this.copyQuad.render(renderer);
            if (this.debugMode) {
                gl.endQuery(ext.TIME_ELAPSED_EXT);
                checkTimerQuery(timerQuery, gl, this);
            }

            renderer.xr.enabled = xrEnabled;
        }
        /**
         * Enables the debug mode of the AO, meaning the lastTime value will be updated.
         */
    enableDebugMode() {
            this.debugMode = true;
        }
        /**
         * Disables the debug mode of the AO, meaning the lastTime value will not be updated.
         */
    disableDebugMode() {
            this.debugMode = false;
        }
        /**
         * Sets the display mode of the AO
         * @param {"Combined" | "AO" | "No AO" | "Split" | "Split AO"} mode - The display mode. 
         */
    setDisplayMode(mode) {
            this.configuration.renderMode = ["Combined", "AO", "No AO", "Split", "Split AO"].indexOf(mode);
        }
        /**
         * 
         * @param {"Performance" | "Low" | "Medium" | "High" | "Ultra" | "Neural-Low" | "Neural-Medium" | "Neural-High"} mode
         */
    setQualityMode(mode) {
        if (mode === "Performance") {
            this.configuration.neuralDenoise = false;
            this.configuration.aoSamples = 8;
            this.configuration.denoiseSamples = 4;
            this.configuration.denoiseRadius = 12;
        } else if (mode === "Low") {
            this.configuration.neuralDenoise = false;
            this.configuration.aoSamples = 16;
            this.configuration.denoiseSamples = 4;
            this.configuration.denoiseRadius = 12;
        } else if (mode === "Medium") {
            this.configuration.neuralDenoise = false;
            this.configuration.aoSamples = 16;
            this.configuration.denoiseSamples = 8;
            this.configuration.denoiseRadius = 12;
        } else if (mode === "High") {
            this.configuration.neuralDenoise = false;
            this.configuration.aoSamples = 64;
            this.configuration.denoiseSamples = 8;
            this.configuration.denoiseRadius = 6;
        } else if (mode === "Ultra") {
            this.configuration.neuralDenoise = false;
            this.configuration.aoSamples = 64;
            this.configuration.denoiseSamples = 16;
            this.configuration.denoiseRadius = 6;
        } else if (["Neural-Low", "Neural-Medium", "Neural-High"].includes(mode)) {
            this.configuration.aoSamples = 16;
            this.configuration.denoiseSamples = {
                "Neural-Low": 4,
                "Neural-Medium": 8,
                "Neural-High": 16
            }[mode];
            this.configuration.denoiseRadius = 12;
            this.configuration.denoiseIterations = 2;
            this.configuration.halfRes = false;
            this.configuration.neuralDenoise = true;
        }

    }
}
export { N8AOPostPass };

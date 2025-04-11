// @flow
import * as React from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

export type Resource3DPreviewState = {|
  getResourcePreview: (resourceUrl: string) => Promise<?string>,
|};

const initialResource3DPreviewState = {
  getResourcePreview: async (_resourceUrl: string) => null,
};

const Resource3DPreviewContext = React.createContext<Resource3DPreviewState>(
  initialResource3DPreviewState
);

export default Resource3DPreviewContext;

const SingleCanvasRenderer = ({
  resourceUrl,
  onPreviewReady,
}: {
  resourceUrl: string,
  onPreviewReady: (resourceUrl: string, dataUrl: string) => void,
}) => {
  const containerRef = React.useRef();

  React.useEffect(
    () => {
      console.log('effect triggered');
      const container = containerRef.current;
      if (!container) return;

      const width = 256;
      const height = 256;

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
      camera.position.set(2, 2, 4);

      const renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
      });
      renderer.setSize(width, height);
      renderer.setPixelRatio(window.devicePixelRatio);
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.0;

      const ambientLight = new THREE.AmbientLight(0xffffff, 1);
      const hemiLight = new THREE.HemisphereLight(0xffffff, 0x888888, 3);
      const mainLight = new THREE.DirectionalLight(0xffffff, 3);
      hemiLight.position.set(0, 20, 0);
      mainLight.position.set(5, 10, 7.5);
      scene.add(ambientLight, hemiLight, mainLight);

      const loader = new GLTFLoader();
      let model = null;

      loader.load(
        resourceUrl,
        gltf => {
          console.log('Loaded 3D model:', resourceUrl);
          model = gltf.scene;

          const box = new THREE.Box3().setFromObject(model);
          const size = new THREE.Vector3();
          const center = new THREE.Vector3();
          box.getSize(size);
          box.getCenter(center);

          const maxDim = Math.max(size.x, size.y, size.z);
          const scale = 2 / maxDim;
          model.scale.set(scale, scale, scale);
          model.position.sub(center);

          scene.add(model);
          camera.lookAt(new THREE.Vector3(0, 0, 0));

          renderer.render(scene, camera);

          const screenshot = renderer.domElement.toDataURL();
          onPreviewReady(resourceUrl, screenshot);
        },
        undefined,
        error => {
          console.error('Failed to load 3D model:', error);
          onPreviewReady(resourceUrl, 'JsPlatform/Extensions/3d_model.svg');
        }
      );

      return () => {
        // Ensure the renderer is removed when the canvas is unmounted.
        renderer.dispose();
      };
    },
    [resourceUrl, onPreviewReady]
  );

  return (
    // This component is here just to create a canvas and render the 3D model.
    // The canvas is not visible to the user.
    <div
      ref={containerRef}
      style={{
        position: 'absolute',
        width: 256,
        height: 256,
        overflow: 'hidden',
        pointerEvents: 'none',
        opacity: 0,
      }}
    />
  );
};

type Props = {|
  children: React.Node,
|};

export const Resource3DPreviewProvider = ({ children }: Props) => {
  const [currentResource, setCurrentResource] = React.useState<?string>(null);
  const [isCanvasVisible, setCanvasVisible] = React.useState<boolean>(false);
  const queueRef = React.useRef<
    Array<{ url: string, resolve: (dataUrl: ?string) => void }>
  >([]);
  const previewCache = React.useRef<{ [url: string]: string }>({});
  const timeoutRef = React.useRef<?TimeoutID>(null);

  React.useEffect(() => {
    // Ensure we clear everything when the component is unmounted.
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
      queueRef.current = [];
      previewCache.current = {};
    };
  }, []);

  const enqueueResource = (url: string): Promise<?string> => {
    return new Promise(resolve => {
      // If it's already in the cache, resolve immediately.
      if (previewCache.current[url]) {
        resolve(previewCache.current[url]);
        return;
      }

      console.log(queueRef.current);
      // Otherwise, add to the queue.
      queueRef.current.push({ url, resolve });
      console.log(queueRef.current);
      // And start processing the queue if it was empty.
      processQueue();
    });
  };

  const processQueue = React.useCallback(
    () => {
      console.log('Processing queue:', currentResource, queueRef.current);
      // If there's already a resource being processed, do nothing,
      // it will be processed when it's done.
      if (currentResource || queueRef.current.length === 0) return;

      const { url } = queueRef.current[0];
      // Clear the timeout if it exists. (in case it just finished processing)
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
      setCurrentResource(url);
      setCanvasVisible(true);
    },
    [currentResource]
  );

  // Called when a preview is generated.
  // - Resolves the promise with the data URL.
  // - Caches the data URL.
  // - Starts the next preview in the queue. (or hide the canvas if empty)
  const handlePreviewGenerated = React.useCallback(
    (url: string, dataUrl: string) => {
      console.log('Preview generated:', url, dataUrl);
      const { resolve } = queueRef.current.shift() || {};
      if (resolve) resolve(dataUrl);

      previewCache.current[url] = dataUrl;
      setCurrentResource(null);
      queueRef.current = queueRef.current.filter(item => item.url !== url);

      console.log('queue', queueRef.current);

      if (!!queueRef.current.length) {
        // Small delay between previews.
        setTimeout(
          () =>
            processQueue({
              // todo: resourceUrl: queueRef.current[0].url,?
            }),
          50
        );
      } else {
        // Auto-hide after 2s if no new resources.
        timeoutRef.current = setTimeout(() => setCanvasVisible(false), 2000);
      }
    },
    [processQueue]
  );

  return (
    <Resource3DPreviewContext.Provider
      value={{ getResourcePreview: enqueueResource }}
    >
      {children}
      {isCanvasVisible && currentResource && (
        <SingleCanvasRenderer
          resourceUrl={currentResource}
          onPreviewReady={handlePreviewGenerated}
        />
      )}
    </Resource3DPreviewContext.Provider>
  );
};

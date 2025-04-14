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
          model = gltf.scene;

          const box = new THREE.Box3().setFromObject(model);
          const size = new THREE.Vector3();
          const center = new THREE.Vector3();
          box.getSize(size);
          box.getCenter(center);

          const sphere = new THREE.Sphere();
          box.getBoundingSphere(sphere);

          const scale = 1 / sphere.radius;
          model.scale.set(scale, scale, scale);

          // Center horizontally
          model.position.x -= center.x * scale;
          model.position.z -= center.z * scale;

          // Slight upward shift so base isn't too low
          model.position.y -= (center.y - size.y / 2) * scale;

          scene.add(model);

          // Aim camera slightly above center
          camera.lookAt(0, 0.75, 0);

          requestAnimationFrame(() => {
            renderer.render(scene, camera);
            const screenshot = renderer.domElement.toDataURL();
            onPreviewReady(resourceUrl, screenshot);
          });
        },
        undefined,
        error => {
          console.error('Failed to load 3D model:', error);
          onPreviewReady(resourceUrl, 'JsPlatform/Extensions/3d_model.svg');
        }
      );

      return () => {
        renderer.dispose();
      };
    },
    [resourceUrl, onPreviewReady]
  );

  return (
    // This component is here just to create a canvas and render the 3D model.
    // The canvas is not visible to the user.
    <div
      id="preview-3d-canvas"
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

  const enqueueResource = React.useCallback((url: string): Promise<?string> => {
    return new Promise(resolve => {
      // If it's already in the cache, resolve immediately.
      if (previewCache.current[url]) {
        resolve(previewCache.current[url]);
        return;
      }

      // Clear the timeout if it exists. (in case it just finished processing)
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = null;

      // Add the item to the queue.
      queueRef.current.push({ url, resolve });
      // If the queue didn't have items before,
      // then process it immediatelly.
      // Otherwise, let the queue process handle it.
      if (queueRef.current.length === 1) {
        setCurrentResource(url);
      }
    });
  }, []);

  // Called when a preview is generated.
  // - Resolves the promise with the data URL.
  // - Caches the data URL.
  // - Starts the next preview in the queue. (or hide the canvas if empty)
  const handlePreviewGenerated = React.useCallback(
    (url: string, dataUrl: string) => {
      // Save it in the cache for future use.
      previewCache.current[url] = dataUrl;
      // Resolve all the requests made for that URL.
      const queueItemsToResolve = queueRef.current.filter(
        item => item.url === url
      );
      queueItemsToResolve.forEach(item => {
        const { resolve } = item;
        if (resolve) resolve(dataUrl);
      });

      // Remove the items from the queue.
      queueRef.current = queueRef.current.filter(item => item.url !== url);

      // And trigger the next item to be processed.
      const nextItemToProcess = queueRef.current[0];
      if (nextItemToProcess) {
        setCurrentResource(nextItemToProcess.url);
      } else {
        // Auto-hide after 2s if no new resources.
        timeoutRef.current = setTimeout(() => setCurrentResource(null), 2000);
      }
    },
    []
  );

  return (
    <Resource3DPreviewContext.Provider
      value={{ getResourcePreview: enqueueResource }}
    >
      {children}
      {currentResource && (
        <SingleCanvasRenderer
          resourceUrl={currentResource}
          onPreviewReady={handlePreviewGenerated}
        />
      )}
    </Resource3DPreviewContext.Provider>
  );
};

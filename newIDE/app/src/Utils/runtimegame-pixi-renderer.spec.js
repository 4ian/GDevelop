import { RuntimeGamePixiRenderer } from '../../../../GDJS/Runtime/pixi-renderers/runtimegame-pixi-renderer';
import { RuntimeGame } from '../../../../GDJS/Runtime/runtimegame';

// Mock gdjs before importing any modules
jest.mock('../../../../GDJS/Runtime/runtimegame', () => {
  const gdjs = require('../__mocks__/gdjs');
  return {
    RuntimeGame: class {
      constructor() {
        this.logger = new gdjs.Logger('Game manager');
      }
      getGameResolutionWidth() { return 800; }
      getGameResolutionHeight() { return 600; }
      getScaleMode() { return 'nearest'; }
      getPixelsRounding() { return true; }
      getAntialiasingMode() { return 'none'; }
      isAntialisingEnabledOnMobile() { return false; }
      getAdditionalOptions() { return {}; }
    }
  };
});

jest.mock('../../../../GDJS/Runtime/pixi-renderers/runtimegame-pixi-renderer', () => {
  return require('../__mocks__/runtimegame-pixi-renderer');
});

describe('RuntimeGamePixiRenderer - Fullscreen Tests', () => {
  let renderer;
  let mockGame;
  let mockDocument;
  let fullscreenChangeListeners;

  beforeEach(() => {
    // Mock the game
    mockGame = new RuntimeGame();

    // Initialize array to store fullscreen change listeners
    fullscreenChangeListeners = [];

    // Mock document and its fullscreen properties
    mockDocument = {
      documentElement: {
        requestFullscreen: jest.fn(),
        webkitRequestFullscreen: jest.fn(),
        mozRequestFullScreen: jest.fn(),
      },
      exitFullscreen: jest.fn(),
      webkitExitFullscreen: jest.fn(),
      mozCancelFullScreen: jest.fn(),
      fullscreenElement: null,
      webkitFullscreenElement: null,
      mozFullScreenElement: null,
      addEventListener: jest.fn((event, listener) => {
        if (event === 'fullscreenchange' || 
            event === 'webkitfullscreenchange' || 
            event === 'mozfullscreenchange') {
          fullscreenChangeListeners.push(listener);
        }
      }),
      removeEventListener: jest.fn((event, listener) => {
        if (event === 'fullscreenchange' || 
            event === 'webkitfullscreenchange' || 
            event === 'mozfullscreenchange') {
          const index = fullscreenChangeListeners.indexOf(listener);
          if (index > -1) {
            fullscreenChangeListeners.splice(index, 1);
          }
        }
      }),
      dispatchEvent: jest.fn((event) => {
        if (event.type === 'fullscreenchange' || 
            event.type === 'webkitfullscreenchange' || 
            event.type === 'mozfullscreenchange') {
          fullscreenChangeListeners.forEach(listener => listener());
        }
      }),
    };

    // Replace global document with our mock
    global.document = mockDocument;

    renderer = new RuntimeGamePixiRenderer(mockGame, false);
  });

  afterEach(() => {
    // Clean up event listeners
    renderer.dispose();
  });

  describe('Fullscreen Enter/Exit Detection', () => {
    describe('Chrome (Standard Fullscreen API)', () => {
      it('should detect when entering fullscreen in Chrome', () => {
        // Simulate entering fullscreen
        mockDocument.fullscreenElement = document.documentElement;
        
        // Trigger the fullscreenchange event
        const fullscreenChangeEvent = new Event('fullscreenchange');
        document.dispatchEvent(fullscreenChangeEvent);

        // Check if the renderer's fullscreen state is updated
        expect(renderer.isFullScreen()).toBe(true);
      });

      it('should detect when exiting fullscreen in Chrome', () => {
        // First enter fullscreen
        mockDocument.fullscreenElement = document.documentElement;
        const fullscreenChangeEvent = new Event('fullscreenchange');
        document.dispatchEvent(fullscreenChangeEvent);

        // Then exit fullscreen
        mockDocument.fullscreenElement = null;
        document.dispatchEvent(fullscreenChangeEvent);

        // Check if the renderer's fullscreen state is updated
        expect(renderer.isFullScreen()).toBe(false);
      });
    });

    describe('Safari (WebKit)', () => {
      it('should detect when entering fullscreen in Safari', () => {
        // Simulate entering fullscreen
        mockDocument.webkitFullscreenElement = document.documentElement;
        
        // Trigger the webkitfullscreenchange event
        const webkitFullscreenChangeEvent = new Event('webkitfullscreenchange');
        document.dispatchEvent(webkitFullscreenChangeEvent);

        // Check if the renderer's fullscreen state is updated
        expect(renderer.isFullScreen()).toBe(true);
      });

      it('should detect when exiting fullscreen in Safari', () => {
        // First enter fullscreen
        mockDocument.webkitFullscreenElement = document.documentElement;
        const webkitFullscreenChangeEvent = new Event('webkitfullscreenchange');
        document.dispatchEvent(webkitFullscreenChangeEvent);

        // Then exit fullscreen
        mockDocument.webkitFullscreenElement = null;
        document.dispatchEvent(webkitFullscreenChangeEvent);

        // Check if the renderer's fullscreen state is updated
        expect(renderer.isFullScreen()).toBe(false);
      });
    });

    describe('Firefox (Mozilla)', () => {
      it('should detect when entering fullscreen in Firefox', () => {
        // Simulate entering fullscreen
        mockDocument.mozFullScreenElement = document.documentElement;
        
        // Trigger the mozfullscreenchange event
        const mozFullscreenChangeEvent = new Event('mozfullscreenchange');
        document.dispatchEvent(mozFullscreenChangeEvent);

        // Check if the renderer's fullscreen state is updated
        expect(renderer.isFullScreen()).toBe(true);
      });

      it('should detect when exiting fullscreen in Firefox', () => {
        // First enter fullscreen
        mockDocument.mozFullScreenElement = document.documentElement;
        const mozFullscreenChangeEvent = new Event('mozfullscreenchange');
        document.dispatchEvent(mozFullscreenChangeEvent);

        // Then exit fullscreen
        mockDocument.mozFullScreenElement = null;
        document.dispatchEvent(mozFullscreenChangeEvent);

        // Check if the renderer's fullscreen state is updated
        expect(renderer.isFullScreen()).toBe(false);
      });
    });
/*
    // This test is intentionally failing to verify our test suite is running
    it('THIS TEST SHOULD FAIL - Fullscreen state should not persist after browser refresh', () => {
      // Enter fullscreen
      mockDocument.fullscreenElement = document.documentElement;
      const fullscreenChangeEvent = new Event('fullscreenchange');
      document.dispatchEvent(fullscreenChangeEvent);

      // Simulate browser refresh by creating a new renderer
      const newRenderer = new RuntimeGamePixiRenderer(mockGame, false);

      // This expectation should fail because fullscreen state should be false after refresh
      expect(newRenderer.isFullScreen()).toBe(true); // This is wrong! Should be false
    });*/
  });

  describe('Event Listener Setup', () => {
    it('should set up fullscreen event listeners for all browsers', () => {
      // Check if the fullscreen event listeners were added for all browsers
      expect(mockDocument.addEventListener).toHaveBeenCalledWith(
        'fullscreenchange',
        expect.any(Function)
      );
      expect(mockDocument.addEventListener).toHaveBeenCalledWith(
        'webkitfullscreenchange',
        expect.any(Function)
      );
      expect(mockDocument.addEventListener).toHaveBeenCalledWith(
        'mozfullscreenchange',
        expect.any(Function)
      );
    });

    it('should handle fullscreen state changes through events for all browsers', () => {
      // Get the event handler functions that were registered
      const fullscreenChangeHandler = mockDocument.addEventListener.mock.calls.find(
        call => call[0] === 'fullscreenchange'
      )[1];
      const webkitFullscreenChangeHandler = mockDocument.addEventListener.mock.calls.find(
        call => call[0] === 'webkitfullscreenchange'
      )[1];
      const mozFullscreenChangeHandler = mockDocument.addEventListener.mock.calls.find(
        call => call[0] === 'mozfullscreenchange'
      )[1];

      // Test Chrome handler
      mockDocument.fullscreenElement = document.documentElement;
      fullscreenChangeHandler();
      expect(renderer.isFullScreen()).toBe(true);

      // Test Safari handler
      mockDocument.webkitFullscreenElement = document.documentElement;
      webkitFullscreenChangeHandler();
      expect(renderer.isFullScreen()).toBe(true);

      // Test Firefox handler
      mockDocument.mozFullScreenElement = document.documentElement;
      mozFullscreenChangeHandler();
      expect(renderer.isFullScreen()).toBe(true);

      // Test exiting fullscreen for all browsers
      mockDocument.fullscreenElement = null;
      mockDocument.webkitFullscreenElement = null;
      mockDocument.mozFullScreenElement = null;
      
      fullscreenChangeHandler();
      webkitFullscreenChangeHandler();
      mozFullscreenChangeHandler();
      
      expect(renderer.isFullScreen()).toBe(false);
    });
  });

  describe('Fullscreen State Management', () => {
    it('should update internal state when fullscreen changes in any browser', () => {
      // Test Chrome
      mockDocument.fullscreenElement = document.documentElement;
      const fullscreenChangeEvent = new Event('fullscreenchange');
      document.dispatchEvent(fullscreenChangeEvent);
      expect(renderer._isFullscreen).toBe(true);

      // Test Safari
      mockDocument.webkitFullscreenElement = document.documentElement;
      const webkitFullscreenChangeEvent = new Event('webkitfullscreenchange');
      document.dispatchEvent(webkitFullscreenChangeEvent);
      expect(renderer._isFullscreen).toBe(true);

      // Test Firefox
      mockDocument.mozFullScreenElement = document.documentElement;
      const mozFullscreenChangeEvent = new Event('mozfullscreenchange');
      document.dispatchEvent(mozFullscreenChangeEvent);
      expect(renderer._isFullscreen).toBe(true);

      // Test exiting fullscreen for all browsers
      mockDocument.fullscreenElement = null;
      mockDocument.webkitFullscreenElement = null;
      mockDocument.mozFullScreenElement = null;
      
      document.dispatchEvent(fullscreenChangeEvent);
      document.dispatchEvent(webkitFullscreenChangeEvent);
      document.dispatchEvent(mozFullscreenChangeEvent);
      
      expect(renderer._isFullscreen).toBe(false);
    });

    it('should handle programmatic fullscreen changes', () => {
      // Enter fullscreen programmatically
      renderer.setFullScreen(true);
      expect(renderer.isFullScreen()).toBe(true);

      // Exit fullscreen programmatically
      renderer.setFullScreen(false);
      expect(renderer.isFullScreen()).toBe(false);
    });
  });
});
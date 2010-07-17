//
//  Box2DView.h
//  Box2D OpenGL View
//
//  Box2D iPhone port by Simon Oliver - http://www.simonoliver.com - http://www.handcircus.com
//


#import <UIKit/UIKit.h>
#import <OpenGLES/EAGL.h>
#import <OpenGLES/ES1/gl.h>
#import <OpenGLES/ES1/glext.h>

#import "iPhoneTest.h"
#import "Delegates.h"

/*
This class wraps the CAEAGLLayer from CoreAnimation into a convenient UIView subclass.
The view content is basically an EAGL surface you render your OpenGL scene into.
Note that setting the view non-opaque will only work if the EAGL surface has an alpha channel.
*/
@interface Box2DView : UIView <UIAccelerometerDelegate> {
    
@private
    /* The pixel dimensions of the backbuffer */
    GLint backingWidth;
    GLint backingHeight;
    
    EAGLContext *context;
    
    /* OpenGL names for the renderbuffer and framebuffers used to render to this view */
    GLuint viewRenderbuffer, viewFramebuffer;
    
    /* OpenGL name for the depth buffer that is attached to viewFramebuffer, if it exists (0 if it does not exist) */
    GLuint depthRenderbuffer;
    
    NSTimer *animationTimer;
    NSTimeInterval animationInterval;
	
	TestEntry* entry;
	Test* test;

	// Position offset and scale
	float sceneScale;
	CGPoint positionOffset;
	CGPoint lastWorldTouch;
	CGPoint lastScreenTouch;
	
	bool panning;
	int doubleClickValidCountdown;
	
	id<TestSelectDelegate> _delegate;
	
}
@property(assign) id<TestSelectDelegate> delegate;
@property NSTimeInterval animationInterval;

- (void)startAnimation;
- (void)stopAnimation;
- (void)drawView;
-(void) selectTestEntry:(int) testIndex;

@end

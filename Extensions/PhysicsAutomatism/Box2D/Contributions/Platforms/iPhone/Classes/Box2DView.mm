//
//  Box2DView.mm
//  Box2D OpenGL View
//
//  Box2D iPhone port by Simon Oliver - http://www.simonoliver.com - http://www.handcircus.com
//

#import <QuartzCore/QuartzCore.h>
#import <OpenGLES/EAGLDrawable.h>

#import "Box2DView.h"

#define USE_DEPTH_BUFFER 0
#define kAccelerometerFrequency 30
#define FRAMES_BETWEEN_PRESSES_FOR_DOUBLE_CLICK 10

Settings settings;

// A class extension to declare private methods
@interface Box2DView ()

@property (nonatomic, retain) EAGLContext *context;
@property (nonatomic, assign) NSTimer *animationTimer;

- (BOOL) createFramebuffer;
- (void) destroyFramebuffer;

@end


@implementation Box2DView

@synthesize context;
@synthesize animationTimer;
@synthesize animationInterval;
@synthesize delegate=_delegate;

// You must implement this method
+ (Class)layerClass {
    return [CAEAGLLayer class];
}


//The GL view is stored in the nib file. When it's unarchived it's sent -initWithCoder:
- (id)initWithCoder:(NSCoder*)coder {
    
    if ((self = [super initWithCoder:coder])) {
        // Get the layer
        CAEAGLLayer *eaglLayer = (CAEAGLLayer *)self.layer;
        
        eaglLayer.opaque = YES;
        eaglLayer.drawableProperties = [NSDictionary dictionaryWithObjectsAndKeys:
                                        [NSNumber numberWithBool:NO], kEAGLDrawablePropertyRetainedBacking, kEAGLColorFormatRGBA8, kEAGLDrawablePropertyColorFormat, nil];
        
        context = [[EAGLContext alloc] initWithAPI:kEAGLRenderingAPIOpenGLES1];
        
        if (!context || ![EAGLContext setCurrentContext:context]) {
            [self release];
            return nil;
        }
        
        animationInterval = 1.0 / 60.0;
		sceneScale=10.0f;
		positionOffset=CGPointMake(0, 0);
		lastWorldTouch=CGPointMake(0, 0);
		
		[[UIAccelerometer sharedAccelerometer] setUpdateInterval:(1.0 / kAccelerometerFrequency)];
		[[UIAccelerometer sharedAccelerometer] setDelegate:self];
    }
	
	
    return self;
}

-(void) selectTestEntry:(int) testIndex
{
	// Destroy existing scene
	delete test;
	
	entry = g_testEntries + testIndex;
	test = entry->createFcn();
	
	doubleClickValidCountdown=0;
	
	sceneScale=10.0f;
	positionOffset=CGPointMake(0, 0);
	lastWorldTouch=CGPointMake(0, 0);
}



- (void)drawView {
    

	
	if (doubleClickValidCountdown>0) doubleClickValidCountdown--;
	
    [EAGLContext setCurrentContext:context];
    
    glBindFramebufferOES(GL_FRAMEBUFFER_OES, viewFramebuffer);
    glViewport(0, 0, backingWidth, backingHeight);
    
    glMatrixMode(GL_PROJECTION);
    glLoadIdentity();
	
	glOrthof(-sceneScale, sceneScale, -sceneScale*1.5f, sceneScale*1.5f, -1.0f, 1.0f);
	
    glMatrixMode(GL_MODELVIEW);
    glLoadIdentity();
	glTranslatef(positionOffset.x, positionOffset.y,0);
    glClearColor(0.0f, 0.0f, 0.0f, 1.0f);
    glClear(GL_COLOR_BUFFER_BIT);
    
	glEnable(GL_BLEND);
	glBlendFunc(GL_SRC_ALPHA, GL_ONE_MINUS_SRC_ALPHA);
	
    glEnableClientState(GL_VERTEX_ARRAY);

	test->Step(&settings);
	
	glBindRenderbufferOES(GL_RENDERBUFFER_OES, viewRenderbuffer);
    [context presentRenderbuffer:GL_RENDERBUFFER_OES];
}


- (void)layoutSubviews {
    [EAGLContext setCurrentContext:context];
    [self destroyFramebuffer];
    [self createFramebuffer];
    [self drawView];
}


- (BOOL)createFramebuffer {
    
    glGenFramebuffersOES(1, &viewFramebuffer);
    glGenRenderbuffersOES(1, &viewRenderbuffer);
    
    glBindFramebufferOES(GL_FRAMEBUFFER_OES, viewFramebuffer);
    glBindRenderbufferOES(GL_RENDERBUFFER_OES, viewRenderbuffer);
    [context renderbufferStorage:GL_RENDERBUFFER_OES fromDrawable:(CAEAGLLayer*)self.layer];
    glFramebufferRenderbufferOES(GL_FRAMEBUFFER_OES, GL_COLOR_ATTACHMENT0_OES, GL_RENDERBUFFER_OES, viewRenderbuffer);
    
    glGetRenderbufferParameterivOES(GL_RENDERBUFFER_OES, GL_RENDERBUFFER_WIDTH_OES, &backingWidth);
    glGetRenderbufferParameterivOES(GL_RENDERBUFFER_OES, GL_RENDERBUFFER_HEIGHT_OES, &backingHeight);
    
    if (USE_DEPTH_BUFFER) {
        glGenRenderbuffersOES(1, &depthRenderbuffer);
        glBindRenderbufferOES(GL_RENDERBUFFER_OES, depthRenderbuffer);
        glRenderbufferStorageOES(GL_RENDERBUFFER_OES, GL_DEPTH_COMPONENT16_OES, backingWidth, backingHeight);
        glFramebufferRenderbufferOES(GL_FRAMEBUFFER_OES, GL_DEPTH_ATTACHMENT_OES, GL_RENDERBUFFER_OES, depthRenderbuffer);
    }
    
    if(glCheckFramebufferStatusOES(GL_FRAMEBUFFER_OES) != GL_FRAMEBUFFER_COMPLETE_OES) {
        NSLog(@"failed to make complete framebuffer object %x", glCheckFramebufferStatusOES(GL_FRAMEBUFFER_OES));
        return NO;
    }
    
    return YES;
}


- (void)destroyFramebuffer {
    
    glDeleteFramebuffersOES(1, &viewFramebuffer);
    viewFramebuffer = 0;
    glDeleteRenderbuffersOES(1, &viewRenderbuffer);
    viewRenderbuffer = 0;
    
    if(depthRenderbuffer) {
        glDeleteRenderbuffersOES(1, &depthRenderbuffer);
        depthRenderbuffer = 0;
    }
}


- (void)startAnimation {
    self.animationTimer = [NSTimer scheduledTimerWithTimeInterval:animationInterval target:self selector:@selector(drawView) userInfo:nil repeats:YES];
}


- (void)stopAnimation {
    self.animationTimer = nil;
}


- (void)setAnimationTimer:(NSTimer *)newTimer {
    [animationTimer invalidate];
    animationTimer = newTimer;
}


- (void)setAnimationInterval:(NSTimeInterval)interval {
    
    animationInterval = interval;
    if (animationTimer) {
        [self stopAnimation];
        [self startAnimation];
    }
}


- (void)dealloc {
    
    [self stopAnimation];
    
    if ([EAGLContext currentContext] == context) {
        [EAGLContext setCurrentContext:nil];
    }
    
    [context release];  
    [super dealloc];
}

-(CGPoint) screenSpaceToWorldSpace:(CGPoint) screenLocation
{
	screenLocation.x-=160;
	screenLocation.y-=240;
	screenLocation.x/=160;
	screenLocation.y/=160;
	screenLocation.x*=sceneScale;
	screenLocation.y*=-sceneScale;
	
	screenLocation.x-=positionOffset.x;
	screenLocation.y-=positionOffset.y;
	return screenLocation;
}

- (void) touchesBegan:(NSSet*)touches withEvent:(UIEvent*)event
{
	
	if (doubleClickValidCountdown>0)
	{
		[_delegate leaveTest];
		return;
	}
		
	doubleClickValidCountdown=FRAMES_BETWEEN_PRESSES_FOR_DOUBLE_CLICK;	
	
	
	panning=false;
	for (UITouch *touch in touches)
	{
		CGPoint touchLocation=[touch locationInView:self];
		CGPoint worldPosition=[self screenSpaceToWorldSpace:touchLocation];
		//printf("Screen touched %f,%f -> %f,%f\n",touchLocation.x,touchLocation.y,worldPosition.x,worldPosition.y);
		lastScreenTouch=touchLocation;
		lastWorldTouch=worldPosition;
		test->MouseDown(b2Vec2(lastWorldTouch.x,lastWorldTouch.y));
		
		if (!test->m_mouseJoint) panning=true;
	}
}

- (void) touchesMoved:(NSSet*)touches withEvent:(UIEvent*)event
{
	for (UITouch *touch in touches)
	{
		CGPoint touchLocation=[touch locationInView:self];
		CGPoint worldPosition=[self screenSpaceToWorldSpace:touchLocation];
		//printf("Screen touched %f,%f -> %f,%f\n",touchLocation.x,touchLocation.y,worldPosition.x,worldPosition.y);
		
		
		CGPoint screenDistanceMoved=CGPointMake(touchLocation.x-lastScreenTouch.x,touchLocation.y-lastScreenTouch.y);
		if (panning)
		{
			screenDistanceMoved.x/=160;
			screenDistanceMoved.y/=160;
			screenDistanceMoved.x*=sceneScale;
			screenDistanceMoved.y*=-sceneScale;
			positionOffset.x+=screenDistanceMoved.x;
			positionOffset.y+=screenDistanceMoved.y;
		}
		
		lastScreenTouch=touchLocation;
		lastWorldTouch=worldPosition;
		test->MouseMove(b2Vec2(lastWorldTouch.x,lastWorldTouch.y));
		
	}
}
- (void) touchesEnded:(NSSet*)touches withEvent:(UIEvent*)event
{
	test->MouseUp(b2Vec2(lastWorldTouch.x,lastWorldTouch.y));
}

- (void) accelerometer:(UIAccelerometer*)accelerometer didAccelerate:(UIAcceleration*)acceleration
{
	// Only run for valid values
	if (acceleration.y!=0 && acceleration.x!=0)
	{
		if (test) test->SetGravity(acceleration.x,acceleration.y);
	}
}

@end

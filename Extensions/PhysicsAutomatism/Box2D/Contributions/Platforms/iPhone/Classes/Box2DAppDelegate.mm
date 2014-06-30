//
//  Box2DAppDelegate.m
//  Box2D
//
//  Box2D iPhone port by Simon Oliver - http://www.simonoliver.com - http://www.handcircus.com
//

#import <UIKit/UIKit.h>
#import "Box2DAppDelegate.h"
#import "Box2DView.h"

@implementation Box2DAppDelegate

@synthesize window;
@synthesize glView;

- (void)applicationDidFinishLaunching:(UIApplication *)application {
    [application setStatusBarHidden:true];
	
	[glView removeFromSuperview];
	
	glView.animationInterval = 1.0 / 60.0;
	
	testEntriesView=[[TestEntriesViewController alloc] initWithStyle:UITableViewStylePlain];
	[testEntriesView setDelegate:self];
	[glView setDelegate:self];
	
	[window addSubview:[testEntriesView view]];
}

-(void) selectTest:(int) testIndex
{
	[[testEntriesView view] removeFromSuperview];
	[window addSubview:glView];
	[glView startAnimation];
	[glView selectTestEntry:testIndex];
}

-(void) leaveTest
{
	[glView stopAnimation];
	[glView removeFromSuperview];
	[window addSubview:[testEntriesView view]];
}

- (void)applicationWillResignActive:(UIApplication *)application {
	glView.animationInterval = 1.0 / 5.0;
}


- (void)applicationDidBecomeActive:(UIApplication *)application {
	glView.animationInterval = 1.0 / 60.0;
}


- (void)dealloc {
	[window release];
	[glView release];
	[super dealloc];
}

@end

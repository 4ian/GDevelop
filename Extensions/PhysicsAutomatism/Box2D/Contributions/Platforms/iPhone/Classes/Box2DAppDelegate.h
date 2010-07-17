//
//  Box2DAppDelegate.h
//  Box2D
//
//  Box2D iPhone port by Simon Oliver - http://www.simonoliver.com - http://www.handcircus.com
//

#import <UIKit/UIKit.h>
#import "TestEntriesViewController.h"
#import "Delegates.h"

@class Box2DView;

@interface Box2DAppDelegate : NSObject <UIApplicationDelegate,TestSelectDelegate> {
    UIWindow *window;
    Box2DView *glView;
	TestEntriesViewController *testEntriesView;
}

@property (nonatomic, retain) IBOutlet UIWindow *window;
@property (nonatomic, retain) IBOutlet Box2DView *glView;

@end


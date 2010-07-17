//
//  TestEntriesViewController.h
//  Box2D
//
//  Box2D iPhone port by Simon Oliver - http://www.simonoliver.com - http://www.handcircus.com
//

#import <UIKit/UIKit.h>
#import "iPhoneTest.h"
#import "Delegates.h"

@interface TestEntriesViewController : UITableViewController {
	int32 testCount;
	id<TestSelectDelegate> _delegate;
}

@property(assign) id<TestSelectDelegate> delegate;

@end

/*
 *  Delegates.h
 *  Box2D
 *
 *  Box2D iPhone port by Simon Oliver - http://www.simonoliver.com - http://www.handcircus.com
 *
 *
 */

@protocol TestSelectDelegate <NSObject>
	-(void) selectTest:(int) testIndex;
	-(void) leaveTest;

@end
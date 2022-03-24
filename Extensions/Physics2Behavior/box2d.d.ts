// TODO: Improve type checking by using proper typings for Box2D.
declare var Box2D: any;

declare interface Box2DBody {
  ApplyAngularImpulse(arg0: any): any;
  ApplyForce(arg0: any, arg1: any): any;
  ApplyLinearImpulse(arg0: any, arg1: any): any;
  ApplyTorque(arg0: any): any;
  CreateFixture(arg0: any): any;
  DestroyFixture(arg0: any): any;
  GetAngle(): any;
  GetAngularVelocity(): any;
  GetContactList(): any;
  GetLinearVelocity(): any;
  GetLocalPoint(arg0: any): any;
  GetPosition(): any;
  GetWorldCenter(): any;
  IsAwake(): any;
  ResetMassData(): any;
  SetAngularDamping(arg0: number): any;
  SetAngularVelocity(arg0: number): any;
  SetAwake(arg0: boolean): any;
  SetBullet(arg0: boolean): any;
  SetFixedRotation(arg0: boolean): any;
  SetGravityScale(arg0: number): any;
  SetLinearDamping(arg0: number): any;
  SetLinearVelocity(arg0: number): any;
  SetSleepingAllowed(arg0: boolean): any;
  SetTransform(arg0: any, arg1: any): any;
  SetType(arg0: any): any;
  GetFixtureList(): any;

  gdjsAssociatedBehavior: gdjs.Physics2RuntimeBehavior;
}

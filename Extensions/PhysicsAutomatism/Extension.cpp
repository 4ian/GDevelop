/**

Game Develop - Physic Automatism Extension
Copyright (c) 2010-2012 Florian Rival (Florian.Rival@gmail.com)

This software is provided 'as-is', without any express or implied
warranty. In no event will the authors be held liable for any damages
arising from the use of this software.

Permission is granted to anyone to use this software for any purpose,
including commercial applications, and to alter it and redistribute it
freely, subject to the following restrictions:

    1. The origin of this software must not be misrepresented; you must not
    claim that you wrote the original software. If you use this software
    in a product, an acknowledgment in the product documentation would be
    appreciated but is not required.

    2. Altered source versions must be plainly marked as such, and must not be
    misrepresented as being the original software.

    3. This notice may not be removed or altered from any source
    distribution.

*/
/**
 * Contributors to the extension:
 * Victor Levasseur ( Collisions using custom polygons, fixed time step fix )
 */

#include "GDL/ExtensionBase.h"
#include "GDL/Version.h"
#include "PhysicsAutomatism.h"
#include "ScenePhysicsDatas.h"
#include <boost/version.hpp>

/**
 * \brief This class declares information about the extension.
 */
class Extension : public ExtensionBase
{
    public:

        /**
         * Constructor of an extension declares everything the extension contains : Objects, actions, conditions and expressions.
         */
        Extension()
        {
            DECLARE_THE_EXTENSION("PhysicsAutomatism",
                                  _("Physics automatism"),
                                  _("Automatism allowing to move objects as if they were subject to the laws of physics."),
                                  "Compil Games",
                                  "zlib/libpng License ( Open Source )")


                DECLARE_AUTOMATISM("PhysicsAutomatism",
                          _("Physics engine"),
                          _("Physics"),
                          _("Automatism allowing to move objects as if they were subject to the laws of physics."),
                          "",
                          "res/physics32.png",
                          PhysicsAutomatism,
                          ScenePhysicsDatas)

                    #if defined(GD_IDE_ONLY)

                    automatismInfo.SetIncludeFile("PhysicsAutomatism/PhysicsAutomatism.h");

                    DECLARE_AUTOMATISM_ACTION("SetStatic",
                                   _("Make the object static"),
                                   _("Make object immovable."),
                                   _("Make _PARAM0_ static"),
                                   _("Movement"),
                                   "res/physics24.png",
                                   "res/physics16.png");

                        instrInfo.AddParameter("object", _("Object"), "", false);
                        instrInfo.AddParameter("automatism", _("Automatism"), "PhysicsAutomatism", false);
                        instrInfo.AddCodeOnlyParameter("currentScene", "");

                        instrInfo.cppCallingInformation.SetFunctionName("SetStatic").SetIncludeFile("PhysicsAutomatism/PhysicsAutomatism.h");

                    DECLARE_END_AUTOMATISM_ACTION()

                    DECLARE_AUTOMATISM_ACTION("SetDynamic",
                                   _("Make the object dynamic"),
                                   _("Make object dynamic ( affected by forces and other objects )."),
                                   _("Make _PARAM0_ dynamic"),
                                   _("Movement"),
                                   "res/physics24.png",
                                   "res/physics16.png");

                        instrInfo.AddParameter("object", _("Object"), "", false);
                        instrInfo.AddParameter("automatism", _("Automatism"), "PhysicsAutomatism", false);
                        instrInfo.AddCodeOnlyParameter("currentScene", "");

                        instrInfo.cppCallingInformation.SetFunctionName("SetDynamic").SetIncludeFile("PhysicsAutomatism/PhysicsAutomatism.h");


                    DECLARE_END_AUTOMATISM_ACTION()

                    DECLARE_AUTOMATISM_CONDITION("IsDynamic",
                                   _("The object is dynamic"),
                                   _("Test if an object is dynamic ( affected by forces and the other objects )."),
                                   _("_PARAM0_ is dynamic"),
                                   _("Movement"),
                                   "res/physics24.png",
                                   "res/physics16.png");

                        instrInfo.AddParameter("object", _("Object"), "", false);
                        instrInfo.AddParameter("automatism", _("Automatism"), "PhysicsAutomatism", false);

                        instrInfo.cppCallingInformation.SetFunctionName("IsDynamic").SetIncludeFile("PhysicsAutomatism/PhysicsAutomatism.h");


                    DECLARE_END_AUTOMATISM_CONDITION()

                    DECLARE_AUTOMATISM_ACTION("SetFixedRotation",
                                   _("Fix rotation"),
                                   _("Prevent the object from rotating"),
                                   _("Fix rotation of _PARAM0_"),
                                   _("Rotation"),
                                   "res/physics24.png",
                                   "res/physics16.png");

                        instrInfo.AddParameter("object", _("Object"), "", false);
                        instrInfo.AddParameter("automatism", _("Automatism"), "PhysicsAutomatism", false);
                        instrInfo.AddCodeOnlyParameter("currentScene", "");

                        instrInfo.cppCallingInformation.SetFunctionName("SetFixedRotation").SetIncludeFile("PhysicsAutomatism/PhysicsAutomatism.h");


                    DECLARE_END_AUTOMATISM_ACTION()

                    DECLARE_AUTOMATISM_ACTION("AddRevoluteJoint",
                                   _("Add a hinge"),
                                   _("Add a hinge about which the object will rotate.\nDistance between hinge and object will remain identical."),
                                   _("Add a hinge to _PARAM0_ at _PARAM2_;_PARAM3_"),
                                   _("Joints"),
                                   "res/physics24.png",
                                   "res/physics16.png");

                        instrInfo.AddParameter("object", _("Object"), "", false);
                        instrInfo.AddParameter("automatism", _("Automatism"), "PhysicsAutomatism", false);
                        instrInfo.AddParameter("expression", _("Hinge X position"), "", false);
                        instrInfo.AddParameter("expression", _("Hinge Y position"), "", false);
                        instrInfo.AddCodeOnlyParameter("currentScene", "");

                        instrInfo.cppCallingInformation.SetFunctionName("AddRevoluteJoint").SetIncludeFile("PhysicsAutomatism/PhysicsAutomatism.h");

                    DECLARE_END_AUTOMATISM_ACTION()

                    DECLARE_AUTOMATISM_ACTION("AddRevoluteJointBetweenObjects",
                                   _("Add a hinge between two objects"),
                                   _("Add a hinge about which the object will rotate."),
                                   _("Add a hinge between _PARAM0_ and _PARAM2_"),
                                   _("Joints"),
                                   "res/physics24.png",
                                   "res/physics16.png");

                        instrInfo.AddParameter("object", _("Object"), "", false);
                        instrInfo.AddParameter("automatism", _("Automatism"), "PhysicsAutomatism", false);
                        instrInfo.AddParameter("object", _("Object"), "", false);
                        instrInfo.AddCodeOnlyParameter("ptrToObjectOfParameter", "2");
                        instrInfo.AddCodeOnlyParameter("currentScene", "");
                        instrInfo.AddParameter("expression", _("X position of the hinge, from the first object mass center"), "", true).SetDefaultValue("0");
                        instrInfo.AddParameter("expression", _("Y position of the hinge, from the first object mass center"), "", true).SetDefaultValue("0");

                        instrInfo.cppCallingInformation.SetFunctionName("AddRevoluteJointBetweenObjects").SetIncludeFile("PhysicsAutomatism/PhysicsAutomatism.h");

                    DECLARE_END_AUTOMATISM_ACTION()

                    DECLARE_AUTOMATISM_ACTION("ActAddGearJointBetweenObjects",
                                   _("Add a gear between two objects"),
                                   _("Add a virtual gear between two objects."),
                                   _("Add a gear between _PARAM0_ and _PARAM2_"),
                                   _("Joints"),
                                   "res/physics24.png",
                                   "res/physics16.png");

                        instrInfo.AddParameter("object", _("Object"), "", false);
                        instrInfo.AddParameter("automatism", _("Automatism"), "PhysicsAutomatism", false);
                        instrInfo.AddParameter("object", _("Object"), "", false);
                        instrInfo.AddParameter("expression", _("Ratio"), "", true).SetDefaultValue("1");
                        instrInfo.AddCodeOnlyParameter("ptrToObjectOfParameter", "2");
                        instrInfo.AddCodeOnlyParameter("currentScene", "");

                        instrInfo.cppCallingInformation.SetFunctionName("AddGearJointBetweenObjects").SetIncludeFile("PhysicsAutomatism/PhysicsAutomatism.h");


                    DECLARE_END_AUTOMATISM_ACTION()

                    DECLARE_AUTOMATISM_ACTION("SetFreeRotation",
                                   _("Make object's rotation free"),
                                   _("Allows object to rotate."),
                                   _("Allow _PARAM0_ to rotate"),
                                   _("Rotation"),
                                   "res/physics24.png",
                                   "res/physics16.png");

                        instrInfo.AddParameter("object", _("Object"), "", false);
                        instrInfo.AddParameter("automatism", _("Automatism"), "PhysicsAutomatism", false);
                        instrInfo.AddCodeOnlyParameter("currentScene", "");

                        instrInfo.cppCallingInformation.SetFunctionName("SetFreeRotation").SetIncludeFile("PhysicsAutomatism/PhysicsAutomatism.h");

                    DECLARE_END_AUTOMATISM_ACTION()

                    DECLARE_AUTOMATISM_CONDITION("IsFixedRotation",
                                   _("Fixed rotation"),
                                   _("Test if object is rotation fixed."),
                                   _("_PARAM0_ is rotation fixed."),
                                   _("Rotation"),
                                   "res/physics24.png",
                                   "res/physics16.png");

                        instrInfo.AddParameter("object", _("Object"), "", false);
                        instrInfo.AddParameter("automatism", _("Automatism"), "PhysicsAutomatism", false);
                        instrInfo.AddCodeOnlyParameter("currentScene", "");

                        instrInfo.cppCallingInformation.SetFunctionName("IsFixedRotation").SetIncludeFile("PhysicsAutomatism/PhysicsAutomatism.h");

                    DECLARE_END_AUTOMATISM_CONDITION()

                    DECLARE_AUTOMATISM_ACTION("SetAsBullet",
                                   _("Consider as a bullet."),
                                   _("Consider the object as a bullet, so as to have better collision handling."),
                                   _("Consider _PARAM0_ as a bullet"),
                                   _("Other"),
                                   "res/physics24.png",
                                   "res/physics16.png");

                        instrInfo.AddParameter("object", _("Object"), "", false);
                        instrInfo.AddParameter("automatism", _("Automatism"), "PhysicsAutomatism", false);
                        instrInfo.AddCodeOnlyParameter("currentScene", "");

                        instrInfo.cppCallingInformation.SetFunctionName("SetAsBullet").SetIncludeFile("PhysicsAutomatism/PhysicsAutomatism.h");

                    DECLARE_END_AUTOMATISM_ACTION()

                    DECLARE_AUTOMATISM_ACTION("DontSetAsBullet",
                                   _("Do not consider as a bullet"),
                                   _("Do not consider object as a bullet, so as to use standard collision handling."),
                                   _("Do not consider _PARAM0_ as a bullet."),
                                   _("Other"),
                                   "res/physics24.png",
                                   "res/physics16.png");

                        instrInfo.AddParameter("object", _("Object"), "", false);
                        instrInfo.AddParameter("automatism", _("Automatism"), "PhysicsAutomatism", false);
                        instrInfo.AddCodeOnlyParameter("currentScene", "");

                        instrInfo.cppCallingInformation.SetFunctionName("DontSetAsBullet").SetIncludeFile("PhysicsAutomatism/PhysicsAutomatism.h");

                    DECLARE_END_AUTOMATISM_ACTION()

                    DECLARE_AUTOMATISM_CONDITION("IsBullet",
                                   _("Object is considered as a bullet"),
                                   _("Test if object is considered as a bullet"),
                                   _("_PARAM0_ is considered as a bullet"),
                                   _("Other"),
                                   "res/physics24.png",
                                   "res/physics16.png");

                        instrInfo.AddParameter("object", _("Object"), "", false);
                        instrInfo.AddParameter("automatism", _("Automatism"), "PhysicsAutomatism", false);
                        instrInfo.AddCodeOnlyParameter("currentScene", "");

                        instrInfo.cppCallingInformation.SetFunctionName("IsBullet").SetIncludeFile("PhysicsAutomatism/PhysicsAutomatism.h");

                    DECLARE_END_AUTOMATISM_CONDITION()

                    DECLARE_AUTOMATISM_ACTION("ApplyImpulse",
                                   _("Apply an impulse"),
                                   _("Apply an impulse to the object."),
                                   _("Apply to _PARAM0_  an impulse _PARAM2_;_PARAM3_"),
                                   _("Displacement"),
                                   "res/physics24.png",
                                   "res/physics16.png");

                        instrInfo.AddParameter("object", _("Object"), "", false);
                        instrInfo.AddParameter("automatism", _("Automatism"), "PhysicsAutomatism", false);
                        instrInfo.AddParameter("expression", _("X component ( Newtons/Seconds )"), "", false);
                        instrInfo.AddParameter("expression", _("Y component ( Newtons/Seconds )"), "", false);
                        instrInfo.AddCodeOnlyParameter("currentScene", "");

                        instrInfo.cppCallingInformation.SetFunctionName("ApplyImpulse").SetIncludeFile("PhysicsAutomatism/PhysicsAutomatism.h");

                    DECLARE_END_AUTOMATISM_ACTION()

                    DECLARE_AUTOMATISM_ACTION("ApplyImpulseUsingPolarCoordinates",
                                   _("Apply an impulse ( angle )"),
                                   _("Apply an impulse to an object, using a angle and a length as coordinates."),
                                   _("Apply to _PARAM0_ an impulse, angle : _PARAM2_° and length : _PARAM3_ pixels"),
                                   _("Displacement"),
                                   "res/physics24.png",
                                   "res/physics16.png");

                        instrInfo.AddParameter("object", _("Object"), "", false);
                        instrInfo.AddParameter("automatism", _("Automatism"), "PhysicsAutomatism", false);
                        instrInfo.AddParameter("expression", _("Angle"), "", false);
                        instrInfo.AddParameter("expression", _("Impulse value ( Newton/seconds )"), "", false);
                        instrInfo.AddCodeOnlyParameter("currentScene", "");

                        instrInfo.cppCallingInformation.SetFunctionName("ApplyImpulseUsingPolarCoordinates").SetIncludeFile("PhysicsAutomatism/PhysicsAutomatism.h");

                    DECLARE_END_AUTOMATISM_ACTION()

                    DECLARE_AUTOMATISM_ACTION("ApplyImpulseTowardPosition",
                                   _("Apply an impulse toward a position"),
                                   _("Apply an impulse, directed toward a position, to the object."),
                                   _("Apply to _PARAM0_  an impulse toward position _PARAM2_;_PARAM3_ of length _PARAM4_"),
                                   _("Displacement"),
                                   "res/physics24.png",
                                   "res/physics16.png");

                        instrInfo.AddParameter("object", _("Object"), "", false);
                        instrInfo.AddParameter("automatism", _("Automatism"), "PhysicsAutomatism", false);
                        instrInfo.AddParameter("expression", _("X position"), "", false);
                        instrInfo.AddParameter("expression", _("Y position"), "", false);
                        instrInfo.AddParameter("expression", _("Impulse value ( Newton/seconds )"), "", false);
                        instrInfo.AddCodeOnlyParameter("currentScene", "");

                        instrInfo.cppCallingInformation.SetFunctionName("ApplyImpulseTowardPosition").SetIncludeFile("PhysicsAutomatism/PhysicsAutomatism.h");

                    DECLARE_END_AUTOMATISM_ACTION()

                    DECLARE_AUTOMATISM_ACTION("ApplyForce",
                                   _("Add a force"),
                                   _("Add a force to object"),
                                   _("Apply to _PARAM0_  an impulse _PARAM2_;_PARAM3_"),
                                   _("Displacement"),
                                   "res/physics24.png",
                                   "res/physics16.png");

                        instrInfo.AddParameter("object", _("Object"), "", false);
                        instrInfo.AddParameter("automatism", _("Automatism"), "PhysicsAutomatism", false);
                        instrInfo.AddParameter("expression", _("X component ( Newtons )"), "", false);
                        instrInfo.AddParameter("expression", _("Y component ( Newtons )"), "", false);
                        instrInfo.AddCodeOnlyParameter("currentScene", "");

                        instrInfo.cppCallingInformation.SetFunctionName("ApplyForce").SetIncludeFile("PhysicsAutomatism/PhysicsAutomatism.h");

                    DECLARE_END_AUTOMATISM_ACTION()

                    DECLARE_AUTOMATISM_ACTION("ApplyForceUsingPolarCoordinates",
                                   _("Apply a force ( angle )"),
                                   _("Apply a force to an object, using an angle and a length as coordinates."),
                                   _("Apply to _PARAM0_ a force, angle : _PARAM2_° and length : _PARAM3_"),
                                   _("Displacement"),
                                   "res/physics24.png",
                                   "res/physics16.png");

                        instrInfo.AddParameter("object", _("Object"), "", false);
                        instrInfo.AddParameter("automatism", _("Automatism"), "PhysicsAutomatism", false);
                        instrInfo.AddParameter("expression", _("Angle"), "", false);
                        instrInfo.AddParameter("expression", _("Length of the force ( Newtons )"), "", false);
                        instrInfo.AddCodeOnlyParameter("currentScene", "");

                        instrInfo.cppCallingInformation.SetFunctionName("ApplyForceUsingPolarCoordinates").SetIncludeFile("PhysicsAutomatism/PhysicsAutomatism.h");

                    DECLARE_END_AUTOMATISM_ACTION()

                    DECLARE_AUTOMATISM_ACTION("ApplyForceTowardPosition",
                                   _("Apply a force toward a position"),
                                   _("Apply a force, directed toward a position, to the object."),
                                   _("Add to _PARAM0_  a force toward position _PARAM2_;_PARAM3_ of length _PARAM4_"),
                                   _("Displacement"),
                                   "res/physics24.png",
                                   "res/physics16.png");

                        instrInfo.AddParameter("object", _("Object"), "", false);
                        instrInfo.AddParameter("automatism", _("Automatism"), "PhysicsAutomatism", false);
                        instrInfo.AddParameter("expression", _("X position"), "", false);
                        instrInfo.AddParameter("expression", _("Y position"), "", false);
                        instrInfo.AddParameter("expression", _("Length of the force ( Newtons )"), "", false);
                        instrInfo.AddCodeOnlyParameter("currentScene", "");

                        instrInfo.cppCallingInformation.SetFunctionName("ApplyForceTowardPosition").SetIncludeFile("PhysicsAutomatism/PhysicsAutomatism.h");

                    DECLARE_END_AUTOMATISM_ACTION()

                    DECLARE_AUTOMATISM_ACTION("ApplyTorque",
                                   _("Add a torque ( a rotation )"),
                                   _("Add a torque ( a rotation ) to object."),
                                   _("Add to _PARAM0_ a torque _PARAM2_"),
                                   _("Rotation"),
                                   "res/physics24.png",
                                   "res/physics16.png");

                        instrInfo.AddParameter("object", _("Object"), "", false);
                        instrInfo.AddParameter("automatism", _("Automatism"), "PhysicsAutomatism", false);
                        instrInfo.AddParameter("expression", _("Torque value"), "", false);
                        instrInfo.AddCodeOnlyParameter("currentScene", "");

                        instrInfo.cppCallingInformation.SetFunctionName("ApplyTorque").SetIncludeFile("PhysicsAutomatism/PhysicsAutomatism.h");

                    DECLARE_END_AUTOMATISM_ACTION()

                    DECLARE_AUTOMATISM_ACTION("SetLinearVelocity",
                                   _("Linear speed"),
                                   _("Modify speed of an object."),
                                   _("Set linear speed of _PARAM0_ to _PARAM2_;_PARAM3_"),
                                   _("Displacement"),
                                   "res/physics24.png",
                                   "res/physics16.png");

                        instrInfo.AddParameter("object", _("Object"), "", false);
                        instrInfo.AddParameter("automatism", _("Automatism"), "PhysicsAutomatism", false);
                        instrInfo.AddParameter("expression", _("X Coordinate"), "", false);
                        instrInfo.AddParameter("expression", _("Y Coordinate"), "", false);
                        instrInfo.AddCodeOnlyParameter("currentScene", "");

                        instrInfo.cppCallingInformation.SetFunctionName("SetLinearVelocity").SetIncludeFile("PhysicsAutomatism/PhysicsAutomatism.h");


                    DECLARE_END_AUTOMATISM_ACTION()

                    DECLARE_AUTOMATISM_CONDITION("LinearVelocityX",
                                   _("X component"),
                                   _("Test linear velocity on X axis of object."),
                                   _("Linear velocity on X axis of _PARAM0_ is _PARAM3__PARAM2_"),
                                   _("Displacement"),
                                   "res/physics24.png",
                                   "res/physics16.png");

                        instrInfo.AddParameter("object", _("Object"), "", false);
                        instrInfo.AddParameter("automatism", _("Automatism"), "PhysicsAutomatism", false);
                        instrInfo.AddParameter("expression", _("Value to test"), "", false);
                        instrInfo.AddParameter("relationalOperator", _("Comparison sign"), "", false);
                        instrInfo.AddCodeOnlyParameter("currentScene", "");

                        instrInfo.cppCallingInformation.SetFunctionName("GetLinearVelocityX").SetManipulatedType("number").SetIncludeFile("PhysicsAutomatism/PhysicsAutomatism.h");


                    DECLARE_END_AUTOMATISM_CONDITION()

                    DECLARE_AUTOMATISM_CONDITION("LinearVelocityY",
                                   _("Y component"),
                                   _("Test linear velocity on Y axis of object."),
                                   _("Linear velocity on Y axis of _PARAM0_ is _PARAM3__PARAM2_"),
                                   _("Displacement"),
                                   "res/physics24.png",
                                   "res/physics16.png");

                        instrInfo.AddParameter("object", _("Object"), "", false);
                        instrInfo.AddParameter("automatism", _("Automatism"), "PhysicsAutomatism", false);
                        instrInfo.AddParameter("expression", _("Value to test"), "", false);
                        instrInfo.AddParameter("relationalOperator", _("Comparison sign"), "", false);
                        instrInfo.AddCodeOnlyParameter("currentScene", "");

                        instrInfo.cppCallingInformation.SetFunctionName("GetLinearVelocityY").SetManipulatedType("number").SetIncludeFile("PhysicsAutomatism/PhysicsAutomatism.h");

                    DECLARE_END_AUTOMATISM_CONDITION()

                    DECLARE_AUTOMATISM_CONDITION("LinearVelocity",
                                   _("Linear speed"),
                                   _("Test linear velocity of the object."),
                                   _("Linear velocity of _PARAM0_ is _PARAM3__PARAM2_"),
                                   _("Displacement"),
                                   "res/physics24.png",
                                   "res/physics16.png");

                        instrInfo.AddParameter("object", _("Object"), "", false);
                        instrInfo.AddParameter("automatism", _("Automatism"), "PhysicsAutomatism", false);
                        instrInfo.AddParameter("expression", _("Value to test"), "", false);
                        instrInfo.AddParameter("relationalOperator", _("Comparison sign"), "", false);
                        instrInfo.AddCodeOnlyParameter("currentScene", "");

                        instrInfo.cppCallingInformation.SetFunctionName("GetLinearVelocity").SetManipulatedType("number").SetIncludeFile("PhysicsAutomatism/PhysicsAutomatism.h");

                    DECLARE_END_AUTOMATISM_CONDITION()

                    DECLARE_AUTOMATISM_ACTION("SetAngularVelocity",
                                   _("Angular speed"),
                                   _("Modify angular velocity of object."),
                                   _("Put angular speed of _PARAM0_ to _PARAM2_"),
                                   _("Rotation"),
                                   "res/physics24.png",
                                   "res/physics16.png");

                        instrInfo.AddParameter("object", _("Object"), "", false);
                        instrInfo.AddParameter("automatism", _("Automatism"), "PhysicsAutomatism", false);
                        instrInfo.AddParameter("expression", _("New value"), "", false);
                        instrInfo.AddCodeOnlyParameter("currentScene", "");

                        instrInfo.cppCallingInformation.SetFunctionName("SetAngularVelocity").SetIncludeFile("PhysicsAutomatism/PhysicsAutomatism.h");

                    DECLARE_END_AUTOMATISM_ACTION()

                    DECLARE_AUTOMATISM_CONDITION("AngularVelocity",
                                   _("Angular speed"),
                                   _("Test angular speed of the object."),
                                   _("Angular speed of _PARAM0_ is _PARAM3__PARAM2_"),
                                   _("Rotation"),
                                   "res/physics24.png",
                                   "res/physics16.png");

                        instrInfo.AddParameter("object", _("Object"), "", false);
                        instrInfo.AddParameter("automatism", _("Automatism"), "PhysicsAutomatism", false);
                        instrInfo.AddParameter("expression", _("Value to test"), "", false);
                        instrInfo.AddParameter("relationalOperator", _("Comparison sign"), "", false);
                        instrInfo.AddCodeOnlyParameter("currentScene", "");

                        instrInfo.cppCallingInformation.SetFunctionName("GetAngularVelocity").SetManipulatedType("number").SetIncludeFile("PhysicsAutomatism/PhysicsAutomatism.h");

                    DECLARE_END_AUTOMATISM_CONDITION()

                    DECLARE_AUTOMATISM_CONDITION("LinearDamping",
                                   _("Linear damping"),
                                   _("Test object's linear damping"),
                                   _("Linear velocity of _PARAM0_ is _PARAM3__PARAM2_"),
                                   _("Displacement"),
                                   "res/physics24.png",
                                   "res/physics16.png");

                        instrInfo.AddParameter("object", _("Object"), "", false);
                        instrInfo.AddParameter("automatism", _("Automatism"), "PhysicsAutomatism", false);
                        instrInfo.AddParameter("expression", _("Value to test"), "", false);
                        instrInfo.AddParameter("relationalOperator", _("Comparison sign"), "", false);
                        instrInfo.AddCodeOnlyParameter("currentScene", "");

                        instrInfo.cppCallingInformation.SetFunctionName("GetLinearDamping").SetManipulatedType("number").SetIncludeFile("PhysicsAutomatism/PhysicsAutomatism.h");

                    DECLARE_END_AUTOMATISM_CONDITION()

                    DECLARE_AUTOMATISM_CONDITION("CollisionWith",
                                   _("Collision"),
                                   _("Test if two objects are colliding.\nAttention! Only objects specified in the first parameter will be taken in account by the next actions and conditions, if they are colliding with the other objects."),
                                   _("_PARAM0_ is in collision with a _PARAM2_"),
                                   _("Collision"),
                                   "res/physics24.png",
                                   "res/physics16.png");

                        instrInfo.AddParameter("object", _("Object"), "", false);
                        instrInfo.AddParameter("automatism", _("Automatism"), "PhysicsAutomatism", false);
                        instrInfo.AddParameter("object", _("Object"), "", false);
                        instrInfo.AddCodeOnlyParameter("mapOfObjectListsOfParameter", "2");
                        instrInfo.AddCodeOnlyParameter("currentScene", "");

                        instrInfo.cppCallingInformation.SetFunctionName("CollisionWith").SetIncludeFile("PhysicsAutomatism/PhysicsAutomatism.h");

                    DECLARE_END_AUTOMATISM_CONDITION()

                    DECLARE_AUTOMATISM_ACTION("SetLinearDamping",
                                   _("Linear damping"),
                                   _("Modify linear damping of object."),
                                   _("Put linear damping of _PARAM0_ to _PARAM2_"),
                                   _("Displacement"),
                                   "res/physics24.png",
                                   "res/physics16.png");

                        instrInfo.AddParameter("object", _("Object"), "", false);
                        instrInfo.AddParameter("automatism", _("Automatism"), "PhysicsAutomatism", false);
                        instrInfo.AddParameter("expression", _("Value"), "", false);
                        instrInfo.AddCodeOnlyParameter("currentScene", "");

                        instrInfo.cppCallingInformation.SetFunctionName("SetLinearDamping").SetIncludeFile("PhysicsAutomatism/PhysicsAutomatism.h");

                    DECLARE_END_AUTOMATISM_ACTION()

                    DECLARE_AUTOMATISM_CONDITION("AngularDamping",
                                   _("Angular damping"),
                                   _("Test object's angular damping"),
                                   _("Angular damping of _PARAM0_ is _PARAM3__PARAM2_"),
                                   _("Displacement"),
                                   "res/physics24.png",
                                   "res/physics16.png");

                        instrInfo.AddParameter("object", _("Object"), "", false);
                        instrInfo.AddParameter("automatism", _("Automatism"), "PhysicsAutomatism", false);
                        instrInfo.AddParameter("expression", _("Value to test"), "", false);
                        instrInfo.AddParameter("relationalOperator", _("Comparison sign"), "", false);
                        instrInfo.AddCodeOnlyParameter("currentScene", "");

                        instrInfo.cppCallingInformation.SetFunctionName("GetAngularDamping").SetManipulatedType("number").SetIncludeFile("PhysicsAutomatism/PhysicsAutomatism.h");

                    DECLARE_END_AUTOMATISM_CONDITION()

                    DECLARE_AUTOMATISM_ACTION("SetAngularDamping",
                                   _("Angular damping"),
                                   _("Modify angular damping of object."),
                                   _("Put angular damping of _PARAM0_ to _PARAM2_"),
                                   _("Displacement"),
                                   "res/physics24.png",
                                   "res/physics16.png");

                        instrInfo.AddParameter("object", _("Object"), "", false);
                        instrInfo.AddParameter("automatism", _("Automatism"), "PhysicsAutomatism", false);
                        instrInfo.AddParameter("expression", _("Value"), "", false);
                        instrInfo.AddCodeOnlyParameter("currentScene", "");

                        instrInfo.cppCallingInformation.SetFunctionName("SetAngularDamping").SetIncludeFile("PhysicsAutomatism/PhysicsAutomatism.h");

                    DECLARE_END_AUTOMATISM_ACTION()

                    DECLARE_AUTOMATISM_ACTION("SetGravity",
                                   _("Gravity"),
                                   _("Modify the gravity"),
                                   _("Set gravity force to _PARAM2_;_PARAM3_"),
                                   _("Global options"),
                                   "res/physics24.png",
                                   "res/physics16.png");

                        instrInfo.AddParameter("object", _("Object"), "", false);
                        instrInfo.AddParameter("automatism", _("Automatism"), "PhysicsAutomatism", false);
                        instrInfo.AddParameter("expression", _("X Coordinate"), "", false);
                        instrInfo.AddParameter("expression", _("Y Coordinate"), "", false);
                        instrInfo.AddCodeOnlyParameter("currentScene", "");

                        instrInfo.cppCallingInformation.SetFunctionName("SetGravity").SetIncludeFile("PhysicsAutomatism/PhysicsAutomatism.h");

                    DECLARE_END_AUTOMATISM_ACTION()

                    DECLARE_AUTOMATISM_ACTION("SetPolygonScaleX",
                                   _("Change collision polygon X scale"),
                                   _("Change the X scale of the polygon. Use a value greater than 1 to enlarge the polygon, less than 1 to reduce it."),
                                   _("Change collision polygon of _PARAM0_ X scale to _PARAM2_"),
                                   _("Collision polygon"),
                                   "res/physics24.png",
                                   "res/physics16.png");

                        instrInfo.AddParameter("object", _("Object"), "", false);
                        instrInfo.AddParameter("automatism", _("Automatism"), "PhysicsAutomatism", false);
                        instrInfo.AddParameter("expression", _("Scale"), "", false);
                        instrInfo.AddCodeOnlyParameter("currentScene", "");

                        instrInfo.cppCallingInformation.SetFunctionName("SetPolygonScaleX").SetIncludeFile("PhysicsAutomatism/PhysicsAutomatism.h");

                    DECLARE_END_AUTOMATISM_ACTION()

                    DECLARE_AUTOMATISM_ACTION("SetPolygonScaleY",
                                   _("Change collision polygon Y scale"),
                                   _("Change the Y scale of the polygon. Use a value greater than 1 to enlarge the polygon, less than 1 to reduce it."),
                                   _("Change collision polygon of _PARAM0_ Y scale to _PARAM2_"),
                                   _("Collision polygon"),
                                   "res/physics24.png",
                                   "res/physics16.png");

                        instrInfo.AddParameter("object", _("Object"), "", false);
                        instrInfo.AddParameter("automatism", _("Automatism"), "PhysicsAutomatism", false);
                        instrInfo.AddParameter("expression", _("Scale"), "", false);
                        instrInfo.AddCodeOnlyParameter("currentScene", "");

                        instrInfo.cppCallingInformation.SetFunctionName("SetPolygonScaleY").SetIncludeFile("PhysicsAutomatism/PhysicsAutomatism.h");

                    DECLARE_END_AUTOMATISM_ACTION()

                    DECLARE_AUTOMATISM_CONDITION("GetPolygonScaleX",
                                   _("Collision polygon X scale"),
                                   _("Test the value of the collision polygon X scale."),
                                   _("Collision polygon of _PARAM0_ X scale is _PARAM3__PARAM2_"),
                                   _("Collision polygon"),
                                   "res/physics24.png",
                                   "res/physics16.png");

                        instrInfo.AddParameter("object", _("Object"), "", false);
                        instrInfo.AddParameter("automatism", _("Automatism"), "PhysicsAutomatism", false);
                        instrInfo.AddParameter("expression", _("Value to test"), "", false);
                        instrInfo.AddParameter("relationalOperator", _("Comparison sign"), "", false);
                        instrInfo.AddCodeOnlyParameter("currentScene", "");

                        instrInfo.cppCallingInformation.SetFunctionName("GetPolygonScaleX").SetManipulatedType("number").SetIncludeFile("PhysicsAutomatism/PhysicsAutomatism.h");

                    DECLARE_END_AUTOMATISM_CONDITION()

                    DECLARE_AUTOMATISM_CONDITION("GetPolygonScaleY",
                                   _("Collision polygon Y scale"),
                                   _("Test the value of the collision polygon Y scale."),
                                   _("Collision polygon of _PARAM0_ Y scale is _PARAM3__PARAM2_"),
                                   _("Collision polygon"),
                                   "res/physics24.png",
                                   "res/physics16.png");

                        instrInfo.AddParameter("object", _("Object"), "", false);
                        instrInfo.AddParameter("automatism", _("Automatism"), "PhysicsAutomatism", false);
                        instrInfo.AddParameter("expression", _("Value to test"), "", false);
                        instrInfo.AddParameter("relationalOperator", _("Comparison sign"), "", false);
                        instrInfo.AddCodeOnlyParameter("currentScene", "");

                        instrInfo.cppCallingInformation.SetFunctionName("GetPolygonScaleY").SetManipulatedType("number").SetIncludeFile("PhysicsAutomatism/PhysicsAutomatism.h");

                    DECLARE_END_AUTOMATISM_CONDITION()

                    DECLARE_AUTOMATISM_EXPRESSION("PolygonScaleX", _("Collision polygon X scale"), _("Collision polygon X scale"), _("Collision polygon"), "res/physics16.png")
                        instrInfo.AddParameter("object", _("Object"), "", false);
                        instrInfo.AddParameter("automatism", _("Automatism"), "PhysicsAutomatism", false);
                        instrInfo.AddCodeOnlyParameter("currentScene", "");

                        instrInfo.cppCallingInformation.SetFunctionName("GetPolygonScaleX").SetIncludeFile("PhysicsAutomatism/PhysicsAutomatism.h");

                    DECLARE_END_AUTOMATISM_EXPRESSION()

                    DECLARE_AUTOMATISM_EXPRESSION("PolygonScaleY", _("Collision polygon Y scale"), _("Collision polygon Y scale"), _("Collision polygon"), "res/physics16.png")
                        instrInfo.AddParameter("object", _("Object"), "", false);
                        instrInfo.AddParameter("automatism", _("Automatism"), "PhysicsAutomatism", false);
                        instrInfo.AddCodeOnlyParameter("currentScene", "");

                        instrInfo.cppCallingInformation.SetFunctionName("GetPolygonScaleY").SetIncludeFile("PhysicsAutomatism/PhysicsAutomatism.h");

                    DECLARE_END_AUTOMATISM_EXPRESSION()

                    DECLARE_AUTOMATISM_EXPRESSION("LinearVelocity", _("Linear speed"), _("Linear speed"), _("Displacement"), "res/physics16.png")
                        instrInfo.AddParameter("object", _("Object"), "", false);
                        instrInfo.AddParameter("automatism", _("Automatism"), "PhysicsAutomatism", false);
                        instrInfo.AddCodeOnlyParameter("currentScene", "");

                        instrInfo.cppCallingInformation.SetFunctionName("GetLinearVelocity").SetIncludeFile("PhysicsAutomatism/PhysicsAutomatism.h");
                    DECLARE_END_AUTOMATISM_EXPRESSION()

                    DECLARE_AUTOMATISM_EXPRESSION("LinearVelocityX", _("X component"), _("X component"), _("Displacement"), "res/physics16.png")
                        instrInfo.AddParameter("object", _("Object"), "", false);
                        instrInfo.AddParameter("automatism", _("Automatism"), "PhysicsAutomatism", false);
                        instrInfo.AddCodeOnlyParameter("currentScene", "");

                        instrInfo.cppCallingInformation.SetFunctionName("GetLinearVelocityX").SetIncludeFile("PhysicsAutomatism/PhysicsAutomatism.h");

                    DECLARE_END_AUTOMATISM_EXPRESSION()

                    DECLARE_AUTOMATISM_EXPRESSION("LinearVelocityY", _("Y component"), _("Y component"), _("Displacement"), "res/physics16.png")
                        instrInfo.AddParameter("object", _("Object"), "", false);
                        instrInfo.AddParameter("automatism", _("Automatism"), "PhysicsAutomatism", false);
                        instrInfo.AddCodeOnlyParameter("currentScene", "");

                        instrInfo.cppCallingInformation.SetFunctionName("GetLinearVelocityY").SetIncludeFile("PhysicsAutomatism/PhysicsAutomatism.h");
                    DECLARE_END_AUTOMATISM_EXPRESSION()

                    DECLARE_AUTOMATISM_EXPRESSION("AngularVelocity", _("Angular speed"), _("Angular speed"), _("Rotation"), "res/physics16.png")
                        instrInfo.AddParameter("object", _("Object"), "", false);
                        instrInfo.AddParameter("automatism", _("Automatism"), "PhysicsAutomatism", false);
                        instrInfo.AddCodeOnlyParameter("currentScene", "");

                        instrInfo.cppCallingInformation.SetFunctionName("GetAngularVelocity").SetIncludeFile("PhysicsAutomatism/PhysicsAutomatism.h");
                    DECLARE_END_AUTOMATISM_EXPRESSION()

                    DECLARE_AUTOMATISM_EXPRESSION("LinearDamping", _("Linear damping"), _("Linear damping"), _("Displacement"), "res/physics16.png")
                        instrInfo.AddParameter("object", _("Object"), "", false);
                        instrInfo.AddParameter("automatism", _("Automatism"), "PhysicsAutomatism", false);
                        instrInfo.AddCodeOnlyParameter("currentScene", "");

                        instrInfo.cppCallingInformation.SetFunctionName("GetLinearDamping").SetIncludeFile("PhysicsAutomatism/PhysicsAutomatism.h");
                    DECLARE_END_AUTOMATISM_EXPRESSION()

                    DECLARE_AUTOMATISM_EXPRESSION("AngularDamping", _("Angular damping"), _("Angular damping"), _("Rotation"), "res/physics16.png")
                        instrInfo.AddParameter("object", _("Object"), "", false);
                        instrInfo.AddParameter("automatism", _("Automatism"), "PhysicsAutomatism", false);
                        instrInfo.AddCodeOnlyParameter("currentScene", "");

                        instrInfo.cppCallingInformation.SetFunctionName("GetAngularDamping").SetIncludeFile("PhysicsAutomatism/PhysicsAutomatism.h");
                    DECLARE_END_AUTOMATISM_EXPRESSION()

                    #endif

                DECLARE_END_AUTOMATISM();

            CompleteCompilationInformation();
        };
        virtual ~Extension() {};

    private:

        /**
         * This function is called by Game Develop so
         * as to complete information about how the extension was compiled ( which libs... )
         * -- Do not need to be modified. --
         */
        void CompleteCompilationInformation()
        {
            #if defined(GD_IDE_ONLY)
            compilationInfo.runtimeOnly = false;
            #else
            compilationInfo.runtimeOnly = true;
            #endif

            #if defined(__GNUC__)
            compilationInfo.gccMajorVersion = __GNUC__;
            compilationInfo.gccMinorVersion = __GNUC_MINOR__;
            compilationInfo.gccPatchLevel = __GNUC_PATCHLEVEL__;
            #endif

            compilationInfo.boostVersion = BOOST_VERSION;

            compilationInfo.sfmlMajorVersion = 2;
            compilationInfo.sfmlMinorVersion = 0;

            #if defined(GD_IDE_ONLY)
            compilationInfo.wxWidgetsMajorVersion = wxMAJOR_VERSION;
            compilationInfo.wxWidgetsMinorVersion = wxMINOR_VERSION;
            compilationInfo.wxWidgetsReleaseNumber = wxRELEASE_NUMBER;
            compilationInfo.wxWidgetsSubReleaseNumber = wxSUBRELEASE_NUMBER;
            #endif

            compilationInfo.gdlVersion = RC_FILEVERSION_STRING;
            compilationInfo.sizeOfpInt = sizeof(int*);

            compilationInfo.informationCompleted = true;
        }
};

/**
 * Used by Game Develop to create the extension class
 * -- Do not need to be modified. --
 */
extern "C" ExtensionBase * GD_EXTENSION_API CreateGDExtension() {
    return new Extension;
}

/**
 * Used by Game Develop to destroy the extension class
 * -- Do not need to be modified. --
 */
extern "C" void GD_EXTENSION_API DestroyGDExtension(ExtensionBase * p) {
    delete p;
}


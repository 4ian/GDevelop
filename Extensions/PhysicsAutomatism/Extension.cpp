/**

Game Develop - Physics Automatism Extension
Copyright (c) 2010-2014 Florian Rival (Florian.Rival@gmail.com)

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

#include "GDCore/Tools/Version.h"
#include "PhysicsAutomatism.h"
#include "ScenePhysicsDatas.h"
#include <boost/version.hpp>
#include "GDCpp/ExtensionBase.h"

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
        SetExtensionInformation("PhysicsAutomatism",
                              _("Physics automatism"),
                              _("Automatism allowing to move objects as if they were subject to the laws of physics."),
                              "Florian Rival",
                              "zlib/libpng License (Open Source)");

        {
            gd::AutomatismMetadata & aut = AddAutomatism("PhysicsAutomatism",
                  _("Physics engine"),
                  _("Physics"),
                  _("Make objects move as if they were subject to the laws of physics."),
                  "",
                  "res/physics32.png",
                  "PhysicsAutomatism",
                  boost::shared_ptr<gd::Automatism>(new PhysicsAutomatism),
                  boost::shared_ptr<gd::AutomatismsSharedData>(new ScenePhysicsDatas));

            #if defined(GD_IDE_ONLY)
            aut.SetIncludeFile("PhysicsAutomatism/PhysicsAutomatism.h");

            aut.AddAction("SetStatic",
                           _("Make the object static"),
                           _("Make object immovable."),
                           _("Make _PARAM0_ static"),
                           _("Movement"),
                           "res/physics24.png",
                           "res/physics16.png")
                .AddParameter("object", _("Object"))
                .AddParameter("automatism", _("Automatism"), "PhysicsAutomatism")
                .AddCodeOnlyParameter("currentScene", "")
                .codeExtraInformation.SetFunctionName("SetStatic").SetIncludeFile("PhysicsAutomatism/PhysicsAutomatism.h");

            aut.AddAction("SetDynamic",
                           _("Make the object dynamic"),
                           _("Make object dynamic ( affected by forces and other objects )."),
                           _("Make _PARAM0_ dynamic"),
                           _("Movement"),
                           "res/physics24.png",
                           "res/physics16.png")
                .AddParameter("object", _("Object"))
                .AddParameter("automatism", _("Automatism"), "PhysicsAutomatism")
                .AddCodeOnlyParameter("currentScene", "")
                .codeExtraInformation.SetFunctionName("SetDynamic").SetIncludeFile("PhysicsAutomatism/PhysicsAutomatism.h");

            aut.AddCondition("IsDynamic",
                           _("The object is dynamic"),
                           _("Test if an object is dynamic ( affected by forces and the other objects )."),
                           _("_PARAM0_ is dynamic"),
                           _("Movement"),
                           "res/physics24.png",
                           "res/physics16.png")
                .AddParameter("object", _("Object"))
                .AddParameter("automatism", _("Automatism"), "PhysicsAutomatism")
                .codeExtraInformation.SetFunctionName("IsDynamic").SetIncludeFile("PhysicsAutomatism/PhysicsAutomatism.h");

            aut.AddAction("SetFixedRotation",
                           _("Fix rotation"),
                           _("Prevent the object from rotating"),
                           _("Fix rotation of _PARAM0_"),
                           _("Rotation"),
                           "res/physics24.png",
                           "res/physics16.png")
                .AddParameter("object", _("Object"))
                .AddParameter("automatism", _("Automatism"), "PhysicsAutomatism")
                .AddCodeOnlyParameter("currentScene", "")
                .codeExtraInformation.SetFunctionName("SetFixedRotation").SetIncludeFile("PhysicsAutomatism/PhysicsAutomatism.h");

            aut.AddAction("AddRevoluteJoint",
                           _("Add a hinge"),
                           _("Add a hinge about which the object will rotate.\nDistance between hinge and object will remain identical."),
                           _("Add a hinge to _PARAM0_ at _PARAM2_;_PARAM3_"),
                           _("Joints"),
                           "res/physics24.png",
                           "res/physics16.png")
                .AddParameter("object", _("Object"))
                .AddParameter("automatism", _("Automatism"), "PhysicsAutomatism")
                .AddParameter("expression", _("Hinge X position"))
                .AddParameter("expression", _("Hinge Y position"))
                .AddCodeOnlyParameter("currentScene", "")
                .codeExtraInformation.SetFunctionName("AddRevoluteJoint").SetIncludeFile("PhysicsAutomatism/PhysicsAutomatism.h");

            aut.AddAction("AddRevoluteJointBetweenObjects",
                           _("Add a hinge between two objects"),
                           _("Add a hinge about which the object will rotate."),
                           _("Add a hinge between _PARAM0_ and _PARAM2_"),
                           _("Joints"),
                           "res/physics24.png",
                           "res/physics16.png")
                .AddParameter("object", _("Object"))
                .AddParameter("automatism", _("Automatism"), "PhysicsAutomatism")
                .AddParameter("objectPtr", _("Object"))
                .AddCodeOnlyParameter("currentScene", "")
                .AddParameter("expression", _("X position of the hinge, from the first object mass center"), "", true).SetDefaultValue("0")
                .AddParameter("expression", _("Y position of the hinge, from the first object mass center"), "", true).SetDefaultValue("0")
                .codeExtraInformation.SetFunctionName("AddRevoluteJointBetweenObjects").SetIncludeFile("PhysicsAutomatism/PhysicsAutomatism.h");

            aut.AddAction("ActAddGearJointBetweenObjects",
                           _("Add a gear between two objects"),
                           _("Add a virtual gear between two objects."),
                           _("Add a gear between _PARAM0_ and _PARAM2_"),
                           _("Joints"),
                           "res/physics24.png",
                           "res/physics16.png")
                .AddParameter("object", _("Object"))
                .AddParameter("automatism", _("Automatism"), "PhysicsAutomatism")
                .AddParameter("objectPtr", _("Object"))
                .AddParameter("expression", _("Ratio"), "", true).SetDefaultValue("1")
                .AddCodeOnlyParameter("currentScene", "")
                .codeExtraInformation.SetFunctionName("AddGearJointBetweenObjects").SetIncludeFile("PhysicsAutomatism/PhysicsAutomatism.h");

            aut.AddAction("SetFreeRotation",
                           _("Make object's rotation free"),
                           _("Allows object to rotate."),
                           _("Allow _PARAM0_ to rotate"),
                           _("Rotation"),
                           "res/physics24.png",
                           "res/physics16.png")
                .AddParameter("object", _("Object"))
                .AddParameter("automatism", _("Automatism"), "PhysicsAutomatism")
                .AddCodeOnlyParameter("currentScene", "")
                .codeExtraInformation.SetFunctionName("SetFreeRotation").SetIncludeFile("PhysicsAutomatism/PhysicsAutomatism.h");

            aut.AddCondition("IsFixedRotation",
                           _("Fixed rotation"),
                           _("Test if object is rotation fixed."),
                           _("_PARAM0_ is rotation fixed."),
                           _("Rotation"),
                           "res/physics24.png",
                           "res/physics16.png")
                .AddParameter("object", _("Object"))
                .AddParameter("automatism", _("Automatism"), "PhysicsAutomatism")
                .AddCodeOnlyParameter("currentScene", "")
                .codeExtraInformation.SetFunctionName("IsFixedRotation").SetIncludeFile("PhysicsAutomatism/PhysicsAutomatism.h");

            aut.AddAction("SetAsBullet",
                           _("Consider as a bullet."),
                           _("Consider the object as a bullet, so as to have better collision handling."),
                           _("Consider _PARAM0_ as a bullet"),
                           _("Other"),
                           "res/physics24.png",
                           "res/physics16.png")
                .AddParameter("object", _("Object"))
                .AddParameter("automatism", _("Automatism"), "PhysicsAutomatism")
                .AddCodeOnlyParameter("currentScene", "")
                .codeExtraInformation.SetFunctionName("SetAsBullet").SetIncludeFile("PhysicsAutomatism/PhysicsAutomatism.h");

            aut.AddAction("DontSetAsBullet",
                           _("Do not consider as a bullet"),
                           _("Do not consider object as a bullet, so as to use standard collision handling."),
                           _("Do not consider _PARAM0_ as a bullet."),
                           _("Other"),
                           "res/physics24.png",
                           "res/physics16.png")
                .AddParameter("object", _("Object"))
                .AddParameter("automatism", _("Automatism"), "PhysicsAutomatism")
                .AddCodeOnlyParameter("currentScene", "")
                .codeExtraInformation.SetFunctionName("DontSetAsBullet").SetIncludeFile("PhysicsAutomatism/PhysicsAutomatism.h");

            aut.AddCondition("IsBullet",
                           _("Object is considered as a bullet"),
                           _("Test if object is considered as a bullet"),
                           _("_PARAM0_ is considered as a bullet"),
                           _("Other"),
                           "res/physics24.png",
                           "res/physics16.png")
                .AddParameter("object", _("Object"))
                .AddParameter("automatism", _("Automatism"), "PhysicsAutomatism")
                .AddCodeOnlyParameter("currentScene", "")
                .codeExtraInformation.SetFunctionName("IsBullet").SetIncludeFile("PhysicsAutomatism/PhysicsAutomatism.h");

            aut.AddAction("ApplyImpulse",
                           _("Apply an impulse"),
                           _("Apply an impulse to the object."),
                           _("Apply to _PARAM0_ impulse _PARAM2_;_PARAM3_"),
                           _("Displacement"),
                           "res/physics24.png",
                           "res/physics16.png")
                .AddParameter("object", _("Object"))
                .AddParameter("automatism", _("Automatism"), "PhysicsAutomatism")
                .AddParameter("expression", _("X component ( Newtons/Seconds )"))
                .AddParameter("expression", _("Y component ( Newtons/Seconds )"))
                .AddCodeOnlyParameter("currentScene", "")
                .codeExtraInformation.SetFunctionName("ApplyImpulse").SetIncludeFile("PhysicsAutomatism/PhysicsAutomatism.h");

            aut.AddAction("ApplyImpulseUsingPolarCoordinates",
                           _("Apply an impulse (angle)"),
                           _("Apply an impulse to an object, using a angle and a length as coordinates."),
                           _("Apply to _PARAM0_ impulse _PARAM3_ with angle: _PARAM2_°"),
                           _("Displacement"),
                           "res/physics24.png",
                           "res/physics16.png")
                .AddParameter("object", _("Object"))
                .AddParameter("automatism", _("Automatism"), "PhysicsAutomatism")
                .AddParameter("expression", _("Angle"))
                .AddParameter("expression", _("Impulse value ( Newton/seconds )"))
                .AddCodeOnlyParameter("currentScene", "")
                .codeExtraInformation.SetFunctionName("ApplyImpulseUsingPolarCoordinates").SetIncludeFile("PhysicsAutomatism/PhysicsAutomatism.h");

            aut.AddAction("ApplyImpulseTowardPosition",
                           _("Apply an impulse toward a position"),
                           _("Apply an impulse, directed toward a position, to the object."),
                           _("Apply to _PARAM0_ impulse _PARAM4_ toward position _PARAM2_;_PARAM3_"),
                           _("Displacement"),
                           "res/physics24.png",
                           "res/physics16.png")
                .AddParameter("object", _("Object"))
                .AddParameter("automatism", _("Automatism"), "PhysicsAutomatism")
                .AddParameter("expression", _("X position"))
                .AddParameter("expression", _("Y position"))
                .AddParameter("expression", _("Impulse value ( Newton/seconds )"))
                .AddCodeOnlyParameter("currentScene", "")
                .codeExtraInformation.SetFunctionName("ApplyImpulseTowardPosition").SetIncludeFile("PhysicsAutomatism/PhysicsAutomatism.h");

            aut.AddAction("ApplyForce",
                           _("Add a force"),
                           _("Add a force to object"),
                           _("Apply to _PARAM0_ force _PARAM2_;_PARAM3_"),
                           _("Displacement"),
                           "res/physics24.png",
                           "res/physics16.png")
                .AddParameter("object", _("Object"))
                .AddParameter("automatism", _("Automatism"), "PhysicsAutomatism")
                .AddParameter("expression", _("X component ( Newtons )"))
                .AddParameter("expression", _("Y component ( Newtons )"))
                .AddCodeOnlyParameter("currentScene", "")
                .codeExtraInformation.SetFunctionName("ApplyForce").SetIncludeFile("PhysicsAutomatism/PhysicsAutomatism.h");

            aut.AddAction("ApplyForceUsingPolarCoordinates",
                           _("Apply a force ( angle )"),
                           _("Apply a force to an object, using an angle and a length as coordinates."),
                           _("Apply to _PARAM0_ force _PARAM3_ at angle _PARAM2_"),
                           _("Displacement"),
                           "res/physics24.png",
                           "res/physics16.png")
                .AddParameter("object", _("Object"))
                .AddParameter("automatism", _("Automatism"), "PhysicsAutomatism")
                .AddParameter("expression", _("Angle"))
                .AddParameter("expression", _("Length of the force ( Newtons )"))
                .AddCodeOnlyParameter("currentScene", "")
                .codeExtraInformation.SetFunctionName("ApplyForceUsingPolarCoordinates").SetIncludeFile("PhysicsAutomatism/PhysicsAutomatism.h");

            aut.AddAction("ApplyForceTowardPosition",
                           _("Apply a force toward a position"),
                           _("Apply a force, directed toward a position, to the object."),
                           _("Add to _PARAM0_ force _PARAM4_ toward position _PARAM2_;_PARAM3_"),
                           _("Displacement"),
                           "res/physics24.png",
                           "res/physics16.png")
                .AddParameter("object", _("Object"))
                .AddParameter("automatism", _("Automatism"), "PhysicsAutomatism")
                .AddParameter("expression", _("X position"))
                .AddParameter("expression", _("Y position"))
                .AddParameter("expression", _("Length of the force ( Newtons )"))
                .AddCodeOnlyParameter("currentScene", "")
                .codeExtraInformation.SetFunctionName("ApplyForceTowardPosition").SetIncludeFile("PhysicsAutomatism/PhysicsAutomatism.h");

            aut.AddAction("ApplyTorque",
                           _("Add a torque (a rotation)"),
                           _("Add a torque (a rotation) to object."),
                           _("Add to _PARAM0_ torque _PARAM2_"),
                           _("Rotation"),
                           "res/physics24.png",
                           "res/physics16.png")
                .AddParameter("object", _("Object"))
                .AddParameter("automatism", _("Automatism"), "PhysicsAutomatism")
                .AddParameter("expression", _("Torque value"))
                .AddCodeOnlyParameter("currentScene", "")
                .codeExtraInformation.SetFunctionName("ApplyTorque").SetIncludeFile("PhysicsAutomatism/PhysicsAutomatism.h");

            aut.AddAction("SetLinearVelocity",
                           _("Linear velocity"),
                           _("Modify velocity of an object."),
                           _("Set linear velocity of _PARAM0_ to _PARAM2_;_PARAM3_"),
                           _("Displacement"),
                           "res/physics24.png",
                           "res/physics16.png")
                .AddParameter("object", _("Object"))
                .AddParameter("automatism", _("Automatism"), "PhysicsAutomatism")
                .AddParameter("expression", _("X Coordinate"))
                .AddParameter("expression", _("Y Coordinate"))
                .AddCodeOnlyParameter("currentScene", "")
                .codeExtraInformation.SetFunctionName("SetLinearVelocity").SetIncludeFile("PhysicsAutomatism/PhysicsAutomatism.h");

            aut.AddCondition("LinearVelocityX",
                           _("X component"),
                           _("Compare the linear velocity on X axis of object."),
                           _("Linear velocity on X axis of _PARAM0_ is _PARAM2__PARAM3_"),
                           _("Displacement"),
                           "res/physics24.png",
                           "res/physics16.png")
                .AddParameter("object", _("Object"))
                .AddParameter("automatism", _("Automatism"), "PhysicsAutomatism")
                .AddParameter("relationalOperator", _("Comparison sign"))
                .AddParameter("expression", _("Value to test"))
                .AddCodeOnlyParameter("currentScene", "")
                .codeExtraInformation.SetFunctionName("GetLinearVelocityX").SetManipulatedType("number").SetIncludeFile("PhysicsAutomatism/PhysicsAutomatism.h");

            aut.AddCondition("LinearVelocityY",
                           _("Y component"),
                           _("Compare the linear velocity on Y axis of object."),
                           _("Linear velocity on Y axis of _PARAM0_ is _PARAM2__PARAM3_"),
                           _("Displacement"),
                           "res/physics24.png",
                           "res/physics16.png")
                .AddParameter("object", _("Object"))
                .AddParameter("automatism", _("Automatism"), "PhysicsAutomatism")
                .AddParameter("relationalOperator", _("Comparison sign"))
                .AddParameter("expression", _("Value to test"))
                .AddCodeOnlyParameter("currentScene", "")
                .codeExtraInformation.SetFunctionName("GetLinearVelocityY").SetManipulatedType("number").SetIncludeFile("PhysicsAutomatism/PhysicsAutomatism.h");

            aut.AddCondition("LinearVelocity",
                           _("Linear speed"),
                           _("Compare the linear velocity of the object."),
                           _("Linear velocity of _PARAM0_ is _PARAM2__PARAM3_"),
                           _("Displacement"),
                           "res/physics24.png",
                           "res/physics16.png")
                .AddParameter("object", _("Object"))
                .AddParameter("automatism", _("Automatism"), "PhysicsAutomatism")
                .AddParameter("relationalOperator", _("Comparison sign"))
                .AddParameter("expression", _("Value to test"))
                .AddCodeOnlyParameter("currentScene", "")
                .codeExtraInformation.SetFunctionName("GetLinearVelocity").SetManipulatedType("number").SetIncludeFile("PhysicsAutomatism/PhysicsAutomatism.h");

            aut.AddAction("SetAngularVelocity",
                           _("Angular speed"),
                           _("Modify angular velocity of object."),
                           _("Set angular speed of _PARAM0_ to _PARAM2_"),
                           _("Rotation"),
                           "res/physics24.png",
                           "res/physics16.png")
                .AddParameter("object", _("Object"))
                .AddParameter("automatism", _("Automatism"), "PhysicsAutomatism")
                .AddParameter("expression", _("New value"))
                .AddCodeOnlyParameter("currentScene", "")
                .codeExtraInformation.SetFunctionName("SetAngularVelocity").SetIncludeFile("PhysicsAutomatism/PhysicsAutomatism.h");

            aut.AddCondition("AngularVelocity",
                           _("Angular speed"),
                           _("Compare the angular speed of the object."),
                           _("Angular speed of _PARAM0_ is _PARAM2__PARAM3_"),
                           _("Rotation"),
                           "res/physics24.png",
                           "res/physics16.png")
                .AddParameter("object", _("Object"))
                .AddParameter("automatism", _("Automatism"), "PhysicsAutomatism")
                .AddParameter("relationalOperator", _("Comparison sign"))
                .AddParameter("expression", _("Value to test"))
                .AddCodeOnlyParameter("currentScene", "")
                .codeExtraInformation.SetFunctionName("GetAngularVelocity").SetManipulatedType("number").SetIncludeFile("PhysicsAutomatism/PhysicsAutomatism.h");

            aut.AddCondition("LinearDamping",
                           _("Linear damping"),
                           _("Compare the linear damping of the object."),
                           _("Linear damping of _PARAM0_ is _PARAM2__PARAM3_"),
                           _("Displacement"),
                           "res/physics24.png",
                           "res/physics16.png")
                .AddParameter("object", _("Object"))
                .AddParameter("automatism", _("Automatism"), "PhysicsAutomatism")
                .AddParameter("relationalOperator", _("Comparison sign"))
                .AddParameter("expression", _("Value to test"))
                .AddCodeOnlyParameter("currentScene", "")
                .codeExtraInformation.SetFunctionName("GetLinearDamping").SetManipulatedType("number").SetIncludeFile("PhysicsAutomatism/PhysicsAutomatism.h");

            aut.AddCondition("CollisionWith",
                           _("Collision"),
                           _("Test if two objects are colliding.\nAttention! Only objects specified in the first parameter will be taken in account by the next actions and conditions, if they are colliding with the other objects."),
                           _("_PARAM0_ is in collision with a _PARAM2_"),
                           "",
                           "res/physics24.png",
                           "res/physics16.png")
                .AddParameter("object", _("Object"))
                .AddParameter("automatism", _("Automatism"), "PhysicsAutomatism")
                .AddParameter("objectList", _("Object"))
                .AddCodeOnlyParameter("currentScene", "")
                .codeExtraInformation.SetFunctionName("CollisionWith").SetIncludeFile("PhysicsAutomatism/PhysicsAutomatism.h");

            aut.AddAction("SetLinearDamping",
                           _("Linear damping"),
                           _("Modify linear damping of object."),
                           _("Put linear damping of _PARAM0_ to _PARAM2_"),
                           _("Displacement"),
                           "res/physics24.png",
                           "res/physics16.png")
                .AddParameter("object", _("Object"))
                .AddParameter("automatism", _("Automatism"), "PhysicsAutomatism")
                .AddParameter("expression", _("Value"))
                .AddCodeOnlyParameter("currentScene", "")
                .codeExtraInformation.SetFunctionName("SetLinearDamping").SetIncludeFile("PhysicsAutomatism/PhysicsAutomatism.h");

            aut.AddCondition("AngularDamping",
                           _("Angular damping"),
                           _("Test object's angular damping"),
                           _("Angular damping of _PARAM0_ is _PARAM2__PARAM3_"),
                           _("Displacement"),
                           "res/physics24.png",
                           "res/physics16.png")
                .AddParameter("object", _("Object"))
                .AddParameter("automatism", _("Automatism"), "PhysicsAutomatism")
                .AddParameter("relationalOperator", _("Comparison sign"))
                .AddParameter("expression", _("Value to test"))
                .AddCodeOnlyParameter("currentScene", "")
                .codeExtraInformation.SetFunctionName("GetAngularDamping").SetManipulatedType("number").SetIncludeFile("PhysicsAutomatism/PhysicsAutomatism.h");

            aut.AddAction("SetAngularDamping",
                           _("Angular damping"),
                           _("Modify angular damping of object."),
                           _("Set angular damping of _PARAM0_ to _PARAM2_"),
                           _("Displacement"),
                           "res/physics24.png",
                           "res/physics16.png")
                .AddParameter("object", _("Object"))
                .AddParameter("automatism", _("Automatism"), "PhysicsAutomatism")
                .AddParameter("expression", _("Value"))
                .AddCodeOnlyParameter("currentScene", "")
                .codeExtraInformation.SetFunctionName("SetAngularDamping").SetIncludeFile("PhysicsAutomatism/PhysicsAutomatism.h");

            aut.AddAction("SetGravity",
                           _("Gravity"),
                           _("Modify the gravity"),
                           _("Set gravity force to _PARAM2_;_PARAM3_"),
                           _("Global options"),
                           "res/physics24.png",
                           "res/physics16.png")
                .AddParameter("object", _("Object"))
                .AddParameter("automatism", _("Automatism"), "PhysicsAutomatism")
                .AddParameter("expression", _("X Coordinate"))
                .AddParameter("expression", _("Y Coordinate"))
                .AddCodeOnlyParameter("currentScene", "")
                .codeExtraInformation.SetFunctionName("SetGravity").SetIncludeFile("PhysicsAutomatism/PhysicsAutomatism.h");

            aut.AddAction("SetPolygonScaleX",
                           _("Change collision polygon X scale"),
                           _("Change the X scale of the polygon. Use a value greater than 1 to enlarge the polygon, less than 1 to reduce it."),
                           _("Change collision polygon of _PARAM0_ X scale to _PARAM2_"),
                           _("Collision polygon"),
                           "res/physics24.png",
                           "res/physics16.png")
                .AddParameter("object", _("Object"))
                .AddParameter("automatism", _("Automatism"), "PhysicsAutomatism")
                .AddParameter("expression", _("Scale"))
                .AddCodeOnlyParameter("currentScene", "")
                .codeExtraInformation.SetFunctionName("SetPolygonScaleX").SetIncludeFile("PhysicsAutomatism/PhysicsAutomatism.h");

            aut.AddAction("SetPolygonScaleY",
                           _("Change collision polygon Y scale"),
                           _("Change the Y scale of the polygon. Use a value greater than 1 to enlarge the polygon, less than 1 to reduce it."),
                           _("Change collision polygon of _PARAM0_ Y scale to _PARAM2_"),
                           _("Collision polygon"),
                           "res/physics24.png",
                           "res/physics16.png")
                .AddParameter("object", _("Object"))
                .AddParameter("automatism", _("Automatism"), "PhysicsAutomatism")
                .AddParameter("expression", _("Scale"))
                .AddCodeOnlyParameter("currentScene", "")
                .codeExtraInformation.SetFunctionName("SetPolygonScaleY").SetIncludeFile("PhysicsAutomatism/PhysicsAutomatism.h");

            aut.AddCondition("GetPolygonScaleX",
                           _("Collision polygon X scale"),
                           _("Test the value of the collision polygon X scale."),
                           _("Collision polygon of _PARAM0_ X scale is _PARAM2__PARAM3_"),
                           _("Collision polygon"),
                           "res/physics24.png",
                           "res/physics16.png")
                .AddParameter("object", _("Object"))
                .AddParameter("automatism", _("Automatism"), "PhysicsAutomatism")
                .AddParameter("relationalOperator", _("Comparison sign"))
                .AddParameter("expression", _("Value to test"))
                .AddCodeOnlyParameter("currentScene", "")
                .codeExtraInformation.SetFunctionName("GetPolygonScaleX").SetManipulatedType("number").SetIncludeFile("PhysicsAutomatism/PhysicsAutomatism.h");

            aut.AddCondition("GetPolygonScaleY",
                           _("Collision polygon Y scale"),
                           _("Test the value of the collision polygon Y scale."),
                           _("Collision polygon of _PARAM0_ Y scale is _PARAM2__PARAM3_"),
                           _("Collision polygon"),
                           "res/physics24.png",
                           "res/physics16.png")
                .AddParameter("object", _("Object"))
                .AddParameter("automatism", _("Automatism"), "PhysicsAutomatism")
                .AddParameter("relationalOperator", _("Comparison sign"))
                .AddParameter("expression", _("Value to test"))
                .AddCodeOnlyParameter("currentScene", "")
                .codeExtraInformation.SetFunctionName("GetPolygonScaleY").SetManipulatedType("number").SetIncludeFile("PhysicsAutomatism/PhysicsAutomatism.h");

            aut.AddExpression("PolygonScaleX", _("Collision polygon X scale"), _("Collision polygon X scale"), _("Collision polygon"), "res/physics16.png")
                .AddParameter("object", _("Object"))
                .AddParameter("automatism", _("Automatism"), "PhysicsAutomatism")
                .AddCodeOnlyParameter("currentScene", "")
                .codeExtraInformation.SetFunctionName("GetPolygonScaleX").SetIncludeFile("PhysicsAutomatism/PhysicsAutomatism.h");

            aut.AddExpression("PolygonScaleY", _("Collision polygon Y scale"), _("Collision polygon Y scale"), _("Collision polygon"), "res/physics16.png")
                .AddParameter("object", _("Object"))
                .AddParameter("automatism", _("Automatism"), "PhysicsAutomatism")
                .AddCodeOnlyParameter("currentScene", "")
                .codeExtraInformation.SetFunctionName("GetPolygonScaleY").SetIncludeFile("PhysicsAutomatism/PhysicsAutomatism.h");

            aut.AddExpression("LinearVelocity", _("Linear speed"), _("Linear speed"), _("Displacement"), "res/physics16.png")
                .AddParameter("object", _("Object"))
                .AddParameter("automatism", _("Automatism"), "PhysicsAutomatism")
                .AddCodeOnlyParameter("currentScene", "")
                .codeExtraInformation.SetFunctionName("GetLinearVelocity").SetIncludeFile("PhysicsAutomatism/PhysicsAutomatism.h");

            aut.AddExpression("LinearVelocityX", _("X component"), _("X component"), _("Displacement"), "res/physics16.png")
                .AddParameter("object", _("Object"))
                .AddParameter("automatism", _("Automatism"), "PhysicsAutomatism")
                .AddCodeOnlyParameter("currentScene", "")
                .codeExtraInformation.SetFunctionName("GetLinearVelocityX").SetIncludeFile("PhysicsAutomatism/PhysicsAutomatism.h");

            aut.AddExpression("LinearVelocityY", _("Y component"), _("Y component"), _("Displacement"), "res/physics16.png")
                .AddParameter("object", _("Object"))
                .AddParameter("automatism", _("Automatism"), "PhysicsAutomatism")
                .AddCodeOnlyParameter("currentScene", "")
                .codeExtraInformation.SetFunctionName("GetLinearVelocityY").SetIncludeFile("PhysicsAutomatism/PhysicsAutomatism.h");

            aut.AddExpression("AngularVelocity", _("Angular speed"), _("Angular speed"), _("Rotation"), "res/physics16.png")
                .AddParameter("object", _("Object"))
                .AddParameter("automatism", _("Automatism"), "PhysicsAutomatism")
                .AddCodeOnlyParameter("currentScene", "")
                .codeExtraInformation.SetFunctionName("GetAngularVelocity").SetIncludeFile("PhysicsAutomatism/PhysicsAutomatism.h");

            aut.AddExpression("LinearDamping", _("Linear damping"), _("Linear damping"), _("Displacement"), "res/physics16.png")
                .AddParameter("object", _("Object"))
                .AddParameter("automatism", _("Automatism"), "PhysicsAutomatism")
                .AddCodeOnlyParameter("currentScene", "")
                .codeExtraInformation.SetFunctionName("GetLinearDamping").SetIncludeFile("PhysicsAutomatism/PhysicsAutomatism.h");

            aut.AddExpression("AngularDamping", _("Angular damping"), _("Angular damping"), _("Rotation"), "res/physics16.png")
                .AddParameter("object", _("Object"))
                .AddParameter("automatism", _("Automatism"), "PhysicsAutomatism")
                .AddCodeOnlyParameter("currentScene", "")
                .codeExtraInformation.SetFunctionName("GetAngularDamping").SetIncludeFile("PhysicsAutomatism/PhysicsAutomatism.h");

            #endif

        }

        GD_COMPLETE_EXTENSION_COMPILATION_INFORMATION();
    };
    virtual ~Extension() {};
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


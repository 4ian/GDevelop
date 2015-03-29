/**

GDevelop - Physics Automatism Extension
Copyright (c) 2010-2015 Florian Rival (Florian.Rival@gmail.com)
This project is released under the MIT License.
*/
/**
 * Contributors to the extension:
 * Victor Levasseur ( Collisions using custom polygons, fixed time step fix )
 */

#include "GDCore/Tools/Version.h"
#include "PhysicsAutomatism.h"
#include "ScenePhysicsDatas.h"

#include "GDCpp/ExtensionBase.h"

/**
 * \brief This class declares information about the extension.
 */
class Extension : public ExtensionBase
{
public:

    /**
     * Constructor of an extension declares everything the extension contains: objects, actions, conditions and expressions.
     */
    Extension()
    {
        SetExtensionInformation("PhysicsAutomatism",
                              GD_T("Physics automatism"),
                              GD_T("Automatism allowing to move objects as if they were subject to the laws of physics."),
                              "Florian Rival",
                              "Open source (MIT License)");

        {
            gd::AutomatismMetadata & aut = AddAutomatism("PhysicsAutomatism",
                  GD_T("Physics engine"),
                  GD_T("Physics"),
                  GD_T("Make objects move as if they were subject to the laws of physics."),
                  "",
                  "res/physics32.png",
                  "PhysicsAutomatism",
                  std::shared_ptr<gd::Automatism>(new PhysicsAutomatism),
                  std::shared_ptr<gd::AutomatismsSharedData>(new ScenePhysicsDatas));

            #if defined(GD_IDE_ONLY)
            aut.SetIncludeFile("PhysicsAutomatism/PhysicsAutomatism.h");

            aut.AddAction("SetStatic",
                           GD_T("Make the object static"),
                           GD_T("Make object immovable."),
                           GD_T("Make _PARAM0_ static"),
                           GD_T("Movement"),
                           "res/physics24.png",
                           "res/physics16.png")
                .AddParameter("object", GD_T("Object"))
                .AddParameter("automatism", GD_T("Automatism"), "PhysicsAutomatism")
                .AddCodeOnlyParameter("currentScene", "")
                .codeExtraInformation.SetFunctionName("SetStatic").SetIncludeFile("PhysicsAutomatism/PhysicsAutomatism.h");

            aut.AddAction("SetDynamic",
                           GD_T("Make the object dynamic"),
                           GD_T("Make object dynamic ( affected by forces and other objects )."),
                           GD_T("Make _PARAM0_ dynamic"),
                           GD_T("Movement"),
                           "res/physics24.png",
                           "res/physics16.png")
                .AddParameter("object", GD_T("Object"))
                .AddParameter("automatism", GD_T("Automatism"), "PhysicsAutomatism")
                .AddCodeOnlyParameter("currentScene", "")
                .codeExtraInformation.SetFunctionName("SetDynamic").SetIncludeFile("PhysicsAutomatism/PhysicsAutomatism.h");

            aut.AddCondition("IsDynamic",
                           GD_T("The object is dynamic"),
                           GD_T("Test if an object is dynamic ( affected by forces and the other objects )."),
                           GD_T("_PARAM0_ is dynamic"),
                           GD_T("Movement"),
                           "res/physics24.png",
                           "res/physics16.png")
                .AddParameter("object", GD_T("Object"))
                .AddParameter("automatism", GD_T("Automatism"), "PhysicsAutomatism")
                .codeExtraInformation.SetFunctionName("IsDynamic").SetIncludeFile("PhysicsAutomatism/PhysicsAutomatism.h");

            aut.AddAction("SetFixedRotation",
                           GD_T("Fix rotation"),
                           GD_T("Prevent the object from rotating"),
                           GD_T("Fix rotation of _PARAM0_"),
                           GD_T("Rotation"),
                           "res/physics24.png",
                           "res/physics16.png")
                .AddParameter("object", GD_T("Object"))
                .AddParameter("automatism", GD_T("Automatism"), "PhysicsAutomatism")
                .AddCodeOnlyParameter("currentScene", "")
                .codeExtraInformation.SetFunctionName("SetFixedRotation").SetIncludeFile("PhysicsAutomatism/PhysicsAutomatism.h");

            aut.AddAction("AddRevoluteJoint",
                           GD_T("Add a hinge"),
                           GD_T("Add a hinge about which the object will rotate.\nDistance between hinge and object will remain identical."),
                           GD_T("Add a hinge to _PARAM0_ at _PARAM2_;_PARAM3_"),
                           GD_T("Joints"),
                           "res/physics24.png",
                           "res/physics16.png")
                .AddParameter("object", GD_T("Object"))
                .AddParameter("automatism", GD_T("Automatism"), "PhysicsAutomatism")
                .AddParameter("expression", GD_T("Hinge X position"))
                .AddParameter("expression", GD_T("Hinge Y position"))
                .AddCodeOnlyParameter("currentScene", "")
                .codeExtraInformation.SetFunctionName("AddRevoluteJoint").SetIncludeFile("PhysicsAutomatism/PhysicsAutomatism.h");

            aut.AddAction("AddRevoluteJointBetweenObjects",
                           GD_T("Add a hinge between two objects"),
                           GD_T("Add a hinge about which the object will rotate."),
                           GD_T("Add a hinge between _PARAM0_ and _PARAM2_"),
                           GD_T("Joints"),
                           "res/physics24.png",
                           "res/physics16.png")
                .AddParameter("object", GD_T("Object"))
                .AddParameter("automatism", GD_T("Automatism"), "PhysicsAutomatism")
                .AddParameter("objectPtr", GD_T("Object"))
                .AddCodeOnlyParameter("currentScene", "")
                .AddParameter("expression", GD_T("X position of the hinge, from the first object mass center"), "", true).SetDefaultValue("0")
                .AddParameter("expression", GD_T("Y position of the hinge, from the first object mass center"), "", true).SetDefaultValue("0")
                .codeExtraInformation.SetFunctionName("AddRevoluteJointBetweenObjects").SetIncludeFile("PhysicsAutomatism/PhysicsAutomatism.h");

            aut.AddAction("ActAddGearJointBetweenObjects",
                           GD_T("Add a gear between two objects"),
                           GD_T("Add a virtual gear between two objects."),
                           GD_T("Add a gear between _PARAM0_ and _PARAM2_"),
                           GD_T("Joints"),
                           "res/physics24.png",
                           "res/physics16.png")
                .AddParameter("object", GD_T("Object"))
                .AddParameter("automatism", GD_T("Automatism"), "PhysicsAutomatism")
                .AddParameter("objectPtr", GD_T("Object"))
                .AddParameter("expression", GD_T("Ratio"), "", true).SetDefaultValue("1")
                .AddCodeOnlyParameter("currentScene", "")
                .codeExtraInformation.SetFunctionName("AddGearJointBetweenObjects").SetIncludeFile("PhysicsAutomatism/PhysicsAutomatism.h");

            aut.AddAction("SetFreeRotation",
                           GD_T("Make object's rotation free"),
                           GD_T("Allows object to rotate."),
                           GD_T("Allow _PARAM0_ to rotate"),
                           GD_T("Rotation"),
                           "res/physics24.png",
                           "res/physics16.png")
                .AddParameter("object", GD_T("Object"))
                .AddParameter("automatism", GD_T("Automatism"), "PhysicsAutomatism")
                .AddCodeOnlyParameter("currentScene", "")
                .codeExtraInformation.SetFunctionName("SetFreeRotation").SetIncludeFile("PhysicsAutomatism/PhysicsAutomatism.h");

            aut.AddCondition("IsFixedRotation",
                           GD_T("Fixed rotation"),
                           GD_T("Test if object is rotation fixed."),
                           GD_T("_PARAM0_ is rotation fixed."),
                           GD_T("Rotation"),
                           "res/physics24.png",
                           "res/physics16.png")
                .AddParameter("object", GD_T("Object"))
                .AddParameter("automatism", GD_T("Automatism"), "PhysicsAutomatism")
                .AddCodeOnlyParameter("currentScene", "")
                .codeExtraInformation.SetFunctionName("IsFixedRotation").SetIncludeFile("PhysicsAutomatism/PhysicsAutomatism.h");

            aut.AddAction("SetAsBullet",
                           GD_T("Consider as a bullet."),
                           GD_T("Consider the object as a bullet, so as to have better collision handling."),
                           GD_T("Consider _PARAM0_ as a bullet"),
                           GD_T("Other"),
                           "res/physics24.png",
                           "res/physics16.png")
                .AddParameter("object", GD_T("Object"))
                .AddParameter("automatism", GD_T("Automatism"), "PhysicsAutomatism")
                .AddCodeOnlyParameter("currentScene", "")
                .codeExtraInformation.SetFunctionName("SetAsBullet").SetIncludeFile("PhysicsAutomatism/PhysicsAutomatism.h");

            aut.AddAction("DontSetAsBullet",
                           GD_T("Do not consider as a bullet"),
                           GD_T("Do not consider object as a bullet, so as to use standard collision handling."),
                           GD_T("Do not consider _PARAM0_ as a bullet."),
                           GD_T("Other"),
                           "res/physics24.png",
                           "res/physics16.png")
                .AddParameter("object", GD_T("Object"))
                .AddParameter("automatism", GD_T("Automatism"), "PhysicsAutomatism")
                .AddCodeOnlyParameter("currentScene", "")
                .codeExtraInformation.SetFunctionName("DontSetAsBullet").SetIncludeFile("PhysicsAutomatism/PhysicsAutomatism.h");

            aut.AddCondition("IsBullet",
                           GD_T("Object is considered as a bullet"),
                           GD_T("Test if object is considered as a bullet"),
                           GD_T("_PARAM0_ is considered as a bullet"),
                           GD_T("Other"),
                           "res/physics24.png",
                           "res/physics16.png")
                .AddParameter("object", GD_T("Object"))
                .AddParameter("automatism", GD_T("Automatism"), "PhysicsAutomatism")
                .AddCodeOnlyParameter("currentScene", "")
                .codeExtraInformation.SetFunctionName("IsBullet").SetIncludeFile("PhysicsAutomatism/PhysicsAutomatism.h");

            aut.AddAction("ApplyImpulse",
                           GD_T("Apply an impulse"),
                           GD_T("Apply an impulse to the object."),
                           GD_T("Apply to _PARAM0_ impulse _PARAM2_;_PARAM3_"),
                           GD_T("Displacement"),
                           "res/physics24.png",
                           "res/physics16.png")
                .AddParameter("object", GD_T("Object"))
                .AddParameter("automatism", GD_T("Automatism"), "PhysicsAutomatism")
                .AddParameter("expression", GD_T("X component ( Newtons/Seconds )"))
                .AddParameter("expression", GD_T("Y component ( Newtons/Seconds )"))
                .AddCodeOnlyParameter("currentScene", "")
                .codeExtraInformation.SetFunctionName("ApplyImpulse").SetIncludeFile("PhysicsAutomatism/PhysicsAutomatism.h");

            aut.AddAction("ApplyImpulseUsingPolarCoordinates",
                           GD_T("Apply an impulse (angle)"),
                           GD_T("Apply an impulse to an object, using a angle and a length as coordinates."),
                           GD_T("Apply to _PARAM0_ impulse _PARAM3_ with angle: _PARAM2_°"),
                           GD_T("Displacement"),
                           "res/physics24.png",
                           "res/physics16.png")
                .AddParameter("object", GD_T("Object"))
                .AddParameter("automatism", GD_T("Automatism"), "PhysicsAutomatism")
                .AddParameter("expression", GD_T("Angle"))
                .AddParameter("expression", GD_T("Impulse value ( Newton/seconds )"))
                .AddCodeOnlyParameter("currentScene", "")
                .codeExtraInformation.SetFunctionName("ApplyImpulseUsingPolarCoordinates").SetIncludeFile("PhysicsAutomatism/PhysicsAutomatism.h");

            aut.AddAction("ApplyImpulseTowardPosition",
                           GD_T("Apply an impulse toward a position"),
                           GD_T("Apply an impulse, directed toward a position, to the object."),
                           GD_T("Apply to _PARAM0_ impulse _PARAM4_ toward position _PARAM2_;_PARAM3_"),
                           GD_T("Displacement"),
                           "res/physics24.png",
                           "res/physics16.png")
                .AddParameter("object", GD_T("Object"))
                .AddParameter("automatism", GD_T("Automatism"), "PhysicsAutomatism")
                .AddParameter("expression", GD_T("X position"))
                .AddParameter("expression", GD_T("Y position"))
                .AddParameter("expression", GD_T("Impulse value ( Newton/seconds )"))
                .AddCodeOnlyParameter("currentScene", "")
                .codeExtraInformation.SetFunctionName("ApplyImpulseTowardPosition").SetIncludeFile("PhysicsAutomatism/PhysicsAutomatism.h");

            aut.AddAction("ApplyForce",
                           GD_T("Add a force"),
                           GD_T("Add a force to object"),
                           GD_T("Apply to _PARAM0_ force _PARAM2_;_PARAM3_"),
                           GD_T("Displacement"),
                           "res/physics24.png",
                           "res/physics16.png")
                .AddParameter("object", GD_T("Object"))
                .AddParameter("automatism", GD_T("Automatism"), "PhysicsAutomatism")
                .AddParameter("expression", GD_T("X component ( Newtons )"))
                .AddParameter("expression", GD_T("Y component ( Newtons )"))
                .AddCodeOnlyParameter("currentScene", "")
                .codeExtraInformation.SetFunctionName("ApplyForce").SetIncludeFile("PhysicsAutomatism/PhysicsAutomatism.h");

            aut.AddAction("ApplyForceUsingPolarCoordinates",
                           GD_T("Apply a force ( angle )"),
                           GD_T("Apply a force to an object, using an angle and a length as coordinates."),
                           GD_T("Apply to _PARAM0_ force _PARAM3_ at angle _PARAM2_"),
                           GD_T("Displacement"),
                           "res/physics24.png",
                           "res/physics16.png")
                .AddParameter("object", GD_T("Object"))
                .AddParameter("automatism", GD_T("Automatism"), "PhysicsAutomatism")
                .AddParameter("expression", GD_T("Angle"))
                .AddParameter("expression", GD_T("Length of the force ( Newtons )"))
                .AddCodeOnlyParameter("currentScene", "")
                .codeExtraInformation.SetFunctionName("ApplyForceUsingPolarCoordinates").SetIncludeFile("PhysicsAutomatism/PhysicsAutomatism.h");

            aut.AddAction("ApplyForceTowardPosition",
                           GD_T("Apply a force toward a position"),
                           GD_T("Apply a force, directed toward a position, to the object."),
                           GD_T("Add to _PARAM0_ force _PARAM4_ toward position _PARAM2_;_PARAM3_"),
                           GD_T("Displacement"),
                           "res/physics24.png",
                           "res/physics16.png")
                .AddParameter("object", GD_T("Object"))
                .AddParameter("automatism", GD_T("Automatism"), "PhysicsAutomatism")
                .AddParameter("expression", GD_T("X position"))
                .AddParameter("expression", GD_T("Y position"))
                .AddParameter("expression", GD_T("Length of the force ( Newtons )"))
                .AddCodeOnlyParameter("currentScene", "")
                .codeExtraInformation.SetFunctionName("ApplyForceTowardPosition").SetIncludeFile("PhysicsAutomatism/PhysicsAutomatism.h");

            aut.AddAction("ApplyTorque",
                           GD_T("Add a torque (a rotation)"),
                           GD_T("Add a torque (a rotation) to object."),
                           GD_T("Add to _PARAM0_ torque _PARAM2_"),
                           GD_T("Rotation"),
                           "res/physics24.png",
                           "res/physics16.png")
                .AddParameter("object", GD_T("Object"))
                .AddParameter("automatism", GD_T("Automatism"), "PhysicsAutomatism")
                .AddParameter("expression", GD_T("Torque value"))
                .AddCodeOnlyParameter("currentScene", "")
                .codeExtraInformation.SetFunctionName("ApplyTorque").SetIncludeFile("PhysicsAutomatism/PhysicsAutomatism.h");

            aut.AddAction("SetLinearVelocity",
                           GD_T("Linear velocity"),
                           GD_T("Modify velocity of an object."),
                           GD_T("Set linear velocity of _PARAM0_ to _PARAM2_;_PARAM3_"),
                           GD_T("Displacement"),
                           "res/physics24.png",
                           "res/physics16.png")
                .AddParameter("object", GD_T("Object"))
                .AddParameter("automatism", GD_T("Automatism"), "PhysicsAutomatism")
                .AddParameter("expression", GD_T("X Coordinate"))
                .AddParameter("expression", GD_T("Y Coordinate"))
                .AddCodeOnlyParameter("currentScene", "")
                .codeExtraInformation.SetFunctionName("SetLinearVelocity").SetIncludeFile("PhysicsAutomatism/PhysicsAutomatism.h");

            aut.AddCondition("LinearVelocityX",
                           GD_T("X component"),
                           GD_T("Compare the linear velocity on X axis of object."),
                           GD_T("Linear velocity on X axis of _PARAM0_ is _PARAM2__PARAM3_"),
                           GD_T("Displacement"),
                           "res/physics24.png",
                           "res/physics16.png")
                .AddParameter("object", GD_T("Object"))
                .AddParameter("automatism", GD_T("Automatism"), "PhysicsAutomatism")
                .AddParameter("relationalOperator", GD_T("Comparison sign"))
                .AddParameter("expression", GD_T("Value to test"))
                .AddCodeOnlyParameter("currentScene", "")
                .codeExtraInformation.SetFunctionName("GetLinearVelocityX").SetManipulatedType("number").SetIncludeFile("PhysicsAutomatism/PhysicsAutomatism.h");

            aut.AddCondition("LinearVelocityY",
                           GD_T("Y component"),
                           GD_T("Compare the linear velocity on Y axis of object."),
                           GD_T("Linear velocity on Y axis of _PARAM0_ is _PARAM2__PARAM3_"),
                           GD_T("Displacement"),
                           "res/physics24.png",
                           "res/physics16.png")
                .AddParameter("object", GD_T("Object"))
                .AddParameter("automatism", GD_T("Automatism"), "PhysicsAutomatism")
                .AddParameter("relationalOperator", GD_T("Comparison sign"))
                .AddParameter("expression", GD_T("Value to test"))
                .AddCodeOnlyParameter("currentScene", "")
                .codeExtraInformation.SetFunctionName("GetLinearVelocityY").SetManipulatedType("number").SetIncludeFile("PhysicsAutomatism/PhysicsAutomatism.h");

            aut.AddCondition("LinearVelocity",
                           GD_T("Linear speed"),
                           GD_T("Compare the linear velocity of the object."),
                           GD_T("Linear velocity of _PARAM0_ is _PARAM2__PARAM3_"),
                           GD_T("Displacement"),
                           "res/physics24.png",
                           "res/physics16.png")
                .AddParameter("object", GD_T("Object"))
                .AddParameter("automatism", GD_T("Automatism"), "PhysicsAutomatism")
                .AddParameter("relationalOperator", GD_T("Comparison sign"))
                .AddParameter("expression", GD_T("Value to test"))
                .AddCodeOnlyParameter("currentScene", "")
                .codeExtraInformation.SetFunctionName("GetLinearVelocity").SetManipulatedType("number").SetIncludeFile("PhysicsAutomatism/PhysicsAutomatism.h");

            aut.AddAction("SetAngularVelocity",
                           GD_T("Angular speed"),
                           GD_T("Modify angular velocity of object."),
                           GD_T("Set angular speed of _PARAM0_ to _PARAM2_"),
                           GD_T("Rotation"),
                           "res/physics24.png",
                           "res/physics16.png")
                .AddParameter("object", GD_T("Object"))
                .AddParameter("automatism", GD_T("Automatism"), "PhysicsAutomatism")
                .AddParameter("expression", GD_T("New value"))
                .AddCodeOnlyParameter("currentScene", "")
                .codeExtraInformation.SetFunctionName("SetAngularVelocity").SetIncludeFile("PhysicsAutomatism/PhysicsAutomatism.h");

            aut.AddCondition("AngularVelocity",
                           GD_T("Angular speed"),
                           GD_T("Compare the angular speed of the object."),
                           GD_T("Angular speed of _PARAM0_ is _PARAM2__PARAM3_"),
                           GD_T("Rotation"),
                           "res/physics24.png",
                           "res/physics16.png")
                .AddParameter("object", GD_T("Object"))
                .AddParameter("automatism", GD_T("Automatism"), "PhysicsAutomatism")
                .AddParameter("relationalOperator", GD_T("Comparison sign"))
                .AddParameter("expression", GD_T("Value to test"))
                .AddCodeOnlyParameter("currentScene", "")
                .codeExtraInformation.SetFunctionName("GetAngularVelocity").SetManipulatedType("number").SetIncludeFile("PhysicsAutomatism/PhysicsAutomatism.h");

            aut.AddCondition("LinearDamping",
                           GD_T("Linear damping"),
                           GD_T("Compare the linear damping of the object."),
                           GD_T("Linear damping of _PARAM0_ is _PARAM2__PARAM3_"),
                           GD_T("Displacement"),
                           "res/physics24.png",
                           "res/physics16.png")
                .AddParameter("object", GD_T("Object"))
                .AddParameter("automatism", GD_T("Automatism"), "PhysicsAutomatism")
                .AddParameter("relationalOperator", GD_T("Comparison sign"))
                .AddParameter("expression", GD_T("Value to test"))
                .AddCodeOnlyParameter("currentScene", "")
                .codeExtraInformation.SetFunctionName("GetLinearDamping").SetManipulatedType("number").SetIncludeFile("PhysicsAutomatism/PhysicsAutomatism.h");

            aut.AddCondition("CollisionWith",
                           GD_T("Collision"),
                           GD_T("Test if two objects are colliding.\nAttention! Only objects specified in the first parameter will be taken in account by the next actions and conditions, if they are colliding with the other objects."),
                           GD_T("_PARAM0_ is in collision with a _PARAM2_"),
                           "",
                           "res/physics24.png",
                           "res/physics16.png")
                .AddParameter("object", GD_T("Object"))
                .AddParameter("automatism", GD_T("Automatism"), "PhysicsAutomatism")
                .AddParameter("objectList", GD_T("Object"))
                .AddCodeOnlyParameter("currentScene", "")
                .codeExtraInformation.SetFunctionName("CollisionWith").SetIncludeFile("PhysicsAutomatism/PhysicsAutomatism.h");

            aut.AddAction("SetLinearDamping",
                           GD_T("Linear damping"),
                           GD_T("Modify linear damping of object."),
                           GD_T("Put linear damping of _PARAM0_ to _PARAM2_"),
                           GD_T("Displacement"),
                           "res/physics24.png",
                           "res/physics16.png")
                .AddParameter("object", GD_T("Object"))
                .AddParameter("automatism", GD_T("Automatism"), "PhysicsAutomatism")
                .AddParameter("expression", GD_T("Value"))
                .AddCodeOnlyParameter("currentScene", "")
                .codeExtraInformation.SetFunctionName("SetLinearDamping").SetIncludeFile("PhysicsAutomatism/PhysicsAutomatism.h");

            aut.AddCondition("AngularDamping",
                           GD_T("Angular damping"),
                           GD_T("Test object's angular damping"),
                           GD_T("Angular damping of _PARAM0_ is _PARAM2__PARAM3_"),
                           GD_T("Displacement"),
                           "res/physics24.png",
                           "res/physics16.png")
                .AddParameter("object", GD_T("Object"))
                .AddParameter("automatism", GD_T("Automatism"), "PhysicsAutomatism")
                .AddParameter("relationalOperator", GD_T("Comparison sign"))
                .AddParameter("expression", GD_T("Value to test"))
                .AddCodeOnlyParameter("currentScene", "")
                .codeExtraInformation.SetFunctionName("GetAngularDamping").SetManipulatedType("number").SetIncludeFile("PhysicsAutomatism/PhysicsAutomatism.h");

            aut.AddAction("SetAngularDamping",
                           GD_T("Angular damping"),
                           GD_T("Modify angular damping of object."),
                           GD_T("Set angular damping of _PARAM0_ to _PARAM2_"),
                           GD_T("Displacement"),
                           "res/physics24.png",
                           "res/physics16.png")
                .AddParameter("object", GD_T("Object"))
                .AddParameter("automatism", GD_T("Automatism"), "PhysicsAutomatism")
                .AddParameter("expression", GD_T("Value"))
                .AddCodeOnlyParameter("currentScene", "")
                .codeExtraInformation.SetFunctionName("SetAngularDamping").SetIncludeFile("PhysicsAutomatism/PhysicsAutomatism.h");

            aut.AddAction("SetGravity",
                           GD_T("Gravity"),
                           GD_T("Modify the gravity"),
                           GD_T("Set gravity force to _PARAM2_;_PARAM3_"),
                           GD_T("Global options"),
                           "res/physics24.png",
                           "res/physics16.png")
                .AddParameter("object", GD_T("Object"))
                .AddParameter("automatism", GD_T("Automatism"), "PhysicsAutomatism")
                .AddParameter("expression", GD_T("X Coordinate"))
                .AddParameter("expression", GD_T("Y Coordinate"))
                .AddCodeOnlyParameter("currentScene", "")
                .codeExtraInformation.SetFunctionName("SetGravity").SetIncludeFile("PhysicsAutomatism/PhysicsAutomatism.h");

            aut.AddAction("SetPolygonScaleX",
                           GD_T("Change collision polygon X scale"),
                           GD_T("Change the X scale of the polygon. Use a value greater than 1 to enlarge the polygon, less than 1 to reduce it."),
                           GD_T("Change collision polygon of _PARAM0_ X scale to _PARAM2_"),
                           GD_T("Collision polygon"),
                           "res/physics24.png",
                           "res/physics16.png")
                .AddParameter("object", GD_T("Object"))
                .AddParameter("automatism", GD_T("Automatism"), "PhysicsAutomatism")
                .AddParameter("expression", GD_T("Scale"))
                .AddCodeOnlyParameter("currentScene", "")
                .codeExtraInformation.SetFunctionName("SetPolygonScaleX").SetIncludeFile("PhysicsAutomatism/PhysicsAutomatism.h");

            aut.AddAction("SetPolygonScaleY",
                           GD_T("Change collision polygon Y scale"),
                           GD_T("Change the Y scale of the polygon. Use a value greater than 1 to enlarge the polygon, less than 1 to reduce it."),
                           GD_T("Change collision polygon of _PARAM0_ Y scale to _PARAM2_"),
                           GD_T("Collision polygon"),
                           "res/physics24.png",
                           "res/physics16.png")
                .AddParameter("object", GD_T("Object"))
                .AddParameter("automatism", GD_T("Automatism"), "PhysicsAutomatism")
                .AddParameter("expression", GD_T("Scale"))
                .AddCodeOnlyParameter("currentScene", "")
                .codeExtraInformation.SetFunctionName("SetPolygonScaleY").SetIncludeFile("PhysicsAutomatism/PhysicsAutomatism.h");

            aut.AddCondition("GetPolygonScaleX",
                           GD_T("Collision polygon X scale"),
                           GD_T("Test the value of the collision polygon X scale."),
                           GD_T("Collision polygon of _PARAM0_ X scale is _PARAM2__PARAM3_"),
                           GD_T("Collision polygon"),
                           "res/physics24.png",
                           "res/physics16.png")
                .AddParameter("object", GD_T("Object"))
                .AddParameter("automatism", GD_T("Automatism"), "PhysicsAutomatism")
                .AddParameter("relationalOperator", GD_T("Comparison sign"))
                .AddParameter("expression", GD_T("Value to test"))
                .AddCodeOnlyParameter("currentScene", "")
                .codeExtraInformation.SetFunctionName("GetPolygonScaleX").SetManipulatedType("number").SetIncludeFile("PhysicsAutomatism/PhysicsAutomatism.h");

            aut.AddCondition("GetPolygonScaleY",
                           GD_T("Collision polygon Y scale"),
                           GD_T("Test the value of the collision polygon Y scale."),
                           GD_T("Collision polygon of _PARAM0_ Y scale is _PARAM2__PARAM3_"),
                           GD_T("Collision polygon"),
                           "res/physics24.png",
                           "res/physics16.png")
                .AddParameter("object", GD_T("Object"))
                .AddParameter("automatism", GD_T("Automatism"), "PhysicsAutomatism")
                .AddParameter("relationalOperator", GD_T("Comparison sign"))
                .AddParameter("expression", GD_T("Value to test"))
                .AddCodeOnlyParameter("currentScene", "")
                .codeExtraInformation.SetFunctionName("GetPolygonScaleY").SetManipulatedType("number").SetIncludeFile("PhysicsAutomatism/PhysicsAutomatism.h");

            aut.AddExpression("PolygonScaleX", GD_T("Collision polygon X scale"), GD_T("Collision polygon X scale"), GD_T("Collision polygon"), "res/physics16.png")
                .AddParameter("object", GD_T("Object"))
                .AddParameter("automatism", GD_T("Automatism"), "PhysicsAutomatism")
                .AddCodeOnlyParameter("currentScene", "")
                .codeExtraInformation.SetFunctionName("GetPolygonScaleX").SetIncludeFile("PhysicsAutomatism/PhysicsAutomatism.h");

            aut.AddExpression("PolygonScaleY", GD_T("Collision polygon Y scale"), GD_T("Collision polygon Y scale"), GD_T("Collision polygon"), "res/physics16.png")
                .AddParameter("object", GD_T("Object"))
                .AddParameter("automatism", GD_T("Automatism"), "PhysicsAutomatism")
                .AddCodeOnlyParameter("currentScene", "")
                .codeExtraInformation.SetFunctionName("GetPolygonScaleY").SetIncludeFile("PhysicsAutomatism/PhysicsAutomatism.h");

            aut.AddExpression("LinearVelocity", GD_T("Linear speed"), GD_T("Linear speed"), GD_T("Displacement"), "res/physics16.png")
                .AddParameter("object", GD_T("Object"))
                .AddParameter("automatism", GD_T("Automatism"), "PhysicsAutomatism")
                .AddCodeOnlyParameter("currentScene", "")
                .codeExtraInformation.SetFunctionName("GetLinearVelocity").SetIncludeFile("PhysicsAutomatism/PhysicsAutomatism.h");

            aut.AddExpression("LinearVelocityX", GD_T("X component"), GD_T("X component"), GD_T("Displacement"), "res/physics16.png")
                .AddParameter("object", GD_T("Object"))
                .AddParameter("automatism", GD_T("Automatism"), "PhysicsAutomatism")
                .AddCodeOnlyParameter("currentScene", "")
                .codeExtraInformation.SetFunctionName("GetLinearVelocityX").SetIncludeFile("PhysicsAutomatism/PhysicsAutomatism.h");

            aut.AddExpression("LinearVelocityY", GD_T("Y component"), GD_T("Y component"), GD_T("Displacement"), "res/physics16.png")
                .AddParameter("object", GD_T("Object"))
                .AddParameter("automatism", GD_T("Automatism"), "PhysicsAutomatism")
                .AddCodeOnlyParameter("currentScene", "")
                .codeExtraInformation.SetFunctionName("GetLinearVelocityY").SetIncludeFile("PhysicsAutomatism/PhysicsAutomatism.h");

            aut.AddExpression("AngularVelocity", GD_T("Angular speed"), GD_T("Angular speed"), GD_T("Rotation"), "res/physics16.png")
                .AddParameter("object", GD_T("Object"))
                .AddParameter("automatism", GD_T("Automatism"), "PhysicsAutomatism")
                .AddCodeOnlyParameter("currentScene", "")
                .codeExtraInformation.SetFunctionName("GetAngularVelocity").SetIncludeFile("PhysicsAutomatism/PhysicsAutomatism.h");

            aut.AddExpression("LinearDamping", GD_T("Linear damping"), GD_T("Linear damping"), GD_T("Displacement"), "res/physics16.png")
                .AddParameter("object", GD_T("Object"))
                .AddParameter("automatism", GD_T("Automatism"), "PhysicsAutomatism")
                .AddCodeOnlyParameter("currentScene", "")
                .codeExtraInformation.SetFunctionName("GetLinearDamping").SetIncludeFile("PhysicsAutomatism/PhysicsAutomatism.h");

            aut.AddExpression("AngularDamping", GD_T("Angular damping"), GD_T("Angular damping"), GD_T("Rotation"), "res/physics16.png")
                .AddParameter("object", GD_T("Object"))
                .AddParameter("automatism", GD_T("Automatism"), "PhysicsAutomatism")
                .AddCodeOnlyParameter("currentScene", "")
                .codeExtraInformation.SetFunctionName("GetAngularDamping").SetIncludeFile("PhysicsAutomatism/PhysicsAutomatism.h");

            #endif

        }

        GD_COMPLETE_EXTENSION_COMPILATION_INFORMATION();
    };
};

/**
 * Used by GDevelop to create the extension class
 * -- Do not need to be modified. --
 */
extern "C" ExtensionBase * GD_EXTENSION_API CreateGDExtension() {
    return new Extension;
}

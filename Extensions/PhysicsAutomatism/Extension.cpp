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
                           _("Make the object static"),
                           _("Make object immovable."),
                           GD_T("Make _PARAM0_ static"),
                           _("Movement"),
                           "res/physics24.png",
                           "res/physics16.png")
                .AddParameter("object", GD_T("Object"))
                .AddParameter("automatism", GD_T("Automatism"), "PhysicsAutomatism")
                .AddCodeOnlyParameter("currentScene", "")
                .SetFunctionName("SetStatic").SetIncludeFile("PhysicsAutomatism/PhysicsAutomatism.h");

            aut.AddAction("SetDynamic",
                           _("Make the object dynamic"),
                           _("Make object dynamic ( affected by forces and other objects )."),
                           GD_T("Make _PARAM0_ dynamic"),
                           _("Movement"),
                           "res/physics24.png",
                           "res/physics16.png")
                .AddParameter("object", GD_T("Object"))
                .AddParameter("automatism", GD_T("Automatism"), "PhysicsAutomatism")
                .AddCodeOnlyParameter("currentScene", "")
                .SetFunctionName("SetDynamic").SetIncludeFile("PhysicsAutomatism/PhysicsAutomatism.h");

            aut.AddCondition("IsDynamic",
                           _("The object is dynamic"),
                           _("Test if an object is dynamic ( affected by forces and the other objects )."),
                           GD_T("_PARAM0_ is dynamic"),
                           _("Movement"),
                           "res/physics24.png",
                           "res/physics16.png")

                .AddParameter("object", GD_T("Object"))
                .AddParameter("automatism", GD_T("Automatism"), "PhysicsAutomatism")
                .SetFunctionName("IsDynamic").SetIncludeFile("PhysicsAutomatism/PhysicsAutomatism.h");

            aut.AddAction("SetFixedRotation",
                           _("Fix rotation"),
                           _("Prevent the object from rotating"),
                           GD_T("Fix rotation of _PARAM0_"),
                           _("Rotation"),
                           "res/physics24.png",
                           "res/physics16.png")
                .AddParameter("object", GD_T("Object"))
                .AddParameter("automatism", GD_T("Automatism"), "PhysicsAutomatism")
                .AddCodeOnlyParameter("currentScene", "")
                .SetFunctionName("SetFixedRotation").SetIncludeFile("PhysicsAutomatism/PhysicsAutomatism.h");

            aut.AddAction("AddRevoluteJoint",
                           _("Add a hinge"),
                           _("Add a hinge about which the object will rotate.\nDistance between hinge and object will remain identical."),
                           GD_T("Add a hinge to _PARAM0_ at _PARAM2_;_PARAM3_"),
                           _("Joints"),
                           "res/physics24.png",
                           "res/physics16.png")
                .AddParameter("object", GD_T("Object"))
                .AddParameter("automatism", GD_T("Automatism"), "PhysicsAutomatism")
                .AddParameter("expression", GD_T("Hinge X position"))
                .AddParameter("expression", GD_T("Hinge Y position"))
                .AddCodeOnlyParameter("currentScene", "")
                .SetFunctionName("AddRevoluteJoint").SetIncludeFile("PhysicsAutomatism/PhysicsAutomatism.h");

            aut.AddAction("AddRevoluteJointBetweenObjects",
                           _("Add a hinge between two objects"),
                           _("Add a hinge about which the object will rotate."),
                           GD_T("Add a hinge between _PARAM0_ and _PARAM2_"),
                           _("Joints"),
                           "res/physics24.png",
                           "res/physics16.png")
                .AddParameter("object", GD_T("Object"))
                .AddParameter("automatism", GD_T("Automatism"), "PhysicsAutomatism")
                .AddParameter("objectPtr", GD_T("Object"))
                .AddCodeOnlyParameter("currentScene", "")
                .AddParameter("expression", GD_T("X position of the hinge, from the first object mass center"), "", true).SetDefaultValue("0")
                .AddParameter("expression", GD_T("Y position of the hinge, from the first object mass center"), "", true).SetDefaultValue("0")
                .SetFunctionName("AddRevoluteJointBetweenObjects").SetIncludeFile("PhysicsAutomatism/PhysicsAutomatism.h");

            aut.AddAction("ActAddGearJointBetweenObjects",
                           _("Add a gear between two objects"),
                           _("Add a virtual gear between two objects."),
                           GD_T("Add a gear between _PARAM0_ and _PARAM2_"),
                           _("Joints"),
                           "res/physics24.png",
                           "res/physics16.png")
                .AddParameter("object", GD_T("Object"))
                .AddParameter("automatism", GD_T("Automatism"), "PhysicsAutomatism")
                .AddParameter("objectPtr", GD_T("Object"))
                .AddParameter("expression", GD_T("Ratio"), "", true).SetDefaultValue("1")
                .AddCodeOnlyParameter("currentScene", "")
                .SetFunctionName("AddGearJointBetweenObjects").SetIncludeFile("PhysicsAutomatism/PhysicsAutomatism.h");

            aut.AddAction("SetFreeRotation",
                           _("Make object's rotation free"),
                           _("Allows object to rotate."),
                           GD_T("Allow _PARAM0_ to rotate"),
                           _("Rotation"),
                           "res/physics24.png",
                           "res/physics16.png")
                .AddParameter("object", GD_T("Object"))
                .AddParameter("automatism", GD_T("Automatism"), "PhysicsAutomatism")
                .AddCodeOnlyParameter("currentScene", "")
                .SetFunctionName("SetFreeRotation").SetIncludeFile("PhysicsAutomatism/PhysicsAutomatism.h");

            aut.AddCondition("IsFixedRotation",
                           _("Fixed rotation"),
                           _("Test if object is rotation fixed."),
                           GD_T("_PARAM0_ is rotation fixed."),
                           _("Rotation"),
                           "res/physics24.png",
                           "res/physics16.png")
                .AddParameter("object", GD_T("Object"))
                .AddParameter("automatism", GD_T("Automatism"), "PhysicsAutomatism")
                .AddCodeOnlyParameter("currentScene", "")
                .SetFunctionName("IsFixedRotation").SetIncludeFile("PhysicsAutomatism/PhysicsAutomatism.h");

            aut.AddAction("SetAsBullet",
                           _("Consider as a bullet."),
                           _("Consider the object as a bullet, so as to have better collision handling."),
                           GD_T("Consider _PARAM0_ as a bullet"),
                           _("Other"),
                           "res/physics24.png",
                           "res/physics16.png")
                .AddParameter("object", GD_T("Object"))
                .AddParameter("automatism", GD_T("Automatism"), "PhysicsAutomatism")
                .AddCodeOnlyParameter("currentScene", "")
                .SetFunctionName("SetAsBullet").SetIncludeFile("PhysicsAutomatism/PhysicsAutomatism.h");

            aut.AddAction("DontSetAsBullet",
                           _("Do not consider as a bullet"),
                           _("Do not consider object as a bullet, so as to use standard collision handling."),
                           GD_T("Do not consider _PARAM0_ as a bullet."),
                           _("Other"),
                           "res/physics24.png",
                           "res/physics16.png")
                .AddParameter("object", GD_T("Object"))
                .AddParameter("automatism", GD_T("Automatism"), "PhysicsAutomatism")
                .AddCodeOnlyParameter("currentScene", "")
                .SetFunctionName("DontSetAsBullet").SetIncludeFile("PhysicsAutomatism/PhysicsAutomatism.h");

            aut.AddCondition("IsBullet",
                           _("Object is considered as a bullet"),
                           _("Test if object is considered as a bullet"),
                           GD_T("_PARAM0_ is considered as a bullet"),
                           _("Other"),
                           "res/physics24.png",
                           "res/physics16.png")
                .AddParameter("object", GD_T("Object"))
                .AddParameter("automatism", GD_T("Automatism"), "PhysicsAutomatism")
                .AddCodeOnlyParameter("currentScene", "")
                .SetFunctionName("IsBullet").SetIncludeFile("PhysicsAutomatism/PhysicsAutomatism.h");

            aut.AddAction("ApplyImpulse",
                           _("Apply an impulse"),
                           _("Apply an impulse to the object."),
                           GD_T("Apply to _PARAM0_ impulse _PARAM2_;_PARAM3_"),
                           _("Displacement"),
                           "res/physics24.png",
                           "res/physics16.png")
                .AddParameter("object", GD_T("Object"))
                .AddParameter("automatism", GD_T("Automatism"), "PhysicsAutomatism")
                .AddParameter("expression", GD_T("X component ( Newtons/Seconds )"))
                .AddParameter("expression", GD_T("Y component ( Newtons/Seconds )"))
                .AddCodeOnlyParameter("currentScene", "")
                .SetFunctionName("ApplyImpulse").SetIncludeFile("PhysicsAutomatism/PhysicsAutomatism.h");

            aut.AddAction("ApplyImpulseUsingPolarCoordinates",
                           _("Apply an impulse (angle)"),
                           _("Apply an impulse to an object, using a angle and a length as coordinates."),
                           GD_T("Apply to _PARAM0_ impulse _PARAM3_ with angle: _PARAM2_°"),
                           _("Displacement"),
                           "res/physics24.png",
                           "res/physics16.png")
                .AddParameter("object", GD_T("Object"))
                .AddParameter("automatism", GD_T("Automatism"), "PhysicsAutomatism")
                .AddParameter("expression", GD_T("Angle"))
                .AddParameter("expression", GD_T("Impulse value ( Newton/seconds )"))
                .AddCodeOnlyParameter("currentScene", "")
                .SetFunctionName("ApplyImpulseUsingPolarCoordinates").SetIncludeFile("PhysicsAutomatism/PhysicsAutomatism.h");

            aut.AddAction("ApplyImpulseTowardPosition",
                           _("Apply an impulse toward a position"),
                           _("Apply an impulse, directed toward a position, to the object."),
                           GD_T("Apply to _PARAM0_ impulse _PARAM4_ toward position _PARAM2_;_PARAM3_"),
                           _("Displacement"),
                           "res/physics24.png",
                           "res/physics16.png")
                .AddParameter("object", GD_T("Object"))
                .AddParameter("automatism", GD_T("Automatism"), "PhysicsAutomatism")
                .AddParameter("expression", GD_T("X position"))
                .AddParameter("expression", GD_T("Y position"))
                .AddParameter("expression", GD_T("Impulse value ( Newton/seconds )"))
                .AddCodeOnlyParameter("currentScene", "")
                .SetFunctionName("ApplyImpulseTowardPosition").SetIncludeFile("PhysicsAutomatism/PhysicsAutomatism.h");

            aut.AddAction("ApplyForce",
                           _("Add a force"),
                           _("Add a force to object"),
                           GD_T("Apply to _PARAM0_ force _PARAM2_;_PARAM3_"),
                           _("Displacement"),
                           "res/physics24.png",
                           "res/physics16.png")
                .AddParameter("object", GD_T("Object"))
                .AddParameter("automatism", GD_T("Automatism"), "PhysicsAutomatism")
                .AddParameter("expression", GD_T("X component ( Newtons )"))
                .AddParameter("expression", GD_T("Y component ( Newtons )"))
                .AddCodeOnlyParameter("currentScene", "")
                .SetFunctionName("ApplyForce").SetIncludeFile("PhysicsAutomatism/PhysicsAutomatism.h");

            aut.AddAction("ApplyForceUsingPolarCoordinates",
                           _("Apply a force ( angle )"),
                           _("Apply a force to an object, using an angle and a length as coordinates."),
                           GD_T("Apply to _PARAM0_ force _PARAM3_ at angle _PARAM2_"),
                           _("Displacement"),
                           "res/physics24.png",
                           "res/physics16.png")
                .AddParameter("object", GD_T("Object"))
                .AddParameter("automatism", GD_T("Automatism"), "PhysicsAutomatism")
                .AddParameter("expression", GD_T("Angle"))
                .AddParameter("expression", GD_T("Length of the force ( Newtons )"))
                .AddCodeOnlyParameter("currentScene", "")
                .SetFunctionName("ApplyForceUsingPolarCoordinates").SetIncludeFile("PhysicsAutomatism/PhysicsAutomatism.h");

            aut.AddAction("ApplyForceTowardPosition",
                           _("Apply a force toward a position"),
                           _("Apply a force, directed toward a position, to the object."),
                           GD_T("Add to _PARAM0_ force _PARAM4_ toward position _PARAM2_;_PARAM3_"),
                           _("Displacement"),
                           "res/physics24.png",
                           "res/physics16.png")
                .AddParameter("object", GD_T("Object"))
                .AddParameter("automatism", GD_T("Automatism"), "PhysicsAutomatism")
                .AddParameter("expression", GD_T("X position"))
                .AddParameter("expression", GD_T("Y position"))
                .AddParameter("expression", GD_T("Length of the force ( Newtons )"))
                .AddCodeOnlyParameter("currentScene", "")
                .SetFunctionName("ApplyForceTowardPosition").SetIncludeFile("PhysicsAutomatism/PhysicsAutomatism.h");

            aut.AddAction("ApplyTorque",
                           _("Add a torque (a rotation)"),
                           _("Add a torque (a rotation) to object."),
                           GD_T("Add to _PARAM0_ torque _PARAM2_"),
                           _("Rotation"),
                           "res/physics24.png",
                           "res/physics16.png")
                .AddParameter("object", GD_T("Object"))
                .AddParameter("automatism", GD_T("Automatism"), "PhysicsAutomatism")
                .AddParameter("expression", GD_T("Torque value"))
                .AddCodeOnlyParameter("currentScene", "")
                .SetFunctionName("ApplyTorque").SetIncludeFile("PhysicsAutomatism/PhysicsAutomatism.h");

            aut.AddAction("SetLinearVelocity",
                           _("Linear velocity"),
                           _("Modify velocity of an object."),
                           GD_T("Set linear velocity of _PARAM0_ to _PARAM2_;_PARAM3_"),
                           _("Displacement"),
                           "res/physics24.png",
                           "res/physics16.png")
                .AddParameter("object", GD_T("Object"))
                .AddParameter("automatism", GD_T("Automatism"), "PhysicsAutomatism")
                .AddParameter("expression", GD_T("X Coordinate"))
                .AddParameter("expression", GD_T("Y Coordinate"))
                .AddCodeOnlyParameter("currentScene", "")
                .SetFunctionName("SetLinearVelocity").SetIncludeFile("PhysicsAutomatism/PhysicsAutomatism.h");

            aut.AddCondition("LinearVelocityX",
                           _("X component"),
                           _("Compare the linear velocity on X axis of object."),
                           GD_T("Linear velocity on X axis of _PARAM0_ is _PARAM2__PARAM3_"),
                           _("Displacement"),
                           "res/physics24.png",
                           "res/physics16.png")
                .AddParameter("object", GD_T("Object"))
                .AddParameter("automatism", GD_T("Automatism"), "PhysicsAutomatism")
                .AddParameter("relationalOperator", GD_T("Comparison sign"))
                .AddParameter("expression", GD_T("Value to test"))
                .AddCodeOnlyParameter("currentScene", "")
                .SetFunctionName("GetLinearVelocityX").SetManipulatedType("number").SetIncludeFile("PhysicsAutomatism/PhysicsAutomatism.h");

            aut.AddCondition("LinearVelocityY",
                           _("Y component"),
                           _("Compare the linear velocity on Y axis of object."),
                           GD_T("Linear velocity on Y axis of _PARAM0_ is _PARAM2__PARAM3_"),
                           _("Displacement"),
                           "res/physics24.png",
                           "res/physics16.png")
                .AddParameter("object", GD_T("Object"))
                .AddParameter("automatism", GD_T("Automatism"), "PhysicsAutomatism")
                .AddParameter("relationalOperator", GD_T("Comparison sign"))
                .AddParameter("expression", GD_T("Value to test"))
                .AddCodeOnlyParameter("currentScene", "")
                .SetFunctionName("GetLinearVelocityY").SetManipulatedType("number").SetIncludeFile("PhysicsAutomatism/PhysicsAutomatism.h");

            aut.AddCondition("LinearVelocity",
                           _("Linear speed"),
                           _("Compare the linear velocity of the object."),
                           GD_T("Linear velocity of _PARAM0_ is _PARAM2__PARAM3_"),
                           _("Displacement"),
                           "res/physics24.png",
                           "res/physics16.png")
                .AddParameter("object", GD_T("Object"))
                .AddParameter("automatism", GD_T("Automatism"), "PhysicsAutomatism")
                .AddParameter("relationalOperator", GD_T("Comparison sign"))
                .AddParameter("expression", GD_T("Value to test"))
                .AddCodeOnlyParameter("currentScene", "")
                .SetFunctionName("GetLinearVelocity").SetManipulatedType("number").SetIncludeFile("PhysicsAutomatism/PhysicsAutomatism.h");

            aut.AddAction("SetAngularVelocity",
                           _("Angular speed"),
                           _("Modify angular velocity of object."),
                           GD_T("Set angular speed of _PARAM0_ to _PARAM2_"),
                           _("Rotation"),
                           "res/physics24.png",
                           "res/physics16.png")
                .AddParameter("object", GD_T("Object"))
                .AddParameter("automatism", GD_T("Automatism"), "PhysicsAutomatism")
                .AddParameter("expression", GD_T("New value"))
                .AddCodeOnlyParameter("currentScene", "")
                .SetFunctionName("SetAngularVelocity").SetIncludeFile("PhysicsAutomatism/PhysicsAutomatism.h");

            aut.AddCondition("AngularVelocity",
                           _("Angular speed"),
                           _("Compare the angular speed of the object."),
                           GD_T("Angular speed of _PARAM0_ is _PARAM2__PARAM3_"),
                           _("Rotation"),
                           "res/physics24.png",
                           "res/physics16.png")
                .AddParameter("object", GD_T("Object"))
                .AddParameter("automatism", GD_T("Automatism"), "PhysicsAutomatism")
                .AddParameter("relationalOperator", GD_T("Comparison sign"))
                .AddParameter("expression", GD_T("Value to test"))
                .AddCodeOnlyParameter("currentScene", "")
                .SetFunctionName("GetAngularVelocity").SetManipulatedType("number").SetIncludeFile("PhysicsAutomatism/PhysicsAutomatism.h");

            aut.AddCondition("LinearDamping",
                           _("Linear damping"),
                           _("Compare the linear damping of the object."),
                           GD_T("Linear damping of _PARAM0_ is _PARAM2__PARAM3_"),
                           _("Displacement"),
                           "res/physics24.png",
                           "res/physics16.png")
                .AddParameter("object", GD_T("Object"))
                .AddParameter("automatism", GD_T("Automatism"), "PhysicsAutomatism")
                .AddParameter("relationalOperator", GD_T("Comparison sign"))
                .AddParameter("expression", GD_T("Value to test"))
                .AddCodeOnlyParameter("currentScene", "")
                .SetFunctionName("GetLinearDamping").SetManipulatedType("number").SetIncludeFile("PhysicsAutomatism/PhysicsAutomatism.h");

            aut.AddCondition("CollisionWith",
                           _("Collision"),
                           _("Test if two objects are colliding.\nAttention! Only objects specified in the first parameter will be taken in account by the next actions and conditions, if they are colliding with the other objects."),
                           GD_T("_PARAM0_ is in collision with a _PARAM2_"),
                           _(""),
                           "res/physics24.png",
                           "res/physics16.png")
                .AddParameter("object", GD_T("Object"))
                .AddParameter("automatism", GD_T("Automatism"), "PhysicsAutomatism")
                .AddParameter("objectList", GD_T("Object"))
                .AddCodeOnlyParameter("currentScene", "")
                .SetFunctionName("CollisionWith").SetIncludeFile("PhysicsAutomatism/PhysicsAutomatism.h");

            aut.AddAction("SetLinearDamping",
                           _("Linear damping"),
                           _("Modify linear damping of object."),
                           GD_T("Put linear damping of _PARAM0_ to _PARAM2_"),
                           _("Displacement"),
                           "res/physics24.png",
                           "res/physics16.png")
                .AddParameter("object", GD_T("Object"))
                .AddParameter("automatism", GD_T("Automatism"), "PhysicsAutomatism")
                .AddParameter("expression", GD_T("Value"))
                .AddCodeOnlyParameter("currentScene", "")
                .SetFunctionName("SetLinearDamping").SetIncludeFile("PhysicsAutomatism/PhysicsAutomatism.h");

            aut.AddCondition("AngularDamping",
                           _("Angular damping"),
                           _("Test object's angular damping"),
                           GD_T("Angular damping of _PARAM0_ is _PARAM2__PARAM3_"),
                           _("Displacement"),
                           "res/physics24.png",
                           "res/physics16.png")
                .AddParameter("object", GD_T("Object"))
                .AddParameter("automatism", GD_T("Automatism"), "PhysicsAutomatism")
                .AddParameter("relationalOperator", GD_T("Comparison sign"))
                .AddParameter("expression", GD_T("Value to test"))
                .AddCodeOnlyParameter("currentScene", "")
                .SetFunctionName("GetAngularDamping").SetManipulatedType("number").SetIncludeFile("PhysicsAutomatism/PhysicsAutomatism.h");

            aut.AddAction("SetAngularDamping",
                           _("Angular damping"),
                           _("Modify angular damping of object."),
                           GD_T("Set angular damping of _PARAM0_ to _PARAM2_"),
                           _("Displacement"),
                           "res/physics24.png",
                           "res/physics16.png")
                .AddParameter("object", GD_T("Object"))
                .AddParameter("automatism", GD_T("Automatism"), "PhysicsAutomatism")
                .AddParameter("expression", GD_T("Value"))
                .AddCodeOnlyParameter("currentScene", "")
                .SetFunctionName("SetAngularDamping").SetIncludeFile("PhysicsAutomatism/PhysicsAutomatism.h");

            aut.AddAction("SetGravity",
                           _("Gravity"),
                           _("Modify the gravity"),
                           GD_T("Set gravity force to _PARAM2_;_PARAM3_"),
                           _("Global options"),
                           "res/physics24.png",
                           "res/physics16.png")
                .AddParameter("object", GD_T("Object"))
                .AddParameter("automatism", GD_T("Automatism"), "PhysicsAutomatism")
                .AddParameter("expression", GD_T("X Coordinate"))
                .AddParameter("expression", GD_T("Y Coordinate"))
                .AddCodeOnlyParameter("currentScene", "")
                .SetFunctionName("SetGravity").SetIncludeFile("PhysicsAutomatism/PhysicsAutomatism.h");

            aut.AddAction("SetPolygonScaleX",
                           _("Change collision polygon X scale"),
                           _("Change the X scale of the polygon. Use a value greater than 1 to enlarge the polygon, less than 1 to reduce it."),
                           GD_T("Change collision polygon of _PARAM0_ X scale to _PARAM2_"),
                           _("Collision polygon"),
                           "res/physics24.png",
                           "res/physics16.png")
                .AddParameter("object", GD_T("Object"))
                .AddParameter("automatism", GD_T("Automatism"), "PhysicsAutomatism")
                .AddParameter("expression", GD_T("Scale"))
                .AddCodeOnlyParameter("currentScene", "")
                .SetFunctionName("SetPolygonScaleX").SetIncludeFile("PhysicsAutomatism/PhysicsAutomatism.h");

            aut.AddAction("SetPolygonScaleY",
                           _("Change collision polygon Y scale"),
                           _("Change the Y scale of the polygon. Use a value greater than 1 to enlarge the polygon, less than 1 to reduce it."),
                           GD_T("Change collision polygon of _PARAM0_ Y scale to _PARAM2_"),
                           _("Collision polygon"),
                           "res/physics24.png",
                           "res/physics16.png")
                .AddParameter("object", GD_T("Object"))
                .AddParameter("automatism", GD_T("Automatism"), "PhysicsAutomatism")
                .AddParameter("expression", GD_T("Scale"))
                .AddCodeOnlyParameter("currentScene", "")
                .SetFunctionName("SetPolygonScaleY").SetIncludeFile("PhysicsAutomatism/PhysicsAutomatism.h");

            aut.AddCondition("GetPolygonScaleX",
                           _("Collision polygon X scale"),
                           _("Test the value of the collision polygon X scale."),
                           GD_T("Collision polygon of _PARAM0_ X scale is _PARAM2__PARAM3_"),
                           _("Collision polygon"),
                           "res/physics24.png",
                           "res/physics16.png")
                .AddParameter("object", GD_T("Object"))
                .AddParameter("automatism", GD_T("Automatism"), "PhysicsAutomatism")
                .AddParameter("relationalOperator", GD_T("Comparison sign"))
                .AddParameter("expression", GD_T("Value to test"))
                .AddCodeOnlyParameter("currentScene", "")
                .SetFunctionName("GetPolygonScaleX").SetManipulatedType("number").SetIncludeFile("PhysicsAutomatism/PhysicsAutomatism.h");

            aut.AddCondition("GetPolygonScaleY",
                           _("Collision polygon Y scale"),
                           _("Test the value of the collision polygon Y scale."),
                           GD_T("Collision polygon of _PARAM0_ Y scale is _PARAM2__PARAM3_"),
                           _("Collision polygon"),
                           "res/physics24.png",
                           "res/physics16.png")
                .AddParameter("object", GD_T("Object"))
                .AddParameter("automatism", GD_T("Automatism"), "PhysicsAutomatism")
                .AddParameter("relationalOperator", GD_T("Comparison sign"))
                .AddParameter("expression", GD_T("Value to test"))
                .AddCodeOnlyParameter("currentScene", "")
                .SetFunctionName("GetPolygonScaleY").SetManipulatedType("number").SetIncludeFile("PhysicsAutomatism/PhysicsAutomatism.h");

            aut.AddExpression("PolygonScaleX", GD_T("Collision polygon X scale"), GD_T("Collision polygon X scale"), GD_T("Collision polygon"), "res/physics16.png")
                .AddParameter("object", GD_T("Object"))
                .AddParameter("automatism", GD_T("Automatism"), "PhysicsAutomatism")
                .AddCodeOnlyParameter("currentScene", "")
                .SetFunctionName("GetPolygonScaleX").SetIncludeFile("PhysicsAutomatism/PhysicsAutomatism.h");

            aut.AddExpression("PolygonScaleY", GD_T("Collision polygon Y scale"), GD_T("Collision polygon Y scale"), GD_T("Collision polygon"), "res/physics16.png")
                .AddParameter("object", GD_T("Object"))
                .AddParameter("automatism", GD_T("Automatism"), "PhysicsAutomatism")
                .AddCodeOnlyParameter("currentScene", "")
                .SetFunctionName("GetPolygonScaleY").SetIncludeFile("PhysicsAutomatism/PhysicsAutomatism.h");

            aut.AddExpression("LinearVelocity", GD_T("Linear speed"), GD_T("Linear speed"), GD_T("Displacement"), "res/physics16.png")
                .AddParameter("object", GD_T("Object"))
                .AddParameter("automatism", GD_T("Automatism"), "PhysicsAutomatism")
                .AddCodeOnlyParameter("currentScene", "")
                .SetFunctionName("GetLinearVelocity").SetIncludeFile("PhysicsAutomatism/PhysicsAutomatism.h");

            aut.AddExpression("LinearVelocityX", GD_T("X component"), GD_T("X component"), GD_T("Displacement"), "res/physics16.png")
                .AddParameter("object", GD_T("Object"))
                .AddParameter("automatism", GD_T("Automatism"), "PhysicsAutomatism")
                .AddCodeOnlyParameter("currentScene", "")
                .SetFunctionName("GetLinearVelocityX").SetIncludeFile("PhysicsAutomatism/PhysicsAutomatism.h");

            aut.AddExpression("LinearVelocityY", GD_T("Y component"), GD_T("Y component"), GD_T("Displacement"), "res/physics16.png")
                .AddParameter("object", GD_T("Object"))
                .AddParameter("automatism", GD_T("Automatism"), "PhysicsAutomatism")
                .AddCodeOnlyParameter("currentScene", "")
                .SetFunctionName("GetLinearVelocityY").SetIncludeFile("PhysicsAutomatism/PhysicsAutomatism.h");

            aut.AddExpression("AngularVelocity", GD_T("Angular speed"), GD_T("Angular speed"), GD_T("Rotation"), "res/physics16.png")
                .AddParameter("object", GD_T("Object"))
                .AddParameter("automatism", GD_T("Automatism"), "PhysicsAutomatism")
                .AddCodeOnlyParameter("currentScene", "")
                .SetFunctionName("GetAngularVelocity").SetIncludeFile("PhysicsAutomatism/PhysicsAutomatism.h");

            aut.AddExpression("LinearDamping", GD_T("Linear damping"), GD_T("Linear damping"), GD_T("Displacement"), "res/physics16.png")
                .AddParameter("object", GD_T("Object"))
                .AddParameter("automatism", GD_T("Automatism"), "PhysicsAutomatism")
                .AddCodeOnlyParameter("currentScene", "")
                .SetFunctionName("GetLinearDamping").SetIncludeFile("PhysicsAutomatism/PhysicsAutomatism.h");

            aut.AddExpression("AngularDamping", GD_T("Angular damping"), GD_T("Angular damping"), GD_T("Rotation"), "res/physics16.png")
                .AddParameter("object", GD_T("Object"))
                .AddParameter("automatism", GD_T("Automatism"), "PhysicsAutomatism")
                .AddCodeOnlyParameter("currentScene", "")
                .SetFunctionName("GetAngularDamping").SetIncludeFile("PhysicsAutomatism/PhysicsAutomatism.h");

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

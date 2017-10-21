/**

GDevelop - Physics Behavior Extension
Copyright (c) 2010-2016 Florian Rival (Florian.Rival@gmail.com)
This project is released under the MIT License.
*/
/**
 * Contributors to the extension:
 * Victor Levasseur ( Collisions using custom polygons, fixed time step fix )
 */


#include "PhysicsBehavior.h"
#include "ScenePhysicsDatas.h"

#include "GDCpp/Extensions/ExtensionBase.h"

/**
 * \brief This class declares information about the extension.
 */
class PhysicsBehaviorCppExtension : public ExtensionBase
{
public:

    /**
     * Constructor of an extension declares everything the extension contains: objects, actions, conditions and expressions.
     */
    PhysicsBehaviorCppExtension()
    {
        SetExtensionInformation("PhysicsBehavior",
                              _("Physics behavior"),
                              _("This extension enables the movement of objects as if they are subject to the laws of physics."),
                              "Florian Rival",
                              "Open source (MIT License)");

        {
            gd::BehaviorMetadata & aut = AddBehavior("PhysicsBehavior",
                  _("Physics engine"),
                  _("Physics"),
                  _("Make objects move as if they are subject to the laws of physics."),
                  "",
                  "res/physics32.png",
                  "PhysicsBehavior",
                  std::make_shared<PhysicsBehavior>(),
                  std::make_shared<ScenePhysicsDatas>());

            #if defined(GD_IDE_ONLY)
            aut.SetIncludeFile("PhysicsBehavior/PhysicsBehavior.h");

            aut.AddAction("SetStatic",
                           _("Make the object static"),
                           _("Make the object immovable."),
                           _("Make _PARAM0_ static"),
                           _("Movement"),
                           "res/physics24.png",
                           "res/physics16.png")
                .AddParameter("object", _("Object"))
                .AddParameter("behavior", _("Behavior"), "PhysicsBehavior")
                .AddCodeOnlyParameter("currentScene", "")
                .SetFunctionName("SetStatic").SetIncludeFile("PhysicsBehavior/PhysicsBehavior.h");

            aut.AddAction("SetDynamic",
                           _("Make the object dynamic"),
                           _("Make the object dynamic ( affected by forces and other objects )."),
                           _("Make _PARAM0_ dynamic"),
                           _("Movement"),
                           "res/physics24.png",
                           "res/physics16.png")
                .AddParameter("object", _("Object"))
                .AddParameter("behavior", _("Behavior"), "PhysicsBehavior")
                .AddCodeOnlyParameter("currentScene", "")
                .SetFunctionName("SetDynamic").SetIncludeFile("PhysicsBehavior/PhysicsBehavior.h");

            aut.AddCondition("IsDynamic",
                           _("The object is dynamic"),
                           _("Test if an object is dynamic ( affected by forces and other objects )."),
                           _("_PARAM0_ is dynamic"),
                           _("Movement"),
                           "res/physics24.png",
                           "res/physics16.png")

                .AddParameter("object", _("Object"))
                .AddParameter("behavior", _("Behavior"), "PhysicsBehavior")
                .SetFunctionName("IsDynamic").SetIncludeFile("PhysicsBehavior/PhysicsBehavior.h");

            aut.AddAction("SetFixedRotation",
                           _("Fix rotation"),
                           _("Prevent the object from rotating"),
                           _("Fix rotation of _PARAM0_"),
                           _("Rotation"),
                           "res/physics24.png",
                           "res/physics16.png")
                .AddParameter("object", _("Object"))
                .AddParameter("behavior", _("Behavior"), "PhysicsBehavior")
                .AddCodeOnlyParameter("currentScene", "")
                .SetFunctionName("SetFixedRotation").SetIncludeFile("PhysicsBehavior/PhysicsBehavior.h");

            aut.AddAction("AddRevoluteJoint",
                           _("Add a hinge"),
                           _("Add a hinge that the object will rotate around.\nThe distance between the hinge and the object will remain identical."),
                           _("Add a hinge to _PARAM0_ at _PARAM2_;_PARAM3_"),
                           _("Joints"),
                           "res/physics24.png",
                           "res/physics16.png")
                .AddParameter("object", _("Object"))
                .AddParameter("behavior", _("Behavior"), "PhysicsBehavior")
                .AddParameter("expression", _("Hinge X position"))
                .AddParameter("expression", _("Hinge Y position"))
                .AddCodeOnlyParameter("currentScene", "")
                .SetFunctionName("AddRevoluteJoint").SetIncludeFile("PhysicsBehavior/PhysicsBehavior.h");

            aut.AddAction("AddRevoluteJointBetweenObjects",
                           _("Add a hinge between two objects"),
                           _("Add a hinge that the object will rotate around."),
                           _("Add a hinge between _PARAM0_ and _PARAM2_"),
                           _("Joints"),
                           "res/physics24.png",
                           "res/physics16.png")
                .AddParameter("object", _("Object"))
                .AddParameter("behavior", _("Behavior"), "PhysicsBehavior")
                .AddParameter("objectPtr", _("Object"))
                .AddCodeOnlyParameter("currentScene", "")
                .AddParameter("expression", _("X position of the hinge, from the first object mass center"), "", true).SetDefaultValue("0")
                .AddParameter("expression", _("Y position of the hinge, from the first object mass center"), "", true).SetDefaultValue("0")
                .SetFunctionName("AddRevoluteJointBetweenObjects").SetIncludeFile("PhysicsBehavior/PhysicsBehavior.h");

            aut.AddAction("ActAddGearJointBetweenObjects",
                           _("Add a gear between two objects"),
                           _("Add a virtual gear between two objects."),
                           _("Add a gear between _PARAM0_ and _PARAM2_"),
                           _("Joints"),
                           "res/physics24.png",
                           "res/physics16.png")
                .AddParameter("object", _("Object"))
                .AddParameter("behavior", _("Behavior"), "PhysicsBehavior")
                .AddParameter("objectPtr", _("Object"))
                .AddParameter("expression", _("Ratio"), "", true).SetDefaultValue("1")
                .AddCodeOnlyParameter("currentScene", "")
                .SetFunctionName("AddGearJointBetweenObjects").SetIncludeFile("PhysicsBehavior/PhysicsBehavior.h");

            aut.AddAction("SetFreeRotation",
                           _("Make object's rotation free"),
                           _("Allows the object to rotate."),
                           _("Allow _PARAM0_ to rotate"),
                           _("Rotation"),
                           "res/physics24.png",
                           "res/physics16.png")
                .AddParameter("object", _("Object"))
                .AddParameter("behavior", _("Behavior"), "PhysicsBehavior")
                .AddCodeOnlyParameter("currentScene", "")
                .SetFunctionName("SetFreeRotation").SetIncludeFile("PhysicsBehavior/PhysicsBehavior.h");

            aut.AddCondition("IsFixedRotation",
                           _("Fixed rotation"),
                           _("Test if the object's rotation is fixed."),
                           _("The rotation of _PARAM0_ is fixed."),
                           _("Rotation"),
                           "res/physics24.png",
                           "res/physics16.png")
                .AddParameter("object", _("Object"))
                .AddParameter("behavior", _("Behavior"), "PhysicsBehavior")
                .AddCodeOnlyParameter("currentScene", "")
                .SetFunctionName("IsFixedRotation").SetIncludeFile("PhysicsBehavior/PhysicsBehavior.h");

            aut.AddAction("SetAsBullet",
                           _("Treat object like a bullet."),
                           _("Treat the object like a bullet, so it will have better collision handling."),
                           _("Consider _PARAM0_ as a bullet"),
                           _("Other"),
                           "res/physics24.png",
                           "res/physics16.png")
                .AddParameter("object", _("Object"))
                .AddParameter("behavior", _("Behavior"), "PhysicsBehavior")
                .AddCodeOnlyParameter("currentScene", "")
                .SetFunctionName("SetAsBullet").SetIncludeFile("PhysicsBehavior/PhysicsBehavior.h");

            aut.AddAction("DontSetAsBullet",
                           _("Do not treat object like a bullet"),
                           _("Do not treat the object like a bullet, so it will use standard collision handling."),
                           _("Do not consider _PARAM0_ as a bullet."),
                           _("Other"),
                           "res/physics24.png",
                           "res/physics16.png")
                .AddParameter("object", _("Object"))
                .AddParameter("behavior", _("Behavior"), "PhysicsBehavior")
                .AddCodeOnlyParameter("currentScene", "")
                .SetFunctionName("DontSetAsBullet").SetIncludeFile("PhysicsBehavior/PhysicsBehavior.h");

            aut.AddCondition("IsBullet",
                           _("Object is treated like a bullet"),
                           _("Test if the object is treated like a bullet"),
                           _("_PARAM0_ is considered as a bullet"),
                           _("Other"),
                           "res/physics24.png",
                           "res/physics16.png")
                .AddParameter("object", _("Object"))
                .AddParameter("behavior", _("Behavior"), "PhysicsBehavior")
                .AddCodeOnlyParameter("currentScene", "")
                .SetFunctionName("IsBullet").SetIncludeFile("PhysicsBehavior/PhysicsBehavior.h");

            aut.AddAction("ApplyImpulse",
                           _("Apply an impulse"),
                           _("Apply an impulse to the object."),
                           _("Apply to _PARAM0_ impulse _PARAM2_;_PARAM3_"),
                           _("Displacement"),
                           "res/physics24.png",
                           "res/physics16.png")
                .AddParameter("object", _("Object"))
                .AddParameter("behavior", _("Behavior"), "PhysicsBehavior")
                .AddParameter("expression", _("X component ( Newtons/Seconds )"))
                .AddParameter("expression", _("Y component ( Newtons/Seconds )"))
                .AddCodeOnlyParameter("currentScene", "")
                .SetFunctionName("ApplyImpulse").SetIncludeFile("PhysicsBehavior/PhysicsBehavior.h");

            aut.AddAction("ApplyImpulseUsingPolarCoordinates",
                           _("Apply an impulse (angle)"),
                           _("Apply an impulse to an object, using an angle and a length as coordinates."),
                           _("Apply to _PARAM0_ impulse _PARAM3_ with angle: _PARAM2_\302\260"), //\302\260 <=> DEGREE SIGN
                           _("Displacement"),
                           "res/physics24.png",
                           "res/physics16.png")
                .AddParameter("object", _("Object"))
                .AddParameter("behavior", _("Behavior"), "PhysicsBehavior")
                .AddParameter("expression", _("Angle"))
                .AddParameter("expression", _("Impulse value ( Newton/seconds )"))
                .AddCodeOnlyParameter("currentScene", "")
                .SetFunctionName("ApplyImpulseUsingPolarCoordinates").SetIncludeFile("PhysicsBehavior/PhysicsBehavior.h");

            aut.AddAction("ApplyImpulseTowardPosition",
                           _("Apply an impulse toward a position"),
                           _("Apply an impulse, directed toward a position, to the object."),
                           _("Apply to _PARAM0_ impulse _PARAM4_ toward position _PARAM2_;_PARAM3_"),
                           _("Displacement"),
                           "res/physics24.png",
                           "res/physics16.png")
                .AddParameter("object", _("Object"))
                .AddParameter("behavior", _("Behavior"), "PhysicsBehavior")
                .AddParameter("expression", _("X position"))
                .AddParameter("expression", _("Y position"))
                .AddParameter("expression", _("Impulse value ( Newton/seconds )"))
                .AddCodeOnlyParameter("currentScene", "")
                .SetFunctionName("ApplyImpulseTowardPosition").SetIncludeFile("PhysicsBehavior/PhysicsBehavior.h");

            aut.AddAction("ApplyForce",
                           _("Add a force"),
                           _("Add a force to the object"),
                           _("Apply to _PARAM0_ force _PARAM2_;_PARAM3_"),
                           _("Displacement"),
                           "res/physics24.png",
                           "res/physics16.png")
                .AddParameter("object", _("Object"))
                .AddParameter("behavior", _("Behavior"), "PhysicsBehavior")
                .AddParameter("expression", _("X component ( Newtons )"))
                .AddParameter("expression", _("Y component ( Newtons )"))
                .AddCodeOnlyParameter("currentScene", "")
                .SetFunctionName("ApplyForce").SetIncludeFile("PhysicsBehavior/PhysicsBehavior.h");

            aut.AddAction("ApplyForceUsingPolarCoordinates",
                           _("Apply a force ( angle )"),
                           _("Apply a force to an object, using an angle and a length as coordinates."),
                           _("Apply to _PARAM0_ force _PARAM3_ at angle _PARAM2_"),
                           _("Displacement"),
                           "res/physics24.png",
                           "res/physics16.png")
                .AddParameter("object", _("Object"))
                .AddParameter("behavior", _("Behavior"), "PhysicsBehavior")
                .AddParameter("expression", _("Angle"))
                .AddParameter("expression", _("Length of the force ( Newtons )"))
                .AddCodeOnlyParameter("currentScene", "")
                .SetFunctionName("ApplyForceUsingPolarCoordinates").SetIncludeFile("PhysicsBehavior/PhysicsBehavior.h");

            aut.AddAction("ApplyForceTowardPosition",
                           _("Apply a force toward a position"),
                           _("Apply a force, directed toward a position, to the object."),
                           _("Add to _PARAM0_ force _PARAM4_ toward position _PARAM2_;_PARAM3_"),
                           _("Displacement"),
                           "res/physics24.png",
                           "res/physics16.png")
                .AddParameter("object", _("Object"))
                .AddParameter("behavior", _("Behavior"), "PhysicsBehavior")
                .AddParameter("expression", _("X position"))
                .AddParameter("expression", _("Y position"))
                .AddParameter("expression", _("Length of the force ( Newtons )"))
                .AddCodeOnlyParameter("currentScene", "")
                .SetFunctionName("ApplyForceTowardPosition").SetIncludeFile("PhysicsBehavior/PhysicsBehavior.h");

            aut.AddAction("ApplyTorque",
                           _("Add a torque (a rotation)"),
                           _("Add a torque (a rotation) to the object."),
                           _("Add to _PARAM0_ torque _PARAM2_"),
                           _("Rotation"),
                           "res/physics24.png",
                           "res/physics16.png")
                .AddParameter("object", _("Object"))
                .AddParameter("behavior", _("Behavior"), "PhysicsBehavior")
                .AddParameter("expression", _("Torque value"))
                .AddCodeOnlyParameter("currentScene", "")
                .SetFunctionName("ApplyTorque").SetIncludeFile("PhysicsBehavior/PhysicsBehavior.h");

            aut.AddAction("SetLinearVelocity",
                           _("Linear velocity"),
                           _("Modify the velocity of an object."),
                           _("Set linear velocity of _PARAM0_ to _PARAM2_;_PARAM3_"),
                           _("Displacement"),
                           "res/physics24.png",
                           "res/physics16.png")
                .AddParameter("object", _("Object"))
                .AddParameter("behavior", _("Behavior"), "PhysicsBehavior")
                .AddParameter("expression", _("X Coordinate"))
                .AddParameter("expression", _("Y Coordinate"))
                .AddCodeOnlyParameter("currentScene", "")
                .SetFunctionName("SetLinearVelocity").SetIncludeFile("PhysicsBehavior/PhysicsBehavior.h");

            aut.AddCondition("LinearVelocityX",
                           _("X component"),
                           _("Compare the linear velocity on the X axis of the object."),
                           _("Linear velocity on X axis of _PARAM0_ is _PARAM2__PARAM3_"),
                           _("Displacement"),
                           "res/physics24.png",
                           "res/physics16.png")
                .AddParameter("object", _("Object"))
                .AddParameter("behavior", _("Behavior"), "PhysicsBehavior")
                .AddParameter("relationalOperator", _("Comparison sign"))
                .AddParameter("expression", _("Value to test"))
                .AddCodeOnlyParameter("currentScene", "")
                .SetFunctionName("GetLinearVelocityX").SetManipulatedType("number").SetIncludeFile("PhysicsBehavior/PhysicsBehavior.h");

            aut.AddCondition("LinearVelocityY",
                           _("Y component"),
                           _("Compare the linear velocity on the Y axis of the object."),
                           _("Linear velocity on Y axis of _PARAM0_ is _PARAM2__PARAM3_"),
                           _("Displacement"),
                           "res/physics24.png",
                           "res/physics16.png")
                .AddParameter("object", _("Object"))
                .AddParameter("behavior", _("Behavior"), "PhysicsBehavior")
                .AddParameter("relationalOperator", _("Comparison sign"))
                .AddParameter("expression", _("Value to test"))
                .AddCodeOnlyParameter("currentScene", "")
                .SetFunctionName("GetLinearVelocityY").SetManipulatedType("number").SetIncludeFile("PhysicsBehavior/PhysicsBehavior.h");

            aut.AddCondition("LinearVelocity",
                           _("Linear speed"),
                           _("Compare the linear velocity of the object."),
                           _("Linear velocity of _PARAM0_ is _PARAM2__PARAM3_"),
                           _("Displacement"),
                           "res/physics24.png",
                           "res/physics16.png")
                .AddParameter("object", _("Object"))
                .AddParameter("behavior", _("Behavior"), "PhysicsBehavior")
                .AddParameter("relationalOperator", _("Comparison sign"))
                .AddParameter("expression", _("Value to test"))
                .AddCodeOnlyParameter("currentScene", "")
                .SetFunctionName("GetLinearVelocity").SetManipulatedType("number").SetIncludeFile("PhysicsBehavior/PhysicsBehavior.h");

            aut.AddAction("SetAngularVelocity",
                           _("Angular speed"),
                           _("Modify the angular velocity of the object."),
                           _("Set angular speed of _PARAM0_ to _PARAM2_"),
                           _("Rotation"),
                           "res/physics24.png",
                           "res/physics16.png")
                .AddParameter("object", _("Object"))
                .AddParameter("behavior", _("Behavior"), "PhysicsBehavior")
                .AddParameter("expression", _("New value"))
                .AddCodeOnlyParameter("currentScene", "")
                .SetFunctionName("SetAngularVelocity").SetIncludeFile("PhysicsBehavior/PhysicsBehavior.h");

            aut.AddCondition("AngularVelocity",
                           _("Angular speed"),
                           _("Compare the angular speed of the object."),
                           _("Angular speed of _PARAM0_ is _PARAM2__PARAM3_"),
                           _("Rotation"),
                           "res/physics24.png",
                           "res/physics16.png")
                .AddParameter("object", _("Object"))
                .AddParameter("behavior", _("Behavior"), "PhysicsBehavior")
                .AddParameter("relationalOperator", _("Comparison sign"))
                .AddParameter("expression", _("Value to test"))
                .AddCodeOnlyParameter("currentScene", "")
                .SetFunctionName("GetAngularVelocity").SetManipulatedType("number").SetIncludeFile("PhysicsBehavior/PhysicsBehavior.h");

            aut.AddCondition("LinearDamping",
                           _("Linear damping"),
                           _("Compare the linear damping of the object."),
                           _("Linear damping of _PARAM0_ is _PARAM2__PARAM3_"),
                           _("Displacement"),
                           "res/physics24.png",
                           "res/physics16.png")
                .AddParameter("object", _("Object"))
                .AddParameter("behavior", _("Behavior"), "PhysicsBehavior")
                .AddParameter("relationalOperator", _("Comparison sign"))
                .AddParameter("expression", _("Value to test"))
                .AddCodeOnlyParameter("currentScene", "")
                .SetFunctionName("GetLinearDamping").SetManipulatedType("number").SetIncludeFile("PhysicsBehavior/PhysicsBehavior.h");

            aut.AddCondition("CollisionWith",
                           _("Collision"),
                           _("Test if two objects are colliding.\nAttention! Only objects specified in the first parameter will be taken into account by the next actions and conditions, if they are colliding with the other objects."),
                           _("_PARAM0_ is in collision with a _PARAM2_"),
                           _(""),
                           "res/physics24.png",
                           "res/physics16.png")
                .AddParameter("object", _("Object"))
                .AddParameter("behavior", _("Behavior"), "PhysicsBehavior")
                .AddParameter("objectList", _("Object"))
                .AddCodeOnlyParameter("currentScene", "")
                .SetFunctionName("CollisionWith").SetIncludeFile("PhysicsBehavior/PhysicsBehavior.h");

            aut.AddAction("SetLinearDamping",
                           _("Linear damping"),
                           _("Modify the linear damping of the object."),
                           _("Set linear damping of _PARAM0_ to _PARAM2_"),
                           _("Displacement"),
                           "res/physics24.png",
                           "res/physics16.png")
                .AddParameter("object", _("Object"))
                .AddParameter("behavior", _("Behavior"), "PhysicsBehavior")
                .AddParameter("expression", _("Value"))
                .AddCodeOnlyParameter("currentScene", "")
                .SetFunctionName("SetLinearDamping").SetIncludeFile("PhysicsBehavior/PhysicsBehavior.h");

            aut.AddCondition("AngularDamping",
                           _("Angular damping"),
                           _("Test the object's angular damping"),
                           _("Angular damping of _PARAM0_ is _PARAM2__PARAM3_"),
                           _("Displacement"),
                           "res/physics24.png",
                           "res/physics16.png")
                .AddParameter("object", _("Object"))
                .AddParameter("behavior", _("Behavior"), "PhysicsBehavior")
                .AddParameter("relationalOperator", _("Comparison sign"))
                .AddParameter("expression", _("Value to test"))
                .AddCodeOnlyParameter("currentScene", "")
                .SetFunctionName("GetAngularDamping").SetManipulatedType("number").SetIncludeFile("PhysicsBehavior/PhysicsBehavior.h");

            aut.AddAction("SetAngularDamping",
                           _("Angular damping"),
                           _("Modify the angular damping of the object."),
                           _("Set angular damping of _PARAM0_ to _PARAM2_"),
                           _("Displacement"),
                           "res/physics24.png",
                           "res/physics16.png")
                .AddParameter("object", _("Object"))
                .AddParameter("behavior", _("Behavior"), "PhysicsBehavior")
                .AddParameter("expression", _("Value"))
                .AddCodeOnlyParameter("currentScene", "")
                .SetFunctionName("SetAngularDamping").SetIncludeFile("PhysicsBehavior/PhysicsBehavior.h");

            aut.AddAction("SetGravity",
                           _("Gravity"),
                           _("Modify the gravity"),
                           _("Set gravity force to _PARAM2_;_PARAM3_"),
                           _("Global options"),
                           "res/physics24.png",
                           "res/physics16.png")
                .AddParameter("object", _("Object"))
                .AddParameter("behavior", _("Behavior"), "PhysicsBehavior")
                .AddParameter("expression", _("X Coordinate"))
                .AddParameter("expression", _("Y Coordinate"))
                .AddCodeOnlyParameter("currentScene", "")
                .SetFunctionName("SetGravity").SetIncludeFile("PhysicsBehavior/PhysicsBehavior.h");

            aut.AddAction("SetPolygonScaleX",
                           _("Change the X scale of a collision polygon"),
                           _("Change the X scale of the polygon. Use a value greater than 1 to enlarge the polygon, less than 1 to reduce it."),
                           _("Change the X scale of the collision polygon of _PARAM0_ to _PARAM2_"),
                           _("Collision polygon"),
                           "res/physics24.png",
                           "res/physics16.png")
                .AddParameter("object", _("Object"))
                .AddParameter("behavior", _("Behavior"), "PhysicsBehavior")
                .AddParameter("expression", _("Scale"))
                .AddCodeOnlyParameter("currentScene", "")
                .SetFunctionName("SetPolygonScaleX").SetIncludeFile("PhysicsBehavior/PhysicsBehavior.h");

            aut.AddAction("SetPolygonScaleY",
                           _("Change the Y scale of a collision polygon"),
                           _("Change the Y scale of the polygon. Use a value greater than 1 to enlarge the polygon, less than 1 to reduce it."),
                           _("Change the Y scale of the collision polygon of _PARAM0_ Y to _PARAM2_"),
                           _("Collision polygon"),
                           "res/physics24.png",
                           "res/physics16.png")
                .AddParameter("object", _("Object"))
                .AddParameter("behavior", _("Behavior"), "PhysicsBehavior")
                .AddParameter("expression", _("Scale"))
                .AddCodeOnlyParameter("currentScene", "")
                .SetFunctionName("SetPolygonScaleY").SetIncludeFile("PhysicsBehavior/PhysicsBehavior.h");

            aut.AddCondition("GetPolygonScaleX",
                           _("Collision polygon X scale"),
                           _("Test the value of the X scale of the collision polygon."),
                           _("The X scale of the collision polygon of _PARAM0_ is _PARAM2__PARAM3_"),
                           _("Collision polygon"),
                           "res/physics24.png",
                           "res/physics16.png")
                .AddParameter("object", _("Object"))
                .AddParameter("behavior", _("Behavior"), "PhysicsBehavior")
                .AddParameter("relationalOperator", _("Comparison sign"))
                .AddParameter("expression", _("Value to test"))
                .AddCodeOnlyParameter("currentScene", "")
                .SetFunctionName("GetPolygonScaleX").SetManipulatedType("number").SetIncludeFile("PhysicsBehavior/PhysicsBehavior.h");

            aut.AddCondition("GetPolygonScaleY",
                           _("Collision polygon Y scale"),
                           _("Test the value of the Y scale of the collision polygon."),
                           _("The Y scale of the collision polygon of _PARAM0_ is _PARAM2__PARAM3_"),
                           _("Collision polygon"),
                           "res/physics24.png",
                           "res/physics16.png")
                .AddParameter("object", _("Object"))
                .AddParameter("behavior", _("Behavior"), "PhysicsBehavior")
                .AddParameter("relationalOperator", _("Comparison sign"))
                .AddParameter("expression", _("Value to test"))
                .AddCodeOnlyParameter("currentScene", "")
                .SetFunctionName("GetPolygonScaleY").SetManipulatedType("number").SetIncludeFile("PhysicsBehavior/PhysicsBehavior.h");

            aut.AddExpression("PolygonScaleX", _("Collision polygon X scale"), _("Collision polygon X scale"), _("Collision polygon"), "res/physics16.png")
                .AddParameter("object", _("Object"))
                .AddParameter("behavior", _("Behavior"), "PhysicsBehavior")
                .AddCodeOnlyParameter("currentScene", "")
                .SetFunctionName("GetPolygonScaleX").SetIncludeFile("PhysicsBehavior/PhysicsBehavior.h");

            aut.AddExpression("PolygonScaleY", _("Collision polygon Y scale"), _("Collision polygon Y scale"), _("Collision polygon"), "res/physics16.png")
                .AddParameter("object", _("Object"))
                .AddParameter("behavior", _("Behavior"), "PhysicsBehavior")
                .AddCodeOnlyParameter("currentScene", "")
                .SetFunctionName("GetPolygonScaleY").SetIncludeFile("PhysicsBehavior/PhysicsBehavior.h");

            aut.AddExpression("LinearVelocity", _("Linear speed"), _("Linear speed"), _("Displacement"), "res/physics16.png")
                .AddParameter("object", _("Object"))
                .AddParameter("behavior", _("Behavior"), "PhysicsBehavior")
                .AddCodeOnlyParameter("currentScene", "")
                .SetFunctionName("GetLinearVelocity").SetIncludeFile("PhysicsBehavior/PhysicsBehavior.h");

            aut.AddExpression("LinearVelocityX", _("X component"), _("X component"), _("Displacement"), "res/physics16.png")
                .AddParameter("object", _("Object"))
                .AddParameter("behavior", _("Behavior"), "PhysicsBehavior")
                .AddCodeOnlyParameter("currentScene", "")
                .SetFunctionName("GetLinearVelocityX").SetIncludeFile("PhysicsBehavior/PhysicsBehavior.h");

            aut.AddExpression("LinearVelocityY", _("Y component"), _("Y component"), _("Displacement"), "res/physics16.png")
                .AddParameter("object", _("Object"))
                .AddParameter("behavior", _("Behavior"), "PhysicsBehavior")
                .AddCodeOnlyParameter("currentScene", "")
                .SetFunctionName("GetLinearVelocityY").SetIncludeFile("PhysicsBehavior/PhysicsBehavior.h");

            aut.AddExpression("AngularVelocity", _("Angular speed"), _("Angular speed"), _("Rotation"), "res/physics16.png")
                .AddParameter("object", _("Object"))
                .AddParameter("behavior", _("Behavior"), "PhysicsBehavior")
                .AddCodeOnlyParameter("currentScene", "")
                .SetFunctionName("GetAngularVelocity").SetIncludeFile("PhysicsBehavior/PhysicsBehavior.h");

            aut.AddExpression("LinearDamping", _("Linear damping"), _("Linear damping"), _("Displacement"), "res/physics16.png")
                .AddParameter("object", _("Object"))
                .AddParameter("behavior", _("Behavior"), "PhysicsBehavior")
                .AddCodeOnlyParameter("currentScene", "")
                .SetFunctionName("GetLinearDamping").SetIncludeFile("PhysicsBehavior/PhysicsBehavior.h");

            aut.AddExpression("AngularDamping", _("Angular damping"), _("Angular damping"), _("Rotation"), "res/physics16.png")
                .AddParameter("object", _("Object"))
                .AddParameter("behavior", _("Behavior"), "PhysicsBehavior")
                .AddCodeOnlyParameter("currentScene", "")
                .SetFunctionName("GetAngularDamping").SetIncludeFile("PhysicsBehavior/PhysicsBehavior.h");

            #endif

        }

        GD_COMPLETE_EXTENSION_COMPILATION_INFORMATION();
    };
};

#if defined(ANDROID)
extern "C" ExtensionBase * CreateGDCppPhysicsBehaviorExtension() {
    return new PhysicsBehaviorCppExtension;
}
#elif !defined(EMSCRIPTEN)
/**
 * Used by GDevelop to create the extension class
 * -- Do not need to be modified. --
 */
extern "C" ExtensionBase * GD_EXTENSION_API CreateGDExtension() {
    return new PhysicsBehaviorCppExtension;
}
#endif

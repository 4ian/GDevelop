/**

GDevelop - Physics Behavior Extension
Copyright (c) 2010-2016 Florian Rival (Florian.Rival@gmail.com)
This project is released under the MIT License.
*/
/**
 * Contributors to the extension:
 * Victor Levasseur (Collisions using custom polygons, fixed time step fix)
 */

#include "GDCore/Extensions/PlatformExtension.h"
#include "GDCore/Tools/Localization.h"
#include "PhysicsBehavior.h"
#include "ScenePhysicsDatas.h"

void DeclarePhysicsBehaviorExtension(gd::PlatformExtension& extension) {
  extension
      .SetExtensionInformation("PhysicsBehavior",
                               ("Physics Engine (deprecated)"),
                               "This is the old, deprecated physics engine. Prefer to use the Physics Engine 2.0.",
                               "Florian Rival",
                               "Open source (MIT License)")
      .SetCategory("Movement")
      .SetExtensionHelpPath("/behaviors/physics");
  extension.AddInstructionOrExpressionGroupMetadata(("Physics Engine (deprecated)"))
      .SetIcon("res/physics-deprecated16.png");

  {
    gd::BehaviorMetadata& aut = extension.AddBehavior(
        "PhysicsBehavior",
        ("Physics Engine"),
        ("Physics"),
        ("Make objects move as if they are subject to the laws of physics. If "
          "you're creating a new game, prefer Physics Engine 2.0"),
        "",
        "res/physics-deprecated32.png",
        "PhysicsBehavior",
        std::make_shared<PhysicsBehavior>(),
        std::make_shared<ScenePhysicsDatas>());

    aut.AddAction("SetStatic",
                  ("Make the object static"),
                  ("Make the object immovable."),
                  ("Make _PARAM0_ static"),
                  ("Movement"),
                  "res/physics-deprecated24.png",
                  "res/physics-deprecated16.png")
        .AddParameter("object", ("Object"))
        .AddParameter("behavior", ("Behavior"), "PhysicsBehavior")
        .AddCodeOnlyParameter("currentScene", "")
        .SetFunctionName("SetStatic");

    aut.AddAction("SetDynamic",
                  ("Make the object dynamic"),
                  ("Make the object dynamic ( affected by forces and other "
                    "objects )."),
                  ("Make _PARAM0_ dynamic"),
                  ("Movement"),
                  "res/physics-deprecated24.png",
                  "res/physics-deprecated16.png")
        .AddParameter("object", ("Object"))
        .AddParameter("behavior", ("Behavior"), "PhysicsBehavior")
        .AddCodeOnlyParameter("currentScene", "")
        .SetFunctionName("SetDynamic");

    aut.AddCondition("IsDynamic",
                     ("The object is dynamic"),
                     ("Test if an object is dynamic ( affected by forces and "
                       "other objects )."),
                     ("_PARAM0_ is dynamic"),
                     ("Movement"),
                     "res/physics-deprecated24.png",
                     "res/physics-deprecated16.png")

        .AddParameter("object", ("Object"))
        .AddParameter("behavior", ("Behavior"), "PhysicsBehavior")
        .SetFunctionName("IsDynamic");

    aut.AddAction("SetFixedRotation",
                  ("Fix rotation"),
                  ("Prevent the object from rotating"),
                  ("Fix rotation of _PARAM0_"),
                  ("Rotation"),
                  "res/physics-deprecated24.png",
                  "res/physics-deprecated16.png")
        .AddParameter("object", ("Object"))
        .AddParameter("behavior", ("Behavior"), "PhysicsBehavior")
        .AddCodeOnlyParameter("currentScene", "")
        .SetFunctionName("SetFixedRotation");

    aut.AddAction(
           "AddRevoluteJoint",
           ("Add a hinge"),
           ("Add a hinge that the object will rotate around.\nThe distance "
             "between the hinge and the object will remain identical."),
           ("Add a hinge to _PARAM0_ at _PARAM2_;_PARAM3_"),
           ("Joints"),
           "res/physics-deprecated24.png",
           "res/physics-deprecated16.png")
        .AddParameter("object", ("Object"))
        .AddParameter("behavior", ("Behavior"), "PhysicsBehavior")
        .AddParameter("expression", ("Hinge X position"))
        .AddParameter("expression", ("Hinge Y position"))
        .AddCodeOnlyParameter("currentScene", "")
        .SetFunctionName("AddRevoluteJoint");

    aut.AddAction("AddRevoluteJointBetweenObjects",
                  ("Add a hinge between two objects"),
                  ("Add a hinge that the object will rotate around."),
                  ("Add a hinge between _PARAM0_ and _PARAM2_"),
                  ("Joints"),
                  "res/physics-deprecated24.png",
                  "res/physics-deprecated16.png")
        .AddParameter("object", ("Object"))
        .AddParameter("behavior", ("Behavior"), "PhysicsBehavior")
        .AddParameter("objectPtr", ("Object"))
        .AddCodeOnlyParameter("currentScene", "")
        .AddParameter(
            "expression",
            ("X position of the hinge, from the first object mass center"),
            "",
            true)
        .SetDefaultValue("0")
        .AddParameter(
            "expression",
            ("Y position of the hinge, from the first object mass center"),
            "",
            true)
        .SetDefaultValue("0")
        .SetFunctionName("AddRevoluteJointBetweenObjects");

    aut.AddAction("ActAddGearJointBetweenObjects",
                  ("Add a gear between two objects"),
                  ("Add a virtual gear between two objects."),
                  ("Add a gear between _PARAM0_ and _PARAM2_"),
                  ("Joints"),
                  "res/physics-deprecated24.png",
                  "res/physics-deprecated16.png")
        .AddParameter("object", ("Object"))
        .AddParameter("behavior", ("Behavior"), "PhysicsBehavior")
        .AddParameter("objectPtr", ("Object"))
        .AddParameter("expression", ("Ratio"), "", true)
        .SetDefaultValue("1")
        .AddCodeOnlyParameter("currentScene", "")
        .SetFunctionName("AddGearJointBetweenObjects");

    aut.AddAction("SetFreeRotation",
                  ("Make object's rotation free"),
                  ("Allows the object to rotate."),
                  ("Allow _PARAM0_ to rotate"),
                  ("Rotation"),
                  "res/physics-deprecated24.png",
                  "res/physics-deprecated16.png")
        .AddParameter("object", ("Object"))
        .AddParameter("behavior", ("Behavior"), "PhysicsBehavior")
        .AddCodeOnlyParameter("currentScene", "")
        .SetFunctionName("SetFreeRotation");

    aut.AddCondition("IsFixedRotation",
                     ("Fixed rotation"),
                     ("Test if the object's rotation is fixed."),
                     ("The rotation of _PARAM0_ is fixed."),
                     ("Rotation"),
                     "res/physics-deprecated24.png",
                     "res/physics-deprecated16.png")
        .AddParameter("object", ("Object"))
        .AddParameter("behavior", ("Behavior"), "PhysicsBehavior")
        .AddCodeOnlyParameter("currentScene", "")
        .SetFunctionName("IsFixedRotation");

    aut.AddAction("SetAsBullet",
                  ("Treat object like a bullet."),
                  ("Treat the object like a bullet, so it will have better "
                    "collision handling."),
                  ("Consider _PARAM0_ as a bullet"),
                  ("Other"),
                  "res/physics-deprecated24.png",
                  "res/physics-deprecated16.png")
        .AddParameter("object", ("Object"))
        .AddParameter("behavior", ("Behavior"), "PhysicsBehavior")
        .AddCodeOnlyParameter("currentScene", "")
        .SetFunctionName("SetAsBullet");

    aut.AddAction("DontSetAsBullet",
                  ("Do not treat object like a bullet"),
                  ("Do not treat the object like a bullet, so it will use "
                    "standard collision handling."),
                  ("Do not consider _PARAM0_ as a bullet."),
                  ("Other"),
                  "res/physics-deprecated24.png",
                  "res/physics-deprecated16.png")
        .AddParameter("object", ("Object"))
        .AddParameter("behavior", ("Behavior"), "PhysicsBehavior")
        .AddCodeOnlyParameter("currentScene", "")
        .SetFunctionName("DontSetAsBullet");

    aut.AddCondition("IsBullet",
                     ("Object is treated like a bullet"),
                     ("Test if the object is treated like a bullet"),
                     ("_PARAM0_ is considered as a bullet"),
                     ("Other"),
                     "res/physics-deprecated24.png",
                     "res/physics-deprecated16.png")
        .AddParameter("object", ("Object"))
        .AddParameter("behavior", ("Behavior"), "PhysicsBehavior")
        .AddCodeOnlyParameter("currentScene", "")
        .SetFunctionName("IsBullet");

    aut.AddAction("ApplyImpulse",
                  ("Apply an impulse"),
                  ("Apply an impulse to the object."),
                  ("Apply to _PARAM0_ impulse _PARAM2_;_PARAM3_"),
                  ("Displacement"),
                  "res/physics-deprecated24.png",
                  "res/physics-deprecated16.png")
        .AddParameter("object", ("Object"))
        .AddParameter("behavior", ("Behavior"), "PhysicsBehavior")
        .AddParameter("expression", ("X component ( Newtons/Seconds )"))
        .AddParameter("expression", ("Y component ( Newtons/Seconds )"))
        .AddCodeOnlyParameter("currentScene", "")
        .SetFunctionName("ApplyImpulse");

    aut.AddAction("ApplyImpulseUsingPolarCoordinates",
                  ("Apply an impulse (angle)"),
                  ("Apply an impulse to an object, using an angle and a "
                    "length as coordinates."),
                  ("Apply to _PARAM0_ impulse _PARAM3_ with angle: "
                    "_PARAM2_\302\260"),  //\302\260 <=> DEGREE SIGN
                  ("Displacement"),
                  "res/physics-deprecated24.png",
                  "res/physics-deprecated16.png")
        .AddParameter("object", ("Object"))
        .AddParameter("behavior", ("Behavior"), "PhysicsBehavior")
        .AddParameter("expression", ("Angle"))
        .AddParameter("expression", ("Impulse value ( Newton/seconds )"))
        .AddCodeOnlyParameter("currentScene", "")
        .SetFunctionName("ApplyImpulseUsingPolarCoordinates");

    aut.AddAction(
           "ApplyImpulseTowardPosition",
           ("Apply an impulse toward a position"),
           ("Apply an impulse, directed toward a position, to the object."),
           ("Apply to _PARAM0_ impulse _PARAM4_ toward position "
             "_PARAM2_;_PARAM3_"),
           ("Displacement"),
           "res/physics-deprecated24.png",
           "res/physics-deprecated16.png")
        .AddParameter("object", ("Object"))
        .AddParameter("behavior", ("Behavior"), "PhysicsBehavior")
        .AddParameter("expression", ("X position"))
        .AddParameter("expression", ("Y position"))
        .AddParameter("expression", ("Impulse value ( Newton/seconds )"))
        .AddCodeOnlyParameter("currentScene", "")
        .SetFunctionName("ApplyImpulseTowardPosition");

    aut.AddAction("ApplyForce",
                  ("Add a force"),
                  ("Add a force to the object"),
                  ("Apply to _PARAM0_ force _PARAM2_;_PARAM3_"),
                  ("Displacement"),
                  "res/physics-deprecated24.png",
                  "res/physics-deprecated16.png")
        .AddParameter("object", ("Object"))
        .AddParameter("behavior", ("Behavior"), "PhysicsBehavior")
        .AddParameter("expression", ("X component ( Newtons )"))
        .AddParameter("expression", ("Y component ( Newtons )"))
        .AddCodeOnlyParameter("currentScene", "")
        .SetFunctionName("ApplyForce");

    aut.AddAction("ApplyForceUsingPolarCoordinates",
                  ("Apply a force ( angle )"),
                  ("Apply a force to an object, using an angle and a length "
                    "as coordinates."),
                  ("Apply to _PARAM0_ force _PARAM3_ at angle _PARAM2_"),
                  ("Displacement"),
                  "res/physics-deprecated24.png",
                  "res/physics-deprecated16.png")
        .AddParameter("object", ("Object"))
        .AddParameter("behavior", ("Behavior"), "PhysicsBehavior")
        .AddParameter("expression", ("Angle"))
        .AddParameter("expression", ("Length of the force ( Newtons )"))
        .AddCodeOnlyParameter("currentScene", "")
        .SetFunctionName("ApplyForceUsingPolarCoordinates");

    aut.AddAction(
           "ApplyForceTowardPosition",
           ("Apply a force toward a position"),
           ("Apply a force, directed toward a position, to the object."),
           ("Add to _PARAM0_ force _PARAM4_ toward position "
             "_PARAM2_;_PARAM3_"),
           ("Displacement"),
           "res/physics-deprecated24.png",
           "res/physics-deprecated16.png")
        .AddParameter("object", ("Object"))
        .AddParameter("behavior", ("Behavior"), "PhysicsBehavior")
        .AddParameter("expression", ("X position"))
        .AddParameter("expression", ("Y position"))
        .AddParameter("expression", ("Length of the force ( Newtons )"))
        .AddCodeOnlyParameter("currentScene", "")
        .SetFunctionName("ApplyForceTowardPosition");

    aut.AddAction("ApplyTorque",
                  ("Add a torque (a rotation)"),
                  ("Add a torque (a rotation) to the object."),
                  ("Add to _PARAM0_ torque _PARAM2_"),
                  ("Rotation"),
                  "res/physics-deprecated24.png",
                  "res/physics-deprecated16.png")
        .AddParameter("object", ("Object"))
        .AddParameter("behavior", ("Behavior"), "PhysicsBehavior")
        .AddParameter("expression", ("Torque value"))
        .AddCodeOnlyParameter("currentScene", "")
        .SetFunctionName("ApplyTorque");

    aut.AddAction("SetLinearVelocity",
                  ("Linear velocity"),
                  ("Modify the velocity of an object."),
                  ("Set linear velocity of _PARAM0_ to _PARAM2_;_PARAM3_"),
                  ("Displacement"),
                  "res/physics-deprecated24.png",
                  "res/physics-deprecated16.png")
        .AddParameter("object", ("Object"))
        .AddParameter("behavior", ("Behavior"), "PhysicsBehavior")
        .AddParameter("expression", ("X Coordinate"))
        .AddParameter("expression", ("Y Coordinate"))
        .AddCodeOnlyParameter("currentScene", "")
        .SetFunctionName("SetLinearVelocity");

    aut.AddCondition(
           "LinearVelocityX",
           ("X component"),
           ("Compare the linear velocity on the X axis of the object."),
           ("the linear velocity on X axis"),
           ("Displacement"),
           "res/physics-deprecated24.png",
           "res/physics-deprecated16.png")
        .AddParameter("object", ("Object"))
        .AddParameter("behavior", ("Behavior"), "PhysicsBehavior")
        .UseStandardRelationalOperatorParameters(
            "number", gd::ParameterOptions::MakeNewOptions())
        .AddCodeOnlyParameter("currentScene", "")
        .SetFunctionName("GetLinearVelocityX");

    aut.AddCondition(
           "LinearVelocityY",
           ("Y component"),
           ("Compare the linear velocity on the Y axis of the object."),
           ("the linear velocity on Y axis"),
           ("Displacement"),
           "res/physics-deprecated24.png",
           "res/physics-deprecated16.png")
        .AddParameter("object", ("Object"))
        .AddParameter("behavior", ("Behavior"), "PhysicsBehavior")
        .UseStandardRelationalOperatorParameters(
            "number", gd::ParameterOptions::MakeNewOptions())
        .AddCodeOnlyParameter("currentScene", "")
        .SetFunctionName("GetLinearVelocityY");

    aut.AddCondition("LinearVelocity",
                     ("Linear speed"),
                     ("Compare the linear velocity of the object."),
                     ("the linear velocity"),
                     ("Displacement"),
                     "res/physics-deprecated24.png",
                     "res/physics-deprecated16.png")
        .AddParameter("object", ("Object"))
        .AddParameter("behavior", ("Behavior"), "PhysicsBehavior")
        .UseStandardRelationalOperatorParameters(
            "number", gd::ParameterOptions::MakeNewOptions())
        .AddCodeOnlyParameter("currentScene", "")
        .SetFunctionName("GetLinearVelocity");

    aut.AddAction("SetAngularVelocity",
                  ("Angular speed"),
                  ("Modify the angular velocity of the object."),
                  ("Set angular speed of _PARAM0_ to _PARAM2_"),
                  ("Rotation"),
                  "res/physics-deprecated24.png",
                  "res/physics-deprecated16.png")
        .AddParameter("object", ("Object"))
        .AddParameter("behavior", ("Behavior"), "PhysicsBehavior")
        .AddParameter("expression", ("New value"))
        .AddCodeOnlyParameter("currentScene", "")
        .SetFunctionName("SetAngularVelocity");

    aut.AddCondition("AngularVelocity",
                     ("Angular speed"),
                     ("Compare the angular speed of the object."),
                     ("the angular speed"),
                     ("Rotation"),
                     "res/physics-deprecated24.png",
                     "res/physics-deprecated16.png")
        .AddParameter("object", ("Object"))
        .AddParameter("behavior", ("Behavior"), "PhysicsBehavior")
        .UseStandardRelationalOperatorParameters(
            "number", gd::ParameterOptions::MakeNewOptions())
        .AddCodeOnlyParameter("currentScene", "")
        .SetFunctionName("GetAngularVelocity");

    aut.AddCondition("LinearDamping",
                     ("Linear damping"),
                     ("Compare the linear damping of the object."),
                     ("the linear damping"),
                     ("Displacement"),
                     "res/physics-deprecated24.png",
                     "res/physics-deprecated16.png")
        .AddParameter("object", ("Object"))
        .AddParameter("behavior", ("Behavior"), "PhysicsBehavior")
        .UseStandardRelationalOperatorParameters(
            "number", gd::ParameterOptions::MakeNewOptions())
        .AddCodeOnlyParameter("currentScene", "")
        .SetFunctionName("GetLinearDamping");

    aut.AddCondition("CollisionWith",
                     ("Collision"),
                     ("Test if two objects are colliding.\nAttention! Only "
                       "objects specified in the first parameter will be taken "
                       "into account by the next actions and conditions, if "
                       "they are colliding with the other objects."),
                     ("_PARAM0_ is in collision with a _PARAM2_"),
                     "",
                     "res/physics-deprecated24.png",
                     "res/physics-deprecated16.png")
        .AddParameter("object", ("Object"))
        .AddParameter("behavior", ("Behavior"), "PhysicsBehavior")
        .AddParameter("objectList", ("Object"))
        .AddCodeOnlyParameter("currentScene", "")
        .SetFunctionName("CollisionWith");

    aut.AddAction("SetLinearDamping",
                  ("Linear damping"),
                  ("Modify the linear damping of the object."),
                  ("Set linear damping of _PARAM0_ to _PARAM2_"),
                  ("Displacement"),
                  "res/physics-deprecated24.png",
                  "res/physics-deprecated16.png")
        .AddParameter("object", ("Object"))
        .AddParameter("behavior", ("Behavior"), "PhysicsBehavior")
        .AddParameter("expression", ("Value"))
        .AddCodeOnlyParameter("currentScene", "")
        .SetFunctionName("SetLinearDamping");

    aut.AddCondition("AngularDamping",
                     ("Angular damping"),
                     ("Test the object's angular damping"),
                     ("the angular damping"),
                     ("Displacement"),
                     "res/physics-deprecated24.png",
                     "res/physics-deprecated16.png")
        .AddParameter("object", ("Object"))
        .AddParameter("behavior", ("Behavior"), "PhysicsBehavior")
        .UseStandardRelationalOperatorParameters(
            "number", gd::ParameterOptions::MakeNewOptions())
        .AddCodeOnlyParameter("currentScene", "")
        .SetFunctionName("GetAngularDamping");

    aut.AddAction("SetAngularDamping",
                  ("Angular damping"),
                  ("Modify the angular damping of the object."),
                  ("Set angular damping of _PARAM0_ to _PARAM2_"),
                  ("Displacement"),
                  "res/physics-deprecated24.png",
                  "res/physics-deprecated16.png")
        .AddParameter("object", ("Object"))
        .AddParameter("behavior", ("Behavior"), "PhysicsBehavior")
        .AddParameter("expression", ("Value"))
        .AddCodeOnlyParameter("currentScene", "")
        .SetFunctionName("SetAngularDamping");

    aut.AddAction("SetGravity",
                  ("Gravity"),
                  ("Modify the gravity"),
                  ("Set gravity force to _PARAM2_;_PARAM3_"),
                  ("Global options"),
                  "res/physics-deprecated24.png",
                  "res/physics-deprecated16.png")
        .AddParameter("object", ("Object"))
        .AddParameter("behavior", ("Behavior"), "PhysicsBehavior")
        .AddParameter("expression", ("X Coordinate"))
        .AddParameter("expression", ("Y Coordinate"))
        .AddCodeOnlyParameter("currentScene", "")
        .SetFunctionName("SetGravity");

    aut.AddAction("SetPolygonScaleX",
                  ("Change the X scale of a collision polygon"),
                  ("Change the X scale of the polygon. Use a value greater "
                    "than 1 to enlarge the polygon, less than 1 to reduce it."),
                  ("Change the X scale of the collision polygon of _PARAM0_ "
                    "to _PARAM2_"),
                  ("Collision polygon"),
                  "res/physics-deprecated24.png",
                  "res/physics-deprecated16.png")
        .AddParameter("object", ("Object"))
        .AddParameter("behavior", ("Behavior"), "PhysicsBehavior")
        .AddParameter("expression", ("Scale"))
        .AddCodeOnlyParameter("currentScene", "")
        .SetFunctionName("SetPolygonScaleX");

    aut.AddAction("SetPolygonScaleY",
                  ("Change the Y scale of a collision polygon"),
                  ("Change the Y scale of the polygon. Use a value greater "
                    "than 1 to enlarge the polygon, less than 1 to reduce it."),
                  ("Change the Y scale of the collision polygon of _PARAM0_ Y "
                    "to _PARAM2_"),
                  ("Collision polygon"),
                  "res/physics-deprecated24.png",
                  "res/physics-deprecated16.png")
        .AddParameter("object", ("Object"))
        .AddParameter("behavior", ("Behavior"), "PhysicsBehavior")
        .AddParameter("expression", ("Scale"))
        .AddCodeOnlyParameter("currentScene", "")
        .SetFunctionName("SetPolygonScaleY");

    aut.AddCondition(
           "GetPolygonScaleX",
           ("Collision polygon X scale"),
           ("Test the value of the X scale of the collision polygon."),
           ("the X scale of the collision polygon"),
           ("Collision polygon"),
           "res/physics-deprecated24.png",
           "res/physics-deprecated16.png")
        .AddParameter("object", ("Object"))
        .AddParameter("behavior", ("Behavior"), "PhysicsBehavior")
        .UseStandardRelationalOperatorParameters(
            "number", gd::ParameterOptions::MakeNewOptions())
        .AddCodeOnlyParameter("currentScene", "")
        .SetFunctionName("GetPolygonScaleX");

    aut.AddCondition(
           "GetPolygonScaleY",
           ("Collision polygon Y scale"),
           ("Test the value of the Y scale of the collision polygon."),
           ("the Y scale of the collision polygon"),
           ("Collision polygon"),
           "res/physics-deprecated24.png",
           "res/physics-deprecated16.png")
        .AddParameter("object", ("Object"))
        .AddParameter("behavior", ("Behavior"), "PhysicsBehavior")
        .UseStandardRelationalOperatorParameters(
            "number", gd::ParameterOptions::MakeNewOptions())
        .AddCodeOnlyParameter("currentScene", "")
        .SetFunctionName("GetPolygonScaleY");

    aut.AddExpression("PolygonScaleX",
                      ("Collision polygon X scale"),
                      ("Collision polygon X scale"),
                      ("Collision polygon"),
                      "res/physics-deprecated16.png")
        .AddParameter("object", ("Object"))
        .AddParameter("behavior", ("Behavior"), "PhysicsBehavior")
        .AddCodeOnlyParameter("currentScene", "")
        .SetFunctionName("GetPolygonScaleX");

    aut.AddExpression("PolygonScaleY",
                      ("Collision polygon Y scale"),
                      ("Collision polygon Y scale"),
                      ("Collision polygon"),
                      "res/physics-deprecated16.png")
        .AddParameter("object", ("Object"))
        .AddParameter("behavior", ("Behavior"), "PhysicsBehavior")
        .AddCodeOnlyParameter("currentScene", "")
        .SetFunctionName("GetPolygonScaleY");

    aut.AddExpression("LinearVelocity",
                      ("Linear speed"),
                      ("Linear speed"),
                      ("Displacement"),
                      "res/physics-deprecated16.png")
        .AddParameter("object", ("Object"))
        .AddParameter("behavior", ("Behavior"), "PhysicsBehavior")
        .AddCodeOnlyParameter("currentScene", "")
        .SetFunctionName("GetLinearVelocity");

    aut.AddExpression("LinearVelocityX",
                      ("X component"),
                      ("X component"),
                      ("Displacement"),
                      "res/physics-deprecated16.png")
        .AddParameter("object", ("Object"))
        .AddParameter("behavior", ("Behavior"), "PhysicsBehavior")
        .AddCodeOnlyParameter("currentScene", "")
        .SetFunctionName("GetLinearVelocityX");

    aut.AddExpression("LinearVelocityY",
                      ("Y component"),
                      ("Y component"),
                      ("Displacement"),
                      "res/physics-deprecated16.png")
        .AddParameter("object", ("Object"))
        .AddParameter("behavior", ("Behavior"), "PhysicsBehavior")
        .AddCodeOnlyParameter("currentScene", "")
        .SetFunctionName("GetLinearVelocityY");

    aut.AddExpression("AngularVelocity",
                      ("Angular speed"),
                      ("Angular speed"),
                      ("Rotation"),
                      "res/physics-deprecated16.png")
        .AddParameter("object", ("Object"))
        .AddParameter("behavior", ("Behavior"), "PhysicsBehavior")
        .AddCodeOnlyParameter("currentScene", "")
        .SetFunctionName("GetAngularVelocity");

    aut.AddExpression("LinearDamping",
                      ("Linear damping"),
                      ("Linear damping"),
                      ("Displacement"),
                      "res/physics-deprecated16.png")
        .AddParameter("object", ("Object"))
        .AddParameter("behavior", ("Behavior"), "PhysicsBehavior")
        .AddCodeOnlyParameter("currentScene", "")
        .SetFunctionName("GetLinearDamping");

    aut.AddExpression("AngularDamping",
                      ("Angular damping"),
                      ("Angular damping"),
                      ("Rotation"),
                      "res/physics-deprecated16.png")
        .AddParameter("object", ("Object"))
        .AddParameter("behavior", ("Behavior"), "PhysicsBehavior")
        .AddCodeOnlyParameter("currentScene", "")
        .SetFunctionName("GetAngularDamping");
  }
}

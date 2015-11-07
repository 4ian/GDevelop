/**

GDevelop - Particle System Extension
Copyright (c) 2010-2015 Florian Rival (Florian.Rival@gmail.com)
This project is released under the MIT License.
*/

#include "GDCpp/Extensions/ExtensionBase.h"
#include "GDCore/Tools/Version.h"
#include "Extension.h"
#include "ParticleEmitterObject.h"
#include "ParticleEmitterObject.h"

/**
 * Declare some actions and conditions of the particle emitter
 */
void Extension::ExtensionSubDeclaration1(gd::ObjectMetadata & obj)
{
    #if defined(GD_IDE_ONLY)
    obj.AddAction("EmitterForceMin",
                   _("Emission minimal force"),
                   _("Modify minimal emission force of particles."),
                   _("Do _PARAM1__PARAM2_ to minimal emission force of _PARAM0_"),
                   _("Common"),
                   "CppPlatform/Extensions/particleSystemicon24.png",
                   "CppPlatform/Extensions/particleSystemicon16.png")
        .AddParameter("object", _("Object"), "ParticleEmitter")
        .AddParameter("operator", _("Modification's sign"))
        .AddParameter("expression", _("Value"))

        .SetFunctionName("SetEmitterForceMin").SetManipulatedType("number").SetGetter("GetEmitterForceMin").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");

    obj.AddAction("EmitterForceMax",
                   _("Emission maximal force"),
                   _("Modify maximal emission force of particles."),
                   _("Do _PARAM1__PARAM2_ to maximal emission force of _PARAM0_"),
                   _("Common"),
                   "CppPlatform/Extensions/particleSystemicon24.png",
                   "CppPlatform/Extensions/particleSystemicon16.png")
        .AddParameter("object", _("Object"), "ParticleEmitter")
        .AddParameter("operator", _("Modification's sign"))
        .AddParameter("expression", _("Value"))

        .SetFunctionName("SetEmitterForceMax").SetManipulatedType("number").SetGetter("GetEmitterForceMax").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");

    obj.AddAction("EmitterXDirection",
                   _("Emission X direction"),
                   _("Modify emission X direction."),
                   _("Do _PARAM1__PARAM2_ to the emission X direction of _PARAM0_"),
                   _("Advanced"),
                   "CppPlatform/Extensions/particleSystemicon24.png",
                   "CppPlatform/Extensions/particleSystemicon16.png")
        .AddParameter("object", _("Object"), "ParticleEmitter")
        .AddParameter("operator", _("Modification's sign"))
        .AddParameter("expression", _("Value"))

        .SetFunctionName("SetEmitterXDirection").SetManipulatedType("number").SetGetter("GetEmitterXDirection").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");

    obj.AddCondition("EmitterXDirection",
                   _("Emission X direction"),
                   _("Test emission X direction."),
                   _("The emission X direction of _PARAM0_ is _PARAM1__PARAM2_"),
                   _("Advanced"),
                   "CppPlatform/Extensions/particleSystemicon24.png",
                   "CppPlatform/Extensions/particleSystemicon16.png")
        .AddParameter("object", _("Object"), "ParticleEmitter")
        .AddParameter("relationalOperator", _("Sign of the test"))
        .AddParameter("expression", _("Value to test"))

        .SetFunctionName("GetEmitterXDirection").SetManipulatedType("number").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");


    obj.AddAction("EmitterYDirection",
                   _("Emission Y direction"),
                   _("Modify emission Y direction."),
                   _("Do _PARAM1__PARAM2_ to the emission Y direction of _PARAM0_"),
                   _("Advanced"),
                   "CppPlatform/Extensions/particleSystemicon24.png",
                   "CppPlatform/Extensions/particleSystemicon16.png")
        .AddParameter("object", _("Object"), "ParticleEmitter")
        .AddParameter("operator", _("Modification's sign"))
        .AddParameter("expression", _("Value"))

        .SetFunctionName("SetEmitterYDirection").SetManipulatedType("number").SetGetter("GetEmitterYDirection").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");

    obj.AddCondition("EmitterYDirection",
                   _("Emission Y direction"),
                   _("Test emission Y direction."),
                   _("Emission Y direction of _PARAM0_ is _PARAM1__PARAM2_"),
                   _("Advanced"),
                   "CppPlatform/Extensions/particleSystemicon24.png",
                   "CppPlatform/Extensions/particleSystemicon16.png")
        .AddParameter("object", _("Object"), "ParticleEmitter")
        .AddParameter("relationalOperator", _("Sign of the test"))
        .AddParameter("expression", _("Value to test"))

        .SetFunctionName("GetEmitterYDirection").SetManipulatedType("number").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");


    obj.AddAction("EmitterZDirection",
                   _("Emission Z direction"),
                   _("Modify emission Z direction."),
                   _("Do _PARAM1__PARAM2_ to the emission Z direction of _PARAM0_"),
                   _("Advanced"),
                   "CppPlatform/Extensions/particleSystemicon24.png",
                   "CppPlatform/Extensions/particleSystemicon16.png")
        .AddParameter("object", _("Object"), "ParticleEmitter")
        .AddParameter("operator", _("Modification's sign"))
        .AddParameter("expression", _("Value"))

        .SetFunctionName("SetEmitterZDirection").SetManipulatedType("number").SetGetter("GetEmitterZDirection").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");


    obj.AddCondition("EmitterZDirection",
                   _("Emission Z direction"),
                   _("Test emission Z direction."),
                   _("Emission Z direction of _PARAM0_ is _PARAM1__PARAM2_"),
                   _("Advanced"),
                   "CppPlatform/Extensions/particleSystemicon24.png",
                   "CppPlatform/Extensions/particleSystemicon16.png")
        .AddParameter("object", _("Object"), "ParticleEmitter")
        .AddParameter("relationalOperator", _("Sign of the test"))
        .AddParameter("expression", _("Value to test"))

        .SetFunctionName("GetEmitterZDirection").SetManipulatedType("number").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");


    obj.AddAction("EmitterAngle",
                   _("Emission angle"),
                   _("Modify emission angle."),
                   _("Do _PARAM1__PARAM2_ to the emission angle of _PARAM0_"),
                   _("Common"),
                   "CppPlatform/Extensions/particleSystemicon24.png",
                   "CppPlatform/Extensions/particleSystemicon16.png")
        .AddParameter("object", _("Object"), "ParticleEmitter")
        .AddParameter("operator", _("Modification's sign"))
        .AddParameter("expression", _("Value"))

        .SetFunctionName("SetAngle").SetManipulatedType("number").SetGetter("GetAngle").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");


    obj.AddCondition("EmitterAngle",
                   _("Emission angle"),
                   _("Test the value of emission angle of the emitter."),
                   _("Emission angle of _PARAM0_ is _PARAM1__PARAM2_"),
                   _("Common"),
                   "CppPlatform/Extensions/particleSystemicon24.png",
                   "CppPlatform/Extensions/particleSystemicon16.png")
        .AddParameter("object", _("Object"), "ParticleEmitter")
        .AddParameter("relationalOperator", _("Sign of the test"))
        .AddParameter("expression", _("Value to test"))

        .SetFunctionName("GetAngle").SetManipulatedType("number").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");

    obj.AddAction("EmitterAngleA",
                   _("Emission angle 1"),
                   _("Change emission angle #1"),
                   _("Do _PARAM1__PARAM2_ to the 1st emission angle of _PARAM0_"),
                   _("Advanced"),
                   "CppPlatform/Extensions/particleSystemicon24.png",
                   "CppPlatform/Extensions/particleSystemicon16.png")
        .AddParameter("object", _("Object"), "ParticleEmitter")
        .AddParameter("operator", _("Modification's sign"))
        .AddParameter("expression", _("Value"))

        .SetFunctionName("SetEmitterAngleA").SetManipulatedType("number").SetGetter("GetEmitterAngleA").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");


    obj.AddCondition("EmitterAngleA",
                   _("Emission angle 1"),
                   _("Test the value of emission 1st angle of the emitter"),
                   _("Emission 1st angle of _PARAM0_ is _PARAM1__PARAM2_"),
                   _("Advanced"),
                   "CppPlatform/Extensions/particleSystemicon24.png",
                   "CppPlatform/Extensions/particleSystemicon16.png")
        .AddParameter("object", _("Object"), "ParticleEmitter")
        .AddParameter("relationalOperator", _("Sign of the test"))
        .AddParameter("expression", _("Value to test"))

        .SetFunctionName("GetEmitterAngleA").SetManipulatedType("number").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");


    obj.AddAction("EmitterAngleB",
                   _("Emission angle 2"),
                   _("Change emission angle #2"),
                   _("Do _PARAM1__PARAM2_ to the 2nd emission angle of _PARAM0_"),
                   _("Advanced"),
                   "CppPlatform/Extensions/particleSystemicon24.png",
                   "CppPlatform/Extensions/particleSystemicon16.png")
        .AddParameter("object", _("Object"), "ParticleEmitter")
        .AddParameter("operator", _("Modification's sign"))
        .AddParameter("expression", _("Value"))

        .SetFunctionName("SetEmitterAngleB").SetManipulatedType("number").SetGetter("GetEmitterAngleB").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");


    obj.AddCondition("EmitterAngleB",
                   _("Emission angle 2"),
                   _("Test the emission angle #2 of the emitter."),
                   _("Emission 2nd angle of _PARAM0_ is _PARAM1__PARAM2_"),
                   _("Advanced"),
                   "CppPlatform/Extensions/particleSystemicon24.png",
                   "CppPlatform/Extensions/particleSystemicon16.png")
        .AddParameter("object", _("Object"), "ParticleEmitter")
        .AddParameter("relationalOperator", _("Sign of the test"))
        .AddParameter("expression", _("Value to test"))

        .SetFunctionName("GetEmitterAngleB").SetManipulatedType("number").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");


    obj.AddAction("ConeSprayAngle",
                   _("Angle of the spray cone"),
                   _("Modify the angle of the spray cone."),
                   _("Do _PARAM1__PARAM2_ to the angle of the spray cone of _PARAM0_"),
                   _("Common"),
                   "CppPlatform/Extensions/particleSystemicon24.png",
                   "CppPlatform/Extensions/particleSystemicon16.png")
        .AddParameter("object", _("Object"), "ParticleEmitter")
        .AddParameter("operator", _("Modification's sign"))
        .AddParameter("expression", _("Value"))

        .SetFunctionName("SetConeSprayAngle").SetManipulatedType("number").SetGetter("GetConeSprayAngle").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");

    obj.AddCondition("ConeSprayAngle",
                   _("Angle of the spray cone"),
                   _("Test the angle of the spray cone of the emitter"),
                   _("Angle of the spray cone of _PARAM0_ is _PARAM1__PARAM2_"),
                   _("Common"),
                   "CppPlatform/Extensions/particleSystemicon24.png",
                   "CppPlatform/Extensions/particleSystemicon16.png")
        .AddParameter("object", _("Object"), "ParticleEmitter")
        .AddParameter("relationalOperator", _("Sign of the test"))
        .AddParameter("expression", _("Value to test"))

        .SetFunctionName("GetConeSprayAngle").SetManipulatedType("number").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");

    obj.AddAction("Friction",
                   _("Friction"),
                   _("Modify friction applied to particles."),
                   _("Do _PARAM1__PARAM2_ to the friction of particles of _PARAM0_"),
                   _("Common"),
                   "CppPlatform/Extensions/particleSystemicon24.png",
                   "CppPlatform/Extensions/particleSystemicon16.png")
        .AddParameter("object", _("Object"), "ParticleEmitter")
        .AddParameter("operator", _("Modification's sign"))
        .AddParameter("expression", _("Value"))

        .SetFunctionName("SetFriction").SetManipulatedType("number").SetGetter("GetFriction").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");


    obj.AddCondition("Friction",
                   _("Friction"),
                   _("Test friction applied to particles."),
                   _("Particles' friction of _PARAM0_ is _PARAM1__PARAM2_"),
                   _("Common"),
                   "CppPlatform/Extensions/particleSystemicon24.png",
                   "CppPlatform/Extensions/particleSystemicon16.png")

        .AddParameter("object", _("Object"), "ParticleEmitter")
        .AddParameter("relationalOperator", _("Sign of the test"))
        .AddParameter("expression", _("Value to test"))

        .SetFunctionName("GetFriction").SetManipulatedType("number").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");


    obj.AddAction("ZoneRadius",
                   _("Creation radius"),
                   _("Modify creation radius of particles.\nParticles have to be recreated in order to take changes in account."),
                   _("Do _PARAM1__PARAM2_ to creation radius of _PARAM0_"),
                   _("Common"),
                   "CppPlatform/Extensions/particleSystemicon24.png",
                   "CppPlatform/Extensions/particleSystemicon16.png")
        .AddParameter("object", _("Object"), "ParticleEmitter")
        .AddParameter("operator", _("Modification's sign"))
        .AddParameter("expression", _("Value"))

        .SetFunctionName("SetZoneRadius").SetManipulatedType("number").SetGetter("GetZoneRadius").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");


    obj.AddCondition("ZoneRadius",
                   _("Creation radius"),
                   _("Test creation radius of particles."),
                   _("Creation radius of _PARAM0_ is _PARAM1__PARAM2_"),
                   _("Common"),
                   "CppPlatform/Extensions/particleSystemicon24.png",
                   "CppPlatform/Extensions/particleSystemicon16.png")
        .AddParameter("object", _("Object"), "ParticleEmitter")
        .AddParameter("relationalOperator", _("Sign of the test"))
        .AddParameter("expression", _("Value to test"))

        .SetFunctionName("GetZoneRadius").SetManipulatedType("number").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");


    obj.AddAction("ParticleLifeTimeMin",
                   _("Minimum lifetime"),
                   _("Modify particles minimum lifetime.Particles have to be recreated in order to take changes in account."),
                   _("Do _PARAM1__PARAM2_ to minimum lifetime of particles of _PARAM0_"),
                   _("Common"),
                   "CppPlatform/Extensions/particleSystemicon24.png",
                   "CppPlatform/Extensions/particleSystemicon16.png")
        .AddParameter("object", _("Object"), "ParticleEmitter")
        .AddParameter("operator", _("Modification's sign"))
        .AddParameter("expression", _("Value"))

        .SetFunctionName("SetParticleLifeTimeMin").SetManipulatedType("number").SetGetter("GetParticleLifeTimeMin").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");

    obj.AddCondition("ParticleLifeTimeMin",
                   _("Minimum lifetime"),
                   _("Test minimum lifetime of particles."),
                   _("Minimum lifetime of particles of _PARAM0_ is _PARAM1__PARAM2_"),
                   _("Common"),
                   "CppPlatform/Extensions/particleSystemicon24.png",
                   "CppPlatform/Extensions/particleSystemicon16.png")
        .AddParameter("object", _("Object"), "ParticleEmitter")
        .AddParameter("relationalOperator", _("Sign of the test"))
        .AddParameter("expression", _("Value to test"))

        .SetFunctionName("GetParticleLifeTimeMin").SetManipulatedType("number").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");

    obj.AddAction("ParticleLifeTimeMax",
                   _("Maximum lifetime"),
                   _("Modify particles maximum lifetime.\nParticles have to be recreated in order to take changes in account."),
                   _("Do _PARAM1__PARAM2_ to maximum lifetime of particles of _PARAM0_"),
                   _("Common"),
                   "CppPlatform/Extensions/particleSystemicon24.png",
                   "CppPlatform/Extensions/particleSystemicon16.png")
        .AddParameter("object", _("Object"), "ParticleEmitter")
        .AddParameter("operator", _("Modification's sign"))
        .AddParameter("expression", _("Value"))

        .SetFunctionName("SetParticleLifeTimeMax").SetManipulatedType("number").SetGetter("GetParticleLifeTimeMax").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");


    obj.AddCondition("ParticleLifeTimeMax",
                   _("Maximum lifetime"),
                   _("Test maximum lifetime of particles."),
                   _("Maximum lifetime of particles of _PARAM0_ is _PARAM1__PARAM2_"),
                   _("Common"),
                   "CppPlatform/Extensions/particleSystemicon24.png",
                   "CppPlatform/Extensions/particleSystemicon16.png")
        .AddParameter("object", _("Object"), "ParticleEmitter")
        .AddParameter("relationalOperator", _("Sign of the test"))
        .AddParameter("expression", _("Value to test"))

        .SetFunctionName("GetParticleLifeTimeMax").SetManipulatedType("number").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");


    obj.AddAction("ParticleGravityX",
                   _("X Gravity"),
                   _("Change value of the gravity on X axis."),
                   _("Do _PARAM1__PARAM2_ to the direction of gravity on X axis of _PARAM0_"),
                   _("Advanced"),
                   "CppPlatform/Extensions/particleSystemicon24.png",
                   "CppPlatform/Extensions/particleSystemicon16.png")
        .AddParameter("object", _("Object"), "ParticleEmitter")
        .AddParameter("operator", _("Modification's sign"))
        .AddParameter("expression", _("Value"))

        .SetFunctionName("SetParticleGravityX").SetManipulatedType("number").SetGetter("GetParticleGravityX").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");


    obj.AddCondition("ParticleGravityX",
                   _("Direction of gravity on X axis"),
                   _("Direction of the gravity on X axis."),
                   _("Direction of gravity on X axis of _PARAM0_ is _PARAM1__PARAM2_"),
                   _("Advanced"),
                   "CppPlatform/Extensions/particleSystemicon24.png",
                   "CppPlatform/Extensions/particleSystemicon16.png")
        .AddParameter("object", _("Object"), "ParticleEmitter")
        .AddParameter("relationalOperator", _("Sign of the test"))
        .AddParameter("expression", _("Value to test"))

        .SetFunctionName("GetParticleGravityX").SetManipulatedType("number").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");


    obj.AddAction("ParticleGravityY",
                   _("Y Gravity"),
                   _("Change value of the gravity on Y axis."),
                   _("Do _PARAM1__PARAM2_ to the direction of gravity on Y axis of_PARAM0_"),
                   _("Advanced"),
                   "CppPlatform/Extensions/particleSystemicon24.png",
                   "CppPlatform/Extensions/particleSystemicon16.png")
        .AddParameter("object", _("Object"), "ParticleEmitter")
        .AddParameter("operator", _("Modification's sign"))
        .AddParameter("expression", _("Value"))

        .SetFunctionName("SetParticleGravityY").SetManipulatedType("number").SetGetter("GetParticleGravityY").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");


    obj.AddCondition("ParticleGravityY",
                   _("Direction of the gravity on Y axis"),
                   _("Test direction of gravity on Y axis"),
                   _("Direction of gravity on Y axis of _PARAM0_ is _PARAM1__PARAM2_"),
                   _("Advanced"),
                   "CppPlatform/Extensions/particleSystemicon24.png",
                   "CppPlatform/Extensions/particleSystemicon16.png")
        .AddParameter("object", _("Object"), "ParticleEmitter")
        .AddParameter("relationalOperator", _("Sign of the test"))
        .AddParameter("expression", _("Value to test"))

        .SetFunctionName("GetParticleGravityY").SetManipulatedType("number").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");


    obj.AddAction("ParticleGravityZ",
                   _("Z Gravity"),
                   _("Change value of the gravity on Z axis."),
                   _("Do _PARAM1__PARAM2_ to the direction of gravity on Z axis of_PARAM0_"),
                   _("Advanced"),
                   "CppPlatform/Extensions/particleSystemicon24.png",
                   "CppPlatform/Extensions/particleSystemicon16.png")
        .AddParameter("object", _("Object"), "ParticleEmitter")
        .AddParameter("operator", _("Modification's sign"))
        .AddParameter("expression", _("Value"))

        .SetFunctionName("SetParticleGravityZ").SetManipulatedType("number").SetGetter("GetParticleGravityZ").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");


    obj.AddCondition("ParticleGravityZ",
                   _("Direction of gravity on Z axis"),
                   _("Test the direction of gravity on Z axis"),
                   _("Direction of gravity on Z axis of _PARAM0_ is _PARAM1__PARAM2_"),
                   _("Advanced"),
                   "CppPlatform/Extensions/particleSystemicon24.png",
                   "CppPlatform/Extensions/particleSystemicon16.png")
        .AddParameter("object", _("Object"), "ParticleEmitter")
        .AddParameter("relationalOperator", _("Sign of the test"))
        .AddParameter("expression", _("Value to test"))

        .SetFunctionName("GetParticleGravityZ").SetManipulatedType("number").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");

    obj.AddAction("ParticleGravityAngle",
                   _("Gravity angle"),
                   _("Change gravity angle"),
                   _("Do _PARAM1__PARAM2_ to the gravity angle of _PARAM0_"),
                   _("Common"),
                   "CppPlatform/Extensions/particleSystemicon24.png",
                   "CppPlatform/Extensions/particleSystemicon16.png")
        .AddParameter("object", _("Object"), "ParticleEmitter")
        .AddParameter("operator", _("Modification's sign"))
        .AddParameter("expression", _("Value"))

        .SetFunctionName("SetParticleGravityAngle").SetManipulatedType("number").SetGetter("GetParticleGravityAngle").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");

    obj.AddCondition("ParticleGravityAngle",
                   _("Gravity angle"),
                   _("Test the gravity angle the emitter"),
                   _("Gravity angle of _PARAM0_ is _PARAM1__PARAM2_"),
                   _("Common"),
                   "CppPlatform/Extensions/particleSystemicon24.png",
                   "CppPlatform/Extensions/particleSystemicon16.png")
        .AddParameter("object", _("Object"), "ParticleEmitter")
        .AddParameter("relationalOperator", _("Sign of the test"))
        .AddParameter("expression", _("Value to test"))

        .SetFunctionName("GetParticleGravityAngle").SetManipulatedType("number").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");

    obj.AddAction("ParticleGravityLength",
                   _("Gravity"),
                   _("Change the gravity of the emitter."),
                   _("Do _PARAM1__PARAM2_ to the gravity of _PARAM0_"),
                   _("Common"),
                   "CppPlatform/Extensions/particleSystemicon24.png",
                   "CppPlatform/Extensions/particleSystemicon16.png")
        .AddParameter("object", _("Object"), "ParticleEmitter")
        .AddParameter("operator", _("Modification's sign"))
        .AddParameter("expression", _("Value"))

        .SetFunctionName("SetParticleGravityLength").SetManipulatedType("number").SetGetter("GetParticleGravityLength").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");

    obj.AddCondition("ParticleGravityLength",
                   _("Gravity"),
                   _("Test the gravity of the emitter."),
                   _("The gravity of _PARAM0_ is _PARAM1__PARAM2_"),
                   _("Common"),
                   "CppPlatform/Extensions/particleSystemicon24.png",
                   "CppPlatform/Extensions/particleSystemicon16.png")
        .AddParameter("object", _("Object"), "ParticleEmitter")
        .AddParameter("relationalOperator", _("Sign of the test"))
        .AddParameter("expression", _("Value to test"))

        .SetFunctionName("GetParticleGravityLength").SetManipulatedType("number").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");
    #endif
}


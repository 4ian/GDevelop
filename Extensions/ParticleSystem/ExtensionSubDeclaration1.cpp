/**

GDevelop - Particle System Extension
Copyright (c) 2010-2016 Florian Rival (Florian.Rival@gmail.com)
This project is released under the MIT License.
*/

#include "GDCpp/Extensions/ExtensionBase.h"

#include "Extension.h"
#include "ParticleEmitterObject.h"

/**
 * Declare some actions and conditions of the particle emitter
 */
void ExtensionSubDeclaration1(gd::ObjectMetadata& obj) {
#if defined(GD_IDE_ONLY)
  obj.AddAction("EmitterForceMin",
                _("Emission minimal force"),
                _("Modify minimal emission force of particles."),
                _("the minimal emission force"),
                _("Common"),
                "CppPlatform/Extensions/particleSystemicon24.png",
                "CppPlatform/Extensions/particleSystemicon16.png")
      .AddParameter("object", _("Object"), "ParticleEmitter")
      .UseStandardOperatorParameters("number");

  obj.AddAction("EmitterForceMax",
                _("Emission maximal force"),
                _("Modify maximal emission force of particles."),
                _("the maximal emission force"),
                _("Common"),
                "CppPlatform/Extensions/particleSystemicon24.png",
                "CppPlatform/Extensions/particleSystemicon16.png")
      .AddParameter("object", _("Object"), "ParticleEmitter")
      .UseStandardOperatorParameters("number");

  obj.AddAction(
         "EmitterXDirection",
         _("Emission X direction"),
         _("Modify emission X direction."),
         _("the emission X direction"),
         _("Advanced"),
         "CppPlatform/Extensions/particleSystemicon24.png",
         "CppPlatform/Extensions/particleSystemicon16.png")
      .AddParameter("object", _("Object"), "ParticleEmitter")
      .UseStandardOperatorParameters("number");

  obj.AddCondition(
         "EmitterXDirection",
         _("Emission X direction"),
         _("Test emission X direction."),
         _("the emission X direction"),
         _("Advanced"),
         "CppPlatform/Extensions/particleSystemicon24.png",
         "CppPlatform/Extensions/particleSystemicon16.png")
      .AddParameter("object", _("Object"), "ParticleEmitter")
      .UseStandardRelationalOperatorParameters("number");

  obj.AddAction(
         "EmitterYDirection",
         _("Emission Y direction"),
         _("Modify emission Y direction."),
         _("the emission Y direction"),
         _("Advanced"),
         "CppPlatform/Extensions/particleSystemicon24.png",
         "CppPlatform/Extensions/particleSystemicon16.png")
      .AddParameter("object", _("Object"), "ParticleEmitter")
      .UseStandardOperatorParameters("number");

  obj.AddCondition("EmitterYDirection",
                   _("Emission Y direction"),
                   _("Test emission Y direction."),
                   _("the emission Y direction"),
                   _("Advanced"),
                   "CppPlatform/Extensions/particleSystemicon24.png",
                   "CppPlatform/Extensions/particleSystemicon16.png")
      .AddParameter("object", _("Object"), "ParticleEmitter")
      .UseStandardRelationalOperatorParameters("number");

  obj.AddAction(
         "EmitterZDirection",
         _("Emission Z direction"),
         _("Modify emission Z direction."),
         _("the emission Z direction"),
         _("Advanced"),
         "CppPlatform/Extensions/particleSystemicon24.png",
         "CppPlatform/Extensions/particleSystemicon16.png")
      .AddParameter("object", _("Object"), "ParticleEmitter")
      .UseStandardOperatorParameters("number");

  obj.AddCondition("EmitterZDirection",
                   _("Emission Z direction"),
                   _("Test emission Z direction."),
                   _("the emission Z direction"),
                   _("Advanced"),
                   "CppPlatform/Extensions/particleSystemicon24.png",
                   "CppPlatform/Extensions/particleSystemicon16.png")
      .AddParameter("object", _("Object"), "ParticleEmitter")
      .UseStandardRelationalOperatorParameters("number");

  obj.AddAction("EmitterAngle",
                _("Emission angle"),
                _("Modify emission angle."),
                _("the emission angle"),
                _("Common"),
                "CppPlatform/Extensions/particleSystemicon24.png",
                "CppPlatform/Extensions/particleSystemicon16.png")
      .AddParameter("object", _("Object"), "ParticleEmitter")
      .UseStandardOperatorParameters("number")
      .SetFunctionName("SetAngle")
      .SetGetter("GetAngle")
      .SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");

  obj.AddCondition("EmitterAngle",
                   _("Emission angle"),
                   _("Test the value of emission angle of the emitter."),
                   _("the emission angle"),
                   _("Common"),
                   "CppPlatform/Extensions/particleSystemicon24.png",
                   "CppPlatform/Extensions/particleSystemicon16.png")
      .AddParameter("object", _("Object"), "ParticleEmitter")
      .UseStandardRelationalOperatorParameters("number");

  obj.AddAction("EmitterAngleA",
                _("Emission angle 1"),
                _("Change emission angle #1"),
                _("the 1st emission angle"),
                _("Advanced"),
                "CppPlatform/Extensions/particleSystemicon24.png",
                "CppPlatform/Extensions/particleSystemicon16.png")
      .AddParameter("object", _("Object"), "ParticleEmitter")
      .UseStandardOperatorParameters("number");

  obj.AddCondition("EmitterAngleA",
                   _("Emission angle 1"),
                   _("Test the value of emission 1st angle of the emitter"),
                   _("the 1st emission angle"),
                   _("Advanced"),
                   "CppPlatform/Extensions/particleSystemicon24.png",
                   "CppPlatform/Extensions/particleSystemicon16.png")
      .AddParameter("object", _("Object"), "ParticleEmitter")
      .UseStandardRelationalOperatorParameters("number");

  obj.AddAction("EmitterAngleB",
                _("Emission angle 2"),
                _("Change emission angle #2"),
                _("the 2nd emission angle"),
                _("Advanced"),
                "CppPlatform/Extensions/particleSystemicon24.png",
                "CppPlatform/Extensions/particleSystemicon16.png")
      .AddParameter("object", _("Object"), "ParticleEmitter")
      .UseStandardOperatorParameters("number");

  obj.AddCondition("EmitterAngleB",
                   _("Emission angle 2"),
                   _("Test the emission angle #2 of the emitter."),
                   _("the 2nd emission angle"),
                   _("Advanced"),
                   "CppPlatform/Extensions/particleSystemicon24.png",
                   "CppPlatform/Extensions/particleSystemicon16.png")
      .AddParameter("object", _("Object"), "ParticleEmitter")
      .UseStandardRelationalOperatorParameters("number");

  obj.AddAction(
         "ConeSprayAngle",
         _("Angle of the spray cone"),
         _("Modify the angle of the spray cone."),
         _("the angle of the spray cone"),
         _("Common"),
         "CppPlatform/Extensions/particleSystemicon24.png",
         "CppPlatform/Extensions/particleSystemicon16.png")
      .AddParameter("object", _("Object"), "ParticleEmitter")
      .UseStandardOperatorParameters("number");

  obj.AddCondition("ConeSprayAngle",
                   _("Angle of the spray cone"),
                   _("Test the angle of the spray cone of the emitter"),
                   _("the angle of the spray cone"),
                   _("Common"),
                   "CppPlatform/Extensions/particleSystemicon24.png",
                   "CppPlatform/Extensions/particleSystemicon16.png")
      .AddParameter("object", _("Object"), "ParticleEmitter")
      .UseStandardRelationalOperatorParameters("number");

  obj.AddAction(
         "Friction",
         _("Friction"),
         _("Modify friction applied to particles."),
         _("the friction of particles"),
         _("Common"),
         "CppPlatform/Extensions/particleSystemicon24.png",
         "CppPlatform/Extensions/particleSystemicon16.png")
      .AddParameter("object", _("Object"), "ParticleEmitter")
      .UseStandardOperatorParameters("number")
      .GetCodeExtraInformation()
      .SetGetter("GetFriction");

  obj.AddCondition("Friction",
                   _("Friction"),
                   _("Test friction applied to particles."),
                   _("the friction of particles"),
                   _("Common"),
                   "CppPlatform/Extensions/particleSystemicon24.png",
                   "CppPlatform/Extensions/particleSystemicon16.png")

      .AddParameter("object", _("Object"), "ParticleEmitter")
      .UseStandardRelationalOperatorParameters("number");

  obj.AddAction("ZoneRadius",
                _("Creation radius"),
                _("Modify creation radius of particles.\nParticles have to be "
                  "recreated in order to take changes in account."),
                _("the creation radius"),
                _("Common"),
                "CppPlatform/Extensions/particleSystemicon24.png",
                "CppPlatform/Extensions/particleSystemicon16.png")
      .AddParameter("object", _("Object"), "ParticleEmitter")
      .UseStandardOperatorParameters("number");

  obj.AddCondition("ZoneRadius",
                   _("Creation radius"),
                   _("Test creation radius of particles."),
                   _("the creation radius"),
                   _("Common"),
                   "CppPlatform/Extensions/particleSystemicon24.png",
                   "CppPlatform/Extensions/particleSystemicon16.png")
      .AddParameter("object", _("Object"), "ParticleEmitter")
      .UseStandardRelationalOperatorParameters("number");

  obj.AddAction(
         "ParticleLifeTimeMin",
         _("Minimum lifetime"),
         _("Modify particles minimum lifetime.Particles have to be recreated "
           "in order to take changes in account."),
         _("the minimum lifetime of particles"),
         _("Common"),
         "CppPlatform/Extensions/particleSystemicon24.png",
         "CppPlatform/Extensions/particleSystemicon16.png")
      .AddParameter("object", _("Object"), "ParticleEmitter")
      .UseStandardOperatorParameters("number");

  obj.AddCondition(
         "ParticleLifeTimeMin",
         _("Minimum lifetime"),
         _("Test minimum lifetime of particles."),
         _("the minimum lifetime of particles"),
         _("Common"),
         "CppPlatform/Extensions/particleSystemicon24.png",
         "CppPlatform/Extensions/particleSystemicon16.png")
      .AddParameter("object", _("Object"), "ParticleEmitter")
      .UseStandardRelationalOperatorParameters("number");

  obj.AddAction(
         "ParticleLifeTimeMax",
         _("Maximum lifetime"),
         _("Modify particles maximum lifetime.\nParticles have to be recreated "
           "in order to take changes in account."),
         _("the maximum lifetime of particles"),
         _("Common"),
         "CppPlatform/Extensions/particleSystemicon24.png",
         "CppPlatform/Extensions/particleSystemicon16.png")
      .AddParameter("object", _("Object"), "ParticleEmitter")
      .UseStandardOperatorParameters("number");

  obj.AddCondition(
         "ParticleLifeTimeMax",
         _("Maximum lifetime"),
         _("Test maximum lifetime of particles."),
         _("the maximum lifetime of particles"),
         _("Common"),
         "CppPlatform/Extensions/particleSystemicon24.png",
         "CppPlatform/Extensions/particleSystemicon16.png")
      .AddParameter("object", _("Object"), "ParticleEmitter")
      .UseStandardRelationalOperatorParameters("number");

  obj.AddAction("ParticleGravityX",
                _("Gravity value on X axis"),
                _("Change value of the gravity on X axis."),
                _("the gravity on X axis"),
                _("Advanced"),
                "CppPlatform/Extensions/particleSystemicon24.png",
                "CppPlatform/Extensions/particleSystemicon16.png")
      .AddParameter("object", _("Object"), "ParticleEmitter")
      .UseStandardOperatorParameters("number");

  obj.AddCondition(
         "ParticleGravityX",
         _("Gravity value on X axis"),
         _("Compare value of the gravity on X axis."),
         _("the gravity on X axis"),
         _("Advanced"),
         "CppPlatform/Extensions/particleSystemicon24.png",
         "CppPlatform/Extensions/particleSystemicon16.png")
      .AddParameter("object", _("Object"), "ParticleEmitter")
      .UseStandardRelationalOperatorParameters("number");

  obj.AddAction("ParticleGravityY",
                _("Gravity value on Y axis"),
                _("Change value of the gravity on Y axis."),
                _("the gravity on Y axis"),
                _("Advanced"),
                "CppPlatform/Extensions/particleSystemicon24.png",
                "CppPlatform/Extensions/particleSystemicon16.png")
      .AddParameter("object", _("Object"), "ParticleEmitter")
      .UseStandardOperatorParameters("number");

  obj.AddCondition(
         "ParticleGravityY",
         _("Gravity value on Y axis"),
         _("Compare value of the gravity on Y axis."),
         _("the gravity on Y axis"),
         _("Advanced"),
         "CppPlatform/Extensions/particleSystemicon24.png",
         "CppPlatform/Extensions/particleSystemicon16.png")
      .AddParameter("object", _("Object"), "ParticleEmitter")
      .UseStandardRelationalOperatorParameters("number");

  obj.AddAction("ParticleGravityZ",
                _("Z Gravity"),
                _("Change value of the gravity on Z axis."),
                _("the gravity direction on Z axis of_PARAM0_"),
                _("Advanced"),
                "CppPlatform/Extensions/particleSystemicon24.png",
                "CppPlatform/Extensions/particleSystemicon16.png")
      .AddParameter("object", _("Object"), "ParticleEmitter")
      .UseStandardOperatorParameters("number");

  obj.AddCondition(
         "ParticleGravityZ",
         _("Direction of gravity on Z axis"),
         _("Test the direction of gravity on Z axis"),
         _("the gravity direction on Z axis"),
         _("Advanced"),
         "CppPlatform/Extensions/particleSystemicon24.png",
         "CppPlatform/Extensions/particleSystemicon16.png")
      .AddParameter("object", _("Object"), "ParticleEmitter")
      .UseStandardRelationalOperatorParameters("number");

  obj.AddAction("ParticleGravityAngle",
                _("Gravity angle"),
                _("Change gravity angle"),
                _("the gravity angle"),
                _("Common"),
                "CppPlatform/Extensions/particleSystemicon24.png",
                "CppPlatform/Extensions/particleSystemicon16.png")
      .AddParameter("object", _("Object"), "ParticleEmitter")
      .UseStandardOperatorParameters("number");

  obj.AddCondition("ParticleGravityAngle",
                   _("Gravity angle"),
                   _("Test the gravity angle of the emitter"),
                   _("the gravity angle"),
                   _("Common"),
                   "CppPlatform/Extensions/particleSystemicon24.png",
                   "CppPlatform/Extensions/particleSystemicon16.png")
      .AddParameter("object", _("Object"), "ParticleEmitter")
      .UseStandardRelationalOperatorParameters("number");

  obj.AddAction("ParticleGravityLength",
                _("Gravity"),
                _("Change the gravity of the emitter."),
                _("the gravity"),
                _("Common"),
                "CppPlatform/Extensions/particleSystemicon24.png",
                "CppPlatform/Extensions/particleSystemicon16.png")
      .AddParameter("object", _("Object"), "ParticleEmitter")
      .UseStandardOperatorParameters("number");

  obj.AddCondition("ParticleGravityLength",
                   _("Gravity"),
                   _("Test the gravity of the emitter."),
                   _("the gravity"),
                   _("Common"),
                   "CppPlatform/Extensions/particleSystemicon24.png",
                   "CppPlatform/Extensions/particleSystemicon16.png")
      .AddParameter("object", _("Object"), "ParticleEmitter")
      .UseStandardRelationalOperatorParameters("number");
#endif
}

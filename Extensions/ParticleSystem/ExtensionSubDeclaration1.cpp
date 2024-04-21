/**

GDevelop - Particle System Extension
Copyright (c) 2010-2016 Florian Rival (Florian.Rival@gmail.com)
This project is released under the MIT License.
*/

#include "Extension.h"
#include "GDCore/Extensions/PlatformExtension.h"
#include "GDCore/Tools/Localization.h"
#include "ParticleEmitterObject.h"

/**
 * Declare some actions and conditions of the particle emitter
 */
void ExtensionSubDeclaration1(gd::ObjectMetadata& obj) {
  obj.AddAction("EmitterForceMin",
                _("Emission minimal force"),
                _("Modify minimal emission force of particles."),
                _("the minimal emission force"),
                _("Common"),
                "CppPlatform/Extensions/particleSystemicon24.png",
                "CppPlatform/Extensions/particleSystemicon16.png")
      .AddParameter("object", _("Object"), "ParticleEmitter")
      .UseStandardOperatorParameters("number",
                                     gd::ParameterOptions::MakeNewOptions());

  obj.AddAction("EmitterForceMax",
                _("Emission maximal force"),
                _("Modify maximal emission force of particles."),
                _("the maximal emission force"),
                _("Common"),
                "CppPlatform/Extensions/particleSystemicon24.png",
                "CppPlatform/Extensions/particleSystemicon16.png")
      .AddParameter("object", _("Object"), "ParticleEmitter")
      .UseStandardOperatorParameters("number",
                                     gd::ParameterOptions::MakeNewOptions());

  obj.AddAction("EmitterAngle",
                _("Emission angle"),
                _("Modify emission angle."),
                _("the emission angle"),
                _("Common"),
                "CppPlatform/Extensions/particleSystemicon24.png",
                "CppPlatform/Extensions/particleSystemicon16.png")
      .AddParameter("object", _("Object"), "ParticleEmitter")
      .UseStandardOperatorParameters(
          "number",
          gd::ParameterOptions::MakeNewOptions().SetDescription(
              _("Angle (in degrees)")));

  obj.AddCondition("EmitterAngle",
                   _("Emission angle"),
                   _("Test the value of emission angle of the emitter."),
                   _("the emission angle"),
                   _("Common"),
                   "CppPlatform/Extensions/particleSystemicon24.png",
                   "CppPlatform/Extensions/particleSystemicon16.png")
      .AddParameter("object", _("Object"), "ParticleEmitter")
      .UseStandardRelationalOperatorParameters(
          "number",
          gd::ParameterOptions::MakeNewOptions().SetDescription(
              _("Angle to compare to (in degrees)")));

  obj.AddAction("EmitterAngleA",
                _("Emission angle 1"),
                _("Change emission angle #1"),
                _("the 1st emission angle"),
                _("Advanced"),
                "CppPlatform/Extensions/particleSystemicon24.png",
                "CppPlatform/Extensions/particleSystemicon16.png")
      .AddParameter("object", _("Object"), "ParticleEmitter")
      .UseStandardOperatorParameters("number",
                                     gd::ParameterOptions::MakeNewOptions())
      .SetHidden();  // Angle A is not used.

  obj.AddCondition("EmitterAngleA",
                   _("Emission angle 1"),
                   _("Test the value of emission 1st angle of the emitter"),
                   _("the 1st emission angle"),
                   _("Advanced"),
                   "CppPlatform/Extensions/particleSystemicon24.png",
                   "CppPlatform/Extensions/particleSystemicon16.png")
      .AddParameter("object", _("Object"), "ParticleEmitter")
      .UseStandardRelationalOperatorParameters(
          "number", gd::ParameterOptions::MakeNewOptions())
      .SetHidden();  // Angle A is not used.

  obj.AddAction("EmitterAngleB",
                _("Emission angle 2"),
                _("Change emission angle #2"),
                _("the 2nd emission angle"),
                _("Advanced"),
                "CppPlatform/Extensions/particleSystemicon24.png",
                "CppPlatform/Extensions/particleSystemicon16.png")
      .AddParameter("object", _("Object"), "ParticleEmitter")
      .UseStandardOperatorParameters("number",
                                     gd::ParameterOptions::MakeNewOptions())
      .SetHidden();  // Angle B is the same as cone spray angle

  obj.AddCondition("EmitterAngleB",
                   _("Emission angle 2"),
                   _("Test the emission angle #2 of the emitter."),
                   _("the 2nd emission angle"),
                   _("Advanced"),
                   "CppPlatform/Extensions/particleSystemicon24.png",
                   "CppPlatform/Extensions/particleSystemicon16.png")
      .AddParameter("object", _("Object"), "ParticleEmitter")
      .UseStandardRelationalOperatorParameters(
          "number", gd::ParameterOptions::MakeNewOptions())
      .SetHidden();  // Angle B is the same as cone spray angle

  obj.AddAction(
         "ConeSprayAngle",
         _("Angle of the spray cone"),
         _("Modify the angle of the spray cone."),
         _("the angle of the spray cone"),
         _("Common"),
         "CppPlatform/Extensions/particleSystemicon24.png",
         "CppPlatform/Extensions/particleSystemicon16.png")
      .AddParameter("object", _("Object"), "ParticleEmitter")
      .UseStandardOperatorParameters(
          "number",
          gd::ParameterOptions::MakeNewOptions().SetDescription(
              _("Angle (in degrees)")));

  obj.AddCondition("ConeSprayAngle",
                   _("Angle of the spray cone"),
                   _("Test the angle of the spray cone of the emitter"),
                   _("the angle of the spray cone"),
                   _("Common"),
                   "CppPlatform/Extensions/particleSystemicon24.png",
                   "CppPlatform/Extensions/particleSystemicon16.png")
      .AddParameter("object", _("Object"), "ParticleEmitter")
      .UseStandardRelationalOperatorParameters(
          "number",
          gd::ParameterOptions::MakeNewOptions().SetDescription(
              _("Angle to compare to (in degrees)")));

  obj.AddAction("ZoneRadius",
                _("Creation radius"),
                _("Modify creation radius of particles.\nParticles have to be "
                  "recreated in order to take changes in account."),
                _("the creation radius"),
                _("Common"),
                "CppPlatform/Extensions/particleSystemicon24.png",
                "CppPlatform/Extensions/particleSystemicon16.png")
      .AddParameter("object", _("Object"), "ParticleEmitter")
      .UseStandardOperatorParameters("number",
                                     gd::ParameterOptions::MakeNewOptions());

  obj.AddCondition("ZoneRadius",
                   _("Creation radius"),
                   _("Test creation radius of particles."),
                   _("the creation radius"),
                   _("Common"),
                   "CppPlatform/Extensions/particleSystemicon24.png",
                   "CppPlatform/Extensions/particleSystemicon16.png")
      .AddParameter("object", _("Object"), "ParticleEmitter")
      .UseStandardRelationalOperatorParameters(
          "number", gd::ParameterOptions::MakeNewOptions());

  obj.AddAction(
         "ParticleLifeTimeMin",
         _("Minimum lifetime"),
         _("Modify particles minimum lifetime. Particles have to be recreated "
           "in order to take changes in account."),
         _("the minimum lifetime of particles"),
         _("Common"),
         "CppPlatform/Extensions/particleSystemicon24.png",
         "CppPlatform/Extensions/particleSystemicon16.png")
      .AddParameter("object", _("Object"), "ParticleEmitter")
      .UseStandardOperatorParameters(
          "number",
          gd::ParameterOptions::MakeNewOptions().SetDescription(
              _("Duration (in seconds)")));

  obj.AddCondition(
         "ParticleLifeTimeMin",
         _("Minimum lifetime"),
         _("Test minimum lifetime of particles."),
         _("the minimum lifetime of particles"),
         _("Common"),
         "CppPlatform/Extensions/particleSystemicon24.png",
         "CppPlatform/Extensions/particleSystemicon16.png")
      .AddParameter("object", _("Object"), "ParticleEmitter")
      .UseStandardRelationalOperatorParameters(
          "number",
          gd::ParameterOptions::MakeNewOptions().SetDescription(
              _("Duration to compare to (in seconds)")));

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
      .UseStandardOperatorParameters(
          "number",
          gd::ParameterOptions::MakeNewOptions().SetDescription(
              _("Duration (in seconds)")));

  obj.AddCondition(
         "ParticleLifeTimeMax",
         _("Maximum lifetime"),
         _("Test maximum lifetime of particles."),
         _("the maximum lifetime of particles"),
         _("Common"),
         "CppPlatform/Extensions/particleSystemicon24.png",
         "CppPlatform/Extensions/particleSystemicon16.png")
      .AddParameter("object", _("Object"), "ParticleEmitter")
      .UseStandardRelationalOperatorParameters(
          "number",
          gd::ParameterOptions::MakeNewOptions().SetDescription(
              _("Duration to compare to (in seconds)")));

  obj.AddAction("ParticleGravityX",
                _("Gravity value on X axis"),
                _("Change value of the gravity on X axis."),
                _("the gravity on X axis"),
                _("Advanced"),
                "CppPlatform/Extensions/particleSystemicon24.png",
                "CppPlatform/Extensions/particleSystemicon16.png")
      .AddParameter("object", _("Object"), "ParticleEmitter")
      .UseStandardOperatorParameters("number",
                                     gd::ParameterOptions::MakeNewOptions());

  obj.AddCondition(
         "ParticleGravityX",
         _("Gravity value on X axis"),
         _("Compare value of the gravity on X axis."),
         _("the gravity on X axis"),
         _("Advanced"),
         "CppPlatform/Extensions/particleSystemicon24.png",
         "CppPlatform/Extensions/particleSystemicon16.png")
      .AddParameter("object", _("Object"), "ParticleEmitter")
      .UseStandardRelationalOperatorParameters(
          "number", gd::ParameterOptions::MakeNewOptions());

  obj.AddAction("ParticleGravityY",
                _("Gravity value on Y axis"),
                _("Change value of the gravity on Y axis."),
                _("the gravity on Y axis"),
                _("Advanced"),
                "CppPlatform/Extensions/particleSystemicon24.png",
                "CppPlatform/Extensions/particleSystemicon16.png")
      .AddParameter("object", _("Object"), "ParticleEmitter")
      .UseStandardOperatorParameters("number",
                                     gd::ParameterOptions::MakeNewOptions());

  obj.AddCondition(
         "ParticleGravityY",
         _("Gravity value on Y axis"),
         _("Compare value of the gravity on Y axis."),
         _("the gravity on Y axis"),
         _("Advanced"),
         "CppPlatform/Extensions/particleSystemicon24.png",
         "CppPlatform/Extensions/particleSystemicon16.png")
      .AddParameter("object", _("Object"), "ParticleEmitter")
      .UseStandardRelationalOperatorParameters(
          "number", gd::ParameterOptions::MakeNewOptions());

  obj.AddAction("ParticleGravityAngle",
                _("Gravity angle"),
                _("Change gravity angle"),
                _("the gravity angle"),
                _("Common"),
                "CppPlatform/Extensions/particleSystemicon24.png",
                "CppPlatform/Extensions/particleSystemicon16.png")
      .AddParameter("object", _("Object"), "ParticleEmitter")
      .UseStandardOperatorParameters(
          "number",
          gd::ParameterOptions::MakeNewOptions().SetDescription(
              _("Angle (in degrees)")));

  obj.AddCondition("ParticleGravityAngle",
                   _("Gravity angle"),
                   _("Test the gravity angle of the emitter"),
                   _("the gravity angle"),
                   _("Common"),
                   "CppPlatform/Extensions/particleSystemicon24.png",
                   "CppPlatform/Extensions/particleSystemicon16.png")
      .AddParameter("object", _("Object"), "ParticleEmitter")
      .UseStandardRelationalOperatorParameters(
          "number",
          gd::ParameterOptions::MakeNewOptions().SetDescription(
              _("Angle to compare to (in degrees)")));

  obj.AddAction("ParticleGravityLength",
                _("Gravity"),
                _("Change the gravity of the emitter."),
                _("the gravity"),
                _("Common"),
                "CppPlatform/Extensions/particleSystemicon24.png",
                "CppPlatform/Extensions/particleSystemicon16.png")
      .AddParameter("object", _("Object"), "ParticleEmitter")
      .UseStandardOperatorParameters("number",
                                     gd::ParameterOptions::MakeNewOptions());

  obj.AddCondition("ParticleGravityLength",
                   _("Gravity"),
                   _("Test the gravity of the emitter."),
                   _("the gravity"),
                   _("Common"),
                   "CppPlatform/Extensions/particleSystemicon24.png",
                   "CppPlatform/Extensions/particleSystemicon16.png")
      .AddParameter("object", _("Object"), "ParticleEmitter")
      .UseStandardRelationalOperatorParameters(
          "number", gd::ParameterOptions::MakeNewOptions());

  obj.AddAction("StartEmission",
                _("Start emission"),
                _("Refill tank (if not infinite) and start emission of the "
                  "particles."),
                _("Start emission of _PARAM0_"),
                _("Common"),
                "CppPlatform/Extensions/particleSystemicon24.png",
                "CppPlatform/Extensions/particleSystemicon16.png")
      .AddParameter("object", _("Object"), "ParticleEmitter");

  obj.AddAction("StopEmission",
                _("Stop emission"),
                _("Stop the emission of particles."),
                _("Stop emission of _PARAM0_"),
                _("Common"),
                "CppPlatform/Extensions/particleSystemicon24.png",
                "CppPlatform/Extensions/particleSystemicon16.png")
      .AddParameter("object", _("Object"), "ParticleEmitter");
}

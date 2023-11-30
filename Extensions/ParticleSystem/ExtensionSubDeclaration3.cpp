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
 * Declare some actions, conditions and expressions of the particle emitter
 */
void ExtensionSubDeclaration3(gd::ObjectMetadata& obj) {
  obj.AddAction("RecreateParticleSystem",
                _("Recreate particles"),
                _("Destroy and recreate particles, so as to take changes made "
                  "to setup of the emitter in account."),
                _("Recreate particles of _PARAM0_"),
                _("Setup"),
                "CppPlatform/Extensions/particleSystemicon24.png",
                "CppPlatform/Extensions/particleSystemicon16.png")
      .AddParameter("object", _("Object"), "ParticleEmitter");

  obj.AddAction(
         "RendererParam1",
         _("Rendering first parameter"),
         _("Modify first parameter of rendering (Size/Length).\nParticles "
           "have to be recreated in order to take changes in account."),
         _("the rendering 1st parameter"),
         _("Setup"),
         "CppPlatform/Extensions/particleSystemicon24.png",
         "CppPlatform/Extensions/particleSystemicon16.png")
      .AddParameter("object", _("Object"), "ParticleEmitter")
      .UseStandardOperatorParameters("number",
                                     gd::ParameterOptions::MakeNewOptions());

  obj.AddCondition("RendererParam1",
                   _("Rendering first parameter"),
                   _("Test the first parameter of rendering (Size/Length)."),
                   _("the 1st rendering parameter"),
                   _("Setup"),
                   "CppPlatform/Extensions/particleSystemicon24.png",
                   "CppPlatform/Extensions/particleSystemicon16.png")

      .AddParameter("object", _("Object"), "ParticleEmitter")
      .UseStandardRelationalOperatorParameters(
          "number", gd::ParameterOptions::MakeNewOptions());

  obj.AddAction("RendererParam2",
                _("Rendering second parameter"),
                _("Modify the second parameter of rendering (Size/Length"
                  ").\nParticles have to be recreated in order to take changes "
                  "in account."),
                _("the rendering 2nd parameter"),
                _("Setup"),
                "CppPlatform/Extensions/particleSystemicon24.png",
                "CppPlatform/Extensions/particleSystemicon16.png")
      .AddParameter("object", _("Object"), "ParticleEmitter")
      .UseStandardOperatorParameters("number",
                                     gd::ParameterOptions::MakeNewOptions());

  obj.AddCondition("RendererParam2",
                   _("Rendering second parameter"),
                   _("Test the second parameter of rendering (Size/Length)."),
                   _("the 2nd rendering parameter"),
                   _("Setup"),
                   "CppPlatform/Extensions/particleSystemicon24.png",
                   "CppPlatform/Extensions/particleSystemicon16.png")
      .AddParameter("object", _("Object"), "ParticleEmitter")
      .UseStandardRelationalOperatorParameters(
          "number", gd::ParameterOptions::MakeNewOptions());

  obj.AddAction("Tank",
                _("Capacity"),
                _("Change the capacity of the emitter."),
                _("the capacity"),
                _("Common"),
                "CppPlatform/Extensions/particleSystemicon24.png",
                "CppPlatform/Extensions/particleSystemicon16.png")
      .AddParameter("object", _("Object"), "ParticleEmitter")
      .SetHidden()  // DEPRECATED - Use SetTank instead
      .UseStandardOperatorParameters("number",
                                     gd::ParameterOptions::MakeNewOptions());

  obj.AddAction("SetTank",
                _("Capacity"),
                _("Change the capacity of the emitter."),
                _("the capacity"),
                _("Common"),
                "CppPlatform/Extensions/particleSystemicon24.png",
                "CppPlatform/Extensions/particleSystemicon16.png")
      .AddParameter("object", _("Object"), "ParticleEmitter")
      .UseStandardOperatorParameters(
          "number",
          gd::ParameterOptions::MakeNewOptions().SetDescription(_("Capacity")));

  obj.AddCondition("Tank",
                   _("Capacity"),
                   _("Test the capacity of the emitter."),
                   _("the capacity"),
                   _("Common"),
                   "CppPlatform/Extensions/particleSystemicon24.png",
                   "CppPlatform/Extensions/particleSystemicon16.png")
      .AddParameter("object", _("Object"), "ParticleEmitter")
      .UseStandardRelationalOperatorParameters(
          "number",
          gd::ParameterOptions::MakeNewOptions().SetDescription(
              _("Capacity to compare to")));

  obj.AddAction("Flow",
                _("Flow"),
                _("Change the flow of the emitter."),
                _("the flow"),
                _("Common"),
                "CppPlatform/Extensions/particleSystemicon24.png",
                "CppPlatform/Extensions/particleSystemicon16.png")
      .AddParameter("object", _("Object"), "ParticleEmitter")
      .SetHidden()  // DEPRECATED - Use SetFlow instead
      .UseStandardOperatorParameters("number",
                                     gd::ParameterOptions::MakeNewOptions());

  obj.AddAction("SetFlow",
                _("Flow"),
                _("Change the flow of the emitter."),
                _("the flow"),
                _("Common"),
                "CppPlatform/Extensions/particleSystemicon24.png",
                "CppPlatform/Extensions/particleSystemicon16.png")
      .AddParameter("object", _("Object"), "ParticleEmitter")
      .UseStandardOperatorParameters(
          "number",
          gd::ParameterOptions::MakeNewOptions().SetDescription(
              _("Flow (in particles per second)")));

  obj.AddCondition("Flow",
                   _("Flow"),
                   _("Test the flow of the emitter."),
                   _("the flow"),
                   _("Common"),
                   "CppPlatform/Extensions/particleSystemicon24.png",
                   "CppPlatform/Extensions/particleSystemicon16.png")
      .AddParameter("object", _("Object"), "ParticleEmitter")
      .UseStandardRelationalOperatorParameters(
          "number",
          gd::ParameterOptions::MakeNewOptions().SetDescription(
              _("Flow to compare to (in particles per second)")));

  // Deprecated
  obj.AddAction("Texture",
                _("Particle image (deprecated)"),
                _("Change the image of particles (if displayed)."),
                _("Change the image of particles of _PARAM0_ to _PARAM1_"),
                _("Advanced"),
                "CppPlatform/Extensions/particleSystemicon24.png",
                "CppPlatform/Extensions/particleSystemicon16.png")
      .AddParameter("object", _("Object"), "ParticleEmitter")
      .AddParameter("string", _("Image to use"))
      .SetParameterLongDescription("Indicate the name of the resource")
      .SetHidden();

  obj.AddAction("SetTextureFromResource",
                _("Particle image"),
                _("Change the image of particles (if displayed)."),
                _("Change the image of particles of _PARAM0_ to _PARAM1_"),
                _("Common"),
                "CppPlatform/Extensions/particleSystemicon24.png",
                "CppPlatform/Extensions/particleSystemicon16.png")
      .AddParameter("object", _("Object"), "ParticleEmitter")
      .AddParameter("imageResource", _("Image file (or image resource name)"));

  obj.AddCondition("Texture",
                   _("Image"),
                   _("Test the name of the image displayed by particles."),
                   _("the image displayed by particles"),
                   _("Common"),
                   "CppPlatform/Extensions/particleSystemicon24.png",
                   "CppPlatform/Extensions/particleSystemicon16.png")
      .AddParameter("object", _("Object"), "ParticleEmitter")
      .UseStandardRelationalOperatorParameters(
          "string", gd::ParameterOptions::MakeNewOptions());

  obj.AddStrExpression("Texture",
                       _("Particles image"),
                       _("Name of the image displayed by particles."),
                       _("Particles"),
                       "CppPlatform/Extensions/particleSystemicon16.png")
      .AddParameter("object", _("Object"), "ParticleEmitter", false);

  obj.AddExpression("NbParticles",
                    _("Particles number"),
                    _("Particles number"),
                    _("Particles"),
                    "CppPlatform/Extensions/particleSystemicon16.png")
      .SetHidden()  // DEPRECATED - Use CurrentParticleCount instead
      .AddParameter("object", _("Object"), "ParticleEmitter", false);

  obj.AddExpression("CurrentParticleCount",
                    _("Particles count"),
                    _("Number of particles currently displayed."),
                    _("Particles"),
                    "CppPlatform/Extensions/particleSystemicon16.png")
      .AddParameter("object", _("Object"), "ParticleEmitter", false);

  obj.AddExpression("RendererParam1",
                    _("Rendering first parameter"),
                    _("Rendering first parameter"),
                    _("Setup"),
                    "CppPlatform/Extensions/particleSystemicon16.png")
      .AddParameter("object", _("Object"), "ParticleEmitter", false);

  obj.AddExpression("RendererParam2",
                    _("Rendering second parameter"),
                    _("Rendering second parameter"),
                    _("Setup"),
                    "CppPlatform/Extensions/particleSystemicon16.png")
      .AddParameter("object", _("Object"), "ParticleEmitter", false);

  obj.AddExpression("Tank",
                    _("Capacity"),
                    _("Capacity of the particle tank."),
                    _("Common"),
                    "CppPlatform/Extensions/particleSystemicon16.png")
      .AddParameter("object", _("Object"), "ParticleEmitter", false);

  obj.AddExpression("Flow",
                    _("Flow"),
                    _("Flow of the particles (particles/second)."),
                    _("Common"),
                    "CppPlatform/Extensions/particleSystemicon16.png")
      .AddParameter("object", _("Object"), "ParticleEmitter", false);

  obj.AddExpression("EmitterForceMin",
                    _("Emission minimal force"),
                    _("The minimal emission force of the particles."),
                    _("Common"),
                    "CppPlatform/Extensions/particleSystemicon16.png")
      .AddParameter("object", _("Object"), "ParticleEmitter", false);

  obj.AddExpression("EmitterForceMax",
                    _("Emission maximal force"),
                    _("The maximal emission force of the particles."),
                    _("Common"),
                    "CppPlatform/Extensions/particleSystemicon16.png")
      .AddParameter("object", _("Object"), "ParticleEmitter", false);

  obj.AddExpression("EmitterAngle",
                    _("Emission angle"),
                    _("Emission angle of the particles."),
                    _("Common"),
                    "CppPlatform/Extensions/particleSystemicon16.png")
      .AddParameter("object", _("Object"), "ParticleEmitter", false);
  obj.AddExpression("EmitterAngleA",
                    _("Emission angle A"),
                    _("Emission angle A"),
                    _("Advanced"),
                    "CppPlatform/Extensions/particleSystemicon16.png")
      .AddParameter("object", _("Object"), "ParticleEmitter", false)
      .SetHidden();
  obj.AddExpression("EmitterAngleB",
                    _("Emission angle B"),
                    _("Emission angle B"),
                    _("Advanced"),
                    "CppPlatform/Extensions/particleSystemicon16.png")
      .AddParameter("object", _("Object"), "ParticleEmitter", false)
      .SetHidden();
  obj.AddExpression("ConeSprayAngle",
                    _("Angle of the spray cone"),
                    _("Angle of the spray cone"),
                    _("Common"),
                    "CppPlatform/Extensions/particleSystemicon16.png")
      .AddParameter("object", _("Object"), "ParticleEmitter", false);
  obj.AddExpression("ZoneRadius",
                    _("Radius of emission zone"),
                    _("The radius of the emission zone."),
                    _("Common"),
                    "CppPlatform/Extensions/particleSystemicon16.png")
      .AddParameter("object", _("Object"), "ParticleEmitter", false);
  obj.AddExpression("ParticleGravityX",
                    _("X gravity"),
                    _("Gravity of particles applied on X-axis."),
                    _("Setup"),
                    "CppPlatform/Extensions/particleSystemicon16.png")
      .AddParameter("object", _("Object"), "ParticleEmitter", false);
  obj.AddExpression("ParticleGravityY",
                    _("Y gravity"),
                    _("Gravity of particles applied on Y-axis."),
                    _("Setup"),
                    "CppPlatform/Extensions/particleSystemicon16.png")
      .AddParameter("object", _("Object"), "ParticleEmitter", false);
  obj.AddExpression("ParticleGravityAngle",
                    _("Gravity angle"),
                    _("Angle of gravity."),
                    _("Common"),
                    "CppPlatform/Extensions/particleSystemicon16.png")
      .AddParameter("object", _("Object"), "ParticleEmitter", false);
  obj.AddExpression("ParticleGravityLength",
                    _("Gravity"),
                    _("Value of gravity."),
                    _("Common"),
                    "CppPlatform/Extensions/particleSystemicon16.png")
      .AddParameter("object", _("Object"), "ParticleEmitter", false);
  obj.AddExpression("ParticleLifeTimeMin",
                    _("Minimum lifetime of particles"),
                    _("Minimum lifetime of the particles."),
                    _("Setup"),
                    "CppPlatform/Extensions/particleSystemicon16.png")
      .AddParameter("object", _("Object"), "ParticleEmitter", false);
  obj.AddExpression("ParticleLifeTimeMax",
                    _("Maximum lifetime of particles"),
                    _("Maximum lifetime of the particles."),
                    _("Setup"),
                    "CppPlatform/Extensions/particleSystemicon16.png")
      .AddParameter("object", _("Object"), "ParticleEmitter", false);
  obj.AddExpression("ParticleRed1",
                    _("Start color red component"),
                    _("The start color red component of the particles."),
                    _("Setup"),
                    "CppPlatform/Extensions/particleSystemicon16.png")
      .AddParameter("object", _("Object"), "ParticleEmitter", false);
  obj.AddExpression("ParticleRed2",
                    _("End color red component"),
                    _("The end color red component of the particles."),
                    _("Setup"),
                    "CppPlatform/Extensions/particleSystemicon16.png")
      .AddParameter("object", _("Object"), "ParticleEmitter", false);
  obj.AddExpression("ParticleBlue1",
                    _("Start color blue component"),
                    _("The start color blue component of the particles."),
                    _("Setup"),
                    "CppPlatform/Extensions/particleSystemicon16.png")
      .AddParameter("object", _("Object"), "ParticleEmitter", false);
  obj.AddExpression("ParticleBlue2",
                    _("End color blue component"),
                    _("The end color blue component of the particles."),
                    _("Setup"),
                    "CppPlatform/Extensions/particleSystemicon16.png")
      .AddParameter("object", _("Object"), "ParticleEmitter", false);
  obj.AddExpression("ParticleGreen1",
                    _("Start color green component"),
                    _("The start color green component of the particles."),
                    _("Setup"),
                    "CppPlatform/Extensions/particleSystemicon16.png")
      .AddParameter("object", _("Object"), "ParticleEmitter", false);
  obj.AddExpression("ParticleGreen2",
                    _("End color green component"),
                    _("The end color green component of the particles."),
                    _("Setup"),
                    "CppPlatform/Extensions/particleSystemicon16.png")
      .AddParameter("object", _("Object"), "ParticleEmitter", false);
  obj.AddExpression("ParticleAlpha1",
                    _("Start opacity"),
                    _("Start opacity of the particles."),
                    _("Setup"),
                    "CppPlatform/Extensions/particleSystemicon16.png")
      .AddParameter("object", _("Object"), "ParticleEmitter", false);
  obj.AddExpression("ParticleAlpha2",
                    _("End opacity"),
                    _("End opacity of the particles."),
                    _("Setup"),
                    "CppPlatform/Extensions/particleSystemicon16.png")
      .AddParameter("object", _("Object"), "ParticleEmitter", false);
  obj.AddExpression("ParticleSize1",
                    _("Start size"),
                    _("Start size of particles."),
                    _("Setup"),
                    "CppPlatform/Extensions/particleSystemicon16.png")
      .AddParameter("object", _("Object"), "ParticleEmitter", false);
  obj.AddExpression("ParticleSize2",
                    _("End size"),
                    _("End size of particles."),
                    _("Setup"),
                    "CppPlatform/Extensions/particleSystemicon16.png")
      .AddParameter("object", _("Object"), "ParticleEmitter", false);

  obj.AddAction("JumpEmitterForwardInTime",
                _("Jump emitter forward in time"),
                _("Simulate the passage of time for an emitter, "
                  "including creating and moving particles"),
                _("Jump _PARAM0_ forward in time by _PARAM1_ seconds"),
                _("Advanced"),
                "CppPlatform/Extensions/particleSystemicon24.png",
                "CppPlatform/Extensions/particleSystemicon16.png")
      .AddParameter("object", _("Object"), "ParticleEmitter")
      .AddParameter("number", _("Seconds of time"));
}

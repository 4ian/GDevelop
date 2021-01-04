/**

GDevelop - Particle System Extension
Copyright (c) 2010-2016 Florian Rival (Florian.Rival@gmail.com)
This project is released under the MIT License.
*/

#include "GDCpp/Extensions/ExtensionBase.h"

#include "Extension.h"
#include "ParticleEmitterObject.h"

/**
 * Declare some actions, conditions and expressions of the particle emitter
 */
void ExtensionSubDeclaration3(gd::ObjectMetadata& obj) {
#if defined(GD_IDE_ONLY)
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
         _("Modify first parameter of rendering ( Size/Length ).\nParticles "
           "have to be recreated in order to take changes in account."),
         _("the rendering 1st parameter"),
         _("Setup"),
         "CppPlatform/Extensions/particleSystemicon24.png",
         "CppPlatform/Extensions/particleSystemicon16.png")
      .AddParameter("object", _("Object"), "ParticleEmitter")
      .UseStandardOperatorParameters("number");

  obj.AddCondition(
         "RendererParam1",
         _("Rendering first parameter"),
         _("Test the first parameter of rendering ( Size/Length )."),
         _("the 1st rendering parameter"),
         _("Setup"),
         "CppPlatform/Extensions/particleSystemicon24.png",
         "CppPlatform/Extensions/particleSystemicon16.png")

      .AddParameter("object", _("Object"), "ParticleEmitter")
      .UseStandardRelationalOperatorParameters("number");

  obj.AddAction("RendererParam2",
                _("Rendering second parameter"),
                _("Modify the second parameter of rendering ( Size/Length "
                  ").\nParticles have to be recreated in order to take changes "
                  "in account."),
                _("the rendering 2nd parameter"),
                _("Setup"),
                "CppPlatform/Extensions/particleSystemicon24.png",
                "CppPlatform/Extensions/particleSystemicon16.png")
      .AddParameter("object", _("Object"), "ParticleEmitter")
      .UseStandardOperatorParameters("number");

  obj.AddCondition(
         "RendererParam2",
         _("Rendering second parameter"),
         _("Test the second parameter of rendering ( Size/Length )."),
         _("the 2nd rendering parameter"),
         _("Setup"),
         "CppPlatform/Extensions/particleSystemicon24.png",
         "CppPlatform/Extensions/particleSystemicon16.png")
      .AddParameter("object", _("Object"), "ParticleEmitter")
      .UseStandardRelationalOperatorParameters("number");

  obj.AddAction("Tank",
                _("Capacity"),
                _("Change the capacity of the emitter."),
                _("the capacity"),
                _("Common"),
                "CppPlatform/Extensions/particleSystemicon24.png",
                "CppPlatform/Extensions/particleSystemicon16.png")
      .AddParameter("object", _("Object"), "ParticleEmitter")
      .UseStandardOperatorParameters("number");

  obj.AddCondition("Tank",
                   _("Capacity"),
                   _("Test the capacity of the emitter."),
                   _("the capacity"),
                   _("Common"),
                   "CppPlatform/Extensions/particleSystemicon24.png",
                   "CppPlatform/Extensions/particleSystemicon16.png")
      .AddParameter("object", _("Object"), "ParticleEmitter")
      .UseStandardRelationalOperatorParameters("number");

  obj.AddAction("Flow",
                _("Flow"),
                _("Change the flow of the emitter."),
                _("the flow"),
                _("Common"),
                "CppPlatform/Extensions/particleSystemicon24.png",
                "CppPlatform/Extensions/particleSystemicon16.png")
      .AddParameter("object", _("Object"), "ParticleEmitter")
      .UseStandardOperatorParameters("number");

  obj.AddCondition("Flow",
                   _("Flow"),
                   _("Test the flow of the emitter."),
                   _("the flow"),
                   _("Common"),
                   "CppPlatform/Extensions/particleSystemicon24.png",
                   "CppPlatform/Extensions/particleSystemicon16.png")
      .AddParameter("object", _("Object"), "ParticleEmitter")
      .UseStandardRelationalOperatorParameters("number");

  obj.AddAction("Texture",
                _("Image"),
                _("Change the image of particles ( if displayed )."),
                _("Change the image of particles of _PARAM0_ to _PARAM1_"),
                _("Common"),
                "CppPlatform/Extensions/particleSystemicon24.png",
                "CppPlatform/Extensions/particleSystemicon16.png")
      .AddParameter("object", _("Object"), "ParticleEmitter")
      .AddParameter("string", _("New image"));

  obj.AddCondition(
         "Texture",
         _("Image"),
         _("Test the name of the image displayed by particles."),
         _("the image displayed by particles"),
         _("Common"),
         "CppPlatform/Extensions/particleSystemicon24.png",
         "CppPlatform/Extensions/particleSystemicon16.png")
      .AddParameter("object", _("Object"), "ParticleEmitter")
      .UseStandardRelationalOperatorParameters("string");

  obj.AddStrExpression("Texture",
                       _("Particles image"),
                       _("Name of the image displayed by particles"),
                       _("Particles"),
                       "CppPlatform/Extensions/particleSystemicon16.png")
      .AddParameter("object", _("Object"), "ParticleEmitter", false);

  obj.AddExpression("NbParticles",
                    _("Particles number"),
                    _("Particles number"),
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
                    _("Capacity"),
                    _("Common"),
                    "CppPlatform/Extensions/particleSystemicon16.png")
      .AddParameter("object", _("Object"), "ParticleEmitter", false);

  obj.AddExpression("Flow",
                    _("Flow"),
                    _("Flow"),
                    _("Common"),
                    "CppPlatform/Extensions/particleSystemicon16.png")
      .AddParameter("object", _("Object"), "ParticleEmitter", false);

  obj.AddExpression("EmitterForceMin",
                    _("Emission minimal force"),
                    _("Emission minimal force"),
                    _("Common"),
                    "CppPlatform/Extensions/particleSystemicon16.png")
      .AddParameter("object", _("Object"), "ParticleEmitter", false);

  obj.AddExpression("EmitterForceMax",
                    _("Emission maximal force"),
                    _("Emission maximal force"),
                    _("Common"),
                    "CppPlatform/Extensions/particleSystemicon16.png")
      .AddParameter("object", _("Object"), "ParticleEmitter", false);

  obj.AddExpression("EmitterXDirection",
                    _("Emission X direction"),
                    _("Emission X direction"),
                    _("Setup"),
                    "CppPlatform/Extensions/particleSystemicon16.png")
      .AddParameter("object", _("Object"), "ParticleEmitter", false);
  obj.AddExpression("EmitterYDirection",
                    _("Emission Y direction"),
                    _("Emission Y direction"),
                    _("Setup"),
                    "CppPlatform/Extensions/particleSystemicon16.png")
      .AddParameter("object", _("Object"), "ParticleEmitter", false);
  obj.AddExpression("EmitterZDirection",
                    _("Emission Z direction"),
                    _("Emission Z direction"),
                    _("Setup"),
                    "CppPlatform/Extensions/particleSystemicon16.png")
      .AddParameter("object", _("Object"), "ParticleEmitter", false);
  obj.AddExpression("EmitterAngle",
                    _("Emission angle"),
                    _("Emission angle"),
                    _("Common"),
                    "CppPlatform/Extensions/particleSystemicon16.png")
      .AddParameter("object", _("Object"), "ParticleEmitter", false);
  obj.AddExpression("EmitterAngleA",
                    _("Emission angle A"),
                    _("Emission angle A"),
                    _("Advanced"),
                    "CppPlatform/Extensions/particleSystemicon16.png")
      .AddParameter("object", _("Object"), "ParticleEmitter", false);
  obj.AddExpression("EmitterAngleB",
                    _("Emission angle B"),
                    _("Emission angle B"),
                    _("Advanced"),
                    "CppPlatform/Extensions/particleSystemicon16.png")
      .AddParameter("object", _("Object"), "ParticleEmitter", false);
  obj.AddExpression("ZoneRadius",
                    _("Radius of the emission zone"),
                    _("Radius of the emission zone"),
                    _("Common"),
                    "CppPlatform/Extensions/particleSystemicon16.png")
      .AddParameter("object", _("Object"), "ParticleEmitter", false);
  obj.AddExpression("ParticleGravityX",
                    _("X Gravity of particles"),
                    _("X Gravity of particles"),
                    _("Setup"),
                    "CppPlatform/Extensions/particleSystemicon16.png")
      .AddParameter("object", _("Object"), "ParticleEmitter", false);
  obj.AddExpression("ParticleGravityY",
                    _("Y Gravity of particles"),
                    _("Y Gravity of particles"),
                    _("Setup"),
                    "CppPlatform/Extensions/particleSystemicon16.png")
      .AddParameter("object", _("Object"), "ParticleEmitter", false);
  obj.AddExpression("ParticleGravityZ",
                    _("Z Gravity of particles"),
                    _("Z Gravity of particles"),
                    _("Setup"),
                    "CppPlatform/Extensions/particleSystemicon16.png")
      .AddParameter("object", _("Object"), "ParticleEmitter", false);
  obj.AddExpression("ParticleGravityAngle",
                    _("Gravity angle"),
                    _("Gravity angle"),
                    _("Common"),
                    "CppPlatform/Extensions/particleSystemicon16.png")
      .AddParameter("object", _("Object"), "ParticleEmitter", false);
  obj.AddExpression("ParticleGravityLength",
                    _("Gravity"),
                    _("Gravity value"),
                    _("Common"),
                    "CppPlatform/Extensions/particleSystemicon16.png")
      .AddParameter("object", _("Object"), "ParticleEmitter", false);
  obj.AddExpression("Friction",
                    _("Particles friction"),
                    _("Particles friction"),
                    _("Common"),
                    "CppPlatform/Extensions/particleSystemicon16.png")
      .AddParameter("object", _("Object"), "ParticleEmitter", false);
  obj.AddExpression("ParticleLifeTimeMin",
                    _("Minimum lifetime of particles"),
                    _("Minimum lifetime of particles"),
                    _("Setup"),
                    "CppPlatform/Extensions/particleSystemicon16.png")
      .AddParameter("object", _("Object"), "ParticleEmitter", false);
  obj.AddExpression("ParticleLifeTimeMax",
                    _("Maximum lifetime of particles"),
                    _("Maximum lifetime of particles"),
                    _("Setup"),
                    "CppPlatform/Extensions/particleSystemicon16.png")
      .AddParameter("object", _("Object"), "ParticleEmitter", false);
  obj.AddExpression("ParticleRed1",
                    _("Parameter 1 of red color"),
                    _("Parameter 1 of red color"),
                    _("Setup"),
                    "CppPlatform/Extensions/particleSystemicon16.png")
      .AddParameter("object", _("Object"), "ParticleEmitter", false);
  obj.AddExpression("ParticleRed2",
                    _("Parameter 2 of red color"),
                    _("Parameter 2 of red color"),
                    _("Setup"),
                    "CppPlatform/Extensions/particleSystemicon16.png")
      .AddParameter("object", _("Object"), "ParticleEmitter", false);
  obj.AddExpression("ParticleBlue1",
                    _("Parameter 1 of blue color"),
                    _("Parameter 1 of blue color"),
                    _("Setup"),
                    "CppPlatform/Extensions/particleSystemicon16.png")
      .AddParameter("object", _("Object"), "ParticleEmitter", false);
  obj.AddExpression("ParticleBlue2",
                    _("Parameter 2 of blue color"),
                    _("Parameter 2 of blue color"),
                    _("Setup"),
                    "CppPlatform/Extensions/particleSystemicon16.png")
      .AddParameter("object", _("Object"), "ParticleEmitter", false);
  obj.AddExpression("ParticleGreen1",
                    _("Parameter 1 of green color"),
                    _("Parameter 1 of green color"),
                    _("Setup"),
                    "CppPlatform/Extensions/particleSystemicon16.png")
      .AddParameter("object", _("Object"), "ParticleEmitter", false);
  obj.AddExpression("ParticleGreen2",
                    _("Parameter 2 of green color"),
                    _("Parameter 2 of green color"),
                    _("Setup"),
                    "CppPlatform/Extensions/particleSystemicon16.png")
      .AddParameter("object", _("Object"), "ParticleEmitter", false);
  obj.AddExpression("ParticleAlpha1",
                    _("Parameter 1 of transparency"),
                    _("Parameter 1 of transparency"),
                    _("Setup"),
                    "CppPlatform/Extensions/particleSystemicon16.png")
      .AddParameter("object", _("Object"), "ParticleEmitter", false);
  obj.AddExpression("ParticleAlpha2",
                    _("Parameter 2 of transparency"),
                    _("Parameter 2 of transparency"),
                    _("Setup"),
                    "CppPlatform/Extensions/particleSystemicon16.png")
      .AddParameter("object", _("Object"), "ParticleEmitter", false);
  obj.AddExpression("ParticleSize1",
                    _("Parameter 1 of size"),
                    _("Parameter 1 of size"),
                    _("Setup"),
                    "CppPlatform/Extensions/particleSystemicon16.png")
      .AddParameter("object", _("Object"), "ParticleEmitter", false);
  obj.AddExpression("ParticleSize2",
                    _("Parameter 2 of size"),
                    _("Parameter 2 of size"),
                    _("Setup"),
                    "CppPlatform/Extensions/particleSystemicon16.png")
      .AddParameter("object", _("Object"), "ParticleEmitter", false);
  obj.AddExpression("ParticleAngle1",
                    _("Parameter 1 of angle"),
                    _("Parameter 1 of angle"),
                    _("Setup"),
                    "CppPlatform/Extensions/particleSystemicon16.png")
      .AddParameter("object", _("Object"), "ParticleEmitter", false);
  obj.AddExpression("ParticleAngle2",
                    _("Parameter 2 of angle"),
                    _("Parameter 2 of angle"),
                    _("Setup"),
                    "CppPlatform/Extensions/particleSystemicon16.png")
      .AddParameter("object", _("Object"), "ParticleEmitter", false);

#endif
}

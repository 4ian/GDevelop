/**

GDevelop - Particle System Extension
Copyright (c) 2010-2016 Florian Rival (Florian.Rival@gmail.com)
This project is released under the MIT License.
*/

#include "GDCore/Extensions/PlatformExtension.h"
#include "GDCore/Tools/Localization.h"

#include "Extension.h"
#include "ParticleEmitterObject.h"

/**
 * Declare some actions and conditions of the particle emitter
 */
void ExtensionSubDeclaration2(gd::ObjectMetadata& obj) {
  obj.AddAction("ParticleColor1",
                _("Start color"),
                _("Modify start color of particles."),
                _("Change particles start color of _PARAM0_ to _PARAM1_"),
                _("Common"),
                "CppPlatform/Extensions/particleSystemicon24.png",
                "CppPlatform/Extensions/particleSystemicon16.png")
      .AddParameter("object", _("Object"), "ParticleEmitter")
      .AddParameter("color", _("Start color"));

  obj.AddAction("ParticleColor2",
                _("End color"),
                _("Modify end color of particles."),
                _("Change particles end color of _PARAM0_ to _PARAM1_"),
                _("Common"),
                "CppPlatform/Extensions/particleSystemicon24.png",
                "CppPlatform/Extensions/particleSystemicon16.png")
      .AddParameter("object", _("Object"), "ParticleEmitter")
      .AddParameter("color", _("End color"));

  obj.AddAction(
         "ParticleRed1",
         _("Red start color"),
         _("Modify the start red color."),
         _("the start red color"),
         _("Advanced"),
         "CppPlatform/Extensions/particleSystemicon24.png",
         "CppPlatform/Extensions/particleSystemicon16.png")
      .AddParameter("object", _("Object"), "ParticleEmitter")
      .UseStandardOperatorParameters("number");

  obj.AddCondition(
         "ParticleRed1",
         _("Red start color"),
         _("Compare the start red color."),
         _("the start red color"),
         _("Advanced"),
         "CppPlatform/Extensions/particleSystemicon24.png",
         "CppPlatform/Extensions/particleSystemicon16.png")
      .AddParameter("object", _("Object"), "ParticleEmitter")
      .UseStandardRelationalOperatorParameters("number");

  obj.AddAction(
         "ParticleRed2",
         _("Red end color"),
         _("Modify the end red color."),
         _("the end red color"),
         _("Advanced"),
         "CppPlatform/Extensions/particleSystemicon24.png",
         "CppPlatform/Extensions/particleSystemicon16.png")
      .AddParameter("object", _("Object"), "ParticleEmitter")
      .UseStandardOperatorParameters("number");

  obj.AddCondition(
         "ParticleRed2",
         _("Red end color"),
         _("Compare the end red color."),
         _("the end red color"),
         _("Advanced"),
         "CppPlatform/Extensions/particleSystemicon24.png",
         "CppPlatform/Extensions/particleSystemicon16.png")
      .AddParameter("object", _("Object"), "ParticleEmitter")
      .UseStandardRelationalOperatorParameters("number");

  obj.AddAction(
         "ParticleBlue1",
         _("Blue start color"),
         _("Modify the start blue color."),
         _("the end blue color"),
         _("Advanced"),
         "CppPlatform/Extensions/particleSystemicon24.png",
         "CppPlatform/Extensions/particleSystemicon16.png")
      .AddParameter("object", _("Object"), "ParticleEmitter")
      .UseStandardOperatorParameters("number");

  obj.AddCondition(
         "ParticleBlue1",
         _("Blue start color"),
         _("Compare the start blue color."),
         _("the start blue color"),
         _("Advanced"),
         "CppPlatform/Extensions/particleSystemicon24.png",
         "CppPlatform/Extensions/particleSystemicon16.png")
      .AddParameter("object", _("Object"), "ParticleEmitter")
      .UseStandardRelationalOperatorParameters("number");

  obj.AddAction(
         "ParticleBlue2",
         _("Blue end color"),
         _("Modify the end blue color."),
         _("the end blue color"),
         _("Advanced"),
         "CppPlatform/Extensions/particleSystemicon24.png",
         "CppPlatform/Extensions/particleSystemicon16.png")
      .AddParameter("object", _("Object"), "ParticleEmitter")
      .UseStandardOperatorParameters("number");

  obj.AddCondition(
         "ParticleBlue2",
         _("Blue end color"),
         _("Compare the end blue color."),
         _("the end blue color"),
         _("Advanced"),
         "CppPlatform/Extensions/particleSystemicon24.png",
         "CppPlatform/Extensions/particleSystemicon16.png")
      .AddParameter("object", _("Object"), "ParticleEmitter")
      .UseStandardRelationalOperatorParameters("number");

  obj.AddAction(
         "ParticleGreen1",
         _("Green start color"),
         _("Modify the start green color."),
         _("the start green color"),
         _("Advanced"),
         "CppPlatform/Extensions/particleSystemicon24.png",
         "CppPlatform/Extensions/particleSystemicon16.png")
      .AddParameter("object", _("Object"), "ParticleEmitter")
      .UseStandardOperatorParameters("number");

  obj.AddCondition(
         "ParticleGreen1",
         _("Green start color"),
         _("Compare the start green color."),
         _("the end green color"),
         _("Advanced"),
         "CppPlatform/Extensions/particleSystemicon24.png",
         "CppPlatform/Extensions/particleSystemicon16.png")
      .AddParameter("object", _("Object"), "ParticleEmitter")
      .UseStandardRelationalOperatorParameters("number");

  obj.AddAction(
         "ParticleGreen2",
         _("Green end color"),
         _("Modify the end green color."),
         _("the end green color"),
         _("Advanced"),
         "CppPlatform/Extensions/particleSystemicon24.png",
         "CppPlatform/Extensions/particleSystemicon16.png")
      .AddParameter("object", _("Object"), "ParticleEmitter")
      .UseStandardOperatorParameters("number");

  obj.AddCondition(
         "ParticleGreen2",
         _("Green end color"),
         _("Compare the end green color."),
         _("the end green color"),
         _("Advanced"),
         "CppPlatform/Extensions/particleSystemicon24.png",
         "CppPlatform/Extensions/particleSystemicon16.png")
      .AddParameter("object", _("Object"), "ParticleEmitter")
      .UseStandardRelationalOperatorParameters("number");

  obj.AddAction("ParticleSize1",
                _("Start size"),
                _("Modify the particle start size."),
                _("the start size"),
                _("Common"),
                "CppPlatform/Extensions/particleSystemicon24.png",
                "CppPlatform/Extensions/particleSystemicon16.png")
      .AddParameter("object", _("Object"), "ParticleEmitter")
      .UseStandardOperatorParameters("number");

  obj.AddCondition("ParticleSize1",
                   _("Start size"),
                   _("Compare the particle start size."),
                   _("the start size"),
                   _("Common"),
                   "CppPlatform/Extensions/particleSystemicon24.png",
                   "CppPlatform/Extensions/particleSystemicon16.png")
      .AddParameter("object", _("Object"), "ParticleEmitter")
      .UseStandardRelationalOperatorParameters("number");

  obj.AddAction("ParticleSize2",
                _("End size"),
                _("Modify the particle end size."),
                _("the end size"),
                _("Common"),
                "CppPlatform/Extensions/particleSystemicon24.png",
                "CppPlatform/Extensions/particleSystemicon16.png")
      .AddParameter("object", _("Object"), "ParticleEmitter")
      .UseStandardOperatorParameters("number");

  obj.AddCondition("ParticleSize2",
                   _("End size"),
                   _("Compare the particle end size."),
                   _("the end size"),
                   _("Common"),
                   "CppPlatform/Extensions/particleSystemicon24.png",
                   "CppPlatform/Extensions/particleSystemicon16.png")
      .AddParameter("object", _("Object"), "ParticleEmitter")
      .UseStandardRelationalOperatorParameters("number");

  obj.AddAction(
         "ParticleAngle1",
         _("Angle, parameter 1"),
         _("Modify parameter 1 of the angle of particles."),
         _("the parameter 1 of angle"),
         _("Common"),
         "CppPlatform/Extensions/particleSystemicon24.png",
         "CppPlatform/Extensions/particleSystemicon16.png")
      .AddParameter("object", _("Object"), "ParticleEmitter")
      .UseStandardOperatorParameters("number");

  obj.AddCondition("ParticleAngle1",
                   _("Angle, parameter 1"),
                   _("Compare parameter 1 of the angle of particles."),
                   _("the parameter 1 of angle"),
                   _("Common"),
                   "CppPlatform/Extensions/particleSystemicon24.png",
                   "CppPlatform/Extensions/particleSystemicon16.png")
      .AddParameter("object", _("Object"), "ParticleEmitter")
      .UseStandardRelationalOperatorParameters("number");

  obj.AddAction(
         "ParticleAngle2",
         _("Angle, parameter 2"),
         _("Modify parameter 2 of the angle of particles"),
         _("the parameter 2 of angle"),
         _("Common"),
         "CppPlatform/Extensions/particleSystemicon24.png",
         "CppPlatform/Extensions/particleSystemicon16.png")
      .AddParameter("object", _("Object"), "ParticleEmitter")
      .UseStandardOperatorParameters("number");

  obj.AddCondition("ParticleAngle2",
                   _("Angle, parameter 2"),
                   _("Compare parameter 2 of the angle of particles."),
                   _("the parameter 2 of angle"),
                   _("Common"),
                   "CppPlatform/Extensions/particleSystemicon24.png",
                   "CppPlatform/Extensions/particleSystemicon16.png")
      .AddParameter("object", _("Object"), "ParticleEmitter")
      .UseStandardRelationalOperatorParameters("number");

  obj.AddAction("ParticleAlpha1",
                _("Start opacity"),
                _("Modify the start opacity of particles."),
                _("the start opacity"),
                _("Common"),
                "CppPlatform/Extensions/particleSystemicon24.png",
                "CppPlatform/Extensions/particleSystemicon16.png")
      .AddParameter("object", _("Object"), "ParticleEmitter")
      .UseStandardOperatorParameters("number");

  obj.AddCondition(
         "ParticleAlpha1",
         _("Start opacity"),
         _("Compare the start opacity of particles."),
         _("the start opacity"),
         _("Common"),
         "CppPlatform/Extensions/particleSystemicon24.png",
         "CppPlatform/Extensions/particleSystemicon16.png")
      .AddParameter("object", _("Object"), "ParticleEmitter")
      .UseStandardRelationalOperatorParameters("number");

  obj.AddAction("ParticleAlpha2",
                _("End opacity"),
                _("Modify the end opacity of particles."),
                _("the end opacity"),
                _("Common"),
                "CppPlatform/Extensions/particleSystemicon24.png",
                "CppPlatform/Extensions/particleSystemicon16.png")
      .AddParameter("object", _("Object"), "ParticleEmitter")
      .UseStandardOperatorParameters("number");

  obj.AddCondition(
         "ParticleAlpha2",
         _("Start opacity"),
         _("Compare the end opacity of particles."),
         _("the end opacity"),
         _("Common"),
         "CppPlatform/Extensions/particleSystemicon24.png",
         "CppPlatform/Extensions/particleSystemicon16.png")
      .AddParameter("object", _("Object"), "ParticleEmitter")
      .UseStandardRelationalOperatorParameters("number");

  obj.AddCondition("NoMoreParticles",
                   _("No more particles"),
                   _("Check if the object does not emit particles "
                     "any longer, so as to destroy it for example."),
                   _("_PARAM0_ does not emit any longer"),
                   _("Common"),
                   "CppPlatform/Extensions/particleSystemicon24.png",
                   "CppPlatform/Extensions/particleSystemicon16.png")
      .AddParameter("object", _("Object"), "ParticleEmitter");

}

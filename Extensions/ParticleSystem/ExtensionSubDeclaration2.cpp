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
void ExtensionSubDeclaration2(gd::ObjectMetadata& obj) {
#if defined(GD_IDE_ONLY)
  obj.AddAction("ParticleColor1",
                _("Initial color"),
                _("Modify initial color of particles."),
                _("Put initial color of particles of _PARAM0_ to _PARAM1_"),
                _("Common"),
                "CppPlatform/Extensions/particleSystemicon24.png",
                "CppPlatform/Extensions/particleSystemicon16.png")
      .AddParameter("object", _("Object"), "ParticleEmitter")
      .AddParameter("color", _("Initial color"));

  obj.AddAction("ParticleColor2",
                _("Final color"),
                _("Modify final color of particles."),
                _("Put final color of particles of _PARAM0_ to _PARAM1_"),
                _("Common"),
                "CppPlatform/Extensions/particleSystemicon24.png",
                "CppPlatform/Extensions/particleSystemicon16.png")
      .AddParameter("object", _("Object"), "ParticleEmitter")
      .AddParameter("color", _("Final color"));

  obj.AddAction(
         "ParticleRed1",
         _("Red color, parameter 1"),
         _("Modify parameter 1 of the red color."),
         _("the parameter 1 of red color"),
         _("Advanced"),
         "CppPlatform/Extensions/particleSystemicon24.png",
         "CppPlatform/Extensions/particleSystemicon16.png")
      .AddParameter("object", _("Object"), "ParticleEmitter")
      .UseStandardOperatorParameters("number");

  obj.AddCondition(
         "ParticleRed1",
         _("Red color, parameter 1"),
         _("Test parameter 1 of the red color"),
         _("the parameter 1 of red color"),
         _("Advanced"),
         "CppPlatform/Extensions/particleSystemicon24.png",
         "CppPlatform/Extensions/particleSystemicon16.png")
      .AddParameter("object", _("Object"), "ParticleEmitter")
      .UseStandardRelationalOperatorParameters("number");

  obj.AddAction(
         "ParticleRed2",
         _("Red color, parameter 2"),
         _("Modify parameter 2 of the red color"),
         _("the parameter 2 of red color"),
         _("Advanced"),
         "CppPlatform/Extensions/particleSystemicon24.png",
         "CppPlatform/Extensions/particleSystemicon16.png")
      .AddParameter("object", _("Object"), "ParticleEmitter")
      .UseStandardOperatorParameters("number");

  obj.AddCondition(
         "ParticleRed2",
         _("Red color, parameter 2"),
         _("Test parameter 2 of the red color"),
         _("the parameter 2 of red color"),
         _("Advanced"),
         "CppPlatform/Extensions/particleSystemicon24.png",
         "CppPlatform/Extensions/particleSystemicon16.png")
      .AddParameter("object", _("Object"), "ParticleEmitter")
      .UseStandardRelationalOperatorParameters("number");

  obj.AddAction(
         "ParticleBlue1",
         _("Blue color, parameter 1"),
         _("Modify parameter 1 of blue color"),
         _("the parameter 1 of blue color"),
         _("Advanced"),
         "CppPlatform/Extensions/particleSystemicon24.png",
         "CppPlatform/Extensions/particleSystemicon16.png")
      .AddParameter("object", _("Object"), "ParticleEmitter")
      .UseStandardOperatorParameters("number");

  obj.AddCondition(
         "ParticleBlue1",
         _("Blue color, parameter 1"),
         _("Test parameter 1 of blue color"),
         _("the parameter 1 of blue color"),
         _("Advanced"),
         "CppPlatform/Extensions/particleSystemicon24.png",
         "CppPlatform/Extensions/particleSystemicon16.png")
      .AddParameter("object", _("Object"), "ParticleEmitter")
      .UseStandardRelationalOperatorParameters("number");

  obj.AddAction(
         "ParticleBlue2",
         _("Blue color, parameter 2"),
         _("Modify parameter 2 of blue color"),
         _("the parameter 2 of blue color"),
         _("Advanced"),
         "CppPlatform/Extensions/particleSystemicon24.png",
         "CppPlatform/Extensions/particleSystemicon16.png")
      .AddParameter("object", _("Object"), "ParticleEmitter")
      .UseStandardOperatorParameters("number");

  obj.AddCondition(
         "ParticleBlue2",
         _("Blue color, parameter 2"),
         _("Test parameter 2 of blue color"),
         _("the parameter 2 of blue color"),
         _("Advanced"),
         "CppPlatform/Extensions/particleSystemicon24.png",
         "CppPlatform/Extensions/particleSystemicon16.png")
      .AddParameter("object", _("Object"), "ParticleEmitter")
      .UseStandardRelationalOperatorParameters("number");

  obj.AddAction(
         "ParticleGreen1",
         _("Green color, parameter 1"),
         _("Modify parameter 1 of green color"),
         _("the parameter 1 of green color"),
         _("Advanced"),
         "CppPlatform/Extensions/particleSystemicon24.png",
         "CppPlatform/Extensions/particleSystemicon16.png")
      .AddParameter("object", _("Object"), "ParticleEmitter")
      .UseStandardOperatorParameters("number");

  obj.AddCondition(
         "ParticleGreen1",
         _("Green color, parameter 1"),
         _("Test parameter 1 of green color"),
         _("the parameter 1 of green color"),
         _("Advanced"),
         "CppPlatform/Extensions/particleSystemicon24.png",
         "CppPlatform/Extensions/particleSystemicon16.png")
      .AddParameter("object", _("Object"), "ParticleEmitter")
      .UseStandardRelationalOperatorParameters("number");

  obj.AddAction(
         "ParticleGreen2",
         _("Green color, parameter 2"),
         _("Modify the parameter 2 of the green color"),
         _("the parameter 2 of green color"),
         _("Advanced"),
         "CppPlatform/Extensions/particleSystemicon24.png",
         "CppPlatform/Extensions/particleSystemicon16.png")
      .AddParameter("object", _("Object"), "ParticleEmitter")
      .UseStandardOperatorParameters("number");

  obj.AddCondition(
         "ParticleGreen2",
         _("Green color, parameter 2"),
         _("Test the parameter 2 of the green color"),
         _("the parameter 2 of green color"),
         _("Advanced"),
         "CppPlatform/Extensions/particleSystemicon24.png",
         "CppPlatform/Extensions/particleSystemicon16.png")
      .AddParameter("object", _("Object"), "ParticleEmitter")
      .UseStandardRelationalOperatorParameters("number");

  obj.AddAction("ParticleSize1",
                _("SIze, parameter 1"),
                _("Modify parameter 1 of the size of particles"),
                _("the parameter 1 of size"),
                _("Common"),
                "CppPlatform/Extensions/particleSystemicon24.png",
                "CppPlatform/Extensions/particleSystemicon16.png")
      .AddParameter("object", _("Object"), "ParticleEmitter")
      .UseStandardOperatorParameters("number");

  obj.AddCondition("ParticleSize1",
                   _("Size, parameter 1"),
                   _("Test parameter 1 of the size of particles"),
                   _("the parameter 1 of the size"),
                   _("Common"),
                   "CppPlatform/Extensions/particleSystemicon24.png",
                   "CppPlatform/Extensions/particleSystemicon16.png")
      .AddParameter("object", _("Object"), "ParticleEmitter")
      .UseStandardRelationalOperatorParameters("number");

  obj.AddAction("ParticleSize2",
                _("Size, parameter 2"),
                _("Modify parameter 2 of the size of particles"),
                _("the parameter 2 of size"),
                _("Common"),
                "CppPlatform/Extensions/particleSystemicon24.png",
                "CppPlatform/Extensions/particleSystemicon16.png")
      .AddParameter("object", _("Object"), "ParticleEmitter")
      .UseStandardOperatorParameters("number");

  obj.AddCondition("ParticleSize2",
                   _("Size, parameter 2"),
                   _("Test parameter 2 of the size of particles"),
                   _("the parameter 2 of the size"),
                   _("Common"),
                   "CppPlatform/Extensions/particleSystemicon24.png",
                   "CppPlatform/Extensions/particleSystemicon16.png")
      .AddParameter("object", _("Object"), "ParticleEmitter")
      .UseStandardRelationalOperatorParameters("number");

  obj.AddAction(
         "ParticleAngle1",
         _("Angle, parameter 1"),
         _("Modify parameter 1 of the angle of particles"),
         _("the parameter 1 of angle"),
         _("Common"),
         "CppPlatform/Extensions/particleSystemicon24.png",
         "CppPlatform/Extensions/particleSystemicon16.png")
      .AddParameter("object", _("Object"), "ParticleEmitter")
      .UseStandardOperatorParameters("number");

  obj.AddCondition("ParticleAngle1",
                   _("Angle, parameter 1"),
                   _("Test parameter 1 of the angle of particles"),
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
                   _("Test parameter 2 of the angle of particles"),
                   _("the parameter 2 of angle"),
                   _("Common"),
                   "CppPlatform/Extensions/particleSystemicon24.png",
                   "CppPlatform/Extensions/particleSystemicon16.png")
      .AddParameter("object", _("Object"), "ParticleEmitter")
      .UseStandardRelationalOperatorParameters("number");

  obj.AddAction("ParticleAlpha1",
                _("Transparency, parameter 1"),
                _("Modify parameter 1 of the transparency of particles"),
                _("the parameter 1 of the transparency"),
                _("Common"),
                "CppPlatform/Extensions/particleSystemicon24.png",
                "CppPlatform/Extensions/particleSystemicon16.png")
      .AddParameter("object", _("Object"), "ParticleEmitter")
      .UseStandardOperatorParameters("number");

  obj.AddCondition(
         "ParticleAlpha1",
         _("Transparency, parameter 1"),
         _("Test parameter 1 of the transparency of particles"),
         _("the parameter 1 of the transparency"),
         _("Common"),
         "CppPlatform/Extensions/particleSystemicon24.png",
         "CppPlatform/Extensions/particleSystemicon16.png")
      .AddParameter("object", _("Object"), "ParticleEmitter")
      .UseStandardRelationalOperatorParameters("number");

  obj.AddAction("ParticleAlpha2",
                _("Transparency, parameter 2"),
                _("Modify parameter 2 of the transparency of particles"),
                _("the parameter 2 of the transparency"),
                _("Common"),
                "CppPlatform/Extensions/particleSystemicon24.png",
                "CppPlatform/Extensions/particleSystemicon16.png")
      .AddParameter("object", _("Object"), "ParticleEmitter")
      .UseStandardOperatorParameters("number");

  obj.AddCondition(
         "ParticleAlpha2",
         _("Transparency, parameter 2"),
         _("Test parameter 2 of the transparency of particles"),
         _("the parameter 2 of the transparency"),
         _("Common"),
         "CppPlatform/Extensions/particleSystemicon24.png",
         "CppPlatform/Extensions/particleSystemicon16.png")
      .AddParameter("object", _("Object"), "ParticleEmitter")
      .UseStandardRelationalOperatorParameters("number");

  obj.AddCondition("NoMoreParticles",
                   _("No more particles"),
                   _("Check if the object does not emit particles "
                     "anylonger, so as to destroy it for example."),
                   _("_PARAM0_ does not emit anylonger."),
                   _("Common"),
                   "CppPlatform/Extensions/particleSystemicon24.png",
                   "CppPlatform/Extensions/particleSystemicon16.png")
      .AddParameter("object", _("Object"), "ParticleEmitter");

#endif
}

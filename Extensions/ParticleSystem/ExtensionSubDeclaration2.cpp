/**

Game Develop - Particle System Extension
Copyright (c) 2010-2014 Florian Rival (Florian.Rival@gmail.com)

This software is provided 'as-is', without any express or implied
warranty. In no event will the authors be held liable for any damages
arising from the use of this software.

Permission is granted to anyone to use this software for any purpose,
including commercial applications, and to alter it and redistribute it
freely, subject to the following restrictions:

    1. The origin of this software must not be misrepresented; you must not
    claim that you wrote the original software. If you use this software
    in a product, an acknowledgment in the product documentation would be
    appreciated but is not required.

    2. Altered source versions must be plainly marked as such, and must not be
    misrepresented as being the original software.

    3. This notice may not be removed or altered from any source
    distribution.

*/

#include "GDCpp/ExtensionBase.h"
#include "GDCore/Tools/Version.h"
#include "Extension.h"
#include "ParticleEmitterObject.h"

/**
 * Declare some actions and conditions of the particle emitter
 */
void Extension::ExtensionSubDeclaration2(gd::ObjectMetadata & obj)
{
    #if defined(GD_IDE_ONLY)
    obj.AddAction("ParticleColor1",
                   _("Initial color"),
                   _("Modify initial color of particles."),
                   _("Put initial color of particles of _PARAM0_ to _PARAM1_"),
                   _("Common"),
                   "CppPlatform/Extensions/particleSystemicon24.png",
                   "CppPlatform/Extensions/particleSystemicon16.png")
        .AddParameter("object", _("Object"), "ParticleEmitter")
        .AddParameter("color", _("Initial color"))

        .codeExtraInformation.SetFunctionName("SetParticleColor1").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");

    obj.AddAction("ParticleColor2",
                   _("Final color"),
                   _("Modify final color of particles."),
                   _("Put final color of particles of _PARAM0_ to _PARAM1_"),
                   _("Common"),
                   "CppPlatform/Extensions/particleSystemicon24.png",
                   "CppPlatform/Extensions/particleSystemicon16.png")
        .AddParameter("object", _("Object"), "ParticleEmitter")
        .AddParameter("color", _("Final color"))

        .codeExtraInformation.SetFunctionName("SetParticleColor2").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");

    obj.AddAction("ParticleRed1",
                   _("Red color, parameter 1"),
                   _("Modify parameter 1 of the red color."),
                   _("Do _PARAM1__PARAM2_ to parameter 1 of red color of _PARAM0_"),
                   _("Advanced"),
                   "CppPlatform/Extensions/particleSystemicon24.png",
                   "CppPlatform/Extensions/particleSystemicon16.png")
        .AddParameter("object", _("Object"), "ParticleEmitter")
        .AddParameter("operator", _("Modification's sign"))
        .AddParameter("expression", _("Value"))

        .codeExtraInformation.SetFunctionName("SetParticleRed1").SetManipulatedType("number").SetAssociatedGetter("GetParticleRed1").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");

    obj.AddCondition("ParticleRed1",
                   _("Red color, parameter 1"),
                   _("Test parameter 1 of the red color"),
                   _("Parameter 1 of red color of _PARAM0_ is _PARAM1__PARAM2_"),
                   _("Advanced"),
                   "CppPlatform/Extensions/particleSystemicon24.png",
                   "CppPlatform/Extensions/particleSystemicon16.png")
        .AddParameter("object", _("Object"), "ParticleEmitter")
        .AddParameter("relationalOperator", _("Sign of the test"))
        .AddParameter("expression", _("Value to test"))

        .codeExtraInformation.SetFunctionName("GetParticleRed1").SetManipulatedType("number").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");

    obj.AddAction("ParticleRed2",
                   _("Red color, parameter 2"),
                   _("Modify parameter 2 of the red color"),
                   _("Do _PARAM1__PARAM2_ to parameter 2 of red color of _PARAM0_"),
                   _("Advanced"),
                   "CppPlatform/Extensions/particleSystemicon24.png",
                   "CppPlatform/Extensions/particleSystemicon16.png")
        .AddParameter("object", _("Object"), "ParticleEmitter")
        .AddParameter("operator", _("Modification's sign"))
        .AddParameter("expression", _("Value"))

        .codeExtraInformation.SetFunctionName("SetParticleRed2").SetManipulatedType("number").SetAssociatedGetter("GetParticleRed2").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");

    obj.AddCondition("ParticleRed2",
                   _("Red color, parameter 2"),
                   _("Test parameter 2 of the red color"),
                   _("Parameter 2 of red color of _PARAM0_ is _PARAM1__PARAM2_"),
                   _("Advanced"),
                   "CppPlatform/Extensions/particleSystemicon24.png",
                   "CppPlatform/Extensions/particleSystemicon16.png")
        .AddParameter("object", _("Object"), "ParticleEmitter")
        .AddParameter("relationalOperator", _("Sign of the test"))
        .AddParameter("expression", _("Value to test"))

        .codeExtraInformation.SetFunctionName("GetParticleRed2").SetManipulatedType("number").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");

    obj.AddAction("ParticleBlue1",
                   _("Blue color, parameter 1"),
                   _("Modify parameter 1 of blue color"),
                   _("Do _PARAM1__PARAM2_ to the parameter 1 of blue color of _PARAM0_"),
                   _("Advanced"),
                   "CppPlatform/Extensions/particleSystemicon24.png",
                   "CppPlatform/Extensions/particleSystemicon16.png")
        .AddParameter("object", _("Object"), "ParticleEmitter")
        .AddParameter("operator", _("Modification's sign"))
        .AddParameter("expression", _("Value"))

        .codeExtraInformation.SetFunctionName("SetParticleBlue1").SetManipulatedType("number").SetAssociatedGetter("GetParticleBlue1").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");

    obj.AddCondition("ParticleBlue1",
                   _("Blue color, parameter 1"),
                   _("Test parameter 1 of blue color"),
                   _("Parameter 1 of blue color of _PARAM0_ is _PARAM1__PARAM2_"),
                   _("Advanced"),
                   "CppPlatform/Extensions/particleSystemicon24.png",
                   "CppPlatform/Extensions/particleSystemicon16.png")
        .AddParameter("object", _("Object"), "ParticleEmitter")
        .AddParameter("relationalOperator", _("Sign of the test"))
        .AddParameter("expression", _("Value to test"))

        .codeExtraInformation.SetFunctionName("GetParticleBlue1").SetManipulatedType("number").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");

    obj.AddAction("ParticleBlue2",
                   _("Blue color, parameter 2"),
                   _("Modify parameter 2 of blue color"),
                   _("Do _PARAM1__PARAM2_ to the parameter 2 of blue color of _PARAM0_"),
                   _("Advanced"),
                   "CppPlatform/Extensions/particleSystemicon24.png",
                   "CppPlatform/Extensions/particleSystemicon16.png")
        .AddParameter("object", _("Object"), "ParticleEmitter")
        .AddParameter("operator", _("Modification's sign"))
        .AddParameter("expression", _("Value"))

        .codeExtraInformation.SetFunctionName("SetParticleBlue2").SetManipulatedType("number").SetAssociatedGetter("GetParticleBlue2").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");

    obj.AddCondition("ParticleBlue2",
                   _("Blue color, parameter 2"),
                   _("Test parameter 2 of blue color"),
                   _("Parameter 2 of blue color of _PARAM0_ is _PARAM1__PARAM2_"),
                   _("Advanced"),
                   "CppPlatform/Extensions/particleSystemicon24.png",
                   "CppPlatform/Extensions/particleSystemicon16.png")
        .AddParameter("object", _("Object"), "ParticleEmitter")
        .AddParameter("relationalOperator", _("Sign of the test"))
        .AddParameter("expression", _("Value to test"))

        .codeExtraInformation.SetFunctionName("GetParticleBlue2").SetManipulatedType("number").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");

    obj.AddAction("ParticleGreen1",
                   _("Green color, parameter 1"),
                   _("Modify parameter 1 of green color"),
                   _("Do _PARAM1__PARAM2_ to the parameter 1 of green color of _PARAM0_"),
                   _("Advanced"),
                   "CppPlatform/Extensions/particleSystemicon24.png",
                   "CppPlatform/Extensions/particleSystemicon16.png")
        .AddParameter("object", _("Object"), "ParticleEmitter")
        .AddParameter("operator", _("Modification's sign"))
        .AddParameter("expression", _("Value"))

        .codeExtraInformation.SetFunctionName("SetParticleGreen1").SetManipulatedType("number").SetAssociatedGetter("GetParticleGreen1").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");

    obj.AddCondition("ParticleGreen1",
                   _("Green color, parameter 1"),
                   _("Test parameter 1 of green color"),
                   _("Parameter 1 of green color of _PARAM0_ is _PARAM1__PARAM2_"),
                   _("Advanced"),
                   "CppPlatform/Extensions/particleSystemicon24.png",
                   "CppPlatform/Extensions/particleSystemicon16.png")
        .AddParameter("object", _("Object"), "ParticleEmitter")
        .AddParameter("relationalOperator", _("Sign of the test"))
        .AddParameter("expression", _("Value to test"))

        .codeExtraInformation.SetFunctionName("GetParticleGreen1").SetManipulatedType("number").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");


    obj.AddAction("ParticleGreen2",
                   _("Green color, parameter 2"),
                   _("Modify the parameter 2 of the green color"),
                   _("Do _PARAM1__PARAM2_ to the parameter 2 of green color of _PARAM0_"),
                   _("Advanced"),
                   "CppPlatform/Extensions/particleSystemicon24.png",
                   "CppPlatform/Extensions/particleSystemicon16.png")
        .AddParameter("object", _("Object"), "ParticleEmitter")
        .AddParameter("operator", _("Modification's sign"))
        .AddParameter("expression", _("Value"))

        .codeExtraInformation.SetFunctionName("SetParticleGreen2").SetManipulatedType("number").SetAssociatedGetter("GetParticleGreen2").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");

    obj.AddCondition("ParticleGreen2",
                   _("Green color, parameter 2"),
                   _("Test the parameter 2 of the green color"),
                   _("Parameter 2 of green color of _PARAM0_ is _PARAM1__PARAM2_"),
                   _("Advanced"),
                   "CppPlatform/Extensions/particleSystemicon24.png",
                   "CppPlatform/Extensions/particleSystemicon16.png")
        .AddParameter("object", _("Object"), "ParticleEmitter")
        .AddParameter("relationalOperator", _("Sign of the test"))
        .AddParameter("expression", _("Value to test"))

        .codeExtraInformation.SetFunctionName("GetParticleGreen2").SetManipulatedType("number").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");


    obj.AddAction("ParticleSize1",
                   _("SIze, parameter 1"),
                   _("Modifyt parameter 1 of the size of particles"),
                   _("Do _PARAM1__PARAM2_ to the parameter 1 of size of _PARAM0_"),
                   _("Common"),
                   "CppPlatform/Extensions/particleSystemicon24.png",
                   "CppPlatform/Extensions/particleSystemicon16.png")
        .AddParameter("object", _("Object"), "ParticleEmitter")
        .AddParameter("operator", _("Modification's sign"))
        .AddParameter("expression", _("Value"))

        .codeExtraInformation.SetFunctionName("SetParticleSize1").SetManipulatedType("number").SetAssociatedGetter("GetParticleSize1").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");

    obj.AddCondition("ParticleSize1",
                   _("SIze, parameter 1"),
                   _("Test parameter 1 of the size of particles"),
                   _("Parameter 1 of the size of _PARAM0_ is _PARAM1__PARAM2_"),
                   _("Common"),
                   "CppPlatform/Extensions/particleSystemicon24.png",
                   "CppPlatform/Extensions/particleSystemicon16.png")
        .AddParameter("object", _("Object"), "ParticleEmitter")
        .AddParameter("relationalOperator", _("Sign of the test"))
        .AddParameter("expression", _("Value to test"))

        .codeExtraInformation.SetFunctionName("GetParticleSize1").SetManipulatedType("number").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");

    obj.AddAction("ParticleSize2",
                   _("Size, parameter 2"),
                   _("Modify parameter 2 of the size of particles"),
                   _("Do _PARAM1__PARAM2_ to the parameter 2 of size of _PARAM0_"),
                   _("Common"),
                   "CppPlatform/Extensions/particleSystemicon24.png",
                   "CppPlatform/Extensions/particleSystemicon16.png")
        .AddParameter("object", _("Object"), "ParticleEmitter")
        .AddParameter("operator", _("Modification's sign"))
        .AddParameter("expression", _("Value"))

        .codeExtraInformation.SetFunctionName("SetParticleSize2").SetManipulatedType("number").SetAssociatedGetter("GetParticleSize2").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");

    obj.AddCondition("ParticleSize2",
                   _("Size, parameter 2"),
                   _("Test parameter 2 of the size of particles"),
                   _("Parameter 2 of the size of _PARAM0_ is _PARAM1__PARAM2_"),
                   _("Common"),
                   "CppPlatform/Extensions/particleSystemicon24.png",
                   "CppPlatform/Extensions/particleSystemicon16.png")
        .AddParameter("object", _("Object"), "ParticleEmitter")
        .AddParameter("relationalOperator", _("Sign of the test"))
        .AddParameter("expression", _("Value to test"))

        .codeExtraInformation.SetFunctionName("GetParticleSize2").SetManipulatedType("number").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");

    obj.AddAction("ParticleAngle1",
                   _("Angle, parameter 1"),
                   _("Modify parameter 1 of the angle of particles"),
                   _("Do _PARAM1__PARAM2_ to the parameter 1 of angle of _PARAM0_"),
                   _("Common"),
                   "CppPlatform/Extensions/particleSystemicon24.png",
                   "CppPlatform/Extensions/particleSystemicon16.png")
        .AddParameter("object", _("Object"), "ParticleEmitter")
        .AddParameter("operator", _("Modification's sign"))
        .AddParameter("expression", _("Value"))

        .codeExtraInformation.SetFunctionName("SetParticleAngle1").SetManipulatedType("number").SetAssociatedGetter("GetParticleAngle1").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");

    obj.AddCondition("ParticleAngle1",
                   _("Angle, parameter 1"),
                   _("Test parameter 1 of the angle of particles"),
                   _("Parameter 1 of angle of _PARAM0_ is _PARAM1__PARAM2_"),
                   _("Common"),
                   "CppPlatform/Extensions/particleSystemicon24.png",
                   "CppPlatform/Extensions/particleSystemicon16.png")
        .AddParameter("object", _("Object"), "ParticleEmitter")
        .AddParameter("relationalOperator", _("Sign of the test"))
        .AddParameter("expression", _("Value to test"))

        .codeExtraInformation.SetFunctionName("GetParticleAngle1").SetManipulatedType("number").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");

    obj.AddAction("ParticleAngle2",
                   _("Angle, parameter 2"),
                   _("Modify parameter 2 of the angle of particles"),
                   _("Do _PARAM1__PARAM2_ to the parameter 2 of angle of _PARAM0_"),
                   _("Common"),
                   "CppPlatform/Extensions/particleSystemicon24.png",
                   "CppPlatform/Extensions/particleSystemicon16.png")
        .AddParameter("object", _("Object"), "ParticleEmitter")
        .AddParameter("operator", _("Modification's sign"))
        .AddParameter("expression", _("Value"))

        .codeExtraInformation.SetFunctionName("SetParticleAngle2").SetManipulatedType("number").SetAssociatedGetter("GetParticleAngle2").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");

    obj.AddCondition("ParticleAngle2",
                   _("Angle, parameter 2"),
                   _("Test parameter 2 of the angle of particles"),
                   _("Parameter 2 of angle of _PARAM0_ is _PARAM1__PARAM2_"),
                   _("Common"),
                   "CppPlatform/Extensions/particleSystemicon24.png",
                   "CppPlatform/Extensions/particleSystemicon16.png")
        .AddParameter("object", _("Object"), "ParticleEmitter")
        .AddParameter("relationalOperator", _("Sign of the test"))
        .AddParameter("expression", _("Value to test"))

        .codeExtraInformation.SetFunctionName("GetParticleAngle2").SetManipulatedType("number").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");

    obj.AddAction("ParticleAlpha1",
                   _("Transparency, parameter 1"),
                   _("Modify parameter 1 of the transparency of particles"),
                   _("Do _PARAM1__PARAM2_ to parameter 1 of the transparency of _PARAM0_"),
                   _("Common"),
                   "CppPlatform/Extensions/particleSystemicon24.png",
                   "CppPlatform/Extensions/particleSystemicon16.png")
        .AddParameter("object", _("Object"), "ParticleEmitter")
        .AddParameter("operator", _("Modification's sign"))
        .AddParameter("expression", _("Value"))

        .codeExtraInformation.SetFunctionName("SetParticleAlpha1").SetManipulatedType("number").SetAssociatedGetter("GetParticleAlpha1").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");

    obj.AddCondition("ParticleAlpha1",
                   _("Transparency, parameter 1"),
                   _("Test parameter 1 of the transparency of particles"),
                   _("Parameter 1 of the transparency of _PARAM0_ is _PARAM1__PARAM2_"),
                   _("Common"),
                   "CppPlatform/Extensions/particleSystemicon24.png",
                   "CppPlatform/Extensions/particleSystemicon16.png")
        .AddParameter("object", _("Object"), "ParticleEmitter")
        .AddParameter("relationalOperator", _("Sign of the test"))
        .AddParameter("expression", _("Value to test"))

        .codeExtraInformation.SetFunctionName("GetParticleAlpha1").SetManipulatedType("number").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");

    obj.AddAction("ParticleAlpha2",
                   _("Transparency, parameter 2"),
                   _("Modify parameter 2 of the transparency of particles"),
                   _("Do _PARAM1__PARAM2_ to parameter 2 of the transparency of _PARAM0_"),
                   _("Common"),
                   "CppPlatform/Extensions/particleSystemicon24.png",
                   "CppPlatform/Extensions/particleSystemicon16.png")
        .AddParameter("object", _("Object"), "ParticleEmitter")
        .AddParameter("operator", _("Modification's sign"))
        .AddParameter("expression", _("Value"))

        .codeExtraInformation.SetFunctionName("SetParticleAlpha2").SetManipulatedType("number").SetAssociatedGetter("GetParticleAlpha2").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");


    obj.AddCondition("ParticleAlpha2",
                   _("Transparency, parameter 2"),
                   _("Test parameter 2 of the transparency of particles"),
                   _("Parameter 2 of the transparency of _PARAM0_ is _PARAM1__PARAM2_"),
                   _("Common"),
                   "CppPlatform/Extensions/particleSystemicon24.png",
                   "CppPlatform/Extensions/particleSystemicon16.png")
        .AddParameter("object", _("Object"), "ParticleEmitter")
        .AddParameter("relationalOperator", _("Sign of the test"))
        .AddParameter("expression", _("Value to test"))

        .codeExtraInformation.SetFunctionName("GetParticleAlpha2").SetManipulatedType("number").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");


    obj.AddCondition("NoMoreParticles",
                   _("No more particles"),
                   _("Return true if the object does not emit particles anylonger, so as to destroy it for example."),
                   _("_PARAM0_ does not emit anylonger."),
                   _("Common"),
                   "CppPlatform/Extensions/particleSystemicon24.png",
                   "CppPlatform/Extensions/particleSystemicon16.png")
        .AddParameter("object", _("Object"), "ParticleEmitter")

        .codeExtraInformation.SetFunctionName("NoMoreParticles").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");

    #endif
}


/**

GDevelop - Particle System Extension
Copyright (c) 2010-2015 Florian Rival (Florian.Rival@gmail.com)
This project is released under the MIT License.
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
                   GD_T("Initial color"),
                   GD_T("Modify initial color of particles."),
                   GD_T("Put initial color of particles of _PARAM0_ to _PARAM1_"),
                   GD_T("Common"),
                   "CppPlatform/Extensions/particleSystemicon24.png",
                   "CppPlatform/Extensions/particleSystemicon16.png")
        .AddParameter("object", GD_T("Object"), "ParticleEmitter")
        .AddParameter("color", GD_T("Initial color"))

        .SetFunctionName("SetParticleColor1").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");

    obj.AddAction("ParticleColor2",
                   GD_T("Final color"),
                   GD_T("Modify final color of particles."),
                   GD_T("Put final color of particles of _PARAM0_ to _PARAM1_"),
                   GD_T("Common"),
                   "CppPlatform/Extensions/particleSystemicon24.png",
                   "CppPlatform/Extensions/particleSystemicon16.png")
        .AddParameter("object", GD_T("Object"), "ParticleEmitter")
        .AddParameter("color", GD_T("Final color"))

        .SetFunctionName("SetParticleColor2").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");

    obj.AddAction("ParticleRed1",
                   GD_T("Red color, parameter 1"),
                   GD_T("Modify parameter 1 of the red color."),
                   GD_T("Do _PARAM1__PARAM2_ to parameter 1 of red color of _PARAM0_"),
                   GD_T("Advanced"),
                   "CppPlatform/Extensions/particleSystemicon24.png",
                   "CppPlatform/Extensions/particleSystemicon16.png")
        .AddParameter("object", GD_T("Object"), "ParticleEmitter")
        .AddParameter("operator", GD_T("Modification's sign"))
        .AddParameter("expression", GD_T("Value"))

        .SetFunctionName("SetParticleRed1").SetManipulatedType("number").SetGetter("GetParticleRed1").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");

    obj.AddCondition("ParticleRed1",
                   GD_T("Red color, parameter 1"),
                   GD_T("Test parameter 1 of the red color"),
                   GD_T("Parameter 1 of red color of _PARAM0_ is _PARAM1__PARAM2_"),
                   GD_T("Advanced"),
                   "CppPlatform/Extensions/particleSystemicon24.png",
                   "CppPlatform/Extensions/particleSystemicon16.png")
        .AddParameter("object", GD_T("Object"), "ParticleEmitter")
        .AddParameter("relationalOperator", GD_T("Sign of the test"))
        .AddParameter("expression", GD_T("Value to test"))

        .SetFunctionName("GetParticleRed1").SetManipulatedType("number").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");

    obj.AddAction("ParticleRed2",
                   GD_T("Red color, parameter 2"),
                   GD_T("Modify parameter 2 of the red color"),
                   GD_T("Do _PARAM1__PARAM2_ to parameter 2 of red color of _PARAM0_"),
                   GD_T("Advanced"),
                   "CppPlatform/Extensions/particleSystemicon24.png",
                   "CppPlatform/Extensions/particleSystemicon16.png")
        .AddParameter("object", GD_T("Object"), "ParticleEmitter")
        .AddParameter("operator", GD_T("Modification's sign"))
        .AddParameter("expression", GD_T("Value"))

        .SetFunctionName("SetParticleRed2").SetManipulatedType("number").SetGetter("GetParticleRed2").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");

    obj.AddCondition("ParticleRed2",
                   GD_T("Red color, parameter 2"),
                   GD_T("Test parameter 2 of the red color"),
                   GD_T("Parameter 2 of red color of _PARAM0_ is _PARAM1__PARAM2_"),
                   GD_T("Advanced"),
                   "CppPlatform/Extensions/particleSystemicon24.png",
                   "CppPlatform/Extensions/particleSystemicon16.png")
        .AddParameter("object", GD_T("Object"), "ParticleEmitter")
        .AddParameter("relationalOperator", GD_T("Sign of the test"))
        .AddParameter("expression", GD_T("Value to test"))

        .SetFunctionName("GetParticleRed2").SetManipulatedType("number").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");

    obj.AddAction("ParticleBlue1",
                   GD_T("Blue color, parameter 1"),
                   GD_T("Modify parameter 1 of blue color"),
                   GD_T("Do _PARAM1__PARAM2_ to the parameter 1 of blue color of _PARAM0_"),
                   GD_T("Advanced"),
                   "CppPlatform/Extensions/particleSystemicon24.png",
                   "CppPlatform/Extensions/particleSystemicon16.png")
        .AddParameter("object", GD_T("Object"), "ParticleEmitter")
        .AddParameter("operator", GD_T("Modification's sign"))
        .AddParameter("expression", GD_T("Value"))

        .SetFunctionName("SetParticleBlue1").SetManipulatedType("number").SetGetter("GetParticleBlue1").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");

    obj.AddCondition("ParticleBlue1",
                   GD_T("Blue color, parameter 1"),
                   GD_T("Test parameter 1 of blue color"),
                   GD_T("Parameter 1 of blue color of _PARAM0_ is _PARAM1__PARAM2_"),
                   GD_T("Advanced"),
                   "CppPlatform/Extensions/particleSystemicon24.png",
                   "CppPlatform/Extensions/particleSystemicon16.png")
        .AddParameter("object", GD_T("Object"), "ParticleEmitter")
        .AddParameter("relationalOperator", GD_T("Sign of the test"))
        .AddParameter("expression", GD_T("Value to test"))

        .SetFunctionName("GetParticleBlue1").SetManipulatedType("number").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");

    obj.AddAction("ParticleBlue2",
                   GD_T("Blue color, parameter 2"),
                   GD_T("Modify parameter 2 of blue color"),
                   GD_T("Do _PARAM1__PARAM2_ to the parameter 2 of blue color of _PARAM0_"),
                   GD_T("Advanced"),
                   "CppPlatform/Extensions/particleSystemicon24.png",
                   "CppPlatform/Extensions/particleSystemicon16.png")
        .AddParameter("object", GD_T("Object"), "ParticleEmitter")
        .AddParameter("operator", GD_T("Modification's sign"))
        .AddParameter("expression", GD_T("Value"))

        .SetFunctionName("SetParticleBlue2").SetManipulatedType("number").SetGetter("GetParticleBlue2").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");

    obj.AddCondition("ParticleBlue2",
                   GD_T("Blue color, parameter 2"),
                   GD_T("Test parameter 2 of blue color"),
                   GD_T("Parameter 2 of blue color of _PARAM0_ is _PARAM1__PARAM2_"),
                   GD_T("Advanced"),
                   "CppPlatform/Extensions/particleSystemicon24.png",
                   "CppPlatform/Extensions/particleSystemicon16.png")
        .AddParameter("object", GD_T("Object"), "ParticleEmitter")
        .AddParameter("relationalOperator", GD_T("Sign of the test"))
        .AddParameter("expression", GD_T("Value to test"))

        .SetFunctionName("GetParticleBlue2").SetManipulatedType("number").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");

    obj.AddAction("ParticleGreen1",
                   GD_T("Green color, parameter 1"),
                   GD_T("Modify parameter 1 of green color"),
                   GD_T("Do _PARAM1__PARAM2_ to the parameter 1 of green color of _PARAM0_"),
                   GD_T("Advanced"),
                   "CppPlatform/Extensions/particleSystemicon24.png",
                   "CppPlatform/Extensions/particleSystemicon16.png")
        .AddParameter("object", GD_T("Object"), "ParticleEmitter")
        .AddParameter("operator", GD_T("Modification's sign"))
        .AddParameter("expression", GD_T("Value"))

        .SetFunctionName("SetParticleGreen1").SetManipulatedType("number").SetGetter("GetParticleGreen1").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");

    obj.AddCondition("ParticleGreen1",
                   GD_T("Green color, parameter 1"),
                   GD_T("Test parameter 1 of green color"),
                   GD_T("Parameter 1 of green color of _PARAM0_ is _PARAM1__PARAM2_"),
                   GD_T("Advanced"),
                   "CppPlatform/Extensions/particleSystemicon24.png",
                   "CppPlatform/Extensions/particleSystemicon16.png")
        .AddParameter("object", GD_T("Object"), "ParticleEmitter")
        .AddParameter("relationalOperator", GD_T("Sign of the test"))
        .AddParameter("expression", GD_T("Value to test"))

        .SetFunctionName("GetParticleGreen1").SetManipulatedType("number").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");


    obj.AddAction("ParticleGreen2",
                   GD_T("Green color, parameter 2"),
                   GD_T("Modify the parameter 2 of the green color"),
                   GD_T("Do _PARAM1__PARAM2_ to the parameter 2 of green color of _PARAM0_"),
                   GD_T("Advanced"),
                   "CppPlatform/Extensions/particleSystemicon24.png",
                   "CppPlatform/Extensions/particleSystemicon16.png")
        .AddParameter("object", GD_T("Object"), "ParticleEmitter")
        .AddParameter("operator", GD_T("Modification's sign"))
        .AddParameter("expression", GD_T("Value"))

        .SetFunctionName("SetParticleGreen2").SetManipulatedType("number").SetGetter("GetParticleGreen2").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");

    obj.AddCondition("ParticleGreen2",
                   GD_T("Green color, parameter 2"),
                   GD_T("Test the parameter 2 of the green color"),
                   GD_T("Parameter 2 of green color of _PARAM0_ is _PARAM1__PARAM2_"),
                   GD_T("Advanced"),
                   "CppPlatform/Extensions/particleSystemicon24.png",
                   "CppPlatform/Extensions/particleSystemicon16.png")
        .AddParameter("object", GD_T("Object"), "ParticleEmitter")
        .AddParameter("relationalOperator", GD_T("Sign of the test"))
        .AddParameter("expression", GD_T("Value to test"))

        .SetFunctionName("GetParticleGreen2").SetManipulatedType("number").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");


    obj.AddAction("ParticleSize1",
                   GD_T("SIze, parameter 1"),
                   GD_T("Modifyt parameter 1 of the size of particles"),
                   GD_T("Do _PARAM1__PARAM2_ to the parameter 1 of size of _PARAM0_"),
                   GD_T("Common"),
                   "CppPlatform/Extensions/particleSystemicon24.png",
                   "CppPlatform/Extensions/particleSystemicon16.png")
        .AddParameter("object", GD_T("Object"), "ParticleEmitter")
        .AddParameter("operator", GD_T("Modification's sign"))
        .AddParameter("expression", GD_T("Value"))

        .SetFunctionName("SetParticleSize1").SetManipulatedType("number").SetGetter("GetParticleSize1").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");

    obj.AddCondition("ParticleSize1",
                   GD_T("SIze, parameter 1"),
                   GD_T("Test parameter 1 of the size of particles"),
                   GD_T("Parameter 1 of the size of _PARAM0_ is _PARAM1__PARAM2_"),
                   GD_T("Common"),
                   "CppPlatform/Extensions/particleSystemicon24.png",
                   "CppPlatform/Extensions/particleSystemicon16.png")
        .AddParameter("object", GD_T("Object"), "ParticleEmitter")
        .AddParameter("relationalOperator", GD_T("Sign of the test"))
        .AddParameter("expression", GD_T("Value to test"))

        .SetFunctionName("GetParticleSize1").SetManipulatedType("number").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");

    obj.AddAction("ParticleSize2",
                   GD_T("Size, parameter 2"),
                   GD_T("Modify parameter 2 of the size of particles"),
                   GD_T("Do _PARAM1__PARAM2_ to the parameter 2 of size of _PARAM0_"),
                   GD_T("Common"),
                   "CppPlatform/Extensions/particleSystemicon24.png",
                   "CppPlatform/Extensions/particleSystemicon16.png")
        .AddParameter("object", GD_T("Object"), "ParticleEmitter")
        .AddParameter("operator", GD_T("Modification's sign"))
        .AddParameter("expression", GD_T("Value"))

        .SetFunctionName("SetParticleSize2").SetManipulatedType("number").SetGetter("GetParticleSize2").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");

    obj.AddCondition("ParticleSize2",
                   GD_T("Size, parameter 2"),
                   GD_T("Test parameter 2 of the size of particles"),
                   GD_T("Parameter 2 of the size of _PARAM0_ is _PARAM1__PARAM2_"),
                   GD_T("Common"),
                   "CppPlatform/Extensions/particleSystemicon24.png",
                   "CppPlatform/Extensions/particleSystemicon16.png")
        .AddParameter("object", GD_T("Object"), "ParticleEmitter")
        .AddParameter("relationalOperator", GD_T("Sign of the test"))
        .AddParameter("expression", GD_T("Value to test"))

        .SetFunctionName("GetParticleSize2").SetManipulatedType("number").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");

    obj.AddAction("ParticleAngle1",
                   GD_T("Angle, parameter 1"),
                   GD_T("Modify parameter 1 of the angle of particles"),
                   GD_T("Do _PARAM1__PARAM2_ to the parameter 1 of angle of _PARAM0_"),
                   GD_T("Common"),
                   "CppPlatform/Extensions/particleSystemicon24.png",
                   "CppPlatform/Extensions/particleSystemicon16.png")
        .AddParameter("object", GD_T("Object"), "ParticleEmitter")
        .AddParameter("operator", GD_T("Modification's sign"))
        .AddParameter("expression", GD_T("Value"))

        .SetFunctionName("SetParticleAngle1").SetManipulatedType("number").SetGetter("GetParticleAngle1").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");

    obj.AddCondition("ParticleAngle1",
                   GD_T("Angle, parameter 1"),
                   GD_T("Test parameter 1 of the angle of particles"),
                   GD_T("Parameter 1 of angle of _PARAM0_ is _PARAM1__PARAM2_"),
                   GD_T("Common"),
                   "CppPlatform/Extensions/particleSystemicon24.png",
                   "CppPlatform/Extensions/particleSystemicon16.png")
        .AddParameter("object", GD_T("Object"), "ParticleEmitter")
        .AddParameter("relationalOperator", GD_T("Sign of the test"))
        .AddParameter("expression", GD_T("Value to test"))

        .SetFunctionName("GetParticleAngle1").SetManipulatedType("number").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");

    obj.AddAction("ParticleAngle2",
                   GD_T("Angle, parameter 2"),
                   GD_T("Modify parameter 2 of the angle of particles"),
                   GD_T("Do _PARAM1__PARAM2_ to the parameter 2 of angle of _PARAM0_"),
                   GD_T("Common"),
                   "CppPlatform/Extensions/particleSystemicon24.png",
                   "CppPlatform/Extensions/particleSystemicon16.png")
        .AddParameter("object", GD_T("Object"), "ParticleEmitter")
        .AddParameter("operator", GD_T("Modification's sign"))
        .AddParameter("expression", GD_T("Value"))

        .SetFunctionName("SetParticleAngle2").SetManipulatedType("number").SetGetter("GetParticleAngle2").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");

    obj.AddCondition("ParticleAngle2",
                   GD_T("Angle, parameter 2"),
                   GD_T("Test parameter 2 of the angle of particles"),
                   GD_T("Parameter 2 of angle of _PARAM0_ is _PARAM1__PARAM2_"),
                   GD_T("Common"),
                   "CppPlatform/Extensions/particleSystemicon24.png",
                   "CppPlatform/Extensions/particleSystemicon16.png")
        .AddParameter("object", GD_T("Object"), "ParticleEmitter")
        .AddParameter("relationalOperator", GD_T("Sign of the test"))
        .AddParameter("expression", GD_T("Value to test"))

        .SetFunctionName("GetParticleAngle2").SetManipulatedType("number").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");

    obj.AddAction("ParticleAlpha1",
                   GD_T("Transparency, parameter 1"),
                   GD_T("Modify parameter 1 of the transparency of particles"),
                   GD_T("Do _PARAM1__PARAM2_ to parameter 1 of the transparency of _PARAM0_"),
                   GD_T("Common"),
                   "CppPlatform/Extensions/particleSystemicon24.png",
                   "CppPlatform/Extensions/particleSystemicon16.png")
        .AddParameter("object", GD_T("Object"), "ParticleEmitter")
        .AddParameter("operator", GD_T("Modification's sign"))
        .AddParameter("expression", GD_T("Value"))

        .SetFunctionName("SetParticleAlpha1").SetManipulatedType("number").SetGetter("GetParticleAlpha1").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");

    obj.AddCondition("ParticleAlpha1",
                   GD_T("Transparency, parameter 1"),
                   GD_T("Test parameter 1 of the transparency of particles"),
                   GD_T("Parameter 1 of the transparency of _PARAM0_ is _PARAM1__PARAM2_"),
                   GD_T("Common"),
                   "CppPlatform/Extensions/particleSystemicon24.png",
                   "CppPlatform/Extensions/particleSystemicon16.png")
        .AddParameter("object", GD_T("Object"), "ParticleEmitter")
        .AddParameter("relationalOperator", GD_T("Sign of the test"))
        .AddParameter("expression", GD_T("Value to test"))

        .SetFunctionName("GetParticleAlpha1").SetManipulatedType("number").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");

    obj.AddAction("ParticleAlpha2",
                   GD_T("Transparency, parameter 2"),
                   GD_T("Modify parameter 2 of the transparency of particles"),
                   GD_T("Do _PARAM1__PARAM2_ to parameter 2 of the transparency of _PARAM0_"),
                   GD_T("Common"),
                   "CppPlatform/Extensions/particleSystemicon24.png",
                   "CppPlatform/Extensions/particleSystemicon16.png")
        .AddParameter("object", GD_T("Object"), "ParticleEmitter")
        .AddParameter("operator", GD_T("Modification's sign"))
        .AddParameter("expression", GD_T("Value"))

        .SetFunctionName("SetParticleAlpha2").SetManipulatedType("number").SetGetter("GetParticleAlpha2").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");


    obj.AddCondition("ParticleAlpha2",
                   GD_T("Transparency, parameter 2"),
                   GD_T("Test parameter 2 of the transparency of particles"),
                   GD_T("Parameter 2 of the transparency of _PARAM0_ is _PARAM1__PARAM2_"),
                   GD_T("Common"),
                   "CppPlatform/Extensions/particleSystemicon24.png",
                   "CppPlatform/Extensions/particleSystemicon16.png")
        .AddParameter("object", GD_T("Object"), "ParticleEmitter")
        .AddParameter("relationalOperator", GD_T("Sign of the test"))
        .AddParameter("expression", GD_T("Value to test"))

        .SetFunctionName("GetParticleAlpha2").SetManipulatedType("number").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");


    obj.AddCondition("NoMoreParticles",
                   GD_T("No more particles"),
                   GD_T("Return true if the object does not emit particles anylonger, so as to destroy it for example."),
                   GD_T("_PARAM0_ does not emit anylonger."),
                   GD_T("Common"),
                   "CppPlatform/Extensions/particleSystemicon24.png",
                   "CppPlatform/Extensions/particleSystemicon16.png")
        .AddParameter("object", GD_T("Object"), "ParticleEmitter")

        .SetFunctionName("NoMoreParticles").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");

    #endif
}


/**

Game Develop - Particle System Extension
Copyright (c) 2010-2012 Florian Rival (Florian.Rival@gmail.com)

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

#include "GDL/ExtensionBase.h"
#include "GDL/Version.h"
#include "Extension.h"
#include "ParticleEmitterObject.h"

/**
 * Declare some actions and conditions of the particle emitter
 */
void Extension::ExtensionSubDeclaration2(ExtensionObjectInfos & objInfos)
{
    #if defined(GD_IDE_ONLY)
    DECLARE_OBJECT_ACTION("ParticleColor1",
                   _("Initial color"),
                   _("Modify initial color of particles."),
                   _("Put initial color of particles of _PARAM0_ to _PARAM1_"),
                   _("Common"),
                   "Extensions/particleSystemicon24.png",
                   "Extensions/particleSystemicon16.png");

        instrInfo.AddParameter("object", _("Object"), "ParticleEmitter", false);
        instrInfo.AddParameter("color", _("Initial color"), "", false);


        instrInfo.cppCallingInformation.SetFunctionName("SetParticleColor1").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");

    DECLARE_END_OBJECT_ACTION()

    DECLARE_OBJECT_ACTION("ParticleColor2",
                   _("Final color"),
                   _("Modify final color of particles."),
                   _("Put final color of particles of _PARAM0_ to _PARAM1_"),
                   _("Common"),
                   "Extensions/particleSystemicon24.png",
                   "Extensions/particleSystemicon16.png");

        instrInfo.AddParameter("object", _("Object"), "ParticleEmitter", false);
        instrInfo.AddParameter("color", _("Final color"), "", false);


        instrInfo.cppCallingInformation.SetFunctionName("SetParticleColor2").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");

    DECLARE_END_OBJECT_ACTION()

    DECLARE_OBJECT_ACTION("ParticleRed1",
                   _("Red color, parameter 1"),
                   _("Modify parameter 1 of the red color."),
                   _("Do _PARAM2__PARAM1_ to parameter 1 of red color of _PARAM0_"),
                   _("Advanced"),
                   "Extensions/particleSystemicon24.png",
                   "Extensions/particleSystemicon16.png");

        instrInfo.AddParameter("object", _("Object"), "ParticleEmitter", false);
        instrInfo.AddParameter("expression", _("Value"), "", false);
        instrInfo.AddParameter("operator", _("Modification's sign"), "", false);


        instrInfo.cppCallingInformation.SetFunctionName("SetParticleRed1").SetManipulatedType("number").SetAssociatedGetter("GetParticleRed1").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");

    DECLARE_END_OBJECT_ACTION()

    DECLARE_OBJECT_CONDITION("ParticleRed1",
                   _("Red color, parameter 1"),
                   _("Test parameter 1 of the red color"),
                   _("Parameter 1 of red color of _PARAM0_ is _PARAM2__PARAM1_"),
                   _("Advanced"),
                   "Extensions/particleSystemicon24.png",
                   "Extensions/particleSystemicon16.png");

        instrInfo.AddParameter("object", _("Object"), "ParticleEmitter", false);
        instrInfo.AddParameter("expression", _("Value to test"), "", false);
        instrInfo.AddParameter("relationalOperator", _("Sign of the test"), "", false);


        instrInfo.cppCallingInformation.SetFunctionName("GetParticleRed1").SetManipulatedType("number").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");

    DECLARE_END_OBJECT_CONDITION()

    DECLARE_OBJECT_ACTION("ParticleRed2",
                   _("Red color, parameter 2"),
                   _("Modify parameter 2 of the red color"),
                   _("Do _PARAM2__PARAM1_ to parameter 2 of red color of _PARAM0_"),
                   _("Advanced"),
                   "Extensions/particleSystemicon24.png",
                   "Extensions/particleSystemicon16.png");

        instrInfo.AddParameter("object", _("Object"), "ParticleEmitter", false);
        instrInfo.AddParameter("expression", _("Value"), "", false);
        instrInfo.AddParameter("operator", _("Modification's sign"), "", false);


        instrInfo.cppCallingInformation.SetFunctionName("SetParticleRed2").SetManipulatedType("number").SetAssociatedGetter("GetParticleRed2").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");

    DECLARE_END_OBJECT_ACTION()

    DECLARE_OBJECT_CONDITION("ParticleRed2",
                   _("Red color, parameter 2"),
                   _("Test parameter 2 of the red color"),
                   _("Parameter 2 of red color of _PARAM0_ is _PARAM2__PARAM1_"),
                   _("Advanced"),
                   "Extensions/particleSystemicon24.png",
                   "Extensions/particleSystemicon16.png");

        instrInfo.AddParameter("object", _("Object"), "ParticleEmitter", false);
        instrInfo.AddParameter("expression", _("Value to test"), "", false);
        instrInfo.AddParameter("relationalOperator", _("Sign of the test"), "", false);


        instrInfo.cppCallingInformation.SetFunctionName("GetParticleRed2").SetManipulatedType("number").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");

    DECLARE_END_OBJECT_CONDITION()

    DECLARE_OBJECT_ACTION("ParticleBlue1",
                   _("Blue color, parameter 1"),
                   _("Modify parameter 1 of blue color"),
                   _("Do _PARAM2__PARAM1_ to the parameter 1 of blue color of _PARAM0_"),
                   _("Advanced"),
                   "Extensions/particleSystemicon24.png",
                   "Extensions/particleSystemicon16.png");

        instrInfo.AddParameter("object", _("Object"), "ParticleEmitter", false);
        instrInfo.AddParameter("expression", _("Value"), "", false);
        instrInfo.AddParameter("operator", _("Modification's sign"), "", false);


        instrInfo.cppCallingInformation.SetFunctionName("SetParticleBlue1").SetManipulatedType("number").SetAssociatedGetter("GetParticleBlue1").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");

    DECLARE_END_OBJECT_ACTION()

    DECLARE_OBJECT_CONDITION("ParticleBlue1",
                   _("Blue color, parameter 1"),
                   _("Test parameter 1 of blue color"),
                   _("Parameter 1 of blue color of _PARAM0_ is _PARAM2__PARAM1_"),
                   _("Advanced"),
                   "Extensions/particleSystemicon24.png",
                   "Extensions/particleSystemicon16.png");

        instrInfo.AddParameter("object", _("Object"), "ParticleEmitter", false);
        instrInfo.AddParameter("expression", _("Value to test"), "", false);
        instrInfo.AddParameter("relationalOperator", _("Sign of the test"), "", false);


        instrInfo.cppCallingInformation.SetFunctionName("GetParticleBlue1").SetManipulatedType("number").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");

    DECLARE_END_OBJECT_CONDITION()

    DECLARE_OBJECT_ACTION("ParticleBlue2",
                   _("Blue color, parameter 2"),
                   _("Modify parameter 2 of blue color"),
                   _("Do _PARAM2__PARAM1_ to the parameter 2 of blue color of _PARAM0_"),
                   _("Advanced"),
                   "Extensions/particleSystemicon24.png",
                   "Extensions/particleSystemicon16.png");

        instrInfo.AddParameter("object", _("Object"), "ParticleEmitter", false);
        instrInfo.AddParameter("expression", _("Value"), "", false);
        instrInfo.AddParameter("operator", _("Modification's sign"), "", false);


        instrInfo.cppCallingInformation.SetFunctionName("SetParticleBlue2").SetManipulatedType("number").SetAssociatedGetter("GetParticleBlue2").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");

    DECLARE_END_OBJECT_ACTION()

    DECLARE_OBJECT_CONDITION("ParticleBlue2",
                   _("Blue color, parameter 2"),
                   _("Test parameter 2 of blue color"),
                   _("Parameter 2 of blue color of _PARAM0_ is _PARAM2__PARAM1_"),
                   _("Advanced"),
                   "Extensions/particleSystemicon24.png",
                   "Extensions/particleSystemicon16.png");

        instrInfo.AddParameter("object", _("Object"), "ParticleEmitter", false);
        instrInfo.AddParameter("expression", _("Value to test"), "", false);
        instrInfo.AddParameter("relationalOperator", _("Sign of the test"), "", false);


        instrInfo.cppCallingInformation.SetFunctionName("GetParticleBlue2").SetManipulatedType("number").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");

    DECLARE_END_OBJECT_CONDITION()

    DECLARE_OBJECT_ACTION("ParticleGreen1",
                   _("Green color, parameter 1"),
                   _("Modify parameter 1 of green color"),
                   _("Do _PARAM2__PARAM1_ to the parameter 1 of green color of _PARAM0_"),
                   _("Advanced"),
                   "Extensions/particleSystemicon24.png",
                   "Extensions/particleSystemicon16.png");

        instrInfo.AddParameter("object", _("Object"), "ParticleEmitter", false);
        instrInfo.AddParameter("expression", _("Value"), "", false);
        instrInfo.AddParameter("operator", _("Modification's sign"), "", false);


        instrInfo.cppCallingInformation.SetFunctionName("SetParticleGreen1").SetManipulatedType("number").SetAssociatedGetter("GetParticleGreen1").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");

    DECLARE_END_OBJECT_ACTION()

    DECLARE_OBJECT_CONDITION("ParticleGreen1",
                   _("Green color, parameter 1"),
                   _("Test parameter 1 of green color"),
                   _("Parameter 1 of green color of _PARAM0_ is _PARAM2__PARAM1_"),
                   _("Advanced"),
                   "Extensions/particleSystemicon24.png",
                   "Extensions/particleSystemicon16.png");

        instrInfo.AddParameter("object", _("Object"), "ParticleEmitter", false);
        instrInfo.AddParameter("expression", _("Value to test"), "", false);
        instrInfo.AddParameter("relationalOperator", _("Sign of the test"), "", false);


        instrInfo.cppCallingInformation.SetFunctionName("GetParticleGreen1").SetManipulatedType("number").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");


    DECLARE_END_OBJECT_CONDITION()

    DECLARE_OBJECT_ACTION("ParticleGreen2",
                   _("Green color, parameter 2"),
                   _("Modify the parameter 2 of the green color"),
                   _("Do _PARAM2__PARAM1_ to the parameter 2 of green color of _PARAM0_"),
                   _("Advanced"),
                   "Extensions/particleSystemicon24.png",
                   "Extensions/particleSystemicon16.png");

        instrInfo.AddParameter("object", _("Object"), "ParticleEmitter", false);
        instrInfo.AddParameter("expression", _("Value"), "", false);
        instrInfo.AddParameter("operator", _("Modification's sign"), "", false);


        instrInfo.cppCallingInformation.SetFunctionName("SetParticleGreen2").SetManipulatedType("number").SetAssociatedGetter("GetParticleGreen2").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");

    DECLARE_END_OBJECT_ACTION()

    DECLARE_OBJECT_CONDITION("ParticleGreen2",
                   _("Green color, parameter 2"),
                   _("Test the parameter 2 of the green color"),
                   _("Parameter 2 of green color of _PARAM0_ is _PARAM2__PARAM1_"),
                   _("Advanced"),
                   "Extensions/particleSystemicon24.png",
                   "Extensions/particleSystemicon16.png");

        instrInfo.AddParameter("object", _("Object"), "ParticleEmitter", false);
        instrInfo.AddParameter("expression", _("Value to test"), "", false);
        instrInfo.AddParameter("relationalOperator", _("Sign of the test"), "", false);


        instrInfo.cppCallingInformation.SetFunctionName("GetParticleGreen2").SetManipulatedType("number").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");


    DECLARE_END_OBJECT_CONDITION()

    DECLARE_OBJECT_ACTION("ParticleSize1",
                   _("SIze, parameter 1"),
                   _("Modifyt parameter 1 of the size of particles"),
                   _("Do _PARAM2__PARAM1_ to the parameter 1 of size of _PARAM0_"),
                   _("Common"),
                   "Extensions/particleSystemicon24.png",
                   "Extensions/particleSystemicon16.png");

        instrInfo.AddParameter("object", _("Object"), "ParticleEmitter", false);
        instrInfo.AddParameter("expression", _("Value"), "", false);
        instrInfo.AddParameter("operator", _("Modification's sign"), "", false);


        instrInfo.cppCallingInformation.SetFunctionName("SetParticleSize1").SetManipulatedType("number").SetAssociatedGetter("GetParticleSize1").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");

    DECLARE_END_OBJECT_ACTION()

    DECLARE_OBJECT_CONDITION("ParticleSize1",
                   _("SIze, parameter 1"),
                   _("Test parameter 1 of the size of particles"),
                   _("Parameter 1 of the size of _PARAM0_ is _PARAM2__PARAM1_"),
                   _("Common"),
                   "Extensions/particleSystemicon24.png",
                   "Extensions/particleSystemicon16.png");

        instrInfo.AddParameter("object", _("Object"), "ParticleEmitter", false);
        instrInfo.AddParameter("expression", _("Value to test"), "", false);
        instrInfo.AddParameter("relationalOperator", _("Sign of the test"), "", false);


        instrInfo.cppCallingInformation.SetFunctionName("GetParticleSize1").SetManipulatedType("number").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");

    DECLARE_END_OBJECT_CONDITION()

    DECLARE_OBJECT_ACTION("ParticleSize2",
                   _("Size, parameter 2"),
                   _("Modify parameter 2 of the size of particles"),
                   _("Do _PARAM2__PARAM1_ to the parameter 2 of size of _PARAM0_"),
                   _("Common"),
                   "Extensions/particleSystemicon24.png",
                   "Extensions/particleSystemicon16.png");

        instrInfo.AddParameter("object", _("Object"), "ParticleEmitter", false);
        instrInfo.AddParameter("expression", _("Value"), "", false);
        instrInfo.AddParameter("operator", _("Modification's sign"), "", false);


        instrInfo.cppCallingInformation.SetFunctionName("SetParticleSize2").SetManipulatedType("number").SetAssociatedGetter("GetParticleSize2").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");

    DECLARE_END_OBJECT_ACTION()

    DECLARE_OBJECT_CONDITION("ParticleSize2",
                   _("Size, parameter 2"),
                   _("Test parameter 2 of the size of particles"),
                   _("Parameter 2 of the size of _PARAM0_ is _PARAM2__PARAM1_"),
                   _("Common"),
                   "Extensions/particleSystemicon24.png",
                   "Extensions/particleSystemicon16.png");

        instrInfo.AddParameter("object", _("Object"), "ParticleEmitter", false);
        instrInfo.AddParameter("expression", _("Value to test"), "", false);
        instrInfo.AddParameter("relationalOperator", _("Sign of the test"), "", false);


        instrInfo.cppCallingInformation.SetFunctionName("GetParticleSize2").SetManipulatedType("number").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");

    DECLARE_END_OBJECT_CONDITION()

    DECLARE_OBJECT_ACTION("ParticleAngle1",
                   _("Angle, parameter 1"),
                   _("Modify parameter 1 of the angle of particles"),
                   _("Do _PARAM2__PARAM1_ to the parameter 1 of angle of _PARAM0_"),
                   _("Common"),
                   "Extensions/particleSystemicon24.png",
                   "Extensions/particleSystemicon16.png");

        instrInfo.AddParameter("object", _("Object"), "ParticleEmitter", false);
        instrInfo.AddParameter("expression", _("Value"), "", false);
        instrInfo.AddParameter("operator", _("Modification's sign"), "", false);


        instrInfo.cppCallingInformation.SetFunctionName("SetParticleAngle1").SetManipulatedType("number").SetAssociatedGetter("GetParticleAngle1").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");

    DECLARE_END_OBJECT_ACTION()

    DECLARE_OBJECT_CONDITION("ParticleAngle1",
                   _("Angle, parameter 1"),
                   _("Test parameter 1 of the angle of particles"),
                   _("Parameter 1 of angle of _PARAM0_ is _PARAM2__PARAM1_"),
                   _("Common"),
                   "Extensions/particleSystemicon24.png",
                   "Extensions/particleSystemicon16.png");

        instrInfo.AddParameter("object", _("Object"), "ParticleEmitter", false);
        instrInfo.AddParameter("expression", _("Value to test"), "", false);
        instrInfo.AddParameter("relationalOperator", _("Sign of the test"), "", false);


        instrInfo.cppCallingInformation.SetFunctionName("GetParticleAngle1").SetManipulatedType("number").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");

    DECLARE_END_OBJECT_CONDITION()

    DECLARE_OBJECT_ACTION("ParticleAngle2",
                   _("Angle, parameter 2"),
                   _("Modify parameter 2 of the angle of particles"),
                   _("Do _PARAM2__PARAM1_ to the parameter 2 of angle of _PARAM0_"),
                   _("Common"),
                   "Extensions/particleSystemicon24.png",
                   "Extensions/particleSystemicon16.png");

        instrInfo.AddParameter("object", _("Object"), "ParticleEmitter", false);
        instrInfo.AddParameter("expression", _("Value"), "", false);
        instrInfo.AddParameter("operator", _("Modification's sign"), "", false);


        instrInfo.cppCallingInformation.SetFunctionName("SetParticleAngle2").SetManipulatedType("number").SetAssociatedGetter("GetParticleAngle2").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");

    DECLARE_END_OBJECT_ACTION()

    DECLARE_OBJECT_CONDITION("ParticleAngle2",
                   _("Angle, parameter 2"),
                   _("Test parameter 2 of the angle of particles"),
                   _("Parameter 2 of angle of _PARAM0_ is _PARAM2__PARAM1_"),
                   _("Common"),
                   "Extensions/particleSystemicon24.png",
                   "Extensions/particleSystemicon16.png");

        instrInfo.AddParameter("object", _("Object"), "ParticleEmitter", false);
        instrInfo.AddParameter("expression", _("Value to test"), "", false);
        instrInfo.AddParameter("relationalOperator", _("Sign of the test"), "", false);


        instrInfo.cppCallingInformation.SetFunctionName("GetParticleAngle2").SetManipulatedType("number").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");

    DECLARE_END_OBJECT_CONDITION()

    DECLARE_OBJECT_ACTION("ParticleAlpha1",
                   _("Transparency, parameter 1"),
                   _("Modify parameter 1 of the transparency of particles"),
                   _("Do _PARAM2__PARAM1_ to parameter 1 of the transparency of _PARAM0_"),
                   _("Common"),
                   "Extensions/particleSystemicon24.png",
                   "Extensions/particleSystemicon16.png");

        instrInfo.AddParameter("object", _("Object"), "ParticleEmitter", false);
        instrInfo.AddParameter("expression", _("Value"), "", false);
        instrInfo.AddParameter("operator", _("Modification's sign"), "", false);


        instrInfo.cppCallingInformation.SetFunctionName("SetParticleAlpha1").SetManipulatedType("number").SetAssociatedGetter("GetParticleAlpha1").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");

    DECLARE_END_OBJECT_ACTION()

    DECLARE_OBJECT_CONDITION("ParticleAlpha1",
                   _("Transparency, parameter 1"),
                   _("Test parameter 1 of the transparency of particles"),
                   _("Parameter 1 of the transparency of _PARAM0_ is _PARAM2__PARAM1_"),
                   _("Common"),
                   "Extensions/particleSystemicon24.png",
                   "Extensions/particleSystemicon16.png");

        instrInfo.AddParameter("object", _("Object"), "ParticleEmitter", false);
        instrInfo.AddParameter("expression", _("Value to test"), "", false);
        instrInfo.AddParameter("relationalOperator", _("Sign of the test"), "", false);


        instrInfo.cppCallingInformation.SetFunctionName("GetParticleAlpha1").SetManipulatedType("number").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");

    DECLARE_END_OBJECT_CONDITION()

    DECLARE_OBJECT_ACTION("ParticleAlpha2",
                   _("Transparency, parameter 2"),
                   _("Modify parameter 2 of the transparency of particles"),
                   _("Do _PARAM2__PARAM1_ to parameter 2 of the transparency of _PARAM0_"),
                   _("Common"),
                   "Extensions/particleSystemicon24.png",
                   "Extensions/particleSystemicon16.png");

        instrInfo.AddParameter("object", _("Object"), "ParticleEmitter", false);
        instrInfo.AddParameter("expression", _("Value"), "", false);
        instrInfo.AddParameter("operator", _("Modification's sign"), "", false);


        instrInfo.cppCallingInformation.SetFunctionName("SetParticleAlpha2").SetManipulatedType("number").SetAssociatedGetter("GetParticleAlpha2").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");


    DECLARE_END_OBJECT_ACTION()

    DECLARE_OBJECT_CONDITION("ParticleAlpha2",
                   _("Transparency, parameter 2"),
                   _("Test parameter 2 of the transparency of particles"),
                   _("Parameter 2 of the transparency of _PARAM0_ is _PARAM2__PARAM1_"),
                   _("Common"),
                   "Extensions/particleSystemicon24.png",
                   "Extensions/particleSystemicon16.png");

        instrInfo.AddParameter("object", _("Object"), "ParticleEmitter", false);
        instrInfo.AddParameter("expression", _("Value to test"), "", false);
        instrInfo.AddParameter("relationalOperator", _("Sign of the test"), "", false);


        instrInfo.cppCallingInformation.SetFunctionName("GetParticleAlpha2").SetManipulatedType("number").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");


    DECLARE_END_OBJECT_CONDITION()

    DECLARE_OBJECT_CONDITION("NoMoreParticles",
                   _("No more particles"),
                   _("Return true if the object does not emit particles anylonger, so as to destroy it for example."),
                   _("_PARAM0_ does not emit anylonger."),
                   _("Common"),
                   "Extensions/particleSystemicon24.png",
                   "Extensions/particleSystemicon16.png");

        instrInfo.AddParameter("object", _("Object"), "ParticleEmitter", false);


        instrInfo.cppCallingInformation.SetFunctionName("NoMoreParticles").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");


    DECLARE_END_OBJECT_CONDITION()
    #endif
}


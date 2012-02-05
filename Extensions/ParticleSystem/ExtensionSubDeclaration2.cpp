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
                   _("Couleur initiale"),
                   _("Modifie la couleur initiale des particules."),
                   _("Mettre la couleur initiale des particules de _PARAM0_ à _PARAM1_"),
                   _("Commun"),
                   "Extensions/particleSystemicon24.png",
                   "Extensions/particleSystemicon16.png");

        instrInfo.AddParameter("object", _("Objet"), "ParticleEmitter", false);
        instrInfo.AddParameter("color", _("Couleur initiale"), "", false);


        instrInfo.cppCallingInformation.SetFunctionName("SetParticleColor1").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");

    DECLARE_END_OBJECT_ACTION()

    DECLARE_OBJECT_ACTION("ParticleColor2",
                   _("Couleur finale"),
                   _("Modifie la couleur finale des particules."),
                   _("Mettre la couleur finale des particules de _PARAM0_ à _PARAM1_"),
                   _("Commun"),
                   "Extensions/particleSystemicon24.png",
                   "Extensions/particleSystemicon16.png");

        instrInfo.AddParameter("object", _("Objet"), "ParticleEmitter", false);
        instrInfo.AddParameter("color", _("Couleur finale"), "", false);


        instrInfo.cppCallingInformation.SetFunctionName("SetParticleColor2").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");

    DECLARE_END_OBJECT_ACTION()

    DECLARE_OBJECT_ACTION("ParticleRed1",
                   _("Couleur rouge, paramètre 1"),
                   _("Modifie le paramètre 1 de la couleur rouge."),
                   _("Faire _PARAM2__PARAM1_ au paramètre 1 de la couleur rouge de _PARAM0_"),
                   _("Avancé"),
                   "Extensions/particleSystemicon24.png",
                   "Extensions/particleSystemicon16.png");

        instrInfo.AddParameter("object", _("Objet"), "ParticleEmitter", false);
        instrInfo.AddParameter("expression", _("Valeur"), "", false);
        instrInfo.AddParameter("operator", _("Signe de la modification"), "", false);


        instrInfo.cppCallingInformation.SetFunctionName("SetParticleRed1").SetManipulatedType("number").SetAssociatedGetter("GetParticleRed1").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");

    DECLARE_END_OBJECT_ACTION()

    DECLARE_OBJECT_CONDITION("ParticleRed1",
                   _("Couleur rouge, paramètre 1"),
                   _("Teste le paramètre 1 de la couleur rouge"),
                   _("Le paramètre 1 de la couleur rouge de _PARAM0_ est _PARAM2_ à _PARAM1_"),
                   _("Avancé"),
                   "Extensions/particleSystemicon24.png",
                   "Extensions/particleSystemicon16.png");

        instrInfo.AddParameter("object", _("Objet"), "ParticleEmitter", false);
        instrInfo.AddParameter("expression", _("Valeur à tester"), "", false);
        instrInfo.AddParameter("relationalOperator", _("Signe du test"), "", false);


        instrInfo.cppCallingInformation.SetFunctionName("GetParticleRed1").SetManipulatedType("number").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");

    DECLARE_END_OBJECT_CONDITION()

    DECLARE_OBJECT_ACTION("ParticleRed2",
                   _("Couleur rouge, paramètre 2"),
                   _("Modifie le paramètre 2 de la couleur rouge."),
                   _("Faire _PARAM2__PARAM1_ au paramètre 2 de la couleur rouge de _PARAM0_"),
                   _("Avancé"),
                   "Extensions/particleSystemicon24.png",
                   "Extensions/particleSystemicon16.png");

        instrInfo.AddParameter("object", _("Objet"), "ParticleEmitter", false);
        instrInfo.AddParameter("expression", _("Valeur"), "", false);
        instrInfo.AddParameter("operator", _("Signe de la modification"), "", false);


        instrInfo.cppCallingInformation.SetFunctionName("SetParticleRed2").SetManipulatedType("number").SetAssociatedGetter("GetParticleRed2").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");

    DECLARE_END_OBJECT_ACTION()

    DECLARE_OBJECT_CONDITION("ParticleRed2",
                   _("Couleur rouge, paramètre 2"),
                   _("Teste le paramètre 2 de la couleur rouge"),
                   _("Le paramètre 2 de la couleur rouge de _PARAM0_ est _PARAM2_ à _PARAM1_"),
                   _("Avancé"),
                   "Extensions/particleSystemicon24.png",
                   "Extensions/particleSystemicon16.png");

        instrInfo.AddParameter("object", _("Objet"), "ParticleEmitter", false);
        instrInfo.AddParameter("expression", _("Valeur à tester"), "", false);
        instrInfo.AddParameter("relationalOperator", _("Signe du test"), "", false);


        instrInfo.cppCallingInformation.SetFunctionName("GetParticleRed2").SetManipulatedType("number").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");

    DECLARE_END_OBJECT_CONDITION()

    DECLARE_OBJECT_ACTION("ParticleBlue1",
                   _("Couleur bleu, paramètre 1"),
                   _("Modifie le paramètre 1 de la couleur bleu."),
                   _("Faire _PARAM2__PARAM1_ au paramètre 1 de la couleur bleu de _PARAM0_"),
                   _("Avancé"),
                   "Extensions/particleSystemicon24.png",
                   "Extensions/particleSystemicon16.png");

        instrInfo.AddParameter("object", _("Objet"), "ParticleEmitter", false);
        instrInfo.AddParameter("expression", _("Valeur"), "", false);
        instrInfo.AddParameter("operator", _("Signe de la modification"), "", false);


        instrInfo.cppCallingInformation.SetFunctionName("SetParticleBlue1").SetManipulatedType("number").SetAssociatedGetter("GetParticleBlue1").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");

    DECLARE_END_OBJECT_ACTION()

    DECLARE_OBJECT_CONDITION("ParticleBlue1",
                   _("Couleur bleu, paramètre 1"),
                   _("Teste le paramètre 1 de la couleur bleu"),
                   _("Le paramètre 1 de la couleur bleu de _PARAM0_ est _PARAM2_ à _PARAM1_"),
                   _("Avancé"),
                   "Extensions/particleSystemicon24.png",
                   "Extensions/particleSystemicon16.png");

        instrInfo.AddParameter("object", _("Objet"), "ParticleEmitter", false);
        instrInfo.AddParameter("expression", _("Valeur à tester"), "", false);
        instrInfo.AddParameter("relationalOperator", _("Signe du test"), "", false);


        instrInfo.cppCallingInformation.SetFunctionName("GetParticleBlue1").SetManipulatedType("number").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");

    DECLARE_END_OBJECT_CONDITION()

    DECLARE_OBJECT_ACTION("ParticleBlue2",
                   _("Couleur bleu, paramètre 2"),
                   _("Modifie le paramètre 2 de la couleur bleu."),
                   _("Faire _PARAM2__PARAM1_ au paramètre 2 de la couleur bleu de _PARAM0_"),
                   _("Avancé"),
                   "Extensions/particleSystemicon24.png",
                   "Extensions/particleSystemicon16.png");

        instrInfo.AddParameter("object", _("Objet"), "ParticleEmitter", false);
        instrInfo.AddParameter("expression", _("Valeur"), "", false);
        instrInfo.AddParameter("operator", _("Signe de la modification"), "", false);


        instrInfo.cppCallingInformation.SetFunctionName("SetParticleBlue2").SetManipulatedType("number").SetAssociatedGetter("GetParticleBlue2").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");

    DECLARE_END_OBJECT_ACTION()

    DECLARE_OBJECT_CONDITION("ParticleBlue2",
                   _("Couleur bleu, paramètre 2"),
                   _("Teste le paramètre 2 de la couleur bleu"),
                   _("Le paramètre 2 de la couleur bleu de _PARAM0_ est _PARAM2_ à _PARAM1_"),
                   _("Avancé"),
                   "Extensions/particleSystemicon24.png",
                   "Extensions/particleSystemicon16.png");

        instrInfo.AddParameter("object", _("Objet"), "ParticleEmitter", false);
        instrInfo.AddParameter("expression", _("Valeur à tester"), "", false);
        instrInfo.AddParameter("relationalOperator", _("Signe du test"), "", false);


        instrInfo.cppCallingInformation.SetFunctionName("GetParticleBlue2").SetManipulatedType("number").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");

    DECLARE_END_OBJECT_CONDITION()

    DECLARE_OBJECT_ACTION("ParticleGreen1",
                   _("Couleur vert, paramètre 1"),
                   _("Modifie le paramètre 1 de la couleur vert."),
                   _("Faire _PARAM2__PARAM1_ au paramètre 1 de la couleur vert de _PARAM0_"),
                   _("Avancé"),
                   "Extensions/particleSystemicon24.png",
                   "Extensions/particleSystemicon16.png");

        instrInfo.AddParameter("object", _("Objet"), "ParticleEmitter", false);
        instrInfo.AddParameter("expression", _("Valeur"), "", false);
        instrInfo.AddParameter("operator", _("Signe de la modification"), "", false);


        instrInfo.cppCallingInformation.SetFunctionName("SetParticleGreen1").SetManipulatedType("number").SetAssociatedGetter("GetParticleGreen1").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");

    DECLARE_END_OBJECT_ACTION()

    DECLARE_OBJECT_CONDITION("ParticleGreen1",
                   _("Couleur vert, paramètre 1"),
                   _("Teste le paramètre 1 de la couleur vert"),
                   _("Le paramètre 1 de la couleur vert de _PARAM0_ est _PARAM2_ à _PARAM1_"),
                   _("Avancé"),
                   "Extensions/particleSystemicon24.png",
                   "Extensions/particleSystemicon16.png");

        instrInfo.AddParameter("object", _("Objet"), "ParticleEmitter", false);
        instrInfo.AddParameter("expression", _("Valeur à tester"), "", false);
        instrInfo.AddParameter("relationalOperator", _("Signe du test"), "", false);


        instrInfo.cppCallingInformation.SetFunctionName("GetParticleGreen1").SetManipulatedType("number").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");


    DECLARE_END_OBJECT_CONDITION()

    DECLARE_OBJECT_ACTION("ParticleGreen2",
                   _("Couleur vert, paramètre 2"),
                   _("Modifie le paramètre 2 de la couleur vert."),
                   _("Faire _PARAM2__PARAM1_ au paramètre 2 de la couleur vert de _PARAM0_"),
                   _("Avancé"),
                   "Extensions/particleSystemicon24.png",
                   "Extensions/particleSystemicon16.png");

        instrInfo.AddParameter("object", _("Objet"), "ParticleEmitter", false);
        instrInfo.AddParameter("expression", _("Valeur"), "", false);
        instrInfo.AddParameter("operator", _("Signe de la modification"), "", false);


        instrInfo.cppCallingInformation.SetFunctionName("SetParticleGreen2").SetManipulatedType("number").SetAssociatedGetter("GetParticleGreen2").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");

    DECLARE_END_OBJECT_ACTION()

    DECLARE_OBJECT_CONDITION("ParticleGreen2",
                   _("Couleur vert, paramètre 2"),
                   _("Teste le paramètre 2 de la couleur vert"),
                   _("Le paramètre 2 de la couleur vert de _PARAM0_ est _PARAM2_ à _PARAM1_"),
                   _("Avancé"),
                   "Extensions/particleSystemicon24.png",
                   "Extensions/particleSystemicon16.png");

        instrInfo.AddParameter("object", _("Objet"), "ParticleEmitter", false);
        instrInfo.AddParameter("expression", _("Valeur à tester"), "", false);
        instrInfo.AddParameter("relationalOperator", _("Signe du test"), "", false);


        instrInfo.cppCallingInformation.SetFunctionName("GetParticleGreen2").SetManipulatedType("number").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");


    DECLARE_END_OBJECT_CONDITION()

    DECLARE_OBJECT_ACTION("ParticleSize1",
                   _("Taille, paramètre 1"),
                   _("Modifie le paramètre 1 de la taille des particules."),
                   _("Faire _PARAM2__PARAM1_ au paramètre 1 de la taille des particules de _PARAM0_"),
                   _("Commun"),
                   "Extensions/particleSystemicon24.png",
                   "Extensions/particleSystemicon16.png");

        instrInfo.AddParameter("object", _("Objet"), "ParticleEmitter", false);
        instrInfo.AddParameter("expression", _("Valeur"), "", false);
        instrInfo.AddParameter("operator", _("Signe de la modification"), "", false);


        instrInfo.cppCallingInformation.SetFunctionName("SetParticleSize1").SetManipulatedType("number").SetAssociatedGetter("GetParticleSize1").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");

    DECLARE_END_OBJECT_ACTION()

    DECLARE_OBJECT_CONDITION("ParticleSize1",
                   _("Taille, paramètre 1"),
                   _("Teste le paramètre 1 de la taille des particules"),
                   _("Le paramètre 1 de la taille des particules de _PARAM0_ est _PARAM2_ à _PARAM1_"),
                   _("Commun"),
                   "Extensions/particleSystemicon24.png",
                   "Extensions/particleSystemicon16.png");

        instrInfo.AddParameter("object", _("Objet"), "ParticleEmitter", false);
        instrInfo.AddParameter("expression", _("Valeur à tester"), "", false);
        instrInfo.AddParameter("relationalOperator", _("Signe du test"), "", false);


        instrInfo.cppCallingInformation.SetFunctionName("GetParticleSize1").SetManipulatedType("number").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");

    DECLARE_END_OBJECT_CONDITION()

    DECLARE_OBJECT_ACTION("ParticleSize2",
                   _("Taille, paramètre 2"),
                   _("Modifie le paramètre 2 de la taille des particules."),
                   _("Faire _PARAM2__PARAM1_ au paramètre 2 de la taille des particules de _PARAM0_"),
                   _("Commun"),
                   "Extensions/particleSystemicon24.png",
                   "Extensions/particleSystemicon16.png");

        instrInfo.AddParameter("object", _("Objet"), "ParticleEmitter", false);
        instrInfo.AddParameter("expression", _("Valeur"), "", false);
        instrInfo.AddParameter("operator", _("Signe de la modification"), "", false);


        instrInfo.cppCallingInformation.SetFunctionName("SetParticleSize2").SetManipulatedType("number").SetAssociatedGetter("GetParticleSize2").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");

    DECLARE_END_OBJECT_ACTION()

    DECLARE_OBJECT_CONDITION("ParticleSize2",
                   _("Taille, paramètre 2"),
                   _("Teste le paramètre 2 de la taille des particules"),
                   _("Le paramètre 2 de la taille des particules de _PARAM0_ est _PARAM2_ à _PARAM1_"),
                   _("Commun"),
                   "Extensions/particleSystemicon24.png",
                   "Extensions/particleSystemicon16.png");

        instrInfo.AddParameter("object", _("Objet"), "ParticleEmitter", false);
        instrInfo.AddParameter("expression", _("Valeur à tester"), "", false);
        instrInfo.AddParameter("relationalOperator", _("Signe du test"), "", false);


        instrInfo.cppCallingInformation.SetFunctionName("GetParticleSize2").SetManipulatedType("number").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");

    DECLARE_END_OBJECT_CONDITION()

    DECLARE_OBJECT_ACTION("ParticleAngle1",
                   _("Angle, paramètre 1"),
                   _("Modifie le paramètre 1 de l'angle des particules."),
                   _("Faire _PARAM2__PARAM1_ au paramètre 1 de l'angle des particules de _PARAM0_"),
                   _("Commun"),
                   "Extensions/particleSystemicon24.png",
                   "Extensions/particleSystemicon16.png");

        instrInfo.AddParameter("object", _("Objet"), "ParticleEmitter", false);
        instrInfo.AddParameter("expression", _("Valeur"), "", false);
        instrInfo.AddParameter("operator", _("Signe de la modification"), "", false);


        instrInfo.cppCallingInformation.SetFunctionName("SetParticleAngle1").SetManipulatedType("number").SetAssociatedGetter("GetParticleAngle1").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");

    DECLARE_END_OBJECT_ACTION()

    DECLARE_OBJECT_CONDITION("ParticleAngle1",
                   _("Angle, paramètre 1"),
                   _("Teste le paramètre 1 de l'angle des particules"),
                   _("Le paramètre 1 de l'angle des particules de _PARAM0_ est _PARAM2_ à _PARAM1_"),
                   _("Commun"),
                   "Extensions/particleSystemicon24.png",
                   "Extensions/particleSystemicon16.png");

        instrInfo.AddParameter("object", _("Objet"), "ParticleEmitter", false);
        instrInfo.AddParameter("expression", _("Valeur à tester"), "", false);
        instrInfo.AddParameter("relationalOperator", _("Signe du test"), "", false);


        instrInfo.cppCallingInformation.SetFunctionName("GetParticleAngle1").SetManipulatedType("number").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");

    DECLARE_END_OBJECT_CONDITION()

    DECLARE_OBJECT_ACTION("ParticleAngle2",
                   _("Angle, paramètre 2"),
                   _("Modifie le paramètre 2 de l'angle des particules."),
                   _("Faire _PARAM2__PARAM1_ au paramètre 2 de l'angle des particules de _PARAM0_"),
                   _("Commun"),
                   "Extensions/particleSystemicon24.png",
                   "Extensions/particleSystemicon16.png");

        instrInfo.AddParameter("object", _("Objet"), "ParticleEmitter", false);
        instrInfo.AddParameter("expression", _("Valeur"), "", false);
        instrInfo.AddParameter("operator", _("Signe de la modification"), "", false);


        instrInfo.cppCallingInformation.SetFunctionName("SetParticleAngle2").SetManipulatedType("number").SetAssociatedGetter("GetParticleAngle2").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");

    DECLARE_END_OBJECT_ACTION()

    DECLARE_OBJECT_CONDITION("ParticleAngle2",
                   _("Angle, paramètre 2"),
                   _("Teste le paramètre 2 de l'angle des particules"),
                   _("Le paramètre 2 de l'angle des particules de _PARAM0_ est _PARAM2_ à _PARAM1_"),
                   _("Commun"),
                   "Extensions/particleSystemicon24.png",
                   "Extensions/particleSystemicon16.png");

        instrInfo.AddParameter("object", _("Objet"), "ParticleEmitter", false);
        instrInfo.AddParameter("expression", _("Valeur à tester"), "", false);
        instrInfo.AddParameter("relationalOperator", _("Signe du test"), "", false);


        instrInfo.cppCallingInformation.SetFunctionName("GetParticleAngle2").SetManipulatedType("number").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");

    DECLARE_END_OBJECT_CONDITION()

    DECLARE_OBJECT_ACTION("ParticleAlpha1",
                   _("Transparence, paramètre 1"),
                   _("Modifie le paramètre 1 de la transparence des particules."),
                   _("Faire _PARAM2__PARAM1_ au paramètre 1 de la transparence des particules de _PARAM0_"),
                   _("Commun"),
                   "Extensions/particleSystemicon24.png",
                   "Extensions/particleSystemicon16.png");

        instrInfo.AddParameter("object", _("Objet"), "ParticleEmitter", false);
        instrInfo.AddParameter("expression", _("Valeur"), "", false);
        instrInfo.AddParameter("operator", _("Signe de la modification"), "", false);


        instrInfo.cppCallingInformation.SetFunctionName("SetParticleAlpha1").SetManipulatedType("number").SetAssociatedGetter("GetParticleAlpha1").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");

    DECLARE_END_OBJECT_ACTION()

    DECLARE_OBJECT_CONDITION("ParticleAlpha1",
                   _("Transparence, paramètre 1"),
                   _("Teste le paramètre 1 de la transparence des particules"),
                   _("Le paramètre 1 de la transparence des particules de _PARAM0_ est _PARAM2_ à _PARAM1_"),
                   _("Commun"),
                   "Extensions/particleSystemicon24.png",
                   "Extensions/particleSystemicon16.png");

        instrInfo.AddParameter("object", _("Objet"), "ParticleEmitter", false);
        instrInfo.AddParameter("expression", _("Valeur à tester"), "", false);
        instrInfo.AddParameter("relationalOperator", _("Signe du test"), "", false);


        instrInfo.cppCallingInformation.SetFunctionName("GetParticleAlpha1").SetManipulatedType("number").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");

    DECLARE_END_OBJECT_CONDITION()

    DECLARE_OBJECT_ACTION("ParticleAlpha2",
                   _("Transparence, paramètre 2"),
                   _("Modifie le paramètre 2 de la transparence des particules."),
                   _("Faire _PARAM2__PARAM1_ au paramètre 2 de la transparence des particules de _PARAM0_"),
                   _("Commun"),
                   "Extensions/particleSystemicon24.png",
                   "Extensions/particleSystemicon16.png");

        instrInfo.AddParameter("object", _("Objet"), "ParticleEmitter", false);
        instrInfo.AddParameter("expression", _("Valeur"), "", false);
        instrInfo.AddParameter("operator", _("Signe de la modification"), "", false);


        instrInfo.cppCallingInformation.SetFunctionName("SetParticleAlpha2").SetManipulatedType("number").SetAssociatedGetter("GetParticleAlpha2").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");


    DECLARE_END_OBJECT_ACTION()

    DECLARE_OBJECT_CONDITION("ParticleAlpha2",
                   _("Transparence, paramètre 2"),
                   _("Teste le paramètre 2 de la transparence des particules"),
                   _("Le paramètre 2 de la transparence des particules de _PARAM0_ est _PARAM2_ à _PARAM1_"),
                   _("Commun"),
                   "Extensions/particleSystemicon24.png",
                   "Extensions/particleSystemicon16.png");

        instrInfo.AddParameter("object", _("Objet"), "ParticleEmitter", false);
        instrInfo.AddParameter("expression", _("Valeur à tester"), "", false);
        instrInfo.AddParameter("relationalOperator", _("Signe du test"), "", false);


        instrInfo.cppCallingInformation.SetFunctionName("GetParticleAlpha2").SetManipulatedType("number").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");


    DECLARE_END_OBJECT_CONDITION()

    DECLARE_OBJECT_CONDITION("NoMoreParticles",
                   _("Plus aucune particules"),
                   _("Renvoi vrai si l'objet n'émet plus aucune particule, pour pouvoir par exemple le détruire ensuite."),
                   _("_PARAM0_ n'émet plus de particules"),
                   _("Commun"),
                   "Extensions/particleSystemicon24.png",
                   "Extensions/particleSystemicon16.png");

        instrInfo.AddParameter("object", _("Objet"), "ParticleEmitter", false);


        instrInfo.cppCallingInformation.SetFunctionName("NoMoreParticles").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");


    DECLARE_END_OBJECT_CONDITION()
    #endif
}

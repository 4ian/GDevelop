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
#include "ParticleEmitterObject.h"

/**
 * Declare some actions and conditions of the particle emitter
 */
void Extension::ExtensionSubDeclaration1(ExtensionObjectInfos & objInfos)
{
    #if defined(GD_IDE_ONLY)
    DECLARE_OBJECT_ACTION("EmitterForceMin",
                   _("Force minimale de l'émission"),
                   _("Modifie la force minimale d'émission des particules."),
                   _("Faire _PARAM2__PARAM1_ à la force minimale d'émission des particules de _PARAM0_"),
                   _("Commun"),
                   "Extensions/particleSystemicon24.png",
                   "Extensions/particleSystemicon16.png");

        instrInfo.AddParameter("object", _("Objet"), "ParticleEmitter", false);
        instrInfo.AddParameter("expression", _("Valeur"), "", false);
        instrInfo.AddParameter("operator", _("Signe de la modification"), "", false);


        instrInfo.cppCallingInformation.SetFunctionName("SetEmitterForceMin").SetManipulatedType("number").SetAssociatedGetter("GetEmitterForceMin").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");

    DECLARE_END_OBJECT_ACTION()

    DECLARE_OBJECT_ACTION("EmitterForceMax",
                   _("Force maximale de l'émission"),
                   _("Modifie la force maximale d'émission des particules."),
                   _("Faire _PARAM2__PARAM1_ à la force maximale d'émission des particules de _PARAM0_"),
                   _("Commun"),
                   "Extensions/particleSystemicon24.png",
                   "Extensions/particleSystemicon16.png");

        instrInfo.AddParameter("object", _("Objet"), "ParticleEmitter", false);
        instrInfo.AddParameter("expression", _("Valeur"), "", false);
        instrInfo.AddParameter("operator", _("Signe de la modification"), "", false);


        instrInfo.cppCallingInformation.SetFunctionName("SetEmitterForceMax").SetManipulatedType("number").SetAssociatedGetter("GetEmitterForceMax").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");

    DECLARE_END_OBJECT_ACTION()

    DECLARE_OBJECT_ACTION("EmitterXDirection",
                   _("Direction d'émission en X"),
                   _("Modifie la direction d'émission des particules en X."),
                   _("Faire _PARAM2__PARAM1_ à la direction d'émission des particules en X de _PARAM0_"),
                   _("Avancé"),
                   "Extensions/particleSystemicon24.png",
                   "Extensions/particleSystemicon16.png");

        instrInfo.AddParameter("object", _("Objet"), "ParticleEmitter", false);
        instrInfo.AddParameter("expression", _("Valeur"), "", false);
        instrInfo.AddParameter("operator", _("Signe de la modification"), "", false);


        instrInfo.cppCallingInformation.SetFunctionName("SetEmitterXDirection").SetManipulatedType("number").SetAssociatedGetter("GetEmitterXDirection").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");

    DECLARE_END_OBJECT_ACTION()

    DECLARE_OBJECT_CONDITION("EmitterXDirection",
                   _("Direction d'émission en X"),
                   _("Teste la direction d'émission des particules en X."),
                   _("La direction d'émission des particules en X de _PARAM0_ est _PARAM2_ à _PARAM1_"),
                   _("Avancé"),
                   "Extensions/particleSystemicon24.png",
                   "Extensions/particleSystemicon16.png");

        instrInfo.AddParameter("object", _("Objet"), "ParticleEmitter", false);
        instrInfo.AddParameter("expression", _("Valeur à tester"), "", false);
        instrInfo.AddParameter("relationalOperator", _("Signe du test"), "", false);


        instrInfo.cppCallingInformation.SetFunctionName("GetEmitterXDirection").SetManipulatedType("number").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");


    DECLARE_END_OBJECT_CONDITION()

    DECLARE_OBJECT_ACTION("EmitterYDirection",
                   _("Direction d'émission en Y"),
                   _("Modifie la direction d'émission des particules en Y."),
                   _("Faire _PARAM2__PARAM1_ à la direction d'émission des particules en Y de _PARAM0_"),
                   _("Avancé"),
                   "Extensions/particleSystemicon24.png",
                   "Extensions/particleSystemicon16.png");

        instrInfo.AddParameter("object", _("Objet"), "ParticleEmitter", false);
        instrInfo.AddParameter("expression", _("Valeur"), "", false);
        instrInfo.AddParameter("operator", _("Signe de la modification"), "", false);


        instrInfo.cppCallingInformation.SetFunctionName("SetEmitterYDirection").SetManipulatedType("number").SetAssociatedGetter("GetEmitterYDirection").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");

    DECLARE_END_OBJECT_ACTION()

    DECLARE_OBJECT_CONDITION("EmitterYDirection",
                   _("Direction d'émission en Y"),
                   _("Teste la direction d'émission des particules en Y."),
                   _("La direction d'émission des particules en Y de _PARAM0_ est _PARAM2_ à _PARAM1_"),
                   _("Avancé"),
                   "Extensions/particleSystemicon24.png",
                   "Extensions/particleSystemicon16.png");

        instrInfo.AddParameter("object", _("Objet"), "ParticleEmitter", false);
        instrInfo.AddParameter("expression", _("Valeur à tester"), "", false);
        instrInfo.AddParameter("relationalOperator", _("Signe du test"), "", false);


        instrInfo.cppCallingInformation.SetFunctionName("GetEmitterYDirection").SetManipulatedType("number").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");


    DECLARE_END_OBJECT_CONDITION()

    DECLARE_OBJECT_ACTION("EmitterZDirection",
                   _("Direction d'émission en Z"),
                   _("Modifie la direction d'émission des particules en Z."),
                   _("Faire _PARAM2__PARAM1_ à la direction d'émission des particules en Z de _PARAM0_"),
                   _("Avancé"),
                   "Extensions/particleSystemicon24.png",
                   "Extensions/particleSystemicon16.png");

        instrInfo.AddParameter("object", _("Objet"), "ParticleEmitter", false);
        instrInfo.AddParameter("expression", _("Valeur"), "", false);
        instrInfo.AddParameter("operator", _("Signe de la modification"), "", false);


        instrInfo.cppCallingInformation.SetFunctionName("SetEmitterZDirection").SetManipulatedType("number").SetAssociatedGetter("GetEmitterZDirection").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");


    DECLARE_END_OBJECT_ACTION()

    DECLARE_OBJECT_CONDITION("EmitterZDirection",
                   _("Direction d'émission en Z"),
                   _("Teste la direction d'émission des particules en Z."),
                   _("La direction d'émission des particules en Z de _PARAM0_ est _PARAM2_ à _PARAM1_"),
                   _("Avancé"),
                   "Extensions/particleSystemicon24.png",
                   "Extensions/particleSystemicon16.png");

        instrInfo.AddParameter("object", _("Objet"), "ParticleEmitter", false);
        instrInfo.AddParameter("expression", _("Valeur à tester"), "", false);
        instrInfo.AddParameter("relationalOperator", _("Signe du test"), "", false);


        instrInfo.cppCallingInformation.SetFunctionName("GetEmitterZDirection").SetManipulatedType("number").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");


    DECLARE_END_OBJECT_CONDITION()

    DECLARE_OBJECT_ACTION("EmitterAngle",
                   _("Angle d'émission"),
                   _("Modifie l'angle d'émission."),
                   _("Faire _PARAM2__PARAM1_ à l'angle d'émission de _PARAM0_"),
                   _("Commun"),
                   "Extensions/particleSystemicon24.png",
                   "Extensions/particleSystemicon16.png");

        instrInfo.AddParameter("object", _("Objet"), "ParticleEmitter", false);
        instrInfo.AddParameter("expression", _("Valeur"), "", false);
        instrInfo.AddParameter("operator", _("Signe de la modification"), "", false);


        instrInfo.cppCallingInformation.SetFunctionName("SetAngle").SetManipulatedType("number").SetAssociatedGetter("GetAngle").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");


    DECLARE_END_OBJECT_ACTION()

    DECLARE_OBJECT_CONDITION("EmitterAngle",
                   _("Angle d'émission"),
                   _("Teste la valeur de l'angle d'émission de l'émetteur."),
                   _("L'angle d'émission de _PARAM0_ est _PARAM2_ à _PARAM1_"),
                   _("Commun"),
                   "Extensions/particleSystemicon24.png",
                   "Extensions/particleSystemicon16.png");

        instrInfo.AddParameter("object", _("Objet"), "ParticleEmitter", false);
        instrInfo.AddParameter("expression", _("Valeur à tester"), "", false);
        instrInfo.AddParameter("relationalOperator", _("Signe du test"), "", false);


        instrInfo.cppCallingInformation.SetFunctionName("GetAngle").SetManipulatedType("number").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");

    DECLARE_END_OBJECT_CONDITION()

    DECLARE_OBJECT_ACTION("EmitterAngleA",
                   _("Angle d'émission 1"),
                   _("Modifie l'angle d'émission n°1."),
                   _("Faire _PARAM2__PARAM1_ à l'angle d'émission n°1 de _PARAM0_"),
                   _("Avancé"),
                   "Extensions/particleSystemicon24.png",
                   "Extensions/particleSystemicon16.png");

        instrInfo.AddParameter("object", _("Objet"), "ParticleEmitter", false);
        instrInfo.AddParameter("expression", _("Valeur"), "", false);
        instrInfo.AddParameter("operator", _("Signe de la modification"), "", false);


        instrInfo.cppCallingInformation.SetFunctionName("SetEmitterAngleA").SetManipulatedType("number").SetAssociatedGetter("GetEmitterAngleA").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");


    DECLARE_END_OBJECT_ACTION()

    DECLARE_OBJECT_CONDITION("EmitterAngleA",
                   _("Angle d'émission 1"),
                   _("Teste la valeur de l'angle d'émission n°1 de l'émetteur."),
                   _("L'angle d'émission n°1 de _PARAM0_ est _PARAM2_ à _PARAM1_"),
                   _("Avancé"),
                   "Extensions/particleSystemicon24.png",
                   "Extensions/particleSystemicon16.png");

        instrInfo.AddParameter("object", _("Objet"), "ParticleEmitter", false);
        instrInfo.AddParameter("expression", _("Valeur à tester"), "", false);
        instrInfo.AddParameter("relationalOperator", _("Signe du test"), "", false);


        instrInfo.cppCallingInformation.SetFunctionName("GetEmitterAngleA").SetManipulatedType("number").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");


    DECLARE_END_OBJECT_CONDITION()

    DECLARE_OBJECT_ACTION("EmitterAngleB",
                   _("Angle d'émission 2"),
                   _("Modifie l'angle d'émission n°2."),
                   _("Faire _PARAM2__PARAM1_ à l'angle d'émission n°2 de _PARAM0_"),
                   _("Avancé"),
                   "Extensions/particleSystemicon24.png",
                   "Extensions/particleSystemicon16.png");

        instrInfo.AddParameter("object", _("Objet"), "ParticleEmitter", false);
        instrInfo.AddParameter("expression", _("Valeur"), "", false);
        instrInfo.AddParameter("operator", _("Signe de la modification"), "", false);


        instrInfo.cppCallingInformation.SetFunctionName("SetEmitterAngleB").SetManipulatedType("number").SetAssociatedGetter("GetEmitterAngleB").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");


    DECLARE_END_OBJECT_ACTION()

    DECLARE_OBJECT_CONDITION("EmitterAngleB",
                   _("Angle d'émission 2"),
                   _("Teste la valeur de l'angle d'émission n°2 de l'émetteur."),
                   _("L'angle d'émission n°2 de _PARAM0_ est _PARAM2_ à _PARAM1_"),
                   _("Avancé"),
                   "Extensions/particleSystemicon24.png",
                   "Extensions/particleSystemicon16.png");

        instrInfo.AddParameter("object", _("Objet"), "ParticleEmitter", false);
        instrInfo.AddParameter("expression", _("Valeur à tester"), "", false);
        instrInfo.AddParameter("relationalOperator", _("Signe du test"), "", false);


        instrInfo.cppCallingInformation.SetFunctionName("GetEmitterAngleB").SetManipulatedType("number").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");


    DECLARE_END_OBJECT_CONDITION()

    DECLARE_OBJECT_ACTION("ConeSprayAngle",
                   _("Angle d'ouverture du cône d'émission"),
                   _("Modifie l'angle d'ouverture du cône d'émission."),
                   _("Faire _PARAM2__PARAM1_ à l'angle d'ouverture du cône d'émission de _PARAM0_"),
                   _("Commun"),
                   "Extensions/particleSystemicon24.png",
                   "Extensions/particleSystemicon16.png");

        instrInfo.AddParameter("object", _("Objet"), "ParticleEmitter", false);
        instrInfo.AddParameter("expression", _("Valeur"), "", false);
        instrInfo.AddParameter("operator", _("Signe de la modification"), "", false);


        instrInfo.cppCallingInformation.SetFunctionName("SetConeSprayAngle").SetManipulatedType("number").SetAssociatedGetter("GetConeSprayAngle").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");

    DECLARE_END_OBJECT_ACTION()

    DECLARE_OBJECT_CONDITION("ConeSprayAngle",
                   _("Angle d'ouverture du cône d'émission"),
                   _("Teste l'angle d'ouverture du cône d'émission de l'émetteur."),
                   _("L'angle d'ouverture du cône d'émission de _PARAM0_ est _PARAM2_ à _PARAM1_"),
                   _("Commun"),
                   "Extensions/particleSystemicon24.png",
                   "Extensions/particleSystemicon16.png");

        instrInfo.AddParameter("object", _("Objet"), "ParticleEmitter", false);
        instrInfo.AddParameter("expression", _("Valeur à tester"), "", false);
        instrInfo.AddParameter("relationalOperator", _("Signe du test"), "", false);


        instrInfo.cppCallingInformation.SetFunctionName("GetConeSprayAngle").SetManipulatedType("number").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");

    DECLARE_END_OBJECT_CONDITION()

    DECLARE_OBJECT_ACTION("Friction",
                   _("Friction"),
                   _("Modifie la friction appliquée aux particules."),
                   _("Faire _PARAM2__PARAM1_ à la friction des particules _PARAM0_"),
                   _("Commun"),
                   "Extensions/particleSystemicon24.png",
                   "Extensions/particleSystemicon16.png");

        instrInfo.AddParameter("object", _("Objet"), "ParticleEmitter", false);
        instrInfo.AddParameter("expression", _("Valeur"), "", false);
        instrInfo.AddParameter("operator", _("Signe de la modification"), "", false);


        instrInfo.cppCallingInformation.SetFunctionName("SetFriction").SetManipulatedType("number").SetAssociatedGetter("GetFriction").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");


    DECLARE_END_OBJECT_ACTION()

    DECLARE_OBJECT_CONDITION("Friction",
                   _("Friction"),
                   _("Teste la friction appliquée aux particules."),
                   _("La friction des particules de _PARAM0_ est _PARAM2_ à _PARAM1_"),
                   _("Commun"),
                   "Extensions/particleSystemicon24.png",
                   "Extensions/particleSystemicon16.png");

        instrInfo.AddParameter("object", _("Objet"), "ParticleEmitter", false);
        instrInfo.AddParameter("expression", _("Valeur à tester"), "", false);
        instrInfo.AddParameter("relationalOperator", _("Signe du test"), "", false);

        instrInfo.cppCallingInformation.SetFunctionName("GetFriction").SetManipulatedType("number").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");


    DECLARE_END_OBJECT_CONDITION()

    DECLARE_OBJECT_ACTION("ZoneRadius",
                   _("Rayon d'apparition"),
                   _("Modifie le rayon d'apparition des particules.\nNécessite de recréer les particules pour prendre en compte les changements."),
                   _("Faire _PARAM2__PARAM1_ au rayon d'apparition des particules de _PARAM0_"),
                   _("Commun"),
                   "Extensions/particleSystemicon24.png",
                   "Extensions/particleSystemicon16.png");

        instrInfo.AddParameter("object", _("Objet"), "ParticleEmitter", false);
        instrInfo.AddParameter("expression", _("Valeur"), "", false);
        instrInfo.AddParameter("operator", _("Signe de la modification"), "", false);


        instrInfo.cppCallingInformation.SetFunctionName("SetZoneRadius").SetManipulatedType("number").SetAssociatedGetter("GetZoneRadius").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");


    DECLARE_END_OBJECT_ACTION()

    DECLARE_OBJECT_CONDITION("ZoneRadius",
                   _("Rayon d'apparition"),
                   _("Teste le rayon d'apparition des particules."),
                   _("Le rayon d'apparition des particules de _PARAM0_ est _PARAM2_ à _PARAM1_"),
                   _("Commun"),
                   "Extensions/particleSystemicon24.png",
                   "Extensions/particleSystemicon16.png");

        instrInfo.AddParameter("object", _("Objet"), "ParticleEmitter", false);
        instrInfo.AddParameter("expression", _("Valeur à tester"), "", false);
        instrInfo.AddParameter("relationalOperator", _("Signe du test"), "", false);


        instrInfo.cppCallingInformation.SetFunctionName("GetZoneRadius").SetManipulatedType("number").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");


    DECLARE_END_OBJECT_CONDITION()

    DECLARE_OBJECT_ACTION("ParticleLifeTimeMin",
                   _("Temps de vie minimum"),
                   _("Modifie le temps de vie minimum des particules.\nNécessite de recréer les particules pour prendre en compte les changements."),
                   _("Faire _PARAM2__PARAM1_ au temps de vie minimum des particules de _PARAM0_"),
                   _("Commun"),
                   "Extensions/particleSystemicon24.png",
                   "Extensions/particleSystemicon16.png");

        instrInfo.AddParameter("object", _("Objet"), "ParticleEmitter", false);
        instrInfo.AddParameter("expression", _("Valeur"), "", false);
        instrInfo.AddParameter("operator", _("Signe de la modification"), "", false);


        instrInfo.cppCallingInformation.SetFunctionName("SetParticleLifeTimeMin").SetManipulatedType("number").SetAssociatedGetter("GetParticleLifeTimeMin").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");

    DECLARE_END_OBJECT_ACTION()

    DECLARE_OBJECT_CONDITION("ParticleLifeTimeMin",
                   _("Temps de vie minimum"),
                   _("Teste la valeur du temps de vie minimum des particules."),
                   _("Le temps de vie minimum des particules de _PARAM0_ est _PARAM2_ à _PARAM1_"),
                   _("Commun"),
                   "Extensions/particleSystemicon24.png",
                   "Extensions/particleSystemicon16.png");

        instrInfo.AddParameter("object", _("Objet"), "ParticleEmitter", false);
        instrInfo.AddParameter("expression", _("Valeur à tester"), "", false);
        instrInfo.AddParameter("relationalOperator", _("Signe du test"), "", false);


        instrInfo.cppCallingInformation.SetFunctionName("GetParticleLifeTimeMin").SetManipulatedType("number").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");

    DECLARE_END_OBJECT_CONDITION()

    DECLARE_OBJECT_ACTION("ParticleLifeTimeMax",
                   _("Temps de vie maximum"),
                   _("Modifie le temps de vie maximum des particules.\nNécessite de recréer les particules pour prendre en compte les changements."),
                   _("Faire _PARAM2__PARAM1_ au temps de vie maximum des particules de _PARAM0_"),
                   _("Commun"),
                   "Extensions/particleSystemicon24.png",
                   "Extensions/particleSystemicon16.png");

        instrInfo.AddParameter("object", _("Objet"), "ParticleEmitter", false);
        instrInfo.AddParameter("expression", _("Valeur"), "", false);
        instrInfo.AddParameter("operator", _("Signe de la modification"), "", false);


        instrInfo.cppCallingInformation.SetFunctionName("SetParticleLifeTimeMax").SetManipulatedType("number").SetAssociatedGetter("GetParticleLifeTimeMax").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");


    DECLARE_END_OBJECT_ACTION()

    DECLARE_OBJECT_CONDITION("ParticleLifeTimeMax",
                   _("Temps de vie maximum"),
                   _("Teste la valeur du temps de vie maximum des particules."),
                   _("Le temps de vie maximum des particules de _PARAM0_ est _PARAM2_ à _PARAM1_"),
                   _("Commun"),
                   "Extensions/particleSystemicon24.png",
                   "Extensions/particleSystemicon16.png");

        instrInfo.AddParameter("object", _("Objet"), "ParticleEmitter", false);
        instrInfo.AddParameter("expression", _("Valeur à tester"), "", false);
        instrInfo.AddParameter("relationalOperator", _("Signe du test"), "", false);


        instrInfo.cppCallingInformation.SetFunctionName("GetParticleLifeTimeMax").SetManipulatedType("number").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");


    DECLARE_END_OBJECT_CONDITION()

    DECLARE_OBJECT_ACTION("ParticleGravityX",
                   _("Gravité en X"),
                   _("Modifie la direction de la gravité en X."),
                   _("Faire _PARAM2__PARAM1_ à la direction de la gravité en X de _PARAM0_"),
                   _("Avancé"),
                   "Extensions/particleSystemicon24.png",
                   "Extensions/particleSystemicon16.png");

        instrInfo.AddParameter("object", _("Objet"), "ParticleEmitter", false);
        instrInfo.AddParameter("expression", _("Valeur"), "", false);
        instrInfo.AddParameter("operator", _("Signe de la modification"), "", false);


        instrInfo.cppCallingInformation.SetFunctionName("SetParticleGravityX").SetManipulatedType("number").SetAssociatedGetter("GetParticleGravityX").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");


    DECLARE_END_OBJECT_ACTION()

    DECLARE_OBJECT_CONDITION("ParticleGravityX",
                   _("Direction de la gravité en X"),
                   _("Teste la direction de la gravité en X."),
                   _("La direction de la gravité des particules en X de _PARAM0_ est _PARAM2_ à _PARAM1_"),
                   _("Avancé"),
                   "Extensions/particleSystemicon24.png",
                   "Extensions/particleSystemicon16.png");

        instrInfo.AddParameter("object", _("Objet"), "ParticleEmitter", false);
        instrInfo.AddParameter("expression", _("Valeur à tester"), "", false);
        instrInfo.AddParameter("relationalOperator", _("Signe du test"), "", false);


        instrInfo.cppCallingInformation.SetFunctionName("GetParticleGravityX").SetManipulatedType("number").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");


    DECLARE_END_OBJECT_CONDITION()

    DECLARE_OBJECT_ACTION("ParticleGravityY",
                   _("Gravité en Y"),
                   _("Modifie la direction de la gravité en Y."),
                   _("Faire _PARAM2__PARAM1_ à la direction de la gravité en Y de _PARAM0_"),
                   _("Avancé"),
                   "Extensions/particleSystemicon24.png",
                   "Extensions/particleSystemicon16.png");

        instrInfo.AddParameter("object", _("Objet"), "ParticleEmitter", false);
        instrInfo.AddParameter("expression", _("Valeur"), "", false);
        instrInfo.AddParameter("operator", _("Signe de la modification"), "", false);


        instrInfo.cppCallingInformation.SetFunctionName("SetParticleGravityY").SetManipulatedType("number").SetAssociatedGetter("GetParticleGravityY").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");


    DECLARE_END_OBJECT_ACTION()

    DECLARE_OBJECT_CONDITION("ParticleGravityY",
                   _("Direction de la gravité en Y"),
                   _("Teste la direction de la gravité en Y."),
                   _("La direction de la gravité des particules en Y de _PARAM0_ est _PARAM2_ à _PARAM1_"),
                   _("Avancé"),
                   "Extensions/particleSystemicon24.png",
                   "Extensions/particleSystemicon16.png");

        instrInfo.AddParameter("object", _("Objet"), "ParticleEmitter", false);
        instrInfo.AddParameter("expression", _("Valeur à tester"), "", false);
        instrInfo.AddParameter("relationalOperator", _("Signe du test"), "", false);


        instrInfo.cppCallingInformation.SetFunctionName("GetParticleGravityY").SetManipulatedType("number").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");


    DECLARE_END_OBJECT_CONDITION()

    DECLARE_OBJECT_ACTION("ParticleGravityZ",
                   _("Gravité en Z"),
                   _("Modifie la direction de la gravité en Z."),
                   _("Faire _PARAM2__PARAM1_ à la direction de la gravité en Z de _PARAM0_"),
                   _("Avancé"),
                   "Extensions/particleSystemicon24.png",
                   "Extensions/particleSystemicon16.png");

        instrInfo.AddParameter("object", _("Objet"), "ParticleEmitter", false);
        instrInfo.AddParameter("expression", _("Valeur"), "", false);
        instrInfo.AddParameter("operator", _("Signe de la modification"), "", false);


        instrInfo.cppCallingInformation.SetFunctionName("SetParticleGravityZ").SetManipulatedType("number").SetAssociatedGetter("GetParticleGravityZ").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");


    DECLARE_END_OBJECT_ACTION()

    DECLARE_OBJECT_CONDITION("ParticleGravityZ",
                   _("Direction de la gravité en Z"),
                   _("Teste la direction de la gravité en Z."),
                   _("La direction de la gravité des particules en Z de _PARAM0_ est _PARAM2_ à _PARAM1_"),
                   _("Avancé"),
                   "Extensions/particleSystemicon24.png",
                   "Extensions/particleSystemicon16.png");

        instrInfo.AddParameter("object", _("Objet"), "ParticleEmitter", false);
        instrInfo.AddParameter("expression", _("Valeur à tester"), "", false);
        instrInfo.AddParameter("relationalOperator", _("Signe du test"), "", false);


        instrInfo.cppCallingInformation.SetFunctionName("GetParticleGravityZ").SetManipulatedType("number").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");

    DECLARE_END_OBJECT_CONDITION()

    DECLARE_OBJECT_ACTION("ParticleGravityAngle",
                   _("Angle de la gravité"),
                   _("Modifie l'angle de la gravité."),
                   _("Faire _PARAM2__PARAM1_ à l'angle de la gravité de _PARAM0_"),
                   _("Commun"),
                   "Extensions/particleSystemicon24.png",
                   "Extensions/particleSystemicon16.png");

        instrInfo.AddParameter("object", _("Objet"), "ParticleEmitter", false);
        instrInfo.AddParameter("expression", _("Valeur"), "", false);
        instrInfo.AddParameter("operator", _("Signe de la modification"), "", false);


        instrInfo.cppCallingInformation.SetFunctionName("SetParticleGravityAngle").SetManipulatedType("number").SetAssociatedGetter("GetParticleGravityAngle").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");

    DECLARE_END_OBJECT_ACTION()

    DECLARE_OBJECT_CONDITION("ParticleGravityAngle",
                   _("Angle de la gravité"),
                   _("Teste la valeur de l'angle de la gravité de l'émetteur."),
                   _("L'angle de la gravité de _PARAM0_ est _PARAM2_ à _PARAM1_"),
                   _("Commun"),
                   "Extensions/particleSystemicon24.png",
                   "Extensions/particleSystemicon16.png");

        instrInfo.AddParameter("object", _("Objet"), "ParticleEmitter", false);
        instrInfo.AddParameter("expression", _("Valeur à tester"), "", false);
        instrInfo.AddParameter("relationalOperator", _("Signe du test"), "", false);


        instrInfo.cppCallingInformation.SetFunctionName("GetParticleGravityAngle").SetManipulatedType("number").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");

    DECLARE_END_OBJECT_CONDITION()

    DECLARE_OBJECT_ACTION("ParticleGravityLength",
                   _("Gravité"),
                   _("Modifie la gravité de l'émetteur."),
                   _("Faire _PARAM2__PARAM1_ à la gravité de _PARAM0_"),
                   _("Commun"),
                   "Extensions/particleSystemicon24.png",
                   "Extensions/particleSystemicon16.png");

        instrInfo.AddParameter("object", _("Objet"), "ParticleEmitter", false);
        instrInfo.AddParameter("expression", _("Valeur"), "", false);
        instrInfo.AddParameter("operator", _("Signe de la modification"), "", false);


        instrInfo.cppCallingInformation.SetFunctionName("SetParticleGravityLength").SetManipulatedType("number").SetAssociatedGetter("GetParticleGravityLength").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");

    DECLARE_END_OBJECT_ACTION()

    DECLARE_OBJECT_CONDITION("ParticleGravityLength",
                   _("Gravité"),
                   _("Teste la valeur de la gravité de l'émetteur."),
                   _("La gravité de _PARAM0_ est _PARAM2_ à _PARAM1_"),
                   _("Commun"),
                   "Extensions/particleSystemicon24.png",
                   "Extensions/particleSystemicon16.png");

        instrInfo.AddParameter("object", _("Objet"), "ParticleEmitter", false);
        instrInfo.AddParameter("expression", _("Valeur à tester"), "", false);
        instrInfo.AddParameter("relationalOperator", _("Signe du test"), "", false);


        instrInfo.cppCallingInformation.SetFunctionName("GetParticleGravityLength").SetManipulatedType("number").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");

    DECLARE_END_OBJECT_CONDITION()
    #endif
}

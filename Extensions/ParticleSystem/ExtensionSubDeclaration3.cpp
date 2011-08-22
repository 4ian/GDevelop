/**

Game Develop - Particle System Extension
Copyright (c) 2010-2011 Florian Rival (Florian.Rival@gmail.com)

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
 * Declare some actions, conditions and expressions of the particle emitter
 */
void Extension::ExtensionSubDeclaration3(ExtensionObjectInfos & objInfos)
{
    #if defined(GD_IDE_ONLY)
    DECLARE_OBJECT_ACTION("RecreateParticleSystem",
                   _("Recréer les particules"),
                   _("Efface et recréé les particules, pour prendre en compte par exemple les changements au niveau du paramétrage."),
                   _("Recréer les particules de _PARAM0_"),
                   _("Paramétrage"),
                   "Extensions/particleSystemicon24.png",
                   "Extensions/particleSystemicon16.png");

        instrInfo.AddParameter("object", _("Objet"), "ParticleEmitter", false);


        instrInfo.cppCallingInformation.SetFunctionName("RecreateParticleSystem").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");

    DECLARE_END_OBJECT_ACTION()

    DECLARE_OBJECT_ACTION("RendererParam1",
                   _("Paramètre 1 du rendu"),
                   _("Modifie le premier paramètre du rendu ( Taille/Longueur ).\nNécessite de recréer les particules pour prendre en compte les changements."),
                   _("Faire _PARAM2__PARAM1_ au paramètre 1 du rendu de _PARAM0_"),
                   _("Paramétrage"),
                   "Extensions/particleSystemicon24.png",
                   "Extensions/particleSystemicon16.png");

        instrInfo.AddParameter("object", _("Objet"), "ParticleEmitter", false);
        instrInfo.AddParameter("expression", _("Valeur"), "", false);
        instrInfo.AddParameter("operator", _("Signe de la modification"), "", false);


        instrInfo.cppCallingInformation.SetFunctionName("SetRendererParam1").SetManipulatedType("number").SetAssociatedGetter("GetRendererParam1").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");

    DECLARE_END_OBJECT_ACTION()

    DECLARE_OBJECT_CONDITION("RendererParam1",
                   _("Direction de la gravité en Z"),
                   _("Teste la valeur du paramètre 1 de rendu ( Taille/Longueur )."),
                   _("Le 1er paramètre du rendu de _PARAM0_ est _PARAM2_ à _PARAM1_"),
                   _("Paramétrage"),
                   "Extensions/particleSystemicon24.png",
                   "Extensions/particleSystemicon16.png");

        instrInfo.AddParameter("object", _("Objet"), "ParticleEmitter", false);
        instrInfo.AddParameter("expression", _("Valeur à tester"), "", false);
        instrInfo.AddParameter("relationalOperator", _("Signe du test"), "", false);

        instrInfo.cppCallingInformation.SetFunctionName("GetRendererParam1").SetManipulatedType("number").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");


    DECLARE_END_OBJECT_CONDITION()

    DECLARE_OBJECT_ACTION("RendererParam2",
                   _("Paramètre 2 du rendu"),
                   _("Modifie le second paramètre du rendu ( Taille/Longueur ).\nNécessite de recréer les particules pour prendre en compte les changements."),
                   _("Faire _PARAM2__PARAM1_ au paramètre 2 du rendu de _PARAM0_"),
                   _("Paramétrage"),
                   "Extensions/particleSystemicon24.png",
                   "Extensions/particleSystemicon16.png");

        instrInfo.AddParameter("object", _("Objet"), "ParticleEmitter", false);
        instrInfo.AddParameter("expression", _("Valeur"), "", false);
        instrInfo.AddParameter("operator", _("Signe de la modification"), "", false);


        instrInfo.cppCallingInformation.SetFunctionName("SetRendererParam2").SetManipulatedType("number").SetAssociatedGetter("GetRendererParam2").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");

    DECLARE_END_OBJECT_ACTION()

    DECLARE_OBJECT_CONDITION("RendererParam2",
                   _("Paramètre 2 du rendu"),
                   _("Teste la valeur du paramètre 2 de rendu ( Taille/Longueur )."),
                   _("Le 2nd paramètre du rendu de _PARAM0_ est _PARAM2_ à _PARAM1_"),
                   _("Paramétrage"),
                   "Extensions/particleSystemicon24.png",
                   "Extensions/particleSystemicon16.png");

        instrInfo.AddParameter("object", _("Objet"), "ParticleEmitter", false);
        instrInfo.AddParameter("expression", _("Valeur à tester"), "", false);
        instrInfo.AddParameter("relationalOperator", _("Signe du test"), "", false);


        instrInfo.cppCallingInformation.SetFunctionName("GetRendererParam2").SetManipulatedType("number").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");


    DECLARE_END_OBJECT_CONDITION()

    DECLARE_OBJECT_ACTION("Tank",
                   _("Capacité"),
                   _("Modifie la capacité de l'émetteur."),
                   _("Faire _PARAM2__PARAM1_ à la capacité de _PARAM0_"),
                   _("Commun"),
                   "Extensions/particleSystemicon24.png",
                   "Extensions/particleSystemicon16.png");

        instrInfo.AddParameter("object", _("Objet"), "ParticleEmitter", false);
        instrInfo.AddParameter("expression", _("Valeur"), "", false);
        instrInfo.AddParameter("operator", _("Signe de la modification"), "", false);


        instrInfo.cppCallingInformation.SetFunctionName("SetTank").SetManipulatedType("number").SetAssociatedGetter("GetTank").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");

    DECLARE_END_OBJECT_ACTION()

    DECLARE_OBJECT_CONDITION("Tank",
                   _("Capacité"),
                   _("Teste la capacité de l'émetteur."),
                   _("La capacité de _PARAM0_ est _PARAM2_ à _PARAM1_"),
                   _("Commun"),
                   "Extensions/particleSystemicon24.png",
                   "Extensions/particleSystemicon16.png");

        instrInfo.AddParameter("object", _("Objet"), "ParticleEmitter", false);
        instrInfo.AddParameter("expression", _("Valeur à tester"), "", false);
        instrInfo.AddParameter("relationalOperator", _("Signe du test"), "", false);


        instrInfo.cppCallingInformation.SetFunctionName("GetTank").SetManipulatedType("number").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");


    DECLARE_END_OBJECT_CONDITION()

    DECLARE_OBJECT_ACTION("Flow",
                   _("Flux"),
                   _("Modifie le flux de l'émetteur."),
                   _("Faire _PARAM2__PARAM1_ au flux de _PARAM0_"),
                   _("Commun"),
                   "Extensions/particleSystemicon24.png",
                   "Extensions/particleSystemicon16.png");

        instrInfo.AddParameter("object", _("Objet"), "ParticleEmitter", false);
        instrInfo.AddParameter("expression", _("Valeur"), "", false);
        instrInfo.AddParameter("operator", _("Signe de la modification"), "", false);


        instrInfo.cppCallingInformation.SetFunctionName("SetFlow").SetManipulatedType("number").SetAssociatedGetter("GetFlow").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");


    DECLARE_END_OBJECT_ACTION()

    DECLARE_OBJECT_CONDITION("Flow",
                   _("Flux"),
                   _("Teste le flux de l'émetteur."),
                   _("Le flux de _PARAM0_ est _PARAM2_ à _PARAM1_"),
                   _("Commun"),
                   "Extensions/particleSystemicon24.png",
                   "Extensions/particleSystemicon16.png");

        instrInfo.AddParameter("object", _("Objet"), "ParticleEmitter", false);
        instrInfo.AddParameter("expression", _("Valeur à tester"), "", false);
        instrInfo.AddParameter("relationalOperator", _("Signe du test"), "", false);


        instrInfo.cppCallingInformation.SetFunctionName("GetFlow").SetManipulatedType("number").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");


    DECLARE_END_OBJECT_CONDITION()

    DECLARE_OBJECT_ACTION("Texture",
                   _("Image"),
                   _("Modifie l'image des particules ( si affichée )."),
                   _("Changer l'image des particules de _PARAM0_ en _PARAM1_"),
                   _("Commun"),
                   "Extensions/particleSystemicon24.png",
                   "Extensions/particleSystemicon16.png");

        instrInfo.AddParameter("object", _("Objet"), "ParticleEmitter", false);
        instrInfo.AddParameter("string", _("Nouvelle image"), "", false);


        instrInfo.cppCallingInformation.SetFunctionName("SetTexture").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");

    DECLARE_END_OBJECT_ACTION()

    DECLARE_OBJECT_CONDITION("Texture",
                   _("Image"),
                   _("Teste le nom de l'image affichée par les particules."),
                   _("L'image affichée par les particules de _PARAM0_ est _PARAM2_ à _PARAM1_"),
                   _("Commun"),
                   "Extensions/particleSystemicon24.png",
                   "Extensions/particleSystemicon16.png");

        instrInfo.AddParameter("object", _("Objet"), "ParticleEmitter", false);
        instrInfo.AddParameter("string", _("Texte à tester"), "", false);
        instrInfo.AddParameter("relationalOperator", _("Signe du test"), "", false);


        instrInfo.cppCallingInformation.SetFunctionName("GetTexture").SetManipulatedType("string").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");


    DECLARE_END_OBJECT_CONDITION()

    DECLARE_OBJECT_STR_EXPRESSION("Texture", _("Image des particules"), _("Nom de l'image affichée par les particules"), _("Particules"), "Extensions/particleSystemicon16.png")
        instrInfo.AddParameter("object", _("Objet"), "ParticleEmitter", false);

        instrInfo.cppCallingInformation.SetFunctionName("GetTexture").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");
    DECLARE_END_OBJECT_STR_EXPRESSION()

    DECLARE_OBJECT_EXPRESSION("NbParticles", _("Nombre de particules"), _("Nombre de particules"), _("Particules"), "Extensions/particleSystemicon16.png")
        instrInfo.AddParameter("object", _("Objet"), "ParticleEmitter", false);

        instrInfo.cppCallingInformation.SetFunctionName("GetNbParticles").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");
    DECLARE_END_OBJECT_EXPRESSION()

    DECLARE_OBJECT_EXPRESSION("RendererParam1", _("Paramètre 1 du rendu"), _("Paramètre 1 du rendu"), _("Paramétrage"), "Extensions/particleSystemicon16.png")
        instrInfo.AddParameter("object", _("Objet"), "ParticleEmitter", false);

        instrInfo.cppCallingInformation.SetFunctionName("GetRendererParam1").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");
    DECLARE_END_OBJECT_EXPRESSION()

    DECLARE_OBJECT_EXPRESSION("RendererParam2", _("Paramètre 2 du rendu"), _("Paramètre 2 du rendu"), _("Paramétrage"), "Extensions/particleSystemicon16.png")
        instrInfo.AddParameter("object", _("Objet"), "ParticleEmitter", false);

        instrInfo.cppCallingInformation.SetFunctionName("GetRendererParam2").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");
    DECLARE_END_OBJECT_EXPRESSION()

    DECLARE_OBJECT_EXPRESSION("Tank", _("Capacité"), _("Capacité"), _("Commun"), "Extensions/particleSystemicon16.png")
        instrInfo.AddParameter("object", _("Objet"), "ParticleEmitter", false);

        instrInfo.cppCallingInformation.SetFunctionName("GetTank").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");
    DECLARE_END_OBJECT_EXPRESSION()

    DECLARE_OBJECT_EXPRESSION("Flow", _("Flux"), _("Flux"), _("Commun"), "Extensions/particleSystemicon16.png")
        instrInfo.AddParameter("object", _("Objet"), "ParticleEmitter", false);

        instrInfo.cppCallingInformation.SetFunctionName("GetFlow").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");
    DECLARE_END_OBJECT_EXPRESSION()

    DECLARE_OBJECT_EXPRESSION("EmitterForceMin", _("Force minimale de l'émission"), _("Force minimale de l'émission"), _("Commun"), "Extensions/particleSystemicon16.png")
        instrInfo.AddParameter("object", _("Objet"), "ParticleEmitter", false);

        instrInfo.cppCallingInformation.SetFunctionName("GetEmitterForceMin").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");
    DECLARE_END_OBJECT_EXPRESSION()

    DECLARE_OBJECT_EXPRESSION("EmitterForceMax", _("Force maximale de l'émission"), _("Force maximale de l'émission"), _("Commun"), "Extensions/particleSystemicon16.png")
        instrInfo.AddParameter("object", _("Objet"), "ParticleEmitter", false);

        instrInfo.cppCallingInformation.SetFunctionName("GetEmitterForceMax").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");
    DECLARE_END_OBJECT_EXPRESSION()

    DECLARE_OBJECT_EXPRESSION("EmitterXDirection", _("Direction X de l'émission"), _("Direction X de l'émission"), _("Paramétrage"), "Extensions/particleSystemicon16.png")
        instrInfo.AddParameter("object", _("Objet"), "ParticleEmitter", false);

        instrInfo.cppCallingInformation.SetFunctionName("GetEmitterXDirection").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");
    DECLARE_END_OBJECT_EXPRESSION()
    DECLARE_OBJECT_EXPRESSION("EmitterYDirection", _("Direction Y de l'émission"), _("Direction Y de l'émission"), _("Paramétrage"), "Extensions/particleSystemicon16.png")
        instrInfo.AddParameter("object", _("Objet"), "ParticleEmitter", false);

        instrInfo.cppCallingInformation.SetFunctionName("GetEmitterYDirection").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");
    DECLARE_END_OBJECT_EXPRESSION()
    DECLARE_OBJECT_EXPRESSION("EmitterZDirection", _("Direction Z de l'émission"), _("Direction Z de l'émission"), _("Paramétrage"), "Extensions/particleSystemicon16.png")
        instrInfo.AddParameter("object", _("Objet"), "ParticleEmitter", false);

        instrInfo.cppCallingInformation.SetFunctionName("GetEmitterZDirection").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");
    DECLARE_END_OBJECT_EXPRESSION()
    DECLARE_OBJECT_EXPRESSION("EmitterAngle", _("Angle de l'émission"), _("Angle de l'émission"), _("Commun"), "Extensions/particleSystemicon16.png")
        instrInfo.AddParameter("object", _("Objet"), "ParticleEmitter", false);

        instrInfo.cppCallingInformation.SetFunctionName("GetAngle").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");
    DECLARE_END_OBJECT_EXPRESSION()
    DECLARE_OBJECT_EXPRESSION("EmitterAngleA", _("Angle A de l'émission"), _("Angle A de l'émission"), _("Avancé"), "Extensions/particleSystemicon16.png")
        instrInfo.AddParameter("object", _("Objet"), "ParticleEmitter", false);

        instrInfo.cppCallingInformation.SetFunctionName("GetEmitterAngleA").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");
    DECLARE_END_OBJECT_EXPRESSION()
    DECLARE_OBJECT_EXPRESSION("EmitterAngleB", _("Angle B de l'émission"), _("Angle B de l'émission"), _("Avancé"), "Extensions/particleSystemicon16.png")
        instrInfo.AddParameter("object", _("Objet"), "ParticleEmitter", false);

        instrInfo.cppCallingInformation.SetFunctionName("GetEmitterAngleB").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");
    DECLARE_END_OBJECT_EXPRESSION()
    DECLARE_OBJECT_EXPRESSION("ZoneRadius", _("Rayon de la zone d'émission"), _("Rayon de la zone d'émission"), _("Commun"), "Extensions/particleSystemicon16.png")
        instrInfo.AddParameter("object", _("Objet"), "ParticleEmitter", false);

        instrInfo.cppCallingInformation.SetFunctionName("GetZoneRadius").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");
    DECLARE_END_OBJECT_EXPRESSION()
    DECLARE_OBJECT_EXPRESSION("ParticleGravityX", _("Gravité en X des particules"), _("Gravité en X des particules"), _("Paramétrage"), "Extensions/particleSystemicon16.png")
        instrInfo.AddParameter("object", _("Objet"), "ParticleEmitter", false);

        instrInfo.cppCallingInformation.SetFunctionName("GetParticleGravityX").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");
    DECLARE_END_OBJECT_EXPRESSION()
    DECLARE_OBJECT_EXPRESSION("ParticleGravityY", _("Gravité en Y des particules"), _("Gravité en Y des particules"), _("Paramétrage"), "Extensions/particleSystemicon16.png")
        instrInfo.AddParameter("object", _("Objet"), "ParticleEmitter", false);

        instrInfo.cppCallingInformation.SetFunctionName("GetParticleGravityY").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");
    DECLARE_END_OBJECT_EXPRESSION()
    DECLARE_OBJECT_EXPRESSION("ParticleGravityZ", _("Gravité en Z des particules"), _("Gravité en Z des particules"), _("Paramétrage"), "Extensions/particleSystemicon16.png")
        instrInfo.AddParameter("object", _("Objet"), "ParticleEmitter", false);

        instrInfo.cppCallingInformation.SetFunctionName("GetParticleGravityZ").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");
    DECLARE_END_OBJECT_EXPRESSION()
    DECLARE_OBJECT_EXPRESSION("ParticleGravityAngle", _("Angle de la gravité"), _("Angle de la gravité"), _("Commun"), "Extensions/particleSystemicon16.png")
        instrInfo.AddParameter("object", _("Objet"), "ParticleEmitter", false);

        instrInfo.cppCallingInformation.SetFunctionName("GetParticleGravityAngle").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");
    DECLARE_END_OBJECT_EXPRESSION()
    DECLARE_OBJECT_EXPRESSION("ParticleGravityLength", _("Gravité"), _("Valeur de la gravité"), _("Commun"), "Extensions/particleSystemicon16.png")
        instrInfo.AddParameter("object", _("Objet"), "ParticleEmitter", false);

        instrInfo.cppCallingInformation.SetFunctionName("GetParticleGravityLength").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");
    DECLARE_END_OBJECT_EXPRESSION()
    DECLARE_OBJECT_EXPRESSION("Friction", _("Friction des particules"), _("Friction des particules"), _("Commun"), "Extensions/particleSystemicon16.png")
        instrInfo.AddParameter("object", _("Objet"), "ParticleEmitter", false);

        instrInfo.cppCallingInformation.SetFunctionName("GetFriction").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");
    DECLARE_END_OBJECT_EXPRESSION()
    DECLARE_OBJECT_EXPRESSION("ParticleLifeTimeMin", _("Temps de vie minimal des particules"), _("Temps de vie minimal des particules"), _("Paramétrage"), "Extensions/particleSystemicon16.png")
        instrInfo.AddParameter("object", _("Objet"), "ParticleEmitter", false);

        instrInfo.cppCallingInformation.SetFunctionName("GetParticleLifeTimeMin").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");
    DECLARE_END_OBJECT_EXPRESSION()
    DECLARE_OBJECT_EXPRESSION("ParticleLifeTimeMax", _("Temps de vie maximal des particules"), _("Temps de vie maximal des particules"), _("Paramétrage"), "Extensions/particleSystemicon16.png")
        instrInfo.AddParameter("object", _("Objet"), "ParticleEmitter", false);

        instrInfo.cppCallingInformation.SetFunctionName("GetParticleLifeTimeMax").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");
    DECLARE_END_OBJECT_EXPRESSION()
    DECLARE_OBJECT_EXPRESSION("ParticleRed1", _("Paramètre 1 de la couleur rouge"), _("Paramètre 1 de la couleur rouge"), _("Paramétrage"), "Extensions/particleSystemicon16.png")
        instrInfo.AddParameter("object", _("Objet"), "ParticleEmitter", false);

        instrInfo.cppCallingInformation.SetFunctionName("GetParticleRed1").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");
    DECLARE_END_OBJECT_EXPRESSION()
    DECLARE_OBJECT_EXPRESSION("ParticleRed2", _("Paramètre 2 de la couleur rouge"), _("Paramètre 2 de la couleur rouge"), _("Paramétrage"), "Extensions/particleSystemicon16.png")
        instrInfo.AddParameter("object", _("Objet"), "ParticleEmitter", false);

        instrInfo.cppCallingInformation.SetFunctionName("GetParticleRed2").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");
    DECLARE_END_OBJECT_EXPRESSION()
    DECLARE_OBJECT_EXPRESSION("ParticleBlue1", _("Paramètre 1 de la couleur bleue"), _("Paramètre 1 de la couleur bleue"), _("Paramétrage"), "Extensions/particleSystemicon16.png")
        instrInfo.AddParameter("object", _("Objet"), "ParticleEmitter", false);

        instrInfo.cppCallingInformation.SetFunctionName("GetParticleBlue1").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");
    DECLARE_END_OBJECT_EXPRESSION()
    DECLARE_OBJECT_EXPRESSION("ParticleBlue2", _("Paramètre 2 de la couleur bleue"), _("Paramètre 2 de la couleur bleue"), _("Paramétrage"), "Extensions/particleSystemicon16.png")
        instrInfo.AddParameter("object", _("Objet"), "ParticleEmitter", false);

        instrInfo.cppCallingInformation.SetFunctionName("GetParticleBlue2").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");
    DECLARE_END_OBJECT_EXPRESSION()
    DECLARE_OBJECT_EXPRESSION("ParticleGreen1", _("Paramètre 1 de la couleur vert"), _("Paramètre 1 de la couleur vert"), _("Paramétrage"), "Extensions/particleSystemicon16.png")
        instrInfo.AddParameter("object", _("Objet"), "ParticleEmitter", false);

        instrInfo.cppCallingInformation.SetFunctionName("GetParticleGreen1").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");
    DECLARE_END_OBJECT_EXPRESSION()
    DECLARE_OBJECT_EXPRESSION("ParticleGreen2", _("Paramètre 2 de la couleur vert"), _("Paramètre 2 de la couleur vert"), _("Paramétrage"), "Extensions/particleSystemicon16.png")
        instrInfo.AddParameter("object", _("Objet"), "ParticleEmitter", false);

        instrInfo.cppCallingInformation.SetFunctionName("GetParticleGreen2").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");
    DECLARE_END_OBJECT_EXPRESSION()
    DECLARE_OBJECT_EXPRESSION("ParticleAlpha1", _("Paramètre 1 de la transparence"), _("Paramètre 1 de la transparence"), _("Paramétrage"), "Extensions/particleSystemicon16.png")
        instrInfo.AddParameter("object", _("Objet"), "ParticleEmitter", false);

        instrInfo.cppCallingInformation.SetFunctionName("GetParticleAlpha1").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");
    DECLARE_END_OBJECT_EXPRESSION()
    DECLARE_OBJECT_EXPRESSION("ParticleAlpha2", _("Paramètre 2 de la transparence"), _("Paramètre 2 de la transparence"), _("Paramétrage"), "Extensions/particleSystemicon16.png")
        instrInfo.AddParameter("object", _("Objet"), "ParticleEmitter", false);

        instrInfo.cppCallingInformation.SetFunctionName("GetParticleAlpha2").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");
    DECLARE_END_OBJECT_EXPRESSION()
    DECLARE_OBJECT_EXPRESSION("ParticleSize1", _("Paramètre 1 de la taille"), _("Paramètre 1 de la taille"), _("Paramétrage"), "Extensions/particleSystemicon16.png")
        instrInfo.AddParameter("object", _("Objet"), "ParticleEmitter", false);

        instrInfo.cppCallingInformation.SetFunctionName("GetParticleSize1").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");
    DECLARE_END_OBJECT_EXPRESSION()
    DECLARE_OBJECT_EXPRESSION("ParticleSize2", _("Paramètre 2 de la taille"), _("Paramètre 2 de la taille"), _("Paramétrage"), "Extensions/particleSystemicon16.png")
        instrInfo.AddParameter("object", _("Objet"), "ParticleEmitter", false);

        instrInfo.cppCallingInformation.SetFunctionName("GetParticleSize2").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");
    DECLARE_END_OBJECT_EXPRESSION()
    DECLARE_OBJECT_EXPRESSION("ParticleAngle1", _("Paramètre 1 de l'angle"), _("Paramètre 1 de l'angle"), _("Paramétrage"), "Extensions/particleSystemicon16.png")
        instrInfo.AddParameter("object", _("Objet"), "ParticleEmitter", false);

        instrInfo.cppCallingInformation.SetFunctionName("GetParticleAngle1").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");
    DECLARE_END_OBJECT_EXPRESSION()
    DECLARE_OBJECT_EXPRESSION("ParticleAngle2", _("Paramètre 2 de l'angle"), _("Paramètre 2 de l'angle"), _("Paramétrage"), "Extensions/particleSystemicon16.png")
        instrInfo.AddParameter("object", _("Objet"), "ParticleEmitter", false);

        instrInfo.cppCallingInformation.SetFunctionName("GetParticleAngle2").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");
    DECLARE_END_OBJECT_EXPRESSION()
    #endif
}

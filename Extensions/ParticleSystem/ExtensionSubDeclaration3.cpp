/**

Game Develop - Particle System Extension
Copyright (c) 2010 Florian Rival (Florian.Rival@gmail.com)

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
    DECLARE_OBJECT_ACTION("RecreateParticleSystem",
                   _("Recréer les particules"),
                   _("Efface et recréé les particules, pour prendre en compte par exemple les changements au niveau du paramétrage."),
                   _("Recréer les particules de _PARAM0_"),
                   _("Paramétrage"),
                   "Extensions/particleSystemicon24.png",
                   "Extensions/particleSystemicon16.png",
                   &ParticleEmitterObject::ActRecreateParticleSystem);

        DECLARE_PARAMETER("object", _("Objet"), true, "ParticleEmitter")
        MAIN_OBJECTS_IN_PARAMETER(0)

    DECLARE_END_OBJECT_ACTION()

    DECLARE_OBJECT_ACTION("RendererParam1",
                   _("Paramètre 1 du rendu"),
                   _("Modifie le premier paramètre du rendu ( Taille/Longueur ).\nNécessite de recréer les particules pour prendre en compte les changements."),
                   _("Faire _PARAM2__PARAM1_ au paramètre 1 du rendu de _PARAM0_"),
                   _("Paramétrage"),
                   "Extensions/particleSystemicon24.png",
                   "Extensions/particleSystemicon16.png",
                   &ParticleEmitterObject::ActRendererParam1);

        DECLARE_PARAMETER("object", _("Objet"), true, "ParticleEmitter")
        DECLARE_PARAMETER("expression", _("Valeur"), false, "")
        DECLARE_PARAMETER("signe", _("Signe de la modification"), false, "")
        MAIN_OBJECTS_IN_PARAMETER(0)

    DECLARE_END_OBJECT_ACTION()

    DECLARE_OBJECT_CONDITION("RendererParam1",
                   _("Direction de la gravité en Z"),
                   _("Teste la valeur du paramètre 1 de rendu ( Taille/Longueur )."),
                   _("Le 1er paramètre du rendu de _PARAM0_ est _PARAM2_ à _PARAM1_"),
                   _("Paramétrage"),
                   "Extensions/particleSystemicon24.png",
                   "Extensions/particleSystemicon16.png",
                   &ParticleEmitterObject::CondRendererParam1);

        DECLARE_PARAMETER("object", _("Objet"), true, "ParticleEmitter")
        DECLARE_PARAMETER("expression", _("Valeur à tester"), false, "")
        DECLARE_PARAMETER("signe", _("Signe du test"), false, "")
        MAIN_OBJECTS_IN_PARAMETER(0)

    DECLARE_END_OBJECT_CONDITION()

    DECLARE_OBJECT_ACTION("RendererParam2",
                   _("Paramètre 2 du rendu"),
                   _("Modifie le second paramètre du rendu ( Taille/Longueur ).\nNécessite de recréer les particules pour prendre en compte les changements."),
                   _("Faire _PARAM2__PARAM1_ au paramètre 2 du rendu de _PARAM0_"),
                   _("Paramétrage"),
                   "Extensions/particleSystemicon24.png",
                   "Extensions/particleSystemicon16.png",
                   &ParticleEmitterObject::ActRendererParam2);

        DECLARE_PARAMETER("object", _("Objet"), true, "ParticleEmitter")
        DECLARE_PARAMETER("expression", _("Valeur"), false, "")
        DECLARE_PARAMETER("signe", _("Signe de la modification"), false, "")
        MAIN_OBJECTS_IN_PARAMETER(0)

    DECLARE_END_OBJECT_ACTION()

    DECLARE_OBJECT_CONDITION("RendererParam2",
                   _("Paramètre 2 du rendu"),
                   _("Teste la valeur du paramètre 2 de rendu ( Taille/Longueur )."),
                   _("Le 2nd paramètre du rendu de _PARAM0_ est _PARAM2_ à _PARAM1_"),
                   _("Paramétrage"),
                   "Extensions/particleSystemicon24.png",
                   "Extensions/particleSystemicon16.png",
                   &ParticleEmitterObject::CondRendererParam2);

        DECLARE_PARAMETER("object", _("Objet"), true, "ParticleEmitter")
        DECLARE_PARAMETER("expression", _("Valeur à tester"), false, "")
        DECLARE_PARAMETER("signe", _("Signe du test"), false, "")
        MAIN_OBJECTS_IN_PARAMETER(0)

    DECLARE_END_OBJECT_CONDITION()

    DECLARE_OBJECT_ACTION("Tank",
                   _("Capacité"),
                   _("Modifie la capacité de l'émetteur."),
                   _("Faire _PARAM2__PARAM1_ à la capacité de _PARAM0_"),
                   _("Commun"),
                   "Extensions/particleSystemicon24.png",
                   "Extensions/particleSystemicon16.png",
                   &ParticleEmitterObject::ActTank);

        DECLARE_PARAMETER("object", _("Objet"), true, "ParticleEmitter")
        DECLARE_PARAMETER("expression", _("Valeur"), false, "")
        DECLARE_PARAMETER("signe", _("Signe de la modification"), false, "")
        MAIN_OBJECTS_IN_PARAMETER(0)

    DECLARE_END_OBJECT_ACTION()

    DECLARE_OBJECT_CONDITION("Tank",
                   _("Capacité"),
                   _("Teste la capacité de l'émetteur."),
                   _("La capacité de _PARAM0_ est _PARAM2_ à _PARAM1_"),
                   _("Commun"),
                   "Extensions/particleSystemicon24.png",
                   "Extensions/particleSystemicon16.png",
                   &ParticleEmitterObject::CondTank);

        DECLARE_PARAMETER("object", _("Objet"), true, "ParticleEmitter")
        DECLARE_PARAMETER("expression", _("Valeur à tester"), false, "")
        DECLARE_PARAMETER("signe", _("Signe du test"), false, "")
        MAIN_OBJECTS_IN_PARAMETER(0)

    DECLARE_END_OBJECT_CONDITION()

    DECLARE_OBJECT_ACTION("Flow",
                   _("Flux"),
                   _("Modifie le flux de l'émetteur."),
                   _("Faire _PARAM2__PARAM1_ au flux de _PARAM0_"),
                   _("Commun"),
                   "Extensions/particleSystemicon24.png",
                   "Extensions/particleSystemicon16.png",
                   &ParticleEmitterObject::ActFlow);

        DECLARE_PARAMETER("object", _("Objet"), true, "ParticleEmitter")
        DECLARE_PARAMETER("expression", _("Valeur"), false, "")
        DECLARE_PARAMETER("signe", _("Signe de la modification"), false, "")
        MAIN_OBJECTS_IN_PARAMETER(0)

    DECLARE_END_OBJECT_ACTION()

    DECLARE_OBJECT_CONDITION("Flow",
                   _("Flux"),
                   _("Teste le flux de l'émetteur."),
                   _("Le flux de _PARAM0_ est _PARAM2_ à _PARAM1_"),
                   _("Commun"),
                   "Extensions/particleSystemicon24.png",
                   "Extensions/particleSystemicon16.png",
                   &ParticleEmitterObject::CondFlow);

        DECLARE_PARAMETER("object", _("Objet"), true, "ParticleEmitter")
        DECLARE_PARAMETER("expression", _("Valeur à tester"), false, "")
        DECLARE_PARAMETER("signe", _("Signe du test"), false, "")
        MAIN_OBJECTS_IN_PARAMETER(0)

    DECLARE_END_OBJECT_CONDITION()

    DECLARE_OBJECT_ACTION("Texture",
                   _("Image"),
                   _("Modifie l'image des particules ( si affichée )."),
                   _("Changer l'image des particules de _PARAM0_ en _PARAM1_"),
                   _("Commun"),
                   "Extensions/particleSystemicon24.png",
                   "Extensions/particleSystemicon16.png",
                   &ParticleEmitterObject::ActTexture);

        DECLARE_PARAMETER("object", _("Objet"), true, "ParticleEmitter")
        DECLARE_PARAMETER("text", _("Nouvelle image"), false, "")
        MAIN_OBJECTS_IN_PARAMETER(0)

    DECLARE_END_OBJECT_ACTION()

    DECLARE_OBJECT_CONDITION("Texture",
                   _("Image"),
                   _("Teste le nom de l'image affichée par les partiucles."),
                   _("L'image affichée par les particules de _PARAM0_ est _PARAM2_ à _PARAM1_"),
                   _("Commun"),
                   "Extensions/particleSystemicon24.png",
                   "Extensions/particleSystemicon16.png",
                   &ParticleEmitterObject::CondTexture);

        DECLARE_PARAMETER("object", _("Objet"), true, "ParticleEmitter")
        DECLARE_PARAMETER("text", _("Texte à tester"), false, "")
        DECLARE_PARAMETER("signe", _("Signe du test"), false, "")
        MAIN_OBJECTS_IN_PARAMETER(0)

    DECLARE_END_OBJECT_CONDITION()

    DECLARE_OBJECT_EXPRESSION("NbParticles", _("Nombre de particules"), _("Nombre de particules"), _("Particules"), "Extensions/particleSystemicon16.png", &ParticleEmitterObject::ExpNbParticles)
        DECLARE_PARAMETER("object", _("Objet"), true, "ParticleEmitter")
    DECLARE_END_OBJECT_EXPRESSION()

    DECLARE_OBJECT_EXPRESSION("RendererParam1", _("Paramètre 1 du rendu"), _("Paramètre 1 du rendu"), _("Paramétrage"), "Extensions/particleSystemicon16.png", &ParticleEmitterObject::ExpRendererParam1)
        DECLARE_PARAMETER("object", _("Objet"), true, "ParticleEmitter")
    DECLARE_END_OBJECT_EXPRESSION()

    DECLARE_OBJECT_EXPRESSION("RendererParam2", _("Paramètre 2 du rendu"), _("Paramètre 2 du rendu"), _("Paramétrage"), "Extensions/particleSystemicon16.png", &ParticleEmitterObject::ExpRendererParam2)
        DECLARE_PARAMETER("object", _("Objet"), true, "ParticleEmitter")
    DECLARE_END_OBJECT_EXPRESSION()

    DECLARE_OBJECT_EXPRESSION("Tank", _("Capacité"), _("Capacité"), _("Commun"), "Extensions/particleSystemicon16.png", &ParticleEmitterObject::ExpTank)
        DECLARE_PARAMETER("object", _("Objet"), true, "ParticleEmitter")
    DECLARE_END_OBJECT_EXPRESSION()

    DECLARE_OBJECT_EXPRESSION("Flow", _("Flux"), _("Flux"), _("Commun"), "Extensions/particleSystemicon16.png", &ParticleEmitterObject::ExpFlow)
        DECLARE_PARAMETER("object", _("Objet"), true, "ParticleEmitter")
    DECLARE_END_OBJECT_EXPRESSION()

    DECLARE_OBJECT_EXPRESSION("EmitterForceMin", _("Force minimale de l'émission"), _("Force minimale de l'émission"), _("Commun"), "Extensions/particleSystemicon16.png", &ParticleEmitterObject::ExpEmitterForceMin)
        DECLARE_PARAMETER("object", _("Objet"), true, "ParticleEmitter")
    DECLARE_END_OBJECT_EXPRESSION()

    DECLARE_OBJECT_EXPRESSION("EmitterForceMax", _("Force maximale de l'émission"), _("Force maximale de l'émission"), _("Commun"), "Extensions/particleSystemicon16.png", &ParticleEmitterObject::ExpEmitterForceMax)
        DECLARE_PARAMETER("object", _("Objet"), true, "ParticleEmitter")
    DECLARE_END_OBJECT_EXPRESSION()

    DECLARE_OBJECT_EXPRESSION("EmitterXDirection", _("Direction X de l'émission"), _("Direction X de l'émission"), _("Paramétrage"), "Extensions/particleSystemicon16.png", &ParticleEmitterObject::ExpEmitterXDirection)
        DECLARE_PARAMETER("object", _("Objet"), true, "ParticleEmitter")
    DECLARE_END_OBJECT_EXPRESSION()
    DECLARE_OBJECT_EXPRESSION("EmitterYDirection", _("Direction Y de l'émission"), _("Direction Y de l'émission"), _("Paramétrage"), "Extensions/particleSystemicon16.png", &ParticleEmitterObject::ExpEmitterYDirection)
        DECLARE_PARAMETER("object", _("Objet"), true, "ParticleEmitter")
    DECLARE_END_OBJECT_EXPRESSION()
    DECLARE_OBJECT_EXPRESSION("EmitterZDirection", _("Direction Z de l'émission"), _("Direction Z de l'émission"), _("Paramétrage"), "Extensions/particleSystemicon16.png", &ParticleEmitterObject::ExpEmitterZDirection)
        DECLARE_PARAMETER("object", _("Objet"), true, "ParticleEmitter")
    DECLARE_END_OBJECT_EXPRESSION()
    DECLARE_OBJECT_EXPRESSION("EmitterAngle", _("Angle de l'émission"), _("Angle de l'émission"), _("Commun"), "Extensions/particleSystemicon16.png", &ParticleEmitterObject::ExpEmitterAngle)
        DECLARE_PARAMETER("object", _("Objet"), true, "ParticleEmitter")
    DECLARE_END_OBJECT_EXPRESSION()
    DECLARE_OBJECT_EXPRESSION("EmitterAngleA", _("Angle A de l'émission"), _("Angle A de l'émission"), _("Avancé"), "Extensions/particleSystemicon16.png", &ParticleEmitterObject::ExpEmitterAngleA)
        DECLARE_PARAMETER("object", _("Objet"), true, "ParticleEmitter")
    DECLARE_END_OBJECT_EXPRESSION()
    DECLARE_OBJECT_EXPRESSION("EmitterAngleB", _("Angle B de l'émission"), _("Angle B de l'émission"), _("Avancé"), "Extensions/particleSystemicon16.png", &ParticleEmitterObject::ExpEmitterAngleB)
        DECLARE_PARAMETER("object", _("Objet"), true, "ParticleEmitter")
    DECLARE_END_OBJECT_EXPRESSION()
    DECLARE_OBJECT_EXPRESSION("ZoneRadius", _("Rayon de la zone d'émission"), _("Rayon de la zone d'émission"), _("Commun"), "Extensions/particleSystemicon16.png", &ParticleEmitterObject::ExpZoneRadius)
        DECLARE_PARAMETER("object", _("Objet"), true, "ParticleEmitter")
    DECLARE_END_OBJECT_EXPRESSION()
    DECLARE_OBJECT_EXPRESSION("ParticleGravityX", _("Gravité en X des particules"), _("Gravité en X des particules"), _("Paramétrage"), "Extensions/particleSystemicon16.png", &ParticleEmitterObject::ExpParticleGravityX)
        DECLARE_PARAMETER("object", _("Objet"), true, "ParticleEmitter")
    DECLARE_END_OBJECT_EXPRESSION()
    DECLARE_OBJECT_EXPRESSION("ParticleGravityY", _("Gravité en Y des particules"), _("Gravité en Y des particules"), _("Paramétrage"), "Extensions/particleSystemicon16.png", &ParticleEmitterObject::ExpParticleGravityY)
        DECLARE_PARAMETER("object", _("Objet"), true, "ParticleEmitter")
    DECLARE_END_OBJECT_EXPRESSION()
    DECLARE_OBJECT_EXPRESSION("ParticleGravityZ", _("Gravité en Z des particules"), _("Gravité en Z des particules"), _("Paramétrage"), "Extensions/particleSystemicon16.png", &ParticleEmitterObject::ExpParticleGravityZ)
        DECLARE_PARAMETER("object", _("Objet"), true, "ParticleEmitter")
    DECLARE_END_OBJECT_EXPRESSION()
    DECLARE_OBJECT_EXPRESSION("ParticleGravityAngle", _("Angle de la gravité"), _("Angle de la gravité"), _("Commun"), "Extensions/particleSystemicon16.png", &ParticleEmitterObject::ExpParticleGravityAngle)
        DECLARE_PARAMETER("object", _("Objet"), true, "ParticleEmitter")
    DECLARE_END_OBJECT_EXPRESSION()
    DECLARE_OBJECT_EXPRESSION("ParticleGravityLength", _("Gravité"), _("Valeur de la gravité"), _("Commun"), "Extensions/particleSystemicon16.png", &ParticleEmitterObject::ExpParticleGravityLength)
        DECLARE_PARAMETER("object", _("Objet"), true, "ParticleEmitter")
    DECLARE_END_OBJECT_EXPRESSION()
    DECLARE_OBJECT_EXPRESSION("Friction", _("Friction des particules"), _("Friction des particules"), _("Commun"), "Extensions/particleSystemicon16.png", &ParticleEmitterObject::ExpFriction)
        DECLARE_PARAMETER("object", _("Objet"), true, "ParticleEmitter")
    DECLARE_END_OBJECT_EXPRESSION()
    DECLARE_OBJECT_EXPRESSION("ParticleLifeTimeMin", _("Temps de vie minimal des particules"), _("Temps de vie minimal des particules"), _("Paramétrage"), "Extensions/particleSystemicon16.png", &ParticleEmitterObject::ExpParticleLifeTimeMin)
        DECLARE_PARAMETER("object", _("Objet"), true, "ParticleEmitter")
    DECLARE_END_OBJECT_EXPRESSION()
    DECLARE_OBJECT_EXPRESSION("ParticleLifeTimeMax", _("Temps de vie maximal des particules"), _("Temps de vie maximal des particules"), _("Paramétrage"), "Extensions/particleSystemicon16.png", &ParticleEmitterObject::ExpParticleLifeTimeMax)
        DECLARE_PARAMETER("object", _("Objet"), true, "ParticleEmitter")
    DECLARE_END_OBJECT_EXPRESSION()
    DECLARE_OBJECT_EXPRESSION("ParticleRed1", _("Paramètre 1 de la couleur rouge"), _("Paramètre 1 de la couleur rouge"), _("Paramétrage"), "Extensions/particleSystemicon16.png", &ParticleEmitterObject::ExpParticleRed1)
        DECLARE_PARAMETER("object", _("Objet"), true, "ParticleEmitter")
    DECLARE_END_OBJECT_EXPRESSION()
    DECLARE_OBJECT_EXPRESSION("ParticleRed2", _("Paramètre 2 de la couleur rouge"), _("Paramètre 2 de la couleur rouge"), _("Paramétrage"), "Extensions/particleSystemicon16.png", &ParticleEmitterObject::ExpParticleRed2)
        DECLARE_PARAMETER("object", _("Objet"), true, "ParticleEmitter")
    DECLARE_END_OBJECT_EXPRESSION()
    DECLARE_OBJECT_EXPRESSION("ParticleBlue1", _("Paramètre 1 de la couleur bleue"), _("Paramètre 1 de la couleur bleue"), _("Paramétrage"), "Extensions/particleSystemicon16.png", &ParticleEmitterObject::ExpParticleBlue1)
        DECLARE_PARAMETER("object", _("Objet"), true, "ParticleEmitter")
    DECLARE_END_OBJECT_EXPRESSION()
    DECLARE_OBJECT_EXPRESSION("ParticleBlue2", _("Paramètre 2 de la couleur bleue"), _("Paramètre 2 de la couleur bleue"), _("Paramétrage"), "Extensions/particleSystemicon16.png", &ParticleEmitterObject::ExpParticleBlue2)
        DECLARE_PARAMETER("object", _("Objet"), true, "ParticleEmitter")
    DECLARE_END_OBJECT_EXPRESSION()
    DECLARE_OBJECT_EXPRESSION("ParticleGreen1", _("Paramètre 1 de la couleur vert"), _("Paramètre 1 de la couleur vert"), _("Paramétrage"), "Extensions/particleSystemicon16.png", &ParticleEmitterObject::ExpParticleGreen1)
        DECLARE_PARAMETER("object", _("Objet"), true, "ParticleEmitter")
    DECLARE_END_OBJECT_EXPRESSION()
    DECLARE_OBJECT_EXPRESSION("ParticleGreen2", _("Paramètre 2 de la couleur vert"), _("Paramètre 2 de la couleur vert"), _("Paramétrage"), "Extensions/particleSystemicon16.png", &ParticleEmitterObject::ExpParticleGreen2)
        DECLARE_PARAMETER("object", _("Objet"), true, "ParticleEmitter")
    DECLARE_END_OBJECT_EXPRESSION()
    DECLARE_OBJECT_EXPRESSION("ParticleAlpha1", _("Paramètre 1 de la transparence"), _("Paramètre 1 de la transparence"), _("Paramétrage"), "Extensions/particleSystemicon16.png", &ParticleEmitterObject::ExpParticleAlpha1)
        DECLARE_PARAMETER("object", _("Objet"), true, "ParticleEmitter")
    DECLARE_END_OBJECT_EXPRESSION()
    DECLARE_OBJECT_EXPRESSION("ParticleAlpha2", _("Paramètre 2 de la transparence"), _("Paramètre 2 de la transparence"), _("Paramétrage"), "Extensions/particleSystemicon16.png", &ParticleEmitterObject::ExpParticleAlpha2)
        DECLARE_PARAMETER("object", _("Objet"), true, "ParticleEmitter")
    DECLARE_END_OBJECT_EXPRESSION()
    DECLARE_OBJECT_EXPRESSION("ParticleSize1", _("Paramètre 1 de la taille"), _("Paramètre 1 de la taille"), _("Paramétrage"), "Extensions/particleSystemicon16.png", &ParticleEmitterObject::ExpParticleSize1)
        DECLARE_PARAMETER("object", _("Objet"), true, "ParticleEmitter")
    DECLARE_END_OBJECT_EXPRESSION()
    DECLARE_OBJECT_EXPRESSION("ParticleSize2", _("Paramètre 2 de la taille"), _("Paramètre 2 de la taille"), _("Paramétrage"), "Extensions/particleSystemicon16.png", &ParticleEmitterObject::ExpParticleSize2)
        DECLARE_PARAMETER("object", _("Objet"), true, "ParticleEmitter")
    DECLARE_END_OBJECT_EXPRESSION()
    DECLARE_OBJECT_EXPRESSION("ParticleAngle1", _("Paramètre 1 de l'angle"), _("Paramètre 1 de l'angle"), _("Paramétrage"), "Extensions/particleSystemicon16.png", &ParticleEmitterObject::ExpParticleAngle1)
        DECLARE_PARAMETER("object", _("Objet"), true, "ParticleEmitter")
    DECLARE_END_OBJECT_EXPRESSION()
    DECLARE_OBJECT_EXPRESSION("ParticleAngle2", _("Paramètre 2 de l'angle"), _("Paramètre 2 de l'angle"), _("Paramétrage"), "Extensions/particleSystemicon16.png", &ParticleEmitterObject::ExpParticleAngle2)
        DECLARE_PARAMETER("object", _("Objet"), true, "ParticleEmitter")
    DECLARE_END_OBJECT_EXPRESSION()
}

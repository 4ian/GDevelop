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
 * Declare some actions and conditions of the particle emitter
 */
void Extension::ExtensionSubDeclaration2(ExtensionObjectInfos & objInfos)
{
    DECLARE_OBJECT_ACTION("ParticleColor1",
                   _("Couleur initiale"),
                   _("Modifie la couleur initiale des particules."),
                   _("Mettre la couleur initiale des particules de _PARAM0_ à _PARAM1_"),
                   _("Commun"),
                   "Extensions/particleSystemicon24.png",
                   "Extensions/particleSystemicon16.png",
                   &ParticleEmitterObject::ActParticleColor1);

        DECLARE_PARAMETER("object", _("Objet"), true, "ParticleEmitter")
        DECLARE_PARAMETER("color", _("Couleur initiale"), false, "")
        MAIN_OBJECTS_IN_PARAMETER(0)

    DECLARE_END_OBJECT_ACTION()

    DECLARE_OBJECT_ACTION("ParticleColor2",
                   _("Couleur finale"),
                   _("Modifie la couleur finale des particules."),
                   _("Mettre la couleur finale des particules de _PARAM0_ à _PARAM1_"),
                   _("Commun"),
                   "Extensions/particleSystemicon24.png",
                   "Extensions/particleSystemicon16.png",
                   &ParticleEmitterObject::ActParticleColor2);

        DECLARE_PARAMETER("object", _("Objet"), true, "ParticleEmitter")
        DECLARE_PARAMETER("color", _("Couleur finale"), false, "")
        MAIN_OBJECTS_IN_PARAMETER(0)

    DECLARE_END_OBJECT_ACTION()

    DECLARE_OBJECT_ACTION("ParticleRed1",
                   _("Couleur rouge, paramètre 1"),
                   _("Modifie le paramètre 1 de la couleur rouge."),
                   _("Faire _PARAM2__PARAM1_ au paramètre 1 de la couleur rouge de _PARAM0_"),
                   _("Avancé"),
                   "Extensions/particleSystemicon24.png",
                   "Extensions/particleSystemicon16.png",
                   &ParticleEmitterObject::ActParticleRed1);

        DECLARE_PARAMETER("object", _("Objet"), true, "ParticleEmitter")
        DECLARE_PARAMETER("expression", _("Valeur"), false, "")
        DECLARE_PARAMETER("signe", _("Signe de la modification"), false, "")
        MAIN_OBJECTS_IN_PARAMETER(0)

    DECLARE_END_OBJECT_ACTION()

    DECLARE_OBJECT_CONDITION("ParticleRed1",
                   _("Couleur rouge, paramètre 1"),
                   _("Teste le paramètre 1 de la couleur rouge"),
                   _("Le paramètre 1 de la couleur rouge de _PARAM0_ est _PARAM2_ à _PARAM1_"),
                   _("Avancé"),
                   "Extensions/particleSystemicon24.png",
                   "Extensions/particleSystemicon16.png",
                   &ParticleEmitterObject::CondParticleRed1);

        DECLARE_PARAMETER("object", _("Objet"), true, "ParticleEmitter")
        DECLARE_PARAMETER("expression", _("Valeur à tester"), false, "")
        DECLARE_PARAMETER("signe", _("Signe du test"), false, "")
        MAIN_OBJECTS_IN_PARAMETER(0)

    DECLARE_END_OBJECT_CONDITION()

    DECLARE_OBJECT_ACTION("ParticleRed2",
                   _("Couleur rouge, paramètre 2"),
                   _("Modifie le paramètre 2 de la couleur rouge."),
                   _("Faire _PARAM2__PARAM1_ au paramètre 2 de la couleur rouge de _PARAM0_"),
                   _("Avancé"),
                   "Extensions/particleSystemicon24.png",
                   "Extensions/particleSystemicon16.png",
                   &ParticleEmitterObject::ActParticleRed2);

        DECLARE_PARAMETER("object", _("Objet"), true, "ParticleEmitter")
        DECLARE_PARAMETER("expression", _("Valeur"), false, "")
        DECLARE_PARAMETER("signe", _("Signe de la modification"), false, "")
        MAIN_OBJECTS_IN_PARAMETER(0)

    DECLARE_END_OBJECT_ACTION()

    DECLARE_OBJECT_CONDITION("ParticleRed2",
                   _("Couleur rouge, paramètre 2"),
                   _("Teste le paramètre 2 de la couleur rouge"),
                   _("Le paramètre 2 de la couleur rouge de _PARAM0_ est _PARAM2_ à _PARAM1_"),
                   _("Avancé"),
                   "Extensions/particleSystemicon24.png",
                   "Extensions/particleSystemicon16.png",
                   &ParticleEmitterObject::CondParticleRed2);

        DECLARE_PARAMETER("object", _("Objet"), true, "ParticleEmitter")
        DECLARE_PARAMETER("expression", _("Valeur à tester"), false, "")
        DECLARE_PARAMETER("signe", _("Signe du test"), false, "")
        MAIN_OBJECTS_IN_PARAMETER(0)

    DECLARE_END_OBJECT_CONDITION()

    DECLARE_OBJECT_ACTION("ParticleBlue1",
                   _("Couleur bleu, paramètre 1"),
                   _("Modifie le paramètre 1 de la couleur bleu."),
                   _("Faire _PARAM2__PARAM1_ au paramètre 1 de la couleur bleu de _PARAM0_"),
                   _("Avancé"),
                   "Extensions/particleSystemicon24.png",
                   "Extensions/particleSystemicon16.png",
                   &ParticleEmitterObject::ActParticleBlue1);

        DECLARE_PARAMETER("object", _("Objet"), true, "ParticleEmitter")
        DECLARE_PARAMETER("expression", _("Valeur"), false, "")
        DECLARE_PARAMETER("signe", _("Signe de la modification"), false, "")
        MAIN_OBJECTS_IN_PARAMETER(0)

    DECLARE_END_OBJECT_ACTION()

    DECLARE_OBJECT_CONDITION("ParticleBlue1",
                   _("Couleur bleu, paramètre 1"),
                   _("Teste le paramètre 1 de la couleur bleu"),
                   _("Le paramètre 1 de la couleur bleu de _PARAM0_ est _PARAM2_ à _PARAM1_"),
                   _("Avancé"),
                   "Extensions/particleSystemicon24.png",
                   "Extensions/particleSystemicon16.png",
                   &ParticleEmitterObject::CondParticleBlue1);

        DECLARE_PARAMETER("object", _("Objet"), true, "ParticleEmitter")
        DECLARE_PARAMETER("expression", _("Valeur à tester"), false, "")
        DECLARE_PARAMETER("signe", _("Signe du test"), false, "")
        MAIN_OBJECTS_IN_PARAMETER(0)

    DECLARE_END_OBJECT_CONDITION()

    DECLARE_OBJECT_ACTION("ParticleBlue2",
                   _("Couleur bleu, paramètre 2"),
                   _("Modifie le paramètre 2 de la couleur bleu."),
                   _("Faire _PARAM2__PARAM1_ au paramètre 2 de la couleur bleu de _PARAM0_"),
                   _("Avancé"),
                   "Extensions/particleSystemicon24.png",
                   "Extensions/particleSystemicon16.png",
                   &ParticleEmitterObject::ActParticleBlue2);

        DECLARE_PARAMETER("object", _("Objet"), true, "ParticleEmitter")
        DECLARE_PARAMETER("expression", _("Valeur"), false, "")
        DECLARE_PARAMETER("signe", _("Signe de la modification"), false, "")
        MAIN_OBJECTS_IN_PARAMETER(0)

    DECLARE_END_OBJECT_ACTION()

    DECLARE_OBJECT_CONDITION("ParticleBlue2",
                   _("Couleur bleu, paramètre 2"),
                   _("Teste le paramètre 2 de la couleur bleu"),
                   _("Le paramètre 2 de la couleur bleu de _PARAM0_ est _PARAM2_ à _PARAM1_"),
                   _("Avancé"),
                   "Extensions/particleSystemicon24.png",
                   "Extensions/particleSystemicon16.png",
                   &ParticleEmitterObject::CondParticleBlue2);

        DECLARE_PARAMETER("object", _("Objet"), true, "ParticleEmitter")
        DECLARE_PARAMETER("expression", _("Valeur à tester"), false, "")
        DECLARE_PARAMETER("signe", _("Signe du test"), false, "")
        MAIN_OBJECTS_IN_PARAMETER(0)

    DECLARE_END_OBJECT_CONDITION()

    DECLARE_OBJECT_ACTION("ParticleGreen1",
                   _("Couleur vert, paramètre 1"),
                   _("Modifie le paramètre 1 de la couleur vert."),
                   _("Faire _PARAM2__PARAM1_ au paramètre 1 de la couleur vert de _PARAM0_"),
                   _("Avancé"),
                   "Extensions/particleSystemicon24.png",
                   "Extensions/particleSystemicon16.png",
                   &ParticleEmitterObject::ActParticleGreen1);

        DECLARE_PARAMETER("object", _("Objet"), true, "ParticleEmitter")
        DECLARE_PARAMETER("expression", _("Valeur"), false, "")
        DECLARE_PARAMETER("signe", _("Signe de la modification"), false, "")
        MAIN_OBJECTS_IN_PARAMETER(0)

    DECLARE_END_OBJECT_ACTION()

    DECLARE_OBJECT_CONDITION("ParticleGreen1",
                   _("Couleur vert, paramètre 1"),
                   _("Teste le paramètre 1 de la couleur vert"),
                   _("Le paramètre 1 de la couleur vert de _PARAM0_ est _PARAM2_ à _PARAM1_"),
                   _("Avancé"),
                   "Extensions/particleSystemicon24.png",
                   "Extensions/particleSystemicon16.png",
                   &ParticleEmitterObject::CondParticleGreen1);

        DECLARE_PARAMETER("object", _("Objet"), true, "ParticleEmitter")
        DECLARE_PARAMETER("expression", _("Valeur à tester"), false, "")
        DECLARE_PARAMETER("signe", _("Signe du test"), false, "")
        MAIN_OBJECTS_IN_PARAMETER(0)

    DECLARE_END_OBJECT_CONDITION()

    DECLARE_OBJECT_ACTION("ParticleGreen2",
                   _("Couleur vert, paramètre 2"),
                   _("Modifie le paramètre 2 de la couleur vert."),
                   _("Faire _PARAM2__PARAM1_ au paramètre 2 de la couleur vert de _PARAM0_"),
                   _("Avancé"),
                   "Extensions/particleSystemicon24.png",
                   "Extensions/particleSystemicon16.png",
                   &ParticleEmitterObject::ActParticleGreen2);

        DECLARE_PARAMETER("object", _("Objet"), true, "ParticleEmitter")
        DECLARE_PARAMETER("expression", _("Valeur"), false, "")
        DECLARE_PARAMETER("signe", _("Signe de la modification"), false, "")
        MAIN_OBJECTS_IN_PARAMETER(0)

    DECLARE_END_OBJECT_ACTION()

    DECLARE_OBJECT_CONDITION("ParticleGreen2",
                   _("Couleur vert, paramètre 2"),
                   _("Teste le paramètre 2 de la couleur vert"),
                   _("Le paramètre 2 de la couleur vert de _PARAM0_ est _PARAM2_ à _PARAM1_"),
                   _("Avancé"),
                   "Extensions/particleSystemicon24.png",
                   "Extensions/particleSystemicon16.png",
                   &ParticleEmitterObject::CondParticleGreen2);

        DECLARE_PARAMETER("object", _("Objet"), true, "ParticleEmitter")
        DECLARE_PARAMETER("expression", _("Valeur à tester"), false, "")
        DECLARE_PARAMETER("signe", _("Signe du test"), false, "")
        MAIN_OBJECTS_IN_PARAMETER(0)

    DECLARE_END_OBJECT_CONDITION()

    DECLARE_OBJECT_ACTION("ParticleSize1",
                   _("Taille, paramètre 1"),
                   _("Modifie le paramètre 1 de la taille des particules."),
                   _("Faire _PARAM2__PARAM1_ au paramètre 1 de la taille des particules de _PARAM0_"),
                   _("Commun"),
                   "Extensions/particleSystemicon24.png",
                   "Extensions/particleSystemicon16.png",
                   &ParticleEmitterObject::ActParticleSize1);

        DECLARE_PARAMETER("object", _("Objet"), true, "ParticleEmitter")
        DECLARE_PARAMETER("expression", _("Valeur"), false, "")
        DECLARE_PARAMETER("signe", _("Signe de la modification"), false, "")
        MAIN_OBJECTS_IN_PARAMETER(0)

    DECLARE_END_OBJECT_ACTION()

    DECLARE_OBJECT_CONDITION("ParticleSize1",
                   _("Taille, paramètre 1"),
                   _("Teste le paramètre 1 de la taille des particules"),
                   _("Le paramètre 1 de la taille des particules de _PARAM0_ est _PARAM2_ à _PARAM1_"),
                   _("Commun"),
                   "Extensions/particleSystemicon24.png",
                   "Extensions/particleSystemicon16.png",
                   &ParticleEmitterObject::CondParticleSize1);

        DECLARE_PARAMETER("object", _("Objet"), true, "ParticleEmitter")
        DECLARE_PARAMETER("expression", _("Valeur à tester"), false, "")
        DECLARE_PARAMETER("signe", _("Signe du test"), false, "")
        MAIN_OBJECTS_IN_PARAMETER(0)

    DECLARE_END_OBJECT_CONDITION()

    DECLARE_OBJECT_ACTION("ParticleSize2",
                   _("Taille, paramètre 2"),
                   _("Modifie le paramètre 2 de la taille des particules."),
                   _("Faire _PARAM2__PARAM1_ au paramètre 2 de la taille des particules de _PARAM0_"),
                   _("Commun"),
                   "Extensions/particleSystemicon24.png",
                   "Extensions/particleSystemicon16.png",
                   &ParticleEmitterObject::ActParticleSize2);

        DECLARE_PARAMETER("object", _("Objet"), true, "ParticleEmitter")
        DECLARE_PARAMETER("expression", _("Valeur"), false, "")
        DECLARE_PARAMETER("signe", _("Signe de la modification"), false, "")
        MAIN_OBJECTS_IN_PARAMETER(0)

    DECLARE_END_OBJECT_ACTION()

    DECLARE_OBJECT_CONDITION("ParticleSize2",
                   _("Taille, paramètre 2"),
                   _("Teste le paramètre 2 de la taille des particules"),
                   _("Le paramètre 2 de la taille des particules de _PARAM0_ est _PARAM2_ à _PARAM1_"),
                   _("Commun"),
                   "Extensions/particleSystemicon24.png",
                   "Extensions/particleSystemicon16.png",
                   &ParticleEmitterObject::CondParticleSize2);

        DECLARE_PARAMETER("object", _("Objet"), true, "ParticleEmitter")
        DECLARE_PARAMETER("expression", _("Valeur à tester"), false, "")
        DECLARE_PARAMETER("signe", _("Signe du test"), false, "")
        MAIN_OBJECTS_IN_PARAMETER(0)

    DECLARE_END_OBJECT_CONDITION()

    DECLARE_OBJECT_ACTION("ParticleAngle1",
                   _("Angle, paramètre 1"),
                   _("Modifie le paramètre 1 de l'angle des particules."),
                   _("Faire _PARAM2__PARAM1_ au paramètre 1 de l'angle des particules de _PARAM0_"),
                   _("Commun"),
                   "Extensions/particleSystemicon24.png",
                   "Extensions/particleSystemicon16.png",
                   &ParticleEmitterObject::ActParticleAngle1);

        DECLARE_PARAMETER("object", _("Objet"), true, "ParticleEmitter")
        DECLARE_PARAMETER("expression", _("Valeur"), false, "")
        DECLARE_PARAMETER("signe", _("Signe de la modification"), false, "")
        MAIN_OBJECTS_IN_PARAMETER(0)

    DECLARE_END_OBJECT_ACTION()

    DECLARE_OBJECT_CONDITION("ParticleAngle1",
                   _("Angle, paramètre 1"),
                   _("Teste le paramètre 1 de l'angle des particules"),
                   _("Le paramètre 1 de l'angle des particules de _PARAM0_ est _PARAM2_ à _PARAM1_"),
                   _("Commun"),
                   "Extensions/particleSystemicon24.png",
                   "Extensions/particleSystemicon16.png",
                   &ParticleEmitterObject::CondParticleAngle1);

        DECLARE_PARAMETER("object", _("Objet"), true, "ParticleEmitter")
        DECLARE_PARAMETER("expression", _("Valeur à tester"), false, "")
        DECLARE_PARAMETER("signe", _("Signe du test"), false, "")
        MAIN_OBJECTS_IN_PARAMETER(0)

    DECLARE_END_OBJECT_CONDITION()

    DECLARE_OBJECT_ACTION("ParticleAngle2",
                   _("Angle, paramètre 2"),
                   _("Modifie le paramètre 2 de l'angle des particules."),
                   _("Faire _PARAM2__PARAM1_ au paramètre 2 de l'angle des particules de _PARAM0_"),
                   _("Commun"),
                   "Extensions/particleSystemicon24.png",
                   "Extensions/particleSystemicon16.png",
                   &ParticleEmitterObject::ActParticleAngle2);

        DECLARE_PARAMETER("object", _("Objet"), true, "ParticleEmitter")
        DECLARE_PARAMETER("expression", _("Valeur"), false, "")
        DECLARE_PARAMETER("signe", _("Signe de la modification"), false, "")
        MAIN_OBJECTS_IN_PARAMETER(0)

    DECLARE_END_OBJECT_ACTION()

    DECLARE_OBJECT_CONDITION("ParticleAngle2",
                   _("Angle, paramètre 2"),
                   _("Teste le paramètre 2 de l'angle des particules"),
                   _("Le paramètre 2 de l'angle des particules de _PARAM0_ est _PARAM2_ à _PARAM1_"),
                   _("Commun"),
                   "Extensions/particleSystemicon24.png",
                   "Extensions/particleSystemicon16.png",
                   &ParticleEmitterObject::CondParticleAngle2);

        DECLARE_PARAMETER("object", _("Objet"), true, "ParticleEmitter")
        DECLARE_PARAMETER("expression", _("Valeur à tester"), false, "")
        DECLARE_PARAMETER("signe", _("Signe du test"), false, "")
        MAIN_OBJECTS_IN_PARAMETER(0)

    DECLARE_END_OBJECT_CONDITION()

    DECLARE_OBJECT_ACTION("ParticleAlpha1",
                   _("Transparence, paramètre 1"),
                   _("Modifie le paramètre 1 de la transparence des particules."),
                   _("Faire _PARAM2__PARAM1_ au paramètre 1 de la transparence des particules de _PARAM0_"),
                   _("Commun"),
                   "Extensions/particleSystemicon24.png",
                   "Extensions/particleSystemicon16.png",
                   &ParticleEmitterObject::ActParticleAlpha1);

        DECLARE_PARAMETER("object", _("Objet"), true, "ParticleEmitter")
        DECLARE_PARAMETER("expression", _("Valeur"), false, "")
        DECLARE_PARAMETER("signe", _("Signe de la modification"), false, "")
        MAIN_OBJECTS_IN_PARAMETER(0)

    DECLARE_END_OBJECT_ACTION()

    DECLARE_OBJECT_CONDITION("ParticleAlpha1",
                   _("Transparence, paramètre 1"),
                   _("Teste le paramètre 1 de la transparence des particules"),
                   _("Le paramètre 1 de la transparence des particules de _PARAM0_ est _PARAM2_ à _PARAM1_"),
                   _("Commun"),
                   "Extensions/particleSystemicon24.png",
                   "Extensions/particleSystemicon16.png",
                   &ParticleEmitterObject::CondParticleAlpha1);

        DECLARE_PARAMETER("object", _("Objet"), true, "ParticleEmitter")
        DECLARE_PARAMETER("expression", _("Valeur à tester"), false, "")
        DECLARE_PARAMETER("signe", _("Signe du test"), false, "")
        MAIN_OBJECTS_IN_PARAMETER(0)

    DECLARE_END_OBJECT_CONDITION()

    DECLARE_OBJECT_ACTION("ParticleAlpha2",
                   _("Transparence, paramètre 2"),
                   _("Modifie le paramètre 2 de la transparence des particules."),
                   _("Faire _PARAM2__PARAM1_ au paramètre 2 de la transparence des particules de _PARAM0_"),
                   _("Commun"),
                   "Extensions/particleSystemicon24.png",
                   "Extensions/particleSystemicon16.png",
                   &ParticleEmitterObject::ActParticleAlpha2);

        DECLARE_PARAMETER("object", _("Objet"), true, "ParticleEmitter")
        DECLARE_PARAMETER("expression", _("Valeur"), false, "")
        DECLARE_PARAMETER("signe", _("Signe de la modification"), false, "")
        MAIN_OBJECTS_IN_PARAMETER(0)

    DECLARE_END_OBJECT_ACTION()

    DECLARE_OBJECT_CONDITION("ParticleAlpha2",
                   _("Transparence, paramètre 2"),
                   _("Teste le paramètre 2 de la transparence des particules"),
                   _("Le paramètre 2 de la transparence des particules de _PARAM0_ est _PARAM2_ à _PARAM1_"),
                   _("Commun"),
                   "Extensions/particleSystemicon24.png",
                   "Extensions/particleSystemicon16.png",
                   &ParticleEmitterObject::CondParticleAlpha2);

        DECLARE_PARAMETER("object", _("Objet"), true, "ParticleEmitter")
        DECLARE_PARAMETER("expression", _("Valeur à tester"), false, "")
        DECLARE_PARAMETER("signe", _("Signe du test"), false, "")
        MAIN_OBJECTS_IN_PARAMETER(0)

    DECLARE_END_OBJECT_CONDITION()

    DECLARE_OBJECT_CONDITION("NoMoreParticles",
                   _("Plus aucune particules"),
                   _("Renvoi vrai si l'objet n'émet plus aucune particule, pour pouvoir par exemple le détruire ensuite."),
                   _("_PARAM0_ n'émet plus de particules"),
                   _("Commun"),
                   "Extensions/particleSystemicon24.png",
                   "Extensions/particleSystemicon16.png",
                   &ParticleEmitterObject::CondNoMoreParticles);

        DECLARE_PARAMETER("object", _("Objet"), true, "ParticleEmitter")
        MAIN_OBJECTS_IN_PARAMETER(0)

    DECLARE_END_OBJECT_CONDITION()
}

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
#include "ParticleEmitterObject.h"

/**
 * Declare some actions and conditions of the particle emitter
 */
void Extension::ExtensionSubDeclaration1(ExtensionObjectInfos & objInfos)
{
    DECLARE_OBJECT_ACTION("EmitterXDirection",
                   _("Direction d'émission en X"),
                   _("Modifie la direction d'émission des particules en X.\nNécessite de recréer les particules pour prendre en compte les changements."),
                   _("Faire _PARAM2__PARAM1_ à la direction d'émission des particules en X de _PARAM0_"),
                   _("Paramétrage"),
                   "Extensions/particleSystemicon24.png",
                   "Extensions/particleSystemicon16.png",
                   &ParticleEmitterObject::ActEmitterXDirection);

        DECLARE_PARAMETER("object", _("Objet"), true, "ParticleEmitter")
        DECLARE_PARAMETER("expression", _("Valeur"), false, "")
        DECLARE_PARAMETER("signe", _("Signe de la modification"), false, "")
        MAIN_OBJECTS_IN_PARAMETER(0)

    DECLARE_END_OBJECT_ACTION()

    DECLARE_OBJECT_CONDITION("EmitterXDirection",
                   _("Direction d'émission en X"),
                   _("Teste la direction d'émission des particules en X."),
                   _("La direction d'émission des particules en X de _PARAM0_ est _PARAM2_ à _PARAM1_"),
                   _("Paramétrage"),
                   "Extensions/particleSystemicon24.png",
                   "Extensions/particleSystemicon16.png",
                   &ParticleEmitterObject::CondEmitterXDirection);

        DECLARE_PARAMETER("object", _("Objet"), true, "ParticleEmitter")
        DECLARE_PARAMETER("expression", _("Valeur à tester"), false, "")
        DECLARE_PARAMETER("signe", _("Signe du test"), false, "")
        MAIN_OBJECTS_IN_PARAMETER(0)

    DECLARE_END_OBJECT_CONDITION()

    DECLARE_OBJECT_ACTION("EmitterYDirection",
                   _("Direction d'émission en Y"),
                   _("Modifie la direction d'émission des particules en Y.\nNécessite de recréer les particules pour prendre en compte les changements."),
                   _("Faire _PARAM2__PARAM1_ à la direction d'émission des particules en Y de _PARAM0_"),
                   _("Paramétrage"),
                   "Extensions/particleSystemicon24.png",
                   "Extensions/particleSystemicon16.png",
                   &ParticleEmitterObject::ActEmitterYDirection);

        DECLARE_PARAMETER("object", _("Objet"), true, "ParticleEmitter")
        DECLARE_PARAMETER("expression", _("Valeur"), false, "")
        DECLARE_PARAMETER("signe", _("Signe de la modification"), false, "")
        MAIN_OBJECTS_IN_PARAMETER(0)

    DECLARE_END_OBJECT_ACTION()

    DECLARE_OBJECT_CONDITION("EmitterYDirection",
                   _("Direction d'émission en Y"),
                   _("Teste la direction d'émission des particules en Y."),
                   _("La direction d'émission des particules en Y de _PARAM0_ est _PARAM2_ à _PARAM1_"),
                   _("Paramétrage"),
                   "Extensions/particleSystemicon24.png",
                   "Extensions/particleSystemicon16.png",
                   &ParticleEmitterObject::CondEmitterYDirection);

        DECLARE_PARAMETER("object", _("Objet"), true, "ParticleEmitter")
        DECLARE_PARAMETER("expression", _("Valeur à tester"), false, "")
        DECLARE_PARAMETER("signe", _("Signe du test"), false, "")
        MAIN_OBJECTS_IN_PARAMETER(0)

    DECLARE_END_OBJECT_CONDITION()

    DECLARE_OBJECT_ACTION("EmitterZDirection",
                   _("Direction d'émission en Z"),
                   _("Modifie la direction d'émission des particules en Z.\nNécessite de recréer les particules pour prendre en compte les changements."),
                   _("Faire _PARAM2__PARAM1_ à la direction d'émission des particules en Z de _PARAM0_"),
                   _("Paramétrage"),
                   "Extensions/particleSystemicon24.png",
                   "Extensions/particleSystemicon16.png",
                   &ParticleEmitterObject::ActEmitterZDirection);

        DECLARE_PARAMETER("object", _("Objet"), true, "ParticleEmitter")
        DECLARE_PARAMETER("expression", _("Valeur"), false, "")
        DECLARE_PARAMETER("signe", _("Signe de la modification"), false, "")
        MAIN_OBJECTS_IN_PARAMETER(0)

    DECLARE_END_OBJECT_ACTION()

    DECLARE_OBJECT_CONDITION("EmitterZDirection",
                   _("Direction d'émission en Z"),
                   _("Teste la direction d'émission des particules en Z."),
                   _("La direction d'émission des particules en Z de _PARAM0_ est _PARAM2_ à _PARAM1_"),
                   _("Paramétrage"),
                   "Extensions/particleSystemicon24.png",
                   "Extensions/particleSystemicon16.png",
                   &ParticleEmitterObject::CondEmitterZDirection);

        DECLARE_PARAMETER("object", _("Objet"), true, "ParticleEmitter")
        DECLARE_PARAMETER("expression", _("Valeur à tester"), false, "")
        DECLARE_PARAMETER("signe", _("Signe du test"), false, "")
        MAIN_OBJECTS_IN_PARAMETER(0)

    DECLARE_END_OBJECT_CONDITION()

    DECLARE_OBJECT_ACTION("EmitterAngleA",
                   _("Angle d'émission 1"),
                   _("Modifie l'angle d'émission n°1.\nNécessite de recréer les particules pour prendre en compte les changements."),
                   _("Faire _PARAM2__PARAM1_ à l'angle d'émission n°1 de _PARAM0_"),
                   _("Paramétrage"),
                   "Extensions/particleSystemicon24.png",
                   "Extensions/particleSystemicon16.png",
                   &ParticleEmitterObject::ActEmitterAngleA);

        DECLARE_PARAMETER("object", _("Objet"), true, "ParticleEmitter")
        DECLARE_PARAMETER("expression", _("Valeur"), false, "")
        DECLARE_PARAMETER("signe", _("Signe de la modification"), false, "")
        MAIN_OBJECTS_IN_PARAMETER(0)

    DECLARE_END_OBJECT_ACTION()

    DECLARE_OBJECT_CONDITION("EmitterAngleA",
                   _("Angle d'émission 1"),
                   _("Teste la valeur de l'angle d'émission n°1 de l'émetteur."),
                   _("L'angle d'émission n°1 de _PARAM0_ est _PARAM2_ à _PARAM1_"),
                   _("Paramétrage"),
                   "Extensions/particleSystemicon24.png",
                   "Extensions/particleSystemicon16.png",
                   &ParticleEmitterObject::CondEmitterAngleA);

        DECLARE_PARAMETER("object", _("Objet"), true, "ParticleEmitter")
        DECLARE_PARAMETER("expression", _("Valeur à tester"), false, "")
        DECLARE_PARAMETER("signe", _("Signe du test"), false, "")
        MAIN_OBJECTS_IN_PARAMETER(0)

    DECLARE_END_OBJECT_CONDITION()

    DECLARE_OBJECT_ACTION("EmitterAngleB",
                   _("Angle d'émission 2"),
                   _("Modifie l'angle d'émission n°2.\nNécessite de recréer les particules pour prendre en compte les changements."),
                   _("Faire _PARAM2__PARAM1_ à l'angle d'émission n°2 de _PARAM0_"),
                   _("Paramétrage"),
                   "Extensions/particleSystemicon24.png",
                   "Extensions/particleSystemicon16.png",
                   &ParticleEmitterObject::ActEmitterAngleB);

        DECLARE_PARAMETER("object", _("Objet"), true, "ParticleEmitter")
        DECLARE_PARAMETER("expression", _("Valeur"), false, "")
        DECLARE_PARAMETER("signe", _("Signe de la modification"), false, "")
        MAIN_OBJECTS_IN_PARAMETER(0)

    DECLARE_END_OBJECT_ACTION()

    DECLARE_OBJECT_CONDITION("EmitterAngleB",
                   _("Angle d'émission 2"),
                   _("Teste la valeur de l'angle d'émission n°2 de l'émetteur."),
                   _("L'angle d'émission n°2 de _PARAM0_ est _PARAM2_ à _PARAM1_"),
                   _("Paramétrage"),
                   "Extensions/particleSystemicon24.png",
                   "Extensions/particleSystemicon16.png",
                   &ParticleEmitterObject::CondEmitterAngleB);

        DECLARE_PARAMETER("object", _("Objet"), true, "ParticleEmitter")
        DECLARE_PARAMETER("expression", _("Valeur à tester"), false, "")
        DECLARE_PARAMETER("signe", _("Signe du test"), false, "")
        MAIN_OBJECTS_IN_PARAMETER(0)

    DECLARE_END_OBJECT_CONDITION()

    DECLARE_OBJECT_ACTION("Friction",
                   _("Friction"),
                   _("Modifie la friction appliquée aux particules.\nNécessite de recréer les particules pour prendre en compte les changements."),
                   _("Faire _PARAM2__PARAM1_ à la friction des particules _PARAM0_"),
                   _("Paramétrage"),
                   "Extensions/particleSystemicon24.png",
                   "Extensions/particleSystemicon16.png",
                   &ParticleEmitterObject::ActFriction);

        DECLARE_PARAMETER("object", _("Objet"), true, "ParticleEmitter")
        DECLARE_PARAMETER("expression", _("Valeur"), false, "")
        DECLARE_PARAMETER("signe", _("Signe de la modification"), false, "")
        MAIN_OBJECTS_IN_PARAMETER(0)

    DECLARE_END_OBJECT_ACTION()

    DECLARE_OBJECT_CONDITION("Friction",
                   _("Friction"),
                   _("Teste la friction appliquée aux particules."),
                   _("La friction des particules de _PARAM0_ est _PARAM2_ à _PARAM1_"),
                   _("Paramétrage"),
                   "Extensions/particleSystemicon24.png",
                   "Extensions/particleSystemicon16.png",
                   &ParticleEmitterObject::CondFriction);

        DECLARE_PARAMETER("object", _("Objet"), true, "ParticleEmitter")
        DECLARE_PARAMETER("expression", _("Valeur à tester"), false, "")
        DECLARE_PARAMETER("signe", _("Signe du test"), false, "")
        MAIN_OBJECTS_IN_PARAMETER(0)

    DECLARE_END_OBJECT_CONDITION()

    DECLARE_OBJECT_ACTION("ZoneRadius",
                   _("ZoneRadius"),
                   _("Modifie le rayon d'apparition des particules.\nNécessite de recréer les particules pour prendre en compte les changements."),
                   _("Faire _PARAM2__PARAM1_ au rayon d'apparition des particules de _PARAM0_"),
                   _("Paramétrage"),
                   "Extensions/particleSystemicon24.png",
                   "Extensions/particleSystemicon16.png",
                   &ParticleEmitterObject::ActZoneRadius);

        DECLARE_PARAMETER("object", _("Objet"), true, "ParticleEmitter")
        DECLARE_PARAMETER("expression", _("Valeur"), false, "")
        DECLARE_PARAMETER("signe", _("Signe de la modification"), false, "")
        MAIN_OBJECTS_IN_PARAMETER(0)

    DECLARE_END_OBJECT_ACTION()

    DECLARE_OBJECT_CONDITION("ZoneRadius",
                   _("ZoneRadius"),
                   _("Teste le rayon d'apparition des particules."),
                   _("Le rayon d'apparition des particules de _PARAM0_ est _PARAM2_ à _PARAM1_"),
                   _("Paramétrage"),
                   "Extensions/particleSystemicon24.png",
                   "Extensions/particleSystemicon16.png",
                   &ParticleEmitterObject::CondZoneRadius);

        DECLARE_PARAMETER("object", _("Objet"), true, "ParticleEmitter")
        DECLARE_PARAMETER("expression", _("Valeur à tester"), false, "")
        DECLARE_PARAMETER("signe", _("Signe du test"), false, "")
        MAIN_OBJECTS_IN_PARAMETER(0)

    DECLARE_END_OBJECT_CONDITION()

    DECLARE_OBJECT_ACTION("ParticleLifeTimeMin",
                   _("Temps de vie minimum"),
                   _("Modifie le temps de vie minimum des particules.\nNécessite de recréer les particules pour prendre en compte les changements."),
                   _("Faire _PARAM2__PARAM1_ au temps de vie minimum des particules de _PARAM0_"),
                   _("Paramétrage"),
                   "Extensions/particleSystemicon24.png",
                   "Extensions/particleSystemicon16.png",
                   &ParticleEmitterObject::ActParticleLifeTimeMin);

        DECLARE_PARAMETER("object", _("Objet"), true, "ParticleEmitter")
        DECLARE_PARAMETER("expression", _("Valeur"), false, "")
        DECLARE_PARAMETER("signe", _("Signe de la modification"), false, "")
        MAIN_OBJECTS_IN_PARAMETER(0)

    DECLARE_END_OBJECT_ACTION()

    DECLARE_OBJECT_CONDITION("ParticleLifeTimeMin",
                   _("Temps de vie minimum"),
                   _("Teste la valeur du temps de vie minimum des particules."),
                   _("Le temps de vie minimum des particules de _PARAM0_ est _PARAM2_ à _PARAM1_"),
                   _("Paramétrage"),
                   "Extensions/particleSystemicon24.png",
                   "Extensions/particleSystemicon16.png",
                   &ParticleEmitterObject::CondParticleLifeTimeMin);

        DECLARE_PARAMETER("object", _("Objet"), true, "ParticleEmitter")
        DECLARE_PARAMETER("expression", _("Valeur à tester"), false, "")
        DECLARE_PARAMETER("signe", _("Signe du test"), false, "")
        MAIN_OBJECTS_IN_PARAMETER(0)

    DECLARE_END_OBJECT_CONDITION()

    DECLARE_OBJECT_ACTION("ParticleLifeTimeMax",
                   _("Temps de vie maximum"),
                   _("Modifie le temps de vie maximum des particules.\nNécessite de recréer les particules pour prendre en compte les changements."),
                   _("Faire _PARAM2__PARAM1_ au temps de vie maximum des particules de _PARAM0_"),
                   _("Paramétrage"),
                   "Extensions/particleSystemicon24.png",
                   "Extensions/particleSystemicon16.png",
                   &ParticleEmitterObject::ActParticleLifeTimeMax);

        DECLARE_PARAMETER("object", _("Objet"), true, "ParticleEmitter")
        DECLARE_PARAMETER("expression", _("Valeur"), false, "")
        DECLARE_PARAMETER("signe", _("Signe de la modification"), false, "")
        MAIN_OBJECTS_IN_PARAMETER(0)

    DECLARE_END_OBJECT_ACTION()

    DECLARE_OBJECT_CONDITION("ParticleLifeTimeMax",
                   _("Temps de vie maximum"),
                   _("Teste la valeur du temps de vie maximum des particules."),
                   _("Le temps de vie maximum des particules de _PARAM0_ est _PARAM2_ à _PARAM1_"),
                   _("Paramétrage"),
                   "Extensions/particleSystemicon24.png",
                   "Extensions/particleSystemicon16.png",
                   &ParticleEmitterObject::CondParticleLifeTimeMax);

        DECLARE_PARAMETER("object", _("Objet"), true, "ParticleEmitter")
        DECLARE_PARAMETER("expression", _("Valeur à tester"), false, "")
        DECLARE_PARAMETER("signe", _("Signe du test"), false, "")
        MAIN_OBJECTS_IN_PARAMETER(0)

    DECLARE_END_OBJECT_CONDITION()

    DECLARE_OBJECT_ACTION("ParticleGravityX",
                   _("Gravité en X"),
                   _("Modifie la direction de la gravité en X.\nNécessite de recréer les particules pour prendre en compte les changements."),
                   _("Faire _PARAM2__PARAM1_ à la direction de la gravité en X de _PARAM0_"),
                   _("Paramétrage"),
                   "Extensions/particleSystemicon24.png",
                   "Extensions/particleSystemicon16.png",
                   &ParticleEmitterObject::ActParticleGravityX);

        DECLARE_PARAMETER("object", _("Objet"), true, "ParticleEmitter")
        DECLARE_PARAMETER("expression", _("Valeur"), false, "")
        DECLARE_PARAMETER("signe", _("Signe de la modification"), false, "")
        MAIN_OBJECTS_IN_PARAMETER(0)

    DECLARE_END_OBJECT_ACTION()

    DECLARE_OBJECT_CONDITION("ParticleGravityX",
                   _("Direction de la gravité en X"),
                   _("Teste la direction de la gravité en X."),
                   _("La direction de la gravité des particules en X de _PARAM0_ est _PARAM2_ à _PARAM1_"),
                   _("Paramétrage"),
                   "Extensions/particleSystemicon24.png",
                   "Extensions/particleSystemicon16.png",
                   &ParticleEmitterObject::CondParticleGravityX);

        DECLARE_PARAMETER("object", _("Objet"), true, "ParticleEmitter")
        DECLARE_PARAMETER("expression", _("Valeur à tester"), false, "")
        DECLARE_PARAMETER("signe", _("Signe du test"), false, "")
        MAIN_OBJECTS_IN_PARAMETER(0)

    DECLARE_END_OBJECT_CONDITION()

    DECLARE_OBJECT_ACTION("ParticleGravityY",
                   _("Gravité en Y"),
                   _("Modifie la direction de la gravité en Y.\nNécessite de recréer les particules pour prendre en compte les changements."),
                   _("Faire _PARAM2__PARAM1_ à la direction de la gravité en Y de _PARAM0_"),
                   _("Paramétrage"),
                   "Extensions/particleSystemicon24.png",
                   "Extensions/particleSystemicon16.png",
                   &ParticleEmitterObject::ActParticleGravityY);

        DECLARE_PARAMETER("object", _("Objet"), true, "ParticleEmitter")
        DECLARE_PARAMETER("expression", _("Valeur"), false, "")
        DECLARE_PARAMETER("signe", _("Signe de la modification"), false, "")
        MAIN_OBJECTS_IN_PARAMETER(0)

    DECLARE_END_OBJECT_ACTION()

    DECLARE_OBJECT_CONDITION("ParticleGravityY",
                   _("Direction de la gravité en Y"),
                   _("Teste la direction de la gravité en Y."),
                   _("La direction de la gravité des particules en Y de _PARAM0_ est _PARAM2_ à _PARAM1_"),
                   _("Paramétrage"),
                   "Extensions/particleSystemicon24.png",
                   "Extensions/particleSystemicon16.png",
                   &ParticleEmitterObject::CondParticleGravityY);

        DECLARE_PARAMETER("object", _("Objet"), true, "ParticleEmitter")
        DECLARE_PARAMETER("expression", _("Valeur à tester"), false, "")
        DECLARE_PARAMETER("signe", _("Signe du test"), false, "")
        MAIN_OBJECTS_IN_PARAMETER(0)

    DECLARE_END_OBJECT_CONDITION()

    DECLARE_OBJECT_ACTION("ParticleGravityZ",
                   _("Gravité en Z"),
                   _("Modifie la direction de la gravité en Z.\nNécessite de recréer les particules pour prendre en compte les changements."),
                   _("Faire _PARAM2__PARAM1_ à la direction de la gravité en Z de _PARAM0_"),
                   _("Paramétrage"),
                   "Extensions/particleSystemicon24.png",
                   "Extensions/particleSystemicon16.png",
                   &ParticleEmitterObject::ActParticleGravityZ);

        DECLARE_PARAMETER("object", _("Objet"), true, "ParticleEmitter")
        DECLARE_PARAMETER("expression", _("Valeur"), false, "")
        DECLARE_PARAMETER("signe", _("Signe de la modification"), false, "")
        MAIN_OBJECTS_IN_PARAMETER(0)

    DECLARE_END_OBJECT_ACTION()

    DECLARE_OBJECT_CONDITION("ParticleGravityZ",
                   _("Direction de la gravité en Z"),
                   _("Teste la direction de la gravité en Z."),
                   _("La direction de la gravité des particules en Z de _PARAM0_ est _PARAM2_ à _PARAM1_"),
                   _("Paramétrage"),
                   "Extensions/particleSystemicon24.png",
                   "Extensions/particleSystemicon16.png",
                   &ParticleEmitterObject::CondParticleGravityZ);

        DECLARE_PARAMETER("object", _("Objet"), true, "ParticleEmitter")
        DECLARE_PARAMETER("expression", _("Valeur à tester"), false, "")
        DECLARE_PARAMETER("signe", _("Signe du test"), false, "")
        MAIN_OBJECTS_IN_PARAMETER(0)

    DECLARE_END_OBJECT_CONDITION()
}

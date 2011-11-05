/** \author

Game Develop - Physic Automatism Extension
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
#include "PhysicsAutomatism.h"
#include <boost/version.hpp>

/**
 * This class declare information about the extension.
 */
class Extension : public ExtensionBase
{
    public:

        /**
         * Constructor of an extension declares everything the extension contains : Objects, actions, conditions and expressions.
         */
        Extension()
        {
            DECLARE_THE_EXTENSION("PhysicsAutomatism",
                                  _("Automatisme Moteur physique"),
                                  _("Automatisme permettant de déplacer les objets comme si ils étaient soumis aux lois de la physique."),
                                  "Compil Games",
                                  "zlib/libpng License ( Open Source )")


                DECLARE_AUTOMATISM("PhysicsAutomatism",
                          _("Moteur physique"),
                          _("Physics"),
                          _("Automatisme permettant de déplacer les objets comme si ils étaient soumis aux lois de la physique."),
                          "",
                          "res/physics32.png",
                          PhysicsAutomatism,
                          ScenePhysicsDatas)

                    #if defined(GD_IDE_ONLY)

                    automatismInfo.SetIncludeFile("PhysicsAutomatism/PhysicsAutomatism.h");

                    DECLARE_AUTOMATISM_ACTION("SetStatic",
                                   _("Rendre l'objet statique"),
                                   _("Rend l'objet statique physiquement"),
                                   _("Rendre _PARAM0_ statique"),
                                   _("Mouvement"),
                                   "res/physics24.png",
                                   "res/physics16.png");

                        instrInfo.AddParameter("object", _("Objet"), "", false);
                        instrInfo.AddParameter("automatism", _("Automatisme"), "PhysicsAutomatism", false);
                        instrInfo.AddCodeOnlyParameter("currentScene", "");

                        instrInfo.cppCallingInformation.SetFunctionName("SetStatic").SetIncludeFile("PhysicsAutomatism/PhysicsAutomatism.h");

                    DECLARE_END_AUTOMATISM_ACTION()

                    DECLARE_AUTOMATISM_ACTION("SetDynamic",
                                   _("Rendre l'objet dynamique"),
                                   _("Rend l'objet dynamique ( affecté par les forces et les autres objets )."),
                                   _("Rendre _PARAM0_ dynamique"),
                                   _("Mouvement"),
                                   "res/physics24.png",
                                   "res/physics16.png");

                        instrInfo.AddParameter("object", _("Objet"), "", false);
                        instrInfo.AddParameter("automatism", _("Automatisme"), "PhysicsAutomatism", false);
                        instrInfo.AddCodeOnlyParameter("currentScene", "");

                        instrInfo.cppCallingInformation.SetFunctionName("SetDynamic").SetIncludeFile("PhysicsAutomatism/PhysicsAutomatism.h");


                    DECLARE_END_AUTOMATISM_ACTION()

                    DECLARE_AUTOMATISM_CONDITION("IsDynamic",
                                   _("L'objet est dynamique"),
                                   _("Teste si l'objet est dynamique ( affecté par les forces et les autres objets )."),
                                   _("_PARAM0_ est dynamique"),
                                   _("Mouvement"),
                                   "res/physics24.png",
                                   "res/physics16.png");

                        instrInfo.AddParameter("object", _("Objet"), "", false);
                        instrInfo.AddParameter("automatism", _("Automatisme"), "PhysicsAutomatism", false);

                        instrInfo.cppCallingInformation.SetFunctionName("IsDynamic").SetIncludeFile("PhysicsAutomatism/PhysicsAutomatism.h");


                    DECLARE_END_AUTOMATISM_CONDITION()

                    DECLARE_AUTOMATISM_ACTION("SetFixedRotation",
                                   _("Fixer la rotation"),
                                   _("Empêche l'objet de tourner."),
                                   _("Fixer la rotation de _PARAM0_"),
                                   _("Rotation"),
                                   "res/physics24.png",
                                   "res/physics16.png");

                        instrInfo.AddParameter("object", _("Objet"), "", false);
                        instrInfo.AddParameter("automatism", _("Automatisme"), "PhysicsAutomatism", false);
                        instrInfo.AddCodeOnlyParameter("currentScene", "");

                        instrInfo.cppCallingInformation.SetFunctionName("SetFixedRotation").SetIncludeFile("PhysicsAutomatism/PhysicsAutomatism.h");


                    DECLARE_END_AUTOMATISM_ACTION()

                    DECLARE_AUTOMATISM_ACTION("AddRevoluteJoint",
                                   _("Ajouter une charnière"),
                                   _("Ajoute une charnière autour de laquelle l'objet va tourner.\nLa distance entre la charnière et l'objet restera identique à quand l'action sera appelée."),
                                   _("Ajouter une charnière à _PARAM0_ à la position _PARAM2_;_PARAM3_"),
                                   _("Joints"),
                                   "res/physics24.png",
                                   "res/physics16.png");

                        instrInfo.AddParameter("object", _("Objet"), "", false);
                        instrInfo.AddParameter("automatism", _("Automatisme"), "PhysicsAutomatism", false);
                        instrInfo.AddParameter("expression", _("Position X de la charnière"), "", false);
                        instrInfo.AddParameter("expression", _("Position Y de la charnière"), "", false);
                        instrInfo.AddCodeOnlyParameter("currentScene", "");

                        instrInfo.cppCallingInformation.SetFunctionName("AddRevoluteJoint").SetIncludeFile("PhysicsAutomatism/PhysicsAutomatism.h");

                    DECLARE_END_AUTOMATISM_ACTION()

                    DECLARE_AUTOMATISM_ACTION("AddRevoluteJointBetweenObjects",
                                   _("Ajouter une charnière entre deux objets"),
                                   _("Ajoute une charnière autour de laquelle l'objet va tourner. "),
                                   _("Ajouter une charnière entre _PARAM0_ et _PARAM2_"),
                                   _("Joints"),
                                   "res/physics24.png",
                                   "res/physics16.png");

                        instrInfo.AddParameter("object", _("Objet"), "", false);
                        instrInfo.AddParameter("automatism", _("Automatisme"), "PhysicsAutomatism", false);
                        instrInfo.AddParameter("object", _("Objet"), "", false);
                        instrInfo.AddCodeOnlyParameter("ptrToObjectOfParameter", "2");
                        instrInfo.AddCodeOnlyParameter("currentScene", "");

                        instrInfo.cppCallingInformation.SetFunctionName("AddRevoluteJointBetweenObjects").SetIncludeFile("PhysicsAutomatism/PhysicsAutomatism.h");

                    DECLARE_END_AUTOMATISM_ACTION()

                    DECLARE_AUTOMATISM_ACTION("ActAddGearJointBetweenObjects",
                                   _("Ajouter une liaison engrenage entre deux objets"),
                                   _("Ajoute une liaison engrenage autour de laquelle l'objet va tourner. "),
                                   _("Ajouter une liaison engrenage entre _PARAM0_ et _PARAM2_"),
                                   _("Joints"),
                                   "res/physics24.png",
                                   "res/physics16.png");

                        instrInfo.AddParameter("object", _("Objet"), "", false);
                        instrInfo.AddParameter("automatism", _("Automatisme"), "PhysicsAutomatism", false);
                        instrInfo.AddParameter("object", _("Objet"), "", false);
                        instrInfo.AddCodeOnlyParameter("ptrToObjectOfParameter", "2");
                        instrInfo.AddCodeOnlyParameter("currentScene", "");

                        instrInfo.cppCallingInformation.SetFunctionName("AddGearJointBetweenObjects").SetIncludeFile("PhysicsAutomatism/PhysicsAutomatism.h");


                    DECLARE_END_AUTOMATISM_ACTION()

                    DECLARE_AUTOMATISM_ACTION("SetFreeRotation",
                                   _("Rendre la rotation libre"),
                                   _("Permet à l'objet de tourner."),
                                   _("Permettre à _PARAM0_ de tourner"),
                                   _("Rotation"),
                                   "res/physics24.png",
                                   "res/physics16.png");

                        instrInfo.AddParameter("object", _("Objet"), "", false);
                        instrInfo.AddParameter("automatism", _("Automatisme"), "PhysicsAutomatism", false);
                        instrInfo.AddCodeOnlyParameter("currentScene", "");

                        instrInfo.cppCallingInformation.SetFunctionName("SetFreeRotation").SetIncludeFile("PhysicsAutomatism/PhysicsAutomatism.h");

                    DECLARE_END_AUTOMATISM_ACTION()

                    DECLARE_AUTOMATISM_CONDITION("IsFixedRotation",
                                   _("Rotation fixée"),
                                   _("Teste si l'objet a sa rotation fixée."),
                                   _("_PARAM0_ a sa rotation fixée"),
                                   _("Rotation"),
                                   "res/physics24.png",
                                   "res/physics16.png");

                        instrInfo.AddParameter("object", _("Objet"), "", false);
                        instrInfo.AddParameter("automatism", _("Automatisme"), "PhysicsAutomatism", false);
                        instrInfo.AddCodeOnlyParameter("currentScene", "");

                        instrInfo.cppCallingInformation.SetFunctionName("IsFixedRotation").SetIncludeFile("PhysicsAutomatism/PhysicsAutomatism.h");

                    DECLARE_END_AUTOMATISM_CONDITION()

                    DECLARE_AUTOMATISM_ACTION("SetAsBullet",
                                   _("Considérer comme un projectile"),
                                   _("Considérer l'objet comme un projectile, afin de garantir une meilleure gestion des collisions."),
                                   _("Considérer _PARAM0_ comme un projectile"),
                                   _("Autre"),
                                   "res/physics24.png",
                                   "res/physics16.png");

                        instrInfo.AddParameter("object", _("Objet"), "", false);
                        instrInfo.AddParameter("automatism", _("Automatisme"), "PhysicsAutomatism", false);
                        instrInfo.AddCodeOnlyParameter("currentScene", "");

                        instrInfo.cppCallingInformation.SetFunctionName("SetAsBullet").SetIncludeFile("PhysicsAutomatism/PhysicsAutomatism.h");

                    DECLARE_END_AUTOMATISM_ACTION()

                    DECLARE_AUTOMATISM_ACTION("DontSetAsBullet",
                                   _("Ne pas considérer comme un projectile"),
                                   _("Ne pas considérer l'objet comme un projectile, afin d'utiliser une gestion standard des collisions."),
                                   _("Ne pas considérer _PARAM0_ comme un projectile"),
                                   _("Autre"),
                                   "res/physics24.png",
                                   "res/physics16.png");

                        instrInfo.AddParameter("object", _("Objet"), "", false);
                        instrInfo.AddParameter("automatism", _("Automatisme"), "PhysicsAutomatism", false);
                        instrInfo.AddCodeOnlyParameter("currentScene", "");

                        instrInfo.cppCallingInformation.SetFunctionName("DontSetAsBullet").SetIncludeFile("PhysicsAutomatism/PhysicsAutomatism.h");

                    DECLARE_END_AUTOMATISM_ACTION()

                    DECLARE_AUTOMATISM_CONDITION("IsBullet",
                                   _("L'objet est considérée comme un projectile"),
                                   _("Teste si l'objet est considéré comme un projectile."),
                                   _("_PARAM0_ est considéré comme un projectile"),
                                   _("Autre"),
                                   "res/physics24.png",
                                   "res/physics16.png");

                        instrInfo.AddParameter("object", _("Objet"), "", false);
                        instrInfo.AddParameter("automatism", _("Automatisme"), "PhysicsAutomatism", false);
                        instrInfo.AddCodeOnlyParameter("currentScene", "");

                        instrInfo.cppCallingInformation.SetFunctionName("IsBullet").SetIncludeFile("PhysicsAutomatism/PhysicsAutomatism.h");

                    DECLARE_END_AUTOMATISM_CONDITION()

                    DECLARE_AUTOMATISM_ACTION("ApplyForce",
                                   _("Appliquer une force"),
                                   _("Applique une force à l'objet."),
                                   _("Appliquer à _PARAM0_ une force _PARAM2_;_PARAM3_"),
                                   _("Déplacement"),
                                   "res/physics24.png",
                                   "res/physics16.png");

                        instrInfo.AddParameter("object", _("Objet"), "", false);
                        instrInfo.AddParameter("automatism", _("Automatisme"), "PhysicsAutomatism", false);
                        instrInfo.AddParameter("expression", _("Composante X"), "", false);
                        instrInfo.AddParameter("expression", _("Composante Y"), "", false);
                        instrInfo.AddCodeOnlyParameter("currentScene", "");

                        instrInfo.cppCallingInformation.SetFunctionName("ApplyForce").SetIncludeFile("PhysicsAutomatism/PhysicsAutomatism.h");

                    DECLARE_END_AUTOMATISM_ACTION()

                    DECLARE_AUTOMATISM_ACTION("ApplyForceUsingPolarCoordinates",
                                   _("Appliquer une force ( angle )"),
                                   _("Applique une force à l'objet, en utilisant un angle et une longueur comme coordonnées de cette force."),
                                   _("Appliquer à _PARAM0_ une force d'angle _PARAM2_ et de longueur _PARAM3_"),
                                   _("Déplacement"),
                                   "res/physics24.png",
                                   "res/physics16.png");

                        instrInfo.AddParameter("object", _("Objet"), "", false);
                        instrInfo.AddParameter("automatism", _("Automatisme"), "PhysicsAutomatism", false);
                        instrInfo.AddParameter("expression", _("Angle"), "", false);
                        instrInfo.AddParameter("expression", _("Longueur"), "", false);
                        instrInfo.AddCodeOnlyParameter("currentScene", "");

                        instrInfo.cppCallingInformation.SetFunctionName("ApplyForceUsingPolarCoordinates").SetIncludeFile("PhysicsAutomatism/PhysicsAutomatism.h");

                    DECLARE_END_AUTOMATISM_ACTION()

                    DECLARE_AUTOMATISM_ACTION("ApplyForceTowardPosition",
                                   _("Appliquer une force vers une position"),
                                   _("Applique une force, dirigée vers une position, à l'objet."),
                                   _("Appliquer à _PARAM0_ une force vers la position _PARAM2_;_PARAM3_ de longeur _PARAM4_"),
                                   _("Déplacement"),
                                   "res/physics24.png",
                                   "res/physics16.png");

                        instrInfo.AddParameter("object", _("Objet"), "", false);
                        instrInfo.AddParameter("automatism", _("Automatisme"), "PhysicsAutomatism", false);
                        instrInfo.AddParameter("expression", _("Position X"), "", false);
                        instrInfo.AddParameter("expression", _("Position Y"), "", false);
                        instrInfo.AddParameter("expression", _("Longueur de la force"), "", false);
                        instrInfo.AddCodeOnlyParameter("currentScene", "");

                        instrInfo.cppCallingInformation.SetFunctionName("ApplyForceTowardPosition").SetIncludeFile("PhysicsAutomatism/PhysicsAutomatism.h");

                    DECLARE_END_AUTOMATISM_ACTION()

                    DECLARE_AUTOMATISM_ACTION("ApplyTorque",
                                   _("Appliquer un moment (rotation)"),
                                   _("Applique un moment (rotation) à l'objet."),
                                   _("Appliquer à _PARAM0_ un moment de valeur _PARAM2_"),
                                   _("Rotation"),
                                   "res/physics24.png",
                                   "res/physics16.png");

                        instrInfo.AddParameter("object", _("Objet"), "", false);
                        instrInfo.AddParameter("automatism", _("Automatisme"), "PhysicsAutomatism", false);
                        instrInfo.AddParameter("expression", _("Valeur du moment"), "", false);
                        instrInfo.AddCodeOnlyParameter("currentScene", "");

                        instrInfo.cppCallingInformation.SetFunctionName("ApplyTorque").SetIncludeFile("PhysicsAutomatism/PhysicsAutomatism.h");

                    DECLARE_END_AUTOMATISM_ACTION()

                    DECLARE_AUTOMATISM_ACTION("SetLinearVelocity",
                                   _("Vitesse linéaire"),
                                   _("Modifie la vitesse de l'objet."),
                                   _("Mettre la vitesse linéaire de _PARAM0_ à _PARAM2_;_PARAM3_"),
                                   _("Déplacement"),
                                   "res/physics24.png",
                                   "res/physics16.png");

                        instrInfo.AddParameter("object", _("Objet"), "", false);
                        instrInfo.AddParameter("automatism", _("Automatisme"), "PhysicsAutomatism", false);
                        instrInfo.AddParameter("expression", _("Coordonnée X"), "", false);
                        instrInfo.AddParameter("expression", _("Coordonnée Y"), "", false);
                        instrInfo.AddCodeOnlyParameter("currentScene", "");

                        instrInfo.cppCallingInformation.SetFunctionName("SetLinearVelocity").SetIncludeFile("PhysicsAutomatism/PhysicsAutomatism.h");


                    DECLARE_END_AUTOMATISM_ACTION()

                    DECLARE_AUTOMATISM_CONDITION("LinearVelocityX",
                                   _("Vitesse linéaire en X"),
                                   _("Teste la vitesse linéaire en X de l'objet."),
                                   _("La vitesse linéaire en X de _PARAM0_ est _PARAM3_ à _PARAM2_"),
                                   _("Déplacement"),
                                   "res/physics24.png",
                                   "res/physics16.png");

                        instrInfo.AddParameter("object", _("Objet"), "", false);
                        instrInfo.AddParameter("automatism", _("Automatisme"), "PhysicsAutomatism", false);
                        instrInfo.AddParameter("expression", _("Valeur à tester"), "", false);
                        instrInfo.AddParameter("relationalOperator", _("Signe de la comparaison"), "", false);
                        instrInfo.AddCodeOnlyParameter("currentScene", "");

                        instrInfo.cppCallingInformation.SetFunctionName("GetLinearVelocityX").SetManipulatedType("number").SetIncludeFile("PhysicsAutomatism/PhysicsAutomatism.h");


                    DECLARE_END_AUTOMATISM_CONDITION()

                    DECLARE_AUTOMATISM_CONDITION("LinearVelocityY",
                                   _("Vitesse linéaire en Y"),
                                   _("Teste la vitesse linéaire en Y de l'objet."),
                                   _("La vitesse linéaire en Y de _PARAM0_ est _PARAM3_ à _PARAM2_"),
                                   _("Déplacement"),
                                   "res/physics24.png",
                                   "res/physics16.png");

                        instrInfo.AddParameter("object", _("Objet"), "", false);
                        instrInfo.AddParameter("automatism", _("Automatisme"), "PhysicsAutomatism", false);
                        instrInfo.AddParameter("expression", _("Valeur à tester"), "", false);
                        instrInfo.AddParameter("relationalOperator", _("Signe de la comparaison"), "", false);
                        instrInfo.AddCodeOnlyParameter("currentScene", "");

                        instrInfo.cppCallingInformation.SetFunctionName("GetLinearVelocityY").SetManipulatedType("number").SetIncludeFile("PhysicsAutomatism/PhysicsAutomatism.h");

                    DECLARE_END_AUTOMATISM_CONDITION()

                    DECLARE_AUTOMATISM_ACTION("SetAngularVelocity",
                                   _("Vitesse angulaire ( de rotation )"),
                                   _("Modifie la vitesse angulaire de l'objet."),
                                   _("Mettre la vitesse angulaire de _PARAM0_ à _PARAM2_"),
                                   _("Rotation"),
                                   "res/physics24.png",
                                   "res/physics16.png");

                        instrInfo.AddParameter("object", _("Objet"), "", false);
                        instrInfo.AddParameter("automatism", _("Automatisme"), "PhysicsAutomatism", false);
                        instrInfo.AddParameter("expression", _("Nouvelle valeur"), "", false);
                        instrInfo.AddCodeOnlyParameter("currentScene", "");

                        instrInfo.cppCallingInformation.SetFunctionName("SetAngularVelocity").SetIncludeFile("PhysicsAutomatism/PhysicsAutomatism.h");

                    DECLARE_END_AUTOMATISM_ACTION()

                    DECLARE_AUTOMATISM_CONDITION("AngularVelocity",
                                   _("Vitesse angulaire ( de rotation )"),
                                   _("Teste la vitesse angulaire ( Vitesse de rotation ) de l'objet."),
                                   _("La vitesse angulaire de _PARAM0_ est _PARAM3_ à _PARAM2_"),
                                   _("Rotation"),
                                   "res/physics24.png",
                                   "res/physics16.png");

                        instrInfo.AddParameter("object", _("Objet"), "", false);
                        instrInfo.AddParameter("automatism", _("Automatisme"), "PhysicsAutomatism", false);
                        instrInfo.AddParameter("expression", _("Valeur à tester"), "", false);
                        instrInfo.AddParameter("relationalOperator", _("Signe de la comparaison"), "", false);
                        instrInfo.AddCodeOnlyParameter("currentScene", "");

                        instrInfo.cppCallingInformation.SetFunctionName("GetAngularVelocity").SetManipulatedType("number").SetIncludeFile("PhysicsAutomatism/PhysicsAutomatism.h");

                    DECLARE_END_AUTOMATISM_CONDITION()

                    DECLARE_AUTOMATISM_CONDITION("LinearDamping",
                                   _("Amortissement linéaire"),
                                   _("Teste l'amortissement linéaire de l'objet."),
                                   _("L'amortissement linéaire de _PARAM0_ est _PARAM3_ à _PARAM2_"),
                                   _("Déplacement"),
                                   "res/physics24.png",
                                   "res/physics16.png");

                        instrInfo.AddParameter("object", _("Objet"), "", false);
                        instrInfo.AddParameter("automatism", _("Automatisme"), "PhysicsAutomatism", false);
                        instrInfo.AddParameter("expression", _("Valeur à tester"), "", false);
                        instrInfo.AddParameter("relationalOperator", _("Signe de la comparaison"), "", false);
                        instrInfo.AddCodeOnlyParameter("currentScene", "");

                        instrInfo.cppCallingInformation.SetFunctionName("GetLinearDamping").SetManipulatedType("number").SetIncludeFile("PhysicsAutomatism/PhysicsAutomatism.h");

                    DECLARE_END_AUTOMATISM_CONDITION()

                    DECLARE_AUTOMATISM_CONDITION("CollisionWith",
                                   _("Collision"),
                                   _("Teste si deux objets sont en contact.\nAttention ! Seul les objets spécifiés en premier, si ils sont en collision avec un des autres objets, seront pris en compte pour les prochaines conditions et actions."),
                                   _("_PARAM0_ est en collision avec un _PARAM2_"),
                                   _("Collision"),
                                   "res/physics24.png",
                                   "res/physics16.png");

                        instrInfo.AddParameter("object", _("Objet"), "", false);
                        instrInfo.AddParameter("automatism", _("Automatisme"), "PhysicsAutomatism", false);
                        instrInfo.AddParameter("object", _("Objet"), "", false);
                        instrInfo.AddCodeOnlyParameter("mapOfObjectListsOfParameter", "2");
                        instrInfo.AddCodeOnlyParameter("currentScene", "");

                        instrInfo.cppCallingInformation.SetFunctionName("CollisionWith").SetIncludeFile("PhysicsAutomatism/PhysicsAutomatism.h");

                    DECLARE_END_AUTOMATISM_CONDITION()

                    DECLARE_AUTOMATISM_ACTION("SetLinearDamping",
                                   _("Amortissement linéaire"),
                                   _("Modifie l'amortissement linéaire de l'objet."),
                                   _("Mettre l'amortissement linéaire de _PARAM0_ à _PARAM2_"),
                                   _("Déplacement"),
                                   "res/physics24.png",
                                   "res/physics16.png");

                        instrInfo.AddParameter("object", _("Objet"), "", false);
                        instrInfo.AddParameter("automatism", _("Automatisme"), "PhysicsAutomatism", false);
                        instrInfo.AddParameter("expression", _("Valeur"), "", false);
                        instrInfo.AddCodeOnlyParameter("currentScene", "");

                        instrInfo.cppCallingInformation.SetFunctionName("SetLinearDamping").SetIncludeFile("PhysicsAutomatism/PhysicsAutomatism.h");

                    DECLARE_END_AUTOMATISM_ACTION()

                    DECLARE_AUTOMATISM_CONDITION("AngularDamping",
                                   _("Amortissement angulaire"),
                                   _("Teste l'amortissement angulaire de l'objet."),
                                   _("L'amortissement angulaire de _PARAM0_ est _PARAM3_ à _PARAM2_"),
                                   _("Déplacement"),
                                   "res/physics24.png",
                                   "res/physics16.png");

                        instrInfo.AddParameter("object", _("Objet"), "", false);
                        instrInfo.AddParameter("automatism", _("Automatisme"), "PhysicsAutomatism", false);
                        instrInfo.AddParameter("expression", _("Valeur à tester"), "", false);
                        instrInfo.AddParameter("relationalOperator", _("Signe de la comparaison"), "", false);
                        instrInfo.AddCodeOnlyParameter("currentScene", "");

                        instrInfo.cppCallingInformation.SetFunctionName("GetAngularDamping").SetManipulatedType("number").SetIncludeFile("PhysicsAutomatism/PhysicsAutomatism.h");

                    DECLARE_END_AUTOMATISM_CONDITION()

                    DECLARE_AUTOMATISM_ACTION("SetAngularDamping",
                                   _("Amortissement angulaire"),
                                   _("Modifie l'amortissement angulaire de l'objet."),
                                   _("Mettre l'amortissement angulaire de _PARAM0_ à _PARAM2_"),
                                   _("Déplacement"),
                                   "res/physics24.png",
                                   "res/physics16.png");

                        instrInfo.AddParameter("object", _("Objet"), "", false);
                        instrInfo.AddParameter("automatism", _("Automatisme"), "PhysicsAutomatism", false);
                        instrInfo.AddParameter("expression", _("Valeur"), "", false);
                        instrInfo.AddCodeOnlyParameter("currentScene", "");

                        instrInfo.cppCallingInformation.SetFunctionName("SetAngularDamping").SetIncludeFile("PhysicsAutomatism/PhysicsAutomatism.h");

                    DECLARE_END_AUTOMATISM_ACTION()

                    DECLARE_AUTOMATISM_ACTION("SetGravity",
                                   _("Gravité"),
                                   _("Modifie la force de gravité"),
                                   _("Mettre la force de gravité à _PARAM2_;_PARAM3_"),
                                   _("Options globales"),
                                   "res/physics24.png",
                                   "res/physics16.png");

                        instrInfo.AddParameter("object", _("Objet"), "", false);
                        instrInfo.AddParameter("automatism", _("Automatisme"), "PhysicsAutomatism", false);
                        instrInfo.AddParameter("expression", _("Coordonnée X"), "", false);
                        instrInfo.AddParameter("expression", _("Coordonnée Y"), "", false);
                        instrInfo.AddCodeOnlyParameter("currentScene", "");

                        instrInfo.cppCallingInformation.SetFunctionName("SetGravity").SetIncludeFile("PhysicsAutomatism/PhysicsAutomatism.h");

                    DECLARE_END_AUTOMATISM_ACTION()

                    DECLARE_AUTOMATISM_EXPRESSION("LinearVelocityX", _("Vitesse linéaire en X"), _("Vitesse linéaire en X"), _("Déplacement"), "res/physics16.png")
                        instrInfo.AddParameter("object", _("Objet"), "", false);
                        instrInfo.AddParameter("automatism", _("Automatisme"), "PhysicsAutomatism", false);
                        instrInfo.AddCodeOnlyParameter("currentScene", "");

                        instrInfo.cppCallingInformation.SetFunctionName("GetLinearVelocityX").SetIncludeFile("PhysicsAutomatism/PhysicsAutomatism.h");

                    DECLARE_END_AUTOMATISM_EXPRESSION()

                    DECLARE_AUTOMATISM_EXPRESSION("LinearVelocityY", _("Vitesse linéaire en Y"), _("Vitesse linéaire en Y"), _("Déplacement"), "res/physics16.png")
                        instrInfo.AddParameter("object", _("Objet"), "", false);
                        instrInfo.AddParameter("automatism", _("Automatisme"), "PhysicsAutomatism", false);
                        instrInfo.AddCodeOnlyParameter("currentScene", "");

                        instrInfo.cppCallingInformation.SetFunctionName("GetLinearVelocityY").SetIncludeFile("PhysicsAutomatism/PhysicsAutomatism.h");
                    DECLARE_END_AUTOMATISM_EXPRESSION()

                    DECLARE_AUTOMATISM_EXPRESSION("AngularVelocity", _("Vitesse angulaire"), _("Vitesse angulaire ( de rotation )"), _("Rotation"), "res/physics16.png")
                        instrInfo.AddParameter("object", _("Objet"), "", false);
                        instrInfo.AddParameter("automatism", _("Automatisme"), "PhysicsAutomatism", false);
                        instrInfo.AddCodeOnlyParameter("currentScene", "");

                        instrInfo.cppCallingInformation.SetFunctionName("GetAngularVelocity").SetIncludeFile("PhysicsAutomatism/PhysicsAutomatism.h");
                    DECLARE_END_AUTOMATISM_EXPRESSION()

                    DECLARE_AUTOMATISM_EXPRESSION("LinearDamping", _("Amortissement linéaire"), _("Amortissement linéaire"), _("Déplacement"), "res/physics16.png")
                        instrInfo.AddParameter("object", _("Objet"), "", false);
                        instrInfo.AddParameter("automatism", _("Automatisme"), "PhysicsAutomatism", false);
                        instrInfo.AddCodeOnlyParameter("currentScene", "");

                        instrInfo.cppCallingInformation.SetFunctionName("GetLinearDamping").SetIncludeFile("PhysicsAutomatism/PhysicsAutomatism.h");
                    DECLARE_END_AUTOMATISM_EXPRESSION()

                    DECLARE_AUTOMATISM_EXPRESSION("AngularDamping", _("Amortissement angulaire"), _("Amortissement angulaire"), _("Rotation"), "res/physics16.png")
                        instrInfo.AddParameter("object", _("Objet"), "", false);
                        instrInfo.AddParameter("automatism", _("Automatisme"), "PhysicsAutomatism", false);
                        instrInfo.AddCodeOnlyParameter("currentScene", "");

                        instrInfo.cppCallingInformation.SetFunctionName("GetAngularDamping").SetIncludeFile("PhysicsAutomatism/PhysicsAutomatism.h");
                    DECLARE_END_AUTOMATISM_EXPRESSION()

                    #endif

                DECLARE_END_AUTOMATISM();

            CompleteCompilationInformation();
        };
        virtual ~Extension() {};

    private:

        /**
         * This function is called by Game Develop so
         * as to complete information about how the extension was compiled ( which libs... )
         * -- Do not need to be modified. --
         */
        void CompleteCompilationInformation()
        {
            #if defined(GD_IDE_ONLY)
            compilationInfo.runtimeOnly = false;
            #else
            compilationInfo.runtimeOnly = true;
            #endif

            #if defined(__GNUC__)
            compilationInfo.gccMajorVersion = __GNUC__;
            compilationInfo.gccMinorVersion = __GNUC_MINOR__;
            compilationInfo.gccPatchLevel = __GNUC_PATCHLEVEL__;
            #endif

            compilationInfo.boostVersion = BOOST_VERSION;

            compilationInfo.sfmlMajorVersion = 2;
            compilationInfo.sfmlMinorVersion = 0;

            #if defined(GD_IDE_ONLY)
            compilationInfo.wxWidgetsMajorVersion = wxMAJOR_VERSION;
            compilationInfo.wxWidgetsMinorVersion = wxMINOR_VERSION;
            compilationInfo.wxWidgetsReleaseNumber = wxRELEASE_NUMBER;
            compilationInfo.wxWidgetsSubReleaseNumber = wxSUBRELEASE_NUMBER;
            #endif

            compilationInfo.gdlVersion = RC_FILEVERSION_STRING;
            compilationInfo.sizeOfpInt = sizeof(int*);

            compilationInfo.informationCompleted = true;
        }
};

/**
 * Used by Game Develop to create the extension class
 * -- Do not need to be modified. --
 */
extern "C" ExtensionBase * GD_EXTENSION_API CreateGDExtension() {
    return new Extension;
}

/**
 * Used by Game Develop to destroy the extension class
 * -- Do not need to be modified. --
 */
extern "C" void GD_EXTENSION_API DestroyGDExtension(ExtensionBase * p) {
    delete p;
}

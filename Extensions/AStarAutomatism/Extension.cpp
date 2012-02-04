/**

Game Develop - A Star Automatism Extension
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
#include "AStarAutomatism.h"
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
            DECLARE_THE_EXTENSION("AStarAutomatism",
                                  _("Automatisme de recherche de chemin ( Pathfinding A* )"),
                                  _("Automatisme permettant de déplacer les objets en évitant les obstacles."),
                                  "Compil Games",
                                  "zlib/libpng License ( Open Source )")

                DECLARE_AUTOMATISM("AStarAutomatism",
                          _("Recherche de chemin"),
                          _("AStar"),
                          _("Automatisme permettant de déplacer les objets en évitant les obstacles."),
                          "",
                          "Extensions/AStaricon.png",
                          AStarAutomatism,
                          SceneAStarDatas)

                    #if defined(GD_IDE_ONLY)

                    automatismInfo.SetIncludeFile("AStarAutomatism/AStarAutomatism.h");

                    DECLARE_AUTOMATISM_ACTION("SetDestination",
                                   _("Déplacement vers une position"),
                                   _("Déplace l'objet vers une position"),
                                   _("Déplacer _PARAM0_ vers _PARAM3_;_PARAM4_"),
                                   _("Déplacement"),
                                   "Extensions/AStaricon24.png",
                                   "Extensions/AStaricon16.png");

                        instrInfo.AddParameter("object", _("Objet"), "", false);
                        instrInfo.AddParameter("automatism", _("Automatisme"), "AStarAutomatism", false);
                        instrInfo.AddCodeOnlyParameter("currentScene", "");
                        instrInfo.AddParameter("expression", _("Position X de la destination"), "", false);
                        instrInfo.AddParameter("expression", _("Position Y de la destination"), "", false);

                        instrInfo.cppCallingInformation.SetFunctionName("MoveTo").SetIncludeFile("AStarAutomatism/AStarAutomatism.h");

                    DECLARE_END_AUTOMATISM_ACTION()

                    DECLARE_AUTOMATISM_ACTION("SetSpeed",
                                   _("Vitesse"),
                                   _("Change la vitesse de déplacement sur le chemin"),
                                   _("Faire _PARAM3__PARAM2_ à la vitesse de _PARAM0_ sur le chemin"),
                                   _("Déplacement"),
                                   "Extensions/AStaricon24.png",
                                   "Extensions/AStaricon16.png");

                        instrInfo.AddParameter("object", _("Objet"), "", false);
                        instrInfo.AddParameter("automatism", _("Automatisme"), "AStarAutomatism", false);
                        instrInfo.AddParameter("expression", _("Vitesse"), "", false);
                        instrInfo.AddParameter("operator", _("Signe de la modification"), "", false);

                        instrInfo.cppCallingInformation.SetFunctionName("SetSpeed").SetAssociatedGetter("GetSpeed").SetManipulatedType("number").SetIncludeFile("AStarAutomatism/AStarAutomatism.h");

                    DECLARE_END_AUTOMATISM_ACTION()

                    DECLARE_AUTOMATISM_CONDITION("Speed",
                                   _("Vitesse"),
                                   _("Teste la vitesse de déplacement sur le chemin"),
                                   _("La vitesse de déplacement de _PARAM0_ est _PARAM3_ à _PARAM2_"),
                                   _("Déplacement"),
                                   "Extensions/AStaricon24.png",
                                   "Extensions/AStaricon16.png");

                        instrInfo.AddParameter("object", _("Objet"), "", false);
                        instrInfo.AddParameter("automatism", _("Automatisme"), "AStarAutomatism", false);
                        instrInfo.AddParameter("expression", _("Vitesse"), "", false);
                        instrInfo.AddParameter("relationalOperator", _("Signe du test"), "", false);

                        instrInfo.cppCallingInformation.SetFunctionName("GetSpeed").SetManipulatedType("number").SetIncludeFile("AStarAutomatism/AStarAutomatism.h");


                    DECLARE_END_AUTOMATISM_CONDITION()

                    DECLARE_AUTOMATISM_ACTION("SetCost",
                                   _("Difficulté de passage"),
                                   _("Change la difficulté de passage au dessus de l'objet. 9 est un obstacle infranchissable."),
                                   _("Faire _PARAM3__PARAM2_ à la difficulté de passage au dessus de _PARAM0_"),
                                   _("Obstacles"),
                                   "Extensions/AStaricon24.png",
                                   "Extensions/AStaricon16.png");

                        instrInfo.AddParameter("object", _("Objet"), "", false);
                        instrInfo.AddParameter("automatism", _("Automatisme"), "AStarAutomatism", false);
                        instrInfo.AddParameter("expression", _("Difficulté ( 0 à 9 )"), "", false);
                        instrInfo.AddParameter("operator", _("Signe de la modification"), "", false);

                        instrInfo.cppCallingInformation.SetFunctionName("SetCost").SetAssociatedGetter("GetCost").SetManipulatedType("number").SetIncludeFile("AStarAutomatism/AStarAutomatism.h");

                    DECLARE_END_AUTOMATISM_ACTION()

                    DECLARE_AUTOMATISM_CONDITION("Cost",
                                   _("Difficulté de passage"),
                                   _("Teste la difficulté de passage au dessus de l'objet"),
                                   _("La difficulté de passage au dessus de _PARAM0_ est _PARAM3_ à _PARAM2_"),
                                   _("Obstacles"),
                                   "Extensions/AStaricon24.png",
                                   "Extensions/AStaricon16.png");

                        instrInfo.AddParameter("object", _("Objet"), "", false);
                        instrInfo.AddParameter("automatism", _("Automatisme"), "AStarAutomatism", false);
                        instrInfo.AddParameter("expression", _("Difficulté"), "", false);
                        instrInfo.AddParameter("relationalOperator", _("Signe du test"), "", false);

                        instrInfo.cppCallingInformation.SetFunctionName("GetCost").SetManipulatedType("number").SetIncludeFile("AStarAutomatism/AStarAutomatism.h");


                    DECLARE_END_AUTOMATISM_CONDITION()

                    DECLARE_AUTOMATISM_CONDITION("PathFound",
                                   _("Chemin trouvé"),
                                   _("Renvoi vrai si un chemin a été trouvé"),
                                   _("Un chemin a été trouvé pour _PARAM0_"),
                                   _("Déplacement"),
                                   "Extensions/AStaricon24.png",
                                   "Extensions/AStaricon16.png");

                        instrInfo.AddParameter("object", _("Objet"), "", false);
                        instrInfo.AddParameter("automatism", _("Automatisme"), "AStarAutomatism", false);

                        instrInfo.cppCallingInformation.SetFunctionName("PathFound").SetIncludeFile("AStarAutomatism/AStarAutomatism.h");

                    DECLARE_END_AUTOMATISM_CONDITION()

                    DECLARE_AUTOMATISM_CONDITION("DestinationReached",
                                   _("Destination atteinte"),
                                   _("Renvoi vrai si la destination de l'objet a été atteinte"),
                                   _("_PARAM0_ a atteint sa destination"),
                                   _("Déplacement"),
                                   "Extensions/AStaricon24.png",
                                   "Extensions/AStaricon16.png");

                        instrInfo.AddParameter("object", _("Objet"), "", false);
                        instrInfo.AddParameter("automatism", _("Automatisme"), "AStarAutomatism", false);

                        instrInfo.cppCallingInformation.SetFunctionName("DestinationReached").SetIncludeFile("AStarAutomatism/AStarAutomatism.h");

                    DECLARE_END_AUTOMATISM_CONDITION()
                    DECLARE_AUTOMATISM_ACTION("SetGridWidth",
                                   _("Largeur de la grille virtuelle"),
                                   _("Change la largeur des cellules de la grille virtuelle."),
                                   _("Faire _PARAM4__PARAM3_ à la largeur des cellules de la grille virtuelle"),
                                   _("Paramétrage global"),
                                   "Extensions/AStaricon24.png",
                                   "Extensions/AStaricon16.png");

                        instrInfo.AddParameter("object", _("Objet"), "", false);
                        instrInfo.AddParameter("automatism", _("Automatisme"), "AStarAutomatism", false);
                        instrInfo.AddCodeOnlyParameter("currentScene", "");
                        instrInfo.AddParameter("expression", _("Largeur ( pixels )"), "", false);
                        instrInfo.AddParameter("operator", _("Signe de la modification"), "", false);

                        instrInfo.cppCallingInformation.SetFunctionName("SetGridWidth").SetAssociatedGetter("GetGridWidth").SetManipulatedType("number").SetIncludeFile("AStarAutomatism/AStarAutomatism.h");


                    DECLARE_END_AUTOMATISM_ACTION()

                    DECLARE_AUTOMATISM_CONDITION("GridWidth",
                                   _("Largeur de la grille virtuelle"),
                                   _("Teste la largeur des cellules de la grille virtuelle."),
                                   _("La largeur des cellules de la grille virtuelle est _PARAM4_ à _PARAM3_"),
                                   _("Paramétrage global"),
                                   "Extensions/AStaricon24.png",
                                   "Extensions/AStaricon16.png");

                        instrInfo.AddParameter("object", _("Objet"), "", false);
                        instrInfo.AddParameter("automatism", _("Automatisme"), "AStarAutomatism", false);
                        instrInfo.AddCodeOnlyParameter("currentScene", "");
                        instrInfo.AddParameter("expression", _("Largeur ( pixels )"), "", false);
                        instrInfo.AddParameter("relationalOperator", _("Signe du test"), "", false);

                        instrInfo.cppCallingInformation.SetFunctionName("GetGridWidth").SetManipulatedType("number").SetIncludeFile("AStarAutomatism/AStarAutomatism.h");

                    DECLARE_END_AUTOMATISM_CONDITION()
                    DECLARE_AUTOMATISM_ACTION("SetGridHeight",
                                   _("Hauteur de la grille virtuelle"),
                                   _("Change la hauteur des cellules de la grille virtuelle."),
                                   _("Faire _PARAM4__PARAM3_ à la hauteur des cellules de la grille virtuelle"),
                                   _("Paramétrage global"),
                                   "Extensions/AStaricon24.png",
                                   "Extensions/AStaricon16.png");

                        instrInfo.AddParameter("object", _("Objet"), "", false);
                        instrInfo.AddParameter("automatism", _("Automatisme"), "AStarAutomatism", false);
                        instrInfo.AddCodeOnlyParameter("currentScene", "");
                        instrInfo.AddParameter("expression", _("Hauteur ( pixels )"), "", false);
                        instrInfo.AddParameter("operator", _("Signe de la modification"), "", false);

                        instrInfo.cppCallingInformation.SetFunctionName("SetGridHeight").SetAssociatedGetter("GetGridHeight").SetManipulatedType("number").SetIncludeFile("AStarAutomatism/AStarAutomatism.h");

                    DECLARE_END_AUTOMATISM_ACTION()

                    DECLARE_AUTOMATISM_CONDITION("GridHeight",
                                   _("Hauteur de la grille virtuelle"),
                                   _("Teste la hauteur des cellules de la grille virtuelle."),
                                   _("La hauteur des cellules de la grille virtuelle est _PARAM4_ à _PARAM3_"),
                                   _("Paramétrage global"),
                                   "Extensions/AStaricon24.png",
                                   "Extensions/AStaricon16.png");

                        instrInfo.AddParameter("object", _("Objet"), "", false);
                        instrInfo.AddParameter("automatism", _("Automatisme"), "AStarAutomatism", false);
                        instrInfo.AddCodeOnlyParameter("currentScene", "");
                        instrInfo.AddParameter("expression", _("Hauteur ( pixels )"), "", false);
                        instrInfo.AddParameter("relationalOperator", _("Signe du test"), "", false);

                        instrInfo.cppCallingInformation.SetFunctionName("GetGridHeight").SetManipulatedType("number").SetIncludeFile("AStarAutomatism/AStarAutomatism.h");

                    DECLARE_END_AUTOMATISM_CONDITION()

                    DECLARE_AUTOMATISM_ACTION("EnterSegment",
                                   _("Changer la position sur le chemin"),
                                   _("Change l'état d'avancement de l'objet sur le chemin calculé."),
                                   _("Faire _PARAM3__PARAM2_ à l'état de l'avancement de l'objet sur le chemin calculé"),
                                   _("Avancé"),
                                   "Extensions/AStaricon24.png",
                                   "Extensions/AStaricon16.png");

                        instrInfo.AddParameter("object", _("Objet"), "", false);
                        instrInfo.AddParameter("automatism", _("Automatisme"), "AStarAutomatism", false);
                        instrInfo.AddParameter("expression", _("Valeur"), "", false);
                        instrInfo.AddParameter("operator", _("Signe de la modification"), "", false);

                        instrInfo.cppCallingInformation.SetFunctionName("EnterSegment").SetAssociatedGetter("GetCurrentSegment").SetManipulatedType("number").SetIncludeFile("AStarAutomatism/AStarAutomatism.h");

                    DECLARE_END_AUTOMATISM_ACTION()

                    DECLARE_AUTOMATISM_CONDITION("LeftBorder",
                                   _("Bordure gauche"),
                                   _("Teste la taille, en cases virtuelles, de la bordure gauche de l'objet."),
                                   _("La bordure gauche de _PARAM0_ est _PARAM3_ à _PARAM2_"),
                                   _("Paramétrage"),
                                   "Extensions/AStaricon24.png",
                                   "Extensions/AStaricon16.png");

                        instrInfo.AddParameter("object", _("Objet"), "", false);
                        instrInfo.AddParameter("automatism", _("Automatisme"), "AStarAutomatism", false);
                        instrInfo.AddParameter("expression", _("Largeur ( en cases virtuelles )"), "", false);
                        instrInfo.AddParameter("relationalOperator", _("Signe du test"), "", false);

                    DECLARE_END_AUTOMATISM_CONDITION()

                    DECLARE_AUTOMATISM_CONDITION("RightBorder",
                                   _("Bordure droite"),
                                   _("Teste la taille, en cases virtuelles, de la bordure droite de l'objet."),
                                   _("La bordure droite de _PARAM0_ est _PARAM3_ à _PARAM2_"),
                                   _("Paramétrage"),
                                   "Extensions/AStaricon24.png",
                                   "Extensions/AStaricon16.png");

                        instrInfo.AddParameter("object", _("Objet"), "", false);
                        instrInfo.AddParameter("automatism", _("Automatisme"), "AStarAutomatism", false);
                        instrInfo.AddParameter("expression", _("Largeur ( en cases virtuelles )"), "", false);
                        instrInfo.AddParameter("relationalOperator", _("Signe du test"), "", false);

                    DECLARE_END_AUTOMATISM_CONDITION()

                    DECLARE_AUTOMATISM_CONDITION("TopBorder",
                                   _("Bordure haute"),
                                   _("Teste la taille, en cases virtuelles, de la bordure haute de l'objet."),
                                   _("La bordure haute de _PARAM0_ est _PARAM3_ à _PARAM2_"),
                                   _("Paramétrage"),
                                   "Extensions/AStaricon24.png",
                                   "Extensions/AStaricon16.png");

                        instrInfo.AddParameter("object", _("Objet"), "", false);
                        instrInfo.AddParameter("automatism", _("Automatisme"), "AStarAutomatism", false);
                        instrInfo.AddParameter("expression", _("Largeur ( en cases virtuelles )"), "", false);
                        instrInfo.AddParameter("relationalOperator", _("Signe du test"), "", false);

                    DECLARE_END_AUTOMATISM_CONDITION()

                    DECLARE_AUTOMATISM_CONDITION("BottomBorder",
                                   _("Bordure basse"),
                                   _("Teste la taille, en cases virtuelles, de la bordure basse de l'objet."),
                                   _("La bordure basse de _PARAM0_ est _PARAM3_ à _PARAM2_"),
                                   _("Paramétrage"),
                                   "Extensions/AStaricon24.png",
                                   "Extensions/AStaricon16.png");

                        instrInfo.AddParameter("object", _("Objet"), "", false);
                        instrInfo.AddParameter("automatism", _("Automatisme"), "AStarAutomatism", false);
                        instrInfo.AddParameter("expression", _("Largeur ( en cases virtuelles )"), "", false);
                        instrInfo.AddParameter("relationalOperator", _("Signe du test"), "", false);

                    DECLARE_END_AUTOMATISM_CONDITION()

                    DECLARE_AUTOMATISM_ACTION("SetLeftBorder",
                                   _("Bordure gauche"),
                                   _("Change la taille, en cases virtuelles, de la bordure gauche de l'objet."),
                                   _("Faire _PARAM3__PARAM2_ à taille de la bordure gauche de _PARAM0_"),
                                   _("Paramétrage"),
                                   "Extensions/AStaricon24.png",
                                   "Extensions/AStaricon16.png");

                        instrInfo.AddParameter("object", _("Objet"), "", false);
                        instrInfo.AddParameter("automatism", _("Automatisme"), "AStarAutomatism", false);
                        instrInfo.AddParameter("expression", _("Largeur ( Cases virtuelles )"), "", false);
                        instrInfo.AddParameter("operator", _("Signe de la modification"), "", false);

                        instrInfo.cppCallingInformation.SetFunctionName("SetLeftBorder").SetAssociatedGetter("GetLeftBorder").SetManipulatedType("number").SetIncludeFile("AStarAutomatism/AStarAutomatism.h");

                    DECLARE_END_AUTOMATISM_ACTION()

                    DECLARE_AUTOMATISM_ACTION("SetRightBorder",
                                   _("Bordure droite"),
                                   _("Change la taille, en cases virtuelles, de la bordure droite de l'objet."),
                                   _("Faire _PARAM3__PARAM2_ à taille de la bordure droite de _PARAM0_"),
                                   _("Paramétrage"),
                                   "Extensions/AStaricon24.png",
                                   "Extensions/AStaricon16.png");

                        instrInfo.AddParameter("object", _("Objet"), "", false);
                        instrInfo.AddParameter("automatism", _("Automatisme"), "AStarAutomatism", false);
                        instrInfo.AddParameter("expression", _("Largeur ( Cases virtuelles )"), "", false);
                        instrInfo.AddParameter("operator", _("Signe de la modification"), "", false);

                        instrInfo.cppCallingInformation.SetFunctionName("SetRightBorder").SetAssociatedGetter("GetRightBorder").SetManipulatedType("number").SetIncludeFile("AStarAutomatism/AStarAutomatism.h");


                    DECLARE_END_AUTOMATISM_ACTION()

                    DECLARE_AUTOMATISM_ACTION("SetTopBorder",
                                   _("Bordure haute"),
                                   _("Change la taille, en cases virtuelles, de la bordure haute de l'objet."),
                                   _("Faire _PARAM3__PARAM2_ à taille de la bordure haute de _PARAM0_"),
                                   _("Paramétrage"),
                                   "Extensions/AStaricon24.png",
                                   "Extensions/AStaricon16.png");

                        instrInfo.AddParameter("object", _("Objet"), "", false);
                        instrInfo.AddParameter("automatism", _("Automatisme"), "AStarAutomatism", false);
                        instrInfo.AddParameter("expression", _("Largeur ( Cases virtuelles )"), "", false);
                        instrInfo.AddParameter("operator", _("Signe de la modification"), "", false);

                        instrInfo.cppCallingInformation.SetFunctionName("SetTopBorder").SetAssociatedGetter("GetTopBorder").SetManipulatedType("number").SetIncludeFile("AStarAutomatism/AStarAutomatism.h");


                    DECLARE_END_AUTOMATISM_ACTION()

                    DECLARE_AUTOMATISM_ACTION("SetBottomBorder",
                                   _("Bordure basse"),
                                   _("Change la taille, en cases virtuelles, de la bordure basse de l'objet."),
                                   _("Faire _PARAM3__PARAM2_ à taille de la bordure basse de _PARAM0_"),
                                   _("Paramétrage"),
                                   "Extensions/AStaricon24.png",
                                   "Extensions/AStaricon16.png");

                        instrInfo.AddParameter("object", _("Objet"), "", false);
                        instrInfo.AddParameter("automatism", _("Automatisme"), "AStarAutomatism", false);
                        instrInfo.AddParameter("expression", _("Largeur ( Cases virtuelles )"), "", false);
                        instrInfo.AddParameter("operator", _("Signe de la modification"), "", false);

                        instrInfo.cppCallingInformation.SetFunctionName("SetBottomBorder").SetAssociatedGetter("GetBottomBorder").SetManipulatedType("number").SetIncludeFile("AStarAutomatism/AStarAutomatism.h");

                    DECLARE_END_AUTOMATISM_ACTION()

                    DECLARE_AUTOMATISM_EXPRESSION("Speed", _("Vitesse de déplacement"), _("Vitesse de déplacement sur le chemin"), _("Déplacement"), "Extensions/AStaricon16.png")
                        instrInfo.AddParameter("object", _("Objet"), "", false);
                        instrInfo.AddParameter("automatism", _("Automatisme"), "AStarAutomatism", false);

                        instrInfo.cppCallingInformation.SetFunctionName("GetSpeed").SetIncludeFile("AStarAutomatism/AStarAutomatism.h");

                    DECLARE_END_AUTOMATISM_EXPRESSION()

                    DECLARE_AUTOMATISM_EXPRESSION("Cost", _("Difficulté de passage"), _("Difficulté de passage au dessus de l'objet"), _("Obstacles"), "Extensions/AStaricon16.png")
                        instrInfo.AddParameter("object", _("Objet"), "", false);
                        instrInfo.AddParameter("automatism", _("Automatisme"), "AStarAutomatism", false);

                        instrInfo.cppCallingInformation.SetFunctionName("GetCost").SetIncludeFile("AStarAutomatism/AStarAutomatism.h");
                    DECLARE_END_AUTOMATISM_EXPRESSION()

                    DECLARE_AUTOMATISM_EXPRESSION("LastNodeX", _("Position X du dernier point de passage"), _("Position X du dernier point de passage"), _("Déplacement"), "Extensions/AStaricon16.png")
                        instrInfo.AddParameter("object", _("Objet"), "", false);
                        instrInfo.AddParameter("automatism", _("Automatisme"), "AStarAutomatism", false);

                        instrInfo.cppCallingInformation.SetFunctionName("GetLastNodeX").SetIncludeFile("AStarAutomatism/AStarAutomatism.h");
                    DECLARE_END_AUTOMATISM_EXPRESSION()

                    DECLARE_AUTOMATISM_EXPRESSION("LastNodeY", _("Position Y du dernier point de passage"), _("Position Y du dernier point de passage"), _("Déplacement"), "Extensions/AStaricon16.png")
                        instrInfo.AddParameter("object", _("Objet"), "", false);
                        instrInfo.AddParameter("automatism", _("Automatisme"), "AStarAutomatism", false);

                        instrInfo.cppCallingInformation.SetFunctionName("GetLastNodeY").SetIncludeFile("AStarAutomatism/AStarAutomatism.h");
                    DECLARE_END_AUTOMATISM_EXPRESSION()

                    DECLARE_AUTOMATISM_EXPRESSION("NextNodeX", _("Position X du prochain point de passage"), _("Position X du prochain point de passage"), _("Déplacement"), "Extensions/AStaricon16.png")
                        instrInfo.AddParameter("object", _("Objet"), "", false);
                        instrInfo.AddParameter("automatism", _("Automatisme"), "AStarAutomatism", false);

                        instrInfo.cppCallingInformation.SetFunctionName("GetNextNodeX").SetIncludeFile("AStarAutomatism/AStarAutomatism.h");
                    DECLARE_END_AUTOMATISM_EXPRESSION()

                    DECLARE_AUTOMATISM_EXPRESSION("NextNodeY", _("Position Y du prochain point de passage"), _("Position Y du prochain point de passage"), _("Déplacement"), "Extensions/AStaricon16.png")
                        instrInfo.AddParameter("object", _("Objet"), "", false);
                        instrInfo.AddParameter("automatism", _("Automatisme"), "AStarAutomatism", false);

                        instrInfo.cppCallingInformation.SetFunctionName("GetNextNodeY").SetIncludeFile("AStarAutomatism/AStarAutomatism.h");
                    DECLARE_END_AUTOMATISM_EXPRESSION()

                    DECLARE_AUTOMATISM_EXPRESSION("DestinationX", _("Position X de la destination"), _("Position X de la destination"), _("Déplacement"), "Extensions/AStaricon16.png")
                        instrInfo.AddParameter("object", _("Objet"), "", false);
                        instrInfo.AddParameter("automatism", _("Automatisme"), "AStarAutomatism", false);

                        instrInfo.cppCallingInformation.SetFunctionName("GetDestinationX").SetIncludeFile("AStarAutomatism/AStarAutomatism.h");
                    DECLARE_END_AUTOMATISM_EXPRESSION()

                    DECLARE_AUTOMATISM_EXPRESSION("DestinationY", _("Position Y de la destination"), _("Position Y de la destination"), _("Déplacement"), "Extensions/AStaricon16.png")
                        instrInfo.AddParameter("object", _("Objet"), "", false);
                        instrInfo.AddParameter("automatism", _("Automatisme"), "AStarAutomatism", false);

                        instrInfo.cppCallingInformation.SetFunctionName("GetDestinationY").SetIncludeFile("AStarAutomatism/AStarAutomatism.h");
                    DECLARE_END_AUTOMATISM_EXPRESSION()

                    DECLARE_AUTOMATISM_EXPRESSION("GridWidth", _("Largeur de la grille virtuelle"), _("Largeur de la grille virtuelle"), _("Paramétrage global"), "Extensions/AStaricon16.png")
                        instrInfo.AddCodeOnlyParameter("currentScene", "");
                        instrInfo.AddParameter("object", _("Objet"), "", false);
                        instrInfo.AddParameter("automatism", _("Automatisme"), "AStarAutomatism", false);

                        instrInfo.cppCallingInformation.SetFunctionName("GetGridWidth").SetIncludeFile("AStarAutomatism/AStarAutomatism.h");
                    DECLARE_END_AUTOMATISM_EXPRESSION()

                    DECLARE_AUTOMATISM_EXPRESSION("GridHeight", _("Hauteur de la grille virtuelle"), _("Hauteur de la grille virtuelle"), _("Paramétrage global"), "Extensions/AStaricon16.png")
                        instrInfo.AddCodeOnlyParameter("currentScene", "");
                        instrInfo.AddParameter("object", _("Objet"), "", false);
                        instrInfo.AddParameter("automatism", _("Automatisme"), "AStarAutomatism", false);

                        instrInfo.cppCallingInformation.SetFunctionName("GetGridHeight").SetIncludeFile("AStarAutomatism/AStarAutomatism.h");
                    DECLARE_END_AUTOMATISM_EXPRESSION()

                    DECLARE_AUTOMATISM_EXPRESSION("LeftBorder", _("Bordure gauche"), _("Bordure gauche"), _("Paramétrage"), "Extensions/AStaricon16.png")
                        instrInfo.AddParameter("object", _("Objet"), "", false);
                        instrInfo.AddParameter("automatism", _("Automatisme"), "AStarAutomatism", false);

                        instrInfo.cppCallingInformation.SetFunctionName("GetLeftBorder").SetIncludeFile("AStarAutomatism/AStarAutomatism.h");
                    DECLARE_END_AUTOMATISM_EXPRESSION()
                    DECLARE_AUTOMATISM_EXPRESSION("RightBorder", _("Bordure droite"), _("Bordure droite"), _("Paramétrage"), "Extensions/AStaricon16.png")
                        instrInfo.AddParameter("object", _("Objet"), "", false);
                        instrInfo.AddParameter("automatism", _("Automatisme"), "AStarAutomatism", false);

                        instrInfo.cppCallingInformation.SetFunctionName("GetRightBorder").SetIncludeFile("AStarAutomatism/AStarAutomatism.h");
                    DECLARE_END_AUTOMATISM_EXPRESSION()
                    DECLARE_AUTOMATISM_EXPRESSION("TopBorder", _("Bordure haute"), _("Bordure haute"), _("Paramétrage"), "Extensions/AStaricon16.png")
                        instrInfo.AddParameter("object", _("Objet"), "", false);
                        instrInfo.AddParameter("automatism", _("Automatisme"), "AStarAutomatism", false);

                        instrInfo.cppCallingInformation.SetFunctionName("GetTopBorder").SetIncludeFile("AStarAutomatism/AStarAutomatism.h");
                    DECLARE_END_AUTOMATISM_EXPRESSION()
                    DECLARE_AUTOMATISM_EXPRESSION("BottomBorder", _("Bordure basse"), _("Bordure basse"), _("Paramétrage"), "Extensions/AStaricon16.png")
                        instrInfo.AddParameter("object", _("Objet"), "", false);
                        instrInfo.AddParameter("automatism", _("Automatisme"), "AStarAutomatism", false);

                        instrInfo.cppCallingInformation.SetFunctionName("GetBottomBorder").SetIncludeFile("AStarAutomatism/AStarAutomatism.h");
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

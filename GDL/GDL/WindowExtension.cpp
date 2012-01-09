/** \file
 *  Game Develop
 *  2008-2012 Florian Rival (Florian.Rival@gmail.com)
 */

#include "GDL/WindowExtension.h"
#include "GDL/IDE/ArbitraryResourceWorker.h"
#include "GDL/IDE/Instruction.h"

WindowExtension::WindowExtension()
{
    DECLARE_THE_EXTENSION("BuiltinWindow",
                          _("Fonctionnalités de fenêtrage"),
                          _("Extension permettant de manipuler la fenêtre de jeu, integrée en standard"),
                          "Compil Games",
                          "Freeware")
    #if defined(GD_IDE_ONLY)

    DECLARE_ACTION("EcrireTexte",
                   _("Afficher un texte"),
                   _("Affiche le texte spécifié à l'écran."),
                   _("Afficher _PARAM1_ en _PARAM2_;_PARAM3_ ( couleur : _PARAM4_ , taille : _PARAM5_, police : _PARAM6_ )"),
                   _("Scène"),
                   "res/actions/texte24.png",
                   "res/actions/texte.png");

        instrInfo.AddCodeOnlyParameter("currentScene", "");
        instrInfo.AddParameter("string", _("Texte"), "",false);
        instrInfo.AddParameter("expression", _("Position X"), "",false);
        instrInfo.AddParameter("expression", _("Position Y"), "",false);
        instrInfo.AddParameter("color", _("Couleur"), "",false);
        instrInfo.AddParameter("expression", _("Taille"), "",false);
        instrInfo.AddParameter("police", _("Police"), "",true);
        instrInfo.AddParameter("layer", _("Calque ( Calque de base si vide )"), "",true).SetDefaultValue("\"\"");

        instrInfo.cppCallingInformation.SetFunctionName("DisplayLegacyTextOnScene").SetIncludeFile("GDL/RuntimeSceneTools.h");

    DECLARE_END_ACTION()

    DECLARE_ACTION("SetFullScreen",
                   _("(Dés)Activer le plein écran"),
                   _("Cette action active ou désactive l'affichage du jeu en plein écran."),
                   _("Activer le plein écran :  _PARAM1_"),
                   _("Fenêtre de jeu"),
                   "res/actions/fullscreen24.png",
                   "res/actions/fullscreen.png");

        instrInfo.AddCodeOnlyParameter("currentScene", "");
        instrInfo.AddParameter("yesorno", _("Activer le plein écran"), "",false);

        instrInfo.cppCallingInformation.SetFunctionName("SetFullScreen").SetIncludeFile("GDL/RuntimeSceneTools.h");

    DECLARE_END_ACTION()

    DECLARE_ACTION("SetWindowSize",
                   _("Changer la taille de l'écran"),
                   _("Cette action change la taille de la fenêtre de jeu."),
                   _("Changer la taille de la fenêtre de jeu en _PARAM1_x_PARAM2_"),
                   _("Fenêtre de jeu"),
                   "res/actions/window24.png",
                   "res/actions/window.png");

        instrInfo.AddCodeOnlyParameter("currentScene", "");
        instrInfo.AddParameter("expression", _("Largeur"), "",false);
        instrInfo.AddParameter("expression", _("Hauteur"), "",false);
        instrInfo.AddParameter("yesorno", _("Utiliser cette taille pour la taille par défaut des caméras des scènes ?"), "",false);

        instrInfo.cppCallingInformation.SetFunctionName("SetWindowSize").SetIncludeFile("GDL/RuntimeSceneTools.h");

    DECLARE_END_ACTION()
    DECLARE_ACTION("SetWindowIcon",
                   _("Changer l'icône de la fenêtre"),
                   _("Cette action change l'icône de la fenêtre de jeu."),
                   _("Utiliser _PARAM1_ en tant qu'icone pour la fenêtre de jeu."),
                   _("Fenêtre de jeu"),
                   "res/actions/window24.png",
                   "res/actions/window.png");

        instrInfo.AddCodeOnlyParameter("currentScene", "");
        instrInfo.AddParameter("string", _("Nom de l'image à utiliser en tant qu'icône"), "",false);

        instrInfo.cppCallingInformation.SetFunctionName("SetWindowIcon").SetIncludeFile("GDL/RuntimeSceneTools.h");

    DECLARE_END_ACTION()

    DECLARE_ACTION("SetWindowTitle",
                   _("Changer le titre de la fenêtre"),
                   _("Cette action change le titre de la fenêtre de jeu."),
                   _("Changer le titre de la fenêtre en _PARAM1_"),
                   _("Fenêtre de jeu"),
                   "res/actions/window24.png",
                   "res/actions/window.png");

        instrInfo.AddCodeOnlyParameter("currentScene", "");
        instrInfo.AddParameter("string", _("Nouveau titre"), "",false);

        instrInfo.cppCallingInformation.SetFunctionName("SetWindowTitle").SetIncludeFile("GDL/RuntimeSceneTools.h");

    DECLARE_END_ACTION()

    DECLARE_EXPRESSION("SceneWindowWidth", "Largeur de la fenêtre de la scène", "Largeur de la fenêtre de la scène", "Ecran", "res/display16.png")
        instrInfo.AddCodeOnlyParameter("currentScene", "");

        instrInfo.cppCallingInformation.SetFunctionName("GetSceneWindowWidth").SetIncludeFile("GDL/RuntimeSceneTools.h");
    DECLARE_END_EXPRESSION()
    DECLARE_EXPRESSION("SceneWindowHeight", "Hauteur de la fenêtre de la scène", "Hauteur de la fenêtre de la scène", "Ecran", "res/display16.png")
        instrInfo.AddCodeOnlyParameter("currentScene", "");

        instrInfo.cppCallingInformation.SetFunctionName("GetSceneWindowHeight").SetIncludeFile("GDL/RuntimeSceneTools.h");
    DECLARE_END_EXPRESSION()

    DECLARE_EXPRESSION("ScreenWidth", "Largeur de la résolution actuelle", "Largeur de la résolution actuelle", "Ecran", "res/display16.png")
        instrInfo.cppCallingInformation.SetFunctionName("GetScreenWidth").SetIncludeFile("GDL/RuntimeSceneTools.h");
    DECLARE_END_EXPRESSION()
    DECLARE_EXPRESSION("ScreenHeight", "Hauteur de la résolution actuelle", "Hauteur de la résolution actuelle", "Ecran", "res/display16.png")
        instrInfo.cppCallingInformation.SetFunctionName("GetScreenHeight").SetIncludeFile("GDL/RuntimeSceneTools.h");
    DECLARE_END_EXPRESSION()
    DECLARE_EXPRESSION("ColorDepth", "Profondeur de couleur de la résolution actuelle", "Profondeur de couleur de la résolution actuelle", "Ecran", "res/display16.png")
        instrInfo.cppCallingInformation.SetFunctionName("GetColorDepth").SetIncludeFile("GDL/RuntimeSceneTools.h");
    DECLARE_END_EXPRESSION()
    DECLARE_STR_EXPRESSION("WindowTitle", "Titre de la fenêtre", "Titre de la fenêtre", "Ecran", "res/display16.png")
        instrInfo.AddCodeOnlyParameter("currentScene", "");

        instrInfo.cppCallingInformation.SetFunctionName("GetWindowTitle").SetIncludeFile("GDL/RuntimeSceneTools.h");
    DECLARE_END_STR_EXPRESSION()
    #endif
}

#if defined(GD_IDE_ONLY)
void WindowExtension::ExposeActionsResources(Instruction & action, ArbitraryResourceWorker & worker)
{
    if ( action.GetType() == "EcrireTexte" && !action.GetParameterSafely( 6 ).GetPlainString().empty() )
    {
        std::string parameter = action.GetParameter(6).GetPlainString();
        worker.ExposeResource(parameter);
        action.SetParameter(6, parameter);
    }
    if ( action.GetType() == "SetWindowIcon" && !action.GetParameterSafely( 1 ).GetPlainString().empty() )
    {
        std::string parameter = action.GetParameter(1).GetPlainString();
        worker.ExposeImage(parameter);
        action.SetParameter(1, parameter);
    }
}
#endif

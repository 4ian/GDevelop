#include "GDL/WindowExtension.h"
#include "GDL/aTexte.h"
#include "GDL/aWindow.h"
#include "GDL/eFreeFunctions.h"
#include "GDL/actions.h"
#include "GDL/ResourcesMergingHelper.h"
#include "GDL/Instruction.h"

WindowExtension::WindowExtension()
{
    DECLARE_THE_EXTENSION("BuiltinWindow",
                          _T("Fonctionnalités de fenêtrage"),
                          _T("Extension permettant de manipuler la fenêtre de jeu, integrée en standard"),
                          "Compil Games",
                          "Freeware")

    DECLARE_ACTION("EcrireTexte",
                   _T("Afficher un texte"),
                   _T("Affiche le texte spécifié à l'écran."),
                   _T("Afficher _PARAM0_ en _PARAM1_;_PARAM2_ ( couleur : _PARAM3_ , taille : _PARAM4_, police : _PARAM5_ )"),
                   _T("Scène"),
                   "res/actions/texte24.png",
                   "res/actions/texte.png",
                   &ActEcrireTexte);

        DECLARE_PARAMETER("text", _T("Texte"), false, "")
        DECLARE_PARAMETER("expression", _T("Position X"), false, "")
        DECLARE_PARAMETER("expression", _T("Position Y"), false, "")
        DECLARE_PARAMETER("color", _T("Couleur"), false, "")
        DECLARE_PARAMETER("expression", _T("Taille"), false, "")
        DECLARE_PARAMETER_OPTIONAL("police", _T("Police"), false, "")
        DECLARE_PARAMETER_OPTIONAL("layer", _T("Calque ( Calque de base si vide )"), false, "")

    DECLARE_END_ACTION()

    DECLARE_ACTION("SetFullScreen",
                   _T("(Dés)Activer le plein écran"),
                   _T("Cette action active ou désactive l'affichage du jeu en plein écran."),
                   _T("Activer le plein écran :  _PARAM0_"),
                   _T("Fenêtre de jeu"),
                   "res/actions/fullscreen24.png",
                   "res/actions/fullscreen.png",
                   &ActSetFullScreen);

        DECLARE_PARAMETER("yesorno", _T("Activer le plein écran"), false, "")

    DECLARE_END_ACTION()

    DECLARE_ACTION("SetWindowSize",
                   _T("Changer la taille de l'écran"),
                   _T("Cette action change la taille de la fenêtre de jeu."),
                   _T("Changer la taille de la fenêtre de jeu en _PARAM0_x_PARAM1_"),
                   _T("Fenêtre de jeu"),
                   "res/actions/window24.png",
                   "res/actions/window.png",
                   &ActSetWindowSize);

        DECLARE_PARAMETER("expression", _T("Largeur"), false, "")
        DECLARE_PARAMETER("expression", _T("Hauteur"), false, "")
        DECLARE_PARAMETER("yesorno", _T("Utiliser cette taille pour la taille par défaut des caméras des scènes ?"), false, "")

    DECLARE_END_ACTION()

    DECLARE_EXPRESSION("ScreenWidth", "Largeur de la résolution actuelle", "Largeur de la résolution actuelle", "Ecran", "res/display16.png", &ExpGetScreenWidth)
    DECLARE_END_EXPRESSION()
    DECLARE_EXPRESSION("ScreenHeight", "Hauteur de la résolution actuelle", "Hauteur de la résolution actuelle", "Ecran", "res/display16.png", &ExpGetScreenHeight)
    DECLARE_END_EXPRESSION()
    DECLARE_EXPRESSION("ColorDepth", "Profondeur de couleur de la résolution actuelle", "Profondeur de couleur de la résolution actuelle", "Ecran", "res/display16.png", &ExpGetScreenColorDepth)
    DECLARE_END_EXPRESSION()
}

#if defined(GD_IDE_ONLY)
void WindowExtension::PrepareActionsResourcesForMerging(Instruction & action, ResourcesMergingHelper & resourcesMergingHelper)
{
    if ( action.GetType() == "EcrireTexte" && !action.GetParameterSafely( 5 ).GetPlainString().empty() )
        action.SetParameter( 5, resourcesMergingHelper.GetNewFilename( action.GetParameterSafely( 5 ).GetPlainString() ) );
}
#endif

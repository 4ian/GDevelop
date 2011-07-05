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
                          _("Fonctionnalités de fenêtrage"),
                          _("Extension permettant de manipuler la fenêtre de jeu, integrée en standard"),
                          "Compil Games",
                          "Freeware")

    DECLARE_ACTION("EcrireTexte",
                   _("Afficher un texte"),
                   _("Affiche le texte spécifié à l'écran."),
                   _("Afficher _PARAM0_ en _PARAM1_;_PARAM2_ ( couleur : _PARAM3_ , taille : _PARAM4_, police : _PARAM5_ )"),
                   _("Scène"),
                   "res/actions/texte24.png",
                   "res/actions/texte.png",
                   &ActEcrireTexte);

        DECLARE_PARAMETER("string", _("Texte"), "",false)
        DECLARE_PARAMETER("expression", _("Position X"), "",false)
        DECLARE_PARAMETER("expression", _("Position Y"), "",false)
        DECLARE_PARAMETER("color", _("Couleur"), "",false)
        DECLARE_PARAMETER("expression", _("Taille"), "",false)
        DECLARE_PARAMETER_OPTIONAL("police", _("Police"), "",false)
        DECLARE_PARAMETER_OPTIONAL("layer", _("Calque ( Calque de base si vide )"), "",false)

    DECLARE_END_ACTION()

    DECLARE_ACTION("SetFullScreen",
                   _("(Dés)Activer le plein écran"),
                   _("Cette action active ou désactive l'affichage du jeu en plein écran."),
                   _("Activer le plein écran :  _PARAM0_"),
                   _("Fenêtre de jeu"),
                   "res/actions/fullscreen24.png",
                   "res/actions/fullscreen.png",
                   &ActSetFullScreen);

        DECLARE_PARAMETER("yesorno", _("Activer le plein écran"), "",false)

    DECLARE_END_ACTION()

    DECLARE_ACTION("SetWindowSize",
                   _("Changer la taille de l'écran"),
                   _("Cette action change la taille de la fenêtre de jeu."),
                   _("Changer la taille de la fenêtre de jeu en _PARAM0_x_PARAM1_"),
                   _("Fenêtre de jeu"),
                   "res/actions/window24.png",
                   "res/actions/window.png",
                   &ActSetWindowSize);

        DECLARE_PARAMETER("expression", _("Largeur"), "",false)
        DECLARE_PARAMETER("expression", _("Hauteur"), "",false)
        DECLARE_PARAMETER("yesorno", _("Utiliser cette taille pour la taille par défaut des caméras des scènes ?"), "",false)

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

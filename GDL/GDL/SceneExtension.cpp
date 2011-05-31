#include "GDL/SceneExtension.h"
#include "GDL/aWindow.h"
#include "GDL/actions.h"
#include "GDL/conditions.h"
#include "GDL/cScene.h"
#include "GDL/aScene.h"
#include "GDL/ExtensionBase.h"

SceneExtension::SceneExtension()
{
    DECLARE_THE_EXTENSION("BuiltinScene",
                          _T("Fonctionnalités de manipulation des scènes"),
                          _T("Extension permettant de manipuler les scènes, integrée en standard"),
                          "Compil Games",
                          "Freeware")

    DECLARE_CONDITION("DepartScene",
                   _T("Au lancement de la scène"),
                   _T("Est vrai uniquement quand la scène vient juste d'être lancée."),
                   _T("Au lancement de la scène"),
                   _T("Scène"),
                   "res/conditions/depart24.png",
                   "res/conditions/depart.png",
                   &CondSceneBegins);

    DECLARE_END_CONDITION()

    DECLARE_CONDITION("Egal",
                   _T("Comparaisons d'expressions"),
                   _T("Teste les deux expressions"),
                   _T("_PARAM0_ _PARAM2_ _PARAM1_"),
                   _T("Autre"),
                   "res/conditions/egal24.png",
                   "res/conditions/egal.png",
                   &CondEgal);

        DECLARE_PARAMETER("expression", _T("Expression 1"), false, "")
        DECLARE_PARAMETER("expression", _T("Expression 2"), false, "")
        DECLARE_PARAMETER("signe", _T("Signe du test"), false, "")

    DECLARE_END_CONDITION()

    DECLARE_ACTION("Scene",
                   _T("Aller à une scène"),
                   _T("Change et démarre la scène spécifiée."),
                   _T("Aller à la scène _PARAM0_"),
                   _T("Scène"),
                   "res/actions/goscene24.png",
                   "res/actions/goscene.png",
                   &ActScene);

        DECLARE_PARAMETER("text", _T("Nom de la scène"), false, "")

    DECLARE_END_ACTION()

    DECLARE_ACTION("Quit",
                   _T("Quitter le jeu"),
                   _T("Quitte le jeu."),
                   _T("Quitter le jeu"),
                   _T("Scène"),
                   "res/actions/quit24.png",
                   "res/actions/quit.png",
                   &ActQuit);

    DECLARE_END_ACTION()

    DECLARE_ACTION("SceneBackground",
                   _T("Changer la couleur d'arrière plan"),
                   _T("Remplace la couleur d'arrière plan de la scène par celle indiquée."),
                   _T("Remplacer la couleur d'arrière plan par _PARAM0_"),
                   _T("Scène"),
                   "res/actions/background24.png",
                   "res/actions/background.png",
                   &ActSceneBackground);

        DECLARE_PARAMETER("color", _T("Couleur"), false, "")

    DECLARE_END_ACTION()
}

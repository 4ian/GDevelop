#include "GDL/SceneExtension.h"
#include "GDL/aWindow.h"
#include "GDL/actions.h"
#include "GDL/conditions.h"

#include "GDL/ExtensionBase.h"

SceneExtension::SceneExtension()
{
    DECLARE_THE_EXTENSION("BuiltinScene",
                          _("Fonctionnalités de manipulation des scènes"),
                          _("Extension permettant de manipuler les scènes, integrée en standard"),
                          "Compil Games",
                          "Freeware")

    DECLARE_CONDITION("DepartScene",
                   _("Au lancement de la scène"),
                   _("Est vrai uniquement quand la scène vient juste d'être lancée."),
                   _("Au lancement de la scène"),
                   _("Scène"),
                   "res/conditions/depart24.png",
                   "res/conditions/depart.png",
                   &CondSceneBegins);

    DECLARE_END_CONDITION()

    DECLARE_CONDITION("Egal",
                   _("Comparaisons d'expressions"),
                   _("Teste les deux expressions"),
                   _("_PARAM0_ _PARAM2_ _PARAM1_"),
                   _("Autre"),
                   "res/conditions/egal24.png",
                   "res/conditions/egal.png",
                   &CondEgal);

        DECLARE_PARAMETER("expression", _("Expression 1"), false, "")
        DECLARE_PARAMETER("expression", _("Expression 2"), false, "")
        DECLARE_PARAMETER("signe", _("Signe du test"), false, "")

    DECLARE_END_CONDITION()

    DECLARE_ACTION("Scene",
                   _("Aller à une scène"),
                   _("Change et démarre la scène spécifiée."),
                   _("Aller à la scène _PARAM0_"),
                   _("Scène"),
                   "res/actions/goscene24.png",
                   "res/actions/goscene.png",
                   NULL);

        DECLARE_PARAMETER("", _("Nom de la scène"), false, "")

    DECLARE_END_ACTION()

    DECLARE_ACTION("Quit",
                   _("Quitter le jeu"),
                   _("Quitte le jeu."),
                   _("Quitter le jeu"),
                   _("Scène"),
                   "res/actions/quit24.png",
                   "res/actions/quit.png",
                   NULL);

    DECLARE_END_ACTION()

    DECLARE_ACTION("SceneBackground",
                   _("Changer la couleur d'arrière plan"),
                   _("Remplace la couleur d'arrière plan de la scène par celle indiquée."),
                   _("Remplacer la couleur d'arrière plan par _PARAM0_"),
                   _("Scène"),
                   "res/actions/background24.png",
                   "res/actions/background.png",
                   &ActSceneBackground);

        DECLARE_PARAMETER("color", _("Couleur"), false, "")

    DECLARE_END_ACTION()
}

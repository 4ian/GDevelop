#include "GDL/AdvancedExtension.h"
#include "GDL/ExtensionBase.h"
#include "GDL/cScene.h"

AdvancedExtension::AdvancedExtension()
{
    DECLARE_THE_EXTENSION("BuiltinAdvanced",
                          _("Fonctionnalités de contrôle avancé"),
                          _("Extension offrant des fonctionnalités de contrôle avancé, integrée en standard"),
                          "Compil Games",
                          "Freeware")

    DECLARE_CONDITION("ForEach",
                   _("Répéter pour chaque objet"),
                   _("Condition spéciale qui répète les conditions actions suivantes pour chaque objet concerné."),
                   _("Pour chaque _PARAM0_, répéter les conditions et actions suivantes :"),
                   _("Avancé"),
                   "res/conditions/foreach24.png",
                   "res/conditions/foreach.png",
                   NULL);

        DECLARE_PARAMETER("objet", _("Objet"), true, "")

    DECLARE_END_CONDITION()

    DECLARE_ACTION("ForEach",
                   _("Répéter pour chaque objet"),
                   _("Action spéciale qui répète les actions suivantes pour chaque objet concerné."),
                   _("Pour chaque _PARAM0_, répéter les actions suivantes :"),
                   _("Avancé"),
                   "res/actions/foreach24.png",
                   "res/actions/foreach.png",
                   NULL);

        DECLARE_PARAMETER("objet", _("Objet"), true, "")

    DECLARE_END_ACTION()

    DECLARE_CONDITION("While",
                   _("Tant que"),
                   _("Condition spéciale qui répète les conditions et actions suivantes tant que\nla condition qui la suit est remplie ou non."),
                   _("Tant que la condition suivante est _PARAM0_, répéter les conditions et actions suivantes :"),
                   _("Avancé"),
                   "res/conditions/while24.png",
                   "res/conditions/while.png",
                   NULL);

        DECLARE_PARAMETER("trueorfalse", _("La condition suivante doit être"), false, "")

    DECLARE_END_CONDITION()

    DECLARE_CONDITION("Repeat",
                   _("Répéter"),
                   _("Condition spéciale qui répète les conditions et actions suivantes un certain nombre de fois."),
                   _("Répéter _PARAM0_ fois les conditions et actions suivantes :"),
                   _("Avancé"),
                   "res/conditions/repeat24.png",
                   "res/conditions/repeat.png",
                   NULL);

        DECLARE_PARAMETER("expression", _("Nombre de répétition"), false, "")

    DECLARE_END_CONDITION()

    DECLARE_ACTION("Repeat",
                   _("Répéter"),
                   _("Action spéciale qui répète les actions suivantes un certain nombre de fois."),
                   _("Répéter _PARAM0_ fois les actions suivantes :"),
                   _("Avancé"),
                   "res/actions/repeat24.png",
                   "res/actions/repeat.png",
                   NULL);

        DECLARE_PARAMETER("expression", _("Nombre de répétition"), false, "")

    DECLARE_END_ACTION()

    DECLARE_CONDITION("Toujours",
                   _("Toujours"),
                   _("Cette condition renvoie toujours vrai."),
                   _("Toujours"),
                   _("Autre"),
                   "res/conditions/toujours24.png",
                   "res/conditions/toujours.png",
                   &CondAlways);

    DECLARE_END_CONDITION()
}

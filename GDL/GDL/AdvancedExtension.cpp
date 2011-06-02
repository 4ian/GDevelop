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

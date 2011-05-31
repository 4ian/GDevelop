#include "GDL/AdvancedExtension.h"
#include "GDL/ExtensionBase.h"
#include "GDL/cScene.h"

AdvancedExtension::AdvancedExtension()
{
    DECLARE_THE_EXTENSION("BuiltinAdvanced",
                          _T("Fonctionnalités de contrôle avancé"),
                          _T("Extension offrant des fonctionnalités de contrôle avancé, integrée en standard"),
                          "Compil Games",
                          "Freeware")

    DECLARE_CONDITION("Toujours",
                   _T("Toujours"),
                   _T("Cette condition renvoie toujours vrai."),
                   _T("Toujours"),
                   _T("Autre"),
                   "res/conditions/toujours24.png",
                   "res/conditions/toujours.png",
                   &CondAlways);

    DECLARE_END_CONDITION()
}

#include "GDL/BaseObjectExtension.h"
#include "GDL/ExtensionBase.h"
#include "GDL/Object.h"

BaseObjectExtension::BaseObjectExtension()
{
    DECLARE_THE_EXTENSION("BuiltinObject",
                          _("Objet de base"),
                          _("Objet de base integré en standard"),
                          "Compil Games",
                          "Freeware")

    DeclareExtensionFirstPart();
    DeclareExtensionSecondPart();
}

void BaseObjectExtension::DeclareExtensionSecondPart()
{
}

void BaseObjectExtension::DeclareExtensionFirstPart()
{
    //Declaration of all objects available
    DECLARE_OBJECT("",
                   _("Objet de base"),
                   _("Objet de base"),
                   "res/objeticon24.png",
                   &CreateBaseObject,
                   &DestroyBaseObject);

        DECLARE_OBJECT_CONDITION("PosX",
                       _("Tester la position X d'un objet"),
                       _("Teste si la position X de l'objet correspond au test effectué."),
                       _("La position X de l'objet _PARAM0_ est _PARAM2_ à _PARAM1_"),
                       _("Position"),
                       "res/conditions/position24.png",
                       "res/conditions/position.png",
                       "GetX");

            DECLARE_PARAMETER("object", _("Objet"), true, "")
            DECLARE_PARAMETER("expression", _("Position X"), false, "")
            DECLARE_PARAMETER("signe", _("Signe du test"), false, "")
            MAIN_OBJECTS_IN_PARAMETER(0)

        DECLARE_END_OBJECT_CONDITION()

        DECLARE_OBJECT_ACTION("MettreX",
                       _("Position X d'un objet"),
                       _("Change la position x d'un objet."),
                       _("Faire _PARAM2__PARAM1_ à la position X de l'objet _PARAM0_"),
                       _("Position"),
                       "res/actions/position24.png",
                       "res/actions/position.png",
                       "SetX");

            DECLARE_PARAMETER("object", _("Objet"), true, "")
            DECLARE_PARAMETER("expression", _("Valeur"), false, "")
            DECLARE_PARAMETER("signe", _("Signe de la modification"), false, "")
            MAIN_OBJECTS_IN_PARAMETER(0)

        DECLARE_END_OBJECT_ACTION()


        DECLARE_OBJECT_EXPRESSION("X", _("Position X"), _("Position X de l'objet"), _("Position"), "res/actions/position.png", "GetX")
            DECLARE_PARAMETER("object", _("Objet"), true, "")
        DECLARE_END_OBJECT_EXPRESSION()

    DECLARE_END_OBJECT()
}

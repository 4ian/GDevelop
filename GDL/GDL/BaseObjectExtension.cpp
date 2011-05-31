#include "GDL/BaseObjectExtension.h"
#include "GDL/ExtensionBase.h"
#include "GDL/Object.h"

BaseObjectExtension::BaseObjectExtension()
{
    DECLARE_THE_EXTENSION("BuiltinObject",
                          _T("Objet de base"),
                          _T("Objet de base integré en standard"),
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
                   _T("Objet de base"),
                   _T("Objet de base"),
                   "res/objeticon24.png",
                   &CreateBaseObject,
                   &DestroyBaseObject);
/*
        DECLARE_OBJECT_CONDITION("PosX",
                       _T("Tester la position X d'un objet"),
                       _T("Teste si la position X de l'objet correspond au test effectué."),
                       _T("La position X de l'objet _PARAM0_ est _PARAM2_ à _PARAM1_"),
                       _T("Position"),
                       "res/conditions/position24.png",
                       "res/conditions/position.png",
                       &Object::CondPosX);

            DECLARE_PARAMETER("object", _T("Objet"), true, "")
            DECLARE_PARAMETER("expression", _T("Position X"), false, "")
            DECLARE_PARAMETER("signe", _T("Signe du test"), false, "")
            MAIN_OBJECTS_IN_PARAMETER(0)

        DECLARE_END_OBJECT_CONDITION()*/
/*
        DECLARE_OBJECT_ACTION("MettreX",
                       _T("Position X d'un objet"),
                       _T("Change la position x d'un objet."),
                       _T("Faire _PARAM2__PARAM1_ à la position X de l'objet _PARAM0_"),
                       _T("Position"),
                       "res/actions/position24.png",
                       "res/actions/position.png",
                       &Object::ActMettreX);

            DECLARE_PARAMETER("object", _T("Objet"), true, "")
            DECLARE_PARAMETER("expression", _T("Valeur"), false, "")
            DECLARE_PARAMETER("signe", _T("Signe de la modification"), false, "")
            MAIN_OBJECTS_IN_PARAMETER(0)

        DECLARE_END_OBJECT_ACTION()
*/
    /*
        DECLARE_OBJECT_EXPRESSION("X", _T("Position X"), _T("Position X de l'objet"), _T("Position"), "res/actions/position.png", &Object::ExpGetObjectX)
            DECLARE_PARAMETER("object", _T("Objet"), true, "")
        DECLARE_END_OBJECT_EXPRESSION()
*/
    DECLARE_END_OBJECT()
}

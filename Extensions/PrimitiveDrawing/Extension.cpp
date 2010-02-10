#include "GDL/ExtensionBase.h"
#include "GDL/Version.h"
#include "DrawerObject.h"
#include <boost/version.hpp>

class Extension : public ExtensionBase
{
    public:
        Extension()
        {
            DECLARE_THE_EXTENSION("PrimitiveDrawing",
                          _("Dessin primitif"),
                          _("Extension permettant de dessiner directement des formes et de manipuler des images."),
                          "Compil Games",
                          "Freeware")

            //Declaration of all objects available
            DECLARE_OBJECT("Drawer",
                           _("Dessinateur manuel"),
                           _("Objet permettant de dessiner à l'écran"),
                           "Extensions/primitivedrawingicon.png",
                           &CreateDrawerObject,
                           &CreateDrawerObjectByCopy,
                           &DestroyDrawerObject);

                DECLARE_OBJECT_ACTION("Rectangle",
                               _("Rectangle"),
                               _("Dessine un rectangle à l'écran"),
                               _("Dessiner de _PARAM1_;_PARAM2_ à _PARAM3_;_PARAM4_ un rectangle avec _PARAM0_"),
                               _("Dessin"),
                               "res/actions/rectangle24.png",
                               "res/actions/rectangle.png",
                               &DrawerObject::ActRectangle);

                    DECLARE_PARAMETER("objet", _("Objet dessinateur"), true, "Drawer")
                    DECLARE_PARAMETER("expression", _("Position X du point haut gauche"), false, "")
                    DECLARE_PARAMETER("expression", _("Position Y du point haut gauche"), false, "")
                    DECLARE_PARAMETER("expression", _("Position X du point bas droit"), false, "")
                    DECLARE_PARAMETER("expression", _("Position Y du point bas droit"), false, "")
                    MAIN_OBJECTS_IN_PARAMETER(0)

                DECLARE_END_OBJECT_ACTION()

                DECLARE_OBJECT_ACTION("Circle",
                               _("Cercle"),
                               _("Dessine un cercle à l'écran"),
                               _("Dessiner en _PARAM1_;_PARAM2_ un cercle de rayon _PARAM3_ avec _PARAM0_"),
                               _("Dessin"),
                               "res/actions/circle24.png",
                               "res/actions/circle.png",
                               &DrawerObject::ActCircle);

                    DECLARE_PARAMETER("objet", _("Objet dessinateur"), true, "Drawer")
                    DECLARE_PARAMETER("expression", _("Position X du point haut gauche"), false, "")
                    DECLARE_PARAMETER("expression", _("Position Y du point haut gauche"), false, "")
                    DECLARE_PARAMETER("expression", _("Rayon en pixels"), false, "")
                    MAIN_OBJECTS_IN_PARAMETER(0)

                DECLARE_END_OBJECT_ACTION()

                DECLARE_OBJECT_ACTION("Line",
                               _("Ligne"),
                               _("Dessine une ligne à l'écran"),
                               _("Dessiner de _PARAM1_;_PARAM2_ à _PARAM3_;_PARAM4_ une ligne ( épaisseur  : _PARAM5_) avec _PARAM0_"),
                               _("Dessin"),
                               "res/actions/line24.png",
                               "res/actions/line.png",
                               &DrawerObject::ActLine);

                    DECLARE_PARAMETER("objet", _("Objet dessinateur"), true, "Drawer")
                    DECLARE_PARAMETER("expression", _("Position X du point de départ"), false, "")
                    DECLARE_PARAMETER("expression", _("Position Y du point de départ"), false, "")
                    DECLARE_PARAMETER("expression", _("Position X du point d'arrivée"), false, "")
                    DECLARE_PARAMETER("expression", _("Position Y du point d'arrivée"), false, "")
                    DECLARE_PARAMETER("expression", _("Epaisseur en pixels"), false, "")
                    MAIN_OBJECTS_IN_PARAMETER(0)

                DECLARE_END_OBJECT_ACTION()

                DECLARE_OBJECT_ACTION("FillColor",
                               _("Couleur de remplissage"),
                               _("Change la couleur de remplissage pour le dessin."),
                               _("Changer la couleur de remplissage de _PARAM0_ en _PARAM1_ ( opacité : _PARAM2_ )"),
                               _("Paramétrage"),
                               "res/actions/text24.png",
                               "res/actions/text.png",
                               &DrawerObject::ActFillColor);

                    DECLARE_PARAMETER("objet", _("Objet dessinateur"), true, "Drawer")
                    DECLARE_PARAMETER("color", _("Couleur de remplissage"), false, "")
                    MAIN_OBJECTS_IN_PARAMETER(0)

                DECLARE_END_OBJECT_ACTION()

                DECLARE_OBJECT_ACTION("OutlineColor",
                               _("Couleur du contour"),
                               _("Change la couleur du contour des futurs dessins."),
                               _("Changer la couleur du contour de _PARAM0_ en _PARAM1_"),
                               _("Paramétrage"),
                               "res/actions/color24.png",
                               "res/actions/color.png",
                               &DrawerObject::ActOutlineColor);

                    DECLARE_PARAMETER("objet", _("Objet"), true, "Drawer")
                    DECLARE_PARAMETER("color", _("Couleur"), false, "")
                    MAIN_OBJECTS_IN_PARAMETER(0)

                DECLARE_END_OBJECT_ACTION()

                DECLARE_OBJECT_ACTION("OutlineSize",
                               _("Taille du contour"),
                               _("Modifie la taille du contour des futurs dessins."),
                               _("Faire _PARAM2__PARAM1_ à la taille du contour de _PARAM0_"),
                               _("Paramétrage"),
                               "res/actions/outlineSize24.png",
                               "res/actions/outlineSize.png",
                               &DrawerObject::ActOutlineSize);

                    DECLARE_PARAMETER("objet", _("Objet"), true, "Drawer")
                    DECLARE_PARAMETER("expression", _("Taille en pixels"), false, "")
                    DECLARE_PARAMETER("signe", _("Signe de la modification"), false, "")
                    MAIN_OBJECTS_IN_PARAMETER(0)

                DECLARE_END_OBJECT_ACTION()

                DECLARE_OBJECT_CONDITION("OutlineSize",
                               _("Taille du contour"),
                               _("Teste la taille du contour."),
                               _("La taille du contour de _PARAM0_ est _PARAM2_ à _PARAM1_"),
                               _("Paramétrage"),
                               "res/conditions/outlineSize24.png",
                               "res/conditions/outlineSize.png",
                               &DrawerObject::CondOutlineSize);

                    DECLARE_PARAMETER("objet", _("Objet"), true, "Drawer")
                    DECLARE_PARAMETER("expression", _("Taille à tester"), false, "")
                    DECLARE_PARAMETER("signe", _("Signe du test"), false, "")
                    MAIN_OBJECTS_IN_PARAMETER(0)

                DECLARE_END_OBJECT_CONDITION()

                DECLARE_OBJECT_ACTION("FillOpacity",
                               _("Opacité du remplissage"),
                               _("Modifie la transparence du remplissage des futurs dessins."),
                               _("Faire _PARAM2__PARAM1_ à l'opacité du remplissage de _PARAM0_"),
                               _("Paramétrage"),
                               "res/actions/opacity24.png",
                               "res/actions/opacity.png",
                               &DrawerObject::ActFillOpacity);

                    DECLARE_PARAMETER("objet", _("Objet"), true, "Drawer")
                    DECLARE_PARAMETER("expression", _("Valeur"), false, "")
                    DECLARE_PARAMETER("signe", _("Signe de la modification"), false, "")
                    MAIN_OBJECTS_IN_PARAMETER(0)

                DECLARE_END_OBJECT_ACTION()

                DECLARE_OBJECT_CONDITION("FillOpacity",
                               _("Opacité du remplissage"),
                               _("Teste la valeur de l'opacité du remplissage."),
                               _("L'opacité du remplissage de _PARAM0_ est _PARAM2_ à _PARAM1_"),
                               _("Paramétrage"),
                               "res/conditions/opacity24.png",
                               "res/conditions/opacity.png",
                               &DrawerObject::CondFillOpacity);

                    DECLARE_PARAMETER("objet", _("Objet"), true, "Drawer")
                    DECLARE_PARAMETER("expression", _("Valeur à tester"), false, "")
                    DECLARE_PARAMETER("signe", _("Signe du test"), false, "")
                    MAIN_OBJECTS_IN_PARAMETER(0)

                DECLARE_END_OBJECT_CONDITION()

                DECLARE_OBJECT_ACTION("OutlineOpacity",
                               _("Opacité du contour"),
                               _("Modifie l'opacité du contour des futurs dessins."),
                               _("Faire _PARAM2__PARAM1_ à l'opacité du contour de _PARAM0_"),
                               _("Paramétrage"),
                               "res/actions/opacity24.png",
                               "res/actions/opacity.png",
                               &DrawerObject::ActOutlineOpacity);

                    DECLARE_PARAMETER("objet", _("Objet"), true, "Drawer")
                    DECLARE_PARAMETER("expression", _("Valeur"), false, "")
                    DECLARE_PARAMETER("signe", _("Signe de la modification"), false, "")
                    MAIN_OBJECTS_IN_PARAMETER(0)

                DECLARE_END_OBJECT_ACTION()

                DECLARE_OBJECT_CONDITION("OutlineOpacity",
                               _("Opacité du contour"),
                               _("Teste la valeur de l'opacité du contour."),
                               _("L'opacité du contour de _PARAM0_ est _PARAM2_ à _PARAM1_"),
                               _("Paramétrage"),
                               "res/conditions/opacity24.png",
                               "res/conditions/opacity.png",
                               &DrawerObject::CondOutlineOpacity);

                    DECLARE_PARAMETER("objet", _("Objet"), true, "Drawer")
                    DECLARE_PARAMETER("expression", _("Valeur à tester"), false, "")
                    DECLARE_PARAMETER("signe", _("Signe du test"), false, "")
                    MAIN_OBJECTS_IN_PARAMETER(0)

                DECLARE_END_OBJECT_CONDITION()

            DECLARE_END_OBJECT()

            DECLARE_ACTION("CopyImageOnAnother",
                           _("Copier une image sur une autre"),
                           _("Copie une image sur une autre."),
                           _("Copier l'image _PARAM1_ sur _PARAM0_ à l'emplacement _PARAM2_;_PARAM3_"),
                           _("Images"),
                           "res/actions/opacity24.png",
                           "res/actions/opacity.png",
                           &ActCopyImageOnAnother);

                DECLARE_PARAMETER("texte", _("Nom de l'image à modifier"), false, "")
                DECLARE_PARAMETER("texte", _("Nom de l'image source"), false, "")
                DECLARE_PARAMETER("expression", _("Position X"), false, "")
                DECLARE_PARAMETER("expression", _("Position Y"), false, "")

            DECLARE_END_ACTION()

            CompleteCompilationInformation();
        };
        virtual ~Extension() {};

    protected:
    private:
        void CompleteCompilationInformation()
        {
            #if defined(GDE)
            compilationInfo.runtimeOnly = false;
            #else
            compilationInfo.runtimeOnly = true;
            #endif

            #if defined(__GNUC__)
            compilationInfo.gccMajorVersion = __GNUC__;
            compilationInfo.gccMinorVersion = __GNUC_MINOR__;
            compilationInfo.gccPatchLevel = __GNUC_PATCHLEVEL__;
            #endif

            compilationInfo.boostVersion = BOOST_VERSION;

            compilationInfo.sfmlMajorVersion = 2;
            compilationInfo.sfmlMinorVersion = 0;

            #if defined(GDE)
            compilationInfo.wxWidgetsMajorVersion = wxMAJOR_VERSION;
            compilationInfo.wxWidgetsMinorVersion = wxMINOR_VERSION;
            compilationInfo.wxWidgetsReleaseNumber = wxRELEASE_NUMBER;
            compilationInfo.wxWidgetsSubReleaseNumber = wxSUBRELEASE_NUMBER;
            #endif

            compilationInfo.gdlVersion = RC_FILEVERSION_STRING;

            compilationInfo.informationCompleted = true;
        }
};

extern "C" ExtensionBase * CreateGDExtension() {
    return new Extension;
}

extern "C" void DestroyGDExtension(ExtensionBase * p) {
    delete p;
}

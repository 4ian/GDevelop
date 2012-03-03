/**

Game Develop - Primitive Drawing Extension
Copyright (c) 2008-2012 Florian Rival (Florian.Rival@gmail.com)

This software is provided 'as-is', without any express or implied
warranty. In no event will the authors be held liable for any damages
arising from the use of this software.

Permission is granted to anyone to use this software for any purpose,
including commercial applications, and to alter it and redistribute it
freely, subject to the following restrictions:

    1. The origin of this software must not be misrepresented; you must not
    claim that you wrote the original software. If you use this software
    in a product, an acknowledgment in the product documentation would be
    appreciated but is not required.

    2. Altered source versions must be plainly marked as such, and must not be
    misrepresented as being the original software.

    3. This notice may not be removed or altered from any source
    distribution.

*/

#include "GDL/ExtensionBase.h"
#include "GDL/Version.h"
#include "DrawerObject.h"
#include <boost/version.hpp>

/**
 * This class declare information about the extension.
 */
class Extension : public ExtensionBase
{
    public:

        /**
         * Constructor of an extension declares everything the extension contains : Objects, actions, conditions and expressions.
         */
        Extension()
        {
            DECLARE_THE_EXTENSION("PrimitiveDrawing",
                          _("Dessin primitif"),
                          _("Extension permettant de dessiner directement des formes et de manipuler des images."),
                          "Compil Games",
                          "zlib/libpng License ( Open Source )")

            //Declaration of all objects available
            DECLARE_OBJECT("Drawer",
                           _("Dessinateur manuel"),
                           _("Objet permettant de dessiner à l'écran"),
                           "Extensions/primitivedrawingicon.png",
                           &CreateDrawerObject,
                           &DestroyDrawerObject,
                           "DrawerObject");

                #if defined(GD_IDE_ONLY)

                objInfos.SetIncludeFile("PrimitiveDrawing/DrawerObject.h");

                DECLARE_OBJECT_ACTION("Rectangle",
                               _("Rectangle"),
                               _("Dessine un rectangle à l'écran"),
                               _("Dessiner de _PARAM1_;_PARAM2_ à _PARAM3_;_PARAM4_ un rectangle avec _PARAM0_"),
                               _("Dessin"),
                               "res/actions/rectangle24.png",
                               "res/actions/rectangle.png");

                    instrInfo.AddParameter("object", _("Objet dessinateur"), "Drawer", false);
                    instrInfo.AddParameter("expression", _("Position X du point haut gauche"), "", false);
                    instrInfo.AddParameter("expression", _("Position Y du point haut gauche"), "", false);
                    instrInfo.AddParameter("expression", _("Position X du point bas droit"), "", false);
                    instrInfo.AddParameter("expression", _("Position Y du point bas droit"), "", false);


                    instrInfo.cppCallingInformation.SetFunctionName("DrawRectangle").SetIncludeFile("PrimitiveDrawing/DrawerObject.h");

                DECLARE_END_OBJECT_ACTION()

                DECLARE_OBJECT_ACTION("Circle",
                               _("Cercle"),
                               _("Dessine un cercle à l'écran"),
                               _("Dessiner en _PARAM1_;_PARAM2_ un cercle de rayon _PARAM3_ avec _PARAM0_"),
                               _("Dessin"),
                               "res/actions/circle24.png",
                               "res/actions/circle.png");

                    instrInfo.AddParameter("object", _("Objet dessinateur"), "Drawer", false);
                    instrInfo.AddParameter("expression", _("Position X du centre"), "", false);
                    instrInfo.AddParameter("expression", _("Position Y du centre"), "", false);
                    instrInfo.AddParameter("expression", _("Rayon en pixels"), "", false);


                    instrInfo.cppCallingInformation.SetFunctionName("DrawCircle").SetIncludeFile("PrimitiveDrawing/DrawerObject.h");

                DECLARE_END_OBJECT_ACTION()

                DECLARE_OBJECT_ACTION("Line",
                               _("Ligne"),
                               _("Dessine une ligne à l'écran"),
                               _("Dessiner de _PARAM1_;_PARAM2_ à _PARAM3_;_PARAM4_ une ligne ( épaisseur  : _PARAM5_) avec _PARAM0_"),
                               _("Dessin"),
                               "res/actions/line24.png",
                               "res/actions/line.png");

                    instrInfo.AddParameter("object", _("Objet dessinateur"), "Drawer", false);
                    instrInfo.AddParameter("expression", _("Position X du point de départ"), "", false);
                    instrInfo.AddParameter("expression", _("Position Y du point de départ"), "", false);
                    instrInfo.AddParameter("expression", _("Position X du point d'arrivée"), "", false);
                    instrInfo.AddParameter("expression", _("Position Y du point d'arrivée"), "", false);
                    instrInfo.AddParameter("expression", _("Epaisseur en pixels"), "", false);


                    instrInfo.cppCallingInformation.SetFunctionName("DrawLine").SetIncludeFile("PrimitiveDrawing/DrawerObject.h");

                DECLARE_END_OBJECT_ACTION()

                DECLARE_OBJECT_ACTION("FillColor",
                               _("Couleur de remplissage"),
                               _("Change la couleur de remplissage pour le dessin."),
                               _("Changer la couleur de remplissage de _PARAM0_ en _PARAM1_"),
                               _("Paramétrage"),
                               "res/actions/text24.png",
                               "res/actions/text.png");

                    instrInfo.AddParameter("object", _("Objet dessinateur"), "Drawer", false);
                    instrInfo.AddParameter("color", _("Couleur de remplissage"), "", false);


                    instrInfo.cppCallingInformation.SetFunctionName("SetFillColor").SetIncludeFile("PrimitiveDrawing/DrawerObject.h");

                DECLARE_END_OBJECT_ACTION()

                DECLARE_OBJECT_ACTION("OutlineColor",
                               _("Couleur du contour"),
                               _("Change la couleur du contour des futurs dessins."),
                               _("Changer la couleur du contour de _PARAM0_ en _PARAM1_"),
                               _("Paramétrage"),
                               "res/actions/color24.png",
                               "res/actions/color.png");

                    instrInfo.AddParameter("object", _("Objet"), "Drawer", false);
                    instrInfo.AddParameter("color", _("Couleur"), "", false);


                    instrInfo.cppCallingInformation.SetFunctionName("SetOutlineColor").SetIncludeFile("PrimitiveDrawing/DrawerObject.h");

                DECLARE_END_OBJECT_ACTION()

                DECLARE_OBJECT_ACTION("OutlineSize",
                               _("Taille du contour"),
                               _("Modifie la taille du contour des futurs dessins."),
                               _("Faire _PARAM2__PARAM1_ à la taille du contour de _PARAM0_"),
                               _("Paramétrage"),
                               "res/actions/outlineSize24.png",
                               "res/actions/outlineSize.png");

                    instrInfo.AddParameter("object", _("Objet"), "Drawer", false);
                    instrInfo.AddParameter("expression", _("Taille en pixels"), "", false);
                    instrInfo.AddParameter("operator", _("Signe de la modification"), "", false);


                    instrInfo.cppCallingInformation.SetFunctionName("SetOutlineSize").SetManipulatedType("number").SetAssociatedGetter("GetOutlineSize").SetIncludeFile("PrimitiveDrawing/DrawerObject.h");

                DECLARE_END_OBJECT_ACTION()

                DECLARE_OBJECT_CONDITION("OutlineSize",
                               _("Taille du contour"),
                               _("Teste la taille du contour."),
                               _("La taille du contour de _PARAM0_ est _PARAM2_ à _PARAM1_"),
                               _("Paramétrage"),
                               "res/conditions/outlineSize24.png",
                               "res/conditions/outlineSize.png");

                    instrInfo.AddParameter("object", _("Objet"), "Drawer", false);
                    instrInfo.AddParameter("expression", _("Taille à tester"), "", false);
                    instrInfo.AddParameter("relationalOperator", _("Signe du test"), "", false);


                    instrInfo.cppCallingInformation.SetFunctionName("GetOutlineSize").SetManipulatedType("number").SetIncludeFile("PrimitiveDrawing/DrawerObject.h");

                DECLARE_END_OBJECT_CONDITION()

                DECLARE_OBJECT_ACTION("FillOpacity",
                               _("Opacité du remplissage"),
                               _("Modifie la transparence du remplissage des futurs dessins."),
                               _("Faire _PARAM2__PARAM1_ à l'opacité du remplissage de _PARAM0_"),
                               _("Paramétrage"),
                               "res/actions/opacity24.png",
                               "res/actions/opacity.png");

                    instrInfo.AddParameter("object", _("Objet"), "Drawer", false);
                    instrInfo.AddParameter("expression", _("Valeur"), "", false);
                    instrInfo.AddParameter("operator", _("Signe de la modification"), "", false);


                    instrInfo.cppCallingInformation.SetFunctionName("SetFillOpacity").SetManipulatedType("number").SetAssociatedGetter("GetFillOpacity").SetIncludeFile("PrimitiveDrawing/DrawerObject.h");


                DECLARE_END_OBJECT_ACTION()

                DECLARE_OBJECT_CONDITION("FillOpacity",
                               _("Opacité du remplissage"),
                               _("Teste la valeur de l'opacité du remplissage."),
                               _("L'opacité du remplissage de _PARAM0_ est _PARAM2_ à _PARAM1_"),
                               _("Paramétrage"),
                               "res/conditions/opacity24.png",
                               "res/conditions/opacity.png");

                    instrInfo.AddParameter("object", _("Objet"), "Drawer", false);
                    instrInfo.AddParameter("expression", _("Valeur à tester"), "", false);
                    instrInfo.AddParameter("relationalOperator", _("Signe du test"), "", false);


                    instrInfo.cppCallingInformation.SetFunctionName("GetFillOpacity").SetManipulatedType("number").SetIncludeFile("PrimitiveDrawing/DrawerObject.h");

                DECLARE_END_OBJECT_CONDITION()

                DECLARE_OBJECT_ACTION("OutlineOpacity",
                               _("Opacité du contour"),
                               _("Modifie l'opacité du contour des futurs dessins."),
                               _("Faire _PARAM2__PARAM1_ à l'opacité du contour de _PARAM0_"),
                               _("Paramétrage"),
                               "res/actions/opacity24.png",
                               "res/actions/opacity.png");

                    instrInfo.AddParameter("object", _("Objet"), "Drawer", false);
                    instrInfo.AddParameter("expression", _("Valeur"), "", false);
                    instrInfo.AddParameter("operator", _("Signe de la modification"), "", false);


                    instrInfo.cppCallingInformation.SetFunctionName("SetOutlineOpacity").SetManipulatedType("number").SetAssociatedGetter("GetOutlineOpacity").SetIncludeFile("PrimitiveDrawing/DrawerObject.h");

                DECLARE_END_OBJECT_ACTION()

                DECLARE_OBJECT_CONDITION("OutlineOpacity",
                               _("Opacité du contour"),
                               _("Teste la valeur de l'opacité du contour."),
                               _("L'opacité du contour de _PARAM0_ est _PARAM2_ à _PARAM1_"),
                               _("Paramétrage"),
                               "res/conditions/opacity24.png",
                               "res/conditions/opacity.png");

                    instrInfo.AddParameter("object", _("Objet"), "Drawer", false);
                    instrInfo.AddParameter("expression", _("Valeur à tester"), "", false);
                    instrInfo.AddParameter("relationalOperator", _("Signe du test"), "", false);


                    instrInfo.cppCallingInformation.SetFunctionName("GetOutlineOpacity").SetManipulatedType("number").SetIncludeFile("PrimitiveDrawing/DrawerObject.h");

                DECLARE_END_OBJECT_CONDITION()

            #endif

            DECLARE_END_OBJECT()

            #if defined(GD_IDE_ONLY)

            DECLARE_ACTION("CopyImageOnAnother",
                           _("Copier une image sur une autre"),
                           _("Copie une image sur une autre.\nNotez qu'il est préférable que l'image source reste chargée en mémoire."),
                           _("Copier l'image _PARAM1_ sur _PARAM0_ à l'emplacement _PARAM2_;_PARAM3_"),
                           _("Images"),
                           "res/actions/copy24.png",
                           "res/actions/copy.png");

                instrInfo.AddParameter("string", _("Nom de l'image à modifier"), "", false);
                instrInfo.AddParameter("string", _("Nom de l'image source"), "", false);
                instrInfo.AddParameter("expression", _("Position X"), "", false);
                instrInfo.AddParameter("expression", _("Position Y"), "", false);

                instrInfo.cppCallingInformation.SetFunctionName("GDpriv::PrimitiveDrawingExtension::CopyImageOnAnother").SetIncludeFile("PrimitiveDrawing/DrawerObject.h");


            DECLARE_END_ACTION()

            #endif


            CompleteCompilationInformation();
        };
        virtual ~Extension() {};

    protected:
    private:

        /**
         * This function is called by Game Develop so
         * as to complete information about how the extension was compiled ( which libs... )
         * -- Do not need to be modified. --
         */
        void CompleteCompilationInformation()
        {
            #if defined(GD_IDE_ONLY)
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

            #if defined(GD_IDE_ONLY)
            compilationInfo.wxWidgetsMajorVersion = wxMAJOR_VERSION;
            compilationInfo.wxWidgetsMinorVersion = wxMINOR_VERSION;
            compilationInfo.wxWidgetsReleaseNumber = wxRELEASE_NUMBER;
            compilationInfo.wxWidgetsSubReleaseNumber = wxSUBRELEASE_NUMBER;
            #endif

            compilationInfo.gdlVersion = RC_FILEVERSION_STRING;
            compilationInfo.sizeOfpInt = sizeof(int*);

            compilationInfo.informationCompleted = true;
        }
};

/**
 * Used by Game Develop to create the extension class
 * -- Do not need to be modified. --
 */
extern "C" ExtensionBase * GD_EXTENSION_API CreateGDExtension() {
    return new Extension;
}

/**
 * Used by Game Develop to destroy the extension class
 * -- Do not need to be modified. --
 */
extern "C" void GD_EXTENSION_API DestroyGDExtension(ExtensionBase * p) {
    delete p;
}

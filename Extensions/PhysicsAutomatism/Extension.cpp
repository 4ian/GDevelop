/**

Game Develop - Physic Automatism Extension
Copyright (c) 2008-2010 Florian Rival (Florian.Rival@gmail.com)

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
#include "PhysicsAutomatism.h"
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
            DECLARE_THE_EXTENSION("PhysicsAutomatism",
                                  _("Automatisme Moteur physique"),
                                  _("Automatisme permettant de déplacer les objets comme si ils étaient soumis aux lois de la physique."),
                                  "Compil Games",
                                  "zlib/libpng License ( Open Source )")

                DECLARE_AUTOMATISM("PhysicsAutomatism",
                          _("Automatisme Moteur physique"),
                          _("Automatisme permettant de déplacer les objets comme si ils étaient soumis aux lois de la physique."),
                          "",
                          "res/function.png",
                          PhysicsAutomatism)

                    DECLARE_AUTOMATISM_ACTION("SetStatic",
                                   _("Rendre l'objet statique"),
                                   _("Rend l'objet statique physiquement"),
                                   _("Rendre _PARAM0_ statique"),
                                   _("Mouvement"),
                                   "res/actions/window24.png",
                                   "res/actions/window.png",
                                   &PhysicsAutomatism::ActSetStatic);

                        DECLARE_PARAMETER("object", _("Objet"), true, "")

                    DECLARE_END_AUTOMATISM_ACTION()

                    DECLARE_AUTOMATISM_ACTION("SetDynamic",
                                   _("Rendre l'objet dynamique"),
                                   _("Rend l'objet dynamique ( affecté par les forces et les autres objets )."),
                                   _("Rendre _PARAM0_ dynamique"),
                                   _("Mouvement"),
                                   "res/actions/window24.png",
                                   "res/actions/window.png",
                                   &PhysicsAutomatism::ActSetDynamic);

                        DECLARE_PARAMETER("object", _("Objet"), true, "")

                    DECLARE_END_AUTOMATISM_ACTION()

                    DECLARE_AUTOMATISM_CONDITION("IsDynamic",
                                   _("L'objet est dynamique"),
                                   _("Teste si l'objet est dynamique ( affecté par les forces et les autres objets )."),
                                   _("_PARAM0_ est dynamique"),
                                   _("Mouvement"),
                                   "res/actions/window24.png",
                                   "res/actions/window.png",
                                   &PhysicsAutomatism::CondIsDynamic);

                        DECLARE_PARAMETER("object", _("Objet"), true, "")

                    DECLARE_END_AUTOMATISM_CONDITION()

                    DECLARE_AUTOMATISM_ACTION("SetFixedRotation",
                                   _("Fixer la rotation"),
                                   _("Empêche l'objet de tourner."),
                                   _("Fixer la rotation de _PARAM0_"),
                                   _("Rotation"),
                                   "res/actions/window24.png",
                                   "res/actions/window.png",
                                   &PhysicsAutomatism::ActSetFixedRotation);

                        DECLARE_PARAMETER("object", _("Objet"), true, "")

                    DECLARE_END_AUTOMATISM_ACTION()

                    DECLARE_AUTOMATISM_ACTION("SetFreeRotation",
                                   _("Rendre la rotation libre"),
                                   _("Permet à l'objet de tourner."),
                                   _("Permettre à _PARAM0_ de tourner"),
                                   _("Rotation"),
                                   "res/actions/window24.png",
                                   "res/actions/window.png",
                                   &PhysicsAutomatism::ActSetFreeRotation);

                        DECLARE_PARAMETER("object", _("Objet"), true, "")

                    DECLARE_END_AUTOMATISM_ACTION()

                    DECLARE_AUTOMATISM_CONDITION("IsFixedRotation",
                                   _("Rotation fixée"),
                                   _("Teste si l'objet a sa rotation fixée."),
                                   _("_PARAM0_ a sa rotation fixée"),
                                   _("Rotation"),
                                   "res/actions/window24.png",
                                   "res/actions/window.png",
                                   &PhysicsAutomatism::CondIsFixedRotation);

                        DECLARE_PARAMETER("object", _("Objet"), true, "")

                    DECLARE_END_AUTOMATISM_CONDITION()

                    DECLARE_AUTOMATISM_ACTION("SetAsBullet",
                                   _("Considérer comme un projectile"),
                                   _("Considérer l'objet comme un projectile, afin de garantir une meilleure gestion des collisions."),
                                   _("Considérer _PARAM0_ comme un projectile"),
                                   _("Autre"),
                                   "res/actions/window24.png",
                                   "res/actions/window.png",
                                   &PhysicsAutomatism::ActSetAsBullet);

                        DECLARE_PARAMETER("object", _("Objet"), true, "")

                    DECLARE_END_AUTOMATISM_ACTION()

                    DECLARE_AUTOMATISM_ACTION("DontSetAsBullet",
                                   _("Ne pas considérer comme un projectile"),
                                   _("Ne pas considérer l'objet comme un projectile, afin d'utiliser une gestion standard des collisions."),
                                   _("Ne pas considérer _PARAM0_ comme un projectile"),
                                   _("Autre"),
                                   "res/actions/window24.png",
                                   "res/actions/window.png",
                                   &PhysicsAutomatism::ActDontSetAsBullet);

                        DECLARE_PARAMETER("object", _("Objet"), true, "")

                    DECLARE_END_AUTOMATISM_ACTION()

                    DECLARE_AUTOMATISM_CONDITION("IsBullet",
                                   _("L'objet est considérée comme un projectile"),
                                   _("Teste si l'objet est considéré comme un projectile."),
                                   _("_PARAM0_ est considéré comme un projectile"),
                                   _("Autre"),
                                   "res/actions/window24.png",
                                   "res/actions/window.png",
                                   &PhysicsAutomatism::CondIsBullet);

                        DECLARE_PARAMETER("object", _("Objet"), true, "")

                    DECLARE_END_AUTOMATISM_CONDITION()

                    DECLARE_AUTOMATISM_ACTION("ApplyForce",
                                   _("Appliquer une force"),
                                   _("Applique une force à l'objet."),
                                   _("Appliquer à _PARAM0_ une force _PARAM1_;_PARAM2_"),
                                   _("Mouvement"),
                                   "res/actions/window24.png",
                                   "res/actions/window.png",
                                   &PhysicsAutomatism::ActApplyForce);

                        DECLARE_PARAMETER("object", _("Objet"), true, "")
                        DECLARE_PARAMETER("expression", _("Composante X"), false, "")
                        DECLARE_PARAMETER("expression", _("Composante Y"), false, "")

                    DECLARE_END_AUTOMATISM_ACTION()

                    DECLARE_AUTOMATISM_ACTION("ApplyTorque",
                                   _("Appliquer un moment (rotation)"),
                                   _("Applique un moment (rotation) à l'objet."),
                                   _("Appliquer à _PARAM0_ un moment de valeur _PARAM1_"),
                                   _("Mouvement"),
                                   "res/actions/window24.png",
                                   "res/actions/window.png",
                                   &PhysicsAutomatism::ActApplyTorque);

                        DECLARE_PARAMETER("object", _("Objet"), true, "")
                        DECLARE_PARAMETER("expression", _("Valeur du moment"), false, "")

                    DECLARE_END_AUTOMATISM_ACTION()

                DECLARE_END_AUTOMATISM();

            CompleteCompilationInformation();
        };
        virtual ~Extension() {};

    private:

        /**
         * This function is called by Game Develop so
         * as to complete information about how the extension was compiled ( which libs... )
         * -- Do not need to be modified. --
         */
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
            compilationInfo.sizeOfpInt = sizeof(int*);

            compilationInfo.informationCompleted = true;
        }
};

/**
 * Used by Game Develop to create the extension class
 * -- Do not need to be modified. --
 */
extern "C" ExtensionBase * CreateGDExtension() {
    return new Extension;
}

/**
 * Used by Game Develop to destroy the extension class
 * -- Do not need to be modified. --
 */
extern "C" void DestroyGDExtension(ExtensionBase * p) {
    delete p;
}

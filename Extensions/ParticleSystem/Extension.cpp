/**

Game Develop - Particle System Extension
Copyright (c) 2010 Florian Rival (Florian.Rival@gmail.com)

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
#include "ParticleEmitterObject.h"
#include "ExtensionSubDeclaration1.h"
#include "ExtensionSubDeclaration2.h"
#include "ExtensionSubDeclaration3.h"
#include "Extension.h"
#include <boost/version.hpp>

/**
 * Constructor of an extension declares everything the extension contains : Objects, actions, conditions and expressions.
 */
Extension::Extension()
{
    DECLARE_THE_EXTENSION("ParticleSystem",
                          _("Système de particules"),
                          _("Extension permettant d'afficher un grand nombre de petites particules."),
                          "Compil Games",
                          "zlib/libpng License ( Open Source )")

    //Declaration of all objects available
    DECLARE_OBJECT("ParticleEmitter",
                   _("Emetteur de particules"),
                   _("Objet affichant un grand nombre de petites particules"),
                   "Extensions/particleSystemicon.png",
                   &CreateParticleEmitterObject,
                   &DestroyParticleEmitterObject);

        //Declaration is too big to be compiled by GCC in one file, unless you have 4GB+ ram. :/
        ExtensionSubDeclaration2(objInfos);
        ExtensionSubDeclaration1(objInfos);
        ExtensionSubDeclaration3(objInfos);

    DECLARE_END_OBJECT()

    CompleteCompilationInformation();
};

/**
 * This function is called by Game Develop so
 * as to complete information about how the extension was compiled ( which libs... )
 * -- Do not need to be modified. --
 */
void Extension::CompleteCompilationInformation()
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

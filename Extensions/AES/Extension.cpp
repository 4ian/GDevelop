/**

Game Develop - AES Extension
Copyright (c) 2008-2011 Florian Rival (Florian.Rival@gmail.com)

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
            DECLARE_THE_EXTENSION("AES",
                                  _("Algorithme de chiffrement AES"),
                                  _("Extension permettant de chiffrer des fichiers avec l'algorithme AES."),
                                  "Compil Games",
                                  "zlib/libpng License ( Open Source )")

            #if defined(GD_IDE_ONLY)

            DECLARE_ACTION("EncryptFile",
                           _("Crypter un fichier"),
                           _("Crypte un fichier avec AES."),
                           _("Crypter le fichier _PARAM0_ en _PARAM1_ avec AES"),
                           _("Cryptage"),
                           "Extensions/AESicon24.png",
                           "Extensions/AESicon16.png");

                instrInfo.AddParameter("file", _("Fichier source"), "", false);
                instrInfo.AddParameter("file", _("Fichier de destination"), "", false);
                instrInfo.AddParameter("string", _("Mot de passe ( 24 caractères )"), "", false);

                instrInfo.cppCallingInformation.SetFunctionName("GDpriv::AES::EncryptFile").SetIncludeFile("AES/AESTools.h");


            DECLARE_END_ACTION()

            DECLARE_ACTION("DecryptFile",
                           _("Décrypter un fichier"),
                           _("Décrypter un fichier avec AES."),
                           _("Décrypter le fichier _PARAM0_ en _PARAM1_ avec AES"),
                           _("Cryptage"),
                           "Extensions/AESicon24.png",
                           "Extensions/AESicon16.png");

                instrInfo.AddParameter("file", _("Fichier source"), "", false);
                instrInfo.AddParameter("file", _("Fichier de destination"), "", false);
                instrInfo.AddParameter("string", _("Mot de passe ( 24 caractères )"), "", false);

                instrInfo.cppCallingInformation.SetFunctionName("GDpriv::AES::DecryptFile").SetIncludeFile("AES/AESTools.h");

            DECLARE_END_ACTION()
            /*
            DECLARE_STR_EXPRESSION("Encrypt", _("Crypter"), _("Crypter"), _("Cryptage"), "res/actions/scaleHeight.png", &ExpEncrypt)
                instrInfo.AddParameter("string", _("Texte à crypter"), "", false);
                instrInfo.AddParameter("string", _("Mot de passe ( 24 caractères )"), "", false);
            DECLARE_END_STR_EXPRESSION()

            DECLARE_STR_EXPRESSION("Decrypt", _("Decrypter"), _("Decrypter"), _("Cryptage"), "res/actions/scaleHeight.png", &ExpDecrypt)
                instrInfo.AddParameter("string", _("Texte à décrypter"), "", false);
                instrInfo.AddParameter("string", _("Mot de passe ( 24 caractères )"), "", false);
            DECLARE_END_STR_EXPRESSION()
            */

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

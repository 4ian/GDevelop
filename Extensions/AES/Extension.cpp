/**

Game Develop - AES Extension
Copyright (c) 2008-2014 Florian Rival (Florian.Rival@gmail.com)

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

#include "GDCpp/ExtensionBase.h"
#include "GDCore/Tools/Version.h"
#include <boost/version.hpp>

/**
 * \brief This class declares information about the extension.
 */
class Extension : public ExtensionBase
{
public:

    /**
     * Constructor of an extension declares everything the extension contains : Objects, actions, conditions and expressions.
     */
    Extension()
    {
        SetExtensionInformation("AES",
                              _("AES encryption algorithm"),
                              _("Extension to encrypt files with AES algorithm."),
                              "Florian Rival",
                              "zlib/libpng License (Open Source)");

        #if defined(GD_IDE_ONLY)

        AddAction("EncryptFile",
                       _("Crypt a file"),
                       _("Crypt a file with AES."),
                       _("Crypt file _PARAM0_ to _PARAM1_ with AES"),
                       _("Encryption"),
                       "CppPlatform/Extensions/AESicon24.png",
                       "CppPlatform/Extensions/AESicon16.png")

            .AddParameter("file", _("Source file"))
            .AddParameter("file", _("Destination file"))
            .AddParameter("string", _("Password ( 24 characters )"))

            .codeExtraInformation.SetFunctionName("GDpriv::AES::EncryptFile").SetIncludeFile("AES/AESTools.h");


        AddAction("DecryptFile",
                       _("Decrypt a file"),
                       _("Decrypt a file with AES."),
                       _("Decrypt file _PARAM0_ to _PARAM1_ with AES"),
                       _("Encryption"),
                       "CppPlatform/Extensions/AESicon24.png",
                       "CppPlatform/Extensions/AESicon16.png")

            .AddParameter("file", _("Source file"))
            .AddParameter("file", _("Destination file"))
            .AddParameter("string", _("Password ( 24 characters )"))

            .codeExtraInformation.SetFunctionName("GDpriv::AES::DecryptFile").SetIncludeFile("AES/AESTools.h");

        #endif

        GD_COMPLETE_EXTENSION_COMPILATION_INFORMATION();
    };
    virtual ~Extension() {};
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


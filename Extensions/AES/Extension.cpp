/**

GDevelop - AES Extension
Copyright (c) 2008-2016 Florian Rival (Florian.Rival@gmail.com)
This project is released under the MIT License.
*/

#include "GDCpp/Extensions/ExtensionBase.h"

/**
 * \brief This class declares information about the extension.
 */
class Extension : public ExtensionBase
{
public:

    /**
     * Constructor of an extension declares everything the extension contains: objects, actions, conditions and expressions.
     */
    Extension()
    {
        SetExtensionInformation("AES",
                              _("AES encryption algorithm"),
                              _("Extension for encrypting files with the AES algorithm."),
                              "Florian Rival",
                              "Open source (MIT License)");

        #if defined(GD_IDE_ONLY)

        AddAction("EncryptFile",
                       _("Encrypt a file"),
                       _("Encrypt a file with AES."),
                       _("Encrypt file _PARAM0_ to _PARAM1_ with AES"),
                       _("Encryption"),
                       "CppPlatform/Extensions/AESicon24.png",
                       "CppPlatform/Extensions/AESicon16.png")

            .AddParameter("file", _("Source file"))
            .AddParameter("file", _("Destination file"))
            .AddParameter("string", _("Password ( 24 characters )"))

            .SetFunctionName("GDpriv::AES::EncryptFile").SetIncludeFile("AES/AESTools.h");


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

            .SetFunctionName("GDpriv::AES::DecryptFile").SetIncludeFile("AES/AESTools.h");

        #endif

        GD_COMPLETE_EXTENSION_COMPILATION_INFORMATION();
    };
};

/**
 * Used by GDevelop to create the extension class
 * -- Do not need to be modified. --
 */
extern "C" ExtensionBase * GD_EXTENSION_API CreateGDExtension() {
    return new Extension;
}

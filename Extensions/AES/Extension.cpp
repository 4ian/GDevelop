/**

GDevelop - AES Extension
Copyright (c) 2008-2015 Florian Rival (Florian.Rival@gmail.com)
This project is released under the MIT License.
*/

#include "GDCpp/ExtensionBase.h"
#include "GDCore/Tools/Version.h"


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
                              GD_T("AES encryption algorithm"),
                              GD_T("Extension to encrypt files with AES algorithm."),
                              "Florian Rival",
                              "Open source (MIT License)");

        #if defined(GD_IDE_ONLY)

        AddAction("EncryptFile",
                       GD_T("Crypt a file"),
                       GD_T("Crypt a file with AES."),
                       GD_T("Crypt file _PARAM0_ to _PARAM1_ with AES"),
                       GD_T("Encryption"),
                       "CppPlatform/Extensions/AESicon24.png",
                       "CppPlatform/Extensions/AESicon16.png")

            .AddParameter("file", GD_T("Source file"))
            .AddParameter("file", GD_T("Destination file"))
            .AddParameter("string", GD_T("Password ( 24 characters )"))

            .codeExtraInformation.SetFunctionName("GDpriv::AES::EncryptFile").SetIncludeFile("AES/AESTools.h");


        AddAction("DecryptFile",
                       GD_T("Decrypt a file"),
                       GD_T("Decrypt a file with AES."),
                       GD_T("Decrypt file _PARAM0_ to _PARAM1_ with AES"),
                       GD_T("Encryption"),
                       "CppPlatform/Extensions/AESicon24.png",
                       "CppPlatform/Extensions/AESicon16.png")

            .AddParameter("file", GD_T("Source file"))
            .AddParameter("file", GD_T("Destination file"))
            .AddParameter("string", GD_T("Password ( 24 characters )"))

            .codeExtraInformation.SetFunctionName("GDpriv::AES::DecryptFile").SetIncludeFile("AES/AESTools.h");

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

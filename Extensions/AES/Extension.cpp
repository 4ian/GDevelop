#include "GDL/ExtensionBase.h"
#include "GDL/Version.h"
#include "AESActions.h"
#include <boost/version.hpp>

class Extension : public ExtensionBase
{
    public:
        Extension()
        {
            DECLARE_THE_EXTENSION("AES",
                                  _("Algorithme de chiffrement AES"),
                                  _("Extension permettant de chiffrer des fichiers avec l'algorithme AES."),
                                  "Compil Games",
                                  "Freeware")

            DECLARE_ACTION("EncryptFile",
                           _("Crypter un fichier"),
                           _("Crypte un fichier avec AES."),
                           _("Crypter le fichier _PARAM0_ en _PARAM1_ avec AES"),
                           _("Cryptage"),
                           "res/actions/camera24.png",
                           "res/actions/camera.png",
                           &ActEncryptFile);

                DECLARE_PARAMETER("file", _("Fichier source"), false, "")
                DECLARE_PARAMETER("file", _("Fichier de destination"), false, "")
                DECLARE_PARAMETER("texte", _("Mot de passe ( 24 caractères )"), false, "")
                MAIN_OBJECTS_IN_PARAMETER(0)

            DECLARE_END_ACTION()

            DECLARE_ACTION("DecryptFile",
                           _("Décrypter un fichier"),
                           _("Décrypter un fichier avec AES."),
                           _("Décrypter le fichier _PARAM0_ en _PARAM1_ avec AES"),
                           _("Cryptage"),
                           "res/actions/camera24.png",
                           "res/actions/camera.png",
                           &ActDecryptFile);

                DECLARE_PARAMETER("file", _("Fichier source"), false, "")
                DECLARE_PARAMETER("file", _("Fichier de destination"), false, "")
                DECLARE_PARAMETER("texte", _("Mot de passe ( 24 caractères )"), false, "")
                MAIN_OBJECTS_IN_PARAMETER(0)

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

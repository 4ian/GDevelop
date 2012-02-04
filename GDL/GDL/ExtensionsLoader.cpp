#include "GDL/ExtensionsManager.h" // Must be placed first
#include "GDL/ExtensionsLoader.h"
#include <stdio.h>
#include <sys/types.h>
#include <stdlib.h>
#include <signal.h>

//Compiler specific include, for listing files of directory ( see below )
#if defined(__GNUC__)
#include <dirent.h>
#elif defined(_MSC_VER)
#include <windows.h>
#endif

#include <boost/version.hpp>

#include "GDL/BuiltinExtensions/BaseObjectExtension.h"
#include "GDL/BuiltinExtensions/AudioExtension.h"
#include "GDL/BuiltinExtensions/MouseExtension.h"
#include "GDL/BuiltinExtensions/KeyboardExtension.h"
#include "GDL/BuiltinExtensions/JoystickExtension.h"
#include "GDL/BuiltinExtensions/TimeExtension.h"
#include "GDL/BuiltinExtensions/FileExtension.h"
#include "GDL/BuiltinExtensions/VariablesExtension.h"
#include "GDL/BuiltinExtensions/CameraExtension.h"
#include "GDL/BuiltinExtensions/WindowExtension.h"
#include "GDL/BuiltinExtensions/NetworkExtension.h"
#include "GDL/BuiltinExtensions/SpriteExtension.h"
#include "GDL/BuiltinExtensions/SceneExtension.h"
#include "GDL/BuiltinExtensions/AdvancedExtension.h"
#include "GDL/Object.h"
#include "GDL/Game.h"
#include "GDL/Version.h"
#include "GDL/ExtensionBase.h"
#include "GDL/DynamicExtensionBase.h"
#include "GDL/IDE/LocaleManager.h"
#include "GDL/CommonTools.h"

#if defined(GD_IDE_ONLY)
#include <wx/log.h>
#include <wx/msgdlg.h>
#include <wx/filename.h>
#include "GDL/IDE/CodeCompiler.h"
#endif

typedef ExtensionBase* (*createExtension)();
typedef void (*destroyExtension)(ExtensionBase*);

using namespace GDpriv;

ExtensionsLoader::ExtensionsLoader() :
directory("./")
{
    //ctor
}

ExtensionsLoader::~ExtensionsLoader()
{
    //dtor
}

ExtensionsLoader *ExtensionsLoader::_singleton = NULL;

void ExtensionsLoader::LoadAllStaticExtensionsAvailable()
{
    string suffix = "";

    #if defined(WINDOWS)
        suffix += "w";
    #elif defined(LINUX)
        suffix += "l";
    #elif defined(MAC)
        suffix += "m";
    #else
        #error No target system defined.
    #endif

    #if defined(GD_IDE_ONLY)
        suffix += "e";
    #endif

	#if defined(__GNUC__) //For compilers with posix support
    struct dirent *lecture;
    DIR *rep;
    rep = opendir( directory.c_str() );
    int l = 0;

    if ( rep == NULL )
    {
        cout << "Unable to open Extensions directory." << endl;
        return;
    }

    std::vector<std::string> librariesLoaded;
    while (( lecture = readdir( rep ) ) )
    {
        string lec = lecture->d_name;
        if ( lec != "." && lec != ".." && lec.find(".xgd"+suffix, lec.length()-4-suffix.length()) != string::npos)
        {
            //Use a log file, in IDE only
            #if defined(GD_IDE_ONLY)
            {
                wxFile errorDetectFile(wxFileName::GetTempDir()+"/ExtensionBeingLoaded.log", wxFile::write);
                errorDetectFile.Write(directory+"/"+lec);
            }
            #endif

            LoadStaticExtensionInManager(directory+"/"+lec);

            //Everything is ok : Delete the log file
            #if defined(GD_IDE_ONLY)
            wxRemoveFile(wxFileName::GetTempDir()+"/ExtensionBeingLoaded.log");
            #endif

            librariesLoaded.push_back(directory+"/"+lec);

            l++;
        }
    }

    closedir( rep );

    #if defined(LINUX) || defined (MAC)
    //Libraries are loaded using dlopen(.., ..|RTLD_LOCAL) meaning that their symbols are not available for other libraries
    //nor for LLVM/Clang. We then reload set them as global to make thei symbols available for LLVM/Clang. We couldn't mark them
    //as global when loading them as every extension use the sames "Create/DestroyGDExtension" symbols.
    for (unsigned int i = 0;i<librariesLoaded.size();++i)
        SetLibraryGlobal(librariesLoaded[i].c_str());
    #endif

	#elif defined(_MSC_VER)
	WIN32_FIND_DATA f;
	string dirPart = "/*.xgd";
	string dirComplete = directory + dirPart + suffix;
	HANDLE h = FindFirstFile(dirComplete.c_str(), &f);
	if(h != INVALID_HANDLE_VALUE)
	{
		do
		{
            //Use a log file, in IDE only
            #if defined(GD_IDE_ONLY)
            {
                wxFile errorDetectFile(wxFileName::GetTempDir()+"/ExtensionBeingLoaded.log", wxFile::write);
                errorDetectFile.Write(f.cFileName);
            }
            #endif

			LoadStaticExtensionInManager(f.cFileName);

            //Everything is ok : Delete the log file
            #if defined(GD_IDE_ONLY)
            wxRemoveFile(wxFileName::GetTempDir()+"/ExtensionBeingLoaded.log");
            #endif

		} while(FindNextFile(h, &f));
	}
	#else
		#warning Compiler not supported ( but might support one style of directory listing, update defines if necessary ) for dynamic libraries loading
	#endif
}

void ExtensionsLoader::LoadStaticExtensionInManager(std::string fullpath)
{

    GDpriv::ExtensionsManager * extensionsManager = GDpriv::ExtensionsManager::GetInstance();
    Handle extensionHdl = OpenLibrary(fullpath.c_str());
    if (extensionHdl == NULL)
    {
        std::string error = DynamicLibraryLastError();

        cout << "Unable to load extension " << fullpath << "." << endl;
        cout << "Error returned : \"" << error << "\"" << endl;
        #if defined(GD_IDE_ONLY)
        wxString userMsg = string(_("L'extension "))+ fullpath + string(_(" n'a pas pû être chargée.\nPrenez contact avec le développeur pour plus d'informations.\n\nErreur détaillée :\n") + error);
        wxMessageBox(userMsg, _("Extension non compatible"), wxOK | wxICON_EXCLAMATION);
        #endif
    }
    else
    {
        createExtension create_extension = (createExtension)GetSymbol(extensionHdl, "CreateGDExtension");
        destroyExtension destroy_extension = (destroyExtension)GetSymbol(extensionHdl, "DestroyGDExtension");

        if ( create_extension == NULL || destroy_extension == NULL )
        {
            cout << "Unable to load extension " << fullpath << " ( no valid create/destroy functions )." << endl;

            #if defined(GD_IDE_ONLY)
            CloseLibrary(extensionHdl);
            wxString userMsg = string(_("L'extension "))+ fullpath + string(_(" n'a pas pû être chargée.\nPrenez contact avec le développeur pour plus d'informations." ));
            wxMessageBox(userMsg, _("Extension non compatible"), wxOK | wxICON_EXCLAMATION);
            #endif
        }
        else
        {
            #if defined(GD_IDE_ONLY)
            GDpriv::LocaleManager::GetInstance()->AddCatalog(ToString(wxFileName(fullpath).GetName())); //In editor, load catalog associated with extension, if any.
            #endif

            ExtensionBase * extensionPtr = create_extension();
            string error;

            //Perform safety check about the compilation
            if ( !extensionPtr->compilationInfo.informationCompleted )
                error += "Compilation information not filled.\n";

            #if defined(GD_IDE_ONLY)
            else if ( extensionPtr->compilationInfo.runtimeOnly )
                error += "Extension compiled for runtime only.\n";

            else if ( extensionPtr->compilationInfo.wxWidgetsMajorVersion != wxMAJOR_VERSION ||
                      extensionPtr->compilationInfo.wxWidgetsMinorVersion != wxMINOR_VERSION ||
                      extensionPtr->compilationInfo.wxWidgetsReleaseNumber != wxRELEASE_NUMBER ||
                      extensionPtr->compilationInfo.wxWidgetsSubReleaseNumber != wxSUBRELEASE_NUMBER )
                error += "Not the same wxWidgets version.\n";
            #endif
            #if defined(__GNUC__)
            else if ( extensionPtr->compilationInfo.gccMajorVersion != __GNUC__ ||
                      extensionPtr->compilationInfo.gccMinorVersion != __GNUC_MINOR__ ||
                      extensionPtr->compilationInfo.gccPatchLevel != __GNUC_PATCHLEVEL__ )
                error += "Not the same GNU Compiler version.\n";

            #endif
            else if ( extensionPtr->compilationInfo.sfmlMajorVersion != 2 ||
                      extensionPtr->compilationInfo.sfmlMinorVersion != 0 )
                error += "Not the same SFML version.\n";

            else if ( extensionPtr->compilationInfo.boostVersion != BOOST_VERSION )
                error += "Not the same Boost version.\n(Extension is using "+ToString(extensionPtr->compilationInfo.boostVersion)+", Game Develop is using "+ToString(BOOST_VERSION)+")\n";

            else if ( extensionPtr->compilationInfo.gdlVersion != RC_FILEVERSION_STRING)
                error += "Not the same GDL version.\n(Extension is using "+extensionPtr->compilationInfo.gdlVersion+", Game Develop is using "+RC_FILEVERSION_STRING+")\n";

            else if ( extensionPtr->compilationInfo.sizeOfpInt != sizeof(int*))
                error += "Not the same architecture.\n(Extension sizeof(int*) is "+ToString(extensionPtr->compilationInfo.sizeOfpInt)+", Game Develop sizeof(int*) is "+ToString(sizeof(int*))+")\n";

            if ( !error.empty() )
            {
                char beep = 7;
                cout << "-- WARNING ! --" << beep << endl;
                cout << "Bad extension " + fullpath + " loaded :\n" + error;
                cout << "---------------" << endl;

                #if defined(RELEASE)//Load extension despite errors in non release build

                //Destroy the extension class THEN unload the library from memory
                destroy_extension(extensionPtr);
                CloseLibrary(extensionHdl);
                #endif

                #if defined(GD_IDE_ONLY) && defined(RELEASE) //Show errors in IDE only
                wxString userMsg = string(_("L'extension "))+ fullpath + string(_(" présente des erreurs :\n")) + error + string(_("\nL'extension n'a pas été chargée. Prenez contact avec le développeur pour plus d'informations." ));
                wxMessageBox(userMsg, _("Extension non compatible"), wxOK | wxICON_EXCLAMATION);
                #endif

                #if defined(RELEASE)//Load extension despite errors in non release build
                return;
                #endif
            }

            boost::shared_ptr<ExtensionBase> extension(extensionPtr, destroy_extension);
            extensionsManager->AddExtension(extension);
            return;
        }
    }
}

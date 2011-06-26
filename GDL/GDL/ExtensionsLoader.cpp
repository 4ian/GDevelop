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

#include "GDL/BaseObjectExtension.h"
#include "GDL/AudioExtension.h"
#include "GDL/MouseExtension.h"
#include "GDL/KeyboardExtension.h"
#include "GDL/JoystickExtension.h"
#include "GDL/TimeExtension.h"
#include "GDL/FileExtension.h"
#include "GDL/VariablesExtension.h"
#include "GDL/CameraExtension.h"
#include "GDL/WindowExtension.h"
#include "GDL/NetworkExtension.h"
#include "GDL/SpriteExtension.h"
#include "GDL/SceneExtension.h"
#include "GDL/AdvancedExtension.h"
#include "GDL/Object.h"
#include "GDL/Game.h"
#include "GDL/Version.h"
#include "GDL/ExtensionBase.h"
#include "GDL/DynamicExtensionBase.h"
#include "GDL/LocaleManager.h"

#if defined(GD_IDE_ONLY)
#include <wx/log.h>
#include <wx/msgdlg.h>
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

    //External extensions
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

    while (( lecture = readdir( rep ) ) )
    {
        string lec = lecture->d_name;
        if ( lec != "." && lec != ".." && lec.find(".xgd"+suffix, lec.length()-4-suffix.length()) != string::npos)
        {
            //Charger l'extension
            LoadStaticExtensionInManager(directory+"/"+lec);

            l++;
        }
    }

    closedir( rep );
	#elif defined(_MSC_VER)
	WIN32_FIND_DATA f;
	string dirPart = "/*.xgd";
	string dirComplete = directory + dirPart + suffix;
	HANDLE h = FindFirstFile(dirComplete.c_str(), &f);
	if(h != INVALID_HANDLE_VALUE)
	{
		do
		{
			LoadStaticExtensionInManager(f.cFileName);
		} while(FindNextFile(h, &f));
	}
	#else
		#warning Compiler not supported ( but might support one style of directory listing, update defines if necessary ) for dynamic libraries loading
	#endif
}
/*
void SignalHandler(int signal)
{
    printf("Crash when loading an extension.\n");
}*/

void ExtensionsLoader::LoadStaticExtensionInManager(std::string fullpath)
{
    /*typedef void (*SignalHandlerPointer)(int);

    SignalHandlerPointer previousHandler;
    previousHandler = signal(SIGSEGV, SignalHandler);*/

    //Log file in IDE only
    #if defined(GD_IDE_ONLY)
    {
        wxFile errorDetectFile("ExtensionBeingLoaded.log", wxFile::write);
        errorDetectFile.Write(fullpath);
    }
    #endif

    GDpriv::ExtensionsManager * extensionsManager = GDpriv::ExtensionsManager::GetInstance();
    Handle extensionHdl = OpenLibrary(fullpath.c_str());
    if (extensionHdl == NULL)
    {
        std::string error = DynamicLibraryLastError();

        cout << "Unable to load extension " << fullpath << "." << endl;
        cout << "Error returned : \"" << error << "\"" << endl;
        #if defined(GD_IDE_ONLY)
        wxString userMsg = string(_T("L'extension "))+ fullpath + string(_T(" n'a pas pû être chargée.\nPrenez contact avec le développeur pour plus d'informations.\n\nErreur détaillée :\n") + error);
        wxMessageBox(userMsg, _T("Extension non compatible"), wxOK | wxICON_EXCLAMATION);
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
            wxString userMsg = string(_T("L'extension "))+ fullpath + string(_T(" n'a pas pû être chargée.\nPrenez contact avec le développeur pour plus d'informations." ));
            wxMessageBox(userMsg, _T("Extension non compatible"), wxOK | wxICON_EXCLAMATION);
            #endif
        }
        else
        {
            ExtensionBase * extensionPtr = create_extension();
            boost::shared_ptr<ExtensionBase> extension(extensionPtr, destroy_extension);

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
                error += "Not the same Boost version.";

            else if ( extensionPtr->compilationInfo.gdlVersion != RC_FILEVERSION_STRING)
                error += "Not the same GDL version.\n";

            else if ( extensionPtr->compilationInfo.sizeOfpInt != sizeof(int*))
                error += "Not the same architecture.\n";

            if ( !error.empty() )
            {
                char beep = 7;
                cout << "-- WARNING ! --" << beep << endl;
                cout << "Bad extension " + fullpath + " loaded :\n" + error;
                cout << "---------------" << endl;

                #if defined(RELEASE)//Load extension despite errors in non release build
                CloseLibrary(extensionHdl);
                #endif
                #if defined(GD_IDE_ONLY) && defined(RELEASE) //Show errors in IDE only
                wxString userMsg = string(_T("L'extension "))+ fullpath + string(_T(" présente des erreurs :\n")) + error + string(_T("\nL'extension n'a pas été chargée. Prenez contact avec le développeur pour plus d'informations." ));
                wxMessageBox(userMsg, _T("Extension non compatible"), wxOK | wxICON_EXCLAMATION);
                #endif
                #if defined(GD_IDE_ONLY)
                wxRemoveFile("ExtensionBeingLoaded.log");
                #endif
                #if defined(RELEASE)//Load extension despite errors in non release build
                //signal(SIGSEGV, previousHandler);
                return;
                #endif
            }

            extensionsManager->AddExtension(extension);
            #if defined(GD_IDE_ONLY) //In editor, load catalog associated with extension, if any.
            GDpriv::LocaleManager::GetInstance()->AddCatalog(extension->GetName());
            #endif
            #if defined(GD_IDE_ONLY)
            wxRemoveFile("ExtensionBeingLoaded.log");
            #endif
            //signal(SIGSEGV, previousHandler);
            return;
        }
    }
}

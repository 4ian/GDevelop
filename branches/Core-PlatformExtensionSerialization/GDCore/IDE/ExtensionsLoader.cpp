/** \file
 *  Game Develop
 *  2008-2014 Florian Rival (Florian.Rival@gmail.com)
 */


#include <boost/version.hpp>
#include "GDCore/PlatformDefinition/PlatformExtension.h"
#include "GDCore/PlatformDefinition/Platform.h"
#include "GDCore/IDE/ExtensionsLoader.h"
#include "GDCore/Tools/Version.h"
#include "GDCore/Tools/DynamicLibrariesTools.h"
#include "GDCore/CommonTools.h"
#if defined(GD_IDE_ONLY)
#include <wx/log.h>
#include <wx/msgdlg.h>
#include <wx/filename.h>
#include "GDCore/Tools/Locale/LocaleManager.h"
#endif

//Compiler specific include, for listing files of directory ( see below )
#if defined(__GNUC__)
#include <dirent.h>
#elif defined(_MSC_VER)
#include <windows.h>
#endif

typedef gd::PlatformExtension* (*createExtension)();
typedef void (*destroyExtension)(gd::PlatformExtension*);

using namespace std;

namespace gd
{

void ExtensionsLoader::LoadAllExtensions(const std::string & directory, gd::Platform & platform)
{
    string suffix = "";

    #if defined(WINDOWS)
        suffix += "w";
    #elif defined(LINUX)
        suffix += "l";
    #elif defined(MAC)
        suffix += "m";
    #else
        #warning No target system defined.
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
        cout << "Unable to open Extensions ("<< directory <<") directory." << endl;
        return;
    }

    std::vector<std::string> librariesLoaded;
    while ( (lecture = readdir( rep )) )
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

            LoadExtension(directory+"/"+lec, platform);

            //Everything is ok : Delete the log file
            #if defined(GD_IDE_ONLY)
            wxRemoveFile(wxFileName::GetTempDir()+"/ExtensionBeingLoaded.log");
            #endif

            librariesLoaded.push_back(directory+"/"+lec);

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
            //Use a log file, in IDE only
            #if defined(GD_IDE_ONLY)
            {
                wxFile errorDetectFile(wxFileName::GetTempDir()+"/ExtensionBeingLoaded.log", wxFile::write);
                errorDetectFile.Write(f.cFileName);
            }
            #endif

			LoadExtension(f.cFileName, platform);

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

void ExtensionsLoader::ExtensionsLoadingDone(const std::string & directory)
{
    string suffix = "";

    #if defined(WINDOWS)
        suffix += "w";
    #elif defined(LINUX)
        suffix += "l";
    #elif defined(MAC)
        suffix += "m";
    #else
        #warning No target system defined.
    #endif

    #if defined(GD_IDE_ONLY)
        suffix += "e";
    #endif

    #if defined(LINUX) || defined (MAC)

    //List all extensions loaded
    struct dirent *lecture;
    DIR *rep;
    rep = opendir( directory.c_str() );
    int l = 0;

    if ( rep == NULL )
    {
        cout << "Unable to open Extensions ("<< directory <<") directory." << endl;
        return;
    }

    std::vector<std::string> librariesLoaded;
    while ( (lecture = readdir( rep )) )
    {
        string lec = lecture->d_name;
        if ( lec != "." && lec != ".." && lec.find(".xgd"+suffix, lec.length()-4-suffix.length()) != string::npos)
        {
            librariesLoaded.push_back(directory+"/"+lec);
            l++;
        }
    }

    closedir( rep );

    //Libraries are loaded using dlopen(.., RTLD_LAZY|RTLD_LOCAL) meaning that their symbols are not available for other libraries
    //nor for LLVM/Clang. We then reload set them as global to make their symbols available for LLVM/Clang. We couldn't mark them
    //as global when loading them as every extension use the sames "Create/DestroyGDExtension" symbols.
    //SetLibraryGlobal is also setting RTLD_NOW to ensure that all symbols are resolved: Otherwise, we can get weird
    //"symbol lookup error" even if the symbols exist in the extensions!
    for (unsigned int i = 0;i<librariesLoaded.size();++i)
        SetLibraryGlobal(librariesLoaded[i].c_str());
    #else
    //Nothing to do on Windows.
    #endif
}

void ExtensionsLoader::LoadExtension(const std::string & fullpath, gd::Platform & platform)
{
    if ( platform.GetExtensionCreateFunctionName().empty() || platform.GetExtensionDestroyFunctionName().empty() )
    {
        cout << "Unable to load extension " << fullpath << ":" << endl;
        cout << "The plaftorm does not support extensions creation/destruction." << endl;
        return;
    }

    Handle extensionHdl = OpenLibrary(fullpath.c_str());
    if (extensionHdl == NULL)
    {
        std::string error = DynamicLibraryLastError();

        cout << "Unable to load extension " << fullpath << "." << endl;
        cout << "Error returned : \"" << error << "\"" << endl;
        #if defined(GD_IDE_ONLY)
        wxString userMsg = string(_("Extension "))+ fullpath + string(_(" could not be loaded.\nContact the developer for more informations.\n\nDetailed log:\n") + error);
        wxMessageBox(userMsg, _("Extension not compatible"), wxOK | wxICON_EXCLAMATION);
        #endif

        return;
    }

    createExtension create_extension = (createExtension)GetSymbol(extensionHdl, platform.GetExtensionCreateFunctionName().c_str());
    destroyExtension destroy_extension = (destroyExtension)GetSymbol(extensionHdl, platform.GetExtensionDestroyFunctionName().c_str());

    if ( create_extension == NULL || destroy_extension == NULL )
    {
        cout << "Unable to load extension " << fullpath << " ( no valid create/destroy functions )." << endl;

        #if defined(GD_IDE_ONLY)
        CloseLibrary(extensionHdl);
        wxString userMsg = string(_("Extension "))+ fullpath + string(_(" could not be loaded.\nContact the developer for more informations." ));
        wxMessageBox(userMsg, _("Extension not compatible"), wxOK | wxICON_EXCLAMATION);
        #endif

        return;
    }

    #if defined(GD_IDE_ONLY)
    gd::LocaleManager::GetInstance()->AddCatalog(ToString(wxFileName(fullpath).GetName())); //In editor, load catalog associated with extension, if any.
    #endif

    gd::PlatformExtension * extensionPtr = create_extension();
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
              extensionPtr->compilationInfo.gccMinorVersion != __GNUC_MINOR__ /*||
              extensionPtr->compilationInfo.gccPatchLevel != __GNUC_PATCHLEVEL__*/ )
        error += "Not the same GNU Compiler version.\n";

    #endif
    else if ( extensionPtr->compilationInfo.sfmlMajorVersion != 2 ||
              extensionPtr->compilationInfo.sfmlMinorVersion != 0 )
        error += "Not the same SFML version.\n";

    else if ( extensionPtr->compilationInfo.boostVersion != BOOST_VERSION )
        error += "Not the same Boost version.\n(Extension is using "+ToString(extensionPtr->compilationInfo.boostVersion)+", Game Develop is using "+ToString(BOOST_VERSION)+")\n";

    else if ( extensionPtr->compilationInfo.gdCoreVersion != GDCore_RC_FILEVERSION_STRING)
        error += "Not the same Game Develop Core version.\n(Extension is using "+extensionPtr->compilationInfo.gdCoreVersion+", Game Develop is using "+GDCore_RC_FILEVERSION_STRING+")\n";

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
        wxString userMsg = string(_("Extension "))+ fullpath + string(_(" has errors :\n")) + error + string(_("\nThe extension was not loaded. Contact the developer to get more information." ));
        wxMessageBox(userMsg, _("Extension not compatible"), wxOK | wxICON_EXCLAMATION);
        #endif

        #if defined(RELEASE)//Load extension despite errors in non release build
        return;
        #endif
    }

    boost::shared_ptr<gd::PlatformExtension> extension(extensionPtr, destroy_extension);
    platform.AddExtension(extension);
    return;
}

}

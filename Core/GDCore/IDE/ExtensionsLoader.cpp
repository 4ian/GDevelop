/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */

#include "GDCore/Extensions/PlatformExtension.h"
#include "GDCore/Extensions/Platform.h"
#include "GDCore/IDE/ExtensionsLoader.h"
#include "GDCore/Tools/Version.h"
#include "GDCore/Tools/DynamicLibrariesTools.h"
#include "GDCore/CommonTools.h"
#include "GDCore/Tools/Log.h"
#if defined(GD_IDE_ONLY) && !defined(GD_NO_WX_GUI)
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

using namespace std;

namespace gd
{

void ExtensionsLoader::LoadAllExtensions(const gd::String & directory, gd::Platform & platform, bool forgiving)
{
    std::cout << "Loading extensions for " << platform.GetName() << "... ";
    gd::String suffix = "";

    #if defined(WINDOWS)
        suffix += "w";
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

    std::vector<gd::String> librariesLoaded;
    while ( (lecture = readdir( rep )) )
    {
        gd::String lec = lecture->d_name;
        //Load all extensions, except the legacy ones finishing by *Automatism.xgd* from GD3.x
        if ( lec != "." && lec != ".." &&
            lec.find(".xgd"+suffix, lec.length()-4-suffix.length()) != string::npos &&
            lec.find("Automatism.xgd"+suffix) == string::npos)
        {
            //Use a log file, in IDE only
            #if defined(GD_IDE_ONLY) && !defined(GD_NO_WX_GUI)
            {
                wxFile errorDetectFile(wxFileName::GetTempDir()+"/ExtensionBeingLoaded.log", wxFile::write);
                errorDetectFile.Write(directory+"/"+lec);
            }
            #endif

            LoadExtension(directory+"/"+lec, platform, forgiving);

            //Everything is ok : Delete the log file
            #if defined(GD_IDE_ONLY) && !defined(GD_NO_WX_GUI)
            wxRemoveFile(wxFileName::GetTempDir()+"/ExtensionBeingLoaded.log");
            #endif

            librariesLoaded.push_back(directory+"/"+lec);

            l++;
        }
    }

    closedir( rep );

	#elif defined(_MSC_VER)
	WIN32_FIND_DATA f;
	gd::String dirPart = "/*.xgd";
	gd::String dirComplete = directory + dirPart + suffix;
	HANDLE h = FindFirstFile(dirComplete.c_str(), &f);
	if(h != INVALID_HANDLE_VALUE)
	{
		do
		{
            //Use a log file, in IDE only
            #if defined(GD_IDE_ONLY) && !defined(GD_NO_WX_GUI)
            {
                wxFile errorDetectFile(wxFileName::GetTempDir()+"/ExtensionBeingLoaded.log", wxFile::write);
                errorDetectFile.Write(f.cFileName);
            }
            #endif

			LoadExtension(f.cFileName, platform, forgiving);

            //Everything is ok : Delete the log file
            #if defined(GD_IDE_ONLY) && !defined(GD_NO_WX_GUI)
            wxRemoveFile(wxFileName::GetTempDir()+"/ExtensionBeingLoaded.log");
            #endif

		} while(FindNextFile(h, &f));
	}
	#else
		#warning Compiler not supported (but might support one style of directory listing, update defines if necessary) for dynamic libraries loading
	#endif
    std::cout << " done. " << std::endl;
}

void ExtensionsLoader::ExtensionsLoadingDone(const gd::String & directory)
{
    gd::String suffix = "";

    #if defined(WINDOWS)
        suffix += "w";
    #endif

    #if defined(GD_IDE_ONLY)
        suffix += "e";
    #endif

    #if defined(LINUX) || defined (MACOS)

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

    std::vector<gd::String> librariesLoaded;
    while ( (lecture = readdir( rep )) )
    {
        gd::String lec = lecture->d_name;
        if ( lec != "." && lec != ".." && lec.find(".xgd"+suffix, lec.length()-4-suffix.length()) != string::npos)
        {
            librariesLoaded.push_back(directory+"/"+lec);
            l++;
        }
    }

    closedir( rep );

    //Libraries are loaded using dlopen(.., RTLD_LAZY|RTLD_LOCAL) meaning that their symbols are not available for other libraries
    //nor for LLVM/Clang. We then reload set them as global to make their symbols available for LLVM/Clang. We couldn't mark them
    //as global when loading them as every extension use the same "CreateGDExtension" symbol.
    //SetLibraryGlobal is also setting RTLD_NOW to ensure that all symbols are resolved: Otherwise, we can get weird
    //"symbol lookup error" even if the symbols exist in the extensions!
    for (std::size_t i = 0;i<librariesLoaded.size();++i)
        SetLibraryGlobal(librariesLoaded[i].c_str());
    #else
    //Nothing to do on Windows.
    #endif
}

void ExtensionsLoader::LoadExtension(const gd::String & fullpath, gd::Platform & platform, bool forgiving)
{
    if ( platform.GetExtensionCreateFunctionName().empty() )
    {
        cout << "Unable to load extension " << fullpath << ":" << endl;
        cout << "The plaftorm does not support extensions creation." << endl;
        return;
    }

    Handle extensionHdl = OpenLibrary(fullpath.c_str());
    if (extensionHdl == NULL)
    {
        gd::String error = DynamicLibraryLastError();

        cout << "Unable to load extension " << fullpath << "." << endl;
        cout << "Error returned : \"" << error << "\"" << endl;
        #if defined(GD_IDE_ONLY) && !defined(GD_NO_WX_GUI)
        wxString userMsg = _("Extension ")+ fullpath + _(" could not be loaded.\nContact the developer for more informations.\n\nDetailed log:\n") + error;
        wxMessageBox(userMsg, _("Extension not compatible"), wxOK | wxICON_EXCLAMATION);
        #endif

        return;
    }

    createExtension create_extension = (createExtension)GetSymbol(extensionHdl, platform.GetExtensionCreateFunctionName().c_str());

    if (create_extension == NULL)
    {
        if (!forgiving)
        {
            cout << "Unable to load extension " << fullpath << " (Creation function symbol not found)." << endl;
            #if defined(GD_IDE_ONLY) && !defined(GD_NO_WX_GUI)
            wxString userMsg = _("Extension ")+ fullpath + _(" could not be loaded.\nContact the developer for more informations." );
            wxMessageBox(userMsg, _("Extension not compatible"), wxOK | wxICON_EXCLAMATION);
            #endif
        }

        CloseLibrary(extensionHdl);
        return;
    }

    #if defined(GD_IDE_ONLY) && !defined(GD_NO_WX_GUI)
    gd::LocaleManager::Get()->AddCatalog(wxFileName(fullpath).GetName()); //In editor, load catalog associated with extension, if any.
    #endif

    gd::PlatformExtension * extensionPtr = create_extension();
    gd::String error;

    //Perform safety check about the compilation
    if ( !extensionPtr->compilationInfo.informationCompleted )
        error += "Compilation information not filled.\n";

    #if defined(GD_IDE_ONLY)
    else if ( extensionPtr->compilationInfo.runtimeOnly )
        error += "Extension compiled for runtime only.\n";

    #if !defined(GD_NO_WX_GUI)
    else if ( extensionPtr->compilationInfo.wxWidgetsMajorVersion != wxMAJOR_VERSION ||
              extensionPtr->compilationInfo.wxWidgetsMinorVersion != wxMINOR_VERSION ||
              extensionPtr->compilationInfo.wxWidgetsReleaseNumber != wxRELEASE_NUMBER ||
              extensionPtr->compilationInfo.wxWidgetsSubReleaseNumber != wxSUBRELEASE_NUMBER )
        error += "Not the same wxWidgets version.\n";
    #endif
    #endif
    #if defined(__GNUC__)
    else if ( extensionPtr->compilationInfo.gccMajorVersion != __GNUC__ ||
              extensionPtr->compilationInfo.gccMinorVersion != __GNUC_MINOR__ )
        error += "Not the same GNU Compiler version.\n";

    #endif
    else if ( extensionPtr->compilationInfo.sfmlMajorVersion != 2 ||
              extensionPtr->compilationInfo.sfmlMinorVersion != 0 )
        error += "Not the same SFML version.\n";

    else if ( extensionPtr->compilationInfo.gdCoreVersion != GDCore_RC_FILEVERSION_STRING)
        error += "Not the same GDevelop Core version.\n(Extension is using "+extensionPtr->compilationInfo.gdCoreVersion+", GDevelop is using "+GDCore_RC_FILEVERSION_STRING+")\n";

    else if ( extensionPtr->compilationInfo.sizeOfpInt != sizeof(int*))
        error += "Not the same architecture.\n(Extension sizeof(int*) is "+gd::String::From(extensionPtr->compilationInfo.sizeOfpInt)+", GDevelop sizeof(int*) is "+gd::String::From(sizeof(int*))+")\n";

    if ( !error.empty() )
    {
        char beep = 7;
        cout << "-- WARNING ! --" << beep << endl;
        cout << "Bad extension " + fullpath + " loaded :\n" + error;
        cout << "---------------" << endl;

        #if defined(RELEASE)//Load extension despite errors in non release build

        //Destroy the extension class THEN unload the library from memory
        delete extensionPtr;
        CloseLibrary(extensionHdl);
        #endif

        #if defined(GD_IDE_ONLY) && !defined(GD_NO_WX_GUI) && defined(RELEASE) //Show errors in IDE only
        wxString userMsg = _("Extension ") + fullpath + _(" has errors :\n") +
            error + _("\nThe extension was not loaded. Contact the developer to get more information." );
        wxMessageBox(userMsg, _("Extension not compatible"), wxOK | wxICON_EXCLAMATION);
        #endif

        #if defined(RELEASE)//Load extension despite errors in non release build
        return;
        #endif
    }

    std::shared_ptr<gd::PlatformExtension> extension(extensionPtr);
    platform.AddExtension(extension);
    return;
}

}

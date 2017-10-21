/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */

#include "GDCore/String.h"
#include "GDCore/Tools/FileStream.h"
#include <algorithm>
#include "AbstractFileSystem.h"
#include "GDCore/CommonTools.h"
#include "GDCore/IDE/wxTools/RecursiveMkDir.h"
#if !defined(GD_NO_WX_GUI)
#include <fstream>
#include <wx/filename.h>
#include <iostream>
#include <wx/log.h>
#include <wx/filefn.h>
#include <wx/dir.h>
#endif

#undef CopyFile //Remove a Windows macro

namespace gd
{

AbstractFileSystem::~AbstractFileSystem()
{
}

gd::String gd::AbstractFileSystem::NormalizeSeparator(gd::String filename)
{
    //Convert all backslash to slashs.
    return filename.FindAndReplace("\\", "/");
}

#if !defined(GD_NO_WX_GUI)
NativeFileSystem *NativeFileSystem::singleton = NULL;

gd::String NativeFileSystem::FileNameFrom(const gd::String & file)
{
	wxFileName filename = wxFileName::FileName( file );
	return filename.GetFullName();
}

gd::String NativeFileSystem::DirNameFrom(const gd::String & file)
{
	wxFileName filename = wxFileName::FileName( file );
	return filename.GetPath();
}

bool NativeFileSystem::IsAbsolute(const gd::String & filename)
{
    return wxFileName::FileName(filename).IsAbsolute();
}

bool NativeFileSystem::MakeAbsolute(gd::String & fn, const gd::String & baseDirectory)
{
    wxFileName filename = wxFileName::FileName(fn);
    bool success = filename.MakeAbsolute(baseDirectory);
    fn = filename.GetFullPath();
    return success;
}

bool NativeFileSystem::MakeRelative(gd::String & fn, const gd::String & baseDirectory)
{
    wxFileName filename = wxFileName::FileName(fn);
    bool success = filename.MakeRelativeTo(baseDirectory);
    if (success)
    {
    	fn = filename.GetFullPath(wxPATH_UNIX);
    	return true;
    }

    return false;
}

bool NativeFileSystem::DirExists(const gd::String & path)
{
	return wxDirExists(path);
}

bool NativeFileSystem::FileExists(const gd::String & path)
{
    return wxFileExists(path);
}

void NativeFileSystem::MkDir(const gd::String & directory)
{
	RecursiveMkDir::MkDir(directory);
}

bool NativeFileSystem::ClearDir(const gd::String & directory)
{
    wxString file = wxFindFirstFile( directory + "/*" );
    while ( !file.empty() )
    {
        wxRemoveFile( file );
        file = wxFindNextFile();
    }

    return true;
}

gd::String NativeFileSystem::GetTempDir()
{
    return wxFileName::GetTempDir();
}

bool NativeFileSystem::WriteToFile(const gd::String & filename, const gd::String & content)
{
    gd::FileStream file( filename, std::ios_base::out );
    if ( file.is_open() ) {
        file << content.ToUTF8();
        file.close();
        return true;
    }

    return false;
}

gd::String NativeFileSystem::ReadFile(const gd::String & file)
{
    gd::FileStream t( file, std::ios_base::in );
    std::stringstream buffer;
    buffer << t.rdbuf();
    return gd::String::FromUTF8(buffer.str());
}


std::vector<gd::String> NativeFileSystem::ReadDir(const gd::String & path, const gd::String & extension)
{
    std::vector<gd::String> results;
    wxString upperExt = wxString(extension).Upper();

    wxString file = wxFindFirstFile( path + "/*" );
    while ( !file.empty() )
    {
        if ( upperExt.empty() || file.Upper().EndsWith(upperExt) )
            results.push_back(file);

        file = wxFindNextFile();
    }

    return results;
}

bool NativeFileSystem::CopyFile(const gd::String & file, const gd::String & destination)
{
    if (file == destination) return true; //No copy needed

    wxLogNull noLogPlease;
    return wxCopyFile( file, destination, true );
}

bool NativeFileSystem::CopyDir(const gd::String & source, const gd::String & destination)
{
    wxString sFrom = source.ToWxString();
    wxString sTo = destination.ToWxString();

    //As seen on https://forums.wxwidgets.org/viewtopic.php?t=2080
    if (sFrom[sFrom.Len() - 1] != '\\' && sFrom[sFrom.Len() - 1] != '/') sFrom += wxFILE_SEP_PATH;
    if (sTo[sTo.Len() - 1] != '\\' && sTo[sTo.Len() - 1] != '/') sTo += wxFILE_SEP_PATH;

    if (!::wxDirExists(sFrom)) {
        return false;
    }
    if (!wxDirExists(sTo)) {
        if (!wxFileName::Mkdir(sTo, 0777, wxPATH_MKDIR_FULL)) {
            return false;
        }
    }

    wxDir fDir(sFrom);
    wxString sNext = wxEmptyString;
    bool bIsFile = fDir.GetFirst(&sNext);
    while (bIsFile) {
        const wxString sFileFrom = sFrom + sNext;
        const wxString sFileTo = sTo + sNext;
        if (::wxDirExists(sFileFrom)) {
            CopyDir(sFileFrom, sFileTo);
        }
        else {
            if (!::wxFileExists(sFileTo)) {
                if (!::wxCopyFile(sFileFrom, sFileTo)) {
                    return false;
                }
            }
        }
        bIsFile = fDir.GetNext(&sNext);
    }
    return true;
}

NativeFileSystem & NativeFileSystem::Get()
{
    if ( !singleton ) singleton = new NativeFileSystem;
    return *singleton;
}

void NativeFileSystem::DestroySingleton()
{
    if ( singleton )
    {
        delete singleton;
        singleton = NULL;
    }
}

NativeFileSystem::~NativeFileSystem()
{
}
#endif
}

/*
 * GDevelop Core
 * Copyright 2008-2015 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */

#include "GDCore/String.h"
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
#endif

#undef CopyFile //Remove a Windows macro

namespace gd
{

AbstractFileSystem::~AbstractFileSystem()
{
}

gd::String gd::AbstractFileSystem::NormalizeSeparator(gd::String filename)
{
    gd::String file = filename;

    //Convert all backslash to slashs.
    while (file.find("\\") != gd::String::npos)
        file.replace(file.find("\\"), 1, "/");

    return file;
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
    std::ofstream file( filename.c_str() );
    if ( file.is_open() ) {
        file << content.ToUTF8();
        file.close();
        return true;
    }

    return false;
}

gd::String NativeFileSystem::ReadFile(const gd::String & file)
{
    std::ifstream t(file.c_str());
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
    wxLogNull noLogPlease;
    return wxCopyFile( file, destination, true );
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

/*
 * GDevelop Core
 * Copyright 2008-2015 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */

#include <string>
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

namespace gd
{

AbstractFileSystem::~AbstractFileSystem()
{
}

std::string gd::AbstractFileSystem::NormalizeSeparator(std::string filename)
{
    std::string file = filename;

    //Convert all backslash to slashs.
    while (file.find('\\') != std::string::npos)
        file.replace(file.find('\\'), 1, "/");

    return file;
}

#if !defined(GD_NO_WX_GUI)
NativeFileSystem *NativeFileSystem::singleton = NULL;

std::string NativeFileSystem::FileNameFrom(const std::string & file)
{
	wxFileName filename = wxFileName::FileName( file );
	return ToString(filename.GetFullName());
}

std::string NativeFileSystem::DirNameFrom(const std::string & file)
{
	wxFileName filename = wxFileName::FileName( file );
	return ToString(filename.GetPath());
}

bool NativeFileSystem::IsAbsolute(const std::string & filename)
{
    return wxFileName::FileName(filename).IsAbsolute();
}

bool NativeFileSystem::MakeAbsolute(std::string & fn, const std::string & baseDirectory)
{
    wxFileName filename = wxFileName::FileName(fn);
    bool success = filename.MakeAbsolute(baseDirectory);
    fn = ToString(filename.GetFullPath());
    return success;
}

bool NativeFileSystem::MakeRelative(std::string & fn, const std::string & baseDirectory)
{
    wxFileName filename = wxFileName::FileName(fn);
    bool success = filename.MakeRelativeTo(baseDirectory);
    if (success)
    {
    	fn = ToString(filename.GetFullPath(wxPATH_UNIX));
    	return true;
    }

    return false;
}

bool NativeFileSystem::DirExists(const std::string & path)
{
	return wxDirExists(path);
}

bool NativeFileSystem::FileExists(const std::string & path)
{
    return wxFileExists(path);
}

void NativeFileSystem::MkDir(const std::string & directory)
{
	RecursiveMkDir::MkDir(directory);
}

bool NativeFileSystem::ClearDir(const std::string & directory)
{
    wxString file = wxFindFirstFile( directory + "/*" );
    while ( !file.empty() )
    {
        wxRemoveFile( file );
        file = wxFindNextFile();
    }

    return true;
}

std::string NativeFileSystem::GetTempDir()
{
    return gd::ToString(wxFileName::GetTempDir());
}

bool NativeFileSystem::WriteToFile(const std::string & filename, const std::string & content)
{
    std::ofstream file( filename.c_str() );
    if ( file.is_open() ) {
        file << content;
        file.close();
        return true;
    }

    return false;
}

std::string NativeFileSystem::ReadFile(const std::string & file)
{
    std::ifstream t(file.c_str());
    std::stringstream buffer;
    buffer << t.rdbuf();
    return buffer.str();
}


std::vector<std::string> NativeFileSystem::ReadDir(const std::string & path, const std::string & extension)
{
    std::vector<std::string> results;
    wxString upperExt = wxString(extension).Upper();

    wxString file = wxFindFirstFile( path + "/*" );
    while ( !file.empty() )
    {
        if ( upperExt.empty() || file.Upper().EndsWith(upperExt) )
            results.push_back(gd::ToString(file));

        file = wxFindNextFile();
    }

    return results;
}

bool NativeFileSystem::CopyFile(const std::string & file, const std::string & destination)
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

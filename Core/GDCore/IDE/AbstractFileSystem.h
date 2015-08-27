/*
 * GDevelop Core
 * Copyright 2008-2015 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */

#ifndef GDCORE_ABSTRACTFILESYSTEM
#define GDCORE_ABSTRACTFILESYSTEM
#include <vector>
#include "GDCore/String.h"

#undef CopyFile //Remove a Windows macro

namespace gd
{

/**
 * \brief AbstractFileSystem is used to do classical file manipulation
 * in a way that is agnostic of the platform.
 *
 * \see gd::NativeFileSystem
 * \ingroup IDE
 */
class GD_CORE_API AbstractFileSystem
{
public:

    virtual ~AbstractFileSystem();

    /**
     * \brief Make sure that only slash are used as a path separator:
     * all backslashs are converted to forward slashs.
     *
     * Use this method when you get a filename from a file dialog for example:
     * it ensures that filenames will be usable from Windows to Linux (as long
     * as the filename is not an absolute path).
     *
     * @param filename The filename to normalize
     * @return The normalized filename.
     */
    static gd::String NormalizeSeparator(gd::String filename);

    /**
     * \brief Create the specified directory.
     * \param path The directory to create.
     */
    virtual void MkDir(const gd::String & path) = 0;

    /**
     * \brief Return true if the specified directory exists
     */
    virtual bool DirExists(const gd::String & path) = 0;

    /**
     * \brief Return true if the specified file exists
     */
    virtual bool FileExists(const gd::String & path) = 0;

    /**
     * \brief Clear the directory given as parameter, removing all the files.
     */
    virtual bool ClearDir(const gd::String & directory) = 0;

    /**
     * \brief Get a directory suitable for temporary files.
     */
    virtual gd::String GetTempDir() = 0;

    /**
     * \brief Extract the name of the file (with its extension) from a path.
     */
    virtual gd::String FileNameFrom(const gd::String & file) = 0;

    /**
     * \brief Extract the path without the filename.
     */
    virtual gd::String DirNameFrom(const gd::String & file) = 0;

    /**
     * \brief Change the filename so that it is absolute, using the base directory passed as parameter.
     * \return true if the operation succeeded.
     */
    virtual bool MakeAbsolute(gd::String & filename, const gd::String & baseDirectory) = 0;

    /**
     * \brief Return true if the filename is absolute
     */
    virtual bool IsAbsolute(const gd::String & filename) = 0;

    /**
     * \brief Change the filename so that it is relative to the base directory passed as parameter.
     * \return true if the operation succeeded.
     */
    virtual bool MakeRelative(gd::String & filename, const gd::String & baseDirectory) = 0;

    /**
     * \brief Copy a file
     * \return true if the operation succeeded.
     */
    virtual bool CopyFile(const gd::String & file, const gd::String & destination) = 0;
    
    /**
     * \brief Copy a whole directory
     * \return true if the operation succeeded.
     */
    virtual bool CopyDir(const gd::String & source, const gd::String & destination) = 0;

    /**
     * \brief Write the content of a string to a file.
     * \return true if the operation succeeded.
     */
    virtual bool WriteToFile(const gd::String & file, const gd::String & content) = 0;

    /**
     * \brief Read the content of a file.
     * \return The content of the file.
     */
    virtual gd::String ReadFile(const gd::String & file) = 0;

    /**
     * \brief Return a vector containing the files in the specified path
     *
     * \param path The path to read
     * \param extension If specified, only file finishing with this extension will be returned
     * \return A vector with all the matched files
     */
    virtual std::vector<gd::String> ReadDir(const gd::String & path, const gd::String & extension = "") = 0;

protected:
    AbstractFileSystem() {};
};

#if !defined(GD_NO_WX_GUI)
/**
 * \brief Implementation of AbstractFileSystem using wxWidgets to
 * manipulate files as usual: Most calls are redirected to wxWidgets call.
 *
 * \ingroup IDE
 */
class GD_CORE_API NativeFileSystem : public AbstractFileSystem
{
public:
    /**
     * \brief Get the NativeFileSystem instance.
     */
    static NativeFileSystem & Get();

	virtual void MkDir(const gd::String & path);
    virtual bool DirExists(const gd::String & path);
    virtual bool FileExists(const gd::String & path);
    virtual gd::String FileNameFrom(const gd::String & file);
    virtual gd::String DirNameFrom(const gd::String & file);
    virtual bool MakeAbsolute(gd::String & filename, const gd::String & baseDirectory);
    virtual bool MakeRelative(gd::String & filename, const gd::String & baseDirectory);
    virtual bool IsAbsolute(const gd::String & filename);
    virtual bool CopyFile(const gd::String & file, const gd::String & destination);
    virtual bool CopyDir(const gd::String & source, const gd::String & destination);
    virtual bool ClearDir(const gd::String & directory);
    virtual bool WriteToFile(const gd::String & file, const gd::String & content);
    virtual gd::String ReadFile(const gd::String & file);
    virtual gd::String GetTempDir();
    virtual std::vector<gd::String> ReadDir(const gd::String & path, const gd::String & extension = "");

    /**
     * \brief Destroy the singleton.
     * \note You do not need usually to call this method.
     **/
    static void DestroySingleton();

private:
    NativeFileSystem() {};
    virtual ~NativeFileSystem();

    static NativeFileSystem * singleton;
};
#endif

}

#endif // GDCORE_ABSTRACTFILESYSTEM

/** \file
 *  Game Develop
 *  2008-2014 Florian Rival (Florian.Rival@gmail.com)
 */

#ifndef GDCORE_ABSTRACTFILESYSTEM
#define GDCORE_ABSTRACTFILESYSTEM
#include <vector>
#include <string>

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
     * \brief Create the specified directory.
     * \param path The directory to create.
     */
    virtual void MkDir(const std::string & path) = 0;

    /**
     * \brief Return true if the specified directory exists
     */
    virtual bool DirExists(const std::string & path) = 0;

    /**
     * \brief Return true if the specified file exists
     */
    virtual bool FileExists(const std::string & path) = 0;

    /**
     * \brief Clear the directory given as parameter, removing all the files.
     */
    virtual bool ClearDir(const std::string & directory) = 0;

    /**
     * \brief Get a directory suitable for temporary files.
     */
    virtual std::string GetTempDir() = 0;

    /**
     * \brief Extract the name of the file (with its extension) from a path.
     */
    virtual std::string FileNameFrom(const std::string & file) = 0;

    /**
     * \brief Extract the path without the filename.
     */
    virtual std::string DirNameFrom(const std::string & file) = 0;

    /**
     * \brief Change the filename so that it is absolute, using the base directory passed as parameter.
     * \return true if the operation succeeded.
     */
    virtual bool MakeAbsolute(std::string & filename, const std::string & baseDirectory) = 0;

    /**
     * \brief Return true if the filename is absolute
     */
    virtual bool IsAbsolute(const std::string & filename) = 0;

    /**
     * \brief Change the filename so that it is relative to the base directory passed as parameter.
     * \return true if the operation succeeded.
     */
    virtual bool MakeRelative(std::string & filename, const std::string & baseDirectory) = 0;

    virtual bool CopyFile(const std::string & file, const std::string & destination) = 0;

    virtual bool WriteToFile(const std::string & file, const std::string & content) = 0;

    virtual std::string ReadFile(const std::string & file) = 0;

    virtual std::vector<std::string> ReadDir(const std::string & path, const std::string & extension = "") = 0;

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

	virtual void MkDir(const std::string & path);
    virtual bool DirExists(const std::string & path);
    virtual bool FileExists(const std::string & path);
    virtual std::string FileNameFrom(const std::string & file);
    virtual std::string DirNameFrom(const std::string & file);
    virtual bool MakeAbsolute(std::string & filename, const std::string & baseDirectory);
    virtual bool MakeRelative(std::string & filename, const std::string & baseDirectory);
    virtual bool IsAbsolute(const std::string & filename);
    virtual bool CopyFile(const std::string & file, const std::string & destination);
    virtual bool ClearDir(const std::string & directory);
    virtual bool WriteToFile(const std::string & file, const std::string & content);
    virtual std::string ReadFile(const std::string & file);
    virtual std::string GetTempDir();
    virtual std::vector<std::string> ReadDir(const std::string & path, const std::string & extension = "");

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
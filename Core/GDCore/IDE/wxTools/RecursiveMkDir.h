/** \file
 *  Game Develop
 *  2008-2014 Florian Rival (Florian.Rival@gmail.com)
 */
#if defined(GD_IDE_ONLY) && !defined(GD_NO_WX_GUI)
#ifndef RECURSIVEMKDIR_H
#define RECURSIVEMKDIR_H
class wxString;

namespace gd
{

/**
 * \brief Provides an access to a recursive mkdir function.
 *
 * \ingroup IDE
 * \ingroup wxTools
 */
class GD_CORE_API RecursiveMkDir
{
public:

    /**
     * Ensure that the \a directory is created by calling mkdir for each non existent directory
     * which is found.
     *
     * \param directory The path to the directory
     * \return true on success
     */
    static bool MkDir(wxString directory);

private:
};

}

#endif // RECURSIVEMKDIR_H
#endif
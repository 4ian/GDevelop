/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
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

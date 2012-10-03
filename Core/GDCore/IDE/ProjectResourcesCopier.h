/** \file
 *  Game Develop
 *  2008-2012 Florian Rival (Florian.Rival@gmail.com)
 */
#ifndef PROJECTRESOURCESCOPIER_H
#define PROJECTRESOURCESCOPIER_H
#include <string>
namespace gd { class Project; }
class wxProgressDialog;

namespace gd
{

/**
 * \brief Copy all resources files of a project to a directory.
 *
 * \ingroup IDE
 */
class GD_CORE_API ProjectResourcesCopier
{
public:
    /**
     * \brief Copy all resources files of a \a project to a the specified \a destinationDirectory.
     *
     * \return true if no error happened
     */
    static bool CopyAllResourcesTo(gd::Project & project, std::string destinationDirectory, wxProgressDialog * optionalProgressDialog = NULL);
};

}

#endif // PROJECTRESOURCESCOPIER_H

/** \file
 *  Game Develop
 *  2008-2012 Florian Rival (Florian.Rival@gmail.com)
 */
#ifndef PLATFORMMANAGER_H
#define PLATFORMMANAGER_H
#include <vector>
#include <boost/shared_ptr.hpp>
#include "GDCore/PlatformDefinition/Platform.h"

/**
 * \brief Manages the platforms available in the IDE
 */
class PlatformManager
{
public:

    bool AddPlatform(boost::shared_ptr<gd::Platform> newPlatform);
    const std::vector< boost::shared_ptr<gd::Platform> > & GetAllPlatforms() const { return platformsLoaded; };
    boost::shared_ptr<gd::Platform> GetPlatform(const std::string & platformName) const;

    static PlatformManager *GetInstance()
    {
        if ( NULL == _singleton )
        {
            _singleton = new PlatformManager;
        }

        return ( static_cast<PlatformManager*>( _singleton ) );
    }

    static void DestroySingleton()
    {
        if ( NULL != _singleton )
        {
            delete _singleton;
            _singleton = NULL;
        }
    }

private:
    std::vector< boost::shared_ptr<gd::Platform> > platformsLoaded;

    PlatformManager();
    virtual ~PlatformManager();
    static PlatformManager *_singleton;
};

#endif // PLATFORMMANAGER_H


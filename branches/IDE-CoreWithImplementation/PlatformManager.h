/** \file
 *  Game Develop
 *  2008-2013 Florian Rival (Florian.Rival@gmail.com)
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

    /**
     * Add a new platform to be used by the IDE
     */
    bool AddPlatform(boost::shared_ptr<gd::Platform> newPlatform);

    /**
     * Get a (smart) pointer to the platform called \a platformName.
     */
    boost::shared_ptr<gd::Platform> GetPlatform(const std::string & platformName) const;

    const std::vector< boost::shared_ptr<gd::Platform> > & GetAllPlatforms() const { return platformsLoaded; };

    /**
     * Notify each platform that the IDE is ready, by calling their OnIDEInitialized member function.
     */
    void NotifyPlatformIDEInitialized() const;

    static PlatformManager *GetInstance()
    {
        if ( NULL == _singleton )
        {
            _singleton = new PlatformManager;
        }

        return ( static_cast<PlatformManager*>( _singleton ) );
    }

    /**
     * Destroy the global platform manager. This is called by the IDE before shutting down.
     * ( Otherwise, platforms won't get notified that the IDE closed. )
     */
    static void DestroySingleton()
    {
        if ( NULL != _singleton )
        {
            for (unsigned int i = 0;i<_singleton->platformsLoaded.size();++i)
            {
                if ( _singleton->platformsLoaded[i] != boost::shared_ptr<gd::Platform>() )
                    _singleton->platformsLoaded[i]->OnIDEClosed();
            }

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


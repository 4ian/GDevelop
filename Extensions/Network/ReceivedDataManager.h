/**

GDevelop - Network Extension
Copyright (c) 2010-2016 Florian Rival (Florian.Rival@gmail.com)
This project is released under the MIT License.
*/

#ifndef RECEIVEDDATAMANAGER_H
#define RECEIVEDDATAMANAGER_H
#include <map>
#include <string>
#include "GDCpp/Runtime/String.h"

/**
 * Singleton where is stocked receveid data from other peers.
 */
class GD_EXTENSION_API ReceivedDataManager
{
    public:

    static ReceivedDataManager *Get()
    {
        if ( !_singleton )
        {
            _singleton = new ReceivedDataManager;
        }

        return ( static_cast<ReceivedDataManager*>( _singleton ) );
    }

    static void DestroySingleton()
    {
        if ( _singleton )
        {
            delete _singleton;
            _singleton = 0;
        }
    }

    std::map<gd::String, double> values;
    std::map<gd::String, gd::String> strings;

    protected:
    private:

    ReceivedDataManager() {};
    ~ReceivedDataManager() {};

    static ReceivedDataManager *_singleton;
};

#endif // RECEIVEDDATAMANAGER_H

/**

Game Develop - Network Extension
Copyright (c) 2010-2014 Florian Rival (Florian.Rival@gmail.com)

This software is provided 'as-is', without any express or implied
warranty. In no event will the authors be held liable for any damages
arising from the use of this software.

Permission is granted to anyone to use this software for any purpose,
including commercial applications, and to alter it and redistribute it
freely, subject to the following restrictions:

    1. The origin of this software must not be misrepresented; you must not
    claim that you wrote the original software. If you use this software
    in a product, an acknowledgment in the product documentation would be
    appreciated but is not required.

    2. Altered source versions must be plainly marked as such, and must not be
    misrepresented as being the original software.

    3. This notice may not be removed or altered from any source
    distribution.

*/

#ifndef RECEIVEDDATAMANAGER_H
#define RECEIVEDDATAMANAGER_H
#include <map>
#include <string>

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

    std::map<std::string, double> values;
    std::map<std::string, std::string> strings;

    protected:
    private:

    ReceivedDataManager() {};
    ~ReceivedDataManager() {};

    static ReceivedDataManager *_singleton;
};

#endif // RECEIVEDDATAMANAGER_H


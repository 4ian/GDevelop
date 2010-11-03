#ifndef RECEIVEDDATAMANAGER_H
#define RECEIVEDDATAMANAGER_H
#include <map>
#include <string>

class ReceivedDataManager
{
    public:

    static ReceivedDataManager *getInstance()
    {
        if ( !_singleton )
        {
            _singleton = new ReceivedDataManager;
        }

        return ( static_cast<ReceivedDataManager*>( _singleton ) );
    }

    static void kill()
    {
        if ( _singleton )
        {
            delete _singleton;
            _singleton = 0;
        }
    }

    std::map<std::string, double> values;

    protected:
    private:

    ReceivedDataManager() {};
    ~ReceivedDataManager() {};

    static ReceivedDataManager *_singleton;
};

#endif // RECEIVEDDATAMANAGER_H

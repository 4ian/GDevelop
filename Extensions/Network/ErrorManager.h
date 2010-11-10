#ifndef ERRORMANAGER_H
#define ERRORMANAGER_H

#include <string>
#include <iostream>

class ErrorManager
{
    public:

    static ErrorManager *getInstance()
    {
        if ( !_singleton )
        {
            _singleton = new ErrorManager;
        }

        return ( static_cast<ErrorManager*>( _singleton ) );
    }

    static void kill()
    {
        if ( _singleton )
        {
            delete _singleton;
            _singleton = 0;
        }
    }

    void SetLastError(std::string error)
    {
        lastErrorString = error;
        #if !defined(RELEASE)
        std::cout << lastErrorString;
        #endif
    };
    std::string GetLastError() const {return lastErrorString;};

    private:
    std::string lastErrorString;

    ErrorManager() {};
    ~ErrorManager() {};

    static ErrorManager *_singleton;
};

#endif // ERRORMANAGER_H

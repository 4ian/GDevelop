#ifndef ERRORMANAGER_H
#define ERRORMANAGER_H

#include <string>
#include <iostream>
#include "GDCpp/Runtime/String.h"

class GD_EXTENSION_API ErrorManager
{
    public:

    static ErrorManager *Get()
    {
        if ( !_singleton )
        {
            _singleton = new ErrorManager;
        }

        return ( static_cast<ErrorManager*>( _singleton ) );
    }

    static void DestroySingleton()
    {
        if ( _singleton )
        {
            delete _singleton;
            _singleton = 0;
        }
    }

    void SetLastError(gd::String error)
    {
        lastErrorString = error;
        #if !defined(RELEASE)
        std::cout << lastErrorString;
        #endif
    };
    gd::String GetLastError() const {return lastErrorString;};

    private:
    gd::String lastErrorString;

    ErrorManager() {};
    ~ErrorManager() {};

    static ErrorManager *_singleton;
};

#endif // ERRORMANAGER_H

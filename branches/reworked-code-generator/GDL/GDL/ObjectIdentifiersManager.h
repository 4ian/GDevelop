#ifndef OBJECTIDENTIFERSMANAGER_H
#define OBJECTIDENTIFERSMANAGER_H

#include <string>
#include <boost/bimap/bimap.hpp>

/**
 * Objects are identified during Runtime by a
 * unique number correponding to their name.
 * ObjectIdentifiersManager handles name-to-identifier conversions.
 */
class GD_API ObjectIdentifiersManager
{
public:

    inline unsigned int GetOIDfromName(const std::string & name)
    {
        if ( nameToObjectIdentifer.left.find(name) != nameToObjectIdentifer.left.end())
            return nameToObjectIdentifer.left.find(name)->second;

        unsigned int lastId = nameToObjectIdentifer.size();
        nameToObjectIdentifer.insert( StringToObjectIdBiMap::value_type(name, lastId) );

        return lastId;
    }

    inline std::string GetNamefromOID(unsigned int oID)
    {
        if ( nameToObjectIdentifer.right.find(oID) != nameToObjectIdentifer.right.end())
            return nameToObjectIdentifer.right.find(oID)->second;

        return "";
    }

    static ObjectIdentifiersManager *GetInstance()
    {
        if ( NULL == _singleton )
        {
            _singleton = new ObjectIdentifiersManager;
        }

        return ( static_cast<ObjectIdentifiersManager*>( _singleton ) );
    }

    static void DestroySingleton()
    {
        if ( NULL != _singleton )
        {
            delete _singleton;
            _singleton = NULL;
        }
    }
protected:
private:

    typedef boost::bimaps::bimap < std::string, unsigned int > StringToObjectIdBiMap;
    StringToObjectIdBiMap nameToObjectIdentifer;

    ObjectIdentifiersManager();
    virtual ~ObjectIdentifiersManager();

    static ObjectIdentifiersManager *_singleton;
};

#endif // OBJECTIDENTIFERSMANAGER_H

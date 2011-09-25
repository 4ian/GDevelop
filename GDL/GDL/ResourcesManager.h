#ifndef RESOURCESMANAGER_H
#define RESOURCESMANAGER_H
#include <boost/weak_ptr.hpp>
#include <vector>
#include <string>

/**
 * \brief Inventory the file name and some properties of files used as resources
 */
class ResourcesManager
{
    public:
        ResourcesManager();
        virtual ~ResourcesManager();

        std::vector< boost::weak_ptr<std::string> > resourcesInUse;

    private:
};

#endif // RESOURCESMANAGER_H

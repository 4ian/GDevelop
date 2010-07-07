#if defined(GDE)

#ifndef RESOURCESMERGINGHELPER_H
#define RESOURCESMERGINGHELPER_H

#include <string>
#include <map>

/**
 * ResourcesMergingHelper is used during compilation
 */
class GD_API ResourcesMergingHelper
{
    public:
        ResourcesMergingHelper() {};
        virtual ~ResourcesMergingHelper() {};

        std::string GetNewFilename(std::string resourceFilename);
        std::map<std::string, std::string> & GetAllResourcesNewFilename() { return resourcesNewFilename; };

    private:
        std::map<std::string, std::string> resourcesNewFilename;
};

#endif // RESOURCESMERGINGHELPER_H
#endif

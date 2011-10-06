/** \file
 *  Game Develop
 *  2008-2011 Florian Rival (Florian.Rival@gmail.com)
 */

#ifndef RESOURCESMANAGER_H
#define RESOURCESMANAGER_H
#include <boost/shared_ptr.hpp>
#include <vector>
#include <string>

/**
 * \brief Base class to describe a resource used by a game.
 */
class Resource
{
public:
    Resource() {};
    ~Resource() {};
    virtual boost::shared_ptr<Resource> Clone() { return boost::shared_ptr<Resource>(new Resource(*this));}

    std::string kind;
    std::string name;
};

/**
 * \brief Describe an image used by a game.
 */
class ImageResource : public Resource
{
public:
    ImageResource() {};
    ~ImageResource() {};
    virtual boost::shared_ptr<Resource> Clone() { return boost::shared_ptr<ImageResource>(new ImageResource(*this));}

    std::string file;
};

/**
 * \brief Inventory all resources used by the project
 */
class ResourcesManager
{
    public:
        ResourcesManager();
        virtual ~ResourcesManager();
        ResourcesManager(const ResourcesManager&);
        ResourcesManager& operator=(const ResourcesManager & rhs);

        std::vector< boost::shared_ptr<Resource> > resources;


    private:

        void Init(const ResourcesManager & other);
};

#endif // RESOURCESMANAGER_H

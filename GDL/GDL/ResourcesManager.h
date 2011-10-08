/** \file
 *  Game Develop
 *  2008-2011 Florian Rival (Florian.Rival@gmail.com)
 */

#ifndef RESOURCESMANAGER_H
#define RESOURCESMANAGER_H
#include <boost/shared_ptr.hpp>
#include <vector>
#include <string>
class TiXmlElement;

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
    bool userAdded; ///< True if the resource was added by the user, and not automatically by Game Develop.

    /**
     * Load an xml element.
     */
    virtual void LoadFromXml(const TiXmlElement * elem) {};

    #if defined(GD_IDE_ONLY)
    /**
     * Save to an xml element.
     */
    virtual void SaveToXml(TiXmlElement * elem) {};
    #endif
};

/**
 * \brief Describe an image used by a game.
 */
class ImageResource : public Resource
{
public:
    ImageResource() : smooth(true), alwaysLoaded(false) {};
    ~ImageResource() {};
    virtual boost::shared_ptr<Resource> Clone() { return boost::shared_ptr<ImageResource>(new ImageResource(*this));}

    std::string file;
    bool smooth; ///< True if smoothing filter is applied
    bool alwaysLoaded; ///< True if the image must always be loaded in memory.

    /**
     * Load from an xml element.
     */
    virtual void LoadFromXml(const TiXmlElement * elem);

    #if defined(GD_IDE_ONLY)
    /**
     * Save to an xml element.
     */
    virtual void SaveToXml(TiXmlElement * elem);
    #endif
};

class ResourceFolder
{
public:
    ResourceFolder() {};
    ~ResourceFolder() {};
    ResourceFolder(const ResourceFolder&);
    ResourceFolder& operator=(const ResourceFolder & rhs);

    std::string name;
    std::vector< boost::shared_ptr<Resource> > resources;

    /**
     * Load an xml element.
     */
    virtual void LoadFromXml(const TiXmlElement * elem);

    #if defined(GD_IDE_ONLY)
    /**
     * Save to an xml element.
     */
    virtual void SaveToXml(TiXmlElement * elem);
    #endif

private:

    void Init(const ResourceFolder & other);
};

/**
 * \brief Inventory all resources used by a project
 */
class ResourcesManager
{
    public:
        ResourcesManager();
        virtual ~ResourcesManager();
        ResourcesManager(const ResourcesManager&);
        ResourcesManager& operator=(const ResourcesManager & rhs);

        std::vector< boost::shared_ptr<Resource> > resources;
        std::vector< ResourceFolder > folders;

        static boost::shared_ptr<Resource> CreateResource(const std::string & kind);

        /**
         * Load an xml element.
         */
        virtual void LoadFromXml(const TiXmlElement * elem);

        #if defined(GD_IDE_ONLY)
        /**
         * Save to an xml element.
         */
        virtual void SaveToXml(TiXmlElement * elem);
        #endif

    private:

        void Init(const ResourcesManager & other);
};

#endif // RESOURCESMANAGER_H

/** \file
 *  Game Develop
 *  2008-2012 Florian Rival (Florian.Rival@gmail.com)
 */

#ifndef RESOURCESMANAGER_H
#define RESOURCESMANAGER_H
#include <boost/shared_ptr.hpp>
#include <vector>
#include <string>
class TiXmlElement;

#if defined(GD_IDE_ONLY)
class wxPaintDC;
class wxPanel;
namespace gd { class Project; }
#endif

/**
 * \brief Base class to describe a resource used by a game.
 *
 * \ingroup ResourcesManagement
 */
class GD_API Resource
{
public:
    Resource() {};
    ~Resource() {};
    virtual boost::shared_ptr<Resource> Clone() { return boost::shared_ptr<Resource>(new Resource(*this));}

    std::string kind;
    std::string name;
    bool userAdded; ///< True if the resource was added by the user, and not automatically by Game Develop.

    #if defined(GD_IDE_ONLY)
    /**
     * Called when user want to edit the resource main property
     *
     * \return true if the resource was changed
     */
    virtual bool EditMainProperty() {return false;};

    /**
     * Must return true if the resource use a file.
     *
     * \see GetFile
     */
    virtual bool UseFile() { return false; }

    /**
     * Must return, if applicable, a reference to the string containing the file used by the resource.
     * The file is relative to the project directory.
     *
     * \see UseFile
     */
    virtual std::string & GetFile() {return badStr;};

    /**
     * Must return, if applicable, a reference to the string containing the file used by the resource.
     * The file is relative to the project directory.
     *
     * \see UseFile
     */
    virtual const std::string & GetFile() const {return badStr;};

    #if defined(GD_IDE_ONLY)
    /**
     * Return, if applicable, a string containing the absolute filename of the resource.
     */
    std::string GetAbsoluteFile(const gd::Project & game);
    #endif

    /**
     * Return a description of the main property provided by the resource ( Example : "Image file" )
     */
    virtual std::string GetMainPropertyDescription() { return ""; };

    /**
     * Called when user want to edit the resource
     *
     * \return true if resource was changed
     */
    virtual bool EditResource(gd::Project & project) {return false;};

    /**
     * Called when the resource must be rendered in a preview panel.
     */
    virtual void RenderPreview(wxPaintDC & dc, wxPanel & previewPanel, gd::Project & game) {};
    #endif

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

private:
    static std::string badStr;
};

/**
 * \brief Describe an image used by a game.
 *
 * \see Resource
 * \ingroup ResourcesManagement
 */
class GD_API ImageResource : public Resource
{
public:
    ImageResource() : Resource(), smooth(true), alwaysLoaded(false) {kind = "image"; };
    ~ImageResource() {};
    virtual boost::shared_ptr<Resource> Clone() { return boost::shared_ptr<ImageResource>(new ImageResource(*this));}

    std::string file;
    bool smooth; ///< True if smoothing filter is applied
    bool alwaysLoaded; ///< True if the image must always be loaded in memory.

    #if defined(GD_IDE_ONLY)
    /**
     * Called when user want to edit the resource main property.
     *
     * \return true if resource was changed
     */
    virtual bool EditMainProperty();

    virtual bool UseFile() { return true; }

    /**
     * Return the file used by the resource.
     */
    virtual std::string & GetFile() {return file;};

    /**
     * Return the file used by the resource.
     */
    virtual const std::string & GetFile() const {return file;};

    /**
     * Return a description of the main property provided by the resource ( Example : "Image file" )
     */
    virtual std::string GetMainPropertyDescription();

    /**
     * Called when user want to edit the resource
     *
     * \return true if resource was changed
     */
    virtual bool EditResource(gd::Project & project);

    /**
     * Called when the resource must be rendered in a preview panel.
     */
    virtual void RenderPreview(wxPaintDC & dc, wxPanel & previewPanel, gd::Project & game);
    #endif

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

#if defined(GD_IDE_ONLY)
class GD_API ResourceFolder
{
public:
    ResourceFolder() {};
    virtual ~ResourceFolder() {};
    ResourceFolder(const ResourceFolder&);
    ResourceFolder& operator=(const ResourceFolder & rhs);

    /**
     * Add a resource from an already existing resource.
     */
    void AddResource(const std::string & name, std::vector< boost::shared_ptr<Resource> > & alreadyExistingResources);

    /**
     * Remove a resource
     */
    void RemoveResource(const std::string & name);

    /**
     * Return true if a resource is in the folder.
     */
    bool HasResource(const std::string & name) const;

    std::string name;
    std::vector< boost::shared_ptr<Resource> > resources;

    /**
     * Load an xml element.
     */
    virtual void LoadFromXml(const TiXmlElement * elem, std::vector< boost::shared_ptr<Resource> > & alreadyExistingResources);

    /**
     * Save to an xml element.
     */
    virtual void SaveToXml(TiXmlElement * elem);

private:

    void Init(const ResourceFolder & other);
};
#endif

/**
 * \brief Inventory all resources used by a project
 *
 * \see Resource
 * \ingroup ResourcesManagement
 */
class GD_API ResourcesManager
{
public:
    ResourcesManager();
    virtual ~ResourcesManager();
    ResourcesManager(const ResourcesManager&);
    ResourcesManager& operator=(const ResourcesManager & rhs);

    static boost::shared_ptr<Resource> CreateResource(const std::string & kind);

    /**
     * Remove a resource
     */
    void RemoveResource(const std::string & name);

    /**
     * Remove a resource
     */
    void RenameResource(const std::string & oldName, const std::string & newName);

    /**
     * Return true if a resource exists.
     */
    bool HasResource(const std::string & name) const;

    /**
     * Return a reference to a resource.
     */
    Resource & GetResource(const std::string & name);

    /**
     * Return a reference to a resource.
     */
    const Resource & GetResource(const std::string & name) const;

    /**
     * Return a (smart) pointer to a resource.
     */
    boost::shared_ptr<Resource> GetResourceSPtr(const std::string & name);

    #if defined(GD_IDE_ONLY)
    /** \name Folders management
     * Members functions related to folders management
     */
    ///@{
    /**
     * Return true if the folder exists.
     */
    bool HasFolder(const std::string & name) const;

    /**
     * Return a reference to a folder
     */
    const ResourceFolder & GetFolder(const std::string & name) const;

    /**
     * Return a reference to a folder
     */
    ResourceFolder & GetFolder(const std::string & name);

    /**
     * Remove a folder.
     */
    void RemoveFolder(const std::string & name);

    /**
     * Create a new empty folder.
     */
    void CreateFolder(const std::string & name);
    ///@}
    #endif

    std::vector< boost::shared_ptr<Resource> > resources;
    #if defined(GD_IDE_ONLY)
    std::vector< ResourceFolder > folders;
    #endif
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

    #if defined(GD_IDE_ONLY)
    static ResourceFolder badFolder;
    #endif
    static Resource badResource;
};

#endif // RESOURCESMANAGER_H

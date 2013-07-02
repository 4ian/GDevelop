/** \file
 *  Game Develop
 *  2008-2013 Florian Rival (Florian.Rival@gmail.com)
 */
#ifndef GDCORE_RESOURCESMANAGER_H
#define GDCORE_RESOURCESMANAGER_H
#include <boost/shared_ptr.hpp>
#include <string>
#include <vector>
namespace gd { class Project; }
namespace gd { class ResourceFolder; }
class TiXmlElement;
class wxString;
class wxPaintDC;
class wxPanel;

namespace gd
{

/**
 * \brief Base class to describe a resource used by a game.
 *
 * \ingroup ResourcesManagement
 */
class GD_CORE_API Resource
{
public:
    Resource() {};
    virtual ~Resource() {};
    virtual Resource* Clone() const { return new Resource(*this);}

    /** \brief Change the name of the resource with the name passed as parameter.
     */
    virtual void SetName(const std::string & name_) { name = name_;}

    /** \brief Return the name of the resource.
     */
    virtual const std::string & GetName() const {return name;}

    /** \brief Change the kind of the resource
     */
    virtual void SetKind(const std::string & newKind) { kind = newKind; }

    /** \brief Return the name of the object.
     */
    virtual const std::string & GetKind() const {return kind;}

    /** \brief Change if the resource is user added or not
     */
    virtual void SetUserAdded(bool isUserAdded) {userAdded = isUserAdded;}

    /** \brief Return true if the resource was added by the user
     */
    virtual bool IsUserAdded() const {return userAdded;}

    /**
     * \brief Return true if the resource use a file.
     *
     * \see GetFile
     */
    virtual bool UseFile() { return false; }

    /**
     * \brief Return, if applicable, a reference to the string containing the file used by the resource.
     * The file is relative to the project directory.
     *
     * \see UseFile
     */
    virtual std::string & GetFile() {return badStr;};

    /**
     * \brief Return, if applicable, a reference to the string containing the file used by the resource.
     * The file is relative to the project directory.
     *
     * \see UseFile
     */
    virtual const std::string & GetFile() const {return badStr;};

    /**
     * \brief Return, if applicable, a string containing the absolute filename of the resource.
     */
    std::string GetAbsoluteFile(const gd::Project & game) const;

    /**
     * \brief Called when a property must be edited ( i.e: it was double clicked )
     *
     * \return true if the resource was changed
     */
    virtual bool EditProperty(gd::Project & project, const std::string & property) { return true; };

    /**
     * \brief Called when a property must be changed ( i.e: its value was changed in the property grid )
     *
     * \return true if the resource was changed
     */
    virtual bool ChangeProperty(gd::Project & project, const std::string & property, const std::string & newValue) { return true; };

    /**
     * \brief Must return a description of the main property provided by the resource ( Example : "Image file" )
     */
    virtual void GetPropertyInformation(gd::Project & project, const std::string & property, wxString & userFriendlyName, wxString & description) const { return; };

    /**
     * \brief Called when a property must be changed ( i.e: its value was changed in the property grid )
     *
     * \return the value of the property
     */
    virtual std::string GetProperty(gd::Project & project, const std::string & property) { return ""; };

    /**
     * \brief Return a description of the main property provided by the resource ( Example : "Image file" )
     */
    virtual std::vector<std::string> GetAllProperties(gd::Project & project) const { std::vector<std::string> noProperties; return noProperties; };

    /**
     * \brief Called when the resource must be rendered in a preview panel.
     */
    virtual void RenderPreview(wxPaintDC & dc, wxPanel & previewPanel, gd::Project & game) {};

    /**
     * \brief Load from an xml element.
     */
    virtual void LoadFromXml(const TiXmlElement * elem) {};

    /**
     * \brief Save to an xml element.
     */
    virtual void SaveToXml(TiXmlElement * elem) const {};

private:
    std::string kind;
    std::string name;
    bool userAdded; ///< True if the resource was added by the user, and not automatically by Game Develop.

    static std::string badStr;
};

/**
 * \brief Describe an image/texture used by a project.
 *
 * \see Resource
 * \ingroup ResourcesManagement
 */
class GD_CORE_API ImageResource : public Resource
{
public:
    ImageResource() : Resource(), smooth(true), alwaysLoaded(false) { SetKind("image"); };
    virtual ~ImageResource() {};
    virtual ImageResource* Clone() const { return new ImageResource(*this);}

    /**
     * Return the file used by the resource.
     */
    virtual std::string & GetFile() {return file;};

    /**
     * Return the file used by the resource.
     */
    virtual const std::string & GetFile() const {return file;};

    #if defined(GD_IDE_ONLY)
    virtual bool UseFile() { return true; }

    /**
     * Called when the resource must be rendered in a preview panel.
     */
    virtual void RenderPreview(wxPaintDC & dc, wxPanel & previewPanel, gd::Project & game);

    /**
     * Called when a property must be edited ( i.e: it was double clicked )
     *
     * \return true if the resource was changed
     */
    virtual bool EditProperty(gd::Project & project, const std::string & property);

    /**
     * Called when a property must be changed ( i.e: its value was changed in the property grid )
     *
     * \return true if the resource was changed
     */
    virtual bool ChangeProperty(gd::Project & project, const std::string & property, const std::string & newValue);

    /**
     * Called when a property must be changed ( i.e: its value was changed in the property grid )
     *
     * \return the value of the property
     */
    virtual std::string GetProperty(gd::Project & project, const std::string & property);

    /**
     * Return a description of the main property provided by the resource ( Example : "Image file" )
     */
    virtual void GetPropertyInformation(gd::Project & project, const std::string & property, wxString & userFriendlyName, wxString & description) const;

    /**
     * Return a vector containing the name of all the properties of the resource
     */
    virtual std::vector<std::string> GetAllProperties(gd::Project & project) const;

    /**
     * Save to an xml element.
     */
    virtual void SaveToXml(TiXmlElement * elem) const;
    #endif

    /**
     * Load from an xml element.
     */
    virtual void LoadFromXml(const TiXmlElement * elem);

    bool smooth; ///< True if smoothing filter is applied
    bool alwaysLoaded; ///< True if the image must always be loaded in memory.
private:
    std::string file;
};

/**
 * \brief Inventory all resources used by a project
 *
 * \see Resource
 * \ingroup ResourcesManagement
 */
class GD_CORE_API ResourcesManager
{
public:
    ResourcesManager();
    virtual ~ResourcesManager();
    ResourcesManager(const ResourcesManager&);
    ResourcesManager& operator=(const ResourcesManager & rhs);

    /**
     * \brief Return true if a resource exists.
     */
    bool HasResource(const std::string & name) const;

    /**
     * \brief Return a reference to a resource.
     */
    Resource & GetResource(const std::string & name);

    /**
     * \brief Return a reference to a resource.
     */
    const Resource & GetResource(const std::string & name) const;

    /**
     * \brief Create a new resource but does not add it to the list
     */
    boost::shared_ptr<Resource> CreateResource(const std::string & kind);

    /**
     * \brief Get a list containing the name of all of the resources.
     */
    std::vector<std::string> GetAllResourcesList();

    #if defined(GD_IDE_ONLY)
    /**
     * \brief Return a (smart) pointer to a resource.
     */
    boost::shared_ptr<gd::Resource> GetResourceSPtr(const std::string & name);

    /**
     * \brief Add an already constructed resource
     */
    bool AddResource(const gd::Resource & resource);

    /**
     * \brief Add a resource created from a file.
     */
    bool AddResource(const std::string & name, const std::string & filename);

    /**
     * \brief Remove a resource
     */
    void RemoveResource(const std::string & name);

    /**
     * \brief Rename a resource
     */
    void RenameResource(const std::string & oldName, const std::string & newName);

    /**
     * \brief Move a resource up in the list
     */
    bool MoveResourceUpInList(const std::string & name);

    /**
     * \brief Move a resource down in the list
     */
    bool MoveResourceDownInList(const std::string & name);

    /**
     * \brief Return true if the folder exists.
     */
    bool HasFolder(const std::string & name) const;

    /**
     * \brief Return a reference to a folder
     */
    const ResourceFolder & GetFolder(const std::string & name) const;

    /**
     * \brief Return a reference to a folder
     */
    ResourceFolder & GetFolder(const std::string & name);

    /**
     * \brief Remove a folder.
     */
    void RemoveFolder(const std::string & name);

    /**
     * \brief Create a new empty folder.
     */
    void CreateFolder(const std::string & name);

    /**
     * \brief Move a folder up in the list
     */
    bool MoveFolderUpInList(const std::string & name);

    /**
     * \brief Move a folder down in the list
     */
    bool MoveFolderDownInList(const std::string & name);

    /**
     * \brief Get a list containing the name of all of the folders.
     */
    std::vector<std::string> GetAllFolderList();

    /**
     * \brief Save to an xml element.
     */
    void SaveToXml(TiXmlElement * elem) const;
    #endif

    /**
     * \brief Load from an xml element.
     */
    void LoadFromXml(const TiXmlElement * elem);

private:
    void Init(const ResourcesManager & other);

    std::vector< boost::shared_ptr<Resource> > resources;
    #if defined(GD_IDE_ONLY)
    std::vector< ResourceFolder > folders;
    #endif

    #if defined(GD_IDE_ONLY)
    static ResourceFolder badFolder;
    #endif
    static Resource badResource;
};

#if defined(GD_IDE_ONLY)
class GD_CORE_API ResourceFolder
{
public:
    ResourceFolder() {};
    virtual ~ResourceFolder() {};
    ResourceFolder(const ResourceFolder&);
    ResourceFolder& operator=(const ResourceFolder & rhs);

    /** Change the name of the folder with the name passed as parameter.
     */
    virtual void SetName(const std::string & name_) { name = name_;}

    /** Return the name of the folder.
     */
    virtual const std::string & GetName() const {return name;}

    /**
     * Add a resource from an already existing resource.
     */
    virtual void AddResource(const std::string & name, gd::ResourcesManager & parentManager);

    /**
     * Remove a resource
     */
    virtual void RemoveResource(const std::string & name);

    /**
     * Return true if a resource is in the folder.
     */
    virtual bool HasResource(const std::string & name) const;

    /**
     * Return a reference to a resource.
     */
    virtual Resource & GetResource(const std::string & name);

    /**
     * Return a reference to a resource.
     */
    virtual const Resource & GetResource(const std::string & name) const;

    /**
     * Get a list containing the name of all of the resources.
     */
    virtual std::vector<std::string> GetAllResourcesList();

    /**
     * Move a resource up in the list
     */
    virtual bool MoveResourceUpInList(const std::string & name);

    /**
     * Move a resource down in the list
     */
    virtual bool MoveResourceDownInList(const std::string & name);

    /**
     * Load an xml element.
     */
    virtual void LoadFromXml(const TiXmlElement * elem, gd::ResourcesManager & parentManager);

    /**
     * Save to an xml element.
     */
    virtual void SaveToXml(TiXmlElement * elem) const;

private:
    std::string name;
    std::vector< boost::shared_ptr<Resource> > resources;

    void Init(const ResourceFolder & other);
    static Resource badResource;
};
#endif

}

#endif // GDCORE_RESOURCESMANAGER_H

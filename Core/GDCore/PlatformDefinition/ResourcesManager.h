/** \file
 *  Game Develop
 *  2008-2012 Florian Rival (Florian.Rival@gmail.com)
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
    ~Resource() {};

    /**
     * Must return a pointer to a copy of the resource. A such method is needed to do polymorphic copies.
     * Just redefine this method in your derived object class like this:
     * \code
     * return new MyObject(*this);
     * \endcode
     */
    virtual Resource* Clone() const =0;

    /** Must change the name of the resource with the name passed as parameter.
     */
    virtual void SetName(const std::string & name) =0;

    /** Must return the name of the resource.
     */
    virtual const std::string & GetName() const =0;

    /** Must change the kind of the resource
     */
    virtual void SetKind(const std::string & newKind) =0;

    /** Must return the name of the object.
     */
    virtual const std::string & GetKind() const =0;

    /** Must change if the resource is user added or not
     */
    virtual void SetUserAdded(bool isUserAdded) =0;

    /** Must return true if the resource was added by the user
     */
    virtual bool IsUserAdded() const =0;

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

    /**
     * Return, if applicable, a string containing the absolute filename of the resource.
     */
    std::string GetAbsoluteFile(const gd::Project & game) const;

    /**
     * Called when a property must be edited ( i.e: it was double clicked )
     *
     * \return true if the resource was changed
     */
    virtual bool EditProperty(gd::Project & project, const std::string & property) { return true; };

    /**
     * Called when a property must be changed ( i.e: its value was changed in the property grid )
     *
     * \return true if the resource was changed
     */
    virtual bool ChangeProperty(gd::Project & project, const std::string & property, const std::string & newValue) { return true; };

    /**
     * Return a description of the main property provided by the resource ( Example : "Image file" )
     */
    virtual void GetPropertyInformation(gd::Project & project, const std::string & property, wxString & userFriendlyName, wxString & description) const { return; };

    /**
     * Called when a property must be changed ( i.e: its value was changed in the property grid )
     *
     * \return the value of the property
     */
    virtual std::string GetProperty(gd::Project & project, const std::string & property) { return ""; };

    /**
     * Return a description of the main property provided by the resource ( Example : "Image file" )
     */
    virtual std::vector<std::string> GetAllProperties(gd::Project & project) const { std::vector<std::string> noProperties; return noProperties; };

    /**
     * Called when the resource must be rendered in a preview panel.
     */
    virtual void RenderPreview(wxPaintDC & dc, wxPanel & previewPanel, gd::Project & game) {};

    /**
     * Load an xml element.
     */
    virtual void LoadFromXml(const TiXmlElement * elem) {};

    /**
     * Save to an xml element.
     */
    virtual void SaveToXml(TiXmlElement * elem) const {};

private:
    static std::string badStr;
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
    ResourcesManager() {};
    virtual ~ResourcesManager() {};

    /**
     * Add a resource created from a file.
     * The resource manager is responsible for internally creating the resource.
     */
    virtual bool AddResource(const std::string & name, const std::string & filename) =0;

    /**
     * Add an already constructed resource.
     */
    virtual bool AddResource(const gd::Resource & resource) =0;

    /**
     * Remove a resource
     */
    virtual void RemoveResource(const std::string & name) =0;

    /**
     * Rename a resource
     */
    virtual void RenameResource(const std::string & oldName, const std::string & newName) =0;

    /**
     * Return true if a resource exists.
     */
    virtual bool HasResource(const std::string & name) const =0;

    /**
     * Return a reference to a resource.
     */
    virtual Resource & GetResource(const std::string & name) =0;

    /**
     * Return a reference to a resource.
     */
    virtual const Resource & GetResource(const std::string & name) const =0;

    /**
     * Get a list containing the name of all of the resources.
     */
    virtual std::vector<std::string> GetAllResourcesList() =0;

    /**
     * Move a resource up in the list
     */
    virtual bool MoveResourceUpInList(const std::string & name) =0;

    /**
     * Move a resource down in the list
     */
    virtual bool MoveResourceDownInList(const std::string & name) =0;

    /** \name Folders management
     * Members functions related to folders management.
     */
    ///@{
    /**
     * Return true if the folder exists.
     */
    virtual bool HasFolder(const std::string & name) const =0;

    /**
     * Return a reference to a folder
     */
    virtual const ResourceFolder & GetFolder(const std::string & name) const =0;

    /**
     * Return a reference to a folder
     */
    virtual ResourceFolder & GetFolder(const std::string & name) =0;

    /**
     * Remove a folder.
     */
    virtual void RemoveFolder(const std::string & name) =0;

    /**
     * Create a new empty folder.
     */
    virtual void CreateFolder(const std::string & name) =0;

    /**
     * Move a folder up in the list
     */
    virtual bool MoveFolderUpInList(const std::string & name) =0;

    /**
     * Move a folder down in the list
     */
    virtual bool MoveFolderDownInList(const std::string & name) =0;

    /**
     * Get a list containing the name of all of the folders.
     */
    virtual std::vector<std::string> GetAllFolderList() =0;
    ///@}

    /**
     * Load from an xml element.
     */
    virtual void LoadFromXml(const TiXmlElement * elem) {};

    /**
     * Save to an xml element.
     */
    virtual void SaveToXml(TiXmlElement * elem) const {};
};

class GD_CORE_API ResourceFolder
{
public:
    ResourceFolder() {};
    virtual ~ResourceFolder() {};

    /** Must change the name of the resource with the name passed as parameter.
     */
    virtual void SetName(const std::string & name) =0;

    /** Must return the name of the resource.
     */
    virtual const std::string & GetName() const =0;

    /**
     * Add a resource from an already existing resource.
     *
     * \param name The name of the resource to add
     * \param parentManager The resource manager containg the resource to add
     */
    virtual void AddResource(const std::string & name, ResourcesManager & parentManager) =0;

    /**
     * Remove a resource
     */
    virtual void RemoveResource(const std::string & name) =0;

    /**
     * Return true if a resource is in the folder.
     */
    virtual bool HasResource(const std::string & name) const =0;

    /**
     * Return a reference to a resource.
     */
    virtual Resource & GetResource(const std::string & name) =0;

    /**
     * Return a reference to a resource.
     */
    virtual const Resource & GetResource(const std::string & name) const =0;

    /**
     * Get a list containing the name of all of the contained inside the folder.
     */
    virtual std::vector<std::string> GetAllResourcesList() =0;

    /**
     * Move a resource up in the list
     */
    virtual bool MoveResourceUpInList(const std::string & name) =0;

    /**
     * Move a resource down in the list
     */
    virtual bool MoveResourceDownInList(const std::string & name) =0;

    /**
     * Load an xml element.
     *
     * \param elem The tinyxml root element
     * \param parentManager The resource manager containing the resources of the project
     */
    virtual void LoadFromXml(const TiXmlElement * elem, ResourcesManager & parentManager) =0;

    /**
     * Save to an xml element.
     */
    virtual void SaveToXml(TiXmlElement * elem) const =0;
};

}

#endif // GDCORE_RESOURCESMANAGER_H

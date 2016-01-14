/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */
#ifndef GDCORE_RESOURCESMANAGER_H
#define GDCORE_RESOURCESMANAGER_H
#include <memory>
#include "GDCore/String.h"
#include <vector>
namespace gd { class Project; }
namespace gd { class ResourceFolder; }
namespace gd { class SerializerElement; }
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
    virtual void SetName(const gd::String & name_) { name = name_;}

    /** \brief Return the name of the resource.
     */
    virtual const gd::String & GetName() const {return name;}

    /** \brief Change the kind of the resource
     */
    virtual void SetKind(const gd::String & newKind) { kind = newKind; }

    /** \brief Return the name of the object.
     */
    virtual const gd::String & GetKind() const {return kind;}

    /** \brief Change if the resource is user added or not
     */
    virtual void SetUserAdded(bool isUserAdded) {userAdded = isUserAdded;}

    /** \brief Return true if the resource was added by the user
     */
    virtual bool IsUserAdded() const {return userAdded;}

    /**
     * \brief Return true if the resource use a file.
     *
     * \see gd::Resource::GetFile
     * \see gd::Resource::SetFile
     */
    virtual bool UseFile() { return false; }

    /**
     * \brief Return, if applicable, the String containing the file used by the resource.
     * The file is relative to the project directory.
     *
     * \see gd::Resource::UseFile
     * \see gd::Resource::SetFile
     */
    virtual const gd::String & GetFile() const {return badStr;};

    /**
     * \brief Change, if applicable, the file of the resource.
     *
     * \see gd::Resource::UseFile
     * \see gd::Resource::GetFile
     */
    virtual void SetFile(const gd::String & newFile) {};

    /**
     * \brief Return, if applicable, a String containing the absolute filename of the resource.
     */
    gd::String GetAbsoluteFile(const gd::Project & game) const;

    /**
     * \brief Called when a property must be edited (i.e: it was double clicked in a property grid)
     *
     * \return true if the resource was changed
     */
    virtual bool EditProperty(gd::Project & project, const gd::String & property) { return true; };

    /**
     * \brief Called when a property must be changed (i.e: its value was changed in a property grid)
     *
     * \return true if the resource was changed
     */
    virtual bool ChangeProperty(gd::Project & project, const gd::String & property, const gd::String & newValue) { return true; };

    /**
     * \brief Must return a description of the main property provided by the resource (example : "Image file")
     */
    virtual void GetPropertyInformation(gd::Project & project, const gd::String & property, gd::String & userFriendlyName, gd::String & description) const { return; };

    /**
     * \brief Called when a property must be changed ( i.e: its value was changed in the property grid )
     *
     * \return the value of the property
     */
    virtual gd::String GetProperty(gd::Project & project, const gd::String & property) { return ""; };

    /**
     * \brief Return a description of the main property provided by the resource ( Example : "Image file" )
     */
    virtual std::vector<gd::String> GetAllProperties(gd::Project & project) const { std::vector<gd::String> noProperties; return noProperties; };

    #if !defined(GD_NO_WX_GUI)
    /**
     * \brief Called when the resource must be rendered in a preview panel.
     */
    virtual void RenderPreview(wxPaintDC & dc, wxPanel & previewPanel, gd::Project & game) {};
    #endif

    /**
     * \brief Serialize the object
     */
    virtual void SerializeTo(SerializerElement & element) const {};

    /**
     * \brief Unserialize the objectt.
     */
    virtual void UnserializeFrom(const SerializerElement & element) {};

private:
    gd::String kind;
    gd::String name;
    bool userAdded; ///< True if the resource was added by the user, and not automatically by GDevelop.

    static gd::String badStr;
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
    virtual const gd::String & GetFile() const {return file;};

    /**
     * Change the file of the resource.
     */
    virtual void SetFile(const gd::String & newFile);

    #if defined(GD_IDE_ONLY)
    virtual bool UseFile() { return true; }

    #if !defined(GD_NO_WX_GUI)
    /**
     * Called when the resource must be rendered in a preview panel.
     */
    virtual void RenderPreview(wxPaintDC & dc, wxPanel & previewPanel, gd::Project & game);
    #endif

    /**
     * Called when a property must be edited ( i.e: it was double clicked )
     *
     * \return true if the resource was changed
     */
    virtual bool EditProperty(gd::Project & project, const gd::String & property);

    /**
     * Called when a property must be changed ( i.e: its value was changed in the property grid )
     *
     * \return true if the resource was changed
     */
    virtual bool ChangeProperty(gd::Project & project, const gd::String & property, const gd::String & newValue);

    /**
     * Called when a property must be changed ( i.e: its value was changed in the property grid )
     *
     * \return the value of the property
     */
    virtual gd::String GetProperty(gd::Project & project, const gd::String & property);

    /**
     * Return a description of the main property provided by the resource ( Example : "Image file" )
     */
    virtual void GetPropertyInformation(gd::Project & project, const gd::String & property, gd::String & userFriendlyName, gd::String & description) const;

    /**
     * Return a vector containing the name of all the properties of the resource
     */
    virtual std::vector<gd::String> GetAllProperties(gd::Project & project) const;

    /**
     * \brief Serialize the object
     */
    void SerializeTo(SerializerElement & element) const;
    #endif

    /**
     * \brief Unserialize the objectt.
     */
    void UnserializeFrom(const SerializerElement & element);

    bool smooth; ///< True if smoothing filter is applied
    bool alwaysLoaded; ///< True if the image must always be loaded in memory.
private:
    gd::String file;
};


/**
 * \brief Describe an audio file used by a project.
 *
 * \see Resource
 * \ingroup ResourcesManagement
 */
class GD_CORE_API AudioResource : public Resource
{
public:
    AudioResource() : Resource() { SetKind("audio"); };
    virtual ~AudioResource() {};
    virtual AudioResource* Clone() const { return new AudioResource(*this);}

    virtual const gd::String & GetFile() const {return file;};
    virtual void SetFile(const gd::String & newFile);

    #if defined(GD_IDE_ONLY)
    virtual bool UseFile() { return true; }
    void SerializeTo(SerializerElement & element) const;
    #endif

    void UnserializeFrom(const SerializerElement & element);

private:
    gd::String file;
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
    bool HasResource(const gd::String & name) const;

    /**
     * \brief Return a reference to a resource.
     */
    Resource & GetResource(const gd::String & name);

    /**
     * \brief Return a reference to a resource.
     */
    const Resource & GetResource(const gd::String & name) const;

    /**
     * \brief Create a new resource but does not add it to the list
     */
    std::shared_ptr<Resource> CreateResource(const gd::String & kind);

    /**
     * \brief Get a list containing the name of all of the resources.
     */
    std::vector<gd::String> GetAllResourcesList();

    #if defined(GD_IDE_ONLY)
    /**
     * \brief Return a (smart) pointer to a resource.
     */
    std::shared_ptr<gd::Resource> GetResourceSPtr(const gd::String & name);

    /**
     * \brief Add an already constructed resource
     */
    bool AddResource(const gd::Resource & resource);

    /**
     * \brief Add a resource created from a file.
     */
    bool AddResource(const gd::String & name, const gd::String & filename,
        const gd::String & kind);

    /**
     * \brief Remove a resource
     */
    void RemoveResource(const gd::String & name);

    /**
     * \brief Rename a resource
     */
    void RenameResource(const gd::String & oldName, const gd::String & newName);

    /**
     * \brief Move a resource up in the list
     */
    bool MoveResourceUpInList(const gd::String & name);

    /**
     * \brief Move a resource down in the list
     */
    bool MoveResourceDownInList(const gd::String & name);

    /**
     * \brief Return true if the folder exists.
     */
    bool HasFolder(const gd::String & name) const;

    /**
     * \brief Return a reference to a folder
     */
    const ResourceFolder & GetFolder(const gd::String & name) const;

    /**
     * \brief Return a reference to a folder
     */
    ResourceFolder & GetFolder(const gd::String & name);

    /**
     * \brief Remove a folder.
     */
    void RemoveFolder(const gd::String & name);

    /**
     * \brief Create a new empty folder.
     */
    void CreateFolder(const gd::String & name);

    /**
     * \brief Move a folder up in the list
     */
    bool MoveFolderUpInList(const gd::String & name);

    /**
     * \brief Move a folder down in the list
     */
    bool MoveFolderDownInList(const gd::String & name);

    /**
     * \brief Get a list containing the name of all of the folders.
     */
    std::vector<gd::String> GetAllFolderList();


    /**
     * \brief Serialize the object
     */
    void SerializeTo(SerializerElement & element) const;
    #endif

    /**
     * \brief Unserialize the objectt.
     */
    void UnserializeFrom(const SerializerElement & element);

private:
    void Init(const ResourcesManager & other);

    std::vector< std::shared_ptr<Resource> > resources;
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
    virtual void SetName(const gd::String & name_) { name = name_;}

    /** Return the name of the folder.
     */
    virtual const gd::String & GetName() const {return name;}

    /**
     * Add a resource from an already existing resource.
     */
    virtual void AddResource(const gd::String & name, gd::ResourcesManager & parentManager);

    /**
     * Remove a resource
     */
    virtual void RemoveResource(const gd::String & name);

    /**
     * Return true if a resource is in the folder.
     */
    virtual bool HasResource(const gd::String & name) const;

    /**
     * Return a reference to a resource.
     */
    virtual Resource & GetResource(const gd::String & name);

    /**
     * Return a reference to a resource.
     */
    virtual const Resource & GetResource(const gd::String & name) const;

    /**
     * Get a list containing the name of all of the resources.
     */
    virtual std::vector<gd::String> GetAllResourcesList();

    /**
     * Move a resource up in the list
     */
    virtual bool MoveResourceUpInList(const gd::String & name);

    /**
     * Move a resource down in the list
     */
    virtual bool MoveResourceDownInList(const gd::String & name);

    /**
     * \brief Serialize the object
     */
    void SerializeTo(SerializerElement & element) const;

    /**
     * \brief Unserialize the objectt.
     */
    void UnserializeFrom(const SerializerElement & element, gd::ResourcesManager & parentManager);

private:
    gd::String name;
    std::vector< std::shared_ptr<Resource> > resources;

    void Init(const ResourceFolder & other);
    static Resource badResource;
};
#endif

}

#endif // GDCORE_RESOURCESMANAGER_H

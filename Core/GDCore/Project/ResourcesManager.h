/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#ifndef GDCORE_RESOURCESMANAGER_H
#define GDCORE_RESOURCESMANAGER_H
#include <memory>
#include <vector>
#include "GDCore/String.h"
namespace gd {
class Project;
class ResourceFolder;
class SerializerElement;
class PropertyDescriptor;
}
class wxPaintDC;
class wxPanel;

namespace gd {

/**
 * \brief Base class to describe a resource used by a game.
 *
 * \ingroup ResourcesManagement
 */
class GD_CORE_API Resource {
 public:
  Resource(){};
  virtual ~Resource(){};
  virtual Resource* Clone() const { return new Resource(*this); }

  /** \brief Change the name of the resource with the name passed as parameter.
   */
  virtual void SetName(const gd::String& name_) { name = name_; }

  /** \brief Return the name of the resource.
   */
  virtual const gd::String& GetName() const { return name; }

  /** \brief Change the kind of the resource
   */
  virtual void SetKind(const gd::String& newKind) { kind = newKind; }

  /** \brief Return the kind of the resource.
   */
  virtual const gd::String& GetKind() const { return kind; }

  /** \brief Change if the resource is user added or not
   */
  virtual void SetUserAdded(bool isUserAdded) { userAdded = isUserAdded; }

  /** \brief Return true if the resource was added by the user
   */
  virtual bool IsUserAdded() const { return userAdded; }

  /**
   * \brief Return true if the resource use a file.
   *
   * \see gd::Resource::GetFile
   * \see gd::Resource::SetFile
   */
  virtual bool UseFile() { return false; }

  /**
   * \brief Return, if applicable, the String containing the file used by the
   * resource. The file is relative to the project directory.
   *
   * \see gd::Resource::UseFile
   * \see gd::Resource::SetFile
   */
  virtual const gd::String& GetFile() const { return badStr; };

  /**
   * \brief Change, if applicable, the file of the resource.
   *
   * \see gd::Resource::UseFile
   * \see gd::Resource::GetFile
   */
  virtual void SetFile(const gd::String& newFile){};

  /**
   * \brief Return, if applicable, a String containing the absolute filename of
   * the resource.
   */
  gd::String GetAbsoluteFile(const gd::Project& game) const;

  /**
   * \brief Set the metadata (any string) associated to the resource.
   * \note Can be used by external editors to store extra information, for
   * example the configuration used to produce a sound.
   */
  virtual void SetMetadata(const gd::String& metadata_) { metadata = metadata_; }

  /**
   * \brief Return the (optional) metadata associated to the resource
   */
  virtual const gd::String& GetMetadata() const { return metadata; }

#if !defined(GD_NO_WX_GUI)
  /**
   * \brief Called when the resource must be rendered in a preview panel.
   */
  virtual void RenderPreview(wxPaintDC& dc,
                             wxPanel& previewPanel,
                             gd::Project& game){};
#endif

#if defined(GD_IDE_ONLY)
  /** \name Resources properties
   * Reading and updating resources properties
   */
  ///@{
  /**
   * \brief Called when the IDE wants to know about the custom properties of the
   resource.
   *
   * Usage example:
   \code
      std::map<gd::String, gd::PropertyDescriptor> properties;
      properties[ToString(_("Text"))].SetValue("Hello world!");

      return properties;
   \endcode
   *
   * \return a std::map with properties names as key.
   * \see gd::PropertyDescriptor
   */
  virtual std::map<gd::String, gd::PropertyDescriptor> GetProperties(
      gd::Project& project) const;

  /**
   * \brief Called when the IDE wants to update a custom property of the
   * resource
   *
   * \return false if the new value cannot be set
   */
  virtual bool UpdateProperty(const gd::String& name,
                              const gd::String& value,
                              gd::Project& project) {
    return false;
  };
///@}
#endif

  /**
   * \brief Serialize the object
   */
  virtual void SerializeTo(SerializerElement& element) const {};

  /**
   * \brief Unserialize the objectt.
   */
  virtual void UnserializeFrom(const SerializerElement& element){};

 private:
  gd::String kind;
  gd::String name;
  gd::String metadata;
  bool userAdded;  ///< True if the resource was added by the user, and not
                   ///< automatically by GDevelop.

  static gd::String badStr;
};

/**
 * \brief Describe an image/texture used by a project.
 *
 * \see Resource
 * \ingroup ResourcesManagement
 */
class GD_CORE_API ImageResource : public Resource {
 public:
  ImageResource() : Resource(), smooth(true), alwaysLoaded(false) {
    SetKind("image");
  };
  virtual ~ImageResource(){};
  virtual ImageResource* Clone() const override {
    return new ImageResource(*this);
  }

  /**
   * Return the file used by the resource.
   */
  virtual const gd::String& GetFile() const override { return file; };

  /**
   * Change the file of the resource.
   */
  virtual void SetFile(const gd::String& newFile) override;

#if defined(GD_IDE_ONLY)
  virtual bool UseFile() override { return true; }

#if !defined(GD_NO_WX_GUI)
  /**
   * Called when the resource must be rendered in a preview panel.
   */
  virtual void RenderPreview(wxPaintDC& dc,
                             wxPanel& previewPanel,
                             gd::Project& game) override;
#endif

  std::map<gd::String, gd::PropertyDescriptor> GetProperties(
      gd::Project& project) const override;
  bool UpdateProperty(const gd::String& name,
                      const gd::String& value,
                      gd::Project& project) override;

  /**
   * \brief Serialize the object
   */
  void SerializeTo(SerializerElement& element) const override;
#endif

  /**
   * \brief Unserialize the objectt.
   */
  void UnserializeFrom(const SerializerElement& element) override;

  /**
   * \brief Return true if the image should be smoothed.
   */
  bool IsSmooth() const { return smooth; }

  /**
   * \brief Set if the image should be smoothed in game.
   */
  void SetSmooth(bool enable = true) { smooth = enable; }

  bool smooth;        ///< True if smoothing filter is applied
  bool alwaysLoaded;  ///< True if the image must always be loaded in memory.
 private:
  gd::String file;
};

/**
 * \brief Describe an audio file used by a project.
 *
 * \see Resource
 * \ingroup ResourcesManagement
 */
class GD_CORE_API AudioResource : public Resource {
 public:
  AudioResource() : Resource() { SetKind("audio"); };
  virtual ~AudioResource(){};
  virtual AudioResource* Clone() const override {
    return new AudioResource(*this);
  }

  virtual const gd::String& GetFile() const override { return file; };
  virtual void SetFile(const gd::String& newFile) override;

#if defined(GD_IDE_ONLY)
  virtual bool UseFile() override { return true; }
  void SerializeTo(SerializerElement& element) const override;
#endif

  void UnserializeFrom(const SerializerElement& element) override;

 private:
  gd::String file;
};

/**
 * \brief Describe a font file used by a project.
 *
 * \see Resource
 * \ingroup ResourcesManagement
 */
class GD_CORE_API FontResource : public Resource {
 public:
  FontResource() : Resource() { SetKind("font"); };
  virtual ~FontResource(){};
  virtual FontResource* Clone() const override {
    return new FontResource(*this);
  }

  virtual const gd::String& GetFile() const override { return file; };
  virtual void SetFile(const gd::String& newFile) override;

#if defined(GD_IDE_ONLY)
  virtual bool UseFile() override { return true; }
  void SerializeTo(SerializerElement& element) const override;
#endif

  void UnserializeFrom(const SerializerElement& element) override;

 private:
  gd::String file;
};

/**
 * \brief Describe a video file used by a project.
 *
 * \see Resource
 * \ingroup ResourcesManagement
 */
class GD_CORE_API VideoResource : public Resource {
 public:
  VideoResource() : Resource() { SetKind("video"); };
  virtual ~VideoResource(){};
  virtual VideoResource* Clone() const override {
    return new VideoResource(*this);
  }

  virtual const gd::String& GetFile() const override { return file; };
  virtual void SetFile(const gd::String& newFile) override;

#if defined(GD_IDE_ONLY)
  virtual bool UseFile() override { return true; }
  void SerializeTo(SerializerElement& element) const override;
#endif

  void UnserializeFrom(const SerializerElement& element) override;

 private:
  gd::String file;
};

/**
 * \brief Inventory all resources used by a project
 *
 * \see Resource
 * \ingroup ResourcesManagement
 */
class GD_CORE_API ResourcesManager {
 public:
  ResourcesManager();
  virtual ~ResourcesManager();
  ResourcesManager(const ResourcesManager&);
  ResourcesManager& operator=(const ResourcesManager& rhs);

  /**
   * \brief Return true if a resource exists.
   */
  bool HasResource(const gd::String& name) const;

  /**
   * \brief Return a reference to a resource.
   */
  Resource& GetResource(const gd::String& name);

  /**
   * \brief Return a reference to a resource.
   */
  const Resource& GetResource(const gd::String& name) const;

  /**
   * \brief Create a new resource but does not add it to the list
   */
  std::shared_ptr<Resource> CreateResource(const gd::String& kind);

  /**
   * \brief Get a list containing the names of all resources.
   */
  std::vector<gd::String> GetAllResourceNames() const;

#if defined(GD_IDE_ONLY)
  /**
   * \brief Return a (smart) pointer to a resource.
   */
  std::shared_ptr<gd::Resource> GetResourceSPtr(const gd::String& name);

  /**
   * \brief Add an already constructed resource
   */
  bool AddResource(const gd::Resource& resource);

  /**
   * \brief Add a resource created from a file.
   */
  bool AddResource(const gd::String& name,
                   const gd::String& filename,
                   const gd::String& kind);

  /**
   * \brief Remove a resource
   */
  void RemoveResource(const gd::String& name);

  /**
   * \brief Rename a resource
   */
  void RenameResource(const gd::String& oldName, const gd::String& newName);

  /**
   * \brief Return the position of the layer called "name" in the layers list
   */
  std::size_t GetResourcePosition(const gd::String& name) const;

  /**
   * \brief Move a resource up in the list
   */
  bool MoveResourceUpInList(const gd::String& name);

  /**
   * \brief Move a resource down in the list
   */
  bool MoveResourceDownInList(const gd::String& name);

  /**
   * Change the position of the specified resource.
   */
  void MoveResource(std::size_t oldIndex, std::size_t newIndex);

  /**
   * \brief Return true if the folder exists.
   */
  bool HasFolder(const gd::String& name) const;

  /**
   * \brief Return a reference to a folder
   */
  const ResourceFolder& GetFolder(const gd::String& name) const;

  /**
   * \brief Return a reference to a folder
   */
  ResourceFolder& GetFolder(const gd::String& name);

  /**
   * \brief Remove a folder.
   */
  void RemoveFolder(const gd::String& name);

  /**
   * \brief Create a new empty folder.
   */
  void CreateFolder(const gd::String& name);

  /**
   * \brief Move a folder up in the list
   */
  bool MoveFolderUpInList(const gd::String& name);

  /**
   * \brief Move a folder down in the list
   */
  bool MoveFolderDownInList(const gd::String& name);

  /**
   * \brief Get a list containing the name of all of the folders.
   */
  std::vector<gd::String> GetAllFolderList();

  /**
   * \brief Serialize the object
   */
  void SerializeTo(SerializerElement& element) const;
#endif

  /**
   * \brief Unserialize the objectt.
   */
  void UnserializeFrom(const SerializerElement& element);

 private:
  void Init(const ResourcesManager& other);

  std::vector<std::shared_ptr<Resource> > resources;
#if defined(GD_IDE_ONLY)
  std::vector<ResourceFolder> folders;
#endif

#if defined(GD_IDE_ONLY)
  static ResourceFolder badFolder;
#endif
  static Resource badResource;
};

#if defined(GD_IDE_ONLY)
class GD_CORE_API ResourceFolder {
 public:
  ResourceFolder(){};
  virtual ~ResourceFolder(){};
  ResourceFolder(const ResourceFolder&);
  ResourceFolder& operator=(const ResourceFolder& rhs);

  /** Change the name of the folder with the name passed as parameter.
   */
  virtual void SetName(const gd::String& name_) { name = name_; }

  /** Return the name of the folder.
   */
  virtual const gd::String& GetName() const { return name; }

  /**
   * Add a resource from an already existing resource.
   */
  virtual void AddResource(const gd::String& name,
                           gd::ResourcesManager& parentManager);

  /**
   * Remove a resource
   */
  virtual void RemoveResource(const gd::String& name);

  /**
   * Return true if a resource is in the folder.
   */
  virtual bool HasResource(const gd::String& name) const;

  /**
   * Return a reference to a resource.
   */
  virtual Resource& GetResource(const gd::String& name);

  /**
   * Return a reference to a resource.
   */
  virtual const Resource& GetResource(const gd::String& name) const;

  /**
   * Get a list containing the name of all of the resources.
   */
  virtual std::vector<gd::String> GetAllResourceNames();

  /**
   * Move a resource up in the list
   */
  virtual bool MoveResourceUpInList(const gd::String& name);

  /**
   * Move a resource down in the list
   */
  virtual bool MoveResourceDownInList(const gd::String& name);

  /**
   * \brief Serialize the object
   */
  void SerializeTo(SerializerElement& element) const;

  /**
   * \brief Unserialize the objectt.
   */
  void UnserializeFrom(const SerializerElement& element,
                       gd::ResourcesManager& parentManager);

 private:
  gd::String name;
  std::vector<std::shared_ptr<Resource> > resources;

  void Init(const ResourceFolder& other);
  static Resource badResource;
};
#endif

}  // namespace gd

#endif  // GDCORE_RESOURCESMANAGER_H

/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */

#ifndef GDCORE_EXTERNALLAYOUT_H
#define GDCORE_EXTERNALLAYOUT_H
#include <memory>

#include "GDCore/Project/InitialInstancesContainer.h"
#include "GDCore/String.h"
namespace gd {
class SerializerElement;
}
#include "GDCore/IDE/Dialogs/LayoutEditorCanvas/EditorSettings.h"

namespace gd {

/**
 * \brief An external layout allows to create layouts of objects that can be
 * then inserted on a layout.
 */
class GD_CORE_API ExternalLayout {
 public:
  ExternalLayout(){};
  virtual ~ExternalLayout(){};

  /**
   * \brief Return a pointer to a new ExternalLayout constructed from this one.
   */
  ExternalLayout* Clone() const { return new ExternalLayout(*this); };

  /**
   * \brief Return the name of the external layout.
   */
  const gd::String& GetName() const { return name; }

  /**
   * \brief Change the name of the external layout.
   */
  void SetName(const gd::String& name_) { name = name_; }

  /**
   * \brief Return the container storing initial instances.
   */
  const gd::InitialInstancesContainer& GetInitialInstances() const {
    return instances;
  }

  /**
   * \brief Return the container storing initial instances.
   */
  gd::InitialInstancesContainer& GetInitialInstances() { return instances; }

  /**
   * \brief Get the user settings for the IDE.
   */
  const gd::EditorSettings& GetAssociatedEditorSettings() const {
    return editorSettings;
  }

  /**
   * \brief Get the user settings for the IDE.
   */
  gd::EditorSettings& GetAssociatedEditorSettings() { return editorSettings; }

  /**
   * \brief Get the name of the layout last used to edit the external layout.
   */
  const gd::String& GetAssociatedLayout() { return associatedLayout; }

  /**
   * \brief Set the name of the layout used to edit the external layout.
   */
  void SetAssociatedLayout(const gd::String& name) { associatedLayout = name; }

  /** \name Serialization
   */
  ///@{
  /**
   * \brief Serialize external layout.
   */
  void SerializeTo(SerializerElement& element) const;

  /**
   * \brief Unserialize the external layout.
   */
  void UnserializeFrom(const SerializerElement& element);
  ///@}

 private:
  gd::String name;
  gd::InitialInstancesContainer instances;
  gd::EditorSettings editorSettings;
  gd::String associatedLayout;
};

/**
 * \brief Functor testing ExternalLayout' name
 */
struct ExternalLayoutHasName
    : public std::binary_function<std::unique_ptr<gd::ExternalLayout>,
                                  gd::String,
                                  bool> {
  bool operator()(const std::unique_ptr<gd::ExternalLayout>& externalLayout,
                  gd::String name) const {
    return externalLayout->GetName() == name;
  }
};

}  // namespace gd

#endif  // GDCORE_EXTERNALLAYOUT_H

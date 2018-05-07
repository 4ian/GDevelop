/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#ifndef SOURCEFILE_H
#define SOURCEFILE_H
#include <ctime>
#include <memory>
#include "GDCore/String.h"
namespace gd {
class SerializerElement;
}
class BaseEvent;

namespace gd {

/**
 * \brief Represents a "physical" source file.
 *
 * Source file can be compiled (or just integrated to the exported project)
 * by platforms. Most of the time, special events are provided to use functions
 * created in such files.
 */
class GD_CORE_API SourceFile {
 public:
  SourceFile();
  virtual ~SourceFile();

  /**
   * \brief Return a pointer to a new SourceFile constructed from this one.
   */
  SourceFile* Clone() const { return new SourceFile(*this); };

  /**
   * \brief Get the filename
   */
  gd::String GetFileName() const { return filename; };

  /**
   * \brief Change the filename
   */
  void SetFileName(gd::String filename_) { filename = filename_; };

  /**
   * \brief Serialize the source file.
   */
  void SerializeTo(SerializerElement& element) const;

  /**
   * \brief Unserialize the source file.
   */
  void UnserializeFrom(const SerializerElement& element);

  /**
   * \brief Set if the file is hidden from the user point of view and is only
   * managed by GDevelop
   */
  void SetGDManaged(bool gdManaged_) { gdManaged = gdManaged_; };

  /**
   * \brief Return true if the file is hidden from the user point of view and is
   * only managed by GDevelop
   */
  bool IsGDManaged() const { return gdManaged; };

  /**
   * \brief Change the language of the source file
   */
  void SetLanguage(gd::String lang) { language = lang; }

  /**
   * \brief Get the language of the source file
   */
  const gd::String& GetLanguage() const { return language; }

 private:
  gd::String filename;  ///< Filename
  bool gdManaged;  ///< True if the source file is hidden from the user point of
                   ///< view and is managed only by GDevelop.
  gd::String language;  ///< String identifying the language of this source file
                        ///< (typically "C++ or "Javascript").
  std::weak_ptr<BaseEvent>
      associatedGdEvent;  ///< When a source file is GD-managed, it is usually
                          ///< created for a specific event. This member is not
                          ///< saved: It is the event responsibility to call
                          ///< SetAssociatedEvent.
};

//"Tool" Functions

/**
 * Functor testing Source Files name
 */
struct ExternalSourceFileHasName
    : public std::
          binary_function<std::unique_ptr<SourceFile>, gd::String, bool> {
  bool operator()(const std::unique_ptr<SourceFile>& externalEvents,
                  gd::String name) const {
    return externalEvents->GetFileName() == name;
  }
};

}  // namespace gd

#endif  // SOURCEFILE_H

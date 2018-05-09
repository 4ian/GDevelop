/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#ifndef GDCORE_PROJECTSTRIPPER_H
#define GDCORE_PROJECTSTRIPPER_H
namespace gd {
class Project;
}
namespace gd {
class String;
}

namespace gd {

/**
 * \brief Tool class providing methods to strip useless data for a project
 * after it has been exported.
 */
class GD_CORE_API ProjectStripper {
 public:
  /**
   * \brief Create a stripped version of the project for export:
   * Objects groups are deleted as well as all events.
   *
   * \param project The project to be stripped.
   */
  static void StripProjectForExport(gd::Project& project);

  /**
   * \brief Strip project to keep only the full content of the specified
   * layout. The content of other layouts, external events and external layouts
   * is removed.
   */
  static void StripProjectForLayoutEdition(gd::Project& project,
                                           const gd::String& layoutName);

  /**
   * \brief Strip project to keep only the full content of the specified
   * external layout and the associated layout.
   * The content of other layouts, external events and external layouts is
   * removed.
   */
  static void StripProjectForExternalLayoutEdition(
      gd::Project& project, const gd::String& externalLayoutName);

 private:
  ProjectStripper(){};
  virtual ~ProjectStripper(){};
};

}  // namespace gd

#endif  // GDCORE_PROJECTSTRIPPER_H

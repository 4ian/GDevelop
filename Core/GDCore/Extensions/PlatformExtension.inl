/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. Copyright 2016 Victor Levasseur (victorlevasseur52@gmail.com) This
 * project is released under the MIT License.
 */

#ifndef GDCORE_PLATFORMEXTENSION_INL
#define GDCORE_PLATFORMEXTENSION_INL

#include "GDCore/Tools/MakeUnique.h"

namespace gd {

template <class T>
gd::ObjectMetadata& PlatformExtension::AddObject(const gd::String& name,
                                                 const gd::String& fullname,
                                                 const gd::String& description,
                                                 const gd::String& icon24x24) {
  gd::String nameWithNamespace =
      GetNameSpace().empty() ? name : GetNameSpace() + name;
  objectsInfos[nameWithNamespace] =
      ObjectMetadata(GetNameSpace(),
                     nameWithNamespace,
                     fullname,
                     description,
                     icon24x24,
                     []() -> std::unique_ptr<gd::ObjectConfiguration> {
                       return gd::make_unique<T>();
                     })
          .SetHelpPath(GetHelpPath());

  return objectsInfos[nameWithNamespace];
}

}  // namespace gd

#endif

/**

GDevelop - TextEntry Object Extension
Copyright (c) 2011-2013 Florian Rival (Florian.Rival@gmail.com)
This project is released under the MIT License.
*/

#ifndef TEXTENTRYOBJECT_H
#define TEXTENTRYOBJECT_H
#include "GDCore/Project/ObjectConfiguration.h"

/**
 * \brief Simple object which stores user keyboard input.
 */
class GD_EXTENSION_API TextEntryObject : public gd::ObjectConfiguration {
 public:
  TextEntryObject();
  virtual ~TextEntryObject(){};
  virtual std::unique_ptr<gd::ObjectConfiguration> Clone() const {
    return gd::make_unique<TextEntryObject>(*this);
  }

 private:
};

#endif  // TEXTENTRYOBJECT_H

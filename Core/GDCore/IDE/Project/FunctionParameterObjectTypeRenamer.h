/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#ifndef GDCORE_FUNCTIONPARAMETEROBJECTTYPERENAMER_H
#define GDCORE_FUNCTIONPARAMETEROBJECTTYPERENAMER_H
#include <map>
#include <memory>
#include <vector>
#include "GDCore/IDE/Project/ArbitraryFunctionsWorker.h"
#include "GDCore/String.h"
namespace gd {
class BaseEvent;
class Project;
class EventsList;
}  // namespace gd

namespace gd {

/**
 * \brief Replace in functions all behavior parameter of the specified type
 * by another type.
 *
 * \ingroup IDE
 */
class GD_CORE_API FunctionParameterObjectTypeRenamer : public ArbitraryFunctionsWorker {
 public:
  FunctionParameterObjectTypeRenamer(const gd::String& oldObjectType_,
                                     const gd::String& newObjectType_)
      : oldObjectType(oldObjectType_), newObjectType(newObjectType_){};
  virtual ~FunctionParameterObjectTypeRenamer();

 private:
  void DoVisitParameter(gd::ParameterMetadata& parameter) override;

  gd::String oldObjectType;
  gd::String newObjectType;
};

}  // namespace gd

#endif  // GDCORE_FUNCTIONPARAMETEROBJECTTYPERENAMER_H

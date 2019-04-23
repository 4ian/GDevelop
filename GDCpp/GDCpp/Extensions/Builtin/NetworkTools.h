/*
 * GDevelop C++ Platform
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#ifndef NETWORKTOOLS_H
#define NETWORKTOOLS_H

#include <string>
#include "GDCpp/Runtime/RuntimeObject.h"
#include "GDCpp/Runtime/String.h"

namespace gd {
class Variable;
}

void GD_API SendHttpRequest(const gd::String& host,
                            const gd::String& uri,
                            const gd::String& body,
                            const gd::String& method,
                            const gd::String& contentType,
                            gd::Variable& response);
void GD_API DownloadFile(const gd::String& host,
                         const gd::String& uri,
                         const gd::String& outputfilename);

gd::String GD_API VariableStructureToJSON(const gd::Variable& variable);
gd::String GD_API ObjectVariableStructureToJSON(RuntimeObject* object,
                                                const gd::Variable& variable);
void GD_API JSONToVariableStructure(const gd::String& JSON,
                                    gd::Variable& variable);
void GD_API JSONToObjectVariableStructure(const gd::String& JSON,
                                          RuntimeObject* object,
                                          gd::Variable& variable);

#endif  // NETWORKTOOLS_H

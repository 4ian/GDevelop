/*
 * GDevelop C++ Platform
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */
#ifndef NETWORKTOOLS_H
#define NETWORKTOOLS_H

#include <string>
#include "GDCpp/Runtime/String.h"
#include "GDCpp/Runtime/RuntimeObject.h"

namespace gd {class Variable;}

void GD_API SendDataToPhpWebPage(const gd::String & webpageurl,
	const gd::String & password,
	const gd::String & data1,
	const gd::String & data2,
	const gd::String & data3,
	const gd::String & data4,
	const gd::String & data5,
	const gd::String & data6);
void GD_API SendHttpRequest(const gd::String & host, const gd::String & uri, const gd::String & body,
	const gd::String & method, const gd::String & contentType, gd::Variable & response);
void GD_API DownloadFile( const gd::String & host, const gd::String & uri, const gd::String & outputfilename );

gd::String GD_API VariableStructureToJSON(const gd::Variable & variable);
gd::String GD_API ObjectVariableStructureToJSON(RuntimeObject * object, const gd::Variable & variable);
void GD_API JSONToVariableStructure(const gd::String & JSON, gd::Variable & variable);
void GD_API JSONToObjectVariableStructure(const gd::String & JSON, RuntimeObject * object, gd::Variable & variable);

#endif // NETWORKTOOLS_H

/*
 * GDevelop C++ Platform
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */
#ifndef FILETOOLS_H
#define FILETOOLS_H

#include <string>
class RuntimeScene;
namespace gd { class Variable; };

bool GD_API FileExists( const gd::String & file );
bool GD_API GroupExists( const gd::String & file, const gd::String & group );
void GD_API LaunchFile( const gd::String & file );
void GD_API ExecuteCmd( const gd::String & cmd );
void GD_API GDDeleteFile( const gd::String & filename );
void GD_API LoadFileInMemory( const gd::String & filename );
void GD_API UnloadFileFromMemory( const gd::String & filename );
void GD_API DeleteGroupFromFile( const gd::String & filename, const gd::String & group );
void GD_API WriteValueInFile( const gd::String & filename, const gd::String & group, double value );
void GD_API WriteStringInFile( const gd::String & filename, const gd::String & group, const gd::String & str );
void GD_API ReadValueFromFile( const gd::String & filename, const gd::String & group, RuntimeScene & scene, gd::Variable & variable );
void GD_API ReadStringFromFile( const gd::String & filename, const gd::String & group, RuntimeScene & scene, gd::Variable & variable );

#endif // FILETOOLS_H

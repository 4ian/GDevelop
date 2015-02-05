/*
 * GDevelop C++ Platform
 * Copyright 2008-2015 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */
#ifndef FILETOOLS_H
#define FILETOOLS_H

#include <string>
class RuntimeScene;
namespace gd { class Variable; };

bool GD_API FileExists( const std::string & file );
bool GD_API GroupExists( const std::string & file, const std::string & group );
void GD_API LaunchFile( const std::string & file );
void GD_API ExecuteCmd( const std::string & cmd );
void GD_API GDDeleteFile( const std::string & filename );
void GD_API LoadFileInMemory( const std::string & filename );
void GD_API UnloadFileFromMemory( const std::string & filename );
void GD_API DeleteGroupFromFile( const std::string & filename, const std::string & group );
void GD_API WriteValueInFile( const std::string & filename, const std::string & group, double value );
void GD_API WriteStringInFile( const std::string & filename, const std::string & group, const std::string & str );
void GD_API ReadValueFromFile( const std::string & filename, const std::string & group, RuntimeScene & scene, gd::Variable & variable );
void GD_API ReadStringFromFile( const std::string & filename, const std::string & group, RuntimeScene & scene, gd::Variable & variable );

#endif // FILETOOLS_H

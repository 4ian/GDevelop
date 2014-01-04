/** \file
 *  Game Develop
 *  2008-2014 Florian Rival (Florian.Rival@gmail.com)
 */

#ifndef NETWORKTOOLS_H
#define NETWORKTOOLS_H
#include <string>
namespace gd {class Variable;}

void GD_API SendDataToPhpWebPage(const std::string & webpageurl,
	const std::string & password,
	const std::string & data1,
	const std::string & data2,
	const std::string & data3,
	const std::string & data4,
	const std::string & data5,
	const std::string & data6);
void GD_API SendHttpRequest(const std::string & host, const std::string & uri, const std::string & body, 
	const std::string & method, const std::string & contentType, gd::Variable & response);
void GD_API DownloadFile( const std::string & host, const std::string & uri, const std::string & outputfilename );

std::string GD_API VariableStructureToJSON(const gd::Variable & variable);
void GD_API JSONToVariableStructure(const std::string & JSON, gd::Variable & variable);

#endif // NETWORKTOOLS_H


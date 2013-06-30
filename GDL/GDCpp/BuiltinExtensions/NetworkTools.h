/** \file
 *  Game Develop
 *  2008-2013 Florian Rival (Florian.Rival@gmail.com)
 */

#ifndef NETWORKTOOLS_H
#define NETWORKTOOLS_H
#include <string>

void GD_API SendDataToPhpWebPage(const std::string & webpageurl,
                     const std::string & password,
                     const std::string & data1,
                     const std::string & data2,
                     const std::string & data3,
                     const std::string & data4,
                     const std::string & data5,
                     const std::string & data6);
void GD_API DownloadFile( const std::string & host, const std::string & uri, const std::string & outputfilename );

#endif // NETWORKTOOLS_H


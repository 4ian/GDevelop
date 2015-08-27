/**

GDevelop - Function Extension
Copyright (c) 2008-2015 Florian Rival (Florian.Rival@gmail.com)
This project is released under the MIT License.
*/

#ifndef FUNCTIONTOOLS_H
#define FUNCTIONTOOLS_H
#include <string>
#include <vector>
#include "GDCpp/String.h"

namespace GDpriv
{
namespace FunctionTools
{

/**
 * \brief Return list[index] unless index is out of range.
 * \return list[index] or empty string.
 */
gd::String GD_EXTENSION_API GetSafelyStringFromVector(std::vector<gd::String> & list, std::size_t index );

}
}


#endif // FUNCTIONTOOLS_H

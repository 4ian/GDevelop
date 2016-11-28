#ifndef POTFILEWRITER_H
#define POTFILEWRITER_H

#if defined(GD_IDE_ONLY) && !defined(GD_NO_WX_GUI)

#include <set>

#include "GDCore/String.h"

namespace gd
{

class GD_CORE_API POTFileWriter
{
public:
	static void WriteTranslatableStringsToPOT(const gd::String & path, const std::set<gd::String> & translatableStrings);
};

}

#endif

#endif

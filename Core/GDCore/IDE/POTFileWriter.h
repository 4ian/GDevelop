#ifndef POTFILEWRITER_H
#define POTFILEWRITER_H

#include <set>

#include "GDCore/String.h"

namespace gd
{

class POTFileWriter
{
public:
	static void WriteTranslatableStringsToPOT(const gd::String & path, const std::set<gd::String> & translatableStrings);
};

}

#endif

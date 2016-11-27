#include "GDCore/IDE/POTFileWriter.h"

#include "GDCore/Tools/FileStream.h"

namespace gd
{

void POTFileWriter::WriteTranslatableStringsToPOT(const gd::String & path, const std::set<gd::String> & translatableStrings)
{
	gd::FileStream potFile( path, std::ios_base::out );
    if( potFile.is_open() )
    {
        for( const gd::String & str : translatableStrings )
        {
            potFile << "\n";
            potFile << "msgid \"" << str.FindAndReplace("\"", "\\\"").FindAndReplace("\n", "\"\n\"") << "\"\n";
            potFile << "msgstr \"\"\n";
        }

        potFile.close();
    }
    else
    {
        //TODO: Throw runtime_error
    }
}

}

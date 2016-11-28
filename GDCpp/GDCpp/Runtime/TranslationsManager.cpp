#include "GDCpp/Runtime/TranslationsManager.h"

#include <iostream>

#include "GDCpp/Runtime/Tools/FileStream.h"

TranslationsManager::TranslationsManager()
{

}

namespace
{
	struct StringPosition
	{
		uint32_t length;
		uint32_t offset;
	};
}

void TranslationsManager::LoadMOFile(const gd::String & path)
{
	translations.clear();

	gd::FileStream moFile( path, std::ios_base::in|std::ios_base::binary );
	if( moFile.good() )
	{
		uint32_t magicNumber = 0;
		moFile.read( reinterpret_cast<char*>( &magicNumber ), 4 );
		if( moFile.fail() )
			return;

		uint32_t revision = -1;
		moFile.read( reinterpret_cast<char*>( &revision ), 4 );
		if( moFile.fail() )
			return;

		uint32_t stringsCount = 0;
		moFile.read( reinterpret_cast<char*>( &stringsCount ), 4 );
		if( moFile.fail() )
			return;

		uint32_t untranslatedPositionsBeginOffset = 0;
		moFile.read( reinterpret_cast<char*>( &untranslatedPositionsBeginOffset ), 4 );
		if( moFile.fail() )
			return;

		uint32_t translatedPositionsBeginOffset = 0;
		moFile.read( reinterpret_cast<char*>( &translatedPositionsBeginOffset ), 4 );
		if( moFile.fail() )
			return;

		// Each pair contains the length and the offset of the untranslated string and the translated one
		std::vector<std::pair<StringPosition, StringPosition>> stringsOffsets;

		// Now, read each strings lengths and offsets
		for(uint32_t i = 0; i < stringsCount; ++i)
		{
			uint32_t untranslatedPositionOffset = untranslatedPositionsBeginOffset + i * 8;
			uint32_t translatedPositionOffset = translatedPositionsBeginOffset + i * 8;

			auto stringInfo = std::make_pair<StringPosition, StringPosition>({0, 0}, {0, 0});

			//Read the untranslated string length and offset
			moFile.seekg( untranslatedPositionOffset );
			moFile.read( reinterpret_cast<char*>( &stringInfo.first ), 8 );

			if( moFile.fail() )
				return;

			//Read the translated string length and offset
			moFile.seekg( translatedPositionOffset );
			moFile.read( reinterpret_cast<char*>( &stringInfo.second ), 8 );

			if( moFile.fail() )
				return;

			//Add the info into the stringsOffsets std::vector
			stringsOffsets.push_back( std::move( stringInfo ) );
		}

		// Now, read the strings
		for(const auto & offset : stringsOffsets)
		{
			char * untranslatedBuffer = new char[ offset.first.length + 1 ];
			char * translatedBuffer = new char[ offset.second.length + 1 ];

			moFile.seekg( offset.first.offset );
			moFile.read( untranslatedBuffer, offset.first.length + 1 );

			moFile.seekg( offset.second.offset );
			moFile.read( translatedBuffer, offset.second.length + 1 );

			translations[ gd::String( untranslatedBuffer ) ] = gd::String( translatedBuffer );

			delete[] untranslatedBuffer;
			delete[] translatedBuffer;
		}
	}
}

gd::String TranslationsManager::GetTranslation(const gd::String & string) const
{
	if( translations.count( string ) >= 1 )
		return translations.at( string );
	else
		return string;
}

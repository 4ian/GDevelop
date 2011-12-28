#if defined(GD_IDE_ONLY)

#include "ExecutableIconChanger.h"

#if defined(WINDOWS)
#include <windows.h>
#undef LoadIcon
struct ICONENTRY
{
	BYTE width;
	BYTE height;
	BYTE colorCount;
	BYTE reserved;
	WORD planes;
	WORD bitCount;
	DWORD bytesInRes;
	DWORD imageOffset;
} ;

struct ICONHEADER
{
	WORD reserved;
	WORD type;
	WORD count;
	ICONENTRY entries[1];
};

struct ICONIMAGE
{
	BITMAPINFOHEADER header;
	RGBQUAD colors;
	BYTE xors[1];
	BYTE ands[1];
};

struct GRPICONENTRY
{
	BYTE width;
	BYTE height;
	BYTE colourCount;
	BYTE reserved;
	BYTE planes;
	BYTE bitCount;
	WORD bytesInRes;
	WORD bytesInRes2;
	WORD reserved2;
	WORD id;
};
struct GRPICONHEADER
{
	WORD reserved;
	WORD type;
	WORD count;
	GRPICONENTRY entries[1];
};
#endif

#if defined(WINDOWS)
bool ExecutableIconChanger::LoadIcon(std::string iconFile, ICONHEADER*& pHeader, ICONIMAGE**& pIcons, GRPICONHEADER*& pGrpHeader)
{
	HANDLE hFile = CreateFile(iconFile.c_str(), GENERIC_READ, FILE_SHARE_READ, NULL, OPEN_EXISTING, FILE_ATTRIBUTE_NORMAL, NULL);
	if(hFile == INVALID_HANDLE_VALUE) {
		return false;
	}

	pHeader = (ICONHEADER*) malloc(sizeof(ICONHEADER));
	DWORD bytesRead;
	ReadFile(hFile, &(pHeader->reserved), sizeof(WORD), &bytesRead, NULL);
	ReadFile(hFile, &(pHeader->type), sizeof(WORD), &bytesRead, NULL);
	ReadFile(hFile, &(pHeader->count), sizeof(WORD), &bytesRead, NULL);
	pHeader = (ICONHEADER*) realloc(pHeader, sizeof(WORD)*3+sizeof(ICONENTRY)*pHeader->count);
	ReadFile(hFile, pHeader->entries, pHeader->count*sizeof(ICONENTRY), &bytesRead, NULL);
	pIcons = (ICONIMAGE**) malloc(sizeof(ICONIMAGE*)*pHeader->count);
	for(int i = 0 ; i < pHeader->count; i++) {
		pIcons[i] = (ICONIMAGE*) malloc(pHeader->entries[i].bytesInRes);
		SetFilePointer(hFile, pHeader->entries[i].imageOffset, NULL, FILE_BEGIN);
		ReadFile(hFile, pIcons[i], pHeader->entries[i].bytesInRes, &bytesRead, NULL);
	}

	// Convert to resource format
	pGrpHeader = (GRPICONHEADER*) malloc(sizeof(WORD)*3+pHeader->count*sizeof(GRPICONENTRY));
	pGrpHeader->reserved = 0;
	pGrpHeader->type = 1;
	pGrpHeader->count = pHeader->count;
	for(int i = 0; i < pHeader->count; i++) {
		ICONENTRY* icon = &pHeader->entries[i];
		GRPICONENTRY* entry = &pGrpHeader->entries[i];
		entry->bitCount = 0;
		entry->bytesInRes = icon->bitCount;
		entry->bytesInRes2 = (WORD)icon->bytesInRes;
		entry->colourCount = icon->colorCount;
		entry->height = icon->height;
		entry->id = (WORD)(i+1);
		entry->planes = (BYTE)icon->planes;
		entry->reserved = icon->reserved;
		entry->width = icon->width;
		entry->reserved2 = 0;
	}

	// Close handles
	CloseHandle(hFile);

	return true;
}
#endif

bool ExecutableIconChanger::ChangeWindowsExecutableIcon(std::string exeFile, std::string iconFile)
{
#if defined(WINDOWS)
	// Read icon file
	ICONHEADER* pHeader;
	ICONIMAGE** pIcons;
	GRPICONHEADER* pGrpHeader;
	bool res = LoadIcon(iconFile.c_str(), pHeader, pIcons, pGrpHeader);
	if(!res) {
		return false;
	}

	// Copy in resources
	HANDLE hUpdate = BeginUpdateResource(exeFile.c_str(), FALSE);

	// Copy in icon group resource
	UpdateResource(hUpdate, RT_GROUP_ICON, MAKEINTRESOURCE(1), MAKELANGID(LANG_ENGLISH, SUBLANG_ENGLISH_US),
		pGrpHeader, sizeof(WORD)*3+pHeader->count*sizeof(GRPICONENTRY));

	// Copy in icons
	for(int i = 0; i < pHeader->count; i++) {
		UpdateResource(hUpdate, RT_ICON, MAKEINTRESOURCE(i + 1), MAKELANGID(LANG_ENGLISH, SUBLANG_ENGLISH_US),
			pIcons[i], pHeader->entries[i].bytesInRes);
	}

	// Commit the changes
	EndUpdateResource(hUpdate, FALSE);

	return true;
#else
    return false;
#endif
}
#endif

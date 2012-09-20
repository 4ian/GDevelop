#ifndef IMAGEITEMDATA_H
#define IMAGEITEMDATA_H

#include <wx/treectrl.h>

#include <string>
#include <vector>

using namespace std;

class ImageItemData : public wxTreeItemData
{
    public:
        ImageItemData();
        virtual ~ImageItemData();

        bool Dossier;
        bool Image;

        string Nom;

    protected:
    private:
};

#endif // IMAGEITEMDATA_H








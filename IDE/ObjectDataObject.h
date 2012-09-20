#ifndef OBJECTDATAOBJECT_H
#define OBJECTDATAOBJECT_H

#include <wx/dataobj.h>
#include "../Game Develop Player/Object.h"

class ObjectDataObject : public wxCustomDataObject
{
    public:
        /** Default constructor */
        ObjectDataObject();
        /** Default destructor */
        ~ObjectDataObject();

        void * GetData() const;
        bool SetData( size_t size, const void *data);
    protected:
    private:

        Object object;
};

#endif // OBJECTDATAOBJECT_H








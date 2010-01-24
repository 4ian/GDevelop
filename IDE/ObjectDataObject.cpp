#include "ObjectDataObject.h"

ObjectDataObject::ObjectDataObject()
{
    //ctor
}

ObjectDataObject::~ObjectDataObject()
{
    //dtor
}

void *ObjectDataObject::GetData() const
{
    //return reinterpret_cast<void*>(&object);
}
bool ObjectDataObject::SetData( size_t size, const void *data)
{
    //object = reinterpret_cast<Object>(*data);
}

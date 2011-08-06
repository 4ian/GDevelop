#ifndef LINKEDOBJECTSMANAGER_H
#define LINKEDOBJECTSMANAGER_H

class ObjectsLinksManager
{
public:
    void LinkObjects(boost::weak_ptr<Object> a, boost::weak_ptr<Object> b);
    void RemoveLinkBetween(boost::weak_ptr<Object> a, boost::weak_ptr<Object> b);
    void RemoveAllLinksOf(boost::weak_ptr<Object> object);
    std::vector<Object*> GetAllRawPointersToObjectsLinkedWith(boost::weak_ptr<Object> object);
    std::vector<Object*> GetRawPointersToObjectsLinkedWith(boost::weak_ptr<Object> object, std::string linkedName);
    void ClearAll();

    static std::map < RuntimeScene* , ObjectsLinksManager > managers;

private:
    std::map < boost::weak_ptr<Object>, std::set< boost::weak_ptr<Object> > > links;
};


#endif // LINKEDOBJECTSMANAGER_H

/**

GDevelop - Network Extension
Copyright (c) 2010-2015 Florian Rival (Florian.Rival@gmail.com)
This project is released under the MIT License.
*/

#ifndef NETWORKAUTOMATISM_H
#define NETWORKAUTOMATISM_H

#include "GDCpp/Automatism.h"
#include "GDCpp/Object.h"
#include "SceneNetworkDatas.h"
#include <map>
namespace gd { class SerializerElement; }
namespace gd { class Layout; }
class NetworkAutomatismEditor;

class GD_EXTENSION_API NetworkAutomatism : public Automatism
{
friend class NetworkAutomatismEditor;

public:
    NetworkAutomatism();
    virtual ~NetworkAutomatism();
    virtual Automatism * Clone() const { return (new NetworkAutomatism(*this));}

    #if defined(GD_IDE_ONLY)
    /**
     * Serialize the automatism
     */
    virtual void SerializeTo(gd::SerializerElement & element) const;
    #endif

    /**
     * Unserialize the automatism
     */
    virtual void UnserializeFrom(const gd::SerializerElement & element);

    #if defined(GD_IDE_ONLY)
    /**
     * Called when user wants to edit the automatism.
     */
    virtual void EditAutomatism( wxWindow* parent, gd::Project & game_, gd::Layout * scene, gd::MainFrameWrapper & mainFrameWrapper_ );
    #endif

    static std::map < const gd::Layout* , SceneNetworkDatas > scenesNetworkDatas; ///< Static map associating scene to datas

    gd::String dataPrefix;
    bool xPosition; ///< True if X position must be send/updated
    bool yPosition; ///< True if Y position must be send/updated
    bool angle; ///< True if agnle must be send/updated
    bool width; ///< True if width must be send/updated
    bool height; ///< True if height must be send/updated

    void SetAsSender() {sending=true;};
    void SetAsReceiver() {sending=false;};
    void SetIdentifier(unsigned int identifier) {objectNetworkId = identifier;};
    unsigned int GetIdentifier() const { return objectNetworkId; }

    /**
     * Generate a unique identifier for all objects of list, using automatism named automatismName.
     */
    static void GenerateObjectNetworkIdentifier(std::map <gd::String, std::vector<RuntimeObject*> *> objectsLists, const gd::String & automatismName);

private:

    virtual void DoStepPreEvents(RuntimeScene & scene);
    virtual void DoStepPostEvents(RuntimeScene & scene);

    bool sending;
    unsigned int objectNetworkId;

    std::shared_ptr<RuntimeSceneNetworkDatas> runtimeScenesNetworkDatas;
};

#endif // NETWORKAUTOMATISM_H


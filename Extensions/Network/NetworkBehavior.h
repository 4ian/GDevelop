/**

GDevelop - Network Extension
Copyright (c) 2010-2015 Florian Rival (Florian.Rival@gmail.com)
This project is released under the MIT License.
*/

#ifndef NETWORKBEHAVIOR_H
#define NETWORKBEHAVIOR_H

#include "GDCpp/Behavior.h"
#include "GDCpp/Object.h"
#include "SceneNetworkDatas.h"
#include <map>
namespace gd { class SerializerElement; }
namespace gd { class Layout; }
class NetworkBehaviorEditor;

class GD_EXTENSION_API NetworkBehavior : public Behavior
{
friend class NetworkBehaviorEditor;

public:
    NetworkBehavior();
    virtual ~NetworkBehavior();
    virtual Behavior * Clone() const { return (new NetworkBehavior(*this));}

    #if defined(GD_IDE_ONLY)
    /**
     * Serialize the behavior
     */
    virtual void SerializeTo(gd::SerializerElement & element) const;
    #endif

    /**
     * Unserialize the behavior
     */
    virtual void UnserializeFrom(const gd::SerializerElement & element);

    #if defined(GD_IDE_ONLY)
    /**
     * Called when user wants to edit the behavior.
     */
    virtual void EditBehavior( wxWindow* parent, gd::Project & game_, gd::Layout * scene, gd::MainFrameWrapper & mainFrameWrapper_ );
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
     * Generate a unique identifier for all objects of list, using behavior named behaviorName.
     */
    static void GenerateObjectNetworkIdentifier(std::map <gd::String, std::vector<RuntimeObject*> *> objectsLists, const gd::String & behaviorName);

private:

    virtual void DoStepPreEvents(RuntimeScene & scene);
    virtual void DoStepPostEvents(RuntimeScene & scene);

    bool sending;
    unsigned int objectNetworkId;

    std::shared_ptr<RuntimeSceneNetworkDatas> runtimeScenesNetworkDatas;
};

#endif // NETWORKBEHAVIOR_H


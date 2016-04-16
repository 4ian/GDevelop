LOCAL_PATH := $(call my-dir)

include $(CLEAR_VARS)

LOCAL_MODULE    := sfml-example

LOCAL_CFLAGS := -fexceptions -frtti

#GDCpp game engine
LOCAL_CFLAGS +=  -I$(LOCAL_PATH)/GDCpp -I$(LOCAL_PATH)/Core -DGD_CORE_API="" -DGD_API=""
LOCAL_SRC_FILES += $(subst $(LOCAL_PATH)/,,$(wildcard $(LOCAL_PATH)/GDCpp/GDCpp/Runtime/*.cpp))
LOCAL_SRC_FILES += $(subst $(LOCAL_PATH)/,,$(wildcard $(LOCAL_PATH)/GDCpp/GDCpp/Runtime/Serialization/*.cpp))
LOCAL_SRC_FILES += $(subst $(LOCAL_PATH)/,,$(wildcard $(LOCAL_PATH)/GDCpp/GDCpp/Runtime/Utf8/*.c))
LOCAL_SRC_FILES += $(subst $(LOCAL_PATH)/,,$(wildcard $(LOCAL_PATH)/GDCpp/GDCpp/Runtime/Tools/*.cpp))
LOCAL_SRC_FILES += $(subst $(LOCAL_PATH)/,,$(wildcard $(LOCAL_PATH)/GDCpp/GDCpp/Runtime/TinyXml/*.cpp))
LOCAL_SRC_FILES += $(subst $(LOCAL_PATH)/,,$(wildcard $(LOCAL_PATH)/GDCpp/GDCpp/Runtime/Project/*.cpp))
LOCAL_SRC_FILES += $(subst $(LOCAL_PATH)/,,$(wildcard $(LOCAL_PATH)/GDCpp/GDCpp/Extensions/*.cpp))
LOCAL_SRC_FILES += $(subst $(LOCAL_PATH)/,,$(wildcard $(LOCAL_PATH)/GDCpp/GDCpp/Extensions/Builtin/*.cpp))

#Game sources
LOCAL_SRC_FILES += $(subst $(LOCAL_PATH)/,,$(wildcard $(LOCAL_PATH)/*.cpp))

#Extensions TODO
LOCAL_CFLAGS +=  -I$(LOCAL_PATH)/Extensions -DGD_EXTENSION_API=""
LOCAL_SRC_FILES += $(subst $(LOCAL_PATH)/,,$(wildcard $(LOCAL_PATH)/Extensions/TextObject/*.cpp))
LOCAL_SRC_FILES += $(subst $(LOCAL_PATH)/,,$(wildcard $(LOCAL_PATH)/Extensions/TiledSpriteObject/*.cpp))
LOCAL_SRC_FILES += $(subst $(LOCAL_PATH)/,,$(wildcard $(LOCAL_PATH)/Extensions/TileMapObject/*.cpp))
LOCAL_SRC_FILES += $(subst $(LOCAL_PATH)/,,$(wildcard $(LOCAL_PATH)/Extensions/PlatformBehavior/*.cpp))
LOCAL_SRC_FILES += $(subst $(LOCAL_PATH)/,,$(wildcard $(LOCAL_PATH)/Extensions/DestroyOutsideBehavior/*.cpp))
LOCAL_SRC_FILES += $(subst $(LOCAL_PATH)/,,$(wildcard $(LOCAL_PATH)/Extensions/TopDownMovementBehavior/*.cpp))
LOCAL_SRC_FILES += $(subst $(LOCAL_PATH)/,,$(wildcard $(LOCAL_PATH)/Extensions/PanelSpriteObject/*.cpp))

LOCAL_CFLAGS += -I$(LOCAL_PATH)/Extensions/PhysicsBehavior/Box2D/Box2D
LOCAL_SRC_FILES += $(subst $(LOCAL_PATH)/,,$(wildcard $(LOCAL_PATH)/Extensions/PhysicsBehavior/*.cpp))
LOCAL_SRC_FILES += $(subst $(LOCAL_PATH)/,,$(wildcard $(LOCAL_PATH)/Extensions/PhysicsBehavior/Triangulation/*.cpp))
LOCAL_SRC_FILES += $(subst $(LOCAL_PATH)/,,$(wildcard $(LOCAL_PATH)/Extensions/PhysicsBehavior/Box2D/Box2D/Box2D/*.cpp))
LOCAL_SRC_FILES += $(subst $(LOCAL_PATH)/,,$(wildcard $(LOCAL_PATH)/Extensions/PhysicsBehavior/Box2D/Box2D/Box2D/Collision/*.cpp))
LOCAL_SRC_FILES += $(subst $(LOCAL_PATH)/,,$(wildcard $(LOCAL_PATH)/Extensions/PhysicsBehavior/Box2D/Box2D/Box2D/Collision/Shapes/*.cpp))
LOCAL_SRC_FILES += $(subst $(LOCAL_PATH)/,,$(wildcard $(LOCAL_PATH)/Extensions/PhysicsBehavior/Box2D/Box2D/Box2D/Common/*.cpp))
LOCAL_SRC_FILES += $(subst $(LOCAL_PATH)/,,$(wildcard $(LOCAL_PATH)/Extensions/PhysicsBehavior/Box2D/Box2D/Box2D/Dynamics/*.cpp))
LOCAL_SRC_FILES += $(subst $(LOCAL_PATH)/,,$(wildcard $(LOCAL_PATH)/Extensions/PhysicsBehavior/Box2D/Box2D/Box2D/Dynamics/Contacts/*.cpp))
LOCAL_SRC_FILES += $(subst $(LOCAL_PATH)/,,$(wildcard $(LOCAL_PATH)/Extensions/PhysicsBehavior/Box2D/Box2D/Box2D/Dynamics/Joints/*.cpp))

#SFML
LOCAL_SHARED_LIBRARIES := sfml-system
LOCAL_SHARED_LIBRARIES += sfml-window
LOCAL_SHARED_LIBRARIES += sfml-graphics
LOCAL_SHARED_LIBRARIES += sfml-audio
LOCAL_SHARED_LIBRARIES += sfml-network
LOCAL_WHOLE_STATIC_LIBRARIES := sfml-main

include $(BUILD_SHARED_LIBRARY)

$(call import-module,sfml)

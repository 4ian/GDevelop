# Install script for directory: /workspace/Extensions

# Set the install prefix
if(NOT DEFINED CMAKE_INSTALL_PREFIX)
  set(CMAKE_INSTALL_PREFIX "/opt/gdevelop//useless")
endif()
string(REGEX REPLACE "/$" "" CMAKE_INSTALL_PREFIX "${CMAKE_INSTALL_PREFIX}")

# Set the install configuration name.
if(NOT DEFINED CMAKE_INSTALL_CONFIG_NAME)
  if(BUILD_TYPE)
    string(REGEX REPLACE "^[^A-Za-z0-9_]+" ""
           CMAKE_INSTALL_CONFIG_NAME "${BUILD_TYPE}")
  else()
    set(CMAKE_INSTALL_CONFIG_NAME "Release")
  endif()
  message(STATUS "Install configuration: \"${CMAKE_INSTALL_CONFIG_NAME}\"")
endif()

# Set the component getting installed.
if(NOT CMAKE_INSTALL_COMPONENT)
  if(COMPONENT)
    message(STATUS "Install component: \"${COMPONENT}\"")
    set(CMAKE_INSTALL_COMPONENT "${COMPONENT}")
  else()
    set(CMAKE_INSTALL_COMPONENT)
  endif()
endif()

# Install shared libraries without execute permission?
if(NOT DEFINED CMAKE_INSTALL_SO_NO_EXE)
  set(CMAKE_INSTALL_SO_NO_EXE "1")
endif()

# Is this installation the result of a crosscompile?
if(NOT DEFINED CMAKE_CROSSCOMPILING)
  set(CMAKE_CROSSCOMPILING "FALSE")
endif()

# Set default install directory permissions.
if(NOT DEFINED CMAKE_OBJDUMP)
  set(CMAKE_OBJDUMP "/usr/bin/objdump")
endif()

if(NOT CMAKE_INSTALL_LOCAL_ONLY)
  # Include the install script for each subdirectory.
  include("/workspace/build/Extensions/3D/cmake_install.cmake")
  include("/workspace/build/Extensions/AnchorBehavior/cmake_install.cmake")
  include("/workspace/build/Extensions/DestroyOutsideBehavior/cmake_install.cmake")
  include("/workspace/build/Extensions/DraggableBehavior/cmake_install.cmake")
  include("/workspace/build/Extensions/Inventory/cmake_install.cmake")
  include("/workspace/build/Extensions/LinkedObjects/cmake_install.cmake")
  include("/workspace/build/Extensions/PanelSpriteObject/cmake_install.cmake")
  include("/workspace/build/Extensions/ParticleSystem/cmake_install.cmake")
  include("/workspace/build/Extensions/PathfindingBehavior/cmake_install.cmake")
  include("/workspace/build/Extensions/PhysicsBehavior/cmake_install.cmake")
  include("/workspace/build/Extensions/PlatformBehavior/cmake_install.cmake")
  include("/workspace/build/Extensions/PrimitiveDrawing/cmake_install.cmake")
  include("/workspace/build/Extensions/Shopify/cmake_install.cmake")
  include("/workspace/build/Extensions/SystemInfo/cmake_install.cmake")
  include("/workspace/build/Extensions/TextEntryObject/cmake_install.cmake")
  include("/workspace/build/Extensions/TextObject/cmake_install.cmake")
  include("/workspace/build/Extensions/TiledSpriteObject/cmake_install.cmake")
  include("/workspace/build/Extensions/Spine/cmake_install.cmake")
  include("/workspace/build/Extensions/TopDownMovementBehavior/cmake_install.cmake")

endif()


/**

GDevelop - Primitive Drawing Extension
Copyright (c) 2008-2016 Florian Rival (Florian.Rival@gmail.com)
This project is released under the MIT License.
*/
#include "PrimitiveDrawingTools.h"
#include <SFML/Graphics.hpp>
#include "GDCpp/Runtime/CommonTools.h"
#include "GDCpp/Runtime/ImageManager.h"
#include "GDCpp/Runtime/Project/Project.h"
#include "GDCpp/Runtime/RuntimeGame.h"
#include "GDCpp/Runtime/RuntimeScene.h"

namespace GDpriv {
namespace PrimitiveDrawingTools {

void GD_EXTENSION_API CopyImageOnAnother(const gd::String& destName,
                                         const gd::String& srcName,
                                         float destX,
                                         float destY,
                                         bool useTransparency,
                                         RuntimeScene& scene) {
  if (!scene.GetImageManager()->HasLoadedSFMLTexture(destName)) return;
  if (!scene.GetImageManager()->HasLoadedSFMLTexture(srcName)) return;

  std::shared_ptr<SFMLTextureWrapper> dest =
      scene.GetImageManager()->GetSFMLTexture(destName);

  // Make sure the coordinates are correct.
  if (destX < 0 || static_cast<unsigned>(destX) >= dest->texture.getSize().x)
    return;
  if (destY < 0 || static_cast<unsigned>(destY) >= dest->texture.getSize().y)
    return;

  dest->image.copy(scene.GetImageManager()->GetSFMLTexture(srcName)->image,
                   destX,
                   destY,
                   sf::IntRect(0, 0, 0, 0),
                   useTransparency);
  dest->texture.loadFromImage(dest->image);
}

void GD_EXTENSION_API CaptureScreen(RuntimeScene& scene,
                                    const gd::String& destFileName,
                                    const gd::String& destImageName) {
  if (!scene.renderWindow) return;
  sf::Image capture = scene.renderWindow->capture();

  if (!destFileName.empty()) capture.saveToFile(destFileName.ToLocale());
  if (!destImageName.empty() &&
      scene.GetImageManager()->HasLoadedSFMLTexture(destImageName)) {
    std::shared_ptr<SFMLTextureWrapper> sfmlTexture =
        scene.GetImageManager()->GetSFMLTexture(destImageName);
    sfmlTexture->image = capture;
    sfmlTexture->texture.loadFromImage(
        sfmlTexture->image);  // Do not forget to update the associated texture
  }
}

namespace {}

void GD_EXTENSION_API CreateSFMLTexture(RuntimeScene& scene,
                                        const gd::String& imageName,
                                        unsigned int width,
                                        unsigned int height,
                                        const gd::String& colorStr) {
  // Get or create the texture in memory
  std::shared_ptr<SFMLTextureWrapper> newTexture;
  if (!scene.GetImageManager()->HasLoadedSFMLTexture(imageName))
    newTexture = std::make_shared<SFMLTextureWrapper>();
  else
    newTexture = scene.GetImageManager()->GetSFMLTexture(imageName);

  // Get the color
  sf::Color color;
  bool colorIsOk = false;
  std::vector<gd::String> colors = colorStr.Split(U';');
  if (colors.size() == 3) {
    colorIsOk = true;
    color = sf::Color(
        colors[0].To<int>(), colors[1].To<int>(), colors[2].To<int>());
  }

  // Create the SFML image and the SFML texture
  if (width != 0 && height != 0 && colorIsOk)
    newTexture->image.create(width, height, color);

  newTexture->texture.loadFromImage(
      newTexture->image);  // Do not forget to update the associated texture

  scene.GetImageManager()->SetSFMLTextureAsPermanentlyLoaded(
      imageName, newTexture);  // Otherwise
}

void GD_EXTENSION_API OpenSFMLTextureFromFile(RuntimeScene& scene,
                                              const gd::String& fileName,
                                              const gd::String& imageName) {
  // Get or create the texture in memory
  std::shared_ptr<SFMLTextureWrapper> newTexture;
  if (!scene.GetImageManager()->HasLoadedSFMLTexture(imageName))
    newTexture = std::make_shared<SFMLTextureWrapper>();
  else
    newTexture = scene.GetImageManager()->GetSFMLTexture(imageName);

  // Open the SFML image and the SFML texture
  newTexture->image.loadFromFile(fileName.ToLocale());
  newTexture->texture.loadFromImage(
      newTexture->image);  // Do not forget to update the associated texture

  scene.GetImageManager()->SetSFMLTextureAsPermanentlyLoaded(imageName,
                                                             newTexture);
}

void GD_EXTENSION_API SaveSFMLTextureToFile(RuntimeScene& scene,
                                            const gd::String& fileName,
                                            const gd::String& imageName) {
  if (!scene.GetImageManager()->HasLoadedSFMLTexture(imageName)) return;

  scene.GetImageManager()->GetSFMLTexture(imageName)->image.saveToFile(
      fileName.ToLocale());
}

}  // namespace PrimitiveDrawingTools
}  // namespace GDpriv

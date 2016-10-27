/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */
#include "GDCore/Project/ImageManager.h"
#include "GDCore/Project/ResourcesManager.h"
#include "GDCore/Project/ResourcesLoader.h"
#include "GDCore/Tools/InvalidImage.h"
#include "GDCore/Project/ResourcesManager.h"
#include <SFML/OpenGL.hpp>
#if !defined(ANDROID) && !defined(MACOS)
#include <GL/glu.h>
#endif
#undef LoadImage //thx windows.h

namespace gd
{

ImageManager::ImageManager() :
    resourcesManager(NULL)
{
    #if !defined(EMSCRIPTEN)
    badTexture = std::make_shared<SFMLTextureWrapper>();
    badTexture->texture.loadFromMemory(gd::InvalidImageData, sizeof(gd::InvalidImageData));
    badTexture->texture.setSmooth(false);
    badTexture->image = badTexture->texture.copyToImage();
    #endif
}

std::shared_ptr<SFMLTextureWrapper> ImageManager::GetSFMLTexture(const gd::String & name) const
{
    if ( !resourcesManager )
    {
        std::cout << "ImageManager has no ResourcesManager associated with.";
        return badTexture;
    }

    if ( alreadyLoadedImages.find(name) != alreadyLoadedImages.end() && !alreadyLoadedImages.find(name)->second.expired() )
        return alreadyLoadedImages.find(name)->second.lock();

    std::cout << "ImageManager: Loading " << name << ".";

    //Load only an image when necessary
    try
    {
        ImageResource & image = dynamic_cast<ImageResource&>(resourcesManager->GetResource(name));

        auto texture = std::make_shared<SFMLTextureWrapper>();
        ResourcesLoader::Get()->LoadSFMLImage( image.GetFile(), texture->image );
        texture->texture.loadFromImage(texture->image);
        texture->texture.setSmooth(image.smooth);

        alreadyLoadedImages[name] = texture;
        #if defined(GD_IDE_ONLY)
        if ( preventUnloading ) unloadingPreventer.push_back(texture); //If unload prevention is activated, add the image to the list dedicated to prevent images from being unloaded.
        #endif

        return texture;
    }
    catch(...)
    {
    }

    std::cout << " Resource not found." << std::endl;

    return badTexture;
}

bool ImageManager::HasLoadedSFMLTexture(const gd::String & name) const
{
    if ( alreadyLoadedImages.find(name) != alreadyLoadedImages.end() && !alreadyLoadedImages.find(name)->second.expired() )
        return true;

    return false;
}

void ImageManager::SetSFMLTextureAsPermanentlyLoaded(const gd::String & name, std::shared_ptr<SFMLTextureWrapper> & texture) const
{
    if ( alreadyLoadedImages.find(name) == alreadyLoadedImages.end() || alreadyLoadedImages.find(name)->second.expired() )
        alreadyLoadedImages[name] = texture;

    if ( permanentlyLoadedImages.find(name) == permanentlyLoadedImages.end() )
        permanentlyLoadedImages[name] = texture;
}

void ImageManager::ReloadImage(const gd::String & name) const
{
    if ( !resourcesManager )
    {
        std::cout << "ImageManager has no ResourcesManager associated with.";
        return;
    }

    //Verify if image is in memory. If not, it will be automatically reloaded when necessary.
    if ( alreadyLoadedImages.find(name) == alreadyLoadedImages.end() || alreadyLoadedImages.find(name)->second.expired() ) return;

    //Image still in memory, get it and update it.
    std::shared_ptr<SFMLTextureWrapper> oldTexture = alreadyLoadedImages.find(name)->second.lock();

    try
    {
        ImageResource & image = dynamic_cast<ImageResource&>(resourcesManager->GetResource(name));

        std::cout << "ImageManager: Reload " << name << std::endl;

        ResourcesLoader::Get()->LoadSFMLImage( image.GetFile(), oldTexture->image );
        oldTexture->texture.loadFromImage(oldTexture->image);
        oldTexture->texture.setSmooth(image.smooth);

        return;
    }
    catch(...) { /*The ressource is not an image*/ }

    //Image not present anymore in image list.
    std::cout << "ImageManager: " << name << " is not available anymore." << std::endl;
    *oldTexture = *badTexture;
}

std::shared_ptr<OpenGLTextureWrapper> ImageManager::GetOpenGLTexture(const gd::String & name) const
{
    if ( alreadyLoadedOpenGLTextures.find(name) != alreadyLoadedOpenGLTextures.end() && !alreadyLoadedOpenGLTextures.find(name)->second.expired() )
        return alreadyLoadedOpenGLTextures.find(name)->second.lock();

    std::cout << "Load OpenGL Texture" << name << std::endl;

    std::shared_ptr<OpenGLTextureWrapper> texture = std::make_shared<OpenGLTextureWrapper>(GetSFMLTexture(name));
    alreadyLoadedOpenGLTextures[name] = texture;
    return texture;
}

void ImageManager::LoadPermanentImages()
{
    if ( !resourcesManager )
    {
        std::cout << "ImageManager has no ResourcesManager associated with.";
        return;
    }

    //Create a new list of permanently loaded images but do not delete now the old list
    //so as not to unload images that could be still present.
    std::map < gd::String, std::shared_ptr<SFMLTextureWrapper> > newPermanentlyLoadedImages;

    std::vector<gd::String> resources = resourcesManager->GetAllResourcesList();
    for ( std::size_t i = 0;i <resources.size();i++ )
    {
        try
        {
            ImageResource & image = dynamic_cast<ImageResource&>(resourcesManager->GetResource(resources[i]));

            if ( image.alwaysLoaded )
                newPermanentlyLoadedImages[image.GetName()] = GetSFMLTexture(image.GetName());
        }
        catch(...) { /*The resource is not an image, we don't care about it.*/}
    }

    permanentlyLoadedImages = newPermanentlyLoadedImages;
}

#if defined(GD_IDE_ONLY)
void ImageManager::PreventImagesUnloading()
{
    preventUnloading = true;
    for (auto it = alreadyLoadedImages.begin();it != alreadyLoadedImages.end();++it)
    {
        std::shared_ptr<SFMLTextureWrapper> image = (it->second).lock();
        if ( image != std::shared_ptr<SFMLTextureWrapper>() ) unloadingPreventer.push_back(image);
    }
}

void ImageManager::EnableImagesUnloading()
{
    preventUnloading = false;
    unloadingPreventer.clear(); //Images which are not used anymore will thus be destroyed (As no shared pointer will be pointing to them).
}
#endif

}

SFMLTextureWrapper::SFMLTextureWrapper(const sf::Texture & texture_) :
    texture(texture_),
    image(texture.copyToImage())
{
}

SFMLTextureWrapper::SFMLTextureWrapper()
{
}

SFMLTextureWrapper::~SFMLTextureWrapper()
{
}

OpenGLTextureWrapper::OpenGLTextureWrapper(std::shared_ptr<SFMLTextureWrapper> sfmlTexture_)
{
    sfmlTexture = sfmlTexture_;

    #if !defined(ANDROID) //TODO: OpenGL
    glGenTextures(1, &texture);
    glBindTexture(GL_TEXTURE_2D, texture);
    // glTexImage2D(GL_TEXTURE_2D, 0, GL_RGBA, sfmlTexture->image.getSize().x, sfmlTexture->image.getSize().y, 0, GL_RGBA, GL_UNSIGNED_BYTE, sfmlTexture->image.getPixelsPtr());
    // glGenerateMipmap(GL_TEXTURE_2D);
    glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MAG_FILTER, GL_LINEAR);
    glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MIN_FILTER, GL_LINEAR_MIPMAP_LINEAR);
    #endif
}

OpenGLTextureWrapper::~OpenGLTextureWrapper()
{
    #if !defined(ANDROID) //TODO: OpenGL
    glDeleteTextures(1, &texture);
    #endif
};

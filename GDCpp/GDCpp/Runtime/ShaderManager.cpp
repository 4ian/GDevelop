#include "ShaderManager.h"
#include "GDCpp/Runtime/ResourcesLoader.h"
#include <iostream>
#include <sstream>


using namespace std;

ShaderManager::ShaderManager()
{
}

std::shared_ptr<sf::Shader> ShaderManager::GetSFMLShader(const std::vector<gd::String> & shaders)
{
    if ( alreadyLoadedShader.find(shaders) != alreadyLoadedShader.end())
        return alreadyLoadedShader[shaders].lock();

    //Loading a new (compilation of) shader(s)
    std::vector<gd::String> declarations;
    gd::String mainFunctions;

    std::shared_ptr<sf::Shader> shader(new sf::Shader);

    for (std::size_t i = 0;i<shaders.size();++i)
    {
        gd::String file = gd::ResourcesLoader::Get()->LoadPlainText(shaders[i]);

        std::istringstream linesStream(file.ToLocale().c_str());

        bool isInMainFunction = false;
        std::string line;
        while ( linesStream.good() )
        {
            getline(linesStream,line);
            if ( line == "void main()" )
            {
                if (!isInMainFunction)
                    isInMainFunction = true;
                else
                    std::cout << "Main function declared more than one time." << std::endl;
            }
            else if ( !isInMainFunction )
            {
                if ( std::find(declarations.begin(), declarations.end(), gd::String::FromLocale(line)+"\n") == declarations.end() )
                    declarations.push_back(gd::String::FromLocale(line)+"\n");
            }
            else
                mainFunctions += gd::String::FromLocale(line)+"\n";
        }
    }

    gd::String shaderSource;
    for (std::size_t i = 0;i<declarations.size();++i) shaderSource += declarations[i];
    shaderSource += "\nvoid main()\n{"+mainFunctions+"}";
    std::cout << "ShaderSource:" << shaderSource << std::endl;
    shader->loadFromMemory(shaderSource.c_str(), sf::Shader::Fragment);

    alreadyLoadedShader[shaders] = shader;

    return shader;
}

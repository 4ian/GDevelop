#include "ShaderManager.h"
#include "GDCpp/RessourcesLoader.h"
#include <iostream>
#include <sstream>


using namespace std;

ShaderManager::ShaderManager() :
    game(NULL)
{
    //ctor
}

boost::shared_ptr<sf::Shader> ShaderManager::GetSFMLShader(const std::vector<std::string> & shaders)
{
    if ( alreadyLoadedShader.find(shaders) != alreadyLoadedShader.end())
        return alreadyLoadedShader[shaders].lock();

    //Loading a new (compilation of) shader(s)
    std::vector<std::string> declarations;
    std::string mainFunctions;

    boost::shared_ptr<sf::Shader> shader(new sf::Shader);

    for (unsigned int i = 0;i<shaders.size();++i)
    {
        std::string file = gd::RessourcesLoader::GetInstance()->LoadPlainText(shaders[i]);

        std::istringstream linesStream(file);

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
                if ( std::find(declarations.begin(), declarations.end(), line+"\n") == declarations.end() )
                    declarations.push_back(line+"\n");
            }
            else
                mainFunctions += line+"\n";
        }
    }

    std::string shaderSource;
    for (unsigned int i = 0;i<declarations.size();++i) shaderSource += declarations[i];
    shaderSource += "\nvoid main()\n{"+mainFunctions+"}";
    std::cout << "ShaderSource:" << shaderSource << std::endl;
    shader->loadFromMemory(shaderSource, sf::Shader::Fragment);

    alreadyLoadedShader[shaders] = shader;

    return shader;
}


#ifndef RESOURCEWRAPPER_H
#define RESOURCEWRAPPER_H
#include <string>
#include <boost/shared_ptr.hpp>
class RuntimeScene;

/**
 * \brief Wrap a resource name ( resources can be images name, font names, or any file used by objects. )
 * This class is useful at edittime to track which resources are used by objects.
 */
class GD_API ResourceWrapper
{
    public:
        ResourceWrapper() {};
        virtual ~ResourceWrapper() {};

        void SetResourceName(const std::string & name);
        void SetResourceName(const std::string & name, RuntimeScene & scene);
        std::string GetResourceName() const;

    private:
        boost::shared_ptr<std::string> resourceName;
};

#endif // RESOURCEWRAPPER_H

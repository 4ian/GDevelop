
#ifndef AUTOMATISMSRUNTIMESHAREDDATAS_HOLDER_H
#define AUTOMATISMSRUNTIMESHAREDDATAS_HOLDER_H
#include <string>
#include <map>
#include <boost/shared_ptr.hpp>
class AutomatismsRuntimeSharedData;
namespace gd { class AutomatismsSharedData; }

/**
 * \brief Contains all the shared data of the automatisms of a RuntimeScene.
 */
class AutomatismsRuntimeSharedDataHolder
{
public:
	AutomatismsRuntimeSharedDataHolder() {};
    AutomatismsRuntimeSharedDataHolder(const AutomatismsRuntimeSharedDataHolder & other);
    AutomatismsRuntimeSharedDataHolder & operator=(const AutomatismsRuntimeSharedDataHolder & other);

	/**
	 * \brief Return the shared data for an automatism.
     * \warning Be careful, no check is made to ensure that the shared data exist.
     * \param name The name of the automatism for which shared data must be fetched.
	 */
    const boost::shared_ptr<AutomatismsRuntimeSharedData> & GetAutomatismSharedData(const std::string & automatismName) const;

    /**
     * \brief Create all runtime shared data according to the initial shared data passed as argument.
     */
    void LoadFrom(const std::map < std::string, boost::shared_ptr<gd::AutomatismsSharedData> > & sharedData);

private:
    void Init(const AutomatismsRuntimeSharedDataHolder & other);

	std::map < std::string, boost::shared_ptr<AutomatismsRuntimeSharedData> > automatismsSharedDatas;
};

#endif

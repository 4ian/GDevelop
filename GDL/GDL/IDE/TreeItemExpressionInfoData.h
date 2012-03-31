#if defined(GD_IDE_ONLY)

#ifndef TREEITEMEXPRESSIONINFODATA_H
#define TREEITEMEXPRESSIONINFODATA_H
#include "GDL/ExtensionBase.h"

/**
 * This class can be used by wxTreeCtrl, to attach
 * information ( an ExpressionMetadata and the name of the expression ) to an item
 */
class GD_API TreeItemExpressionInfoData : public wxTreeItemData
{
public:
    TreeItemExpressionInfoData(const std::string & name_, const ExpressionMetadata & info_) : name(name_), info(info_) { };
    virtual ~TreeItemExpressionInfoData() {};

    const std::string & GetName() const { return name; }
    const ExpressionMetadata & GetExpressionMetadata() const { return info; }

private:
    std::string name;
    ExpressionMetadata info;
};

#endif // TREEITEMEXPRESSIONINFODATA_H
#endif

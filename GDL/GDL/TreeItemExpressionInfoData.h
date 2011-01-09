#if defined(GD_IDE_ONLY)

#ifndef TREEITEMEXPRESSIONINFODATA_H
#define TREEITEMEXPRESSIONINFODATA_H

/**
 * This class can be used by wxTreeCtrl, to attach
 * information ( an ExpressionInfos and the name of the expression ) to an item
 */
class GD_API TreeItemExpressionInfoData : public wxTreeItemData
{
public:
    TreeItemExpressionInfoData(const std::string & name_, const ExpressionInfos & info_) : name(name_), info(info_) { };
    virtual ~TreeItemExpressionInfoData() {};

    const std::string & GetName() const { return name; }
    const ExpressionInfos & GetExpressionInfos() const { return info; }

private:
    std::string name;
    ExpressionInfos info;
};

#endif // TREEITEMEXPRESSIONINFODATA_H
#endif

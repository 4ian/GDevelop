#if defined(GD_IDE_ONLY)

#ifndef TREEITEMSTREXPRESSIONINFODATA_H
#define TREEITEMSTREXPRESSIONINFODATA_H


/**
 * \brief Internal class used by IDE
 * This class can be used by wxTreeCtrl, to attach
 * information ( an ExpressionMetadata and the name of the expression ) to an item
 */
class GD_API TreeItemStrExpressionInfoData : public wxTreeItemData
{
public:
    TreeItemStrExpressionInfoData(const std::string & name_, const StrExpressionMetadata & info_) : name(name_), info(info_) { };
    virtual ~TreeItemStrExpressionInfoData() {};

    const std::string & GetName() const { return name; }
    const StrExpressionMetadata & GetStrExpressionMetadata() const { return info; }

private:
    std::string name;
    StrExpressionMetadata info;
};


#endif // TREEITEMSTREXPRESSIONINFODATA_H
#endif

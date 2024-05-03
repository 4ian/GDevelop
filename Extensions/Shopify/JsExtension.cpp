/**

GDevelop - Shopify Extension
Copyright (c)2017  Florian Rival (Florian.Rival@gmail.com)
This project is released under the MIT License.
*/
#if defined(GD_IDE_ONLY)
#include "GDCore/Extensions/PlatformExtension.h"
#include "GDCore/Tools/Localization.h"

void DeclareShopifyExtension(gd::PlatformExtension& extension) {
  extension.SetExtensionInformation(
      "Shopify",
      _("Shopify"),
      _("Interact with products and generate URLs for checkouts with your "
        "Shopify shop."),
      "Florian Rival",
      "Open source (MIT License)")
      .SetExtensionHelpPath("/all-features/shopify")
      .SetCategory("Third-party");
  extension.AddInstructionOrExpressionGroupMetadata(_("Shopify"))
      .SetIcon("JsPlatform/Extensions/shopifyicon.png");

#if defined(GD_IDE_ONLY)
  extension
      .AddAction(
          "BuildClient",
          _("Initialize a shop"),
          _("Initialize a shop with your credentials. Call this action first, "
            "and then use the shop name in the other actions to interact with "
            "products."),
          _("Initialize shop _PARAM1_ (domain: _PARAM2_, appId: _PARAM3_)"),
          "",
          "JsPlatform/Extensions/shopifyicon.png",
          "JsPlatform/Extensions/shopifyicon.png")

      .AddCodeOnlyParameter("currentScene", "")
      .AddParameter("string", _("Shop name"))
      .AddParameter("string", _("Domain (xxx.myshopify.com)"))
      .AddParameter("string", _("App Id"))
      .AddParameter("string", _("Access Token"));

  extension
      .AddAction(
          "GetCheckoutUrlForProduct",
          _("Get the URL for buying a product"),
          _("Get the URL for buying a product from a shop. The URL will be "
            "stored in the scene variable that you specify. You can then use the "
            "action to open an URL to redirect the player to the checkout."),
          _("Get the URL for product #_PARAM2_ (quantity: _PARAM3_, variant: "
            "_PARAM4_) from shop _PARAM1_, and store it in _PARAM5_ (or "
            "_PARAM6_ in case of error)"),
          "",
          "JsPlatform/Extensions/shopifyicon.png",
          "JsPlatform/Extensions/shopifyicon.png")

      .AddCodeOnlyParameter("currentScene", "")
      .AddParameter(
          "string",
          _("Shop name (initialized with \"Initialize a shop\" action)"))
      .AddParameter("string", _("Product id"))
      .AddParameter("expression", _("Quantity"))
      .AddParameter("expression", _("Variant (0 by default)"))
      .SetDefaultValue("0")
      .AddParameter("scenevar",
                    _("Scene variable where the URL for checkout must be stored"))
      .AddParameter("scenevar", _("Scene variable containing the error (if any)"));
#endif
}

/**
 * \brief This class declares information about the JS extension.
 */
class ShopifyJsExtension : public gd::PlatformExtension {
 public:
  /**
   * \brief Constructor of an extension declares everything the extension
   * contains: objects, actions, conditions and expressions.
   */
  ShopifyJsExtension() {
    DeclareShopifyExtension(*this);

    GetAllActions()["Shopify::BuildClient"]
        .SetIncludeFile("Extensions/Shopify/shopify-buy.umd.polyfilled.min.js")
        .AddIncludeFile("Extensions/Shopify/shopifytools.js")
        .SetFunctionName("gdjs.evtTools.shopify.buildClient");
    GetAllActions()["Shopify::GetCheckoutUrlForProduct"]
        .SetIncludeFile("Extensions/Shopify/shopify-buy.umd.polyfilled.min.js")
        .AddIncludeFile("Extensions/Shopify/shopifytools.js")
        .SetFunctionName("gdjs.evtTools.shopify.getCheckoutUrlForProduct");

    StripUnimplementedInstructionsAndExpressions();
    GD_COMPLETE_EXTENSION_COMPILATION_INFORMATION();
  };
};

#if defined(EMSCRIPTEN)
extern "C" gd::PlatformExtension* CreateGDJSShopifyExtension() {
  return new ShopifyJsExtension;
}
#else
/**
 * Used by GDevelop to create the extension class
 * -- Do not need to be modified. --
 */
extern "C" gd::PlatformExtension* GD_EXTENSION_API CreateGDJSExtension() {
  return new ShopifyJsExtension;
}
#endif
#endif

namespace gdjs {
  declare var ShopifyBuy: any;

  export class ShopifyClientsManager {
    static set(runtimeScene, name, shopifyClient) {
      const game = runtimeScene.getGame();
      if (!game.shopifyClients) {
        game.shopifyClients = {};
      }
      game.shopifyClients[name] = shopifyClient;
    }

    static get(runtimeScene, name) {
      const game = runtimeScene.getGame();
      if (!game.shopifyClients) {
        game.shopifyClients = {};
      }
      return game.shopifyClients[name];
    }
  }

  export namespace evtTools {
    export namespace shopify {
      export const buildClient = function (
        runtimeScene,
        name,
        domain,
        appId,
        accessToken
      ) {
        if (typeof ShopifyBuy === 'undefined') {
          return;
        }
        const config = new ShopifyBuy.Config({
          accessToken: accessToken,
          domain: domain,
          appId: appId,
        });
        const shopifyClient = ShopifyBuy.buildClient(config);
        ShopifyClientsManager.set(runtimeScene, name, shopifyClient);
      };
      export const getCheckoutUrlForProduct = function (
        runtimeScene,
        name,
        productId,
        quantity,
        variantIndex,
        successVariable,
        errorVariable
      ) {
        errorVariable.setString('');
        successVariable.setString('');
        const shopifyClient = ShopifyClientsManager.get(runtimeScene, name);
        shopifyClient.fetchProduct(productId).then(
          function (product) {
            if (variantIndex < 0 || variantIndex >= product.variants.length) {
              errorVariable.setString('The product has no variant.');
              return;
            }
            const variant = product.variants[variantIndex];
            const checkoutURL = variant.checkoutUrl(quantity);
            successVariable.setString(checkoutURL);
          },
          function (error) {
            errorVariable.setString(
              'Unable to get the product that was requested.'
            );
          }
        );
      };
    }
  }
}

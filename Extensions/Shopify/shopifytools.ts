namespace gdjs {
  export interface RuntimeGame {
    shopifyClients: { [name: string]: any };
  }
  declare var ShopifyBuy: any;

  export class ShopifyClientsManager {
    static set(
      instanceContainer: gdjs.RuntimeInstanceContainer,
      name: string,
      shopifyClient
    ) {
      const game = instanceContainer.getGame();
      if (!game.shopifyClients) {
        game.shopifyClients = {};
      }
      game.shopifyClients[name] = shopifyClient;
    }

    static get(instanceContainer: gdjs.RuntimeInstanceContainer, name: string) {
      const game = instanceContainer.getGame();
      if (!game.shopifyClients) {
        game.shopifyClients = {};
      }
      return game.shopifyClients[name];
    }
  }

  export namespace evtTools {
    export namespace shopify {
      export const buildClient = function (
        instanceContainer: gdjs.RuntimeInstanceContainer,
        name: string,
        domain: string,
        appId: string,
        accessToken: string
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
        ShopifyClientsManager.set(instanceContainer, name, shopifyClient);
      };

      export const getCheckoutUrlForProduct = function (
        instanceContainer: gdjs.RuntimeInstanceContainer,
        name: string,
        productId: string,
        quantity: number,
        variantIndex: number,
        successVariable: gdjs.Variable,
        errorVariable: gdjs.Variable
      ) {
        errorVariable.setString('');
        successVariable.setString('');
        const shopifyClient = ShopifyClientsManager.get(
          instanceContainer,
          name
        );
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

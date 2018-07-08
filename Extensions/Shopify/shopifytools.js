gdjs.ShopifyClientsManager = function() {
};

gdjs.ShopifyClientsManager.set = function(runtimeScene, name, shopifyClient) {
	var game = runtimeScene.getGame();
	if (!game.shopifyClients) {
		game.shopifyClients = {};
	}

	game.shopifyClients[name] = shopifyClient;
}

gdjs.ShopifyClientsManager.get = function(runtimeScene, name) {
	var game = runtimeScene.getGame();
	if (!game.shopifyClients) {
		game.shopifyClients = {};
	}

	return game.shopifyClients[name];
}

/**
 * @memberof gdjs.evtTools
 * @class shopify
 * @static
 * @private
 */
gdjs.evtTools.shopify = {};

gdjs.evtTools.shopify.buildClient = function(runtimeScene, name, domain, appId, accessToken) {
	if (typeof ShopifyBuy === 'undefined') return;

	var config = new ShopifyBuy.Config({
		accessToken: accessToken,
		domain: domain,
		appId: appId
	});
	var shopifyClient = ShopifyBuy.buildClient(config);

	gdjs.ShopifyClientsManager.set(runtimeScene, name, shopifyClient);
};

gdjs.evtTools.shopify.getCheckoutUrlForProduct = function(runtimeScene, name,
	productId, quantity, variantIndex, successVariable, errorVariable) {
	errorVariable.setString("");
	successVariable.setString("");

	var shopifyClient = gdjs.ShopifyClientsManager.get(runtimeScene, name);

	shopifyClient.fetchProduct(productId)
	.then(function (product) {
		if (variantIndex < 0 || variantIndex >= product.variants.length) {
			errorVariable.setString("The product has no variant.");
			return;
		}

		var variant = product.variants[variantIndex];
		var checkoutURL = variant.checkoutUrl(quantity);
		successVariable.setString(checkoutURL);
	}, function (error) {
		errorVariable.setString("Unable to get the product that was requested.");
	});
};

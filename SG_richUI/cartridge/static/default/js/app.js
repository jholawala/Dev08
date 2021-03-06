(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/**
 *    (c) 2009-2014 Demandware Inc.
 *    Subject to standard usage terms and conditions
 *    For all details and documentation:
 *    https://bitbucket.com/demandware/sitegenesis
 */

'use strict';

var carousel = require('./carousel'),
	dialog = require('./dialog'),
	minicart = require('./minicart'),
	mulitcurrency = require('./multicurrency'),
	page = require('./page'),
	searchplaceholder = require('./searchplaceholder'),
	searchsuggest = require('./searchsuggest'),
	searchsuggestbeta = require('./searchsuggest-beta'),
	tooltip = require('./tooltip'),
	util = require('./util'),
	validator = require('./validator');

// if jQuery has not been loaded, load from google cdn
if (!window.jQuery) {
	var s = document.createElement('script');
	s.setAttribute('src', 'https://ajax.googleapis.com/ajax/libs/jquery/1.7.1/jquery.min.js');
	s.setAttribute('type', 'text/javascript');
	document.getElementsByTagName('head')[0].appendChild(s);
}

require('./jquery-ext')();
require('./cookieprivacy')();

function initializeEvents() {
	var controlKeys = ['8', '13', '46', '45', '36', '35', '38', '37', '40', '39'];

	$('body')
		.on('keydown', 'textarea[data-character-limit]', function (e) {
			var text = $.trim($(this).val()),
				charsLimit = $(this).data('character-limit'),
				charsUsed = text.length;

				if ((charsUsed >= charsLimit) && (controlKeys.indexOf(e.which.toString()) < 0)) {
					e.preventDefault();
				}
		})
		.on('change keyup mouseup', 'textarea[data-character-limit]', function () {
			var text = $.trim($(this).val()),
				charsLimit = $(this).data('character-limit'),
				charsUsed = text.length,
				charsRemain = charsLimit - charsUsed;

			if (charsRemain < 0) {
				$(this).val(text.slice(0, charsRemain));
				charsRemain = 0;
			}

			$(this).next('div.char-count').find('.char-remain-count').html(charsRemain);
		});

	/**
	 * initialize search suggestions, pending the value of the site preference(enhancedSearchSuggestions)
	 * this will either init the legacy(false) or the beta versions(true) of the the search suggest feature.
	 * */
	var $searchContainer = $('#navigation .header-search');
	if (SitePreferences.LISTING_SEARCHSUGGEST_LEGACY) {
		searchsuggest.init($searchContainer, Resources.SIMPLE_SEARCH);
	} else {
		searchsuggestbeta.init($searchContainer, Resources.SIMPLE_SEARCH);
	}

	// print handler
	$('.print-page').on('click', function () {
		window.print();
		return false;
	});

	// add show/hide navigation elements
	$('.secondary-navigation .toggle').click(function () {
		$(this).toggleClass('expanded').next('ul').toggle();
	});

	// add generic toggle functionality
	$('.toggle').next('.toggle-content').hide();
	$('.toggle').click(function () {
		$(this).toggleClass('expanded').next('.toggle-content').toggle();
	});

	// subscribe email box
	var $subscribeEmail = $('.subscribe-email');
	if ($subscribeEmail.length > 0)	{
		$subscribeEmail.focus(function () {
			var val = $(this.val());
			if (val.length > 0 && val !== Resources.SUBSCRIBE_EMAIL_DEFAULT) {
				return; // do not animate when contains non-default value
			}

			$(this).animate({color: '#999999'}, 500, 'linear', function () {
				$(this).val('').css('color', '#333333');
			});
		}).blur(function () {
			var val = $.trim($(this.val()));
			if (val.length > 0) {
				return; // do not animate when contains value
			}
			$(this).val(Resources.SUBSCRIBE_EMAIL_DEFAULT)
				.css('color', '#999999')
				.animate({color: '#333333'}, 500, 'linear');
		});
	}

	$('.privacy-policy').on('click', function (e) {
		e.preventDefault();
		dialog.open({
			url: $(e.target).attr('href'),
			options: {
				height: 600
			}
		});
	});
}
/**
 * @private
 * @function
 * @description Adds class ('js') to html for css targeting and loads js specific styles.
 */
function initializeDom() {
	// add class to html for css targeting
	$('html').addClass('js');
	if (SitePreferences.LISTING_INFINITE_SCROLL) {
		$('html').addClass('infinite-scroll');
	}
	// load js specific styles
	util.limitCharacters();
}

var pages = {
	account: require('./pages/account'),
	cart: require('./pages/cart'),
	checkout: require('./pages/checkout'),
	compare: require('./pages/compare'),
	product: require('./pages/product'),
	registry: require('./pages/registry'),
	search: require('./pages/search'),
	storefront: require('./pages/storefront'),
	wishlist: require('./pages/wishlist'),
	storelocator: require('./pages/storelocator')
};

var app = {
	init: function () {
		if (document.cookie.length === 0) {
			$('<div/>').addClass('browser-compatibility-alert').append($('<p/>').addClass('browser-error').html(Resources.COOKIES_DISABLED)).appendTo('#browser-check');
		}
		initializeDom();
		initializeEvents();

		// init specific global components
		tooltip.init();
		minicart.init();
		validator.init();
		carousel.init();
		searchplaceholder.init();
		mulitcurrency.init();
		// execute page specific initializations
		$.extend(page, window.pageContext);
		var ns = page.ns;
		if (ns && pages[ns] && pages[ns].init) {
			pages[ns].init();
		}
	}
};

// general extension functions
(function () {
	String.format = function () {
		var s = arguments[0];
		var i, len = arguments.length - 1;
		for (i = 0; i < len; i++) {
			var reg = new RegExp('\\{' + i + '\\}', 'gm');
			s = s.replace(reg, arguments[i + 1]);
		}
		return s;
	};
})();

// initialize app
$(document).ready(function () {
	app.init();
});

},{"./carousel":4,"./cookieprivacy":6,"./dialog":7,"./jquery-ext":10,"./minicart":11,"./multicurrency":12,"./page":13,"./pages/account":14,"./pages/cart":15,"./pages/checkout":19,"./pages/compare":22,"./pages/product":27,"./pages/registry":33,"./pages/search":34,"./pages/storefront":35,"./pages/storelocator":36,"./pages/wishlist":37,"./searchplaceholder":41,"./searchsuggest":43,"./searchsuggest-beta":42,"./tooltip":46,"./util":47,"./validator":48}],2:[function(require,module,exports){
'use strict';

var progress = require('./progress'),
	util = require('./util');

var currentRequests = [];

/**
 * @function
 * @description Ajax request to get json response
 * @param {Boolean} async  Asynchronous or not
 * @param {String} url URI for the request
 * @param {Object} data Name/Value pair data request
 * @param {Function} callback  Callback function to be called
 */
var getJson = function (options) {
	options.url = util.toAbsoluteUrl(options.url);
	// return if no url exists or url matches a current request
	if (!options.url || currentRequests[options.url]) {
		return;
	}

	currentRequests[options.url] = true;

	// make the server call
	$.ajax({
		dataType: 'json',
		url: options.url,
		async: (typeof options.async === 'undefined' || options.async === null) ? true : options.async,
		data: options.data || {}
	})
	// success
	.done(function (response) {
		if (options.callback) {
			options.callback(response);
		}
	})
	// failed
	.fail(function (xhr, textStatus) {
		if (textStatus === 'parsererror') {
			window.alert(Resources.BAD_RESPONSE);
		}
		if (options.callback) {
			options.callback(null);
		}
	})
	// executed on success or fail
	.always(function () {
		// remove current request from hash
		if (currentRequests[options.url]) {
			delete currentRequests[options.url];
		}
	});
};
/**
 * @function
 * @description ajax request to load html response in a given container
 * @param {String} url URI for the request
 * @param {Object} data Name/Value pair data request
 * @param {Function} callback  Callback function to be called
 * @param {Object} target Selector or element that will receive content
 */
var load = function (options) {
	options.url = util.toAbsoluteUrl(options.url);
	// return if no url exists or url matches a current request
	if (!options.url || currentRequests[options.url]) {
		return;
	}

	currentRequests[options.url] = true;

	// make the server call
	$.ajax({
		dataType: 'html',
		url: util.appendParamToURL(options.url, 'format', 'ajax'),
		data: options.data
	})
	.done(function (response) {
		// success
		if (options.target) {
			$(options.target).empty().html(response);
		}
		if (options.callback) {
			options.callback(response);
		}

	})
	.fail(function (xhr, textStatus) {
		// failed
		if (textStatus === 'parsererror') {
			window.alert(Resources.BAD_RESPONSE);
		}
		options.callback(null, textStatus);
	})
	.always(function () {
		progress.hide();
		// remove current request from hash
		if (currentRequests[options.url]) {
			delete currentRequests[options.url];
		}
	});
};

exports.getJson = getJson;
exports.load = load;

},{"./progress":39,"./util":47}],3:[function(require,module,exports){
'use strict';

var ajax = require('./ajax'),
	dialog = require('./dialog'),
	page = require('./page'),
	util = require('./util');

var selectedList = [];
var maxItems = 1;
var bliUUID = '';

/**
 * @private
 * @function
 * description Gets a list of bonus products related to a promoted product
 */
function getBonusProducts() {
	var o = {};
	o.bonusproducts = [];

	var i, len;
	for (i = 0, len = selectedList.length; i < len; i++) {
		var p = {
			pid: selectedList[i].pid,
			qty: selectedList[i].qty,
			options: {}
		};
		var a, alen, bp = selectedList[i];
		for (a = 0, alen = bp.options.length; a < alen; a++) {
			var opt = bp.options[a];
			p.options = {optionName:opt.name, optionValue:opt.value};
		}
		o.bonusproducts.push({product:p});
	}
	return o;
}
/**
 * @private
 * @function
 * @description Updates the summary page with the selected bonus product
 */
function updateSummary() {
	var $bonusProductList = $('#bonus-product-list');
	if (selectedList.length === 0) {
		$bonusProductList.find('li.selected-bonus-item').remove();
	} else {
		var ulList = $bonusProductList.find('ul.selected-bonus-items').first();
		var itemTemplate = ulList.children('.selected-item-template').first();
		var i, len;
		for (i = 0, len = selectedList.length; i < len; i++) {
			var item = selectedList[i];
			var li = itemTemplate.clone().removeClass('selected-item-template').addClass('selected-bonus-item');
			li.data('uuid', item.uuid).data('pid', item.pid);
			li.find('.item-name').html(item.name);
			li.find('.item-qty').html(item.qty);
			var ulAtts = li.find('.item-attributes');
			var attTemplate = ulAtts.children().first().clone();
			ulAtts.empty();
			var att;
			for (att in item.attributes) {
				var attLi = attTemplate.clone();
				attLi.addClass(att);
				attLi.children('.display-name').html(item.attributes[att].displayName);
				attLi.children('.display-value').html(item.attributes[att].displayValue);
				attLi.appendTo(ulAtts);
			}
			li.appendTo(ulList);
		}
		ulList.children('.selected-bonus-item').show();
	}

	// get remaining item count
	var remain = maxItems - selectedList.length;
	$bonusProductList.find('.bonus-items-available').text(remain);
	if (remain <= 0) {
		$bonusProductList.find('.button-select-bonus').attr('disabled', 'disabled');
	} else {
		$bonusProductList.find('.button-select-bonus').removeAttr('disabled');
	}
}

function initializeGrid () {
	var $bonusProduct = $('#bonus-product-dialog'),
		$bonusProductList = $('#bonus-product-list'),
	bliData = $bonusProductList.data('line-item-detail');
	maxItems = bliData.maxItems;
	bliUUID = bliData.uuid;

	if (bliData.itemCount >= maxItems) {
		$bonusProductList.find('.button-select-bonus').attr('disabled', 'disabled');
	}

	var cartItems = $bonusProductList.find('.selected-bonus-item');
	cartItems.each(function () {
		var ci = $(this);
		var product = {
			uuid: ci.data('uuid'),
			pid: ci.data('pid'),
			qty: ci.find('.item-qty').text(),
			name: ci.find('.item-name').html(),
			attributes: {}
		};
		var attributes = ci.find('ul.item-attributes li');
		attributes.each(function () {
			var li = $(this);
			product.attributes[li.data('attributeId')] = {
				displayName:li.children('.display-name').html(),
				displayValue:li.children('.display-value').html()
			};
		});
		selectedList.push(product);
	});

	$bonusProductList.on('click', '.bonus-product-item a[href].swatchanchor', function (e) {
		e.preventDefault();
	})
	.on('change', '.input-text', function () {
		$bonusProductList.find('.button-select-bonus').removeAttr('disabled');
		$(this).closest('.bonus-product-form').find('.quantity-error').text('');
	})
	.on('click', '.button-select-bonus', function (e) {
		e.preventDefault();
		if (selectedList.length >= maxItems) {
			$bonusProductList.find('.button-select-bonus').attr('disabled', 'disabled');
			$bonusProductList.find('.bonus-items-available').text('0');
			return;
		}

		var form = $(this).closest('.bonus-product-form'),
			detail = $(this).closest('.product-detail'),
			uuid = form.find('input[name="productUUID"]').val(),
			qtyVal = form.find('input[name="Quantity"]').val(),
			qty = (isNaN(qtyVal)) ? 1 : (+qtyVal);

		if (qty > maxItems) {
			$bonusProductList.find('.button-select-bonus').attr('disabled', 'disabled');
			form.find('.quantity-error').text(Resources.BONUS_PRODUCT_TOOMANY);
			return;
		}

		var product = {
			uuid: uuid,
			pid: form.find('input[name="pid"]').val(),
			qty: qty,
			name: detail.find('.product-name').text(),
			attributes: detail.find('.product-variations').data('current'),
			options: []
		};

		var optionSelects = form.find('.product-option');

		optionSelects.each(function () {
			product.options.push({
				name: this.name,
				value: $(this).val(),
				display: $(this).children(':selected').first().html()
			});
		});
		selectedList.push(product);
		updateSummary();
	})
	.on('click', '.remove-link', function (e) {
		e.preventDefault();
		var container = $(this).closest('.selected-bonus-item');
		if (!container.data('uuid')) { return; }

		var uuid = container.data('uuid');
		var i, len = selectedList.length;
		for (i = 0; i < len; i++) {
			if (selectedList[i].uuid === uuid) {
				selectedList.splice(i, 1);
				break;
			}
		}
		updateSummary();
	})
	.on('click', '.add-to-cart-bonus', function (e) {
		e.preventDefault();
		var url = util.appendParamsToUrl(Urls.addBonusProduct, {bonusDiscountLineItemUUID: bliUUID});
		var bonusProducts = getBonusProducts();
		if (bonusProducts.bonusproducts[0].product.qty > maxItems) {
			bonusProducts.bonusproducts[0].product.qty = maxItems;
		}
		// make the server call
		$.ajax({
			type: 'POST',
			dataType: 'json',
			cache: false,
			contentType: 'application/json',
			url: url,
			data: JSON.stringify(bonusProducts)
		})
		.done(function () {
			// success
			page.refresh();
		})
		.fail(function (xhr, textStatus) {
			// failed
			if (textStatus === 'parsererror') {
				window.alert(Resources.BAD_RESPONSE);
			} else {
				window.alert(Resources.SERVER_CONNECTION_ERROR);
			}
		})
		.always(function () {
			$bonusProduct.dialog('close');
		});
	});
}

var bonusProductsView = {
	/**
	 * @function
	 * @description Opens the bonus product quick view dialog
	 */
	show: function (url) {
		var $bonusProduct = $('#bonus-product-dialog');
		// create the dialog
		dialog.create({
			target: $bonusProduct,
			options: {
				width: 795,
				dialogClass: 'quickview',
				title: Resources.BONUS_PRODUCTS
			}
		});

		// load the products then show
		ajax.load({
			target: $bonusProduct,
			url: url,
			callback: function () {
				$bonusProduct.dialog('open');
				initializeGrid();
				$('#bonus-product-dialog .emptyswatch').css('display', 'none');
			}
		});

	},
	/**
	 * @function
	 * @description Closes the bonus product quick view dialog
	 */
	close: function () {
		$('#bonus-product-dialog').dialog('close');
	},
	/**
	 * @function
	 * @description Loads the list of bonus products into quick view dialog
	 */
	loadBonusOption: function () {
		var	$bonusDiscountContainer = $('.bonus-discount-container');
		if ($bonusDiscountContainer.length === 0) { return; }

		dialog.create({
			target: $bonusDiscountContainer,
			options: {
				height: 'auto',
				width: 350,
				dialogClass: 'quickview',
				title: Resources.BONUS_PRODUCT
			}
		});
		$bonusDiscountContainer.dialog('open');

		// add event handlers
		$bonusDiscountContainer.on('click', '.select-bonus-btn', function (e) {
			e.preventDefault();
			var uuid = $bonusDiscountContainer.data('lineitemid');
			var url = util.appendParamsToUrl(Urls.getBonusProducts, {
				bonusDiscountLineItemUUID: uuid,
				source: 'bonus'
			});

			$bonusDiscountContainer.dialog('close');
			this.show(url);
		}.bind(this)).on('click', '.no-bonus-btn', function () {
			$bonusDiscountContainer.dialog('close');
		});
	},
};

module.exports = bonusProductsView;

},{"./ajax":2,"./dialog":7,"./page":13,"./util":47}],4:[function(require,module,exports){
/* global dw */

'use strict';

/**
 * @function
 * @description capture recommendation of each product when it becomes visible in the carousel
 * @param c TBD
 * @param {Element} li The visible product element in the carousel
 */

function captureCarouselRecommendations(c, li) {
	if (!dw) { return; }

	$(li).find('.capture-product-id').each(function () {
		dw.ac.capture({
			id: $(this).text(),
			type: dw.ac.EV_PRD_RECOMMENDATION
		});
	});
}

var carousel = {
	settings: {
		scroll: 1,
		itemFallbackDimension: '100%',
		itemVisibleInCallback: captureCarouselRecommendations
	},
	init: function () {
		setTimeout(function () {
			// renders horizontal/vertical carousels for product slots
			$('#vertical-carousel').jcarousel($.extend({vertical: true}, this.settings));
			$('#horizontal-carousel').jcarousel(this.settings);
		}.bind(this), 1000);
	}
};

module.exports = carousel;

},{}],5:[function(require,module,exports){
'use strict';

var page = require('./page'),
	util = require('./util'),
	TPromise = require('promise');

var _currentCategory = '',
	MAX_ACTIVE = 6;

/**
 * @private
 * @function
 * @description Verifies the number of elements in the compare container and updates it with sequential classes for ui targeting
 */
function refreshContainer() {
	var $compareContainer = $('.compare-items');
	var $compareItems = $compareContainer.find('.compare-item');
	var numActive = $compareItems.filter('.active').length;

	if (numActive < 2) {
		$('#compare-items-button').attr('disabled', 'disabled');
	} else {
		$('#compare-items-button').removeAttr('disabled');
	}

	$compareContainer.toggle(numActive > 0);
}
/**
 * @private
 * @function
 * @description Adds an item to the compare container and refreshes it
 */
function addToList(data) {
	// get the first compare-item not currently active
	var $item = $('.compare-items .compare-item').not('.active').first(),
		$productTile = $('#' + data.uuid);

	if ($item.length === 0) {
		if ($productTile.length > 0) {
			$productTile.find('.compare-check')[0].checked = false;
		}
		window.alert(Resources.COMPARE_ADD_FAIL);
		return;
	}

	// if already added somehow, return
	if ($('[data-uuid="' + data.uuid + '"]').length > 0) {
		return;
	}
	// set as active item
	$item.addClass('active')
		.attr('data-uuid', data.uuid)
		.attr('data-itemid', data.itemid)
		.data('uuid', data.uuid)
		.data('itemid', data.itemid)
		.append($(data.img).clone().addClass('compare-item-image'));
}
/**
 * @private
 * @function
 * description Removes an item from the compare container and refreshes it
 */
function removeFromList($item) {
	if ($item.length === 0) { return; }
	// remove class, data and id from item
	$item.removeClass('active')
		.removeAttr('data-uuid')
		.removeAttr('data-itemid')
		.data('uuid', '')
		.data('itemid', '')
		// remove the image
		.find('.compare-item-image').remove();
}

function addProductAjax(args) {
	var promise = new TPromise(function (resolve, reject) {
		$.ajax({
			url: Urls.compareAdd,
			data: {
				pid: args.itemid,
				category: _currentCategory
			},
			dataType: 'json',
		}).done(function (response) {
			if (!response || !response.success) {
				reject(new Error(Resources.COMPARE_ADD_FAIL));
			} else {
				resolve(response);
			}
		}).fail(function (jqxhr, status, err) {
			reject(new Error(err));
		});
	});
	return promise;
}

function removeProductAjax(args) {
	var promise = new TPromise(function (resolve, reject) {
		$.ajax({
			url: Urls.compareRemove,
			data: {
				pid: args.itemid,
				category: _currentCategory
			},
			dataType: 'json'
		}).done(function (response) {
			if (!response || !response.success) {
				reject(new Error(Resources.COMPARE_REMOVE_FAIL));
			} else {
				resolve(response);
			}
		}).fail(function (jqxhr, status, err) {
			reject(new Error(err));
		});
	});
	return promise;
}

function shiftImages() {
	return new TPromise(function (resolve) {
		var $items = $('.compare-items .compare-item');
		$items.each(function (i, item) {
			var $item = $(item);
			// last item
			if (i === $items.length - 1) {
				return removeFromList($item);
			}
			var $next = $items.eq(i + 1);
			if ($next.hasClass('active')) {
				// remove its own image
				$next.find('.compare-item-image').detach().appendTo($item);
				$item.addClass('active')
					.attr('data-uuid', $next.data('uuid'))
					.attr('data-itemid', $next.data('itemid'))
					.data('uuid', $next.data('uuid'))
					.data('itemid', $next.data('itemid'));
			}
		});
		resolve();
	});
}

/**
 * @function
 * @description Adds product to the compare table
 */
function addProduct(args) {
	var promise;
	var $items = $('.compare-items .compare-item');
	var $cb = $(args.cb);
	var numActive = $items.filter('.active').length;
	if (numActive === MAX_ACTIVE) {
		if (!window.confirm(Resources.COMPARE_CONFIRMATION)) {
			$cb[0].checked = false;
			return;
		}

		// remove product using id
		var $firstItem = $items.first();
		promise = removeItem($firstItem).then(function () {
			return shiftImages();
		});
	} else {
		promise = TPromise.resolve(0);
	}
	return promise.then(function () {
		return addProductAjax(args).then(function () {
			addToList(args);
			if ($cb && $cb.length > 0) { $cb[0].checked = true; }
			refreshContainer();
		});
	}).then(null, function () {
		if ($cb && $cb.length > 0) { $cb[0].checked = false; }
	});
}

/**
 * @function
 * @description Removes product from the compare table
 * @param {object} args - the arguments object should have the following properties: itemid, uuid and cb (checkbox)
 */
function removeProduct(args) {
	var $cb = args.cb ? $(args.cb) : null;
	return removeProductAjax(args).then(function () {
		var $item = $('[data-uuid="' + args.uuid + '"]');
		removeFromList($item);
		if ($cb && $cb.length > 0) { $cb[0].checked = false; }
		refreshContainer();
	}, function () {
		if ($cb && $cb.length > 0) { $cb[0].checked = true; }
	});
}

function removeItem($item) {
	var uuid = $item.data('uuid'),
		$productTile = $('#' + uuid);
	return removeProduct({
		itemid: $item.data('itemid'),
		uuid: uuid,
		cb: ($productTile.length === 0) ? null : $productTile.find('.compare-check')
	});
}

/**
 * @private
 * @function
 * @description Initializes the DOM-Object of the compare container
 */
function initializeDom() {
	var $compareContainer = $('.compare-items');
	_currentCategory = $compareContainer.data('category') || '';
	var $active = $compareContainer.find('.compare-item').filter('.active');
	$active.each(function () {
		var $productTile = $('#' +  $(this).data('uuid'));
		if ($productTile.length === 0) {return;}
		$productTile.find('.compare-check')[0].checked = true;
	});
	// set container state
	refreshContainer();
}

/**
 * @private
 * @function
 * @description Initializes the events on the compare container
 */
function initializeEvents() {
	// add event to buttons to remove products
	$('.compare-item').on('click', '.compare-item-remove', function () {
		removeItem($(this).closest('.compare-item'));
	});

	// Button to go to compare page
	$('#compare-items-button').on('click', function () {
		page.redirect(util.appendParamToURL(Urls.compareShow, 'category', _currentCategory));
	});

	// Button to clear all compared items
	// rely on refreshContainer to take care of hiding the container
	$('#clear-compared-items').on('click', function () {
		$('.compare-items .active').each(function () {
			removeItem($(this));
		});
	});
}

exports.init = function () {
	initializeDom();
	initializeEvents();
};

exports.addProduct = addProduct;
exports.removeProduct = removeProduct;

},{"./page":13,"./util":47,"promise":54}],6:[function(require,module,exports){
'use strict';

var dialog = require('./dialog');

/**
 * @function cookieprivacy	Used to display/control the scrim containing the cookie privacy code
 **/
module.exports = function () {
	/**
	 * If we have not accepted cookies AND we're not on the Privacy Policy page, then show the notification
	 * NOTE: You will probably want to adjust the Privacy Page test to match your site's specific privacy / cookie page
	 */
	if (SitePreferences.COOKIE_HINT === true && document.cookie.indexOf('dw_cookies_accepted') < 0) {
		// check for privacy policy page
		if ($('.privacy-policy').length === 0) {
			dialog.open({
				url: Urls.cookieHint,
				options: {
					closeOnEscape: false,
					dialogClass: 'no-close',
					buttons: [{
						text: Resources.I_AGREE,
						click: function () {
							$(this).dialog('close');
							enableCookies();
						}
					}]
				}
			});
		}
	} else {
		// Otherwise, we don't need to show the asset, just enable the cookies
		enableCookies();
	}

	function enableCookies() {
		if (document.cookie.indexOf('dw=1') < 0) {
			document.cookie = 'dw=1; path=/';
		}
		if (document.cookie.indexOf('dw_cookies_accepted') < 0) {
			document.cookie = 'dw_cookies_accepted=1; path=/';
		}
	}
};

},{"./dialog":7}],7:[function(require,module,exports){
'use strict';

var ajax = require('./ajax'),
	util = require('./util'),
	_ = require('lodash');

var dialog = {
	/**
	 * @function
	 * @description Appends a dialog to a given container (target)
	 * @param {Object} params  params.target can be an id selector or an jquery object
	 */
	create: function (params) {
		var $target, id;

		if (_.isString(params.target)) {
			if (params.target.charAt(0) === '#') {
				$target = $(params.target);
			} else {
				$target = $('#' + params.target);
			}
		} else if (params.target instanceof jQuery) {
			$target = params.target;
		} else {
			$target = $('#dialog-container');
		}

		// if no element found, create one
		if ($target.length === 0) {
			if ($target.selector && $target.selector.charAt(0) === '#') {
				id = $target.selector.substr(1);
				$target = $('<div>').attr('id', id).addClass('dialog-content').appendTo('body');
			}
		}

		// create the dialog
		this.$container = $target;
		this.$container.dialog($.extend(true, {}, this.settings, params.options || {}));
		return this.$container;
	},
	/**
	 * @function
	 * @description Opens a dialog using the given url (params.url)
	 * @param {Object} params.url should contain the url
	 */
	open: function (params) {
		if (!params.url || params.url.length === 0) { return; }
		// close any open dialog
		this.close();
		this.$container = this.create(params);
		params.url = util.appendParamToURL(params.url, 'format', 'ajax');

		// finally load the dialog
		ajax.load({
			target: this.$container,
			url: params.url,
			callback: function () {
				if (this.$container.dialog('isOpen')) { return; }
				this.$container.dialog('open');
			}.bind(this)
		});
	},
	/**
	 * @description Replace the content of current dialog
	 * @param {object} options
	 * @param {string} options.url - If the url property is provided, an ajax call is performed to get the content to replace
	 * @param {string} options.html - If no url property is provided, use html provided to replace
	 * @param {function} options.callback - Callback, could be used to set up event handlers
	 */
	replace: function (options) {
		if (!this.$container) {
			return;
		}
		var callback = (typeof options.callback === 'function') ? options.callback : function () {};
		if (options.url) {
			ajax.load({
				target: this.$container,
				url: options.url,
				callback: function () {
					callback();
					if (!this.$container.dialog('isOpen')) {
						this.$container.dialog('open');
					}
				}.bind(this)
			});
		} else if (options.html) {
			this.$container.empty().html(options.html);
			callback();
		}
	},
	/**
	 * @function
	 * @description Closes the dialog
	 */
	close: function () {
		if (!this.$container) {
			return;
		}
		this.$container.dialog('close').empty();
	},
	/**
	 * @function
	 * @description Submits the dialog form with the given action
	 * @param {String} The action which will be triggered upon form submit
	 */
	submit: function (action) {
		var $form = this.$container.find('form:first');
		// set the action
		$('<input/>').attr({
			name: action,
			type: 'hidden'
		}).appendTo($form);
		// serialize the form and get the post url
		var data = $form.serialize();
		var url = $form.attr('action');
		// make sure the server knows this is an ajax request
		if (data.indexOf('ajax') === -1) {
			data += '&format=ajax';
		}
		// post the data and replace current content with response content
		$.ajax({
			type: 'POST',
			url: url,
			data: data,
			dataType: 'html',
			success: function (html) {
				this.$container.html(html);
			}.bind(this),
			failure: function () {
				window.alert(Resources.SERVER_ERROR);
			}
		});
	},
	exists: function () {
		return this.$container && (this.$container.length > 0);
	},
	isActive: function () {
		return this.exists() && (this.$container.children.length > 0);
	},
	settings: {
		autoOpen: false,
		bgiframe: true,
		buttons: {},
		height: 'auto',
		modal: true,
		overlay: {
			opacity: 0.5,
			background: 'black'
		},
		position: 'center',
		resizable: false,
		title: '',
		width: '800',
		close: function () {
			$(this).dialog('destroy');
		}
	}
};

module.exports = dialog;

},{"./ajax":2,"./util":47,"lodash":53}],8:[function(require,module,exports){
'use strict';

var ajax = require('./ajax'),
	util = require('./util');
/**
 * @function
 * @description Load details to a given gift certificate
 * @param {String} id The ID of the gift certificate
 * @param {Function} callback A function to called
 */
exports.checkBalance = function (id, callback) {
	// load gift certificate details
	var url = util.appendParamToURL(Urls.giftCardCheckBalance, 'giftCertificateID', id);

	ajax.getJson({
		url: url,
		callback: callback
	});
};

},{"./ajax":2,"./util":47}],9:[function(require,module,exports){
'use strict';

var ajax = require('./ajax'),
	minicart = require('./minicart'),
	util = require('./util');

var setAddToCartHandler = function (e) {
	e.preventDefault();
	var form = $(this).closest('form');

	var options = {
		url: util.ajaxUrl(form.attr('action')),
		method: 'POST',
		cache: false,
		contentType: 'application/json',
		data: form.serialize()
	};
	$.ajax(options).done(function (response) {
		if (response.success) {
			ajax.load({
				url: Urls.minicartGC,
				data: {lineItemId: response.result.lineItemId},
				callback: function (response) {
					minicart.show(response);
					form.find('input,textarea').val('');
				}
			});
		} else {
			form.find('span.error').hide();
			for (var id in response.errors.FormErrors) {
				var $errorEl = $('#' + id).addClass('error').removeClass('valid').next('.error');
				if (!$errorEl || $errorEl.length === 0) {
					$errorEl = $('<span for="' + id + '" generated="true" class="error" style=""></span>');
					$('#' + id).after($errorEl);
				}
				$errorEl.text(response.errors.FormErrors[id].replace(/\\'/g, '\'')).show();
			}
		}
	}).fail(function (xhr, textStatus) {
		// failed
		if (textStatus === 'parsererror') {
			window.alert(Resources.BAD_RESPONSE);
		} else {
			window.alert(Resources.SERVER_CONNECTION_ERROR);
		}
	});
};

exports.init = function () {
	$('#AddToBasketButton').on('click', setAddToCartHandler);
};

},{"./ajax":2,"./minicart":11,"./util":47}],10:[function(require,module,exports){
'use strict';
// jQuery extensions

module.exports = function () {
	// params
	// toggleClass - required
	// triggerSelector - optional. the selector for the element that triggers the event handler. defaults to the child elements of the list.
	// eventName - optional. defaults to 'click'
	$.fn.toggledList = function (options) {
		if (!options.toggleClass) { return this; }
		var list = this;
		return list.on(options.eventName || 'click', options.triggerSelector || list.children(), function (e) {
			e.preventDefault();
			var classTarget = options.triggerSelector ? $(this).parent() : $(this);
			classTarget.toggleClass(options.toggleClass);
			// execute callback if exists
			if (options.callback) {options.callback();}
		});
	};

	$.fn.syncHeight = function () {
		var arr = $.makeArray(this);
		arr.sort(function (a, b) {
			return $(a).height() - $(b).height();
		});
		return this.height($(arr[arr.length - 1]).height());
	};
};

},{}],11:[function(require,module,exports){
'use strict';

var util = require('./util'),
	bonusProductsView = require('./bonus-products-view');

var timer = {
	id: null,
	clear: function () {
		if (this.id) {
			window.clearTimeout(this.id);
			delete this.id;
		}
	},
	start: function (duration, callback) {
		this.id = setTimeout(callback, duration);
	}
};

var minicart = {
	init: function () {
		this.$el = $('#mini-cart');
		this.$content = this.$el.find('.mini-cart-content');

		var $productList = this.$el.find('.mini-cart-products');
		$productList.children().not(':first').addClass('collapsed');
		$productList.find('.mini-cart-product').append('<div class="mini-cart-toggler">&nbsp;</div>');

		$productList.toggledList({
			toggleClass: 'collapsed',
			triggerSelector: '.mini-cart-toggler',
			eventName: 'click'});

		// events
		this.$el.find('.mini-cart-total').on('mouseenter', function () {
			if (this.$content.not(':visible')) {
				this.slide();
			}
		}.bind(this));

		this.$content.on('mouseenter', function () {
			timer.clear();
		}).on('mouseleave', function () {
			timer.clear();
			timer.start(30, this.close.bind(this));
		}.bind(this));

		this.$el.find('.mini-cart-close').on('click', this.close);
	},
	/**
	 * @function
	 * @description Shows the given content in the mini cart
	 * @param {String} A HTML string with the content which will be shown
	 */
	show: function (html) {
		this.$el.html(html);
		util.scrollBrowser(0);
		this.init();
		this.slide();
		bonusProductsView.loadBonusOption();
	},
	/**
	 * @function
	 * @description Slides down and show the contents of the mini cart
	 */
	slide: function () {
		timer.clear();
		// show the item
		this.$content.slideDown('slow');
		// after a time out automatically close it
		timer.start(6000, this.close.bind(this));
	},
	/**
	 * @function
	 * @description Closes the mini cart with given delay
	 * @param {Number} delay The delay in milliseconds
	 */
	close: function (delay) {
		timer.clear();
		this.$content.slideUp(delay);
	},
};

module.exports = minicart;

},{"./bonus-products-view":3,"./util":47}],12:[function(require,module,exports){
'use strict';

var ajax = require('./ajax'),
	page = require('./page'),
	util = require('./util');

exports.init = function () {
	//listen to the drop down, and make a ajax call to mulitcurrency pipeline
	$('.currency-converter').on('change', function () {
		// request results from server
		ajax.getJson({
			url: util.appendParamsToUrl(Urls.currencyConverter, {
				format: 'ajax',
				currencyMnemonic: $('.currency-converter').val()
			}),
			callback: function () {
				location.reload();
			}
		});
	});

	//hide the feature if user is in checkout
	if (page.title === 'Checkout') {
		$('.mc-class').css('display', 'none');
	}
};

},{"./ajax":2,"./page":13,"./util":47}],13:[function(require,module,exports){
'use strict';

var util = require('./util');

var page = {
	title: '',
	type: '',
	params: util.getQueryStringParams(window.location.search.substr(1)),
	redirect: function (newURL) {
		setTimeout(function () {
			window.location.href = newURL;
		}, 0);
	},
	refresh: function () {
		setTimeout(function () {
			window.location.assign(window.location.href);
		}, 500);
	}
};

module.exports = page;

},{"./util":47}],14:[function(require,module,exports){
'use strict';

var giftcert = require('../giftcert'),
	tooltip = require('../tooltip'),
	util = require('../util'),
	dialog = require('../dialog'),
	page = require('../page'),
	validator = require('../validator');

/**
 * @function
 * @description Initializes the events on the address form (apply, cancel, delete)
 * @param {Element} form The form which will be initialized
 */
function initializeAddressForm() {
	var $form = $('#edit-address-form');

	$form.find('input[name="format"]').remove();
	tooltip.init();
	//$("<input/>").attr({type:"hidden", name:"format", value:"ajax"}).appendTo(form);

	$form.on('click', '.apply-button', function (e) {
		e.preventDefault();
		var addressId = $form.find('input[name$="_addressid"]');
		addressId.val(addressId.val().replace(/[^\w+-]/g, '-'));
		if (!$form.valid()) {
			return false;
		}
		var url = util.appendParamsToUrl($form.attr('action'), {format: 'ajax'});
		var applyName = $form.find('.apply-button').attr('name');
		var options = {
			url: url,
			data: $form.serialize() + '&' + applyName + '=x',
			type: 'POST'
		};
		$.ajax(options).done(function (data) {
			if (typeof(data) !== 'string') {
				if (data.success) {
					dialog.close();
					page.refresh();
				} else {
					window.alert(data.message);
					return false;
				}
			} else {
				$('#dialog-container').html(data);
				account.init();
				tooltip.init();
			}
		});
	})
	.on('click', '.cancel-button, .close-button', function (e) {
		e.preventDefault();
		dialog.close();
	})
	.on('click', '.delete-button', function (e) {
		e.preventDefault();
		if (window.confirm(String.format(Resources.CONFIRM_DELETE, Resources.TITLE_ADDRESS))) {
			var url = util.appendParamsToUrl(Urls.deleteAddress, {
				AddressID: $form.find('#addressid').val(),
				format: 'ajax'
			});
			$.ajax({
				url: url,
				method: 'POST',
				dataType: 'json'
			}).done(function (data) {
				if (data.status.toLowerCase() === 'ok') {
					dialog.close();
					page.refresh();
				} else if (data.message.length > 0) {
					window.alert(data.message);
					return false;
				} else {
					dialog.close();
					page.refresh();
				}
			});
		}
	});

	$('select[id$="_country"]', $form).on('change', function () {
		util.updateStateOptions($form);
	});

	validator.init();
}
/**
 * @private
 * @function
 * @description Toggles the list of Orders
 */
function toggleFullOrder () {
	$('.order-items')
		.find('li.hidden:first')
		.prev('li')
		.append('<a class="toggle">View All</a>')
		.children('.toggle')
		.click(function () {
			$(this).parent().siblings('li.hidden').show();
			$(this).remove();
		});
}
/**
 * @private
 * @function
 * @description Binds the events on the address form (edit, create, delete)
 */
function initAddressEvents() {
	var addresses = $('#addresses');
	if (addresses.length === 0) { return; }

	addresses.on('click', '.address-edit, .address-create', function (e) {
		e.preventDefault();
		dialog.open({
			url: this.href,
			options: {
				open: initializeAddressForm
			}
		});
	}).on('click', '.delete', function (e) {
		e.preventDefault();
		if (window.confirm(String.format(Resources.CONFIRM_DELETE, Resources.TITLE_ADDRESS))) {
			$.ajax({
				url: util.appendParamsToUrl($(this).attr('href'), {format: 'ajax'}),
				dataType: 'json'
			}).done(function (data) {
				if (data.status.toLowerCase() === 'ok') {
					page.redirect(Urls.addressesList);
				} else if (data.message.length > 0) {
					window.alert(data.message);
				} else {
					page.refresh();
				}
			});
		}
	});
}
/**
 * @private
 * @function
 * @description Binds the events of the payment methods list (delete card)
 */
function initPaymentEvents() {
	$('.add-card').on('click', function (e) {
		e.preventDefault();
		dialog.open({
			url: $(e.target).attr('href')
		});
	});

	var paymentList = $('.payment-list');
	if (paymentList.length === 0) { return; }

	util.setDeleteConfirmation(paymentList, String.format(Resources.CONFIRM_DELETE, Resources.TITLE_CREDITCARD));

	$('form[name="payment-remove"]').on('submit', function (e) {
		e.preventDefault();
		// override form submission in order to prevent refresh issues
		var button = $(this).find('.delete');
		$('<input/>').attr({
			type: 'hidden',
			name: button.attr('name'),
			value: button.attr('value') || 'delete card'
		}).appendTo($(this));
		var data = $(this).serialize();
		$.ajax({
			type: 'POST',
			url: $(this).attr('action'),
			data: data
		})
		.done(function () {
			page.redirect(Urls.paymentsList);
		});
	});
}
/**
 * @private
 * @function
 * @description init events for the loginPage
 */
function initLoginPage() {
	//o-auth binding for which icon is clicked
	$('.oAuthIcon').bind('click', function () {
		$('#OAuthProvider').val(this.id);
	});

	//toggle the value of the rememberme checkbox
	$('#dwfrm_login_rememberme').bind('change', function () {
		if ($('#dwfrm_login_rememberme').attr('checked')) {
			$('#rememberme').val('true');
		} else {
			$('#rememberme').val('false');
		}
	});
	$('#password-reset').on('click', function (e) {
		e.preventDefault();
		dialog.open({
			url: $(e.target).attr('href'),
			options: {
				open: function () {
					validator.init();
					var $requestPasswordForm = $('[name$="_requestpassword"]'),
						$submit = $requestPasswordForm.find('[name$="_requestpassword_send"]');
					$($submit).on('click', function (e) {
						if (!$requestPasswordForm.valid()) {
							return;
						}
						e.preventDefault();
						dialog.submit($submit.attr('name'));
					});
				}
			}
		});
	});
}
/**
 * @private
 * @function
 * @description Binds the events of the order, address and payment pages
 */
function initializeEvents() {
	toggleFullOrder();
	initAddressEvents();
	initPaymentEvents();
	initLoginPage();
}

var account = {
	init: function () {
		initializeEvents();
		giftcert.init();
	},
	initCartLogin: function () {
		initLoginPage();
	}
};

module.exports = account;

},{"../dialog":7,"../giftcert":9,"../page":13,"../tooltip":46,"../util":47,"../validator":48}],15:[function(require,module,exports){
'use strict';

var account = require('./account'),
	bonusProductsView = require('../bonus-products-view'),
	product = require('./product'),
	quickview = require('../quickview'),
	storeinventory = require('../storeinventory');

/**
 * @private
 * @function
 * @description Binds events to the cart page (edit item's details, bonus item's actions, coupon code entry)
 */
function initializeEvents() {
	$('#cart-table').on('click', '.item-edit-details a', function (e) {
		e.preventDefault();
		quickview.show({
			url: e.target.href,
			source: 'cart'
		});
	})
	.on('click', '.bonus-item-actions a', function (e) {
		e.preventDefault();
		bonusProductsView.show(this.href);
	});

	// override enter key for coupon code entry
	$('form input[name$="_couponCode"]').on('keydown', function (e) {
		if (e.which === 13 && $(this).val().length === 0) { return false; }
	});
}

exports.init = function () {
	initializeEvents();
	if (SitePreferences.STORE_PICKUP) {
		storeinventory.init();
	}
	account.initCartLogin();
};

},{"../bonus-products-view":3,"../quickview":40,"../storeinventory":45,"./account":14,"./product":27}],16:[function(require,module,exports){
'use strict';

var util = require('../../util');
var shipping = require('./shipping');

/**
 * @function
 * @description Selects the first address from the list of addresses
 */
exports.init = function () {
	var $form = $('.address');
	// select address from list
	$('select[name$="_addressList"]', $form).on('change', function () {
		var selected = $(this).children(':selected').first();
		var selectedAddress = $(selected).data('address');
		if (!selectedAddress) { return; }
		util.fillAddressFields(selectedAddress, $form);
		shipping.updateShippingMethodList();
		// re-validate the form
		$form.validate().form();
	});

	// update state options in case the country changes
	$('select[id$="_country"]', $form).on('change', function () {
		util.updateStateOptions($form);
	});
};

},{"../../util":47,"./shipping":21}],17:[function(require,module,exports){
'use strict';

var ajax = require('../../ajax'),
	formPrepare = require('./formPrepare'),
	giftcard = require('../../giftcard'),
	util = require('../../util');

/**
 * @function
 * @description Fills the Credit Card form with the passed data-parameter and clears the former cvn input
 * @param {Object} data The Credit Card data (holder, type, masked number, expiration month/year)
 */
function setCCFields(data) {
	var $creditCard = $('[data-method="CREDIT_CARD"]');
	$creditCard.find('input[name$="creditCard_owner"]').val(data.holder).trigger('change');
	$creditCard.find('select[name$="_type"]').val(data.type).trigger('change');
	$creditCard.find('input[name$="_number"]').val(data.maskedNumber).trigger('change');
	$creditCard.find('[name$="_month"]').val(data.expirationMonth).trigger('change');
	$creditCard.find('[name$="_year"]').val(data.expirationYear).trigger('change');
	$creditCard.find('input[name$="_cvn"]').val('').trigger('change');
}

/**
 * @function
 * @description Updates the credit card form with the attributes of a given card
 * @param {String} cardID the credit card ID of a given card
 */
function populateCreditCardForm(cardID) {
	// load card details
	var url = util.appendParamToURL(Urls.billingSelectCC, 'creditCardUUID', cardID);
	ajax.getJson({
		url: url,
		callback: function (data) {
			if (!data) {
				window.alert(Resources.CC_LOAD_ERROR);
				return false;
			}
			setCCFields(data);
		}
	});
}

/**
 * @function
 * @description Changes the payment method form depending on the passed paymentMethodID
 * @param {String} paymentMethodID the ID of the payment method, to which the payment method form should be changed to
 */
function updatePaymentMethod(paymentMethodID) {
	var $paymentMethods = $('.payment-method');
	$paymentMethods.removeClass('payment-method-expanded');

	var $selectedPaymentMethod = $paymentMethods.filter('[data-method="' + paymentMethodID + '"]');
	if ($selectedPaymentMethod.length === 0) {
		$selectedPaymentMethod = $('[data-method="Custom"]');
	}
	$selectedPaymentMethod.addClass('payment-method-expanded');

	// ensure checkbox of payment method is checked
	$('input[name$="_selectedPaymentMethodID"]').removeAttr('checked');
	$('input[value=' + paymentMethodID + ']').attr('checked', 'checked');

	formPrepare.validateForm();
}

/**
 * @function
 * @description loads billing address, Gift Certificates, Coupon and Payment methods
 */
exports.init = function () {
	var $checkoutForm = $('.checkout-billing');
	var $addGiftCert = $('#add-giftcert');
	var $giftCertCode = $('input[name$="_giftCertCode"]');
	var $addCoupon = $('#add-coupon');
	var $couponCode = $('input[name$="_couponCode"]');
	var $selectPaymentMethod = $('.payment-method-options');
	var selectedPaymentMethod = $selectPaymentMethod.find(':checked').val();

	formPrepare.init({
		formSelector: 'form[id$="billing"]',
		continueSelector: '[name$="billing_save"]'
	});

	// default payment method to 'CREDIT_CARD'
	updatePaymentMethod((selectedPaymentMethod) ? selectedPaymentMethod : 'CREDIT_CARD');
	$selectPaymentMethod.on('click', 'input[type="radio"]', function () {
		updatePaymentMethod($(this).val());
	});

	// select credit card from list
	$('#creditCardList').on('change', function () {
		var cardUUID = $(this).val();
		if (!cardUUID) {return;}
		populateCreditCardForm(cardUUID);

		// remove server side error
		$('.required.error').removeClass('error');
		$('.error-message').remove();
	});

	$('#check-giftcert').on('click', function (e) {
		e.preventDefault();
		var $balance = $('.balance');
		if ($giftCertCode.length === 0 || $giftCertCode.val().length === 0) {
			var error = $balance.find('span.error');
			if (error.length === 0) {
				error = $('<span>').addClass('error').appendTo($balance);
			}
			error.html(Resources.GIFT_CERT_MISSING);
			return;
		}

		giftcard.checkBalance($giftCertCode.val(), function (data) {
			if (!data || !data.giftCertificate) {
				$balance.html(Resources.GIFT_CERT_INVALID).removeClass('success').addClass('error');
				return;
			}
			$balance.html(Resources.GIFT_CERT_BALANCE + ' ' + data.giftCertificate.balance).removeClass('error').addClass('success');
		});
	});

	$addGiftCert.on('click', function (e) {
		e.preventDefault();
		var code = $giftCertCode.val(),
			$error = $checkoutForm.find('.giftcert-error');
		if (code.length === 0) {
			$error.html(Resources.GIFT_CERT_MISSING);
			return;
		}

		var url = util.appendParamsToUrl(Urls.redeemGiftCert, {giftCertCode: code, format: 'ajax'});
		$.getJSON(url, function (data) {
			var fail = false;
			var msg = '';
			if (!data) {
				msg = Resources.BAD_RESPONSE;
				fail = true;
			} else if (!data.success) {
				msg = data.message.split('<').join('&lt;').split('>').join('&gt;');
				fail = true;
			}
			if (fail) {
				$error.html(msg);
				return;
			} else {
				window.location.assign(Urls.billing);
			}
		});
	});

	$addCoupon.on('click', function (e) {
		e.preventDefault();
		var $error = $checkoutForm.find('.coupon-error'),
			code = $couponCode.val();
		if (code.length === 0) {
			$error.html(Resources.COUPON_CODE_MISSING);
			return;
		}

		var url = util.appendParamsToUrl(Urls.addCoupon, {couponCode: code, format: 'ajax'});
		$.getJSON(url, function (data) {
			var fail = false;
			var msg = '';
			if (!data) {
				msg = Resources.BAD_RESPONSE;
				fail = true;
			} else if (!data.success) {
				msg = data.message.split('<').join('&lt;').split('>').join('&gt;');
				fail = true;
			}
			if (fail) {
				$error.html(msg);
				return;
			}

			//basket check for displaying the payment section, if the adjusted total of the basket is 0 after applying the coupon
			//this will force a page refresh to display the coupon message based on a parameter message
			if (data.success && data.baskettotal === 0) {
				window.location.assign(Urls.billing);
			}
		});
	});

	// trigger events on enter
	$couponCode.on('keydown', function (e) {
		if (e.which === 13) {
			e.preventDefault();
			$addCoupon.click();
		}
	});
	$giftCertCode.on('keydown', function (e) {
		if (e.which === 13) {
			e.preventDefault();
			$addGiftCert.click();
		}
	});
};

},{"../../ajax":2,"../../giftcard":8,"../../util":47,"./formPrepare":18}],18:[function(require,module,exports){
'use strict';

var _ = require('lodash');

var $form, $continue, $requiredInputs, validator;

var hasEmptyRequired = function () {
	// filter out only the visible fields
	var requiredValues = $requiredInputs.filter(':visible').map(function () {
		return $(this).val();
	});
	return _(requiredValues).contains('');
};

var validateForm = function () {
	// only validate form when all required fields are filled to avoid
	// throwing errors on empty form
	if (!hasEmptyRequired()) {
		if (validator.form()) {
			$continue.removeAttr('disabled');
		}
	} else {
		$continue.attr('disabled', 'disabled');
	}
};

var validateEl = function () {
	if ($(this).val() === '') {
		$continue.attr('disabled', 'disabled');
	} else {
		// enable continue button on last required field that is valid
		// only validate single field
		if (validator.element(this) && !hasEmptyRequired()) {
			$continue.removeAttr('disabled');
		} else {
			$continue.attr('disabled', 'disabled');
		}
	}
};

var init = function (opts) {
	if (!opts.formSelector || !opts.continueSelector) {
		throw new Error('Missing form and continue action selectors.');
	}
	$form = $(opts.formSelector);
	$continue = $(opts.continueSelector);
	validator = $form.validate();
	$requiredInputs = $('.required', $form).find(':input');
	validateForm();
	// start listening
	$requiredInputs.on('change', validateEl);
	$requiredInputs.filter('input').on('keyup', _.debounce(validateEl, 200));
};

exports.init = init;
exports.validateForm = validateForm;
exports.validateEl = validateEl;

},{"lodash":53}],19:[function(require,module,exports){
'use strict';

var address = require('./address'),
	billing = require('./billing'),
	multiship = require('./multiship'),
	shipping = require('./shipping');

/**
 * @function Initializes the page events depending on the checkout stage (shipping/billing)
 */
exports.init = function () {
	address.init();
	if ($('.checkout-shipping').length > 0) {
		shipping.init();
	} else if ($('.checkout-multi-shipping').length > 0) {
		multiship.init();
	} else {
		billing.init();
	}

	//if on the order review page and there are products that are not available diable the submit order button
	if ($('.order-summary-footer').length > 0) {
		if ($('.notavailable').length > 0) {
			$('.order-summary-footer .submit-order .button-fancy-large').attr('disabled', 'disabled');
		}
	}
};

},{"./address":16,"./billing":17,"./multiship":20,"./shipping":21}],20:[function(require,module,exports){
'use strict';

var address = require('./address'),
	formPrepare = require('./formPrepare'),
	dialog = require('../../dialog'),
	util = require('../../util');

/**
 * @function
 * @description Initializes gift message box for multiship shipping, the message box starts off as hidden and this will display it if the radio button is checked to yes, also added event handler to listen for when a radio button is pressed to display the message box
 */
function initMultiGiftMessageBox() {
	$.each($('.item-list'), function () {
		var $this = $(this),
			$isGiftYes = $this.find('.js-isgiftyes'),
			$isGiftNo = $this.find('.js-isgiftno'),
			$giftMessage = $this.find('.gift-message-text');

		//handle initial load
		if ($isGiftYes.is(':checked')) {
			$giftMessage.css('display', 'block');
		}

		//set event listeners
		$this.on('change', function () {
			if ($isGiftYes.is(':checked')) {
				$giftMessage.css('display', 'block');
			} else if ($isGiftNo.is(':checked')) {
				$giftMessage.css('display', 'none');
			}
		});
	});
}


/**
 * @function
 * @description capture add edit adddress form events
 */
function addEditAddress(target) {
	var $addressForm = $('form[name$="multishipping_editAddress"]'),
		$addressDropdown = $addressForm.find('select[name$=_addressList]'),
		$addressList = $addressForm.find('.address-list'),
		add = true,
		selectedAddressUUID = $(target).parent().siblings('.select-address').val();

	$addressDropdown.on('change', function (e) {
		e.preventDefault();
		var selectedAddress = $addressList.find('select').val();
		if (selectedAddress !== 'newAddress') {
			selectedAddress = $.grep($addressList.data('addresses'), function (add) {
				return add.UUID === selectedAddress;
			})[0];
			add = false;
			// proceed to fill the form with the selected address
			util.fillAddressFields(selectedAddress, $addressForm);
		} else {
			//reset the form if the value of the option is not a UUID
			$addressForm.find('.input-text, .input-select').val('');
		}
	});

	$addressForm.on('click', '.cancel', function (e) {
		e.preventDefault();
		dialog.close();
	});

	$addressForm.on('submit', function (e) {
		e.preventDefault();
		$.getJSON(Urls.addEditAddress, $addressForm.serialize(), function (response) {
			if (!response.success) {
				// @TODO: figure out a way to handle error on the form
				return;
			}
			var address = response.address,
				$shippingAddress = $(target).closest('.shippingaddress'),
				$select = $shippingAddress.find('.select-address'),
				$selected = $select.find('option:selected'),
				newOption = '<option value="' + address.UUID + '">' +
					((address.ID) ? '(' + address.ID + ')' : address.firstName + ' ' + address.lastName) + ', ' +
					address.address1 + ', ' + address.city + ', ' + address.stateCode + ', ' + address.postalCode +
					'</option>';
			dialog.close();
			if (add) {
				$('.shippingaddress select').removeClass('no-option').append(newOption);
				$('.no-address').hide();
			} else {
				$('.shippingaddress select').find('option[value="' + address.UUID + '"]').html(newOption);
			}
			// if there's no previously selected option, select it
			if ($selected.length === 0 || $selected.val() === '') {
				$select.find('option[value="' + address.UUID + '"]').prop('selected', 'selected').trigger('change');
			}
		});
	});

	//preserve the uuid of the option for the hop up form
	if (selectedAddressUUID) {
		//update the form with selected address
		$addressList.find('option').each(function () {
			//check the values of the options
			if ($(this).attr('value') === selectedAddressUUID) {
				$(this).attr('selected', 'selected');
				$addressDropdown.trigger('change');
			}
		});
	}
}

/**
 * @function
 * @description shows gift message box in multiship, and if the page is the multi shipping address page it will call initmultishipshipaddress() to initialize the form
 */
exports.init = function () {
	initMultiGiftMessageBox();
	if ($('.cart-row .shippingaddress .select-address').length > 0) {
		formPrepare.init({
			continueSelector: '[name$="addressSelection_save"]',
			formSelector: '[id$="multishipping_addressSelection"]'
		});
	}
	$('.edit-address').on('click', 'a', function (e) {
		dialog.open({url: this.href, options: {open: function () {
			address.init();
			addEditAddress(e.target);
		}}});
	});
};

},{"../../dialog":7,"../../util":47,"./address":16,"./formPrepare":18}],21:[function(require,module,exports){
'use strict';

var ajax = require('../../ajax'),
	formPrepare = require('./formPrepare'),
	progress = require('../../progress'),
	tooltip = require('../../tooltip'),
	util = require('../../util');

var shippingMethods;
/**
 * @function
 * @description Initializes gift message box, if shipment is gift
 */
function giftMessageBox() {
	// show gift message box, if shipment is gift
	$('.gift-message-text').toggle($('#is-gift-yes')[0].checked);
}

/**
 * @function
 * @description updates the order summary based on a possibly recalculated basket after a shipping promotion has been applied
 */
function updateSummary() {
	var $summary = $('#secondary.summary');
	// indicate progress
	progress.show($summary);

	// load the updated summary area
	$summary.load(Urls.summaryRefreshURL, function () {
		// hide edit shipping method link
		$summary.fadeIn('fast');
		$summary.find('.checkout-mini-cart .minishipment .header a').hide();
		$summary.find('.order-totals-table .order-shipping .label a').hide();
	});
}

/**
 * @function
 * @description Helper method which constructs a URL for an AJAX request using the
 * entered address information as URL request parameters.
 */
function getShippingMethodURL(url, extraParams) {
	var $form = $('.address');
	var params = {
		address1: $form.find('input[name$="_address1"]').val(),
		address2: $form.find('input[name$="_address2"]').val(),
		countryCode: $form.find('select[id$="_country"]').val(),
		stateCode: $form.find('select[id$="_state"]').val(),
		postalCode: $form.find('input[name$="_postal"]').val(),
		city: $form.find('input[name$="_city"]').val()
	};
	return util.appendParamsToUrl(url, $.extend(params, extraParams));
}

/**
 * @function
 * @description selects a shipping method for the default shipment and updates the summary section on the right hand side
 * @param
 */
function selectShippingMethod(shippingMethodID) {
	// nothing entered
	if (!shippingMethodID) {
		return;
	}
	// attempt to set shipping method
	var url = getShippingMethodURL(Urls.selectShippingMethodsList, {shippingMethodID: shippingMethodID});
	ajax.getJson({
		url: url,
		callback: function (data) {
			updateSummary();
			if (!data || !data.shippingMethodID) {
				window.alert('Couldn\'t select shipping method.');
				return false;
			}
			// display promotion in UI and update the summary section,
			// if some promotions were applied
			$('.shippingpromotions').empty();


			// if (data.shippingPriceAdjustments && data.shippingPriceAdjustments.length > 0) {
			// 	var len = data.shippingPriceAdjustments.length;
			// 	for (var i=0; i < len; i++) {
			// 		var spa = data.shippingPriceAdjustments[i];
			// 	}
			// }
		}
	});
}

/**
 * @function
 * @description Make an AJAX request to the server to retrieve the list of applicable shipping methods
 * based on the merchandise in the cart and the currently entered shipping address
 * (the address may be only partially entered).  If the list of applicable shipping methods
 * has changed because new address information has been entered, then issue another AJAX
 * request which updates the currently selected shipping method (if needed) and also updates
 * the UI.
 */
function updateShippingMethodList() {
	var $shippingMethodList = $('#shipping-method-list');
	if (!$shippingMethodList || $shippingMethodList.length === 0) { return; }
	var url = getShippingMethodURL(Urls.shippingMethodsJSON);

	ajax.getJson({
		url: url,
		callback: function (data) {
			if (!data) {
				window.alert('Couldn\'t get list of applicable shipping methods.');
				return false;
			}
			if (shippingMethods && shippingMethods.toString() === data.toString()) {
				// No need to update the UI.  The list has not changed.
				return true;
			}

			// We need to update the UI.  The list has changed.
			// Cache the array of returned shipping methods.
			shippingMethods = data;
			// indicate progress
			progress.show($shippingMethodList);

			// load the shipping method form
			var smlUrl = getShippingMethodURL(Urls.shippingMethodsList);
			$shippingMethodList.load(smlUrl, function () {
				$shippingMethodList.fadeIn('fast');
				// rebind the radio buttons onclick function to a handler.
				$shippingMethodList.find('[name$="_shippingMethodID"]').click(function () {
					selectShippingMethod($(this).val());
				});

				// update the summary
				updateSummary();
				progress.hide();
				tooltip.init();
				//if nothing is selected in the shipping methods select the first one
				if ($shippingMethodList.find('.input-radio:checked').length === 0) {
					$shippingMethodList.find('.input-radio:first').attr('checked', true);
				}
			});
		}
	});
}

exports.init = function () {
	formPrepare.init({
		continueSelector: '[name$="shippingAddress_save"]',
		formSelector:'[id$="singleshipping_shippingAddress"]'
	});
	$('#is-gift-yes, #is-gift-no').on('click', function () {
		giftMessageBox();
	});

	$('.address').on('change',
		'input[name$="_addressFields_address1"], input[name$="_addressFields_address2"], select[name$="_addressFields_states_state"], input[name$="_addressFields_city"], input[name$="_addressFields_zip"]',
		updateShippingMethodList
	);

	giftMessageBox();
	updateShippingMethodList();
};

exports.updateShippingMethodList = updateShippingMethodList;

},{"../../ajax":2,"../../progress":39,"../../tooltip":46,"../../util":47,"./formPrepare":18}],22:[function(require,module,exports){
'use strict';

var addProductToCart = require('./product/addToCart'),
	ajax = require('../ajax'),
	page = require('../page'),
	productTile = require('../product-tile'),
	quickview = require('../quickview');

/**
 * @private
 * @function
 * @description Binds the click events to the remove-link and quick-view button
 */
function initializeEvents() {
	$('#compare-table').on('click', '.remove-link', function (e) {
		e.preventDefault();
		ajax.getJson({
			url: this.href,
			callback: function () {
				page.refresh();
			}
		});
	})
	.on('click', '.open-quick-view', function (e) {
		e.preventDefault();
		var url = $(this).closest('.product').find('.thumb-link').attr('href');
		quickview.show({
			url: url,
			source: 'quickview'
		});
	});

	$('#compare-category-list').on('change', function () {
		$(this).closest('form').submit();
	});
}

exports.init = function () {
	productTile.init();
	initializeEvents();
	addProductToCart();
};

},{"../ajax":2,"../page":13,"../product-tile":38,"../quickview":40,"./product/addToCart":24}],23:[function(require,module,exports){
/* global addthis */

'use strict';

/**
 * @function
 * @description Initializes the 'AddThis'-functionality for the social sharing plugin
 */
module.exports = function () {
	var addThisServices = ['compact', 'facebook', 'myspace', 'google', 'twitter'],
		$addThisToolbox = $('.addthis_toolbox'),
		addThisLinks = '',
		i,
		len = addThisServices.length;

	for (i = 0; i < len; i++) {
		if ($addThisToolbox.find('.addthis_button_' + addThisServices[i]).length === 0) {
			addThisLinks += '<a class="addthis_button_' + addThisServices[i] + '"></a>';
		}
	}
	if (addThisLinks.length === 0) { return; }

	$addThisToolbox.html(addThisLinks);
	try {
		addthis.toolbox('.addthis_toolbox');
	} catch (e) {
		return;
	}
};

},{}],24:[function(require,module,exports){
'use strict';

var dialog = require('../../dialog'),
	minicart = require('../../minicart'),
	page = require('../../page'),
	util = require('../../util'),
	TPromise = require('promise'),
	_ = require('lodash');

/**
 * @description Make the AJAX request to add an item to cart
 * @param {Element} form The form element that contains the item quantity and ID data
 * @returns {Promise}
 */
var addItemToCart = function (form) {
	var $form = $(form),
		$qty = $form.find('input[name="Quantity"]');
	if ($qty.length === 0 || isNaN($qty.val()) || parseInt($qty.val(), 10) === 0) {
		$qty.val('1');
	}
	return TPromise.resolve($.ajax({
		type: 'POST',
		url: util.ajaxUrl(Urls.addProduct),
		data: $form.serialize()
	}));
};

/**
 * @description Handler to handle the add to cart event
 */
var addToCart = function (e) {
	e.preventDefault();
	var $form = $(this).closest('form');

	addItemToCart($form).then(function (response) {
		var $uuid = $form.find('input[name="uuid"]');
		if ($uuid.length > 0 && $uuid.val().length > 0) {
			page.refresh();
		} else {
			// do not close quickview if adding individual item that is part of product set
			// @TODO should notify the user some other way that the add action has completed successfully
			if (!$(this).hasClass('sub-product-item')) {
				dialog.close();
			}
			minicart.show(response);
		}
	}.bind(this));
};

/**
 * @description Handler to handle the add all items to cart event
 */
var addAllToCart = function (e) {
	e.preventDefault();
	var $productForms = $('#product-set-list').find('form').toArray();
	Promise.all(_.map($productForms, addItemToCart))
		.then(function (responses) {
			dialog.close();
			// show the final response only, which would include all the other items
			minicart.show(responses[responses.length - 1]);
		});
};

/**
 * @function
 * @description Binds the click event to a given target for the add-to-cart handling
 * @param {Element} target The target on which an add to cart event-handler will be set
 */
module.exports = function (target) {
	$('.add-to-cart[disabled]').attr('title', $('.availability-msg').text());

	if (target) {
		target.on('click', '.add-to-cart', addToCart);
	} else {
		$('.add-to-cart').on('click', addToCart);
	}

	$('#add-all-to-cart').on('click', addAllToCart);
};

},{"../../dialog":7,"../../minicart":11,"../../page":13,"../../util":47,"lodash":53,"promise":54}],25:[function(require,module,exports){
'use strict';

var ajax =  require('../../ajax'),
	util = require('../../util');

var updateContainer = function (data) {
	var $availabilityMsgContainer = $('#pdpMain .availability .availability-msg'),
		$availabilityMsg;
	if (!data) {
		$availabilityMsgContainer.html(Resources.ITEM_STATUS_NOTAVAILABLE);
		return;
	}

	$availabilityMsgContainer.empty();

	// Look through levels ... if msg is not empty, then create span el
	if (data.levels.IN_STOCK > 0) {
		$availabilityMsg = $availabilityMsgContainer.find('.in-stock-msg');
		if ($availabilityMsg.length === 0) {
			$availabilityMsg = $('<p/>').addClass('in-stock-msg');
		}
		if (data.levels.PREORDER === 0 && data.levels.BACKORDER === 0 && data.levels.NOT_AVAILABLE === 0) {
			// Just in stock
			$availabilityMsg.text(Resources.IN_STOCK);
		} else {
			// In stock with conditions ...
			$availabilityMsg.text(data.inStockMsg);
		}
	}
	if (data.levels.PREORDER > 0) {
		$availabilityMsg = $availabilityMsgContainer.find('.preorder-msg');
		if ($availabilityMsg.length === 0) {
			$availabilityMsg = $('<p/>').addClass('preorder-msg');
		}
		if (data.levels.IN_STOCK === 0 && data.levels.BACKORDER === 0 && data.levels.NOT_AVAILABLE === 0) {
			// Just in stock
			$availabilityMsg.text(Resources.PREORDER);
		} else {
			$availabilityMsg.text(data.preOrderMsg);
		}
	}
	if (data.levels.BACKORDER > 0) {
		$availabilityMsg = $availabilityMsgContainer.find('.backorder-msg');
		if ($availabilityMsg.length === 0) {
			$availabilityMsg = $('<p/>').addClass('backorder-msg');
		}
		if (data.levels.IN_STOCK === 0 && data.levels.PREORDER === 0 && data.levels.NOT_AVAILABLE === 0) {
			// Just in stock
			$availabilityMsg.text(Resources.BACKORDER);
		} else {
			$availabilityMsg.text(data.backOrderMsg);
		}
	}
	if (data.inStockDate !== '') {
		$availabilityMsg = $availabilityMsgContainer.find('.in-stock-date-msg');
		if ($availabilityMsg.length === 0) {
			$availabilityMsg = $('<p/>').addClass('in-stock-date-msg');
		}
		$availabilityMsg.text(String.format(Resources.IN_STOCK_DATE, data.inStockDate));
	}
	if (data.levels.NOT_AVAILABLE > 0) {
		$availabilityMsg = $availabilityMsgContainer.find('.not-available-msg');
		if ($availabilityMsg.length === 0) {
			$availabilityMsg = $('<p/>').addClass('not-available-msg');
		}
		if (data.levels.PREORDER === 0 && data.levels.BACKORDER === 0 && data.levels.IN_STOCK === 0) {
			$availabilityMsg.text(Resources.NOT_AVAILABLE);
		} else {
			$availabilityMsg.text(Resources.REMAIN_NOT_AVAILABLE);
		}
	}

	$availabilityMsgContainer.append($availabilityMsg);
};

var getAvailability = function () {
	ajax.getJson({
		url: util.appendParamsToUrl(Urls.getAvailability, {
			pid: $('#pid').val(),
			Quantity: $(this).val()
		}),
		callback: updateContainer
	});
};

module.exports = function () {
	$('#pdpMain').on('change', '.pdpForm input[name="Quantity"]', getAvailability);
};

},{"../../ajax":2,"../../util":47}],26:[function(require,module,exports){
'use strict';
var dialog = require('../../dialog'),
	util = require('../../util');

/**
 * @description Enables the zoom viewer on the product detail page
 */
var loadZoom = function () {
	var $imgZoom = $('#pdpMain .main-image'),
		zoomOptions = {
			zoomType: 'standard',
			alwaysOn: 0, // setting to 1 will load load high res images on page load
			zoomWidth: 575,
			zoomHeight: 349,
			position: 'right',
			preloadImages: 0, // setting to 1 will load load high res images on page load
			xOffset: 30,
			yOffset: 0,
			showEffect: 'fadein',
			hideEffect: 'fadeout'
		},
		hiresUrl;

	if ($imgZoom.length === 0 || dialog.isActive() || util.isMobile()) {
		return;
	}
	hiresUrl = $imgZoom.attr('href');

	if (hiresUrl && hiresUrl !== 'null' && hiresUrl.indexOf('noimagelarge') === -1) {
		$imgZoom.addClass('image-zoom');
		$imgZoom.removeData('jqzoom').jqzoom(zoomOptions);
	} else {
		$imgZoom.removeClass('image-zoom');
	}
};

/**
 * @description Sets the main image attributes and the href for the surrounding <a> tag
 * @param {Object} atts Object with url, alt, title and hires properties
 */
var setMainImage = function (atts) {
	$('#pdpMain .primary-image').attr({
		src: atts.url,
		alt: atts.alt,
		title: atts.title
	});
	if (!dialog.isActive() && !util.isMobile()) {
		$('#pdpMain .main-image').attr('href', atts.hires);
	}
	loadZoom();
};

/**
 * @description Replaces the images in the image container, for eg. when a different color was clicked.
 */
var replaceImages = function () {
	var $newImages = $('#update-images'),
		$imageContainer = $('#pdpMain .product-image-container');
	if ($newImages.length === 0) { return; }

	$imageContainer.html($newImages.html());
	$newImages.remove();
	loadZoom();
};

/* @module image
 * @description this module handles the primary image viewer on PDP
 **/

/**
 * @description by default, this function sets up zoom and event handler for thumbnail click
 **/
module.exports = function () {
	if (dialog.isActive() || util.isMobile()) {
		$('#pdpMain .main-image').removeAttr('href');
	}
	loadZoom();
	// handle product thumbnail click event
	$('#pdpMain').on('click', '.productthumbnail', function () {
		// switch indicator
		$(this).closest('.product-thumbnails').find('.thumb.selected').removeClass('selected');
		$(this).closest('.thumb').addClass('selected');

		setMainImage($(this).data('lgimg'));
	});
};
module.exports.loadZoom = loadZoom;
module.exports.setMainImage = setMainImage;
module.exports.replaceImages = replaceImages;

},{"../../dialog":7,"../../util":47}],27:[function(require,module,exports){
'use strict';

var dialog = require('../../dialog'),
	sendToFriend = require('../../send-to-friend'),
	storeinventory = require('../../storeinventory'),
	tooltip = require('../../tooltip'),
	util = require('../../util'),
	addThis = require('./addThis'),
	addToCart = require('./addToCart'),
	availability = require('./availability'),
	image = require('./image'),
	powerReviews = require('./powerReviews'),
	productNav = require('./productNav'),
	productSet = require('./productSet'),
	recommendations = require('./recommendations'),
	variant = require('./variant');

/**
 * @description Initialize product detail page with reviews, recommendation and product navigation.
 */
function initializeDom() {
	$('#pdpMain .product-detail .product-tabs').tabs();
	powerReviews();
	productNav();
	recommendations();
	tooltip.init();
}

/**
 * @description Initialize event handlers on product detail page
 */
function initializeEvents() {
	var $pdpMain = $('#pdpMain');

	addThis();
	addToCart();
	availability();
	variant();
	image();
	sendToFriend.initializeDialog($pdpMain);
	productSet();
	if (SitePreferences.STORE_PICKUP) {
		storeinventory.buildStoreList($('.product-number span').html());
		storeinventory.init();
	}

	// Add to Wishlist and Add to Gift Registry links behaviors
	$pdpMain.on('click', '.wl-action', function (e) {
		e.preventDefault();

		var data = util.getQueryStringParams($('.pdpForm').serialize());
		if (data.cartAction) {
			delete data.cartAction;
		}
		var url = util.appendParamsToUrl(this.href, data);
		url = this.protocol + '//' + this.hostname + ((url.charAt(0) === '/') ? url : ('/' + url));
		window.location.href = url;
	});

	// product options
	$pdpMain.on('change', '.product-options select', function () {
		var salesPrice = $pdpMain.find('.product-add-to-cart .price-sales');
		var selectedItem = $(this).children().filter(':selected').first();
		salesPrice.text(selectedItem.data('combined'));
	});

	// prevent default behavior of thumbnail link and add this Button
	$pdpMain.on('click', '.thumbnail-link, .addthis_toolbox a, .unselectable a', function (e) {
		e.preventDefault();
	});

	$('.size-chart-link a').on('click', function (e) {
		e.preventDefault();
		dialog.open({
			url: $(e.target).attr('href')
		});
	});
}

var product = {
	initializeEvents: initializeEvents,
	init: function () {
		initializeDom();
		initializeEvents();
	}
};

module.exports = product;

},{"../../dialog":7,"../../send-to-friend":44,"../../storeinventory":45,"../../tooltip":46,"../../util":47,"./addThis":23,"./addToCart":24,"./availability":25,"./image":26,"./powerReviews":28,"./productNav":29,"./productSet":30,"./recommendations":31,"./variant":32}],28:[function(require,module,exports){
'use strict';

var dialog = require('../../dialog');

module.exports = function () {
	if ($('#pwrwritediv').length > 0) {
		var options = $.extend(true, {}, dialog.settings, {
			autoOpen: true,
			height: 750,
			width: 650,
			dialogClass: 'writereview',
			title: 'Product Review',
			resizable: false
		});

		dialog.create({
			target: $('#pwrwritediv'),
			options: options
		});
	}

	$('#pdpMain').on('click', '.prSnippetLink', function (e) {
		e.preventDefault();
		$('.product-tabs').tabs('select', '#tab4');
		$('html, body').scrollTop($('#tab4').offset().top);
	});
};

},{"../../dialog":7}],29:[function(require,module,exports){
'use strict';

var ajax = require('../../ajax'),
	util = require('../../util');

/**
 * @description loads product's navigation
 **/
module.exports = function () {
	var $pidInput = $('.pdpForm input[name="pid"]').last(),
		$navContainer = $('#product-nav-container');
	// if no hash exists, or no pid exists, or nav container does not exist, return
	if (window.location.hash.length <= 1 || $pidInput.length === 0 || $navContainer.length === 0) {
		return;
	}

	var pid = $pidInput.val(),
		hash = window.location.hash.substr(1),
		url = util.appendParamToURL(Urls.productNav + '?' + hash, 'pid', pid);

	ajax.load({
		url: url,
		target: $navContainer
	});
};

},{"../../ajax":2,"../../util":47}],30:[function(require,module,exports){
'use strict';

var addToCart = require('./addToCart'),
	ajax = require('../../ajax'),
	tooltip = require('../../tooltip'),
	util = require('../../util');

module.exports = function () {
	var $addToCart = $('#add-to-cart'),
		$addAllToCart = $('#add-all-to-cart'),
		$productSetList = $('#product-set-list');

	var updateAddToCartButtons = function () {
		if ($productSetList.find('.add-to-cart[disabled]').length > 0) {
			$addAllToCart.attr('disabled', 'disabled');
			// product set does not have an add-to-cart button, but product bundle does
			$addToCart.attr('disabled', 'disabled');
		} else {
			$addAllToCart.removeAttr('disabled');
			$addToCart.removeAttr('disabled');
		}
	};

	if ($productSetList.length > 0) {
		updateAddToCartButtons();
	}
	// click on swatch for product set
	$productSetList.on('click', '.product-set-item .swatchanchor', function (e) {
		e.preventDefault();
		var url = Urls.getSetItem + this.search,
			$container = $(this).closest('.product-set-item'),
			qty = $container.find('form input[name="Quantity"]').first().val();
		if (isNaN(qty)) {
			qty = '1';
		}
		url = util.appendParamToURL(url, 'Quantity', qty);

		ajax.load({
			url: url,
			target: $container,
			callback: function () {
				updateAddToCartButtons();
				addToCart($container);
				tooltip.init();
			}
		});
	});
};

},{"../../ajax":2,"../../tooltip":46,"../../util":47,"./addToCart":24}],31:[function(require,module,exports){
'use strict';

var carousel = require('../../carousel');

/**
 * @description Creates product recommendation carousel using jQuery jcarousel plugin
 **/
module.exports = function () {
	var $carousel = $('#carousel-recomendations');
	if (!$carousel || $carousel.length === 0 || $carousel.children().length === 0) {
		return;
	}
	$carousel.jcarousel(carousel.settings);
};

},{"../../carousel":4}],32:[function(require,module,exports){
'use strict';

var addThis = require('./addThis'),
	addToCart = require('./addToCart'),
	ajax = require('../../ajax'),
	image = require('./image'),
	progress = require('../../progress'),
	storeinventory = require('../../storeinventory'),
	tooltip = require('../../tooltip'),
	util = require('../../util');


/**
 * @description update product content with new variant from href, load new content to #product-content panel
 * @param {String} href - url of the new product variant
 **/
var updateContent = function (href) {
	var $pdpForm = $('.pdpForm'),
		qty = $pdpForm.find('input[name="Quantity"]').first().val(),
		params = {
			Quantity: isNaN(qty) ? '1' : qty,
			format: 'ajax',
			productlistid: $pdpForm.find('input[name="productlistid"]').first().val()
		};

	progress.show($('#pdpMain'));

	ajax.load({
		url: util.appendParamsToUrl(href, params),
		target: $('#product-content'),
		callback: function () {
			addThis();
			addToCart();
			if (SitePreferences.STORE_PICKUP) {
				storeinventory.buildStoreList($('.product-number span').html());
			}
			image.replaceImages();
			tooltip.init();
		}
	});
};

module.exports = function () {
	var $pdpMain = $('#pdpMain');
	// hover on swatch - should update main image with swatch image
	$pdpMain.on('hover', '.swatchanchor', function () {
		var largeImg = $(this).data('lgimg'),
			$imgZoom = $pdpMain.find('.main-image'),
			$mainImage = $pdpMain.find('.primary-image');

		if (!largeImg) { return; }
		// store the old data from main image for mouseleave handler
		$(this).data('lgimg', {
			hires: $imgZoom.attr('href'),
			url: $mainImage.attr('src'),
			alt: $mainImage.attr('alt'),
			title: $mainImage.attr('title')
		});
		// set the main image
		image.setMainImage(largeImg);
	});

	// click on swatch - should replace product content with new variant
	$pdpMain.on('click', '.product-detail .swatchanchor', function (e) {
		e.preventDefault();
		if ($(this).parents('li').hasClass('unselectable')) { return; }
		updateContent(this.href);
	});

	// change drop down variation attribute - should replace product content with new variant
	$pdpMain.on('change', '.variation-select', function () {
		if ($(this).val().length === 0) { return; }
		updateContent($(this).val());
	});
};

},{"../../ajax":2,"../../progress":39,"../../storeinventory":45,"../../tooltip":46,"../../util":47,"./addThis":23,"./addToCart":24,"./image":26}],33:[function(require,module,exports){
'use strict';

var addProductToCart = require('./product/addToCart'),
	ajax = require('../ajax'),
	quickview = require('../quickview'),
	sendToFriend = require('../send-to-friend'),
	util = require('../util');

/**
 * @function
 * @description Loads address details to a given address and fills the address form
 * @param {String} addressID The ID of the address to which data will be loaded
 */
function populateForm(addressID, $form) {
	// load address details
	var url = Urls.giftRegAdd + addressID;
	ajax.getJson({
		url: url,
		callback: function (data) {
			if (!data || !data.address) {
				window.alert(Resources.REG_ADDR_ERROR);
				return false;
			}
			// fill the form
			$form.find('[name$="_addressid"]').val(data.address.ID);
			$form.find('[name$="_firstname"]').val(data.address.firstName);
			$form.find('[name$="_lastname"]').val(data.address.lastName);
			$form.find('[name$="_address1"]').val(data.address.address1);
			$form.find('[name$="_address2"]').val(data.address.address2);
			$form.find('[name$="_city"]').val(data.address.city);
			$form.find('[name$="_country"]').val(data.address.countryCode).trigger('change');
			$form.find('[name$="_postal"]').val(data.address.postalCode);
			$form.find('[name$="_state"]').val(data.address.stateCode);
			$form.find('[name$="_phone"]').val(data.address.phone);
			// $form.parent('form').validate().form();
		}
	});
}

/**
 * @private
 * @function
 * @description Initializes events for the gift registration
 */
function initializeEvents() {
	var $eventInfoForm = $('form[name$="_giftregistry_event"]'),
		$eventAddressForm = $('form[name$="_giftregistry"]'),
		$beforeAddress = $eventAddressForm.find('fieldset[name="address-before"]'),
		$afterAddress = $eventAddressForm.find('fieldset[name="address-after"]');

	$('.usepreevent').on('click', function () {
		// filter out storefront toolkit
		$(':input', $beforeAddress).not('[id^="ext"]').not('select[name$="_addressBeforeList"]').each(function () {
			var fieldName = $(this).attr('name'),
				$afterField = $afterAddress.find('[name="' + fieldName.replace('Before', 'After') + '"]');
			$afterField.val($(this).val()).trigger('change');
		});
	});
	$eventAddressForm.on('change', 'select[name$="_addressBeforeList"]', function () {
		var addressID = $(this).val();
		if (addressID.length === 0) { return; }
		populateForm(addressID, $beforeAddress);
	})
	.on('change', 'select[name$="_addressAfterList"]', function () {
		var addressID = $(this).val();
		if (addressID.length === 0) { return; }
		populateForm(addressID, $afterAddress);
	});

	$beforeAddress.on('change', 'select[name$="_country"]', function () {
		util.updateStateOptions($beforeAddress);
	});

	$afterAddress.on('change', 'select[name$="_country"]', function () {
		util.updateStateOptions($afterAddress);
	});

	$eventInfoForm.on('change', 'select[name$="_country"]', function () {
		util.updateStateOptions($eventInfoForm);
	});

	$('form[name$="_giftregistry_items"]').on('click', '.item-details a', function (e) {
		e.preventDefault();
		var productListID = $('input[name=productListID]').val();
		quickview.show({
			url: e.target.href,
			source: 'giftregistry',
			productlistid: productListID
		});
	});
}

exports.init = function () {
	initializeEvents();
	addProductToCart();
	sendToFriend.initializeDialog('.list-table-header');
	util.setDeleteConfirmation('.item-list', String.format(Resources.CONFIRM_DELETE, Resources.TITLE_GIFTREGISTRY));
};

},{"../ajax":2,"../quickview":40,"../send-to-friend":44,"../util":47,"./product/addToCart":24}],34:[function(require,module,exports){
'use strict';

var compareWidget = require('../compare-widget'),
	productTile = require('../product-tile'),
	progress = require('../progress'),
	util = require('../util');

function infiniteScroll() {
	// getting the hidden div, which is the placeholder for the next page
	var loadingPlaceHolder = $('.infinite-scroll-placeholder[data-loading-state="unloaded"]');
	// get url hidden in DOM
	var gridUrl = loadingPlaceHolder.attr('data-grid-url');

	if (loadingPlaceHolder.length === 1 && util.elementInViewport(loadingPlaceHolder.get(0), 250)) {
		// switch state to 'loading'
		// - switches state, so the above selector is only matching once
		// - shows loading indicator
		loadingPlaceHolder.attr('data-loading-state', 'loading');
		loadingPlaceHolder.addClass('infinite-scroll-loading');

		/**
		 * named wrapper function, which can either be called, if cache is hit, or ajax repsonse is received
		 */
		var fillEndlessScrollChunk = function (html) {
			loadingPlaceHolder.removeClass('infinite-scroll-loading');
			loadingPlaceHolder.attr('data-loading-state', 'loaded');
			$('div.search-result-content').append(html);
		};

		// old condition for caching was `'sessionStorage' in window && sessionStorage["scroll-cache_" + gridUrl]`
		// it was removed to temporarily address RAP-2649
		if (false) {
			// if we hit the cache
			fillEndlessScrollChunk(sessionStorage['scroll-cache_' + gridUrl]);
		} else {
			// else do query via ajax
			$.ajax({
				type: 'GET',
				dataType: 'html',
				url: gridUrl,
				success: function (response) {
					// put response into cache
					try {
						sessionStorage['scroll-cache_' + gridUrl] = response;
					} catch (e) {
						// nothing to catch in case of out of memory of session storage
						// it will fall back to load via ajax
					}
					// update UI
					fillEndlessScrollChunk(response);
					productTile.init();
				}
			});
		}
	}
}
/**
 * @private
 * @function
 * @description replaces breadcrumbs, lefthand nav and product listing with ajax and puts a loading indicator over the product listing
 */
function updateProductListing() {
	var hash = location.href.split('#')[1];
	if (hash === 'results-content' || hash === 'results-products') { return; }
	var refineUrl;

	if (hash.length > 0) {
		refineUrl = window.location.pathname + '?' + hash;
	} else {
		return;
	}
	progress.show($('.search-result-content'));
	$('#main').load(util.appendParamToURL(refineUrl, 'format', 'ajax'), function () {
		compareWidget.init();
		productTile.init();
		progress.hide();
	});
}

/**
 * @private
 * @function
 * @description Initializes events for the following elements:<br/>
 * <p>refinement blocks</p>
 * <p>updating grid: refinements, pagination, breadcrumb</p>
 * <p>item click</p>
 * <p>sorting changes</p>
 */
function initializeEvents() {
	var $main = $('#main');
	// compare checked
	$main.on('click', 'input[type="checkbox"].compare-check', function () {
		var cb = $(this);
		var tile = cb.closest('.product-tile');

		var func = this.checked ? compareWidget.addProduct : compareWidget.removeProduct;
		var itemImg = tile.find('.product-image a img').first();
		func({
			itemid: tile.data('itemid'),
			uuid: tile[0].id,
			img: itemImg,
			cb: cb
		});

	});

	// handle toggle refinement blocks
	$main.on('click', '.refinement h3', function () {
		$(this).toggleClass('expanded')
		.siblings('ul').toggle();
	});

	// handle events for updating grid
	$main.on('click', '.refinements a, .pagination a, .breadcrumb-refinement-value a', function () {
		if ($(this).parent().hasClass('unselectable')) { return; }
		var catparent = $(this).parents('.category-refinement');
		var folderparent = $(this).parents('.folder-refinement');

		//if the anchor tag is uunderneath a div with the class names & , prevent the double encoding of the url
		//else handle the encoding for the url
		if (catparent.length > 0 || folderparent.length > 0) {
			return true;
		} else {
			var uri = util.getUri(this);
			if (uri.query.length > 1) {
				window.location.hash = uri.query.substring(1);
			} else {
				window.location.href = this.href;
			}
			return false;
		}
	});

	// handle events item click. append params.
	$main.on('click', '.product-tile a:not("#quickviewbutton")', function () {
		var a = $(this);
		// get current page refinement values
		var wl = window.location;

		var qsParams = (wl.search.length > 1) ? util.getQueryStringParams(wl.search.substr(1)) : {};
		var hashParams = (wl.hash.length > 1) ? util.getQueryStringParams(wl.hash.substr(1)) : {};

		// merge hash params with querystring params
		var params = $.extend(hashParams, qsParams);
		if (!params.start) {
			params.start = 0;
		}
		// get the index of the selected item and save as start parameter
		var tile = a.closest('.product-tile');
		var idx = tile.data('idx') ? + tile.data('idx') : 0;

		// convert params.start to integer and add index
		params.start = (+params.start) + (idx + 1);
		// set the hash and allow normal action to continue
		a[0].hash = $.param(params);
	});

	// handle sorting change
	$main.on('change', '.sort-by select', function () {
		var refineUrl = $(this).find('option:selected').val();
		var uri = util.getUri(refineUrl);
		window.location.hash = uri.query.substr(1);
		return false;
	})
	.on('change', '.items-per-page select', function () {
		var refineUrl = $(this).find('option:selected').val();
		if (refineUrl === 'INFINITE_SCROLL') {
			$('html').addClass('infinite-scroll').removeClass('disable-infinite-scroll');
		} else {
			$('html').addClass('disable-infinite-scroll').removeClass('infinite-scroll');
			var uri = util.getUri(refineUrl);
			window.location.hash = uri.query.substr(1);
		}
		return false;
	});

	// handle hash change
	$(window).hashchange(function () {
		updateProductListing();
	});
}

exports.init = function () {
	compareWidget.init();
	if (SitePreferences.LISTING_INFINITE_SCROLL) {
		$(window).on('scroll', infiniteScroll);
	}
	productTile.init();
	initializeEvents();
};

},{"../compare-widget":5,"../product-tile":38,"../progress":39,"../util":47}],35:[function(require,module,exports){
'use strict';

/**
 * @function
 * @description Triggers the scroll event on a carousel element
 * @param {Object} carousel
 */
function slideCarouselInitCallback(carousel) {
	// create navigation for slideshow
	var numSlides = $('#homepage-slider li').size();
	var slideShowNav = '<div class="jcarousel-control">';
	for (var i = 1; i <= numSlides; i++) {
		slideShowNav = slideShowNav + '<a href="#" class="link-' + i + '">' + i + '</a>';
	}
	slideShowNav = slideShowNav + '</div>';
	$('#homepage-slider .jcarousel-clip').append(slideShowNav);

	$('.jcarousel-control a').bind('click', function () {
		carousel.scroll(jQuery.jcarousel.intval($(this).text()));
		return false;
	});
	$('.slide').width($('#wrapper').width());
}


/**
 * @function
 * @description Activates the visibility of the next element in the carousel
 * @param {Object} carousel -- necessity needs TBD!
 * @param {Object} item --  necessity needs TBD!
 * @param {Number} idx Index of the item which should be activated
 * @param {Object} state --  necessity needs TBD!
 */
function slideCarouselItemVisible(carousel, item, idx) {
	$('.jcarousel-control a').removeClass('active');
	$('.jcarousel-control').find('.link-' + idx).addClass('active');
}
exports.init = function () {
	$('#homepage-slider').jcarousel({
		scroll: 1,
		auto: 4,
		buttonNextHTML: null,
		buttonPrevHTML: null,
		itemFallbackDimension: '100%',
		initCallback: slideCarouselInitCallback,
		itemFirstInCallback: slideCarouselItemVisible
	});
};

},{}],36:[function(require,module,exports){
'use strict';
var dialog = require('../dialog');

exports.init = function () {
	$('.store-details-link').on('click', function (e) {
		e.preventDefault();
		dialog.open({
			url: $(e.target).attr('href')
		});
	});
};

},{"../dialog":7}],37:[function(require,module,exports){
'use strict';

var addProductToCart = require('./product/addToCart'),
	page = require('../page'),
	sendToFriend = require('../send-to-friend'),
	util = require('../util');

exports.init = function () {
	addProductToCart();
	sendToFriend.initializeDialog('.list-table-header');
	$('#editAddress').on('change', function () {
		page.redirect(util.appendParamToURL(Urls.wishlistAddress, 'AddressID', $(this).val()));
	});

	//add js logic to remove the , from the qty feild to pass regex expression on client side
	$('.option-quantity-desired input').on('focusout', function () {
		$(this).val($(this).val().replace(',', ''));
	});
};

},{"../page":13,"../send-to-friend":44,"../util":47,"./product/addToCart":24}],38:[function(require,module,exports){
'use strict';

var imagesLoaded = require('imagesloaded'),
	product = require('./pages/product'),
	quickview = require('./quickview');

function initQuickViewButtons() {
	$('.tiles-container .product-image').on('mouseenter', function () {
		var $qvButton = $('#quickviewbutton');
		if ($qvButton.length === 0) {
			$qvButton = $('<a id="quickviewbutton"/>');
		}
		var $link = $(this).find('.thumb-link');
		$qvButton.attr({
			'href': $link.attr('href'),
			'title': $link.attr('title')
		}).appendTo(this);
		$qvButton.on('click', function (e) {
			e.preventDefault();
			quickview.show({
				url: $(this).attr('href'),
				source: 'quickview'
			});
		});
	});
}
/**
 * @private
 * @function
 * @description Initializes events on the product-tile for the following elements:
 * - swatches
 * - thumbnails
 */
function initializeEvents() {
	initQuickViewButtons();

	$('.swatch-list').on('mouseleave', function () {
		// Restore current thumb image
		var $tile = $(this).closest('.product-tile'),
			$thumb = $tile.find('.product-image .thumb-link img').eq(0),
			data = $thumb.data('current');

		$thumb.attr({
			src: data.src,
			alt: data.alt,
			title: data.title
		});
	});
	$('.swatch-list .swatch').on('click', function (e) {
		e.preventDefault();
		if ($(this).hasClass('selected')) { return; }

		var $tile = $(this).closest('.product-tile');
		$(this).closest('.swatch-list').find('.swatch.selected').removeClass('selected');
		$(this).addClass('selected');
		$tile.find('.thumb-link').attr('href', $(this).attr('href'));
		$tile.find('name-link').attr('href', $(this).attr('href'));

		var data = $(this).children('img').filter(':first').data('thumb');
		var $thumb = $tile.find('.product-image .thumb-link img').eq(0);
		var currentAttrs = {
			src: data.src,
			alt: data.alt,
			title: data.title
		};
		$thumb.attr(currentAttrs);
		$thumb.data('current', currentAttrs);
	}).on('mouseenter', function () {
		// get current thumb details
		var $tile = $(this).closest('.product-tile'),
			$thumb = $tile.find('.product-image .thumb-link img').eq(0),
			data = $(this).children('img').filter(':first').data('thumb'),
			current = $thumb.data('current');

		// If this is the first time, then record the current img
		if (!current) {
			$thumb.data('current', {
				src: $thumb[0].src,
				alt: $thumb[0].alt,
				title: $thumb[0].title
			});
		}

		// Set the tile image to the values provided on the swatch data attributes
		$thumb.attr({
			src: data.src,
			alt: data.alt,
			title: data.title
		});
	});
}

exports.init = function () {
	var $tiles = $('.tiles-container .product-tile');
	if ($tiles.length === 0) { return; }
	imagesLoaded('.tiles-container').on('done', function() {
		$tiles.syncHeight()
			.each(function (idx) {
				$(this).data('idx', idx);
			});
	});
	initializeEvents();
};

},{"./pages/product":27,"./quickview":40,"imagesloaded":50}],39:[function(require,module,exports){
'use strict';

var $loader;

/**
 * @function
 * @description Shows an AJAX-loader on top of a given container
 * @param {Element} container The Element on top of which the AJAX-Loader will be shown
 */
var show = function (container) {
	var target = (!container || $(container).length === 0) ? $('body') : $(container);
	$loader = $loader || $('.loader');

	if ($loader.lengt === 0) {
		$loader = $('<div/>').addClass('loader')
			.append($('<div/>').addClass('loader-indicator'), $('<div/>').addClass('loader-bg'));
	}
	return $loader.appendTo(target).show();
};
/**
 * @function
 * @description Hides an AJAX-loader
 */
var hide = function () {
	if ($loader) {
		$loader.hide();
	}
};

exports.show = show;
exports.hide = hide;

},{}],40:[function(require,module,exports){
'use strict';

var dialog = require('./dialog'),
	product = require('./pages/product'),
	util = require('./util'),
	_ = require('lodash');


var makeUrl = function (url, source, productListID) {
	if (source) {
		url = util.appendParamToURL(url, 'source', source);
	}
	if (productListID) {
		url = util.appendParamToURL(url, 'productlistid', productListID);
	}
	return url;
};

var quickview = {
	init: function () {
		if (!this.exists()) {
			this.$container = $('<div/>').attr('id', 'QuickViewDialog').appendTo(document.body);
		}
		this.productLinks = $('#search-result-items .thumb-link').map(function (index, thumbLink) {
			return $(thumbLink).attr('href');
		});
	},

	setup: function (qvUrl) {
		var $btnNext = $('.quickview-next'),
			$btnPrev = $('.quickview-prev');

		product.initializeEvents();

		// remove any param
		qvUrl = qvUrl.substring(0, qvUrl.indexOf('?'));

		this.productLinkIndex = _(this.productLinks).findIndex(function (url) {
			return url === qvUrl;
		});

		// hide the buttons on the compare page or when there are no other products
		if (this.productLinks.length <= 1 || $('.compareremovecell').length > 0) {
			$btnNext.hide();
			$btnPrev.hide();
			return;
		}

		if (this.productLinkIndex === this.productLinks.length - 1) {
			$btnNext.attr('disabled', 'disabled');
		}
		if (this.productLinkIndex === 0) {
			$btnPrev.attr('disabled', 'disabled');
		}

		$btnNext.on('click', function (e) {
			e.preventDefault();
			this.navigateQuickview(1);
		}.bind(this));
		$btnPrev.on('click', function (e) {
			e.preventDefault();
			this.navigateQuickview(-1);
		}.bind(this));
	},

	/**
	 * @param {Number} step - How many products away from current product to navigate to. Negative number means navigate backward
	 */
	navigateQuickview: function (step) {
		// default step to 0
		this.productLinkIndex += (step ? step : 0);
		var url = makeUrl(this.productLinks[this.productLinkIndex], 'quickview');
		dialog.replace({
			url: url,
			callback: this.setup.bind(this, url)
		});
	},

	/**
	 * @description show quick view dialog
	 * @param {Object} options
	 * @param {String} options.url - url of the product details
	 * @param {String} options.source - source of the dialog to be appended to URL
	 * @param {String} options.productlistid - to be appended to URL
	 * @param {Function} options.callback - callback once the dialog is opened
	 */
	show: function (options) {
		var url;
		if (!this.exists()) {
			this.init();
		}
		url = makeUrl(options.url, options.source, options.productlistid);

		dialog.open({
			target: this.$container,
			url: url,
			options: {
				width: 920,
				title: 'Product Quickview',
				open: function () {
					this.setup(url);
					if (typeof options.callback === 'function') { options.callback(); }
				}.bind(this)
			}
		});
	},
	exists: function () {
		return this.$container && (this.$container.length > 0);
	}
};

module.exports = quickview;

},{"./dialog":7,"./pages/product":27,"./util":47,"lodash":53}],41:[function(require,module,exports){
'use strict';

/**
 * @private
 * @function
 * @description Binds event to the place holder (.blur)
 */
function initializeEvents() {
	$('#q').focus(function () {
		var input = $(this);
		if (input.val() === input.attr('placeholder')) {
			input.val('');
		}
	})
	.blur(function () {
		var input = $(this);
		if (input.val() === '' || input.val() === input.attr('placeholder')) {
			input.val(input.attr('placeholder'));
		}
	})
	.blur();
}

exports.init = initializeEvents;

},{}],42:[function(require,module,exports){
'use strict';

var util = require('./util');

var currentQuery = null,
	lastQuery = null,
	runningQuery = null,
	listTotal = -1,
	listCurrent = -1,
	delay = 30,
	$resultsContainer;
/**
 * @function
 * @description Handles keyboard's arrow keys
 * @param keyCode Code of an arrow key to be handled
 */
function handleArrowKeys(keyCode) {
	switch (keyCode) {
		case 38:
			// keyUp
			listCurrent = (listCurrent <= 0) ? (listTotal - 1) : (listCurrent - 1);
			break;
		case 40:
			// keyDown
			listCurrent = (listCurrent >= listTotal - 1) ? 0 : listCurrent + 1;
			break;
		default:
			// reset
			listCurrent = -1;
			return false;
	}

	$resultsContainer.children().removeClass('selected').eq(listCurrent).addClass('selected');
	$('input[name="q"]').val($resultsContainer.find('.selected .suggestionterm').first().text());
	return true;
}

var searchsuggest = {
	/**
	 * @function
	 * @description Configures parameters and required object instances
	 */
	init: function (container, defaultValue) {
		var $searchContainer = $(container),
			$searchForm = $searchContainer.find('form[name="simpleSearch"]'),
			$searchField = $searchForm.find('input[name="q"]'),
			fieldDefault = defaultValue;

		// disable browser auto complete
		$searchField.attr('autocomplete', 'off');

		// on focus listener (clear default value)
		$searchField.focus(function () {
			if (!$resultsContainer) {
				// create results container if needed
				$resultsContainer = $('<div/>').attr('id', 'search-suggestions').appendTo($searchContainer);
			}
			if ($searchField.val() === fieldDefault) {
				$searchField.val('');
			}
		});
		// on blur listener
		$searchField.blur(function () {
			setTimeout(this.clearResults, 200);
		}.bind(this));
		// on key up listener
		$searchField.keyup(function (e) {

			// get keyCode (window.event is for IE)
			var keyCode = e.keyCode || window.event.keyCode;

			// check and treat up and down arrows
			if (handleArrowKeys(keyCode)) {
				return;
			}
			// check for an ENTER or ESC
			if (keyCode === 13 || keyCode === 27) {
				this.clearResults();
				return;
			}

			currentQuery = $searchField.val().trim();

			// no query currently running, init a update
			if (runningQuery === null) {
				runningQuery = currentQuery;
				setTimeout(this.suggest.bind(this), delay);
			}
		}.bind(this));
	},

	/**
	 * @function
	 * @description trigger suggest action
	 */
	suggest: function () {
		// check whether query to execute (runningQuery) is still up to date and had not changed in the meanwhile
		// (we had a little delay)
		if (runningQuery !== currentQuery) {
			// update running query to the most recent search phrase
			runningQuery = currentQuery;
		}

		// if it's empty clear the results box and return
		if (runningQuery.length === 0) {
			this.clearResults();
			runningQuery = null;
			return;
		}

		// if the current search phrase is the same as for the last suggestion call, just return
		if (lastQuery === runningQuery) {
			runningQuery = null;
			return;
		}

		// build the request url
		var reqUrl = util.appendParamToURL(Urls.searchsuggest, 'q', runningQuery);
		reqUrl = util.appendParamToURL(reqUrl, 'legacy', 'false');

		// execute server call
		$.get(reqUrl, function (data) {
			var suggestionHTML = data,
				ansLength = suggestionHTML.trim().length;

			// if there are results populate the results div
			if (ansLength === 0) {
				this.clearResults();
			} else {
				// update the results div
				$resultsContainer.html(suggestionHTML).fadeIn(200);
			}

			// record the query that has been executed
			lastQuery = runningQuery;
			// reset currently running query
			runningQuery = null;

			// check for another required update (if current search phrase is different from just executed call)
			if (currentQuery !== lastQuery) {
				// ... and execute immediately if search has changed while this server call was in transit
				runningQuery = currentQuery;
				setTimeout(this.suggest.bind(this), delay);
			}
			this.hideLeftPanel();
		}.bind(this));
	},
	/**
	 * @function
	 * @description
	 */
	clearResults: function () {
		if (!$resultsContainer) { return; }
		$resultsContainer.fadeOut(200, function () {$resultsContainer.empty();});
	},
	/**
	 * @function
	 * @description
	 */
	hideLeftPanel: function () {
		//hide left panel if there is only a matching suggested custom phrase
		if ($('.search-suggestion-left-panel-hit').length === 1 && $('.search-phrase-suggestion a').text().replace(/(^[\s]+|[\s]+$)/g, '').toUpperCase() === $('.search-suggestion-left-panel-hit a').text().toUpperCase()) {
			$('.search-suggestion-left-panel').css('display', 'none');
			$('.search-suggestion-wrapper-full').addClass('search-suggestion-wrapper');
			$('.search-suggestion-wrapper').removeClass('search-suggestion-wrapper-full');
		}
	}
};

module.exports = searchsuggest;

},{"./util":47}],43:[function(require,module,exports){
'use strict';

var util = require('./util');

var qlen = 0,
	listTotal = -1,
	listCurrent = -1,
	delay = 300,
	fieldDefault = null,
	suggestionsJson = null,
	$searchForm,
	$searchField,
	$searchContainer,
	$resultsContainer;
/**
 * @function
 * @description Handles keyboard's arrow keys
 * @param keyCode Code of an arrow key to be handled
 */
function handleArrowKeys(keyCode) {
	switch (keyCode) {
		case 38:
			// keyUp
			listCurrent = (listCurrent <= 0) ? (listTotal - 1) : (listCurrent - 1);
			break;
		case 40:
			// keyDown
			listCurrent = (listCurrent >= listTotal - 1) ? 0 : listCurrent + 1;
			break;
		default:
			// reset
			listCurrent = -1;
			return false;
	}

	$resultsContainer.children().removeClass('selected').eq(listCurrent).addClass('selected');
	$searchField.val($resultsContainer.find('.selected .suggestionterm').first().text());
	return true;
}
var searchsuggest = {
	/**
	 * @function
	 * @description Configures parameters and required object instances
	 */
	init: function (container, defaultValue) {
		// initialize vars
		$searchContainer = $(container);
		$searchForm = $searchContainer.find('form[name="simpleSearch"]');
		$searchField = $searchForm.find('input[name="q"]');
		fieldDefault = defaultValue;

		// disable browser auto complete
		$searchField.attr('autocomplete', 'off');

		// on focus listener (clear default value)
		$searchField.focus(function () {
			if (!$resultsContainer) {
				// create results container if needed
				$resultsContainer = $('<div/>').attr('id', 'suggestions').appendTo($searchContainer).css({
					'top': $searchContainer[0].offsetHeight,
					'left': 0,
					'width': $searchField[0].offsetWidth
				});
			}
			if ($searchField.val() === fieldDefault) {
				$searchField.val('');
			}
		});
		// on blur listener
		$searchField.blur(function () {
			setTimeout(this.clearResults, 200);
		}.bind(this));
		// on key up listener
		$searchField.keyup(function (e) {

			// get keyCode (window.event is for IE)
			var keyCode = e.keyCode || window.event.keyCode;

			// check and treat up and down arrows
			if (handleArrowKeys(keyCode)) {
				return;
			}
			// check for an ENTER or ESC
			if (keyCode === 13 || keyCode === 27) {
				this.clearResults();
				return;
			}

			var lastVal = $searchField.val();

			// if is text, call with delay
			setTimeout(function () {
				this.suggest(lastVal);
			}.bind(this), delay);
		}.bind(this));
		// on submit we do not submit the form, but change the window location
		// in order to avoid https to http warnings in the browser
		// only if it's not the default value and it's not empty
		$searchForm.submit(function (e) {
			e.preventDefault();
			var searchTerm = $searchField.val();
			if (searchTerm === fieldDefault || searchTerm.length === 0) {
				return false;
			}
			window.location = util.appendParamToURL($(this).attr('action'), 'q', searchTerm);
		});
	},

	/**
	 * @function
	 * @description trigger suggest action
	 * @param lastValue
	 */
	suggest: function (lastValue) {
		// get the field value
		var part = $searchField.val();

		// if it's empty clear the resuts box and return
		if (part.length === 0) {
			this.clearResults();
			return;
		}

		// if part is not equal to the value from the initiated call,
		// or there were no results in the last call and the query length
		// is longer than the last query length, return
		// #TODO: improve this to look at the query value and length
		if ((lastValue !== part) || (listTotal === 0 && part.length > qlen)) {
			return;
		}
		qlen = part.length;

		// build the request url
		var reqUrl = util.appendParamToURL(Urls.searchsuggest, 'q', part);
		reqUrl = util.appendParamToURL(reqUrl, 'legacy', 'true');

		// get remote data as JSON
		$.getJSON(reqUrl, function (data) {
			// get the total of results
			var suggestions = data,
				ansLength = suggestions.length;

			// if there are results populate the results div
			if (ansLength === 0) {
				this.clearResults();
				return;
			}
			suggestionsJson = suggestions;
			var html = '';
			for (var i = 0; i < ansLength; i++) {
				html += '<div><div class="suggestionterm">' + suggestions[i].suggestion + '</div><span class="hits">' + suggestions[i].hits + '</span></div>';
			}

			// update the results div
			$resultsContainer.html(html).show().on('hover', 'div', function () {
				$(this).toggleClass = 'selected';
			}).on('click', 'div', function () {
				// on click copy suggestion to search field, hide the list and submit the search
				$searchField.val($(this).children('.suggestionterm').text());
				this.clearResults();
				$searchForm.trigger('submit');
			}.bind(this));
		}.bind(this));
	},
	/**
	 * @function
	 * @description
	 */
	clearResults: function () {
		if (!$resultsContainer) { return; }
		$resultsContainer.empty().hide();
	}
};

module.exports = searchsuggest;

},{"./util":47}],44:[function(require,module,exports){
'use strict';

var ajax = require('./ajax'),
	dialog = require('./dialog'),
	util = require('./util'),
	validator = require('./validator');

var sendToFriend = {
	init: function () {
		var $form = $('#send-to-friend-form'),
			$dialog = $('#send-to-friend-dialog');
		util.limitCharacters();
		$dialog.on('click', '.preview-button, .send-button, .edit-button', function (e) {
			e.preventDefault();
			$form.validate();
			if (!$form.valid()) {
				return false;
			}
			var requestType = $form.find('#request-type');
			if (requestType.length > 0) {
				requestType.remove();
			}
			$('<input/>').attr({id: 'request-type', type: 'hidden', name: $(this).attr('name'), value: $(this).attr('value')}).appendTo($form);
			var data = $form.serialize();
			ajax.load({url:$form.attr('action'),
				data: data,
				target: $dialog,
				callback: function () {
					validator.init();
					util.limitCharacters();
					$('.ui-dialog-content').dialog('option', 'position', 'center');
				}
			});
		})
		.on('click', '.cancel-button, .close-button', function (e) {
			e.preventDefault();
			$dialog.dialog('close');
		});
	},
	initializeDialog: function (eventDelegate) {
		$(eventDelegate).on('click', '.send-to-friend', function (e) {
			e.preventDefault();
			var dlg = dialog.create({
				target: $('#send-to-friend-dialog'),
				options: {
					width: 800,
					height: 'auto',
					title: this.title,
					open: function () {
						sendToFriend.init();
						validator.init();
					}
				}
			});

			var data = util.getQueryStringParams($('.pdpForm').serialize());
			if (data.cartAction) {
				delete data.cartAction;
			}
			var url = util.appendParamsToUrl(this.href, data);
			url = this.protocol + '//' + this.hostname + ((url.charAt(0) === '/') ? url : ('/' + url));
			ajax.load({
				url: util.ajaxUrl(url),
				target: dlg,
				callback: function () {
					dlg.dialog('open');	// open after load to ensure dialog is centered
				}
			});
		});
	}
};

module.exports = sendToFriend;

},{"./ajax":2,"./dialog":7,"./util":47,"./validator":48}],45:[function(require,module,exports){
'use strict';

var ajax = require('./ajax'),
	page = require('./page'),
	util = require('./util');

var currentTemplate = $('#wrapper.pt_cart').length ? 'cart' : 'pdp';

var storeinventory = {
	init: function () {
		var self = this;
		this.$preferredStorePanel = $('<div id="preferred-store-panel">');
		// check for items that trigger dialog
		$('#cart-table .set-preferred-store').on('click', function (e) {
			e.preventDefault();
			self.loadPreferredStorePanel($(this).parent().attr('id'));
		});

		//disable the radio button for home deliveries if the store inventory is out of stock
		$('#cart-table .item-delivery-options .home-delivery .not-available').each(function () {
			$(this).parents('.home-delivery').children('input').attr('disabled', 'disabled');
		});

		$('body').on('click', '#pdpMain .set-preferred-store', function () {
			self.loadPreferredStorePanel($(this).parent().attr('id'));
			return false;
		});

		$('.item-delivery-options input.radio-url').on('click', function () {
			self.setLineItemStore($(this));
		});

		if ($('.checkout-shipping').length > 0) {
			this.shippingLoad();
		}

		//disable the cart button if there is pli set to instore and the status is 'Not Available' and it is marked as an instore pli
		$('.item-delivery-options').each(function () {
			var $instore = $(this).children('.instore-delivery');
			if (($instore.children('input').attr('disabled') === 'disabled') &&
				($instore.children('.selected-store-availability').children('.store-error').length > 0) &&
				($instore.children('input').attr('checked') === 'checked')) {
				$('.cart-action-checkout button').attr('disabled', 'disabled');
			}
		});
	},
	setLineItemStore: function (radio) {
		// @TODO refactor DOM manipulation
		$(radio).parent().parent().children().toggleClass('hide');
		$(radio).parent().parent().toggleClass('loading');
		ajax.getJson({
			url: util.appendParamsToUrl($(radio).attr('data-url') , {storeid: $(radio).siblings('.storeid').attr('value')}),
			callback: function () {
				$(radio).attr('checked', 'checked');
				$(radio).parent().parent().toggleClass('loading');
				$(radio).parent().parent().children().toggleClass('hide');
			}
		});

		//scan the plis to see if there are any that are not able to go through checkout, if none are found re-enable the checkout button
		var countplis = 0;
		$('.item-delivery-options').each(function () {
			var $instore = $(this).children('.instore-delivery');
			if (($instore.children('input').attr('disabled') === 'disabled') &&
				($instore.children('.selected-store-availability').children('.store-error').length > 0) &&
				($instore.children('input').attr('checked') === 'checked')) {
					$('.cart-action-checkout button').attr('disabled', 'disabled');
				} else {
					countplis++;
				}
			});
			if (countplis > 0 && $('.error-message').length === 0) {
				$('.cart-action-checkout button').removeAttr('disabled', 'disabled');
			}
	},
	buildStoreList: function (pid) {
		var self = this;
		this.$storeList = $('<div class="store-list">');
		// request results from server
		ajax.getJson({
			url: util.appendParamsToUrl(Urls.storesInventory, {
				pid: pid,
				zipCode: User.zip
			}),
			callback: function (data) {
				// clear any previous results, then build new
				self.$storeList.empty();
				var listings = $('<ul class="store-list"/>');
				if (data && data.length > 0) {
					for (var i = 0; i < 10 && i < data.length; i++) {
						var item = data[i],
							displayButton;
						//Disable button if there is no stock for item
						if (item.statusclass === 'store-in-stock') {
							displayButton = '<button value="' + item.storeId + '" class="button-style-1 select-store-button" data-stock-status="' + item.status + '">' + Resources.SELECT_STORE + '</button>';
						} else {
							displayButton = '<button value="' + item.storeId + '" class="button-style-1 select-store-button" data-stock-status="' + item.status + '" disabled="disabled">' + Resources.SELECT_STORE + '</button>';
						}

						listings.append('<li class="store-' + item.storeId + item.status.replace(/ /g, '-') + ' store-tile">' +
							'<span class="store-tile-address ">' + item.address1 + ',</span>' +
							'<span class="store-tile-city ">' + item.city + '</span>' +
							'<span class="store-tile-state ">' + item.stateCode + '</span>' +
							'<span class="store-tile-postalCode ">' + item.postalCode + '</span>' +
							'<span class="store-tile-status ' + item.statusclass + '">' + item.status + '</span>' +
							displayButton +
							'</li>');
					}
				// no records
				} else {
					if (User.zip) {
						self.$storeList.append('<div class="no-results">No Results</div>');
					}
				}

				// set up pagination for results
				var storeTileWidth = 176,
					numListings = listings.find('li').size(),
					listingsNav = $('<div id="listings-nav"/>'),
					selectedButtonText;
				for (var j = 0, link = 1; j <= numListings; j++) {
					if (numListings > j) {
						listingsNav.append('<a data-index="' + j + '">' + link + '</a>');
					}
					link++;
					j = j + 2;
				}
				listingsNav.find('a').on('click', function () {
					$(this).siblings().removeClass('active');
					$(this).addClass('active');
					$('.store-list').animate({
						'left': storeTileWidth * $(this).data('index') * - 1
					}, 1000);
				}).first().addClass('active');
				self.$storeList.after(listingsNav);

				// check for preferred store id, highlight, move to top
				if (currentTemplate === 'cart') {
					selectedButtonText = Resources.SELECTED_STORE;
				} else {
					selectedButtonText = Resources.PREFERRED_STORE;
				}
				listings.find('.store-' + User.storeId).addClass('selected').find('.select-store-button ').text(selectedButtonText);

				self.bubbleStoreUp(listings, User.storeId);

				// if there is a block to show results on page (pdp)
				if (currentTemplate !== 'cart') {
					var onPageList = listings.clone(),
						$div = $('div#' + pid);
					$div.find('.store-list').remove();
					$div.append(onPageList);

					if (onPageList.find('li').size() > 1) {
						$div.find('li:gt(0)').each(function () {
							$(this).addClass('extended-list');
						});
						$('.more-stores').remove();
						$div.after('<span class="more-stores">' + Resources.SEE_MORE + '</span>');
						$div.parent().find('.more-stores').on('click', function () {
							if ($(this).text() ===  Resources.SEE_MORE) {
								$(this).text(Resources.SEE_LESS).addClass('active');
							} else {
								$(this).text(Resources.SEE_MORE).removeClass('active');
							}
							$div.find(' ul.store-list').toggleClass('expanded');
						});
					}
				}

				// update panel with new list
				listings.width(numListings * storeTileWidth).appendTo(self.$storeList);

				// set up 'set preferred store' action on new elements
				// @TODO this needs to be refactored
				listings.find('button.select-store-button').on('click', function () {
					var $this = $(this);
					var selectedStoreId = $this.val();
					if (currentTemplate === 'cart') {
						//update selected store and set the lineitem
						var liuuid = self.$preferredStorePanel.find('.srcitem').attr('value');
						$('div[name="' + liuuid + '-sp"] .selected-store-address').html(
							$this.siblings('.store-tile-address').text() +
							' <br />' +
							$this.siblings('.store-tile-city').text() +
							' , ' +
							$this.siblings('.store-tile-state').text() +
							' ' +
							$this.siblings('.store-tile-postalCode').text()
						);
						$('div[name="' + liuuid + '-sp"] .storeid').val($this.val());
						$('div[name="' + liuuid + '-sp"] .selected-store-availability').html($this.siblings('.store-tile-status'));
						$('div[name="' + liuuid + '-sp"] .radio-url').removeAttr('disabled');
						$('div[name="' + liuuid + '-sp"] .radio-url').click();
						self.$preferredStorePanel.dialog('close');
					} else {
						if (User.storeId !== selectedStoreId) {
							// set as selected
							self.setPreferredStore(selectedStoreId);
							self.bubbleStoreUp (onPageList, selectedStoreId);
							$('.store-list li.selected').removeClass('selected').find('.select-store-button').text(Resources.SELECT_STORE);
							$('.store-list li.store-' + selectedStoreId + ' .select-store-button').text(Resources.PREFERRED_STORE).parent().addClass('selected');
						}
					}
					//if there is a dialog box open in the cart for editing a pli and the user selected a new store
					//add an event to for a page refresh on the cart page if the update button has not been clicked
					//reason - the pli has been updated but the update button was not clicked, leaving the cart visually in accurate.
					//when the update button is clicked it forces a refresh.
					if ($('#cart-table').length > 0 && $('.select-store-button').length > 0) {
						$('.ui-dialog .ui-icon-closethick:first').bind('click', function () {
							page.refresh();
						});
					}
				});
			} // end ajax callback
		});
	},

	bubbleStoreUp: function (list, id) {
		var preferredEntry = list.find('li.store-' + id).clone();
		preferredEntry.removeClass('extended-list');
		list.find('.store-tile').not('extended-list').addClass('extended-list');
		list.find('.store-' + id).remove();
		list.prepend(preferredEntry);
	},

	loadPreferredStorePanel: function (pid) {
		var self = this;
		//clear error messages from other product tiles if they exists in the dom
		this.$preferredStorePanel.find('.error-message').remove();

		// clear any previous results
		this.$preferredStorePanel.empty();

		// show form if no zip set
		if (User.zip === null || User.zip === '') {
			this.$preferredStorePanel.append('<div><input type="text" id="userZip" class="entered-zip" placeholder="' +
					Resources.ENTER_ZIP +
					'"/><button id="set-user-zip" class="button-style-1">' +
					Resources.SEARCH +
					'</button></div>')
				.find('#set-user-zip').on('click', function () {
					var enteredZip = $('.ui-dialog #preferred-store-panel input.entered-zip').last().val();
					var regexObj = {
						canada: /^[ABCEGHJKLMNPRSTVXY]\d[ABCEGHJKLMNPRSTVWXYZ]( )?\d[ABCEGHJKLMNPRSTVWXYZ]\d$/i,
						usa: /^\d{5}(-\d{4})?$/
					};
					var validZipEntry = false;
					var regexp;
					//check Canadian postal code
					regexp = new RegExp(regexObj.canada);
					if (regexp.test(enteredZip)) {
						validZipEntry = true;
					}
					//check us zip codes
					regexp = new RegExp(regexObj.usa);
					if (regexp.test(enteredZip)) {
						validZipEntry = true;
					}
					//good zip
					if (validZipEntry) {
						$('#preferred-store-panel .error-message').remove();
						self.setUserZip(enteredZip);
						self.loadPreferredStorePanel(pid);
					//bad zip
					} else {
						if ($('#preferred-store-panel .error-message').length === 0) {
							$('#preferred-store-panel div').append('<div class="error-message">' + Resources.INVALID_ZIP + '</div>');
						}
					}
				});
			$('#userZip').on('keypress', function (e) {
				var code = e.keyCode ? e.keyCode : e.which;
				if (code.toString() === 13) {
					$('#set-user-zip').trigger('click');
				}
			});

			// clear any on-page results
			$('.store-stock .store-list').remove();
			$('.availability .more-stores').remove();

		// zip is set, build list
		} else {
			this.buildStoreList(pid);
			this.$preferredStorePanel
				.append('<div>For ' + User.zip + ' <span class="update-location">' + Resources.CHANGE_LOCATION + '</span></div>')
				.append(this.$storeList);
			this.$preferredStorePanel.find('.update-location').on('click', function () {
				this.setUserZip(null);
				this.loadPreferredStorePanel(pid);
			}.bind(this));
		}

		// append close button for pdp
		if (currentTemplate !== 'cart') {
			if (User.storeId !== null) {
				this.$preferredStorePanel.append('<button class="close button-style-1  set-preferred-store">' + Resources.CONTINUE_WITH_STORE + '</button>');
			} else if (User.zip !== null) {
				this.$preferredStorePanel.append('<button class="close button-style-1">' + Resources.CONTINUE + '</button>');
			}
		} else {
			this.$preferredStorePanel.append('<input type="hidden" class="srcitem" value="' + pid + '">');
		}

		// open the dialog
		this.$preferredStorePanel.dialog({
			width: 550,
			autoOpen: true,
			modal: true,
			title: Resources.STORE_NEAR_YOU
		});

		// action for close/continue
		$('.close').on('click', function () {
			this.$preferredStorePanel.dialog('close');
		}.bind(this));

		//remove the continue button if selecting a zipcode
		if (User.zip === null || User.zip === '') {
			this.$preferredStorePanel.find('.set-preferred-store').last().remove();
		}

		//disable continue button if a preferred store has not been selected
		if ($('.store-list .selected').length > 0) {
			this.$preferredStorePanel.find('.close').attr('disabled', false);
		} else {
			this.$preferredStorePanel.find('.close').attr('disabled', true);
		}
	},

	setUserZip: function (zip) {
		User.zip = zip;
		$.ajax({
			type: 'POST',
			url: Urls.setZipCode,
			data: {
				zipCode: zip
			}
		});
	},

	setPreferredStore: function (id) {
		User.storeId = id;
		$.post(Urls.setPreferredStore, {storeId: id}, function (data) {
			$('.selected-store-availability').html(data);
			//enable continue button when a preferred store has been selected
			$('#preferred-store-panel .close').attr('disabled', false);
		});
	},

	shippingLoad: function () {
		var $checkoutForm = $('.address');
		$checkoutForm.off('click');
		$checkoutForm.on('click', '.is-gift-yes, .is-gift-no', function () {
			$(this).parent().siblings('.gift-message-text').toggle($(this).checked);
		});
	}
};

module.exports = storeinventory;

},{"./ajax":2,"./page":13,"./util":47}],46:[function(require,module,exports){
'use strict';

/**
 * @function
 * @description Initializes the tooltip-content and layout
 */
exports.init = function () {
	$('.tooltip').tooltip({
		track: true,
		showURL: false,
		bodyHandler: function () {
			// add a data attribute of data-layout="some-class" to your tooltip-content container if you want a custom class
			var tooltipClass = '';
			if ($(this).find('.tooltip-content').data('layout')) {
				tooltipClass = ' class="' + $(this).find('.tooltip-content').data('layout') + '" ';
			}
		return '<div ' + tooltipClass + '>' + $(this).find('.tooltip-content').html() + '</div>';
		}
	});
};

},{}],47:[function(require,module,exports){
/* global Countries */

'use strict';

var util = {
	/**
	 * @function
	 * @description appends the parameter with the given name and value to the given url and returns the changed url
	 * @param {String} url the url to which the parameter will be added
	 * @param {String} name the name of the parameter
	 * @param {String} value the value of the parameter
	 */
	appendParamToURL: function (url, name, value) {
		// quit if the param already exists
		if (url.indexOf(name + '=') !== -1) {
			return url;
		}
		var separator = url.indexOf('?') !== -1 ? '&' : '?';
		return url + separator + name + '=' + encodeURIComponent(value);
	},
	/**
	 * @function
	 * @description
	 * @param {String}
	 * @param {String}
	 */
	elementInViewport: function (el, offsetToTop) {
		var top = el.offsetTop,
			left = el.offsetLeft,
			width = el.offsetWidth,
			height = el.offsetHeight;

		while (el.offsetParent) {
			el = el.offsetParent;
			top += el.offsetTop;
			left += el.offsetLeft;
		}

		if (typeof(offsetToTop) !== 'undefined') {
			top -= offsetToTop;
		}

		if (window.pageXOffset !== null) {
			return (
				top < (window.pageYOffset + window.innerHeight) &&
				left < (window.pageXOffset + window.innerWidth) &&
				(top + height) > window.pageYOffset &&
				(left + width) > window.pageXOffset
			);
		}

		if (document.compatMode === 'CSS1Compat') {
			return (
				top < (window.document.documentElement.scrollTop + window.document.documentElement.clientHeight) &&
				left < (window.document.documentElement.scrollLeft + window.document.documentElement.clientWidth) &&
				(top + height) > window.document.documentElement.scrollTop &&
				(left + width) > window.document.documentElement.scrollLeft
			);
		}
	},
	/**
	 * @function
	 * @description appends the parameters to the given url and returns the changed url
	 * @param {String} url the url to which the parameters will be added
	 * @param {String} params a JSON string with the parameters
	 */
	appendParamsToUrl: function (url, params) {
		var uri = this.getUri(url),
			includeHash = arguments.length < 3 ? false : arguments[2];

		var qsParams = $.extend(uri.queryParams, params);
		var result = uri.path + '?' + $.param(qsParams);
		if (includeHash) {
			result += uri.hash;
		}
		if (result.indexOf('http') < 0 && result.charAt(0) !== '/') {
			result = '/' + result;
		}
		return result;
	},

	/**
	 * @function
	 * @description Appends the parameter 'format=ajax' to a given path
	 * @param {String} path the relative path
	 */
	ajaxUrl: function (path) {
		return this.appendParamToURL(path, 'format', 'ajax');
	},

	/**
	 * @function
	 * @description
	 * @param {String} url
	 */
	toAbsoluteUrl: function (url) {
		if (url.indexOf('http') !== 0 && url.charAt(0) !== '/') {
			url = '/' + url;
		}
		return url;
	},
	/**
	 * @function
	 * @description Loads css dynamically from given urls
	 * @param {Array} urls Array of urls from which css will be dynamically loaded.
	 */
	loadDynamicCss: function (urls) {
		var i, len = urls.length;
		for (i = 0; i < len; i++) {
			this.loadedCssFiles.push(this.loadCssFile(urls[i]));
		}
	},

	/**
	 * @function
	 * @description Loads css file dynamically from given url
	 * @param {String} url The url from which css file will be dynamically loaded.
	 */
	loadCssFile: function (url) {
		return $('<link/>').appendTo($('head')).attr({
			type: 'text/css',
			rel: 'stylesheet'
		}).attr('href', url); // for i.e. <9, href must be added after link has been appended to head
	},
	// array to keep track of the dynamically loaded CSS files
	loadedCssFiles: [],

	/**
	 * @function
	 * @description Removes all css files which were dynamically loaded
	 */
	clearDynamicCss: function () {
		var i = this.loadedCssFiles.length;
		while (0 > i--) {
			$(this.loadedCssFiles[i]).remove();
		}
		this.loadedCssFiles = [];
	},
	/**
	 * @function
	 * @description Extracts all parameters from a given query string into an object
	 * @param {String} qs The query string from which the parameters will be extracted
	 */
	getQueryStringParams: function (qs) {
		if (!qs || qs.length === 0) { return {}; }
		var params = {},
			unescapedQS = decodeURIComponent(qs);
		// Use the String::replace method to iterate over each
		// name-value pair in the string.
		unescapedQS.replace(new RegExp('([^?=&]+)(=([^&]*))?', 'g'),
			function ($0, $1, $2, $3) {
				params[$1] = $3;
			}
		);
		return params;
	},
	/**
	 * @function
	 * @description Returns an URI-Object from a given element with the following properties:
	 * - protocol
	 * - host
	 * - hostname
	 * - port
	 * - path
	 * - query
	 * - queryParams
	 * - hash
	 * - url
	 * - urlWithQuery
	 * @param {Object} o The HTML-Element
	 */
	getUri: function (o) {
		var a;
		if (o.tagName && $(o).attr('href')) {
			a = o;
		} else if (typeof o === 'string') {
			a = document.createElement('a');
			a.href = o;
		} else {
			return null;
		}
		return {
			protocol: a.protocol, //http:
			host: a.host, //www.myexample.com
			hostname: a.hostname, //www.myexample.com'
			port: a.port, //:80
			path: a.pathname, // /sub1/sub2
			query: a.search, // ?param1=val1&param2=val2
			queryParams: a.search.length > 1 ? this.getQueryStringParams(a.search.substr(1)) : {},
			hash: a.hash, // #OU812,5150
			url: a.protocol + '//' + a.host + a.pathname,
			urlWithQuery: a.protocol + '//' + a.host + a.port + a.pathname + a.search
		};
	},

	fillAddressFields: function (address, $form) {
		for (var field in address) {
			if (field === 'ID' || field === 'UUID' || field === 'key') {
				continue;
			}
			// if the key in address object ends with 'Code', remove that suffix
			// keys that ends with 'Code' are postalCode, stateCode and countryCode
			$form.find('[name$="' + field.replace('Code', '') + '"]').val(address[field]);
			// update the state fields
			if (field === 'countryCode') {
				$form.find('[name$="country"]').trigger('change');
				// retrigger state selection after country has changed
				// this results in duplication of the state code, but is a necessary evil
				// for now because sometimes countryCode comes after stateCode
				$form.find('[name$="state"]').val(address.stateCode);
			}
		}
	},
	/**
	 * @function
	 * @description Updates the states options to a given country
	 * @param {String} countrySelect The selected country
	 */
	updateStateOptions: function (form) {
		var $form = $(form),
			$country = $form.find('select[id$="_country"]'),
			country = Countries[$country.val()];
		if ($country.length === 0 || !country) {
			return;
		}
		var arrHtml = [],
			$stateField = $country.data('stateField') ? $country.data('stateField') : $form.find('select[name$="_state"]'),
			$postalField = $country.data('postalField') ? $country.data('postalField') : $form.find('input[name$="_postal"]'),
			$stateLabel = ($stateField.length > 0) ? $form.find('label[for="' + $stateField[0].id + '"] span').not('.required-indicator') : undefined,
			$postalLabel = ($postalField.length > 0) ? $form.find('label[for="' + $postalField[0].id + '"] span').not('.required-indicator') : undefined,
			prevStateValue = $stateField.val();
		// set the label text
		if ($postalLabel) {
			$postalLabel.html(country.postalLabel);
		}
		if ($stateLabel) {
			$stateLabel.html(country.regionLabel);
		} else {
			return;
		}
		var s;
		for (s in country.regions) {
			arrHtml.push('<option value="' + s + '">' + country.regions[s] + '</option>');
		}
		// clone the empty option item and add to stateSelect
		var o1 = $stateField.children().first().clone();
		$stateField.html(arrHtml.join('')).removeAttr('disabled').children().first().before(o1);
		// if a state was selected previously, save that selection
		if (prevStateValue && $.inArray(prevStateValue, country.regions)) {
			$stateField.val(prevStateValue);
		} else {
			$stateField[0].selectedIndex = 0;
		}
	},
	/**
	 * @function
	 * @description Updates the number of the remaining character
	 * based on the character limit in a text area
	 */
	limitCharacters: function () {
		$('form').find('textarea[data-character-limit]').each(function () {
			var characterLimit = $(this).data('character-limit');
			var charCountHtml = String.format(Resources.CHAR_LIMIT_MSG,
				'<span class="char-remain-count">' + characterLimit + '</span>',
				'<span class="char-allowed-count">' + characterLimit + '</span>');
			var charCountContainer = $(this).next('div.char-count');
			if (charCountContainer.length === 0) {
				charCountContainer = $('<div class="char-count"/>').insertAfter($(this));
			}
			charCountContainer.html(charCountHtml);
			// trigger the keydown event so that any existing character data is calculated
			$(this).change();
		});
	},
	/**
	 * @function
	 * @description Binds the onclick-event to a delete button on a given container,
	 * which opens a confirmation box with a given message
	 * @param {String} container The name of element to which the function will be bind
	 * @param {String} message The message the will be shown upon a click
	 */
	setDeleteConfirmation: function (container, message) {
		$(container).on('click', '.delete', function () {
			return window.confirm(message);
		});
	},
	/**
	 * @function
	 * @description Scrolls a browser window to a given x point
	 * @param {String} The x coordinate
	 */
	scrollBrowser: function (xLocation) {
		$('html, body').animate({scrollTop: xLocation}, 500);
	},

	isMobile: function () {
		var mobileAgentHash = ['mobile', 'tablet', 'phone', 'ipad', 'ipod', 'android', 'blackberry', 'windows ce', 'opera mini', 'palm'];
		var	idx = 0;
		var isMobile = false;
		var userAgent = (navigator.userAgent).toLowerCase();

		while (mobileAgentHash[idx] && !isMobile) {
			isMobile = (userAgent.indexOf(mobileAgentHash[idx]) >= 0);
			idx++;
		}
		return isMobile;
	}
};

module.exports = util;

},{}],48:[function(require,module,exports){
'use strict';

var naPhone = /^\(?([2-9][0-8][0-9])\)?[\-\. ]?([2-9][0-9]{2})[\-\. ]?([0-9]{4})(\s*x[0-9]+)?$/,
	regex = {
		phone: {
			us: naPhone,
			ca: naPhone
		},
		postal: {
			us: /^\d{5}(-\d{4})?$/,
			ca: /^[ABCEGHJKLMNPRSTVXY]{1}\d{1}[A-Z]{1} *\d{1}[A-Z]{1}\d{1}$/,
			gb: /^GIR?0AA|[A-PR-UWYZ]([0-9]{1,2}|([A-HK-Y][0-9]|[A-HK-Y][0-9]([0-9]|[ABEHMNPRV-Y]))|[0-9][A-HJKS-UW])?[0-9][ABD-HJLNP-UW-Z]{2}$/
		},
		email: /^[\w.%+\-]+@[\w.\-]+\.[\w]{2,6}$/,
		notCC: /^(?!(([0-9 -]){13,19})).*$/
	},
	settings = {
		// global form validator settings
		errorClass: 'error',
		errorElement: 'span',
		onkeyup: false,
		onfocusout: function (element) {
			if (!this.checkable(element)) {
				this.element(element);
			}
		}
	};
/**
 * @function
 * @description Validates a given phone number against the countries phone regex
 * @param {String} value The phone number which will be validated
 * @param {String} el The input field
 */
var validatePhone = function (value, el) {
	var country = $(el).closest('form').find('.country');
	if (country.length === 0 || country.val().length === 0 || !regex.phone[country.val().toLowerCase()]) {
		return true;
	}

	var rgx = regex.phone[country.val().toLowerCase()];
	var isOptional = this.optional(el);
	var isValid = rgx.test($.trim(value));

	return isOptional || isValid;
};
/**
 * @function
 * @description Validates a given email
 * @param {String} value The email which will be validated
 * @param {String} el The input field
 */
var validateEmail = function (value, el) {
	var isOptional = this.optional(el);
	var isValid = regex.email.test($.trim(value));
	return isOptional || isValid;
};

/**
 * @function
 * @description Validates that a credit card owner is not a Credit card number
 * @param {String} value The owner field which will be validated
 * @param {String} el The input field
 */
var validateOwner = function (value) {
	var isValid = regex.notCC.test($.trim(value));
	return isValid;
};

/**
 * Add phone validation method to jQuery validation plugin.
 * Text fields must have 'phone' css class to be validated as phone
 */
$.validator.addMethod('phone', validatePhone, Resources.INVALID_PHONE);

/**
 * Add email validation method to jQuery validation plugin.
 * Text fields must have 'email' css class to be validated as email
 */
$.validator.addMethod('email', validateEmail, Resources.INVALID_EMAIL);

/**
 * Add CCOwner validation method to jQuery validation plugin.
 * Text fields must have 'owner' css class to be validated as not a credit card
 */
$.validator.addMethod('owner', validateOwner, Resources.INVALID_OWNER);

/**
 * Add gift cert amount validation method to jQuery validation plugin.
 * Text fields must have 'gift-cert-amont' css class to be validated
 */
$.validator.addMethod('gift-cert-amount', function (value, el) {
	var isOptional = this.optional(el);
	var isValid = (!isNaN(value)) && (parseFloat(value) >= 5) && (parseFloat(value) <= 5000);
	return isOptional || isValid;
}, Resources.GIFT_CERT_AMOUNT_INVALID);

/**
 * Add positive number validation method to jQuery validation plugin.
 * Text fields must have 'positivenumber' css class to be validated as positivenumber
 */
$.validator.addMethod('positivenumber', function (value) {
	if ($.trim(value).length === 0) { return true; }
	return (!isNaN(value) && Number(value) >= 0);
}, ''); // '' should be replaced with error message if needed

var validator = {
	regex: regex,
	settings: settings,
	init: function () {
		var self = this;
		$('form:not(.suppress)').each(function () {
			$(this).validate(self.settings);
		});
	},
	initForm: function (f) {
		$(f).validate(this.settings);
	}
};

module.exports = validator;

},{}],49:[function(require,module,exports){
// shim for using process in browser

var process = module.exports = {};

process.nextTick = (function () {
    var canSetImmediate = typeof window !== 'undefined'
    && window.setImmediate;
    var canMutationObserver = typeof window !== 'undefined'
    && window.MutationObserver;
    var canPost = typeof window !== 'undefined'
    && window.postMessage && window.addEventListener
    ;

    if (canSetImmediate) {
        return function (f) { return window.setImmediate(f) };
    }

    var queue = [];

    if (canMutationObserver) {
        var hiddenDiv = document.createElement("div");
        var observer = new MutationObserver(function () {
            var queueList = queue.slice();
            queue.length = 0;
            queueList.forEach(function (fn) {
                fn();
            });
        });

        observer.observe(hiddenDiv, { attributes: true });

        return function nextTick(fn) {
            if (!queue.length) {
                hiddenDiv.setAttribute('yes', 'no');
            }
            queue.push(fn);
        };
    }

    if (canPost) {
        window.addEventListener('message', function (ev) {
            var source = ev.source;
            if ((source === window || source === null) && ev.data === 'process-tick') {
                ev.stopPropagation();
                if (queue.length > 0) {
                    var fn = queue.shift();
                    fn();
                }
            }
        }, true);

        return function nextTick(fn) {
            queue.push(fn);
            window.postMessage('process-tick', '*');
        };
    }

    return function nextTick(fn) {
        setTimeout(fn, 0);
    };
})();

process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};


process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};

},{}],50:[function(require,module,exports){
/*!
 * imagesLoaded v3.1.8
 * JavaScript is all like "You images are done yet or what?"
 * MIT License
 */

( function( window, factory ) { 'use strict';
  // universal module definition

  /*global define: false, module: false, require: false */

  if ( typeof define === 'function' && define.amd ) {
    // AMD
    define( [
      'eventEmitter/EventEmitter',
      'eventie/eventie'
    ], function( EventEmitter, eventie ) {
      return factory( window, EventEmitter, eventie );
    });
  } else if ( typeof exports === 'object' ) {
    // CommonJS
    module.exports = factory(
      window,
      require('wolfy87-eventemitter'),
      require('eventie')
    );
  } else {
    // browser global
    window.imagesLoaded = factory(
      window,
      window.EventEmitter,
      window.eventie
    );
  }

})( window,

// --------------------------  factory -------------------------- //

function factory( window, EventEmitter, eventie ) {

'use strict';

var $ = window.jQuery;
var console = window.console;
var hasConsole = typeof console !== 'undefined';

// -------------------------- helpers -------------------------- //

// extend objects
function extend( a, b ) {
  for ( var prop in b ) {
    a[ prop ] = b[ prop ];
  }
  return a;
}

var objToString = Object.prototype.toString;
function isArray( obj ) {
  return objToString.call( obj ) === '[object Array]';
}

// turn element or nodeList into an array
function makeArray( obj ) {
  var ary = [];
  if ( isArray( obj ) ) {
    // use object if already an array
    ary = obj;
  } else if ( typeof obj.length === 'number' ) {
    // convert nodeList to array
    for ( var i=0, len = obj.length; i < len; i++ ) {
      ary.push( obj[i] );
    }
  } else {
    // array of single index
    ary.push( obj );
  }
  return ary;
}

  // -------------------------- imagesLoaded -------------------------- //

  /**
   * @param {Array, Element, NodeList, String} elem
   * @param {Object or Function} options - if function, use as callback
   * @param {Function} onAlways - callback function
   */
  function ImagesLoaded( elem, options, onAlways ) {
    // coerce ImagesLoaded() without new, to be new ImagesLoaded()
    if ( !( this instanceof ImagesLoaded ) ) {
      return new ImagesLoaded( elem, options );
    }
    // use elem as selector string
    if ( typeof elem === 'string' ) {
      elem = document.querySelectorAll( elem );
    }

    this.elements = makeArray( elem );
    this.options = extend( {}, this.options );

    if ( typeof options === 'function' ) {
      onAlways = options;
    } else {
      extend( this.options, options );
    }

    if ( onAlways ) {
      this.on( 'always', onAlways );
    }

    this.getImages();

    if ( $ ) {
      // add jQuery Deferred object
      this.jqDeferred = new $.Deferred();
    }

    // HACK check async to allow time to bind listeners
    var _this = this;
    setTimeout( function() {
      _this.check();
    });
  }

  ImagesLoaded.prototype = new EventEmitter();

  ImagesLoaded.prototype.options = {};

  ImagesLoaded.prototype.getImages = function() {
    this.images = [];

    // filter & find items if we have an item selector
    for ( var i=0, len = this.elements.length; i < len; i++ ) {
      var elem = this.elements[i];
      // filter siblings
      if ( elem.nodeName === 'IMG' ) {
        this.addImage( elem );
      }
      // find children
      // no non-element nodes, #143
      var nodeType = elem.nodeType;
      if ( !nodeType || !( nodeType === 1 || nodeType === 9 || nodeType === 11 ) ) {
        continue;
      }
      var childElems = elem.querySelectorAll('img');
      // concat childElems to filterFound array
      for ( var j=0, jLen = childElems.length; j < jLen; j++ ) {
        var img = childElems[j];
        this.addImage( img );
      }
    }
  };

  /**
   * @param {Image} img
   */
  ImagesLoaded.prototype.addImage = function( img ) {
    var loadingImage = new LoadingImage( img );
    this.images.push( loadingImage );
  };

  ImagesLoaded.prototype.check = function() {
    var _this = this;
    var checkedCount = 0;
    var length = this.images.length;
    this.hasAnyBroken = false;
    // complete if no images
    if ( !length ) {
      this.complete();
      return;
    }

    function onConfirm( image, message ) {
      if ( _this.options.debug && hasConsole ) {
        console.log( 'confirm', image, message );
      }

      _this.progress( image );
      checkedCount++;
      if ( checkedCount === length ) {
        _this.complete();
      }
      return true; // bind once
    }

    for ( var i=0; i < length; i++ ) {
      var loadingImage = this.images[i];
      loadingImage.on( 'confirm', onConfirm );
      loadingImage.check();
    }
  };

  ImagesLoaded.prototype.progress = function( image ) {
    this.hasAnyBroken = this.hasAnyBroken || !image.isLoaded;
    // HACK - Chrome triggers event before object properties have changed. #83
    var _this = this;
    setTimeout( function() {
      _this.emit( 'progress', _this, image );
      if ( _this.jqDeferred && _this.jqDeferred.notify ) {
        _this.jqDeferred.notify( _this, image );
      }
    });
  };

  ImagesLoaded.prototype.complete = function() {
    var eventName = this.hasAnyBroken ? 'fail' : 'done';
    this.isComplete = true;
    var _this = this;
    // HACK - another setTimeout so that confirm happens after progress
    setTimeout( function() {
      _this.emit( eventName, _this );
      _this.emit( 'always', _this );
      if ( _this.jqDeferred ) {
        var jqMethod = _this.hasAnyBroken ? 'reject' : 'resolve';
        _this.jqDeferred[ jqMethod ]( _this );
      }
    });
  };

  // -------------------------- jquery -------------------------- //

  if ( $ ) {
    $.fn.imagesLoaded = function( options, callback ) {
      var instance = new ImagesLoaded( this, options, callback );
      return instance.jqDeferred.promise( $(this) );
    };
  }


  // --------------------------  -------------------------- //

  function LoadingImage( img ) {
    this.img = img;
  }

  LoadingImage.prototype = new EventEmitter();

  LoadingImage.prototype.check = function() {
    // first check cached any previous images that have same src
    var resource = cache[ this.img.src ] || new Resource( this.img.src );
    if ( resource.isConfirmed ) {
      this.confirm( resource.isLoaded, 'cached was confirmed' );
      return;
    }

    // If complete is true and browser supports natural sizes,
    // try to check for image status manually.
    if ( this.img.complete && this.img.naturalWidth !== undefined ) {
      // report based on naturalWidth
      this.confirm( this.img.naturalWidth !== 0, 'naturalWidth' );
      return;
    }

    // If none of the checks above matched, simulate loading on detached element.
    var _this = this;
    resource.on( 'confirm', function( resrc, message ) {
      _this.confirm( resrc.isLoaded, message );
      return true;
    });

    resource.check();
  };

  LoadingImage.prototype.confirm = function( isLoaded, message ) {
    this.isLoaded = isLoaded;
    this.emit( 'confirm', this, message );
  };

  // -------------------------- Resource -------------------------- //

  // Resource checks each src, only once
  // separate class from LoadingImage to prevent memory leaks. See #115

  var cache = {};

  function Resource( src ) {
    this.src = src;
    // add to cache
    cache[ src ] = this;
  }

  Resource.prototype = new EventEmitter();

  Resource.prototype.check = function() {
    // only trigger checking once
    if ( this.isChecked ) {
      return;
    }
    // simulate loading on detached element
    var proxyImage = new Image();
    eventie.bind( proxyImage, 'load', this );
    eventie.bind( proxyImage, 'error', this );
    proxyImage.src = this.src;
    // set flag
    this.isChecked = true;
  };

  // ----- events ----- //

  // trigger specified handler for event type
  Resource.prototype.handleEvent = function( event ) {
    var method = 'on' + event.type;
    if ( this[ method ] ) {
      this[ method ]( event );
    }
  };

  Resource.prototype.onload = function( event ) {
    this.confirm( true, 'onload' );
    this.unbindProxyEvents( event );
  };

  Resource.prototype.onerror = function( event ) {
    this.confirm( false, 'onerror' );
    this.unbindProxyEvents( event );
  };

  // ----- confirm ----- //

  Resource.prototype.confirm = function( isLoaded, message ) {
    this.isConfirmed = true;
    this.isLoaded = isLoaded;
    this.emit( 'confirm', this, message );
  };

  Resource.prototype.unbindProxyEvents = function( event ) {
    eventie.unbind( event.target, 'load', this );
    eventie.unbind( event.target, 'error', this );
  };

  // -----  ----- //

  return ImagesLoaded;

});

},{"eventie":51,"wolfy87-eventemitter":52}],51:[function(require,module,exports){
/*!
 * eventie v1.0.5
 * event binding helper
 *   eventie.bind( elem, 'click', myFn )
 *   eventie.unbind( elem, 'click', myFn )
 * MIT license
 */

/*jshint browser: true, undef: true, unused: true */
/*global define: false, module: false */

( function( window ) {

'use strict';

var docElem = document.documentElement;

var bind = function() {};

function getIEEvent( obj ) {
  var event = window.event;
  // add event.target
  event.target = event.target || event.srcElement || obj;
  return event;
}

if ( docElem.addEventListener ) {
  bind = function( obj, type, fn ) {
    obj.addEventListener( type, fn, false );
  };
} else if ( docElem.attachEvent ) {
  bind = function( obj, type, fn ) {
    obj[ type + fn ] = fn.handleEvent ?
      function() {
        var event = getIEEvent( obj );
        fn.handleEvent.call( fn, event );
      } :
      function() {
        var event = getIEEvent( obj );
        fn.call( obj, event );
      };
    obj.attachEvent( "on" + type, obj[ type + fn ] );
  };
}

var unbind = function() {};

if ( docElem.removeEventListener ) {
  unbind = function( obj, type, fn ) {
    obj.removeEventListener( type, fn, false );
  };
} else if ( docElem.detachEvent ) {
  unbind = function( obj, type, fn ) {
    obj.detachEvent( "on" + type, obj[ type + fn ] );
    try {
      delete obj[ type + fn ];
    } catch ( err ) {
      // can't delete window object properties
      obj[ type + fn ] = undefined;
    }
  };
}

var eventie = {
  bind: bind,
  unbind: unbind
};

// ----- module definition ----- //

if ( typeof define === 'function' && define.amd ) {
  // AMD
  define( eventie );
} else if ( typeof exports === 'object' ) {
  // CommonJS
  module.exports = eventie;
} else {
  // browser global
  window.eventie = eventie;
}

})( this );

},{}],52:[function(require,module,exports){
/*!
 * EventEmitter v4.2.9 - git.io/ee
 * Oliver Caldwell
 * MIT license
 * @preserve
 */

(function () {
    'use strict';

    /**
     * Class for managing events.
     * Can be extended to provide event functionality in other classes.
     *
     * @class EventEmitter Manages event registering and emitting.
     */
    function EventEmitter() {}

    // Shortcuts to improve speed and size
    var proto = EventEmitter.prototype;
    var exports = this;
    var originalGlobalValue = exports.EventEmitter;

    /**
     * Finds the index of the listener for the event in its storage array.
     *
     * @param {Function[]} listeners Array of listeners to search through.
     * @param {Function} listener Method to look for.
     * @return {Number} Index of the specified listener, -1 if not found
     * @api private
     */
    function indexOfListener(listeners, listener) {
        var i = listeners.length;
        while (i--) {
            if (listeners[i].listener === listener) {
                return i;
            }
        }

        return -1;
    }

    /**
     * Alias a method while keeping the context correct, to allow for overwriting of target method.
     *
     * @param {String} name The name of the target method.
     * @return {Function} The aliased method
     * @api private
     */
    function alias(name) {
        return function aliasClosure() {
            return this[name].apply(this, arguments);
        };
    }

    /**
     * Returns the listener array for the specified event.
     * Will initialise the event object and listener arrays if required.
     * Will return an object if you use a regex search. The object contains keys for each matched event. So /ba[rz]/ might return an object containing bar and baz. But only if you have either defined them with defineEvent or added some listeners to them.
     * Each property in the object response is an array of listener functions.
     *
     * @param {String|RegExp} evt Name of the event to return the listeners from.
     * @return {Function[]|Object} All listener functions for the event.
     */
    proto.getListeners = function getListeners(evt) {
        var events = this._getEvents();
        var response;
        var key;

        // Return a concatenated array of all matching events if
        // the selector is a regular expression.
        if (evt instanceof RegExp) {
            response = {};
            for (key in events) {
                if (events.hasOwnProperty(key) && evt.test(key)) {
                    response[key] = events[key];
                }
            }
        }
        else {
            response = events[evt] || (events[evt] = []);
        }

        return response;
    };

    /**
     * Takes a list of listener objects and flattens it into a list of listener functions.
     *
     * @param {Object[]} listeners Raw listener objects.
     * @return {Function[]} Just the listener functions.
     */
    proto.flattenListeners = function flattenListeners(listeners) {
        var flatListeners = [];
        var i;

        for (i = 0; i < listeners.length; i += 1) {
            flatListeners.push(listeners[i].listener);
        }

        return flatListeners;
    };

    /**
     * Fetches the requested listeners via getListeners but will always return the results inside an object. This is mainly for internal use but others may find it useful.
     *
     * @param {String|RegExp} evt Name of the event to return the listeners from.
     * @return {Object} All listener functions for an event in an object.
     */
    proto.getListenersAsObject = function getListenersAsObject(evt) {
        var listeners = this.getListeners(evt);
        var response;

        if (listeners instanceof Array) {
            response = {};
            response[evt] = listeners;
        }

        return response || listeners;
    };

    /**
     * Adds a listener function to the specified event.
     * The listener will not be added if it is a duplicate.
     * If the listener returns true then it will be removed after it is called.
     * If you pass a regular expression as the event name then the listener will be added to all events that match it.
     *
     * @param {String|RegExp} evt Name of the event to attach the listener to.
     * @param {Function} listener Method to be called when the event is emitted. If the function returns true then it will be removed after calling.
     * @return {Object} Current instance of EventEmitter for chaining.
     */
    proto.addListener = function addListener(evt, listener) {
        var listeners = this.getListenersAsObject(evt);
        var listenerIsWrapped = typeof listener === 'object';
        var key;

        for (key in listeners) {
            if (listeners.hasOwnProperty(key) && indexOfListener(listeners[key], listener) === -1) {
                listeners[key].push(listenerIsWrapped ? listener : {
                    listener: listener,
                    once: false
                });
            }
        }

        return this;
    };

    /**
     * Alias of addListener
     */
    proto.on = alias('addListener');

    /**
     * Semi-alias of addListener. It will add a listener that will be
     * automatically removed after its first execution.
     *
     * @param {String|RegExp} evt Name of the event to attach the listener to.
     * @param {Function} listener Method to be called when the event is emitted. If the function returns true then it will be removed after calling.
     * @return {Object} Current instance of EventEmitter for chaining.
     */
    proto.addOnceListener = function addOnceListener(evt, listener) {
        return this.addListener(evt, {
            listener: listener,
            once: true
        });
    };

    /**
     * Alias of addOnceListener.
     */
    proto.once = alias('addOnceListener');

    /**
     * Defines an event name. This is required if you want to use a regex to add a listener to multiple events at once. If you don't do this then how do you expect it to know what event to add to? Should it just add to every possible match for a regex? No. That is scary and bad.
     * You need to tell it what event names should be matched by a regex.
     *
     * @param {String} evt Name of the event to create.
     * @return {Object} Current instance of EventEmitter for chaining.
     */
    proto.defineEvent = function defineEvent(evt) {
        this.getListeners(evt);
        return this;
    };

    /**
     * Uses defineEvent to define multiple events.
     *
     * @param {String[]} evts An array of event names to define.
     * @return {Object} Current instance of EventEmitter for chaining.
     */
    proto.defineEvents = function defineEvents(evts) {
        for (var i = 0; i < evts.length; i += 1) {
            this.defineEvent(evts[i]);
        }
        return this;
    };

    /**
     * Removes a listener function from the specified event.
     * When passed a regular expression as the event name, it will remove the listener from all events that match it.
     *
     * @param {String|RegExp} evt Name of the event to remove the listener from.
     * @param {Function} listener Method to remove from the event.
     * @return {Object} Current instance of EventEmitter for chaining.
     */
    proto.removeListener = function removeListener(evt, listener) {
        var listeners = this.getListenersAsObject(evt);
        var index;
        var key;

        for (key in listeners) {
            if (listeners.hasOwnProperty(key)) {
                index = indexOfListener(listeners[key], listener);

                if (index !== -1) {
                    listeners[key].splice(index, 1);
                }
            }
        }

        return this;
    };

    /**
     * Alias of removeListener
     */
    proto.off = alias('removeListener');

    /**
     * Adds listeners in bulk using the manipulateListeners method.
     * If you pass an object as the second argument you can add to multiple events at once. The object should contain key value pairs of events and listeners or listener arrays. You can also pass it an event name and an array of listeners to be added.
     * You can also pass it a regular expression to add the array of listeners to all events that match it.
     * Yeah, this function does quite a bit. That's probably a bad thing.
     *
     * @param {String|Object|RegExp} evt An event name if you will pass an array of listeners next. An object if you wish to add to multiple events at once.
     * @param {Function[]} [listeners] An optional array of listener functions to add.
     * @return {Object} Current instance of EventEmitter for chaining.
     */
    proto.addListeners = function addListeners(evt, listeners) {
        // Pass through to manipulateListeners
        return this.manipulateListeners(false, evt, listeners);
    };

    /**
     * Removes listeners in bulk using the manipulateListeners method.
     * If you pass an object as the second argument you can remove from multiple events at once. The object should contain key value pairs of events and listeners or listener arrays.
     * You can also pass it an event name and an array of listeners to be removed.
     * You can also pass it a regular expression to remove the listeners from all events that match it.
     *
     * @param {String|Object|RegExp} evt An event name if you will pass an array of listeners next. An object if you wish to remove from multiple events at once.
     * @param {Function[]} [listeners] An optional array of listener functions to remove.
     * @return {Object} Current instance of EventEmitter for chaining.
     */
    proto.removeListeners = function removeListeners(evt, listeners) {
        // Pass through to manipulateListeners
        return this.manipulateListeners(true, evt, listeners);
    };

    /**
     * Edits listeners in bulk. The addListeners and removeListeners methods both use this to do their job. You should really use those instead, this is a little lower level.
     * The first argument will determine if the listeners are removed (true) or added (false).
     * If you pass an object as the second argument you can add/remove from multiple events at once. The object should contain key value pairs of events and listeners or listener arrays.
     * You can also pass it an event name and an array of listeners to be added/removed.
     * You can also pass it a regular expression to manipulate the listeners of all events that match it.
     *
     * @param {Boolean} remove True if you want to remove listeners, false if you want to add.
     * @param {String|Object|RegExp} evt An event name if you will pass an array of listeners next. An object if you wish to add/remove from multiple events at once.
     * @param {Function[]} [listeners] An optional array of listener functions to add/remove.
     * @return {Object} Current instance of EventEmitter for chaining.
     */
    proto.manipulateListeners = function manipulateListeners(remove, evt, listeners) {
        var i;
        var value;
        var single = remove ? this.removeListener : this.addListener;
        var multiple = remove ? this.removeListeners : this.addListeners;

        // If evt is an object then pass each of its properties to this method
        if (typeof evt === 'object' && !(evt instanceof RegExp)) {
            for (i in evt) {
                if (evt.hasOwnProperty(i) && (value = evt[i])) {
                    // Pass the single listener straight through to the singular method
                    if (typeof value === 'function') {
                        single.call(this, i, value);
                    }
                    else {
                        // Otherwise pass back to the multiple function
                        multiple.call(this, i, value);
                    }
                }
            }
        }
        else {
            // So evt must be a string
            // And listeners must be an array of listeners
            // Loop over it and pass each one to the multiple method
            i = listeners.length;
            while (i--) {
                single.call(this, evt, listeners[i]);
            }
        }

        return this;
    };

    /**
     * Removes all listeners from a specified event.
     * If you do not specify an event then all listeners will be removed.
     * That means every event will be emptied.
     * You can also pass a regex to remove all events that match it.
     *
     * @param {String|RegExp} [evt] Optional name of the event to remove all listeners for. Will remove from every event if not passed.
     * @return {Object} Current instance of EventEmitter for chaining.
     */
    proto.removeEvent = function removeEvent(evt) {
        var type = typeof evt;
        var events = this._getEvents();
        var key;

        // Remove different things depending on the state of evt
        if (type === 'string') {
            // Remove all listeners for the specified event
            delete events[evt];
        }
        else if (evt instanceof RegExp) {
            // Remove all events matching the regex.
            for (key in events) {
                if (events.hasOwnProperty(key) && evt.test(key)) {
                    delete events[key];
                }
            }
        }
        else {
            // Remove all listeners in all events
            delete this._events;
        }

        return this;
    };

    /**
     * Alias of removeEvent.
     *
     * Added to mirror the node API.
     */
    proto.removeAllListeners = alias('removeEvent');

    /**
     * Emits an event of your choice.
     * When emitted, every listener attached to that event will be executed.
     * If you pass the optional argument array then those arguments will be passed to every listener upon execution.
     * Because it uses `apply`, your array of arguments will be passed as if you wrote them out separately.
     * So they will not arrive within the array on the other side, they will be separate.
     * You can also pass a regular expression to emit to all events that match it.
     *
     * @param {String|RegExp} evt Name of the event to emit and execute listeners for.
     * @param {Array} [args] Optional array of arguments to be passed to each listener.
     * @return {Object} Current instance of EventEmitter for chaining.
     */
    proto.emitEvent = function emitEvent(evt, args) {
        var listeners = this.getListenersAsObject(evt);
        var listener;
        var i;
        var key;
        var response;

        for (key in listeners) {
            if (listeners.hasOwnProperty(key)) {
                i = listeners[key].length;

                while (i--) {
                    // If the listener returns true then it shall be removed from the event
                    // The function is executed either with a basic call or an apply if there is an args array
                    listener = listeners[key][i];

                    if (listener.once === true) {
                        this.removeListener(evt, listener.listener);
                    }

                    response = listener.listener.apply(this, args || []);

                    if (response === this._getOnceReturnValue()) {
                        this.removeListener(evt, listener.listener);
                    }
                }
            }
        }

        return this;
    };

    /**
     * Alias of emitEvent
     */
    proto.trigger = alias('emitEvent');

    /**
     * Subtly different from emitEvent in that it will pass its arguments on to the listeners, as opposed to taking a single array of arguments to pass on.
     * As with emitEvent, you can pass a regex in place of the event name to emit to all events that match it.
     *
     * @param {String|RegExp} evt Name of the event to emit and execute listeners for.
     * @param {...*} Optional additional arguments to be passed to each listener.
     * @return {Object} Current instance of EventEmitter for chaining.
     */
    proto.emit = function emit(evt) {
        var args = Array.prototype.slice.call(arguments, 1);
        return this.emitEvent(evt, args);
    };

    /**
     * Sets the current value to check against when executing listeners. If a
     * listeners return value matches the one set here then it will be removed
     * after execution. This value defaults to true.
     *
     * @param {*} value The new value to check for when executing listeners.
     * @return {Object} Current instance of EventEmitter for chaining.
     */
    proto.setOnceReturnValue = function setOnceReturnValue(value) {
        this._onceReturnValue = value;
        return this;
    };

    /**
     * Fetches the current value to check against when executing listeners. If
     * the listeners return value matches this one then it should be removed
     * automatically. It will return true by default.
     *
     * @return {*|Boolean} The current value to check for or the default, true.
     * @api private
     */
    proto._getOnceReturnValue = function _getOnceReturnValue() {
        if (this.hasOwnProperty('_onceReturnValue')) {
            return this._onceReturnValue;
        }
        else {
            return true;
        }
    };

    /**
     * Fetches the events object and creates one if required.
     *
     * @return {Object} The events storage object.
     * @api private
     */
    proto._getEvents = function _getEvents() {
        return this._events || (this._events = {});
    };

    /**
     * Reverts the global {@link EventEmitter} to its previous value and returns a reference to this version.
     *
     * @return {Function} Non conflicting EventEmitter class.
     */
    EventEmitter.noConflict = function noConflict() {
        exports.EventEmitter = originalGlobalValue;
        return EventEmitter;
    };

    // Expose the class either via AMD, CommonJS or the global object
    if (typeof define === 'function' && define.amd) {
        define(function () {
            return EventEmitter;
        });
    }
    else if (typeof module === 'object' && module.exports){
        module.exports = EventEmitter;
    }
    else {
        exports.EventEmitter = EventEmitter;
    }
}.call(this));

},{}],53:[function(require,module,exports){
(function (global){
/**
 * @license
 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
 * Build: `lodash modern -o ./dist/lodash.js`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */
;(function() {

  /** Used as a safe reference for `undefined` in pre ES5 environments */
  var undefined;

  /** Used to pool arrays and objects used internally */
  var arrayPool = [],
      objectPool = [];

  /** Used to generate unique IDs */
  var idCounter = 0;

  /** Used to prefix keys to avoid issues with `__proto__` and properties on `Object.prototype` */
  var keyPrefix = +new Date + '';

  /** Used as the size when optimizations are enabled for large arrays */
  var largeArraySize = 75;

  /** Used as the max size of the `arrayPool` and `objectPool` */
  var maxPoolSize = 40;

  /** Used to detect and test whitespace */
  var whitespace = (
    // whitespace
    ' \t\x0B\f\xA0\ufeff' +

    // line terminators
    '\n\r\u2028\u2029' +

    // unicode category "Zs" space separators
    '\u1680\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u202f\u205f\u3000'
  );

  /** Used to match empty string literals in compiled template source */
  var reEmptyStringLeading = /\b__p \+= '';/g,
      reEmptyStringMiddle = /\b(__p \+=) '' \+/g,
      reEmptyStringTrailing = /(__e\(.*?\)|\b__t\)) \+\n'';/g;

  /**
   * Used to match ES6 template delimiters
   * http://people.mozilla.org/~jorendorff/es6-draft.html#sec-literals-string-literals
   */
  var reEsTemplate = /\$\{([^\\}]*(?:\\.[^\\}]*)*)\}/g;

  /** Used to match regexp flags from their coerced string values */
  var reFlags = /\w*$/;

  /** Used to detected named functions */
  var reFuncName = /^\s*function[ \n\r\t]+\w/;

  /** Used to match "interpolate" template delimiters */
  var reInterpolate = /<%=([\s\S]+?)%>/g;

  /** Used to match leading whitespace and zeros to be removed */
  var reLeadingSpacesAndZeros = RegExp('^[' + whitespace + ']*0+(?=.$)');

  /** Used to ensure capturing order of template delimiters */
  var reNoMatch = /($^)/;

  /** Used to detect functions containing a `this` reference */
  var reThis = /\bthis\b/;

  /** Used to match unescaped characters in compiled string literals */
  var reUnescapedString = /['\n\r\t\u2028\u2029\\]/g;

  /** Used to assign default `context` object properties */
  var contextProps = [
    'Array', 'Boolean', 'Date', 'Function', 'Math', 'Number', 'Object',
    'RegExp', 'String', '_', 'attachEvent', 'clearTimeout', 'isFinite', 'isNaN',
    'parseInt', 'setTimeout'
  ];

  /** Used to make template sourceURLs easier to identify */
  var templateCounter = 0;

  /** `Object#toString` result shortcuts */
  var argsClass = '[object Arguments]',
      arrayClass = '[object Array]',
      boolClass = '[object Boolean]',
      dateClass = '[object Date]',
      funcClass = '[object Function]',
      numberClass = '[object Number]',
      objectClass = '[object Object]',
      regexpClass = '[object RegExp]',
      stringClass = '[object String]';

  /** Used to identify object classifications that `_.clone` supports */
  var cloneableClasses = {};
  cloneableClasses[funcClass] = false;
  cloneableClasses[argsClass] = cloneableClasses[arrayClass] =
  cloneableClasses[boolClass] = cloneableClasses[dateClass] =
  cloneableClasses[numberClass] = cloneableClasses[objectClass] =
  cloneableClasses[regexpClass] = cloneableClasses[stringClass] = true;

  /** Used as an internal `_.debounce` options object */
  var debounceOptions = {
    'leading': false,
    'maxWait': 0,
    'trailing': false
  };

  /** Used as the property descriptor for `__bindData__` */
  var descriptor = {
    'configurable': false,
    'enumerable': false,
    'value': null,
    'writable': false
  };

  /** Used to determine if values are of the language type Object */
  var objectTypes = {
    'boolean': false,
    'function': true,
    'object': true,
    'number': false,
    'string': false,
    'undefined': false
  };

  /** Used to escape characters for inclusion in compiled string literals */
  var stringEscapes = {
    '\\': '\\',
    "'": "'",
    '\n': 'n',
    '\r': 'r',
    '\t': 't',
    '\u2028': 'u2028',
    '\u2029': 'u2029'
  };

  /** Used as a reference to the global object */
  var root = (objectTypes[typeof window] && window) || this;

  /** Detect free variable `exports` */
  var freeExports = objectTypes[typeof exports] && exports && !exports.nodeType && exports;

  /** Detect free variable `module` */
  var freeModule = objectTypes[typeof module] && module && !module.nodeType && module;

  /** Detect the popular CommonJS extension `module.exports` */
  var moduleExports = freeModule && freeModule.exports === freeExports && freeExports;

  /** Detect free variable `global` from Node.js or Browserified code and use it as `root` */
  var freeGlobal = objectTypes[typeof global] && global;
  if (freeGlobal && (freeGlobal.global === freeGlobal || freeGlobal.window === freeGlobal)) {
    root = freeGlobal;
  }

  /*--------------------------------------------------------------------------*/

  /**
   * The base implementation of `_.indexOf` without support for binary searches
   * or `fromIndex` constraints.
   *
   * @private
   * @param {Array} array The array to search.
   * @param {*} value The value to search for.
   * @param {number} [fromIndex=0] The index to search from.
   * @returns {number} Returns the index of the matched value or `-1`.
   */
  function baseIndexOf(array, value, fromIndex) {
    var index = (fromIndex || 0) - 1,
        length = array ? array.length : 0;

    while (++index < length) {
      if (array[index] === value) {
        return index;
      }
    }
    return -1;
  }

  /**
   * An implementation of `_.contains` for cache objects that mimics the return
   * signature of `_.indexOf` by returning `0` if the value is found, else `-1`.
   *
   * @private
   * @param {Object} cache The cache object to inspect.
   * @param {*} value The value to search for.
   * @returns {number} Returns `0` if `value` is found, else `-1`.
   */
  function cacheIndexOf(cache, value) {
    var type = typeof value;
    cache = cache.cache;

    if (type == 'boolean' || value == null) {
      return cache[value] ? 0 : -1;
    }
    if (type != 'number' && type != 'string') {
      type = 'object';
    }
    var key = type == 'number' ? value : keyPrefix + value;
    cache = (cache = cache[type]) && cache[key];

    return type == 'object'
      ? (cache && baseIndexOf(cache, value) > -1 ? 0 : -1)
      : (cache ? 0 : -1);
  }

  /**
   * Adds a given value to the corresponding cache object.
   *
   * @private
   * @param {*} value The value to add to the cache.
   */
  function cachePush(value) {
    var cache = this.cache,
        type = typeof value;

    if (type == 'boolean' || value == null) {
      cache[value] = true;
    } else {
      if (type != 'number' && type != 'string') {
        type = 'object';
      }
      var key = type == 'number' ? value : keyPrefix + value,
          typeCache = cache[type] || (cache[type] = {});

      if (type == 'object') {
        (typeCache[key] || (typeCache[key] = [])).push(value);
      } else {
        typeCache[key] = true;
      }
    }
  }

  /**
   * Used by `_.max` and `_.min` as the default callback when a given
   * collection is a string value.
   *
   * @private
   * @param {string} value The character to inspect.
   * @returns {number} Returns the code unit of given character.
   */
  function charAtCallback(value) {
    return value.charCodeAt(0);
  }

  /**
   * Used by `sortBy` to compare transformed `collection` elements, stable sorting
   * them in ascending order.
   *
   * @private
   * @param {Object} a The object to compare to `b`.
   * @param {Object} b The object to compare to `a`.
   * @returns {number} Returns the sort order indicator of `1` or `-1`.
   */
  function compareAscending(a, b) {
    var ac = a.criteria,
        bc = b.criteria,
        index = -1,
        length = ac.length;

    while (++index < length) {
      var value = ac[index],
          other = bc[index];

      if (value !== other) {
        if (value > other || typeof value == 'undefined') {
          return 1;
        }
        if (value < other || typeof other == 'undefined') {
          return -1;
        }
      }
    }
    // Fixes an `Array#sort` bug in the JS engine embedded in Adobe applications
    // that causes it, under certain circumstances, to return the same value for
    // `a` and `b`. See https://github.com/jashkenas/underscore/pull/1247
    //
    // This also ensures a stable sort in V8 and other engines.
    // See http://code.google.com/p/v8/issues/detail?id=90
    return a.index - b.index;
  }

  /**
   * Creates a cache object to optimize linear searches of large arrays.
   *
   * @private
   * @param {Array} [array=[]] The array to search.
   * @returns {null|Object} Returns the cache object or `null` if caching should not be used.
   */
  function createCache(array) {
    var index = -1,
        length = array.length,
        first = array[0],
        mid = array[(length / 2) | 0],
        last = array[length - 1];

    if (first && typeof first == 'object' &&
        mid && typeof mid == 'object' && last && typeof last == 'object') {
      return false;
    }
    var cache = getObject();
    cache['false'] = cache['null'] = cache['true'] = cache['undefined'] = false;

    var result = getObject();
    result.array = array;
    result.cache = cache;
    result.push = cachePush;

    while (++index < length) {
      result.push(array[index]);
    }
    return result;
  }

  /**
   * Used by `template` to escape characters for inclusion in compiled
   * string literals.
   *
   * @private
   * @param {string} match The matched character to escape.
   * @returns {string} Returns the escaped character.
   */
  function escapeStringChar(match) {
    return '\\' + stringEscapes[match];
  }

  /**
   * Gets an array from the array pool or creates a new one if the pool is empty.
   *
   * @private
   * @returns {Array} The array from the pool.
   */
  function getArray() {
    return arrayPool.pop() || [];
  }

  /**
   * Gets an object from the object pool or creates a new one if the pool is empty.
   *
   * @private
   * @returns {Object} The object from the pool.
   */
  function getObject() {
    return objectPool.pop() || {
      'array': null,
      'cache': null,
      'criteria': null,
      'false': false,
      'index': 0,
      'null': false,
      'number': null,
      'object': null,
      'push': null,
      'string': null,
      'true': false,
      'undefined': false,
      'value': null
    };
  }

  /**
   * Releases the given array back to the array pool.
   *
   * @private
   * @param {Array} [array] The array to release.
   */
  function releaseArray(array) {
    array.length = 0;
    if (arrayPool.length < maxPoolSize) {
      arrayPool.push(array);
    }
  }

  /**
   * Releases the given object back to the object pool.
   *
   * @private
   * @param {Object} [object] The object to release.
   */
  function releaseObject(object) {
    var cache = object.cache;
    if (cache) {
      releaseObject(cache);
    }
    object.array = object.cache = object.criteria = object.object = object.number = object.string = object.value = null;
    if (objectPool.length < maxPoolSize) {
      objectPool.push(object);
    }
  }

  /**
   * Slices the `collection` from the `start` index up to, but not including,
   * the `end` index.
   *
   * Note: This function is used instead of `Array#slice` to support node lists
   * in IE < 9 and to ensure dense arrays are returned.
   *
   * @private
   * @param {Array|Object|string} collection The collection to slice.
   * @param {number} start The start index.
   * @param {number} end The end index.
   * @returns {Array} Returns the new array.
   */
  function slice(array, start, end) {
    start || (start = 0);
    if (typeof end == 'undefined') {
      end = array ? array.length : 0;
    }
    var index = -1,
        length = end - start || 0,
        result = Array(length < 0 ? 0 : length);

    while (++index < length) {
      result[index] = array[start + index];
    }
    return result;
  }

  /*--------------------------------------------------------------------------*/

  /**
   * Create a new `lodash` function using the given context object.
   *
   * @static
   * @memberOf _
   * @category Utilities
   * @param {Object} [context=root] The context object.
   * @returns {Function} Returns the `lodash` function.
   */
  function runInContext(context) {
    // Avoid issues with some ES3 environments that attempt to use values, named
    // after built-in constructors like `Object`, for the creation of literals.
    // ES5 clears this up by stating that literals must use built-in constructors.
    // See http://es5.github.io/#x11.1.5.
    context = context ? _.defaults(root.Object(), context, _.pick(root, contextProps)) : root;

    /** Native constructor references */
    var Array = context.Array,
        Boolean = context.Boolean,
        Date = context.Date,
        Function = context.Function,
        Math = context.Math,
        Number = context.Number,
        Object = context.Object,
        RegExp = context.RegExp,
        String = context.String,
        TypeError = context.TypeError;

    /**
     * Used for `Array` method references.
     *
     * Normally `Array.prototype` would suffice, however, using an array literal
     * avoids issues in Narwhal.
     */
    var arrayRef = [];

    /** Used for native method references */
    var objectProto = Object.prototype;

    /** Used to restore the original `_` reference in `noConflict` */
    var oldDash = context._;

    /** Used to resolve the internal [[Class]] of values */
    var toString = objectProto.toString;

    /** Used to detect if a method is native */
    var reNative = RegExp('^' +
      String(toString)
        .replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
        .replace(/toString| for [^\]]+/g, '.*?') + '$'
    );

    /** Native method shortcuts */
    var ceil = Math.ceil,
        clearTimeout = context.clearTimeout,
        floor = Math.floor,
        fnToString = Function.prototype.toString,
        getPrototypeOf = isNative(getPrototypeOf = Object.getPrototypeOf) && getPrototypeOf,
        hasOwnProperty = objectProto.hasOwnProperty,
        push = arrayRef.push,
        setTimeout = context.setTimeout,
        splice = arrayRef.splice,
        unshift = arrayRef.unshift;

    /** Used to set meta data on functions */
    var defineProperty = (function() {
      // IE 8 only accepts DOM elements
      try {
        var o = {},
            func = isNative(func = Object.defineProperty) && func,
            result = func(o, o, o) && func;
      } catch(e) { }
      return result;
    }());

    /* Native method shortcuts for methods with the same name as other `lodash` methods */
    var nativeCreate = isNative(nativeCreate = Object.create) && nativeCreate,
        nativeIsArray = isNative(nativeIsArray = Array.isArray) && nativeIsArray,
        nativeIsFinite = context.isFinite,
        nativeIsNaN = context.isNaN,
        nativeKeys = isNative(nativeKeys = Object.keys) && nativeKeys,
        nativeMax = Math.max,
        nativeMin = Math.min,
        nativeParseInt = context.parseInt,
        nativeRandom = Math.random;

    /** Used to lookup a built-in constructor by [[Class]] */
    var ctorByClass = {};
    ctorByClass[arrayClass] = Array;
    ctorByClass[boolClass] = Boolean;
    ctorByClass[dateClass] = Date;
    ctorByClass[funcClass] = Function;
    ctorByClass[objectClass] = Object;
    ctorByClass[numberClass] = Number;
    ctorByClass[regexpClass] = RegExp;
    ctorByClass[stringClass] = String;

    /*--------------------------------------------------------------------------*/

    /**
     * Creates a `lodash` object which wraps the given value to enable intuitive
     * method chaining.
     *
     * In addition to Lo-Dash methods, wrappers also have the following `Array` methods:
     * `concat`, `join`, `pop`, `push`, `reverse`, `shift`, `slice`, `sort`, `splice`,
     * and `unshift`
     *
     * Chaining is supported in custom builds as long as the `value` method is
     * implicitly or explicitly included in the build.
     *
     * The chainable wrapper functions are:
     * `after`, `assign`, `bind`, `bindAll`, `bindKey`, `chain`, `compact`,
     * `compose`, `concat`, `countBy`, `create`, `createCallback`, `curry`,
     * `debounce`, `defaults`, `defer`, `delay`, `difference`, `filter`, `flatten`,
     * `forEach`, `forEachRight`, `forIn`, `forInRight`, `forOwn`, `forOwnRight`,
     * `functions`, `groupBy`, `indexBy`, `initial`, `intersection`, `invert`,
     * `invoke`, `keys`, `map`, `max`, `memoize`, `merge`, `min`, `object`, `omit`,
     * `once`, `pairs`, `partial`, `partialRight`, `pick`, `pluck`, `pull`, `push`,
     * `range`, `reject`, `remove`, `rest`, `reverse`, `shuffle`, `slice`, `sort`,
     * `sortBy`, `splice`, `tap`, `throttle`, `times`, `toArray`, `transform`,
     * `union`, `uniq`, `unshift`, `unzip`, `values`, `where`, `without`, `wrap`,
     * and `zip`
     *
     * The non-chainable wrapper functions are:
     * `clone`, `cloneDeep`, `contains`, `escape`, `every`, `find`, `findIndex`,
     * `findKey`, `findLast`, `findLastIndex`, `findLastKey`, `has`, `identity`,
     * `indexOf`, `isArguments`, `isArray`, `isBoolean`, `isDate`, `isElement`,
     * `isEmpty`, `isEqual`, `isFinite`, `isFunction`, `isNaN`, `isNull`, `isNumber`,
     * `isObject`, `isPlainObject`, `isRegExp`, `isString`, `isUndefined`, `join`,
     * `lastIndexOf`, `mixin`, `noConflict`, `parseInt`, `pop`, `random`, `reduce`,
     * `reduceRight`, `result`, `shift`, `size`, `some`, `sortedIndex`, `runInContext`,
     * `template`, `unescape`, `uniqueId`, and `value`
     *
     * The wrapper functions `first` and `last` return wrapped values when `n` is
     * provided, otherwise they return unwrapped values.
     *
     * Explicit chaining can be enabled by using the `_.chain` method.
     *
     * @name _
     * @constructor
     * @category Chaining
     * @param {*} value The value to wrap in a `lodash` instance.
     * @returns {Object} Returns a `lodash` instance.
     * @example
     *
     * var wrapped = _([1, 2, 3]);
     *
     * // returns an unwrapped value
     * wrapped.reduce(function(sum, num) {
     *   return sum + num;
     * });
     * // => 6
     *
     * // returns a wrapped value
     * var squares = wrapped.map(function(num) {
     *   return num * num;
     * });
     *
     * _.isArray(squares);
     * // => false
     *
     * _.isArray(squares.value());
     * // => true
     */
    function lodash(value) {
      // don't wrap if already wrapped, even if wrapped by a different `lodash` constructor
      return (value && typeof value == 'object' && !isArray(value) && hasOwnProperty.call(value, '__wrapped__'))
       ? value
       : new lodashWrapper(value);
    }

    /**
     * A fast path for creating `lodash` wrapper objects.
     *
     * @private
     * @param {*} value The value to wrap in a `lodash` instance.
     * @param {boolean} chainAll A flag to enable chaining for all methods
     * @returns {Object} Returns a `lodash` instance.
     */
    function lodashWrapper(value, chainAll) {
      this.__chain__ = !!chainAll;
      this.__wrapped__ = value;
    }
    // ensure `new lodashWrapper` is an instance of `lodash`
    lodashWrapper.prototype = lodash.prototype;

    /**
     * An object used to flag environments features.
     *
     * @static
     * @memberOf _
     * @type Object
     */
    var support = lodash.support = {};

    /**
     * Detect if functions can be decompiled by `Function#toString`
     * (all but PS3 and older Opera mobile browsers & avoided in Windows 8 apps).
     *
     * @memberOf _.support
     * @type boolean
     */
    support.funcDecomp = !isNative(context.WinRTError) && reThis.test(runInContext);

    /**
     * Detect if `Function#name` is supported (all but IE).
     *
     * @memberOf _.support
     * @type boolean
     */
    support.funcNames = typeof Function.name == 'string';

    /**
     * By default, the template delimiters used by Lo-Dash are similar to those in
     * embedded Ruby (ERB). Change the following template settings to use alternative
     * delimiters.
     *
     * @static
     * @memberOf _
     * @type Object
     */
    lodash.templateSettings = {

      /**
       * Used to detect `data` property values to be HTML-escaped.
       *
       * @memberOf _.templateSettings
       * @type RegExp
       */
      'escape': /<%-([\s\S]+?)%>/g,

      /**
       * Used to detect code to be evaluated.
       *
       * @memberOf _.templateSettings
       * @type RegExp
       */
      'evaluate': /<%([\s\S]+?)%>/g,

      /**
       * Used to detect `data` property values to inject.
       *
       * @memberOf _.templateSettings
       * @type RegExp
       */
      'interpolate': reInterpolate,

      /**
       * Used to reference the data object in the template text.
       *
       * @memberOf _.templateSettings
       * @type string
       */
      'variable': '',

      /**
       * Used to import variables into the compiled template.
       *
       * @memberOf _.templateSettings
       * @type Object
       */
      'imports': {

        /**
         * A reference to the `lodash` function.
         *
         * @memberOf _.templateSettings.imports
         * @type Function
         */
        '_': lodash
      }
    };

    /*--------------------------------------------------------------------------*/

    /**
     * The base implementation of `_.bind` that creates the bound function and
     * sets its meta data.
     *
     * @private
     * @param {Array} bindData The bind data array.
     * @returns {Function} Returns the new bound function.
     */
    function baseBind(bindData) {
      var func = bindData[0],
          partialArgs = bindData[2],
          thisArg = bindData[4];

      function bound() {
        // `Function#bind` spec
        // http://es5.github.io/#x15.3.4.5
        if (partialArgs) {
          // avoid `arguments` object deoptimizations by using `slice` instead
          // of `Array.prototype.slice.call` and not assigning `arguments` to a
          // variable as a ternary expression
          var args = slice(partialArgs);
          push.apply(args, arguments);
        }
        // mimic the constructor's `return` behavior
        // http://es5.github.io/#x13.2.2
        if (this instanceof bound) {
          // ensure `new bound` is an instance of `func`
          var thisBinding = baseCreate(func.prototype),
              result = func.apply(thisBinding, args || arguments);
          return isObject(result) ? result : thisBinding;
        }
        return func.apply(thisArg, args || arguments);
      }
      setBindData(bound, bindData);
      return bound;
    }

    /**
     * The base implementation of `_.clone` without argument juggling or support
     * for `thisArg` binding.
     *
     * @private
     * @param {*} value The value to clone.
     * @param {boolean} [isDeep=false] Specify a deep clone.
     * @param {Function} [callback] The function to customize cloning values.
     * @param {Array} [stackA=[]] Tracks traversed source objects.
     * @param {Array} [stackB=[]] Associates clones with source counterparts.
     * @returns {*} Returns the cloned value.
     */
    function baseClone(value, isDeep, callback, stackA, stackB) {
      if (callback) {
        var result = callback(value);
        if (typeof result != 'undefined') {
          return result;
        }
      }
      // inspect [[Class]]
      var isObj = isObject(value);
      if (isObj) {
        var className = toString.call(value);
        if (!cloneableClasses[className]) {
          return value;
        }
        var ctor = ctorByClass[className];
        switch (className) {
          case boolClass:
          case dateClass:
            return new ctor(+value);

          case numberClass:
          case stringClass:
            return new ctor(value);

          case regexpClass:
            result = ctor(value.source, reFlags.exec(value));
            result.lastIndex = value.lastIndex;
            return result;
        }
      } else {
        return value;
      }
      var isArr = isArray(value);
      if (isDeep) {
        // check for circular references and return corresponding clone
        var initedStack = !stackA;
        stackA || (stackA = getArray());
        stackB || (stackB = getArray());

        var length = stackA.length;
        while (length--) {
          if (stackA[length] == value) {
            return stackB[length];
          }
        }
        result = isArr ? ctor(value.length) : {};
      }
      else {
        result = isArr ? slice(value) : assign({}, value);
      }
      // add array properties assigned by `RegExp#exec`
      if (isArr) {
        if (hasOwnProperty.call(value, 'index')) {
          result.index = value.index;
        }
        if (hasOwnProperty.call(value, 'input')) {
          result.input = value.input;
        }
      }
      // exit for shallow clone
      if (!isDeep) {
        return result;
      }
      // add the source value to the stack of traversed objects
      // and associate it with its clone
      stackA.push(value);
      stackB.push(result);

      // recursively populate clone (susceptible to call stack limits)
      (isArr ? forEach : forOwn)(value, function(objValue, key) {
        result[key] = baseClone(objValue, isDeep, callback, stackA, stackB);
      });

      if (initedStack) {
        releaseArray(stackA);
        releaseArray(stackB);
      }
      return result;
    }

    /**
     * The base implementation of `_.create` without support for assigning
     * properties to the created object.
     *
     * @private
     * @param {Object} prototype The object to inherit from.
     * @returns {Object} Returns the new object.
     */
    function baseCreate(prototype, properties) {
      return isObject(prototype) ? nativeCreate(prototype) : {};
    }
    // fallback for browsers without `Object.create`
    if (!nativeCreate) {
      baseCreate = (function() {
        function Object() {}
        return function(prototype) {
          if (isObject(prototype)) {
            Object.prototype = prototype;
            var result = new Object;
            Object.prototype = null;
          }
          return result || context.Object();
        };
      }());
    }

    /**
     * The base implementation of `_.createCallback` without support for creating
     * "_.pluck" or "_.where" style callbacks.
     *
     * @private
     * @param {*} [func=identity] The value to convert to a callback.
     * @param {*} [thisArg] The `this` binding of the created callback.
     * @param {number} [argCount] The number of arguments the callback accepts.
     * @returns {Function} Returns a callback function.
     */
    function baseCreateCallback(func, thisArg, argCount) {
      if (typeof func != 'function') {
        return identity;
      }
      // exit early for no `thisArg` or already bound by `Function#bind`
      if (typeof thisArg == 'undefined' || !('prototype' in func)) {
        return func;
      }
      var bindData = func.__bindData__;
      if (typeof bindData == 'undefined') {
        if (support.funcNames) {
          bindData = !func.name;
        }
        bindData = bindData || !support.funcDecomp;
        if (!bindData) {
          var source = fnToString.call(func);
          if (!support.funcNames) {
            bindData = !reFuncName.test(source);
          }
          if (!bindData) {
            // checks if `func` references the `this` keyword and stores the result
            bindData = reThis.test(source);
            setBindData(func, bindData);
          }
        }
      }
      // exit early if there are no `this` references or `func` is bound
      if (bindData === false || (bindData !== true && bindData[1] & 1)) {
        return func;
      }
      switch (argCount) {
        case 1: return function(value) {
          return func.call(thisArg, value);
        };
        case 2: return function(a, b) {
          return func.call(thisArg, a, b);
        };
        case 3: return function(value, index, collection) {
          return func.call(thisArg, value, index, collection);
        };
        case 4: return function(accumulator, value, index, collection) {
          return func.call(thisArg, accumulator, value, index, collection);
        };
      }
      return bind(func, thisArg);
    }

    /**
     * The base implementation of `createWrapper` that creates the wrapper and
     * sets its meta data.
     *
     * @private
     * @param {Array} bindData The bind data array.
     * @returns {Function} Returns the new function.
     */
    function baseCreateWrapper(bindData) {
      var func = bindData[0],
          bitmask = bindData[1],
          partialArgs = bindData[2],
          partialRightArgs = bindData[3],
          thisArg = bindData[4],
          arity = bindData[5];

      var isBind = bitmask & 1,
          isBindKey = bitmask & 2,
          isCurry = bitmask & 4,
          isCurryBound = bitmask & 8,
          key = func;

      function bound() {
        var thisBinding = isBind ? thisArg : this;
        if (partialArgs) {
          var args = slice(partialArgs);
          push.apply(args, arguments);
        }
        if (partialRightArgs || isCurry) {
          args || (args = slice(arguments));
          if (partialRightArgs) {
            push.apply(args, partialRightArgs);
          }
          if (isCurry && args.length < arity) {
            bitmask |= 16 & ~32;
            return baseCreateWrapper([func, (isCurryBound ? bitmask : bitmask & ~3), args, null, thisArg, arity]);
          }
        }
        args || (args = arguments);
        if (isBindKey) {
          func = thisBinding[key];
        }
        if (this instanceof bound) {
          thisBinding = baseCreate(func.prototype);
          var result = func.apply(thisBinding, args);
          return isObject(result) ? result : thisBinding;
        }
        return func.apply(thisBinding, args);
      }
      setBindData(bound, bindData);
      return bound;
    }

    /**
     * The base implementation of `_.difference` that accepts a single array
     * of values to exclude.
     *
     * @private
     * @param {Array} array The array to process.
     * @param {Array} [values] The array of values to exclude.
     * @returns {Array} Returns a new array of filtered values.
     */
    function baseDifference(array, values) {
      var index = -1,
          indexOf = getIndexOf(),
          length = array ? array.length : 0,
          isLarge = length >= largeArraySize && indexOf === baseIndexOf,
          result = [];

      if (isLarge) {
        var cache = createCache(values);
        if (cache) {
          indexOf = cacheIndexOf;
          values = cache;
        } else {
          isLarge = false;
        }
      }
      while (++index < length) {
        var value = array[index];
        if (indexOf(values, value) < 0) {
          result.push(value);
        }
      }
      if (isLarge) {
        releaseObject(values);
      }
      return result;
    }

    /**
     * The base implementation of `_.flatten` without support for callback
     * shorthands or `thisArg` binding.
     *
     * @private
     * @param {Array} array The array to flatten.
     * @param {boolean} [isShallow=false] A flag to restrict flattening to a single level.
     * @param {boolean} [isStrict=false] A flag to restrict flattening to arrays and `arguments` objects.
     * @param {number} [fromIndex=0] The index to start from.
     * @returns {Array} Returns a new flattened array.
     */
    function baseFlatten(array, isShallow, isStrict, fromIndex) {
      var index = (fromIndex || 0) - 1,
          length = array ? array.length : 0,
          result = [];

      while (++index < length) {
        var value = array[index];

        if (value && typeof value == 'object' && typeof value.length == 'number'
            && (isArray(value) || isArguments(value))) {
          // recursively flatten arrays (susceptible to call stack limits)
          if (!isShallow) {
            value = baseFlatten(value, isShallow, isStrict);
          }
          var valIndex = -1,
              valLength = value.length,
              resIndex = result.length;

          result.length += valLength;
          while (++valIndex < valLength) {
            result[resIndex++] = value[valIndex];
          }
        } else if (!isStrict) {
          result.push(value);
        }
      }
      return result;
    }

    /**
     * The base implementation of `_.isEqual`, without support for `thisArg` binding,
     * that allows partial "_.where" style comparisons.
     *
     * @private
     * @param {*} a The value to compare.
     * @param {*} b The other value to compare.
     * @param {Function} [callback] The function to customize comparing values.
     * @param {Function} [isWhere=false] A flag to indicate performing partial comparisons.
     * @param {Array} [stackA=[]] Tracks traversed `a` objects.
     * @param {Array} [stackB=[]] Tracks traversed `b` objects.
     * @returns {boolean} Returns `true` if the values are equivalent, else `false`.
     */
    function baseIsEqual(a, b, callback, isWhere, stackA, stackB) {
      // used to indicate that when comparing objects, `a` has at least the properties of `b`
      if (callback) {
        var result = callback(a, b);
        if (typeof result != 'undefined') {
          return !!result;
        }
      }
      // exit early for identical values
      if (a === b) {
        // treat `+0` vs. `-0` as not equal
        return a !== 0 || (1 / a == 1 / b);
      }
      var type = typeof a,
          otherType = typeof b;

      // exit early for unlike primitive values
      if (a === a &&
          !(a && objectTypes[type]) &&
          !(b && objectTypes[otherType])) {
        return false;
      }
      // exit early for `null` and `undefined` avoiding ES3's Function#call behavior
      // http://es5.github.io/#x15.3.4.4
      if (a == null || b == null) {
        return a === b;
      }
      // compare [[Class]] names
      var className = toString.call(a),
          otherClass = toString.call(b);

      if (className == argsClass) {
        className = objectClass;
      }
      if (otherClass == argsClass) {
        otherClass = objectClass;
      }
      if (className != otherClass) {
        return false;
      }
      switch (className) {
        case boolClass:
        case dateClass:
          // coerce dates and booleans to numbers, dates to milliseconds and booleans
          // to `1` or `0` treating invalid dates coerced to `NaN` as not equal
          return +a == +b;

        case numberClass:
          // treat `NaN` vs. `NaN` as equal
          return (a != +a)
            ? b != +b
            // but treat `+0` vs. `-0` as not equal
            : (a == 0 ? (1 / a == 1 / b) : a == +b);

        case regexpClass:
        case stringClass:
          // coerce regexes to strings (http://es5.github.io/#x15.10.6.4)
          // treat string primitives and their corresponding object instances as equal
          return a == String(b);
      }
      var isArr = className == arrayClass;
      if (!isArr) {
        // unwrap any `lodash` wrapped values
        var aWrapped = hasOwnProperty.call(a, '__wrapped__'),
            bWrapped = hasOwnProperty.call(b, '__wrapped__');

        if (aWrapped || bWrapped) {
          return baseIsEqual(aWrapped ? a.__wrapped__ : a, bWrapped ? b.__wrapped__ : b, callback, isWhere, stackA, stackB);
        }
        // exit for functions and DOM nodes
        if (className != objectClass) {
          return false;
        }
        // in older versions of Opera, `arguments` objects have `Array` constructors
        var ctorA = a.constructor,
            ctorB = b.constructor;

        // non `Object` object instances with different constructors are not equal
        if (ctorA != ctorB &&
              !(isFunction(ctorA) && ctorA instanceof ctorA && isFunction(ctorB) && ctorB instanceof ctorB) &&
              ('constructor' in a && 'constructor' in b)
            ) {
          return false;
        }
      }
      // assume cyclic structures are equal
      // the algorithm for detecting cyclic structures is adapted from ES 5.1
      // section 15.12.3, abstract operation `JO` (http://es5.github.io/#x15.12.3)
      var initedStack = !stackA;
      stackA || (stackA = getArray());
      stackB || (stackB = getArray());

      var length = stackA.length;
      while (length--) {
        if (stackA[length] == a) {
          return stackB[length] == b;
        }
      }
      var size = 0;
      result = true;

      // add `a` and `b` to the stack of traversed objects
      stackA.push(a);
      stackB.push(b);

      // recursively compare objects and arrays (susceptible to call stack limits)
      if (isArr) {
        // compare lengths to determine if a deep comparison is necessary
        length = a.length;
        size = b.length;
        result = size == length;

        if (result || isWhere) {
          // deep compare the contents, ignoring non-numeric properties
          while (size--) {
            var index = length,
                value = b[size];

            if (isWhere) {
              while (index--) {
                if ((result = baseIsEqual(a[index], value, callback, isWhere, stackA, stackB))) {
                  break;
                }
              }
            } else if (!(result = baseIsEqual(a[size], value, callback, isWhere, stackA, stackB))) {
              break;
            }
          }
        }
      }
      else {
        // deep compare objects using `forIn`, instead of `forOwn`, to avoid `Object.keys`
        // which, in this case, is more costly
        forIn(b, function(value, key, b) {
          if (hasOwnProperty.call(b, key)) {
            // count the number of properties.
            size++;
            // deep compare each property value.
            return (result = hasOwnProperty.call(a, key) && baseIsEqual(a[key], value, callback, isWhere, stackA, stackB));
          }
        });

        if (result && !isWhere) {
          // ensure both objects have the same number of properties
          forIn(a, function(value, key, a) {
            if (hasOwnProperty.call(a, key)) {
              // `size` will be `-1` if `a` has more properties than `b`
              return (result = --size > -1);
            }
          });
        }
      }
      stackA.pop();
      stackB.pop();

      if (initedStack) {
        releaseArray(stackA);
        releaseArray(stackB);
      }
      return result;
    }

    /**
     * The base implementation of `_.merge` without argument juggling or support
     * for `thisArg` binding.
     *
     * @private
     * @param {Object} object The destination object.
     * @param {Object} source The source object.
     * @param {Function} [callback] The function to customize merging properties.
     * @param {Array} [stackA=[]] Tracks traversed source objects.
     * @param {Array} [stackB=[]] Associates values with source counterparts.
     */
    function baseMerge(object, source, callback, stackA, stackB) {
      (isArray(source) ? forEach : forOwn)(source, function(source, key) {
        var found,
            isArr,
            result = source,
            value = object[key];

        if (source && ((isArr = isArray(source)) || isPlainObject(source))) {
          // avoid merging previously merged cyclic sources
          var stackLength = stackA.length;
          while (stackLength--) {
            if ((found = stackA[stackLength] == source)) {
              value = stackB[stackLength];
              break;
            }
          }
          if (!found) {
            var isShallow;
            if (callback) {
              result = callback(value, source);
              if ((isShallow = typeof result != 'undefined')) {
                value = result;
              }
            }
            if (!isShallow) {
              value = isArr
                ? (isArray(value) ? value : [])
                : (isPlainObject(value) ? value : {});
            }
            // add `source` and associated `value` to the stack of traversed objects
            stackA.push(source);
            stackB.push(value);

            // recursively merge objects and arrays (susceptible to call stack limits)
            if (!isShallow) {
              baseMerge(value, source, callback, stackA, stackB);
            }
          }
        }
        else {
          if (callback) {
            result = callback(value, source);
            if (typeof result == 'undefined') {
              result = source;
            }
          }
          if (typeof result != 'undefined') {
            value = result;
          }
        }
        object[key] = value;
      });
    }

    /**
     * The base implementation of `_.random` without argument juggling or support
     * for returning floating-point numbers.
     *
     * @private
     * @param {number} min The minimum possible value.
     * @param {number} max The maximum possible value.
     * @returns {number} Returns a random number.
     */
    function baseRandom(min, max) {
      return min + floor(nativeRandom() * (max - min + 1));
    }

    /**
     * The base implementation of `_.uniq` without support for callback shorthands
     * or `thisArg` binding.
     *
     * @private
     * @param {Array} array The array to process.
     * @param {boolean} [isSorted=false] A flag to indicate that `array` is sorted.
     * @param {Function} [callback] The function called per iteration.
     * @returns {Array} Returns a duplicate-value-free array.
     */
    function baseUniq(array, isSorted, callback) {
      var index = -1,
          indexOf = getIndexOf(),
          length = array ? array.length : 0,
          result = [];

      var isLarge = !isSorted && length >= largeArraySize && indexOf === baseIndexOf,
          seen = (callback || isLarge) ? getArray() : result;

      if (isLarge) {
        var cache = createCache(seen);
        indexOf = cacheIndexOf;
        seen = cache;
      }
      while (++index < length) {
        var value = array[index],
            computed = callback ? callback(value, index, array) : value;

        if (isSorted
              ? !index || seen[seen.length - 1] !== computed
              : indexOf(seen, computed) < 0
            ) {
          if (callback || isLarge) {
            seen.push(computed);
          }
          result.push(value);
        }
      }
      if (isLarge) {
        releaseArray(seen.array);
        releaseObject(seen);
      } else if (callback) {
        releaseArray(seen);
      }
      return result;
    }

    /**
     * Creates a function that aggregates a collection, creating an object composed
     * of keys generated from the results of running each element of the collection
     * through a callback. The given `setter` function sets the keys and values
     * of the composed object.
     *
     * @private
     * @param {Function} setter The setter function.
     * @returns {Function} Returns the new aggregator function.
     */
    function createAggregator(setter) {
      return function(collection, callback, thisArg) {
        var result = {};
        callback = lodash.createCallback(callback, thisArg, 3);

        var index = -1,
            length = collection ? collection.length : 0;

        if (typeof length == 'number') {
          while (++index < length) {
            var value = collection[index];
            setter(result, value, callback(value, index, collection), collection);
          }
        } else {
          forOwn(collection, function(value, key, collection) {
            setter(result, value, callback(value, key, collection), collection);
          });
        }
        return result;
      };
    }

    /**
     * Creates a function that, when called, either curries or invokes `func`
     * with an optional `this` binding and partially applied arguments.
     *
     * @private
     * @param {Function|string} func The function or method name to reference.
     * @param {number} bitmask The bitmask of method flags to compose.
     *  The bitmask may be composed of the following flags:
     *  1 - `_.bind`
     *  2 - `_.bindKey`
     *  4 - `_.curry`
     *  8 - `_.curry` (bound)
     *  16 - `_.partial`
     *  32 - `_.partialRight`
     * @param {Array} [partialArgs] An array of arguments to prepend to those
     *  provided to the new function.
     * @param {Array} [partialRightArgs] An array of arguments to append to those
     *  provided to the new function.
     * @param {*} [thisArg] The `this` binding of `func`.
     * @param {number} [arity] The arity of `func`.
     * @returns {Function} Returns the new function.
     */
    function createWrapper(func, bitmask, partialArgs, partialRightArgs, thisArg, arity) {
      var isBind = bitmask & 1,
          isBindKey = bitmask & 2,
          isCurry = bitmask & 4,
          isCurryBound = bitmask & 8,
          isPartial = bitmask & 16,
          isPartialRight = bitmask & 32;

      if (!isBindKey && !isFunction(func)) {
        throw new TypeError;
      }
      if (isPartial && !partialArgs.length) {
        bitmask &= ~16;
        isPartial = partialArgs = false;
      }
      if (isPartialRight && !partialRightArgs.length) {
        bitmask &= ~32;
        isPartialRight = partialRightArgs = false;
      }
      var bindData = func && func.__bindData__;
      if (bindData && bindData !== true) {
        // clone `bindData`
        bindData = slice(bindData);
        if (bindData[2]) {
          bindData[2] = slice(bindData[2]);
        }
        if (bindData[3]) {
          bindData[3] = slice(bindData[3]);
        }
        // set `thisBinding` is not previously bound
        if (isBind && !(bindData[1] & 1)) {
          bindData[4] = thisArg;
        }
        // set if previously bound but not currently (subsequent curried functions)
        if (!isBind && bindData[1] & 1) {
          bitmask |= 8;
        }
        // set curried arity if not yet set
        if (isCurry && !(bindData[1] & 4)) {
          bindData[5] = arity;
        }
        // append partial left arguments
        if (isPartial) {
          push.apply(bindData[2] || (bindData[2] = []), partialArgs);
        }
        // append partial right arguments
        if (isPartialRight) {
          unshift.apply(bindData[3] || (bindData[3] = []), partialRightArgs);
        }
        // merge flags
        bindData[1] |= bitmask;
        return createWrapper.apply(null, bindData);
      }
      // fast path for `_.bind`
      var creater = (bitmask == 1 || bitmask === 17) ? baseBind : baseCreateWrapper;
      return creater([func, bitmask, partialArgs, partialRightArgs, thisArg, arity]);
    }

    /**
     * Used by `escape` to convert characters to HTML entities.
     *
     * @private
     * @param {string} match The matched character to escape.
     * @returns {string} Returns the escaped character.
     */
    function escapeHtmlChar(match) {
      return htmlEscapes[match];
    }

    /**
     * Gets the appropriate "indexOf" function. If the `_.indexOf` method is
     * customized, this method returns the custom method, otherwise it returns
     * the `baseIndexOf` function.
     *
     * @private
     * @returns {Function} Returns the "indexOf" function.
     */
    function getIndexOf() {
      var result = (result = lodash.indexOf) === indexOf ? baseIndexOf : result;
      return result;
    }

    /**
     * Checks if `value` is a native function.
     *
     * @private
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if the `value` is a native function, else `false`.
     */
    function isNative(value) {
      return typeof value == 'function' && reNative.test(value);
    }

    /**
     * Sets `this` binding data on a given function.
     *
     * @private
     * @param {Function} func The function to set data on.
     * @param {Array} value The data array to set.
     */
    var setBindData = !defineProperty ? noop : function(func, value) {
      descriptor.value = value;
      defineProperty(func, '__bindData__', descriptor);
    };

    /**
     * A fallback implementation of `isPlainObject` which checks if a given value
     * is an object created by the `Object` constructor, assuming objects created
     * by the `Object` constructor have no inherited enumerable properties and that
     * there are no `Object.prototype` extensions.
     *
     * @private
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is a plain object, else `false`.
     */
    function shimIsPlainObject(value) {
      var ctor,
          result;

      // avoid non Object objects, `arguments` objects, and DOM elements
      if (!(value && toString.call(value) == objectClass) ||
          (ctor = value.constructor, isFunction(ctor) && !(ctor instanceof ctor))) {
        return false;
      }
      // In most environments an object's own properties are iterated before
      // its inherited properties. If the last iterated property is an object's
      // own property then there are no inherited enumerable properties.
      forIn(value, function(value, key) {
        result = key;
      });
      return typeof result == 'undefined' || hasOwnProperty.call(value, result);
    }

    /**
     * Used by `unescape` to convert HTML entities to characters.
     *
     * @private
     * @param {string} match The matched character to unescape.
     * @returns {string} Returns the unescaped character.
     */
    function unescapeHtmlChar(match) {
      return htmlUnescapes[match];
    }

    /*--------------------------------------------------------------------------*/

    /**
     * Checks if `value` is an `arguments` object.
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if the `value` is an `arguments` object, else `false`.
     * @example
     *
     * (function() { return _.isArguments(arguments); })(1, 2, 3);
     * // => true
     *
     * _.isArguments([1, 2, 3]);
     * // => false
     */
    function isArguments(value) {
      return value && typeof value == 'object' && typeof value.length == 'number' &&
        toString.call(value) == argsClass || false;
    }

    /**
     * Checks if `value` is an array.
     *
     * @static
     * @memberOf _
     * @type Function
     * @category Objects
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if the `value` is an array, else `false`.
     * @example
     *
     * (function() { return _.isArray(arguments); })();
     * // => false
     *
     * _.isArray([1, 2, 3]);
     * // => true
     */
    var isArray = nativeIsArray || function(value) {
      return value && typeof value == 'object' && typeof value.length == 'number' &&
        toString.call(value) == arrayClass || false;
    };

    /**
     * A fallback implementation of `Object.keys` which produces an array of the
     * given object's own enumerable property names.
     *
     * @private
     * @type Function
     * @param {Object} object The object to inspect.
     * @returns {Array} Returns an array of property names.
     */
    var shimKeys = function(object) {
      var index, iterable = object, result = [];
      if (!iterable) return result;
      if (!(objectTypes[typeof object])) return result;
        for (index in iterable) {
          if (hasOwnProperty.call(iterable, index)) {
            result.push(index);
          }
        }
      return result
    };

    /**
     * Creates an array composed of the own enumerable property names of an object.
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {Object} object The object to inspect.
     * @returns {Array} Returns an array of property names.
     * @example
     *
     * _.keys({ 'one': 1, 'two': 2, 'three': 3 });
     * // => ['one', 'two', 'three'] (property order is not guaranteed across environments)
     */
    var keys = !nativeKeys ? shimKeys : function(object) {
      if (!isObject(object)) {
        return [];
      }
      return nativeKeys(object);
    };

    /**
     * Used to convert characters to HTML entities:
     *
     * Though the `>` character is escaped for symmetry, characters like `>` and `/`
     * don't require escaping in HTML and have no special meaning unless they're part
     * of a tag or an unquoted attribute value.
     * http://mathiasbynens.be/notes/ambiguous-ampersands (under "semi-related fun fact")
     */
    var htmlEscapes = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    };

    /** Used to convert HTML entities to characters */
    var htmlUnescapes = invert(htmlEscapes);

    /** Used to match HTML entities and HTML characters */
    var reEscapedHtml = RegExp('(' + keys(htmlUnescapes).join('|') + ')', 'g'),
        reUnescapedHtml = RegExp('[' + keys(htmlEscapes).join('') + ']', 'g');

    /*--------------------------------------------------------------------------*/

    /**
     * Assigns own enumerable properties of source object(s) to the destination
     * object. Subsequent sources will overwrite property assignments of previous
     * sources. If a callback is provided it will be executed to produce the
     * assigned values. The callback is bound to `thisArg` and invoked with two
     * arguments; (objectValue, sourceValue).
     *
     * @static
     * @memberOf _
     * @type Function
     * @alias extend
     * @category Objects
     * @param {Object} object The destination object.
     * @param {...Object} [source] The source objects.
     * @param {Function} [callback] The function to customize assigning values.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {Object} Returns the destination object.
     * @example
     *
     * _.assign({ 'name': 'fred' }, { 'employer': 'slate' });
     * // => { 'name': 'fred', 'employer': 'slate' }
     *
     * var defaults = _.partialRight(_.assign, function(a, b) {
     *   return typeof a == 'undefined' ? b : a;
     * });
     *
     * var object = { 'name': 'barney' };
     * defaults(object, { 'name': 'fred', 'employer': 'slate' });
     * // => { 'name': 'barney', 'employer': 'slate' }
     */
    var assign = function(object, source, guard) {
      var index, iterable = object, result = iterable;
      if (!iterable) return result;
      var args = arguments,
          argsIndex = 0,
          argsLength = typeof guard == 'number' ? 2 : args.length;
      if (argsLength > 3 && typeof args[argsLength - 2] == 'function') {
        var callback = baseCreateCallback(args[--argsLength - 1], args[argsLength--], 2);
      } else if (argsLength > 2 && typeof args[argsLength - 1] == 'function') {
        callback = args[--argsLength];
      }
      while (++argsIndex < argsLength) {
        iterable = args[argsIndex];
        if (iterable && objectTypes[typeof iterable]) {
        var ownIndex = -1,
            ownProps = objectTypes[typeof iterable] && keys(iterable),
            length = ownProps ? ownProps.length : 0;

        while (++ownIndex < length) {
          index = ownProps[ownIndex];
          result[index] = callback ? callback(result[index], iterable[index]) : iterable[index];
        }
        }
      }
      return result
    };

    /**
     * Creates a clone of `value`. If `isDeep` is `true` nested objects will also
     * be cloned, otherwise they will be assigned by reference. If a callback
     * is provided it will be executed to produce the cloned values. If the
     * callback returns `undefined` cloning will be handled by the method instead.
     * The callback is bound to `thisArg` and invoked with one argument; (value).
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {*} value The value to clone.
     * @param {boolean} [isDeep=false] Specify a deep clone.
     * @param {Function} [callback] The function to customize cloning values.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {*} Returns the cloned value.
     * @example
     *
     * var characters = [
     *   { 'name': 'barney', 'age': 36 },
     *   { 'name': 'fred',   'age': 40 }
     * ];
     *
     * var shallow = _.clone(characters);
     * shallow[0] === characters[0];
     * // => true
     *
     * var deep = _.clone(characters, true);
     * deep[0] === characters[0];
     * // => false
     *
     * _.mixin({
     *   'clone': _.partialRight(_.clone, function(value) {
     *     return _.isElement(value) ? value.cloneNode(false) : undefined;
     *   })
     * });
     *
     * var clone = _.clone(document.body);
     * clone.childNodes.length;
     * // => 0
     */
    function clone(value, isDeep, callback, thisArg) {
      // allows working with "Collections" methods without using their `index`
      // and `collection` arguments for `isDeep` and `callback`
      if (typeof isDeep != 'boolean' && isDeep != null) {
        thisArg = callback;
        callback = isDeep;
        isDeep = false;
      }
      return baseClone(value, isDeep, typeof callback == 'function' && baseCreateCallback(callback, thisArg, 1));
    }

    /**
     * Creates a deep clone of `value`. If a callback is provided it will be
     * executed to produce the cloned values. If the callback returns `undefined`
     * cloning will be handled by the method instead. The callback is bound to
     * `thisArg` and invoked with one argument; (value).
     *
     * Note: This method is loosely based on the structured clone algorithm. Functions
     * and DOM nodes are **not** cloned. The enumerable properties of `arguments` objects and
     * objects created by constructors other than `Object` are cloned to plain `Object` objects.
     * See http://www.w3.org/TR/html5/infrastructure.html#internal-structured-cloning-algorithm.
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {*} value The value to deep clone.
     * @param {Function} [callback] The function to customize cloning values.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {*} Returns the deep cloned value.
     * @example
     *
     * var characters = [
     *   { 'name': 'barney', 'age': 36 },
     *   { 'name': 'fred',   'age': 40 }
     * ];
     *
     * var deep = _.cloneDeep(characters);
     * deep[0] === characters[0];
     * // => false
     *
     * var view = {
     *   'label': 'docs',
     *   'node': element
     * };
     *
     * var clone = _.cloneDeep(view, function(value) {
     *   return _.isElement(value) ? value.cloneNode(true) : undefined;
     * });
     *
     * clone.node == view.node;
     * // => false
     */
    function cloneDeep(value, callback, thisArg) {
      return baseClone(value, true, typeof callback == 'function' && baseCreateCallback(callback, thisArg, 1));
    }

    /**
     * Creates an object that inherits from the given `prototype` object. If a
     * `properties` object is provided its own enumerable properties are assigned
     * to the created object.
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {Object} prototype The object to inherit from.
     * @param {Object} [properties] The properties to assign to the object.
     * @returns {Object} Returns the new object.
     * @example
     *
     * function Shape() {
     *   this.x = 0;
     *   this.y = 0;
     * }
     *
     * function Circle() {
     *   Shape.call(this);
     * }
     *
     * Circle.prototype = _.create(Shape.prototype, { 'constructor': Circle });
     *
     * var circle = new Circle;
     * circle instanceof Circle;
     * // => true
     *
     * circle instanceof Shape;
     * // => true
     */
    function create(prototype, properties) {
      var result = baseCreate(prototype);
      return properties ? assign(result, properties) : result;
    }

    /**
     * Assigns own enumerable properties of source object(s) to the destination
     * object for all destination properties that resolve to `undefined`. Once a
     * property is set, additional defaults of the same property will be ignored.
     *
     * @static
     * @memberOf _
     * @type Function
     * @category Objects
     * @param {Object} object The destination object.
     * @param {...Object} [source] The source objects.
     * @param- {Object} [guard] Allows working with `_.reduce` without using its
     *  `key` and `object` arguments as sources.
     * @returns {Object} Returns the destination object.
     * @example
     *
     * var object = { 'name': 'barney' };
     * _.defaults(object, { 'name': 'fred', 'employer': 'slate' });
     * // => { 'name': 'barney', 'employer': 'slate' }
     */
    var defaults = function(object, source, guard) {
      var index, iterable = object, result = iterable;
      if (!iterable) return result;
      var args = arguments,
          argsIndex = 0,
          argsLength = typeof guard == 'number' ? 2 : args.length;
      while (++argsIndex < argsLength) {
        iterable = args[argsIndex];
        if (iterable && objectTypes[typeof iterable]) {
        var ownIndex = -1,
            ownProps = objectTypes[typeof iterable] && keys(iterable),
            length = ownProps ? ownProps.length : 0;

        while (++ownIndex < length) {
          index = ownProps[ownIndex];
          if (typeof result[index] == 'undefined') result[index] = iterable[index];
        }
        }
      }
      return result
    };

    /**
     * This method is like `_.findIndex` except that it returns the key of the
     * first element that passes the callback check, instead of the element itself.
     *
     * If a property name is provided for `callback` the created "_.pluck" style
     * callback will return the property value of the given element.
     *
     * If an object is provided for `callback` the created "_.where" style callback
     * will return `true` for elements that have the properties of the given object,
     * else `false`.
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {Object} object The object to search.
     * @param {Function|Object|string} [callback=identity] The function called per
     *  iteration. If a property name or object is provided it will be used to
     *  create a "_.pluck" or "_.where" style callback, respectively.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {string|undefined} Returns the key of the found element, else `undefined`.
     * @example
     *
     * var characters = {
     *   'barney': {  'age': 36, 'blocked': false },
     *   'fred': {    'age': 40, 'blocked': true },
     *   'pebbles': { 'age': 1,  'blocked': false }
     * };
     *
     * _.findKey(characters, function(chr) {
     *   return chr.age < 40;
     * });
     * // => 'barney' (property order is not guaranteed across environments)
     *
     * // using "_.where" callback shorthand
     * _.findKey(characters, { 'age': 1 });
     * // => 'pebbles'
     *
     * // using "_.pluck" callback shorthand
     * _.findKey(characters, 'blocked');
     * // => 'fred'
     */
    function findKey(object, callback, thisArg) {
      var result;
      callback = lodash.createCallback(callback, thisArg, 3);
      forOwn(object, function(value, key, object) {
        if (callback(value, key, object)) {
          result = key;
          return false;
        }
      });
      return result;
    }

    /**
     * This method is like `_.findKey` except that it iterates over elements
     * of a `collection` in the opposite order.
     *
     * If a property name is provided for `callback` the created "_.pluck" style
     * callback will return the property value of the given element.
     *
     * If an object is provided for `callback` the created "_.where" style callback
     * will return `true` for elements that have the properties of the given object,
     * else `false`.
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {Object} object The object to search.
     * @param {Function|Object|string} [callback=identity] The function called per
     *  iteration. If a property name or object is provided it will be used to
     *  create a "_.pluck" or "_.where" style callback, respectively.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {string|undefined} Returns the key of the found element, else `undefined`.
     * @example
     *
     * var characters = {
     *   'barney': {  'age': 36, 'blocked': true },
     *   'fred': {    'age': 40, 'blocked': false },
     *   'pebbles': { 'age': 1,  'blocked': true }
     * };
     *
     * _.findLastKey(characters, function(chr) {
     *   return chr.age < 40;
     * });
     * // => returns `pebbles`, assuming `_.findKey` returns `barney`
     *
     * // using "_.where" callback shorthand
     * _.findLastKey(characters, { 'age': 40 });
     * // => 'fred'
     *
     * // using "_.pluck" callback shorthand
     * _.findLastKey(characters, 'blocked');
     * // => 'pebbles'
     */
    function findLastKey(object, callback, thisArg) {
      var result;
      callback = lodash.createCallback(callback, thisArg, 3);
      forOwnRight(object, function(value, key, object) {
        if (callback(value, key, object)) {
          result = key;
          return false;
        }
      });
      return result;
    }

    /**
     * Iterates over own and inherited enumerable properties of an object,
     * executing the callback for each property. The callback is bound to `thisArg`
     * and invoked with three arguments; (value, key, object). Callbacks may exit
     * iteration early by explicitly returning `false`.
     *
     * @static
     * @memberOf _
     * @type Function
     * @category Objects
     * @param {Object} object The object to iterate over.
     * @param {Function} [callback=identity] The function called per iteration.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {Object} Returns `object`.
     * @example
     *
     * function Shape() {
     *   this.x = 0;
     *   this.y = 0;
     * }
     *
     * Shape.prototype.move = function(x, y) {
     *   this.x += x;
     *   this.y += y;
     * };
     *
     * _.forIn(new Shape, function(value, key) {
     *   console.log(key);
     * });
     * // => logs 'x', 'y', and 'move' (property order is not guaranteed across environments)
     */
    var forIn = function(collection, callback, thisArg) {
      var index, iterable = collection, result = iterable;
      if (!iterable) return result;
      if (!objectTypes[typeof iterable]) return result;
      callback = callback && typeof thisArg == 'undefined' ? callback : baseCreateCallback(callback, thisArg, 3);
        for (index in iterable) {
          if (callback(iterable[index], index, collection) === false) return result;
        }
      return result
    };

    /**
     * This method is like `_.forIn` except that it iterates over elements
     * of a `collection` in the opposite order.
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {Object} object The object to iterate over.
     * @param {Function} [callback=identity] The function called per iteration.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {Object} Returns `object`.
     * @example
     *
     * function Shape() {
     *   this.x = 0;
     *   this.y = 0;
     * }
     *
     * Shape.prototype.move = function(x, y) {
     *   this.x += x;
     *   this.y += y;
     * };
     *
     * _.forInRight(new Shape, function(value, key) {
     *   console.log(key);
     * });
     * // => logs 'move', 'y', and 'x' assuming `_.forIn ` logs 'x', 'y', and 'move'
     */
    function forInRight(object, callback, thisArg) {
      var pairs = [];

      forIn(object, function(value, key) {
        pairs.push(key, value);
      });

      var length = pairs.length;
      callback = baseCreateCallback(callback, thisArg, 3);
      while (length--) {
        if (callback(pairs[length--], pairs[length], object) === false) {
          break;
        }
      }
      return object;
    }

    /**
     * Iterates over own enumerable properties of an object, executing the callback
     * for each property. The callback is bound to `thisArg` and invoked with three
     * arguments; (value, key, object). Callbacks may exit iteration early by
     * explicitly returning `false`.
     *
     * @static
     * @memberOf _
     * @type Function
     * @category Objects
     * @param {Object} object The object to iterate over.
     * @param {Function} [callback=identity] The function called per iteration.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {Object} Returns `object`.
     * @example
     *
     * _.forOwn({ '0': 'zero', '1': 'one', 'length': 2 }, function(num, key) {
     *   console.log(key);
     * });
     * // => logs '0', '1', and 'length' (property order is not guaranteed across environments)
     */
    var forOwn = function(collection, callback, thisArg) {
      var index, iterable = collection, result = iterable;
      if (!iterable) return result;
      if (!objectTypes[typeof iterable]) return result;
      callback = callback && typeof thisArg == 'undefined' ? callback : baseCreateCallback(callback, thisArg, 3);
        var ownIndex = -1,
            ownProps = objectTypes[typeof iterable] && keys(iterable),
            length = ownProps ? ownProps.length : 0;

        while (++ownIndex < length) {
          index = ownProps[ownIndex];
          if (callback(iterable[index], index, collection) === false) return result;
        }
      return result
    };

    /**
     * This method is like `_.forOwn` except that it iterates over elements
     * of a `collection` in the opposite order.
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {Object} object The object to iterate over.
     * @param {Function} [callback=identity] The function called per iteration.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {Object} Returns `object`.
     * @example
     *
     * _.forOwnRight({ '0': 'zero', '1': 'one', 'length': 2 }, function(num, key) {
     *   console.log(key);
     * });
     * // => logs 'length', '1', and '0' assuming `_.forOwn` logs '0', '1', and 'length'
     */
    function forOwnRight(object, callback, thisArg) {
      var props = keys(object),
          length = props.length;

      callback = baseCreateCallback(callback, thisArg, 3);
      while (length--) {
        var key = props[length];
        if (callback(object[key], key, object) === false) {
          break;
        }
      }
      return object;
    }

    /**
     * Creates a sorted array of property names of all enumerable properties,
     * own and inherited, of `object` that have function values.
     *
     * @static
     * @memberOf _
     * @alias methods
     * @category Objects
     * @param {Object} object The object to inspect.
     * @returns {Array} Returns an array of property names that have function values.
     * @example
     *
     * _.functions(_);
     * // => ['all', 'any', 'bind', 'bindAll', 'clone', 'compact', 'compose', ...]
     */
    function functions(object) {
      var result = [];
      forIn(object, function(value, key) {
        if (isFunction(value)) {
          result.push(key);
        }
      });
      return result.sort();
    }

    /**
     * Checks if the specified property name exists as a direct property of `object`,
     * instead of an inherited property.
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {Object} object The object to inspect.
     * @param {string} key The name of the property to check.
     * @returns {boolean} Returns `true` if key is a direct property, else `false`.
     * @example
     *
     * _.has({ 'a': 1, 'b': 2, 'c': 3 }, 'b');
     * // => true
     */
    function has(object, key) {
      return object ? hasOwnProperty.call(object, key) : false;
    }

    /**
     * Creates an object composed of the inverted keys and values of the given object.
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {Object} object The object to invert.
     * @returns {Object} Returns the created inverted object.
     * @example
     *
     * _.invert({ 'first': 'fred', 'second': 'barney' });
     * // => { 'fred': 'first', 'barney': 'second' }
     */
    function invert(object) {
      var index = -1,
          props = keys(object),
          length = props.length,
          result = {};

      while (++index < length) {
        var key = props[index];
        result[object[key]] = key;
      }
      return result;
    }

    /**
     * Checks if `value` is a boolean value.
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if the `value` is a boolean value, else `false`.
     * @example
     *
     * _.isBoolean(null);
     * // => false
     */
    function isBoolean(value) {
      return value === true || value === false ||
        value && typeof value == 'object' && toString.call(value) == boolClass || false;
    }

    /**
     * Checks if `value` is a date.
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if the `value` is a date, else `false`.
     * @example
     *
     * _.isDate(new Date);
     * // => true
     */
    function isDate(value) {
      return value && typeof value == 'object' && toString.call(value) == dateClass || false;
    }

    /**
     * Checks if `value` is a DOM element.
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if the `value` is a DOM element, else `false`.
     * @example
     *
     * _.isElement(document.body);
     * // => true
     */
    function isElement(value) {
      return value && value.nodeType === 1 || false;
    }

    /**
     * Checks if `value` is empty. Arrays, strings, or `arguments` objects with a
     * length of `0` and objects with no own enumerable properties are considered
     * "empty".
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {Array|Object|string} value The value to inspect.
     * @returns {boolean} Returns `true` if the `value` is empty, else `false`.
     * @example
     *
     * _.isEmpty([1, 2, 3]);
     * // => false
     *
     * _.isEmpty({});
     * // => true
     *
     * _.isEmpty('');
     * // => true
     */
    function isEmpty(value) {
      var result = true;
      if (!value) {
        return result;
      }
      var className = toString.call(value),
          length = value.length;

      if ((className == arrayClass || className == stringClass || className == argsClass ) ||
          (className == objectClass && typeof length == 'number' && isFunction(value.splice))) {
        return !length;
      }
      forOwn(value, function() {
        return (result = false);
      });
      return result;
    }

    /**
     * Performs a deep comparison between two values to determine if they are
     * equivalent to each other. If a callback is provided it will be executed
     * to compare values. If the callback returns `undefined` comparisons will
     * be handled by the method instead. The callback is bound to `thisArg` and
     * invoked with two arguments; (a, b).
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {*} a The value to compare.
     * @param {*} b The other value to compare.
     * @param {Function} [callback] The function to customize comparing values.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {boolean} Returns `true` if the values are equivalent, else `false`.
     * @example
     *
     * var object = { 'name': 'fred' };
     * var copy = { 'name': 'fred' };
     *
     * object == copy;
     * // => false
     *
     * _.isEqual(object, copy);
     * // => true
     *
     * var words = ['hello', 'goodbye'];
     * var otherWords = ['hi', 'goodbye'];
     *
     * _.isEqual(words, otherWords, function(a, b) {
     *   var reGreet = /^(?:hello|hi)$/i,
     *       aGreet = _.isString(a) && reGreet.test(a),
     *       bGreet = _.isString(b) && reGreet.test(b);
     *
     *   return (aGreet || bGreet) ? (aGreet == bGreet) : undefined;
     * });
     * // => true
     */
    function isEqual(a, b, callback, thisArg) {
      return baseIsEqual(a, b, typeof callback == 'function' && baseCreateCallback(callback, thisArg, 2));
    }

    /**
     * Checks if `value` is, or can be coerced to, a finite number.
     *
     * Note: This is not the same as native `isFinite` which will return true for
     * booleans and empty strings. See http://es5.github.io/#x15.1.2.5.
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if the `value` is finite, else `false`.
     * @example
     *
     * _.isFinite(-101);
     * // => true
     *
     * _.isFinite('10');
     * // => true
     *
     * _.isFinite(true);
     * // => false
     *
     * _.isFinite('');
     * // => false
     *
     * _.isFinite(Infinity);
     * // => false
     */
    function isFinite(value) {
      return nativeIsFinite(value) && !nativeIsNaN(parseFloat(value));
    }

    /**
     * Checks if `value` is a function.
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if the `value` is a function, else `false`.
     * @example
     *
     * _.isFunction(_);
     * // => true
     */
    function isFunction(value) {
      return typeof value == 'function';
    }

    /**
     * Checks if `value` is the language type of Object.
     * (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if the `value` is an object, else `false`.
     * @example
     *
     * _.isObject({});
     * // => true
     *
     * _.isObject([1, 2, 3]);
     * // => true
     *
     * _.isObject(1);
     * // => false
     */
    function isObject(value) {
      // check if the value is the ECMAScript language type of Object
      // http://es5.github.io/#x8
      // and avoid a V8 bug
      // http://code.google.com/p/v8/issues/detail?id=2291
      return !!(value && objectTypes[typeof value]);
    }

    /**
     * Checks if `value` is `NaN`.
     *
     * Note: This is not the same as native `isNaN` which will return `true` for
     * `undefined` and other non-numeric values. See http://es5.github.io/#x15.1.2.4.
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if the `value` is `NaN`, else `false`.
     * @example
     *
     * _.isNaN(NaN);
     * // => true
     *
     * _.isNaN(new Number(NaN));
     * // => true
     *
     * isNaN(undefined);
     * // => true
     *
     * _.isNaN(undefined);
     * // => false
     */
    function isNaN(value) {
      // `NaN` as a primitive is the only value that is not equal to itself
      // (perform the [[Class]] check first to avoid errors with some host objects in IE)
      return isNumber(value) && value != +value;
    }

    /**
     * Checks if `value` is `null`.
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if the `value` is `null`, else `false`.
     * @example
     *
     * _.isNull(null);
     * // => true
     *
     * _.isNull(undefined);
     * // => false
     */
    function isNull(value) {
      return value === null;
    }

    /**
     * Checks if `value` is a number.
     *
     * Note: `NaN` is considered a number. See http://es5.github.io/#x8.5.
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if the `value` is a number, else `false`.
     * @example
     *
     * _.isNumber(8.4 * 5);
     * // => true
     */
    function isNumber(value) {
      return typeof value == 'number' ||
        value && typeof value == 'object' && toString.call(value) == numberClass || false;
    }

    /**
     * Checks if `value` is an object created by the `Object` constructor.
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is a plain object, else `false`.
     * @example
     *
     * function Shape() {
     *   this.x = 0;
     *   this.y = 0;
     * }
     *
     * _.isPlainObject(new Shape);
     * // => false
     *
     * _.isPlainObject([1, 2, 3]);
     * // => false
     *
     * _.isPlainObject({ 'x': 0, 'y': 0 });
     * // => true
     */
    var isPlainObject = !getPrototypeOf ? shimIsPlainObject : function(value) {
      if (!(value && toString.call(value) == objectClass)) {
        return false;
      }
      var valueOf = value.valueOf,
          objProto = isNative(valueOf) && (objProto = getPrototypeOf(valueOf)) && getPrototypeOf(objProto);

      return objProto
        ? (value == objProto || getPrototypeOf(value) == objProto)
        : shimIsPlainObject(value);
    };

    /**
     * Checks if `value` is a regular expression.
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if the `value` is a regular expression, else `false`.
     * @example
     *
     * _.isRegExp(/fred/);
     * // => true
     */
    function isRegExp(value) {
      return value && typeof value == 'object' && toString.call(value) == regexpClass || false;
    }

    /**
     * Checks if `value` is a string.
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if the `value` is a string, else `false`.
     * @example
     *
     * _.isString('fred');
     * // => true
     */
    function isString(value) {
      return typeof value == 'string' ||
        value && typeof value == 'object' && toString.call(value) == stringClass || false;
    }

    /**
     * Checks if `value` is `undefined`.
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if the `value` is `undefined`, else `false`.
     * @example
     *
     * _.isUndefined(void 0);
     * // => true
     */
    function isUndefined(value) {
      return typeof value == 'undefined';
    }

    /**
     * Creates an object with the same keys as `object` and values generated by
     * running each own enumerable property of `object` through the callback.
     * The callback is bound to `thisArg` and invoked with three arguments;
     * (value, key, object).
     *
     * If a property name is provided for `callback` the created "_.pluck" style
     * callback will return the property value of the given element.
     *
     * If an object is provided for `callback` the created "_.where" style callback
     * will return `true` for elements that have the properties of the given object,
     * else `false`.
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {Object} object The object to iterate over.
     * @param {Function|Object|string} [callback=identity] The function called
     *  per iteration. If a property name or object is provided it will be used
     *  to create a "_.pluck" or "_.where" style callback, respectively.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {Array} Returns a new object with values of the results of each `callback` execution.
     * @example
     *
     * _.mapValues({ 'a': 1, 'b': 2, 'c': 3} , function(num) { return num * 3; });
     * // => { 'a': 3, 'b': 6, 'c': 9 }
     *
     * var characters = {
     *   'fred': { 'name': 'fred', 'age': 40 },
     *   'pebbles': { 'name': 'pebbles', 'age': 1 }
     * };
     *
     * // using "_.pluck" callback shorthand
     * _.mapValues(characters, 'age');
     * // => { 'fred': 40, 'pebbles': 1 }
     */
    function mapValues(object, callback, thisArg) {
      var result = {};
      callback = lodash.createCallback(callback, thisArg, 3);

      forOwn(object, function(value, key, object) {
        result[key] = callback(value, key, object);
      });
      return result;
    }

    /**
     * Recursively merges own enumerable properties of the source object(s), that
     * don't resolve to `undefined` into the destination object. Subsequent sources
     * will overwrite property assignments of previous sources. If a callback is
     * provided it will be executed to produce the merged values of the destination
     * and source properties. If the callback returns `undefined` merging will
     * be handled by the method instead. The callback is bound to `thisArg` and
     * invoked with two arguments; (objectValue, sourceValue).
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {Object} object The destination object.
     * @param {...Object} [source] The source objects.
     * @param {Function} [callback] The function to customize merging properties.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {Object} Returns the destination object.
     * @example
     *
     * var names = {
     *   'characters': [
     *     { 'name': 'barney' },
     *     { 'name': 'fred' }
     *   ]
     * };
     *
     * var ages = {
     *   'characters': [
     *     { 'age': 36 },
     *     { 'age': 40 }
     *   ]
     * };
     *
     * _.merge(names, ages);
     * // => { 'characters': [{ 'name': 'barney', 'age': 36 }, { 'name': 'fred', 'age': 40 }] }
     *
     * var food = {
     *   'fruits': ['apple'],
     *   'vegetables': ['beet']
     * };
     *
     * var otherFood = {
     *   'fruits': ['banana'],
     *   'vegetables': ['carrot']
     * };
     *
     * _.merge(food, otherFood, function(a, b) {
     *   return _.isArray(a) ? a.concat(b) : undefined;
     * });
     * // => { 'fruits': ['apple', 'banana'], 'vegetables': ['beet', 'carrot] }
     */
    function merge(object) {
      var args = arguments,
          length = 2;

      if (!isObject(object)) {
        return object;
      }
      // allows working with `_.reduce` and `_.reduceRight` without using
      // their `index` and `collection` arguments
      if (typeof args[2] != 'number') {
        length = args.length;
      }
      if (length > 3 && typeof args[length - 2] == 'function') {
        var callback = baseCreateCallback(args[--length - 1], args[length--], 2);
      } else if (length > 2 && typeof args[length - 1] == 'function') {
        callback = args[--length];
      }
      var sources = slice(arguments, 1, length),
          index = -1,
          stackA = getArray(),
          stackB = getArray();

      while (++index < length) {
        baseMerge(object, sources[index], callback, stackA, stackB);
      }
      releaseArray(stackA);
      releaseArray(stackB);
      return object;
    }

    /**
     * Creates a shallow clone of `object` excluding the specified properties.
     * Property names may be specified as individual arguments or as arrays of
     * property names. If a callback is provided it will be executed for each
     * property of `object` omitting the properties the callback returns truey
     * for. The callback is bound to `thisArg` and invoked with three arguments;
     * (value, key, object).
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {Object} object The source object.
     * @param {Function|...string|string[]} [callback] The properties to omit or the
     *  function called per iteration.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {Object} Returns an object without the omitted properties.
     * @example
     *
     * _.omit({ 'name': 'fred', 'age': 40 }, 'age');
     * // => { 'name': 'fred' }
     *
     * _.omit({ 'name': 'fred', 'age': 40 }, function(value) {
     *   return typeof value == 'number';
     * });
     * // => { 'name': 'fred' }
     */
    function omit(object, callback, thisArg) {
      var result = {};
      if (typeof callback != 'function') {
        var props = [];
        forIn(object, function(value, key) {
          props.push(key);
        });
        props = baseDifference(props, baseFlatten(arguments, true, false, 1));

        var index = -1,
            length = props.length;

        while (++index < length) {
          var key = props[index];
          result[key] = object[key];
        }
      } else {
        callback = lodash.createCallback(callback, thisArg, 3);
        forIn(object, function(value, key, object) {
          if (!callback(value, key, object)) {
            result[key] = value;
          }
        });
      }
      return result;
    }

    /**
     * Creates a two dimensional array of an object's key-value pairs,
     * i.e. `[[key1, value1], [key2, value2]]`.
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {Object} object The object to inspect.
     * @returns {Array} Returns new array of key-value pairs.
     * @example
     *
     * _.pairs({ 'barney': 36, 'fred': 40 });
     * // => [['barney', 36], ['fred', 40]] (property order is not guaranteed across environments)
     */
    function pairs(object) {
      var index = -1,
          props = keys(object),
          length = props.length,
          result = Array(length);

      while (++index < length) {
        var key = props[index];
        result[index] = [key, object[key]];
      }
      return result;
    }

    /**
     * Creates a shallow clone of `object` composed of the specified properties.
     * Property names may be specified as individual arguments or as arrays of
     * property names. If a callback is provided it will be executed for each
     * property of `object` picking the properties the callback returns truey
     * for. The callback is bound to `thisArg` and invoked with three arguments;
     * (value, key, object).
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {Object} object The source object.
     * @param {Function|...string|string[]} [callback] The function called per
     *  iteration or property names to pick, specified as individual property
     *  names or arrays of property names.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {Object} Returns an object composed of the picked properties.
     * @example
     *
     * _.pick({ 'name': 'fred', '_userid': 'fred1' }, 'name');
     * // => { 'name': 'fred' }
     *
     * _.pick({ 'name': 'fred', '_userid': 'fred1' }, function(value, key) {
     *   return key.charAt(0) != '_';
     * });
     * // => { 'name': 'fred' }
     */
    function pick(object, callback, thisArg) {
      var result = {};
      if (typeof callback != 'function') {
        var index = -1,
            props = baseFlatten(arguments, true, false, 1),
            length = isObject(object) ? props.length : 0;

        while (++index < length) {
          var key = props[index];
          if (key in object) {
            result[key] = object[key];
          }
        }
      } else {
        callback = lodash.createCallback(callback, thisArg, 3);
        forIn(object, function(value, key, object) {
          if (callback(value, key, object)) {
            result[key] = value;
          }
        });
      }
      return result;
    }

    /**
     * An alternative to `_.reduce` this method transforms `object` to a new
     * `accumulator` object which is the result of running each of its own
     * enumerable properties through a callback, with each callback execution
     * potentially mutating the `accumulator` object. The callback is bound to
     * `thisArg` and invoked with four arguments; (accumulator, value, key, object).
     * Callbacks may exit iteration early by explicitly returning `false`.
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {Array|Object} object The object to iterate over.
     * @param {Function} [callback=identity] The function called per iteration.
     * @param {*} [accumulator] The custom accumulator value.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {*} Returns the accumulated value.
     * @example
     *
     * var squares = _.transform([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], function(result, num) {
     *   num *= num;
     *   if (num % 2) {
     *     return result.push(num) < 3;
     *   }
     * });
     * // => [1, 9, 25]
     *
     * var mapped = _.transform({ 'a': 1, 'b': 2, 'c': 3 }, function(result, num, key) {
     *   result[key] = num * 3;
     * });
     * // => { 'a': 3, 'b': 6, 'c': 9 }
     */
    function transform(object, callback, accumulator, thisArg) {
      var isArr = isArray(object);
      if (accumulator == null) {
        if (isArr) {
          accumulator = [];
        } else {
          var ctor = object && object.constructor,
              proto = ctor && ctor.prototype;

          accumulator = baseCreate(proto);
        }
      }
      if (callback) {
        callback = lodash.createCallback(callback, thisArg, 4);
        (isArr ? forEach : forOwn)(object, function(value, index, object) {
          return callback(accumulator, value, index, object);
        });
      }
      return accumulator;
    }

    /**
     * Creates an array composed of the own enumerable property values of `object`.
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {Object} object The object to inspect.
     * @returns {Array} Returns an array of property values.
     * @example
     *
     * _.values({ 'one': 1, 'two': 2, 'three': 3 });
     * // => [1, 2, 3] (property order is not guaranteed across environments)
     */
    function values(object) {
      var index = -1,
          props = keys(object),
          length = props.length,
          result = Array(length);

      while (++index < length) {
        result[index] = object[props[index]];
      }
      return result;
    }

    /*--------------------------------------------------------------------------*/

    /**
     * Creates an array of elements from the specified indexes, or keys, of the
     * `collection`. Indexes may be specified as individual arguments or as arrays
     * of indexes.
     *
     * @static
     * @memberOf _
     * @category Collections
     * @param {Array|Object|string} collection The collection to iterate over.
     * @param {...(number|number[]|string|string[])} [index] The indexes of `collection`
     *   to retrieve, specified as individual indexes or arrays of indexes.
     * @returns {Array} Returns a new array of elements corresponding to the
     *  provided indexes.
     * @example
     *
     * _.at(['a', 'b', 'c', 'd', 'e'], [0, 2, 4]);
     * // => ['a', 'c', 'e']
     *
     * _.at(['fred', 'barney', 'pebbles'], 0, 2);
     * // => ['fred', 'pebbles']
     */
    function at(collection) {
      var args = arguments,
          index = -1,
          props = baseFlatten(args, true, false, 1),
          length = (args[2] && args[2][args[1]] === collection) ? 1 : props.length,
          result = Array(length);

      while(++index < length) {
        result[index] = collection[props[index]];
      }
      return result;
    }

    /**
     * Checks if a given value is present in a collection using strict equality
     * for comparisons, i.e. `===`. If `fromIndex` is negative, it is used as the
     * offset from the end of the collection.
     *
     * @static
     * @memberOf _
     * @alias include
     * @category Collections
     * @param {Array|Object|string} collection The collection to iterate over.
     * @param {*} target The value to check for.
     * @param {number} [fromIndex=0] The index to search from.
     * @returns {boolean} Returns `true` if the `target` element is found, else `false`.
     * @example
     *
     * _.contains([1, 2, 3], 1);
     * // => true
     *
     * _.contains([1, 2, 3], 1, 2);
     * // => false
     *
     * _.contains({ 'name': 'fred', 'age': 40 }, 'fred');
     * // => true
     *
     * _.contains('pebbles', 'eb');
     * // => true
     */
    function contains(collection, target, fromIndex) {
      var index = -1,
          indexOf = getIndexOf(),
          length = collection ? collection.length : 0,
          result = false;

      fromIndex = (fromIndex < 0 ? nativeMax(0, length + fromIndex) : fromIndex) || 0;
      if (isArray(collection)) {
        result = indexOf(collection, target, fromIndex) > -1;
      } else if (typeof length == 'number') {
        result = (isString(collection) ? collection.indexOf(target, fromIndex) : indexOf(collection, target, fromIndex)) > -1;
      } else {
        forOwn(collection, function(value) {
          if (++index >= fromIndex) {
            return !(result = value === target);
          }
        });
      }
      return result;
    }

    /**
     * Creates an object composed of keys generated from the results of running
     * each element of `collection` through the callback. The corresponding value
     * of each key is the number of times the key was returned by the callback.
     * The callback is bound to `thisArg` and invoked with three arguments;
     * (value, index|key, collection).
     *
     * If a property name is provided for `callback` the created "_.pluck" style
     * callback will return the property value of the given element.
     *
     * If an object is provided for `callback` the created "_.where" style callback
     * will return `true` for elements that have the properties of the given object,
     * else `false`.
     *
     * @static
     * @memberOf _
     * @category Collections
     * @param {Array|Object|string} collection The collection to iterate over.
     * @param {Function|Object|string} [callback=identity] The function called
     *  per iteration. If a property name or object is provided it will be used
     *  to create a "_.pluck" or "_.where" style callback, respectively.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {Object} Returns the composed aggregate object.
     * @example
     *
     * _.countBy([4.3, 6.1, 6.4], function(num) { return Math.floor(num); });
     * // => { '4': 1, '6': 2 }
     *
     * _.countBy([4.3, 6.1, 6.4], function(num) { return this.floor(num); }, Math);
     * // => { '4': 1, '6': 2 }
     *
     * _.countBy(['one', 'two', 'three'], 'length');
     * // => { '3': 2, '5': 1 }
     */
    var countBy = createAggregator(function(result, value, key) {
      (hasOwnProperty.call(result, key) ? result[key]++ : result[key] = 1);
    });

    /**
     * Checks if the given callback returns truey value for **all** elements of
     * a collection. The callback is bound to `thisArg` and invoked with three
     * arguments; (value, index|key, collection).
     *
     * If a property name is provided for `callback` the created "_.pluck" style
     * callback will return the property value of the given element.
     *
     * If an object is provided for `callback` the created "_.where" style callback
     * will return `true` for elements that have the properties of the given object,
     * else `false`.
     *
     * @static
     * @memberOf _
     * @alias all
     * @category Collections
     * @param {Array|Object|string} collection The collection to iterate over.
     * @param {Function|Object|string} [callback=identity] The function called
     *  per iteration. If a property name or object is provided it will be used
     *  to create a "_.pluck" or "_.where" style callback, respectively.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {boolean} Returns `true` if all elements passed the callback check,
     *  else `false`.
     * @example
     *
     * _.every([true, 1, null, 'yes']);
     * // => false
     *
     * var characters = [
     *   { 'name': 'barney', 'age': 36 },
     *   { 'name': 'fred',   'age': 40 }
     * ];
     *
     * // using "_.pluck" callback shorthand
     * _.every(characters, 'age');
     * // => true
     *
     * // using "_.where" callback shorthand
     * _.every(characters, { 'age': 36 });
     * // => false
     */
    function every(collection, callback, thisArg) {
      var result = true;
      callback = lodash.createCallback(callback, thisArg, 3);

      var index = -1,
          length = collection ? collection.length : 0;

      if (typeof length == 'number') {
        while (++index < length) {
          if (!(result = !!callback(collection[index], index, collection))) {
            break;
          }
        }
      } else {
        forOwn(collection, function(value, index, collection) {
          return (result = !!callback(value, index, collection));
        });
      }
      return result;
    }

    /**
     * Iterates over elements of a collection, returning an array of all elements
     * the callback returns truey for. The callback is bound to `thisArg` and
     * invoked with three arguments; (value, index|key, collection).
     *
     * If a property name is provided for `callback` the created "_.pluck" style
     * callback will return the property value of the given element.
     *
     * If an object is provided for `callback` the created "_.where" style callback
     * will return `true` for elements that have the properties of the given object,
     * else `false`.
     *
     * @static
     * @memberOf _
     * @alias select
     * @category Collections
     * @param {Array|Object|string} collection The collection to iterate over.
     * @param {Function|Object|string} [callback=identity] The function called
     *  per iteration. If a property name or object is provided it will be used
     *  to create a "_.pluck" or "_.where" style callback, respectively.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {Array} Returns a new array of elements that passed the callback check.
     * @example
     *
     * var evens = _.filter([1, 2, 3, 4, 5, 6], function(num) { return num % 2 == 0; });
     * // => [2, 4, 6]
     *
     * var characters = [
     *   { 'name': 'barney', 'age': 36, 'blocked': false },
     *   { 'name': 'fred',   'age': 40, 'blocked': true }
     * ];
     *
     * // using "_.pluck" callback shorthand
     * _.filter(characters, 'blocked');
     * // => [{ 'name': 'fred', 'age': 40, 'blocked': true }]
     *
     * // using "_.where" callback shorthand
     * _.filter(characters, { 'age': 36 });
     * // => [{ 'name': 'barney', 'age': 36, 'blocked': false }]
     */
    function filter(collection, callback, thisArg) {
      var result = [];
      callback = lodash.createCallback(callback, thisArg, 3);

      var index = -1,
          length = collection ? collection.length : 0;

      if (typeof length == 'number') {
        while (++index < length) {
          var value = collection[index];
          if (callback(value, index, collection)) {
            result.push(value);
          }
        }
      } else {
        forOwn(collection, function(value, index, collection) {
          if (callback(value, index, collection)) {
            result.push(value);
          }
        });
      }
      return result;
    }

    /**
     * Iterates over elements of a collection, returning the first element that
     * the callback returns truey for. The callback is bound to `thisArg` and
     * invoked with three arguments; (value, index|key, collection).
     *
     * If a property name is provided for `callback` the created "_.pluck" style
     * callback will return the property value of the given element.
     *
     * If an object is provided for `callback` the created "_.where" style callback
     * will return `true` for elements that have the properties of the given object,
     * else `false`.
     *
     * @static
     * @memberOf _
     * @alias detect, findWhere
     * @category Collections
     * @param {Array|Object|string} collection The collection to iterate over.
     * @param {Function|Object|string} [callback=identity] The function called
     *  per iteration. If a property name or object is provided it will be used
     *  to create a "_.pluck" or "_.where" style callback, respectively.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {*} Returns the found element, else `undefined`.
     * @example
     *
     * var characters = [
     *   { 'name': 'barney',  'age': 36, 'blocked': false },
     *   { 'name': 'fred',    'age': 40, 'blocked': true },
     *   { 'name': 'pebbles', 'age': 1,  'blocked': false }
     * ];
     *
     * _.find(characters, function(chr) {
     *   return chr.age < 40;
     * });
     * // => { 'name': 'barney', 'age': 36, 'blocked': false }
     *
     * // using "_.where" callback shorthand
     * _.find(characters, { 'age': 1 });
     * // =>  { 'name': 'pebbles', 'age': 1, 'blocked': false }
     *
     * // using "_.pluck" callback shorthand
     * _.find(characters, 'blocked');
     * // => { 'name': 'fred', 'age': 40, 'blocked': true }
     */
    function find(collection, callback, thisArg) {
      callback = lodash.createCallback(callback, thisArg, 3);

      var index = -1,
          length = collection ? collection.length : 0;

      if (typeof length == 'number') {
        while (++index < length) {
          var value = collection[index];
          if (callback(value, index, collection)) {
            return value;
          }
        }
      } else {
        var result;
        forOwn(collection, function(value, index, collection) {
          if (callback(value, index, collection)) {
            result = value;
            return false;
          }
        });
        return result;
      }
    }

    /**
     * This method is like `_.find` except that it iterates over elements
     * of a `collection` from right to left.
     *
     * @static
     * @memberOf _
     * @category Collections
     * @param {Array|Object|string} collection The collection to iterate over.
     * @param {Function|Object|string} [callback=identity] The function called
     *  per iteration. If a property name or object is provided it will be used
     *  to create a "_.pluck" or "_.where" style callback, respectively.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {*} Returns the found element, else `undefined`.
     * @example
     *
     * _.findLast([1, 2, 3, 4], function(num) {
     *   return num % 2 == 1;
     * });
     * // => 3
     */
    function findLast(collection, callback, thisArg) {
      var result;
      callback = lodash.createCallback(callback, thisArg, 3);
      forEachRight(collection, function(value, index, collection) {
        if (callback(value, index, collection)) {
          result = value;
          return false;
        }
      });
      return result;
    }

    /**
     * Iterates over elements of a collection, executing the callback for each
     * element. The callback is bound to `thisArg` and invoked with three arguments;
     * (value, index|key, collection). Callbacks may exit iteration early by
     * explicitly returning `false`.
     *
     * Note: As with other "Collections" methods, objects with a `length` property
     * are iterated like arrays. To avoid this behavior `_.forIn` or `_.forOwn`
     * may be used for object iteration.
     *
     * @static
     * @memberOf _
     * @alias each
     * @category Collections
     * @param {Array|Object|string} collection The collection to iterate over.
     * @param {Function} [callback=identity] The function called per iteration.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {Array|Object|string} Returns `collection`.
     * @example
     *
     * _([1, 2, 3]).forEach(function(num) { console.log(num); }).join(',');
     * // => logs each number and returns '1,2,3'
     *
     * _.forEach({ 'one': 1, 'two': 2, 'three': 3 }, function(num) { console.log(num); });
     * // => logs each number and returns the object (property order is not guaranteed across environments)
     */
    function forEach(collection, callback, thisArg) {
      var index = -1,
          length = collection ? collection.length : 0;

      callback = callback && typeof thisArg == 'undefined' ? callback : baseCreateCallback(callback, thisArg, 3);
      if (typeof length == 'number') {
        while (++index < length) {
          if (callback(collection[index], index, collection) === false) {
            break;
          }
        }
      } else {
        forOwn(collection, callback);
      }
      return collection;
    }

    /**
     * This method is like `_.forEach` except that it iterates over elements
     * of a `collection` from right to left.
     *
     * @static
     * @memberOf _
     * @alias eachRight
     * @category Collections
     * @param {Array|Object|string} collection The collection to iterate over.
     * @param {Function} [callback=identity] The function called per iteration.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {Array|Object|string} Returns `collection`.
     * @example
     *
     * _([1, 2, 3]).forEachRight(function(num) { console.log(num); }).join(',');
     * // => logs each number from right to left and returns '3,2,1'
     */
    function forEachRight(collection, callback, thisArg) {
      var length = collection ? collection.length : 0;
      callback = callback && typeof thisArg == 'undefined' ? callback : baseCreateCallback(callback, thisArg, 3);
      if (typeof length == 'number') {
        while (length--) {
          if (callback(collection[length], length, collection) === false) {
            break;
          }
        }
      } else {
        var props = keys(collection);
        length = props.length;
        forOwn(collection, function(value, key, collection) {
          key = props ? props[--length] : --length;
          return callback(collection[key], key, collection);
        });
      }
      return collection;
    }

    /**
     * Creates an object composed of keys generated from the results of running
     * each element of a collection through the callback. The corresponding value
     * of each key is an array of the elements responsible for generating the key.
     * The callback is bound to `thisArg` and invoked with three arguments;
     * (value, index|key, collection).
     *
     * If a property name is provided for `callback` the created "_.pluck" style
     * callback will return the property value of the given element.
     *
     * If an object is provided for `callback` the created "_.where" style callback
     * will return `true` for elements that have the properties of the given object,
     * else `false`
     *
     * @static
     * @memberOf _
     * @category Collections
     * @param {Array|Object|string} collection The collection to iterate over.
     * @param {Function|Object|string} [callback=identity] The function called
     *  per iteration. If a property name or object is provided it will be used
     *  to create a "_.pluck" or "_.where" style callback, respectively.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {Object} Returns the composed aggregate object.
     * @example
     *
     * _.groupBy([4.2, 6.1, 6.4], function(num) { return Math.floor(num); });
     * // => { '4': [4.2], '6': [6.1, 6.4] }
     *
     * _.groupBy([4.2, 6.1, 6.4], function(num) { return this.floor(num); }, Math);
     * // => { '4': [4.2], '6': [6.1, 6.4] }
     *
     * // using "_.pluck" callback shorthand
     * _.groupBy(['one', 'two', 'three'], 'length');
     * // => { '3': ['one', 'two'], '5': ['three'] }
     */
    var groupBy = createAggregator(function(result, value, key) {
      (hasOwnProperty.call(result, key) ? result[key] : result[key] = []).push(value);
    });

    /**
     * Creates an object composed of keys generated from the results of running
     * each element of the collection through the given callback. The corresponding
     * value of each key is the last element responsible for generating the key.
     * The callback is bound to `thisArg` and invoked with three arguments;
     * (value, index|key, collection).
     *
     * If a property name is provided for `callback` the created "_.pluck" style
     * callback will return the property value of the given element.
     *
     * If an object is provided for `callback` the created "_.where" style callback
     * will return `true` for elements that have the properties of the given object,
     * else `false`.
     *
     * @static
     * @memberOf _
     * @category Collections
     * @param {Array|Object|string} collection The collection to iterate over.
     * @param {Function|Object|string} [callback=identity] The function called
     *  per iteration. If a property name or object is provided it will be used
     *  to create a "_.pluck" or "_.where" style callback, respectively.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {Object} Returns the composed aggregate object.
     * @example
     *
     * var keys = [
     *   { 'dir': 'left', 'code': 97 },
     *   { 'dir': 'right', 'code': 100 }
     * ];
     *
     * _.indexBy(keys, 'dir');
     * // => { 'left': { 'dir': 'left', 'code': 97 }, 'right': { 'dir': 'right', 'code': 100 } }
     *
     * _.indexBy(keys, function(key) { return String.fromCharCode(key.code); });
     * // => { 'a': { 'dir': 'left', 'code': 97 }, 'd': { 'dir': 'right', 'code': 100 } }
     *
     * _.indexBy(characters, function(key) { this.fromCharCode(key.code); }, String);
     * // => { 'a': { 'dir': 'left', 'code': 97 }, 'd': { 'dir': 'right', 'code': 100 } }
     */
    var indexBy = createAggregator(function(result, value, key) {
      result[key] = value;
    });

    /**
     * Invokes the method named by `methodName` on each element in the `collection`
     * returning an array of the results of each invoked method. Additional arguments
     * will be provided to each invoked method. If `methodName` is a function it
     * will be invoked for, and `this` bound to, each element in the `collection`.
     *
     * @static
     * @memberOf _
     * @category Collections
     * @param {Array|Object|string} collection The collection to iterate over.
     * @param {Function|string} methodName The name of the method to invoke or
     *  the function invoked per iteration.
     * @param {...*} [arg] Arguments to invoke the method with.
     * @returns {Array} Returns a new array of the results of each invoked method.
     * @example
     *
     * _.invoke([[5, 1, 7], [3, 2, 1]], 'sort');
     * // => [[1, 5, 7], [1, 2, 3]]
     *
     * _.invoke([123, 456], String.prototype.split, '');
     * // => [['1', '2', '3'], ['4', '5', '6']]
     */
    function invoke(collection, methodName) {
      var args = slice(arguments, 2),
          index = -1,
          isFunc = typeof methodName == 'function',
          length = collection ? collection.length : 0,
          result = Array(typeof length == 'number' ? length : 0);

      forEach(collection, function(value) {
        result[++index] = (isFunc ? methodName : value[methodName]).apply(value, args);
      });
      return result;
    }

    /**
     * Creates an array of values by running each element in the collection
     * through the callback. The callback is bound to `thisArg` and invoked with
     * three arguments; (value, index|key, collection).
     *
     * If a property name is provided for `callback` the created "_.pluck" style
     * callback will return the property value of the given element.
     *
     * If an object is provided for `callback` the created "_.where" style callback
     * will return `true` for elements that have the properties of the given object,
     * else `false`.
     *
     * @static
     * @memberOf _
     * @alias collect
     * @category Collections
     * @param {Array|Object|string} collection The collection to iterate over.
     * @param {Function|Object|string} [callback=identity] The function called
     *  per iteration. If a property name or object is provided it will be used
     *  to create a "_.pluck" or "_.where" style callback, respectively.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {Array} Returns a new array of the results of each `callback` execution.
     * @example
     *
     * _.map([1, 2, 3], function(num) { return num * 3; });
     * // => [3, 6, 9]
     *
     * _.map({ 'one': 1, 'two': 2, 'three': 3 }, function(num) { return num * 3; });
     * // => [3, 6, 9] (property order is not guaranteed across environments)
     *
     * var characters = [
     *   { 'name': 'barney', 'age': 36 },
     *   { 'name': 'fred',   'age': 40 }
     * ];
     *
     * // using "_.pluck" callback shorthand
     * _.map(characters, 'name');
     * // => ['barney', 'fred']
     */
    function map(collection, callback, thisArg) {
      var index = -1,
          length = collection ? collection.length : 0;

      callback = lodash.createCallback(callback, thisArg, 3);
      if (typeof length == 'number') {
        var result = Array(length);
        while (++index < length) {
          result[index] = callback(collection[index], index, collection);
        }
      } else {
        result = [];
        forOwn(collection, function(value, key, collection) {
          result[++index] = callback(value, key, collection);
        });
      }
      return result;
    }

    /**
     * Retrieves the maximum value of a collection. If the collection is empty or
     * falsey `-Infinity` is returned. If a callback is provided it will be executed
     * for each value in the collection to generate the criterion by which the value
     * is ranked. The callback is bound to `thisArg` and invoked with three
     * arguments; (value, index, collection).
     *
     * If a property name is provided for `callback` the created "_.pluck" style
     * callback will return the property value of the given element.
     *
     * If an object is provided for `callback` the created "_.where" style callback
     * will return `true` for elements that have the properties of the given object,
     * else `false`.
     *
     * @static
     * @memberOf _
     * @category Collections
     * @param {Array|Object|string} collection The collection to iterate over.
     * @param {Function|Object|string} [callback=identity] The function called
     *  per iteration. If a property name or object is provided it will be used
     *  to create a "_.pluck" or "_.where" style callback, respectively.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {*} Returns the maximum value.
     * @example
     *
     * _.max([4, 2, 8, 6]);
     * // => 8
     *
     * var characters = [
     *   { 'name': 'barney', 'age': 36 },
     *   { 'name': 'fred',   'age': 40 }
     * ];
     *
     * _.max(characters, function(chr) { return chr.age; });
     * // => { 'name': 'fred', 'age': 40 };
     *
     * // using "_.pluck" callback shorthand
     * _.max(characters, 'age');
     * // => { 'name': 'fred', 'age': 40 };
     */
    function max(collection, callback, thisArg) {
      var computed = -Infinity,
          result = computed;

      // allows working with functions like `_.map` without using
      // their `index` argument as a callback
      if (typeof callback != 'function' && thisArg && thisArg[callback] === collection) {
        callback = null;
      }
      if (callback == null && isArray(collection)) {
        var index = -1,
            length = collection.length;

        while (++index < length) {
          var value = collection[index];
          if (value > result) {
            result = value;
          }
        }
      } else {
        callback = (callback == null && isString(collection))
          ? charAtCallback
          : lodash.createCallback(callback, thisArg, 3);

        forEach(collection, function(value, index, collection) {
          var current = callback(value, index, collection);
          if (current > computed) {
            computed = current;
            result = value;
          }
        });
      }
      return result;
    }

    /**
     * Retrieves the minimum value of a collection. If the collection is empty or
     * falsey `Infinity` is returned. If a callback is provided it will be executed
     * for each value in the collection to generate the criterion by which the value
     * is ranked. The callback is bound to `thisArg` and invoked with three
     * arguments; (value, index, collection).
     *
     * If a property name is provided for `callback` the created "_.pluck" style
     * callback will return the property value of the given element.
     *
     * If an object is provided for `callback` the created "_.where" style callback
     * will return `true` for elements that have the properties of the given object,
     * else `false`.
     *
     * @static
     * @memberOf _
     * @category Collections
     * @param {Array|Object|string} collection The collection to iterate over.
     * @param {Function|Object|string} [callback=identity] The function called
     *  per iteration. If a property name or object is provided it will be used
     *  to create a "_.pluck" or "_.where" style callback, respectively.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {*} Returns the minimum value.
     * @example
     *
     * _.min([4, 2, 8, 6]);
     * // => 2
     *
     * var characters = [
     *   { 'name': 'barney', 'age': 36 },
     *   { 'name': 'fred',   'age': 40 }
     * ];
     *
     * _.min(characters, function(chr) { return chr.age; });
     * // => { 'name': 'barney', 'age': 36 };
     *
     * // using "_.pluck" callback shorthand
     * _.min(characters, 'age');
     * // => { 'name': 'barney', 'age': 36 };
     */
    function min(collection, callback, thisArg) {
      var computed = Infinity,
          result = computed;

      // allows working with functions like `_.map` without using
      // their `index` argument as a callback
      if (typeof callback != 'function' && thisArg && thisArg[callback] === collection) {
        callback = null;
      }
      if (callback == null && isArray(collection)) {
        var index = -1,
            length = collection.length;

        while (++index < length) {
          var value = collection[index];
          if (value < result) {
            result = value;
          }
        }
      } else {
        callback = (callback == null && isString(collection))
          ? charAtCallback
          : lodash.createCallback(callback, thisArg, 3);

        forEach(collection, function(value, index, collection) {
          var current = callback(value, index, collection);
          if (current < computed) {
            computed = current;
            result = value;
          }
        });
      }
      return result;
    }

    /**
     * Retrieves the value of a specified property from all elements in the collection.
     *
     * @static
     * @memberOf _
     * @type Function
     * @category Collections
     * @param {Array|Object|string} collection The collection to iterate over.
     * @param {string} property The name of the property to pluck.
     * @returns {Array} Returns a new array of property values.
     * @example
     *
     * var characters = [
     *   { 'name': 'barney', 'age': 36 },
     *   { 'name': 'fred',   'age': 40 }
     * ];
     *
     * _.pluck(characters, 'name');
     * // => ['barney', 'fred']
     */
    var pluck = map;

    /**
     * Reduces a collection to a value which is the accumulated result of running
     * each element in the collection through the callback, where each successive
     * callback execution consumes the return value of the previous execution. If
     * `accumulator` is not provided the first element of the collection will be
     * used as the initial `accumulator` value. The callback is bound to `thisArg`
     * and invoked with four arguments; (accumulator, value, index|key, collection).
     *
     * @static
     * @memberOf _
     * @alias foldl, inject
     * @category Collections
     * @param {Array|Object|string} collection The collection to iterate over.
     * @param {Function} [callback=identity] The function called per iteration.
     * @param {*} [accumulator] Initial value of the accumulator.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {*} Returns the accumulated value.
     * @example
     *
     * var sum = _.reduce([1, 2, 3], function(sum, num) {
     *   return sum + num;
     * });
     * // => 6
     *
     * var mapped = _.reduce({ 'a': 1, 'b': 2, 'c': 3 }, function(result, num, key) {
     *   result[key] = num * 3;
     *   return result;
     * }, {});
     * // => { 'a': 3, 'b': 6, 'c': 9 }
     */
    function reduce(collection, callback, accumulator, thisArg) {
      if (!collection) return accumulator;
      var noaccum = arguments.length < 3;
      callback = lodash.createCallback(callback, thisArg, 4);

      var index = -1,
          length = collection.length;

      if (typeof length == 'number') {
        if (noaccum) {
          accumulator = collection[++index];
        }
        while (++index < length) {
          accumulator = callback(accumulator, collection[index], index, collection);
        }
      } else {
        forOwn(collection, function(value, index, collection) {
          accumulator = noaccum
            ? (noaccum = false, value)
            : callback(accumulator, value, index, collection)
        });
      }
      return accumulator;
    }

    /**
     * This method is like `_.reduce` except that it iterates over elements
     * of a `collection` from right to left.
     *
     * @static
     * @memberOf _
     * @alias foldr
     * @category Collections
     * @param {Array|Object|string} collection The collection to iterate over.
     * @param {Function} [callback=identity] The function called per iteration.
     * @param {*} [accumulator] Initial value of the accumulator.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {*} Returns the accumulated value.
     * @example
     *
     * var list = [[0, 1], [2, 3], [4, 5]];
     * var flat = _.reduceRight(list, function(a, b) { return a.concat(b); }, []);
     * // => [4, 5, 2, 3, 0, 1]
     */
    function reduceRight(collection, callback, accumulator, thisArg) {
      var noaccum = arguments.length < 3;
      callback = lodash.createCallback(callback, thisArg, 4);
      forEachRight(collection, function(value, index, collection) {
        accumulator = noaccum
          ? (noaccum = false, value)
          : callback(accumulator, value, index, collection);
      });
      return accumulator;
    }

    /**
     * The opposite of `_.filter` this method returns the elements of a
     * collection that the callback does **not** return truey for.
     *
     * If a property name is provided for `callback` the created "_.pluck" style
     * callback will return the property value of the given element.
     *
     * If an object is provided for `callback` the created "_.where" style callback
     * will return `true` for elements that have the properties of the given object,
     * else `false`.
     *
     * @static
     * @memberOf _
     * @category Collections
     * @param {Array|Object|string} collection The collection to iterate over.
     * @param {Function|Object|string} [callback=identity] The function called
     *  per iteration. If a property name or object is provided it will be used
     *  to create a "_.pluck" or "_.where" style callback, respectively.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {Array} Returns a new array of elements that failed the callback check.
     * @example
     *
     * var odds = _.reject([1, 2, 3, 4, 5, 6], function(num) { return num % 2 == 0; });
     * // => [1, 3, 5]
     *
     * var characters = [
     *   { 'name': 'barney', 'age': 36, 'blocked': false },
     *   { 'name': 'fred',   'age': 40, 'blocked': true }
     * ];
     *
     * // using "_.pluck" callback shorthand
     * _.reject(characters, 'blocked');
     * // => [{ 'name': 'barney', 'age': 36, 'blocked': false }]
     *
     * // using "_.where" callback shorthand
     * _.reject(characters, { 'age': 36 });
     * // => [{ 'name': 'fred', 'age': 40, 'blocked': true }]
     */
    function reject(collection, callback, thisArg) {
      callback = lodash.createCallback(callback, thisArg, 3);
      return filter(collection, function(value, index, collection) {
        return !callback(value, index, collection);
      });
    }

    /**
     * Retrieves a random element or `n` random elements from a collection.
     *
     * @static
     * @memberOf _
     * @category Collections
     * @param {Array|Object|string} collection The collection to sample.
     * @param {number} [n] The number of elements to sample.
     * @param- {Object} [guard] Allows working with functions like `_.map`
     *  without using their `index` arguments as `n`.
     * @returns {Array} Returns the random sample(s) of `collection`.
     * @example
     *
     * _.sample([1, 2, 3, 4]);
     * // => 2
     *
     * _.sample([1, 2, 3, 4], 2);
     * // => [3, 1]
     */
    function sample(collection, n, guard) {
      if (collection && typeof collection.length != 'number') {
        collection = values(collection);
      }
      if (n == null || guard) {
        return collection ? collection[baseRandom(0, collection.length - 1)] : undefined;
      }
      var result = shuffle(collection);
      result.length = nativeMin(nativeMax(0, n), result.length);
      return result;
    }

    /**
     * Creates an array of shuffled values, using a version of the Fisher-Yates
     * shuffle. See http://en.wikipedia.org/wiki/Fisher-Yates_shuffle.
     *
     * @static
     * @memberOf _
     * @category Collections
     * @param {Array|Object|string} collection The collection to shuffle.
     * @returns {Array} Returns a new shuffled collection.
     * @example
     *
     * _.shuffle([1, 2, 3, 4, 5, 6]);
     * // => [4, 1, 6, 3, 5, 2]
     */
    function shuffle(collection) {
      var index = -1,
          length = collection ? collection.length : 0,
          result = Array(typeof length == 'number' ? length : 0);

      forEach(collection, function(value) {
        var rand = baseRandom(0, ++index);
        result[index] = result[rand];
        result[rand] = value;
      });
      return result;
    }

    /**
     * Gets the size of the `collection` by returning `collection.length` for arrays
     * and array-like objects or the number of own enumerable properties for objects.
     *
     * @static
     * @memberOf _
     * @category Collections
     * @param {Array|Object|string} collection The collection to inspect.
     * @returns {number} Returns `collection.length` or number of own enumerable properties.
     * @example
     *
     * _.size([1, 2]);
     * // => 2
     *
     * _.size({ 'one': 1, 'two': 2, 'three': 3 });
     * // => 3
     *
     * _.size('pebbles');
     * // => 7
     */
    function size(collection) {
      var length = collection ? collection.length : 0;
      return typeof length == 'number' ? length : keys(collection).length;
    }

    /**
     * Checks if the callback returns a truey value for **any** element of a
     * collection. The function returns as soon as it finds a passing value and
     * does not iterate over the entire collection. The callback is bound to
     * `thisArg` and invoked with three arguments; (value, index|key, collection).
     *
     * If a property name is provided for `callback` the created "_.pluck" style
     * callback will return the property value of the given element.
     *
     * If an object is provided for `callback` the created "_.where" style callback
     * will return `true` for elements that have the properties of the given object,
     * else `false`.
     *
     * @static
     * @memberOf _
     * @alias any
     * @category Collections
     * @param {Array|Object|string} collection The collection to iterate over.
     * @param {Function|Object|string} [callback=identity] The function called
     *  per iteration. If a property name or object is provided it will be used
     *  to create a "_.pluck" or "_.where" style callback, respectively.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {boolean} Returns `true` if any element passed the callback check,
     *  else `false`.
     * @example
     *
     * _.some([null, 0, 'yes', false], Boolean);
     * // => true
     *
     * var characters = [
     *   { 'name': 'barney', 'age': 36, 'blocked': false },
     *   { 'name': 'fred',   'age': 40, 'blocked': true }
     * ];
     *
     * // using "_.pluck" callback shorthand
     * _.some(characters, 'blocked');
     * // => true
     *
     * // using "_.where" callback shorthand
     * _.some(characters, { 'age': 1 });
     * // => false
     */
    function some(collection, callback, thisArg) {
      var result;
      callback = lodash.createCallback(callback, thisArg, 3);

      var index = -1,
          length = collection ? collection.length : 0;

      if (typeof length == 'number') {
        while (++index < length) {
          if ((result = callback(collection[index], index, collection))) {
            break;
          }
        }
      } else {
        forOwn(collection, function(value, index, collection) {
          return !(result = callback(value, index, collection));
        });
      }
      return !!result;
    }

    /**
     * Creates an array of elements, sorted in ascending order by the results of
     * running each element in a collection through the callback. This method
     * performs a stable sort, that is, it will preserve the original sort order
     * of equal elements. The callback is bound to `thisArg` and invoked with
     * three arguments; (value, index|key, collection).
     *
     * If a property name is provided for `callback` the created "_.pluck" style
     * callback will return the property value of the given element.
     *
     * If an array of property names is provided for `callback` the collection
     * will be sorted by each property value.
     *
     * If an object is provided for `callback` the created "_.where" style callback
     * will return `true` for elements that have the properties of the given object,
     * else `false`.
     *
     * @static
     * @memberOf _
     * @category Collections
     * @param {Array|Object|string} collection The collection to iterate over.
     * @param {Array|Function|Object|string} [callback=identity] The function called
     *  per iteration. If a property name or object is provided it will be used
     *  to create a "_.pluck" or "_.where" style callback, respectively.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {Array} Returns a new array of sorted elements.
     * @example
     *
     * _.sortBy([1, 2, 3], function(num) { return Math.sin(num); });
     * // => [3, 1, 2]
     *
     * _.sortBy([1, 2, 3], function(num) { return this.sin(num); }, Math);
     * // => [3, 1, 2]
     *
     * var characters = [
     *   { 'name': 'barney',  'age': 36 },
     *   { 'name': 'fred',    'age': 40 },
     *   { 'name': 'barney',  'age': 26 },
     *   { 'name': 'fred',    'age': 30 }
     * ];
     *
     * // using "_.pluck" callback shorthand
     * _.map(_.sortBy(characters, 'age'), _.values);
     * // => [['barney', 26], ['fred', 30], ['barney', 36], ['fred', 40]]
     *
     * // sorting by multiple properties
     * _.map(_.sortBy(characters, ['name', 'age']), _.values);
     * // = > [['barney', 26], ['barney', 36], ['fred', 30], ['fred', 40]]
     */
    function sortBy(collection, callback, thisArg) {
      var index = -1,
          isArr = isArray(callback),
          length = collection ? collection.length : 0,
          result = Array(typeof length == 'number' ? length : 0);

      if (!isArr) {
        callback = lodash.createCallback(callback, thisArg, 3);
      }
      forEach(collection, function(value, key, collection) {
        var object = result[++index] = getObject();
        if (isArr) {
          object.criteria = map(callback, function(key) { return value[key]; });
        } else {
          (object.criteria = getArray())[0] = callback(value, key, collection);
        }
        object.index = index;
        object.value = value;
      });

      length = result.length;
      result.sort(compareAscending);
      while (length--) {
        var object = result[length];
        result[length] = object.value;
        if (!isArr) {
          releaseArray(object.criteria);
        }
        releaseObject(object);
      }
      return result;
    }

    /**
     * Converts the `collection` to an array.
     *
     * @static
     * @memberOf _
     * @category Collections
     * @param {Array|Object|string} collection The collection to convert.
     * @returns {Array} Returns the new converted array.
     * @example
     *
     * (function() { return _.toArray(arguments).slice(1); })(1, 2, 3, 4);
     * // => [2, 3, 4]
     */
    function toArray(collection) {
      if (collection && typeof collection.length == 'number') {
        return slice(collection);
      }
      return values(collection);
    }

    /**
     * Performs a deep comparison of each element in a `collection` to the given
     * `properties` object, returning an array of all elements that have equivalent
     * property values.
     *
     * @static
     * @memberOf _
     * @type Function
     * @category Collections
     * @param {Array|Object|string} collection The collection to iterate over.
     * @param {Object} props The object of property values to filter by.
     * @returns {Array} Returns a new array of elements that have the given properties.
     * @example
     *
     * var characters = [
     *   { 'name': 'barney', 'age': 36, 'pets': ['hoppy'] },
     *   { 'name': 'fred',   'age': 40, 'pets': ['baby puss', 'dino'] }
     * ];
     *
     * _.where(characters, { 'age': 36 });
     * // => [{ 'name': 'barney', 'age': 36, 'pets': ['hoppy'] }]
     *
     * _.where(characters, { 'pets': ['dino'] });
     * // => [{ 'name': 'fred', 'age': 40, 'pets': ['baby puss', 'dino'] }]
     */
    var where = filter;

    /*--------------------------------------------------------------------------*/

    /**
     * Creates an array with all falsey values removed. The values `false`, `null`,
     * `0`, `""`, `undefined`, and `NaN` are all falsey.
     *
     * @static
     * @memberOf _
     * @category Arrays
     * @param {Array} array The array to compact.
     * @returns {Array} Returns a new array of filtered values.
     * @example
     *
     * _.compact([0, 1, false, 2, '', 3]);
     * // => [1, 2, 3]
     */
    function compact(array) {
      var index = -1,
          length = array ? array.length : 0,
          result = [];

      while (++index < length) {
        var value = array[index];
        if (value) {
          result.push(value);
        }
      }
      return result;
    }

    /**
     * Creates an array excluding all values of the provided arrays using strict
     * equality for comparisons, i.e. `===`.
     *
     * @static
     * @memberOf _
     * @category Arrays
     * @param {Array} array The array to process.
     * @param {...Array} [values] The arrays of values to exclude.
     * @returns {Array} Returns a new array of filtered values.
     * @example
     *
     * _.difference([1, 2, 3, 4, 5], [5, 2, 10]);
     * // => [1, 3, 4]
     */
    function difference(array) {
      return baseDifference(array, baseFlatten(arguments, true, true, 1));
    }

    /**
     * This method is like `_.find` except that it returns the index of the first
     * element that passes the callback check, instead of the element itself.
     *
     * If a property name is provided for `callback` the created "_.pluck" style
     * callback will return the property value of the given element.
     *
     * If an object is provided for `callback` the created "_.where" style callback
     * will return `true` for elements that have the properties of the given object,
     * else `false`.
     *
     * @static
     * @memberOf _
     * @category Arrays
     * @param {Array} array The array to search.
     * @param {Function|Object|string} [callback=identity] The function called
     *  per iteration. If a property name or object is provided it will be used
     *  to create a "_.pluck" or "_.where" style callback, respectively.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {number} Returns the index of the found element, else `-1`.
     * @example
     *
     * var characters = [
     *   { 'name': 'barney',  'age': 36, 'blocked': false },
     *   { 'name': 'fred',    'age': 40, 'blocked': true },
     *   { 'name': 'pebbles', 'age': 1,  'blocked': false }
     * ];
     *
     * _.findIndex(characters, function(chr) {
     *   return chr.age < 20;
     * });
     * // => 2
     *
     * // using "_.where" callback shorthand
     * _.findIndex(characters, { 'age': 36 });
     * // => 0
     *
     * // using "_.pluck" callback shorthand
     * _.findIndex(characters, 'blocked');
     * // => 1
     */
    function findIndex(array, callback, thisArg) {
      var index = -1,
          length = array ? array.length : 0;

      callback = lodash.createCallback(callback, thisArg, 3);
      while (++index < length) {
        if (callback(array[index], index, array)) {
          return index;
        }
      }
      return -1;
    }

    /**
     * This method is like `_.findIndex` except that it iterates over elements
     * of a `collection` from right to left.
     *
     * If a property name is provided for `callback` the created "_.pluck" style
     * callback will return the property value of the given element.
     *
     * If an object is provided for `callback` the created "_.where" style callback
     * will return `true` for elements that have the properties of the given object,
     * else `false`.
     *
     * @static
     * @memberOf _
     * @category Arrays
     * @param {Array} array The array to search.
     * @param {Function|Object|string} [callback=identity] The function called
     *  per iteration. If a property name or object is provided it will be used
     *  to create a "_.pluck" or "_.where" style callback, respectively.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {number} Returns the index of the found element, else `-1`.
     * @example
     *
     * var characters = [
     *   { 'name': 'barney',  'age': 36, 'blocked': true },
     *   { 'name': 'fred',    'age': 40, 'blocked': false },
     *   { 'name': 'pebbles', 'age': 1,  'blocked': true }
     * ];
     *
     * _.findLastIndex(characters, function(chr) {
     *   return chr.age > 30;
     * });
     * // => 1
     *
     * // using "_.where" callback shorthand
     * _.findLastIndex(characters, { 'age': 36 });
     * // => 0
     *
     * // using "_.pluck" callback shorthand
     * _.findLastIndex(characters, 'blocked');
     * // => 2
     */
    function findLastIndex(array, callback, thisArg) {
      var length = array ? array.length : 0;
      callback = lodash.createCallback(callback, thisArg, 3);
      while (length--) {
        if (callback(array[length], length, array)) {
          return length;
        }
      }
      return -1;
    }

    /**
     * Gets the first element or first `n` elements of an array. If a callback
     * is provided elements at the beginning of the array are returned as long
     * as the callback returns truey. The callback is bound to `thisArg` and
     * invoked with three arguments; (value, index, array).
     *
     * If a property name is provided for `callback` the created "_.pluck" style
     * callback will return the property value of the given element.
     *
     * If an object is provided for `callback` the created "_.where" style callback
     * will return `true` for elements that have the properties of the given object,
     * else `false`.
     *
     * @static
     * @memberOf _
     * @alias head, take
     * @category Arrays
     * @param {Array} array The array to query.
     * @param {Function|Object|number|string} [callback] The function called
     *  per element or the number of elements to return. If a property name or
     *  object is provided it will be used to create a "_.pluck" or "_.where"
     *  style callback, respectively.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {*} Returns the first element(s) of `array`.
     * @example
     *
     * _.first([1, 2, 3]);
     * // => 1
     *
     * _.first([1, 2, 3], 2);
     * // => [1, 2]
     *
     * _.first([1, 2, 3], function(num) {
     *   return num < 3;
     * });
     * // => [1, 2]
     *
     * var characters = [
     *   { 'name': 'barney',  'blocked': true,  'employer': 'slate' },
     *   { 'name': 'fred',    'blocked': false, 'employer': 'slate' },
     *   { 'name': 'pebbles', 'blocked': true,  'employer': 'na' }
     * ];
     *
     * // using "_.pluck" callback shorthand
     * _.first(characters, 'blocked');
     * // => [{ 'name': 'barney', 'blocked': true, 'employer': 'slate' }]
     *
     * // using "_.where" callback shorthand
     * _.pluck(_.first(characters, { 'employer': 'slate' }), 'name');
     * // => ['barney', 'fred']
     */
    function first(array, callback, thisArg) {
      var n = 0,
          length = array ? array.length : 0;

      if (typeof callback != 'number' && callback != null) {
        var index = -1;
        callback = lodash.createCallback(callback, thisArg, 3);
        while (++index < length && callback(array[index], index, array)) {
          n++;
        }
      } else {
        n = callback;
        if (n == null || thisArg) {
          return array ? array[0] : undefined;
        }
      }
      return slice(array, 0, nativeMin(nativeMax(0, n), length));
    }

    /**
     * Flattens a nested array (the nesting can be to any depth). If `isShallow`
     * is truey, the array will only be flattened a single level. If a callback
     * is provided each element of the array is passed through the callback before
     * flattening. The callback is bound to `thisArg` and invoked with three
     * arguments; (value, index, array).
     *
     * If a property name is provided for `callback` the created "_.pluck" style
     * callback will return the property value of the given element.
     *
     * If an object is provided for `callback` the created "_.where" style callback
     * will return `true` for elements that have the properties of the given object,
     * else `false`.
     *
     * @static
     * @memberOf _
     * @category Arrays
     * @param {Array} array The array to flatten.
     * @param {boolean} [isShallow=false] A flag to restrict flattening to a single level.
     * @param {Function|Object|string} [callback=identity] The function called
     *  per iteration. If a property name or object is provided it will be used
     *  to create a "_.pluck" or "_.where" style callback, respectively.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {Array} Returns a new flattened array.
     * @example
     *
     * _.flatten([1, [2], [3, [[4]]]]);
     * // => [1, 2, 3, 4];
     *
     * _.flatten([1, [2], [3, [[4]]]], true);
     * // => [1, 2, 3, [[4]]];
     *
     * var characters = [
     *   { 'name': 'barney', 'age': 30, 'pets': ['hoppy'] },
     *   { 'name': 'fred',   'age': 40, 'pets': ['baby puss', 'dino'] }
     * ];
     *
     * // using "_.pluck" callback shorthand
     * _.flatten(characters, 'pets');
     * // => ['hoppy', 'baby puss', 'dino']
     */
    function flatten(array, isShallow, callback, thisArg) {
      // juggle arguments
      if (typeof isShallow != 'boolean' && isShallow != null) {
        thisArg = callback;
        callback = (typeof isShallow != 'function' && thisArg && thisArg[isShallow] === array) ? null : isShallow;
        isShallow = false;
      }
      if (callback != null) {
        array = map(array, callback, thisArg);
      }
      return baseFlatten(array, isShallow);
    }

    /**
     * Gets the index at which the first occurrence of `value` is found using
     * strict equality for comparisons, i.e. `===`. If the array is already sorted
     * providing `true` for `fromIndex` will run a faster binary search.
     *
     * @static
     * @memberOf _
     * @category Arrays
     * @param {Array} array The array to search.
     * @param {*} value The value to search for.
     * @param {boolean|number} [fromIndex=0] The index to search from or `true`
     *  to perform a binary search on a sorted array.
     * @returns {number} Returns the index of the matched value or `-1`.
     * @example
     *
     * _.indexOf([1, 2, 3, 1, 2, 3], 2);
     * // => 1
     *
     * _.indexOf([1, 2, 3, 1, 2, 3], 2, 3);
     * // => 4
     *
     * _.indexOf([1, 1, 2, 2, 3, 3], 2, true);
     * // => 2
     */
    function indexOf(array, value, fromIndex) {
      if (typeof fromIndex == 'number') {
        var length = array ? array.length : 0;
        fromIndex = (fromIndex < 0 ? nativeMax(0, length + fromIndex) : fromIndex || 0);
      } else if (fromIndex) {
        var index = sortedIndex(array, value);
        return array[index] === value ? index : -1;
      }
      return baseIndexOf(array, value, fromIndex);
    }

    /**
     * Gets all but the last element or last `n` elements of an array. If a
     * callback is provided elements at the end of the array are excluded from
     * the result as long as the callback returns truey. The callback is bound
     * to `thisArg` and invoked with three arguments; (value, index, array).
     *
     * If a property name is provided for `callback` the created "_.pluck" style
     * callback will return the property value of the given element.
     *
     * If an object is provided for `callback` the created "_.where" style callback
     * will return `true` for elements that have the properties of the given object,
     * else `false`.
     *
     * @static
     * @memberOf _
     * @category Arrays
     * @param {Array} array The array to query.
     * @param {Function|Object|number|string} [callback=1] The function called
     *  per element or the number of elements to exclude. If a property name or
     *  object is provided it will be used to create a "_.pluck" or "_.where"
     *  style callback, respectively.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {Array} Returns a slice of `array`.
     * @example
     *
     * _.initial([1, 2, 3]);
     * // => [1, 2]
     *
     * _.initial([1, 2, 3], 2);
     * // => [1]
     *
     * _.initial([1, 2, 3], function(num) {
     *   return num > 1;
     * });
     * // => [1]
     *
     * var characters = [
     *   { 'name': 'barney',  'blocked': false, 'employer': 'slate' },
     *   { 'name': 'fred',    'blocked': true,  'employer': 'slate' },
     *   { 'name': 'pebbles', 'blocked': true,  'employer': 'na' }
     * ];
     *
     * // using "_.pluck" callback shorthand
     * _.initial(characters, 'blocked');
     * // => [{ 'name': 'barney',  'blocked': false, 'employer': 'slate' }]
     *
     * // using "_.where" callback shorthand
     * _.pluck(_.initial(characters, { 'employer': 'na' }), 'name');
     * // => ['barney', 'fred']
     */
    function initial(array, callback, thisArg) {
      var n = 0,
          length = array ? array.length : 0;

      if (typeof callback != 'number' && callback != null) {
        var index = length;
        callback = lodash.createCallback(callback, thisArg, 3);
        while (index-- && callback(array[index], index, array)) {
          n++;
        }
      } else {
        n = (callback == null || thisArg) ? 1 : callback || n;
      }
      return slice(array, 0, nativeMin(nativeMax(0, length - n), length));
    }

    /**
     * Creates an array of unique values present in all provided arrays using
     * strict equality for comparisons, i.e. `===`.
     *
     * @static
     * @memberOf _
     * @category Arrays
     * @param {...Array} [array] The arrays to inspect.
     * @returns {Array} Returns an array of shared values.
     * @example
     *
     * _.intersection([1, 2, 3], [5, 2, 1, 4], [2, 1]);
     * // => [1, 2]
     */
    function intersection() {
      var args = [],
          argsIndex = -1,
          argsLength = arguments.length,
          caches = getArray(),
          indexOf = getIndexOf(),
          trustIndexOf = indexOf === baseIndexOf,
          seen = getArray();

      while (++argsIndex < argsLength) {
        var value = arguments[argsIndex];
        if (isArray(value) || isArguments(value)) {
          args.push(value);
          caches.push(trustIndexOf && value.length >= largeArraySize &&
            createCache(argsIndex ? args[argsIndex] : seen));
        }
      }
      var array = args[0],
          index = -1,
          length = array ? array.length : 0,
          result = [];

      outer:
      while (++index < length) {
        var cache = caches[0];
        value = array[index];

        if ((cache ? cacheIndexOf(cache, value) : indexOf(seen, value)) < 0) {
          argsIndex = argsLength;
          (cache || seen).push(value);
          while (--argsIndex) {
            cache = caches[argsIndex];
            if ((cache ? cacheIndexOf(cache, value) : indexOf(args[argsIndex], value)) < 0) {
              continue outer;
            }
          }
          result.push(value);
        }
      }
      while (argsLength--) {
        cache = caches[argsLength];
        if (cache) {
          releaseObject(cache);
        }
      }
      releaseArray(caches);
      releaseArray(seen);
      return result;
    }

    /**
     * Gets the last element or last `n` elements of an array. If a callback is
     * provided elements at the end of the array are returned as long as the
     * callback returns truey. The callback is bound to `thisArg` and invoked
     * with three arguments; (value, index, array).
     *
     * If a property name is provided for `callback` the created "_.pluck" style
     * callback will return the property value of the given element.
     *
     * If an object is provided for `callback` the created "_.where" style callback
     * will return `true` for elements that have the properties of the given object,
     * else `false`.
     *
     * @static
     * @memberOf _
     * @category Arrays
     * @param {Array} array The array to query.
     * @param {Function|Object|number|string} [callback] The function called
     *  per element or the number of elements to return. If a property name or
     *  object is provided it will be used to create a "_.pluck" or "_.where"
     *  style callback, respectively.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {*} Returns the last element(s) of `array`.
     * @example
     *
     * _.last([1, 2, 3]);
     * // => 3
     *
     * _.last([1, 2, 3], 2);
     * // => [2, 3]
     *
     * _.last([1, 2, 3], function(num) {
     *   return num > 1;
     * });
     * // => [2, 3]
     *
     * var characters = [
     *   { 'name': 'barney',  'blocked': false, 'employer': 'slate' },
     *   { 'name': 'fred',    'blocked': true,  'employer': 'slate' },
     *   { 'name': 'pebbles', 'blocked': true,  'employer': 'na' }
     * ];
     *
     * // using "_.pluck" callback shorthand
     * _.pluck(_.last(characters, 'blocked'), 'name');
     * // => ['fred', 'pebbles']
     *
     * // using "_.where" callback shorthand
     * _.last(characters, { 'employer': 'na' });
     * // => [{ 'name': 'pebbles', 'blocked': true, 'employer': 'na' }]
     */
    function last(array, callback, thisArg) {
      var n = 0,
          length = array ? array.length : 0;

      if (typeof callback != 'number' && callback != null) {
        var index = length;
        callback = lodash.createCallback(callback, thisArg, 3);
        while (index-- && callback(array[index], index, array)) {
          n++;
        }
      } else {
        n = callback;
        if (n == null || thisArg) {
          return array ? array[length - 1] : undefined;
        }
      }
      return slice(array, nativeMax(0, length - n));
    }

    /**
     * Gets the index at which the last occurrence of `value` is found using strict
     * equality for comparisons, i.e. `===`. If `fromIndex` is negative, it is used
     * as the offset from the end of the collection.
     *
     * If a property name is provided for `callback` the created "_.pluck" style
     * callback will return the property value of the given element.
     *
     * If an object is provided for `callback` the created "_.where" style callback
     * will return `true` for elements that have the properties of the given object,
     * else `false`.
     *
     * @static
     * @memberOf _
     * @category Arrays
     * @param {Array} array The array to search.
     * @param {*} value The value to search for.
     * @param {number} [fromIndex=array.length-1] The index to search from.
     * @returns {number} Returns the index of the matched value or `-1`.
     * @example
     *
     * _.lastIndexOf([1, 2, 3, 1, 2, 3], 2);
     * // => 4
     *
     * _.lastIndexOf([1, 2, 3, 1, 2, 3], 2, 3);
     * // => 1
     */
    function lastIndexOf(array, value, fromIndex) {
      var index = array ? array.length : 0;
      if (typeof fromIndex == 'number') {
        index = (fromIndex < 0 ? nativeMax(0, index + fromIndex) : nativeMin(fromIndex, index - 1)) + 1;
      }
      while (index--) {
        if (array[index] === value) {
          return index;
        }
      }
      return -1;
    }

    /**
     * Removes all provided values from the given array using strict equality for
     * comparisons, i.e. `===`.
     *
     * @static
     * @memberOf _
     * @category Arrays
     * @param {Array} array The array to modify.
     * @param {...*} [value] The values to remove.
     * @returns {Array} Returns `array`.
     * @example
     *
     * var array = [1, 2, 3, 1, 2, 3];
     * _.pull(array, 2, 3);
     * console.log(array);
     * // => [1, 1]
     */
    function pull(array) {
      var args = arguments,
          argsIndex = 0,
          argsLength = args.length,
          length = array ? array.length : 0;

      while (++argsIndex < argsLength) {
        var index = -1,
            value = args[argsIndex];
        while (++index < length) {
          if (array[index] === value) {
            splice.call(array, index--, 1);
            length--;
          }
        }
      }
      return array;
    }

    /**
     * Creates an array of numbers (positive and/or negative) progressing from
     * `start` up to but not including `end`. If `start` is less than `stop` a
     * zero-length range is created unless a negative `step` is specified.
     *
     * @static
     * @memberOf _
     * @category Arrays
     * @param {number} [start=0] The start of the range.
     * @param {number} end The end of the range.
     * @param {number} [step=1] The value to increment or decrement by.
     * @returns {Array} Returns a new range array.
     * @example
     *
     * _.range(4);
     * // => [0, 1, 2, 3]
     *
     * _.range(1, 5);
     * // => [1, 2, 3, 4]
     *
     * _.range(0, 20, 5);
     * // => [0, 5, 10, 15]
     *
     * _.range(0, -4, -1);
     * // => [0, -1, -2, -3]
     *
     * _.range(1, 4, 0);
     * // => [1, 1, 1]
     *
     * _.range(0);
     * // => []
     */
    function range(start, end, step) {
      start = +start || 0;
      step = typeof step == 'number' ? step : (+step || 1);

      if (end == null) {
        end = start;
        start = 0;
      }
      // use `Array(length)` so engines like Chakra and V8 avoid slower modes
      // http://youtu.be/XAqIpGU8ZZk#t=17m25s
      var index = -1,
          length = nativeMax(0, ceil((end - start) / (step || 1))),
          result = Array(length);

      while (++index < length) {
        result[index] = start;
        start += step;
      }
      return result;
    }

    /**
     * Removes all elements from an array that the callback returns truey for
     * and returns an array of removed elements. The callback is bound to `thisArg`
     * and invoked with three arguments; (value, index, array).
     *
     * If a property name is provided for `callback` the created "_.pluck" style
     * callback will return the property value of the given element.
     *
     * If an object is provided for `callback` the created "_.where" style callback
     * will return `true` for elements that have the properties of the given object,
     * else `false`.
     *
     * @static
     * @memberOf _
     * @category Arrays
     * @param {Array} array The array to modify.
     * @param {Function|Object|string} [callback=identity] The function called
     *  per iteration. If a property name or object is provided it will be used
     *  to create a "_.pluck" or "_.where" style callback, respectively.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {Array} Returns a new array of removed elements.
     * @example
     *
     * var array = [1, 2, 3, 4, 5, 6];
     * var evens = _.remove(array, function(num) { return num % 2 == 0; });
     *
     * console.log(array);
     * // => [1, 3, 5]
     *
     * console.log(evens);
     * // => [2, 4, 6]
     */
    function remove(array, callback, thisArg) {
      var index = -1,
          length = array ? array.length : 0,
          result = [];

      callback = lodash.createCallback(callback, thisArg, 3);
      while (++index < length) {
        var value = array[index];
        if (callback(value, index, array)) {
          result.push(value);
          splice.call(array, index--, 1);
          length--;
        }
      }
      return result;
    }

    /**
     * The opposite of `_.initial` this method gets all but the first element or
     * first `n` elements of an array. If a callback function is provided elements
     * at the beginning of the array are excluded from the result as long as the
     * callback returns truey. The callback is bound to `thisArg` and invoked
     * with three arguments; (value, index, array).
     *
     * If a property name is provided for `callback` the created "_.pluck" style
     * callback will return the property value of the given element.
     *
     * If an object is provided for `callback` the created "_.where" style callback
     * will return `true` for elements that have the properties of the given object,
     * else `false`.
     *
     * @static
     * @memberOf _
     * @alias drop, tail
     * @category Arrays
     * @param {Array} array The array to query.
     * @param {Function|Object|number|string} [callback=1] The function called
     *  per element or the number of elements to exclude. If a property name or
     *  object is provided it will be used to create a "_.pluck" or "_.where"
     *  style callback, respectively.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {Array} Returns a slice of `array`.
     * @example
     *
     * _.rest([1, 2, 3]);
     * // => [2, 3]
     *
     * _.rest([1, 2, 3], 2);
     * // => [3]
     *
     * _.rest([1, 2, 3], function(num) {
     *   return num < 3;
     * });
     * // => [3]
     *
     * var characters = [
     *   { 'name': 'barney',  'blocked': true,  'employer': 'slate' },
     *   { 'name': 'fred',    'blocked': false,  'employer': 'slate' },
     *   { 'name': 'pebbles', 'blocked': true, 'employer': 'na' }
     * ];
     *
     * // using "_.pluck" callback shorthand
     * _.pluck(_.rest(characters, 'blocked'), 'name');
     * // => ['fred', 'pebbles']
     *
     * // using "_.where" callback shorthand
     * _.rest(characters, { 'employer': 'slate' });
     * // => [{ 'name': 'pebbles', 'blocked': true, 'employer': 'na' }]
     */
    function rest(array, callback, thisArg) {
      if (typeof callback != 'number' && callback != null) {
        var n = 0,
            index = -1,
            length = array ? array.length : 0;

        callback = lodash.createCallback(callback, thisArg, 3);
        while (++index < length && callback(array[index], index, array)) {
          n++;
        }
      } else {
        n = (callback == null || thisArg) ? 1 : nativeMax(0, callback);
      }
      return slice(array, n);
    }

    /**
     * Uses a binary search to determine the smallest index at which a value
     * should be inserted into a given sorted array in order to maintain the sort
     * order of the array. If a callback is provided it will be executed for
     * `value` and each element of `array` to compute their sort ranking. The
     * callback is bound to `thisArg` and invoked with one argument; (value).
     *
     * If a property name is provided for `callback` the created "_.pluck" style
     * callback will return the property value of the given element.
     *
     * If an object is provided for `callback` the created "_.where" style callback
     * will return `true` for elements that have the properties of the given object,
     * else `false`.
     *
     * @static
     * @memberOf _
     * @category Arrays
     * @param {Array} array The array to inspect.
     * @param {*} value The value to evaluate.
     * @param {Function|Object|string} [callback=identity] The function called
     *  per iteration. If a property name or object is provided it will be used
     *  to create a "_.pluck" or "_.where" style callback, respectively.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {number} Returns the index at which `value` should be inserted
     *  into `array`.
     * @example
     *
     * _.sortedIndex([20, 30, 50], 40);
     * // => 2
     *
     * // using "_.pluck" callback shorthand
     * _.sortedIndex([{ 'x': 20 }, { 'x': 30 }, { 'x': 50 }], { 'x': 40 }, 'x');
     * // => 2
     *
     * var dict = {
     *   'wordToNumber': { 'twenty': 20, 'thirty': 30, 'fourty': 40, 'fifty': 50 }
     * };
     *
     * _.sortedIndex(['twenty', 'thirty', 'fifty'], 'fourty', function(word) {
     *   return dict.wordToNumber[word];
     * });
     * // => 2
     *
     * _.sortedIndex(['twenty', 'thirty', 'fifty'], 'fourty', function(word) {
     *   return this.wordToNumber[word];
     * }, dict);
     * // => 2
     */
    function sortedIndex(array, value, callback, thisArg) {
      var low = 0,
          high = array ? array.length : low;

      // explicitly reference `identity` for better inlining in Firefox
      callback = callback ? lodash.createCallback(callback, thisArg, 1) : identity;
      value = callback(value);

      while (low < high) {
        var mid = (low + high) >>> 1;
        (callback(array[mid]) < value)
          ? low = mid + 1
          : high = mid;
      }
      return low;
    }

    /**
     * Creates an array of unique values, in order, of the provided arrays using
     * strict equality for comparisons, i.e. `===`.
     *
     * @static
     * @memberOf _
     * @category Arrays
     * @param {...Array} [array] The arrays to inspect.
     * @returns {Array} Returns an array of combined values.
     * @example
     *
     * _.union([1, 2, 3], [5, 2, 1, 4], [2, 1]);
     * // => [1, 2, 3, 5, 4]
     */
    function union() {
      return baseUniq(baseFlatten(arguments, true, true));
    }

    /**
     * Creates a duplicate-value-free version of an array using strict equality
     * for comparisons, i.e. `===`. If the array is sorted, providing
     * `true` for `isSorted` will use a faster algorithm. If a callback is provided
     * each element of `array` is passed through the callback before uniqueness
     * is computed. The callback is bound to `thisArg` and invoked with three
     * arguments; (value, index, array).
     *
     * If a property name is provided for `callback` the created "_.pluck" style
     * callback will return the property value of the given element.
     *
     * If an object is provided for `callback` the created "_.where" style callback
     * will return `true` for elements that have the properties of the given object,
     * else `false`.
     *
     * @static
     * @memberOf _
     * @alias unique
     * @category Arrays
     * @param {Array} array The array to process.
     * @param {boolean} [isSorted=false] A flag to indicate that `array` is sorted.
     * @param {Function|Object|string} [callback=identity] The function called
     *  per iteration. If a property name or object is provided it will be used
     *  to create a "_.pluck" or "_.where" style callback, respectively.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {Array} Returns a duplicate-value-free array.
     * @example
     *
     * _.uniq([1, 2, 1, 3, 1]);
     * // => [1, 2, 3]
     *
     * _.uniq([1, 1, 2, 2, 3], true);
     * // => [1, 2, 3]
     *
     * _.uniq(['A', 'b', 'C', 'a', 'B', 'c'], function(letter) { return letter.toLowerCase(); });
     * // => ['A', 'b', 'C']
     *
     * _.uniq([1, 2.5, 3, 1.5, 2, 3.5], function(num) { return this.floor(num); }, Math);
     * // => [1, 2.5, 3]
     *
     * // using "_.pluck" callback shorthand
     * _.uniq([{ 'x': 1 }, { 'x': 2 }, { 'x': 1 }], 'x');
     * // => [{ 'x': 1 }, { 'x': 2 }]
     */
    function uniq(array, isSorted, callback, thisArg) {
      // juggle arguments
      if (typeof isSorted != 'boolean' && isSorted != null) {
        thisArg = callback;
        callback = (typeof isSorted != 'function' && thisArg && thisArg[isSorted] === array) ? null : isSorted;
        isSorted = false;
      }
      if (callback != null) {
        callback = lodash.createCallback(callback, thisArg, 3);
      }
      return baseUniq(array, isSorted, callback);
    }

    /**
     * Creates an array excluding all provided values using strict equality for
     * comparisons, i.e. `===`.
     *
     * @static
     * @memberOf _
     * @category Arrays
     * @param {Array} array The array to filter.
     * @param {...*} [value] The values to exclude.
     * @returns {Array} Returns a new array of filtered values.
     * @example
     *
     * _.without([1, 2, 1, 0, 3, 1, 4], 0, 1);
     * // => [2, 3, 4]
     */
    function without(array) {
      return baseDifference(array, slice(arguments, 1));
    }

    /**
     * Creates an array that is the symmetric difference of the provided arrays.
     * See http://en.wikipedia.org/wiki/Symmetric_difference.
     *
     * @static
     * @memberOf _
     * @category Arrays
     * @param {...Array} [array] The arrays to inspect.
     * @returns {Array} Returns an array of values.
     * @example
     *
     * _.xor([1, 2, 3], [5, 2, 1, 4]);
     * // => [3, 5, 4]
     *
     * _.xor([1, 2, 5], [2, 3, 5], [3, 4, 5]);
     * // => [1, 4, 5]
     */
    function xor() {
      var index = -1,
          length = arguments.length;

      while (++index < length) {
        var array = arguments[index];
        if (isArray(array) || isArguments(array)) {
          var result = result
            ? baseUniq(baseDifference(result, array).concat(baseDifference(array, result)))
            : array;
        }
      }
      return result || [];
    }

    /**
     * Creates an array of grouped elements, the first of which contains the first
     * elements of the given arrays, the second of which contains the second
     * elements of the given arrays, and so on.
     *
     * @static
     * @memberOf _
     * @alias unzip
     * @category Arrays
     * @param {...Array} [array] Arrays to process.
     * @returns {Array} Returns a new array of grouped elements.
     * @example
     *
     * _.zip(['fred', 'barney'], [30, 40], [true, false]);
     * // => [['fred', 30, true], ['barney', 40, false]]
     */
    function zip() {
      var array = arguments.length > 1 ? arguments : arguments[0],
          index = -1,
          length = array ? max(pluck(array, 'length')) : 0,
          result = Array(length < 0 ? 0 : length);

      while (++index < length) {
        result[index] = pluck(array, index);
      }
      return result;
    }

    /**
     * Creates an object composed from arrays of `keys` and `values`. Provide
     * either a single two dimensional array, i.e. `[[key1, value1], [key2, value2]]`
     * or two arrays, one of `keys` and one of corresponding `values`.
     *
     * @static
     * @memberOf _
     * @alias object
     * @category Arrays
     * @param {Array} keys The array of keys.
     * @param {Array} [values=[]] The array of values.
     * @returns {Object} Returns an object composed of the given keys and
     *  corresponding values.
     * @example
     *
     * _.zipObject(['fred', 'barney'], [30, 40]);
     * // => { 'fred': 30, 'barney': 40 }
     */
    function zipObject(keys, values) {
      var index = -1,
          length = keys ? keys.length : 0,
          result = {};

      if (!values && length && !isArray(keys[0])) {
        values = [];
      }
      while (++index < length) {
        var key = keys[index];
        if (values) {
          result[key] = values[index];
        } else if (key) {
          result[key[0]] = key[1];
        }
      }
      return result;
    }

    /*--------------------------------------------------------------------------*/

    /**
     * Creates a function that executes `func`, with  the `this` binding and
     * arguments of the created function, only after being called `n` times.
     *
     * @static
     * @memberOf _
     * @category Functions
     * @param {number} n The number of times the function must be called before
     *  `func` is executed.
     * @param {Function} func The function to restrict.
     * @returns {Function} Returns the new restricted function.
     * @example
     *
     * var saves = ['profile', 'settings'];
     *
     * var done = _.after(saves.length, function() {
     *   console.log('Done saving!');
     * });
     *
     * _.forEach(saves, function(type) {
     *   asyncSave({ 'type': type, 'complete': done });
     * });
     * // => logs 'Done saving!', after all saves have completed
     */
    function after(n, func) {
      if (!isFunction(func)) {
        throw new TypeError;
      }
      return function() {
        if (--n < 1) {
          return func.apply(this, arguments);
        }
      };
    }

    /**
     * Creates a function that, when called, invokes `func` with the `this`
     * binding of `thisArg` and prepends any additional `bind` arguments to those
     * provided to the bound function.
     *
     * @static
     * @memberOf _
     * @category Functions
     * @param {Function} func The function to bind.
     * @param {*} [thisArg] The `this` binding of `func`.
     * @param {...*} [arg] Arguments to be partially applied.
     * @returns {Function} Returns the new bound function.
     * @example
     *
     * var func = function(greeting) {
     *   return greeting + ' ' + this.name;
     * };
     *
     * func = _.bind(func, { 'name': 'fred' }, 'hi');
     * func();
     * // => 'hi fred'
     */
    function bind(func, thisArg) {
      return arguments.length > 2
        ? createWrapper(func, 17, slice(arguments, 2), null, thisArg)
        : createWrapper(func, 1, null, null, thisArg);
    }

    /**
     * Binds methods of an object to the object itself, overwriting the existing
     * method. Method names may be specified as individual arguments or as arrays
     * of method names. If no method names are provided all the function properties
     * of `object` will be bound.
     *
     * @static
     * @memberOf _
     * @category Functions
     * @param {Object} object The object to bind and assign the bound methods to.
     * @param {...string} [methodName] The object method names to
     *  bind, specified as individual method names or arrays of method names.
     * @returns {Object} Returns `object`.
     * @example
     *
     * var view = {
     *   'label': 'docs',
     *   'onClick': function() { console.log('clicked ' + this.label); }
     * };
     *
     * _.bindAll(view);
     * jQuery('#docs').on('click', view.onClick);
     * // => logs 'clicked docs', when the button is clicked
     */
    function bindAll(object) {
      var funcs = arguments.length > 1 ? baseFlatten(arguments, true, false, 1) : functions(object),
          index = -1,
          length = funcs.length;

      while (++index < length) {
        var key = funcs[index];
        object[key] = createWrapper(object[key], 1, null, null, object);
      }
      return object;
    }

    /**
     * Creates a function that, when called, invokes the method at `object[key]`
     * and prepends any additional `bindKey` arguments to those provided to the bound
     * function. This method differs from `_.bind` by allowing bound functions to
     * reference methods that will be redefined or don't yet exist.
     * See http://michaux.ca/articles/lazy-function-definition-pattern.
     *
     * @static
     * @memberOf _
     * @category Functions
     * @param {Object} object The object the method belongs to.
     * @param {string} key The key of the method.
     * @param {...*} [arg] Arguments to be partially applied.
     * @returns {Function} Returns the new bound function.
     * @example
     *
     * var object = {
     *   'name': 'fred',
     *   'greet': function(greeting) {
     *     return greeting + ' ' + this.name;
     *   }
     * };
     *
     * var func = _.bindKey(object, 'greet', 'hi');
     * func();
     * // => 'hi fred'
     *
     * object.greet = function(greeting) {
     *   return greeting + 'ya ' + this.name + '!';
     * };
     *
     * func();
     * // => 'hiya fred!'
     */
    function bindKey(object, key) {
      return arguments.length > 2
        ? createWrapper(key, 19, slice(arguments, 2), null, object)
        : createWrapper(key, 3, null, null, object);
    }

    /**
     * Creates a function that is the composition of the provided functions,
     * where each function consumes the return value of the function that follows.
     * For example, composing the functions `f()`, `g()`, and `h()` produces `f(g(h()))`.
     * Each function is executed with the `this` binding of the composed function.
     *
     * @static
     * @memberOf _
     * @category Functions
     * @param {...Function} [func] Functions to compose.
     * @returns {Function} Returns the new composed function.
     * @example
     *
     * var realNameMap = {
     *   'pebbles': 'penelope'
     * };
     *
     * var format = function(name) {
     *   name = realNameMap[name.toLowerCase()] || name;
     *   return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
     * };
     *
     * var greet = function(formatted) {
     *   return 'Hiya ' + formatted + '!';
     * };
     *
     * var welcome = _.compose(greet, format);
     * welcome('pebbles');
     * // => 'Hiya Penelope!'
     */
    function compose() {
      var funcs = arguments,
          length = funcs.length;

      while (length--) {
        if (!isFunction(funcs[length])) {
          throw new TypeError;
        }
      }
      return function() {
        var args = arguments,
            length = funcs.length;

        while (length--) {
          args = [funcs[length].apply(this, args)];
        }
        return args[0];
      };
    }

    /**
     * Creates a function which accepts one or more arguments of `func` that when
     * invoked either executes `func` returning its result, if all `func` arguments
     * have been provided, or returns a function that accepts one or more of the
     * remaining `func` arguments, and so on. The arity of `func` can be specified
     * if `func.length` is not sufficient.
     *
     * @static
     * @memberOf _
     * @category Functions
     * @param {Function} func The function to curry.
     * @param {number} [arity=func.length] The arity of `func`.
     * @returns {Function} Returns the new curried function.
     * @example
     *
     * var curried = _.curry(function(a, b, c) {
     *   console.log(a + b + c);
     * });
     *
     * curried(1)(2)(3);
     * // => 6
     *
     * curried(1, 2)(3);
     * // => 6
     *
     * curried(1, 2, 3);
     * // => 6
     */
    function curry(func, arity) {
      arity = typeof arity == 'number' ? arity : (+arity || func.length);
      return createWrapper(func, 4, null, null, null, arity);
    }

    /**
     * Creates a function that will delay the execution of `func` until after
     * `wait` milliseconds have elapsed since the last time it was invoked.
     * Provide an options object to indicate that `func` should be invoked on
     * the leading and/or trailing edge of the `wait` timeout. Subsequent calls
     * to the debounced function will return the result of the last `func` call.
     *
     * Note: If `leading` and `trailing` options are `true` `func` will be called
     * on the trailing edge of the timeout only if the the debounced function is
     * invoked more than once during the `wait` timeout.
     *
     * @static
     * @memberOf _
     * @category Functions
     * @param {Function} func The function to debounce.
     * @param {number} wait The number of milliseconds to delay.
     * @param {Object} [options] The options object.
     * @param {boolean} [options.leading=false] Specify execution on the leading edge of the timeout.
     * @param {number} [options.maxWait] The maximum time `func` is allowed to be delayed before it's called.
     * @param {boolean} [options.trailing=true] Specify execution on the trailing edge of the timeout.
     * @returns {Function} Returns the new debounced function.
     * @example
     *
     * // avoid costly calculations while the window size is in flux
     * var lazyLayout = _.debounce(calculateLayout, 150);
     * jQuery(window).on('resize', lazyLayout);
     *
     * // execute `sendMail` when the click event is fired, debouncing subsequent calls
     * jQuery('#postbox').on('click', _.debounce(sendMail, 300, {
     *   'leading': true,
     *   'trailing': false
     * });
     *
     * // ensure `batchLog` is executed once after 1 second of debounced calls
     * var source = new EventSource('/stream');
     * source.addEventListener('message', _.debounce(batchLog, 250, {
     *   'maxWait': 1000
     * }, false);
     */
    function debounce(func, wait, options) {
      var args,
          maxTimeoutId,
          result,
          stamp,
          thisArg,
          timeoutId,
          trailingCall,
          lastCalled = 0,
          maxWait = false,
          trailing = true;

      if (!isFunction(func)) {
        throw new TypeError;
      }
      wait = nativeMax(0, wait) || 0;
      if (options === true) {
        var leading = true;
        trailing = false;
      } else if (isObject(options)) {
        leading = options.leading;
        maxWait = 'maxWait' in options && (nativeMax(wait, options.maxWait) || 0);
        trailing = 'trailing' in options ? options.trailing : trailing;
      }
      var delayed = function() {
        var remaining = wait - (now() - stamp);
        if (remaining <= 0) {
          if (maxTimeoutId) {
            clearTimeout(maxTimeoutId);
          }
          var isCalled = trailingCall;
          maxTimeoutId = timeoutId = trailingCall = undefined;
          if (isCalled) {
            lastCalled = now();
            result = func.apply(thisArg, args);
            if (!timeoutId && !maxTimeoutId) {
              args = thisArg = null;
            }
          }
        } else {
          timeoutId = setTimeout(delayed, remaining);
        }
      };

      var maxDelayed = function() {
        if (timeoutId) {
          clearTimeout(timeoutId);
        }
        maxTimeoutId = timeoutId = trailingCall = undefined;
        if (trailing || (maxWait !== wait)) {
          lastCalled = now();
          result = func.apply(thisArg, args);
          if (!timeoutId && !maxTimeoutId) {
            args = thisArg = null;
          }
        }
      };

      return function() {
        args = arguments;
        stamp = now();
        thisArg = this;
        trailingCall = trailing && (timeoutId || !leading);

        if (maxWait === false) {
          var leadingCall = leading && !timeoutId;
        } else {
          if (!maxTimeoutId && !leading) {
            lastCalled = stamp;
          }
          var remaining = maxWait - (stamp - lastCalled),
              isCalled = remaining <= 0;

          if (isCalled) {
            if (maxTimeoutId) {
              maxTimeoutId = clearTimeout(maxTimeoutId);
            }
            lastCalled = stamp;
            result = func.apply(thisArg, args);
          }
          else if (!maxTimeoutId) {
            maxTimeoutId = setTimeout(maxDelayed, remaining);
          }
        }
        if (isCalled && timeoutId) {
          timeoutId = clearTimeout(timeoutId);
        }
        else if (!timeoutId && wait !== maxWait) {
          timeoutId = setTimeout(delayed, wait);
        }
        if (leadingCall) {
          isCalled = true;
          result = func.apply(thisArg, args);
        }
        if (isCalled && !timeoutId && !maxTimeoutId) {
          args = thisArg = null;
        }
        return result;
      };
    }

    /**
     * Defers executing the `func` function until the current call stack has cleared.
     * Additional arguments will be provided to `func` when it is invoked.
     *
     * @static
     * @memberOf _
     * @category Functions
     * @param {Function} func The function to defer.
     * @param {...*} [arg] Arguments to invoke the function with.
     * @returns {number} Returns the timer id.
     * @example
     *
     * _.defer(function(text) { console.log(text); }, 'deferred');
     * // logs 'deferred' after one or more milliseconds
     */
    function defer(func) {
      if (!isFunction(func)) {
        throw new TypeError;
      }
      var args = slice(arguments, 1);
      return setTimeout(function() { func.apply(undefined, args); }, 1);
    }

    /**
     * Executes the `func` function after `wait` milliseconds. Additional arguments
     * will be provided to `func` when it is invoked.
     *
     * @static
     * @memberOf _
     * @category Functions
     * @param {Function} func The function to delay.
     * @param {number} wait The number of milliseconds to delay execution.
     * @param {...*} [arg] Arguments to invoke the function with.
     * @returns {number} Returns the timer id.
     * @example
     *
     * _.delay(function(text) { console.log(text); }, 1000, 'later');
     * // => logs 'later' after one second
     */
    function delay(func, wait) {
      if (!isFunction(func)) {
        throw new TypeError;
      }
      var args = slice(arguments, 2);
      return setTimeout(function() { func.apply(undefined, args); }, wait);
    }

    /**
     * Creates a function that memoizes the result of `func`. If `resolver` is
     * provided it will be used to determine the cache key for storing the result
     * based on the arguments provided to the memoized function. By default, the
     * first argument provided to the memoized function is used as the cache key.
     * The `func` is executed with the `this` binding of the memoized function.
     * The result cache is exposed as the `cache` property on the memoized function.
     *
     * @static
     * @memberOf _
     * @category Functions
     * @param {Function} func The function to have its output memoized.
     * @param {Function} [resolver] A function used to resolve the cache key.
     * @returns {Function} Returns the new memoizing function.
     * @example
     *
     * var fibonacci = _.memoize(function(n) {
     *   return n < 2 ? n : fibonacci(n - 1) + fibonacci(n - 2);
     * });
     *
     * fibonacci(9)
     * // => 34
     *
     * var data = {
     *   'fred': { 'name': 'fred', 'age': 40 },
     *   'pebbles': { 'name': 'pebbles', 'age': 1 }
     * };
     *
     * // modifying the result cache
     * var get = _.memoize(function(name) { return data[name]; }, _.identity);
     * get('pebbles');
     * // => { 'name': 'pebbles', 'age': 1 }
     *
     * get.cache.pebbles.name = 'penelope';
     * get('pebbles');
     * // => { 'name': 'penelope', 'age': 1 }
     */
    function memoize(func, resolver) {
      if (!isFunction(func)) {
        throw new TypeError;
      }
      var memoized = function() {
        var cache = memoized.cache,
            key = resolver ? resolver.apply(this, arguments) : keyPrefix + arguments[0];

        return hasOwnProperty.call(cache, key)
          ? cache[key]
          : (cache[key] = func.apply(this, arguments));
      }
      memoized.cache = {};
      return memoized;
    }

    /**
     * Creates a function that is restricted to execute `func` once. Repeat calls to
     * the function will return the value of the first call. The `func` is executed
     * with the `this` binding of the created function.
     *
     * @static
     * @memberOf _
     * @category Functions
     * @param {Function} func The function to restrict.
     * @returns {Function} Returns the new restricted function.
     * @example
     *
     * var initialize = _.once(createApplication);
     * initialize();
     * initialize();
     * // `initialize` executes `createApplication` once
     */
    function once(func) {
      var ran,
          result;

      if (!isFunction(func)) {
        throw new TypeError;
      }
      return function() {
        if (ran) {
          return result;
        }
        ran = true;
        result = func.apply(this, arguments);

        // clear the `func` variable so the function may be garbage collected
        func = null;
        return result;
      };
    }

    /**
     * Creates a function that, when called, invokes `func` with any additional
     * `partial` arguments prepended to those provided to the new function. This
     * method is similar to `_.bind` except it does **not** alter the `this` binding.
     *
     * @static
     * @memberOf _
     * @category Functions
     * @param {Function} func The function to partially apply arguments to.
     * @param {...*} [arg] Arguments to be partially applied.
     * @returns {Function} Returns the new partially applied function.
     * @example
     *
     * var greet = function(greeting, name) { return greeting + ' ' + name; };
     * var hi = _.partial(greet, 'hi');
     * hi('fred');
     * // => 'hi fred'
     */
    function partial(func) {
      return createWrapper(func, 16, slice(arguments, 1));
    }

    /**
     * This method is like `_.partial` except that `partial` arguments are
     * appended to those provided to the new function.
     *
     * @static
     * @memberOf _
     * @category Functions
     * @param {Function} func The function to partially apply arguments to.
     * @param {...*} [arg] Arguments to be partially applied.
     * @returns {Function} Returns the new partially applied function.
     * @example
     *
     * var defaultsDeep = _.partialRight(_.merge, _.defaults);
     *
     * var options = {
     *   'variable': 'data',
     *   'imports': { 'jq': $ }
     * };
     *
     * defaultsDeep(options, _.templateSettings);
     *
     * options.variable
     * // => 'data'
     *
     * options.imports
     * // => { '_': _, 'jq': $ }
     */
    function partialRight(func) {
      return createWrapper(func, 32, null, slice(arguments, 1));
    }

    /**
     * Creates a function that, when executed, will only call the `func` function
     * at most once per every `wait` milliseconds. Provide an options object to
     * indicate that `func` should be invoked on the leading and/or trailing edge
     * of the `wait` timeout. Subsequent calls to the throttled function will
     * return the result of the last `func` call.
     *
     * Note: If `leading` and `trailing` options are `true` `func` will be called
     * on the trailing edge of the timeout only if the the throttled function is
     * invoked more than once during the `wait` timeout.
     *
     * @static
     * @memberOf _
     * @category Functions
     * @param {Function} func The function to throttle.
     * @param {number} wait The number of milliseconds to throttle executions to.
     * @param {Object} [options] The options object.
     * @param {boolean} [options.leading=true] Specify execution on the leading edge of the timeout.
     * @param {boolean} [options.trailing=true] Specify execution on the trailing edge of the timeout.
     * @returns {Function} Returns the new throttled function.
     * @example
     *
     * // avoid excessively updating the position while scrolling
     * var throttled = _.throttle(updatePosition, 100);
     * jQuery(window).on('scroll', throttled);
     *
     * // execute `renewToken` when the click event is fired, but not more than once every 5 minutes
     * jQuery('.interactive').on('click', _.throttle(renewToken, 300000, {
     *   'trailing': false
     * }));
     */
    function throttle(func, wait, options) {
      var leading = true,
          trailing = true;

      if (!isFunction(func)) {
        throw new TypeError;
      }
      if (options === false) {
        leading = false;
      } else if (isObject(options)) {
        leading = 'leading' in options ? options.leading : leading;
        trailing = 'trailing' in options ? options.trailing : trailing;
      }
      debounceOptions.leading = leading;
      debounceOptions.maxWait = wait;
      debounceOptions.trailing = trailing;

      return debounce(func, wait, debounceOptions);
    }

    /**
     * Creates a function that provides `value` to the wrapper function as its
     * first argument. Additional arguments provided to the function are appended
     * to those provided to the wrapper function. The wrapper is executed with
     * the `this` binding of the created function.
     *
     * @static
     * @memberOf _
     * @category Functions
     * @param {*} value The value to wrap.
     * @param {Function} wrapper The wrapper function.
     * @returns {Function} Returns the new function.
     * @example
     *
     * var p = _.wrap(_.escape, function(func, text) {
     *   return '<p>' + func(text) + '</p>';
     * });
     *
     * p('Fred, Wilma, & Pebbles');
     * // => '<p>Fred, Wilma, &amp; Pebbles</p>'
     */
    function wrap(value, wrapper) {
      return createWrapper(wrapper, 16, [value]);
    }

    /*--------------------------------------------------------------------------*/

    /**
     * Creates a function that returns `value`.
     *
     * @static
     * @memberOf _
     * @category Utilities
     * @param {*} value The value to return from the new function.
     * @returns {Function} Returns the new function.
     * @example
     *
     * var object = { 'name': 'fred' };
     * var getter = _.constant(object);
     * getter() === object;
     * // => true
     */
    function constant(value) {
      return function() {
        return value;
      };
    }

    /**
     * Produces a callback bound to an optional `thisArg`. If `func` is a property
     * name the created callback will return the property value for a given element.
     * If `func` is an object the created callback will return `true` for elements
     * that contain the equivalent object properties, otherwise it will return `false`.
     *
     * @static
     * @memberOf _
     * @category Utilities
     * @param {*} [func=identity] The value to convert to a callback.
     * @param {*} [thisArg] The `this` binding of the created callback.
     * @param {number} [argCount] The number of arguments the callback accepts.
     * @returns {Function} Returns a callback function.
     * @example
     *
     * var characters = [
     *   { 'name': 'barney', 'age': 36 },
     *   { 'name': 'fred',   'age': 40 }
     * ];
     *
     * // wrap to create custom callback shorthands
     * _.createCallback = _.wrap(_.createCallback, function(func, callback, thisArg) {
     *   var match = /^(.+?)__([gl]t)(.+)$/.exec(callback);
     *   return !match ? func(callback, thisArg) : function(object) {
     *     return match[2] == 'gt' ? object[match[1]] > match[3] : object[match[1]] < match[3];
     *   };
     * });
     *
     * _.filter(characters, 'age__gt38');
     * // => [{ 'name': 'fred', 'age': 40 }]
     */
    function createCallback(func, thisArg, argCount) {
      var type = typeof func;
      if (func == null || type == 'function') {
        return baseCreateCallback(func, thisArg, argCount);
      }
      // handle "_.pluck" style callback shorthands
      if (type != 'object') {
        return property(func);
      }
      var props = keys(func),
          key = props[0],
          a = func[key];

      // handle "_.where" style callback shorthands
      if (props.length == 1 && a === a && !isObject(a)) {
        // fast path the common case of providing an object with a single
        // property containing a primitive value
        return function(object) {
          var b = object[key];
          return a === b && (a !== 0 || (1 / a == 1 / b));
        };
      }
      return function(object) {
        var length = props.length,
            result = false;

        while (length--) {
          if (!(result = baseIsEqual(object[props[length]], func[props[length]], null, true))) {
            break;
          }
        }
        return result;
      };
    }

    /**
     * Converts the characters `&`, `<`, `>`, `"`, and `'` in `string` to their
     * corresponding HTML entities.
     *
     * @static
     * @memberOf _
     * @category Utilities
     * @param {string} string The string to escape.
     * @returns {string} Returns the escaped string.
     * @example
     *
     * _.escape('Fred, Wilma, & Pebbles');
     * // => 'Fred, Wilma, &amp; Pebbles'
     */
    function escape(string) {
      return string == null ? '' : String(string).replace(reUnescapedHtml, escapeHtmlChar);
    }

    /**
     * This method returns the first argument provided to it.
     *
     * @static
     * @memberOf _
     * @category Utilities
     * @param {*} value Any value.
     * @returns {*} Returns `value`.
     * @example
     *
     * var object = { 'name': 'fred' };
     * _.identity(object) === object;
     * // => true
     */
    function identity(value) {
      return value;
    }

    /**
     * Adds function properties of a source object to the destination object.
     * If `object` is a function methods will be added to its prototype as well.
     *
     * @static
     * @memberOf _
     * @category Utilities
     * @param {Function|Object} [object=lodash] object The destination object.
     * @param {Object} source The object of functions to add.
     * @param {Object} [options] The options object.
     * @param {boolean} [options.chain=true] Specify whether the functions added are chainable.
     * @example
     *
     * function capitalize(string) {
     *   return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
     * }
     *
     * _.mixin({ 'capitalize': capitalize });
     * _.capitalize('fred');
     * // => 'Fred'
     *
     * _('fred').capitalize().value();
     * // => 'Fred'
     *
     * _.mixin({ 'capitalize': capitalize }, { 'chain': false });
     * _('fred').capitalize();
     * // => 'Fred'
     */
    function mixin(object, source, options) {
      var chain = true,
          methodNames = source && functions(source);

      if (!source || (!options && !methodNames.length)) {
        if (options == null) {
          options = source;
        }
        ctor = lodashWrapper;
        source = object;
        object = lodash;
        methodNames = functions(source);
      }
      if (options === false) {
        chain = false;
      } else if (isObject(options) && 'chain' in options) {
        chain = options.chain;
      }
      var ctor = object,
          isFunc = isFunction(ctor);

      forEach(methodNames, function(methodName) {
        var func = object[methodName] = source[methodName];
        if (isFunc) {
          ctor.prototype[methodName] = function() {
            var chainAll = this.__chain__,
                value = this.__wrapped__,
                args = [value];

            push.apply(args, arguments);
            var result = func.apply(object, args);
            if (chain || chainAll) {
              if (value === result && isObject(result)) {
                return this;
              }
              result = new ctor(result);
              result.__chain__ = chainAll;
            }
            return result;
          };
        }
      });
    }

    /**
     * Reverts the '_' variable to its previous value and returns a reference to
     * the `lodash` function.
     *
     * @static
     * @memberOf _
     * @category Utilities
     * @returns {Function} Returns the `lodash` function.
     * @example
     *
     * var lodash = _.noConflict();
     */
    function noConflict() {
      context._ = oldDash;
      return this;
    }

    /**
     * A no-operation function.
     *
     * @static
     * @memberOf _
     * @category Utilities
     * @example
     *
     * var object = { 'name': 'fred' };
     * _.noop(object) === undefined;
     * // => true
     */
    function noop() {
      // no operation performed
    }

    /**
     * Gets the number of milliseconds that have elapsed since the Unix epoch
     * (1 January 1970 00:00:00 UTC).
     *
     * @static
     * @memberOf _
     * @category Utilities
     * @example
     *
     * var stamp = _.now();
     * _.defer(function() { console.log(_.now() - stamp); });
     * // => logs the number of milliseconds it took for the deferred function to be called
     */
    var now = isNative(now = Date.now) && now || function() {
      return new Date().getTime();
    };

    /**
     * Converts the given value into an integer of the specified radix.
     * If `radix` is `undefined` or `0` a `radix` of `10` is used unless the
     * `value` is a hexadecimal, in which case a `radix` of `16` is used.
     *
     * Note: This method avoids differences in native ES3 and ES5 `parseInt`
     * implementations. See http://es5.github.io/#E.
     *
     * @static
     * @memberOf _
     * @category Utilities
     * @param {string} value The value to parse.
     * @param {number} [radix] The radix used to interpret the value to parse.
     * @returns {number} Returns the new integer value.
     * @example
     *
     * _.parseInt('08');
     * // => 8
     */
    var parseInt = nativeParseInt(whitespace + '08') == 8 ? nativeParseInt : function(value, radix) {
      // Firefox < 21 and Opera < 15 follow the ES3 specified implementation of `parseInt`
      return nativeParseInt(isString(value) ? value.replace(reLeadingSpacesAndZeros, '') : value, radix || 0);
    };

    /**
     * Creates a "_.pluck" style function, which returns the `key` value of a
     * given object.
     *
     * @static
     * @memberOf _
     * @category Utilities
     * @param {string} key The name of the property to retrieve.
     * @returns {Function} Returns the new function.
     * @example
     *
     * var characters = [
     *   { 'name': 'fred',   'age': 40 },
     *   { 'name': 'barney', 'age': 36 }
     * ];
     *
     * var getName = _.property('name');
     *
     * _.map(characters, getName);
     * // => ['barney', 'fred']
     *
     * _.sortBy(characters, getName);
     * // => [{ 'name': 'barney', 'age': 36 }, { 'name': 'fred',   'age': 40 }]
     */
    function property(key) {
      return function(object) {
        return object[key];
      };
    }

    /**
     * Produces a random number between `min` and `max` (inclusive). If only one
     * argument is provided a number between `0` and the given number will be
     * returned. If `floating` is truey or either `min` or `max` are floats a
     * floating-point number will be returned instead of an integer.
     *
     * @static
     * @memberOf _
     * @category Utilities
     * @param {number} [min=0] The minimum possible value.
     * @param {number} [max=1] The maximum possible value.
     * @param {boolean} [floating=false] Specify returning a floating-point number.
     * @returns {number} Returns a random number.
     * @example
     *
     * _.random(0, 5);
     * // => an integer between 0 and 5
     *
     * _.random(5);
     * // => also an integer between 0 and 5
     *
     * _.random(5, true);
     * // => a floating-point number between 0 and 5
     *
     * _.random(1.2, 5.2);
     * // => a floating-point number between 1.2 and 5.2
     */
    function random(min, max, floating) {
      var noMin = min == null,
          noMax = max == null;

      if (floating == null) {
        if (typeof min == 'boolean' && noMax) {
          floating = min;
          min = 1;
        }
        else if (!noMax && typeof max == 'boolean') {
          floating = max;
          noMax = true;
        }
      }
      if (noMin && noMax) {
        max = 1;
      }
      min = +min || 0;
      if (noMax) {
        max = min;
        min = 0;
      } else {
        max = +max || 0;
      }
      if (floating || min % 1 || max % 1) {
        var rand = nativeRandom();
        return nativeMin(min + (rand * (max - min + parseFloat('1e-' + ((rand +'').length - 1)))), max);
      }
      return baseRandom(min, max);
    }

    /**
     * Resolves the value of property `key` on `object`. If `key` is a function
     * it will be invoked with the `this` binding of `object` and its result returned,
     * else the property value is returned. If `object` is falsey then `undefined`
     * is returned.
     *
     * @static
     * @memberOf _
     * @category Utilities
     * @param {Object} object The object to inspect.
     * @param {string} key The name of the property to resolve.
     * @returns {*} Returns the resolved value.
     * @example
     *
     * var object = {
     *   'cheese': 'crumpets',
     *   'stuff': function() {
     *     return 'nonsense';
     *   }
     * };
     *
     * _.result(object, 'cheese');
     * // => 'crumpets'
     *
     * _.result(object, 'stuff');
     * // => 'nonsense'
     */
    function result(object, key) {
      if (object) {
        var value = object[key];
        return isFunction(value) ? object[key]() : value;
      }
    }

    /**
     * A micro-templating method that handles arbitrary delimiters, preserves
     * whitespace, and correctly escapes quotes within interpolated code.
     *
     * Note: In the development build, `_.template` utilizes sourceURLs for easier
     * debugging. See http://www.html5rocks.com/en/tutorials/developertools/sourcemaps/#toc-sourceurl
     *
     * For more information on precompiling templates see:
     * http://lodash.com/custom-builds
     *
     * For more information on Chrome extension sandboxes see:
     * http://developer.chrome.com/stable/extensions/sandboxingEval.html
     *
     * @static
     * @memberOf _
     * @category Utilities
     * @param {string} text The template text.
     * @param {Object} data The data object used to populate the text.
     * @param {Object} [options] The options object.
     * @param {RegExp} [options.escape] The "escape" delimiter.
     * @param {RegExp} [options.evaluate] The "evaluate" delimiter.
     * @param {Object} [options.imports] An object to import into the template as local variables.
     * @param {RegExp} [options.interpolate] The "interpolate" delimiter.
     * @param {string} [sourceURL] The sourceURL of the template's compiled source.
     * @param {string} [variable] The data object variable name.
     * @returns {Function|string} Returns a compiled function when no `data` object
     *  is given, else it returns the interpolated text.
     * @example
     *
     * // using the "interpolate" delimiter to create a compiled template
     * var compiled = _.template('hello <%= name %>');
     * compiled({ 'name': 'fred' });
     * // => 'hello fred'
     *
     * // using the "escape" delimiter to escape HTML in data property values
     * _.template('<b><%- value %></b>', { 'value': '<script>' });
     * // => '<b>&lt;script&gt;</b>'
     *
     * // using the "evaluate" delimiter to generate HTML
     * var list = '<% _.forEach(people, function(name) { %><li><%- name %></li><% }); %>';
     * _.template(list, { 'people': ['fred', 'barney'] });
     * // => '<li>fred</li><li>barney</li>'
     *
     * // using the ES6 delimiter as an alternative to the default "interpolate" delimiter
     * _.template('hello ${ name }', { 'name': 'pebbles' });
     * // => 'hello pebbles'
     *
     * // using the internal `print` function in "evaluate" delimiters
     * _.template('<% print("hello " + name); %>!', { 'name': 'barney' });
     * // => 'hello barney!'
     *
     * // using a custom template delimiters
     * _.templateSettings = {
     *   'interpolate': /{{([\s\S]+?)}}/g
     * };
     *
     * _.template('hello {{ name }}!', { 'name': 'mustache' });
     * // => 'hello mustache!'
     *
     * // using the `imports` option to import jQuery
     * var list = '<% jq.each(people, function(name) { %><li><%- name %></li><% }); %>';
     * _.template(list, { 'people': ['fred', 'barney'] }, { 'imports': { 'jq': jQuery } });
     * // => '<li>fred</li><li>barney</li>'
     *
     * // using the `sourceURL` option to specify a custom sourceURL for the template
     * var compiled = _.template('hello <%= name %>', null, { 'sourceURL': '/basic/greeting.jst' });
     * compiled(data);
     * // => find the source of "greeting.jst" under the Sources tab or Resources panel of the web inspector
     *
     * // using the `variable` option to ensure a with-statement isn't used in the compiled template
     * var compiled = _.template('hi <%= data.name %>!', null, { 'variable': 'data' });
     * compiled.source;
     * // => function(data) {
     *   var __t, __p = '', __e = _.escape;
     *   __p += 'hi ' + ((__t = ( data.name )) == null ? '' : __t) + '!';
     *   return __p;
     * }
     *
     * // using the `source` property to inline compiled templates for meaningful
     * // line numbers in error messages and a stack trace
     * fs.writeFileSync(path.join(cwd, 'jst.js'), '\
     *   var JST = {\
     *     "main": ' + _.template(mainText).source + '\
     *   };\
     * ');
     */
    function template(text, data, options) {
      // based on John Resig's `tmpl` implementation
      // http://ejohn.org/blog/javascript-micro-templating/
      // and Laura Doktorova's doT.js
      // https://github.com/olado/doT
      var settings = lodash.templateSettings;
      text = String(text || '');

      // avoid missing dependencies when `iteratorTemplate` is not defined
      options = defaults({}, options, settings);

      var imports = defaults({}, options.imports, settings.imports),
          importsKeys = keys(imports),
          importsValues = values(imports);

      var isEvaluating,
          index = 0,
          interpolate = options.interpolate || reNoMatch,
          source = "__p += '";

      // compile the regexp to match each delimiter
      var reDelimiters = RegExp(
        (options.escape || reNoMatch).source + '|' +
        interpolate.source + '|' +
        (interpolate === reInterpolate ? reEsTemplate : reNoMatch).source + '|' +
        (options.evaluate || reNoMatch).source + '|$'
      , 'g');

      text.replace(reDelimiters, function(match, escapeValue, interpolateValue, esTemplateValue, evaluateValue, offset) {
        interpolateValue || (interpolateValue = esTemplateValue);

        // escape characters that cannot be included in string literals
        source += text.slice(index, offset).replace(reUnescapedString, escapeStringChar);

        // replace delimiters with snippets
        if (escapeValue) {
          source += "' +\n__e(" + escapeValue + ") +\n'";
        }
        if (evaluateValue) {
          isEvaluating = true;
          source += "';\n" + evaluateValue + ";\n__p += '";
        }
        if (interpolateValue) {
          source += "' +\n((__t = (" + interpolateValue + ")) == null ? '' : __t) +\n'";
        }
        index = offset + match.length;

        // the JS engine embedded in Adobe products requires returning the `match`
        // string in order to produce the correct `offset` value
        return match;
      });

      source += "';\n";

      // if `variable` is not specified, wrap a with-statement around the generated
      // code to add the data object to the top of the scope chain
      var variable = options.variable,
          hasVariable = variable;

      if (!hasVariable) {
        variable = 'obj';
        source = 'with (' + variable + ') {\n' + source + '\n}\n';
      }
      // cleanup code by stripping empty strings
      source = (isEvaluating ? source.replace(reEmptyStringLeading, '') : source)
        .replace(reEmptyStringMiddle, '$1')
        .replace(reEmptyStringTrailing, '$1;');

      // frame code as the function body
      source = 'function(' + variable + ') {\n' +
        (hasVariable ? '' : variable + ' || (' + variable + ' = {});\n') +
        "var __t, __p = '', __e = _.escape" +
        (isEvaluating
          ? ', __j = Array.prototype.join;\n' +
            "function print() { __p += __j.call(arguments, '') }\n"
          : ';\n'
        ) +
        source +
        'return __p\n}';

      // Use a sourceURL for easier debugging.
      // http://www.html5rocks.com/en/tutorials/developertools/sourcemaps/#toc-sourceurl
      var sourceURL = '\n/*\n//# sourceURL=' + (options.sourceURL || '/lodash/template/source[' + (templateCounter++) + ']') + '\n*/';

      try {
        var result = Function(importsKeys, 'return ' + source + sourceURL).apply(undefined, importsValues);
      } catch(e) {
        e.source = source;
        throw e;
      }
      if (data) {
        return result(data);
      }
      // provide the compiled function's source by its `toString` method, in
      // supported environments, or the `source` property as a convenience for
      // inlining compiled templates during the build process
      result.source = source;
      return result;
    }

    /**
     * Executes the callback `n` times, returning an array of the results
     * of each callback execution. The callback is bound to `thisArg` and invoked
     * with one argument; (index).
     *
     * @static
     * @memberOf _
     * @category Utilities
     * @param {number} n The number of times to execute the callback.
     * @param {Function} callback The function called per iteration.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {Array} Returns an array of the results of each `callback` execution.
     * @example
     *
     * var diceRolls = _.times(3, _.partial(_.random, 1, 6));
     * // => [3, 6, 4]
     *
     * _.times(3, function(n) { mage.castSpell(n); });
     * // => calls `mage.castSpell(n)` three times, passing `n` of `0`, `1`, and `2` respectively
     *
     * _.times(3, function(n) { this.cast(n); }, mage);
     * // => also calls `mage.castSpell(n)` three times
     */
    function times(n, callback, thisArg) {
      n = (n = +n) > -1 ? n : 0;
      var index = -1,
          result = Array(n);

      callback = baseCreateCallback(callback, thisArg, 1);
      while (++index < n) {
        result[index] = callback(index);
      }
      return result;
    }

    /**
     * The inverse of `_.escape` this method converts the HTML entities
     * `&amp;`, `&lt;`, `&gt;`, `&quot;`, and `&#39;` in `string` to their
     * corresponding characters.
     *
     * @static
     * @memberOf _
     * @category Utilities
     * @param {string} string The string to unescape.
     * @returns {string} Returns the unescaped string.
     * @example
     *
     * _.unescape('Fred, Barney &amp; Pebbles');
     * // => 'Fred, Barney & Pebbles'
     */
    function unescape(string) {
      return string == null ? '' : String(string).replace(reEscapedHtml, unescapeHtmlChar);
    }

    /**
     * Generates a unique ID. If `prefix` is provided the ID will be appended to it.
     *
     * @static
     * @memberOf _
     * @category Utilities
     * @param {string} [prefix] The value to prefix the ID with.
     * @returns {string} Returns the unique ID.
     * @example
     *
     * _.uniqueId('contact_');
     * // => 'contact_104'
     *
     * _.uniqueId();
     * // => '105'
     */
    function uniqueId(prefix) {
      var id = ++idCounter;
      return String(prefix == null ? '' : prefix) + id;
    }

    /*--------------------------------------------------------------------------*/

    /**
     * Creates a `lodash` object that wraps the given value with explicit
     * method chaining enabled.
     *
     * @static
     * @memberOf _
     * @category Chaining
     * @param {*} value The value to wrap.
     * @returns {Object} Returns the wrapper object.
     * @example
     *
     * var characters = [
     *   { 'name': 'barney',  'age': 36 },
     *   { 'name': 'fred',    'age': 40 },
     *   { 'name': 'pebbles', 'age': 1 }
     * ];
     *
     * var youngest = _.chain(characters)
     *     .sortBy('age')
     *     .map(function(chr) { return chr.name + ' is ' + chr.age; })
     *     .first()
     *     .value();
     * // => 'pebbles is 1'
     */
    function chain(value) {
      value = new lodashWrapper(value);
      value.__chain__ = true;
      return value;
    }

    /**
     * Invokes `interceptor` with the `value` as the first argument and then
     * returns `value`. The purpose of this method is to "tap into" a method
     * chain in order to perform operations on intermediate results within
     * the chain.
     *
     * @static
     * @memberOf _
     * @category Chaining
     * @param {*} value The value to provide to `interceptor`.
     * @param {Function} interceptor The function to invoke.
     * @returns {*} Returns `value`.
     * @example
     *
     * _([1, 2, 3, 4])
     *  .tap(function(array) { array.pop(); })
     *  .reverse()
     *  .value();
     * // => [3, 2, 1]
     */
    function tap(value, interceptor) {
      interceptor(value);
      return value;
    }

    /**
     * Enables explicit method chaining on the wrapper object.
     *
     * @name chain
     * @memberOf _
     * @category Chaining
     * @returns {*} Returns the wrapper object.
     * @example
     *
     * var characters = [
     *   { 'name': 'barney', 'age': 36 },
     *   { 'name': 'fred',   'age': 40 }
     * ];
     *
     * // without explicit chaining
     * _(characters).first();
     * // => { 'name': 'barney', 'age': 36 }
     *
     * // with explicit chaining
     * _(characters).chain()
     *   .first()
     *   .pick('age')
     *   .value();
     * // => { 'age': 36 }
     */
    function wrapperChain() {
      this.__chain__ = true;
      return this;
    }

    /**
     * Produces the `toString` result of the wrapped value.
     *
     * @name toString
     * @memberOf _
     * @category Chaining
     * @returns {string} Returns the string result.
     * @example
     *
     * _([1, 2, 3]).toString();
     * // => '1,2,3'
     */
    function wrapperToString() {
      return String(this.__wrapped__);
    }

    /**
     * Extracts the wrapped value.
     *
     * @name valueOf
     * @memberOf _
     * @alias value
     * @category Chaining
     * @returns {*} Returns the wrapped value.
     * @example
     *
     * _([1, 2, 3]).valueOf();
     * // => [1, 2, 3]
     */
    function wrapperValueOf() {
      return this.__wrapped__;
    }

    /*--------------------------------------------------------------------------*/

    // add functions that return wrapped values when chaining
    lodash.after = after;
    lodash.assign = assign;
    lodash.at = at;
    lodash.bind = bind;
    lodash.bindAll = bindAll;
    lodash.bindKey = bindKey;
    lodash.chain = chain;
    lodash.compact = compact;
    lodash.compose = compose;
    lodash.constant = constant;
    lodash.countBy = countBy;
    lodash.create = create;
    lodash.createCallback = createCallback;
    lodash.curry = curry;
    lodash.debounce = debounce;
    lodash.defaults = defaults;
    lodash.defer = defer;
    lodash.delay = delay;
    lodash.difference = difference;
    lodash.filter = filter;
    lodash.flatten = flatten;
    lodash.forEach = forEach;
    lodash.forEachRight = forEachRight;
    lodash.forIn = forIn;
    lodash.forInRight = forInRight;
    lodash.forOwn = forOwn;
    lodash.forOwnRight = forOwnRight;
    lodash.functions = functions;
    lodash.groupBy = groupBy;
    lodash.indexBy = indexBy;
    lodash.initial = initial;
    lodash.intersection = intersection;
    lodash.invert = invert;
    lodash.invoke = invoke;
    lodash.keys = keys;
    lodash.map = map;
    lodash.mapValues = mapValues;
    lodash.max = max;
    lodash.memoize = memoize;
    lodash.merge = merge;
    lodash.min = min;
    lodash.omit = omit;
    lodash.once = once;
    lodash.pairs = pairs;
    lodash.partial = partial;
    lodash.partialRight = partialRight;
    lodash.pick = pick;
    lodash.pluck = pluck;
    lodash.property = property;
    lodash.pull = pull;
    lodash.range = range;
    lodash.reject = reject;
    lodash.remove = remove;
    lodash.rest = rest;
    lodash.shuffle = shuffle;
    lodash.sortBy = sortBy;
    lodash.tap = tap;
    lodash.throttle = throttle;
    lodash.times = times;
    lodash.toArray = toArray;
    lodash.transform = transform;
    lodash.union = union;
    lodash.uniq = uniq;
    lodash.values = values;
    lodash.where = where;
    lodash.without = without;
    lodash.wrap = wrap;
    lodash.xor = xor;
    lodash.zip = zip;
    lodash.zipObject = zipObject;

    // add aliases
    lodash.collect = map;
    lodash.drop = rest;
    lodash.each = forEach;
    lodash.eachRight = forEachRight;
    lodash.extend = assign;
    lodash.methods = functions;
    lodash.object = zipObject;
    lodash.select = filter;
    lodash.tail = rest;
    lodash.unique = uniq;
    lodash.unzip = zip;

    // add functions to `lodash.prototype`
    mixin(lodash);

    /*--------------------------------------------------------------------------*/

    // add functions that return unwrapped values when chaining
    lodash.clone = clone;
    lodash.cloneDeep = cloneDeep;
    lodash.contains = contains;
    lodash.escape = escape;
    lodash.every = every;
    lodash.find = find;
    lodash.findIndex = findIndex;
    lodash.findKey = findKey;
    lodash.findLast = findLast;
    lodash.findLastIndex = findLastIndex;
    lodash.findLastKey = findLastKey;
    lodash.has = has;
    lodash.identity = identity;
    lodash.indexOf = indexOf;
    lodash.isArguments = isArguments;
    lodash.isArray = isArray;
    lodash.isBoolean = isBoolean;
    lodash.isDate = isDate;
    lodash.isElement = isElement;
    lodash.isEmpty = isEmpty;
    lodash.isEqual = isEqual;
    lodash.isFinite = isFinite;
    lodash.isFunction = isFunction;
    lodash.isNaN = isNaN;
    lodash.isNull = isNull;
    lodash.isNumber = isNumber;
    lodash.isObject = isObject;
    lodash.isPlainObject = isPlainObject;
    lodash.isRegExp = isRegExp;
    lodash.isString = isString;
    lodash.isUndefined = isUndefined;
    lodash.lastIndexOf = lastIndexOf;
    lodash.mixin = mixin;
    lodash.noConflict = noConflict;
    lodash.noop = noop;
    lodash.now = now;
    lodash.parseInt = parseInt;
    lodash.random = random;
    lodash.reduce = reduce;
    lodash.reduceRight = reduceRight;
    lodash.result = result;
    lodash.runInContext = runInContext;
    lodash.size = size;
    lodash.some = some;
    lodash.sortedIndex = sortedIndex;
    lodash.template = template;
    lodash.unescape = unescape;
    lodash.uniqueId = uniqueId;

    // add aliases
    lodash.all = every;
    lodash.any = some;
    lodash.detect = find;
    lodash.findWhere = find;
    lodash.foldl = reduce;
    lodash.foldr = reduceRight;
    lodash.include = contains;
    lodash.inject = reduce;

    mixin(function() {
      var source = {}
      forOwn(lodash, function(func, methodName) {
        if (!lodash.prototype[methodName]) {
          source[methodName] = func;
        }
      });
      return source;
    }(), false);

    /*--------------------------------------------------------------------------*/

    // add functions capable of returning wrapped and unwrapped values when chaining
    lodash.first = first;
    lodash.last = last;
    lodash.sample = sample;

    // add aliases
    lodash.take = first;
    lodash.head = first;

    forOwn(lodash, function(func, methodName) {
      var callbackable = methodName !== 'sample';
      if (!lodash.prototype[methodName]) {
        lodash.prototype[methodName]= function(n, guard) {
          var chainAll = this.__chain__,
              result = func(this.__wrapped__, n, guard);

          return !chainAll && (n == null || (guard && !(callbackable && typeof n == 'function')))
            ? result
            : new lodashWrapper(result, chainAll);
        };
      }
    });

    /*--------------------------------------------------------------------------*/

    /**
     * The semantic version number.
     *
     * @static
     * @memberOf _
     * @type string
     */
    lodash.VERSION = '2.4.1';

    // add "Chaining" functions to the wrapper
    lodash.prototype.chain = wrapperChain;
    lodash.prototype.toString = wrapperToString;
    lodash.prototype.value = wrapperValueOf;
    lodash.prototype.valueOf = wrapperValueOf;

    // add `Array` functions that return unwrapped values
    forEach(['join', 'pop', 'shift'], function(methodName) {
      var func = arrayRef[methodName];
      lodash.prototype[methodName] = function() {
        var chainAll = this.__chain__,
            result = func.apply(this.__wrapped__, arguments);

        return chainAll
          ? new lodashWrapper(result, chainAll)
          : result;
      };
    });

    // add `Array` functions that return the existing wrapped value
    forEach(['push', 'reverse', 'sort', 'unshift'], function(methodName) {
      var func = arrayRef[methodName];
      lodash.prototype[methodName] = function() {
        func.apply(this.__wrapped__, arguments);
        return this;
      };
    });

    // add `Array` functions that return new wrapped values
    forEach(['concat', 'slice', 'splice'], function(methodName) {
      var func = arrayRef[methodName];
      lodash.prototype[methodName] = function() {
        return new lodashWrapper(func.apply(this.__wrapped__, arguments), this.__chain__);
      };
    });

    return lodash;
  }

  /*--------------------------------------------------------------------------*/

  // expose Lo-Dash
  var _ = runInContext();

  // some AMD build optimizers like r.js check for condition patterns like the following:
  if (typeof define == 'function' && typeof define.amd == 'object' && define.amd) {
    // Expose Lo-Dash to the global object even when an AMD loader is present in
    // case Lo-Dash is loaded with a RequireJS shim config.
    // See http://requirejs.org/docs/api.html#config-shim
    root._ = _;

    // define as an anonymous module so, through path mapping, it can be
    // referenced as the "underscore" module
    define(function() {
      return _;
    });
  }
  // check for `exports` after `define` in case a build optimizer adds an `exports` object
  else if (freeExports && freeModule) {
    // in Node.js or RingoJS
    if (moduleExports) {
      (freeModule.exports = _)._ = _;
    }
    // in Narwhal or Rhino -require
    else {
      freeExports._ = _;
    }
  }
  else {
    // in a browser or Rhino
    root._ = _;
  }
}.call(this));

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],54:[function(require,module,exports){
'use strict';

module.exports = require('./lib/core.js')
require('./lib/done.js')
require('./lib/es6-extensions.js')
require('./lib/node-extensions.js')
},{"./lib/core.js":55,"./lib/done.js":56,"./lib/es6-extensions.js":57,"./lib/node-extensions.js":58}],55:[function(require,module,exports){
'use strict';

var asap = require('asap')

module.exports = Promise;
function Promise(fn) {
  if (typeof this !== 'object') throw new TypeError('Promises must be constructed via new')
  if (typeof fn !== 'function') throw new TypeError('not a function')
  var state = null
  var value = null
  var deferreds = []
  var self = this

  this.then = function(onFulfilled, onRejected) {
    return new self.constructor(function(resolve, reject) {
      handle(new Handler(onFulfilled, onRejected, resolve, reject))
    })
  }

  function handle(deferred) {
    if (state === null) {
      deferreds.push(deferred)
      return
    }
    asap(function() {
      var cb = state ? deferred.onFulfilled : deferred.onRejected
      if (cb === null) {
        (state ? deferred.resolve : deferred.reject)(value)
        return
      }
      var ret
      try {
        ret = cb(value)
      }
      catch (e) {
        deferred.reject(e)
        return
      }
      deferred.resolve(ret)
    })
  }

  function resolve(newValue) {
    try { //Promise Resolution Procedure: https://github.com/promises-aplus/promises-spec#the-promise-resolution-procedure
      if (newValue === self) throw new TypeError('A promise cannot be resolved with itself.')
      if (newValue && (typeof newValue === 'object' || typeof newValue === 'function')) {
        var then = newValue.then
        if (typeof then === 'function') {
          doResolve(then.bind(newValue), resolve, reject)
          return
        }
      }
      state = true
      value = newValue
      finale()
    } catch (e) { reject(e) }
  }

  function reject(newValue) {
    state = false
    value = newValue
    finale()
  }

  function finale() {
    for (var i = 0, len = deferreds.length; i < len; i++)
      handle(deferreds[i])
    deferreds = null
  }

  doResolve(fn, resolve, reject)
}


function Handler(onFulfilled, onRejected, resolve, reject){
  this.onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : null
  this.onRejected = typeof onRejected === 'function' ? onRejected : null
  this.resolve = resolve
  this.reject = reject
}

/**
 * Take a potentially misbehaving resolver function and make sure
 * onFulfilled and onRejected are only called once.
 *
 * Makes no guarantees about asynchrony.
 */
function doResolve(fn, onFulfilled, onRejected) {
  var done = false;
  try {
    fn(function (value) {
      if (done) return
      done = true
      onFulfilled(value)
    }, function (reason) {
      if (done) return
      done = true
      onRejected(reason)
    })
  } catch (ex) {
    if (done) return
    done = true
    onRejected(ex)
  }
}

},{"asap":59}],56:[function(require,module,exports){
'use strict';

var Promise = require('./core.js')
var asap = require('asap')

module.exports = Promise
Promise.prototype.done = function (onFulfilled, onRejected) {
  var self = arguments.length ? this.then.apply(this, arguments) : this
  self.then(null, function (err) {
    asap(function () {
      throw err
    })
  })
}
},{"./core.js":55,"asap":59}],57:[function(require,module,exports){
'use strict';

//This file contains the ES6 extensions to the core Promises/A+ API

var Promise = require('./core.js')
var asap = require('asap')

module.exports = Promise

/* Static Functions */

function ValuePromise(value) {
  this.then = function (onFulfilled) {
    if (typeof onFulfilled !== 'function') return this
    return new Promise(function (resolve, reject) {
      asap(function () {
        try {
          resolve(onFulfilled(value))
        } catch (ex) {
          reject(ex);
        }
      })
    })
  }
}
ValuePromise.prototype = Promise.prototype

var TRUE = new ValuePromise(true)
var FALSE = new ValuePromise(false)
var NULL = new ValuePromise(null)
var UNDEFINED = new ValuePromise(undefined)
var ZERO = new ValuePromise(0)
var EMPTYSTRING = new ValuePromise('')

Promise.resolve = function (value) {
  if (value instanceof Promise) return value

  if (value === null) return NULL
  if (value === undefined) return UNDEFINED
  if (value === true) return TRUE
  if (value === false) return FALSE
  if (value === 0) return ZERO
  if (value === '') return EMPTYSTRING

  if (typeof value === 'object' || typeof value === 'function') {
    try {
      var then = value.then
      if (typeof then === 'function') {
        return new Promise(then.bind(value))
      }
    } catch (ex) {
      return new Promise(function (resolve, reject) {
        reject(ex)
      })
    }
  }

  return new ValuePromise(value)
}

Promise.all = function (arr) {
  var args = Array.prototype.slice.call(arr)

  return new Promise(function (resolve, reject) {
    if (args.length === 0) return resolve([])
    var remaining = args.length
    function res(i, val) {
      try {
        if (val && (typeof val === 'object' || typeof val === 'function')) {
          var then = val.then
          if (typeof then === 'function') {
            then.call(val, function (val) { res(i, val) }, reject)
            return
          }
        }
        args[i] = val
        if (--remaining === 0) {
          resolve(args);
        }
      } catch (ex) {
        reject(ex)
      }
    }
    for (var i = 0; i < args.length; i++) {
      res(i, args[i])
    }
  })
}

Promise.reject = function (value) {
  return new Promise(function (resolve, reject) { 
    reject(value);
  });
}

Promise.race = function (values) {
  return new Promise(function (resolve, reject) { 
    values.forEach(function(value){
      Promise.resolve(value).then(resolve, reject);
    })
  });
}

/* Prototype Methods */

Promise.prototype['catch'] = function (onRejected) {
  return this.then(null, onRejected);
}

},{"./core.js":55,"asap":59}],58:[function(require,module,exports){
'use strict';

//This file contains then/promise specific extensions that are only useful for node.js interop

var Promise = require('./core.js')
var asap = require('asap')

module.exports = Promise

/* Static Functions */

Promise.denodeify = function (fn, argumentCount) {
  argumentCount = argumentCount || Infinity
  return function () {
    var self = this
    var args = Array.prototype.slice.call(arguments)
    return new Promise(function (resolve, reject) {
      while (args.length && args.length > argumentCount) {
        args.pop()
      }
      args.push(function (err, res) {
        if (err) reject(err)
        else resolve(res)
      })
      fn.apply(self, args)
    })
  }
}
Promise.nodeify = function (fn) {
  return function () {
    var args = Array.prototype.slice.call(arguments)
    var callback = typeof args[args.length - 1] === 'function' ? args.pop() : null
    var ctx = this
    try {
      return fn.apply(this, arguments).nodeify(callback, ctx)
    } catch (ex) {
      if (callback === null || typeof callback == 'undefined') {
        return new Promise(function (resolve, reject) { reject(ex) })
      } else {
        asap(function () {
          callback.call(ctx, ex)
        })
      }
    }
  }
}

Promise.prototype.nodeify = function (callback, ctx) {
  if (typeof callback != 'function') return this

  this.then(function (value) {
    asap(function () {
      callback.call(ctx, null, value)
    })
  }, function (err) {
    asap(function () {
      callback.call(ctx, err)
    })
  })
}

},{"./core.js":55,"asap":59}],59:[function(require,module,exports){
(function (process){

// Use the fastest possible means to execute a task in a future turn
// of the event loop.

// linked list of tasks (single, with head node)
var head = {task: void 0, next: null};
var tail = head;
var flushing = false;
var requestFlush = void 0;
var isNodeJS = false;

function flush() {
    /* jshint loopfunc: true */

    while (head.next) {
        head = head.next;
        var task = head.task;
        head.task = void 0;
        var domain = head.domain;

        if (domain) {
            head.domain = void 0;
            domain.enter();
        }

        try {
            task();

        } catch (e) {
            if (isNodeJS) {
                // In node, uncaught exceptions are considered fatal errors.
                // Re-throw them synchronously to interrupt flushing!

                // Ensure continuation if the uncaught exception is suppressed
                // listening "uncaughtException" events (as domains does).
                // Continue in next event to avoid tick recursion.
                if (domain) {
                    domain.exit();
                }
                setTimeout(flush, 0);
                if (domain) {
                    domain.enter();
                }

                throw e;

            } else {
                // In browsers, uncaught exceptions are not fatal.
                // Re-throw them asynchronously to avoid slow-downs.
                setTimeout(function() {
                   throw e;
                }, 0);
            }
        }

        if (domain) {
            domain.exit();
        }
    }

    flushing = false;
}

if (typeof process !== "undefined" && process.nextTick) {
    // Node.js before 0.9. Note that some fake-Node environments, like the
    // Mocha test runner, introduce a `process` global without a `nextTick`.
    isNodeJS = true;

    requestFlush = function () {
        process.nextTick(flush);
    };

} else if (typeof setImmediate === "function") {
    // In IE10, Node.js 0.9+, or https://github.com/NobleJS/setImmediate
    if (typeof window !== "undefined") {
        requestFlush = setImmediate.bind(window, flush);
    } else {
        requestFlush = function () {
            setImmediate(flush);
        };
    }

} else if (typeof MessageChannel !== "undefined") {
    // modern browsers
    // http://www.nonblocking.io/2011/06/windownexttick.html
    var channel = new MessageChannel();
    channel.port1.onmessage = flush;
    requestFlush = function () {
        channel.port2.postMessage(0);
    };

} else {
    // old browsers
    requestFlush = function () {
        setTimeout(flush, 0);
    };
}

function asap(task) {
    tail = tail.next = {
        task: task,
        domain: isNodeJS && process.domain,
        next: null
    };

    if (!flushing) {
        flushing = true;
        requestFlush();
    }
};

module.exports = asap;


}).call(this,require('_process'))
},{"_process":49}]},{},[1]);

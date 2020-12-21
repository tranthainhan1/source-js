(function () {
    //const appUrl = `https://arena-wishlist.ngrok.io`;
    const appUrl = `https://wishlist.arenacommerce.com`;
    const loadScript = function (url, callback) {
        var script = document.createElement("script");
        script.type = "text/javascript";

        if (script.readyState) {
            //IE 
            script.onreadystatechange = function () {
                if (script.readyState == "loaded" || script.readyState == "complete") {
                    script.onreadystatechange = null;
                    callback();
                }
            };
        } else {
            //Others
            script.onload = function () {
                callback();
            };
        }

        script.src = url;
        document.getElementsByTagName("head")[0].appendChild(script);
    };

    const watcher = function (Wishlist, Compare) {
        let requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame ||
            window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;
        var start = window.mozAnimationStartTime;
        var myReq;

        function step(timestamp) {
            if (start === null || typeof start == 'undefined') start = timestamp;
            var progress = timestamp - start;
            Wishlist.watcher();
            Compare.watcher();
            requestAnimationFrame(step);
        }
        requestAnimationFrame(step);
    }

    window.Arena__WishListJS = function () {
        const settings = arn_wl_cp_settings.wishlist_settings;
        const addClass = '.' + settings.wishlist_add_class;
        const showClass = '.' + settings.wishlist_show_class;
        const deleteClass = '.' + settings.wishlist_remove_class;
        const enable = settings.wishlist_enable;
        const proxy = !arn_wl_cp_settings.general_settings.app_wishlist_page;
        const originShop = Shopify.shop;
        const customShop = JSON.parse(document.querySelector('#shopify-features').textContent)['domain'];
        let clientUrl1 = 'nautilus-puzzles.myshopify.com';
        let clientCustomUrl1 = 'nautiluspuzzles.com';

        let maxAllow;
        if (originShop !== clientUrl1 || customShop !== clientCustomUrl1) {
            maxAllow = settings.wishlist_product_number > 20 ? 20 : settings.wishlist_product_number;
        } else {
            maxAllow = settings.wishlist_product_number > 100 ? 100 : settings.wishlist_product_number;
        }

        maxAllow = maxAllow < 2 ? 2 : maxAllow;

        let customerWishlist = [],
            cacheList = [];
        let requestCount = 0;
        return {
            init: function () {
                this.loadWishList();
                this.handleEvent();
                return this;
            },

            watcher: function () {
                if (customerWishlist.length) {
                    this.updateIcon();
                }
            },

            /**
             * Update add to wishlist button state
             */
            updateIcon: function () {

                document.querySelectorAll(addClass).forEach((item, index) => {
                    const handle = item.getAttribute('data-handle');
                    if (customerWishlist.indexOf(handle) !== -1) {
                        item.classList.add('arn_added');
                    } else {
                        item.classList.remove('arn_added');
                    }
                })
            },

            /**
             * Update Wishlist amount icon
             */
            updateAmount: function () {
                if (document.querySelectorAll(showClass)) {
                    document.querySelectorAll(showClass).forEach((item, index) => {
                        if (item.querySelector('.number')) {
                            item.querySelector('.number').innerHTML = (`
                            <span class="n-item">${customerWishlist.length}</span>
                        `);
                        }
                    })
                }
            },
            postData: async function (url = '', data = {}) {
                // Default options are marked with *
                const response = await fetch(url, {
                    method: 'POST', // *GET, POST, PUT, DELETE, etc.
                    body: JSON.stringify(data),
                    headers: { "Content-Type": "application/json" }
                });
                return response.json();
            },
            /**
             * Load customer wishlist at page loaded
             */
            loadWishList: function () {
                const _this = this;

                if (!customerLogged || !enable) {
                    return false;
                }

                /* Load User Wishlist Tags */
                if (customerLogged) {
                    // Add loading class to Body
                    document.getElementsByTagName("body")[0].classList.add("arn_wl_pending");
                    /* Add Loading to all adding button */
                    if (document.querySelectorAll(addClass)) {
                        document.querySelectorAll(addClass).forEach((item, index) => {
                            item.classList.add('arn_pending');
                        })
                    }
                    /* Add loading class to showing button */
                    if (document.querySelector(showClass)) {
                        document.querySelector(showClass).classList.add('arn_pending');
                    }

                    /* Fetch API */
                    this.postData(`${appUrl}/apps/get-wishlist?shop=${Shopify.shop}`, { customerId: customerLogged })
                        .then((resObj) => {
                            if (resObj.status != 'error') {
                                customerWishlist = resObj.customer_wishlist;

                                if (customerWishlist.length && customerWishlist.length > maxAllow) {
                                    customerWishlist = customerWishlist.slice(0, maxAllow);
                                }

                                _this.updateIcon();
                                _this.updateAmount();

                                // Check if on wishlist page
                                if (document.querySelector('.wishlist-table')) {
                                    document.querySelector('.wishlist-table').classList.remove('arn_pending');
                                }
                            } else {
                                throw new Error(settings.notify_getlist_error)
                            }
                        })
                        .then(() => {
                            document.getElementsByTagName("body")[0].classList.remove("arn_wl_pending");
                            /* Remove Loading to all adding button */
                            if (document.querySelectorAll(addClass)) {
                                document.querySelectorAll(addClass).forEach((item, index) => {
                                    item.classList.remove('arn_pending');
                                })
                            }
                            /* Remove loading class to showing button */
                            if (document.querySelector(showClass)) {
                                document.querySelector(showClass).classList.remove('arn_pending');
                            }
                        })
                        .catch((error) => {
                            alert(error.message);
                        });
                }
            },

            /**
             * Add handle event to wishlist buttons
             */
            handleEvent() {
                const _this = this;
                var getClosest = function (elem, selector) {
                    for (; elem && elem !== document; elem = elem.parentNode) {
                        if (elem.matches(selector)) return elem;
                    }
                    return null;
                };
                if (document.querySelectorAll(addClass)) {
                    document.body.addEventListener('click', function (event) {
                        if (event.target) {
                            var parent = getClosest(event.target, addClass);
                            if (parent) {
                                _this.addToList(parent);
                            }
                        }

                    }, false);
                }

                if (document.querySelectorAll(deleteClass)) {
                    document.querySelectorAll(deleteClass).forEach((item, index) => {
                        item.addEventListener('click', (e) => {
                            e.preventDefault();
                            _this.removeFromList(e.currentTarget);
                        })
                    })
                }
                if (document.querySelectorAll(showClass)) {
                    document.querySelectorAll(showClass).forEach((item, index) => {
                        if (item) {
                            item.addEventListener('click', (e) => {
                                e.preventDefault();
                                _this.showLayout();
                            })
                        }
                    })
                }
            },

            /**
             * Remove item from wishlist
             */
            removeFromList(target) {
                const _this = this;
                // Add loading class
                target.classList.add('arn_pending')
                // Remove product handle from list
                const prodHandle = target.getAttribute('data-handle');
                const callback = target.getAttribute('data-callback');
                const rowItem = target.parentNode.parentNode;

                const handleIndex = customerWishlist.indexOf(prodHandle);

                if (handleIndex !== -1) {
                    customerWishlist.splice(handleIndex, 1);
                    requestCount += 1;
                    let resultObj = {
                        handle: prodHandle,
                        domItem: rowItem,
                        result: null,
                    }
                    cacheList.push(resultObj);
                    _this.postData(`${appUrl}/apps/update-wishlist?shop=${Shopify.shop}`, {
                        customerId: customerLogged,
                        customer_wishlist: customerWishlist
                    }).then((resObj) => {
                        // record result
                        resultObj.result = true;
                        resultObj.domItem.remove();

                        _this.updateAmount();
                    }).then(() => {
                        if (typeof callback === 'object') {
                            window.location.reload();
                        } else {
                            window[callback]();
                        }
                    }).catch((err) => {
                        target.classList.remove('arn_pending');
                        // record result
                        resultObj.result = false;
                    })
                }
            },

            /**
             * Extra remove from wishlist function
             */
            exRemoveFromList(callback) {
                _this.postData(`${appUrl}/apps/update-wishlist?shop=${Shopify.shop}`, {
                    customerId: customerLogged,
                    customer_wishlist: customerWishlist,
                }).then((resObj) => {
                    _this.updateAmount();
                }).then(() => {
                    if (typeof callback === 'object') {
                        window.location.reload();
                    } else {
                        window[callback]();
                    }
                }).catch((err) => {
                    console.log(err);
                })
            },

            /**
             * Add product to wishlist
             */
            addToList(target) {
                const _this = this;
                const prodHandle = target.getAttribute('data-handle').trim();
                const callback = target.getAttribute('data-callback');
                const loginFlag = this.checkLogin();

                // User hasn't logged in yet
                if (!loginFlag) {
                    alert(settings.notify_login);
                    return false;
                }

                // Product has already been added to wishlist
                if (customerWishlist.indexOf(prodHandle) !== -1) {
                    //alert(`This product has already been added to wishlist`)
                    return false;
                }

                if (customerWishlist.length === maxAllow) {
                    alert(`${settings.notify_limit.replace('{limit}', maxAllow)}`);
                    return false;
                }

                // Add loading class

                target.classList.add('arn_pending');
                customerWishlist.push(prodHandle);
                requestCount += 1;
                let resultObj = {
                    handle: prodHandle,
                    result: null,
                }
                cacheList.push(resultObj);

                // Create user wishlist item
                _this.postData(`${appUrl}/apps/update-wishlist?shop=${Shopify.shop}`, {
                    customerId: customerLogged,
                    customer_wishlist: customerWishlist,
                }).then((resObj) => {
                    // add added class
                    target.classList.add('arn_added')
                    // update amount item on wishlist status
                    _this.updateAmount();
                    // record result
                    resultObj.result = true;
                }).then(() => {
                    // finally remove loading class
                    target.classList.remove('arn_pending');
                    // reduce number of request tracking
                    requestCount -= 1;

                    if (!requestCount) {
                        let failList = cacheList.filter(cache => cache.result === false);
                        cacheList = [];
                        if (failList.length) {
                            failList.map(failItem => {
                                customerWishlist = customerWishlist.filter(item => item !== failItem.handle);
                            });
                            _this.exAddToWishlist(callback);
                        } else {
                            if (typeof callback !== 'object') {
                                window[callback]('add');
                            }
                        }
                    }
                }).catch((err) => {
                    // record result
                    resultObj.result = false;
                })
            },

            /**
             * Extra add to wishlist
             */
            exAddToWishlist(callback) {
                _this.postData(`${appUrl}/apps/update-wishlist?shop=${Shopify.shop}`, {
                    customerId: customerLogged,
                    customer_wishlist: customerWishlist,
                }).then((resObj) => {
                    // update amount item on wishlist status
                    _this.updateAmount();
                    if (typeof callback !== 'object') {
                        window[callback]('add');
                    }
                }).catch((err) => {
                    console.log(err);
                })
            },

            /**
             * Function to redirect user to Wishlist page
             */
            showLayout() {
                if (proxy)
                    window.location.href = `/apps/wishlist?id=${customerLogged}`;
                else
                    window.location.href = `/pages/arena-wishlist-page`;
            },

            /**
             * Function to check whether user logged in or not
             */
            checkLogin() {
                return (customerLogged != '') ? true : false;
            }
        };
    };

    window.Arena__CompareJS = function () {
        const settings = arn_wl_cp_settings.compare_settings;
        const addClass = '.' + settings.compare_add_class;
        const showClass = '.' + settings.compare_show_class;
        const deleteClass = '.' + settings.compare_remove_class;
        const compareOptions = settings.compare_options;
        const enable = settings.compare_enable;
        let maxAllow = settings.compare_product_number > 4 ? 4 : settings.compare_product_number;
        maxAllow = maxAllow < 2 ? 2 : maxAllow;
        const layoutType = settings.compare_layout[0]; // "page"
        let compareList = [],
            cacheList = [];
        let style, tag;
        if (layoutType === 'popup') {
            style = document.createElement('style');
            tag = document.createElement('div');
            let myCoolCode = document.createElement("script");
            myCoolCode.setAttribute(
                "src",
                "https://kanecohen.github.io/modal-vanilla/js/modal.min.js"
            );
            document.body.appendChild(myCoolCode);
        }

        return {
            init: function () {
                this.loadCompare();
                this.handleEvent();
                return this;
            },

            watcher: function () {
                if (compareList.length) {
                    this.updateIcon();
                }
            },

            /**
             * Load compare list at page loaded
             */
            loadCompare: function () {
                if (!enable) {
                    return false;
                }
                const _this = this;
                let compareListStr = sessionStorage.getItem('arn_compare_list');

                if (compareListStr) {
                    compareList = compareListStr.split(",");
                    /* Add Loading to all button */
                    if (document.querySelectorAll(addClass)) {
                        document.querySelectorAll(addClass).forEach((item, index) => {
                            item.classList.add('arn_pending');
                        })
                    }
                    compareList = compareListStr.split(',');
                    if (document.querySelectorAll(addClass)) {
                        document.querySelectorAll(addClass).forEach((item, index) => {
                            item.classList.remove('arn_pending');
                        })
                    }
                    if (compareList.length) {
                        if (compareList.length > maxAllow) {
                            compareList = compareList.slice(0, maxAllow);
                        }
                        _this.updateIcon();
                        _this.updateAmount();

                        // Check if on compare page
                        if (document.querySelector('.compare-table')) {
                            _this.loadLayout(layoutType);
                        }
                    }
                } else {
                    if (document.querySelectorAll(addClass)) {
                        document.querySelectorAll(addClass).forEach((item, index) => {
                            item.classList.remove('arn_pending');
                        })
                    }
                    _this.updateAmount();
                }

            },

            /**
             * Update add to compare button state
             */
            updateIcon() {
                document.querySelectorAll(addClass).forEach((item, index) => {
                    const handle = item.getAttribute('data-handle');
                    if (compareList.indexOf(handle) !== -1) {
                        item.classList.add('arn_added');
                    } else {
                        item.classList.remove('arn_added');
                    }
                })

            },

            /**
             * Add handle event to compare buttons
             */
            handleEvent: function () {
                const _this = this;
                var getClosest = function (elem, selector) {
                    for (; elem && elem !== document; elem = elem.parentNode) {
                        if (elem.matches(selector)) return elem;
                    }
                    return null;
                };
                if (document.querySelectorAll(addClass)) {
                    document.body.addEventListener('click', function (event) {
                        if (event.target) {
                            var parent = getClosest(event.target, addClass);
                            if (parent) {
                                _this.addToList(parent);
                            }
                        }

                    }, false);
                }

                if (document.querySelectorAll(deleteClass)) {
                    document.querySelectorAll(deleteClass).forEach((item, index) => {
                        item.addEventListener('click', (e) => {
                            e.preventDefault();
                            _this.removeFromList(e.currentTarget);
                        })
                    })
                }
                if (document.querySelectorAll(showClass)) {
                    document.querySelectorAll(showClass).forEach((item, index) => {
                        if (item) {
                            item.addEventListener('click', (e) => {
                                e.preventDefault();
                                _this.showLayout();
                            })
                        }
                    })
                }
            },

            /**
             * Remove item from compare
             */
            removeFromList(target) {

                const _this = this;
                // Add loading class
                target.classList.add('arn_pending');
                const prodHandle = target.getAttribute('data-handle');
                const handleIndex = compareList.indexOf(prodHandle);

                let parentClasses = target.parentNode.parentNode.getAttribute('class');
                let parentClass = parentClasses.match(/product-[0-9]+/gm);

                if (parentClass) {
                    compareList.splice(handleIndex, 1);
                    sessionStorage.setItem('arn_compare_list', compareList);
                    if (document.querySelectorAll('.product_comparison_template tr')) {
                        document.querySelectorAll('.product_comparison_template tr').forEach((item, index) => {
                            if (item.querySelector(`.${parentClass[0]}`))
                                item.querySelector(`.${parentClass[0]}`).remove();
                        })
                    }

                    _this.updateIcon();
                    _this.updateAmount();

                    if (!compareList.length && layoutType === 'popup') {
                        document.querySelector('#modal').remove();
                        if (document.querySelector('.modal-backdrop')) {
                            document.querySelector('.modal-backdrop').remove();

                        }
                        document.body.classList.remove('modal-open');
                    }
                }
            },
            /**
             * Add product to compare
             */
            addToList(target) {
                const _this = this;
                const prodHandle = target.getAttribute('data-handle').trim();

                // Product has already been arn_added to compare
                if (compareList.indexOf(prodHandle) !== -1) {
                    //alert(`This product has already been arn_added to compare`)
                    return false;
                }

                if (compareList.length === maxAllow) {
                    alert(`${settings.notify_limit.replace('{limit}', maxAllow)}`);
                    return false;
                }

                // Add loading class
                target.classList.add('arn_pending');
                compareList.push(prodHandle);

                sessionStorage.setItem('arn_compare_list', compareList);

                target.classList.remove('arn_pending');
                target.classList.add('arn_added');
                _this.updateAmount();
            },

            /**
             * Update Compare amount icon
             */
            updateAmount() {
                if (document.querySelectorAll(showClass)) {
                    document.querySelectorAll(showClass).forEach((item, index) => {
                        if (item.querySelector('.number')) {
                            item.querySelector('.number').innerHTML = (`
                            <span class="n-item">${compareList.length}</span>
                        `);
                        }
                    })
                }

                // Case no wishlist item
                if (document.querySelector('.page-arn-compare')) {
                    if (!compareList.length) {
                        document.querySelector('.compare-table').style.display = 'none'
                        document.querySelector('.page-arn-compare .no-compare-msg').style.display = 'block'
                    } else {
                        if (document.querySelector('.page-compare .no-compare-msg')) {
                            document.querySelector('.page-compare .no-compare-msg').style.display = 'none'
                        }
                        document.querySelector('.compare-table').style.display = 'block'
                    }
                }
            },

            //== Function to load compare layout
            loadLayout(type) {
                let prodData = [];
                let countDown = compareList.length;
                const _this = this;
                // Add loading class to Body
                document.getElementsByTagName("body")[0].classList.add("arn_cp_pending");
                // Add loading class to showing button
                if (document.querySelector(showClass)) {
                    document.querySelector(showClass).classList.add('arn_pending');
                }
                compareList.map((prod, index) => {
                    fetch(`/products/${prod}?view=compare`, {
                        method: 'GET',
                    }).then(data => data.json())
                        .then((data) => {
                            const prod = data;
                            prodData.push(prod);
                            countDown--;
                            if (!countDown) {
                                let showOptions = {};
                                compareOptions.map(optionKey => {
                                    showOptions[`show_${optionKey}`] = true;
                                })
                                // send prodData to server  
                                let fd = new FormData();
                                fd.append('prodlist', JSON.stringify(prodData));
                                fd.append('compare_translate', JSON.stringify({
                                    t_column: `cols_${compareList.length}`,
                                    t_remove_class: settings.compare_remove_class,
                                    t_remove_width: settings.remove_class_icon.width,
                                    t_remove_height: settings.remove_class_icon.height,
                                    t_features_title: settings.table_feature_heading,
                                    t_availability_title: settings.table_availability_heading,
                                    t_instock: settings.table_instock,
                                    t_outstock: settings.table_outstock,
                                    t_view_detail: settings.table_view_btn,
                                    t_option_title: settings.table_option_heading,
                                    t_vendor_title: settings.table_vendor_heading,
                                    t_collection_title: settings.table_collection_heading,
                                    t_rating_title: settings.table_review_heading,
                                }));
                                fd.append('compare_showing_options', JSON.stringify(showOptions));
                                fetch(`${appUrl}/apps/get-compare-layout?shop=${Shopify.shop}&themeId=${Shopify.theme.id}`, {
                                    method: 'POST',
                                    body: fd,
                                }).then(data => data.json())
                                    .then((data) => {
                                        if (data.status != 'error') {
                                            if (type === 'popup') {
                                                style.innerHTML = `.fade:not(.show){opacity:1}.modal-open{overflow:hidden}.modal{opacity: 1; position:fixed;top:0;right:0;bottom:0;left:0;z-index:1050;display:none;overflow:hidden;-webkit-overflow-scrolling:touch;outline:0}.modal.fade .modal-dialog{-webkit-transition:-webkit-transform .3s ease-out;-o-transition:-o-transform .3s ease-out;transition:transform .3s ease-out;}.modal.in .modal-dialog{-webkit-transform:translate(0,0);-ms-transform:translate(0,0);-o-transform:translate(0,0);transform:translate(0,0)}.modal-open .modal{overflow-x:hidden;overflow-y:auto}.modal-dialog{position:relative;width:auto;margin:10px}.modal-content{display:flex; position:relative;background-color:#fff;-webkit-background-clip:padding-box;background-clip:padding-box;border:1px solid #999;border:1px solid rgba(0,0,0,.2);border-radius:6px;outline:0;-webkit-box-shadow:0 3px 9px rgba(0,0,0,.5);box-shadow:0 3px 9px rgba(0,0,0,.5)}.modal-backdrop{position:fixed;top:0;right:0;bottom:0;left:0;z-index:1040;background-color:#000}.modal-backdrop.fade{filter:alpha(opacity=0);opacity:0}.modal-backdrop.in{filter:alpha(opacity=50);opacity:.5}.modal-header{padding:15px;border-bottom:1px solid #e5e5e5}.modal-header .close{margin-top:-2px}.modal-title{margin:0;line-height:1.42857143}.modal-body{position:relative;padding:15px}.modal-footer{padding:15px;text-align:right;border-top:1px solid #e5e5e5}.modal-footer .btn+.btn{margin-bottom:0;margin-left:5px}.modal-footer .btn-group .btn+.btn{margin-left:-1px}.modal-footer .btn-block+.btn-block{margin-left:0}.modal-scrollbar-measure{position:absolute;top:-9999px;width:50px;height:50px;overflow:scroll}@media (min-width:768px){.modal-dialog{width:100%;margin:30px auto}.modal-content{-webkit-box-shadow:0 5px 15px rgba(0,0,0,.5);box-shadow:0 5px 15px rgba(0,0,0,.5)}.modal-sm{width:300px}}@media (min-width:992px){.modal-lg{width:900px}}`;
                                                let showModal = `<div id="modal" class="modal fade arn-compare-md" tabindex="-1" role="dialog" aria-labelledby="myLargeModalLabel" aria-hidden="true">
                                                                         <div class="modal-dialog modal-md">
                                                                          <div class="modal-content">
                                                                                ${data.resp}
                                                                          </div>
                                                                       </div>
                                                                </div>
                                                               `;
                                                tag.innerHTML = showModal;
                                                document.body.appendChild(tag);
                                                document.body.appendChild(style);
                                                var modal = new Modal({
                                                    el: document.getElementById('modal'),
                                                });
                                                modal.show();

                                                if (document.querySelectorAll(deleteClass)) {
                                                    document.querySelectorAll(deleteClass).forEach((item, index) => {
                                                        item.addEventListener('click', (e) => {
                                                            e.preventDefault();
                                                            _this.removeFromList(e.currentTarget);
                                                        })
                                                    })
                                                }
                                            } else {
                                                document.querySelector('.compare-table').innerHTML = data.resp;
                                                _this.handleEvent();
                                            }
                                        } else {
                                            alert(settings.notify_getlist_error);
                                        }
                                    }).then(() => {
                                        document.getElementsByTagName("body")[0].classList.remove("arn_cp_pending");
                                        if (document.querySelector(showClass)) {
                                            document.querySelector(showClass).classList.remove('arn_pending');
                                        }
                                    }).catch((err) => {
                                        console.log(err);
                                    })
                            }
                        }).catch((err) => {
                            console.log(err);
                            document.getElementsByTagName("body")[0].classList.remove("arn_cp_pending");
                            if (document.querySelector(showClass)) {
                                document.querySelector(showClass).classList.remove('arn_pending');
                            }
                        })
                })

            },

            //== Function to show compare layout
            showLayout: function () {
                const _this = this;
                if (compareList.length == 0) {
                    alert(settings.notify_empty_product);
                    return false;
                }
                if (layoutType === 'popup') {
                    // If type is popup call load layout
                    _this.loadLayout(layoutType)
                } else {
                    // Redirect to compare page
                    window.location.href = '/pages/arena-compare-page';
                }
            },
        }
    };
    if (window) {
        let wishList = Arena__WishListJS().init();
        let compare = Arena__CompareJS().init();
        watcher(wishList, compare);
    }
})();
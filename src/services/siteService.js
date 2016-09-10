﻿function SiteService(cryptoService, userService, apiService) {
    this.cryptoService = cryptoService;
    this.userService = userService;
    this.apiService = apiService;

    initSiteService();
};

function initSiteService() {
    SiteService.prototype.get = function (id, callback) {
        if (!callback || typeof callback !== 'function') {
            throw 'callback function required';
        }

        this.userService.getUserId(function (userId) {
            var sitesKey = 'sites_' + userId;

            chrome.storage.local.get(sitesKey, function (obj) {
                var sites = obj[sitesKey];
                if (id in sites) {
                    callback(new Site(sites[id]));
                    return;
                }

                callback(null);
            });
        });
    };

    SiteService.prototype.getAll = function (callback) {
        if (!callback || typeof callback !== 'function') {
            throw 'callback function required';
        }

        this.userService.getUserId(function (userId) {
            var sitesKey = 'sites_' + userId;

            chrome.storage.local.get(sitesKey, function (obj) {
                var sites = obj[sitesKey];
                var response = [];
                for (var id in sites) {
                    if (!id) {
                        continue;
                    }

                    response.push(new Site(sites[id]));
                }

                callback(response);
            });
        });
    };

    SiteService.prototype.saveWithServer = function (site, successCallback, errorCallback) {
        var self = this,
            request = new SiteRequest(site);

        if (!site.id) {
            self.apiService.postSite(request, apiSuccess, function (response) {
                handleError(response, errorCallback)
            });
        }
        else {
            self.apiService.putSite(site.id, request, apiSuccess, function (response) {
                handleError(response, errorCallback)
            });
        }

        function apiSuccess(response) {
            site.id = response.id;
            userService.getUserId(function (userId) {
                var data = new SiteData(response, userId);
                self.upsert(data, function () {
                    if (successCallback) {
                        successCallback(site);
                    }
                });
            });
        }
    };

    SiteService.prototype.upsert = function (site, callback) {
        if (!callback || typeof callback !== 'function') {
            throw 'callback function required';
        }

        userService.getUserId(function (userId) {
            var sitesKey = 'sites_' + userId;

            chrome.storage.local.get(sitesKey, function (obj) {
                var sites = obj[sitesKey];
                if (!sites) {
                    sites = {};
                }

                if (site.constructor === Array) {
                    for (var i = 0; i < site.length; i++) {
                        sites[site[i].id] = site[i];
                    }
                }
                else {
                    sites[site.id] = site;
                }

                obj[sitesKey] = sites;

                chrome.storage.local.set(obj, function () {
                    callback();
                });
            });
        });
    };

    SiteService.prototype.replace = function (sites, callback) {
        if (!callback || typeof callback !== 'function') {
            throw 'callback function required';
        }

        userService.getUserId(function (userId) {
            var obj = {};
            obj['sites_' + userId] = sites;
            chrome.storage.local.set(obj, function () {
                callback();
            });
        });
    };

    SiteService.prototype.delete = function (id, callback) {
        if (!callback || typeof callback !== 'function') {
            throw 'callback function required';
        }

        userService.getUserId(function (userId) {
            var sitesKey = 'sites_' + userId;

            chrome.storage.local.get(sitesKey, function (obj) {
                var sites = obj[sitesKey];
                if (!sites) {
                    callback();
                    return;
                }

                if (id.constructor === Array) {
                    for (var i = 0; i < id.length; i++) {
                        if (id[i] in sites) {
                            delete sites[id[i]];
                        }
                    }
                }
                else if (id in sites) {
                    delete sites[id];
                }
                else {
                    callback();
                    return;
                }

                obj[sitesKey] = sites;
                chrome.storage.local.set(obj, function () {
                    callback();
                });
            });
        });
    };

    SiteService.prototype.deleteWithServer = function (id, successCallback, errorCallback) {
        if (!callback || typeof callback !== 'function') {
            throw 'callback function required';
        }

        var self = this;
        self.apiService.deleteCipher(id, function (response) {
            self.delete(id, successCallback);
        }, function (response) {
            handleError(response, errorCallback)
        });
    };

    function handleError(error, callback) {
        if (error.status == 401 || error.status == 403) {
            // TODO: logout

        }

        if (callback) {
            callback(error);
        }
    }
};

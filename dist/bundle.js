/******/ (function(modules) { // webpackBootstrap
/******/ 	function hotDisposeChunk(chunkId) {
/******/ 		delete installedChunks[chunkId];
/******/ 	}
/******/ 	var parentHotUpdateCallback = this["webpackHotUpdate"];
/******/ 	this["webpackHotUpdate"] = 
/******/ 	function webpackHotUpdateCallback(chunkId, moreModules) { // eslint-disable-line no-unused-vars
/******/ 		hotAddUpdateChunk(chunkId, moreModules);
/******/ 		if(parentHotUpdateCallback) parentHotUpdateCallback(chunkId, moreModules);
/******/ 	} ;
/******/ 	
/******/ 	function hotDownloadUpdateChunk(chunkId) { // eslint-disable-line no-unused-vars
/******/ 		var head = document.getElementsByTagName("head")[0];
/******/ 		var script = document.createElement("script");
/******/ 		script.type = "text/javascript";
/******/ 		script.charset = "utf-8";
/******/ 		script.src = __webpack_require__.p + "" + chunkId + "." + hotCurrentHash + ".hot-update.js";
/******/ 		head.appendChild(script);
/******/ 	}
/******/ 	
/******/ 	function hotDownloadManifest() { // eslint-disable-line no-unused-vars
/******/ 		return new Promise(function(resolve, reject) {
/******/ 			if(typeof XMLHttpRequest === "undefined")
/******/ 				return reject(new Error("No browser support"));
/******/ 			try {
/******/ 				var request = new XMLHttpRequest();
/******/ 				var requestPath = __webpack_require__.p + "" + hotCurrentHash + ".hot-update.json";
/******/ 				request.open("GET", requestPath, true);
/******/ 				request.timeout = 10000;
/******/ 				request.send(null);
/******/ 			} catch(err) {
/******/ 				return reject(err);
/******/ 			}
/******/ 			request.onreadystatechange = function() {
/******/ 				if(request.readyState !== 4) return;
/******/ 				if(request.status === 0) {
/******/ 					// timeout
/******/ 					reject(new Error("Manifest request to " + requestPath + " timed out."));
/******/ 				} else if(request.status === 404) {
/******/ 					// no update available
/******/ 					resolve();
/******/ 				} else if(request.status !== 200 && request.status !== 304) {
/******/ 					// other failure
/******/ 					reject(new Error("Manifest request to " + requestPath + " failed."));
/******/ 				} else {
/******/ 					// success
/******/ 					try {
/******/ 						var update = JSON.parse(request.responseText);
/******/ 					} catch(e) {
/******/ 						reject(e);
/******/ 						return;
/******/ 					}
/******/ 					resolve(update);
/******/ 				}
/******/ 			};
/******/ 		});
/******/ 	}
/******/
/******/ 	
/******/ 	
/******/ 	var hotApplyOnUpdate = true;
/******/ 	var hotCurrentHash = "76aad8e62a752da74f77"; // eslint-disable-line no-unused-vars
/******/ 	var hotCurrentModuleData = {};
/******/ 	var hotCurrentChildModule; // eslint-disable-line no-unused-vars
/******/ 	var hotCurrentParents = []; // eslint-disable-line no-unused-vars
/******/ 	var hotCurrentParentsTemp = []; // eslint-disable-line no-unused-vars
/******/ 	
/******/ 	function hotCreateRequire(moduleId) { // eslint-disable-line no-unused-vars
/******/ 		var me = installedModules[moduleId];
/******/ 		if(!me) return __webpack_require__;
/******/ 		var fn = function(request) {
/******/ 			if(me.hot.active) {
/******/ 				if(installedModules[request]) {
/******/ 					if(installedModules[request].parents.indexOf(moduleId) < 0)
/******/ 						installedModules[request].parents.push(moduleId);
/******/ 				} else {
/******/ 					hotCurrentParents = [moduleId];
/******/ 					hotCurrentChildModule = request;
/******/ 				}
/******/ 				if(me.children.indexOf(request) < 0)
/******/ 					me.children.push(request);
/******/ 			} else {
/******/ 				console.warn("[HMR] unexpected require(" + request + ") from disposed module " + moduleId);
/******/ 				hotCurrentParents = [];
/******/ 			}
/******/ 			return __webpack_require__(request);
/******/ 		};
/******/ 		var ObjectFactory = function ObjectFactory(name) {
/******/ 			return {
/******/ 				configurable: true,
/******/ 				enumerable: true,
/******/ 				get: function() {
/******/ 					return __webpack_require__[name];
/******/ 				},
/******/ 				set: function(value) {
/******/ 					__webpack_require__[name] = value;
/******/ 				}
/******/ 			};
/******/ 		};
/******/ 		for(var name in __webpack_require__) {
/******/ 			if(Object.prototype.hasOwnProperty.call(__webpack_require__, name) && name !== "e") {
/******/ 				Object.defineProperty(fn, name, ObjectFactory(name));
/******/ 			}
/******/ 		}
/******/ 		fn.e = function(chunkId) {
/******/ 			if(hotStatus === "ready")
/******/ 				hotSetStatus("prepare");
/******/ 			hotChunksLoading++;
/******/ 			return __webpack_require__.e(chunkId).then(finishChunkLoading, function(err) {
/******/ 				finishChunkLoading();
/******/ 				throw err;
/******/ 			});
/******/ 	
/******/ 			function finishChunkLoading() {
/******/ 				hotChunksLoading--;
/******/ 				if(hotStatus === "prepare") {
/******/ 					if(!hotWaitingFilesMap[chunkId]) {
/******/ 						hotEnsureUpdateChunk(chunkId);
/******/ 					}
/******/ 					if(hotChunksLoading === 0 && hotWaitingFiles === 0) {
/******/ 						hotUpdateDownloaded();
/******/ 					}
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 		return fn;
/******/ 	}
/******/ 	
/******/ 	function hotCreateModule(moduleId) { // eslint-disable-line no-unused-vars
/******/ 		var hot = {
/******/ 			// private stuff
/******/ 			_acceptedDependencies: {},
/******/ 			_declinedDependencies: {},
/******/ 			_selfAccepted: false,
/******/ 			_selfDeclined: false,
/******/ 			_disposeHandlers: [],
/******/ 			_main: hotCurrentChildModule !== moduleId,
/******/ 	
/******/ 			// Module API
/******/ 			active: true,
/******/ 			accept: function(dep, callback) {
/******/ 				if(typeof dep === "undefined")
/******/ 					hot._selfAccepted = true;
/******/ 				else if(typeof dep === "function")
/******/ 					hot._selfAccepted = dep;
/******/ 				else if(typeof dep === "object")
/******/ 					for(var i = 0; i < dep.length; i++)
/******/ 						hot._acceptedDependencies[dep[i]] = callback || function() {};
/******/ 				else
/******/ 					hot._acceptedDependencies[dep] = callback || function() {};
/******/ 			},
/******/ 			decline: function(dep) {
/******/ 				if(typeof dep === "undefined")
/******/ 					hot._selfDeclined = true;
/******/ 				else if(typeof dep === "object")
/******/ 					for(var i = 0; i < dep.length; i++)
/******/ 						hot._declinedDependencies[dep[i]] = true;
/******/ 				else
/******/ 					hot._declinedDependencies[dep] = true;
/******/ 			},
/******/ 			dispose: function(callback) {
/******/ 				hot._disposeHandlers.push(callback);
/******/ 			},
/******/ 			addDisposeHandler: function(callback) {
/******/ 				hot._disposeHandlers.push(callback);
/******/ 			},
/******/ 			removeDisposeHandler: function(callback) {
/******/ 				var idx = hot._disposeHandlers.indexOf(callback);
/******/ 				if(idx >= 0) hot._disposeHandlers.splice(idx, 1);
/******/ 			},
/******/ 	
/******/ 			// Management API
/******/ 			check: hotCheck,
/******/ 			apply: hotApply,
/******/ 			status: function(l) {
/******/ 				if(!l) return hotStatus;
/******/ 				hotStatusHandlers.push(l);
/******/ 			},
/******/ 			addStatusHandler: function(l) {
/******/ 				hotStatusHandlers.push(l);
/******/ 			},
/******/ 			removeStatusHandler: function(l) {
/******/ 				var idx = hotStatusHandlers.indexOf(l);
/******/ 				if(idx >= 0) hotStatusHandlers.splice(idx, 1);
/******/ 			},
/******/ 	
/******/ 			//inherit from previous dispose call
/******/ 			data: hotCurrentModuleData[moduleId]
/******/ 		};
/******/ 		hotCurrentChildModule = undefined;
/******/ 		return hot;
/******/ 	}
/******/ 	
/******/ 	var hotStatusHandlers = [];
/******/ 	var hotStatus = "idle";
/******/ 	
/******/ 	function hotSetStatus(newStatus) {
/******/ 		hotStatus = newStatus;
/******/ 		for(var i = 0; i < hotStatusHandlers.length; i++)
/******/ 			hotStatusHandlers[i].call(null, newStatus);
/******/ 	}
/******/ 	
/******/ 	// while downloading
/******/ 	var hotWaitingFiles = 0;
/******/ 	var hotChunksLoading = 0;
/******/ 	var hotWaitingFilesMap = {};
/******/ 	var hotRequestedFilesMap = {};
/******/ 	var hotAvailableFilesMap = {};
/******/ 	var hotDeferred;
/******/ 	
/******/ 	// The update info
/******/ 	var hotUpdate, hotUpdateNewHash;
/******/ 	
/******/ 	function toModuleId(id) {
/******/ 		var isNumber = (+id) + "" === id;
/******/ 		return isNumber ? +id : id;
/******/ 	}
/******/ 	
/******/ 	function hotCheck(apply) {
/******/ 		if(hotStatus !== "idle") throw new Error("check() is only allowed in idle status");
/******/ 		hotApplyOnUpdate = apply;
/******/ 		hotSetStatus("check");
/******/ 		return hotDownloadManifest().then(function(update) {
/******/ 			if(!update) {
/******/ 				hotSetStatus("idle");
/******/ 				return null;
/******/ 			}
/******/ 			hotRequestedFilesMap = {};
/******/ 			hotWaitingFilesMap = {};
/******/ 			hotAvailableFilesMap = update.c;
/******/ 			hotUpdateNewHash = update.h;
/******/ 	
/******/ 			hotSetStatus("prepare");
/******/ 			var promise = new Promise(function(resolve, reject) {
/******/ 				hotDeferred = {
/******/ 					resolve: resolve,
/******/ 					reject: reject
/******/ 				};
/******/ 			});
/******/ 			hotUpdate = {};
/******/ 			var chunkId = 0;
/******/ 			{ // eslint-disable-line no-lone-blocks
/******/ 				/*globals chunkId */
/******/ 				hotEnsureUpdateChunk(chunkId);
/******/ 			}
/******/ 			if(hotStatus === "prepare" && hotChunksLoading === 0 && hotWaitingFiles === 0) {
/******/ 				hotUpdateDownloaded();
/******/ 			}
/******/ 			return promise;
/******/ 		});
/******/ 	}
/******/ 	
/******/ 	function hotAddUpdateChunk(chunkId, moreModules) { // eslint-disable-line no-unused-vars
/******/ 		if(!hotAvailableFilesMap[chunkId] || !hotRequestedFilesMap[chunkId])
/******/ 			return;
/******/ 		hotRequestedFilesMap[chunkId] = false;
/******/ 		for(var moduleId in moreModules) {
/******/ 			if(Object.prototype.hasOwnProperty.call(moreModules, moduleId)) {
/******/ 				hotUpdate[moduleId] = moreModules[moduleId];
/******/ 			}
/******/ 		}
/******/ 		if(--hotWaitingFiles === 0 && hotChunksLoading === 0) {
/******/ 			hotUpdateDownloaded();
/******/ 		}
/******/ 	}
/******/ 	
/******/ 	function hotEnsureUpdateChunk(chunkId) {
/******/ 		if(!hotAvailableFilesMap[chunkId]) {
/******/ 			hotWaitingFilesMap[chunkId] = true;
/******/ 		} else {
/******/ 			hotRequestedFilesMap[chunkId] = true;
/******/ 			hotWaitingFiles++;
/******/ 			hotDownloadUpdateChunk(chunkId);
/******/ 		}
/******/ 	}
/******/ 	
/******/ 	function hotUpdateDownloaded() {
/******/ 		hotSetStatus("ready");
/******/ 		var deferred = hotDeferred;
/******/ 		hotDeferred = null;
/******/ 		if(!deferred) return;
/******/ 		if(hotApplyOnUpdate) {
/******/ 			hotApply(hotApplyOnUpdate).then(function(result) {
/******/ 				deferred.resolve(result);
/******/ 			}, function(err) {
/******/ 				deferred.reject(err);
/******/ 			});
/******/ 		} else {
/******/ 			var outdatedModules = [];
/******/ 			for(var id in hotUpdate) {
/******/ 				if(Object.prototype.hasOwnProperty.call(hotUpdate, id)) {
/******/ 					outdatedModules.push(toModuleId(id));
/******/ 				}
/******/ 			}
/******/ 			deferred.resolve(outdatedModules);
/******/ 		}
/******/ 	}
/******/ 	
/******/ 	function hotApply(options) {
/******/ 		if(hotStatus !== "ready") throw new Error("apply() is only allowed in ready status");
/******/ 		options = options || {};
/******/ 	
/******/ 		var cb;
/******/ 		var i;
/******/ 		var j;
/******/ 		var module;
/******/ 		var moduleId;
/******/ 	
/******/ 		function getAffectedStuff(updateModuleId) {
/******/ 			var outdatedModules = [updateModuleId];
/******/ 			var outdatedDependencies = {};
/******/ 	
/******/ 			var queue = outdatedModules.slice().map(function(id) {
/******/ 				return {
/******/ 					chain: [id],
/******/ 					id: id
/******/ 				};
/******/ 			});
/******/ 			while(queue.length > 0) {
/******/ 				var queueItem = queue.pop();
/******/ 				var moduleId = queueItem.id;
/******/ 				var chain = queueItem.chain;
/******/ 				module = installedModules[moduleId];
/******/ 				if(!module || module.hot._selfAccepted)
/******/ 					continue;
/******/ 				if(module.hot._selfDeclined) {
/******/ 					return {
/******/ 						type: "self-declined",
/******/ 						chain: chain,
/******/ 						moduleId: moduleId
/******/ 					};
/******/ 				}
/******/ 				if(module.hot._main) {
/******/ 					return {
/******/ 						type: "unaccepted",
/******/ 						chain: chain,
/******/ 						moduleId: moduleId
/******/ 					};
/******/ 				}
/******/ 				for(var i = 0; i < module.parents.length; i++) {
/******/ 					var parentId = module.parents[i];
/******/ 					var parent = installedModules[parentId];
/******/ 					if(!parent) continue;
/******/ 					if(parent.hot._declinedDependencies[moduleId]) {
/******/ 						return {
/******/ 							type: "declined",
/******/ 							chain: chain.concat([parentId]),
/******/ 							moduleId: moduleId,
/******/ 							parentId: parentId
/******/ 						};
/******/ 					}
/******/ 					if(outdatedModules.indexOf(parentId) >= 0) continue;
/******/ 					if(parent.hot._acceptedDependencies[moduleId]) {
/******/ 						if(!outdatedDependencies[parentId])
/******/ 							outdatedDependencies[parentId] = [];
/******/ 						addAllToSet(outdatedDependencies[parentId], [moduleId]);
/******/ 						continue;
/******/ 					}
/******/ 					delete outdatedDependencies[parentId];
/******/ 					outdatedModules.push(parentId);
/******/ 					queue.push({
/******/ 						chain: chain.concat([parentId]),
/******/ 						id: parentId
/******/ 					});
/******/ 				}
/******/ 			}
/******/ 	
/******/ 			return {
/******/ 				type: "accepted",
/******/ 				moduleId: updateModuleId,
/******/ 				outdatedModules: outdatedModules,
/******/ 				outdatedDependencies: outdatedDependencies
/******/ 			};
/******/ 		}
/******/ 	
/******/ 		function addAllToSet(a, b) {
/******/ 			for(var i = 0; i < b.length; i++) {
/******/ 				var item = b[i];
/******/ 				if(a.indexOf(item) < 0)
/******/ 					a.push(item);
/******/ 			}
/******/ 		}
/******/ 	
/******/ 		// at begin all updates modules are outdated
/******/ 		// the "outdated" status can propagate to parents if they don't accept the children
/******/ 		var outdatedDependencies = {};
/******/ 		var outdatedModules = [];
/******/ 		var appliedUpdate = {};
/******/ 	
/******/ 		var warnUnexpectedRequire = function warnUnexpectedRequire() {
/******/ 			console.warn("[HMR] unexpected require(" + result.moduleId + ") to disposed module");
/******/ 		};
/******/ 	
/******/ 		for(var id in hotUpdate) {
/******/ 			if(Object.prototype.hasOwnProperty.call(hotUpdate, id)) {
/******/ 				moduleId = toModuleId(id);
/******/ 				var result;
/******/ 				if(hotUpdate[id]) {
/******/ 					result = getAffectedStuff(moduleId);
/******/ 				} else {
/******/ 					result = {
/******/ 						type: "disposed",
/******/ 						moduleId: id
/******/ 					};
/******/ 				}
/******/ 				var abortError = false;
/******/ 				var doApply = false;
/******/ 				var doDispose = false;
/******/ 				var chainInfo = "";
/******/ 				if(result.chain) {
/******/ 					chainInfo = "\nUpdate propagation: " + result.chain.join(" -> ");
/******/ 				}
/******/ 				switch(result.type) {
/******/ 					case "self-declined":
/******/ 						if(options.onDeclined)
/******/ 							options.onDeclined(result);
/******/ 						if(!options.ignoreDeclined)
/******/ 							abortError = new Error("Aborted because of self decline: " + result.moduleId + chainInfo);
/******/ 						break;
/******/ 					case "declined":
/******/ 						if(options.onDeclined)
/******/ 							options.onDeclined(result);
/******/ 						if(!options.ignoreDeclined)
/******/ 							abortError = new Error("Aborted because of declined dependency: " + result.moduleId + " in " + result.parentId + chainInfo);
/******/ 						break;
/******/ 					case "unaccepted":
/******/ 						if(options.onUnaccepted)
/******/ 							options.onUnaccepted(result);
/******/ 						if(!options.ignoreUnaccepted)
/******/ 							abortError = new Error("Aborted because " + moduleId + " is not accepted" + chainInfo);
/******/ 						break;
/******/ 					case "accepted":
/******/ 						if(options.onAccepted)
/******/ 							options.onAccepted(result);
/******/ 						doApply = true;
/******/ 						break;
/******/ 					case "disposed":
/******/ 						if(options.onDisposed)
/******/ 							options.onDisposed(result);
/******/ 						doDispose = true;
/******/ 						break;
/******/ 					default:
/******/ 						throw new Error("Unexception type " + result.type);
/******/ 				}
/******/ 				if(abortError) {
/******/ 					hotSetStatus("abort");
/******/ 					return Promise.reject(abortError);
/******/ 				}
/******/ 				if(doApply) {
/******/ 					appliedUpdate[moduleId] = hotUpdate[moduleId];
/******/ 					addAllToSet(outdatedModules, result.outdatedModules);
/******/ 					for(moduleId in result.outdatedDependencies) {
/******/ 						if(Object.prototype.hasOwnProperty.call(result.outdatedDependencies, moduleId)) {
/******/ 							if(!outdatedDependencies[moduleId])
/******/ 								outdatedDependencies[moduleId] = [];
/******/ 							addAllToSet(outdatedDependencies[moduleId], result.outdatedDependencies[moduleId]);
/******/ 						}
/******/ 					}
/******/ 				}
/******/ 				if(doDispose) {
/******/ 					addAllToSet(outdatedModules, [result.moduleId]);
/******/ 					appliedUpdate[moduleId] = warnUnexpectedRequire;
/******/ 				}
/******/ 			}
/******/ 		}
/******/ 	
/******/ 		// Store self accepted outdated modules to require them later by the module system
/******/ 		var outdatedSelfAcceptedModules = [];
/******/ 		for(i = 0; i < outdatedModules.length; i++) {
/******/ 			moduleId = outdatedModules[i];
/******/ 			if(installedModules[moduleId] && installedModules[moduleId].hot._selfAccepted)
/******/ 				outdatedSelfAcceptedModules.push({
/******/ 					module: moduleId,
/******/ 					errorHandler: installedModules[moduleId].hot._selfAccepted
/******/ 				});
/******/ 		}
/******/ 	
/******/ 		// Now in "dispose" phase
/******/ 		hotSetStatus("dispose");
/******/ 		Object.keys(hotAvailableFilesMap).forEach(function(chunkId) {
/******/ 			if(hotAvailableFilesMap[chunkId] === false) {
/******/ 				hotDisposeChunk(chunkId);
/******/ 			}
/******/ 		});
/******/ 	
/******/ 		var idx;
/******/ 		var queue = outdatedModules.slice();
/******/ 		while(queue.length > 0) {
/******/ 			moduleId = queue.pop();
/******/ 			module = installedModules[moduleId];
/******/ 			if(!module) continue;
/******/ 	
/******/ 			var data = {};
/******/ 	
/******/ 			// Call dispose handlers
/******/ 			var disposeHandlers = module.hot._disposeHandlers;
/******/ 			for(j = 0; j < disposeHandlers.length; j++) {
/******/ 				cb = disposeHandlers[j];
/******/ 				cb(data);
/******/ 			}
/******/ 			hotCurrentModuleData[moduleId] = data;
/******/ 	
/******/ 			// disable module (this disables requires from this module)
/******/ 			module.hot.active = false;
/******/ 	
/******/ 			// remove module from cache
/******/ 			delete installedModules[moduleId];
/******/ 	
/******/ 			// remove "parents" references from all children
/******/ 			for(j = 0; j < module.children.length; j++) {
/******/ 				var child = installedModules[module.children[j]];
/******/ 				if(!child) continue;
/******/ 				idx = child.parents.indexOf(moduleId);
/******/ 				if(idx >= 0) {
/******/ 					child.parents.splice(idx, 1);
/******/ 				}
/******/ 			}
/******/ 		}
/******/ 	
/******/ 		// remove outdated dependency from module children
/******/ 		var dependency;
/******/ 		var moduleOutdatedDependencies;
/******/ 		for(moduleId in outdatedDependencies) {
/******/ 			if(Object.prototype.hasOwnProperty.call(outdatedDependencies, moduleId)) {
/******/ 				module = installedModules[moduleId];
/******/ 				if(module) {
/******/ 					moduleOutdatedDependencies = outdatedDependencies[moduleId];
/******/ 					for(j = 0; j < moduleOutdatedDependencies.length; j++) {
/******/ 						dependency = moduleOutdatedDependencies[j];
/******/ 						idx = module.children.indexOf(dependency);
/******/ 						if(idx >= 0) module.children.splice(idx, 1);
/******/ 					}
/******/ 				}
/******/ 			}
/******/ 		}
/******/ 	
/******/ 		// Not in "apply" phase
/******/ 		hotSetStatus("apply");
/******/ 	
/******/ 		hotCurrentHash = hotUpdateNewHash;
/******/ 	
/******/ 		// insert new code
/******/ 		for(moduleId in appliedUpdate) {
/******/ 			if(Object.prototype.hasOwnProperty.call(appliedUpdate, moduleId)) {
/******/ 				modules[moduleId] = appliedUpdate[moduleId];
/******/ 			}
/******/ 		}
/******/ 	
/******/ 		// call accept handlers
/******/ 		var error = null;
/******/ 		for(moduleId in outdatedDependencies) {
/******/ 			if(Object.prototype.hasOwnProperty.call(outdatedDependencies, moduleId)) {
/******/ 				module = installedModules[moduleId];
/******/ 				moduleOutdatedDependencies = outdatedDependencies[moduleId];
/******/ 				var callbacks = [];
/******/ 				for(i = 0; i < moduleOutdatedDependencies.length; i++) {
/******/ 					dependency = moduleOutdatedDependencies[i];
/******/ 					cb = module.hot._acceptedDependencies[dependency];
/******/ 					if(callbacks.indexOf(cb) >= 0) continue;
/******/ 					callbacks.push(cb);
/******/ 				}
/******/ 				for(i = 0; i < callbacks.length; i++) {
/******/ 					cb = callbacks[i];
/******/ 					try {
/******/ 						cb(moduleOutdatedDependencies);
/******/ 					} catch(err) {
/******/ 						if(options.onErrored) {
/******/ 							options.onErrored({
/******/ 								type: "accept-errored",
/******/ 								moduleId: moduleId,
/******/ 								dependencyId: moduleOutdatedDependencies[i],
/******/ 								error: err
/******/ 							});
/******/ 						}
/******/ 						if(!options.ignoreErrored) {
/******/ 							if(!error)
/******/ 								error = err;
/******/ 						}
/******/ 					}
/******/ 				}
/******/ 			}
/******/ 		}
/******/ 	
/******/ 		// Load self accepted modules
/******/ 		for(i = 0; i < outdatedSelfAcceptedModules.length; i++) {
/******/ 			var item = outdatedSelfAcceptedModules[i];
/******/ 			moduleId = item.module;
/******/ 			hotCurrentParents = [moduleId];
/******/ 			try {
/******/ 				__webpack_require__(moduleId);
/******/ 			} catch(err) {
/******/ 				if(typeof item.errorHandler === "function") {
/******/ 					try {
/******/ 						item.errorHandler(err);
/******/ 					} catch(err2) {
/******/ 						if(options.onErrored) {
/******/ 							options.onErrored({
/******/ 								type: "self-accept-error-handler-errored",
/******/ 								moduleId: moduleId,
/******/ 								error: err2,
/******/ 								orginalError: err
/******/ 							});
/******/ 						}
/******/ 						if(!options.ignoreErrored) {
/******/ 							if(!error)
/******/ 								error = err2;
/******/ 						}
/******/ 						if(!error)
/******/ 							error = err;
/******/ 					}
/******/ 				} else {
/******/ 					if(options.onErrored) {
/******/ 						options.onErrored({
/******/ 							type: "self-accept-errored",
/******/ 							moduleId: moduleId,
/******/ 							error: err
/******/ 						});
/******/ 					}
/******/ 					if(!options.ignoreErrored) {
/******/ 						if(!error)
/******/ 							error = err;
/******/ 					}
/******/ 				}
/******/ 			}
/******/ 		}
/******/ 	
/******/ 		// handle errors in accept handlers and self accepted module load
/******/ 		if(error) {
/******/ 			hotSetStatus("fail");
/******/ 			return Promise.reject(error);
/******/ 		}
/******/ 	
/******/ 		hotSetStatus("idle");
/******/ 		return new Promise(function(resolve) {
/******/ 			resolve(outdatedModules);
/******/ 		});
/******/ 	}
/******/
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {},
/******/ 			hot: hotCreateModule(moduleId),
/******/ 			parents: (hotCurrentParentsTemp = hotCurrentParents, hotCurrentParents = [], hotCurrentParentsTemp),
/******/ 			children: []
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, hotCreateRequire(moduleId));
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// identity function for calling harmony imports with the correct context
/******/ 	__webpack_require__.i = function(value) { return value; };
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// __webpack_hash__
/******/ 	__webpack_require__.h = function() { return hotCurrentHash; };
/******/
/******/ 	// Load entry module and return exports
/******/ 	return hotCreateRequire(21)(__webpack_require__.s = 21);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports) {

throw new Error("Module build failed: Error: ENOENT: no such file or directory, open '/home/akshay/Projects/Chart-utils/node_modules/d3/build/d3.js'");

/***/ }),
/* 1 */
/***/ (function(module, exports) {

throw new Error("Module build failed: Error: ENOENT: no such file or directory, open '/home/akshay/Projects/Chart-utils/node_modules/lodash/lodash.js'");

/***/ }),
/* 2 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return getTranslateValue; });
/* unused harmony export getUniqueElements */
/* unused harmony export getMatchingRows */


// let colorPalette = ["#3366cc", "#dc3912", "#ff9900", "#109618", "#0099c6", "#dd4477", "#66aa00", "#b82e2e"].concat(colorbrewer.Paired[12]);

let colorPalette = ["#3366cc", "#dc3912", "#ff9900", "#109618", "#0099c6", "#dd4477", "#66aa00", "#b82e2e", "#316395", "#994499", "#22aa99", "#aaaa11", "#6633cc", "#e67300", "#8b0707", "#651067", "#329262", "#5574a6", "#3b3eac", "#990099"];
let baseColor = colorPalette[4];
const _ = __webpack_require__(1);

const getParent = function (level) {
    let parent;
    if (level == 'Kingdom' || level == 'Group') {
        parent = 'Kingdom';
    } else if (level == 'SubGroup') {
        parent = 'Group';
    } else if (level == 'Organism') {
        parent = 'SubGroup';
    }
    return parent;
};

const getSubLevel = function (level) {
    let sublevel;
    if (level == 'GOD') {
        sublevel = 'Kingdom';
    } else if (level == 'Kingdom') {
        sublevel = 'Group';
    } else if (level == 'Group') {
        sublevel = 'SubGroup';
    } else if (level == 'SubGroup') {
        sublevel = 'Organism';
    }
    return sublevel;
};

/*-- Defining Custom Errors ---------------------------------------*/
const UnImplementedError = function (name = "ImplementationError", message = "") {
    // Error.apply(this, arguments);
    this.name = name;
    this.message = message;
};
UnImplementedError.prototype = Object.create(Error.prototype);

/*-- Getting Translate vector parameters from the TranslateString ------------*/
const getTranslateValue = function (translateString) {

    const x1 = translateString.indexOf("(");
    const x2 = translateString.indexOf(",");
    const resx = parseInt(translateString.slice(x1 + 1, x2));

    const y1 = translateString.indexOf(",");
    const y2 = translateString.indexOf(")");

    const resy = parseInt(translateString.slice(y1 + 1, y2));

    return [resx, resy];
};

/*-- Getting Maximum Limit for axis ------------------------------------------*/
const get_maxcod = function (ymax) {

    if (ymax < 10) {
        ymax = Math.ceil(ymax);
    } else if (ymax <= 100) {
        ymax = Math.ceil(ymax / 10) * 10 + 30;
    } else if (ymax <= 1000) {
        ymax = Math.ceil(ymax / 100) * 100 + 100;
    } else if (ymax <= 10000) {
        ymax = Math.ceil(ymax / 100) * 100 + 500;
    } else if (ymax <= 100000) {
        ymax = Math.ceil(ymax / 1000) * 1000 + 1000;
    } else if (100000 < ymax) {
        ymax = Math.ceil(ymax / 10000) * 10000 + 5000;
    }
    return ymax;
};

/*-- Getting Unique Elements of a column -------------------------------------*/
const getUniqueElements = function (data, level) {
    return _.chain(data).pluck(level).unique().compact().value();
};

/*-- Getting Matching Rows based on a Column Value ---------------------------*/
const getMatchingRows = function (data, level, target) {
    var matching_data = _.map(data, function (d) {
        if (d[level] == target) {
            return d;
        }
    });
    return matching_data.filter(Boolean);
};

/*-- Get the matching column -------------------------------------------------*/
const getMatchingColumn = function (data, column) {
    var matcing_data = _.map(data, function (d) {
        return d[column];
    });

    return matcing_data;
};

/* -- Sort data by Column --------------------------------------------------- */
const sortByColumn = function (data, column, reverse) {
    const result = reverse ? _.sortBy(data, function (d) {
        return d.column;
    }) : _.sortBy(data, function (d) {
        return d.column;
    }).reverse();
};

/*-- Populating Data Table ---------------------------------------------------*/
const populateDataTable = function (data) {

    dataTable.destroy();

    d3.select('#data-table').select('tbody').selectAll('tr').remove();

    const columns = ['Organism', 'Kingdom', 'Group', 'SubGroup', 'Size(Mb)', 'GC%', 'Genes', 'Proteins'];
    const dataRow = d3.select('#data-table').select('tbody').selectAll('tr').data(data).enter().append('tr');

    for (let c in columns) {
        let column = columns[c];
        dataRow.append('td').append('text').text(function (d) {
            return d[column];
        });
    }

    dataTable = $('#data-table').DataTable();
};

/* -- Creating Color based on Data ------------------------------------------ */
const setCurrentPalette = function (data, val, level) {
    let barPalette = {};
    let scatterPalette = {};
    const levelElements = getUniqueElements(data, level);
    const parentElements = getUniqueElements(data, getParent(level));
    if (level === 'Kingdom') {
        labels = levelElements;
        for (let c in labels) {
            let label = labels[c];
            barPalette[label] = baseColor;
            scatterPalette[label] = colorPalette[c % colorPalette.length];
        }
    } else {
        if (parentElements.length === 1) {
            labels = levelElements;
            for (let a in labels) {
                let label = labels[a];
                barPalette[label] = baseColor;
                scatterPalette[label] = colorPalette[a % colorPalette.length];
            }
        } else {
            labels = parentElements;
            for (let b in labels) {
                let label = labels[b];
                const subElements = getUniqueElements(getMatchingRows(data, getParent(level), label), level);
                for (let c in subElements) {
                    c = subElements[c];
                    scatterPalette[c] = colorPalette[b % colorPalette.length];
                    barPalette[c] = colorPalette[b % colorPalette.length];
                }
            }
        }
    }

    // console.log(barPalette, scatterPalette);
    return [barPalette, scatterPalette];
};



/***/ }),
/* 3 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "b", function() { return scale; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "c", function() { return axis; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "d", function() { return axislabel; });
/* unused harmony export rotateXticks */
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return colorPalette; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__utils_js__ = __webpack_require__(2);


const d3 = __webpack_require__(0);
const _ = __webpack_require__(1);


const colorPalette = function (num, intensity) {
    let color = {

        "Blue": {
            "50": "#E3F2FD",
            "100": "#BBDEFB",
            "200": "#90CAF9",
            "300": "#64B5F6",
            "400": "#42A5F5",
            "500": "#2196F3",
            "600": "#1E88E5",
            "700": "#1976D2",
            "800": "#1565C0",
            "900": "#0D47A1",
            "A100": "#82B1FF",
            "A200": "#448AFF",
            "A400": "#2979FF",
            "A700": "#2962FF"
        },

        "Light Green": {
            "50": "#F1F8E9",
            "100": "#DCEDC8",
            "200": "#C5E1A5",
            "300": "#AED581",
            "400": "#9CCC65",
            "500": "#8BC34A",
            "600": "#7CB342",
            "700": "#689F38",
            "800": "#558B2F",
            "900": "#33691E",
            "A100": "#CCFF90",
            "A200": "#B2FF59",
            "A400": "#76FF03",
            "A700": "#64DD17"
        },

        "Orange": {
            "50": "#FFF3E0",
            "100": "#FFE0B2",
            "200": "#FFCC80",
            "300": "#FFB74D",
            "400": "#FFA726",
            "500": "#FF9800",
            "600": "#FB8C00",
            "700": "#F57C00",
            "800": "#EF6C00",
            "900": "#E65100",
            "A100": "#FFD180",
            "A200": "#FFAB40",
            "A400": "#FF9100",
            "A700": "#FF6D00"
        },

        "Pink": {
            "50": "#FCE4EC",
            "100": "#F8BBD0",
            "200": "#F48FB1",
            "300": "#F06292",
            "400": "#EC407A",
            "500": "#E91E63",
            "600": "#D81B60",
            "700": "#C2185B",
            "800": "#AD1457",
            "900": "#880E4F",
            "A100": "#FF80AB",
            "A200": "#FF4081",
            "A400": "#F50057",
            "A700": "#C51162"
        },

        "Amber": {
            "50": "#FFF8E1",
            "100": "#FFECB3",
            "200": "#FFE082",
            "300": "#FFD54F",
            "400": "#FFCA28",
            "500": "#FFC107",
            "600": "#FFB300",
            "700": "#FFA000",
            "800": "#FF8F00",
            "900": "#FF6F00",
            "A100": "#FFE57F",
            "A200": "#FFD740",
            "A400": "#FFC400",
            "A700": "#FFAB00"
        },

        "Green": {
            "50": "#E8F5E9",
            "100": "#C8E6C9",
            "200": "#A5D6A7",
            "300": "#81C784",
            "400": "#66BB6A",
            "500": "#4CAF50",
            "600": "#43A047",
            "700": "#388E3C",
            "800": "#2E7D32",
            "900": "#1B5E20",
            "A100": "#B9F6CA",
            "A200": "#69F0AE",
            "A400": "#00E676",
            "A700": "#00C853"
        },

        "Cyan": {
            "50": "#E0F7FA",
            "100": "#B2EBF2",
            "200": "#80DEEA",
            "300": "#4DD0E1",
            "400": "#26C6DA",
            "500": "#00BCD4",
            "600": "#00ACC1",
            "700": "#0097A7",
            "800": "#00838F",
            "900": "#006064",
            "A100": "#84FFFF",
            "A200": "#18FFFF",
            "A400": "#00E5FF",
            "A700": "#00B8D4"
        },

        "Red": {
            "50": "#FFEBEE",
            "100": "#FFCDD2",
            "200": "#EF9A9A",
            "300": "#E57373",
            "400": "#EF5350",
            "500": "#F44336",
            "600": "#E53935",
            "700": "#D32F2F",
            "800": "#C62828",
            "900": "#B71C1C",
            "A100": "#FF8A80",
            "A200": "#FF5252",
            "A400": "#FF1744",
            "A700": "#D50000"
        },

        "Indigo": {
            "50": "#E8EAF6",
            "100": "#C5CAE9",
            "200": "#9FA8DA",
            "300": "#7986CB",
            "400": "#5C6BC0",
            "500": "#3F51B5",
            "600": "#3949AB",
            "700": "#303F9F",
            "800": "#283593",
            "900": "#1A237E",
            "A100": "#8C9EFF",
            "A200": "#536DFE",
            "A400": "#3D5AFE",
            "A700": "#304FFE"
        },

        "Purple": {
            "50": "#F3E5F5",
            "100": "#E1BEE7",
            "200": "#CE93D8",
            "300": "#BA68C8",
            "400": "#AB47BC",
            "500": "#9C27B0",
            "600": "#8E24AA",
            "700": "#7B1FA2",
            "800": "#6A1B9A",
            "900": "#4A148C",
            "A100": "#EA80FC",
            "A200": "#E040FB",
            "A400": "#D500F9",
            "A700": "#AA00FF"
        },

        "Deep Purple": {
            "50": "#EDE7F6",
            "100": "#D1C4E9",
            "200": "#B39DDB",
            "300": "#9575CD",
            "400": "#7E57C2",
            "500": "#673AB7",
            "600": "#5E35B1",
            "700": "#512DA8",
            "800": "#4527A0",
            "900": "#311B92",
            "A100": "#B388FF",
            "A200": "#7C4DFF",
            "A400": "#651FFF",
            "A700": "#6200EA"
        },

        "Light Blue": {
            "50": "#E1F5FE",
            "100": "#B3E5FC",
            "200": "#81D4FA",
            "300": "#4FC3F7",
            "400": "#29B6F6",
            "500": "#03A9F4",
            "600": "#039BE5",
            "700": "#0288D1",
            "800": "#0277BD",
            "900": "#01579B",
            "A100": "#80D8FF",
            "A200": "#40C4FF",
            "A400": "#00B0FF",
            "A700": "#0091EA"
        },

        "Teal": {
            "50": "#E0F2F1",
            "100": "#B2DFDB",
            "200": "#80CBC4",
            "300": "#4DB6AC",
            "400": "#26A69A",
            "500": "#009688",
            "600": "#00897B",
            "700": "#00796B",
            "800": "#00695C",
            "900": "#004D40",
            "A100": "#A7FFEB",
            "A200": "#64FFDA",
            "A400": "#1DE9B6",
            "A700": "#00BFA5"
        },

        "Lime": {
            "50": "#F9FBE7",
            "100": "#F0F4C3",
            "200": "#E6EE9C",
            "300": "#DCE775",
            "400": "#D4E157",
            "500": "#CDDC39",
            "600": "#C0CA33",
            "700": "#AFB42B",
            "800": "#9E9D24",
            "900": "#827717",
            "A100": "#F4FF81",
            "A200": "#EEFF41",
            "A400": "#C6FF00",
            "A700": "#AEEA00"
        },

        "Yellow": {
            "50": "#FFFDE7",
            "100": "#FFF9C4",
            "200": "#FFF59D",
            "300": "#FFF176",
            "400": "#FFEE58",
            "500": "#FFEB3B",
            "600": "#FDD835",
            "700": "#FBC02D",
            "800": "#F9A825",
            "900": "#F57F17",
            "A100": "#FFFF8D",
            "A200": "#FFFF00",
            "A400": "#FFEA00",
            "A700": "#FFD600"
        },

        "Deep Orange": {
            "50": "#FBE9E7",
            "100": "#FFCCBC",
            "200": "#FFAB91",
            "300": "#FF8A65",
            "400": "#FF7043",
            "500": "#FF5722",
            "600": "#F4511E",
            "700": "#E64A19",
            "800": "#D84315",
            "900": "#BF360C",
            "A100": "#FF9E80",
            "A200": "#FF6E40",
            "A400": "#FF3D00",
            "A700": "#DD2C00"
        },

        "Brown": {
            "50": "#EFEBE9",
            "100": "#D7CCC8",
            "200": "#BCAAA4",
            "300": "#A1887F",
            "400": "#8D6E63",
            "500": "#795548",
            "600": "#6D4C41",
            "700": "#5D4037",
            "800": "#4E342E",
            "900": "#3E2723"
        },

        "Grey": {
            "50": "#FAFAFA",
            "100": "#F5F5F5",
            "200": "#EEEEEE",
            "300": "#E0E0E0",
            "400": "#BDBDBD",
            "500": "#9E9E9E",
            "600": "#757575",
            "700": "#616161",
            "800": "#424242",
            "900": "#212121"
        },

        "Blue Grey": {
            "50": "#ECEFF1",
            "100": "#CFD8DC",
            "200": "#B0BEC5",
            "300": "#90A4AE",
            "400": "#78909C",
            "500": "#607D8B",
            "600": "#546E7A",
            "700": "#455A64",
            "800": "#37474F",
            "900": "#263238"
        }

    };

    let outputPalette = [];
    let colorKeys = Object.keys(color);

    for (let i in _.range(num)) {
        let keyColor = colorKeys[i];
        outputPalette.push(color[keyColor][intensity]);
    }

    return outputPalette;
};

const scale = function (Obj) {
    let scale;

    const domain = Obj.domain;
    const range = Obj.range;
    const type = Obj.scaleType ? Obj.scaleType : 'linear';
    const padding = Obj.padding ? Obj.padding : 0.25;
    const align = Obj.align ? Obj.align : 0.5;

    // Type of the scale is Linear
    if (type === 'linear') {
        scale = d3.scaleLinear().domain(domain).range(range);
    }

    // Type of the scale is Ordinal
    else if (type === 'ordinal') {
            const ordinalrange = _.range(range[0], range[1] + 1, (range[1] - range[0]) / (domain.length - 1));
            scale = d3.scaleOrdinal().domain(domain).range(ordinalrange);
        }

        // Type of scale is Band scale
        else if (type === 'band') {
                scale = d3.scaleBand().domain(domain).range(range).padding([padding]).align([align]);
            }

    return scale;
};

const axis = function (Obj) {

    let axis;
    let ticks;
    const scale = Obj.scale;
    const orient = Obj.orient ? Obj.orient : 'left';

    // Orientation of axis
    if (orient === 'bottom') {
        axis = d3.axisBottom(scale);
    } else if (orient === 'top') {
        axis = d3.axisTop(scale);
    } else if (orient === 'left') {
        axis = d3.axisLeft(scale);
    } else if (orient === 'right') {
        axis = d3.axisRight(scale);
    }

    // Customising for number of ticks or the Tick values
    if (Obj.hasOwnProperty('ticks')) {
        ticks = Obj.ticks;
        if (typeof ticks === 'number') {
            axis = axis.ticks(ticks);
        } else if (ticks instanceof Array) {
            axis = axis.tickValues(ticks);
        }
    }

    // Specifying the tickFormat
    if (Obj.hasOwnProperty('tickformat')) {
        let tickFormat = Obj.tickformat;
        if (tickFormat === 'percent' || tickFormat === 'percentage') {
            axis = axis.tickFormat('0.1%');
        }

        if (tickFormat == 'thousands') {
            axis = axis.tickFormat(function (d) {
                d = d / 1000 + "K";
                return d;
            });
        }
    }

    return axis;
};

const axiStyle = function (Obj) {

    const rotate = Obj.rotate ? Obj.rotate : 0;
};

const axislabel = function (Obj) {
    let padding;
    let translateX;
    let translateY;
    let rotate;
    const axisSelector = Obj.selector;
    const axisOrient = Obj.orient;
    const text = Obj.text;
    // const side = (Obj.side) ? Obj.side : 'outside';
    const position = Obj.position ? Obj.position : 'center';
    const distance = Obj.distance ? Obj.distance : 8;
    const size = Obj.size ? Obj.size : 10;
    const fontweight = Obj.fontweight ? Obj.fontweight : 'light';
    const margin = Obj.margin;

    const axisNode = document.querySelector(axisSelector);
    const translateString = axisNode.getAttribute('transform');
    const axisbox = axisNode.getBBox();
    const translate = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__utils_js__["a" /* getTranslateValue */])(translateString);

    let textAnchor = 'middle';

    // if (side === 'outside') {padding = distance;}
    // else if (side === 'inside') {padding = -distance;}

    if (axisOrient === 'left') {
        translateX = translate[0] - axisbox.width - distance;
        translateY = translate[1] + axisbox.height / 2 + axisbox.y;
        rotate = -90;
    } else if (axisOrient === 'right') {
        translateX = translate[0] + axisbox.width + distance;
        translateY = translate[1] + axisbox.height / 2 + axisbox.y;
        rotate = -90;
    } else if (axisOrient === 'top') {
        translateX = translate[0] + axisbox.width / 2 + axisbox.x;
        translateY = translate[1] - axisbox.height - distance;
        rotate = 0;
    } else if (axisOrient === 'bottom') {
        translateX = translate[0] + axisbox.width / 2 + axisbox.x;
        translateY = translate[1] + axisbox.height + distance;
        rotate = 0;
    }

    const parentNode = axisNode.parentElement;
    d3.select(parentNode).append('g').attr('class', 'axislabel').append('text').attr('class', 'labelText').attr('transform', `translate( ${translateX}, ${translateY}) rotate(${rotate})`).style('font-size', size).style('font-weight', fontweight).style('text-anchor', textAnchor).text(text);
};

const rotateXticks = function (Obj) {
    const axisSelector = Obj.axisSelector;
    const tick = axisSelector + ' > .tick > text';
    const angle = Obj.angle; //Currently Allowed angles are 45 and 90

    if (angle === 90) {
        d3.selectAll(tick).attr('x', -12).attr('y', 0).attr('dy', '0.35em').style('text-anchor', 'center').attr('transform', 'rotate(-90)');
    } else if (angle != 0) {
        d3.selectAll(tick).attr('x', -6).attr('y', 6).style('text-anchor', 'end').attr('transform', 'rotate(-45)');
    }
};

const zoombehavior = function (Obj) {};



/***/ }),
/* 4 */
/***/ (function(module, exports) {

throw new Error("Module build failed: Error: ENOENT: no such file or directory, open '/home/akshay/Projects/Chart-utils/node_modules/bulma/css/bulma.min.css'");

/***/ }),
/* 5 */,
/* 6 */,
/* 7 */,
/* 8 */
/***/ (function(module, exports) {

throw new Error("Module build failed: Error: ENOENT: no such file or directory, open '/home/akshay/Projects/Chart-utils/node_modules/style-loader/lib/addStyles.js'");

/***/ }),
/* 9 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return barChart; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__chartUtils_js__ = __webpack_require__(3);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__utils_js__ = __webpack_require__(2);


const d3 = __webpack_require__(0);
const _ = __webpack_require__(1);


// import { tooltip } from "./tooltip.js"

/*-- 1. Data format
     data type: list of objects
     sub : Each object has a three (key, value pairs)
        (i) The name (name, value)
        (ii) The numerical Value (value, value)
        (iv)  Group value (group, value) #optional
    --*/
const barChart = function () {

    // Customizable chart properties
    let data = [];
    let width = '95%';
    let height = '95%';
    let margin = { top: 20, right: 20, bottom: 40, left: 40 };

    let color = {};
    let xLabel = "X-axis";
    let yLabel = "Y-axis";
    let windowResize = true;
    let xlabelDistance = 20;
    let ylabelDistance = 20;

    let chart = function (selection) {

        const svg = selection.append('svg').attr('height', height).attr('width', width).attr('id', 'bar-chart').attr('class', 'bar');
        let svgH = parseInt(svg.style('height').substr(0, svg.style('height').length - 2));
        let svgW = parseInt(svg.style('width').substr(0, svg.style('width').length - 2));

        //Handles the grouping and creates color object accordingly.
        //If groups are specified colors are 
        let groups = _.uniq(_.map(data, 'group'));
        if (groups.length == 0) {
            data = _.map(data, d => {
                d.group = 'default';return d;
            });
            color = { 'default': __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__chartUtils_js__["a" /* colorPalette */])(1, 700) };
        } else {
            let colors = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__chartUtils_js__["a" /* colorPalette */])(groups.length, 500);
            for (let i in groups) {
                color[groups[i]] = colors[i];
            }
        }
        data = _.map(data, d => {
            d.view = 1;return d;
        });
        console.log(data);

        let yMax = _.max(_.map(data, d => {
            return d.value;
        }));
        let yMin = _.min(_.map(data, d => {
            return d.value;
        }));
        let xticks = _.map(data, o => {
            return o.name;
        });

        let plotH = svgH - margin.top - margin.bottom; // Calculating the actual width of the plot
        let plotW = svgW - margin.left - margin.right; // Calculating the actual height of the plot
        let plotStartx = margin.left; // X-coordinate of the start of the plot
        let plotStarty = margin.top; // Y-coordinate of the start of the plot

        /* --  Defining the scale for X-axis ------------------------------------ */
        let xScale = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__chartUtils_js__["b" /* scale */])({
            domain: xticks,
            range: [plotStartx, plotStartx + plotW],
            scaleType: 'band',
            padding: 0,
            align: 0
        });

        /* -- Defining X-axis -------------------------------------- */
        let xAxis = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__chartUtils_js__["c" /* axis */])({
            scale: xScale,
            orient: 'bottom'
        });

        let xAxisElement = svg.append('g').attr('class', 'bar x axis').attr('transform', `translate(0, ${plotStarty + plotH})`);

        /* -- Defining the scale for Y-axis ----------------------------------------- */
        let yScale = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__chartUtils_js__["b" /* scale */])({
            domain: [yMin, yMax],
            range: [plotH + plotStarty, plotStarty],
            scaleType: 'linear'
        });

        /* -- Defining Y-axis --------------------------------------- */
        let yAxis = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__chartUtils_js__["c" /* axis */])({
            scale: yScale,
            ticks: 4,
            tickformat: 'thousands'
        });

        let yAxisElement = svg.append('g').attr('class', 'bar y axis').attr('transform', `translate( ${margin.left} , 0)`);

        let duration = 1000;
        const plotCanvas = svg.append('g').attr('id', 'bar-plotCanvas');

        const draw = function () {
            duration = 1000;
            let currentPlotData = _.filter(data, o => {
                return o.view == 1;
            });

            svg.select('.bar.x.axis').call(xAxis);
            svg.select('.bar.y.axis').call(yAxis);
            svg.selectAll('.axislabel').remove();

            /* -- Adding X-axis label ----------------------------------------------- */
            if (xLabel) {
                __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__chartUtils_js__["d" /* axislabel */])({
                    selector: '.bar.x.axis',
                    orient: 'bottom',
                    fontweight: 'regular',
                    size: '1em',
                    distance: xlabelDistance,
                    text: xLabel,
                    margin: margin
                });
            }

            /* -- Adding Y-axis label ----------------------------------------------- */
            if (yLabel) {
                __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__chartUtils_js__["d" /* axislabel */])({
                    selector: '.bar.y.axis',
                    orient: 'left',
                    fontweight: 'regular',
                    size: '1em',
                    distance: ylabelDistance,
                    text: yLabel,
                    margin: margin
                });
            }

            let barWidth;
            if (xScale.bandwidth() <= 100) {
                barWidth = xScale.bandwidth();
            } else {
                barWidth = 100;
            }

            /* -- Plotting the BARS ------------------------------------------------- */

            const barFigure = plotCanvas.selectAll('rect').data(currentPlotData);

            barFigure.exit().transition().duration(100).remove();

            barFigure.attr('width', barWidth).attr('x', function (d) {
                return xScale(d.name) + xScale.bandwidth() / 2 - barWidth / 2;
            }).attr('y', function (d) {
                return yScale(yMin);
            }).attr('fill', d => {
                return color[d.group];
            }).transition().duration(duration).attr('y', function (d) {
                return yScale(d.value);
            }).attr('height', function (d) {
                return yScale(yMin) - yScale(d.value);
            });

            barFigure.enter().append('rect').attr('class', 'bar').attr('width', barWidth).attr('x', function (d) {
                return xScale(d.name) + xScale.bandwidth() / 2 - barWidth / 2;
            }).attr('y', function (d) {
                return yScale(yMin);
            }).attr('fill', d => {
                console.log(d.group);return color[d.group];
            }).transition().duration(duration).attr('y', function (d) {
                return yScale(d.value);
            }).attr('height', function (d) {
                return yScale(yMin) - yScale(d.value);
            });
        };

        const updateData = function () {

            duration = 1000;
            data = _.map(data, d => {
                d.view = 1;return d;
            });

            yMax = _.max(_.map(data, d => {
                return d.value;
            }));
            yMin = _.min(_.map(data, d => {
                return d.value;
            }));
            xticks = _.map(data, o => {
                return o.name;
            });

            xScale.domain(xticks);
            yScale.domain([yMin, yMax]);

            draw();
        };

        const updateResize = function () {

            svgH = parseInt(svg.style('height').substr(0, svg.style('height').length - 2));
            svgW = parseInt(svg.style('width').substr(0, svg.style('width').length - 2));

            plotH = svgH - margin.top - margin.bottom;
            plotW = svgW - margin.left - margin.right;
            plotStartx = margin.left;
            plotStarty = margin.top;
            xScale.range([plotStartx, plotStartx + plotW]);
            yScale.range([plotH + plotStarty, plotStarty]);

            yAxisElement.attr('transform', `translate(${margin.left},0)`);
            xAxisElement.attr('transform', `translate(0,' ${plotStarty + plotH})`);

            draw();
        };

        if (windowResize) {
            window.onresize = _.debounce(updateResize, 300);
        }

        draw();
    };

    chart.data = function (_) {
        if (!arguments.length) return data;
        data = _;
        if (typeof updateData === 'function') updateData();
        return chart;
    };

    chart.width = function (_) {
        if (!arguments.length) return width;
        width = _;
        return chart;
    };

    chart.height = function (_) {
        if (!arguments.length) return height;
        height = _;
        return chart;
    };

    chart.color = function (_) {
        if (!arguments.length) return color;
        color = _;
        return chart;
    };

    chart.margin = function (_) {
        if (!arguments.length) return margin;
        margin = _;
        return chart;
    };

    chart.xLabel = function (_) {
        if (!arguments.length) return xLabel;
        xLabel = _;
        return chart;
    };

    chart.xlabelDistance = function (_) {
        if (!arguments.length) return xlabelDistance;
        xlabelDistance = _;
        return chart;
    };

    chart.ylabelDistance = function (_) {
        if (!arguments.length) return ylabelDistance;
        ylabelDistance = _;
        return chart;
    };

    chart.yLabel = function (_) {
        if (!arguments.length) return yLabel;
        yLabel = _;
        return chart;
    };

    chart.windowResize = function (_) {
        if (!arguments.length) return windowResize;
        windowResize = _;
        return chart;
    };

    return chart;
};

/* -- Defining Sort Bar Function --------------------------------------- */
// const sortChange = function(time = 1000) {

//     console.log('sortChange called!')
//         // Copy-on-write since tweens are evaluated after a delay.
//     const barsort = document.getElementById('bar-sort');
//     var x0 = xScale.domain(data.sort(barsort.checked ?

//                 function(a, b) { return b.value - a.value; } :
//                 function(a, b) { return d3.ascending(a.key, b.key); })
//             .map(function(d) { return d.key; }))
//         .copy();

//     svg.selectAll(".bar")
//         .sort(function(a, b) { return x0(a.key) - x0(b.key); });

//     let transition = svg.transition().duration(750);
//     let delay = function(d, i) { return i * (time / data.length); };

//     transition.selectAll(".bar")
//         .delay(delay)
//         .attr("x", function(d) { return x0(d.key) + x0.bandwidth() / 2 - barWidth / 2; });

//     transition.select(".x.axis")
//         .call(xAxis)
//         .selectAll("g")
//         .delay(delay);
// }



/***/ }),
/* 10 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return multilineChart; });
/* unused harmony export lineDatum */
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__chartUtils_js__ = __webpack_require__(3);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__utils_js__ = __webpack_require__(2);


const d3 = __webpack_require__(0);
const _ = __webpack_require__(1);



const lineDatum = function (data) {};

/*-- 1. Data format
     data type: list of objects
     sub : Each object has a three (key, value pairs)
        (i) The name of the line (name, value)
        (ii) The list of xValues  (x, [values])
        (iii) The list of yValues (y, [values])

    --*/
const multilineChart = function () {

    // Customisable chart properties
    let data = [];
    let x = 'x';
    let y = 'y';
    let width = '80vw';
    let height = '80vh';
    let margin = { top: 20, right: 20, bottom: 40, left: 40 };

    let xLabel = 'X-axis';
    let yLabel = 'Y-axis';
    let color = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__chartUtils_js__["a" /* colorPalette */])(19, 700);
    let colorObj = {};
    let labelDistance = 20;
    let windowResize = true;

    let xMax, xMin, yMax, yMin;

    let chart = function (selection) {
        // Data check
        const svg = selection.append('svg').attr('height', height).attr('width', width).attr('id', 'multiline-chart').attr('class', 'multiline');
        let svgH = parseInt(svg.style('height').substr(0, svg.style('height').length - 2));
        let svgW = parseInt(svg.style('width').substr(0, svg.style('width').length - 2));

        data = _.map(data, d => {
            d.view = 1;return d;
        });
        _.forEach(data, function (o, i) {
            colorObj[o.name] = color[i];
        });

        const legendLabelWidth = 80;
        const labelsinLine = Math.floor((svgW - 40 - margin.left) / 70);
        const legendLines = Math.ceil(data.length / labelsinLine);
        const legendHeight = legendLines * 20;
        margin.top += legendHeight;

        let plotH = svgH - margin.top - margin.bottom; // Calculating the actual width of the plot
        let plotW = svgW - margin.left - margin.right; // Calculating the actual height of the plot
        let plotStartx = margin.left; // X-coordinate of the start of the plot
        let plotStarty = margin.top; // Y-coordinate of the start of the plot

        xMax = _.max(_.map(_.flatten(_.map(data, o => {
            return o['values'];
        })), o => {
            return o.x;
        })); // Max value of the x-axis
        yMax = _.max(_.map(_.flatten(_.map(data, o => {
            return o['values'];
        })), o => {
            return o.y;
        })); // Max value of the y-axis
        xMin = _.min(_.map(_.flatten(_.map(data, o => {
            return o['values'];
        })), o => {
            return o.x;
        })) - 2; // Min value of the x-axis
        yMin = _.min(_.map(_.flatten(_.map(data, o => {
            return o['values'];
        })), o => {
            return o.y;
        })); // Min value of the y-axis

        /* ---------------  Defining X-axis ------------------- */
        const xScale = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__chartUtils_js__["b" /* scale */])({ domain: [xMin, xMax], range: [plotStartx, plotStartx + plotW], scaleType: 'linear' });
        const xAxis = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__chartUtils_js__["c" /* axis */])({ scale: xScale, orient: 'bottom' });
        const xAxisElement = svg.append('g').attr('class', 'multiline x axis').attr('transform', `translate(0, ${plotStarty + plotH})`);

        /* ---------------  Defining Y-axis ------------------- */
        const yScale = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__chartUtils_js__["b" /* scale */])({ domain: [yMin, yMax], range: [plotH + plotStarty, plotStarty], scaleType: 'linear' });
        const yAxis = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__chartUtils_js__["c" /* axis */])({ scale: yScale, ticks: 6, tickformat: 'thousands' });
        const yAxisElement = svg.append('g').attr('class', 'multiline y axis').attr('transform', `translate( ${margin.left} , 0)`);

        let duration = 1000;
        let line = d3.line().x(function (d) {
            return xScale(d.x);
        }).y(function (d) {
            return yScale(d.y);
        });
        const plotCanvas = svg.append('g').attr('id', 'multiline-plotCanvas');

        const draw = function () {

            svg.select('.multiline.x.axis').call(xAxis);
            svg.select('.multiline.y.axis').call(yAxis);

            svg.selectAll('.axislabel').remove();
            /* -- Adding X-axis label ----------------------------------------------- */
            if (xLabel) {
                __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__chartUtils_js__["d" /* axislabel */])({
                    selector: '.multiline.x.axis',
                    orient: 'bottom',
                    fontweight: 'regular',
                    size: '1em',
                    distance: labelDistance,
                    text: xLabel,
                    margin: margin
                });
            }

            /* -- Adding Y-axis label ----------------------------------------------- */
            if (yLabel) {
                __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__chartUtils_js__["d" /* axislabel */])({
                    selector: '.multiline.y.axis',
                    orient: 'left',
                    fontweight: 'regular',
                    size: '1em',
                    distance: labelDistance,
                    text: yLabel,
                    margin: margin
                });
            }

            addLegend();
            plotCurrentData();
        };

        const plotCurrentData = function () {

            let currentData = _.filter(data, o => {
                return o.view == 1;
            });

            xMax = _.max(_.map(_.flatten(_.map(currentData, o => {
                return o['values'];
            })), o => {
                return o.x;
            }));
            yMax = _.max(_.map(_.flatten(_.map(currentData, o => {
                return o['values'];
            })), o => {
                return o.y;
            }));
            xMin = _.min(_.map(_.flatten(_.map(currentData, o => {
                return o['values'];
            })), o => {
                return o.x;
            })) - 2;
            yMin = _.min(_.map(_.flatten(_.map(currentData, o => {
                return o['values'];
            })), o => {
                return o.y;
            }));
            xScale.domain([xMin, xMax]);
            yScale.domain([yMin, yMax]);
            svg.select('.multiline.x.axis').call(xAxis);
            svg.select('.multiline.y.axis').call(yAxis);

            let multilineFigure = plotCanvas.selectAll(".line.graph").data(currentData);

            multilineFigure.exit().remove();

            multilineFigure.enter().append("path").attr("class", "line graph").attr("fill", "none").attr("stroke", function (d) {
                return colorObj[d.name];
            }).attr("stroke-width", 3).attr("d", function (d) {
                return line(d['values']);
            });

            multilineFigure.transition().duration(750).attr("stroke", function (d) {
                return colorObj[d.name];
            }).attr("d", function (d) {
                return line(d['values']);
            });

            const multilineFocus = function () {
                /* -- Draw and handle tooltip ---------------------------------------------- */
                svg.select(".focus").remove();

                let focus = svg.append("g").attr("class", "focus").style("opacity", 0);

                //Focus points
                let hoverPoints = focus.append('g');
                hoverPoints.selectAll('circle').data(currentData).enter().append('circle').attr("class", "focus circle").attr("r", 2.5).attr("fill", function (d) {
                    return colorObj[d.name];
                });

                // Focus line
                focus.append("g").attr("stroke", "black").attr("stroke-dasharray", "0.5, 3").append("line").attr("class", "focus line").attr("y1", yScale(yMin)).attr("y2", yScale(yMax)).attr("stroke-width", 1);

                // Focus x-axis label
                focus.append("g").attr("class", "focus xhead").append("text").attr("y", yScale((yMin + yMax) / 2) - 20).attr("x", xScale(xMin) + 0.01 * (xScale(xMax) - xScale(xMin))).style("font-size", "0.8em").style("text-anchor", "end").attr("dy", "0.35em").text("Repeat Units"); //("Repeat length");

                // Focus x-axis text
                focus.append("g").attr("class", "focus xtext").append("text").attr("y", yScale((yMin + yMax) / 2)).attr("x", xScale(xMin) + 0.01 * (xScale(xMax) - xScale(xMin))).style("font-size", "0.8em").style("text-anchor", "end").attr("dy", "0.35em");

                // Focus y-axis text
                let yHoverText = focus.append("g").attr("class", "focus ytext");

                const hoverlegendHeight = (currentData.length - 1) * 15;
                const yHoverTextStart = yScale((yMax + yMin) / 2) - hoverlegendHeight / 2;
                yHoverText.selectAll('text').data(currentData).enter().append("text").style("font-size", "0.8em").attr("y", function (d, i) {
                    return yHoverTextStart + 15 * i;
                }).attr("dy", "0.35em");

                // Focus y-axis label
                focus.append("g").attr("class", "focus yhead").append('text').style("font-size", "0.8em").attr("dy", "0.35em").attr("y", yHoverTextStart - 20).text("Frequency"); //("Frequency");

                const mousemove = function () {
                    let hoverX = Math.round(xScale.invert(plotStartx + d3.mouse(this)[0]));
                    d3.select(".focus.line").attr("x1", xScale(hoverX)).attr("x2", xScale(hoverX));
                    let pointOpacity = Array(currentData.length).fill(1);
                    let toolTipDist = 0.02 * (xScale(xMax) - xScale(xMin));

                    // Handling the text for showing x-coordinate
                    focus.select(".focus.xtext").select("text").attr("x", function () {
                        let out = toolTipDist <= 10 ? xScale(hoverX) - toolTipDist : xScale(hoverX) - 10;return out;
                    }).text(hoverX + "");
                    focus.select(".focus.xhead").select("text").attr("x", function () {
                        let out = toolTipDist <= 10 ? xScale(hoverX) - toolTipDist : xScale(hoverX) - 10;return out;
                    });

                    // Handling the positions of the hover points
                    hoverPoints.selectAll("circle").data(currentData).attr("cx", xScale(hoverX)).attr("cy", function (d, i) {
                        const xIndex = _.findIndex(d['values'], function (o) {
                            return o[x] == hoverX;
                        });
                        let yOut;
                        if (xIndex != -1) {
                            yOut = yScale(d['values'][xIndex][y]);
                        } else {
                            pointOpacity[i] = 0;
                            yOut = 0;
                        }
                        return yOut;
                    }).style("opacity", function (d, i) {
                        return pointOpacity[i];
                    });

                    // Handling the text for showing y-coordinate
                    focus.select(".focus.ytext").selectAll("text").data(currentData).attr("x", function () {
                        let out = toolTipDist <= 10 ? xScale(hoverX) + toolTipDist : xScale(hoverX) + 10;return out;
                    }).text(function (d, i) {
                        const xIndex = _.findIndex(d['values'], function (o) {
                            return o[x] == hoverX;
                        });
                        const Val = xIndex != -1 ? d['values'][xIndex][y] : 0;
                        if (hoverX >= -3000) {
                            return `${d['name']}:  ${Val}`;
                        }
                    });

                    focus.select(".focus.yhead").select("text").attr("x", function () {
                        let out = toolTipDist <= 10 ? xScale(hoverX) + toolTipDist : xScale(hoverX) + 10;return out;
                    });

                    focus.style("opacity", 1);
                };

                //Overlay for catching the mouse events
                svg.append("rect").attr("class", "overlay").attr("width", plotW).attr("height", plotH).attr("transform", `translate( ${plotStartx}, ${plotStarty})`).style("opacity", 0).on("mouseover", function () {
                    focus.style("opacity", 1);
                }).on("mouseout", function () {
                    focus.style("opacity", 0);
                }).on("mousemove", mousemove);
            };

            multilineFocus();
        };

        const addLegend = function () {
            svg.selectAll('.legend').remove();
            let legend = svg.append("g").attr('class', 'line legend').attr('transform', "translate(40,20)");

            let legendLabel = legend.selectAll('.multiline.legendLabel').data(data).enter().append("g").attr("class", "multiline legendLabel");

            legendLabel.append("circle").attr("cx", function (d, i) {
                return legendLabelWidth * (i % labelsinLine);
            }).attr("cy", function (d, i) {
                return (Math.ceil((i + 1) / labelsinLine) - 1) * 20;
            }).attr("r", '5px').attr("fill", function (d) {
                return colorObj[d.name];
            }).style("cursor", "pointer").on("click", function (d, i) {
                data[i]['view'] = data[i]['view'] == 0 ? 1 : 0;
                const fill = data[i]['view'] == 0 ? "white" : colorObj[d.name];
                const stroke = data[i]['view'] == 0 ? colorObj[d.name] : "none";
                d3.select(this).attr("fill", fill).attr("stroke", stroke).attr("stroke-width", 2);
                plotCurrentData();
            }).on("dbclick", function (d, i) {
                console.log("double clicked!");
            });

            legendLabel.append("text").attr("transform", function (d, i) {
                return `translate(${legendLabelWidth * (i % labelsinLine) + 10}, ${(Math.ceil((i + 1) / labelsinLine) - 1) * 20})`;
            }).attr("dy", "0.35em").style("font-size", "0.8em").text(function (d) {
                return d.name;
            });
        };

        const updateData = function () {
            console.log('Data  changed!');
            duration = 1000;
            xMax = _.max(_.map(_.flatten(_.map(data, o => {
                return o['values'];
            })), o => {
                return o.x;
            })); // Max value of the x-axis
            yMax = _.max(_.map(_.flatten(_.map(data, o => {
                return o['values'];
            })), o => {
                return o.y;
            })); // Max value of the y-axis
            xMin = _.min(_.map(_.flatten(_.map(data, o => {
                return o['values'];
            })), o => {
                return o.x;
            })) - 2; // Min value of the x-axis
            yMin = _.min(_.map(_.flatten(_.map(data, o => {
                return o['values'];
            })), o => {
                return o.y;
            })); // Min value of the y-axis

            xScale.domain([xMin, xMax]);
            yScale.domain([yMin, yMax]);
            data = _.map(data, d => {
                d.view = 1;return d;
            });
            colorObj = {};
            _.forEach(data, function (o, i) {
                colorObj[o.name] = color[i];
            });
            draw();
        };

        const updateResize = function () {
            duration = 0;
            svgH = parseInt(svg.style('height').substr(0, svg.style('height').length - 2));
            svgW = parseInt(svg.style('width').substr(0, svg.style('width').length - 2));

            plotH = svgH - margin.top - margin.bottom; // Calculating the actual width of the plot
            plotW = svgW - margin.left - margin.right; // Calculating the actual height of the plot

            xScale.range([plotStartx, plotStartx + plotW]);
            yScale.range([plotH + plotStarty, plotStarty]);

            yAxisElement.attr('transform', 'translate(' + margin.left + ', 0)');
            xAxisElement.attr('transform', 'translate(0,' + (plotStarty + plotH) + ')');

            draw();
        };

        if (windowResize) {
            window.onresize = _.debounce(updateResize, 300);
        }

        draw();
    };

    chart.data = function (_) {
        if (!arguments.length) return data;
        data = _;
        if (typeof updateData === 'function') updateData();
        return chart;
    };

    chart.height = function (_) {
        if (!arguments.length) return height;
        height = _;
        return chart;
    };

    chart.width = function (_) {
        if (!arguments.length) return width;
        width = _;
        return chart;
    };

    chart.x = function (_) {
        if (!arguments.length) return x;
        x = _;
        return chart;
    };

    chart.y = function (_) {
        if (!arguments.length) return y;
        y = _;
        return chart;
    };

    chart.margin = function (_) {
        if (!arguments.length) return margin;
        margin = _;
        return chart;
    };

    chart.xLabel = function (_) {
        if (!arguments.length) return xLabel;
        xLabel = _;
        return chart;
    };

    chart.yLabel = function (_) {
        if (!arguments.length) return yLabel;
        yLabel = _;
        return chart;
    };

    return chart;
};



/***/ }),
/* 11 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return pieChart; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__chartUtils_js__ = __webpack_require__(3);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__utils_js__ = __webpack_require__(2);


const d3 = __webpack_require__(0);
const _ = __webpack_require__(1);


// import { tooltip } from "./tooltip.js"


/*-- 1. Data format
     data type: List of Objects
     Each object has atleast two keys:
     (i) Name
     (ii) Value

    --*/
const pieChart = function () {

    // Customisable chart properties
    let data = [];
    let height = '80vh';
    let width = '80vw';
    let piePosition = 'center'; //['left', 'right', 'center']
    let color = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__chartUtils_js__["a" /* colorPalette */])(19, 700);

    let colorObj = {};
    let windowResize = true;
    let pieRadius;
    let radius;
    const margin = { top: 40, right: 40, bottom: 40, left: 40 };

    const legendWidth = 20;
    const sliceLabels = _.map(data, 'name'); // Slice labels    

    const chart = function (selection) {

        const svg = selection.append('svg').attr('height', height).attr('width', width).attr('id', 'pie-chart').attr('class', 'pie');
        let svgH = parseInt(svg.style('height').substr(0, svg.style('height').length - 2));
        let svgW = parseInt(svg.style('width').substr(0, svg.style('width').length - 2));
        let plotH = svgH - margin.top - margin.bottom; // Calculating the actual width of the plot
        let plotW = svgW - margin.left - margin.right - legendWidth; // Calculating the actual height of the plot
        let plotStartx = margin.left; // X-coordinate of the start of the plot
        let plotStarty = margin.top; // Y-coordinate of the start of the plot
        radius = pieRadius ? pieRadius : Math.min(plotH, plotW) / 2;

        const colorObj = {};
        _.forEach(data, function (o, i) {
            colorObj[o.name] = color[i];
        });

        data = _.map(data, d => {
            d.view = 1;return d;
        });
        let pie = d3.pie().sort(null).padAngle(0.02).value(function (d) {
            return d.value;
        });
        let plotData;
        let currentData;

        const plotCenterXobj = { center: plotStartx + plotW / 2, left: plotStartx + radius, right: plotStartx + plotW - radius };
        let plotCenterX = plotCenterXobj[piePosition];
        let plotCenterY = plotStarty + plotH / 2;
        let plotCanvas = svg.append('g').attr('id', 'pie-plotCanvas').attr('transform', `translate(${plotCenterX}, ${plotCenterY})`);

        const draw = function () {
            plotcurrentData();
            addLegend();
        };

        const plotcurrentData = function () {

            currentData = _.filter(data, function (d) {
                return d.view == 1;
            });
            let totalValue = _.sumBy(currentData, d => {
                return parseFloat(d.value);
            });
            currentData = _.map(currentData, d => {
                d.percentage = parseFloat((d.value / totalValue * 100).toFixed(2));return d;
            });

            plotData = pie(currentData);

            const path = d3.arc().outerRadius(radius - 10).innerRadius(2);

            // let pieTooltip = tooltip().header({ datum: function(d) { return d.data.name; } }).prop({
            //     datum: function(d) { return `<div style="margin-bottom: 3px">Frequency: ${d.data.value}</div> <div> Percentage: ${d.data.percentage}%</div>`; }
            // });

            let plotArc = plotCanvas.selectAll(".arc").data(plotData);
            let plotArcGroup = plotArc.enter().append("g").attr("class", "arc");

            plotArc.exit().remove();

            plotArcGroup.append("path").attr("fill", function (d, i) {
                return colorObj[d.data.name];
            })
            // .call(pieTooltip)
            .transition().duration(250).attrTween('d', function (d) {
                const i = d3.interpolate(d.startAngle + 0, d.endAngle);
                return function (t) {
                    d.endAngle = i(t);return path(d);
                };
            });

            plotArcGroup.append('line').attr('class', 'labelLine1').transition().delay(250).duration(250).attr('x1', function (d) {
                return path.centroid(d)[0];
            }).attr('y1', function (d) {
                return path.centroid(d)[1];
            }).attr('x2', function (d) {
                let m = (path.centroid(d)[1] / path.centroid(d)[0]).toFixed(2);
                let mod = path.centroid(d)[0] / Math.abs(path.centroid(d)[0]);
                let x2 = mod * ((radius + 10) / Math.sqrt(1 + m * m));
                return x2;
            }).attr('y2', function (d) {
                let m = (path.centroid(d)[1] / path.centroid(d)[0]).toFixed(2);
                let mod = path.centroid(d)[0] / Math.abs(path.centroid(d)[0]);
                let x2 = mod * ((radius + 10) / Math.sqrt(1 + m * m));
                return m * x2;
            }).style('stroke', function (d, i) {
                return colorObj[d.data.name];
            });

            plotArcGroup.append('line').attr('class', 'labelLine2').transition().delay(250).duration(250).attr('x1', function (d) {
                let m = (path.centroid(d)[1] / path.centroid(d)[0]).toFixed(2);
                let mod = path.centroid(d)[0] / Math.abs(path.centroid(d)[0]);
                let x1 = mod * ((radius + 10) / Math.sqrt(1 + m * m));
                return x1;
            }).attr('y1', function (d) {
                let m = (path.centroid(d)[1] / path.centroid(d)[0]).toFixed(2);
                let mod = path.centroid(d)[0] / Math.abs(path.centroid(d)[0]);
                let x1 = mod * ((radius + 10) / Math.sqrt(1 + m * m));
                return m * x1;
            }).attr('x2', function (d) {
                let m = (path.centroid(d)[1] / path.centroid(d)[0]).toFixed(2);
                let mod = path.centroid(d)[0] / Math.abs(path.centroid(d)[0]);
                let x1 = mod * ((radius + 10) / Math.sqrt(1 + m * m));
                return x1 + mod * 20;
            }).attr('y2', function (d) {
                let m = (path.centroid(d)[1] / path.centroid(d)[0]).toFixed(2);
                let mod = path.centroid(d)[0] / Math.abs(path.centroid(d)[0]);
                let x1 = mod * ((radius + 10) / Math.sqrt(1 + m * m));
                return m * x1;
            }).style('stroke', function (d, i) {
                return colorObj[d.data.name];
            });

            plotArcGroup.append('text').attr('class', 'labelText').transition().attr("dy", "0.35em").style("font-size", "0.7em").delay(250).duration(250).attr('transform', function (d) {
                let m = (path.centroid(d)[1] / path.centroid(d)[0]).toFixed(2);
                let mod = path.centroid(d)[0] / Math.abs(path.centroid(d)[0]);
                let x = mod * ((radius + 10) / Math.sqrt(1 + m * m));
                return `translate(${x + mod * 25}, ${m * x})`;
            }).style('text-anchor', function (d) {
                let mod = path.centroid(d)[0] / Math.abs(path.centroid(d)[0]);
                let ta = mod < 0 ? 'end' : 'start';
                return ta;
            }).style('margin', '4px').text(function (d) {
                return `${d.data.percentage}%`;
            });

            // plotArcGroup.append("text")
            //     .attr("transform", function(d) { return `translate(${path.centroid(d)})`; })
            //     .attr("dy", "0.35em")
            //     .style("font-size", "0.7em")
            //     .style("text-anchor", "center")
            //     .text(function(d) { return `${d.data.name} ${d.data.percentage}%`; });

            plotArc.select("path")
            // .call(pieTooltip)
            .transition().duration(250).attrTween('d', function (d) {
                const i = d3.interpolate(d.startAngle + 0, d.endAngle);
                return function (t) {
                    d.endAngle = i(t);return path(d);
                };
            }).attr("fill", function (d, i) {
                return colorObj[d.data.name];
            });

            plotArc.select('line.labelLine1').attr('class', 'labelLine1').transition().delay(250).duration(250).attr('x1', function (d) {
                return path.centroid(d)[0];
            }).attr('y1', function (d) {
                return path.centroid(d)[1];
            }).attr('x2', function (d) {
                let m = (path.centroid(d)[1] / path.centroid(d)[0]).toFixed(2);
                let mod = path.centroid(d)[0] / Math.abs(path.centroid(d)[0]);
                let x2 = mod * ((radius + 10) / Math.sqrt(1 + m * m));
                return x2;
            }).attr('y2', function (d) {
                let m = (path.centroid(d)[1] / path.centroid(d)[0]).toFixed(2);
                let mod = path.centroid(d)[0] / Math.abs(path.centroid(d)[0]);
                let x2 = mod * ((radius + 10) / Math.sqrt(1 + m * m));
                return m * x2;
            }).style('stroke', function (d, i) {
                return colorObj[d.data.name];
            });

            plotArc.select('line.labelLine2').attr('class', 'labelLine2').transition().delay(250).duration(250).attr('x1', function (d) {
                let m = (path.centroid(d)[1] / path.centroid(d)[0]).toFixed(2);
                let mod = path.centroid(d)[0] / Math.abs(path.centroid(d)[0]);
                let x1 = mod * ((radius + 10) / Math.sqrt(1 + m * m));
                return x1;
            }).attr('y1', function (d) {
                let m = (path.centroid(d)[1] / path.centroid(d)[0]).toFixed(2);
                let mod = path.centroid(d)[0] / Math.abs(path.centroid(d)[0]);
                let x1 = mod * ((radius + 10) / Math.sqrt(1 + m * m));
                return m * x1;
            }).attr('x2', function (d) {
                let m = (path.centroid(d)[1] / path.centroid(d)[0]).toFixed(2);
                let mod = path.centroid(d)[0] / Math.abs(path.centroid(d)[0]);
                let x1 = mod * ((radius + 10) / Math.sqrt(1 + m * m));
                return x1 + mod * 20;
            }).attr('y2', function (d) {
                let m = (path.centroid(d)[1] / path.centroid(d)[0]).toFixed(2);
                let mod = path.centroid(d)[0] / Math.abs(path.centroid(d)[0]);
                let x1 = mod * ((radius + 10) / Math.sqrt(1 + m * m));
                return m * x1;
            }).style('stroke', function (d, i) {
                return colorObj[d.data.name];
            });

            plotArc.select('text.labelText').attr('class', 'labelText').transition().attr("dy", "0.35em").style("font-size", "0.7em").delay(250).duration(250).attr('transform', function (d) {
                let m = (path.centroid(d)[1] / path.centroid(d)[0]).toFixed(2);
                let mod = path.centroid(d)[0] / Math.abs(path.centroid(d)[0]);
                let x = mod * ((radius + 10) / Math.sqrt(1 + m * m));
                return `translate(${x + mod * 25}, ${m * x})`;
            }).style('text-anchor', function (d) {
                let mod = path.centroid(d)[0] / Math.abs(path.centroid(d)[0]);
                let ta = mod < 0 ? 'end' : 'start';
                return ta;
            }).style('margin', '4px').text(function (d) {
                return `${d.data.percentage}%`;
            });

            // plotArc.select("text").transition()
            //     .delay(250)
            //     .duration(250)
            //     .attr("transform", function(d) { return "translate(" + path.centroid(d) + ")"; })
            //     .attr("dy", "0.35em")
            //     .style("font-size", "0.7em")
            //     .style("text-anchor", "center")
            //     .text(function(d) { return `${d.data.percentage}%`; });
        };

        const addLegend = function () {

            /* -- Adding Legend ----------------------------------------------------- */
            svg.select('.pie.legend').remove();

            let legend = svg.append("g").attr('class', 'pie legend').attr('transform', `translate(${plotStartx + plotW / 2 + radius + 60}, ${plotStarty + 40})`);

            let legendLabel = legend.selectAll('.pie.legendLabel').data(plotData).enter().append("g").attr("class", "pie legendLabel");

            legendLabel.append("circle").attr("cx", 2.5).attr("cy", function (d, i) {
                return i * 20;
            }).attr("r", '5px').style("cursor", "pointer").attr("fill", function (d) {
                return colorObj[d.data.name];
            }).on("click", function (d, i) {
                data[i]['view'] = data[i]['view'] == 0 ? 1 : 0;
                const fill = data[i]['view'] == 0 ? "white" : colorObj[d.data.name];
                const stroke = data[i]['view'] == 0 ? colorObj[d.data.name] : "none";
                d3.select(this).attr("fill", fill).attr("stroke", stroke).attr("stroke-width", 2);
                plotcurrentData();
            });

            legendLabel.append("text").attr("transform", function (d, i) {
                return `translate(10, ${i * 20})`;
            }).attr("dy", "0.35em").style("font-size", "0.8em").text(function (d) {
                return d.data.name;
            });
        };

        const updateResize = function () {
            svgH = parseInt(svg.style('height').substr(0, svg.style('height').length - 2));
            svgW = parseInt(svg.style('width').substr(0, svg.style('width').length - 2));
            plotH = svgH - margin.top - margin.bottom; // Calculating the actual width of the plot
            plotW = svgW - margin.left - margin.right; // Calculating the actual height of the plot
            plotCenterX = plotCenterXobj[piePosition];
            plotCenterY = plotStarty + plotH / 2;
            radius = pieRadius ? pieRadius : Math.min(plotH, plotW) / 2;
            plotCanvas.attr('transform', `translate(${plotCenterX}, ${plotCenterY})`);

            draw();
        };

        // if (windowResize) { window.onresize = _.debounce(updateResize, 300); }

        draw();
    };

    chart.data = function (_) {
        if (!arguments.length) return data;
        data = _;
        return chart;
    };

    chart.radius = function (_) {
        if (!arguments.length) return radius;
        radius = _;
        return chart;
    };

    chart.piePosition = function (_) {
        if (!arguments.length) return piePosition;
        piePosition = _;
        return chart;
    };

    chart.windowResize = function (_) {
        if (!arguments.length) return windowResize;
        windowResize = _;
        return chart;
    };

    return chart;
};



/***/ }),
/* 12 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return scatterChart; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__chartUtils_js__ = __webpack_require__(3);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__utils_js__ = __webpack_require__(2);


const d3 = __webpack_require__(0);
const _ = __webpack_require__(1);


// import { tooltip } from "./tooltip.js"


/* -------------------  Convert data readable for the bar chart function  -----------------------*/
const scatterDatum = function (data, xVector, yVector, level) {
    let dataOut = [];

    for (let d in _.range(data.length)) {
        d = data[d];
        let dataObj = {};
        dataObj.x = parseFloat(d[xVector]).toFixed(2);
        dataObj.y = parseFloat(d[yVector]).toFixed(2);
        dataObj.key = d.Organism;
        dataObj.colorKey = d[level];
        dataOut.push(dataObj);
    }

    const scatterObj = {
        data: dataOut,
        xLabel: tipNames[xVector],
        yLabel: tipNames[yVector],
        svgid: "graph-svg",
        margin: { top: 20, right: 10, bottom: 50, left: 70 }
    };

    return scatterObj;
};

/*-- 1. Data format
     data type: list of objects
     sub : Each object has a three (key, value pairs)
        (i) The xValue  (x, value)
        (ii) The yValue (y, value)
        (iii) The name of the line (name, value) #optional
        (iv)  Group value (group, value) #optional
    --*/

const scatterChart = function (Obj) {

    /* Defining defaults for different plotting parameters. */

    // Customizable chart properties
    let data = [];
    let width = '95%';
    let height = '95%';
    let margin = { top: 20, right: 20, bottom: 40, left: 40 };

    let color = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__chartUtils_js__["a" /* colorPalette */])(19, 700);
    let xLabel = 'X-axis';
    let yLabel = 'Y-axis';
    let windowResize = true;
    let xlabelDistance = 20;
    let ylabelDistance = 20;

    let xMax, xMin, yMax, yMin;

    let chart = function (selection) {

        let mainDiv = document.getElementById(selection.attr('id'));
        let mainDivX = mainDiv.getBoundingClientRect().x;
        let mainDivY = mainDiv.getBoundingClientRect().y;

        const svg = selection.append('svg').attr('height', height).attr('width', width).attr('id', 'scatter-chart').attr('class', 'scatter');
        const toolTipdiv = selection.append('div').attr('class', 'scattertip').style('position', 'absolute');
        let svgH = parseInt(svg.style('height').substr(0, svg.style('height').length - 2));
        let svgW = parseInt(svg.style('width').substr(0, svg.style('width').length - 2));

        data = _.map(data, d => {
            d.view = 1;return d;
        });
        // _.forEach(data, function(o, i) { colorObj[o.name] = color[i]; });

        let plotH = svgH - margin.top - margin.bottom; // Calculating the actual width of the plot
        let plotW = svgW - margin.left - margin.right; // Calculating the actual height of the plot
        let plotStartx = margin.left; // X-coordinate of the start of the plot
        let plotStarty = margin.top; // Y-coordinate of the start of the plot

        xMax = _.max(_.map(data, o => {
            return parseFloat(o['x']);
        }));
        yMax = _.max(_.map(data, o => {
            return parseFloat(o['y']);
        }));
        xMin = _.min(_.map(data, o => {
            return parseFloat(o['x']);
        }));
        yMin = _.min(_.map(data, o => {
            return parseFloat(o['y']);
        }));

        /* ---------------  Defining X-axis ------------------- */
        const xScale = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__chartUtils_js__["b" /* scale */])({
            domain: [xMin, xMax],
            range: [plotStartx, plotStartx + plotW],
            scaleType: 'linear' });
        const xAxis = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__chartUtils_js__["c" /* axis */])({ scale: xScale, orient: 'bottom' });
        const xAxisElement = svg.append('g').attr('class', 'scatter x axis').attr('transform', `translate(0, ${plotStarty + plotH})`);

        /* ---------------  Defining Y-axis ------------------- */
        const yScale = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__chartUtils_js__["b" /* scale */])({
            domain: [yMin, yMax],
            range: [plotH + plotStarty, plotStarty],
            scaleType: 'linear' });
        const yAxis = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__chartUtils_js__["c" /* axis */])({ scale: yScale, ticks: 6, tickformat: 'thousands' });
        const yAxisElement = svg.append('g').attr('class', 'scatter y axis').attr('transform', `translate( ${margin.left} , 0)`);

        let duration = 1000;
        const plotCanvas = svg.append('g').attr('id', 'scatter-plotCanvas');

        const draw = function () {

            svg.select('.scatter.x.axis').call(xAxis);
            svg.select('.scatter.y.axis').call(yAxis);

            svg.selectAll('.axislabel').remove();
            /* -- Adding X-axis label ----------------------------------------------- */
            if (xLabel) {
                __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__chartUtils_js__["d" /* axislabel */])({
                    selector: '.scatter.x.axis',
                    orient: 'bottom',
                    fontweight: 'regular',
                    size: '1em',
                    distance: xlabelDistance,
                    text: xLabel,
                    margin: margin
                });
            }

            /* -- Adding Y-axis label ----------------------------------------------- */
            if (yLabel) {
                __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__chartUtils_js__["d" /* axislabel */])({
                    selector: '.scatter.y.axis',
                    orient: 'left',
                    fontweight: 'regular',
                    size: '1em',
                    distance: ylabelDistance,
                    text: yLabel,
                    margin: margin
                });
            }

            plotCurrentData();
        };

        const plotCurrentData = function () {

            let currentData = _.filter(data, o => {
                return o.view == 1;
            });

            xMax = _.max(_.map(currentData, o => {
                return parseFloat(o['x']);
            }));
            yMax = _.max(_.map(currentData, o => {
                return parseFloat(o['y']);
            }));
            xMin = _.min(_.map(currentData, o => {
                return parseFloat(o['x']);
            }));
            yMin = _.min(_.map(currentData, o => {
                return parseFloat(o['y']);
            }));
            xScale.domain([xMin, xMax]);
            yScale.domain([yMin, yMax]);
            svg.select('.scatter.x.axis').call(xAxis);
            svg.select('.scatter.y.axis').call(yAxis);

            let scatterFigure = plotCanvas.selectAll(".scatter.dot").data(currentData);

            scatterFigure.exit().remove();

            scatterFigure.enter().append("circle").attr("class", "scatter dot").attr("fill", color[0]).attr("r", 4).attr("cx", function (d) {
                return xScale(d.x);
            }).attr("cy", function (d) {
                return yScale(d.y);
            }).on('mouseover', function (d) {
                console.log('Mouse hovered!');
                let mouseX = event.clientX;
                let mouseY = event.clientY;
                toolTipdiv.style('display', 'inline').style('left', `${mouseX - mainDivX + 10}px`).style('top', `${mouseY - mainDivY - 80}px`).style('background', 'rgb(104, 104, 104, 0.4)').style('padding', '10px').style('border-radius', '10px');
                //   .attr('transform', `translate(${mouseX}px, ${mouseY}px)`)
                toolTipdiv.append('div').html(`<span><b>${d.name}</b></span><br><span>${xLabel}: ${d.x}</span><br><span>${yLabel}: ${d.y}</span>`);
            }).on('mousemover', function () {
                toolTipdiv.style('left', `${mouseX}px`).style('top', `${mouseY}px`);
            }).on('mouseout', function () {
                toolTipdiv.style('display', 'none');
                toolTipdiv.select('*').remove();
            });

            scatterFigure.transition().duration(750).attr("fill", color[0]).attr("r", 6).attr("cx", function (d) {
                return xScale(d.x);
            }).attr("cy", function (d) {
                return yScale(d.y);
            });
        };

        const updateData = function () {
            xMax = _.max(_.map(data, o => {
                return parseFloat(o['x']);
            }));
            yMax = _.max(_.map(data, o => {
                return parseFloat(o['y']);
            }));
            xMin = _.min(_.map(data, o => {
                return parseFloat(o['x']);
            }));
            yMin = _.min(_.map(data, o => {
                return parseFloat(o['y']);
            }));
            xScale.domain([xMin, xMax]);
            yScale.domain([yMin, yMax]);

            data = _.map(data, d => {
                d.view = 1;return d;
            });
            draw();
        };

        let updateResize = function () {
            console.log('windowResize called!');
            duration = 0;
            svgH = parseInt(svg.style('height').substr(0, svg.style('height').length - 2));
            svgW = parseInt(svg.style('width').substr(0, svg.style('width').length - 2));
            mainDivX = mainDiv.getBoundingClientRect().x;
            mainDivY = mainDiv.getBoundingClientRect().y;

            plotH = svgH - margin.top - margin.bottom; // Calculating the actual width of the plot
            plotW = svgW - margin.left - margin.right; // Calculating the actual height of the plot

            xScale.range([plotStartx, plotStartx + plotW]);
            yScale.range([plotH + plotStarty, plotStarty]);

            yAxisElement.attr('transform', 'translate(' + margin.left + ', 0)');
            xAxisElement.attr('transform', 'translate(0,' + (plotStarty + plotH) + ')');

            draw();
        };

        if (windowResize) {
            window.onresize = _.debounce(updateResize, 300);
        }

        draw();
    };

    chart.data = function (_) {
        if (!arguments.length) return data;
        data = _;
        if (typeof updateData === 'function') {
            updateData();
        };
        return chart;
    };

    chart.height = function (_) {
        if (!arguments.length) return height;
        height = _;
        console.log(height);
        return chart;
    };

    chart.width = function (_) {
        if (!arguments.length) return width;
        width = _;
        return chart;
    };

    chart.x = function (_) {
        if (!arguments.length) return x;
        x = _;
        return chart;
    };

    chart.y = function (_) {
        if (!arguments.length) return y;
        y = _;
        return chart;
    };

    chart.margin = function (_) {
        if (!arguments.length) return margin;
        margin = _;
        return chart;
    };

    chart.xLabel = function (_) {
        if (!arguments.length) return xLabel;
        xLabel = _;
        return chart;
    };

    chart.yLabel = function (_) {
        if (!arguments.length) return yLabel;
        yLabel = _;
        return chart;
    };

    return chart;
};



/***/ }),
/* 13 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* unused harmony export stackChart */
/* unused harmony export stackData */
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__chartUtils_js__ = __webpack_require__(3);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__tooltip_js__ = __webpack_require__(22);


const d3 = __webpack_require__(0);



/*  1. Data format
    data type : List of Objects
    sub : Each Object has [key: value] data pairs for all the keys being used for the stacks.
          If any of the keys is absent in any object the data for that key would be assigned as 0 in that particular object.
          Each Object should also have its corresponding xValue with the key 'x'
    2. Dimensions: If given in percentage or "(vw,vh)" format, the chart will be responsive to window resize.
    */

const stackChart = function () {

    // Customizable chart properties
    let data = [];
    let keys;
    let x = 'x';
    let width = '80vw';
    let height = '80vh';
    let margin = { top: 20, right: 20, bottom: 40, left: 40 };

    // Inplot customizable options
    let xLabel;
    let yLabel;
    let color = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__chartUtils_js__["a" /* colorPalette */])(19, 700);
    let colorObj = {};
    let labelDistance = 20;
    let windowResize = true;

    // Functions to update the Chart --------------------------------------------------------------
    let updateData;

    let chart = function (selection) {
        // Data check for presence of all the keys in each Object.
        data = _.map(data, d => {
            for (let key in keys) {
                key = keys[key];if (!(key in d)) {
                    d[key] = 0;
                }
            }return d;
        });
        data = _.map(data, d => {
            d['y'] = {};
            for (let key in keys) {
                key = keys[key];
                d['y'][key] = d[key];
            }
            return d;
        });
        const svg = selection.append('svg').attr('height', height).attr('width', width).attr('id', 'stack-chart').attr('class', 'stack');
        let svgH = parseInt(svg.style('height').substr(0, svg.style('height').length - 2));
        let svgW = parseInt(svg.style('width').substr(0, svg.style('width').length - 2));

        let plotData = d3.stack().keys(keys)(data);
        let yMax = _.max(_.flattenDeep(plotData));
        let yMin = _.min(_.flattenDeep(plotData));
        let xticks = _.map(data, o => {
            return parseInt(o[x]);
        });
        plotData = _.flatMap(plotData, function (d) {
            d = _.map(d, function (o) {
                o.key = d.key;
                o.view = 1;
                return o;
            });
            return d;
        });
        _.forEach(keys, function (o, i) {
            colorObj[o] = color[i];
        });

        const legendLabelWidth = 80;
        const labelsinLine = Math.floor((svgW - 40 - margin.left) / 70);
        const legendLines = Math.ceil(data.length / labelsinLine);
        const legendHeight = legendLines * 20;
        margin.top += legendHeight;

        let plotH = svgH - margin.top - margin.bottom; // Calculating the actual width of the plot
        let plotW = svgW - margin.left - margin.right; // Calculating the actual height of the plot
        let plotStartx = margin.left; // X-coordinate of the start of the plot
        let plotStarty = margin.top; // Y-coordinate of the start of the plot

        /* --  Defining the scale for X-axis ------------------------------------ */
        let xScale = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__chartUtils_js__["b" /* scale */])({
            domain: xticks,
            range: [plotStartx, plotStartx + plotW],
            scaleType: 'band',
            padding: 0,
            align: 0
        });

        /* -- Defining X-axis -------------------------------------- */
        let xAxis = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__chartUtils_js__["c" /* axis */])({
            scale: xScale,
            orient: 'bottom'
        });

        let xAxisElement = svg.append('g').attr('class', 'stack x axis').attr('transform', `translate(0, ${plotStarty + plotH})`);

        /* -- Defining the scale for Y-axis ----------------------------------------- */
        let yScale = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__chartUtils_js__["b" /* scale */])({
            domain: [yMin, yMax],
            range: [plotH + plotStarty, plotStarty],
            scaleType: 'linear'
        });

        /* -- Defining Y-axis --------------------------------------- */
        let yAxis = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__chartUtils_js__["c" /* axis */])({
            scale: yScale,
            ticks: 4,
            tickformat: 'thousands'
        });

        let yAxisElement = svg.append('g').attr('class', 'stack y axis').attr('transform', `translate( ${margin.left} , 0)`);

        let duration = 1000;
        const plotCanvas = svg.append('g').attr('id', 'stack-plotCanvas');

        let stackTooltip = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__tooltip_js__["a" /* tooltip */])().tipstyle('pointer').header({
            datum: 'Frequency'
        }).props({
            data: function (d) {
                let output = [];
                for (let k in d.data.y) {
                    output.push({ name: k, value: d.data.y[k], color: colorObj[k] });
                };
                return output;
            },
            icon: 'circle'
        });
        // .prop({
        //     datum: function(d) { return `${d.key}: ${d.data[d.key]}<br>Repeat length: ${d.data.repLen}`; },
        //     icon: 'circle',
        //     iconColor: function(d) { return colorObj[d.key]; }
        // })


        const draw = function () {
            let currentPlotData = _.filter(plotData, o => {
                return o.view == 1;
            });

            svg.select('.stack.x.axis').call(xAxis);
            svg.select('.stack.y.axis').call(yAxis);
            svg.selectAll('.axislabel').remove();

            /* -- Adding X-axis label ----------------------------------------------- */
            if (xLabel) {
                __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__chartUtils_js__["d" /* axislabel */])({
                    selector: '.stack.x.axis',
                    orient: 'bottom',
                    fontweight: 'regular',
                    size: '1em',
                    distance: labelDistance,
                    text: xLabel,
                    margin: margin
                });
            }

            /* -- Adding Y-axis label ----------------------------------------------- */
            if (yLabel) {
                __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__chartUtils_js__["d" /* axislabel */])({
                    selector: '.stack.y.axis',
                    orient: 'left',
                    fontweight: 'regular',
                    size: '1em',
                    distance: labelDistance,
                    text: yLabel,
                    margin: margin
                });
            }

            let barWidth;
            if (xScale.bandwidth() <= 100) {
                barWidth = xScale.bandwidth();
            } else {
                barWidth = 100;
            }

            /* -- Plotting the BARS ------------------------------------------------- */

            const stackFigure = plotCanvas.selectAll('rect').data(currentPlotData);

            stackFigure.exit().transition().duration(100).remove();

            stackFigure.attr('x', function (d) {
                return xScale(d.data.x) + xScale.bandwidth() / 2 - barWidth / 2;
            }).attr('height', 0).attr('y', function (d) {
                return yScale(yMin);
            }).attr('fill', function (d) {
                return colorObj[d.key];
            }).call(stackTooltip).transition().duration(duration).attr('y', function (d) {
                return yScale(d[1]);
            }).attr('height', function (d) {
                return yScale(d[0]) - yScale(d[1]);
            }).attr('width', xScale.bandwidth());

            stackFigure.enter().append('rect').attr('class', 'stack-bar').attr('x', function (d) {
                return xScale(d.data.x) + xScale.bandwidth() / 2 - barWidth / 2;
            }).attr('y', function (d) {
                return yScale(yMin);
            }).attr('fill', function (d) {
                return colorObj[d.key];
            }).call(stackTooltip).transition().duration(duration).attr('y', function (d) {
                return yScale(d[1]);
            }).attr('width', xScale.bandwidth()).attr('height', function (d) {
                return yScale(d[0]) - yScale(d[1]);
            });

            addLegend();
        };

        const addLegend = function () {

            /* -- Adding Legend ----------------------------------------------------- */
            svg.selectAll('.legend').remove();
            let legend = svg.append("g").attr('class', 'stack legend').attr('transform', "translate(40,20)");

            let legendLabel = legend.selectAll('.stack.legendLabel').data(keys).enter().append("g").attr("class", "stack legendLabel");

            legendLabel.append("circle").attr("cx", function (d, i) {
                return legendLabelWidth * (i % labelsinLine);
            }).attr("cy", function (d, i) {
                return (Math.ceil((i + 1) / labelsinLine) - 1) * 20;
            }).attr("r", '5px').attr("fill", function (d) {
                return colorObj[d];
            }).style("cursor", "pointer").on("click", function (d, i) {
                console.log(d);
                // data[i]['view'] = (data[i]['view'] == 0) ? 1 : 0;
                // const fill = (data[i]['view'] == 0) ? "white" : colorObj[d.name];
                // const stroke = (data[i]['view'] == 0) ? colorObj[d.name] : "none";
                // d3.select(this).attr("fill", fill).attr("stroke", stroke).attr("stroke-width", 2);
                // updateLineChart(data);
            });
            // .on("dbclick", function(d, i) { console.log("double clicked!"); });

            legendLabel.append("text").attr("transform", function (d, i) {
                return `translate(${legendLabelWidth * (i % labelsinLine) + 10}, ${(Math.ceil((i + 1) / labelsinLine) - 1) * 20})`;
            }).attr("dy", "0.35em").style("font-size", "0.8em").text(function (d) {
                return d;
            });
        };

        updateData = function () {
            duration = 1000;
            // Data check for presence of all the keys in each Object.
            data = _.map(data, d => {
                for (let key in keys) {
                    key = keys[key];if (!(key in d)) {
                        d[key] = 0;
                    }
                }return d;
            });
            plotData = d3.stack().keys(keys)(data);
            yMax = _.max(_.flattenDeep(plotData));
            yMin = _.min(_.flattenDeep(plotData));
            xticks = _.map(data, o => {
                return parseInt(o[x]);
            }).sort();

            xScale.domain(xticks);
            yScale.domain([yMin, yMax]);

            plotData = _.flatMap(plotData, function (d) {
                d = _.map(d, o => {
                    o.key = d.key;
                    o.view = 1;
                    return o;
                });
                return d;
            });

            draw();
        };

        const updateResize = function () {
            duration = 0;
            svgH = parseInt(svg.style('height').substr(0, svg.style('height').length - 2));
            svgW = parseInt(svg.style('width').substr(0, svg.style('width').length - 2));

            plotH = svgH - margin.top - margin.bottom; // Calculating the actual width of the plot
            plotW = svgW - margin.left - margin.right; // Calculating the actual height of the plot

            xScale.range([plotStartx, plotStartx + plotW]);
            yScale.range([plotH + plotStarty, plotStarty]);

            yAxisElement.attr('transform', 'translate(' + margin.left + ', 0)');
            xAxisElement.attr('transform', 'translate(0,' + (plotStarty + plotH) + ')');

            draw();
        };

        if (windowResize) {
            window.onresize = _.debounce(updateResize, 300);
        }

        draw();
    };

    chart.data = function (_) {
        if (!arguments.length) return data;
        data = _;
        if (typeof updateData === 'function') updateData();
        return chart;
    };

    chart.keys = function (_) {
        if (!arguments.length) return keys;
        keys = _;
        return chart;
    };

    chart.x = function (_) {
        if (!arguments.length) return x;
        x = _;
        return chart;
    };

    chart.width = function (_) {
        if (!arguments.length) return width;
        width = _;
        return chart;
    };

    chart.height = function (_) {
        if (!arguments.length) return height;
        height = _;
        return chart;
    };

    chart.color = function (_) {
        if (!arguments.length) return color;
        color = _;
        return chart;
    };

    chart.margin = function (_) {
        if (!arguments.length) return margin;
        margin = _;
        return chart;
    };

    chart.xLabel = function (_) {
        if (!arguments.length) return xLabel;
        xLabel = _;
        return chart;
    };

    chart.yLabel = function (_) {
        if (!arguments.length) return yLabel;
        yLabel = _;
        return chart;
    };

    chart.labelDistance = function (_) {
        if (!arguments.length) return labelDistance;
        labelDistance = _;
        return chart;
    };

    chart.windowResize = function (_) {
        if (!arguments.length) return windowResize;
        windowResize = _;
        return chart;
    };

    return chart;
};



/***/ }),
/* 14 */,
/* 15 */,
/* 16 */,
/* 17 */,
/* 18 */,
/* 19 */
/***/ (function(module, exports, __webpack_require__) {


var content = __webpack_require__(4);

if(typeof content === 'string') content = [[module.i, content, '']];

var transform;
var insertInto;



var options = {"hmr":true}

options.transform = transform
options.insertInto = undefined;

var update = __webpack_require__(8)(content, options);

if(content.locals) module.exports = content.locals;

if(true) {
	module.hot.accept(4, function() {
		var newContent = __webpack_require__(4);

		if(typeof newContent === 'string') newContent = [[module.i, newContent, '']];

		var locals = (function(a, b) {
			var key, idx = 0;

			for(key in a) {
				if(!b || a[key] !== b[key]) return false;
				idx++;
			}

			for(key in b) idx--;

			return idx === 0;
		}(content.locals, newContent.locals));

		if(!locals) throw new Error('Aborting CSS HMR due to changed css-modules locals.');

		update(newContent);
	});

	module.hot.dispose(function() { update(); });
}

/***/ }),
/* 20 */,
/* 21 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__node_modules_bulma_css_bulma_min_css__ = __webpack_require__(19);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__node_modules_bulma_css_bulma_min_css___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0__node_modules_bulma_css_bulma_min_css__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__stackChart_js__ = __webpack_require__(13);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__lineChart_js__ = __webpack_require__(10);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__pieChart_js__ = __webpack_require__(11);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__scatterChart_js__ = __webpack_require__(12);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5__barChart_js__ = __webpack_require__(9);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_6__utils_js__ = __webpack_require__(2);
const _ = __webpack_require__(1);
const d3 = __webpack_require__(0);

//styles









const plotChart = function (chartType) {
    const chartRoot = d3.select('#chart-area');
    let chartFunc;

    if (chartType === "bar") {
        d3.tsv('../data/bar_data_2.tsv', function (data) {
            const newBarChart = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_5__barChart_js__["a" /* barChart */])().data(data).margin({ top: 40, bottom: 60, left: 80, right: 30 }).xLabel('Repeats').yLabel('Abundance');
            chartRoot.call(newBarChart);
        });
    } else if (chartType === "scatter") {
        d3.tsv('../data/scatter_data.tsv', function (data) {
            const newScatterChart = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_4__scatterChart_js__["a" /* scatterChart */])().margin({ top: 40, left: 80, right: 40, bottom: 80 }).data(data);

            chartRoot.call(newScatterChart);
        });
    } else if (chartType === "scatter") {
        d3.tsv('../data/BT.tsv', function (data) {
            let names = _.map(_.uniqBy(data, 'repClass'), o => {
                return o.repClass;
            });
            let units = _.map(_.uniqBy(data, 'units'), o => {
                return parseInt(o.units);
            }).sort();
            data = _.map(names, o => {
                let values = _.map(_.filter(data, { repClass: o }), p => {
                    return { x: parseInt(p.units), y: parseInt(p.freq) };
                });return { name: o, values: values };
            });
            data = _.map(data, o => {
                let values = o.values;
                values = _.filter(values, d => {
                    return d.x <= 50 && d.x >= 2;
                });
                o.values = values;
                return o;
            });
            let newLineChart = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_2__lineChart_js__["a" /* multilineChart */])().data(data).margin({ top: 20, right: 20, bottom: 60, left: 80 }).xLabel('Repeat units').yLabel('Frequency');
            chartRoot.call(newLineChart);
        });
    } else if (chartType === 'pie') {
        d3.tsv("../data/pie_data.tsv", function (data) {
            const newPieChart = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_3__pieChart_js__["a" /* pieChart */])().data(data).piePosition('center');
            chartRoot.call(newPieChart);
        });
    }
};

d3.selectAll('.tab').on('click', function () {
    d3.select('.tab.is-active').attr('class', 'tab');
    this.classList.add('is-active');
    let chartType = this.id;
    d3.select('svg').remove();
    plotChart(chartType);
});

document.getElementById('scatter').click();

// d3.tsv('../data/BT.tsv', function(data) {

//     let names = _.map(_.uniqBy(data, 'repClass'), o => { return o.repClass; });
//     let units = (_.map(_.uniqBy(data, 'units'), o => { return parseInt(o.units); })).sort();
//     data = _.map(names, o => { let values = _.map(_.filter(data, { repClass: o }), p => { return { x: parseInt(p.units), y: parseInt(p.freq) } }); return { name: o, values: values } });
//     data = _.map(data, o => {
//         let values = o.values;
//         values = _.filter(values, d => { return d.x <= 50 && d.x >= 2; });
//         o.values = values;
//         return o;
//     })
//     console.log(data)
//     let lineRoot = d3.select('#line-main');
//     let newLineChart = multilineChart().data(data).margin({ top: 20, right: 20, bottom: 60, left: 80 }).xLabel('Repeat units').yLabel('Frequency');
//     lineRoot.call(newLineChart);
// })

/* Trial stack bar chart */
// d3.tsv('../data/data.tsv', function(data) {

//     let keys = _.uniq(_.map(data, d => { return d.repEnd; }));
//     data = _.map(data, o => {
//         o[o['repEnd']] = parseInt(o['freq']);
//         o['x'] = o['repLen'];
//         delete o['repEnd'];
//         delete o['freq'];
//         return o;
//     });
//     data = _.map(_.groupBy(data, o => { return o['repLen']; }), d => {
//         let obj = {};
//         for (let a in d) { a = d[a]; for (let b in a) { obj[b] = a[b]; } }
//         return obj;
//     });

//     const stackchartRoot = d3.select('#stacked-main');
//     const newStackedChart = stackChart().data(data).keys(keys)
//         .margin({ left: 60, top: 20, right: 20, bottom: 60 })
//         .xLabel('Repeat Length')
//         .yLabel('Frequency')
//         .labelDistance(20);

//     stackchartRoot.call(newStackedChart);
// })

/***/ }),
/* 22 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return tooltip; });
const d3 = __webpack_require__(0);

/*
  A function that can be called on svg elements to assign a tooltip
  initialisation: create a div element just outside the svg and giv it a id  "tooltip"
  usage : element.call(tooltip)
  define : (header, prop|props) 
 */
const tooltip = function () {

    let tipstyle = 'default'; //(pointer|default)
    let xOffset = 10;
    let yOffset = 10;
    let position;
    /* header = {
       datum: (html|string|function),
       icon: (null|circle|square|rounded-square), 
       iconColor: (color|function)
     } */
    let header, headerDiv, headerIcon, headerDatum;

    /* 
      Basic data type of a property is (key, value) pair.
      The function specified for "prop" should return a string which get embedded as html.
      The function specified for "props" should return a list of Objects [{name: n, value: v, color: c}].
      prop = {                                      | props = {
      datum: (html|string|function),                |   data: (List of Objs(name, value)|Object|function),
                                                    |   keys: (list),
      icon: (null|circle|square|rounded-square),    |   icon: (null|circle|square|rounded-square|list|function),
      iconColor: (color|function),                  |   iconColor: (color|function),
    }                                               |}                                                          */
    let prop, props, propDiv, propIcon, propDatum;

    let tipDiv = d3.select('.tooltip');

    let tip = function (selection) {
        tipDiv.attr('class', `tooltip ${tipstyle}`);
        tipDiv.selectAll('*').remove();

        if (header) {
            headerDiv = tipDiv.append('div').attr('class', 'tip header');
            if (header.icon) {
                headerIcon = headerDiv.append('span').attr('class', `tip icon ${header.icon}`);
            }
            headerDatum = headerDiv.append('span').attr('class', 'tip headerDatum');
            if (prop || props) {
                tipDiv.append('hr').attr('class', 'tip divider').attr('size', 1);
            }
        }

        if (prop) {
            propDiv = tipDiv.append('div').attr('class', 'tip prop');
            if (prop.icon) {
                propIcon = propDiv.append('span').attr('class', `tip icon ${prop.icon}`);
            }
            propDatum = propDiv.append('span').attr('class', 'tip propDatum');
        }

        selection.on('mouseover', function (d, i) {
            let datum = d;
            let index = i;
            let x = event.clientX;
            let y = event.clientY;

            if (header) {
                if (typeof header.datum === 'function') {
                    headerDatum.html(header.datum(d));
                } else if (typeof header.datum === 'string') {
                    headerDatum.html(header.datum);
                }
                if (header.icon && header.iconColor) {
                    if (typeof header.iconColor === 'function') {
                        headerIcon.style('background-color', header.iconColor(d));
                    } else if (typeof header.iconColor === 'string') {
                        headerIcon.style('background-color', d[iconColor]);
                    }
                }
            }

            if (prop) {
                if (typeof prop.datum === 'function') {
                    propDatum.html(prop.datum(d));
                } else if (typeof propDatum === 'string') {
                    propDatum.html(prop.datum);
                }
                if (prop.icon && prop.iconColor) {
                    if (typeof prop.iconColor === 'function') {
                        propIcon.style('background-color', prop.iconColor(d));
                    } else if (typeof prop.iconColor === 'string') {
                        propIcon.style('background-color', d[iconColor]);
                    }
                }
            } else if (props) {
                let propsData = [];
                if (typeof props.data === 'object') {
                    for (let d in props.data) {
                        propsData.push({ name: d, value: props.data[d] });
                    }
                } else if (props.data.constructor === Array) {
                    propsData = props.data;
                } else if (typeof props.data === 'function') {
                    propsData = props.data(datum);
                }

                propDiv = tipDiv.selectAll('.prop').data(propsData).enter().append('div').attr('class', 'tip prop');
                if (props.icon) {
                    propIcon = propDiv.append('span').attr('class', `tip icon ${props.icon}`).style('background-color', function (d) {
                        return d.color;
                    });
                }
                propDatum = propDiv.append('span').attr('class', 'tip propDatum').html(function (d) {
                    return `${d.name}: ${d.value}`;
                });
            }
        }).on('mousemove', function () {
            let x = event.clientX;
            let y = event.clientY;
            tipDiv.style('display', 'inline').style('left', `${x + xOffset}px`).style('top', `${y + yOffset}px`);
        }).on('mouseout', function () {
            tipDiv.style('display', 'none');
        });
    };

    tip.prop = function (_) {
        if (!arguments.length) return prop;
        prop = _;
        return tip;
    };

    tip.header = function (_) {
        if (!arguments.length) return header;
        header = _;
        return tip;
    };

    tip.props = function (_) {
        if (!arguments.length) return props;
        props = _;
        return tip;
    };

    tip.tipstyle = function (_) {
        if (!arguments.length) return tipstyle;
        tipstyle = _;
        return tip;
    };

    tip.xOffset = function (_) {
        if (!arguments.length) return xOffset;
        xOffset = _;
        return tip;
    };

    tip.yOffset = function (_) {
        if (!arguments.length) return yOffset;
        yOffset = _;
        return tip;
    };

    return tip;
};



/***/ })
/******/ ]);
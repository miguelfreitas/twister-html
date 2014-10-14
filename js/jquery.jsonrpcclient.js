/**
 * JsonRpcClient
 *
 * A JSON RPC Client that uses WebSockets if available otherwise fallbacks to ajax.
 * Depends on JSON, if browser lacks native support either use JSON3 or jquery.json.
 * Usage example:
 *
 *   var foo = new $.JsonRpcClient({ ajaxUrl: '/backend/jsonrpc' });
 *   foo.call(
 *     'bar', [ 'A parameter', 'B parameter' ],
 *     function(result) { alert('Foo bar answered: ' + result.my_answer); },
 *     function(error)  { console.log('There was an error', error); }
 *   );
 *
 * More examples are available in README.md
 */
(function($) {

  /**
   * @fn new
   * @memberof JsonRpcClient
   *
   * @param {object} options An object stating the backends:
   *                ajaxUrl    A url (relative or absolute) to a http(s) backend.
   *                headers    An object that will be passed along to $.ajax in options.headers
   *                xhrFields  An object that will be passed along to $.ajax in options.xhrFields
   *                socketUrl  A url (relative of absolute) to a ws(s) backend.
   *                onmessage  A socket message handler for other messages (non-responses).
   *                onopen     A socket onopen handler. (Not used for custom getSocket.)
   *                onclose    A socket onclose handler. (Not used for custom getSocket.)
   *                onerror    A socket onerror handler. (Not used for custom getSocket.)
   *                getSocket  A function returning a WebSocket or null.
   *                           It must take an onmessage_cb and bind it to the onmessage event
   *                           (or chain it before/after some other onmessage handler).
   *                           Or, it could return null if no socket is available.
   *                           The returned instance must have readyState <= 1, and if less than 1,
   *                           react to onopen binding.
   */
  var JsonRpcClient = function(options) {
    var self = this;
    var noop = function() {};
    this.options = $.extend({
      ajaxUrl     : null,
      headers     : {},   ///< Optional additional headers to send in $.ajax request.
      socketUrl   : null, ///< WebSocket URL. (Not used if a custom getSocket is supplied.)
      onmessage   : noop, ///< Optional onmessage-handler for WebSocket.
      onopen      : noop, ///< Optional onopen-handler for WebSocket.
      onclose     : noop, ///< Optional onclose-handler for WebSocket.
      onerror     : noop, ///< Optional onerror-handler for WebSocket.
      /// Custom socket supplier for using an already existing socket
      getSocket   : function (onmessageCb) { return self._getSocket(onmessageCb); }
    }, options);

    // Declare an instance version of the onmessage callback to wrap 'this'.
    this.wsOnMessage = function(event) { self._wsOnMessage(event); };

    // queue for ws request sent *before* ws is open.
    this._wsRequestQueue = [];

    if (!window.JSON && $ && $.toJSON) {
      this.JSON = {
        stringify: $.toJSON,
        parse: $.parseJSON
      };
    } else {
      this.JSON = JSON;
    }

  };

  /// Holding the WebSocket on default getsocket.
  JsonRpcClient.prototype._wsSocket = null;

  /// Object <id>: { successCb: cb, errorCb: cb }
  JsonRpcClient.prototype._wsCallbacks = {};

  /// The next JSON-RPC request id.
  JsonRpcClient.prototype._currentId = 1;

  /**
   * @fn call
   * @memberof JsonRpcClient
   *
   * @param {string}       method     The method to run on JSON-RPC server.
   * @param {object|array} params     The params; an array or object.
   * @param {function}     successCb  A callback for successful request.
   * @param {function}     errorCb    A callback for error.
   *
   * @return {object} Returns the deferred object that $.ajax returns or {null} for websockets
   */
  JsonRpcClient.prototype.call = function(method, params, successCb, errorCb) {
    successCb = typeof successCb === 'function' ? successCb : function() {};
    errorCb   = typeof errorCb   === 'function' ? errorCb   : function() {};

    // Construct the JSON-RPC 2.0 request.
    var request = {
      jsonrpc : '2.0',
      method  : method,
      params  : params,
      id      : this._currentId++  // Increase the id counter to match request/response
    };

    // Try making a WebSocket call.
    var socket = this.options.getSocket(this.wsOnMessage);
    if (socket !== null) {
      this._wsCall(socket, request, successCb, errorCb);
      return null;
    }

    // No WebSocket, and no HTTP backend?  This won't work.
    if (this.options.ajaxUrl === null) {
      throw 'JsonRpcClient.call used with no websocket and no http endpoint.';
    }

    var self = this;

    var deferred = $.ajax({
      type       : 'POST',
      url        : this.options.ajaxUrl,
      contentType: 'application/json',
      data       : this.JSON.stringify(request),
      dataType   : 'json',
      cache      : false,
      headers    : this.options.headers,
      xhrFields  : this.options.xhrFields,

      success    : function(data) {
        if ('error' in data) {
          errorCb(data.error);
        } else {
          successCb(data.result);
        }
      },

      // JSON-RPC Server could return non-200 on error
      error    : function(jqXHR, textStatus, errorThrown) {
        try {
          var response = self.JSON.parse(jqXHR.responseText);
          if ('console' in window) { console.log(response); }

          errorCb(response.error);
        }
        catch (err) {
          // Perhaps the responseText wasn't really a jsonrpc-error.
          errorCb({error: jqXHR.responseText});
        }
      }
    });

    return deferred;
  };

  /**
   * Notify sends a command to the server that won't need a response.  In http, there is probably
   * an empty response - that will be dropped, but in ws there should be no response at all.
   *
   * This is very similar to call, but has no id and no handling of callbacks.
   *
   * @fn notify
   * @memberof JsonRpcClient
   *
   * @param {string} method       The method to run on JSON-RPC server.
   * @param {object|array} params The params; an array or object.
   *
   * @return {object} Returns the deferred object that $.ajax returns or {null} for websockets
   */
  JsonRpcClient.prototype.notify = function(method, params) {
    // Construct the JSON-RPC 2.0 request.
    var request = {
      jsonrpc: '2.0',
      method:  method,
      params:  params
    };

    // Try making a WebSocket call.
    var socket = this.options.getSocket(this.wsOnMessage);
    if (socket !== null) {
      this._wsCall(socket, request);
      return null;
    }

    // No WebSocket, and no HTTP backend?  This won't work.
    if (this.options.ajaxUrl === null) {
      throw 'JsonRpcClient.notify used with no websocket and no http endpoint.';
    }

    var deferred = $.ajax({
      type       : 'POST',
      url        : this.options.ajaxUrl,
      contentType: 'application/json',
      data       : this.JSON.stringify(request),
      dataType   : 'json',
      cache      : false,
      headers    : this.options.headers,
      xhrFields  : this.options.xhrFields
    });

    return deferred;
  };

  /**
   * Make a batch-call by using a callback.
   *
   * The callback will get an object "batch" as only argument.  On batch, you can call the methods
   * "call" and "notify" just as if it was a normal JsonRpcClient object, and all calls will be
   * sent as a batch call then the callback is done.
   *
   * @fn batch
   * @memberof JsonRpcClient
   *
   * @param {function} callback   This function will get a batch handler to run call and notify on.
   * @param {function} allDoneCb  A callback function to call after all results have been handled.
   * @param {function} errorCb    A callback function to call if there is an error from the server.
   *                    Note, that batch calls should always get an overall success, and the
   *                    only error
   */
  JsonRpcClient.prototype.batch = function(callback, allDoneCb, errorCb) {
    var batch = new JsonRpcClient._batchObject(this, allDoneCb, errorCb);
    callback(batch);
    batch._execute();
  };

  /**
   * The default getSocket handler.
   *
   * @param {function} onmessageCb The callback to be bound to onmessage events on the socket.
   *
   * @fn _getSocket
   * @memberof JsonRpcClient
   */
  JsonRpcClient.prototype._getSocket = function(onmessageCb) {
    // If there is no ws url set, we don't have a socket.
    // Likewise, if there is no window.WebSocket.
    if (this.options.socketUrl === null || !('WebSocket' in window)) { return null; }

    if (this._wsSocket === null || this._wsSocket.readyState > 1) {
      // No socket, or dying socket, let's get a new one.
      this._wsSocket = new WebSocket(this.options.socketUrl);

      // Set up onmessage handler.
      this._wsSocket.onmessage = onmessageCb;

      // Set up onclose handler.
      this._wsSocket.onclose = this.options.onclose;

      // Set up onerror handler.
      this._wsSocket.onerror = this.options.onerror;
    }

    return this._wsSocket;
  };

  /**
   * Internal handler to dispatch a JRON-RPC request through a websocket.
   *
   * @fn _wsCall
   * @memberof JsonRpcClient
   */
  JsonRpcClient.prototype._wsCall = function(socket, request, successCb, errorCb) {
    var requestJson = this.JSON.stringify(request);

    if (socket.readyState < 1) {

      // Queue request
      this._wsRequestQueue.push(requestJson);

      if (!socket.onopen) {
        // The websocket is not open yet; we have to set sending of the message in onopen.
        var self = this; // In closure below, this is set to the WebSocket.  Use self instead.

        // Set up sending of message for when the socket is open.
        socket.onopen = function(event) {
          // Hook for extra onopen callback
          self.options.onopen(event);

          // Send queued requests.
          for (var i = 0; i < self._wsRequestQueue.length; i++) {
            socket.send(self._wsRequestQueue[i]);
          }
          self._wsRequestQueue = [];
        };
      }
    } else {
      // We have a socket and it should be ready to send on.
      socket.send(requestJson);
    }

    // Setup callbacks.  If there is an id, this is a call and not a notify.
    if ('id' in request && typeof successCb !== 'undefined') {
      this._wsCallbacks[request.id] = {successCb: successCb, errorCb: errorCb};
    }
  };

  /**
   * Internal handler for the websocket messages.  It determines if the message is a JSON-RPC
   * response, and if so, tries to couple it with a given callback.  Otherwise, it falls back to
   * given external onmessage-handler, if any.
   *
   * @param {event} event The websocket onmessage-event.
   */
  JsonRpcClient.prototype._wsOnMessage = function(event) {

    // Check if this could be a JSON RPC message.
    var response;
    try {
      response = this.JSON.parse(event.data);
    } catch (err) {
      this.options.onmessage(event);
      return;
    }

    /// @todo Make using the jsonrcp 2.0 check optional, to use this on JSON-RPC 1 backends.
    if (typeof response === 'object' && response.jsonrpc === '2.0') {

      /// @todo Handle bad response (without id).

      // If this is an object with result, it is a response.
      if ('result' in response && this._wsCallbacks[response.id]) {
        // Get the success callback.
        var successCb = this._wsCallbacks[response.id].successCb;

        // Delete the callback from the storage.
        delete this._wsCallbacks[response.id];

        // Run callback with result as parameter.
        successCb(response.result);
        return;
      }

      // If this is an object with error, it is an error response.
      else if ('error' in response && this._wsCallbacks[response.id]) {
        // Get the error callback.
        var errorCb = this._wsCallbacks[response.id].errorCb;

        // Delete the callback from the storage.
        delete this._wsCallbacks[response.id];

        // Run callback with the error object as parameter.
        errorCb(response.error);
        return;
      }
    }

    // If we get here it's an invalid JSON-RPC response, pass to fallback message handler.
    this.options.onmessage(event);
  };

  /************************************************************************************************
   * Batch object with methods
   ************************************************************************************************/

  /**
   * Handling object for batch calls.
   */
  JsonRpcClient._batchObject = function(jsonrpcclient, allDoneCb, errorCb) {
    // Array of objects to hold the call and notify requests.  Each objects will have the request
    // object, and unless it is a notify, successCb and errorCb.
    this._requests   = [];

    this.jsonrpcclient = jsonrpcclient;
    this.allDoneCb = allDoneCb;
    this.errorCb    = typeof errorCb    === 'function' ? errorCb : function() {};
  };

  /**
   * @sa JsonRpcClient.prototype.call
   */
  JsonRpcClient._batchObject.prototype.call = function(method, params, successCb, errorCb) {
    this._requests.push({
      request    : {
        jsonrpc : '2.0',
        method  : method,
        params  : params,
        id      : this.jsonrpcclient._currentId++  // Use the client's id series.
      },
      successCb : successCb,
      errorCb   : errorCb
    });
  };

  /**
   * @sa JsonRpcClient.prototype.notify
   */
  JsonRpcClient._batchObject.prototype.notify = function(method, params) {
    this._requests.push({
      request    : {
        jsonrpc : '2.0',
        method  : method,
        params  : params
      }
    });
  };

  /**
   * Executes the batched up calls.
   *
   * @return {object} Returns the deferred object that $.ajax returns or {null} for websockets
   */
  JsonRpcClient._batchObject.prototype._execute = function() {
    var self = this;
    var deferred = null; // Used to store and return the deffered that $.ajax returns

    if (this._requests.length === 0) { return; } // All done :P

    // Collect all request data and sort handlers by request id.
    var batchRequest = [];

    // If we have a WebSocket, just send the requests individually like normal calls.
    var socket = self.jsonrpcclient.options.getSocket(self.jsonrpcclient.wsOnMessage);

    if (socket !== null) {
      // We need to keep track of results for the all done callback
      var expectedNrOfCb = 0;
      var cbResults = [];

      var wrapCb = function(cb) {
        if (!self.allDoneCb) { // No all done callback? no need to keep track
          return cb;
        }

        return function(data) {
          cb(data);
          cbResults.push(data);
          expectedNrOfCb--;
          if (expectedNrOfCb <= 0) {
            // Change order so that it maps to request order
            var i;
            var resultMap = {};
            for (i = 0; i < cbResults.length; i++) {
              resultMap[cbResults[i].id] = cbResults[i];
            }
            var results = [];
            for (i = 0; i < self._requests.length; i++) {
              if (resultMap[self._requests[i].id]) {
                results.push(resultMap[self._requests[i].id]);
              }
            }
            // Call all done!
            self.allDoneCb(results);
          }
        };
      };

      for (var i = 0; i < this._requests.length; i++) {
        var call = this._requests[i];

        if ('id' in call.request) {
          // We expect an answer
          expectedNrOfCb++;
        }

        self.jsonrpcclient._wsCall(
          socket, call.request, wrapCb(call.successCb), wrapCb(call.errorCb)
        );
      }

      return null;
    } else {
      // No websocket, let's use ajax
      var handlers = {};

      for (var i = 0; i < this._requests.length; i++) {
        var call = this._requests[i];
        batchRequest.push(call.request);

        // If the request has an id, it should handle returns (otherwise it's a notify).
        if ('id' in call.request) {
          handlers[call.request.id] = {
            successCb : call.successCb,
            errorCb   : call.errorCb
          };
        }
      }

      var successCb = function(data) { self._batchCb(data, handlers, self.allDoneCb); };

      // No WebSocket, and no HTTP backend?  This won't work.
      if (self.jsonrpcclient.options.ajaxUrl === null) {
        throw 'JsonRpcClient.batch used with no websocket and no http endpoint.';
      }

      // Send request
      deferred = $.ajax({
        url        : self.jsonrpcclient.options.ajaxUrl,
        contentType: 'application/json',
        data       : this.jsonrpcclient.JSON.stringify(batchRequest),
        dataType   : 'json',
        cache      : false,
        type       : 'POST',
        headers    : self.jsonrpcclient.options.headers,
        xhrFields  : self.jsonrpcclient.options.xhrFields,

        // Batch-requests should always return 200
        error    : function(jqXHR, textStatus, errorThrown) {
          self.errorCb(jqXHR, textStatus, errorThrown);
        },
        success  : successCb
      });

      return deferred;

    }

  };

  /**
   * Internal helper to match the result array from a batch call to their respective callbacks.
   *
   * @fn _batchCb
   * @memberof JsonRpcClient
   */
  JsonRpcClient._batchObject.prototype._batchCb = function(result, handlers, allDoneCb) {
    for (var i = 0; i < result.length; i++) {
      var response = result[i];

      // Handle error
      if ('error' in response) {
        if (response.id === null || !(response.id in handlers)) {
          // An error on a notify?  Just log it to the console.
          if ('console' in window) { console.log(response); }
        } else {
          handlers[response.id].errorCb(response.error);
        }
      } else {
        // Here we should always have a correct id and no error.
        if (!(response.id in handlers) && 'console' in window) {
          console.log(response);
        } else {
          handlers[response.id].successCb(response.result);
        }
      }
    }

    if (typeof allDoneCb === 'function') { allDoneCb(result); }
  };

  $.JsonRpcClient = JsonRpcClient;

})(this.jQuery);

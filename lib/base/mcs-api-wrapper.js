'use strict'

const EventEmitter = require('events').EventEmitter;
const Logger = require('../logger.js');
const MCS = require('mcs-js');
const C = require('../constants.js');
const LOG_PREFIX = '[eavesdropper-mcs-wrapper]';

let instance = null;

module.exports = class MCSAPIWrapper extends EventEmitter {
  constructor() {
    if(!instance) {
      super();
      this._mcs = null;
      instance = this;
      this._reconnectionRoutine = null;
    }

    return instance;
  }

  async start (address) {
    this.addr = address;
    return new Promise((resolve, reject) => {
      try {
        Logger.info(LOG_PREFIX, "Connecting to MCS at", this.addr);
        this._mcs = new MCS(this.addr);
        this._monitorConnectionState();
        this._connectionResolver = resolve;
      } catch(error) {
        Logger.warn('[sfu-mcs-api]', err);
        resolve();
      }
    })
  }

  _monitorConnectionState () {
    this._mcs.on('open', this._onOpen.bind(this));
    this._mcs.on('close', this._onDisconnection.bind(this));
    this._mcs.on('error', this._onDisconnection.bind(this));

    this._mcs.on(C.MEDIA_STATE, (args) => {
      Logger.info(LOG_PREFIX, "Received media state event", args);
      const { mediaId, state } = args;
      this.emit(C.MEDIA_STATE, { mediaId, state });
    });

    this._mcs.on(C.MEDIA_STATE_ICE, (args) => {
      Logger.info(LOG_PREFIX, "Received onIceCandidate event", args);
      const { mediaId, candidate } = args;
      this.emit(C.MEDIA_STATE_ICE, { mediaId, candidate });
    });
  }

  // Mish mash of Angular's injection annotation code adapted to ES6
  annotate (fn) {
    const FN_ARGS = /^\s*[^\(]*\(\s*([^\)]*)\)/m;
    const FN_ARG_SPLIT = /,/;
    const FN_ARG = /^\s*(_?)(.+?)\1\s*$/;
    const STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;

    let $inject,
      fnText,
      argDecl,
      last;

    if (typeof fn == 'function') {
      if (!($inject = fn.$inject)) {
        $inject = [];
        fnText = fn.toString().replace(STRIP_COMMENTS, '');
        argDecl = fnText.match(FN_ARGS);
        argDecl? argDecl[1].split(FN_ARG_SPLIT).forEach(function(arg){
          arg.replace(FN_ARG, function(all, underscore, name){
            $inject.push(name);
          });
        }) : null;
        fn.$inject = $inject;
      }
    }

    return $inject;
  }

  _getFunctionPropsAndArgs (obj) {
    let props = [];
    do {
      let intermediateProps = Object.getOwnPropertyNames(obj);
      intermediateProps = intermediateProps
        .filter(p => typeof obj[p] === 'function')
        .map(p => [p, this.annotate(obj[p])]);
      props = props.concat(intermediateProps);
    } while (obj = Object.getPrototypeOf(obj));

    return props;
  }

  _onOpen () {
    Logger.info(LOG_PREFIX, "Connected to MCS");
    this.methods = this._getFunctionPropsAndArgs(this._mcs);
    if (this._reconnectionRoutine) {
      clearInterval(this._reconnectionRoutine);
      this._reconnectionRoutine = null;
    }

    this.emit(C.MCS_CONNECTED);

    this._connectionResolver();
  }

  async _onDisconnection () {
    // TODO base reconenction, should be ane exponential backoff
    if (this._reconnectionRoutine == null) {
      this.emit(C.MCS_DISCONNECTED);
      this._reconnectionRoutine = setInterval(async () => {
        try {
          Logger.info(LOG_PREFIX, "Connecting to MCS at", this.addr);
          this._mcs = new MCS(this.addr);
          this._monitorConnectionState()
        } catch (err) {
          Logger.warn(LOG_PREFIX, "Failed to reconnect to MCS]");
          delete this._mcs;
        }
      }, 2000);
    }
  }

  async join (room, type, params) {
    try {
      const { user_id } = await this._mcs.join(room, type, params);
      return user_id;
    }
    catch (error) {
      throw (this._handleError(error, 'join', { room, type, params}));
    }
  }

  async leave (room, user) {
    try {
      const answer = await this._mcs.leave(user, room);
      //const answer = await this._mediaController.leave(room, user);
      return (answer);
    }
    catch (error) {
      throw (this._handleError(error, 'leave', { room, user }));
    }
  }

  async publishnsubscribe (room, user, sourceId, type, params) {
    try {
      const answer = await this._mcs.publishAndSubscribe(room, user, sourceId, type, params);
      //const answer = await this._mediaController.publishnsubscribe(user, sourceId, sdp, params);
      return (answer);
    }
    catch (error) {
      throw (this._handleError(error, 'publishnsubscribe', { room, user, sourceId, type, params }));
    }
  }

  async publish (user, room,  type, params) {
    try {
      const { mediaId, descriptor } = await this._mcs.publish(user, room, type, params);
      return  { mediaId, answer: descriptor };
    }
    catch (error) {
      throw (this._handleError(error, 'publish', { user, room, type, params }));
    }
  }

  async unpublish (user, mediaId) {
    try {
      await this._mcs.unpublish(mediaId);
      //await this._mediaController.unpublish(mediaId);
      return ;
    }
    catch (error) {
      throw (this._handleError(error, 'unpublish', { user, mediaId }));
    }
  }

  async subscribe (user, sourceId, type, params) {
    try {
      const { mediaId, descriptor } = await this._mcs.subscribe(user, sourceId, type, params);
      return { mediaId, answer: descriptor };
    }
    catch (error) {
      throw (this._handleError(error, 'subscribe', { user, sourceId, type, params }));
    }
  }

  async unsubscribe (user, mediaId) {
    try {
      await this._mcs.unsubscribe(user, mediaId);
      //await this._mediaController.unsubscribe(user, mediaId);
      return ;
    }
    catch (error) {
      throw (this._handleError(error, 'unsubscribe', { user, mediaId }));
    }
  }

  async startRecording(userId, mediaId, recordingPath) {
    try {
      const answer = await this._mcs.startRecording(userId, mediaId, recordingPath);
      return (answer);
    }
    catch (error) {
      throw (this._handleError(error, 'startRecording', { userId, mediaId, recordingPath}));
    }
  }

  async stopRecording(userId, recId) {
    try {
      const answer = await this._mcs.stopRecording(userId, recId);
      return (answer);
    }
    catch (error) {
      throw (this._handleError(error, 'stopRecording', { userId, recId }));
    }
  }

  async connect (source, sinks, type = 'ALL') {
    try {
      await this._mcs.connect(source, sinks, type);
    }
    catch (error) {
      throw (this._handleError(error, 'connect', { source, sinks, type }));
    }
  }

  async disconnect (source, sinks, type = 'ALL') {
    try {
      await this._mcs.disconnect(source, sinks, type);
    }
    catch (error) {
      throw (this._handleError(error, 'disconnect', { source, sink, type }));
    }
  }

  async onEvent (eventName, identifier, callback) {
    try {
      this._mcs.onEvent(eventName, identifier, callback);
    }
    catch (error) {
      throw (this._handleError(error, 'onEvent', { ...arguments }));
    }
  }

  async addIceCandidate (mediaId, candidate) {
    try {
      const ack = await this._mcs.addIceCandidate(mediaId, candidate);
      return ;
    }
    catch (error) {
      throw (this._handleError(error, 'addIceCandidate', { mediaId, candidate }));
    }
  }

  async getUsers (roomId) {
    try {
      const { users } = await this._mcs.getUsers(roomId);
      return users;
    }
    catch (error) {
      throw (this._handleError(error, 'getUsers', { roomId }));
    }
  }

  async getUserMedias (userId) {
    try {
      const { medias } = await this._mcs.getUserMedias(userId);
      return medias;
    }
    catch (error) {
      throw (this._handleError(error, 'getUserMedias', { userId }));
    }
  }

  async getRooms () {
    try {
      const { rooms } = await this._mcs.getRooms();
      return rooms;
    }
    catch (error) {
      throw (this._handleError(error, 'getRooms', {}));
    }
  }

  setStrategy (strategy) {
    // TODO
  }

  _handleError (error, operation, params) {
    const { code, message, details, stack } = error;
    const response = { type: 'error', code, message, details, stack, operation, params };
    Logger.error("[mcs-api] Reject operation", response.operation, "with", { error: response });

    return response;
  }
}

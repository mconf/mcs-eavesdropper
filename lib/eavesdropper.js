/*
 * Paulo Lanzarin @prlanzarin
 * (C) Copyright 2018 Mconf Tecnologia
 */

'use strict';

const C = require('./constants.js');
const LOG_PREFIX = '[eavesdropper]';
const Logger = require('./logger.js');
const errors = require('./base/errors');
const MCS = require('./base/mcs-api-wrapper.js');
const MCS_ADDRESS = process.env.MCS_ADDRESS;
const yargs = require('yargs');

if (MCS_ADDRESS == null) {
  Logger.error("The MCS_ADDRESS env variable was not specified, congratulations!");
  process.exit(1);
}

module.exports = class Eavesdropper {
  constructor () {
    this.mappedConferences = [];
    this.connectedMedias = [];
    this.mcs = new MCS();
    this.mcsStarted = false;
  }

  async start() {
    try {
      if (!this.mcsStarted) {
        await this.mcs.start(MCS_ADDRESS);
        const methods = this.mcs.methods;
        methods.forEach(m => {
          yargs.command(m[0], m[0], (ya) => {
            m[1].forEach(a => ya.option(a));
            return ya;
          },
            async (args) => {
              let fa = Object.keys(args).map(k => {
                if (m[1].find(a => a === k)) {
                  return args[k].toString();
                } else {
                  return null;
                }
              }).filter(fac => fac);
              console.log(`Arguments: ${JSON.stringify(fa, null, 2)}`);
              const ret = await this.execute(m[0], fa);
              console.log(`Response: ${JSON.stringify(ret, null, 2)}`);
              return;
            }
          );
        });
        yargs
          .usage('Usage: $0 <command> [options]')
          .help('h')
          .alias('h', 'help')

        this.argv = yargs.argv;

        this.mcsStarted = true;
        this._upstartMCSListeners();
      }
    }
    catch (error) {
      Logger.error(LOG_PREFIX, 'Could not start manager', error);
      throw new Error(error);
    }
  }

  execute (fn, args) {
    return this.mcs._mcs[fn](...args);
  }

  _onMCSReconnection () {
    // Clean everything and wait for a reconnect
    this.mappedConferences = [];
    this.connectedMedias = [];
    this.webconfCandidates = [];
    this.connectedExternalEndpoints = [];
    this.videoFloorLists = {};
    this.contentBearers = [];

    this.mcs.once(C.MCS_CONNECTED, this._upstartMCSListeners.bind(this));
  }

  _upstartMCSListeners () {
    this.mcs.once(C.MCS_DISCONNECTED, this._onMCSReconnection.bind(this));

    this.mcs.onEvent("roomCreated", "all", this._handleRoomCreated.bind(this));
    this.mcs.getRooms().then((rooms) => {
      rooms.forEach((r) => {
        this._handleRoomCreated({room: r});
      });
    });
  }
  /* ===========================> State management <========================= */

  async _getConferenceMedias (voiceConf) {
    if (!this._roomExists(voiceConf)) {
      return [];
    }

    try {
      const conferenceUsers = await this.mcs.getUsers(voiceConf);
      return this._fetchMediasFromUsers(conferenceUsers);
    } catch (e) {
      // The room probably ceased to exist, so there are no medias for it
      return [];
    }
  }

  async _fetchMediasFromUsers (users) {
    return users.reduce((a, u) => a.concat(u.mediasList), []);
  };

  _fetchRoom (roomId) {
    return this.mappedConferences.find(r => r === roomId);
  }

  _roomExists (roomId) {
    return this.mappedConferences.some(r => r === roomId);
  }

  _addToMappedConferences (roomId) {
    this._removeFromMappedConferences(roomId);
    this.mappedConferences.push(roomId);
  }

  _removeFromMappedConferences (roomId) {
    this.mappedConferences = this.mappedConferences.filter(r => r!== roomId);
  }

  /* =======================> User and Room triggers <======================= */

  async _handleRoomDestroyed (event) {
    const { roomId } = event;
    Logger.info(LOG_PREFIX, "MCS room destroyed", roomId);
    this._removeFromMappedConferences(roomId);
  };

  async _handleRoomCreated (event) {
    const { room } = event;
    if (!this._roomExists(room)) {
      this._addToMappedConferences(room);
      Logger.info(LOG_PREFIX, "MCS room created", event);
      this.mcs.onEvent("roomDestroyed", room, this._handleRoomDestroyed.bind(this));
      this.mcs.onEvent("userJoined", room, this._handleUserJoined.bind(this));
      this.mcs.onEvent("userLeft", room, this._handleUserLeft.bind(this));
      this.mcs.onEvent("mediaConnected", room, this._handleMediaConnected.bind(this));
      this.mcs.onEvent("contentFloorChanged", room, this._handleContentFloorChanged.bind(this));
      const users = await this.mcs.getUsers(room);
      users.forEach((u) => {
        this._handleUserJoined(u);
      });

      const medias = await this._fetchMediasFromUsers(users);
      medias.forEach((m) => {
        this._handleMediaConnected(m);
      });
    }
  }

  _handleUserJoined (event) {
    const { userId, roomId } = event;
    Logger.info(LOG_PREFIX, "Media stack user", userId, "joined room", roomId);
  }

  _handleUserLeft (event) {
    const { userId, roomId } = event;
    Logger.info(LOG_PREFIX, "Media stack user", userId, "left room", roomId);
  }

  /* ===========================> Media triggers <=========================== */

  _handleMediaConnected (event) {
    let media = event.media? event.media : event;
    const { mediaId, medias, roomId, customIdentifier, name } = media;

    this.mcs.onEvent("mediaDisconnected", mediaId, this._handleMediaDisconnected.bind(this));
  }

  _handleMediaDisconnected (event) {
    const { roomId, mediaId } = event;
    Logger.info(LOG_PREFIX, "Media disconnected", { roomId }, { mediaId });
  }

  /* ==========================> Content triggers <========================== */

  _handleContentFloorChanged (event) {
    const { roomId, floor, previousFloor } = event;
    const { mediaId, userId, customIdentifier } = floor;

    Logger.info(LOG_PREFIX, "Content floor changed", roomId, mediaId, userId, event);
  }
}

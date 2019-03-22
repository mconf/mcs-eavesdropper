"use strict";

/**
 * @classdesc
 * Message constants for the communication with BigBlueButton
 * @constructor
 */
  function Constants () {
    return {
        // Media elements
        WEBRTC: "WebRtcEndpoint",
        RTP: "RtpEndpoint",
        AUDIO: "AUDIO",
        VIDEO: "VIDEO",
        ALL: "ALL",

        // SFU app types
        SCREENSHARE_APP:  'screenshare',
        VIDEO_APP: 'video',
        AUDIO_APP: 'audio',
        PHONE_APP: 'phone',

        // SFU requisition roles
        SEND_ROLE: 'send',
        RECV_ROLE: 'recv',
        SEND_RECV_ROLE: 'sendrecv',

        // Redis channels
        TO_BBB_MEETING_CHAN: "bigbluebutton:to-bbb-apps:meeting",
        FROM_BBB_MEETING_CHAN: "bigbluebutton:from-bbb-apps:meeting",
        TO_AKKA_APPS_CHAN_2x: "to-akka-apps-redis-channel",

        // RedisWrapper events
        REDIS_MESSAGE : "redis_message",
        GATEWAY_MESSAGE: "gateway_message",

        RECORDING_STATUS_REQUEST_MESSAGE_2x: "GetRecordingStatusReqMsg",
        RECORDING_STATUS_REPLY_MESSAGE_2x: "GetRecordingStatusRespMsg",
        START_WEBRTC_SHARE_EVENT_2x: "StartWebRTCShareEvent",
        STOP_WEBRTC_SHARE_EVENT_2x: "StopWebRTCShareEvent",
        PRESENTER_ASSIGNED_EVT_MSG: "PresenterAssignedEvtMsg",
        MEETING_CREATED_EVT_MSG: "MeetingCreatedEvtMsg",
        MEETING_DESTROYED_EVT_MSG: "MeetingDestroyedEvtMsg",

        // Outbound dial messages
        DIAL_START: "DialStartReqMsg",
        DIAL_START_REPLY: "DialStartRespMsg",
        HANGUP_DIAL: "HangupDialReqMsg",
        HANGUP_DIAL_REPLY: "HangupDialRespMsg",
        DIAL_STATE_CHANGED: "DialStateChangedMsg",

        //Message identifiers 2x
        SCREENSHARE_RTMP_BROADCAST_STARTED_2x: "ScreenshareRtmpBroadcastStartedVoiceConfEvtMsg",
        SCREENSHARE_RTMP_BROADCAST_STOPPED_2x: "ScreenshareRtmpBroadcastStoppedVoiceConfEvtMsg",
        DICONNECT_ALL_USERS_2x: "DisconnectAllClientsSysMsg",
        STREAM_IS_RECORDED: "StreamIsRecordedMsg",
        START_WEBCAM_SHARE: "StartWebRTCShareEvent",
        STOP_WEBCAM_SHARE: "StopWebRTCShareEvent",
        USER_JOINED_MESSAGE_2x: "UserJoinedVoiceConfToClientEvtMsg",
        USER_JOINED_VOICE_CONF: "USER_JOINED_IN_VOICE_CONF",
        USER_CAM_BROADCAST_STARTED_2x: "UserBroadcastCamStartMsg",
        USER_BROADCAST_CAM_STOPPED_2x: "UserBroadcastCamStopMsg",
        VIDEO_FLOOR_CHANGED: "VideoFloorChangedEvtMsg",
        ASSIGN_PRESENTER_REQ_MSG: "AssignPresenterReqMsg",

        // Redis messages fields
        USER_ID_2x : "userId",
        MEETING_ID_2x: "meetingId",
        VOICE_BRIDGE: "voiceBridge",
        DESTINATION: "destination",
        CALL_ID: "callId",
        DIAL_STATE: "dialState",

        // Akka Apps 2x
        REQUESTED_BY: "requestedBy",
        NEW_PRESENTER_ID: "newPresenterId",
        NEW_PRESENTER_NAME: "newPresenterName",
        ASSIGNED_BY: "assignedBy",
        REQUESTER_ID: "requesterId",

        //  Screenshare 2x
        CONFERENCE_NAME: "voiceConf",
        SCREENSHARE_CONF: "screenshareConf",
        STREAM_URL: "stream",
        TIMESTAMP: "timestamp",
        VIDEO_WIDTH: "vidWidth",
        VIDEO_HEIGHT: "vidHeight",

        // RTP params
        MEETING_ID : "meeting_id",
        VOICE_CONF : "voice_conf",
        KURENTO_ENDPOINT_ID : "kurento_endpoint_id",
        PARAMS : "params",
        MEDIA_DESCRIPTION: "media_description",
        LOCAL_IP_ADDRESS: "local_ip_address",
        LOCAL_VIDEO_PORT: "local_video_port",
        DESTINATION_IP_ADDRESS : "destination_ip_address",
        DESTINATION_VIDEO_PORT : "destination_video_port",
        REMOTE_VIDEO_PORT : "remote_video_port",
        CODEC_NAME: "codec_name",
        CODEC_ID: "codec_id",
        CODEC_RATE: "codec_rate",
        RTP_PROFILE: "rtp_profile",
        SEND_RECEIVE: "send_receive",
        FRAME_RATE: "frame_rate",
        INPUT: "input",
        KURENTO_TOKEN : "kurento_token",
        SCREENSHARE: "deskShare",
        STREAM_TYPE: "stream_type",
        STREAM_TYPE_SCREENSHARE: "stream_type_deskshare",
        STREAM_TYPE_VIDEO: "stream_type_video",
        RTP_TO_RTMP: "transcode_rtp_to_rtmp",
        TRANSCODER_CODEC: "codec",
        TRANSCODER_TYPE: "transcoder_type",
        CALLERNAME: "callername",

        EVENT_NAME: 'eventName',

        TIMESTAMP: 'timestamp',
        TIMESTAMP_UTC: 'timestampUTC',

        MODULE: 'module',
        MODULE_PHONE: 'bbb-webrtc-sfu',

        FILENAME: 'filename',

        // Log prefixes
        BASE_PROCESS_PREFIX: '[BaseProcess]',
        BASE_MANAGER_PREFIX: '[BaseManager]',
        BASE_PROVIDER_PREFIX: '[BaseProvider]',

        // MCS error codes
        MEDIA_SERVER_OFFLINE: 2001,

        // Media states'
        MEDIA_STATE: 'mediaState',
        MEDIA_STATE_ICE: 'onIceCandidate',

        MEDIA_STARTED: 'MEDIA_STARTED',
        MEDIA_STOPPED: 'MEDIA_STOPPED',
        MEDIA_STARTING: 'MEDIA_STARTING',
        MEDIA_PAUSED: 'MEDIA_PAUSE',

        // MCS Wrapper whatnots
        MCS_CONNECTED: 'MCS_CONNECTED',
        MCS_DISCONNECTED: 'MCS_DISCONNECTED'
    }
}

module.exports = Constants();


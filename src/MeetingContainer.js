function MeetingContainer({ meetingId, meetingMode }) {
    const [downStreamUrl, setDownStreamUrl] = useState(null);
    const [afterMeetingJoinedHLSState, setAfterMeetingJoinedHLSState] =
      useState(null);
    const [joined, setJoined] = useState(false);
  
    const _handleOnHlsStateChanged = (data) => {
      if (
        data.status === Constants.hlsEvents.HLS_STARTED ||
        data.status === Constants.hlsEvents.HLS_STOPPED
      ) {
        setDownStreamUrl(
          data.status === Constants.hlsEvents.HLS_STARTED
            ? data.downstreamUrl
            : null
        );
      }
  
      if (data.status === Constants.hlsEvents.HLS_STARTING) {
        setAfterMeetingJoinedHLSState("STARTING");
      }
  
      if (data.status === Constants.hlsEvents.HLS_STARTED) {
        setAfterMeetingJoinedHLSState("STARTED");
      }
  
      if (data.status === Constants.hlsEvents.HLS_STOPPING) {
        setAfterMeetingJoinedHLSState("STOPPING");
      }
  
      if (data.status === Constants.hlsEvents.HLS_STOPPED) {
        setAfterMeetingJoinedHLSState("STOPPED");
      }
    };
  
    const {
      join,
      leave,
      toggleMic,
      toggleWebcam,
      toggleScreenShare,
      startHls,
      stopHls,
    } = useMeeting({
      onHlsStateChanged: _handleOnHlsStateChanged,
    });
  
    const { participants } = useMeeting();
  
    const participantsArr = [];
    participants.forEach((values, keys) => {
      if (values.mode === "CONFERENCE") {
        participantsArr.push(values);
      }
    });
    const participantMap = new Map(participantsArr.map((id) => [id.id, id]));
  
    const joinMeeting = () => {
      setJoined(true);
      join();
    };
  
    return (
      <div
        style={{
          height: "100vh",
          overflowY: "auto",
          width: "100vw",
          overflowX: "hidden",
        }}
      >
        <div style={{ height: "40px" }}>
          <header>Meeting Id: {meetingId}</header>
        </div>
        {joined ? (
          meetingMode === Constants.modes.CONFERENCE && (
            <div>
              <button onClick={leave}>Leave</button>
              <button onClick={toggleMic}>toggleMic</button>
              <button onClick={toggleWebcam}>toggleWebcam</button>
              <button onClick={toggleScreenShare}>toggleScreenShare</button>
              <button
                onClick={() => {
                  if (afterMeetingJoinedHLSState === "STARTED") {
                    stopHls();
                  } else {
                    const layout = {
                      type: "GRID",
                      priority: "SPEAKER",
                      gridSize: 12,
                    };
                    startHls({ layout, theme: "LIGHT" });
                  }
                }}
              >
                {afterMeetingJoinedHLSState === "STARTING"
                  ? "Starting HLS"
                  : afterMeetingJoinedHLSState === "STARTED"
                  ? afterMeetingJoinedHLSState === "STOPPING"
                    ? "Stopping HLS"
                    : "Stop HLS"
                  : "Start HLS"}
              </button>
            </div>
          )
        ) : (
          <button onClick={joinMeeting}>Join</button>
        )}
        {meetingMode === Constants.modes.CONFERENCE ? (
          <div>
            {chunk([...participantMap.keys()]).map((k) => (
              <Row key={k} gutter={80}>
                {k.map((l) => (
                  <Col span={4}>
                    <ParticipantView key={l} participantId={l} />
                  </Col>
                ))}
              </Row>
            ))}
          </div>
        ) : (
          <div style={{ display: "flex", flex: 1 }}>
            {joined && <PlayerView downStreamUrl={downStreamUrl} />}{" "}
          </div>
        )}
      </div>
    );
  }
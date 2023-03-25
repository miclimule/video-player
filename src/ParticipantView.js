function ParticipantView(props) {
    const webcamRef = useRef(null);
    const micRef = useRef(null);
    const screenShareRef = useRef(null);
    const {
      displayName,
      webcamStream,
      micStream,
      screenShareStream,
      webcamOn,
      micOn,
      screenShareOn,
    } = useParticipant(props.participantId);
  
    useEffect(() => {
      if (micRef.current) {
        if (micOn && micStream) {
          const mediaStream = new MediaStream();
          mediaStream.addTrack(micStream.track);
          micRef.current.srcObject = mediaStream;
          micRef.current
            .play()
            .catch((error) =>
              console.error("videoElem.current.play() failed", error)
            );
        } else {
          micRef.current.srcObject = null;
        }
      }
    }, [micStream, micOn]);
  
    useEffect(() => {
      if (webcamRef.current) {
        if (webcamOn && webcamStream) {
          const mediaStream = new MediaStream();
          mediaStream.addTrack(webcamStream.track);
          webcamRef.current.srcObject = mediaStream;
          webcamRef.current
            .play()
            .catch((error) =>
              console.error("videoElem.current.play() failed", error)
            );
        } else {
          webcamRef.current.srcObject = null;
        }
      }
    }, [webcamStream, webcamOn]);
  
    useEffect(() => {
      if (screenShareRef.current) {
        if (screenShareOn) {
          const mediaStream = new MediaStream();
          mediaStream.addTrack(screenShareStream.track);
          screenShareRef.current.srcObject = mediaStream;
          screenShareRef.current
            .play()
            .catch((error) =>
              console.error("videoElem.current.play() failed", error)
            );
        } else {
          screenShareRef.current.srcObject = null;
        }
      }
    }, [screenShareStream, screenShareOn]);
    return (
      <div key={props.participantId}>
        <audio ref={micRef} autoPlay />
        {webcamRef || micOn ? (
          <div>
            <h2>{displayName}</h2>
            <video height={"100%"} width={"100%"} ref={webcamRef} autoPlay />
          </div>
        ) : null}
        {screenShareOn ? (
          <div>
            <h2>Screen Shared</h2>
            <video height={"100%"} width={"100%"} ref={screenShareRef} autoPlay />
          </div>
        ) : null}
        <br />
        <span>
          Mic:{micOn ? "Yes" : "No"}, Camera: {webcamOn ? "Yes" : "No"}, Screen
          Share: {screenShareOn ? "Yes" : "No"}
        </span>
      </div>
    );
  }
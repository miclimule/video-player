import "./App.css";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  MeetingProvider,
  MeetingConsumer,
  useMeeting,
  useParticipant,
} from "@videosdk.live/react-sdk";
import { authToken, createMeeting } from "./API";
import ReactPlayer from "react-player";

function JoinScreen({ getMeetingAndToken }) {
  const [meetingId, setMeetingId] = useState(null);
  const onClick = async () => {
    await getMeetingAndToken(meetingId);
  };
  return (
    <div>
      <input
        type="text"
        placeholder="Enter Meeting Id"
        onChange={(e) => {
          setMeetingId(e.target.value);
        }}
      />
      <button onClick={onClick}>Join</button>
      {" or "}
      <button onClick={onClick}>Create Meeting</button>
    </div>
  );
}

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

function Controls() {
  const { leave, toggleMic, toggleWebcam , toggleScreenShare } = useMeeting();
  return (
    <div>
      <button onClick={() => leave()}>Leave</button>
      <button onClick={() => toggleMic()}>toggleMic</button>
      <button onClick={() => toggleWebcam()}>toggleWebcam</button>
      <button onClick={() => toggleScreenShare()}>toggleScreenShare</button>
    </div>
  );
}

function MeetingView(props) {
  const [joined, setJoined] = useState(null);
  //Get the method which will be used to join the meeting.
  //We will also get the participants list to display all participants
  const { join, participants } = useMeeting({
    //callback for when meeting is joined successfully
    onMeetingJoined: () => {
      setJoined("JOINED");
    },
    //callback for when meeting is left
    onMeetingLeft: () => {
      props.onMeetingLeave();
    },
  });
  const joinMeeting = () => {
    setJoined("JOINING");
    join();
  };

  return (
    <div className="container">
      <h3>Meeting Id: {props.meetingId}</h3>
      {joined && joined == "JOINED" ? (
        <div>
          <Controls />
          //For rendering all the participants in the meeting
          {[...participants.keys()].map((participantId) => (
            <ParticipantView
              participantId={participantId}
              key={participantId}
            />
          ))}
        </div>
      ) : joined && joined == "JOINING" ? (
        <p>Joining the meeting...</p>
      ) : (
        <button onClick={joinMeeting}>Join</button>
      )}
    </div>
  );
}

function App() {
  const [meetingId, setMeetingId] = useState(null);

  //Getting the meeting id by calling the api we just wrote
  const getMeetingAndToken = async (id) => {
    const meetingId =
      id == null ? await createMeeting({ token: authToken }) : id;
    setMeetingId(meetingId);
  };

  //This will set Meeting Id to null when meeting is left or ended
  const onMeetingLeave = () => {
    setMeetingId(null);
  };

  
  return authToken && meetingId ? (
    <MeetingProvider
      config={{
        meetingId,
        micEnabled: true,
        webcamEnabled: true,
        name: "C.V. Raman",
      }}
      token={authToken}
    >
      <MeetingView meetingId={meetingId} onMeetingLeave={onMeetingLeave} />
    </MeetingProvider>
  ) : (
    <JoinScreen getMeetingAndToken={getMeetingAndToken} />
  );
}

export default App;
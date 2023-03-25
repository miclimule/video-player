import Hls from "hls.js";
import { useEffect, useRef, useState } from "react";

// Sleep function to wait for a few seconds.
export async function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function PlayerView({ downStreamUrl }) {
  const [canPlay, setCanPlay] = useState(false);
  const playerRef = useRef();

  // when hls is started, we need to wait for a few seconds for the stream to start.
  async function waitForHLSPlayable(downStreamUrl, maxRetry) {
    return new Promise(async (resolve, reject) => {
      if (maxRetry < 1) {
        return reject(false);
      }

      let status;

      try {
        const res = await fetch(downStreamUrl, {
          method: "GET",
        });
        status = res.status;
      } catch (err) {}

      if (status === 200) {
        return resolve(true);
      }

      await sleep(1000);

      return resolve(
        await waitForHLSPlayable(downStreamUrl, maxRetry - 1).catch((err) => {})
      );
    });
  }

  // We are checking if the HLS stream is playable or not.
  const checkHLSPlayable = async (downStreamUrl) => {
    const canPlay = await waitForHLSPlayable(downStreamUrl, 20);

    if (canPlay) {
      setCanPlay(true);
    } else {
      setCanPlay(false);
    }
  };

  // When the downStreamUrl changes, we need to check if the HLS stream is playable or not.
  useEffect(async () => {
    if (downStreamUrl) {
      checkHLSPlayable(downStreamUrl);
    } else {
      setCanPlay(false);
    }
  }, [downStreamUrl]);

  // When the canPlay state changes, we need to play the HLS stream.
  useEffect(() => {
    if (downStreamUrl && canPlay) {
      if (Hls.isSupported()) {
        const hls = new Hls({
          capLevelToPlayerSize: true,
          maxLoadingDelay: 4,
          minAutoBitrate: 0,
          autoStartLoad: true,
          defaultAudioCodec: "mp4a.40.2",
        });

        let player = document.querySelector("#hlsPlayer");

        hls.loadSource(downStreamUrl);
        hls.attachMedia(player);
        hls.on(Hls.Events.MANIFEST_PARSED, function () {});
        hls.on(Hls.Events.ERROR, function (err) {
          console.log(err);
        });
      } else {
        if (typeof playerRef.current?.play === "function") {
          playerRef.current.src = downStreamUrl;
          playerRef.current.play();
        }
      }
    }
  }, [downStreamUrl, canPlay]);

  return (
    <div
      style={{
        height: "calc(100vh - 40px)",
        maxHeight: "100%",
        width: "100%",
        overflow: "hidden",
        position: "relative",
      }}
    >
      {downStreamUrl && canPlay ? (
        <video
          ref={playerRef}
          id="hlsPlayer"
          autoPlay={true}
          style={{ height: "100%", width: "100%" }}
          controls
          playsinline
          playsInline
          playing
          onError={(err) => {
            console.log(err, "hls video error");
          }}
        ></video>
      ) : (
        <div>
          <h1>Wait for the host to start live strem</h1>
        </div>
      )}
    </div>
  );
}

export default PlayerView;
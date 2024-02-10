// deps
import { useState, useRef, useCallback, useEffect } from "react";
// components
import VideoController from "@/components/VideoController";
// helpers
import { getMimeType } from "@/helpers";
// types
import { RecordingStatus } from "@/types";
// styles
import styles from "@/styles/VideoRecorder.module.css";

const VideoRecorder = () => {
    // const [loading, setLoading] = useState<boolean>(true);
    const [permission, setPermission] = useState<boolean>(false);
    const [recordingStatus, setRecordingStatus] = useState<RecordingStatus>(
        RecordingStatus.INACTIVE
    );
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [recordedVideo, setRecordedVideo] = useState<string | null>(null);
    const [videoChunks, setVideoChunks] = useState<Blob[]>([]);

    const mediaRecorder = useRef<MediaRecorder | null>(null);
    const liveVideoFeed = useRef<HTMLVideoElement>(null);

    const fetchPermissions = async () => {
        if ("MediaRecorder" in window) {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({
                    audio: true,
                    video: true,
                });
                setPermission(true);
            } catch (err: any) {
                setPermission(false);
                alert(err.message);
            }
        } else {
            setPermission(false);
            alert("Browser not supported.");
        }
    };

    const startLiveStream = useCallback(async (initial = true) => {
        setRecordedVideo(null);
        if (initial) {
            await fetchPermissions();
        }
        try {
            const audioStream = await navigator.mediaDevices.getUserMedia({
                audio: true,
            });
            const videoStream = await navigator.mediaDevices.getUserMedia({
                audio: false,
                video: true,
            });

            //combine both audio and video streams
            const combinedStream = new MediaStream([
                ...videoStream.getVideoTracks(),
                ...audioStream.getAudioTracks(),
            ]);
            setStream(combinedStream);

            //set videostream to live feed player
            if (liveVideoFeed.current) {
                liveVideoFeed.current.srcObject = videoStream;
            }
        } catch (err: any) {
            // log the error
            alert(err.message);
        }
    }, []);

    useEffect(() => {
        // Get permission & start live stream on first time load.
        startLiveStream();
    }, [startLiveStream]);

    const onRecordingStart = useCallback(async () => {
        setRecordingStatus(RecordingStatus.STARTED);
        setRecordedVideo(null);
        startLiveStream(false);
        const options = {
            mimeType: getMimeType(),
        };

        if (stream) {
            const media = new MediaRecorder(stream, options);
            mediaRecorder.current = media;
            mediaRecorder.current.start();
            let localVideoChunks: Blob[] = [];
            mediaRecorder.current.ondataavailable = (event) => {
                if (typeof event.data === "undefined") return;
                if (event.data.size === 0) return;
                localVideoChunks.push(event.data);
            };

            setVideoChunks(localVideoChunks);
        }
    }, [stream]);

    const onRecordingStop = useCallback(() => {
        // setPermission(false);
        setRecordingStatus(RecordingStatus.INACTIVE);
        if (mediaRecorder.current) {
            mediaRecorder.current.stop();
            mediaRecorder.current.onstop = () => {
                const videoBlob = new Blob(videoChunks, {
                    type: getMimeType(),
                });
                const videoUrl = URL.createObjectURL(videoBlob);

                setRecordedVideo(videoUrl);
                setVideoChunks([]);
            };
        }
    }, [videoChunks]);

    const reset = useCallback(() => {
        setRecordedVideo(null);
        startLiveStream(false);
    }, [startLiveStream]);

    return (
        <div className={styles.container}>
            <h2 className={styles.header}>Video Recorder</h2>
            <main>
                <div className={styles.videoControls}>
                    {!permission ? (
                        <button
                            onClick={fetchPermissions}
                            className={styles.button}
                        >
                            Give Audio & Video Permissions
                        </button>
                    ) : (
                        <VideoController
                            onRecordingStart={onRecordingStart}
                            onRecordingStop={onRecordingStop}
                            recordingStatus={recordingStatus}
                        />
                    )}
                </div>
            </main>

            <div className={styles.videoPlayer}>
                {!recordedVideo ? (
                    <video
                        ref={liveVideoFeed}
                        autoPlay
                        className={styles.livePlayer}
                    ></video>
                ) : (
                    <div className={styles.recorded}>
                        <video
                            className={styles.recorded}
                            src={recordedVideo}
                            controls
                        ></video>
                        <a
                            download
                            href={recordedVideo}
                            className={styles.download}
                        >
                            Download Recording
                        </a>
                    </div>
                )}
            </div>
        </div>
    );
};

export default VideoRecorder;

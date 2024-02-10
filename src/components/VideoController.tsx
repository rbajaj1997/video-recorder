// deps
import { memo } from "react";

// types
import { RecordingStatus } from "@/types";
// styles
import styles from "@/styles/VideoRecorder.module.css";

export interface IVideoControlProps {
    recordingStatus: RecordingStatus;
    onRecordingStart: VoidFunction;
    onRecordingStop: VoidFunction;
}

const VideoControls = ({
    recordingStatus,
    onRecordingStart,
    onRecordingStop,
}: IVideoControlProps) => {
    return (
        <>
            {recordingStatus === RecordingStatus.INACTIVE ? (
                <button
                    onClick={onRecordingStart}
                    className={styles.button}
                >
                    Start Recording
                </button>
            ) : (
                <button
                    onClick={onRecordingStop}
                    className={styles.button}
                >
                    Stop Recording
                </button>
            )}
        </>
    );
};

export default memo(VideoControls);

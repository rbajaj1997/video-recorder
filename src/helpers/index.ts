const MIME_TYPES = [
    'video/webm;codecs="vp8,opus"',
    "video/webm;codecs=h264",
    "video/webm;codecs=vp9",
    "video/webm",
    "video/mp4",
];

export const getMimeType = () => {
    const mimeType = window.MediaRecorder.isTypeSupported
        ? MIME_TYPES.find(window.MediaRecorder.isTypeSupported)
        : "video/webm";

    return mimeType || "";
};

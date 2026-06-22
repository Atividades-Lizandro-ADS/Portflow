export function extractYoutubeId(url) {
  if (!url) return null;
  const m = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&\n?#]+)/);
  return m ? m[1] : null;
}

export function extractSketchfabId(url) {
  if (!url) return null;
  const m =
    url.match(/sketchfab\.com\/(?:models|3d-models)\/(?:[^\/]+-)?([a-f0-9]{32})/i) ??
    url.match(/sketchfab\.com\/(?:models|3d-models)\/([^\/\?]+)/);
  return m ? m[1] : null;
}

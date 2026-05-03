export function isVideo(url: string) {
  return /\.(mp4|webm|mov|avi|mkv|ogg)(\?|$)/i.test(url);
}

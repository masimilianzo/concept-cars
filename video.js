// Click-to-play: the YouTube player only loads when the thumbnail is pressed (no tracking, light pages).
document.querySelectorAll(".yt").forEach((b) => b.addEventListener("click", () => {
  const f = document.createElement("iframe");
  f.src = "https://www.youtube-nocookie.com/embed/" + b.dataset.v + "?autoplay=1&rel=0";
  f.allow = "autoplay; encrypted-media; picture-in-picture; fullscreen"; f.allowFullscreen = true; f.title = "Video";
  b.replaceWith(f); f.className = "yt";
}));

import { useParams, useNavigate } from "react-router-dom";
import { albums } from "../data.js";
import { albumCount, albumCover, albumUnit } from "../components/WorkIcon.jsx";

export default function WorkPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const album = albums.find((a) => a.slug === slug);

  if (!album) {
    return (
      <div className="work-page">
        <div className="work-page__inner">
          <button className="back-button" onClick={() => navigate("/")}>
            ← Back
          </button>
          <h1 className="work-page__title">Not found</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="work-page">
      <div className="work-page__inner">
        <button className="back-button" onClick={() => navigate("/")}>
          ← Back to desktop
        </button>
        <h1 className="work-page__title">{album.title}</h1>
        <div className="work-page__sub">
          {album.place} · {album.year} · {albumCount(album)} {albumUnit(album, true)}
        </div>
        <img className="work-page__img" src={albumCover(album)} alt={album.title} />
        <p className="work-page__body">{album.excerpt}</p>

        {album.videos
          ? album.videos.map((v) => (
              <video
                key={v.src}
                className="work-page__img"
                src={v.src}
                poster={v.poster}
                controls
                playsInline
                style={{ marginTop: 24 }}
              />
            ))
          : album.photos.slice(1).map((p) => (
              <figure key={p.src} className="work-page__figure">
                <img className="work-page__img" src={p.src} alt={p.caption} loading="lazy" />
                <figcaption>{p.caption}</figcaption>
              </figure>
            ))}
      </div>
    </div>
  );
}

import { useNavigate } from "react-router-dom";

export default function NotFound() {
  const navigate = useNavigate();
  return (
    <div className="work-page">
      <div className="work-page__inner" style={{ textAlign: "center" }}>
        <h1 className="work-page__title" style={{ fontSize: 72 }}>
          404
        </h1>
        <p className="work-page__sub">This page drifted off the desktop.</p>
        <button className="btn" onClick={() => navigate("/")}>
          ← Back home
        </button>
      </div>
    </div>
  );
}

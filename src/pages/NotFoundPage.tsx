import { Link } from "react-router-dom";

export default function NotFoundPage() {
  return (
    <div>
      <h1>404</h1>
      <h2>Page Not Found</h2>
      <p>
        Sorry, the page or resource you are looking for doesn't exist or has
        been moved.
      </p>
      <Link to="/">Go Back Home</Link>
    </div>
  );
}

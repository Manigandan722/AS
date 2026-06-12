import { Link } from 'react-router-dom';

export default function ContactPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-dark-950 p-8">
      <Link to="/#contact" className="btn-gold">Go to Contact Section</Link>
    </div>
  );
}

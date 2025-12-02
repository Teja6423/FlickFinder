import GetContent from './getContent';

export default function HomePage() {
  return (
    <div className="homepage-container">
      <GetContent type="trending" />
      <GetContent type="popular" />
      <GetContent type="top-rated" />
    </div>
  );
}

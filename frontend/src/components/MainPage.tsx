
import { Link } from 'react-router-dom'
import { useUser } from './UserContext'

const categories = [
  'All stories',
  'Lifestyle',
  'Culture',
  'Books',
  'Technology',
  'Personal',
]

const features = [
  {
    number: '01',
    category: 'LIFESTYLE',
    title: 'The art of slowing down',
    description: 'Finding beauty in ordinary moments and learning to enjoy the little things.',
    image:
      'https://images.unsplash.com/photo-1445116572660-236099ec97a0?w=800',
  },
  {
    number: '02',
    category: 'CULTURE',
    title: 'Stories that stay with us',
    description: 'Exploring the books, films and ideas that change the way we see the world.',
    image:
      'https://images.unsplash.com/photo-1519682337058-a94d519337bc?w=800',
  },
  {
    number: '03',
    category: 'INSPIRATION',
    title: 'A world of new perspectives',
    description: 'Sometimes all we need is a different point of view.',
    image:
      'https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?w=800',
  },
]

const MainPage = () => {
  const user = useUser()

  return (
    <div className="home-page">

      {/* HERO */}

      <section className="hero-section">
        <div className="hero-content">

          <div className="hero-label">
            <span className="hero-label-line" />
            A SPACE FOR EVERY STORY
          </div>

          <h1>
            Words have
            <br />
            the power to
            <br />
            <span>connect us.</span>
          </h1>

          <p className="hero-description">
            A place where thoughts become stories, ideas find
            their audience, and every voice deserves to be heard.
            Read, write and discover something new.
          </p>

          <div className="hero-buttons">
            <Link to="/articles" className="button-dark">
              Explore stories <span>↗</span>
            </Link>

            <Link to="/publish" className="button-text">
              Start writing <span>→</span>
            </Link>
          </div>

          {user && (
            <div className="welcome-message">
              Welcome back, <strong>{user.username}</strong>.
              <br />
              What would you like to read today?
            </div>
          )}

        </div>

        <div className="hero-image-wrapper">
          <img
            src="https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=1000"
            alt="A cozy library full of books"
            className="hero-image"
          />

          <div className="image-caption">
            <span>01 — THE WORLD OF WORDS</span>
            <span>EST. 2026</span>
          </div>

          <div className="hero-image-note">
            <span>✳</span>
            Read. Write. Connect.
          </div>
        </div>
      </section>

      {/* INTRODUCTION */}

      <section className="intro-section">
        <div className="intro-number">01 / DISCOVER</div>

        <div className="intro-content">
          <h2>
            More than just
            <br />
            <span>a reading platform.</span>
          </h2>

          <p>
            Writers Place brings together curious minds and
            creative souls. Discover fresh perspectives,
            share your experiences and become part of a
            community that loves words.
          </p>
        </div>
      </section>

      {/* CATEGORIES */}

      <section className="categories-section">
        <div className="section-heading">
          <div>
            <span className="section-eyebrow">FIND YOUR INTEREST</span>
            <h2>Explore topics</h2>
          </div>

          <Link to="/articles" className="view-all">
            All articles ↗
          </Link>
        </div>

        <div className="category-list">
          {categories.map((category) => (
            <Link
              to="/articles"
              key={category}
              className="category-pill"
            >
              {category}
              <span>↗</span>
            </Link>
          ))}
        </div>
      </section>

      {/* FEATURED STORIES */}

      <section className="stories-section">
        <div className="section-heading">
          <div>
            <span className="section-eyebrow">A LITTLE INSPIRATION</span>
            <h2>Stories to explore</h2>
          </div>

          <Link to="/articles" className="view-all">
            Discover more ↗
          </Link>
        </div>

        <div className="stories-grid">
          {features.map((item) => (
            <Link
              to="/articles"
              className="story-card"
              key={item.number}
            >
              <div className="story-image-wrapper">
                <img src={item.image} alt={item.title} />
                <span className="story-number">{item.number}</span>
              </div>

              <div className="story-info">
                <span className="story-category">
                  {item.category}
                </span>

                <h3>{item.title}</h3>

                <p>{item.description}</p>

                <span className="story-read">
                  Explore stories <span>↗</span>
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* CALL TO ACTION */}

      <section className="join-section">
        <div className="join-decoration">✳</div>

        <span className="section-eyebrow">YOUR STORY STARTS HERE</span>

        <h2>
          Have something
          <br />
          <span>to say?</span>
        </h2>

        <p>
          Your ideas deserve a place in the world.
          Start writing and share your perspective with others.
        </p>

        <Link to="/publish" className="button-light">
          Write your story <span>↗</span>
        </Link>
      </section>

    </div>
  )
}

export default MainPage

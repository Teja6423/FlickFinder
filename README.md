# 🎬 FlickFinder

FlickFinder is a movie, TV show, and people search platform powered by the [TMDb API](https://www.themoviedb.org/documentation/api).  
It features a dark-themed interface, responsive design, and allows users to explore trending content, popular titles, detailed cast information, and more.

---

## ✨ Features
- Dark-themed UI
- Trending, Popular, Now Playing, and Upcoming content
- Movie & TV detail pages with cast, crew, trailers, and posters
- People detail pages with biography, credits, and images
- Search across movies, shows, and people
- Responsive design for desktop and mobile

---

## 🛠 Tech Stack
- **Frontend**: React + Vite
- **Backend**: Node.js + Express
- **API**: TMDb API
- **Hosting**: Raspberry Pi + Cloudflare Tunnel + PM2

---

## 📦 Local Setup

### 1. Clone the repository
```bash
git clone https://github.com/Teja6423/FlickFinder.git
cd FlickFinder
```

### 2. Install dependencies
```bash
# Backend
cd backend
npm install

# Frontend
cd flickfinder
npm install
```

### 3. Create `.env` files
**Backend `.env`**
```
TMDB_BEARER_KEY=your_tmdb_api_key_here
PORT=3131
REACTPORT=http://localhost:5173
```

**Frontend `.env`**
```
VITE_API_URL=http://localhost:3131/api
```

### 4. Run the app
```bash
# Start backend
cd server
npm start

# Start frontend
cd ../flickfinder
npm run dev
```

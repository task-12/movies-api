const express = require("express");
const cors = require("cors");
const initialMovies = require("./movies");

const app = express();
app.use(cors());
app.use(express.json());

let movies = [...initialMovies];

// الصفحة الرئيسية
app.get("/", (req, res) => {
  res.json({ message: "Movies API شغال ✅" });
});

// كل الأفلام (مع بحث وفلتر وصفحات)
// مثال: /api/movies?search=nolan&genre=Sci-Fi&page=1&limit=5
app.get("/api/movies", (req, res) => {
  const { search, genre } = req.query;
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;

  let result = movies;

  if (search) {
    const s = search.toLowerCase();
    result = result.filter(
      (m) =>
        m.title.toLowerCase().includes(s) ||
        m.director.toLowerCase().includes(s)
    );
  }

  if (genre) {
    result = result.filter((m) => m.genre.toLowerCase() === genre.toLowerCase());
  }

  const total = result.length;
  const start = (page - 1) * limit;
  const data = result.slice(start, start + limit);

  res.json({ total, page, limit, data });
});

// كل التصنيفات
app.get("/api/genres", (req, res) => {
  const genres = [...new Set(movies.map((m) => m.genre))];
  res.json(genres);
});

// فيلم واحد
app.get("/api/movies/:id", (req, res) => {
  const movie = movies.find((m) => m.id === Number(req.params.id));
  if (!movie) return res.status(404).json({ error: "الفيلم مش موجود" });
  res.json(movie);
});

// إضافة فيلم
app.post("/api/movies", (req, res) => {
  const { title, year, genre, rating, director, description, poster } = req.body;

  if (!title || !year || !genre) {
    return res.status(400).json({ error: "title و year و genre مطلوبين" });
  }

  const newId = movies.length ? Math.max(...movies.map((m) => m.id)) + 1 : 1;
  const movie = {
    id: newId,
    title,
    year: Number(year),
    genre,
    rating: Number(rating) || 0,
    director: director || "غير معروف",
    description: description || "",
    poster: poster || "https://placehold.co/300x450?text=No+Poster",
  };

  movies.push(movie);
  res.status(201).json(movie);
});

// تعديل فيلم
app.put("/api/movies/:id", (req, res) => {
  const movie = movies.find((m) => m.id === Number(req.params.id));
  if (!movie) return res.status(404).json({ error: "الفيلم مش موجود" });

  Object.assign(movie, req.body, { id: movie.id });
  res.json(movie);
});

// حذف فيلم
app.delete("/api/movies/:id", (req, res) => {
  const exists = movies.some((m) => m.id === Number(req.params.id));
  if (!exists) return res.status(404).json({ error: "الفيلم مش موجود" });

  movies = movies.filter((m) => m.id !== Number(req.params.id));
  res.status(204).send();
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("السيرفر شغال على البورت " + PORT);
});
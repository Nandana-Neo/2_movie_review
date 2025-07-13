import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import 'dotenv/config';

const app = express();
const port = 3000;

const db = new pg.Client({
    host: "localhost",
    database: "movie",
    password: process.env.PSQL_PASSWD,
    user: process.env.PSQL_USER,
    port: 5432
});

await db.connect();

async function getMovies(){
    const result = await db.query("SELECT * FROM movie_reviews ORDER BY date_watched DESC;");
    return result.rows.map((row)=>{
        return {
            id: row.id,
            name: row.name,
            date_watched: row.date_watched.toLocaleString('default', { day:'numeric', month: 'long', year: 'numeric'}),
            rating: row.rating,
            genre: row.genre,
            review: row.review,
            img: row.img
        }
    });
}

async function addMovie(movie) {
    await db.query(
        "INSERT INTO movie_reviews(name, date_watched, rating, genre, review, img) VALUES($1,$2,$3,$4,$5,$6)",
        [movie.name, movie.date_watched, movie.rating, movie.genre, movie.review, movie.img]
    );
}

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

app.get("/",async (req,res) => {
    const movies = await getMovies();
    res.render("index.ejs",{
        movies: movies
    });
})

app.get("/add",(req,res) => {
    res.render("add_review.ejs");
})

app.post("/add",async (req,res)=>{
    const movie = {
        name : req.body.title,
        date_watched: req.body.date_watched,
        rating:req.body.rating, 
        genre:req.body.genre,
        review:req.body.review, 
        img: req.body.img
    }
    await addMovie(movie);
    res.redirect("/");
})

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
  
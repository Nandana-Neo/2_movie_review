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

async function getMovie(id){
    const result = await db.query("SELECT * FROM movie_reviews WHERE id=$1",[id]);
    const row = result.rows[0];
    return {
        id: row.id,
        name: row.name,
        date_watched: row.date_watched.toLocaleString('af-ZA', { day:'numeric', month: 'numeric', year: 'numeric'}),
        rating: row.rating,
        genre: row.genre,
        review: row.review,
        img: row.img
    }
} 

async function addMovie(movie) {
    await db.query(
        "INSERT INTO movie_reviews(name, date_watched, rating, genre, review, img) VALUES($1,$2,$3,$4,$5,$6)",
        [movie.name, movie.date_watched, movie.rating, movie.genre, movie.review, movie.img]
    );
}

async function updateMovie(movie){
    await db.query(
        "UPDATE movie_reviews SET name=$1, date_watched=$2, rating=$3, genre=$4, review=$5, img=$6 WHERE id=$7;",
        [movie.name, movie.date_watched, movie.rating, movie.genre, movie.review, movie.img,movie.id]
    );
}

async function deleteMovie(id){
    await db.query(
        "DELETE FROM movie_reviews WHERE id=$1;",[id]
    )
}

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

app.get("/",async (req,res) => {
    const movies = await getMovies();
    res.render("index.ejs",{
        movies: movies,
        total: movies.length
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

app.get("/edit", async (req,res) => {
    const id = req.query.id;
    const movie = await getMovie(id);
    res.render("add_review.ejs", {
        movie: movie
    })
})

app.post("/edit",async (req,res)=>{
    const movie = {
        id: req.body.id,
        name : req.body.title,
        date_watched: req.body.date_watched,
        rating:req.body.rating, 
        genre:req.body.genre,
        review:req.body.review, 
        img: req.body.img
    }
    await updateMovie(movie);
    res.redirect("/");
})

app.get("/delete", async (req,res) => {
    const id = req.query.id;
    await deleteMovie(id);
    return res.redirect("/");
})

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
  
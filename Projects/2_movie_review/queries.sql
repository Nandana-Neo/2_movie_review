CREATE TABLE movie_reviews(
	id SERIAL PRIMARY KEY,
	name VARCHAR(100),
	date_watched DATE,
	rating INTEGER,
	genre TEXT,
	review TEXT,
	img TEXT
)
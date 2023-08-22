const express = require("express");
const app = express();
app.use(express.json());
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const dbPath = path.join(__dirname, "moviesData.db");
let db = null;
const intializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};
intializeDBAndServer();
const convertToCamekCase = (dbObject) => {
  return {
    movieId: dbObject.movie_id,
    directorId: dbObject.director_id,
    movieName: dbObject.movie_name,
    leadActor: dbObject.lead_actor,
  };
};
const convertToCamelCaseDirectors = (dbObject) => {
  return {
    directorId: dbObject.director_id,
    directorName: dbObject.director_name,
  };
};
app.get("/movies/", async (request, response) => {
  const getMoviesQuery = `
    SELECT 
       movie_name
    FROM
       movie;`;
  const dbResponse = await db.all(getMoviesQuery);
  response.send(dbResponse.map((eachMovie) => convertToCamekCase(eachMovie)));
});
module.exports = app;
app.post("/movies/", async (request, response) => {
  const playerDetails = request.body;
  const { directorId, movieName, leadActor } = playerDetails;
  const createMovieQuery = `
  INSERT INTO
    movie (director_id , movie_name, lead_actor)
   VALUES 
        (${directorId}, '${movieName}', '${leadActor}');`;
  const deResponse = await db.run(createMovieQuery);
  response.send("Movie Successfully Added");
});
app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const getMovieQuery = `
    SELECT
       *
    FROM
       movie
    WHERE
       movie_id = ${movieId};`;
  const dbResponse = await db.get(getMovieQuery);
  response.send(convertToCamekCase(dbResponse));
});
app.put("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const { directorId, movieName, leadActor } = request.body;
  const updateMovieQuery = `
    UPDATE
       movie
    SET
       director_id = ${directorId} ,
       movie_name = '${movieName}',
       lead_actor = '${leadActor}';
    WHERE
       movie_id = ${movieId}`;
  const dbResponse = await db.run(updateMovieQuery);
  response.send("Movie Details Updated");
});
app.delete("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const deleteMovie = `
    DELETE FROM
       movie
    WHERE
       movie_id = ${movieId};`;
  const dbResponse = await db.run(deleteMovie);
  response.send("Movie Removed");
});
app.get("/directors/", async (request, response) => {
  const getAllDirectors = `
    SELECT
       *
    FROM
       director;`;
  const dbResponse = await db.all(getAllDirectors);
  response.send(dbResponse.map((each) => convertToCamelCaseDirectors(each)));
});
app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;
  const getMovies = `
    SELECT
       movie_name
    FROM
       movie
    WHERE
       director_id = ${directorId};`;
  const dbResponse = await db.all(getMovies);
  response.send(
    dbResponse.map((each) => ({
      movieName: each.movie_name,
    }))
  );
});

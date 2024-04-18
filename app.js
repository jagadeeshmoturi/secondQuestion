const express = require('express')
const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
const path = require('path')

const databasePath = path.join(__dirname, 'movieData.db')

const app = express()
app.use(express.json());
let database = null

const initializeDb = async () => {
  try {
    database = await open({
      filename: databasePath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () =>
      console.log('Server Running at https://localhost/:3000/'),
    )
  } catch (error) {
    console.log(`DB Error : ${error.message}`)
    process.exit(1)
  }
}

initializeDb()

const convertMovieDbObjectToResponseObject = ( dbObject) => {
  return {
    movieId: dbObject.movie_id,
    directorId: dbObject.director_id,
    movieName: dbObject.movie_name,
    leadActor: dbObject.lead_actor,
  }
}

const convertDirectorDbObjectToResponseObject = (dbObject) => {
  return {
    directorId : dbObject.director_id,
    directorName : dbObject.director_name,
  }
}

//APL Get

app.get("/movies", async (request, response) => {
  const getMoviesQuery = `
  SELECT 
    movie_name
  FROM
    movie;`;
  const movieArray = await database.all(getMoviesQuery);
  response.send(
    movieArray.map((eachMovie) => 
    ({movieName : eachMovie.movie_name}))
  )
})

// APL Post

app.post("/movies/", async (request, response) => {
  const { directorId, movieName, leadActor } = request.body;
  const postMovieQuery = `
  Insert  into 
    movie ( director_id, movie_name, lead_actor)
  values
    ('${directorId}', '${movieName}', '${leadActor}');`;
  await database.run(postMovieQuery);
  response.send("Movie Successfully Added");
})

// APL UPDATE

app.put("/movies/:movieId/", async (request,response) =>{
  const {directorId, movieName, leadActor} = request.body;
  const { movieId } = request.params;
  const updateMovieQuery = `
  update 
    movie
  set
    director_id = ${directorId},
    movie_name = ${movieName},
    lead_actor = ${leadActor}
  where 
    movie_id = ${movieId};`;
   await database.run(updateMovieQuery);
   response.send("Movie Details Updated")
})

//  APL DELETE

app.delete("movies/:movieId/", async (request,response)=>{
  const { movieId } = request.params;
  const deleteMovieQuery = `
  delete from 
    movie
  where 
    movie_id = ${movieId};`;
  await database.run(deleteMovieQuery);
  response.send("Movie Removed");
})

// APL GET DIRECTORS

app.get("/directors/", async (request, response) =>{
  const getDirectorsQuery = `
  select 
    *
  from
    director;`;
  const directorArray = await database.all(getDirectorsQuery);
  response.send(
    directorArray.map((eachDirector) => 
    convertDirectorDbObjectToResponseObject(eachDirector)
    )
  );
})

// APL Directors movies

app.get("/directors/:directorId/movies", async (request,response) =>{
  const { directorId } = request.params;
  const getDirectorMovieQuery = `
  select 
    movie_name
  from 
    movie
  where
    director_id = ${directorId};`;
  const moviesArray = await database.all(getDirectorMovieQuery);
  response.send(
    moviesArray.map((eachMovie) =>
    ({movieName: eachMovie.movie_name}))
  )
})

module.exports = app;
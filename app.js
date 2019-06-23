import express from "express";
//Imports the express library
import cors from "cors";
//Imports the cors library
const app = express();
//Creates the instances of the express server. Assigns it to the variable app
const uuidv4 = require("uuid/v4");
//Creates unique identifiers that require the npm install we installed
app.use(cors());
//Tells the server to use cross-origin resource sharing
app.use(express.json());
//Tells the server to parse requests and responses to and from json

app.locals.notes =
  // Creates an array of objects with random notes in it. Sets it to app local
  [
    {
      title: "randomnote",
      id: "1",
      listItems: [{ id: "1", body: "asdf", completed: false }]
    },
    {
      title: "randomnoteTWO",
      id: "2",
      listItems: [{ id: "2", body: "asdf", completed: false }]
    }
  ];

app.get("/api/v1/notes", (request, response) => {
  // Sets the callback function for a get request to the "/api/v1/notes" url
  const notes = app.locals.notes;
  //Sets the variable name to app.locals.notes to make it easier to read
  return response.status(200).json({ notes });
  // Tells the server to respond with a 200 status code and to return the full list of notes (using the variable name set above)
});

app.post("/api/v1/notes", (request, response) => {
  // Sets the callback function for a post request to the "/api/v1/notes" url
  const id = uuidv4();
  //Sets a variable name so we can use our unique id from our npm install
  const { listItems, title } = request.body;
  //Destructuring
  if (!listItems || !title)
    return response.status(422).json("Please provide a title and a list item.");
  //If there are no listItems or title it should return a status of 422 and a string to indicate what the user is missing
  const newNote = {
    id,
    ...request.body
  };
  // Creates a new note, giving it a unique id and populating it with the data from the post request
  app.locals.notes.push(newNote);
  //Adds in the newNote (with id and text) to the notes array
  response.status(201).json({ id });
  // Returns a response with a 201 status code and the unique id of the note
});

app.delete("/api/v1/notes/:id", (request, response) => {
  // Setting the callback function for a delete request to the "/api/v1/notes/:id" url
  const id = request.params.id;
  //Creates a variable with the params.id to make it easier to read when referenced down below
  const newNotes = app.locals.notes.filter(note => note.id !== id);
  // Creates a variable of newNotes and assigning it the value of all notes not matching the id from the request
  if (newNotes.length !== app.locals.notes.length) {
    //If there are newNotes array length doesn't match the locals.notes length
    app.locals.notes = newNotes;
    //Sets app.locals.notes to newNotes (for example if there is more in the newNotes it will add in the updated note)
    return response.sendStatus(204);
    // Returns a response with status code of 204
  } else {
    return response.status(404).json({ error: "No notes found" });
    //Returns a response with status code 404 and an error message if there are no notes
  }
});

app.get("/api/v1/notes/:id", (request, response) => {
  // Sets the callback function for a get request to the "/api/v1/notes/:id" url
  const id = request.params.id;
  //Creates a variable with the params.id to make it easier to read when referenced down below
  const note = app.locals.notes.find(note => note.id === id);
  // Creates a variable of note and assigning it the value of note that matches the id from the get request
  if (!note) {
    //If the doesn't match the note id
    return response.status(404).json({ error: "No notes found" });
    //Returns a response with a status code of 404 and an error message
  }
  return response.status(200).json(note);
  //Otherwise, returns a response status code of 200 with the note that matches the id
});

app.put("/api/v1/notes/:id", (request, response) => {
  // Sets the callback function for a put request to the "/api/v1/notes/:id" url
  const { title, listItems } = request.body;
  //Destructuring
  const id = request.params.id;
  //Creates a variable with the params.id to make it easier to read when referenced down below
  let noteWasFound = false;
  //Sets a default state of false for noteWasFound which will change when referenced down below
  const updatedNotes = app.locals.notes.map(note => {
    // Mapping thorugh the notes and assigning the result to a new variable
    if (note.id === id) {
      // If the current note matches the note from the request
      noteWasFound = true;
      //Changes noteWasFound to true
      return {
        title: title || note.title,
        //Sets new title to the title or note.title
        listItems: listItems || note.listItems,
        //Sets new listItems to listItem or notes.listitems
        id: note.id
        //Sets id to note.id
      };
      //Returns the object with the above information that matches the note id
    } else {
      return note;
      //Returns the current notes in the array
    }
  });

  if (!noteWasFound) {
    return response.status(404).json("No note found");
    //If no notes were found it will return a status code of 404 and an error message
  }

  app.locals.notes = updatedNotes;
  //Sets the locals.notes to updatedNotes
  return response.status(202).json("Successfully edited note");
  //Returns a response status code of 202 and a message that note was successfully edited
});

export default app;
// Exports the instance of app so it can used in the server file

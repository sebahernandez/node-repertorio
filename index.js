const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs");
const app = express();
const path = require("path");
app.use(bodyParser.json());

const port = 3000;

const getRepertorio = (req, res) => {
  fs.readFile("repertorio.json", (err, data) => {
    err ? res.send(err) : res.send(JSON.parse(data));
  });
};

const postCanciones = (req, res) => {
  fs.readFile("repertorio.json", (err, data) => {
    if (err) {
      res.send(err);
    } else {
      const repertorio = JSON.parse(data);
      const newSong = req.body;
      newSong.id = String(newSong.id);
      repertorio.push(newSong);
      fs.writeFile(
        "repertorio.json",
        JSON.stringify(repertorio, null, 2),
        (err) =>
          err
            ? res.status(500).send("Error al añadir una canción")
            : res.send("Canción agregada correctamente")
      );
    }
  });
};

const deleteCanciones = (req, res) => {
  const cancionId = req.params.id;

  fs.readFile("repertorio.json", (err, data) => {
    if (err) {
      return res.status(500).send("Error reading file");
    }

    let repertorio = JSON.parse(data);
    const initialLength = repertorio.length;
    repertorio = repertorio.filter((cancion) => cancion.id !== cancionId);

    if (repertorio.length === initialLength) {
      return res.status(404).send("Canción no encontrada");
    }

    fs.writeFile(
      "repertorio.json",
      JSON.stringify(repertorio, null, 2),
      (err) =>
        err
          ? res.status(500).send("Error al eliminar la canción")
          : res.send("Canción eliminada")
    );
  });
};

const updateCanciones = (req, res) => {
  const songId = req.params.id;
  const updatedSong = req.body;

  fs.readFile("repertorio.json", (err, data) => {
    err
      ? res.status(500).send("Error reading file")
      : (() => {
          const repertorio = JSON.parse(data);
          const songIndex = repertorio.findIndex(
            (cancion) => cancion.id == songId
          );

          songIndex !== -1
            ? ((repertorio[songIndex] = updatedSong),
              fs.writeFile(
                "repertorio.json",
                JSON.stringify(repertorio, null, 2),
                (err) =>
                  err
                    ? res.status(500).send("Error al actualizar la canción")
                    : res.send("Canción actualizada")
              ))
            : res.status(404).send("Canción no encontrada");
        })();
  });
};

// Mostra HTML en ruta principal
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// GET de las canciones
app.get("/canciones", getRepertorio);

// POST de las canciones
app.post("/canciones", postCanciones);

// PUT de las canciones
app.put("/canciones/:id", updateCanciones);

// DELETE de las canciones
app.delete("/canciones/:id", deleteCanciones);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

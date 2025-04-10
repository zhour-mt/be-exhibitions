const app = require("./app");

const { PORT = 9000 } = process.env;

app.listen(PORT, (err) => {
  if (err) {
    console.error("Error starting server:", err);
    process.exit(1);
  }
  console.log(`Listening on PORT: ${PORT}`);
});

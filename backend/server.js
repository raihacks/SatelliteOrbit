const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use(express.static(path.join(__dirname, "..", "frontend")));

app.get("/", (req, res) => {
  res.send("Satellite Tracker API running 🚀");
});

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, service: "satellite-backend" });
});

app.use("/api/satellites", satelliteRoute);

app.get(/^(?!\/api).*/, (_req, res) => {
  res.sendFile(path.join(__dirname, "..", "frontend", "index.html"));
});

async function bootstrap() {
  try {
    await checkConnection();
    await initializeDatabase();
  } catch (error) {
    console.warn("Starting without database connectivity:", error.message);
  }

  app.listen(PORT, () => {
    console.log(`Backend running on port ${PORT}`);
  });
}

bootstrap();

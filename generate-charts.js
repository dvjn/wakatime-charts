const fs = require("fs");
const path = require("path");
const fetch = require("node-fetch");

const WAKATIME_API_KEY = process.env.INPUT_WAKATIME_API_KEY;

const createGeneratedDirectory = () => {
  process.stdout.write("Creating generated directory...");
  fs.mkdirSync(path.join(__dirname, "generated"), { recursive: true });
  console.log("Done.");
};

const getStatsData = async () => {
  const raw_response = await fetch(
    `https://wakatime.com/api/v1/users/current/stats/last_7_days?api_key=${WAKATIME_API_KEY}`
  );
  const response = await raw_response.json();
  return response.data;
};

(async () => {
  createGeneratedDirectory();
  const data = await getStatsData();
  fs.writeFileSync("generated/data.json", JSON.stringify(data));
})();

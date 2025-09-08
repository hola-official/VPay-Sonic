const fs = require("fs");
const https = require("https");

// Contract details
const contractAddress = "0x0e95b78Fd39Db924862335831F73f0eD9eBdFe32";
const chainId = 146; // Sonic Mainnet
const apiKey = process.env.SONICSCAN_API_KEY;

// Read the flattened source code
const sourceCode = fs.readFileSync("MockUSD_flattened_correct.sol", "utf8");

// Contract verification data
const verificationData = {
  apikey: apiKey,
  module: "contract",
  action: "verifysourcecode",
  contractaddress: contractAddress,
  sourcecode: sourceCode,
  codeformat: "solidity-single-file",
  contractname: "MockUSD",
  compilerversion: "v0.8.24+commit.e11b9ed9",
  optimizationUsed: "1",
  runs: "200",
  evmversion: "cancun",
  licenseType: "3", // MIT License
};

// Convert to URL-encoded string
const formData = Object.keys(verificationData)
  .map(
    (key) =>
      `${encodeURIComponent(key)}=${encodeURIComponent(verificationData[key])}`
  )
  .join("&");

const options = {
  hostname: "api.sonicscan.org",
  port: 443,
  path: `/api`, // Sonic Labs API endpoint
  method: "POST",
  headers: {
    "Content-Type": "application/x-www-form-urlencoded",
    "Content-Length": Buffer.byteLength(formData),
  },
};

console.log("Submitting MockUSD contract verification...");
console.log("Contract Address:", contractAddress);
console.log("Chain ID:", chainId);
console.log("Compiler Version:", verificationData.compilerversion);

const req = https.request(options, (res) => {
  let data = "";

  res.on("data", (chunk) => {
    data += chunk;
  });

  res.on("end", () => {
    console.log("Response Status:", res.statusCode);
    console.log("Response:", data);

    try {
      const response = JSON.parse(data);
      if (response.status === "1") {
        console.log("✅ MockUSD contract verification submitted successfully!");
        console.log("GUID:", response.result);
        console.log(
          "Check verification status at: https://sonicscan.org/address/" +
            contractAddress
        );
      } else {
        console.log("❌ Verification failed:");
        console.log("Error:", response.message || response.result);
      }
    } catch (e) {
      console.log("Error parsing response:", e.message);
      console.log("Raw response:", data);
    }
  });
});

req.on("error", (e) => {
  console.error("Request error:", e.message);
});

req.write(formData);
req.end();

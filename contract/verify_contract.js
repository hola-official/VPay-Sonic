const fs = require("fs");
const https = require("https");

// Contract details
const contractAddress = "0x17282d6Ad90e84E24ee68fe68fD01014D9B8d7B3";
const chainId = 146; // Sonic Mainnet
const apiKey = process.env.SONICSCAN_API_KEY;

// Read the flattened source code
const sourceCode = fs.readFileSync("VestPayment_flattened_viair.sol", "utf8");

// Contract verification data
const verificationData = {
  apikey: apiKey,
  module: "contract",
  action: "verifysourcecode",
  contractaddress: contractAddress,
  sourcecode: sourceCode,
  codeformat: "solidity-single-file",
  contractname: "MultiTokenVestingManager",
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
  hostname: "api.etherscan.io",
  port: 443,
  path: `/v2/api?chainid=${chainId}`,
  method: "POST",
  headers: {
    "Content-Type": "application/x-www-form-urlencoded",
    "Content-Length": Buffer.byteLength(formData),
  },
};

console.log("Submitting contract verification...");
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
        console.log("✅ Contract verification submitted successfully!");
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

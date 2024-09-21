{
    
    "FanToken": {
        "contractName": "FanToken",
        "constructorParams": {
            "param1": "https://api.example.com/token/", // baseURI
            "param2": "FanToken", // name
            "param3": "FTK" // symbol
        }
    },
    "VTA": {
        "contractName": "VTA",
        "constructorParams": {
            "param1": "Virtual to Actual", // name
            "param2": "VTA", // symbol
            "param3": "0x2345678901234567890123456789012345678901", // tradeHubAddress
            "param4": "0x3456789012345678901234567890123456789012", // accessControlAddress
            "param5": "0x4567890123456789012345678901234567890123", // tokenAddr
            "param6": ["1000000000000000000", 10000, 250, 5], // contractDetails: [nftPrice, maxSupply, royaltyBPS, maxMint]
            "param7": "https://api.example.com/vta/" // baseUri
        }
    },
    "Quest": {
        "contractName": "Quest",
        "constructorParams": {
            "param1": "0x5678901234567890123456789012345678901234", // usdcToken address
            "param2": false, // isFree
            "param3": "100000000", // stake_val (100 USDC with 6 decimals)
            "param4": "10000000", // price (10 USDC with 6 decimals)
            "param5": "0x6789012345678901234567890123456789012345" // initialOwner address
        }
    }
}
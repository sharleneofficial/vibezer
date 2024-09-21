// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Quest is ERC721, Ownable {
    uint256 private _tokenIds;
    uint256 public immutable NFT_PRICE; // .10 ETH

    mapping(address => uint256) public stakedAmount;
    mapping(address => uint256) public lastFreeMint;

    event Staked(address indexed user, uint256 amount);
    event Unstaked(address indexed user, uint256 amount);
    event NFTMinted(address indexed user, uint256 tokenId, bool isFree);

    constructor(
        uint256 price,
        address initialOwner
    ) ERC721("QuestNFT", "QNFT") Ownable(initialOwner) {
        NFT_PRICE = price;
    }

    function mint() external {
        _tokenIds++;
        uint256 newTokenId = _tokenIds;
        _safeMint(msg.sender, newTokenId);

        lastFreeMint[msg.sender] = block.timestamp;
        emit NFTMinted(msg.sender, newTokenId, true);
    }
}

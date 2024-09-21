// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Quest is ERC721, Ownable {
    uint256 private _tokenIds;

    IERC20 public usdcToken;
    uint256 public immutable STAKE_AMOUNT; // 100 USDC (assuming 6 decimals)
    uint256 public immutable NFT_PRICE; // 10 USDC

    bool public isFree;

    mapping(address => uint256) public stakedAmount;
    mapping(address => uint256) public lastFreeMint;

    event Staked(address indexed user, uint256 amount);
    event Unstaked(address indexed user, uint256 amount);
    event NFTMinted(address indexed user, uint256 tokenId, bool isFree);

    constructor(
        address _usdcToken,
        bool _isFree,
        uint256 stake_val,
        uint256 price,
        address initialOwner
    ) ERC721("StakingNFT", "SNFT") Ownable(initialOwner) {
        usdcToken = IERC20(_usdcToken);
        isFree = _isFree;
        STAKE_AMOUNT = stake_val;
        NFT_PRICE = price;
    }

    function stake(uint256 amount) external {
        require(amount >= STAKE_AMOUNT, "Stake amount too low");
        require(
            usdcToken.transferFrom(msg.sender, address(this), amount),
            "Transfer failed"
        );

        stakedAmount[msg.sender] += amount;
        emit Staked(msg.sender, amount);
    }

    function unstake(address to, uint256 amount) external onlyOwner {
        require(stakedAmount[to] >= amount, "Insufficient staked amount");

        stakedAmount[to] -= amount;
        require(usdcToken.transfer(to, amount), "Transfer failed");

        emit Unstaked(to, amount);
    }

    function mintFree() external {
        require(stakedAmount[msg.sender] >= STAKE_AMOUNT, "Not enough staked");
        require(balanceOf(msg.sender) == 0, "Cooldown not elapsed");
        if (isFree == false) {
            require(
                usdcToken.transferFrom(msg.sender, address(this), NFT_PRICE),
                "Transfer failed"
            );
        }
        _tokenIds++;
        uint256 newTokenId = _tokenIds;
        _safeMint(msg.sender, newTokenId);

        lastFreeMint[msg.sender] = block.timestamp;
        emit NFTMinted(msg.sender, newTokenId, true);
    }
}

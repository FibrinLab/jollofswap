// SPDX-License-Identifier: MIT

pragma solidity 0.6.12;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";

// JollofShed is the coolest corner in town. You come in with some Jollof, and leave with more! The longer you stay, the more Jollof you get.
//
// This contract handles swapping to and from xJollof, JollofSwap's staking token.
contract JollofShed is ERC20("JollofShed", "xJOLLOF"){
    using SafeMath for uint256;
    IERC20 public jollof;

    // Define the Jollof token contract
    constructor(IERC20 _jollof) public {
        jollof = _jollof;
    }

    // Enter the shed. Pay some JOLLOFs. Earn some shares.
    // Locks Jollof and mints xJollof
    function enter(uint256 _amount) public {
        // Gets the amount of Jollof locked in the contract
        uint256 totalJollof = jollof.balanceOf(address(this));
        // Gets the amount of xJollof in existence
        uint256 totalShares = totalSupply();
        // If no xJollof exists, mint it 1:1 to the amount put in
        if (totalShares == 0 || totalJollof == 0) {
            _mint(msg.sender, _amount);
        } 
        // Calculate and mint the amount of xJollof the Jollof is worth. The ratio will change overtime, as xJollof is burned/minted and Jollof deposited + gained from fees / withdrawn.
        else {
            uint256 what = _amount.mul(totalShares).div(totalJollof);
            _mint(msg.sender, what);
        }
        // Lock the Jollof in the contract
        jollof.transferFrom(msg.sender, address(this), _amount);
    }

    // Leave the shed. Claim back your JOLLOFs.
    // Unlocks the staked + gained Jollof and burns xJollof
    function leave(uint256 _share) public {
        // Gets the amount of xJollof in existence
        uint256 totalShares = totalSupply();
        // Calculates the amount of Jollof the xJollof is worth
        uint256 what = _share.mul(jollof.balanceOf(address(this))).div(totalShares);
        _burn(msg.sender, _share);
        jollof.transfer(msg.sender, what);
    }
}

pragma solidity ^0.4.17;

contract Contest {
    address private manager;
    address private winnerAddress;
    bool private isWinnerSelected = false;
    
    struct Participant {
        string name;
        string phone;
        string email;
    }
    
    constructor () {
        manager = msg.sender;
    }
    
    mapping (address => Participant) private participants;
    
    address[] private participantList;
    
    function registration (string memory _name, string memory _phone, string memory _email) public payable {
        require(msg.value > .00001 ether);
        require(!isWinnerSelected);
        
        Participant storage participant = participants[msg.sender];
        
        participant.name = _name;
        participant.phone = _phone;
        participant.email = _email;
        
        participantList.push(msg.sender);
        sendAmount(msg.value, (manager));
    }
    
    function pickWinner() public {
        require(msg.sender == manager);
        uint index = random() % participantList.length;
        winnerAddress = participantList[index];
        isWinnerSelected = true;
    }
    
    function transferAmount () public payable {
        require(msg.value > .0001 ether);
        require(msg.sender == manager);
        require(isWinnerSelected);
        sendAmount(msg.value, (winnerAddress));
    }
    
    function random() public view returns (uint) {
        return uint(keccak256(abi.encodePacked(block.difficulty, block.timestamp, participantList)));
    }
    
    function getIsWinnerSelected() public view returns (bool) {
        return isWinnerSelected;
    }
    
    function getParticipants() public view returns (address[] memory) {
        return participantList;
    }
    
    function getWinner() public view returns (string memory) {
        require(isWinnerSelected);
        return participants[winnerAddress].name;
    }
    
    function getManager() public view returns (address) {
        return manager;
    }
    
    function sendAmount(uint _amount, address _account) private {
        _account.transfer(_amount);
    }
}
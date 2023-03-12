pragma solidity ^0.8.9;

contract ValidatorSet {
	struct AddressStatus {
		bool isIn;
		uint index;
	}

	address[] validators;
	mapping(address => AddressStatus) status;


    event InitiateChange(bytes32 indexed _parentHash, address[] _newSet);

	constructor(address[] memory _initial) {
		for (uint i = 0; i < _initial.length; i++) {
			status[_initial[i]].isIn = true;
			status[_initial[i]].index = i;
		}
		validators = _initial;
	}

    function getValidators() view public
		returns (address[] memory)
	{

		return validators;
	}

    function removeValidator(address _validator)
		isValidator(_validator)
		public
	{
		uint index = status[_validator].index;
		validators[index] = validators[validators.length - 1];
		status[validators[index]].index = index;
		validators.pop();

		delete status[_validator];

		triggerChange();
	}

    function addValidator(address _validator)
		isNotValidator(_validator)
		public
	{
		status[_validator].isIn = true;
		status[_validator].index = validators.length;
		validators.push(_validator);
		triggerChange();
	}

	modifier isValidator(address _someone) {
		bool isIn = status[_someone].isIn;
		uint index = status[_someone].index;

		require(isIn && index < validators.length && validators[index] == _someone);
		_;
	}

	modifier isNotValidator(address _someone) {
		require(!status[_someone].isIn);
		_;
	}

    function triggerChange()
		public
	{
		emit InitiateChange(blockhash(block.number - 1), validators);
	}
}
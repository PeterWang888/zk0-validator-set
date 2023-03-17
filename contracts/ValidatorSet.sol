pragma solidity ^0.8.9;

contract ValidatorSet {
	struct AddressStatus {
		bool isIn;
		uint index;
	}

	address[] validators;
	mapping(address => AddressStatus) status;
	mapping(address => uint256) stakerAmounts;
	mapping(address => address) staker2Validator;


    event InitiateChange(bytes32 indexed _parentHash, address[] _newSet);

	constructor(address[] memory _initial) payable {
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

	function addValidator2(address _validator)
		isNotValidator(_validator)
		checkInputAmount(payable(msg.sender), msg.value)
		payable public
	{
		payable(address(this)).transfer(msg.value);
		stakerAmounts[msg.sender] = msg.value;
		staker2Validator[msg.sender] = _validator;

		status[_validator].isIn = true;
		status[_validator].index = validators.length;
		validators.push(_validator);
		triggerChange();
	}

	function removeValidator2(address _validator)
		isValidator(_validator)
		checkOutputAmount(payable(msg.sender), _validator)
		payable public
	{
		address payable to = payable(msg.sender);
		uint256 amount = stakerAmounts[to];
		to.transfer(amount);

		delete stakerAmounts[to];
		delete staker2Validator[to];


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

	modifier checkInputAmount(address payable from, uint256 amount)
	{
		// big than ya eth and must be integer.
		require(amount > 1 ether && amount % 1 ether == 0);
		require(from.balance > amount);
		_;
	}

	modifier checkOutputAmount(address payable to, address _validator)
	{
		// big than 1 eth and must be integer.
		uint256 amount = stakerAmounts[to];
		require(amount > 1 ether && amount % 1 ether == 0);
		address validator = staker2Validator[to];
		require(validator == _validator);
		_;
	}

    function triggerChange()
		public
	{
		emit InitiateChange(blockhash(block.number - 1), validators);
	}

    function getBalance()
		public view
		returns(uint256)
	{
		return address(this).balance;
	}

	receive() external payable {}
    fallback() external payable{}
}

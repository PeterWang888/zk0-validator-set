pragma solidity ^0.8.9;

contract ValidatorSet {
	struct AddressStatus {
		bool isIn;
		uint index;
	}

	address[] validators;
	address[] stakers;
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
		stakers = _initial;
	}

	function getValidatorAmounts() view public
		returns(address[] memory, uint256[] memory)
	{
		uint256[] memory amounts = new uint256[](stakers.length);
		for (uint i = 0; i < stakers.length; i++) {
			address staker = stakers[i];
			uint256 amount = stakerAmounts[staker];
			amounts[i] = amount;
		}
		return (validators, amounts);
	}

	function getStakerAmounts() view public
		returns(address[] memory, uint256[] memory)
	{
		uint256[] memory amounts = new uint256[](stakers.length);
		for (uint i = 0; i < stakers.length; i++) {
			address staker = stakers[i];
			uint256 amount = stakerAmounts[staker];
			amounts[i] = amount;
		}
		return (stakers, amounts);
	}

    function getValidators() view public
		returns (address[] memory)
	{
		return validators;
	}

    function addValidator(address _validator)
		isNotValidator(_validator)
		payable public
	{
		status[_validator].isIn = true;
		status[_validator].index = validators.length;
		validators.push(_validator);
		triggerChange();
	}

    function removeValidator(address _validator)
		isValidator(_validator)
		payable public
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
		checkInputAmount(msg.sender, msg.value)
		payable public
	{
		address staker = msg.sender;
		payable(address(this)).transfer(msg.value);
		stakerAmounts[staker] = msg.value;
		staker2Validator[staker] = _validator;
		stakers.push(staker);

		status[_validator].isIn = true;
		status[_validator].index = validators.length;
		validators.push(_validator);
		triggerChange();
	}

	function removeValidator2(address _validator)
		isValidator(_validator)
		checkOutputAmount(msg.sender, _validator)
		payable public
	{
		address payable to = payable(msg.sender);
		uint256 amount = stakerAmounts[to];
		to.transfer(amount);

		uint index = status[_validator].index;


		stakers[index] = stakers[stakers.length - 1];
		stakers.pop();

		delete stakerAmounts[to];
		delete staker2Validator[to];


		validators[index] = validators[validators.length - 1];
		status[validators[index]].index = index;
		validators.pop();

		delete status[_validator];

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

	modifier checkInputAmount(address from, uint256 amount)
	{
		// big than ya eth and must be integer.
		require(amount > 1 ether && amount % 1 ether == 0);
		require(from.balance > amount);
		_;
	}

	modifier checkOutputAmount(address to, address _validator)
	{
		// big than 1 eth and must be integer.
		uint256 amount = stakerAmounts[to];
		require(amount > 1 ether && amount % 1 ether == 0);
		address validator = staker2Validator[to];
		require(validator == _validator);
		_;
	}

    function triggerChange()
		payable public
	{
		emit InitiateChange(blockhash(block.number - 1), validators);
	}

    function getBalance()
		public view
		returns(uint256)
	{
		return address(this).balance;
	}

	fallback() external payable { }
	receive() external payable { }
}
